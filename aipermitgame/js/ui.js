/* Everything on screen that is not the 3D world. */
RT.createUI = function (map, cats, noteKinds) {
  const U = RT.U, esc = U.escapeHtml;
  const $ = (id) => document.getElementById(id);
  const catById = Object.fromEntries(cats.map((c) => [c.id, c]));

  // ---------- permit tracker ----------
  function buildPermit(goal) {
    $('creditRows').innerHTML = cats.map((c) => `
      <li data-cat="${c.id}" style="--c:${c.color}">
        <span class="ic" aria-hidden="true">${c.icon}</span>
        <span class="lbl">${esc(c.label)}</span>
        <span class="boxes">${Array.from({ length: goal }, () => '<i class="box"></i>').join('')}</span>
      </li>`).join('');
    $('goalText').textContent = 'Goal: ' + goal * cats.length + ' permit credits + 6 practice hours';
  }
  function setPermit(credits, goal, pop) {
    for (const c of cats) {
      const li = document.querySelector(`#creditRows li[data-cat="${c.id}"]`);
      if (!li) continue;
      const boxes = li.querySelectorAll('.box');
      boxes.forEach((b, k) => {
        const on = k < credits[c.id];
        b.classList.toggle('on', on);
        if (!pop) b.classList.remove('pop');
        if (pop === c.id && k === credits[c.id] - 1) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      });
      li.classList.toggle('done', credits[c.id] >= goal);
      li.setAttribute('aria-label', c.label + ': ' + Math.min(credits[c.id], goal) + ' of ' + goal + ' credits');
    }
  }
  const setName = (n) => { $('permitName').textContent = n || 'Student Driver'; };
  const setNotes = (n) => { $('notesCount').textContent = '📒 ' + n + (n === 1 ? ' note' : ' notes'); };
  const setScore = (s) => { $('safeScore').textContent = '🛡️ ' + Math.round(s); };
  const setHours = (h, goal) => { $('hoursCount').textContent = '⏱ ' + Math.min(h, goal) + '/' + goal + ' hrs'; };
  let lastBadge = '';
  const setCreditsBadge = (t, total) => { const v = t + '/' + total; if (v !== lastBadge) { $('creditBadge').textContent = v; lastBadge = v; } };
  function confetti() {
    const box = $('confetti');
    const colors = ['#ffc233', '#2f6fa3', '#1fae64', '#d7263d', '#6b4e9a', '#31c3c3'];
    for (let k = 0; k < 90; k++) {
      const p = document.createElement('i');
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = colors[k % colors.length];
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      p.style.setProperty('--drift', ((Math.random() - 0.5) * 200) + 'px');
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(p);
      setTimeout(() => p.remove(), 4600);
    }
  }

  // ---------- dash ----------
  let lastSpeed = -1, lastLimit = -1;
  function setSpeed(mph, limit, reversing, over) {
    const v = Math.round(mph);
    if (v !== lastSpeed) { $('speedNum').textContent = v; lastSpeed = v; }
    if (limit !== lastLimit) { $('limitNum').textContent = limit; lastLimit = limit; }
    $('gear').textContent = reversing ? 'R' : 'D';
    $('dash').classList.toggle('over', over);
  }
  function setBlinker(dir, on) {
    $('blinkL').classList.toggle('on', dir > 0 && on);
    $('blinkR').classList.toggle('on', dir < 0 && on);
  }
  const setStreet = (t) => { $('street').textContent = t; };
  let objKey = '';
  function setObjective(html, gold) {
    const k = html + gold;
    if (k === objKey) return;
    objKey = k;
    $('objective').innerHTML = html;
    $('objective').classList.toggle('gold', !!gold);
  }

  // ---------- "stop ahead" alert ----------
  let alertKey = '';
  function setAlert(kind, text) {
    const k = kind ? kind + text : '';
    if (k === alertKey) return;
    alertKey = k;
    const el = $('alert');
    if (!kind) { el.className = ''; return; }
    const icon = kind === 'stop' ? '<i class="oct">STOP</i>' : kind === 'red' ? '<i class="lamp red"></i>' : kind === 'yellow' ? '<i class="lamp yellow"></i>' : '<i class="lamp green"></i>';
    el.className = 'show ' + kind;
    el.innerHTML = icon + '<span>' + text + '</span>';
  }

  // ---------- instructor ----------
  let sayTimer = null, sayPriority = 0, sayUntil = 0;
  function say(text, tone = 'info', secs = 4.5) {
    const pri = tone === 'warn' ? 3 : tone === 'good' ? 2 : 1;
    const now = performance.now();
    if (now < sayUntil && pri < sayPriority) return;
    sayPriority = pri; sayUntil = now + secs * 1000;
    const el = $('instructor');
    el.className = 'show ' + tone;
    $('instructorText').textContent = text;
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => { el.classList.remove('show'); sayPriority = 0; }, secs * 1000);
  }
  function toast(text, color, bad) {
    const t = document.createElement('div');
    t.className = 'toast' + (bad ? ' bad' : '');
    if (color) t.style.setProperty('--c', color);
    t.textContent = text;
    $('toasts').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  // ---------- cards ----------
  const ICONS = {
    light: '<svg viewBox="0 0 40 40" width="40" height="40"><rect x="12" y="2" width="16" height="36" rx="5" fill="#1d2733"/><circle cx="20" cy="10" r="4.5" fill="#ff3b30"/><circle cx="20" cy="20" r="4.5" fill="#4a3a10"/><circle cx="20" cy="30" r="4.5" fill="#0f3a22"/></svg>',
    stop: '<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="13,2 27,2 38,13 38,27 27,38 13,38 2,27 2,13" fill="#fff"/><polygon points="14,4.5 26,4.5 35.5,14 35.5,26 26,35.5 14,35.5 4.5,26 4.5,14" fill="#c8102e"/><text x="20" y="24" font-size="10" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">STOP</text></svg>',
    look: '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="13" cy="24" r="8" fill="#fff"/><circle cx="27" cy="24" r="8" fill="#fff"/><rect x="13" y="14" width="14" height="9" fill="#fff"/><circle cx="13" cy="24" r="4" fill="#31777A"/><circle cx="27" cy="24" r="4" fill="#31777A"/></svg>'
  };
  let cardKeyHandler = null;
  let cardOpenedAt = 0;
  function openCard(html, color, light) {
    const card = $('card');
    card.style.setProperty('--c', color);
    card.style.setProperty('--cl', light || '#f5f7fb');
    card.innerHTML = html;
    $('cardLayer').hidden = false;
    cardOpenedAt = performance.now();
    card.scrollTop = 0;
  }
  function closeCard() { $('cardLayer').hidden = true; cardKeyHandler = null; stopSpeaking(); }

  // ---------- read aloud (built-in browser voices, works offline on most devices) ----------
  const canSpeak = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  function stopSpeaking() { if (canSpeak) window.speechSynthesis.cancel(); }
  function addReadAloud(getText) {
    if (!canSpeak) return;
    const chips = document.querySelector('#card .chips');
    const b = document.createElement('button');
    b.className = 'read-btn'; b.type = 'button'; b.textContent = '🔊 Read aloud';
    b.setAttribute('aria-label', 'Read this card aloud');
    b.onclick = () => {
      if (window.speechSynthesis.speaking) { stopSpeaking(); b.textContent = '🔊 Read aloud'; return; }
      const u = new SpeechSynthesisUtterance(getText());
      u.rate = 0.95; u.lang = 'en-US';
      u.onend = u.onerror = () => { b.textContent = '🔊 Read aloud'; };
      b.textContent = '⏹ Stop';
      window.speechSynthesis.speak(u);
    };
    chips.prepend(b);
  }
  function band(icon, kicker, title, chips) {
    return `<div class="card-band"><div class="trigger">${ICONS[icon]}</div>
      <div><div class="kicker">${esc(kicker)}</div><h2 id="cardTitle">${esc(title)}</h2></div>
      <div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>`;
  }

  /**
   * opts: { q, order (array of original option indexes), chipCredit, secondLook, practice,
   *         onAnswer(correct) -> { title, stamp }, onClose() }
   */
  function showQuestion(opts) {
    const { q } = opts;
    const cat = catById[q.category];
    const ex = q.exhibit ? `<div class="exhibit ${esc(q.exhibit.kind || '')}"><div class="ex-label">${esc(q.exhibit.label || 'Example')}</div><div class="ex-content">${esc(q.exhibit.content)}</div></div>` : '';
    const html = band('light', 'Red light · AI question', cat.label, [q.type, opts.chipCredit]) + `
      <div class="card-body">
        ${opts.secondLook ? '<div class="second-look">🔁 Second look: you missed this one earlier</div>' : ''}
        ${ex}
        <p class="question">${esc(q.question)}</p>
        <div class="opts" role="group" aria-label="Answer choices">
          ${opts.order.map((oi, k) => `<button class="opt" data-k="${k}" data-oi="${oi}"><span class="key">${k + 1}</span><span>${esc(q.options[oi])}</span></button>`).join('')}
        </div>
        <div id="verdictSlot"></div>
        <div class="card-foot"><span class="hint">Choose with a click or keys 1–4</span><span></span></div>
      </div>`;
    openCard(html, cat.color, cat.light);
    let answered = false;
    const buttons = [...document.querySelectorAll('#card .opt')];
    const choose = (k) => {
      if (answered) return;
      answered = true;
      const oi = Number(buttons[k].dataset.oi);
      const correct = oi === q.answer;
      buttons.forEach((b) => {
        b.disabled = true;
        const boi = Number(b.dataset.oi);
        if (boi === q.answer) b.classList.add('correct');
        else if (b === buttons[k]) b.classList.add('wrong');
        else b.classList.add('faded');
      });
      const res = opts.onAnswer(correct);
      const best = esc(q.options[q.answer]);
      $('verdictSlot').innerHTML = correct
        ? `<div class="verdict good"><div class="stamp">${res.stamp}</div><div><b>${esc(res.title)}</b><p>${esc(q.reason)}</p></div></div>`
        : `<div class="verdict bad"><div class="stamp">🔁</div><div><b>${esc(res.title)}</b><p><span style="color:var(--muted)">Best answer:</span> ${best}<br>${esc(q.reason)}</p></div></div>`;
      document.querySelector('#card .card-foot').innerHTML = `<span class="hint">Press Enter to continue</span><button class="btn primary" id="cardContinue">Continue</button>`;
      const cont = $('cardContinue');
      cont.focus({ preventScroll: true });
      cont.onclick = () => { closeCard(); opts.onClose(correct); };
    };
    buttons.forEach((b, k) => { b.onclick = () => choose(k); });
    addReadAloud(() => {
      const v = document.querySelector('#card .verdict');
      if (v) return v.innerText.replace(/\s+/g, ' ');
      return q.question + ' ' + opts.order.map((oi, k) => 'Option ' + (k + 1) + ': ' + q.options[oi] + '.').join(' ');
    });
    buttons[0].focus({ preventScroll: true });
    cardKeyHandler = (e) => {
      if (performance.now() - cardOpenedAt < 350 || e.repeat) return;
      if (!answered && /^Digit[1-4]$|^Numpad[1-4]$/.test(e.code)) { choose(Number(e.code.slice(-1)) - 1); e.preventDefault(); }
      else if (answered && (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space')) { e.preventDefault(); $('cardContinue').click(); }
    };
  }

  function showNote(opts) {
    const { note, index, total, review } = opts;
    const k = noteKinds[note.kind] || noteKinds['how-ai-works'];
    const html = band('stop', 'Stop sign · Road Note', k.icon + ' ' + k.label, [review ? 'Review' : 'Note ' + index + ' of ' + total, 'No quiz']) + `
      <div class="card-body">
        <h3 class="note-title">${esc(note.title)}</h3>
        <p class="note-body">${esc(note.body)}</p>
        ${note.source ? `<div class="note-source">Source: ${esc(note.source)}</div>` : ''}
        <div class="card-foot"><span class="hint">Saved to your Road Notes logbook · Enter to drive on</span><button class="btn primary" id="cardContinue">Drive on</button></div>
      </div>`;
    openCard(html, k.color, k.light);
    addReadAloud(() => note.title + '. ' + note.body);
    const cont = $('cardContinue');
    cont.focus({ preventScroll: true });
    cont.onclick = () => { closeCard(); opts.onClose(); };
    cardKeyHandler = (e) => {
      if (performance.now() - cardOpenedAt < 500 || e.repeat) return;
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') { e.preventDefault(); cont.click(); }
    };
  }

  function showReflection(opts) {
    const r = opts.r;
    const html = band('look', 'Scenic overlook · Think it over', 'AI & Society', ['No right answer']) + `
      <div class="card-body">
        <p class="reflect-prompt">${esc(r.prompt)}</p>
        <div class="reflect-nudge">💭 ${esc(r.nudge)}</div>
        <p class="muted" style="font-weight:700;margin:12px 0 0">Take a breath and enjoy the view. Talk it over with a partner, or just think it through. There is no wrong answer here.</p>
        <div class="card-foot"><span class="hint">Enter to head back</span><button class="btn primary" id="cardContinue">Back to the road</button></div>
      </div>`;
    openCard(html, '#31777A', '#DDEFF0');
    addReadAloud(() => r.prompt + ' ' + r.nudge);
    const cont = $('cardContinue');
    cont.focus({ preventScroll: true });
    cont.onclick = () => { closeCard(); opts.onClose(); };
    cardKeyHandler = (e) => {
      if (performance.now() - cardOpenedAt < 500 || e.repeat) return;
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') { e.preventDefault(); cont.click(); }
    };
  }
  const handleCardKey = (e) => { if (cardKeyHandler) cardKeyHandler(e); return !!cardKeyHandler; };

  // ---------- maps ----------
  const W0 = -300, W1 = 520, Z0 = -300, Z1 = 300; // world window covered by the static map
  const PXM = 1.6; // pixels per metre on the static layer
  const staticMap = document.createElement('canvas');
  staticMap.width = Math.round((W1 - W0) * PXM); staticMap.height = Math.round((Z1 - Z0) * PXM);
  const toPx = (x, z) => [(x - W0) * PXM, (z - Z0) * PXM];
  (function drawStatic() {
    const g = staticMap.getContext('2d');
    g.fillStyle = '#8fbf73'; g.fillRect(0, 0, staticMap.width, staticMap.height);
    // lake
    g.fillStyle = '#e6d3a3'; g.beginPath(); g.ellipse(...toPx(map.colX(map.N - 1) + map.colW(map.N - 1) / 2 + 260, 20), 230 * PXM, 270 * PXM, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5aa0dc'; g.beginPath(); g.ellipse(...toPx(map.colX(map.N - 1) + map.colW(map.N - 1) / 2 + 260, 20), 220 * PXM, 260 * PXM, 0, 0, Math.PI * 2); g.fill();
    const blockCol = { downtown: '#d6d0c4', shops: '#e5c9a8', homes: '#b5d69a', school: '#d9b3a3', plaza: '#efe4cf', park: '#79b766', office: '#c9d9ec' };
    for (const b of map.blocks) {
      g.fillStyle = blockCol[b.type] || '#ccc';
      const [x0, z0] = toPx(b.x0, b.z0), [x1, z1] = toPx(b.x1, b.z1);
      g.fillRect(x0, z0, x1 - x0, z1 - z0);
      if (b.type === 'park') { g.fillStyle = '#5aa0dc'; const c = toPx((b.x0 + b.x1) / 2 + 10, (b.z0 + b.z1) / 2); g.beginPath(); g.ellipse(c[0], c[1], 34 * PXM, 19 * PXM, 0, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = '#5b6068';
    for (const r of map.drive) { const [x0, z0] = toPx(r.x0, r.z0), [x1, z1] = toPx(r.x1, r.z1); g.fillRect(x0, z0, x1 - x0, z1 - z0); }
    g.strokeStyle = 'rgba(255,214,90,.75)'; g.lineWidth = 1.2; g.setLineDash([5, 5]);
    for (const s of map.segments) {
      const a = map.nodes[s.a], b = map.nodes[s.b];
      g.beginPath(); g.moveTo(...toPx(a.x, a.z)); g.lineTo(...toPx(b.x, b.z)); g.stroke();
    }
    g.setLineDash([]);
    for (const n of map.nodes) {
      const [x, z] = toPx(n.x, n.z);
      if (n.kind === 'signal') {
        g.fillStyle = '#1d2733'; g.fillRect(x - 6, z - 6, 12, 12);
        g.fillStyle = '#ffc233'; g.beginPath(); g.arc(x, z, 3, 0, Math.PI * 2); g.fill();
      } else if (n.kind === 'stop' && n.allWay) {
        g.fillStyle = '#c8102e'; g.beginPath();
        for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k * Math.PI / 4; g.lineTo(x + Math.cos(a) * 6.5, z + Math.sin(a) * 6.5); }
        g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke();
      } else if (n.kind === 'stop') {
        // two-way stop: small octagons only on the stopping arms
        for (const k of ['N', 'E', 'S', 'W']) {
          if (n.exits[k] === null || !map.stopsFor(n, (k === 'N' || k === 'S') ? 'ns' : 'ew')) continue;
          const d = U.DIRS[k], ax = x + d.x * 11, az = z + d.z * 11;
          g.fillStyle = '#c8102e'; g.beginPath();
          for (let q = 0; q < 8; q++) { const a = Math.PI / 8 + q * Math.PI / 4; g.lineTo(ax + Math.cos(a) * 4.5, az + Math.sin(a) * 4.5); }
          g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.stroke();
        }
      }
    }
    // landmarks
    const [ox, oz] = toPx(map.finishSpot.x, map.finishSpot.z);
    g.fillStyle = '#ffc233'; g.strokeStyle = '#8a5d00'; g.lineWidth = 2;
    g.beginPath(); g.arc(ox, oz, 9, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#5a3d00'; g.font = 'bold 11px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', ox, oz + 1);
    const [lx, lz] = toPx(map.overlookSpot.x, map.overlookSpot.z);
    g.fillStyle = '#37c3c3'; g.beginPath(); g.arc(lx, lz, 7, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.stroke();
  })();

  function drawPlayerArrow(g, x, z, heading, size) {
    g.save(); g.translate(x, z); g.rotate(-heading + Math.PI);
    g.beginPath(); g.moveTo(0, -size); g.lineTo(size * 0.72, size * 0.8); g.lineTo(0, size * 0.4); g.lineTo(-size * 0.72, size * 0.8); g.closePath();
    g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#13294b'; g.stroke();
    g.restore();
  }
  function drawRoute(g, pts, tx) {
    if (!pts || pts.length < 2) return;
    g.strokeStyle = '#ffc233'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); pts.forEach((p, k) => { const [x, z] = tx(p.x, p.z); if (k) g.lineTo(x, z); else g.moveTo(x, z); }); g.stroke();
  }

  const mini = $('minimap'), mg = mini.getContext('2d');
  function drawMinimap(player, heading, route) {
    const W = mini.width, H = mini.height;
    const viewM = 170; // metres shown across
    const scale = W / viewM;
    mg.clearRect(0, 0, W, H);
    mg.save();
    mg.beginPath(); mg.arc(W / 2, H / 2, W / 2 - 1, 0, Math.PI * 2); mg.clip();
    mg.fillStyle = '#8fbf73'; mg.fillRect(0, 0, W, H);
    // the map turns so "up" is always the way the car is facing
    mg.translate(W / 2, H / 2);
    mg.rotate(heading + Math.PI);
    const span = viewM * 1.45;
    mg.drawImage(staticMap, (player.x - span / 2 - W0) * PXM, (player.z - span / 2 - Z0) * PXM, span * PXM, span * PXM, -span * scale / 2, -span * scale / 2, span * scale, span * scale);
    drawRoute(mg, route, (x, z) => [(x - player.x) * scale, (z - player.z) * scale]);
    mg.restore();
    drawPlayerArrow(mg, W / 2, H / 2, Math.PI, 10);
    // north marker on the rim
    const th = heading + Math.PI, nx = W / 2 + Math.sin(th) * (W / 2 - 13), ny = H / 2 - Math.cos(th) * (H / 2 - 13);
    mg.fillStyle = '#13294b'; mg.beginPath(); mg.arc(nx, ny, 9, 0, Math.PI * 2); mg.fill();
    mg.fillStyle = '#fff'; mg.font = 'bold 11px Arial'; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText('N', nx, ny + 1);
    mg.strokeStyle = 'rgba(19,41,75,.35)'; mg.lineWidth = 2; mg.beginPath(); mg.arc(W / 2, H / 2, W / 2 - 1, 0, Math.PI * 2); mg.stroke();
  }
  function drawBigMap(player, heading, route) {
    const c = $('bigmap'), g = c.getContext('2d');
    const W = c.width, H = c.height;
    const x0 = -290, x1 = 300, z0 = -295, z1 = 295;
    const scale = W / (x1 - x0);
    g.clearRect(0, 0, W, H);
    g.drawImage(staticMap, (x0 - W0) * PXM, (z0 - Z0) * PXM, (x1 - x0) * PXM, (z1 - z0) * PXM, 0, 0, W, H);
    const tx = (x, z) => [(x - x0) * scale, (z - z0) * scale];
    drawRoute(g, route, tx);
    // street labels
    g.font = 'bold 12px Arial'; g.fillStyle = 'rgba(19,41,75,.9)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const labelled = new Set();
    for (const s of map.segments) {
      if (labelled.has(s.name + s.axis)) continue;
      const a = map.nodes[s.a], b = map.nodes[s.b];
      if (s.axis === 'x' && a.i !== 2) continue;
      if (s.axis === 'z' && a.j !== 1) continue;
      labelled.add(s.name + s.axis);
      const [x, z] = tx((a.x + b.x) / 2, (a.z + b.z) / 2);
      g.save(); g.translate(x, z); if (s.axis === 'z') g.rotate(-Math.PI / 2);
      const w = g.measureText(s.name).width + 10;
      g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(-w / 2, -8, w, 16);
      g.fillStyle = '#13294b'; g.fillText(s.name, 0, 1); g.restore();
    }
    const [ox, oz] = tx(map.finishSpot.x, map.finishSpot.z);
    g.fillStyle = '#13294b'; g.font = 'bold 13px Arial'; g.fillText('Permit Office', ox, oz + 20);
    const [lx, lz] = tx(map.overlookSpot.x, map.overlookSpot.z);
    g.fillText('Overlook', lx + 6, lz + 18);
    const [px, pz] = tx(player.x, player.z);
    drawPlayerArrow(g, px, pz, heading, 11);
  }

  // ---------- screens ----------
  function show(id, on = true) { $(id).hidden = !on; }

  function renderNotes(allNotes, seen) {
    $('notesSummary').textContent = `You have collected ${seen.length} of ${allNotes.length} Road Notes. Make full stops at stop signs to collect more.`;
    const seenSet = new Set(seen);
    const order = seen.map((id) => allNotes.find((n) => n.id === id)).filter(Boolean);
    const lockedCount = allNotes.length - order.length;
    $('notesList').innerHTML = order.map((n) => {
      const k = noteKinds[n.kind] || noteKinds['how-ai-works'];
      return `<div class="note-tile" style="--c:${k.color};--cl:${k.light}"><div class="k">${k.icon} ${esc(k.label)}</div><b>${esc(n.title)}</b><p>${esc(n.body)}</p></div>`;
    }).join('') + Array.from({ length: Math.min(lockedCount, 6) }, () => '<div class="note-tile locked">🛑 Stop to unlock</div>').join('');
    void seenSet;
  }

  function rating(score) { const n = score >= 92 ? 5 : score >= 78 ? 4 : score >= 62 ? 3 : score >= 40 ? 2 : 1; return '★'.repeat(n) + '☆'.repeat(5 - n); }

  function renderLog(d) {
    const st = d.stats;
    const pct = st.questions ? Math.round((d.firstTry / Math.max(1, d.firstTryAsked)) * 100) : 0;
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const credits = cats.map((c) => `<div class="log-credit"><span>${c.icon}</span><span>${esc(c.label)}</span><b style="color:${c.color}">${Math.min(d.credits[c.id], d.goal)} / ${d.goal}</b></div>`).join('');
    const row = (k, v) => `<div class="log-row"><span>${k}</span><b>${v}</b></div>`;
    $('logSheet').innerHTML = `
      <div class="log-head">
        <div><div class="kicker">The AI Permit Game · AI Road Test</div><h2>${d.final ? 'Permit Drive Log: Signed' : 'Permit Drive Log: In progress'}</h2>
        <div style="opacity:.85;font-weight:700;margin-top:4px">${esc(d.name || 'Student Driver')} · ${date}</div></div>
        ${d.final ? '<div class="log-seal">LOG<br>SIGNED<br>✓</div>' : ''}
      </div>
      <div class="log-body">
        <div class="log-grid">
          <div class="log-box"><h4>Permit credits</h4>${credits}
            ${row('Practice hours logged', Math.min(d.hours, d.hoursGoal) + ' of ' + d.hoursGoal)}
            ${row('Questions answered', st.questions)}
            ${row('Correct on the first try', pct + '%')}
          </div>
          <div class="log-box"><h4>Driving record</h4>
            <div class="log-row"><span>Instructor rating</span><b class="rating" style="color:#e3a514">${rating(d.score)}</b></div>
            ${row('Safe-driving score', Math.round(d.score) + ' / 100')}
            ${row('Full stops at stop signs', st.fullStops)}
            ${row('Perfect stops at the line', st.perfectStops || 0)}
            ${row('Waited at red lights', st.redStops)}
            ${row('Turn signals used', st.signaled + ' of ' + st.turns + ' turns')}
            ${row('Red lights run', st.redRun)}
            ${row('Rolling stops', st.rolled)}
            ${row('Speeding', st.speeding)}
            ${row('Wrong side of the road', st.wrongSide)}
            ${row('Bumps and collisions', st.crashes + st.curbs)}
          </div>
          <div class="log-box"><h4>Road knowledge</h4>
            ${row('Road Notes collected', d.notesSeen + ' of ' + d.notesTotal)}
            ${row('Overlook reflections', st.reflections)}
          </div>
          <div class="log-box"><h4>Drive</h4>
            ${row('Time behind the wheel', Math.max(1, Math.round(st.time / 60)) + ' min')}
            ${row('Distance', (st.distance / 1609.34).toFixed(1) + ' mi')}
          </div>
        </div>
        ${d.final ? `<div class="log-next"><div class="big">🎓</div><div><b>Next on your pathway: the AI License test</b><span>You logged your permit drive. Review your Road Notes, then take the AI License test when your teacher says you're ready.</span></div></div>` : ''}
        <div class="log-actions">
          ${d.final ? '<button class="btn" id="logPrint">Print log</button><button class="btn" id="logFree">Keep driving</button><button class="btn primary" id="logNew">Start a new drive</button>'
            : '<button class="btn" id="logPrint">Print log</button><button class="btn primary" id="logBack">Back</button>'}
        </div>
      </div>`;
  }

  return {
    buildPermit, setAlert, stopSpeaking, setPermit, setName, setNotes, setScore, setHours, setCreditsBadge, confetti, setSpeed, setBlinker, setStreet, setObjective, say, toast,
    showQuestion, showNote, showReflection, closeCard, handleCardKey, drawMinimap, drawBigMap, show, renderNotes, renderLog, $
  };
};
