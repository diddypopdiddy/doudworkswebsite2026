/* Student test. Keys are held separately. */
window.TEXTBOOK_TEST = {
  "part": "editing-choices-and-story",
  "minutes": 45,
  "instructions": "Answer every item. Select the one best answer for each multiple-choice question. Use the two written responses to explain specific edits.",
  "sections": [
    {
      "title": "Section A · Terms and foundations",
      "items": [
        {
          "id": "a-match",
          "level": 1,
          "obj": 0,
          "topic": "shot-order-and-meaning",
          "type": "match",
          "stem": "Match each description to a term. Two terms remain unused.",
          "terms": [
            "sequence",
            "context",
            "montage",
            "dissolve",
            "shot length",
            "marker",
            "downbeat",
            "cold open",
            "hook",
            "A-roll"
          ],
          "defs": [
            "How long a shot stays on screen.",
            "A set of shots arranged into one event.",
            "An opening scene that comes before the introductory material.",
            "An idea or stretch of time built from a group of selected images.",
            "The surrounding material that shapes how an image is read.",
            "A point placed on a timeline as a reference.",
            "An edit where two images blend for a short time.",
            "The first beat of a measure."
          ]
        },
        {
          "id": "a2",
          "type": "mc",
          "level": 1,
          "topic": "shot-order-and-meaning",
          "obj": 0,
          "stem": "What does juxtaposition do in an edit?",
          "options": [
            "Keeps the volume the same across shots",
            "Places images beside each other so their relationship suggests an idea",
            "Makes each picture last one second",
            "Records two sources at the same time"
          ]
        },
        {
          "id": "a3",
          "type": "mc",
          "level": 1,
          "topic": "montage-and-context",
          "obj": 0,
          "stem": "A compressed training passage alternates early failures with later successes. What technique connects these moments?",
          "options": [
            "Montage",
            "A lower third",
            "A split edit",
            "A continuous take"
          ]
        },
        {
          "id": "a4",
          "type": "mc",
          "level": 1,
          "topic": "editing-on-the-beat",
          "obj": 0,
          "stem": "Which reference helps an editor find a musical accent again?",
          "options": [
            "Source filename",
            "Audio gain",
            "Track height",
            "Timeline marker"
          ]
        }
      ]
    },
    {
      "title": "Section B · Read the evidence",
      "items": [
        {
          "id": "b1",
          "type": "mc",
          "level": 2,
          "topic": "kuleshov-effect",
          "obj": 0,
          "stem": "Why might the very same face read differently in these versions?",
          "options": [
            "The expression changes from one version to the other",
            "The face moves to a new location",
            "The object before the face changes its context",
            "The actor delivers a different line"
          ],
          "pair": [
            { "media": "p10-lunch-soup", "caption": "First cut: soup" },
            { "media": "p10-birthday-cake", "caption": "Second cut: cake" },
            { "media": "p10-neutral-face", "caption": "Both cuts end on this face." }
          ],
        },
        {
          "id": "b2",
          "type": "mc",
          "level": 2,
          "topic": "j-cuts",
          "obj": 0,
          "stem": "What kind of cut does the sound boundary create?",
          "options": [
            "L-cut",
            "J-cut",
            "Direct sound-and-picture cut",
            "Fade to black"
          ],
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><text x=\"12\" y=\"26\" font-family=\"Arial,sans-serif\" font-size=\"16\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Split picture and sound</text><text x=\"9\" y=\"68\" font-family=\"Arial,sans-serif\" font-size=\"12\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Picture</text><rect x=\"65\" y=\"46\" width=\"136\" height=\"36\" rx=\"4\" fill=\"#3157c8\" stroke=\"none\"/><rect x=\"201\" y=\"46\" width=\"104\" height=\"36\" rx=\"4\" fill=\"#9a542e\" stroke=\"none\"/><text x=\"69\" y=\"68\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Hall</text><text x=\"205\" y=\"68\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Reader</text><text x=\"9\" y=\"119\" font-family=\"Arial,sans-serif\" font-size=\"12\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Sound</text><rect x=\"65\" y=\"97\" width=\"102\" height=\"36\" rx=\"4\" fill=\"#3157c8\" stroke=\"none\"/><rect x=\"167\" y=\"97\" width=\"138\" height=\"36\" rx=\"4\" fill=\"#9a542e\" stroke=\"none\"/><text x=\"69\" y=\"119\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Hall</text><text x=\"171\" y=\"119\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Reader</text><text x=\"65\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">0s</text><text x=\"99\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">1s</text><text x=\"133\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">2s</text><text x=\"167\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">3s</text><text x=\"201\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">4s</text><text x=\"235\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">5s</text><text x=\"269\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">6s</text><text x=\"303\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">7s</text></svg>",
          "alt": "Picture: Hall 0–4 s > Reader 4–7 s. Sound: Hall 0–3 s > Reader 3–7 s"
        },
        {
          "id": "b3",
          "type": "mc",
          "level": 2,
          "topic": "l-cuts",
          "obj": 0,
          "stem": "How much of the old voice plays over the new image?",
          "options": [
            "Two seconds",
            "Three seconds",
            "Five seconds",
            "None"
          ],
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><text x=\"12\" y=\"26\" font-family=\"Arial,sans-serif\" font-size=\"16\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Split picture and sound</text><text x=\"9\" y=\"68\" font-family=\"Arial,sans-serif\" font-size=\"12\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Picture</text><rect x=\"65\" y=\"46\" width=\"102\" height=\"36\" rx=\"4\" fill=\"#3157c8\" stroke=\"none\"/><rect x=\"167\" y=\"46\" width=\"138\" height=\"36\" rx=\"4\" fill=\"#9a542e\" stroke=\"none\"/><text x=\"69\" y=\"68\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Speaker</text><text x=\"171\" y=\"68\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Listener</text><text x=\"9\" y=\"119\" font-family=\"Arial,sans-serif\" font-size=\"12\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Sound</text><rect x=\"65\" y=\"97\" width=\"170\" height=\"36\" rx=\"4\" fill=\"#3157c8\" stroke=\"none\"/><rect x=\"235\" y=\"97\" width=\"70\" height=\"36\" rx=\"4\" fill=\"#9a542e\" stroke=\"none\"/><text x=\"69\" y=\"119\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Speaker</text><text x=\"239\" y=\"119\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Room</text><text x=\"65\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">0s</text><text x=\"99\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">1s</text><text x=\"133\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">2s</text><text x=\"167\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">3s</text><text x=\"201\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">4s</text><text x=\"235\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">5s</text><text x=\"269\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">6s</text><text x=\"303\" y=\"159\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">7s</text></svg>",
          "alt": "Picture: Speaker 0–3 s > Listener 3–7 s. Sound: Speaker 0–5 s > Room 5–7 s"
        },
        {
          "id": "b4",
          "type": "mc",
          "level": 2,
          "topic": "pace-and-rhythm",
          "obj": 0,
          "stem": "Which cut pattern gives the audience more time to examine each image?",
          "options": [
            "B",
            "Both give equal time",
            "The diagram supplies no durations",
            "A"
          ],
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"6\" y=\"10.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"26.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Edit A</text><rect x=\"13.0\" y=\"32.0\" width=\"94.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Desk 4 s</text><rect x=\"111.0\" y=\"32.0\" width=\"94.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"116.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Book 4 s</text><rect x=\"209.0\" y=\"32.0\" width=\"94.0\" height=\"49.0\" rx=\"4\" fill=\"#dceadd\" stroke=\"none\"/><text x=\"214.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Face 4 s</text><rect x=\"6\" y=\"90.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"106.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Edit B</text><rect x=\"13.0\" y=\"112.0\" width=\"94.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Desk 1 s</text><rect x=\"111.0\" y=\"112.0\" width=\"94.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"116.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Book 1 s</text><rect x=\"209.0\" y=\"112.0\" width=\"94.0\" height=\"49.0\" rx=\"4\" fill=\"#dceadd\" stroke=\"none\"/><text x=\"214.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Face 1 s</text></svg>",
          "alt": "Edit A: Desk 4 s > Book 4 s > Face 4 s. Edit B: Desk 1 s > Book 1 s > Face 1 s"
        },
        {
          "id": "b5",
          "type": "mc",
          "level": 2,
          "topic": "b-roll-relevance",
          "obj": 0,
          "stem": "The speaker says, “We practise passing before kickoff.” What job would this close-up do under the line?",
          "options": [
            "Replace all interview sound",
            "Identify who wrote the music",
            "Illustrate what the player describes",
            "Establish the library"
          ],
          "media": "p10-soccer-pass",
        },
        {
          "id": "b6",
          "type": "mc",
          "level": 2,
          "topic": "cuts-dissolves-and-effects",
          "obj": 0,
          "stem": "Two images are partly visible at once for several frames. What transition is that?",
          "options": [
            "Wipe",
            "Dissolve",
            "Direct cut",
            "Fade to black"
          ]
        },
        {
          "id": "b7",
          "type": "mc",
          "level": 2,
          "topic": "performance-story-and-conceptual-balance",
          "obj": 0,
          "stem": "A paper boat slowly unfolds while a singer describes letting go. Which role does the boat most likely serve?",
          "options": [
            "Conceptual imagery",
            "Performance footage",
            "A literal character interview",
            "A sound bridge"
          ]
        },
        {
          "id": "b8",
          "type": "mc",
          "level": 2,
          "topic": "openings-and-endings",
          "obj": 0,
          "stem": "Which opening creates a concrete mystery before the title?",
          "options": [
            "The full equipment list appears",
            "Crew credits scroll for a minute",
            "A blank hallway is held without a change",
            "A locker opens and a sealed envelope falls out"
          ]
        }
      ]
    },
    {
      "title": "Section C · Make a decision",
      "items": [
        {
          "id": "c1",
          "type": "mc",
          "level": 3,
          "topic": "shot-length-and-new-information",
          "obj": 1,
          "stem": "The brief requires the audience to read the message. Which trim would lose essential information?",
          "options": [
            "End once someone can read the words",
            "Preserve the cover lifting",
            "End just before 3 s",
            "Allow a short reading hold"
          ],
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"6\" y=\"10.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"26.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">0–2 s</text><rect x=\"13.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Hand reaches</text><rect x=\"160.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Cover lifts</text><rect x=\"6\" y=\"90.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"106.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">2–7 s</text><rect x=\"13.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"134.0\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Message visible at 3</text><text x=\"18.0\" y=\"147.0\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">s</text><rect x=\"160.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Nothing changes</text></svg>",
          "alt": "0–2 s: Hand reaches > Cover lifts. 2–7 s: Message visible at 3 s > Nothing changes"
        },
        {
          "id": "c2",
          "type": "mc",
          "level": 3,
          "topic": "performance-a-b-editing",
          "obj": 1,
          "stem": "Which plan keeps the strongest visible moments from these two aligned takes?",
          "options": [
            "Use B first and A second; slide both randomly",
            "Use A first and B for the second phrase; preserve source times",
            "Switch to the first frame of B halfway through the song",
            "Use only whichever take ends later"
          ],
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"6\" y=\"10.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"26.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">First phrase</text><rect x=\"13.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take A: face in view</text><rect x=\"160.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take B: face blocked</text><rect x=\"6\" y=\"90.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"106.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Second phrase</text><rect x=\"13.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take A: hands blocked</text><rect x=\"160.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take B: gesture clear</text></svg>",
          "alt": "First phrase: Take A: face in view > Take B: face blocked. Second phrase: Take A: hands blocked > Take B: gesture clear"
        },
        {
          "id": "c3",
          "type": "mc",
          "level": 3,
          "topic": "edit-judgment",
          "obj": 1,
          "stem": "Which revision fixes the mismatch at 12 seconds?",
          "options": [
            "Show the book while keeping the spoken line",
            "Lengthen the shot of the field",
            "Use a louder voice over the field",
            "Add another field angle"
          ],
          "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"6\" y=\"10.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"26.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Story log</text><rect x=\"13.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">0 s: desk</text><rect x=\"160.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">4 s: same face jumps</text><rect x=\"6\" y=\"90.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"106.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Later cuts</text><rect x=\"13.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">8 s: wipe mid-line</text><rect x=\"160.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"134.0\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">12 s: field over book</text><text x=\"165.0\" y=\"147.0\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">line</text></svg>",
          "alt": "Story log: 0 s: desk > 4 s: same face jumps. Later cuts: 8 s: wipe mid-line > 12 s: field over book line"
        },
        {
          "id": "c4",
          "type": "mc",
          "level": 3,
          "topic": "j-cuts",
          "obj": 1,
          "stem": "A gym cheer should draw us from a quiet hallway into a game. How would you edit the entrance?",
          "options": [
            "Start the cheer after the first play finishes",
            "Keep silent hallway sound throughout the game",
            "Fade the pictures to white for every cheer",
            "Start the cheer under the hallway picture"
          ]
        },
        {
          "id": "c5",
          "type": "mc",
          "level": 3,
          "topic": "l-cuts",
          "obj": 1,
          "stem": "A coach finishes a sentence while a player reacts. What keeps the whole line and shows the reaction?",
          "options": [
            "Cut sound and picture before the last word",
            "Wait for silence before showing the player",
            "Switch pictures before the coach’s sound ends",
            "Play the coach’s line twice"
          ]
        },
        {
          "id": "c6",
          "type": "mc",
          "level": 3,
          "topic": "shot-order-and-meaning",
          "obj": 1,
          "stem": "A viewer should know the note is hidden before the Reader enters. What should you put first?",
          "options": [
            "The Reader’s final look after leaving",
            "A detail of the note under the book",
            "An unrelated shot of the field",
            "A long blank title"
          ]
        },
        {
          "id": "c7",
          "type": "mc",
          "level": 3,
          "topic": "editing-on-the-beat",
          "obj": 1,
          "stem": "The music accent lands at 4 s and the picture changes at 4.5 s. What makes that picture hit the accent?",
          "options": [
            "Move the picture edit half a second earlier",
            "Move the picture edit half a second later",
            "Move the entire song and picture together",
            "Change the marker label only"
          ]
        }
      ]
    },
    {
      "title": "Section D · Explain your edit",
      "items": [
        {
          "id": "d1",
          "type": "written",
          "level": 4,
          "topic": "shot-order-and-meaning",
          "obj": 1,
          "stem": "The available shots are an empty hallway, a hidden note, the reader’s face and a closing door. Sketch or describe two different orders. Explain how one makes the reader seem worried and the other confident.",
          "lines": 5,
          "sketch": 2
        },
        {
          "id": "d2",
          "type": "written",
          "level": 4,
          "topic": "edit-judgment",
          "obj": 1,
          "stem": "A 25-second interview jumps in mid-sentence, shows a ball while the speaker describes a book, and ends abruptly. Give a specific change for each problem and describe how you would verify one fix.",
          "lines": 5,
          "sketch": false
        }
      ]
    }
  ]
};
