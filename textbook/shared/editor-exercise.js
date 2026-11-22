/* Textbook integration for the pinned offline Practice Editor (Foundation E2). */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const D = T.draw;
  const safe = text => String(text).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
  const label = (x, y, text, size = 12, ink = '#171b1f', weight = 700) =>
    '<text x="' + x + '" y="' + y + '" fill="' + ink + '" font-family="Inter, sans-serif" font-size="' + size + '" font-weight="' + weight + '">' + safe(text) + '</text>';
  D.editCards = (heading, cards) => {
    const width = 284 / cards.length;
    const boxes = cards.map(([name, ...lines], index) => {
      const x = 18 + index * width;
      const max = Math.floor((width - 20) / 5.4);
      const words = text => {
        const rows = [];
        for (const word of String(text).split(' ')) {
          if (rows.length && rows[rows.length - 1].length + word.length + 1 <= max) rows[rows.length - 1] += ' ' + word;
          else rows.push(word);
        }
        return rows;
      };
      const titleSize = Math.min(11, (width - 15) / (String(name).length * 0.56));
      return '<rect x="' + x + '" y="47" width="' + (width - 6) + '" height="107" rx="8" fill="#fff" stroke="#a9a6a0"/>' +
        '<rect x="' + (x + 9) + '" y="60" width="15" height="5" rx="2" fill="#3157c8"/>' +
        label(x + 9, 84, name, titleSize) + lines.flatMap(words).slice(0, 4).map((text, i) => label(x + 9, 104 + i * 14, text, 10, '#515961', 600)).join('');
    });
    return D.svg('<rect width="320" height="180" rx="8" fill="#f3f1ec"/>' + label(18, 30, heading, 14) + boxes.join(''));
  };
  D.editTimeline = ({ title, lanes, length, marks = [] }) => {
    const start = 44, trackW = 258;
    const px = seconds => start + trackW * seconds / length;
    const height = Math.min(42, 103 / lanes.length);
    const track = lanes.map(({ name, clips }, i) => {
      const y = 59 + height * i;
      return label(15, y + 16, name, 10) +
        '<rect x="' + start + '" y="' + y + '" width="' + trackW + '" height="' + (height - 4) + '" rx="3" fill="#d4d5d8"/>' +
        clips.map(([text, a, end, look]) => {
          const x = px(a), width = px(end) - x;
          const fill = look === 'gap' ? '#fff' : look === 'detail' ? '#a54f2b' : name.startsWith('A') ? '#275c47' : '#3157c8';
          return '<rect x="' + x + '" y="' + (y + 2) + '" width="' + (width - 1) + '" height="' + (height - 8) + '" rx="3" fill="' + fill + '"/>' +
            (width >= 28 ? label(x + 4, y + 15, text, width >= 58 ? 9 : 7, look === 'gap' ? '#171b1f' : '#fff') : '');
        }).join('');
    });
    return D.svg('<rect width="320" height="180" rx="8" fill="#f3f1ec"/>' + label(15, 27, title, 14) +
      label(start, 49, '0 s', 9) + label(278, 49, length + ' s', 9) + track.join('') +
      marks.map(([text, t]) => '<path d="M' + px(t) + ' 54 v108" stroke="#171b1f" stroke-width="1.5" stroke-dasharray="3 2"/>' +
        label(Math.min(px(t) + 3, 267), 170, text, 9)).join(''));
  };
  D.editorLayout = hiddenLabels => D.svg(
    '<rect width="320" height="180" rx="8" fill="#242833"/>' +
    '<rect x="12" y="14" width="102" height="72" rx="5" fill="#f3f1ec"/>' +
    '<rect x="123" y="14" width="185" height="72" rx="5" fill="#151922"/>' +
    '<rect x="178" y="24" width="74" height="42" fill="#cec9bd"/>' +
    '<path d="M178 66l21-22 18 12 15-14 20 24z" fill="#5d6469"/>' +
    '<rect x="12" y="97" width="296" height="69" rx="5" fill="#e7e3d8"/>' +
    '<path d="M41 125h251m-251 22h251" stroke="#a7a59e" stroke-width="14"/>' +
    '<path d="M48 125h56m3 0h65m5 0h43" stroke="#3157c8" stroke-width="12"/>' +
    '<path d="M149 110v53" stroke="#b86533" stroke-width="3"/>' +
    (hiddenLabels ? label(27, 51, 'A', 20) + label(208, 79, 'B', 12, '#fff') + label(22, 114, 'C', 12)
      : label(22, 35, 'Media Pool') + label(22, 56, 'Hall.mp4', 9) + label(22, 70, 'Library.mp4', 9) +
        label(191, 80, 'Viewer', 10, '#fff') + label(21, 115, 'Timeline', 10) + label(21, 129, 'V1', 9) + label(21, 151, 'A1', 9)));
  function mediaDefinition(id) {
    const record = T.mediaRecord(id);
    T.mediaUsed.add(id);
    if (!record || record.status === 'placeholder') return null;
    return {
      id,
      name: record.name || record.title || record.file.split('/').pop(),
      src: T.mediaURL(record),
      type: record.type === 'photo' ? 'image' : record.type,
      duration: record.duration,
      audio: record.audio,
      peaks: record.peaks,
      peakRate: record.peakRate
    };
  }

  // An accessible alternative to coordinates and dragging. The edits still go
  // through the same playhead, clips and undo history as the visual editor.
  function keyboardControls(editor, level) {
    const pool = el('select', { 'aria-label': 'Media Pool clip' }, editor.media.map(m => el('option', { value: m.id, text: m.name })));
    const track = el('select', { 'aria-label': 'Destination track' });
    const clips = el('select', { 'aria-label': 'Timeline clips', multiple: true, size: 3 });
    const seconds = el('input', { type: 'number', min: 0, max: 3600, step: 'any', value: 0, 'aria-label': 'Time in seconds' });
    const status = el('p', { className: 'hint-line', role: 'status' });
    const time = () => seconds.value === '' || !seconds.validity.valid ? NaN : Number(seconds.value);
    const chosen = () => Array.from(clips.selectedOptions, option => option.value);
    function select() {
      editor.clearSel();
      chosen().forEach(id => {
        const clip = editor.clipById(id);
        if (clip && !editor.sel.has(id)) editor.select(clip, true);
      });
      editor.renderTimeline();
      editor.renderInspector();
    }
    function watch(api) {
      const list = api.clips(), tracks = api.tracks();
      const selectedTrack = track.value;
      const signature = JSON.stringify(tracks.map(t => t.name));
      if (track.dataset.list !== signature) {
        track.replaceChildren(...tracks.map(t => el('option', { value: t.name, text: t.name })));
        if (tracks.some(t => t.name === selectedTrack)) track.value = selectedTrack;
        track.dataset.list = signature;
      }
      const next = JSON.stringify(list.map(c => [c.id, c.track, c.name, c.start, c.in, c.out]));
      if (clips.dataset.list !== next) {
        const ids = new Set(chosen());
        clips.replaceChildren(...list.map(c => el('option', {
          value: c.id,
          text: c.track + ' · ' + c.name + ' · ' + +c.start.toFixed(3) + ' s',
          selected: ids.has(c.id)
        })));
        clips.dataset.list = next;
      }
    }
    function seek() {
      if (!Number.isFinite(time())) return false;
      editor.stop();
      editor.setPlayhead(editor.fr(time()));
      return true;
    }
    function edit(op) {
      if (!pool.value) return;
      const videos = editor.vTracks();
      const selected = videos.findIndex(t => editor.trackLabel(t) === track.value);
      if (selected >= 0) editor.targetV = selected;
      editor.poolSel = pool.value;
      editor.renderPool();
      editor.editFromPool(op);
    }
    function operation(label, action) {
      return T.button(label, () => {
        status.textContent = action() === false ? 'Check the selected clip, time and track.' : '';
      }, 'small');
    }
    const group = children => el('div', { className: 'editor-form-row' }, children);
    clips.addEventListener('change', select);
    pool.addEventListener('change', () => { editor.poolSel = pool.value; editor.renderPool(); editor.runChecks(); });
    const panel = el('details', { className: 'editor-keyboard' },
      el('summary', { text: 'Edit with the keyboard' }),
      el('p', { text: 'Select a clip and enter a time in seconds. For trims, enter the time in the source clip. For moves, enter the time on the timeline.' }),
      group([el('label', {}, 'Time (seconds)', seconds), operation('Set playhead', seek), operation('Back one frame', () => editor.stepFrames(-1)), operation('Forward one frame', () => editor.stepFrames(1))]),
      group([el('label', {}, 'Media Pool', pool), el('label', {}, 'Destination', track),
        operation('Append', () => edit('append')),
        operation('Make track taller', () => {
          const lane = editor.tracks.find(t => editor.trackLabel(t) === track.value);
          if (!lane) return false;
          lane.h = Math.min(160, lane.h + 30);
          editor.changed();
        }),
        level > 1 ? operation('Insert', () => edit('insert')) : null,
        level > 1 ? operation('Overwrite', () => edit('overwrite')) : null]),
      group([el('label', {}, 'Timeline clips', clips),
        operation('Move clip', () => editor.moveClipTo(chosen()[0], track.value, time())),
        operation('Trim start', () => editor.trimClipTo(chosen()[0], 'l', time())),
        operation('Trim end', () => editor.trimClipTo(chosen()[0], 'r', time()))]),
      level > 1 ? group([
        operation('Split at playhead', () => { select(); editor.splitAtPlayhead(); }),
        operation('Delete selected', () => { if (!chosen().length) return false; select(); editor.deleteSelection(false); }),
        operation('Ripple delete selected', () => { if (!chosen().length) return false; select(); editor.deleteSelection(true); }),
        operation('Link selected audio and video', () => editor.setSelectionLink(chosen(), true)),
        operation('Unlink selected', () => editor.setSelectionLink(chosen(), false))
      ]) : null,
      level > 1 ? group([
        operation('Audio fade in', () => editor.setClipTransition(chosen()[0], 'in', 'afade0')),
        operation('Audio fade out', () => editor.setClipTransition(chosen()[0], 'out', 'afade0')),
        level === 3 ? operation('Fade from black', () => editor.setClipTransition(chosen()[0], 'in', 'dip')) : null,
        level === 3 ? operation('Fade to black', () => editor.setClipTransition(chosen()[0], 'out', 'dip')) : null
      ]) : null,
      status);
    watch(editor.api());
    return { panel, watch };
  }

  T.blocks['editor-exercise'] = b => {
    const level = b.level || 1;
    const records = b.media || [];
    const media = records.map(mediaDefinition).filter(Boolean);
    const missing = records.filter(id => !media.some(m => m.id === id));
    const wrapper = el('div', { className: 'editor-exercise' });
    const small = el('p', { className: 'editor-small card', hidden: true, text: 'Open this lesson on a computer to use the Practice Editor.' });
    const work = el('div', { className: 'editor-work', hidden: true });
    const mount = el('div');
    const hint = el('p', { className: 'hint-line', role: 'status' });
    const touchOnly = matchMedia('(max-width: 600px) and (pointer: coarse) and (any-hover: none)');
    let editor, keys, results = [], lastHint = -1;
    const steps = (b.task && b.task.steps) || [];
    const hintButton = T.button('Show me a hint', () => {
      const index = steps.findIndex((_, i) => !results[i]);
      lastHint = index;
      hint.textContent = index < 0 ? 'All steps are complete.' : (steps[index].hint || 'Read the first unfinished step.');
    }, 'small');
    const exportButton = b.download ? T.button('Download timeline', () => {
      const blob = new Blob([JSON.stringify(editor.getState(), null, 2)], { type: 'application/json' });
      const link = el('a', { href: URL.createObjectURL(blob), download: b.download });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      hint.textContent = 'Timeline downloaded.';
    }, 'primary small') : null;
    const controls = el('div', { className: 'editor-actions' }, steps.length ? hintButton : null, exportButton, hint);
    const standins = records.some(id => T.mediaRecord(id)?.status === 'standin');
    work.append(standins ? el('p', { className: 'caption', text: 'Stand-in media is loaded for this exercise.' }) : null);
    missing.forEach(id => work.append(T.mediaRecord(id) ? T.placeholderBox(T.mediaRecord(id), true) : el('p', { text: 'Missing editor media: ' + id })));
    work.append(mount, controls);
    wrapper.append(small, work);
    function syncEditor() {
      const needsDesktop = touchOnly.matches;
      small.hidden = !needsDesktop;
      work.hidden = needsDesktop;
      if (needsDesktop) {
        editor?.stop();
        return;
      }
      if (editor) return;
      if (!window.PracticeEditor) {
        mount.textContent = 'Practice Editor files are missing.';
        return;
      }
      const options = b.options || {};
      const opts = Object.assign({}, options, {
        level,
        height: b.height || 620,
        media,
        timeline: b.timeline || { video: 1, audio: 1 },
        task: b.task,
        allow: Object.assign({ import: false, addTracks: level > 1, library: level > 1 }, options.allow),
        onChange: api => { if (keys) keys.watch(api); },
        onTaskResults: value => {
          results = value;
          hintButton.disabled = results.every(Boolean);
          if (lastHint >= 0 && results[lastHint]) { hint.textContent = ''; lastHint = -1; }
        }
      });
      editor = window.PracticeEditor.mount(mount, opts);
      keys = keyboardControls(editor, level);
      work.append(keys.panel);
    }
    // The mount needs the page's real dimensions for its initial zoom.
    requestAnimationFrame(syncEditor);
    touchOnly.addEventListener('change', syncEditor);
    return { el: wrapper, wide: true, interactive: true, printNote: 'Open this lesson in the digital textbook to use the Practice Editor.' };
  };
})();
