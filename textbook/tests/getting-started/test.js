(function () {
  const D = window.Textbook.draw;
  window.TEXTBOOK_TEST = {
  "part": "getting-started",
  "minutes": 40,
  "instructions": "Read each diagram and choose one answer per question. Explain each written decision with a detail from the situation.",
  "sections": [
    {
      "title": "A · Words and concepts",
      "note": "Level 1",
      "items": [
        {
          "id": "a-match",
          "type": "match",
          "level": 1,
          "topic": "select-open-and-close",
          "obj": 0,
          "targets": [
            {
              "topic": "select-open-and-close",
              "obj": 0
            },
            {
              "topic": "select-open-and-close",
              "obj": 1
            },
            {
              "topic": "right-click-and-drag",
              "obj": 0
            },
            {
              "topic": "file-explorer-navigation",
              "obj": 0
            },
            {
              "topic": "create-and-find-folders",
              "obj": 0
            },
            {
              "topic": "organize-source-project-and-export-files",
              "obj": 0
            }
          ],
          "stem": "Write the letter for each definition. Some choices will remain unused.",
          "terms": [
            "select",
            "open",
            "menu",
            "file path",
            "subfolder",
            "copy",
            "file sync",
            "export"
          ],
          "defs": [
            "Highlight an item so a command applies to it.",
            "See the contents of a folder in a window.",
            "Choices offered when you right-click a file.",
            "A route from the drive through folders to an item.",
            "A folder inside another folder.",
            "A finished video rendered for viewing."
          ]
        },
        {
          "id": "a1",
          "type": "mc",
          "level": 1,
          "topic": "copy-versus-move",
          "obj": 0,
          "stem": "Which action leaves the original at its old address and creates another file?",
          "options": [
            "Move",
            "Rename",
            "Copy",
            "Close"
          ]
        },
        {
          "id": "a2",
          "type": "mc",
          "level": 1,
          "topic": "storage-locations",
          "obj": 1,
          "stem": "What does sync do to linked locations?",
          "options": [
            "Permanently preserves every old version",
            "Makes every file public",
            "Makes every online file available offline",
            "Updates them to reflect changes"
          ]
        }
      ]
    },
    {
      "title": "B · Read the example",
      "note": "Level 2",
      "items": [
        {
          "id": "b1",
          "type": "mc",
          "level": 2,
          "topic": "select-open-and-close",
          "obj": 1,
          "stem": "Which folder is open in this view?",
          "options": [
            "This PC",
            "Source",
            "Exports",
            "Project"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  The Note  ›  Project</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">TheNote_edit.prproj</text></svg>",
          "alt": "An address bar ends in Project; the edit file is listed below."
        },
        {
          "id": "b2",
          "type": "mc",
          "level": 2,
          "topic": "right-click-and-drag",
          "obj": 0,
          "stem": "Which command changes the selected file’s label?",
          "options": [
            "Rename",
            "Copy",
            "Open",
            "Paste"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">draft.txt  ·  actions</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Open</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Copy</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Rename</text></svg>",
          "alt": "Three menu options for draft.txt."
        },
        {
          "id": "b3",
          "type": "mc",
          "level": 2,
          "topic": "file-explorer-navigation",
          "obj": 0,
          "stem": "Which folder directly contains S06_book.mp4?",
          "options": [
            "Shoot01",
            "Source",
            "Video",
            "This PC"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Video  ›  Shoot01  ›  Source</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">S06_book.mp4</text></svg>",
          "alt": "The address shows the route to a camera clip."
        },
        {
          "id": "b4",
          "type": "mc",
          "level": 2,
          "topic": "create-and-find-folders",
          "obj": 0,
          "stem": "You click New folder in this view. Where does the new folder appear?",
          "options": [
            "Beside Exports",
            "Inside Source",
            "Inside Exports",
            "At the drive root"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  The Note  ›  Exports</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">TheNote_final.mp4</text></svg>",
          "alt": "Exports is the current location."
        },
        {
          "id": "b5",
          "type": "mc",
          "level": 2,
          "topic": "copy-versus-move",
          "obj": 0,
          "stem": "A student changes the locations as shown. Which action fits?",
          "options": [
            "Copy",
            "Duplicate in place",
            "Rename the clip",
            "Move"
          ],
          "svg": D.editCards("Clip locations", [["Before", "Desktop: S06", "Source: empty"], ["After", "Desktop: empty", "Source: S06"]]),
          "alt": "S06 changes from Desktop to Source."
        },
        {
          "id": "b6",
          "type": "mc",
          "level": 2,
          "topic": "storage-locations",
          "obj": 0,
          "stem": "What storage choice carried the clip to an offline lab?",
          "options": [
            "External drive containing the media",
            "Online-only shortcut",
            "Private link to a cloud preview",
            "Path on the first computer’s SSD"
          ]
        },
        {
          "id": "b7",
          "type": "mc",
          "level": 2,
          "topic": "organize-source-project-and-export-files",
          "obj": 1,
          "stem": "Which filename identifies shot 8, take 2 and the shoot date in the class order?",
          "options": [
            "TheNote_T02_S08_2026-11-21.mp4",
            "TheNote_S08_T02_2026-11-21.mp4",
            "2026-11-21_T02_TheNote_S08.mp4",
            "TheNote_S02_T08_2026-11-21.mp4"
          ]
        }
      ]
    },
    {
      "title": "C · Decide what to do",
      "note": "Level 3",
      "items": [
        {
          "id": "c1",
          "type": "mc",
          "level": 3,
          "topic": "right-click-and-drag",
          "obj": 1,
          "stem": "The note now belongs inside Plans and should leave Desktop. Which operation matches that goal?",
          "options": [
            "Cut the file, open Plans, then paste",
            "Copy the file and paste into Plans",
            "Rename Desktop to Plans",
            "Open the file, then close it"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Desktop</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">note.txt</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Plans</text></svg>",
          "alt": "Desktop shows a note file next to Plans."
        },
        {
          "id": "c2",
          "type": "mc",
          "level": 3,
          "topic": "file-explorer-navigation",
          "obj": 1,
          "stem": "The teacher gave this address. You are at This PC. Which route reaches the requested take?",
          "options": [
            "Open Video, Source, The Note, then S04",
            "Open Video, The Note, Source, then S04",
            "Search only inside Exports",
            "Open the edit project named The Note"
          ],
          "svg": D.editCards("Teacher’s request", [["Open S04.mp4", "This PC > Video > The Note > Source"]]),
          "alt": "The requested file sits in Source under The Note."
        },
        {
          "id": "c3",
          "type": "mc",
          "level": 3,
          "topic": "create-and-find-folders",
          "obj": 1,
          "stem": "A search inside the empty Project folder misses a clip that might be anywhere in The Note. What should you try?",
          "options": [
            "Create a new empty clip with that name",
            "Rename Project to the clip’s name",
            "Search from The Note, then inspect the result path",
            "Search only the current folder again"
          ]
        },
        {
          "id": "c4",
          "type": "mc",
          "level": 3,
          "topic": "copy-versus-move",
          "obj": 1,
          "stem": "Which action completes a safe ingest of this borrowed USB?",
          "options": [
            "Move both clips to Source and return the empty USB",
            "Copy the filenames into the project file",
            "Open both USB clips, then remove the drive",
            "Copy both clips to Source, open the copies and check the originals"
          ],
          "svg": D.editCards("Borrowed USB", [["USB: 2 clips", "S04_master.mp4", "S06_book.mp4"], ["Class PC", "Source: empty", "Return USB today"]]),
          "alt": "The borrowed drive contains two clips and Source is empty."
        },
        {
          "id": "c5",
          "type": "mc",
          "level": 3,
          "topic": "organize-source-project-and-export-files",
          "obj": 0,
          "stem": "A partner needs to revise your timeline. Which handoff contains what the edit needs?",
          "options": [
            "Project file and linked source media together",
            "Finished export and thumbnail only",
            "Project file alone with missing media",
            "Originals alone without the edit decisions"
          ]
        }
      ]
    },
    {
      "title": "D · Plan and explain",
      "note": "Level 4",
      "items": [
        {
          "id": "d1",
          "type": "written",
          "level": 4,
          "topic": "organize-source-project-and-export-files",
          "obj": 0,
          "targets": [
            {
              "topic": "organize-source-project-and-export-files",
              "obj": 0
            },
            {
              "topic": "organize-source-project-and-export-files",
              "obj": 1
            },
            {
              "topic": "create-and-find-folders",
              "obj": 0
            },
            {
              "topic": "copy-versus-move",
              "obj": 1
            }
          ],
          "stem": "You have 40 camera clips and will edit on two computers. Draw or describe the folder tree, show one full take name, and explain how the second computer will open the edit.",
          "lines": 5
        },
        {
          "id": "d2",
          "type": "written",
          "level": 4,
          "topic": "storage-locations",
          "obj": 0,
          "targets": [
            {
              "topic": "storage-locations",
              "obj": 0
            },
            {
              "topic": "storage-locations",
              "obj": 1
            },
            {
              "topic": "file-explorer-navigation",
              "obj": 1
            },
            {
              "topic": "select-open-and-close",
              "obj": 0
            }
          ],
          "stem": "A partner must find three specified clips in under a minute. The laptop may be unavailable tomorrow. Describe your partner test and how you would verify a separate recoverable copy.",
          "lines": 5
        }
      ]
    }
  ]
};
})();
