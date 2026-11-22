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
  const [section, detail, extra] = location.pathname.split("/").filter(Boolean);
  const label = section === "explore" ? "Contents" :
    Object.hasOwn(SPACES, section) ? SPACES[section].label : null;
  if (!label) return { path: "/", title: "Vince Doud – Teacher + Creator" };

  // Use the public studio routes, omitting query strings and fragments.
  const project = section === "ai" && !extra && APPS.find((item) => item.id === detail);
  const artwork = section === "art" && !extra && /^\d{1,3}$/.test(detail);
  const collection = section === "video" && !extra && ["covers", "woodbury", "archive"].includes(detail);
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
  const { path, title } = pageDetails();
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
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  } else {
    gtag("set", page);
  }
  gtag("event", "page_view", page);
  lastPage = pageLocation;
}

export function startAnalytics() {
  const notice = document.createElement("section");
  notice.className = "paper-card analytics-notice";
  notice.setAttribute("aria-labelledby", "analytics-title");
  notice.innerHTML = `
    <h2 id="analytics-title">Website analytics</h2>
    <p>Allow Google Analytics cookies to help Vince see which pages people visit. <a href="privacy.html">Privacy and settings</a></p>
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

  for (const event of ["routechange", "popstate", "detailaddresschange"]) {
    addEventListener(event, recordPage);
  }
}

const settings = document.querySelector("[data-analytics-settings]");
if (settings) {
  const showPreference = () => {
    settings.querySelector("[role='status']").textContent =
      preference === "allow" ? "Analytics is allowed in this browser." : "Analytics is off in this browser.";
  };
  bindChoices(settings, showPreference);
  showPreference();
  settings.hidden = false;
}
