import { TOPIC_PRESETS, DEFAULT_MINUTES, LEVELS } from "./game-data.js";
import { gameFetch, studentPage } from "./game-location.js";
const LEVEL = Object.fromEntries(LEVELS.map(l => [l.id, l]));
const modeValue = () => document.querySelector('input[name="mode"]:checked')?.value || "partner";

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtPts = n => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");
const KEY = "write-with-ai-teacher-v1";
const PHASES = ["lobby", "round1", "review1", "round2", "review2", "crown"];
const PHASE_LABEL = { lobby: "Lobby", round1: "Round 1", review1: "Swap & grade", round2: "Round 2", review2: "Swap & grade", crown: "Crown" };
const NEXT = {
  lobby: ["Start Round 1 ⏱", "round1", "Students are joining. When everyone's in, start Round 1. Their clocks start together."],
  round1: ["Call time", "review1", "Round 1 is running. Say nothing about how to use the AI. Screens lock when the clock hits zero, or call time early."],
  review1: ["Start Round 2 ⏱", "round2", "Students swap seats, compare two example chats, see the rubric, grade, then hand back. Start Round 2 when everyone has seen their breakdown."],
  round2: ["Call time", "review2", "Redemption round. Same topic, new chat. Watch for students bringing their own sentences."],
  review2: ["Crown the winner 👑", "crown", "Swap and grade again. When scores are in, crown the winner."],
  crown: ["Show crown screen", "crown", "Put the crown screen on the projector."],
};

let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
let room = null, offset = 0, pollTimer = null, clockTimer = null;
const healthClient = crypto.randomUUID();

// ---------- AI status ----------
async function checkHealth() {
  try {
    const response = await gameFetch("/api/health?usage=1");
    if (!response.ok) throw new Error("Health check failed");
    const h = await response.json();
    const st = $("aiStatus");
    if (h.practice) {
      st.className = "t-status warn"; st.textContent = "Scripted practice";
      $("aiHelp").textContent = "The chatbot is using scripted replies and keyword-based grading.";
      $("testBtn").hidden = true;
    } else {
      st.className = "t-status ok"; st.textContent = "AI connected";
      $("aiModel").textContent = `OpenAI · ${h.model}`;
      $("aiHelp").textContent = `Send a test message before class. The site has used ${h.requestsToday} of ${h.dailyLimit} AI requests today.`;
    }
  } catch { $("aiStatus").className = "t-status bad"; $("aiStatus").textContent = "Server not reachable"; }
}
$("testBtn").onclick = async () => {
  $("testOut").textContent = "Asking…"; $("testBtn").disabled = true;
  try {
    const response = await gameFetch("/api/test", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: healthClient }),
    });
    const h = await response.json();
    if (h.ok) { $("aiStatus").className = "t-status ok"; $("aiStatus").textContent = "AI working"; $("testOut").textContent = `“${h.reply}”`; }
    else { $("aiStatus").className = "t-status bad"; $("aiStatus").textContent = "AI not working"; $("testOut").textContent = h.error; }
  } catch { $("testOut").textContent = "Couldn't reach the server."; }
  $("testBtn").disabled = false;
};

// ---------- Setup ----------
const presetSel = $("topicPreset");
presetSel.innerHTML = TOPIC_PRESETS.map(t => `<option>${esc(t)}</option>`).join("") + `<option value="__custom">Write my own topic…</option>`;
$("minutes").value = DEFAULT_MINUTES;
const topicValue = () => presetSel.value === "__custom" ? $("topicCustom").value.trim() : presetSel.value;
function updateSoloLink() {
  const u = new URL(studentPage);
  u.searchParams.set("topic", topicValue() || TOPIC_PRESETS[0]);
  u.searchParams.set("minutes", $("minutes").value || DEFAULT_MINUTES);
  u.searchParams.set("mode", modeValue());
  $("soloLink").textContent = u.toString();
}
presetSel.onchange = () => { $("customWrap").hidden = presetSel.value !== "__custom"; updateSoloLink(); };
$("topicCustom").oninput = updateSoloLink; $("minutes").oninput = updateSoloLink;
document.querySelectorAll('input[name="mode"]').forEach(r => r.onchange = updateSoloLink);
$("copySolo").onclick = () => navigator.clipboard?.writeText($("soloLink").textContent).then(() => { $("copySolo").textContent = "Copied!"; setTimeout(() => $("copySolo").textContent = "Copy link", 1500); });
updateSoloLink();

$("createBtn").onclick = async () => {
  const topic = topicValue();
  if (!topic) { $("setupErr").textContent = "Type a topic first."; return; }
  $("setupErr").textContent = "";
  try {
    const res = await gameFetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, mode: modeValue(), minutes: Number($("minutes").value) || DEFAULT_MINUTES }) });
    const data = await res.json();
    if (!res.ok) { $("setupErr").textContent = data.error; return; }
    saved = { code: data.room.code, teacherKey: data.teacherKey };
    localStorage.setItem(KEY, JSON.stringify(saved));
    setRoom(data.room); startPolling();
    $("roomCard").scrollIntoView({ behavior: "smooth" });
  } catch { $("setupErr").textContent = "Couldn't reach the server."; }
};

// ---------- Room ----------
function teacherHeaders(game) {
  return { "X-Classroom-Teacher": game.teacherKey };
}
async function poll() {
  const game = saved;
  if (!game) return;
  try {
    const res = await gameFetch(`/api/rooms/${game.code}`, { cache: "no-store", headers: teacherHeaders(game) });
    if (saved !== game) return;
    if (res.status === 404 || res.status === 403) { clearRoom(); return; }
    if (res.ok) setRoom(await res.json());
  } catch {}
}
function startPolling() { clearInterval(pollTimer); poll(); pollTimer = setInterval(poll, 2000); }
function clearRoom() {
  saved = null;
  room = null;
  localStorage.removeItem(KEY);
  clearInterval(pollTimer);
  clearInterval(clockTimer);
  document.querySelector(".podium-wrap")?.remove();
  $("roomCard").hidden = true;
  $("setupCard").hidden = false;
}
async function setPhase(phase) {
  const game = saved;
  if (!game) return false;
  try {
    const res = await gameFetch(`/api/rooms/${game.code}/phase`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...teacherHeaders(game) },
      body: JSON.stringify({ phase }),
    });
    const data = await res.json();
    if (game !== saved) return false;
    if (!res.ok) { alert(data.error); return false; }
    setRoom(data);
    return true;
  } catch {
    alert("Couldn't reach the game. Try again.");
    return false;
  }
}
function setRoom(r) {
  room = r; offset = r.now - Date.now();
  $("roomCard").hidden = false; $("setupCard").hidden = true;
  $("roomCode").textContent = r.code;
  const join = new URL(studentPage); join.searchParams.set("room", r.code);
  $("joinUrl").textContent = join.toString();
  $("roomTopic").innerHTML = `<strong>Topic:</strong> ${esc(r.topic)} · <strong>${r.minutes} min</strong> per round · <strong>${r.mode === "solo" ? "🎧 Solo" : "🔄 Partner swap"}</strong>`;
  const idx = PHASES.indexOf(r.phase);
  $("phases").innerHTML = PHASES.map((p, i) => `<span class="phase ${i < idx ? "done" : i === idx ? "now" : ""}">${PHASE_LABEL[p]}</span>`).join("");
  const [label, , help] = NEXT[r.phase];
  $("nextPhase").textContent = label; $("phaseHelp").textContent = help;
  $("backPhase").disabled = idx === 0;
  renderRoster(); runClock();
  if (document.querySelector(".podium-wrap")) showCrown();
}
function runClock() {
  clearInterval(clockTimer); $("roundClock").textContent = "";
  const n = room.phase === "round1" ? 1 : room.phase === "round2" ? 2 : 0;
  if (!n || !room.roundStart[n]) return;
  const upd = () => {
    const left = Math.max(0, Math.ceil(room.minutes * 60 - (Date.now() + offset - room.roundStart[n]) / 1000));
    $("roundClock").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    $("roundClock").style.color = left <= 30 ? "#c2260c" : "";
  };
  upd(); clockTimer = setInterval(upd, 500);
}
function renderRoster() {
  const players = [...room.players].sort((a, b) => (b.scores["2"] ?? -999) - (a.scores["2"] ?? -999) || (b.scores["1"] ?? -999) - (a.scores["1"] ?? -999));
  $("playerCount").textContent = players.length ? `(${players.length})` : "";
  if (!players.length) { $("roster").innerHTML = `<tr><td colspan="6" style="color:var(--muted)">No one has joined yet.</td></tr>`; return; }
  const cell = v => v === undefined ? `<td class="num" style="color:#aaa">–</td>` : `<td class="num ${v > 0 ? "pos" : v < 0 ? "neg" : ""}">${fmtPts(v)}</td>`;
  $("roster").innerHTML = players.map(p => {
    const r1 = p.scores["1"], r2 = p.scores["2"];
    const ch = r1 !== undefined && r2 !== undefined ? r2 - r1 : undefined;
    const lv = LEVEL[p.level];
    return `<tr><td><strong>${esc(p.name)}</strong></td><td style="color:var(--muted)">${esc(p.status)}</td>${cell(r1)}${cell(r2)}${cell(ch)}<td>${lv ? `${lv.badge} ${esc(lv.name)}` : `<span style="color:#aaa">–</span>`}</td></tr>`;
  }).join("");
}
$("nextPhase").onclick = () => {
  const [, next] = NEXT[room.phase];
  if (room.phase === "crown") return showCrown();
  if (next === "crown") { setPhase("crown").then(ok => { if (ok) showCrown(); }); return; }
  setPhase(next);
};
$("backPhase").onclick = () => { const i = PHASES.indexOf(room.phase); if (i > 0 && confirm(`Go back to "${PHASE_LABEL[PHASES[i - 1]]}"?`)) setPhase(PHASES[i - 1]); };
$("endBtn").onclick = async () => {
  const game = saved;
  if (!game || !confirm("End this game and clear its roster and scores?")) return;
  try {
    const res = await gameFetch(`/api/rooms/${game.code}`, { method: "DELETE", headers: teacherHeaders(game) });
    if (game !== saved) return;
    if (res.ok || res.status === 404) clearRoom();
    else alert("The game couldn't be ended. Try again.");
  } catch {
    alert("Couldn't reach the game. Try again.");
  }
};
$("crownBtn").onclick = showCrown;

// ---------- Crown screen ----------
function showCrown() {
  document.querySelector(".podium-wrap")?.remove();
  const players = room.players.map(p => {
    const rounds = Object.keys(p.scores).map(Number);
    const latest = rounds.length ? p.scores[String(Math.max(...rounds))] : undefined;
    return { ...p, latest, comeback: p.scores["1"] !== undefined && p.scores["2"] !== undefined ? p.scores["2"] - p.scores["1"] : undefined };
  });
  const ranked = players.filter(p => p.latest !== undefined).sort((a, b) => b.latest - a.latest);
  const comeback = players.filter(p => p.comeback !== undefined).sort((a, b) => b.comeback - a.comeback)[0];
  const spot = (p, cls, medal) => p ? `<div class="spot ${cls}"><div class="medal">${medal}</div><div class="block"><div class="nm">${esc(p.name)}</div><div class="sc">${fmtPts(p.latest)}</div>${LEVEL[p.level] ? `<div class="lv">${LEVEL[p.level].badge} ${esc(LEVEL[p.level].name)}</div>` : ""}</div></div>` : "";
  const levelCounts = LEVELS.slice().reverse().map(l => [l, players.filter(p => p.level === l.id).length]).filter(([, n]) => n);
  const avg = k => { const v = players.map(p => p.scores[k]).filter(x => x !== undefined); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : undefined; };
  const a1 = avg("1"), a2 = avg("2");
  const el = document.createElement("div");
  el.className = "podium-wrap stage yellow";
  el.innerHTML = `
    <p class="kicker">Write with AI</p>
    <h1 class="big" style="font-size:clamp(40px,7vw,84px)">${ranked.length ? "And the crown goes to…" : "No scores yet"}</h1>
    <div class="podium">${spot(ranked[1], "second", "🥈")}${spot(ranked[0], "first", "👑")}${spot(ranked[2], "third", "🥉")}</div>
    <div>
      ${comeback && comeback.comeback > 0 ? `<div class="mvp">🚀 Biggest comeback: <b>${esc(comeback.name)}</b> (${fmtPts(comeback.comeback)})</div>` : ""}
      ${a1 !== undefined && a2 !== undefined ? `<div class="mvp">📈 Class average: <b>${fmtPts(a1)}</b> → <b>${fmtPts(a2)}</b></div>` : ""}
    </div>
    ${levelCounts.length ? `<div style="margin-top:8px">${levelCounts.map(([l, n]) => `<div class="mvp">${l.badge} <b>${n}</b> ${esc(l.name)}${l.id === "license" || l.id === "permit" ? (n === 1 ? "" : "s") : ""}</div>`).join("")}</div>` : ""}
    <h2 class="mid" style="margin-top:26px;font-size:clamp(26px,3.6vw,40px)">Write <em>with</em> AI, not <span class="hl pink">by</span> AI.</h2>
    <button class="btn white small" style="margin-top:20px" id="closeCrown">Close</button>`;
  document.body.appendChild(el);
  el.querySelector("#closeCrown").onclick = () => el.remove();
}

checkHealth();
if (saved) startPolling();
