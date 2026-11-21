import { esc } from "../util.js";
import { SPACES, ORDER, SITE } from "../data.js";

const ART = {
  art: "assets/explore/art-table.webp",
  music: "assets/explore/drums.webp",
  video: "assets/objects/tv-dvd-front.webp",
  teaching: "assets/objects/book-plain-brick.webp",
  ai: "assets/objects/macbook-open.webp",
  about: "assets/objects/wallet-closed.webp",
  contact: "assets/objects/payphone-front-off-hook.webp",
};

export default {
  mount(root) {
    root.classList.add("is-scroll");
    root.innerHTML = `
      <div class="backdrop"></div>
      <section class="explore">
        <header class="explore-head">
          <p class="explore-kicker">${esc(SITE.name)}</p>
          <h1>Everything in the basement</h1>
          <p class="explore-sub">Skip the hunting around. Every room, one click away.</p>
        </header>
        <ol class="explore-grid">
          ${ORDER.map((k, i) => `
            <li>
              <a class="explore-card" href="/${k}" data-k="${k}" style="--i:${i}">
                <span class="explore-art"><img src="${ART[k]}" alt="" loading="lazy"></span>
                <span class="explore-text">
                  <strong>${esc(SPACES[k].label)}</strong>
                  <span>${esc(SPACES[k].blurb)}</span>
                </span>
                <span class="explore-go" aria-hidden="true">→</span>
              </a>
            </li>`).join("")}
        </ol>
        <footer class="explore-foot">
          <a href="${SITE.youtube}" target="_blank" rel="noopener noreferrer">YouTube ↗</a>
          <a href="${SITE.bandcamp}" target="_blank" rel="noopener noreferrer">Bandcamp ↗</a>
          <a href="mailto:${SITE.email}">${esc(SITE.email)}</a>
        </footer>
      </section>`;
    return { unmount() {} };
  },
};
