import { esc, scope, easternNow, reducedMotion } from "../util.js";
import { ABOUT } from "../data.js";

/* The wallet from the desk. You arrive with it already open and the ID already out:
   the about-me lives on the front of the card, where a license prints its fields.
   Flip it and the back looks like the back of a real ID (barcodes, fine print), with the jokes in the codes.
   "Put it back" tucks the card away; hover the wallet to pull it out again.
   It's clearly a playful card: no state seal, no real number, and it says NOT A GOVERNMENT ID. */

// Spirograph "guilloche" linework, like the fine security patterns printed on real IDs.
function guilloche(w, h, layers) {
  const paths = layers.map(({ R, r, d, cx, cy, color, op, turns = 60 }) => {
    let p = "";
    for (let t = 0; t <= Math.PI * 2 * turns; t += 0.035) {
      const x = cx + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = cy + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      p += (p ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return `<path d="${p}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width=".45"/>`;
  });
  const waves = Array.from({ length: 16 }, (_, i) => {
    let p = "";
    for (let x = 0; x <= w; x += 6) p += (p ? "L" : "M") + x + " " + (h * 0.78 + i * 3.2 + Math.sin(x / 26 + i * 0.5) * 7).toFixed(1);
    return `<path d="${p}" fill="none" stroke="#c3953f" stroke-opacity=".22" stroke-width=".5"/>`;
  });
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${paths.join("")}${waves.join("")}</svg>`)}")`;
}
const LIGHTHOUSE = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 200'><g fill='#24497f'><path d='M48 40h24l8 150H40z'/><path d='M44 30h32v12H44z'/><path d='M50 14h20v16H50z'/><path d='M60 2l14 12H46z'/><path d='M20 190h80v8H20z'/></g><g fill='#fff' fill-opacity='.55'><path d='M47 80h26l1 14H46zM45 120h30l1 14H44zM43 160h34l1 14H42z'/></g><path d='M70 22 L118 6 L118 34Z' fill='#f5c24a' fill-opacity='.5'/></svg>`)}")`;

// Decorative barcodes for the back (a seeded pattern, so it looks the same every visit; it encodes nothing).
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
function stackedCode(cols = 34, rows = 14) {
  const r = rng(1977), cells = [];
  for (let y = 0; y < rows; y++) {
    cells.push(`<rect x="0" y="${y * 4}" width="4" height="4"/><rect x="${cols * 4 + 6}" y="${y * 4}" width="4" height="4"/>`);
    for (let x = 0; x < cols; x++) if (r() > 0.52) cells.push(`<rect x="${x * 4 + 6}" y="${y * 4}" width="${r() > 0.7 ? 7 : 4}" height="4"/>`);
  }
  return `<svg viewBox="0 0 ${cols * 4 + 10} ${rows * 4}" preserveAspectRatio="none" aria-hidden="true"><g fill="#111a2e">${cells.join("")}</g></svg>`;
}
function lineCode(n = 64) {
  const r = rng(2026), bars = [];
  let x = 0;
  for (let i = 0; i < n; i++) { const w = 1 + Math.floor(r() * 3); if (i % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${w}" height="20"/>`); x += w; }
  return `<svg viewBox="0 0 ${x} 20" preserveAspectRatio="none" aria-hidden="true"><g fill="#111a2e">${bars.join("")}</g></svg>`;
}
const ROUTES = { Music: "music", Video: "video", Art: "art", Teaching: "teaching", AI: "ai" };

export default {
  mount(root) {
    const S = scope();
    const now = easternNow();
    const bg = guilloche(860, 540, [
      { R: 210, r: 67, d: 118, cx: 640, cy: 250, color: "#2d5fa8", op: 0.26 },
      { R: 150, r: 41, d: 96, cx: 640, cy: 250, color: "#b5462f", op: 0.16, turns: 41 },
      { R: 260, r: 97, d: 60, cx: 120, cy: 520, color: "#2d5fa8", op: 0.14, turns: 97 },
    ]);
    const micro = "BASEMENT ID · NOT A GOVERNMENT ID · THE GARDEN STATE · ".repeat(14);

    root.innerHTML = `
      <div class="desk-surface is-leather"></div>
      <section class="about-scene is-arrived" data-state="out" aria-label="About Vince">
        <div class="wallet" data-wallet tabindex="0" role="button" aria-label="Open the wallet">
          <div class="wallet-3d">
            <img class="wallet-closed" src="assets/objects/wallet-closed.webp" alt="" draggable="false">
            <img class="wallet-open" src="assets/objects/wallet-open.webp" alt="" draggable="false">
          </div>
          <p class="wallet-hint">Hover to open the wallet</p>
        </div>

        <div class="id-wrap" data-wrap>
          <div class="id-card" data-card style="--guilloche:${esc(bg)};--lighthouse:${esc(LIGHTHOUSE)}" tabindex="0" role="group" aria-roledescription="ID card" aria-label="Vince Doud’s basement ID. Press Enter to flip it over.">
            <div class="id-face id-front">
              <div class="id-holo" data-holo aria-hidden="true"></div>
              <div class="id-gloss" data-gloss aria-hidden="true"></div>
              <header class="id-head">
                <p class="id-state">New Jersey</p>
                <div class="id-type"><b>BASEMENT ID</b><span>NOT A GOVERNMENT ID</span></div>
              </header>
              <div class="id-micro" aria-hidden="true">${micro}</div>
              <div class="id-photo"><img src="${ABOUT.portrait}" alt="Vince Doud"></div>
              <div class="id-sig" aria-hidden="true">Vince Doud</div>
              <div class="id-fields">
                <p class="id-name"><small>1·2 NAME</small><b>VINCE DOUD</b></p>
                <p class="id-about"><small>ABOUT</small>${esc(ABOUT.bio[0])}</p>
                ${ABOUT.bio[1] ? `<p class="id-about is-more">${esc(ABOUT.bio[1])}</p>` : ""}
                <p class="id-makes"><small>MAKES</small>${ABOUT.endorsements.map((e) => `<a href="/${ROUTES[e]}">${esc(e)}</a>`).join("<i>·</i>")}</p>
              </div>
              <div class="id-class-band"><span>TEACHER</span><i>+</i><span>CREATOR</span></div>
              <img class="id-ghost" src="${ABOUT.portrait}" alt="" aria-hidden="true">
              <span class="id-ghost-date" aria-hidden="true">${esc(now.numeric.replace(/\//g, ""))}</span>
            </div>
            <div class="id-face id-back" aria-hidden="true">
              <div class="id-back-code">${stackedCode()}</div>
              <dl class="id-back-codes">
                <div><dt>CLASS T+C</dt><dd>Teacher + Creator. Valid in every room of the basement.</dd></div>
                <div><dt>END</dt><dd>${ABOUT.endorsements.map(esc).join(" · ")}</dd></div>
                <div><dt>RESTR</dt><dd>Must keep making things.</dd></div>
                <div><dt>ISS</dt><dd>${esc(now.numeric)} &nbsp; <b>EXP</b> Never</dd></div>
              </dl>
              <p class="id-back-fine">If found, return to the basement. This card is a keepsake, not a government ID.</p>
              <div class="id-back-line">${lineCode()}<span>BSMT NJ 0001</span></div>
              <img class="id-back-ghost" src="${ABOUT.portrait}" alt="">
              <div class="id-back-micro">${micro}</div>
            </div>
          </div>
        </div>

        <div class="id-controls">
          <button class="chip" data-flip>Flip the card</button>
          <button class="chip" data-reset>Put it back</button>
          <a class="chip" href="/contact">Say hi →</a>
        </div>
      </section>`;

    const scene = root.querySelector(".about-scene");
    const card = root.querySelector("[data-card]");
    const wrap = root.querySelector("[data-wrap]");
    const gloss = root.querySelector("[data-gloss]");
    const holo = root.querySelector("[data-holo]");
    const wallet = root.querySelector("[data-wallet]");

    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, reducedMotion() ? 0 : ms));
    const set = (s) => (scene.dataset.state = s);
    function openWallet() {
      if (scene.dataset.state !== "closed") return;
      timers.forEach(clearTimeout); timers = [];
      set("flap");                       // closed flap swings to edge-on…
      later(() => set("open"), 330);     // …and the open wallet unfolds
      later(() => { set("out"); }, 900); // the ID slides out of its slot
    }
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      scene.classList.remove("is-arrived");
      card.classList.remove("is-flipped");
      set("closed");
    }
    S.on(wallet, "pointerenter", openWallet);
    S.on(wallet, "click", openWallet);
    S.on(wallet, "focus", openWallet);
    S.on(wallet, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openWallet(); } });

    const flip = () => card.classList.toggle("is-flipped");
    S.on(card, "click", (e) => { if (!e.target.closest("a")) flip(); });
    S.on(card, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    S.on(root.querySelector("[data-flip]"), "click", flip);
    S.on(root.querySelector("[data-reset]"), "click", reset);

    // Tilt, laminate gloss and hologram all follow the pointer.
    S.on(wrap, "pointermove", (e) => {
      if (scene.dataset.state !== "out" || e.pointerType === "touch") return;
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
      wrap.style.setProperty("--ry", (x * 16).toFixed(2) + "deg");
      gloss.style.setProperty("--gx", (x + 0.5) * 100 + "%");
      gloss.style.setProperty("--gy", (y + 0.5) * 100 + "%");
      holo.style.setProperty("--hx", (x * 60).toFixed(1) + "%");
      holo.style.setProperty("--ho", (0.18 + Math.min(0.5, Math.hypot(x, y)) * 0.9).toFixed(2));
    });
    S.on(wrap, "pointerleave", () => { wrap.style.setProperty("--rx", "0deg"); wrap.style.setProperty("--ry", "0deg"); holo.style.setProperty("--ho", ".18"); });

    S.add(() => timers.forEach(clearTimeout));
    return { unmount() { S.dispose(); } };
  },
};
