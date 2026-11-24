/* Camera practice engine. Classic script, local media only, no pixel readback or device APIs.
   All times come from tick(deltaSeconds). Body controls and lessons share this state. */
(() => {
  'use strict';
  const T = window.Textbook;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const iso = ['AUTO', 200, 400, 800, 1600, 3200, 6400],
    shutter = [30, 50, 60, 100, 125, 250, 500, 1000, 2000, 4000];
  T.cameraProfiles = {
    g97: {
      modes: ['iA', 'P', 'video', 'SQ'],
      qualities: ['4K 30p', '4K 24p', 'FHD 60p', 'FHD 30p'],
      zoom: [12, 60],
      fstop: [3.5, 22],
      iso,
      shutter,
      mic: true,
      headphones: true,
      manual: true,
      focus: true,
      nd: false,
      slots: 1,
      batteryAccess: 'door',
    },
    fz300: {
      modes: ['iA', 'P', 'video'],
      qualities: ['4K 30p', '4K 24p', 'FHD 60p', 'FHD 30p'],
      zoom: [25, 600],
      fstop: [2.8, 8],
      iso,
      shutter: shutter.filter((n) => n <= 4000),
      mic: true,
      headphones: false,
      manual: true,
      focus: true,
      nd: false,
      slots: 1,
      highSpeed: [0, 120, 240],
      batteryAccess: 'door',
      sharedCardBatteryDoor: true,
    },
    elph180: {
      modes: ['Auto', 'P'],
      qualities: ['HD 25p', 'VGA 30p'],
      zoom: [1, 8],
      fstop: [3.2, 6.9],
      iso: ['AUTO'],
      shutter: [],
      mic: false,
      headphones: false,
      manual: false,
      focus: false,
      nd: false,
      slots: 1,
      batteryAccess: 'door',
      sharedCardBatteryDoor: true,
    },
    hcx1600: {
      modes: ['AUTO', 'MANU'],
      qualities: ['4K 60p', '4K 30p', 'FHD 60p', 'FHD 30p'],
      zoom: [1, 24],
      fstop: [1.9, 11],
      iso,
      shutter,
      mic: true,
      headphones: true,
      manual: true,
      focus: true,
      nd: true,
      slots: 2,
      batteryAccess: 'clip',
    },
    phone: {
      modes: ['PHOTO', 'VIDEO'],
      qualities: ['HD 30p', 'HD 60p', '4K 30p', '4K 60p'],
      zoom: [0.5, 6],
      fstop: [1.8, 1.8],
      iso: ['AUTO'],
      shutter: [],
      mic: false,
      headphones: false,
      manual: false,
      focus: true,
      nd: false,
      slots: 1,
      batteryAccess: 'internal',
    },
  };
  const soundModel = {
    camera: { low: -4, clipped: 5, good: 'p5-distance-far' },
    wireless: { low: -8, clipped: 2, good: 'p5-distance-lav-close' },
    shotgun: { low: -6, clipped: 4, good: 'p5-distance-shotgun-middle' },
  };
  T.cameraScenes = {
    'note-library': {
      kind: 'drawn',
      standin: true,
      layers: [
        { id: 'mug', d: 0.8 },
        { id: 'reader', d: 2, subject: true },
        { id: 'shelves', d: 7 },
      ],
      light: { kelvin: 3200, correct: { iso: 400, shutter: 60, fstop: 4 }, highlights: 1.5 },
      action: { length: 12, events: { enter: 2, sit: 4.5, noteFalls: 8, crossing: 6 } },
      sound: { mics: soundModel, bed: 'p5-noise-ac' },
      alt: 'A reader enters the library, sits and opens a book. A note falls. A mug is near the lens and shelves are behind.',
    },
    'interview-window': {
      kind: 'drawn',
      standin: true,
      layers: [
        { id: 'reader', d: 2, subject: true },
        { id: 'window', d: 6 },
        { id: 'wall', d: 7 },
      ],
      light: { kelvin: 3200, correct: { iso: 400, shutter: 60, fstop: 4 }, highlights: 2.5 },
      action: { length: 10, events: { lineStarts: 1, loudest: 3, crossing: 6, lineEnds: 7 } },
      sound: { mics: soundModel, bed: 'p5-noise-ac' },
      alt: 'An interview under a warm lamp beside a bright window. A person in white crosses during the line.',
    },
    'ball-toss': {
      kind: 'drawn',
      standin: false,
      layers: [
        { id: 'ball', d: 2 },
        { id: 'reader', d: 2, subject: true },
        { id: 'wall', d: 7 },
      ],
      light: { kelvin: 5600, correct: { iso: 400, shutter: 60, fstop: 4 }, highlights: 1 },
      action: { length: 8, events: { toss: 2, peak: 4, catch: 6 } },
      sound: { mics: soundModel, bed: null },
      alt: 'A ball travels between two players. Compare discrete frames and motion blur.',
    },
  };
  const getScene = (id) => T.cameraScenes[id] || T.cameraScenes['note-library'];
  function minimumFstop(body, zoom) {
    if (body === 'g97') return 3.5 + ((zoom - 12) / 48) * 2.1;
    if (body === 'elph180') return 3.2 + ((zoom - 1) / 7) * 3.7;
    if (body === 'hcx1600') return 1.9 + ((zoom - 1) / 23) * 2.6;
    return T.cameraProfiles[body].fstop[0];
  }
  function picture(scene, st, time) {
    const k = st.settings;
    const body = st.body || 'g97';
    const profile = T.cameraProfiles[body];
    const light = scene.light;
    const correct = light.correct;
    const crossing = time >= 5.5 && time <= 7.2;
    let focus = Number(k.focusDistance) || 2;
    if (k.focusMode !== 'MF' && !k.focusLocked) {
      const layer = scene.layers.find((l) => l.id === k.focusOn) || scene.layers.find((l) => l.subject);
      focus = layer.d;
      if (crossing && k.focusOn === 'reader' && scene !== T.cameraScenes['ball-toss']) focus = 0.85;
    }
    let metered = scene === T.cameraScenes['interview-window'] && k.meterOn !== 'reader' ? -1.3 : 0;
    if (crossing && !k.exposureLocked && scene === T.cameraScenes['interview-window']) metered -= 1.1;
    if (k.exposureLocked) metered = Number(k.lockedMeter) || 0;
    const manual = profile.manual && ((st.mode === 'video' && k.exposureMode === 'M') || st.mode === 'MANU');
    const fstop = Math.max(minimumFstop(body, k.zoom), Number(k.fstop));
    const nd = body === 'hcx1600' ? Number(k.nd) || 0 : 0;
    let effectiveISO =
      body === 'hcx1600'
        ? correct.iso * Math.pow(2, (Number(k.videoGain) || 0) / 6)
        : Number(k.iso) || correct.iso;
    let stops;
    if (manual) {
      if (k.iso === 'AUTO' && body !== 'hcx1600')
        effectiveISO = clamp(
          correct.iso *
            (k.shutter / correct.shutter) *
            Math.pow(fstop / correct.fstop, 2) *
            Math.pow(2, nd + k.comp),
          200,
          6400,
        );
      stops =
        Math.log2(effectiveISO / correct.iso) +
        Math.log2(correct.shutter / k.shutter) -
        2 * Math.log2(fstop / correct.fstop) -
        nd;
    } else stops = Number(k.comp) + metered - nd;
    const kelvin =
      k.wb === 'Ach'
        ? k.whiteA || 5600
        : k.wb === 'Bch'
          ? k.whiteB || 5600
          : k.wb === 'AWB'
            ? light.kelvin
            : { daylight: 5600, cloudy: 6500, shade: 7500, incandescent: 3200 }[k.wb] ||
              Number(k.kelvin) ||
              5600;
    const equivalentZoom = body === 'g97' ? k.zoom / 12 : body === 'fz300' ? k.zoom / 25 : k.zoom;
    // Thin-lens teaching approximation; wide/deep aperture keeps multiple depth bands usable.
    const blur = {};
    const sharpLayers = [];
    scene.layers.forEach((layer) => {
      const distanceDifference = Math.abs(1 / layer.d - 1 / focus);
      blur[layer.id] = Math.min(12, (16 / fstop) * Math.pow(equivalentZoom, 1.45) * distanceDifference);
      if (blur[layer.id] <= 0.9) sharpLayers.push(layer.id);
    });
    const nearest = scene.layers.slice().sort((a, b) => blur[a.id] - blur[b.id])[0].id;
    return {
      stops,
      sharp: nearest,
      sharpLayers,
      blur,
      focusDistance: focus,
      castK: kelvin - light.kelvin,
      kelvin,
      clipped: stops + light.highlights > 2.8,
      effectiveISO,
      fstop,
      shutter: manual ? Number(k.shutter) : 60,
      black: !!st.cap,
      smudge: !!st.smudge,
      grain: Math.max(0, Math.log2(effectiveISO / 1600)),
      zoomScale: clamp(1 + Math.log2(Math.max(0.5, equivalentZoom)) * 0.36, 0.75, 2.1),
      motionBlur: 250 / (manual ? Number(k.shutter) : 60),
      manual,
    };
  }
  function sound(scene, st, time) {
    const k = st.settings;
    const mic = k.mic === 'lav' ? 'wireless' : k.mic;
    const rule = scene.sound.mics[mic] || soundModel.camera;
    let level =
      k.slow || (mic === 'wireless' && (!st.txOn || !st.txLinked))
        ? 'none'
        : k.gain <= rule.low
          ? 'low'
          : k.gain >= rule.clipped
            ? 'clipped'
            : 'good';
    const mediaId = level === 'none' || time < 0 ? null : level === 'good' ? rule.good : 'p5-gain-' + level;
    const media = (window.TEXTBOOK_MEDIA || {})[mediaId] || {};
    const mediaTime = mod(Math.max(0, time), media.duration || 6);
    const peaks = media.peaks || [];
    const peak =
      level === 'none'
        ? 0
        : peaks.length
          ? peaks[Math.min(peaks.length - 1, Math.floor(mediaTime * (media.peakRate || 25)))]
          : 0;
    return {
      level,
      monitored: !!k.headphones,
      mediaId,
      mediaTime,
      peak,
      db: peak ? Math.max(-60, 20 * Math.log10(peak)) : -60,
      bedId: level === 'none' ? null : scene.sound.bed,
      bedVolume: mic === 'camera' ? 0.3 : 0.06,
      mic,
    };
  }
  // Merge a played interval with the portions of this take already reviewed.
  // Replaying a few seconds or jumping across an unwatched section must not add credit twice.
  function newlyPlayed(ranges, start, end) {
    let first = 0;
    while (first < ranges.length && ranges[first][1] < start) first++;
    let after = first;
    let previouslyCovered = 0;
    while (after < ranges.length && ranges[after][0] <= end) {
      const [left, right] = ranges[after++];
      start = Math.min(start, left);
      end = Math.max(end, right);
      previouslyCovered += right - left;
    }
    ranges.splice(first, after - first, [start, end]);
    return end - start - previouslyCovered;
  }
  function helpers(t, scene) {
    const samples = () => (t.history.length ? t.history : [t]);
    const watchedRanges = [], audibleRanges = [];
    let listened = 0;
    t.markPlayed = (start, end, soundOn) => {
      t.played = true;
      t.watched += newlyPlayed(watchedRanges, start, end);
      if (soundOn && !t.slow) {
        listened += newlyPlayed(audibleRanges, start, end);
        t.reviewedSound = listened >= t.duration - 0.035;
      }
    };
    t.covers = (firstEvent, lastEvent, pad = 0) => {
      const requiredStart = scene.action.events[firstEvent] - pad;
      const requiredEnd = scene.action.events[lastEvent] + pad;
      if (t.interrupted || !Number.isFinite(requiredStart) || !Number.isFinite(requiredEnd)) return false;

      // A new action call can rewind the scene during the same recording. A take
      // must contain one complete pass; two incomplete passes cannot be joined.
      let segmentStart = null;
      let previous = null;
      for (const frame of samples()) {
        const sceneTime = frame.sceneTime;
        const elapsed = previous ? frame.at - previous.at : 0;
        const discontinuity =
          previous &&
          (sceneTime < previous.sceneTime - 0.001 || sceneTime > previous.sceneTime + elapsed + 0.001);
        if (segmentStart === null || discontinuity) segmentStart = sceneTime;
        if (segmentStart <= requiredStart + 0.001 && sceneTime >= requiredEnd - 0.001) return true;
        previous = frame;
      }
      return false;
    };
    t.sharpOn = (id) =>
      samples().every(
        (x) =>
          x.picture &&
          !x.picture.black &&
          !x.picture.smudge &&
          (x.picture.sharpLayers || [x.picture.sharp]).includes(id),
      );
    t.exposed = (tol = 0.5) =>
      samples().every(
        (x) => x.picture && !x.picture.black && Math.abs(x.picture.stops) <= tol && !x.picture.clipped,
      );
    t.balanced = (tolK = 400) => samples().every((x) => x.picture && Math.abs(x.picture.castK) <= tolK);
    t.heard = () => !t.slow && samples().every((x) => x.sound && x.sound.level === 'good');
    return t;
  }
  T.createCameraEngine = (block = {}, bodyId) => {
    const requestedBody = bodyId || (Array.isArray(block.body) ? block.body[0] : block.body) || 'g97';
    const body = T.cameraProfiles[requestedBody] ? requestedBody : 'g97';
    const profile = T.cameraProfiles[body];
    const sceneId = block.scene || 'note-library';
    const scene = getScene(sceneId);
    const initial = block.start || {};
    const faults = block.faults || [];
    const settings = Object.assign(
      {
        exposureMode: 'P',
        focusMode: 'AFS',
        focusOn: 'reader',
        focusDistance: 2,
        focusLocked: false,
        comp: 0,
        exposureLocked: false,
        lockedMeter: 0,
        meterOn: null,
        iso: 'AUTO',
        shutter: 60,
        fstop: Math.max(4, profile.fstop[0]),
        zoom: body === 'phone' ? 1 : profile.zoom[0],
        quality: body === 'elph180' ? 'HD 25p' : body === 'phone' ? 'HD 30p' : 'FHD 30p',
        fps: body === 'elph180' ? 25 : 30,
        slow: false,
        wb: 'AWB',
        kelvin: 5600,
        mic: 'camera',
        gain: 0,
        levelBars: true,
        headphones: false,
        headphoneVolume: 0.7,
        videoGain: 0,
        highSpeed: 0,
        whiteA: 5600,
        whiteB: 5600,
        zebras: false,
        grid: false,
        redFrame: false,
        airplane: true,
        sideways: body !== 'phone',
        nd: 0,
      },
      initial.settings || {},
    );
    function newCard(card = {}) {
      const minutes = card.minutes === undefined ? 42 : Math.max(0, Number(card.minutes));
      return Object.assign(
        { present: true, minutes, full: false, locked: false, capacity: minutes, takes: [] },
        card,
      );
    }
    const s = {
      body,
      scene: sceneId,
      level: block.level || 1,
      clock: 0,
      sceneTime: -3,
      awaitingAction: !!block.callAction,
      power: initial.power !== undefined ? initial.power : true,
      cap: !!initial.cap,
      battery: initial.battery === undefined ? 0.9 : initial.battery,
      card: newCard(initial.card),
      mode:
        initial.mode ||
        (body === 'hcx1600' ? 'AUTO' : body === 'phone' ? 'VIDEO' : body === 'elph180' ? 'Auto' : 'iA'),
      display: Object.assign(
        { on: 'monitor', readouts: true, open: true, asleep: false },
        initial.display || {},
      ),
      settings,
      photos: 0,
      picture: {},
      sound: {},
      takes: [],
      last: null,
      events: [],
      recording: null,
      playback: { open: false, index: 0, playing: false, time: 0, speed: 1, soundOn: true },
      message: 'Camera ready.',
      cardDoor: false,
      batteryDoor: false,
      batteryReleased: false,
      smudge: !!initial.smudge,
      txOn: initial.txOn !== false,
      txLinked: initial.txOn !== false,
      slate: null,
      whiteCard: false,
      menu: null,
      slot: 1,
      deleted: [],
    };
    let epoch = 3;
    let takeNumber = 0;
    let lowUsed = 0;
    let linkAt = 0;
    let lastInteraction = 0;
    let awaitingAction = !!block.callAction;
    let removedCard = null;
    s.cards = [s.card, newCard({ present: false })];
    function log(type, detail) {
      const event = Object.assign({ type, at: s.clock, sceneTime: s.sceneTime }, detail || {});
      s.events.push(event);
      return event;
    }
    s.did = (type, test) => s.events.some((e) => e.type === type && (!test || test(e)));
    const fixed = {
      cap: () => !s.cap,
      'lens-cover': () => !s.cap,
      'battery-low': () => s.battery > 0.2,
      'battery-flat': () => s.battery > 0,
      'no-card': () => s.card.present,
      'card-full': () => s.card.present && s.card.minutes > 0 && !s.card.full,
      'card-locked': () => s.card.present && !s.card.locked,
      smudge: () => !s.smudge,
      'mic-unplugged': () => s.settings.mic === 'wireless',
      'mic-tx-off': () => s.txOn && s.txLinked,
      'meter-hidden': () => s.settings.levelBars,
      asleep: () => !s.display.asleep,
      'monitor-off': () => s.display.on === 'monitor',
      'monitor-closed': () => s.display.open,
      viewfinder: () => s.display.on === 'monitor',
      'readouts-off': () => s.display.readouts,
      'wrong-mode': () => s.mode === 'video' || s.mode === 'MANU',
      'airplane-off': () => s.settings.airplane,
      upright: () => s.settings.sideways,
      'photo-mode': () => s.mode === 'VIDEO',
      'nd-wrong': () => s.settings.nd === 0,
      slot: () => s.card.present,
    };
    s.fixed = (id) => faults.includes(id) && !!(fixed[id] && fixed[id]());
    faults.forEach((f) => {
      if (f === 'cap' || f === 'lens-cover') s.cap = true;
      if (f === 'battery-low') s.battery = 0.04;
      if (f === 'battery-flat') {
        s.battery = 0;
        s.power = false;
      }
      if (f === 'no-card') s.card.present = false;
      if (f === 'slot' && profile.slots === 2) {
        // The card stays in slot 1. The operator has selected the empty slot 2.
        s.slot = 2;
        selectCard(s.cards[1]);
      }
      if (f === 'card-full') {
        s.card.minutes = 0;
        s.card.full = true;
      }
      if (f === 'card-locked') s.card.locked = true;
      if (f === 'smudge') s.smudge = true;
      if (f === 'mic-unplugged') settings.mic = 'camera';
      if (f === 'mic-tx-off' && profile.mic) {
        settings.mic = 'wireless';
        s.txOn = s.txLinked = false;
      }
      if (f === 'meter-hidden') settings.levelBars = false;
      if (f === 'asleep') s.display.asleep = true;
      if (f === 'monitor-off') s.display.on = 'off';
      if (f === 'monitor-closed') s.display.open = false;
      if (f === 'viewfinder') s.display.on = 'viewfinder';
      if (f === 'readouts-off') s.display.readouts = false;
      if (f === 'wrong-mode') s.mode = profile.modes[0];
      if (f === 'airplane-off') settings.airplane = false;
      if (f === 'upright') settings.sideways = false;
      if (f === 'photo-mode') s.mode = 'PHOTO';
      if (f === 'nd-wrong') settings.nd = 6;
    });
    if (initial.card && initial.card.full) s.card.minutes = 0;
    function refresh() {
      if (body === 'fz300') settings.levelBars = true;
      s.picture = picture(scene, s, s.sceneTime);
      s.sound = sound(scene, s, s.sceneTime);
      s.card.full = s.card.minutes <= 0;
    }
    function visibleSlate() {
      if (!s.recording || s.clock - s.recording.clockStart >= 2) return null;
      return s.recording.slate;
    }
    function snapshot() {
      return {
        at: s.recording ? s.clock - s.recording.clockStart : 0,
        sceneTime: s.sceneTime,
        sceneRunning: !awaitingAction && s.power && !s.playback.open,
        body,
        mode: s.mode,
        cap: s.cap,
        smudge: s.smudge,
        whiteCard: s.whiteCard,
        visibleSlate: copy(visibleSlate()),
        txOn: s.txOn,
        txLinked: s.txLinked,
        settings: copy(settings),
        picture: copy(s.picture),
        sound: copy(s.sound),
      };
    }
    function sample() {
      if (!s.recording) return;
      const frame = snapshot();
      s.recording.history.push(frame);
      s.recording.focusHistory.push({
        at: frame.at,
        target: settings.focusOn,
        distance: frame.picture.focusDistance,
        sharp: frame.picture.sharp,
        sharpLayers: frame.picture.sharpLayers.slice(),
      });
    }
    function resetPlayback(index = s.playback.index) {
      s.playback.index = index;
      s.playback.time = 0;
      s.playback.playing = false;
    }
    function selectCard(card) {
      s.card = card;
      s.cards[s.slot - 1] = card;
      s.takes = card.present ? card.takes : [];
      s.last = s.takes[s.takes.length - 1] || null;
      resetPlayback(Math.max(0, s.takes.length - 1));
    }
    function finish(reason, lost) {
      if (!s.recording) return false;
      sample();
      const take = s.recording;
      take.end = s.sceneTime;
      take.length = s.clock - take.clockStart;
      take.duration = take.length * take.slowFactor;
      take.interrupted = reason || null;
      s.recording = null;
      log('stop', { n: take.n, reason: reason || null, lost: !!lost });
      if (lost) {
        s.message = 'Card door opened during recording. The take was lost.';
        return true;
      }
      if (take.length < 0.05) return fail('Take too short to save.');
      s.takes.push(take);
      s.card.takes = s.takes;
      s.last = take;
      s.playback.index = s.takes.length - 1;
      s.message = 'Take ' + take.n + ' saved, ' + take.length.toFixed(1) + ' seconds.';
      if (reason) s.message += ' Interrupted: ' + reason + '.';
      return true;
    }
    function record() {
      if (s.recording) return finish();
      if (!s.power) return fail('Turn the camera on first.');
      if (s.display.asleep) return fail('Camera asleep. Half-press the shutter button to wake it.');
      if (s.battery <= 0 || s.batteryDoor || s.batteryReleased)
        return fail(
          profile.batteryAccess === 'clip'
            ? 'Fit and latch a charged battery.'
            : 'Insert a charged battery and close its door.',
        );
      if (s.cardDoor) return fail('Close the card door first.');
      if (!s.card.present) return fail('No card. Insert a memory card.');
      if (s.card.locked) return fail('Card locked. Remove it and unlock its switch.');
      if (s.card.full || s.card.minutes <= 0)
        return fail('Card full. Swap the card or format it after checking the takes.');
      if (body === 'phone' && s.mode === 'PHOTO') {
        s.photos++;
        log('photo');
        return fail('Photo taken. Select VIDEO to record a take.');
      }
      s.playback.open = false;
      s.playback.playing = false;
      s.menu = null;
      s.display.asleep = false;
      const firstFrame = snapshot();
      s.recording = helpers(
        Object.assign(
          {
            n: ++takeNumber,
            start: s.sceneTime,
            end: s.sceneTime,
            length: 0,
            duration: 0,
            clockStart: s.clock,
            slate: s.slate ? copy(s.slate) : null,
            played: false,
            reviewed: false,
            reviewedSound: false,
            watched: 0,
            interrupted: null,
            slow: !!settings.slow,
            slowFactor: settings.highSpeed ? settings.highSpeed / 30 : settings.slow ? 2 : 1,
            history: [],
            focusHistory: [],
          },
          firstFrame,
        ),
        scene,
      );
      sample();
      log('record', { n: takeNumber });
      s.message = 'Recording. Watch the running time and red dot.';
      return true;
    }
    function fail(message) {
      s.message = message;
      return false;
    }
    const setBool = (obj, key, value) => {
      obj[key] = value === undefined ? !obj[key] : !!value;
    };
    function setSetting(key, value) {
      if (!(key in settings)) return fail('That setting is not available.');
      const manualKeys = ['iso', 'shutter', 'fstop', 'videoGain'];
      if (
        manualKeys.includes(key) &&
        (!profile.manual || !((s.mode === 'video' && settings.exposureMode === 'M') || s.mode === 'MANU'))
      )
        return fail('Use Creative Video with Exposure Mode M, or MANU on the camcorder, for this setting.');
      if (s.recording && ['quality', 'fps', 'slow', 'highSpeed', 'exposureMode'].includes(key))
        return fail('Stop recording before changing this recording mode.');
      if (key === 'exposureMode' && (!profile.manual || (s.mode !== 'video' && s.mode !== 'MANU')))
        return fail('Select Creative Video or MANU first.');
      if (key === 'focusMode' && !profile.focus) return fail('This camera uses automatic focus.');
      if (key === 'headphones' && !profile.headphones)
        return fail('This body has no headphone socket. Check sound during playback.');
      if (key === 'mic' && value !== 'camera' && !profile.mic)
        return fail('This body has no external microphone socket.');
      if (key === 'nd' && !profile.nd) return fail('This body has no built-in ND switch.');
      if (key === 'slow' && body !== 'g97') return fail('This practice body does not offer S&Q.');
      if (key === 'comp') value = clamp(value, body === 'elph180' ? -2 : -3, body === 'elph180' ? 2 : 3);
      if (key === 'videoGain') {
        if (body !== 'hcx1600') return fail('Video GAIN is a camcorder control.');
        value = Math.round(clamp(value, 0, 30) / 3) * 3;
      }
      if (key === 'highSpeed') {
        if (body !== 'fz300' || s.mode !== 'video' || ![0, 120, 240].includes(Number(value)))
          return fail('High Speed Video is available in Creative Video on this body.');
        value = Number(value);
        settings.slow = !!value;
        settings.fps = value || 30;
        settings.quality = value === 120 ? 'HD 120p' : value === 240 ? 'VGA 240p' : 'FHD 30p';
      }
      if (key === 'levelBars' && body === 'fz300') {
        settings.levelBars = true;
        return fail('Mic Level Disp. stays on with the limiter off.');
      }
      if (key === 'gain') value = Math.round(clamp(value, -12, 6));
      if (key === 'kelvin') value = Math.round(clamp(value, 2500, 10000));
      if (key === 'zoom') value = clamp(value, profile.zoom[0], profile.zoom[1]);
      if (key === 'focusDistance') {
        if (settings.focusMode !== 'MF') return fail('Select MF before turning the focus ring.');
        value = clamp(value, 0.5, 50);
      }
      if (key === 'fstop') value = clamp(value, minimumFstop(body, settings.zoom), profile.fstop[1]);
      if (key === 'iso' && !profile.iso.some((x) => String(x) === String(value)))
        return fail('That ISO is not available.');
      if (key === 'shutter' && !profile.shutter.includes(Number(value)))
        return fail('That shutter speed is not available.');
      if (key === 'quality' && (settings.highSpeed || s.mode === 'SQ'))
        return fail('Leave slow or high-speed mode to change Rec Quality.');
      if (key === 'quality') {
        if (!profile.qualities.includes(value))
          return fail('That recording quality is not available on this body.');
        settings.fps = Number(value.match(/(\d+)p/)[1]);
      }
      if (key === 'nd') {
        value = Number(value);
        if (![0, 2, 4, 6].includes(value)) return fail('ND positions are CLR, 1/4, 1/16 and 1/64.');
      }
      if (key === 'mic') {
        if (value === 'lav') value = 'wireless';
        if (!['camera', 'wireless', 'shotgun'].includes(value))
          return fail('Choose a microphone from the kit.');
        if (value !== 'camera') settings.levelBars = true;
      }
      if (key === 'wb' && ['Ach', 'Bch'].includes(value) && body !== 'hcx1600')
        return fail('White balance channels are a camcorder control.');
      if (
        key === 'wb' &&
        ![
          'AWB',
          'daylight',
          'cloudy',
          'shade',
          'incandescent',
          'white',
          'whiteSet',
          'kelvin',
          'Ach',
          'Bch',
        ].includes(value)
      )
        return fail('Choose an available white balance setting.');
      if (key === 'focusMode' && !['AFS', 'AFS/AFF', 'AFC', 'MF', 'AF'].includes(value))
        return fail('Choose an available focus mode.');
      if (key === 'exposureMode' && !['P', 'M'].includes(value))
        return fail('Choose P or M for Exposure Mode.');
      if (typeof settings[key] === 'boolean') value = value === undefined ? !settings[key] : !!value;
      settings[key] = value;
      if (key === 'zoom') settings.fstop = Math.max(settings.fstop, minimumFstop(body, value));
      if (key === 'kelvin') settings.wb = 'kelvin';
      if (key === 'focusDistance') {
        const nearestLayer = scene.layers
          .slice()
          .sort((a, b) => Math.abs(a.d - value) - Math.abs(b.d - value))[0];
        settings.focusOn = nearestLayer.id;
        log('focus', { target: settings.focusOn, distance: value, manual: true });
      }
      log('setting', { key, value });
      log('dial', { key, value });
      s.message = key + ': ' + value + '.';
      return true;
    }
    function act(action, value) {
      let ok = true;
      lastInteraction = s.clock;
      if (action === 'power') {
        const turningOn = value === undefined ? !s.power : !!value;
        if (turningOn && (s.battery <= 0 || s.batteryDoor || s.batteryReleased)) {
          return fail(
            profile.batteryAccess === 'clip'
              ? 'Fit and latch a charged battery.'
              : 'Fit a charged battery and close its door.',
          );
        }
        if (!turningOn) finish('power off');
        s.power = turningOn;
        s.playback.playing = false;
        s.message = s.power ? 'Camera on.' : 'Camera off.';
        log('power', { on: s.power });
      } else if (action === 'cap') {
        setBool(s, 'cap', value);
        s.message = s.cap ? 'Lens cap on.' : 'Lens uncovered.';
        log('cap', { on: s.cap });
      } else if (action === 'record') {
        ok = record();
      } else if (action === 'stop') {
        if (s.recording) ok = finish();
        else {
          resetPlayback();
          s.message = 'Playback stopped.';
        }
      } else if (action === 'halfPress') {
        if (!s.power) return fail('Turn the camera on.');
        s.display.asleep = false;
        s.playback.open = false;
        s.playback.playing = false;
        s.menu = null;
        log('wake');
        if (settings.focusMode !== 'MF') {
          const target = scene.layers.find((layer) => layer.id === settings.focusOn) || scene.layers[1];
          settings.focusDistance = target.d;
          log('focus', { target: settings.focusOn, distance: settings.focusDistance });
        }
        s.message = 'Focused. Ready to record.';
      } else if (action === 'shutter' && value === undefined) {
        if (['video', 'SQ', 'VIDEO', 'MANU', 'AUTO'].includes(s.mode) && body !== 'elph180') ok = record();
        else if (s.power) {
          s.photos++;
          log('photo');
          s.message = 'Photo taken. Use the motion picture button for a take.';
        }
      } else if (action === 'mode') {
        if (s.recording) return fail('Stop recording before changing mode.');
        if (body === 'phone') value = String(value).toUpperCase();
        if (!profile.modes.includes(value)) return fail('Not used in this lesson.');
        const wasHighSpeed = !!settings.highSpeed;
        s.mode = value;
        settings.highSpeed = 0;
        settings.slow = value === 'SQ';
        if (settings.slow) {
          settings.fps = 60;
          settings.quality = 'FHD 60p';
        } else if (wasHighSpeed) {
          settings.fps = 30;
          settings.quality = 'FHD 30p';
        }
        log('dial', { key: 'mode', value });
        s.message = 'Mode: ' + value + '.';
      } else if (action === 'focus') {
        const layer = scene.layers.find((candidate) => candidate.id === value);
        if (!layer) return fail('Choose a visible focus target.');
        settings.focusOn = value;
        settings.focusDistance = layer.d;
        settings.meterOn = value;
        settings.focusLocked = false;
        settings.exposureLocked = false;
        log('focus', { target: value, distance: layer.d, manual: settings.focusMode === 'MF' });
        s.message = 'Focused on ' + value + '.';
      } else if (action === 'lock') {
        if (!profile.focus) return fail('This camera uses automatic focus.');
        refresh();
        const locking = value === undefined ? !settings.focusLocked : !!value;
        if (locking) {
          settings.focusDistance = s.picture.focusDistance;
          settings.lockedMeter = s.picture.stops - settings.comp;
        }
        settings.focusLocked = locking;
        settings.exposureLocked = locking;
        log('lock', { locked: locking, target: settings.focusOn });
        s.message = locking ? 'Focus and exposure locked.' : 'Focus and exposure unlocked.';
      } else if (action === 'display') {
        if (s.display.on === 'off') {
          s.display.on = 'monitor';
          s.display.readouts = true;
        } else if (s.display.readouts) s.display.readouts = false;
        else s.display.on = 'off';
        log('display');
        s.message =
          s.display.on === 'off'
            ? 'Monitor off.'
            : s.display.readouts
              ? 'Monitor and readouts on.'
              : 'Readouts off.';
      } else if (action === 'lvf') {
        s.display.on = s.display.on === 'viewfinder' ? 'monitor' : 'viewfinder';
        log('display');
        s.message = s.display.on === 'monitor' ? 'Monitor selected.' : 'Viewfinder selected.';
      } else if (action === 'monitor') {
        setBool(s.display, 'open', value);
        s.message = s.display.open ? 'Monitor opened.' : 'Monitor closed.';
      } else if (action === 'playback') {
        if (s.recording) return fail('Stop recording before playback.');
        if (!s.power) return fail('Turn the camera on first.');
        setBool(s.playback, 'open', value);
        resetPlayback();
        s.message = s.takes.length ? 'Choose a take, then play it.' : 'No takes on this card.';
      } else if (action === 'play') {
        if (!s.power || s.recording) return fail('Stop recording with the camera on before playback.');
        const take = s.takes[s.playback.index];
        if (!take) return fail('No take selected.');
        s.playback.open = true;
        if (s.playback.time >= take.duration) s.playback.time = 0;
        setBool(s.playback, 'playing', value);
        s.playback.speed = 1;
        log('play', { n: take.n, sound: s.playback.soundOn });
        s.message = s.playback.playing ? 'Playing take ' + take.n + '.' : 'Playback paused.';
      } else if (action === 'pause') {
        s.playback.playing = false;
      } else if (action === 'seek' || action === 'step') {
        const take = s.takes[s.playback.index];
        if (take) {
          const frameDuration = take.slowFactor / (take.settings.fps || 30);
          const nextTime = action === 'seek' ? value : s.playback.time + (Number(value) || 1) * frameDuration;
          s.playback.time = clamp(nextTime, 0, take.duration);
          s.playback.playing = false;
        }
      } else if (action === 'nextTake' || action === 'selectTake') {
        const nextIndex = action === 'selectTake' ? value : s.playback.index + (Number(value) || 1);
        resetPlayback(clamp(nextIndex, 0, Math.max(0, s.takes.length - 1)));
        s.message = s.takes.length ? 'Take ' + s.takes[s.playback.index].n + ' selected.' : 'No takes.';
      } else if (action === 'playbackSound') {
        setBool(s.playback, 'soundOn', value);
      } else if (action === 'speed') {
        s.playback.speed = clamp(value, -4, 4);
      } else if (action === 'delete') {
        const index = value === undefined ? s.playback.index : Number(value);
        const take = s.takes[index];
        if (!take || s.recording || s.card.locked) return fail('That take cannot be deleted now.');
        s.deleted.push(take);
        const recoveredMinutes = (take.length / 60) * (take.settings.quality.startsWith('4K') ? 5 : 1);
        s.card.minutes = Math.min(s.card.capacity, s.card.minutes + recoveredMinutes);
        s.takes.splice(index, 1);
        s.last = s.takes[s.takes.length - 1] || null;
        resetPlayback(Math.max(0, Math.min(index, s.takes.length - 1)));
        log('delete', { n: take.n, played: take.played, reviewed: take.reviewed });
        s.message = 'Take ' + take.n + ' deleted.';
      } else if (action === 'format') {
        if (!s.card.present || s.card.locked || s.recording)
          return fail('A writable card is required, with recording stopped.');
        s.card.takes = [];
        s.card.minutes = s.card.capacity;
        s.card.full = false;
        selectCard(s.card);
        log('format');
        s.message = 'Card formatted. All takes on this card removed.';
      } else if (action === 'cardDoor') {
        if (profile.batteryAccess === 'internal')
          return fail('This phone uses internal storage, with no card door.');
        const open = value === undefined ? !s.cardDoor : !!value;
        if (open && profile.sharedCardBatteryDoor && s.power)
          return fail('Turn the camera off before opening the shared card / battery door.');
        if (open && s.recording) finish('card door', true);
        s.cardDoor = open;
        if (profile.sharedCardBatteryDoor) s.batteryDoor = open;
        s.message = open ? 'Card door open.' : 'Card door closed.';
      } else if (action === 'batteryDoor' || action === 'batteryRelease') {
        if (profile.batteryAccess === 'internal') return fail('This phone has an internal battery.');
        if (s.power) return fail('Turn the camera off before changing the battery.');
        if (profile.batteryAccess === 'clip') {
          // The camcorder has a rear clip battery, not a bottom battery door.
          setBool(s, 'batteryReleased', value);
          s.message = s.batteryReleased
            ? 'Battery clip released. Fit the charged battery.'
            : 'Battery clip latched.';
        } else {
          if (action === 'batteryRelease')
            return fail('Open this camera’s battery door to change the battery.');
          setBool(s, 'batteryDoor', value);
          if (profile.sharedCardBatteryDoor) s.cardDoor = s.batteryDoor;
          s.message = s.batteryDoor ? 'Battery door open.' : 'Battery door closed.';
        }
      } else if (action === 'battery') {
        if (profile.batteryAccess === 'internal') return fail('This phone has an internal battery.');
        if (s.power) return fail('Turn the camera off before changing the battery.');
        if (profile.batteryAccess === 'clip') {
          if (!s.batteryReleased) return fail('Release the rear battery clip first.');
          s.batteryReleased = false;
          s.message = 'Charged battery fitted and latched.';
        } else {
          if (!s.batteryDoor) return fail('Open the battery door first.');
          s.message = 'Battery fitted. Close the battery door.';
        }
        s.battery = clamp(value === undefined ? 1 : value, 0, 1);
        lowUsed = 0;
        log('swap', { item: 'battery' });
      } else if (action === 'card') {
        if (profile.batteryAccess === 'internal')
          return fail('This phone uses internal storage, with no removable card.');
        if (!s.cardDoor || s.recording) return fail('Open the card door with recording stopped.');
        if (value === false) {
          if (!s.card.present) return fail('This slot is already empty.');
          s.card.takes = s.takes;
          removedCard = s.card;
          selectCard(newCard({ present: false, minutes: 0 }));
          s.message = 'Card removed. Its lock switch can now be changed.';
        } else if (value === true) {
          if (!removedCard) return fail('No removed card is available. Choose an empty card from the kit.');
          removedCard.present = true;
          selectCard(removedCard);
          removedCard = null;
          s.message = 'Card reinserted. Close the card door.';
        } else {
          selectCard(newCard(typeof value === 'object' ? value : {}));
          s.message = 'Card inserted. Close the card door.';
        }
        log('swap', { item: 'card', inserted: value !== false });
      } else if (action === 'cardLock') {
        if (s.card.present || !removedCard) return fail('Remove the card before moving its lock switch.');
        removedCard.locked = !!value;
        log('cardLock', { locked: removedCard.locked });
        s.message = removedCard.locked ? 'Card locked.' : 'Card unlocked. Reinsert it.';
      } else if (action === 'slot') {
        if (profile.slots < 2 || s.recording)
          return fail('Slot selection is available on the camcorder with recording stopped.');
        const slot = Number(value) || (s.slot === 1 ? 2 : 1);
        if (![1, 2].includes(slot)) return false;
        s.card.takes = s.takes;
        s.slot = slot;
        selectCard(s.cards[slot - 1]);
        log('slot', { slot });
        s.message = 'Card slot ' + slot + ' selected.';
      } else if (action === 'transmitter') {
        setBool(s, 'txOn', value);
        s.txLinked = false;
        linkAt = s.clock + 1;
        s.message = s.txOn ? 'Transmitter on. Linking to receiver.' : 'Transmitter off. No wireless sound.';
      } else if (action === 'wipe') {
        s.smudge = false;
        log('wipe');
        s.message = 'Lens cleaned.';
      } else if (action === 'whiteCard') {
        setBool(s, 'whiteCard', value);
        s.message = s.whiteCard ? 'White card fills the centre frame.' : 'White card removed.';
      } else if (action === 'whiteSet') {
        if (!s.whiteCard) return fail('Hold the white card in the centre frame first.');
        if (body === 'hcx1600' && settings.wb === 'Ach') settings.whiteA = scene.light.kelvin;
        else if (body === 'hcx1600' && settings.wb === 'Bch') settings.whiteB = scene.light.kelvin;
        else settings.wb = 'white';
        settings.kelvin = scene.light.kelvin;
        log('whiteSet', { kelvin: settings.kelvin });
        s.message = 'White balance measured from the card.';
      } else if (action === 'slate') {
        s.slate = value
          ? {
              shot: String(value.shot || 'S04'),
              take: Math.max(1, Math.round(Number(value.take) || 1)),
            }
          : null;
        log('slate', s.slate);
        s.message = s.slate
          ? 'Slate ready: ' + s.slate.shot + ', take ' + s.slate.take + '.'
          : 'Slate removed.';
      } else if (action === 'callAction') {
        awaitingAction = false;
        s.awaitingAction = false;
        if (s.recording) {
          const preRoll = s.clock - s.recording.clockStart;
          epoch = s.clock;
          s.sceneTime = 0;
          // Earlier frames retain their actual held or running scene times.
          log('action', { preRoll });
          s.message = 'Action. Keep rolling through the full move.';
        } else {
          epoch = s.clock + 3;
          s.sceneTime = -3;
          log('action', { preRoll: 0 });
          s.message = 'Action starts in 3 seconds. Start recording now.';
        }
      } else if (action === 'rotate') {
        ok = setSetting('sideways', value === undefined ? !settings.sideways : value);
      } else if (action === 'menu') {
        s.menu = value || null;
        log('menu', { menu: s.menu });
        s.message = s.menu ? 'Menu: ' + s.menu + '.' : 'Menu closed.';
      } else if (action === 'setting') {
        ok = setSetting(value.key, value.value);
      } else if (action in settings) {
        ok = setSetting(action, value);
      } else return fail('Not used in this lesson.');
      refresh();
      if (s.recording) sample();
      return ok;
    }
    function tick(seconds) {
      let remaining = Math.max(0, Number(seconds) || 0);
      while (remaining > 0.000001) {
        const delta = Math.min(0.1, remaining);
        remaining -= delta;
        s.clock += delta;
        const idle = !s.recording && !s.playback.open;
        if (body === 'g97' && s.power && idle && s.clock - lastInteraction >= (block.sleepAfter || 180)) {
          s.display.asleep = true;
        }
        if (s.txOn && !s.txLinked && s.clock >= linkAt) {
          s.txLinked = true;
          s.message = 'Wireless transmitter linked.';
        }
        if (!s.power || s.playback.open) epoch += delta;
        else {
          if (awaitingAction) epoch += delta;
          s.sceneTime = s.clock - epoch;
          if (!s.recording && s.sceneTime > scene.action.length) {
            epoch += scene.action.length + 3;
            s.sceneTime = s.clock - epoch;
          }
          s.battery = Math.max(0, s.battery - delta / 7200);
        }
        if (s.recording) {
          s.recording.length = s.clock - s.recording.clockStart;
          const cardRate = settings.quality.startsWith('4K') ? 5 : 1;
          s.card.minutes = Math.max(0, s.card.minutes - (delta / 60) * cardRate);
          refresh();
          sample();
          if (s.battery < 0.1) lowUsed += delta;
          const lowBatteryExpired =
            faults.includes('battery-low') && lowUsed >= (initial.dies || block.dies || 5);
          if (s.battery <= 0 || lowBatteryExpired) {
            finish('battery empty');
            s.battery = 0;
            s.power = false;
          } else if (s.card.minutes <= 0) finish('card full');
          else if (body === 'phone' && !settings.airplane && s.recording.length >= (block.callAt || 4)) {
            finish('incoming call');
          }
        }
        const playback = s.playback;
        const take = s.takes[playback.index];
        if (s.power && playback.open && playback.playing && take) {
          const previousTime = playback.time;
          playback.time = clamp(playback.time + delta * playback.speed, 0, take.duration);
          if (playback.time > previousTime) {
            take.markPlayed(previousTime, playback.time, playback.soundOn && playback.speed === 1);
          }
          if (playback.time >= take.duration - 0.00001) {
            playback.time = take.duration;
            playback.playing = false;
            take.reviewed = take.watched >= take.duration - 0.035;
            log('review', { n: take.n, complete: take.reviewed, sound: take.reviewedSound });
            s.message = 'End of take ' + take.n + '.';
          }
          if (playback.time <= 0 && playback.speed < 0) playback.playing = false;
        }
      }
      refresh();
      return s;
    }
    function frame() {
      const playback = s.playback;
      const take = playback.open ? s.takes[playback.index] : null;
      let frameState = s;
      let sceneTime = s.sceneTime;
      let slate = visibleSlate();

      if (take) {
        const sourceTime = playback.time / take.slowFactor;
        const recordedFrame = take.history.reduce(
          (selected, candidate) => (candidate.at <= sourceTime + 0.00001 ? candidate : selected),
          take.history[0] || take,
        );
        const sinceSample = Math.max(0, sourceTime - recordedFrame.at);
        sceneTime = recordedFrame.sceneTime + (recordedFrame.sceneRunning ? sinceSample : 0);
        slate = recordedFrame.visibleSlate;
        frameState = Object.assign({}, recordedFrame, {
          // The current monitor can be off; its cap/white card and all picture
          // settings still come from the recorded frame, never the live camera.
          power: s.power,
          display: s.display,
        });
      }

      const framePicture = take ? picture(scene, frameState, sceneTime) : s.picture;
      const frameSound = take ? sound(scene, frameState, sceneTime) : s.sound;
      return {
        svg: T.cameraFrame(sceneId, Object.assign({}, frameState, { picture: framePicture }), sceneTime, {
          slate,
        }),
        time: sceneTime,
        settings: frameState.settings,
        picture: framePicture,
        whiteCard: !!frameState.whiteCard,
        slate,
        sound: Object.assign({}, frameSound, {
          audible: !!s.power && (take ? playback.playing && playback.soundOn : settings.headphones),
          monitored: take ? playback.soundOn : frameSound.monitored,
        }),
        take,
        playback: !!take,
        duration: take ? take.duration : 0,
      };
    }
    refresh();
    (block.seedTakes || []).forEach((seed) => {
      const start = Number(seed.start) || 0,
        end = seed.end === undefined ? scene.action.length : Number(seed.end),
        base = Object.assign({}, settings, seed.settings || {});
      if (seed.slow) base.slow = true;
      takeNumber = Math.max(takeNumber + 1, Number(seed.n) || 0);
      const slowFactor =
        seed.slowFactor || (base.highSpeed ? base.highSpeed / 30 : seed.slow || base.slow ? 2 : 1);
      const t = helpers(
        {
          n: takeNumber,
          id: seed.id,
          start,
          end,
          length: end - start,
          duration: (end - start) * slowFactor,
          slowFactor,
          clockStart: 0,
          slate: seed.slate || null,
          played: false,
          reviewed: false,
          reviewedSound: false,
          watched: 0,
          interrupted: seed.interrupted || null,
          slow: !!(seed.slow || base.slow),
          settings: base,
          history: [],
          focusHistory: [],
          body,
          mode: seed.mode || s.mode,
        },
        scene,
      );
      for (let at = 0; at <= t.length + 0.001; at = Math.round((at + 0.1) * 1000) / 1000) {
        const changes = (seed.samples || [])
          .filter((x) => x.at <= at)
          .reduce((k, x) => Object.assign(k, x.settings || {}), Object.assign({}, base));
        const st = {
          body,
          mode: t.mode,
          settings: changes,
          cap: !!seed.cap,
          smudge: !!seed.smudge,
          whiteCard: !!seed.whiteCard,
          visibleSlate: at < 2 ? t.slate : null,
          sceneRunning: true,
          txOn: seed.txOn !== false,
          txLinked: seed.txOn !== false,
        };
        const snap = Object.assign({ at, sceneTime: start + at }, st, {
          picture: picture(scene, st, start + at),
          sound: sound(scene, st, start + at),
        });
        t.history.push(snap);
        t.focusHistory.push({
          at,
          target: changes.focusOn,
          distance: snap.picture.focusDistance,
          sharp: snap.picture.sharp,
          sharpLayers: snap.picture.sharpLayers,
        });
      }
      t.picture = copy(t.history[0].picture);
      t.sound = copy(t.history[0].sound);
      s.takes.push(t);
      s.last = t;
    });
    s.card.takes = s.takes;
    return { s, act, tick, frame, profile, scene };
  };

  // Drawn scene layers remain independently blurred. No remote fonts, photos, or pixel reads.
  let frameId = 0;
  const esc = (text) =>
    String(text).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const person = (x, y, scale, colour, seated, time) =>
    '<g transform="translate(' +
    x +
    ' ' +
    y +
    ') scale(' +
    scale +
    ')"><path d="M-19 44 L-22 ' +
    (seated ? 70 : 100) +
    ' M19 44 L' +
    (seated ? 36 : 22) +
    ' ' +
    (seated ? 70 : 100) +
    '" stroke="#303744" stroke-width="15" stroke-linecap="round"/><path d="M-18 4 Q0 -5 18 4 L24 49 Q0 58 -24 49Z" fill="' +
    colour +
    '"/><path d="M-19 10 L-33 38 M19 10 L' +
    (seated ? 48 : 30) +
    ' ' +
    (seated ? 25 + Math.sin(time * 2) * 2 : 40) +
    '" fill="none" stroke="#b97851" stroke-width="10" stroke-linecap="round"/><rect x="-6" y="-10" width="12" height="18" fill="#b97851"/><ellipse cy="-26" rx="18" ry="23" fill="#cb936c"/><path d="M-18 -26 Q-23 -58 10 -49 Q24 -42 17 -27 L9 -37 Q-4 -35 -18 -26" fill="#322722"/><path d="M-8 -25 h3 M6 -25 h3" stroke="#302927" stroke-width="2"/><path d="M-5 -14 Q1 -11 7 -15" fill="none" stroke="#824c40" stroke-width="1.5"/></g>';
  T.cameraFrame = (sceneId, state, time = 0, options = {}) => {
    const scene = getScene(sceneId),
      st = state,
      k = st.settings || {},
      p = st.picture || picture(scene, st, time),
      uid = 'cf' + ++frameId + '-';
    const wrap = (content) =>
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="' +
      esc(scene.alt) +
      '">' +
      content +
      '</svg>';
    if (
      st.power === false ||
      (st.display && (!st.display.open || st.display.asleep || st.display.on !== 'monitor'))
    )
      return wrap('<rect width="640" height="360" fill="#080a0d"/>');
    if (st.cap || p.black) return wrap('<rect width="640" height="360" fill="#080a0d"/>');
    const fps = Number(k.fps) || 30,
      tm = Math.floor(time * fps + 0.0000001) / fps;
    const group = (id, content) => '<g filter="url(#' + uid + id + ')">' + content + '</g>';
    const blurDefs = scene.layers
      .map(
        (l) =>
          '<filter id="' +
          uid +
          l.id +
          '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="' +
          ((p.blur || {})[l.id] || 0).toFixed(2) +
          '"/></filter>',
      )
      .join('');
    const gain = Math.pow(2, p.stops),
      warm = clamp(p.castK / 7000, -1, 1);
    const exposure =
      '<filter id="' +
      uid +
      'light" color-interpolation-filters="linearRGB"><feComponentTransfer><feFuncR type="linear" slope="' +
      (gain * (1 + warm * 0.5)).toFixed(3) +
      '"/><feFuncG type="linear" slope="' +
      gain.toFixed(3) +
      '"/><feFuncB type="linear" slope="' +
      (gain * (1 - warm * 0.5)).toFixed(3) +
      '"/></feComponentTransfer></filter>';
    let content = '';
    if (sceneId === 'note-library') {
      let shelves = '<rect width="640" height="360" fill="#bcb6a5"/>';
      for (let row = 0; row < 3; row++) {
        shelves += '<rect x="25" y="' + (25 + row * 70) + '" width="590" height="59" fill="#7b6b54"/>';
        for (let col = 0; col < 30; col++) {
          const x = 31 + col * 19,
            y = 31 + row * 70,
            h = 42 + (col % 3) * 4,
            c = ['#74544a', '#496782', '#a69d7a', '#7f8b70', '#80544d'][col % 5];
          shelves +=
            '<rect x="' +
            x +
            '" y="' +
            y +
            '" width="15" height="' +
            h +
            '" rx="1" fill="' +
            c +
            '"/><path d="M' +
            (x + 3) +
            ' ' +
            (y + 5) +
            'h9" stroke="#ddc9a3"/>';
        }
      }
      content += group('shelves', shelves);
      const phase = clamp((tm - 2) / 2.5, 0, 1),
        x = tm < 2 ? -60 : -40 + phase * 380,
        seated = tm >= 4.5;
      let reader =
        '<rect x="300" y="219" width="83" height="96" rx="9" fill="#465260"/>' +
        person(x, seated ? 205 : 168, 1.2, '#365a85', seated, tm);
      reader +=
        '<path d="M230 280 L440 280 L460 307 L208 307Z" fill="#ba9870"/><path d="M230 306v54 M437 306v54" stroke="#70553b" stroke-width="12"/>';
      const open = tm >= 6.5;
      reader +=
        '<path d="M318 268 l42 ' +
        (open ? -6 : 0) +
        ' l39 9 l-40 9 l-41 -8Z" fill="' +
        (open ? '#f1e8d5' : '#6c5545') +
        '" stroke="#70594c" stroke-width="2"/>';
      if (tm >= 8) {
        const drop = clamp((tm - 8) / 1, 0, 1);
        reader +=
          '<rect x="' +
          (390 + Math.sin(drop * 6) * 12) +
          '" y="' +
          (280 + drop * 66) +
          '" width="24" height="15" transform="rotate(' +
          drop * 90 +
          ' 402 ' +
          (288 + drop * 66) +
          ')" fill="#ffefb8"/>';
      }
      content += group('reader', reader);
      content += '<path d="M0 326H640V360H0Z" fill="#8c725a"/>';
      content += group(
        'mug',
        '<ellipse cx="104" cy="340" rx="54" ry="10" fill="#53473f" opacity=".25"/><path d="M67 264H128V330Q98 346 67 330Z" fill="#e8e8da" stroke="#a0a89f" stroke-width="3"/><ellipse cx="98" cy="264" rx="30" ry="9" fill="#52443a"/><path d="M128 276 Q164 272 153 309 Q145 323 129 312" fill="none" stroke="#e8e8da" stroke-width="11"/><path d="M69 298H126" stroke="#ba8246" stroke-width="12"/>',
      );
      if (tm >= 5.5 && tm <= 7.2)
        content += person(((tm - 5.5) / 1.7) * 820 - 90, 205, 1.8, '#e7e2d2', false, tm);
    } else if (sceneId === 'interview-window') {
      content += group(
        'wall',
        '<rect width="640" height="360" fill="#ac957b"/><rect x="27" y="48" width="123" height="95" fill="#8e7b62"/><rect x="34" y="55" width="109" height="81" fill="#5b746d"/><path d="M64 136l32-57 36 57" fill="#c1bca4"/><path d="M510 55v235" stroke="#5e5146" stroke-width="8"/><path d="M465 100l22-65h49l24 65Z" fill="#f4d79b"/>',
      );
      content += group(
        'window',
        '<rect x="360" y="28" width="220" height="211" fill="#eee9ce"/><rect x="370" y="38" width="200" height="191" fill="#fffce9"/><path d="M470 40v188 M371 132h198" stroke="#c4bc9f" stroke-width="8"/><path d="M376 220l40-52 40 52 56-68 53 68" fill="#c1d0b1"/>',
      );
      content += group(
        'reader',
        '<rect x="177" y="230" width="171" height="130" rx="16" fill="#4b514d"/>' +
          person(265, 212 + Math.sin(tm * 1.2) * 0.7, 1.75, '#435f78', true, tm),
      );
      if (tm >= 5.5 && tm <= 7.2)
        content += person(((tm - 5.5) / 1.7) * 820 - 90, 205, 1.8, '#fff8e8', false, tm);
    } else {
      content += group(
        'wall',
        '<rect width="640" height="360" fill="#c6cdc5"/><path d="M0 240H640V360H0Z" fill="#b19677"/><path d="M0 298H640 M320 240V360" stroke="#ebe4d1" stroke-width="3"/><rect x="210" y="30" width="220" height="108" fill="#a9b7aa"/><path d="M240 105l40-50 35 50 42-28 42 28" fill="#86988b"/>',
      );
      content += group(
        'reader',
        person(95, 216, 1.15, '#426683', false, tm) + person(550, 216, 1.15, '#a8664c', false, tm),
      );
      const t = mod(Math.max(0, tm - 2), 4) / 4,
        x = 135 + t * 365,
        y = 208 - Math.sin(t * Math.PI) * 150;
      let trail = '';
      for (let i = 4; i > 0; i--)
        trail +=
          '<circle cx="' +
          (x - i * p.motionBlur * 1.8) +
          '" cy="' +
          y +
          '" r="13" fill="#b3572d" opacity="' +
          (0.12 - i * 0.018) +
          '"/>';
      content += group(
        'ball',
        trail +
          '<circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="14" fill="#bd612f" stroke="#703d2c" stroke-width="2"/><path d="M' +
          (x - 12) +
          ' ' +
          y +
          'h24 M' +
          x +
          ' ' +
          (y - 13) +
          'q-10 13 0 26" fill="none" stroke="#733c28" stroke-width="2"/>',
      );
    }
    let effects = '';
    if (k.zebras)
      effects +=
        '<rect width="640" height="360" fill="url(#' +
        uid +
        'zebra)" mask="url(#' +
        uid +
        'zebraMask)" opacity=".7"/>';
    if (p.smudge) effects += '<rect width="640" height="360" fill="#f6f1dc" opacity=".4"/>';
    if (p.grain > 0)
      effects +=
        '<rect width="640" height="360" filter="url(#' +
        uid +
        'grain)" opacity="' +
        Math.min(0.28, p.grain * 0.07) +
        '"/>';
    if (st.whiteCard)
      effects +=
        '<rect x="196" y="84" width="248" height="184" rx="3" fill="#f7f4e9" stroke="#d1c9b7" stroke-width="3"/>';
    if (options.slate)
      effects +=
        '<g><rect x="180" y="80" width="280" height="192" rx="4" fill="#202b31" stroke="#ddd9ca" stroke-width="3"/><path d="M182 82h276v34H182Z" fill="url(#' +
        uid +
        'slate)"/><text x="210" y="163" fill="#fff" font-family="sans-serif" font-size="25">' +
        esc(options.slate.shot) +
        '</text><text x="210" y="214" fill="#fff" font-family="sans-serif" font-size="25">TAKE ' +
        esc(options.slate.take) +
        '</text></g>';
    const scale = p.zoomScale || 1;
    const zebraDefs = k.zebras
      ? '<filter id="' +
        uid +
        'threshold" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .2126 .7152 .0722 0 0"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1"/></feComponentTransfer></filter><mask id="' +
        uid +
        'zebraMask" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="360" style="mask-type:alpha"><g filter="url(#' +
        uid +
        'threshold)"><g filter="url(#' +
        uid +
        'light)">' +
        content +
        '</g></g></mask>'
      : '';
    return wrap(
      '<defs>' +
        blurDefs +
        exposure +
        zebraDefs +
        '<pattern id="' +
        uid +
        'zebra" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="12" fill="#161a1d"/><rect x="6" width="6" height="12" fill="#fff"/></pattern><pattern id="' +
        uid +
        'slate" width="50" height="34" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="25" height="34" fill="#ede8d6"/></pattern><filter id="' +
        uid +
        'grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="1" seed="7"/></filter></defs><rect width="640" height="360" fill="#111"/><g transform="translate(320 180) scale(' +
        scale +
        ') translate(-320 -180)"><g filter="url(#' +
        uid +
        'light)">' +
        content +
        '</g>' +
        effects +
        '</g>',
    );
  };
})();
