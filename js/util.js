export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Create an element from an HTML string (first element). */
export function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Phones and small screens (some pages switch to a simpler layout). */
export const isSmallScreen = () => matchMedia("(max-width: 767px), (max-height: 480px) and (pointer: coarse)").matches;

/** Go to a page by its path ("/music", "/ai/sk8maps"). The router in app.js picks it up. */
export function navigate(path, { replace = false } = {}) {
  if (path === location.pathname) { dispatchEvent(new Event("routechange")); return; }
  history[replace ? "replaceState" : "pushState"](null, "", path);
  dispatchEvent(new Event("routechange"));
}

/** Give an open detail view a shareable address without remounting the page. */
export function replaceDetailAddress(path) {
  history.replaceState(null, "", path);
  dispatchEvent(new Event("detailaddresschange"));
}

const etDay = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long" });
const etMonthDay = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
const etTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
const etShort = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric" });
const etNumeric = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" });

/** Today's date in Eastern time, no matter where the visitor is. */
export function easternNow(d = new Date()) {
  return {
    weekday: etDay.format(d),
    monthDay: etMonthDay.format(d),
    time: etTime.format(d),
    short: etShort.format(d),
    numeric: etNumeric.format(d),
    key: etNumeric.format(d),
  };
}

export function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function announce(msg) {
  const el = document.querySelector("[data-announce]");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(() => (el.textContent = msg));
}

/** Track listeners so a page can tear everything down in one call. */
export function scope() {
  const offs = [];
  return {
    on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      offs.push(() => target.removeEventListener(type, fn, opts));
    },
    add(fn) { offs.push(fn); },
    interval(fn, ms) { const id = setInterval(fn, ms); offs.push(() => clearInterval(id)); return id; },
    timeout(fn, ms) { const id = setTimeout(fn, ms); offs.push(() => clearTimeout(id)); return id; },
    raf(fn) {
      let id = 0, alive = true;
      const loop = (t) => { if (!alive) return; fn(t); id = requestAnimationFrame(loop); };
      id = requestAnimationFrame(loop);
      offs.push(() => { alive = false; cancelAnimationFrame(id); });
    },
    dispose() { while (offs.length) try { offs.pop()(); } catch (e) { console.error(e); } },
  };
}

export async function loadJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

/** Short tick for UI feedback (click wheel, keypad). Silent until the visitor interacts. */
let ctx;
export function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
export function tick(volume = 0.05) {
  const a = audioCtx(); if (!a) return;
  const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.type = "square"; o.frequency.setValueAtTime(2200, t);
  g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.02);
}
