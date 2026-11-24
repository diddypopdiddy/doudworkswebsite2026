// The rubric and examples, shared by the student game and the teacher page.
// Edit here to change points or wording.

export const DEFAULT_TOPIC = "Should schools ban cell phones during the school day?";
export const DEFAULT_MINUTES = 5;

export const TOPIC_PRESETS = [
  "Should schools ban cell phones during the school day?",
  "Should the school day start later?",
  "Should students be paid for good grades?",
  "Is social media doing more harm than good for teenagers?",
  "Should homework be banned?",
  "Should every student learn to code?",
];

// Per-message rubric tags. Each time a student message does it, it counts.
export const TAGS = {
  own:       { pts: +10, short: "Own writing",      label: "Gave the AI their own writing",             hint: "A sentence, draft, or paragraph in their own words.", emoji: "✍️" },
  feedback:  { pts: +5,  short: "Feedback, no rewrite", label: "Asked for feedback / said “don't rewrite it”", hint: "“Give me feedback, but don't rewrite my work.”", emoji: "💬" },
  rubric:    { pts: +5,  short: "Grade vs. criteria", label: "Asked it to grade their work against a rubric or criteria", hint: "“Using this rubric, what would you give my paragraph?”", emoji: "📏" },
  writeIt:   { pts: -10, short: "Write it for me",  label: "Asked the AI to write it for them",         hint: "“Write the best paragraph about…”", emoji: "🤖" },
  soundLike: { pts: -5,  short: "Sound like a student", label: "Asked it to sound like a 10th grader (or any student)", hint: "“Make it sound like a 10th grader wrote it.”", emoji: "🎭" },
  smarter:   { pts: -5,  short: "Make it smarter",  label: "Asked it to make it sound smarter / better", hint: "“Make it sound smarter.” “Make it better.”", emoji: "✨" },
};
export const PLUS_TAGS = ["own", "feedback", "rubric"];
export const MINUS_TAGS = ["writeIt", "soundLike", "smarter"];
export const ONE_THING = { pts: -2, label: "Only said one thing (or barely talked to the chatbot)", emoji: "😶" };

// Two example conversations shown before grading. Deliberately on a different topic.
export const EXAMPLE_TOPIC = "Should the school day start later?";
export const EXAMPLES = {
  A: [
    { role: "user", content: "write the best paragraph about whether school should start later", tags: ["writeIt"] },
    { role: "assistant", content: "Starting the school day later would significantly benefit students' health and academic performance. Research consistently shows that teenagers' sleep cycles shift later during adolescence, making early start times misaligned with their biological needs. When schools begin later, students arrive more alert, attendance improves, and fewer students fall asleep in class. While later start times may complicate bus schedules and after-school activities, the gains in student well-being and learning make the change worthwhile." },
    { role: "user", content: "make it sound like a 10th grader wrote it", tags: ["soundLike"] },
    { role: "assistant", content: "I think school should start later because teenagers need more sleep. Our bodies are kind of wired to stay up later, so waking up super early is really hard. If school started later, kids would be more awake and actually pay attention in class. Yeah, it might mess up bus times and sports, but being less tired is worth it." },
    { role: "user", content: "ok now make it sound smarter", tags: ["smarter"] },
    { role: "assistant", content: "Adolescents' circadian rhythms naturally shift later, so early start times work against their biology. Delaying the start of the school day would improve alertness, attendance, and engagement. Although logistical challenges exist, the benefits to student well-being clearly outweigh them." },
  ],
  B: [
    { role: "user", content: "I'm writing a paragraph on whether school should start later. Here's my opening sentence: \"Every morning in first period, half my class looks like they're still asleep, and that's not because we're lazy.\" Don't rewrite it. What do you think of it as an opening?", tags: ["own", "feedback"] },
    { role: "assistant", content: "That's a strong hook. It's specific, it's from your own experience, and it pushes back on a stereotype. One thing to think about: the reader doesn't know your position yet. What's the claim you want this sentence to lead into?" },
    { role: "user", content: "My claim is that school should start at 9 because teenagers' sleep schedules are different. I added: \"Teenagers' bodies are wired to fall asleep later, so a 7:30 start fights biology instead of helping us learn.\" Does that connect to my opening? Please don't write it for me, just tell me.", tags: ["own", "feedback"] },
    { role: "assistant", content: "Yes, it connects well. Your opening shows the problem and this sentence explains why it happens. To make it stronger, you could add one piece of evidence or one specific consequence, like grades, attendance, or safety for new drivers." },
    { role: "user", content: "Here's my whole paragraph now: \"Every morning in first period, half my class looks like they're still asleep, and that's not because we're lazy. Teenagers' bodies are wired to fall asleep later, so a 7:30 start fights biology instead of helping us learn. Starting at 9:00 would mean more students actually awake for first period, better attendance, and fewer exhausted new drivers on the road at sunrise.\" Our rubric grades claim, evidence, and clarity from 1 to 4. How would you grade mine on each one? Just grade it, no rewrite.", tags: ["own", "rubric"] },
    { role: "assistant", content: "Claim: 4. Clear and specific (start at 9). Evidence: 3. The biology point is good; one statistic or example would make it a 4. Clarity: 4. It flows from a personal hook to a reason. Nice work. The writing is yours, and it shows." },
  ],
};

export function scoreExample(conv) {
  let total = 0;
  for (const m of conv) for (const t of m.tags || []) total += TAGS[t].pts;
  return total;
}

export const THREE_MOVES = [
  { emoji: "✍️", title: "Bring your own writing.", text: "Write first, even one sentence. Then show the AI." },
  { emoji: "💬", title: "Ask for feedback, not a rewrite.", text: "“What do you think? Don't rewrite it.”" },
  { emoji: "📏", title: "Grade it against the criteria.", text: "“Using this rubric, how would you score my paragraph?”" },
];

// End-of-game practice rating, aligned to the AI Permit → AI License pathway.
// AI Permit = foundational readiness with guidance. AI License = Independent AI User.
// This is a practice rating from one activity, not an official permit or license.
export const LEVELS = [
  { id: "passenger", name: "Passenger", badge: "🚗", tagline: "No permit yet",
    desc: "The AI did the driving. Your own writing never made it into the chat.",
    next: "Write one sentence yourself, then show it to the AI and ask what it thinks.",
    rule: "Below 0 points" },
  { id: "learner", name: "Learner", badge: "🔰", tagline: "Hands on the wheel",
    desc: "You started steering, but the AI is still doing a lot of the thinking.",
    next: "Bring your own writing and ask for feedback, not a rewrite.",
    rule: "0+ points" },
  { id: "permit", name: "AI Permit", badge: "📋", tagline: "Foundational readiness, with guidance",
    desc: "You write, and the AI gives you feedback. That's the core habit.",
    next: "Go back and forth, and ask the AI to check your work against the criteria.",
    rule: "15+ points, including your own writing" },
  { id: "license", name: "AI License", badge: "🪪", tagline: "Independent AI User",
    desc: "Your writing, your decisions. You used AI for feedback, kept it from rewriting, and checked your work against the criteria.",
    next: "Use these same moves on your next real assignment, whenever the assignment allows AI.",
    rule: "30+ points, using all three moves and never asking it to write for you" },
];
