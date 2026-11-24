/* Core: state, routing, sound, confetti and small helpers.
   No network requests, no accounts, no tracking. Progress stays in this browser only. */
window.WB = window.WB || {};

(function () {
  const KEY = "ai-workbook-v1";
  const blank = () => ({
    sound: true,
    literacy: { best: 0, done: false, reflection: "" },
    stations: {
      prompting: { best: 0, done: false },
      privacy: { best: 0, done: false },
      ethics: { best: 0, done: false },
      verification: { best: 0, done: false },
      crossroads: { best: 0, done: false },
      reflection: ""
    },
    boss: { best: 0, done: false, reflection: "" }
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const saved = JSON.parse(raw);
      const b = blank();
      return {
        ...b, ...saved,
        literacy: { ...b.literacy, ...(saved.literacy || {}) },
        stations: { ...b.stations, ...(saved.stations || {}) },
        boss: { ...b.boss, ...(saved.boss || {}) }
      };
    } catch (e) { return blank(); }
  }

  WB.state = load();
  WB.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(WB.state)); } catch (e) { /* private mode: play on without saving */ }
    WB.renderHud && WB.renderHud();
  };
  WB.reset = function () {
    const sound = WB.state.sound;
    WB.state = blank();
    WB.state.sound = sound;
    WB.save();
  };

  /* Points shown in the header: best scores across all chapters. */
  WB.totalXP = function () {
    const s = WB.state;
    const st = s.stations;
    return s.literacy.best + st.prompting.best + st.privacy.best + st.ethics.best + st.verification.best + st.crossroads.best + s.boss.best;
  };
  WB.stationsDone = function () {
    const st = WB.state.stations;
    return ["prompting", "privacy", "ethics", "verification"].filter(k => st[k].done).length;
  };

  /* ---------- helpers ---------- */
  WB.esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  WB.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  WB.$ = (sel, root) => (root || document).querySelector(sel);
  WB.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  WB.reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Announce to screen readers. */
  WB.say = function (msg) {
    const live = document.getElementById("live");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = msg; }, 30);
  };

  /* ---------- sound (tiny synth, nothing downloaded) ---------- */
  let ctx = null;
  function tone(freq, start, dur, type, vol) {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  WB.sfx = function (name) {
    if (!WB.state.sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) { return; }
    const s = {
      tap:   () => tone(660, 0, 0.06, "triangle", 0.04),
      good:  () => { tone(660, 0, 0.12, "triangle"); tone(990, 0.09, 0.18, "triangle"); },
      bad:   () => { tone(200, 0, 0.18, "sawtooth", 0.04); tone(150, 0.1, 0.22, "sawtooth", 0.035); },
      flip:  () => { tone(440, 0, 0.05, "square", 0.03); tone(880, 0.05, 0.08, "square", 0.025); },
      hit:   () => { tone(120, 0, 0.12, "square", 0.07); tone(90, 0.06, 0.2, "sawtooth", 0.05); },
      win:   () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, "triangle", 0.07)); },
      stamp: () => { tone(180, 0, 0.08, "square", 0.08); tone(720, 0.05, 0.2, "triangle", 0.05); }
    }[name];
    s && s();
  };

  /* ---------- confetti ---------- */
  WB.confetti = function () {
    if (WB.reduced()) return;
    const c = document.createElement("canvas");
    c.className = "confetti";
    document.body.appendChild(c);
    const x = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    x.scale(dpr, dpr);
    const cols = ["#2F5BEA", "#0E8A6A", "#7B4BD6", "#E07A1F", "#E5484D", "#F2C230"];
    const bits = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 4,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: cols[(Math.random() * cols.length) | 0]
    }));
    const t0 = performance.now();
    (function step() {
      x.clearRect(0, 0, innerWidth, innerHeight);
      bits.forEach(b => {
        b.vy += 0.32; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.fillStyle = b.c; x.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); x.restore();
      });
      if (performance.now() - t0 < 2800) requestAnimationFrame(step); else c.remove();
    })();
  };

  /* ---------- routing ---------- */
  WB.routes = {};
  WB.route = (path, fn) => { WB.routes[path] = fn; };
  WB.go = path => { location.hash = "#" + path; };

  function render() {
    const path = (location.hash || "#/").slice(1) || "/";
    const fn = WB.routes[path] || WB.routes["/"];
    const main = document.getElementById("main");
    main.innerHTML = "";
    main.className = "";
    document.body.dataset.route = path.split("/")[1] || "home";
    window.scrollTo(0, 0);
    fn(main);
    WB.renderHud();
    const h = main.querySelector("h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }
  window.addEventListener("hashchange", render);
  WB.start = render;

  /* ---------- header HUD ---------- */
  WB.renderHud = function () {
    const xp = document.getElementById("xp");
    if (xp) xp.textContent = WB.totalXP().toLocaleString();
    const snd = document.getElementById("sound");
    if (snd) {
      snd.setAttribute("aria-pressed", WB.state.sound ? "true" : "false");
      snd.querySelector("span").textContent = WB.state.sound ? "Sound on" : "Sound off";
    }
    const s = WB.state;
    const marks = { literacy: s.literacy.done, stations: s.stations.crossroads.done, boss: s.boss.done };
    WB.$$("[data-ch]").forEach(el => { el.classList.toggle("done", !!marks[el.dataset.ch]); });
  };

  /* A reusable exit ticket: one reflection prompt, saved only in this browser. */
  WB.exitTicket = function (holder, prompt, get, set) {
    holder.innerHTML = `
      <div class="ticket">
        <p class="kicker">Exit ticket · saved only on this device</p>
        <label for="ticket-text" class="ticket-q">${WB.esc(prompt)}</label>
        <textarea id="ticket-text" rows="3" placeholder="Write a sentence or two. No names or personal details needed.">${WB.esc(get() || "")}</textarea>
        <p class="ticket-saved small muted" aria-live="polite"></p>
      </div>`;
    const ta = WB.$("textarea", holder);
    const msg = WB.$(".ticket-saved", holder);
    let t;
    ta.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { set(ta.value); WB.save(); msg.textContent = "Saved to your workbook."; }, 400);
    });
  };
})();
