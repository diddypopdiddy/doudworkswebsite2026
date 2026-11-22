(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "create-and-find-folders",
  "minutes": 12,
  "bigIdea": "Make a home for every project before you start.",
  "hook": {
    "svg": D.editCards("Two handoff folders", [["Folder A", "VID1.mp4", "edit.prproj", "final.mp4"], ["Folder B", "Source / VID1.mp4", "Project / edit.prproj", "Exports / final.mp4"]]),
    "alt": "The same files sit loose in A and in named folders in B.",
    "question": "Which folder tells the next editor where to put another camera clip?",
    "options": [
      "Folder B",
      "Folder A"
    ],
    "answer": 0,
    "reveal": "Source already has a home in B. Each [[subfolder]] groups files by their job."
  },
  "notes": {
    "sketch": "Draw the project tree and its three branches.",
    "frames": 1,
    "frameLabels": [
      "The Note tree"
    ],
    "think": "When would searching the entire drive help?"
  },
  "vocab": [
    "new-folder",
    "subfolder",
    "rename",
    "search"
  ],
  "review": [
    "file-path"
  ],
  "objectives": [
    "Create and rename three project subfolders at the same level.",
    "Search the correct parent folder for a named clip."
  ],
  "sections": [
    {
      "title": "Build three siblings",
      "intro": "Each folder belongs directly under the project name.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Make a [[new folder]] for each shoot. A date like TheNote_2026-11-21 keeps separate shoots apart. Inside it, create a [[subfolder]] for Source, Project and Exports.</p><p>Use [[rename]] on the default name. Run a [[search]] from a shared parent if you do not know which branch holds the clip.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Two handoff folders", [["Folder A", "VID1.mp4", "edit.prproj", "final.mp4"], ["Folder B", "Source / VID1.mp4", "Project / edit.prproj", "Exports / final.mp4"]]),
          "alt": "Two versions of a project folder.",
          "caption": "In Folder B the path describes each file’s job."
        }
      ]
    },
    {
      "title": "Create a trial folder",
      "intro": "Try a folder name and a search in a disposable copy.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Open The Note, make a folder named Trial, then rename it. Try searching for S04 from The Note, then from Documents.</p>"
        },
        {
          type: "desktop-sim",
          documents: [
            { name: "The Note", children: [{ name: "New folder", children: [] }] },
            { name: "Camera intake", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }] }
          ],
          open: "Documents",
          tasks: []
        }
      ]
    },
    {
      "title": "Try it yourself",
      "intro": "Open The Note. Rename New folder to Source.",
      "blocks": [
        {
          type: "desktop-sim",
          documents: [
            { name: "The Note", children: [{ name: "New folder", children: [] }] },
            { name: "Camera intake", children: [{ name: "S04_master.mp4", media: "p8-note-wide" }] }
          ],
          open: "Documents",
          tasks: [
            { text: "Open The Note. Rename **New folder** to Source. Select it and press **F2**, or right-click and choose Rename.", check: s => s.exists("Documents > The Note > Source") && !s.exists("Documents > The Note > New folder") },
            { text: "Make a folder named **Project** inside The Note. Use **New > Folder** in the command bar, or press Ctrl+Shift+N.", check: s => s.isFolder("Documents > The Note > Project") },
            { text: "Make **Exports** beside Project, also inside The Note.", check: s => s.isFolder("Documents > The Note > Exports") },
            { text: "Go back to Documents. Type S04 in the search box, then double-click S04_master.mp4 in the results.", check: s => s.searched("Documents > Camera intake > S04_master.mp4") && s.previewed("Documents > Camera intake > S04_master.mp4"), hint: "The search box is at the top right of the window. It searches the folder you are in and every folder inside it." }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Where would a second camera clip belong in Folder B?",
      "options": [
        {
          "text": "Inside Project with edit.prproj",
          "clue": "Follow the folder containing another camera original."
        },
        "Beside VID1.mp4 in Source"
      ],
      "answer": 1,
      "explain": "Source groups the original camera clips.",
      "svg": D.editCards("Two handoff folders", [["Folder A", "VID1.mp4", "edit.prproj", "final.mp4"], ["Folder B", "Source / VID1.mp4", "Project / edit.prproj", "Exports / final.mp4"]]),
      "alt": "Source groups the original camera clips."
    },
    {
      "q": "Your address ends in The Note > Project. Where will New folder put Exports?",
      "options": [
        "Inside Project",
        {
          "text": "Beside Project",
          "clue": "Creation happens at the current address."
        }
      ],
      "answer": 0,
      "explain": "Return to The Note first to make a sibling."
    },
    {
      "q": "A search inside Exports misses S04_master.mp4. What should you change?",
      "options": [
        "Search a common parent such as This PC",
        {
          "text": "Create an empty file with that name",
          "clue": "Consider the area the search examined."
        }
      ],
      "answer": 0,
      "explain": "A broader search includes other branches."
    }
  ],
  "remember": [
    "Create a [[new folder]] for the shoot before ingest.",
    "[[Rename]] each [[subfolder]] to describe its job.",
    "Start a [[search]] high enough to include the missing file."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Build a dated practice folder on your school drive. Create Source, Project and Exports inside it."
});
})();
