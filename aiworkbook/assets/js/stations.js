/* Chapter 2 · Core Competencies · Station Rotation
   Four stations in any order (P, D, E, V), each scored out of 1000, then the Crossroads,
   where one scenario needs all four judgments at once. */
(function () {
  const esc = WB.esc;
  const ORDER = ["prompting", "privacy", "ethics", "verification"];
  const GAMES = {
    prompting:    { game: "Prompt Ladder",  blurb: "Rank five opening prompts for the same task, from best fit to worst." },
    privacy:      { game: "Keep It Out",    blurb: "Sort data into share or keep out, then black out the private details in three documents." },
    ethics:       { game: "Fence Line",     blurb: "Is it allowed, not allowed, or on the fence? Sort real-life scenarios and ask the right question." },
    verification: { game: "Fact Detective", blurb: "Spot which AI outputs point to a fact you'd need to check, and where you'd check it." }
  };

  /* ---------- hub ---------- */
  WB.route("/stations", function (main) {
    main.className = "ch2-page";
    const st = WB.state.stations;
    const n = WB.stationsDone();
    const card = k => {
      const L = WB.lenses[k], g = GAMES[k], done = st[k].done;
      return `<a class="station lens-${k} ${done ? "done" : ""}" href="#/stations/${k}">
        <span class="station-ico">${WB.icon(WB.lensIcon[k])}</span>
        <span class="station-name">${L.letter} · ${esc(L.name)}</span>
        <span class="station-game">${g.game}</span>
        <span class="station-blurb">${g.blurb}</span>
        <span class="station-stamp">${done ? `${WB.starRow(WB.starsFor("station", st[k].best))} ${st[k].best} pts` : `Visit station ${WB.icon("arrow")}`}</span>
      </a>`;
    };
    main.innerHTML = `
      <section class="wrap page">
        <div class="page-hero">
          <span class="page-badge">${WB.icon("stations")}</span>
          <div><p class="kicker">Chapter 2 · Use judgment</p><h1>Station Rotation</h1></div>
        </div>
        <p class="lede">These four aren't levels, and they don't go in order. Every time you use AI, all four are on at once. Visit the stations in any order and collect a stamp from each. Then meet all four together at the Crossroads.</p>
        <div class="rotation">
          <div class="rot-n">${card("prompting")}</div>
          <div class="rot-w">${card("verification")}</div>
          <a class="hub ${n === 4 ? "open" : ""} ${st.crossroads.done ? "done" : ""}" href="#/stations/crossroads">
            <span class="hub-lenses" aria-hidden="true">${ORDER.map(k => `<i class="lens-${k} ${st[k].done ? "on" : ""}"></i>`).join("")}</span>
            <span class="hub-title">The Crossroads</span>
            <span class="hub-sub">${st.crossroads.done ? `Complete · ${st.crossroads.best}` : n === 4 ? "All four stamps! Go" : `${n} of 4 stamps`}</span>
          </a>
          <div class="rot-e">${card("privacy")}</div>
          <div class="rot-s">${card("ethics")}</div>
        </div>
        <p class="rotation-note"><span class="small muted"><b>Teachers:</b> put one group at each station and rotate every 8 to 10 minutes.</span></p>
      </section>`;
  });

  /* ---------- shared station frame ----------
     A slim header (back link, station name, counter). The question on each screen is the h1. */
  function frame(main, key) {
    const L = WB.lenses[key];
    main.className = "ch2-page station-page lens-" + key;
    main.innerHTML = `
      <section class="wrap page">
        <div class="st-bar">
          <a class="back" href="#/stations">Stations</a>
          <span class="st-id"><span class="lens-chip">${WB.icon(WB.lensIcon[key])}</span><span><b>${GAMES[key].game}</b><small>${esc(L.name)}</small></span></span>
          <span class="st-count" aria-live="polite"></span>
        </div>
        <div id="stage"></div>
      </section>`;
    return WB.$("#stage", main);
  }
  function progress() { /* the counter in the header shows progress */ }
  function setSub(main, t) { const p = WB.$(".st-count", main); if (p) p.textContent = t; }

  function stamp(main, key, points, lines) {
    const st = WB.state.stations[key];
    const newBest = points > st.best;
    st.best = Math.max(st.best, points);
    st.done = true;
    WB.save();
    WB.sfx("stamp");
    setTimeout(() => WB.sfx("win"), 300);
    WB.confetti();
    progress(main, 1);
    setSub(main, "");
    const next = ORDER.find(k => !WB.state.stations[k].done);
    const L = WB.lenses[key];
    WB.$("#stage", main).innerHTML = `
      <div class="stamp-wrap">
        <div class="stamp lens-${key}" aria-hidden="true">${WB.icon(WB.lensIcon[key])}<span>${L.letter}</span><small>${esc(L.name)}</small></div>
        <div>
          ${WB.starRow(WB.starsFor("station", points), "big")}
          <p class="kicker">Station stamped</p>
          <p class="score-big">${points}<small> / 1000</small></p>
          <p class="lede">${newBest ? "New best! " : ""}${lines}</p>
          <div class="row-gap">
            ${next ? `<a class="btn" href="#/stations/${next}">Next station: ${esc(WB.lenses[next].name)} ${WB.icon("arrow")}</a>` : `<a class="btn" href="#/stations/crossroads">All four stamps! The Crossroads ${WB.icon("arrow")}</a>`}
            <a class="btn btn-ghost" href="#/stations">Back to the rotation</a>
          </div>
        </div>
      </div>`;
    WB.say(`Station stamped. ${points} out of 1000.`);
  }

  /* ================= Station P · Prompt Ladder =================
     Each prompt card gets a rank from 1 (best fit) to 5 (worst fit), right where it sits. */
  WB.route("/stations/prompting", function (main) {
    const data = WB.prompting;
    const stage = frame(main, "prompting");
    let round = 0, raw = 0;
    const maxRaw = data.rounds.length * 10;

    function play() {
      const R = data.rounds[round];
      const order = WB.shuffle(R.prompts.map((p, i) => i));
      const rank = {};            // prompt index -> 1..5
      setSub(main, `Task ${round + 1} of ${data.rounds.length}`);

      function taskStrip() {
        return `<div class="task-strip"><span class="kicker">The task</span><b>${esc(R.task)}</b><span>${esc(R.detail)}</span></div>`;
      }

      function draw() {
        const all = order.every(i => rank[i]);
        stage.innerHTML = `
          ${taskStrip()}
          <h1 class="st-q">Rank these opening prompts from best fit to worst fit.</h1>
          <p class="st-help rank-key">1 is the best fit, 5 is the worst.</p>
          <div class="rank-head" aria-hidden="true"><span></span><span class="rank-scale"><i>Best</i><i>Worst</i></span></div>
          <ol class="rank-list">
            ${order.map(i => `
              <li class="rank-row ${rank[i] ? "is-ranked" : ""}">
                <span class="rank-badge">${rank[i] || ""}</span>
                <span class="rank-t">“${esc(R.prompts[i].t)}”</span>
                <span class="rank-btns" role="group" aria-label="Rank this prompt">
                  ${[1, 2, 3, 4, 5].map(n => `<button type="button" data-i="${i}" data-n="${n}" aria-pressed="${rank[i] === n}" aria-label="Rank ${n}${n === 1 ? ", best fit" : n === 5 ? ", worst fit" : ""}">${n}</button>`).join("")}
                </span>
              </li>`).join("")}
          </ol>
          <button type="button" class="btn" id="check" ${all ? "" : "disabled"}>${all ? "Check my ranking" : `Rank all five to check (${Object.keys(rank).length}/5)`}</button>`;
        WB.$$(".rank-btns button", stage).forEach(b => b.addEventListener("click", () => {
          const i = +b.dataset.i, n = +b.dataset.n;
          const holder = Object.keys(rank).find(k => rank[k] === n && +k !== i);
          if (holder !== undefined) { if (rank[i]) rank[holder] = rank[i]; else delete rank[holder]; }   // swap
          if (rank[i] === n) delete rank[i]; else rank[i] = n;
          WB.sfx("tap");
          draw();
          const again = WB.$(`.rank-btns button[data-i="${i}"][data-n="${n}"]`, stage);
          again && again.focus();
        }));
        const chk = WB.$("#check", stage);
        if (all) chk.addEventListener("click", check);
      }

      function check() {
        const slots = [1, 2, 3, 4, 5].map(n => +Object.keys(rank).find(k => rank[k] === n));
        let pts = 0;
        slots.forEach((i, p) => { const d = Math.abs(p - i); pts += d === 0 ? 2 : d === 1 ? 1 : 0; });
        raw += pts;
        WB.sfx(pts >= 8 ? "good" : "bad");
        const best = R.prompts[0];
        stage.innerHTML = `
          ${taskStrip()}
          <h1 class="st-q">${pts === 10 ? "Perfect ranking." : pts >= 8 ? "So close." : "Here's how your ranking compares."}</h1>
          <ol class="ladder">
            ${slots.map((i, p) => {
              const P = R.prompts[i], diff = Math.abs(p - i);
              return `<li class="rung filled checked"><span class="rank">${p + 1}</span>
                <span class="rung-t">“${esc(P.t)}”</span>
                <span class="rung-res ${diff === 0 ? "ok" : diff === 1 ? "near" : "no"}">${diff === 0 ? "Right spot" : `Belongs at #${i + 1}`}</span>
                <span class="rung-why">${esc(P.why)}${P.tags.length ? `<span class="tags">${P.tags.map(t => `<i>${data.ingredients[t]}</i>`).join("")}</span>` : ""}</span></li>`;
            }).join("")}
          </ol>
          <div class="after">
            <p class="verdict ${pts >= 8 ? "ok" : pts >= 5 ? "mid" : "no"}">${pts} / 10 points</p>
            <p><b>What made #1 the best:</b> it uses ${best.tags.map(t => data.ingredients[t].toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. The worst prompts hand the thinking to the AI.</p>
            <button type="button" class="btn" id="next">${round + 1 < data.rounds.length ? "Next task" : "Finish station"} ${WB.icon("arrow")}</button>
          </div>`;
        WB.say(`${pts} out of 10.`);
        const nx = WB.$("#next", stage);
        nx.focus();
        nx.addEventListener("click", () => {
          round++;
          if (round < data.rounds.length) { play(); window.scrollTo({ top: 0 }); }
          else stamp(main, "prompting", Math.round(1000 * raw / maxRaw), "The best prompts name the goal, give useful context, set a boundary for the AI, and say what response you need.");
        });
      }
      draw();
    }
    play();
  });

  /* ================= Station D · Keep It Out ================= */
  WB.route("/stations/privacy", function (main) {
    const data = WB.privacy;
    const stage = frame(main, "privacy");
    const cards = WB.shuffle(data.sort);
    let i = 0, right = 0, streak = 0, bestStreak = 0, docPoints = 0;

    function sortCard(fb) {
      progress(main, (i / cards.length) * 0.5);
      setSub(main, `Card ${Math.min(i + 1, cards.length)} of ${cards.length}`);
      const C = cards[i];
      stage.innerHTML = `
        <h1 class="st-q center">Can you put this into an AI chat?</h1>
        <div class="sorter">
          <button type="button" class="bin bin-out" data-ok="0" aria-keyshortcuts="ArrowLeft"><span class="bin-i">${WB.icon("lock")}</span><b>Keep it out</b></button>
          <div class="sort-card-wrap">
            <div class="sort-card" tabindex="-1">${esc(C.t)}</div>
            <div class="streak ${streak >= 3 ? "hot" : ""}" aria-live="off">${streak >= 2 ? `${WB.icon("flame")} ${streak} in a row` : "&nbsp;"}</div>
          </div>
          <button type="button" class="bin bin-ok" data-ok="1" aria-keyshortcuts="ArrowRight"><span class="bin-i">${WB.icon("share")}</span><b>OK to share</b></button>
        </div>
        <div class="sort-fb" aria-live="polite">${fb || ""}</div>`;
      WB.$$(".bin", stage).forEach(b => b.addEventListener("click", () => answer(b.dataset.ok === "1")));
    }
    function answer(saysOk) {
      if (i >= cards.length) return;
      const C = cards[i];
      const ok = saysOk === C.ok;
      if (ok) { right++; streak++; bestStreak = Math.max(bestStreak, streak); } else streak = 0;
      WB.sfx(ok ? "good" : "bad");
      const fb = `<p class="verdict ${ok ? "ok" : "no"}">“${esc(C.t)}” · ${C.ok ? "OK to share" : "Keep it out"}</p><p>${esc(C.why)}</p>`;
      i++;
      if (i < cards.length) sortCard(fb);
      else { document.removeEventListener("keydown", keys); sortDone(fb); }
    }
    function keys(e) {
      if (!location.hash.startsWith("#/stations/privacy") || i >= cards.length) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); answer(false); }
      if (e.key === "ArrowRight") { e.preventDefault(); answer(true); }
    }
    document.addEventListener("keydown", keys);
    window.addEventListener("hashchange", () => document.removeEventListener("keydown", keys), { once: true });

    function sortDone(fb) {
      setSub(main, "Part 1 done");
      stage.innerHTML = `
        <h1 class="st-q">${right} of ${cards.length} sorted right.</h1>
        <div class="sort-fb">${fb}</div>
        <div class="after">
          <p class="verdict ${right >= 13 ? "ok" : "mid"}">Best streak: ${bestStreak} in a row</p>
          <p>Rule of thumb: share the <b>task</b>, keep out the <b>person</b>. If something could identify you or someone else, leave it out or swap in a placeholder.</p>
          <button class="btn" id="p2" type="button">${WB.icon("marker")} Part 2: The Black Marker</button>
        </div>`;
      const b = WB.$("#p2", stage); b.focus();
      b.addEventListener("click", () => redact(0));
    }

    function redact(d) {
      const D = data.docs[d];
      progress(main, 0.5 + (d / data.docs.length) * 0.5);
      setSub(main, `Document ${d + 1} of ${data.docs.length}`);
      const parts = D.text.split(/(\{\{[^}]+\}\})/);
      let n = 0;
      const html = parts.map(part => {
        const m = part.match(/^\{\{([^|]+)\|([^}]+)\}\}$/);
        if (m) { n++; return `<button type="button" class="w s" data-n="${n}" data-why="${esc(m[2])}">${esc(m[1])}</button>`; }
        return part.split(/(\s+)/).map(tok => {
          if (/^\s+$/.test(tok)) return tok.replace(/\n/g, "<br>");
          if (!/[A-Za-z0-9]/.test(tok)) return esc(tok);
          return `<button type="button" class="w">${esc(tok)}</button>`;
        }).join("");
      }).join("");
      stage.innerHTML = `
        <h1 class="st-q">Black out anything you shouldn't paste into AI.</h1>
        <p class="st-help">${esc(D.title)}. Tap a word to black it out; tap again to undo.</p>
        <div class="paper" id="paper">${html}</div>
        <div class="row-gap"><button class="btn" id="done" type="button">${WB.icon("marker")} I'm done with the marker</button><span class="marker-count" id="count">0 blacked out</span></div>
        <div id="after"></div>`;
      const paper = WB.$("#paper", stage);
      const count = WB.$("#count", stage);
      WB.$$(".w", paper).forEach(w => w.addEventListener("click", () => {
        if (paper.classList.contains("revealed")) return;
        w.classList.toggle("x");
        w.setAttribute("aria-pressed", w.classList.contains("x"));
        WB.sfx("tap");
        count.textContent = WB.$$(".w.x", paper).length + " blacked out";
      }));
      WB.$("#done", stage).addEventListener("click", function () {
        this.remove();
        paper.classList.add("revealed");
        const sens = WB.$$(".w.s", paper);
        const caught = sens.filter(w => w.classList.contains("x")).length;
        const over = WB.$$(".w.x:not(.s)", paper).length;
        sens.forEach(w => w.classList.add(w.classList.contains("x") ? "caught" : "missed"));
        WB.$$(".w.x:not(.s)", paper).forEach(w => w.classList.add("over"));
        const score = Math.max(0, caught - over * 0.5) / sens.length;
        docPoints += score;
        WB.sfx(score >= 0.8 ? "good" : "bad");
        count.remove();
        WB.$("#after", stage).innerHTML = `
          <div class="after">
            <p class="verdict ${score >= 0.8 ? "ok" : score >= 0.5 ? "mid" : "no"}">Caught ${caught} of ${sens.length}${over ? ` · ${over} word${over > 1 ? "s" : ""} blacked out that could stay` : ""}</p>
            <ol class="redact-key">${sens.map(w => `<li class="${w.classList.contains("caught") ? "ok" : "no"}"><b>${esc(w.textContent)}</b> ${esc(w.dataset.why)}</li>`).join("")}</ol>
            ${over ? `<p class="small muted">Blacking out too much isn't dangerous, but the AI can't help with text it can't see. Keep the task, cut the person.</p>` : ""}
            <button class="btn" id="next" type="button">${d + 1 < data.docs.length ? "Next document" : "Finish station"} ${WB.icon("arrow")}</button>
          </div>`;
        const nx = WB.$("#next", stage); nx.focus();
        nx.addEventListener("click", () => {
          if (d + 1 < data.docs.length) { redact(d + 1); window.scrollTo({ top: 0 }); }
          else stamp(main, "privacy", Math.round(500 * right / cards.length + 500 * docPoints / data.docs.length),
            "Choose minimal input. Removing a name alone doesn't make something safe; look at the whole document before you share it.");
        });
      });
    }
    sortCard("");
  });

  /* ================= Station E · Fence Line =================
     Two sides (Allowed, Not allowed) with the fence in between for "it depends".
     Drag the scenario card onto a side or the fence, or tap one. */
  WB.route("/stations/ethics", function (main) {
    const data = WB.ethics;
    const stage = frame(main, "ethics");
    const cards = WB.shuffle(data.cards);
    const fenceCount = cards.filter(c => c.zone === "fence").length;
    const maxRaw = cards.length + fenceCount;
    let i = 0, raw = 0, locked = false;
    const placed = { go: [], fence: [], stop: [] };
    const ZONES = [["go", "Allowed", "go"], ["fence", "On the fence", "fence"], ["stop", "Not allowed", "stop"]];

    function field() {
      return `<div class="fl-field">${ZONES.map(([z, label, ic]) => `
        <div class="fl-drop fl-${z}" data-z="${z}" role="button" tabindex="0" aria-label="Put it in: ${label}">
          <p class="fl-h">${WB.icon(ic)}<span>${label}</span></p>
          ${z === "fence" ? `<p class="fl-sub">It depends. Needs more context.</p>` : ""}
          <div class="fl-pile">${placed[z].map(p => `<p class="fl-mini ${p.ok ? "ok" : "no"}" title="${esc(p.t)}">${esc(p.t.length > 70 ? p.t.slice(0, 68) + "…" : p.t)}</p>`).join("")}</div>
        </div>`).join("")}</div>`;
    }

    function show() {
      locked = false;
      setSub(main, `Scenario ${i + 1} of ${cards.length}`);
      const C = cards[i];
      stage.innerHTML = `
        <h1 class="st-q">Allowed, not allowed, or on the fence?</h1>
        <p class="st-help">Drag the card to a side, or tap where it belongs.</p>
        <div class="fl-top"><div class="fl-card" id="flcard" tabindex="0">${esc(C.t)}</div></div>
        ${field()}`;
      wireDrops(C);
      wireDrag(C);
    }

    function wireDrops(C) {
      WB.$$(".fl-drop", stage).forEach(d => {
        d.addEventListener("click", () => place(C, d.dataset.z));
        d.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); place(C, d.dataset.z); } });
      });
    }

    function wireDrag(C) {
      const card = WB.$("#flcard", stage);
      let sx = 0, sy = 0, on = false, moved = false;
      const dropAt = (x, y) => document.elementsFromPoint(x, y).map(el => el.closest && el.closest(".fl-drop")).find(Boolean);
      card.addEventListener("pointerdown", e => { if (locked) return; on = true; moved = false; sx = e.clientX; sy = e.clientY; card.setPointerCapture(e.pointerId); card.classList.add("dragging"); });
      card.addEventListener("pointermove", e => {
        if (!on) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        card.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-6, Math.min(6, dx / 25))}deg)`;
        const d = dropAt(e.clientX, e.clientY);
        WB.$$(".fl-drop", stage).forEach(x => x.classList.toggle("over", x === d));
      });
      const end = e => {
        if (!on) return;
        on = false;
        card.classList.remove("dragging");
        const d = moved ? dropAt(e.clientX, e.clientY) : null;
        WB.$$(".fl-drop", stage).forEach(x => x.classList.remove("over"));
        card.style.transform = "";
        if (d) place(C, d.dataset.z);
      };
      card.addEventListener("pointerup", end);
      card.addEventListener("pointercancel", end);
    }

    function place(C, z) {
      if (locked) return;
      locked = true;
      const ok = z === C.zone;
      if (ok) raw++;
      placed[C.zone].push({ t: C.t, ok });
      WB.sfx(ok ? "good" : "bad");
      const label = ZONES.find(x => x[0] === C.zone)[1];
      WB.$(".fl-field", stage).outerHTML = field();
      WB.$$(".fl-drop", stage).forEach(d => d.classList.add("locked"));
      WB.$(`.fl-drop[data-z="${C.zone}"]`, stage).classList.add("is-right");
      if (!ok) WB.$(`.fl-drop[data-z="${z}"]`, stage).classList.add("is-wrong");
      WB.$(".st-help", stage).remove();
      WB.$(".fl-top", stage).innerHTML = `<div class="after fl-after">
          <p class="verdict ${ok ? "ok" : "no"}">${ok ? "Yes." : "Not quite."} ${ok ? label : `This one is ${label.toLowerCase()}`}.</p>
          <p class="fl-quote">“${esc(C.t)}”</p>
          <p>${esc(C.why)}</p>
          ${C.zone === "fence" ? `<p class="fence-ask"><b>On the fence, the question matters.</b> What should you ask yourself?</p>
            <div class="answers fq">${WB.shuffle(C.fenceQ.map((t, k) => ({ t, k }))).map(o => `<button type="button" class="ans" data-k="${o.k}">${esc(o.t)}</button>`).join("")}</div>
            <div class="fq-why"></div>` : ""}
          <button type="button" class="btn" id="next" ${C.zone === "fence" ? "hidden" : ""}>${i + 1 < cards.length ? "Next scenario" : "Finish station"} ${WB.icon("arrow")}</button>
        </div>`;
      const nx = WB.$("#next", stage);
      nx.addEventListener("click", () => { i++; if (i < cards.length) show(); else finish(); });
      if (C.zone === "fence") {
        WB.$$(".fq .ans", stage).forEach(a => a.addEventListener("click", () => {
          const good = a.dataset.k === "0";
          if (good) raw++;
          WB.sfx(good ? "good" : "bad");
          WB.$$(".fq .ans", stage).forEach(x => { x.disabled = true; if (x.dataset.k === "0") x.classList.add("is-right"); else if (x === a) x.classList.add("is-wrong"); });
          WB.$(".fq-why", stage).innerHTML = `<p class="small">${good ? "That's the one. " : ""}Fence questions are about permission, ownership, honesty and the people affected, never “Will I get caught?”</p>`;
          nx.hidden = false; nx.focus();
        }));
        WB.$(".fq .ans", stage).focus();
      } else nx.focus();
    }

    function finish() {
      stamp(main, "ethics", Math.round(1000 * raw / maxRaw), "Keep the assessed thinking yours, follow the task's limits, disclose help truthfully and think about the people affected. A teacher's No-AI direction always wins.");
      WB.$("#stage", main).insertAdjacentHTML("beforeend", field());
      WB.$$(".fl-drop", main).forEach(d => { d.classList.add("locked"); d.removeAttribute("role"); d.removeAttribute("tabindex"); });
    }
    show();
  });

  /* ================= Station V · Fact Detective ================= */
  WB.route("/stations/verification", function (main) {
    const data = WB.verification;
    const stage = frame(main, "verification");
    const cases = WB.shuffle(data.cases);
    const maxRaw = cases.length + cases.filter(c => c.check).length;
    let i = 0, raw = 0;

    function show() {
      progress(main, i / cases.length);
      setSub(main, `Case ${i + 1} of ${cases.length}`);
      const C = cases[i];
      stage.innerHTML = `
        <h1 class="st-q">Does this need a fact check?</h1>
        <div class="case">
          <span class="case-no">Case file ${String(i + 1).padStart(2, "0")}</span>
          <p class="case-ctx">${esc(C.ctx)}</p>
          <div class="bubble"><span class="bubble-who">AI</span>${esc(C.out)}</div>
        </div>
        <div class="answers two">
          <button type="button" class="ans" data-v="1"><b>${WB.icon("search")} Fact check needed</b><small>It points to a fact, number, quote or source</small></button>
          <button type="button" class="ans" data-v="0"><b>${WB.icon("bubble")} No fact check needed</b><small>It's an idea, opinion or suggestion</small></button>
        </div>
        <div id="after" aria-live="polite"></div>`;
      WB.$$(".ans", stage).forEach(b => b.addEventListener("click", () => {
        const says = b.dataset.v === "1";
        const ok = says === C.check;
        if (ok) raw++;
        WB.sfx(ok ? "good" : "bad");
        WB.$$(".answers.two .ans", stage).forEach(x => { x.disabled = true; if ((x.dataset.v === "1") === C.check) x.classList.add("is-right"); else if (x === b) x.classList.add("is-wrong"); });
        const after = WB.$("#after", stage);
        if (!C.check) {
          after.innerHTML = `<div class="after"><p class="verdict ${ok ? "ok" : "no"}">${ok ? "Right." : "Not this time."} No fact check needed</p><p>${esc(C.why)}</p>${nextBtn()}</div>`;
          wireNext();
        } else {
          after.innerHTML = `<div class="after">
            <p class="verdict ${ok ? "ok" : "no"}">${ok ? "Right. Fact check needed." : "Not quite. This one needs a fact check."}</p>
            <p class="q">Where would you check it?</p>
            <div class="answers places">${Object.keys(data.places).map(p => `<button type="button" class="ans" data-p="${p}"><b>${data.places[p].label}</b><small>${data.places[p].sub}</small></button>`).join("")}</div>
            <div class="place-why"></div>
          </div>`;
          WB.$(".places .ans", stage).focus();
          WB.$$(".places .ans", stage).forEach(pb => pb.addEventListener("click", () => {
            const p = pb.dataset.p;
            const good = p === C.best || C.also.includes(p);
            if (good) raw++;
            WB.sfx(good ? "good" : "bad");
            WB.$$(".places .ans", stage).forEach(x => {
              x.disabled = true;
              if (x.dataset.p === C.best) x.classList.add("is-right");
              else if (C.also.includes(x.dataset.p)) x.classList.add("is-ok");
              else if (x === pb) x.classList.add("is-wrong");
            });
            WB.$(".place-why", stage).innerHTML = `<p class="verdict ${good ? "ok" : "no"}">${p === C.best ? "Best place to check!" : (good ? "That works too." : "Not the strongest check.") + ` · Best: ${data.places[C.best].label}`}</p><p>${esc(C.why)}</p>${nextBtn()}`;
            wireNext();
          }));
        }
      }));
    }
    const nextBtn = () => `<button type="button" class="btn" id="next">${i + 1 < cases.length ? "Next case" : "Close the case file"} ${WB.icon("arrow")}</button>`;
    function wireNext() {
      const nx = WB.$("#next", stage); nx.focus();
      nx.addEventListener("click", () => {
        i++;
        if (i < cases.length) show();
        else stamp(main, "verification", Math.round(1000 * raw / maxRaw), "If it points to a fact, a number, a quote or a source, check it somewhere other than the AI. Asking the AI “are you sure?” isn't verification.");
      });
    }
    show();
  });

  /* ================= The Crossroads ================= */
  WB.route("/stations/crossroads", function (main) {
    main.className = "ch2-page crossroads-page";
    const data = WB.crossroads;
    const st = WB.state.stations;
    const n = WB.stationsDone();
    let step = 0, points = 0;
    const lit = {};

    function lensRow() {
      return `<div class="lens-row">${ORDER.map(k => `<span class="lens-pill lens-${k} ${lit[k] ? "on" : ""}"><b>${WB.lenses[k].letter}</b> ${esc(WB.lenses[k].name)}</span>`).join("")}</div>`;
    }

    /* the shared situation, pinned beside every decision */
    function caseCard() {
      return `<aside class="xr-case" aria-label="The situation">
        <p class="xr-tag">${WB.icon("doc")} The situation</p>
        <h2>${esc(data.title)}</h2>
        <p>${esc(data.setup)}</p>
        <blockquote class="xr-rule"><span>The rules say</span>“${esc(data.rule)}”</blockquote>
      </aside>`;
    }
    /* one stop per decision: done, now, or still to come */
    function tracker() {
      return `<ol class="xr-track" aria-label="Decisions">${data.steps.map((S, k) => {
        const L = WB.lenses[S.lens];
        const state = lit[S.lens] ? "done" : k === step ? "now" : "next";
        return `<li class="lens-${S.lens} ${state}" ${state === "now" ? 'aria-current="step"' : ""}><b>${state === "done" ? WB.icon("check") : L.letter}</b>${esc(L.name)}</li>`;
      }).join("")}</ol>`;
    }

    function intro() {
      main.innerHTML = `
        <section class="wrap page">
          <a class="back" href="#/stations">Station Rotation</a>
          <div class="page-hero"><span class="page-badge">${WB.icon("stations")}</span><div><p class="kicker">Chapter 2 · Finale</p><h1>The Crossroads</h1></div></div>
          <p class="lede">One real situation. Four decisions. Each one leans on a different competency, but you need all four to get it right.</p>
          ${n < 4 ? `<div class="note">You have ${n} of 4 station stamps. The Crossroads works best after all four, but you can try it now.</div>` : ""}
          <div class="xr-grid">
            ${caseCard()}
            <div class="xr-main">
              <p class="q" style="margin-top:0">Your four decisions</p>
              ${tracker()}
              <p class="muted">Read the situation, then make one decision for each competency. Get it right first try for 250 points.</p>
              <button type="button" class="btn btn-big" id="go">Start ${WB.icon("arrow")}</button>
            </div>
          </div>
        </section>`;
      WB.$("#go", main).addEventListener("click", () => { WB.sfx("flip"); play(); });
    }

    function play() {
      const S = data.steps[step];
      const opts = WB.shuffle(S.options.map((o, k) => ({ ...o, k })));
      let tries = 0;
      main.innerHTML = `
        <section class="wrap page">
          <div class="xr-head">
            <p class="kicker">The Crossroads</p>
            ${tracker()}
          </div>
          <div class="xr-grid">
            ${caseCard()}
            <div class="xr-main lens-${S.lens}">
          <p class="xr-step"><span class="lens-chip">${WB.lenses[S.lens].letter}</span>Decision ${step + 1} of ${data.steps.length} · ${esc(WB.lenses[S.lens].name)}</p>
          <h1 class="h1-sm">${esc(S.q)}</h1>
          <div class="answers ${S.multi ? "multi" : ""}" role="${S.multi ? "group" : ""}">
            ${opts.map(o => S.multi
              ? `<label class="ans check"><input type="checkbox" value="${o.k}"> <span>${esc(o.t)}</span></label>`
              : `<button type="button" class="ans" data-k="${o.k}">${esc(o.t)}</button>`).join("")}
          </div>
          ${S.multi ? `<button type="button" class="btn" id="sub">Check</button>` : ""}
          <div id="after" aria-live="polite"></div>
            </div>
          </div>
        </section>`;

      const done = firstTry => {
        lit[S.lens] = true;
        if (firstTry) points += 250;
        WB.sfx("good");
        const L = WB.lenses[S.lens];
        WB.$(".xr-track", main).outerHTML = tracker();
        WB.$("#after", main).innerHTML = `<div class="after">
          <p class="verdict ok">${esc(L.name)} lit up${firstTry ? " · +250" : ""}</p><p>${esc(S.why)}</p>
          <button type="button" class="btn" id="next">${step + 1 < data.steps.length ? "Next decision" : "See how you did"} ${WB.icon("arrow")}</button></div>`;
        const nx = WB.$("#next", main); nx.focus();
        nx.addEventListener("click", () => { step++; if (step < data.steps.length) play(); else end(); });
      };

      if (S.multi) {
        WB.$("#sub", main).addEventListener("click", function () {
          tries++;
          const picked = WB.$$("input:checked", main).map(x => +x.value);
          const want = S.options.map((o, k) => o.ok ? k : -1).filter(k => k >= 0);
          const exact = picked.length === want.length && want.every(k => picked.includes(k));
          if (exact) {
            this.remove();
            WB.$$(".ans.check", main).forEach(l => { const k = +WB.$("input", l).value; l.classList.add(S.options[k].ok ? "is-right" : "is-dim"); WB.$("input", l).disabled = true; });
            done(tries === 1);
          } else {
            WB.sfx("bad");
            const wrongKeep = picked.filter(k => !S.options[k].ok).map(k => S.options[k].why).filter(Boolean);
            WB.$("#after", main).innerHTML = `<div class="after"><p class="verdict no">Not quite.</p><p>${wrongKeep.length ? esc(wrongKeep[0]) : "Something identifying is still in there. Look again."} Try again.</p></div>`;
          }
        });
      } else {
        WB.$$(".ans", main).forEach(b => b.addEventListener("click", () => {
          tries++;
          const O = S.options[+b.dataset.k];
          if (O.ok) {
            WB.$$(".ans", main).forEach(x => { x.disabled = true; });
            b.classList.add("is-right");
            done(tries === 1);
          } else {
            WB.sfx("bad");
            b.classList.add("is-wrong"); b.disabled = true;
            WB.$("#after", main).innerHTML = `<div class="after"><p class="verdict no">Not quite.</p><p>${esc(O.why)} Try again.</p></div>`;
          }
        }));
      }
    }

    function end() {
      const newBest = points > st.crossroads.best;
      st.crossroads.best = Math.max(st.crossroads.best, points);
      st.crossroads.done = true;
      WB.save();
      WB.sfx("win"); WB.confetti();
      main.innerHTML = `
        <section class="wrap page result">
          ${WB.starRow(WB.starsFor("crossroads", points), "big")}
          <p class="kicker">Chapter 2 complete</p>
          <h1>All four lenses, lit.</h1>
          ${lensRow()}
          <p class="lede">${points} / 1000${newBest ? " · new best" : ""}. One essay needed all four: Ethics to know what help fits the rules, Data & Privacy to know what to paste, Prompting to ask for the right help, and Verification to check what the AI claimed. That's why they're not levels. They're always on.</p>
          <div id="ticket"></div>
          <div class="row-gap">
            <a class="btn btn-big" href="#/boss">Next: the Final Boss ${WB.icon("arrow")}</a>
            <a class="btn btn-ghost" href="#/stations">Back to the rotation</a>
          </div>
        </section>`;
      WB.exitTicket(WB.$("#ticket", main), "Pick one station. What's a question you'll ask yourself the next time you use AI?",
        () => WB.state.stations.reflection, v => { WB.state.stations.reflection = v; });
    }
    intro();
  });
})();
