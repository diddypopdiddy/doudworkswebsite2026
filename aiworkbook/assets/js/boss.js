/* Chapter 3 · AI Modes · Final Boss: The Autopilot
   Each round: pick the AI Mode for the need, choose the opening prompt, choose the next move,
   then choose what you do yourself. Good choices damage the Autopilot; Autopilot choices cost a heart. */
(function () {
  const esc = WB.esc;
  const M = () => WB.modes;
  const MAX_HEARTS = 5;
  let B = null;

  const totalHits = () => M().rounds.reduce((n, r) => n + 1 + (r.open ? 1 : 0) + (r.next ? 1 : 0) + 1, 0);

  WB.route("/boss", function (main) {
    main.className = "ch3-page";
    intro(main);
  });

  const botSVG = mood => WB.botArt(mood);

  function intro(main) {
    const list = M().list;
    main.innerHTML = `
      <section class="wrap page boss-intro">
        <div class="boss-hero">
          <div class="boss-portrait">${botSVG()}</div>
          <div>
            <p class="kicker">Chapter 3 · Apply the help</p>
            <h1>Final Boss: The Autopilot</h1>
            <p class="taunt">“${esc(M().taunts.start)}”</p>
            <p class="lede">The Autopilot wants AI to do your thinking for you. Beat it in six rounds. Each round is a real need. Choose the AI Mode that fits, ask for the help you need, and finish the work yourself.</p>
          </div>
        </div>
        <ol class="boss-steps">
          <li><b>Pick the AI Mode</b> that fits the need.</li>
          <li><b>Open the conversation</b> with the best prompt.</li>
          <li><b>Make your next move</b> after the AI replies.</li>
          <li><b>Do the last step yourself.</b> Make the choice, check, or change that the work needs.</li>
        </ol>
        <div class="mode-cards static">${["idea", "learning", "feedback", "practice", "tool"].map(k => `
          <div class="mode-card m-${k}"><span class="mode-head">${WB.icon(k)}</span><b>${list[k].name} Mode</b><small>AI's job: ${list[k].job}</small></div>`).join("")}
        </div>
        <p class="small muted">You have ${MAX_HEARTS} hearts. A flawless round wins one back. ${WB.state.boss.done ? `Your best: ${WB.state.boss.best.toLocaleString()}.` : ""}</p>
        <button type="button" class="btn btn-big btn-boss" id="fight">${WB.icon("bolt")} Grab the wheel</button>
      </section>`;
    WB.$("#fight", main).addEventListener("click", () => {
      B = { round: 0, hearts: MAX_HEARTS, hits: 0, score: 0 };
      WB.sfx("win");
      round(main);
    });
  }

  function hud() {
    const hp = Math.max(0, 1 - B.hits / totalHits());
    return `<div class="arena">
      <div class="boss-side">
        <div class="boss-mini" id="bot">${botSVG(hp < 0.35 ? "hurt" : "")}</div>
        <div class="boss-info">
          <p class="boss-name">The Autopilot <small>BOSS</small></p>
          <div class="hpbar" role="meter" aria-label="Autopilot health" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(hp * 100)}"><i style="width:${hp * 100}%"></i></div>
          <p class="speech" id="speech" aria-live="polite">${B.say ? "“" + esc(B.say) + "”" : "&nbsp;"}</p>
        </div>
      </div>
      <div class="player-side">
        <p class="hearts" aria-label="${B.hearts} of ${MAX_HEARTS} hearts">${Array.from({ length: MAX_HEARTS }, (_, k) => `<span class="${k < B.hearts ? "on" : ""}">${WB.icon("heart")}</span>`).join("")}</p>
        <p class="pscore">${WB.icon("star")}<b>${B.score.toLocaleString()}</b> pts</p>
      </div>
    </div>`;
  }

  function round(main) {
    const R = M().rounds[B.round];
    const list = M().list;
    const st = { phase: "mode", flawless: true, miss: false, chat: [] };

    function draw() {
      const phases = R.mode === "none" ? ["mode", "finish"] : ["mode", "open", "next", "finish"];
      const labels = { mode: "Pick the AI Mode", open: "Open", next: "Next move", finish: "What you do yourself" };
      const steps = R.mode !== "none" && st.phase !== "mode" ? M().matrix[R.mode] : null;
      const curStep = { open: 1, next: 2, finish: 3 }[st.phase];
      main.innerHTML = `
        <section class="wrap page battle">
          ${hud()}
          <div class="round-card">
            <p class="kicker">Round ${B.round + 1} of ${M().rounds.length}${st.phase !== "mode" && R.mode !== "none" ? ` · ${list[R.mode].name} Mode` : ""}</p>
            <h1 class="h1-sm">${esc(R.need)}</h1>
            <ol class="phases">${phases.map(p => `<li class="${p === st.phase ? "now" : phases.indexOf(p) < phases.indexOf(st.phase) ? "past" : ""}">${labels[p]}</li>`).join("")}</ol>
          </div>
          ${steps ? `<ol class="mode-steps m-${R.mode}" aria-label="${list[R.mode].name} Mode steps">${steps.map((s, k) => `<li class="${k === 3 ? "fin" : ""} ${k === curStep || (curStep === 1 && k === 0) ? "now" : ""}"><span>${k + 1}</span>${esc(s)}</li>`).join("")}</ol>` : ""}
          ${st.chat.length ? `<div class="chat">${st.chat.map(c => `<div class="turn ${c.who}"><span class="who">${c.who === "ai" ? "AI" : c.who === "final" ? "Learner · final check" : "Learner"}</span><p>${esc(c.t)}</p></div>`).join("")}</div>` : ""}
          <div id="choices"></div>
          <div id="after" aria-live="polite"></div>
        </section>`;
      choices();
    }

    function choices() {
      const box = WB.$("#choices", main);
      if (st.phase === "mode") {
        box.innerHTML = `<p class="q">Which AI Mode fits this need?</p>
          <div class="mode-cards">${Object.keys(list).map(k => `
            <button type="button" class="mode-card m-${k}" data-m="${k}"><span class="mode-head">${WB.icon(k)}</span><b>${list[k].name}${k === "none" ? "" : " Mode"}</b><small>${list[k].job}</small></button>`).join("")}
          </div>`;
        WB.$$(".mode-card", box).forEach(b => b.addEventListener("click", () => pickMode(b)));
        return;
      }
      const set = R[st.phase];
      const q = { open: "How do you open the conversation?", next: "The AI replied. What's your next move?", finish: "How do you finish?" }[st.phase];
      box.innerHTML = `<p class="q">${q}</p><div class="answers">${WB.shuffle(set.map((o, k) => ({ ...o, k }))).map(o => `<button type="button" class="ans" data-k="${o.k}">${st.phase === "finish" ? "" : "“"}${esc(o.t)}${st.phase === "finish" ? "" : "”"}</button>`).join("")}</div>`;
      WB.$$(".ans", box).forEach(b => b.addEventListener("click", () => pick(b, set)));
      WB.$(".ans", box).focus();
    }

    function pickMode(b) {
      const m = b.dataset.m;
      if (m === R.mode) {
        b.classList.add("is-right");
        hit(`${list[m].name}${m === "none" ? "" : " Mode"}! ${R.modeWhy}`, () => {
          st.phase = R.mode === "none" ? "finish" : "open";
          draw();
        });
      } else if (m === "none") {
        b.disabled = true; b.classList.add("is-dim");
        WB.sfx("tap");
        WB.$("#after", main).innerHTML = `<div class="after"><p class="verdict mid">No AI is always an option.</p><p>Here, AI help is allowed, and one AI Mode fits this need well. Try an AI Mode.</p></div>`;
      } else {
        b.disabled = true; b.classList.add("is-wrong");
        miss(`That's ${list[m].name} Mode, where AI's job is to ${list[m].job.toLowerCase()}. Is that what this need calls for?`);
      }
    }

    function pick(b, set) {
      const k = +b.dataset.k;
      if (k === 0) {
        WB.$$(".ans", main).forEach(x => { x.disabled = true; });
        b.classList.add("is-right");
        const phase = st.phase;
        hit(set[0].why, () => {
          if (phase === "open") { st.chat.push({ who: "me", t: set[0].t }, { who: "ai", t: R.ai }); st.phase = "next"; draw(); }
          else if (phase === "next") { st.chat.push({ who: "me", t: set[0].t }); st.phase = "finish"; draw(); }
          else { st.chat.push({ who: "final", t: set[0].t }); endRound(); }
        });
      } else {
        b.disabled = true; b.classList.add("is-wrong");
        miss(set[k].why);
      }
    }

    function hit(why, then) {
      B.hits++;
      const pts = st.miss ? 50 : 100;
      B.score += pts;
      st.miss = false;
      WB.sfx("hit");
      const bot = WB.$("#bot", main);
      if (bot && !WB.reduced()) { bot.classList.remove("shake"); void bot.offsetWidth; bot.classList.add("shake"); }
      const hp = Math.max(0, 1 - B.hits / totalHits());
      const bar = WB.$(".hpbar i", main); if (bar) bar.style.width = hp * 100 + "%";
      const ps = WB.$(".pscore b", main); if (ps) ps.textContent = B.score.toLocaleString();
      const taunt = M().taunts.hit[B.hits % M().taunts.hit.length];
      B.say = taunt;
      WB.$("#speech", main).textContent = "“" + taunt + "”";
      WB.$("#after", main).innerHTML = `<div class="after"><p class="verdict ok">Direct hit! +${pts}</p><p>${esc(why)}</p><button type="button" class="btn" id="next">Continue ${WB.icon("arrow")}</button></div>`;
      const nx = WB.$("#next", main); nx.focus();
      nx.addEventListener("click", then);
    }

    function miss(why) {
      st.flawless = false; st.miss = true;
      B.hearts--;
      WB.sfx("bad");
      const hearts = WB.$(".hearts", main);
      if (hearts) { hearts.innerHTML = Array.from({ length: MAX_HEARTS }, (_, k) => `<span class="${k < B.hearts ? "on" : ""}">${WB.icon("heart")}</span>`).join(""); hearts.setAttribute("aria-label", `${B.hearts} of ${MAX_HEARTS} hearts`); }
      B.say = M().taunts.miss[B.hearts % M().taunts.miss.length];
      WB.$("#speech", main).textContent = "“" + B.say + "”";
      WB.$("#after", main).innerHTML = `<div class="after"><p class="verdict no">The Autopilot likes that one. −1 heart</p><p>${esc(why)}</p></div>`;
      if (B.hearts <= 0) {
        WB.$$("#choices button", main).forEach(x => { x.disabled = true; });
        setTimeout(() => lose(main), 900);
      }
    }

    function endRound() {
      const bonus = st.flawless;
      if (bonus) { B.score += 100; B.hearts = Math.min(MAX_HEARTS, B.hearts + 1); }
      const last = B.round + 1 >= M().rounds.length;
      WB.$("#choices", main).innerHTML = "";
      draw2();
      function draw2() {
        const chat = st.chat.map(c => `<div class="turn ${c.who}"><span class="who">${c.who === "ai" ? "AI" : c.who === "final" ? "Learner · final check" : "Learner"}</span><p>${esc(c.t)}</p></div>`).join("");
        const old = WB.$(".chat", main);
        if (old) old.outerHTML = `<div class="chat">${chat}</div>`;
        else WB.$("#choices", main).insertAdjacentHTML("beforebegin", `<div class="chat">${chat}</div>`);
        WB.$("#after", main).innerHTML = `<div class="after round-end">
          <p class="verdict ok">Round ${B.round + 1} won${bonus ? " · Flawless! +100 and a heart back" : ""}</p>
          <p>What you do yourself: <b>${R.mode === "none" ? "do the work yourself" : esc(M().list[R.mode].finish.toLowerCase())}</b>.</p>
          <button type="button" class="btn" id="next">${last ? "Land the final blow" : "Next round"} ${WB.icon("arrow")}</button></div>`;
        const nx = WB.$("#next", main); nx.focus();
        nx.addEventListener("click", () => { B.round++; if (last) win(main); else round(main); });
      }
    }

    B.say = B.round === 0 ? M().taunts.start : M().taunts.miss[B.round % M().taunts.miss.length];
    draw();
  }

  function lose(main) {
    WB.sfx("bad");
    main.innerHTML = `
      <section class="wrap page result">
        <div class="boss-portrait small">${botSVG("smug")}</div>
        <p class="kicker">Out of hearts</p>
        <h1>The Autopilot took the wheel.</h1>
        <p class="lede">${esc(M().taunts.lose)} You'll restart this round with 3 hearts and keep your points.</p>
        <div class="row-gap">
          <button type="button" class="btn btn-big btn-boss" id="retry">Retry round ${B.round + 1}</button>
          <a class="btn btn-ghost" href="#/stations">Review the stations</a>
        </div>
      </section>`;
    WB.$("#retry", main).addEventListener("click", () => {
      // rewind the hits earned in the failed round
      B.hearts = 3;
      B.hits = M().rounds.slice(0, B.round).reduce((n, r) => n + 1 + (r.open ? 1 : 0) + (r.next ? 1 : 0) + 1, 0);
      round(main);
    });
  }

  function win(main) {
    const s = WB.state.boss;
    const newBest = B.score > s.best;
    s.best = Math.max(s.best, B.score);
    s.done = true;
    WB.save();
    WB.sfx("win"); WB.confetti();
    setTimeout(() => WB.confetti(), 700);
    const list = M().list, mx = M().matrix;
    main.innerHTML = `
      <section class="wrap page result boss-win">
        <div class="boss-portrait small">${botSVG("down")}</div>
        ${WB.starRow(WB.starsFor("boss", B.score), "big")}
        <p class="kicker">Chapter 3 complete · Autopilot defeated</p>
        <h1>You finished the work.</h1>
        <p class="taunt">“${esc(M().taunts.win)}”</p>
        <p class="lede">${B.score.toLocaleString()} points${newBest ? " · new best" : ""}. You matched every need to an AI Mode, steered every conversation, and finished every round yourself.</p>
        <h2 class="h2">Your AI Mode field guide</h2>
        <p class="muted">Keep this. Every AI Mode has four steps, and the last one is always yours.</p>
        <div class="table-wrap"><table class="matrix">
          <thead><tr><th scope="col">AI Mode</th><th scope="col">1 · Set up</th><th scope="col">2 · Use AI</th><th scope="col">3 · Think it through</th><th scope="col" class="fin">4 · What you do yourself</th></tr></thead>
          <tbody>${Object.keys(mx).map(k => `<tr class="m-${k}"><th scope="row"><span class="mode-i">${WB.icon(k)}</span> ${list[k].name}</th>${mx[k].map((c, i) => `<td class="${i === 3 ? "fin" : ""}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>
        <div class="note"><b>No fixed order.</b> For everyday tasks, choose, combine, revisit or skip AI Modes for a reason. <b>Use these skills every time.</b> Prompting, Data &amp; Privacy, Ethics and Verification apply in every AI Mode.</div>
        <p>Next in class, try a whole project with your teacher. Choose when to use each AI Mode, check the replies, and show what you did yourself.</p>
        <div id="ticket"></div>
        <div class="row-gap">
          <a class="btn btn-big" href="#/workbook">See my workbook</a>
          <button type="button" class="btn btn-ghost" id="again">Fight again</button>
        </div>
      </section>`;
    WB.exitTicket(WB.$("#ticket", main), "Which AI Mode might help you this week? What will you do yourself?",
      () => WB.state.boss.reflection, v => { WB.state.boss.reflection = v; });
    WB.$("#again", main).addEventListener("click", () => intro(main));
  }
})();
