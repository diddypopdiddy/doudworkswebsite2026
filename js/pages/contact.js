import { esc, scope, audioCtx, reducedMotion } from "../util.js";
import { SITE } from "../data.js";

/* The payphone pulled off an old building, now on the basement wall.
   The camera pushes in on the sticker with the email (the only place the address appears; click it to write).
   The keypad really beeps. */

const ART_W = 764, ART_H = 1643;
const STICKER = { x: 254, y: 1434, w: 448, h: 138, rot: -4 };
const COIN = { x: 252, y: 186 };
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
    });

    return { unmount() { S.dispose(); } };
  },
};
