/* Video Production textbook: page shell, vocabulary, media helpers, basic blocks and Check yourself.
   Plain classic script (FOUNDATION B2). One global: window.Textbook. */
(function () {
  'use strict';

  const ROOT = new URL('../', document.currentScript.src);
  const CFG = window.TEXTBOOK_CONFIG || {};
  const TOC = window.TEXTBOOK_TOC || { parts: [] };
  const GLOSSARY = window.TEXTBOOK_GLOSSARY || [];
  const MEDIA = window.TEXTBOOK_MEDIA || {};
  const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
  const T = window.Textbook = { ROOT, DEBUG, blocks: {}, mediaUsed: new Set(), players: new Set() };

  /* ------------------------------------------------------------------ DOM helpers */
  function el(tag, attrs) {
    const n = document.createElement(tag);
    if ((tag === 'video' || tag === 'audio') && /^https?:$/.test(location.protocol)) n.crossOrigin = 'anonymous';
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'className') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'disabled' || k === 'hidden' || k === 'checked' || k === 'muted') n[k] = !!v;
      else n.setAttribute(k, v === true ? '' : String(v));
    });
    const add = c => { if (Array.isArray(c)) c.forEach(add); else if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c))); };
    Array.prototype.slice.call(arguments, 2).forEach(add);
    return n;
  }
  const svgNS = 'http://www.w3.org/2000/svg';
  T.el = el;
  T.html = (markup, tag) => el(tag || 'div', { html: T.rich(markup || '') });
  T.button = (label, fn, cls) => el('button', { type: 'button', className: 'button ' + (cls || ''), onclick: fn }, label);
  T.card = (title, content, cls) => el('div', { className: 'card ' + (cls || '') }, title ? el('h3', { text: title }) : null, typeof content === 'string' ? T.html(content) : content);
  T.feedback = (node, message, good) => { node.innerHTML = T.rich(message); node.className = 'feedback ' + (good ? 'good' : 'bad'); };
  T.stage = (left, right) => el('div', { className: 'stage' }, left, el('div', { className: 'panel' }, right));
  T.url = path => new URL(path, ROOT).href;
  T.stopPlayers = except => T.players.forEach(p => { if (p !== except && p.stop) p.stop(); });
  T.uid = (p => () => p + Math.random().toString(36).slice(2, 8))('tb-');
  T.svg = (markup, cls, label) => {
    const wrap = el('div', { html: markup });
    const s = wrap.firstElementChild;
    if (s) { s.classList.add(cls || 'illus'); if (label) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', label); } }
    return s || wrap;
  };

  /* ------------------------------------------------------------------ Table of contents */
  T.toc = TOC;
  T.findTopic = slug => {
    const all = [];
    TOC.parts.forEach(p => p.topics.forEach(t => all.push({ part: p, topic: t })));
    const i = all.findIndex(x => x.topic.slug === slug);
    if (i < 0) return null;
    const built = x => x && x.topic.built;
    let prev = null, next = null;
    for (let j = i - 1; j >= 0; j--) if (built(all[j])) { prev = all[j]; break; }
    for (let j = i + 1; j < all.length; j++) if (built(all[j])) { next = all[j]; break; }
    return { part: all[i].part, topic: all[i].topic, prev, next };
  };
  T.findPart = slug => TOC.parts.find(p => p.slug === slug);
  T.topicURL = t => T.url('topics/' + t.slug + '/index.html');
  T.partURL = p => T.url('parts/' + p.slug + '/index.html');
  T.testURL = p => T.url('tests/' + p.slug + '/index.html');

  const MODE_ICON = {
    read: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3.5c2-.8 4-.8 6 .6 2-1.4 4-1.4 6-.6v9c-2-.8-4-.8-6 .6-2-1.4-4-1.4-6-.6z"/><path d="M8 4.1v9"/></svg>',
    explore: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2.5v8.2l2.2-2 1.7 3.8 1.6-.8-1.7-3.7h3z"/></svg>',
    watch: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.8" y="3" width="12.4" height="10" rx="1.5"/><path d="M6.5 6v4l3.5-2z" fill="currentColor"/></svg>',
    practice: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 8.4 3 3 7-7"/></svg>'
  };
  const MODE_LABEL = { read: 'Read', explore: 'Explore', watch: 'Watch', practice: 'Practice' };
  T.modes = modes => el('span', { className: 'modes' }, (modes || []).map(m => el('span', { className: 'mode', title: MODE_LABEL[m] }, el('span', { html: MODE_ICON[m] }), MODE_LABEL[m])));

  /* ------------------------------------------------------------------ Vocabulary (V1–V3) */
  const byId = {}, byWord = {};
  GLOSSARY.forEach(g => { byId[g.id] = g; byWord[g.term.toLowerCase()] = g; if (g.plural) byWord[g.plural.toLowerCase()] = g; });
  T.term = id => byId[id];
  T.usedTerms = new Set();
  T.missingTerms = [];
  // [[term]] or [[shown words|glossary-id]] -> a bold, tappable term.
  T.rich = s => String(s ?? '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, shown, id) => {
    const g = id ? byId[id.trim()] : byWord[shown.trim().toLowerCase()];
    if (!g) { T.missingTerms.push(m); console.error('Unknown vocabulary term: ' + m); return '<span class="term-missing">' + shown + '</span>'; }
    T.usedTerms.add(g.id);
    return '<button type="button" class="term" data-term="' + g.id + '">' + shown + '</button>';
  });
  let pop = null, popFor = null;
  function closePop(returnFocus) { if (pop) { pop.remove(); pop = null; if (returnFocus && popFor) popFor.focus(); popFor = null; } }
  function openPop(btn) {
    closePop();
    const g = byId[btn.dataset.term];
    if (!g) return;
    const found = T.findTopic(g.introducedIn);
    const here = document.body.dataset.topic === g.introducedIn;
    pop = el('div', { className: 'term-pop', role: 'dialog', 'aria-label': g.term },
      el('strong', { text: g.term }), el('span', { text: g.def }),
      found && !here ? (found.topic.built ? el('a', { href: T.topicURL(found.topic), text: 'Learn it in ' + found.topic.id + ' →' }) : el('div', { className: 'muted', style: 'font-size:13px;margin-top:6px', text: 'Taught in ' + found.topic.id + ' ' + found.topic.title + ' (coming later)' })) : null);
    document.body.append(pop);
    const r = btn.getBoundingClientRect();
    const left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 316);
    pop.style.left = Math.max(8, left) + 'px';
    pop.style.top = (window.scrollY + r.bottom + 8) + 'px';
    popFor = btn;
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('button.term');
    if (btn) { e.preventDefault(); if (popFor === btn) closePop(); else openPop(btn); return; }
    if (pop && !pop.contains(e.target)) closePop();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(true); });

  /* ------------------------------------------------------------------ Media (M1–M3) */
  const mediaBase = new URL(CFG.mediaBase || 'media/', ROOT);
  T.mediaRecord = id => MEDIA[id];
  // 16:9 media fills the frame; older 4:3 films are letterboxed rather than cropped.
  T.fit = rec => rec && rec.w && rec.h && rec.w / rec.h < 1.6 ? 'contain' : 'cover';
  T.mediaURL = rec => new URL(rec.file, mediaBase).href;
  T.placeholderBox = (rec, small) => {
    const what = /photo/.test(rec.type) ? 'Photos needed' : 'Clip needed';
    return el('div', { className: 'placeholder' + (small ? ' small' : ''), role: 'img', 'aria-label': what + ': ' + (rec.alt || rec.need) },
      el('strong', { text: what }), el('span', { text: rec.need || rec.alt || '' }), small ? null : el('code', { text: rec.file }));
  };
  function missingBox(rec) {
    return el('div', { className: 'placeholder', role: 'img', 'aria-label': 'Missing media file' },
      el('strong', { text: 'Media file not found' }), el('span', { text: 'Add this file to the media folder:' }), el('code', { text: rec.file }));
  }
  T.standinTag = () => el('span', { className: 'standin-tag', title: 'Temporary stand-in. Vince’s footage will replace it.' }, 'Stand-in');
  // A crop of a photo (v1 F6). frame = [x, y, w] in as-seen source pixels; mirror flips left to right.
  T.crop = (rec, frame, mirror) => {
    const box = el('div', { className: 'crop' });
    const img = el('img', { src: T.mediaURL(rec), alt: '', draggable: 'false' });
    const [x, y, w] = frame, h = w * 9 / 16;
    Object.assign(img.style, { width: (rec.w / w * 100) + '%', left: (-x / w * 100) + '%', top: (-y / h * 100) + '%', transform: mirror ? 'scaleX(-1)' : '' });
    img.addEventListener('error', () => box.replaceWith(missingBox(rec)));
    box.append(img);
    return box;
  };
  // Render any media reference: 'id' or { id, t, mirror, crop, small }.
  T.media = (ref, opts) => {
    const r = typeof ref === 'string' ? { id: ref } : Object.assign({}, ref);
    Object.assign(r, opts || {});
    const rec = MEDIA[r.id];
    if (!rec) { console.error('Unknown media id: ' + r.id); return el('div', { className: 'placeholder' }, el('strong', { text: 'Unknown media: ' + r.id })); }
    T.mediaUsed.add(r.id);
    if (rec.status === 'placeholder') return T.placeholderBox(rec, r.small);
    let node;
    const mirror = r.mirror != null ? r.mirror : rec.mirror;
    if (rec.type === 'video') {
      node = el('div', { className: 'still' });
      const v = el('video', { muted: true, playsinline: true, preload: 'auto', 'aria-hidden': 'true', src: T.mediaURL(rec) + '#t=' + (r.t || 0).toFixed(2) });
      v.muted = true;
      v.style.objectFit = T.fit(rec);
      if (mirror) v.style.transform = 'scaleX(-1)';
      v.addEventListener('error', () => node.replaceChildren(missingBox(rec)));
      node.append(v);
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', r.alt || rec.alt || '');
    } else if (r.crop) {
      node = T.crop(rec, r.crop, mirror);
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', r.alt || rec.alt || '');
    } else {
      node = el('div', { className: 'still' });
      const img = el('img', { src: T.mediaURL(rec), alt: r.alt || rec.alt || '', style: 'width:100%;height:100%;object-fit:cover;display:block' + (mirror ? ';transform:scaleX(-1)' : '') });
      img.addEventListener('error', () => node.replaceChildren(missingBox(rec)));
      node.append(img);
      if (rec.cameraFrame) {
        const [x, y, w, h] = rec.cameraFrame;
        node.append(el('span', { className: 'camera-frame-guide', 'aria-hidden': 'true',
          style: 'left:' + x + '%;top:' + y + '%;width:' + w + '%;height:' + h + '%' }));
      }
    }
    if (r.filter) node.querySelectorAll('img,video').forEach(n => { n.style.filter = r.filter; });
    if (rec.status === 'standin') { node.style.position = 'relative'; node.append(T.standinTag()); }
    return node;
  };
  T.monitor = label => el('div', { className: 'monitor' }, label ? el('span', { className: 'pill', text: label }) : null);

  /* ------------------------------------------------------------------ Page shell (B4) */
  function topbar(part) {
    const toggle = el('button', { type: 'button', className: 'button small sidebar-toggle', 'aria-expanded': 'false' }, 'Topics');
    const bar = el('header', { className: 'topbar' },
      toggle,
      el('a', { className: 'book', href: T.url('index.html'), text: CFG.title || TOC.title }),
      part ? el('span', { className: 'sep', text: '/' }) : null,
      part ? el('a', { className: 'crumb', href: T.partURL(part), text: 'Part ' + part.number + ' · ' + part.title }) : null,
      el('span', { className: 'spacer' }),
      el('a', { className: 'crumb', href: T.url('glossary/index.html'), text: 'Glossary' }));
    return { bar, toggle };
  }
  function sidebar(part, currentSlug) {
    const list = el('ol');
    part.topics.forEach(t => list.append(el('li', {}, t.built
      ? el('a', { href: T.topicURL(t), 'aria-current': t.slug === currentSlug ? 'page' : null }, el('span', { className: 'num', text: t.id }), el('span', { text: t.title }))
      : el('span', {}, el('span', { className: 'num', text: t.id }), el('span', { text: t.title })))));
    return el('nav', { className: 'sidebar', 'aria-label': 'Topics in Part ' + part.number },
      el('h2', {}, el('a', { href: T.partURL(part), text: 'Part ' + part.number + ' · ' + part.title })), list,
      el('div', { className: 'test-link' },
        el('a', { className: 'side-extra', href: T.partURL(part).replace('index.html', 'review.html'), text: 'Review before the test' }),
        el('a', { className: 'side-extra', href: T.partURL(part).replace('index.html', 'project.html'), text: 'Part ' + part.number + ' project' }),
        el('a', { className: 'side-extra', href: T.url('notes/index.html?part=' + part.slug), text: 'All guided notes (print)' }),
        el('a', { className: 'button small', style: 'margin-top:8px', href: T.testURL(part) }, 'Part ' + part.number + ' test (print)')));
  }
  T.shell = (part, currentSlug) => {
    const root = document.getElementById('app') || document.body;
    const { bar, toggle } = topbar(part);
    const page = el('main', { className: 'page', id: 'main' });
    if (part) {
      const side = sidebar(part, currentSlug);
      toggle.addEventListener('click', () => { const open = side.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) { side.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
      root.append(bar, el('div', { className: 'layout' }, side, page));
    } else {
      toggle.remove();
      root.append(bar, page);
    }
    return page;
  };

  /* ------------------------------------------------------------------ Blocks (T5) */
  T.blocks.text = b => ({ el: T.html(b.html, 'div') , cls: 'text' });
  T.blocks.figure = b => ({ el: el('figure', { className: 'fig' }, b.svg ? T.svg(b.svg, 'illus', b.alt) : T.media(b.media), b.caption ? el('figcaption', { html: T.rich(b.caption) }) : null), wide: b.wide });
  T.blocks['figure-row'] = b => {
    const row = el('div', { className: 'fig-row' });
    row.style.setProperty('--n', b.items.length);
    b.items.forEach(it => row.append(el('figure', {}, it.svg ? T.svg(it.svg, 'illus', it.alt) : T.media(it.media || it), it.caption ? el('figcaption', { html: T.rich(it.caption) }) : null)));
    return { el: el('div', {}, row, b.caption ? el('p', { className: 'caption', style: 'margin-top:8px', html: T.rich(b.caption) }) : null), wide: b.wide };
  };
  T.blocks.steps = b => ({ el: el('ol', { className: 'text' }, b.items.map(s => el('li', { html: T.rich(s) }))) });
  const CALLOUT = { try: 'Try this', consider: 'Consider this', onset: 'On set', mistake: 'Watch out', history: 'History' };
  T.blocks.callout = b => ({ el: el('aside', { className: 'callout ' + b.kind }, el('div', { className: 'label', text: b.title || CALLOUT[b.kind] }), el('div', { html: T.rich(b.html) }), b.link ? el('a', { href: b.link.href, text: b.link.label, style: 'display:inline-block;margin-top:6px' }) : null), callout: true });
  T.blocks['quick-check'] = b => ({ el: quickCheck(b) });
  // A multi-question practice quiz in the Check yourself style (used for Name it rounds).
  T.blocks.quiz = b => { const host = el('div'); T.quiz(host, b.items, { label: b.label }); return { el: el('div', {}, b.label ? el('p', { className: 'label', style: 'margin-bottom:6px', text: b.label }) : null, host), wide: true, interactive: true }; };

  T.renderBlock = b => {
    const make = T.blocks[b.type];
    if (!make) { console.error('Unknown block type: ' + b.type); return { el: el('div', { className: 'placeholder' }, 'Unknown block: ' + b.type) }; }
    const out = make(b) || {};
    const node = el('div', { className: 'blk' + (out.cls ? ' ' + out.cls : '') + (out.wide ? ' wide' : '') + (out.callout ? ' callout' : '') + (out.interactive ? ' interactive' : '') });
    node.append(out.el);
    if (out.interactive) node.append(el('p', { className: 'print-only muted', text: out.printNote || 'Interactive activity: open this topic online to try it.' }));
    return { node, out };
  };

  // Sections are laid out in rows (FOUNDATION T2, revised): reading text sits beside its picture or clip,
  // callouts tuck under the text (or beside it when there is no media), and wide tools take the full width.
  const TEXT_BLOCKS = { text: 1, steps: 1 };
  function renderSection(s, i) {
    // The number only shows in the 'card' section style, the default (data.sectionStyle: 'plain' turns it off).
    const head = el('div', { className: 'section-head' }, el('span', { className: 'sec-num', 'aria-hidden': 'true', text: String(i + 1) }),
      el('div', {}, el('h2', { html: T.rich(s.title) }), s.intro ? el('p', { className: 'intro', html: T.rich(s.intro) }) : null));
    const sec = el('section', { className: 'section' }, head);
    const body = el('div', { className: 'section-body' });
    let row = null;
    const start = () => (row = { text: [], media: [], more: [], callouts: [] });
    s.blocks.forEach(b => {
      const { node, out } = T.renderBlock(b);
      if (out.wide) { flushRow(body, row); row = null; body.append(el('div', { className: 'row row-wide' }, node)); return; }
      if (out.callout) { (row || start()).callouts.push(node); return; }
      if (TEXT_BLOCKS[b.type]) { if (!row || row.media.length || row.callouts.length) { flushRow(body, row); start(); } row.text.push(node); return; }
      if (!row) start();
      if (row.text.length && row.media.length) row.more.push(node); else row.media.push(node);
    });
    flushRow(body, row);
    sec.append(body);
    return sec;
  }
  function flushRow(body, r) {
    if (!r) return;
    const col = (cls, nodes) => el('div', { className: 'col ' + cls }, nodes);
    if (r.text.length && r.media.length) body.append(el('div', { className: 'row row-split' }, col('col-read', r.text.concat(r.callouts)), col('col-media', r.media)));
    else if (r.text.length && r.callouts.length) body.append(el('div', { className: 'row row-note' }, col('col-read', r.text), col('col-side', r.callouts)));
    else if (r.text.length) body.append(el('div', { className: 'row row-text' }, col('col-read', r.text)));
    else if (r.media.length && r.callouts.length) body.append(el('div', { className: 'row row-note row-media' }, col('col-read', r.media), col('col-side', r.callouts)));
    else if (r.media.length) body.append(el('div', { className: 'row row-gallery n' + Math.min(r.media.length, 2) }, r.media));
    else if (r.callouts.length) body.append(el('div', { className: 'row row-callouts' }, r.callouts));
    if (r.more.length) body.append(el('div', { className: 'row row-gallery n' + Math.min(r.more.length, 2) }, r.more));
  }

  /* ------------------------------------------------------------------ Questions (T7) */
  function optionText(o) { return typeof o === 'string' ? o : o.text; }
  function optionClue(o) { return typeof o === 'string' ? '' : (o.clue || ''); }
  function stemMedia(q) {
    if (q.svg) return T.svg(q.svg, 'illus', q.alt);
    if (q.media) return T.media(q.media);
    if (q.pair) { const row = el('div', { className: 'pair' }); q.pair.forEach(m => row.append(el('figure', { className: 'fig' }, m.svg ? T.svg(m.svg, 'illus', m.alt) : T.media(m.media || m), m.caption ? el('figcaption', { text: m.caption }) : null))); return row; }
    return null;
  }
  function askOne(q, host, onRight, opts) {
    const answers = el('div', { className: 'answers', role: 'group', 'aria-label': 'Answers' });
    const fb = el('div', { 'aria-live': 'polite' });
    let missed = false, done = false;
    // Show options in a stable shuffled order (seeded by the question text) so the right answer isn't always first.
    let seed = 0; String(q.q || '').split('').forEach(ch => { seed = (seed * 31 + ch.charCodeAt(0)) >>> 0; });
    const order = q.options.map((_, i) => i);
    if (!q.keepOrder) for (let k = order.length - 1; k > 0; k--) { seed = (seed * 1103515245 + 12345) >>> 0; const j = seed % (k + 1); [order[k], order[j]] = [order[j], order[k]]; }
    const btns = [];
    order.forEach(i => { const o = q.options[i]; btns[i] = make(o, i); });
    function make(o, i) {
      const b = T.button(optionText(o), () => {
        if (done) return;
        if (i === q.answer) {
          done = true; b.classList.add('good'); btns.forEach(x => { x.disabled = true; });
          T.feedback(fb, 'Yes. ' + (q.explain || ''), true);
          onRight(!missed);
        } else {
          missed = true; b.classList.add('bad'); b.disabled = true;
          T.feedback(fb, 'Not quite. ' + (optionClue(o) ? optionClue(o) + ' ' : '') + 'Look again.', false);
        }
      });
      answers.append(b);
      return b;
    }
    host.append(el('p', { className: 'q', html: T.rich(q.q) }), answers, fb);
    return { focus: () => answers.firstElementChild && answers.firstElementChild.focus() };
  }
  function quickCheck(b) {
    const ask = el('div', { className: 'qc-ask' }, el('div', { className: 'label', text: 'Quick check' }));
    const m = stemMedia(b);
    askOne(b, ask, () => {});
    // Media beside the question when the box is wide enough (container query in textbook.css).
    return el('div', { className: 'quick-check' }, el('div', { className: 'qc-grid' + (m ? '' : ' no-media') }, m ? el('div', { className: 'qc-media' }, m) : null, ask));
  }
  T.quiz = (host, items, opts) => {
    opts = opts || {};
    let index = 0, score = 0;
    function render(focus) {
      host.replaceChildren();
      const q = items[index];
      const media = stemMedia(q);
      const right = el('div', {}, el('p', { className: 'label', text: 'Question ' + (index + 1) + ' of ' + items.length }));
      const next = T.button(index === items.length - 1 ? 'See your result' : 'Next →', () => { if (index === items.length - 1) showScore(); else { index++; render(true); } }, 'primary next');
      next.hidden = true;
      const asked = askOne(q, right, firstTry => { if (firstTry) score++; next.hidden = false; next.focus(); });
      right.append(next);
      host.append(el('div', { className: 'quiz' + (media ? '' : ' no-media') }, media ? el('div', {}, media) : null, right));
      if (focus) asked.focus();
    }
    function showScore() {
      host.replaceChildren(el('div', { className: 'quiz-score' },
        el('div', { className: 'big', text: score + ' of ' + items.length }),
        el('p', { text: 'right on the first try.' + (score === items.length ? ' Perfect.' : '') }),
        el('div', { className: 'actions' }, T.button('Try again', () => { index = 0; score = 0; render(true); }), opts.nextHref ? el('a', { className: 'button primary', href: opts.nextHref, text: opts.nextLabel || 'Next topic →' }) : null)));
    }
    render(false);
  };

  /* ------------------------------------------------------------------ Topic page (T1) */
  // T.mode: 'page' (default) renders the topic; 'notes' renders printable guided notes; 'collect' only stores the data.
  T.mode = T.mode || 'page';
  T.collected = [];
  T.topic = data => {
    const found = T.findTopic(data.slug);
    if (!found) throw new Error('Topic not in toc.js: ' + data.slug);
    if (T.mode === 'collect') { T.collected.push(Object.assign({ _topic: found.topic, _part: found.part }, data)); return; }
    if (T.mode === 'notes') { T.notesPage(data, found); return; }
    const { part, topic, prev, next } = found;
    document.body.dataset.topic = topic.slug;
    document.title = topic.id + ' ' + topic.title + ' · ' + (CFG.title || TOC.title);
    const page = T.shell(part, topic.slug);
    page.classList.add('wide-page');

    page.append(el('header', { className: 'topic-header' },
      el('a', { className: 'eyebrow', href: T.partURL(part), text: 'Part ' + part.number + ' · ' + part.title }),
      el('h1', {}, el('span', { className: 'tnum', text: topic.id }), topic.title),
      el('p', { className: 'big-idea', html: T.rich(data.bigIdea || topic.bigIdea) }),
      el('div', { className: 'meta' }, el('span', { text: 'About ' + data.minutes + ' minutes' }), topic.optional ? el('span', { className: 'label', text: 'Optional primer' }) : null, T.modes(topic.modes),
        el('a', { className: 'notes-link', href: T.url('notes/index.html?t=' + topic.slug), text: 'Guided notes (print)' }))));
    const note = el('p', { className: 'standin-note', hidden: true });
    page.querySelector('.topic-header').append(note);
    if (data.hook) page.append(hookCard(data.hook));

    // Words to know (V2)
    const dl = el('dl');
    (data.vocab || []).forEach(id => {
      const g = byId[id];
      if (!g) { console.error('Unknown vocab id: ' + id); T.missingTerms.push(id); return; }
      dl.append(el('div', { className: 'item' }, el('dt', { text: g.term }), el('dd', { text: g.def })));
    });
    const vocab = el('section', { className: 'vocab', 'aria-labelledby': 'words-to-know' }, el('h2', { id: 'words-to-know', text: 'Words to know' }), dl);
    if (data.review && data.review.length) vocab.append(el('p', { className: 'review' }, el('span', { className: 'label', text: 'Review' }), data.review.map(id => el('span', { html: T.rich('[[' + (byId[id] ? byId[id].term : id) + '|' + id + ']]') + ' ' }))));
    const objectives = el('section', { className: 'objectives' }, el('h2', { text: 'By the end, you can' }), el('ul', {}, (data.objectives || []).map(o => el('li', { html: T.rich(o) }))));
    page.append(el('div', { className: 'lesson-start' }, vocab, objectives));
    page.classList.add('sections-' + (data.sectionStyle || 'card'));
    (data.sections || []).forEach((s, i) => page.append(renderSection(s, i)));

    const check = el('section', { className: 'check', 'aria-labelledby': 'check-yourself' }, el('h2', { id: 'check-yourself', text: 'Check yourself' }), el('p', { className: 'intro', text: 'Answer each question. Nothing is saved or graded.' }));
    const quizHost = el('div');
    check.append(quizHost);
    page.append(check);
    T.quiz(quizHost, data.check || [], { nextHref: next ? T.topicURL(next.topic) : T.partURL(part), nextLabel: next ? 'Next: ' + next.topic.id + ' ' + next.topic.title + ' →' : 'Back to Part ' + part.number });

    page.append(el('div', { className: 'lesson-end' },
      el('section', { className: 'remember' }, el('h2', { text: 'Remember' }), el('ul', {}, (data.remember || []).map(r => el('li', { html: T.rich(r) })))),
      data.realCamera ? el('div', { className: 'real-camera' }, T.card(data.realCameraTitle || 'Try it with a real camera', data.realCamera, 'warm')) : null));

    page.append(el('nav', { className: 'next-nav', 'aria-label': 'Next and previous topic' },
      prev ? el('a', { className: 'button', href: T.topicURL(prev.topic), text: '← ' + prev.topic.id + ' ' + prev.topic.title }) : el('a', { className: 'button', href: T.partURL(part), text: '← Part ' + part.number }),
      next ? el('a', { className: 'button primary', href: T.topicURL(next.topic), text: 'Next: ' + next.topic.id + ' ' + next.topic.title + ' →' }) : el('a', { className: 'button primary', href: T.testURL(part), text: 'Part ' + part.number + ' test →' })));

    // Stand-in / placeholder notice, after all media has been rendered.
    const statuses = Array.from(T.mediaUsed).map(id => MEDIA[id] && MEDIA[id].status);
    const nStand = statuses.filter(s => s === 'standin').length, nHold = statuses.filter(s => s === 'placeholder').length;
    if (nStand || nHold) {
      note.hidden = false;
      note.textContent = [nStand ? 'Some media are temporary stand-ins.' : '', nHold ? 'Striped boxes mark media still to be recorded.' : ''].join(' ').trim();
    }
    if (DEBUG) page.append(debugPanel());
    try { localStorage.setItem('textbook:last', topic.slug); } catch (e) { /* storage unavailable: fine */ }
    T.page = { part, topic, data };
  };

  /* ------------------------------------------------------------------ Think first (hook, T1 item 2) */
  // A short puzzle before the vocabulary: show something, ask one question, reveal after any answer.
  function hookCard(h) {
    let media = null;
    if (h.sequence) media = T.sequence(h.sequence, { label: h.playLabel || '▶ Play' }).el;
    else if (h.svg || h.media || h.pair) media = stemMedia(h);
    const sounds = (h.audioExamples || []).map(example => {
      const record = T.mediaRecord(example.media);
      T.mediaUsed.add(example.media);
      if (!record || record.status === 'placeholder') return T.placeholderBox(record || { file: example.media }, true);
      const audio = el('audio', { controls: true, preload: 'metadata', src: T.mediaURL(record), 'aria-label': example.label });
      const player = { stop: () => audio.pause() };
      T.players.add(player);
      audio.addEventListener('play', () => T.stopPlayers(player));
      return el('figure', { className: 'hook-audio' }, audio, el('figcaption', { text: example.label }));
    });
    const reveal = el('div', { className: 'hook-reveal', hidden: true, 'aria-live': 'polite' });
    const answers = el('div', { className: 'answers' });
    const btns = (h.options || []).map((o, i) => {
      const b = T.button(o, () => {
        btns.forEach(x => { x.disabled = true; });
        b.classList.add(h.answer == null || h.answer === i ? 'selected' : 'bad');
        const verdict = h.answer == null ? '' : (h.answer === i ? '<strong>Good eye.</strong> ' : '<strong>Not quite, and that’s fine.</strong> ');
        reveal.innerHTML = T.rich(verdict + h.reveal);
        reveal.append(el('a', { className: 'button small', href: '#words-to-know', text: 'Start the lesson ↓' }));
        reveal.hidden = false;
      });
      answers.append(b);
      return b;
    });
    return el('section', { className: 'hook', 'aria-labelledby': 'think-first' },
      el('div', { className: 'hook-media' }, media, sounds),
      el('div', { className: 'hook-ask' }, el('p', { className: 'label', id: 'think-first', text: 'Think first' }), el('p', { className: 'q', html: T.rich(h.question) }), answers, reveal));
  }
  T.stemMedia = q => stemMedia(q);

  /* ------------------------------------------------------------------ Printable guided notes (notes mode) */
  T.notesPage = (data, found) => {
    const { part, topic } = found;
    const root = document.getElementById('notes') || document.getElementById('app');
    if (!T._notesTitled) { document.title = 'Guided notes · ' + (T._notesPart ? 'Part ' + part.number : topic.id + ' ' + topic.title); T._notesTitled = true; }
    const terms = (data.vocab?.length ? data.vocab : (data.review || [])).map(id => byId[id]).filter(Boolean);
    const frames = data.notes?.frames || 2;
    const blankTerms = new Set(terms.map(g => g.id));
    // Remember lines become fill-ins: this topic's vocabulary words turn into blanks, listed in a word bank.
    const fill = s => String(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, shown, id) => { const g = id ? byId[id.trim()] : byWord[shown.trim().toLowerCase()]; return g && blankTerms.has(g.id) ? '<span class="fill-blank">&nbsp;</span>' : shown; });
    const sheet = el('article', { className: 'notes-sheet' },
      el('header', { className: 'test-head' },
        el('div', {}, el('div', { className: 'eyebrow', text: 'Guided notes · Part ' + part.number + ' · ' + part.title }), el('h1', {}, topic.id + ' ' + topic.title), el('div', { className: 'notes-big', html: T.rich(data.bigIdea || topic.bigIdea).replace(/<button[^>]*>|<\/button>/g, '') })),
        el('div', { className: 'who' }, ['Name', 'Date', 'Period'].map(w => el('span', {}, w, el('i'))))),
      el('h2', { text: 'Words to know: write each one in your own words' }),
      el('div', { className: 'notes-terms' }, terms.map(g => el('div', { className: 'nt' }, el('strong', { text: g.term }), el('div', { className: 'lines' }, el('div'), el('div'))))),
      el('h2', { text: 'Key ideas: fill in the blanks' }),
      el('p', { className: 'word-bank' }, el('strong', { text: 'Word bank: ' }), terms.map(g => g.term).sort().join(' · ')),
      el('ol', { className: 'notes-fill' }, (data.remember || []).map(r => el('li', { html: fill(r) }))),
      data.notes && data.notes.sketch ? el('div', {}, el('h2', { text: 'Sketch it' }), el('p', { html: T.rich(data.notes.sketch).replace(/<button[^>]*>|<\/button>/g, '') }), el('div', { className: 'sketch', 'data-frames': frames }, Array.from({ length: frames }, (_, i) => el('div', {}, el('span', { text: (data.notes.frameLabels || [])[i] || 'Shot ' + (i + 1) }))))) : null,
      data.notes && data.notes.think ? el('div', {}, el('h2', { text: 'Think about it' }), el('p', { html: T.rich(data.notes.think).replace(/<button[^>]*>|<\/button>/g, '') }), el('div', { className: 'lines' }, el('div'), el('div'), el('div'))) : null,
      data.realCamera ? el('div', {}, el('h2', { text: (data.realCameraTitle || 'Try it with a real camera') }), el('p', { className: 'check-row' }, el('span', { className: 'box' }), el('span', { html: T.rich(data.realCamera).replace(/<button[^>]*>|<\/button>/g, '') }))) : null);
    root.append(sheet);
  };

  function debugPanel() {
    const rows = Array.from(T.mediaUsed).map(id => { const r = MEDIA[id] || {}; return id + ' · ' + (r.status || '?') + ' · ' + (r.file || '') + (r.events ? ' · ' + Object.entries(r.events).map(([k, v]) => k + ' ' + v.toFixed(2)).join(', ') : ''); });
    return el('div', { className: 'debug-panel', style: 'margin-top:30px' }, el('strong', { text: 'Debug · media on this page' }), el('div', { html: rows.map(r => r.replace(/</g, '&lt;')).join('<br>') }),
      el('div', { text: 'Terms used: ' + Array.from(T.usedTerms).join(', ') }), T.missingTerms.length ? el('div', { style: 'color:#a8442a', text: 'Missing terms: ' + T.missingTerms.join(', ') }) : null);
  }

  /* ------------------------------------------------------------------ Course home, part home, glossary (B4, V4) */
  T.home = () => {
    document.title = (CFG.title || TOC.title) + ' · Textbook';
    const page = T.shell(null);
    page.append(el('div', { className: 'home-hero' },
      el('span', { className: 'eyebrow', text: 'Textbook' }),
      el('h1', { text: CFG.title || TOC.title }),
      el('p', { text: 'Twelve parts, from your first file to your finished film. Every topic starts with the words you need, shows you how it works, and lets you try it.' })));
    page.append(el('div', { className: 'how' },
      ['read', 'explore', 'watch', 'practice'].map(m => el('div', { className: 'card' }, T.modes([m]), el('p', { style: 'margin-top:8px', text: { read: 'Explanations with picture examples.', explore: 'Hands-on tools. Nothing can go wrong.', watch: 'Video examples in short pieces.', practice: 'You make it. The page checks it.' }[m] })))));
    const list = el('div', { className: 'parts' });
    TOC.parts.forEach(p => {
      const built = p.topics.filter(t => t.built).length;
      const d = el('details', { className: 'part-card' + (built ? ' ready' : ''), open: built ? true : null },
        el('summary', {}, el('span', { className: 'pnum', text: p.number }),
          el('span', {}, el('span', { className: 'ptitle', text: p.title }), el('br'), el('span', { className: 'pmeta', text: p.topics.length + ' topics' })),
          el('span', { className: 'status', text: built ? (built === p.topics.length ? 'Ready' : built + ' of ' + p.topics.length + ' ready') : 'Coming later' })),
        built ? el('a', { className: 'button small', href: T.partURL(p), text: 'Part ' + p.number + ' overview and materials' }) : null,
        topicList(p));
      list.append(d);
    });
    page.append(list);
  };
  function topicList(p) {
    return el('ol', { className: 'topic-list' }, p.topics.map(t => el('li', { className: t.built ? '' : 'soon' },
      el('span', { className: 'tn', text: t.id }),
      t.built ? el('a', { href: T.topicURL(t), text: t.title + (t.optional ? ' (optional)' : '') }) : el('span', { text: t.title + (t.history ? ' (history)' : '') }),
      T.modes(t.modes))));
  }
  T.partHome = (slug, info) => {
    const p = T.findPart(slug);
    document.title = 'Part ' + p.number + ' · ' + p.title + ' · ' + (CFG.title || TOC.title);
    const page = T.shell(p, null);
    page.classList.add('wide-page');
    page.append(el('header', { className: 'topic-header' }, el('span', { className: 'eyebrow', text: 'Part ' + p.number }), el('h1', { text: p.title }), el('p', { className: 'part-intro', html: T.rich((info && info.intro) || '') })));
    const first = p.topics.find(t => t.built);
    page.append(el('div', { className: 'actions', style: 'margin-top:20px' },
      first ? el('a', { className: 'button primary', href: T.topicURL(first), text: 'Start with ' + first.id + ' ' + first.title + ' →' }) : null));
    page.append(el('div', { className: 'part-tools' },
      [['Guided notes', 'One printable page per topic, to fill in as you go.', T.url('notes/index.html?part=' + p.slug)],
       ['Review', 'Flashcards and mixed practice from every topic.', 'review.html'],
       ['Project', 'Apply this part’s skills in a project.', 'project.html'],
       ['Part test', 'Printable test, Version A or B.', T.testURL(p)]].map(([t, d, h]) => el('a', { className: 'card tool-card', href: h }, el('strong', { text: t }), el('span', { text: d })))));
    page.append(el('div', { className: 'part-main' },
      el('section', { className: 'part-card ready part-topics' }, el('h2', { text: 'Topics' }), topicList(p)),
      info && info.storyline ? el('div', { className: 'card warm part-story' }, el('h3', { text: 'The story in this part' }), el('p', { html: T.rich(info.storyline) })) : null));
    const terms = GLOSSARY.filter(g => p.topics.some(t => t.slug === g.introducedIn));
    if (terms.length) page.append(el('section', { className: 'part-words' }, el('h2', { text: 'Words in this part' }), el('dl', { className: 'word-grid' }, terms.map(g => el('div', {}, el('dt', { text: g.term }), el('dd', { text: g.def }))))));
  };
  /* ------------------------------------------------------------------ Loading topic data for notes and review */
  T.loadScripts = (srcs, done) => {
    const next = i => { if (i >= srcs.length) { done(); return; } const s = document.createElement('script'); s.src = srcs[i]; s.onload = () => next(i + 1); s.onerror = () => { console.error('Could not load ' + srcs[i]); next(i + 1); }; document.body.append(s); };
    next(0);
  };
  const builtTopics = p => p.topics.filter(t => t.built);
  // notes/index.html?t=<slug> or ?part=<slug>
  T.notesIndex = () => {
    const q = new URLSearchParams(location.search), app = document.getElementById('app');
    let topics = [];
    if (q.get('part')) { const p = T.findPart(q.get('part')); if (p) { topics = builtTopics(p); T._notesPart = true; } }
    else if (q.get('t')) { const f = T.findTopic(q.get('t')); if (f) topics = [f.topic]; }
    const back = topics.length ? (T._notesPart ? T.partURL(T.findTopic(topics[0].slug).part) : T.topicURL(topics[0])) : T.url('index.html');
    app.append(el('div', { className: 'test-tools no-print' }, el('a', { className: 'button small', href: back, text: '← Back' }), T.button('Print', () => window.print(), 'primary small'), el('span', { className: 'muted', style: 'font-size:14px', text: 'One page per topic. Prints on US Letter.' })), el('main', { id: 'notes', className: 'notes-wrap' }));
    if (!topics.length) { app.append(el('p', { text: 'No topic chosen.' })); return; }
    T.mode = 'notes';
    T.loadScripts(topics.map(t => T.url('topics/' + t.slug + '/topic.js')), () => {});
  };
  T.collectPart = (p, done) => { T.mode = 'collect'; T.collected = []; T.loadScripts(builtTopics(p).map(t => T.url('topics/' + t.slug + '/topic.js')), () => { T.mode = 'page'; done(T.collected); }); };

  /* ------------------------------------------------------------------ Part review: flashcards + mixed practice */
  T.reviewPage = slug => {
    const p = T.findPart(slug);
    document.title = 'Review · Part ' + p.number + ' · ' + (CFG.title || TOC.title);
    const page = T.shell(p, null);
    page.classList.add('wide-page');
    page.append(el('header', { className: 'topic-header' }, el('a', { className: 'eyebrow', href: T.partURL(p), text: 'Part ' + p.number + ' · ' + p.title }), el('h1', { text: 'Review before the test' }), el('p', { className: 'part-intro', text: 'Flip through the words, then try mixed questions from every topic. Nothing is saved or graded.' })));
    const cardsHost = el('section', { className: 'section' }, el('h2', { text: 'Flashcards' }));
    const quizHost = el('section', { className: 'section' }, el('h2', { text: 'Mixed practice' }), el('p', { className: 'intro', text: 'Questions from across the part, in a random order.' }));
    page.append(el('div', { className: 'review-grid' }, cardsHost, quizHost), el('nav', { className: 'next-nav' }, el('a', { className: 'button', href: T.partURL(p), text: '← Part ' + p.number }), el('a', { className: 'button primary', href: T.testURL(p), text: 'Part ' + p.number + ' test →' })));
    const terms = GLOSSARY.filter(g => p.topics.some(t => t.slug === g.introducedIn));
    cardsHost.append(flashcards(terms));
    T.collectPart(p, list => {
      const first = [], remaining = [];
      function shuffle(items) {
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
      }
      list.forEach(d => {
        const qs = (d.check || []).map(q => Object.assign({}, q, {
          q: '<span class="muted" style="font-size:13px;font-weight:600">' + d._topic.id + ' ' + d._topic.title + '</span><br>' + q.q
        }));
        shuffle(qs);
        if (qs.length) first.push(qs.shift());
        remaining.push(...qs);
      });
      shuffle(first);
      shuffle(remaining);
      const host = el('div'); quizHost.append(host);
      T.quiz(host, first.concat(remaining).slice(0, 14), { nextHref: T.testURL(p), nextLabel: 'Go to the Part ' + p.number + ' test →' });
    });
  };
  function flashcards(terms) {
    let order = terms.slice(), i = 0, flipped = false, defFirst = false;
    const face = el('button', { type: 'button', className: 'flashcard', 'aria-live': 'polite' });
    const count = el('span', { className: 'time' });
    function draw() { const g = order[i]; const showTerm = defFirst ? flipped : !flipped; face.replaceChildren(el('span', { className: 'label', text: showTerm ? 'Word' : 'Meaning' }), el('span', { className: showTerm ? 'fc-term' : 'fc-def', text: showTerm ? g.term : g.def }), el('span', { className: 'muted', style: 'font-size:13px', text: 'Click or press Space to flip' })); count.textContent = (i + 1) + ' of ' + order.length; }
    face.addEventListener('click', () => { flipped = !flipped; draw(); });
    const go = d => { i = (i + d + order.length) % order.length; flipped = false; draw(); };
    const shuffle = T.button('Shuffle', () => { for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; } i = 0; flipped = false; draw(); }, 'small');
    const mode = el('button', { type: 'button', className: 'chip', 'aria-pressed': 'false', text: 'Show meanings first' });
    mode.addEventListener('click', () => { defFirst = !defFirst; mode.setAttribute('aria-pressed', String(defFirst)); flipped = false; draw(); });
    draw();
    return el('div', { className: 'flash-wrap' }, face, el('div', { className: 'controls' }, T.button('← Previous', () => go(-1), 'small'), T.button('Next →', () => go(1), 'small'), count, shuffle, mode));
  }

  /* ------------------------------------------------------------------ Part project (printable brief, plan sheets and rubric) */
  T.projectPage = data => {
    const p = T.findPart(data.part);
    document.title = 'Project · Part ' + p.number + ' · ' + (CFG.title || TOC.title);
    const app = document.getElementById('app');
    app.append(el('div', { className: 'test-tools no-print' }, el('a', { className: 'button small', href: T.partURL(p), text: '← Part ' + p.number }), T.button('Print', () => window.print(), 'primary small'), data.editor ? el('a', { className: 'button small', href: '#project-editor', text: 'Open the exercise' }) : null, el('span', { className: 'muted', style: 'font-size:14px', text: 'Brief, planning sheets and rubric. Prints on US Letter.' })));
    const pg = el('main', { className: 'test-page project' });
    app.append(pg);
    pg.append(el('header', { className: 'test-head' }, el('div', {}, el('div', { className: 'eyebrow', text: 'Part ' + p.number + ' project · ' + p.title }), el('h1', { text: data.title }), el('div', { className: 'muted', style: 'font-size:13px', text: data.time })), el('div', { className: 'who' }, ['Name', 'Team', 'Due'].map(w => el('span', {}, w, el('i'))))));
    pg.append(el('section', { className: 'test-section' }, el('h2', { text: 'The brief' }), el('div', { className: 'text', html: T.rich(data.brief).replace(/<button[^>]*>|<\/button>/g, '') })));
    pg.append(el('section', { className: 'test-section' }, el('h2', { text: data.requirementsTitle || 'Your sequence must' }), el('ul', { className: 'check-list' }, data.requirements.map(r => el('li', {}, el('span', { className: 'box' }), el('span', { html: T.rich(r).replace(/<button[^>]*>|<\/button>/g, '') }))))));
    const sheet = data.taskSheet || { title: 'Shot list', columns: data.shotListColumns, rows: data.shotListRows };
    pg.append(el('section', { className: 'test-section page-break' }, el('h2', { text: sheet.title }), el('table', { className: 'plan-table' }, el('thead', {}, el('tr', {}, sheet.columns.map(c => el('th', { text: c })))), el('tbody', {}, Array.from({ length: sheet.rows }, (_, i) => el('tr', {}, sheet.columns.map((c, j) => el('td', { text: j === 0 ? String(i + 1) : '' }))))))));
    if (data.storyboardFrames) {
      pg.append(el('section', { className: 'test-section' }, el('h2', { text: 'Storyboard' }), el('div', { className: 'board' }, Array.from({ length: data.storyboardFrames }, (_, i) => el('div', {}, el('div', { className: 'frame' }), el('span', { text: 'Shot ' + (i + 1) }), el('div', { className: 'lines' }, el('div'), el('div')))))));
    }
    pg.append(el('section', { className: 'test-section page-break' }, el('h2', { text: 'Before you hand it in' }), el('ul', { className: 'check-list' }, data.checklist.map(r => el('li', {}, el('span', { className: 'box' }), el('span', { text: r }))))));
    pg.append(el('section', { className: 'test-section' }, el('h2', { text: 'Rubric' }), el('table', { className: 'plan-table rubric' }, el('thead', {}, el('tr', {}, el('th', { text: 'Criteria' }), data.rubricLevels.map(l => el('th', { text: l })))), el('tbody', {}, data.rubric.map(r => el('tr', {}, el('th', { text: r.criterion }), r.levels.map(t => el('td', { text: t }))))))));
    pg.append(el('section', { className: 'test-section' }, el('h2', { text: 'Reflect' }), data.reflection.map(q => el('div', { style: 'margin-top:10px' }, el('p', { text: q }), el('div', { className: 'lines' }, el('div'), el('div'), el('div'))))));
    if (data.editor) {
      const exercise = T.renderBlock(Object.assign({ type: 'editor-exercise' }, data.editor));
      app.append(el('section', { id: 'project-editor', className: 'project-editor no-print' }, el('h2', { text: 'Edit your sequence' }), exercise.node));
    }
  };

  T.glossaryPage = () => {
    document.title = 'Glossary · ' + (CFG.title || TOC.title);
    const page = T.shell(null);
    page.append(el('header', { className: 'topic-header' }, el('span', { className: 'eyebrow', text: 'Glossary' }), el('h1', { text: 'Words to know' }), el('p', { className: 'part-intro', text: 'Every vocabulary word in the book, A to Z.' })));
    const input = el('input', { type: 'search', className: 'glossary-filter', placeholder: 'Filter words…', 'aria-label': 'Filter words' });
    const list = el('div', { className: 'glossary' });
    const sorted = GLOSSARY.slice().sort((a, b) => a.term.localeCompare(b.term));
    function draw() {
      const q = input.value.trim().toLowerCase();
      list.replaceChildren(...sorted.filter(g => !q || g.term.includes(q) || g.def.toLowerCase().includes(q)).map(g => {
        const f = T.findTopic(g.introducedIn);
        return el('div', { className: 'g' }, el('div', {}, el('strong', { text: g.term }), f ? el('small', {}, f.topic.built ? el('a', { href: T.topicURL(f.topic), text: f.topic.id + ' ' + f.topic.title }) : f.topic.id + ' ' + f.topic.title) : null), el('span', { text: g.def }));
      }));
    }
    input.addEventListener('input', draw);
    page.append(input, list);
    draw();
  };
})();
