'use strict';

/* ============================================================
   Rules engine: rule types, solvers for groups and seats,
   and plain-language reports of which rules aren't met.
   Shares globals with app.js (uid, shuffle, DW, DH...).
   ============================================================ */

const RULE_TYPES = {
  apart:    { name: 'Keep apart',      scope: 'both',   help: 'Never in the same group or at neighboring desks.' },
  together: { name: 'Keep together',   scope: 'both',   help: 'Always in the same group and at neighboring desks.' },
  front:    { name: 'Seat near front', scope: 'seats',  help: 'Seats these students in the rows closest to the front.' },
  fresh:    { name: 'Mix it up',       scope: 'both',   help: 'Avoids putting students with anyone from their last group, or next to their last seat neighbors.' },
};

// How bad each kind of miss is. Pair rules matter most; "mix it up" is a gentle nudge.
const WEIGHT = { pair: 100, label: 30, front: 40, fresh: 3 };

const LABEL_SUGGESTIONS = ['On camera', 'Camera operator', 'Director'];

function newRule(type, c) {
  const r = { id: uid(), type, enabled: true };
  if (type === 'apart' || type === 'together') r.pairs = [];
  if (type === 'front') r.students = [];
  return r;
}

const ruleTitle = (c, r) => RULE_TYPES[r.type].name;

/** Collect the enabled rules that apply to `scope` ('groups' | 'seats') for the given students. */
function buildModel(c, ids, scope) {
  const present = new Set(ids);
  const labelsOf = new Map(c.students.map(s => [s.id, new Set(s.labels || [])]));
  const m = { apart: [], together: [], spread: [], cluster: [], front: [], prev: [], any: false };
  for (const r of c.rules) {
    const t = RULE_TYPES[r.type];
    if (!r.enabled || !t || (t.scope !== 'both' && t.scope !== scope)) continue;
    if (r.type === 'apart' || r.type === 'together') {
      r.pairs.forEach(([a, b]) => { if (present.has(a) && present.has(b)) m[r.type].push([a, b]); });
    } else if (r.type === 'front') {
      r.students.forEach(id => { if (present.has(id) && !m.front.includes(id)) m.front.push(id); });
    } else if (r.type === 'fresh' && scope === 'seats') {
      (c.prevSeatPairs || []).forEach(([a, b]) => { if (present.has(a) && present.has(b)) m.prev.push([a, b]); });
    } else if (r.type === 'fresh') {
      (c.prevGroups || []).forEach(g => {
        const p = g.filter(id => present.has(id));
        for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) m.prev.push([p[i], p[j]]);
      });
    }
  }
  // Labels are rules too: each one is on/off and either spreads its students out or keeps them together.
  for (const label of c.labels) {
    if (!label.enabled) continue;
    const mem = ids.filter(id => labelsOf.get(id).has(label.id));
    if (mem.length > 1) (label.dir === 'in' ? m.cluster : m.spread).push({ label, mem });
  }
  m.any = !!(m.apart.length || m.together.length || m.spread.length || m.cluster.length || m.front.length || m.prev.length);
  return m;
}

/* ---------------- Groups ---------------- */

/**
 * Score a grouping (lower is better). `at` maps student id → group index.
 * When `out` is given, pushes a readable issue for every miss.
 */
function scoreGroups(m, at, k, maxSize, out, ctx) {
  let s = 0;
  for (const [a, b] of m.apart) if (at.get(a) === at.get(b)) {
    s += WEIGHT.pair;
    out && out.push({ ids: [a, b], text: `${ctx.name(a)} and ${ctx.name(b)} are in the same group`, rule: 'Keep apart', key: 'apart' });
  }
  for (const [a, b] of m.together) if (at.get(a) !== at.get(b)) {
    s += WEIGHT.pair;
    out && out.push({ ids: [a, b], text: `${ctx.name(a)} and ${ctx.name(b)} are in different groups`, rule: 'Keep together', key: 'together' });
  }
  for (const { label, mem } of m.spread) {
    const count = new Array(k).fill(0);
    mem.forEach(id => count[at.get(id)]++);
    const hi = Math.ceil(mem.length / k), lo = Math.floor(mem.length / k);
    count.forEach((n, g) => {
      if (n > hi) {
        s += (n - hi) * WEIGHT.label;
        out && out.push({ ids: mem.filter(id => at.get(id) === g), text: `${ctx.group(g)} has ${n} ${label.name}`, rule: `${label.name}: spread out`, key: 'label:' + label.id });
      } else if (n < lo) {
        s += (lo - n) * WEIGHT.label;
        out && out.push({ ids: [], text: `${ctx.group(g)} has ${n === 0 ? 'no' : 'only ' + n} ${label.name}`, rule: `${label.name}: spread out`, key: 'label:' + label.id });
      }
    });
  }
  for (const { label, mem } of m.cluster) {
    const used = new Set(mem.map(id => at.get(id))).size;
    const extra = used - Math.ceil(mem.length / maxSize);
    if (extra > 0) {
      s += extra * WEIGHT.label;
      out && out.push({ ids: mem, text: `${label.name} students are split across ${used} groups`, rule: `${label.name}: together`, key: 'label:' + label.id });
    }
  }
  let repeats = 0;
  for (const [a, b] of m.prev) if (at.get(a) === at.get(b)) { s += WEIGHT.fresh; repeats++; }
  if (out && repeats) out.push({ ids: [], text: `${repeats} pair${repeats > 1 ? 's' : ''} were together last time too`, rule: 'Mix it up', key: 'fresh', soft: true });
  return s;
}

/** Find groups of the given sizes that break as few rules as possible. */
function solveGroups(c, ids, sizes) {
  const k = sizes.length, maxSize = Math.max(...sizes);
  const m = buildModel(c, ids, 'groups');
  let best = null, bestScore = Infinity;
  const restarts = m.any ? 8 : 1;
  for (let r = 0; r < restarts && bestScore > 0; r++) {
    const order = shuffle(ids.slice());
    const at = new Map();
    let p = 0;
    sizes.forEach((n, g) => { for (let i = 0; i < n; i++) at.set(order[p++], g); });
    let score = m.any ? scoreGroups(m, at, k, maxSize) : 0;
    // Hill-climb by swapping two students from different groups; sideways moves keep it exploring.
    for (let it = 0; it < 5000 && score > 0; it++) {
      const a = ids[Math.floor(Math.random() * ids.length)], b = ids[Math.floor(Math.random() * ids.length)];
      const ga = at.get(a), gb = at.get(b);
      if (ga === gb) continue;
      at.set(a, gb); at.set(b, ga);
      const next = scoreGroups(m, at, k, maxSize);
      if (next <= score) score = next;
      else { at.set(a, ga); at.set(b, gb); }
    }
    if (score < bestScore) { bestScore = score; best = new Map(at); }
  }
  const groups = sizes.map(() => []);
  shuffle([...best.keys()]).forEach(id => groups[best.get(id)].push(id));
  return { groups, score: bestScore };
}

/** Which rules does the current grouping miss? */
function evaluateGroups(c) {
  const at = new Map();
  c.groups.forEach((g, i) => g.studentIds.forEach(id => at.set(id, i)));
  const ids = [...at.keys()];
  const out = [];
  if (!c.groups.length) return { issues: out, bad: new Set() };
  const m = buildModel(c, ids, 'groups');
  const maxSize = Math.max(1, ...c.groups.map(g => g.studentIds.length));
  scoreGroups(m, at, c.groups.length, maxSize, out, {
    name: id => nameOf(c, id),
    group: i => c.groups[i].name,
  });
  return { issues: out, bad: new Set(out.filter(i => !i.soft).flatMap(i => i.ids)) };
}

/* ---------------- Seats ---------------- */

function seatGeometry(desks) {
  const idx = new Map(desks.map((d, i) => [d.id, i]));
  const adj = desks.map(a => new Set(desks.filter(b => adjacent(a, b)).map(b => idx.get(b.id))));
  return { idx, adj };
}

/** Desks in the front ~30% of the room (or enough for every front-row student). */
function frontDesks(desks, need) {
  if (!desks.length) return new Set();
  const byY = desks.map((d, i) => [d.y, i]).sort((a, b) => a[0] - b[0]);
  const F = Math.min(desks.length, Math.max(need, Math.ceil(desks.length * 0.3)));
  const cutoff = byY[F - 1][0];
  return new Set(byY.filter(([y]) => y <= cutoff).map(([, i]) => i));
}

/** Score a seating (lower is better). `deskOf` maps student id → desk index. */
function scoreSeats(m, deskOf, geo, front, out, ctx) {
  let s = 0;
  const near = (a, b) => deskOf.has(a) && deskOf.has(b) && geo.adj[deskOf.get(a)].has(deskOf.get(b));
  for (const [a, b] of m.apart) if (near(a, b)) {
    s += WEIGHT.pair;
    out && out.push({ ids: [a, b], text: `${ctx.name(a)} and ${ctx.name(b)} are sitting next to each other`, rule: 'Keep apart', key: 'apart' });
  }
  for (const [a, b] of m.together) if (deskOf.has(a) && deskOf.has(b) && !near(a, b)) {
    s += WEIGHT.pair;
    out && out.push({ ids: [a, b], text: `${ctx.name(a)} and ${ctx.name(b)} aren't sitting together`, rule: 'Keep together', key: 'together' });
  }
  for (const { label, mem } of m.spread) {
    for (let i = 0; i < mem.length; i++) for (let j = i + 1; j < mem.length; j++) if (near(mem[i], mem[j])) {
      s += WEIGHT.label;
      out && out.push({ ids: [mem[i], mem[j]], text: `${ctx.name(mem[i])} and ${ctx.name(mem[j])} (${label.name}) are next to each other`, rule: `${label.name}: spread out`, key: 'label:' + label.id });
    }
  }
  for (const { label, mem } of m.cluster) {
    for (const a of mem) if (deskOf.has(a) && !mem.some(b => b !== a && near(a, b))) {
      s += WEIGHT.label;
      out && out.push({ ids: [a], text: `${ctx.name(a)} isn't next to another ${label.name}`, rule: `${label.name}: together`, key: 'label:' + label.id });
    }
  }
  let repeats = 0;
  for (const [a, b] of m.prev) if (near(a, b)) { s += WEIGHT.fresh; repeats++; }
  if (out && repeats) out.push({ ids: [], text: `${repeats} pair${repeats > 1 ? 's' : ''} sat next to each other last time too`, rule: 'Mix it up', key: 'fresh', soft: true });
  for (const a of m.front) if (deskOf.has(a) && !front.has(deskOf.get(a))) {
    s += WEIGHT.front;
    out && out.push({ ids: [a], text: `${ctx.name(a)} isn't near the front`, rule: 'Seat near front', key: 'front' });
  }
  return s;
}

/** mode 'all' reseats everyone present; 'fill' keeps current seats and places the rest. */
function solveSeats(c, mode) {
  const absent = new Set(c.students.filter(s => s.absent).map(s => s.id));
  if (mode === 'all') {
    // Remember who sat next to whom, for the "Mix it up" rule.
    const was = c.desks.filter(d => d.active && d.studentId);
    const wasGeo = seatGeometry(was);
    const pairs = [];
    was.forEach((d, i) => wasGeo.adj[i].forEach(j => { if (j > i) pairs.push([d.studentId, was[j].studentId]); }));
    if (pairs.length) c.prevSeatPairs = pairs;   // nothing seated yet: keep the older memory
    c.desks.forEach(d => { d.studentId = null; });
  }
  const active = c.desks.filter(d => d.active);
  const geo = seatGeometry(active);
  const fixed = active.filter(d => d.studentId);
  const slots = active.filter(d => !d.studentId).map(d => geo.idx.get(d.id));
  const seated = new Set(c.desks.map(d => d.studentId).filter(Boolean));
  const toSeat = c.students.filter(s => !absent.has(s.id) && !seated.has(s.id)).map(s => s.id);
  const m = buildModel(c, [...fixed.map(d => d.studentId), ...toSeat], 'seats');
  const front = frontDesks(active, m.front.length);

  let best = null, bestScore = Infinity;
  const restarts = m.any ? 5 : 1;
  for (let r = 0; r < restarts && bestScore > 0; r++) {
    const deskOf = new Map(fixed.map(d => [d.studentId, geo.idx.get(d.id)]));
    const order = shuffle(slots.slice());
    const content = order.map((_, i) => toSeat[i] || null);   // content[i] sits at desk order[i]
    content.forEach((sid, i) => { if (sid) deskOf.set(sid, order[i]); });
    let score = m.any ? scoreSeats(m, deskOf, geo, front) : 0;
    for (let it = 0; it < 6000 && score > 0 && order.length > 1; it++) {
      const i = Math.floor(Math.random() * order.length), j = Math.floor(Math.random() * order.length);
      const a = content[i], b = content[j];
      if (i === j || (!a && !b)) continue;
      const place = () => {
        content[i] = b; content[j] = a;
        if (b) deskOf.set(b, order[i]);
        if (a) deskOf.set(a, order[j]);
      };
      place();
      const next = scoreSeats(m, deskOf, geo, front);
      if (next <= score) { score = next; continue; }
      content[i] = a; content[j] = b;          // undo the swap
      if (a) deskOf.set(a, order[i]);
      if (b) deskOf.set(b, order[j]);
    }
    if (score < bestScore) { bestScore = score; best = { order: order.slice(), content: content.slice() }; }
  }
  best.content.forEach((sid, i) => { if (sid) active[best.order[i]].studentId = sid; });
  return { leftOver: Math.max(0, toSeat.length - slots.length), score: bestScore };
}

/** Which rules does the current seating miss? */
function evaluateSeats(c) {
  const active = c.desks.filter(d => d.active);
  const geo = seatGeometry(active);
  const deskOf = new Map();
  active.forEach(d => { if (d.studentId) deskOf.set(d.studentId, geo.idx.get(d.id)); });
  const m = buildModel(c, [...deskOf.keys()], 'seats');
  const out = [];
  scoreSeats(m, deskOf, geo, frontDesks(active, m.front.length), out, { name: id => nameOf(c, id) });
  return { issues: out, bad: new Set(out.filter(i => !i.soft).flatMap(i => i.ids)) };
}
