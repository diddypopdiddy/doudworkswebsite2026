(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "continuity-notes-pickups-and-handoff",
  "minutes": 12,
  "bigIdea": "Write it down so the editor can find it.",
  "hook": {
    "pair": [
      { "media": "p6-desk-base", "alt": "The cup sits near the left edge.", "caption": "Master, before the book opens" },
      { "media": "p6-desk-mug-moved", "alt": "The cup has shifted toward the book.", "caption": "Closer take, same instant" }
    ],
    "question": "The Reader has not touched the cup. Which detail should you flag for the editor?",
    "options": ["The cup moved closer to the book.", "The book opened during the cut."],
    "answer": 0,
    "reveal": "The cup shifts between views. A [[continuity log]] identifies the affected shot and take so the editor can avoid the jump."
  },
  "notes": {
    "sketch": "Fill a log row for two takes and add one pickup request.",
    "frames": 3,
    "frameLabels": [
      "Take 1",
      "Take 2",
      "Pickup"
    ],
    "think": "What could the editor learn from your notes without calling the crew?"
  },
  "vocab": [
    "handoff",
    "continuity-log",
    "pickup-shot"
  ],
  "review": [
    "slate",
    "coverage"
  ],
  "objectives": [
    "Log a matching detail and preferred take so another editor can find it.",
    "Request a specific pickup when available material cannot cover a gap."
  ],
  "sections": [
    {
      "title": "Log what actually changed",
      "intro": "A useful note lets an editor choose between similar files.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[continuity log]] identifies shot, take, matching action, prop position, sound and preferred version. Write “S06 T02: right hand, full bottle, clean, matches S04.”</p><p>For the lunch PSA, “sharp” misses a phone-case swap. Compare the master with the closer take before choosing.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("S04 master  •  bottle is full", [["S06   Take 1", "Bottle nearly empty", "Hand: right", "Sound: clear"], ["S06   Take 2", "Bottle full", "Hand: right", "Sound: clear"]]),
          "alt": "Two close-up takes compared with a master that has a full bottle.",
          "caption": "Name visible evidence alongside the preferred take."
        }
      ]
    },
    {
      "title": "Hand the editor a route into the shoot",
      "intro": "The editor may never have seen the set.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Use a [[pickup shot]] to add a missing detail or repair a mismatch. Specify the shot size, action and match. For an unreadable note, request S08 from above with the same yellow paper.</p><p>A [[handoff]] includes the media path, numbered shot list, log and outstanding pickups. Connect each note to a filename or slate. Keep the best take and the reason together.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Editor handoff", [["Ready", "Source / Library / S06", "T02 matches S04"], ["Still needed", "S08 overhead insert", "Make “Look up” readable"]]),
          "alt": "A handoff card pairs the preferred take with an outstanding insert.",
          "caption": "Give the editor a starting file and one concrete outstanding need. Revisit <a href=\"../organize-source-project-and-export-files/index.html\">organizing source, project and export files</a>."
        }
      ]
    },
    {
      "title": "Fill the log",
      "intro": "Choose the entry another editor could use.",
      "blocks": [
        {
          "type": "quiz",
          "items": [
            {
              "q": "The master uses the right hand. S06 T01 uses the left. Which note helps?",
              "options": [
                {
                  "text": "S06 T01: bad.",
                  "clue": "Does the editor know what to look for?"
                },
                "S06 T01: left hand differs from S04. Repeat with right."
              ],
              "answer": 1,
              "explain": "The shot, take, mismatch and fix are explicit."
            },
            {
              "q": "S05 T02 contains a cough during the line. T01 has a clean line and matching action.",
              "options": [
                {
                  "text": "Use T02 and label sound okay because the picture is sharp.",
                  "clue": "Listen to the part the editor needs."
                },
                "Mark T01 preferred for the line. Log the cough in T02."
              ],
              "answer": 1,
              "explain": "The log points to a usable line with matching picture."
            },
            {
              "q": "Every wide shot hides the words on the yellow note. What belongs under pickups?",
              "options": [
                {
                  "text": "Get more B-roll sometime.",
                  "clue": "What size and action would fill the actual gap?"
                },
                "S08: overhead, same folded note, hold readable words."
              ],
              "answer": 1,
              "explain": "The request names the missing insert and its match."
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which detail makes S06 T02 the better match in this log?",
      "options": [
        "The full bottle matches S04",
        {
          "text": "Only T02 uses the right hand",
          "clue": "Compare both rows with the master."
        }
      ],
      "answer": 0,
      "explain": "The hand matches in both. The bottle distinguishes them.",
      "svg": D.editCards("S04 master  •  bottle is full", [["S06   Take 1", "Bottle nearly empty", "Hand: right", "Sound: clear"], ["S06   Take 2", "Bottle full", "Hand: right", "Sound: clear"]]),
      "alt": "The hand matches in both. The bottle distinguishes them."
    },
    {
      "q": "What is missing from “T03 good”?",
      "options": [
        "The shot identifier and the reason it works",
        {
          "text": "The upload date of the final video",
          "clue": "Could an editor find and compare the take?"
        }
      ],
      "answer": 0,
      "explain": "Shot, take and a specific observation make the note actionable."
    },
    {
      "q": "The only phone close-up shows the wrong case. What should the handoff request?",
      "options": [
        {
          "text": "Hide the note and let the editor guess",
          "clue": "No existing close-up matches the master."
        },
        "A matching close-up pickup with the correct case"
      ],
      "answer": 1,
      "explain": "The pickup supplies the missing matching detail."
    }
  ],
  "remember": [
    "A [[continuity log]] ties an observation to one shot and take.",
    "A [[pickup shot]] fills a named gap in the coverage.",
    "A [[handoff]] includes the media path, shot list, preferred takes and outstanding repairs."
  ],
  "realCamera": "Film two takes of a simple action. Write a log row for each. Have a partner choose a take using only the rows."
});
})();
