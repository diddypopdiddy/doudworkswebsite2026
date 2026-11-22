/* Tiny synthesized sound kit (no audio files needed). */
RT.createAudio = function () {
  let ctx = null, master = null, engine = null, engineGain = null, engineFilter = null, enabled = true, engineOn = true;

  function start() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = enabled ? 0.6 : 0; master.connect(ctx.destination);
    engine = ctx.createOscillator(); engine.type = 'sawtooth'; engine.frequency.value = 40;
    const sub = ctx.createOscillator(); sub.type = 'triangle'; sub.frequency.value = 20;
    engineFilter = ctx.createBiquadFilter(); engineFilter.type = 'lowpass'; engineFilter.frequency.value = 300;
    engineGain = ctx.createGain(); engineGain.gain.value = 0;
    engine.connect(engineFilter); sub.connect(engineFilter); engineFilter.connect(engineGain); engineGain.connect(master);
    engine.start(); sub.start();
    engine._sub = sub;
  }

  function setEnabled(v) { enabled = v; if (master) master.gain.setTargetAtTime(v ? 0.6 : 0, ctx.currentTime, 0.05); }

  function setEngine(speed, throttle, running) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const rpm = 38 + Math.abs(speed) * 3.2 + throttle * 14;
    engine.frequency.setTargetAtTime(rpm, t, 0.08);
    engine._sub.frequency.setTargetAtTime(rpm / 2, t, 0.08);
    engineFilter.frequency.setTargetAtTime(240 + throttle * 420 + Math.abs(speed) * 14, t, 0.1);
    engineGain.gain.setTargetAtTime(running && engineOn ? 0.01 + Math.min(1, Math.abs(speed) / 12) * 0.018 + throttle * 0.02 : 0, t, 0.15);
  }

  function tone(freq, dur, type = 'sine', vol = 0.25, delay = 0, slideTo) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }

  const sfx = {
    card() { tone(660, 0.14, 'triangle', 0.18); tone(880, 0.2, 'triangle', 0.16, 0.08); },
    note() { tone(523, 0.16, 'sine', 0.18); tone(784, 0.24, 'sine', 0.15, 0.1); },
    correct() { tone(523, 0.14, 'triangle', 0.22); tone(659, 0.14, 'triangle', 0.22, 0.1); tone(784, 0.3, 'triangle', 0.22, 0.2); },
    wrong() { tone(220, 0.25, 'square', 0.08); tone(196, 0.35, 'square', 0.07, 0.15); },
    stamp() { tone(140, 0.12, 'square', 0.16, 0, 70); tone(1046, 0.25, 'sine', 0.12, 0.08); },
    tick() { tone(1800, 0.025, 'square', 0.05); },
    warn() { tone(440, 0.12, 'square', 0.07); tone(440, 0.12, 'square', 0.07, 0.18); },
    bump() { tone(90, 0.18, 'sawtooth', 0.18, 0, 50); },
    finish() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.35, 'triangle', 0.18, i * 0.12)); }
  };

  // Silence everything while the tab is hidden; pick back up when it returns.
  function suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function setEngineOn(v) { engineOn = v; }
  return { start, setEngine, setEnabled, setEngineOn, sfx, suspend, resume };
};
