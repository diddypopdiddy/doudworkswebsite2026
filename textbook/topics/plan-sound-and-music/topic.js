(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "plan-sound-and-music",
  "minutes": 10,
  "bigIdea": "Decide what viewers will hear before you shoot.",
  "hook": {
    "svg": D.editCards("The Note  •  cue sheet", [["S06   Book opens", "Paper falls.", "Hold the music."], ["S08   Words appear", "Read “Look up.”", "First music note?"]]),
    "alt": "Cue sheet places a paper drop before the message.",
    "question": "Listen to the same six seconds three ways. Where would you start the music to make the discovery feel important?",
    "audioExamples": [
  {
    "media": "p7-cue-dry",
    "label": "No music: listen for the paper at 1 second."
  },
  {
    "media": "p7-cue-early",
    "label": "Early cue: music enters with the paper."
  },
  {
    "media": "p7-cue-late",
    "label": "Late cue: music enters when the words appear at 3 seconds."
  }
],
    "options": [
      "When the paper falls",
      "When the words appear"
    ],
    "reveal": "An early cue draws attention to the fall. A late [[music cue]] can emphasize the message instead. Record that choice in the [[sound plan]]."
  },
  "notes": {
    "sketch": "Map the sound of one discovery.",
    "frames": 3,
    "frameLabels": [
      "Before",
      "Reveal",
      "After"
    ],
    "think": "Where would silence make the next sound easier to notice?"
  },
  "vocab": [
    "sound-plan",
    "voiceover",
    "music-cue"
  ],
  "review": [
    "room-tone"
  ],
  "objectives": [
    "Write a sound entry tied to a visible action.",
    "Choose when to record narration, room tone and music."
  ],
  "sections": [
    {
      "title": "Plan each layer",
      "intro": "Read one scene and write down what its audience needs to hear.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[sound plan]] lists voices, location sound, added effects and music for each moment. Record the actual book and page on set. Record [[room tone]] in the same quiet library.</p><p>A [[music cue]] needs a trigger. “Start when the words appear” tells an editor more than “add music.” Keep speech clear when layers overlap.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("The Note  •  cue sheet", [["S06   Book opens", "Paper falls.", "Hold the music."], ["S08   Words appear", "Read “Look up.”", "First music note?"]]),
          "alt": "The book opening and the message have separate cue entries.",
          "caption": "Silence can save attention for the next sound."
        }
      ]
    },
    {
      "title": "Write for an unseen voice",
      "intro": "Narration can give information the frame cannot show.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[voiceover]] is heard over pictures while its speaker is off screen. Mark the exact words and the image they belong to. Record a clean narration take separately.</p><p>For the lunch PSA, try “Look who’s at your table” as the phone goes face down. Read it aloud against the action before recording.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Phones Down  •  audio entry", [["VO 01", "Picture: phone turns face down", "Voice: “Look who’s at your table.”", "Music: reduce under the line"]]),
          "alt": "A voiceover entry names its words, image and music level.",
          "caption": "Leave time for the line."
        }
      ]
    },
    {
      "title": "Write the sound entries",
      "intro": "Choose what the crew must capture or cue.",
      "blocks": [
        {
          "type": "quiz",
          "items": [
            {
              "q": "The folded note lands. You want viewers to notice the paper first.",
              "options": [
                {
                  "text": "Start the loudest music over the landing.",
                  "clue": "What sound must reach viewers first?"
                },
                "Record the paper landing. Delay the music cue."
              ],
              "answer": 1,
              "explain": "A clean landing makes the paper noticeable."
            },
            {
              "q": "You will cut between two takes in the same quiet library.",
              "options": [
                "Record room tone before leaving.",
                {
                  "text": "Use cafeteria chatter for both gaps.",
                  "clue": "Which sound belongs to this place?"
                }
              ],
              "answer": 0,
              "explain": "Matching room tone can bridge cuts."
            },
            {
              "q": "Words must explain the lunch PSA while the screen shows only a phone.",
              "options": [
                {
                  "text": "Ask the editor to invent dialogue from the picture.",
                  "clue": "Who will record the exact words?"
                },
                "Plan a timed voiceover and lower music beneath it."
              ],
              "answer": 1,
              "explain": "The editor receives a clean line with a picture cue."
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which sound belongs to the first row of the cue sheet?",
      "options": [
        {
          "text": "The first note under the written message",
          "clue": "Read the S06 action."
        },
        "Paper falling from the book"
      ],
      "answer": 1,
      "explain": "S06 specifies the paper fall before the message.",
      "svg": D.editCards("The Note  •  cue sheet", [["S06   Book opens", "Paper falls.", "Hold the music."], ["S08   Words appear", "Read “Look up.”", "First music note?"]]),
      "alt": "S06 specifies the paper fall before the message."
    },
    {
      "q": "Which instruction gives the most repeatable music start?",
      "options": [
        "Start on the first readable frame of “Look up.”",
        {
          "text": "Start when it feels interesting",
          "clue": "Could two editors pick the same frame?"
        }
      ],
      "answer": 0,
      "explain": "The visual trigger identifies one moment."
    },
    {
      "q": "Why capture a separate narration take?",
      "options": [
        "You can time clear words over the picture",
        {
          "text": "It automatically removes all location noise",
          "clue": "Think about the voice as its own layer."
        }
      ],
      "answer": 0,
      "explain": "A separate voiceover can be placed and balanced independently."
    }
  ],
  "remember": [
    "A [[sound plan]] ties each layer to an action.",
    "Give every [[music cue]] a visible or audible trigger.",
    "Leave room for the words of a [[voiceover]]."
  ],
  "realCameraTitle": "Try it",
  "realCamera": "Write a one-minute sound plan with one row per beat. Read a planned narration line aloud against its cue."
});
})();
