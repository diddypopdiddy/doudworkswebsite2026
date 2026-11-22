import { $, isSmallScreen, wait, reducedMotion, announce, navigate } from "./util.js";
import { SPACES } from "./data.js";
import { startAnalytics } from "./analytics.js";

/* Router with real paths: / (basement), /explore, /art, /music, /video, /teaching, /ai, /about, /skateboards, /contact
   (some take a second part, like /ai/sk8maps). Each path also has its own folder with an index.html
   (written by tools/build_pages.py) so links work on any static host and show the right preview. */
const PAGES = {
  home: () => import("./room.js"),
  explore: () => import("./pages/explore.js"),
  art: () => import("./pages/gallery.js"),
  music: () => import("./pages/music.js"),
  video: () => import("./pages/video.js"),
  teaching: () => import("./pages/teaching.js"),
  ai: () => import("./pages/laptop.js"),
  about: () => import("./pages/about.js"),
  skateboards: () => import("./pages/skateboards.js"),
  contact: () => import("./pages/contact.js"),
};

const app = $("#app");
const curtain = $("[data-curtain]");
const topbar = $("[data-topbar]");
const backLink = $("[data-back]");
const titleEl = $("[data-title]");
const exploreLink = $("[data-explore]");

let current = null; // { name, instance, root }
let busy = Promise.resolve();
let lastRoute = null;

// Old links used #/music. Move them to /music before anything renders.
if (location.hash.startsWith("#/")) history.replaceState(null, "", "/" + location.hash.slice(2).replace(/^\/+/, ""));

export function parse(pathname = location.pathname) {
  const [path, ...rest] = pathname.replace(/^\/+|\/+$/g, "").split("/");
  let name = path || "home";
  if (!PAGES[name]) name = "home";
  return { name, param: rest.join("/") ? decodeURIComponent(rest.join("/")) : "" };
}

export function go(name, param = "") {
  navigate(name === "home" ? "/" : `/${name}${param ? "/" + encodeURIComponent(param) : ""}`);
}

function setChrome(name) {
  const isHome = name === "home";
  topbar.dataset.mode = isHome ? "home" : name;
  backLink.hidden = isHome;
  const label = name === "explore" ? "Contents" : SPACES[name]?.label || "";
  titleEl.textContent = isHome ? "" : label;
  exploreLink.textContent = isSmallScreen() ? "List" : "Explore";
  exploreLink.toggleAttribute("aria-current", name === "explore");
  if (name === "explore") exploreLink.setAttribute("aria-current", "page");
  document.title = isHome ? "Vince Doud – Teacher + Creator" : `${label} – Vince Doud`;
  document.body.classList.toggle("is-scroll", false);
}

async function render() {
  const route = parse();
  busy = busy.then(() => swap(route)).catch((e) => console.error(e));
  return busy;
}

async function swap(route) {
  const from = current?.name || null;
  if (current && current.name === route.name) {
    current.instance?.update?.(route);
    return;
  }
  const loader = PAGES[route.name]();

  if (current) {
    // Let the outgoing page animate (the room zooms toward what you clicked).
    const leaving = current.instance?.leave?.(route) || Promise.resolve();
    curtain.classList.add("is-down");
    await Promise.all([leaving, wait(reducedMotion() ? 0 : 320)]);
    try { current.instance?.unmount?.(); } catch (e) { console.error(e); }
    current.root.remove();
    current = null;
  }

  const mod = await loader;
  const root = document.createElement("div");
  root.className = `page page-${route.name}`;
  app.append(root);
  setChrome(route.name);
  const instance = await mod.default.mount(root, { route, from, go, lastRoute });
  current = { name: route.name, instance, root };
  lastRoute = route;
  requestAnimationFrame(() => curtain.classList.remove("is-down"));
  announce(route.name === "home" ? "The basement" : `${titleEl.textContent || "Page"} opened`);
  if (route.name !== "home") app.focus({ preventScroll: true });
}

addEventListener("popstate", render);
addEventListener("routechange", render);
// Same-site links (href="/music") route in place instead of reloading the page.
addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a[href^='/']");
  if (!a || a.target || a.hasAttribute("download")) return;
  const url = new URL(a.href);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  navigate(url.pathname);
});
addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || e.defaultPrevented) return;
  if (!current || current.name === "home") return;
  if (current.instance?.onEscape?.(e)) return;
  go("home");
});
let wasSmall = isSmallScreen();
addEventListener("resize", () => {
  const small = isSmallScreen();
  if (small !== wasSmall) { wasSmall = small; exploreLink.textContent = small ? "List" : "Explore"; }
});

startAnalytics();
render();
