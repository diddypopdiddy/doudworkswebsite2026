/* Windows 11 practice desktop.
   A self-contained copy of the Windows 11 desktop, taskbar, Start menu and File Explorer for the
   file-management lessons. Files live in memory and reset when the page reloads or the student
   chooses Restart. Nothing touches the real computer.

   Block data (see specs/DESKTOP-SIM.md for the full reference):
   { type: 'desktop-sim',
     desktop: [...], documents: [...], downloads: [...], pictures: [...], music: [...], videos: [...],
     drives: [{ name: 'USB Drive', letter: 'E', kind: 'usb' | 'sd' | 'network' | 'cloud', children: [...] }],
     open: 'Documents > Video',          // optional: File Explorer windows open at the start
     extensions: true,                   // show file name extensions (Windows hides them by default)
     tasks: [{ text, check: s => ..., hint }] }
   A file is a string ('clip.mp4') or { name, media, meta, text, size, modified }.
   A folder is { name, children: [...] }. */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const IS_MAC = /Mac/.test(navigator.platform || navigator.userAgent || '');
  /* Multi-select modifier for clicks: Ctrl on Windows and Chromebooks, Command on a Mac. */
  const modClick = e => IS_MAC ? e.metaKey : e.ctrlKey;
  const modKey = e => e.ctrlKey || (IS_MAC && e.metaKey);

  /* ------------------------------------------------------------------ small helpers */
  function h(tag, a) {
    const n = document.createElement(tag);
    if (a) for (const k in a) {
      const v = a[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'style') n.style.cssText = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'hidden' || k === 'disabled' || k === 'checked' || k === 'value') n[k] = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    const add = c => {
      if (c == null || c === false) return;
      if (Array.isArray(c)) c.forEach(add);
      else n.append(c.nodeType ? c : document.createTextNode(String(c)));
    };
    for (let i = 2; i < arguments.length; i++) add(arguments[i]);
    return n;
  }
  const fill = (el, ...kids) => el.replaceChildren(...kids.flat(3).filter(k => k != null && k !== false));
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /* Task text: **bold**, `typed text` and [[glossary terms]]. */
  const md = t => { const x = esc(t || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>'); return T.rich ? T.rich(x) : x; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const hash = s => { let x = 2166136261; for (const ch of String(s)) { x ^= ch.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  const extOf = n => { const i = n.lastIndexOf('.'); return i > 0 ? n.slice(i + 1).toLowerCase() : ''; };
  const baseOf = n => { const i = n.lastIndexOf('.'); return i > 0 ? n.slice(0, i) : n; };
  const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
  const BAD_CHARS = /[\\/:*?"<>|]/;
  const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
  const fmtKB = b => b == null ? '' : Math.max(b ? 1 : 0, Math.ceil(b / 1024)).toLocaleString('en-US') + ' KB';
  function fmtBytes(b) {
    if (b < 1024) return b + ' bytes';
    const u = ['KB', 'MB', 'GB', 'TB']; let v = b, i = -1;
    do { v /= 1024; i++; } while (v >= 1024 && i < 3);
    return (v >= 100 ? Math.round(v) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + u[i];
  }
  const fmtGB = b => (b / 1073741824 >= 100 ? Math.round(b / 1073741824) : (b / 1073741824).toFixed(1)) + ' GB';
  function fmtDate(ms) {
    const d = new Date(ms); let hr = d.getHours(); const ap = hr >= 12 ? 'PM' : 'AM'; hr = hr % 12 || 12;
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + hr + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + ap;
  }
  const fmtLong = ms => new Date(ms).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const fmtDur = s => { s = Math.round(s || 0); return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  /* ------------------------------------------------------------------ file types */
  const TYPES = {
    mp4: ['video', 'MP4 File'], mov: ['video', 'MOV File'], m4v: ['video', 'M4V File'], avi: ['video', 'AVI File'], mkv: ['video', 'MKV File'], mts: ['video', 'MTS File'], mxf: ['video', 'MXF File'],
    wav: ['audio', 'WAV File'], mp3: ['audio', 'MP3 File'], m4a: ['audio', 'M4A File'], aac: ['audio', 'AAC File'],
    jpg: ['image', 'JPG File'], jpeg: ['image', 'JPEG File'], png: ['image', 'PNG File'], gif: ['image', 'GIF File'], heic: ['image', 'HEIC File'], tif: ['image', 'TIF File'], psd: ['image', 'PSD File'],
    txt: ['text', 'Text Document'], srt: ['caption', 'SRT File'], vtt: ['caption', 'VTT File'], csv: ['sheet', 'CSV File'], xlsx: ['sheet', 'XLSX File'],
    docx: ['doc', 'DOCX File'], doc: ['doc', 'DOC File'], rtf: ['doc', 'Rich Text Format'], pdf: ['pdf', 'PDF File'], pptx: ['doc', 'PPTX File'],
    prproj: ['project', 'PRPROJ File'], drp: ['project', 'DRP File'], veg: ['project', 'VEG File'], wfp: ['project', 'WFP File'], kdenlive: ['project', 'KDENLIVE File'], aep: ['project', 'AEP File'], fcpxml: ['project', 'FCPXML File'],
    zip: ['zip', 'Compressed (zipped) Folder'], lnk: ['shortcut', 'Shortcut'], json: ['text', 'JSON File'], md: ['text', 'MD File']
  };
  const kindOf = node => node.folder ? 'folder' : (TYPES[extOf(node.name)] || ['file'])[0];
  const typeName = node => {
    if (node.drive) return node.drive.kind === 'system' ? 'Local Disk' : node.drive.kind === 'network' ? 'Network Drive' : node.drive.kind === 'cloud' ? 'Cloud storage' : 'Removable Disk';
    if (node.folder) return 'File folder';
    const e = extOf(node.name);
    return (TYPES[e] || [0, e ? e.toUpperCase() + ' File' : 'File'])[1];
  };
  const appFor = node => ({ video: 'player', audio: 'player', image: 'photos', text: 'notepad', caption: 'notepad', sheet: 'notepad', project: 'editor' })[kindOf(node)] || null;
  const APPS = {
    explorer: { name: 'File Explorer' }, player: { name: 'Media Player' }, photos: { name: 'Photos' },
    notepad: { name: 'Notepad' }, editor: { name: 'Video Editor' }, settings: { name: 'Settings' }
  };

  /* ------------------------------------------------------------------ icons */
  const S = body => '<svg viewBox="0 0 48 48" aria-hidden="true">' + body + '</svg>';
  const G = body => '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  const PAGE = '<path d="M11 4h18.2a2 2 0 0 1 1.4.6l8.8 8.8a2 2 0 0 1 .6 1.4V42a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" stroke="#9c9c9c"/><path d="M29.5 4.5V12a2 2 0 0 0 2 2h7.5" fill="#ececec" stroke="#9c9c9c"/>';
  const BADGE = {
    video: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#6c47e0"/><path d="M13 30v8l7-4z" fill="#fff"/>',
    audio: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#d9338c"/><path d="M14.5 38v-8l7-1.5v7" stroke="#fff" stroke-width="1.8" fill="none"/><circle cx="12.7" cy="38" r="2" fill="#fff"/><circle cx="19.7" cy="35.5" r="2" fill="#fff"/>',
    image: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#118a8a"/><path d="M7 40l6-6 4 4 3-3 5 5z" fill="#fff"/><circle cx="21" cy="30.5" r="1.8" fill="#fff"/>',
    text: '<path d="M14 19h20M14 24h20M14 29h20M14 34h13" stroke="#8a8a8a" stroke-width="1.6"/>',
    caption: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#404040"/><path d="M9 33h5M16 33h7M9 37h12" stroke="#fff" stroke-width="1.7"/>',
    sheet: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#17834a"/><path d="M5 31.5h22M5 36.5h22M12.5 26v16M19.5 26v16" stroke="#fff" stroke-width="1.2"/>',
    doc: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#2b66d0"/><path d="M9 31h14M9 34.5h14M9 38h9" stroke="#fff" stroke-width="1.6"/>',
    pdf: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#c4312b"/><path d="M9 38.5c3.5-1 7-4 8-8.5M12 31c2 3 6 6 11 6.5" stroke="#fff" stroke-width="1.5" fill="none"/>',
    project: '<rect x="5" y="26" width="22" height="16" rx="2.5" fill="#33246e"/><path d="M8.5 31h7M8.5 34.5h12M8.5 38h5" stroke="#b9a6ff" stroke-width="2.2" stroke-linecap="round"/><path d="M18.5 29v11" stroke="#ff6b6b" stroke-width="1.2"/>',
    zip: '<path d="M22 4.5v23" stroke="#e8ad1d" stroke-width="5"/><path d="M19.5 8h5M19.5 12h5M19.5 16h5M19.5 20h5" stroke="#7a5a00" stroke-width="1"/><rect x="18.5" y="26" width="7" height="7" rx="1.3" fill="#7a5a00"/>',
    shortcut: '<rect x="5" y="30" width="12" height="12" rx="1.5" fill="#fff" stroke="#777"/><path d="M8.5 38.5c0-3 1.5-5 5-5M11.5 31.5l2 2-2 2" stroke="#0f6cbd" stroke-width="1.6" fill="none"/>'
  };
  const HDD_BODY = '<rect x="4" y="15" width="40" height="19" rx="3" fill="#cfd4da"/><rect x="4" y="27" width="40" height="7" rx="2.5" fill="#a6adb6"/><circle cx="38.5" cy="30.5" r="1.7" fill="#2db36a"/>';
  const ICON = {
    folder: full => {
      const y = full ? 20 : 16.5;
      return S('<path d="M4 11.5A3.5 3.5 0 0 1 7.5 8h10.4a3 3 0 0 1 2.1.9L23.3 12h17.2a3.5 3.5 0 0 1 3.5 3.5V37a3.5 3.5 0 0 1-3.5 3.5h-33A3.5 3.5 0 0 1 4 37z" fill="#e5a422"/>' +
        (full ? '<rect x="8.5" y="14" width="31" height="16" rx="1" fill="#fff"/><path d="M12 17.3h17" stroke="#c9cfd6" stroke-width="1.4"/>' : '') +
        '<path d="M4 ' + (y + 3.5) + 'a3.5 3.5 0 0 1 3.5-3.5h33a3.5 3.5 0 0 1 3.5 3.5V37a3.5 3.5 0 0 1-3.5 3.5h-33A3.5 3.5 0 0 1 4 37z" fill="#ffc83d"/>' +
        '<path d="M6 ' + (y + 0.9) + 'h36" stroke="#ffdc80" stroke-width="1.5"/>');
    },
    file: kind => S(PAGE + (BADGE[kind] || '')),
    desktop: S('<rect x="4" y="8" width="40" height="27" rx="3" fill="#1a73d9"/><path d="M7 8h34a3 3 0 0 1 3 3v3H4v-3a3 3 0 0 1 3-3z" fill="#5aa9f8"/><rect x="18" y="36.5" width="12" height="3.5" rx="1.75" fill="#6b7a90"/>'),
    downloads: S('<rect x="6" y="30" width="36" height="12" rx="3" fill="#0f6cbd"/><path d="M24 6v21m-9-8.5 9 9 9-9" stroke="#21a366" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    documents: S('<path d="M10 4h20l10 10v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#4a8fe7"/><path d="M30 4v8a2 2 0 0 0 2 2h8z" fill="#a4c9f6"/><path d="M14 22h20M14 28h20M14 34h13" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'),
    pictures: S('<rect x="4" y="8" width="40" height="32" rx="4" fill="#3ba0f2"/><circle cx="33" cy="17" r="4" fill="#ffe07a"/><path d="M4 33l11-11 9 9 6-6 14 13v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#0b5cad"/>'),
    music: S('<rect x="4" y="6" width="40" height="36" rx="5" fill="#f2643a"/><path d="M20 32V15l14-3v17" stroke="#fff" stroke-width="3" fill="none"/><circle cx="16.5" cy="32" r="4" fill="#fff"/><circle cx="30.5" cy="29" r="4" fill="#fff"/>'),
    videos: S('<rect x="4" y="8" width="40" height="32" rx="5" fill="#8656ef"/><path d="M20 17v14l12-7z" fill="#fff"/>'),
    hdd: S(HDD_BODY + '<g fill="#0f6cbd"><rect x="9" y="18.5" width="3.4" height="3.4"/><rect x="13" y="18.5" width="3.4" height="3.4"/><rect x="9" y="22.5" width="3.4" height="3.4"/><rect x="13" y="22.5" width="3.4" height="3.4"/></g>'),
    usb: S('<rect x="4" y="15" width="33" height="19" rx="3" fill="#cfd4da"/><rect x="4" y="27" width="33" height="7" rx="2.5" fill="#a6adb6"/><rect x="37" y="19" width="8" height="11" rx="1" fill="#8d949c"/><rect x="39" y="21.5" width="2" height="2" fill="#cfd4da"/><rect x="39" y="25.5" width="2" height="2" fill="#cfd4da"/><path d="M10 21.5h13m-4-3 4 3-4 3" stroke="#0f6cbd" stroke-width="2" fill="none"/>'),
    sd: S('<path d="M13 5h17l8 8v29a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="#363b42"/><path d="M16 6v8M20 6v8M24 6v8M28 6v8" stroke="#e9b949" stroke-width="2.2"/><rect x="15" y="25" width="19" height="13" rx="1.5" fill="#5b636e"/><path d="M18 31.5h13" stroke="#cfd4da" stroke-width="1.5"/>'),
    net: S(HDD_BODY + '<path d="M24 34v5M13 41.5h22" stroke="#59616b" stroke-width="2.6"/><path d="M9 21h12" stroke="#59616b" stroke-width="2.4"/>'),
    cloud: S('<path d="M14 37h22a8.5 8.5 0 0 0 1.4-16.9A11.5 11.5 0 0 0 15.6 18.5 9.3 9.3 0 0 0 14 37z" fill="#1d7ad4"/><path d="M14 37h22a8.5 8.5 0 0 0 7-3.7c-6 1.6-21 2-34 .5A9 9 0 0 0 14 37z" fill="#0f5ba8"/>'),
    pc: S('<rect x="5" y="8" width="38" height="25" rx="2.5" fill="#1f2937"/><rect x="7" y="10" width="34" height="21" rx="1" fill="#3a9af0"/><path d="M7 27l10-8 9 6 15-10v16H7z" fill="#1a6fd0" opacity=".65"/><rect x="20" y="33" width="8" height="5" fill="#9aa3ae"/><rect x="14" y="38" width="20" height="3" rx="1.5" fill="#6b7280"/>'),
    bin: full => S((full ? '<path d="M15 15.5l3.5-9.5 8 3-2.5 7z" fill="#fff" stroke="#a1a9b3"/><path d="M24 15.5l7-6.5 5 5.5-2 1.5z" fill="#fffbe6" stroke="#c9b26b"/>' : '') +
      '<path d="M10.5 14.5h27l-2.5 26a3 3 0 0 1-3 2.7H16a3 3 0 0 1-3-2.7z" fill="#e1eefb" fill-opacity=".92" stroke="#7aa7d6" stroke-width="1.4"/><path d="M9 12.5h30v3H9z" fill="#a9c8ea" stroke="#7aa7d6"/><path d="M19 19.5v19M24 19.5v19M29 19.5v19" stroke="#8db5df" stroke-width="1.4"/>'),
    home: S('<path d="M7 22 24 8l17 14v18a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" fill="#f3a73c"/><path d="M4 23.5 24 6.5l20 17" stroke="#c4572a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="19.5" y="28" width="9" height="15" rx="1" fill="#8a4b1c"/>'),
    gallery: S('<rect x="10" y="5" width="32" height="26" rx="3" fill="#7fc4ff" transform="rotate(8 26 18)"/><rect x="5" y="13" width="33" height="27" rx="3" fill="#2d8be6"/><circle cx="29" cy="21" r="3.2" fill="#ffe07a"/><path d="M5 35l9-9 7 7 5-4 12 10v.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="#0b4f99"/>'),
    network: S('<rect x="4" y="9" width="22" height="16" rx="2" fill="#1f2937"/><rect x="5.5" y="10.5" width="19" height="13" rx="1" fill="#3a9af0"/><rect x="22" y="20" width="22" height="16" rx="2" fill="#1f2937"/><rect x="23.5" y="21.5" width="19" height="13" rx="1" fill="#3a9af0"/><path d="M15 25v13h11M33 36v4" stroke="#6b7280" stroke-width="2.4" fill="none"/>'),
    notepad: S('<rect x="9" y="6" width="30" height="37" rx="3" fill="#2f7ad6"/><rect x="12" y="11" width="24" height="29" rx="1.5" fill="#fff"/><path d="M16 18h16M16 23h16M16 28h16M16 33h10" stroke="#9aa3ae" stroke-width="1.7"/><path d="M15 4v6M21 4v6M27 4v6M33 4v6" stroke="#1b4f91" stroke-width="2.4" stroke-linecap="round"/>'),
    photos: S('<rect x="5" y="7" width="38" height="34" rx="6" fill="#1f7ae0"/><circle cx="31.5" cy="17" r="4" fill="#ffd35c"/><path d="M5 34l12-12 9 9 5-5 12 11v.5a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6z" fill="#7ad0ff"/>'),
    player: S('<circle cx="24" cy="24" r="19" fill="#e3463b"/><circle cx="24" cy="24" r="19" fill="#f08a24" opacity=".55" transform="translate(-3 -3) scale(1.06)"/><path d="M19.5 15.5v17l14-8.5z" fill="#fff"/>'),
    editor: S('<rect x="5" y="15" width="38" height="25" rx="3" fill="#33246e"/><path d="M5 15l4-8 34 0-4 8z" fill="#6b50d6"/><path d="M14 7l-4 8M24 7l-4 8M34 7l-4 8" stroke="#fff" stroke-width="2.2"/><path d="M11 25h12M11 31h20" stroke="#b9a6ff" stroke-width="3" stroke-linecap="round"/>'),
    settings: S('<circle cx="24" cy="24" r="17" fill="#6b7280"/><circle cx="24" cy="24" r="7" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M24 7v6M24 35v6M7 24h6M35 24h6M12 12l4.2 4.2M31.8 31.8 36 36M12 36l4.2-4.2M31.8 16.2 36 12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>'),
    explorer: null,
    user: S('<circle cx="24" cy="24" r="21" fill="#dde3ea"/><circle cx="24" cy="19" r="8" fill="#7a8796"/><path d="M10 37c3-7 8-9.5 14-9.5S35 30 38 37a20 20 0 0 1-28 0z" fill="#7a8796"/>')
  };
  ICON.explorer = ICON.folder(false);
  const GL = {
    back: G('<path d="M13.5 8h-11m4.5-4.5L2.5 8 7 12.5"/>'), fwd: G('<path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/>'), up: G('<path d="M8 13.5v-11M3.5 7 8 2.5 12.5 7"/>'),
    refresh: G('<path d="M13 8a5 5 0 1 1-1.6-3.7M13.2 2.2v3h-3"/>'), chevR: G('<path d="M6 3.5 10.5 8 6 12.5"/>'), chevD: G('<path d="M3.5 6 8 10.5 12.5 6"/>'), chevU: G('<path d="M3.5 10 8 5.5 12.5 10"/>'),
    search: G('<circle cx="6.8" cy="6.8" r="4.6"/><path d="m10.3 10.3 3.9 3.9"/>'), plus: G('<path d="M8 2.5v11M2.5 8h11"/>'),
    cut: G('<circle cx="4.5" cy="11.8" r="2.1"/><circle cx="11.5" cy="11.8" r="2.1"/><path d="M5.8 10.2 11.5 2M10.2 10.2 4.5 2"/>'),
    copy: G('<rect x="5.5" y="5" width="8.5" height="9.5" rx="1.6"/><path d="M3.5 11.3V3.4A1.9 1.9 0 0 1 5.4 1.5h6"/>'),
    paste: G('<path d="M5.5 2.5H4.3A1.8 1.8 0 0 0 2.5 4.3v8.4a1.8 1.8 0 0 0 1.8 1.8h7.4a1.8 1.8 0 0 0 1.8-1.8V4.3a1.8 1.8 0 0 0-1.8-1.8h-1.2"/><rect x="5.5" y="1.3" width="5" height="2.7" rx="1"/>'),
    rename: G('<path d="M1.5 12.5 4.5 4l3 8.5M2.6 9.6h3.8M11 2v12M9.3 2h3.4M9.3 14h3.4"/>'),
    share: G('<path d="M9.5 2.5 14 6.5l-4.5 4M14 6.5H8.5a6 6 0 0 0-6 6v1"/>'),
    del: G('<path d="M2.5 4h11M6.3 4V2.4h3.4V4M3.9 4l.7 9.2A1.5 1.5 0 0 0 6.1 14.5h3.8a1.5 1.5 0 0 0 1.5-1.3L12.1 4M6.6 6.8v4.8M9.4 6.8v4.8"/>'),
    sort: G('<path d="M5 2.5v11M2.3 10.8 5 13.5l2.7-2.7M11 13.5v-11M8.3 5.2 11 2.5l2.7 2.7"/>'),
    view: G('<rect x="2" y="2.5" width="12" height="11" rx="1.6"/><path d="M2 6h12M6 6v7.5"/>'),
    more: G('<circle cx="3" cy="8" r=".6" fill="currentColor"/><circle cx="8" cy="8" r=".6" fill="currentColor"/><circle cx="13" cy="8" r=".6" fill="currentColor"/>'),
    pane: G('<rect x="2" y="2.5" width="12" height="11" rx="1.6"/><path d="M10 2.5v11"/>'),
    close: G('<path d="m3.5 3.5 9 9m0-9-9 9"/>'), min: G('<path d="M3 8h10"/>'), max: G('<rect x="3.5" y="3.5" width="9" height="9" rx="1.6"/>'),
    restoreWin: G('<rect x="3" y="5.5" width="7.5" height="7.5" rx="1.4"/><path d="M5.5 5.5v-.7A1.8 1.8 0 0 1 7.3 3h3.9A1.8 1.8 0 0 1 13 4.8v3.9a1.8 1.8 0 0 1-1.8 1.8h-.7"/>'),
    check: G('<path d="m3 8.5 3 3 7-7"/>'), dot: G('<circle cx="8" cy="8" r="2.4" fill="currentColor" stroke="none"/>'),
    pin: G('<path d="M10 1.8 14.2 6l-1.4.6-2.4 2.4.3 3-1 1-6.6-6.6 1-1 3 .3 2.4-2.4zM5.3 10.7 1.8 14.2"/>'),
    unpin: G('<path d="M10 1.8 14.2 6l-1.4.6-2.4 2.4.3 3-1 1-6.6-6.6 1-1 3 .3 2.4-2.4zM5.3 10.7 1.8 14.2M2 2l12 12"/>'),
    power: G('<path d="M8 1.8v6M4.4 4.2a5.2 5.2 0 1 0 7.2 0"/>'), wifi: G('<path d="M1.3 6.2a9.6 9.6 0 0 1 13.4 0M3.6 8.6a6.3 6.3 0 0 1 8.8 0M5.9 11a3 3 0 0 1 4.2 0"/><circle cx="8" cy="13.3" r=".8" fill="currentColor"/>'),
    volume: G('<path d="M2 6h2.4L8 3v10l-3.6-3H2zM10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.6 3.6a6.3 6.3 0 0 1 0 8.8"/>'),
    battery: G('<rect x="1.5" y="5" width="11.5" height="6.2" rx="1.4"/><path d="M14.6 7v2.2"/><rect x="3" y="6.5" width="7.4" height="3.2" rx=".4" fill="currentColor" stroke="none"/>'),
    bell: G('<path d="M4 11V7a4 4 0 0 1 8 0v4l1.3 1.5H2.7zM6.5 13.8a1.6 1.6 0 0 0 3 0"/>'),
    undo: G('<path d="M5 3 2 6l3 3M2 6h7.3a4.3 4.3 0 0 1 0 8.6H6.5"/>'), redo: G('<path d="m11 3 3 3-3 3M14 6H6.7a4.3 4.3 0 0 0 0 8.6h2.8"/>'),
    props: G('<rect x="2.5" y="1.8" width="11" height="12.4" rx="1.6"/><path d="M5 5.3h6M5 8h6M5 10.7h3.6"/>'),
    open: G('<path d="M9 2.5h4.5V7M13.5 2.5 7 9M11.5 9.5v2.8a1.7 1.7 0 0 1-1.7 1.7H3.7A1.7 1.7 0 0 1 2 12.3V6.2a1.7 1.7 0 0 1 1.7-1.7h2.8"/>'),
    newTab: G('<rect x="1.8" y="3" width="12.4" height="10.5" rx="1.6"/><path d="M1.8 6h5.5V3M10 8v4M8 10h4"/>'), newWin: G('<rect x="1.8" y="3" width="12.4" height="10.5" rx="1.6"/><path d="M1.8 6h12.4"/>'),
    zip: G('<rect x="2.5" y="2" width="11" height="12" rx="1.6"/><path d="M8 2v2M8 5v1.2M8 7.4v1.2M7 10h2v2H7z"/>'), path: G('<path d="M6.5 9.5 9.5 6.5M7.2 4.3l1-1a2.6 2.6 0 0 1 3.7 3.7l-1 1M8.8 11.7l-1 1a2.6 2.6 0 0 1-3.7-3.7l1-1"/>'),
    restore: G('<path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.8M2.6 2.2v3h3"/>'), selAll: G('<rect x="2" y="2" width="12" height="12" rx="1.6" stroke-dasharray="2.2 1.6"/><path d="m5 8 2 2 4-4"/>'),
    selNone: G('<rect x="2" y="2" width="12" height="12" rx="1.6" stroke-dasharray="2.2 1.6"/>'), invert: G('<rect x="2" y="2" width="12" height="12" rx="1.6"/><path d="M2 14 14 2"/><path d="M2.5 13.5 13.5 2.5V12a1.6 1.6 0 0 1-1.6 1.6z" fill="currentColor" stroke="none"/>'),
    folderNew: G('<path d="M1.8 4.2A1.4 1.4 0 0 1 3.2 2.8h3l1.5 1.5h5.1a1.4 1.4 0 0 1 1.4 1.4v1.6M8 13.2H3.2a1.4 1.4 0 0 1-1.4-1.4V4.2M11.8 9v5M9.3 11.5h5"/>'),
    textNew: G('<path d="M3 1.8h6l3.5 3.5v3M3 1.8v12.4h5M9 1.8v3.5h3.5M11.8 9.5v5M9.3 12h5"/>'), eject: G('<path d="M3 9.5 8 3.5l5 6zM3 12.5h10"/>'),
    xl: G('<rect x="2" y="2" width="12" height="12" rx="1.6"/>'), large: G('<rect x="2" y="2" width="5.2" height="5.2" rx="1"/><rect x="8.8" y="2" width="5.2" height="5.2" rx="1"/><rect x="2" y="8.8" width="5.2" height="5.2" rx="1"/><rect x="8.8" y="8.8" width="5.2" height="5.2" rx="1"/>'),
    medium: G('<rect x="2" y="2" width="3" height="3" rx=".6"/><rect x="6.5" y="2" width="3" height="3" rx=".6"/><rect x="11" y="2" width="3" height="3" rx=".6"/><rect x="2" y="6.5" width="3" height="3" rx=".6"/><rect x="6.5" y="6.5" width="3" height="3" rx=".6"/><rect x="11" y="6.5" width="3" height="3" rx=".6"/><rect x="2" y="11" width="3" height="3" rx=".6"/><rect x="6.5" y="11" width="3" height="3" rx=".6"/><rect x="11" y="11" width="3" height="3" rx=".6"/>'),
    small: G('<rect x="1.8" y="2.5" width="2.4" height="2.4" rx=".5"/><rect x="1.8" y="6.8" width="2.4" height="2.4" rx=".5"/><rect x="1.8" y="11.1" width="2.4" height="2.4" rx=".5"/><rect x="8.8" y="2.5" width="2.4" height="2.4" rx=".5"/><rect x="8.8" y="6.8" width="2.4" height="2.4" rx=".5"/><path d="M5.3 3.7h2M5.3 8h2M5.3 12.3h2M12.3 3.7h2M12.3 8h2"/>'),
    list: G('<path d="M2 3.5h1.2M2 8h1.2M2 12.5h1.2M5 3.5h9M5 8h9M5 12.5h9"/>'), details: G('<path d="M2 3h12M2 6.3h12M2 9.7h12M2 13h12M6 3v10"/>'),
    tiles: G('<rect x="1.8" y="2.5" width="4.4" height="4.4" rx=".8"/><rect x="1.8" y="9.1" width="4.4" height="4.4" rx=".8"/><path d="M8 3.5h6M8 5.8h4M8 10.1h6M8 12.4h4"/>'),
    content: G('<rect x="1.8" y="2.3" width="3.6" height="3.6" rx=".7"/><rect x="1.8" y="10.1" width="3.6" height="3.6" rx=".7"/><path d="M7 3.2h7M7 5.2h4M7 11h7M7 13h4M1.5 8h13" />'),
    compact: G('<path d="M2 3.5h12M2 6.5h12M2 9.5h12M2 12.5h12"/>'), show: G('<path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>'),
    taskview: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="12" height="10" rx="2" fill="#4f5b68"/><rect x="9" y="9" width="12" height="10" rx="2" fill="#9aa5b1"/></svg>',
    start: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="9" height="9" rx="1.2" fill="#2b8eea"/><rect x="12.5" y="2.5" width="9" height="9" rx="1.2" fill="#38a3f5"/><rect x="2.5" y="12.5" width="9" height="9" rx="1.2" fill="#1f7fe0"/><rect x="12.5" y="12.5" width="9" height="9" rx="1.2" fill="#2b8eea"/></svg>'
  };
  const VIEW_MODES = [['xl', 'Extra large icons'], ['large', 'Large icons'], ['medium', 'Medium icons'], ['small', 'Small icons'], ['list', 'List'], ['details', 'Details'], ['tiles', 'Tiles'], ['content', 'Content']];
  const ZOOM_ORDER = ['details', 'list', 'small', 'medium', 'large', 'xl'];
  const icoSpan = (markup, cls) => h('span', { class: 'w11-ico' + (cls ? ' ' + cls : ''), html: markup, 'aria-hidden': 'true' });
  const glyph = (name, cls) => h('span', { class: 'w11-gl' + (cls ? ' ' + cls : ''), html: GL[name] || '', 'aria-hidden': 'true' });

  /* ------------------------------------------------------------------ the in-memory file system */
  const SPECIALS = [['desktop', 'Desktop'], ['documents', 'Documents'], ['downloads', 'Downloads'], ['music', 'Music'], ['pictures', 'Pictures'], ['videos', 'Videos']];
  const PINNED = ['desktop', 'downloads', 'documents', 'pictures', 'music', 'videos'];
  function defaultSize(node, hv) {
    const rec = node.media && T.mediaRecord && T.mediaRecord(node.media);
    const m = node.meta || {};
    const dur = m.duration || (rec && rec.duration);
    const kind = kindOf(node);
    if (kind === 'video' && dur) return Math.round(dur * ((m.width || (rec && rec.w) || 1920) * (m.height || (rec && rec.h) || 1080) >= 3e6 ? 6.1e6 : 2.6e6) + (hv % 90000));
    if (node.text != null) return new Blob([node.text]).size;
    const r = (lo, hi) => Math.round(lo + (hv % 1000) / 1000 * (hi - lo));
    return ({ video: r(38e6, 260e6), audio: r(2e6, 40e6), image: r(1.2e6, 6.5e6), text: r(300, 4000), caption: r(900, 6000), sheet: r(800, 30000),
      doc: r(18e3, 90e3), pdf: r(120e3, 2.4e6), project: r(140e3, 900e3), zip: r(4e6, 180e6), shortcut: r(900, 2000) })[kind] || r(10e3, 500e3);
  }
  function buildFS(b) {
    const nodes = new Map();
    let n = 0;
    const now = Date.now();
    function make(spec, parent) {
      if (typeof spec === 'string') spec = { name: spec };
      const node = { id: 'n' + (++n), name: String(spec.name || spec.label || 'Untitled'), folder: !!(spec.folder || spec.children), parent: parent || null };
      ['media', 'meta', 'text', 'hidden', 'view', 'special', 'readOnly'].forEach(k => { if (spec[k] != null) node[k] = spec[k]; });
      if (spec.protected) node.protected = true;
      const hv = hash(node.name + (parent ? parent.name : ''));
      node.modified = spec.modified ? Date.parse(spec.modified) : now - (3600e3 + (hv % (60 * 24 * 18)) * 60000);
      node.created = node.modified - (hv % 900) * 60000;
      if (node.folder) node.children = (spec.children || []).map(c => make(c, node));
      else node.size = spec.size != null ? spec.size : defaultSize(node, hv);
      nodes.set(node.id, node);
      return node;
    }
    const root = { id: 'root', name: '', folder: true, children: [], parent: null };
    const user = b.user || 'Student';
    const userFolders = SPECIALS.map(([k, name]) => ({ name, special: k, children: b[k] || [] }));
    const c = make({ name: 'Local Disk', children: [
      { name: 'Program Files', protected: true, children: [{ name: 'Common Files', children: [] }, { name: 'Windows Media Player', children: [] }, { name: 'Windows NT', children: [] }] },
      { name: 'Users', children: [{ name: user, children: userFolders }, { name: 'Public', children: [] }] },
      { name: 'Windows', protected: true, children: [{ name: 'Fonts', children: [] }, { name: 'System32', children: [] }, { name: 'Temp', children: [] }] }
    ] }, root);
    c.drive = { letter: 'C', kind: 'system', capacity: 237.3 * 1073741824, baseUsed: 131.6 * 1073741824 };
    root.children.push(c);
    const letters = 'EFGHIJKLMNOPQRSTUVWXYZ'.split('');
    (b.drives || []).forEach(d => {
      const kind = d.kind || 'usb';
      const letter = (d.letter || letters.find(l => !root.children.some(x => x.drive.letter === l))).toUpperCase();
      const node = make({ ...d, name: d.name || d.label || (kind === 'sd' ? 'Camera Card' : 'USB Drive'), folder: true, children: d.children || [] }, root);
      const cap = d.capacity || ({ usb: 32, sd: 64, network: 500, cloud: 1024 })[kind] * 1e9;
      node.drive = { letter, kind, capacity: cap, baseUsed: d.used != null ? d.used : kind === 'network' ? cap * 0.42 : kind === 'cloud' ? cap * 0.08 : 0 };
      root.children.push(node);
    });
    const special = {};
    nodes.forEach(x => { if (x.special) special[x.special] = x; });
    return { root, nodes, special, user, userHome: special.desktop.parent, c };
  }
  const isAttached = (fs, node) => { for (let x = node; x; x = x.parent) if (x === fs.root) return true; return false; };
  const isAncestor = (a, b) => { for (let x = b; x; x = x.parent) if (x === a) return true; return false; };
  const driveOf = node => { let x = node; while (x && x.parent && !x.drive) x = x.parent; return x && x.drive ? x : null; };
  const isProtected = node => { for (let x = node; x; x = x.parent) if (x.protected) return true; return false; };
  const treeSize = node => node.folder ? node.children.reduce((s, c) => s + treeSize(c), 0) : (node.size || 0);
  const countTree = node => { let files = 0, folders = 0; (function walk(x) { x.children.forEach(c => { if (c.folder) { folders++; walk(c); } else files++; }); })(node); return { files, folders }; };
  function cloneTree(node, parent, nodes, uid) {
    const c = { ...node, id: uid(), parent, created: Date.now() };
    delete c.drive; delete c.special; delete c.protected;
    if (node.folder) c.children = node.children.map(x => cloneTree(x, c, nodes, uid));
    nodes.set(c.id, c);
    return c;
  }
  const driveLabel = node => node.name + ' (' + node.drive.letter + ':)';

  /* ------------------------------------------------------------------ item surfaces (the desktop and each Explorer content area)
     Handles click, Ctrl+click, Shift+click, Ctrl+Shift+click, drag-select boxes, double-click, type-ahead and arrow keys. */
  class Surface {
    constructor(sim, host, o) {
      this.sim = sim; this.host = host; this.o = o; host._surface = this;
      this.sel = new Set(); this.anchor = null; this.focus = null; this.typed = ''; this.typedAt = 0; this.selAt = null;
      host.addEventListener('pointerdown', e => this.down(e));
      host.addEventListener('dblclick', e => this.dbl(e));
      host.addEventListener('wheel', e => { if (modKey(e) && o.zoom) { e.preventDefault(); o.zoom(e.deltaY < 0 ? 1 : -1); } }, { passive: false });
    }
    entries() { return this.o.entries(); }
    entry(key) { return this.entries().find(e => e.key === key); }
    selected() { return this.entries().filter(e => this.sel.has(e.key)); }
    nodes() { return this.selected().map(e => e.node).filter(n => n && !n.virtual); }
    itemEls() { return [...this.host.querySelectorAll('[data-key]')]; }
    elFor(key) { return this.host.querySelector('[data-key="' + CSS.escape(key) + '"]'); }
    set(keys, anchor) { this.sel = new Set(keys); if (anchor !== undefined) this.anchor = anchor; this.sync(); }
    clear() { if (this.sel.size) this.set([]); }
    selectAll() { this.set(this.entries().map(e => e.key)); this.sim.log('select-all', {}); }
    selectNodes(nodes) { const keys = this.entries().filter(e => nodes.includes(e.node)).map(e => e.key); this.set(keys, keys[0] || null); this.focus = keys[0] || null; this.sync(); if (keys[0]) this.scrollTo(keys[0]); }
    sync() {
      const map = new Map(this.entries().map(e => [e.key, e]));
      [...this.sel].forEach(k => { if (!map.has(k)) this.sel.delete(k); });
      const cut = this.sim.clipboard && this.sim.clipboard.mode === 'cut' ? this.sim.clipboard.nodes : null;
      this.itemEls().forEach(el => {
        const k = el.dataset.key, on = this.sel.has(k), en = map.get(k);
        el.classList.toggle('sel', on);
        el.setAttribute('aria-selected', String(on));
        el.classList.toggle('focus', k === this.focus);
        el.classList.toggle('cut', !!(cut && en && cut.includes(en.node)));
        const cb = el.querySelector('.w11-cb'); if (cb) cb.classList.toggle('on', on);
      });
      if (this.o.onSelect) this.o.onSelect();
      this.sim.queueTasks();
    }
    range(a, b) {
      const ents = this.entries(), i = ents.findIndex(e => e.key === a), j = ents.findIndex(e => e.key === b);
      if (i < 0 || j < 0) return [b];
      return ents.slice(Math.min(i, j), Math.max(i, j) + 1).map(e => e.key);
    }
    scrollTo(key) {
      // Scroll only this list, never the page around the practice desktop.
      const el = this.elFor(key), host = this.host;
      if (!el) return;
      const r = el.getBoundingClientRect(), hr = host.getBoundingClientRect(), head = host.querySelector('.w11-colhead');
      const top = hr.top + (head ? head.offsetHeight : 0);
      if (r.top < top) host.scrollTop -= top - r.top; else if (r.bottom > hr.bottom) host.scrollTop += r.bottom - hr.bottom;
      if (r.left < hr.left) host.scrollLeft -= hr.left - r.left; else if (r.right > hr.right) host.scrollLeft += r.right - hr.right;
    }
    down(e) {
      const sim = this.sim;
      if (e.target.closest('.w11-rename, .w11-colhead, .w11-nohit')) return;
      let button = e.button;
      if (IS_MAC && button === 0 && e.ctrlKey) button = 2;
      sim.closeMenu(); sim.closeStart();
      if (this.o.focusSelf) this.o.focusSelf();
      const itemEl = e.target.closest('[data-key]');
      if (button === 1) {
        e.preventDefault();
        const en = itemEl && this.entry(itemEl.dataset.key);
        if (en && this.o.openTab && (en.node.folder || en.node.virtual)) this.o.openTab(en);
        return;
      }
      if (button !== 0 && button !== 2) return;
      if (!itemEl) {
        if (button === 2) {
          if (!modClick(e) && !e.shiftKey) this.clear();
          sim.track(e, { onClick: ev => sim.bgMenu(this, ev.clientX, ev.clientY) });
          return;
        }
        if (!modClick(e) && !e.shiftKey) this.clear();
        this.marquee(e);
        return;
      }
      const key = itemEl.dataset.key, was = this.sel.has(key), only = was && this.sel.size === 1;
      let pending = null;
      if (button === 2) { if (!was) this.set([key], key); }
      else if (e.target.closest('.w11-cb')) { const s = new Set(this.sel); if (was) s.delete(key); else s.add(key); this.set(s, key); sim.log('select-toggle', {}); }
      else if (modClick(e) && e.shiftKey) { const s = new Set(this.sel); this.range(this.anchor || key, key).forEach(k => s.add(k)); this.set(s); sim.log('select-range', { add: true }); }
      else if (e.shiftKey) { this.set(this.range(this.anchor || key, key)); sim.log('select-range', {}); }
      else if (modClick(e)) { if (!was) { this.set([...this.sel, key], key); sim.log('select-toggle', {}); } else pending = 'toggle'; }
      else if (!was) { this.set([key], key); this.selAt = { key, t: Date.now() }; }
      else pending = 'single';
      this.focus = key;
      this.sync();
      const onLabel = !!e.target.closest('.w11-label');
      sim.track(e, {
        surface: this, entry: this.entry(key), button,
        onClick: ev => {
          clearTimeout(this.renameTimer);
          if (pending === 'toggle') { const s = new Set(this.sel); s.delete(key); this.set(s, key); sim.log('select-toggle', {}); }
          if (pending === 'single') {
            this.set([key], key);
            // A second, slower click on the name of the only selected item starts a rename, as in Windows.
            if (only && onLabel && this.selAt && this.selAt.key === key && Date.now() - this.selAt.t > 700) this.renameTimer = setTimeout(() => this.startRename(key), 520);
            this.selAt = { key, t: Date.now() };
          }
          if (button === 2) sim.itemMenu(this, ev.clientX, ev.clientY);
        }
      });
    }
    dbl(e) {
      clearTimeout(this.renameTimer);
      if (e.target.closest('.w11-rename, .w11-colhead, .w11-cb')) return;
      const itemEl = e.target.closest('[data-key]');
      if (!itemEl) return;
      const en = this.entry(itemEl.dataset.key);
      if (en) { this.sim.log('double-click', { path: en.node.virtual ? en.node.name : this.sim.pathOf(en.node) }); this.o.open(en, e); }
    }
    pt(e) { const r = this.host.getBoundingClientRect(); return { x: e.clientX - r.left + this.host.scrollLeft, y: e.clientY - r.top + this.host.scrollTop }; }
    rel(el) { const r = el.getBoundingClientRect(), hr = this.host.getBoundingClientRect(); return { x: r.left - hr.left + this.host.scrollLeft, y: r.top - hr.top + this.host.scrollTop, w: r.width, h: r.height }; }
    marquee(e) {
      const start = this.pt(e), base = new Set(this.sel), add = modClick(e) || e.shiftKey;
      let box = null, rects = null;
      this.sim.track(e, {
        threshold: 3,
        onStart: () => {
          box = h('div', { class: 'w11-marquee' }); this.host.append(box);
          rects = this.itemEls().map(el => [el.dataset.key, this.rel(el.querySelector('.w11-hit') || el)]);
          this.sim.log('marquee', {});
        },
        onMove: ev => {
          const hr = this.host.getBoundingClientRect();
          if (ev.clientY > hr.bottom - 6) this.host.scrollTop += 14; else if (ev.clientY < hr.top + 6) this.host.scrollTop -= 14;
          if (ev.clientX > hr.right - 6) this.host.scrollLeft += 14; else if (ev.clientX < hr.left + 6) this.host.scrollLeft -= 14;
          const p = this.pt(ev);
          const maxX = this.host.scrollWidth, maxY = this.host.scrollHeight;
          const x = clamp(Math.min(p.x, start.x), 0, maxX), y = clamp(Math.min(p.y, start.y), 0, maxY);
          const w = clamp(Math.max(p.x, start.x), 0, maxX) - x, hh = clamp(Math.max(p.y, start.y), 0, maxY) - y;
          Object.assign(box.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' });
          const hits = new Set(rects.filter(([, r]) => r.x < x + w && r.x + r.w > x && r.y < y + hh && r.y + r.h > y).map(([k]) => k));
          this.sel = add ? new Set([...[...base].filter(k => !hits.has(k)), ...[...hits].filter(k => !base.has(k))]) : hits;
          if (hits.size) this.anchor = [...hits][0];
          this.sync();
        },
        onEnd: () => { if (box) box.remove(); }
      });
    }
    key(e) {
      const sim = this.sim, k = e.key, ctrl = modKey(e), lk = k.length === 1 ? k.toLowerCase() : k;
      const target = this.o.target();
      const folder = target && target !== 'recycle' ? target : null;
      if (ctrl && !e.shiftKey && !e.altKey && lk === 'a') { this.selectAll(); return true; }
      if (ctrl && e.shiftKey && lk === 'c') { sim.copyAsPath(this.nodes()); return true; }
      if (ctrl && lk === 'c') { sim.setClip(this.nodes(), 'copy'); return true; }
      if (ctrl && lk === 'x') { sim.setClip(this.nodes(), 'cut'); return true; }
      if (ctrl && lk === 'v') { if (folder) sim.paste(folder, this); return true; }
      if (ctrl && lk === 'z') { sim.undo(); return true; }
      if (ctrl && e.shiftKey && lk === 'n') { if (folder) sim.newItem(folder, 'folder', this); return true; }
      if (k === 'Delete') { if (this.sel.size) sim.deleteNodes(this.nodes(), e.shiftKey); return true; }
      if (k === 'F2') { if (this.sel.size) this.startRename(this.sel.has(this.focus) ? this.focus : [...this.sel][0]); return true; }
      if (k === 'Enter' && e.altKey) { const en = this.selected()[0]; sim.properties(en ? en.node : folder); return true; }
      if (k === 'Enter') { this.openSelection(); return true; }
      if ((k === 'F10' && e.shiftKey) || k === 'ContextMenu') {
        const el = this.focus && this.sel.has(this.focus) ? this.elFor(this.focus) : null;
        const r = (el || this.host).getBoundingClientRect();
        if (this.sel.size) sim.itemMenu(this, r.left + Math.min(40, r.width / 2), r.top + Math.min(r.height, 30));
        else sim.bgMenu(this, r.left + 40, r.top + 30);
        return true;
      }
      if (k === 'F5') { sim.refresh(); return true; }
      const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Home: 'home', End: 'end' };
      if (dirs[k]) { this.move(dirs[k], e); return true; }
      if (k === ' ' && ctrl) { if (this.focus) { const s = new Set(this.sel); if (s.has(this.focus)) s.delete(this.focus); else s.add(this.focus); this.set(s, this.focus); } return true; }
      if (k.length === 1 && !ctrl && !e.altKey && /\S/.test(k)) { this.typeAhead(k); return true; }
      return false;
    }
    openSelection() {
      const sel = this.selected();
      if (!sel.length) return;
      const folders = sel.filter(en => en.node.folder || en.node.virtual), files = sel.filter(en => !(en.node.folder || en.node.virtual));
      files.forEach(en => this.o.open(en));
      folders.forEach((en, i) => i === 0 ? this.o.open(en) : this.sim.openEntry(en, null));
    }
    move(dir, e) {
      const ents = this.entries();
      if (!ents.length) return;
      const cur = this.focus && ents.some(x => x.key === this.focus) ? this.focus : null;
      let next;
      if (!cur) next = ents[0].key;
      else if (dir === 'home') next = ents[0].key;
      else if (dir === 'end') next = ents[ents.length - 1].key;
      else next = this.neighbor(cur, dir, ents);
      if (!next) return;
      this.focus = next;
      if (e.shiftKey) this.sel = new Set(this.range(this.anchor || cur || next, next));
      else if (!modKey(e)) { this.sel = new Set([next]); this.anchor = next; }
      this.sync();
      this.scrollTo(next);
    }
    neighbor(cur, dir, ents) {
      const mode = this.o.mode(), i = ents.findIndex(x => x.key === cur);
      const step = d => (ents[i + d] || {}).key;
      if (mode === 'details' || mode === 'content') return dir === 'up' ? step(-1) : dir === 'down' ? step(1) : null;
      const colMajor = mode === 'list' || mode === 'desktop';
      if (mode === 'list' && (dir === 'up' || dir === 'down')) return step(dir === 'down' ? 1 : -1);
      if (!colMajor && (dir === 'left' || dir === 'right')) return step(dir === 'right' ? 1 : -1);
      const el = this.elFor(cur);
      if (!el) return null;
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let best = null, bs = Infinity;
      this.itemEls().forEach(o => {
        if (o === el) return;
        const q = o.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
        const horiz = dir === 'left' || dir === 'right';
        const p = dir === 'right' ? dx : dir === 'left' ? -dx : dir === 'down' ? dy : -dy, s = horiz ? Math.abs(dy) : Math.abs(dx);
        if (p <= 4 || s > (horiz ? r.height : r.width) * 0.75) return;
        if (p + s < bs) { bs = p + s; best = o; }
      });
      if (best) return best.dataset.key;
      return mode === 'desktop' || !colMajor ? step(dir === 'down' || dir === 'right' ? 1 : -1) : null;
    }
    typeAhead(ch) {
      const now = Date.now();
      this.typed = (now - this.typedAt < 900 ? this.typed : '') + ch.toLowerCase();
      this.typedAt = now;
      const ents = this.entries();
      const start = Math.max(0, ents.findIndex(x => x.key === this.focus)) + (this.typed.length === 1 ? 1 : 0);
      for (let j = 0; j < ents.length; j++) {
        const en = ents[(start + j) % ents.length];
        if (this.sim.shown(en.node).toLowerCase().startsWith(this.typed)) { this.focus = en.key; this.set([en.key], en.key); this.scrollTo(en.key); return; }
      }
    }
    startRename(key) {
      const sim = this.sim, en = this.entry(key);
      if (!en) return;
      const n = en.node;
      if (n.virtual || n.drive || n.special || en.rec || !n.parent) return;
      if (isProtected(n)) { sim.denied(n, 'rename'); return; }
      const el = this.elFor(key);
      if (!el) return;
      const label = el.querySelector('.w11-label');
      this.focus = key; this.set([key], key);
      const full = n.folder || sim.showExt || !extOf(n.name);
      const ta = h('textarea', { class: 'w11-rename', spellcheck: 'false', rows: '1', 'aria-label': 'New name' });
      ta.value = full ? n.name : baseOf(n.name);
      label.hidden = true; label.after(ta);
      el.classList.add('renaming');
      const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
      ta.focus();
      ta.setSelectionRange(0, full && !n.folder && extOf(n.name) ? baseOf(n.name).length : ta.value.length);
      fit();
      let busy = false, ended = false;
      const finish = async commit => {
        if (busy || ended) return;
        busy = true;
        if (commit) {
          const res = await sim.renameNode(n, ta.value, { fullName: full });
          if (res === 'retry') { busy = false; ta.focus(); ta.select(); return; }
        }
        ended = true;
        this.renaming = null;
        ta.remove(); label.hidden = false; el.classList.remove('renaming');
        sim.refresh();
        this.selectNodes([n]);
        if (this.o.focusSelf) this.o.focusSelf();
      };
      ta.addEventListener('keydown', ev => {
        ev.stopPropagation();
        if (ev.key === 'Enter' || ev.key === 'Tab') { ev.preventDefault(); finish(true); }
        else if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
      });
      ta.addEventListener('beforeinput', ev => {
        if (ev.data && BAD_CHARS.test(ev.data)) { ev.preventDefault(); sim.balloon(ta, 'A file name can\'t contain any of the following characters:', '\\ / : * ? " < > |'); }
        if (ev.inputType === 'insertLineBreak') ev.preventDefault();
      });
      ta.addEventListener('input', fit);
      ta.addEventListener('blur', () => setTimeout(() => { if (!sim.modal && !ended) finish(true); }, 0));
      ta.addEventListener('pointerdown', ev => ev.stopPropagation());
      ta.addEventListener('dblclick', ev => ev.stopPropagation());
      this.renaming = { finish };
    }
  }

  /* ------------------------------------------------------------------ the simulation */
  class Sim {
    constructor(block) {
      this.block = block;
      this.windows = [];
      this.wrap = h('section', { class: 'w11-wrap' });
      this.wrap._sim = this; // for the automated checks in specs/checks
      this.screen = h('div', { class: 'w11', tabindex: '0', role: 'application', 'aria-label': 'Practice Windows 11 desktop. Files here are pretend copies; nothing on your real computer changes.' });
      this.deskEl = h('div', { class: 'w11-desktop w11-surface', 'data-drop': 'surface', tabindex: '-1', role: 'listbox', 'aria-label': 'Desktop', 'aria-multiselectable': 'true' });
      this.layer = h('div', { class: 'w11-layer' });
      this.taskbar = h('div', { class: 'w11-taskbar' });
      this.overlay = h('div', { class: 'w11-overlay' });
      this.screen.append(this.deskEl, this.layer, this.taskbar, this.overlay);
      this.sysPC = { id: 'sys:thispc', name: 'This PC', virtual: 'thispc' };
      this.sysBin = { id: 'sys:recycle', name: 'Recycle Bin', virtual: 'recycle' };
      this.desk = new Surface(this, this.deskEl, {
        entries: () => this.deskEntries(), target: () => this.fs.special.desktop, mode: () => 'desktop',
        open: en => this.openEntry(en, null), focusSelf: () => this.focusDesktop(),
        zoom: dir => { const order = ['small', 'medium', 'large'], i = clamp(order.indexOf(this.deskSize) + dir, 0, 2); this.setDeskSize(order[i]); }
      });
      this.buildChrome();
      this.buildTaskbar();
      this.bind();
      this.reset();
    }
    /* ---------- page chrome around the screen: title, full screen, reset and the task list */
    buildChrome() {
      const full = h('button', { type: 'button', class: 'w11-headbtn', text: 'Full screen' });
      full.onclick = () => this.toggleFull();
      const reset = h('button', { type: 'button', class: 'w11-headbtn', text: 'Start over' });
      reset.onclick = () => this.restart();
      this.fullBtn = full;
      this.head = h('div', { class: 'w11-head' },
        h('div', { class: 'w11-headtitle' }, h('strong', { text: this.block.title || 'Practice desktop' }), h('span', { text: 'Works like Windows 11. Files here are practice copies.' })),
        h('div', { class: 'w11-headbtns' }, full, reset));
      this.tasksEl = h('div', { class: 'w11-tasks' });
      this.help = h('details', { class: 'w11-help' }, h('summary', { text: 'Mouse and keyboard help' }), h('div', { class: 'w11-helpgrid', html: [
        ['Click', 'Select one item'], ['Double-click or Enter', 'Open'], ['Ctrl + click', 'Add or remove one item from the selection'], ['Shift + click', 'Select everything between two items'],
        ['Ctrl + Shift + click', 'Add a range to what is already selected'], ['Drag on empty space', 'Draw a box to select several items'], ['Ctrl + A', 'Select all'], ['Right-click or Shift + F10', 'Show the menu for an item'],
        ['Drag', 'Move on the same drive, copy to another drive'], ['Ctrl while dragging', 'Copy'], ['Shift while dragging', 'Move'], ['Right-drag', 'Choose Copy here or Move here'],
        ['Ctrl + C, Ctrl + X, Ctrl + V', 'Copy, cut, paste'], ['Ctrl + Z', 'Undo'], ['F2', 'Rename'], ['Delete', 'Send to the Recycle Bin'],
        ['Ctrl + Shift + N', 'New folder'], ['Alt + Enter', 'Properties'], ['Alt + Left arrow or Backspace', 'Back'], ['Alt + Up arrow', 'Up one folder'],
        ['Ctrl + L', 'Type in the address bar'], ['Ctrl + E', 'Search'], ['Ctrl + mouse wheel', 'Bigger or smaller icons'], ['Ctrl + Shift + 1 to 8', 'Change the view'],
        ['Ctrl + Esc', 'Open Start'], ['On a Mac', 'Use Command where Windows uses Ctrl']
      ].map(([a, b]) => '<kbd>' + a + '</kbd><span>' + b + '</span>').join('') }));
      this.wrap.append(this.head, h('div', { class: 'w11-stage' }, this.screen), this.tasksEl, this.help);
    }
    toggleFull() {
      const doc = document;
      if (doc.fullscreenElement === this.wrap) { doc.exitFullscreen(); return; }
      const req = this.wrap.requestFullscreen || this.wrap.webkitRequestFullscreen;
      if (req) Promise.resolve(req.call(this.wrap)).then(() => { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['MetaLeft', 'MetaRight', 'KeyW', 'KeyN', 'KeyT']).catch(() => {}); this.screen.focus(); }).catch(() => {});
    }
    async restart() {
      const r = await this.dialog({ title: 'Start over?', message: 'This puts every file back where it started and clears your finished tasks.', buttons: [{ label: 'Start over', value: 'yes', primary: true }, { label: 'Cancel', value: 'no' }] });
      if (r.value !== 'yes') return;
      const splash = h('div', { class: 'w11-splash' }, h('div', { class: 'w11-spinner' }), h('span', { text: 'Restarting' }));
      this.screen.append(splash);
      setTimeout(() => { this.reset(); splash.remove(); }, 900);
    }
    reset() {
      this.windows.forEach(w => w.el.remove());
      this.windows = []; this.active = null; this.z = 10;
      this.fs = buildFS(this.block);
      let next = this.fs.nodes.size + 1000;
      this.uid = () => 'n' + (++next);
      this.events = []; this.done = new Set(); this.hints = new Set(); this.undoStack = [];
      this.clipboard = null; this.recycle = []; this.recent = [];
      this.pins = PINNED.map(k => this.fs.special[k]);
      this.prefs = new Map(); this.showExt = this.block.extensions !== false; this.showHidden = false; this.checkboxes = false; this.compact = false;
      this.deskPos = new Map(); this.deskSize = this.block.desktopIcons || 'medium'; this.deskShow = true; this.autoArrange = false; this.ejected = [];
      this.desk.set([]); this.desk.focus = null;
      this.closeMenu(); this.closeStart();
      this.renderDesktop();
      this.renderTaskbar();
      [].concat(this.block.open || []).forEach(p => { const loc = this.parseLoc(p); if (loc) this.openExplorer(loc); });
      this.updateTasks();
    }
    bind() {
      const s = this.screen;
      s.addEventListener('contextmenu', e => e.preventDefault());
      s.addEventListener('keydown', e => this.onKey(e));
      s.addEventListener('keyup', e => { if (!IS_MAC && e.key === 'Meta' && this.winKey) { this.winKey = false; this.toggleStart(); } });
      s.addEventListener('pointerdown', e => {
        s.classList.remove('kbd');
        if (this.menuEl && !e.target.closest('.w11-menu')) this.closeMenu();
        if (this.startEl && !e.target.closest('.w11-start, .w11-tb-start, .w11-tb-search')) this.closeStart();
        if (e.target === this.deskEl || e.target.closest('.w11-desktop')) this.focusDesktop();
      }, true);
      s.addEventListener('dragstart', e => e.preventDefault());
      if (window.ResizeObserver) new ResizeObserver(() => this.onResize()).observe(s);
      document.addEventListener('fullscreenchange', () => {
        const on = document.fullscreenElement === this.wrap;
        this.wrap.classList.toggle('is-full', on);
        this.fullBtn.textContent = on ? 'Exit full screen' : 'Full screen';
        if (!on && navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
      });
    }
    onResize() {
      const r = this.screen.getBoundingClientRect();
      if (!r.width) return;
      if (!this._measured && r.height > 200) {
        this._measured = true; this.deskPos.clear();
        // Windows opened before the page laid out were placed for a guessed size; place them again.
        this.windows.forEach(w => { if (!w.userPlaced && w.place) { w.x = w.y = null; w.w = w.w0; w.h = w.h0; w.place(); } });
      }
      this.windows.forEach(w => w.clampToScreen && w.clampToScreen());
      if (this._lastH !== r.height) { this._lastH = r.height; this.renderDesktop(); }
    }
    size() { const r = this.screen.getBoundingClientRect(); return r.width > 200 && r.height > 200 ? { w: r.width, h: r.height - 48 } : { w: 1180, h: 640 }; }

    /* ---------- events and tasks */
    log(type, data) { this.events.push(Object.assign({ type, at: Date.now() }, data)); this.queueTasks(); }
    queueTasks() { if (this._tq) return; this._tq = setTimeout(() => { this._tq = 0; this.updateTasks(); }, 30); }
    state() {
      const ev = this.events, sim = this;
      const eq = (a, b) => a != null && b != null && sim.canon(a) === sim.canon(b);
      const has = (type, p) => ev.some(e => e.type === type && (p == null || eq(e.path, p)));
      const w = this.activeExplorer();
      const surf = w ? w.surface : this.desk;
      const selection = surf.selected().map(en => ({ name: en.node.name, folder: !!en.node.folder, path: en.node.virtual ? en.node.name : sim.pathOf(en.node), node: en.node }));
      const location = w ? sim.locPath(w.tab.loc) : 'Desktop';
      return {
        locate: p => sim.locate(p), exists: p => !!sim.locate(p), isFolder: p => !!(sim.locate(p) || {}).folder,
        opened: p => has('open', p), previewed: p => has('open-file', p), closed: p => has('close', p),
        copiedTo: p => has('copy', p), movedTo: p => has('move', p), renamed: p => has('rename', p), searched: p => has('search', p),
        deleted: p => has('delete', p) || has('delete-permanent', p), restored: p => has('restore', p),
        did: (type, test) => ev.some(e => e.type === type && (test == null || (typeof test === 'function' ? test(e) : e.detail === test || eq(e.path, test)))),
        events: ev, selection, selectedNames: selection.map(x => x.name),
        selected: (...names) => selection.length === names.length && names.every(n => selection.some(x => same(x.name, n))),
        location, at: p => eq(location, p), view: w ? w.view() : null, count: w ? w.surface.entries().length : this.deskEntries().length,
        inBin: name => sim.recycle.some(r => same(r.node.name, name)), bin: sim.recycle.map(r => r.node.name),
        windows: sim.windows.filter(x => x.app === 'explorer').length, apps: sim.windows.map(x => x.app),
        extensions: sim.showExt, clipboard: sim.clipboard && sim.clipboard.mode, pathOf: n => sim.pathOf(n)
      };
    }
    updateTasks() {
      const tasks = this.block.tasks || [];
      this.tasksEl.hidden = !tasks.length;
      if (!tasks.length) return;
      const s = this.state();
      const fresh = [];
      tasks.forEach((task, i) => {
        let ok = false;
        try { ok = !!task.check(s); } catch (err) { ok = false; }
        if (ok && !this.done.has(i)) { this.done.add(i); fresh.push(i); }
        if (!ok && task.sticky === false) this.done.delete(i);
      });
      const n = this.done.size;
      const list = h('ol', { class: 'w11-tasklist' }, tasks.map((task, i) => {
        const done = this.done.has(i);
        const hintBtn = task.hint && !done ? h('button', { type: 'button', class: 'w11-hintbtn', text: this.hints.has(i) ? 'Hide hint' : 'Hint' }) : null;
        if (hintBtn) hintBtn.onclick = () => { if (this.hints.has(i)) this.hints.delete(i); else this.hints.add(i); this.updateTasks(); };
        return h('li', { class: (done ? 'done' : '') + (fresh.includes(i) ? ' fresh' : '') },
          h('span', { class: 'w11-taskmark', html: done ? GL.check : '', 'aria-hidden': 'true' }),
          h('span', { class: 'w11-tasktext' }, h('span', { html: md(task.text) }), done ? h('span', { class: 'sr-only', text: ' (done)' }) : null,
            hintBtn, this.hints.has(i) && !done ? h('span', { class: 'w11-hint', html: md(task.hint) }) : null));
      }));
      const all = n === tasks.length;
      fill(this.tasksEl, 
        h('div', { class: 'w11-taskhead' }, h('strong', { text: 'Tasks' }), h('span', { class: 'w11-taskcount', role: 'status', text: all ? 'All ' + n + ' done. Nice work.' : n + ' of ' + tasks.length + ' done' }),
          h('span', { class: 'w11-taskbar-prog' }, h('span', { style: 'width:' + (n / tasks.length * 100) + '%' }))),
        list);
      this.wrap.classList.toggle('all-done', all);
    }

    /* ---------- names and paths */
    label(node) { return node.virtual ? node.name : node.drive ? driveLabel(node) : node.name; }
    shown(node) { if (node.virtual || node.drive) return this.label(node); if (!node.folder && !node.link && !this.showExt && extOf(node.name)) return baseOf(node.name); return node.name; }
    chain(node) { const out = []; for (let x = node; x && x !== this.fs.root; x = x.parent) { out.unshift(x); if (x.special) break; } return out; }
    pathOf(node) {
      if (!node) return '';
      if (node.virtual) return node.name;
      const c = this.chain(node), segs = c.map(x => this.label(x));
      if (c[0] && c[0].drive) segs.unshift('This PC');
      return segs.join(' > ');
    }
    winPath(node) {
      if (!node || node.virtual) return node ? node.name : '';
      const segs = [];
      for (let x = node; x && x !== this.fs.root; x = x.parent) segs.unshift(x.drive ? x.drive.letter + ':' : x.name);
      return segs.length === 1 ? segs[0] + '\\' : segs.join('\\');
    }
    canon(p) {
      if (p && typeof p === 'object') p = this.pathOf(p);
      const low = s => s.toLowerCase();
      let segs = String(p).split(/\s*(?:>|\\|\/|›)\s*/).map(x => x.trim()).filter(Boolean);
      if (segs.length && low(segs[0]) === 'this pc') segs.shift();
      if (!segs.length) return 'this pc';
      const first = low(segs[0]);
      let head = null;
      const drv = this.fs.root.children.concat(this.ejected).find(d => (/^[a-z]:$/.test(first) && low(d.drive.letter) === first[0]) || first === low(driveLabel(d)) || first === low(d.name));
      if (drv) {
        head = 'drive:' + low(drv.drive.letter); segs.shift();
        if (drv === this.fs.c && segs.length >= 3 && low(segs[0]) === 'users' && low(segs[1]) === low(this.fs.user)) {
          const sp = SPECIALS.find(([, nm]) => low(nm) === low(segs[2]));
          if (sp) { head = 'sp:' + sp[0]; segs = segs.slice(3); }
        }
      } else {
        const sp = SPECIALS.find(([, nm]) => low(nm) === first);
        if (sp) { head = 'sp:' + sp[0]; segs.shift(); }
      }
      return [head].concat(segs.map(low)).filter(Boolean).join('/');
    }
    locate(p) {
      const key = this.canon(p).split('/');
      let node = null;
      if (key[0].startsWith('sp:')) node = this.fs.special[key[0].slice(3)];
      else if (key[0].startsWith('drive:')) node = this.fs.root.children.find(d => d.drive.letter.toLowerCase() === key[0].slice(6));
      if (!node) return null;
      for (const seg of key.slice(1)) {
        node = node.folder ? node.children.find(c => c.name.toLowerCase() === seg) : null;
        if (!node) return null;
      }
      return { node, folder: !!node.folder, name: node.name, path: this.pathOf(node) };
    }
    parseLoc(p) {
      const s = String(p || '').trim().toLowerCase();
      const virt = { home: 'home', 'quick access': 'home', gallery: 'gallery', 'this pc': 'thispc', 'recycle bin': 'recycle', network: 'network', desktop: null };
      if (s in virt && virt[s]) return { t: virt[s] };
      const r = this.locate(p);
      return r && r.folder ? { t: 'node', node: r.node } : null;
    }
    locTitle(loc) {
      if (loc.t === 'node') return this.label(loc.node);
      if (loc.t === 'search') return 'Search Results in ' + this.locTitle(loc.base);
      return { home: 'Home', thispc: 'This PC', gallery: 'Gallery', recycle: 'Recycle Bin', network: 'Network' }[loc.t];
    }
    locIcon(loc) {
      if (loc.t === 'node') return this.iconMarkup(loc.node);
      if (loc.t === 'search') return GL.search;
      return { home: ICON.home, thispc: ICON.pc, gallery: ICON.gallery, recycle: ICON.bin(this.recycle.length > 0), network: ICON.network }[loc.t];
    }
    locPath(loc) { return loc.t === 'node' ? this.pathOf(loc.node) : loc.t === 'search' ? this.locPath(loc.base) : this.locTitle(loc); }
    locEq(a, b) { return !!a && !!b && a.t === b.t && (a.t !== 'node' || a.node === b.node) && (a.t !== 'search' || (a.q === b.q && this.locEq(a.base, b.base))); }
    visible(list) { return list.filter(n => this.showHidden || !n.hidden); }
    freeSpace(drive) { return Math.max(0, drive.drive.capacity - drive.drive.baseUsed - treeSize(drive)); }

    /* ---------- icons */
    iconMarkup(node) {
      if (node.virtual === 'thispc') return ICON.pc;
      if (node.virtual === 'recycle') return ICON.bin(this.recycle.length > 0);
      if (node.drive) return ({ system: ICON.hdd, usb: ICON.usb, sd: ICON.sd, network: ICON.net, cloud: ICON.cloud })[node.drive.kind] || ICON.usb;
      if (node.special) return ICON[node.special];
      if (node.link) return this.iconMarkup(node.link);
      if (node.folder) return ICON.folder(node.children.some(c => this.showHidden || !c.hidden));
      return ICON.file(kindOf(node));
    }
    thumbSrc(node) {
      if (!node.media || !T.mediaRecord) return null;
      const rec = T.mediaRecord(node.media);
      if (!rec || rec.status === 'placeholder') return null;
      if (rec.type === 'video') return rec.poster ? T.mediaURL({ file: rec.poster }) : null;
      return /photo|image|still/.test(rec.type || '') ? T.mediaURL(rec) : null;
    }
    iconEl(node, px, thumb) {
      const wrap = h('span', { class: 'w11-icon', style: 'width:' + px + 'px;height:' + px + 'px' });
      const src = thumb && px >= 40 && !node.folder ? this.thumbSrc(node) : null;
      if (src) {
        wrap.classList.add('thumb', 'k-' + kindOf(node));
        const img = h('img', { src, alt: '', draggable: 'false' });
        img.onerror = () => { wrap.classList.remove('thumb'); wrap.innerHTML = this.iconMarkup(node); };
        wrap.append(img);
      } else wrap.innerHTML = this.iconMarkup(node);
      if (node.link) wrap.append(h('span', { class: 'w11-lnk', html: '<svg viewBox="0 0 10 10"><rect width="10" height="10" rx="1.5" fill="#fff" stroke="#8a8a8a" stroke-width=".8"/><path d="M3 7.5c0-2.3 1.2-3.6 4-3.6M5.6 2.6 7.2 3.9 5.6 5.3" fill="none" stroke="#0f6cbd" stroke-width="1.1"/></svg>' }));
      if (node.hidden) wrap.classList.add('ghost');
      return wrap;
    }

    /* ---------- desktop */
    deskCell() { return ({ small: [74, 70, 32], medium: [80, 96, 48], large: [118, 140, 96] })[this.deskSize]; }
    deskRows() { const [, ch] = this.deskCell(); return Math.max(1, Math.floor((this.size().h - 8) / ch)); }
    deskEntries() {
      if (!this.deskShow || !this.fs) return [];
      const list = [{ key: this.sysPC.id, node: this.sysPC }, { key: this.sysBin.id, node: this.sysBin }]
        .concat(this.visible(this.fs.special.desktop.children).map(n => ({ key: n.id, node: n })));
      const pos = k => this.deskPos.get(k) || { c: 999, r: 999 };
      return list.sort((a, b) => (pos(a.key).c - pos(b.key).c) || (pos(a.key).r - pos(b.key).r));
    }
    freeCell(used, rows, near) {
      if (near) {
        let best = null, bd = Infinity;
        for (let c = 0; c < 40; c++) for (let r = 0; r < rows; r++) {
          if (used.has(c + ',' + r)) continue;
          const d = (c - near.c) ** 2 + (r - near.r) ** 2;
          if (d < bd) { bd = d; best = { c, r }; }
        }
        return best || { c: 0, r: 0 };
      }
      for (let c = 0; c < 200; c++) for (let r = 0; r < rows; r++) if (!used.has(c + ',' + r)) return { c, r };
      return { c: 0, r: 0 };
    }
    renderDesktop() {
      if (!this.fs) return;
      const rows = this.deskRows(), [cw, ch, px] = this.deskCell();
      const list = [{ key: this.sysPC.id, node: this.sysPC }, { key: this.sysBin.id, node: this.sysBin }]
        .concat(this.visible(this.fs.special.desktop.children).map(n => ({ key: n.id, node: n })));
      const keys = new Set(list.map(e => e.key));
      [...this.deskPos.keys()].forEach(k => { if (!keys.has(k)) this.deskPos.delete(k); });
      const used = new Set();
      if (this.autoArrange) this.deskPos.clear();
      list.forEach(e => { const p = this.deskPos.get(e.key); if (p && p.r < rows && !used.has(p.c + ',' + p.r)) used.add(p.c + ',' + p.r); else this.deskPos.delete(e.key); });
      list.forEach(e => { if (!this.deskPos.has(e.key)) { const p = this.freeCell(used, rows); this.deskPos.set(e.key, p); used.add(p.c + ',' + p.r); } });
      const cut = this.clipboard && this.clipboard.mode === 'cut' ? this.clipboard.nodes : [];
      const items = this.deskShow ? list.map(e => {
        const p = this.deskPos.get(e.key), n = e.node;
        return h('div', {
          class: 'w11-ditem s-' + this.deskSize + (cut.includes(n) ? ' cut' : ''), 'data-key': e.key, role: 'option', 'aria-label': this.shown(n),
          'data-drop': n.folder || n.virtual === 'recycle' ? 'entry' : null, title: this.tooltip(n),
          style: 'left:' + (4 + p.c * cw) + 'px;top:' + (4 + p.r * ch) + 'px;width:' + (cw - 4) + 'px'
        }, h('span', { class: 'w11-hit' }, this.iconEl(n, px, true), h('span', { class: 'w11-label', text: this.shown(n) })));
      }) : [];
      const marquee = this.deskEl.querySelector('.w11-marquee');
      fill(this.deskEl, ...items);
      if (marquee) this.deskEl.append(marquee);
      this.desk.sync();
    }
    tooltip(n) {
      if (n.virtual || n.drive) return null;
      if (n.folder) return 'Date created: ' + fmtDate(n.created) + '\nSize: ' + fmtBytes(treeSize(n)) + (n.children.length ? '\nFiles: ' + n.children.slice(0, 4).map(c => c.name).join(', ') : '\nEmpty folder');
      return 'Item type: ' + typeName(n) + '\nSize: ' + fmtBytes(n.size || 0) + '\nDate modified: ' + fmtDate(n.modified);
    }
    deskCellAt(x, y) {
      const r = this.deskEl.getBoundingClientRect(), [cw, ch] = this.deskCell();
      return { c: Math.max(0, Math.floor((x - r.left - 4) / cw)), r: clamp(Math.floor((y - r.top - 4) / ch), 0, this.deskRows() - 1) };
    }
    placeOnDesk(keys, cell, rel) {
      const rows = this.deskRows();
      const used = new Set([...this.deskPos.entries()].filter(([k]) => !keys.includes(k)).map(([, p]) => p.c + ',' + p.r));
      keys.forEach((k, i) => {
        const off = rel ? rel[i] : { c: 0, r: 0 };
        let p = { c: Math.max(0, cell.c + off.c), r: clamp(cell.r + off.r, 0, rows - 1) };
        if (used.has(p.c + ',' + p.r)) p = this.freeCell(used, rows, p);
        used.add(p.c + ',' + p.r);
        this.deskPos.set(k, p);
      });
      this.autoArrange = false;
      this.renderDesktop();
    }
    setDeskSize(s) { this.deskSize = s; this.deskPos.clear(); this.renderDesktop(); this.log('desktop-view', { detail: s }); }
    sortDesk(key) {
      const list = this.visible(this.fs.special.desktop.children).slice().sort(this.sorter(key, true));
      this.deskPos.clear();
      [this.sysPC.id, this.sysBin.id].concat(list.map(n => n.id)).forEach((k, i) => { const rows = this.deskRows(); this.deskPos.set(k, { c: Math.floor(i / rows), r: i % rows }); });
      this.renderDesktop();
      this.log('sort', { detail: key, where: 'desktop' });
    }
    sorter(key, asc) {
      const dir = asc ? 1 : -1;
      return (a, b) => {
        if (key === 'name' && !!a.folder !== !!b.folder) return a.folder ? -1 : 1;
        if (!!a.folder !== !!b.folder) return (a.folder ? -1 : 1) * (key === 'size' ? 1 : 1);
        let v = 0;
        if (key === 'modified') v = (a.modified || 0) - (b.modified || 0);
        else if (key === 'type') v = collator.compare(typeName(a), typeName(b));
        else if (key === 'size') v = (a.folder ? 0 : a.size || 0) - (b.folder ? 0 : b.size || 0);
        else if (key === 'deleted') v = (a._deleted || 0) - (b._deleted || 0);
        return (v || collator.compare(this.label(a), this.label(b))) * dir;
      };
    }

    /* ---------- windows */
    addWindow(w) {
      this.windows.push(w);
      this.layer.append(w.el);
      if (w.place) w.place();
      this.focusWin(w);
    }
    focusWin(w) {
      if (!w) { this.focusDesktop(); return; }
      if (w.minimized) { w.minimized = false; w.el.hidden = false; }
      w.el.style.zIndex = ++this.z;
      this.active = w;
      this.windows.forEach(x => x.el.classList.toggle('inactive', x !== w));
      if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
      this.renderTaskbar();
    }
    focusDesktop() {
      if (this.active) { this.active = null; this.windows.forEach(x => x.el.classList.add('inactive')); this.renderTaskbar(); }
      if (!this.deskEl.contains(document.activeElement)) this.deskEl.focus({ preventScroll: true });
    }
    topWindow() { return this.windows.filter(w => !w.minimized).sort((a, b) => (+a.el.style.zIndex) - (+b.el.style.zIndex)).pop() || null; }
    activeExplorer() { return this.active && this.active.app === 'explorer' ? this.active : null; }
    removeWin(w) {
      const i = this.windows.indexOf(w);
      if (i < 0) return;
      this.windows.splice(i, 1);
      w.el.remove();
      if (this.active === w) { this.active = null; const top = this.topWindow(); if (top) this.focusWin(top); else this.focusDesktop(); }
      this.renderTaskbar();
      this.queueTasks();
    }
    minimize(w) {
      w.minimized = true; w.el.hidden = true;
      if (this.active === w) { this.active = null; const top = this.topWindow(); if (top) this.focusWin(top); else this.focusDesktop(); }
      this.renderTaskbar();
      this.log('minimize', { app: w.app });
    }
    showDesktop() {
      const open = this.windows.filter(w => !w.minimized);
      if (open.length) { this.peekRestore = open; open.forEach(w => { w.minimized = true; w.el.hidden = true; }); this.active = null; this.focusDesktop(); }
      else if (this.peekRestore) { this.peekRestore.forEach(w => { if (this.windows.includes(w)) { w.minimized = false; w.el.hidden = false; } }); const top = this.topWindow(); this.peekRestore = null; if (top) this.focusWin(top); }
      this.renderTaskbar();
    }
    openExplorer(loc) { const w = new Explorer(this, loc || { t: 'home' }); this.addWindow(w); return w; }
    go(loc, from, how) {
      how = how || {};
      if (from && from.app === 'explorer' && !how.newWindow) { if (how.newTab) from.addTab(loc, true); else from.navigate(loc); return from; }
      return this.openExplorer(loc);
    }
    openEntry(en, from, how) {
      const n = en.node;
      if (en.rec) { this.properties(n, en.rec); return; }
      if (n.virtual) { this.go({ t: n.virtual }, from, how); return; }
      if (n.link) {
        if (!isAttached(this.fs, n.link)) { this.dialog({ title: 'Problem with Shortcut', icon: 'warn', message: 'The item ‘' + n.link.name + '’ that this shortcut refers to has been changed or moved, so this shortcut will no longer work properly.', buttons: [{ label: 'OK', primary: true }] }); return; }
        this.openEntry({ node: n.link }, from, how);
        return;
      }
      if (n.folder) { this.go({ t: 'node', node: n }, from, how); return; }
      this.openFile(n);
    }
    openFile(node, app) {
      app = app || appFor(node);
      if (!app) { this.openWith(node); return; }
      const path = this.pathOf(node);
      this.log('open-file', { path, app }); this.log('open', { path });
      node._openedAt = Date.now();
      this.recent = [node].concat(this.recent.filter(x => x !== node)).slice(0, 14);
      if (app === 'player' || app === 'photos') {
        const ex = this.windows.find(w => w.app === app);
        if (ex) { ex.load(node); this.focusWin(ex); return; }
      }
      const W = { player: PlayerWin, photos: PhotosWin, notepad: NotepadWin, editor: EditorWin }[app];
      this.addWindow(new W(this, node));
    }
    async openWith(node) {
      const r = await this.dialog({ title: 'Open with', heading: 'How do you want to open this file?', message: node.name, choices: [
        { value: 'notepad', label: 'Notepad', icon: ICON.notepad }, { value: 'photos', label: 'Photos', icon: ICON.photos }, { value: 'player', label: 'Media Player', icon: ICON.player }],
        buttons: [{ label: 'Just once', value: 'once', primary: true }, { label: 'Cancel', value: 'cancel' }] });
      if (r.value === 'cancel' || !r.choice) return;
      this.openFile(node, r.choice);
    }
    properties(node, rec) {
      if (!node) return;
      if (node.virtual === 'thispc') { this.openSettings('About this practice PC'); return; }
      if (node.virtual === 'recycle') node = null;
      const ex = this.windows.find(w => w.app === 'props' && w.node === node);
      if (ex) { this.focusWin(ex); return; }
      this.addWindow(new PropsWin(this, node, rec));
      this.log('properties', { path: node ? this.pathOf(node) : 'Recycle Bin' });
    }
    openSettings(what) { const ex = this.windows.find(w => w.app === 'settings'); if (ex) { this.focusWin(ex); return; } this.addWindow(new SettingsWin(this, what)); }

    /* ---------- file operations */
    attach(node, dest) { node.parent = dest; dest.children.push(node); }
    detach(node) { if (node.parent) { node.parent.children = node.parent.children.filter(c => c !== node); } node.parent = null; }
    uniqueName(dest, name, folder) {
      const has = nm => dest.children.some(c => same(c.name, nm));
      if (!has(name)) return name;
      const base = folder ? name : baseOf(name), ext = folder || !extOf(name) ? '' : name.slice(name.lastIndexOf('.'));
      for (let i = 2; ; i++) { const nm = base + ' (' + i + ')' + ext; if (!has(nm)) return nm; }
    }
    copyName(dest, name, folder) {
      const base = folder || !extOf(name) ? name : baseOf(name), ext = folder || !extOf(name) ? '' : name.slice(name.lastIndexOf('.'));
      const has = nm => dest.children.some(c => same(c.name, nm));
      let nm = base + ' - Copy' + ext;
      for (let i = 2; has(nm); i++) nm = base + ' - Copy (' + i + ')' + ext;
      return nm;
    }
    pushUndo(label, fns) { this.undoStack.push({ label, fns }); if (this.undoStack.length > 60) this.undoStack.shift(); }
    undo() {
      const u = this.undoStack.pop();
      if (!u) return;
      u.fns.slice().reverse().forEach(f => f());
      this.log('undo', { detail: u.label });
      this.refresh();
    }
    lockedReason(n) { return n.drive ? 'drive' : n.special ? 'special' : isProtected(n) ? 'protected' : n.virtual ? 'virtual' : null; }
    setClip(nodes, mode) {
      nodes = nodes.filter(n => n && !n.virtual);
      if (!nodes.length) return;
      if (mode === 'cut' && nodes.some(n => this.lockedReason(n))) { this.denied(nodes.find(n => this.lockedReason(n)), 'move'); return; }
      this.clipboard = { nodes, mode };
      nodes.forEach(n => this.log(mode === 'cut' ? 'cut' : 'copy-clip', { path: this.pathOf(n) }));
      this.renderDesktop();
      this.windows.forEach(w => w.surface && w.surface.sync());
      this.windows.forEach(w => w.renderCmd && w.renderCmd());
    }
    async paste(dest, surface) {
      if (!this.clipboard || !dest) return;
      const { nodes, mode } = this.clipboard;
      const live = nodes.filter(n => isAttached(this.fs, n) || this.recycle.some(r => r.node === n));
      if (!live.length) { this.clipboard = null; return; }
      const fromBin = live.some(n => this.recycle.some(r => r.node === n));
      this.log('paste', { path: this.pathOf(dest) });
      const made = await this.transfer(live, dest, mode === 'cut' ? 'move' : 'copy', { fromBin });
      if (mode === 'cut') this.clipboard = null;
      this.refresh();
      if (surface && made.length) surface.selectNodes(made);
    }
    async denied(node, action) {
      const folder = !node || node.folder;
      await this.dialog({ title: (action === 'copy' ? 'Destination ' : '') + (folder ? 'Folder' : 'File') + ' Access Denied', icon: 'shield',
        message: 'You need permission to perform this action', sub: node && (node.drive || node.special) ? '‘' + this.label(node) + '’ is a system location. Practise inside your own folders.' : 'This is a protected Windows folder.',
        buttons: [{ label: 'Try Again', value: 'again' }, { label: 'Cancel', value: 'cancel', primary: true }] });
    }
    async transfer(nodes, dest, op, opts) {
      opts = opts || {};
      nodes = nodes.filter(n => n && !n.virtual);
      if (!nodes.length || !dest) return [];
      if (isProtected(dest)) { await this.denied(dest, 'copy'); return []; }
      if (op === 'move' && !opts.fromBin) {
        const locked = nodes.find(n => this.lockedReason(n));
        if (locked) { await this.denied(locked, 'move'); return []; }
      }
      const dDrive = driveOf(dest);
      const crossing = nodes.filter(n => op === 'copy' || driveOf(n) !== dDrive);
      const need = crossing.reduce((s, n) => s + treeSize(n), 0);
      if (dDrive && need > this.freeSpace(dDrive)) {
        await this.dialog({ title: 'Not enough space', icon: 'warn', heading: 'There is not enough space on ' + driveLabel(dDrive) + '.', message: fmtBytes(need) + ' is needed to copy these items. Delete or move files so you have enough space, and then try again.', buttons: [{ label: 'OK', primary: true }] });
        return [];
      }
      if (need > 150e6 && !opts.quiet) {
        const src = nodes[0].parent ? this.label(nodes[0].parent) : 'Recycle Bin';
        await this.progress((op === 'copy' ? 'Copying ' : 'Moving ') + nodes.length + (nodes.length === 1 ? ' item' : ' items') + ' from ' + src + ' to ' + this.label(dest), need);
      }
      const ctx = { all: null, undo: [], made: [], op, multi: nodes.length > 1, stop: false };
      for (const node of nodes) { if (ctx.stop) break; await this.transferOne(node, dest, ctx, opts); }
      if (ctx.undo.length) this.pushUndo(op === 'copy' ? 'Copy' : 'Move', ctx.undo);
      if (op === 'move' && this.clipboard && this.clipboard.mode === 'cut' && this.clipboard.nodes.some(n => nodes.includes(n))) this.clipboard = null;
      this.refresh();
      return ctx.made;
    }
    async transferOne(node, dest, ctx, opts) {
      const op = ctx.op, from = node.parent;
      const rec = opts.fromBin ? this.recycle.find(r => r.node === node) : null;
      if (op === 'move' && !rec) {
        if (node === dest || isAncestor(node, dest)) { await this.dialog({ title: 'Interrupted Action', icon: 'warn', message: 'The destination folder is a subfolder of the source folder.', buttons: [{ label: 'Skip', primary: true }, { label: 'Cancel', value: 'cancel' }] }); return; }
        if (from === dest) return;
      }
      if (op === 'copy' && isAncestor(node, dest) && node !== dest) { await this.dialog({ title: 'Interrupted Action', icon: 'warn', message: 'The destination folder is a subfolder of the source folder.', buttons: [{ label: 'Skip', primary: true }] }); return; }
      let name = node.name;
      if (op === 'copy' && from === dest) name = this.copyName(dest, node.name, node.folder);
      else {
        const clash = dest.children.find(c => c !== node && same(c.name, name));
        if (clash) {
          if (clash.folder && node.folder) {
            for (const child of node.children.slice()) { if (ctx.stop) return; await this.transferOne(child, clash, ctx, {}); }
            if (op === 'move' && !node.children.length) {
              if (rec) { this.recycle.splice(this.recycle.indexOf(rec), 1); ctx.undo.push(() => this.recycle.push(rec)); }
              else { this.detach(node); ctx.undo.push(() => this.attach(node, from)); }
            }
            return;
          }
          if (!!clash.folder !== !!node.folder) name = this.uniqueName(dest, name, node.folder);
          else {
            const choice = ctx.all || await this.conflict(node, dest, ctx);
            if (choice.cancel) { ctx.stop = true; return; }
            if (choice.skip) return;
            if (choice.replace) { this.detach(clash); ctx.undo.push(() => this.attach(clash, dest)); this.log('replace', { path: this.pathOf(dest) + ' > ' + clash.name }); }
            if (choice.keep) name = this.uniqueName(dest, name, node.folder);
          }
        }
      }
      if (op === 'copy') {
        const c = cloneTree(node, dest, this.fs.nodes, this.uid);
        c.name = name;
        dest.children.push(c);
        ctx.undo.push(() => this.detach(c));
        ctx.made.push(c);
        this.log('copy', { path: this.pathOf(c), from: this.pathOf(node) });
      } else {
        const oldName = node.name, fromPath = rec ? 'Recycle Bin' : this.pathOf(node);
        if (rec) { this.recycle.splice(this.recycle.indexOf(rec), 1); ctx.undo.push(() => { this.detach(node); node.name = oldName; this.recycle.push(rec); }); }
        else { this.detach(node); ctx.undo.push(() => { this.detach(node); node.name = oldName; this.attach(node, from); }); }
        node.name = name;
        this.attach(node, dest);
        ctx.made.push(node);
        this.log('move', { path: this.pathOf(node), from: fromPath });
        if (rec) this.log('restore', { path: this.pathOf(node) });
      }
    }
    async conflict(node, dest, ctx) {
      const src = node.parent ? this.label(node.parent) : 'Recycle Bin';
      const r = await this.dialog({
        title: 'Replace or Skip Files', cls: 'conflict', progressText: (ctx.op === 'copy' ? 'Copying' : 'Moving') + ' 1 item from ' + src + ' to ' + this.label(dest),
        heading: 'The destination already has a ' + (node.folder ? 'folder' : 'file') + ' named “' + node.name + '”',
        choices: [{ value: 'replace', label: 'Replace the file in the destination', glyph: 'check' }, { value: 'skip', label: 'Skip this file', glyph: 'redo' }, { value: 'keep', label: 'Keep both files', glyph: 'copy', note: 'The copy is named ' + this.uniqueName(dest, node.name, node.folder) }],
        instant: true, checkbox: ctx.multi ? 'Do this for all conflicts' : null, buttons: [{ label: 'Cancel', value: 'cancel' }]
      });
      if (r.value === 'cancel' || !r.choice) return { cancel: true };
      const choice = { [r.choice]: true };
      if (r.checked) ctx.all = choice;
      return choice;
    }
    async deleteNodes(nodes, permanent) {
      nodes = nodes.filter(n => n && !n.virtual);
      if (!nodes.length) return;
      const locked = nodes.find(n => this.lockedReason(n));
      if (locked) { await this.denied(locked, 'delete'); return; }
      const inBin = nodes.filter(n => this.recycle.some(r => r.node === n));
      const removable = nodes.some(n => { const d = driveOf(n); return d && d.drive.kind !== 'system'; });
      if (permanent || removable || inBin.length) {
        const ok = await this.confirmDelete(nodes, removable && !permanent && !inBin.length);
        if (!ok) return;
        nodes.forEach(n => {
          const rec = this.recycle.find(r => r.node === n);
          this.log('delete-permanent', { path: rec ? rec.fromPath + ' > ' + n.name : this.pathOf(n) });
          if (rec) this.recycle.splice(this.recycle.indexOf(rec), 1); else this.detach(n);
        });
      } else {
        const recs = nodes.map(n => ({ node: n, from: n.parent, fromPath: this.pathOf(n.parent), origin: this.winPath(n.parent), at: Date.now() }));
        recs.forEach(r => { this.log('delete', { path: this.pathOf(r.node) }); r.node._deleted = r.at; this.detach(r.node); this.recycle.push(r); });
        this.pushUndo('Delete', [() => recs.forEach(r => { const i = this.recycle.indexOf(r); if (i >= 0) this.recycle.splice(i, 1); this.attach(r.node, r.from); })]);
      }
      if (this.clipboard) { this.clipboard.nodes = this.clipboard.nodes.filter(n => !nodes.includes(n) || this.recycle.some(r => r.node === n)); if (!this.clipboard.nodes.length) this.clipboard = null; }
      this.refresh();
    }
    async confirmDelete(nodes, removable) {
      const one = nodes.length === 1, n = nodes[0];
      const what = one ? (n.folder ? 'folder' : 'file') : 'these ' + nodes.length + ' items';
      const r = await this.dialog({
        title: one ? (n.folder ? 'Delete Folder' : 'Delete File') : 'Delete Multiple Items', icon: 'warn',
        message: 'Are you sure you want to permanently delete ' + (one ? 'this ' + what : what) + '?',
        sub: removable ? 'Files deleted from a removable drive do not go to the Recycle Bin.' : null,
        item: one ? n : null,
        buttons: [{ label: 'Yes', value: 'yes', primary: true }, { label: 'No', value: 'no' }]
      });
      return r.value === 'yes';
    }
    restore(recs) {
      if (!recs.length) return;
      recs.forEach(r => {
        const i = this.recycle.indexOf(r);
        if (i >= 0) this.recycle.splice(i, 1);
        const dest = isAttached(this.fs, r.from) ? r.from : this.fs.special.desktop;
        if (dest.children.some(c => same(c.name, r.node.name))) r.node.name = this.uniqueName(dest, r.node.name, r.node.folder);
        this.attach(r.node, dest);
        delete r.node._deleted;
        this.log('restore', { path: this.pathOf(r.node) });
      });
      this.pushUndo('Restore', [() => recs.forEach(r => { this.detach(r.node); this.recycle.push(r); })]);
      this.refresh();
    }
    async emptyBin() {
      if (!this.recycle.length) return;
      const one = this.recycle.length === 1;
      const r = await this.dialog({ title: one ? 'Delete File' : 'Delete Multiple Items', icon: 'warn', message: one ? 'Are you sure you want to permanently delete this ' + (this.recycle[0].node.folder ? 'folder' : 'file') + '?' : 'Are you sure you want to permanently delete these ' + this.recycle.length + ' items?', item: one ? this.recycle[0].node : null, buttons: [{ label: 'Yes', value: 'yes', primary: true }, { label: 'No', value: 'no' }] });
      if (r.value !== 'yes') return;
      this.recycle = [];
      this.log('empty-bin', {});
      this.refresh();
    }
    async renameNode(node, raw, o) {
      o = o || {};
      let name = String(raw).replace(/[\r\n]+/g, '').trim().replace(/[. ]+$/, '');
      if (!name) return 'cancel';
      if (!o.fullName && !node.folder && extOf(node.name)) name += node.name.slice(node.name.lastIndexOf('.'));
      if (name === node.name) return 'ok';
      if (BAD_CHARS.test(name)) { await this.dialog({ title: 'Rename', icon: 'warn', message: 'A file name can\'t contain any of the following characters: \\ / : * ? " < > |', buttons: [{ label: 'OK', primary: true }] }); return 'retry'; }
      if (RESERVED.test(name)) { await this.dialog({ title: 'Rename', icon: 'warn', message: 'The specified device name is invalid.', buttons: [{ label: 'OK', primary: true }] }); return 'retry'; }
      if (node.parent && node.parent.children.some(c => c !== node && same(c.name, name))) {
        await this.dialog({ title: node.folder ? 'Rename Folder' : 'Rename File', icon: 'warn', message: 'There is already a ' + (node.folder ? 'folder' : 'file') + ' with the same name in this location.', sub: 'Choose a different name.', item: node, buttons: [{ label: 'OK', primary: true }] });
        return 'retry';
      }
      if (o.fullName && !node.folder && extOf(node.name) !== extOf(name)) {
        this.log('extension-warning', { path: this.pathOf(node), detail: extOf(name) });
        const r = await this.dialog({ title: 'Rename', icon: 'warn', message: 'If you change a file name extension, the file might become unusable.', sub: 'Are you sure you want to change it?', buttons: [{ label: 'Yes', value: 'yes', primary: true }, { label: 'No', value: 'no' }] });
        if (r.value !== 'yes') return 'cancel';
        this.log('extension-change', { path: this.pathOf(node), detail: extOf(name) });
      }
      const old = node.name, oldPath = this.pathOf(node);
      node.name = name;
      this.pushUndo('Rename', [() => { node.name = old; }]);
      this.log('rename', { path: this.pathOf(node), from: oldPath });
      return 'ok';
    }
    newItem(dest, kind, surface, at) {
      if (!dest || dest === 'recycle') return;
      if (isProtected(dest)) { this.denied(dest, 'copy'); return; }
      const now = Date.now();
      const node = kind === 'folder'
        ? { id: this.uid(), name: this.uniqueName(dest, 'New folder', true), folder: true, children: [], modified: now, created: now }
        : { id: this.uid(), name: this.uniqueName(dest, 'New Text Document.txt'), folder: false, size: 0, text: '', modified: now, created: now };
      this.fs.nodes.set(node.id, node);
      this.attach(node, dest);
      this.pushUndo('New', [() => this.detach(node)]);
      this.log('new', { path: this.pathOf(node), detail: kind });
      if (dest === this.fs.special.desktop && at) {
        const used = new Set([...this.deskPos.values()].map(p => p.c + ',' + p.r));
        this.deskPos.set(node.id, this.freeCell(used, this.deskRows(), this.deskCellAt(at.x, at.y)));
      }
      this.refresh();
      if (surface) { surface.selectNodes([node]); setTimeout(() => surface.startRename(node.id), 0); }
    }
    makeShortcuts(nodes, dest) {
      const made = nodes.map(n => {
        const s = { id: this.uid(), name: this.uniqueName(dest, this.label(n) + ' - Shortcut'), folder: false, link: n, size: 1400, modified: Date.now(), created: Date.now() };
        this.fs.nodes.set(s.id, s); this.attach(s, dest); this.log('shortcut', { path: this.pathOf(s) });
        return s;
      });
      this.pushUndo('New', [() => made.forEach(s => this.detach(s))]);
      this.refresh();
      return made;
    }
    copyAsPath(nodes) {
      if (!nodes.length) return;
      const text = nodes.map(n => '"' + this.winPath(n) + '"').join('\r\n');
      try { navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* clipboard is optional */ }
      nodes.forEach(n => this.log('copy-path', { path: this.pathOf(n) }));
      this.toast('Copied as path', text.replace(/\r\n/g, '\n'));
    }
    togglePin(node) {
      if (this.pins.includes(node)) { this.pins = this.pins.filter(p => p !== node); this.log('unpin', { path: this.pathOf(node) }); }
      else { this.pins.push(node); this.log('pin', { path: this.pathOf(node) }); }
      this.refresh();
    }
    eject(drive) {
      this.log('eject', { path: this.pathOf(drive) });
      this.detach(drive);
      this.ejected.push(drive);
      this.refresh();
      const back = h('button', { type: 'button', class: 'w11-btn', text: 'Plug it back in' });
      const t = this.toast('Safe To Remove Hardware', 'The ‘' + driveLabel(drive) + '’ device can now be safely removed from the computer.', back);
      back.onclick = () => { this.ejected = this.ejected.filter(d => d !== drive); this.attach(drive, this.fs.root); this.fs.root.children.sort((a, b) => a.drive.letter.localeCompare(b.drive.letter)); t.remove(); this.refresh(); this.log('plug-in', { path: this.pathOf(drive) }); };
    }
    refresh() {
      this.windows.forEach(w => w.refresh && w.refresh());
      this.renderDesktop();
      this.renderTaskbar();
      this.queueTasks();
    }

    /* ---------- drag and drop (pointer based so right-drag and the Windows tooltips work) */
    track(e, o) {
      const sx = e.clientX, sy = e.clientY, th = o.threshold != null ? o.threshold : 5;
      let started = false, last = e;
      const move = ev => {
        last = ev;
        if (!started && Math.hypot(ev.clientX - sx, ev.clientY - sy) > th) { started = true; if (o.entry) this.dragStart(o, ev); else if (o.onStart) o.onStart(ev); }
        if (started) { if (o.entry) this.dragMove(ev); else if (o.onMove) o.onMove(ev); }
      };
      const up = ev => {
        cleanup();
        if (started) { if (o.entry) this.dragEnd(ev); else if (o.onEnd) o.onEnd(ev); }
        else if (o.onClick) o.onClick(ev);
      };
      const key = ev => {
        if (!started || !o.entry) return;
        if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); this.dragCancel(); cleanup(); return; }
        if (ev.key === 'Control' || ev.key === 'Shift' || ev.key === 'Meta') this.dragMove({ clientX: last.clientX, clientY: last.clientY, ctrlKey: ev.type === 'keydown' ? ev.key === 'Control' || ev.ctrlKey : ev.ctrlKey && ev.key !== 'Control', metaKey: ev.metaKey, shiftKey: ev.type === 'keydown' ? ev.key === 'Shift' || ev.shiftKey : ev.shiftKey && ev.key !== 'Shift' });
      };
      const cleanup = () => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        window.removeEventListener('keydown', key, true); window.removeEventListener('keyup', key, true);
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      window.addEventListener('keydown', key, true); window.addEventListener('keyup', key, true);
    }
    dragStart(o, ev) {
      const surf = o.surface;
      let entries = surf.selected();
      if (!entries.includes(o.entry)) entries = [o.entry];
      const nodes = entries.map(x => x.node).filter(n => n && !n.virtual);
      const desk = surf === this.desk;
      const d = this.drag = { o, entries, nodes, surf, button: o.button, desk, fromBin: entries.some(x => x.rec), posOnly: !nodes.length };
      if (d.posOnly && !desk) { d.dead = true; return; }
      if (nodes.some(n => this.lockedReason(n))) d.lockedOnly = true;
      if (desk) {
        const p0 = this.deskPos.get(o.entry.key) || { c: 0, r: 0 };
        d.keys = entries.map(x => x.key);
        d.rel = entries.map(x => { const p = this.deskPos.get(x.key) || p0; return { c: p.c - p0.c, r: p.r - p0.r }; });
        const er = surf.elFor(o.entry.key).getBoundingClientRect(), [cw, ch] = this.deskCell();
        d.grab = { x: ev.clientX - er.left - cw / 2, y: ev.clientY - er.top - ch / 2 };
      }
      const stack = h('div', { class: 'w11-ghost-stack' }, entries.slice(0, 3).map((x, i) => { const ic = this.iconEl(x.node, 64, true); ic.style.transform = 'translate(' + (i * 5) + 'px,' + (i * -4) + 'px)'; return ic; }).reverse());
      d.tip = h('div', { class: 'w11-droptip', hidden: true });
      d.ghost = h('div', { class: 'w11-ghost' }, stack, entries.length > 1 ? h('span', { class: 'w11-ghost-count', text: entries.length }) : null, d.tip);
      this.overlay.append(d.ghost);
      surf.host.classList.add('dragging');
      this.log('drag-start', { detail: entries.length });
    }
    dragMove(ev) {
      const d = this.drag;
      if (!d || d.dead) return;
      d.last = ev;
      const sr = this.screen.getBoundingClientRect();
      d.ghost.style.transform = 'translate(' + (ev.clientX - sr.left - 30) + 'px,' + (ev.clientY - sr.top - 30) + 'px)';
      const tgt = this.hitDrop(ev.clientX, ev.clientY, d);
      const el = tgt && tgt.el;
      if (d.hl !== el) {
        if (d.hl) d.hl.classList.remove('drop');
        if (el) el.classList.add('drop');
        d.hl = el;
        clearTimeout(d.spring);
        if (tgt && tgt.navRow) d.spring = setTimeout(() => { const w = tgt.navRow.closest('.w11-win'); const win = w && this.windows.find(x => x.el === w); if (win && win.expandKey) win.expandKey(tgt.navRow.dataset.ekey, true); }, 750);
      }
      d.target = tgt;
      d.op = tgt ? this.decideOp(tgt, d, ev) : null;
      const verb = { copy: '+ Copy to ', move: '→ Move to ', recycle: '→ Move to ' }[d.op];
      d.tip.hidden = !verb;
      if (verb) fill(d.tip, h('span', { class: 'v-' + d.op, text: verb }), h('b', { text: tgt.title }));
      d.ghost.classList.toggle('no-drop', !d.op);
    }
    hitDrop(x, y, d) {
      const at = document.elementFromPoint(x, y);
      if (!at || !this.screen.contains(at) || at.closest('.w11-taskbar, .w11-dialog')) return null;
      let t = at.closest('[data-drop]');
      if (!t) return null;
      if (t.dataset.drop === 'entry') {
        const host = t.closest('.w11-surface'), surf = host && host._surface, en = surf && surf.entry(t.dataset.key);
        if (en && !d.entries.includes(en) && !d.posOnly) {
          if (en.node.virtual === 'recycle') return { recycle: true, el: t, title: 'Recycle Bin' };
          if ((en.node.folder || en.node.drive) && !en.rec) return { node: en.node, el: t, title: this.label(en.node) };
        }
        t = host;
      }
      if (t && t.dataset.drop === 'surface') {
        const surf = t._surface, dest = surf.o.target();
        if (dest === 'recycle') return d.fromBin ? null : { recycle: true, el: t, title: 'Recycle Bin' };
        if (!dest) return null;
        return { node: dest, el: surf === this.desk ? null : t, title: this.label(dest), deskBg: surf === this.desk };
      }
      if (t && (t.dataset.drop === 'nav' || t.dataset.drop === 'crumb')) {
        const id = t.dataset.node;
        if (id === 'recycle') return d.fromBin || d.posOnly ? null : { recycle: true, el: t, title: 'Recycle Bin' };
        const node = this.fs.nodes.get(id);
        if (node && node.folder && !d.posOnly) return { node, el: t, title: this.label(node), navRow: t.dataset.drop === 'nav' ? t : null };
      }
      return null;
    }
    decideOp(tgt, d, ev) {
      if (d.posOnly) return tgt.deskBg ? 'position' : null;
      if (tgt.recycle) return d.fromBin ? null : 'recycle';
      const dest = tgt.node, ctrl = modKey(ev);
      if (d.nodes.some(n => n === dest || isAncestor(n, dest))) return null;
      if (d.fromBin) return 'move';
      const allHere = d.nodes.every(n => n.parent === dest);
      if (allHere) return tgt.deskBg && !ctrl ? 'position' : ctrl ? 'copy' : null;
      if (ctrl) return 'copy';
      if (ev.shiftKey) return 'move';
      return d.nodes.every(n => driveOf(n) === driveOf(dest)) ? 'move' : 'copy';
    }
    dragCleanup(d) {
      clearTimeout(d.spring);
      if (d.hl) d.hl.classList.remove('drop');
      if (d.ghost) d.ghost.remove();
      d.surf.host.classList.remove('dragging');
    }
    dragCancel() { const d = this.drag; this.drag = null; if (d) this.dragCleanup(d); }
    dragEnd(ev) {
      const d = this.drag;
      this.drag = null;
      if (!d) return;
      this.dragCleanup(d);
      if (d.dead || !d.op) return;
      if (d.button === 2 && d.op !== 'position' && d.op !== 'recycle') {
        this.log('right-drag', { path: this.pathOf(d.target.node) });
        this.menu([
          { label: 'Copy here', bold: d.op === 'copy', action: () => this.doDrop(d, 'copy', ev) },
          { label: 'Move here', bold: d.op === 'move', action: () => this.doDrop(d, 'move', ev) },
          { label: 'Create shortcuts here', action: () => this.doDrop(d, 'shortcut', ev) },
          { sep: true }, { label: 'Cancel', action: () => {} }
        ], ev.clientX, ev.clientY, { classic: true });
        return;
      }
      this.doDrop(d, d.op, ev);
    }
    async doDrop(d, op, ev) {
      const tgt = d.target;
      if (op === 'position') {
        const cell = this.deskCellAt(ev.clientX - d.grab.x, ev.clientY - d.grab.y);
        this.placeOnDesk(d.keys, cell, d.rel);
        this.log('desktop-arrange', {});
        return;
      }
      this.log('drop', { detail: op, path: tgt.node ? this.pathOf(tgt.node) : 'Recycle Bin', button: d.button });
      if (op === 'recycle') { await this.deleteNodes(d.nodes); return; }
      if (op === 'shortcut') { const made = this.makeShortcuts(d.nodes, tgt.node); if (tgt.deskBg) this.placeOnDesk(made.map(n => n.id), this.deskCellAt(ev.clientX, ev.clientY)); return; }
      const made = await this.transfer(d.nodes, tgt.node, op, { fromBin: d.fromBin });
      if (tgt.deskBg && made.length) this.placeOnDesk(made.map(n => n.id), this.deskCellAt(ev.clientX, ev.clientY), made.map((n, i) => ({ c: 0, r: i })));
      const win = this.windows.find(w => w.app === 'explorer' && w.tab.loc.t === 'node' && w.tab.loc.node === tgt.node);
      if (win && made.length) win.surface.selectNodes(made);
    }

    /* ---------- menus (Windows 11 style, with the classic "Show more options" menu) */
    menu(items, x, y, o) {
      o = o || {};
      this.closeMenu();
      const m = this.buildMenu(items, o);
      this.overlay.append(m);
      this.menuEl = m;
      this.menuStack = [{ el: m }];
      this.positionMenu(m, x, y, o);
      this.menuReturn = document.activeElement;
      m.focus({ preventScroll: true });
    }
    buildMenu(items, o) {
      const m = h('div', { class: 'w11-menu' + (o.classic ? ' classic' : ''), role: 'menu', tabindex: '-1' });
      if (o.top && o.top.length) {
        m.append(h('div', { class: 'w11-menu-top' }, o.top.map(t => {
          const b = h('button', { type: 'button', class: 'w11-menu-topbtn', title: t.label, 'aria-label': t.label, disabled: !!t.disabled, html: GL[t.icon] });
          b.onclick = () => { this.closeMenu(); t.action(); };
          return b;
        })));
      }
      items.forEach(it => {
        if (!it) return;
        if (it.sep) { m.append(h('div', { class: 'w11-menu-sep', role: 'separator' })); return; }
        const b = h('button', { type: 'button', class: 'w11-mi' + (it.bold ? ' bold' : '') + (it.sub ? ' has-sub' : ''), role: 'menuitem', disabled: !!it.disabled, tabindex: '-1' },
          h('span', { class: 'w11-mi-ic', html: it.iconMarkup || (it.icon ? GL[it.icon] : '') }),
          h('span', { class: 'w11-mi-label', text: it.label }),
          it.shortcut ? h('span', { class: 'w11-mi-key', text: it.shortcut }) : null,
          it.check != null || it.radio != null ? h('span', { class: 'w11-mi-mark', html: it.check ? GL.check : it.radio ? GL.dot : '' }) : null,
          it.sub ? h('span', { class: 'w11-mi-arrow', html: GL.chevR }) : null);
        b._item = it;
        b.addEventListener('pointerenter', () => this.menuHover(b));
        b.addEventListener('click', () => this.menuActivate(b));
        m.append(b);
      });
      return m;
    }
    positionMenu(m, x, y, o) {
      const sr = this.screen.getBoundingClientRect();
      let left = x - sr.left, top = y - sr.top;
      const w = m.offsetWidth, hh = m.offsetHeight;
      if (o.above) top -= hh + 4;
      if (o.alignRight) left -= w;
      if (left + w > sr.width - 4) left = o.sub ? o.subLeft - w : sr.width - w - 4;
      if (top + hh > sr.height - 52) top = o.sub ? sr.height - hh - 52 : top - hh;
      m.style.left = clamp(left, 4, Math.max(4, sr.width - w - 4)) + 'px';
      m.style.top = clamp(top, 4, Math.max(4, sr.height - hh - 4)) + 'px';
    }
    menuLevel(b) { return this.menuStack.findIndex(s => s.el === b.parentNode); }
    menuHover(b) {
      const lvl = this.menuLevel(b);
      if (lvl < 0) return;
      b.focus({ preventScroll: true });
      clearTimeout(this.subTimer);
      if (b._item.sub && !b.disabled) this.subTimer = setTimeout(() => this.openSub(b), 220);
      else this.subTimer = setTimeout(() => this.trimMenus(lvl), 220);
    }
    trimMenus(lvl) { while (this.menuStack.length > lvl + 1) this.menuStack.pop().el.remove(); }
    openSub(b) {
      const lvl = this.menuLevel(b);
      if (lvl < 0) return;
      if (this.menuStack[lvl + 1] && this.menuStack[lvl + 1].from === b) return;
      this.trimMenus(lvl);
      const sub = this.buildMenu(b._item.sub, {});
      this.overlay.append(sub);
      const r = b.getBoundingClientRect();
      this.positionMenu(sub, r.right - 2, r.top - 4, { sub: true, subLeft: r.left - this.screen.getBoundingClientRect().left + 2 });
      this.menuStack.push({ el: sub, from: b });
      return sub;
    }
    menuActivate(b) {
      const it = b._item;
      if (!it || b.disabled) return;
      if (it.sub) { const sub = this.openSub(b); if (sub) { const f = sub.querySelector('.w11-mi:not(:disabled)'); if (f) f.focus(); } return; }
      this.closeMenu();
      if (it.action) it.action();
    }
    closeMenu() {
      clearTimeout(this.subTimer);
      if (!this.menuEl) return;
      (this.menuStack || []).forEach(s => s.el.remove());
      this.menuEl = null; this.menuStack = [];
      const r = this.menuReturn;
      this.menuReturn = null;
      if (r && this.screen.contains(r) && r.isConnected) r.focus({ preventScroll: true });
    }
    menuKey(e) {
      const top = this.menuStack[this.menuStack.length - 1].el;
      const btns = [...top.querySelectorAll('.w11-mi:not(:disabled), .w11-menu-topbtn:not(:disabled)')];
      const i = btns.indexOf(document.activeElement);
      const k = e.key;
      e.preventDefault(); e.stopPropagation();
      if (k === 'ArrowDown') (btns[(i + 1) % btns.length] || btns[0]).focus();
      else if (k === 'ArrowUp') (btns[(i - 1 + btns.length) % btns.length] || btns[0]).focus();
      else if (k === 'ArrowRight') { const b = btns[i]; if (b && b._item && b._item.sub) this.menuActivate(b); }
      else if (k === 'ArrowLeft' || k === 'Escape') { if (this.menuStack.length > 1) { const s = this.menuStack.pop(); s.el.remove(); if (s.from) s.from.focus(); } else this.closeMenu(); }
      else if (k === 'Enter' || k === ' ') { const b = btns[i]; if (b) b.click(); }
      else if (k === 'Tab') this.closeMenu();
      else if (k.length === 1) { const f = btns.find(b => b._item && b._item.label.toLowerCase().startsWith(k.toLowerCase())); if (f) f.focus(); }
    }
    itemMenu(surf, x, y) {
      const sel = surf.selected();
      if (!sel.length) { this.bgMenu(surf, x, y); return; }
      const nodes = sel.map(e => e.node), n = nodes[0], one = sel.length === 1;
      const owner = surf === this.desk ? null : this.windows.find(w => w.surface === surf);
      this.log('context-menu', { path: n.virtual ? n.name : this.pathOf(n), target: 'item' });
      const props = { label: 'Properties', icon: 'props', shortcut: 'Alt+Enter', action: () => this.properties(n, sel[0].rec) };
      if (sel.every(e => e.rec)) {
        this.menu([{ label: 'Restore', icon: 'restore', bold: true, action: () => this.restore(sel.map(e => e.rec)) }, { sep: true },
          { label: 'Cut', icon: 'cut', shortcut: 'Ctrl+X', action: () => this.setClip(nodes, 'cut') }, { label: 'Delete', icon: 'del', action: () => this.deleteNodes(nodes, true) }, { sep: true }, props], x, y);
        return;
      }
      if (one && n.virtual === 'thispc') {
        this.menu([{ label: 'Open', bold: true, icon: 'open', action: () => this.openEntry(sel[0], owner) }, { label: 'Open in new window', icon: 'newWin', action: () => this.openExplorer({ t: 'thispc' }) }, { sep: true }, { label: 'Pin to Start', icon: 'pin', disabled: true }, { sep: true }, { label: 'Properties', icon: 'props', action: () => this.properties(n) }], x, y);
        return;
      }
      if (one && n.virtual === 'recycle') {
        this.menu([{ label: 'Open', bold: true, icon: 'open', action: () => this.openEntry(sel[0], owner) }, { label: 'Empty Recycle Bin', icon: 'del', disabled: !this.recycle.length, action: () => this.emptyBin() }, { sep: true }, { label: 'Pin to Start', icon: 'pin', disabled: true }, { sep: true }, { label: 'Properties', icon: 'props', action: () => this.properties(n) }], x, y);
        return;
      }
      const real = nodes.filter(m => !m.virtual);
      const locked = real.some(m => this.lockedReason(m));
      const folderish = one && (n.folder || n.drive);
      const items = [{ label: 'Open', icon: 'open', bold: true, shortcut: 'Enter', action: () => surf.openSelection() }];
      if (folderish) items.push({ label: 'Open in new tab', icon: 'newTab', action: () => this.openEntry(sel[0], owner, { newTab: !!owner, newWindow: !owner }) }, { label: 'Open in new window', icon: 'newWin', action: () => this.openEntry(sel[0], owner, { newWindow: true }) });
      if (one && !n.folder) {
        const def = appFor(n);
        items.push({ label: 'Open with', icon: 'open', sub: [
          { label: 'Media Player', iconMarkup: ICON.player, bold: def === 'player', action: () => this.openFile(n, 'player') },
          { label: 'Notepad', iconMarkup: ICON.notepad, bold: def === 'notepad', action: () => this.openFile(n, 'notepad') },
          { label: 'Photos', iconMarkup: ICON.photos, bold: def === 'photos', action: () => this.openFile(n, 'photos') },
          { label: 'Video Editor', iconMarkup: ICON.editor, bold: def === 'editor', action: () => this.openFile(n, 'editor') },
          { sep: true }, { label: 'Choose another app', action: () => this.openWith(n) }] });
      }
      if (sel.some(e => e.found || e.key.startsWith('rc:'))) items.push({ label: 'Open file location', icon: 'folderNew', action: () => { const w = this.go({ t: 'node', node: n.parent }, owner); if (w && w.surface) setTimeout(() => w.surface.selectNodes([n]), 0); } });
      if (folderish) items.push(this.pins.includes(n) ? { label: 'Unpin from Quick access', icon: 'unpin', action: () => this.togglePin(n) } : { label: 'Pin to Quick access', icon: 'pin', action: () => this.togglePin(n) });
      if (one && n.drive && n.drive.kind !== 'system' && n.drive.kind !== 'cloud') items.push({ label: 'Eject', icon: 'eject', action: () => this.eject(n) });
      if (!real.some(m => m.drive)) items.push({ label: 'Compress to ZIP file', icon: 'zip', disabled: locked, action: () => this.zip(real) });
      items.push({ label: 'Copy as path', icon: 'path', shortcut: 'Ctrl+Shift+C', action: () => this.copyAsPath(real) }, props, { sep: true },
        { label: 'Show more options', icon: 'more', action: () => this.classicMenu(surf, sel, x, y) });
      const top = n.drive ? [] : [
        { icon: 'cut', label: 'Cut', disabled: locked, action: () => this.setClip(real, 'cut') },
        { icon: 'copy', label: 'Copy', action: () => this.setClip(real, 'copy') },
        { icon: 'rename', label: 'Rename', disabled: locked, action: () => surf.startRename(sel[0].key) },
        { icon: 'share', label: 'Share', disabled: real.some(m => m.folder), action: () => this.toast('Share', 'Sharing is turned off on this practice PC.') },
        { icon: 'del', label: 'Delete', disabled: locked, action: () => this.deleteNodes(real) }
      ];
      this.menu(items, x, y, { top });
    }
    classicMenu(surf, sel, x, y) {
      const nodes = sel.map(e => e.node).filter(n => !n.virtual), n = nodes[0];
      const locked = nodes.some(m => this.lockedReason(m));
      const owner = surf === this.desk ? null : this.windows.find(w => w.surface === surf);
      const send = [{ label: 'Compressed (zipped) folder', iconMarkup: ICON.file('zip'), action: () => this.zip(nodes) },
        { label: 'Desktop (create shortcut)', iconMarkup: ICON.desktop, action: () => this.makeShortcuts(nodes, this.fs.special.desktop) },
        { label: 'Documents', iconMarkup: ICON.documents, action: () => this.transfer(nodes, this.fs.special.documents, 'copy') }]
        .concat(this.fs.root.children.filter(d => d.drive.kind !== 'system').map(d => ({ label: driveLabel(d), iconMarkup: this.iconMarkup(d), action: () => { this.log('send-to', { path: this.pathOf(d) }); this.transfer(nodes, d, 'copy'); } })));
      this.log('more-options', {});
      this.menu([
        { label: 'Open', bold: true, action: () => surf.openSelection() },
        n && (n.folder || n.drive) ? { label: 'Open in new window', action: () => this.openEntry(sel[0], owner, { newWindow: true }) } : null,
        n && n.folder ? { label: 'Pin to Quick access', action: () => this.togglePin(n) } : null,
        { sep: true }, { label: 'Give access to', sub: [{ label: 'Specific people...', disabled: true }] },
        { label: 'Restore previous versions', disabled: true }, { sep: true },
        { label: 'Send to', sub: send }, { sep: true },
        { label: 'Cut', disabled: locked, action: () => this.setClip(nodes, 'cut') }, { label: 'Copy', action: () => this.setClip(nodes, 'copy') }, { sep: true },
        { label: 'Create shortcut', action: () => this.makeShortcuts(nodes, n.parent || this.fs.special.desktop) },
        { label: 'Delete', disabled: locked, action: () => this.deleteNodes(nodes) }, { label: 'Rename', disabled: locked || nodes.length > 1, action: () => surf.startRename(sel[0].key) }, { sep: true },
        { label: 'Properties', action: () => this.properties(n) }
      ], x, y, { classic: true });
    }
    zip(nodes) {
      if (!nodes.length) return;
      const dest = nodes[0].parent;
      if (!dest || isProtected(dest)) { this.denied(dest, 'copy'); return; }
      const name = this.uniqueName(dest, baseOf(nodes.length === 1 ? nodes[0].name : nodes[0].name) + '.zip');
      const z = { id: this.uid(), name, folder: false, size: Math.round(nodes.reduce((s, n) => s + treeSize(n), 0) * 0.93), modified: Date.now(), created: Date.now() };
      this.fs.nodes.set(z.id, z); this.attach(z, dest);
      this.pushUndo('New', [() => this.detach(z)]);
      this.log('zip', { path: this.pathOf(z) });
      this.refresh();
    }
    bgMenu(surf, x, y) {
      const desk = surf === this.desk;
      const owner = desk ? null : this.windows.find(w => w.surface === surf);
      const dest = surf.o.target();
      const folder = dest && dest !== 'recycle' ? dest : null;
      const canWrite = folder && !isProtected(folder);
      const u = this.undoStack[this.undoStack.length - 1];
      const undo = u ? { label: 'Undo ' + u.label, icon: 'undo', shortcut: 'Ctrl+Z', action: () => this.undo() } : null;
      const paste = { label: 'Paste', icon: 'paste', shortcut: 'Ctrl+V', disabled: !(canWrite && this.clipboard), action: () => this.paste(folder, surf) };
      const at = { x, y };
      const newSub = [{ label: 'Folder', iconMarkup: ICON.folder(false), action: () => this.newItem(folder, 'folder', surf, at) }, { sep: true },
        { label: 'Shortcut', iconMarkup: ICON.file('shortcut'), disabled: true }, { label: 'Text Document', iconMarkup: ICON.file('text'), action: () => this.newItem(folder, 'text', surf, at) }];
      this.log('context-menu', { path: desk ? 'Desktop' : owner ? this.locPath(owner.tab.loc) : '', target: 'background' });
      if (desk) {
        const sizes = [['large', 'Large icons'], ['medium', 'Medium icons'], ['small', 'Small icons']];
        this.menu([
          { label: 'View', icon: 'view', sub: sizes.map(([k, l]) => ({ label: l, radio: this.deskSize === k, action: () => this.setDeskSize(k) })).concat([{ sep: true },
            { label: 'Auto arrange icons', check: this.autoArrange, action: () => { this.autoArrange = !this.autoArrange; if (this.autoArrange) this.sortDesk('name'); } },
            { label: 'Align icons to grid', check: true, action: () => {} }, { sep: true },
            { label: 'Show desktop icons', check: this.deskShow, action: () => { this.deskShow = !this.deskShow; this.renderDesktop(); } }]) },
          { label: 'Sort by', icon: 'sort', sub: [['name', 'Name'], ['size', 'Size'], ['type', 'Item type'], ['modified', 'Date modified']].map(([k, l]) => ({ label: l, action: () => this.sortDesk(k) })) },
          { label: 'Refresh', icon: 'refresh', action: () => this.refresh() }, undo, paste, { sep: true },
          { label: 'New', icon: 'plus', sub: newSub }, { sep: true },
          { label: 'Display settings', iconMarkup: GL.view, action: () => this.openSettings('Display') },
          { label: 'Personalize', iconMarkup: GL.show, action: () => this.openSettings('Personalization') }, { sep: true },
          { label: 'Show more options', icon: 'more', action: () => this.menu([{ label: 'View', sub: sizes.map(([k, l]) => ({ label: l, radio: this.deskSize === k, action: () => this.setDeskSize(k) })) }, { label: 'Sort by', sub: [['name', 'Name'], ['size', 'Size'], ['type', 'Item type'], ['modified', 'Date modified']].map(([k, l]) => ({ label: l, action: () => this.sortDesk(k) })) }, { label: 'Refresh', action: () => this.refresh() }, { sep: true }, { label: 'Paste', disabled: !this.clipboard, action: () => this.paste(folder, surf) }, undo ? { label: undo.label, action: () => this.undo() } : null, { sep: true }, { label: 'New', sub: newSub }, { sep: true }, { label: 'Display settings', action: () => this.openSettings('Display') }, { label: 'Personalize', action: () => this.openSettings('Personalization') }], x, y, { classic: true }) }
        ], x, y);
        return;
      }
      const w = owner;
      const viewSub = w.viewItems(), sortSub = w.sortItems();
      if (w.tab.loc.t === 'recycle') {
        this.menu([{ label: 'View', icon: 'view', sub: viewSub }, { label: 'Sort by', icon: 'sort', sub: sortSub }, { label: 'Refresh', icon: 'refresh', action: () => this.refresh() }, undo, { sep: true },
          { label: 'Empty Recycle Bin', icon: 'del', disabled: !this.recycle.length, action: () => this.emptyBin() }, { label: 'Restore all items', icon: 'restore', disabled: !this.recycle.length, action: () => this.restore(this.recycle.slice()) }, { sep: true },
          { label: 'Properties', icon: 'props', action: () => this.properties(this.sysBin) }], x, y);
        return;
      }
      this.menu([
        { label: 'View', icon: 'view', sub: viewSub }, { label: 'Sort by', icon: 'sort', sub: sortSub }, { label: 'Group by', icon: 'list', sub: [{ label: 'None', radio: true }] },
        undo, { sep: true }, folder ? paste : null, folder ? { label: 'New', icon: 'plus', disabled: !canWrite, sub: newSub } : null, folder ? { sep: true } : null,
        { label: 'Refresh', icon: 'refresh', action: () => this.refresh() },
        folder ? { label: 'Properties', icon: 'props', shortcut: 'Alt+Enter', action: () => this.properties(folder) } : null, folder ? { sep: true } : null,
        folder ? { label: 'Show more options', icon: 'more', action: () => this.menu([{ label: 'View', sub: viewSub }, { label: 'Sort by', sub: sortSub }, { label: 'Refresh', action: () => this.refresh() }, { sep: true }, { label: 'Paste', disabled: !(canWrite && this.clipboard), action: () => this.paste(folder, surf) }, { label: 'Paste shortcut', disabled: true }, undo ? { label: undo.label, action: () => this.undo() } : null, { sep: true }, { label: 'Give access to', sub: [{ label: 'Specific people...', disabled: true }] }, { sep: true }, { label: 'New', disabled: !canWrite, sub: newSub }, { sep: true }, { label: 'Properties', action: () => this.properties(folder) }], x, y, { classic: true }) } : null
      ], x, y);
    }

    /* ---------- dialogs, progress, notifications */
    dialog(o) {
      return new Promise(resolve => {
        const prevFocus = document.activeElement;
        const modal = h('div', { class: 'w11-modal' });
        const dlg = h('div', { class: 'w11-dialog ' + (o.cls || ''), role: 'alertdialog', 'aria-label': o.title, tabindex: '-1' });
        let choice = null, cb = null, input = null;
        const finish = value => {
          modal.remove();
          if (this.modal && this.modal.el === dlg) this.modal = null;
          resolve({ value, choice, checked: cb ? cb.checked : false, input: input ? input.value : null });
          if (prevFocus && prevFocus.isConnected && this.screen.contains(prevFocus)) prevFocus.focus({ preventScroll: true }); else this.screen.focus({ preventScroll: true });
        };
        const x = h('button', { type: 'button', class: 'w11-dlg-x', 'aria-label': 'Close', html: GL.close });
        x.onclick = () => finish('cancel');
        const title = h('div', { class: 'w11-dlg-title' }, h('span', { text: o.title }), x);
        const ICONS = {
          warn: '<svg viewBox="0 0 32 32"><path d="M16 3 30 28H2z" fill="#f7b500" stroke="#c48900" stroke-linejoin="round"/><path d="M16 11v9" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="24" r="1.6" fill="#1a1a1a"/></svg>',
          shield: '<svg viewBox="0 0 32 32"><path d="M16 2 4 6v9c0 7.5 5 12.5 12 15 7-2.5 12-7.5 12-15V6z" fill="#0f6cbd"/><path d="M16 2v28c7-2.5 12-7.5 12-15V6z" fill="#f2b400"/><path d="M4 15h24" stroke="#fff" stroke-width="1.5"/></svg>',
          info: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#0f6cbd"/><path d="M16 14v9" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="9.5" r="1.7" fill="#fff"/></svg>'
        };
        const body = h('div', { class: 'w11-dlg-body' });
        if (o.progressText) body.append(h('p', { class: 'w11-dlg-progress', text: o.progressText }));
        body.append(h('div', { class: 'w11-dlg-main' },
          o.icon ? h('span', { class: 'w11-dlg-icon', html: ICONS[o.icon] || o.icon }) : null,
          h('div', { class: 'w11-dlg-text' }, o.heading ? h('h4', { text: o.heading }) : null, o.message ? h('p', { text: o.message }) : null,
            o.sub ? h('p', { class: 'sub', text: o.sub }) : null, o.item ? this.itemSummary(o.item) : null)));
        if (o.input) { input = h('input', { type: 'text', class: 'w11-dlg-input', value: o.input.value || '', 'aria-label': o.input.label }); body.append(h('label', { class: 'w11-dlg-field' }, h('span', { text: o.input.label }), input)); }
        let list = null;
        if (o.choices) {
          list = h('div', { class: 'w11-dlg-choices' });
          o.choices.forEach((c, i) => {
            const b = h('button', { type: 'button', class: 'w11-choice' + (!o.instant && i === 0 ? ' on' : '') }, c.icon ? icoSpan(c.icon) : c.glyph ? glyph(c.glyph) : null,
              h('span', { class: 'w11-choice-text' }, h('span', { class: 'w11-choice-label', text: c.label }), c.note ? h('span', { class: 'w11-choice-note', text: c.note }) : null));
            b.onclick = () => { choice = c.value; if (o.instant) finish('choice'); else list.querySelectorAll('.w11-choice').forEach(z => z.classList.toggle('on', z === b)); };
            b.ondblclick = () => { if (!o.instant) { choice = c.value; finish((o.buttons && o.buttons[0] && o.buttons[0].value) || 'ok'); } };
            list.append(b);
          });
          if (!o.instant) choice = o.choices[0].value;
          body.append(list);
        }
        if (o.checkbox) { cb = h('input', { type: 'checkbox' }); body.append(h('label', { class: 'w11-dlg-check' }, cb, ' ' + o.checkbox)); }
        const foot = h('div', { class: 'w11-dlg-foot' }, (o.buttons || [{ label: 'OK', primary: true }]).map(bt => {
          const b = h('button', { type: 'button', class: 'w11-btn' + (bt.primary ? ' primary' : '') }, bt.label);
          b.onclick = () => finish(bt.value || bt.label.toLowerCase());
          return b;
        }));
        dlg.append(title, body, foot);
        modal.append(dlg);
        this.screen.append(modal);
        this.modal = { el: dlg, cancel: () => finish('cancel'), submit: () => { const p = foot.querySelector('.primary') || foot.querySelector('button'); if (p) p.click(); } };
        modal.addEventListener('pointerdown', e => { if (e.target === modal) { dlg.classList.remove('flash'); void dlg.offsetWidth; dlg.classList.add('flash'); this.screen.focus({ preventScroll: true }); dlg.focus({ preventScroll: true }); } });
        title.addEventListener('pointerdown', e => {
          if (e.target.closest('button')) return;
          const sx = e.clientX, sy = e.clientY, ox = dlg._dx || 0, oy = dlg._dy || 0;
          this.track(e, { threshold: 2, onMove: ev => { dlg._dx = ox + ev.clientX - sx; dlg._dy = oy + ev.clientY - sy; dlg.style.translate = dlg._dx + 'px ' + dlg._dy + 'px'; } });
        });
        const first = input || (o.instant && list ? list.querySelector('button') : null) || foot.querySelector('.primary') || foot.querySelector('button');
        setTimeout(() => { first.focus({ preventScroll: true }); if (input) input.select(); }, 0);
      });
    }
    itemSummary(n) {
      return h('div', { class: 'w11-dlg-item' }, this.iconEl(n, 48, true), h('div', {},
        h('strong', { text: this.shown(n) }), h('span', { text: 'Type: ' + typeName(n) }),
        n.folder ? h('span', { text: 'Date created: ' + fmtDate(n.created) }) : h('span', { text: 'Size: ' + fmtBytes(n.size || 0) }),
        h('span', { text: 'Date modified: ' + fmtDate(n.modified) })));
    }
    progress(text, bytes) {
      return new Promise(res => {
        const dur = clamp(bytes / 2.4e8 * 900, 700, 2400);
        const bar = h('span'), pct = h('strong', { text: '0% complete' });
        const box = h('div', { class: 'w11-progress', role: 'status' },
          h('div', { class: 'w11-dlg-title' }, h('span', { text: '0% complete' })),
          h('div', { class: 'w11-dlg-body' }, h('p', { text }), pct, h('div', { class: 'w11-prog' }, bar), h('p', { class: 'sub', text: 'Speed: ' + (90 + (hash(text) % 60)) + ' MB/s' })));
        this.screen.append(box);
        const head = box.querySelector('.w11-dlg-title span');
        const t0 = performance.now();
        const tick = now => {
          const f = Math.min(1, (now - t0) / dur);
          bar.style.width = (f * 100).toFixed(1) + '%';
          pct.textContent = head.textContent = Math.round(f * 100) + '% complete';
          if (f < 1) requestAnimationFrame(tick); else { setTimeout(() => { box.remove(); res(); }, 120); }
        };
        requestAnimationFrame(tick);
      });
    }
    toast(title, text, extra) {
      const x = h('button', { type: 'button', class: 'w11-toast-x', 'aria-label': 'Dismiss', html: GL.close });
      const t = h('div', { class: 'w11-toast', role: 'status' }, h('div', { class: 'w11-toast-head' }, icoSpan(ICON.explorer), h('span', { text: 'File Explorer' }), x),
        h('strong', { text: title }), h('p', { text }), extra || null);
      x.onclick = () => t.remove();
      this.overlay.querySelectorAll('.w11-toast').forEach(o => o.remove());
      this.overlay.append(t);
      setTimeout(() => t.remove(), extra ? 14000 : 5000);
      return t;
    }
    balloon(anchor, title, text) {
      this.overlay.querySelectorAll('.w11-balloon').forEach(b => b.remove());
      const sr = this.screen.getBoundingClientRect(), r = anchor.getBoundingClientRect();
      const b = h('div', { class: 'w11-balloon', role: 'alert' }, h('strong', { text: title }), h('span', { text }));
      b.style.left = clamp(r.left - sr.left, 4, sr.width - 260) + 'px';
      b.style.top = (r.bottom - sr.top + 8) + 'px';
      this.overlay.append(b);
      setTimeout(() => b.remove(), 4200);
    }
    snapHint(on) {
      if (on && !this.snapEl) { this.snapEl = h('div', { class: 'w11-snap' }); this.layer.append(this.snapEl); }
      if (!on && this.snapEl) { this.snapEl.remove(); this.snapEl = null; }
    }

    /* ---------- Start menu */
    toggleStart() { if (this.startEl) this.closeStart(); else this.openStart(); }
    apps() {
      return [['explorer', 'File Explorer', () => this.openExplorer({ t: 'home' })], ['notepad', 'Notepad', () => this.addWindow(new NotepadWin(this, null))],
        ['photos', 'Photos', () => this.addWindow(new PhotosWin(this, null))], ['player', 'Media Player', () => this.addWindow(new PlayerWin(this, null))],
        ['editor', 'Video Editor', () => this.addWindow(new EditorWin(this, null))], ['settings', 'Settings', () => this.openSettings()]];
    }
    openStart() {
      this.closeMenu();
      const input = h('input', { class: 'w11-start-search', type: 'search', placeholder: 'Search for apps, settings, and documents', 'aria-label': 'Search apps and files' });
      const body = h('div', { class: 'w11-start-body' });
      const launch = fn => { this.closeStart(); fn(); };
      const pinned = () => {
        const rec = this.recent.filter(n => isAttached(this.fs, n)).slice(0, 6);
        return h('div', { class: 'w11-start-home' },
          h('div', { class: 'w11-start-h' }, h('strong', { text: 'Pinned' }), h('span', { class: 'w11-start-pill', text: 'All ›' })),
          h('div', { class: 'w11-start-grid' }, this.apps().map(([ic, name, fn]) => { const b = h('button', { type: 'button', class: 'w11-start-app' }, icoSpan(ICON[ic]), h('span', { text: name })); b.onclick = () => launch(fn); return b; })),
          h('div', { class: 'w11-start-h' }, h('strong', { text: 'Recommended' })),
          rec.length ? h('div', { class: 'w11-start-rec' }, rec.map(n => { const b = h('button', { type: 'button', class: 'w11-start-recitem' }, this.iconEl(n, 32, false), h('span', {}, h('b', { text: this.shown(n) }), h('small', { text: 'Recently opened' }))); b.onclick = () => launch(() => this.openFile(n)); return b; }))
            : h('p', { class: 'w11-start-empty', text: 'Files you open will show up here.' }));
      };
      const results = q => {
        const ql = q.toLowerCase(), out = [];
        this.apps().forEach(([ic, name, fn]) => { if (name.toLowerCase().includes(ql)) out.push({ icon: icoSpan(ICON[ic]), name, sub: 'App', go: fn }); });
        const walk = n => n.children.forEach(c => { if (c.hidden && !this.showHidden) return; if (c.name.toLowerCase().includes(ql)) out.push({ icon: this.iconEl(c, 32, false), name: c.name, sub: c.folder ? 'Folder – ' + this.winPath(c.parent) : typeName(c) + ' – ' + this.winPath(c.parent), go: () => this.openEntry({ node: c }, null) }); if (c.folder && !isProtected(c)) walk(c); });
        walk(this.fs.root);
        if (!out.length) return h('p', { class: 'w11-start-empty', text: 'No results for “' + q + '”' });
        return h('div', { class: 'w11-start-results' }, h('div', { class: 'w11-start-h' }, h('strong', { text: 'Best match' })), out.slice(0, 9).map((r, i) => {
          const b = h('button', { type: 'button', class: 'w11-start-result' + (i === 0 ? ' best' : '') }, r.icon, h('span', {}, h('b', { text: r.name }), h('small', { text: r.sub })));
          b.onclick = () => { this.log('start-search', { detail: q }); launch(r.go); };
          return b;
        }));
      };
      input.oninput = () => fill(body, input.value.trim() ? results(input.value.trim()) : pinned());
      input.onkeydown = e => {
        if (e.key === 'Enter') { const f = body.querySelector('.w11-start-result'); if (f) f.click(); }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.closeStart(); }
      };
      const power = h('button', { type: 'button', class: 'w11-start-power', 'aria-label': 'Power', title: 'Power', html: GL.power });
      power.onclick = () => { const r = power.getBoundingClientRect(); this.menu([{ label: 'Sleep', action: () => this.sleep() }, { label: 'Shut down', action: () => this.restart() }, { label: 'Restart', action: () => this.restart() }], r.left, r.top, { above: true }); };
      this.startEl = h('div', { class: 'w11-start', role: 'dialog', 'aria-label': 'Start' },
        h('div', { class: 'w11-start-top' }, glyph('search'), input), body,
        h('div', { class: 'w11-start-foot' }, h('span', { class: 'w11-start-user' }, icoSpan(ICON.user), h('span', { text: this.fs.user })), power));
      body.append(pinned());
      this.overlay.append(this.startEl);
      this.renderTaskbar();
      setTimeout(() => input.focus({ preventScroll: true }), 0);
      this.log('start', {});
    }
    closeStart() { if (!this.startEl) return; this.startEl.remove(); this.startEl = null; this.renderTaskbar(); }
    sleep() {
      const s = h('div', { class: 'w11-sleep', tabindex: '0' }, h('span', { text: 'Click or press any key to wake the computer' }));
      const wake = () => { s.remove(); this.screen.focus(); };
      s.addEventListener('pointerdown', wake); s.addEventListener('keydown', wake);
      this.screen.append(s); s.focus();
    }

    /* ---------- taskbar */
    buildTaskbar() {
      this.tbStart = h('button', { type: 'button', class: 'w11-tb-btn w11-tb-start', title: 'Start', 'aria-label': 'Start', html: GL.start });
      this.tbStart.onclick = () => this.toggleStart();
      const search = h('button', { type: 'button', class: 'w11-tb-search', 'aria-label': 'Search' }, glyph('search'), h('span', { text: 'Search' }));
      search.onclick = () => this.toggleStart();
      const tv = h('button', { type: 'button', class: 'w11-tb-btn', title: 'Task View', 'aria-label': 'Task View', html: GL.taskview });
      tv.onclick = () => { const wins = this.windows.filter(w => w.app !== 'props'); if (!wins.length) return; const r = tv.getBoundingClientRect(); this.menu(wins.map(w => ({ label: w.title, iconMarkup: ICON[w.app] || ICON.explorer, action: () => this.focusWin(w) })), r.left, r.top, { above: true }); };
      this.tbApps = h('div', { class: 'w11-tb-apps' });
      this.clockT = h('span'); this.clockD = h('span');
      const show = h('button', { type: 'button', class: 'w11-tb-showdesk', title: 'Show desktop', 'aria-label': 'Show desktop' });
      show.onclick = () => this.showDesktop();
      const clock = h('button', { type: 'button', class: 'w11-tb-clock' }, this.clockT, this.clockD);
      clock.onclick = () => this.toast('Calendar', new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
      this.taskbar.append(h('div', { class: 'w11-tb-center' }, this.tbStart, search, tv, this.tbApps),
        h('div', { class: 'w11-tb-tray' },
          h('button', { type: 'button', class: 'w11-tb-tray-btn', title: 'Show hidden icons', 'aria-label': 'Show hidden icons', html: GL.chevU }),
          h('button', { type: 'button', class: 'w11-tb-tray-btn w11-tb-sys', title: 'Internet access\nSpeakers: 60%\nBattery: 84% remaining', 'aria-label': 'Network, sound and battery' }, glyph('wifi'), glyph('volume'), glyph('battery')),
          clock, h('button', { type: 'button', class: 'w11-tb-tray-btn', title: 'No new notifications', 'aria-label': 'Notifications', html: GL.bell }), show));
      const tick = () => {
        const d = new Date(); let hr = d.getHours(); const ap = hr >= 12 ? 'PM' : 'AM'; hr = hr % 12 || 12;
        this.clockT.textContent = hr + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + ap;
        this.clockD.textContent = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
      };
      tick();
      this.clock = setInterval(() => { if (!this.wrap.isConnected && this.wrap.parentNode == null && this._mounted) { clearInterval(this.clock); return; } if (this.wrap.isConnected) this._mounted = true; tick(); }, 15000);
    }
    renderTaskbar() {
      if (!this.tbApps) return;
      this.tbStart.classList.toggle('active', !!this.startEl);
      const groups = ['explorer'];
      this.windows.forEach(w => { const g = w.app === 'props' ? 'explorer' : w.app; if (!groups.includes(g)) groups.push(g); });
      fill(this.tbApps, ...groups.map(app => {
        const wins = this.windows.filter(w => w.app === app || (app === 'explorer' && w.app === 'props'));
        const name = APPS[app] ? APPS[app].name : app;
        const label = wins.length === 1 ? wins[0].title : wins.length ? name + ' – ' + wins.length + ' windows' : name;
        const btn = h('button', { type: 'button', class: 'w11-tb-btn w11-tb-app' + (wins.length ? ' running' : '') + (wins.includes(this.active) ? ' active' : '') + (wins.length > 1 ? ' multi' : ''), title: label, 'aria-label': label },
          icoSpan(ICON[app] || ICON.explorer), h('span', { class: 'w11-tb-ind' }));
        btn.onclick = e => this.taskbarClick(app, btn, e);
        btn.addEventListener('auxclick', e => { if (e.button === 1) { e.preventDefault(); this.launchApp(app); } });
        btn.addEventListener('contextmenu', e => { e.preventDefault(); this.jumpList(app, btn); });
        return btn;
      }));
    }
    launchApp(app) { const a = this.apps().find(x => x[0] === app); if (a) a[2](); }
    taskbarClick(app, btn, e) {
      const wins = this.windows.filter(w => w.app === app || (app === 'explorer' && w.app === 'props'));
      this.closeStart();
      if (!wins.length || e.shiftKey) { this.launchApp(app); return; }
      if (wins.length === 1) { const w = wins[0]; if (this.active === w && !w.minimized) this.minimize(w); else this.focusWin(w); return; }
      const r = btn.getBoundingClientRect();
      this.menu(wins.map(w => ({ label: w.title, iconMarkup: ICON[w.app] || ICON.explorer, bold: w === this.active, action: () => this.focusWin(w) })), r.left, r.top, { above: true });
    }
    jumpList(app, btn) {
      const r = btn.getBoundingClientRect();
      const wins = this.windows.filter(w => w.app === app || (app === 'explorer' && w.app === 'props'));
      const items = [];
      if (app === 'explorer') { items.push({ label: 'Pinned', disabled: true }); this.pins.filter(n => isAttached(this.fs, n)).forEach(n => items.push({ label: this.label(n), iconMarkup: this.iconMarkup(n), action: () => this.openExplorer({ t: 'node', node: n }) })); items.push({ sep: true }); }
      items.push({ label: APPS[app].name, iconMarkup: ICON[app], action: () => this.launchApp(app) }, { label: 'Unpin from taskbar', icon: 'unpin', disabled: true });
      if (wins.length) items.push({ label: wins.length > 1 ? 'Close all windows' : 'Close window', icon: 'close', action: () => wins.slice().forEach(w => w.requestClose()) });
      this.menu(items, r.left, r.top, { above: true });
    }

    /* ---------- keyboard */
    onKey(e) {
      if (/^(Arrow|Tab|Home|End|F6)/.test(e.key)) this.screen.classList.add('kbd');
      if (this.modal) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.modal.cancel(); }
        else if (e.key === 'Enter' && !(e.target.matches && e.target.matches('button'))) { e.preventDefault(); this.modal.submit(); }
        return;
      }
      if (this.menuEl) { this.menuKey(e); return; }
      const ctrl = modKey(e);
      if (ctrl && e.key === 'Escape') { e.preventDefault(); this.toggleStart(); return; }
      if (!IS_MAC && e.key === 'Meta') { this.winKey = true; return; }
      if (!IS_MAC && e.metaKey) {
        this.winKey = false;
        const lk = e.key.toLowerCase();
        if (lk === 'e') { e.preventDefault(); this.openExplorer({ t: 'home' }); return; }
        if (lk === 'd') { e.preventDefault(); this.showDesktop(); return; }
      }
      if (e.key === 'Escape' && this.startEl) { e.preventDefault(); this.closeStart(); return; }
      const t = e.target;
      if (t.matches && t.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (t.matches && t.matches('button') && (e.key === 'Enter' || e.key === ' ')) return;
      if (this.startEl) return;
      const w = this.active;
      if (w && w.key) { if (w.key(e)) { e.preventDefault(); e.stopPropagation(); } return; }
      if (!w && this.desk.key(e)) { e.preventDefault(); e.stopPropagation(); }
    }
  }

  /* ------------------------------------------------------------------ windows */
  class Win {
    constructor(sim, o) {
      this.sim = sim; this.app = o.app; this.title = o.title || APPS[o.app] && APPS[o.app].name || '';
      this.el = h('div', { class: 'w11-win ' + (o.cls || ''), tabindex: '-1', role: 'group', 'aria-label': this.title });
      this.titlebar = h('div', { class: 'w11-titlebar' });
      this.tcontent = h('div', { class: 'w11-tcontent' });
      this.controls = h('div', { class: 'w11-wctl' });
      const mk = (cls, label, gl, fn) => { const b = h('button', { type: 'button', class: 'w11-wbtn ' + cls, 'aria-label': label, title: label, html: GL[gl] }); b.onclick = e => { e.stopPropagation(); fn(); }; return b; };
      if (!o.dialog) {
        this.minBtn = mk('min', 'Minimize', 'min', () => sim.minimize(this));
        this.maxBtn = mk('max', 'Maximize', 'max', () => this.toggleMax());
        this.controls.append(this.minBtn, this.maxBtn);
      }
      this.controls.append(mk('close', 'Close', 'close', () => this.requestClose()));
      this.titlebar.append(this.tcontent, this.controls);
      this.body = h('div', { class: 'w11-wbody' });
      this.el.append(this.titlebar, this.body);
      this.w = this.w0 = o.w || 760; this.h = this.h0 = o.h || 520; this.minW = o.minW || 320; this.minH = o.minH || 200; this.fixed = !!o.fixed;
      if (!this.fixed) ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(d => { const g = h('div', { class: 'w11-grip g-' + d }); g.addEventListener('pointerdown', e => this.resize(e, d)); this.el.append(g); });
      this.titlebar.addEventListener('pointerdown', e => this.dragWin(e));
      this.titlebar.addEventListener('dblclick', e => { if (!e.target.closest('button, .w11-tab') && !this.fixed) this.toggleMax(); });
      this.el.addEventListener('pointerdown', () => { if (sim.active !== this) sim.focusWin(this); }, true);
    }
    setTitle(t) { this.title = t; this.el.setAttribute('aria-label', t); this.sim.renderTaskbar(); }
    place() {
      const { w: W, h: H } = this.sim.size();
      const k = Math.max(0, this.sim.windows.indexOf(this)) % 6;
      // Leave the first column of desktop icons visible, as students need to drag between the desktop and windows.
      const left = W - 24 > this.minW + 110 ? 110 : 0;
      this.w = Math.max(this.minW, Math.min(this.w, W - left - 16)); this.h = Math.max(this.minH, Math.min(this.h, H - 16));
      this.x = clamp(this.x != null ? this.x : Math.max(left, (W - this.w) / 2 + 40) + k * 30, 0, Math.max(0, W - this.w));
      this.y = clamp(this.y != null ? this.y : (H - this.h) / 2 - 36 + k * 28, 0, Math.max(0, H - this.h));
      if (this.x + this.w > W - 4) this.w = Math.max(this.minW, W - this.x - 8);
      this.apply();
    }
    apply() {
      const s = this.el.style;
      this.el.classList.toggle('max', !!this.max);
      if (this.max) { s.left = '0px'; s.top = '0px'; s.width = '100%'; s.height = 'calc(100% - 48px)'; }
      else { s.left = this.x + 'px'; s.top = this.y + 'px'; s.width = this.w + 'px'; s.height = this.h + 'px'; }
      if (this.maxBtn) { this.maxBtn.innerHTML = this.max ? GL.restoreWin : GL.max; this.maxBtn.title = this.max ? 'Restore Down' : 'Maximize'; this.maxBtn.setAttribute('aria-label', this.maxBtn.title); }
    }
    toggleMax() { this.max = !this.max; this.apply(); this.sim.log(this.max ? 'maximize' : 'restore-down', { app: this.app }); }
    clampToScreen() {
      const { w: W, h: H } = this.sim.size();
      if (!this.max) { this.w = clamp(this.w, this.minW, Math.max(this.minW, W)); this.h = clamp(this.h, this.minH, Math.max(this.minH, H)); if (!this.userPlaced && this.x + this.w > W) this.x = Math.max(0, W - this.w); this.x = clamp(this.x, Math.min(0, -this.w + 140), Math.max(0, W - 140)); this.y = clamp(this.y, 0, Math.max(0, H - 40)); }
      this.apply();
    }
    dragWin(e) {
      if (e.button !== 0 || e.target.closest('button, input, .w11-tab, .w11-nodrag')) return;
      const sim = this.sim, sx = e.clientX, sy = e.clientY;
      let ox = this.x, oy = this.y;
      sim.track(e, {
        threshold: 3,
        onStart: () => {
          if (this.max) {
            const sr = sim.screen.getBoundingClientRect(), ratio = (sx - sr.left) / sr.width;
            this.max = false; this.x = sx - sr.left - this.w * ratio; this.y = 0; ox = this.x; oy = this.y; this.apply();
          }
          this.el.classList.add('moving'); this.userPlaced = true;
        },
        onMove: ev => {
          const { w: W, h: H } = sim.size();
          this.x = clamp(ox + ev.clientX - sx, -this.w + 120, W - 120);
          this.y = clamp(oy + ev.clientY - sy, 0, H - 34);
          this.apply();
          if (!this.fixed) sim.snapHint(ev.clientY - sim.screen.getBoundingClientRect().top <= 3);
        },
        onEnd: ev => {
          this.el.classList.remove('moving');
          if (!this.fixed && ev.clientY - sim.screen.getBoundingClientRect().top <= 3) { this.max = true; this.y = 0; this.apply(); sim.log('maximize', { app: this.app, detail: 'snap' }); }
          sim.snapHint(false);
        }
      });
    }
    resize(e, d) {
      if (e.button !== 0 || this.max) return;
      e.stopPropagation(); this.userPlaced = true;
      const sx = e.clientX, sy = e.clientY, o = { x: this.x, y: this.y, w: this.w, h: this.h };
      this.sim.track(e, {
        threshold: 0,
        onMove: ev => {
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (d.includes('e')) this.w = Math.max(this.minW, o.w + dx);
          if (d.includes('s')) this.h = Math.max(this.minH, o.h + dy);
          if (d.includes('w')) { this.w = Math.max(this.minW, o.w - dx); this.x = o.x + o.w - this.w; }
          if (d.includes('n')) { this.h = Math.max(this.minH, o.h - dy); this.y = Math.max(0, o.y + o.h - this.h); }
          this.apply();
        }
      });
    }
    requestClose() { this.close(); }
    close() { if (this.onClose) this.onClose(); this.sim.log('close-app', { app: this.app }); this.sim.removeWin(this); }
  }

  /* ------------------------------------------------------------------ File Explorer */
  class Explorer extends Win {
    constructor(sim, loc) {
      super(sim, { app: 'explorer', cls: 'w11-explorer', w: 960, h: 600, minW: 500, minH: 320 });
      this.tabs = []; this.showNav = true; this.pane = null; this.expanded = new Set(); this.colW = {};
      this.tabsEl = h('div', { class: 'w11-tabs', role: 'tablist' });
      this.tcontent.append(this.tabsEl);
      this.cmd = h('div', { class: 'w11-cmdbar', role: 'toolbar', 'aria-label': 'Command bar' });
      const nb = (gl, label, fn) => { const b = h('button', { type: 'button', class: 'w11-navbtn', title: label, 'aria-label': label, html: GL[gl] }); b.onclick = fn; return b; };
      this.bBack = nb('back', 'Back (Alt + Left Arrow)', () => this.back());
      this.bFwd = nb('fwd', 'Forward (Alt + Right Arrow)', () => this.forward());
      this.bUp = nb('up', 'Up to parent folder (Alt + Up Arrow)', () => this.up());
      this.bRef = nb('refresh', 'Refresh (F5)', () => { this.sim.refresh(); this.sim.log('refresh', {}); });
      this.addr = h('div', { class: 'w11-addr', role: 'navigation', 'aria-label': 'Address bar' });
      this.addr.addEventListener('pointerdown', e => { if (e.target === this.addr || e.target.classList.contains('w11-crumbs')) { e.preventDefault(); this.editAddress(); } });
      this.searchIn = h('input', { type: 'search', class: 'w11-search-in', 'aria-label': 'Search' });
      this.searchIn.addEventListener('input', () => { clearTimeout(this.sTimer); this.sTimer = setTimeout(() => this.doSearch(this.searchIn.value), 280); });
      this.searchIn.addEventListener('keydown', e => {
        if (e.key === 'Enter') { clearTimeout(this.sTimer); this.doSearch(this.searchIn.value); }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.searchIn.value = ''; this.doSearch(''); this.content.focus(); }
      });
      this.row = h('div', { class: 'w11-addrrow' }, h('div', { class: 'w11-navbtns' }, this.bBack, this.bFwd, this.bUp, this.bRef), this.addr, h('label', { class: 'w11-search' }, this.searchIn, glyph('search')));
      this.nav = h('div', { class: 'w11-nav', role: 'tree', 'aria-label': 'Navigation pane' });
      this.content = h('div', { class: 'w11-content w11-surface', 'data-drop': 'surface', tabindex: '-1', role: 'listbox', 'aria-multiselectable': 'true', 'aria-label': 'Items' });
      this.side = h('aside', { class: 'w11-side' });
      this.splitter = h('div', { class: 'w11-navsplit', 'aria-hidden': 'true' });
      this.splitter.addEventListener('pointerdown', e => { const sx = e.clientX, w0 = this.nav.offsetWidth; this.sim.track(e, { threshold: 0, onMove: ev => { this.nav.style.width = clamp(w0 + ev.clientX - sx, 120, 420) + 'px'; } }); });
      this.status = h('div', { class: 'w11-status' });
      this.xbody = h('div', { class: 'w11-xbody' }, this.nav, this.splitter, h('div', { class: 'w11-main' }, this.content), this.side);
      this.body.append(this.cmd, this.row, this.xbody, this.status);
      this.flat = [];
      this.surface = new Surface(sim, this.content, {
        entries: () => this.flat, target: () => this.dropTarget(), mode: () => this.view(),
        open: en => this.openEntry(en),
        focusSelf: () => { if (!this.content.contains(document.activeElement)) this.content.focus({ preventScroll: true }); },
        onSelect: () => { if (this.tab) this.tab.sel = new Set(this.surface.sel); this.renderStatus(); this.renderSide(); this.renderCmd(); },
        zoom: dir => { const i = ZOOM_ORDER.indexOf(this.view()); this.setView(ZOOM_ORDER[clamp((i < 0 ? 3 : i) + dir, 0, ZOOM_ORDER.length - 1)]); },
        openTab: en => sim.openEntry(en, this, { newTab: true })
      });
      this.addTab(loc, true);
    }
    get tab() { return this._tab; }
    addTab(loc, initial) {
      const tab = { loc, back: [], fwd: [], sel: new Set(), scroll: 0, trail: [] };
      this.tabs.push(tab);
      if (initial !== true) this.sim.log('new-tab', { path: this.sim.locPath(loc) });
      this.switchTab(tab);
      this.arrive(loc);
    }
    switchTab(tab) {
      if (this._tab && this._tab !== tab) { this._tab.scroll = this.content.scrollTop; this._tab.sel = new Set(this.surface.sel); }
      this._tab = tab;
      this.surface.sel = new Set(tab.sel); this.surface.focus = null; this.surface.anchor = null;
      this.searchIn.value = tab.loc.t === 'search' ? tab.loc.q : '';
      this.render();
      this.content.scrollTop = tab.scroll || 0;
    }
    closeTab(tab) {
      if (this.tabs.length === 1) { this.close(); return; }
      const i = this.tabs.indexOf(tab);
      this.sim.log('close', { path: this.sim.locPath(tab.loc), detail: 'tab' });
      this.tabs.splice(i, 1);
      if (tab === this._tab) { this._tab = null; this.switchTab(this.tabs[Math.max(0, i - 1)]); } else this.renderTabs();
    }
    close() { this.tabs.forEach(t => this.sim.log('close', { path: this.sim.locPath(t.loc) })); super.close(); }
    navigate(loc, o) {
      o = o || {};
      const tab = this.tab;
      if (this.sim.locEq(loc, tab.loc) && !o.force) { this.render(); this.arrive(loc, o.via); return; }
      if (!o.noHistory) { tab.back.push(tab.loc); tab.fwd = []; }
      if (loc.t !== 'search') this.searchIn.value = '';
      tab.loc = loc; tab.sel = new Set();
      this.surface.sel = new Set(); this.surface.focus = null; this.surface.anchor = null;
      this.render();
      this.content.scrollTop = 0; this.content.scrollLeft = 0;
      this.arrive(loc, o.via);
    }
    arrive(loc, via) {
      if (loc.t === 'node') this.tab.trail = this.sim.chain(loc.node).concat(loc.node.drive ? [] : []);
      if (loc.t !== 'search') this.sim.log('open', { path: this.sim.locPath(loc), via });
    }
    back() { const t = this.tab; if (!t.back.length) return; t.fwd.push(t.loc); this.navigate(t.back.pop(), { noHistory: true, via: 'back' }); this.sim.log('back', {}); }
    forward() { const t = this.tab; if (!t.fwd.length) return; t.back.push(t.loc); this.navigate(t.fwd.pop(), { noHistory: true, via: 'forward' }); this.sim.log('forward', {}); }
    parentLoc(loc) {
      if (loc.t === 'search') return loc.base;
      if (loc.t === 'node') { const n = loc.node; if (n.drive) return { t: 'thispc' }; if (n.special) return { t: 'home' }; return n.parent ? { t: 'node', node: n.parent } : null; }
      if (loc.t === 'thispc' || loc.t === 'recycle' || loc.t === 'network') return { t: 'node', node: this.sim.fs.special.desktop };
      return null;
    }
    up() { const p = this.parentLoc(this.tab.loc); if (p) { this.navigate(p, { via: 'up' }); this.sim.log('up', {}); } }
    openEntry(en) { this.sim.openEntry(en, this); }
    dropTarget() { const l = this.tab.loc; return l.t === 'node' ? l.node : l.t === 'recycle' ? 'recycle' : null; }
    refresh() {
      const sim = this.sim;
      this.tabs.forEach(t => {
        const bad = l => l.t === 'node' ? !isAttached(sim.fs, l.node) : l.t === 'search' ? bad(l.base) : false;
        if (bad(t.loc)) {
          const alive = (t.trail || []).slice().reverse().find(n => isAttached(sim.fs, n));
          t.loc = alive ? { t: 'node', node: alive } : { t: 'thispc' };
          t.back = t.back.filter(l => !bad(l)); t.fwd = t.fwd.filter(l => !bad(l));
          if (t === this.tab) { this.surface.sel = new Set(); this.searchIn.value = ''; }
        }
      });
      this.render();
    }
    prefKey(loc) { return loc.t === 'node' ? loc.node.id : loc.t; }
    prefsFor(loc) {
      const key = this.prefKey(loc);
      let p = this.sim.prefs.get(key);
      if (!p) { p = { view: this.defaultView(loc), sort: loc.t === 'recycle' ? 'deleted' : 'name', asc: loc.t !== 'recycle' }; this.sim.prefs.set(key, p); }
      return p;
    }
    defaultView(loc) {
      if (loc.t === 'thispc') return 'tiles';
      if (loc.t === 'gallery') return 'large';
      if (loc.t === 'search' || loc.t === 'recycle' || loc.t === 'home' || loc.t === 'network') return 'details';
      const n = loc.node;
      if (n.view) return n.view;
      if (n.special === 'pictures' || n.special === 'videos') return 'large';
      const files = n.children.filter(c => !c.folder);
      if (files.length && files.filter(c => ['video', 'image'].includes(kindOf(c))).length / files.length >= 0.6) return 'large';
      return this.sim.block.view || 'details';
    }
    view() { return this.tab.loc.t === 'home' ? 'home' : this.prefsFor(this.tab.loc).view; }
    setView(mode) {
      if (this.tab.loc.t === 'home') return;
      this.prefsFor(this.tab.loc).view = mode;
      this.sim.log('view', { detail: mode, path: this.sim.locPath(this.tab.loc) });
      this.render();
      const f = this.surface.focus || [...this.surface.sel][0];
      if (f) this.surface.scrollTo(f);
    }
    setSort(key, asc) {
      const p = this.prefsFor(this.tab.loc);
      if (asc == null) asc = p.sort === key ? !p.asc : key === 'name' || key === 'type';
      p.sort = key; p.asc = asc;
      this.sim.log('sort', { detail: key, asc });
      this.render();
    }
    togglePane(name) { this.pane = this.pane === name ? null : name; this.sim.log('pane', { detail: name, on: this.pane === name }); this.render(); }
    groups() {
      const sim = this.sim, loc = this.tab.loc, p = this.prefsFor(loc);
      const sorted = list => list.slice().sort(sim.sorter(p.sort, p.asc));
      const E = (n, pre) => ({ key: (pre || '') + n.id, node: n });
      if (loc.t === 'node') return [{ entries: sorted(sim.visible(loc.node.children)).map(n => E(n)) }];
      if (loc.t === 'thispc') return [{ title: 'Folders', entries: SPECIALS.map(([k]) => E(sim.fs.special[k])) }, { title: 'Devices and drives', entries: sim.fs.root.children.map(n => E(n)) }];
      if (loc.t === 'home') return [{ title: 'Quick access', entries: sim.pins.filter(n => isAttached(sim.fs, n)).map(n => E(n, 'qa:')), mode: 'tiles' }, { title: 'Recent', entries: sim.recent.filter(n => isAttached(sim.fs, n)).map(n => E(n, 'rc:')), mode: 'details' }];
      if (loc.t === 'gallery') { const out = []; const walk = n => n.children.forEach(c => { if (c.folder) walk(c); else if (kindOf(c) === 'image') out.push(c); }); walk(sim.fs.special.pictures); return [{ entries: out.sort((a, b) => b.modified - a.modified).map(n => E(n)) }]; }
      if (loc.t === 'recycle') return [{ entries: sorted(sim.recycle.map(r => r.node)).map(n => ({ key: n.id, node: n, rec: sim.recycle.find(r => r.node === n) })) }];
      if (loc.t === 'search') return [{ entries: this.searchResults(loc).map(n => ({ key: n.id, node: n, found: true })) }];
      return [{ entries: [] }];
    }
    searchResults(loc) {
      const sim = this.sim, q = loc.q.toLowerCase(), out = [];
      const walk = n => n.children.forEach(c => { if (c.hidden && !sim.showHidden) return; if (c.name.toLowerCase().includes(q)) out.push(c); if (c.folder) walk(c); });
      const b = loc.base;
      if (b.t === 'node') walk(b.node);
      else if (b.t === 'thispc') sim.fs.root.children.forEach(walk);
      else if (b.t === 'home') SPECIALS.forEach(([k]) => walk(sim.fs.special[k]));
      else if (b.t === 'recycle') sim.recycle.forEach(r => { if (r.node.name.toLowerCase().includes(q)) out.push(r.node); });
      return out;
    }
    doSearch(raw) {
      const q = raw.trim(), loc = this.tab.loc;
      const base = loc.t === 'search' ? loc.base : loc;
      if (!q) { if (loc.t === 'search') this.navigate(base, { noHistory: true }); return; }
      if (base.t === 'gallery' || base.t === 'network') return;
      const nl = { t: 'search', base, q };
      this.navigate(nl, { noHistory: loc.t === 'search' });
      const res = this.searchResults(nl);
      res.forEach(n => this.sim.log('search', { path: this.sim.pathOf(n), detail: q, base: this.sim.locPath(base) }));
      this.sim.log('search-run', { detail: q, path: this.sim.locPath(base), count: res.length });
    }
    columns() {
      const t = this.tab.loc.t;
      if (t === 'recycle') return [['name', 'Name', 240], ['origin', 'Original Location', 230], ['deleted', 'Date Deleted', 160], ['size', 'Size', 90], ['type', 'Item type', 130]];
      if (t === 'search') return [['name', 'Name', 230], ['modified', 'Date modified', 150], ['type', 'Type', 120], ['size', 'Size', 90], ['folder', 'Folder', 280]];
      if (t === 'thispc') return [['name', 'Name', 230], ['type', 'Type', 140], ['total', 'Total Size', 110], ['free', 'Free Space', 110]];
      if (t === 'home') return [['name', 'Name', 250], ['accessed', 'Date accessed', 160], ['folder', 'Location', 320]];
      return [['name', 'Name', 270], ['modified', 'Date modified', 160], ['type', 'Type', 150], ['size', 'Size', 100]];
    }
    cell(en, k) {
      const n = en.node, sim = this.sim;
      switch (k) {
        case 'modified': return n.drive || n.special ? '' : fmtDate(n.modified);
        case 'type': return typeName(n);
        case 'size': return n.folder || n.drive ? '' : fmtKB(n.size);
        case 'origin': return en.rec ? en.rec.origin : '';
        case 'deleted': return en.rec ? fmtDate(en.rec.at) : '';
        case 'folder': return n.parent ? sim.label(n.parent) + ' (' + sim.winPath(n.parent) + ')' : '';
        case 'total': return n.drive ? fmtGB(n.drive.capacity) : '';
        case 'free': return n.drive ? fmtGB(sim.freeSpace(n)) : '';
        case 'accessed': return fmtDate(n._openedAt || n.modified);
        default: return '';
      }
    }
    render() {
      if (!this.tab) return;
      const sim = this.sim, loc = this.tab.loc;
      this.setTitle(sim.locTitle(loc));
      this.renderTabs(); this.renderAddress(); this.renderNav(); this.renderContent(); this.renderCmd(); this.renderSide(); this.renderStatus();
      this.bBack.disabled = !this.tab.back.length; this.bFwd.disabled = !this.tab.fwd.length; this.bUp.disabled = !this.parentLoc(loc);
      this.searchIn.placeholder = 'Search ' + sim.locTitle(loc.t === 'search' ? loc.base : loc);
      this.xbody.classList.toggle('no-nav', !this.showNav);
      this.xbody.classList.toggle('has-side', !!this.pane);
    }
    renderTabs() {
      const sim = this.sim;
      const plus = h('button', { type: 'button', class: 'w11-tabplus', title: 'Add new tab (Ctrl+T)', 'aria-label': 'Add new tab', html: GL.plus });
      plus.onclick = () => this.addTab({ t: 'home' });
      fill(this.tabsEl, ...this.tabs.map(t => {
        const x = h('button', { type: 'button', class: 'w11-tab-x', title: 'Close tab', 'aria-label': 'Close tab', html: GL.close });
        const el = h('div', { class: 'w11-tab' + (t === this.tab ? ' on' : ''), role: 'tab', 'aria-selected': String(t === this.tab), title: sim.locTitle(t.loc) },
          icoSpan(sim.locIcon(t.loc)), h('span', { class: 'w11-tab-label', text: sim.locTitle(t.loc) }), x);
        el.addEventListener('pointerdown', e => { if (e.button === 1) { e.preventDefault(); this.closeTab(t); } else if (e.button === 0 && !e.target.closest('.w11-tab-x') && t !== this.tab) { this.switchTab(t); this.sim.log('switch-tab', {}); } });
        x.onclick = e => { e.stopPropagation(); this.closeTab(t); };
        return el;
      }), plus);
    }
    crumbs(loc) {
      const sim = this.sim;
      if (loc.t === 'search') return this.crumbs(loc.base).concat([{ label: sim.locTitle(loc), loc }]);
      if (loc.t !== 'node') return [{ label: sim.locTitle(loc), loc }];
      const c = sim.chain(loc.node);
      const out = c.map(n => ({ label: sim.label(n), loc: { t: 'node', node: n }, node: n }));
      if (c[0] && c[0].drive) out.unshift({ label: 'This PC', loc: { t: 'thispc' } });
      return out;
    }
    subfolderItems(loc) {
      const sim = this.sim;
      if (loc.t === 'thispc') return SPECIALS.map(([k]) => sim.fs.special[k]).concat(sim.fs.root.children).map(n => ({ label: sim.label(n), iconMarkup: sim.iconMarkup(n), action: () => this.navigate({ t: 'node', node: n }, { via: 'crumb' }) }));
      if (loc.t === 'node') return sim.visible(loc.node.children).filter(c => c.folder).sort(sim.sorter('name', true)).map(n => ({ label: n.name, iconMarkup: sim.iconMarkup(n), action: () => this.navigate({ t: 'node', node: n }, { via: 'crumb' }) }));
      return [];
    }
    renderAddress() {
      if (this.editingAddr) return;
      const sim = this.sim, loc = this.tab.loc, segs = this.crumbs(loc);
      const chev = (items, cls) => {
        const b = h('button', { type: 'button', class: 'w11-crumb-chev' + (cls ? ' ' + cls : ''), 'aria-label': 'Show folders', html: GL.chevR });
        b.onclick = e => { e.stopPropagation(); const r = b.getBoundingClientRect(); b.classList.add('open'); this.sim.menu(items(), r.left, r.bottom + 2); };
        return b;
      };
      const rootItems = () => [{ label: 'Home', iconMarkup: ICON.home, action: () => this.navigate({ t: 'home' }) }, { label: 'Gallery', iconMarkup: ICON.gallery, action: () => this.navigate({ t: 'gallery' }) }, { sep: true }]
        .concat(SPECIALS.map(([k]) => sim.fs.special[k]).map(n => ({ label: n.name, iconMarkup: sim.iconMarkup(n), action: () => this.navigate({ t: 'node', node: n }) })))
        .concat([{ sep: true }, { label: 'This PC', iconMarkup: ICON.pc, action: () => this.navigate({ t: 'thispc' }) }, { label: 'Network', iconMarkup: ICON.network, action: () => this.navigate({ t: 'network' }) }, { label: 'Recycle Bin', iconMarkup: ICON.bin(sim.recycle.length > 0), action: () => this.navigate({ t: 'recycle' }) }]);
      const parts = [icoSpan(sim.locIcon(loc), 'w11-addr-ic'), chev(rootItems)];
      segs.forEach((s, i) => {
        const b = h('button', { type: 'button', class: 'w11-crumb', 'data-drop': s.node ? 'crumb' : null, 'data-node': s.node ? s.node.id : null }, s.label);
        b.onclick = e => { e.stopPropagation(); this.navigate(s.loc, { via: 'crumb' }); sim.log('crumb', { path: sim.locPath(s.loc) }); };
        parts.push(b);
        const subs = this.subfolderItems(s.loc);
        if (i < segs.length - 1 || subs.length) parts.push(chev(() => this.subfolderItems(s.loc)));
      });
      fill(this.addr, h('div', { class: 'w11-crumbs' }, parts));
    }
    addrText(loc) { return loc.t === 'node' ? this.sim.winPath(loc.node) : loc.t === 'search' ? this.addrText(loc.base) : this.sim.locTitle(loc); }
    editAddress() {
      if (this.editingAddr) return;
      this.editingAddr = true;
      const input = h('input', { type: 'text', class: 'w11-addr-in', value: this.addrText(this.tab.loc), 'aria-label': 'Address', spellcheck: 'false' });
      const go = h('button', { type: 'button', class: 'w11-addr-go', title: 'Go to', 'aria-label': 'Go', html: GL.fwd });
      let done = false;
      const end = () => { if (done) return; done = true; this.editingAddr = false; this.renderAddress(); };
      const submit = () => { const v = input.value; done = true; this.editingAddr = false; this.goAddress(v); };
      input.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
        if (e.key === 'Escape') { e.preventDefault(); end(); this.content.focus(); }
      });
      input.addEventListener('blur', () => setTimeout(() => { if (!done && document.activeElement !== go) end(); }, 0));
      go.addEventListener('pointerdown', e => e.preventDefault());
      go.onclick = submit;
      fill(this.addr, icoSpan(this.sim.locIcon(this.tab.loc), 'w11-addr-ic'), input, go);
      input.focus(); input.select();
      this.sim.log('address-edit', {});
    }
    async goAddress(raw) {
      const sim = this.sim, v = raw.trim();
      this.renderAddress();
      if (!v) return;
      const loc = sim.parseLoc(v);
      if (loc) { this.navigate(loc, { via: 'address' }); sim.log('address', { path: sim.locPath(loc) }); this.content.focus(); return; }
      const r = sim.locate(v);
      if (r && !r.folder) { sim.log('address', { path: r.path }); sim.openFile(r.node); return; }
      await sim.dialog({ title: 'File Explorer', icon: 'warn', message: 'Windows can’t find ‘' + v + '’. Check the spelling and try again.', buttons: [{ label: 'OK', primary: true }] });
      sim.log('address-miss', { detail: v });
      this.editAddress();
    }
    expandKey(k, on) { if (on === false || (on == null && this.expanded.has(k))) this.expanded.delete(k); else this.expanded.add(k); this.renderNav(); }
    renderNav() {
      const sim = this.sim, cur = this.tab.loc, rows = [];
      const row = o => {
        const sel = o.node ? cur.t === 'node' && cur.node === o.node : cur.t === o.virt;
        const exp = this.expanded.has(o.ekey);
        const r = h('div', {
          class: 'w11-navrow' + (sel ? ' sel' : ''), role: 'treeitem', 'aria-selected': String(sel), 'data-ekey': o.ekey,
          'data-drop': (o.node && o.node.folder) || o.virt === 'recycle' ? 'nav' : null, 'data-node': o.node ? o.node.id : o.virt,
          style: 'padding-left:' + (6 + o.depth * 16) + 'px', 'aria-expanded': o.expandable ? String(exp) : null, title: o.title || null
        }, h('span', { class: 'w11-navchev' + (o.expandable ? '' : ' none'), html: exp ? GL.chevD : GL.chevR }),
          icoSpan(o.icon, 'w11-navic'), h('span', { class: 'w11-navlabel', text: o.label }), o.pinned ? glyph('pin', 'w11-navpin') : null);
        r.addEventListener('pointerdown', e => {
          let btn = e.button; if (IS_MAC && btn === 0 && e.ctrlKey) btn = 2;
          if (btn === 2) { e.preventDefault(); sim.track(e, { onClick: ev => this.navMenu(o, ev.clientX, ev.clientY) }); return; }
          if (btn === 1) { e.preventDefault(); this.addTab(o.node ? { t: 'node', node: o.node } : { t: o.virt }); return; }
          if (btn !== 0) return;
          if (e.target.closest('.w11-navchev')) { if (o.expandable) this.expandKey(o.ekey); return; }
          if (o.node && o.node.folder) sim.track(e, { surface: this.navSurface(o), entry: { key: 'nav:' + o.node.id, node: o.node }, button: 0, onClick: () => this.navClick(o) });
          else sim.track(e, { onClick: () => this.navClick(o) });
        });
        rows.push(r);
        if (exp && o.node) sim.visible(o.node.children).filter(c => c.folder).sort(sim.sorter('name', true)).forEach(c => row({ node: c, label: c.name, icon: sim.iconMarkup(c), depth: o.depth + 1, expandable: c.children.some(x => x.folder), ekey: o.ekey + '/' + c.id }));
        if (exp && o.virt === 'thispc') sim.fs.root.children.forEach(d => row({ node: d, label: driveLabel(d), icon: sim.iconMarkup(d), depth: o.depth + 1, expandable: d.children.some(x => x.folder), ekey: o.ekey + '/' + d.id }));
      };
      const sep = () => rows.push(h('div', { class: 'w11-navsep' }));
      row({ virt: 'home', label: 'Home', icon: ICON.home, depth: 0, ekey: 'home' });
      row({ virt: 'gallery', label: 'Gallery', icon: ICON.gallery, depth: 0, ekey: 'gallery' });
      sim.fs.root.children.filter(d => d.drive.kind === 'cloud').forEach(d => row({ node: d, label: d.name, icon: sim.iconMarkup(d), depth: 0, expandable: d.children.some(x => x.folder), ekey: 'cloud/' + d.id }));
      sep();
      sim.pins.filter(n => isAttached(sim.fs, n)).forEach(n => row({ node: n, label: sim.label(n), icon: sim.iconMarkup(n), depth: 0, expandable: n.children.some(c => c.folder), ekey: 'pin/' + n.id, pinned: true }));
      sep();
      row({ virt: 'thispc', label: 'This PC', icon: ICON.pc, depth: 0, expandable: true, ekey: 'thispc' });
      sim.fs.root.children.filter(d => d.drive.kind === 'usb' || d.drive.kind === 'sd').forEach(d => row({ node: d, label: driveLabel(d), icon: sim.iconMarkup(d), depth: 0, expandable: d.children.some(x => x.folder), ekey: 'drv/' + d.id }));
      row({ virt: 'network', label: 'Network', icon: ICON.network, depth: 0, ekey: 'network' });
      const st = this.nav.scrollTop;
      fill(this.nav, ...rows);
      this.nav.scrollTop = st;
    }
    navSurface(o) {
      // A one-item stand-in so folders in the navigation pane can be dragged like items.
      const en = { key: 'nav:' + o.node.id, node: o.node };
      return { selected: () => [en], host: this.nav, elFor: () => null };
    }
    navClick(o) {
      const sim = this.sim, loc = o.node ? { t: 'node', node: o.node } : { t: o.virt };
      this.navigate(loc, { via: 'nav' });
      sim.log('navpane', { path: sim.locPath(loc) });
    }
    navMenu(o, x, y) {
      const sim = this.sim, loc = o.node ? { t: 'node', node: o.node } : { t: o.virt };
      sim.log('context-menu', { path: sim.locPath(loc), target: 'nav' });
      const items = [{ label: 'Open in new tab', icon: 'newTab', action: () => this.addTab(loc) }, { label: 'Open in new window', icon: 'newWin', action: () => sim.openExplorer(loc) }];
      if (o.expandable) items.push({ label: this.expanded.has(o.ekey) ? 'Collapse' : 'Expand', icon: 'chevD', action: () => this.expandKey(o.ekey) });
      if (o.node && o.node.folder && !o.node.drive) items.push(sim.pins.includes(o.node) ? { label: 'Unpin from Quick access', icon: 'unpin', action: () => sim.togglePin(o.node) } : { label: 'Pin to Quick access', icon: 'pin', action: () => sim.togglePin(o.node) });
      if (o.node && o.node.drive && o.node.drive.kind !== 'system' && o.node.drive.kind !== 'cloud') items.push({ label: 'Eject', icon: 'eject', action: () => sim.eject(o.node) });
      if (o.node && sim.clipboard) items.push({ label: 'Paste', icon: 'paste', action: () => sim.paste(o.node, null) });
      if (o.node && o.node.folder) items.push({ label: 'Copy as path', icon: 'path', action: () => sim.copyAsPath([o.node]) });
      items.push({ sep: true }, { label: 'Properties', icon: 'props', action: () => sim.properties(o.node || (o.virt === 'thispc' ? sim.sysPC : sim.sysBin)) });
      sim.menu(items, x, y);
    }
    itemEl(en, mode, cols) {
      const sim = this.sim, n = en.node;
      const isDrop = (n.folder || n.drive) && !en.rec;
      const el = h('div', { class: 'w11-item', 'data-key': en.key, 'data-drop': isDrop ? 'entry' : null, role: 'option', 'aria-label': sim.shown(n), title: mode === 'details' ? null : sim.tooltip(n) });
      const cb = sim.checkboxes ? h('span', { class: 'w11-cb', html: GL.check }) : null;
      const label = h('span', { class: 'w11-label', text: sim.shown(n) });
      const px = { xl: 200, large: 96, medium: 48, small: 16, list: 16, details: 16, tiles: 48, content: 40 }[mode] || 16;
      const icon = sim.iconEl(n, px, ['xl', 'large', 'medium', 'tiles', 'content'].includes(mode));
      const put = (...k) => k.flat(3).forEach(c => { if (c) el.append(c); });
      if (mode === 'details') put(h('span', { class: 'w11-cell c-name' }, cb, h('span', { class: 'w11-hit' }, icon, label)), cols.slice(1).map(([k]) => h('span', { class: 'w11-cell c-' + k, text: this.cell(en, k) })));
      else if (mode === 'tiles') put(cb, h('span', { class: 'w11-hit' }, icon, h('span', { class: 'w11-tiletext' }, label, this.tileLines(en))));
      else if (mode === 'content') put(cb, h('span', { class: 'w11-hit' }, icon, h('span', { class: 'w11-ctext' }, label, h('span', { class: 'w11-sub', text: n.folder ? 'Date created: ' + fmtDate(n.created) : 'Type: ' + typeName(n) }))),
        h('span', { class: 'w11-cmeta' }, h('span', { text: n.drive || n.special ? '' : 'Date modified: ' + fmtDate(n.modified) }), h('span', { text: n.folder || n.drive ? '' : 'Size: ' + fmtBytes(n.size || 0) })));
      else put(cb, h('span', { class: 'w11-hit' }, icon, label));
      return el;
    }
    tileLines(en) {
      const sim = this.sim, n = en.node;
      if (n.drive) {
        const free = sim.freeSpace(n), used = 1 - free / n.drive.capacity;
        return [h('span', { class: 'w11-dbar' + (used > 0.9 ? ' full' : '') }, h('span', { style: 'width:' + (used * 100).toFixed(1) + '%' })), h('span', { class: 'w11-sub', text: fmtGB(free) + ' free of ' + fmtGB(n.drive.capacity) })];
      }
      if (n.special || (this.tab.loc.t === 'home' && n.folder)) return [h('span', { class: 'w11-sub', text: n.special ? 'Stored locally' : sim.label(n.parent || n) }), sim.pins.includes(n) ? glyph('pin', 'w11-tilepin') : null];
      if (n.folder) return [h('span', { class: 'w11-sub', text: 'File folder' })];
      return [h('span', { class: 'w11-sub', text: typeName(n) }), h('span', { class: 'w11-sub', text: fmtBytes(n.size || 0) })];
    }
    renderContent() {
      const sim = this.sim, loc = this.tab.loc, mode = this.view(), groups = this.groups();
      this.flat = groups.reduce((a, g) => a.concat(g.entries), []);
      const c = this.content;
      c.className = 'w11-content w11-surface v-' + mode + (sim.compact ? ' compact' : '') + (sim.checkboxes ? ' cbs' : '');
      const cols = this.columns();
      const widths = this.colW[loc.t] || (this.colW[loc.t] = {});
      const template = cols.map(([k, , w]) => (widths[k] || w) + 'px').join(' ') + ' minmax(16px, 1fr)';
      c.style.setProperty('--cols', template);
      const kids = [];
      const header = () => {
        const p = this.prefsFor(loc);
        return h('div', { class: 'w11-colhead' }, cols.map(([k, l]) => {
          const b = h('button', { type: 'button', class: 'w11-colbtn c-' + k + (p.sort === k ? ' sorted ' + (p.asc ? 'asc' : 'desc') : '') }, h('span', { text: l }), p.sort === k ? glyph(p.asc ? 'chevU' : 'chevD', 'w11-sortarrow') : null);
          b.onclick = () => { if (['name', 'modified', 'type', 'size', 'deleted'].includes(k)) this.setSort(k); };
          const grip = h('span', { class: 'w11-colgrip' });
          grip.addEventListener('pointerdown', e => {
            e.stopPropagation(); e.preventDefault();
            const sx = e.clientX, w0 = b.getBoundingClientRect().width;
            sim.track(e, { threshold: 0, onMove: ev => { widths[k] = Math.max(48, Math.round(w0 + ev.clientX - sx)); c.style.setProperty('--cols', cols.map(([kk, , ww]) => (widths[kk] || ww) + 'px').join(' ') + ' minmax(16px, 1fr)'); } });
          });
          grip.addEventListener('click', e => e.stopPropagation());
          b.append(grip);
          return b;
        }), h('span', { class: 'w11-colfill' }));
      };
      if (loc.t === 'home') {
        groups.forEach(g => {
          kids.push(h('div', { class: 'w11-group w11-nohit' }, glyph('chevD'), h('span', { text: g.title })));
          if (g.mode === 'details') {
            const box = h('div', { class: 'w11-items v-details' }, header(), g.entries.map(en => this.itemEl(en, 'details', cols)));
            if (!g.entries.length) box.append(h('p', { class: 'w11-empty-inline', text: 'After you open some files, the most recent ones show up here.' }));
            kids.push(box);
          } else kids.push(h('div', { class: 'w11-items v-tiles qa' }, g.entries.map(en => this.itemEl(en, 'tiles', cols))));
        });
      } else if (mode === 'details') {
        kids.push(header());
        groups.forEach(g => { if (g.title) kids.push(h('div', { class: 'w11-group w11-nohit' }, glyph('chevD'), h('span', { text: g.title + ' (' + g.entries.length + ')' }))); g.entries.forEach(en => kids.push(this.itemEl(en, 'details', cols))); });
      } else {
        groups.forEach(g => {
          if (g.title) kids.push(h('div', { class: 'w11-group w11-nohit' }, glyph('chevD'), h('span', { text: g.title + ' (' + g.entries.length + ')' })));
          kids.push(h('div', { class: 'w11-items v-' + mode }, g.entries.map(en => this.itemEl(en, mode, cols))));
        });
      }
      if (!this.flat.length && loc.t !== 'home') {
        kids.push(h('div', { class: 'w11-empty', text: loc.t === 'search' ? 'No items match your search.' : loc.t === 'network' ? 'Network discovery is turned off. Network computers and devices are not visible.' : 'This folder is empty.' }));
      }
      const marquee = c.querySelector('.w11-marquee');
      const st = c.scrollTop, sl = c.scrollLeft;
      fill(c, ...kids);
      if (marquee) c.append(marquee);
      c.scrollTop = st; c.scrollLeft = sl;
      this.surface.sync();
    }
    renderCmd() {
      const sim = this.sim, loc = this.tab.loc, sel = this.surface.selected(), nodes = this.surface.nodes();
      const folder = this.dropTarget(), canWrite = folder && folder !== 'recycle' && !isProtected(folder);
      const editable = nodes.length > 0 && nodes.every(n => !sim.lockedReason(n)) && !sel.some(e => e.rec);
      const btn = (gl, label, fn, o) => {
        o = o || {};
        const b = h('button', { type: 'button', class: 'w11-cbtn' + (o.text ? ' text' : ''), title: o.tip || label, 'aria-label': label, disabled: !!o.disabled },
          h('span', { class: 'w11-gl', html: o.markup || GL[gl] }), o.text ? h('span', { class: 'w11-ctext-l', text: o.text }) : null, o.drop ? glyph('chevD', 'w11-cdrop') : null);
        b.onclick = () => { const r = b.getBoundingClientRect(); fn(r); };
        return b;
      };
      const sepEl = () => h('span', { class: 'w11-csep' });
      const items = [];
      if (loc.t === 'recycle') {
        items.push(btn('del', 'Empty Recycle Bin', () => sim.emptyBin(), { text: 'Empty Recycle Bin', disabled: !sim.recycle.length }),
          btn('restore', 'Restore all items', () => sim.restore(sim.recycle.slice()), { text: 'Restore all items', disabled: !sim.recycle.length }),
          btn('restore', 'Restore the selected items', () => sim.restore(sel.map(e => e.rec).filter(Boolean)), { text: 'Restore the selected items', disabled: !sel.length }), sepEl(),
          btn('cut', 'Cut', () => sim.setClip(nodes, 'cut'), { tip: 'Cut (Ctrl+X)', disabled: !sel.length }),
          btn('del', 'Delete', () => sim.deleteNodes(nodes, true), { tip: 'Delete (Delete)', disabled: !sel.length }), sepEl());
      } else {
        items.push(btn('plus', 'New', r => sim.menu([{ label: 'Folder', iconMarkup: ICON.folder(false), shortcut: 'Ctrl+Shift+N', action: () => sim.newItem(folder, 'folder', this.surface) }, { sep: true }, { label: 'Shortcut', iconMarkup: ICON.file('shortcut'), disabled: true }, { label: 'Text Document', iconMarkup: ICON.file('text'), action: () => sim.newItem(folder, 'text', this.surface) }], r.left, r.bottom + 2), { text: 'New', drop: true, disabled: !canWrite }),
          sepEl(),
          btn('cut', 'Cut', () => sim.setClip(nodes, 'cut'), { tip: 'Cut (Ctrl+X)', disabled: !editable }),
          btn('copy', 'Copy', () => sim.setClip(nodes, 'copy'), { tip: 'Copy (Ctrl+C)', disabled: !nodes.length }),
          btn('paste', 'Paste', () => sim.paste(folder, this.surface), { tip: 'Paste (Ctrl+V)', disabled: !(canWrite && sim.clipboard) }),
          btn('rename', 'Rename', () => this.surface.startRename(sel[0].key), { tip: 'Rename (F2)', disabled: !(editable && sel.length === 1) }),
          btn('share', 'Share', () => sim.toast('Share', 'Sharing is turned off on this practice PC.'), { disabled: !nodes.length || nodes.some(n => n.folder) }),
          btn('del', 'Delete', () => sim.deleteNodes(nodes), { tip: 'Delete (Delete)', disabled: !editable }),
          sepEl());
      }
      const v = this.view();
      items.push(btn('sort', 'Sort', r => sim.menu(this.sortItems(), r.left, r.bottom + 2), { text: 'Sort', drop: true, disabled: loc.t === 'home' || loc.t === 'thispc' }),
        btn('view', 'View', r => sim.menu(this.viewItems(true), r.left, r.bottom + 2), { text: 'View', drop: true, markup: GL[v] || GL.view }),
        sepEl(),
        btn('more', 'See more', r => sim.menu(this.moreItems(), r.left, r.bottom + 2), { tip: 'See more' }));
      const pb = btn('pane', 'Details', () => this.togglePane('details'), { text: 'Details', tip: 'Show the details pane (Alt+Shift+P)' });
      pb.classList.toggle('on', this.pane === 'details');
      fill(this.cmd, h('div', { class: 'w11-cleft' }, items), h('div', { class: 'w11-cright' }, pb));
    }
    viewItems(withShow) {
      const sim = this.sim, v = this.view(), home = this.tab.loc.t === 'home';
      const items = VIEW_MODES.map(([k, l], i) => ({ label: l, iconMarkup: GL[k], radio: v === k, shortcut: 'Ctrl+Shift+' + (i + 1), disabled: home, action: () => this.setView(k) }));
      items.push({ sep: true }, { label: 'Compact view', icon: 'compact', check: sim.compact, action: () => { sim.compact = !sim.compact; sim.log('compact', { on: sim.compact }); sim.refresh(); } });
      const show = [
        { label: 'Navigation pane', check: this.showNav, action: () => { this.showNav = !this.showNav; sim.log('pane', { detail: 'navigation', on: this.showNav }); this.render(); } },
        { label: 'Details pane', check: this.pane === 'details', shortcut: 'Alt+Shift+P', action: () => this.togglePane('details') },
        { label: 'Preview pane', check: this.pane === 'preview', shortcut: 'Alt+P', action: () => this.togglePane('preview') }, { sep: true },
        { label: 'Item check boxes', check: sim.checkboxes, action: () => { sim.checkboxes = !sim.checkboxes; sim.log('checkboxes', { on: sim.checkboxes }); sim.refresh(); } },
        { label: 'File name extensions', check: sim.showExt, action: () => { sim.showExt = !sim.showExt; sim.log('extensions', { on: sim.showExt, detail: sim.showExt ? 'on' : 'off' }); sim.refresh(); } },
        { label: 'Hidden items', check: sim.showHidden, action: () => { sim.showHidden = !sim.showHidden; sim.log('hidden-items', { on: sim.showHidden }); sim.refresh(); } }];
      if (withShow) items.push({ label: 'Show', icon: 'show', sub: show });
      return items;
    }
    sortItems() {
      const p = this.prefsFor(this.tab.loc), rec = this.tab.loc.t === 'recycle';
      const keys = rec ? [['name', 'Name'], ['deleted', 'Date Deleted'], ['size', 'Size'], ['type', 'Item type']] : [['name', 'Name'], ['modified', 'Date modified'], ['type', 'Type'], ['size', 'Size']];
      return keys.map(([k, l]) => ({ label: l, radio: p.sort === k, action: () => this.setSort(k, p.asc) }))
        .concat([{ sep: true }, { label: 'Ascending', radio: p.asc, action: () => this.setSort(p.sort, true) }, { label: 'Descending', radio: !p.asc, action: () => this.setSort(p.sort, false) }]);
    }
    moreItems() {
      const sim = this.sim, loc = this.tab.loc, s = this.surface, u = sim.undoStack[sim.undoStack.length - 1];
      return [u ? { label: 'Undo ' + u.label, icon: 'undo', shortcut: 'Ctrl+Z', action: () => sim.undo() } : { label: 'Undo', icon: 'undo', disabled: true },
        loc.t === 'node' && !loc.node.drive ? (sim.pins.includes(loc.node) ? { label: 'Unpin from Quick access', icon: 'unpin', action: () => sim.togglePin(loc.node) } : { label: 'Pin to Quick access', icon: 'pin', action: () => sim.togglePin(loc.node) }) : null,
        { sep: true },
        { label: 'Select all', icon: 'selAll', shortcut: 'Ctrl+A', action: () => s.selectAll() },
        { label: 'Select none', icon: 'selNone', action: () => { s.clear(); sim.log('select-none', {}); } },
        { label: 'Invert selection', icon: 'invert', action: () => { s.set(s.entries().map(e => e.key).filter(k => !s.sel.has(k))); sim.log('invert-selection', {}); } },
        { sep: true },
        { label: 'Properties', icon: 'props', shortcut: 'Alt+Enter', disabled: loc.t !== 'node' && !s.sel.size, action: () => { const en = s.selected()[0]; sim.properties(en ? en.node : loc.node, en && en.rec); } },
        { label: 'Options', icon: 'props', action: () => this.optionsDialog() }];
    }
    async optionsDialog() {
      const sim = this.sim;
      await sim.dialog({ title: 'Folder Options', icon: 'info', heading: 'View', message: 'Use View > Show in the command bar to turn on file name extensions, hidden items and item check boxes.', sub: 'File name extensions: ' + (sim.showExt ? 'shown' : 'hidden') + '. Hidden items: ' + (sim.showHidden ? 'shown' : 'hidden') + '.', buttons: [{ label: 'OK', primary: true }] });
    }
    renderSide() {
      const sim = this.sim, side = this.side;
      if (!this.pane) { fill(side, ); return; }
      const sel = this.surface.selected();
      const loc = this.tab.loc;
      if (this.pane === 'preview') {
        const en = sel.length === 1 ? sel[0] : null;
        if (!en) { fill(side, h('div', { class: 'w11-side-msg', text: sel.length ? 'Select a single file to preview.' : 'Select a file to preview.' })); return; }
        const n = en.node, kind = kindOf(n);
        const rec = n.media && T.mediaRecord && T.mediaRecord(n.media);
        if (kind === 'video' && rec && rec.status !== 'placeholder' && rec.type === 'video') {
          const v = h('video', { src: T.mediaURL(rec), controls: true, playsinline: true, preload: 'metadata', poster: rec.poster ? T.mediaURL({ file: rec.poster }) : null, 'aria-label': 'Preview of ' + n.name });
          v.addEventListener('play', () => { sim.log('preview-play', { path: sim.pathOf(n) }); });
          fill(side, h('div', { class: 'w11-side-prev' }, v));
          sim.log('preview', { path: sim.pathOf(n) });
          return;
        }
        const src = sim.thumbSrc(n);
        if (src) { fill(side, h('div', { class: 'w11-side-prev' }, h('img', { src, alt: 'Preview of ' + n.name }))); sim.log('preview', { path: sim.pathOf(n) }); return; }
        if (n.text != null && !n.folder) { fill(side, h('pre', { class: 'w11-side-text', text: n.text || '' })); sim.log('preview', { path: sim.pathOf(n) }); return; }
        fill(side, h('div', { class: 'w11-side-msg', text: 'No preview available.' }));
        return;
      }
      const rows = list => h('dl', { class: 'w11-side-props' }, list.filter(([, v]) => v != null && v !== '').map(([k, v]) => [h('dt', { text: k }), h('dd', { text: v })]));
      if (sel.length === 1) {
        const en = sel[0], n = en.node, m = this.sim.mediaMeta(n);
        fill(side, h('div', { class: 'w11-side-head' }, sim.iconEl(n, 96, true)), h('h3', { class: 'w11-side-name', text: sim.shown(n) }), h('p', { class: 'w11-side-type', text: typeName(n) }),
          h('h4', { text: 'Properties' }),
          rows(n.drive ? [['Total size', fmtGB(n.drive.capacity)], ['Space free', fmtGB(sim.freeSpace(n))], ['File system', ({ system: 'NTFS', usb: 'exFAT', sd: 'exFAT', network: 'NTFS', cloud: 'Cloud' })[n.drive.kind]]] :
            [['Size', n.folder ? null : fmtBytes(n.size || 0)], ['Date modified', n.special ? null : fmtDate(n.modified)], ['Date created', fmtDate(n.created)],
              ['Length', m.duration ? fmtDur(m.duration) : null], ['Frame width', m.width], ['Frame height', m.height], ['Frame rate', m.fps ? m.fps + ' frames/second' : null],
              ['Original location', en.rec ? en.rec.origin : null], ['Location', !en.rec && n.parent ? sim.winPath(n.parent) : null]]));
        return;
      }
      if (sel.length > 1) {
        const total = sel.reduce((s, e) => s + (e.node.folder ? 0 : e.node.size || 0), 0);
        fill(side, h('div', { class: 'w11-side-head multi' }, sel.slice(0, 3).map(e => sim.iconEl(e.node, 64, true))), h('h3', { class: 'w11-side-name', text: sel.length + ' items selected' }), rows([['Total size', total ? fmtBytes(total) : null]]));
        return;
      }
      fill(side, h('div', { class: 'w11-side-head' }, icoSpan(sim.locIcon(loc), 'big')), h('h3', { class: 'w11-side-name', text: sim.locTitle(loc) }), h('p', { class: 'w11-side-type', text: this.flat.length + (this.flat.length === 1 ? ' item' : ' items') }),
        h('p', { class: 'w11-side-msg', text: 'Select a single file to get more information and share your cloud content.' }));
    }
    renderStatus() {
      const sim = this.sim, sel = this.surface.selected(), n = this.flat.length;
      const parts = [h('span', { text: n + (n === 1 ? ' item' : ' items') })];
      if (sel.length) {
        const files = sel.filter(e => !e.node.folder && !e.node.drive && !e.node.virtual);
        const total = files.reduce((s, e) => s + (e.node.size || 0), 0);
        parts.push(h('span', { class: 'w11-stsep' }), h('span', { text: sel.length + (sel.length === 1 ? ' item selected' : ' items selected') + (files.length === sel.length && total ? '  ' + fmtBytes(total) : '') }));
      }
      if (sim.clipboard) parts.push(h('span', { class: 'w11-stsep' }), h('span', { class: 'w11-stclip', text: sim.clipboard.nodes.length + (sim.clipboard.nodes.length === 1 ? ' item ' : ' items ') + (sim.clipboard.mode === 'cut' ? 'cut' : 'copied') + ', ready to paste' }));
      const v = this.view();
      const vb = (k, label) => { const b = h('button', { type: 'button', class: 'w11-stbtn' + (v === k ? ' on' : ''), title: label, 'aria-label': label, html: GL[k] }); b.onclick = () => this.setView(k); return b; };
      fill(this.status, h('div', { class: 'w11-stleft' }, parts), h('div', { class: 'w11-stright' }, vb('details', 'Displays information about each item in the window'), vb('large', 'Display items by using large thumbnails')));
    }
    key(e) {
      const k = e.key, ctrl = modKey(e), code = e.code || '';
      const lk = k.length === 1 ? k.toLowerCase() : k;
      if (e.altKey && k === 'ArrowLeft') { this.back(); return true; }
      if (e.altKey && k === 'ArrowRight') { this.forward(); return true; }
      if (e.altKey && k === 'ArrowUp') { this.up(); return true; }
      if (k === 'Backspace') { this.back(); return true; }
      if ((ctrl && lk === 'l') || (e.altKey && code === 'KeyD') || k === 'F4') { this.editAddress(); return true; }
      if ((ctrl && (lk === 'e' || lk === 'f')) || k === 'F3') { this.searchIn.focus(); this.searchIn.select(); return true; }
      if (ctrl && e.shiftKey && /^Digit[1-8]$/.test(code)) { this.setView(VIEW_MODES[+code.slice(5) - 1][0]); return true; }
      if (e.altKey && code === 'KeyP') { this.togglePane(e.shiftKey ? 'details' : 'preview'); return true; }
      if (ctrl && !e.shiftKey && lk === 'n') { this.sim.openExplorer(this.tab.loc); return true; }
      if (ctrl && lk === 't') { this.addTab({ t: 'home' }); return true; }
      if (ctrl && lk === 'w') { this.closeTab(this.tab); return true; }
      if (ctrl && k === 'Tab') { const i = this.tabs.indexOf(this.tab); this.switchTab(this.tabs[(i + (e.shiftKey ? -1 : 1) + this.tabs.length) % this.tabs.length]); return true; }
      return this.surface.key(e);
    }
  }

  /* ------------------------------------------------------------------ apps */
  Sim.prototype.mediaMeta = function (n) {
    const rec = n && n.media && T.mediaRecord ? T.mediaRecord(n.media) : null;
    const m = Object.assign({}, rec ? { width: rec.w, height: rec.h, fps: rec.fps, duration: rec.duration } : {}, (n && n.meta) || {});
    return m;
  };
  class PlayerWin extends Win {
    constructor(sim, node) {
      super(sim, { app: 'player', cls: 'w11-app w11-player', w: 760, h: 500, minW: 380, minH: 260 });
      this.tt = h('span', { class: 'w11-ttext' });
      this.tcontent.append(icoSpan(ICON.player, 'w11-ticon'), this.tt);
      this.stage = h('div', { class: 'w11-pstage' });
      this.bar = h('div', { class: 'w11-pbar' });
      this.body.append(this.stage, this.bar);
      this.load(node);
    }
    stop() { if (this.video) this.video.pause(); clearInterval(this.fake); }
    load(node) {
      const sim = this.sim;
      this.stop();
      this.node = node; this.video = null;
      this.tt.textContent = node ? sim.shown(node) + ' - Media Player' : 'Media Player';
      this.setTitle(this.tt.textContent);
      if (!node) { fill(this.stage, h('div', { class: 'w11-pempty' }, icoSpan(ICON.videos, 'big'), h('p', { text: 'Open a video or song from File Explorer to play it here.' }))); fill(this.bar, ); return; }
      const rec = node.media && T.mediaRecord ? T.mediaRecord(node.media) : null;
      const m = sim.mediaMeta(node);
      const play = h('button', { type: 'button', class: 'w11-pplay', 'aria-label': 'Play', html: '<svg viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>' });
      const seek = h('input', { type: 'range', min: '0', max: '1000', value: '0', class: 'w11-pseek', 'aria-label': 'Seek' });
      const time = h('span', { class: 'w11-ptime', text: '0:00:00' }), dur = h('span', { class: 'w11-ptime', text: fmtDur(m.duration || 0) });
      const setPlaying = on => { play.innerHTML = on ? '<svg viewBox="0 0 16 16"><path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>'; play.setAttribute('aria-label', on ? 'Pause' : 'Play'); };
      if (rec && rec.status !== 'placeholder' && rec.type === 'video') {
        const v = h('video', { src: T.mediaURL(rec), playsinline: true, preload: 'auto', poster: rec.poster ? T.mediaURL({ file: rec.poster }) : null, 'aria-label': node.name });
        v.muted = true;
        this.video = v;
        const player = { stop: () => v.pause() };
        T.players.add(player);
        v.addEventListener('play', () => { T.stopPlayers(player); setPlaying(true); sim.log('play', { path: sim.pathOf(node) }); });
        v.addEventListener('pause', () => setPlaying(false));
        v.addEventListener('loadedmetadata', () => { dur.textContent = fmtDur(v.duration); });
        v.addEventListener('timeupdate', () => { time.textContent = fmtDur(v.currentTime); if (v.duration) seek.value = String(v.currentTime / v.duration * 1000); });
        v.addEventListener('click', () => { if (v.paused) v.play(); else v.pause(); });
        seek.oninput = () => { if (v.duration) v.currentTime = seek.value / 1000 * v.duration; };
        play.onclick = () => { if (v.paused) v.play().catch(() => {}); else v.pause(); };
        fill(this.stage, v);
        v.play().catch(() => {});
      } else {
        const d = m.duration || 8 + hash(node.name) % 20;
        dur.textContent = fmtDur(d);
        let t = 0;
        fill(this.stage, h('div', { class: 'w11-pfake' }, icoSpan(ICON.file(kindOf(node)), 'big'), h('strong', { text: node.name }), h('span', { text: 'Practice copy: the picture is not included, but the file plays like a real one.' })));
        const tickFn = () => { t = Math.min(d, t + 0.25); seek.value = String(t / d * 1000); time.textContent = fmtDur(t); if (t >= d) { clearInterval(this.fake); setPlaying(false); t = 0; } };
        play.onclick = () => { if (this.fake && this.playing) { clearInterval(this.fake); this.playing = false; setPlaying(false); } else { this.fake = setInterval(tickFn, 250); this.playing = true; setPlaying(true); sim.log('play', { path: sim.pathOf(node) }); } };
        seek.oninput = () => { t = seek.value / 1000 * d; time.textContent = fmtDur(t); };
        play.click();
      }
      fill(this.bar, h('div', { class: 'w11-pseekrow' }, time, seek, dur), h('div', { class: 'w11-pctrl' }, h('span', { class: 'w11-pname', text: sim.shown(node) }), play, h('span', { class: 'w11-pvol', html: GL.volume })));
    }
    onClose() { this.stop(); }
  }
  class PhotosWin extends Win {
    constructor(sim, node) {
      super(sim, { app: 'photos', cls: 'w11-app w11-photos', w: 760, h: 520, minW: 360, minH: 260 });
      this.tt = h('span', { class: 'w11-ttext' });
      this.tcontent.append(icoSpan(ICON.photos, 'w11-ticon'), this.tt);
      this.stage = h('div', { class: 'w11-phstage' });
      this.body.append(this.stage);
      this.load(node);
    }
    load(node) {
      const sim = this.sim;
      this.node = node;
      this.tt.textContent = node ? sim.shown(node) + ' - Photos' : 'Photos';
      this.setTitle(this.tt.textContent);
      if (!node) { fill(this.stage, h('div', { class: 'w11-pempty' }, icoSpan(ICON.pictures, 'big'), h('p', { text: 'Open a picture from File Explorer to see it here.' }))); return; }
      const src = sim.thumbSrc(node);
      if (src) { fill(this.stage, h('img', { src, alt: node.name })); return; }
      const hue = hash(node.name) % 360;
      fill(this.stage, h('div', { class: 'w11-phfake', style: 'background:linear-gradient(160deg,hsl(' + hue + ' 60% 70%),hsl(' + ((hue + 50) % 360) + ' 55% 38%))' },
        h('span', { html: '<svg viewBox="0 0 120 70"><circle cx="92" cy="18" r="9" fill="rgba(255,255,255,.8)"/><path d="M0 70 34 30l22 22 16-14 48 32z" fill="rgba(0,0,0,.28)"/></svg>' }),
        h('strong', { text: node.name })));
    }
  }
  class NotepadWin extends Win {
    constructor(sim, node) {
      super(sim, { app: 'notepad', cls: 'w11-app w11-notepad', w: 640, h: 440, minW: 320, minH: 220 });
      this.node = node;
      this.tt = h('span', { class: 'w11-ttext' });
      this.tcontent.append(icoSpan(ICON.notepad, 'w11-ticon'), this.tt);
      this.ta = h('textarea', { class: 'w11-np-text', spellcheck: 'false', 'aria-label': 'Text' });
      this.ta.value = node ? node.text || '' : '';
      this.saved = this.ta.value;
      this.pos = h('span', { text: 'Ln 1, Col 1' });
      const menu = (label, items) => { const b = h('button', { type: 'button', class: 'w11-np-menu', text: label }); b.onclick = () => { const r = b.getBoundingClientRect(); sim.menu(items(), r.left, r.bottom + 2); }; return b; };
      const bar = h('div', { class: 'w11-np-bar' },
        menu('File', () => [{ label: 'New window', shortcut: 'Ctrl+Shift+N', action: () => sim.addWindow(new NotepadWin(sim, null)) }, { label: 'Save', shortcut: 'Ctrl+S', action: () => this.save() }, { label: 'Save as', shortcut: 'Ctrl+Shift+S', action: () => this.save(true) }, { sep: true }, { label: 'Close window', action: () => this.requestClose() }]),
        menu('Edit', () => [{ label: 'Select all', shortcut: 'Ctrl+A', action: () => { this.ta.focus(); this.ta.select(); } }, { label: 'Time/Date', shortcut: 'F5', action: () => { this.ta.setRangeText(new Date().toLocaleString('en-US'), this.ta.selectionStart, this.ta.selectionEnd, 'end'); this.changed(); } }]),
        menu('View', () => [{ label: 'Status bar', check: true, action: () => {} }]));
      this.ta.addEventListener('input', () => this.changed());
      this.ta.addEventListener('keyup', () => this.caret()); this.ta.addEventListener('click', () => this.caret());
      this.ta.addEventListener('keydown', e => { if (modKey(e) && e.key.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); this.save(e.shiftKey); } });
      this.body.append(bar, this.ta, h('div', { class: 'w11-np-status' }, this.pos, h('span', { text: '100%' }), h('span', { text: 'Windows (CRLF)' }), h('span', { text: 'UTF-8' })));
      this.changed();
      setTimeout(() => this.ta.focus(), 0);
    }
    name() { return this.node ? this.sim.shown(this.node) : 'Untitled'; }
    changed() { this.dirty = this.ta.value !== this.saved; this.tt.textContent = (this.dirty ? '*' : '') + this.name() + ' - Notepad'; this.setTitle(this.tt.textContent); }
    caret() { const v = this.ta.value.slice(0, this.ta.selectionStart).split('\n'); this.pos.textContent = 'Ln ' + v.length + ', Col ' + (v[v.length - 1].length + 1); }
    async save(as) {
      const sim = this.sim;
      if (!this.node || as || !isAttached(sim.fs, this.node)) {
        const r = await sim.dialog({ title: 'Save as', heading: 'Save in Documents', input: { label: 'File name:', value: this.node ? this.node.name : '*.txt' }, buttons: [{ label: 'Save', value: 'save', primary: true }, { label: 'Cancel', value: 'cancel' }] });
        if (r.value !== 'save') return false;
        let nm = (r.input || '').trim();
        if (!nm || nm === '*.txt' || BAD_CHARS.test(nm)) { await sim.dialog({ title: 'Notepad', icon: 'warn', message: 'The file name is not valid.', buttons: [{ label: 'OK', primary: true }] }); return false; }
        if (!extOf(nm)) nm += '.txt';
        const dest = sim.fs.special.documents;
        const clash = dest.children.find(c => same(c.name, nm));
        if (clash) { const q = await sim.dialog({ title: 'Confirm Save As', icon: 'warn', message: nm + ' already exists.', sub: 'Do you want to replace it?', buttons: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no', primary: true }] }); if (q.value !== 'yes') return false; sim.detach(clash); }
        const n = { id: sim.uid(), name: nm, folder: false, text: '', size: 0, created: Date.now(), modified: Date.now() };
        sim.fs.nodes.set(n.id, n); sim.attach(n, dest);
        this.node = n;
      }
      this.node.text = this.ta.value; this.node.size = new Blob([this.ta.value]).size; this.node.modified = Date.now();
      this.saved = this.ta.value;
      sim.log('save', { path: sim.pathOf(this.node) });
      this.changed();
      sim.refresh();
      return true;
    }
    async requestClose() {
      if (this.dirty) {
        const r = await this.sim.dialog({ title: 'Notepad', message: 'Do you want to save changes to ' + this.name() + '?', buttons: [{ label: 'Save', value: 'save', primary: true }, { label: 'Don’t save', value: 'nosave' }, { label: 'Cancel', value: 'cancel' }] });
        if (r.value === 'cancel') return;
        if (r.value === 'save' && !(await this.save())) return;
      }
      this.close();
    }
  }
  class EditorWin extends Win {
    constructor(sim, node) {
      super(sim, { app: 'editor', cls: 'w11-app w11-editor', w: 640, h: 400, minW: 360, minH: 240 });
      const nm = node ? sim.shown(node) : 'Video Editor';
      this.tcontent.append(icoSpan(ICON.editor, 'w11-ticon'), h('span', { class: 'w11-ttext', text: node ? nm + ' - Video Editor' : 'Video Editor' }));
      this.setTitle(node ? nm + ' - Video Editor' : 'Video Editor');
      const msg = h('div', { class: 'w11-ed-msg', hidden: true }, h('strong', { text: node ? 'Project opened: ' + node.name : 'Video Editor' }),
        h('p', { text: 'This practice desktop does not include your editing software. In class, double-clicking a project file opens it in the video editor.' }),
        node && node.parent ? h('p', { class: 'sub', text: 'Saved in ' + sim.winPath(node.parent) }) : null);
      const close = h('button', { type: 'button', class: 'w11-btn primary', text: 'Close' });
      close.onclick = () => this.requestClose();
      msg.append(close);
      const splash = h('div', { class: 'w11-ed-splash' }, icoSpan(ICON.editor, 'big'), h('span', { text: node ? 'Opening ' + node.name + '…' : 'Starting…' }), h('div', { class: 'w11-ed-load' }, h('span')));
      this.body.append(splash, msg);
      setTimeout(() => { splash.remove(); msg.hidden = false; }, 1100);
    }
  }
  class SettingsWin extends Win {
    constructor(sim, what) {
      super(sim, { app: 'settings', cls: 'w11-app w11-settings', w: 680, h: 440, minW: 360, minH: 240 });
      this.tcontent.append(icoSpan(ICON.settings, 'w11-ticon'), h('span', { class: 'w11-ttext', text: 'Settings' }));
      const cats = ['System', 'Bluetooth & devices', 'Network & internet', 'Personalization', 'Apps', 'Accounts', 'Time & language', 'Accessibility', 'Windows Update'];
      this.body.append(h('div', { class: 'w11-set' },
        h('nav', {}, h('div', { class: 'w11-set-user' }, icoSpan(ICON.user), h('span', {}, h('b', { text: sim.fs.user }), h('small', { text: 'Local account' }))), cats.map(c => h('div', { class: 'w11-set-cat' + (what && what.startsWith(c.slice(0, 6)) ? ' on' : ''), text: c }))),
        h('section', {}, h('h2', { text: what || 'System' }), h('p', { text: 'Settings are turned off on this practice PC. Ask your teacher before changing settings on a school computer.' }))));
    }
  }
  class PropsWin extends Win {
    constructor(sim, node, rec) {
      const title = node ? sim.shown(node) + ' Properties' : 'Recycle Bin Properties';
      super(sim, { app: 'props', cls: 'w11-app w11-props', w: 400, h: 540, fixed: true, dialog: true, title });
      this.node = node; this.rec = rec;
      this.tcontent.append(icoSpan(node ? sim.iconMarkup(node) : ICON.bin(sim.recycle.length > 0), 'w11-ticon'), h('span', { class: 'w11-ttext', text: title }));
      this.setTitle(title);
      const tabs = node && !node.folder && !node.drive && !rec ? ['General', 'Details', 'Security', 'Previous Versions'] : node && (node.drive || node.folder) && !rec ? ['General', 'Sharing', 'Security', 'Previous Versions'] : ['General'];
      this.tabBar = h('div', { class: 'w11-ptabs', role: 'tablist' });
      this.page = h('div', { class: 'w11-ppage' });
      const ok = h('button', { type: 'button', class: 'w11-btn primary', text: 'OK' }), cancel = h('button', { type: 'button', class: 'w11-btn', text: 'Cancel' });
      this.applyBtn = h('button', { type: 'button', class: 'w11-btn', text: 'Apply', disabled: true });
      ok.onclick = async () => { if (await this.apply()) this.close(); };
      cancel.onclick = () => this.close();
      this.applyBtn.onclick = () => this.apply();
      this.body.append(this.tabBar, this.page, h('div', { class: 'w11-pfoot' }, ok, cancel, this.applyBtn));
      tabs.forEach((t, i) => { const b = h('button', { type: 'button', class: 'w11-ptab', role: 'tab', text: t }); b.onclick = () => this.show(t); this.tabBar.append(b); if (!i) this.first = t; });
      this.show(this.first);
    }
    place() { super.place(); this.x = clamp(this.x + 120, 0, Math.max(0, this.sim.size().w - this.w)); this.apply(); }
    show(tab) {
      const sim = this.sim, n = this.node;
      this.tabBar.querySelectorAll('.w11-ptab').forEach(b => b.classList.toggle('on', b.textContent === tab));
      sim.log('properties-tab', { detail: tab, path: n ? sim.pathOf(n) : 'Recycle Bin' });
      const row = (k, v) => h('div', { class: 'w11-prow' }, h('span', { class: 'k', text: k }), h('span', { class: 'v', text: v }));
      const hr = () => h('hr');
      if (tab !== 'General' && tab !== 'Details') { fill(this.page, h('p', { class: 'w11-pnote', text: tab + ' settings are not available on this practice PC.' })); return; }
      if (tab === 'Details') {
        const m = sim.mediaMeta(n), kind = kindOf(n);
        const group = (title, list) => { const items = list.filter(([, v]) => v != null && v !== ''); return items.length ? [h('div', { class: 'w11-pgroup', text: title }), items.map(([k, v]) => row(k, v))] : null; };
        const kbps = m.duration && n.size ? Math.round(n.size * 8 / m.duration / 1000) : null;
        fill(this.page, h('div', { class: 'w11-pdetails' }, h('div', { class: 'w11-prow head' }, h('span', { class: 'k', text: 'Property' }), h('span', { class: 'v', text: 'Value' })),
          group('Description', [['Title', m.title || null]]),
          kind === 'video' || kind === 'audio' ? group('Media', [['Length', m.duration ? fmtDur(m.duration) : null]]) : null,
          kind === 'video' ? group('Video', [['Frame width', m.width], ['Frame height', m.height], ['Data rate', kbps ? kbps.toLocaleString('en-US') + 'kbps' : null], ['Total bitrate', kbps ? (kbps + 192).toLocaleString('en-US') + 'kbps' : null], ['Frame rate', m.fps ? Number(m.fps).toFixed(2) + ' frames/second' : null], ['Video compression', m.codec || null]]) : null,
          kind === 'image' ? group('Image', [['Dimensions', m.width && m.height ? m.width + ' x ' + m.height : null], ['Width', m.width ? m.width + ' pixels' : null], ['Height', m.height ? m.height + ' pixels' : null]]) : null,
          group('File', [['Name', n.name], ['Item type', typeName(n)], ['Folder path', n.parent ? sim.winPath(n.parent) : ''], ['Date created', fmtDate(n.created)], ['Date modified', fmtDate(n.modified)], ['Size', fmtBytes(n.size || 0)], ['Attributes', n.hidden ? 'H' : 'A']])));
        return;
      }
      if (!n) {
        const total = sim.recycle.reduce((s, r) => s + treeSize(r.node), 0);
        fill(this.page, h('div', { class: 'w11-phead' }, sim.iconEl(sim.sysBin, 32), h('strong', { text: 'Recycle Bin' })), hr(), row('Items:', String(sim.recycle.length)), row('Size:', fmtBytes(total)), hr(),
          h('p', { class: 'w11-pnote', text: 'Files deleted from your PC wait here until you empty the Recycle Bin. Files deleted from a USB drive or memory card are removed right away.' }));
        return;
      }
      if (n.drive) {
        const cap = n.drive.capacity, free = sim.freeSpace(n), used = cap - free;
        const pct = used / cap * 100;
        fill(this.page, h('div', { class: 'w11-phead' }, sim.iconEl(n, 32), h('input', { type: 'text', class: 'w11-pname', value: n.name, disabled: true, 'aria-label': 'Drive name' })), hr(),
          row('Type:', typeName(n)), row('File system:', ({ system: 'NTFS', usb: 'exFAT', sd: 'exFAT', network: 'NTFS', cloud: 'Cloud' })[n.drive.kind]), hr(),
          h('div', { class: 'w11-prow sw' }, h('span', { class: 'sw used' }), h('span', { class: 'k', text: 'Used space:' }), h('span', { class: 'v', text: used.toLocaleString('en-US') + ' bytes   ' + fmtGB(used) })),
          h('div', { class: 'w11-prow sw' }, h('span', { class: 'sw free' }), h('span', { class: 'k', text: 'Free space:' }), h('span', { class: 'v', text: Math.round(free).toLocaleString('en-US') + ' bytes   ' + fmtGB(free) })), hr(),
          row('Capacity:', Math.round(cap).toLocaleString('en-US') + ' bytes   ' + fmtGB(cap)),
          h('div', { class: 'w11-ppie', style: 'background:conic-gradient(#2b6fd6 0 ' + pct + '%, #c8d6ea ' + pct + '% 100%)', role: 'img', 'aria-label': Math.round(pct) + '% used' }),
          h('p', { class: 'w11-pcenter', text: 'Drive ' + n.drive.letter + ':' }));
        return;
      }
      const full = n.folder || sim.showExt || !extOf(n.name);
      this.nameIn = h('input', { type: 'text', class: 'w11-pname', value: full ? n.name : baseOf(n.name), 'aria-label': 'Name', disabled: !!(this.rec || n.special || isProtected(n)) });
      this.nameIn.addEventListener('input', () => { this.applyBtn.disabled = false; });
      this.nameIn.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); this.apply().then(ok => ok && this.close()); } });
      this.hid = h('input', { type: 'checkbox', checked: !!n.hidden, disabled: !!this.rec });
      this.ro = h('input', { type: 'checkbox', checked: !!n.readOnly, disabled: !!this.rec });
      this.hid.onchange = this.ro.onchange = () => { this.applyBtn.disabled = false; };
      const size = n.folder ? treeSize(n) : n.size || 0;
      const onDisk = n.folder ? 0 : Math.ceil(size / 4096) * 4096;
      const counts = n.folder ? countTree(n) : null;
      const app = appFor(n);
      fill(this.page, h('div', { class: 'w11-phead' }, sim.iconEl(n, 32), this.nameIn), hr(),
        n.folder ? row('Type:', 'File folder') : row('Type of file:', typeName(n) + (extOf(n.name) ? ' (.' + extOf(n.name) + ')' : '')),
        !n.folder ? row('Opens with:', app ? APPS[app].name : 'Pick an app') : null, hr(),
        this.rec ? row('Origin:', this.rec.origin) : row('Location:', n.parent ? sim.winPath(n.parent) : ''),
        row('Size:', fmtBytes(size) + ' (' + size.toLocaleString('en-US') + ' bytes)'),
        row('Size on disk:', fmtBytes(n.folder ? Math.ceil(size / 4096) * 4096 : onDisk) + ' (' + (n.folder ? Math.ceil(size / 4096) * 4096 : onDisk).toLocaleString('en-US') + ' bytes)'),
        counts ? row('Contains:', counts.files + ' Files, ' + counts.folders + ' Folders') : null, hr(),
        row('Created:', fmtLong(n.created)), this.rec ? row('Deleted:', fmtLong(this.rec.at)) : row('Modified:', fmtLong(n.modified)), !n.folder && !this.rec ? row('Accessed:', fmtLong(n._openedAt || n.modified)) : null, hr(),
        h('div', { class: 'w11-prow attrs' }, h('span', { class: 'k', text: 'Attributes:' }), h('span', { class: 'v' }, h('label', {}, this.ro, ' Read-only'), h('label', {}, this.hid, ' Hidden'))));
    }
    async apply() {
      const sim = this.sim, n = this.node;
      if (!n || this.rec || n.drive) return true;
      if (this.nameIn && !this.nameIn.disabled) {
        const full = n.folder || sim.showExt || !extOf(n.name);
        const res = await sim.renameNode(n, this.nameIn.value, { fullName: full });
        if (res === 'retry') { this.nameIn.focus(); return false; }
        if (res === 'cancel') this.nameIn.value = full ? n.name : baseOf(n.name);
      }
      if (this.hid && !!n.hidden !== this.hid.checked) { n.hidden = this.hid.checked; sim.log('attribute', { detail: 'hidden', on: n.hidden, path: sim.pathOf(n) }); }
      if (this.ro && !!n.readOnly !== this.ro.checked) { n.readOnly = this.ro.checked; sim.log('attribute', { detail: 'read-only', on: n.readOnly, path: sim.pathOf(n) }); }
      this.applyBtn.disabled = true;
      const title = sim.shown(n) + ' Properties';
      this.tcontent.querySelector('.w11-ttext').textContent = title;
      this.setTitle(title);
      sim.refresh();
      return true;
    }
  }

  /* ------------------------------------------------------------------ the block */
  // Older lesson data used { fs: { drives: [{ id, label, children }] } }. "This PC" becomes the Desktop.
  function upgrade(b) {
    if (!b.fs || b.desktop || b.documents) return b;
    const out = Object.assign({}, b, { drives: [] });
    b.fs.drives.forEach(d => {
      if (d.id === 'pc' || d.label === 'This PC') out.desktop = d.children;
      else out.drives.push({ name: d.label, kind: /card/i.test(d.label) ? 'sd' : 'usb', children: d.children });
    });
    return out;
  }
  T.desktopSim = block => new Sim(upgrade(block)).wrap;
  T.blocks['desktop-sim'] = b => ({
    el: T.desktopSim(b), wide: true, interactive: true,
    printNote: 'Practice desktop. Open this topic on a computer to try the file tasks.'
  });

  /* Ordered sorter used by Part 1 lessons (kept from the earlier desktop file). */
  const groupedSorter = T.blocks.sorter;
  T.blocks.sorter = b => {
    if (b.mode !== 'order') return groupedSorter(b);
    let misses = 0;
    const feedback = el('p', { className: 'sort-result', 'aria-live': 'polite' });
    const list = el('ol', { className: 'sort-items' });
    const order = b.items.map((_, i) => i);
    function draw() {
      fill(list, ...order.map((item, pos) => {
        const entry = b.items[item];
        const text = typeof entry === 'string' ? entry : entry.text;
        const move = (dir, name, icon) => {
          const button = T.button(icon, () => {
            [order[pos], order[pos + dir]] = [order[pos + dir], order[pos]];
            feedback.textContent = '';
            draw();
            const row = list.children[pos + dir], buttons = row.querySelectorAll('button');
            (buttons[dir < 0 ? 0 : 1].disabled ? buttons[dir < 0 ? 1 : 0] : buttons[dir < 0 ? 0 : 1]).focus();
          }, 'small');
          button.setAttribute('aria-label', name + ': ' + text);
          button.disabled = pos + dir < 0 || pos + dir >= order.length;
          return button;
        };
        return el('li', { className: 'sort-card' }, el('span', { html: T.rich(text) }),
          el('div', { className: 'actions' }, move(-1, 'Move earlier', '↑'), move(1, 'Move later', '↓')));
      }));
    }
    const check = T.button('Check order', () => {
      const wrong = order.findIndex((item, i) => item !== b.correct[i]);
      if (wrong < 0) {
        T.feedback(feedback, '<strong>Correct order.</strong> ' + (b.success || b.closing || 'You put the steps in a workable sequence.'), true);
      } else {
        misses++;
        const clue = b.items[order[wrong]].clue || 'Look at what needs to happen before this step.';
        T.feedback(feedback, clue + (misses > 1 && b.hint ? ' ' + b.hint : ''), false);
      }
    }, 'primary small');
    draw();
    return { el: el('div', { className: 'card practice-card' }, el('p', { className: 'q', text: b.prompt || 'Put the cards in order.' }), list, check, feedback), wide: true, interactive: true };
  };
})();
