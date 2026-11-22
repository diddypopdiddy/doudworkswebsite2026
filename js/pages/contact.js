import { esc, scope, audioCtx, reducedMotion, tick } from "../util.js";
import { SITE } from "../data.js";

/* The payphone pulled off an old building, now on the basement wall.
   The camera pushes in on the sticker with the email (the only place the address appears; click it to write).
   The sticker is a postal label somebody wrote on with a fat marker: the letters are drawn stroke by stroke below, not typed.
   The keypad really beeps. Push the coin return door in and change spills out (sometimes more than you put in). */

const ART_W = 764, ART_H = 1643;
const STICKER = { x: 240, y: 1268, w: 468, h: 299, rot: -4 };
// The slit of the coin slot (art px): centre, and the box the coin flies through on its way in.
const COIN = { x: 253, y: 188, box: 380 };
// The "PUSH FOR COIN RETURN" door (art px). It hangs from its top edge and swings back into the phone.
const PLATE = { x: 81, y: 1303, w: 103, h: 234 };
// Real US coin sizes (mm), drawn relative to a quarter. col = column in assets/objects/coins.webp.
const COINS = {
  q: { cents: 25, mm: 24.26, col: 0, edge: "silver", rate: 0.92 },
  d: { cents: 10, mm: 17.91, col: 1, edge: "silver", rate: 1.26 },
  n: { cents: 5, mm: 21.21, col: 2, edge: "nickel", rate: 1.0 },
  p: { cents: 1, mm: 19.05, col: 3, edge: "copper", rate: 1.12 },
};
// Real recordings (public domain, see source-art/coin-return/SOURCES.md): coins in a metal cup, coins on a floor.
const SFX_NAMES = ["coin-floor", "coins-floor", "coin-cup-1", "coin-cup-2", "coin-cup-3", "coin-cup-4", "coins-rattle"];
// The cord stays anchored at its connector while the handset lifts.
const HS = { w: 427, h: 1454, scale: 0.57, left: 74, top: 458, plugX: 55, plugY: 735 };
const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];
const KEY_X = [424, 499, 574], KEY_Y = [654, 716, 778, 839];
const DTMF_ROW = [697, 770, 852, 941], DTMF_COL = [1209, 1336, 1477];
const pct = (v, of) => (v / of) * 100 + "%";

function tone(freqs, ms, vol = 0.07) {
  const a = audioCtx(); if (!a) return;
  const t = a.currentTime, g = a.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.setValueAtTime(vol, t + ms / 1000 - 0.03); g.gain.linearRampToValueAtTime(0, t + ms / 1000);
  g.connect(a.destination);
  freqs.forEach((f) => { const o = a.createOscillator(); o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + ms / 1000 + 0.02); });
}

const sfx = {};
let sfxLoad;
function loadSfx() {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (sfxLoad || !OAC) return;
  const dec = new OAC(1, 1, 44100); // decoding here needs no click first, unlike a live audio context
  sfxLoad = Promise.all(SFX_NAMES.map(async (n) => {
    try {
      const buf = await (await fetch(`assets/sfx/${n}.m4a`)).arrayBuffer();
      sfx[n] = await new Promise((ok, no) => { const pr = dec.decodeAudioData(buf, ok, no); if (pr && pr.catch) pr.catch(no); });
    } catch { /* no sample: the synth clink below covers it */ }
  }));
}
function play(name, { rate = 1, vol = 1, pan = 0, delay = 0 } = {}) {
  const a = audioCtx(), b = sfx[name]; if (!a || !b) return false;
  const src = a.createBufferSource(), g = a.createGain();
  src.buffer = b; src.playbackRate.value = rate; g.gain.value = vol;
  let out = src.connect(g);
  if (a.createStereoPanner) { const pn = a.createStereoPanner(); pn.pan.value = pan; out = out.connect(pn); }
  out.connect(a.destination);
  src.start(a.currentTime + delay);
  return true;
}

// A coin with two real faces and a stack of edge discs between them, so it has thickness when it turns edge-on.
function coinHTML(kind, d) {
  const k = COINS[kind], t = d * 0.036;
  return `<span class="rcoin-spin is-${k.edge}" style="--col:${k.col};--pp:${(d * 5).toFixed(1)}px">${[-0.66, -0.22, 0.22, 0.66].map((z) => `<i class="rcoin-e" style="transform:translateZ(${(z * t).toFixed(2)}px)"></i>`).join("")}<i class="rcoin-f" style="transform:translateZ(${t.toFixed(2)}px)"></i><i class="rcoin-b" style="transform:rotateY(180deg) translateZ(${t.toFixed(2)}px)"></i></span>`;
}

/* ---------- the marker lettering ---------- */
// Each letter is the path the marker tip takes: [width, ...strokes], a stroke being "L" (straight pulls) or "S" (one curved pull)
// through points in a box 1 wide and 1 tall (0 = top of the letter, 1 = the line it sits on).
const GLYPHS = {
  A: [1, ["L", 0, 1, 0.48, 0, 1, 1], ["L", 0.2, 0.64, 0.84, 0.6]],
  C: [0.9, ["S", 1, 0.2, 0.62, 0, 0.1, 0.28, 0.06, 0.7, 0.55, 1, 1, 0.84]],
  D: [0.95, ["L", 0.04, 0, 0, 1], ["S", -0.06, 0.03, 0.62, 0.08, 1, 0.48, 0.7, 0.9, -0.04, 1]],
  E: [0.85, ["L", 1, 0, 0, 0.02, 0.02, 1, 1, 0.98], ["L", 0.02, 0.5, 0.8, 0.47]],
  G: [1, ["S", 0.98, 0.2, 0.6, 0, 0.1, 0.28, 0.06, 0.72, 0.52, 1, 0.98, 0.86], ["L", 0.98, 0.9, 0.98, 0.55, 0.5, 0.57]],
  I: [0.3, ["L", 0.5, 0, 0.5, 1]],
  L: [0.8, ["L", 0.04, 0, 0, 1, 1, 0.97]],
  M: [1.3, ["L", 0, 1, 0.05, 0, 0.5, 0.72, 0.96, 0, 1, 1]],
  N: [1, ["L", 0, 1, 0.02, 0, 0.98, 1, 1, 0]],
  O: [0.95, ["S", 0.56, 0.01, 0.1, 0.24, 0.05, 0.72, 0.48, 1, 0.92, 0.74, 0.95, 0.26, 0.5, 0, 0.34, 0.07]],
  R: [0.95, ["L", 0.02, 1, 0, 0], ["S", -0.05, 0.03, 0.72, 0.04, 0.96, 0.27, 0.66, 0.5, 0.02, 0.54], ["L", 0.3, 0.53, 1, 1]],
  U: [0.95, ["S", 0, 0, 0.01, 0.62, 0.16, 0.92, 0.5, 1, 0.84, 0.9, 0.98, 0.6, 1, 0]],
  V: [1, ["L", 0, 0, 0.5, 1, 1, 0]],
  W: [1.4, ["L", 0, 0, 0.26, 1, 0.5, 0.26, 0.74, 1, 1, 0]],
  "@": [1.55, ["S", 0.67, 0.36, 0.5, 0.29, 0.33, 0.44, 0.35, 0.66, 0.52, 0.72, 0.66, 0.58, 0.67, 0.34, 0.69, 0.66, 0.82, 0.72, 0.97, 0.48, 0.88, 0.18, 0.6, 0.03, 0.25, 0.1, 0.04, 0.4, 0.06, 0.75, 0.3, 0.97, 0.62, 1, 0.86, 0.9]],
  ".": [0.3, ["L", 0.45, 0.95, 0.55, 0.97]],
};
function rng(seed) { // always the same hand, so the sticker doesn't change between visits
  return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// One line of writing between x0 and x1. Nothing is ever drawn the same way twice: every letter gets its own size, lean and wobble,
// the line wanders off level, and the letters squeeze up toward the end as the writer runs out of sticker.
function markerLine(text, { x0, x1, y, rise, cap, pen, squeeze = 0.8, gap = 0.3, loose = 1 }, rnd) {
  const r = (a) => (rnd() * 2 - 1) * a, f = (n) => n.toFixed(1);
  const chars = [...text.toUpperCase()].filter((c) => GLYPHS[c]);
  const widths = chars.map((c, i) => GLYPHS[c][0] * (1.06 - (1.06 - squeeze) * (i / Math.max(1, chars.length - 1))) * (1 + r(0.08)));
  const unit = (x1 - x0) / (widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1));
  let x = x0, out = "";
  chars.forEach((c, i) => {
    const w = widths[i] * unit, h = cap * (1 + r(0.07)), t = (x - x0) / (x1 - x0);
    const base = y + rise * t + r(cap * 0.035), lean = r(0.07 * loose) - 0.03, rot = r(0.045 * loose), cs = Math.cos(rot), sn = Math.sin(rot);
    const at = (px, py) => {
      let gx = px * w + (1 - py) * h * lean + r(cap * 0.016), gy = (py - 1) * h + r(cap * 0.016);
      gx -= w / 2; gy += h / 2;
      return [x + w / 2 + gx * cs - gy * sn, base - h / 2 + gx * sn + gy * cs];
    };
    GLYPHS[c].slice(1).forEach(([kind, ...n]) => {
      const p = []; for (let k = 0; k < n.length; k += 2) p.push(at(n[k], n[k + 1]));
      let d = `M${f(p[0][0])} ${f(p[0][1])}`;
      for (let k = 1; k < p.length; k++) {
        const a = p[k - 1], b = p[k];
        if (kind === "L") { // a straight pull is never quite straight
          const bow = r(0.035);
          d += `Q${f((a[0] + b[0]) / 2 - (b[1] - a[1]) * bow)} ${f((a[1] + b[1]) / 2 + (b[0] - a[0]) * bow)} ${f(b[0])} ${f(b[1])}`;
        } else {
          const z = p[k - 2] || a, e = p[k + 1] || b;
          d += `C${f(a[0] + (b[0] - z[0]) / 6)} ${f(a[1] + (b[1] - z[1]) / 6)} ${f(b[0] - (e[0] - a[0]) / 6)} ${f(b[1] - (e[1] - a[1]) / 6)} ${f(b[0])} ${f(b[1])}`;
        }
      }
      out += `<path d="${d}" stroke-width="${f(pen * (c === "." ? 1.25 : 1 + r(0.09)))}"/>`;
    });
    x += w + gap * unit;
  });
  return out;
}
function stickerSVG(email) {
  const rnd = rng(8189793), at = email.indexOf("@");
  const ink = markerLine(email.slice(0, at), { x0: 40, x1: 908, y: 316, rise: -14, cap: 150, pen: 14.5, squeeze: 0.86, gap: 0.38, loose: 0.6 }, rnd)
    + markerLine(email.slice(at), { x0: 120, x1: 884, y: 550, rise: 8, cap: 172, pen: 17.5, squeeze: 0.92 }, rnd);
  const rule = (x, y, w) => `<path d="M${x} ${y}h${w}" stroke="#1c3f94" stroke-width="2" opacity=".45"/>`;
  return `<svg viewBox="0 0 940 600" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="stk-shape"><path d="M18 0H858L940 72V582a18 18 0 0 1-18 18H18a18 18 0 0 1-18-18V18A18 18 0 0 1 18 0Z"/></clipPath>
      <linearGradient id="stk-paper" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#fbfaf5"/><stop offset=".8" stop-color="#f1eee4"/><stop offset="1" stop-color="#e6e1d2"/></linearGradient>
      <radialGradient id="stk-worn" cx=".5" cy=".5" r=".75"><stop offset=".62" stop-color="#5b4a2e" stop-opacity="0"/><stop offset="1" stop-color="#5b4a2e" stop-opacity=".26"/></radialGradient>
      <linearGradient id="stk-fold" x1=".15" y1=".1" x2=".7" y2=".85"><stop offset="0" stop-color="#f4f1e7"/><stop offset="1" stop-color="#c9c2ae"/></linearGradient>
      <filter id="stk-grime" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .26  0 0 0 0 .17  0 0 0 1.5 -.62"/></filter>
      <filter id="stk-ink" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    </defs>
    <g clip-path="url(#stk-shape)">
      <rect width="940" height="600" fill="url(#stk-paper)"/>
      <rect width="940" height="92" fill="#1c3f94"/>
      <rect y="92" width="940" height="13" fill="#c9212c"/>
      <text x="34" y="67" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="60" font-weight="900" font-style="italic" letter-spacing="-1">PRIORITY E-MAIL</text>
      <g fill="#1c3f94" font-family="Inter, Arial, sans-serif" font-weight="800">
        <text x="34" y="146" font-size="24">FROM:</text>
        <text x="34" y="398" font-size="34">TO:</text>
        <text x="906" y="582" font-size="15" font-weight="600" text-anchor="end" opacity=".7">LABEL 818, BASEMENT ISSUE</text>
      </g>
      ${rule(130, 148, 330)}${rule(34, 204, 426)}${rule(34, 260, 426)}${rule(110, 400, 780)}${rule(110, 468, 780)}${rule(110, 536, 780)}
      <rect width="940" height="600" filter="url(#stk-grime)" opacity=".32" style="mix-blend-mode:multiply"/>
      <rect width="940" height="600" fill="url(#stk-worn)"/>
      <g class="sticker-ink" filter="url(#stk-ink)" fill="none" stroke="#14110f" stroke-opacity=".9" stroke-linecap="round" stroke-linejoin="round">${ink}</g>
    </g>
    <path d="M858 0 940 72 870 80Z" fill="rgba(0,0,0,.28)" transform="translate(-5 6)"/>
    <path d="M858 0 940 72 870 80Z" fill="url(#stk-fold)"/>
  </svg>`;
}

export default {
  mount(root) {
    const S = scope();
    const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent("Hey Vince")}`;
    const coinPosition = `left:${pct(COIN.x, ART_W)};top:${pct(COIN.y, ART_H)}`;

    root.innerHTML = `
      <div class="phone-wall basement-wall"></div>
      <section class="phone-scene" aria-label="Contact Vince">
        <div class="phone-cam" data-cam>
          <div class="phone" data-phone style="aspect-ratio:${ART_W} / ${ART_H}">
            <img class="phone-art" src="assets/objects/payphone-front-off-hook.webp" alt="A Bell Atlantic payphone mounted on the brick wall" width="${ART_W}" height="${ART_H}" draggable="false">
            <button class="coin-slot" data-coin aria-label="Drop a coin in the slot" style="${coinPosition}"></button>
            <span class="coin-in" data-coin-in aria-hidden="true" style="left:${pct(COIN.x - COIN.box, ART_W)};top:${pct(COIN.y - COIN.box / 2, ART_H)};width:${pct(COIN.box, ART_W)};height:${pct(COIN.box, ART_H)}"></span>
            <button class="coin-return" data-return aria-label="Push for coin return" style="left:${pct(PLATE.x, ART_W)};top:${pct(PLATE.y, ART_H)};width:${pct(PLATE.w, ART_W)};height:${pct(PLATE.h, ART_H)}">
              <span class="coin-return-box">
                <span class="coin-return-well"></span>
                <span class="coin-return-plate" style="background-size:${(ART_W / PLATE.w) * 100}% auto;background-position:${(PLATE.x / (ART_W - PLATE.w)) * 100}% ${(PLATE.y / (ART_H - PLATE.h)) * 100}%"><i></i></span>
              </span>
            </button>
            <div class="coin-layer" data-coins aria-hidden="true"></div>
            <button class="handset" data-handset aria-label="Pick up the handset to write an email" style="left:${pct(HS.left, ART_W)};top:${pct(HS.top, ART_H)};width:${pct(HS.w * HS.scale, ART_W)};height:${pct(HS.h * HS.scale, ART_H)};transform-origin:${pct(HS.plugX, HS.w)} ${pct(HS.plugY, HS.h)}">
              <img src="assets/objects/payphone-handset.webp" alt="" draggable="false">
            </button>
            ${KEYS.flatMap((row, r) => row.map((k, c) => `<button class="phone-key" data-key="${k}" data-r="${r}" data-c="${c}" aria-label="Key ${k}" style="left:${pct(KEY_X[c], ART_W)};top:${pct(KEY_Y[r], ART_H)}"></button>`)).join("")}
            <a class="sticker" href="${mailto}" data-sticker style="left:${pct(STICKER.x, ART_W)};top:${pct(STICKER.y, ART_H)};width:${pct(STICKER.w, ART_W)};height:${pct(STICKER.h, ART_H)};--rot:${STICKER.rot}deg" aria-label="Email Vince at ${esc(SITE.email)}">
              ${stickerSVG(SITE.email)}
            </a>
          </div>
        </div>
        <div class="phone-dial" data-dial aria-live="polite"></div>
        <button class="chip phone-zoom" data-zoom aria-pressed="false">Step back</button>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const cam = $("[data-cam]"), phone = $("[data-phone]"), sticker = $("[data-sticker]"), dial = $("[data-dial]"), zoomBtn = $("[data-zoom]");

    /* ---------- camera push onto the sticker ---------- */
    let zoomed = false;
    const applyZoom = () => {
      if (!zoomed) { cam.style.transform = ""; zoomBtn.textContent = "Zoom in on the sticker"; zoomBtn.setAttribute("aria-pressed", "false"); return; }
      cam.style.transform = "";
      const pr = phone.getBoundingClientRect();
      const cx = pr.left + ((STICKER.x + STICKER.w / 2) / ART_W) * pr.width;
      const cy = pr.top + ((STICKER.y + STICKER.h / 2) / ART_H) * pr.height;
      const z = Math.min(2.3, (innerWidth * 0.52) / ((STICKER.w / ART_W) * pr.width));
      const tx = innerWidth * 0.5 - cx, ty = innerHeight * 0.46 - cy;
      cam.style.transformOrigin = `${cx}px ${cy}px`;
      cam.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
      zoomBtn.textContent = "Step back"; zoomBtn.setAttribute("aria-pressed", "true");
    };
    S.on(zoomBtn, "click", () => { zoomed = !zoomed; applyZoom(); });
    S.on(window, "resize", applyZoom);
    S.timeout(() => { zoomed = true; applyZoom(); }, reducedMotion() ? 0 : 900);

    /* ---------- keypad ---------- */
    let dialed = "", dialTimer = 0;
    root.querySelectorAll(".phone-key").forEach((b) =>
      S.on(b, "click", () => {
        tone([DTMF_ROW[+b.dataset.r], DTMF_COL[+b.dataset.c]], 160);
        b.classList.remove("is-press"); void b.offsetWidth; b.classList.add("is-press");
        dialed = (dialed + b.dataset.key).slice(-12);
        dial.textContent = dialed; dial.classList.add("is-on");
        clearTimeout(dialTimer);
        dialTimer = setTimeout(() => { dial.classList.remove("is-on"); dialed = ""; }, 2200);
      }),
    );
    S.add(() => clearTimeout(dialTimer));

    const handset = $("[data-handset]");
    S.on(handset, "click", () => {
      if (phone.classList.contains("is-lifted")) { phone.classList.remove("is-lifted"); return; }
      phone.classList.add("is-lifted");
      tone([350, 440], 1100, 0.05);
      dial.textContent = "DIAL TONE… OPENING EMAIL"; dial.classList.add("is-on");
      S.timeout(() => { location.href = mailto; }, 900);
      S.timeout(() => { phone.classList.remove("is-lifted"); dial.classList.remove("is-on"); }, 3200);
    });

    let credit = 0; // what's been dropped in the slot; the coin return gives it back

    /* ---------- a coin, for old times' sake ---------- */
    // A quarter comes up to the slot, turns edge-on, gets pushed in, then you hear it drop through the phone.
    const coinIn = $("[data-coin-in]");
    S.on($("[data-coin]"), "click", () => {
      credit += 25;
      const d = phone.offsetWidth * 0.088;
      const el = document.createElement("span");
      el.className = "incoin";
      el.style.width = el.style.height = d + "px";
      el.innerHTML = coinHTML("q", d);
      coinIn.appendChild(el);
      S.timeout(() => el.remove(), 1100);
      S.timeout(() => tick(0.03), 640); // metal on metal as it meets the slot
      S.timeout(() => {
        // down the chute and into the box
        if (play("coin-cup-2", { rate: 0.9, vol: 0.2, pan: -0.2 })) {
          play(`coin-cup-${Math.random() < 0.5 ? 1 : 3}`, { rate: 0.74, vol: 0.14, pan: -0.2, delay: 0.2 });
          play("coin-cup-4", { rate: 0.6, vol: 0.17, pan: -0.2, delay: 0.42 });
        } else { tone([2093], 70, 0.05); S.timeout(() => tone([2637], 110, 0.04), 90); }
        S.timeout(() => tone([105], 80, 0.06), 470);
      }, 930);
      S.timeout(() => {
        dial.textContent = "25¢ · THANKS! EMAIL’S ON THE STICKER"; dial.classList.add("is-on");
        clearTimeout(dialTimer); dialTimer = setTimeout(() => dial.classList.remove("is-on"), 2600);
      }, 1250);
    });

    /* ---------- coin return: push the door in and the change spills out ---------- */
    // Anything you dropped in the slot comes back, and like a real payphone, sometimes somebody left theirs.
    // The door hangs from its top edge: hold it in and it stays in, let go and it slaps shut.
    let pushes = 0, raf = 0, held = false, isIn = false, inAt = 0, minHold = 0, backTimer = 0;
    const plate = $("[data-return]"), layer = $("[data-coins]");
    const live = [];
    const clink = (f, vol = 0.045) => { tone([f, f * 1.51], 55, vol); };
    loadSfx();

    function haul() {
      const out = [];
      for (let c = credit; c >= 25; c -= 25) out.push("q");
      credit = 0;
      const r = Math.random();
      const found = pushes === 1 && !out.length ? 2 + Math.floor(Math.random() * 2) // the first push always pays out
        : r < 0.1 ? 6 + Math.floor(Math.random() * 4)                           // jackpot
        : r < 0.75 ? 1 + Math.floor(Math.random() * 3)
        : out.length ? 0 : 1;
      const bag = "qqqddddnnnpppp";
      for (let i = 0; i < found; i++) out.push(bag[Math.floor(Math.random() * bag.length)]);
      return out.slice(0, 12);
    }

    function spawn(kind, delay, i, batch) {
      const H = phone.offsetHeight, W = phone.offsetWidth;
      const k = COINS[kind], d = (k.mm / 24.26) * W * 0.088;
      const el = document.createElement("span");
      el.className = "rcoin";
      el.style.width = el.style.height = d + "px";
      el.innerHTML = coinHTML(kind, d);
      layer.appendChild(el);
      // they come out of the dark gap under the swung-in door
      live.push({ el, spin: el.firstChild, d, kind,
        x: ((PLATE.x + PLATE.w * (0.3 + Math.random() * 0.4)) / ART_W) * W,
        y: ((PLATE.y + PLATE.h * (0.84 + Math.random() * 0.06)) / ART_H) * H,
        vx: (Math.random() - 0.5) * H * 0.2, vy: -H * (0.03 + Math.random() * 0.1),
        az: Math.random() * 360, th: Math.random() * 6.28, w: (7 + Math.random() * 10) * (Math.random() < 0.5 ? -1 : 1),
        bz: Math.random() * 360, vb: (Math.random() - 0.5) * 300,
        t: -delay, age: 0, started: false, rate: k.rate * (0.95 + Math.random() * 0.1),
        cup: batch < 6 || i % 2 === 0, solo: batch < 5 || i % 3 === 0, lead: batch >= 5 && i === 0 });
    }

    // A coin that has dropped out of frame still has to hit the basement floor: that's the sound you hear.
    function land(c, pan) {
      if (c.lead) play("coins-floor", { vol: 0.6, pan: pan * 0.5, delay: 0.2 });
      if (!c.solo) return;
      const d = 0.16 + Math.random() * 0.22;
      if (!play("coin-floor", { rate: c.rate, vol: c.lead ? 0.3 : 0.32 + Math.random() * 0.3, pan, delay: d }))
        S.timeout(() => clink(2200 * c.rate, 0.04), d * 1000);
    }

    let last = 0;
    function step(now) {
      const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
      const H = phone.offsetHeight, W = phone.offsetWidth, r = phone.getBoundingClientRect();
      const k = H / r.height, bottom = (innerHeight - r.top) * k; // the bottom of the screen, in the phone's own px
      const g = H * 2.7;
      for (let i = live.length - 1; i >= 0; i--) {
        const c = live[i];
        c.t += dt;
        if (c.t < 0) continue;
        const pan = Math.max(-1, Math.min(1, ((r.left + c.x / k) / innerWidth) * 2 - 1)) * 0.6;
        if (!c.started) {
          c.started = true;
          if (c.cup) play(`coin-cup-${1 + Math.floor(Math.random() * 4)}`, { rate: c.rate * 1.1, vol: 0.16 + Math.random() * 0.14, pan });
        }
        c.age += dt;
        c.vy += g * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.th += c.w * dt; c.bz += c.vb * dt;
        if (c.y - c.d > bottom || c.x < -W * 3 || c.x > W * 4) { c.el.remove(); live.splice(i, 1); land(c, pan); continue; }
        // small and in shadow inside the cup, then out toward you
        const scale = 0.5 + 0.5 * Math.min(1, c.age / 0.2) + Math.min(0.3, c.age * 0.2);
        c.el.style.opacity = Math.min(1, c.age / 0.05);
        c.el.style.transform = `translate(${c.x - c.d / 2}px, ${c.y - c.d / 2}px) scale(${scale})`;
        c.spin.style.transform = `perspective(${c.d * 5}px) rotateZ(${c.az}deg) rotateX(${c.th}rad) rotateZ(${c.bz}deg)`;
        // light from the upper left: the face dims as it turns away and flashes when it catches the lamp
        const a = (c.az * Math.PI) / 180, sn = Math.sin(c.th);
        let nx = Math.sin(a) * sn, ny = -Math.cos(a) * sn, nz = Math.cos(c.th);
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const lit = Math.max(0, nx * -0.37 + ny * -0.56 + nz * 0.74);
        c.spin.style.setProperty("--s", Math.min(0.88, (1 - lit) * 0.6 + Math.max(0, 0.75 * (1 - c.age / 0.22))).toFixed(3));
        c.spin.style.setProperty("--g", (Math.pow(lit, 16) * 0.85).toFixed(3));
      }
      raf = live.length ? requestAnimationFrame(step) : 0;
      if (!raf) last = 0;
    }

    function pushIn() {
      if (isIn) return;
      isIn = true; inAt = performance.now(); pushes++;
      clearTimeout(backTimer);
      plate.classList.remove("is-back"); plate.classList.add("is-in");
      tone([150], 70, 0.06); // the clunk of the door
      const coins = haul();
      const cents = coins.reduce((n, k) => n + COINS[k].cents, 0);
      minHold = 360 + coins.length * 95; // stays open until the last coin is out
      S.timeout(() => {
        if (coins.length >= 6) play("coins-rattle", { vol: 0.4, rate: 1.05 });
        coins.forEach((k, i) => spawn(k, i * (0.07 + Math.random() * 0.07), i, coins.length));
        if (!raf && live.length) raf = requestAnimationFrame(step);
      }, 110);
      S.timeout(() => {
        dial.textContent = cents >= 100 ? `JACKPOT! $${(cents / 100).toFixed(2)}` : cents ? `COIN RETURN · ${cents}¢` : "COIN RETURN · EMPTY";
        dial.classList.add("is-on");
        clearTimeout(dialTimer); dialTimer = setTimeout(() => dial.classList.remove("is-on"), 2400);
      }, 420);
    }
    function letGo() {
      if (!isIn) return;
      clearTimeout(backTimer);
      backTimer = setTimeout(() => {
        if (held) return;
        isIn = false;
        plate.classList.remove("is-in"); plate.classList.add("is-back");
        S.timeout(() => tone([230, 610], 35, 0.035), 150); // slaps shut against the frame
      }, Math.max(0, minHold - (performance.now() - inAt)));
    }
    S.on(plate, "pointerdown", (e) => { if (e.button) return; held = true; pushIn(); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => S.on(plate, t, () => { if (!held) return; held = false; letGo(); }));
    S.on(plate, "click", (e) => { if (e.detail === 0) { pushIn(); letGo(); } }); // keyboard
    S.on(plate, "animationend", () => plate.classList.remove("is-back"));
    S.add(() => { cancelAnimationFrame(raf); clearTimeout(backTimer); });

    return { unmount() { S.dispose(); } };
  },
};
