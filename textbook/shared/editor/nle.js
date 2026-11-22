/*!
 * Practice Editor — a standalone, DaVinci-Resolve-style editor for lessons.
 * No dependencies, no build step. Works from file:// and any static server.
 *
 *   <link rel="stylesheet" href="Practice Editor/nle.css">
 *   <script src="Practice Editor/nle.js"></script>
 *   const ed = PracticeEditor.mount(document.getElementById('editor'), { media: [...], task: {...} });
 *
 * See README.md for every option and the task-check API.
 */
(function (global) {
  'use strict';

  /* ================================================================== helpers */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var BASE_TC = 3600; // timeline starts at 01:00:00:00, like Resolve
  var UID = 0;
  function uid(p) { return p + (++UID).toString(36) + Math.random().toString(36).slice(2, 5); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  /** Seconds -> HH:MM:SS:FF. `base` is the timeline start offset in seconds (default 01:00:00:00). */
  function tc(t, fps, base) {
    if (base == null) base = BASE_TC;
    var f = Math.round((Math.max(0, t) + base) * fps);
    var ff = f % fps, s = Math.floor(f / fps);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(ff);
  }

  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function append(n, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(n, x); }); return; }
    n.append(c.nodeType ? c : String(c));
  }

  var ICONS = {
    panel: '<rect x="2" y="3" width="12" height="10" rx="1.2"/><path d="M6 3v10"/>',
    back: '<path d="M10 3.5 5.5 8l4.5 4.5"/>',
    fwd: '<path d="M6 3.5 10.5 8 6 12.5"/>',
    importm: '<path d="M8 2.5v7.5M5 7l3 3 3-3"/><path d="M2.5 10.5v3h11v-3"/>',
    list: '<path d="M5.5 4.5h8M5.5 8h8M5.5 11.5h8"/><path d="M2.5 4.5h.5M2.5 8h.5M2.5 11.5h.5"/>',
    grid: '<rect x="2.5" y="2.5" width="4.5" height="4.5" rx=".6"/><rect x="9" y="2.5" width="4.5" height="4.5" rx=".6"/><rect x="2.5" y="9" width="4.5" height="4.5" rx=".6"/><rect x="9" y="9" width="4.5" height="4.5" rx=".6"/>',
    search: '<circle cx="7" cy="7" r="4.2"/><path d="m10.2 10.2 3.4 3.4"/>',
    sort: '<path d="M4.5 3v10M2.5 11l2 2 2-2M8.5 4.5h5M8.5 8h4M8.5 11.5h3"/>',
    more: '<circle cx="3.5" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="12.5" cy="8" r="1.1" fill="currentColor" stroke="none"/>',
    down: '<path d="m4.5 6.5 3.5 3.5 3.5-3.5"/>',
    right: '<path d="m6.5 4.5 3.5 3.5-3.5 3.5"/>',
    up: '<path d="m4.5 9.5 3.5-3.5 3.5 3.5"/>',
    play: '<path d="M5 3.2v9.6L12.6 8z" fill="currentColor"/>',
    pause: '<path d="M4.5 3.5h2.4v9H4.5zM9.1 3.5h2.4v9H9.1z" fill="currentColor" stroke="none"/>',
    rev: '<path d="M11 3.2v9.6L3.4 8z" fill="currentColor"/>',
    stop: '<rect x="4" y="4" width="8" height="8" fill="currentColor" stroke="none"/>',
    tostart: '<path d="M3 3.5v9" /><path d="M8.5 3.5v9L3.8 8z M13.5 3.5v9L8.8 8z" fill="currentColor"/>',
    toend: '<path d="M13 3.5v9"/><path d="M7.5 3.5v9L12.2 8z M2.5 3.5v9L7.2 8z" fill="currentColor"/>',
    loop: '<path d="M3 9V7.5A3.5 3.5 0 0 1 6.5 4h6.5M11 2l2 2-2 2M13 7v1.5A3.5 3.5 0 0 1 9.5 12H3M5 14l-2-2 2-2"/>',
    pointer: '<path d="M4.5 2.2v10.6l2.7-2.6 1.9 3.9 1.8-.9-1.9-3.9h3.7z" fill="currentColor" stroke="none"/>',
    trimtool: '<path d="M2.5 3.5v9M13.5 3.5v9M5 8h6M6.8 6.2 5 8l1.8 1.8M9.2 6.2 11 8l-1.8 1.8"/>',
    blade: '<path d="M3 13 9.5 6.5"/><path d="M8.5 3.2 12.8 7.5l-2.6 2.6L5.9 5.8z" fill="currentColor"/>',
    insert: '<rect x="1.5" y="8" width="4" height="5"/><rect x="10.5" y="8" width="4" height="5"/><path d="M8 2v7M6 7l2 2 2-2"/>',
    overwrite: '<rect x="2" y="8" width="12" height="5"/><path d="M8 1.5v5M6 4.5l2 2 2-2"/>',
    replace: '<rect x="2" y="8" width="12" height="5"/><path d="M4.5 4.5h7M9.5 2.5l2 2-2 2"/>',
    magnet: '<path d="M3.5 2.5v5.5a4.5 4.5 0 0 0 9 0V2.5h-2.6V8a1.9 1.9 0 0 1-3.8 0V2.5z"/><path d="M3.5 5h2.6M9.9 5h2.6"/>',
    link: '<path d="M6.5 9.5l3-3M7 11l-1.3 1.3a2.4 2.4 0 0 1-3.4-3.4L3.6 7.6M9 5l1.3-1.3a2.4 2.4 0 0 1 3.4 3.4L12.4 8.4"/>',
    lock: '<rect x="3.5" y="7" width="9" height="6.5" rx="1.2"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/>',
    unlock: '<rect x="3.5" y="7" width="9" height="6.5" rx="1.2"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 4.8-1"/>',
    flag: '<path d="M4 14V2.5"/><path d="M4 3h8l-2 2.8L12 8.6H4z" fill="currentColor"/>',
    marker: '<path d="M4.5 2.5h7v7.5L8 13 4.5 10z" fill="currentColor"/>',
    zoomt: '<circle cx="7" cy="7" r="3.6"/><path d="m9.6 9.6 3.4 3.4M2 2.5h2M5 2.5h2M8 2.5h2"/>',
    minus: '<circle cx="8" cy="8" r="5.5"/><path d="M5.5 8h5"/>',
    plus: '<circle cx="8" cy="8" r="5.5"/><path d="M5.5 8h5M8 5.5v5"/>',
    plain_plus: '<path d="M8 3v10M3 8h10"/>',
    volume: '<path d="M2.5 6h2.8L9 3v10L5.3 10H2.5z" fill="currentColor"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.6 3.6a6.2 6.2 0 0 1 0 8.8"/>',
    muted: '<path d="M2.5 6h2.8L9 3v10L5.3 10H2.5z" fill="currentColor"/><path d="m11 6 3.5 4M14.5 6 11 10"/>',
    monitor: '<rect x="2" y="3" width="12" height="8" rx="1"/><path d="M6 13.5h4"/>',
    film: '<rect x="2" y="3" width="12" height="10" rx="1.2"/><path d="M2 6h12M2 10h12M5 3v3M8 3v3M11 3v3M5 10v3M8 10v3M11 10v3"/>',
    image: '<rect x="2" y="3" width="12" height="10" rx="1.2"/><circle cx="6" cy="6.5" r="1.2"/><path d="m2.5 12 3.5-3 3 2.2 2-1.7 2.5 2.3"/>',
    audio: '<path d="M2.5 8v0M4.5 5.5v5M6.5 3v10M8.5 6v4M10.5 4.5v7M12.5 6.5v3"/>',
    title: '<path d="M3 4h10M8 4v9"/>',
    gen: '<rect x="2" y="3" width="12" height="10" rx="1.2"/><path d="M5 3v10M8 3v10M11 3v10"/>',
    fx: '<path d="M3 13c2 0 2-10 4.5-10H10M4 7.5h5M9 9l4 4M13 9l-4 4"/>',
    trans: '<rect x="2" y="4" width="7" height="8" rx="1"/><rect x="7" y="4" width="7" height="8" rx="1" fill="currentColor" fill-opacity=".35"/>',
    inspector: '<path d="M3 4.5h10M3 8h10M3 11.5h10"/><circle cx="6" cy="4.5" r="1.4" fill="currentColor"/><circle cx="10.5" cy="8" r="1.4" fill="currentColor"/><circle cx="7" cy="11.5" r="1.4" fill="currentColor"/>',
    fullscreen: '<path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/>',
    safe: '<rect x="2" y="3" width="12" height="10" rx="1"/><rect x="4.2" y="5.2" width="7.6" height="5.6" stroke-dasharray="1.4 1.2"/>',
    undo: '<path d="M5 3 2.5 5.5 5 8"/><path d="M2.5 5.5H9a4 4 0 0 1 0 8H6"/>',
    redo: '<path d="M11 3l2.5 2.5L11 8"/><path d="M13.5 5.5H7a4 4 0 0 0 0 8h3"/>',
    star: '<path d="m8 2.3 1.7 3.6 3.9.5-2.9 2.7.8 3.9L8 11.1 4.5 13l.8-3.9-2.9-2.7 3.9-.5z"/>',
    check: '<path d="m3.2 8.4 3 3 6.6-6.8"/>',
    reset: '<path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3.2h3.2"/>',
    close: '<path d="m4 4 8 8M12 4l-8 8"/>',
    folder: '<path d="M2 4.5h4l1.3 1.5H14v6.5H2z"/>',
    cloud: '<path d="M4.5 12h7a2.6 2.6 0 0 0 .3-5.2A3.8 3.8 0 0 0 4.6 6 3 3 0 0 0 4.5 12z"/>',
    markin: '<path d="M5 3v10M5 3h4M5 13h4"/>',
    markout: '<path d="M11 3v10M11 3H7M11 13H7"/>',
    trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 9h5.6l.7-9"/>',
    question: '<circle cx="8" cy="8" r="6"/><path d="M6.3 6.3a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.7.6-.7 1.1v.4M8 11.6v.1"/>'
  };
  function icon(name) {
    var s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('class', 'nle-ico');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name] || '';
    return s;
  }
  function ibtn(name, title, onclick, cls) {
    var b = el('button', { type: 'button', class: 'nle-ib' + (cls ? ' ' + cls : ''), title: title, 'aria-label': title });
    b.append(icon(name));
    if (onclick) b.addEventListener('click', onclick);
    return b;
  }

  /* ================================================================ libraries */
  var TRANSITIONS = {
    dissolve: { name: 'Cross Dissolve' },
    dip: { name: 'Dip to Color Dissolve' },
    push: { name: 'Push' },
    slide: { name: 'Slide' },
    wipe: { name: 'Edge Wipe' },
    iris: { name: 'Iris' },
    blurdis: { name: 'Blur Dissolve' },
    zoom: { name: 'Zoom' },
    afade3: { name: 'Cross Fade +3 dB', audio: true },
    afade0: { name: 'Cross Fade 0 dB', audio: true },
    afadem3: { name: 'Cross Fade -3 dB', audio: true }
  };
  var TITLES = {
    lowerLeft: { name: 'Left Lower Third', props: { text: 'Sample Name', text2: 'Title', size: 64, color: '#ffffff', bold: false }, two: true },
    lowerMid: { name: 'Middle Lower Third', props: { text: 'Sample Name', text2: 'Title', size: 64, color: '#ffffff', bold: false }, two: true },
    multitext: { name: 'MultiText', props: { text: 'Text 1', text2: 'Text 2', size: 96, color: '#ffffff', bold: true }, two: true },
    lowerRight: { name: 'Right Lower Third', props: { text: 'Sample Name', text2: 'Title', size: 64, color: '#ffffff', bold: false }, two: true },
    scroll: { name: 'Scroll', props: { text: 'Scroll title\nScroll title\nScroll title\nScroll title\nScroll title', size: 64, color: '#ffffff', bold: false }, multiline: true },
    text: { name: 'Text', props: { text: 'Basic Title', size: 110, color: '#ffffff', bold: false } },
    textplus: { name: 'Text+', props: { text: 'Custom Title', size: 130, color: '#ffffff', bold: true } }
  };
  var GENERATORS = {
    bars: { name: 'SMPTE Color Bar', bg: 'linear-gradient(90deg,#c0c0c0 0 14.28%,#c0c000 0 28.57%,#00c0c0 0 42.85%,#00c000 0 57.14%,#c000c0 0 71.42%,#c00000 0 85.71%,#0000c0 0)' },
    steps10: { name: '10 Step', bg: 'linear-gradient(90deg,#000 0 10%,#1c1c1c 0 20%,#383838 0 30%,#555 0 40%,#717171 0 50%,#8d8d8d 0 60%,#aaa 0 70%,#c6c6c6 0 80%,#e2e2e2 0 90%,#fff 0)' },
    gradient4: { name: 'Four Color Gradient', bg: 'linear-gradient(135deg,rgba(230,70,70,1),rgba(230,70,70,0) 70%),linear-gradient(225deg,rgba(70,120,230,1),rgba(70,120,230,0) 70%),linear-gradient(45deg,rgba(240,200,60,1),rgba(240,200,60,0) 70%),linear-gradient(315deg,rgba(60,190,110,1),rgba(60,190,110,0) 70%),#222' },
    grey: { name: 'Grey Scale', bg: 'linear-gradient(90deg,#000,#fff)' },
    solid: { name: 'Solid Color', props: { color: '#24467a' } },
    window: { name: 'Window', bg: '#ffffff' }
  };
  var FILTERS = {
    bw: { name: 'Black & White', min: 0, max: 1, step: 0.01, def: 1, css: function (a) { return 'grayscale(' + a + ')'; } },
    blur: { name: 'Gaussian Blur', min: 0, max: 60, step: 1, def: 16, css: function (a) { return 'blur(' + a + 'px)'; } },
    bright: { name: 'Brightness', min: 0, max: 2.5, step: 0.01, def: 1.4, css: function (a) { return 'brightness(' + a + ')'; } },
    contrast: { name: 'Contrast', min: 0, max: 3, step: 0.01, def: 1.5, css: function (a) { return 'contrast(' + a + ')'; } },
    saturate: { name: 'Color Boost', min: 0, max: 4, step: 0.01, def: 2, css: function (a) { return 'saturate(' + a + ')'; } },
    sepia: { name: 'Vintage', min: 0, max: 1, step: 0.01, def: 0.85, css: function (a) { return 'sepia(' + a + ')'; } },
    hue: { name: 'Hue Shift', min: -180, max: 180, step: 1, def: 90, css: function (a) { return 'hue-rotate(' + a + 'deg)'; } },
    invert: { name: 'Invert', min: 0, max: 1, step: 0.01, def: 1, css: function (a) { return 'invert(' + a + ')'; } },
    vignette: { name: 'Vignette', min: 0, max: 1, step: 0.01, def: 0.8, overlay: true },
    mirror: { name: 'Mirror', fixed: true }
  };

  var LIB_TREE = [
    { group: 'Toolbox', children: [
      { id: 'vtrans', name: 'Video Transitions', items: ['dissolve', 'dip', 'push', 'slide', 'wipe', 'iris'].map(function (k) { return { type: 'transition', key: k }; }) },
      { id: 'atrans', name: 'Audio Transitions', items: ['afade3', 'afade0', 'afadem3'].map(function (k) { return { type: 'transition', key: k }; }) },
      { id: 'titles', name: 'Titles', items: Object.keys(TITLES).map(function (k) { return { type: 'title', key: k }; }) },
      { id: 'gens', name: 'Generators', items: Object.keys(GENERATORS).map(function (k) { return { type: 'generator', key: k }; }) },
      { id: 'effects', name: 'Effects', items: [{ type: 'adjustment', key: 'adjust' }] }
    ] },
    { group: 'Resolve FX', children: [
      { id: 'filters', name: 'Filters', items: Object.keys(FILTERS).map(function (k) { return { type: 'filter', key: k }; }) },
      { id: 'rtrans', name: 'Transitions', items: ['blurdis', 'zoom'].map(function (k) { return { type: 'transition', key: k }; }) }
    ] },
    { id: 'favs', name: 'Favorites', items: null }
  ];

  function payloadName(p) {
    if (p.type === 'media') return p.media.name;
    if (p.type === 'transition') return TRANSITIONS[p.key].name;
    if (p.type === 'title') return TITLES[p.key].name;
    if (p.type === 'generator') return GENERATORS[p.key].name;
    if (p.type === 'filter') return FILTERS[p.key].name;
    if (p.type === 'adjustment') return 'Adjustment Clip';
    return '';
  }
  function isClipPayload(p) { return p.type === 'media' || p.type === 'title' || p.type === 'generator' || p.type === 'adjustment'; }
  function payloadTrackType(p) { return p.type === 'media' && p.media.kind === 'audio' ? 'audio' : (p.type === 'transition' && TRANSITIONS[p.key].audio ? 'audio' : 'video'); }

  function transFx(type, role, p, adj) {
    var s = {};
    switch (type) {
      case 'dip':
        if (role === 'in') s.opacity = adj ? clamp((p - 0.5) * 2, 0, 1) : p;
        else s.opacity = adj ? clamp(1 - p * 2, 0, 1) : 1 - p;
        break;
      case 'blurdis':
        if (role === 'in') { s.opacity = p; s.blur = (1 - p) * 40; }
        else { s.blur = p * 40; if (!adj) s.opacity = 1 - p; }
        break;
      case 'push':
        s.tx = role === 'in' ? (1 - p) * 100 : -p * 100; break;
      case 'slide':
        if (role === 'in') s.tx = (1 - p) * 100; else if (!adj) s.tx = -p * 100; break;
      case 'wipe':
        if (role === 'in') s.clip = 'inset(0 ' + ((1 - p) * 100) + '% 0 0)';
        else if (!adj) s.clip = 'inset(0 0 0 ' + (p * 100) + '%)';
        break;
      case 'iris':
        if (role === 'in') s.clip = 'circle(' + (p * 75) + '% at 50% 50%)';
        else if (!adj) s.clip = 'circle(' + ((1 - p) * 75) + '% at 50% 50%)';
        break;
      case 'zoom':
        if (role === 'in') { s.scale = 0.4 + 0.6 * p; s.opacity = p; }
        else { s.scale = 1 + 0.5 * p; if (!adj) s.opacity = 1 - p; }
        break;
      default: // dissolve + audio fades
        if (role === 'in') s.opacity = p; else if (!adj) s.opacity = 1 - p;
    }
    return s;
  }

  function guessKind(src) {
    var s = String(src || '').toLowerCase().split('?')[0];
    if (/\.(mp4|webm|mov|m4v|ogv)$/.test(s)) return 'video';
    if (/\.(mp3|wav|m4a|aac|ogg|oga|flac)$/.test(s)) return 'audio';
    return 'image';
  }
  function baseName(src) { return decodeURIComponent(String(src || '').split('/').pop().split('?')[0]) || 'Clip'; }

  function pseudoWave(seed, n) {
    var out = [], x = 0;
    for (var i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
    for (var j = 0; j < n; j++) {
      x = (x * 1103515245 + 12345) >>> 0;
      var r = (x >>> 8) / 16777216;
      out.push(0.25 + 0.6 * r * (0.6 + 0.4 * Math.sin(j / 7)));
    }
    return out;
  }

  /* ================================================================== Editor */
  function Editor(root, opts) {
    opts = opts || {};
    this.root = root;
    this.opts = opts;
    this.level = opts.level || 3;
    this.fps = opts.fps || 24;
    this.EPS = 0.25 / this.fps;
    this.still = opts.stillDuration || 5;
    this.allow = Object.assign({ import: true, addTracks: true, library: true }, opts.allow || {});
    this.media = [];
    this.tracks = [];
    this.markers = [];
    this.playhead = 0;
    this.zoom = opts.startZoom || 30;
    this.tool = 'select';
    this.snap = opts.startSnapping !== false;
    this.linkedSel = true;
    this.posLock = false;
    this.sel = new Set();
    this.selTrans = null;
    this.selGap = null;
    this.selMarker = null;
    this.poolSel = null;
    this.undoStack = [];
    this.redoStack = [];
    this.inPt = null; this.outPt = null;
    this.loop = false;
    this.playing = false; this.rate = 0;
    this.layerCache = new Map();
    this.audioCache = new Map();
    this.masterMute = false;
    this.headerW = 196;
    this.layout = Object.assign({ left: 0.32, pool: 0.5, viewer: 0.5 }, opts.layout || {});
    this.targetV = 0;
    this.libCat = this.level === 2 ? 'atrans' : (opts.libraryStart || 'titles');
    this.favs = [];
    this.poolView = opts.poolView || 'list';
    this.poolSort = 0;
    this.poolFilter = '';
    this.inspectorOpen = !!opts.inspector;
    this.safeArea = false;
    this.fit = 'fit';
    this.clipboard = null;
    this.dragging = null;
    this.taskDone = false;
    this.timelineName = opts.timelineName || 'Timeline 1';
    this.ui = {};
    this._listeners = [];

    this._build();
    var self = this;
    (opts.media || []).forEach(function (m) { self.addMedia(m); });
    this._loadTimeline(opts.timeline);
    this.initial = this._snapshot();
    this.changed();
    requestAnimationFrame(function () { self.zoomToFit(); self._layoutViewer(); });
  }

  var P = Editor.prototype;

  /* ---------------------------------------------------------------- model */
  P.trackLabel = function (tr) {
    var list = this.tracks.filter(function (t) { return t.type === tr.type; });
    return (tr.type === 'video' ? 'V' : 'A') + (list.indexOf(tr) + 1);
  };
  P.trackName = function (tr) {
    if (tr.name) return tr.name;
    var list = this.tracks.filter(function (t) { return t.type === tr.type; });
    return (tr.type === 'video' ? 'Video ' : 'Audio ') + (list.indexOf(tr) + 1);
  };
  P.vTracks = function () { return this.tracks.filter(function (t) { return t.type === 'video'; }); };
  P.aTracks = function () { return this.tracks.filter(function (t) { return t.type === 'audio'; }); };
  P.addTrack = function (type, atTop) {
    var tr = { id: uid('t'), type: type, name: '', locked: false, enabled: true, muted: false, solo: false, h: type === 'video' ? 58 : 50, clips: [] };
    this.tracks.push(tr);
    return tr;
  };
  P.trackById = function (id) { for (var i = 0; i < this.tracks.length; i++) if (this.tracks[i].id === id) return this.tracks[i]; return null; };
  P.clipById = function (id) {
    for (var i = 0; i < this.tracks.length; i++) for (var j = 0; j < this.tracks[i].clips.length; j++) if (this.tracks[i].clips[j].id === id) return this.tracks[i].clips[j];
    return null;
  };
  P.trackOf = function (clip) {
    for (var i = 0; i < this.tracks.length; i++) if (this.tracks[i].clips.indexOf(clip) >= 0) return this.tracks[i];
    return null;
  };
  P.allClips = function () { var out = []; this.tracks.forEach(function (t) { out = out.concat(t.clips); }); return out; };
  P.mediaById = function (id) { for (var i = 0; i < this.media.length; i++) if (this.media[i].id === id) return this.media[i]; return null; };
  P.mediaLen = function (c) {
    if (c.kind === 'video' || c.kind === 'audio') { var m = this.mediaById(c.mediaId); return m && m.duration ? m.duration : Infinity; }
    return Infinity;
  };
  P.fr = function (t) { return Math.round(t * this.fps) / this.fps; };
  P.end = function (c) { return c.start + c.dur; };
  P.duration = function () {
    var e = 0, self = this;
    this.allClips().forEach(function (c) { e = Math.max(e, self.end(c)); });
    return e;
  };
  P.sortTrack = function (tr) { tr.clips.sort(function (a, b) { return a.start - b.start; }); };
  P.linked = function (c) {
    if (!c.link) return [c];
    return this.allClips().filter(function (x) { return x.link === c.link; });
  };

  P.makeClip = function (kind, extra) {
    return Object.assign({
      id: uid('c'), kind: kind, mediaId: null, key: null, name: '', start: 0, dur: this.still, srcIn: 0,
      tIn: null, tOut: null, filters: [], disabled: false, flag: null, color: null, link: null,
      tf: { zoom: 1, x: 0, y: 0, rot: 0, opacity: 1 }, volume: 1, props: {}
    }, extra || {});
  };
  P.clipFromPayload = function (p) {
    if (p.type === 'media') {
      var m = p.media;
      var d = (m.kind === 'video' || m.kind === 'audio') && m.duration ? m.duration : this.still;
      return this.makeClip(m.kind, { mediaId: m.id, name: m.name, dur: this.fr(d) });
    }
    if (p.type === 'title') return this.makeClip('title', { key: p.key, name: TITLES[p.key].name, props: clone(TITLES[p.key].props) });
    if (p.type === 'generator') return this.makeClip('generator', { key: p.key, name: GENERATORS[p.key].name, props: clone(GENERATORS[p.key].props || {}) });
    if (p.type === 'adjustment') return this.makeClip('adjustment', { name: 'Adjustment Clip' });
    return null;
  };
  P.cloneClip = function (c) { var n = clone(c); n.id = uid('c'); return n; };

  /** Clear [a,b) on a track (overwrite edit). Clips in `exclude` (Set of ids) are untouched. */
  P.overwriteRange = function (tr, a, b, exclude) {
    var out = [], E = this.EPS, self = this;
    tr.clips.forEach(function (c) {
      if (exclude && exclude.has(c.id)) { out.push(c); return; }
      var s = c.start, e = self.end(c);
      if (e <= a + E || s >= b - E) { out.push(c); return; }
      if (s >= a - E && e <= b + E) { self.sel.delete(c.id); return; }
      if (s < a && e > b) {
        var r = self.cloneClip(c); r.start = b; r.srcIn = c.srcIn + (b - s); r.dur = e - b; r.tIn = null; r.link = null;
        c.dur = a - s; c.tOut = null; out.push(c, r); return;
      }
      if (s < a) { c.dur = a - s; c.tOut = null; out.push(c); return; }
      c.srcIn += b - s; c.dur = e - b; c.start = b; c.tIn = null; out.push(c);
    });
    tr.clips = out;
    this.sortTrack(tr);
  };
  P.splitClip = function (c, t, newLink) {
    var tr = this.trackOf(c);
    if (!tr || t <= c.start + this.EPS || t >= this.end(c) - this.EPS) return null;
    var r = this.cloneClip(c);
    r.start = t; r.srcIn = c.srcIn + (t - c.start); r.dur = this.end(c) - t; r.tIn = null; r.tOut = c.tOut;
    r.link = c.link ? (newLink || null) : null;
    c.tOut = null; c.dur = t - c.start;
    tr.clips.push(r); this.sortTrack(tr);
    return r;
  };
  P.splitMany = function (clips, t) {
    var map = {}, self = this, made = [];
    clips.forEach(function (c) {
      var nl = c.link ? (map[c.link] || (map[c.link] = uid('L'))) : null;
      var r = self.splitClip(c, t, nl);
      if (r) made.push(r);
    });
    return made;
  };

  /* --------------------------------------------------------------- media */
  P.addMedia = function (def) {
    var self = this;
    var m = {
      id: def.id || uid('m'), name: def.name || baseName(def.src || (def.file && def.file.name)), src: def.src,
      kind: def.type || guessKind(def.src || (def.file && def.file.name)), duration: def.duration || null,
      width: 0, height: 0, thumb: null, offline: false, hasAudio: def.audio == null ? null : !!def.audio,
      peaks: def.peaks || null, peakRate: def.peakRate || 50
    };
    this.media.push(m);
    var redraw = function () { self.renderPool(); self.renderTimeline(); self.renderViewer(); };
    if (m.kind === 'image') {
      var img = new Image();
      img.onload = function () { m.width = img.naturalWidth; m.height = img.naturalHeight; m.thumb = m.src; redraw(); };
      img.onerror = function () { m.offline = true; redraw(); };
      img.src = m.src;
    } else if (m.kind === 'video') {
      var v = document.createElement('video');
      if (/^https?:$/.test(location.protocol)) v.crossOrigin = 'anonymous';
      v.muted = true; v.preload = 'auto'; v.playsInline = true;
      v.onloadedmetadata = function () {
        if (!def.duration) m.duration = self.fr(v.duration);
        m.width = v.videoWidth; m.height = v.videoHeight;
        try { v.currentTime = Math.min(0.5, v.duration / 3); } catch (e) { /* ignore */ }
        redraw();
      };
      v.onseeked = function () {
        try {
          var cv = document.createElement('canvas'); cv.width = 192; cv.height = Math.round(192 * (v.videoHeight / v.videoWidth || 0.5625));
          cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height);
          m.thumb = cv.toDataURL('image/jpeg', 0.7);
        } catch (e) { m.thumb = null; }
        v.onseeked = null; redraw();
      };
      v.onerror = function () { m.offline = true; redraw(); };
      v.src = m.src;
    } else if (m.kind === 'audio') {
      var a = document.createElement('audio');
      if (/^https?:$/.test(location.protocol)) a.crossOrigin = 'anonymous';
      a.preload = 'metadata';
      a.onloadedmetadata = function () { if (!def.duration) m.duration = self.fr(a.duration); redraw(); };
      a.onerror = function () { m.offline = true; redraw(); };
      a.src = m.src;
    }
    if (m.kind !== 'image' && !m.peaks && m.hasAudio !== false) this._decodeAudio(m, def.file);
    this.renderPool();
    return m;
  };
  P._decodeAudio = function (m, file) {
    var self = this;
    var Ctx = global.OfflineAudioContext || global.webkitOfflineAudioContext;
    if (!Ctx) return;
    var getBuf = file ? file.arrayBuffer() : (location.protocol === 'file:' ? Promise.reject() : fetch(m.src).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); }));
    getBuf.then(function (buf) {
      return new Promise(function (res, rej) {
        try { var p = new Ctx(1, 1, 44100).decodeAudioData(buf, res, rej); if (p && p.catch) p.catch(rej); } catch (e) { rej(e); }
      });
    }).then(function (ab) {
      if (!ab || !ab.length) { if (m.kind === 'video' && m.hasAudio == null) m.hasAudio = false; return; }
      var ch = ab.getChannelData(0), per = 50, n = Math.ceil(ab.duration * per), size = Math.floor(ch.length / n) || 1, peaks = [];
      for (var i = 0; i < n; i++) { var mx = 0; for (var j = i * size, e = Math.min(ch.length, j + size); j < e; j += 4) { var v = Math.abs(ch[j]); if (v > mx) mx = v; } peaks.push(mx); }
      var top = Math.max.apply(null, peaks) || 1;
      m.peaks = peaks.map(function (x) { return x / top; }); m.peakRate = per;
      if (m.kind === 'video' && m.hasAudio == null) m.hasAudio = true;
      self.renderTimeline();
    }).catch(function () { if (m.kind === 'video' && m.hasAudio == null && file) m.hasAudio = false; });
  };
  P.importFiles = function (files) {
    var self = this, added = 0;
    Array.prototype.forEach.call(files, function (f) {
      if (!/^(image|video|audio)\//.test(f.type)) return;
      self.addMedia({ src: URL.createObjectURL(f), name: f.name, type: f.type.split('/')[0], file: f });
      added++;
    });
    if (added) this.toast(added + (added === 1 ? ' clip' : ' clips') + ' added to the Media Pool');
    else this.toast('Only image, video and audio files can be imported');
  };

  /* --------------------------------------------------- timeline loading */
  P._loadTimeline = function (tl) {
    tl = tl || {};
    var nv = tl.video || 1, na = tl.audio == null ? 1 : tl.audio, i, self = this;
    for (i = 0; i < nv; i++) this.addTrack('video');
    for (i = 0; i < na; i++) this.addTrack('audio');
    (tl.clips || []).forEach(function (d) {
      var type = 'video', p;
      if (d.media) { var m = self.mediaById(d.media); if (!m) return; p = { type: 'media', media: m }; if (m.kind === 'audio') type = 'audio'; }
      else if (d.title) p = { type: 'title', key: d.title };
      else if (d.generator) p = { type: 'generator', key: d.generator };
      else if (d.adjustment) p = { type: 'adjustment' };
      else return;
      var name = d.track || (type === 'video' ? 'V1' : 'A1');
      var idx = parseInt(name.slice(1), 10) - 1, list = type === 'video' ? self.vTracks() : self.aTracks();
      while (list.length <= idx) { self.addTrack(type); list = type === 'video' ? self.vTracks() : self.aTracks(); }
      var c = self.clipFromPayload(p);
      c.start = self.fr(d.start || 0);
      if (d.in != null) c.srcIn = d.in;
      if (d.duration != null) c.dur = self.fr(d.duration);
      if (d.props) Object.assign(c.props, d.props);
      if (d.name) c.name = d.name;
      if (d.volume != null) c.volume = d.volume;
      if (d.opacity != null) c.tf.opacity = d.opacity;
      if (d.transitionIn) c.tIn = { type: d.transitionIn, dur: d.transitionDuration || 1 };
      if (d.transitionOut) c.tOut = { type: d.transitionOut, dur: d.transitionDuration || 1 };
      if (d.filters) c.filters = d.filters.map(function (k) { return { type: k, amount: FILTERS[k].def }; });
      list[idx].clips.push(c); self.sortTrack(list[idx]);
      if (d.linkAudio && c.kind === 'video') self._linkAudio(c, list[idx], false);
    });
    (tl.markers || []).forEach(function (t) { self.markers.push({ id: uid('k'), t: t }); });
  };

  /* --------------------------------------------------------- undo/redo */
  P._snapshot = function () {
    return JSON.stringify({ tracks: this.tracks, markers: this.markers, inPt: this.inPt, outPt: this.outPt });
  };
  P._restore = function (s) {
    var d = JSON.parse(s);
    this.tracks = d.tracks; this.markers = d.markers; this.inPt = d.inPt; this.outPt = d.outPt;
    var ids = new Set(this.allClips().map(function (c) { return c.id; }));
    this.sel.forEach(function (id) { if (!ids.has(id)) this.sel.delete(id); }, this);
    this.selTrans = null; this.selGap = null;
    this.targetV = Math.min(this.targetV, this.vTracks().length - 1);
  };
  P.saveUndo = function () {
    this.undoStack.push(this._snapshot());
    if (this.undoStack.length > 150) this.undoStack.shift();
    this.redoStack = [];
  };
  P.undo = function () {
    if (!this.undoStack.length) { this.toast('Nothing to undo'); return; }
    this.redoStack.push(this._snapshot());
    this._restore(this.undoStack.pop());
    this.changed();
  };
  P.redo = function () {
    if (!this.redoStack.length) { this.toast('Nothing to redo'); return; }
    this.undoStack.push(this._snapshot());
    this._restore(this.redoStack.pop());
    this.changed();
  };
  P.reset = function () {
    this.stop();
    this._restore(this.initial);
    this.undoStack = []; this.redoStack = [];
    this.sel.clear(); this.playhead = 0; this.taskDone = false; this._stuck = {};
    this.snap = this.opts.startSnapping !== false;
    this.setTool('select');
    this.changed();
    if (this.opts.startZoom) this.setZoom(this.opts.startZoom);
    else this.zoomToFit();
  };

  P.changed = function (o) {
    o = o || {};
    this.renderTimeline();
    this.renderViewer();
    if (o.inspector !== false) this.renderInspector();
    this._updateTimecodes();
    this._scheduleChecks();
  };

  /* ================================================================= BUILD */
  P._build = function () {
    var self = this, root = this.root;
    root.classList.add('nle');
    root.dataset.level = this.level;
    root.tabIndex = 0;
    root.setAttribute('role', 'application');
    root.setAttribute('aria-label', 'Practice video editor');
    root.textContent = '';
    if (this.opts.height) root.style.height = typeof this.opts.height === 'number' ? this.opts.height + 'px' : this.opts.height;

    if (this.opts.task) root.append(this._buildTask());

    var body = el('div', { class: 'nle-body' });
    var left = el('div', { class: 'nle-left' });
    var right = el('div', { class: 'nle-right' });
    this.ui.left = left; this.ui.right = right;

    var pool = this._buildPool();
    var lib = this._buildLib();
    var hsL = el('div', { class: 'nle-hsplit', title: 'Drag to resize' });
    left.append(pool, hsL, lib);
    lib.hidden = hsL.hidden = !this.allow.library;
    if (!this.allow.library) pool.style.flexGrow = '1';

    var upper = el('div', { class: 'nle-upper' });
    upper.append(this._buildViewer(), this._buildInspector());
    var hsR = el('div', { class: 'nle-hsplit', title: 'Drag to resize' });
    var tl = this._buildTimeline();
    right.append(upper, hsR, tl);
    this.ui.upper = upper; this.ui.pool = pool; this.ui.lib = lib; this.ui.tl = tl;

    var vs = el('div', { class: 'nle-vsplit', title: 'Drag to resize' });
    body.append(left, vs, right);
    root.append(body);
    this.ui.body = body;

    this.ui.menu = el('div', { class: 'nle-menu', hidden: true });
    this.ui.toast = el('div', { class: 'nle-toast', role: 'status', 'aria-live': 'polite' });
    root.append(this.ui.menu, this.ui.toast);

    this.fileInput = el('input', { type: 'file', multiple: true, accept: 'image/*,video/*,audio/*', hidden: true, onchange: function () { self.importFiles(self.fileInput.files); self.fileInput.value = ''; } });
    root.append(this.fileInput);

    this._applyLayout();
    this._splitter(vs, 'x', function (frac) { self.layout.left = clamp(frac, 0.15, 0.6); }, body);
    this._splitter(hsL, 'y', function (frac) { self.layout.pool = clamp(frac, 0.15, 0.85); }, left);
    this._splitter(hsR, 'y', function (frac) { self.layout.viewer = clamp(frac, 0.15, 0.85); }, right);

    // focus + keyboard
    this._on(root, 'pointerdown', function (e) {
      if (!e.target.closest('input,textarea,select')) root.focus({ preventScroll: true });
      if (!e.target.closest('.nle-menu')) self.hideMenu();
    });
    this._on(root, 'keydown', function (e) { self._onKey(e); });
    this._on(root, 'contextmenu', function (e) { if (!e.target.closest('input,textarea')) e.preventDefault(); });

    if (global.ResizeObserver) {
      this._ro = new ResizeObserver(function () {
        if (self._roPending) return; self._roPending = true;
        requestAnimationFrame(function () { self._roPending = false; self._layoutViewer(); self.renderTimeline(); });
      });
      this._ro.observe(this.ui.canvas);
      this._ro.observe(this.ui.tlScroll);
    }
    this._on(document, 'fullscreenchange', function () { setTimeout(function () { self._layoutViewer(); self.renderTimeline(); }, 50); });
  };
  P._on = function (t, ev, fn, o) { t.addEventListener(ev, fn, o); this._listeners.push([t, ev, fn, o]); };
  P.destroy = function () {
    this.stop();
    this._listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    if (this._ro) this._ro.disconnect();
    this.root.textContent = '';
    this.root.classList.remove('nle');
  };

  P._applyLayout = function () {
    this.ui.left.style.flexBasis = (this.layout.left * 100) + '%';
    this.ui.pool.style.flexBasis = (this.layout.pool * 100) + '%';
    this.ui.upper.style.flexBasis = (this.layout.viewer * 100) + '%';
  };
  P._splitter = function (handle, axis, setFrac, container) {
    var self = this;
    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      handle.classList.add('active');
      var move = function (ev) {
        var r = container.getBoundingClientRect();
        var frac = axis === 'x' ? (ev.clientX - r.left) / r.width : (ev.clientY - r.top) / r.height;
        setFrac(frac); self._applyLayout(); self._layoutViewer();
      };
      var up = function () { handle.classList.remove('active'); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); self.renderTimeline(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
  };

  /* ------------------------------------------------------------- task bar */
  P._buildTask = function () {
    var self = this, t = this.opts.task;
    var bar = el('div', { class: 'nle-task' });
    var head = el('div', { class: 'nle-task-head' },
      el('span', { class: 'nle-task-pill', text: t.label || 'Task' }),
      el('strong', { class: 'nle-task-title', text: t.title || 'Practice' }),
      t.brief ? el('span', { class: 'nle-task-brief', html: t.brief }) : null,
      el('span', { class: 'nle-task-sp' }),
      this.ui.taskCount = el('span', { class: 'nle-task-count' }),
      el('button', { type: 'button', class: 'nle-tbtn', onclick: function () { if (self.undoStack.length === 0 || confirm('Reset this practice timeline? Your edits will be cleared.')) self.reset(); } }, icon('reset'), 'Reset')
    );
    this.ui.taskSteps = el('ol', { class: 'nle-task-steps' });
    (t.steps || []).forEach(function (s, i) {
      var li = el('li', { class: 'nle-task-step' }, el('span', { class: 'nle-task-box' }, icon('check')), el('span', { html: s.text }));
      if (s.hint) li.title = s.hint;
      self.ui.taskSteps.append(li);
    });
    bar.append(head, this.ui.taskSteps);
    this.ui.task = bar;
    return bar;
  };
  P._scheduleChecks = function () {
    var self = this;
    if (this._ckT) return;
    this._ckT = setTimeout(function () { self._ckT = null; self.runChecks(); }, 60);
  };
  P.runChecks = function () {
    var api = this.api(), self = this;
    if (this.opts.onChange) try { this.opts.onChange(api); } catch (e) { console.error(e); }
    var t = this.opts.task;
    if (!t || !t.steps) return;
    var done = 0, results = [];
    this._stuck = this._stuck || {};
    t.steps.forEach(function (s, i) {
      var ok = false;
      try { ok = !!s.check(api); } catch (e) { ok = false; }
      if (s.sticky) { if (ok) self._stuck[i] = true; else if (self._stuck[i]) ok = true; }
      results.push(ok);
      if (ok) done++;
      var li = self.ui.taskSteps.children[i];
      if (li) li.classList.toggle('done', ok);
    });
    this.ui.taskCount.textContent = done + ' / ' + t.steps.length;
    var all = done === t.steps.length;
    this.ui.task.classList.toggle('complete', all);
    if (all && !this.taskDone) {
      this.taskDone = true;
      this.toast(t.doneMessage || 'Task complete — nice work!', 4000);
      if (t.onComplete) try { t.onComplete(api); } catch (e) { console.error(e); }
    } else if (!all) this.taskDone = false;
    this.lastResults = results;
    if (this.opts.onTaskResults) this.opts.onTaskResults(results);
  };

  /* ------------------------------------------------------------ media pool */
  P._buildPool = function () {
    var self = this;
    var p = el('section', { class: 'nle-panel nle-pool', 'aria-label': 'Media Pool' });
    this.ui.poolViewBtn = ibtn(this.poolView === 'list' ? 'list' : 'grid', 'Switch between list and thumbnail view', function () {
      self.poolView = self.poolView === 'list' ? 'grid' : 'list'; self.renderPool();
      self.ui.poolViewBtn.replaceChildren(icon(self.poolView === 'list' ? 'list' : 'grid'));
    });
    this.ui.poolSearch = el('input', { class: 'nle-search', type: 'search', placeholder: 'Search clips', hidden: true, oninput: function () { self.poolFilter = this.value.toLowerCase(); self.renderPool(); } });
    var tb = el('div', { class: 'nle-ptb' },
      ibtn('panel', 'Show bins', function () { p.classList.toggle('bins'); }),
      ibtn('back', 'Back', null, 'dim'), ibtn('fwd', 'Forward', null, 'dim'),
      this.allow.import ? ibtn('importm', 'Import media (or drop files here)', function () { self.fileInput.click(); }) : null,
      el('span', { class: 'nle-ptb-title', text: 'Master' }),
      this.ui.poolViewBtn,
      ibtn('search', 'Search', function () { var s = self.ui.poolSearch; s.hidden = !s.hidden; if (!s.hidden) s.focus(); else { s.value = ''; self.poolFilter = ''; self.renderPool(); } }),
      ibtn('sort', 'Sort by name', function () { self.poolSort = (self.poolSort + 1) % 3; self.renderPool(); }),
      ibtn('more', 'Options', function (e) {
        var r = e.currentTarget.getBoundingClientRect();
        self.showMenu(r.left, r.bottom, [
          { label: 'Import Media…', action: function () { self.fileInput.click(); }, disabled: !self.allow.import },
          { label: self.poolView === 'list' ? 'Thumbnail View' : 'List View', action: function () { self.ui.poolViewBtn.click(); } }
        ]);
      })
    );
    var bins = el('div', { class: 'nle-bins' }, el('div', { class: 'nle-bin sel' }, icon('folder'), 'Master'));
    this.ui.poolBody = el('div', { class: 'nle-pool-body' });
    var crumb = el('div', { class: 'nle-crumb' }, el('span', { text: 'Master' }), this.ui.poolSearch);
    var main = el('div', { class: 'nle-pool-main' }, crumb, this.ui.poolBody);
    p.append(tb, el('div', { class: 'nle-pool-wrap' }, bins, main));

    // OS file drop
    if (this.allow.import) {
      p.addEventListener('dragover', function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0) { e.preventDefault(); p.classList.add('filedrop'); } });
      p.addEventListener('dragleave', function (e) { if (!p.contains(e.relatedTarget)) p.classList.remove('filedrop'); });
      p.addEventListener('drop', function (e) { e.preventDefault(); p.classList.remove('filedrop'); if (e.dataTransfer.files.length) self.importFiles(e.dataTransfer.files); });
    }
    this.ui.poolBody.addEventListener('pointerdown', function (e) {
      var item = e.target.closest('[data-media]');
      if (!item) { self.poolSel = null; self.renderPool(); return; }
      if (e.button !== 0) return;
      var m = self.mediaById(item.dataset.media);
      if (self._isDouble('pool' + m.id)) { self.editOp('append', { type: 'media', media: m }); return; }
      self.poolSel = m.id; self.renderPool();
      self._scheduleChecks();
      self._beginDrag(e, { type: 'media', media: m });
    });
    this.ui.poolBody.addEventListener('contextmenu', function (e) {
      var item = e.target.closest('[data-media]');
      if (!item) { if (self.allow.import) self.showMenu(e.clientX, e.clientY, [{ label: 'Import Media…', action: function () { self.fileInput.click(); } }]); return; }
      var m = self.mediaById(item.dataset.media);
      self.poolSel = m.id; self.renderPool();
      var pl = { type: 'media', media: m };
      self.showMenu(e.clientX, e.clientY, [
        { label: 'Insert at Playhead', sc: 'F9', action: function () { self.editOp('insert', pl); } },
        { label: 'Overwrite at Playhead', sc: 'F10', action: function () { self.editOp('overwrite', pl); } },
        { label: 'Place on Top', sc: 'F12', action: function () { self.editOp('top', pl); } },
        { label: 'Append at End', sc: '⇧F12', action: function () { self.editOp('append', pl); } },
        { sep: true },
        { label: 'Rename…', action: function () { var n = prompt('Clip name', m.name); if (n) { m.name = n; self.renderPool(); } } },
        { label: 'Remove from Media Pool', action: function () { self.removeMedia(m); } }
      ]);
    });
    return p;
  };
  P.removeMedia = function (m) {
    var used = this.allClips().filter(function (c) { return c.mediaId === m.id; });
    if (used.length && !confirm('"' + m.name + '" is used ' + used.length + ' time(s) in the timeline. Remove it and those clips?')) return;
    this.saveUndo();
    this.tracks.forEach(function (t) { t.clips = t.clips.filter(function (c) { return c.mediaId !== m.id; }); });
    this.media = this.media.filter(function (x) { return x !== m; });
    if (this.poolSel === m.id) this.poolSel = null;
    this.renderPool(); this.changed();
  };
  P._mediaDurText = function (m) {
    if (m.kind === 'image') return tc(this.still, this.fps, 0);
    return m.duration ? tc(m.duration, this.fps, 0) : '--:--:--:--';
  };
  P._mediaThumb = function (m, cls) {
    var box = el('span', { class: cls + ' k-' + m.kind });
    if (m.offline) { box.classList.add('offline'); box.textContent = '!'; }
    else if (m.thumb) box.style.backgroundImage = 'url("' + m.thumb + '")';
    else box.append(icon(m.kind === 'audio' ? 'audio' : m.kind === 'video' ? 'film' : 'image'));
    return box;
  };
  P.renderPool = function () {
    var self = this, body = this.ui.poolBody;
    if (!body) return;
    var list = this.media.filter(function (m) { return !self.poolFilter || m.name.toLowerCase().indexOf(self.poolFilter) >= 0; });
    if (this.poolSort) list = list.slice().sort(function (a, b) { return (self.poolSort === 1 ? 1 : -1) * a.name.localeCompare(b.name); });
    body.textContent = '';
    body.className = 'nle-pool-body v-' + this.poolView;
    if (this.poolView === 'list') {
      var head = el('div', { class: 'nle-prow nle-phead' },
        el('span', { class: 'c-name' }, 'Clip Name', this.poolSort ? icon(this.poolSort === 1 ? 'up' : 'down') : null),
        el('span', { class: 'c-dur', text: 'Duration' }), el('span', { class: 'c-type', text: 'Type' }), el('span', { class: 'c-res', text: 'Resolution' }));
      body.append(head);
      list.forEach(function (m) {
        body.append(el('div', { class: 'nle-prow' + (self.poolSel === m.id ? ' sel' : ''), 'data-media': m.id, title: m.name + ' — drag to the timeline or viewer' },
          el('span', { class: 'c-name' }, self._mediaThumb(m, 'nle-pthumb'), el('span', { class: 'nle-ell', text: m.name })),
          el('span', { class: 'c-dur', text: self._mediaDurText(m) }),
          el('span', { class: 'c-type', text: m.offline ? 'Offline' : m.kind === 'image' ? 'Still' : m.kind === 'video' ? 'Video' : 'Audio' }),
          el('span', { class: 'c-res', text: m.width ? m.width + 'x' + m.height : '' })));
      });
      for (var i = list.length; i < 14; i++) body.append(el('div', { class: 'nle-prow empty' }));
    } else {
      list.forEach(function (m) {
        body.append(el('div', { class: 'nle-pcard' + (self.poolSel === m.id ? ' sel' : ''), 'data-media': m.id, title: m.name },
          self._mediaThumb(m, 'nle-pcard-img'),
          el('span', { class: 'nle-pcard-dur', text: self._mediaDurText(m) }),
          el('span', { class: 'nle-pcard-name nle-ell', text: m.name })));
      });
    }
    if (!list.length) body.append(el('div', { class: 'nle-empty', text: this.allow.import ? 'No clips yet. Click Import or drop video, audio or image files here.' : 'No clips in this bin.' }));
  };

  /* ---------------------------------------------------------- effects lib */
  P._buildLib = function () {
    var self = this;
    var p = el('section', { class: 'nle-panel nle-lib', 'aria-label': 'Effects Library' });
    this.ui.libSearch = el('input', { class: 'nle-search', type: 'search', placeholder: 'Search effects', hidden: true, oninput: function () { self.renderLib(); } });
    var tb = el('div', { class: 'nle-ptb' },
      ibtn('panel', 'Show or hide categories', function () { p.classList.toggle('notree'); }),
      el('span', { class: 'nle-ptb-title sm', text: 'Effects' }),
      el('span', { class: 'nle-sp' }),
      this.ui.libSearch,
      ibtn('search', 'Search effects', function () { var s = self.ui.libSearch; s.hidden = !s.hidden; if (!s.hidden) s.focus(); else { s.value = ''; self.renderLib(); } }),
      ibtn('more', 'Options', function (e) {
        var r = e.currentTarget.getBoundingClientRect();
        self.showMenu(r.left - 120, r.bottom, [{ label: 'Clear Favorites', action: function () { self.favs = []; self.renderLib(); } }]);
      }));
    this.ui.libTree = el('div', { class: 'nle-tree' });
    this.ui.libList = el('div', { class: 'nle-liblist' });
    p.append(tb, el('div', { class: 'nle-lib-wrap' }, this.ui.libTree, this.ui.libList));
    this.ui.libList.addEventListener('pointerdown', function (e) {
      var it = e.target.closest('[data-lib]');
      if (!it || e.button !== 0) return;
      var pl = JSON.parse(it.dataset.lib);
      self.ui.libList.querySelectorAll('.sel').forEach(function (x) { x.classList.remove('sel'); });
      it.classList.add('sel');
      self._beginDrag(e, pl);
    });
    this.ui.libList.addEventListener('dblclick', function (e) {
      var it = e.target.closest('[data-lib]');
      if (it) self.applyLibItem(JSON.parse(it.dataset.lib));
    });
    this.ui.libList.addEventListener('keydown', function (e) {
      var it = e.target.closest('[data-lib]');
      if (!it || !['Enter', ' '].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      self.applyLibItem(JSON.parse(it.dataset.lib));
    });
    this.ui.libList.addEventListener('contextmenu', function (e) {
      var it = e.target.closest('[data-lib]');
      if (!it) return;
      var key = it.dataset.lib, fav = self.favs.indexOf(key) >= 0;
      self.showMenu(e.clientX, e.clientY, [
        { label: 'Apply', action: function () { self.applyLibItem(JSON.parse(key)); } },
        { label: fav ? 'Remove from Favorites' : 'Add to Favorites', action: function () { if (fav) self.favs.splice(self.favs.indexOf(key), 1); else self.favs.push(key); self.renderLib(); } }
      ]);
    });
    this.renderLib();
    return p;
  };
  P.renderLib = function () {
    var self = this, tree = this.ui.libTree, list = this.ui.libList;
    tree.textContent = ''; list.textContent = '';
    var q = (this.ui.libSearch.value || '').toLowerCase();
    var cats = {};
    var groups = this.level === 2 ? LIB_TREE.flatMap(function (g) { return g.children || [g]; }).filter(function (g) { return g.id === 'atrans'; }) : LIB_TREE;
    groups.forEach(function (g) {
      if (g.group) {
        tree.append(el('div', { class: 'nle-tree-g' }, icon('down'), g.group));
        g.children.forEach(function (c) { cats[c.id] = c; tree.append(self._treeRow(c, true)); });
      } else { cats[g.id] = g; tree.append(self._treeRow(g, false)); }
    });
    var items, title;
    if (q) {
      items = []; title = 'Search results';
      groups.forEach(function (g) { (g.children || [g]).forEach(function (c) { (c.items || []).forEach(function (i) { if (payloadName(i).toLowerCase().indexOf(q) >= 0) items.push(i); }); }); });
    } else {
      var cat = cats[this.libCat] || cats.titles;
      title = cat.name;
      items = cat.id === 'favs' ? this.favs.map(function (f) { return JSON.parse(f); }) : cat.items;
    }
    list.append(el('div', { class: 'nle-liblist-h' }, el('span', { text: title }), icon('up')));
    if (!items.length) list.append(el('div', { class: 'nle-empty', text: this.libCat === 'favs' && !q ? 'Right-click any effect and choose Add to Favorites.' : 'Nothing found.' }));
    items.forEach(function (it) {
      list.append(el('div', { class: 'nle-libitem', 'data-lib': JSON.stringify(it), role: 'button', tabindex: 0,
        'aria-label': 'Apply ' + payloadName(it), title: self._libHint(it) },
        self._libThumb(it), el('span', { class: 'nle-libname nle-ell', text: payloadName(it) })));
    });
  };
  P._libHint = function (it) {
    if (it.type === 'transition') return 'Drag onto the start or end of a clip, or onto a cut between two clips';
    if (it.type === 'filter') return 'Drag onto a clip in the timeline';
    return 'Drag onto the timeline or viewer (double-click to place on top at the playhead)';
  };
  P._treeRow = function (c, indent) {
    var self = this, sel = this.libCat === c.id;
    return el('button', { type: 'button', class: 'nle-tree-r' + (sel ? ' sel' : '') + (indent ? ' ind' : ''),
      'aria-pressed': String(sel), 'data-category': c.id, onclick: function (event) {
        var keyboard = event.currentTarget.matches(':focus-visible');
        self.libCat = c.id;
        self.ui.libSearch.value = '';
        self.renderLib();
        if (keyboard) self.ui.libTree.querySelector('[data-category="' + c.id + '"]').focus();
      } },
      sel ? icon('right') : el('span', { class: 'nle-tree-sp' }), c.name);
  };
  P._libThumb = function (it) {
    var t = el('span', { class: 'nle-libthumb t-' + it.type });
    if (it.type === 'title') {
      var k = it.key, d = TITLES[k];
      if (k === 'lowerLeft' || k === 'lowerMid' || k === 'lowerRight') {
        t.classList.add('lt-' + k);
        t.append(el('span', { class: 'lt' }, el('i', { text: 'Title' }), el('b', { text: 'Sample' })));
      } else if (k === 'multitext') t.append(el('span', { class: 'mt' }, el('b', { text: 'Text 1' }), el('b', { text: 'Text 2' })));
      else if (k === 'scroll') t.append(el('span', { class: 'sc', text: 'Scroll title\nScroll title\nScroll title' }));
      else t.append(el('span', { class: 'tx', text: k === 'text' ? 'Basic Title' : 'Custom Title' }));
    } else if (it.type === 'generator') {
      var g = GENERATORS[it.key];
      t.style.background = g.bg || (g.props && g.props.color);
    } else if (it.type === 'transition') {
      t.append(el('span', { class: 'tr tr-' + it.key }, el('i'), el('i')));
      if (TRANSITIONS[it.key].audio) { t.textContent = ''; t.append(icon('audio')); }
    } else if (it.type === 'filter') {
      t.append(el('span', { class: 'fl fl-' + it.key }));
    } else if (it.type === 'adjustment') {
      t.append(icon('fx'));
    }
    return t;
  };
  P.applyLibItem = function (pl) {
    if (isClipPayload(pl)) { this.editOp('top', pl); return; }
    var self = this;
    if (pl.type === 'filter') {
      var targets = this._selClips().filter(function (c) { return c.kind !== 'audio'; });
      if (!targets.length) { this.toast('Select a clip first, or drag the filter onto a clip'); return; }
      this.saveUndo();
      targets.forEach(function (c) { self._addFilter(c, pl.key); });
      this.changed();
      return;
    }
    if (pl.type === 'transition') {
      var type = payloadTrackType(pl), best = null;
      var cs = this._selClips().filter(function (c) { return self.trackOf(c).type === type; });
      if (!cs.length) cs = this.tracks.filter(function (t) { return t.type === type; }).reduce(function (a, t) { return a.concat(t.clips); }, []);
      cs.forEach(function (c) {
        [['in', c.start], ['out', self.end(c)]].forEach(function (e) {
          var d = Math.abs(e[1] - self.playhead);
          if (!best || d < best.d) best = { d: d, clip: c, edge: e[0] };
        });
      });
      if (!best) { this.toast('Add a clip to the timeline first'); return; }
      this.saveUndo();
      this._addTransition(best.clip, best.edge, pl.key);
      this.changed();
    }
  };

  /* ---------------------------------------------------------------- viewer */
  P._buildViewer = function () {
    var self = this;
    var v = el('section', { class: 'nle-panel nle-viewer', 'aria-label': 'Timeline viewer' });
    this.ui.fitBtn = el('button', { type: 'button', class: 'nle-dd', title: 'Viewer zoom', onclick: function (e) {
      var r = e.currentTarget.getBoundingClientRect();
      self.showMenu(r.left, r.bottom, ['fit', 1, 0.5, 0.25].map(function (f) {
        return { label: f === 'fit' ? 'Fit' : (f * 100) + '%', checked: self.fit === f, action: function () { self.fit = f; self.ui.fitBtn.firstChild.textContent = f === 'fit' ? 'Fit' : (f * 100) + '%'; self._layoutViewer(); } };
      }));
    } }, 'Fit', icon('down'));
    this.ui.durTC = el('span', { class: 'nle-tc', title: 'Timeline duration' });
    this.ui.curTC = el('span', { class: 'nle-tc', title: 'Playhead position' });
    this.ui.inspBtn = ibtn('inspector', 'Inspector', function () { self.toggleInspector(); }, this.inspectorOpen ? 'on' : '');
    var tb = el('div', { class: 'nle-ptb' },
      ibtn('image', 'Viewer', null, 'dim'), ibtn('safe', 'Safe area guides', function (e) { self.safeArea = !self.safeArea; e.currentTarget.classList.toggle('on', self.safeArea); self.ui.safe.hidden = !self.safeArea; }),
      ibtn('film', 'Timeline viewer', null, 'dim'),
      el('span', { class: 'nle-vsep' }), this.ui.fitBtn, el('span', { class: 'nle-vsep' }), this.ui.durTC,
      el('span', { class: 'nle-sp' }),
      el('button', { type: 'button', class: 'nle-dd nle-tlname', title: 'Timeline' }, this.timelineName, icon('down')),
      el('span', { class: 'nle-sp' }),
      this.ui.curTC, el('span', { class: 'nle-vsep' }),
      ibtn('undo', 'Undo (Ctrl/⌘+Z)', function () { self.undo(); }),
      ibtn('redo', 'Redo (Ctrl/⌘+Shift+Z)', function () { self.redo(); }),
      el('span', { class: 'nle-vsep' }),
      ibtn('fullscreen', 'Full screen editor', function () { self.toggleFullscreen(); }),
      this.level > 1 ? this.ui.inspBtn : null);

    this.ui.frame = el('div', { class: 'nle-frame' });
    this.ui.safe = el('div', { class: 'nle-safe', hidden: true }, el('i', { class: 'a' }), el('i', { class: 't' }));
    this.ui.frame.append(this.ui.safe);
    this.ui.overlay = el('div', { class: 'nle-overlay', hidden: true });
    [['insert', 'Insert'], ['overwrite', 'Overwrite'], ['replace', 'Replace'], ['top', 'Place on Top'], ['append', 'Append at End']].forEach(function (o) {
      self.ui.overlay.append(el('div', { class: 'nle-ov-op op-' + o[0], 'data-op': o[0] }, icon(o[0] === 'top' ? 'up' : o[0] === 'append' ? 'right' : o[0]), el('span', { text: o[1] })));
    });
    this.ui.canvas = el('div', { class: 'nle-canvas' }, this.ui.frame, this.ui.overlay);

    // scrubber
    this.ui.scrubHead = el('div', { class: 'nle-scrub-head' });
    this.ui.scrubRange = el('div', { class: 'nle-scrub-range', hidden: true });
    this.ui.scrub = el('div', { class: 'nle-scrub', title: 'Drag to scrub' }, el('div', { class: 'nle-scrub-line' }), this.ui.scrubRange, this.ui.scrubHead,
      el('i', { class: 'nle-scrub-tick l' }), el('i', { class: 'nle-scrub-tick r' }));
    this.ui.scrub.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var r = self.ui.scrub.getBoundingClientRect();
      var go = function (ev) { var d = Math.max(self.duration(), 1); self.setPlayhead(self.fr(clamp((ev.clientX - r.left - 8) / (r.width - 16), 0, 1) * d)); };
      self.stop(); go(e);
      var up = function () { window.removeEventListener('pointermove', go); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', go); window.addEventListener('pointerup', up);
    });

    this.ui.playBtn = ibtn('play', 'Play / Pause (Space)', function () { self.togglePlay(); }, 'big');
    this.ui.loopBtn = ibtn('loop', 'Loop playback', function () { self.loop = !self.loop; self.ui.loopBtn.classList.toggle('on', self.loop); });
    var tr = el('div', { class: 'nle-transport' },
      el('div', { class: 'nle-tp-l' }, ibtn('safe', 'Safe area guides', function () { self.ui.frame.parentNode && self.ui.frame && tb.querySelectorAll('.nle-ib')[1].click(); }), ibtn('down', 'Viewer options', null, 'dim sm')),
      el('div', { class: 'nle-tp-jog' }, ibtn('back', 'Previous frame (←)', function () { self.stepFrames(-1); }, 'sm'), el('span', { class: 'nle-jogdot' }), ibtn('fwd', 'Next frame (→)', function () { self.stepFrames(1); }, 'sm')),
      el('div', { class: 'nle-tp-c' },
        ibtn('tostart', 'Go to start (Home)', function () { self.stop(); self.setPlayhead(0); }),
        ibtn('rev', 'Play reverse (J)', function () { self.play(-1); }),
        ibtn('stop', 'Stop (K)', function () { self.stop(); }),
        this.ui.playBtn,
        ibtn('toend', 'Go to end (End)', function () { self.stop(); self.setPlayhead(self.duration()); }),
        this.ui.loopBtn),
      el('div', { class: 'nle-tp-r' },
        ibtn('markin', 'Mark In (I)', function () { self.markIn(); }),
        ibtn('markout', 'Mark Out (O)', function () { self.markOut(); })));
    v.append(tb, this.ui.canvas, this.ui.scrub, tr);
    return v;
  };
  P._layoutViewer = function () {
    var c = this.ui.canvas; if (!c) return;
    var w = c.clientWidth, h = c.clientHeight;
    var s = this.fit === 'fit' ? Math.min((w - 16) / 1920, (h - 16) / 1080) : this.fit;
    s = Math.max(s, 0.02);
    this.frameScale = s;
    this.ui.frame.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  };
  P.toggleInspector = function (force) {
    if (this.level === 1) return;
    this.inspectorOpen = force == null ? !this.inspectorOpen : force;
    this.ui.insp.hidden = !this.inspectorOpen;
    this.ui.inspBtn.classList.toggle('on', this.inspectorOpen);
    this._layoutViewer();
    this.renderInspector();
  };
  P.toggleFullscreen = function () {
    var r = this.root;
    if (document.fullscreenElement === r) document.exitFullscreen();
    else if (r.requestFullscreen) r.requestFullscreen().catch(function () {});
    else if (r.webkitRequestFullscreen) r.webkitRequestFullscreen();
  };

  /** Which clips are visible at time t, bottom to top, with transition state. */
  P._trackWindows = function (tr) {
    var self = this, E = this.EPS;
    var clips = tr.clips.filter(function (c) { return !c.disabled; });
    var win = new Map();
    clips.forEach(function (c) { win.set(c.id, { from: c.start, to: self.end(c), fx: [] }); });
    clips.forEach(function (c) {
      var w = win.get(c.id);
      if (c.tIn) {
        var prev = null;
        clips.forEach(function (p) { if (p !== c && Math.abs(self.end(p) - c.start) < E) prev = p; });
        if (prev) {
          var d = Math.min(c.tIn.dur, c.dur * 2, prev.dur * 2), a = c.start - d / 2, b = c.start + d / 2;
          w.from = a; w.fx.push({ role: 'in', a: a, b: b, type: c.tIn.type, adj: true });
          var pw = win.get(prev.id); pw.to = Math.max(pw.to, b); pw.fx.push({ role: 'out', a: a, b: b, type: c.tIn.type, adj: true });
        } else {
          var d2 = Math.min(c.tIn.dur, c.dur);
          w.fx.push({ role: 'in', a: c.start, b: c.start + d2, type: c.tIn.type, adj: false });
        }
      }
      if (c.tOut) {
        var d3 = Math.min(c.tOut.dur, c.dur);
        w.fx.push({ role: 'out', a: self.end(c) - d3, b: self.end(c), type: c.tOut.type, adj: false });
      }
    });
    return { clips: clips, win: win };
  };
  P._activeAt = function (tr, t) {
    var tw = this._trackWindows(tr), out = [], self = this;
    tw.clips.forEach(function (c) {
      var w = tw.win.get(c.id);
      if (t < w.from - 1e-9 || t >= w.to - 1e-9) return;
      var fx = {};
      w.fx.forEach(function (f) {
        if (t >= f.a && t < f.b) {
          var s = transFx(f.type, f.role, (t - f.a) / (f.b - f.a), f.adj);
          for (var k in s) fx[k] = k === 'opacity' && fx[k] != null ? fx[k] * s[k] : s[k];
        }
      });
      var len = self.mediaLen(c);
      var st = clamp(c.srcIn + (t - c.start), 0, isFinite(len) ? Math.max(0, len - 1 / self.fps / 2) : 1e9);
      out.push({ clip: c, fx: fx, st: st, p: clamp((t - c.start) / c.dur, 0, 1) });
    });
    return out;
  };

  P.renderViewer = function () {
    if (!this.ui.frame) return;
    var self = this, t = this.playhead, frame = this.ui.frame, used = new Set(), z = 1;
    var any = this.allClips().length > 0;
    frame.classList.toggle('has', any);
    this.vTracks().forEach(function (tr) {
      if (!tr.enabled) return;
      self._activeAt(tr, t).forEach(function (L) {
        var node = self.layerCache.get(L.clip.id);
        if (!node) { node = self._makeLayer(L.clip); self.layerCache.set(L.clip.id, node); }
        used.add(L.clip.id);
        if (node.parentNode !== frame) frame.insertBefore(node, self.ui.safe);
        node.style.zIndex = z++;
        self._updateLayer(node, L);
      });
    });
    this.layerCache.forEach(function (node, id) {
      if (used.has(id)) return;
      var v = node._video; if (v && !v.paused) v.pause();
      if (node.parentNode) node.remove();
      if (!self.clipById(id)) self.layerCache.delete(id);
    });
    this._syncAudio();
  };
  P._makeLayer = function (c) {
    var outer = el('div', { class: 'nle-layer' }), inner = el('div', { class: 'nle-layer-in' }), content;
    var m = c.mediaId ? this.mediaById(c.mediaId) : null;
    if (c.kind === 'image') content = el('img', { class: 'nle-media', src: m ? m.src : '', alt: '', draggable: 'false' });
    else if (c.kind === 'video') {
      content = el('video', { class: 'nle-media', src: m ? m.src : '', preload: 'auto', playsinline: true });
      content.muted = !!(m && m.hasAudio);
      outer._video = content;
    } else if (c.kind === 'title') content = this._makeTitle(c);
    else if (c.kind === 'generator') content = el('div', { class: 'nle-gen' });
    else if (c.kind === 'adjustment') content = el('div', { class: 'nle-adjust' });
    else content = el('div');
    outer._content = content;
    inner.append(content);
    outer._vig = el('div', { class: 'nle-vignette', hidden: true });
    inner.append(outer._vig);
    outer._off = el('div', { class: 'nle-offline', hidden: true }, el('span', { text: 'Media Offline' }));
    inner.append(outer._off);
    outer._inner = inner;
    outer.append(inner);
    return outer;
  };
  P._makeTitle = function (c) {
    var d = el('div', { class: 'nle-title tpl-' + c.key });
    d._t1 = el('div', { class: 't1' }); d._t2 = el('div', { class: 't2' });
    if (c.key === 'lowerLeft' || c.key === 'lowerMid' || c.key === 'lowerRight') d.append(d._t2, d._t1);
    else if (c.key === 'multitext') d.append(d._t1, d._t2);
    else d.append(d._t1);
    return d;
  };
  P._updateLayer = function (node, L) {
    var c = L.clip, fx = L.fx, inner = node._inner, content = node._content;
    var m = c.mediaId ? this.mediaById(c.mediaId) : null;
    // transition (outer)
    var tf = [];
    if (fx.tx) tf.push('translateX(' + fx.tx + '%)');
    if (fx.scale != null) tf.push('scale(' + fx.scale + ')');
    node.style.transform = tf.join(' ');
    node.style.opacity = fx.opacity != null ? fx.opacity : '';
    node.style.clipPath = fx.clip || '';
    node.style.webkitClipPath = fx.clip || '';
    node.style.filter = fx.blur ? 'blur(' + fx.blur + 'px)' : '';
    // clip transform + filters (inner)
    var t = c.tf || {};
    var mirror = c.filters.some(function (f) { return f.type === 'mirror'; });
    inner.style.transform = 'translate(' + (t.x || 0) + 'px,' + (t.y || 0) + 'px) rotate(' + (t.rot || 0) + 'deg) scale(' + ((t.zoom == null ? 1 : t.zoom) * (mirror ? -1 : 1)) + ',' + (t.zoom == null ? 1 : t.zoom) + ')';
    inner.style.opacity = t.opacity == null ? 1 : t.opacity;
    var css = c.filters.map(function (f) { var d = FILTERS[f.type]; return d && d.css ? d.css(f.amount) : ''; }).join(' ').trim();
    var vig = c.filters.filter(function (f) { return f.type === 'vignette'; })[0];
    node._vig.hidden = !vig; if (vig) node._vig.style.opacity = vig.amount;
    if (c.kind === 'adjustment') { content.style.backdropFilter = css || 'none'; content.style.webkitBackdropFilter = css || 'none'; inner.style.filter = ''; }
    else inner.style.filter = css;
    node._off.hidden = !(m && m.offline);
    if (c.kind === 'video' && m && !m.offline) this._syncVideo(content, L.st);
    else if (c.kind === 'title') this._updateTitle(content, c, L.p);
    else if (c.kind === 'generator') {
      var g = GENERATORS[c.key] || {};
      content.style.background = g.bg || (c.props && c.props.color) || '#000';
    }
  };
  P._updateTitle = function (d, c, p) {
    var pr = c.props || {};
    if (d._t1.textContent !== (pr.text || '')) d._t1.textContent = pr.text || '';
    if (d._t2.textContent !== (pr.text2 || '')) d._t2.textContent = pr.text2 || '';
    d.style.fontSize = (pr.size || 64) + 'px';
    d.style.color = pr.color || '#fff';
    d.style.fontWeight = pr.bold ? 700 : 400;
    if (c.key === 'scroll') d.style.transform = 'translate(-50%,' + (1080 - p * (1080 + d.offsetHeight + 40)) + 'px)';
  };
  P._syncVideo = function (v, st) {
    var playingFwd = this.playing && this.rate > 0;
    if (playingFwd) {
      var r = clamp(this.rate, 0.25, 8);
      if (v.playbackRate !== r) v.playbackRate = r;
      if (v.paused) { try { v.currentTime = st; } catch (e) { } var pp = v.play(); if (pp && pp.catch) pp.catch(function () { }); }
      else if (Math.abs(v.currentTime - st) > 0.25) { try { v.currentTime = st; } catch (e) { } }
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - st) > 0.5 / this.fps) { try { v.currentTime = st; } catch (e) { } }
    }
  };
  P._syncAudio = function () {
    var self = this, t = this.playhead, used = new Set();
    var solo = this.aTracks().some(function (tr) { return tr.solo; });
    var playingFwd = this.playing && this.rate > 0;
    if (playingFwd) this.aTracks().forEach(function (tr) {
      if (tr.muted || (solo && !tr.solo)) return;
      self._activeAt(tr, t).forEach(function (L) {
        var c = L.clip, m = self.mediaById(c.mediaId);
        if (!m || m.offline) return;
        var a = self.audioCache.get(c.id);
        if (!a) {
          a = new Audio();
          if (/^https?:$/.test(location.protocol)) a.crossOrigin = 'anonymous';
          a.preload = 'auto';
          a.src = m.src;
          self.audioCache.set(c.id, a);
        }
        used.add(c.id);
        var g = L.fx.opacity == null ? 1 : L.fx.opacity;
        a.volume = clamp(c.volume * g * (self.masterMute ? 0 : 1), 0, 1);
        var r = clamp(self.rate, 0.25, 4);
        if (a.playbackRate !== r) a.playbackRate = r;
        if (a.paused) { try { a.currentTime = L.st; } catch (e) { } var pp = a.play(); if (pp && pp.catch) pp.catch(function () { }); }
        else if (Math.abs(a.currentTime - L.st) > 0.3) { try { a.currentTime = L.st; } catch (e) { } }
      });
    });
    this.audioCache.forEach(function (a, id) { if (!used.has(id) && !a.paused) a.pause(); });
    // video elements carry their own sound when the media has no separate audio clip
    this.layerCache.forEach(function (node) { if (node._video) node._video.volume = self.masterMute ? 0 : 1; });
  };

  /* ------------------------------------------------------------- inspector */
  P._buildInspector = function () {
    var self = this;
    this.ui.insp = el('aside', { class: 'nle-panel nle-insp', hidden: !this.inspectorOpen, 'aria-label': 'Inspector' });
    this.ui.inspBody = el('div', { class: 'nle-insp-body' });
    this.ui.insp.append(el('div', { class: 'nle-ptb' }, el('span', { class: 'nle-ptb-title sm', text: 'Inspector' }), el('span', { class: 'nle-sp' }), ibtn('close', 'Close Inspector', function () { self.toggleInspector(false); })), this.ui.inspBody);
    return this.ui.insp;
  };
  P._inspInput = function (fn) {
    var self = this;
    return function (v) {
      if (!self._inspDirty) { self.saveUndo(); self._inspDirty = true; }
      fn(v);
      self.changed({ inspector: false });
    };
  };
  P._slider = function (label, val, min, max, step, onInput, fmt) {
    var self = this;
    var num = el('input', { type: 'number', class: 'nle-num', min: min, max: max, step: step, value: +(+val).toFixed(3) });
    var rng = el('input', { type: 'range', class: 'nle-range', min: min, max: max, step: step, value: val });
    var handler = this._inspInput(onInput);
    rng.addEventListener('input', function () { num.value = +(+rng.value).toFixed(3); handler(+rng.value); });
    num.addEventListener('input', function () { if (num.value === '') return; rng.value = num.value; handler(+num.value); });
    var end = function () { self._inspDirty = false; };
    rng.addEventListener('change', end); num.addEventListener('change', end);
    var row = el('label', { class: 'nle-field' }, el('span', { class: 'nle-flabel', text: label }), rng, num);
    row.addEventListener('dblclick', function (e) { if (e.target === row.firstChild) { rng.value = rng.defaultValue; rng.dispatchEvent(new Event('input')); end(); } });
    return row;
  };
  P._section = function (title, kids, extra) {
    return el('div', { class: 'nle-isec' }, el('div', { class: 'nle-isec-h' }, el('span', { text: title }), extra || null), kids);
  };
  P.renderInspector = function () {
    if (!this.ui.inspBody || !this.inspectorOpen) return;
    var self = this, b = this.ui.inspBody;
    b.textContent = '';
    var tsel = this.selTrans ? this.clipById(this.selTrans.clip) : null;
    var clips = this._selClips();
    var c = tsel || (clips.length ? clips[0] : null);
    if (!c) { b.append(el('div', { class: 'nle-empty', text: 'Select a clip or transition in the timeline to see its settings here.' })); return; }
    if (clips.length > 1 && !tsel) b.append(el('div', { class: 'nle-insp-note', text: clips.length + ' clips selected — showing the first.' }));

    var nameIn = el('input', { class: 'nle-text', value: c.name });
    nameIn.addEventListener('input', this._inspInput(function () { c.name = nameIn.value; }));
    nameIn.addEventListener('change', function () { self._inspDirty = false; });
    b.append(el('div', { class: 'nle-insp-head' },
      el('span', { class: 'nle-kind k-' + c.kind, text: c.kind === 'image' ? 'Still' : c.kind[0].toUpperCase() + c.kind.slice(1) }), nameIn),
      el('div', { class: 'nle-insp-meta' }, 'Start ', el('b', { text: tc(c.start, this.fps) }), '  Duration ', el('b', { text: tc(c.dur, this.fps, 0) })));

    var order = tsel ? ['trans', 'title', 'gen', 'tf', 'fx', 'audio'] : ['title', 'gen', 'tf', 'fx', 'audio', 'trans'];
    if (this.level === 2) order = ['audio', 'trans'];
    order.forEach(function (k) {
      if (k === 'title' && c.kind === 'title') {
        var d = TITLES[c.key], pr = c.props, rows = [];
        var ta = el(d.multiline ? 'textarea' : 'input', { class: 'nle-text', rows: d.multiline ? 4 : null });
        ta.value = pr.text;
        ta.addEventListener('input', self._inspInput(function () { pr.text = ta.value; }));
        ta.addEventListener('change', function () { self._inspDirty = false; });
        rows.push(el('label', { class: 'nle-field col' }, el('span', { class: 'nle-flabel', text: 'Text' }), ta));
        if (d.two) {
          var t2 = el('input', { class: 'nle-text', value: pr.text2 });
          t2.addEventListener('input', self._inspInput(function () { pr.text2 = t2.value; }));
          t2.addEventListener('change', function () { self._inspDirty = false; });
          rows.push(el('label', { class: 'nle-field col' }, el('span', { class: 'nle-flabel', text: c.key === 'multitext' ? 'Text 2' : 'Subtitle' }), t2));
        }
        rows.push(self._slider('Size', pr.size, 16, 300, 1, function (v) { pr.size = v; }));
        var col = el('input', { type: 'color', class: 'nle-color', value: pr.color });
        col.addEventListener('input', self._inspInput(function () { pr.color = col.value; }));
        col.addEventListener('change', function () { self._inspDirty = false; });
        var bold = el('input', { type: 'checkbox', checked: pr.bold });
        bold.addEventListener('change', self._inspInput(function () { pr.bold = bold.checked; self._inspDirty = false; }));
        rows.push(el('div', { class: 'nle-field' }, el('span', { class: 'nle-flabel', text: 'Color' }), col, el('label', { class: 'nle-chk' }, bold, 'Bold')));
        b.append(self._section('Title', rows));
      }
      if (k === 'gen' && c.kind === 'generator' && c.key === 'solid') {
        var gc = el('input', { type: 'color', class: 'nle-color', value: c.props.color });
        gc.addEventListener('input', self._inspInput(function () { c.props.color = gc.value; }));
        gc.addEventListener('change', function () { self._inspDirty = false; });
        b.append(self._section('Generator', [el('div', { class: 'nle-field' }, el('span', { class: 'nle-flabel', text: 'Color' }), gc)]));
      }
      if (k === 'tf' && c.kind !== 'audio' && c.kind !== 'adjustment') {
        var tf = c.tf;
        b.append(self._section('Transform', [
          self._slider('Zoom', tf.zoom, 0.1, 4, 0.01, function (v) { tf.zoom = v; }),
          self._slider('Position X', tf.x, -1920, 1920, 1, function (v) { tf.x = v; }),
          self._slider('Position Y', tf.y, -1080, 1080, 1, function (v) { tf.y = v; }),
          self._slider('Rotation', tf.rot, -180, 180, 0.5, function (v) { tf.rot = v; }),
          self._slider('Opacity', tf.opacity, 0, 1, 0.01, function (v) { tf.opacity = v; })
        ], el('button', { type: 'button', class: 'nle-link', text: 'Reset', onclick: function () { self.saveUndo(); c.tf = { zoom: 1, x: 0, y: 0, rot: 0, opacity: 1 }; self.changed(); } })));
      }
      if (k === 'fx' && c.kind !== 'audio') {
        var rows2 = c.filters.map(function (f, i) {
          var d = FILTERS[f.type];
          var rm = ibtn('close', 'Remove ' + d.name, function () { self.saveUndo(); c.filters.splice(i, 1); self.changed(); }, 'sm');
          if (d.fixed) return el('div', { class: 'nle-field' }, el('span', { class: 'nle-flabel wide', text: d.name }), rm);
          var row = self._slider(d.name, f.amount, d.min, d.max, d.step, function (v) { f.amount = v; });
          row.append(rm);
          return row;
        });
        if (!rows2.length) rows2.push(el('div', { class: 'nle-insp-note', text: c.kind === 'adjustment' ? 'Drag filters from Effects › Filters onto this adjustment clip — they affect every track below it.' : 'Drag a filter from Effects › Filters onto this clip.' }));
        b.append(self._section('Filters', rows2));
      }
      if (k === 'audio' && (c.kind === 'audio' || c.kind === 'video')) {
        b.append(self._section('Audio', [self._slider('Volume', c.volume, 0, 1, 0.01, function (v) { c.volume = v; })]));
      }
      if (k === 'trans') {
        var tr = self.trackOf(c), ttype = tr ? tr.type : 'video';
        var rows3 = [];
        [['tIn', 'In', 'in'], ['tOut', 'Out', 'out']].forEach(function (e) {
          var T = c[e[0]];
          if (!T) return;
          var sel = el('select', { class: 'nle-select' });
          Object.keys(TRANSITIONS).forEach(function (key) {
            if (!!TRANSITIONS[key].audio !== (ttype === 'audio')) return;
            sel.append(el('option', { value: key, selected: key === T.type, text: TRANSITIONS[key].name }));
          });
          sel.addEventListener('change', function () { self.saveUndo(); T.type = sel.value; self.changed({ inspector: false }); });
          var hl = self.selTrans && self.selTrans.clip === c.id && self.selTrans.edge === e[2];
          rows3.push(el('div', { class: 'nle-field' + (hl ? ' hl' : '') }, el('span', { class: 'nle-flabel', text: e[1] }), sel,
            ibtn('close', 'Remove transition', function () { self.saveUndo(); c[e[0]] = null; self.selTrans = null; self.changed(); }, 'sm')));
          rows3.push(self._slider('Duration', T.dur, 1 / self.fps * 2, Math.max(1, Math.min(10, c.dur * (e[2] === 'in' ? 2 : 1))), 1 / self.fps, function (v) { T.dur = self.fr(v); }));
        });
        if (rows3.length || tsel) b.append(self._section('Transitions', rows3.length ? rows3 : [el('div', { class: 'nle-insp-note', text: 'No transitions.' })]));
      }
    });
  };

  /* ============================================================== TIMELINE */
  P._buildTimeline = function () {
    var self = this;
    var p = el('section', { class: 'nle-panel nle-tlp', 'aria-label': 'Timeline' });
    var tools = {};
    var toolBtn = function (name, ic, title) {
      var b = ibtn(ic, title, function () { self.setTool(name); });
      tools[name] = b; return b;
    };
    this.ui.tools = tools;
    this.ui.snapBtn = ibtn('magnet', 'Snapping (N)', function () { self.snap = !self.snap; self._syncToolbar(); });
    this.ui.linkBtn = ibtn('link', 'Linked selection', function () { self.linkedSel = !self.linkedSel; self._syncToolbar(); });
    this.ui.lockBtn = ibtn('lock', 'Position lock', function () { self.posLock = !self.posLock; self._syncToolbar(); });
    this.ui.zoomR = el('input', { type: 'range', class: 'nle-zoomr', min: 0, max: 1000, value: 300, title: 'Timeline zoom', oninput: function () { self.setZoom(self._zoomFromSlider(+this.value)); } });
    this.ui.volBtn = ibtn('volume', 'Mute timeline audio', function () { self.masterMute = !self.masterMute; self.ui.volBtn.replaceChildren(icon(self.masterMute ? 'muted' : 'volume')); self.ui.volBtn.classList.toggle('on', self.masterMute); self._syncAudio(); });
    var tb = el('div', { class: 'nle-tltb' },
      el('div', { class: 'nle-tlg' },
        this.allow.addTracks ? ibtn('plain_plus', 'Add track', function (e) { var r = e.currentTarget.getBoundingClientRect(); self._addTrackMenu(r.left, r.bottom); }) : null,
        ibtn('audio', 'Toggle audio waveforms', function () { self.root.classList.toggle('nle-nowave'); })),
      el('span', { class: 'nle-sp' }),
      el('div', { class: 'nle-tlg' }, toolBtn('select', 'pointer', 'Selection mode (A)'), this.level > 1 ? toolBtn('trim', 'trimtool', 'Trim edit mode (T) — ripple trims and slips') : null, this.level > 1 ? toolBtn('blade', 'blade', 'Blade edit mode (B)') : null),
      el('span', { class: 'nle-tsep' }),
      this.level > 1 ? el('div', { class: 'nle-tlg' },
        ibtn('insert', 'Insert clip at playhead (F9)', function () { self.editFromPool('insert'); }),
        ibtn('overwrite', 'Overwrite clip at playhead (F10)', function () { self.editFromPool('overwrite'); }),
        ibtn('replace', 'Replace clip at playhead (F11)', function () { self.editFromPool('replace'); })) : null,
      el('span', { class: 'nle-tsep' }),
      el('div', { class: 'nle-tlg' }, this.ui.snapBtn, this.level > 1 ? this.ui.linkBtn : null, this.level > 1 ? this.ui.lockBtn : null),
      el('span', { class: 'nle-tsep' }),
      el('div', { class: 'nle-tlg' },
        ibtn('flag', 'Flag selected clips', function () { self.toggleFlag(); }, 'blue'), ibtn('down', 'Flag color', null, 'dim sm'),
        ibtn('marker', 'Add marker at playhead (M)', function () { self.addMarker(); }, 'blue'), ibtn('down', 'Marker color', null, 'dim sm')),
      el('span', { class: 'nle-tsep' }),
      el('div', { class: 'nle-tlg' },
        ibtn('zoomt', 'Zoom to fit (Shift+Z)', function () { self.zoomToFit(); }), ibtn('down', 'Zoom options', null, 'dim sm'),
        ibtn('minus', 'Zoom out (−)', function () { self.setZoom(self.zoom / 1.5); }, 'sm'),
        this.ui.zoomR,
        ibtn('plus', 'Zoom in (=)', function () { self.setZoom(self.zoom * 1.5); }, 'sm')),
      el('span', { class: 'nle-sp' }),
      el('div', { class: 'nle-tlg' }, this.ui.volBtn, el('span', { class: 'nle-meter' }, el('i'), el('i'))));

    this.ui.tlScroll = el('div', { class: 'nle-tl-scroll' });
    this.ui.tlInner = el('div', { class: 'nle-tl-inner' });
    this.ui.tlScroll.append(this.ui.tlInner);
    p.append(tb, this.ui.tlScroll);

    var inner = this.ui.tlInner;
    inner.addEventListener('pointerdown', function (e) { self._tlDown(e); });
    inner.addEventListener('pointermove', function (e) { self._tlHover(e); });
    inner.addEventListener('pointerleave', function () { if (self.ui.bladeLine) self.ui.bladeLine.hidden = true; });
    inner.addEventListener('contextmenu', function (e) { self._tlContext(e); });
    inner.addEventListener('dblclick', function (e) {
      var nm = e.target.closest('.nle-th-name');
      if (nm) { var tr = self.trackById(nm.closest('.nle-th').dataset.track); var n = prompt('Track name', self.trackName(tr)); if (n != null) { self.saveUndo(); tr.name = n; self.changed(); } }
    });
    this.ui.tlScroll.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        var f = Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0025));
        self.setZoom(self.zoom * f, e.clientX);
      }
    }, { passive: false });
    this._syncToolbar();
    return p;
  };
  P._zoomFromSlider = function (v) { return 3 * Math.pow(800 / 3, v / 1000); };
  P._sliderFromZoom = function (z) { return Math.round(1000 * Math.log(z / 3) / Math.log(800 / 3)); };
  P.setTool = function (t) { this.tool = t; this._syncToolbar(); this.renderTimeline(); };
  P._syncToolbar = function () {
    var self = this;
    Object.keys(this.ui.tools).forEach(function (k) { self.ui.tools[k].classList.toggle('on', self.tool === k); });
    this.ui.snapBtn.classList.toggle('on', this.snap);
    this.ui.linkBtn.classList.toggle('on', this.linkedSel);
    this.ui.lockBtn.classList.toggle('on', this.posLock);
    this.ui.lockBtn.replaceChildren(icon(this.posLock ? 'lock' : 'unlock'));
    this.root.dataset.tool = this.tool;
    this._scheduleChecks();
  };

  P.laneWidth = function () { return Math.max(100, this.ui.tlScroll.clientWidth - this.headerW); };
  P.zoomToFit = function () {
    var d = Math.max(this.duration(), 10);
    this.setZoom((this.laneWidth() - 30) / d);
    this.ui.tlScroll.scrollLeft = 0;
  };
  P.setZoom = function (z, anchorX) {
    var sc = this.ui.tlScroll, r = sc.getBoundingClientRect();
    z = clamp(z, 3, 800);
    var off, t;
    if (anchorX != null) { off = anchorX - r.left - this.headerW; t = (off + sc.scrollLeft) / this.zoom; }
    else {
      var px = this.playhead * this.zoom - sc.scrollLeft;
      if (px >= 0 && px <= this.laneWidth()) { off = px; t = this.playhead; } else { off = 0; t = sc.scrollLeft / this.zoom; }
    }
    this.zoom = z;
    this.ui.zoomR.value = this._sliderFromZoom(z);
    this.renderTimeline();
    sc.scrollLeft = Math.max(0, t * z - off);
    this._scheduleChecks();
  };

  // Textbook form controls use the same timeline state and undo path as pointer edits.
  P.moveClipTo = function (id, label, seconds) {
    var c = this.clipById(id), dst = this.tracks.find(function (tr) { return this.trackLabel(tr) === label; }, this);
    if (!c || !dst || dst.locked || !Number.isFinite(seconds) || seconds < 0) return false;
    var src = this.trackOf(c);
    if (src.locked || dst.type !== src.type) return false;
    var n = this.fr(seconds), delta = n - c.start, self = this;
    var group = this.linkedSel ? this.linked(c) : [c];
    if (group.some(function (x) { return self.trackOf(x).locked || x.start + delta < 0; })) return false;
    this.saveUndo();
    group.forEach(function (x) {
      var old = self.trackOf(x), tr = x === c ? dst : old;
      old.clips = old.clips.filter(function (clip) { return clip !== x; });
      x.start = self.fr(x.start + delta);
      self.overwriteRange(tr, x.start, self.end(x));
      tr.clips.push(x);
      self.sortTrack(tr);
    });
    this.changed();
    return true;
  };
  P.trimClipTo = function (id, edge, sourceTime) {
    var c = this.clipById(id), self = this;
    if (!c || !Number.isFinite(sourceTime) || sourceTime < 0) return false;
    var ripple = this.tool === 'trim', group = this.linkedSel ? this.linked(c) : [c];
    var d = this.fr(sourceTime - c.srcIn - (edge === 'r' ? c.dur : 0));
    var targets = group.map(function (x) { return { clip: x, track: self.trackOf(x), limits: self._trimLimits(x, edge, ripple) }; });
    if (targets.some(function (x) { return x.track.locked || d < x.limits.min - self.EPS || d > x.limits.max + self.EPS; })) return false;
    this.saveUndo();
    targets.forEach(function (x) {
      var clip = x.clip, oldEnd = self.end(clip);
      if (ripple) x.track.clips.forEach(function (y) { if (y !== clip && y.start >= oldEnd - self.EPS) y.start += edge === 'r' ? d : -d; });
      if (edge === 'r') clip.dur += d;
      else { clip.srcIn += d; clip.dur -= d; if (!ripple) clip.start += d; }
      self.sortTrack(x.track);
    });
    this.changed();
    return true;
  };
  P.setSelectionLink = function (ids, linked) {
    var clips = ids.map(this.clipById.bind(this)).filter(Boolean), self = this;
    if (linked ? clips.length !== 2 || clips[0].kind === clips[1].kind : !clips.length) return false;
    if (clips.some(function (c) { return self.trackOf(c).locked; })) return false;
    this.saveUndo();
    if (linked) {
      var groupId = uid('L');
      clips.forEach(function (c) { c.link = groupId; });
    } else {
      clips.forEach(function (c) { self.linked(c).forEach(function (x) { x.link = null; }); });
    }
    this.changed();
    return true;
  };

  P._majorStep = function () {
    var cands = [1 / this.fps, 2 / this.fps, 4 / this.fps, 6 / this.fps, 12 / this.fps, 1, 2, 4, 8, 16, 32, 60, 120, 300, 600];
    for (var i = 0; i < cands.length; i++) if (cands[i] * this.zoom >= 96) return cands[i];
    return 600;
  };

  P.renderTimeline = function () {
    var self = this, inner = this.ui.tlInner;
    if (!inner) return;
    var H = this.headerW, z = this.zoom;
    var contentDur = Math.max(this.duration() + 30, (this.laneWidth() + 50) / z);
    var W = Math.ceil(contentDur * z);
    var major = this._majorStep(), majPx = major * z;
    var sub = majPx / 8 >= 9 ? 8 : majPx / 4 >= 8 ? 4 : 2;
    inner.textContent = '';
    inner.style.width = (H + W) + 'px';
    inner.style.setProperty('--maj', majPx + 'px');
    inner.style.setProperty('--min', (majPx / sub) + 'px');
    inner.style.setProperty('--hw', H + 'px');
    this.laneEls = new Map();

    // ruler row
    this.ui.tcBig = el('div', { class: 'nle-tcbig', title: 'Playhead timecode' });
    var ruler = el('div', { class: 'nle-ruler', style: { width: W + 'px' } });
    for (var t = 0, n = 0; t <= contentDur && n < 4000; t += major, n++) {
      ruler.append(el('span', { class: 'nle-rlab', style: { left: (t * z) + 'px' }, text: tc(t, this.fps) }));
    }
    if (this.inPt != null || this.outPt != null) {
      var a = this.inPt == null ? 0 : this.inPt, b = this.outPt == null ? this.duration() : this.outPt;
      ruler.append(el('div', { class: 'nle-inout', style: { left: (a * z) + 'px', width: Math.max(0, (b - a) * z) + 'px' } }));
    }
    this.markers.forEach(function (mk) {
      ruler.append(el('div', { class: 'nle-mark' + (self.selMarker === mk.id ? ' sel' : ''), 'data-marker': mk.id, style: { left: (mk.t * z) + 'px' }, title: 'Marker ' + tc(mk.t, self.fps) + ' — drag to move, Delete to remove' }));
    });
    this.ui.rulerHead = el('div', { class: 'nle-rhead' });
    ruler.append(this.ui.rulerHead);
    this.ui.ruler = ruler;
    inner.append(el('div', { class: 'nle-row nle-rrow' }, el('div', { class: 'nle-corner' }, this.ui.tcBig), ruler));

    // video drop zone (new track)
    var dragType = this.dragging ? (this.dragging.trackType || null) : null;
    var vz = el('div', { class: 'nle-lane nle-zone' + (dragType === 'video' ? ' live' : ''), style: { width: W + 'px' } }, dragType === 'video' && this.allow.addTracks ? el('span', { class: 'nle-zone-tip', text: 'Drop here to add a new video track' }) : null);
    inner.append(el('div', { class: 'nle-row nle-zrow' + (dragType === 'video' ? ' live' : '') }, el('div', { class: 'nle-th nle-th-zone' }), vz));
    this.ui.vZone = vz;

    var vt = this.vTracks().slice().reverse(), at = this.aTracks();
    vt.forEach(function (tr) { inner.append(self._trackRow(tr, W)); });
    inner.append(el('div', { class: 'nle-row nle-divider' }, el('div', { class: 'nle-th nle-th-div' }), el('div', { class: 'nle-lane-div', style: { width: W + 'px' } })));
    at.forEach(function (tr) { inner.append(self._trackRow(tr, W)); });
    var az = el('div', { class: 'nle-lane nle-zone nle-afill' + (dragType === 'audio' ? ' live' : ''), style: { width: W + 'px' } }, dragType === 'audio' && this.allow.addTracks ? el('span', { class: 'nle-zone-tip', text: 'Drop here to add a new audio track' }) : null);
    inner.append(el('div', { class: 'nle-row nle-fill' }, el('div', { class: 'nle-th nle-th-fill' }), az));
    this.ui.aZone = az;

    this.ui.playLine = el('div', { class: 'nle-pline' });
    this.ui.snapLine = el('div', { class: 'nle-snapline', hidden: true });
    this.ui.bladeLine = el('div', { class: 'nle-bladeline', hidden: true });
    inner.append(this.ui.playLine, this.ui.snapLine, this.ui.bladeLine);
    this._updatePlayheadUI();
    this._drawSnap();
    this._updateTimecodes();
  };

  P._trackRow = function (tr, W) {
    var self = this, label = this.trackLabel(tr), isV = tr.type === 'video';
    var vIdx = this.vTracks().indexOf(tr);
    var count = tr.clips.length;
    var hdr = el('div', { class: 'nle-th' + (tr.locked ? ' locked' : ''), 'data-track': tr.id, style: { height: tr.h + 'px' } },
      el('div', { class: 'nle-th-top' },
        el('button', { type: 'button', class: 'nle-th-id' + (isV && vIdx === this.targetV ? ' target' : ''), title: isV ? 'Destination track for Insert / Overwrite edits' : label, 'data-act': 'target', text: label }),
        el('span', { class: 'nle-th-name nle-ell', title: 'Double-click to rename', text: this.trackName(tr) }),
        isV ? null : el('span', { class: 'nle-th-ch', text: '2.0' })),
      el('div', { class: 'nle-th-btm' },
        el('span', { class: 'nle-th-count', text: count + (count === 1 ? ' Clip' : ' Clips') }),
        el('span', { class: 'nle-sp' }),
        el('button', { type: 'button', class: 'nle-tbn' + (tr.locked ? ' on' : ''), 'data-act': 'lock', title: tr.locked ? 'Unlock track' : 'Lock track' }, icon(tr.locked ? 'lock' : 'unlock')),
        isV ? el('button', { type: 'button', class: 'nle-tbn' + (tr.enabled ? '' : ' off'), 'data-act': 'enable', title: tr.enabled ? 'Disable video track' : 'Enable video track' }, icon('monitor')) : null,
        isV ? null : el('button', { type: 'button', class: 'nle-tbn txt' + (tr.solo ? ' solo' : ''), 'data-act': 'solo', title: 'Solo', text: 'S' }),
        isV ? null : el('button', { type: 'button', class: 'nle-tbn txt' + (tr.muted ? ' mute' : ''), 'data-act': 'mute', title: 'Mute', text: 'M' })),
      el('div', { class: 'nle-th-rs', 'data-act': 'resize', title: 'Drag to change track height' }));
    var lane = el('div', { class: 'nle-lane ' + (isV ? 'v' : 'a') + (tr.locked ? ' locked' : '') + (isV && !tr.enabled ? ' disabled' : ''), 'data-track': tr.id, style: { width: W + 'px', height: tr.h + 'px' } });
    this.laneEls.set(tr.id, lane);
    var z = this.zoom;
    tr.clips.forEach(function (c) { lane.append(self._clipEl(c, tr)); });
    // transitions
    var tw = this._trackWindows(tr), E = this.EPS;
    tr.clips.forEach(function (c) {
      [['tIn', 'in'], ['tOut', 'out']].forEach(function (e) {
        var T = c[e[0]]; if (!T) return;
        var a, b, adj = false;
        if (e[1] === 'in') {
          var prev = tr.clips.filter(function (p) { return p !== c && !p.disabled && Math.abs(self.end(p) - c.start) < E; })[0];
          if (prev && !c.disabled) { var d = Math.min(T.dur, c.dur * 2, prev.dur * 2); a = c.start - d / 2; b = c.start + d / 2; adj = true; }
          else { a = c.start; b = c.start + Math.min(T.dur, c.dur); }
        } else { b = self.end(c); a = b - Math.min(T.dur, c.dur); }
        var sel = self.selTrans && self.selTrans.clip === c.id && self.selTrans.edge === e[1];
        lane.append(el('div', { class: 'nle-trans' + (sel ? ' sel' : '') + (adj ? ' adj' : ''), 'data-clip': c.id, 'data-edge': e[1], title: TRANSITIONS[T.type].name + ' — click to select, drag edges to change length', style: { left: (a * z) + 'px', width: Math.max(6, (b - a) * z) + 'px' } },
          el('span', { class: 'nle-trans-l', 'data-h': 'l' }), (b - a) * z > 60 ? el('span', { class: 'nle-trans-name nle-ell', text: TRANSITIONS[T.type].name }) : null, el('span', { class: 'nle-trans-r', 'data-h': 'r' })));
      });
    });
    if (this.selGap && this.selGap.track === tr.id) {
      lane.append(el('div', { class: 'nle-gap', style: { left: (this.selGap.a * z) + 'px', width: ((this.selGap.b - this.selGap.a) * z) + 'px' } }, el('span', { text: 'Gap — press Delete to close' })));
    }
    return el('div', { class: 'nle-row nle-trow t-' + tr.type }, hdr, lane);
  };

  P._clipEl = function (c, tr) {
    var z = this.zoom, w = c.dur * z, m = c.mediaId ? this.mediaById(c.mediaId) : null;
    var cls = 'nle-clip k-' + c.kind + (this.sel.has(c.id) ? ' sel' : '') + (c.disabled ? ' disabled' : '') + (m && m.offline ? ' offline' : '') + (w < 18 ? ' tiny' : '');
    var d = el('div', { class: cls, 'data-id': c.id, style: { left: (c.start * z) + 'px', width: Math.max(2, w) + 'px' } });
    if (c.color) d.style.setProperty('--clip', c.color);
    var label = el('div', { class: 'nle-clip-label' });
    if (c.flag) label.append(el('span', { class: 'nle-clip-flag' }, icon('flag')));
    if (c.link) label.append(el('span', { class: 'nle-clip-link' }, icon('link')));
    if (c.filters.length) label.append(el('span', { class: 'nle-clip-fx', text: 'fx' }));
    label.append(el('span', { class: 'nle-ell', text: c.name }));
    d.append(label);
    if (c.kind === 'audio') d.append(this._wave(c, m, w, tr.h - 18));
    else {
      var body = el('div', { class: 'nle-clip-body' });
      if (m && m.thumb && !m.offline) {
        body.style.backgroundImage = 'url("' + m.thumb + '")';
        var th = tr.h - 18, tw = th * (m.width && m.height ? m.width / m.height : 16 / 9);
        body.style.backgroundSize = tw + 'px ' + th + 'px';
      } else if (c.kind === 'generator') {
        var g = GENERATORS[c.key] || {}; body.style.background = g.bg || (c.props && c.props.color);
        body.classList.add('gen');
      } else if (c.kind === 'title') {
        body.append(el('span', { class: 'nle-clip-ttl nle-ell', text: (c.props && c.props.text || '').split('\n')[0] }));
      }
      d.append(body);
    }
    if (w >= 10) d.append(el('div', { class: 'nle-trim nle-trim-l', title: 'Drag to trim' }), el('div', { class: 'nle-trim nle-trim-r', title: 'Drag to trim' }));
    return d;
  };
  P._wave = function (c, m, w, h) {
    var s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('class', 'nle-wave');
    s.setAttribute('preserveAspectRatio', 'none');
    var cols = Math.max(2, Math.min(600, Math.floor(w / 3)));
    s.setAttribute('viewBox', '0 0 ' + cols + ' 100');
    var pts = [], peaks;
    if (m && m.peaks) {
      peaks = [];
      for (var i = 0; i < cols; i++) {
        var t = c.srcIn + (i / cols) * c.dur;
        peaks.push(m.peaks[Math.min(m.peaks.length - 1, Math.floor(t * m.peakRate))] || 0);
      }
    } else peaks = pseudoWave((m ? m.id : c.id) + Math.round(c.srcIn * 10), cols);
    var top = peaks.map(function (v, i) { return i + ',' + (50 - v * 46 * c.volume); });
    var bot = peaks.map(function (v, i) { return i + ',' + (50 + v * 46 * c.volume); }).reverse();
    var poly = document.createElementNS(SVGNS, 'polygon');
    poly.setAttribute('points', top.concat(bot).join(' '));
    s.append(poly);
    return s;
  };

  /* ------------------------------------------------ playhead + timecodes */
  P._updatePlayheadUI = function () {
    var x = this.playhead * this.zoom;
    if (this.ui.playLine) this.ui.playLine.style.left = (this.headerW + x) + 'px';
    if (this.ui.rulerHead) this.ui.rulerHead.style.left = x + 'px';
    var d = Math.max(this.duration(), 1);
    if (this.ui.scrubHead) this.ui.scrubHead.style.left = 'calc(8px + (100% - 16px) * ' + clamp(this.playhead / d, 0, 1) + ')';
    if (this.ui.scrubRange) {
      var show = this.inPt != null || this.outPt != null;
      this.ui.scrubRange.hidden = !show;
      if (show) {
        var a = this.inPt == null ? 0 : this.inPt, b = this.outPt == null ? d : this.outPt;
        this.ui.scrubRange.style.left = 'calc(8px + (100% - 16px) * ' + clamp(a / d, 0, 1) + ')';
        this.ui.scrubRange.style.width = 'calc((100% - 16px) * ' + clamp((b - a) / d, 0, 1) + ')';
      }
    }
  };
  P._updateTimecodes = function () {
    var cur = tc(this.playhead, this.fps);
    if (this.ui.tcBig) this.ui.tcBig.textContent = cur;
    if (this.ui.curTC) this.ui.curTC.textContent = cur;
    if (this.ui.durTC) this.ui.durTC.textContent = tc(this.duration(), this.fps, 0);
  };
  P.setPlayhead = function (t, fromPlayback) {
    this.playhead = Math.max(0, t);
    this._updatePlayheadUI();
    this._updateTimecodes();
    this.renderViewer();
    if (!fromPlayback) this._scheduleChecks();
    // keep the playhead in view
    var sc = this.ui.tlScroll, x = this.playhead * this.zoom, lw = this.laneWidth();
    if (fromPlayback) {
      if (x > sc.scrollLeft + lw - 30) sc.scrollLeft = x - 40;
      else if (x < sc.scrollLeft) sc.scrollLeft = Math.max(0, x - lw + 60);
    }
  };
  P.stepFrames = function (n) { this.stop(); this.setPlayhead(this.fr(this.playhead + n / this.fps)); this._ensureVisible(); };
  P._ensureVisible = function () {
    var sc = this.ui.tlScroll, x = this.playhead * this.zoom, lw = this.laneWidth();
    if (x < sc.scrollLeft || x > sc.scrollLeft + lw - 20) sc.scrollLeft = Math.max(0, x - lw / 2);
  };
  P.editPoints = function () {
    var pts = [0], self = this;
    this.allClips().forEach(function (c) { pts.push(c.start, self.end(c)); });
    return pts.map(function (p) { return self.fr(p); }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
  };
  P.jumpEdit = function (dir) {
    var pts = this.editPoints(), t = this.playhead, E = this.EPS, target = null;
    if (dir > 0) { for (var i = 0; i < pts.length; i++) if (pts[i] > t + E) { target = pts[i]; break; } }
    else { for (var j = pts.length - 1; j >= 0; j--) if (pts[j] < t - E) { target = pts[j]; break; } }
    if (target != null) { this.stop(); this.setPlayhead(target); this._ensureVisible(); }
  };

  /* -------------------------------------------------------------- playback */
  P.play = function (rate) {
    var self = this;
    if (rate == null) rate = 1;
    if (this.playing && Math.sign(rate) === Math.sign(this.rate)) rate = clamp(this.rate * 2, -8, 8);
    var end = this.duration();
    var lo = this.loop && this.inPt != null ? this.inPt : 0, hi = this.loop && this.outPt != null ? this.outPt : end;
    if (rate > 0 && this.playhead >= hi - this.EPS) this.setPlayhead(lo);
    this.rate = rate;
    if (this.playing) { this._updatePlayBtn(); return; }
    this.playing = true;
    this._updatePlayBtn();
    var last = performance.now();
    var tick = function (now) {
      if (!self.playing) return;
      var dt = (now - last) / 1000; last = now;
      var e = self.duration();
      var lo2 = self.loop && self.inPt != null ? self.inPt : 0, hi2 = self.loop && self.outPt != null ? self.outPt : e;
      var t = self.playhead + dt * self.rate;
      if (self.rate > 0 && t >= hi2) { if (self.loop && hi2 > lo2) t = lo2; else { self.setPlayhead(hi2, true); self.stop(); return; } }
      if (self.rate < 0 && t <= lo2) { if (self.loop && hi2 > lo2) t = hi2; else { self.setPlayhead(lo2, true); self.stop(); return; } }
      self.setPlayhead(t, true);
      self._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  };
  P.stop = function () {
    if (!this.playing) return;
    this.playing = false; this.rate = 0;
    cancelAnimationFrame(this._raf);
    this.playhead = this.fr(this.playhead);
    this._updatePlayBtn();
    this.renderViewer();
    this._updatePlayheadUI(); this._updateTimecodes();
    this._scheduleChecks();
  };
  P.togglePlay = function () { if (this.playing) this.stop(); else this.play(1); };
  P._updatePlayBtn = function () {
    if (!this.ui.playBtn) return;
    this.ui.playBtn.replaceChildren(icon(this.playing && this.rate > 0 ? 'pause' : 'play'));
    this.ui.playBtn.classList.toggle('on', this.playing && this.rate > 0);
    this.root.classList.toggle('nle-playing', this.playing);
  };
  P.markIn = function () { this.saveUndo(); this.inPt = this.fr(this.playhead); if (this.outPt != null && this.outPt <= this.inPt) this.outPt = null; this.changed(); };
  P.markOut = function () { this.saveUndo(); this.outPt = this.fr(this.playhead); if (this.inPt != null && this.inPt >= this.outPt) this.inPt = null; this.changed(); };

  /* ------------------------------------------------- selection + editing */
  P._selClips = function () {
    var self = this, out = [];
    this.sel.forEach(function (id) { var c = self.clipById(id); if (c) out.push(c); });
    return out;
  };
  P.select = function (c, additive) {
    if (!additive) this.sel.clear();
    this.selTrans = null; this.selGap = null; this.selMarker = null;
    var self = this;
    var group = this.linkedSel ? this.linked(c) : [c];
    if (additive && this.sel.has(c.id)) group.forEach(function (x) { self.sel.delete(x.id); });
    else group.forEach(function (x) { self.sel.add(x.id); });
    this._scheduleChecks();
  };
  P.clearSel = function () { this.sel.clear(); this.selTrans = null; this.selGap = null; this.selMarker = null; };
  P.deleteSelection = function (ripple) {
    var self = this;
    if (this.selMarker) {
      this.saveUndo();
      this.markers = this.markers.filter(function (m) { return m.id !== self.selMarker; });
      this.selMarker = null; this.changed(); return;
    }
    if (this.selTrans) {
      var c = this.clipById(this.selTrans.clip);
      if (c) { this.saveUndo(); c[this.selTrans.edge === 'in' ? 'tIn' : 'tOut'] = null; }
      this.selTrans = null; this.changed(); return;
    }
    if (this.selGap) {
      var g = this.selGap, tr = this.trackById(g.track);
      if (tr && !tr.locked) {
        this.saveUndo();
        var len = g.b - g.a;
        tr.clips.forEach(function (x) { if (x.start >= g.b - self.EPS) x.start = self.fr(x.start - len); });
      }
      this.selGap = null; this.changed(); return;
    }
    var clips = this._selClips().filter(function (x) { return !self.trackOf(x).locked; });
    if (!clips.length) return;
    this.saveUndo();
    var byTrack = new Map();
    clips.forEach(function (x) { var tr = self.trackOf(x); if (!byTrack.has(tr)) byTrack.set(tr, []); byTrack.get(tr).push(x); });
    byTrack.forEach(function (list, tr) {
      tr.clips = tr.clips.filter(function (x) { return list.indexOf(x) < 0; });
      if (ripple) {
        tr.clips.forEach(function (x) {
          var shift = 0;
          list.forEach(function (r) { if (r.start < x.start + self.EPS) shift += r.dur; });
          x.start = self.fr(Math.max(0, x.start - shift));
        });
      }
    });
    this.sel.clear();
    this.changed();
  };
  P.splitAtPlayhead = function () {
    var t = this.fr(this.playhead), self = this;
    var clips = this._selClips();
    var spanning = function (c) { return c.start < t - self.EPS && self.end(c) > t + self.EPS && !self.trackOf(c).locked; };
    var targets = clips.length ? clips.filter(spanning) : this.allClips().filter(spanning);
    if (!targets.length) { this.toast('Move the playhead over a clip to split it'); return; }
    this.saveUndo();
    this.splitMany(targets, t);
    this.changed();
  };
  P.toggleFlag = function () {
    var clips = this._selClips();
    if (!clips.length) { this.toast('Select a clip to flag it'); return; }
    this.saveUndo();
    var on = !clips[0].flag;
    clips.forEach(function (c) { c.flag = on ? 'blue' : null; });
    this.changed();
  };
  P.addMarker = function () {
    var t = this.fr(this.playhead);
    if (this.markers.some(function (m) { return Math.abs(m.t - t) < 1e-6; })) return;
    this.saveUndo();
    this.markers.push({ id: uid('k'), t: t });
    this.changed();
  };
  P.toggleDisable = function () {
    var clips = this._selClips(); if (!clips.length) return;
    this.saveUndo();
    var off = !clips[0].disabled;
    clips.forEach(function (c) { c.disabled = off; });
    this.changed();
  };
  P.copy = function () {
    var clips = this._selClips(), self = this;
    if (!clips.length) return;
    var t0 = Math.min.apply(null, clips.map(function (c) { return c.start; }));
    this.clipboard = clips.map(function (c) {
      var tr = self.trackOf(c), list = tr.type === 'video' ? self.vTracks() : self.aTracks();
      return { data: clone(c), type: tr.type, idx: list.indexOf(tr), off: c.start - t0 };
    });
    this.toast(clips.length + (clips.length === 1 ? ' clip' : ' clips') + ' copied');
  };
  P.paste = function () {
    if (!this.clipboard) return;
    var self = this, t = this.fr(this.playhead), linkMap = {}, maxEnd = t;
    this.saveUndo();
    this.sel.clear();
    this.clipboard.forEach(function (it) {
      var list = it.type === 'video' ? self.vTracks() : self.aTracks();
      while (list.length <= it.idx) { self.addTrack(it.type); list = it.type === 'video' ? self.vTracks() : self.aTracks(); }
      var tr = list[it.idx], c = clone(it.data);
      c.id = uid('c'); c.start = self.fr(t + it.off);
      if (c.link) c.link = linkMap[c.link] || (linkMap[c.link] = uid('L'));
      self.overwriteRange(tr, c.start, self.end(c));
      tr.clips.push(c); self.sortTrack(tr); self.sel.add(c.id);
      maxEnd = Math.max(maxEnd, self.end(c));
    });
    this.playhead = this.fr(maxEnd);
    this.changed();
  };
  P._addFilter = function (c, key) {
    var d = FILTERS[key];
    if (d.fixed && c.filters.some(function (f) { return f.type === key; })) return;
    c.filters.push({ type: key, amount: d.def == null ? 1 : d.def });
  };
  P._addTransition = function (c, edge, key) {
    var tr = this.trackOf(c), self = this;
    if (edge === 'out') {
      var next = tr.clips.filter(function (n) { return n !== c && Math.abs(n.start - self.end(c)) < self.EPS; })[0];
      if (next) { c = next; edge = 'in'; }
    }
    var dur = this.fr(Math.min(1, c.dur));
    c[edge === 'in' ? 'tIn' : 'tOut'] = { type: key, dur: dur };
    this.clearSel();
    this.selTrans = { clip: c.id, edge: edge };
  };
  P.setClipTransition = function (id, edge, key) {
    var clip = this.clipById(id), effect = TRANSITIONS[key];
    if (this.level < 2 || !clip || !effect || this.trackOf(clip).locked) return false;
    if ((clip.kind === 'audio') !== !!effect.audio || (!effect.audio && this.level !== 3)) return false;
    this.saveUndo();
    this._addTransition(clip, edge, key);
    this.changed();
    return true;
  };

  /* --- edits from the pool / viewer overlay: insert, overwrite, replace, top, append */
  P.editFromPool = function (op) {
    var m = this.poolSel ? this.mediaById(this.poolSel) : null;
    if (!m) { this.toast('Select a clip in the Media Pool first'); return; }
    this.editOp(op, { type: 'media', media: m });
  };
  P.editOp = function (op, payload) {
    var self = this, c = this.clipFromPayload(payload);
    if (!c) return;
    var type = payloadTrackType(payload);
    var list = type === 'video' ? this.vTracks() : this.aTracks();
    if (!list.length) list = [this.addTrack(type)];
    var tr = type === 'video' ? list[clamp(this.targetV, 0, list.length - 1)] : list[0];
    var t = this.fr(this.playhead);
    if (tr.locked && op !== 'top') { this.toast(this.trackLabel(tr) + ' is locked'); return; }
    this.saveUndo();
    if (op === 'append') { t = 0; tr.clips.forEach(function (x) { t = Math.max(t, self.end(x)); }); t = this.fr(t); }
    if (op === 'replace') {
      var under = tr.clips.filter(function (x) { return x.start <= t + self.EPS && self.end(x) > t + self.EPS; })[0];
      if (!under) { this.undoStack.pop(); this.toast('Put the playhead over a clip on ' + this.trackLabel(tr) + ' to replace it'); return; }
      c.start = under.start; c.dur = Math.min(under.dur, isFinite(this.mediaLen(c)) ? this.mediaLen(c) : under.dur);
      c.tIn = under.tIn; c.tOut = under.tOut;
      tr.clips = tr.clips.filter(function (x) { return x !== under; });
      tr.clips.push(c); this.sortTrack(tr);
      this.select(c); this.changed();
      return;
    }
    if (op === 'top') {
      var hi = -1;
      list.forEach(function (x, i) { if (x.clips.some(function (k) { return k.start < t + c.dur - self.EPS && self.end(k) > t + self.EPS; })) hi = i; });
      if (hi + 1 >= list.length) { if (!this.allow.addTracks && hi >= 0) { this.undoStack.pop(); this.toast('No free track above'); return; } this.addTrack(type); list = type === 'video' ? this.vTracks() : this.aTracks(); }
      tr = list[hi + 1];
    }
    c.start = t;
    if (op === 'insert') {
      var spanning = tr.clips.filter(function (x) { return x.start < t - self.EPS && self.end(x) > t + self.EPS; });
      this.splitMany(spanning, t);
      tr.clips.forEach(function (x) { if (x.start >= t - self.EPS) x.start = self.fr(x.start + c.dur); });
    } else this.overwriteRange(tr, t, t + c.dur);
    tr.clips.push(c); this.sortTrack(tr);
    this._linkAudio(c, tr, op === 'insert');
    this.select(c);
    this.playhead = this.fr(this.end(c));
    this.changed();
    this._ensureVisible();
  };
  /** Video with sound gets a linked audio clip on the matching A track, like Resolve. */
  P._linkAudio = function (c, vtr, insert) {
    if (c.kind !== 'video') return;
    var m = this.mediaById(c.mediaId);
    if (!m || !m.hasAudio) return;
    var idx = Math.max(0, this.vTracks().indexOf(vtr)), list = this.aTracks(), self = this;
    while (list.length <= idx) { this.addTrack('audio'); list = this.aTracks(); }
    var atr = list[idx];
    var a = this.makeClip('audio', { mediaId: m.id, name: m.name, start: c.start, dur: c.dur, srcIn: c.srcIn });
    var L = uid('L'); c.link = L; a.link = L;
    if (insert) {
      var t = c.start;
      this.splitMany(atr.clips.filter(function (x) { return x.start < t - self.EPS && self.end(x) > t + self.EPS; }), t);
      atr.clips.forEach(function (x) { if (x.start >= t - self.EPS) x.start = self.fr(x.start + c.dur); });
    } else this.overwriteRange(atr, a.start, this.end(a));
    atr.clips.push(a); this.sortTrack(atr);
    return a;
  };

  /* ------------------------------------------------- timeline pointer work */
  P._timeAt = function (clientX) {
    var r = this.ui.tlScroll.getBoundingClientRect();
    return (clientX - r.left - this.headerW + this.ui.tlScroll.scrollLeft) / this.zoom;
  };
  P._hitTrack = function (x, y) {
    var r = this.ui.tlScroll.getBoundingClientRect();
    if (x < r.left + this.headerW - 4 || x > r.right || y < r.top || y > r.bottom) return null;
    var t = this._timeAt(x), found = null;
    this.laneEls.forEach(function (lane, id) { var lr = lane.getBoundingClientRect(); if (y >= lr.top && y < lr.bottom) found = id; });
    if (found) return { track: this.trackById(found), t: t };
    var vz = this.ui.vZone.getBoundingClientRect();
    if (y < vz.bottom) return { zone: 'video', t: t };
    var az = this.ui.aZone.getBoundingClientRect();
    if (y >= az.top) return { zone: 'audio', t: t };
    return { t: t };
  };
  /** Everything a dragged edge can snap to, labelled so the tooltip can say what it snapped to. */
  P._snapPoints = function (exclude) {
    var pts = [{ t: 0, k: 'start' }, { t: this.playhead, k: 'playhead' }], self = this;
    this.allClips().forEach(function (c) { if (!exclude || !exclude.has(c.id)) pts.push({ t: c.start, k: 'clip edge' }, { t: self.end(c), k: 'clip edge' }); });
    this.markers.forEach(function (m) { pts.push({ t: m.t, k: 'marker' }); });
    if (this.inPt != null) pts.push({ t: this.inPt, k: 'in point' });
    if (this.outPt != null) pts.push({ t: this.outPt, k: 'out point' });
    return pts;
  };
  /** Snap any of `edges` (times) to snap points; returns the delta to add (or 0). The playhead wins ties. */
  P._snapDelta = function (edges, pts) {
    var best = null;
    if (this.snap) {
      var th = 10 / this.zoom;
      edges.forEach(function (e) {
        pts.forEach(function (p) {
          var d = p.t - e, ad = Math.abs(d);
          if (ad >= th) return;
          if (!best || ad < Math.abs(best.d) - 1e-9 || (ad <= Math.abs(best.d) + 1e-9 && p.k === 'playhead')) best = { d: d, t: p.t, k: p.k };
        });
      });
    }
    this._snapP = best ? { t: best.t, k: best.k } : null;
    this._drawSnap();
    return best ? best.d : 0;
  };
  /** Draws the snap indicator from saved state, so it survives timeline re-renders. */
  P._drawSnap = function () {
    var s = this._snapP, line = this.ui.snapLine;
    if (!line) return;
    line.hidden = !s;
    if (s) line.style.left = (this.headerW + s.t * this.zoom) + 'px';
    var onPh = !!s && s.k === 'playhead';
    if (this.ui.playLine) this.ui.playLine.classList.toggle('snapped', onPh);
    if (this.ui.rulerHead) this.ui.rulerHead.classList.toggle('snapped', onPh);
  };
  P._hideSnap = function () { this._snapP = null; this._drawSnap(); };
  P._snapText = function () { return this._snapP ? '   ⇥ ' + this._snapP.k : ''; };
  /**
   * Pointer drag helper. Moves are batched to one per animation frame (no stutter on fast mice),
   * and with { autoscroll: true } the timeline scrolls when the pointer nears its left/right edge.
   */
  P._drag = function (move, up, opts) {
    var self = this, last = null, raf = 0, asRaf = 0, done = false;
    var autoscroll = opts && opts.autoscroll;
    var run = function () { raf = 0; if (last && !done) move(last); };
    var scroll = function () {
      asRaf = 0;
      if (done || !last) return;
      var sc = self.ui.tlScroll, r = sc.getBoundingClientRect(), x = last.clientX, y = last.clientY, v = 0, zone = 50;
      if (y >= r.top - 20 && y <= r.bottom + 20) {
        var L = r.left + self.headerW;
        if (x < L + zone && x > L - 80) v = -Math.min(24, Math.ceil((L + zone - x) / zone * 14));
        else if (x > r.right - zone) v = Math.min(24, Math.ceil((x - (r.right - zone)) / zone * 14));
      }
      if (!v) return;
      var before = sc.scrollLeft;
      sc.scrollLeft = before + v;
      if (sc.scrollLeft !== before) move(last);
      asRaf = requestAnimationFrame(scroll);
    };
    var mv = function (e) {
      last = e;
      if (!raf) raf = requestAnimationFrame(run);
      if (autoscroll && !asRaf) asRaf = requestAnimationFrame(scroll);
    };
    var u = function (e) {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', u); window.removeEventListener('pointercancel', u);
      if (raf) { cancelAnimationFrame(raf); raf = 0; if (last) move(last); }
      done = true;
      if (asRaf) cancelAnimationFrame(asRaf);
      self._hideSnap(); self._hideTip(); up(e);
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', u); window.addEventListener('pointercancel', u);
  };
  /** Find the live DOM for clips, and hide their transition boxes while they're being dragged. */
  P._grabEls = function (clips) {
    var els = {}, inner = this.ui.tlInner;
    clips.forEach(function (c) {
      var n = inner.querySelector('.nle-clip[data-id="' + c.id + '"]');
      if (n) { n.classList.add('moving'); els[c.id] = n; }
      inner.querySelectorAll('.nle-trans[data-clip="' + c.id + '"]').forEach(function (t) { t.hidden = true; });
    });
    return els;
  };
  /** Show the frame at time t in the viewer without moving the playhead (trim/slip preview). */
  P._peek = function (t) {
    var ph = this.playhead;
    this.playhead = Math.max(0, t);
    this.renderViewer();
    this.playhead = ph;
  };
  P._tip = function (x, y, text) {
    if (!this.ui.tip) { this.ui.tip = el('div', { class: 'nle-tip' }); this.root.append(this.ui.tip); }
    var r = this.root.getBoundingClientRect();
    this.ui.tip.hidden = false;
    this.ui.tip.textContent = text;
    this.ui.tip.style.left = (x - r.left + 14) + 'px';
    this.ui.tip.style.top = (y - r.top - 30) + 'px';
  };
  P._hideTip = function () { if (this.ui.tip) this.ui.tip.hidden = true; };
  P._sdur = function (d) { var s = d < 0 ? '−' : '+'; return s + tc(Math.abs(d), this.fps, 0).replace(/^00:/, ''); };

  P._tlDown = function (e) {
    if (e.button !== 0) return;
    var self = this, tgt = e.target;
    var act = tgt.closest('[data-act]');
    if (act && tgt.closest('.nle-th')) { this._headerAct(e, act); return; }
    if (tgt.closest('.nle-th, .nle-corner')) return;
    var mk = tgt.closest('.nle-mark');
    if (mk) { this._markerDrag(e, mk.dataset.marker); return; }
    if (tgt.closest('.nle-rrow')) { this._scrubDrag(e); return; }
    var te = tgt.closest('.nle-trans');
    if (te) { this._transDown(e, te); return; }
    var ce = tgt.closest('.nle-clip');
    var lane = tgt.closest('.nle-lane');
    var tr = lane && lane.dataset.track ? this.trackById(lane.dataset.track) : null;
    if (this.tool === 'blade' && ce) {
      var c0 = this.clipById(ce.dataset.id);
      if (this.trackOf(c0).locked) { this.toast('Track is locked'); return; }
      var tt = this.fr(this._timeAt(e.clientX));
      if (this.snap && Math.abs(tt - this.playhead) * this.zoom < 8) tt = this.fr(this.playhead);
      this.saveUndo();
      var made = this.splitMany(this.linkedSel ? this.linked(c0) : [c0], tt);
      if (!made.length) this.undoStack.pop();
      this.changed();
      return;
    }
    if (ce) {
      var c = this.clipById(ce.dataset.id);
      if (this._isDouble('clip' + c.id)) { this.select(c); this.toggleInspector(true); this.renderTimeline(); return; }
      var additive = e.shiftKey || e.metaKey || e.ctrlKey;
      var wasSel = this.sel.has(c.id);
      if (additive) this.select(c, true);
      else if (!wasSel) this.select(c);
      this.selTrans = null; this.selGap = null; this.selMarker = null;
      this.renderTimeline(); this.renderInspector();
      if (tr.locked) { this.toast(this.trackLabel(tr) + ' is locked — unlock it in the track header'); return; }
      if (additive) return;
      var edge = tgt.classList.contains('nle-trim-l') ? 'l' : tgt.classList.contains('nle-trim-r') ? 'r' : null;
      if (edge) this._trimDrag(e, c, edge, this.tool === 'trim');
      else if (this.tool === 'trim' && isFinite(this.mediaLen(c))) this._slipDrag(e, c);
      else this._moveDrag(e, c, wasSel);
      return;
    }
    // empty space
    this.clearSel();
    if (tr && this.tool !== 'blade') {
      var t = this._timeAt(e.clientX), a = 0, b = Infinity, E = this.EPS;
      tr.clips.forEach(function (x) { if (self.end(x) <= t + E) a = Math.max(a, self.end(x)); if (x.start >= t - E) b = Math.min(b, x.start); });
      if (isFinite(b) && b - a > E) this.selGap = { track: tr.id, a: a, b: b };
    }
    this.renderTimeline(); this.renderInspector();
  };
  /** Our own double-click detection: clicks re-render the DOM, so native dblclick is unreliable. */
  P._isDouble = function (key) {
    var now = performance.now(), last = this._lastDown;
    this._lastDown = { key: key, t: now };
    if (last && last.key === key && now - last.t < 400) { this._lastDown = null; return true; }
    return false;
  };
  P._tlHover = function (e) {
    if (this.tool !== 'blade' || !this.ui.bladeLine) return;
    var ce = e.target.closest('.nle-clip');
    if (!ce) { this.ui.bladeLine.hidden = true; return; }
    var t = this.fr(this._timeAt(e.clientX));
    if (this.snap && Math.abs(t - this.playhead) * this.zoom < 8) t = this.fr(this.playhead);
    var lr = ce.closest('.nle-lane').getBoundingClientRect(), ir = this.ui.tlInner.getBoundingClientRect();
    var bl = this.ui.bladeLine;
    bl.hidden = false;
    bl.style.left = (this.headerW + t * this.zoom) + 'px';
    bl.style.top = (lr.top - ir.top) + 'px';
    bl.style.height = lr.height + 'px';
  };
  P._scrubDrag = function (e) {
    var self = this;
    this.stop();
    var go = function (ev) {
      var t = Math.max(0, self._timeAt(ev.clientX));
      if (self.snap && !ev.shiftKey) {
        var pts = self.editPoints().concat(self.markers.map(function (m) { return m.t; })), th = 6 / self.zoom;
        pts.forEach(function (p) { if (Math.abs(p - t) < th) t = p; });
      }
      self.setPlayhead(self.fr(t));
    };
    go(e);
    this._drag(go, function () { }, { autoscroll: true });
  };
  P._markerDrag = function (e, id) {
    var self = this, mk = this.markers.filter(function (m) { return m.id === id; })[0], sx = e.clientX, t0 = mk.t, moved = false;
    this.clearSel(); this.selMarker = id; this.renderTimeline();
    this._drag(function (ev) {
      if (!moved && Math.abs(ev.clientX - sx) < 3) return;
      if (!moved) { moved = true; self.saveUndo(); }
      mk.t = self.fr(Math.max(0, t0 + (ev.clientX - sx) / self.zoom));
      self.renderTimeline();
    }, function () { if (!moved) { self.stop(); self.setPlayhead(mk.t); } self.changed(); });
  };
  P._headerAct = function (e, act) {
    var self = this, tr = this.trackById(act.closest('.nle-th').dataset.track), a = act.dataset.act;
    if (a === 'resize') {
      var sy = e.clientY, h0 = tr.h;
      e.preventDefault();
      this._drag(function (ev) { tr.h = clamp(h0 + ev.clientY - sy, 30, 160); self.renderTimeline(); }, function () { self._scheduleChecks(); });
      return;
    }
    if (a === 'target') { if (tr.type === 'video') { this.targetV = this.vTracks().indexOf(tr); this.renderTimeline(); } return; }
    this.saveUndo();
    if (a === 'lock') tr.locked = !tr.locked;
    if (a === 'enable') tr.enabled = !tr.enabled;
    if (a === 'mute') tr.muted = !tr.muted;
    if (a === 'solo') tr.solo = !tr.solo;
    this.changed();
  };

  P._moveDrag = function (e, clip, wasSel) {
    var self = this, sx = e.clientX, sy = e.clientY, moved = false, t0 = this._timeAt(e.clientX), els = {};
    var primTr = this.trackOf(clip), type = primTr.type;
    var sel = this._selClips().filter(function (c) { return !self.trackOf(c).locked; });
    var orig = sel.map(function (c) { var tr = self.trackOf(c); var l = tr.type === 'video' ? self.vTracks() : self.aTracks(); return { c: c, start: c.start, tr: tr, type: tr.type, idx: l.indexOf(tr) }; });
    var po = orig.filter(function (o) { return o.c === clip; })[0];
    var ids = new Set(sel.map(function (c) { return c.id; }));
    var pts = this._snapPoints(ids);
    var minStart = Math.min.apply(null, orig.map(function (o) { return o.start; }));
    var created = [];
    this._drag(function (ev) {
      if (!moved && Math.abs(ev.clientX - sx) < 3 && Math.abs(ev.clientY - sy) < 3) return;
      var full = false;
      if (!moved) { moved = true; full = true; self.saveUndo(); self.dragging = { trackType: type }; self.root.classList.add('nle-grabbing'); }
      if (self.posLock) { self._tip(ev.clientX, ev.clientY, 'Position lock is on'); return; }
      var dt = self._timeAt(ev.clientX) - t0;
      dt += self._snapDelta([po.start + dt, po.start + clip.dur + dt], pts);
      if (minStart + dt < 0) dt = -minStart;
      dt = self.fr(po.start + dt) - po.start;
      // vertical move within same track type
      var list = type === 'video' ? self.vTracks() : self.aTracks();
      var hit = self._hitTrack(ev.clientX, ev.clientY), off = 0;
      if (hit && hit.track && hit.track.type === type) off = list.indexOf(hit.track) - po.idx;
      else if (hit && hit.zone === type && self.allow.addTracks) {
        var maxIdx = Math.max.apply(null, orig.filter(function (o) { return o.type === type; }).map(function (o) { return o.idx; }));
        if (maxIdx + (list.length - po.idx) >= list.length && created.length < 4) { created.push(self.addTrack(type)); list = type === 'video' ? self.vTracks() : self.aTracks(); full = true; }
        off = list.length - 1 - po.idx;
      } else if (hit && hit.track) off = self._lastOff || 0;
      var lo = Math.min.apply(null, orig.filter(function (o) { return o.type === type; }).map(function (o) { return o.idx; }));
      var hi = Math.max.apply(null, orig.filter(function (o) { return o.type === type; }).map(function (o) { return o.idx; }));
      off = clamp(off, -lo, list.length - 1 - hi);
      var bad = orig.some(function (o) { return o.type === type && list[o.idx + off].locked; });
      if (bad) off = self._lastOff || 0;
      self._lastOff = off;
      orig.forEach(function (o) {
        o.c.start = o.start + dt;
        var target = o.type === type ? list[o.idx + off] : o.tr;
        var cur = self.trackOf(o.c);
        if (cur !== target) { cur.clips.splice(cur.clips.indexOf(o.c), 1); target.clips.push(o.c); }
      });
      if (!full) full = orig.some(function (o) { return !els[o.c.id] || !els[o.c.id].isConnected; });
      if (full) { self.renderTimeline(); els = self._grabEls(orig.map(function (o) { return o.c; })); }
      else {
        // fast path: only move the dragged clips' elements
        orig.forEach(function (o) {
          var n = els[o.c.id]; if (!n) return;
          n.style.left = (o.c.start * self.zoom) + 'px';
          var lane = self.laneEls.get(self.trackOf(o.c).id);
          if (lane && n.parentNode !== lane) lane.appendChild(n);
        });
      }
      self._tip(ev.clientX, ev.clientY, tc(clip.start, self.fps) + '   ' + self._sdur(dt) + (off ? '  ' + (off > 0 ? '↑' : '↓') + Math.abs(off) : '') + self._snapText());
      self.renderViewer();
    }, function () {
      self.root.classList.remove('nle-grabbing');
      self._lastOff = 0;
      self.dragging = null;
      if (!moved) {
        if (wasSel && self.sel.size > 1) { self.select(clip); self.renderTimeline(); self.renderInspector(); }
        return;
      }
      orig.forEach(function (o) { var tr = self.trackOf(o.c); self.overwriteRange(tr, o.c.start, self.end(o.c), ids); self.sortTrack(tr); });
      created.forEach(function (tr) { if (!tr.clips.length) self.tracks.splice(self.tracks.indexOf(tr), 1); });
      self.changed();
    }, { autoscroll: true });
  };

  P._trimLimits = function (c, edge, ripple) {
    var tr = this.trackOf(c), self = this, len = this.mediaLen(c), f = 1 / this.fps;
    var lim = { min: -Infinity, max: Infinity };
    if (edge === 'r') {
      lim.min = f - c.dur;
      lim.max = isFinite(len) ? len - c.srcIn - c.dur : Infinity;
      if (!ripple) tr.clips.forEach(function (x) { if (x !== c && x.start >= self.end(c) - self.EPS) lim.max = Math.min(lim.max, x.start - self.end(c)); });
    } else {
      lim.max = c.dur - f;
      lim.min = isFinite(len) || c.kind === 'video' ? -c.srcIn : -Infinity;
      if (!ripple) {
        lim.min = Math.max(lim.min, -c.start);
        tr.clips.forEach(function (x) { if (x !== c && self.end(x) <= c.start + self.EPS) lim.min = Math.max(lim.min, self.end(x) - c.start); });
      }
    }
    return lim;
  };
  P._trimDrag = function (e, clip, edge, ripple) {
    var self = this, sx = e.clientX, moved = false;
    var group = (this.linkedSel ? this.linked(clip) : [clip]).filter(function (c) { return !self.trackOf(c).locked; });
    var orig = group.map(function (c) { return { c: c, start: c.start, dur: c.dur, srcIn: c.srcIn, tr: self.trackOf(c) }; });
    var lim = { min: -Infinity, max: Infinity };
    group.forEach(function (c) { var l = self._trimLimits(c, edge, ripple); lim.min = Math.max(lim.min, l.min); lim.max = Math.min(lim.max, l.max); });
    var ids = new Set(group.map(function (c) { return c.id; }));
    var pts = this._snapPoints(ids);
    // ripple: clips after the edit on the same tracks shift
    var after = [];
    if (ripple) orig.forEach(function (o) {
      var editT = o.start + o.dur;
      o.tr.clips.forEach(function (x) { if (!ids.has(x.id) && x.start >= editT - self.EPS) after.push({ c: x, start: x.start }); });
    });
    var po = orig.filter(function (o) { return o.c === clip; })[0];
    var t0 = this._timeAt(sx), els = {};
    this._drag(function (ev) {
      if (!moved && Math.abs(ev.clientX - sx) < 2) return;
      if (!moved) {
        moved = true; self.saveUndo();
        self.root.classList.add('nle-resizing');
        els = self._grabEls(group.concat(after.map(function (a) { return a.c; })));
      }
      var d = self._timeAt(ev.clientX) - t0;
      var edgeT = edge === 'r' ? po.start + po.dur + d : po.start + d;
      if (!ripple || edge === 'r') d += self._snapDelta([edgeT], pts);
      d = clamp(d, lim.min, lim.max);
      d = self.fr(d);
      d = clamp(d, lim.min, lim.max);
      orig.forEach(function (o) {
        if (edge === 'r') o.c.dur = o.dur + d;
        else {
          o.c.srcIn = o.srcIn + d; o.c.dur = o.dur - d;
          if (!ripple) o.c.start = o.start + d;
        }
      });
      if (ripple) after.forEach(function (a) { a.c.start = a.start + (edge === 'r' ? d : -d); });
      var z = self.zoom;
      if (orig.some(function (o) { return els[o.c.id] && !els[o.c.id].isConnected; })) { self.renderTimeline(); els = self._grabEls(group.concat(after.map(function (a) { return a.c; }))); }
      orig.forEach(function (o) {
        var n = els[o.c.id]; if (!n) return;
        n.style.left = (o.c.start * z) + 'px';
        n.style.width = Math.max(2, o.c.dur * z) + 'px';
      });
      after.forEach(function (a) { var n = els[a.c.id]; if (n) n.style.left = (a.c.start * z) + 'px'; });
      self._tip(ev.clientX, ev.clientY, (ripple ? 'Ripple ' : '') + self._sdur(edge === 'r' ? d : -d) + '   Duration ' + tc(clip.dur, self.fps, 0).replace(/^00:/, '') + self._snapText());
      // show the frame being cut on: last frame for a tail trim, first frame for a head trim
      self._peek(edge === 'r' ? self.end(clip) - 1 / self.fps : clip.start);
    }, function () { self.root.classList.remove('nle-resizing'); if (moved) self.changed(); }, { autoscroll: true });
  };
  P._slipDrag = function (e, clip) {
    var self = this, sx = e.clientX, moved = false;
    var group = this.linkedSel ? this.linked(clip) : [clip];
    var orig = group.map(function (c) { return { c: c, srcIn: c.srcIn, len: self.mediaLen(c) }; });
    this._drag(function (ev) {
      if (!moved && Math.abs(ev.clientX - sx) < 2) return;
      if (!moved) { moved = true; self.saveUndo(); }
      var d = self.fr(-(ev.clientX - sx) / self.zoom);
      orig.forEach(function (o) { o.c.srcIn = clamp(o.srcIn + d, 0, Math.max(0, o.len - o.c.dur)); });
      self._tip(ev.clientX, ev.clientY, 'Slip  In ' + tc(clip.srcIn, self.fps, 0).replace(/^00:/, ''));
      // preview the clip's first frame (the slip changes which frame that is)
      self._peek(clip.start);
    }, function () { if (moved) self.changed(); });
  };
  P._transDown = function (e, te) {
    var self = this, c = this.clipById(te.dataset.clip), edge = te.dataset.edge;
    if (this._isDouble('tr' + c.id + edge)) { this.toggleInspector(true); return; }
    this.clearSel();
    this.selTrans = { clip: c.id, edge: edge };
    this.renderTimeline(); this.renderInspector();
    var h = e.target.dataset.h;
    if (!h || this.trackOf(c).locked) return;
    var T = c[edge === 'in' ? 'tIn' : 'tOut'], d0 = T.dur, sx = e.clientX, moved = false, centered = te.classList.contains('adj');
    this._drag(function (ev) {
      if (!moved) { moved = true; self.saveUndo(); }
      var dx = (ev.clientX - sx) / self.zoom * (h === 'r' ? 1 : -1);
      if (edge === 'out' && !centered) dx = (ev.clientX - sx) / self.zoom * (h === 'l' ? -1 : 1) * (h === 'r' ? 0 : 1);
      var nd = centered ? d0 + dx * 2 : d0 + dx;
      var maxD = centered ? c.dur * 2 : c.dur;
      T.dur = self.fr(clamp(nd, 2 / self.fps, Math.min(maxD, 10)));
      self._tip(ev.clientX, ev.clientY, tc(T.dur, self.fps, 0).replace(/^00:/, ''));
      self.renderTimeline(); self.renderViewer();
    }, function () { if (moved) self.changed(); });
  };

  /* ----------------------------------------------- drag from pool / library */
  P._beginDrag = function (e, payload) {
    var self = this, sx = e.clientX, sy = e.clientY, started = false, ghost = null, target = null;
    payload = Object.assign({}, payload);
    var ttype = payloadTrackType(payload);
    this._drag(function (ev) {
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
        started = true;
        ghost = el('div', { class: 'nle-ghost' }, icon(payload.type === 'media' ? (payload.media.kind === 'audio' ? 'audio' : payload.media.kind === 'video' ? 'film' : 'image') : payload.type === 'transition' ? 'trans' : payload.type === 'filter' ? 'fx' : payload.type === 'title' ? 'title' : 'gen'), el('span', { text: payloadName(payload) }));
        document.body.append(ghost);
        self.dragging = { trackType: isClipPayload(payload) ? ttype : null };
        self.root.classList.add('nle-dragging');
        self.renderTimeline();
      }
      ghost.style.transform = 'translate(' + (ev.clientX + 14) + 'px,' + (ev.clientY + 12) + 'px)';
      target = self._dropTarget(ev, payload, ttype);
      self._showDrop(target);
      ghost.classList.toggle('nope', !target);
    }, function () {
      if (!started) return;
      ghost.remove();
      self.dragging = null;
      self.root.classList.remove('nle-dragging');
      self._showDrop(null);
      if (target) self._performDrop(target, payload, ttype);
      else self.renderTimeline();
    }, { autoscroll: true });
  };
  P._dropTarget = function (ev, payload, ttype) {
    var x = ev.clientX, y = ev.clientY, self = this;
    if (isClipPayload(payload)) {
      var cr = this.ui.canvas.getBoundingClientRect();
      if (x >= cr.left && x <= cr.right && y >= cr.top && y <= cr.bottom) {
        var opEl = document.elementFromPoint(x, y);
        var op = opEl && opEl.closest ? opEl.closest('[data-op]') : null;
        return { type: 'viewer', op: op ? op.dataset.op : null };
      }
    }
    var hit = this._hitTrack(x, y);
    if (!hit) return null;
    if (isClipPayload(payload)) {
      var tr = hit.track && hit.track.type === ttype && !hit.track.locked ? hit.track : null;
      var nt = !tr && hit.zone === ttype && this.allow.addTracks;
      if (!tr && !nt) return null;
      var c = this.clipFromPayload(payload), dur = c.dur;
      var t = Math.max(0, hit.t);
      t += this._snapDelta([t, t + dur], this._snapPoints());
      t = this.fr(Math.max(0, t));
      return { type: 'clip', track: tr, newTrack: nt, t: t, dur: dur };
    }
    if (!hit.track || hit.track.type !== ttype) return null;
    if (payload.type === 'transition') {
      var best = null, th = 40 / this.zoom;
      hit.track.clips.forEach(function (c) {
        [['in', c.start], ['out', self.end(c)]].forEach(function (e) {
          var d = Math.abs(e[1] - hit.t);
          var inside = hit.t >= c.start && hit.t <= self.end(c);
          if ((d < th || (inside && d < c.dur / 2)) && (!best || d < best.d)) best = { d: d, clip: c, edge: e[0], at: e[1] };
        });
      });
      return best ? { type: 'trans', clip: best.clip, edge: best.edge, at: best.at, track: hit.track } : null;
    }
    if (payload.type === 'filter') {
      var cl = hit.track.clips.filter(function (c) { return hit.t >= c.start && hit.t < self.end(c); })[0];
      return cl && !hit.track.locked ? { type: 'filter', clip: cl, track: hit.track } : null;
    }
    return null;
  };
  P._showDrop = function (t) {
    var self = this;
    if (this.ui.phantom) { this.ui.phantom.remove(); this.ui.phantom = null; }
    this.ui.tlInner.querySelectorAll('.droptarget').forEach(function (x) { x.classList.remove('droptarget'); });
    this.ui.overlay.hidden = !(t && t.type === 'viewer');
    this.ui.overlay.querySelectorAll('[data-op]').forEach(function (o) { o.classList.toggle('hot', !!(t && t.op === o.dataset.op)); });
    if (!t || t.type === 'viewer') { if (!t) this._hideSnap(); return; }
    var z = this.zoom, ph;
    if (t.type === 'clip') {
      var lane = t.newTrack ? (this.dragging.trackType === 'video' ? this.ui.vZone : this.ui.aZone) : this.laneEls.get(t.track.id);
      ph = el('div', { class: 'nle-phantom', style: { left: (t.t * z) + 'px', width: (t.dur * z) + 'px' } }, el('span', { text: tc(t.t, this.fps) }));
      lane.append(ph);
    } else if (t.type === 'trans') {
      var lane2 = this.laneEls.get(t.track.id);
      ph = el('div', { class: 'nle-phantom trans', style: { left: (t.at * z - 20) + 'px', width: '40px' } });
      lane2.append(ph);
    } else if (t.type === 'filter') {
      var ce = this.ui.tlInner.querySelector('.nle-clip[data-id="' + t.clip.id + '"]');
      if (ce) ce.classList.add('droptarget');
    }
    this.ui.phantom = ph || null;
  };
  P._performDrop = function (t, payload, ttype) {
    var self = this;
    if (t.type === 'viewer') {
      if (!t.op) { this.renderTimeline(); return; }
      this.editOp(t.op, payload);
      return;
    }
    this.saveUndo();
    if (t.type === 'clip') {
      var tr = t.newTrack ? this.addTrack(ttype) : t.track;
      var c = this.clipFromPayload(payload);
      c.start = t.t;
      this.overwriteRange(tr, c.start, this.end(c));
      tr.clips.push(c); this.sortTrack(tr);
      this._linkAudio(c, tr, false);
      this.select(c);
      if (c.kind === 'title') this.toast('Title added — double-click it to edit the text in the Inspector');
    } else if (t.type === 'trans') {
      this._addTransition(t.clip, t.edge, payload.key);
    } else if (t.type === 'filter') {
      this._addFilter(t.clip, payload.key);
      this.select(t.clip);
      this.toast(FILTERS[payload.key].name + ' added — adjust it in the Inspector');
    }
    this.changed();
  };

  /* ---------------------------------------------------------- menus + misc */
  P.showMenu = function (x, y, items) {
    var self = this, m = this.ui.menu, r = this.root.getBoundingClientRect();
    m.textContent = '';
    items.forEach(function (it) {
      if (it.sep) { m.append(el('div', { class: 'nle-msep' })); return; }
      if (it.swatches) {
        var row = el('div', { class: 'nle-mswatch' }, el('span', { text: it.label }));
        it.swatches.forEach(function (s) { row.append(el('button', { type: 'button', class: 'nle-sw', title: s.name, style: { background: s.color || 'transparent' }, onclick: function () { self.hideMenu(); s.action(); } })); });
        m.append(row); return;
      }
      m.append(el('button', { type: 'button', class: 'nle-mi' + (it.checked ? ' checked' : ''), disabled: it.disabled, onclick: function () { self.hideMenu(); it.action(); } },
        el('span', { text: it.label }), it.sc ? el('kbd', { text: it.sc }) : null));
    });
    m.hidden = false;
    var mw = m.offsetWidth, mh = m.offsetHeight;
    m.style.left = clamp(x - r.left, 4, r.width - mw - 4) + 'px';
    m.style.top = clamp(y - r.top, 4, r.height - mh - 4) + 'px';
  };
  P.hideMenu = function () { if (this.ui.menu) this.ui.menu.hidden = true; };
  P.toast = function (msg, ms) {
    var t = this.ui.toast;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(function () { t.classList.remove('show'); }, ms || 2400);
  };
  P._addTrackMenu = function (x, y) {
    var self = this;
    if (!this.allow.addTracks) { this.toast('Adding tracks is turned off for this exercise'); return; }
    this.showMenu(x, y, [
      { label: 'Add Video Track', action: function () { self.saveUndo(); self.addTrack('video'); self.changed(); } },
      { label: 'Add Audio Track', action: function () { self.saveUndo(); self.addTrack('audio'); self.changed(); } }
    ]);
  };
  P._tlContext = function (e) {
    e.preventDefault();
    var self = this, x = e.clientX, y = e.clientY;
    var th = e.target.closest('.nle-th');
    if (th && th.dataset.track) {
      var tr = this.trackById(th.dataset.track), same = this.tracks.filter(function (t) { return t.type === tr.type; });
      this.showMenu(x, y, [
        { label: 'Add Video Track', action: function () { self.saveUndo(); self.addTrack('video'); self.changed(); }, disabled: !this.allow.addTracks },
        { label: 'Add Audio Track', action: function () { self.saveUndo(); self.addTrack('audio'); self.changed(); }, disabled: !this.allow.addTracks },
        { label: 'Rename Track…', action: function () { var n = prompt('Track name', self.trackName(tr)); if (n != null) { self.saveUndo(); tr.name = n; self.changed(); } } },
        { label: tr.locked ? 'Unlock Track' : 'Lock Track', action: function () { self.saveUndo(); tr.locked = !tr.locked; self.changed(); } },
        { sep: true },
        { label: 'Delete Track', disabled: same.length <= 1 || !this.allow.addTracks, action: function () {
          if (tr.clips.length && !confirm('Delete ' + self.trackLabel(tr) + ' and its ' + tr.clips.length + ' clip(s)?')) return;
          self.saveUndo(); tr.clips.forEach(function (c) { self.sel.delete(c.id); }); self.tracks.splice(self.tracks.indexOf(tr), 1);
          self.targetV = Math.min(self.targetV, self.vTracks().length - 1); self.changed();
        } }
      ]);
      return;
    }
    var ce = e.target.closest('.nle-clip');
    if (ce) {
      var c = this.clipById(ce.dataset.id);
      if (!this.sel.has(c.id)) { this.select(c); this.renderTimeline(); this.renderInspector(); }
      var colors = [['Default', null], ['Orange', '#b8692e'], ['Apricot', '#b98a3e'], ['Olive', '#7c8a34'], ['Teal', '#2f8a86'], ['Navy', '#35508e'], ['Violet', '#6d4f96'], ['Pink', '#a2507e']];
      this.showMenu(x, y, [
        { label: 'Split at Playhead', sc: '⌘B', action: function () { self.splitAtPlayhead(); } },
        { label: 'Copy', sc: '⌘C', action: function () { self.copy(); } },
        { label: 'Delete', sc: '⌫', action: function () { self.deleteSelection(false); } },
        { label: 'Ripple Delete', sc: '⇧⌫', action: function () { self.deleteSelection(true); } },
        { sep: true },
        { label: c.disabled ? 'Enable Clip' : 'Disable Clip', sc: 'D', action: function () { self.toggleDisable(); } },
        { label: 'Add Cross Dissolve at Start', action: function () { self.saveUndo(); self._addTransition(c, 'in', 'dissolve'); self.changed(); }, disabled: c.kind === 'audio' },
        { label: 'Add Cross Dissolve at End', action: function () { self.saveUndo(); self._addTransition(c, 'out', 'dissolve'); self.changed(); }, disabled: c.kind === 'audio' },
        c.link ? { label: 'Unlink Audio/Video', action: function () { self.saveUndo(); self.linked(c).forEach(function (x) { x.link = null; }); self.changed(); } } : { label: 'Link Selected Clips', disabled: this.sel.size < 2, action: function () { self.saveUndo(); var L = uid('L'); self._selClips().forEach(function (x) { x.link = L; }); self.changed(); } },
        { label: c.flag ? 'Remove Flag' : 'Add Flag', action: function () { self.toggleFlag(); } },
        { label: 'Inspector…', action: function () { self.toggleInspector(true); } },
        { swatches: colors.map(function (cc) { return { name: cc[0], color: cc[1], action: function () { self.saveUndo(); self._selClips().forEach(function (x) { x.color = cc[1]; }); self.changed(); } }; }), label: 'Color' }
      ]);
      return;
    }
    var mk = e.target.closest('.nle-mark');
    if (mk) {
      this.showMenu(x, y, [{ label: 'Delete Marker', action: function () { self.clearSel(); self.selMarker = mk.dataset.marker; self.deleteSelection(); } }, { label: 'Delete All Markers', action: function () { self.saveUndo(); self.markers = []; self.changed(); } }]);
      return;
    }
    var t = this.fr(Math.max(0, this._timeAt(x)));
    this.showMenu(x, y, [
      { label: 'Paste at Playhead', sc: '⌘V', disabled: !this.clipboard, action: function () { self.paste(); } },
      { label: 'Move Playhead Here', action: function () { self.stop(); self.setPlayhead(t); } },
      { label: 'Add Marker at Playhead', sc: 'M', action: function () { self.addMarker(); } },
      { sep: true },
      { label: 'Add Video Track', disabled: !this.allow.addTracks, action: function () { self.saveUndo(); self.addTrack('video'); self.changed(); } },
      { label: 'Add Audio Track', disabled: !this.allow.addTracks, action: function () { self.saveUndo(); self.addTrack('audio'); self.changed(); } },
      { label: 'Clear In and Out', disabled: this.inPt == null && this.outPt == null, action: function () { self.saveUndo(); self.inPt = self.outPt = null; self.changed(); } },
      { label: 'Zoom to Fit', sc: '⇧Z', action: function () { self.zoomToFit(); } }
    ]);
  };

  /* -------------------------------------------------------------- keyboard */
  P._onKey = function (e) {
    var tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var k = e.key, mod = e.metaKey || e.ctrlKey, self = this, handled = true;
    if (tag === 'BUTTON' && (k === ' ' || k === 'Enter')) return;
    if (mod && (k === 'z' || k === 'Z')) { if (e.shiftKey) this.redo(); else this.undo(); }
    else if (mod && (k === 'y' || k === 'Y')) this.redo();
    else if (mod && (k === 'b' || k === 'B' || k === '\\') && this.level > 1) this.splitAtPlayhead();
    else if (mod && (k === 'c' || k === 'C')) this.copy();
    else if (mod && (k === 'x' || k === 'X')) { this.copy(); this.deleteSelection(false); }
    else if (mod && (k === 'v' || k === 'V')) this.paste();
    else if (mod && (k === 'a' || k === 'A')) { this.clearSel(); this.allClips().forEach(function (c) { self.sel.add(c.id); }); this.renderTimeline(); this.renderInspector(); }
    else if (mod && (k === 't' || k === 'T') && this.level === 3) {
      var cs = this._selClips().filter(function (c) { return c.kind !== 'audio'; });
      if (cs.length) { this.saveUndo(); cs.forEach(function (c) { if (!c.tIn) c.tIn = { type: 'dissolve', dur: self.fr(Math.min(1, c.dur)) }; }); this.changed(); }
    }
    else if (mod) handled = false;
    else if (k === ' ') this.togglePlay();
    else if (k === 'l' || k === 'L') this.play(1);
    else if (k === 'j' || k === 'J') this.play(-1);
    else if (k === 'k' || k === 'K') this.stop();
    else if (k === 'ArrowLeft') this.stepFrames(e.shiftKey ? -this.fps : -1);
    else if (k === 'ArrowRight') this.stepFrames(e.shiftKey ? this.fps : 1);
    else if (k === 'ArrowUp') this.jumpEdit(-1);
    else if (k === 'ArrowDown') this.jumpEdit(1);
    else if (k === 'Home') { this.stop(); this.setPlayhead(0); this._ensureVisible(); }
    else if (k === 'End') { this.stop(); this.setPlayhead(this.duration()); this._ensureVisible(); }
    else if (k === 'i' || k === 'I') this.markIn();
    else if (k === 'o' || k === 'O') this.markOut();
    else if ((k === 'x' || k === 'X') && e.altKey) { this.saveUndo(); this.inPt = this.outPt = null; this.changed(); }
    else if (k === 'a' || k === 'A') this.setTool('select');
    else if ((k === 't' || k === 'T') && this.level > 1) this.setTool('trim');
    else if ((k === 'b' || k === 'B') && this.level > 1) this.setTool('blade');
    else if (k === 'n' || k === 'N') { this.snap = !this.snap; this._syncToolbar(); this.toast('Snapping ' + (this.snap ? 'on' : 'off')); }
    else if (k === 'm' || k === 'M') this.addMarker();
    else if (k === 'd' || k === 'D') this.toggleDisable();
    else if (k === 'Delete' || k === 'Backspace') this.deleteSelection(e.shiftKey);
    else if (k === 'Escape') { this.clearSel(); this.hideMenu(); this.renderTimeline(); this.renderInspector(); }
    else if (k === '=' || k === '+') this.setZoom(this.zoom * 1.5);
    else if (k === '-' || k === '_') this.setZoom(this.zoom / 1.5);
    else if ((k === 'z' || k === 'Z') && e.shiftKey) this.zoomToFit();
    else if (k === 'F9' && this.level > 1) this.editFromPool('insert');
    else if (k === 'F10' && this.level > 1) this.editFromPool('overwrite');
    else if (k === 'F11' && this.level > 1) this.editFromPool('replace');
    else if (k === 'F12') this.editFromPool(e.shiftKey || this.level === 1 ? 'append' : 'top');
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  /* ===================================================== public checks API */
  P.api = function () {
    var self = this, fps = this.fps;
    var r = function (t) { return Math.round(t * fps) / fps; };
    var info = function (c, tr) {
      var m = c.mediaId ? self.mediaById(c.mediaId) : null;
      return {
        id: c.id, name: c.name, kind: c.kind, track: self.trackLabel(tr), trackType: tr.type,
        start: r(c.start), end: r(self.end(c)), duration: r(c.dur), in: r(c.srcIn), out: r(c.srcIn + c.dur),
        media: m ? m.id : null, mediaName: m ? m.name : null,
        title: c.kind === 'title' ? c.key : null, generator: c.kind === 'generator' ? c.key : null,
        text: c.props && c.props.text != null ? c.props.text : null, text2: c.props && c.props.text2 != null ? c.props.text2 : null,
        transitionIn: c.tIn ? c.tIn.type : null, transitionInDuration: c.tIn ? r(c.tIn.dur) : 0,
        transitionOut: c.tOut ? c.tOut.type : null, transitionOutDuration: c.tOut ? r(c.tOut.dur) : 0,
        filters: c.filters.map(function (f) { return f.type; }),
        disabled: c.disabled, flagged: !!c.flag, linked: !!c.link, volume: c.volume,
        zoom: c.tf.zoom, x: c.tf.x, y: c.tf.y, rotation: c.tf.rot, opacity: c.tf.opacity
      };
    };
    var api = {
      fps: fps,
      playhead: r(this.playhead),
      duration: r(this.duration()),
      selected: Array.from(this.sel),
      poolSelection: this.poolSel,
      snapping: this.snap,
      timelineZoom: this.zoom,
      fitZoom: clamp((this.laneWidth() - 30) / Math.max(this.duration(), 10), 3, 800),
      inPoint: this.inPt, outPoint: this.outPt,
      markers: this.markers.map(function (m) { return r(m.t); }).sort(function (a, b) { return a - b; }),
      tracks: function () {
        return self.tracks.map(function (t) { return { name: self.trackLabel(t), type: t.type, clips: t.clips.length, locked: t.locked, enabled: t.enabled, muted: t.muted, solo: t.solo, height: t.h }; });
      },
      clips: function (trackName) {
        var out = [];
        self.tracks.forEach(function (t) {
          if (trackName && self.trackLabel(t) !== trackName) return;
          t.clips.forEach(function (c) { out.push(info(c, t)); });
        });
        return out.sort(function (a, b) { return a.start - b.start || a.track.localeCompare(b.track); });
      },
      gaps: function (trackName) {
        var cl = api.clips(trackName), out = [], at = 0;
        cl.forEach(function (c) { if (c.start > at + 1e-6) out.push({ start: at, end: c.start }); at = Math.max(at, c.end); });
        return out;
      },
      clipAt: function (t, trackName) { return api.clips(trackName).filter(function (c) { return c.start <= t + 1e-6 && c.end > t + 1e-6; }).pop() || null; },
      near: function (a, b, tol) { return Math.abs(a - b) <= (tol == null ? 1 / fps + 1e-6 : tol); },
      transitions: function () {
        var out = [];
        api.clips().forEach(function (c) {
          if (c.transitionIn) out.push({ type: c.transitionIn, clip: c.name, edge: 'in', at: c.start, duration: c.transitionInDuration, track: c.track });
          if (c.transitionOut) out.push({ type: c.transitionOut, clip: c.name, edge: 'out', at: c.end, duration: c.transitionOutDuration, track: c.track });
        });
        return out;
      }
    };
    return api;
  };
  P.getState = function () { return JSON.parse(this._snapshot()); };
  P.loadState = function (s) { this.saveUndo(); this._restore(typeof s === 'string' ? s : JSON.stringify(s)); this.changed(); };

  /* ===================================================================== export */
  var PracticeEditor = {
    version: '1.0.0-textbook.1',
    mount: function (target, opts) {
      var root = typeof target === 'string' ? document.querySelector(target) : target;
      if (!root) throw new Error('PracticeEditor.mount: target not found');
      var ed = new Editor(root, opts);
      PracticeEditor.instances.push(ed);
      return ed;
    },
    instances: [],
    timecode: tc,
    library: { transitions: TRANSITIONS, titles: TITLES, generators: GENERATORS, filters: FILTERS }
  };
  global.PracticeEditor = PracticeEditor;
})(window);
