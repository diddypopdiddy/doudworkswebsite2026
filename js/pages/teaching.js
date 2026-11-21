import { esc, scope, easternNow, reducedMotion } from "../util.js";
import { BOOKS } from "../data.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const seen = new Set(); // books already opened this visit skip the beat on the cover

/* Zoomed in on the bookshelf and whiteboard.
   Hover a book: it tips out from the top and slides toward you while its neighbors lean back.
   Click it: the book lifts out, turns from spine to cover as it flies to the middle, and opens to a spread:
   a library checkout card in the inside cover (the link) and a title page with a screenshot plate. */

// Plain spine art (trimmed sizes).
const ART = {
  "book-plain-brick": [150, 662], "book-plain-forest": [150, 745], "book-plain-ink-blue": [136, 769], "book-plain-ivory": [132, 612],
  "book-plain-ochre": [131, 708], "book-plain-plum": [134, 685], "book-plain-rust": [153, 636], "book-plain-teal": [147, 740],
};
// Shelf geometry (bookshelf.webp, 1385 × 710): lower compartment floor and side posts.
const SHELF = { w: 1385, h: 710, floorY: 568, x0: 150, x1: 1236 };
const SCALE = 0.43;
// The row, left to right. Plain books (no `id`) fill out the shelf and aren't clickable.
const ROW = [
  { art: "book-plain-rust" },
  { art: "book-plain-ink-blue" },
  { art: "book-plain-ivory" },
  { art: "book-plain-plum", lean: -7, gap: 28 },
  { book: 0 }, { book: 1 }, { book: 2 }, { book: 3, gap: 22 },
  { art: "book-plain-ink-blue" },
  { art: "book-plain-rust", lean: 6, gap: 34 },
  { stack: ["book-plain-ivory", "book-plain-plum", "book-plain-forest"] },
];

export default {
  mount(root) {
    const S = scope();
    const px = (v) => (v / SHELF.w) * 100 + "%";

    // Lay out the row and center it in the compartment.
    const row = ROW.map((r) => {
      if (r.stack) { // books lying flat: their length runs across the shelf
        const items = r.stack.map((a, j) => { const [w, h] = ART[a]; const sc = 0.36 - j * 0.02; return { art: a, len: h * sc, thick: w * sc }; });
        return { ...r, w: Math.max(...items.map((t) => t.len)), h: 0, items, gap: 0 };
      }
      const b = r.book !== undefined ? BOOKS[r.book] : null;
      const art = b ? b.art : r.art;
      const [w, h] = ART[art];
      return { ...r, b, art, w: w * SCALE, h: h * SCALE, gap: r.gap ?? 5 };
    });
    const total = row.reduce((t, p, i) => t + p.w + (i < row.length - 1 ? p.gap : 0), 0);
    let x = SHELF.x0 + (SHELF.x1 - SHELF.x0 - total) / 2;
    row.forEach((p) => { p.x = x; x += p.w + p.gap; });

    const bookHTML = (p, i) => {
      const style = `left:${px(p.x)};width:${px(p.w)};height:${(p.h / SHELF.h) * 100}%;bottom:${((SHELF.h - SHELF.floorY) / SHELF.h) * 100}%;--i:${i}`;
      if (p.stack) {
        let y = SHELF.floorY;
        return p.items.map((t, j) => {
          const left = p.x + (p.w - t.len) / 2 + (j % 2 ? 8 : -4);
          const h = `<span class="book is-filler is-lying" aria-hidden="true" style="left:${px(left)};width:${px(t.len)};height:${(t.thick / SHELF.h) * 100}%;bottom:${((SHELF.h - y) / SHELF.h) * 100}%"><img src="assets/objects/${t.art}.webp" alt="" style="width:${(t.thick / t.len) * 100}%;height:${(t.len / t.thick) * 100}%" draggable="false"></span>`;
          y -= t.thick - 1.5;
          return h;
        }).join("");
      }
      if (!p.b) return `<span class="book is-filler" data-k="${i}" style="${style};--lean:${p.lean || 0}deg" aria-hidden="true"><img src="assets/objects/${p.art}.webp" alt="" draggable="false"><i class="spine-bands"></i></span>`;
      const len = p.b.spine.length;
      return `<button class="book" data-k="${i}" data-id="${p.b.id}" style="${style};--fs:${(72 / (len * 0.82)).toFixed(2)}cqh;--c:${p.b.color}" aria-describedby="board-desc">
          <span class="book-body"><img src="assets/objects/${p.art}.webp" alt="" draggable="false">
            <i class="spine-bands"></i>
            <span class="book-spine">${esc(p.b.spine)}</span>
          </span>
          <span class="sr-only">${esc(p.b.title)}${p.b.href ? "" : " (coming soon)"}</span>
        </button>`;
    };

    root.innerHTML = `
      <section class="teach" aria-label="Teaching bookshelf">
        <div class="teach-wall"></div>
        <div class="teach-floor"></div>
        <div class="board" data-board aria-live="polite">
          <div class="board-face"><div class="board-ink" data-ink></div></div>
          <div class="board-tray"><i style="--c:#c62828"></i><i style="--c:#1d3f8f"></i><i style="--c:#2e7d32"></i><b></b></div>
        </div>
        <div class="shelf" data-shelf style="aspect-ratio:${SHELF.w}/${SHELF.h}">
          <img class="shelf-art" src="assets/objects/bookshelf.webp" alt="" draggable="false">
          <div class="shelf-books">${row.map(bookHTML).join("")}</div>
        </div>
        <div class="book-open" data-open hidden role="dialog" aria-modal="true" aria-labelledby="bo-title"></div>
      </section>`;

    const ink = root.querySelector("[data-ink]");
    const shelf = root.querySelector("[data-shelf]");
    const openEl = root.querySelector("[data-open]");
    const els = [...root.querySelectorAll(".book")];

    /* ---------- whiteboard ---------- */
    const idle = () => {
      const d = easternNow();
      ink.dataset.state = "idle";
      ink.innerHTML = `
        <p class="ink-date">${esc(d.weekday)}, ${esc(d.monthDay)}</p>
        <p class="ink-big">Today’s lesson:</p>
        <p class="ink-mid">Pull a book off the shelf <span class="ink-arrow">↓</span></p>
        <p class="ink-small" id="board-desc">Hover a book to see what’s inside. Click it to open.</p>`;
    };
    const describe = (b) => {
      ink.dataset.state = "book";
      ink.innerHTML = `
        <p class="ink-kind">${esc(b.kind)}</p>
        <p class="ink-title">${esc(b.title)}</p>
        <p class="ink-summary" id="board-desc">${esc(b.summary)}</p>
        <p class="ink-cta">${b.href ? "Click the book to open it →" : esc(b.note)}</p>`;
    };
    idle();
    S.interval(() => ink.dataset.state === "idle" && idle(), 30000);

    /* ---------- pull a book out ---------- */
    let current = null, leaveTimer = 0;
    function pull(el) {
      clearTimeout(leaveTimer);
      if (current === el) return;
      els.forEach((b) => b.classList.remove("is-pulled", "lean-l", "lean-r", "lean-l2", "lean-r2"));
      current = el;
      shelf.classList.toggle("has-pulled", !!el);
      if (!el) return idle();
      const k = +el.dataset.k;
      el.classList.add("is-pulled");
      // neighbors lean away to make room
      els.forEach((b) => {
        const j = +b.dataset.k;
        if (j === k - 1) b.classList.add("lean-l"); else if (j === k + 1) b.classList.add("lean-r");
        else if (j === k - 2) b.classList.add("lean-l2"); else if (j === k + 2) b.classList.add("lean-r2");
      });
      const b = BOOKS.find((x) => x.id === el.dataset.id);
      if (b) describe(b);
    }
    els.filter((e) => e.dataset.id).forEach((el) => {
      S.on(el, "pointerenter", () => pull(el));
      S.on(el, "focus", () => pull(el));
      S.on(el, "pointerleave", () => { leaveTimer = setTimeout(() => pull(null), 160); });
      S.on(el, "blur", () => { leaveTimer = setTimeout(() => { if (openEl.hidden) pull(null); }, 160); });
      S.on(el, "click", () => openBook(el));
    });
    // Plain books just give a little nudge.
    els.filter((e) => !e.dataset.id).forEach((el) => S.on(el, "pointerenter", () => { el.classList.remove("is-nudge"); void el.offsetWidth; el.classList.add("is-nudge"); }));

    /* ---------- open a book ----------
       The book is a real 3D box (back board, page block, spine, cover, two loose flyleaves).
       Lift it out of its slot, turn it spine → cover on the way to the middle, land, then the cover swings open,
       the flyleaves riffle after it and the pages ink in. Closing runs it back into its slot. */
    let opened = null, busy = false, flight = null, token = 0;
    const phone = () => matchMedia("(max-width: 767px)").matches;
    // Proportions (of the book's height) — keep in step with --t / --m / --bt in pages.css.
    const DIM = { t: 0.12, m: 0.018, bt: 0.011, gap: 0.004 };

    function cardHTML(b, cls) {
      const d = easternNow();
      const due = `${d.monthDay.toUpperCase()} ${d.numeric.slice(-4)}`;
      const head = `<span class="bo-card-h"><b>Basement Library</b><span>Vince Doud</span></span>
        <span class="bo-card-row"><em>Title</em><span class="bo-hand">${esc(b.title)}</span></span>`;
      return b.href
        ? `<a class="bo-card ${cls}" href="${esc(b.href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(b.action || "Open it")} (opens in a new tab)">
             ${head}
             <span class="bo-card-row is-extra"><em>Borrower</em><span class="bo-hand">you</span></span>
             <span class="bo-card-row is-extra"><em>Due</em><span class="bo-due">${esc(due)}</span></span>
             <span class="bo-stamp">Check it out →</span>
           </a>`
        : `<div class="bo-card is-onorder ${cls}">
             ${head}
             <span class="bo-card-row is-status"><em>Status</em><span class="bo-stamp is-inline">On order</span></span>
           </div>`;
    }
    const slotHTML = (b, cls) => `<div class="bo-slot ${cls}">
        ${cardHTML(b, "")}
        <span class="bo-pocket" aria-hidden="true"><b>Book pocket</b><span>${b.href ? "Pull the card to check it out" : esc(b.note || "This one’s on order.")}</span></span>
      </div>`;
    const NOTES = {
      grid: `<span style="left:9%;top:9%;--r:-6deg">where does AI belong?</span><span style="left:46%;top:21%;--r:4deg">verify it!</span><span style="left:12%;top:34%;--r:-2deg">the learner still does this →</span>`,
      film: "", map: "", ruled: `<span style="left:22%;top:10%;--r:-2deg">Round 1 —</span>`,
    };

    function spreadHTML(b) {
      return `
        <div class="bo-dim" data-dim></div>
        <div class="bo-stage" data-stage>
          <div class="bo-fly" data-fly>
            <div class="bo-book" data-bo>
              <div class="bo-back"></div>
              <div class="bo-edge is-fore"></div><div class="bo-edge is-top"></div><div class="bo-edge is-foot"></div>
              <div class="bo-spine" aria-hidden="true"><img src="assets/objects/${b.art}.webp" alt="" draggable="false"><i class="spine-bands"></i><span>${esc(b.spine)}</span></div>
              <article class="bo-page bo-right">
                <header class="bo-head bo-ink" style="--d:0"><span>${esc(b.kind)}</span><i></i></header>
                <h2 id="bo-title" class="bo-title bo-ink" style="--d:1">${esc(b.title)}</h2>
                <p class="bo-by bo-ink" style="--d:2">by Vince Doud</p>
                ${b.plate ? `<figure class="bo-plate bo-ink" style="--d:3"><span class="bo-photo"><img src="assets/media/${esc(b.plate)}" alt="Screenshot of ${esc(b.title)}" draggable="false"></span>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ""}</figure>` : ""}
                <p class="bo-summary bo-ink" style="--d:4">${esc(b.summary)}</p>
                ${slotHTML(b, "is-narrow bo-ink")}
                <footer class="bo-foot bo-ink" style="--d:5"><span>❦</span><span>1</span></footer>
              </article>
              <div class="bo-ribbon"></div>
              <div class="bo-leaf" style="--n:1"></div><div class="bo-leaf" style="--n:2"></div>
              <div class="bo-cover">
                <div class="bo-cover-front" aria-hidden="true">
                  <i class="bo-bands"></i>
                  ${b.emblem ? `<img class="bo-emblem" src="assets/media/${esc(b.emblem)}" alt="" draggable="false">` : ""}
                  <span class="bo-panel"><span>${esc(b.title)}</span></span>
                  <span class="bo-author">Vince Doud</span>
                </div>
                <div class="bo-cover-edge"></div>
                <div class="bo-cover-inside">
                  <div class="bo-endpaper" data-ep="${esc(b.endpaper || "grid")}"><span class="bo-notes" aria-hidden="true">${NOTES[b.endpaper] || ""}</span></div>
                  <span class="bo-exlibris" aria-hidden="true">${b.emblem ? `<img src="assets/media/${esc(b.emblem)}" alt="">` : ""}<b>Ex libris</b></span>
                  ${slotHTML(b, "is-wide")}
                </div>
              </div>
              <button class="bo-tab" data-close type="button"><span aria-hidden="true">↩</span> Put it back</button>
            </div>
          </div>
        </div>`;
    }

    // One transform list for every keyframe so the browser interpolates each part on its own.
    const pose = (x, y, ry, rx, s, kz) => `translate3d(${x}px, ${y}px, 0) rotateY(${ry}deg) rotateX(${rx}deg) scale3d(${s}, ${s}, ${s * kz})`;
    // Where the flying book has to start so its spine sits exactly on the shelf book.
    function fromShelf(el, stage) {
      const r = el.getBoundingClientRect(), st = stage.getBoundingClientRect();
      const H = st.height, W = st.width, P = 2400;
      const spineH = H * (1 + 2 * DIM.m), spineW = H * (DIM.t + DIM.gap + 2 * DIM.bt);
      let s = r.height / spineH;
      const zFace = (W / 4 + H * DIM.m) * s;           // the spine face comes toward you by half the cover width
      const f = P / (P - zFace);                       // perspective blows it up by this much
      s /= f;
      const kz = Math.min(3, Math.max(0.8, r.width / (spineW * s * f)));
      return { x: (r.left + r.width / 2 - (st.left + W / 2)) / f, y: (r.top + r.height / 2 - (st.top + H / 2)) / f, s, kz, lift: (r.height * 0.35) / f, H };
    }

    async function openBook(el) {
      if (busy || opened) return;
      const b = BOOKS.find((x) => x.id === el.dataset.id); if (!b) return;
      opened = el; busy = true;
      const my = ++token;
      openEl.hidden = false;
      openEl.style.setProperty("--c", b.color);
      openEl.innerHTML = spreadHTML(b);
      openEl.className = "book-open";
      openEl.dataset.book = b.id;
      const stage = openEl.querySelector("[data-stage]"), fly = openEl.querySelector("[data-fly]"), book = openEl.querySelector("[data-bo]");
      openEl.querySelector("[data-close]").addEventListener("click", closeBook);
      const focusCard = () => [...openEl.querySelectorAll("a.bo-card, [data-close]")].find((n) => n.offsetParent && getComputedStyle(n).visibility !== "hidden")?.focus({ preventScroll: true });

      if (reducedMotion()) {
        openEl.classList.add("is-reduced", "is-on", "is-open", "is-inked");
        el.classList.add("is-taken");
        busy = false; focusCard();
        return;
      }
      const p = fromShelf(el, stage), k = phone() ? 0.62 : 1;
      fly.style.transformOrigin = `50% 50% ${(p.H * (DIM.t + DIM.gap)) / 2}px`;
      el.classList.add("is-taken");
      requestAnimationFrame(() => openEl.classList.add("is-on"));
      flight = fly.animate([
        { transform: pose(p.x, p.y, 90, 0, p.s, p.kz), easing: "cubic-bezier(.3, 0, .4, 1)" },
        { transform: pose(p.x, p.y - p.lift, 90, 0, p.s, p.kz), offset: 0.21, easing: "cubic-bezier(.45, 0, .9, .6)" },
        { transform: pose(p.x * 0.45, (p.y - p.lift) * 0.45 - p.H * 0.07, 52, 3, (p.s + 1) / 2, (p.kz + 1) / 2), offset: 0.5, easing: "cubic-bezier(.1, .45, .3, 1)" },
        { transform: pose(0, -p.H * 0.02, 0, 6, 1.02, 1), offset: 0.81, easing: "cubic-bezier(.4, 0, .3, 1)" },
        { transform: pose(0, 0, 0, 0, 1, 1) },
      ], { duration: 1050 * k });
      try { await flight.finished; } catch { return; } // cancelled by a close mid-flight
      if (my !== token) return;
      flight = null;
      openEl.classList.add("is-landed");
      await wait(seen.has(b.id) ? 60 : 200);
      seen.add(b.id);
      if (my !== token) return;
      openEl.classList.add("is-open");
      await wait(450 * k);
      if (my !== token) return;
      openEl.classList.add("is-inked");
      await wait(300 * k);
      if (my !== token) return;
      busy = false;
      focusCard();
    }

    async function closeBook() {
      if (openEl.hidden || !opened) return false;
      if (openEl.classList.contains("is-closing")) return true;
      const el = opened, book = openEl.querySelector("[data-bo]"), fly = openEl.querySelector("[data-fly]"), stage = openEl.querySelector("[data-stage]");
      busy = true; token++;
      const done = () => {
        openEl.hidden = true; openEl.innerHTML = ""; openEl.className = "book-open";
        el.classList.remove("is-taken");
        el.focus({ preventScroll: true });
        opened = null; busy = false;
      };
      if (reducedMotion() || !book) { openEl.classList.remove("is-on"); await wait(reducedMotion() ? 200 : 0); return done(), true; }
      flight?.cancel(); flight = null;
      const k = phone() ? 0.62 : 1;
      const wasOpen = openEl.classList.contains("is-open");
      openEl.classList.add("is-closing");
      openEl.classList.remove("is-inked", "is-open", "is-landed");
      if (wasOpen) {
        await wait(360 * k);
        book.animate([{ scale: "1" }, { scale: ".98" }, { scale: "1" }], { duration: 140, easing: "ease-out" }); // the thump
        await wait(90);
      }
      openEl.classList.remove("is-on");
      const p = fromShelf(el, stage);
      const back = fly.animate([
        { transform: pose(0, 0, 0, 0, 1, 1), easing: "cubic-bezier(.5, 0, .7, .4)" },
        { transform: pose(p.x * 0.5, p.y * 0.5 - p.H * 0.05, 50, 0, (p.s + 1) / 2, (p.kz + 1) / 2), offset: 0.45, easing: "cubic-bezier(.2, .5, .4, 1)" },
        { transform: pose(p.x, p.y - p.lift, 90, 0, p.s, p.kz), offset: 0.78, easing: "cubic-bezier(.5, 0, .6, 1)" },
        { transform: pose(p.x, p.y, 90, 0, p.s, p.kz) },
      ], { duration: 520 * k, fill: "forwards" });
      try { await back.finished; } catch {}
      done();
      return true;
    }
    S.on(openEl, "click", (e) => { if (!busy && (e.target === openEl || e.target.matches("[data-dim], [data-stage]"))) closeBook(); });
    S.add(() => clearTimeout(leaveTimer));

    return { onEscape() { if (openEl.hidden) return false; closeBook(); return true; }, unmount() { token++; flight?.cancel(); S.dispose(); } };
  },
};
