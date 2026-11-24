/* Camera practice: photo-backed controls, accessible kit and camera-specific menus.
   No real camera, microphone, persistent storage or external requests are used. */
(function () {
  'use strict';
  const T = window.Textbook,
    el = T.el;
  const names = {
    g97: 'LUMIX G97',
    fz300: 'LUMIX FZ300',
    elph180: 'PowerShot ELPH 180',
    hcx1600: 'HC-X1600',
    phone: 'Phone',
  };
  const views = {
    rear: 'Back',
    left: 'Left side',
    right: 'Right side',
    bottom: 'Bottom',
    lcd: 'LCD side',
    grip: 'Grip side',
    top: 'Top',
  };
  const kitNames = {
    battery: 'Charged battery',
    card: 'Empty SD card',
    cloth: 'Lens cloth',
    headphones: 'Headphones',
    'mic-wireless': 'Wireless lav kit',
    'mic-shotgun': 'Shotgun microphone',
    'white-card': 'White card',
    slate: 'Slate',
  };
  const kitTargets = {
    battery: ['battery-bay'],
    card: ['card-slot'],
    cloth: ['cap', 'lens-cover', 'lens'],
    headphones: ['headphone-socket'],
    'mic-wireless': ['mic-socket'],
    'mic-shotgun': ['mic-socket'],
    'white-card': ['lens', 'cap', 'lens-cover'],
    slate: ['lens', 'cap', 'lens-cover'],
  };
  const remain = (sec) => {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + 'm' + String(sec % 60).padStart(2, '0') + 's';
  };
  const batteryMark = (v) => {
    const n = Math.max(0, Math.min(4, Math.ceil(v * 4)));
    return '[' + '▰'.repeat(n) + '▱'.repeat(4 - n) + ']';
  };
  const fmt = (sec) => {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  };
  const place = (node, box) => {
    if (box) {
      Object.assign(node.style, {
        left: box.x + '%',
        top: box.y + '%',
        width: box.w + '%',
        height: box.h + '%',
      });
      if (box.corners && box.corners.length === 4) {
        node.style.clipPath =
          'polygon(' +
          box.corners
            .map(([x, y]) => ((x - box.x) / box.w) * 100 + '% ' + ((y - box.y) / box.h) * 100 + '%')
            .join(',') +
          ')';
      } else node.style.clipPath = '';
    }
    return node;
  };
  const media = (id) => (window.TEXTBOOK_MEDIA || {})[id];
  function picture(id, cls, thumbnail) {
    const rec = media(id),
      img = el('img', { className: cls || '', alt: '', draggable: 'false' });
    if (rec) {
      T.mediaUsed.add(id);
      const small = rec.small || rec.src800;
      img.src = thumbnail && small ? T.mediaURL({ file: small }) : T.mediaURL(rec);
      if (!thumbnail && small) {
        const width = rec.w || 1600;
        img.srcset =
          T.mediaURL({ file: small }) +
          ' ' +
          Math.round(width / 2) +
          'w, ' +
          T.mediaURL(rec) +
          ' ' +
          width +
          'w';
      }
    }
    return img;
  }
  T.blocks['camera-sim'] = function (original) {
    const root = el('section', {
      className: 'cam-sim',
      tabindex: '0',
      'aria-label': original.title || 'Practice camera',
    });
    let b,
      bodyId,
      body,
      profile,
      engine,
      viewId,
      monitorPose,
      closer = false,
      labels = false,
      held = null,
      menuKind = '',
      menuOrigin = null,
      selectedDial = 'comp';
    let lastSoundLevel = '',
      frameId = 0,
      lastTime = 0,
      visible = true,
      running = false,
      audioKey = '',
      pendingDelete = false,
      whiteSetReady = false;
    let covers = {},
      monitors = [],
      layerNodes = [],
      taskNodes = [],
      done = [],
      hintShown = false;
    const audio = el('audio', { preload: 'none', loop: true }),
      bed = el('audio', { preload: 'none', loop: true });
    const header = el('div', { className: 'cam-heading' });
    const picker = el('div', { className: 'cam-picker', 'aria-label': 'Pick your camera' });
    const tabs = el('div', { className: 'cam-tabs', role: 'tablist', 'aria-label': 'Camera views' });
    const top = el('div', { className: 'cam-top' }),
      main = el('div', { className: 'cam-main' });
    const menu = el('div', { className: 'cam-menu', hidden: true });
    const camera = el('div', { className: 'cam-camera' }, tabs, top, main, menu);
    const taskList = el('ol', { className: 'cam-tasks' }),
      taskCount = el('p', { className: 'cam-task-count' });
    const doneNote = el('p', { className: 'cam-done', hidden: true });
    const kitList = el('div', { className: 'cam-kit-list' }),
      kitHelp = el('p', { className: 'cam-kit-help', text: 'Choose an item, then its socket or door.' });
    const kitAction = el('div', { className: 'cam-kit-action' });
    const taskHeading = el('h3', { text: 'Your task' });
    const aside = el(
      'aside',
      { className: 'cam-aside' },
      taskHeading,
      taskCount,
      taskList,
      doneNote,
      el('h3', { text: 'Kit bag' }),
      kitList,
      kitHelp,
      kitAction,
    );
    const status = el('p', {
      className: 'cam-status',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    const hint = el('p', { className: 'cam-hint', hidden: true });
    const footer = el('div', { className: 'cam-footer' });
    const button = (text, fn, attrs) =>
      el(
        'button',
        Object.assign({ type: 'button', className: 'cam-button', onclick: fn }, attrs || {}),
        text,
      );
    const closerButton = button(
      'Look closer',
      () => {
        closer = !closer;
        if (closer) viewId = body.defaultView || (bodyId === 'hcx1600' ? 'lcd' : 'rear');
        buildViews();
        closerButton.setAttribute('aria-pressed', closer);
      },
      { 'aria-pressed': 'false', 'data-cam-action': 'closer' },
    );
    const labelsButton = button(
      'Labels',
      () => {
        labels = !labels;
        root.classList.toggle('cam-labels', labels);
        labelsButton.setAttribute('aria-pressed', labels);
      },
      { 'aria-pressed': 'false', 'data-cam-action': 'labels' },
    );
    const returnButton = button(
      'Full camera',
      () => {
        closerButton.click();
        tabs.querySelector('[aria-selected="true"]')?.focus();
      },
      {
        className: 'cam-button cam-return',
        hidden: true,
        'data-cam-action': 'overview',
      },
    );
    tabs.after(returnButton);
    footer.append(
      button(
        'Hint',
        () => {
          hintShown = !hintShown;
          showHint();
        },
        { 'data-cam-action': 'hint' },
      ),
      button('Restart', () => choose(bodyId), { 'data-cam-action': 'restart' }),
      closerButton,
      labelsButton,
      button('Call action', () => act('callAction'), { 'data-cam-action': 'callAction' }),
    );
    footer.append(
      el(
        'details',
        { className: 'cam-keys' },
        el('summary', { text: 'Keys' }),
        el('p', {
          text: 'R record · P playback · F half-press to focus · M look closer · arrows navigate · [ and ] turn the selected dial.',
        }),
      ),
    );
    root.append(
      header,
      picker,
      el('div', { className: 'cam-workspace' }, camera, aside),
      footer,
      hint,
      status,
      audio,
      bed,
    );
    const api = {
      stop: () => {
        running = false;
        if (engine && engine.s.playback.playing) {
          engine.act('pause');
          engine.s.message = 'Playback paused.';
        }
        if (engine && engine.s.recording) engine.act('stop');
        cancelAnimationFrame(frameId);
        frameId = 0;
        audio.pause();
        bed.pause();
        audioKey = '';
        if (engine) update();
      },
    };
    T.players.add(api);
    root.cameraTransport = {
      get active() {
        return running;
      },
      get visible() {
        return visible;
      },
      get scheduled() {
        return !!frameId;
      },
    };
    function say(message) {
      if (message && status.textContent !== message) status.textContent = message;
    }
    function activate() {
      // Pointer/focus events can arrive between an observer's old and new layout entries.
      const rect = root.getBoundingClientRect();
      visible = !document.hidden && rect.bottom > 0 && rect.top < innerHeight && rect.width > 0;
      if (!running) {
        T.stopPlayers(api);
        running = true;
        lastTime = 0;
      }
      schedule();
    }
    function act(action, value) {
      activate();
      const succeeded = engine.act(action, value);
      if (
        succeeded &&
        (action === 'setting' ||
          ['headphones', 'mic', 'focusMode', 'zoom', 'focusDistance', 'nd'].includes(action))
      ) {
        const key = action === 'setting' ? value.key : action,
          v = engine.s.settings[key];
        const label =
          {
            headphones: 'Headphones',
            mic: 'Microphone',
            focusMode: 'Focus mode',
            zoom: 'Zoom',
            focusDistance: 'Focus distance',
            nd: 'ND filter',
            comp: 'Exposure compensation',
            gain: 'Sound recording level',
            videoGain: 'GAIN',
            fstop: 'F-stop',
            shutter: 'Shutter speed',
            wb: 'White balance',
            quality: 'Rec Quality',
            levelBars: 'Sound level bars',
            zebras: 'Zebra Pattern',
            grid: 'Guide Line',
            redFrame: 'Red REC Frame Indicator',
            headphoneVolume: 'Headphone volume',
          }[key] || key;
        const display =
          key === 'headphones'
            ? v
              ? 'connected; live monitoring on'
              : 'disconnected'
            : key === 'mic'
              ? { camera: 'built-in', wireless: 'wireless receiver', shotgun: 'shotgun' }[v]
              : typeof v === 'boolean'
                ? v
                  ? 'ON'
                  : 'OFF'
                : ['gain', 'videoGain'].includes(key)
                  ? v + ' dB'
                  : key === 'shutter'
                    ? '1/' + v
                    : key === 'nd'
                      ? { 0: 'CLR', 2: '1/4', 4: '1/16', 6: '1/64' }[v]
                      : v;
        engine.s.message = label + ': ' + display + '.';
      }
      root.dataset.camRecording = !!engine.s.recording;
      update();
      say(engine.s.message);
      schedule();
      return succeeded;
    }
    // Only the visible, active camera schedules animation frames.
    function schedule() {
      if (!frameId && running && visible && (engine.s.power || engine.s.playback.playing))
        frameId = requestAnimationFrame(tick);
    }
    function tick(now) {
      frameId = 0;
      if (!root.isConnected) {
        api.stop();
        return;
      }
      if (lastTime && now - lastTime < 32) {
        schedule();
        return;
      }
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.2) : 0;
      lastTime = now;
      engine.tick(dt);
      update();
      schedule();
    }
    function choose(id) {
      api.stop();
      bodyId = id;
      b = Object.assign({}, original, original.forBody && original.forBody[id], { body: id });
      body = (window.TEXTBOOK_CAMERA_BODIES || {})[id] || { name: names[id], views: {}, kit: {} };
      profile = T.cameraProfiles[id];
      engine = T.createCameraEngine(b, id);
      monitorPose =
        id === 'hcx1600'
          ? engine.s.display.open
            ? 'open'
            : 'closed'
          : engine.s.display.open
            ? 'closed-out'
            : 'closed-in';
      root.cameraEngine = engine;
      root.dataset.camBody = id;
      selectedDial = id === 'elph180' ? 'zoom' : 'comp';
      covers = {};
      viewId = body.defaultView || (id === 'hcx1600' ? 'lcd' : 'rear');
      closer = false;
      held = null;
      menuKind = '';
      pendingDelete = false;
      whiteSetReady = false;
      hintShown = false;
      closerButton.setAttribute('aria-pressed', 'false');
      closerButton.hidden = id === 'phone';
      labelsButton.hidden = id === 'phone';
      header.replaceChildren(
        el(
          'div',
          {},
          el('p', { className: 'cam-eyebrow', text: 'Practice camera' }),
          el('h3', { text: b.title || names[id] }),
        ),
        el('span', { className: 'cam-body-name', text: names[id] }),
      );
      if ((T.cameraScenes[b.scene || 'note-library'] || {}).standin)
        header.append(el('span', { className: 'cam-standin', text: 'Scene: drawn stand-in' }));
      if (b.intro) header.append(el('p', { className: 'cam-intro', text: b.intro }));
      picker
        .querySelectorAll('[data-cam-body]')
        .forEach((n) => n.setAttribute('aria-pressed', n.dataset.camBody === id));
      taskHeading.hidden = !(b.tasks || []).length;
      root.classList.toggle('cam-free', !(b.tasks || []).length);
      done = (b.tasks || []).map(() => false);
      taskNodes = (b.tasks || []).map((task, i) =>
        el(
          'li',
          { 'data-cam-task': i },
          el('span', { className: 'cam-check', 'aria-hidden': 'true', text: '○' }),
          el('span', { text: task.text }),
        ),
      );
      taskList.replaceChildren(...taskNodes);
      buildKit();
      buildViews();
      showHint();
      update();
      say(engine.s.message || 'Camera ready to operate.');
    }
    function showHint() {
      hint.hidden = !hintShown;
      const task = (b.tasks || []).find((_, i) => !done[i]);
      hint.textContent =
        (task && task.hint) ||
        b.hint ||
        'Check the power, picture and card. Make a short take and play it back.';
    }
    function availableViews() {
      return Object.keys(body.views).filter(
        (v) =>
          v !== 'top' &&
          v !== 'hero' &&
          (v !== 'bottom' ||
            (b.kit || []).some((x) => /battery|card/.test(typeof x === 'string' ? x : x.id)) ||
            (b.faults || []).some((x) => /battery|card/.test(typeof x === 'string' ? x : x.id))),
      );
    }
    // Rebuild controls only on body/view changes, never during a running frame.
    function buildViews() {
      monitors = [];
      layerNodes = [];
      top.replaceChildren();
      main.replaceChildren();
      menu.hidden = true;
      menuKind = '';
      root.classList.toggle('cam-closer', closer);
      returnButton.hidden = !closer;
      root.classList.toggle('cam-phone-body', bodyId === 'phone');
      if (bodyId === 'phone') {
        tabs.replaceChildren();
        buildPhone();
        update();
        return;
      }
      const list = availableViews();
      if (!list.includes(viewId)) viewId = list[0] || 'rear';
      tabs.replaceChildren(
        ...list.map((v) =>
          button(
            views[v] || v,
            () => {
              viewId = v;
              closer = false;
              closerButton.setAttribute('aria-pressed', 'false');
              buildViews();
              tabs.querySelector('[data-cam-view="' + v + '"]').focus();
            },
            { role: 'tab', 'aria-selected': String(v === viewId), 'data-cam-view': v },
          ),
        ),
      );
      if (body.views.top) {
        const stage = makeView('top');
        top.append(stage);
        const crop =
          bodyId === 'hcx1600'
            ? inferredCrop(body.views.top, true)
            : body.views.top.bodyCrop || inferredCrop(body.views.top, true);
        if (crop) {
          const viewport = cropView(stage, crop, body.views.top.aspect);
          // Rotate the camcorder's long measured top view and its hit regions
          // together, so its operating controls remain large and aligned.
          if (bodyId === 'hcx1600') {
            const ratio = (body.views.top.aspect * crop.w) / crop.h;
            const strip = el('div', { className: 'cam-rotated-top', style: 'aspect-ratio:' + 1 / ratio });
            viewport.replaceWith(strip);
            strip.append(viewport);
            Object.assign(viewport.style, {
              position: 'absolute',
              width: ratio * 100 + '%',
              transformOrigin: '0 0',
              transform: 'rotate(90deg) translateY(-100%)',
            });
          }
        }
      }
      if (body.views[viewId]) {
        const stage = makeView(viewId);
        main.append(stage);
        if (!closer && monitorPose !== 'open-side') {
          const crop = body.views[viewId].defaultCrop || inferredCrop(body.views[viewId], false);
          if (crop) cropView(stage, crop, body.views[viewId].aspect);
        }
      } else
        main.append(el('p', { text: 'Camera picture unavailable. Use the controls below.' }), makeFallback());
      if (closer && body.views[viewId] && body.views[viewId].lcd) {
        const data = body.views[viewId],
          lcd =
            Object.values(data.layers || {})
              .map((layer) => layer.stateLCD && layer.stateLCD[monitorPose])
              .find(Boolean) || data.lcd,
          relevant = Object.entries(data.controls || {})
            .filter(
              ([key, c]) =>
                c.x >= lcd.x &&
                (!(monitorPose === 'open-side' || bodyId === 'hcx1600') || c.x < lcd.x + lcd.w + 3) &&
                [
                  'menu',
                  'up',
                  'down',
                  'left',
                  'right',
                  'play',
                  'delete',
                  'disp',
                  'aelock',
                  'focus-mode',
                  'wb',
                  'iso',
                ].includes(key),
            )
            .map(([, c]) => c);
        const x = Math.max(0, lcd.x - 2),
          y = Math.max(0, Math.min(lcd.y, ...relevant.map((c) => c.y)) - 3),
          right = Math.min(100, Math.max(lcd.x + lcd.w, ...relevant.map((c) => c.x + c.w)) + 3),
          bottom = Math.min(100, Math.max(lcd.y + lcd.h, ...relevant.map((c) => c.y + c.h)) + 3);
        cropView(main.firstElementChild, { x, y, w: right - x, h: bottom - y }, data.aspect);
      }
      // Alternative close/reach actions belong to the view frame, not the
      // photographed model coordinates, which can be cropped or transformed.
      const accessActions = el('div', { className: 'cam-view-actions' });
      main
        .querySelectorAll('.cam-cover-actions,.cam-monitor-access')
        .forEach((node) => accessActions.append(node));
      main.prepend(accessActions);
      update();
    }
    function inferredCrop(data, isTop) {
      const controls = Object.values(data.controls || {});
      if (!controls.length) return null;
      const boxes = data.lcd ? controls.concat([data.lcd]) : controls;
      if (!isTop && !data.lcd) return null;
      const x = Math.max(0, Math.min(...boxes.map((c) => c.x)) - 5),
        y = Math.max(0, Math.min(...boxes.map((c) => c.y)) - 5),
        right = Math.min(100, Math.max(...boxes.map((c) => c.x + c.w)) + 5),
        bottom = Math.min(100, Math.max(...boxes.map((c) => c.y + c.h)) + 5);
      return { x, y, w: right - x, h: bottom - y };
    }
    function cropView(stage, crop, aspect) {
      const wrapper = el('div', {
        className: 'cam-crop',
        style: 'aspect-ratio:' + (aspect * crop.w) / crop.h,
      });
      stage.replaceWith(wrapper);
      wrapper.append(stage);
      Object.assign(stage.style, {
        position: 'absolute',
        width: 10000 / crop.w + '%',
        left: (-crop.x / crop.w) * 100 + '%',
        top: (-crop.y / crop.h) * 100 + '%',
      });
      stage.querySelectorAll('[data-cam-control]').forEach((n) => {
        const c = body.views[stage.dataset.camStage].controls[n.dataset.camControl];
        if (c && (c.x + c.w < crop.x || c.x > crop.x + crop.w || c.y + c.h < crop.y || c.y > crop.y + crop.h))
          n.hidden = true;
      });
      return wrapper;
    }
    function makeView(id) {
      const data = body.views[id],
        stage = el('div', {
          className: 'cam-view cam-view-' + id,
          'data-cam-stage': id,
          style: 'aspect-ratio:' + (data.aspect || 1.5),
        });
      const img = picture(data.media, 'cam-body-image');
      img.addEventListener('error', () => {
        stage.classList.add('cam-fallback');
        if (!stage.querySelector('.cam-missing'))
          stage.prepend(
            el('p', { className: 'cam-missing', text: 'Camera picture unavailable. Controls still work.' }),
          );
      });
      stage.append(img);
      if (!media(data.media)) {
        stage.classList.add('cam-fallback');
        stage.prepend(
          el('p', { className: 'cam-missing', text: 'Camera picture unavailable. Controls still work.' }),
        );
      }
      Object.entries(data.layers || {}).forEach(([key, desc]) => {
        const layer = place(el('img', { className: 'cam-state-layer', alt: '' }), desc.at);
        stage.append(layer);
        layerNodes.push({ node: layer, key, desc, stage, base: img, data });
      });
      if (data.lcd) stage.append(place(makeMonitor(false), data.lcd));
      else if (id !== 'top') {
        const mon = makeMonitor(true);
        mon.classList.add('cam-small-monitor');
        stage.append(mon);
      }
      const seen = new Set();
      Object.entries(data.controls || {})
        .sort(([a], [c]) => (['wb', 'iso'].includes(a) ? -1 : 0) - (['wb', 'iso'].includes(c) ? -1 : 0))
        .forEach(([key, info]) => {
          const boxKey = [info.x, info.y, info.w, info.h].join(',');
          if (!seen.has(boxKey)) {
            seen.add(boxKey);
            stage.append(makeControl(key, info, id));
          }
        });
      const coverActions = el('div', { className: 'cam-cover-actions' });
      ['mic-cover', 'terminal-cover', 'headphone-cover'].forEach((key) => {
        if (data.controls && data.controls[key]) {
          coverActions.append(
            button(key === 'mic-cover' ? 'Close MIC cover' : 'Close terminal cover', () => control(key), {
              hidden: true,
              'data-cam-close-cover': key,
            }),
          );
        }
      });
      ['card-door', 'battery-door'].forEach((key) => {
        if (!data.controls?.[key] || (key === 'battery-door' && profile.batteryAccess === 'clip')) return;
        const action = key === 'card-door' ? 'cardDoor' : 'batteryDoor';
        coverActions.append(
          button(
            key === 'card-door'
              ? 'Close card door'
              : profile.sharedCardBatteryDoor
                ? 'Close card / battery door'
                : 'Close battery door',
            () => {
              act(action, false);
              stage.querySelector('[data-cam-control="' + key + '"]')?.focus();
            },
            {
              hidden: true,
              'data-cam-close-door': key,
              'data-cam-action': key === 'card-door' ? 'closeCardDoor' : 'closeBatteryDoor',
            },
          ),
        );
      });
      stage.append(coverActions);
      if (Object.values(data.controls || {}).some((c) => c.requiresMonitorState === 'closed')) {
        stage.append(
          button(
            'Close monitor to reach lens controls',
            () => {
              closer = false;
              closerButton.setAttribute('aria-pressed', 'false');
              control('monitor');
            },
            {
              className: 'cam-button cam-monitor-access',
              'data-cam-action': 'revealLensControls',
            },
          ),
        );
      }
      return stage;
    }
    function makeFallback() {
      const box = el('div', { className: 'cam-fallback-controls' });
      const controls =
        bodyId === 'elph180'
          ? {
              power: 'ON/OFF',
              record: 'Movie button',
              shutter: 'Shutter button',
              play: 'Playback',
              menu: 'FUNC. SET',
              'battery-door': 'Card / battery door',
              'card-slot': 'SD card',
              'battery-bay': 'Battery',
            }
          : bodyId === 'hcx1600'
            ? {
                power: 'Power',
                record: 'REC',
                play: 'Playback',
                menu: 'MENU',
                'auto-manu': 'AUTO / MANU',
                iris: 'IRIS',
                gain: 'GAIN',
                shutter: 'SHUTTER',
                wb: 'WHITE BAL',
                nd: 'ND filter',
                'slot-select': 'SLOT SEL',
                'lens-cover': 'Lens cover',
                'card-door': 'Card door',
                'card-slot': 'SD card',
                'battery-door': 'Battery release',
                'battery-bay': 'Battery',
                'mic-socket': 'MIC',
                'headphone-socket': 'Headphones',
              }
            : {
                power: 'ON/OFF',
                record: 'Motion picture button',
                shutter: 'Shutter button',
                mode: 'Mode dial',
                play: 'Playback',
                menu: 'MENU/SET',
                disp: 'DISP.',
                lvf: 'LVF',
                cap: 'Lens cap',
                aelock: 'AF/AE LOCK',
                'focus-mode': 'Focus mode',
                'card-door': 'Card door',
                'card-slot': 'SD card',
                'battery-door': 'Battery door',
                'battery-bay': 'Battery',
                'mic-socket': 'MIC',
                ...(profile.headphones ? { 'headphone-socket': 'Headphones' } : {}),
              };
      Object.entries(controls).forEach(([key, label]) =>
        box.append(button(label, () => control(key), { 'data-cam-control': key })),
      );
      box.prepend(makeMonitor(false));
      return box;
    }
    function allowed(key) {
      if ((b.show || []).includes(key)) return true;
      if ((b.hide || []).includes(key)) return false;
      const level = b.level || (b.tasks && b.tasks.length ? 1 : 3);
      if (
        [
          'iso',
          'iris',
          'gain',
          'shutter-speed',
          'front-dial',
          'rear-dial',
          'focus',
          'white-balance',
          'wb',
          'nd',
        ].includes(key)
      )
        return level >= 3 || (key === 'gain' && level >= 2);
      if (['aelock', 'focus-mode', 'exposure'].includes(key)) return level >= 2;
      return true;
    }
    function makeControl(key, info, surface) {
      const label =
        bodyId === 'hcx1600' && key === 'record'
          ? 'REC'
          : bodyId === 'elph180'
            ? {
                record: 'Movie button',
                menu: 'MENU',
                set: 'FUNC. SET',
                up: 'AUTO',
                down: 'INFO.',
                delete: 'Delete',
              }[key] ||
              info.label ||
              key
            : info.label || key;
      const topZoomLever = key === 'zoom' && surface === 'top';
      // A top zoom lever surrounds the shutter. Its whole projected ring cannot
      // be an input hit area without swallowing the shutter's separate target.
      if (topZoomLever && bodyId !== 'hcx1600')
        info = { ...info, x: info.x - 4.5, y: info.y + info.h / 2 - 3, w: 6, h: 6 };
      if ((key === 'zoom' && !topZoomLever) || key === 'focus') {
        const max = key === 'focus' ? 10 : profile.zoom[1];
        const min = key === 'focus' ? 0.5 : profile.zoom[0];
        const input = el('input', {
          type: 'range',
          min,
          max,
          step: key === 'focus' || profile.zoom[0] < 2 ? 0.1 : 1,
          'aria-label': label,
          'data-cam-control': key,
          oninput: (e) =>
            allowed(key)
              ? act(key === 'focus' ? 'focusDistance' : 'zoom', +e.target.value)
              : say('Not used in this lesson.'),
        });
        const wrap = place(el('label', { className: 'cam-ring' }, el('span', { text: label }), input), info);
        return wrap;
      }
      const n = place(
        button('', () => control(key), {
          className: 'cam-control',
          'aria-label': label,
          title: label,
          'data-cam-control': key,
        }),
        info,
      );
      Object.assign(n.style, {
        left: info.x + info.w / 2 + '%',
        top: info.y + info.h / 2 + '%',
        transform: 'translate(-50%,-50%)',
      });
      n.append(el('span', { className: 'cam-control-label', text: label }));
      if (key === 'record') n.classList.add('cam-record-control');
      if (['mode', 'front-dial', 'rear-dial', 'control-dial', 'zoom'].includes(key))
        n.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();
            turnDial(e.deltaY > 0 ? 1 : -1, key);
          },
          { passive: false },
        );
      if (key === 'shutter' && bodyId !== 'hcx1600')
        n.addEventListener('pointerdown', () => {
          engine.act('halfPress');
          update();
        });
      n.addEventListener('dragover', (e) => {
        if (held && (kitTargets[held] || []).includes(key)) e.preventDefault();
      });
      n.addEventListener('drop', (e) => {
        e.preventDefault();
        applyKit(key);
      });
      return n;
    }
    function control(key) {
      if (held && (kitTargets[held] || []).includes(key)) {
        applyKit(key);
        return;
      }
      if (bodyId === 'fz300' && (engine.s.playback.open || !menu.hidden) && (key === 'iso' || key === 'wb')) {
        cursor(key === 'iso' ? 'up' : 'right');
        return;
      }
      if (!allowed(key)) {
        say('Not used in this lesson.');
        return;
      }
      if (key === 'zoom') {
        openSetting('zoom');
        return;
      }
      if (['mic-cover', 'terminal-cover', 'headphone-cover'].includes(key)) {
        covers[key] = !covers[key];
        engine.s.message =
          (key === 'mic-cover' ? 'MIC cover' : 'Terminal cover') + (covers[key] ? ' open.' : ' closed.');
        update();
        root
          .querySelector(
            covers[key] ? '[data-cam-close-cover="' + key + '"]' : '[data-cam-control="' + key + '"]',
          )
          ?.focus();
        return;
      }
      if (key === 'monitor') {
        monitorPose =
          bodyId === 'hcx1600'
            ? monitorPose === 'open'
              ? 'closed'
              : 'open'
            : monitorPose === 'closed-in'
              ? 'closed-out'
              : monitorPose === 'open-side'
                ? 'closed-in'
                : 'open-side';
        act('monitor', !['closed-in', 'closed'].includes(monitorPose));
        buildViews();
        main.querySelector('[data-cam-control=monitor]')?.focus();
        return;
      }
      const action = {
        play: 'playback',
        disp: 'display',
        aelock: 'lock',
        'card-door': 'cardDoor',
        'battery-door': 'batteryDoor',
        'lens-cover': 'cap',
        monitor: 'monitor',
        lvf: 'lvf',
        power: 'power',
        record: 'record',
        shutter: 'shutter',
        cap: 'cap',
        'slot-select': 'slot',
      }[key];
      if (action) {
        if (key === 'shutter' && bodyId === 'hcx1600') openSetting('shutter');
        else {
          if (key === 'shutter') engine.act('halfPress');
          act(action);
          if (key === 'shutter') closeMenu();
          if (['card-door', 'battery-door'].includes(key)) {
            const close = root.querySelector('[data-cam-close-door="' + key + '"]');
            if (close && !close.hidden) close.focus();
          }
        }
        return;
      }
      if (key === 'menu' || key === 'set') {
        if (pendingDelete) {
          act('delete');
          closeMenu();
        } else if (whiteSetReady) {
          if (measureWhiteBalance()) {
            whiteSetReady = false;
            closeMenu();
          }
        } else openMenu();
        return;
      }
      if (key === 'exit') {
        if (!menu.hidden) closeMenu();
        else if (engine.s.playback.open) act('playback', false);
        return;
      }
      if (key === 'delete') {
        if (engine.s.playback.open) confirmDelete();
        else say('Quick Menu is not used in this lesson.');
        return;
      }
      if (['up', 'down', 'left', 'right'].includes(key)) {
        cursor(key);
        return;
      }
      if (['mode', 'auto-manu', 'focus-mode', 'nd'].includes(key)) {
        openSetting(key);
        return;
      }
      const setting = {
        wb: 'wb',
        'white-balance': 'wb',
        'shutter-speed': 'shutter',
        iso: 'iso',
        exposure: 'comp',
        iris: 'fstop',
        gain: bodyId === 'hcx1600' ? 'cameraGain' : 'gain',
        'front-dial': 'fstop',
        'rear-dial': bodyId === 'hcx1600' ? selectedDial : 'shutter',
        'control-dial': selectedDial,
      }[key];
      if (setting) {
        selectedDial = setting;
        openSetting(setting);
        return;
      }
      if (key === 'card-slot-2') {
        act('slot', 2);
        openCard();
      } else if (key === 'card-slot') {
        if (bodyId === 'hcx1600') act('slot', 1);
        openCard();
      } else if (key === 'battery-bay') {
        if (!(bodyId === 'hcx1600' ? engine.s.batteryReleased : engine.s.batteryDoor))
          say(
            bodyId === 'hcx1600'
              ? 'Switch off, then release the battery clip.'
              : 'Open the battery door first.',
          );
        else say('Choose the charged battery from the kit bag.');
      } else if (key === 'mic-socket') {
        act('mic', 'camera');
      } else if (key === 'headphone-socket') act('headphones', false);
      else say('Not used in this lesson.');
    }
    function cursor(key) {
      const p = engine.s.playback;
      if (bodyId === 'elph180' && !p.open && menu.hidden) {
        if (key === 'up') act('mode', 'Auto');
        else if (key === 'down') {
          act('display');
          if (engine.s.display.on === 'off') act('display');
        } else say('Not used in this lesson.');
        return;
      }
      if (pendingDelete && key === 'up') {
        menu.querySelector('[data-cam-action="confirmDelete"]').focus();
        return;
      }
      if (menuKind === 'wb' && key === 'up') {
        whiteSetReady = true;
        say('Place the white card in front of the lens, then press MENU/SET.');
        return;
      }
      if (!menu.hidden) {
        const choices = Array.from(menu.querySelectorAll('button,select,input'));
        let i = choices.indexOf(document.activeElement);
        i = (i + (key === 'up' || key === 'left' ? -1 : 1) + choices.length) % choices.length;
        if (choices[i]) choices[i].focus();
        return;
      }
      if (p.open) {
        if (key === 'up') act(p.playing ? 'pause' : 'play');
        else if (key === 'down') act('stop');
        else if (p.playing) act('speed', key === 'left' ? -2 : 2);
        else if (p.time === 0) act('nextTake', key === 'left' ? -1 : 1);
        else act('step', key === 'left' ? -1 : 1);
      }
    }
    function menuShell(title) {
      if (menu.hidden) menuOrigin = document.activeElement;
      menu.hidden = false;
      menu.replaceChildren(
        el(
          'div',
          { className: 'cam-menu-heading' },
          el('h4', { text: title }),
          button('Close', closeMenu, { 'data-cam-action': 'closeMenu' }),
        ),
      );
      engine.act('menu', title);
      requestAnimationFrame(() => menu.scrollIntoView({ block: 'nearest', behavior: 'instant' }));
      return menu;
    }
    function closeMenu() {
      const wasOpen = !menu.hidden;
      menu.hidden = true;
      menuKind = '';
      pendingDelete = false;
      engine.s.menu = '';
      if (wasOpen && menuOrigin && root.contains(menuOrigin) && !menuOrigin.hidden) menuOrigin.focus();
      menuOrigin = null;
    }
    // Explicit string values avoid T.el's handling of boolean HTML attributes.
    function optionSelect(label, key, options) {
      const input = el('select', { 'aria-label': label, 'data-cam-setting': key });
      options.forEach((v) => {
        const value = Array.isArray(v) ? v[0] : v,
          text = Array.isArray(v) ? v[1] : v;
        input.append(el('option', { value: String(value), text }));
      });
      const value = selectionValue(key);
      input.value = String(value);
      input.addEventListener('change', () => {
        let value = input.value;
        if (value === 'true' || value === 'false') value = value === 'true';
        else if (/^-?\d+(\.\d+)?$/.test(value)) value = +value;
        act(
          key === 'mode' ? 'mode' : key === 'focusMode' ? 'focusMode' : key === 'nd' ? 'nd' : 'setting',
          ['mode', 'focusMode', 'nd'].includes(key) ? value : { key, value },
        );
        input.value = String(selectionValue(key));
      });
      return el('label', { className: 'cam-field' }, el('span', { text: label }), input);
    }
    function openSetting(key) {
      menuKind = key;
      selectedDial = key;
      const panel = menuShell(
        {
          comp: 'Exposure compensation',
          wb: 'White balance',
          fstop: 'IRIS / f-stop',
          shutter: 'Shutter speed',
          iso: 'ISO',
          mode: 'Mode dial',
          'focus-mode': 'Focus mode',
          'auto-manu': 'AUTO / MANU',
          nd: 'ND filter',
          gain: 'Sound Rec Level Adj.',
          cameraGain: 'GAIN',
          videoGain: 'GAIN',
          zoom: 'Zoom lever · W / T',
        }[key] || key,
      );
      let options,
        setting = key;
      if (key === 'mode' || key === 'auto-manu') {
        setting = 'mode';
        options = profile.modes.map((v) => [v, { video: 'Creative Video', SQ: 'S&Q', Auto: 'AUTO' }[v] || v]);
      } else if (key === 'focus-mode') {
        setting = 'focusMode';
        options =
          bodyId === 'hcx1600'
            ? [
                ['AFS', 'AUTO'],
                ['MF', 'MANUAL'],
              ]
            : [['AFS', 'AFS/AFF'], 'AFC', 'MF'];
      } else if (key === 'wb')
        options =
          bodyId === 'hcx1600'
            ? [['AWB', 'ATW'], ['daylight', 'Preset 5600 K'], ['incandescent', 'Preset 3200 K'], 'Ach', 'Bch']
            : [
                'AWB',
                'daylight',
                'cloudy',
                'shade',
                'incandescent',
                ['whiteSet', 'White set'],
                ['kelvin', 'Colour temperature'],
              ];
      else if (key === 'iso') options = profile.iso;
      else if (key === 'comp') options = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3];
      else if (key === 'fstop')
        options =
          bodyId === 'fz300'
            ? [2.8, 4, 5.6, 8]
            : bodyId === 'hcx1600'
              ? [1.9, 2, 2.8, 4, 5.6, 8, 11]
              : [3.5, 4, 5.6, 8, 11, 16, 22];
      else if (key === 'shutter') options = profile.shutter.map((v) => [v, '1/' + v]);
      else if (key === 'gain') options = Array.from({ length: 19 }, (_, i) => [i - 12, i - 12 + ' dB']);
      else if (key === 'cameraGain' || key === 'videoGain') {
        setting = 'videoGain';
        options = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30].map((v) => [v, v + ' dB']);
      } else if (key === 'nd')
        options = [
          [0, 'CLR'],
          [2, '1/4'],
          [4, '1/16'],
          [6, '1/64'],
        ];
      selectedDial = setting;
      if (options) panel.append(optionSelect(panel.querySelector('h4').textContent, setting, options));
      if (key === 'zoom') {
        const suffix = profile.zoom[0] < 2 ? '×' : ' mm';
        const value = el('output', { text: engine.s.settings.zoom + suffix });
        const slider = el('input', {
          type: 'range',
          min: profile.zoom[0],
          max: profile.zoom[1],
          step: profile.zoom[0] < 2 ? 0.1 : 1,
          value: engine.s.settings.zoom,
          'aria-label': 'Zoom',
          'data-cam-setting': 'zoom',
          oninput: (event) => {
            act('zoom', +event.target.value);
            value.textContent = engine.s.settings.zoom + suffix;
          },
        });
        panel.append(el('label', { className: 'cam-field cam-zoom-field' }, 'W', slider, 'T', value));
        slider.focus();
      }
      if (key === 'wb') {
        panel.append(
          optionSelect(
            'Colour temperature',
            'kelvin',
            Array.from({ length: 31 }, (_, i) => [2500 + i * 250, 2500 + i * 250 + ' K']),
          ),
          button(
            'Set from white card',
            () => {
              measureWhiteBalance();
            },
            { 'data-cam-action': 'whiteSet' },
          ),
        );
      }
      panel.querySelector('select')?.focus();
    }
    function selectionValue(key) {
      const value = key === 'mode' ? engine.s.mode : engine.s.settings[key];
      return key === 'wb' && value === 'white' && bodyId !== 'hcx1600' ? 'whiteSet' : value;
    }
    function measureWhiteBalance() {
      if (bodyId === 'hcx1600' && !['Ach', 'Bch'].includes(engine.s.settings.wb)) {
        engine.s.message = 'Select Ach or Bch, then measure the white card.';
        say(engine.s.message);
        return false;
      }
      return act('whiteSet');
    }
    function openMenu() {
      if (bodyId === 'phone') {
        menuKind = 'phone-format';
        menuShell('Video format').append(
          optionSelect('Resolution and frame rate', 'quality', profile.qualities),
        );
        return;
      }
      menuKind = 'main';
      const panel = menuShell(bodyId === 'elph180' ? 'FUNC. / MENU' : 'MENU / SET');
      const group = (title, nodes) => panel.append(el('fieldset', {}, el('legend', { text: title }), nodes));
      const quality = profile.qualities;
      if (bodyId === 'elph180')
        group('FUNC.', [
          optionSelect('Shooting mode', 'mode', [
            ['Auto', 'AUTO'],
            ['P', 'Program'],
          ]),
        ]);
      group(bodyId === 'hcx1600' ? 'SYSTEM / RECORDING' : 'Motion Picture', [
        optionSelect('Rec Quality', 'quality', quality),
      ]);
      if ((b.level || 1) >= 2 && bodyId !== 'elph180' && bodyId !== 'phone') {
        group('Sound', [
          optionSelect(
            bodyId === 'fz300'
              ? 'Mic Level Disp.'
              : bodyId === 'hcx1600'
                ? 'Audio level meter'
                : 'Sound Rec Level Disp.',
            'levelBars',
            [
              [true, 'ON'],
              [false, 'OFF'],
            ],
          ),
          optionSelect(
            bodyId === 'fz300'
              ? 'Mic Level Adj.'
              : bodyId === 'hcx1600'
                ? 'Audio input level'
                : 'Sound Rec Level Adj.',
            'gain',
            Array.from({ length: 19 }, (_, i) => [i - 12, i - 12 + ' dB']),
          ),
        ]);
        group('Monitor / Display', [
          optionSelect('Zebra Pattern', 'zebras', [
            [false, 'OFF'],
            [true, 'ZEBRA1'],
          ]),
          optionSelect('Guide Line', 'grid', [
            [false, 'OFF'],
            [true, 'ON'],
          ]),
          optionSelect('Red REC Frame Indicator', 'redFrame', [
            [false, 'OFF'],
            [true, 'ON'],
          ]),
        ]);
      }
      if ((b.level || 1) >= 3 && ['g97', 'fz300'].includes(bodyId) && engine.s.mode === 'video')
        group('Creative Video', [optionSelect('Exposure Mode', 'exposureMode', ['P', 'M'])]);
      if (bodyId === 'fz300' && engine.s.mode === 'video' && (b.level || 1) >= 3)
        group('Creative Video', [
          optionSelect('High Speed Video', 'highSpeed', [
            [0, 'OFF'],
            [120, '120 fps · HD'],
            [240, '240 fps · VGA'],
          ]),
        ]);
      if (engine.s.mode === 'SQ' && bodyId === 'g97')
        group('Slow & Quick', [el('p', { text: '2xSLOW · FHD 60p · no recorded sound' })]);
      const setup = [button('Format card…', confirmFormat, { 'data-cam-action': 'format' })];
      if (['g97', 'hcx1600'].includes(bodyId))
        setup.push(
          optionSelect(
            'Headphone Volume',
            'headphoneVolume',
            Array.from({ length: 11 }, (_, i) => [i / 10, String(i)]),
          ),
        );
      group('Setup', setup);
    }
    function confirmDelete() {
      pendingDelete = true;
      menuKind = 'delete';
      menuShell('Delete this take?').append(
        el('p', { text: 'This removes the selected take from this practice card.' }),
        button(
          'Delete Single',
          () => {
            act('delete');
            closeMenu();
          },
          { 'data-cam-action': 'confirmDelete' },
        ),
      );
    }
    function confirmFormat() {
      menuKind = 'format';
      menuShell('Format card?').append(
        el('p', { text: 'Formatting removes every take on this practice card.' }),
        button(
          'Format this card',
          () => {
            act('format');
            closeMenu();
          },
          { 'data-cam-action': 'confirmFormat' },
        ),
      );
    }
    function openCard() {
      const panel = menuShell('SD card');
      const doorButton = button(
        engine.s.cardDoor ? 'Close card cover' : 'Open card cover',
        () => {
          act('cardDoor');
          doorButton.textContent = engine.s.cardDoor ? 'Close card cover' : 'Open card cover';
        },
        { 'data-cam-action': 'cardDoor' },
      );
      panel.append(
        doorButton,
        el('p', { text: engine.s.card.present ? 'Card inserted' : 'No card inserted' }),
        button('Remove card', () => act('card', false), { 'data-cam-action': 'removeCard' }),
        button('Unlock card', () => act('cardLock', false), { 'data-cam-action': 'unlockCard' }),
        button(
          'Reinsert this card',
          () => {
            act('card', true);
            closeMenu();
          },
          { 'data-cam-action': 'reinsertCard' },
        ),
      );
    }
    function turnDial(direction, key) {
      if (key === 'zoom') selectedDial = 'zoom';
      if (key === 'mode' || (!key && selectedDial === 'mode')) {
        if (!allowed('mode')) return;
        const opts = profile.modes;
        act('mode', opts[(opts.indexOf(engine.s.mode) + direction + opts.length) % opts.length]);
        return;
      }
      if (key === 'front-dial' && !['wb', 'iso', 'comp'].includes(selectedDial)) selectedDial = 'fstop';
      if (key === 'rear-dial' && bodyId !== 'hcx1600' && !['wb', 'iso', 'comp'].includes(selectedDial))
        selectedDial = 'shutter';
      if (selectedDial === 'zoom') {
        act('zoom', Math.max(profile.zoom[0], Math.min(profile.zoom[1], engine.s.settings.zoom + direction)));
        return;
      }
      if (selectedDial === 'focusMode') {
        const options = ['AFS', 'AFC', 'MF'];
        act(
          'focusMode',
          options[
            (options.indexOf(engine.s.settings.focusMode) + direction + options.length) % options.length
          ],
        );
        return;
      }
      const options = {
        videoGain: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
        gain: Array.from({ length: 19 }, (_, i) => i - 12),
        nd: [0, 2, 4, 6],
        comp: [-3, -2, -1, 0, 1, 2, 3],
        iso: profile.iso,
        fstop:
          bodyId === 'fz300'
            ? [2.8, 4, 5.6, 8]
            : bodyId === 'hcx1600'
              ? [1.9, 2, 2.8, 4, 5.6, 8, 11]
              : [3.5, 4, 5.6, 8, 11, 16, 22],
        shutter: profile.shutter,
        wb: ['AWB', 'daylight', 'cloudy', 'shade', 'incandescent'],
      }[selectedDial] || [-3, -2, -1, 0, 1, 2, 3];
      const current = engine.s.settings[selectedDial];
      const i = options.every((value) => typeof value === 'number')
        ? options.reduce(
            (best, value, index) =>
              Math.abs(value - current) < Math.abs(options[best] - current) ? index : best,
            0,
          )
        : Math.max(0, options.indexOf(current));
      act('setting', {
        key: selectedDial,
        value: options[Math.max(0, Math.min(options.length - 1, i + direction))],
      });
    }
    function buildKit() {
      kitList.replaceChildren();
      kitAction.replaceChildren();
      const items = (b.kit || []).filter((item) => {
        const key = typeof item === 'string' ? item : item.id;
        return (
          !(bodyId === 'phone' && ['battery', 'card'].includes(key)) &&
          !(key === 'headphones' && !profile.headphones) &&
          !(/^mic-/.test(key) && !profile.mic)
        );
      });
      kitHelp.hidden = !items.length;
      items.forEach((item) => {
        const key = typeof item === 'string' ? item : item.id;
        const n = button('', () => selectKit(key), {
          className: 'cam-kit-item',
          draggable: 'true',
          'data-cam-kit': key,
          'aria-pressed': 'false',
        });
        const imageId = body.kit && body.kit[key];
        if (imageId && media(imageId)) n.append(picture(imageId, 'cam-kit-image', true));
        n.append(el('span', { text: kitNames[key] || key }));
        n.addEventListener('dragstart', (e) => {
          selectKit(key, true);
          e.dataTransfer.setData('text/plain', key);
        });
        kitList.append(n);
      });
      if (items.some((x) => (typeof x === 'string' ? x : x.id) === 'mic-wireless'))
        kitList.append(
          button('Transmitter ON/OFF', () => act('transmitter'), { 'data-cam-action': 'transmitter' }),
        );
    }
    function selectKit(key, force) {
      held = force ? key : held === key ? null : key;
      kitList
        .querySelectorAll('[data-cam-kit]')
        .forEach((n) => n.setAttribute('aria-pressed', n.dataset.camKit === held));
      root
        .querySelectorAll('[data-cam-control]')
        .forEach((n) =>
          n.classList.toggle(
            'cam-drop-target',
            !!held && (kitTargets[held] || []).includes(n.dataset.camControl),
          ),
        );
      kitAction.replaceChildren();
      if (!held) {
        kitHelp.textContent = 'Choose an item, then its socket or door.';
        return;
      }
      kitHelp.textContent =
        (kitNames[held] || held) + ' selected. Choose its place on the camera, or use the button below.';
      const target = (kitTargets[held] || [])[0];
      if (held === 'slate') {
        const shot = el('input', { type: 'text', value: 'S04', maxlength: 16, 'aria-label': 'Shot number' }),
          take = el('input', {
            type: 'number',
            value: engine.s.takes.length + 1,
            min: 1,
            max: 99,
            'aria-label': 'Take number',
          });
        kitAction.append(
          el('label', { className: 'cam-field' }, 'Shot', shot),
          el('label', { className: 'cam-field' }, 'Take', take),
          button(
            'Hold slate',
            () => {
              act('slate', { shot: shot.value, take: +take.value });
              selectKit(null);
            },
            { 'data-cam-action': 'slate' },
          ),
        );
      } else
        kitAction.append(
          button(
            {
              battery: 'Insert charged battery',
              card: 'Insert empty card',
              cloth: 'Wipe lens',
              headphones: 'Plug in headphones',
              'mic-wireless': 'Connect wireless receiver',
              'mic-shotgun': 'Connect shotgun microphone',
              'white-card': 'Hold white card in front of lens',
            }[held] || 'Use item',
            () => applyKit(target),
            { 'data-cam-action': 'applyKit' },
          ),
        );
    }
    function applyKit(target) {
      if (!held || !(kitTargets[held] || []).includes(target)) return;
      const key = held;
      const cover =
        target === 'mic-socket' ? 'mic-cover' : target === 'headphone-socket' ? 'terminal-cover' : null;
      const needsCover =
        cover && Object.values(body.views || {}).some((v) => v.controls && v.controls[cover]);
      if (needsCover && !covers[cover]) {
        engine.s.message =
          'Open the ' + (cover === 'mic-cover' ? 'MIC' : 'terminal') + ' cover before plugging in.';
        say(engine.s.message);
        return;
      }
      if (key === 'battery') act('battery', 1);
      else if (key === 'card') act('card', { minutes: 42, locked: false });
      else if (key === 'cloth') act('wipe');
      else if (key === 'headphones') act('headphones', true);
      else if (key === 'mic-wireless') act('mic', 'wireless');
      else if (key === 'mic-shotgun') act('mic', 'shotgun');
      else if (key === 'white-card') {
        act('whiteCard', true);
        kitAction.replaceChildren(
          button(
            'Put white card away',
            () => {
              act('whiteCard', false);
              selectKit(null);
            },
            { 'data-cam-action': 'removeWhiteCard' },
          ),
        );
        return;
      } else if (key === 'slate') {
        const take = engine.s.takes.length + 1;
        act('slate', { shot: 'S04', take });
      }
      selectKit(null);
    }
    function makeMonitor(copy) {
      const monitor = el('div', { className: 'cam-monitor', 'data-cam-monitor': copy ? 'copy' : 'main' });
      const scene = el('div', { className: 'cam-scene', 'aria-hidden': 'true' });
      const readouts = el('div', { className: 'cam-readouts', 'aria-hidden': 'true' });
      const topLeft = el('div', { className: 'cam-readout-tl' }),
        topRight = el('div', { className: 'cam-readout-tr' });
      const cue = el('div', { className: 'cam-action-cue' });
      const bottom = el('div', { className: 'cam-readout-bottom' }),
        meter = el('div', { className: 'cam-meter' });
      meter.append(
        ...['L', 'R'].map((channel) =>
          el(
            'span',
            { className: 'cam-level-row' },
            el('span', { text: channel }),
            el('span', { className: 'cam-level-track' }, el('span', { className: 'cam-level-fill' })),
          ),
        ),
        el('span', { className: 'cam-level-text' }),
      );
      const playback = el('div', { className: 'cam-playback-controls', hidden: true });
      if (!copy) {
        playback.append(
          button('Previous take', () => act('nextTake', -1), { 'data-cam-action': 'previousTake' }),
          button('Play', () => act(engine.s.playback.playing ? 'pause' : 'play'), {
            'data-cam-action': 'play',
          }),
          button('Next take', () => act('nextTake', 1), { 'data-cam-action': 'nextTake' }),
        );
        const seek = el('input', {
          type: 'range',
          min: 0,
          max: 1,
          step: 0.03,
          value: 0,
          'aria-label': 'Playback position',
          'data-cam-action': 'seek',
          oninput: (e) => act('seek', +e.target.value),
        });
        playback.append(seek);
      }
      readouts.append(topLeft, topRight, meter, bottom, cue);
      monitor.append(scene, readouts, playback);
      if (!copy && profile.focus) {
        monitor.tabIndex = 0;
        monitor.setAttribute('role', 'group');
        monitor.setAttribute('aria-label', 'Touch monitor to focus. Enter opens focus targets.');
        let holdTimer = 0,
          heldLong = false;
        monitor.addEventListener('pointerdown', (e) => {
          heldLong = false;
          if (bodyId === 'phone' && !e.target.closest('button,input') && !engine.s.playback.open) {
            focusAt(e);
            holdTimer = setTimeout(() => {
              act('lock');
              heldLong = true;
            }, 550);
          }
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) =>
          monitor.addEventListener(type, () => clearTimeout(holdTimer)),
        );
        monitor.addEventListener('click', (e) => {
          if (e.target.closest('button,input') || engine.s.playback.open || heldLong) return;
          focusAt(e);
        });
        function focusAt(e) {
          const rect = monitor.getBoundingClientRect(),
            x = (e.clientX - rect.left) / rect.width;
          const layers = (T.cameraScenes[b.scene || 'note-library'] || {}).layers || [];
          const id =
            b.scene === 'interview-window'
              ? x > 0.72
                ? 'window'
                : 'reader'
              : b.scene === 'ball-toss'
                ? 'ball'
                : x < 0.32
                  ? 'mug'
                  : x > 0.78
                    ? 'shelves'
                    : 'reader';
          if (layers.some((l) => l.id === id)) act('focus', id);
        }
        monitor.addEventListener('keydown', (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && e.target === monitor) {
            e.preventDefault();
            menuKind = 'focus';
            menuShell('Focus on').append(
              ...((T.cameraScenes[b.scene || 'note-library'] || {}).layers || []).map((layer) =>
                button(
                  layer.id,
                  () => {
                    act('focus', layer.id);
                    closeMenu();
                    monitor.focus();
                  },
                  { 'data-cam-focus': layer.id },
                ),
              ),
            );
          }
        });
      }
      monitors.push({
        node: monitor,
        scene,
        readouts,
        topLeft,
        topRight,
        bottom,
        meter,
        playback,
        cue,
        copy,
      });
      return monitor;
    }
    function buildPhone() {
      const shell = el('div', { className: 'cam-phone' });
      const bar = el(
        'div',
        { className: 'cam-phone-bar' },
        button(
          'Control Center',
          () => {
            menuKind = 'phone';
            menuShell('Control Center').append(
              button('Airplane mode ON/OFF', () => act('airplane'), { 'data-cam-action': 'airplane' }),
              button(
                'Rotate phone',
                () => {
                  act('rotate');
                  shell.classList.toggle('cam-phone-landscape', !!engine.s.settings.sideways);
                },
                { 'data-cam-action': 'rotate' },
              ),
              button('Wipe the lens', () => act('wipe'), { 'data-cam-action': 'wipe' }),
              button('Storage', () => {
                menuShell('Storage').append(
                  el('p', { text: Math.floor(engine.s.card.minutes) + ' minutes of video available.' }),
                  button('Clear practice storage…', confirmFormat),
                );
              }),
            );
          },
          { 'data-cam-control': 'control-center' },
        ),
        button('HD · 30', () => openMenu(), { 'data-cam-control': 'format' }),
      );
      const monitor = makeMonitor(false);
      monitor.classList.add('cam-phone-monitor');
      const zoom = el(
        'div',
        { className: 'cam-phone-zoom' },
        [0.5, 1, 2].map((n) => button(n + '×', () => act('zoom', n), { 'data-cam-zoom': n })),
      );
      const modes = el(
        'div',
        { className: 'cam-phone-modes' },
        button('PHOTO', () => act('mode', 'PHOTO'), { 'data-cam-mode': 'PHOTO' }),
        button('VIDEO', () => act('mode', 'VIDEO'), { 'data-cam-mode': 'VIDEO' }),
      );
      const controls = el(
        'div',
        { className: 'cam-phone-capture' },
        button('Playback', () => act('playback'), { 'data-cam-control': 'play' }),
        button('Record', () => act('shutter'), {
          className: 'cam-phone-record',
          'aria-label': 'Record or take photo',
          'data-cam-control': 'record',
        }),
        button('AE/AF LOCK', () => act('lock'), { 'data-cam-control': 'aelock' }),
      );
      const exposure = el(
        'label',
        { className: 'cam-phone-exposure' },
        'Brightness',
        el('input', {
          type: 'range',
          min: -3,
          max: 3,
          step: 0.5,
          value: engine.s.settings.comp,
          'aria-label': 'Brightness',
          'data-cam-setting': 'comp',
          oninput: (e) => act('setting', { key: 'comp', value: +e.target.value }),
        }),
      );
      shell.append(bar, monitor, zoom, exposure, modes, controls);
      shell.classList.toggle('cam-phone-landscape', !!engine.s.settings.sideways);
      main.append(shell);
      footer.querySelector('[data-cam-action="callAction"]').hidden = false;
    }
    // Asset state names are supplied by the model pack, independent of engine booleans.
    function stateFor(key, desc) {
      const s = engine.s,
        k = s.settings;
      const batteryPresent = s.batteryPresent !== false;
      let value;
      if (['mic-cover', 'terminal-cover', 'headphone-cover'].includes(key))
        value = covers[key] ? 'open' : 'closed';
      else if (key.startsWith('cap')) value = s.cap ? 'on' : 'none';
      else if (key.startsWith('lens-cover')) value = s.cap ? 'closed' : 'none';
      else if (key.startsWith('receiver')) value = k.mic === 'wireless' ? 'mounted' : 'none';
      else if (key.startsWith('mic-plug')) value = k.mic !== 'camera' ? 'in' : 'none';
      else if (key.startsWith('headphone-plug')) value = k.headphones ? 'in' : 'none';
      else if (key === 'card-door')
        value = s.cardDoor ? (s.card.present ? 'open-card' : 'open-empty') : 'closed';
      else if (key === 'battery-door' || key === 'bay-door') {
        if (!s.batteryDoor) value = 'closed';
        else if (profile.sharedCardBatteryDoor) {
          const cardPresent = s.cards?.[0]?.present ?? s.card.present;
          value =
            batteryPresent && cardPresent
              ? 'open-both'
              : batteryPresent
                ? 'open-battery'
                : cardPresent
                  ? 'open-card'
                  : 'open-empty';
          // Older in-progress packs have only the battery state; the final pack
          // distinguishes the two occupants of the shared compartment.
          if (!(value in desc.states)) value = batteryPresent ? 'open-battery' : 'open-empty';
        } else value = batteryPresent ? 'open-battery' : 'open-empty';
      } else if (key === 'nd') value = { 0: 'CLR', 2: '1-4', 4: '1-16', 6: '1-64' }[k.nd];
      else if (key === 'zoom') value = k.zoom > (profile.zoom[0] + profile.zoom[1]) / 2 ? 'tele' : 'wide';
      else if (key === 'lens')
        value = !s.power
          ? 'retracted'
          : k.zoom > (profile.zoom[0] + profile.zoom[1]) / 2
            ? 'tele'
            : 'extended';
      else if (key === 'auto-manu') value = s.mode;
      else if (key === 'battery') value = s.batteryReleased || !batteryPresent ? 'off' : 'on';
      else if (key === 'slots') {
        const first = s.cards?.[0]?.present,
          second = s.cards?.[1]?.present;
        value = first && second ? 'two' : first ? 'one' : second ? 'one-2' : 'empty';
      } else if (key === 'monitor')
        value =
          desc.states[monitorPose] !== undefined ? monitorPose : s.display.open ? 'open-side' : 'closed-in';
      else value = { power: s.power ? 'on' : 'off', 'focus-lever': k.focusMode, 'mode-dial': s.mode }[key];
      return value;
    }

    // Update only the scene, readout text and state images; retain focused inputs.
    function update() {
      if (!engine) return;
      const s = engine.s,
        k = s.settings,
        f = engine.frame();
      root.dataset.camRecording = !!s.recording;
      root.dataset.camPower = !!s.power;
      root.querySelectorAll('[data-cam-control]').forEach((n) => {
        const value = {
          power: s.power,
          record: !!s.recording,
          cap: s.cap,
          'lens-cover': s.cap,
          aelock: k.focusLocked,
          monitor: s.display.open,
        }[n.dataset.camControl];
        if (value !== undefined) n.setAttribute('aria-pressed', String(!!value));
      });
      for (const m of monitors) {
        m.node.style.visibility = !m.copy && s.display.open === false ? 'hidden' : '';
        m.scene.innerHTML = f.svg;
        const active = s.power && s.display.on === 'monitor' && s.display.open !== false && !s.display.asleep;
        m.readouts.hidden = !active || !s.display.readouts;
        m.node.classList.toggle('cam-recording', !!s.recording && !!k.redFrame);
        m.topLeft.textContent = s.playback.open
          ? 'PLAYBACK · Take ' + (f.take ? f.take.n : '—') + '\n' + fmt(s.playback.time)
          : s.mode + '  ' + k.quality + (s.recording ? '\nREC ' + fmt(s.recording.length) : '');
        m.cue.textContent =
          !s.playback.open && s.awaitingAction
            ? 'Waiting for Call action'
            : !s.playback.open && s.sceneTime < 0
              ? 'Action starts in ' + Math.ceil(-s.sceneTime)
              : '';
        m.topRight.textContent =
          (s.recording ? '● REC  ' : '') + (k.focusMode || 'AF') + '\n' + batteryMark(s.battery);
        const setting = f.settings || k;
        m.bottom.textContent =
          (setting.focusLocked ? 'AFL ' : '') +
          (setting.exposureLocked ? 'AEL ' : '') +
          '1/' +
          (f.picture.shutter || setting.shutter) +
          '  F' +
          Number(f.picture.fstop || setting.fstop)
            .toFixed(1)
            .replace(/\.0$/, '') +
          '  ' +
          (Number(setting.comp) >= 0 ? '+' : '') +
          setting.comp +
          '  ISO ' +
          Math.round(f.picture.effectiveISO || Number(setting.iso) || 400) +
          '  ' +
          setting.wb +
          '\n' +
          (s.card.present ? 'R' + remain(s.card.minutes * 60) : '----');
        m.meter.hidden = !k.levelBars || !active || ['phone', 'elph180'].includes(bodyId);
        if (bodyId === 'elph180') {
          m.topLeft.textContent =
            (s.playback.open ? 'PLAYBACK' : s.mode === 'Auto' ? 'AUTO' : 'P') +
            '  ' +
            setting.quality +
            (s.recording ? '\nREC ' + fmt(s.recording.length) : '');
          m.topRight.textContent = batteryMark(s.battery);
          m.bottom.textContent =
            Number(setting.zoom).toFixed(1) +
            '×  ' +
            (s.card.present ? 'R' + remain(s.card.minutes * 60) : 'NO CARD');
        }
        if (bodyId === 'hcx1600') {
          m.topLeft.textContent =
            (s.playback.open ? 'PLAYBACK · Take ' + (f.take ? f.take.n : '—') : s.mode) +
            '  ' +
            setting.quality +
            (s.recording ? '\nREC ' + fmt(s.recording.length) : '');
          m.topRight.textContent = (setting.focusMode === 'MF' ? 'MF' : 'AF') + '  ' + batteryMark(s.battery);
          m.bottom.textContent =
            'IRIS F' +
            Number(f.picture.fstop || setting.fstop).toFixed(1) +
            '  ' +
            (setting.videoGain || 0) +
            ' dB  1/' +
            (f.picture.shutter || setting.shutter) +
            '  ' +
            (setting.wb === 'AWB' ? 'ATW' : setting.wb) +
            '\nSLOT ' +
            s.slot +
            '  ND ' +
            ({ 0: 'CLR', 2: '1/4', 4: '1/16', 6: '1/64' }[setting.nd] || 'CLR') +
            '  ' +
            (s.card.present ? 'R' + remain(s.card.minutes * 60) : 'NO CARD');
        }
        if (!m.copy)
          m.node.setAttribute(
            'aria-label',
            'Camera monitor. ' +
              (s.power ? 'Power on. ' : 'Power off. ') +
              (s.recording ? 'Recording. ' : '') +
              'Battery ' +
              Math.round(s.battery * 100) +
              ' percent. ' +
              (s.card.present ? remain(s.card.minutes * 60) + ' left. ' : 'No card. ') +
              'Focus ' +
              setting.focusOn +
              '. Sound ' +
              ((f.sound && f.sound.level) || s.sound.level) +
              (profile.focus ? '. Enter opens focus targets.' : '. Automatic focus.'),
          );
        if (bodyId === 'phone') {
          m.bottom.textContent =
            (setting.focusLocked ? 'AE/AF LOCK' : '') + (setting.zoom > 2 ? ' · DIGITAL ZOOM' : '');
          m.topLeft.textContent = s.playback.open
            ? 'TAKE ' + (f.take ? f.take.n : '—') + '  ' + fmt(s.playback.time)
            : s.recording
              ? 'REC ' + fmt(s.recording.length)
              : '00:00';
          m.topRight.textContent = 'BAT ' + Math.round(s.battery * 100) + '%';
        }
        const level = (f.sound && f.sound.level) || s.sound.level,
          peak = f.sound && f.sound.peak;
        m.meter.querySelector('.cam-level-text').textContent = String(level).toUpperCase();
        m.meter.dataset.level = level;
        if (typeof peak === 'number')
          m.meter.style.setProperty('--cam-level', Math.max(0, Math.min(100, peak * 100)) + '%');
        m.playback.hidden = !s.playback.open || m.copy;
        if (s.playback.open && !m.copy) {
          const play = m.playback.querySelector('[data-cam-action="play"]');
          play.textContent = s.playback.playing ? 'Pause' : 'Play';
          const seek = m.playback.querySelector('input');
          seek.max = f.duration || 1;
          if (document.activeElement !== seek) seek.value = s.playback.time;
        }
      }
      const replacements = new Map();
      layerNodes.forEach(({ node, key, desc, stage, base, data }) => {
        let value = stateFor(key, desc);
        if (desc.rotatable && value === 'SQ') value = 'sq';
        const id = desc.states[value] || (desc.rotatable ? desc.states[desc.defaultState] : null);
        const available =
          !desc.requiresMonitorState ||
          (desc.requiresMonitorState === 'closed' ? !s.display.open : s.display.open);
        if (desc.rotatable)
          node.style.transform = 'rotate(' + ((desc.angleByState || {})[value] || 0) + 'deg)';
        node.hidden = !id || !!desc.replace || !available;
        if (desc.replace) {
          if (!replacements.has(base)) replacements.set(base, { id: data.media, stage, data });
          if (id && available && value !== desc.defaultState)
            replacements.set(base, { id, stage, data, desc, value });
        } else if (id && node.dataset.media !== id) {
          const rec = media(id);
          if (rec) {
            node.src = T.mediaURL(rec);
            node.dataset.media = id;
          }
        }
      });
      replacements.forEach(({ id, stage, data, desc, value }, base) => {
        const rec = media(id);
        if (rec && base.dataset.media !== id) {
          base.src = T.mediaURL(rec);
          base.removeAttribute('srcset');
          base.dataset.media = id;
        }
        const mon = stage.querySelector('[data-cam-monitor=main]'),
          box = (desc && desc.stateLCD && desc.stateLCD[value]) || data.lcd;
        if (mon && box) place(mon, box);
      });

      root.querySelectorAll('[data-cam-control="zoom"],[data-cam-control="focus"]').forEach((n) => {
        if (n.tagName === 'INPUT') {
          const value = n.dataset.camControl === 'zoom' ? k.zoom : k.focusDistance;
          if (document.activeElement !== n) n.value = value;
          const span = n.closest('.cam-ring')?.querySelector('span');
          if (span)
            span.textContent =
              n.dataset.camControl === 'zoom'
                ? 'Zoom ' + Number(value).toFixed(1).replace(/\.0$/, '') + (profile.zoom[0] < 2 ? '×' : ' mm')
                : 'Focus ' + Number(value).toFixed(1) + ' m';
        }
      });
      root
        .querySelectorAll('[data-cam-mode]')
        .forEach((n) => n.setAttribute('aria-pressed', n.dataset.camMode === s.mode));
      root
        .querySelectorAll('[data-cam-zoom]')
        .forEach((n) => n.setAttribute('aria-pressed', +n.dataset.camZoom === +k.zoom));
      root.querySelectorAll('.cam-view').forEach((stage) => {
        const controls = body.views[stage.dataset.camStage]?.controls || {};
        stage.querySelectorAll('[data-cam-control]').forEach((n) => {
          const key = n.dataset.camControl,
            cover =
              key === 'mic-socket'
                ? 'mic-cover'
                : ['headphone-socket', 'hdmi', 'usb', 'remote'].includes(key)
                  ? 'terminal-cover'
                  : null;
          if (cover && controls[cover]) n.disabled = !covers[cover];
          const hasCardDoor =
            controls['card-door'] || (profile.sharedCardBatteryDoor && controls['battery-door']);
          if (['card-slot', 'card-slot-2'].includes(key) && hasCardDoor) n.disabled = !s.cardDoor;
          if (key === 'battery-bay' && profile.batteryAccess === 'door' && controls['battery-door'])
            n.disabled = !s.batteryDoor;
          if (key === 'card-door') n.disabled = !!s.cardDoor;
          if (key === 'battery-door' && profile.batteryAccess === 'door') n.disabled = !!s.batteryDoor;
          if (['mic-cover', 'terminal-cover', 'headphone-cover'].includes(key)) {
            n.disabled = !!covers[key];
            n.style.zIndex = covers[key] ? '4' : '9';
          }
          const requirement = controls[key]?.requiresMonitorState;
          if (requirement) n.disabled = requirement === 'closed' ? s.display.open : !s.display.open;
          const ring = n.closest('.cam-ring');
          if (ring) ring.hidden = !!n.disabled;
        });
      });
      root.querySelectorAll('[data-cam-close-cover]').forEach((n) => {
        n.hidden = !covers[n.dataset.camCloseCover];
      });
      root.querySelectorAll('[data-cam-close-door]').forEach((n) => {
        n.hidden = !(n.dataset.camCloseDoor === 'card-door' ? s.cardDoor : s.batteryDoor);
      });
      const lensAccess = main.querySelector('[data-cam-action="revealLensControls"]');
      if (lensAccess) lensAccess.hidden = !s.display.open;
      const accessActions = main.querySelector('.cam-view-actions');
      if (accessActions) accessActions.hidden = !accessActions.querySelector('button:not([hidden])');
      menu.querySelectorAll('select[data-cam-setting]').forEach((input) => {
        const value = selectionValue(input.dataset.camSetting);
        if (input.value !== String(value)) input.value = String(value);
      });
      const phoneFormat = main.querySelector('[data-cam-control=format]');
      if (phoneFormat) phoneFormat.textContent = k.quality.replace(' ', ' · ');
      const phone = main.querySelector('.cam-phone');
      if (phone) phone.classList.toggle('cam-phone-landscape', !!k.sideways);
      let count = 0;
      (b.tasks || []).forEach((task, i) => {
        let passed = false;
        try {
          passed = !!task.check(s);
        } catch (err) {
          console.error('Camera task check failed', err);
        }
        done[i] = passed;
        if (passed) count++;
        taskNodes[i].classList.toggle('cam-task-done', passed);
        taskNodes[i].setAttribute('aria-label', (passed ? 'Complete: ' : 'Not yet complete: ') + task.text);
        taskNodes[i].querySelector('.cam-check').textContent = passed ? '✓' : '○';
      });
      taskCount.textContent = done.length
        ? count + ' of ' + done.length + ' complete'
        : 'Free practice. Try the controls, record a take, then play it back.';
      doneNote.hidden = !done.length || count !== done.length;
      doneNote.textContent = b.doneText || 'Practice complete.';
      if (hintShown) showHint();
      syncAudio(f);
      if (
        lastSoundLevel !== s.sound.level &&
        s.sound.level === 'clipped' &&
        s.power &&
        s.settings.levelBars &&
        !s.playback.open
      )
        say('Sound is clipping. Lower the recording level.');
      else if (
        status.textContent !== 'Sound is clipping. Lower the recording level.' ||
        s.sound.level !== 'clipped'
      )
        say(s.message);
      lastSoundLevel = s.sound.level;
    }
    function syncAudio(f) {
      const sound = f.sound || {},
        allowedSound =
          running &&
          visible &&
          (engine.s.playback.open
            ? engine.s.playback.playing && engine.s.playback.soundOn !== false
            : engine.s.power && engine.s.settings.headphones);
      audio.volume = engine.s.playback.open
        ? 1
        : Math.max(
            0,
            Math.min(1, engine.s.settings.headphoneVolume == null ? 0.7 : engine.s.settings.headphoneVolume),
          );
      const rec = sound.mediaId && media(sound.mediaId),
        key = allowedSound && sound.audible && rec ? sound.mediaId : '';
      if (key !== audioKey) {
        audio.pause();
        bed.pause();
        audioKey = key;
        if (key) {
          audio.src = T.mediaURL(rec);
          audio.currentTime = Math.max(0, sound.mediaTime || 0);
          audio.play().catch(() => {});
          const bedRec = sound.bedId && media(sound.bedId);
          if (bedRec) {
            bed.src = T.mediaURL(bedRec);
            bed.volume = sound.bedVolume || 0.3;
            bed.play().catch(() => {});
          }
        }
      } else if (key && Math.abs(audio.currentTime - (sound.mediaTime || 0)) > 0.6)
        audio.currentTime = Math.max(0, sound.mediaTime || 0);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) api.stop();
    });
    tabs.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      const list = [...tabs.querySelectorAll('button')],
        i = list.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      e.stopPropagation();
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? list.length - 1
            : (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
      list[next].click();
    });
    root.addEventListener('focusin', activate);
    root.addEventListener('pointerdown', activate);
    root.addEventListener('keydown', (e) => {
      const dialKey = (e.key === '[' || e.key === ']') && e.target.matches('select,input[type=range]');
      if ((e.target.matches('input,select,textarea') && !dialKey) || e.ctrlKey || e.metaKey || e.altKey)
        return;
      const key = e.key.toLowerCase();
      let handled = true;
      if (key === 'r') act('record');
      else if (key === 'p') act('playback');
      else if (key === 'f') act('halfPress');
      else if (key === 'm' && bodyId !== 'phone') closerButton.click();
      else if (key === '[' || key === ']') turnDial(key === '[' ? -1 : 1);
      else if (key.startsWith('arrow')) cursor(key.slice(5));
      else if (key === 'escape') {
        closeMenu();
        selectKit(null);
      } else handled = false;
      if (handled) e.preventDefault();
    });
    if (Array.isArray(original.body)) {
      picker.append(el('p', { className: 'cam-picker-label', text: 'Pick your camera' }));
      original.body.forEach((id) => {
        const n = button('', () => choose(id), {
          className: 'cam-pick',
          'data-cam-body': id,
          'aria-pressed': 'false',
        });
        if (media('cam-' + id + '-hero')) n.append(picture('cam-' + id + '-hero', 'cam-picker-image', true));
        else if (id === 'phone') n.append(el('span', { className: 'cam-phone-icon', 'aria-hidden': 'true' }));
        n.append(el('span', { text: names[id] || id }));
        picker.append(n);
      });
    } else picker.hidden = true;
    const initialBody =
      Array.isArray(original.body) && original.body.includes(original.initialBody)
        ? original.initialBody
        : Array.isArray(original.body)
          ? original.body[0]
          : original.body || 'g97';
    choose(initialBody);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const latest = entries.filter((entry) => entry.target === root).at(-1);
        if (!latest) return;
        const rect = root.getBoundingClientRect();
        visible = !document.hidden && rect.bottom > 0 && rect.top < innerHeight && rect.width > 0;
        if (!visible) {
          cancelAnimationFrame(frameId);
          frameId = 0;
          audio.pause();
          bed.pause();
          audioKey = '';
          lastTime = 0;
        } else schedule();
      });
      observer.observe(root);
    }
    return {
      el: root,
      wide: true,
      interactive: true,
      printNote: 'Camera activity: open this topic online to try it.',
    };
  };
})();
