/* Content for every room in the basement. Edit text and links here. */

export const SITE = {
  name: "Vince Doud",
  headline: "Teacher + Creator",
  email: "vinceandrewdoud@gmail.com",
  youtube: "https://www.youtube.com/@diddypopdiddy",
  bandcamp: "https://diddypopdiddy.bandcamp.com/",
};

/** Each space in the house: what it's called, what the room label says, and where it goes. */
export const SPACES = {
  art:      { label: "Art",      verb: "walk the gallery",     blurb: "A two-room gallery of thirteen pieces. Walk it, or browse the walls." },
  music:    { label: "Music",    verb: "listen",               blurb: "Ten albums, ninety-one tracks, one click wheel." },
  video:    { label: "Video",    verb: "watch",                blurb: "Sixty-six recordings on the TV/VCR. Pick a tape and press play." },
  teaching: { label: "Teaching", verb: "pull a book",          blurb: "Pull a book off the shelf: classroom tools and the projects behind them." },
  ai:       { label: "AI",       verb: "open the laptop",      blurb: "AI tools and custom builds, opened like apps on the laptop." },
  about:    { label: "About",    verb: "meet Vince",           blurb: "Check the ID. Who Vince is and what he makes." },
  contact:  { label: "Contact",  verb: "use the payphone",     blurb: "The basement payphone. The email’s on the sticker." },
};
export const ORDER = ["art", "music", "video", "teaching", "ai", "about", "contact"];

const PLAYBOOK = "https://ai-educator-playbook-vince-doud.diddypopdiddy.chatgpt.site";
const ROADTEST = "https://ai-road-test-vince-doud.diddypopdiddy.chatgpt.site/";
const WRITE = "https://write-with-ai-vince-doud.diddypopdiddy.chatgpt.site";

/** Books on the teaching shelf (left to right). */
export const BOOKS = [
  {
    id: "ai-educator-playbook",
    art: "book-plain-brick", color: "#a3301f",
    spine: "AI Educator Playbook",
    title: "AI Educator Playbook",
    kind: "Educator resource",
    summary: "A practical guide to teaching and learning with AI: the AI Production Framework, the Field Guide and classroom examples for deciding where AI belongs and what the learner still needs to do.",
    href: PLAYBOOK,
    action: "Open the Playbook",
  },
  {
    id: "moving-image",
    art: "book-plain-teal", color: "#176a6d",
    spine: "The Moving Image",
    title: "The Moving Image",
    kind: "Interactive textbook · In development",
    summary: "An interactive video-production textbook: computer and file foundations, film history, camera language, editing, lighting and sound, all carried into a real production project.",
    href: null,
    note: "A new edition is in development. The public release is coming soon.",
  },
  {
    id: "ai-road-test",
    art: "book-plain-ochre", color: "#c98a1e",
    spine: "The AI Road Test",
    title: "The AI Road Test",
    kind: "Interactive driving game",
    summary: "Drive the neighborhood, pull into question stops and work through choices about prompting, privacy, ethics and verification before heading back to the testing center.",
    href: ROADTEST,
    action: "Play the game",
  },
  {
    id: "write-with-ai",
    art: "book-plain-forest", color: "#3a5f31",
    spine: "Write with AI",
    title: "Write with AI",
    kind: "Writing activity · Work in progress",
    summary: "A two-round writing activity for examining how AI changes your work. Write, review the conversation, discuss authorship, then try again and compare.",
    href: WRITE,
    action: "Open the activity",
  },
];

/** Apps on the laptop. */
export const APPS = [
  {
    id: "ai-educator-playbook", name: "Playbook", title: "AI Educator Playbook", icon: "ai-educator-playbook.svg",
    preview: "ai-educator-playbook-2026-09-27.png", kind: "Educator resource", color: "#647d69",
    summary: "A practical guide to teaching and learning with AI. The Framework, the Field Guide and classroom examples in one place.",
    href: PLAYBOOK, action: "Open the Playbook",
  },
  {
    id: "ai-road-test", name: "Road Test", title: "The AI Road Test", icon: "ai-road-test.svg",
    preview: "ai-road-test-2026-09-27.png", kind: "Interactive driving game", color: "#b86e4b",
    summary: "A driving game about AI decisions: question stops, fuel, permit stamps and a run back to the testing center.",
    href: ROADTEST, action: "Play the game",
  },
  {
    id: "write-with-ai", name: "Write with AI", title: "Write with AI", icon: "write-with-ai.svg",
    preview: "write-with-ai-2026-09-27.png", kind: "Writing activity · Work in progress", color: "#7c758e",
    summary: "Two rounds of writing with AI, then compare the thinking and revision you did yourself in each.",
    href: WRITE, action: "Open the activity", note: "Live AI responses are still being prepared.",
  },
  {
    id: "sk8maps", name: "SK8MAPS", title: "SK8MAPS", icon: "sk8maps.svg",
    video: { src: "sk8maps-interface.mp4", poster: "sk8maps-interface-poster.png" }, kind: "Private teaching workspace", color: "#698071",
    summary: "My teaching workspace for keeping the plan connected to the school day: calendars, daily lessons, class views and a resource library, built with Codex.",
    note: "Built for my classroom. The reel shows approved planning views; the workspace itself stays private.",
  },
  {
    id: "dry-eye-clinical-support", name: "Clinical", title: "Dry Eye Clinical Decision Support", icon: "dry-eye-clinical-support.svg",
    preview: "premier-eye-clinical-platform.png", kind: "Custom build · Staff access required", color: "#6d8588",
    summary: "De-identified clinical decision support built around deterministic rules, doctor review and staff voice practice.",
    href: "https://premier-eye-clinical-platform.diddypopdiddy.chatgpt.site", action: "Staff sign-in",
  },
  {
    id: "jmcd-hair-extension-preview", name: "JMCD Studio", title: "JMCD Hair Extension Preview Studio", icon: "jmcd-hair-extension-preview.svg",
    kind: "Custom build · Public prototype", color: "#967b79",
    summary: "A custom image-editing tool for previewing hair-extension length, fullness, finish and color while keeping the person’s identity and changing only their hair.",
    href: "https://jmcd-extension-preview.diddypopdiddy.chatgpt.site", action: "Open the studio",
  },
];

export const ABOUT = {
  name: "Vince Doud",
  portrait: "assets/media/portrait.jpg",
  bio: ["I teach video production, make things, and build tools for my classroom."],
  endorsements: ["Music", "Video", "Art", "Teaching", "AI"],
};
