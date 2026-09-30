document.documentElement.classList.add("js");

const currentPage = document.body.dataset.page || "unknown";

const trackEvent = (eventName, props = {}) => {
  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props });
  }
};

document.querySelectorAll("[data-track]").forEach((link) => {
  link.addEventListener("click", () => {
    trackEvent(link.dataset.track || "Portfolio Link Opened", {
      page: currentPage,
      href: link.getAttribute("href") || "",
      label: link.textContent.trim().replace(/\s+/g, " ")
    });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll("details[open]").forEach((details) => {
    details.open = false;
  });
});

const lightSwitch = document.querySelector("[data-light-switch]");

if (lightSwitch) {
  lightSwitch.addEventListener("click", () => {
    const isOn = lightSwitch.getAttribute("aria-pressed") === "true";
    lightSwitch.setAttribute("aria-pressed", String(!isOn));
    lightSwitch.setAttribute("aria-label", isOn ? "Turn the key light on" : "Turn the key light off");
    lightSwitch.closest(".room-app")?.classList.toggle("is-key-light-on", !isOn);
  });
}

document.querySelectorAll("[data-backdrop-home]").forEach((backdrop) => {
  backdrop.addEventListener("click", (event) => {
    if (event.target !== backdrop && event.target.closest(".archive-window")) return;
    window.location.href = "index.html";
  });
});

const gallery = document.querySelector("[data-gallery]");

if (gallery) {
  const feature = gallery.querySelector("[data-gallery-feature]");
  const count = gallery.querySelector("[data-gallery-count]");
  const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
  const previous = gallery.querySelector("[data-gallery-previous]");
  const next = gallery.querySelector("[data-gallery-next]");
  let activeIndex = 0;

  const selectArtwork = (index, { focus = false } = {}) => {
    activeIndex = (index + thumbs.length) % thumbs.length;
    const selected = thumbs[activeIndex];
    const image = selected.querySelector("img");

    feature.src = selected.dataset.full || image.src;
    feature.alt = selected.dataset.alt || image.alt;
    count.textContent = `${activeIndex + 1} / ${thumbs.length}`;

    thumbs.forEach((thumb, thumbIndex) => {
      thumb.setAttribute("aria-current", String(thumbIndex === activeIndex));
    });

    if (focus) selected.focus();
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => selectArtwork(index));
  });

  previous?.addEventListener("click", () => selectArtwork(activeIndex - 1));
  next?.addEventListener("click", () => selectArtwork(activeIndex + 1));
  selectArtwork(0);
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const statusNode = contactForm.querySelector("[data-contact-status]");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const website = String(formData.get("website") || "").trim();
    if (website) {
      contactForm.reset();
      return;
    }

    const name = String(formData.get("name") || "Website visitor").trim();
    const replyTo = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = `Website note from ${name}`;
    const body = [
      "Hi Vince,",
      "",
      message,
      "",
      `From: ${name}`,
      `Reply to: ${replyTo}`,
      `Page: ${window.location.href}`
    ].join("\n");

    if (statusNode) statusNode.textContent = "Opening your email app…";
    trackEvent("Contact Email Draft Opened", { page: currentPage });
    window.location.href = `mailto:hello@vincedoud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
