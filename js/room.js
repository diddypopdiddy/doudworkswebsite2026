import { esc, loadJSON, scope, easternNow, reducedMotion, wait, navigate, isSmallScreen } from "./util.js";
import { SPACES, ORDER, SITE } from "./data.js";

/* The basement homepage.
   One baked background (empty room, rugs, cords, decks, record console, desk and every shadow),
   then one sprite per clickable object, back to front, from data/room-layout.json
   (built by tools/build_room.py). Hover testing reads each sprite's real alpha, so only the
   object itself lights up and objects in front block the ones behind them. */

const ART = "assets/room/";

// Paper label positions (room px). `above` hangs the label over the point instead of under it.
const ANCHORS = {
  payphone: { x: 252, y: 128, above: true },
  whiteboard: { x: 1172, y: 336 },
  ipod: { x: 770, y: 128, above: true },
  bookshelf: { x: 982, y: 352 },
  "art-table": { x: 530, y: 426 },
  organ: { x: 150, y: 622 },
  amp: { x: 433, y: 478 },
  guitar: { x: 336, y: 502 },
  keyboard: { x: 712, y: 704 },
  drums: { x: 300, y: 1000, above: true },
  wallet: { x: 1142, y: 452, above: true },
  laptop: { x: 1242, y: 566 },
  "tv-cart": { x: 853, y: 636, above: true },
  camera: { x: 1060, y: 580, above: true },
  softbox: { x: 1211, y: 576, above: true },
};
const GROUP_HOME = { art: "art-table", music: "keyboard", video: "tv-cart", teaching: "bookshelf", ai: "laptop", about: "wallet", contact: "payphone" };
// Little things on the record console that aren't rooms: click the lamp or the record.
const TOYS = [
  { id: "lamp", x: 709, y: 66, w: 56, h: 84, label: "Lamp", verb: (on) => (on ? "lights off" : "lights on"), at: { x: 737, y: 62, above: true } },
  { id: "record", x: 787, y: 117, w: 101, h: 46, label: "Record", verb: (on) => (on ? "stop it" : "spin it"), at: { x: 838, y: 112, above: true } },
];
const TOUR = ["music", "art", "teaching", "ai", "about", "video", "contact"];

// Whiteboard writing area: top-left, top-right and bottom-left corners (room px), plus its local size.
const BOARD = { tl: [1094, 116], tr: [1256, 174], bl: [1092, 246], w: 172, h: 130 };

let layoutCache;
const maskCache = new Map();

function buildMask(img, w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const a = new Uint8Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
  return a;
}

const box = (r) => `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`;

export default {
  async mount(root, { from }) {
    layoutCache ||= await loadJSON("data/room-layout.json");
    const L = layoutCache;
    const S = scope();
    const objs = L.objects;
    const byId = Object.fromEntries(objs.map((o) => [o.id, o]));

    root.innerHTML = `
      <section class="room" aria-label="Vince Doud’s basement">
        <div class="room-cam" data-cam>
          <div class="room-stage" data-stage style="width:${L.width}px;height:${L.height}px">
            <img class="room-bg" src="${ART}room-bg-2x.webp" alt="" width="${L.width}" height="${L.height}" draggable="false">
            <div class="room-hero" data-hero> <!-- painted on the carpet, under everything else -->
              <p class="room-kicker">${esc(SITE.name)}</p>
              <h1 class="room-headline">Teacher <span>+</span><br>Creator</h1>
            </div>
            <div class="amb amb-lamp" aria-hidden="true" style="left:736px;top:100px"></div>
            <div class="amb amb-vinyl" aria-hidden="true" style="left:831px;top:131px"><i></i></div>
            ${objs.map((o) => `
              <img class="room-obj" data-id="${o.id}" data-group="${o.group}" src="${ART}${o.id}-2x.webp" alt="" style="${box(o)}" draggable="false">
              ${o.open ? `<img class="room-obj room-open" data-open-of="${o.id}" data-group="${o.group}" src="${ART}${o.id}-open-2x.webp" alt="" style="${box(o.open)}" draggable="false">` : ""}
              ${o.id === "whiteboard" ? `<div class="wb-date" data-wb aria-hidden="true"></div>` : ""}
              ${o.id === "ipod" ? `<div class="amb amb-ipod" aria-hidden="true" style="left:${o.x + o.w / 2}px;top:${o.y + o.h * 0.42}px"></div>` : ""}
            `).join("")}
            <div class="amb amb-softbox" aria-hidden="true"></div>
            <div class="room-label" data-label aria-hidden="true"><span data-label-name></span><em data-label-verb></em></div>
            <nav class="room-hotspots" aria-label="Rooms in the basement">
              ${ORDER.map((g) => {
                const a = ANCHORS[GROUP_HOME[g]];
                return `<a class="room-hotspot" href="/${g}" data-group="${g}" style="left:${a.x}px;top:${a.y}px">${esc(SPACES[g].label)}: ${esc(SPACES[g].verb)}</a>`;
              }).join("")}
            </nav>
          </div>
        </div>
        <p class="room-hint" data-hint>${matchMedia("(pointer: coarse)").matches
          ? "This is my basement. Swipe to look around. <b>Tap anything</b> to light it up, tap again to go in."
          : "This is my basement. Everything that lights up opens something. <b>Hover around.</b>"}</p>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const room = $(".room"), cam = $("[data-cam]"), stage = $("[data-stage]"), hint = $("[data-hint]");
    if (from) hint.remove(); // only greet people on the way in, not every time they come back
    const label = $("[data-label]"), labelName = $("[data-label-name]"), labelVerb = $("[data-label-verb]");
    const imgs = [...root.querySelectorAll(".room-obj")];
    const spriteOf = Object.fromEntries(imgs.filter((im) => im.dataset.id).map((im) => [im.dataset.id, im]));
    const openOf = Object.fromEntries(imgs.filter((im) => im.dataset.openOf).map((im) => [im.dataset.openOf, im]));
    const byGroup = {};
    imgs.forEach((im) => (byGroup[im.dataset.group] ||= []).push(im));

    /* ---------- fit the room to the window ---------- */
    // Wide windows: contain, with a little overscan off the bottom (just floor there) so there's
    // less black at the sides. Tall, narrow windows (phones): the room fills the height and you
    // swipe left and right through it.
    let fit = { s: 1, ox: 0, oy: 0 }, pan = false;
    const layoutStage = () => {
      const vw = room.clientWidth || innerWidth, vh = room.clientHeight || innerHeight;
      pan = (L.width * vh) / L.height > vw * 1.12;
      room.classList.toggle("is-pan", pan);
      if (pan) {
        const s = vh / L.height;
        fit = { s, ox: 0, oy: 0 };
        cam.style.width = L.width * s + "px";
        stage.style.transform = `scale(${s})`;
        return;
      }
      cam.style.width = "";
      const sw = vw / L.width, sh = vh / L.height;
      const s = sw <= sh ? sw : Math.min(sw, sh * 1.03);
      const ox = (vw - L.width * s) / 2;
      const spareY = vh - L.height * s;
      const oy = spareY >= 0 ? spareY / 2 : spareY * 0.15;
      fit = { s, ox, oy };
      stage.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
    };
    // In swipe mode, scroll so a room point (x) sits in the middle of the screen.
    const panTo = (x) => { if (pan) room.scrollLeft = x * fit.s - room.clientWidth / 2; };
    layoutStage();
    panTo(from && SPACES[from] ? byId[GROUP_HOME[from]].x + byId[GROUP_HOME[from]].w / 2 : 850);
    S.on(window, "resize", () => { const mid = (room.scrollLeft + room.clientWidth / 2) / fit.s; layoutStage(); panTo(mid); });

    /* ---------- live whiteboard date (always Eastern time) ---------- */
    const wb = $("[data-wb]");
    {
      const [tx, ty] = BOARD.tl, [rx, ry] = BOARD.tr, [bx, by] = BOARD.bl;
      const m = [(rx - tx) / BOARD.w, (ry - ty) / BOARD.w, (bx - tx) / BOARD.h, (by - ty) / BOARD.h, tx, ty];
      Object.assign(wb.style, { width: BOARD.w + "px", height: BOARD.h + "px", transform: `matrix(${m.join(",")})` });
    }
    let lastKey = "";
    const paintDate = () => {
      const now = easternNow();
      if (now.key === lastKey) return;
      lastKey = now.key;
      wb.innerHTML = `<span class="wb-day">${esc(now.weekday)},</span><span class="wb-md">${esc(now.monthDay)}</span><svg class="wb-swoosh" viewBox="0 0 120 14" aria-hidden="true"><path d="M3 9 C 30 3, 70 2, 117 7" /></svg>`;
      stage.setAttribute("aria-description", `The whiteboard reads ${now.weekday}, ${now.monthDay}`);
    };
    paintDate();
    S.interval(paintDate, 15000);

    /* ---------- masks for pixel-accurate hover ---------- */
    await Promise.all(imgs.map((im) => im.decode().catch(() => {})));
    const maskFor = (key, img, r) => {
      if (!maskCache.has(key)) {
        try { maskCache.set(key, buildMask(img, r.w, r.h)); } catch { maskCache.set(key, null); }
      }
      return maskCache.get(key);
    };
    // Each hit target: an object's own outline, plus the open wallet's (so the wallet stays lit once open).
    const targets = [];
    objs.forEach((o) => {
      targets.push({ o, r: o, m: maskFor(o.id, spriteOf[o.id], o) });
      if (o.open) targets.push({ o, r: o.open, m: maskFor(o.id + "-open", openOf[o.id], o.open) });
    });
    const hitAt = (x, y) => {
      for (let i = targets.length - 1; i >= 0; i--) {
        const { o, r, m } = targets[i];
        if (x < r.x || y < r.y || x >= r.x + r.w || y >= r.y + r.h) continue;
        if (!m) return o;
        if (m[Math.floor(y - r.y) * r.w + Math.floor(x - r.x)] > 60) return o;
      }
      return null;
    };
    const toRoom = (e) => {
      const b = stage.getBoundingClientRect();
      return [((e.clientX - b.left) / b.width) * L.width, ((e.clientY - b.top) / b.height) * L.height];
    };

    /* ---------- lighting a group ---------- */
    let active = null, lastObj = null;
    const setActive = (group, objId) => {
      if (group !== active) {
        if (active) byGroup[active]?.forEach((im) => im.classList.remove("is-lit"));
        active = group;
        stage.dataset.active = group || "";
        if (group) byGroup[group]?.forEach((im) => im.classList.add("is-lit"));
      }
      if (!group) { label.classList.remove("is-on"); stage.style.cursor = ""; return; }
      stage.style.cursor = "pointer";
      const a = ANCHORS[objId] || ANCHORS[GROUP_HOME[group]];
      labelName.textContent = SPACES[group].label;
      labelVerb.textContent = SPACES[group].verb;
      label.style.left = a.x + "px";
      label.style.top = a.y + "px";
      label.classList.toggle("is-above", !!a.above);
      label.classList.add("is-on");
    };

    /* ---------- the lamp and the record ---------- */
    // Both remember how you left them for the rest of the visit.
    const toyState = { lamp: true, record: true };
    try { Object.assign(toyState, JSON.parse(sessionStorage.getItem("vd-room-toys") || "{}")); } catch {}
    const paintToys = () => {
      stage.classList.toggle("lights-off", !toyState.lamp);
      stage.classList.toggle("record-stopped", !toyState.record);
    };
    paintToys();
    const toyAt = (x, y) => TOYS.find((t) => x >= t.x && y >= t.y && x < t.x + t.w && y < t.y + t.h) || null;
    const showToy = (t) => {
      stage.style.cursor = "pointer";
      labelName.textContent = t.label;
      labelVerb.textContent = t.verb(toyState[t.id]);
      label.style.left = t.at.x + "px";
      label.style.top = t.at.y + "px";
      label.classList.toggle("is-above", !!t.at.above);
      label.classList.add("is-on");
    };
    const flipToy = (t) => {
      toyState[t.id] = !toyState[t.id];
      try { sessionStorage.setItem("vd-room-toys", JSON.stringify(toyState)); } catch {}
      paintToys();
      showToy(t);
    };

    let hovered = false;
    S.on(stage, "pointermove", (e) => {
      if (e.pointerType === "touch") return;
      // A cursor that was already resting on the page fires a still "move" on load; ignore it.
      if (touring && !e.movementX && !e.movementY) return;
      stopTour();
      const p = toRoom(e);
      const o = hitAt(...p);
      if (o) lastObj = o.id;
      setActive(o?.group || null, o?.id);
      if (!o) { const t = toyAt(...p); if (t) showToy(t); }
      if (!hovered && o) { hovered = true; hint.classList.add("is-gone"); }
    });
    // Touch has no hover: the first tap lights a thing up, a second tap goes in.
    let pointer = "mouse";
    S.on(stage, "pointerdown", (e) => { pointer = e.pointerType; if (pointer === "touch") stopTour(); });
    S.on(stage, "pointerleave", (e) => { if (e.pointerType !== "touch") setActive(null); });
    S.on(stage, "click", (e) => {
      if (e.target.closest(".room-hotspot")) return;
      const p = toRoom(e);
      const o = hitAt(...p);
      if (!o) {
        const t = toyAt(...p);
        if (t) flipToy(t); else if (pointer === "touch") setActive(null);
        return;
      }
      lastObj = o.id;
      if (active !== o.group) {
        setActive(o.group, o.id);
        if (pointer === "touch") labelVerb.textContent = `tap again to ${SPACES[o.group].verb}`;
        if (!hovered) { hovered = true; hint.classList.add("is-gone"); }
        return;
      }
      setActive(o.group, o.id);
      navigate(`/${o.group}`);
    });

    // Keyboard: the hotspots are real links; focusing one lights its group.
    root.querySelectorAll(".room-hotspot").forEach((a) => {
      S.on(a, "focus", () => { stopTour(); lastObj = GROUP_HOME[a.dataset.group]; setActive(a.dataset.group); });
      S.on(a, "blur", () => setActive(null));
    });

    /* ---------- first visit: a quick walk through everything that lights up ---------- */
    let touring = false, tourTimer = 0;
    function stopTour() {
      if (!touring) return;
      touring = false; clearTimeout(tourTimer); setActive(null);
    }
    let seen = false;
    try { seen = sessionStorage.getItem("vd-room-tour") === "1"; sessionStorage.setItem("vd-room-tour", "1"); } catch {}
    if (!seen && !from && !reducedMotion() && !pan) {
      touring = true;
      let k = 0;
      const step = () => {
        if (!touring) return;
        if (k >= TOUR.length) { touring = false; setActive(null); return; }
        setActive(TOUR[k++]);
        tourTimer = setTimeout(step, 760);
      };
      tourTimer = setTimeout(step, 1000);
      S.add(() => clearTimeout(tourTimer));
    }

    /* ---------- camera: push in on an object ---------- */
    const focusOn = (id) => {
      const o = byId[id];
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const span = Math.max(o.w / L.width, o.h / L.height);
      return { x: fit.ox + cx * fit.s, y: fit.oy + cy * fit.s, z: Math.max(1.7, Math.min(3.4, 0.5 / span)) };
    };
    const pushTo = (f, blur) => {
      cam.style.transformOrigin = `${f.x}px ${f.y}px`;
      cam.style.transform = `scale(${f.z})`;
      cam.style.filter = `blur(${blur}px)`;
    };

    // Back from a page: start pushed in on where you were, then pull out to the whole room.
    if (from && SPACES[from] && !reducedMotion()) {
      cam.style.transition = "none";
      setActive(from, GROUP_HOME[from]);
      pushTo(focusOn(GROUP_HOME[from]), 2);
      cam.getBoundingClientRect();
      requestAnimationFrame(() => {
        cam.style.transition = "";
        cam.style.transform = "";
        cam.style.filter = "";
        tourTimer = setTimeout(() => !hovered && setActive(null), 700);
      });
    }

    return {
      async leave(to) {
        stopTour();
        if (!SPACES[to.name] || reducedMotion()) return;
        const id = byId[lastObj]?.group === to.name ? lastObj : GROUP_HOME[to.name];
        setActive(to.name, id);
        pushTo(focusOn(id), 1.5);
        await wait(400);
      },
      unmount() { S.dispose(); },
    };
  },
};
