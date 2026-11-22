(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "storyboard-and-shot-list",
  "minutes": 15,
  "bigIdea": "Draw it and list it before you shoot it.",
  "hook": {
    "pair": [
      {
        "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><path d=\"M32 59 Q95 45 160 74 Q230 47 288 58 L281 132 Q210 121 160 147 Q92 121 40 134 Z\" stroke=\"#263a65\" stroke-width=\"5\" fill=\"#a7b7de\"/><path d=\"M160 74v73\" stroke=\"#3157c8\" stroke-width=\"4\"/><path d=\"M44 120Q72 105 95 116l14 8-27 7-32 3zM277 120q-31-18-50-7l-15 14 48 8z\" fill=\"#e9c6a5\" stroke=\"#695547\"/><text x=\"12\" y=\"24\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">S06   •   Book opens</text><text x=\"12\" y=\"168\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Storyboard panel   /   close-up</text></svg>",
        "alt": "Drawing of hands opening a book.",
        "caption": "Planned S06"
      },
      {
        "id": "p7-note-insert",
        "caption": "Generated S06 example"
      }
    ],
    "question": "Which detail did the crew keep from the drawing?",
    "options": [
      "Hands and book fill the shot.",
      "The whole library is visible."
    ],
    "answer": 0,
    "reveal": "The hands and book fill both frames. A [[storyboard]] uses a [[panel]] to plan what viewers will see."
  },
  "notes": {
    "sketch": "Draw a three-panel discovery. Write a matching row below each.",
    "frames": 3,
    "frameLabels": [
      "Set up",
      "Reveal",
      "Reaction"
    ],
    "think": "Which shot gives viewers information they could otherwise miss?"
  },
  "vocab": [
    "storyboard",
    "shot-list",
    "panel",
    "shot-number"
  ],
  "review": [
    "shot-purpose"
  ],
  "objectives": [
    "Translate a storyboard panel into a numbered camera instruction.",
    "Arrange panels so the viewer can follow the discovery."
  ],
  "sections": [
    {
      "title": "Sketch what the audience sees",
      "intro": "One frame should tell the crew what matters.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[storyboard]] shows a sequence as drawings. One [[panel]] can be a few lines. Include the subject, the edge of the frame and an arrow when something moves.</p>"
        },
        {
          "type": "figure-row",
          "items": [
            {
              "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><path d=\"M32 59 Q95 45 160 74 Q230 47 288 58 L281 132 Q210 121 160 147 Q92 121 40 134 Z\" stroke=\"#263a65\" stroke-width=\"5\" fill=\"#a7b7de\"/><path d=\"M160 74v73\" stroke=\"#3157c8\" stroke-width=\"4\"/><path d=\"M44 120Q72 105 95 116l14 8-27 7-32 3zM277 120q-31-18-50-7l-15 14 48 8z\" fill=\"#e9c6a5\" stroke=\"#695547\"/><text x=\"12\" y=\"24\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">S06   •   Book opens</text><text x=\"12\" y=\"168\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Storyboard panel   /   close-up</text></svg>",
              "alt": "Drawing of hands opening a book.",
              "caption": "Planned S06"
            },
            {
              "id": "p7-note-insert",
              "caption": "Generated S06 example"
            }
          ]
        }
      ]
    },
    {
      "title": "Give the shot a number",
      "intro": "A crew member should be able to film from one row.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Assign each setup a [[shot number]]. Write its size, angle, action and purpose on the [[shot list]]. S06 is a close-up from above the shoulder. The right hand opens the book and the note falls out.</p><p>Keep the numbers when the shooting order changes. They connect the drawing to the slate, the files and the editor’s notes.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("The Note  •  camera list", [["S04   Wide, level", "Library: Reader sits.", "Purpose: show place."], ["S06   Close, high", "Right hand opens book.", "Purpose: show action."]]),
          "alt": "Two shot-list rows from The Note.",
          "caption": "S04 establishes the whole action. S06 isolates the hand and book. Revisit <a href=\"../shot-purpose/index.html\">shot purpose</a> before writing the row."
        }
      ]
    },
    {
      "title": "Translate three panels",
      "intro": "Pick the row that a camera operator could follow.",
      "blocks": [
        {
          "type": "quiz",
          "items": [
            {
              "media": { "id": "still-room-wide", "alt": "Wide library frame with the Reader at the table." },
              "q": "S04 shows the Reader at a table with the room visible. Which row matches?",
              "options": [
                "S04, wide master, Reader sits, establish the library",
                {
                  "text": "S04, close insert, clock face, show the time",
                  "clue": "Look for the people and space the drawing contains."
                }
              ],
              "answer": 0,
              "explain": "The room and Reader share the wide frame."
            },
            {
              "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><path d=\"M32 59 Q95 45 160 74 Q230 47 288 58 L281 132 Q210 121 160 147 Q92 121 40 134 Z\" stroke=\"#263a65\" stroke-width=\"5\" fill=\"#a7b7de\"/><path d=\"M160 74v73\" stroke=\"#3157c8\" stroke-width=\"4\"/><path d=\"M44 120Q72 105 95 116l14 8-27 7-32 3zM277 120q-31-18-50-7l-15 14 48 8z\" fill=\"#e9c6a5\" stroke=\"#695547\"/><text x=\"12\" y=\"24\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">S06   •   Book opens</text><text x=\"12\" y=\"168\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Storyboard panel   /   close-up</text></svg>",
              "alt": "S06 board panel with opening book and hands.",
              "q": "S06 shows hands and a book edge. Which instruction is useful?",
              "options": [
                {
                  "text": "Wide, front doorway, cross the hall",
                  "clue": "The hand and book fill the drawing."
                },
                "Close, over shoulder, repeat the right-hand opening"
              ],
              "answer": 1,
              "explain": "A close shot records the opening in detail."
            },
            {
              "svg": D.svg('<rect width="320" height="180" fill="#e7e3d8"/><path d="M45 26l229 8-11 124-224-13z" fill="#f3db81" stroke="#171b1f"/><path d="M155 30l-9 124" stroke="#c1a657"/><text x="87" y="101" fill="#171b1f" font-size="32">Look up.</text>'),
              "alt": "Overhead panel with a folded yellow note and two readable words.",
              "q": "S08 fills the frame with “Look up.” What purpose belongs on its row?",
              "options": [
                "Let viewers read the note",
                {
                  "text": "Identify the whole library",
                  "clue": "What can be read in the frame?"
                }
              ],
              "answer": 0,
              "explain": "The words explain why the Reader looks up next."
            }
          ]
        },
        {
          "type": "sorter",
          "mode": "order",
          "prompt": "Build the discovery in story order.",
          "items": [
            {
              "text": "Reader sees the words “Look up.”",
              "clue": "What has to fall out first?"
            },
            {
              "text": "Reader looks up at the clock.",
              "clue": "What prompts the glance?"
            },
            {
              "text": "Reader opens the book.",
              "clue": "What can start the discovery?"
            },
            {
              "text": "A folded note falls out.",
              "clue": "What frees the note?"
            }
          ],
          "correct": [
            2,
            3,
            0,
            1
          ],
          "success": "The book reveals the note. The message motivates the look."
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which planned shot matches the drawing?",
      "options": [
        "S06, a close view of the book",
        {
          "text": "S04, the library master",
          "clue": "Read the frame edges and shot label."
        }
      ],
      "answer": 0,
      "explain": "S06 leaves the room outside the close frame.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><path d=\"M32 59 Q95 45 160 74 Q230 47 288 58 L281 132 Q210 121 160 147 Q92 121 40 134 Z\" stroke=\"#263a65\" stroke-width=\"5\" fill=\"#a7b7de\"/><path d=\"M160 74v73\" stroke=\"#3157c8\" stroke-width=\"4\"/><path d=\"M44 120Q72 105 95 116l14 8-27 7-32 3zM277 120q-31-18-50-7l-15 14 48 8z\" fill=\"#e9c6a5\" stroke=\"#695547\"/><text x=\"12\" y=\"24\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">S06   •   Book opens</text><text x=\"12\" y=\"168\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Storyboard panel   /   close-up</text></svg>",
      "alt": "S06 leaves the room outside the close frame."
    },
    {
      "q": "The crew films S08 first. What happens to its shot number?",
      "options": [
        "Keep S08 on slate and log",
        {
          "text": "Rename it S01 because it was first",
          "clue": "The editor connects it to a planned panel."
        }
      ],
      "answer": 0,
      "explain": "The shot number stays with its planned setup."
    },
    {
      "q": "A panel of the Reader looking up comes before anyone sees the message. What change clarifies the cause?",
      "options": [
        {
          "text": "Repeat the glance at a second size",
          "clue": "What information gives the glance a reason?"
        },
        "Show the note’s words before the glance"
      ],
      "answer": 1,
      "explain": "Reading the message explains the glance."
    }
  ],
  "remember": [
    "A [[panel]] shows the frame you intend to record.",
    "A [[shot list]] names the action, framing and purpose.",
    "Carry the [[shot number]] from the [[storyboard]] to the slate."
  ],
  "realCamera": "Draw four panels for a 15-second scene. Number each and write its size, angle, action and purpose."
});
})();
