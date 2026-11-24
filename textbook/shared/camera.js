/* Camera blocks first needed in Part 3 (FOUNDATION T5): the live viewfinder (v1 F7), framing challenges (v1 F9),
   slider demos, hotspots, a lens simulator, a flip book, a frame-rate demo and zoom versus dolly.
   Photo geometry is always in source pixels and comes from manifest landmarks (v1 F6, F11). */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const RATIO = 16 / 9;
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================== Frame math */
  // f = { x, y, w } in as-seen (mirrored if needed) source pixels. h = w / (16/9).
  T.frameMath = (id, mirror, minFrac) => {
    const rec = T.mediaRecord(id);
    const W = rec.w, H = rec.h, MIN_W = W * (minFrac || 0.12);
    const clamp = f => { const w = Math.min(W, Math.max(MIN_W, f.w)), h = w / RATIO; return { w, x: Math.max(0, Math.min(W - w, f.x)), y: Math.max(0, Math.min(H - h, f.y)) }; };
    const flipX = x => mirror ? W - x : x;
    const region = r => mirror ? [W - r[2], r[1], W - r[0], r[3]] : r;
    // At least 85 % of the region's area is inside the frame (v1 F6).
    const inside = (f, r) => { r = region(r); const h = f.w / RATIO; const ox = Math.max(0, Math.min(r[2], f.x + f.w) - Math.max(r[0], f.x)); const oy = Math.max(0, Math.min(r[3], f.y + h) - Math.max(r[1], f.y)); return ox * oy >= 0.85 * (r[2] - r[0]) * (r[3] - r[1]); };
    const L = rec.landmarks || {};
    // Interview measurements (Interview Framing spec 3.1).
    const measure = f => {
      const h = f.w / RATIO, out = { frac: f.w / W, f, inside: r => inside(f, typeof r === 'string' ? L.regions[r] : r) };
      if (!L.eyes) return out;
      const gaze = L.gaze ? ((L.gaze === 'right') !== !!mirror ? 'right' : 'left') : null;
      const headH = L.chin[1] - L.headTop[1];
      const ex = (flipX(L.eyes[0]) - f.x) / f.w, ey = (L.eyes[1] - f.y) / h;
      return Object.assign(out, { gaze, size: headH / h, ex, ey, headroom: (L.headTop[1] - f.y) / h, lead: gaze === 'right' ? 1 - ex : ex, chinIn: L.chin[1] <= f.y + 0.97 * h,
        eyesX: flipX(L.eyes[0]), eyesY: L.eyes[1], headTopX: flipX(L.headTop[0]), headTopY: L.headTop[1] });
    };
    // Recipe R(size, lead, ey): a frame worked out from the landmarks, so it fits any photo (spec 3.3).
    const recipe = (size, lead, ey) => {
      if (!L.eyes) return clamp({ x: 0, y: 0, w: W });
      const gaze = (L.gaze === 'right') !== !!mirror ? 'right' : 'left';
      const h = (L.chin[1] - L.headTop[1]) / size, w = h * RATIO, ex = gaze === 'right' ? 1 - lead : lead;
      return clamp({ w, x: flipX(L.eyes[0]) - ex * w, y: L.eyes[1] - ey * h });
    };
    return { rec, W, H, MIN_W, clamp, inside, measure, recipe, mirror: !!mirror };
  };
  const toF = a => Array.isArray(a) ? { x: a[0], y: a[1], w: a[2] } : a;
  const toA = f => [Math.round(f.x), Math.round(f.y), Math.round(f.w)];

  // Bands and standard messages (Interview Framing spec 3.2, 3.4).
  T.band = {
    size: s => s < 0.20 ? 'wide' : s < 0.30 ? 'medium' : s < 0.45 ? 'chest' : 'close',
    eyes: ey => ey < 0.26 ? 'high' : ey <= 0.40 ? 'third' : 'low',
    headroom: hr => hr < 0.03 ? 'tight' : hr <= 0.22 ? 'good' : 'loose',
    lead: l => l < 0.42 ? 'crowded' : l < 0.58 ? 'centred' : l <= 0.72 ? 'good' : 'far',
    side: ex => (ex >= 0.27 && ex <= 0.40) || (ex >= 0.60 && ex <= 0.73),
    centre: m => m.ex >= 0.42 && m.ex <= 0.58 && m.ey >= 0.42 && m.ey <= 0.58
  };
  T.band.power = m => T.band.side(m.ex) && T.band.eyes(m.ey) === 'third';
  const MSG = T.framingMessages = {
    tooWide: 'This is too wide. Zoom in until the frame runs from the chest to just above the head.',
    tooTight: 'Too tight. Zoom out until you can see the chest.',
    eyesLow: 'The eyes are below the top line. Raise the head in the frame.',
    eyesHigh: 'The eyes are above the top line. Lower the head a little.',
    hrLoose: 'There is a big gap above the head. Bring the head up toward the top of the frame.',
    hrTight: 'The head is touching or leaving the top of the frame. Leave a little space.',
    lrCrowded: 'The empty space is behind the head. Slide the subject back so the space is in front of the face.',
    lrCentred: 'The subject is centred. Slide them back a little so there is more space in front of the face.',
    lrFar: 'Too far. The back of the head is against the edge. Ease the subject toward the middle.',
    side: 'The subject is still in the middle. Slide the picture until the face sits on a side line.'
  };
  // Standard checks, in a fixed order; returns the first problem or null. list: 'chest', 'eyes', 'side', 'headroom', 'lead'.
  T.framingCheck = (m, list) => {
    const has = k => list.indexOf(k) >= 0;
    if (has('chest')) { const s = T.band.size(m.size); if (s === 'wide' || s === 'medium') return MSG.tooWide; if (s === 'close') return MSG.tooTight; }
    if (has('eyes')) { const e = T.band.eyes(m.ey); if (e === 'low') return MSG.eyesLow; if (e === 'high') return MSG.eyesHigh; }
    if (has('side') && !T.band.side(m.ex)) return MSG.side;
    if (has('headroom')) { const h = T.band.headroom(m.headroom); if (h === 'loose') return MSG.hrLoose; if (h === 'tight') return MSG.hrTight; }
    if (has('lead')) { const l = T.band.lead(m.lead); if (l === 'crowded') return MSG.lrCrowded; if (l === 'centred') return MSG.lrCentred; if (l === 'far') return MSG.lrFar; }
    return null;
  };
  // Shot-size style judge (v1 Shot Sizes 6.4): min width, then must-see regions, then max width.
  T.regionJudge = o => m => {
    if (o.minFrac && m.frac < o.minFrac) return o.tooTight;
    const out = (o.must || []).filter(x => !m.inside(x.r));
    if (out.length) { const names = out.map((x, i) => i ? x.name.charAt(0).toLowerCase() + x.name.slice(1) : x.name); return names.join(' and ') + (out.length > 1 ? ' are' : ' is') + ' not fully in the frame. Move the camera, or zoom out a little.'; }
    if (o.maxFrac && m.frac > o.maxFrac) return o.tooWide;
    return null;
  };
  // Resolve a frame given as [x, y, w], { recipe: [size, lead, ey] } or 'whole'.
  function resolve(fm, spec) {
    if (!spec || spec === 'whole') return fm.clamp({ x: 0, y: 0, w: fm.W });
    if (spec.recipe) return fm.recipe.apply(null, spec.recipe);
    return fm.clamp(toF(spec));
  }
  T.resolveFrame = (id, mirror, spec, minFrac) => toA(resolve(T.frameMath(id, mirror, minFrac), spec));

  /* ================================================================== Viewfinder (v1 F7) */
  // opts: media, mirror, frame, minFrac, grid (bool), gridToggle, zones ([{label, upTo}] widest first, or null), lockZoom,
  //       guides (fn(m) → HTML string of overlays in %), onChange(m), debug landmarks shown with ?debug=1.
  T.viewfinder = opts => {
    let fm = T.frameMath(opts.media, opts.mirror, opts.minFrac);
    const LOG = () => Math.log(fm.MIN_W / fm.W);
    const toSlider = w => Math.round(1000 * Math.log(w / fm.W) / LOG()), fromSlider = v => fm.W * Math.exp(LOG() * v / 1000);
    const img = el('img', { alt: '', draggable: 'false' });
    const badge = el('span', { className: 'vf-badge', hidden: true });
    const grid = el('div', { className: 'vf-grid', hidden: !opts.grid }, el('i', { className: 'v1' }), el('i', { className: 'v2' }), el('i', { className: 'h1' }), el('i', { className: 'h2' }));
    const guides = el('div', { className: 'vf-guides', 'aria-hidden': 'true' });
    const flashEl = el('span', { className: 'vf-flash' });
    const monitor = el('div', { className: 'vf-monitor', tabindex: '0', role: 'group', 'aria-label': opts.lockZoom ? 'Camera view. Drag to pan and tilt the camera, or use the arrow keys.' : 'Camera view. Drag to move the frame, or use the arrow keys. Plus and minus zoom.' },
      img, grid, guides, el('span', { className: 'vf-live' }, el('i'), 'LIVE'), badge,
      el('span', { className: 'vf-corner tl' }), el('span', { className: 'vf-corner tr' }), el('span', { className: 'vf-corner bl' }), el('span', { className: 'vf-corner br' }), flashEl);
    const slider = el('input', { type: 'range', min: '0', max: '1000', step: '1', 'aria-label': 'Zoom' });
    const zones = el('div', { className: 'vf-zones', 'aria-hidden': 'true' });
    const zoomRow = el('div', { className: 'vf-zoom', hidden: !!opts.lockZoom },
      T.button('−', () => zoomTo(frame.w * 1.25), 'vf-zbtn'), el('div', { className: 'vf-track' }, slider, zones), T.button('+', () => zoomTo(frame.w * 0.8), 'vf-zbtn'));
    zoomRow.querySelectorAll('.vf-zbtn')[0].setAttribute('aria-label', 'Zoom out');
    zoomRow.querySelectorAll('.vf-zbtn')[1].setAttribute('aria-label', 'Zoom in');
    const help = el('p', { className: 'vf-help', text: opts.lockZoom ? 'Drag the picture to pan and tilt the camera.' : 'Drag the picture to move the camera. Use the slider to zoom.' });
    const mapImg = el('img', { alt: '', draggable: 'false' });
    const mapFrame = el('span', { className: 'vf-map-frame' }), mapHint = el('span', { className: 'vf-map-hint', hidden: true });
    const map = el('div', { className: 'vf-map', tabindex: '0', role: 'group', 'aria-label': 'The whole scene. Click or drag to move the frame, or use the arrow keys.' }, mapImg, mapHint, mapFrame);
    const dbg = el('div', { className: 'debug-panel', hidden: !T.DEBUG });
    let frame = resolve(fm, opts.frame), anim = 0;

    function drawZones() {
      if (!opts.zones) { zones.innerHTML = '<span class="plain">Wider</span><span class="plain end">Closer</span>'; return; }
      const stops = [0].concat(opts.zones.slice(0, -1).map(z => Math.log(z.upTo) / LOG()), [1]);
      zones.innerHTML = opts.zones.map((z, i) => '<span data-zone="' + i + '" style="flex:' + (stops[i + 1] - stops[i]) + '">' + z.label + '</span>').join('');
    }
    function place(node, f) { const h = f.w / RATIO; Object.assign(node.style, { left: f.x / fm.W * 100 + '%', top: f.y / fm.H * 100 + '%', width: f.w / fm.W * 100 + '%', height: Math.min(h, fm.H) / fm.H * 100 + '%' }); }
    function crop(f) { Object.assign(img.style, { width: fm.W / f.w * 100 + '%', left: -f.x / f.w * 100 + '%', top: -f.y / (f.w / RATIO) * 100 + '%' }); }
    function setScene(id, mirror, start) {
      cancelAnimationFrame(anim);
      fm = T.frameMath(id, mirror, opts.minFrac);
      const src = T.mediaURL(fm.rec);
      if (img.getAttribute('src') !== src) { img.src = src; mapImg.src = src; }
      img.style.transform = mapImg.style.transform = mirror ? 'scaleX(-1)' : '';
      mapImg.alt = fm.rec.alt || '';
      mapHint.hidden = true;
      drawZones();
      if (start !== undefined) frame = resolve(fm, start); else frame = fm.clamp(frame);
      render();
    }
    function render() {
      crop(frame); place(mapFrame, frame);
      slider.value = toSlider(frame.w);
      const m = fm.measure(frame);
      if (opts.zones) { const i = opts.zones.findIndex(z => m.frac >= (z.upTo || 0)); zones.querySelectorAll('span').forEach((s, k) => s.classList.toggle('on', k === i)); m.zone = i; }
      guides.innerHTML = (opts.guides ? opts.guides(m) : '') + (T.DEBUG ? debugDots(m) : '');
      if (T.DEBUG) dbg.textContent = 'frame ' + toA(frame).join(', ') + (m.size != null ? ' · size ' + m.size.toFixed(2) + ' · ex ' + m.ex.toFixed(2) + ' · ey ' + m.ey.toFixed(2) + ' · headroom ' + m.headroom.toFixed(2) + ' · lead ' + m.lead.toFixed(2) : ' · frac ' + m.frac.toFixed(2));
      if (opts.onChange) opts.onChange(m, api);
    }
    function debugDots(m) {
      if (m.size == null) return '';
      const h = frame.w / RATIO, pt = (x, y, label) => '<span class="vf-dbg" style="left:' + ((x - frame.x) / frame.w * 100) + '%;top:' + ((y - frame.y) / h * 100) + '%">' + label + '</span>';
      return pt(m.eyesX, m.eyesY, 'eyes') + pt(m.headTopX, m.headTopY, 'top');
    }
    function set(f, animate) {
      cancelAnimationFrame(anim);
      const target = fm.clamp(f);
      if (!animate || reduced()) { frame = target; render(); return; }
      const from = frame, t0 = performance.now();
      const step = now => {
        let t = Math.min(1, (now - t0) / 520);
        t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const w = Math.exp(Math.log(from.w) + (Math.log(target.w) - Math.log(from.w)) * t);
        const cx = from.x + from.w / 2 + (target.x + target.w / 2 - from.x - from.w / 2) * t;
        const cy = from.y + from.w / RATIO / 2 + (target.y + target.w / RATIO / 2 - from.y - from.w / RATIO / 2) * t;
        frame = t === 1 ? target : fm.clamp({ w, x: cx - w / 2, y: cy - w / RATIO / 2 });
        render();
        if (t < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    function zoomTo(w) { if (opts.lockZoom) return; const cx = frame.x + frame.w / 2, cy = frame.y + frame.w / RATIO / 2; w = Math.min(fm.W, Math.max(fm.MIN_W, w)); set({ w, x: cx - w / 2, y: cy - w / RATIO / 2 }); }
    slider.addEventListener('pointerdown', () => cancelAnimationFrame(anim));
    slider.addEventListener('input', () => zoomTo(fromSlider(+slider.value)));
    let drag = null;
    monitor.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button !== 0) return;
      cancelAnimationFrame(anim); monitor.focus({ preventScroll: true });
      drag = { id: e.pointerId, px: e.clientX, py: e.clientY, x: frame.x, y: frame.y, w: frame.w };
      monitor.setPointerCapture(e.pointerId); monitor.classList.add('dragging');
    });
    monitor.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const k = drag.w / monitor.clientWidth; set({ w: drag.w, x: drag.x - (e.clientX - drag.px) * k, y: drag.y - (e.clientY - drag.py) * k }); });
    const endDrag = () => { drag = null; monitor.classList.remove('dragging'); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => monitor.addEventListener(n, endDrag));
    function keys(e) {
      const s = frame.w * 0.06, mv = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
      if (mv) { set({ w: frame.w, x: frame.x + mv[0], y: frame.y + mv[1] }); e.preventDefault(); }
      else if (e.key === '+' || e.key === '=') { zoomTo(frame.w * 0.85); e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { zoomTo(frame.w * 1.18); e.preventDefault(); }
    }
    monitor.addEventListener('keydown', keys); map.addEventListener('keydown', keys);
    let mp = null;
    const mapMove = e => { const b = map.getBoundingClientRect(); const cx = (e.clientX - b.left) / b.width * fm.W, cy = (e.clientY - b.top) / b.height * fm.H; set({ w: frame.w, x: cx - frame.w / 2, y: cy - frame.w / RATIO / 2 }); };
    map.addEventListener('pointerdown', e => { if (!e.isPrimary || e.button !== 0) return; mp = e.pointerId; map.focus({ preventScroll: true }); map.setPointerCapture(e.pointerId); mapMove(e); });
    map.addEventListener('pointermove', e => { if (mp === e.pointerId) mapMove(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => map.addEventListener(n, () => { mp = null; }));
    flashEl.addEventListener('animationend', () => flashEl.classList.remove('go'));

    const api = {
      el: el('div', { className: 'vf' }, monitor, zoomRow, help, dbg), map,
      get frame() { return Object.assign({}, frame); },
      get math() { return fm; },
      measure: () => fm.measure(frame),
      set: (spec, animate) => set(resolve(fm, spec), animate),
      setScene,
      setBadge: t => { badge.hidden = !t; badge.textContent = t || ''; },
      setGrid: on => { grid.hidden = !on; },
      get gridOn() { return !grid.hidden; },
      showHint: spec => { mapHint.hidden = !spec; if (spec) place(mapHint, resolve(fm, spec)); },
      flash: () => { flashEl.classList.remove('go'); if (reduced()) return; void flashEl.offsetWidth; flashEl.classList.add('go'); },
      refresh: render
    };
    setScene(opts.media, opts.mirror, opts.frame);
    return api;
  };

  // A small ✓ / ✕ list that updates live.
  function liveChecks(items) {
    const ul = el('ul', { className: 'checks' });
    const lis = items.map(it => { const li = el('li', { text: it.label }); ul.append(li); return li; });
    return { el: ul, update: m => items.forEach((it, i) => { const ok = !!it.test(m); lis[i].className = ok ? 'ok' : 'no'; }) };
  }
  // A task list whose items tick once and stay ticked.
  function taskList(items, onAll) {
    const ul = el('ul', { className: 'checks' }), done = items.map(() => false);
    const lis = items.map(it => { const li = el('li', { text: it.label }); ul.append(li); return li; });
    let finished = false;
    return { el: ul, done, update: (m, ctx) => { items.forEach((it, i) => { if (!done[i] && it.test(m, ctx)) { done[i] = true; lis[i].className = 'ok'; } }); if (!finished && done.every(Boolean)) { finished = true; if (onAll) onAll(); } }, count: () => done.filter(Boolean).length };
  }

  /* ---------------------------------------------------------------- Block: viewfinder (Explore) */
  // b: media, mirror, frame, minFrac, grid, gridToggle, mirrorToggle {label}, zones, lockZoom,
  //    presets [{label, sub, frame}], states (fn(m) → {key, title, text}), badge (fn(m) → text), indicators [{label, test}],
  //    tasks [{label, test(m, ctx)}], doneText, guides: 'headroom' | fn, leadBar (bool), tip (html), caption.
  T.blocks.viewfinder = b => {
    const info = el('div', { className: 'card vf-info', 'aria-live': 'polite' });
    const ind = b.indicators ? liveChecks(b.indicators) : null;
    const progress = el('p', { className: 'vf-progress', 'aria-live': 'polite' });
    const tasks = b.tasks ? taskList(b.tasks, () => { progress.innerHTML = T.rich(b.doneText || 'All done.'); progress.classList.add('done'); }) : null;
    const bar = b.leadBar ? leadBar() : null;
    let lastKey = null;
    const presetBtns = (b.presets || []).map(p => { const btn = el('button', { type: 'button', className: 'vf-preset' }, el('strong', { text: p.label }), p.sub ? el('span', { text: p.sub }) : null); btn.addEventListener('click', () => vf.set(p.frame, true)); return btn; });
    const ctx = { grid: !!b.grid, mirrored: !!b.mirror };
    const vf = T.viewfinder({ media: b.media, mirror: b.mirror, frame: b.frame, minFrac: b.minFrac, grid: b.grid, zones: b.zones, lockZoom: b.lockZoom,
      guides: b.guides === 'headroom' ? headroomGuide : b.guides === 'power' ? powerDot : b.guides,
      onChange: (m, api) => {
        ctx.grid = api ? api.gridOn : ctx.grid;
        if (b.states) { const s = b.states(m); if (s.key !== lastKey) { lastKey = s.key; info.replaceChildren(el('p', { className: 'label', text: s.label || 'In the viewfinder' }), el('h3', { text: s.title }), T.html(s.text)); presetBtns.forEach((btn, i) => { const on = b.presets[i].key === s.key; btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); if (on) btn.classList.add('seen'); }); } }
        if (b.badge && api) api.setBadge(b.badge(m));
        if (ind) ind.update(m);
        if (bar) bar.update(m);
        if (tasks) { tasks.update(m, ctx); if (!progress.classList.contains('done')) progress.textContent = (b.progressLabel || 'Tasks done') + ': ' + tasks.count() + ' of ' + b.tasks.length + '.'; }
      } });
    const extra = [];
    if (b.gridToggle) { const g = T.button(b.grid ? 'Grid: on' : 'Grid: off', () => { const on = !vf.gridOn; vf.setGrid(on); g.textContent = on ? 'Grid: on' : 'Grid: off'; g.setAttribute('aria-pressed', String(on)); vf.refresh(); }, 'small'); g.setAttribute('aria-pressed', String(!!b.grid)); extra.push(g); }
    if (b.mirrorToggle) extra.push(T.button(b.mirrorToggle.label || 'Turn the subject around', () => { ctx.mirrored = !ctx.mirrored; const f = vf.frame; vf.setScene(b.media, ctx.mirrored, [f.x, f.y, f.w]); if (tasks) tasks.update(vf.measure(), Object.assign({ turned: true }, ctx)); }, 'small'));
    const right = [
      presetBtns.length ? el('div', { className: 'vf-presets' }, presetBtns) : null,
      extra.length ? el('div', { className: 'actions' }, extra) : null,
      b.states ? info : null,
      bar ? bar.el : null,
      ind ? T.card(b.indicatorTitle || 'In this frame', ind.el) : null,
      tasks ? T.card('Try these', tasks.el) : null,
      b.tip ? T.card('', b.tip, 'warm') : null,
      T.card('The whole scene', vf.map)
    ];
    vf.refresh();
    return { el: el('div', {}, T.stage(el('div', {}, vf.el, tasks ? progress : null), right), b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), wide: true, interactive: true, printNote: 'Camera activity: open this topic online to try it.' };
  };
  // Head room guide (spec 3.5): a bracket from the top of the frame to the top of the head.
  function headroomGuide(m) {
    if (m.size == null) return '';
    const left = (m.headTopX - m.f.x) / m.f.w * 100;
    if (m.headroom < 0) return '<span class="vf-hr cut" style="left:' + left + '%">Head cut off</span>';
    const ok = T.band.headroom(m.headroom) === 'good';
    return '<span class="vf-hr' + (ok ? ' ok' : '') + '" style="left:' + left + '%;height:' + (m.headroom * 100) + '%"><b>Head room</b></span>';
  }
  function powerDot(m) {
    if (m.size == null || !T.band.power(m)) return '';
    return '<span class="vf-power" style="left:' + (m.ex < 0.5 ? 33.33 : 66.67) + '%;top:33.33%"></span>';
  }
  // Looking room bar (spec 3.6).
  function leadBar() {
    const front = el('span', { className: 'front' }), back = el('span', { className: 'back' }), bar = el('div', { className: 'lead-bar' });
    const card = T.card('Space around the face', bar);
    return { el: card, update: m => {
      if (m.size == null) return;
      const ex = Math.max(0, Math.min(1, m.ex)), inFront = Math.round(m.lead * 100);
      front.textContent = 'In front ' + Math.max(0, Math.min(100, inFront)) + '%'; back.textContent = 'Behind ' + Math.max(0, Math.min(100, 100 - inFront)) + '%';
      if (m.gaze === 'right') { back.style.flex = String(ex); front.style.flex = String(1 - ex); bar.replaceChildren(back, front); }
      else { front.style.flex = String(ex); back.style.flex = String(1 - ex); bar.replaceChildren(front, back); }
    } };
  }

  /* ---------------------------------------------------------------- Block: framing-challenge (Practice, v1 F9) */
  // b: briefs [{ media, mirror, start ([x,y,w] | {recipe} | 'whole' | omitted = keep), brief, judge(m) → message | null,
  //            success, hint (frame spec), tag, grid (bool), gridToggle (bool) }], action, closing, zones.
  T.blocks['framing-challenge'] = b => {
    const first = b.briefs[0];
    const vf = T.viewfinder({ media: first.media, mirror: first.mirror, frame: first.start, minFrac: b.minFrac, grid: !!first.grid, guides: b.guides });
    const strip = el('div', { className: 'film-strip' });
    const card = el('div', { className: 'card brief' });
    const results = [];
    let index = 0, misses = 0;
    const gridBtn = T.button('Grid: off', () => { const on = !vf.gridOn; vf.setGrid(on); gridBtn.textContent = on ? 'Grid: on' : 'Grid: off'; }, 'small');
    function drawStrip() {
      strip.replaceChildren(...b.briefs.map((br, i) => {
        const r = results[i];
        const slot = el('div', { className: 'slot' + (i === index && index < b.briefs.length ? ' current' : '') + (r ? ' filled' : '') });
        if (r) { const c = T.crop(T.mediaRecord(r.media), r.frame, r.mirror); c.classList.add('slot-crop'); slot.append(c, el('span', { className: 'slot-tag', text: br.tag || ('Shot ' + (i + 1)) })); }
        else slot.append(el('span', { className: 'slot-num', text: String(i + 1) }));
        return slot;
      }));
    }
    function start(i) {
      index = i; misses = 0;
      const br = b.briefs[i];
      vf.setScene(br.media, br.mirror, br.start === undefined ? undefined : br.start);
      vf.setGrid(!!br.grid); gridBtn.textContent = br.grid ? 'Grid: on' : 'Grid: off';
      const fb = el('div', { 'aria-live': 'polite' });
      const hintBtn = T.button('Show me a hint', () => { vf.showHint(br.hint); T.feedback(fb, 'Look at the small map. The dashed box shows one framing that works.', false); }, 'small'); hintBtn.hidden = true;
      const next = T.button(i === b.briefs.length - 1 ? 'Finish →' : 'Next shot →', () => i === b.briefs.length - 1 ? wrap() : start(i + 1), 'primary'); next.hidden = true;
      const take = T.button(b.action || 'Take the shot', () => {
        vf.flash();
        const m = vf.measure(), msg = br.judge(m);
        if (msg) { misses++; T.feedback(fb, msg, false); if (misses >= 2 && br.hint) hintBtn.hidden = false; return; }
        results[i] = { media: br.media, mirror: !!br.mirror, frame: toA(vf.frame) };
        T.feedback(fb, '<strong>Got it.</strong> ' + br.success, true);
        take.hidden = true; hintBtn.hidden = true; vf.showHint(null); next.hidden = false; next.focus(); drawStrip();
      }, 'primary take');
      card.replaceChildren(el('p', { className: 'label', text: 'Shot ' + (i + 1) + ' of ' + b.briefs.length + ' · The director says' }), el('p', { className: 'quote', html: '“' + T.rich(br.brief) + '”' }),
        take, fb, el('div', { className: 'actions' }, br.gridToggle ? gridBtn : null, hintBtn), next);
      drawStrip();
    }
    function wrap() {
      index = b.briefs.length; drawStrip();
      card.replaceChildren(el('p', { className: 'label', text: 'That’s a wrap' }), el('p', { className: 'quote', html: T.rich(b.closing || 'Every shot framed.') }), el('div', { className: 'actions' }, T.button('Go again', () => { results.length = 0; start(0); })));
    }
    start(0);
    return { el: T.stage(el('div', {}, vf.el, strip), [card, T.card('The whole scene', vf.map)]), wide: true, interactive: true, printNote: 'Framing challenge: open this topic online to try it.' };
  };

  /* ================================================================== Slider demo, hotspots */
  // A lesson, print question and simulator all use the coordinates of the same render.
  const fullCameraView = { x: 0, y: 0, w: 100, h: 100 };
  function plateCrop(view, name) {
    if (name === 'top' && view?.bodyCrop) return view.bodyCrop;
    return view?.defaultCrop || fullCameraView;
  }
  function markOnPlate(box, view, name) {
    if (!box) return null;
    const crop = plateCrop(view, name);
    return {
      x: (box.x + box.w / 2 - crop.x) * 100 / crop.w,
      y: (box.y + box.h / 2 - crop.y) * 100 / crop.h
    };
  }
  T.cameraPlate = (b, print) => {
    const view = window.TEXTBOOK_CAMERA_BODIES?.[b.body]?.views[b.view];
    const base = view && T.mediaRecord(view.media);
    if (!base) return el('p', { className: 'muted', text: b.alt || 'Camera view unavailable.' });
    const source = print && view.print && T.mediaRecord(view.print) || base;
    T.mediaUsed.add(view.media);
    const crop = plateCrop(view, b.view);
    const img = el('img', { src: T.mediaURL(source), alt: b.alt || base.alt, loading: print ? 'eager' : 'lazy' });
    Object.assign(img.style, { width: 10000 / crop.w + '%', left: -100 * crop.x / crop.w + '%', top: -100 * crop.y / crop.h + '%' });
    const pic = el('div', { className: 'camera-plate', style: 'aspect-ratio:' + (view.aspect * crop.w / crop.h) }, img);
    for (const point of b.labels || []) {
      const center = markOnPlate(view.controls[point.control], view, b.view);
      if (!center) continue;
      pic.append(el('span', { className: 'camera-plate-mark', 'aria-hidden': 'true',
        style: 'left:' + center.x + '%;top:' + center.y + '%', text: point.label }));
    }
    return pic;
  };
  function visual(v) {
    if (!v) return null;
    if (v.body && v.view) return T.cameraPlate(v);
    if (v.svg) return T.svg(v.svg, 'illus', v.alt);
    return T.media({ id: v.media || v.id, crop: v.crop, mirror: v.mirror, alt: v.alt, filter: v.filter, t: v.t });
  }
  T.visual = visual;
  // b: stops [{label, note, svg | media/crop/filter}], control: 'slider' | 'buttons', label, value, ends [left, right], caption.
  T.blocks['slider-demo'] = b => {
    const stage = el('div', { className: 'demo-stage' });
    const note = el('div', { className: 'card demo-note', 'aria-live': 'polite' });
    let i = b.value || 0, ctrl;
    const nodes = b.stops.map(visual);
    function show() {
      stage.replaceChildren(nodes[i]);
      const s = b.stops[i];
      note.replaceChildren(el('p', { className: 'label', text: b.noteLabel || (b.label || 'Setting') }), el('h3', { text: s.label }), s.note ? T.html(s.note) : null);
      if (ctrl.tagName === 'INPUT') { ctrl.value = String(i); out.textContent = s.label; } else ctrl.querySelectorAll('button').forEach((x, k) => { x.classList.toggle('selected', k === i); x.setAttribute('aria-pressed', String(k === i)); });
    }
    const out = el('output');
    if (b.control === 'buttons') ctrl = el('div', { className: 'chips', role: 'group', 'aria-label': b.label || 'Choose' }, b.stops.map((s, k) => { const x = el('button', { type: 'button', className: 'chip', text: s.short || s.label }); x.addEventListener('click', () => { i = k; show(); }); return x; }));
    else { ctrl = el('input', { type: 'range', min: '0', max: String(b.stops.length - 1), step: '1', 'aria-label': b.label || 'Setting' }); ctrl.addEventListener('input', () => { i = Number(ctrl.value); show(); }); }
    const controls = b.control === 'buttons' ? ctrl : el('div', { className: 'slider-row' }, el('label', {}, b.label || 'Setting', out), ctrl, b.ends ? el('div', { className: 'slider-ends' }, el('span', { text: b.ends[0] }), el('span', { text: b.ends[1] })) : null);
    show();
    return { el: el('div', {}, T.stage(el('div', { className: 'player' }, stage, controls), [note].concat(b.side ? [T.card(b.side.title || '', b.side.html, b.side.warm ? 'warm' : '')] : [])), b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), wide: true, interactive: true, printNote: 'Slider activity: open this topic online to try it.' };
  };
  // b: svg | media, points [{x, y (percent), label, text}], prompt.
  T.blocks.hotspots = b => {
    if (b.cameras) {
      const choices = el('select', { 'aria-label': 'Camera guide' });
      const sides = el('select', { 'aria-label': 'Camera view' });
      const content = el('div');
      function showView() {
        const guide = b.cameras[choices.value];
        const current = guide.views[sides.value];
        content.replaceChildren(T.blocks.hotspots({ ...current, body: choices.value, view: sides.value }).el);
      }
      function showCamera() {
        const guide = b.cameras[choices.value];
        sides.replaceChildren(...Object.entries(guide.views).map(([id, data]) => el('option', { value: id, text: data.name })));
        showView();
      }
      for (const [id, guide] of Object.entries(b.cameras)) choices.append(el('option', { value: id, text: guide.name }));
      choices.addEventListener('change', showCamera);
      sides.addEventListener('change', showView);
      showCamera();
      return { el: el('div', {}, el('div', { className: 'camera-hotspot-choices' },
        el('label', {}, 'Camera ', choices), el('label', {}, 'View ', sides)), content), wide: true, interactive: true };
    }
    const pic = el('div', { className: 'hot-pic' }, visual(b));
    const info = el('div', { className: 'card', 'aria-live': 'polite' }, el('p', { className: 'label', text: 'Tap a number' }), el('p', { html: T.rich(b.prompt || 'Each number marks a part. Tap one to learn what it does.') }));
    const seen = new Set(), count = el('p', { className: 'hint-line' });
    const btns = b.points.map((p, i) => {
      const view = window.TEXTBOOK_CAMERA_BODIES?.[b.body]?.views[b.view];
      const box = p.control === 'lcd' ? view?.lcd : view?.controls?.[p.control];
      const { x, y } = markOnPlate(box, view, b.view) || p;
      const placed = Number.isFinite(x) && Number.isFinite(y);
      const btn = el('button', { type: 'button', className: placed ? 'hot-dot' : 'button small',
        style: placed ? 'left:' + x + '%;top:' + y + '%' : null,
        'aria-label': (i + 1) + ': ' + p.label, text: placed ? String(i + 1) : p.label });
      btn.addEventListener('click', () => {
        btns.forEach(x => x.classList.toggle('on', x === btn)); seen.add(i); btn.classList.add('seen');
        info.replaceChildren(el('p', { className: 'label', text: (i + 1) + ' of ' + b.points.length }), el('h3', { text: p.label }), T.html(p.text));
        count.textContent = seen.size === b.points.length ? 'You found every part.' : 'Parts found: ' + seen.size + ' of ' + b.points.length + '.';
      });
      pic.append(btn); return btn;
    });
    count.textContent = 'Parts found: 0 of ' + b.points.length + '.';
    return { el: el('div', {}, T.stage(el('div', {}, pic, count), [info]), b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), wide: true, interactive: true, printNote: 'Labelled picture: open this topic online to explore it.' };
  };

  /* ================================================================== Drawings for Part 3 (inline SVG, no media needed) */
  const D = T.draw;
  const INK = '#171b1f', MUTED = '#5d6469', COBALT = '#3157c8', ORANGE = '#b86533', SKIN = '#e9c6a5', HAIR = '#2b2420', WALL = '#f3f1ec', FLOOR = '#e7e3d8';
  const svg = (inner, vb) => '<svg viewBox="' + (vb || '0 0 320 180') + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  const txt = (x, y, s, o) => '<text x="' + x + '" y="' + y + '" font-family="Inter,sans-serif" font-size="' + ((o && o.size) || 11) + '" font-weight="' + ((o && o.weight) || 700) + '" fill="' + ((o && o.fill) || MUTED) + '"' + (o && o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + '>' + s + '</text>';
  D.svg = svg; D.txt = txt;

  // A mirrorless camera seen from the back, for hotspots.
  D.cameraBack = () => svg(
    '<rect width="320" height="180" fill="#eef0ee"/>' +
    '<rect x="40" y="38" width="240" height="120" rx="16" fill="#2a2f35"/><rect x="62" y="22" width="70" height="24" rx="6" fill="#2a2f35"/>' +
    '<rect x="70" y="56" width="140" height="82" rx="6" fill="#0e1114"/><rect x="76" y="62" width="128" height="70" rx="3" fill="#3d5468"/>' +
    '<rect x="82" y="68" width="22" height="9" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="84" y="70" width="12" height="5" fill="#9fe0b4"/><rect x="104" y="70.5" width="2" height="4" fill="#fff"/>' +
    txt(176, 76, '[128]', { fill: '#fff', size: 9 }) + '<circle cx="190" cy="124" r="4" fill="#e04b3a"/>' + txt(150, 127, 'REC', { fill: '#fff', size: 8 }) +
    '<circle cx="246" cy="74" r="13" fill="#3a4047"/><circle cx="246" cy="74" r="5" fill="#e04b3a"/>' +
    '<circle cx="246" cy="112" r="16" fill="#3a4047"/><circle cx="246" cy="112" r="6" fill="#2a2f35"/>' +
    '<rect x="276" y="70" width="10" height="44" rx="3" fill="#20252a"/><rect x="160" y="158" width="24" height="6" rx="2" fill="#20252a"/>');
  // A phone camera screen in record mode.
  D.phoneScreen = () => svg(
    '<rect width="320" height="180" fill="#eef0ee"/><rect x="48" y="30" width="224" height="124" rx="18" fill="#171b1f"/><rect x="58" y="40" width="204" height="104" rx="10" fill="#4b6a7f"/>' +
    '<circle cx="245" cy="92" r="13" fill="#fff"/><circle cx="245" cy="92" r="9" fill="#e04b3a"/>' + txt(74, 56, '00:00', { fill: '#fff', size: 10 }) +
    '<rect x="70" y="122" width="20" height="9" rx="2" fill="none" stroke="#fff" stroke-width="1.4"/><rect x="72" y="124" width="7" height="5" fill="#ffd24a"/>' + txt(96, 130, '1x', { fill: '#fff', size: 9 }) +
    '<rect x="140" y="74" width="40" height="36" fill="none" stroke="#ffd24a" stroke-width="1.6"/>');
  // A simplified G97 recording display for the printed and on-page readiness questions.
  D.cameraStatus = s => {
    const battery = s.battery ?? .8;
    const blocks = Math.max(1, Math.ceil(4 * battery));
    const color = battery <= .15 ? '#ff776d' : '#fff';
    const batteryIcon = '<rect x="232" y="33" width="28" height="12" rx="2" fill="#172126" stroke="' + color +
      '" stroke-width="2"/><rect x="261" y="36" width="3" height="6" fill="' + color + '"/>' +
      Array.from({ length: blocks }, (_, i) => '<rect x="' + (235 + i * 6) + '" y="36" width="4" height="6" fill="' + color + '"/>').join('');
    const picture = s.cap ? '' : '<rect x="40" y="26" width="240" height="128" fill="#708a98"/><rect x="40" y="110" width="240" height="44" fill="#8e7d69"/>' + D.person(154, 77, .8, 'right', COBALT);
    const time = s.card === 'full' ? 'R0m00s' : s.card === 'none' ? '----' : s.timeLeft || 'R8m30s';
    return svg('<rect width="320" height="180" fill="#22292d"/>' + picture +
      txt(49, 45, 'iA   FHD 30p', { fill: '#fff', size: 12, weight: 700 }) + batteryIcon +
      '<rect x="204" y="132" width="70" height="18" rx="2" fill="#293338"/>' +
      txt(269, 146, time, { fill: '#fff', size: 12, anchor: 'end' }) +
      (s.rec ? '<circle cx="267" cy="55" r="4" fill="#ea3931"/>' + txt(49, 61, '12s', { fill: '#fff', size: 11 }) : ''));
  };
  // A recorded take as a thumbnail with its length and a sound meter. t: { kind: 'good' | 'none' | 'cut' | 'soft' | 'silent', len, n }.
  const uid = p => p + Math.random().toString(36).slice(2, 8);
  D.uid = uid;
  D.take = t => {
    const fid = uid('sf');
    const blur = t.kind === 'soft' ? '<filter id="' + fid + '"><feGaussianBlur stdDeviation="3.2"/></filter>' : '';
    const scene = '<g' + (t.kind === 'soft' ? ' filter="url(#' + fid + ')"' : '') + '><rect x="0" y="0" width="320" height="150" fill="' + WALL + '"/><rect y="110" width="320" height="40" fill="' + FLOOR + '"/>' +
      (t.kind === 'cut' ? D.person(300, 66, 1.05, 'right', COBALT) : D.person(160, 66, 1.05, 'right', COBALT)) + '<rect x="200" y="94" width="70" height="16" rx="3" fill="#c9a77c"/></g>';
    const body = t.kind === 'none' ? '<rect width="320" height="150" fill="#0e1114"/>' + txt(160, 80, 'No file. The camera never recorded.', { fill: '#c9ccd0', size: 12, anchor: 'middle' }) : scene;
    let bars = '';
    for (let k = 0; k < 40; k++) { const hgt = t.kind === 'silent' || t.kind === 'none' ? 1 : 3 + Math.abs(Math.sin(k * 1.7 + (t.n || 1))) * 12; bars += '<rect x="' + (12 + k * 5.2) + '" y="' + (166 - hgt / 2) + '" width="3" height="' + hgt + '" fill="' + (t.kind === 'silent' ? '#c9ccd0' : COBALT) + '"/>'; }
    return svg('<defs>' + blur + '</defs>' + body + '<rect y="150" width="320" height="30" fill="#fff"/>' + bars + txt(308, 170, t.len || '0:08', { fill: INK, size: 11, anchor: 'end' }) + txt(232, 170, 'sound', { size: 9 }));
  };
  // Five camera angles of the same person. kind: 'eye' | 'high' | 'low' | 'bird' | 'dutch'.
  D.angle = kind => {
    const person = (x, y, s, bodyScale, headScale) => {
      const r = 18 * s * headScale, bw = 64 * s, bh = 92 * s * bodyScale;
      return '<path d="M' + (x - bw / 2) + ' ' + (y + r + bh) + ' Q' + (x - bw / 2) + ' ' + (y + r + 4) + ' ' + x + ' ' + (y + r + 2) + ' Q' + (x + bw / 2) + ' ' + (y + r + 4) + ' ' + (x + bw / 2) + ' ' + (y + r + bh) + 'Z" fill="' + COBALT + '"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + SKIN + '"/><path d="M' + (x - r) + ' ' + (y - 2) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + (y - 2) + ' Q' + x + ' ' + (y - r * 0.55) + ' ' + (x - r) + ' ' + (y - 2) + 'Z" fill="' + HAIR + '"/>' +
        '<circle cx="' + (x - r * 0.35) + '" cy="' + (y + r * 0.05) + '" r="' + (2.2 * s) + '" fill="' + INK + '"/><circle cx="' + (x + r * 0.35) + '" cy="' + (y + r * 0.05) + '" r="' + (2.2 * s) + '" fill="' + INK + '"/>';
    };
    if (kind === 'eye') return svg('<rect width="320" height="180" fill="' + WALL + '"/><rect y="120" width="320" height="60" fill="' + FLOOR + '"/><rect x="34" y="40" width="54" height="60" fill="#dfe8ef" stroke="#fff" stroke-width="4"/>' + person(160, 60, 1.25, 1, 1));
    if (kind === 'dutch') return svg('<g transform="rotate(-14 160 90)"><rect x="-60" y="-60" width="440" height="300" fill="' + WALL + '"/><rect x="-60" y="120" width="440" height="120" fill="' + FLOOR + '"/><rect x="34" y="40" width="54" height="60" fill="#dfe8ef" stroke="#fff" stroke-width="4"/>' + person(160, 60, 1.25, 1, 1) + '</g>');
    if (kind === 'high') return svg('<rect width="320" height="180" fill="' + FLOOR + '"/><path d="M0 0 H320 V28 H0z" fill="' + WALL + '"/><g stroke="#d8d2c4" stroke-width="2">' + [40, 80, 120, 160, 200, 240, 280].map(x => '<line x1="' + x + '" y1="28" x2="' + (160 + (x - 160) * 1.6) + '" y2="180"/>').join('') + '</g>' + person(160, 70, 1.25, 0.62, 1.35));
    if (kind === 'low') return svg('<rect width="320" height="180" fill="#dfe8ef"/><rect y="150" width="320" height="30" fill="' + FLOOR + '"/><g stroke="#e6edf2" stroke-width="3">' + [60, 130, 190, 260].map(x => '<line x1="' + x + '" y1="0" x2="' + (160 + (x - 160) * 0.6) + '" y2="150"/>').join('') + '</g>' + person(160, 44, 1.25, 1.45, 0.8));
    return svg('<rect width="320" height="180" fill="' + FLOOR + '"/><g stroke="#d8d2c4" stroke-width="2">' + [0, 40, 80, 120, 160, 200, 240, 280].map(x => '<line x1="' + x + '" y1="0" x2="' + x + '" y2="180"/>').join('') + [30, 70, 110, 150].map(y => '<line x1="0" y1="' + y + '" x2="320" y2="' + y + '"/>').join('') + '</g>' +
      '<ellipse cx="160" cy="98" rx="46" ry="26" fill="' + COBALT + '"/><circle cx="160" cy="94" r="20" fill="' + HAIR + '"/><rect x="186" y="118" width="44" height="12" rx="6" fill="#9aa0a4"/>');
  };
  // Side view: where the camera stands for each angle.
  D.angleSide = kind => {
    const cam = { eye: [60, 78, 0], high: [70, 26, 28], low: [62, 150, -26], bird: [160, 18, 90], dutch: [60, 78, 0] }[kind];
    const camIcon = '<g transform="translate(' + cam[0] + ' ' + cam[1] + ') rotate(' + cam[2] + ')"><rect x="-14" y="-9" width="22" height="18" rx="3" fill="' + INK + '"/><path d="M8 -6 L18 -11 V11 L8 6z" fill="' + INK + '"/></g>';
    return svg('<rect width="320" height="180" fill="#f4f5f3"/><rect y="166" width="320" height="14" fill="' + FLOOR + '"/>' +
      '<circle cx="200" cy="80" r="12" fill="' + SKIN + '"/><rect x="190" y="94" width="20" height="44" rx="6" fill="' + COBALT + '"/><rect x="192" y="136" width="7" height="30" fill="' + COBALT + '"/><rect x="201" y="136" width="7" height="30" fill="' + COBALT + '"/>' +
      '<line x1="' + cam[0] + '" y1="' + cam[1] + '" x2="200" y2="' + (kind === 'bird' ? 70 : 84) + '" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="5 4"/>' + camIcon);
  };

  /* ---------------------------------------------------------------- Layered scene for focus and depth of field */
  // A person at a table in a library: foreground mug, subject, background shelves. Each layer is blurred by how far it is
  // from the focus distance and by the aperture (a thin-lens approximation that keeps the right behaviour, not real optics).
  const FSTOPS = [1.8, 2.8, 4, 5.6, 8, 11, 16];
  T.fstops = FSTOPS;
  D.lensScene = (o) => {
    o = Object.assign({ focus: 2, fstop: 2.8, subject: 2, uid: 'l' + Math.random().toString(36).slice(2, 7) }, o);
    const depth = { fg: Math.max(0.6, o.subject * 0.4), subj: o.subject, bg: o.subject + 5 };
    const k = 46 / o.fstop;
    const blur = d => Math.min(9, k * Math.abs(1 / d - 1 / o.focus) * 1.6);
    const scale = 2 / o.subject; // a closer subject looks bigger
    const f = (id, d) => '<filter id="' + o.uid + id + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="' + blur(d).toFixed(2) + '"/></filter>';
    let shelves = '<rect width="320" height="180" fill="#e9e2d3"/>';
    for (let r = 0; r < 4; r++) { shelves += '<rect x="0" y="' + (14 + r * 34) + '" width="320" height="4" fill="#b9a27f"/>'; for (let c = 0; c < 26; c++) { const hue = ['#a8442a', '#3157c8', '#1f7a4d', '#b86533', '#6b5ca5', '#c9a227'][(c * 7 + r * 3) % 6]; shelves += '<rect x="' + (4 + c * 12.2) + '" y="' + (18 + r * 34) + '" width="9" height="' + (22 + ((c + r) % 3) * 3) + '" fill="' + hue + '" opacity=".75"/>'; } }
    const s = 1.35 * scale;
    const subj = '<g transform="translate(160 ' + (100 - 10 * (scale - 1)) + ') scale(' + s + ') translate(-160 -100)">' + D.person(160, 70, 1, 'right', COBALT) + '</g>';
    const table = '<rect x="0" y="140" width="320" height="40" fill="#c9a77c"/>';
    const mug = '<g transform="translate(46 112)"><rect x="0" y="0" width="44" height="54" rx="6" fill="#fff" stroke="#9aa0a4" stroke-width="2"/><path d="M44 12 q18 10 0 26" fill="none" stroke="#9aa0a4" stroke-width="5"/><rect x="0" y="16" width="44" height="10" fill="#ffd24a"/></g>';
    return svg('<defs>' + f('bg', depth.bg) + f('s', depth.subj) + f('fg', depth.fg) + '</defs>' +
      '<g filter="url(#' + o.uid + 'bg)">' + shelves + '</g>' + table + '<g filter="url(#' + o.uid + 's)">' + subj + '</g><g filter="url(#' + o.uid + 'fg)">' + mug + '</g>');
  };
  // b: controls ['focus'] or ['fstop', 'distance'], start values, caption.
  T.blocks['lens-sim'] = b => {
    const st = Object.assign({ focus: 2, fstop: 2.8, subject: 2 }, b.start || {});
    const stage = el('div', { className: 'demo-stage' }), note = el('div', { className: 'card demo-note', 'aria-live': 'polite' });
    const rows = [];
    const FOCUS = [{ v: 0.8, label: 'The mug (near)' }, { v: 2, label: 'The person (middle)' }, { v: 7, label: 'The shelves (far)' }];
    const mk = (label, n, val, fmt, on) => { const out = el('output', { text: fmt(val) }); const r = el('input', { type: 'range', min: '0', max: String(n - 1), step: '1', value: String(val), 'aria-label': label }); r.addEventListener('input', () => { out.textContent = fmt(Number(r.value)); on(Number(r.value)); draw(); }); rows.push(el('div', { className: 'slider-row' }, el('label', {}, label, out), r)); };
    if (b.controls.indexOf('focus') >= 0) { let fi = FOCUS.findIndex(x => x.v === st.focus); if (fi < 0) fi = 1; mk('Focus on', 3, fi, i => FOCUS[i].label, i => { st.focus = FOCUS[i].v; }); }
    if (b.controls.indexOf('fstop') >= 0) mk('Aperture (f-stop)', FSTOPS.length, FSTOPS.indexOf(st.fstop), i => 'f/' + FSTOPS[i], i => { st.fstop = FSTOPS[i]; });
    if (b.controls.indexOf('distance') >= 0) { const DIST = [1.2, 2, 3.5]; mk('Camera to subject', 3, DIST.indexOf(st.subject) < 0 ? 1 : DIST.indexOf(st.subject), i => ['Close', 'Medium', 'Far'][i], i => { st.subject = DIST[i]; if (b.controls.indexOf('focus') < 0) st.focus = DIST[i]; }); }
    if (b.controls.indexOf('focus') < 0) st.focus = st.subject;
    function draw() {
      stage.replaceChildren(T.svg(D.lensScene(st), 'illus', 'A person at a library table, with a mug in front and shelves behind.'));
      const deep = st.fstop >= 8, shallow = st.fstop <= 2.8;
      const explanations = [
        b.controls.indexOf('focus') >= 0 ? T.html('<p>The sharp layer is <strong>' + FOCUS.find(x => x.v === st.focus).label.replace(/ \(.*/, '').toLowerCase() + '</strong>. Viewers look there first.</p>') : null,
        b.controls.indexOf('fstop') >= 0 ? T.html('<p>At <strong>f/' + st.fstop + '</strong> the depth of field is ' + (shallow ? '<strong>shallow</strong>: only the person is sharp.' : deep ? '<strong>deep</strong>: almost everything is sharp.' : 'in between.') + (b.controls.indexOf('distance') >= 0 ? ' Moving closer to the subject makes it shallower.' : '') + '</p>') : null
      ];
      note.replaceChildren(el('p', { className: 'label', text: 'What you see' }), ...explanations.filter(Boolean));
    }
    draw();
    return { el: el('div', {}, T.stage(el('div', { className: 'player' }, stage, rows), [note].concat(b.side ? [T.card(b.side.title || '', b.side.html, 'warm')] : [])), b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), wide: true, interactive: true, printNote: 'Lens activity: open this topic online to try it.' };
  };

  /* ---------------------------------------------------------------- Flip book (apparent motion, Muybridge) */
  // Frames of a bouncing ball, a running figure or a horse-and-rider stand-in.
  D.ballFrame = (i, n) => { const t = i / n, y = 40 + 100 * Math.abs(Math.cos(Math.PI * t)), squash = y > 132 ? 0.7 : 1; return svg('<rect width="320" height="180" fill="#fbfaf7"/><rect y="152" width="320" height="28" fill="' + FLOOR + '"/><ellipse cx="' + (40 + 240 * t) + '" cy="' + (y + 8 * (1 - squash)) + '" rx="' + 13 / squash + '" ry="' + 13 * squash + '" fill="' + ORANGE + '"/>' + txt(306, 22, (i + 1) + '/' + n, { anchor: 'end' })); };
  // A simple runner: legs and arms swing on a sine cycle (a drawn stand-in for a motion study).
  D.runnerFrame = (i, n, opts) => {
    const a = (i / n) * Math.PI * 2, x = (opts && opts.travel === false) ? 160 : 40 + (240 * i) / n, hip = [x, 104], lift = Math.abs(Math.sin(a)) * 4;
    const limb = (o, ang, len, len2, bend) => { const k = [o[0] + Math.sin(ang) * len, o[1] + Math.cos(ang) * len]; const f = [k[0] + Math.sin(ang - bend) * len2, k[1] + Math.cos(ang - bend) * len2]; return '<path d="M' + o.join(' ') + ' L' + k.join(' ') + ' L' + f.join(' ') + '" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'; };
    const sh = [x + 4, 70 - lift];
    const grid = (opts && opts.grid) ? Array.from({ length: 17 }, (_, k) => '<line x1="' + (k * 20) + '" y1="0" x2="' + (k * 20) + '" y2="150" stroke="#d6d8d6"/>').join('') : '';
    return svg('<rect width="320" height="180" fill="' + ((opts && opts.dark) ? '#20252a' : '#fbfaf7') + '"/>' + grid + '<rect y="150" width="320" height="30" fill="' + FLOOR + '"/>' +
      limb([hip[0], hip[1] - lift], Math.sin(a) * 0.8, 24, 24, -0.6 - Math.max(0, Math.cos(a)) * 0.8) + limb([hip[0], hip[1] - lift], -Math.sin(a) * 0.8, 24, 24, -0.6 - Math.max(0, -Math.cos(a)) * 0.8) +
      '<line x1="' + hip[0] + '" y1="' + (hip[1] - lift) + '" x2="' + sh[0] + '" y2="' + sh[1] + '" stroke="' + COBALT + '" stroke-width="10" stroke-linecap="round"/>' +
      limb(sh, -Math.sin(a) * 0.9 + Math.PI, -18, -16, 0.9) + limb(sh, Math.sin(a) * 0.9 + Math.PI, -18, -16, 0.9) +
      '<circle cx="' + (sh[0] + 3) + '" cy="' + (sh[1] - 14) + '" r="10" fill="' + SKIN + '"/>' + txt(306, 22, (i + 1) + '/' + n, { anchor: 'end', fill: (opts && opts.dark) ? '#c9ccd0' : MUTED }));
  };
  // b: frames (array of svg) or kind 'ball' | 'runner', n, fps, strip (bool: show all frames), caption.
  T.blocks.flipbook = b => {
    const n = b.n || 12, make = b.kind === 'ball' ? D.ballFrame : (i, k) => D.runnerFrame(i, k, b.drawOpts);
    const frames = b.frames || Array.from({ length: n }, (_, i) => make(i, n));
    const stage = el('div', { className: 'stop-frame' }), counter = el('span', { className: 'time' });
    const fpsOut = el('output', { text: (b.fps || 2) + ' pictures a second' });
    const fps = el('input', { type: 'range', min: '1', max: '24', step: '1', value: String(b.fps || 2), 'aria-label': 'Pictures per second' });
    let i = 0, timer = 0, playing = false;
    const nodes = frames.map((f, k) => T.svg(f, 'illus', 'Picture ' + (k + 1) + ' of ' + frames.length));
    function show() { stage.replaceChildren(nodes[i]); if (b.standin) { const tag = T.standinTag(); tag.textContent = b.standin; stage.append(tag); } counter.textContent = 'Picture ' + (i + 1) + ' of ' + frames.length; strip && strip.querySelectorAll('button').forEach((x, k) => x.classList.toggle('on', k === i)); }
    function stop() { playing = false; clearInterval(timer); playBtn.textContent = '▶ Play'; }
    function play() { T.stopPlayers(api); playing = true; playBtn.textContent = '❚❚ Pause'; clearInterval(timer); timer = setInterval(() => { i = (i + 1) % frames.length; show(); }, 1000 / Number(fps.value)); }
    const playBtn = T.button('▶ Play', () => playing ? stop() : play(), 'primary');
    fps.addEventListener('input', () => { fpsOut.textContent = fps.value + (fps.value === '1' ? ' picture a second' : ' pictures a second'); if (playing) play(); });
    const strip = b.strip ? el('div', { className: 'flip-strip' }, frames.map((f, k) => { const x = el('button', { type: 'button', 'aria-label': 'Show picture ' + (k + 1) }, T.svg(f, 'illus')); x.addEventListener('click', () => { stop(); i = k; show(); }); return x; })) : null;
    stage.style.position = 'relative';
    show();
    const api = { stop }; T.players.add(api);
    const left = el('div', { className: 'player' }, stage, el('div', { className: 'controls' }, T.button('◀ Back', () => { stop(); i = (i - 1 + frames.length) % frames.length; show(); }, 'small'), playBtn, T.button('Forward ▶', () => { stop(); i = (i + 1) % frames.length; show(); }, 'small'), counter),
      el('div', { className: 'slider-row', style: 'max-width:380px' }, el('label', {}, 'Speed', fpsOut), fps), strip);
    return { el: el('div', {}, b.side ? T.stage(left, [T.card(b.side.title || '', b.side.html, b.side.warm ? 'warm' : '')]) : left, b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), wide: !!b.side, interactive: true, printNote: 'Flip book: open this topic online to play it.' };
  };

  /* ---------------------------------------------------------------- Frame rate and shutter speed */
  // A moving ball photographed at a shutter speed: faster shutter, shorter streak.
  D.motionBlur = (shutter, uid) => {
    const len = Math.min(150, 3000 / shutter), id = (uid || 'mb') + Math.random().toString(36).slice(2, 8);
    return svg('<defs><filter id="' + id + '" x="-60%" y="-20%" width="220%" height="140%"><feGaussianBlur stdDeviation="' + (len / 3.2).toFixed(1) + ' 0"/></filter></defs>' +
      '<rect width="320" height="180" fill="#dfe8ef"/><rect y="132" width="320" height="48" fill="#8fb37a"/><rect x="250" y="40" width="8" height="100" fill="#fff"/><rect x="250" y="40" width="50" height="6" fill="#fff"/>' +
      '<g filter="url(#' + id + ')"><circle cx="150" cy="98" r="16" fill="#fff" stroke="' + INK + '" stroke-width="2"/><path d="M140 88 l10 6 l10 -6 M150 94 v14" stroke="' + INK + '" stroke-width="2" fill="none"/></g>' +
      txt(12, 22, '1/' + shutter + ' second', { fill: INK, size: 12 }));
  };
  // b: rates [6, 12, 24, 60], caption. Side-by-side balls moving at the same speed, sampled at different frame rates.
  T.blocks['fps-demo'] = b => {
    const rates = b.rates || [6, 12, 24, 60];
    const lanes = rates.map(r => { const ball = el('span', { className: 'fps-ball' }); return { r, ball, row: el('div', { className: 'fps-lane' }, el('strong', { text: r + ' fps' }), el('div', { className: 'fps-track' }, ball)) }; });
    let raf = 0, t0 = 0, playing = false;
    function tick(now) { const t = (now - t0) / 1000; lanes.forEach(l => { const q = Math.floor(t * l.r) / l.r, p = (q % 2.4) / 2.4; l.ball.style.left = 'calc(' + (p * 100) + '% - ' + (p * 30) + 'px)'; }); if (playing) raf = requestAnimationFrame(tick); }
    function stop() { playing = false; cancelAnimationFrame(raf); btn.textContent = '▶ Play'; }
    const btn = T.button('▶ Play', () => { if (playing) return stop(); T.stopPlayers(api); playing = true; btn.textContent = '❚❚ Pause'; t0 = performance.now(); raf = requestAnimationFrame(tick); }, 'primary');
    const api = { stop }; T.players.add(api);
    return { el: el('div', { className: 'player' }, el('div', { className: 'fps-box' }, lanes.map(l => l.row)), el('div', { className: 'controls' }, btn), b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), interactive: true, printNote: 'Frame-rate demo: open this topic online to play it.' };
  };

  /* ---------------------------------------------------------------- Zoom versus dolly */
  // A person in front of two trees and a far house. Simple perspective: size = focal × height / distance.
  D.zoomDolly = (mode, t) => {
    const f0 = 150, fEnd = 360, dSubj = 6, camZ = mode === 'dolly' ? t * dSubj * (1 - f0 / fEnd) : 0, focal = mode === 'zoom' ? f0 + (fEnd - f0) * t : f0;
    const proj = (z, h) => focal * h / (z - camZ);
    const horizon = 112;
    // Scale is normalised so the person starts about 84 px tall; size enlarges far objects so they stay visible.
    const obj = (z, x, size, draw) => { const s = proj(z, 1) * (dSubj / f0) * size; return '<g transform="translate(' + (160 + x * 22 * s / size) + ' ' + horizon + ') scale(' + s + ')">' + draw + '</g>'; };
    const tree = '<rect x="-4" y="-60" width="8" height="60" fill="#7a5a3a"/><circle cx="0" cy="-74" r="26" fill="#5f8f4e"/>';
    const house = '<rect x="-40" y="-50" width="80" height="50" fill="#e2d6c2"/><path d="M-48 -50 L0 -86 L48 -50z" fill="#a8442a"/><rect x="-10" y="-26" width="20" height="26" fill="#7a5a3a"/>';
    const person = '<rect x="-7" y="-64" width="14" height="40" rx="5" fill="' + COBALT + '"/><rect x="-6" y="-26" width="5" height="26" fill="' + COBALT + '"/><rect x="1" y="-26" width="5" height="26" fill="' + COBALT + '"/><circle cx="0" cy="-74" r="9" fill="' + SKIN + '"/>';
    return svg('<rect width="320" height="180" fill="#dfe8ef"/><rect y="' + horizon + '" width="320" height="' + (180 - horizon) + '" fill="#cfdcb8"/>' +
      obj(60, 0, 5, house) + obj(26, -7, 2.5, tree) + obj(22, 8, 2.5, tree) + obj(dSubj, 0, 1, person) +
      txt(12, 20, mode === 'zoom' ? 'Zoom: the camera stays put' : 'Dolly: the camera moves closer', { fill: INK, size: 11 }));
  };
  T.blocks['zoom-dolly'] = b => {
    let mode = 'zoom', t = 0;
    const stage = el('div', { className: 'demo-stage' }), note = el('div', { className: 'card demo-note', 'aria-live': 'polite' });
    const out = el('output', { text: 'Start' });
    const r = el('input', { type: 'range', min: '0', max: '20', step: '1', value: '0', 'aria-label': 'Move in' });
    const chips = el('div', { className: 'chips', role: 'group', 'aria-label': 'Choose a camera move' }, ['zoom', 'dolly'].map(m => { const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(m === mode), text: m === 'zoom' ? 'Zoom in' : 'Dolly in' }); c.addEventListener('click', () => { mode = m; chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === c))); draw(); }); return c; }));
    r.addEventListener('input', () => { t = Number(r.value) / 20; draw(); });
    function draw() {
      out.textContent = t === 0 ? 'Start' : t === 1 ? 'All the way in' : Math.round(t * 100) + '%';
      stage.replaceChildren(T.svg(D.zoomDolly(mode, t), 'illus', 'A person standing in front of two trees and a house.'));
      note.replaceChildren(el('p', { className: 'label', text: mode === 'zoom' ? 'Zoom' : 'Dolly' }), T.html(mode === 'zoom'
        ? '<p>The camera doesn’t move. The lens magnifies <strong>everything</strong> by the same amount, so the trees and house grow as much as the person. The background seems to crowd in.</p>'
        : '<p>The camera moves toward the person. The person grows a lot, but the far trees and house <strong>barely change</strong>. You feel like you are walking into the scene.</p>'));
    }
    draw();
    return { el: T.stage(el('div', { className: 'player' }, stage, chips, el('div', { className: 'slider-row' }, el('label', {}, 'Move in', out), r)), [note]), wide: true, interactive: true, printNote: 'Zoom versus dolly: open this topic online to try it.' };
  };

  /* ---------------------------------------------------------------- Sorter (Practice): put each card in the right group */
  // b: groups ['Ready', 'Not ready'], items [{text, group (index), why}], prompt, closing.
  T.blocks.sorter = b => {
    const fb = el('div', { 'aria-live': 'polite' });
    let placed = 0, firstTry = 0;
    const list = el('div', { className: 'sort-items' });
    b.items.forEach((it, i) => {
      let missed = false;
      const card = el('div', { className: 'sort-card' }, el('p', { html: T.rich(it.text) }));
      const btns = el('div', { className: 'actions' }, b.groups.map((g, gi) => T.button(g, () => {
        if (gi === it.group) { card.classList.add('done'); card.replaceChildren(el('p', { html: T.rich(it.text) }), el('p', { className: 'sort-result', html: '✓ <strong>' + g + '.</strong> ' + T.rich(it.why || '') })); placed++; if (!missed) firstTry++; T.feedback(fb, placed === b.items.length ? '<strong>All sorted.</strong> ' + firstTry + ' of ' + b.items.length + ' on the first try. ' + T.rich(b.closing || '') : 'Yes. ' + placed + ' of ' + b.items.length + ' sorted.', true); }
        else { missed = true; T.feedback(fb, 'Not quite. ' + T.rich(it.clue || 'Read it again.'), false); }
      }, 'small')));
      card.append(btns); list.append(card);
    });
    return { el: el('div', { className: 'card practice-card' }, el('p', { className: 'label', text: 'Sort it' }), el('p', { className: 'q', html: T.rich(b.prompt || 'Choose a group for each card.') }), list, fb), wide: true, interactive: true };
  };
})();
