/* Interactive blocks first needed in Part 6 (FOUNDATION T5). Drawings are inline SVG, so these work with no media. */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const INK = '#171b1f', A_COL = '#3157c8', B_COL = '#b86533', SKIN = '#e9c6a5', HAIR = '#2b2420', FLOOR = '#e7e3d8', WALL = '#f3f1ec';

  /* ------------------------------------------------------------------ Drawings */
  const D = T.draw = {};
  // A person as the camera sees them. facing: 'left' | 'right' | 'back'. x,y = centre of head; s = scale.
  D.person = (x, y, s, facing, col, label) => {
    const r = 18 * s, bodyW = 62 * s, bodyH = 70 * s;
    let g = '<g>';
    g += '<path d="M' + (x - bodyW / 2) + ' ' + (y + r + bodyH) + ' Q' + (x - bodyW / 2) + ' ' + (y + r + 6 * s) + ' ' + x + ' ' + (y + r + 4 * s) + ' Q' + (x + bodyW / 2) + ' ' + (y + r + 6 * s) + ' ' + (x + bodyW / 2) + ' ' + (y + r + bodyH) + 'Z" fill="' + col + '"/>';
    if (facing === 'back') {
      g += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + HAIR + '"/>';
    } else {
      const d = facing === 'left' ? -1 : 1;
      g += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + SKIN + '"/>';
      g += '<path d="M' + (x - r) + ' ' + (y - 3 * s) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + (y - 3 * s) + ' Q' + (x - d * r * 0.2) + ' ' + (y - r * 0.5) + ' ' + (x - r) + ' ' + (y - 3 * s) + 'Z" fill="' + HAIR + '"/>';
      g += '<circle cx="' + (x + d * r * 0.45) + '" cy="' + (y - 1 * s) + '" r="' + (2.2 * s) + '" fill="' + INK + '"/>';
      g += '<path d="M' + (x + d * r * 0.92) + ' ' + (y + 1 * s) + ' l' + (d * 5 * s) + ' ' + (4 * s) + ' l' + (-d * 5 * s) + ' ' + (2 * s) + '" fill="' + SKIN + '" stroke="' + SKIN + '"/>';
    }
    if (label) g += '<text x="' + x + '" y="' + (y + r + bodyH * 0.62) + '" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="' + (16 * s) + '" fill="#fff">' + label + '</text>';
    return g + '</g>';
  };
  D.frame = (inner, label) => '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="' + WALL + '"/><rect y="132" width="320" height="48" fill="' + FLOOR + '"/>' + inner + (label ? '<text x="10" y="20" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#5d6469">' + label + '</text>' : '') + '</svg>';
  D.arrow = (x1, y, x2, col) => { const d = x2 > x1 ? 1 : -1; return '<path d="M' + x1 + ' ' + y + ' H' + x2 + '" stroke="' + (col || INK) + '" stroke-width="3"/><path d="M' + x2 + ' ' + (y - 6) + ' l' + (d * 9) + ' 6 l' + (-d * 9) + ' 6z" fill="' + (col || INK) + '"/>'; };
  // What the camera sees from a 180-degree map position.
  const SHOTS = {
    1: { side: 1, name: 'Over A’s shoulder, looking at B', draw: () => D.person(40, 70, 2.1, 'back', A_COL) + D.person(205, 72, 1.15, 'left', B_COL, 'B') },
    2: { side: 1, name: 'Two-shot', draw: () => D.person(115, 70, 1, 'right', A_COL, 'A') + D.person(205, 70, 1, 'left', B_COL, 'B') },
    3: { side: 1, name: 'Over B’s shoulder, looking at A', draw: () => D.person(280, 70, 2.1, 'back', B_COL) + D.person(115, 72, 1.15, 'right', A_COL, 'A') },
    4: { side: 2, name: 'Over A’s shoulder, looking at B', draw: () => D.person(280, 70, 2.1, 'back', A_COL) + D.person(115, 72, 1.15, 'right', B_COL, 'B') },
    5: { side: 2, name: 'Two-shot', draw: () => D.person(115, 70, 1, 'right', B_COL, 'B') + D.person(205, 70, 1, 'left', A_COL, 'A') },
    6: { side: 2, name: 'Over B’s shoulder, looking at A', draw: () => D.person(40, 70, 2.1, 'back', B_COL) + D.person(205, 72, 1.15, 'left', A_COL, 'A') }
  };
  D.shot = n => D.frame(SHOTS[n].draw(), 'Camera ' + n);
  // A wall clock seen from below (looking up), straight on, or lying on a table seen from above.
  D.clock = view => {
    const face = (cx, cy, rx, ry) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" stroke="#171b1f" stroke-width="5"/><path d="M' + cx + ' ' + cy + ' v' + (-ry * 0.6) + ' M' + cx + ' ' + cy + ' h' + (rx * 0.45) + '" stroke="#171b1f" stroke-width="4" stroke-linecap="round"/>';
    if (view === 'below') return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#f3f1ec"/><path d="M0 0 L320 0 L320 34 L0 58z" fill="#e2ddd2"/>' + face(170, 92, 44, 36) + '</svg>';
    if (view === 'level') return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#f3f1ec"/><rect y="150" width="320" height="30" fill="#e7e3d8"/>' + face(160, 90, 42, 42) + '</svg>';
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#c9a77c"/>' + face(160, 94, 54, 30) + '</svg>';
  };
  // A person with an arrow showing which way they move or look.
  D.mover = (facing, label, col) => D.frame(D.person(facing === 'right' ? 120 : 200, 70, 1.05, facing, col || '#3157c8') + D.arrow(facing === 'right' ? 160 : 160, 150, facing === 'right' ? 250 : 70, '#a8442a') + (label ? '<text x="160" y="172" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#a8442a">' + label + '</text>' : ''));
  T.shots180 = SHOTS;

  /* ------------------------------------------------------------------ 6.03 Camera map (180-degree rule) */
  const CAMS = { 1: [95, 236], 2: [200, 262], 3: [305, 236], 4: [95, 64], 5: [200, 38], 6: [305, 64] };
  const TARGET = { 1: [262, 150], 2: [200, 150], 3: [138, 150], 4: [262, 150], 5: [200, 150], 6: [138, 150] };
  function mapSVG(selected, lineVisible) {
    let s = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="cam-map" role="group" aria-label="Top-down map of two people talking, with six camera positions">';
    s += '<rect x="0" y="0" width="400" height="150" fill="#f4f5f3"/><rect x="0" y="150" width="400" height="150" fill="#eef1f8"/>';
    s += '<text x="12" y="22" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#5d6469">SIDE 2</text><text x="12" y="290" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#3157c8">SIDE 1</text>';
    if (lineVisible) s += '<line x1="10" y1="150" x2="390" y2="150" stroke="#a8442a" stroke-width="2.5" stroke-dasharray="8 6"/><text x="388" y="142" text-anchor="end" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#a8442a">the line</text>';
    s += '<rect x="168" y="132" width="64" height="36" rx="6" fill="#d9cfbd"/>';
    s += '<circle cx="138" cy="150" r="17" fill="' + A_COL + '"/><path d="M155 150 l10 -6 v12z" fill="' + A_COL + '"/><text x="138" y="155" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="14" fill="#fff">A</text>';
    s += '<circle cx="262" cy="150" r="17" fill="' + B_COL + '"/><path d="M245 150 l-10 -6 v12z" fill="' + B_COL + '"/><text x="262" y="155" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="14" fill="#fff">B</text>';
    Object.keys(CAMS).forEach(n => {
      const [x, y] = CAMS[n], [tx, ty] = TARGET[n], ang = Math.atan2(ty - y, tx - x) * 180 / Math.PI, on = selected.indexOf(Number(n)) >= 0;
      s += '<g class="cam" data-cam="' + n + '" tabindex="0" role="button" aria-pressed="' + on + '" aria-label="Camera ' + n + ', side ' + SHOTS[n].side + ': ' + SHOTS[n].name + '">';
      if (on) s += '<path d="M' + x + ' ' + y + ' L' + (x + Math.cos((ang - 18) * Math.PI / 180) * 120) + ' ' + (y + Math.sin((ang - 18) * Math.PI / 180) * 120) + ' L' + (x + Math.cos((ang + 18) * Math.PI / 180) * 120) + ' ' + (y + Math.sin((ang + 18) * Math.PI / 180) * 120) + 'Z" fill="rgba(49,87,200,.12)"/>';
      s += '<circle class="ring" cx="' + x + '" cy="' + y + '" r="22" fill="' + (on ? '#3157c8' : '#fff') + '" stroke="' + (on ? '#3157c8' : '#9aa0a4') + '" stroke-width="2"/>';
      s += '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ')"><rect x="-11" y="-7" width="16" height="14" rx="2" fill="' + (on ? '#fff' : INK) + '"/><path d="M5 -5 L12 -9 V9 L5 5z" fill="' + (on ? '#fff' : INK) + '"/></g>';
      s += '<text x="' + x + '" y="' + (y + (y > 150 ? 36 : -28)) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="800" fill="' + INK + '">' + n + '</text></g>';
    });
    return s + '</svg>';
  }
  D.map = (selected, lineVisible) => mapSVG(selected || [], lineVisible !== false).replace(' class="cam-map"', '').replace(/ tabindex="0" role="button"/g, '');
  T.blocks['camera-map'] = b => {
    const mapHost = el('div');
    const slots = [null, null];
    const shotsRow = el('div', { className: 'pair' });
    const verdict = el('div', { 'aria-live': 'polite' });
    const tasks = el('ul', { className: 'checks' });
    const taskDone = [false, false];
    let lineOn = true;
    const lineBtn = el('button', { type: 'button', className: 'chip', 'aria-pressed': 'true', text: 'Show the line' });
    lineBtn.addEventListener('click', () => { lineOn = !lineOn; lineBtn.setAttribute('aria-pressed', String(lineOn)); draw(); });
    const clear = T.button('Clear shots', () => { slots[0] = slots[1] = null; draw(); }, 'small');
    function pick(n) {
      if (slots[0] === null) slots[0] = n; else if (slots[1] === null && n !== slots[0]) slots[1] = n; else if (n !== slots[0]) slots[1] = n;
      draw(n);
    }
    function draw(focusCam) {
      mapHost.innerHTML = mapSVG(slots.filter(x => x !== null), lineOn);
      mapHost.querySelectorAll('.cam').forEach(g => {
        g.addEventListener('click', () => pick(Number(g.dataset.cam)));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(Number(g.dataset.cam)); } });
      });
      if (focusCam) { const g = mapHost.querySelector('[data-cam="' + focusCam + '"]'); if (g) g.focus(); }
      shotsRow.replaceChildren(...slots.map((n, i) => el('figure', { className: 'fig' },
        n === null ? el('div', { className: 'placeholder small', style: 'aspect-ratio:16/9' }, el('strong', { text: 'Shot ' + (i + 1) }), el('span', { text: 'Click a camera on the map.' }))
          : T.media(b.photos[n - 1]),
        el('figcaption', { text: n === null ? 'Shot ' + (i + 1) : 'Shot ' + (i + 1) + ' · Camera ' + n + ' · Side ' + SHOTS[n].side + ' · ' + SHOTS[n].name }))));
      if (slots[0] !== null && slots[1] !== null) {
        const same = SHOTS[slots[0]].side === SHOTS[slots[1]].side;
        if (same) taskDone[0] = true; else taskDone[1] = true;
        T.feedback(verdict, same ? '<strong>Same side of the line.</strong> A and B keep their screen sides, so they seem to face each other across the cut.'
          : '<strong>You crossed the line.</strong> A and B swap sides of the screen. After the cut they both seem to look the same way, as if they turned away from each other.', same);
      } else verdict.replaceChildren();
      tasks.replaceChildren(...b.tasks.map((t, i) => el('li', { className: taskDone[i] ? 'ok' : '', text: t })));
    }
    draw();
    const right = [el('p', { html: T.rich(b.prompt) }), el('div', { className: 'actions' }, lineBtn, clear), shotsRow, verdict, T.card('Try these', tasks)];
    return { el: el('div', { className: 'map-wrap' }, mapHost, el('div', { className: 'panel' }, right)), wide: true, interactive: true };
  };

  /* ------------------------------------------------------------------ 6.02 Where does the interviewer sit? */
  // Crop a photo so the subject has looking room toward their gaze. mirror flips the photo.
  T.lookCrop = (id, mirror, w) => {
    const r = T.mediaRecord(id), L = r.landmarks; w = w || 1100;
    const eyesX = mirror ? r.w - L.eyes[0] : L.eyes[0];
    const gaze = (L.gaze === 'right') !== !!mirror ? 'right' : 'left';
    const x = eyesX - (gaze === 'right' ? 0.38 : 0.62) * w, y = L.eyes[1] - 0.36 * w * 9 / 16;
    return { frame: [Math.round(x), Math.round(y), w], gaze };
  };
  T.blocks['interviewer-seat'] = b => {
    const seats = b.interviews.map(iv => ({ seat: iv.start }));
    const shots = el('div', { className: 'pair' });
    const verdict = el('div', { 'aria-live': 'polite' });
    const tasks = el('ul', { className: 'checks' });
    const done = [false, false, false];
    const box = T.monitor('Preview');
    const previewBtn = T.button('▶ Preview the cut', preview, 'primary');
    let timer = 0;
    function view(i) { const iv = b.interviews[i], r = T.mediaRecord(iv.media); const native = r.landmarks.gaze; const want = seats[i].seat; return { mirror: native !== want, iv }; }
    function draw() {
      shots.replaceChildren(...b.interviews.map((iv, i) => {
        const v = view(i), c = T.lookCrop(iv.media, v.mirror);
        const seatRow = el('div', { className: 'chips', role: 'group', 'aria-label': iv.label + ': where the interviewer sits' },
          ['left', 'right'].map(side => { const btn = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(seats[i].seat === side), text: 'Interviewer ' + side + ' of camera' }); btn.addEventListener('click', () => { seats[i].seat = side; if (i === 0) done[side === 'left' ? 0 : 1] = true; draw(); }); return btn; }));
        const fig = T.media({ id: iv.media, crop: c.frame, mirror: v.mirror, alt: iv.label + ': the subject looks toward screen ' + c.gaze + '.' });
        fig.append(el('span', { className: 'badge', text: 'Looks screen ' + c.gaze }));
        return el('figure', { className: 'fig' }, el('strong', { text: iv.label }), fig, seatRow);
      }));
      const facing = seats[0].seat !== seats[1].seat;
      T.feedback(verdict, facing ? '<strong>Facing each other.</strong> One looks screen left, one looks screen right. Cut together, they seem to answer each other.'
        : '<strong>Facing the same way.</strong> Both look toward screen ' + seats[0].seat + '. Two sides of a story read better face to face.', facing);
      tasks.replaceChildren(...b.tasks.map((t, i) => el('li', { className: done[i] ? 'ok' : '', text: t })));
    }
    function preview() {
      clearInterval(timer);
      const frames = [0, 1, 0, 1]; let k = 0;
      const show = () => { const i = frames[k], v = view(i), c = T.lookCrop(b.interviews[i].media, v.mirror); box.querySelectorAll('.crop,.still').forEach(n => n.remove()); const m = T.crop(T.mediaRecord(b.interviews[i].media), c.frame, v.mirror); m.style.cssText = 'position:absolute;inset:0;border-radius:0;aspect-ratio:auto'; box.prepend(m); box.querySelector('.pill').textContent = b.interviews[i].label; };
      show();
      timer = setInterval(() => { k++; if (k >= frames.length) { clearInterval(timer); if (seats[0].seat !== seats[1].seat) { done[2] = true; draw(); } return; } show(); }, 1200);
    }
    draw();
    return { el: el('div', { className: 'stage' }, el('div', { className: 'player' }, el('p', { html: T.rich(b.prompt) }), shots, verdict), el('div', { className: 'panel' }, box, el('div', { className: 'controls' }, previewBtn), T.card('Try these', tasks))), wide: true, interactive: true };
  };

  /* ------------------------------------------------------------------ 6.09 Stop motion and substitution splice */
  function deskScene(inner) { return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#efe9dd"/><rect y="118" width="320" height="62" fill="#c9a77c"/><rect y="118" width="320" height="5" fill="#b38f62"/>' + inner + '</svg>'; }
  function moveFrame(i, n) {
    const p = i / (n - 1), x = 30 + p * 260, bounce = Math.abs(Math.sin(p * Math.PI * 3)) * 48;
    return deskScene('<ellipse cx="' + x + '" cy="121" rx="' + (12 - bounce / 10) + '" ry="3" fill="rgba(0,0,0,.18)"/><circle cx="' + x + '" cy="' + (106 - bounce) + '" r="13" fill="#3157c8"/><circle cx="' + (x - 4) + '" cy="' + (101 - bounce) + '" r="4" fill="#9fb3ec"/>');
  }
  function swapFrame(i, n) {
    const swap = Math.floor(n / 2);
    const magician = D.person(80, 62, 0.9, 'right', '#171b1f');
    const obj = i < swap ? '<rect x="196" y="88" width="30" height="30" rx="4" fill="#fff" stroke="#5d6469" stroke-width="2"/><path d="M226 96 q12 6 0 14" fill="none" stroke="#5d6469" stroke-width="3"/>'
      : '<path d="M211 118 v-26" stroke="#1f7a4d" stroke-width="3"/><circle cx="211" cy="84" r="10" fill="#b86533"/><circle cx="211" cy="84" r="4" fill="#ffd24a"/>';
    return deskScene(magician + obj);
  }
  D.stopFrame = (mode, i, n) => (mode === 'swap' ? swapFrame : moveFrame)(i, n);
  T.blocks['stop-motion'] = b => {
    const n = b.frames || 24, make = b.mode === 'swap' ? swapFrame : moveFrame;
    const frames = Array.from({ length: n }, (_, i) => make(i, n));
    const stage = el('div', { className: 'stop-frame' });
    const counter = el('span', { className: 'time' });
    const fpsOut = el('output', { text: (b.fps || 8) + ' fps' });
    const fps = el('input', { type: 'range', min: '2', max: '24', step: '1', value: String(b.fps || 8), 'aria-label': 'Frames per second' });
    let i = 0, timer = 0, playing = false;
    function show() { stage.replaceChildren(T.svg(frames[i], 'illus', 'Frame ' + (i + 1) + ' of ' + n)); if (b.standin !== false) stage.append(T.standinTag()); counter.textContent = 'Frame ' + (i + 1) + ' of ' + n; }
    function step(d) { stop(); i = (i + d + n) % n; show(); }
    function stop() { playing = false; clearInterval(timer); playBtn.textContent = '▶ Play'; }
    function play() { T.stopPlayers(api); playing = true; playBtn.textContent = '❚❚ Pause'; clearInterval(timer); timer = setInterval(() => { i = (i + 1) % n; show(); }, 1000 / Number(fps.value)); }
    const playBtn = T.button('▶ Play', () => playing ? stop() : play(), 'primary');
    fps.addEventListener('input', () => { fpsOut.textContent = fps.value + ' fps'; if (playing) play(); });
    stage.style.position = 'relative';
    show();
    const api = { stop }; T.players.add(api);
    return { el: el('div', { className: 'player' }, stage, el('div', { className: 'controls' }, T.button('◀ Back one frame', () => step(-1), 'small'), playBtn, T.button('Forward one frame ▶', () => step(1), 'small'), counter),
      el('div', { className: 'slider-row', style: 'max-width:360px' }, el('label', {}, 'Playback speed', fpsOut), fps), b.caption ? el('p', { className: 'caption', html: T.rich(b.caption) }) : null), wide: b.wide, interactive: true };
  };

  /* ------------------------------------------------------------------ 6.10 Spot the continuity error */
  const ITEMS = {
    mug: (s) => { const lvl = s.mugLevel == null ? 0.7 : s.mugLevel; const x = s.mugX || 70; return { box: [x - 4, 74, 46, 48], svg: '<rect x="' + x + '" y="80" width="34" height="40" rx="4" fill="#fff" stroke="#5d6469" stroke-width="2"/><rect x="' + (x + 2) + '" y="' + (82 + 36 * (1 - lvl)) + '" width="30" height="' + (36 * lvl) + '" fill="#7a4a2b"/><path d="M' + (x + 34) + ' 88 q13 8 0 18" fill="none" stroke="#5d6469" stroke-width="3"/>' }; },
    book: (s) => ({ box: [130, 92, 74, 32], svg: s.bookOpen ? '<path d="M134 118 l32 -6 l32 6 v4 h-64z" fill="#fff" stroke="#5d6469" stroke-width="2"/><path d="M166 112 v10" stroke="#5d6469"/><path d="M140 114 h20 M172 114 h20" stroke="#c9ccd0" stroke-width="2"/>' : '<rect x="136" y="106" width="62" height="14" rx="2" fill="' + (s.bookColor || '#a8442a') + '"/><rect x="136" y="118" width="62" height="3" fill="#fff"/>' }),
    lamp: (s) => ({ box: [222, 22, 66, 100], svg: (s.lampOn !== false ? '<path d="M232 52 L278 52 L298 118 L212 118z" fill="rgba(255,210,74,.35)"/>' : '') + '<rect x="250" y="56" width="6" height="62" fill="#5d6469"/><rect x="236" y="114" width="34" height="6" rx="2" fill="#5d6469"/><path d="M234 54 L272 54 L262 28 L244 28z" fill="' + (s.lampOn !== false ? '#ffd24a' : '#9aa0a4') + '"/>' }),
    pencil: (s) => ({ box: [26, 104, 50, 20], svg: s.pencil === false ? '' : '<g transform="rotate(' + (s.pencilAngle || -8) + ' 50 114)"><rect x="30" y="111" width="38" height="6" fill="#ffd24a"/><path d="M68 111 l8 3 l-8 3z" fill="#e9c6a5"/><rect x="26" y="111" width="5" height="6" fill="#f2a1a1"/></g>' })
  };
  function desk(state, interactive) {
    let s = '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#efe9dd"/><rect x="18" y="20" width="70" height="46" fill="#cfe1ee" stroke="#fff" stroke-width="4"/><rect y="120" width="320" height="60" fill="#c9a77c"/><rect y="120" width="320" height="5" fill="#b38f62"/>';
    Object.keys(ITEMS).forEach(k => { const it = ITEMS[k](state); s += it.svg; if (interactive) s += '<g class="hit" data-item="' + k + '" tabindex="0" role="button" aria-label="' + k + '"><rect class="box" x="' + it.box[0] + '" y="' + it.box[1] + '" width="' + it.box[2] + '" height="' + it.box[3] + '" fill="transparent" stroke="rgba(49,87,200,.35)" stroke-width="1.5" stroke-dasharray="4 4" rx="5"/></g>'; });
    return s + '</svg>';
  }
  T.draw.desk = desk;
  T.blocks['spot-change'] = b => {
    const host = el('div');
    let index = 0;
    function render() {
      const pair = b.pairs[index];
      const fb = el('div', { 'aria-live': 'polite' });
      const next = T.button(index === b.pairs.length - 1 ? 'Start over' : 'Next pair →', () => {
        index = (index + 1) % b.pairs.length;
        render();
        host.querySelector('.hit').focus();
      }, 'primary');
      next.hidden = true;
      const after = T.media(pair.after);
      let solved = false;
      Object.entries(b.areas).forEach(([item, area]) => {
        const [x, y, w, h] = pair.areas?.[item] || area;
        const hit = el('button', {
          type: 'button', className: 'hit', 'data-item': item, 'aria-label': item,
          style: 'left:' + x + '%;top:' + y + '%;width:' + w + '%;height:' + h + '%',
        });
        hit.addEventListener('click', () => {
          if (solved) return;
          if (item === pair.changed) {
            solved = true;
            hit.classList.remove('miss');
            hit.classList.add('found');
            T.feedback(fb, '<strong>Found it.</strong> ' + pair.explain, true);
            next.hidden = false;
            next.focus();
          } else {
            hit.classList.add('miss');
            T.feedback(fb, 'The ' + item + ' matches Shot 1. Look again.', false);
          }
        });
        after.append(hit);
      });
      const s1 = el('figure', { className: 'fig' }, T.media(b.before), el('figcaption', { text: 'Shot 1 · before the cut' }));
      const s2 = el('figure', { className: 'fig' }, after, el('figcaption', { text: 'Shot 2 · after the cut. Select what changed.' }));
      host.replaceChildren(el('p', { className: 'label', text: 'Pair ' + (index + 1) + ' of ' + b.pairs.length }), el('div', { className: 'spot-pair' }, s1, s2), fb, next);
    }
    render();
    return { el: host, wide: true, interactive: true };
  };

  /* ------------------------------------------------------------------ 6.10 Put the shots in order, then play your sequence */
  T.blocks['sequence-builder'] = b => {
    const correct = b.shots.map((_, i) => i);
    let order = b.start || correct.slice().reverse();
    const list = el('ol', { className: 'sequence-list' });
    const fb = el('div', { 'aria-live': 'polite' });
    const player = T.sequence(order.map(i => b.shots[i].segment), { label: '▶ Play your sequence' });
    function move(pos, d) { const j = pos + d; if (j < 0 || j >= order.length) return; [order[pos], order[j]] = [order[j], order[pos]]; draw(j, d); }
    function draw(focusPos, d) {
      list.replaceChildren(...order.map((i, pos) => {
        const sh = b.shots[i];
        const up = T.button('↑', () => move(pos, -1), 'small'), down = T.button('↓', () => move(pos, 1), 'small');
        up.setAttribute('aria-label', 'Move ' + sh.label + ' earlier'); down.setAttribute('aria-label', 'Move ' + sh.label + ' later');
        up.disabled = pos === 0; down.disabled = pos === order.length - 1;
        return el('li', {}, el('span', { className: 'n', text: pos + 1 }), T.media({ id: sh.segment.media, t: sh.thumbAt, small: true }), el('span', {}, el('strong', { text: sh.label }), el('br'), el('span', { className: 'muted', style: 'font-size:14px', text: sh.desc })), el('span', { className: 'moves' }, up, down));
      }));
      player.setSegments(order.map(i => b.shots[i].segment));
      fb.replaceChildren();
      if (focusPos != null) { const btns = list.children[focusPos].querySelectorAll('button'); (d < 0 ? btns[0] : btns[1]).focus(); }
    }
    const check = T.button('Check my order', () => {
      const ok = order.every((v, i) => v === correct[i]);
      list.querySelectorAll('li').forEach((li, pos) => li.classList.toggle('ok', order[pos] === correct[pos]));
      if (ok) T.feedback(fb, '<strong>That’s the sequence.</strong> ' + b.success, true);
      else { const wrong = order.findIndex((v, i) => v !== correct[i]); T.feedback(fb, 'Not yet. Shot ' + (wrong + 1) + ' is out of place. ' + b.clue + ' Play it to see where the story breaks.', false); }
    }, 'primary');
    draw();
    return { el: T.stage(el('div', { className: 'player' }, list, el('div', { className: 'actions' }, check), fb), el('div', { className: 'panel' }, el('p', { html: T.rich(b.prompt) }), player.el)), wide: true, interactive: true };
  };

  /* ------------------------------------------------------------------ Practice: choose the right picture (several rounds) */
  function pic(m) { return m.svg ? T.svg(m.svg, 'illus', m.alt) : T.media(m.media ? m.media : m); }
  T.blocks['picture-choice'] = b => {
    const host = el('div');
    let index = 0, firstTry = 0;
    function render(focus) {
      const r = b.rounds[index];
      const fb = el('div', { 'aria-live': 'polite' });
      let missed = false, done = false;
      const next = T.button(index === b.rounds.length - 1 ? 'Finish' : 'Next round →', () => { if (index === b.rounds.length - 1) finish(); else { index++; render(true); } }, 'primary'); next.hidden = true;
      const opts = el('div', { className: 'pic-options' });
      opts.style.setProperty('--n', r.options.length);
      const btns = r.options.map((o, i) => {
        const bt = el('button', { type: 'button', className: 'pic-option', 'aria-label': 'Option ' + (i + 1) + ': ' + (o.label || o.alt || '') }, pic(o), o.label ? el('span', { text: o.label }) : null);
        bt.addEventListener('click', () => {
          if (done) return;
          if (i === r.answer) { done = true; if (!missed) firstTry++; bt.classList.add('good'); btns.forEach(x => { x.disabled = true; }); T.feedback(fb, '<strong>Yes.</strong> ' + r.explain, true); next.hidden = false; next.focus(); }
          else { missed = true; bt.classList.add('bad'); bt.disabled = true; T.feedback(fb, 'Not quite. ' + (o.clue || '') + ' Try another.', false); }
        });
        opts.append(bt);
        return bt;
      });
      const stem = r.stem ? el('figure', { className: 'fig pc-stem' }, pic(r.stem), r.stem.caption ? el('figcaption', { text: r.stem.caption }) : null) : null;
      host.replaceChildren(el('div', { className: 'pc-layout' + (stem ? '' : ' no-stem') },
        el('div', { className: 'pc-ask' }, el('p', { className: 'label', text: (b.label || 'Round') + ' ' + (index + 1) + ' of ' + b.rounds.length }), el('p', { className: 'q', html: T.rich(r.prompt) }), stem),
        el('div', { className: 'pc-answer' }, opts, fb, next)));
      if (focus) btns[0].focus();
    }
    function finish() { host.replaceChildren(T.card('', el('div', {}, el('p', { className: 'label', text: 'Done' }), el('h3', { style: 'font-size:22px;margin:6px 0 10px', text: firstTry + ' of ' + b.rounds.length + ' on the first try.' }), el('p', { html: T.rich(b.closing || '') }), el('div', { className: 'actions', style: 'margin-top:10px' }, T.button('Go again', () => { index = 0; firstTry = 0; render(true); }))))); }
    render(false);
    return { el: el('div', { className: 'card practice-card' }, host), wide: true, interactive: true };
  };

  /* ------------------------------------------------------------------ Practice: build an opening (choose shots in order, then play) */
  const SIZE_RANK = { wide: 0, medium: 1, close: 2 };
  T.blocks['opening-builder'] = b => {
    const slots = Array(b.slots || 3).fill(null);
    const bank = el('div', { className: 'shot-bank' });
    const slotRow = el('ol', { className: 'shot-slots' });
    const fb = el('div', { 'aria-live': 'polite' });
    const player = T.sequence([], { label: '▶ Play your opening' });
    function draw() {
      bank.replaceChildren(...b.bank.map((s, i) => {
        const used = slots.includes(i);
        const bt = el('button', { type: 'button', className: 'shot-card' + (used ? ' used' : ''), disabled: used, 'aria-label': 'Add ' + s.label }, T.media({ id: s.still || s.segment.media, t: s.thumbAt, small: true }), el('strong', { text: s.label }), el('span', { className: 'muted', text: s.desc }));
        bt.addEventListener('click', () => { const k = slots.indexOf(null); if (k < 0) { T.feedback(fb, 'All the slots are full. Remove a shot first.', false); return; } slots[k] = i; draw(); });
        return bt;
      }));
      slotRow.replaceChildren(...slots.map((v, k) => el('li', { className: v === null ? 'empty' : '' }, el('span', { className: 'n', text: 'Shot ' + (k + 1) }),
        v === null ? el('span', { className: 'muted', text: 'Choose a shot' }) : el('span', {}, el('strong', { text: b.bank[v].label }), ' ', T.button('Remove', () => { slots[k] = null; draw(); }, 'small')))));
      const chosen = slots.filter(v => v !== null);
      player.setSegments(chosen.map(i => b.bank[i].segment));
      fb.replaceChildren();
    }
    const check = T.button('Check my opening', () => {
      if (slots.includes(null)) { T.feedback(fb, 'Fill all ' + slots.length + ' slots first.', false); return; }
      const shots = slots.map(i => b.bank[i]);
      if (!shots[0].establishes) { T.feedback(fb, 'Shot 1 doesn’t show where we are. ' + (b.clueEstablish || 'Start with a shot that shows the whole place.'), false); return; }
      for (let k = 1; k < shots.length; k++) if (SIZE_RANK[shots[k].size] < SIZE_RANK[shots[k - 1].size]) { T.feedback(fb, 'Shot ' + (k + 1) + ' is wider than the shot before it. ' + (b.clueOrder || 'Move from wide to close.'), false); return; }
      if (new Set(shots.map(s => s.size)).size < shots.length && b.distinctSizes) { T.feedback(fb, 'Two shots are the same size. Give each shot a new job: place, person, detail.', false); return; }
      T.feedback(fb, '<strong>That opening works.</strong> ' + b.success + ' Play it to see.', true);
    }, 'primary');
    draw();
    return { el: el('div', { className: 'player' }, el('p', { html: T.rich(b.prompt) }), el('p', { className: 'label', text: 'Shots you can use' }), bank, T.stage(el('div', { className: 'player' }, slotRow, el('div', { className: 'actions' }, check, T.button('Clear', () => { slots.fill(null); draw(); }, 'small')), fb), el('div', { className: 'panel' }, player.el))), wide: true, interactive: true };
  };

  /* ------------------------------------------------------------------ Practice: plan coverage on a top-down map */
  const SPOTS = { a: [200, 268, 'far', 1], b: [118, 205, 'mid', 1], c: [262, 168, 'near', 1], d: [200, 22, 'far', 2], e: [300, 210, 'mid', 1], f: [96, 52, 'mid', 2] };
  function planSVG(assign) {
    let s = '<svg viewBox="0 0 400 290" xmlns="http://www.w3.org/2000/svg" class="cam-map" role="group" aria-label="Top-down plan of a person at a table, with six possible camera spots">';
    s += '<rect width="400" height="290" fill="#eef1f8"/><rect width="400" height="118" fill="#f4f5f3"/>';
    s += '<line x1="10" y1="118" x2="390" y2="118" stroke="#a8442a" stroke-width="2.5" stroke-dasharray="8 6"/><text x="388" y="110" text-anchor="end" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#a8442a">the line</text>';
    s += '<rect x="150" y="122" width="100" height="40" rx="6" fill="#d9cfbd"/><rect x="186" y="132" width="26" height="18" fill="#3157c8"/><text x="200" y="176" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#5d6469">TABLE + BOOK</text>';
    s += '<circle cx="200" cy="100" r="16" fill="#b86533"/><path d="M200 116 l-6 9 h12z" fill="#b86533"/><text x="200" y="105" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="800" fill="#fff">P</text>';
    Object.keys(SPOTS).forEach(k => {
      const [x, y] = SPOTS[k], role = Object.keys(assign).find(r => assign[r] === k);
      s += '<g class="cam" data-spot="' + k + '" tabindex="0" role="button" aria-label="Camera spot ' + k.toUpperCase() + (role ? ', assigned ' + role : '') + '"><circle class="ring" cx="' + x + '" cy="' + y + '" r="20" fill="' + (role ? '#3157c8' : '#fff') + '" stroke="' + (role ? '#3157c8' : '#9aa0a4') + '" stroke-width="2"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="800" fill="' + (role ? '#fff' : '#171b1f') + '">' + k.toUpperCase() + '</text>' + (role ? '<text x="' + x + '" y="' + (y + 36) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="800" fill="#3157c8">' + role.toUpperCase() + '</text>' : '') + '</g>';
    });
    return s + '</svg>';
  }
  T.blocks['coverage-planner'] = b => {
    const roles = ['Master', 'Medium', 'Close-up'];
    const assign = {};
    let role = roles[0];
    const mapHost = el('div'), fb = el('div', { 'aria-live': 'polite' }), result = el('div');
    const chips = el('div', { className: 'chips', role: 'group', 'aria-label': 'Choose a shot to place' });
    roles.forEach(r => { const c = el('button', { type: 'button', className: 'chip', 'aria-pressed': String(r === role), text: 'Place: ' + r }); c.addEventListener('click', () => { role = r; chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === c))); }); chips.append(c); });
    function place(k) { Object.keys(assign).forEach(r => { if (assign[r] === k) delete assign[r]; }); assign[role] = k; const nx = roles.find(r => !assign[r]); if (nx) { role = nx; chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x.textContent.endsWith(nx)))); } draw(k); }
    function draw(focusSpot) {
      mapHost.innerHTML = planSVG(assign);
      mapHost.querySelectorAll('.cam').forEach(g => { g.addEventListener('click', () => place(g.dataset.spot)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(g.dataset.spot); } }); });
      if (focusSpot) { const g = mapHost.querySelector('[data-spot="' + focusSpot + '"]'); if (g) g.focus(); }
      fb.replaceChildren(); result.replaceChildren();
    }
    const check = T.button('Check my plan', () => {
      if (roles.some(r => !assign[r])) { T.feedback(fb, 'Place all three shots first: ' + roles.filter(r => !assign[r]).join(', ') + '.', false); return; }
      const sp = r => SPOTS[assign[r]];
      if (roles.some(r => sp(r)[3] !== 1)) { T.feedback(fb, 'One camera is on the other side of the line. Shots from both sides won’t cut together. Keep all three below the line, facing the person.', false); return; }
      const dist = r => Math.hypot(sp(r)[0] - 200, sp(r)[1] - 140);
      if (!(dist('Master') > dist('Medium') && dist('Medium') > dist('Close-up'))) { T.feedback(fb, 'The master shot shows the whole action, so it needs the farthest spot. The close-up needs the nearest. Swap them around.', false); return; }
      T.feedback(fb, '<strong>Good plan.</strong> All three cameras are on one side of the line, from far to near. Here is what each one would see:', true);
      result.replaceChildren(el('div', { className: 'fig-row', style: '--n:3;margin-top:10px' }, [['still-room-wide', 'Master'], ['still-medium-seated', 'Medium'], ['still-book-close', 'Close-up']].map(([m, c]) => el('figure', {}, T.media(m), el('figcaption', { text: c })))));
    }, 'primary');
    draw();
    return { el: el('div', { className: 'player' }, el('div', { className: 'map-wrap' }, mapHost, el('div', { className: 'panel' }, el('p', { html: T.rich(b.prompt) }), chips, el('div', { className: 'actions' }, check, T.button('Clear', () => { Object.keys(assign).forEach(k => delete assign[k]); role = roles[0]; chips.querySelectorAll('.chip').forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0))); draw(); }, 'small')), fb)), result), wide: true, interactive: true };
  };
})();
