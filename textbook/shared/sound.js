/* Offline audio playback, comparison and mixing. */
(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio,
    el = T.el;
  const record = (id) => T.mediaRecord(id);
  function audio(id, label, controls = true) {
    const r = record(id),
      a = el('audio', { preload: 'metadata', controls, 'aria-label': label || id });
    if (r) {
      a.src = T.mediaURL(r);
      T.mediaUsed.add(id);
    }
    return a;
  }
  function waveform(peaks = []) {
    const bins = Math.min(peaks.length, 120),
      points = [];
    for (let i = 0; i < bins; i++) {
      const start = Math.floor((i * peaks.length) / bins),
        end = Math.floor(((i + 1) * peaks.length) / bins);
      points.push(Math.max(...peaks.slice(start, end)));
    }
    return el(
      'div',
      { className: 'waveform', role: 'img', 'aria-label': 'Waveform, left to right in time' },
      points.map((p) => el('i', { style: 'height:' + Math.max(1, p * 100) + '%' })),
    );
  }
  T.blocks.audio = (b) => {
    const a = audio(b.media, b.label),
      status = el('p', { 'aria-live': 'polite' }),
      seen = new Set();
    let end = Infinity;
    const controls = (b.segments || []).map((s) =>
      T.button(
        s.label,
        () => {
          end = s.to ?? Infinity;
          seen.clear();
          a.currentTime = s.from || 0;
          a.play().catch(() => {});
        },
        'small',
      ),
    );
    a.addEventListener('timeupdate', () => {
      if (a.currentTime >= end) {
        a.pause();
        end = Infinity;
      }
      const pause = (b.pauses || []).find(
        (p, i) => !seen.has(i) && a.currentTime >= p.at && a.currentTime < p.at + 0.4,
      );
      if (pause) {
        seen.add(b.pauses.indexOf(pause));
        a.pause();
        status.textContent = pause.prompt + ' Press Play to continue.';
      }
    });
    return {
      el: el(
        'div',
        { className: 'audio-card' },
        el('p', { className: 'caption', text: b.label + ' · Stand-in recording' }),
        a,
        waveform(record(b.media)?.peaks),
        el('div', { className: 'audio-segments' }, controls),
        status,
      ),
      wide: true,
      interactive: true,
    };
  };
  T.blocks['layer-mixer'] = (b) => {
    const status = el('div', { 'aria-live': 'polite' }),
      channels = b.stems.map((s) => ({ s, a: audio(s.media, s.label, false) }));
    let raf = 0,
      run = 0;
    function stop() {
      run++;
      cancelAnimationFrame(raf);
      channels.forEach(({ a }) => {
        a.pause();
        a.currentTime = 0;
      });
    }
    const api = { stop };
    T.players.add(api);
    async function play() {
      stop();
      T.stopPlayers(api);
      const playing = run;
      try {
        await Promise.all(channels.map(({ a }) => a.play()));
      } catch {
        if (run === playing) status.textContent = 'Playback did not start. Press Play mix to retry.';
        return;
      }
      if (run !== playing) return;
      function tick() {
        const lead = channels[0].a;
        if (lead.ended) {
          stop();
          return;
        }
        channels.slice(1).forEach(({ a }) => {
          if (!a.ended && Math.abs(a.currentTime - lead.currentTime) > 0.12) a.currentTime = lead.currentTime;
        });
        raf = requestAnimationFrame(tick);
      }
      tick();
    }
    const rows = channels.map(({ s, a }) => {
      const enabled = el('input', { type: 'checkbox', checked: true, 'aria-label': 'Enable ' + s.label }),
        gain = el('input', {
          type: 'range',
          min: 0,
          max: 100,
          value: s.level,
          'aria-label': s.label + ' volume',
        }),
        read = el('output');
      function update() {
        a.muted = !enabled.checked;
        a.volume = Number(gain.value) / 100;
        read.textContent = gain.value + '%';
      }
      enabled.oninput = gain.oninput = update;
      update();
      return el('div', { className: 'mixer-row' }, enabled, el('span', { text: s.label }), gain, read);
    });
    const check = b.judge
      ? T.button(
          'Check mix',
          () => {
            const wrong = channels.find(({ s, a }) => {
              const range = b.judge[s.id],
                level = a.muted ? 0 : Math.round(a.volume * 100);
              return range && (level < range[0] || level > range[1]);
            });
            T.feedback(
              status,
              wrong
                ? wrong.s.id === 'voice'
                  ? 'Check the voice switch and raise the words above the bed.'
                  : 'Keep the music audible beneath the words. Listen through the last phrase.'
                : 'You can hear the words and still follow the music between phrases.',
              !wrong,
            );
          },
          'primary',
        )
      : null;
    return {
      el: T.stage(T.media(b.picture || 'interview-a'), [
        el(
          'div',
          { className: 'mixer' },
          el('p', { className: 'caption', text: 'Stand-in scene stems' }),
          rows,
          el(
            'div',
            { className: 'actions' },
            T.button('Play mix', play, 'primary'),
            T.button('Stop', stop, 'small'),
            check,
          ),
          status,
        ),
      ]),
      wide: true,
      interactive: true,
    };
  };
  T.blocks['meter-sim'] = (b) => {
    const a = audio(b.takes[0].media, 'Recording gain demonstration'),
      bar = el('i'),
      indicator = el('output'),
      note = el('p'),
      gain = el('input', {
        type: 'range',
        min: 0,
        max: b.takes.length - 1,
        value: 1,
        'aria-label': 'Recording gain stop',
      });
    let take,
      raf = 0;
    function animate() {
      const r = record(take.media),
        sample = a.paused
          ? take.level
          : (r?.peaks || [])[Math.floor(a.currentTime * (r?.peakRate || 25))] || 0;
      bar.style.height = Math.max(1, 100 * sample) + '%';
      bar.className = sample >= 0.98 ? 'clip' : '';
      if (!a.paused) raf = requestAnimationFrame(animate);
    }
    function change() {
      take = b.takes[Number(gain.value)];
      a.pause();
      a.src = T.mediaURL(record(take.media));
      T.mediaUsed.add(take.media);
      indicator.textContent = take.label;
      note.textContent = take.note;
      animate();
    }
    a.addEventListener('play', () => {
      cancelAnimationFrame(raf);
      animate();
    });
    gain.oninput = change;
    change();
    return {
      el: el(
        'div',
        { className: 'meter-sim' },
        el('div', { className: 'meter', 'aria-hidden': 'true' }, bar),
        el('div', {}, indicator, gain, a, note),
      ),
      wide: true,
      interactive: true,
    };
  };
  T.blocks['listen-choice'] = (b) => {
    if (b.free) {
      const choices = el('div', { className: 'listen-options' }),
        groups = b.groups || [{ label: 'Recordings', options: b.options }];
      const select = el(
        'select',
        { 'aria-label': 'Microphone model' },
        groups.map((group, i) => el('option', { value: i, text: group.label })),
      );
      function load() {
        choices.querySelectorAll('audio').forEach((a) => a.pause());
        choices.replaceChildren(
          ...groups[Number(select.value)].options.map((o) =>
            el('label', { className: 'listen-option' }, o.label, audio(o.media, o.label)),
          ),
        );
      }
      select.onchange = load;
      load();
      return {
        el: el('div', {}, groups.length > 1 ? el('label', {}, 'Microphone model ', select) : null, choices),
        wide: true,
        interactive: true,
      };
    }
    let ix = 0,
      score = 0;
    const host = el('div');
    function draw() {
      let missed = false;
      const r = b.rounds[ix],
        fb = el('div', { 'aria-live': 'polite' }),
        opts = el('div', { className: 'listen-options' }),
        next = T.button(
          ix === b.rounds.length - 1 ? 'Finish' : 'Next round',
          () => {
            host.querySelectorAll('audio').forEach((a) => a.pause());
            if (++ix === b.rounds.length)
              host.replaceChildren(
                T.card('Listening complete', score + ' of ' + ix + ' solved on the first try.'),
              );
            else draw();
          },
          'primary',
        );
      next.hidden = true;
      r.options.forEach((o, k) => {
        const label = o.label || 'Take ' + String.fromCharCode(65 + k),
          a = audio(o.media, label),
          bt = T.button(
            'Choose ' + label,
            () => {
              if (k === r.answer) {
                if (!missed) score++;
                opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
                T.feedback(fb, r.explain, true);
                next.hidden = false;
                next.focus();
              } else {
                missed = true;
                bt.disabled = true;
                T.feedback(fb, o.clue, false);
              }
            },
            'small',
          );
        opts.append(el('div', { className: 'listen-option' }, el('strong', { text: label }), a, bt));
      });
      host.replaceChildren(
        el(
          'div',
          { className: 'card practice-card' },
          el('p', { className: 'label', text: 'Listening ' + (ix + 1) + ' of ' + b.rounds.length }),
          el('p', { className: 'q', text: r.prompt }),
          opts,
          fb,
          next,
        ),
      );
    }
    draw();
    return { el: host, wide: true, interactive: true };
  };
  // Native hook players register themselves. Other native players share a single
  // transport so starting an example also stops a mixer or a running video.
  let activeNative = null;
  const nativePlayback = { stop: () => activeNative?.pause() };
  T.players.add(nativePlayback);
  document.addEventListener('play', (event) => {
    const current = event.target;
    // A camera take mixes its microphone and room tracks under one registered transport.
    if (current.tagName !== 'AUDIO' || current.closest('.cam-sim')) return;
    if (!current.closest('.hook-audio')) {
      T.stopPlayers(nativePlayback);
      activeNative = current;
    }
    document.querySelectorAll('audio').forEach((other) => {
      if (other !== current) other.pause();
    });
  }, true);
  H.audio = (media, label, segments = [], pauses = []) => ({ type: 'audio', media, label, segments, pauses });
  H.audioHook = (...examples) => ({ audioExamples: examples.map(([media, label]) => ({ media, label })) });
  H.wave = (name, id) => H.art('wave', [name, record(id)?.peaks || []], name + ' waveform');
  H.listening = (...rows) => ({
    type: 'listen-choice',
    rounds: rows.map(([prompt, ids, answer, clue, explain]) => ({
      prompt,
      options: ids.map((media) => ({ media, clue })),
      answer,
      explain,
    })),
  });
  H.mixer = (stems, judge) => ({
    type: 'layer-mixer',
    stems: stems.map(([id, media, label, level]) => ({ id, media, label, level })),
    judge,
  });
})();
