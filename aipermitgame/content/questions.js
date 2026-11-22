/*
 * AI ROAD TEST: PERMIT DRIVE - RED LIGHT QUESTION CARDS
 * ----------------------------------------------------
 * These cards appear when the driver stops at a RED LIGHT.
 * They are situational "What would you do?" checks. A correct answer
 * earns one permit credit in that category.
 *
 * Safe to edit: change text, add cards, remove cards.
 *   category : "prompting" | "privacy" | "verification" | "ethics"
 *   type     : label shown on the card (e.g. "Spot It", "Use It", "Road Scenario")
 *   level    : 1 = foundation (served first), 2 = applied (mixed in once a category has a credit)
 *   options  : exactly 4 choices. Order is shuffled in-game, so write them in any order.
 *   answer   : index (0-3) of the correct option in the list
 *   reason   : the quick reason shown after answering (right or wrong)
 *   exhibit  : optional {kind, label, content} shown above the question
 *              kind is "prompt", "record", "headline" or "photo"
 *
 * Sources: "AI Road Test - Card Deck Designer Handoff.xlsx" (Spot It + Use It cards)
 * and the 32-card scenario deck from the earlier AI Road Test build.
 */
window.ROAD_TEST_QUESTIONS = [
  {
    "id": "PR-SI-01",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student types: “Make this better.” What is the biggest problem with this prompt?",
    "options": [
      "It does not explain what “better” means.",
      "It is too specific.",
      "It gives too much context.",
      "It asks AI to verify facts."
    ],
    "answer": 0,
    "reason": "AI needs to know what kind of improvement the student wants."
  },
  {
    "id": "PR-SI-02",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student prompts: “Write my entire book report so I can turn it in.” What is the main problem?",
    "options": [
      "It gives too much audience information.",
      "It asks AI to replace the student’s own work.",
      "It asks for a short answer.",
      "It uses a complete sentence."
    ],
    "answer": 1,
    "reason": "A responsible prompt should support thinking, not pretend AI-generated work is the student’s own."
  },
  {
    "id": "PR-SI-03",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student asks: “Tell me about the Civil War.” What is most likely missing?",
    "options": [
      "A password.",
      "A command to be funny.",
      "A focus, grade level, or format.",
      "A request to use no sources ever."
    ],
    "answer": 2,
    "reason": "The topic is broad, so AI needs a clearer purpose."
  },
  {
    "id": "PR-SI-04",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student asks AI: “Give me 10 sources for my essay, but don’t show links or titles.” What is the problem?",
    "options": [
      "The prompt is too polite.",
      "The prompt has too much context.",
      "AI never gives lists.",
      "Sources cannot be checked if they are not clearly identified."
    ],
    "answer": 3,
    "reason": "Research help should include enough information for verification."
  },
  {
    "id": "PR-SI-05",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student asks: “Explain fractions.” What would make this prompt stronger?",
    "options": [
      "Add the grade level and ask for examples.",
      "Add a home address.",
      "Tell AI not to explain anything.",
      "Use only capital letters."
    ],
    "answer": 0,
    "reason": "Grade level and examples help the explanation match the learner."
  },
  {
    "id": "PR-SI-06",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student prompts: “Make my essay sound smarter so my teacher can’t tell I used AI.” What is the red flag?",
    "options": [
      "The prompt asks for writing help.",
      "The goal is to hide AI use instead of learning honestly.",
      "The prompt is too short to read.",
      "The student used the word essay."
    ],
    "answer": 1,
    "reason": "Prompting should match the teacher’s rules and keep the student’s ownership clear."
  },
  {
    "id": "PR-SI-07",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A student asks: “Create a study plan for math.” What information would help most?",
    "options": [
      "Favorite lunch food.",
      "A list of friends’ grades.",
      "Test date, topics, time available, and what feels hard.",
      "The school Wi-Fi password."
    ],
    "answer": 2,
    "reason": "A useful plan depends on the student’s goal, timeline, and needs."
  },
  {
    "id": "PR-SI-08",
    "category": "prompting",
    "type": "Spot It",
    "level": 1,
    "question": "A prompt says: “Answer in one sentence and include three detailed examples.” What is the issue?",
    "options": [
      "It gives no task at all.",
      "It shares private information.",
      "It asks for a quiz.",
      "The directions may conflict or be too cramped."
    ],
    "answer": 3,
    "reason": "Good prompts should give directions that can reasonably fit together."
  },
  {
    "id": "PR-UI-01",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "You want AI to help you study for a science test without giving you all the answers. What should you ask?",
    "options": [
      "“Quiz me on these topics one question at a time and explain what I miss.”",
      "“Give me the test answers.”",
      "“Write my science notes.”",
      "“Make it easy so I do not have to study.”"
    ],
    "answer": 0,
    "reason": "This uses AI to support learning instead of replacing it."
  },
  {
    "id": "PR-UI-02",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "You wrote a paragraph and want feedback without AI rewriting it for you. What should you ask?",
    "options": [
      "“Replace my paragraph with a perfect one.”",
      "“Give me three suggestions to improve clarity, but do not rewrite it.”",
      "“Make it sound like a college professor wrote it.”",
      "“Hide all mistakes from my teacher.”"
    ],
    "answer": 1,
    "reason": "Feedback keeps the student in charge of the final writing."
  },
  {
    "id": "PR-UI-03",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "AI gives a long answer that is hard to use. What is the best follow-up prompt?",
    "options": [
      "“Never mind.”",
      "“Make it longer.”",
      "“Shorten this to five bullet points for a 7th grader.”",
      "“You are wrong because I say so.”"
    ],
    "answer": 2,
    "reason": "A clear follow-up can adjust length, format, and audience."
  },
  {
    "id": "PR-UI-04",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "You have a project rubric and want to improve your draft responsibly. What should you ask?",
    "options": [
      "“Write the whole project for me.”",
      "“Ignore the rubric.”",
      "“Give me a grade and tell me it is perfect.”",
      "“Use this rubric to tell me what I should improve and why.”"
    ],
    "answer": 3,
    "reason": "AI can help compare work to criteria while the student still revises."
  },
  {
    "id": "PR-UI-05",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "You need project topic ideas but want to make your own choice. What prompt is best?",
    "options": [
      "“Give me five topic ideas with pros and cons for each.”",
      "“Pick my topic and write it.”",
      "“Give me the easiest topic so I do not have to think.”",
      "“Use a topic from another student.”"
    ],
    "answer": 0,
    "reason": "Brainstorming gives options while leaving the decision to the student."
  },
  {
    "id": "PR-UI-06",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "AI misunderstood your assignment. What should you do next?",
    "options": [
      "Turn in the wrong answer anyway.",
      "Give the missing instructions and ask it to revise.",
      "Assume your teacher is wrong.",
      "Delete your own assignment directions."
    ],
    "answer": 1,
    "reason": "Prompting is a conversation: add context when the output misses the goal."
  },
  {
    "id": "PR-UI-07",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "You are learning a new vocabulary word. Which prompt helps you understand it best?",
    "options": [
      "“Say the word ten times.”",
      "“Use the hardest definition possible.”",
      "“Define the word, use it in a sentence, and give a non-example.”",
      "“Write my quiz for me.”"
    ],
    "answer": 2,
    "reason": "Definition, example, and non-example build understanding."
  },
  {
    "id": "PR-UI-08",
    "category": "prompting",
    "type": "Use It",
    "level": 1,
    "question": "You need help writing a respectful email about a problem at school. What is the best prompt?",
    "options": [
      "“Add everyone’s private details.”",
      "“Make the email angry.”",
      "“Pretend to be my parent and send it.”",
      "“Suggest a polite tone and outline; I will write the final email.”"
    ],
    "answer": 3,
    "reason": "AI can help plan tone without taking over or exposing private information."
  },
  {
    "id": "DP-SI-01",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student wants to paste a classmate’s full name, grade, and behavior notes into AI to ask for advice. What is the problem?",
    "options": [
      "The student is sharing private information about another person.",
      "The prompt is too short.",
      "AI cannot help with writing.",
      "The student should add more names."
    ],
    "answer": 0,
    "reason": "Personal student information should not be shared carelessly."
  },
  {
    "id": "DP-SI-02",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student types their school username and password into AI to ask for tech help. What is wrong?",
    "options": [
      "The prompt has too many details about the assignment.",
      "Passwords should not be shared with AI.",
      "The student used a complete sentence.",
      "AI needs more passwords to help."
    ],
    "answer": 1,
    "reason": "Login details can give access to accounts and private data."
  },
  {
    "id": "DP-SI-03",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student uploads a photo of friends, and school ID cards are visible. What is the privacy issue?",
    "options": [
      "The photo has colors.",
      "AI only reads text, never images.",
      "The photo may reveal faces and identifying information.",
      "School IDs are public decorations."
    ],
    "answer": 2,
    "reason": "Photos can expose people and details that were not meant to be shared."
  },
  {
    "id": "DP-SI-04",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student pastes a private group chat screenshot into AI for advice. What is the main risk?",
    "options": [
      "The prompt is too educational.",
      "Group chats are never private.",
      "AI cannot summarize anything.",
      "Private messages and names may be shared without permission."
    ],
    "answer": 3,
    "reason": "Other people’s messages should not be shared without care and permission."
  },
  {
    "id": "DP-SI-05",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A prompt says: “My friend Jamie has anxiety and takes medication. What should I say?” What is the problem?",
    "options": [
      "It includes another person’s sensitive health information.",
      "It asks for a respectful response.",
      "It uses a friend’s first name only, so it is always safe.",
      "It is about feelings, so privacy does not matter."
    ],
    "answer": 0,
    "reason": "Health details are sensitive, especially when they belong to someone else."
  },
  {
    "id": "DP-SI-06",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student copies a teacher’s private feedback with the teacher’s name and another student’s name into AI. What should be changed?",
    "options": [
      "Add more student names.",
      "Remove names and identifying details before asking for general help.",
      "Ask AI to publish it.",
      "Leave it exactly as it is."
    ],
    "answer": 1,
    "reason": "Feedback can be discussed in general terms without exposing people."
  },
  {
    "id": "DP-SI-07",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student enters a class survey with student names and opinions into AI. What is the issue?",
    "options": [
      "It uses too many commas.",
      "AI only works with surveys.",
      "It shares identifiable class data.",
      "Opinions can never be private."
    ],
    "answer": 2,
    "reason": "Names connected to opinions can reveal personal information."
  },
  {
    "id": "DP-SI-08",
    "category": "privacy",
    "type": "Spot It",
    "level": 1,
    "question": "A student prompt includes exact birthdate, school, bus route, and after-school location. What is the concern?",
    "options": [
      "The prompt is too short.",
      "AI needs even more location details.",
      "Birthdays are never private.",
      "Those details can identify and locate the student."
    ],
    "answer": 3,
    "reason": "Combining details can make someone easier to identify or locate."
  },
  {
    "id": "DP-UI-01",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "You want help writing an email about a problem at school. What is the safest move?",
    "options": [
      "Remove names and use general details.",
      "Include everyone’s full names and private details.",
      "Share screenshots of private messages.",
      "Paste your school login information."
    ],
    "answer": 0,
    "reason": "You can get help while still protecting privacy."
  },
  {
    "id": "DP-UI-02",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "You want AI to review a scholarship essay, but the draft includes your address and phone number. What should you do first?",
    "options": [
      "Add your student ID too.",
      "Remove contact details before sharing.",
      "Post it in a public chat.",
      "Ask AI to remember your address."
    ],
    "answer": 1,
    "reason": "Contact information is not needed for writing feedback."
  },
  {
    "id": "DP-UI-03",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "You want to role-play a conflict with a friend to practice what to say. What is safest?",
    "options": [
      "Share the friend’s full name and private messages.",
      "Upload a secret recording.",
      "Use fake names and general details.",
      "Ask AI to embarrass the friend."
    ],
    "answer": 2,
    "reason": "The practice can work without exposing real people."
  },
  {
    "id": "DP-UI-04",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "You ask AI to help debug code, but your file shows an API key. What should you do?",
    "options": [
      "Leave the key because AI asked nicely.",
      "Put the key in the title.",
      "Share your password too.",
      "Delete or replace the key before sharing."
    ],
    "answer": 3,
    "reason": "Keys and passwords can give access to accounts or systems."
  },
  {
    "id": "DP-UI-05",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "Your teacher asks the class to use AI for project planning. What is the responsible privacy step?",
    "options": [
      "Use the approved tool and follow the teacher’s rules.",
      "Use any random site with student data.",
      "Paste classmates’ private information.",
      "Ignore the instructions."
    ],
    "answer": 0,
    "reason": "Approved tools and rules help protect school-related data."
  },
  {
    "id": "DP-UI-06",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "You want advice about a serious health concern. What is the safest choice?",
    "options": [
      "Share every private detail with a chatbot.",
      "Talk to a trusted adult or medical professional; use AI only for general questions.",
      "Let AI diagnose you and keep it secret.",
      "Ask AI to pretend to be your doctor."
    ],
    "answer": 1,
    "reason": "AI is not a substitute for trusted human help in serious situations."
  },
  {
    "id": "DP-UI-07",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "You need AI to translate a note that includes names and student ID numbers. What should you do?",
    "options": [
      "Leave all private details in the note.",
      "Add home addresses.",
      "Replace names and ID numbers with placeholders first.",
      "Ask AI to save the IDs."
    ],
    "answer": 2,
    "reason": "Translation does not require identifying details."
  },
  {
    "id": "DP-UI-08",
    "category": "privacy",
    "type": "Use It",
    "level": 1,
    "question": "An AI tool asks for your password to “help you faster.” What should you do?",
    "options": [
      "Type the password quickly.",
      "Send the password to a friend too.",
      "Use the same password everywhere.",
      "Stop and do not share the password."
    ],
    "answer": 3,
    "reason": "Legitimate help should not require you to reveal your password in a chat."
  },
  {
    "id": "VF-SI-01",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI gives you a quote from a famous person, but it does not say where the quote came from. What should you do?",
    "options": [
      "Look for the quote in a reliable source.",
      "Use it because it sounds real.",
      "Change a few words and use it.",
      "Assume AI checked it already."
    ],
    "answer": 0,
    "reason": "Quotes should be verified before being used."
  },
  {
    "id": "VF-SI-02",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI says, “Studies prove students learn better this way,” but names no study. What is the problem?",
    "options": [
      "The sentence is too short.",
      "The evidence is too vague to check.",
      "AI used the word students.",
      "All studies are always true."
    ],
    "answer": 1,
    "reason": "A claim about studies should identify evidence that can be checked."
  },
  {
    "id": "VF-SI-03",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI gives a source title, but the link is broken and the title cannot be found. What is the concern?",
    "options": [
      "Broken links are stronger evidence.",
      "The title must be secret.",
      "The source may be fake or incorrect.",
      "AI sources never need checking."
    ],
    "answer": 2,
    "reason": "AI can invent or mix up source details."
  },
  {
    "id": "VF-SI-04",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI gives a population number from ten years ago for a current report. What is the issue?",
    "options": [
      "Population numbers never change.",
      "Older numbers are always more accurate.",
      "Reports should not use numbers.",
      "The information may be outdated."
    ],
    "answer": 3,
    "reason": "Current reports need current data."
  },
  {
    "id": "VF-SI-05",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI summarizes a news story but gives no date, publisher, or link. What is missing?",
    "options": [
      "Information needed to verify the story.",
      "More emojis.",
      "A longer title only.",
      "A secret password."
    ],
    "answer": 0,
    "reason": "News should be checked against trusted, dated sources."
  },
  {
    "id": "VF-SI-06",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI says, “All experts agree,” but gives no names or evidence. What is the red flag?",
    "options": [
      "It uses a complete sentence.",
      "It makes a broad claim without support.",
      "It is definitely correct because it sounds confident.",
      "It asks you to think."
    ],
    "answer": 1,
    "reason": "Broad certainty needs evidence."
  },
  {
    "id": "VF-SI-07",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI solves a math problem with steps, but the final answer seems off. What should you do?",
    "options": [
      "Use it because there are steps.",
      "Delete your own work.",
      "Recalculate or check the steps with another reliable method.",
      "Assume math answers are always right."
    ],
    "answer": 2,
    "reason": "A neat explanation can still contain an error."
  },
  {
    "id": "VF-SI-08",
    "category": "verification",
    "type": "Spot It",
    "level": 1,
    "question": "AI includes a line it says is from a novel, but it does not match the book. What is likely happening?",
    "options": [
      "Books do not have quotes.",
      "AI always has the exact text.",
      "The student should use it anyway.",
      "The quote may be invented or misattributed."
    ],
    "answer": 3,
    "reason": "Literary quotes should be checked against the original text."
  },
  {
    "id": "VF-UI-01",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "You are using AI to learn about a news story. What is the best next step?",
    "options": [
      "Check the information against trusted news sources.",
      "Trust the first answer.",
      "Ask AI to make it sound more dramatic.",
      "Use only the part you agree with."
    ],
    "answer": 0,
    "reason": "Current events should be checked with reliable sources."
  },
  {
    "id": "VF-UI-02",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "You need a fact for an essay. What should you do before including it?",
    "options": [
      "Use it if AI sounds confident.",
      "Find the fact in a reliable source and record where it came from.",
      "Remove the source so it looks like your idea.",
      "Only ask a friend."
    ],
    "answer": 1,
    "reason": "Reliable sourcing makes the claim checkable."
  },
  {
    "id": "VF-UI-03",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "You ask AI for research sources. What is the smartest follow-up?",
    "options": [
      "Copy the list without looking.",
      "Use only sources with impressive titles.",
      "Open and check each source outside the AI chat.",
      "Assume all links work."
    ],
    "answer": 2,
    "reason": "AI can suggest sources, but you still need to verify them."
  },
  {
    "id": "VF-UI-04",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "AI makes a surprising science claim. What is the best way to check it?",
    "options": [
      "Use it because it is surprising.",
      "Ask AI to make it sound smarter.",
      "Trust the longest answer.",
      "Compare it with your textbook, teacher, or a reputable science source."
    ],
    "answer": 3,
    "reason": "Science claims should match reliable evidence."
  },
  {
    "id": "VF-UI-05",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "You see an AI-generated image being shared as if it is a real photo. What should you do before believing it?",
    "options": [
      "Check the original source and look for evidence it is real.",
      "Share it faster.",
      "Assume images cannot be fake.",
      "Ignore the caption date."
    ],
    "answer": 0,
    "reason": "Images and captions can be misleading or fabricated."
  },
  {
    "id": "VF-UI-06",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "You need the current deadline for a school program. What is the best source?",
    "options": [
      "An AI answer from memory.",
      "The official program website or school office.",
      "A guess from an old flyer.",
      "A social media comment with no link."
    ],
    "answer": 1,
    "reason": "Deadlines change, so check the official source."
  },
  {
    "id": "VF-UI-07",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "AI says one thing and your textbook says another. What should you do?",
    "options": [
      "Automatically choose AI.",
      "Automatically choose the answer you like.",
      "Investigate with a reliable source or ask your teacher.",
      "Hide the conflict."
    ],
    "answer": 2,
    "reason": "Conflicting information is a signal to check further."
  },
  {
    "id": "VF-UI-08",
    "category": "verification",
    "type": "Use It",
    "level": 1,
    "question": "AI gives an important statistic. What should you look for before using it?",
    "options": [
      "Only whether it has a percent sign.",
      "Whether it sounds exciting.",
      "Whether it is the biggest number.",
      "Source, date, and what was measured."
    ],
    "answer": 3,
    "reason": "Statistics need context to be meaningful and accurate."
  },
  {
    "id": "ET-SI-01",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "A student asks AI to write an entire essay and turns it in as their own work. What is the main problem?",
    "options": [
      "The student is claiming AI-generated work as their own.",
      "The student used technology.",
      "The student did not use enough AI.",
      "The student asked too many questions."
    ],
    "answer": 0,
    "reason": "Using AI to replace your own thinking can be dishonest."
  },
  {
    "id": "ET-SI-02",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "A student uses AI to create a fake embarrassing image of a classmate. What is the ethical problem?",
    "options": [
      "It is too colorful.",
      "It can harm someone and uses their likeness without consent.",
      "It uses an image tool.",
      "It is a type of brainstorming."
    ],
    "answer": 1,
    "reason": "Responsible AI use should not deceive, bully, or violate consent."
  },
  {
    "id": "ET-SI-03",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "A student uses AI to imitate a teacher’s voice in a fake announcement. What is wrong?",
    "options": [
      "It is just a normal citation.",
      "It makes the announcement shorter.",
      "It is deceptive and uses someone’s voice without permission.",
      "It is safer than telling the truth."
    ],
    "answer": 2,
    "reason": "Voice imitation can mislead people and violate consent."
  },
  {
    "id": "ET-SI-04",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "AI suggests a robotics club poster showing only boys. What should students notice?",
    "options": [
      "Robotics can only include boys.",
      "The poster has no ethical issues.",
      "Images do not affect people.",
      "The output may exclude or stereotype who belongs in robotics."
    ],
    "answer": 3,
    "reason": "Inclusive design matters because images can send messages about who is welcome."
  },
  {
    "id": "ET-SI-05",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "A prompt asks AI to make jokes about someone’s disability, accent, or background. What is the issue?",
    "options": [
      "It targets people in a harmful or disrespectful way.",
      "It is the only way to be funny.",
      "It improves accuracy.",
      "It protects privacy."
    ],
    "answer": 0,
    "reason": "Humor should not rely on demeaning people or groups."
  },
  {
    "id": "ET-SI-06",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "A group member uses AI for a shared project but does not tell the group. What is the ethical concern?",
    "options": [
      "The project is automatically better.",
      "The group cannot agree on or disclose how AI was used.",
      "AI use never needs discussion.",
      "The group should hide all tools."
    ],
    "answer": 1,
    "reason": "Transparency helps group members share responsibility fairly."
  },
  {
    "id": "ET-SI-07",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "AI writes a description of a culture using stereotypes. What should the user do?",
    "options": [
      "Copy it because AI said it.",
      "Make the stereotypes stronger.",
      "Question it, revise it, and check better sources.",
      "Use it without reading."
    ],
    "answer": 2,
    "reason": "Biased output should be challenged, not repeated."
  },
  {
    "id": "ET-SI-08",
    "category": "ethics",
    "type": "Spot It",
    "level": 1,
    "question": "A student copies AI-generated code but cannot explain how it works. What is the issue?",
    "options": [
      "Code never needs explanation.",
      "AI code is always perfect.",
      "The student should copy more.",
      "The student may not understand or own the work."
    ],
    "answer": 3,
    "reason": "Responsible use includes learning enough to explain and check the result."
  },
  {
    "id": "ET-UI-01",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "Your teacher allows AI for brainstorming but not for writing the final answer. What is the responsible choice?",
    "options": [
      "Use AI to generate ideas, then write the final answer yourself.",
      "Ask AI to write the final answer anyway.",
      "Have AI write it and do not tell anyone.",
      "Copy the best AI answer."
    ],
    "answer": 0,
    "reason": "Responsible use follows the purpose and limits of the assignment."
  },
  {
    "id": "ET-UI-02",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "You used AI to help plan a presentation. What is a responsible next step?",
    "options": [
      "Pretend no tool helped.",
      "Follow class rules for disclosure and verify any facts.",
      "Use every suggestion without checking.",
      "Remove your own ideas."
    ],
    "answer": 1,
    "reason": "Transparency and verification keep the work honest and reliable."
  },
  {
    "id": "ET-UI-03",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "AI gives a recommendation that seems biased. What should you do?",
    "options": [
      "Accept it because AI is neutral.",
      "Use it only if it benefits you.",
      "Ask what assumptions it made, seek inclusive alternatives, and check sources.",
      "Hide the bias."
    ],
    "answer": 2,
    "reason": "Bias should be examined and corrected, not ignored."
  },
  {
    "id": "ET-UI-04",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "A friend asks you to use AI to do their homework for them. What is the best response?",
    "options": [
      "Do the assignment secretly.",
      "Send them a fake answer.",
      "Tell them learning does not matter.",
      "Offer to help them study or understand the task instead."
    ],
    "answer": 3,
    "reason": "Helping someone learn is fairer than replacing their work."
  },
  {
    "id": "ET-UI-05",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "You want AI to help revise your essay while keeping your own voice. What should you ask?",
    "options": [
      "“Give feedback on clarity and grammar; do not rewrite in a new voice.”",
      "“Make this sound like someone else wrote it.”",
      "“Change every sentence so it is no longer mine.”",
      "“Write a final essay I can copy.”"
    ],
    "answer": 0,
    "reason": "Revision help should strengthen the student’s work, not erase ownership."
  },
  {
    "id": "ET-UI-06",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "Your group project might use AI. What should the group do first?",
    "options": [
      "Let one person decide in secret.",
      "Agree on allowed uses and document how AI helps.",
      "Use AI for everything and say nothing.",
      "Avoid checking any outputs."
    ],
    "answer": 1,
    "reason": "Shared expectations help the group stay fair and transparent."
  },
  {
    "id": "ET-UI-07",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "You want AI to create art for a class project. What is the most responsible approach?",
    "options": [
      "Ask for an exact copy of a living artist’s style and claim it as yours.",
      "Use AI to impersonate a classmate.",
      "Use broad style directions, add your own creative choices, and disclose tool use if required.",
      "Ignore the assignment rules."
    ],
    "answer": 2,
    "reason": "Responsible creative use avoids deception and keeps authorship clear."
  },
  {
    "id": "ET-UI-08",
    "category": "ethics",
    "type": "Use It",
    "level": 1,
    "question": "AI helps with a decision that could affect another person. What should happen before acting?",
    "options": [
      "Let AI decide alone.",
      "Act quickly without telling anyone.",
      "Use the answer only if it is convenient.",
      "A human should review the impact, fairness, and accuracy."
    ],
    "answer": 3,
    "reason": "People should stay responsible when AI output affects others."
  },
  {
    "id": "P-01",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "A student wants AI to help plan a science investigation. Which prompt gives the clearest starting brief?",
    "options": [
      "Suggest a plant investigation with a clear question",
      "Plan a plant experiment and presentation for my class",
      "Suggest a testable bean-plant investigation for grade 6 using cups, soil, and one week",
      "Design a bean project with an interesting display"
    ],
    "answer": 2,
    "reason": "A strong starting brief names the task, audience, materials, and practical limit.",
    "exhibit": {
      "kind": "prompt",
      "label": "Draft prompt",
      "content": "Help me with a plant project."
    }
  },
  {
    "id": "P-02",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "You need a three-slide presentation for families about recycling. Which request is most usable?",
    "options": [
      "Explain recycling for families in three slides with one action per slide",
      "Make a three-slide presentation about recycling for families",
      "List the most important recycling facts for families",
      "Write a friendly recycling message for family night"
    ],
    "answer": 0,
    "reason": "Audience, format, length, and purpose turn a broad idea into a usable request.",
    "exhibit": {
      "kind": "prompt",
      "label": "Assignment note",
      "content": "3 slides • family night • clear action steps"
    }
  },
  {
    "id": "P-03",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI gives a paragraph that is accurate but too advanced for your class. What is the best revision prompt?",
    "options": [
      "Make it shorter for my class",
      "Use simpler words and remove the science vocabulary",
      "Keep the facts but make the paragraph more engaging",
      "Use simpler words, keep the key idea, and define one new term for a sixth-grade reader"
    ],
    "answer": 3,
    "reason": "A revision request should name what changes and what must remain.",
    "exhibit": {
      "kind": "prompt",
      "label": "AI draft",
      "content": "Photosynthesis converts radiant energy into chemical energy."
    }
  },
  {
    "id": "P-04",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "You want AI feedback without handing over your writing. Which request keeps you in charge?",
    "options": [
      "Rewrite my paragraph so it earns an A",
      "Point out two places a reader may be confused and ask me a question for each",
      "Mark grammar mistakes and suggest a stronger ending",
      "Tell me which paragraph is strongest and why"
    ],
    "answer": 1,
    "reason": "Specific feedback questions support revision while leaving the writing decisions with the student.",
    "exhibit": {
      "kind": "prompt",
      "label": "Writer goal",
      "content": "I need help revising, not a replacement paragraph."
    }
  },
  {
    "id": "P-05",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "A club needs poster ideas for a one-hour build session. Which added constraint makes AI's ideas practical?",
    "options": [
      "Use a bright style with a bold title and simple image",
      "Make a memorable poster with one clear message",
      "Include a slogan and one supporting fact",
      "Give five ideas that use cardboard, markers, and one hour of work"
    ],
    "answer": 3,
    "reason": "A useful constraint connects ideas to the time and materials actually available.",
    "exhibit": {
      "kind": "prompt",
      "label": "Club supply cart",
      "content": "Cardboard • markers • tape • 60 minutes"
    }
  },
  {
    "id": "P-06",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI is helping make a study plan, but it suggests four hours every night. What is the best follow-up?",
    "options": [
      "Keep the topics but shorten each study session",
      "Add more encouraging reminders to the plan",
      "Revise the plan for 35 minutes on school nights, the quiz date, and two available resources",
      "Move the hardest topic to the final night"
    ],
    "answer": 2,
    "reason": "A good follow-up corrects the plan with the real schedule and resources.",
    "exhibit": {
      "kind": "record",
      "label": "Available study time",
      "content": "Mon–Thu: 35 min • Quiz: Friday • Notes + textbook"
    }
  },
  {
    "id": "P-07",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "An AI outline has useful ideas but skips the counterargument your teacher requires. What should you ask next?",
    "options": [
      "Add a counterargument section, one supporting example, and a response that fits this outline",
      "Replace the outline with a new topic and claim",
      "Expand each existing point with another detail",
      "Use stronger words in the conclusion"
    ],
    "answer": 0,
    "reason": "The best follow-up names the missing element and asks it to fit the work already started.",
    "exhibit": {
      "kind": "record",
      "label": "Teacher checklist",
      "content": "Claim ✓ • Evidence ✓ • Counterargument missing"
    }
  },
  {
    "id": "P-08",
    "category": "prompting",
    "type": "Road Scenario",
    "level": 2,
    "question": "You asked AI for interview questions and one sounds too personal. What is the smartest revision request?",
    "options": [
      "Keep only the questions about the person's work",
      "Reword question 4 more politely",
      "Replace question 4 with an open question about the person's work, not private life",
      "Mark question 4 as optional for the interviewee"
    ],
    "answer": 2,
    "reason": "A precise revision can keep the interview useful while setting an appropriate boundary.",
    "exhibit": {
      "kind": "prompt",
      "label": "Question 4",
      "content": "What is the hardest thing happening at home right now?"
    }
  },
  {
    "id": "E-01",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI writes a polished introduction for an assignment meant to show your own thinking. What is the best next move?",
    "options": [
      "Use the introduction but rewrite the first and last sentence",
      "Use its ideas as notes, write your own introduction, and follow the class AI rule",
      "Ask whether the assignment allows an AI draft to be submitted",
      "Use it if the group agrees the wording is accurate"
    ],
    "answer": 1,
    "reason": "The learning and final responsibility stay with the student, along with any disclosure required by the class.",
    "exhibit": {
      "kind": "record",
      "label": "Assignment rule",
      "content": "Show your own reasoning. AI may be used for feedback if disclosed."
    }
  },
  {
    "id": "E-02",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "Your group uses AI to sort shared notes. Which plan gives fair credit?",
    "options": [
      "Let the editor who formats the final file take the main credit",
      "Replace the shared notes with the AI summary before the group reviews it",
      "Mention AI only if a teacher asks about the process",
      "Keep original contributions visible and agree on how AI assistance will be noted"
    ],
    "answer": 3,
    "reason": "Fair group work keeps people’s contributions visible and makes the use of AI a shared decision.",
    "exhibit": {
      "kind": "record",
      "label": "Shared notes",
      "content": "Jordan: sources • Mei: outline • Luis: examples • AI: sorting draft"
    }
  },
  {
    "id": "E-03",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "An AI image search shows mostly one kind of person when you ask for 'scientists.' What should you do?",
    "options": [
      "Notice the pattern, broaden the request, and review the results before choosing",
      "Choose the most polished images from the first results",
      "Assume the results show who usually works in science",
      "Use the current results but add a diversity statement"
    ],
    "answer": 0,
    "reason": "Bias is a reason to inspect and improve the result, not to accept it as a neutral picture of the world.",
    "exhibit": {
      "kind": "photo",
      "label": "First image results",
      "content": "Eight lab-coat portraits; all show the same demographic."
    }
  },
  {
    "id": "E-04",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "An AI tool suggests a consequence for a student conflict. Who should make the final decision?",
    "options": [
      "The AI, because it compares many past cases",
      "The adult who entered the shortest description",
      "The adults responsible for the decision after checking facts, rules, context, and possible bias",
      "The students involved after reading the tool's recommendation"
    ],
    "answer": 2,
    "reason": "High-impact decisions need accountable people who can examine context and explain their judgment.",
    "exhibit": {
      "kind": "record",
      "label": "Tool suggestion",
      "content": "Recommended consequence: three-day suspension"
    }
  },
  {
    "id": "E-05",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "A class poster was drafted with AI, then heavily revised by students. What is the most honest credit line when disclosure is required?",
    "options": [
      "Class team created the final poster",
      "AI generated the poster; student revisions were minor",
      "Class team, with AI used for an early draft and students responsible for final edits",
      "Class team adapted an online design"
    ],
    "answer": 2,
    "reason": "A useful disclosure describes the real role of both people and the tool.",
    "exhibit": {
      "kind": "record",
      "label": "Production notes",
      "content": "AI: first layout • Students: facts, images, edits, final approval"
    }
  },
  {
    "id": "E-06",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "A friend asks you to make a realistic fake audio clip of the principal cancelling school. What is the strongest response?",
    "options": [
      "Refuse because impersonation can deceive people and cause harm",
      "Make the clip but add a joke label in the caption",
      "Use a fictional administrator name instead",
      "Share it only in a private group chat"
    ],
    "answer": 0,
    "reason": "The problem is the deceptive impersonation and likely harm, not only the size of the audience.",
    "exhibit": {
      "kind": "headline",
      "label": "Possible post",
      "content": "BREAKING: School closed tomorrow, principal says"
    }
  },
  {
    "id": "E-07",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "A hiring helper ranks applicants lower when their career paths include time away for caregiving. What should the team do first?",
    "options": [
      "Use the ranking because it applies the same formula to everyone",
      "Keep the ranking but remove the caregiving label from the report",
      "Ask the tool to explain which gaps matter most",
      "Review the pattern, the data, and the job-related criteria before relying on it"
    ],
    "answer": 3,
    "reason": "A consistent pattern can still be unfair; the team must examine whether the criteria create unjust harm.",
    "exhibit": {
      "kind": "record",
      "label": "Ranking note",
      "content": "Lower scores cluster around applicants with multi-year caregiving gaps."
    }
  },
  {
    "id": "E-08",
    "category": "ethics",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI suggests a flyer style that closely imitates a living local artist. What is the best next step?",
    "options": [
      "Use the style but remove the artist’s name",
      "Ask for an original direction based on the event’s own message and check usage rules",
      "Keep the layout but replace the colors and headline",
      "Use the artist as a reference only for the audience and mood"
    ],
    "answer": 1,
    "reason": "An original direction respects the artist while still giving the event a strong visual identity.",
    "exhibit": {
      "kind": "photo",
      "label": "Reference request",
      "content": "Make it look exactly like this artist’s current poster series."
    }
  },
  {
    "id": "D-01",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "You want AI help summarizing a student incident record. What should happen before anything is shared?",
    "options": [
      "Share the full record so the summary includes every detail",
      "Use initials but leave the family phone number for context",
      "Upload the record, then clear the conversation afterward",
      "Remove identifying details and use only an approved tool and process"
    ],
    "answer": 3,
    "reason": "Sensitive records call for approved tools, the least necessary information, and removal of identifiers.",
    "exhibit": {
      "kind": "record",
      "label": "Incident record",
      "content": "Student: A. Rivera • Parent phone: 555-0142 • Room: 208"
    }
  },
  {
    "id": "D-02",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "Which version of an email example gives AI enough context with the least private information?",
    "options": [
      "Use the original email but remove the attachment",
      "Replace names with roles and remove contact details before sharing the relevant paragraph",
      "Send a screenshot of the message thread with names visible",
      "Use a real email from a different family as a model"
    ],
    "answer": 1,
    "reason": "Placeholders preserve the useful structure without exposing people’s identities or extra messages.",
    "exhibit": {
      "kind": "record",
      "label": "Email draft",
      "content": "To: maria.lopez@example.com\nHi Maria, I need to discuss your child's schedule."
    }
  },
  {
    "id": "D-03",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "A new AI website asks for a student roster to make reading groups. What is the best first move?",
    "options": [
      "Review the site's privacy page, then upload the roster",
      "Replace one student name with an initial and upload the list",
      "Check with the school’s approved-tool rules before uploading any roster",
      "Ask students to type their own names into the site"
    ],
    "answer": 2,
    "reason": "When student data is involved, approval and the allowed process come before convenience.",
    "exhibit": {
      "kind": "headline",
      "label": "Website prompt",
      "content": "Upload your class list to generate personalized reading groups."
    }
  },
  {
    "id": "D-04",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "A class asks whether they can use AI to edit a photo from a field trip. Which question matters first?",
    "options": [
      "Whether the photo contains identifiable students and the approved process allows this use",
      "Whether the final image can be posted on the class page",
      "Whether the tool can sharpen faces and improve lighting",
      "Whether the group can finish edits before the next class"
    ],
    "answer": 0,
    "reason": "The first responsibility is to identify whether personal information is present and whether the use is authorized.",
    "exhibit": {
      "kind": "photo",
      "label": "Field-trip photo",
      "content": "Six students visible with school badges and a bus number."
    }
  },
  {
    "id": "D-05",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "A photo of a science fair project includes a student ID badge and home address on a shipping label. What is the safest way to ask AI for a caption?",
    "options": [
      "Crop the photo so the project fills most of the frame",
      "Cover the address but leave the student ID visible",
      "Crop or blur the badge and address, or write the caption without uploading the photo",
      "Upload a lower-resolution copy with the full photo"
    ],
    "answer": 2,
    "reason": "Images can contain sensitive information; remove it before sharing or use a text-only description instead.",
    "exhibit": {
      "kind": "photo",
      "label": "Photo check",
      "content": "Badge: 482917 • Label: 14 Oak Street"
    }
  },
  {
    "id": "D-06",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "A counselor needs language help for a family message. Which prompt follows data minimization?",
    "options": [
      "Rewrite this message to Student A’s family about a missed meeting; leave out names, medical details, and account numbers",
      "Share the full message and remove the student's last name",
      "Include the family’s address so the message can sound personal",
      "Upload several past messages to show the counselor's usual tone"
    ],
    "answer": 0,
    "reason": "Only the task-relevant, non-identifying text should be shared, and only through an approved process.",
    "exhibit": {
      "kind": "prompt",
      "label": "Message goal",
      "content": "Warm reminder about a missed meeting; no student-specific details needed."
    }
  },
  {
    "id": "D-07",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "A student offers to paste a friend’s medical note into an AI chatbot to 'make it simpler.' What should you advise?",
    "options": [
      "Use a chatbot if the friend agrees to the summary",
      "Remove the doctor's name and keep the health details",
      "Ask a family member to paste the note instead",
      "Do not upload it; use an approved support process and ask a responsible adult for help"
    ],
    "answer": 3,
    "reason": "A medical note is sensitive information; convenience and informal permission do not make a public chatbot appropriate.",
    "exhibit": {
      "kind": "record",
      "label": "Student request",
      "content": "Can you put this doctor note into the chatbot so I understand it?"
    }
  },
  {
    "id": "D-08",
    "category": "privacy",
    "type": "Road Scenario",
    "level": 2,
    "question": "A teacher wants AI to spot themes in anonymous exit tickets. What plan is strongest?",
    "options": [
      "Upload scanned tickets after covering the name line",
      "Use an approved tool, remove names and other identifiers, and share only the ticket text needed for the analysis",
      "Ask a student helper to type all responses into a chatbot",
      "Use the tool first, then ask whether the data should have been shared"
    ],
    "answer": 1,
    "reason": "Even when a task is useful, the tool, data minimization, and privacy steps must be settled first.",
    "exhibit": {
      "kind": "record",
      "label": "Exit tickets",
      "content": "Name field • handwritten response • class period"
    }
  },
  {
    "id": "V-01",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI gives a surprising statistic but no source. What is the best next step?",
    "options": [
      "Use it if the wording sounds confident",
      "Ask AI to explain how it calculated the number",
      "Remove the number but keep the main claim",
      "Ask for a source, then open a reliable source and check the claim yourself"
    ],
    "answer": 3,
    "reason": "A confident claim still needs evidence from a source you can inspect.",
    "exhibit": {
      "kind": "headline",
      "label": "AI answer",
      "content": "'Teen recycling increased 47% last year.' No link provided."
    }
  },
  {
    "id": "V-02",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "You need the exact wording of a new school policy. Which source is strongest?",
    "options": [
      "An official published policy document",
      "A family newsletter that summarizes the policy",
      "A parent-group post that quotes part of the policy",
      "AI’s answer that names the policy but has no link"
    ],
    "answer": 0,
    "reason": "The official policy is the primary source for its actual language.",
    "exhibit": {
      "kind": "headline",
      "label": "Search results",
      "content": "1. District policy PDF  2. Parent group post  3. AI summary"
    }
  },
  {
    "id": "V-03",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI gives a quotation for a history project. What is the strongest check?",
    "options": [
      "Check whether the quote appears in several secondary summaries",
      "Find the quotation in the original or a trustworthy primary source",
      "Use it if the wording fits what you already know",
      "Ask AI to provide a longer version with a date"
    ],
    "answer": 1,
    "reason": "A quotation needs to be checked against its source for wording and context.",
    "exhibit": {
      "kind": "record",
      "label": "AI quote",
      "content": "'The future belongs to every inventor.' — 1908"
    }
  },
  {
    "id": "V-04",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "Two reliable articles disagree about whether a program worked. What should you compare before choosing a conclusion?",
    "options": [
      "Which report has the stronger headline and clearer chart",
      "Which report includes more quoted interviews",
      "Which conclusion best matches the first article you read",
      "Their evidence, dates, methods, and what each one actually measured"
    ],
    "answer": 3,
    "reason": "Disagreement is a reason to inspect evidence and context more closely.",
    "exhibit": {
      "kind": "headline",
      "label": "Two reports",
      "content": "Report A: attendance improved • Report B: no significant change"
    }
  },
  {
    "id": "V-05",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI cites a study, but the link leads to a page that does not exist. What should you conclude?",
    "options": [
      "Check the remaining citations, but keep using the summary for now",
      "Search the study title and use the first similar result",
      "AI can invent convincing citations, so every source needs to be opened and checked",
      "Treat the missing link as a formatting problem and cite the author anyway"
    ],
    "answer": 2,
    "reason": "One fabricated citation is evidence that each cited source must be verified individually.",
    "exhibit": {
      "kind": "record",
      "label": "Citation check",
      "content": "J. Lee (2025), 'Learning Futures' → 404 Not Found"
    }
  },
  {
    "id": "V-06",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "A viral image claims a bridge collapsed today. What is the best first verification move?",
    "options": [
      "Save the post and wait to see whether friends confirm it",
      "Trace the image to its original source and compare current reporting from reliable outlets",
      "Inspect the lighting and shadows before checking any sources",
      "Ask the post author where they found the image"
    ],
    "answer": 1,
    "reason": "Source tracing and current reliable reporting are stronger than judging an image by appearance alone.",
    "exhibit": {
      "kind": "headline",
      "label": "Viral post",
      "content": "BREAKING: Main Street bridge collapsed this morning"
    }
  },
  {
    "id": "V-07",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI solves a math problem and gives an answer that looks reasonable. What is the best check?",
    "options": [
      "Check the steps and solve it another way or use an appropriate calculator",
      "Compare the final number with your first estimate",
      "Ask AI to show the same steps in more detail",
      "Use the answer if it matches a classmate's result"
    ],
    "answer": 0,
    "reason": "A second method and a review of the reasoning can catch confident calculation errors.",
    "exhibit": {
      "kind": "record",
      "label": "AI work",
      "content": "18 × 7 = 136"
    }
  },
  {
    "id": "V-08",
    "category": "verification",
    "type": "Road Scenario",
    "level": 2,
    "question": "AI summarizes a current event using sources from last year. What should you do before using it?",
    "options": [
      "Use the summary if two of the older sources agree",
      "Check for newer reliable reporting and compare dates to the claim you are making",
      "Keep the summary but add a note that sources may be old",
      "Ask AI to rewrite the summary in the present tense"
    ],
    "answer": 1,
    "reason": "For changing information, the source date must fit the claim’s time frame.",
    "exhibit": {
      "kind": "record",
      "label": "Source dates",
      "content": "Article A: March 2025 • Claim needed: September 2026"
    }
  }
];

/*
 * "Know It" cards from the designer handoff. They are vocabulary checks rather than
 * situations, so they are OFF by default. Set includeKnowItCards: true in
 * content/settings.js to add them to the red-light pool.
 */
window.ROAD_TEST_KNOW_IT = [
  {
    "id": "PR-KI-01",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "What is usually the strongest prompt?",
    "options": [
      "“Explain photosynthesis to a 7th grader using a simple example.”",
      "“Help me.”",
      "“Write something good.”",
      "“Do my work.”"
    ],
    "answer": 0,
    "reason": "It gives a clear task, audience, and format."
  },
  {
    "id": "PR-KI-02",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "Which detail usually helps AI give a more useful answer?",
    "options": [
      "Your password.",
      "The audience or grade level.",
      "A random emoji.",
      "Nothing; AI reads your mind."
    ],
    "answer": 1,
    "reason": "Audience level helps AI choose the right vocabulary and detail."
  },
  {
    "id": "PR-KI-03",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "In a prompt, what does “format” mean?",
    "options": [
      "The color of the AI screen.",
      "A secret code only AI understands.",
      "The way you want the answer organized.",
      "A rule that makes AI always correct."
    ],
    "answer": 2,
    "reason": "Format tells AI whether you want bullets, a table, a paragraph, a quiz, or another structure."
  },
  {
    "id": "PR-KI-04",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "What should a strong learning prompt usually include?",
    "options": [
      "Only one vague word.",
      "Private information about other people.",
      "A command to be perfect.",
      "Task, context, audience, and limits."
    ],
    "answer": 3,
    "reason": "Clear context and limits help AI support the learning goal."
  },
  {
    "id": "PR-KI-05",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "Why can an example improve a prompt?",
    "options": [
      "It shows the style or quality you want.",
      "It makes every AI answer true.",
      "It lets you skip thinking.",
      "It hides where the work came from."
    ],
    "answer": 0,
    "reason": "Examples give AI a pattern to follow, but the output still needs review."
  },
  {
    "id": "PR-KI-06",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "What does “iterate” mean when using AI?",
    "options": [
      "Ask once and never revise.",
      "Improve the answer through follow-up prompts.",
      "Delete your work and start over.",
      "Let AI decide everything."
    ],
    "answer": 1,
    "reason": "Good AI use often means asking, checking, and refining."
  },
  {
    "id": "PR-KI-07",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "Which prompt best asks AI to adjust reading level?",
    "options": [
      "“Fix.”",
      "“Make it fancy.”",
      "“Rewrite this for 6th graders in about 150 words.”",
      "“Do it.”"
    ],
    "answer": 2,
    "reason": "It names the task, reading level, and length."
  },
  {
    "id": "PR-KI-08",
    "category": "prompting",
    "type": "Know It",
    "level": 1,
    "question": "Which phrase gives AI a useful role without pretending it is a real person?",
    "options": [
      "“Be my real doctor.”",
      "“You are my parent now.”",
      "“You know everything.”",
      "“Act as a writing coach.”"
    ],
    "answer": 3,
    "reason": "A role can shape feedback, but AI is still a tool and not a real expert or caregiver."
  },
  {
    "id": "DP-KI-01",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Which information is safest to share with AI?",
    "options": [
      "A made-up example for practice.",
      "Your home address.",
      "Your password.",
      "Your student ID number."
    ],
    "answer": 0,
    "reason": "Made-up examples can protect real personal information."
  },
  {
    "id": "DP-KI-02",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Which item should never be pasted into an AI chat?",
    "options": [
      "A made-up character name.",
      "A password.",
      "A general topic like “weather.”",
      "A public vocabulary word."
    ],
    "answer": 1,
    "reason": "Passwords protect accounts and should stay private."
  },
  {
    "id": "DP-KI-03",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "What does personal information mean?",
    "options": [
      "Any word with more than five letters.",
      "Only information about celebrities.",
      "Details that can identify a real person.",
      "Only information stored on paper."
    ],
    "answer": 2,
    "reason": "Names, addresses, ID numbers, birthdays, and photos can identify people."
  },
  {
    "id": "DP-KI-04",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Before asking AI to improve an incident report, what should you remove?",
    "options": [
      "All punctuation.",
      "Every verb.",
      "The main question.",
      "Names, student IDs, addresses, and other identifying details."
    ],
    "answer": 3,
    "reason": "You can ask for writing help without exposing real people."
  },
  {
    "id": "DP-KI-05",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Why use fake names or placeholders in an AI prompt?",
    "options": [
      "To protect real people’s privacy.",
      "To make AI angry.",
      "To make facts impossible to check.",
      "To hide the topic from yourself."
    ],
    "answer": 0,
    "reason": "Placeholders let you describe the situation without sharing identities."
  },
  {
    "id": "DP-KI-06",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Why can screenshots be risky to upload to AI?",
    "options": [
      "They are always blank.",
      "They may show names, faces, messages, locations, or account details.",
      "AI cannot read images.",
      "Screenshots make prompts too short."
    ],
    "answer": 1,
    "reason": "Screenshots often contain more private information than people notice."
  },
  {
    "id": "DP-KI-07",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Which prompt is the safest?",
    "options": [
      "“Here is my friend’s full name and private problem.”",
      "“Here is my password so you can fix my account.”",
      "“Use this made-up scenario to help me practice a respectful response.”",
      "“Here is a screenshot of private messages.”"
    ],
    "answer": 2,
    "reason": "Made-up or generalized details reduce privacy risk."
  },
  {
    "id": "DP-KI-08",
    "category": "privacy",
    "type": "Know It",
    "level": 1,
    "question": "Before using AI with school-related information, what should you check?",
    "options": [
      "Whether AI says it is okay.",
      "Whether the prompt is funny.",
      "Whether a friend dared you.",
      "Teacher directions and school-approved tool rules."
    ],
    "answer": 3,
    "reason": "School data should be handled according to school expectations and approved tools."
  },
  {
    "id": "VF-KI-01",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "Why should you check important facts from AI?",
    "options": [
      "AI can sound confident even when it is wrong.",
      "AI is always joking.",
      "AI never gives useful information.",
      "AI only works for math."
    ],
    "answer": 0,
    "reason": "AI can produce incorrect information in a believable way."
  },
  {
    "id": "VF-KI-02",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "What is an AI hallucination?",
    "options": [
      "A verified source list.",
      "A made-up or unsupported answer that sounds real.",
      "A password warning.",
      "A shorter prompt."
    ],
    "answer": 1,
    "reason": "AI can generate false details, names, quotes, or sources."
  },
  {
    "id": "VF-KI-03",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "Which source is usually best for checking a school rule?",
    "options": [
      "A random AI answer with no source.",
      "A meme.",
      "The official school handbook, teacher, or school website.",
      "A friend’s guess from last year."
    ],
    "answer": 2,
    "reason": "Rules should be checked with the people or documents that set them."
  },
  {
    "id": "VF-KI-04",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "What does a citation help you do?",
    "options": [
      "Make a false claim true.",
      "Hide your sources.",
      "Avoid reading.",
      "Trace where information came from."
    ],
    "answer": 3,
    "reason": "Citations help readers check the source and context."
  },
  {
    "id": "VF-KI-05",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "Why does the date of information matter?",
    "options": [
      "Some facts, prices, rules, and events change over time.",
      "Old information is always better.",
      "Dates make sources impossible to read.",
      "AI cannot use numbers."
    ],
    "answer": 0,
    "reason": "Current topics need current sources."
  },
  {
    "id": "VF-KI-06",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "Which type of information needs extra verification before use?",
    "options": [
      "A made-up character name.",
      "Health, safety, current events, statistics, or legal rules.",
      "Your favorite color.",
      "A practice sentence you invented."
    ],
    "answer": 1,
    "reason": "High-impact or changing information should be checked carefully."
  },
  {
    "id": "VF-KI-07",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "What does cross-checking mean?",
    "options": [
      "Copying the first answer.",
      "Deleting the question.",
      "Comparing a claim with reliable sources.",
      "Using only sources you already agree with."
    ],
    "answer": 2,
    "reason": "Cross-checking reduces the chance of using a false or incomplete claim."
  },
  {
    "id": "VF-KI-08",
    "category": "verification",
    "type": "Know It",
    "level": 1,
    "question": "Which claim should not be used until it is verified?",
    "options": [
      "A made-up example labeled as made-up.",
      "A spelling correction.",
      "A personal opinion clearly labeled as opinion.",
      "A quote from a famous person with no source."
    ],
    "answer": 3,
    "reason": "Quotes should be traced to a reliable original or trusted source."
  },
  {
    "id": "ET-KI-01",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "Which question is most connected to ethical AI use?",
    "options": [
      "Is this fair, honest, and still connected to my own thinking?",
      "Is this the fastest option?",
      "Can AI make this sound fancy?",
      "Can I hide that I used AI?"
    ],
    "answer": 0,
    "reason": "Ethical AI use includes honesty, fairness, and ownership."
  },
  {
    "id": "ET-KI-02",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "What is bias in an AI system?",
    "options": [
      "A type of computer charger.",
      "An unfair pattern that can affect some people or groups.",
      "A guarantee that AI is correct.",
      "A way to make a prompt shorter."
    ],
    "answer": 1,
    "reason": "Bias can lead to unfair or one-sided outputs."
  },
  {
    "id": "ET-KI-03",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "What does attribution mean?",
    "options": [
      "Deleting all sources.",
      "Pretending you worked alone.",
      "Giving credit for help, ideas, or sources.",
      "Making the answer longer."
    ],
    "answer": 2,
    "reason": "Attribution helps others understand what support or sources were used."
  },
  {
    "id": "ET-KI-04",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "Which action shows academic honesty when AI is allowed?",
    "options": [
      "Use AI secretly for everything.",
      "Claim AI output as your own thinking.",
      "Ignore the assignment rules.",
      "Use AI in the allowed way and explain or cite it if required."
    ],
    "answer": 3,
    "reason": "Honesty means following the purpose and limits of the task."
  },
  {
    "id": "ET-KI-05",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "What does human oversight mean?",
    "options": [
      "A person checks and is responsible for important AI-assisted decisions.",
      "AI makes every choice alone.",
      "No one reads the answer.",
      "The computer watches humans."
    ],
    "answer": 0,
    "reason": "People should review AI output, especially when it affects others."
  },
  {
    "id": "ET-KI-06",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "In schoolwork, what does ownership mean?",
    "options": [
      "AI did all the thinking.",
      "The final work reflects your thinking, choices, and effort.",
      "You copied without understanding.",
      "You hid every source."
    ],
    "answer": 1,
    "reason": "Learning work should still show what the student understands."
  },
  {
    "id": "ET-KI-07",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "Which use of AI is most respectful?",
    "options": [
      "Using AI to mock a classmate.",
      "Using AI to make fake rumors.",
      "Using AI to make learning more accessible while checking the result.",
      "Using AI to embarrass someone."
    ],
    "answer": 2,
    "reason": "Responsible AI use should reduce harm and support people."
  },
  {
    "id": "ET-KI-08",
    "category": "ethics",
    "type": "Know It",
    "level": 1,
    "question": "Why might AI output be unfair?",
    "options": [
      "AI is always fair.",
      "Fairness never matters online.",
      "AI only uses facts from one textbook.",
      "Training data, design choices, or user prompts can reflect bias."
    ],
    "answer": 3,
    "reason": "AI can repeat patterns from data or instructions, including unfair ones."
  }
];
