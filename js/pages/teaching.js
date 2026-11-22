import { esc, scope, reducedMotion, isSmallScreen } from "../util.js";
import { BOOKS } from "../data.js";

const seen = new Set(); // Books opened this visit skip the pause on the cover.
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const FIRST_COVER_HOLD_MS = 950;
const COVER_CLOSE_MS = 600;
const DROP_MS = 250;
const FADE_MS = 200;

/* A close-up of the bookshelf. Each project is a book with its own spine design, big enough to read.
   Hovering or focusing a book tips it out and tapes a note above it; selecting it brings its cover
   to the center, then opens it to a title page and table of contents. */

// Plain spine art (trimmed sizes).
const ART = {
  "book-plain-brick": [150, 662], "book-plain-forest": [150, 745], "book-plain-ink-blue": [136, 769], "book-plain-ivory": [132, 612],
  "book-plain-ochre": [131, 708], "book-plain-plum": [134, 685], "book-plain-rust": [153, 636], "book-plain-teal": [147, 740],
};
// Shelf geometry (bookshelf.webp, 1385 × 710): lower compartment floor and side posts.
const SHELF = { w: 1385, h: 710, floorY: 568, x0: 150, x1: 1236 };
const SCALE = 0.45;
// The project books are drawn wider than the plain art so each spine has room for a design.
const WIDE = 1.38, WIDE_PHONE = 1.2;
// The row, left to right. Plain books (no `book`) fill out the shelf and aren't clickable.
const ROW = [
  { art: "book-plain-rust" },
  { book: 5, gap: 4 },
  { book: 0, gap: 4 },
  { book: 1, gap: 4 }, { book: 2, gap: 4 }, { book: 3, gap: 4 }, { book: 4, gap: 24 },
  { art: "book-plain-ink-blue", lean: 7, gap: 42 },
  { stack: ["book-plain-ivory", "book-plain-plum", "book-plain-forest"] },
];
// Spine designs, echoing each cover. `lines` is the title as it's set on the spine (first line on the right,
// the way a spine reads when the book lies face up).
const SPINES = {
  "ai-production-framework": { style: "classic", lines: ["AI Production", "Framework"] },
  "ai-educator-playbook": { style: "paper", lines: ["AI Educator", "Playbook"] },
  "moving-image": { style: "film", lines: ["Video Production", "Textbook"] },
  "ai-road-test": { style: "road", lines: ["AI Road Test", "Permit Drive"] },
  "write-with-ai": { style: "note", lines: ["Write", "with AI"] },
  "ai-workbook": { style: "marker", lines: ["AI Framework", "Workbook"] },
};

export default {
  mount(root) {
    const S = scope();
    const px = (v) => (v / SHELF.w) * 100 + "%";
    const wide = isSmallScreen() ? WIDE_PHONE : WIDE; // phones: slimmer, so all six fit across the screen

    // Lay out the row and center it in the compartment.
    const row = ROW.map((r) => {
      if (r.stack) { // books lying flat: their length runs across the shelf
        const items = r.stack.map((a, j) => { const [w, h] = ART[a]; const sc = 0.36 - j * 0.02; return { art: a, len: h * sc, thick: w * sc }; });
        return { ...r, w: Math.max(...items.map((t) => t.len)), h: 0, items, gap: 0 };
      }
      const b = r.book !== undefined ? BOOKS[r.book] : null;
      const art = b ? b.art : r.art;
      const [w, h] = ART[art];
      return { ...r, b, art, w: w * SCALE * (b ? wide : 1), h: h * SCALE, gap: r.gap ?? 5 };
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
      const d = SPINES[p.b.id] || { style: "classic", lines: [p.b.spine] };
      const longest = Math.max(...d.lines.map((l) => l.length));
      // Type size: as big as the spine's width allows, without the longest line running past the title area.
      const fit = `--fs:${(100 / longest).toFixed(2)}cqh;--fw:${d.lines.length > 1 ? 28 : 40}cqw`;
      return `<button class="book" data-k="${i}" data-id="${p.b.id}" style="${style};${fit};--c:${p.b.color}">
          <span class="book-body" aria-hidden="true"><img src="assets/objects/${p.art}.webp" alt="" draggable="false">
            <span class="spine spine-${d.style}">
              <i class="spine-top"></i>
              <span class="spine-title">${d.lines.map((l, j) => `<span class="spine-l${j + 1}">${esc(l)}</span>`).join("")}</span>
              <span class="spine-foot">Doud</span>
            </span>
          </span>
          <span class="sr-only">${esc(p.b.title)}. ${esc(p.b.kind)}. ${esc(p.b.summary)}${p.b.href ? "" : " (coming soon)"}</span>
        </button>`;
    };

    root.innerHTML = `
      <section class="teach" aria-label="Teaching bookshelf">
        <div class="teach-pan" data-pan>
          <div class="teach-inner">
            <div class="teach-wall"></div>
            <div class="teach-floor"></div>
            <div class="shelf" data-shelf style="aspect-ratio:${SHELF.w}/${SHELF.h}">
              <img class="shelf-art" src="assets/objects/bookshelf.webp" alt="" draggable="false">
              <div class="shelf-books">${row.map(bookHTML).join("")}</div>
              <div class="shelf-tag" data-tag aria-hidden="true"><b data-tag-title></b><em data-tag-kind></em></div>
            </div>
          </div>
        </div>
        <p class="teach-hint" data-hint>Tools and projects from my classroom. <b>${matchMedia("(pointer: coarse)").matches ? "Tap a book" : "Pick a book"}</b> to open it.</p>
        <div class="book-open" data-open hidden role="dialog" aria-modal="true" aria-labelledby="bo-title"></div>
      </section>`;

    const pan = root.querySelector("[data-pan]");
    const shelf = root.querySelector("[data-shelf]");
    const tag = root.querySelector("[data-tag]"), tagTitle = root.querySelector("[data-tag-title]"), tagKind = root.querySelector("[data-tag-kind]");
    const hint = root.querySelector("[data-hint]");
    const openEl = root.querySelector("[data-open]");
    const els = [...root.querySelectorAll(".book")];
    const covers = new Map();
    let opened = null, token = 0, phaseTimer = 0, cancelCoverWait = null;

    // When the shelf is wider than the screen (phones) it scrolls sideways; start with the project books in the middle.
    {
      const real = row.filter((p) => p.b), first = real[0], last = real[real.length - 1];
      const mid = (first.x + last.x + last.w) / 2;
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

    /* ---------- the taped note above a pulled book ---------- */
    const describe = (el, b) => {
      const p = row[+el.dataset.k];
      tagTitle.textContent = b.title;
      tagKind.textContent = b.href ? b.kind : b.note;
      tag.style.left = px(p.x + p.w / 2);
      tag.style.top = ((SHELF.floorY - p.h * 1.12) / SHELF.h) * 100 + "%";
      tag.classList.add("is-on");
    };
    const idle = () => tag.classList.remove("is-on");

    /* ---------- pull a book out ---------- */
    let current = null, leaveTimer = 0;
    function pull(el) {
      clearTimeout(leaveTimer);
      if (opened || current === el) return;
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
      if (b) {
        describe(el, b);
        coverFor(b);
        hint.classList.add("is-gone");
      }
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
              <div class="bo-spine" aria-hidden="true"><img src="assets/objects/${b.art}.webp" alt="" draggable="false"><i class="spine-bands"></i><span>${esc(b.spine)}</span></div>
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
      idle(); // the note steps aside for the open book
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
