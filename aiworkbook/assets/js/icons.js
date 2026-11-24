/* Icons, stars and answer hotkeys. Loaded right after core.js. */
(function () {
  /* line icons on a 24px grid, drawn with currentColor */
  const P = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/><path d="M12 14.5v2.5"/>',
    share: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/>',
    flame: '<path d="M12 3c.8 3.2 5 5.2 5 10.2a5 5 0 0 1-10 0c0-2.3 1-3.8 2.2-4.8.1 2 1 3.1 2.2 3.1 0-3-1.6-5.2.6-8.5z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    bubble: '<path d="M4.5 6.5a2.5 2.5 0 0 1 2.5-2.5h10a2.5 2.5 0 0 1 2.5 2.5v6.5a2.5 2.5 0 0 1-2.5 2.5h-6l-4.5 4v-4a2 2 0 0 1-2-2z"/><path d="M8.5 9.8h.01M12 9.8h.01M15.5 9.8h.01"/>',
    go: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/>',
    fence: '<path d="M5.5 20V7.5L7.5 5l2 2.5V20M14.5 20V7.5l2-2.5 2 2.5V20M3 10.5h18M3 15.5h18"/>',
    stop: '<path d="M8.6 3.5h6.8l5.1 5.1v6.8l-5.1 5.1H8.6l-5.1-5.1V8.6z"/><path d="M9 9l6 6M15 9l-6 6"/>',
    star: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
    arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    back: '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
    chat: '<path d="M4 5.5h16v10.5H10l-5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    shield: '<path d="M12 3l7.5 3v5.6c0 4.4-3.2 8.2-7.5 9.4-4.3-1.2-7.5-5-7.5-9.4V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    scale: '<path d="M12 4v16M7 20h10M4.5 7.5h15M7 7.5l-3 6.5h6zM17 7.5l-3 6.5h6z"/>',
    idea: '<path d="M9.5 17.5h5M10.5 20.5h3M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5.9 1.2.9 2v1.5h5V16c0-.8.3-1.5.9-2A5.8 5.8 0 0 0 12 3.5z"/>',
    learning: '<path d="M3.5 6c3-1.5 5.8-1.5 8.5 0v13c-2.7-1.5-5.5-1.5-8.5 0zM20.5 6c-3-1.5-5.8-1.5-8.5 0v13c2.7-1.5 5.5-1.5 8.5 0z"/>',
    feedback: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 8h8"/><path d="M8 12h5"/>',
    practice: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    none: '<path d="M8 12.5V5.8a1.4 1.4 0 0 1 2.8 0V11M10.8 10.5V4.6a1.4 1.4 0 0 1 2.8 0V11M13.6 11V6.2a1.4 1.4 0 0 1 2.8 0v7.6a6.2 6.2 0 0 1-6.2 6.2h-.4a5.6 5.6 0 0 1-5.1-3.3L3.9 13a1.4 1.4 0 0 1 2.4-1.3L8 13.5"/>',
    grid: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M9.2 9.5v10M14.8 9.5v10M3.5 14.5h17"/>',
    stations: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.8"/><circle cx="20" cy="12" r="1.8"/><circle cx="12" cy="20" r="1.8"/><circle cx="4" cy="12" r="1.8"/>',
    robot: '<rect x="4.5" y="7.5" width="15" height="11" rx="3"/><path d="M12 7.5V4.5"/><circle cx="12" cy="4" r="1"/><path d="M9 12h.01M15 12h.01M9.5 15.5h5"/>',
    marker: '<path d="M14.5 4.5l5 5-8.5 8.5H6v-5z"/><path d="M4 21h8"/>',
    doc: '<path d="M6.5 3.5h7.5l4.5 4.5v12.5h-12z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 15.5h6"/>',
    trophy: '<path d="M7.5 4.5h9v4a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5a3 3 0 0 0 3 3.5M16.5 6h3a3 3 0 0 1-3 3.5M12 13v3.5M9.5 16.5h5v4h-5z"/>',
    print: '<path d="M7 9V3.5h10V9M7 17.5H4.5v-7a1.5 1.5 0 0 1 1.5-1.5h12a1.5 1.5 0 0 1 1.5 1.5v7H17"/><path d="M7 14.5h10v6H7z"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/>',
    team: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.5 14.4a4.5 4.5 0 0 1 5.5 4.4"/>',
    solo: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    bolt: '<path d="M13 3L5 13.5h6L10 21l8.5-10.5h-6z"/>',
    pencil: '<path d="M4.5 19.5l1-4.2L16 4.8a2 2 0 0 1 2.9 0l.3.3a2 2 0 0 1 0 2.9L8.7 18.5z"/>'
  };
  WB.icon = function (name, cls) {
    return `<svg class="ico ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[name] || ""}</g></svg>`;
  };
  WB.lensIcon = { prompting: "chat", privacy: "shield", ethics: "scale", verification: "search" };

  /* stars: 0 to 3 per game, from the best score */
  const T = {
    literacy: [2000, 4000, 6000],
    station: [400, 700, 900],
    crossroads: [250, 750, 1000],
    boss: [1200, 2000, 2600]
  };
  WB.starsFor = function (kind, score) {
    const t = T[kind] || T.station;
    return score >= t[2] ? 3 : score >= t[1] ? 2 : score >= t[0] ? 1 : 0;
  };
  WB.starRow = function (n, cls) {
    return `<span class="stars ${cls || ""}" role="img" aria-label="${n} of 3 stars">${[0, 1, 2].map(i => `<span class="star ${i < n ? "on" : ""}" style="--i:${i}">${WB.icon("star")}</span>`).join("")}</span>`;
  };
  WB.totalStars = () => WB.starsFor("literacy", WB.state.literacy.best);

  /* keyboard: A to D (or 1 to 4) picks an answer in the newest answer group */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    let idx = "abcd".indexOf(k);
    if (idx < 0) idx = "1234".indexOf(k);
    if (idx < 0) return;
    const dlg = document.querySelector("dialog[open]");
    const scope = dlg || document.getElementById("main");
    const groups = WB.$$(".answers", scope).filter(g => g.offsetParent !== null && WB.$$("button.ans:not(:disabled)", g).length);
    const g = groups[groups.length - 1];
    if (!g) return;
    const btns = WB.$$("button.ans", g);
    if (btns[idx] && !btns[idx].disabled) { e.preventDefault(); btns[idx].click(); }
  });
})();
