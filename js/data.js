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

// The teaching shelf and laptop use the same public project information.
const FRAMEWORK = {
  id: "ai-production-framework",
  title: "AI Production Framework and Pathway",
  kind: "Interactive framework tour",
  summary: "Explore AI Literacy, the Core Competencies and the five AI Modes, then see how students in grades 7–12 progress from AI Permit to AI License.",
  preview: "ai-framework-pathway-2026-11-21.webp",
  previewAlt: "The Framework tour shows the guided practice and assessment stages from AI Permit to AI License.",
  href: "https://ai-framework-pathway.diddypopdiddy.chatgpt.site/",
  action: "Explore the Framework",
};

const PLAYBOOK = {
  id: "ai-educator-playbook",
  title: "AI Educator Playbook",
  kind: "Educator resource",
  summary: "A field guide for secondary educators. Start with the learning goal, choose the AI help that fits, and make students’ thinking and checks visible.",
  preview: "ai-educator-playbook-2026-11-21.webp",
  previewAlt: "The Playbook homepage introduces the Understand, Choose and Show routine.",
  href: "https://ai-educator-playbook-vince-doud.diddypopdiddy.chatgpt.site/",
  action: "Open the Playbook",
};

const TEXTBOOK = {
  id: "video-production-textbook",
  title: "Video Production Textbook",
  kind: "Interactive textbook",
  summary: "126 topics across 12 parts, from organizing files to sharing a finished film. Compare shots, try camera and editing tools, and print guided notes.",
  preview: "video-production-textbook-2026-11-21.webp",
  previewAlt: "The Shot Sizes viewfinder shows a wide shot and the controls for reframing it.",
  href: "https://video-production-textbook.diddypopdiddy.chatgpt.site/",
  action: "Open the textbook",
};

const ROADTEST = {
  id: "ai-road-test",
  title: "AI Road Test: Permit Drive",
  kind: "Interactive driving game",
  summary: "Drive through town, answer AI questions at red lights, and read Road Notes at stop signs. Earn 12 permit credits and log six in-game practice hours.",
  preview: "ai-road-test-2026-11-21.webp",
  previewAlt: "A car at the permit office with a town map, a speedometer and a panel tracking AI questions, hours and credits.",
  href: "https://ai-road-test-vince-doud.diddypopdiddy.chatgpt.site/",
  action: "Start Permit Drive",
};

const WRITE = {
  id: "write-with-ai",
  title: "Write with AI",
  kind: "Classroom writing game",
  summary: "Write a paragraph with a chatbot in two rounds, then review the conversation and compare what you contributed. Play solo, with a partner or in a teacher-paced class.",
  preview: "write-with-ai-2026-11-21.webp",
  previewAlt: "Round 1 challenges the player to write one paragraph in five minutes using a chatbot.",
  href: "https://write-with-ai-classroom-game.diddypopdiddy.chatgpt.site/",
  action: "Play Write with AI",
};

/** Books on the teaching shelf (left to right). */
export const BOOKS = [
  {
    ...FRAMEWORK,
    art: "book-plain-plum", color: "#684d78", spine: "AI Production Framework",
    caption: "The tour traces the path from guided practice to the AI License.",
    chapters: [
      { t: "AI Literacy and Core Competencies", n: 1 },
      { t: "The five AI Modes", n: 7 },
      { t: "From AI Permit to AI License", n: 15 },
      { t: "Classroom planning and safeguards", n: 23 },
    ],
  },
  {
    ...PLAYBOOK,
    emblem: "ai-educator-playbook.svg",
    caption: "The Playbook’s classroom routine is Understand, Choose and Show.",
    chapters: [
      { t: "AI literacy and limits", n: 1 },
      { t: "Integrity and privacy", n: 9 },
      { t: "Teacher and student routines", n: 17 },
      { t: "Ideas by subject", n: 25 },
      { t: "Prompting and classroom resources", n: 33 },
    ],
    art: "book-plain-brick", color: "#a3301f", spine: "AI Educator Playbook",
  },
  {
    ...TEXTBOOK,
    id: "moving-image",
    emblem: "moving-image.svg",
    caption: "Move and zoom the viewfinder in the interactive Shot Sizes lesson.",
    chapters: [
      { t: "Get started and plan a project", n: 1 },
      { t: "Framing, lighting and sound", n: 11 },
      { t: "Continuity, coverage and shooting", n: 21 },
      { t: "Editing, graphics and captions", n: 31 },
      { t: "Finish and share", n: 41 },
    ],
    art: "book-plain-teal", color: "#176a6d", spine: "Video Production Textbook",
  },
  {
    ...ROADTEST,
    emblem: "ai-road-test.svg",
    caption: "Start at the permit office and follow your instructor through town.",
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
    caption: "The first round gives you five minutes to write one paragraph with a chatbot.",
    chapters: [
      { t: "Choose how to play", n: 1 },
      { t: "Round 1 in five minutes", n: 3 },
      { t: "Review the conversation", n: 5 },
      { t: "Try again in Round 2", n: 13 },
      { t: "Compare what you contributed", n: 17 },
    ],
    art: "book-plain-forest", color: "#3a5f31", spine: "Write with AI",
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
