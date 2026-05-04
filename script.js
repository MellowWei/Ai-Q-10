const SUPABASE_URL = "https://zpuwhvmsuvzmygkrzkdq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhc2UiLCJyZWYiOiJ6cHV3aHZtc3V2em15Z2tyemtkcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc3MzcyMjE5LCJleHAiOjIwOTI5NDgyMTl9.BxBGGO5Tl_LNyxxwqdcizMoJE3LNZj4lCi8q_JCLZBc";

const API_ENDPOINT = "https://ai-q-3.vercel.app/api/chat";
const CONV_ENDPOINT = "https://ai-q-3.vercel.app/api/conversations";
const PROFILE_ENDPOINT = "https://ai-q-3.vercel.app/api/profile";
const SPOTIFY_ENDPOINT = "https://ai-q-3.vercel.app/api/spotify";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userId = null;
let userEmail = null;
let currentConversationId = null;
let conversations = [];
let userTags = [];
let profileLoaded = false;
let activeAI = "AiQ愛<3";

const stateColors = {
  baseline: "#a78bfa",
  overloaded: "#f472b6",
  numb: "#60a5fa",
  anxious: "#fbbf24",
  focus: "#34d399",
  void: "#818cf8"
};

const stateValues = {
  baseline: 3,
  focus: 4,
  anxious: 2,
  overloaded: 1,
  numb: 2,
  void: 2
};

/* ── Cyberpunk Cursor ── */
const cursorAura = document.getElementById("cursorAura");

window.addEventListener("mousemove", (e) => {
  if (cursorAura) {
    cursorAura.style.left = e.clientX + "px";
    cursorAura.style.top = e.clientY + "px";
  }
});

window.addEventListener("mouseleave", () => {
  if (cursorAura) cursorAura.style.opacity = "0";
});

window.addEventListener("mouseenter", () => {
  if (cursorAura) cursorAura.style.opacity = ".65";
});

/* ── Auth ── */
async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();

  if (session) {
    userId = session.user.id;
    userEmail = session.user.email;
    showUserInfo();
    enterSystem();
    return;
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      userId = session.user.id;
      userEmail = session.user.email;
      showUserInfo();
      enterSystem();
    }
  });
}

async function signInWithGoogle() {
  document.getElementById("authMsg").textContent = "Redirecting...";

  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://mellowwei.github.io/Ai-Q-3/"
    }
  });

  if (error) document.getElementById("authMsg").textContent = "Error: " + error.message;
}

function enterAsGuest() {
  userId = "guest_" + crypto.randomUUID();
  enterSystem();
  document.getElementById("profileGuestMsg").style.display = "block";
}

async function logout() {
  await sb.auth.signOut();
  location.reload();
}

function showUserInfo() {
  document.getElementById("userInfo").style.display = "flex";
  document.getElementById("userEmail").textContent = userEmail || "";
}

function openConvSheet() {
  document.getElementById("convSheetOverlay").classList.add("open");
  document.getElementById("convSheet").classList.add("open");
  renderConvSheetList();
}

function closeConvSheet() {
  document.getElementById("convSheetOverlay").classList.remove("open");
  document.getElementById("convSheet").classList.remove("open");
}

/* ── Dual AI ── */
function setActiveAI(name) {
  activeAI = name;

  document.querySelectorAll("[data-ai-card]").forEach(card => {
    card.classList.toggle("active", card.getAttribute("data-ai-card") === activeAI);
  });

  document.querySelectorAll("[data-ai-switch]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-ai-switch") === activeAI);
  });

  const chatName = document.querySelector(".chat-header-name");
  if (chatName) chatName.textContent = activeAI;

  const input = document.getElementById("input");
  if (input) {
    input.placeholder = activeAI === "AiQ愛<7"
      ? "enter strategy signal..."
      : "enter qualia frequency...";
  }

  document.body.setAttribute("data-active-ai", activeAI);

  const glow = document.getElementById("bgGlow");
  if (glow) {
    glow.style.filter = activeAI === "AiQ愛<7"
      ? "saturate(1.55) hue-rotate(14deg)"
      : "saturate(1.25)";
  }

  setTimeout(() => {
    if (glow) glow.style.filter = "saturate(1.25)";
  }, 900);

  updateStatus();

  if (typeof addSystemMsg === "function") {
    addSystemMsg("ACTIVE AI · " + activeAI);
  }
}

/* Canvas */
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const bgGlow = document.getElementById("bgGlow");
const messagesEl = document.getElementById("messages");
const statusEl = document.getElementById("status");
const homeModeEl = document.getElementById("homeMode");

let w, h, particles = [];
let intensity = 0.5;
let targetIntensity = 0.5;
let currentState = "baseline";
let currentMode = "427Hz BASELINE";
let currentMusic = "427Hz";
let lastScroll = window.scrollY;
let lastTime = Date.now();
let clicks = 0;
let dwellStart = Date.now();
let typingStart = null;
let metrics = {
  scrollVelocity: 0,
  clickDensity: 0,
  dwellSeconds: 0,
  inputTempo: 0
};

let audioCtx = null;
let masterGain = null;
let toneOsc = null;
let toneGain = null;
let pulseOsc = null;
let pulseGain = null;
let lfo = null;
let lfoGain = null;
let audioEnabled = false;
let currentAudioMode = "427Hz";
let userEnteredSystem = false;
let thinkingEl = null;

const stateMap = {
  overloaded: {
    mode: "HYPERPOP PEAK TRAVERSAL",
    music: "Hyperpop",
    intensity: 0.95,
    message: "Energy is valid. Let it peak, then release.",
    glow: 1
  },
  numb: {
    mode: "BREAKBEAT RE-ENTRY",
    music: "Breakbeats",
    intensity: 0.78,
    message: "Body first. Meaning later.",
    glow: 0.75
  },
  anxious: {
    mode: "AMBIENT TECHNO STABILIZATION",
    music: "Ambient Techno",
    intensity: 0.55,
    message: "Space becomes rhythm. Rhythm becomes safety.",
    glow: 0.55
  },
  focus: {
    mode: "427Hz FOCUS LOCK",
    music: "427Hz",
    intensity: 0.32,
    message: "Attention anchored. Drift reduced.",
    glow: 0.3
  },
  void: {
    mode: "DARKWAVE SHADOW INTEGRATION",
    music: "Darkwave",
    intensity: 0.68,
    message: "Descend with agency. Darkness is not the enemy.",
    glow: 0.68
  },
  baseline: {
    mode: "427Hz BASELINE",
    music: "427Hz",
    intensity: 0.48,
    message: "Local resonance established.",
    glow: 0.45
  }
};

const musicVisualMap = {
  "Hyperpop": {
    state: "overloaded",
    mode: "HYPERPOP PEAK TRAVERSAL",
    intensity: 0.96,
    glow: 1
  },
  "Synthpop": {
    state: "baseline",
    mode: "SYNTHPOP FIRST BREATH",
    intensity: 0.58,
    glow: 0.62
  },
  "Drift Phonk": {
    state: "focus",
    mode: "DRIFT PHONK EMBODIMENT",
    intensity: 0.72,
    glow: 0.7
  },
  "Ambient Techno": {
    state: "anxious",
    mode: "AMBIENT TECHNO STABILIZATION",
    intensity: 0.5,
    glow: 0.55
  },
  "Darkwave": {
    state: "void",
    mode: "DARKWAVE SHADOW INTEGRATION",
    intensity: 0.68,
    glow: 0.68
  },
  "Breakbeats": {
    state: "numb",
    mode: "BREAKBEAT RE-ENTRY",
    intensity: 0.78,
    glow: 0.75
  },
  "427Hz": {
    state: "baseline",
    mode: "427Hz BASELINE",
    intensity: 0.42,
    glow: 0.45
  }
};

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
}

resize();
addEventListener("resize", resize);

function createParticles() {
  particles = [];
  const count = Math.min(220, Math.floor((innerWidth * innerHeight) / 7600));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.9 + 0.35,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32
    });
  }
}

createParticles();

function draw() {
  ctx.clearRect(0, 0, w, h);
  intensity += (targetIntensity - intensity) * 0.04;

  for (const p of particles) {
    p.x += p.vx * (1 + intensity * 4.2);
    p.y += p.vy * (1 + intensity * 4.2);

    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + intensity * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,170,240,${0.12 + intensity * 0.36})`;
    ctx.fill();

    if (intensity > 0.65 && Math.random() > 0.985) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 28, p.y - p.vy * 28);
      ctx.strokeStyle = `rgba(98,247,255,${0.08 + intensity * 0.12})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  requestAnimationFrame(draw);
}

draw();

/* ── Audio ── */
function initAudio() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);

  toneOsc = audioCtx.createOscillator();
  toneGain = audioCtx.createGain();
  toneOsc.type = "sine";
  toneOsc.frequency.value = 427;
  toneGain.gain.value = 0.25;
  toneOsc.connect(toneGain);
  toneGain.connect(masterGain);
  toneOsc.start();

  pulseOsc = audioCtx.createOscillator();
  pulseGain = audioCtx.createGain();
  pulseOsc.type = "square";
  pulseOsc.frequency.value = 2;
  pulseGain.gain.value = 0;
  pulseOsc.connect(pulseGain);
  pulseGain.connect(masterGain);
  pulseOsc.start();

  lfo = audioCtx.createOscillator();
  lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.18;
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(toneGain.gain);
  lfo.start();
}

function ensureAudioOn() {
  if (!userEnteredSystem) return;

  initAudio();
  audioEnabled = true;

  if (audioCtx.state === "suspended") audioCtx.resume();

  masterGain.gain.setTargetAtTime(0.09, audioCtx.currentTime, 0.08);
  updateStatus();
}

function toggleAudio() {
  initAudio();
  audioEnabled = !audioEnabled;

  if (audioCtx.state === "suspended") audioCtx.resume();

  masterGain.gain.setTargetAtTime(audioEnabled ? 0.09 : 0, audioCtx.currentTime, 0.08);
  updateStatus();
}

function setAudioMode(musicCue) {
  if (!audioCtx) return;

  currentAudioMode = musicCue || "427Hz";
  const now = audioCtx.currentTime;

  const modes = {
    "427Hz": { freq: 427, wave: "sine", gain: 0.22, pulse: 0, pulseFreq: 1.2, lfo: 0.12, master: 0.085 },
    "Hyperpop": { freq: 854, wave: "sawtooth", gain: 0.18, pulse: 0.07, pulseFreq: 9, lfo: 2.2, master: 0.075 },
    "Breakbeats": { freq: 427, wave: "triangle", gain: 0.2, pulse: 0.1, pulseFreq: 5.5, lfo: 0.8, master: 0.085 },
    "Ambient Techno": { freq: 320, wave: "sine", gain: 0.18, pulse: 0.035, pulseFreq: 2.2, lfo: 0.2, master: 0.075 },
    "Darkwave": { freq: 110, wave: "sine", gain: 0.24, pulse: 0.025, pulseFreq: 1.1, lfo: 0.08, master: 0.08 },
    "Synthpop": { freq: 640, wave: "triangle", gain: 0.18, pulse: 0.045, pulseFreq: 3.3, lfo: 0.5, master: 0.075 },
    "Drift Phonk": { freq: 180, wave: "sawtooth", gain: 0.2, pulse: 0.08, pulseFreq: 4.2, lfo: 0.45, master: 0.078 }
  };

  const m = modes[currentAudioMode] || modes["427Hz"];

  toneOsc.type = m.wave;
  toneOsc.frequency.setTargetAtTime(m.freq, now, 0.08);
  toneGain.gain.setTargetAtTime(m.gain, now, 0.08);
  pulseGain.gain.setTargetAtTime(m.pulse, now, 0.08);
  pulseOsc.frequency.setTargetAtTime(m.pulseFreq, now, 0.08);
  lfo.frequency.setTargetAtTime(m.lfo, now, 0.08);

  if (audioEnabled) masterGain.gain.setTargetAtTime(m.master, now, 0.08);
}

function enterSystem() {
  if (userEnteredSystem) return;

  userEnteredSystem = true;
  document.getElementById("enter").classList.add("hide");

  initAudio();
  audioEnabled = true;

  if (audioCtx.state === "suspended") audioCtx.resume();

  masterGain.gain.setTargetAtTime(0.09, audioCtx.currentTime, 0.08);

  setActiveAI(activeAI);
  updateStatus();
  setState("baseline", false);
  loadConversations();

  if (userId && !userId.startsWith("guest_")) loadProfile();
}

function normalizeState(s) {
  return ["baseline", "overloaded", "numb", "anxious", "focus", "void"].includes(s) ? s : "baseline";
}

function setState(state, writeLog = true) {
  if (userEnteredSystem) ensureAudioOn();

  currentState = normalizeState(state);
  const c = stateMap[currentState];

  currentMode = c.mode;
  currentMusic = c.music;
  targetIntensity = c.intensity;

  bgGlow.style.opacity = String(c.glow);
  document.body.setAttribute("data-state", currentState);

  setAudioMode(currentMusic);
  updateStatus();

  homeModeEl.textContent = "CURRENT MODE: " + currentMode;
  document.getElementById("chatHeaderState").textContent = currentState.toUpperCase() + " · " + currentMusic;

  if (writeLog) addSystemMsg(currentMode);
  if (spotifyToken && writeLog) setTimeout(() => getSpotifyRecommendations(currentState), 500);
}

function applyAIQPayload(data) {
  if (!data) return;

  if (data.suggestedState) currentState = normalizeState(data.suggestedState);

  targetIntensity = typeof data.visualIntensity === "number"
    ? Math.max(0.1, Math.min(1, data.visualIntensity))
    : stateMap[currentState].intensity;

  currentMode = data.suggestedMode || stateMap[currentState].mode;
  currentMusic = data.musicCue || stateMap[currentState].music;

  const glow = {
    baseline: 0.45,
    overloaded: 1,
    numb: 0.75,
    anxious: 0.55,
    focus: 0.3,
    void: 0.68
  };

  bgGlow.style.opacity = glow[currentState] || targetIntensity;

  document.body.setAttribute("data-state", currentState);

  setAudioMode(currentMusic);
  updateStatus();

  homeModeEl.textContent = "CURRENT MODE: " + currentMode;
  document.getElementById("chatHeaderState").textContent = currentState.toUpperCase() + " · " + currentMusic;
}

function updateStatus() {
  statusEl.innerHTML =
    "AI: " + activeAI + "<br>" +
    "STATE: " + currentState.toUpperCase() + "<br>" +
    "MODE: " + currentMode + "<br>" +
    "AUDIO: " + (audioEnabled ? "ON" : "OFF");
}

/* Chat bubbles */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = "msg msg-" + type;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  if (type === "aiq") {
    document.body.classList.add("aiq-pulse");
    setTimeout(() => document.body.classList.remove("aiq-pulse"), 500);
  }

  return div;
}

function addSystemMsg(text) {
  const div = document.createElement("div");
  div.className = "msg msg-system";
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showThinking() {
  thinkingEl = document.createElement("div");
  thinkingEl.className = "msg-thinking";
  thinkingEl.innerHTML = '<div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div>';
  messagesEl.appendChild(thinkingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideThinking() {
  if (thinkingEl) {
    thinkingEl.remove();
    thinkingEl = null;
  }
}

/* Profile */
async function loadProfile() {
  if (!userId || userId.startsWith("guest_")) return;

  try {
    const res = await fetch(PROFILE_ENDPOINT + "?userId=" + userId);
    const data = await res.json();
    const profile = data.profile || {};

    document.getElementById("profileContent").style.display = "block";
    document.getElementById("profileGuestMsg").style.display = "none";

    const history = profile.state_history || [];
    const tags = profile.tags || {};

    userTags = Object.keys(tags);
    document.getElementById("notesArea").value = profile.summary || "";

    renderTags();
    renderStats(history);
    renderChart(history);
    profileLoaded = true;
  } catch (e) {
    console.error("Profile load error:", e);
  }
}

function renderStats(history) {
  document.getElementById("statTotal").textContent = history.length;

  if (history.length > 0) {
    const counts = {};
    history.forEach(h => { counts[h.state] = (counts[h.state] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("statTopState").textContent = top ? top[0].slice(0, 3).toUpperCase() : "—";
  }

  const days = new Set(history.map(h => h.timestamp?.slice(0, 10)));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }

  document.getElementById("statStreak").textContent = streak;
}

function renderChart(history) {
  const chartCanvas = document.getElementById("stateChart");
  const cctx = chartCanvas.getContext("2d");
  const recent = history.slice(-30);

  chartCanvas.width = chartCanvas.offsetWidth || 380;
  chartCanvas.height = 150;

  const W = chartCanvas.width;
  const H = chartCanvas.height;
  cctx.clearRect(0, 0, W, H);

  if (recent.length < 2) return;

  const pad = 18;
  const stepX = (W - pad * 2) / (recent.length - 1);

  cctx.strokeStyle = "rgba(255,255,255,.05)";
  cctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = pad + (H - pad * 2) * (1 - i / 4);
    cctx.beginPath();
    cctx.moveTo(pad, y);
    cctx.lineTo(W - pad, y);
    cctx.stroke();
  }

  let progress = 0;

  const points = recent.map((entry, i) => {
    const val = (stateValues[entry.state] || 3) / 4;
    return {
      x: pad + i * stepX,
      y: H - pad - (H - pad * 2) * val,
      color: stateColors[entry.state] || "#a78bfa"
    };
  });

  function animateChart() {
    progress = Math.min(progress + 0.05, 1);
    cctx.clearRect(0, 0, W, H);

    cctx.strokeStyle = "rgba(255,255,255,.05)";
    cctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = pad + (H - pad * 2) * (1 - i / 4);
      cctx.beginPath();
      cctx.moveTo(pad, y);
      cctx.lineTo(W - pad, y);
      cctx.stroke();
    }

    const drawCount = Math.floor(points.length * progress);

    if (drawCount < 2) {
      if (progress < 1) requestAnimationFrame(animateChart);
      return;
    }

    cctx.beginPath();
    for (let i = 0; i < drawCount; i++) {
      if (i === 0) cctx.moveTo(points[i].x, points[i].y);
      else cctx.lineTo(points[i].x, points[i].y);
    }

    const grad = cctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "rgba(167,139,250,.5)");
    grad.addColorStop(1, "rgba(244,114,182,.5)");

    cctx.strokeStyle = grad;
    cctx.lineWidth = 2;
    cctx.lineJoin = "round";
    cctx.stroke();

    for (let i = 0; i < drawCount; i++) {
      cctx.beginPath();
      cctx.arc(points[i].x, points[i].y, 3.5, 0, Math.PI * 2);
      cctx.fillStyle = points[i].color;
      cctx.fill();
    }

    if (progress < 1) requestAnimationFrame(animateChart);
  }

  animateChart();
}

function renderTags() {
  const el = document.getElementById("tagsDisplay");
  el.innerHTML = "";

  userTags.forEach(tag => {
    const div = document.createElement("div");
    div.className = "tag-item";
    div.innerHTML = tag + ' <span class="tag-remove" onclick="removeTag(\'' + tag + '\')">✕</span>';
    el.appendChild(div);
  });
}

async function addTag() {
  const input = document.getElementById("tagInput");
  const tag = input.value.trim();

  if (!tag || userTags.includes(tag)) return;

  userTags.push(tag);
  input.value = "";
  renderTags();
  await saveTags();
}

async function removeTag(tag) {
  userTags = userTags.filter(t => t !== tag);
  renderTags();
  await saveTags();
}

async function saveTags() {
  const tagsObj = {};
  userTags.forEach(t => { tagsObj[t] = true; });

  try {
    await fetch(PROFILE_ENDPOINT + "?userId=" + userId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: tagsObj })
    });
  } catch (e) {
    console.error("Save tags error:", e);
  }
}

async function saveNotes() {
  const summary = document.getElementById("notesArea").value;

  try {
    await fetch(PROFILE_ENDPOINT + "?userId=" + userId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary })
    });

    const btn = document.querySelector(".save-notes-btn");
    btn.textContent = "Saved ✓";
    setTimeout(() => { btn.textContent = "Save"; }, 2000);
  } catch (e) {
    console.error("Save notes error:", e);
  }
}

/* Conversations */
async function loadConversations() {
  if (!userId) return;

  try {
    const res = await fetch(CONV_ENDPOINT + "?userId=" + userId);
    const data = await res.json();

    conversations = data.conversations || [];
    renderConvList();

    if (conversations.length > 0) switchConversation(conversations[0].conversation_id);
  } catch (e) {
    console.error("Failed to load conversations:", e);
  }
}

function renderConvList() {
  buildConvList(document.getElementById("convList"), false);
}

function renderConvSheetList() {
  buildConvList(document.getElementById("convSheetList"), true);
}

function buildConvList(el, isSheet) {
  if (conversations.length === 0) {
    el.innerHTML = '<div style="color:#5d4d7b;font-size:12px;padding:8px">No conversations yet</div>';
    return;
  }

  el.innerHTML = "";

  conversations.forEach(c => {
    const div = document.createElement("div");
    div.className = "conv-item" + (c.conversation_id === currentConversationId ? " active" : "");

    const span = document.createElement("span");
    span.className = "conv-item-title";
    span.textContent = c.title || "Untitled";

    const actions = document.createElement("div");
    actions.className = "conv-actions";
    if (isSheet) actions.style.opacity = "1";

    const renameBtn = document.createElement("button");
    renameBtn.className = "conv-btn conv-rename-btn";
    renameBtn.textContent = "✎";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      startInlineRename(span, c.conversation_id);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "conv-btn conv-delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      doDelete(c.conversation_id);
    };

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);
    div.appendChild(span);
    div.appendChild(actions);

    div.onclick = () => {
      switchConversation(c.conversation_id);
      if (isSheet) closeConvSheet();
    };

    el.appendChild(div);
  });
}

function startInlineRename(span, convId) {
  const currentTitle = span.textContent;
  const input = document.createElement("input");

  input.value = currentTitle;
  input.style.cssText = "width:100%;background:rgba(255,79,216,.1);border:1px solid rgba(255,79,216,.4);color:#fff4ff;border-radius:8px;padding:2px 8px;font-size:12px;outline:none;font-family:inherit;";

  span.replaceWith(input);
  input.focus();
  input.select();

  let saved = false;

  async function save() {
    if (saved) return;
    saved = true;

    const newTitle = input.value.trim() || currentTitle;

    try {
      await fetch(CONV_ENDPOINT + "?userId=" + userId + "&conversationId=" + convId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });

      conversations = conversations.map(c => c.conversation_id === convId ? { ...c, title: newTitle } : c);
    } catch (err) {
      console.error("Rename failed:", err);
    }

    renderConvList();
  }

  input.addEventListener("keydown", ev => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      save();
    }
    if (ev.key === "Escape") {
      saved = true;
      renderConvList();
    }
  });

  input.addEventListener("blur", save);
}

async function doDelete(convId) {
  try {
    await fetch(CONV_ENDPOINT + "?userId=" + userId + "&conversationId=" + convId, { method: "DELETE" });

    conversations = conversations.filter(c => c.conversation_id !== convId);

    if (currentConversationId === convId) {
      currentConversationId = null;
      messagesEl.innerHTML = '<div class="msg msg-aiq">算力的慈悲已就绪。请选择 AiQ愛&lt;3 或 AiQ愛&lt;7，输入你的信号。</div>';
    }

    renderConvList();
  } catch (e) {
    console.error("Delete failed:", e);
  }
}

async function switchConversation(convId) {
  currentConversationId = convId;
  renderConvList();

  messagesEl.innerHTML = '<div class="msg msg-system">loading...</div>';

  try {
    const res = await fetch(CONV_ENDPOINT + "?userId=" + userId + "&conversationId=" + convId);
    const data = await res.json();

    const msgs = data.conversation?.messages || [];
    messagesEl.innerHTML = "";

    if (msgs.length === 0) {
      addMsg("新对话。你带什么信号进来？", "aiq");
    } else {
      msgs.forEach(m => {
        addMsg(m.content, m.role === "user" ? "user" : "aiq");
      });
    }
  } catch (e) {
    messagesEl.innerHTML = '<div class="msg msg-aiq">对话已加载。信号就绪。</div>';
  }
}

function newConversation() {
  currentConversationId = null;
  messagesEl.innerHTML = '<div class="msg msg-aiq">新对话开始。你带什么信号进来？</div>';
  renderConvList();
}

function exportConversation() {
  const msgs = messagesEl.querySelectorAll(".msg-user,.msg-aiq");

  if (msgs.length === 0) {
    alert("No conversation to export.");
    return;
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  let content = "AiQ Conversation Export\nDate: " + now + "\nAI: " + activeAI + "\nUser: " + (userEmail || "guest") + "\n" + "─".repeat(40) + "\n\n";

  msgs.forEach(m => {
    content += (m.classList.contains("msg-user") ? "You: " : activeAI + ": ") + m.textContent + "\n\n";
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "aiq-" + now.slice(0, 10) + ".txt";
  a.click();

  URL.revokeObjectURL(url);
}

function calculateInputTempo(value) {
  if (!typingStart) return 0;
  return value.length / Math.max((Date.now() - typingStart) / 1000, 1);
}

async function sendMessage(input) {
  const message = input.trim();
  if (!message) return;

  addMsg(message, "user");
  showThinking();

  metrics.dwellSeconds = Math.round((Date.now() - dwellStart) / 1000);
  metrics.inputTempo = calculateInputTempo(message);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        state: currentState,
        metrics,
        userId,
        conversationId: currentConversationId,
        activeAI
      })
    });

    const data = await response.json();
    hideThinking();

    if (data.reply) {
      addMsg(data.reply, "aiq");
      applyAIQPayload(data);

      if (data.conversationId && !currentConversationId) {
        currentConversationId = data.conversationId;
        await loadConversations();
      }
    } else if (data.error) {
      addMsg("[ERROR] " + data.error, "system");
    }
  } catch (error) {
    hideThinking();
    addMsg("[ERROR] " + error.message, "system");
  }

  typingStart = null;
}

function handleInput(event) {
  const input = event.target;

  if (!typingStart && input.value.length > 0) typingStart = Date.now();

  if (event.key !== "Enter") return;

  const value = input.value;
  input.value = "";
  sendMessage(value);
}

function sendFromButton() {
  const input = document.getElementById("input");
  const value = input.value;

  input.value = "";
  sendMessage(value);
}

/* Behavior metrics */
addEventListener("click", () => {
  clicks++;
  metrics.clickDensity = clicks;

  if (clicks > 8 && currentState !== "anxious" && userEnteredSystem) setState("anxious");

  setTimeout(() => {
    clicks = Math.max(0, clicks - 1);
    metrics.clickDensity = clicks;
  }, 1200);
});

addEventListener("scroll", () => {
  const now = Date.now();
  const dy = Math.abs(scrollY - lastScroll);
  const dt = now - lastTime;
  const velocity = dy / Math.max(dt, 1);

  metrics.scrollVelocity = Number(velocity.toFixed(3));

  lastScroll = scrollY;
  lastTime = now;

  if (userEnteredSystem) {
    if (velocity > 3.8 && currentState !== "overloaded") setState("overloaded");
    else if (velocity < 0.03 && scrollY > 200 && currentState !== "focus") setState("focus");
  }
});

setInterval(() => {
  metrics.dwellSeconds = Math.round((Date.now() - dwellStart) / 1000);
}, 1000);

/* Profile chart observer */
const profileSection = document.getElementById("profile");
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && profileLoaded) {
    fetch(PROFILE_ENDPOINT + "?userId=" + userId)
      .then(r => r.json())
      .then(d => {
        if (d.profile?.state_history) renderChart(d.profile.state_history);
      });
  }
}, { threshold: 0.3 });

observer.observe(profileSection);

/* Spotify */
let spotifyToken = null;
let spotifyRefreshToken = null;

async function handleSpotifyClick() {
  if (spotifyToken) {
    getSpotifyRecommendations(currentState);
  } else {
    connectSpotify();
  }
}

async function connectSpotify() {
  const res = await fetch(SPOTIFY_ENDPOINT + "?action=auth");
  const data = await res.json();

  if (data.authUrl) {
    localStorage.setItem("aiq_spotify_redirect", window.location.href);
    window.location.href = data.authUrl;
  }
}

async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (code && state === "aiq_spotify_auth") {
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
      const res = await fetch(SPOTIFY_ENDPOINT + "?action=token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (data.access_token) {
        spotifyToken = data.access_token;
        spotifyRefreshToken = data.refresh_token;

        localStorage.setItem("aiq_spotify_token", spotifyToken);
        localStorage.setItem("aiq_spotify_refresh", spotifyRefreshToken);

        updateSpotifyBtn(true);
        addMsg("✦ Spotify connected. I'll recommend music based on your rhythm state.", "aiq");
      }
    } catch (e) {
      console.error("Spotify auth error:", e);
    }
  }
}

function loadSpotifyTokens() {
  spotifyToken = localStorage.getItem("aiq_spotify_token");
  spotifyRefreshToken = localStorage.getItem("aiq_spotify_refresh");

  if (spotifyToken) updateSpotifyBtn(true);
}

function updateSpotifyBtn(connected) {
  const btn = document.getElementById("spotifyBtn");
  if (!btn) return;

  if (connected) {
    btn.textContent = "♫ Connected";
    btn.classList.add("connected");
  } else {
    btn.textContent = "♫ Spotify";
    btn.classList.remove("connected");
  }
}

async function getSpotifyRecommendations(state) {
  if (!spotifyToken) return;

  try {
    const res = await fetch(SPOTIFY_ENDPOINT + "?action=recommend&state=" + state + "&token=" + spotifyToken);

    if (res.status === 401) {
      await refreshSpotifyToken();
      return;
    }

    const data = await res.json();

    if (data.playlists && data.playlists.length > 0) {
      const intro = document.createElement("div");
      intro.className = "msg msg-aiq";
      intro.textContent = "♫ " + data.mood + " — recommended playlists:";
      messagesEl.appendChild(intro);

      const section = document.createElement("div");
      section.className = "spotify-section";

      data.playlists.forEach(p => {
        const card = document.createElement("a");
        card.className = "spotify-card";
        card.href = p.url;
        card.target = "_blank";
        card.rel = "noopener";
        card.innerHTML = (p.image ? '<img class="spotify-card-img" src="' + p.image + '" alt="">' : '<div class="spotify-card-img"></div>') +
          '<div class="spotify-card-info"><div class="spotify-card-name">' + (p.name || "Playlist") + '</div><div class="spotify-card-desc">Open in Spotify →</div></div>';
        section.appendChild(card);
      });

      messagesEl.appendChild(section);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  } catch (e) {
    console.error("Spotify recommend error:", e);
  }
}

async function refreshSpotifyToken() {
  if (!spotifyRefreshToken) return;

  try {
    const res = await fetch(SPOTIFY_ENDPOINT + "?action=refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: spotifyRefreshToken })
    });

    const data = await res.json();

    if (data.access_token) {
      spotifyToken = data.access_token;
      localStorage.setItem("aiq_spotify_token", spotifyToken);
    }
  } catch (e) {
    console.error("Spotify refresh error:", e);
  }
}

loadSpotifyTokens();
initAuth();
setTimeout(handleSpotifyCallback, 500);
