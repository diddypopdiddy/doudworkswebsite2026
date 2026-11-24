import { gameFetch } from "./game-location.js";
import {
  DEFAULT_TOPIC, DEFAULT_MINUTES, TAGS, PLUS_TAGS, MINUS_TAGS, ONE_THING,
  EXAMPLES, EXAMPLE_TOPIC, scoreExample, THREE_MOVES, LEVELS,
} from "./game-data.js";

// ============================================================
// Setup & state
// ============================================================
const app = document.getElementById("app");
const params = new URLSearchParams(location.search);
const STORE_KEY = "write-with-ai-game-v2";
const PHASES = ["lobby", "round1", "review1", "round2", "review2", "crown"];
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const clampMin = m => Math.min(30, Math.max(1, Math.round(Number(m)) || DEFAULT_MINUTES));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtPts = n => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");
const signClass = n => (n > 0 ? "plus" : n < 0 ? "minus" : "zero");

function newRound(n) {
  return { n, topic: "", messages: [], paragraph: "", startedAt: null, duration: 0, roomTimed: false, ended: false, tags: [], suggest: null, refNote: "", oneThing: null, score: null, gradedBy: null };
}
function freshState(keep = {}) {
  return {
    screen: "hook", name: keep.name || "", playerId: uid(), room: keep.room || "", accessCode: keep.accessCode || "",
    topic: keep.topic || DEFAULT_TOPIC, minutes: keep.minutes || DEFAULT_MINUTES, mode: keep.mode || null,
    current: 0, rounds: [newRound(1)], examplesRevealed: false,
  };
}
function load() { try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s && Array.isArray(s.rounds)) return s; } catch {} return null; }
let saveTimer;
function save(now = false) {
  clearTimeout(saveTimer);
  const write = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch {} };
  if (now) write(); else saveTimer = setTimeout(write, 250);
}

let S = load();
const urlRoom = (params.get("room") || "").trim().toUpperCase();
const urlMode = ["solo", "partner"].includes(params.get("mode")) ? params.get("mode") : undefined;
if (!S || params.has("reset") || (urlRoom && S.room !== urlRoom)) {
  S = freshState({ room: urlRoom, mode: urlMode, topic: params.get("topic") || undefined, minutes: params.get("minutes") ? clampMin(params.get("minutes")) : undefined });
  save(true);
}
// Don't let a refresh re-trigger a reset and wipe the game.
if (params.has("reset")) { params.delete("reset"); history.replaceState(null, "", location.pathname + (params.toString() ? `?${params}` : "")); }
const cur = () => S.rounds[S.current];
const topicFor = r => r.topic || S.topic;
const isSolo = () => S.mode === "solo";

let health = { practice: false, accessCodeRequired: false };
gameFetch("/api/health").then(r => r.json()).then(h => {
  health = h;
  const strip = document.getElementById("practiceStrip");
  if (strip) strip.hidden = !h.practice;
  if (S.screen === "hook" || (S.screen === "join" && h.accessCodeRequired && !document.getElementById("access"))) render();
}).catch(() => {});

// ============================================================
// Class game (teacher-paced) sync
// ============================================================
let room = null, offset = 0, pollTimer = null, roomError = "";
const serverNow = () => Date.now() + offset;
const phaseIdx = p => PHASES.indexOf(p);

async function pollRoom() {
  if (!S.room) return;
  try {
    const res = await gameFetch(`/api/rooms/${encodeURIComponent(S.room)}`, { cache: "no-store" });
    if (res.status === 404) {
      roomError = "That class game has ended. You can keep playing on your own.";
      room = null;
      clearInterval(pollTimer);
      if (S.screen === "intro" || S.screen === "final") render();
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    offset = data.now - Date.now();
    const changed = !room || room.phase !== data.phase || room.topic !== data.topic || room.minutes !== data.minutes || room.mode !== data.mode;
    room = data; roomError = "";
    if (changed) onRoomChange();
  } catch {}
}
function startPolling() { clearInterval(pollTimer); if (S.room) { pollRoom(); pollTimer = setInterval(pollRoom, 2500); } }
function onRoomChange() {
  const r = cur();
  if (!r.startedAt && r.n <= 2) { S.topic = room.topic; S.minutes = room.minutes; }
  if (room.mode && S.current === 0 && !r.ended) S.mode = room.mode;
  save();
  if (S.screen === "intro" || S.screen === "final") render();
  if (S.screen === "chat" && r.roomTimed && !r.ended && phaseIdx(room.phase) > phaseIdx(`round${r.n}`)) endRound();
}
function statusFor() {
  const n = cur().n;
  return ({ hook: "joined", join: "joined", mode: "joined", intro: `ready R${n}`, chat: `writing R${n}`, swap: `grading R${n}`, examples: `grading R${n}`, rubric: `grading R${n}`, choose: `grading R${n}`, autograde: `grading R${n}`, grade: `grading R${n}`, reveal: `scored R${n}`, breakdown: `scored R${n}`, final: "done" })[S.screen] || "playing";
}
function sendStatus(extra = {}) {
  if (!S.room) return;
  gameFetch(`/api/rooms/${encodeURIComponent(S.room)}/player`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId: S.playerId, name: S.name, status: statusFor(), ...extra }),
  }).catch(() => {});
}
function roomGate(n) {
  if (!S.room || roomError || n > 2) return "free";
  if (!room) return "wait";
  const idx = phaseIdx(room.phase), target = phaseIdx(`round${n}`);
  if (idx < target) return "wait";
  if (idx === target && room.roundStart?.[n]) return "sync";
  return "free";
}

// ============================================================
// Navigation
// ============================================================
let tick = null, streamCtl = null;
function go(screen) {
  if (S.screen === "chat" && screen !== "chat" && streamCtl) streamCtl.abort();
  S.screen = screen; save(true);
  sendStatus();
  render();
  window.scrollTo(0, 0);
}
function render() {
  clearInterval(tick); tick = null;
  (SCREENS[S.screen] || SCREENS.hook)();
}

// ============================================================
// Scoring & levels
// ============================================================
const studentMsgs = r => r.messages.filter(m => m.role === "user");
function oneThingApplies(r) { return r.oneThing === null ? studentMsgs(r).length <= 1 : r.oneThing; }
function computeScore(r) {
  let total = 0; const counts = {};
  studentMsgs(r).forEach((_, i) => (r.tags[i] || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; total += TAGS[t].pts; }));
  if (oneThingApplies(r)) { counts.oneThing = 1; total += ONE_THING.pts; }
  return { total, counts };
}
function levelFor(r) {
  const { total, counts } = computeScore(r);
  if (total >= 30 && counts.own && counts.feedback && counts.rubric && !counts.writeIt) return LEVELS[3];
  if (total >= 15 && counts.own) return LEVELS[2];
  if (total >= 0 || counts.own) return LEVELS[1];
  return LEVELS[0];
}
function bestRound() {
  const graded = S.rounds.filter(r => r.score !== null);
  if (!graded.length) return cur();
  return graded.reduce((a, b) => (b.score > a.score ? b : a));
}
function postScore(r) {
  sendStatus({ round: r.n, score: r.score, level: levelFor(bestRound()).id });
}

// ============================================================
// Tiny safe markdown for AI replies
// ============================================================
function inline(s) {
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
}
function md(text) {
  let html = "", list = null;
  for (const raw of esc(text).split("\n")) {
    const line = raw.trimEnd();
    const ul = line.match(/^\s*[-*•]\s+(.*)/), ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const t = ul ? "ul" : "ol";
      if (list !== t) { if (list) html += `</${list}>`; html += `<${t}>`; list = t; }
      html += `<li>${inline((ul || ol)[1])}</li>`; continue;
    }
    if (list) { html += `</${list}>`; list = null; }
    if (!line.trim()) continue;
    if (/^#{1,6}\s/.test(line)) { html += `<p><strong>${inline(line.replace(/^#+\s*/, ""))}</strong></p>`; continue; }
    html += `<p>${inline(line)}</p>`;
  }
  if (list) html += `</${list}>`;
  return html;
}

// ============================================================
// Shared pieces
// ============================================================
const DECO = {
  star: `<svg width="72" height="72" viewBox="0 0 100 100"><path d="M50 5l13 29 32 4-24 21 7 32-28-16-28 16 7-32L5 38l32-4z" fill="#ffd23f" stroke="#17130e" stroke-width="5" stroke-linejoin="round"/></svg>`,
  dot: `<svg width="58" height="58" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ff8ac9" stroke="#17130e" stroke-width="7"/></svg>`,
  squiggle: `<svg width="104" height="44" viewBox="0 0 120 50"><path d="M8 30 Q22 6 36 26 T64 26 T92 26 T112 20" fill="none" stroke="#17130e" stroke-width="15" stroke-linecap="round"/><path d="M8 30 Q22 6 36 26 T64 26 T92 26 T112 20" fill="none" stroke="#2f5bff" stroke-width="8" stroke-linecap="round"/></svg>`,
  tri: `<svg width="62" height="62" viewBox="0 0 100 100"><path d="M50 9 L93 87 H7 Z" fill="#17b26a" stroke="#17130e" stroke-width="7" stroke-linejoin="round"/></svg>`,
};
const decoHTML = () => `<div class="deco d1">${DECO.star}</div><div class="deco d2">${DECO.dot}</div><div class="deco d3">${DECO.squiggle}</div><div class="deco d4">${DECO.tri}</div>`;
function stage(inner, { cls = "", deco = true, top = false } = {}) {
  const chip = S.name ? `<span class="player-chip"><span class="av">${esc(S.name[0].toUpperCase())}</span>${esc(S.name)}</span>` : "";
  return `<section class="stage ${cls} ${top ? "top" : ""}">
    ${deco ? decoHTML() : ""}
    <div class="gamebar"><span class="logo-badge"><span class="spark">✦</span>Write with AI</span><span class="spacer"></span>${chip}</div>
    <div class="stage-body">${inner}</div>
  </section>`;
}
function rubricHTML(compact = false) {
  const row = (id, sign) => { const t = TAGS[id]; return `<div class="rubric-row"><span class="emoji">${t.emoji}</span><span class="what">${esc(t.label)}${compact ? "" : `<small>${esc(t.hint)}</small>`}</span><span class="token ${sign}">${fmtPts(t.pts)}</span></div>`; };
  return `<div class="rubric ${compact ? "compact" : ""}">
    <div class="rcol">
      <div class="rubric-head plus">Earn points</div>
      ${PLUS_TAGS.map(id => row(id, "plus")).join("")}
    </div>
    <div class="rcol">
      <div class="rubric-head minus">Lose points</div>
      ${MINUS_TAGS.map(id => row(id, "minus")).join("")}
      <div class="rubric-row"><span class="emoji">${ONE_THING.emoji}</span><span class="what">${esc(ONE_THING.label)}</span><span class="token minus">${fmtPts(ONE_THING.pts)}</span></div>
    </div>
  </div>`;
}
const tagHTML = t => `<span class="tag ${TAGS[t].pts > 0 ? "plus" : "minus"} pop">${TAGS[t].emoji} ${esc(TAGS[t].short)} ${fmtPts(TAGS[t].pts)}</span>`;
function convoHTML(conv, label, revealed) {
  const total = scoreExample(conv);
  return `<div class="convo">
    <div class="convo-head ${revealed ? signClass(total) : ""}"><span>${label}</span>${revealed ? `<span class="total pop">${fmtPts(total)}</span>` : `<span class="mystery">?? points</span>`}</div>
    <div class="convo-body">
      ${conv.map(m => m.role === "user"
        ? `<div class="u">${esc(m.content)}${revealed && m.tags?.length ? `<div class="tags">${m.tags.map(tagHTML).join("")}</div>` : ""}</div>`
        : `<div class="a"><span class="bot">✦</span><div class="clamp" title="Tap to read it all">${esc(m.content)}</div></div>`).join("")}
    </div>
  </div>`;
}
function breakdownHTML(r) {
  const { counts } = computeScore(r);
  const rows = [...PLUS_TAGS, ...MINUS_TAGS].filter(id => counts[id]).map(id => {
    const t = TAGS[id]; const pts = t.pts * counts[id];
    return `<div class="b-row"><span class="e">${t.emoji}</span><span class="what">${esc(t.label)} <span class="n">× ${counts[id]}</span></span><span class="token ${signClass(pts)}">${fmtPts(pts)}</span></div>`;
  });
  if (counts.oneThing) rows.push(`<div class="b-row"><span class="e">${ONE_THING.emoji}</span><span class="what">${esc(ONE_THING.label)}</span><span class="token minus">${fmtPts(ONE_THING.pts)}</span></div>`);
  if (!rows.length) rows.push(`<div class="b-row"><span class="e">🤷</span><span class="what">No points earned or lost.</span><span class="token zero">0</span></div>`);
  return `<div class="breakdown">${rows.join("")}</div>`;
}
function annotatedHTML(r) {
  const students = studentMsgs(r);
  if (!students.length) return `<div class="annotated"><div class="u"><div class="t">No messages were sent to the chatbot.</div></div></div>`;
  return `<div class="annotated">${students.map((m, i) => `<div class="u"><div class="t">${esc(m.content)}</div>${(r.tags[i] || []).length ? `<div class="tags">${r.tags[i].map(tagHTML).join("")}</div>` : `<div class="none">No points either way.</div>`}</div>`).join("")}</div>`;
}
function movesHTML() {
  return `<div class="moves">${THREE_MOVES.map(m => `<div class="move"><div class="e">${m.emoji}</div><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div>`).join("")}</div>`;
}
function openModal(inner) {
  const el = document.createElement("div");
  el.className = "modal";
  el.innerHTML = `<div class="sheet pop" role="dialog" aria-modal="true">${inner}<div class="row" style="margin-top:18px"><button class="btn small" data-close>Got it</button></div></div>`;
  el.addEventListener("click", e => { if (e.target === el || e.target.closest("[data-close]")) el.remove(); });
  document.body.appendChild(el);
  el.querySelector("[data-close]").focus();
}
function rubricModal() {
  openModal(`<p class="kicker">The rubric</p><h2 class="mid" style="font-size:34px">Every time you do it, it counts.</h2>${rubricHTML(true)}`);
}
function confetti() {
  const box = document.createElement("div"); box.className = "confetti";
  const colors = ["#ffd23f", "#17b26a", "#2f5bff", "#ff8ac9", "#ff5b3a", "#fffdf7"];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 2 + Math.random() * 2.5 + "s";
    p.style.animationDelay = Math.random() * .6 + "s";
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 5500);
}
function countUp(el, target, ms = 1400) {
  const start = performance.now();
  const stepFn = now => {
    const t = Math.min(1, (now - start) / ms), eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmtPts(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(stepFn);
  };
  requestAnimationFrame(stepFn);
}

// ============================================================
// Screens
// ============================================================
const SCREENS = {};

// ---- The hook ----
SCREENS.hook = () => {
  let noClicks = 0;
  const noText = ["No", "Are you sure?", "Wrong answer.", "Try the other one.", "Yes"];
  app.innerHTML = stage(`<div class="wrap">
      <h1 class="big pop">Want to play<br>a <span class="hl">game?</span></h1>
      <div class="row" style="margin-top:34px">
        <button class="btn huge" id="yes">Yes</button>
        <button class="btn white huge" id="no">No</button>
      </div>
      ${health.practice ? `<p class="small-print" style="margin-top:30px">Scripted practice is on.</p>` : ""}
    </div>`);
  document.getElementById("yes").onclick = () => go("join");
  const no = document.getElementById("no");
  no.onclick = () => {
    noClicks++;
    if (noClicks >= noText.length - 1) { go("join"); return; }
    no.textContent = noText[noClicks];
    no.classList.remove("wobble"); void no.offsetWidth; no.classList.add("wobble");
  };
};

// ---- Name / class code ----
SCREENS.join = () => {
  const needAccess = health.accessCodeRequired;
  app.innerHTML = stage(`<div class="wrap">
      <p class="kicker">Player one</p>
      <h1 class="mid">What should we<br>call you?</h1>
      <form id="joinForm" class="form-card rise" style="margin-top:26px">
        <label class="field"><span>Nickname</span><input id="name" maxlength="24" autocomplete="off" value="${esc(S.name)}" placeholder="e.g. Bluejay" required></label>
        <label class="field"><span>Class code <small>(only if your teacher gave you one)</small></span><input id="code" maxlength="6" autocomplete="off" value="${esc(S.room)}" placeholder="ABCD" style="text-transform:uppercase;letter-spacing:.25em"></label>
        ${needAccess ? `<label class="field"><span>Access code <small>(no class code? ask your teacher)</small></span><input id="access" autocomplete="off" value="${esc(S.accessCode)}"></label>` : ""}
        <p class="error-text" id="joinErr"></p>
        <button class="btn" type="submit" style="width:100%">Let's go →</button>
      </form>
    </div>`);
  document.getElementById("name").focus();
  document.getElementById("joinForm").onsubmit = async e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const code = document.getElementById("code").value.trim().toUpperCase();
    const err = document.getElementById("joinErr");
    if (!name) { err.textContent = "Type a nickname first."; return; }
    S.name = name; S.accessCode = document.getElementById("access")?.value.trim() || S.accessCode;
    if (code) {
      try {
        const res = await gameFetch(`/api/rooms/${encodeURIComponent(code)}/player`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId: S.playerId, name, status: "joined" }) });
        const data = await res.json();
        if (!res.ok) { err.textContent = data.error || "That code didn't work."; return; }
        S.room = code; room = data; offset = data.now - Date.now(); roomError = "";
        S.topic = data.topic; S.minutes = data.minutes; S.mode = data.mode || "partner";
        startPolling();
        go("intro"); return;
      } catch { err.textContent = "Couldn't reach the game. Check your connection."; return; }
    }
    S.room = ""; room = null; clearInterval(pollTimer);
    go(S.mode ? "intro" : "mode");
  };
};

// ---- Solo or partner ----
SCREENS.mode = () => {
  app.innerHTML = stage(`<div class="wrap wide" style="max-width:900px">
      <p class="kicker">Choose your mode</p>
      <h1 class="mid">How are you playing?</h1>
      <div class="modes">
        <button class="mode-card rise" data-mode="solo">
          <div class="mode-art solo">🎧<span class="tag">Just you</span></div>
          <div class="mode-text"><h2>Solo</h2><p>Play on your own device. Grade your own chat, or let the AI referee score it for you.</p></div>
        </button>
        <button class="mode-card rise" data-mode="partner" style="animation-delay:.08s">
          <div class="mode-art partner">🔄<span class="tag">Classroom classic</span></div>
          <div class="mode-text"><h2>With a partner</h2><p>When time's up, swap computers and grade each other's chats.</p></div>
        </button>
      </div>
    </div>`);
  app.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => { S.mode = b.dataset.mode; go("intro"); });
};

// ---- Round intro ----
SCREENS.intro = () => {
  const r = cur();
  const gate = roomGate(r.n);
  const inRoom = r.n <= 2 && S.room && room;
  const mins = inRoom ? room.minutes : S.minutes;
  const topic = inRoom ? room.topic : S.topic;
  if (gate === "sync") { startRound(true); return; }
  const kicker = r.n === 1 ? `Welcome, ${esc(S.name)}` : r.n === 2 ? "Redemption round" : "Run it back";
  const lede = r.n === 1
    ? "That's all the instructions you get."
    : "Same topic. <strong>Brand-new chat.</strong> Same clock. This time you know how the points work.";
  app.innerHTML = stage(`<div class="wrap">
      ${roomError ? `<p class="notice warn">${esc(roomError)}</p>` : ""}
      <p class="kicker">${kicker}</p>
      <div class="round-badge pop">Round<span class="n">${r.n}</span></div>
      <div class="topic-card rise">
        <span class="sticker">The challenge</span>
        <p class="task">Write the best paragraph on this topic:<strong>${esc(topic)}</strong></p>
      </div>
      <div class="rules">
        <span class="pill yellow">⏱ ${mins} minute${mins === 1 ? "" : "s"}</span>
        <span class="pill">🤖 Use the chatbot</span>
        ${r.n > 1 ? `<span class="pill">📋 Rubric unlocked</span>` : ""}
      </div>
      <p class="lede">${lede}</p>
      ${gate === "wait"
        ? `<div class="waiting"><span class="dot-pulse"></span>Waiting for your teacher to say “go”</div>`
        : `<button class="btn huge" id="startBtn">Start the clock</button>`}
      ${r.n > 1 ? `<div style="margin-top:14px"><button class="link" id="peek">Peek at the rubric</button></div>` : ""}
    </div>`);
  document.getElementById("startBtn")?.addEventListener("click", () => startRound(false));
  document.getElementById("peek")?.addEventListener("click", rubricModal);
};

function startRound(sync) {
  const r = cur();
  if (!r.startedAt) {
    r.topic = sync ? room.topic : S.topic;
    r.startedAt = sync ? room.roundStart[r.n] : serverNow();
    r.duration = (sync ? room.minutes : S.minutes) * 60;
    r.roomTimed = !!sync;
  }
  go("chat");
}
function remaining(r = cur()) {
  if (!r.startedAt) return r.duration;
  return Math.max(0, Math.ceil(r.duration - (serverNow() - r.startedAt) / 1000));
}
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ---- The chatbot (plain, inside a game HUD) ----
SCREENS.chat = () => {
  const r = cur();
  const chatTitle = x => {
    const first = x.messages.find(m => m.role === "user")?.content;
    return first ? first.slice(0, 40) : "New chat";
  };
  app.innerHTML = `<div class="chat-app" id="chatApp">
    <header class="hud">
      <span class="logo-badge"><span class="spark">✦</span>Write with AI</span>
      <span class="round-tag">Round ${r.n}</span>
      <div class="task"><span class="hide-mobile">Write the best paragraph on: </span><b>${esc(topicFor(r))}</b></div>
      ${r.n > 1 ? `<button class="hud-btn" id="rubricBtn">📋<span class="hide-mobile"> Rubric</span></button>` : ""}
      <button class="hud-btn finish" id="finishBtn" ${r.ended ? "disabled" : ""}>✅ Finish</button>
      <div class="timer" id="timer" aria-label="Time left">${fmtTime(remaining())}</div>
    </header>
    <div class="practice-strip" id="practiceStrip" ${health.practice ? "" : "hidden"}>Scripted practice replies.</div>
    <div class="chat-body" id="chatBody">
      <aside class="sidebar">
        <div class="brand"><span class="bot">✦</span>Assistant</div>
        <button class="side-btn" disabled title="One chat per round">✎ New chat</button>
        <div class="side-label">Today</div>
        ${S.rounds.slice(0, S.current + 1).reverse().map(x => `<div class="side-item ${x === r ? "active" : "locked"}">${x === r ? "" : "🔒 "}${esc(chatTitle(x))}</div>`).join("")}
        <div class="side-foot"><span class="avatar">${esc((S.name || "?")[0].toUpperCase())}</span>${esc(S.name)}</div>
      </aside>
      <main class="chat-main">
        <div class="chat-top"><div class="model-name">Assistant <small>▾</small></div></div>
        <div id="threadArea" style="display:flex;flex-direction:column;flex:1;min-height:0"></div>
      </main>
    </div>
  </div>`;
  renderThreadArea();

  document.getElementById("rubricBtn")?.addEventListener("click", rubricModal);
  document.getElementById("finishBtn").onclick = confirmFinish;

  const timerEl = document.getElementById("timer");
  const update = () => {
    const left = remaining();
    timerEl.textContent = fmtTime(left);
    timerEl.classList.toggle("low", left <= 30);
    if (left <= 0 && !r.ended) endRound();
  };
  update();
  if (r.ended) showTimeUp();
  else tick = setInterval(update, 250);
};

function composerHTML(r) {
  return `<form class="composer" id="composer">
    <textarea id="input" rows="1" placeholder="${r.ended ? "Time's up" : "Message Assistant"}" ${r.ended ? "disabled" : ""} aria-label="Message"></textarea>
    <button class="send" id="sendBtn" type="submit" aria-label="Send" disabled>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </button>
  </form>`;
}
function msgHTML(m) {
  if (m.role === "user") return `<div class="msg user">${esc(m.content)}</div>`;
  return `<div class="msg ai"><span class="bot">✦</span><div class="body">${m.content ? md(m.content) : `<span class="typing"><i></i><i></i><i></i></span>`}</div></div>`;
}
function renderThreadArea(keepText = "") {
  const r = cur();
  const area = document.getElementById("threadArea");
  if (!area) return;
  const disclaimer = `<div class="disclaimer">AI can make mistakes. Keep personal information out of the chat.</div>`;
  if (!r.messages.length) {
    area.innerHTML = `<div class="empty"><h2>What can I help with?</h2>${composerHTML(r)}${disclaimer}</div>`;
  } else {
    area.innerHTML = `<div class="thread" id="thread"><div class="thread-inner" id="threadInner">${r.messages.map(msgHTML).join("")}</div></div>
      <div class="composer-wrap">${composerHTML(r)}${disclaimer}</div>`;
    const th = document.getElementById("thread"); th.scrollTop = th.scrollHeight;
  }
  bindComposer(keepText);
}
function bindComposer(keepText) {
  const input = document.getElementById("input"), btn = document.getElementById("sendBtn"), form = document.getElementById("composer");
  if (!input) return;
  const resize = () => { input.style.height = "auto"; input.style.height = Math.min(200, input.scrollHeight) + "px"; };
  const sync = () => { btn.disabled = !input.value.trim() || !!streamCtl || cur().ended; resize(); };
  input.value = keepText; sync();
  input.addEventListener("input", sync);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!btn.disabled) form.requestSubmit(); }
  });
  form.onsubmit = e => { e.preventDefault(); const text = input.value.trim(); if (text && !streamCtl && !cur().ended) sendMessage(text); };
  if (!cur().ended && !matchMedia("(max-width: 860px)").matches) input.focus();
}
function showChatError(text) {
  const inner = document.getElementById("threadInner") || document.querySelector(".empty");
  if (!inner) return;
  const el = document.createElement("div");
  el.className = "msg ai error";
  el.innerHTML = `<span class="bot">!</span><div class="body"><p>${esc(text)}</p></div>`;
  if (inner.id === "threadInner") { inner.appendChild(el); const th = document.getElementById("thread"); th.scrollTop = th.scrollHeight; }
  else inner.insertBefore(el, inner.querySelector(".composer"));
}

async function sendMessage(text) {
  const r = cur();
  const userMsg = { role: "user", content: text };
  const aiMsg = { role: "assistant", content: "" };
  r.messages.push(userMsg, aiMsg);
  save();
  renderThreadArea();
  const ctl = new AbortController(); streamCtl = ctl;
  const bodyEl = () => document.querySelector("#threadInner .msg.ai:last-child .body");
  const thread = () => document.getElementById("thread");
  let pending = false, finished = false;
  const paint = () => {
    if (pending || finished) return; pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (finished) return;
      const el = bodyEl(); const th = thread();
      if (!el || !th) return;
      const nearBottom = th.scrollHeight - th.scrollTop - th.clientHeight < 120;
      el.innerHTML = md(aiMsg.content) || `<span class="typing"><i></i><i></i><i></i></span>`;
      el.classList.add("caret");
      if (nearBottom) th.scrollTop = th.scrollHeight;
    });
  };
  const fail = message => {
    finished = true;
    const i = r.messages.indexOf(userMsg);
    if (i >= 0) r.messages.splice(i, 2);
    save();
    if (S.screen === "chat") { renderThreadArea(r.ended ? "" : text); showChatError(message); }
  };
  try {
    const history = r.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    const res = await gameFetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
      body: JSON.stringify({ messages: history, clientId: S.playerId, room: S.room || undefined, accessCode: S.accessCode || undefined }),
    });
    if (!res.ok) { let msg = "The AI couldn't respond. Try sending again."; try { msg = (await res.json()).error || msg; } catch {} streamCtl = null; return fail(msg); }
    const reader = res.body.getReader(); const dec = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      aiMsg.content += dec.decode(value, { stream: true });
      const marker = aiMsg.content.indexOf("\u0000ERROR:");
      if (marker >= 0) {
        const msg = aiMsg.content.slice(marker + 7);
        aiMsg.content = aiMsg.content.slice(0, marker);
        if (!aiMsg.content.trim()) { streamCtl = null; return fail(msg); }
        break;
      }
      paint();
    }
    aiMsg.content = aiMsg.content.trim();
    if (!aiMsg.content) { streamCtl = null; return fail("The AI sent back an empty reply. Try again."); }
  } catch {
    streamCtl = null;
    if (ctl.signal.aborted) {
      finished = true;
      if (!aiMsg.content.trim()) { const i = r.messages.indexOf(userMsg); if (i >= 0) r.messages.splice(i, 2); }
      save(); return;
    }
    return fail("Lost connection to the AI. Try sending again.");
  }
  streamCtl = null; finished = true;
  save();
  if (S.screen === "chat") {
    const el = bodyEl(); if (el) { el.classList.remove("caret"); el.innerHTML = md(aiMsg.content); }
    const input = document.getElementById("input"); const btn = document.getElementById("sendBtn");
    if (input && btn) btn.disabled = !input.value.trim() || r.ended;
    if (studentMsgs(r).length === 1) { const a = document.querySelector(".side-item.active"); if (a) a.textContent = text.slice(0, 40); }
  }
}

function confirmFinish() {
  const r = cur();
  if (r.ended || document.querySelector(".modal")) return;
  const left = remaining();
  const el = document.createElement("div");
  el.className = "modal";
  el.innerHTML = `<div class="sheet confirm pop" role="dialog" aria-modal="true" aria-labelledby="finTitle">
    <div class="confirm-emoji">🏁</div>
    <h2 class="mid" id="finTitle">Are you sure you're done?</h2>
    <p class="lede">You still have <strong>${fmtTime(left)}</strong> on the clock. Once you finish, this chat is locked and you can't send any more messages.</p>
    <div class="row">
      <button class="btn white" data-keep>Keep working</button>
      <button class="btn" data-done>Yes, I'm done</button>
    </div>
  </div>`;
  const close = () => el.remove();
  el.addEventListener("click", e => {
    if (e.target === el || e.target.closest("[data-keep]")) close();
    if (e.target.closest("[data-done]")) { close(); endRound(true); }
  });
  el.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  document.body.appendChild(el);
  el.querySelector("[data-keep]").focus();
}
function endRound(early = false) {
  const r = cur();
  if (r.ended) return;
  r.ended = true; r.finishedEarly = early; save(true);
  document.querySelector(".modal")?.remove();
  const fb = document.getElementById("finishBtn"); if (fb) fb.disabled = true;
  clearInterval(tick); tick = null;
  if (S.screen === "chat") {
    const t = document.getElementById("timer"); if (t) { t.textContent = "0:00"; t.classList.add("low"); }
    const input = document.getElementById("input"); if (input) { input.disabled = true; input.placeholder = "Time's up"; }
    showTimeUp();
  }
}
function afterTime() {
  const r = cur();
  if (S.mode === "partner") return go("swap");
  go(r.n === 1 ? "examples" : "choose");
}
function showTimeUp() {
  if (document.getElementById("timeUp")) return;
  const r = cur();
  const el = document.createElement("div");
  el.className = "overlay time"; el.id = "timeUp";
  el.innerHTML = `<div>
    <div class="time-word slam">${r.finishedEarly ? "DONE!" : "TIME!"}</div>
    <p class="hands rise">${r.finishedEarly ? "🏁 Locked in. Hands off the keyboard." : "✋ Hands off the keyboard."}</p>
    <button class="btn white huge rise" id="afterTime">${r.n === 1 ? "Now what?" : "Next →"}</button>
  </div>`;
  document.body.appendChild(el);
  document.getElementById("afterTime").onclick = () => { el.remove(); afterTime(); };
}

// ---- Partner: swap seats ----
SCREENS.swap = () => {
  const r = cur();
  document.getElementById("timeUp")?.remove();
  app.innerHTML = stage(`<div class="wrap">
      <div class="crown pop" style="font-size:110px">🔄</div>
      <h1 class="big">Switch <span class="hl">seats.</span></h1>
      <p class="lede">${r.n === 1
        ? "Stand up and move to a classmate's computer. <strong>Leave this one exactly how it is.</strong> Don't close anything."
        : "Same as before: <strong>move to a classmate's computer</strong> and leave this one as it is."}</p>
      <button class="btn huge" id="graderBtn">I'm at a classmate's computer</button>
      <div style="margin-top:16px"><button class="link" id="soloBtn">No partner? Switch to solo.</button></div>
    </div>`, { cls: "blue", deco: false });
  document.getElementById("graderBtn").onclick = () => go(r.n === 1 ? "examples" : "grade");
  document.getElementById("soloBtn").onclick = () => { S.mode = "solo"; go(r.n === 1 ? "examples" : "choose"); };
};

// ---- Two example conversations ----
SCREENS.examples = () => {
  document.getElementById("timeUp")?.remove();
  const revealed = S.examplesRevealed;
  app.innerHTML = stage(`<div class="wrap wide">
      <p class="kicker">${isSolo() ? "Before we score yours" : "Before you grade"}</p>
      <h1 class="mid tight">Two students. <span class="hl">Same</span> assignment.</h1>
      <p class="lede tight">One used AI to <strong>do the work</strong>. One used it like a <strong>tutor</strong>. Which is which?</p>
      <div class="examples">
        ${convoHTML(EXAMPLES.A, "Student A", revealed)}
        ${convoHTML(EXAMPLES.B, "Student B", revealed)}
      </div>
      ${revealed ? `<button class="btn huge" id="toRubric">Show me the rubric →</button>` : `<button class="btn huge" id="reveal">Show the points</button>`}
    </div>`, { top: true, deco: false });
  app.querySelectorAll(".convo .clamp").forEach(c => c.addEventListener("click", () => c.classList.toggle("open")));
  document.getElementById("reveal")?.addEventListener("click", () => { S.examplesRevealed = true; save(); render(); });
  document.getElementById("toRubric")?.addEventListener("click", () => go("rubric"));
};

// ---- The rubric (+ solo grader choice) ----
function choiceHTML() {
  return `<div class="choice">
    <button class="btn white" id="gradeSelf"><span class="e">✍️</span><span class="t">I'll grade it myself<small>Go message by message with the rubric.</small></span></button>
    <button class="btn" id="gradeAI"><span class="e">🤖</span><span class="t">No, grade it for me<small>The AI referee scores it in seconds.</small></span></button>
  </div>`;
}
function bindChoice() {
  document.getElementById("gradeSelf").onclick = () => go("grade");
  document.getElementById("gradeAI").onclick = () => go("autograde");
}
SCREENS.rubric = () => {
  app.innerHTML = stage(`<div class="wrap xwide">
      <p class="kicker">The rubric</p>
      <h1 class="mid tight">Every time you do it, <span class="hl">it counts.</span></h1>
      <p class="lede tight">${isSolo() ? "Now it's your chat's turn. Want to grade your own conversation?" : `You're grading <strong>${esc(S.name)}'s</strong> chat. Go message by message.`}</p>
      ${rubricHTML(false)}
      ${isSolo() ? choiceHTML() : `<button class="btn" id="startGrade">Start grading →</button>`}
    </div>`, { top: true, deco: false });
  if (isSolo()) bindChoice(); else document.getElementById("startGrade").onclick = () => go("grade");
};
SCREENS.choose = () => {
  document.getElementById("timeUp")?.remove();
  const r = cur();
  app.innerHTML = stage(`<div class="wrap xwide">
      <p class="kicker">Round ${r.n} is in</p>
      <h1 class="mid tight">Who's grading <span class="hl">this one?</span></h1>
      <p class="lede tight">Same rubric as before.</p>
      ${rubricHTML(true)}
      ${choiceHTML()}
    </div>`, { top: true, deco: false });
  bindChoice();
};

// ---- Solo: the AI referee grades it ----
SCREENS.autograde = async () => {
  const r = cur();
  app.innerHTML = stage(`<div class="wrap">
      <div class="spinner"></div>
      <h1 class="mid">The referee is reading your chat…</h1>
      <p class="lede">It's checking every message against the rubric.</p>
    </div>`, { cls: "yellow", deco: false });
  const students = studentMsgs(r);
  if (!students.length) { finishGrading(r, "ai"); return; }
  try {
    const res = await gameFetch("/api/referee", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: r.messages.map(m => ({ role: m.role, content: m.content })), clientId: S.playerId, room: S.room || undefined, accessCode: S.accessCode || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (S.screen !== "autograde") return;
    r.tags = data.messages.map(t => [...t]); r.suggest = data.messages; r.refNote = data.note || "";
    finishGrading(r, "ai");
  } catch (e) {
    if (S.screen !== "autograde") return;
    app.innerHTML = stage(`<div class="wrap">
        <div class="crown">🙈</div>
        <h1 class="mid">The referee couldn't make a call.</h1>
        <p class="lede">${esc(e.message || "Something went wrong.")}</p>
        <div class="row"><button class="btn" id="retry">Try again</button><button class="btn white" id="self">I'll grade it myself</button></div>
      </div>`, { cls: "yellow", deco: false });
    document.getElementById("retry").onclick = () => render();
    document.getElementById("self").onclick = () => go("grade");
  }
};
function finishGrading(r, by) {
  r.gradedBy = by;
  r.score = computeScore(r).total;
  save(true);
  postScore(r);
  go("reveal");
}

// ---- Grade (by hand) ----
SCREENS.grade = () => {
  const r = cur();
  const students = studentMsgs(r);
  r.tags = students.map((_, i) => r.tags[i] || []);
  const whose = isSolo() ? "your" : `${esc(S.name)}'s`;
  let si = -1;
  const items = r.messages.map(m => {
    if (m.role === "user") {
      si++;
      const i = si;
      const chip = (t, sign) => {
        const on = r.tags[i].includes(t), sug = r.suggest?.[i]?.includes(t);
        return `<button class="chip ${sign} ${on ? "on" : ""} ${sug ? "ai-suggest" : ""}" data-msg="${i}" data-tag="${t}" aria-pressed="${on}">${TAGS[t].emoji} ${esc(TAGS[t].short)} <span class="p">${fmtPts(TAGS[t].pts)}</span></button>`;
      };
      const st = subtotal(r, i);
      return `<div class="g-msg student">
        <div class="who"><span>Message ${i + 1}</span><span class="sub ${signClass(st)}" id="sub${i}">${fmtPts(st)}</span></div>
        <div class="text">${esc(m.content)}</div>
        <div class="chips">${PLUS_TAGS.map(t => chip(t, "plus")).join("")}${MINUS_TAGS.map(t => chip(t, "minus")).join("")}</div>
      </div>`;
    }
    return `<div class="g-msg ai"><div class="who"><span>Chatbot reply</span><button class="link" data-expand style="padding:0;font-size:12px">Show all</button></div><div class="text md">${md(m.content)}</div></div>`;
  }).join("");
  const total = computeScore(r).total;
  app.innerHTML = `<section class="grade-page board">
    <div class="grade-top"><div class="grade-top-inner">
      <h2>Grading ${whose} Round ${r.n} chat</h2>
      <button class="btn white small" id="rubricBtn">📋 Rubric</button>
      <div class="live-score ${signClass(total)}" id="liveScore">${fmtPts(total)}</div>
    </div></div>
    <div class="grade-list">
      <p class="section-label">The conversation</p>
      ${students.length ? items : `<div class="g-msg student"><div class="text">No messages were sent to the chatbot.</div></div>`}
      <label class="g-whole"><input type="checkbox" id="oneThing" ${oneThingApplies(r) ? "checked" : ""}><span style="flex:1">${ONE_THING.emoji} ${esc(ONE_THING.label)}</span><span class="token minus">${fmtPts(ONE_THING.pts)}</span></label>
    </div>
    <div class="grade-bar"><div class="grade-bar-inner">
      <div class="referee-note" id="refNote">${r.refNote ? esc(r.refNote) : students.length ? "Tap every move you see. Not sure? Ask the AI referee for a second opinion." : ""}</div>
      ${students.length ? `<button class="btn white small" id="refBtn">🤖 Ask the referee</button>` : ""}
      <button class="btn small" id="lockBtn">Lock in score</button>
    </div></div>
  </section>`;

  const refresh = i => {
    const t = computeScore(r).total;
    const ls = document.getElementById("liveScore");
    ls.textContent = fmtPts(t); ls.className = `live-score ${signClass(t)}`;
    if (i !== undefined) { const s = document.getElementById(`sub${i}`); const v = subtotal(r, i); s.textContent = fmtPts(v); s.className = `sub ${signClass(v)}`; }
  };
  app.querySelectorAll(".chip[data-tag]").forEach(btn => btn.addEventListener("click", () => {
    const i = Number(btn.dataset.msg), t = btn.dataset.tag;
    const set = r.tags[i];
    const at = set.indexOf(t);
    if (at >= 0) set.splice(at, 1); else set.push(t);
    btn.classList.toggle("on", at < 0); btn.setAttribute("aria-pressed", String(at < 0));
    save(); refresh(i);
  }));
  app.querySelectorAll("[data-expand]").forEach(b => b.addEventListener("click", () => {
    const text = b.closest(".g-msg").querySelector(".text"); const open = text.classList.toggle("open"); b.textContent = open ? "Show less" : "Show all";
  }));
  document.getElementById("oneThing").addEventListener("change", e => { r.oneThing = e.target.checked; save(); refresh(); });
  document.getElementById("rubricBtn").onclick = rubricModal;
  document.getElementById("refBtn")?.addEventListener("click", () => askReferee(r));
  document.getElementById("lockBtn").onclick = () => finishGrading(r, isSolo() ? "self" : "partner");
};
function subtotal(r, i) { return (r.tags[i] || []).reduce((n, t) => n + TAGS[t].pts, 0); }
async function askReferee(r) {
  const btn = document.getElementById("refBtn"), note = document.getElementById("refNote");
  btn.disabled = true; btn.textContent = "🤖 Reading…";
  try {
    const res = await gameFetch("/api/referee", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: r.messages.map(m => ({ role: m.role, content: m.content })), clientId: S.playerId, room: S.room || undefined, accessCode: S.accessCode || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "The referee couldn't make a call.");
    r.suggest = data.messages; r.tags = data.messages.map(t => [...t]);
    r.refNote = `Referee: ${data.note || "Here's my call."} You're still the grader, so tap to change anything.`;
    save(); render();
  } catch (e) {
    btn.disabled = false; btn.textContent = "🤖 Ask the referee";
    note.textContent = e.message || "The referee couldn't make a call. Grade it yourself!";
  }
}

// ---- Score reveal ----
SCREENS.reveal = () => {
  const r = cur();
  const score = r.score ?? computeScore(r).total;
  const caption = score <= -20 ? "Ouch." : score < 0 ? "In the red." : score === 0 ? "Dead even." : score >= 30 ? "That's how it's done." : "In the green.";
  const by = { ai: "🤖 Graded by the AI referee", self: "✍️ Graded by you", partner: "🔄 Graded by your partner" }[r.gradedBy] || "";
  const partner = r.gradedBy === "partner";
  app.innerHTML = stage(`<div class="wrap">
      <p class="kicker">${partner ? `${esc(S.name)}'s` : "Your"} Round ${r.n} score</p>
      <div class="score-giant slam" id="giant">0</div>
      <div id="after" style="opacity:0;transition:opacity .35s">
        <h2 class="caption">${caption}</h2>
        ${by ? `<div class="by-line">${by}</div><br>` : ""}
        ${partner
          ? `<p class="lede" style="color:var(--ink)"><strong>Go back to your own seat.</strong> Hand this computer back to ${esc(S.name)}.</p><button class="btn white huge" id="next">I'm ${esc(S.name)}, show me</button>`
          : `<button class="btn white huge" id="next">See the breakdown →</button>`}
      </div>
    </div>`, { cls: score > 0 ? "green" : score < 0 ? "red" : "yellow", deco: false });
  countUp(document.getElementById("giant"), score);
  setTimeout(() => { const a = document.getElementById("after"); if (a) a.style.opacity = 1; if (score > 0) confetti(); }, 1450);
  document.getElementById("next").onclick = () => go("breakdown");
};

// ---- Breakdown + reteach ----
SCREENS.breakdown = () => {
  const r = cur();
  const score = r.score ?? computeScore(r).total;
  const first = r.n === 1;
  const head = { ai: "The referee scored your chat", self: "You scored your chat", partner: "Your partner scored your chat" }[r.gradedBy] || "Your score";
  const openChat = r.gradedBy === "ai";
  const reteach = first ? `
    <div class="reteach rise">
      <h2 class="mid">${score < 0 ? `Most people <span class="hl red">crash</span> in Round 1.<br>That was the point.` : `You <span class="hl green">beat</span> the trap.`}</h2>
      <p class="lede">Round 1 had no rules on purpose. Most people ask the chatbot to write it for them. That's using AI as a <strong>writing tool</strong>. The goal is to use it as a <strong>feedback tool</strong>: you write, and it helps you get better.</p>
      <p class="kicker">How to earn points next round</p>
      ${movesHTML()}
      <p class="lede" style="margin-bottom:0">“Write it for me,” “make it sound like a 10th grader,” and “make it smarter” still cost you points.</p>
    </div>
    <button class="btn huge" id="nextBtn">Bring on the redemption round →</button>`
    : `<button class="btn huge" id="nextBtn" style="margin-top:8px">See my results →</button>`;
  app.innerHTML = stage(`<div class="wrap wide" style="max-width:1000px">
      <p class="kicker">${r.gradedBy === "partner" ? `Welcome back, ${esc(S.name)}` : `Round ${r.n} breakdown`}</p>
      <h1 class="mid">${head}</h1>
      <div class="score-mid ${signClass(score)} pop">${fmtPts(score)}</div>
      ${breakdownHTML(r)}
      <div style="margin:-6px 0 18px"><button class="link" id="toggleChat">${openChat ? "Hide" : "See"} your chat with the points</button></div>
      <div id="chatAnn" ${openChat ? "" : "hidden"}>${annotatedHTML(r)}</div>
      ${reteach}
    </div>`, { top: true, deco: false });
  document.getElementById("toggleChat").onclick = e => {
    const el = document.getElementById("chatAnn"); el.hidden = !el.hidden;
    e.target.textContent = `${el.hidden ? "See" : "Hide"} your chat with the points`;
  };
  document.getElementById("nextBtn").onclick = () => {
    if (first) { S.rounds.push(newRound(2)); S.current = 1; go("intro"); }
    else go("final");
  };
};

// ---- Final: comeback + license card ----
function licenseCardHTML(lv, best) {
  const stampText = { passenger: "Not yet", learner: "Learner", permit: "AI Permit", license: "Licensed" }[lv.id];
  const date = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `<div class="license lv-${lv.id} pop">
    <div class="license-head"><span>Write with AI · Practice card</span><span>${esc(date)}</span></div>
    <div class="license-body">
      <div class="license-photo">${esc((S.name || "?")[0].toUpperCase())}</div>
      <div class="license-fields">
        <div class="lf"><small>Nickname</small><b>${esc(S.name)}</b></div>
        <div class="lf level"><small>Level</small><b>${esc(lv.name)}</b></div>
        <div class="lf"><small>Status</small><b>${esc(lv.tagline)}</b></div>
        <div class="lf"><small>Best round</small><b>${fmtPts(best.score ?? 0)} (Round ${best.n})</b></div>
      </div>
      <div class="license-stamp"><span><span class="e">${lv.badge}</span>${stampText}</span></div>
    </div>
    <div class="license-foot">A practice rating from one game, aligned to the AI Permit → AI License pathway. It isn't an official permit or license; your teacher makes that call.</div>
  </div>`;
}
function trackHTML(lv) {
  const at = LEVELS.indexOf(lv);
  return `<div class="track">${LEVELS.map((l, i) => `<div class="step ${i < at ? "reached" : ""} ${i === at ? "here" : ""}">
      ${i === at ? `<span class="pin">YOU</span>` : ""}
      <div class="b">${l.badge}</div><h4>${esc(l.name)}</h4><div class="tl">${esc(l.tagline)}</div><div class="rule">${esc(l.rule)}</div>
    </div>`).join("")}</div>`;
}
SCREENS.final = () => {
  const firstR = S.rounds[0], lastR = cur();
  const a = firstR.score ?? 0, b = lastR.score ?? 0;
  const diff = b - a;
  const best = bestRound();
  const lv = levelFor(best);
  const crowning = S.room && room && room.phase === "crown";
  const history = S.rounds.length > 2 ? `<div class="breakdown" style="max-width:420px">${S.rounds.map(x => `<div class="b-row"><span class="what">Round ${x.n}</span><span class="token ${signClass(x.score ?? 0)}">${fmtPts(x.score ?? 0)}</span></div>`).join("")}</div>` : "";
  app.innerHTML = stage(`<div class="wrap wide" style="max-width:1000px">
      ${crowning ? `<p class="notice warn">👀 Look up! Your teacher is crowning the winner.</p><br>` : ""}
      ${diff > 0 ? `<div class="crown pop">👑</div>` : ""}
      <p class="kicker">${esc(S.name)}'s results</p>
      <div class="vs">
        <div class="col"><div class="label">Round 1</div><div class="n ${signClass(a)}">${fmtPts(a)}</div></div>
        <div class="arrow">→</div>
        <div class="col"><div class="label">Round ${lastR.n}</div><div class="n ${signClass(b)}">${fmtPts(b)}</div></div>
      </div>
      ${diff > 0 ? `<div class="comeback pop">${fmtPts(diff)} point comeback!</div>` : diff === 0 ? `<p class="lede">Same score both rounds.</p>` : `<p class="lede">Your score went down. Want another shot?</p>`}
      ${history}
      <h2 class="mid" style="margin-top:20px">Where you <span class="hl">landed</span></h2>
      <div class="license-wrap">
        ${licenseCardHTML(lv, best)}
        <p class="level-desc">${esc(lv.desc)}</p>
        <p class="level-next"><strong>${lv.id === "license" ? "Keep it up:" : "Next level:"}</strong> ${esc(lv.next)}</p>
      </div>
      ${trackHTML(lv)}
      <h2 class="mid">Write <em>with</em> AI, not <span class="hl pink">by</span> AI.</h2>
      ${movesHTML()}
      <div class="row">
        ${lv.id !== "license" || b < 0 ? `<button class="btn huge" id="again">Run it back (Round ${lastR.n + 1})</button>` : `<button class="btn white" id="again">Play another round</button>`}
        <button class="btn white" id="newPlayer">New player</button>
      </div>
    </div>`, { top: true });
  if (!SCREENS.final.celebrated && (diff > 0 || lv.id === "license")) { SCREENS.final.celebrated = true; confetti(); sendStatus({ level: lv.id }); }
  document.getElementById("again").onclick = () => { SCREENS.final.celebrated = false; S.rounds.push(newRound(lastR.n + 1)); S.current = S.rounds.length - 1; go("intro"); };
  document.getElementById("newPlayer").onclick = () => {
    if (!confirm("Start over for a new player? This clears this device's game.")) return;
    S = freshState({ room: S.room, topic: S.topic, minutes: S.minutes, accessCode: S.accessCode, mode: S.room ? S.mode : null });
    SCREENS.final.celebrated = false;
    save(true); go("hook");
  };
};

// ============================================================
// Boot
// ============================================================
if (S.room) startPolling();
render();
