/* Video building blocks (FOUNDATION T5): video with pause points, sequence player, trim and cut tools,
   coverage switcher and the challenge runner. Ported from Basic Sequences; event times come from shared/media.js. */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const clip = id => T.mediaRecord(id);
  const fmt = s => (Math.max(0, s) || 0).toFixed(2) + ' s';
  T.time = (id, action, p) => { const e = clip(id).events; return e[action + 'Start'] + p * (e[action + 'End'] - e[action + 'Start']); };
  T.seg = (media, from, to, mirror) => ({ media, from, to, mirror: !!mirror });

  function videoEl() { const v = el('video', { muted: true, playsinline: true, preload: 'auto' }); v.muted = true; v.controls = false; return v; }
  function missing(rec) { return el('div', { className: 'placeholder', style: 'position:absolute;inset:0;aspect-ratio:auto' }, el('strong', { text: 'Media file not found' }), el('code', { text: rec.file })); }
  // Seeks one at a time so scrubbing never shows a stale frame.
  function queuedSeek(v) {
    let busy = false, pending = null;
    function flush() { if (busy || pending === null || v.readyState < 1) return; const t = pending; pending = null; if (Math.abs(v.currentTime - t) < 0.001) { flush(); return; } busy = true; v.currentTime = t; }
    v.addEventListener('seeked', () => { busy = false; flush(); });
    v.addEventListener('loadedmetadata', flush);
    return t => { pending = t; flush(); };
  }
  function loadVideo(v, seg) {
    return new Promise((resolve, reject) => {
      const rec = clip(seg.media);
      if (!rec || rec.status === 'placeholder') { reject(new Error(rec ? rec.file : seg.media)); return; }
      const url = T.mediaURL(rec); let done = false;
      const cleanup = () => { v.removeEventListener('loadedmetadata', ready); v.removeEventListener('error', error); v.removeEventListener('seeked', seeked); };
      const finish = () => { if (done) return; done = true; cleanup(); resolve(); };
      const error = () => { if (done) return; done = true; cleanup(); reject(new Error(rec.file)); };
      const seeked = () => { if (Math.abs(v.currentTime - seg.from) < 0.08) finish(); };
      const ready = () => { v.style.transform = seg.mirror ? 'scaleX(-1)' : ''; v.style.objectFit = T.fit(rec); if (Math.abs(v.currentTime - seg.from) < 0.001 && v.readyState >= 2) finish(); else { v.addEventListener('seeked', seeked); v.currentTime = Math.min(seg.from, Math.max(0, v.duration - 0.001)); } };
      v.addEventListener('error', error, { once: true });
      if (v.src === url && v.readyState >= 1) ready(); else { v.addEventListener('loadedmetadata', ready, { once: true }); v.src = url; v.load(); }
    });
  }

  /* ---------------------------------------------------------- Sequence player (two buffers, hard cuts) */
  T.sequence = (initial, opts) => {
    opts = opts || {};
    const box = T.monitor('Shot 1'), videos = [videoEl(), videoEl()];
    videos.forEach((v, i) => { v.style.opacity = i ? '0' : '1'; v.style.zIndex = i ? '1' : '2'; box.prepend(v); });
    const progress = el('div', { className: 'seq-progress', 'aria-hidden': 'true' });
    const label = opts.label || '▶ Play';
    const btn = T.button(label, () => playing ? stop() : play(), 'primary');
    const status = el('p', { className: 'hint-line', 'aria-live': 'polite' });
    const dbg = el('div', { className: 'debug-panel' });
    const host = el('div', { className: 'player' }, box, progress, el('div', { className: 'controls' }, btn, opts.extra || null), status, T.DEBUG ? dbg : null);
    let segs = [], gen = 0, playing = false, index = 0, front = 0, raf = 0, prepared = [], failed = false, standin = null;
    function stop() { playing = false; cancelAnimationFrame(raf); videos.forEach(v => v.pause()); btn.textContent = label; }
    function report(err) { failed = true; status.textContent = 'This needs a media file that is not here yet: ' + err.message; if (!box.querySelector('.placeholder')) box.append(missing({ file: err.message })); }
    function prepare(slot, i, g) { if (!segs[i]) return Promise.resolve(); const p = loadVideo(videos[slot], segs[i]); p.catch(err => { if (g === gen) report(err); }); return p; }
    function setSegments(list) {
      stop(); gen++; const g = gen; segs = list.map(s => Object.assign({}, s)); index = 0; front = 0; failed = false; status.textContent = '';
      box.querySelectorAll('.placeholder').forEach(n => n.remove());
      progress.replaceChildren(...segs.map(s => { const sp = el('span', {}, el('i')); sp.style.flex = String(Math.max(0.01, s.to - s.from)); return sp; }));
      videos[0].style.opacity = '1'; videos[0].style.zIndex = '2'; videos[1].style.opacity = '0'; videos[1].style.zIndex = '1';
      box.querySelector('.pill').textContent = segs.length ? 'Shot 1 of ' + segs.length : 'No shots yet';
      btn.disabled = !segs.length;
      const anyStandin = segs.some(s => clip(s.media) && clip(s.media).status === 'standin');
      if (anyStandin && !standin) { standin = T.standinTag(); box.append(standin); } else if (!anyStandin && standin) { standin.remove(); standin = null; }
      segs.forEach(s => T.mediaUsed.add(s.media));
      prepared = [prepare(0, 0, g), prepare(1, 1, g)];
      update();
    }
    function update() {
      const s = segs[index]; if (!s) return;
      const t = videos[front].currentTime;
      Array.from(progress.children).forEach((p, i) => { p.firstChild.style.width = (i < index ? 100 : i === index ? Math.max(0, Math.min(1, (t - s.from) / (s.to - s.from))) * 100 : 0) + '%'; });
      if (T.DEBUG) dbg.textContent = s.media + ' · ' + t.toFixed(2) + ' s · ' + Object.entries(clip(s.media).events || {}).map(([k, v]) => k + ' ' + v.toFixed(2)).join(' · ');
    }
    async function play() {
      stop(); if (!segs.length) return; T.stopPlayers(api);
      const g = gen; playing = true; btn.textContent = '■ Stop'; status.textContent = '';
      try {
        await prepared[0]; if (g !== gen || !playing) return; if (failed) return;
        index = 0; front = 0; await loadVideo(videos[0], segs[0]); if (g !== gen || !playing) return;
        videos[0].style.opacity = '1'; videos[0].style.zIndex = '2'; videos[1].style.opacity = '0'; videos[1].style.zIndex = '1';
        box.querySelector('.pill').textContent = 'Shot 1 of ' + segs.length;
        prepared[1] = prepare(1, 1, g);
        if (opts.onPlay) opts.onPlay();
        await videos[0].play(); tick();
      } catch (e) { if (g === gen) { stop(); report(e); } }
      async function tick() {
        if (!playing || g !== gen) return;
        const s = segs[index], v = videos[front]; update();
        if (v.currentTime >= s.to - 0.001 || v.ended) {
          v.pause();
          if (index === segs.length - 1) { stop(); Array.from(progress.children).forEach(p => { p.firstChild.style.width = '100%'; }); if (opts.onPlayed) opts.onPlayed(); return; }
          const nx = 1 - front;
          try {
            await prepared[nx]; if (!playing || g !== gen) return;
            front = nx; index++;
            videos[front].style.opacity = '1'; videos[front].style.zIndex = '2'; v.style.opacity = '0'; v.style.zIndex = '1';
            box.querySelector('.pill').textContent = 'Shot ' + (index + 1) + ' of ' + segs.length;
            await videos[front].play(); prepared[1 - front] = prepare(1 - front, index + 1, g);
          } catch (e) { stop(); report(e); return; }
        }
        raf = requestAnimationFrame(tick);
      }
    }
    videos.forEach(v => v.addEventListener('seeked', update));
    const api = { el: host, setSegments, play, stop, segments: () => segs.map(s => Object.assign({}, s)) };
    T.players.add(api); setSegments(initial || []);
    return api;
  };

  /* ---------------------------------------------------------- Video with segments and pause points */
  T.blocks['video-segments'] = b => {
    const rec = clip(b.media);
    T.mediaUsed.add(b.media);
    const wrap = el('div', { className: 'player' });
    if (!rec || rec.status === 'placeholder') {
      wrap.append(T.placeholderBox(rec || { file: b.media, need: 'Unknown media id' }));
      if (b.pauses && b.pauses.length) wrap.append(el('div', { className: 'note' }, el('strong', { text: 'While you watch: ' }), b.pauses.map(p => p.prompt).join(' ')));
      if (b.caption) wrap.append(el('p', { className: 'caption', html: T.rich(b.caption) }));
      return { el: wrap, wide: b.wide };
    }
    const box = T.monitor(b.label || 'Watch'), v = videoEl(); box.prepend(v);
    v.style.objectFit = T.fit(rec);
    if (b.mirror) v.style.transform = 'scaleX(-1)';
    // Archival films carry their own soundtrack; offer sound for them.
    if (rec.audio && b.sound !== false) { v.muted = true; }
    if (rec.status === 'standin') box.append(T.standinTag());
    v.src = T.mediaURL(rec);
    const seek = queuedSeek(v);
    const fill = el('div', { className: 'fill' }), bar = el('div', { className: 'progress', role: 'slider', tabindex: '0', 'aria-label': 'Position in the clip', 'aria-valuemin': '0', 'aria-valuemax': String(rec.duration) }, fill);
    const time = el('span', { className: 'time', text: '0.00 s' });
    const playBtn = T.button('▶ Play', toggle, 'primary');
    const chips = el('div', { className: 'chips' });
    const prompt = el('div', { className: 'prompt', hidden: true, 'aria-live': 'polite' });
    const dbg = el('div', { className: 'debug-panel' });
    let seg = null, raf = 0, nextPause = 0, playing = false;
    const pauses = (b.pauses || []).slice().sort((x, y) => x.at - y.at);
    (b.pauses || []).forEach(p => { const m = el('span', { className: 'mark', title: p.prompt }); m.style.left = (p.at / rec.duration * 100) + '%'; bar.append(m); });
    (b.segments || []).forEach(s => { const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': 'false', text: s.label }); c.addEventListener('click', () => playSegment(s, c)); chips.append(c); });
    function stop() { playing = false; cancelAnimationFrame(raf); v.pause(); playBtn.textContent = '▶ Play'; }
    function toggle() { if (playing) stop(); else start(); }
    function start() {
      T.stopPlayers(api); prompt.hidden = true;
      const end = seg ? seg.to : rec.duration;
      if (v.currentTime >= end - 0.05) { v.currentTime = seg ? seg.from : 0; }
      nextPause = pauses.findIndex(p => p.at > v.currentTime + 0.05); if (nextPause < 0) nextPause = pauses.length;
      playing = true; playBtn.textContent = '❚❚ Pause';
      v.play().catch(() => stop()); tick();
    }
    function playSegment(s, chip) { chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip))); seg = s; stop(); v.currentTime = s.from; start(); }
    function tick() {
      if (!playing) return;
      const t = v.currentTime; render(t);
      if (nextPause < pauses.length && t >= pauses[nextPause].at && (!seg || pauses[nextPause].at <= seg.to)) {
        const p = pauses[nextPause++]; stop();
        prompt.replaceChildren(el('p', { html: T.rich(p.prompt) }), T.button('Continue ▶', () => { prompt.hidden = true; start(); }));
        prompt.hidden = false; prompt.querySelector('button').focus(); return;
      }
      if ((seg && t >= seg.to) || v.ended) { stop(); return; }
      raf = requestAnimationFrame(tick);
    }
    function render(t) { fill.style.width = (t / rec.duration * 100) + '%'; time.textContent = fmt(t) + ' / ' + fmt(rec.duration); bar.setAttribute('aria-valuenow', t.toFixed(1)); if (T.DEBUG) dbg.textContent = b.media + ' · ' + t.toFixed(2) + ' s · ' + Object.entries(rec.events || {}).map(([k, x]) => k + ' ' + x.toFixed(2)).join(' · '); }
    bar.addEventListener('pointerdown', e => { const r = bar.getBoundingClientRect(); stop(); seg = null; const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * rec.duration; seek(t); render(t); });
    bar.addEventListener('keydown', e => { const d = { ArrowLeft: -0.5, ArrowRight: 0.5 }[e.key]; if (d != null) { e.preventDefault(); stop(); const t = Math.max(0, Math.min(rec.duration, v.currentTime + d)); seek(t); render(t); } });
    v.addEventListener('error', () => box.append(missing(rec)));
    v.addEventListener('seeked', () => render(v.currentTime));
    const soundBtn = rec.audio ? T.button('Sound: off', () => { v.muted = !v.muted; soundBtn.textContent = 'Sound: ' + (v.muted ? 'off' : 'on'); }, 'small') : null;
    const credit = rec.source === 'public-domain' ? el('p', { className: 'caption' }, el('em', { text: rec.title }), ' (' + rec.year + '), ' + rec.credit + '. Public domain. ', rec.sourceUrl ? el('a', { href: rec.sourceUrl, text: 'Source', target: '_blank', rel: 'noopener' }) : null) : null;
    wrap.append(...[box, bar, el('div', { className: 'controls' }, playBtn, time, soundBtn), chips.children.length ? chips : null, prompt, T.DEBUG ? dbg : null, b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null, credit].filter(Boolean));
    // Show the first segment's opening frame instead of a black frame 0.
    const firstAt = b.poster != null ? b.poster : (b.segments && b.segments.length ? b.segments[0].from : 0);
    if (firstAt > 0) v.addEventListener('loadedmetadata', () => { if (v.currentTime === 0) { seek(firstAt); render(firstAt); } }, { once: true });
    const api = { stop }; T.players.add(api);
    return { el: wrap, wide: b.wide, interactive: true, printNote: 'Video: open this topic online to watch it.' };
  };

  /* ---------------------------------------------------------- Compare versions of a short sequence */
  // Predict first (b.predict = { q, options, answer }): notes stay hidden until the student has predicted and played.
  T.blocks['sequence-compare'] = b => {
    const info = el('div', { className: 'card', 'aria-live': 'polite' });
    const chips = el('div', { className: 'chips', role: 'group', 'aria-label': 'Versions' });
    const seen = new Set();
    let current = 0, predicted = !b.predict;
    const player = T.sequence(b.versions[0].segments, { label: '▶ Play this version', onPlayed: () => { seen.add(current); chips.children[current].classList.add('found'); show(true); } });
    function show(after) {
      const ver = b.versions[current];
      const hide = !predicted || (b.hideNotesUntilPlayed || b.predict) && !after;
      info.replaceChildren(el('h3', { text: ver.label }), el('p', { html: T.rich(hide ? (predicted ? (b.askBefore || 'Play it and watch the cut.') : 'Make your prediction first, then play each version.') : ver.note) }));
    }
    let predictBox = null;
    if (b.predict) {
      const fb = el('div', { 'aria-live': 'polite' });
      const answers = el('div', { className: 'answers' });
      const btns = b.predict.options.map((o, i) => { const x = T.button(o, () => { predicted = true; btns.forEach(y => { y.disabled = true; }); x.classList.add('selected'); T.feedback(fb, 'You predicted: <strong>' + o + '</strong>. Now play each version and check.', true); fb.className = 'feedback'; fb.style.background = 'var(--soft)'; show(seen.has(current)); }); answers.append(x); return x; });
      predictBox = el('div', { className: 'predict' }, el('p', { className: 'label', text: 'Predict' }), el('p', { className: 'q', html: T.rich(b.predict.q) }), answers, fb);
      player.el.addEventListener('click', () => { if (!predicted) T.feedback(fb, 'Make a prediction first. There is no wrong guess.', false); }, true);
    }
    b.versions.forEach((ver, i) => {
      const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(i === 0), text: ver.label });
      c.addEventListener('click', () => { current = i; chips.querySelectorAll('.chip').forEach((x, j) => x.setAttribute('aria-pressed', String(i === j))); player.setSegments(ver.segments); show(seen.has(i)); });
      chips.append(c);
    });
    show(false);
    const right = el('div', { className: 'panel' }, predictBox, b.prompt ? el('p', { html: T.rich(b.prompt) }) : null, chips, info);
    return { el: T.stage(player.el, right), wide: true, interactive: true };
  };

  /* ---------------------------------------------------------- Frame viewer + slider (trim and cut tools) */
  function frameView(id, label) {
    const rec = clip(id), box = T.monitor(label), v = videoEl(); box.prepend(v);
    const seek = queuedSeek(v), dbg = el('div', { className: 'debug-panel' });
    if (rec.status === 'standin') box.append(T.standinTag());
    v.addEventListener('error', () => box.append(missing(rec)));
    v.addEventListener('seeking', () => box.classList.add('is-seeking'));
    v.addEventListener('seeked', () => { if (!v.seeking) box.classList.remove('is-seeking'); measure(); });
    v.src = T.mediaURL(rec);
    function measure() { if (T.DEBUG) dbg.textContent = id + ' · ' + v.currentTime.toFixed(2) + ' s · ' + Object.entries(rec.events || {}).map(([k, x]) => k + ' ' + x.toFixed(2)).join(' · '); }
    return { el: el('div', {}, box, T.DEBUG ? dbg : null), box, video: v, show: (t, text) => { v.pause(); box.querySelector('.pill').textContent = text || label; seek(Math.max(0, Math.min(rec.duration - 0.001, t))); } };
  }
  function slider(label, id, value, onInput) {
    const rec = clip(id), rid = T.uid(), out = el('output', { for: rid, text: fmt(value) });
    const range = el('input', { type: 'range', min: '0', max: String(rec.duration), step: '0.04', value: String(value), id: rid });
    const wrap = el('div', { className: 'range-wrap' }, range);
    const row = el('div', { className: 'slider-row' }, el('label', { for: rid }, label, out), wrap);
    range.addEventListener('input', () => { out.textContent = fmt(Number(range.value)); onInput(Number(range.value)); });
    let tick = null;
    return { el: row, input: range, set: x => { range.value = String(x); out.textContent = fmt(x); }, hint: t => { if (!tick) { tick = el('span', { className: 'hint-tick' }); wrap.append(tick); } tick.style.left = (t / rec.duration * 100) + '%'; } };
  }

  // Trim one clip: choose where it starts and ends.
  T.trim = (id, opts) => {
    opts = opts || {};
    const rec = clip(id);
    let start = opts.in || 0, end = opts.out == null ? rec.duration : opts.out, playing = false, raf = 0;
    const frame = frameView(id, 'First frame');
    const kept = el('span', { className: 'kept' }), line = el('div', { className: 'trim-timeline', 'aria-hidden': 'true' }, kept);
    const a = slider('Start of shot', id, start, t => { start = Math.min(t, end - 0.5); refresh('First frame', start, true); });
    const z = slider('End of shot', id, end, t => { end = Math.max(t, start + 0.5); refresh('Last frame', end, true); });
    const status = el('p', { className: 'hint-line', 'aria-live': 'polite' });
    const btn = T.button('▶ Play my shot', () => playing ? stop() : play(), 'primary');
    const host = el('div', { className: 'player' }, frame.el, a.el, line, z.el, el('div', { className: 'controls' }, btn), status);
    const get = () => ({ in: start, out: end });
    function stop() { playing = false; cancelAnimationFrame(raf); frame.video.pause(); btn.textContent = '▶ Play my shot'; }
    function refresh(text, t, notify) {
      stop(); start = Math.max(0, Math.min(rec.duration - 0.5, start)); end = Math.max(start + 0.5, Math.min(rec.duration, end));
      a.set(start); z.set(end); kept.style.left = (start / rec.duration * 100) + '%'; kept.style.width = ((end - start) / rec.duration * 100) + '%';
      frame.show(t, text); if (notify && opts.onChange) opts.onChange(get());
    }
    async function play() {
      stop(); T.stopPlayers(api); playing = true; btn.textContent = '■ Stop'; status.textContent = '';
      try {
        await loadVideo(frame.video, T.seg(id, start, end)); if (!playing) return;
        frame.box.querySelector('.pill').textContent = 'Playing'; await frame.video.play(); if (opts.onPlay) opts.onPlay(get());
        (function tick() { if (!playing) return; if (frame.video.currentTime >= end - 0.001 || frame.video.ended) { stop(); frame.show(Math.min(end, rec.duration - 0.001), 'Last frame'); return; } raf = requestAnimationFrame(tick); })();
      } catch (e) { stop(); status.textContent = 'This needs a media file that is not here yet: ' + e.message; }
    }
    const api = { el: host, get, stop, set: x => { start = x.in; end = x.out; refresh('First frame', start, true); }, hint: () => { a.hint(rec.events.enter - 0.6); z.hint((rec.events.exit == null ? rec.events.bookEnd : rec.events.exit) + 0.6); } };
    T.players.add(api); refresh('First frame', start, false);
    return api;
  };

  // Judge a trim (from Basic Sequences unit 2).
  T.trimError = (id, start, end, room) => {
    const e = clip(id).events;
    if (start > e.enter - 0.2 + 1e-8) return 'The shot starts with the person already in the frame. Start earlier, on the empty frame.';
    if (start < e.enter - 1.5 - 1e-8) return 'Too much empty frame at the start. Trim closer to the moment the person enters.';
    if (room) return end < e.bookEnd + 0.3 - 1e-8 ? 'The shot ends before the book is open. End a little later.' : null;
    if (end < e.exit + 0.2 - 1e-8) return 'The shot ends with the person still in the frame. End later, after they have gone.';
    if (end > e.exit + 1.5 + 1e-8) return 'Too much empty frame at the end. Trim closer to the moment the person leaves.';
    return null;
  };

  // Cut between two shots of the same action (from Basic Sequences unit 3).
  const CUT_STATES = {
    still: { id: 'still', title: 'Cut on stillness', text: 'Nothing is moving at the cut, so the cut itself stands out. Cut while the person is in the middle of the move.' },
    double: { id: 'double', title: 'Double action', text: 'Shot 2 starts too early, so part of the move happens twice.' },
    skip: { id: 'skip', title: 'Skipped action', text: 'Shot 2 starts too late, so part of the move is missing. The person seems to jump.' },
    match: { id: 'match', title: 'Smooth cut on action', text: 'The move starts in Shot 1 and finishes in Shot 2. Viewers watch the move, not the cut.' }
  };
  T.cutState = (pA, pB) => CUT_STATES[pA < 0.1 || pA > 0.9 ? 'still' : pB - pA < -0.25 ? 'double' : pB - pA > 0.25 ? 'skip' : 'match'];
  T.cut = (a, b, action, opts) => {
    opts = opts || {};
    let pA = opts.pA == null ? -0.4 : opts.pA, pB = opts.pB == null ? -0.4 : opts.pB;
    const fa = frameView(a, 'Shot 1 · last frame'), fb = frameView(b, 'Shot 2 · first frame');
    const ea = clip(a).events, eb = clip(b).events, span = (e) => e[action + 'End'] - e[action + 'Start'];
    function norm() { const ta = Math.max(0, Math.min(clip(a).duration, T.time(a, action, pA))), tb = Math.max(0, Math.min(clip(b).duration, T.time(b, action, pB))); pA = (ta - ea[action + 'Start']) / span(ea); pB = (tb - eb[action + 'Start']) / span(eb); }
    function get() { norm(); return { a, b, action, pA, pB, out: T.time(a, action, pA), in: T.time(b, action, pB) }; }
    function segments() { const x = get(); return [T.seg(a, Math.max(0, x.out - 2), x.out), T.seg(b, x.in, Math.min(clip(b).duration, x.in + 2))]; }
    const player = T.sequence(segments(), { label: '▶ Play the cut', onPlay: () => { if (opts.onPlay) opts.onPlay(get()); } });
    const sa = slider('Cut out of Shot 1 at', a, T.time(a, action, pA), t => { pA = (t - ea[action + 'Start']) / span(ea); refresh(true); });
    const sb = slider('Cut into Shot 2 at', b, T.time(b, action, pB), t => { pB = (t - eb[action + 'Start']) / span(eb); refresh(true); });
    const host = el('div', { className: 'player' }, el('div', { className: 'pair' }, el('div', { className: 'player' }, fa.el, sa.el), el('div', { className: 'player' }, fb.el, sb.el)), player.el);
    function refresh(notify) { const x = get(); fa.show(x.out); fb.show(x.in); sa.set(x.out); sb.set(x.in); player.setSegments(segments()); if (notify && opts.onChange) opts.onChange(x); }
    refresh(false);
    return { el: host, get, set: (x, y) => { pA = x; pB = y; refresh(true); }, hint: () => { sa.hint(T.time(a, action, 0.5)); sb.hint(T.time(b, action, 0.5)); }, play: () => player.play(), stop: () => player.stop() };
  };

  /* ---------------------------------------------------------- Explore: trim a walk (enter / exit) */
  T.blocks['trim-explore'] = b => {
    const e = clip(b.media).events;
    const info = el('div', { className: 'card', 'aria-live': 'polite' }), checks = el('ul', { className: 'checks' }), tasks = el('ul', { className: 'checks' });
    const progress = el('p', { className: 'hint-line', 'aria-live': 'polite' });
    const done = [false, false, false]; let demo = false, setting = false;
    function update(x, played, initial) {
      const cs = x.in <= e.enter - 0.2, ce = x.out >= e.exit + 0.2;
      const st = b.states[cs ? (ce ? 0 : 2) : (ce ? 1 : 3)];
      info.replaceChildren(el('h3', { text: st.title }), el('p', { html: T.rich(st.text) }));
      checks.replaceChildren(...b.checks.map((t, i) => el('li', { className: (i ? ce : cs) ? 'ok' : 'no', text: t })));
      if (!initial && !demo) { done[0] = done[0] || cs; done[1] = done[1] || ce; done[2] = done[2] || (played && cs && ce); }
      tasks.replaceChildren(...b.tasks.map((t, i) => el('li', { className: done[i] ? 'ok' : '', text: t })));
      const n = done.filter(Boolean).length;
      progress.innerHTML = n === 3 ? T.rich(b.completion) : 'Tasks done: ' + n + ' of 3.' + (demo ? ' That was an example. Drag the sliders yourself to tick off the tasks.' : '');
    }
    const trim = T.trim(b.media, { in: e.enter + 1, out: e.exit - 1, onChange: x => { if (!setting) { demo = false; presets.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false')); } update(x, false, false); }, onPlay: x => update(x, true, false) });
    const presets = el('div', { className: 'chips', role: 'group', 'aria-label': 'Try an example trim' });
    b.presets.forEach((p, i) => { const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': 'false', text: p.label }); c.addEventListener('click', () => { setting = true; demo = true; trim.set({ in: e.enter + p.in, out: e.exit + p.out }); setting = false; presets.querySelectorAll('.chip').forEach((x, j) => x.setAttribute('aria-pressed', String(i === j))); }); presets.append(c); });
    update(trim.get(), false, true);
    return { el: el('div', {}, T.stage(trim.el, [presets, info, T.card('In this shot', checks), T.card('Try these', tasks)]), progress), wide: true, interactive: true };
  };

  /* ---------------------------------------------------------- Explore: cut on action */
  T.blocks['cut-explore'] = b => {
    const found = new Set();
    const info = el('div', { className: 'card', 'aria-live': 'polite' }), checks = el('ul', { className: 'checks' });
    const presets = el('div', { className: 'chips', role: 'group', 'aria-label': 'Try a kind of cut' });
    const progress = el('p', { className: 'hint-line', 'aria-live': 'polite' });
    function update(x, played) {
      const st = T.cutState(x.pA, x.pB); if (played) found.add(st.id);
      info.replaceChildren(el('h3', { text: st.title }), el('p', { text: st.text }));
      const pass = [x.pA >= 0.1 && x.pA <= 0.9, Math.abs(x.pB - x.pA) <= 0.25];
      checks.replaceChildren(...b.checks.map((t, i) => el('li', { className: pass[i] ? 'ok' : 'no', text: t })));
      b.presets.forEach((p, i) => presets.children[i] && presets.children[i].classList.toggle('found', found.has(p.state)));
      progress.innerHTML = found.size === 4 ? T.rich(b.completion) : 'Kinds of cut played: ' + found.size + ' of 4.';
    }
    const tool = T.cut(b.a, b.b, b.action, { onChange: x => update(x, false), onPlay: x => update(x, true) });
    b.presets.forEach((p, i) => { const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': 'false', text: p.label }); c.addEventListener('click', () => { tool.set(p.pA, p.pB); presets.querySelectorAll('.chip').forEach((x, j) => x.setAttribute('aria-pressed', String(i === j))); tool.play(); }); presets.append(c); });
    update(tool.get(), false);
    return { el: el('div', {}, T.stage(tool.el, [presets, info, T.card('In this cut', checks), b.tip ? T.card('Why it works', b.tip, 'warm') : null]), progress), wide: true, interactive: true };
  };

  /* ---------------------------------------------------------- Practice: challenge runner (FOUNDATION v1 F9, simplified) */
  T.blocks.challenge = b => {
    const host = el('div');
    let index = 0;
    function makeTool(br) {
      if (br.tool === 'trim') {
        const t = T.trim(br.media, { in: br.in, out: br.out });
        return { el: t.el, get: t.get, stop: t.stop, judge: x => T.trimError(br.media, x.in, x.out, br.room), hint: t.hint, hintLine: 'Yellow marks show good places to start and end.' };
      }
      const t = T.cut(br.a, br.b, br.action, { pA: br.pA, pB: br.pB });
      return { el: t.el, get: t.get, stop: t.stop, judge: x => { const s = T.cutState(x.pA, x.pB); return s.id === 'match' ? null : s.title + '. ' + s.text; }, hint: t.hint, hintLine: 'Yellow marks show the middle of the move in each shot.' };
    }
    function render() {
      host.replaceChildren();
      const br = b.briefs[index], tool = makeTool(br);
      let misses = 0, done = false;
      const fb = el('div', { 'aria-live': 'polite' }), hintLine = el('p', { className: 'hint-line' });
      const dots = el('div', { className: 'dots', 'aria-hidden': 'true' }, b.briefs.map((_, i) => el('span', { className: i < index ? 'done' : i === index ? 'current' : '' })));
      const act = T.button(b.actionLabel || 'Lock it in', judge, 'primary'); act.style.width = '100%';
      const hint = T.button('Show me a hint', () => { tool.hint(); hintLine.textContent = tool.hintLine; }); hint.hidden = true;
      const next = T.button(index === b.briefs.length - 1 ? 'Finish →' : 'Next job →', () => { tool.stop(); if (index === b.briefs.length - 1) finish(); else { index++; render(); host.scrollIntoView({ block: 'start' }); } }, 'primary'); next.hidden = true;
      const card = T.card('', el('div', {}, dots, el('p', { className: 'label', style: 'margin-top:10px', text: 'Job ' + (index + 1) + ' of ' + b.briefs.length + ' · ' + (b.speaker || 'The editor says') }), el('p', { className: 'quote', html: '“' + T.rich(br.text) + '”' }), act, fb, hint, hintLine, next), 'brief');
      host.append(T.stage(tool.el, card));
      function judge() {
        if (done) return;
        const err = tool.judge(tool.get());
        if (err) { misses++; T.feedback(fb, err, false); if (misses >= 2) hint.hidden = false; return; }
        done = true; tool.stop(); tool.el.inert = true;
        T.feedback(fb, '<strong>Got it.</strong> ' + br.success, true);
        act.hidden = true; hint.hidden = true; next.hidden = false; next.focus();
      }
    }
    function finish() {
      host.replaceChildren(T.card('', el('div', {}, el('p', { className: 'label', text: 'That’s a wrap' }), el('h3', { style: 'font-size:22px;margin:6px 0 12px', html: T.rich(b.closing) }), el('div', { className: 'actions' }, T.button('Go again', () => { index = 0; render(); })))));
    }
    render();
    return { el: host, wide: true, interactive: true };
  };

  /* ---------------------------------------------------------- Explore: coverage switcher (multi-angle) */
  T.blocks['coverage-switcher'] = b => {
    const master = clip(b.master);
    const angles = b.angles.map(a => Object.assign({ rec: clip(a.media), offset: a.media === b.master ? 0 : (clip(a.media).offsetFrom ? clip(a.media).offsetFrom.seconds : 0) }, a));
    const box = T.monitor(angles[0].label);
    const vids = angles.map((a, i) => { const v = videoEl(); v.src = T.mediaURL(a.rec); v.style.opacity = i ? '0' : '1'; box.prepend(v); T.mediaUsed.add(a.media); return v; });
    if (angles.some(a => a.rec.status === 'standin')) box.append(T.standinTag());
    const playBtn = T.button('▶ Play the scene', () => playing ? stop() : play(), 'primary');
    const time = el('span', { className: 'time', text: '0.00 s' });
    const chips = el('div', { className: 'chips', role: 'group', 'aria-label': 'Camera angles' });
    const log = el('ol', { className: 'checks', style: 'font-size:14.5px' });
    const info = el('p', { className: 'hint-line', 'aria-live': 'polite' });
    let current = 0, playing = false, raf = 0, cuts = [];
    angles.forEach((a, i) => { const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(i === 0), text: a.label }); c.addEventListener('click', () => choose(i)); chips.append(c); });
    const masterV = vids[0];
    function localTime(i, t) { return t - angles[i].offset; }
    function available(i, t) { const lt = localTime(i, t); return lt >= 0 && lt <= angles[i].rec.duration - 0.05; }
    function choose(i) {
      const t = masterV.currentTime;
      if (!available(i, t)) { info.textContent = angles[i].label + ' was not filmed at this moment. Coverage only helps if you filmed it.'; return; }
      info.textContent = '';
      if (i === current) return;
      vids[i].currentTime = localTime(i, t);
      vids.forEach((v, j) => { v.style.opacity = j === i ? '1' : '0'; });
      box.querySelector('.pill').textContent = angles[i].label;
      chips.querySelectorAll('.chip').forEach((c, j) => c.setAttribute('aria-pressed', String(i === j)));
      if (playing) { vids[i].play().catch(() => {}); cuts.push({ t, label: angles[i].label }); drawLog(); }
      if (current !== 0) vids[current].pause();
      current = i;
    }
    function drawLog() { log.replaceChildren(...cuts.map(c => el('li', { className: 'ok', text: c.t.toFixed(1) + ' s → ' + c.label }))); }
    function stop() { playing = false; cancelAnimationFrame(raf); vids.forEach(v => v.pause()); playBtn.textContent = '▶ Play the scene'; }
    function play() {
      T.stopPlayers(api);
      if (masterV.currentTime >= master.duration - 0.1) { masterV.currentTime = 0; cuts = []; drawLog(); choose(0); }
      if (!cuts.length) cuts.push({ t: masterV.currentTime, label: angles[current].label });
      drawLog(); playing = true; playBtn.textContent = '■ Stop';
      masterV.play().catch(() => stop());
      if (current) { vids[current].currentTime = localTime(current, masterV.currentTime); vids[current].play().catch(() => {}); }
      tick();
    }
    function tick() {
      if (!playing) return;
      const t = masterV.currentTime; time.textContent = fmt(t) + ' / ' + fmt(master.duration);
      if (current) { const want = localTime(current, t); if (Math.abs(vids[current].currentTime - want) > 0.15) vids[current].currentTime = want; if (!available(current, t)) { choose(0); info.textContent = 'That angle ran out, so the scene went back to the master shot.'; } }
      angles.forEach((a, i) => { chips.children[i].disabled = i !== 0 && !available(i, t); });
      if (masterV.ended || t >= master.duration - 0.05) { stop(); info.textContent = 'Scene over. You made ' + Math.max(0, cuts.length - 1) + ' cut' + (cuts.length === 2 ? '' : 's') + '. Play again to try a different edit.'; return; }
      raf = requestAnimationFrame(tick);
    }
    const api = { stop }; T.players.add(api);
    const right = el('div', { className: 'panel' }, el('p', { html: T.rich(b.prompt) }), chips, info, T.card('Your edit', log));
    return { el: T.stage(el('div', { className: 'player' }, box, el('div', { className: 'controls' }, playBtn, time)), right), wide: true, interactive: true };
  };
})();
