(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "select-open-and-close",
  "minutes": 8,
  "bigIdea": "One click selects. Two clicks open.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#d9e4ff\" stroke=\"#3157c8\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Project    • selected</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">S04_master.mp4</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">S06_book.mp4</text></svg>",
    "alt": "Project is highlighted. Two clips remain visible beside it.",
    "question": "Can you see the contents of Project yet?",
    "options": [
      "No. I see its neighbors.",
      "Yes. Project has a highlight."
    ],
    "answer": 0,
    "reveal": "The highlight marks the folder you [[select]]. When you [[open]] it, the view shows its contents."
  },
  "notes": {
    "sketch": "Draw the highlighted folder and its open window.",
    "frames": 2,
    "frameLabels": [
      "Selected",
      "Opened"
    ],
    "think": "Which change tells you a folder actually opened?"
  },
  "vocab": [
    "select",
    "open",
    "window",
    "close"
  ],
  "review": [],
  "objectives": [
    "Select one or more files for a command.",
    "Open a folder and close its window without changing its contents."
  ],
  "sections": [
    {
      "title": "Read the highlight",
      "intro": "Compare the list with the folder open.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A single click lets you [[select]] an item. A double-click or Enter lets you [[open]] it.</p><p>A [[window]] shows what is inside. When you [[close]] it, the folder and its files stay where they were.</p>"
        },
        {
          "type": "figure-row",
          "items": [
            {
              "type": "figure",
              "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#d9e4ff\" stroke=\"#3157c8\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Project    • selected</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">S04_master.mp4</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">S06_book.mp4</text></svg>",
              "alt": "Project highlighted among neighboring items.",
              "caption": "Selected. The clips are still beside Project."
            },
            {
              "type": "figure",
              "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Project</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">TheNote_edit.prproj</text></svg>",
              "alt": "Project contains one edit file.",
              "caption": "Opened. The location ends in Project."
            }
          ]
        }
      ]
    },
    {
      "title": "Try the two clicks",
      "intro": "Watch the address while you work.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Click Project once and notice the highlight. Double-click it and a File Explorer window opens. Close it with the X in the top-right corner. The folder is still on the desktop.</p>"
        },
        {
          type: "desktop-sim",
          title: "Try it: the practice desktop",
          desktop: [
            { name: "Project", children: ["TheNote_edit.prproj", { name: "Shot list.txt", text: "S04 wide: enter, sit\nS06 close: open the book" }] },
            { name: "S04_master.mp4", media: "p8-note-wide" },
            { name: "S06_book.mp4", media: "p8-note-detail" },
            { name: "Notes.txt", text: "Bring the blue notebook." }
          ],
          tasks: []
        }
      ]
    },
    {
      "title": "Try it yourself",
      "intro": "Open, close and select on a Windows 11 desktop.",
      "blocks": [
        {
          type: "desktop-sim",
          desktop: [
            { name: "Project", children: ["TheNote_edit.prproj", { name: "Shot list.txt", text: "S04 wide: enter, sit\nS06 close: open the book" }] },
            { name: "S04_master.mp4", media: "p8-note-wide" },
            { name: "S06_book.mp4", media: "p8-note-detail" },
            { name: "Notes.txt", text: "Bring the blue notebook." }
          ],
          tasks: [
            { text: "Double-click **Project** on the desktop to open it.", check: s => s.opened("Desktop > Project"), hint: "Point at the yellow Project folder and click twice quickly." },
            { text: "Close the Project window with the **X** in its top-right corner.", check: s => s.closed("Desktop > Project") },
            { text: "Select both MP4 files together. Click one, then hold **Ctrl** and click the other.", check: s => s.did("select-toggle") && s.selection.length === 2 && s.selection.every(x => /\.mp4$/i.test(x.name)), hint: "On a Mac, hold Command instead of Ctrl." },
            { text: "Double-click S04_master.mp4 to play it, then close Media Player.", check: s => s.previewed("Desktop > S04_master.mp4") && s.did("close-app", e => e.app === "player") },
            { text: "Click an empty part of the desktop, then press **Ctrl+A** to select everything.", check: s => s.did("select-all") }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which item will a rename command act on here?",
      "options": [
        "Project",
        {
          "text": "Both MP4 files",
          "clue": "Count the highlighted rows."
        }
      ],
      "answer": 0,
      "explain": "Only Project has the highlight.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#d9e4ff\" stroke=\"#3157c8\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Project    • selected</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">S04_master.mp4</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">S06_book.mp4</text></svg>",
      "alt": "Only Project has the highlight."
    },
    {
      "q": "How can you open the selected folder with the keyboard?",
      "options": [
        "Press Enter",
        {
          "text": "Press the right mouse button",
          "clue": "A context menu offers commands."
        }
      ],
      "answer": 0,
      "explain": "Enter opens the selected item."
    },
    {
      "q": "After you close Project, where is the edit file?",
      "options": [
        {
          "text": "In the recycle bin",
          "clue": "Closing changes the view."
        },
        "Inside Project"
      ],
      "answer": 1,
      "explain": "The folder still holds its contents."
    }
  ],
  "remember": [
    "[[Select]] an item to aim a command at it.",
    "[[Open]] a folder to see its contents.",
    "[[Close]] the [[window]] when you finish."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Open and close three practice items with the mouse. Repeat with Enter and the close-window shortcut for your computer."
});
})();
