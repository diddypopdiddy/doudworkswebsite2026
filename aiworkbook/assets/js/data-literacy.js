/* Chapter 1 · AI Literacy · Quiz Board content
   Each clue: q (the clue), a (four answers, phrased as questions), c (index of the correct answer),
   why (shown after answering). Edit freely; keep exactly 5 clues per category, easiest first. */
window.WB = window.WB || {};
WB.literacy = {
  categories: [
    {
      id: "what",
      name: "What Is AI?",
      clues: [
        {
          q: "A chatbot is just one kind of this broad technology, which can predict, classify, recommend and generate.",
          a: ["What is the internet?", "What is artificial intelligence?", "What is a search engine?", "What is a spreadsheet?"],
          c: 1,
          why: "AI is the big family. Chatbots are one member of it. So are spam filters, map apps and photo sorters."
        },
        {
          q: "Your map app says you'll arrive at 3:42. That's AI doing this job.",
          a: ["What is generating?", "What is classifying?", "What is predicting?", "What is recommending?"],
          c: 2,
          why: "It uses traffic patterns to estimate something that hasn't happened yet. That's prediction."
        },
        {
          q: "Your streaming app's “Because you watched…” row is AI doing this job.",
          a: ["What is recommending?", "What is predicting the weather?", "What is classifying spam?", "What is translating?"],
          c: 0,
          why: "It matches patterns in what you (and people like you) watched to suggest what's next."
        },
        {
          q: "This kind of AI creates new text, images, audio or code, instead of only sorting or scoring things.",
          a: ["What is rule-based AI?", "What is a calculator?", "What is generative AI?", "What is a database?"],
          c: 2,
          why: "Generative AI makes new content. Chat tools, image makers and code helpers are all generative."
        },
        {
          q: "This branch of AI learns patterns from examples instead of following rules a person wrote out by hand.",
          a: ["What is cloud storage?", "What is machine learning?", "What is a firewall?", "What is coding by hand?"],
          c: 1,
          why: "Machine learning finds patterns in data. Older AI relied on rules people typed in, step by step."
        }
      ]
    },
    {
      id: "how",
      name: "How It Works",
      clues: [
        {
          q: "Language models learn patterns from huge amounts of text during this stage, long before you ever chat with one.",
          a: ["What is training?", "What is downloading?", "What is printing?", "What is logging in?"],
          c: 0,
          why: "Training is when the model learns patterns. Your chat comes later and uses what it learned."
        },
        {
          q: "A language model writes its reply by predicting this, over and over.",
          a: ["What is the right answer in a database?", "What is your next question?", "What is the next word or word-piece?", "What is a random word?"],
          c: 2,
          why: "It generates one small piece at a time, picking a likely next piece based on patterns and your chat."
        },
        {
          q: "Besides its training, these three things guide what a chatbot generates in your conversation.",
          a: ["What are your GPS, contacts and photos?", "What are the weather, the time and your battery?", "What are other people's private chats?", "What are your prompt, the sources you share and the earlier turns in the chat?"],
          c: 3,
          why: "Your prompt, the sources you give it and the chat so far shape every reply. That's why how you ask matters."
        },
        {
          q: "You correct a chatbot's mistake and it says “You're right!” This is what did NOT happen to the model.",
          a: ["What is reading your message?", "What is being permanently retrained?", "What is generating a reply?", "What is using the chat so far?"],
          c: 1,
          why: "Correcting a chat changes this conversation. It doesn't permanently retrain the model."
        },
        {
          q: "These small chunks of text, often pieces of words, are what a language model actually reads and writes.",
          a: ["What are pixels?", "What are tokens?", "What are cookies?", "What are hashtags?"],
          c: 1,
          why: "Models break text into tokens. “Unbelievable” might be split into a few tokens, for example."
        }
      ]
    },
    {
      id: "history",
      name: "AI History",
      clues: [
        {
          q: "Its public release in late 2022 brought generative AI chatbots into everyday conversation.",
          a: ["What is ChatGPT?", "What is the first smartphone?", "What is the first web browser?", "What is a video game console?"],
          c: 0,
          why: "ChatGPT's release in November 2022 made generative AI a household topic, but AI research is about 70 years older."
        },
        {
          q: "In 1997, IBM's Deep Blue computer beat world champion Garry Kasparov at this game.",
          a: ["What is checkers?", "What is poker?", "What is chess?", "What is Go?"],
          c: 2,
          why: "Deep Blue's win in chess was a famous milestone for rule-and-search based AI."
        },
        {
          q: "In 1950, this mathematician proposed an “imitation game” to ask whether a machine could think.",
          a: ["Who is Ada Lovelace?", "Who is Alan Turing?", "Who is Albert Einstein?", "Who is Steve Jobs?"],
          c: 1,
          why: "Alan Turing's test asked whether a person could tell a machine's answers from a human's."
        },
        {
          q: "The name “artificial intelligence” comes from a proposal for a 1956 summer research workshop at this U.S. college.",
          a: ["What is Harvard?", "What is Stanford?", "What is Dartmouth College?", "What is MIT?"],
          c: 2,
          why: "John McCarthy and colleagues proposed the Dartmouth workshop, and the name stuck."
        },
        {
          q: "Periods in the 1970s and late 1980s, when money and excitement for AI research dried up, are known by this chilly name.",
          a: ["What is an AI winter?", "What is a cold boot?", "What is a frozen screen?", "What is the ice age of computing?"],
          c: 0,
          why: "AI has gone through hype and “winters.” Rules → machine learning → neural networks → generative AI didn't happen in a straight line."
        }
      ]
    },
    {
      id: "wild",
      name: "AI in the Wild",
      clues: [
        {
          q: "Your email quietly moves “You've WON a FREE prize!!!” into this folder.",
          a: ["What is the drafts folder?", "What is the spam folder?", "What is the sent folder?", "What is the trash?"],
          c: 1,
          why: "Spam filters are AI that classifies messages. Most people use AI every day without noticing."
        },
        {
          q: "Unlocking your phone just by looking at it uses this kind of AI.",
          a: ["What is face recognition?", "What is spell check?", "What is GPS?", "What is Bluetooth?"],
          c: 0,
          why: "Image recognition learns patterns in faces and pictures. It also sorts photos and reads handwriting."
        },
        {
          q: "“Hey, set a timer for ten minutes” works because AI first turns your voice into this.",
          a: ["What is a ringtone?", "What is an emoji?", "What is text?", "What is a photo?"],
          c: 2,
          why: "Speech recognition turns sound into text, then other AI works out what you meant."
        },
        {
          q: "AI can help flag possible problems in X-rays, but this person still makes the call.",
          a: ["Who is the patient's friend?", "Who is the app developer?", "Who is the doctor?", "Who is nobody, it's automatic?"],
          c: 2,
          why: "AI can support experts, but people keep the decisions that matter. In school, teachers decide."
        },
        {
          q: "For any AI tool you meet, ask these three questions.",
          a: ["What does it cost, who made it, is it popular?", "What goes in, what comes out, and how do people use it?", "Is it fast, is it new, is it free?", "Does it have dark mode, emojis and sound?"],
          c: 1,
          why: "Input, output and use: those three questions work for spam filters, chatbots and everything in between."
        }
      ]
    },
    {
      id: "limits",
      name: "Limits & Checks",
      clues: [
        {
          q: "AI text can sound confident and polished and still be this.",
          a: ["What is wrong?", "What is impossible?", "What is always right?", "What is illegal?"],
          c: 0,
          why: "Fluent doesn't mean correct. Confidence is a writing style, not evidence."
        },
        {
          q: "When a chatbot makes up a fact, quote or source that sounds real, people call it this.",
          a: ["What is a glitch?", "What is a virus?", "What is a hallucination?", "What is a meme?"],
          c: 2,
          why: "Hallucinations look just like real answers. That's why important claims get checked."
        },
        {
          q: "Because AI learns from data made by people, it can repeat this kind of unfair pattern.",
          a: ["What is bias?", "What is lag?", "What is a typo?", "What is a pop-up?"],
          c: 0,
          why: "If the data leans one way, the output can too. Fluent output can be wrong, biased or unsupported."
        },
        {
          q: "Before using a source the AI cites, you should do this.",
          a: ["What is trust it because it has a link?", "What is check it exists and says what's claimed?", "What is ask the AI if it's sure?", "What is copy it quickly before it disappears?"],
          c: 1,
          why: "AI can invent citations. Find the real source and check it says what the AI claims. Asking the AI again isn't checking."
        },
        {
          q: "A polished AI-written essay does not prove this about the student who turned it in.",
          a: ["That they own a computer?", "That they understand the topic?", "That they have Wi-Fi?", "That they can type?"],
          c: 1,
          why: "Polished text doesn't prove understanding. That's why the learner always does the final step."
        }
      ]
    }
  ],
  final: {
    category: "What You Do Yourself",
    q: "Finish the Framework's motto: “Understand the system. Direct the help. ______.”",
    a: ["What is “Trust the output”?", "What is “Own the thinking”?", "What is “Save the chat”?", "What is “Go faster”?"],
    c: 1,
    why: "Use AI for the help your teacher allows. Check the reply and finish the work yourself."
  }
};
