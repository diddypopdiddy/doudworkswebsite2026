import { esc, scope, fmtTime, tick, clamp, announce, reducedMotion } from "../util.js";
import { videos } from "../../data/videos.js";
import { unavailableEmbedIds } from "../../data/embed-availability.js";
import { SITE } from "../data.js";

/* The TV on its cart with a DVD player, plus the remote. A classic DVD menu you click through:
   boot → Main Menu → Scene Selection / Collections / Extras → playback.
   Works from the remote, the DVD player's buttons, the keyboard (arrows, Enter, Esc, Space) or the mouse. */

const DISCS = [
  { id: "covers", label: "Covers", sub: "Drum & full-band covers", color: "#e0a526" },
  { id: "woodbury", label: "School Videos", sub: "Woodbury music videos", color: "#4f8fe0" },
  { id: "archive", label: "TV Archive", sub: "Archived performances", color: "#9fbf4a" },
];
// Art coordinates (tv-dvd-cart-front: 832 × 1437).
const CART = { w: 832, h: 1437, show: 990 };
const SCREEN = { x: 151, y: 101, w: 536, h: 410 };
const VFD = { x: 566, y: 822, w: 160, h: 42 };
const TRAY = { x: 120, y: 824, w: 398, h: 36 };
const DVD_BTNS = [
  { act: "power", x: 155, label: "Power" }, { act: "eject", x: 252, label: "Open/close disc tray" }, { act: "play", x: 347, label: "Play" },
  { act: "pause", x: 433, label: "Pause" }, { act: "stop", x: 520, label: "Stop" }, { act: "prev", x: 606, label: "Previous" }, { act: "next", x: 691, label: "Next" },
];
// Remote (dvd-remote: 539 × 1852).
const RM = { w: 539, h: 1852 };
const REMOTE = [
  { act: "power", x: 140, y: 188, w: 110, h: 110, r: "50%", label: "Power" },
  { act: "menu", x: 170, y: 348, w: 160, h: 76, label: "Menu" }, { act: "title", x: 375, y: 348, w: 160, h: 76, label: "Title: scene selection" },
  { act: "up", x: 270, y: 472, w: 120, h: 90, label: "Up" }, { act: "down", x: 270, y: 728, w: 120, h: 90, label: "Down" },
  { act: "left", x: 142, y: 600, w: 90, h: 120, label: "Left" }, { act: "right", x: 398, y: 600, w: 90, h: 120, label: "Right" },
  { act: "enter", x: 270, y: 600, w: 140, h: 140, r: "50%", label: "Enter" },
  { act: "play", x: 142, y: 855, w: 110, h: 80, label: "Play" }, { act: "pause", x: 272, y: 855, w: 110, h: 80, label: "Pause" }, { act: "stop", x: 406, y: 855, w: 110, h: 80, label: "Stop" },
  { act: "prev", x: 195, y: 970, w: 120, h: 76, label: "Previous" }, { act: "next", x: 348, y: 970, w: 120, h: 76, label: "Next" },
  ...[[1, 142, 1128], [2, 275, 1128], [3, 407, 1128], [4, 142, 1242], [5, 275, 1242], [6, 407, 1242], [7, 142, 1358], [8, 275, 1358], [9, 407, 1358], [0, 275, 1478]].map(([n, x, y]) => ({ act: "num", n, x, y, w: 110, h: 94, label: `Number ${n}` })),
];
const PER_PAGE = 4;
const pc = (v, of) => (v / of) * 100 + "%";
const thumb = (id, q = "mqdefault") => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
const canEmbed = (v) => !unavailableEmbedIds.has(v.id);
const title = (v) => v.song || v.title;

export default {
  mount(root, { route }) {
    const S = scope();
    let disc = DISCS.find((d) => d.id === route.param)?.id || "covers";
    // Scenes that play right on the TV come first; YouTube-only ones follow (stable order otherwise).
    const lists = {};
    const list = () => (lists[disc] ||= videos.filter((v) => v.collection === disc).map((v, i) => [v, i]).sort((a, b) => (canEmbed(b[0]) - canEmbed(a[0])) || a[1] - b[1]).map(([v]) => v));
    let power = true, screen = "boot", page = 0, playing = -1, playAll = false, paused = false, sel = null, trayOpen = false;
    let lastMenu = "main";

    root.innerHTML = `
      <div class="backdrop is-warm"></div>
      <section class="dvd-scene" aria-label="TV and DVD player">
        <div class="cart-frame">
          <div class="cart" data-cart style="aspect-ratio:${CART.w}/${CART.h}">
            <img class="cart-art" src="assets/objects/tv-dvd-cart-front.webp" alt="A TV on a rolling cart with a DVD player on the shelf" draggable="false">
            <div class="dvd-screen" data-screen style="left:${pc(SCREEN.x, CART.w)};top:${pc(SCREEN.y, CART.h)};width:${pc(SCREEN.w, CART.w)};height:${pc(SCREEN.h, CART.h)}">
              <div class="dvd-content" data-content></div>
              <div class="dvd-osd" data-osd></div>
              <div class="dvd-glass"></div>
            </div>
            <button class="hot tv-power" data-act="power" aria-label="TV power" style="left:${pc(415, CART.w)};top:${pc(578, CART.h)};width:${pc(72, CART.w)};height:${pc(48, CART.h)}"></button>
            <div class="tray" data-tray style="left:${pc(TRAY.x, CART.w)};top:${pc(TRAY.y, CART.h)};width:${pc(TRAY.w, CART.w)};height:${pc(TRAY.h, CART.h)}"><i></i></div>
            <div class="vfd" data-vfd style="left:${pc(VFD.x, CART.w)};top:${pc(VFD.y, CART.h)};width:${pc(VFD.w, CART.w)};height:${pc(VFD.h, CART.h)}"></div>
            ${DVD_BTNS.map((b) => `<button class="hot dvd-btn" data-act="${b.act}" aria-label="DVD ${b.label}" style="left:${pc(b.x, CART.w)};top:${pc(898, CART.h)};width:${pc(84, CART.w)};height:${pc(40, CART.h)}"></button>`).join("")}
          </div>
        </div>
        <div class="remote-wrap">
          <div class="remote" data-remote style="aspect-ratio:${RM.w}/${RM.h}">
            <img src="assets/objects/dvd-remote.webp" alt="DVD remote control" draggable="false">
            ${REMOTE.map((b) => `<button class="hot rm-btn" data-act="${b.act}" ${b.n !== undefined ? `data-n="${b.n}"` : ""} aria-label="Remote: ${b.label}" style="left:${pc(b.x, RM.w)};top:${pc(b.y, RM.h)};width:${pc(b.w, RM.w)};height:${pc(b.h, RM.h)};border-radius:${b.r || "14px"}"></button>`).join("")}
          </div>
          <p class="remote-hint">Use the remote, the player, or your keyboard: <span class="kbd">←</span><span class="kbd">↑</span><span class="kbd">↓</span><span class="kbd">→</span> <span class="kbd">Enter</span> <span class="kbd">Esc</span></p>
        </div>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const content = $("[data-content]"), osd = $("[data-osd]"), vfd = $("[data-vfd]"), tray = $("[data-tray]"), cart = $("[data-cart]");

    /* ---------- little helpers ---------- */
    let osdTimer = 0;
    const flash = (t) => { osd.textContent = t; osd.classList.add("is-on"); clearTimeout(osdTimer); osdTimer = setTimeout(() => osd.classList.remove("is-on"), 1500); };
    const setVFD = (t) => { vfd.textContent = power ? t : ""; };
    const timers = [];
    const later = (fn, ms) => { const id = setTimeout(fn, reducedMotion() ? Math.min(ms, 60) : ms); timers.push(id); return id; };
    const clearLater = () => { while (timers.length) clearTimeout(timers.pop()); };

    /* ---------- screens ---------- */
    function render(name, opts = {}) {
      screen = name;
      content.dataset.screen = name;
      if (name !== "play") stopVideo();
      if (name === "off") { content.innerHTML = ""; setVFD(""); return; }
      if (name === "boot") return boot();
      if (name === "main") { lastMenu = "main"; content.innerHTML = mainHTML(); setVFD("MENU"); }
      if (name === "scenes") { lastMenu = "scenes"; content.innerHTML = scenesHTML(); setVFD(`CH ${String(page * PER_PAGE + 1).padStart(2, "0")}`); }
      if (name === "discs") { lastMenu = "discs"; content.innerHTML = discsHTML(); setVFD("DISC"); }
      if (name === "extras") { lastMenu = "extras"; content.innerHTML = extrasHTML(); setVFD("EXTRA"); }
      const items = [...content.querySelectorAll("[data-item]")];
      const want = opts.focus ? content.querySelector(`[data-item="${opts.focus}"]`) : items[0];
      focusItem(want || items[0]);
    }
    function boot() {
      clearLater();
      setVFD("LOAD");
      content.innerHTML = `<div class="dvd-warning"><h3>WARNING</h3><p>This basement contains original performances, homemade music videos and a few drum covers played way too loud.</p><p>Unauthorized fun is strongly encouraged.</p><small>Press ENTER to skip</small></div>`;
      later(() => {
        if (screen !== "boot") return;
        content.innerHTML = `
          <div class="dvd-logo">
            <div class="ident">
              <div class="ident-disc" aria-hidden="true"><i></i></div>
              <div class="ident-word"><b>VINCE DOUD</b><span>BASEMENT HOME VIDEO</span></div>
            </div>
          </div>`;
        later(() => screen === "boot" && render("main"), 2300);
      }, 2300);
    }

    const bgMosaic = () => {
      const ids = videos.slice(0, 24).map((v) => v.id);
      return `<div class="menu-bg" aria-hidden="true"><div class="menu-bg-grid">${[...ids, ...ids].map((id) => `<img src="${thumb(id)}" alt="">`).join("")}</div></div>`;
    };
    const mainHTML = () => `
      ${bgMosaic()}
      <div class="menu-main">
        <div class="menu-title"><span class="menu-kicker">THE BASEMENT SESSIONS</span><h3>VINCE<br>DOUD</h3><span class="menu-disc">DISC: ${esc(DISCS.find((d) => d.id === disc).label.toUpperCase())}</span></div>
        <ul class="menu-list">
          ${[["playall", "Play All"], ["scenes", "Scene Selection"], ["discs", "Collections"], ["extras", "Extras"]].map(([id, label]) => `<li><button data-item="${id}"><i class="menu-pick" aria-hidden="true"></i>${label}</button></li>`).join("")}
        </ul>
      </div>`;
    const pages = () => Math.max(1, Math.ceil(list().length / PER_PAGE));
    const scenesHTML = () => {
      const L = list(); page = clamp(page, 0, pages() - 1);
      const slice = L.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
      return `
        <div class="menu-scenes">
          <header><h3>Scene Selection</h3><span>${esc(DISCS.find((d) => d.id === disc).label)} · ${page + 1} / ${pages()}</span></header>
          <div class="scene-grid">
            ${slice.map((v, k) => { const i = page * PER_PAGE + k; return `
              <button class="scene" data-item="scene-${i}" data-i="${i}">
                <span class="scene-img"><img src="${thumb(v.id)}" alt=""><b>${k + 1}</b>${canEmbed(v) ? "" : `<em>YouTube ↗</em>`}</span>
                <span class="scene-title">${esc(title(v))}</span>
              </button>`; }).join("")}
          </div>
          <footer>
            <button data-item="prevpage" ${page === 0 ? "data-dim" : ""}>◀ Prev</button>
            <button data-item="main">Main Menu</button>
            <button data-item="nextpage" ${page >= pages() - 1 ? "data-dim" : ""}>Next ▶</button>
          </footer>
        </div>`;
    };
    const discsHTML = () => `
      <div class="menu-discs">
        <header><h3>Collections</h3><span>Choose a disc</span></header>
        <div class="disc-row">
          ${DISCS.map((d) => `<button class="disc-pick" data-item="disc-${d.id}" style="--c:${d.color}"><span class="disc-art"><i></i></span><b>${esc(d.label)}</b><small>${videos.filter((v) => v.collection === d.id).length} videos</small>${d.id === disc ? `<em>LOADED</em>` : ""}</button>`).join("")}
        </div>
        <footer><button data-item="main">Main Menu</button></footer>
      </div>`;
    const extrasHTML = () => `
      <div class="menu-extras">
        <header><h3>Extras</h3></header>
        <ul class="menu-list is-small">
          <li><button data-item="x-channel"><i class="menu-pick"></i>The full channel on YouTube ↗</button></li>
          <li><button data-item="x-bandcamp"><i class="menu-pick"></i>Original music on Bandcamp ↗</button></li>
          <li><button data-item="x-credits"><i class="menu-pick"></i>Credits</button></li>
          <li><button data-item="main"><i class="menu-pick"></i>Main Menu</button></li>
        </ul>
        <p class="menu-note">${videos.length} recordings: ${DISCS.map((d) => `${videos.filter((v) => v.collection === d.id).length} ${d.label.toLowerCase()}`).join(", ")}.</p>
      </div>`;

    /* ---------- focus + spatial navigation ---------- */
    function focusItem(el) {
      if (!el) return;
      content.querySelectorAll("[data-item].is-hi").forEach((x) => x.classList.remove("is-hi"));
      el.classList.add("is-hi"); sel = el.dataset.item;
    }
    function move(dir) {
      const items = [...content.querySelectorAll("[data-item]")];
      const cur = content.querySelector("[data-item].is-hi"); if (!cur) return focusItem(items[0]);
      const r0 = cur.getBoundingClientRect(), c0 = { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 };
      let best = null, bestScore = Infinity;
      for (const el of items) {
        if (el === cur) continue;
        const r = el.getBoundingClientRect(), c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        const dx = c.x - c0.x, dy = c.y - c0.y;
        const along = dir === "left" ? -dx : dir === "right" ? dx : dir === "up" ? -dy : dy;
        const across = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
        if (along <= 4) continue;
        const score = along + across * 2.2;
        if (score < bestScore) { bestScore = score; best = el; }
      }
      if (best) { focusItem(best); tick(0.03); }
      else if (screen === "scenes" && (dir === "right" || dir === "left")) turnPage(dir === "right" ? 1 : -1);
    }
    function turnPage(d) {
      const np = clamp(page + d, 0, pages() - 1); if (np === page) return;
      page = np; render("scenes", { focus: d > 0 ? `scene-${page * PER_PAGE}` : `scene-${page * PER_PAGE + PER_PAGE - 1}` });
    }
    function activate(id = sel) {
      if (!id) return;
      tick(0.05);
      if (id === "playall") { playAll = true; play(0); }
      else if (id === "scenes") { page = 0; render("scenes"); }
      else if (id === "discs") render("discs", { focus: `disc-${disc}` });
      else if (id === "extras") render("extras");
      else if (id === "main") render("main", { focus: lastMenu === "scenes" ? "scenes" : lastMenu === "discs" ? "discs" : lastMenu === "extras" ? "extras" : "playall" });
      else if (id === "prevpage") turnPage(-1);
      else if (id === "nextpage") turnPage(1);
      else if (id.startsWith("scene-")) { playAll = false; play(+id.slice(6)); }
      else if (id.startsWith("disc-")) loadDisc(id.slice(5));
      else if (id === "x-channel") open(SITE.youtube, "_blank", "noopener");
      else if (id === "x-bandcamp") open(SITE.bandcamp, "_blank", "noopener");
      else if (id === "x-credits") credits();
    }
    function credits() {
      screen = "credits"; content.dataset.screen = "credits";
      content.innerHTML = `<div class="menu-credits"><div class="credits-roll"><p>DIRECTED BY</p><h4>Vince Doud</h4><p>DRUMS · GUITAR · KEYS</p><h4>Vince Doud</h4><p>CAMERA (MOSTLY ON A TRIPOD)</p><h4>Vince Doud</h4><p>FILMED IN</p><h4>The Basement</h4><p>SPECIAL THANKS</p><h4>Everyone who watched</h4><p class="credits-end">Press MENU</p></div></div>`;
      setVFD("END");
    }
    function loadDisc(id) {
      if (id === disc) return render("main");
      disc = id; page = 0;
      history.replaceState(null, "", `/video/${id}`);
      ejectThen(() => render("main"));
    }
    function ejectThen(fn) {
      clearLater();
      stopVideo();
      trayOpen = true; tray.classList.add("is-open"); setVFD("OPEN");
      content.dataset.screen = "load"; content.innerHTML = `<div class="dvd-loading">DISC LOADING…</div>`;
      later(() => { tray.classList.remove("is-open"); trayOpen = false; setVFD("LOAD"); }, 900);
      later(fn, 1700);
    }

    /* ---------- playback ---------- */
    let ytReady = false;
    function play(i) {
      const L = list(); if (!L.length) return;
      playing = clamp(i, 0, L.length - 1); paused = false;
      const v = L[playing];
      screen = "play"; content.dataset.screen = "play";
      page = Math.floor(playing / PER_PAGE);
      setVFD(`PLAY ${String(playing + 1).padStart(2, "0")}`);
      if (!canEmbed(v)) {
        content.innerHTML = `
          <div class="dvd-blocked" style="background-image:url('${thumb(v.id, "hqdefault")}')">
            <div><p class="dvd-blocked-k">This scene only plays on YouTube</p><p class="dvd-blocked-t">${esc(title(v))}</p>
            <a class="btn" href="${esc(v.sourceUrl)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
            <p class="dvd-blocked-h">◀◀ / ▶▶ for the previous or next scene · MENU to go back</p></div>
          </div>`;
        flash("▶ PLAY");
        return;
      }
      const src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
      // The CRT layer sits over the video (and lets clicks through) so it reads like it's on that old TV.
      content.innerHTML = `<div class="crt" aria-hidden="true"><i class="crt-mask"></i><i class="crt-lines"></i><i class="crt-roll"></i></div><iframe data-yt src="${src}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      const f = content.querySelector("[data-yt]");
      ytReady = false;
      f.addEventListener("load", () => { f.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*"); ytReady = true; });
      flash("▶ PLAY");
      announce(`Playing ${title(v)}`);
    }
    function stopVideo() { const f = content.querySelector("[data-yt]"); if (f) f.src = "about:blank"; playing = screen === "play" ? playing : -1; }
    const yt = (func) => content.querySelector("[data-yt]")?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    S.on(window, "message", (e) => {
      if (!/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(e.origin)) return;
      let d; try { d = JSON.parse(e.data); } catch { return; }
      const info = d.info || {};
      if (typeof info.currentTime === "number" && screen === "play") setVFD(`${String(playing + 1).padStart(2, "0")} ${fmtTime(info.currentTime)}`);
      if (info.playerState === 0 && screen === "play") { // ended
        if (playAll && playing < list().length - 1) play(playing + 1); else render(lastMenu === "scenes" ? "scenes" : "main", { focus: `scene-${playing}` });
      }
    });

    /* ---------- the buttons ---------- */
    function press(act, n) {
      if (act === "power") return togglePower();
      if (!power) return;
      if (act === "eject") { if (trayOpen) return; return ejectThen(() => render("boot")); }
      if (screen === "boot" && (act === "enter" || act === "menu" || act === "play")) { clearLater(); return render("main"); }
      switch (act) {
        case "up": case "down": case "left": case "right":
          if (screen === "play") { if (act === "right") press("next"); else if (act === "left") press("prev"); return; }
          return move(act);
        case "enter": if (screen === "play") return press("pause"); return activate();
        case "menu": if (screen === "main") return; return render("main", { focus: screen === "play" ? "scenes" : undefined });
        case "title": page = playing >= 0 ? Math.floor(playing / PER_PAGE) : 0; return render("scenes", { focus: playing >= 0 ? `scene-${playing}` : undefined });
        case "play":
          if (screen === "play") { if (paused) { paused = false; yt("playVideo"); flash("▶ PLAY"); } return; }
          if (sel?.startsWith("scene-")) return activate();
          playAll = true; return play(0);
        case "pause": if (screen === "play" && ytReady) { paused = !paused; yt(paused ? "pauseVideo" : "playVideo"); flash(paused ? "❚❚ PAUSE" : "▶ PLAY"); } return;
        case "stop": if (screen === "play") { flash("■ STOP"); render(lastMenu === "scenes" ? "scenes" : "main", { focus: playing >= 0 ? `scene-${playing}` : undefined }); } return;
        case "next": if (screen === "play") { play(Math.min(playing + 1, list().length - 1)); flash("▶▶|"); } else if (screen === "scenes") turnPage(1); return;
        case "prev": if (screen === "play") { play(Math.max(playing - 1, 0)); flash("|◀◀"); } else if (screen === "scenes") turnPage(-1); return;
        case "num":
          if (screen === "scenes") { const el = content.querySelectorAll(".scene")[(n || 10) - 1]; if (el) { focusItem(el); activate(); } }
          return;
      }
    }
    function togglePower() {
      power = !power;
      cart.classList.toggle("is-off", !power);
      clearLater();
      if (!power) { render("off"); flash(""); } else render("boot");
    }

    root.querySelectorAll("[data-act]").forEach((b) => S.on(b, "click", () => {
      b.classList.remove("is-press"); void b.offsetWidth; b.classList.add("is-press");
      press(b.dataset.act, b.dataset.n !== undefined ? +b.dataset.n : undefined);
    }));
    S.on(content, "pointerover", (e) => { const it = e.target.closest("[data-item]"); if (it && !it.classList.contains("is-hi")) focusItem(it); });
    S.on(content, "click", (e) => { const it = e.target.closest("[data-item]"); if (it) { focusItem(it); activate(it.dataset.item); } });
    S.on(window, "keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Enter: "enter", " ": "pause", m: "menu", t: "title" };
      const act = map[e.key]; if (!act) { if (/^[0-9]$/.test(e.key)) press("num", +e.key); return; }
      if (e.target.closest?.("a,button") && (e.key === "Enter" || e.key === " ")) return;
      e.preventDefault(); press(act);
    });

    render("boot");
    S.add(() => { clearLater(); clearTimeout(osdTimer); stopVideo(); content.innerHTML = ""; });

    return {
      // Esc backs out of playback and sub-menus before leaving the room.
      onEscape() {
        if (!power) return false;
        if (screen === "play") { press("stop"); return true; }
        if (screen !== "main" && screen !== "boot" && screen !== "off") { render("main"); return true; }
        return false;
      },
      unmount() { S.dispose(); },
    };
  },
};
