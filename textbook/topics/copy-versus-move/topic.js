(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "copy-versus-move",
  "minutes": 12,
  "bigIdea": "Copy makes two. Move keeps one.",
  "hook": {
    "svg": D.editCards("Drag USB clip to class computer", [["Before", "USB: S04.mp4", "PC: empty"], ["After", "USB: S04.mp4", "PC: S04.mp4"]]),
    "alt": "The same file is listed on the USB drive before and after the drag.",
    "question": "After this drag, can the crew still use the USB original?",
    "options": [
      "Yes",
      "No"
    ],
    "answer": 0,
    "reveal": "S04.mp4 appears at both locations. A [[copy]] leaves the original in place."
  },
  "notes": {
    "sketch": "Draw both drives before and after a copy.",
    "frames": 2,
    "frameLabels": [
      "Before",
      "After"
    ],
    "think": "How many usable copies survive if you lose the USB drive?"
  },
  "vocab": [
    "copy",
    "move",
    "paste",
    "duplicate"
  ],
  "review": [
    "file-path"
  ],
  "objectives": [
    "Predict whether an action leaves one file or two.",
    "Copy and open two clips while keeping both USB originals."
  ],
  "sections": [
    {
      "title": "Count the locations",
      "intro": "Look for the original after each operation.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Use [[copy]], choose a destination, then [[paste]]. A [[duplicate]] is another version. A [[move]] takes the file out of its old location.</p><p>In this Windows simulation, dragging within one drive moves a file. Dragging to a different drive copies it. Check both locations when you finish.</p>"
        },
        {
          "type": "figure-row",
          "items": [
            {
              "type": "figure",
              "svg": D.editCards("Drag USB clip to class computer", [["Before", "USB: S04.mp4", "PC: empty"], ["After", "USB: S04.mp4", "PC: S04.mp4"]]),
              "alt": "USB and PC each contain S04 after a copy.",
              "caption": "Copy between drives."
            },
            {
              "type": "figure",
              "svg": D.editCards("Drag within This PC", [["Before", "Desktop: S04.mp4", "Source: empty"], ["After", "Desktop: empty", "Source: S04.mp4"]]),
              "alt": "Only Source has the file after a move.",
              "caption": "Move on the same drive."
            }
          ]
        }
      ]
    },
    {
      "title": "Predict the USB result",
      "intro": "Decide how many copies you expect first.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Drag a USB file into the Documents window. Check both windows. Then drag the Documents copy into Source and check both locations again.</p>"
        },
        {
          type: "desktop-sim",
          documents: [{ name: "Source", children: [] }],
          drives: [{ name: "USB Drive", letter: "E", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }, { name: "S06_book.mp4", media: "p8-note-detail" }] }],
          open: ["Documents", "USB Drive"],
          tasks: []
        }
      ]
    },
    {
      "title": "Protect the originals",
      "intro": "Sort six requests, then perform a two-clip ingest.",
      "blocks": [
        {
          "type": "sorter",
          "prompt": "Choose the action that leaves files where the crew needs them.",
          "groups": [
            "Copy",
            "Move"
          ],
          "items": [
            {
              "text": "Keep the card intact while starting the edit.",
              "group": 0,
              "clue": "Will the card need an original?",
              "why": "A working copy goes to the editor."
            },
            {
              "text": "A scratch edit is filed under Exports. Put it in Project only.",
              "group": 1,
              "clue": "Should Exports still contain the edit?",
              "why": "One file changes its home."
            },
            {
              "text": "Give the teacher a finished video and keep yours.",
              "group": 0,
              "clue": "Two people need the same file.",
              "why": "The teacher gets another file."
            },
            {
              "text": "A take sits in the wrong shot folder. Correct its only working location.",
              "group": 1,
              "clue": "Count the wanted working locations.",
              "why": "The file leaves the wrong folder."
            },
            {
              "text": "Keep a second version before testing a new cut.",
              "group": 0,
              "clue": "One version must stay untouched.",
              "why": "A duplicate protects the earlier version."
            },
            {
              "text": "A verified backup exists. Relocate one working folder on the same drive.",
              "group": 1,
              "clue": "The task asks for a single new working location.",
              "why": "The working folder changes place."
            }
          ]
        },
        {
          type: "desktop-sim",
          documents: [{ name: "Source", children: [] }],
          drives: [{ name: "USB Drive", letter: "E", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }, { name: "S06_book.mp4", media: "p8-note-detail" }] }],
          open: ["Documents", "USB Drive"],
          tasks: [
            { text: "Drag S04_master.mp4 from the USB Drive window onto **Source** in the Documents window. The tip says **Copy to Source**.", check: s => s.copiedTo("Documents > Source > S04_master.mp4"), hint: "Drag the title bar of a window to move it if one covers the other." },
            { text: "Copy S06_book.mp4 into Source with **Ctrl+C**, then open Source and press **Ctrl+V**. Leave both originals on the USB drive.", check: s => s.copiedTo("Documents > Source > S06_book.mp4") && s.exists("USB Drive > S04_master.mp4") && s.exists("USB Drive > S06_book.mp4") },
            { text: "Open both copies from Source to check the destination.", check: s => ["S04_master.mp4", "S06_book.mp4"].every(n => s.previewed("Documents > Source > " + n)) }
          ]
        },
        {
          "type": "callout",
          "kind": "mistake",
          "html": "Cutting the only copy off a borrowed drive empties the source. Keep it until the destination and a separate backup are verified."
        }
      ]
    }
  ],
  "check": [
    {
      "q": "How many locations now hold S04.mp4?",
      "options": [
        {
          "text": "One",
          "clue": "Read the two lines in the After column."
        },
        "Two"
      ],
      "answer": 1,
      "explain": "Both the USB drive and the PC list S04.mp4.",
      "svg": D.editCards("Drag USB clip to class computer", [["Before", "USB: S04.mp4", "PC: empty"], ["After", "USB: S04.mp4", "PC: S04.mp4"]]),
      "alt": "Both the USB drive and the PC list S04.mp4."
    },
    {
      "q": "A file vanishes from Downloads and appears inside Source on the same drive. What occurred?",
      "options": [
        {
          "text": "A duplicate",
          "clue": "Count the locations after the action."
        },
        "A move"
      ],
      "answer": 1,
      "explain": "Only the destination still holds the file."
    },
    {
      "q": "You clicked Copy on a USB clip. Which step puts it into Source?",
      "options": [
        {
          "text": "Close the USB window and unplug it",
          "clue": "Copy alone only prepares the next command."
        },
        "Open Source and paste there"
      ],
      "answer": 1,
      "explain": "Paste creates the destination copy."
    }
  ],
  "remember": [
    "A [[copy]] leaves the original in place.",
    "A [[move]] changes the file’s location.",
    "After [[paste]], open the destination copy before clearing any media."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Copy a practice file to a second drive. Open it there and locate the original."
});
})();
