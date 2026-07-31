document.documentElement.classList.add("js");

const body = document.body;
const app = document.querySelector("[data-stage-app]");
const skipLink = document.querySelector(".skip-link");
const main = document.getElementById("main");
const homeStage = document.querySelector("[data-home-stage]");
const homeCanvas = document.querySelector("[data-home-canvas]");
const layerHost = document.querySelector(".layer-host");
const brandLink = document.querySelector(".stage-brand");
const layers = new Map(
  Array.from(document.querySelectorAll("[data-view]")).map((layer) => [
    layer.dataset.view,
    layer
  ])
);
const nav = document.querySelector(".primary-nav");
const navLinks = Array.from(document.querySelectorAll(".nav-link[data-route]"));
const routeLinks = Array.from(document.querySelectorAll("[data-route]"));
const layerCloseButtons = Array.from(document.querySelectorAll("[data-layer-close]"));
const mobileToggle = document.querySelector(".mobile-nav-toggle");
const mobileToggleLabel = mobileToggle?.querySelector("span");
const mobileMedia = window.matchMedia("(max-width: 767px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const routePaths = {
  home: "index.html",
  projects: "projects.html",
  about: "about.html",
  contact: "contact.html"
};

const routeTitles = {
  home: "Vince Doud | Teacher, creator, classroom AI explorer",
  projects: "Projects | Vince Doud",
  about: "About | Vince Doud",
  contact: "Contact | Vince Doud"
};

const projects = {
  "ai-production-framework": {
    title: "AI Production Framework",
    status: "Grounding framework",
    summary:
      "A human-directed system that organizes responsible AI work through AI Core Competencies, AI Modes, the Production Spiral, roles, and evidence.",
    image: "media/projects/ai-production-framework-structure-transparent-v1.png",
    alt: "AI Production Framework structure showing AI literacy and core competencies supporting five AI Modes and the Production Spiral",
    fit: "contain",
    dialog: "framework",
    action: "Open the framework"
  },
  playbook: {
    title: "AI Educator Playbook",
    status: "Public resource",
    summary:
      "An evolving teacher-and-student guide for choosing AI’s role and showing the thinking.",
    image: "media/projects/ai-educator-playbook-thumbnail-v2.png",
    alt: "AI Educator Playbook cover",
    href: "https://ai-educator-playbook-vince-doud.diddypopdiddy.chatgpt.site",
    action: "Open the Playbook"
  },
  "field-guide": {
    title: "AI Permit Field Guide",
    status: "Public resource",
    summary:
      "Plain-language practice around process, privacy, verification, authorship, and responsible use.",
    image: "media/projects/ai-permit-field-guide-v4-branded-cover.png",
    alt: "AI Permit Field Guide cover",
    fit: "contain",
    href: "resources/ai-permit-field-guide-v4-branded-screen.pdf",
    action: "Open the Field Guide"
  },
  "ai-road-test": {
    title: "AI Road Test — digital game",
    status: "Public game",
    summary:
      "A digital board game for practicing prompting, ethics, privacy, and verification through a road-test loop.",
    image: "media/projects/ai-road-test-digital-game.jpg",
    alt: "AI Road Test digital game with a road board, category progress, score, and roll-the-dice control",
    fit: "contain",
    href: "https://ai-road-test-vince-doud.diddypopdiddy.chatgpt.site",
    action: "Open the AI Road Test"
  },
  continuity: {
    title: "Continuity",
    status: "Public showcase",
    summary:
      "A teacher workflow for carrying context from one class meeting to the next.",
    image: "media/projects/continuity-teacher-pilot-current-v2.png",
    alt: "Continuity teacher workflow prototype preview",
    href: "https://vince-continuity-showcase.diddypopdiddy.chatgpt.site",
    action: "Open Continuity"
  },
  "dry-eye": {
    title: "Dry Eye Clinical Decision Support",
    status: "Hosted clinical platform",
    summary:
      "De-identified clinical decision support built around deterministic rules, doctor review, and staff voice practice.",
    image: "media/projects/dry-eye-clinical-decision-support.png",
    alt: "Premier Eye Clinical Intelligence Platform graphic for dry eye decision support and AI voice practice",
    fit: "contain",
    href: "https://premier-eye-clinical-platform.diddypopdiddy.chatgpt.site",
    action: "Open the Dry Eye platform"
  },
  "write-with-ai": {
    title: "Write with AI",
    status: "Public activity",
    summary:
      "A two-round activity about useful support, substituted thinking, authorship, and revision.",
    image: "media/projects/write-with-ai-chat-thumbnail-v2.png",
    alt: "Write with AI classroom activity preview",
    href: "https://write-with-ai-vince-doud.diddypopdiddy.chatgpt.site",
    action: "Open Write with AI"
  },
  "video-textbook": {
    title: "Interactive Video Production Textbook",
    status: "Public test build",
    summary:
      "An earlier vertical-slice test build for learning video production through interactive decisions.",
    image: "media/projects/interactive-video-production-textbook.png",
    alt: "Interactive Video Production Textbook cover reading Learn it. Play it. Plan it.",
    href: "https://interactive-video-textbook-audubon.diddypopdiddy.chatgpt.site",
    action: "Open the textbook test build"
  }
};

const projectDetail = document.querySelector("[data-project-detail]");
const projectsLayer = document.querySelector('[data-view="projects"]');
const projectsFrame = document.querySelector(".projects-frame");
const projectDirectory = document.querySelector(".project-directory");
const projectMedia = document.querySelector("[data-project-media]");
const projectTitle = document.querySelector("[data-project-title]");
const projectStatus = document.querySelector("[data-project-status]");
const projectSummary = document.querySelector("[data-project-summary]");
const projectImage = document.querySelector("[data-project-image]");
const projectAction = document.querySelector("[data-project-action]");
const projectAnnouncer = document.querySelector("[data-project-announcer]");
const projectOptions = Array.from(document.querySelectorAll("[data-project-id]"));
const contactForm = document.querySelector("[data-contact-form]");
const submitButton = document.querySelector("[data-submit-button]");
const formStatus = document.querySelector("[data-form-status]");

let activeView = body.dataset.initialView || "home";
let activeProject = null;
let pinnedProject = null;
let focusReturn = null;
let mobileMenuOpen = false;
let openedFromHome = false;
let homePanFrame = 0;
let layerTransitionTimer = 0;
let projectTransitionToken = 0;
let projectAnimations = [];

const mobileProjectPreview = document.createElement("div");
mobileProjectPreview.className = "mobile-project-preview";
let placingProjectRegions = false;

const frameworkDialog = document.createElement("dialog");
frameworkDialog.className = "framework-dialog";
frameworkDialog.setAttribute("aria-labelledby", "framework-dialog-title");
frameworkDialog.innerHTML = `
  <article class="framework-dialog__paper">
    <header class="framework-dialog__header">
      <p>AI Production Framework</p>
      <button type="button" data-framework-close>Close</button>
    </header>
    <div class="framework-dialog__layout">
      <div class="framework-dialog__copy">
        <p class="layer-kicker">Grounding framework</p>
        <h2 id="framework-dialog-title" tabindex="-1">A shared structure for human-directed AI work.</h2>
        <p>
          This is the framework that grounds the work across this website. It makes AI’s
          role explicit while keeping responsibility, authorship, judgment, and verification
          with people.
        </p>
        <p>
          The system is organized through AI Core Competencies, AI Modes, the Production
          Spiral, roles, and visible evidence. The AI Educator Playbook and AI Permit Field
          Guide are public adaptations of the larger framework.
        </p>
      </div>
      <figure class="framework-dialog__media">
        <img
          src="media/projects/ai-production-framework-structure-transparent-v1.png"
          alt="AI Production Framework structure showing core competencies, AI Modes, the Production Spiral, roles, and evidence"
          width="1642"
          height="958"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </div>
  </article>
`;
document.body.append(frameworkDialog);

let frameworkDialogInvoker = null;

const closeFrameworkDialog = () => {
  if (!frameworkDialog.open) {
    return;
  }

  const focusTarget = frameworkDialogInvoker;
  frameworkDialog.close();
  body.classList.remove("is-framework-dialog-open");
  frameworkDialogInvoker = null;
  window.setTimeout(() => {
    focusTarget?.focus?.({ preventScroll: true });
  }, 0);
};

const openFrameworkDialog = (trigger) => {
  frameworkDialogInvoker = trigger || document.activeElement;
  frameworkDialog.showModal();
  body.classList.add("is-framework-dialog-open");
  window.requestAnimationFrame(() => {
    frameworkDialog.querySelector("h2")?.focus({ preventScroll: true });
  });
};

frameworkDialog.querySelector("[data-framework-close]")?.addEventListener("click", closeFrameworkDialog);
frameworkDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeFrameworkDialog();
});
frameworkDialog.addEventListener("click", (event) => {
  if (event.target === frameworkDialog) {
    closeFrameworkDialog();
  }
});

const centerHomeCanvas = () => {
  if (!homeStage || !homeCanvas) {
    return;
  }

  const maximumScroll = Math.max(0, homeStage.scrollWidth - homeStage.clientWidth);
  homeStage.scrollTo({
    left: maximumScroll / 2,
    behavior: "auto"
  });
};

const scheduleHomeCanvasCenter = () => {
  window.cancelAnimationFrame(homePanFrame);
  homePanFrame = window.requestAnimationFrame(centerHomeCanvas);
};

const cleanProjectId = (hash = window.location.hash) => {
  let candidate = "";

  try {
    candidate = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return null;
  }

  return projects[candidate] ? candidate : null;
};

const viewFromLocation = () => {
  const file = window.location.pathname.split("/").pop() || "index.html";

  if (file === "projects.html") {
    return "projects";
  }

  if (file === "about.html") {
    return "about";
  }

  if (file === "contact.html") {
    return "contact";
  }

  return "home";
};

const routeUrl = (view, projectId = null) => {
  const path = routePaths[view] || routePaths.home;
  return view === "projects" && projectId ? `${path}#${projectId}` : path;
};

const setNavState = (view) => {
  navLinks.forEach((link) => {
    const current = link.dataset.route === view;
    if (current) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const hideLayer = (layer) => {
  if (!layer) {
    return;
  }

  layer.classList.remove(
    "is-entering",
    "is-active",
    "is-switching",
    "is-leaving"
  );
  layer.inert = false;
  layer.hidden = true;
  layer.setAttribute("aria-hidden", "true");
};

const showLayer = (layer, animate = true, variant = "entry") => {
  if (!layer) {
    return;
  }

  layer.hidden = false;
  layer.inert = false;
  layer.removeAttribute("aria-hidden");
  layer.classList.remove(
    "is-entering",
    "is-active",
    "is-switching",
    "is-leaving"
  );

  window.requestAnimationFrame(() => {
    if (!animate || reducedMotion.matches) {
      layer.classList.add("is-active");
      return;
    }

    layer.classList.add(variant === "switch" ? "is-switching" : "is-entering");
  });
};

const focusLayer = (view) => {
  if (view === "home") {
    const target = focusReturn?.isConnected ? focusReturn : document.querySelector('[data-route="home"]');
    target?.focus?.({ preventScroll: true });
    focusReturn = null;
    return;
  }

  let target = null;

  if (view === "projects") {
    target =
      activeProject && !mobileMedia.matches
        ? document.querySelector(`[data-project-id="${activeProject}"]`) ||
          document.getElementById("projects-title")
        : document.getElementById("projects-title");
  } else if (view === "about" && window.location.hash === "#teaching-practice") {
    target = document.getElementById("teaching-practice");
  } else {
    target = document.getElementById(`${view}-title`);
  }

  if (target && !target.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
    target.setAttribute("tabindex", "-1");
  }

  target?.focus?.({ preventScroll: true });

  if (view === "about" && target?.id === "teaching-practice") {
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }
};

const setProjectRegionsVisible = (visible) => {
  projectsLayer?.classList.toggle("is-project-neutral", !visible);

  [projectDetail, projectMedia].filter(Boolean).forEach((region) => {
    region.inert = !visible;

    if (visible) {
      region.removeAttribute("aria-hidden");
    } else {
      region.setAttribute("aria-hidden", "true");
    }
  });
};

const placeProjectRegions = () => {
  if (
    placingProjectRegions ||
    !projectsFrame ||
    !projectDirectory ||
    !projectDetail ||
    !projectMedia
  ) {
    return;
  }

  placingProjectRegions = true;
  const activeOption = activeProject
    ? projectOptions.find((option) => option.dataset.projectId === activeProject)
    : null;

  try {
    if (mobileMedia.matches && activeOption) {
      activeOption.after(mobileProjectPreview);

      if (projectDetail.parentElement !== mobileProjectPreview) {
        mobileProjectPreview.append(projectDetail);
      }

      if (projectMedia.parentElement !== mobileProjectPreview) {
        mobileProjectPreview.append(projectMedia);
      }

      return;
    }

    projectsFrame.insertBefore(projectDetail, projectDirectory);
    projectDirectory.after(projectMedia);
    mobileProjectPreview.remove();
  } finally {
    placingProjectRegions = false;
  }
};

const clearProjectSelection = ({ clearPinned = true } = {}) => {
  projectAnimations.forEach((animation) => animation.cancel());
  projectAnimations = [];
  projectTransitionToken += 1;
  activeProject = null;

  if (clearPinned) {
    pinnedProject = null;
  }

  setProjectRegionsVisible(false);
  placeProjectRegions();

  projectOptions.forEach((option) => {
    option.classList.remove("is-previewed", "is-selected");
    option.setAttribute("aria-pressed", "false");
  });

  if (projectAnnouncer) {
    projectAnnouncer.textContent = "";
  }
};

const selectProject = (
  id,
  {
    persist = false,
    pin = false,
    announce = false,
    moveFocus = false,
    animate = false
  } = {}
) => {
  const next = projects[id];

  if (!next || !projectDetail) {
    return;
  }

  const previousProject = activeProject;
  const shouldAnimate =
    animate &&
    previousProject !== null &&
    id !== previousProject &&
    !reducedMotion.matches;
  activeProject = id;

  if (pin || persist) {
    pinnedProject = id;
  }

  const updateProjectContent = () => {
    projectTitle.textContent = next.title;
    projectStatus.textContent = next.status;
    projectSummary.textContent = next.summary;
    projectImage.src = next.image;
    projectImage.alt = next.alt;
    projectImage.dataset.fit = next.fit || "cover";

    projectAction.replaceChildren();

    if (next.dialog === "framework") {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = next.action;
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", () => openFrameworkDialog(button));
      projectAction.append(button);
    } else if (next.href) {
      const link = document.createElement("a");
      link.href = next.href;
      link.textContent = next.action;

      if (/^https?:/i.test(next.href) || /\.pdf(?:$|[?#])/i.test(next.href)) {
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", `${next.action} (opens in a new tab)`);
      }

      projectAction.append(link);
    } else if (next.availability) {
      const availability = document.createElement("span");
      availability.textContent = next.availability;
      projectAction.append(availability);
    }

    setProjectRegionsVisible(true);
    placeProjectRegions();
  };

  projectAnimations.forEach((animation) => animation.cancel());
  projectAnimations = [];
  projectTransitionToken += 1;
  const transitionToken = projectTransitionToken;

  if (shouldAnimate) {
    const surfaces = [projectDetail, projectMedia].filter(Boolean);
    projectAnimations = surfaces.map((surface) =>
      surface.animate(
        [
          { opacity: 1 },
          { opacity: 0 }
        ],
        {
          duration: 65,
          easing: "ease-out",
          fill: "forwards"
        }
      )
    );

    Promise.allSettled(projectAnimations.map((animation) => animation.finished)).then(
      () => {
        if (transitionToken !== projectTransitionToken) {
          return;
        }

        updateProjectContent();
        projectAnimations = surfaces.map((surface) =>
          surface.animate(
            [
              { opacity: 0 },
              { opacity: 1 }
            ],
            {
              duration: 85,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both"
            }
          )
        );
      }
    );
  } else {
    updateProjectContent();
  }

  projectOptions.forEach((option) => {
    const previewed = option.dataset.projectId === id;
    const selected = option.dataset.projectId === pinnedProject;
    option.classList.toggle("is-previewed", previewed);
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });

  if (persist && activeView === "projects") {
    window.history.replaceState(
      { stageRoute: "projects", projectId: id, openedFromHome },
      "",
      routeUrl("projects", id)
    );
  }

  if (announce && projectAnnouncer) {
    projectAnnouncer.textContent = `${next.title} selected. ${next.status}.`;
  }

  if (moveFocus) {
    document.querySelector(`[data-project-id="${id}"]`)?.focus();
  }
};

const restorePinnedProject = () => {
  if (pinnedProject && projects[pinnedProject]) {
    selectProject(pinnedProject, { animate: true });
    return;
  }

  clearProjectSelection({ clearPinned: false });
};

const applyView = (
  view,
  { projectId = null, animate = true, focus = true } = {}
) => {
  const nextView = routePaths[view] ? view : "home";
  const previousView = activeView;
  const switchingLayers =
    animate &&
    previousView !== "home" &&
    nextView !== "home" &&
    previousView !== nextView;

  window.clearTimeout(layerTransitionTimer);

  if (switchingLayers && !reducedMotion.matches) {
    const outgoing = layers.get(previousView);
    const incoming = layers.get(nextView);

    layers.forEach((layer, key) => {
      if (key !== previousView && key !== nextView) {
        hideLayer(layer);
      }
    });

    if (outgoing) {
      outgoing.setAttribute("aria-hidden", "true");
      outgoing.inert = true;
      outgoing.classList.remove("is-entering", "is-active", "is-switching");
      outgoing.classList.add("is-leaving");
    }

    showLayer(incoming, true, "switch");

    layerTransitionTimer = window.setTimeout(() => {
      hideLayer(outgoing);
      incoming?.classList.remove("is-switching");
      incoming?.classList.add("is-active");
    }, 210);
  } else {
    layers.forEach((layer, key) => {
      if (key === nextView) {
        showLayer(layer, animate);
      } else {
        hideLayer(layer);
      }
    });
  }

  activeView = nextView;
  body.dataset.activeView = nextView;
  body.classList.toggle("has-layer", nextView !== "home");
  document.title = routeTitles[nextView];
  setNavState(nextView);
  if (skipLink) {
    const skipUrl = new URL(window.location.href);
    skipUrl.hash = nextView === "home" ? "home-content" : "main";
    skipLink.href = skipUrl.href;
  }

  if (homeStage) {
    homeStage.inert = mobileMenuOpen || nextView !== "home";
    homeStage.setAttribute("aria-hidden", String(nextView !== "home"));

    if (nextView === "home") {
      homeStage.setAttribute("role", "main");
    } else {
      homeStage.removeAttribute("role");
    }
  }

  if (layerHost) {
    layerHost.inert = nextView === "home";
    layerHost.setAttribute("aria-hidden", String(nextView === "home"));

    if (nextView === "home") {
      layerHost.removeAttribute("role");
    } else {
      layerHost.setAttribute("role", "main");
    }
  }

  if (nextView === "projects") {
    const requestedProjectId = projects[projectId] ? projectId : cleanProjectId();

    if (requestedProjectId) {
      selectProject(requestedProjectId, { announce: false, pin: true });
    } else {
      clearProjectSelection();
    }
  }

  if (focus) {
    const delay =
      animate && !reducedMotion.matches ? (switchingLayers ? 220 : 330) : 0;
    window.setTimeout(() => focusLayer(nextView), delay);
  }
};

const navigateTo = (
  view,
  { projectId = null, source = null, historyMode = null } = {}
) => {
  const nextView = routePaths[view] ? view : "home";

  if (source && source instanceof HTMLElement) {
    focusReturn =
      mobileMedia.matches && nav?.contains(source) ? mobileToggle : source;
  }

  let mode = historyMode;

  if (!mode) {
    if (activeView === "home" && nextView !== "home") {
      mode = "push";
    } else {
      mode = "replace";
    }
  }

  const state = {
    stageRoute: nextView,
    openedFromHome:
      nextView !== "home" &&
      (openedFromHome || (activeView === "home" && nextView !== "home")),
    ...(projectId ? { projectId } : {})
  };
  const url = routeUrl(nextView, projectId);

  if (mode === "push") {
    openedFromHome = activeView === "home" && nextView !== "home";
    window.history.pushState(state, "", url);
  } else {
    window.history.replaceState(state, "", url);
  }

  applyView(nextView, { projectId, animate: activeView !== nextView, focus: true });
  closeMobileMenu({ restoreFocus: false });
};

const returnToHome = ({ source = null } = {}) => {
  if (source && source instanceof HTMLElement) {
    focusReturn =
      mobileMedia.matches && nav?.contains(source) ? mobileToggle : source;
  }

  closeMobileMenu({ restoreFocus: false });

  if (openedFromHome) {
    openedFromHome = false;
    window.history.back();
    return;
  }

  navigateTo("home", { historyMode: "replace" });
};

const closeMobileMenu = ({ restoreFocus = true } = {}) => {
  if (!mobileToggle || !nav) {
    return;
  }

  mobileMenuOpen = false;
  body.classList.remove("is-mobile-menu-open");
  mobileToggle.setAttribute("aria-expanded", "false");

  if (mobileToggleLabel) {
    mobileToggleLabel.textContent = "Menu";
  }

  if (brandLink) {
    brandLink.inert = mobileMedia.matches && activeView !== "home";
  }

  if (mobileMedia.matches) {
    nav.inert = true;
    nav.setAttribute("aria-hidden", "true");
  } else {
    nav.inert = false;
    nav.removeAttribute("aria-hidden");
  }

  if (homeStage) {
    homeStage.inert = activeView !== "home";
  }

  const currentLayer = layers.get(activeView);
  if (currentLayer) {
    currentLayer.inert = false;
  }

  if (restoreFocus) {
    mobileToggle.focus({ preventScroll: true });
  }
};

const openMobileMenu = () => {
  if (!mobileToggle || !nav) {
    return;
  }

  mobileMenuOpen = true;
  body.classList.add("is-mobile-menu-open");
  mobileToggle.setAttribute("aria-expanded", "true");

  if (mobileToggleLabel) {
    mobileToggleLabel.textContent = "Close";
  }

  nav.inert = false;
  nav.removeAttribute("aria-hidden");

  if (brandLink) {
    brandLink.inert = true;
  }

  if (homeStage) {
    homeStage.inert = true;
  }

  const currentLayer = layers.get(activeView);
  if (currentLayer) {
    currentLayer.inert = true;
  }

  nav.querySelector(".nav-link")?.focus({ preventScroll: true });
};

mobileToggle?.addEventListener("click", () => {
  if (mobileMenuOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const view = link.dataset.route;

    if (!routePaths[view]) {
      return;
    }

    event.preventDefault();

    if (view === "home" && activeView !== "home") {
      returnToHome({ source: link });
      return;
    }

    const projectId = link.dataset.projectRoute || (view === "projects" ? cleanProjectId(link.hash) : null);
    navigateTo(view, { projectId, source: link });
  });
});

layerCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    focusReturn = mobileToggle || document.querySelector('[data-route="home"]');
    returnToHome();
  });
});

nav?.querySelectorAll(".nav-link").forEach((link) => {
  const setIntent = () => {
    nav.classList.add("is-intent");
    nav.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.toggle("is-intent-target", item === link);
    });
  };

  link.addEventListener("pointerenter", setIntent);
  link.addEventListener("focus", setIntent);
});

nav?.addEventListener("pointerleave", () => {
  nav.classList.remove("is-intent");
  nav.querySelectorAll(".nav-link").forEach((item) => {
    item.classList.remove("is-intent-target");
  });
});

nav?.addEventListener("focusout", (event) => {
  if (nav.contains(event.relatedTarget)) {
    return;
  }

  nav.classList.remove("is-intent");
  nav.querySelectorAll(".nav-link").forEach((item) => {
    item.classList.remove("is-intent-target");
  });
});

skipLink?.addEventListener("click", (event) => {
  event.preventDefault();

  if (activeView === "home") {
    homeStage?.focus({ preventScroll: true });
    return;
  }

  const activeLayer = layers.get(activeView);
  const target =
    activeLayer?.querySelector("h1, button, a[href], input, textarea") || main;

  if (
    target &&
    !target.hasAttribute("tabindex") &&
    !/^(A|BUTTON|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
  ) {
    target.setAttribute("tabindex", "-1");
  }

  target?.focus({ preventScroll: true });
});

projectOptions.forEach((option, index) => {
  const previewProject = () => {
    selectProject(option.dataset.projectId, { animate: true });
  };

  option.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      previewProject();
    }
  });
  option.addEventListener("focus", previewProject);
  option.addEventListener("click", () => {
    selectProject(option.dataset.projectId, {
      persist: true,
      announce: true,
      animate: true
    });
  });
  option.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let targetIndex = index;

    if (event.key === "ArrowDown") {
      targetIndex = (index + 1) % projectOptions.length;
    } else if (event.key === "ArrowUp") {
      targetIndex = (index - 1 + projectOptions.length) % projectOptions.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = projectOptions.length - 1;
    }

    const target = projectOptions[targetIndex];
    target.focus({ preventScroll: true });
  });
});

projectsFrame?.addEventListener("pointerleave", (event) => {
  if (event.pointerType !== "touch") {
    restorePinnedProject();
  }
});

projectsFrame?.addEventListener("focusout", (event) => {
  if (placingProjectRegions || frameworkDialog.contains(event.relatedTarget)) {
    return;
  }

  if (!projectsFrame.contains(event.relatedTarget)) {
    restorePinnedProject();
  }
});

window.addEventListener("popstate", (event) => {
  const view = viewFromLocation();
  const projectId = view === "projects" ? cleanProjectId() : null;
  openedFromHome = view !== "home" && Boolean(event.state?.openedFromHome);
  applyView(view, { projectId, animate: true, focus: true });
  closeMobileMenu({ restoreFocus: false });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (frameworkDialog.open) {
      return;
    }

    if (mobileMenuOpen) {
      closeMobileMenu();
      return;
    }

    if (activeView !== "home") {
      event.preventDefault();
      returnToHome();
      return;
    }
  }

  if (event.key !== "Tab" || !mobileMedia.matches) {
    return;
  }

  let scope = null;
  let focusables = [];

  if (mobileMenuOpen) {
    scope = nav;
    focusables = [
      mobileToggle,
      ...scope.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])'
      )
    ];
  } else if (activeView !== "home") {
    scope = layers.get(activeView);
    focusables = [
      mobileToggle,
      ...scope.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
      )
    ];
  }

  focusables = focusables.filter((node) => node && !node.hidden && node.offsetParent !== null);

  if (!focusables.length) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

mobileMedia.addEventListener("change", () => {
  closeMobileMenu({ restoreFocus: false });
  placeProjectRegions();
  scheduleHomeCanvasCenter();
});

window.addEventListener("resize", scheduleHomeCanvasCenter);
window.addEventListener("load", scheduleHomeCanvasCenter, { once: true });

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  formStatus.className = "form-status";
  formStatus.textContent = "Sending your message…";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      let message = "I couldn’t send that. Please check the fields and try again.";

      try {
        const payload = await response.json();
        if (Array.isArray(payload.errors) && payload.errors.length) {
          message = payload.errors.map((error) => error.message).filter(Boolean).join(" ");
        }
      } catch {
        // Keep the honest generic error when Formspree does not return JSON.
      }

      throw new Error(message);
    }

    contactForm.reset();
    formStatus.classList.add("is-success");
    formStatus.textContent = "Message sent. Thanks — I’ll reply to the email you provided.";
  } catch (error) {
    formStatus.classList.add("is-error");
    formStatus.textContent =
      error instanceof Error && error.message
        ? error.message
        : "I couldn’t send that. Please check your connection and try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send message →";
  }
});

const initialProjectId =
  activeView === "projects" ? cleanProjectId() : null;

window.history.replaceState(
  {
    stageRoute: activeView,
    openedFromHome: false,
    ...(initialProjectId ? { projectId: initialProjectId } : {})
  },
  "",
  window.location.href
);

applyView(activeView, {
  projectId: initialProjectId,
  animate: false,
  focus: false
});
closeMobileMenu({ restoreFocus: false });
document.documentElement.classList.add("stage-ready");
scheduleHomeCanvasCenter();

if (!app || !layerHost) {
  throw new Error("Portfolio stage shell is incomplete.");
}
