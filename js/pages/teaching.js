import { esc, scope, easternNow, reducedMotion } from "../util.js";
import { BOOKS } from "../data.js";

/* Zoomed in on the bookshelf and whiteboard.
   Hover a book: it tips out from the top and slides toward you while its neighbors lean back.
   Click it: the book comes off the shelf, flies to the middle and opens to a page spread with the link. */

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

    /* ---------- open a book ---------- */
    let opened = null;
    function openBook(el) {
      const b = BOOKS.find((x) => x.id === el.dataset.id); if (!b) return;
      opened = el;
      const r = el.getBoundingClientRect();
      openEl.hidden = false;
      openEl.style.setProperty("--c", b.color);
      // Closed first: just the cover. It holds for a beat, then swings open to a title page (left)
      // and a table of contents (right) that carries the summary and the links.
      openEl.innerHTML = `
        <div class="bo-book" data-bo>
          <div class="bo-page bo-right">
            <p class="bo-toc-h">Contents</p>
            <ol class="bo-toc">
              <li><span class="bo-toc-row"><span class="bo-toc-t">What’s inside</span><i></i><span class="bo-toc-n">1</span></span>
                <p class="bo-toc-p">${esc(b.summary)}</p></li>
              ${b.href
                ? `<li><a class="bo-toc-row is-link" href="${esc(b.href)}" target="_blank" rel="noopener noreferrer"><span class="bo-toc-t">${esc(b.action || "Open it")}</span><i></i><span class="bo-toc-n">2</span></a></li>`
                : `<li><span class="bo-toc-row"><span class="bo-toc-t">Coming soon</span><i></i><span class="bo-toc-n">2</span></span><p class="bo-toc-p is-note">${esc(b.note)}</p></li>`}
              ${b.href && b.note ? `<li><p class="bo-toc-p is-note">${esc(b.note)}</p></li>` : ""}
              <li><button class="bo-toc-row is-close" data-close><span class="bo-toc-t">Put it back on the shelf</span><i></i><span class="bo-toc-n">3</span></button></li>
            </ol>
          </div>
          <div class="bo-cover"><div class="bo-cover-front"><span>${esc(b.title)}</span><i></i></div><div class="bo-cover-inside">
            <p class="bo-kind">${esc(b.kind)}</p>
            <h2 id="bo-title">${esc(b.title)}</h2>
            <p class="bo-by">by Vince Doud</p>
            <p class="bo-press">Basement Press · New Jersey</p>
          </div></div>
        </div>`;
      const book = openEl.querySelector("[data-bo]");
      // Start the open book exactly where the spine was on the shelf, then fly it to the middle.
      const target = book.getBoundingClientRect();
      const sx = r.width / (target.width / 2), sy = r.height / target.height;
      book.style.transform = `translate(${r.left + r.width / 2 - (target.left + target.width / 2)}px, ${r.top + r.height / 2 - (target.top + target.height / 2)}px) scale(${sx}, ${sy})`;
      book.getBoundingClientRect();
      el.classList.add("is-taken");
      requestAnimationFrame(() => {
        openEl.classList.add("is-on");
        book.style.transform = "";
        setTimeout(() => book.classList.add("is-open"), reducedMotion() ? 0 : 1250); // land, show the cover, then open
      });
      openEl.querySelector("[data-close]").addEventListener("click", closeBook);
      setTimeout(() => (openEl.querySelector(".bo-toc-row.is-link") || openEl.querySelector("[data-close]")).focus({ preventScroll: true }), reducedMotion() ? 0 : 2100);
    }
    function closeBook() {
      if (openEl.hidden) return false;
      const book = openEl.querySelector("[data-bo]");
      book.classList.remove("is-open");
      openEl.classList.remove("is-on");
      setTimeout(() => {
        openEl.hidden = true; openEl.innerHTML = "";
        opened?.classList.remove("is-taken");
        opened?.focus({ preventScroll: true });
        opened = null;
      }, reducedMotion() ? 0 : 450);
      return true;
    }
    S.on(openEl, "click", (e) => { if (e.target === openEl) closeBook(); });
    S.add(() => clearTimeout(leaveTimer));

    return { onEscape() { return closeBook(); }, unmount() { S.dispose(); } };
  },
};
