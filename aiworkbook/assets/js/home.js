/* Home (hero + quest map) and My Workbook (progress, stars, reflections, print). */
(function () {
  const esc = WB.esc;
  const I = (n, c) => WB.icon(n, c);

  function status(done, started) {
    if (done) return `<span class="pill pill-done">Complete</span>`;
    if (started) return `<span class="pill">In progress</span>`;
    return `<span class="pill pill-new">Not started</span>`;
  }

  WB.botArt = function (cls) {
    return `<svg viewBox="0 0 120 110" class="bot-svg ${cls || ""}" aria-hidden="true">
      <line x1="60" y1="17" x2="60" y2="6" class="ant"/><circle cx="60" cy="6" r="5" class="ant-b"/>
      <rect x="6" y="44" width="12" height="24" rx="5" class="ear"/><rect x="102" y="44" width="12" height="24" rx="5" class="ear"/>
      <rect x="36" y="88" width="48" height="16" rx="6" class="neck"/>
      <rect x="14" y="17" width="92" height="72" rx="20" class="bot"/>
      <rect x="24" y="31" width="72" height="30" rx="12" class="visor"/>
      <rect x="33" y="38" width="20" height="16" rx="5" class="eye"/><rect x="67" y="38" width="20" height="16" rx="5" class="eye"/>
      <circle cx="28" cy="74" r="5" class="cheek"/><circle cx="92" cy="74" r="5" class="cheek"/>
      <rect x="44" y="70" width="32" height="7" rx="3.5" class="mouth"/>
    </svg>`;
  };

  function heroArt() {
    const cols = ["var(--cobalt)", "var(--mint)", "var(--grape)", "var(--tang)"];
    let tiles = "";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      tiles += (r === 1 && c === 2) ? `<i style="background:#2A2438;border:2px dashed rgba(255,255,255,.25)"></i>` : `<i style="background:${cols[c]}">${(r + 1) * 100}</i>`;
    }
    return `
      <div class="hero-art" aria-hidden="true">
        <div class="fan fan-1"><div class="fan-head"><span>Quiz Board</span><span>01</span></div><div class="fan-body"><div class="mini-board">${tiles}</div></div></div>
        <div class="fan fan-2"><div class="fan-head"><span>Stations</span><span>02</span></div><div class="fan-body"><div class="mini-stamps">
          <i style="background:var(--cobalt-soft)">P</i><i style="background:var(--mint-soft)">D</i><i style="background:var(--grape-soft)">E</i><i style="background:var(--tang-soft)">V</i></div></div></div>
        <div class="fan fan-3"><div class="fan-head"><span>Final Boss</span><span>03</span></div><div class="fan-body"><div class="mini-boss">${WB.botArt()}</div><div class="mini-hp"><b></b></div></div></div>
      </div>`;
  }

  function chArt(n, st) {
    if (n === 1) {
      const cols = ["#5B74FF", "#3FD9A3", "#AE8BFF", "#FF9D52", "#FF6B7E"];
      let s = `<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMax meet"><rect x="20" y="14" width="220" height="122" rx="16" fill="#1A1626" stroke="#000" stroke-width="3"/>`;
      cols.forEach((c, i) => { s += `<rect x="${32 + i * 40}" y="26" width="35" height="14" rx="4" fill="#FFF8EC" stroke="#000" stroke-width="2"/><rect x="${32 + i * 40}" y="26" width="35" height="4" fill="${c}"/>`; });
      for (let r = 0; r < 3; r++) cols.forEach((c, i) => {
        const used = (r === 0 && i === 1) || (r === 1 && i === 3);
        s += used ? `<rect x="${32 + i * 40}" y="${47 + r * 28}" width="35" height="22" rx="5" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-dasharray="4 3"/>`
          : `<rect x="${32 + i * 40}" y="${47 + r * 28}" width="35" height="22" rx="5" fill="${c}" stroke="#000" stroke-width="2"/><text x="${49.5 + i * 40}" y="${62.5 + r * 28}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="11" fill="#1A1626">${(r + 1) * 100}</text>`;
      });
      return s + `</svg>`;
    }
    if (n === 2) {
      const L = [["P", "#5B74FF", "prompting", 130, 32], ["D", "#3FD9A3", "privacy", 206, 78], ["E", "#AE8BFF", "ethics", 130, 118], ["V", "#FF9D52", "verification", 54, 78]];
      let s = `<svg viewBox="0 0 260 140" preserveAspectRatio="xMidYMax meet"><circle cx="130" cy="78" r="50" fill="none" stroke="#1A1626" stroke-width="2.5" stroke-dasharray="6 6"/>
        <circle cx="130" cy="78" r="16" fill="${st.crossroads.done ? "#1A1626" : "#FFF8EC"}" stroke="#1A1626" stroke-width="2.5"/>`;
      L.forEach(([l, c, k, x, y]) => {
        const on = st[k].done;
        s += `<circle cx="${x}" cy="${y}" r="21" fill="${on ? c : "#FFF8EC"}" stroke="#1A1626" stroke-width="3"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="18" fill="#1A1626">${l}</text>`;
      });
      return s + `</svg>`;
    }
    return `<svg viewBox="0 0 260 140" preserveAspectRatio="xMidYMax meet"><g class="bot-svg" transform="translate(78 2) scale(.86)">${WB.botArt().replace(/<\/?svg[^>]*>/g, "")}</g></svg>`;
  }

  WB.route("/", function (main) {
    const s = WB.state;
    const st = s.stations;
    const nStations = WB.stationsDone();
    const started = WB.totalXP() > 0;
    const next = s.literacy.done ? (st.crossroads.done ? "boss" : "stations") : "literacy";
    const ch = (n, key, href, kicker, title, text, done, startedCh, stars, extra) => `
      <a class="chapter ch${n} ${done ? "is-done" : ""}" href="${href}">
        <div class="ch-top">
          <span class="ch-label">${kicker}</span>
          <span class="ch-num">${n}</span>
          <div class="ch-art" aria-hidden="true">${chArt(n, st)}</div>
        </div>
        <div class="ch-body">
          <h2>${title}</h2>
          <p>${text}</p>
          <div class="ch-meta">${WB.starRow(stars)}${status(done, startedCh)}${extra || ""}<span class="ch-go">${I("arrow")}</span></div>
        </div>
      </a>`;
    main.innerHTML = `
      <section class="wrap hero">
        <div class="hero-copy">
          <span class="tag">${I("pencil")} Digital workbook · Grades 7–12</span>
          <h1>Play your way through the <span class="hl">AI&nbsp;Framework</span>.</h1>
          <p class="lede">Three chapters, three kinds of game. Learn what AI is, practice the four AI Core Competencies you use every time, then put it all together against the final boss.</p>
          <div class="hero-cta">
            <a class="btn btn-big" href="#/${next}">${started ? "Keep playing" : "Start Chapter 1"} ${I("arrow")}</a>
            <a class="btn btn-ghost btn-big" href="#/workbook">My workbook</a>
          </div>
          <p class="scribble hero-note">${started ? `${WB.totalStars()} of 21 stars earned so far.` : "New here? Start with Chapter 1."}</p>
        </div>
        ${heroArt()}
      </section>

      <section class="wrap quest" aria-labelledby="quest-h">
        <div class="section-head">
          <h2 id="quest-h">Your quest</h2>
          <p class="scribble">Earn up to 3 stars in every game.</p>
        </div>
        <div class="quest-grid">
          <div class="quest-path" aria-hidden="true"></div>
          ${ch(1, "literacy", "#/literacy", "Understand AI", "The Quiz Board",
            "AI Literacy as a game-show board: what AI is, how it works, its history, where it shows up and its limits. Solo or teams.",
            s.literacy.done, s.literacy.best > 0, WB.starsFor("literacy", s.literacy.best),
            s.literacy.best ? `<span class="best">Best ${s.literacy.best.toLocaleString()}</span>` : "")}
          ${ch(2, "stations", "#/stations", "Use judgment", "Station Rotation",
            "Four stations, one per Core Competency, in any order. Then the Crossroads puts all four to work at once.",
            st.crossroads.done, nStations > 0, WB.starsFor("crossroads", st.crossroads.best),
            `<span class="best">${nStations}/4 stamps</span>`)}
          ${ch(3, "boss", "#/boss", "Apply the help", "Final Boss: The Autopilot",
            "Match each need to the right AI Mode, steer the conversation, and finish like a human before the Autopilot takes the wheel.",
            s.boss.done, s.boss.best > 0, WB.starsFor("boss", s.boss.best),
            s.boss.best ? `<span class="best">Best ${s.boss.best.toLocaleString()}</span>` : "")}
        </div>
      </section>

      <section class="wrap how">
        <div>
          <span class="how-i">${I("solo")}</span>
          <h3>For students</h3>
          <p>Go in order if you can. Every game explains its answers, so a wrong answer still teaches you something. Press A to D to answer fast.</p>
        </div>
        <div>
          <span class="how-i">${I("team")}</span>
          <h3>For teachers</h3>
          <p>Project the Quiz Board in team mode as a whole-class opener. Run the four stations as a rotation, one group per station. Save the boss for the last day.</p>
          <a class="how-link" href="../playbook/index.html">Lesson plans in the Teacher Playbook ${I("arrow")}</a>
        </div>
        <div>
          <span class="how-i">${I("shield")}</span>
          <h3>Privacy, practiced</h3>
          <p>No accounts, no names, no tracking. Nothing you do here leaves your browser, and every person and document in the games is made up.</p>
        </div>
      </section>`;
  });

  /* ---------- My Workbook ---------- */
  WB.route("/workbook", function (main) {
    const s = WB.state;
    const st = s.stations;
    const row = (name, best, done, kind) => `<tr><th scope="row">${name}</th><td>${WB.starRow(WB.starsFor(kind, best))}</td><td>${best ? best.toLocaleString() : "—"}</td><td>${done ? `<span class="done-mark">${I("check")} Complete</span>` : `<span class="muted">Not yet</span>`}</td></tr>`;
    const refl = (title, text) => `<div class="refl"><h3>${title}</h3><p>${text ? esc(text).replace(/\n/g, "<br>") : `<span class="muted">Not written yet.</span>`}</p></div>`;
    main.innerHTML = `
      <section class="wrap page">
        <div class="wb-head">
          <div>
            <span class="tag">${I("doc")} Your progress</span>
            <h1 style="margin-top:.8rem">My workbook</h1>
          </div>
          <div class="wb-total">
            <div class="wb-stat"><b>${WB.totalStars()}<span style="font-size:.55em;opacity:.6"> / 21</span></b><small>Stars</small></div>
            <div class="wb-stat"><b>${WB.totalXP().toLocaleString()}</b><small>Points</small></div>
          </div>
        </div>
        <p class="lede">Everything here is saved only in this browser. Print it to hand in, or reset it to start over.</p>
        <div class="wb-actions">
          <button class="btn" type="button" id="print">${I("print")} Print my workbook</button>
          <button class="btn btn-ghost" type="button" id="reset">${I("reset")} Reset progress</button>
        </div>
        <table class="scores">
          <caption class="sr">Best scores</caption>
          <thead><tr><th scope="col">Game</th><th scope="col">Stars</th><th scope="col">Best score</th><th scope="col">Status</th></tr></thead>
          <tbody>
            ${row("Chapter 1 · Quiz Board", s.literacy.best, s.literacy.done, "literacy")}
            ${row("Station P · Prompt Ladder", st.prompting.best, st.prompting.done, "station")}
            ${row("Station D · Keep It Out", st.privacy.best, st.privacy.done, "station")}
            ${row("Station E · Fence Line", st.ethics.best, st.ethics.done, "station")}
            ${row("Station V · Fact Detective", st.verification.best, st.verification.done, "station")}
            ${row("The Crossroads", st.crossroads.best, st.crossroads.done, "crossroads")}
            ${row("Chapter 3 · The Autopilot", s.boss.best, s.boss.done, "boss")}
          </tbody>
          <tfoot><tr><th scope="row">Total</th><td>${WB.totalStars()} / 21</td><td>${WB.totalXP().toLocaleString()}</td><td></td></tr></tfoot>
        </table>
        <h2 class="h2">Exit tickets</h2>
        <div class="refls">
          ${refl("Chapter 1 · Understand AI", s.literacy.reflection)}
          ${refl("Chapter 2 · Use judgment", st.reflection)}
          ${refl("Chapter 3 · Apply the help", s.boss.reflection)}
        </div>
      </section>`;
    WB.$("#print", main).addEventListener("click", () => window.print());
    WB.$("#reset", main).addEventListener("click", () => {
      if (confirm("Reset all points, stamps and exit tickets on this device? This can't be undone.")) { WB.reset(); WB.go("/"); }
    });
  });
})();
