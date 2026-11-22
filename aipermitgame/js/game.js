/* The conductor: game loop, camera, input, progress, cards and saving. */
RT.startGame = function (savedPrefs = {}) {
  const U = RT.U, T = THREE;
  const settings = window.ROAD_TEST_SETTINGS;
  const cats = window.ROAD_TEST_CATEGORIES;
  const kinds = window.ROAD_TEST_NOTE_KINDS;
  const QUESTIONS = settings.includeKnowItCards ? window.ROAD_TEST_QUESTIONS.concat(window.ROAD_TEST_KNOW_IT) : window.ROAD_TEST_QUESTIONS;
  const NOTES = window.ROAD_TEST_NOTES;
  const REFLECTIONS = window.ROAD_TEST_REFLECTIONS;
  const GOAL = settings.creditsPerCategory;
  const SAVE_KEY = 'aiRoadTest.permitDrive.v1', PREF_KEY = 'aiRoadTest.permitDrive.prefs';
  const store = U.safeStorage();

  // ---------- preferences ----------
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const prefs = { quality: isTouch ? 'normal' : 'high', camera: 'chase', sound: true, engine: true, signals: settings.turnSignalReminders, ...savedPrefs };
  const savePrefs = () => { try { store && store.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };
  const PRESETS = {
    high: { pixelRatio: Math.min(window.devicePixelRatio || 1, 2), shadows: true, shadowSize: 2048, traffic: 16, aa: true, pbr: true, bloom: true, paint: 'clearcoat' },
    normal: { pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25), shadows: true, shadowSize: 1024, traffic: 12, aa: true, pbr: true, bloom: false, paint: 'standard' },
    low: { pixelRatio: 1, shadows: false, shadowSize: 512, traffic: 8, aa: false, pbr: false, bloom: false, paint: 'standard' }
  };
  const quality = PRESETS[prefs.quality] || PRESETS.normal;

  // ---------- setup ----------
  const app = document.getElementById('app');
  const canvas = document.getElementById('scene');
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: quality.aa, powerPreference: 'high-performance' });
  } catch (e) {
    document.body.innerHTML = '<div style="font-family:sans-serif;padding:40px;max-width:560px;margin:auto"><h1>3D graphics are turned off</h1><p>This game needs WebGL. Try Chrome, Edge, Firefox or Safari, and make sure hardware acceleration is on.</p></div>';
    return;
  }
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.toneMapping = RT.ASSETS?.maple ? T.AgXToneMapping : T.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  RT.Build.setPBR(quality.pbr);
  RT.useModels = !!(RT.ASSETS && quality.pbr); // detailed Blender models on High / Normal
  RT.Build.paintQuality = quality.paint;
  const map = RT.buildMap();
  const world = RT.buildWorld(map, quality);
  const scene = world.scene;
  const photo = RT.ASSETS?.maple?.sky;
  const sky = RT.createSky(scene, world.sun, world.hemi, photo);
  if (quality.pbr) {
    sky.enableEnvironment(renderer, photo ? 0.56 : 0.65);
    renderer.toneMappingExposure = photo ? 1.15 : 0.9;
  }

  // Post-processing on High: soft bloom (sun, traffic lights, glowing windows) and a gentle vignette.
  let composer = null, bloomPass = null;
  function setupComposer() {
    if (!quality.bloom || !T.EffectComposer) return;
    const rt = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: 4 });
    composer = new T.EffectComposer(renderer, rt);
    composer.addPass(new T.RenderPass(scene, camera));
    bloomPass = new T.UnrealBloomPass(new T.Vector2(256, 256), 0.28, 0.45, 1.25);
    composer.addPass(bloomPass);
    const vig = new T.ShaderPass(T.VignetteShader);
    vig.uniforms.offset.value = 0.95; vig.uniforms.darkness.value = 1.05;
    composer.addPass(vig);
    composer.addPass(new T.OutputPass());
  }
  const props = RT.createProps(scene, map, quality);
  const lessons = RT.createLessons(scene, map, world);
  let skyT = 0.55;
  const camera = new T.PerspectiveCamera(60, 1, 0.5, 2200);
  const car = RT.createPlayerCar(scene, map);
  const signals = RT.createSignals(map);
  const traffic = RT.createTraffic(scene, map, signals, quality.traffic);
  const ui = RT.createUI(map, cats, kinds, isTouch);
  const audio = RT.createAudio();
  audio.setEnabled(prefs.sound);
  audio.setEngineOn(prefs.engine);
  traffic.reset(car.state);

  function resize() {
    const w = app.clientWidth, h = app.clientHeight;
    renderer.setSize(w, h, false);
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    camera.aspect = w / h;
    camera.fov = w < h ? 72 : 60;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  setupComposer();
  resize();

  // ---------- progress ----------
  function freshProgress(name) {
    return {
      v: 1, name: name || '', credits: Object.fromEntries(cats.map((c) => [c.id, 0])),
      usedQ: [], missed: [], answered: 0, firstTry: 0, firstTryAsked: 0, lastCat: null,
      seenNotes: [], noteCursor: 0, seenRefl: [], score: 100,
      hours: 0, tips: {},
      stats: { perfectStops: 0, cleanBonus: 0, redStops: 0, fullStops: 0, redRun: 0, rolled: 0, speeding: 0, wrongSide: 0, crashes: 0, curbs: 0, turns: 0, signaled: 0, distance: 0, time: 0, questions: 0, correct: 0, reflections: 0 },
      complete: false, finished: false, freeDrive: false
    };
  }
  let P = freshProgress('');
  function loadSave() {
    try {
      const raw = store && store.getItem(SAVE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || p.v !== 1 || !p.credits || !p.stats) return null;
      const base = freshProgress(p.name);
      return Object.assign(base, p, { stats: Object.assign(base.stats, p.stats), credits: Object.assign(base.credits, p.credits) });
    } catch (e) { return null; }
  }
  function save() { try { store && store.setItem(SAVE_KEY, JSON.stringify(P)); } catch (e) { /* storage unavailable: keep playing */ } }
  const totalCredits = () => cats.reduce((n, c) => n + Math.min(GOAL, P.credits[c.id]), 0);
  const HOURS = 6;
  // Finishing needs every credit AND hours 1-5; hour 6 is the drive back to sign the log.
  const isReturning = () => P.complete && P.hours >= HOURS - 1 && !P.finished;

  // ---------- practice hours ----------
  function currentDest() {
    if (isReturning()) return 'office';
    if (P.hours < HOURS - 1 && !P.finished) return lessons.LESSONS[P.hours].dest;
    return lessons.EXTRA[Math.max(0, P.hours - (HOURS - 1)) % lessons.EXTRA.length];
  }
  function lessonTitle() {
    if (isReturning()) return 'Hour 6 · Back to base: sign your log';
    if (P.freeDrive) return 'Free drive · ' + lessons.DESTS[currentDest()].name;
    if (P.hours < HOURS - 1) return lessons.LESSONS[P.hours].title;
    return 'Extra practice · keep earning credits';
  }
  function startLesson(announce) {
    lessons.setDestination(currentDest());
    world.finishBeacon.visible = isReturning();
    if (!announce || isTouch) return;
    if (isReturning()) ui.say('Hour 6: every credit is earned and your hours are in. Follow the blue arrows back to the Permit Office and park in the gold circle to sign your log.', 'good', 8);
    else if (P.hours < HOURS - 1 && !P.freeDrive) ui.say(lessons.LESSONS[P.hours].intro + ' Follow the blue arrows on the road.', 'info', 7);
    else ui.say('Next stop: ' + lessons.DESTS[currentDest()].name + '. Red lights still bring questions.', 'info', 5);
  }
  function onArrive() {
    const destId = currentDest();
    if (destId === 'office' && isReturning()) return; // the finish handles this one
    if (!P.freeDrive) {
      P.hours++;
      audio.sfx.stamp();
      ui.toast('⏱ Practice hour ' + P.hours + ' logged!', '#2f6fa3');
      ui.setHours(P.hours, HOURS);
      if (P.hours >= HOURS - 1 && !P.complete) ui.say('Practice hours done! You still need a few permit credits, so keep driving. Red lights bring questions.', 'good', 6);
    }
    save();
    const waitMsg = P.hours >= HOURS - 1 && !P.complete;
    nextLesson = { t: waitMsg ? 6.5 : 1.2, announce: !waitMsg };
    lessons.setDestination(null);
  }

  // ---------- rewards ----------
  let cleanT = 0, streak = 0, nextLesson = null;
  function praiseStop(ap) {
    if (ap && ap.dlPrev <= 2.5 && ap.dlPrev >= -0.8) {
      P.stats.perfectStops++;
      ui.toast('🎯 Perfect stop!', '#1fae64');
    }
  }
  function cleanDriving(dt) {
    if (Math.abs(car.state.v) < 1 || P.freeDrive) return;
    cleanT += dt;
    if (cleanT > 45) {
      cleanT = 0;
      if (P.score < 100) { P.score = Math.min(100, P.score + 2); P.stats.cleanBonus += 2; ui.setScore(P.score); ui.toast('🛡️ Clean driving  +2', '#1fae64'); }
    }
  }

  // ---------- game mode ----------
  let mode = 'title'; // title | drive | card | pause | map | notes | log | finish
  let camMode = prefs.camera;
  let route = null, routeT = 0;
  let pendingGreen = null;
  let saveT = 0;

  const rules = RT.createRules(map, signals, car, settings, {
    isReturning,
    say: (t, tone, secs) => ui.say(t, tone, secs),
    street: (seg) => ui.setStreet(seg.name + ' · ' + seg.limit + ' mph'),
    stopSign: onStopSign,
    redLight: onRedLight,
    overlook: onOverlook,
    violation: onViolation,
    turn: onTurn,
    finish: onFinish
  });

  // ---------- question selection ----------
  function nextCategory() {
    const needed = cats.filter((c) => P.credits[c.id] < GOAL);
    if (!needed.length) return { cat: cats[Math.floor(Math.random() * cats.length)], practice: true };
    const min = Math.min(...needed.map((c) => P.credits[c.id]));
    let pool = needed.filter((c) => P.credits[c.id] === min);
    if (pool.length > 1) pool = pool.filter((c) => c.id !== P.lastCat);
    return { cat: pool[Math.floor(Math.random() * pool.length)], practice: false };
  }
  function pickQuestion(catId) {
    // a missed question comes back for a second look after a few others
    const retry = P.missed.find((m) => m.cat === catId && P.answered - m.at >= 4);
    if (retry) {
      const q = QUESTIONS.find((x) => x.id === retry.id);
      if (q) return { q, secondLook: true };
    }
    let deck = QUESTIONS.filter((q) => q.category === catId);
    let fresh = deck.filter((q) => !P.usedQ.includes(q.id));
    if (!fresh.length) { P.usedQ = P.usedQ.filter((id) => !deck.some((q) => q.id === id)); fresh = deck; }
    let pool = fresh;
    if (P.credits[catId] === 0) { const l1 = fresh.filter((q) => q.level === 1); if (l1.length) pool = l1; }
    else if (Math.random() < 0.5) { const l2 = fresh.filter((q) => q.level === 2); if (l2.length) pool = l2; }
    return { q: pool[Math.floor(Math.random() * pool.length)], secondLook: false };
  }

  function openCardMode() { mode = 'card'; clearDriveInput(); audio.setEngine(0, 0, false); }

  function onRedLight(ap, release) {
    P.stats.redStops++;
    praiseStop(ap);
    openCardMode();
    audio.sfx.card();
    const { cat, practice } = nextCategory();
    const { q, secondLook } = pickQuestion(cat.id);
    const order = U.shuffle([0, 1, 2, 3].slice(0, q.options.length));
    const credited = practice ? false : P.credits[cat.id] < GOAL;
    ui.showQuestion({
      q, order, secondLook, credited,
      chipCredit: credited ? 'Credit ' + (P.credits[cat.id] + 1) + ' of ' + GOAL : 'Practice',
      onAnswer(correct) {
        P.answered++; P.stats.questions++;
        if (!P.usedQ.includes(q.id)) P.usedQ.push(q.id);
        if (!secondLook) { P.firstTryAsked++; if (correct) P.firstTry++; }
        P.lastCat = cat.id;
        P.missed = P.missed.filter((m) => m.id !== q.id);
        streak = correct ? streak + 1 : 0;
        if (streak >= 3) setTimeout(() => ui.toast('🔥 ' + streak + ' right in a row!', '#e3a514'), 400);
        if (correct) {
          P.stats.correct++;
          audio.sfx.correct();
          if (credited) {
            P.credits[cat.id]++;
            setTimeout(() => audio.sfx.stamp(), 250);
            ui.setPermit(P.credits, GOAL, cat.id);
            return { title: '+1 ' + cat.label + ' credit (' + P.credits[cat.id] + ' of ' + GOAL + ')', stamp: '✅' };
          }
          return { title: practice ? 'Correct! Nice practice.' : 'Correct!', stamp: '👍' };
        }
        audio.sfx.wrong();
        if (q.category === cat.id) P.missed.push({ id: q.id, cat: cat.id, at: P.answered });
        return { title: credited ? 'Not this time. No credit, but now you know.' : 'Not quite.', stamp: '🔁' };
      },
      onClose() {
        const justCompleted = !P.complete && totalCredits() >= GOAL * cats.length;
        if (justCompleted) P.complete = true;
        save();
        release();
        pendingGreen = { node: ap.node.id, axis: ap.axis, since: 0 };
        mode = 'drive';
        syncSteering();
        if (justCompleted) celebrateComplete();
        else ui.say('Wait for the green light...', 'tip', 3);
      }
    });
  }

  function celebrateComplete() {
    audio.sfx.finish();
    ui.toast('All ' + GOAL * cats.length + ' permit credits earned!', '#e3a514');
    ui.confetti();
    if (P.hours >= HOURS - 1) { ui.say('That is every permit credit! Drive back to the Permit Office and park in the gold circle to sign your driving log.', 'good', 8); startLesson(false); }
    else ui.say('That is every permit credit! Finish your practice hours, then you will head back to sign your log. Red lights are practice now.', 'good', 8);
  }

  function onStopSign(ap) {
    P.stats.fullStops++;
    praiseStop(ap);
    const unseen = NOTES.filter((n) => !P.seenNotes.includes(n.id));
    let note, review = false;
    if (unseen.length) {
      // interleave kinds so consecutive stops feel different
      const lastKind = P.seenNotes.length ? (NOTES.find((n) => n.id === P.seenNotes[P.seenNotes.length - 1]) || {}).kind : null;
      const diff = unseen.filter((n) => n.kind !== lastKind);
      const pool = diff.length ? diff : unseen;
      note = pool[Math.floor(Math.random() * pool.length)];
      P.seenNotes.push(note.id);
    } else {
      note = NOTES[P.noteCursor % NOTES.length]; P.noteCursor++; review = true;
    }
    ui.setNotes(P.seenNotes.length);
    if (isTouch) { save(); return; }
    openCardMode();
    audio.sfx.note();
    ui.showNote({
      note, review, index: P.seenNotes.length, total: NOTES.length,
      onClose() {
        save(); mode = 'drive';
        if (Math.random() < 0.35) ui.say(U.shuffle(['Nice full stop. Look both ways, then go.', 'Good stop. Remember: stop, look, then go.', 'That is how you handle a stop sign.'])[0], 'good', 3);
      }
    });
  }

  function onOverlook() {
    if (isTouch) return;
    openCardMode();
    audio.sfx.note();
    const unseen = REFLECTIONS.filter((r) => !P.seenRefl.includes(r.id));
    const r = (unseen.length ? unseen : REFLECTIONS)[Math.floor(Math.random() * (unseen.length || REFLECTIONS.length))];
    if (!P.seenRefl.includes(r.id)) P.seenRefl.push(r.id);
    P.stats.reflections++;
    ui.showReflection({ r, onClose() { save(); mode = 'drive'; } });
  }

  const VIOLATIONS = {
    'red-light': { pts: 10, stat: 'redRun', toast: 'Ran a red light', say: 'That light was red. Red means stop behind the white line, every time.' },
    'rolled-stop': { pts: 6, stat: 'rolled', toast: 'Rolling stop', say: 'You rolled through that stop sign. Come to a full stop. You also missed a Road Note!' },
    speeding: { pts: 4, stat: 'speeding', toast: 'Speeding', say: (lim) => 'That counts as speeding. Keep it at or under ' + lim + ' mph.' },
    'wrong-side': { pts: 4, stat: 'wrongSide', toast: 'Wrong side of the road', say: 'Stay on the right side of the road, inside your lane.' },
    crash: { pts: 8, stat: 'crashes', toast: 'Collision', say: 'Whoa! Leave more space between you and other cars.' },
    curb: { pts: 2, stat: 'curbs', toast: 'Bumped the curb', say: 'Easy. You bumped the curb. Slow down before you turn.' }
  };
  function onViolation(type, extra) {
    const v = VIOLATIONS[type];
    if (!v || P.freeDrive) { if (v) ui.say(typeof v.say === 'function' ? v.say(extra) : v.say, 'warn', 4); return; }
    P.stats[v.stat]++;
    cleanT = 0;
    if (type === 'crash' || type === 'curb') shake = 0.35;
    P.score = Math.max(0, P.score - v.pts);
    ui.setScore(P.score);
    ui.toast(v.toast + '  −' + v.pts, null, true);
    ui.say(typeof v.say === 'function' ? v.say(extra) : v.say, 'warn', 5);
    if (type === 'crash' || type === 'curb') audio.sfx.bump(); else audio.sfx.warn();
  }

  let lastSignalTip = -99;
  function onTurn(signaled, dir) {
    P.stats.turns++;
    if (signaled) { P.stats.signaled++; return; }
    if (P.stats.time - lastSignalTip < 40) return;
    lastSignalTip = P.stats.time;
    if (prefs.signals) {
      const prompt = usesTouch() ? `Tap the ${dir} signal before you turn.` : `Remember to signal before you turn ${dir}: press ${dir === 'left' ? 'Q' : 'E'}.`;
      ui.say(prompt, 'tip', 4);
    }
  }

  function onFinish() {
    if (!isReturning()) return;
    P.hours++;
    ui.setHours(P.hours, HOURS);
    P.finished = true;
    save();
    mode = 'finish';
    clearDriveInput();
    audio.sfx.finish();
    world.finishBeacon.visible = false;
    lessons.setDestination(null);
    ui.confetti();
    showLog(true);
  }

  function showLog(final) {
    ui.renderLog({ final, hours: P.hours, hoursGoal: HOURS, name: P.name, credits: P.credits, goal: GOAL, stats: P.stats, score: P.score, firstTry: P.firstTry, firstTryAsked: P.firstTryAsked, notesSeen: P.seenNotes.length, notesTotal: NOTES.length });
    ui.show('finishScreen', true);
    const $ = ui.$;
    $('logPrint').onclick = () => window.print();
    if (final) {
      $('logFree').onclick = () => { ui.show('finishScreen', false); P.freeDrive = true; save(); mode = 'drive'; syncSteering(); startLesson(false); ui.say('Free drive! Keep practicing. Your signed log will not change.', 'good', 5); };
      $('logNew').onclick = () => newDrive(P.name);
    } else {
      $('logBack').onclick = () => { ui.show('finishScreen', false); mode = 'pause'; ui.show('pauseScreen', true); };
    }
  }

  // ---------- input ----------
  const keys = new Set();
  const KEYMAP = { KeyW: 'gas', ArrowUp: 'gas', KeyS: 'reverse', ArrowDown: 'reverse', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', Space: 'brake' };
  const $ = ui.$;
  let sideways = false, steeringBlocked = false;
  const landscape = window.matchMedia('(orientation: landscape)');
  const screenAngle = () => (Number(screen.orientation?.angle ?? window.orientation ?? (landscape.matches ? 90 : 0)) + (sideways ? 90 : 0) + 360) % 360;
  const tilt = RT.createTiltSteering(screenAngle, syncSteering);
  const touchDrive = RT.createTouchDrive(canvas, car, tilt, () => mode === 'drive' && !steeringBlocked && !document.hidden, () => {
    keys.clear();
    audio.start();
  });
  const usesTouch = () => isTouch || touchDrive.active;
  function clearDriveInput() {
    keys.clear();
    touchDrive.cancel();
  }
  function syncSteering() {
    if (!isTouch) return;
    const touch = tilt.state === 'touch', ready = tilt.state === 'ready';
    if (touch || landscape.matches) sideways = false;
    if (app.classList.contains('sideways') !== sideways) {
      app.classList.toggle('sideways', sideways);
      resize();
    }
    const rotate = ready && !landscape.matches && !sideways;
    const blocked = !touch && (!ready || rotate);
    if (blocked !== steeringBlocked) {
      clearDriveInput();
      if (blocked) { car.state.v = 0; audio.setEngine(0, 0, false); }
      else tilt.recenter();
    }
    steeringBlocked = blocked;
    const gate = mode === 'drive' && blocked;
    const opening = gate && $('mobileSetup').hidden;
    $('mobileSetup').hidden = !gate;
    $('hud').inert = gate;
    $('steerHint').textContent = touch ? 'Touch' : 'Tilt';
    $('tiltSteerBtn').setAttribute('aria-pressed', String(ready));
    $('touchSteerBtn').setAttribute('aria-pressed', String(touch));
    $('centerTiltBtn').hidden = !ready;
    $('steeringStatus').textContent = tilt.message;
    if (!gate) return;
    const checking = tilt.state === 'checking';
    $('setupTitle').textContent = rotate ? 'Turn your phone sideways' : checking ? 'Connecting tilt' : 'Tilt needs motion access';
    $('setupMessage').textContent = rotate ? 'If rotation is locked, hold the phone with its top on your left and tap Play sideways.' : tilt.message;
    $('sidewaysBtn').hidden = !rotate;
    $('retryTiltBtn').hidden = rotate || checking || tilt.state === 'unavailable';
    if (opening) $('setupTitle').focus({ preventScroll: true });
  }
  async function beginTilt() {
    // Ask for motion on the original tap, before fullscreen can consume user activation.
    tilt.request();
    if (!screen.orientation?.lock || tilt.state === 'unavailable') return;
    try {
      if (!document.fullscreenElement && document.fullscreenEnabled) await document.documentElement.requestFullscreen();
      if (tilt.state !== 'touch') await screen.orientation.lock('landscape');
    } catch { /* Manual rotation and the sideways layout also work in a regular browser tab. */ }
  }
  function useTouchSteering() {
    clearDriveInput();
    tilt.useTouch();
    try { screen.orientation?.unlock?.(); } catch { /* No native lock. */ }
  }
  $('fallbackTouchBtn').onclick = $('touchSteerBtn').onclick = useTouchSteering;
  $('retryTiltBtn').onclick = beginTilt;
  $('tiltSteerBtn').onclick = () => { if (tilt.state !== 'ready') { closePause(); beginTilt(); } };
  $('sidewaysBtn').onclick = () => { sideways = true; syncSteering(); };
  $('centerTiltBtn').onclick = () => { tilt.recenter(true); closePause(); };
  function onRotation() {
    if (!isTouch) return;
    clearDriveInput();
    tilt.recenter();
    syncSteering();
  }
  landscape.addEventListener('change', onRotation);
  window.addEventListener('orientationchange', onRotation);
  screen.orientation?.addEventListener?.('change', onRotation);
  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') { if (mode === 'title' && e.code === 'Enter') startDrive(false); return; }
    if (steeringBlocked && mode === 'drive') return;
    audio.start();
    if (mode === 'card') { ui.handleCardKey(e); return; }
    if (mode === 'drive') {
      if (KEYMAP[e.code]) {
        if (!e.repeat && touchDrive.active) touchDrive.reset();
        keys.add(KEYMAP[e.code]);
        e.preventDefault();
      }
      if (e.repeat) return;
      if (e.code === 'KeyQ') car.setBlinker(1);
      if (e.code === 'KeyE') car.setBlinker(-1);
      if (e.code === 'KeyC') { const order = ['chase', 'far', 'hood']; camMode = order[(order.indexOf(camMode) + 1) % 3]; prefs.camera = camMode; savePrefs(); ui.$('optCamera').value = camMode; }
      if (e.code === 'KeyM') openMap();
      if (e.code === 'KeyR') resetCar();
      if (e.code === 'Escape' || e.code === 'KeyP') openPause();
    } else if (mode === 'map' && (e.code === 'KeyM' || e.code === 'Escape')) closeMap();
    else if (mode === 'pause' && (e.code === 'Escape' || e.code === 'KeyP')) closePause();
    else if (mode === 'help' && e.code === 'Escape') { ui.show('helpScreen', false); mode = 'pause'; ui.show('pauseScreen', true); }
    else if (mode === 'notes' && e.code === 'Escape') { ui.show('notesScreen', false); mode = 'pause'; ui.show('pauseScreen', true); }
  });
  window.addEventListener('keyup', (e) => { if (KEYMAP[e.code]) keys.delete(KEYMAP[e.code]); });
  window.addEventListener('blur', clearDriveInput);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearDriveInput();
      audio.suspend();
      if (mode === 'drive' && !steeringBlocked && !window.__rtTest) openPause();
    } else audio.resume();
  });

  function readInput() {
    const touch = keys.size === 0 ? touchDrive.read() : null;
    return touch ?? {
      throttle: keys.has('gas') ? 1 : 0,
      reverse: keys.has('reverse') ? 1 : 0,
      brake: keys.has('brake') ? 1 : 0,
      steer: (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0)
    };
  }

  // ---------- screens ----------
  function openPause() { if (mode !== 'drive' || steeringBlocked) return; mode = 'pause'; clearDriveInput(); ui.show('pauseScreen', true); audio.setEngine(0, 0, false); }
  function closePause() { ui.show('pauseScreen', false); mode = 'drive'; syncSteering(); }
  let mapFromPause = false;
  function openMap() {
    if (mode !== 'drive' && mode !== 'pause') return;
    mapFromPause = mode === 'pause';
    ui.show('pauseScreen', false); mode = 'map'; clearDriveInput();
    ui.drawBigMap(car.state, car.state.heading, route); ui.show('mapScreen', true);
  }
  function closeMap() { ui.show('mapScreen', false); mode = mapFromPause ? 'pause' : 'drive'; ui.show('pauseScreen', mapFromPause); syncSteering(); }
  $('pauseBtn').onclick = openPause;
  $('mapBtn').onclick = openMap;
  $('resetBtn').onclick = () => { if (mode === 'pause') closePause(); resetCar(); };
  $('closeMapBtn').onclick = closeMap;
  $('resumeDriveBtn').onclick = closePause;
  $('notesBtn').onclick = () => { ui.renderNotes(NOTES, P.seenNotes); ui.show('pauseScreen', false); ui.show('notesScreen', true); mode = 'notes'; };
  $('helpBtn').onclick = () => { ui.show('pauseScreen', false); ui.show('helpScreen', true); mode = 'help'; };
  $('closeHelpBtn').onclick = () => { ui.show('helpScreen', false); ui.show('pauseScreen', true); mode = 'pause'; };
  $('closeNotesBtn').onclick = () => { ui.show('notesScreen', false); ui.show('pauseScreen', true); mode = 'pause'; };
  $('logBtn').onclick = () => { ui.show('pauseScreen', false); mode = 'log'; showLog(false); };
  $('restartBtn').onclick = () => { if (window.confirm('Start a brand-new drive? Your current progress will be cleared.')) newDrive(P.name); };
  $('optSound').checked = prefs.sound;
  $('optSound').onchange = (e) => { prefs.sound = e.target.checked; audio.setEnabled(prefs.sound); savePrefs(); };
  $('optEngine').checked = prefs.engine;
  $('optEngine').onchange = (e) => { prefs.engine = e.target.checked; audio.setEngineOn(prefs.engine); savePrefs(); };
  $('optSignals').checked = prefs.signals;
  $('optSignals').onchange = (e) => { prefs.signals = e.target.checked; savePrefs(); };
  $('optCamera').value = camMode;
  $('optCamera').onchange = (e) => { camMode = e.target.value; prefs.camera = camMode; savePrefs(); };
  $('optQuality').value = prefs.quality;
  $('optQuality').onchange = (e) => { prefs.quality = e.target.value; savePrefs(); save(); location.hash = 'resume'; location.reload(); };

  // ---------- title ----------
  ui.buildPermit(GOAL);
  const saved = loadSave();
  if (saved && !saved.finished) {
    $('resumeBtn').hidden = false;
    $('resumeBtn').textContent = isTouch ? 'Resume with tilt' : 'Resume saved drive (' + cats.reduce((n, c) => n + Math.min(GOAL, saved.credits[c.id]), 0) + '/' + GOAL * cats.length + ' credits)';
    $('nameInput').value = saved.name || '';
  }
  $('startBtn').onclick = () => startDrive(false);
  $('resumeBtn').onclick = () => startDrive(true);
  $('startBtn').textContent = isTouch ? (saved && !saved.finished ? 'Start a new drive' : 'Drive with tilt') : 'Start the drive';
  $('startBtn').disabled = false;
  if (isTouch) {
    $('closeMapBtn').textContent = 'Back';
    for (const [id, label] of [['mapBtn', 'Town map'], ['resetBtn', 'Reset car']]) {
      const btn = $(id);
      btn.textContent = label; btn.className = 'btn';
      $('mobileTools').append(btn);
    }
  }

  function applyProgressToHud() {
    ui.setName(P.name);
    ui.setPermit(P.credits, GOAL);
    ui.setNotes(P.seenNotes.length);
    ui.setScore(P.score);
    ui.setHours(P.hours, HOURS);
    world.finishBeacon.visible = isReturning();
  }

  function placeAtStart() {
    touchDrive.reset();
    car.place(map.spawn.x, map.spawn.z, map.spawn.heading);
    rules.reset();
    traffic.reset(car.state);
    camPos.set(map.spawn.x, 6, map.spawn.z + 12);
    route = null;
  }

  function startDrive(resume) {
    audio.start();
    const name = $('nameInput').value.trim().slice(0, 28);
    if (resume && saved) { P = saved; if (name) P.name = name; }
    else P = freshProgress(name);
    save();
    ui.show('titleScreen', false);
    ui.show('hud', true);
    applyProgressToHud();
    placeAtStart();
    mode = 'drive';
    ui.setStreet('Permit Office lot');
    startLesson(false);
    if (isTouch) { beginTilt(); return; }
    setTimeout(() => {
      if (resume) { startLesson(true); return; }
      const pullOut = usesTouch() ? 'Hold the middle of the screen to pull out of the lot.' : 'Pull out of the lot (W to go).';
      ui.say('Hi' + (P.name ? ' ' + P.name : '') + ', I am your driving instructor. ' + pullOut + ' Follow the blue arrows and keep to the right side of the road.', 'info', 8);
      setTimeout(() => startLesson(true), 8500);
    }, 600);
  }

  function newDrive(name) {
    P = freshProgress(name);
    save();
    ['finishScreen', 'pauseScreen', 'mapScreen', 'notesScreen'].forEach((id) => ui.show(id, false));
    ui.closeCard();
    applyProgressToHud();
    placeAtStart();
    mode = 'drive';
    startLesson(false);
    syncSteering();
    ui.say('Fresh logbook! Follow the blue arrows to your first stop.', 'info', 5);
  }

  // ---------- camera ----------
  const camPos = new T.Vector3(0, 120, 220);
  const camLook = new T.Vector3();
  let titleAngle = 0.6, lookSide = 0, shake = 0;
  function updateCamera(dt) {
    const s = car.state;
    const f = car.forward();
    if (mode === 'title') {
      titleAngle += dt * 0.04;
      const cx = -60, cz = 30;
      camera.position.set(cx + Math.cos(titleAngle) * 210, 95, cz + Math.sin(titleAngle) * 210);
      camera.lookAt(cx + 40, 0, cz);
      return;
    }
    const speed = Math.abs(s.v);
    const wantFov = (camera.aspect < 1 ? 72 : 60) + Math.min(9, speed * 0.4);
    if (Math.abs(camera.fov - wantFov) > 0.05) { camera.fov = U.damp(camera.fov, wantFov, 2, dt); camera.updateProjectionMatrix(); }
    let dist = 8.6 + speed * 0.06, height = 3.6 + speed * 0.02, ahead = 5, lookH = 1.3;
    if (camMode === 'far') { dist = 15; height = 7.5; ahead = 8; lookH = 0.8; }
    if (s.v < -0.5) ahead = -3;
    if (camMode === 'hood') {
      camera.position.set(s.x + f.x * 0.2 - f.z * 0.36, 1.42, s.z + f.z * 0.2 + f.x * 0.36);
      camLook.set(s.x + f.x * 30, 1.1, s.z + f.z * 30);
      camera.lookAt(camLook);
      return;
    }
    const want = new T.Vector3(s.x - f.x * dist, height, s.z - f.z * dist);
    camPos.lerp(want, 1 - Math.exp(-5.5 * dt));
    camPos.y = height;
    camera.position.copy(camPos);
    // look a little into the turn so corners feel natural
    lookSide = U.damp(lookSide, U.clamp((s.yaw || 0) * 4, -3, 3), 3, dt);
    camLook.set(s.x + f.x * ahead + f.z * lookSide, lookH, s.z + f.z * ahead - f.x * lookSide);
    if (shake > 0) { shake = Math.max(0, shake - dt); camera.position.x += (Math.random() - 0.5) * shake * 0.8; camera.position.y += (Math.random() - 0.5) * shake * 0.5; }
    camera.lookAt(camLook);
  }

  // ---------- stop-ahead alert, glowing stop line, first-time coaching ----------
  const glowMat = new T.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.6, depthWrite: false, fog: false });
  const glowG = new T.PlaneGeometry(1, 1); glowG.rotateX(-Math.PI / 2);
  const glow = new T.Mesh(glowG, glowMat);
  glow.renderOrder = 3; glow.visible = false; scene.add(glow);
  const TIPS = {
    stop: 'Stop sign ahead! Slow down with S or Space and stop right at the white line. A full stop unlocks a Road Note about AI.',
    red: 'Red light! Stop at the white line. While you wait, you get an AI question. Right answers earn permit credits.',
    green: 'Green light means go. Keep a steady speed and drive straight through.',
    yellow: 'Yellow light: stop if you safely can. If you are too close to stop, keep going carefully.'
  };
  function coach(kind) {
    if (isTouch) return;
    if (!P.tips) P.tips = {};
    if (P.tips[kind]) return;
    P.tips[kind] = true;
    const tip = kind === 'stop' && usesTouch() ? 'Stop sign ahead! Lift your thumb to brake at the white line. A full stop unlocks a Road Note about AI.' : TIPS[kind];
    ui.say(tip, kind === 'green' ? 'good' : 'tip', 7);
  }
  function updateAlert(dt) {
    const s = car.state, ap = rules.approach;
    let kind = null, text = '';
    glow.visible = false;
    if (ap && !ap.crossed && (ap.kind === 'stop' || ap.kind === 'signal')) {
      const d = U.DIRS[ap.travel], line = map.stopLine(ap.node, ap.travel), f = car.frontPoint();
      const dl = (line.x - f.x) * d.x + (line.z - f.z) * d.z;
      const dist = Math.max(0, Math.round(dl / 5) * 5) + ' m';
      if (dl > -1 && dl < 55) {
        if (ap.kind === 'stop' && !ap.stoppedDone) {
          kind = 'stop'; text = dl < 9 && Math.abs(s.v) < 0.5 ? 'Full stop. Hold it...' : 'Stop sign ahead · stop at the white line · ' + dist;
        } else if (ap.kind === 'signal') {
          const L = signals.light(ap.node.id, ap.axis);
          if (ap.answered && L !== 'green') { kind = 'red'; text = 'Wait for the green light'; }
          else if (L === 'red') { kind = 'red'; text = 'Red light · stop at the white line · ' + dist; }
          else if (L === 'yellow') { kind = 'yellow'; text = 'Yellow · stop if you safely can'; }
          else if (dl < 40) { kind = 'green'; text = ap.answered ? 'Green light · check both ways, then go' : 'Green light · go ahead'; }
        }
        if (kind && kind !== 'green') {
          const r = U.rightOf(d), w = ap.seg.width;
          glow.position.set(line.x + r.x * w / 4, 0.09, line.z + r.z * w / 4);
          glow.rotation.y = Math.atan2(d.x, d.z);
          glow.scale.set(w / 2 - 0.3, 1, 1.1);
          glowMat.color.setHex(kind === 'yellow' ? 0xffb020 : 0xff3b30);
          glowMat.opacity = 0.45 + Math.sin(performance.now() / 180) * 0.25;
          glow.visible = true;
        }
        if (isTouch && kind) {
          if (kind === 'green') text = 'Go';
          else if (kind === 'red' && ap.answered) text = 'Wait';
          else if (Math.abs(s.v) < 0.5 && dl < 9) text = 'Stopped';
          else text = dist;
        } else if (kind && !(kind === 'red' && ap.answered)) coach(kind);
      }
    }
    ui.setAlert(mode === 'drive' ? kind : null, text);
  }

  // ---------- "stuck? reset" ----------
  function resetCar() {
    if (mode !== 'drive') return;
    keys.clear();
    touchDrive.reset();
    const s = car.state;
    if (map.locate(s.x, s.z).lot) { car.place(map.spawn.x, map.spawn.z, map.spawn.heading); ui.say('Back in your parking spot. No points lost.', 'info', 3); return; }
    let best = null;
    for (const sg of map.segments) {
      const a = map.nodes[sg.a], b = map.nodes[sg.b], along = sg.axis === 'x';
      const lo = (along ? a.x : a.z) + map.halfAlong(a, along ? 'E' : 'S') + 8;
      const hi = (along ? b.x : b.z) - map.halfAlong(b, along ? 'W' : 'N') - 8;
      if (hi <= lo) continue;
      const q = U.clamp(along ? s.x : s.z, lo, hi);
      const px = along ? q : a.x, pz = along ? a.z : q;
      const d = Math.hypot(px - s.x, pz - s.z);
      if (!best || d < best.d) best = { sg, px, pz, d, along };
    }
    if (!best) return;
    const f = car.forward();
    const sign = best.along ? (f.x >= 0 ? 1 : -1) : (f.z >= 0 ? 1 : -1);
    const travel = best.along ? (sign > 0 ? 'E' : 'W') : (sign > 0 ? 'S' : 'N');
    const dd = U.DIRS[travel], r = U.rightOf(dd), off = best.sg.width / 4;
    car.place(best.px + r.x * off, best.pz + r.z * off, Math.atan2(dd.x, dd.z));
    ui.say('Back on the road in your lane. No points lost.', 'info', 3);
  }

  // ---------- HUD per frame ----------
  let blinkPrev = false;
  function updateHud(dt) {
    const s = car.state;
    const mph = U.mph(Math.abs(s.v));
    const limit = rules.limit;
    ui.setSpeed(mph, limit, s.reversing || touchDrive.reversing, mph > limit + settings.speedingTolerance);
    const on = s.blinker !== 0 && (s.blinkT % 0.8) < 0.45;
    ui.setBlinker(s.blinker, on);
    touchDrive.sync();
    if (on !== blinkPrev) { if (on) audio.sfx.tick(); blinkPrev = on; }

    updateAlert(dt);
    const guide = mode === 'drive' && !steeringBlocked ? lessons.update(dt, car, rules.approach) : null;
    if (guide) {
      const d = Math.round(guide.dist / 10) * 10;
      if (!isTouch) ui.setObjective(`<span class="obj-title">${U.escapeHtml(lessonTitle())}</span><span class="obj-step"><span class="turn">${guide.icon}</span>${U.escapeHtml(guide.text)}<em>${d} m</em></span>`, isReturning());
      if (guide.arrived) onArrive();
    }
    if (isReturning()) world.finishBeacon.userData.ring.rotation.z += dt;
    route = lessons.polyline;
    const t = totalCredits();
    ui.setCreditsBadge(t, GOAL * cats.length);
    if (!isTouch) ui.drawMinimap(s, s.heading, route);

    if (pendingGreen) {
      pendingGreen.since += dt;
      if (signals.light(pendingGreen.node, pendingGreen.axis) === 'green') { ui.say('Green light. Check both ways, then go.', 'good', 3); pendingGreen = null; }
      else if (pendingGreen.since > 10) pendingGreen = null;
    }
  }

  // ---------- main loop ----------
  const STEP = 1 / 60;
  function simStep(input) {
    if (mode === 'drive' && input) {
      const px = car.state.x, pz = car.state.z;
      car.update(STEP, input);
      const hit = traffic.collide(car.state, car.state.v);
      if (hit > 0) {
        if (!car.corners(car.state.x, car.state.z, car.state.heading).every(([x, z]) => map.isDrivable(x, z))) { car.state.x = px; car.state.z = pz; }
        car.state.v *= 0.3;
        rules.crash(hit);
      }
      rules.update(STEP);
      P.stats.distance += Math.abs(car.state.v) * STEP;
      P.stats.time += STEP;
      audio.setEngine(car.state.v, input.throttle, true);
      cleanDriving(STEP);
      if (nextLesson && (nextLesson.t -= STEP) <= 0) { const a = nextLesson.announce; nextLesson = null; startLesson(a); }
    }
    traffic.update(STEP, car.state);
    signals.update(STEP);
  }
  let acc = 0, last = performance.now();
  let fpsT = 0, fpsFrames = 0, fps = null;
  renderer.info.autoReset = false;
  function render() {
    renderer.info.reset();
    world.updateArt(camera.position);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const elapsed = (now - last) / 1000;
    const dt = Math.min(0.1, elapsed);
    last = now;
    if ((mode === 'drive' && !steeringBlocked) || mode === 'title') {
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 6) {
        simStep(mode === 'drive' ? readInput() : null);
        acc -= STEP; steps++;
      }
      if (steps >= 6) acc = 0;
    }
    if (mode !== 'drive') { audio.setEngine(0, 0, false); ui.setAlert(null); glow.visible = false; }
    world.updateLamps(signals.light);
    if (mode !== 'title') updateHud(dt);
    updateCamera(dt);
    const sd = sky.sunDir;
    const fx = mode === 'title' ? -60 : car.state.x, fz = mode === 'title' ? 30 : car.state.z;
    world.sun.position.set(fx + sd.x * 200, sd.y * 200, fz + sd.z * 200);
    world.sun.target.position.set(fx, 0, fz);
    sky.update(dt, camera.position);
    props.update(dt, camera.position);
    const skyTarget = mode === 'title' ? 0.55 : Math.min(1, (P.hours + (P.complete ? 0.6 : 0)) / HOURS);
    skyT = U.damp(skyT, skyTarget, 0.6, dt);
    sky.setTime(skyT);
    const dusk = U.clamp((skyT - 0.78) / 0.2, 0, 1);
    world.setDusk(dusk);
    car.setDusk(dusk);
    render();

    if (mode === 'drive') {
      saveT += dt;
      if (saveT > 10) { saveT = 0; save(); }
      // keep it smooth on slower machines
      fpsT += elapsed; fpsFrames++;
      if (fpsT > 4) {
        fps = fpsFrames / fpsT; fpsT = 0; fpsFrames = 0;
        if (fps < 40 && composer) {
          for (const pass of composer.passes) pass.dispose();
          composer.dispose();
          composer = null;
        } else if (fps < 32 && world.sun.castShadow) {
          world.sun.castShadow = false;
          renderer.shadowMap.enabled = false;
        } else if (fps < 30 && renderer.getPixelRatio() > 1) {
          renderer.setPixelRatio(1);
          resize();
        }
      }
    } else { fpsT = 0; fpsFrames = 0; }
  }
  placeAtStart();
  requestAnimationFrame(frame);

  // a quality change reloads the page; jump straight back in
  if (location.hash === '#resume' && saved && !saved.finished) {
    history.replaceState(null, '', location.pathname);
    if (isTouch) $('resumeBtn').focus(); else startDrive(true);
  }

  // expose for debugging / testing in the browser console
  window.__rt = {
    map, car, signals, traffic, rules, ui, lessons, sky, skyNow(t) { skyT = t; sky.setTime(t); }, get progress() { return P; }, get mode() { return mode; },
    get graphics() {
      const { calls, triangles } = renderer.info.render;
      return { tier: prefs.quality, mapleStreet: !!world.upgradedBlock, fps, calls, triangles,
        shadows: renderer.shadowMap.enabled, bloom: !!composer, pixelRatio: renderer.getPixelRatio(),
        pedestrians: props.active, pedestrianLooks: props.riggedLooks, foliage: { ...world.foliage.stats } };
    },
    // Test hook: advance the simulation without relying on animation frames.
    // input is {throttle, reverse, brake, steer} or a function (t) => input. Stops early if a card opens.
    sim(seconds, input, draw = true) {
      const n = Math.round(seconds / STEP);
      for (let k = 0; k < n && mode === 'drive'; k++) simStep(typeof input === 'function' ? input(k * STEP) : input);
      world.updateLamps(signals.light);
      updateHud(Math.max(STEP, seconds));
      if (draw) { updateCamera(1); render(); }
      return { x: +car.state.x.toFixed(1), z: +car.state.z.toFixed(1), v: +car.state.v.toFixed(2), heading: +car.state.heading.toFixed(2), mode };
    }
  };
};

// Load the Blender models first; if anything goes wrong, play with the built-in shapes.
(function () {
  let saved = {};
  try { saved = JSON.parse(RT.U.safeStorage()?.getItem('aiRoadTest.permitDrive.prefs')) || {}; } catch (e) { /* ignore */ }
  const onTouch = window.matchMedia?.('(pointer: coarse)').matches;
  const tier = ['high', 'normal', 'low'].includes(saved.quality) ? saved.quality : (onTouch ? 'normal' : 'high');
  const go = () => RT.startGame({ ...saved, quality: tier });
  const p = RT.loadAssets ? RT.loadAssets(tier) : Promise.resolve(null);
  p.then(go, (e) => { console.warn('Model loading failed, using simple shapes.', e); RT.ASSETS = null; go(); });
})();
