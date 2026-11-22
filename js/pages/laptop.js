import { esc, scope, easternNow, audioCtx, navigate, replaceDetailAddress } from "../util.js";
import { APPS, SITE } from "../data.js";

/* The laptop, opened: a Mac desktop. Each project is a folder on the desktop; open one and a Finder
   window shows its preview, what it is and the link. The dock has Finder, Music, Codex, Brave and the Trash.
   Want your own wallpaper? Drop an image at assets/media/wallpaper.jpg and set WALLPAPER below. */

const ART_W = 1154, ART_H = 928;
const SCREEN = { x: 92, y: 22, w: 970, h: 602 };
const WALLPAPER = null; // e.g. "assets/media/wallpaper.jpg"
const pct = (v, of) => (v / of) * 100 + "%";

// A Mac-style folder, drawn once and reused.
const FOLDER = `<svg viewBox="0 0 64 52" aria-hidden="true"><defs>
  <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc2f7"/><stop offset="1" stop-color="#3d9ee8"/></linearGradient>
  <linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad8fd"/><stop offset="1" stop-color="#5db6f4"/></linearGradient></defs>
  <path d="M4 6a4 4 0 0 1 4-4h15l5 5h28a4 4 0 0 1 4 4v35a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#fb)"/>
  <path d="M2 16a4 4 0 0 1 4-4h52a4 4 0 0 1 4 4v28a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill="url(#ff)"/>
  <path d="M2.5 15.5h59" stroke="#fff" stroke-opacity=".55"/></svg>`;

// Dock icons (simple drawings, not the real artwork).
const ICONS = {
  finder: `<svg viewBox="0 0 64 64"><defs><linearGradient id="fi1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc7ff"/><stop offset="1" stop-color="#1f7ae0"/></linearGradient><linearGradient id="fi2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset="1" stop-color="#cfe2f3"/></linearGradient></defs>
    <rect width="64" height="64" rx="14" fill="url(#fi2)"/><path d="M14 0h22c-5 12-7 22-6 32h6c-1 11 0 21 3 32H14A14 14 0 0 1 0 50V14A14 14 0 0 1 14 0z" fill="url(#fi1)"/>
    <path d="M21 18v8M43 18v8" stroke="#123" stroke-width="3.2" stroke-linecap="round"/><path d="M16 42c10 7 22 7 32 0" fill="none" stroke="#123" stroke-width="3" stroke-linecap="round"/></svg>`,
  music: `<svg viewBox="0 0 64 64"><defs><linearGradient id="mu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b81"/><stop offset="1" stop-color="#f5233f"/></linearGradient></defs>
    <rect width="64" height="64" rx="14" fill="url(#mu)"/><path d="M26 44V20l18-4v24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/><ellipse cx="22" cy="45" rx="5.5" ry="4.5" fill="#fff"/><ellipse cx="40" cy="41" rx="5.5" ry="4.5" fill="#fff"/></svg>`,
  codex: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111"/><rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#fff" stroke-opacity=".14"/>
    <path d="M16 23l10 9-10 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 42h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  brave: `<svg viewBox="0 0 64 64"><defs><linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a3d"/><stop offset="1" stop-color="#f0401e"/></linearGradient></defs>
    <rect width="64" height="64" rx="14" fill="#fff"/><path d="M20 12h24l5 6 4-1-2 18c-1 7-11 14-19 17-8-3-18-10-19-17l-2-18 4 1z" fill="url(#br)"/>
    <path d="M25 28l7 4 7-4M28 38l4 3 4-3" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trash: `<svg viewBox="0 0 64 64"><defs><linearGradient id="tr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd6de" stop-opacity=".85"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#c3cbd4" stop-opacity=".85"/></linearGradient></defs>
    <path d="M14 14h36l-3 44a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="url(#tr)"/><ellipse cx="32" cy="14" rx="19" ry="4" fill="#e8edf2" stroke="#9aa5b1"/>
    <path d="M24 22l1.5 34M32 22v34M40 22l-1.5 34" stroke="#8994a0" stroke-width="1.6"/></svg>`,
};
const DOCK = [
  { id: "finder", name: "Finder" },
  { id: "music", name: "Music" },
  { id: "codex", name: "Codex" },
  { id: "brave", name: "Brave" },
  { sep: true },
  { id: "trash", name: "Trash" },
];

// Menu-bar status icons.
const STATUS = `
  <svg viewBox="0 0 24 16" aria-hidden="true"><rect x="1" y="3" width="19" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="3" y="5" width="13" height="6" rx="1.4" fill="currentColor"/><path d="M21.5 6.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
  <svg viewBox="0 0 20 16" aria-hidden="true"><path d="M2 6.2a11.5 11.5 0 0 1 16 0M4.8 9a7.5 7.5 0 0 1 10.4 0M7.6 11.7a3.6 3.6 0 0 1 4.8 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="10" cy="14" r="1.2" fill="currentColor"/></svg>
  <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 10l4.2 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  <svg viewBox="0 0 18 16" aria-hidden="true"><rect x="1" y="2" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="13.5" cy="4.5" r="1.4" fill="currentColor"/><rect x="1" y="9" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="4.5" cy="11.5" r="1.4" fill="currentColor"/></svg>`;
const APPLE = `<svg viewBox="0 0 14 17" aria-hidden="true"><path fill="currentColor" d="M11.6 9c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7C3.400 4.400 2.200 5.200 1.500 6.400 0 8.900 1.100 12.700 2.600 14.800c.7 1 1.500 2.200 2.600 2.100 1-.1 1.400-.7 2.700-.7s1.600.7 2.700.6c1.100 0 1.800-1 2.500-2 .8-1.200 1.100-2.300 1.100-2.400 0 0-2.200-.8-2.200-3.300zM9.700 3c.6-.7.900-1.600.8-2.600-.8 0-1.800.6-2.400 1.200-.5.600-1 1.600-.8 2.500.9.1 1.800-.4 2.400-1.100z"/></svg>`;

export default {
  mount(root, { route }) {
    const S = scope();
    root.innerHTML = `
      <div class="desk-surface"></div>
      <section class="laptop-scene" aria-label="Vince’s laptop">
        <div class="laptop">
          <img class="laptop-art" src="assets/objects/macbook-open.webp" alt="" width="${ART_W}" height="${ART_H}" draggable="false">
          <div class="mac-screen" style="left:${pct(SCREEN.x, ART_W)};top:${pct(SCREEN.y, ART_H)};width:${pct(SCREEN.w, ART_W)};height:${pct(SCREEN.h, ART_H)}">
            <div class="mac-desktop" data-desktop ${WALLPAPER ? `style="background:url('${WALLPAPER}') center / cover"` : ""}>
              <div class="mac-bar">
                <span class="mac-apple">${APPLE}</span><b data-app-name>Finder</b><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span>
                <span class="mac-status">${STATUS}</span><span class="mac-clock" data-clock></span>
              </div>
              <ul class="mac-folders" role="list" aria-label="Projects on the desktop">
                ${APPS.map((a, i) => `<li><button class="mac-folder" data-app="${a.id}" style="--i:${i}">${FOLDER}<span>${esc(a.name)}</span></button></li>`).join("")}
              </ul>
              <div class="mac-window" data-window hidden role="dialog" aria-modal="false" aria-labelledby="win-title"></div>
              <nav class="mac-dock" aria-label="Dock">
                ${DOCK.map((d) => d.sep ? `<i class="dock-sep"></i>` : `<button class="dock-app" data-dock="${d.id}" aria-label="${d.name}"><span class="dock-tip">${d.name}</span>${ICONS[d.id]}<i class="dock-dot"></i></button>`).join("")}
              </nav>
            </div>
            <div class="mac-glass"></div>
          </div>
        </div>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const win = $("[data-window]"), appName = $("[data-app-name]"), clock = $("[data-clock]");

    const tickClock = () => {
      const d = easternNow();
      clock.textContent = `${d.short.replace(",", "")}  ${d.time}`;
    };
    tickClock(); S.interval(tickClock, 15000);

    const lights = `<div class="win-lights">
        <button class="win-dot is-close" data-close aria-label="Close window"><svg viewBox="0 0 10 10"><path d="M3 3l4 4M7 3l-4 4"/></svg></button>
        <span class="win-dot is-min"><svg viewBox="0 0 10 10"><path d="M2.5 5h5"/></svg></span>
        <span class="win-dot is-max"><svg viewBox="0 0 10 10"><path d="M3 3h4v4z M7 7H3V3z" /></svg></span>
      </div>`;

    let openId = null;
    const showWindow = (html, kind) => {
      win.className = `mac-window ${kind}`;
      win.innerHTML = html;
      win.hidden = false;
      win.style.translate = ""; off = { x: 0, y: 0 };
      void win.offsetWidth; win.classList.add("is-in");
      win.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeApp));
    };
    const markOpen = (dockId) => root.querySelectorAll("[data-dock]").forEach((b) => b.classList.toggle("is-open", b.dataset.dock === dockId));

    /* A project folder opens in a Finder window. */
    function openApp(id) {
      const a = APPS.find((x) => x.id === id); if (!a) return;
      openId = id;
      appName.textContent = "Finder";
      markOpen("finder");
      root.querySelectorAll(".mac-folder").forEach((b) => b.classList.toggle("is-sel", b.dataset.app === id));
      const linkTarget = a.sameTab ? 'target="_self"' : 'target="_blank" rel="noopener noreferrer"';
      const media = a.video
        ? `<video src="assets/media/${a.video.src}" poster="assets/media/${a.video.poster}" autoplay muted loop playsinline></video>`
        : a.preview
          ? `<img src="assets/media/${a.preview}" alt="${esc(a.previewAlt || `${a.title} preview`)}">`
          : `<div class="fw-icon" style="--c:${a.color}"><img src="assets/media/${a.icon}" alt=""></div>`;
      showWindow(`
        <aside class="fw-side">
          ${lights}
          <p class="fw-head">Favorites</p>
          <span class="fw-item">Desktop</span><span class="fw-item">Recents</span><span class="fw-item">Applications</span>
          <p class="fw-head">Projects</p>
          ${APPS.map((x) => `<button class="fw-item${x.id === id ? " is-on" : ""}" data-go="${x.id}">${FOLDER}${esc(x.name)}</button>`).join("")}
        </aside>
        <div class="fw-main">
          <header class="fw-bar" data-drag><span class="fw-bar-lights">${lights}</span><span class="fw-arrows">‹ ›</span><span class="fw-title" id="win-title">${esc(a.name)}</span></header>
          <div class="fw-body">
            <div class="fw-media">${media}</div>
            <div class="fw-text">
              <p class="fw-kind">${esc(a.kind)}</p>
              <h2>${esc(a.title)}</h2>
              <p>${esc(a.summary)}</p>
              ${a.note ? `<p class="fw-note">${esc(a.note)}</p>` : ""}
              ${a.href ? `<a class="fw-open" href="${esc(a.href)}" ${linkTarget}>${esc(a.action || "Open")}</a>` : ""}
            </div>
          </div>
        </div>`, "is-finder");
      win.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => openApp(b.dataset.go)));
      (win.querySelector(".fw-open") || win.querySelector("[data-close]")).focus({ preventScroll: true });
      replaceDetailAddress(`/ai/${id}`);
    }

    /* Finder from the dock: the Projects folder, all of them at once. */
    function openFinder() {
      openId = "finder";
      appName.textContent = "Finder";
      markOpen("finder");
      showWindow(`
        <aside class="fw-side">
          ${lights}
          <p class="fw-head">Favorites</p>
          <span class="fw-item">Desktop</span><span class="fw-item">Recents</span><span class="fw-item">Applications</span>
          <p class="fw-head">Projects</p>
          ${APPS.map((x) => `<button class="fw-item" data-go="${x.id}">${FOLDER}${esc(x.name)}</button>`).join("")}
        </aside>
        <div class="fw-main">
          <header class="fw-bar" data-drag><span class="fw-bar-lights">${lights}</span><span class="fw-arrows">‹ ›</span><span class="fw-title" id="win-title">Projects</span></header>
          <div class="fw-grid">${APPS.map((x) => `<button class="fw-tile" data-go="${x.id}">${FOLDER}<span>${esc(x.name)}</span></button>`).join("")}</div>
        </div>`, "is-finder");
      win.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => openApp(b.dataset.go)));
      replaceDetailAddress("/ai");
    }

    /* Codex from the dock: a terminal listing the projects. */
    function openCodex() {
      openId = "codex";
      appName.textContent = "Codex";
      markOpen("codex");
      showWindow(`
        <header class="term-bar" data-drag>${lights}<span class="fw-title" id="win-title">vince — codex — 80×24</span></header>
        <div class="term-body">
          <p><span class="term-p">vince@basement ~ %</span> codex</p>
          <p class="term-dim">Ready. What are we building?</p>
          <p><span class="term-p">vince@basement ~ %</span> ls projects/</p>
          <p class="term-ls">${APPS.map((x) => `<button data-go="${x.id}">${esc(x.name)}/</button>`).join("")}</p>
          <p><span class="term-p">vince@basement ~ %</span> <span class="term-cursor"></span></p>
        </div>`, "is-term");
      win.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => openApp(b.dataset.go)));
    }

    function closeApp() {
      if (!openId) return false;
      const id = openId; openId = null;
      win.hidden = true; win.innerHTML = "";
      appName.textContent = "Finder";
      markOpen(null);
      root.querySelectorAll(".mac-folder").forEach((b) => b.classList.remove("is-sel"));
      root.querySelector(`.mac-folder[data-app="${id}"]`)?.focus({ preventScroll: true });
      replaceDetailAddress("/ai");
      return true;
    }
    root.querySelectorAll(".mac-folder").forEach((b) => S.on(b, "click", () => openApp(b.dataset.app)));

    const bounce = (b) => { b.classList.remove("is-bounce"); void b.offsetWidth; b.classList.add("is-bounce"); };
    root.querySelectorAll("[data-dock]").forEach((b) => S.on(b, "click", () => {
      bounce(b);
      const id = b.dataset.dock;
      if (id === "finder") openFinder();
      else if (id === "codex") openCodex();
      else if (id === "music") S.timeout(() => navigate("/music"), 420);
      else if (id === "brave") S.timeout(() => window.open(SITE.youtube, "_blank", "noopener"), 380);
    }));

    /* ---------- startup chime (soft F-major bloom) ---------- */
    S.timeout(() => {
      const a = audioCtx(); if (!a || a.state !== "running") return;
      const t = a.currentTime + 0.05, out = a.createGain();
      out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(0.06, t + 0.08); out.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      out.connect(a.destination);
      [174.6, 261.6, 349.2, 440, 523.3].forEach((f, i) => {
        const o = a.createOscillator(); o.type = i ? "sine" : "triangle"; o.frequency.value = f;
        const g = a.createGain(); g.gain.value = i ? 0.55 / i : 0.7; o.connect(g).connect(out); o.start(t + i * 0.012); o.stop(t + 2.5);
      });
    }, 260);

    /* ---------- dock magnification ---------- */
    const dock = $(".mac-dock"), dockApps = [...dock.querySelectorAll(".dock-app")];
    S.on(dock, "pointermove", (e) => {
      dockApps.forEach((b) => {
        const r = b.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)) / r.width;
        const k = Math.max(0, 1 - d / 2.4);
        b.style.setProperty("--mag", k.toFixed(3));
      });
    });
    S.on(dock, "pointerleave", () => dockApps.forEach((b) => b.style.setProperty("--mag", 0)));

    /* ---------- drag windows by their title bar ---------- */
    let off = { x: 0, y: 0 }, drag = null;
    S.on(win, "pointerdown", (e) => {
      if (!e.target.closest("[data-drag]") || e.target.closest("button")) return;
      drag = { x: e.clientX - off.x, y: e.clientY - off.y };
      win.setPointerCapture(e.pointerId); win.classList.add("is-drag");
    });
    S.on(win, "pointermove", (e) => {
      if (!drag) return;
      const sr = win.parentElement.getBoundingClientRect(), wr = win.getBoundingClientRect();
      const nx = e.clientX - drag.x, ny = e.clientY - drag.y;
      const base = { l: wr.left - off.x, t: wr.top - off.y };
      off.x = Math.min(Math.max(nx, sr.left - base.l - wr.width * 0.6), sr.right - base.l - wr.width * 0.4);
      off.y = Math.min(Math.max(ny, sr.top + sr.height * 0.045 - base.t), sr.bottom - base.t - 40);
      win.style.translate = `${off.x}px ${off.y}px`;
    });
    const endDrag = () => { drag = null; win.classList.remove("is-drag"); };
    S.on(win, "pointerup", endDrag);
    S.on(win, "pointercancel", endDrag);
    if (route.param) S.timeout(() => openApp(route.param), 450);

    return {
      onEscape() { return closeApp(); },
      unmount() { S.dispose(); },
    };
  },
};
