(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "organize-source-project-and-export-files",
  "minutes": 12,
  "bigIdea": "Keep the raw clips, the edit and the final video apart.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">Downloads  ·  file details</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">VID_004.mp4    • camera original</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">TheNote.prproj    • editable sequence</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">TheNote_final.mp4    • delivered cut</text></svg>",
    "alt": "Downloads contains a camera original, an editable sequence and a delivered cut.",
    "question": "Which file can you hand to someone who just wants to watch the finished cut?",
    "options": [
      "TheNote_final.mp4",
      "TheNote.prproj"
    ],
    "answer": 0,
    "reveal": "The delivered cut is an [[export]]. The [[project file]] stores decisions for further editing."
  },
  "notes": {
    "sketch": "Label one original, one project and one export.",
    "frames": 3,
    "frameLabels": [
      "Source",
      "Project",
      "Exports"
    ],
    "think": "Which two kinds of files does the next editor need?"
  },
  "vocab": [
    "source-media",
    "project-file",
    "export",
    "naming-convention"
  ],
  "review": [
    "file-path",
    "subfolder"
  ],
  "objectives": [
    "Sort original media, editable decisions and delivery files.",
    "Name a take with the project, shot, take and date."
  ],
  "sections": [
    {
      "title": "Give every file a job",
      "intro": "Two files can both end in .mp4 and serve different purposes.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>[[Source media]] is the material you record or bring into the edit. A [[project file]] stores the sequence and points to media. Keep both to continue editing.</p><p>An [[export]] is a rendered viewing copy. Use the delivery name and context to distinguish it from an original camera clip.</p>"
        },
        {
          "type": "figure",
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">Downloads  ·  file details</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">VID_004.mp4    • camera original</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">TheNote.prproj    • editable sequence</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">TheNote_final.mp4    • delivered cut</text></svg>",
          "alt": "Roles shown beside three files in Downloads.",
          "caption": "File extensions alone cannot tell you which MP4 is the export."
        }
      ]
    },
    {
      "title": "Name the take",
      "intro": "Build a label that sorts and survives a handoff.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Use the same [[naming convention]] for each camera take. Name the working copies before editing so the project keeps its links.</p>"
        },
        {
          "type": "steps",
          "items": [
            "Start with the project name, TheNote.",
            "Add the shot and take with leading zeros, S04_T02.",
            "Add the shoot date, 2026-11-21. Keep the original extension.",
            "Read the full label: TheNote_S04_T02_2026-11-21.mp4."
          ]
        }
      ]
    },
    {
      "title": "Sort the download and label the next take",
      "intro": "File ten items, then choose consistent take names.",
      "blocks": [
        {
          "type": "sorter",
          "prompt": "File each item by what it does. An MP4 can be an original or a delivery.",
          "groups": [
            "Source",
            "Project",
            "Exports"
          ],
          "items": [
            {
              "text": "Camera A: hallway wide.mp4",
              "group": 0,
              "clue": "Does the editor use this as an ingredient?",
              "why": "This is material for the edit."
            },
            {
              "text": "Library room tone.wav",
              "group": 0,
              "clue": "Does the editor use this as an ingredient?",
              "why": "This is material for the edit."
            },
            {
              "text": "TheNote_rough_cut.prproj",
              "group": 1,
              "clue": "Which file keeps the editable sequence?",
              "why": "This stores edit decisions."
            },
            {
              "text": "TheNote_final_delivery.mp4",
              "group": 2,
              "clue": "Which file can the audience watch?",
              "why": "This is a rendered viewing copy."
            },
            {
              "text": "Camera phone: clock detail.mov",
              "group": 0,
              "clue": "Does the editor use this as an ingredient?",
              "why": "This is material for the edit."
            },
            {
              "text": "Voice recorded for the scene.wav",
              "group": 0,
              "clue": "Does the editor use this as an ingredient?",
              "why": "This is material for the edit."
            },
            {
              "text": "TheNote_revised_edit.drp (edit decisions)",
              "group": 1,
              "clue": "Which file keeps the editable sequence?",
              "why": "This stores edit decisions."
            },
            {
              "text": "TheNote_captioned_delivery.mp4",
              "group": 2,
              "clue": "Which file can the audience watch?",
              "why": "This is a rendered viewing copy."
            },
            {
              "text": "Camera B: book insert.mp4",
              "group": 0,
              "clue": "Does the editor use this as an ingredient?",
              "why": "This is material for the edit."
            },
            {
              "text": "TheNote_review_export.mp4",
              "group": 2,
              "clue": "Which file can the audience watch?",
              "why": "This is a rendered viewing copy."
            }
          ]
        },
        {
          "type": "quiz",
          "items": [
            {
              "q": "The Note, shot 04, take 02, November 21 2026. Which label follows Project_Shot_Take_Date?",
              "options": [
                "TheNote_S04_T02_2026-11-21.mp4",
                {
                  "text": "TheNote_T02_S04_2026-11-21.mp4",
                  "clue": "Compare the shot and take fields."
                }
              ],
              "answer": 0,
              "explain": "Shot comes before take."
            },
            {
              "q": "The same shot is filmed again. Which field changes?",
              "options": [
                {
                  "text": "S04 to S05",
                  "clue": "The framing and planned shot stayed the same."
                },
                "T02 to T03"
              ],
              "answer": 1,
              "explain": "Another attempt changes the take field."
            },
            {
              "q": "The next day you film S06 T01. Which name separates the two shoots?",
              "options": [
                {
                  "text": "TheNote_S06_T01_latest.mp4",
                  "clue": "Which field can be sorted by capture day?"
                },
                "TheNote_S06_T01_2026-11-22.mp4"
              ],
              "answer": 1,
              "explain": "The date identifies the shoot day."
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which item should stay with the editable timeline?",
      "options": [
        {
          "text": "TheNote_final.mp4",
          "clue": "Find the line labeled editable sequence."
        },
        "TheNote.prproj"
      ],
      "answer": 1,
      "explain": "The .prproj file holds the edit decisions.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">Downloads  ·  file details</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">VID_004.mp4    • camera original</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">TheNote.prproj    • editable sequence</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">TheNote_final.mp4    • delivered cut</text></svg>",
      "alt": "The .prproj file holds the edit decisions."
    },
    {
      "q": "Where should a camera original that ends in .mp4 go?",
      "options": [
        {
          "text": "Exports",
          "clue": "Who produced the file, the camera or the editor?"
        },
        "Source"
      ],
      "answer": 1,
      "explain": "Camera recordings are source media even when they share a delivery format."
    },
    {
      "q": "TheNote_S06_T03_2026-11-21.mp4 is which take?",
      "options": [
        {
          "text": "Sixth attempt at shot three",
          "clue": "S and T identify different fields."
        },
        "Third attempt at shot six"
      ],
      "answer": 1,
      "explain": "S06 gives shot six and T03 gives take three."
    }
  ],
  "remember": [
    "Keep [[source media]] together so the [[project file]] can find it.",
    "Give the audience a verified [[export]].",
    "Use a [[naming convention]] that identifies each take."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Rename five practice copies to follow the class rule. Have a partner identify a shot and take from one name."
});
})();
