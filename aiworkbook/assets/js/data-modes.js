/* Chapter 3 · AI Modes · Boss: The Autopilot.
   Each round: a need, the right Mode, then three choices (opening prompt, next move, human finish).
   In every choice list, option 0 is correct; the game shuffles them. */
window.WB = window.WB || {};

WB.modes = {
  list: {
    idea:     { name: "Idea",     job: "Explore possibilities",  finish: "Choose and explain why",               icon: "✦" },
    learning: { name: "Learning", job: "Explain and question",   finish: "Show and check your understanding",    icon: "◎" },
    feedback: { name: "Feedback", job: "Critique your work",     finish: "Revise, or justify keeping it",        icon: "✎" },
    practice: { name: "Practice", job: "Rehearse with you",      finish: "Improve and retry until the goal is met", icon: "↻" },
    tool:     { name: "Tool",     job: "Carry out a task",       finish: "Verify and approve the result",        icon: "⚙" },
    none:     { name: "No AI",    job: "This one's all you",     finish: "Do the work yourself",                 icon: "✋" }
  },
  /* the four steps each Mode moves through (from the Framework's Mode matrix) */
  matrix: {
    idea:     ["Bring a starting idea", "Explore possibilities", "Combine, redirect or select", "Choose and explain why"],
    learning: ["State what you know and your goal", "Ask for tailored explanations", "Ask clarifying or deeper questions", "Show and check your understanding"],
    feedback: ["Bring your own work", "Set criteria and limits (“Don't rewrite”)", "Evaluate the suggestions", "Revise, or justify keeping it"],
    practice: ["Define the situation, roles and limits", "Attempt the simulation", "Debrief strengths and gaps", "Improve and retry until the goal is met"],
    tool:     ["Specify the task and result", "Direct AI's work", "Check and refine", "Verify and approve the result"]
  },
  rounds: [
    {
      mode: "learning",
      need: "Your chemistry test is Friday and you don't get why ice floats when most solids sink.",
      modeWhy: "You need to understand something. Learning Mode: AI explains and questions, you build the understanding.",
      open: [
        { t: "I know most solids sink in their own liquid, but ice floats and I don't get why. Explain the one idea I'm missing, then ask me a question to check.", why: "States what you know, names the gap, asks to be checked." },
        { t: "Tell me everything about water.", why: "Way too broad. You'll drown in facts that aren't your gap." },
        { t: "Give me the answers to the review sheet.", why: "That's the Autopilot talking. Answers aren't understanding." }
      ],
      ai: "When water freezes, its molecules lock into an open, spread-out pattern, so ice is less dense than liquid water. Quick check: if something is less dense than water, what happens to it?",
      next: [
        { t: "It floats! So the open pattern takes up more space. Is that why pipes can burst in winter?", why: "Answer, then a deeper question. That's step 3 of Learning Mode." },
        { t: "Cool. Just write me a summary I can memorize.", why: "Memorizing skips the understanding you came for." },
        { t: "Ok thanks.", why: "You stopped before checking your understanding at all." }
      ],
      finish: [
        { t: "“So if I understand you correctly: freezing spreads the molecules out, ice is less dense, so it floats.” Then I check it against my textbook.", why: "Paraphrase it in your own words, then check a trusted source." },
        { t: "The AI said I'm right, so I'm ready for the test.", why: "AI agreement isn't verification." },
        { t: "Copy the AI's explanation into my notes word for word.", why: "Copying isn't showing understanding." }
      ]
    },
    {
      mode: "feedback",
      need: "You wrote a cover letter for a summer job and want to know if it's strong enough to send.",
      modeWhy: "You already have work and want critique. Feedback Mode: AI critiques, you keep the judgment and the revision.",
      open: [
        { t: "Here's my cover letter and the job posting. Don't rewrite it. Tell me where it doesn't match what they're asking for, and why.", why: "Your work plus the criteria (the posting), with a clear limit." },
        { t: "Is this good?", why: "No criteria, so you'll likely just get praise." },
        { t: "Rewrite my cover letter so it's perfect.", why: "Autopilot. It wouldn't be your letter anymore." }
      ],
      ai: "Two things: the posting asks for weekend availability and you don't mention it. Also, try opening with “I am writing to express my keen interest in this exciting opportunity.”",
      next: [
        { t: "Good catch on weekends, I'll add that. I'm keeping my opening because it's specific to me. Is there an actual problem with it?", why: "You evaluated the suggestions: kept one, pushed back on one." },
        { t: "Make both changes for me.", why: "You'd hand over the revision and the judgment." },
        { t: "Paste in that new opening.", why: "That generic line is weaker than yours. Evaluate before you accept." }
      ],
      finish: [
        { t: "I wrote the weekend line myself and kept my opening, because it shows why I want this job.", why: "Revise, or justify keeping it. You did both." },
        { t: "I accepted every suggestion, so it's AI-approved.", why: "AI approval isn't the goal. Your judgment is." },
        { t: "I'll send whatever version the AI gives me.", why: "The human finishes, not the AI." }
      ]
    },
    {
      mode: "idea",
      need: "Your art club needs a fundraiser, and everyone's tired of the bake sale.",
      modeWhy: "You need possibilities. Idea Mode: AI explores options, you choose and explain.",
      open: [
        { t: "We're a 20-person art club with $50 and one month. Our only idea is a bake sale and it's tired. Give me five very different directions, with a tradeoff for each.", why: "Starting idea, real limits, a request for variety." },
        { t: "Fundraiser ideas?", why: "No context, so you get the generic list." },
        { t: "Pick our fundraiser and plan the whole thing.", why: "Autopilot. Choosing is the part that's yours." }
      ],
      ai: "1) A mural-painting day. 2) A portrait booth at lunch. 3) A sticker shop with student designs. 4) A silent art auction. 5) A “paint the teacher” event. Tradeoffs: the mural needs a wall; the auction needs donors…",
      next: [
        { t: "What if we combine the portrait booth and the sticker shop: portrait stickers? What would make that hard with $50?", why: "Combine, redirect, then test the idea. That's step 3 of Idea Mode." },
        { t: "Which one is best? Just choose.", why: "Handing the choice back to the AI." },
        { t: "Great, we'll do all five.", why: "Taking everything isn't choosing." }
      ],
      finish: [
        { t: "We'll do portrait stickers. It uses our art skills, fits the budget, and I combined two ideas. We skipped the auction because we don't have donors.", why: "Choose and explain why, including what you rejected." },
        { t: "We'll do the mural because it was first on the list.", why: "First isn't a reason." },
        { t: "We'll do whatever the AI rated highest.", why: "The idea needs your reasons, not its rating." }
      ]
    },
    {
      mode: "practice",
      need: "You have an interview at the movie theater next week and you're nervous about answering questions on the spot.",
      modeWhy: "You need rehearsal. Practice Mode: AI sets up the challenge, you do the thinking.",
      open: [
        { t: "Act as the theater manager interviewing me for a part-time job. Ask one question at a time, wait for my answer, and give feedback on how clear and specific I was.", why: "Roles, limits, one at a time, and criteria for feedback." },
        { t: "What are common interview questions?", why: "Useful, but reading questions isn't practicing answers." },
        { t: "Write perfect answers I can memorize.", why: "Autopilot. Memorized answers fall apart in a real interview." }
      ],
      ai: "Thanks for coming in! First question: tell me about a time you handled a stressful situation.",
      next: [
        { t: "Answer in my own words first: “When my group project partner quit, I split up the work and we finished on time.”", why: "Attempt first, then get feedback. That's how practice works." },
        { t: "What should I say? Give me the best answer.", why: "You skipped the attempt, which is the whole point." },
        { t: "Skip to the end.", why: "No practice happened." }
      ],
      finish: [
        { t: "The feedback said to add the result. Let me try that answer again, then ask me a new question.", why: "Improve and retry until the goal is met." },
        { t: "The AI said “Great example!” so I'm ready.", why: "Praise isn't readiness." },
        { t: "Save the feedback and read it the night before.", why: "Reading feedback isn't the same as improving." }
      ]
    },
    {
      mode: "tool",
      need: "You have a messy list of eight volunteer shifts for the food drive and need a clean table.",
      modeWhy: "You need an operation done. Tool Mode: AI formats, organizes or calculates, and you verify.",
      open: [
        { t: "Format these shifts as a table: Day | Time | Volunteer code. Don't add or change any times. If a time is missing, write “not given.”", why: "Clear operation, codes instead of names, and it keeps the gaps visible." },
        { t: "Make a schedule.", why: "No format and no rules, so it'll guess." },
        { t: "Here are everyone's full names, phone numbers and home addresses. Make a contact sheet and a schedule.", why: "Way more personal data than the task needs. Data & Privacy is always on." }
      ],
      ai: "Here's your table. Mon 3–5 pm V1 · Tue 4–6 pm V2 · … · Thu 3–5 pm V6 · … (Your notes said “Thursday, time TBD.”)",
      next: [
        { t: "Thursday's time wasn't in my notes. Change it back to “not given.”", why: "You compared input and output and caught an invented value." },
        { t: "Looks good!", why: "You approved it without checking. The AI made up Thursday's time." },
        { t: "Add more volunteers to fill the gaps.", why: "Inventing people isn't fixing the table." }
      ],
      finish: [
        { t: "I checked every row against my original notes. I approve it, with Thursday marked “not given.”", why: "Verify and approve. A correction still needs checking." },
        { t: "The AI fixed it when I asked, so it's correct now.", why: "A correction still needs checking." },
        { t: "Send it to everyone without looking.", why: "The human approves the result, not the AI." }
      ]
    },
    {
      mode: "none",
      need: "Final strike! Your teacher says this reflection on your own growth this semester must be written with No AI.",
      modeWhy: "No Mode fits when the answer is “no AI.” A teacher's No-AI direction always wins.",
      open: null,
      ai: null,
      next: null,
      finish: [
        { t: "I write it myself. If I'm stuck, I ask my teacher.", why: "The human finishes, all the way. That's how you beat the Autopilot." },
        { t: "I'll use AI just for the first sentence.", why: "No AI means no AI. Ask your teacher if you think it should be different." },
        { t: "I'll use Learning Mode so it doesn't really count.", why: "Calling it a Mode doesn't change the direction." }
      ]
    }
  ],
  taunts: {
    start: "Why do all that thinking? Let me take the wheel.",
    hit: ["Hey! I had that handled.", "You're… thinking? Gross.", "Fine, keep your ideas.", "Stop checking my work!", "I was going to write it for you…"],
    miss: ["Autopilot engaged.", "Relax. I'll drive.", "See? Easier my way.", "Just trust me.", "Who needs a human?"],
    lose: "Autopilot is driving now. Grab the wheel and try again.",
    win: "Noooo! The human finished the work…"
  }
};
