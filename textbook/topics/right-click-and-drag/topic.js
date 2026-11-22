(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "right-click-and-drag",
  "minutes": 8,
  "bigIdea": "Right-click shows choices. Drag moves things.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">draft.txt  ·  actions</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Open</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Copy</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#d9e4ff\" stroke=\"#3157c8\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Rename</text></svg>",
    "alt": "Menu beside draft.txt lists Open, Copy and Rename.",
    "question": "Which command changes the label on draft.txt?",
    "options": [
      "Rename",
      "Open"
    ],
    "answer": 0,
    "reveal": "A [[right-click]] brings up a [[menu]] for that item. Rename changes its label."
  },
  "notes": {
    "sketch": "Draw the source and destination.",
    "frames": 2,
    "frameLabels": [
      "Before",
      "After"
    ],
    "think": "How will you check that the move finished?"
  },
  "vocab": [
    "right-click",
    "menu",
    "drag-and-drop"
  ],
  "review": [],
  "objectives": [
    "Rename one file from its context menu.",
    "Move a file into a folder and return it."
  ],
  "sections": [
    {
      "title": "Command or destination?",
      "intro": "First choose the file you mean.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Use a [[right-click]] to see a [[menu]] for the item under the pointer. On a trackpad, try a two-finger click. On a keyboard, use Shift+F10.</p><p>To [[drag and drop]], hold the file, move to the folder, then release. Within one drive the file changes location.</p>"
        },
        {
          "type": "figure",
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">draft.txt  ·  actions</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Open</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Copy</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#d9e4ff\" stroke=\"#3157c8\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Rename</text></svg>",
          "alt": "The Rename command in the menu for draft.txt.",
          "caption": "The menu belongs to draft.txt."
        }
      ]
    },
    {
      "title": "Try the context menu",
      "intro": "Inspect the commands before committing a change.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Right-click draft.txt, or select it and press Shift+F10, to see its menu. Press Escape to close it. Drag the file into Project, then use Cut and Paste to bring it back.</p>"
        },
        {
          type: "desktop-sim",
          desktop: [
            { name: "draft.txt", text: "Shot list draft\n1. Wide of the hall\n2. Close-up of the note" },
            { name: "Project", children: ["TheNote_edit.prproj"] },
            { name: "Poster.jpg", media: "p4-hard-edge" }
          ],
          tasks: []
        }
      ]
    },
    {
      "title": "Try it yourself",
      "intro": "Open the menu on draft.txt and rename it plan.txt.",
      "blocks": [
        {
          type: "desktop-sim",
          desktop: [
            { name: "draft.txt", text: "Shot list draft\n1. Wide of the hall\n2. Close-up of the note" },
            { name: "Project", children: ["TheNote_edit.prproj"] },
            { name: "Poster.jpg", media: "p4-hard-edge" }
          ],
          tasks: [
            { text: "Right-click draft.txt and choose **Rename** (the pencil icon). Name it plan.txt.", check: s => s.exists("Desktop > plan.txt") && s.did("context-menu"), hint: "On a trackpad, click with two fingers. Type plan and press Enter; the .txt stays." },
            { text: "Drag plan.txt onto the Project folder and let go. Open Project and double-click plan.txt.", check: s => s.previewed("Desktop > Project > plan.txt") },
            { text: "In Project, right-click plan.txt and choose **Cut**. Right-click an empty spot on the desktop and choose **Paste**.", check: s => s.movedTo("Desktop > plan.txt") && s.did("paste") },
            { text: "Hold the **right** mouse button, drag Poster.jpg onto Project, let go and choose **Copy here**.", check: s => s.did("right-drag") && s.copiedTo("Desktop > Project > Poster.jpg"), hint: "A menu appears when you let go of the right button." }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "What will Rename change in this menu?",
      "options": [
        {
          "text": "The name of its parent folder",
          "clue": "Read the menu heading."
        },
        "The name of draft.txt"
      ],
      "answer": 1,
      "explain": "The menu belongs to draft.txt.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">draft.txt  ·  actions</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Open</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Copy</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#d9e4ff\" stroke=\"#3157c8\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Rename</text></svg>",
      "alt": "The menu belongs to draft.txt."
    },
    {
      "q": "Your pointer is over Project while you still hold the file. When does the move happen?",
      "options": [
        {
          "text": "When the cursor first touches it",
          "clue": "The mouse button is still down."
        },
        "When you release it over Project"
      ],
      "answer": 1,
      "explain": "Releasing over the folder sets the destination."
    },
    {
      "q": "Dragging is difficult. Which pair can move the same file?",
      "options": [
        {
          "text": "Copy, then Paste in Project",
          "clue": "Check whether the first location keeps a file."
        },
        "Cut, then Paste in Project"
      ],
      "answer": 1,
      "explain": "Cut and Paste relocate the existing file."
    }
  ],
  "remember": [
    "Use [[right-click]] on the item you want to change.",
    "Choose a command from the [[menu]].",
    "With [[drag and drop]], release over the intended folder."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Right-click an empty area of a practice folder and find New, then Folder. Rename the new folder."
});
})();
