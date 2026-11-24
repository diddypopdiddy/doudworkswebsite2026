import { esc, scope, reducedMotion } from "../util.js";
import { BOOKS } from "../data.js";

const seen = new Set(); // Books opened this visit skip the pause on the cover.
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const FIRST_COVER_HOLD_MS = 950;
const COVER_CLOSE_MS = 600;
const DROP_MS = 250;
const FADE_MS = 200;

/* A close-up of the basement bookshelf, with illustrated jackets on the project books.
   Hover or focus one and everything else dims while it slides up, grows and turns to show its cover
   (so there's never any sideways text to read); select it and the cover comes to the center and opens
   to a title page and table of contents. */

// Plain spine art (trimmed sizes). orange, brown, slate, sand and sky are recolours of the others, made to match the basement's shelf.
const ART = {
  "book-plain-brick": [150, 662], "book-plain-forest": [150, 745], "book-plain-ink-blue": [136, 769], "book-plain-ivory": [132, 612],
  "book-plain-ochre": [131, 708], "book-plain-plum": [134, 685], "book-plain-rust": [153, 636], "book-plain-teal": [147, 740],
  "book-plain-orange": [153, 636], "book-plain-brown": [153, 636], "book-plain-slate": [136, 769], "book-plain-sand": [132, 612], "book-plain-sky": [147, 740],
};
// Shelf geometry (bookshelf.webp, 1385 × 710): the side posts, and where books stand on each board.
const SHELF = { w: 1385, h: 710, x0: 150, x1: 1236 };
const SCALE = 0.45; // plain spine art → shelf pixels
const COVER_RATIO = 1140 / 1620; // the covers' width ÷ height
const PLANT = { w: 186, h: 242, sink: 5 }; // shelf-plant.webp is 227 × 295; `sink` sets the pot a little forward on the board
// Top board, then bottom board, each left to right, in the basement shelf's colour order (with a few more books,
// since this view is wider). `book` is an index into BOOKS (its colour comes from the book). `t` is how thick the
// book is and `hs` how tall, relative to its art, so the row doesn't look like one book repeated.
const B = (art, t = 1.2, hs = 1) => ({ art: `book-plain-${art}`, t, hs });
const P = (book, t = 1.25, hs = 1) => ({ book, t, hs });
// The jacket builder uses these proportions to keep the lettering in shape on the shelf.
export const SHELVES = [
  { floorY: 135, row: [B("orange", 1.2, 1.0), B("brown", 1.3, 0.96), B("ivory", 1.15, 1.04), P(1, 1.3, 1.075), B("slate", 1.15, 0.82), P(6, 1.275, 0.955), P(0, 1.3, 0.925),
    B("ivory", 1.3, 0.98), B("sand", 1.15, 1.06), P(2, 1.3, 0.96), B("brown", 1.15, 1.0), B("orange", 1.3, 0.95), B("sand", 1.2, 1.0)] },
  { floorY: 568, row: [P(5, 1.3, 1.09), B("ivory", 1.2, 1.05), P(3, 1.3, 1.05), B("ink-blue", 1.2, 0.86), B("brick", 1.25, 0.97), B("sky", 1.15, 0.86), P(4, 1.3, 1.0),
    B("sand", 1.15, 1.02), B("brown", 1.3, 1.04), { ...B("rust", 1.2, 1), gap: 34 }, { plant: true }] },
];

export default {
  mount(root) {
    const S = scope();
    const px = (v) => (v / SHELF.w) * 100 + "%";
    const py = (v) => (v / SHELF.h) * 100 + "%";

    // Size everything, then start both rows at the same x with the widest row centered between the posts.
    const rows = SHELVES.map(({ floorY, row }) => row.map((r) => {
      if (r.plant) return { ...r, floorY, w: PLANT.w, h: PLANT.h, gap: 0 };
      const b = r.book !== undefined ? BOOKS[r.book] : null;
      const art = b ? b.art : r.art;
      const [w, h] = ART[art];
      return { ...r, floorY, b, art, w: w * SCALE * r.t, h: h * SCALE * r.hs, gap: r.gap ?? 4 };
    }));
    const widthOf = (row) => row.reduce((t, p, i) => t + p.w + (i < row.length - 1 ? p.gap : 0), 0);
    const widest = Math.max(...rows.map(widthOf));
    const start = SHELF.x0 + (SHELF.x1 - SHELF.x0 - widest) / 2;
    rows.forEach((row) => { let x = start; row.forEach((p) => { p.x = x; x += p.w + p.gap; }); });
    const items = rows.flat();

    const bookHTML = (p, i) => {
      if (p.plant) return `<img class="shelf-plant" src="assets/objects/shelf-plant.webp" alt="" draggable="false" style="left:${px(p.x)};width:${px(p.w)};bottom:${py(SHELF.h - p.floorY - PLANT.sink)}">`;
      const style = `left:${px(p.x)};width:${px(p.w)};height:${py(p.h)};bottom:${py(SHELF.h - p.floorY)};--i:${i}`;
      if (!p.b) return `<span class="book is-filler" style="${style}" aria-hidden="true"><img src="assets/objects/${p.art}.webp" alt="" draggable="false"></span>`;
      // The cover is the book's right-hand side, folded back out of sight until the book turns. --cw is its width in shelf pixels.
      return `<button class="book is-project" data-id="${p.b.id}" style="${style};--cw:${(p.h * COVER_RATIO).toFixed(1)}">
          <span class="book-body" aria-hidden="true">
            <img src="assets/spines/${p.b.id}.webp" alt="" draggable="false">
            <span class="book-cover"><img src="assets/covers/${p.b.id}-shelf.webp" alt="" draggable="false"></span>
          </span>
          <span class="sr-only">${esc(p.b.title)}. ${esc(p.b.kind)}. ${esc(p.b.summary)}${p.b.href ? "" : " (coming soon)"}</span>
        </button>`;
    };

    const coarse = matchMedia("(pointer: coarse)").matches;
    const HINT = `The books with titles are projects from my classroom. <b>${coarse ? "Tap one" : "Hover one"}</b> to see it.`;
    root.innerHTML = `
      <section class="teach" aria-label="Teaching bookshelf">
        <div class="teach-pan" data-pan>
          <div class="teach-inner">
            <div class="teach-wall"></div>
            <div class="teach-floor"></div>
            <div class="shelf" data-shelf style="aspect-ratio:${SHELF.w}/${SHELF.h}">
              <img class="shelf-art" src="assets/objects/bookshelf.webp" alt="" draggable="false">
              <div class="shelf-books">${items.map(bookHTML).join("")}</div>
            </div>
          </div>
        </div>
        <div class="teach-grouper">
          <a class="chip" href="/grouper/" aria-describedby="teach-grouper-note">Open Grouper</a>
          <small id="teach-grouper-note">No account. Rosters stay in this browser.</small>
        </div>
        <p class="teach-hint" data-hint aria-hidden="true">${HINT}</p>
        <div class="book-open" data-open hidden role="dialog" aria-modal="true" aria-labelledby="bo-title"></div>
      </section>`;

    const pan = root.querySelector("[data-pan]");
    const shelf = root.querySelector("[data-shelf]");
    const hint = root.querySelector("[data-hint]");
    const openEl = root.querySelector("[data-open]");
    const els = [...root.querySelectorAll(".book")];
    const covers = new Map();
    let opened = null, token = 0, phaseTimer = 0, cancelCoverWait = null;

    // When the shelf is wider than the screen (phones) it scrolls sideways; start in the middle of the books.
    {
      const mid = start + widest / 2;
      const center = () => { pan.scrollLeft = (pan.scrollWidth - pan.clientWidth) / 2 + ((mid - SHELF.w / 2) / SHELF.w) * shelf.offsetWidth; };
      center();
      S.on(window, "resize", center);
    }

    function coverFor(book) {
      if (!covers.has(book.id)) {
        const image = new Image(1140, 1620);
        image.alt = "";
        image.draggable = false;
        image.src = `assets/covers/${book.id}.webp`;
        // Reuse the preloaded image when the book opens.
        image.decode().catch(() => {});
        covers.set(book.id, image);
      }
      return covers.get(book.id);
    }

    /* ---------- the caption at the bottom names the book you're on ---------- */
    const describe = (b) => { hint.innerHTML = `<b>${esc(b.title)}</b> · ${esc(b.href ? b.kind : b.note)}`; };
    const idle = () => { hint.innerHTML = HINT; };

    /* ---------- lift a book ---------- */
    let current = null, leaveTimer = 0;
    function pull(el) {
      clearTimeout(leaveTimer);
      if (opened || current === el) return;
      current?.classList.remove("is-pulled");
      current = el;
      shelf.classList.toggle("has-pulled", !!el); // everything else steps back
      if (!el) return idle();
      el.classList.add("is-pulled");
      const b = BOOKS.find((x) => x.id === el.dataset.id);
      if (b) {
        describe(b);
        coverFor(b);
      }
    }
    els.filter((e) => e.dataset.id).forEach((el) => {
      S.on(el, "pointerenter", () => pull(el));
      S.on(el, "focus", () => pull(el));
      S.on(el, "pointerleave", () => { leaveTimer = setTimeout(() => pull(null), 160); });
      S.on(el, "blur", () => { leaveTimer = setTimeout(() => { if (openEl.hidden) pull(null); }, 160); });
      S.on(el, "click", () => openBook(el));
    });

    /* ---------- open a book ---------- */
    function spreadHTML(b, coverSrc) {
      const tag = b.href ? "a" : "div";
      const target = b.sameTab ? 'target="_self"' : 'target="_blank" rel="noopener noreferrer"';
      const actionLabel = b.sameTab ? b.action : `${b.action} (opens in a new tab)`;
      const link = b.href ? ` href="${esc(b.href)}" ${target} aria-label="${esc(actionLabel)}"` : "";
      const chapters = b.chapters.map(({ t, n }, i) => `
        <li class="bo-chapter">
          <span class="bo-roman" aria-hidden="true">${ROMAN[i]}.</span>
          <span class="bo-chapter-name">${esc(t)}</span>
          <span class="bo-chapter-number"><span class="sr-only">Page </span>${n}</span>
        </li>`).join("");
      return `
        <div class="bo-dim" data-dim></div>
        <div class="bo-rise">
          <div class="bo-stage">
            <div class="bo-book">
              <div class="bo-back"></div>
              <div class="bo-edge is-fore"></div><div class="bo-edge is-top"></div><div class="bo-edge is-foot"></div>
              <div class="bo-spine" aria-hidden="true"><img src="assets/spines/${b.id}.webp" alt="" draggable="false"></div>
              <div class="bo-page">
                <${tag} class="bo-right"${link} inert>
                  <header class="bo-contents-head">
                    <p class="bo-running-head" aria-hidden="true">${esc(b.title)}</p>
                    <h3 class="bo-head">Contents</h3>
                  </header>
                  <ol class="bo-chapters" role="list">${chapters}</ol>
                  <div class="bo-book-preview">
                    <img src="${esc(coverSrc)}" width="1140" height="1620" alt="" draggable="false">
                    <p>${esc(b.summary)}</p>
                  </div>
                  <footer class="bo-foot">
                    ${b.href
                      ? `<span class="bo-action"><span>${esc(b.action)}</span><span class="bo-arrow" aria-hidden="true">→</span></span>`
                      : `<span class="bo-note">${esc(b.note)}</span>`}
                    <span class="bo-folio" aria-hidden="true">v</span>
                  </footer>
                </${tag}>
              </div>
              <div class="bo-cover">
                <div class="bo-cover-front" aria-hidden="true"></div>
                <div class="bo-cover-edge"></div>
                <div class="bo-cover-inside">
                  <div class="bo-title-page">
                    <div class="bo-title-block">
                      <p class="bo-kind">${esc(b.kind)}</p>
                      ${b.emblem ? `<span class="bo-title-mark"><img src="assets/media/${esc(b.emblem)}" alt="" draggable="false"></span>` : ""}
                      <h2 id="bo-title" class="bo-title">${esc(b.title)}</h2>
                      <p class="bo-by">by Vince Doud</p>
                      <p class="bo-ornament" aria-hidden="true">❦</p>
                    </div>
                    ${b.coverAddress
                      ? `<p class="bo-imprint bo-imprint-address">${esc(b.coverAddress)}</p>`
                      : `<p class="bo-imprint">Basement Press · New Jersey</p>`}
                  </div>
                </div>
              </div>
              <button class="bo-tab" data-close type="button"><span aria-hidden="true">↩</span> Put it back</button>
            </div>
          </div>
        </div>`;
    }

    function coverIsMoving(cover) {
      return cover.getAnimations().some((animation) =>
        animation.transitionProperty === "transform" && animation.playState !== "finished"
      );
    }

    function afterCover(cover, next, timeout = 0) {
      function cancel() {
        clearTimeout(fallback);
        cover.removeEventListener("transitionend", onEnd);
        cover.removeEventListener("transitioncancel", onEnd);
      }
      function finish() {
        cancel();
        next();
      }
      function onEnd(event) {
        if (event.target === cover && event.propertyName === "transform" && !coverIsMoving(cover)) finish();
      }
      const fallback = timeout && setTimeout(finish, timeout);
      cover.addEventListener("transitionend", onEnd);
      cover.addEventListener("transitioncancel", onEnd);
      return cancel;
    }

    function clearPhase() {
      clearTimeout(phaseTimer);
      cancelCoverWait?.();
      cancelCoverWait = null;
    }

    function openBook(trigger, { restore = false } = {}) {
      if (opened) return;
      const book = BOOKS.find((b) => b.id === trigger.dataset.id);
      if (!book) return;

      // Store the open book on this history entry so Back can reopen it after a reload.
      if (book.sameTab && !restore) history.replaceState({ ...history.state, teachingBook: book.id }, "");
      pull(trigger);
      const run = ++token;
      const motion = !reducedMotion();
      const animateOpen = motion && !restore;
      openEl.style.setProperty("--c", book.color);
      openEl.dataset.book = book.id;
      openEl.classList.toggle("is-reduced", !animateOpen);
      const coverImage = coverFor(book);
      openEl.innerHTML = spreadHTML(book, coverImage.src);
      openEl.querySelector(".bo-cover-front").append(coverImage);
      const cover = openEl.querySelector(".bo-cover");
      const page = openEl.querySelector(".bo-right");
      const close = openEl.querySelector("[data-close]");
      opened = { trigger, cover, page, close, motion, closing: false };

      openEl.hidden = false;
      if (!animateOpen) openEl.classList.add("is-open");
      void openEl.offsetWidth; // Establish the starting styles for the rise or fade.
      trigger.classList.add("is-taken");
      openEl.classList.add("is-on");
      close.focus({ preventScroll: true });

      function revealContents() {
        if (run !== token) return;
        seen.add(book.id);
        page.inert = false;
        (book.href ? page : close).focus({ preventScroll: true });
      }
      if (!animateOpen) {
        phaseTimer = setTimeout(() => {
          openEl.classList.toggle("is-reduced", !motion);
          revealContents();
        }, restore ? 0 : FADE_MS);
        return;
      }
      phaseTimer = setTimeout(() => {
        if (run !== token) return;
        cancelCoverWait = afterCover(cover, revealContents);
        openEl.classList.add("is-open");
        // A preference change can leave this cover with no transition to wait for.
        if (!coverIsMoving(cover)) {
          cancelCoverWait();
          revealContents();
        }
      }, seen.has(book.id) ? 450 : FIRST_COVER_HOLD_MS);
    }

    function closeBook() {
      if (!opened || opened.closing) return;
      opened.closing = true;
      const { trigger, cover, page, close, motion } = opened;
      if (history.state?.teachingBook === trigger.dataset.id) {
        history.replaceState({ ...history.state, teachingBook: null }, "");
      }
      const run = ++token;
      clearPhase();
      if (page.contains(document.activeElement)) close.focus({ preventScroll: true });
      page.inert = true;

      function dropBook() {
        if (run !== token) return;
        openEl.classList.remove("is-on");
        trigger.classList.remove("is-taken");
        phaseTimer = setTimeout(() => {
          if (run !== token) return;
          openEl.hidden = true;
          openEl.innerHTML = "";
          openEl.className = "book-open";
          opened = null;
          trigger.focus({ preventScroll: true });
          if (coarse && !trigger.matches(":focus-visible")) pull(null);
        }, motion ? DROP_MS : FADE_MS);
      }

      if (motion && openEl.classList.contains("is-open")) {
        cancelCoverWait = afterCover(cover, dropBook, COVER_CLOSE_MS);
        openEl.classList.remove("is-open");
      } else {
        dropBook();
      }
    }

    S.on(openEl, "click", (e) => {
      if (e.target === openEl || e.target.matches("[data-dim]") || e.target.closest("[data-close]")) closeBook();
    });
    S.on(document, "keydown", (e) => {
      if (!opened || e.key !== "Tab" || e.ctrlKey || e.altKey || e.metaKey) return;
      const { close, page } = opened;
      const linkReady = page.matches("a:not([inert])");
      e.preventDefault();
      (linkReady && document.activeElement === close ? page : close).focus({ preventScroll: true });
    });
    S.add(() => clearTimeout(leaveTimer));

    const savedBook = history.state?.teachingBook;
    const savedTrigger = savedBook && els.find((el) => el.dataset.id === savedBook);
    if (savedTrigger) openBook(savedTrigger, { restore: true });

    return {
      onEscape() {
        if (openEl.hidden) return false;
        closeBook();
        return true;
      },
      unmount() {
        token++;
        clearPhase();
        S.dispose();
      },
    };
  },
};
