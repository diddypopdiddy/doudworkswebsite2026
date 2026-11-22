(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "file-explorer-navigation",
  "minutes": 12,
  "bigIdea": "Every file has an address.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Documents  ›  Video  ›  The Note</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Source    ›    S04_master.mp4</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Project    ›    TheNote_edit.prproj</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Exports    ›    TheNote_final.mp4</text></svg>",
    "alt": "A common path ends at The Note. The rows show three branches.",
    "question": "How many folders below This PC do you enter to reach S04_master.mp4?",
    "options": [
      "Four",
      "Three"
    ],
    "answer": 0,
    "reveal": "Documents, Video, The Note and Source are four folders. Together with the drive and filename, they form the [[file path]]."
  },
  "notes": {
    "sketch": "Trace two routes with their shared parent.",
    "frames": 2,
    "frameLabels": [
      "Source route",
      "Exports route"
    ],
    "think": "Why is a filename alone sometimes insufficient?"
  },
  "vocab": [
    "file-explorer",
    "folder",
    "file-path",
    "address-bar"
  ],
  "review": [
    "open"
  ],
  "objectives": [
    "Read the parent folders in a file path.",
    "Reach a named file by following folders or entering an address."
  ],
  "sections": [
    {
      "title": "Read a path from left to right",
      "intro": "The first name tells you which drive to open.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>In Windows, [[File Explorer]] displays the current [[folder]]. Each part of the [[file path]] is one step from the drive.</p><p>Read the [[address bar]] to see where you are. Enter a full folder address to go there directly.</p>"
        },
        {
          "type": "figure",
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Documents  ›  Video  ›  The Note</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Source    ›    S04_master.mp4</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Project    ›    TheNote_edit.prproj</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Exports    ›    TheNote_final.mp4</text></svg>",
          "alt": "Folder tree with Source, Project and Exports below The Note.",
          "caption": "The three folders share a parent."
        },
        {
          "type": "callout",
          "kind": "consider",
          "title": "On a Chromebook",
          "html": "Open Files. My files is on this device. Google Drive is a separate location linked to your account."
        }
      ]
    },
    {
      "title": "Follow a branch",
      "intro": "Try two routes to the same folder.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Click Documents in the left pane and follow the folders to Source. Use Back once. Then click an empty part of the address bar, type C:\\Users\\Student\\Documents\\Video\\The Note\\Source and press Enter.</p>"
        },
        {
          type: "desktop-sim",
          documents: [
            { name: "Video", children: [
              { name: "The Note", children: [
                { name: "Source", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }, { name: "S06_book.mp4", media: "p8-note-detail" }] },
                { name: "Project", children: ["TheNote_edit.prproj"] },
                { name: "Exports", children: ["TheNote_final.mp4"] }
              ] }
            ] },
            "Permission form.pdf"
          ],
          drives: [{ name: "USB Drive", letter: "E", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }, { name: "S05_reaction.mp4", media: "p8-note-reaction" }, { name: "S06_book.mp4", media: "p8-note-detail" }] }],
          open: "Home",
          tasks: []
        }
      ]
    },
    {
      "title": "Try it yourself",
      "intro": "Follow Documents, Video, The Note, then Source. Open S04_master.mp4.",
      "blocks": [
        {
          type: "desktop-sim",
          documents: [
            { name: "Video", children: [
              { name: "The Note", children: [
                { name: "Source", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }, { name: "S06_book.mp4", media: "p8-note-detail" }] },
                { name: "Project", children: ["TheNote_edit.prproj"] },
                { name: "Exports", children: ["TheNote_final.mp4"] }
              ] }
            ] },
            "Permission form.pdf"
          ],
          drives: [{ name: "USB Drive", letter: "E", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }, { name: "S05_reaction.mp4", media: "p8-note-reaction" }, { name: "S06_book.mp4", media: "p8-note-detail" }] }],
          open: "Home",
          tasks: [
            { text: "In the left pane, click **Documents**. Open Video, The Note, then Source. Double-click S04_master.mp4.", check: s => s.previewed("Documents > Video > The Note > Source > S04_master.mp4") },
            { text: "Click **The Note** in the address bar (or press Back). Open Project and double-click TheNote_edit.prproj.", check: s => s.previewed("Documents > Video > The Note > Project > TheNote_edit.prproj") && (s.did("crumb") || s.did("back")) },
            { text: "Click an empty part of the address bar. Type `C:\\Users\\Student\\Documents\\Video\\The Note\\Exports` and press Enter. Open TheNote_final.mp4.", check: s => s.did("address") && s.previewed("Documents > Video > The Note > Exports > TheNote_final.mp4"), hint: "Each backslash \\ separates one folder from the next." },
            { text: "Open **View** in the command bar and choose **List**. Then switch to **Large icons**.", check: s => s.did("view", "list") && s.did("view", "large") },
            { text: "Click the USB Drive in the left pane. Click S04_master.mp4, hold **Shift** and click S06_book.mp4 to select all three clips.", check: s => s.did("select-range") && s.selection.length === 3 && s.at("USB Drive") }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which folder directly contains the finished video?",
      "options": [
        {
          "text": "The Note",
          "clue": "Look one step before the filename."
        },
        "Exports"
      ],
      "answer": 1,
      "explain": "The final file sits inside Exports.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Documents  ›  Video  ›  The Note</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Source    ›    S04_master.mp4</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Project    ›    TheNote_edit.prproj</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Exports    ›    TheNote_final.mp4</text></svg>",
      "alt": "The final file sits inside Exports."
    },
    {
      "q": "Two drives each contain a folder named Video. What part of the path distinguishes them?",
      "options": [
        {
          "text": "The folder name Video",
          "clue": "Read from the far left."
        },
        "The first name, the drive"
      ],
      "answer": 1,
      "explain": "The drive identifies the starting location."
    },
    {
      "q": "You opened Source instead of Project. Which route stays within The Note?",
      "options": [
        "Back once, then Project",
        {
          "text": "Open the USB drive",
          "clue": "The two destinations share a parent."
        }
      ],
      "answer": 0,
      "explain": "Back returns to The Note, where Project is visible."
    }
  ],
  "remember": [
    "A [[file path]] names each step from the drive.",
    "The [[address bar]] shows the current location.",
    "Use [[File Explorer]] to open a [[folder]] or enter its address."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Find a photo on a connected phone or in a school photo folder. Record its path so another person could locate it."
});
})();
