/* Student test. Answer keys are stored separately. */
window.TEXTBOOK_TEST = {
  "part": "start-a-project",
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
          "topic": "audience-purpose-and-project-type",
          "obj": 0,
          "targets": [
            {
              "topic": "audience-purpose-and-project-type",
              "obj": 0
            },
            {
              "topic": "audience-purpose-and-project-type",
              "obj": 0
            },
            {
              "topic": "concept-treatment-and-script",
              "obj": 0
            },
            {
              "topic": "concept-treatment-and-script",
              "obj": 0
            },
            {
              "topic": "examples-and-requirements",
              "obj": 1
            }
          ],
          "terms": [
            "audience",
            "purpose",
            "message",
            "logline",
            "treatment",
            "role",
            "rubric"
          ],
          "defs": [
            "The people the video is made for.",
            "What you want the video to do.",
            "One-sentence version of the main idea or action.",
            "A short paragraph describing how the main events unfold.",
            "A guide that defines what the finished work is judged on."
          ],
          "stem": "Write the letter of each matching term. Two terms are unused."
        },
        {
          "id": "a2",
          "type": "mc",
          "level": 1,
          "topic": "examples-and-requirements",
          "obj": 1,
          "stem": "An assignment says to turn in one captioned MP4. What does “one captioned MP4” name?",
          "options": [
            "The audience",
            "The treatment",
            "The deliverable",
            "The camera plan"
          ]
        },
        {
          "id": "a3",
          "type": "mc",
          "level": 1,
          "topic": "teamwork-and-individual-understanding",
          "obj": 0,
          "stem": "Which crew member primarily listens for recording problems before the crew moves on?",
          "options": [
            "Person appearing on camera",
            "Sound recordist",
            "Storyboard artist",
            "Picture editor"
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
          "topic": "audience-purpose-and-project-type",
          "obj": 0,
          "stem": "Who is most likely to need this opening?",
          "options": [
            "Families with questions about the lunch policy",
            "A crew about to record a music video",
            "Students looking for cafeteria menus",
            "Editors delivering the school play"
          ],
          "alt": "Opener reads How our school handles phones at lunch. An update for families.",
          "svg": Textbook.draw.editCards("Opening card", [["Family update","How our school","handles phones."]])
        },
        {
          "id": "b2",
          "type": "mc",
          "level": 2,
          "topic": "audience-purpose-and-project-type",
          "obj": 1,
          "stem": "What is the main purpose of this opening?",
          "options": [
            "Document a past phone purchase",
            "Teach the technical parts of a phone",
            "Tell the history of the cafeteria",
            "Persuade students to try one action"
          ],
          "alt": "Try five minutes with your phone face down.",
          "svg": Textbook.draw.editCards("Opening card", [["Lunch challenge","Try five minutes","with phones down."]])
        },
        {
          "id": "b3",
          "type": "mc",
          "level": 2,
          "topic": "examples-and-requirements",
          "obj": 0,
          "stem": "Which visible evidence helps the viewer know why the phones should go down?",
          "options": [
            "A lists the crew first.",
            "B shows one friend waiting for an answer.",
            "A gives the title of the project.",
            "B is filmed at a table."
          ],
          "alt": "A has four names. B shows a student waiting for a reply from a friend on a phone.",
          "svg": Textbook.draw.editCards("Two openings", [["A","Four crew names"],["B","A friend waits","for an answer."]])
        },
        {
          "id": "b4",
          "type": "mc",
          "level": 2,
          "topic": "examples-and-requirements",
          "obj": 1,
          "stem": "Which draft meets the run time shown here?",
          "options": [
            "30 seconds",
            "70 seconds",
            "45 seconds",
            "Two minutes"
          ],
          "alt": "One MP4, 40 to 50 seconds. Readable captions required.",
          "svg": Textbook.draw.editCards("Brief", [["Turn in","One MP4","40–50 seconds","Captions required"]])
        },
        {
          "id": "b5",
          "type": "mc",
          "level": 2,
          "topic": "concept-treatment-and-script",
          "obj": 0,
          "stem": "Which stage comes after the one-sentence logline and before the script?",
          "options": [
            "Final cut",
            "Release form",
            "Export",
            "Treatment"
          ]
        },
        {
          "id": "b6",
          "type": "mc",
          "level": 2,
          "topic": "concept-treatment-and-script",
          "obj": 1,
          "stem": "The picture column is filled in. What is missing from the blank sound column?",
          "options": [
            "What the viewer hears during the shot",
            "The file extension",
            "The light position",
            "A new project type"
          ],
          "alt": "Picture: close-up of a phone turning over. Sound: blank.",
          "svg": Textbook.draw.editCards("Script row", [["Picture","Close: turn phone","face down."],["Sound","(blank)"]])
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
          "topic": "audience-purpose-and-project-type",
          "obj": 1,
          "stem": "Your viewer is a new student who needs directions to the cafeteria. Which project serves that purpose?",
          "options": [
            "A slideshow of crew credits",
            "A short video with a joke about an unrelated class",
            "A brief tour that shows where to enter and collect food",
            "A phone PSA with no directions"
          ]
        },
        {
          "id": "c2",
          "type": "mc",
          "level": 3,
          "topic": "examples-and-requirements",
          "obj": 1,
          "stem": "The 45-second edit meets the brief, but the required captions are missing. What would you do before handing it in?",
          "options": [
            "Submit without captions.",
            "Add and check the captions in the exported MP4.",
            "Make the same cut 60 seconds long.",
            "Hand in only the logline."
          ]
        },
        {
          "id": "c3",
          "type": "mc",
          "level": 3,
          "topic": "concept-treatment-and-script",
          "obj": 1,
          "stem": "The sound says “cafeteria chatter.” The picture says “make it interesting.” What should the crew add?",
          "options": [
            "A specific visible action, such as a close shot of a phone turning over",
            "A different type of music with no shot",
            "A second sound cue repeating cafeteria chatter",
            "The camera operator’s home address"
          ]
        },
        {
          "id": "c4",
          "type": "mc",
          "level": 3,
          "topic": "teamwork-and-individual-understanding",
          "obj": 1,
          "stem": "The student with the only copy of the plan is absent. What would prevent the same problem tomorrow?",
          "options": [
            "Keep separate plans with different directions.",
            "Let each person invent the next shot on set.",
            "Delay all calls until the student returns.",
            "Keep one checked script in the shared folder and assign someone to update it."
          ]
        },
        {
          "id": "c5",
          "type": "mc",
          "level": 3,
          "topic": "teamwork-and-individual-understanding",
          "obj": 1,
          "stem": "Two crew members disagree about what to film for the closing. How should they settle it?",
          "options": [
            "Flip a coin without looking at the assignment.",
            "Read the shared purpose, agree on one action, and record the change.",
            "Use both endings without checking run time.",
            "Change the soundtrack and skip the closing."
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
          "topic": "concept-treatment-and-script",
          "obj": 0,
          "stem": "Write a logline and a three-sentence treatment for a PSA encouraging younger students to leave a shared space tidy. Explain why your idea fits your audience.",
          "lines": 6,
          "targets": [
            {
              "topic": "audience-purpose-and-project-type",
              "obj": 1
            }
          ]
        },
        {
          "id": "d2",
          "type": "written",
          "level": 4,
          "topic": "teamwork-and-individual-understanding",
          "obj": 1,
          "stem": "Your crew has ten minutes to film the final shot in two takes. Write the picture and sound columns for the shot. Assign and explain one named crew check before recording.",
          "lines": 6,
          "targets": [
            {
              "topic": "concept-treatment-and-script",
              "obj": 1
            },
            {
              "topic": "teamwork-and-individual-understanding",
              "obj": 0
            }
          ]
        }
      ]
    }
  ]
};
