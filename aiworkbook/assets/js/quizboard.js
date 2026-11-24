/* Chapter 1 · AI Literacy · The Quiz Board
   Solo or 2–4 teams. 25 clues, one hidden Wager Tile, then a Final Round. */
(function () {
  const esc = WB.esc;
  const VALUES = [100, 200, 300, 400, 500];
  const CAT_COLORS = ["c-blue", "c-green", "c-violet", "c-orange", "c-red"];
  let G = null; // current game

  WB.route("/literacy", function (main) {
    main.className = "ch1-page";
    if (!G || G.over) setup(main); else board(main);
  });

  /* ---------- setup ---------- */
  function setup(main) {
    main.innerHTML = `
      <section class="wrap page">
        <div class="page-hero">
          <span class="page-badge">${WB.icon("grid")}</span>
          <div><p class="kicker">Chapter 1 · Understand AI</p><h1>The Quiz Board</h1></div>
        </div>
        <p class="lede">Twenty-five clues about what AI is, how it works, where it came from, where it shows up and where it falls short. Pick a tile, read the clue, and answer in the form of a question.</p>
        <div class="setup">
          <fieldset class="players">
            <legend>Who's playing?</legend>
            <label><input type="radio" name="n" value="1" checked> <span>${WB.icon("solo")}<b>Solo</b> Play on your own</span></label>
            <label><input type="radio" name="n" value="2"> <span>${WB.icon("team")}<b>2 teams</b> Take turns</span></label>
            <label><input type="radio" name="n" value="3"> <span>${WB.icon("team")}<b>3 teams</b> Take turns</span></label>
            <label><input type="radio" name="n" value="4"> <span>${WB.icon("team")}<b>4 teams</b> Take turns</span></label>
          </fieldset>
          <ul class="rules">
            <li><b>Right answer:</b> win the tile's points.</li>
            <li><b>Wrong answer:</b> no points lost. Read the explanation, it's the point.</li>
            <li><b>Wager Tile:</b> one tile is hidden. Bet some of your points on it.</li>
            <li><b>Final Round:</b> one last clue. Wager what you like.</li>
          </ul>
          <button class="btn btn-big" id="go" type="button">Open the board ${WB.icon("arrow")}</button>
        </div>
      </section>`;
    WB.$("#go", main).addEventListener("click", () => {
      const n = +WB.$("input[name=n]:checked", main).value;
      const names = n === 1 ? ["You"] : ["Team A", "Team B", "Team C", "Team D"].slice(0, n);
      const cats = WB.literacy.categories;
      const bonusCat = Math.floor(Math.random() * cats.length);
      const bonusRow = 2 + Math.floor(Math.random() * 3);
      G = { teams: names.map(name => ({ name, score: 0 })), turn: 0, used: {}, bonus: bonusCat + "-" + bonusRow, over: false, solo: n === 1 };
      WB.sfx("win");
      board(main);
    });
  }

  /* ---------- board ---------- */
  function scoreStrip(noTurn) {
    return `<div class="scorestrip ${G.solo ? "solo" : ""}">${G.teams.map((t, i) => `
      <div class="team ${!noTurn && !G.solo && i === G.turn ? "turn" : ""}">
        <span class="team-n">${esc(t.name)}${!noTurn && !G.solo && i === G.turn ? ` <em>· your pick</em>` : ""}</span>
        <span class="team-s">${t.score.toLocaleString()}</span>
      </div>`).join("")}</div>`;
  }

  function board(main) {
    const cats = WB.literacy.categories;
    const usedCount = Object.keys(G.used).length;
    let html = `<section class="wrap page board-page">
      <div class="board-head">
        <div class="page-hero"><span class="page-badge">${WB.icon("grid")}</span><div><p class="kicker">Chapter 1 · Understand AI</p><h1>The Quiz Board</h1></div></div>
        ${scoreStrip()}
      </div>
      <div class="board" role="grid" aria-label="Quiz board">
        <div class="board-row" role="row">${cats.map((c, i) => `<div class="cat ${CAT_COLORS[i]}" role="columnheader">${esc(c.name)}</div>`).join("")}</div>`;
    VALUES.forEach((v, r) => {
      html += `<div class="board-row" role="row">`;
      cats.forEach((c, ci) => {
        const key = ci + "-" + r;
        const used = G.used[key];
        html += used
          ? `<div class="tile used ${used === "right" ? "right" : "wrong"}" role="gridcell" aria-label="${esc(c.name)} ${v}, ${used === "right" ? "answered correctly" : "answered"}"><span>${used === "right" ? "✓" : "·"}</span></div>`
          : `<button class="tile ${CAT_COLORS[ci]}" role="gridcell" data-key="${key}" aria-label="${esc(c.name)} for ${v}">${v}</button>`;
      });
      html += `</div>`;
    });
    html += `</div>
      <div class="board-foot">
        <p class="small muted">${usedCount} of 25 clues played${G.solo ? "" : ` · ${esc(G.teams[G.turn].name)} picks next`}</p>
        <div class="row-gap">
          <button class="btn btn-ghost btn-sm" id="final" type="button">${usedCount < 25 ? "Skip to the Final Round" : "Final Round"}</button>
          <button class="btn btn-ghost btn-sm" id="restart" type="button">New game</button>
        </div>
      </div>
    </section>
    <dialog class="clue-dlg" id="dlg" aria-labelledby="dlg-cat"></dialog>`;
    main.innerHTML = html;

    WB.$$(".tile[data-key]", main).forEach(b => b.addEventListener("click", () => openClue(main, b.dataset.key)));
    WB.$("#final", main).addEventListener("click", () => finalRound(main));
    WB.$("#restart", main).addEventListener("click", () => { if (confirm("Start a new game? This board's scores will be cleared.")) { G = null; setup(main); } });
    if (usedCount === 25) setTimeout(() => finalRound(main), 600);
  }

  /* ---------- a clue ---------- */
  function openClue(main, key) {
    const [ci, r] = key.split("-").map(Number);
    const cat = WB.literacy.categories[ci];
    const clue = cat.clues[r];
    const value = VALUES[r];
    const team = G.teams[G.turn];
    const dlg = WB.$("#dlg", main);
    const isBonus = key === G.bonus;
    WB.sfx("flip");
    dlg.addEventListener("cancel", e => e.preventDefault(), { once: false });

    const showClue = wager => {
      const order = WB.shuffle(clue.a.map((t, i) => ({ t, i })));
      dlg.innerHTML = `
        <div class="clue ${CAT_COLORS[ci]}">
          <p class="clue-cat" id="dlg-cat">${esc(cat.name)} · ${isBonus ? `Wager ${wager.toLocaleString()}` : value}${G.solo ? "" : ` · ${esc(team.name)}`}</p>
          <p class="clue-q">${esc(clue.q)}</p>
          <div class="answers">${order.map(o => `<button type="button" class="ans" data-i="${o.i}">${esc(o.t)}</button>`).join("")}</div>
          <div class="clue-why" hidden></div>
        </div>`;
      dlg.open || dlg.showModal();
      WB.$(".ans", dlg).focus();
      WB.$$(".ans", dlg).forEach(btn => btn.addEventListener("click", () => {
        const pick = +btn.dataset.i;
        const right = pick === clue.c;
        WB.$$(".ans", dlg).forEach(b => {
          b.disabled = true;
          if (+b.dataset.i === clue.c) b.classList.add("is-right");
          else if (b === btn) b.classList.add("is-wrong");
        });
        const pts = isBonus ? (right ? wager : -wager) : (right ? value : 0);
        team.score += pts;
        G.used[key] = right ? "right" : "wrong";
        WB.sfx(right ? "good" : "bad");
        WB.say(right ? `Correct. Plus ${pts} points.` : `Not quite. The answer is: ${clue.a[clue.c]}`);
        const why = WB.$(".clue-why", dlg);
        why.hidden = false;
        why.innerHTML = `
          <p class="verdict ${right ? "ok" : "no"}">${right ? `Correct! +${Math.abs(pts).toLocaleString()}` : (isBonus ? `Not quite. −${wager.toLocaleString()}` : "Not quite.")}</p>
          <p>${esc(clue.why)}</p>
          <button type="button" class="btn" id="back">Back to the board</button>`;
        const back = WB.$("#back", dlg);
        back.focus();
        back.addEventListener("click", () => {
          dlg.close();
          if (!G.solo) G.turn = (G.turn + 1) % G.teams.length;
          board(main);
        });
      }));
    };

    if (isBonus) {
      const max = Math.max(team.score, 500);
      dlg.innerHTML = `
        <div class="clue wager">
          <p class="clue-cat" id="dlg-cat">${esc(cat.name)}</p>
          <p class="wager-title"><span>You found the hidden tile</span>Wager Tile</p>
          <p>${G.solo ? "You found" : esc(team.name) + " found"} the hidden tile. Bet up to <b>${max.toLocaleString()}</b> points. Right answer wins the bet; wrong answer loses it.</p>
          <label class="wager-row"><span>Your wager</span>
            <input type="range" min="0" max="${max}" step="100" value="${Math.min(300, max)}" id="wr">
            <output id="wo">${Math.min(300, max)}</output>
          </label>
          <button class="btn" type="button" id="lock">Lock it in</button>
        </div>`;
      dlg.showModal();
      WB.sfx("win");
      const wr = WB.$("#wr", dlg), wo = WB.$("#wo", dlg);
      wr.addEventListener("input", () => { wo.textContent = wr.value; });
      wr.focus();
      WB.$("#lock", dlg).addEventListener("click", () => showClue(+wr.value));
    } else {
      showClue(0);
    }
  }

  /* ---------- final round ---------- */
  function finalRound(main) {
    const F = WB.literacy.final;
    const order = WB.shuffle(F.a.map((t, i) => ({ t, i })));
    main.innerHTML = `
      <section class="wrap page final">
        <p class="kicker">Chapter 1 · Final Round</p>
        <h1>${esc(F.category)}</h1>
        <p class="lede">${G.solo ? "Wager any of your points, then answer the last clue." : "Each team writes its wager on paper (up to its score), then answers the clue. Mark each team below."}</p>
        ${scoreStrip(true)}
        <div class="final-wagers">
          ${G.teams.map((t, i) => `<label class="wager-row"><span>${esc(t.name)} wagers</span>
            <input type="number" min="0" max="${Math.max(t.score, 0)}" step="50" value="0" data-team="${i}" inputmode="numeric"></label>`).join("")}
          <button class="btn" type="button" id="reveal">Show the clue</button>
        </div>
        <div class="clue final-clue" hidden>
          <p class="clue-q">${esc(F.q)}</p>
          <div class="answers">${order.map(o => `<button type="button" class="ans" data-i="${o.i}">${esc(o.t)}</button>`).join("")}</div>
          <div class="clue-why" hidden></div>
        </div>
      </section>`;
    WB.sfx("flip");
    const wagers = () => WB.$$("input[data-team]", main).map(inp => {
      const t = G.teams[+inp.dataset.team];
      return Math.max(0, Math.min(Math.max(t.score, 0), Math.round(+inp.value || 0)));
    });
    WB.$("#reveal", main).addEventListener("click", () => {
      const w = wagers();
      WB.$$("input[data-team]", main).forEach((inp, i) => { inp.value = w[i]; inp.disabled = true; });
      WB.$("#reveal", main).remove();
      const box = WB.$(".final-clue", main);
      box.hidden = false;
      WB.$(".ans", box).focus();
      WB.$$(".ans", box).forEach(btn => btn.addEventListener("click", () => {
        WB.$$(".ans", box).forEach(b => { b.disabled = true; if (+b.dataset.i === F.c) b.classList.add("is-right"); else if (b === btn) b.classList.add("is-wrong"); });
        const why = WB.$(".clue-why", box);
        why.hidden = false;
        if (G.solo) {
          const right = +btn.dataset.i === F.c;
          G.teams[0].score += right ? w[0] : -w[0];
          WB.sfx(right ? "good" : "bad");
          why.innerHTML = `<p class="verdict ${right ? "ok" : "no"}">${right ? "Correct!" : "Not quite."}</p><p>${esc(F.why)}</p><button class="btn" id="end" type="button">See final score</button>`;
          WB.$("#end", main).addEventListener("click", () => finish(main));
        } else {
          WB.sfx("good");
          why.innerHTML = `<p>${esc(F.why)}</p>
            <div class="marks">${G.teams.map((t, i) => `<div class="mark-row"><span>${esc(t.name)} (${w[i]})</span>
              <label><input type="radio" name="m${i}" value="1"> Got it</label>
              <label><input type="radio" name="m${i}" value="0" checked> Missed</label></div>`).join("")}</div>
            <button class="btn" id="end" type="button">Final scores</button>`;
          WB.$("#end", main).addEventListener("click", () => {
            G.teams.forEach((t, i) => { const got = WB.$(`input[name=m${i}]:checked`, main).value === "1"; t.score += got ? w[i] : -w[i]; });
            finish(main);
          });
        }
      }));
    });
  }

  function finish(main) {
    G.over = true;
    const top = Math.max(...G.teams.map(t => t.score));
    const best = Math.max(0, top);
    const s = WB.state.literacy;
    const newBest = best > s.best;
    s.best = Math.max(s.best, best);
    s.done = true;
    WB.save();
    WB.sfx("win");
    WB.confetti();
    const winners = G.teams.filter(t => t.score === top).map(t => t.name);
    main.innerHTML = `
      <section class="wrap page result">
        ${WB.starRow(WB.starsFor("literacy", best), "big")}
        <p class="kicker">Chapter 1 complete</p>
        <h1>${G.solo ? `${G.teams[0].score.toLocaleString()} points` : `${esc(winners.join(" & "))} win${winners.length > 1 ? "" : "s"}!`}</h1>
        <p class="lede">${newBest ? "That's a new best for this device. " : ""}You've covered the foundation: what AI is, how it works, where it came from, where it shows up and what its limits mean.</p>
        ${G.solo ? "" : scoreStrip(true)}
        <div class="takeaways">
          <div><b>AI predicts, classifies, recommends and generates.</b> A chatbot is one kind.</div>
          <div><b>It writes by predicting what comes next,</b> guided by your prompt, sources and the chat so far.</div>
          <div><b>Fluent can still be wrong.</b> Check important claims, and own the thinking.</div>
        </div>
        <div id="ticket"></div>
        <div class="row-gap">
          <button class="btn btn-big" id="again" type="button">Play again</button>
          <a class="btn btn-ghost" href="#/stations">See the next chapter ${WB.icon("arrow")}</a>
        </div>
      </section>`;
    WB.exitTicket(WB.$("#ticket", main), "What's one thing about how AI works that surprised you, or that you'll remember next time you use it?",
      () => WB.state.literacy.reflection, v => { WB.state.literacy.reflection = v; });
    WB.$("#again", main).addEventListener("click", () => { G = null; setup(main); });
  }
})();
