window.TEXTBOOK_PROJECT = {
  "part": "getting-started",
  "title": "Set up and hand off",
  "time": "One class period",
  "brief": "<p>Prepare the library shoot for a second editor. The practice USB contains three camera takes, one editable project and one exported review video. Use the simulator below or a teacher-provided drive with equivalent files.</p><p>The shoot date is November 21, 2026. Use TheNote_Shot_Take_Date for camera copies. When your folder is ready, ask a partner to find shot 05 take 02, the editable project and the review video in under one minute.</p>",
  "requirementsTitle": "Your handoff must include",
  "requirements": [
    "Build The Note with one [[subfolder]] each for Source, Project and Exports.",
    "[[Copy]] the five USB files into the correct working folders and keep all five USB originals.",
    "Use the class [[naming convention]] for all three working camera takes. Keep each extension.",
    "[[Open]] each camera file from the destination and record its [[file path]].",
    "Give the partner a project path and three search targets. Time the independent search.",
    "Copy the whole project to the separate school drive. Open the exported video there and log the backup path."
  ],
  "taskSheet": {
    "title": "File and handoff record",
    "columns": [
      "#",
      "Target or check",
      "File path / result",
      "Time or initials"
    ],
    "rows": 8
  },
  "storyboardFrames": 0,
  "checklist": [
    "Three sibling folders appear inside The Note.",
    "Source contains three correctly named camera takes.",
    "Project contains the editable file.",
    "Exports contains the review video.",
    "Five original files remain on USB.",
    "All three working takes open from the destination.",
    "A partner found three targets and recorded the elapsed time.",
    "The school-drive backup contains the whole project and the export opens."
  ],
  "rubricLevels": [
    "4 · Independent",
    "3 · Usable",
    "2 · Revise",
    "1 · Incomplete"
  ],
  "rubric": [
    {
      "criterion": "Folder structure",
      "levels": [
        "Three correctly populated sibling folders.",
        "Three folders with one misfiled item.",
        "One needed folder missing or nested incorrectly.",
        "Files have no usable project structure."
      ]
    },
    {
      "criterion": "Naming",
      "levels": [
        "All three camera names have correct shot, take, date and extension.",
        "One field needs correction on one file.",
        "Fields vary and take identity is unclear.",
        "Files cannot be identified from their labels."
      ]
    },
    {
      "criterion": "Copy safety",
      "levels": [
        "All originals remain and three destination files open.",
        "All originals remain and one destination was tested.",
        "Transfer completed without a destination check.",
        "Originals or working files are missing."
      ]
    },
    {
      "criterion": "Findability",
      "levels": [
        "Partner opens all three targets in under a minute unaided.",
        "Partner finds all three with extra time.",
        "Partner needs hints or finds only two.",
        "Partner cannot identify the project or delivery."
      ]
    },
    {
      "criterion": "Backup",
      "levels": [
        "Complete second-location copy and verified export with written path.",
        "Complete second copy and path, playback unverified.",
        "Second location lacks a required file.",
        "Only one working location exists."
      ]
    }
  ],
  "reflection": [
    "Which field or folder saved your partner the most time? Cite the timed result.",
    "If the class computer failed tomorrow, give the restore path and the first check you would run."
  ],
  "desktop": {
    "type": "desktop-sim",
    "fs": {
      "drives": [
        {
          "id": "pc",
          "label": "This PC",
          "children": []
        },
        {
          "id": "usb",
          "label": "USB Drive",
          "children": [
            {
              "name": "S04_T01.mp4",
              "media": "room-wide"
            },
            {
              "name": "S05_T02.mp4",
              "media": "sit-medium"
            },
            {
              "name": "S06_T01.mp4",
              "media": "book-close"
            },
            {
              "name": "TheNote_edit.prproj"
            },
            {
              "name": "TheNote_review.mp4"
            }
          ]
        },
        {
          "id": "net",
          "label": "School drive",
          "children": []
        }
      ]
    },
    "start": "pc",
    "tasks": [
      {
        "text": "Create The Note on This PC with sibling folders Source, Project and Exports.",
        "check": s => ["Source","Project","Exports"].every(n=>s.locate("This PC > The Note > "+n)?.folder),
        "sticky": true
      },
      {
        "text": "Copy the five USB items and file the working copies by their jobs. Rename the three source copies using the class rule.",
        "check": s => ["Source > TheNote_S04_T01_2026-11-21.mp4", "Source > TheNote_S05_T02_2026-11-21.mp4", "Source > TheNote_S06_T01_2026-11-21.mp4", "Project > TheNote_edit.prproj", "Exports > TheNote_review.mp4"].every(p=>s.locate("This PC > The Note > "+p)) && ["S04_T01.mp4", "S05_T02.mp4", "S06_T01.mp4", "TheNote_edit.prproj", "TheNote_review.mp4"].every(p=>s.locate("USB Drive > "+p)),
        "sticky": true
      },
      {
        "text": "Open all three renamed camera files from the working Source folder.",
        "check": s => ["TheNote_S04_T01_2026-11-21.mp4", "TheNote_S05_T02_2026-11-21.mp4", "TheNote_S06_T01_2026-11-21.mp4"].every(n=>s.previewed.includes("This PC > The Note > Source > "+n)),
        "sticky": true
      },
      {
        "text": "Copy the complete The Note folder to School drive. Open the export from this backup.",
        "check": s => ["Source > TheNote_S04_T01_2026-11-21.mp4", "Source > TheNote_S05_T02_2026-11-21.mp4", "Source > TheNote_S06_T01_2026-11-21.mp4", "Project > TheNote_edit.prproj", "Exports > TheNote_review.mp4"].every(p=>s.locate("School drive > The Note > "+p)) && s.previewed.includes("School drive > The Note > Exports > TheNote_review.mp4"),
        "sticky": true
      }
    ]
  }
};

if (typeof document !== 'undefined') document.addEventListener('textbook-ready', () => {
  const exercise = document.createElement('section');
  exercise.className = 'project-editor no-print';
  exercise.id = 'project-files';
  const heading = document.createElement('h2');
  heading.textContent = 'Prepare the five-file handoff';
  exercise.append(heading, Textbook.desktopSim(window.TEXTBOOK_PROJECT.desktop));
  document.getElementById('app').append(exercise);
  const link = document.createElement('a');
  link.className = 'button small';
  link.href = '#project-files';
  link.textContent = 'Open the practice drives';
  document.querySelector('.test-tools').append(link);
});
