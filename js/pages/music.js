import { esc, loadJSON, scope, fmtTime, tick, clamp, announce, navigate } from "../util.js";
import { SITE } from "../data.js";

/* The iPod. Music only ever plays here: closing it (the ×, Basement, Explore, Esc) stops playback for good.
   The click wheel is touch-style: just move the pointer around the ring to scroll, like a real wheel. */

const DESIGN = { w: 380, h: 632 };
const ROWS = 8;
const STEP_DEG = 24; // degrees of wheel travel per scroll step

let catalog;
async function getCatalog() {
  if (catalog) return catalog;
  const [{ albums }, { tracks }] = await Promise.all([loadJSON("data/albums.json"), loadJSON("data/tracks.json")]);
  const bySlug = Object.fromEntries(albums.map((a) => [a.slug, { ...a, tracks: [] }]));
  tracks.forEach((t) => bySlug[t.album]?.tracks.push(t));
  Object.values(bySlug).forEach((a) => a.tracks.sort((x, y) => x.trackNumber - y.trackNumber));
  catalog = {
    albums: albums.map((a) => bySlug[a.slug]).filter((a) => a.tracks.length),
    tracks,
    bySlug,
  };
  return catalog;
}

const icons = {
  play: `<svg viewBox="0 0 10 10"><path d="M2 1 L9 5 L2 9 Z"/></svg>`,
  pause: `<svg viewBox="0 0 10 10"><path d="M2 1h2.2v8H2zM5.8 1H8v8H5.8z"/></svg>`,
  next: `<svg viewBox="0 0 16 10"><path d="M1 1l6 4-6 4zM7.5 1l6 4-6 4zM14 1h1.5v8H14z"/></svg>`,
  prev: `<svg viewBox="0 0 16 10"><path d="M15 1L9 5l6 4zM8.5 1l-6 4 6 4zM.5 1H2v8H.5z"/></svg>`,
  playpause: `<svg viewBox="0 0 18 10"><path d="M1 1l6 4-6 4zM10 1h2.2v8H10zM13.8 1H16v8h-2.2z"/></svg>`,
};

export default {
  async mount(root, { route }) {
    const S = scope();
    const C = await getCatalog();
    const audio = new Audio();
    audio.preload = "metadata";

    root.innerHTML = `
      <div class="backdrop"></div>
      <div class="ipod-wash" data-wash></div>
      <section class="music" aria-label="Music player">
        <div class="ipod-fit" data-fit>
          <div class="ipod" data-ipod>
            <button class="ipod-close" data-close aria-label="Close the iPod and stop the music">×</button>
            <div class="ipod-screen" data-screen role="application" aria-roledescription="iPod" aria-label="iPod screen">
              <div class="scr-bar">
                <span class="scr-state" data-state></span>
                <span class="scr-title" data-title>iPod</span>
                <span class="scr-batt" aria-hidden="true"><i></i></span>
              </div>
              <div class="scr-body" data-body></div>
              <div class="scr-vol" data-vol aria-hidden="true"><span>Volume</span><div><i data-vol-bar></i></div></div>
            </div>
            <div class="wheel" data-wheel>
              <div class="wheel-sheen" data-sheen></div>
              <div class="wheel-thumb" data-thumb></div>
              <button class="wheel-btn is-menu" data-act="menu" aria-label="Menu, go back">MENU</button>
              <button class="wheel-btn is-next" data-act="next" aria-label="Next track">${icons.next}</button>
              <button class="wheel-btn is-play" data-act="play" aria-label="Play or pause">${icons.playpause}</button>
              <button class="wheel-btn is-prev" data-act="prev" aria-label="Previous track">${icons.prev}</button>
              <button class="wheel-center" data-act="select" aria-label="Select"></button>
            </div>
          </div>
        </div>
        <aside class="music-help">
          <p>Spin the wheel to scroll.<br>Press the middle to pick.</p>
          <p class="sr-only">Keyboard: the up and down arrows scroll, Enter picks, the left arrow goes back and Space plays or pauses.</p>
        </aside>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const fitEl = $("[data-fit]"), body = $("[data-body]"), titleEl = $("[data-title]"), stateEl = $("[data-state]");
    const wheel = $("[data-wheel]"), sheen = $("[data-sheen]"), thumb = $("[data-thumb]"), wash = $("[data-wash]");
    const volEl = $("[data-vol]"), volBar = $("[data-vol-bar]");

    /* ---------- scale the iPod to the window ---------- */
    const fit = () => {
      const s = Math.min((innerHeight * 0.84) / DESIGN.h, (innerWidth * 0.92) / DESIGN.w, 1.35);
      fitEl.style.setProperty("--s", s);
      fitEl.style.width = DESIGN.w * s + "px";
      fitEl.style.height = DESIGN.h * s + "px";
    };
    fit();
    S.on(window, "resize", fit);

    /* ---------- player state ---------- */
    let queue = [], qi = -1, volume = 0.8;
    audio.volume = volume;
    const nowTrack = () => queue[qi];

    function playQueue(list, index) {
      queue = list.slice(); qi = index;
      loadAndPlay();
    }
    function loadAndPlay() {
      const t = nowTrack(); if (!t) return;
      audio.src = t.src;
      audio.play().catch(() => {});
      wash.style.setProperty("--wash", t.color || "#444");
      wash.style.backgroundImage = `url("${t.cover}")`;
      announce(`Playing ${t.title}`);
      render();
    }
    function next() { if (qi < queue.length - 1) { qi++; loadAndPlay(); } else { audio.pause(); audio.currentTime = 0; render(); } }
    function prev() { if (audio.currentTime > 3 || qi === 0) { audio.currentTime = 0; } else if (qi > 0) { qi--; loadAndPlay(); } }
    function togglePlay() {
      if (!nowTrack()) { shuffleAll(); return; }
      audio.paused ? audio.play().catch(() => {}) : audio.pause();
    }
    function shuffleAll() {
      const list = C.tracks.slice();
      for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
      playQueue(list, 0); push(nowPlayingMenu());
    }
    S.on(audio, "ended", next);
    S.on(audio, "play", () => updateState());
    S.on(audio, "pause", () => updateState());
    S.on(audio, "timeupdate", () => updateProgress());
    S.on(audio, "loadedmetadata", () => updateProgress());

    /* ---------- menus ---------- */
    const songsAZ = C.tracks.slice().sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
    const mainMenu = () => ({
      title: "iPod",
      art: "shuffle",
      items: [
        { label: "Cover Flow", more: true, go: () => push(coverMenu()) },
        { label: "Albums", more: true, go: () => push(albumsMenu()) },
        { label: "Songs", more: true, go: () => push(songsMenu()) },
        { label: "Shuffle Songs", go: shuffleAll },
        ...(nowTrack() ? [{ label: "Now Playing", more: true, go: () => push(nowPlayingMenu()) }] : []),
        { label: "Bandcamp", ext: true, go: () => open(SITE.bandcamp, "_blank", "noopener") },
      ],
    });
    const albumsMenu = () => ({
      title: "Albums",
      art: "album",
      items: C.albums.map((a) => ({ label: a.title, sub: `${a.tracks.length} songs`, album: a, more: true, go: () => push(albumMenu(a)) })),
    });
    const albumMenu = (a) => ({
      title: a.title,
      art: "album",
      items: [
        { label: "Play All", album: a, go: () => { playQueue(a.tracks, 0); push(nowPlayingMenu()); } },
        ...a.tracks.map((t, i) => ({ label: t.title, album: a, time: t.duration, track: t, go: () => { playQueue(a.tracks, i); push(nowPlayingMenu()); } })),
      ],
    });
    const songsMenu = () => ({
      title: "Songs",
      items: songsAZ.map((t, i) => ({ label: t.title, track: t, sub: C.bySlug[t.album]?.title, go: () => { playQueue(songsAZ, i); push(nowPlayingMenu()); } })),
    });
    const nowPlayingMenu = () => ({ title: "Now Playing", now: true });
    const coverMenu = () => ({ title: "Cover Flow", cover: true, idx: Math.max(0, C.albums.findIndex((a) => a.slug === nowTrack()?.album)) });

    const stack = [];
    let sel = 0, top = 0;
    function push(menu) {
      if (stack.length && stack[stack.length - 1].now && menu.now) return render();
      stack.push({ menu, sel: 0, top: 0 });
      if (stack.length > 1) { const prevState = stack[stack.length - 2]; prevState.sel = sel; prevState.top = top; }
      sel = 0; top = 0;
      slide("in");
    }
    function pop() {
      if (stack.length <= 1) return false;
      stack.pop();
      const s = stack[stack.length - 1];
      s.menu = rebuild(s.menu);
      sel = s.sel; top = s.top;
      slide("out");
      return true;
    }
    const rebuild = (m) => (m.title === "iPod" ? mainMenu() : m);
    const cur = () => stack[stack.length - 1].menu;

    function slide(dir) {
      body.dataset.slide = dir;
      render();
      body.getBoundingClientRect();
      requestAnimationFrame(() => (body.dataset.slide = ""));
    }

    function scroll(delta) {
      const m = cur();
      if (m.now) { setVolume(volume + delta * 0.05); return; }
      if (m.cover) { const ni = clamp(m.idx + delta, 0, C.albums.length - 1); if (ni !== m.idx) { m.idx = ni; tick(); renderCover(); } return; }
      const n = m.items.length;
      const ns = clamp(sel + delta, 0, n - 1);
      if (ns === sel) return;
      sel = ns;
      if (sel < top) top = sel;
      if (sel >= top + ROWS) top = sel - ROWS + 1;
      tick();
      renderList();
    }
    function select() {
      const m = cur();
      if (m.now) { togglePlay(); return; }
      if (m.cover) { push(albumMenu(C.albums[m.idx])); return; }
      m.items[sel]?.go();
    }
    let volTimer = 0;
    function setVolume(v) {
      volume = clamp(v, 0, 1); audio.volume = volume; tick(0.03);
      volBar.style.width = volume * 100 + "%";
      volEl.classList.add("is-on");
      clearTimeout(volTimer); volTimer = setTimeout(() => volEl.classList.remove("is-on"), 1100);
    }

    /* ---------- rendering ---------- */
    function render() {
      const m = cur();
      titleEl.textContent = m.title;
      updateState();
      if (m.now) renderNow(); else if (m.cover) renderCover(true); else renderList(true);
    }
    function renderList(full) {
      const m = cur();
      const it = m.items[sel];
      const art = m.art === "album" && it?.album ? it.album.cover : null;
      const showArt = m.art === "shuffle" || art;
      if (full || !body.querySelector(".scr-list") || body.dataset.kind !== (showArt ? "split" : "list")) {
        body.dataset.kind = showArt ? "split" : "list";
        body.innerHTML = `<ul class="scr-list" role="listbox" aria-label="${esc(m.title)}"></ul>${showArt ? `<div class="scr-art"><img alt="" data-art></div>` : ""}`;
      }
      const ul = body.querySelector(".scr-list");
      ul.innerHTML = m.items
        .slice(top, top + ROWS)
        .map((x, k) => {
          const i = top + k, on = i === sel;
          const playing = x.track && nowTrack() === x.track;
          return `<li role="option" aria-selected="${on}" class="${on ? "is-sel" : ""}" data-i="${i}">
            <span class="row-label">${playing ? `<i class="row-spk">${icons.play}</i>` : ""}${esc(x.label)}</span>
            ${x.more ? `<span class="row-more">›</span>` : x.time ? `<span class="row-time">${fmtTime(x.time)}</span>` : ""}
          </li>`;
        })
        .join("");
      if (m.items.length > ROWS) {
        const pct = top / (m.items.length - ROWS);
        ul.insertAdjacentHTML("beforeend", `<span class="scr-scroll"><i style="height:${(ROWS / m.items.length) * 100}%;top:${pct * (100 - (ROWS / m.items.length) * 100)}%"></i></span>`);
      }
      const img = body.querySelector("[data-art]");
      if (img) {
        const src = art || (nowTrack()?.cover ?? C.albums[(Math.floor(Date.now() / 4000)) % C.albums.length].cover);
        if (img.getAttribute("src") !== src) { img.classList.remove("is-in"); img.src = src; img.onload = () => img.classList.add("is-in"); }
      }
    }
    function renderCover(full) {
      const m = cur();
      if (full || !body.querySelector(".cf")) {
        body.dataset.kind = "cover";
        body.innerHTML = `<div class="cf"><div class="cf-row">${C.albums.map((a, i) => `<img src="${a.cover}" alt="" data-cf="${i}">`).join("")}</div><p class="cf-title"></p><p class="cf-sub"></p></div>`;
      }
      body.querySelectorAll("[data-cf]").forEach((img) => {
        const o = +img.dataset.cf - m.idx, s = Math.sign(o), a = Math.abs(o);
        img.style.transform = o === 0 ? "translateX(-50%) translateZ(46px)" : `translateX(calc(-50% + ${s * (72 + (a - 1) * 26)}px)) rotateY(${-s * 70}deg)`;
        img.style.zIndex = 100 - a;
        img.style.filter = o === 0 ? "none" : `brightness(${Math.max(0.35, 0.8 - a * 0.1)})`;
      });
      const al = C.albums[m.idx];
      body.querySelector(".cf-title").textContent = al.title;
      body.querySelector(".cf-sub").textContent = `${al.tracks.length} songs · ${m.idx + 1} of ${C.albums.length}`;
    }
    function renderNow() {
      const t = nowTrack();
      body.dataset.kind = "now";
      if (!t) { body.innerHTML = `<div class="np-empty">Nothing playing.<br><small>Press ▶❚❚ to shuffle.</small></div>`; return; }
      const album = C.bySlug[t.album];
      body.innerHTML = `
        <div class="np">
          <div class="np-art"><img src="${t.cover}" alt=""><img class="np-reflect" src="${t.cover}" alt=""></div>
          <div class="np-meta">
            <p class="np-count">${qi + 1} of ${queue.length}</p>
            <p class="np-title">${esc(t.title)}</p>
            <p class="np-album">${esc(album?.title || t.collection || "")}</p>
          </div>
          <div class="np-progress">
            <div class="np-bar" data-scrub role="slider" tabindex="0" aria-label="Song position" aria-valuemin="0" aria-valuemax="${Math.round(t.duration || 0)}" aria-valuenow="0"><i data-prog></i><b class="np-knob" aria-hidden="true"></b></div>
            <div class="np-times"><span data-el>0:00</span><span data-rem>-${fmtTime(t.duration)}</span></div>
          </div>
        </div>`;
      updateProgress();
    }
    const trackLength = () => (Number.isFinite(audio.duration) && audio.duration) || nowTrack()?.duration || 0;
    function updateProgress(at) {
      const p = body.querySelector("[data-prog]"); if (!p) return;
      if (scrubbing && at === undefined) return; // the finger on the bar wins over the playhead
      const d = trackLength(), c = at ?? (audio.currentTime || 0);
      p.style.width = d ? (c / d) * 100 + "%" : "0";
      p.parentElement.style.setProperty("--at", p.style.width);
      body.querySelector("[data-el]").textContent = fmtTime(c);
      body.querySelector("[data-rem]").textContent = "-" + fmtTime(d - c);
      p.parentElement.setAttribute("aria-valuenow", Math.round(c));
      p.parentElement.setAttribute("aria-valuetext", `${fmtTime(c)} of ${fmtTime(d)}`);
    }

    /* ---------- scrubbing: click or drag the progress bar to jump around the song ---------- */
    let scrubbing = false, scrubAt = 0;
    const seekTo = (sec) => {
      const d = trackLength(); if (!d) return;
      sec = Math.max(0, Math.min(d - 0.25, sec));
      try { audio.currentTime = sec; } catch {}
      updateProgress(sec);
    };
    const barTime = (bar, e) => {
      const r = bar.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * trackLength();
    };
    S.on(body, "pointerdown", (e) => {
      const bar = e.target.closest("[data-scrub]"); if (!bar || !nowTrack()) return;
      e.preventDefault(); e.stopPropagation();
      scrubbing = true; bar.classList.add("is-scrubbing");
      bar.setPointerCapture(e.pointerId);
      scrubAt = barTime(bar, e); updateProgress(scrubAt);
      const move = (ev) => { scrubAt = barTime(bar, ev); updateProgress(scrubAt); };
      const up = () => {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
        scrubbing = false; bar.classList.remove("is-scrubbing");
        seekTo(scrubAt);
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });
    S.on(body, "keydown", (e) => {
      if (!e.target.closest("[data-scrub]")) return;
      const step = { ArrowRight: 5, ArrowLeft: -5, PageUp: 30, PageDown: -30 }[e.key];
      if (step) { e.preventDefault(); e.stopPropagation(); seekTo((audio.currentTime || 0) + step); }
      else if (e.key === "Home") { e.preventDefault(); seekTo(0); }
    });
    function updateState() {
      stateEl.innerHTML = nowTrack() ? (audio.paused ? icons.pause : icons.play) : "";
      root.querySelector(".ipod").classList.toggle("is-playing", !!nowTrack() && !audio.paused);
    }

    /* ---------- the click wheel ---------- */
    const W = { cx: 0, cy: 0, r: 0 };
    const measure = () => { const r = wheel.getBoundingClientRect(); W.cx = r.left + r.width / 2; W.cy = r.top + r.height / 2; W.r = r.width / 2; };
    let lastAng = null, acc = 0, spin = 0, downAt = null, moved = 0;
    const angleOf = (e) => (Math.atan2(e.clientY - W.cy, e.clientX - W.cx) * 180) / Math.PI;
    const onRing = (e) => {
      const d = Math.hypot(e.clientX - W.cx, e.clientY - W.cy);
      return d > W.r * 0.36 && d < W.r * 1.02;
    };
    S.on(wheel, "pointerenter", () => { measure(); lastAng = null; });
    S.on(wheel, "pointermove", (e) => {
      if (!W.r) measure();
      if (!onRing(e)) { lastAng = null; thumb.classList.remove("is-on"); return; }
      const a = angleOf(e);
      thumb.classList.add("is-on");
      thumb.style.transform = `rotate(${a + 90}deg)`;
      if (lastAng !== null) {
        let d = a - lastAng;
        if (d > 180) d -= 360; if (d < -180) d += 360;
        acc += d; spin += d; moved += Math.abs(d);
        sheen.style.transform = `rotate(${spin}deg)`;
        while (acc >= STEP_DEG) { acc -= STEP_DEG; scroll(1); }
        while (acc <= -STEP_DEG) { acc += STEP_DEG; scroll(-1); }
      }
      lastAng = a;
    });
    S.on(wheel, "pointerleave", () => { lastAng = null; acc = 0; thumb.classList.remove("is-on"); });
    S.on(wheel, "pointerdown", (e) => { if (e.pointerType === "touch") { measure(); wheel.setPointerCapture(e.pointerId); } downAt = Date.now(); moved = 0; });
    S.on(wheel, "wheel", (e) => { e.preventDefault(); scroll(e.deltaY > 0 ? 1 : -1); spin += e.deltaY > 0 ? 12 : -12; sheen.style.transform = `rotate(${spin}deg)`; }, { passive: false });

    root.querySelectorAll("[data-act]").forEach((b) =>
      S.on(b, "click", (e) => {
        // A swipe that ends over a label is a scroll, not a press.
        if (moved > STEP_DEG * 1.5 && downAt && Date.now() - downAt > 120 && b.dataset.act !== "select") { moved = 0; return; }
        tick(0.06);
        b.classList.add("is-press"); setTimeout(() => b.classList.remove("is-press"), 140);
        const act = b.dataset.act;
        if (act === "menu") pop();
        else if (act === "select") select();
        else if (act === "play") togglePlay();
        else if (act === "next") { if (nowTrack()) next(); }
        else if (act === "prev") { if (nowTrack()) prev(); }
      }),
    );
    S.on(body, "click", (e) => {
      const cf = e.target.closest("[data-cf]");
      if (cf) { const m = cur(); const i = +cf.dataset.cf; if (i === m.idx) select(); else { m.idx = i; tick(); renderCover(); } return; }
      const li = e.target.closest("li[data-i]"); if (!li) return;
      const i = +li.dataset.i;
      if (i === sel) select(); else { sel = i; tick(); renderList(); }
    });

    S.on(window, "keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "ArrowDown") { e.preventDefault(); scroll(1); }
      else if (k === "ArrowUp") { e.preventDefault(); scroll(-1); }
      else if (k === "ArrowRight" || k === "Enter") { if (e.target.closest?.("button,a") && k === "Enter") return; e.preventDefault(); select(); }
      else if (k === "ArrowLeft" || k === "Backspace") { e.preventDefault(); pop(); }
      else if (k === " ") { if (e.target.closest?.("button,a")) return; e.preventDefault(); togglePlay(); }
    });

    const stopAll = () => { audio.pause(); audio.removeAttribute("src"); audio.load(); };
    S.on(root.querySelector("[data-close]"), "click", () => { stopAll(); navigate("/"); });

    // Refresh the shuffle artwork slowly on the main menu.
    S.interval(() => { const m = cur(); if (m.art === "shuffle" && !nowTrack()) renderList(); }, 4000);

    stack.push({ menu: mainMenu(), sel: 0, top: 0 });
    render();
    requestAnimationFrame(measure);
    S.on(window, "resize", () => requestAnimationFrame(measure));

    return {
      // Esc backs out of iPod menus first, then closes the iPod.
      onEscape() { return pop(); },
      unmount() { stopAll(); clearTimeout(volTimer); S.dispose(); },
    };
  },
};
