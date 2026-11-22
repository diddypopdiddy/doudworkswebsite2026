/* AI Educator Playbook. Small helpers only: every page works without this file. */
(function () {
  "use strict";

  // Copy buttons on prompts and wording blocks.
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".copy");
    if (!btn) return;
    var src = btn.closest(".prompt").querySelector("blockquote");
    var text = src.textContent.trim();
    function ok() {
      btn.textContent = "Copied";
      btn.classList.add("ok");
      setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("ok"); }, 1600);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents(src);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try { if (document.execCommand("copy")) ok(); } catch (err) { /* leave the text selected */ }
    }
  });

  // Keep the current stop in view on narrow screens, where the road scrolls sideways.
  var road = document.querySelector(".road");
  var now = road && road.querySelector(".here");
  if (now && road.scrollWidth > road.clientWidth) {
    road.scrollLeft = now.offsetLeft - road.clientWidth / 2 + now.offsetWidth / 2;
  }

  // Review mode (?review on the address) stays on while you move between pages.
  if (document.documentElement.classList.contains("review")) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href$=".html"], a[href*=".html#"]'), function (a) {
      var href = a.getAttribute("href");
      if (/^(\.\.|https?:)/.test(href)) return;
      var parts = href.split("#");
      a.setAttribute("href", parts[0] + "?review" + (parts[1] ? "#" + parts[1] : ""));
    });
  }
})();

document.querySelectorAll('[data-tabs]').forEach((group) => {
  const tabList = group.querySelector('[data-tab-list]');
  const tabs = Array.from(tabList.querySelectorAll('[data-tab]'));
  const panels = tabs.map((tab) => document.getElementById(tab.dataset.tab));

  function select(index, focus) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(index === i));
      tab.tabIndex = index === i ? 0 : -1;
      panels[i].hidden = index !== i;
    });
    if (focus) tabs[index].focus();
  }

  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Submission tool');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (ev) => {
      const keys = {
        ArrowLeft: (i + tabs.length - 1) % tabs.length,
        ArrowRight: (i + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(ev.key in keys)) return;
      ev.preventDefault();
      select(keys[ev.key], true);
    });
  });
  select(0, false);
  tabList.hidden = false;
});

document.querySelectorAll('[data-print]').forEach((button) => {
  button.addEventListener('click', () => window.print());
});
