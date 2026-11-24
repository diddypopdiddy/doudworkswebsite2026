'use strict';

/* ============================================================
   Grouper MVP — classroom groups + seating charts
   Plain JS, no build step. Data lives in localStorage.
   ============================================================ */

const STORE_KEY = 'vincedoud.grouper.public.v1';
const DW = 92, DH = 50;          // desk size (px), matches CSS vars
const GRID = 10;                 // snap grid for desk moves
const FRONT_H = 44;              // reserved band for "Front of room"
const MIN_W = 960, MIN_H = 600;  // minimum canvas size

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hue = id => { let h = 7; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
const snap = v => Math.round(v / GRID) * GRID;

/* ---------------- Icons ----------------
   Simple line icons drawn inline (no emoji, no downloads). icon('shuffle') → <svg>. */
const ICON_PATHS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  seat: '<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  present: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  userX: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5"/><path d="m22 8-5 5"/>',
  layers: '<path d="m12 2-10 5 10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  spread: '<path d="m18 8 4 4-4 4"/><path d="m6 8-4 4 4 4"/><path d="M2 12h20"/>',
  together: '<path d="M2 12h6"/><path d="M22 12h-6"/><path d="m19 9-3 3 3 3"/><path d="m5 15 3-3-3-3"/><path d="M12 4v16"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  userMinus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  eraser: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  toggle: '<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="8" cy="12" r="2"/>',
};
const icon = (name, cls = '') =>
  `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
// Fill the static icons in index.html (<i data-icon="name">).
document.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });

/* ---------------- State & persistence ---------------- */

function newClass(name) {
  return {
    id: uid(), name, students: [], groups: [], groupConfig: { mode: 'count', n: 4 }, desks: [],
    labels: [],      // [{ id, name, hue, enabled, dir: 'out'|'in' }] — private tags like "On camera"; each is also a rule
    rules: [],       // see RULE_TYPES in rules.js
    prevGroups: [],  // last shuffle's groups, for the "Mix it up" rule
    prevSeatPairs: [], // who sat next to whom before the last seat shuffle
  };
}
const LABEL_HUES = [200, 30, 140, 280, 350, 90, 250, 0, 170, 310];

let firstPublicVisit = true;
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && Array.isArray(s.classes) && s.classes.length) {
      const clean = normalize(s);
      firstPublicVisit = false;
      return clean;
    }
  } catch { /* fall through to a fresh state */ }
  const c = newClass('Period 1');
  return { classes: [c], currentClassId: c.id, templates: [], view: 'groups', showRules: false, folds: {} };
}

function normalize(s) {
  s.templates = s.templates || [];
  s.view = s.view === 'seats' ? 'seats' : 'groups';
  s.showRules = false;
  s.folds = s.folds || {};   // always start hidden, so a reload never puts rule marks in front of students
  s.classes = s.classes.map(c => {
    const k = Object.assign(newClass(c.name || 'Class'), c);
    // Older saves kept keep-apart pairs in `apart`; turn them into a rule.
    if (Array.isArray(k.apart) && k.apart.length) k.rules.unshift({ id: uid(), type: 'apart', enabled: true, pairs: k.apart });
    delete k.apart;
    k.students.forEach(st => { st.labels = st.labels || []; st.absent = !!st.absent; });
    // Labels used to need a separate "label rule"; now each label carries its own on/off and direction.
    k.labels.forEach(l => {
      const r = k.rules.find(r => r.type === 'label' && r.labelId === l.id);
      if (r) { l.enabled = r.enabled; l.dir = r.dir; }
      if (l.enabled === undefined) l.enabled = false;
      if (l.dir !== 'in') l.dir = 'out';
    });
    k.rules = k.rules.filter(r => RULE_TYPES[r.type]);
    return k;
  });
  if (!s.classes.some(c => c.id === s.currentClassId)) s.currentClassId = s.classes[0].id;
  return s;
}

let state = load();
let undoStack = [], redoStack = [];
let selected = new Set();     // selected desk ids (seating view)
let deskClipboard = [];
let rulesOpen = false;
let pickRule = null;          // rule id while waiting for the teacher to click a student

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  const el = $('#saved');
  el.innerHTML = `${icon('check')} Saved`;
  el.classList.add('flash');
  clearTimeout(save.t);
  save.t = setTimeout(() => { el.classList.remove('flash'); el.textContent = 'Saved'; }, 1200);
}

const cls = () => state.classes.find(c => c.id === state.currentClassId) || state.classes[0];

/** Run a mutation on the current class with undo support. */
function commit(fn) {
  const c = cls();
  pushUndo(c);
  fn(c);
  save();
  render();
}
function pushUndo(c, snapshot = JSON.stringify(c)) {
  undoStack.push({ classId: c.id, snap: snapshot });
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
}
function swapHistory(from, to) {
  const e = from.pop();
  if (!e) return toast('Nothing to ' + (from === undoStack ? 'undo' : 'redo'));
  const i = state.classes.findIndex(c => c.id === e.classId);
  if (i < 0) return;
  to.push({ classId: e.classId, snap: JSON.stringify(state.classes[i]) });
  state.classes[i] = JSON.parse(e.snap);
  state.currentClassId = e.classId;
  selected.clear();
  save();
  render();
}
const undo = () => swapHistory(undoStack, redoStack);
const redo = () => swapHistory(redoStack, undoStack);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------- Helpers on a class ---------------- */

const nameOf = (c, id) => (c.students.find(s => s.id === id) || {}).name || '?';
const presentIds = c => c.students.filter(s => !s.absent).map(s => s.id);
const abbr = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

/* ---------------- Grouping ---------------- */

function groupSizes(n, cfg) {
  const want = Math.max(1, Number(cfg.n) || 1);
  const k = cfg.mode === 'count' ? Math.min(want, n) : Math.ceil(n / want);
  const base = Math.floor(n / k), extra = n % k;
  return Array.from({ length: k }, (_, i) => base + (i < extra ? 1 : 0));
}

function sizeSummary(n, cfg) {
  if (!n) return 'Add students to the roster first.';
  const sizes = groupSizes(n, cfg);
  const lo = Math.min(...sizes), hi = Math.max(...sizes);
  return `${n} students → ${sizes.length} group${sizes.length > 1 ? 's' : ''} of ${lo === hi ? lo : lo + '–' + hi}`;
}

/** New groups for everyone present, following the class's rules (see rules.js). */
function makeGroups(c) {
  const ids = presentIds(c);
  const { groups, score } = solveGroups(c, ids, groupSizes(ids.length, c.groupConfig));
  return {
    groups: groups.map((g, i) => ({ id: uid(), name: (c.groups[i] && c.groups[i].name) || `Group ${i + 1}`, studentIds: g })),
    score,
  };
}

/* ---------------- Seating ---------------- */

/** Desks count as neighbors when they touch or nearly touch (side, front/back, or diagonal). */
const adjacent = (d1, d2) => d1 !== d2 && Math.abs(d1.x - d2.x) <= DW * 1.5 && Math.abs(d1.y - d2.y) <= DH * 1.8;

function findFreeSpot(c) {
  const overlaps = (x, y) => c.desks.some(d => Math.abs(d.x - x) < DW + 8 && Math.abs(d.y - y) < DH + 8);
  for (let y = FRONT_H + 40; y < 2000; y += DH + 30) {
    for (let x = 40; x < MIN_W - DW; x += DW + 30) if (!overlaps(x, y)) return { x, y };
  }
  return { x: 40, y: FRONT_H + 40 };
}

function layoutPositions(kind, n) {
  const P = [], top = FRONT_H + 50, left = 40;
  if (kind === 'rows') {
    for (let i = 0; i < n; i++) P.push({ x: left + (i % 6) * (DW + 40), y: top + Math.floor(i / 6) * (DH + 40) });
  } else if (kind === 'pairs') {
    for (let i = 0; i < n; i++) {
      const pair = Math.floor(i / 2);
      P.push({ x: left + (pair % 3) * (2 * DW + 90) + (i % 2) * (DW + 4), y: top + Math.floor(pair / 3) * (DH + 44) });
    }
  } else if (kind === 'pods') {
    for (let i = 0; i < n; i++) {
      const pod = Math.floor(i / 4), k = i % 4;
      P.push({
        x: left + (pod % 3) * (2 * DW + 100) + (k % 2) * (DW + 4),
        y: top + Math.floor(pod / 3) * (2 * DH + 70) + Math.floor(k / 2) * (DH + 4),
      });
    }
  } else if (kind === 'u') {
    const L = Math.ceil(n / 3), B = Math.ceil((n - L) / 2), R = n - L - B;
    const bx = left + DW + 30, rx = bx + B * (DW + 8) + 22;
    for (let i = 0; i < L; i++) P.push({ x: left, y: top + i * (DH + 10) });
    for (let i = 0; i < B; i++) P.push({ x: bx + i * (DW + 8), y: top + L * (DH + 10) + 10 });
    for (let i = 0; i < R; i++) P.push({ x: rx, y: top + i * (DH + 10) });
  }
  return P.map(p => ({ x: snap(p.x), y: snap(p.y) }));
}

/* ---------------- Rendering ---------------- */

function render() {
  const c = cls();
  // Never show an empty board: a class with students but no groups gets a first set right away,
  // so names are always there to click (for rules) or drag.
  if (!c.groups.length && presentIds(c).length) { c.groups = makeGroups(c).groups; save(); }
  document.body.dataset.view = state.view;
  document.body.classList.toggle('show-rules', state.showRules);
  document.body.classList.toggle('picking', !!pickRule);
  const eye = $('#eyeBtn');
  eye.innerHTML = state.showRules ? `${icon('eye')} Rules shown` : `${icon('eyeOff')} Rules hidden`;
  eye.classList.toggle('on', state.showRules);
  eye.title = state.showRules ? 'Hide rules, labels and rule checks from the screen' : 'Show rules, labels and how the shuffle is working';
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  $('#headerClass').textContent = '· ' + c.name;
  renderLeft(c);
  renderRulesDrawer(c);
  if (state.view === 'groups') { renderGroupsMain(c); renderGroupsRight(c); }
  else { renderSeatsMain(c); renderSeatsRight(c); }
}

/** A section that folds away. Open/closed is remembered per section. */
function fold(key, title, body, openByDefault = false) {
  const open = key in state.folds ? state.folds[key] : openByDefault;
  return `<details class="fold" data-fold="${key}"${open ? ' open' : ''}>
    <summary><h3>${title}</h3><span class="chev" aria-hidden="true"></span></summary>
    <div class="fold-body">${body}</div>
  </details>`;
}

function renderLeft(c) {
  const rosterFocused = document.activeElement && document.activeElement.id === 'roster';
  const draft = rosterFocused ? $('#roster').value : null;
  const absent = c.students.filter(s => s.absent).length;
  $('#left').innerHTML = `
    <section>
      <div class="sec-head"><h3>Classes</h3>
        <button class="icon-btn" data-act="add-class" title="New class" aria-label="New class">${icon('plus')}</button></div>
      <ul class="class-list">
        ${state.classes.map(k => `<li><button data-act="switch-class" data-cid="${esc(k.id)}" class="${k.id === c.id ? 'active' : ''}">
          <span class="class-name">${esc(k.name)}</span><span class="meta" title="${k.students.length} students">${k.students.length}</span></button></li>`).join('')}
      </ul>
    </section>
    <section class="stack">
      <button data-act="absent" class="with-icon absent-btn${absent ? ' has-absent' : ''}">${icon('userX')} Who's absent?
        ${absent ? `<span class="pill-count">${absent} out</span>` : ''}</button>
    </section>
    ${fold('roster', `Roster <span class="count">${c.students.length}</span>`, `
      <textarea id="roster" placeholder="One name per line&#10;Paste from a spreadsheet works too">${esc(c.students.map(s => s.name).join('\n'))}</textarea>
      <button data-act="save-roster" class="primary">${icon('check')} Save roster</button>`, !c.students.length)}
    ${fold('classSettings', 'Class settings', `
      <label>Class name<input type="text" id="className" value="${esc(c.name)}"></label>
      <button data-act="delete-class" class="danger">${icon('trash')} Delete this class</button>`)}
    ${fold('data', 'Backup & import', `
      <div class="row"><button data-act="export">${icon('download')} Export</button><button data-act="import">${icon('upload')} Import</button></div>
      <button data-act="sample">Try a fictional sample class</button>
      <p class="hint">Import only a trusted file. Exported files contain exactly the roster and class data you save here. Keep them private.</p>`)}`;
  if (rosterFocused) { const r = $('#roster'); r.value = draft; r.focus(); }
}

/* ---- Rules & labels panel (only drawn while the eye is on) ---- */

/* The sidebar only shows a button; the rules themselves live in a pop-out panel
   that's closed by default, so nothing about them sits on screen in front of students. */
const rulesSection = () => `
    <section class="stack">
      <h3>Rules</h3>
      <button data-act="open-rules" title="Private: only opens when you click it">${icon('lock')} Open rules</button>
    </section>`;

function renderRulesDrawer(c) {
  let d = $('#rulesDrawer');
  if (!rulesOpen) { if (d) d.remove(); return; }
  if (!d) {
    d = document.createElement('div');
    d.id = 'rulesDrawer';
    d.className = 'drawer-back opening';
    document.body.appendChild(d);
    setTimeout(() => d.classList.remove('opening'), 250);
  }
  const scroll = d.querySelector('.drawer')?.scrollTop || 0;
  d.innerHTML = `<div class="drawer" role="dialog" aria-label="Rules">
      <button class="link drawer-close" data-act="close-rules" title="Close (Esc)" aria-label="Close">${icon('x')}</button>
      <h3>Rule check · ${state.view === 'seats' ? 'Seating chart' : 'Groups'}</h3>
      ${ruleReport(c, state.view === 'seats' ? evaluateSeats(c) : evaluateGroups(c), 'in-drawer') || '<p class="hint">No rules on yet.</p>'}
      ${rulesList(c)}
    </div>`;
  d.querySelector('.drawer').scrollTop = scroll;
}

function rulesList(c) {
  const on = c.rules.filter(r => r.enabled).length + c.labels.filter(l => l.enabled).length;
  const missing = LABEL_SUGGESTIONS.filter(n => !c.labels.some(l => l.name.toLowerCase() === n.toLowerCase()));
  const cards = [...c.rules.map(r => ruleCard(c, r)), ...c.labels.map(l => labelCard(c, l))].join('');
  return `
    <section>
      <h3>Rules <span class="count">(${on} on)</span></h3>
      <select id="addRule" aria-label="Add a rule">
        <option value="">+ Add a rule…</option>
        <optgroup label="Students">
          ${Object.entries(RULE_TYPES).map(([k, t]) => `<option value="${k}">${t.name}</option>`).join('')}
        </optgroup>
        <optgroup label="Roles / labels (one per group, or all together)">
          ${missing.map(n => `<option value="label:${esc(n)}">${esc(n)}</option>`).join('')}
          <option value="label:">New label…</option>
        </optgroup>
      </select>
      <div class="rule-list">${cards || '<p class="hint">No rules yet. Add one above.</p>'}</div>
    </section>`;
}

function labelHint(c, l) {
  const ids = presentIds(c);
  const m = c.students.filter(s => !s.absent && s.labels.includes(l.id)).length;
  if (!m) return 'Nobody has this yet. Click <b>Choose students</b>.';
  const sizes = ids.length ? groupSizes(ids.length, c.groupConfig) : [];
  const k = sizes.length;
  if (l.dir === 'in') {
    const need = Math.ceil(m / Math.max(1, ...sizes));
    return `${m} students go in the same group${need > 1 ? ` (needs ${need} groups — they don't fit in one)` : ''} and sit next to each other.`;
  }
  if (!k) return `${m} students.`;
  const lo = Math.floor(m / k), hi = Math.ceil(m / k);
  const per = m < k ? `only ${m} for ${k} groups, so ${k - m} group${k - m > 1 ? 's' : ''} won't get one`
    : lo === hi ? `${lo} per group` : `${lo}–${hi} per group`;
  return `${m} students · ${k} groups → ${per}. In seating, they won't sit next to each other.`;
}

/** Shared card frame: the title is the on/off switch (crossed out when off). */
function card({ enabled, title, act, idAttr, dot = '', scope = '', del, body }) {
  return `
    <div class="rule-card${enabled ? '' : ' off'}">
      <div class="rule-head">
        <button class="rule-toggle" data-act="${act}" ${idAttr} aria-pressed="${enabled}" title="${enabled ? 'On — click to turn off' : 'Off — click to turn on'}">${dot}<b>${title}</b></button>
        ${scope ? `<span class="scope">${scope}</span>` : ''}
        <button class="link" ${del} title="Delete" aria-label="Delete">${icon('x')}</button>
      </div>
      ${enabled ? body : ''}
    </div>`;
}

function ruleCard(c, r) {
  const t = RULE_TYPES[r.type];
  if (!t) return '';
  const scope = t.scope === 'groups' ? 'Groups only' : t.scope === 'seats' ? 'Seating only' : '';
  let body = '';
  if (r.type === 'apart' || r.type === 'together') {
    const picking = pickRule === r.id;
    body = `
      ${r.pairs.length ? `<ul class="pairs">${r.pairs.map(([a, b], i) => `<li><span>${esc(nameOf(c, a))} <b title="${r.type === 'apart' ? 'kept apart' : 'kept together'}">${icon(r.type === 'apart' ? 'x' : 'link', 'sm')}</b> ${esc(nameOf(c, b))}</span>
        <button class="link" data-act="remove-pair" data-rid="${esc(r.id)}" data-i="${i}" title="Remove this pair" aria-label="Remove this pair">${icon('x', 'sm')}</button></li>`).join('')}</ul>` : `<p class="hint">${t.help}</p>`}
      <button class="small${picking ? ' active' : ''}" data-act="pick" data-rid="${esc(r.id)}">${picking ? 'Now click a student… (Esc to cancel)' : '+ Pick a student'}</button>`;
  } else if (r.type === 'front') {
    body = `${r.students.length ? `<p class="names">${r.students.map(id => esc(nameOf(c, id))).join(', ')}</p>` : `<p class="hint">${t.help}</p>`}
      <button class="small" data-act="choose-front" data-rid="${esc(r.id)}">Choose students</button>`;
  } else {
    body = `<p class="hint">${t.help}</p>`;
  }
  const n = r.pairs ? r.pairs.length : r.students ? r.students.length : 0;
  return card({
    enabled: r.enabled, act: 'toggle-rule', idAttr: `data-rid="${esc(r.id)}"`, scope,
    title: `${esc(t.name)}${n ? ` <span class="count">${n}</span>` : ''}`,
    del: `data-act="delete-rule" data-rid="${esc(r.id)}"`, body,
  });
}

function labelCard(c, l) {
  const n = c.students.filter(s => s.labels.includes(l.id)).length;
  const body = `
      <div class="seg">
        <button data-act="label-dir" data-lid="${esc(l.id)}" data-dir="out" class="${l.dir !== 'in' ? 'on' : ''}" title="Spread out: one per group">${icon('spread')} Spread out</button>
        <button data-act="label-dir" data-lid="${esc(l.id)}" data-dir="in" class="${l.dir === 'in' ? 'on' : ''}" title="Put them together">${icon('together')} Together</button>
      </div>
      <button class="small" data-act="edit-label" data-lid="${esc(l.id)}">Choose students (${n})</button>
      <p class="hint">${labelHint(c, l)}</p>`;
  return card({
    enabled: l.enabled, act: 'toggle-label', idAttr: `data-lid="${esc(l.id)}"`,
    dot: `<i class="dot" style="--h:${Number(l.hue)}">${esc(abbr(l.name))}</i>`,
    title: `${esc(l.name)} <span class="count">${n}</span>`,
    scope: l.dir === 'in' ? 'Together' : 'Spread out',
    del: `data-act="delete-label" data-lid="${esc(l.id)}"`, body,
  });
}

/* What each rule means in each view: "keep apart" is "not in the same group" for groups
   and "don't sit right next to each other" for seating. */
const RULE_MEANING = {
  groups: {
    apart: 'not in the same group', together: 'in the same group',
    out: 'one per group', in: 'all in the same group', fresh: 'new groupmates each time',
  },
  seats: {
    apart: "don't sit right next to each other", together: 'sit right next to each other',
    out: "don't sit right next to each other", in: 'sit next to each other',
    front: 'seated in the front rows', fresh: 'new neighbors each time',
  },
};

/** Every enabled rule, with whether it applies to this view and what it means here. */
function ruleRows(c, view) {
  const words = RULE_MEANING[view];
  const rows = c.rules.filter(r => r.enabled && RULE_TYPES[r.type]).map(r => {
    const t = RULE_TYPES[r.type];
    const applies = t.scope === 'both' || t.scope === view;
    const n = r.pairs ? r.pairs.length : r.students ? r.students.length : 0;
    return { key: r.type, name: t.name, meaning: words[r.type], applies, empty: (r.pairs || r.students) && !n,
      why: applies ? '' : (t.scope === 'seats' ? 'seating only' : 'groups only') };
  });
  c.labels.filter(l => l.enabled).forEach(l => rows.push({
    key: 'label:' + l.id, name: `${l.name} (${l.dir === 'in' ? 'together' : 'spread out'})`,
    meaning: words[l.dir === 'in' ? 'in' : 'out'], applies: true,
    empty: !c.students.some(s => s.labels.includes(l.id)),
  }));
  return rows;
}

/** Rule check: one line per rule, a check or a warning with what's off. Private: hidden with the eye off and while presenting. */
function ruleReport(c, ev, extraClass = 'private') {
  const rows = ruleRows(c, state.view);
  const used = rows.filter(r => r.applies);
  if (!rows.length) return '';
  const missesOf = key => ev.issues.filter(i => i.key === key);
  // Rules of the same type (two "Keep apart" cards) share one line.
  const seen = new Set();
  const lines = used.filter(r => !seen.has(r.key) && seen.add(r.key));
  const hard = lines.filter(r => missesOf(r.key).some(i => !i.soft)).length;
  const off = rows.filter(r => !r.applies);
  return `
    <details class="rule-report ${extraClass} ${hard ? 'warn' : 'ok'}"${hard ? ' open' : ''}>
      <summary>${!lines.length ? 'No rules apply here' : hard ? `${icon('alert')} ${hard} of ${lines.length} rule${lines.length > 1 ? 's' : ''} not met` : `${icon('check')} All ${lines.length} rule${lines.length > 1 ? 's' : ''} met`}</summary>
      <ul class="rule-lines">
        ${lines.map(r => {
          const miss = missesOf(r.key);
          const bad = miss.some(i => !i.soft);
          const mark = icon(r.empty ? 'minus' : bad ? 'alert' : miss.length ? 'info' : 'check');
          return `<li class="${bad ? 'bad' : miss.length ? 'soft' : 'good'}">
            <span class="icon">${mark}</span><div><b>${esc(r.name)}</b> <span class="muted">— ${esc(r.meaning)}</span>
            ${r.empty ? '<div class="muted">No students picked yet</div>' : ''}
            ${miss.length ? `<ul>${miss.map(i => `<li>${esc(i.text)}</li>`).join('')}</ul>` : ''}</div></li>`;
        }).join('')}
      </ul>
      ${off.length ? `<p class="muted not-here">Not used on this ${state.view === 'seats' ? 'seating chart' : 'grouping'}: ${off.map(r => `${esc(r.name)} (${r.why})`).join(', ')}</p>` : ''}
    </details>`;
}

function pickBanner(c) {
  const r = pickRule && c.rules.find(r => r.id === pickRule);
  if (!r) return '';
  return `<div class="pick-banner teacher-only">Click a student to choose who they're ${r.type === 'apart' ? 'kept apart from' : 'kept together with'}.
    <button class="small" data-act="cancel-pick">Cancel</button></div>`;
}

function labelBadges(c, sid) {
  const s = c.students.find(s => s.id === sid);
  if (!s) return '';
  const tags = c.labels.filter(l => s.labels.includes(l.id))
    .map(l => `<i style="--h:${Number(l.hue)}" title="${esc(l.name)}">${esc(abbr(l.name))}</i>`);
  if (s.absent) tags.push('<i class="absent" title="Absent today">ABS</i>');
  return tags.length ? `<span class="badges private">${tags.join('')}</span>` : '';
}

/* Color means "which group": each group gets one hue from this palette (strip, number, and a
   faint tint on its students). Names themselves stay neutral. */
const GROUP_HUES = [174, 217, 262, 334, 24, 142, 200, 40, 290, 4];
const groupHue = i => GROUP_HUES[i % GROUP_HUES.length];

const chip = (c, sid, conflict) =>
  `<div class="chip${conflict ? ' conflict' : ''}" draggable="true" data-sid="${esc(sid)}">${esc(nameOf(c, sid))}${labelBadges(c, sid)}</div>`;

function renderGroupsMain(c) {
  const main = $('#main');
  if (!c.students.length) {
    main.innerHTML = `<div class="empty"><strong>No students yet</strong>Add names to the roster, or try the fictional sample class under Backup &amp; import.</div>`;
    return;
  }
  const grouped = new Set(c.groups.flatMap(g => g.studentIds));
  const unassigned = c.students.filter(s => !grouped.has(s.id) && !s.absent).map(s => s.id);
  const ev = evaluateGroups(c);
  const bad = ev.bad;
  const absent = c.students.filter(s => s.absent).length;
  main.innerHTML = `
    ${pickBanner(c)}
    <div class="board-head"><h2>${esc(c.name)} <span class="h-sub">Groups</span></h2>
      <span class="meta-pill">${c.students.length - absent} students</span><span class="meta-pill">${c.groups.length} groups</span>
      ${absent ? `<span class="meta-pill private">${absent} absent</span>` : ''}
      <span class="spacer"></span>${ruleReport(c, ev)}</div>
    ${!c.groups.length ? `<div class="empty"><strong>No groups yet</strong>Choose a size on the right and click <b>Shuffle groups</b>.</div>` : `
    <div class="group-grid">
      ${c.groups.map((g, i) => `
        <div class="group-card" data-drop="group" data-gid="${esc(g.id)}" style="--h:${groupHue(i)}">
          <div class="group-title">
            <span class="group-num">${i + 1}</span>
            <input type="text" class="group-name" data-gid="${esc(g.id)}" value="${esc(g.name)}" aria-label="Group name">
            <span class="count">${g.studentIds.length}</span>
            <button class="link teacher-only" data-act="remove-group" data-gid="${esc(g.id)}" title="Remove group" aria-label="Remove group">${icon('x')}</button>
          </div>
          <div class="chips">${g.studentIds.map(id => chip(c, id, bad.has(id))).join('')}</div>
        </div>`).join('')}
      <button class="add-group-card" data-act="add-group">+ Add group</button>
    </div>`}
    ${unassigned.length ? `
    <div class="unassigned dropzone" data-drop="unassigned">
      <h4>Not in a group (${unassigned.length}) — drag into a group</h4>
      <div class="chips">${unassigned.map(id => chip(c, id, false)).join('')}</div>
    </div>` : ''}`;
}

function renderGroupsRight(c) {
  const cfg = c.groupConfig;
  $('#right').innerHTML = `
    <section class="stack">
      <h3>Make groups</h3>
      <div class="seg" role="group" aria-label="Group by">
        <button data-act="group-mode" data-mode="count" class="${cfg.mode === 'count' ? 'on' : ''}">How many groups</button>
        <button data-act="group-mode" data-mode="size" class="${cfg.mode === 'size' ? 'on' : ''}">Group size</button>
      </div>
      <div class="stepper">
        <button data-act="group-step" data-d="-1" aria-label="Fewer">${icon('minus')}</button>
        <input type="number" id="groupN" min="1" max="99" value="${Number(cfg.n)}" aria-label="${cfg.mode === 'count' ? 'Number of groups' : 'Students per group'}">
        <button data-act="group-step" data-d="1" aria-label="More">${icon('plus')}</button>
      </div>
      <p class="hint center">${sizeSummary(presentIds(c).length, cfg)}</p>
      <button class="primary big" data-act="make-groups">${icon('shuffle')} Shuffle groups</button>
      <button data-act="copy-groups"${c.groups.length ? '' : ' disabled'}>${icon('copy')} Copy as text</button>
    </section>
    ${rulesSection(c)}`;
}

function canvasSize(c) {
  const w = Math.max(MIN_W, ...c.desks.map(d => d.x + DW + 40));
  const h = Math.max(MIN_H, ...c.desks.map(d => d.y + DH + 40));
  return { w, h };
}

/* The seating chart always fits its panel: the canvas keeps its own coordinates
   and is scaled with a CSS transform. Pointer math divides by canvasScale. */
let canvasScale = 1;
function fitCanvas() {
  const wrap = $('.canvas-wrap'), sizer = $('.canvas-sizer'), canvas = $('#canvas');
  if (!wrap || !canvas || wrap.hidden) return;
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  const s = Math.min(wrap.clientWidth / w, wrap.clientHeight / h, 1.5);
  canvasScale = s > 0 ? s : 1;
  canvas.style.transform = `scale(${canvasScale})`;
  sizer.style.width = w * canvasScale + 'px';
  sizer.style.height = h * canvasScale + 'px';
}
new ResizeObserver(() => { if (state.view === 'seats') fitCanvas(); }).observe(document.getElementById('main'));

function renderSeatsMain(c) {
  const { w, h } = canvasSize(c);
  const ev = evaluateSeats(c);
  const bad = ev.bad;
  const seatedCount = c.desks.filter(d => d.studentId).length;
  const present = presentIds(c).length;
  $('#main').innerHTML = `
    ${pickBanner(c)}
    <div class="board-head"><h2>${esc(c.name)} <span class="h-sub">Seating chart</span></h2>
      <span class="meta-pill">${seatedCount}/${present} seated</span><span class="meta-pill">${c.desks.filter(d => d.active).length} seats on</span>
      <span class="spacer"></span>${ruleReport(c, ev)}</div>
    <div class="toolbar" id="deskToolbar">
      <button data-act="add-desk">${icon('plus')} Add desk</button>
      ${deskClipboard.length ? `<button data-act="paste-desks">${icon('clipboard')} Paste</button>` : ''}
      <span class="sel-hint">Click a desk, or drag across several, to edit seats</span>
      <div class="sel-tools">
        <span class="sel-count" id="selCount"></span>
        <button data-act="toggle-inactive" class="primary-soft" id="onOffBtn">${icon('toggle')} <span>Turn off</span></button>
        <button data-act="unseat-selected" data-needs-sel>${icon('userMinus')} Unseat</button>
        <button data-act="copy-desks" data-needs-sel>${icon('copy')} Copy</button>
        <button data-act="delete-desks" class="danger" data-needs-sel>${icon('trash')} Delete</button>
        <button data-act="clear-selection" class="link" title="Clear selection" aria-label="Clear selection">${icon('x')}</button>
      </div>
    </div>
    ${!c.desks.length ? `<div class="empty"><strong>No desks yet</strong>Click <b>Add desk</b>, or apply a saved layout under <b>Room layout</b> on the right.</div>` : ''}
    <div class="canvas-wrap"${c.desks.length ? '' : ' hidden'}>
      <div class="canvas-sizer">
      <div class="canvas" id="canvas" style="width:${w}px;height:${h}px">
        <div class="front">Front of room</div>
        ${c.desks.map(d => `
          <div class="desk${d.active ? (d.studentId ? '' : ' open') : ' inactive'}${d.studentId && bad.has(d.studentId) ? ' conflict' : ''}" data-did="${esc(d.id)}" data-drop="desk" style="left:${Number(d.x)}px;top:${Number(d.y)}px">
            ${d.studentId ? `<div class="seat-name" draggable="true" data-sid="${esc(d.studentId)}" data-from="${esc(d.id)}">${esc(nameOf(c, d.studentId))}${labelBadges(c, d.studentId)}</div>`
              : d.active ? '' : '<span class="off-mark">off</span>'}
          </div>`).join('')}
      </div>
      </div>
    </div>`;
  syncSelection();
  fitCanvas();
}

function renderSeatsRight(c) {
  const seated = new Set(c.desks.map(d => d.studentId).filter(Boolean));
  const pool = c.students.filter(s => !seated.has(s.id) && !s.absent);
  const t = state.templates;
  $('#right').innerHTML = `
    <section class="stack">
      <h3>Seat students</h3>
      <button class="primary big" data-act="shuffle-seats">${icon('shuffle')} Shuffle seats</button>
      <div class="grid2">
        <button data-act="fill-seats" title="Seat anyone without a desk, keep everyone else">${icon('userPlus')} Fill empty</button>
        <button data-act="clear-seats" title="Take everyone out of their seats">${icon('eraser')} Clear all</button>
      </div>
    </section>
    ${pool.length ? `
    <section class="needs-seat">
      <h3>Needs a seat <span class="count">${pool.length}</span></h3>
      <div class="pool dropzone" data-drop="pool">${pool.map(s => chip(c, s.id, false)).join('')}</div>
    </section>` : ''}
    ${rulesSection(c)}
    <section class="stack">
      <h3>Room layout</h3>
      <button data-act="layout-all" class="primary-soft"${c.desks.length ? '' : ' disabled'}>${icon('layers')} Save & use for every period</button>
      ${t.length ? `
      <div class="layout-card">
        <select id="templateSel" aria-label="Saved layouts">${t.map(x => `<option value="${esc(x.id)}">${esc(x.name)} · ${x.desks.filter(d => d.active !== false).length} seats on</option>`).join('')}</select>
        <div class="row"><button data-act="apply-template">Apply here</button><button data-act="apply-template-all">Apply to all</button></div>
        <div class="row tight">
          <button data-act="save-template"${c.desks.length ? '' : ' disabled'}>${icon('save')} Save as new</button>
          <button data-act="delete-template" class="danger icon-btn" title="Delete this saved layout" aria-label="Delete this saved layout">${icon('trash')}</button>
        </div>
      </div>` : `<button data-act="save-template"${c.desks.length ? '' : ' disabled'}>${icon('save')} Save this layout</button>`}
    </section>`;
  syncSelection();
}

/** Update selection visuals without a full re-render (safe during drags). */
function syncSelection() {
  const c = cls();
  const valid = new Set(c.desks.map(d => d.id));
  selected.forEach(id => { if (!valid.has(id)) selected.delete(id); });
  $$('.desk').forEach(el => el.classList.toggle('selected', selected.has(el.dataset.did)));
  $$('[data-needs-sel]').forEach(b => { b.disabled = !selected.size; });
  const tb = $('#deskToolbar');
  if (tb) tb.classList.toggle('has-sel', selected.size > 0);
  const sc = $('#selCount');
  if (sc) sc.textContent = `${selected.size} desk${selected.size === 1 ? '' : 's'} selected`;
  const onOff = $('#onOffBtn span');
  if (onOff) onOff.textContent = c.desks.filter(d => selected.has(d.id)).every(d => !d.active) ? 'Turn seat on' : 'Turn seat off';
}

/* ---------------- Actions ---------------- */

const SAMPLE_NAMES = ['Ava', 'Ben', 'Chloe', 'Dev', 'Elena', 'Felix', 'Grace', 'Hugo', 'Iris', 'Jonah', 'Kira', 'Leo',
  'Mila', 'Noah', 'Olive', 'Priya', 'Quinn', 'Rafael', 'Sana', 'Theo', 'Uma', 'Victor', 'Willa', 'Yusuf'];

const actions = {
  view: el => { state.view = el.dataset.view; selected.clear(); save(); render(); },
  undo, redo,
  print: () => window.print(),
  present: () => { rulesOpen = false; pickRule = null; closeModal(); render(); document.body.classList.toggle('presenting'); },

  'switch-class': el => { state.currentClassId = el.dataset.cid; selected.clear(); save(); render(); },
  'add-class': () => {
    const name = prompt('Class name', `Period ${state.classes.length + 1}`);
    if (!name || !name.trim()) return;
    const c = newClass(name.trim());
    state.classes.push(c);
    state.currentClassId = c.id;
    save(); render();
  },
  'delete-class': () => {
    const c = cls();
    if (!confirm(`Delete "${c.name}" and its roster, groups, and seating chart? This can't be undone.`)) return;
    state.classes = state.classes.filter(k => k.id !== c.id);
    if (!state.classes.length) state.classes.push(newClass('Period 1'));
    state.currentClassId = state.classes[0].id;
    undoStack = undoStack.filter(e => e.classId !== c.id);
    redoStack = redoStack.filter(e => e.classId !== c.id);
    save(); render();
  },
  'save-roster': () => {
    const names = $('#roster').value.split(/\r?\n|\t/).map(s => s.trim()).filter(Boolean);
    commit(c => {
      const pool = [...c.students];
      c.students = names.map(n => {
        const i = pool.findIndex(s => s.name === n);
        return i >= 0 ? pool.splice(i, 1)[0] : { id: uid(), name: n };
      });
      const keep = new Set(c.students.map(s => s.id));
      c.groups.forEach(g => { g.studentIds = g.studentIds.filter(id => keep.has(id)); });
      c.desks.forEach(d => { if (d.studentId && !keep.has(d.studentId)) d.studentId = null; });
      c.rules.forEach(r => {
        if (r.pairs) r.pairs = r.pairs.filter(([a, b]) => keep.has(a) && keep.has(b));
        if (r.students) r.students = r.students.filter(id => keep.has(id));
      });
      c.prevGroups = c.prevGroups.map(g => g.filter(id => keep.has(id)));
      c.prevSeatPairs = (c.prevSeatPairs || []).filter(([a, b]) => keep.has(a) && keep.has(b));
    });
    $('#roster').blur();
    toast(`Roster saved: ${names.length} students`);
  },
  'start-blank': () => {
    const current = cls();
    const isBlank = c => !c.students.length && !c.desks.length && !c.groups.length && !c.rules.length && !c.labels.length;
    let c = isBlank(current) ? current : state.classes.find(isBlank);
    if (!c) {
      c = newClass(`Period ${state.classes.length + 1}`);
      state.classes.push(c);
    }
    state.currentClassId = c.id;
    rulesOpen = false; pickRule = null; selected.clear();
    save(); render();
    $('#roster').focus();
  },
  sample: () => {
    const c = newClass('Fictional sample class');
    c.students = SAMPLE_NAMES.map(name => ({ id: uid(), name, labels: [], absent: false }));
    const S = c.students;
    c.labels = LABEL_SUGGESTIONS.map((name, i) => ({ id: uid(), name, hue: LABEL_HUES[i], enabled: true, dir: 'out' }));
    c.labels.forEach((l, i) => { for (let j = 0; j < 4; j++) S[i * 4 + j].labels.push(l.id); });
    c.rules = [
      { id: uid(), type: 'apart', enabled: true, pairs: [[S[1].id, S[7].id], [S[3].id, S[13].id]] },
    ];
    c.desks = layoutPositions('pods', 24).map(p => ({ id: uid(), ...p, active: true, studentId: null }));
    c.groups = makeGroups(c).groups;
    solveSeats(c, 'all');
    state.classes.push(c);
    state.currentClassId = c.id;
    save(); render();
    toast('Sample class added');
  },
  export: () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `grouper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  import: () => $('#importFile').click(),

  'make-groups': () => {
    const c = cls();
    if (!presentIds(c).length) return toast('Add students to the roster first');
    commit(k => {
      if (k.groups.length) k.prevGroups = k.groups.map(g => g.studentIds.slice());
      k.groups = makeGroups(k).groups;
    });
    const missed = evaluateGroups(cls()).issues.filter(i => !i.soft).length;
    if (missed && state.showRules) toast(`Couldn't meet every rule: ${missed} not met (see the rule check)`);
  },
  'group-mode': el => commit(c => { c.groupConfig.mode = el.dataset.mode; }),
  'group-step': el => commit(c => { c.groupConfig.n = Math.max(1, Math.min(99, c.groupConfig.n + Number(el.dataset.d))); }),
  'add-group': () => commit(c => c.groups.push({ id: uid(), name: `Group ${c.groups.length + 1}`, studentIds: [] })),
  'remove-group': el => commit(c => { c.groups = c.groups.filter(g => g.id !== el.dataset.gid); }),
  'copy-groups': () => {
    const c = cls();
    const text = c.groups.map(g => `${g.name}: ${g.studentIds.map(id => nameOf(c, id)).join(', ')}`).join('\n');
    copyText(text).then(() => toast('Groups copied to clipboard'));
  },

  /* ---- Rules, labels, absent ---- */
  eye: () => { state.showRules = !state.showRules; pickRule = null; save(); render(); },
  'open-rules': () => { rulesOpen = true; render(); },
  'close-rules': () => { rulesOpen = false; render(); },
  // Picking hides the panel so every name is clickable; it comes back after the popup closes.
  pick: el => { pickRule = pickRule === el.dataset.rid ? null : el.dataset.rid; rulesOpen = !pickRule; render(); },
  'cancel-pick': () => { pickRule = null; rulesOpen = true; render(); },
  'delete-rule': el => {
    if (pickRule === el.dataset.rid) pickRule = null;
    commit(c => { c.rules = c.rules.filter(r => r.id !== el.dataset.rid); });
  },
  'remove-pair': el => commit(c => { c.rules.find(r => r.id === el.dataset.rid).pairs.splice(Number(el.dataset.i), 1); }),
  'toggle-rule': el => {
    if (pickRule === el.dataset.rid) pickRule = null;
    commit(c => { const r = c.rules.find(r => r.id === el.dataset.rid); r.enabled = !r.enabled; });
  },
  'toggle-label': el => commit(c => { const l = c.labels.find(l => l.id === el.dataset.lid); l.enabled = !l.enabled; }),
  'label-dir': el => commit(c => { c.labels.find(l => l.id === el.dataset.lid).dir = el.dataset.dir; }),
  'choose-front': el => openFrontModal(el.dataset.rid),
  'edit-label': el => openLabelModal(el.dataset.lid),
  'new-label': () => {
    const name = prompt('Label name (for example: On camera, Director, Needs support)');
    if (name && name.trim()) addLabel(name.trim());
  },
  'rename-label': el => {
    const c = cls();
    const l = c.labels.find(l => l.id === el.dataset.lid);
    const name = l && prompt('Rename label', l.name);
    if (!name || !name.trim()) return;
    closeModal();
    commit(k => { k.labels.find(x => x.id === l.id).name = name.trim(); });
  },
  'delete-label': el => {
    const c = cls();
    const l = c.labels.find(l => l.id === el.dataset.lid);
    if (!l || !confirm(`Delete the "${l.name}" rule? Students lose this label.`)) return;
    closeModal();
    commit(k => {
      k.labels = k.labels.filter(x => x.id !== l.id);
      k.students.forEach(s => { s.labels = s.labels.filter(x => x !== l.id); });
    });
  },
  absent: () => {
    const c = cls();
    openChecklist({
      title: "Who's absent today?",
      hint: 'Absent students are left out when you shuffle groups or seats. Clear this tomorrow.',
      items: c.students.map(s => ({ id: s.id, name: s.name, checked: s.absent })),
      onSave: ids => commit(k => { const set = new Set(ids); k.students.forEach(s => { s.absent = set.has(s.id); }); }),
    });
  },

  'add-desk': () => commit(c => {
    const d = { id: uid(), ...findFreeSpot(c), active: true, studentId: null };
    c.desks.push(d);
    selected = new Set([d.id]);
  }),
  'copy-desks': () => {
    const c = cls();
    deskClipboard = c.desks.filter(d => selected.has(d.id)).map(({ x, y, active }) => ({ x, y, active }));
    toast(`Copied ${deskClipboard.length} desk${deskClipboard.length > 1 ? 's' : ''}`);
    render();
  },
  'paste-desks': () => {
    if (!deskClipboard.length) return;
    commit(c => {
      const added = deskClipboard.map(p => ({ id: uid(), x: p.x + 30, y: p.y + 30, active: p.active, studentId: null }));
      c.desks.push(...added);
      selected = new Set(added.map(d => d.id));
      deskClipboard = deskClipboard.map(p => ({ ...p, x: p.x + 30, y: p.y + 30 }));
    });
  },
  'clear-selection': () => { selected.clear(); syncSelection(); },
  'toggle-inactive': () => commit(c => {
    const sel = c.desks.filter(d => selected.has(d.id));
    const makeActive = sel.every(d => !d.active);
    sel.forEach(d => { d.active = makeActive; if (!makeActive) d.studentId = null; });
  }),
  'delete-desks': () => commit(c => { c.desks = c.desks.filter(d => !selected.has(d.id)); selected.clear(); }),

  'shuffle-seats': () => runSeating('all'),
  'fill-seats': () => runSeating('fill'),
  'unseat-selected': () => commit(c => c.desks.forEach(d => { if (selected.has(d.id)) d.studentId = null; })),
  'clear-seats': () => commit(c => c.desks.forEach(d => { d.studentId = null; })),
  layout: el => {
    const c = cls();
    if (c.desks.length && !confirm('Replace the current desks with this layout? (You can undo.)')) return;
    const n = Math.max(c.students.length, 8);
    commit(k => {
      k.desks = layoutPositions(el.dataset.kind, n).map(p => ({ id: uid(), ...p, active: true, studentId: null }));
      selected.clear();
    });
    toast('Layout ready. Click "Shuffle seats" to seat everyone.');
  },
  'save-template': () => {
    const c = cls();
    const name = prompt('Name this layout', `${c.name} room`);
    if (!name || !name.trim()) return;
    state.templates.push({ id: uid(), name: name.trim(), desks: c.desks.map(({ x, y, active }) => ({ x, y, active })) });
    save(); render();
    toast('Layout saved');
  },
  'apply-template': () => {
    const t = state.templates.find(t => t.id === $('#templateSel').value);
    if (!t) return;
    commit(c => { applyLayout(c, t.desks); selected.clear(); });
    toast(`Applied "${t.name}"`);
  },
  'apply-template-all': () => {
    const t = state.templates.find(t => t.id === $('#templateSel').value);
    if (t) applyLayoutToAll(t, cls());
  },
  'layout-all': () => {
    const c = cls();
    const name = prompt('Name this seat setup', 'Station seats');
    if (!name || !name.trim()) return;
    const t = { id: uid(), name: name.trim(), desks: c.desks.map(({ x, y, active }) => ({ x, y, active })) };
    state.templates.push(t);
    save();
    applyLayoutToAll(t, c);
  },
  'delete-template': () => {
    const id = $('#templateSel').value;
    const t = state.templates.find(t => t.id === id);
    if (!t || !confirm(`Delete saved layout "${t.name}"?`)) return;
    state.templates = state.templates.filter(t => t.id !== id);
    save(); render();
  },
};

/* Put a saved desk setup into a class. Students keep their seat if a desk is still
   at that spot and turned on; everyone else is seated by the class's rules. */
function applyLayout(k, desks) {
  const at = new Map(k.desks.filter(d => d.studentId).map(d => [`${Number(d.x)},${Number(d.y)}`, d.studentId]));
  k.desks = desks.map(p => {
    const sid = p.active ? at.get(`${p.x},${p.y}`) || null : null;
    return { id: uid(), x: p.x, y: p.y, active: p.active, studentId: sid };
  });
  if (presentIds(k).length) solveSeats(k, 'fill');
}

function applyLayoutToAll(t, source) {
  const others = state.classes.filter(k => k.id !== source.id);
  if (!others.length) { render(); return toast(`Saved "${t.name}"`); }
  const on = t.desks.filter(d => d.active).length;
  if (!confirm(`Use "${t.name}" (${on} of ${t.desks.length} seats on) for ${others.map(k => k.name).join(', ')}?

Students keep their seat if it's still on; the rest are seated by each class's rules. Undo works one class at a time.`)) {
    render(); return toast(`Saved "${t.name}" (not applied to other periods)`);
  }
  const short = [];
  state.classes.forEach(k => {
    if (k.id === source.id) return;
    pushUndo(k);
    applyLayout(k, t.desks);
    const need = presentIds(k).length - k.desks.filter(d => d.studentId).length;
    if (need > 0) short.push(`${k.name} needs ${need} more seat${need > 1 ? 's' : ''}`);
  });
  redoStack = [];
  save(); render();
  toast(`"${t.name}" is set for every period${short.length ? ' · ' + short.join(' · ') : ''}`);
}

function runSeating(mode) {
  const c = cls();
  if (!presentIds(c).length) return toast('Add students to the roster first');
  if (!c.desks.some(d => d.active)) return toast('Add some desks first');
  let r;
  commit(k => { r = solveSeats(k, mode); });
  const notes = [];
  if (r.leftOver) notes.push(`${r.leftOver} student${r.leftOver > 1 ? 's' : ''} still need a desk`);
  const missed = evaluateSeats(cls()).issues.filter(i => !i.soft).length;
  if (missed && state.showRules) notes.push(`${missed} rule${missed > 1 ? 's' : ''} not met (see the rule check)`);
  if (notes.length) toast(notes.join(' · '));
}

/* ---------------- Popups ---------------- */

let modalOnClose = null;
function closeModal() {
  const m = $('#modal');
  if (!m) return;
  m.remove();
  const f = modalOnClose; modalOnClose = null;
  if (f) f();
}

/** A checklist of students in a popup. onSave gets the checked ids. */
function openChecklist({ title, hint = '', header = '', items, onSave, onHeader, extra = '', onClose = null }) {
  modalOnClose = null;
  closeModal();
  modalOnClose = onClose;
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.id = 'modal';
  back.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <h2>${esc(title)}</h2>
      ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
      ${header}
      <div class="checklist-tools">
        <input type="search" placeholder="Filter names" aria-label="Filter names">
        <button type="button" data-m="all">All</button><button type="button" data-m="none">None</button>
      </div>
      <div class="checklist">
        ${items.map(it => `<label class="check-item"><input type="checkbox" value="${it.id}"${it.checked ? ' checked' : ''}>
          <span>${esc(it.name)}</span>${it.note ? `<small>${esc(it.note)}</small>` : ''}</label>`).join('') || '<p class="hint">No students in this class yet.</p>'}
      </div>
      <footer>${extra}<span class="spacer"></span>
        <button type="button" data-m="cancel">Cancel</button><button type="button" class="primary" data-m="save">Save</button></footer>
    </div>`;
  document.body.appendChild(back);
  const boxes = () => $$('.checklist input', back);
  back.addEventListener('click', e => {
    if (e.target === back) return closeModal();
    const m = e.target.closest('[data-m]')?.dataset.m;
    if (m === 'cancel') closeModal();
    if (m === 'all' || m === 'none') boxes().filter(b => !b.closest('.check-item').hidden).forEach(b => { b.checked = m === 'all'; });
    if (m === 'save') { const ids = boxes().filter(b => b.checked).map(b => b.value); closeModal(); onSave(ids); }
  });
  $('input[type=search]', back).addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('.check-item', back).forEach(el => { el.hidden = !el.textContent.toLowerCase().includes(q); });
  });
  if (onHeader) back.addEventListener('change', e => { if (e.target.dataset.header) onHeader(e.target.value); });
  setTimeout(() => $('input[type=search]', back).focus(), 0);
}

/** Keep apart / keep together: choose the partners for one student. */
function openPairModal(rid, anchor) {
  const c = cls();
  const r = c.rules.find(r => r.id === rid);
  if (!r) return;
  const partners = new Set(r.pairs.filter(p => p.includes(anchor)).map(([a, b]) => (a === anchor ? b : a)));
  const apart = r.type === 'apart';
  openChecklist({
    title: `Keep ${nameOf(c, anchor)} ${apart ? 'apart from…' : 'together with…'}`,
    hint: apart ? "They won't be put in the same group or seated next to each other."
      : "They'll be put in the same group and seated next to each other.",
    header: `<label>Student<select data-header="1">${c.students.map(s => `<option value="${esc(s.id)}"${s.id === anchor ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>`,
    items: c.students.filter(s => s.id !== anchor).map(s => ({ id: s.id, name: s.name, checked: partners.has(s.id), note: s.absent ? 'absent' : '' })),
    onHeader: v => openPairModal(rid, v),
    onClose: () => { rulesOpen = true; render(); },
    onSave: ids => commit(k => {
      const rr = k.rules.find(x => x.id === rid);
      rr.pairs = rr.pairs.filter(p => !p.includes(anchor));
      ids.forEach(id => rr.pairs.push([anchor, id]));
    }),
  });
}

function openLabelModal(lid) {
  const c = cls();
  const l = c.labels.find(l => l.id === lid);
  if (!l) return;
  openChecklist({
    title: `Who is "${l.name}"?`,
    hint: 'Labels are private. Students never see them unless you turn on the eye.',
    items: c.students.map(s => ({ id: s.id, name: s.name, checked: s.labels.includes(lid) })),
    extra: `<button type="button" data-act="rename-label" data-lid="${esc(lid)}">Rename</button>
      <button type="button" class="danger" data-act="delete-label" data-lid="${esc(lid)}">Delete</button>`,
    onSave: ids => commit(k => {
      const set = new Set(ids);
      k.students.forEach(s => { s.labels = s.labels.filter(x => x !== lid); if (set.has(s.id)) s.labels.push(lid); });
    }),
  });
}

function openFrontModal(rid) {
  const c = cls();
  const r = c.rules.find(r => r.id === rid);
  if (!r) return;
  openChecklist({
    title: 'Who should sit near the front?',
    items: c.students.map(s => ({ id: s.id, name: s.name, checked: r.students.includes(s.id) })),
    onSave: ids => commit(k => { k.rules.find(x => x.id === rid).students = ids; }),
  });
}

function addLabel(name) {
  const c = cls();
  if (c.labels.some(l => l.name.toLowerCase() === name.toLowerCase())) return toast('That label already exists');
  const l = { id: uid(), name, hue: LABEL_HUES[c.labels.length % LABEL_HUES.length], enabled: true, dir: 'out' };
  commit(k => k.labels.push(l));
  openLabelModal(l.id);
}

/* ---------------- Import from "Classroom Groups" backups ----------------
   That app stores each room as a rows×cols grid: `seating.seats[i]` holds a student id
   (or null) and `seating.gaps` lists the cells with no desk. Groups are arrays of ids.
   Templates are { name, positions: [grid indexes] }. */

const CELL_W = DW + 6, CELL_H = DH + 8;   // neighboring grid cells become touching desks

function isClassroomGroupsBackup(s) {
  return Array.isArray(s.seatingTemplates) || s.classes.some(c => c.seating && Array.isArray(c.seating.gaps));
}

/** Grid indexes → desk positions, trimmed so the room starts near the top-left. */
function gridToDesks(indexes, cols) {
  if (!indexes.length) return [];
  const cells = indexes.map(i => ({ i, r: Math.floor(i / cols), c: i % cols }));
  const minC = Math.min(...cells.map(p => p.c));
  return cells.map(p => ({
    i: p.i,
    x: 40 + (p.c - minC) * CELL_W,
    y: FRONT_H + 30 + p.r * CELL_H,
  }));
}

function convertClassroomGroupsClass(src) {
  const c = newClass(String(src.name || 'Imported class'));
  // Their per-class "tags" become our labels; student tags are label names.
  const labelFor = name => {
    let l = c.labels.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (!l) c.labels.push(l = { id: uid(), name, hue: LABEL_HUES[c.labels.length % LABEL_HUES.length], enabled: false, dir: 'out' });
    return l.id;
  };
  (src.tags || []).forEach(t => { if (typeof t === 'string' && t.trim()) labelFor(t.trim()); });
  c.students = (src.students || [])
    .filter(s => s && s.name)
    .map(s => ({
      id: String(s.id || uid()),
      name: String(s.name),
      labels: (s.tags || []).filter(t => typeof t === 'string' && t.trim()).map(t => labelFor(t.trim())),
      absent: !!s.absent,
    }));
  const known = new Set(c.students.map(s => s.id));
  c.groupConfig = { mode: src.mode === 'size' ? 'size' : 'count', n: Math.max(1, Number(src.value) || 4) };
  c.groups = (src.groups || []).map((g, i) => ({
    id: uid(),
    name: `Group ${i + 1}`,
    studentIds: (Array.isArray(g) ? g : g.studentIds || []).filter(id => known.has(id)),
  }));
  const seating = src.seating;
  if (seating && Array.isArray(seating.seats)) {
    const cols = Number(seating.cols) || 15;
    const gaps = new Set(seating.gaps || []);
    const deskCells = seating.seats.map((_, i) => i).filter(i => !gaps.has(i));
    const seen = new Set();
    c.desks = gridToDesks(deskCells, cols).map(p => {
      let sid = seating.seats[p.i];
      if (!known.has(sid) || seen.has(sid)) sid = null;
      if (sid) seen.add(sid);
      return { id: uid(), x: p.x, y: p.y, active: true, studentId: sid };
    });
  }
  return c;
}

function importClassroomGroups(s) {
  const classes = s.classes.map(convertClassroomGroupsClass);
  const cols = Number((s.classes.find(c => c.seating) || {}).seating?.cols) || 15;
  const templates = (s.seatingTemplates || []).map(t => ({
    id: uid(),
    name: String(t.name || 'Imported layout'),
    desks: gridToDesks(t.positions || [], cols).map(({ x, y }) => ({ x, y, active: true })),
  }));
  const students = classes.reduce((n, c) => n + c.students.length, 0);
  if (!confirm(`Add ${classes.length} classes (${students} students) and ${templates.length} saved layout${templates.length === 1 ? '' : 's'} from this Classroom Groups backup? Your current classes stay.`)) return;
  // Drop the untouched default "Period 1" so it doesn't clutter the list.
  state.classes = state.classes.filter(c => c.students.length || c.desks.length || c.groups.length);
  state.classes.push(...classes);
  state.templates.push(...templates);
  const activeIdx = s.classes.findIndex(c => c.id === s.active);
  state.currentClassId = classes[Math.max(0, activeIdx)].id;
  selected.clear();
  save(); render();
  toast(`Imported ${classes.length} classes and ${templates.length} layout${templates.length === 1 ? '' : 's'}`);
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}

/* ---------------- Events: clicks & inputs ---------------- */

document.addEventListener('click', e => {
  if (e.target.id === 'rulesDrawer') { rulesOpen = false; return render(); }   // click outside the panel
  const el = e.target.closest('[data-act]');
  if (el && !el.disabled && actions[el.dataset.act]) actions[el.dataset.act](el);
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'className') {
    const v = t.value.trim();
    if (v) commit(c => { c.name = v; });
  } else if (t.id === 'groupMode') {
    commit(c => { c.groupConfig.mode = t.value; });
  } else if (t.id === 'groupN') {
    const n = Math.max(1, Math.min(99, parseInt(t.value, 10) || 1));
    commit(c => { c.groupConfig.n = n; });
  } else if (t.id === 'addRule' && t.value.startsWith('label:')) {
    const name = t.value.slice(6) || (prompt('Label name (for example: On camera, Director, Needs support)') || '').trim();
    t.value = '';
    if (name) addLabel(name);
  } else if (t.id === 'addRule' && t.value) {
    const r = newRule(t.value, cls());
    commit(c => c.rules.push(r));
    if (r.type === 'apart' || r.type === 'together') { pickRule = r.id; render(); }
    if (r.type === 'front') openFrontModal(r.id);
  } else if (t.classList.contains('group-name')) {
    const v = t.value.trim();
    commit(c => { const g = c.groups.find(g => g.id === t.dataset.gid); if (g && v) g.name = v; });
  } else if (t.id === 'importFile' && t.files[0]) {
    if (t.files[0].size > 5 * 1024 * 1024) { t.value = ''; return toast('Choose a backup under 5 MB'); }
    t.files[0].text().then(txt => {
      const s = JSON.parse(txt);
      if (!s || !Array.isArray(s.classes) || !s.classes.length) throw new Error('bad file');
      if (isClassroomGroupsBackup(s)) return importClassroomGroups(s);
      if (!confirm('Replace all current data with this backup?')) return;
      state = normalize(s);
      undoStack = []; redoStack = []; selected.clear();
      save(); render();
      toast('Backup imported');
    }).catch(() => toast("That file isn't a Grouper backup"))
      .finally(() => { t.value = ''; });
  }
});

// Remember which fold-away sections are open ('toggle' doesn't bubble, so listen in capture).
document.addEventListener('toggle', e => {
  const key = e.target.dataset && e.target.dataset.fold;
  if (key && state.folds[key] !== e.target.open) { state.folds[key] = e.target.open; save(); }
}, true);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('#modal')) return closeModal();
    if (pickRule) { pickRule = null; rulesOpen = true; return render(); }
    if (rulesOpen) { rulesOpen = false; return render(); }
    if (document.body.classList.contains('presenting')) return document.body.classList.remove('presenting');
  }
  if ($('#modal')) return;
  if (e.target.closest('input, textarea, select')) return;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
  if (state.view !== 'seats') return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && selected.size) { e.preventDefault(); actions['delete-desks'](); }
  if (mod && e.key.toLowerCase() === 'c' && selected.size) { e.preventDefault(); actions['copy-desks'](); }
  if (mod && e.key.toLowerCase() === 'v') { e.preventDefault(); actions['paste-desks'](); }
  if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); selected = new Set(cls().desks.map(d => d.id)); syncSelection(); }
});

/* ---------------- Drag & drop: students ---------------- */

let dragData = null;

document.addEventListener('dragstart', e => {
  const el = e.target.closest('[data-sid][draggable]');
  if (!el) return;
  dragData = { sid: el.dataset.sid, from: el.dataset.from || null };
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragData.sid);
  requestAnimationFrame(() => el.classList.add('dragging'));
});
document.addEventListener('dragend', () => {
  dragData = null;
  $$('.dragging, .over').forEach(el => el.classList.remove('dragging', 'over'));
});
document.addEventListener('dragover', e => {
  const zone = dragData && e.target.closest('[data-drop]');
  if (!zone) return;
  if (zone.dataset.drop === 'desk' && zone.classList.contains('inactive')) return;
  e.preventDefault();
  $$('.over').forEach(el => { if (el !== zone) el.classList.remove('over'); });
  zone.classList.add('over');
});
document.addEventListener('drop', e => {
  const zone = dragData && e.target.closest('[data-drop]');
  if (!zone) return;
  e.preventDefault();
  const { sid, from } = dragData;
  const kind = zone.dataset.drop;

  if (kind === 'group' || kind === 'unassigned') {
    const targetChip = e.target.closest('.chip');
    commit(c => {
      const src = c.groups.find(g => g.studentIds.includes(sid));
      const dst = kind === 'group' ? c.groups.find(g => g.id === zone.dataset.gid) : null;
      const other = targetChip && targetChip.dataset.sid !== sid ? targetChip.dataset.sid : null;
      if (dst && other && src && src !== dst) {
        // Dropped on a classmate in another group: swap the two.
        src.studentIds[src.studentIds.indexOf(sid)] = other;
        dst.studentIds[dst.studentIds.indexOf(other)] = sid;
        return;
      }
      if (src) src.studentIds = src.studentIds.filter(id => id !== sid);
      if (dst) {
        const at = other ? dst.studentIds.indexOf(other) : -1;
        at >= 0 ? dst.studentIds.splice(at, 0, sid) : dst.studentIds.push(sid);
      }
    });
  } else if (kind === 'desk') {
    commit(c => {
      const desk = c.desks.find(d => d.id === zone.dataset.did);
      if (!desk || !desk.active || desk.studentId === sid) return;
      const displaced = desk.studentId;
      c.desks.forEach(d => { if (d.studentId === sid) d.studentId = null; });
      desk.studentId = sid;
      if (displaced) {
        const srcDesk = from && c.desks.find(d => d.id === from);
        if (srcDesk) srcDesk.studentId = displaced;   // swap seats
      }
    });
  } else if (kind === 'pool') {
    commit(c => c.desks.forEach(d => { if (d.studentId === sid) d.studentId = null; }));
  }
});

/* ---------------- Pointer: move desks & box-select ---------------- */

document.addEventListener('pointerdown', e => {
  if (e.button !== 0 || state.view !== 'seats') return;
  const canvas = e.target.closest('#canvas');
  if (!canvas) return;
  if (e.target.closest('.seat-name')) return;
  const deskEl = e.target.closest('.desk');
  const c = cls();
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX, sy = e.clientY;

  if (deskEl) {
    const id = deskEl.dataset.did;
    if (e.shiftKey || e.metaKey) {
      selected.has(id) ? selected.delete(id) : selected.add(id);
      syncSelection();
      return;
    }
    if (!selected.has(id)) { selected = new Set([id]); syncSelection(); }
    const before = JSON.stringify(c);
    const maxX = canvas.offsetWidth - DW - 2, maxY = canvas.offsetHeight - DH - 2;
    const moving = c.desks.filter(d => selected.has(d.id)).map(d => ({ d, x: d.x, y: d.y, el: $(`.desk[data-did="${CSS.escape(d.id)}"]`) }));
    let moved = false;
    const onMove = ev => {
      const dx = (ev.clientX - sx) / canvasScale, dy = (ev.clientY - sy) / canvasScale;
      if (!moved && Math.hypot(dx, dy) * canvasScale < 4) return;
      moved = true;
      for (const m of moving) {
        m.d.x = Math.min(maxX, Math.max(0, snap(m.x + dx)));
        m.d.y = Math.min(maxY, Math.max(FRONT_H, snap(m.y + dy)));
        m.el.style.left = m.d.x + 'px';
        m.el.style.top = m.d.y + 'px';
      }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (moved) { pushUndo(c, before); save(); render(); }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return;
  }

  // Box select on empty canvas
  e.preventDefault();
  const additive = e.shiftKey || e.metaKey;
  const base = additive ? new Set(selected) : new Set();
  const box = document.createElement('div');
  box.className = 'marquee';
  canvas.appendChild(box);
  const x0 = (sx - rect.left) / canvasScale, y0 = (sy - rect.top) / canvasScale;
  const onMove = ev => {
    const r = canvas.getBoundingClientRect();
    const x1 = (ev.clientX - r.left) / canvasScale, y1 = (ev.clientY - r.top) / canvasScale;
    const L = Math.min(x0, x1), T = Math.min(y0, y1), W = Math.abs(x1 - x0), H = Math.abs(y1 - y0);
    Object.assign(box.style, { left: L + 'px', top: T + 'px', width: W + 'px', height: H + 'px' });
    selected = new Set(base);
    c.desks.forEach(d => {
      if (d.x < L + W && d.x + DW > L && d.y < T + H && d.y + DH > T) selected.add(d.id);
    });
    syncSelection();
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    box.remove();
    syncSelection();
  };
  selected = new Set(base);
  syncSelection();
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
});

// On the seating chart, clicking a seated name (without dragging) selects its desk.
document.addEventListener('click', e => {
  if (pickRule || state.view !== 'seats') return;
  const el = e.target.closest('#canvas .seat-name');
  if (!el) return;
  const id = el.dataset.from;
  if (e.shiftKey || e.metaKey) selected.has(id) ? selected.delete(id) : selected.add(id);
  else selected = new Set([id]);
  syncSelection();
});

// While picking for a keep-apart/together rule, a click on any student opens their popup.
document.addEventListener('click', e => {
  if (!pickRule) return;
  const el = e.target.closest('#main .chip, #main .seat-name, .pool .chip');
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  const rid = pickRule;
  pickRule = null;
  render();
  openPairModal(rid, el.dataset.sid);
}, true);

// Clicking a seated name selects its desk (the name itself is the drag handle for the student).
document.addEventListener('click', e => {
  const name = e.target.closest('#canvas .seat-name');
  if (!name) return;
  const id = name.dataset.from;
  if (e.shiftKey || e.metaKey) selected.has(id) ? selected.delete(id) : selected.add(id);
  else selected = new Set([id]);
  syncSelection();
});

render();
if (firstPublicVisit) {
  try { actions.sample(); } catch { render(); }
}
