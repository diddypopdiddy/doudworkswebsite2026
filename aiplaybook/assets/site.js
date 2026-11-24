/* AI Production Teacher Playbook. Small helpers only: every page works without this file. */
(function () {
  "use strict";

  function remember(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (err) { /* private windows and blocked storage: carry on without it */ }
    return null;
  }

  // Copy buttons. A prompt's button copies its text. A button with data-copy copies the element it names.
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".copy, [data-copy]");
    if (!btn) return;
    var named = btn.getAttribute("data-copy");
    var src = named ? document.querySelector(named) : btn.closest(".prompt").querySelector("blockquote");
    if (!src) return;
    var text = (named ? src.innerText : src.textContent).trim();
    var label = btn.textContent;
    function ok() {
      btn.textContent = "Copied";
      btn.classList.add("ok");
      setTimeout(function () { btn.textContent = label; btn.classList.remove("ok"); }, 1600);
    }
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents(src);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try { if (document.execCommand("copy")) ok(); } catch (err) { /* leave the text selected */ }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
  });

  var printButton = document.querySelector(".print-button");
  if (printButton) {
    printButton.addEventListener("click", function () { window.print(); });
  }

  // Tabs: the day picker in a lesson and the tool picker in the hand-in guide.
  // Without this script every panel shows in order.
  var groups = Array.prototype.map.call(document.querySelectorAll("[data-tabs]"), function (group) {
    var tablist = group.querySelector(".tabs");
    var tabs = Array.from(tablist.querySelectorAll("button"));
    var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute("aria-controls")); });
    var store = "playbook-tab:" + location.pathname + ":" + group.getAttribute("data-tabs");

    function select(index, keep) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      // Where the row of tabs scrolls sideways, keep the chosen one in view.
      if (tablist.scrollWidth > tablist.clientWidth) tablist.scrollLeft = tabs[index].offsetLeft - tablist.offsetLeft - 16;
      if (keep) remember(store, panels[index].id);
    }
    function indexOf(id) {
      return panels.findIndex(function (panel) { return panel.id === id; });
    }
    tablist.setAttribute("role", "tablist");
    tabs.forEach(function (tab, i) {
      tab.setAttribute("role", "tab");
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", tab.id);
      tab.addEventListener("click", function () { select(i, true); });
      tab.addEventListener("keydown", function (event) {
        var next;
        switch (event.key) {
          case "ArrowLeft": next = (i + tabs.length - 1) % tabs.length; break;
          case "ArrowRight": next = (i + 1) % tabs.length; break;
          case "Home": next = 0; break;
          case "End": next = tabs.length - 1; break;
          default: return;
        }
        event.preventDefault();
        select(next, true);
        tabs[next].focus();
      });
    });
    // A link to a panel wins, then the tab picked last time, then the first.
    var linked = indexOf(location.hash.slice(1));
    var last = indexOf(remember(store));
    select(linked >= 0 ? linked : Math.max(0, last), false);
    tablist.hidden = false;
    return { panels: panels, select: select, indexOf: indexOf };
  });

  function showLinkedPanel() {
    var id = location.hash.slice(1);
    groups.forEach(function (group) {
      var index = group.indexOf(id);
      if (index < 0) return;
      group.select(index, true);
      group.panels[index].scrollIntoView();
    });
  }
  if (groups.length) {
    showLinkedPanel();
    window.addEventListener("hashchange", showLinkedPanel);
  }

  // Paper gets everything: every day, every tool and every collapsed row.
  var restore = [];
  window.addEventListener("beforeprint", function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tabs] [hidden][role=tabpanel], details:not([open])"), function (el) {
      var isDetails = el.tagName === "DETAILS";
      if (isDetails) { el.open = true; } else { el.hidden = false; }
      restore.push(function () { if (isDetails) { el.open = false; } else { el.hidden = true; } });
    });
  });
  window.addEventListener("afterprint", function () {
    restore.forEach(function (undo) { undo(); });
    restore = [];
  });

  // Keep the current module in view where the module strip scrolls sideways.
  var strip = document.querySelector(".module-strip ol");
  var here = strip && strip.querySelector(".here");
  if (here && strip.scrollWidth > strip.clientWidth) {
    strip.scrollLeft = here.offsetLeft - strip.offsetLeft - 16;
  }

  // Show there is more of the module strip to the side until the last module is in view.
  if (strip) {
    var edge = function () { strip.classList.toggle("more", strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 8); };
    strip.addEventListener("scroll", edge, { passive: true });
    window.addEventListener("resize", edge);
    edge();
  }

  // Once you are reading, the module strip folds down to one line of names.
  var root = document.documentElement, slim = false;
  function fold() {
    var y = window.scrollY;
    if (!slim && y > 260) { slim = true; root.classList.add("reading"); }
    else if (slim && y < 120) { slim = false; root.classList.remove("reading"); }
  }
  window.addEventListener("scroll", fold, { passive: true });
  fold();

  // Mark the section being read in the "On this page" menu.
  var menu = document.querySelector(".pagenav");
  if (menu && "IntersectionObserver" in window) {
    var links = Array.from(menu.querySelectorAll("a"));
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var visible = new Set();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { visible.add(entry.target); } else { visible.delete(entry.target); }
      });
      // The last one in view wins, so a guide nested inside a section is marked when you reach it.
      var current = sections.slice().reverse().find(function (section) { return section && visible.has(section); });
      links.forEach(function (a, i) {
        if (sections[i] && sections[i] === current) {
          a.setAttribute("aria-current", "true");
          if (menu.scrollWidth > menu.clientWidth) menu.scrollLeft = a.offsetLeft - menu.offsetLeft - 60;
        } else {
          a.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-25% 0px -60% 0px" });
    sections.forEach(function (section) { if (section) spy.observe(section); });
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
