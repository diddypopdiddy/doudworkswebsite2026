import { esc, scope, audioCtx, reducedMotion } from "../util.js";
import { SITE } from "../data.js";

/* The payphone pulled off an old building, now on the basement wall.
   The camera pushes in on the sticker with the email (the only place the address appears; click it to write).
   The keypad really beeps. Push the coin return and change tumbles out (sometimes more than you put in). */

const ART_W = 764, ART_H = 1643;
const STICKER = { x: 254, y: 1434, w: 448, h: 138, rot: -4 };
const COIN = { x: 252, y: 186 };
// The "PUSH FOR COIN RETURN" plate (art px) and the little return chute under it, where the change comes out.
const PLATE = { x: 81, y: 1303, w: 103, h: 234 };
const CHUTE = { x: 84, y: 1567, w: 97, h: 24 };
// Real US coin sizes (mm), drawn relative to a quarter.
const COINS = {
  q: { cents: 25, mm: 24.26, metal: "silver", reeded: true },
  d: { cents: 10, mm: 17.91, metal: "silver", reeded: true },
  n: { cents: 5, mm: 21.21, metal: "nickel" },
  p: { cents: 1, mm: 19.05, metal: "copper" },
};
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
            <span class="coin" data-coin-anim aria-hidden="true" style="${coinPosition}"></span>
            <button class="coin-return" data-return aria-label="Push for coin return" style="left:${pct(PLATE.x, ART_W)};top:${pct(PLATE.y, ART_H)};width:${pct(PLATE.w, ART_W)};height:${pct(PLATE.h, ART_H)}">
              <span class="coin-return-plate" style="background-size:${(ART_W / PLATE.w) * 100}% auto;background-position:${(PLATE.x / (ART_W - PLATE.w)) * 100}% ${(PLATE.y / (ART_H - PLATE.h)) * 100}%"></span>
            </button>
            <span class="coin-chute" data-chute aria-hidden="true" style="left:${pct(CHUTE.x, ART_W)};top:${pct(CHUTE.y, ART_H)};width:${pct(CHUTE.w, ART_W)};height:${pct(CHUTE.h, ART_H)}"><i></i></span>
            <div class="coin-layer" data-coins aria-hidden="true"></div>
            <button class="handset" data-handset aria-label="Pick up the handset to write an email" style="left:${pct(HS.left, ART_W)};top:${pct(HS.top, ART_H)};width:${pct(HS.w * HS.scale, ART_W)};height:${pct(HS.h * HS.scale, ART_H)};transform-origin:${pct(HS.plugX, HS.w)} ${pct(HS.plugY, HS.h)}">
              <img src="assets/objects/payphone-handset.webp" alt="" draggable="false">
            </button>
            ${KEYS.flatMap((row, r) => row.map((k, c) => `<button class="phone-key" data-key="${k}" data-r="${r}" data-c="${c}" aria-label="Key ${k}" style="left:${pct(KEY_X[c], ART_W)};top:${pct(KEY_Y[r], ART_H)}"></button>`)).join("")}
            <a class="sticker" href="${mailto}" data-sticker style="left:${pct(STICKER.x, ART_W)};top:${pct(STICKER.y, ART_H)};width:${pct(STICKER.w, ART_W)};height:${pct(STICKER.h, ART_H)};--rot:${STICKER.rot}deg" aria-label="Email Vince at ${esc(SITE.email)}">
              <span class="sticker-top">Out of order. Email instead:</span>
              <span class="sticker-email">${esc(SITE.email)}</span>
              <span class="sticker-sub">teaching · media · collabs</span>
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

    /* ---------- a coin, for old times' sake ---------- */
    const coin = $("[data-coin-anim]");
    S.on($("[data-coin]"), "click", () => {
      coin.classList.remove("is-drop"); void coin.offsetWidth; coin.classList.add("is-drop");
      S.timeout(() => { tone([2093], 70, 0.05); S.timeout(() => tone([2637], 110, 0.04), 90); }, 420);
      S.timeout(() => { dial.textContent = "25¢ · THANKS! EMAIL’S ON THE STICKER"; dial.classList.add("is-on"); }, 520);
      clearTimeout(dialTimer); dialTimer = setTimeout(() => dial.classList.remove("is-on"), 2600);
      credit += 25;
    });

    /* ---------- coin return: push the plate in and the change falls out ---------- */
    // Anything you dropped in the slot comes back, and like a real payphone, sometimes somebody left theirs.
    let credit = 0, pushes = 0, raf = 0;
    const plate = $("[data-return]"), chute = $("[data-chute]"), layer = $("[data-coins]");
    const live = [];
    const clink = (f, vol = 0.045) => { tone([f, f * 1.51], 55, vol); };

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

    function spawn(kind, delay) {
      const H = phone.offsetHeight, W = phone.offsetWidth;
      const k = COINS[kind], d = (k.mm / 24.26) * W * 0.084;
      const el = document.createElement("span");
      el.className = `rcoin is-${k.metal}${k.reeded ? " is-reeded" : ""}`;
      el.style.width = el.style.height = d + "px";
      layer.appendChild(el);
      const cx = ((CHUTE.x + CHUTE.w * (0.3 + Math.random() * 0.4)) / ART_W) * W;
      const cy = ((CHUTE.y + CHUTE.h * 0.6) / ART_H) * H;
      live.push({ el, d, x: cx, y: cy, vx: (Math.random() * 1.3 - 0.35) * H * 0.22, vy: H * (0.05 + Math.random() * 0.12),
        spin: 14 + Math.random() * 16, ph: Math.random() * 6, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 500,
        t: -delay, bounces: 0, state: "fall", age: 0, pitch: 2200 + (24.26 - k.mm) * 120, scale: 0.7 });
    }

    let last = 0;
    function step(now) {
      const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
      const H = phone.offsetHeight, r = phone.getBoundingClientRect();
      const floor = (innerHeight - 8 - r.top) * (H / r.height);
      const g = H * 2.6;
      for (let i = live.length - 1; i >= 0; i--) {
        const c = live[i];
        c.t += dt;
        if (c.t < 0) { c.el.style.opacity = 0; continue; }
        c.age += dt;
        if (c.state === "fall") {
          c.vy += g * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt; c.ph += c.spin * dt;
          c.scale = Math.min(1, c.scale + dt * 1.6); // it tips out of the chute toward you
          if (c.y + c.d / 2 >= floor) {
            c.y = floor - c.d / 2;
            if (c.vy > H * 0.35 && c.bounces < 3) {
              c.vy = -c.vy * 0.36; c.vx *= 0.6; c.bounces++;
              clink(c.pitch * (1 - c.bounces * 0.04), 0.04 / c.bounces);
            } else { c.state = "settle"; c.wob = 0; c.vy = 0; c.amp = 1; }
          }
          c.el.style.opacity = 1;
          c.el.style.transform = `translate(${c.x - c.d / 2}px, ${c.y - c.d / 2}px) rotate(${c.rot}deg) scaleX(${Math.max(0.08, Math.abs(Math.cos(c.ph)))}) scale(${c.scale})`;
        } else if (c.state === "settle") {
          // spinning down on the floor, faster and flatter, like a coin on a table
          c.wob += dt; c.amp *= Math.pow(0.18, dt); c.vx *= Math.pow(0.05, dt); c.x += c.vx * dt;
          c.ph += dt * (10 + 40 * (1 - c.amp));
          const flat = 1 - c.amp;
          if (Math.random() < dt * (6 + 30 * flat) && c.amp > 0.06) clink(c.pitch * 0.8, 0.012 * c.amp + 0.004);
          c.el.style.transform = `translate(${c.x - c.d / 2}px, ${c.y - c.d / 2 + c.d * 0.32 * flat}px) scaleY(${1 - 0.68 * flat}) scaleX(${0.75 + 0.25 * Math.abs(Math.cos(c.ph)) * c.amp + 0.25 * flat})`;
          if (c.amp < 0.02) { c.state = "rest"; c.age = 0; }
        } else {
          c.el.style.opacity = Math.max(0, 1 - (c.age - 2.2) / 0.8);
          if (c.age > 3) { c.el.remove(); live.splice(i, 1); }
        }
      }
      raf = live.length ? requestAnimationFrame(step) : 0;
      if (!raf) last = 0;
    }

    S.on(plate, "click", () => {
      pushes++;
      plate.classList.remove("is-push"); void plate.offsetWidth; plate.classList.add("is-push");
      tone([180], 60, 0.05); // the clunk of the lever
      const coins = haul();
      const cents = coins.reduce((n, k) => n + COINS[k].cents, 0);
      S.timeout(() => {
        chute.classList.add("is-open");
        coins.forEach((k, i) => spawn(k, i * (0.09 + Math.random() * 0.08)));
        S.timeout(() => tone([1760, 2640], 60, 0.03), 40);
        if (!raf) raf = requestAnimationFrame(step);
        S.timeout(() => chute.classList.remove("is-open"), 400 + coins.length * 140);
      }, 260);
      S.timeout(() => {
        dial.textContent = cents >= 100 ? `JACKPOT! $${(cents / 100).toFixed(2)}` : `COIN RETURN · ${cents}¢`;
        dial.classList.add("is-on");
        clearTimeout(dialTimer); dialTimer = setTimeout(() => dial.classList.remove("is-on"), 2400);
      }, 420);
    });
    S.add(() => cancelAnimationFrame(raf));

    return { unmount() { S.dispose(); } };
  },
};
