(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "storage-locations",
  "minutes": 10,
  "bigIdea": "Know where your files live and who can reach them.",
  "hook": {
    "svg": D.editCards("Laptop missing after school", [["In laptop bag", "Laptop SSD", "Attached USB stick"], ["Elsewhere", "School server: saved", "Cloud: upload done"]]),
    "alt": "Laptop and USB are in the bag. Server and cloud have saved copies elsewhere.",
    "question": "The bag disappears. Which pair still has the saved files?",
    "options": [
      "School server and cloud",
      "Laptop and attached USB"
    ],
    "answer": 0,
    "reveal": "Both surviving copies were stored elsewhere. [[Local storage]] and an [[external drive]] can disappear together."
  },
  "notes": {
    "sketch": "Map where the current edit and its backup live.",
    "frames": 2,
    "frameLabels": [
      "Working copy",
      "Backup"
    ],
    "think": "What event could affect both copies?"
  },
  "vocab": [
    "local-storage",
    "external-drive",
    "cloud-storage",
    "file-sync"
  ],
  "review": [
    "copy"
  ],
  "objectives": [
    "Choose a storage location for access, speed and portability.",
    "Identify which copies survive a device loss or synced deletion."
  ],
  "sections": [
    {
      "title": "Find the physical copy",
      "intro": "A familiar icon can point to very different places.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>[[Local storage]] is inside the computer. An [[external drive]] travels with you. A school network drive lives on a server that your account can reach.</p><p>[[Cloud storage]] keeps files with an online service. A shortcut can point to an online file without downloading a usable copy.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Laptop missing after school", [["In laptop bag", "Laptop SSD", "Attached USB stick"], ["Elsewhere", "School server: saved", "Cloud: upload done"]]),
          "alt": "Storage locations inside and outside the missing bag.",
          "caption": "Where the data lives matters when equipment goes missing."
        }
      ]
    },
    {
      "title": "Follow a change",
      "intro": "A synchronized folder can send edits and deletions to other devices.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>[[File sync]] updates linked locations. A completed upload can survive losing the laptop. Deleting the file later may remove it from the synced folder everywhere.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Two kinds of protection", [["Today", "Synced folder: latest changes", "Separate backup: saved earlier copy"]]),
          "alt": "A synced folder updates while a separate copy retains an earlier version.",
          "caption": "Check upload status and keep a recoverable copy."
        },
        {
          "type": "callout",
          "kind": "consider",
          "html": "Can your partner open the link using their own account? Try the link together before handing in the video."
        }
      ]
    },
    {
      "title": "Choose a home for the file",
      "intro": "Each project has different access needs.",
      "blocks": [
        {
          "type": "quiz",
          "items": [
            {
              "q": "A 20 GB edit stutters when streamed over slow Wi-Fi. Where should the working copy go?",
              "options": [
                "On a local drive with enough free space",
                {
                  "text": "In an online-only folder",
                  "clue": "Playback needs prompt access to every clip."
                }
              ],
              "answer": 0,
              "explain": "A local working copy avoids streaming delays."
            },
            {
              "q": "A teacher needs to see a finished video at home. Which handoff works?",
              "options": [
                "A verified school-cloud link with viewing permission",
                {
                  "text": "A path to your internal drive",
                  "clue": "The teacher uses another computer."
                }
              ],
              "answer": 0,
              "explain": "A permitted account can reach the cloud copy."
            },
            {
              "q": "No internet is available at the second lab. What can carry the raw clips?",
              "options": [
                "A verified external drive",
                {
                  "text": "An online-only shortcut",
                  "clue": "The files must be present without a network."
                }
              ],
              "answer": 0,
              "explain": "An external drive carries the actual media."
            },
            {
              "q": "Two editors in the school lab have access to the same media share. Where can they find a common original?",
              "options": [
                "On the school network drive",
                {
                  "text": "In one editor’s Downloads folder",
                  "clue": "Which location accepts both accounts?"
                }
              ],
              "answer": 0,
              "explain": "A shared server can provide one known media location."
            },
            {
              "q": "You need to recover an accidentally deleted synced file. Which copy would help?",
              "options": [
                "A separately retained backup or recoverable version",
                {
                  "text": "An immediate mirror after deletion",
                  "clue": "Which version still contains the file?"
                }
              ],
              "answer": 0,
              "explain": "Sync can spread deletions. A retained copy can restore the file."
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "The student left the USB plugged into the missing laptop. Why did it offer little protection?",
      "options": [
        {
          "text": "USB always erases when unplugged",
          "clue": "Read where the USB was kept."
        },
        "Both devices traveled together"
      ],
      "answer": 1,
      "explain": "Both copies were in the missing bag.",
      "svg": D.editCards("Laptop missing after school", [["In laptop bag", "Laptop SSD", "Attached USB stick"], ["Elsewhere", "School server: saved", "Cloud: upload done"]]),
      "alt": "Both copies were in the missing bag."
    },
    {
      "q": "A cloud icon says Waiting to upload. Is the latest edit already protected online?",
      "options": [
        "It still needs an upload check",
        {
          "text": "Every change is online immediately",
          "clue": "Look at the transfer status."
        }
      ],
      "answer": 0,
      "explain": "Waiting means the newest version may still be local."
    },
    {
      "q": "A group can see the school drive but access to the folder is denied. What should the owner verify?",
      "options": [
        {
          "text": "The camera frame rate",
          "clue": "The drive is visible. The folder is restricted."
        },
        "Group permissions"
      ],
      "answer": 1,
      "explain": "A network location still enforces account permissions."
    }
  ],
  "remember": [
    "Use [[local storage]] for files you need on this computer.",
    "Keep an [[external drive]] away from the device it backs up.",
    "Check [[file sync]] completion and access before relying on [[cloud storage]]."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "List the actual locations of your last project. Check which files would be accessible from another computer."
});
})();
