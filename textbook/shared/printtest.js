/* Printable part tests (FOUNDATION P). Paper first: US Letter, black-and-white safe.
   Student data (tests/<part>/test.js) has no answers. The teacher key (private teacher/ folder) passes `key`. */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const LETTERS = 'ABCDEFGHIJ';

  // Deterministic shuffle so Version B is the same on the test and on the key.
  function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffled(list, rand) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // Returns the items for a version, each MC item carrying `order` (display order of original option indexes).
  T.testVersion = (data, version) => {
    const rand = rng(data.part + ':' + version);
    return data.sections.map(sec => {
      let items = sec.items.map(it => Object.assign({}, it, { order: it.options ? it.options.map((_, i) => i) : null }));
      // Options are shuffled in both versions so correct answers don't cluster on A or B; Version B also reorders items.
      if (version === 'B') items = shuffled(items, rand);
      items.forEach(it => { if (it.options && !it.keepOrder) it.order = shuffled(it.order, rand); });
      return Object.assign({}, sec, { items });
    });
  };

  function pictures(it) {
    const list = it.pair || (it.media || it.svg ? [it] : null);
    if (!list) return null;
    const row = el('div', { className: 'pics' });
    row.style.setProperty('--n', list.length);
    list.forEach(m => row.append(el('figure', {}, m.svg ? T.svg(m.svg, 'illus', m.alt) : T.media(m.media || m), m.caption ? el('figcaption', { text: m.caption }) : null)));
    return row;
  }

  T.printTest = (data, opts) => {
    opts = opts || {};
    const key = opts.key || null;
    const params = new URLSearchParams(location.search);
    const version = params.get('v') === 'B' ? 'B' : 'A';
    const versionURL = selected => {
      const query = new URLSearchParams(params);
      query.set('v', selected);
      return '?' + query.toString();
    };
    const part = T.findPart(data.part);
    document.title = 'Part ' + part.number + ' test' + (key ? ' · KEY' : '') + ' · Version ' + version;
    const root = document.getElementById('app');

    const tools = el('div', { className: 'test-tools no-print' },
      el('a', { className: 'button small', href: T.partURL(part), text: '← Part ' + part.number }),
      el('a', { className: 'button small' + (version === 'A' ? ' selected' : ''), href: versionURL('A'), text: 'Version A' }),
      el('a', { className: 'button small' + (version === 'B' ? ' selected' : ''), href: versionURL('B'), text: 'Version B' }),
      T.button('Print', () => window.print(), 'primary small'),
      el('span', { className: 'muted', style: 'font-size:14px', text: data.printNote || 'Prints on US Letter. Black and white is fine.' }));
    const page = el('main', { className: 'test-page' });
    root.append(tools, page);

    page.append(el('header', { className: 'test-head' },
      el('div', {}, el('div', { className: 'eyebrow', text: (T.toc.title || 'Video Production') + ' · Part ' + part.number + ' test' + (key ? ' · ANSWER KEY' : '') }), el('h1', { text: part.title }), el('div', { className: 'muted', style: 'font-size:13px', text: 'Version ' + version + ' · about ' + data.minutes + ' minutes' })),
      el('div', { className: 'who' }, ['Name', 'Date', 'Period'].map(w => el('span', {}, w, el('i'))))));
    page.append(el('p', { className: 'test-instr', html: data.instructions }));

    let n = 0;
    const tally = {};
    T.testVersion(data, version).forEach(sec => {
      const s = el('section', { className: 'test-section' }, el('h2', {}, sec.title + ' ', el('small', { text: sec.note || '' })));
      sec.items.forEach(it => {
        if (it.type === 'match') {
          const start = n + 1; n += it.defs.length;
          const terms = el('div', { className: 'match' }, it.terms.map((t, i) => el('div', {}, el('strong', { text: LETTERS[i] + '.' }), t)));
          const defs = el('div', { style: 'display:grid;gap:6px;margin-top:10px' }, it.defs.map((d, i) => {
            const ans = key && key[it.id] ? LETTERS[key[it.id][i]] : '';
            return el('div', { style: 'display:flex;gap:10px' }, el('strong', { text: (start + i) + '.' }), el('span', { className: 'blank', text: ans }), el('span', { text: d }));
          }));
          s.append(el('div', { className: 'titem' }, el('span', { className: 'n', text: start + '–' + n }), el('div', {}, el('div', { className: 'stem', text: it.stem }), terms, defs, tag(it))));
          tally[it.level] = (tally[it.level] || 0) + it.defs.length;
          return;
        }
        n++;
        tally[it.level] = (tally[it.level] || 0) + 1;
        const body = el('div', {}, el('div', { className: 'stem', html: it.stem }));
        const pics = pictures(it); if (pics) body.append(pics);
        if (it.type === 'mc') {
          const right = key ? key[it.id] : null;
          const long = it.options.some(o => o.length > 46);
          body.append(el('div', { className: 'opts' + (long ? ' one' : '') }, it.order.map((oi, pos) => el('div', { className: 'opt' },
            el('span', { className: 'bubble', style: right === oi ? 'background:#171b1f;color:#fff' : '', text: LETTERS[pos] }), el('span', { text: it.options[oi] })))));
          if (key && key.explain && key.explain[it.id]) body.append(el('p', { className: 'tag', style: 'margin-top:6px;color:#1f7a4d', text: 'Why: ' + key.explain[it.id] }));
        } else if (it.type === 'written') {
          if (it.sketch) body.append(el('div', { className: 'sketch' }, Array.from({ length: it.sketch }, () => el('div'))));
          body.append(el('div', { className: 'lines' }, Array.from({ length: it.lines || 5 }, () => el('div'))));
          if (key && key.rubric && key.rubric[it.id]) body.append(el('div', { className: 'card', style: 'margin-top:8px;font-size:13px' }, el('strong', { text: 'Rubric (4 points)' }), el('ol', { style: 'margin:6px 0 0;padding-left:20px' }, key.rubric[it.id].map(r => el('li', { text: r })))));
        }
        if (key) body.append(tag(it));
        s.append(el('div', { className: 'titem' }, el('span', { className: 'n', text: n + '.' }), body));
      });
      page.append(s);
    });
    page.append(el('p', { className: 'muted', style: 'margin-top:16px;font-size:12px', text: 'Items: ' + n + ' · Levels — 1 Foundational: ' + (tally[1] || 0) + ', 2 Knowledge: ' + (tally[2] || 0) + ', 3 Application: ' + (tally[3] || 0) + ', 4 Extended thinking: ' + (tally[4] || 0) }));
    function tag(it) {
      if (!key) return null;
      const f = T.findTopic(it.topic);
      return el('div', { className: 'tag', style: 'margin-top:4px', text: 'Level ' + it.level + ' · ' + (f ? f.topic.id + ' ' + f.topic.title : it.topic) + (it.obj != null ? ' · objective ' + (it.obj + 1) : '') });
    }
  };
})();
