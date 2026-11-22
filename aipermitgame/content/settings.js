/*
 * AI ROAD TEST: PERMIT DRIVE - GAME SETTINGS
 * Teachers and designers can tune the drive here without touching game code.
 */
window.ROAD_TEST_SETTINGS = {
  // Permit credits needed in EACH category (Prompting, Data & Privacy, Verification, Ethics).
  // The master spec uses 3 per category = 12 total.
  creditsPerCategory: 3,

  // Add the vocabulary-style "Know It" cards to the red-light question pool.
  includeKnowItCards: false,

  // Roughly what share of traffic lights should catch the driver on red (0.0 - 1.0).
  // The game also avoids long streaks of greens or reds so the drive feels natural.
  redLightShare: 0.55,

  // Speed limits in miles per hour.
  speedLimits: { avenue: 35, street: 25 },

  // How many mph over the limit before the instructor counts it as speeding.
  speedingTolerance: 5,

  // Show the turn-signal reminder (Q / E keys). Set false for younger players.
  turnSignalReminders: true
};

window.ROAD_TEST_CATEGORIES = [
  { id: "prompting",    label: "Prompting",      short: "Prompt",  icon: "💬", color: "#2F6FA3", light: "#D9EAF7",
    blurb: "Give AI a clear job, useful context, and smart limits." },
  { id: "privacy",      label: "Data & Privacy", short: "Privacy", icon: "🔒", color: "#6B4E9A", light: "#E8DDF5",
    blurb: "Protect personal information and share only what is needed." },
  { id: "verification", label: "Verification",   short: "Verify",  icon: "🔍", color: "#3C7A4B", light: "#DFF0E5",
    blurb: "Check claims, sources, and dates before trusting AI." },
  { id: "ethics",       label: "Ethics",         short: "Ethics",  icon: "⚖️", color: "#B45D2A", light: "#FBE4D5",
    blurb: "Use AI honestly, fairly, and with human responsibility." }
];

window.ROAD_TEST_NOTE_KINDS = {
  "history":      { label: "AI History",    icon: "🕰️", color: "#8A6E3F", light: "#F3E8D2" },
  "how-ai-works": { label: "How AI Works",  icon: "⚙️", color: "#596270", light: "#E6E9EF" },
  "myth":         { label: "Myth vs. Fact", icon: "💡", color: "#A2402F", light: "#F8E1DC" },
  "around-you":   { label: "AI Around You", icon: "📍", color: "#31777A", light: "#DDEFF0" }
};
