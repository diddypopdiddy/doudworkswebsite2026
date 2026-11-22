/* Student test. Answer keys are stored separately. */
window.TEXTBOOK_TEST = {
  "part": "finish-and-share",
  "minutes": 45,
  "printNote": "Prints on US Letter. Black and white is fine.",
  "instructions": "For matching, write one letter per blank. For multiple choice, fill in the circle next to the one best answer. Show your reasoning in the last section.",
  "sections": [
    {
      "title": "Section A · Words and facts",
      "note": "Level 1",
      "items": [
        {
          "id": "a-match",
          "type": "match",
          "level": 1,
          "topic": "assemble-refine-and-finish",
          "obj": 0,
          "targets": [
            {
              "topic": "assemble-refine-and-finish",
              "obj": 0
            },
            {
              "topic": "feedback-revision-and-final-checks",
              "obj": 0
            },
            {
              "topic": "rights-privacy-and-representation",
              "obj": 0
            },
            {
              "topic": "export-and-watch-back",
              "obj": 0
            },
            {
              "topic": "backup-and-handoff",
              "obj": 0
            }
          ],
          "terms": [
            "picture lock",
            "feedback",
            "release form",
            "bitrate",
            "backup",
            "revision",
            "portfolio"
          ],
          "defs": [
            "Approved picture timing ready for sound and graphics to finish.",
            "Information that helps improve a draft.",
            "Written permission for a stated use of someone’s image or voice.",
            "How much data a file uses each second.",
            "A separate copy you can recover."
          ],
          "stem": "Write the letter of each matching term. Two terms are unused."
        },
        {
          "id": "a2",
          "type": "mc",
          "level": 1,
          "topic": "accessibility-and-audience-access",
          "obj": 0,
          "stem": "Which feature tells a viewer about a meaningful action that can only be seen?",
          "options": [
            "A private export folder",
            "A higher frame rate",
            "Audio description",
            "Picture lock"
          ]
        },
        {
          "id": "a3",
          "type": "mc",
          "level": 1,
          "topic": "reflect-and-archive",
          "obj": 0,
          "stem": "What belongs in the full archive of a project you will edit again?",
          "options": [
            "Only an exported still",
            "The project file and linked source media",
            "Only the final video in a message",
            "Only a sheet of camera settings"
          ]
        }
      ]
    },
    {
      "title": "Section B · Recognize it",
      "note": "Level 2",
      "items": [
        {
          "id": "b1",
          "type": "mc",
          "level": 2,
          "topic": "assemble-refine-and-finish",
          "obj": 0,
          "stem": "Which stage best fits this version?",
          "options": [
            "Rough cut",
            "Final cut",
            "Picture lock",
            "Published version"
          ],
          "alt": "Story is in order. Waiting time remains. Captions and sound are pending.",
          "svg": Textbook.draw.editCards("Edit status", [["Story order done","Waiting time","Sound pending"]])
        },
        {
          "id": "b2",
          "type": "mc",
          "level": 2,
          "topic": "feedback-revision-and-final-checks",
          "obj": 0,
          "stem": "Which note gives the editor a change to check?",
          "options": [
            "A praises the work but gives no location.",
            "Both give the exact edit.",
            "Neither describes anything in the video.",
            "B names the time and sound problem."
          ],
          "alt": "A: Looks nice. B: At 0:18, music covers the words.",
          "svg": Textbook.draw.editCards("Editor notes", [["A","“Looks nice”"],["B","“0:18: Music covers","the words.”"]])
        },
        {
          "id": "b3",
          "type": "mc",
          "level": 2,
          "topic": "rights-privacy-and-representation",
          "obj": 1,
          "stem": "The class wants to post publicly. What does this release cover?",
          "options": [
            "Public posting anywhere",
            "The classroom screening only",
            "Only the music",
            "Neither public nor classroom viewing"
          ],
          "alt": "Approved use is one in-class screening. Public sharing field is blank.",
          "svg": Textbook.draw.editCards("Release record", [["Approved","Classroom screening"],["Other destinations","(blank)"]])
        },
        {
          "id": "b4",
          "type": "mc",
          "level": 2,
          "topic": "accessibility-and-audience-access",
          "obj": 0,
          "stem": "Why does the caption include the bracketed text in this cut?",
          "options": [
            "Every frame needs a sentence in brackets.",
            "It tells the editor the file type.",
            "The slam explains why the person turns.",
            "It replaces the right to use music."
          ],
          "alt": "A person turns toward the door; caption says Door slams.",
          "svg": Textbook.draw.editCards("Caption review", [["Picture","Person turns"],["Caption","[Door slams]"]])
        },
        {
          "id": "b5",
          "type": "mc",
          "level": 2,
          "topic": "export-and-watch-back",
          "obj": 0,
          "stem": "Which file could fit a 150 MB upload limit and accepts H.264 MP4?",
          "options": [
            "A: 4 GB master",
            "Either A or B",
            "Neither, because video cannot fit",
            "B: 95 MB H.264 MP4"
          ],
          "alt": "A: 4 GB master. B: 95 MB H.264 MP4.",
          "svg": Textbook.draw.editCards("Delivery folder", [["A · Master","4 GB"],["B · Delivery","95 MB · MP4"]])
        },
        {
          "id": "b6",
          "type": "mc",
          "level": 2,
          "topic": "sharing-and-approvals",
          "obj": 0,
          "stem": "The approval says public review is pending. Which audience is approved now?",
          "options": [
            "The classroom only",
            "Anyone on the web",
            "Anyone with a forwarded link",
            "Anyone watching a public live stream"
          ],
          "alt": "Classroom approved. Public review is pending.",
          "svg": Textbook.draw.editCards("Approval email", [["Approved","In-class"],["Pending","Public review"]])
        }
      ]
    },
    {
      "title": "Section C · Apply it",
      "note": "Level 3",
      "items": [
        {
          "id": "c1",
          "type": "mc",
          "level": 3,
          "topic": "backup-and-handoff",
          "obj": 0,
          "stem": "Which plan meets 3-2-1 for complete project copies?",
          "options": [
            "Three folders on the same laptop",
            "Project on one computer plus two shortcuts",
            "Laptop, external drive and verified off-site school backup",
            "Three drives in the same locked room"
          ]
        },
        {
          "id": "c2",
          "type": "mc",
          "level": 3,
          "topic": "export-and-watch-back",
          "obj": 1,
          "stem": "The timeline plays normally. The export is missing the last spoken answer. What now?",
          "options": [
            "Share it because the timeline is correct.",
            "Fix the export range and watch the new file through.",
            "Change only the filename.",
            "Mark picture lock without testing again."
          ]
        },
        {
          "id": "c3",
          "type": "mc",
          "level": 3,
          "topic": "sharing-and-approvals",
          "obj": 1,
          "stem": "The teacher approves only student accounts in your class. Which setting best fits?",
          "options": [
            "Restrict access to the invited class accounts.",
            "Let anyone with the link view.",
            "Make it public on the site.",
            "Approve all school accounts automatically."
          ]
        },
        {
          "id": "c4",
          "type": "mc",
          "level": 3,
          "topic": "accessibility-and-audience-access",
          "obj": 1,
          "stem": "With the sound off, an important caption vanishes over a window. What should you do?",
          "options": [
            "Use white text with no backing.",
            "Remove all captions for the shot.",
            "Turn up the music instead.",
            "Add a dark caption backing and watch the whole cut muted again."
          ]
        },
        {
          "id": "c5",
          "type": "mc",
          "level": 3,
          "topic": "reflect-and-archive",
          "obj": 1,
          "stem": "Which reflection gives you something to build on?",
          "options": [
            "It was nice, and I want it to be nicer.",
            "I cut four waiting seconds so the answer starts at 0:03. Next time I’ll plan a closer opening.",
            "The file extension is MP4, and I used a laptop.",
            "I finished and didn’t check the changes."
          ]
        }
      ]
    },
    {
      "title": "Section D · Explain",
      "note": "Level 4",
      "items": [
        {
          "id": "d1",
          "type": "written",
          "level": 4,
          "topic": "feedback-revision-and-final-checks",
          "obj": 1,
          "stem": "The Profile is due tomorrow. A classmate says the second answer is hard to hear at 0:18 and the title fades before it is readable. Make a finishing plan with a revision, an accessibility check and a watch-back.",
          "lines": 6,
          "targets": [
            {
              "topic": "accessibility-and-audience-access",
              "obj": 1
            },
            {
              "topic": "export-and-watch-back",
              "obj": 1
            }
          ]
        },
        {
          "id": "d2",
          "type": "written",
          "level": 4,
          "topic": "backup-and-handoff",
          "obj": 1,
          "stem": "The class approved the Profile for invited accounts only. A teammate needs to make an alternate cut next month. Explain the audience setting and how you would back up, package and verify the work.",
          "lines": 6,
          "targets": [
            {
              "topic": "sharing-and-approvals",
              "obj": 1
            },
            {
              "topic": "reflect-and-archive",
              "obj": 0
            }
          ]
        }
      ]
    }
  ]
};
