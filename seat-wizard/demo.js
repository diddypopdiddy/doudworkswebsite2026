'use strict';

/* The public Grouper's rules engine is shared. This fixture is synthetic, in memory only. */
const DW = 92, DH = 50;
const adjacent = (a, b) => a !== b && Math.abs(a.x - b.x) <= DW * 1.5 && Math.abs(a.y - b.y) <= DH * 1.8;
const nameOf = (c, id) => c.students.find(s => s.id === id)?.name || '';
const shuffle = items => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};
const roles = ['Director', 'Camera operator', 'On-screen'];
const sample = [
  ['June', 0], ['Milo', 1], ['Nora', 2], ['Sam', 0],
  ['Aria', 1], ['Eli', 2], ['Zoe', 0], ['Finn', 1],
  ['Kai', 2], ['Remy', 0], ['Ivy', 1], ['Leo', 2],
].map(([name, role], i) => ({ id: String(i), name, role, labels: [String(role)], absent: false }));
const settings = {
  groups: { note: 'Make four groups of three.', rule: 'Keep June and Milo in different groups', action: 'Shuffle groups', unit: 'Group' },
  crews: { note: 'Make four crews from the sample role preferences.', rule: 'Give each crew a director, camera operator, and performer', action: 'Build crews', unit: 'Crew' },
  seats: { note: 'Seat the class in a 12-desk room.', rule: 'Keep June in the front row', action: 'Shuffle seats' },
};
const $ = id => document.getElementById(id);
const choices = [...document.querySelectorAll('[data-mode]')];
const make = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};
let mode = 'groups';
let useRule = { groups: true, crews: true, seats: true };
let plan = {};

function makePlan() {
  const enabled = useRule[mode];
  const c = {
    students: sample,
    labels: roles.map((name, i) => ({ id: String(i), name, dir: 'out', enabled: mode === 'crews' && enabled })),
    rules: mode === 'groups' ? [{ type: 'apart', enabled, pairs: [['0', '1']] }] : mode === 'seats' ? [{ type: 'front', enabled, students: ['0'] }] : [],
    groups: [],
    desks: sample.map((_, i) => ({ id: 'desk-' + i, x: (i % 4) * 125, y: Math.floor(i / 4) * 145, active: true, studentId: null })),
  };
  if (mode === 'seats') {
    solveSeats(c, 'all');
    // The full app treats approximately the first 30% as the front; here that is the first row of four.
    return { c, issues: evaluateSeats(c).issues };
  }
  const output = solveGroups(c, sample.map(s => s.id), [3, 3, 3, 3]);
  c.groups = output.groups.map((studentIds, i) => ({ name: settings[mode].unit + ' ' + (i + 1), studentIds }));
  return { c, issues: evaluateGroups(c).issues };
}

function draw() {
  const { c, issues } = plan[mode];
  const output = $('result');
  output.replaceChildren();
  if (mode === 'seats') {
    output.append(make('p', 'Front of room', 'board'));
    const desks = make('ol', undefined, 'desk-grid');
    c.desks.forEach((d, i) => {
      const desk = make('li', nameOf(c, d.studentId) || 'Open seat');
      desk.append(make('small', 'Desk ' + (i + 1)));
      desks.append(desk);
    });
    output.append(desks);
  } else {
    const row = make('div', undefined, 'cards');
    c.groups.forEach(g => {
      const card = make('section', undefined, 'card');
      card.append(make('h3', g.name));
      const members = make('ul');
      const students = g.studentIds.map(id => sample.find(s => s.id === id));
      if (mode === 'crews') students.sort((a, b) => a.role - b.role);
      students.forEach(student => {
        const li = make('li', student.name);
        if (mode === 'crews') li.append(make('small', roles[student.role]));
        members.append(li);
      });
      card.append(members);
      row.append(card);
    });
    output.append(row);
  }
  if (!useRule[mode]) $('status').textContent = 'Rule off. This layout uses a random shuffle.';
  else if (issues.length) $('status').textContent = 'Check this result: ' + issues.map(i => i.text).join('. ') + '.';
  else $('status').textContent = {
    groups: 'Rule met: June and Milo are in different groups.',
    crews: 'Rule met: every crew has all three roles.',
    seats: 'Rule met: June is in the front row.',
  }[mode];
}

function select(next, reroll = false) {
  mode = next;
  choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  $('mode-note').textContent = settings[mode].note;
  $('rule-label').textContent = settings[mode].rule;
  $('shuffle').textContent = settings[mode].action;
  $('rule').checked = useRule[mode];
  if (!plan[mode] || reroll) plan[mode] = makePlan();
  draw();
}
choices.forEach(button => button.addEventListener('click', () => select(button.dataset.mode)));
$('shuffle').addEventListener('click', () => select(mode, true));
$('rule').addEventListener('change', () => { useRule[mode] = $('rule').checked; select(mode, true); });
$('reset').addEventListener('click', () => { plan = {}; useRule = { groups: true, crews: true, seats: true }; select('groups'); });
select('groups');
