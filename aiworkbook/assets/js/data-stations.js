/* Chapter 2 · Core Competencies · Station Rotation content.
   Every name, number and document here is made up. Numbers use reserved fake ranges
   (555 phone numbers, 000- ID numbers) so nothing points at a real person. */
window.WB = window.WB || {};

WB.lenses = {
  prompting:    { letter: "P", name: "Prompting",      line: "Make the help fit the goal, context and boundary." },
  privacy:      { letter: "D", name: "Data & Privacy", line: "Choose minimal approved input and a safe destination." },
  ethics:       { letter: "E", name: "Ethics",         line: "Respect permission, ownership, fairness and responsibility." },
  verification: { letter: "V", name: "Verification",   line: "Trace important claims and test important operations." }
};

/* ---------- Station P · Prompt Ladder ----------
   Prompts are listed BEST first. The game shuffles them. tags = the prompt ingredients it uses. */
WB.prompting = {
  ingredients: {
    goal: "Goal", context: "Context", limit: "Boundary", response: "Response you need"
  },
  rounds: [
    {
      task: "Get feedback on your writing",
      detail: "You've drafted the opening paragraph of an essay and want to make it stronger.",
      prompts: [
        { t: "Here's my intro and the rubric's “clear thesis” row. Don't rewrite it. Tell me where a reader might get lost, and why.", tags: ["context", "goal", "limit", "response"], why: "Your work, the criteria, a clear limit and the exact response you need. The thinking stays yours." },
        { t: "This is my first paragraph. Don't rewrite it. Any feedback?", tags: ["context", "limit"], why: "A good start: your own work and a limit. Adding the criteria would make the feedback sharper." },
        { t: "Is my intro good? [pastes intro]", tags: ["context"], why: "Vague questions invite vague praise. “Good” at what, for whom?" },
        { t: "Fix my intro so it sounds better.", tags: [], why: "“Fix it” hands over the revision. You'd learn less and own less of it." },
        { t: "Write the intro for me.", tags: [], why: "The thinking you're supposed to be practicing moves to the AI. Worst fit for this task." }
      ]
    },
    {
      task: "Learn something new",
      detail: "Your test is on photosynthesis and one part just isn't clicking.",
      prompts: [
        { t: "I know plants make food from sunlight, but I'm stuck on where the oxygen comes from. Explain just that gap, then ask me one question to check I've got it.", tags: ["context", "goal", "response"], why: "Says what you know, names the exact gap and asks to be checked. That's Learning Mode done well." },
        { t: "Explain photosynthesis like I'm in 8th grade, then quiz me one question at a time.", tags: ["context", "response"], why: "Sets a level and asks to be quizzed. It doesn't say where you're stuck, so it may re-teach what you know." },
        { t: "Explain photosynthesis.", tags: [], why: "It'll work, sort of. But you'll get a generic lecture, not help with your gap." },
        { t: "Give me a summary of photosynthesis I can memorize.", tags: [], why: "Memorizing someone else's summary skips the understanding the test is checking." },
        { t: "Answer the ten questions on my photosynthesis worksheet.", tags: [], why: "The AI does the learning activity for you. Nothing sticks." }
      ]
    },
    {
      task: "Brainstorm a project",
      detail: "You need a science fair idea and you're starting from zero.",
      prompts: [
        { t: "I'm into sound and plants, I have three weeks and no lab. Give me five very different directions with one tradeoff each. Don't pick for me.", tags: ["context", "goal", "limit", "response"], why: "Your interests, real limits, a request for variety, and the choice stays yours." },
        { t: "Give me five science fair ideas about plants.", tags: ["goal", "response"], why: "Fine, but without your limits the ideas may not fit three weeks and no lab." },
        { t: "What's a good science fair project?", tags: [], why: "No context at all, so you get the same ideas everyone gets." },
        { t: "Pick the best science fair project for me and write the plan.", tags: [], why: "Choosing and planning are the parts you're meant to do." },
        { t: "Write my whole science fair project, including the results.", tags: [], why: "Made-up results are dishonest, and none of the thinking is yours." }
      ]
    },
    {
      task: "Prepare for a presentation",
      detail: "You're giving a three-minute talk on recycling next week.",
      prompts: [
        { t: "Act as a tough audience for my three-minute talk on recycling. I'll present one section at a time. Ask one hard question after each and wait for my answer.", tags: ["context", "goal", "limit", "response"], why: "A real rehearsal: roles, structure and you do the talking first." },
        { t: "Here's my outline. What questions might the audience ask?", tags: ["context", "response"], why: "Useful prep, but you're reading questions, not practicing answering them." },
        { t: "Make my presentation better.", tags: [], why: "Better how? The AI has to guess, and it'll probably rewrite it." },
        { t: "Write me a script I can read word for word.", tags: [], why: "Reading someone else's script isn't presenting. The audience will notice." },
        { t: "Write the whole talk and the slides so I don't have to look at it before class.", tags: [], why: "No preparation happens at all. That's the opposite of the goal." }
      ]
    }
  ]
};

/* ---------- Station D · Data & Privacy ---------- */
WB.privacy = {
  sort: [
    { t: "Your Social Security number", ok: false, why: "Never. It can be used to steal your identity." },
    { t: "Your favorite color", ok: true, why: "Harmless. It doesn't identify you." },
    { t: "Your full date of birth", ok: false, why: "Birthdays are used to verify identity, and combined with a name they pinpoint you." },
    { t: "The topic of your essay", ok: true, why: "The task itself is fine to share." },
    { t: "Your home address", ok: false, why: "It tells anyone exactly where you live." },
    { t: "A made-up character name for your story", ok: true, why: "Invented details are a safe way to give context." },
    { t: "Your account password", ok: false, why: "No tool needs your password in a chat. Ever." },
    { t: "“I'm in 9th grade”", ok: true, why: "A grade level helps the AI pitch its help, without identifying you." },
    { t: "A screenshot of a friend's private messages", ok: false, why: "That's someone else's data. They didn't agree to share it." },
    { t: "A general question about the water cycle", ok: true, why: "Nothing personal at all." },
    { t: "Your doctor's diagnosis", ok: false, why: "Health information is sensitive. Keep it out unless a trusted adult approves a safe tool." },
    { t: "Your student ID number", ok: false, why: "IDs link straight to your school records." },
    { t: "Your favorite movie genre", ok: true, why: "A preference like this is safe and can make suggestions fit you." },
    { t: "A classmate's grades", ok: false, why: "Other people's records are never yours to share." },
    { t: "Your own essay draft, with personal details removed", ok: true, why: "Your work, minus the identifying bits, in a tool your school approves." },
    { t: "A photo of your driver's license or school ID card", ok: false, why: "An ID card is a bundle of identifying information in one picture." }
  ],
  /* Documents: wrap sensitive pieces as {{text|reason}}. Everything else is clickable too,
     so blacking out harmless words counts as over-redacting. */
  docs: [
    {
      title: "An email you want AI to polish",
      kind: "Email draft",
      text: "Hi {{Ms. Okafor|A real person's name. Swap it for [Teacher].}},\n\nThis is {{Jordan Reyes|Your full name. Not needed for help with wording.}} from your {{3rd period|Narrows down exactly which student you are.}} class. My student ID is {{000-48-1127|An ID number links straight to your records.}}.\n\nI missed the quiz on Tuesday because I had an appointment at {{Lakeside Pediatrics for my migraines|Health information, plus where you get care.}}. Could I take it during lunch on Thursday?\n\nIf you need to reach my mom, her number is {{(555) 014-2290|A phone number, and it's not even yours to share.}}.\n\nThank you!"
    },
    {
      title: "A resignation letter you need help wording",
      kind: "Letter draft",
      text: "Dear {{Mr. Patel|Your manager's name. Use [Manager] instead.}},\n\nI am writing to let you know I am resigning from my job as a cashier at {{Sunny Side Grocery on 42 Elm Street|Your employer and its address together locate you.}}. My last day will be two weeks from today.\n\nI am leaving because {{my family is moving to Denver for my dad's new job|Private family details. The AI doesn't need the reason to help with tone.}}. I have really enjoyed working here and learned a lot about helping customers.\n\nMy employee number is {{SG-7781|An ID number tied to your work records.}} if you need it for my final paycheck.\n\nSincerely,\n{{Sam Whitfield|Your full name.}}"
    },
    {
      title: "Notes for your best friend's wedding speech",
      kind: "Speech notes",
      text: "Speech for {{Priya|Your friend's name. Use [Friend] while drafting with AI.}} and {{Marcus Lee|Another real person's full name.}}\n\nWe met in 7th grade at {{Roosevelt Middle School|Names a real school you both attended.}} when she lent me a pencil and never asked for it back.\n\nShe was there for me every day of high school. When {{her mom was in the hospital for cancer treatment|Someone else's health information. Very private.}}, she still showed up to my games.\n\nShe is the funniest, most loyal person I know.\n\nThe wedding is at {{the Harborview Hotel on Saturday, May 3|An exact place and time. Nobody online needs that.}}.\n\nEnd with a toast to the two of them."
    }
  ]
};

/* ---------- Station E · Ethics · Fence Line ----------
   zone: "go" (allowed) | "fence" (depends: ask the fence-line question) | "stop" (not allowed)
   fenceQ: for fence-line cards, the question worth asking. Option 0 is correct; the game shuffles. */
WB.ethics = {
  zones: {
    go:    { label: "Allowed",     icon: "✓", hint: "Fine as long as you finish the work" },
    fence: { label: "Fence line",  icon: "↔", hint: "Depends: ask the right question first" },
    stop:  { label: "Not allowed", icon: "✕", hint: "Crosses the line" }
  },
  cards: [
    { t: "You're resigning from your part-time job and don't know what to say. You ask AI for a polite example, then rewrite it in your own words.", zone: "go", why: "Personal task, honest use, and the final words are yours." },
    { t: "You paste your take-home test into AI and copy its answers.", zone: "stop", why: "The test checks your thinking. Copying answers hides what you actually know." },
    { t: "You're writing your best friend's wedding speech. You ask AI to write the whole thing and plan to read it as yours.", zone: "fence", why: "Not against any rule, but a speech is personal.", fenceQ: ["Are the memories and feelings in it really mine?", "Will anyone be able to tell?", "Is it short enough?"] },
    { t: "You ask AI to quiz you on your vocab words before a test.", zone: "go", why: "Practice that makes you do the thinking. Great use." },
    { t: "Your teacher said “No AI” for this essay. You just want AI to fix your commas.", zone: "stop", why: "The teacher's direction wins. If you think commas should be okay, ask your teacher first." },
    { t: "You use AI to brainstorm five books for your book club proposal, then pick one and write the pitch yourself.", zone: "go", why: "AI widens the options; you choose and explain. That's Idea Mode." },
    { t: "AI helped outline your history essay. The assignment says to disclose AI help. You leave it out.", zone: "stop", why: "Disclose help truthfully. Leaving it out turns allowed help into a dishonest one." },
    { t: "Feedback from AI is allowed on your story. You accept every one of its suggested edits without reading them.", zone: "fence", why: "Allowed help, but you've stopped owning the work.", fenceQ: ["Can I explain why I made each change?", "Did the AI sound confident?", "Will it save time?"] },
    { t: "You ask AI to role-play a skeptical audience so you can rehearse your presentation.", zone: "go", why: "Rehearsal where you do the talking. That's Practice Mode." },
    { t: "You make a funny AI image of a classmate and post it without asking them.", zone: "stop", why: "Think about effects on people. Their face, their consent." },
    { t: "You ask AI to help word an apology text to a friend after an argument.", zone: "fence", why: "Help with wording can be fine. Sending words you don't mean isn't.", fenceQ: ["Does it say what I actually mean and feel?", "Is it long enough to look sincere?", "Will my friend know it was AI?"] },
    { t: "You want AI feedback on your college application essay.", zone: "fence", why: "Many applications have rules about AI help. Check before you start.", fenceQ: ["What do this application's rules say about AI help?", "Which AI tool is the most popular?", "How fast can I finish it?"] },
    { t: "You write a fake five-star review for your cousin's bakery with AI.", zone: "stop", why: "It misleads real customers. Fairness and honesty aren't optional." },
    { t: "You get a math problem wrong, ask AI to explain the step you missed, then redo it yourself.", zone: "go", why: "Using AI to close a gap, then doing the work. That's Learning Mode." }
  ]
};

/* ---------- Station V · Verification · Fact Detective ----------
   check: does this output point to a fact you'd need to check?
   where: "search" | "original" | "human" | "test". best = the strongest place; also = other fine places. */
WB.verification = {
  places: {
    search:   { label: "Search trusted sources", sub: "Encyclopedias, official sites, library databases" },
    original: { label: "Go to the original",      sub: "The book, the study, your notes, the official page" },
    human:    { label: "Ask a human expert",      sub: "A teacher, librarian, doctor or pharmacist" },
    test:     { label: "Test or calculate it",    sub: "Do the math or try it yourself" }
  },
  cases: [
    { ctx: "You asked about the Eiffel Tower for a history project.", out: "The Eiffel Tower was finished in 1889 for the World's Fair in Paris.", check: true, best: "search", also: ["original"], why: "That one's true, but it's still a fact claim. A quick trusted source confirms it before it goes in your project." },
    { ctx: "You asked for title ideas for your poem.", out: "You could call it “Salt and Static” or “Small Hours.”", check: false, why: "Ideas aren't facts. There's nothing to look up. You just decide if you like them." },
    { ctx: "You asked if music helps you study.", out: "According to a 2021 Harvard study, students who listen to music while studying score 23% higher.", check: true, best: "original", also: ["search"], why: "Very specific numbers and a famous name are a classic sign of a made-up source. Find the actual study." },
    { ctx: "You have a headache and allergies.", out: "It's safe to take ibuprofen together with your allergy medicine.", check: true, best: "human", also: [], why: "Health and medicine questions go to a pharmacist, doctor or trusted adult, not a chatbot." },
    { ctx: "You asked AI to average your quiz scores: 86, 91 and 78.", out: "Your average is 87.", check: true, best: "test", also: [], why: "Do the math: 86 + 91 + 78 = 255, and 255 ÷ 3 = 85. The AI was wrong." },
    { ctx: "You asked for feedback on your essay.", out: "Your second paragraph feels rushed. Consider adding an example.", check: false, why: "That's an opinion to weigh against the rubric, not a fact to look up. You still decide whether you agree." },
    { ctx: "You asked when you can return a library book.", out: "Your school library closes at 6 p.m. on Fridays.", check: true, best: "original", also: ["human"], why: "The AI can't know your school's hours. Check the school's site or ask the librarian." },
    { ctx: "You asked for a quote to start your speech.", out: "As Abraham Lincoln said, “Don't believe everything you read on the internet.”", check: true, best: "search", also: ["original"], why: "Lincoln died in 1865, long before the internet. Quotes are often misattributed, so trace them." },
    { ctx: "You asked how to open your speech.", out: "A good opening could be a short story about the first time you two met.", check: false, why: "A suggestion, not a claim. Whether it fits is your call." },
    { ctx: "You asked for a summary of your assigned novel.", out: "In chapter 4, the main character moves to Chicago to live with her aunt.", check: true, best: "original", also: [], why: "Summaries can mix up details. The book itself is the only real check." }
  ]
};

/* ---------- The Crossroads · all four at once ---------- */
WB.crossroads = {
  title: "The scholarship essay",
  setup: "You're applying for a local scholarship. Your essay is about helping your grandmother after her stroke.",
  rule: "Essays must be the applicant's own writing. Applicants may get feedback from others.",
  steps: [
    {
      lens: "ethics",
      q: "What kind of AI help fits these rules?",
      options: [
        { t: "AI gives feedback on clarity. I do all the writing and revising.", ok: true },
        { t: "AI writes a draft and I edit it to sound like me.", ok: false, why: "The rules say your own writing. An AI draft isn't." },
        { t: "No help of any kind is allowed.", ok: false, why: "Too strict. The rules allow feedback from others." },
        { t: "Anything, as long as nobody can tell.", ok: false, why: "“Will I get caught?” is never the fence-line question." }
      ],
      why: "Feedback is allowed; the writing stays yours."
    },
    {
      lens: "privacy",
      multi: true,
      q: "Before you paste your draft in, what should come out? Pick all that apply.",
      options: [
        { t: "Grandma's full name", ok: true },
        { t: "The name of her hospital", ok: true },
        { t: "Your home address in the header", ok: true },
        { t: "Your application ID number", ok: true },
        { t: "How the experience changed you", ok: false, why: "That's the essay itself. The feedback needs it." }
      ],
      why: "Minimal input: keep the story, drop the identifying details."
    },
    {
      lens: "prompting",
      q: "Which prompt starts the conversation best?",
      options: [
        { t: "Here's my essay. The rules say it must be my own writing. Don't rewrite anything. Point to two places a reader might lose the thread, and say why.", ok: true },
        { t: "Make my essay better.", ok: false, why: "Too vague, and it invites a rewrite." },
        { t: "Is this good enough to win?", ok: false, why: "AI can't know that, and you'll probably just get praise." },
        { t: "Rewrite this so it sounds more impressive.", ok: false, why: "That breaks the “own writing” rule." }
      ],
      why: "Goal, context, a boundary and the response you need."
    },
    {
      lens: "verification",
      q: "The AI adds: “By the way, this scholarship has a 650-word limit, so you're fine at 600.” What do you do?",
      options: [
        { t: "Check the scholarship's official rules.", ok: true },
        { t: "Ask the AI if it's sure.", ok: false, why: "AI agreeing with itself isn't verification." },
        { t: "Trust it. It sounded confident.", ok: false, why: "Confident isn't the same as correct." },
        { t: "Cut it to 300 words just in case.", ok: false, why: "That throws away good work instead of checking." }
      ],
      why: "The AI can't know this scholarship's rules. Go to the original."
    }
  ]
};
