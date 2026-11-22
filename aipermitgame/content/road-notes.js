/*
 * AI ROAD TEST: PERMIT DRIVE - STOP SIGN ROAD NOTES
 * -------------------------------------------------
 * Road Notes appear after the driver makes a FULL STOP at a stop sign.
 * They are information only: nothing to answer, no credit to win or lose.
 * Drivers collect them in their Road Notes logbook.
 *
 * Safe to edit: change text, add notes, remove notes.
 *   kind  : "history" | "how-ai-works" | "myth" | "around-you"
 *   title : short headline
 *   body  : one to three short sentences
 *   source: optional fact-check reference (shown small at the bottom)
 *
 * Facts are adapted from the AI History and AI Tech Check decks in
 * "AI Road Test - Card Deck Designer Handoff.xlsx" and the earlier build's learning cards.
 */
window.ROAD_TEST_NOTES = [
  // ---------- AI HISTORY ----------
  { id: "h-decades", kind: "history", title: "AI is older than you think",
    body: "People have been building and studying AI for about 70 years. Newer chatbots made it more visible, but the field started long before smartphones.",
    source: "Encyclopaedia Britannica: History of artificial intelligence" },
  { id: "h-turing", kind: "history", title: "1950: Can machines think?",
    body: "Mathematician Alan Turing proposed an 'imitation game' in 1950. If a machine could hold a conversation that seemed human, should we call it intelligent? People still debate his question today.",
    source: "Stanford Encyclopedia of Philosophy: The Turing Test" },
  { id: "h-dartmouth", kind: "history", title: "1956: AI gets its name",
    body: "A summer workshop at Dartmouth College in 1956 brought researchers together around a new phrase: artificial intelligence. It is often called the starting line of AI as a field.",
    source: "Dartmouth: Artificial Intelligence Coined at Dartmouth" },
  { id: "h-eliza", kind: "history", title: "1960s: Meet ELIZA",
    body: "ELIZA was an early chatbot from the 1960s. It used simple pattern rules to reflect your words back as questions, and some people still felt like it understood them.",
    source: "Encyclopaedia Britannica: Chatbot" },
  { id: "h-winters", kind: "history", title: "AI winters",
    body: "AI has gone through boom-and-bust cycles. When big promises did not come true, funding and excitement dropped. These slow periods are called AI winters.",
    source: "Encyclopaedia Britannica: History of artificial intelligence" },
  { id: "h-deepblue", kind: "history", title: "1997: Deep Blue wins at chess",
    body: "IBM's Deep Blue beat world chess champion Garry Kasparov in a 1997 match. It was a huge moment, but Deep Blue could only play chess. It could not do anything else.",
    source: "IBM: Deep Blue" },
  { id: "h-ml", kind: "history", title: "From rules to patterns",
    body: "Early AI followed rules people wrote by hand. Machine learning changed that: systems learn patterns from lots of examples instead.",
    source: "Google: Machine Learning Crash Course" },
  { id: "h-spam", kind: "history", title: "Your inbox used AI first",
    body: "Long before chatbots, AI was quietly sorting spam email, recommending videos, and suggesting spelling fixes. AI has been part of everyday tools for years.",
    source: "IBM: History of artificial intelligence" },
  { id: "h-ingredients", kind: "history", title: "Why AI got better so fast",
    body: "Three ingredients powered recent AI progress: much more data, much stronger computers, and better methods for training models.",
    source: "IBM: History of artificial intelligence" },
  { id: "h-alphago", kind: "history", title: "2016: AlphaGo",
    body: "Google DeepMind's AlphaGo beat a top professional at Go, a board game with more possible positions than there are atoms in the universe. Experts had expected that to take another decade.",
    source: "Google DeepMind: AlphaGo" },
  { id: "h-genai", kind: "history", title: "Why chatbots felt brand new",
    body: "Generative AI let anyone create text, images, or code just by typing everyday language. That is why AI suddenly felt new to so many people, even though the field is decades old.",
    source: "IBM: What is generative AI?" },

  // ---------- HOW AI WORKS ----------
  { id: "w-predict", kind: "how-ai-works", title: "Chatbots predict the next piece",
    body: "A text AI builds its answer one small piece at a time by predicting what is likely to come next. That is why it can sound smooth and still be wrong.",
    source: "IBM: LLM training" },
  { id: "w-tokens", kind: "how-ai-works", title: "Tokens are AI's puzzle pieces",
    body: "AI models read and write text in chunks called tokens. A token can be a whole word, part of a word, or a punctuation mark.",
    source: "AWS Bedrock: Key terminology" },
  { id: "w-training", kind: "how-ai-works", title: "Training data shapes the model",
    body: "A model learns from huge sets of examples called training data. What is in the data, and what is missing, affects what the model can do well.",
    source: "IBM: What are large language models?" },
  { id: "w-inference", kind: "how-ai-works", title: "Training first, then use",
    body: "Training is when a model learns patterns. Using the finished model to answer your new request is called inference.",
    source: "IBM: What is AI inference?" },
  { id: "w-inout", kind: "how-ai-works", title: "Input in, output out",
    body: "Your prompt is the input: the instruction or question you give AI. The response it gives back is the output. Better input usually means more useful output.",
    source: "AWS: What is a large language model?" },
  { id: "w-hallucination", kind: "how-ai-works", title: "What is a hallucination?",
    body: "When AI makes up information that sounds real, like a fake quote or a study that does not exist, it is called a hallucination.",
    source: "IBM watsonx: Hallucination risk" },
  { id: "w-context", kind: "how-ai-works", title: "The context window",
    body: "A model can only consider a certain amount of text at once. That limit is its context window. In very long chats, earlier details can get lost.",
    source: "AWS Security Blog: Context window overflow" },
  { id: "w-temperature", kind: "how-ai-works", title: "Turning up the temperature",
    body: "Many AI tools have a 'temperature' setting. Higher temperature makes answers more varied and creative. It does not make them more accurate.",
    source: "AWS Bedrock: Inference parameters" },
  { id: "w-notsearch", kind: "how-ai-works", title: "A chatbot is not a search engine",
    body: "Some AI tools can search the web, but a generated answer may come from patterns without checking any current source. Always look for where a fact came from.",
    source: "IBM watsonx: Hallucination risk" },
  { id: "w-bias", kind: "how-ai-works", title: "Where bias comes from",
    body: "AI bias can come from the training data, the design choices people make, or the way the tool is used. Systems need to be tested for unfair patterns.",
    source: "Google: ML Crash Course, Types of bias" },
  { id: "w-generative", kind: "how-ai-works", title: "What makes AI 'generative'",
    body: "Generative AI creates new content such as text, images, audio, or code based on patterns it learned during training.",
    source: "IBM: What is generative AI?" },
  { id: "w-hitl", kind: "how-ai-works", title: "Human in the loop",
    body: "'Human in the loop' means a person reviews or guides AI-assisted work, especially when it affects other people. It is how errors and bias get caught.",
    source: "NIST AI 600-1: Generative AI Profile" },
  { id: "w-purpose", kind: "how-ai-works", title: "People set the purpose",
    body: "People choose an AI system's goal, data, rules, and use. Those human choices shape what it does and who it helps or harms.",
    source: "NIST AI Risk Management Framework 1.0" },

  // ---------- MYTH vs. FACT ----------
  { id: "m-alwaysright", kind: "myth", title: "Myth: AI answers are always correct",
    body: "Fact: AI can give confident answers that are wrong or invented. Check anything important against a reliable source.",
    source: "NIST AI 600-1: Generative AI Profile" },
  { id: "m-neutral", kind: "myth", title: "Myth: AI is neutral",
    body: "Fact: AI learns from data made by people, and people make the design choices. Bias can show up in results unless someone checks for it.",
    source: "NIST AI 600-1: Generative AI Profile" },
  { id: "m-weightless", kind: "myth", title: "Myth: AI lives in a cloud of nothing",
    body: "Fact: AI runs on real chips, servers, cables, and buildings called data centers. Making and running that equipment uses materials, energy, and sometimes water for cooling.",
    source: "IEA: Energy and AI" },
  { id: "m-sameenergy", kind: "myth", title: "Myth: Every AI prompt costs the same",
    body: "Fact: Energy use depends on the model, the task, the hardware, and how the data center is cooled. One number cannot describe every AI request.",
    source: "IEA: Energy and AI" },
  { id: "m-jobs", kind: "myth", title: "Myth: If AI can do a task, the job is gone",
    body: "Fact: AI may change some tasks in a job without replacing the whole job. How people choose to adopt AI matters a lot.",
    source: "ILO: Generative AI and jobs" },
  { id: "m-understands", kind: "myth", title: "Myth: The chatbot understands you like a friend",
    body: "Fact: A chatbot predicts language patterns. It can be helpful and kind-sounding, but it does not know you, remember you like a person, or care about you the way people do.",
    source: "IBM: What are large language models?" },
  { id: "m-private", kind: "myth", title: "Myth: What you type into AI just disappears",
    body: "Fact: Depending on the tool and its settings, what you type may be stored or reviewed. That is why you leave out private details.",
    source: "NIST AI 600-1: Generative AI Profile" },

  // ---------- AI AROUND YOU ----------
  { id: "a-maps", kind: "around-you", title: "AI in your map app",
    body: "Navigation apps use AI-style predictions to estimate traffic and arrival times from patterns in huge amounts of trip data.",
    source: "Google: Machine Learning Crash Course" },
  { id: "a-recs", kind: "around-you", title: "Why your feed knows you",
    body: "Recommendation systems learn from what you watch, click, and skip to guess what you will want next. That is AI shaping what you see.",
    source: "IBM: History of artificial intelligence" },
  { id: "a-phone", kind: "around-you", title: "Your camera is doing math",
    body: "Phone cameras use AI to find faces, sharpen photos, and blur backgrounds. Many 'normal' photos are already AI-edited.",
    source: "IBM: What is generative AI?" },
  { id: "a-access", kind: "around-you", title: "AI for access",
    body: "Live captions, text-to-speech, and translation tools use AI to help people with disabilities or language barriers take part more fully.",
    source: "NIST AI Risk Management Framework 1.0" }
];

/*
 * SCENIC OVERLOOK - THINK IT OVER
 * Shown when the driver pulls into a scenic overlook (marked with a binocular sign).
 * There is no right answer. Students pause and think, or discuss with a partner.
 * Adapted from the AI Society deck.
 */
window.ROAD_TEST_REFLECTIONS = [
  { id: "SO-DI-01", prompt: "Would you pay a monthly bill for AI like people pay for phones or internet? Why or why not?", nudge: "Name one benefit and one concern." },
  { id: "SO-DI-02", prompt: "Should students be taught how to use AI in school? What should they learn first?", nudge: "Connect your answer to safety, learning, or fairness." },
  { id: "SO-DI-03", prompt: "Should people label work that was made with help from AI? When should that matter?", nudge: "Think of one time labeling matters and one time it may not." },
  { id: "SO-DI-04", prompt: "Could AI make people more creative, less creative, or both?", nudge: "How could the same tool help or hurt creativity?" },
  { id: "SO-DI-05", prompt: "What jobs might change because of AI, and what human skills will still matter?", nudge: "Name one job task and one human strength." },
  { id: "SO-DI-06", prompt: "Should young kids use AI tools? What boundaries would make sense?", nudge: "Think about age, supervision, and privacy." },
  { id: "SO-DI-07", prompt: "Would you trust AI to help with an important life decision? Which decisions should stay mostly human?", nudge: "Separate getting advice from making the final call." },
  { id: "SO-DI-08", prompt: "What is one thing humans should not let AI decide by itself?", nudge: "Give a reason connected to fairness, safety, or human dignity." },
  { id: "SO-DI-09", prompt: "Should schools ban AI, teach AI, or set limits somewhere in between?", nudge: "Suggest one rule you think is fair." },
  { id: "SO-DI-10", prompt: "How could AI help people with disabilities or language barriers?", nudge: "Name a helpful use and a risk to check." },
  { id: "SO-DI-11", prompt: "What could happen if only some people have access to the strongest AI tools?", nudge: "Connect access to opportunity or fairness." },
  { id: "SO-DI-12", prompt: "How should communities respond when AI-generated misinformation spreads online?", nudge: "Suggest one thing a person can do and one thing a community can do." }
];
