(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "record-coverage-and-takes",
  "minutes": 12,
  "bigIdea": "Get the shots you planned, plus extras.",
  "hook": {
    "svg": D.editCards("The Note  •  card inventory", [["Shot list: 6 setups", "S04 master", "S05 medium", "S06 detail ..."], ["Card: 14 clips", "S04 T01, S04 T02", "S05 T01, S05 T02", "S06 T01, S06 T02 ..."]]),
    "alt": "Same shot numbers appear with multiple take numbers.",
    "question": "How can six planned setups produce fourteen clips?",
    "options": [
      "Several attempts can share one shot number.",
      "The editor must have lost eight setups."
    ],
    "answer": 0,
    "reveal": "S04 appears as T01 and T02. Each attempt gets a [[take number]]. An extra usable attempt can be a [[safety take]]."
  },
  "notes": {
    "sketch": "Label a master, its safety and one detail shot.",
    "frames": 3,
    "frameLabels": [
      "Master",
      "Safety",
      "Detail"
    ],
    "think": "What new information would a close-up provide?"
  },
  "vocab": [
    "take-number",
    "safety-take",
    "b-roll"
  ],
  "review": [
    "coverage",
    "slate"
  ],
  "objectives": [
    "Separate new coverage from another take of the same shot.",
    "Choose the next take or detail that gives the editor a usable option."
  ],
  "sections": [
    {
      "title": "One setup, several attempts",
      "intro": "Keep the slate tied to the planned setup.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>S04 is the wide master of the complete library action. Each repeat gets another [[take number]]. Record a [[safety take]] after a usable attempt if time allows.</p><p>S05 and S06 change the framing. They add [[coverage]] of the same movement. [[B-roll]] can show a relevant detail, such as the clock the Reader looks toward.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("The Note  •  card inventory", [["Shot list: 6 setups", "S04 master", "S05 medium", "S06 detail ..."], ["Card: 14 clips", "S04 T01, S04 T02", "S05 T01, S05 T02", "S06 T01, S06 T02 ..."]]),
          "alt": "Shot list and camera-card counts with repeated take numbers.",
          "caption": "Redoing S04 creates a new take. Changing to S06 creates a new setup."
        }
      ]
    },
    {
      "title": "Watch the full coverage reel",
      "intro": "See the same library action recorded at three sizes.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Play the master, medium and book detail in shooting order. Compare the part of the movement each setup preserves. Decide where the editor could change size without repeating the action.</p>"
        },
        {
          "type": "video-segments",
          "media": "p7-coverage",
          "caption": "C2 stand-in. These three coverage views come from the generated Part 6 library footage. Film each setup separately on the actual shoot.",
          "segments": [
            {
              "label": "S04 master",
              "from": 0,
              "to": 15.5
            },
            {
              "label": "S05 medium",
              "from": 15.5,
              "to": 26.75
            },
            {
              "label": "S06 detail",
              "from": 26.75,
              "to": 32.25
            }
          ],
          "pauses": [
            {
              "at": 7.8,
              "prompt": "What movement must the medium take repeat to match this sit?"
            },
            {
              "at": 28.5,
              "prompt": "Where in this close shot could you match the opening of the book?"
            }
          ]
        }
      ]
    },
    {
      "title": "Choose what to record next",
      "intro": "Each choice should solve a particular editing need.",
      "blocks": [
        {
          "type": "quiz",
          "items": [
            {
              "q": "S04 is usable and the crew has time for one more attempt in the same setup.",
              "options": [
                {
                  "text": "Call the repeat S05 because it is the next clip",
                  "clue": "Did the planned setup change?"
                },
                "Slate S04 T02 and record a safety take"
              ],
              "answer": 1,
              "explain": "T02 gives the editor another complete S04."
            },
            {
              "q": "The clock matters but appears tiny in every master take.",
              "options": [
                {
                  "text": "Record three more identical masters",
                  "clue": "What information is missing from every frame?"
                },
                "Record a clock insert from the Reader’s viewpoint"
              ],
              "answer": 1,
              "explain": "The insert provides new coverage of the clock."
            },
            {
              "q": "A perfect book close-up begins after the hand already touched it.",
              "options": [
                "Repeat the whole reach with a lead-in and a hold",
                {
                  "text": "Stop filming because the book is sharp",
                  "clue": "Look for overlap with the master."
                }
              ],
              "answer": 0,
              "explain": "The complete action gives the editor a matching cut point."
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "On the card, what do S04 T01 and S04 T02 mean?",
      "options": [
        {
          "text": "Two unrelated shot numbers",
          "clue": "Read which field repeats."
        },
        "Two attempts at the master setup"
      ],
      "answer": 1,
      "explain": "Both entries keep S04 and change the take number.",
      "svg": D.editCards("The Note  •  card inventory", [["Shot list: 6 setups", "S04 master", "S05 medium", "S06 detail ..."], ["Card: 14 clips", "S04 T01, S04 T02", "S05 T01, S05 T02", "S06 T01, S06 T02 ..."]]),
      "alt": "Both entries keep S04 and change the take number."
    },
    {
      "q": "You have one clean take and film a second clean one with identical framing. What have you gained?",
      "options": [
        {
          "text": "A different angle",
          "clue": "Did the camera move?"
        },
        "A safety take"
      ],
      "answer": 1,
      "explain": "An extra usable attempt protects the edit."
    },
    {
      "q": "What extra image would support the Reader’s glance toward the clock?",
      "options": [
        "An insert of the clock",
        {
          "text": "A second take of the empty hallway",
          "clue": "Which object answers the glance?"
        }
      ],
      "answer": 0,
      "explain": "The clock detail tells viewers what the Reader saw."
    }
  ],
  "remember": [
    "Give each attempt its own [[take number]].",
    "Get a [[safety take]] while the setup is ready.",
    "Plan [[coverage]] and relevant [[B-roll]] for the editor."
  ],
  "realCamera": "Record a simple action three times. Show the same shot number and a different take number before each attempt."
});
})();
