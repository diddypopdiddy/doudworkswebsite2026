import { APPS, SPACES } from "./data.js";

const MEASUREMENT_ID = "G-7M91585P6T";
const PREFERENCE_KEY = "vincedoud.analytics";
const DISABLE_FLAG = `ga-disable-${MEASUREMENT_ID}`;
const live = location.protocol === "https:" &&
  ["www.vincedoud.com", "vincedoud.com"].includes(location.hostname);
const denied = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

let preference = readPreference();
let lastPage = "";
let gtag;

function readPreference() {
  try {
    const stored = localStorage.getItem(PREFERENCE_KEY);
    return stored === "allow" || stored === "decline" ? stored : null;
  } catch {
    return null;
  }
}

function applyPreference(next) {
  preference = next;
  window[DISABLE_FLAG] = next !== "allow";
  if (next === "allow") return;
  lastPage = "";
  // Google Analytics is configured below to keep its cookies on this hostname.
  for (const cookie of ["_ga", `_ga_${MEASUREMENT_ID.slice(2)}`]) {
    document.cookie = `${cookie}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
  }
}

function bindChoices(element, onChange) {
  const buttons = element.querySelectorAll("[data-analytics-choice]");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const next = button.dataset.analyticsChoice;
      try {
        localStorage.setItem(PREFERENCE_KEY, next);
      } catch {
        // The choice still applies to this document when storage is blocked.
      }
      applyPreference(next);
      onChange();
    });
  }
  const sync = () => {
    applyPreference(readPreference());
    onChange();
  };
  addEventListener("storage", (event) => {
    if (event.key === PREFERENCE_KEY || event.key === null) sync();
  });
  addEventListener("pageshow", (event) => {
    if (event.persisted) sync();
  });
}

function pageDetails() {
  const standalone = document.querySelector('script[data-vd-page]');
  if (standalone) {
    const path = standalone.dataset.vdPage;
    if (!/^\/[a-z0-9/.-]*$/.test(path) || path.includes('..')) return null;
    const current = location.pathname.replace(/\/index\.html$/, '/');
    if (current !== path && current + '/' !== path) return null;
    const workbookRoutes = { '#/literacy': 'AI Literacy Quiz Board', '#/stations': 'Core Competency Station Rotation', '#/boss': 'The Autopilot', '#/workbook': 'My Workbook' };
    const chapter = path === '/aiworkbook/' && Object.hasOwn(workbookRoutes, location.hash) ? location.hash : '';
    const anchor = path === '/frameworkpathway/' ? location.hash.slice(1) : '';
    const slide = /^[a-z0-9-]+$/.test(anchor) ? document.getElementById(anchor) : null;
    const tour = slide?.matches('section.slide') ? '#' + slide.id : '';
    return {path: path + (chapter || tour), title: chapter ? workbookRoutes[chapter] + ' – Vince Doud' : standalone.dataset.vdTitle};
  }
  if (location.pathname === '/privacy.html') return { path: '/privacy.html', title: 'Privacy – Vince Doud' };
  const [section, detail, extra] = location.pathname.split("/").filter(Boolean);
  const label = section === "explore" ? "Contents" :
    Object.hasOwn(SPACES, section) ? SPACES[section].label : null;
  if (!section || section === "index.html") return { path: "/", title: "Vince Doud – Teacher + Creator" };
  if (!label) return null;

  // Use the public studio routes, omitting query strings and fragments.
  const project = section === "ai" && !extra && APPS.find((item) => item.id === detail);
  const artwork = ["art", "skateboards"].includes(section) && !extra && /^(?:[1-9]|1[0-7])$/.test(detail);
  const collection = section === "video" && !extra && ["covers", "woodbury", "archive", "memorial"].includes(detail);
  return {
    path: project || artwork || collection ? `/${section}/${detail}/` : `/${section}/`,
    title: `${project?.title || label} – Vince Doud`,
  };
}

function referrerOrigin() {
  try {
    return new URL(document.referrer).origin + "/";
  } catch {
    return "";
  }
}

function recordPage() {
  if (!live || preference !== "allow") return;
  const details = pageDetails();
  if (!details) return;
  const { path, title } = details;
  const pageLocation = new URL(path, location.origin).href;
  if (pageLocation === lastPage) return;
  const page = {
    page_location: pageLocation,
    page_title: title,
    page_referrer: lastPage || referrerOrigin(),
  };

  if (!gtag) {
    window.dataLayer = window.dataLayer || [];
    gtag = window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("consent", "default", denied);
    gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    gtag("set", {
      ...page,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: "none",
    });
    gtag("js", new Date());
    gtag("config", MEASUREMENT_ID, {
      ...page,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: "none",
    });
    const script = document.createElement("script");
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  } else {
    gtag("set", page);
  }
  gtag("event", "page_view", { ...page, send_to: MEASUREMENT_ID });
  lastPage = pageLocation;
}

let started = false;
export function startAnalytics() {
  if (started || !live || window.top !== window.self) return;
  started = true;
  const notice = document.createElement("section");
  notice.className = "paper-card analytics-notice";
  notice.setAttribute("aria-labelledby", "analytics-title");
  notice.innerHTML = `
    <h2 id="analytics-title">Website analytics</h2>
    <p>Allow Google Analytics cookies to help Vince see which pages people visit. <a href="/privacy.html">Privacy and settings</a></p>
    <div class="analytics-actions">
      <button class="btn is-ghost" type="button" data-analytics-choice="decline">Decline</button>
      <button class="btn is-ghost" type="button" data-analytics-choice="allow">Allow analytics</button>
    </div>`;
  const update = () => {
    if (preference && notice.contains(document.activeElement)) {
      document.querySelector("#app")?.focus({ preventScroll: true });
    }
    notice.hidden = preference !== null;
    recordPage();
  };
  bindChoices(notice, update);
  if (preference) applyPreference(preference);
  update();
  document.body.append(notice);

  for (const event of ["routechange", "popstate", "detailaddresschange", "hashchange", "vd-tour-slide"]) {
    addEventListener(event, recordPage);
  }
}

const settings = document.querySelector("[data-analytics-settings]");
if (settings) {
  const showPreference = () => {
    settings.querySelector("[role='status']").textContent =
      preference === "allow" ? "Analytics is allowed in this browser." : "Analytics is off in this browser.";
    if (live && window.top === window.self) recordPage();
  };
  bindChoices(settings, showPreference);
  showPreference();
  settings.hidden = false;
}

if (document.querySelector('script[data-vd-page]')) startAnalytics();
