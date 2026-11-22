import { esc, scope, loadJSON, clamp, reducedMotion, announce, replaceDetailAddress } from "../util.js";

/* The skateboards: the decks off the basement wall, one at a time, hung on white cinder block.
   The right arrow walks you along the wall to the next deck, the left arrow back (also: arrow keys,
   or drag / swipe sideways). The decks and their labels come from data/skateboards.json;
   the pictures are built by tools/build_skateboards.py. */

const ART = "assets/skateboards/";
const SLIDE_MS = 640;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default {
  async mount(root, { route }) {
    const S = scope();
    const decks = (await loadJSON("data/skateboards.json")).decks;
    const N = decks.length;
    const routeNumber = (i) => decks[i].route ?? i + 1;
    const startAt = (param) => Math.max(0, decks.findIndex((_, i) => String(routeNumber(i)) === param));
    const sub = (d) => [d.brand, d.detail].filter(Boolean).join(" · ");

    root.innerHTML = `
      <section class="sk8" aria-roledescription="carousel" aria-label="Skateboard decks">
        <div class="sk8-wall" data-wall aria-hidden="true"></div>
        <div class="sk8-light" aria-hidden="true"></div>
        <div class="sk8-track" data-track>
          ${decks.map((d, i) => `
            <figure class="sk8-slide" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${N}" hidden>
              <img class="sk8-deck" alt="${esc([d.brand, d.title, "skateboard deck"].filter(Boolean).join(" "))}" draggable="false" decoding="async">
              <figcaption class="sk8-tag">
                <b>${esc(d.title)}</b>
                ${sub(d) ? `<span>${esc(sub(d))}</span>` : ""}
              </figcaption>
            </figure>`).join("")}
        </div>
        <button class="sk8-arrow is-prev" data-step="-1" aria-label="Previous skateboard" hidden><span aria-hidden="true">←</span></button>
        <button class="sk8-arrow is-next" data-step="1" aria-label="Next skateboard"><span aria-hidden="true">→</span></button>
        <p class="sk8-count" data-count aria-hidden="true"></p>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const stage = $(".sk8"), wall = $("[data-wall]"), count = $("[data-count]");
    const prev = $(".is-prev"), next = $(".is-next");
    const slides = [...root.querySelectorAll(".sk8-slide")];
    const imgs = slides.map((s) => s.querySelector("img"));

    /* ---------- sizes ---------- */
    // A deck is about four courses of block tall, so the wall is scaled to the deck.
    let W = 1, tile = 1, big = false;
    const layout = () => {
      W = stage.clientWidth || innerWidth;
      const vh = stage.clientHeight || innerHeight;
      const narrow = W < 720;
      const room = narrow ? vh - 74 - 132 : vh - 84 - 56;         // top bar above, label / counter below
      const deckH = Math.round(clamp(Math.min(room, (W - (narrow ? 48 : 300)) / 0.3), 240, 1500));
      tile = deckH * 2;
      stage.style.setProperty("--deck-h", deckH + "px");
      stage.classList.toggle("is-narrow", narrow);
      big ||= deckH * (window.devicePixelRatio || 1) > 1050;       // once the big pictures are in, keep them
      paint();
    };

    /* ---------- where the camera is along the wall ---------- */
    let index = startAt(route.param), pos = index, raf = 0;
    const load = (i) => {
      const im = imgs[i];
      if (!im) return;
      const src = `${ART}${decks[i].img}${big ? "" : "-sm"}.webp`;
      if (im.dataset.src === src) return;
      im.dataset.src = src;
      im.addEventListener("load", () => im.classList.add("is-in"), { once: true });
      im.src = src;
    };
    function paint() {
      const x = pos * W;
      wall.style.transform = `translate3d(${-(((x % tile) + tile) % tile)}px,0,0)`;
      slides.forEach((s, i) => {
        const off = i - pos;
        const near = Math.abs(off) < 1;
        s.hidden = !near;
        if (near) { s.style.transform = `translate3d(${off * W}px,0,0)`; load(i); }
      });
    }
    const settle = () => {
      prev.hidden = index === 0;
      next.hidden = index === N - 1;
      count.textContent = `${index + 1} / ${N}`;
      slides.forEach((s, i) => s.classList.toggle("is-current", i === index));
      load(index - 1); load(index + 1);                           // have the neighbours ready
    };
    const glide = (from, to, ms) => {
      cancelAnimationFrame(raf);
      if (reducedMotion() || from === to) { pos = to; paint(); return; }
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        pos = from + (to - from) * ease(t);
        paint();
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const show = (i, { say = true, address = true } = {}) => {
      i = clamp(i, 0, N - 1);
      const changed = i !== index;
      index = i;
      settle();
      glide(pos, index, clamp(Math.abs(index - pos), 0.35, 1.6) * SLIDE_MS);
      if (!changed) return;
      if (address) replaceDetailAddress(index === 0 ? "/skateboards" : `/skateboards/${routeNumber(index)}`);
      const d = decks[index];
      if (say) announce(`${[d.brand, d.title].filter(Boolean).join(" ")}, ${index + 1} of ${N}`);
    };
    S.add(() => cancelAnimationFrame(raf));

    layout();
    settle();
    S.on(window, "resize", layout);

    /* ---------- arrows, keys ---------- */
    S.on(stage, "click", (e) => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      const to = index + Number(b.dataset.step);
      show(to);
      // the arrow you pressed may have just gone away (first / last deck): keep focus on the page
      if (to <= 0) next.focus({ preventScroll: true });
      else if (to >= N - 1) prev.focus({ preventScroll: true });
    });
    S.on(window, "keydown", (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "Home") show(0);
      else if (e.key === "End") show(N - 1);
      else return;
      e.preventDefault();
    });

    /* ---------- drag / swipe sideways ---------- */
    let drag = null;
    S.on(stage, "pointerdown", (e) => {
      if (e.button || e.target.closest("button")) return;
      cancelAnimationFrame(raf);
      drag = { id: e.pointerId, x: e.clientX, from: pos, t: performance.now(), moved: false };
    });
    S.on(stage, "pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      if (!drag.moved) { drag.moved = true; stage.setPointerCapture?.(e.pointerId); stage.classList.add("is-dragging"); }
      let p = drag.from - dx / W;
      if (p < 0) p *= 0.3;                                         // past either end the wall resists
      if (p > N - 1) p = N - 1 + (p - (N - 1)) * 0.3;
      pos = p;
      paint();
    });
    const drop = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      stage.classList.remove("is-dragging");
      const dx = e.clientX - d.x, quick = performance.now() - d.t < 320;
      let to = index;
      if (d.moved && (Math.abs(dx) > W * 0.18 || (quick && Math.abs(dx) > 40))) to = index + (dx < 0 ? 1 : -1);
      show(to);
    };
    S.on(stage, "pointerup", drop);
    S.on(stage, "pointercancel", drop);

    return {
      update(r) { show(startAt(r.param), { address: false }); },
      unmount() { S.dispose(); },
    };
  },
};
