document.documentElement.classList.add("js");

const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const currentPage = document.body.dataset.page || "unknown";
const mainContent = document.querySelector("main");

if (mainContent && !mainContent.id) {
  mainContent.id = "main-content";
}

if (mainContent && !document.querySelector(".skip-link")) {
  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = `#${mainContent.id}`;
  skipLink.textContent = "Skip to main content";
  document.body.insertBefore(skipLink, document.body.firstChild);
}

const trackEvent = (eventName, props = {}) => {
  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props });
  }
};

const closeMenu = () => {
  if (!menuToggle || !siteNav) {
    return;
  }

  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      trackEvent("Mobile Navigation Opened", { page: currentPage });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }

  link.addEventListener("click", closeMenu);
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const describeHref = (href) => {
  if (!href) {
    return "unknown";
  }

  return href.replace(/^https?:\/\/www\.vincedoud\.com\//, "");
};

document
  .querySelectorAll("a[href*='book.html']")
  .forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";

      trackEvent("Contact CTA Clicked", {
        page: currentPage,
        href: describeHref(href),
        label: link.textContent.trim().replace(/\s+/g, " ")
      });
    });
  });

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const statusNode = contactForm.querySelector("[data-contact-status]");
  const submitButton = contactForm.querySelector("button[type='submit']");
  const formatSelect = contactForm.querySelector("select[name='format']");
  const workshopParam = new URLSearchParams(window.location.search).get("workshop");
  const workshopFormatMap = {
    "ai-modes": "Live AI Workshop: Earn Your AI Permit",
    "ai-tool-mode": "Live AI Workshop: Build Toward Your AI License",
    "public-workshops": "Live AI Workshops: next date notifications",
    "private-team": "Private team training"
  };

  if (formatSelect && workshopParam && workshopFormatMap[workshopParam]) {
    formatSelect.value = workshopFormatMap[workshopParam];
  }

  const setStatus = (message) => {
    if (statusNode) {
      statusNode.textContent = message;
    }
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const endpoint = (contactForm.dataset.endpoint || contactForm.action || "").trim();
    const payload = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        String(value || "").trim()
      ])
    );
    const website = payload.website || "";

    if (website) {
      contactForm.reset();
      setStatus("Message sent.");
      return;
    }

    if (!endpoint) {
      setStatus("This form is staged, but the private sending endpoint still needs to be connected before launch.");
      trackEvent("Contact Form Missing Endpoint", { page: currentPage });
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus("Sending...");

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          ...payload,
          source: window.location.href,
          submittedAt: new Date().toISOString()
        })
      });

      contactForm.reset();
      setStatus("Message sent.");
      trackEvent("Contact Form Submitted", { page: currentPage });
    } catch (error) {
      setStatus("Message could not send. Try again in a minute.");
      trackEvent("Contact Form Error", { page: currentPage });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

const revealNodes = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, observe) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observe.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
