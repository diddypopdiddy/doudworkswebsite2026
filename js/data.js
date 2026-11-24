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
  video:    { label: "Video",    verb: "watch",                blurb: "Pick a scene and press play on the basement TV and DVD player." },
  teaching: { label: "Teaching", verb: "pull a book",          blurb: "Pull a book off the shelf: classroom tools and the projects behind them." },
  ai:       { label: "AI",       verb: "open the laptop",      blurb: "AI tools and custom builds, opened like apps on the laptop." },
  about:    { label: "About",    verb: "meet Vince",           blurb: "Check the ID. Who Vince is and what he makes." },
  skateboards: { label: "Skateboards", verb: "see the decks",     blurb: "The deck collection off the basement wall, one board at a time." },
  contact:  { label: "Contact",  verb: "use the payphone",     blurb: "The basement payphone. The email’s on the sticker." },
};
export const ORDER = ["art", "music", "video", "teaching", "ai", "about", "skateboards", "contact"];

// The teaching shelf and laptop use the same public project information.
const FRAMEWORK = {
  id: "ai-production-framework",
  title: "AI Production Framework and Pathway",
  kind: "Interactive framework tour",
  summary: "Explore AI Literacy, the Core Competencies and the five AI Modes, then see how students in grades 7–12 progress from the AI Permit to the AI Production License.",
  preview: "ai-framework-pathway-tour.webp",
  previewAlt: "The guided tour’s cream cover with the red AI Production Framework logo.",
  href: "/frameworkpathway/",
  sameTab: true,
  action: "Explore the Framework",
};

const PLAYBOOK = {
  id: "ai-educator-playbook",
  title: "AI Production Teacher Playbook",
  kind: "Free lesson preview",
  summary: "Teach the free AI Literacy lesson with its printable plan and quiz, then explore the seven-module Playbook outline.",
  preview: "ai-educator-playbook-modules.webp",
  previewAlt: "The Teacher Playbook preview with the new logo, AI Permit and AI License cards.",
  href: "/aiplaybook/",
  sameTab: true,
  action: "Open the Playbook",
};

const TEXTBOOK = {
  id: "video-production-textbook",
  title: "Video Production Textbook",
  kind: "Interactive textbook",
  summary: "Explore 126 topics across 12 parts. Practice with camera simulators, a live 3D production studio, and editing tools. Print guided notes for each topic.",
  preview: "video-production-textbook-2026-11-21.webp",
  previewAlt: "The Shot Sizes viewfinder shows a wide shot and the controls for reframing it.",
  href: "/textbook/",
  sameTab: true,
  action: "Open the textbook",
};

const ROADTEST = {
  id: "ai-road-test",
  title: "AI Road Test: Permit Drive",
  kind: "Interactive driving game",
  summary: "Drive through town with keyboard, touch or tilt steering. Answer AI questions at red lights, collect Road Notes at stop signs and earn 12 in-game permit credits.",
  preview: "ai-road-test-touch-and-tilt.webp",
  previewAlt: "A student-driver car by Maple Street with a minimap, speedometer and progress panel.",
  href: "/aipermitgame/",
  sameTab: true,
  action: "Start Permit Drive",
};

const WRITE = {
  id: "write-with-ai",
  title: "Write with AI",
  kind: "Classroom writing game",
  summary: "Write a paragraph with a chatbot in two rounds, then review the conversation and compare what you contributed. Play solo, with a partner or in a teacher-paced class.",
  preview: "write-with-ai-2026-11-21.webp",
  previewAlt: "Round 1 challenges the player to write one paragraph in five minutes using a chatbot.",
  href: "/writewithai/",
  sameTab: true,
  action: "Play Write with AI",
};

/** Teaching shelf books. Each id also names an image in assets/covers/. */
export const BOOKS = [
  {
    ...FRAMEWORK,
    art: "book-plain-ink-blue", color: "#182751", spine: "AI Framework",
    chapters: [
      { t: "AI Literacy and Core Competencies", n: 1 },
      { t: "The five AI Modes", n: 7 },
      { t: "From AI Permit to AI License", n: 15 },
      { t: "Classroom planning and safeguards", n: 23 },
    ],
  },
  {
    ...PLAYBOOK,
    coverAddress: "vincedoud.com/aiplaybook",
    emblem: "ai-educator-playbook.svg",
    chapters: [
      { t: "Teacher preparation and AI Literacy", n: 1 },
      { t: "The four AI Core Competencies", n: 2 },
      { t: "Guided practice and Mode rubrics", n: 3 },
      { t: "The License assessment and subject examples", n: 4 },
      { t: "Assignment permissions and concerns", n: 5 },
      { t: "Printable quizzes and classroom resources", n: 6 },
    ],
    art: "book-plain-brick", color: "#a3301f", spine: "Teacher Playbook",
  },
  {
    ...TEXTBOOK,
    id: "moving-image",
    coverAddress: "vincedoud.com/textbook",
    emblem: "moving-image.svg",
    chapters: [
      { t: "Get started and plan a project", n: 1 },
      { t: "Framing, lighting and sound", n: 11 },
      { t: "Continuity, coverage and shooting", n: 21 },
      { t: "Editing, graphics and captions", n: 31 },
      { t: "Finish and share", n: 41 },
    ],
    art: "book-plain-teal", color: "#176a6d", spine: "Video Textbook",
  },
  {
    ...ROADTEST,
    emblem: "ai-road-test.svg",
    chapters: [
      { t: "Start at the permit office", n: 1 },
      { t: "AI questions at red lights", n: 7 },
      { t: "Road Notes at stop signs", n: 15 },
      { t: "Six practice hours and 12 credits", n: 21 },
    ],
    art: "book-plain-ochre", color: "#c98a1e", spine: "The AI Road Test",
  },
  {
    ...WRITE,
    emblem: "write-with-ai.svg",
    chapters: [
      { t: "Choose how to play", n: 1 },
      { t: "Round 1 in five minutes", n: 3 },
      { t: "Review the conversation", n: 5 },
      { t: "Try again in Round 2", n: 13 },
      { t: "Compare what you contributed", n: 17 },
    ],
    art: "book-plain-forest", color: "#3a5f31", spine: "Write with AI",
  },
  {
    id: "ai-workbook",
    title: "AI Production Student Workbook",
    kind: "Interactive practice",
    summary: "Play the free Quiz Board and see how the full Workbook practices the Core Competencies and AI Modes.",
    href: "/aiworkbook/",
    sameTab: true,
    action: "Open the Workbook",
    art: "book-plain-plum", color: "#52365e", spine: "Student Workbook",
    coverAddress: "vincedoud.com/aiworkbook",
    emblem: "ai-workbook.svg",
    chapters: [
      { t: "AI Literacy: The Quiz Board", n: 1 },
      { t: "Core Competencies: Station Rotation", n: 2 },
      { t: "AI Modes: Final Boss", n: 3 },
    ],
  },
  {
    id: "rethink",
    title: "Rethink",
    kind: "Classroom creativity game",
    summary: "Roll a challenge, draw everyday objects and invent something new in 60 seconds. Pitch your idea to a judge who changes each round.",
    href: "/rethink/",
    sameTab: true,
    action: "Play Rethink",
    art: "book-plain-forest", color: "#15523f", spine: "Rethink",
    coverAddress: "vincedoud.com/rethink",
    emblem: "rethink.svg",
    chapters: [
      { t: "Set up 3 to 8 players", n: 1 },
      { t: "Roll the challenge die", n: 2 },
      { t: "Draw everyday objects", n: 3 },
      { t: "Invent in 60 seconds", n: 4 },
      { t: "Pitch and award a point", n: 5 },
    ],
  },
];

/** Apps on the laptop. */
export const APPS = [
  { ...FRAMEWORK, name: "AI Framework" },
  { ...PLAYBOOK, name: "Playbook" },
  { ...TEXTBOOK, name: "Video Textbook" },
  { ...ROADTEST, name: "Road Test" },
  { ...WRITE, name: "Write with AI" },
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
