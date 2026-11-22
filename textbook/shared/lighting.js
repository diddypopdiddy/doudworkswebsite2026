/* Shared artwork and activities for lighting, set design and sound. */
(function () {
  'use strict';
  const T = window.Textbook,
    D = T.draw,
    el = T.el;
  const H = (T.studio = {});
  const rect = (x, y, w, h, fill) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
  const circle = (x, y, r, fill) =>
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"/>';
  const line = (x, y, xx, yy, ink, width = 3) =>
    '<line x1="' +
    x +
    '" y1="' +
    y +
    '" x2="' +
    xx +
    '" y2="' +
    yy +
    '" stroke="' +
    ink +
    '" stroke-width="' +
    width +
    '" stroke-linecap="round"/>';
  const path = (d, fill, extra = '') => '<path d="' + d + '" fill="' + fill + '" ' + extra + '/>';
  const uid = () => T.uid();
  const pale = '#f3f1ec',
    muted = '#5d6469',
    cobalt = '#3157c8',
    orange = '#b86533',
    ink = '#171b1f';
  H.photo = (id, filter = '', alt = 'Interview photo study') => ({ id, filter, alt });
  H.art = (kind, value, alt) => {
    let body = rect(0, 0, 320, 180, pale);
    if (kind === 'face') {
      const o = typeof value === 'object' ? value : { look: value },
        look = o.look || 'front';
      const key = o.key ?? look !== 'back',
        fill = o.fill ?? (look === 'front' ? 1 : 0),
        back = o.back ?? look === 'back';
      const bg = o.bg || 'clean',
        tone = o.tone || 'neutral',
        id = uid(),
        blur = uid();
      const skin = key ? '#e9c6a5' : fill ? '#a39188' : '#443c3a';
      const dark = ['#514340', '#765e53', '#98806c', '#b69a80', '#d7b69a'][Math.round(fill * 4)];
      body = rect(0, 0, 320, 180, tone === 'warm' ? '#d3aa87' : tone === 'cool' ? '#91aabb' : '#acaea9');
      if (bg === 'pole') body += rect(154, 0, 9, 180, muted);
      if (bg === 'window') body += rect(202, 4, 114, 130, '#fff') + line(256, 4, 256, 135, '#c5c7c7', 3);
      if (bg === 'clutter')
        for (let i = 0; i < 9; i++)
          body += rect(
            10 + (i % 3) * 36,
            15 + Math.floor(i / 3) * 30,
            29,
            22,
            [orange, '#fff', cobalt][i % 3],
          );
      if (bg === 'wall')
        body += path(
          'M110 174Q115 130 153 124Q125 92 152 47Q210 18 219 76Q224 111 194 129Q239 128 250 174Z',
          '#777b78',
        );
      body +=
        '<defs><clipPath id="' +
        id +
        '"><ellipse cx="160" cy="87" rx="36" ry="46"/></clipPath><filter id="' +
        blur +
        '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' +
        (look === 'soft' ? 8 : 0.3) +
        '"/></filter></defs>';
      body +=
        path(
          'M82 180Q88 132 139 128L179 128Q231 129 237 180Z',
          key ? cobalt : '#293345',
          back ? 'stroke="#ffe2a3" stroke-width="4"' : '',
        ) + rect(149, 107, 23, 28, skin);
      body +=
        '<ellipse cx="160" cy="87" rx="36" ry="46" fill="' +
        skin +
        '" ' +
        (back ? 'stroke="#ffe2a3" stroke-width="5"' : '') +
        '/>';
      if (key && look !== 'front')
        body +=
          '<g clip-path="url(#' +
          id +
          ')"><g filter="url(#' +
          blur +
          ')">' +
          (look === 'under'
            ? rect(117, 38, 90, 44, dark)
            : look === 'top'
              ? rect(117, 89, 90, 45, dark)
              : path('M164 36Q156 72 171 93L153 100L162 137H206V36Z', dark)) +
          '</g></g>';
      body += path(
        'M124 84Q116 32 161 35Q203 36 196 82Q180 67 174 56Q152 75 124 84Z',
        key ? '#372d29' : '#282628',
      );
      if (key || fill)
        body +=
          circle(145, 87, 2.3, ink) +
          circle(175, 87, 2.3, ink) +
          path('M157 90l-3 11h7', 'none', 'stroke="#6b534b" stroke-width="2"') +
          line(150, 113, 169, 113, '#664d46', 2);
      if (o.product)
        body =
          body.slice(0, body.indexOf('<defs>')) +
          rect(55, 127, 210, 10, muted) +
          rect(119, 66, 78, 61, look === 'back' ? '#28303c' : '#ece5d2') +
          rect(128, 86, 60, 15, cobalt) +
          rect(125, 59, 66, 9, orange) +
          (look === 'soft'
            ? '<defs><linearGradient id="' +
              id +
              'shade"><stop offset="0%" stop-color="#fff" stop-opacity=".18"/><stop offset="100%" stop-color="#111" stop-opacity=".38"/></linearGradient></defs>' +
              rect(119, 66, 78, 61, 'url(#' + id + 'shade)')
            : '');
      if (o.badge) body += D.txt(10, 169, o.badge, { fill: '#fff' });
    } else if (kind === 'set') {
      const v = value,
        left = v !== 'center',
        x = left ? 88 : 160;
      if (v === 'lines' || v === 'book')
        for (const [a, b] of [
          [0, 27],
          [0, 166],
          [320, 22],
          [320, 173],
        ])
          body += line(a, b, 155, 102, '#a7aaa3', 2);
      body += rect(0, 137, 320, 43, '#dbd6ca');
      if (v === 'lines' || v === 'book' || v === 'busy') {
        body += rect(123, 81, 52, 35, v === 'busy' ? '#bbb8ad' : orange) + line(148, 82, 148, 114, pale, 2);
        if (v === 'busy') body += rect(216, 17, 90, 80, '#fbcd3c') + D.txt(230, 57, 'TODAY');
      } else {
        body += path('M' + (x - 32) + ' 143q4-46 32-45q29 0 32 45z', cobalt) + circle(x, 82, 19, '#b98260');
        if (v === 'balanced') body += rect(220, 95, 25, 40, orange);
        if (v === 'crowded') body += rect(28, 73, 29, 61, orange);
        if (v === 'center') body += rect(45, 96, 20, 40, muted) + rect(255, 96, 20, 40, muted);
      }
    } else if (kind === 'cutout') {
      const raise = value === 'reach';
      body =
        rect(0, 0, 320, 180, '#e1aa76') +
        circle(242, 58, 35, '#f2d39f') +
        path('M0 144Q70 116 137 143T320 128V180H0Z', '#6f5750') +
        circle(147, 63, 13, ink) +
        path('M136 78L157 73L165 124L122 123Z', ink) +
        line(136, 120, 124, 151, ink, 8) +
        line(154, 120, 172, 145, ink, 8) +
        line(153, 81, 174, raise ? 68 : 99, ink, 7) +
        line(174, raise ? 68 : 99, 192, raise ? 51 : 91, ink, 6);
    } else if (kind === 'diagram') {
      const rows = value;
      const pad = 26,
        step = 107 / Math.max(1, rows.length - 1);
      rows.forEach(([name, detail], i) => {
        let y = pad + step * i;
        body += circle(22, y, 8, i ? orange : cobalt) + D.txt(37, y + 4, name) + D.txt(153, y + 4, detail);
      });
    } else if (kind === 'plot') {
      body +=
        rect(138, 139, 44, 22, ink) +
        D.txt(136, 176, 'Camera') +
        circle(160, 79, 17, cobalt) +
        D.txt(137, 111, 'Subject');
      [
        ['key', 64, 117],
        ['fill', 248, 117],
        ['back', 211, 23],
      ].forEach(([id, x, y]) => {
        const on = value.includes(id);
        body +=
          line(x, y, 160, 79, on ? '#ae6a23' : '#cac9c2', on ? 4 : 1) +
          circle(x, y, 9, on ? orange : '#aaa') +
          D.txt(x - 13, y - 13, id);
      });
    } else if (kind === 'mic') {
      const which = value;
      body +=
        rect(53, 18, 218, 142, '#c8d1cb') +
        path('M108 159Q118 106 161 106Q205 105 214 159Z', cobalt) +
        circle(159, 77, 29, '#c99e7e');
      if (which === 'lav') body += circle(170, 115, 5, ink) + line(171, 119, 172, 146, ink, 2);
      else if (which === 'far') body += rect(14, 111, 19, 34, ink) + line(37, 121, 138, 85, orange, 1);
      else
        body +=
          line(26, 12, 129, which === 'in' ? 62 : 17, ink, 4) +
          line(128, which === 'in' ? 62 : 17, 147, which === 'in' ? 69 : 20, ink, 8);
      body += D.txt(61, 34, 'Camera frame');
    } else if (kind === 'wave') {
      const [title, peaks] = value;
      body += rect(14, 35, 292, 125, '#202630') + line(18, 98, 302, 98, '#718082', 1) + D.txt(14, 24, title);
      const n = peaks.length;
      for (let i = 0; i < n; i++) {
        let xx = 18 + (i * 284) / n,
          h = Math.max(0.7, Math.abs(peaks[i]) * 54);
        body += line(xx, 98 - h, xx, 98 + h, '#8cdec3', Math.max(1, 260 / n));
      }
    }
    return { svg: D.svg(body), alt: alt || String(kind) + ' illustration' };
  };
  H.ref = (value) => (typeof value === 'string' ? H.art('face', value, value + ' lighting diagram') : value);
  H.fig = (ref, caption) => ({ type: 'figure', ...mediaShape(ref), caption });
  function mediaShape(ref) {
    return ref.svg ? ref : { media: ref };
  }
  H.row = (...pairs) => ({
    type: 'figure-row',
    items: pairs.map(([ref, caption]) => ({ ...mediaShape(ref), caption })),
  });
  H.section = (title, intro, ...blocks) => ({ title, intro, blocks });
  H.text = (html) => ({ type: 'text', html: '<p>' + html + '</p>' });
  H.steps = (...items) => ({ type: 'steps', items });
  H.q = (ref, q, correct, wrong, clue, explain, extra) => ({
    ...(ref && mediaShape(ref)),
    q,
    options: [{ text: correct }, { text: wrong, clue }, ...(extra ? [{ text: extra, clue }] : [])],
    answer: 0,
    explain,
  });
  H.round = (prompt, choices, answer, clue, explain) => ({
    prompt,
    options: choices.map((ref, i) => ({
      ...mediaShape(ref),
      label: 'Frame ' + String.fromCharCode(65 + i),
      clue,
    })),
    answer,
    explain,
  });
  H.exercise = (...rounds) => ({ type: 'picture-choice', rounds, label: 'Director’s brief' });
  H.slider = (label, stops) => ({
    type: 'slider-demo',
    label,
    stops: stops.map(([ref, title, note]) => ({ ...ref, label: title, note })),
  });
  H.pair = (a, b) => ({
    pair: [
      { ...a, caption: 'A' },
      { ...b, caption: 'B' },
    ],
  });
  H.compare = (a, b, labels, captions) => ({ type: 'compare', items: [a, b], labels, captions });
  const show = (r) => (r.svg ? T.svg(r.svg, 'illus', r.alt) : T.media(r.media || r));
  T.blocks.compare = (b) => {
    const stage = el('div', { className: 'compare-stage' }),
      cap = el('p', { className: 'caption', 'aria-live': 'polite' });
    const refs = b.items || [b.a, b.b],
      buttons = (b.labels || ['A', 'B']).map((s, i) => T.button(s, () => draw(i), 'small'));
    function draw(i) {
      stage.replaceChildren(show(refs[i]));
      cap.textContent = b.captions?.[i] || '';
      buttons.forEach((bt, j) => bt.setAttribute('aria-pressed', String(i === j)));
    }
    draw(0);
    return {
      el: el('div', { className: 'compare' }, stage, el('div', { className: 'actions' }, buttons), cap),
      wide: true,
      interactive: true,
    };
  };
  T.blocks['light-plot'] = (b) => {
    const lamps = ['key', 'fill', 'back'];
    const on = new Set(['key']),
      plot = el('div'),
      face = el('div'),
      note = el('p', { 'aria-live': 'polite' });
    const switches = lamps.map((k) =>
      T.button(
        k + ' light',
        () => {
          if (on.has(k)) on.delete(k);
          else on.add(k);
          draw();
        },
        'small',
      ),
    );
    function draw() {
      const keys = lamps.filter((lamp) => on.has(lamp));
      plot.replaceChildren(show(H.art('plot', keys, 'Top-down placement of key, fill and back lights')));
      face.replaceChildren(T.media(b.photos[keys.join('-') || 'off']));
      switches.forEach((x, i) => x.setAttribute('aria-pressed', String(on.has(lamps[i]))));
      note.textContent =
        (on.has('key') ? 'The key shapes the cheek. ' : 'The cheek receives no key light. ') +
        (on.has('fill') ? 'Fill lifts the dark side. ' : 'The shadow side stays dark. ') +
        (on.has('back') ? 'A bright rim traces the hair.' : 'There is no rim on the hair.');
    }
    draw();
    return {
      el: T.stage(el('div', {}, plot, el('div', { className: 'actions' }, switches)), [face, note]),
      wide: true,
      interactive: true,
    };
  };
  T.blocks['frame-builder'] = (b) => {
    const colorFilters = {
      warm: 'sepia(.43) saturate(1.2)',
      cool: 'sepia(.5) hue-rotate(155deg) saturate(1.25)',
      neutral: '',
    };
    const options = {
      look: ['soft', 'back', 'front'],
      tone: ['warm', 'cool', 'neutral'],
      bg: ['clean', 'clutter', 'wall'],
    };
    let round = 0,
      first = 0;
    const host = el('div');
    function draw() {
      const brief = b.briefs[round],
        picks = { look: 'front', tone: 'neutral', bg: 'clutter' },
        preview = el('div'),
        feedback = el('div', { 'aria-live': 'polite' }),
        controls = el('div', { className: 'frame-controls' });
      let missed = false;
      function update() {
        const prefix = brief.mediaPrefix || b.mediaPrefix;
        const id = [prefix, picks.look, picks.bg].join('-');
        preview.replaceChildren(
          T.media({
            id,
            filter: colorFilters[picks.tone],
            alt: T.mediaRecord(id).alt + ' The image has a ' + picks.tone + ' color tone.',
          }),
        );
      }
      Object.entries(options).forEach(([key, values], i) => {
        const sel = el(
          'select',
          { 'aria-label': ['Light', 'Color', 'Background'][i] },
          values.map((v) => el('option', { value: v, text: v })),
        );
        sel.value = picks[key];
        sel.onchange = () => {
          picks[key] = sel.value;
          update();
        };
        controls.append(el('label', {}, ['Light', 'Color', 'Background'][i], sel));
      });
      const check = T.button(
        'Check frame',
        () => {
          const wrong = Object.keys(brief.want).find((k) => brief.want[k] !== picks[k]);
          if (wrong) {
            missed = true;
            T.feedback(feedback, brief.clues[wrong], false);
            return;
          }
          if (!missed) first++;
          T.feedback(feedback, brief.explain, true);
          controls.querySelectorAll('select').forEach((s) => (s.disabled = true));
          check.disabled = true;
          next.hidden = false;
        },
        'primary',
      );
      const next = T.button(
        round + 1 === b.briefs.length ? 'Finish' : 'Next brief',
        () => {
          if (++round === b.briefs.length)
            host.replaceChildren(
              T.card(
                'Frame builder complete',
                first + ' of ' + b.briefs.length + ' solved on the first try.',
              ),
            );
          else draw();
        },
        'small',
      );
      next.hidden = true;
      update();
      host.replaceChildren(
        el('p', { className: 'q', text: brief.brief }),
        T.stage(preview, [controls, el('div', { className: 'actions' }, check, next), feedback]),
      );
    }
    draw();
    return { el: host, wide: true, interactive: true };
  };
  // Add optional teaching overlays to the existing keyboard-accessible hotspots.
  const hotspots = T.blocks.hotspots;
  T.blocks.hotspots = (b) => {
    const result = hotspots(b);
    if (!b.overlay) return result;
    const pic = result.el.querySelector('.hot-pic'),
      overlay = show(b.overlay);
    overlay.classList.add('study-overlay');
    overlay.style.display = 'none';
    pic.append(overlay);
    const bt = T.button(
      b.overlayLabel || 'Show guides',
      () => {
        const visible = overlay.style.display === 'none';
        overlay.style.display = visible ? '' : 'none';
        bt.setAttribute('aria-pressed', String(visible));
      },
      'small',
    );
    bt.setAttribute('aria-pressed', 'false');
    pic.after(bt);
    return result;
  };
  H.guides = (paths, alt) => ({
    svg: D.svg(paths.map(([x, y, xx, yy]) => line(x, y, xx, yy, orange, 3)).join('')),
    alt,
  });
  H.weights = (xs) => ({
    svg: D.svg(
      xs
        .map(
          ([x, y, r]) =>
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="none" stroke="#b86533" stroke-width="3" stroke-dasharray="5 3"/>',
        )
        .join(''),
    ),
    alt: 'Dashed circles mark areas of visual weight',
  });
})();
(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  H.lesson = (c) => {
    const found = T.findTopic(c.slug),
      terms = window.TEXTBOOK_GLOSSARY.filter((g) => g.introducedIn === c.slug).map((g) => g.id);
    T.topic({
      minutes: 12,
      ...c,
      bigIdea: found.topic.bigIdea,
      vocab: terms,
      notes: { sketch: c.sketch, frames: 2, frameLabels: c.frameLabels, think: c.think || c.hook.question },
      realCameraTitle: c.realCameraTitle || 'Try it with a real camera',
    });
  };
  H.quiz = (...items) => ({ type: 'quiz', items });
  H.watch = (media, label, at, prompt) => ({
    type: 'video-segments',
    media,
    label,
    segments: [{ label: 'Full example', from: 0, to: 4 }],
    pauses: [{ at, prompt }],
    caption: 'Stand-in demonstration. Compare the evidence before and after the pause.',
  });
})();
(function () {
  const H = window.Textbook.studio;
  H.study = (c) => {
    const refs = c.frames;
    const choose = (i) => (typeof i === 'number' ? refs[i] : i);
    const pairs = refs.map((ref, i) => [ref, c.captions[i]]);
    const practice = c.rounds?.length
      ? H.exercise(
          ...c.rounds.map(([brief, choices, answer, clue, why]) =>
            H.round('“' + brief + '”', choices.map(choose), answer, clue, why),
          ),
        )
      : null;
    const checks = c.questions.map(([frame, q, right, wrong, clue, why, extra]) =>
      H.q(frame == null ? null : choose(frame), q, right, wrong, clue, why, extra),
    );
    const sections = [
      H.section(
        c.teachTitle,
        c.intro,
        H.text(c.teach),
        c.teachVisual || H.row(...pairs.slice(0, 3)),
        ...(c.afterTeach || []),
      ),
      ...(c.activities || []),
    ];
    const judged = [...(c.beforePractice || []), ...(practice ? [practice] : []), ...(c.practice || [])];
    if (judged.length)
      sections.push(
        H.section(c.practiceTitle || 'Apply the evidence', c.practiceIntro || c.objectives[0], ...judged),
      );
    H.lesson({
      ...c,
      sections,
      check: checks,
      hook: {
        ...(c.hookMedia || H.pair(refs[0], refs[1])),
        question: c.hook[0],
        options: c.hook[1],
        answer: c.hook[2],
        reveal: c.hook[3],
      },
      notes: undefined,
    });
  };
})();
(function () {
  const T = window.Textbook,
    H = T.studio,
    el = T.el,
    base = T.blocks['slider-demo'];
  T.blocks['slider-demo'] = (b) => {
    const out = base(b);
    if (!b.zebras) return out;
    const stage = out.el.querySelector('.demo-stage'),
      slider = out.el.querySelector('input[type=range]');
    const label = el('label', { className: 'zebra-toggle' }),
      toggle = el('input', { type: 'checkbox', 'aria-label': 'Show zebra warning' });
    const mask = el('img', {
      className: 'zebra-mask',
      alt: 'Stripes mark the brightest areas of this simulated exposure.',
    });
    let index = Number(slider.value);
    function draw() {
      index = Number(slider.value);
      const r = T.mediaRecord(b.zebras[index]);
      if (r) {
        mask.src = T.mediaURL(r);
        T.mediaUsed.add(b.zebras[index]);
      }
      mask.hidden = !toggle.checked;
      stage.append(mask);
    }
    toggle.oninput = draw;
    slider.addEventListener('input', draw);
    label.append(toggle, ' Show zebra warning');
    out.el.querySelector('.slider-row').after(label);
    draw();
    return out;
  };
  H.kelvinScale = () =>
    H.art(
      'diagram',
      [
        ['Warm lamp', 'About 2800 K'],
        ['Daylight', 'About 5500 K'],
        ['Blue shade', 'About 7500 K'],
      ],
      'Approximate color temperature of three light sources',
    );
  H.cinema = () => ({
    svg: T.draw.svg(
      '<rect width="320" height="180" fill="#413d3a"/><rect x="87" y="11" width="206" height="98" fill="#f3f1ec"/><circle cx="176" cy="42" r="12" fill="#34302c"/><path d="M160 94l8-43h18l17 43zm22-40 15-20 6 4-14 24" fill="#34302c"/><path d="M17 98h43l25 19v15H30v-11H17z" fill="#161819"/><path d="M20 98h38" stroke="white" stroke-width="4"/><circle cx="19" cy="78" r="9" fill="#e9c6a5"/><path d="M14 87l-6 23 12 7 12 19 7-3-13-25 1-13 11 2 2-5-16-6z" fill="#3157c8"/>' +
        [92, 131, 170, 209, 248, 287]
          .map(
            (x) =>
              '<circle cx="' +
              x +
              '" cy="136" r="12" fill="#171b1f"/><path d="M' +
              (x - 16) +
              ' 175q0-32 16-31 16 0 16 31" fill="#171b1f"/>',
          )
          .join(''),
    ),
    alt: 'Illustrated screening. A pianist sits beside the screen while an audience watches a figure gesture.',
  });
})();
(function () {
  const T = window.Textbook,
    H = T.studio,
    el = T.el;
  const base = T.blocks.compare;
  T.blocks.compare = (b) => {
    if (b.mode !== 'divider') return base(b);
    const show = (r) => (r.svg ? T.svg(r.svg, 'illus', r.alt) : T.media(r.media || r));
    const left = show(b.items[0]),
      right = show(b.items[1]),
      line = el('span', { className: 'study-divider-line' }),
      out = el('output'),
      slider = el('input', {
        type: 'range',
        min: 0,
        max: 100,
        value: 50,
        'aria-label': 'Compare shadow edges',
      });
    right.classList.add('study-divider-layer');
    function update() {
      right.style.clipPath = 'inset(0 0 0 ' + slider.value + '%)';
      line.style.left = slider.value + '%';
      out.textContent =
        b.labels[0] + ' ' + slider.value + '% · ' + b.labels[1] + ' ' + (100 - slider.value) + '%';
    }
    slider.oninput = update;
    update();
    return {
      el: el(
        'div',
        {},
        el('div', { className: 'study-divider' }, left, right, line),
        el('label', { className: 'slider-row' }, 'Drag across the face', slider, out),
      ),
      wide: true,
      interactive: true,
    };
  };
  H.sourceStudy = (name, shape) => {
    const D = T.draw;
    const sources = {
      bulb: '<circle cx="75" cy="73" r="12" fill="#efbf65"/><path d="M68 85h14v9H68z" fill="#5d6469"/>',
      sheet:
        '<circle cx="43" cy="74" r="8" fill="#efbf65"/><rect x="75" y="36" width="12" height="86" fill="#fff" stroke="#777"/>',
      window:
        '<rect x="32" y="26" width="85" height="101" fill="#f8fbf4" stroke="#777"/><path d="M74 27v100m-42-50h85" stroke="#777"/>',
    };
    const lines = (
      shape === 'bulb'
        ? [
            [83, 73],
            [83, 73],
          ]
        : [
            [91, 42],
            [91, 110],
          ]
    )
      .map(
        ([x, y], i) =>
          '<path d="M' +
          x +
          ' ' +
          y +
          ' L211 ' +
          (i ? 103 : 71) +
          '" stroke="#b86533" stroke-width="2" fill="none"/>',
      )
      .join('');
    return {
      svg: D.svg(
        '<rect width="320" height="180" fill="#f3f1ec"/>' +
          lines +
          sources[shape] +
          '<ellipse cx="230" cy="82" rx="26" ry="33" fill="#e9c6a5"/><path d="M196 137q1-28 35-28 32 0 36 28z" fill="#3157c8"/>' +
          D.txt(16, 162, name),
      ),
      alt: name + ' illuminating the subject',
    };
  };
})();
(function () {
  const T = window.Textbook,
    H = T.studio,
    D = T.draw;
  H.directionMap = (direction) => {
    const positions = {
      front: [90, 72, 'in front of'],
      side: [46, 43, 'beside'],
      top: [90, 16, 'above'],
      under: [90, 72, 'under'],
      back: [90, 16, 'behind'],
    };
    const [x, y, placement] = positions[direction];
    const view = direction === 'top' || direction === 'under' ? 'Side view' : 'Overhead';
    return D.svg(
      '<title>' + view + '. The lamp sits ' + placement + ' the subject.</title>' +
        '<rect width="180" height="105" fill="#f7f5f0"/>' +
        '<path d="M' + x + ' ' + y + 'L90 43" stroke="#b86533" stroke-width="2"/>' +
        '<circle cx="90" cy="43" r="8" fill="#3157c8"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#b86533"/>' +
        D.txt(8, 96, view) +
        D.txt(118, 46, 'Subject') +
        D.txt(x + 9, y + 3, 'Lamp'),
      '0 0 180 105',
    );
  };
  H.pickup = (name) => {
    const capsule =
      '<circle cx="160" cy="102" r="6" fill="#171b1f"/><rect x="157" y="105" width="6" height="17" fill="#171b1f"/>';
    const area =
      name === 'Omnidirectional lav'
        ? '<circle cx="160" cy="99" r="54" fill="#bfd4c8"/>'
        : '<path d="M160 109Q103 58 155 17Q169 9 181 35Q194 73 162 108Q168 129 159 132Q150 128 160 109z" fill="#bfd4c8"/>';
    return {
      svg: D.svg('<rect width="320" height="180" fill="#f3f1ec"/>' + area + capsule + D.txt(18, 165, name)),
      alt: name + ' pickup-pattern illustration. The shaded area represents favored directions.',
    };
  };
})();
