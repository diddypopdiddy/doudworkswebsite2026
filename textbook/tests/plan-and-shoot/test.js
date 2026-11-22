(function () {
  const D = window.Textbook.draw;
  window.TEXTBOOK_TEST = {
  "part": "plan-and-shoot",
  "minutes": 45,
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
          "topic": "storyboard-and-shot-list",
          "obj": 0,
          "targets": [
            {
              "topic": "storyboard-and-shot-list",
              "obj": 0
            },
            {
              "topic": "schedule-rehearse-and-prepare",
              "obj": 0
            },
            {
              "topic": "plan-sound-and-music",
              "obj": 0
            },
            {
              "topic": "schedule-rehearse-and-prepare",
              "obj": 1
            },
            {
              "topic": "alice-guy-blach-and-production-work",
              "obj": 1
            },
            {
              "topic": "continuity-notes-pickups-and-handoff",
              "obj": 1
            },
            {
              "topic": "record-coverage-and-takes",
              "obj": 0
            },
            {
              "topic": "continuity-notes-pickups-and-handoff",
              "obj": 0
            }
          ],
          "stem": "Write the letter for each definition. Some choices will remain unused.",
          "terms": [
            "panel",
            "call sheet",
            "sound plan",
            "blocking",
            "producer",
            "pickup shot",
            "safety take",
            "continuity log",
            "director",
            "camcorder"
          ],
          "defs": [
            "One drawing that represents a planned frame.",
            "Daily directions for crew arrival, gear and location.",
            "Scene-by-scene record of voices, location sound, effects and music.",
            "Positions and movements agreed for the action.",
            "Person who organizes people and resources to make a production.",
            "A later recording that repairs a gap in the material.",
            "An extra usable attempt at the same setup.",
            "Set notes linking takes to matching details and problems."
          ]
        },
        {
          "id": "a1",
          "type": "mc",
          "level": 1,
          "topic": "roles-locations-props-and-equipment",
          "obj": 0,
          "stem": "Who should monitor the recorded signal while the camera operator checks the picture?",
          "options": [
            "Location scout",
            "Interview subject",
            "Sound recordist",
            "Editor after the shoot"
          ]
        },
        {
          "id": "a2",
          "type": "mc",
          "level": 1,
          "topic": "alice-guy-blach-and-production-work",
          "obj": 0,
          "stem": "Which production company did Alice Guy-Blaché help establish in the United States?",
          "options": [
            "Gaumont",
            "Pathé",
            "Edison Manufacturing Company",
            "Solax"
          ]
        },
        {
          "id": "a3",
          "type": "mc",
          "level": 1,
          "topic": "portable-video-and-access",
          "obj": 0,
          "stem": "What did a camcorder combine in one portable unit?",
          "options": [
            "Video camera and recorder",
            "Editing timeline and projector",
            "Printing press and camera negative",
            "Film camera and chemical lab"
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
          "topic": "storyboard-and-shot-list",
          "obj": 0,
          "stem": "Which shot-list row fits this panel?",
          "options": [
            "S01, wide outside, Reader enters",
            "S07, close on face, look up",
            "S09, low angle, clock holds",
            "S06, tight on hands, book opens"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><path d=\"M32 59 Q95 45 160 74 Q230 47 288 58 L281 132 Q210 121 160 147 Q92 121 40 134 Z\" stroke=\"#263a65\" stroke-width=\"5\" fill=\"#a7b7de\"/><path d=\"M160 74v73\" stroke=\"#3157c8\" stroke-width=\"4\"/><path d=\"M44 120Q72 105 95 116l14 8-27 7-32 3zM277 120q-31-18-50-7l-15 14 48 8z\" fill=\"#e9c6a5\" stroke=\"#695547\"/><text x=\"12\" y=\"24\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">S06   •   Book opens</text><text x=\"12\" y=\"168\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Storyboard panel   /   close-up</text></svg>",
          "alt": "Hands fill the frame as the book opens."
        },
        {
          "id": "b2",
          "type": "mc",
          "level": 2,
          "topic": "plan-sound-and-music",
          "obj": 0,
          "stem": "Which entry gives the editor a precise music cue?",
          "options": [
            "Start the cue as the note opens",
            "Leave time for some music",
            "Record complete silence throughout",
            "Collect three possible songs"
          ],
          "svg": D.editCards("Scene events", [["S08", "Paper unfolds", "“Look up” becomes readable", "Reader looks toward clock"]]),
          "alt": "A sequence of three action beats."
        },
        {
          "id": "b3",
          "type": "mc",
          "level": 2,
          "topic": "roles-locations-props-and-equipment",
          "obj": 1,
          "stem": "Which scout finding is most likely to change the microphone plan for a quiet library line?",
          "options": [
            "The room number is on the door",
            "Ventilation starts at the shoot time",
            "The wall clock has large numbers",
            "The book has a plain cover"
          ],
          "svg": D.editCards("Library scout", [["Before lunch", "Quiet room", "Door unlocked"], ["During lunch", "Ventilation running", "Access confirmed"]]),
          "alt": "Scout notes show a ventilation change during lunch."
        },
        {
          "id": "b4",
          "type": "mc",
          "level": 2,
          "topic": "schedule-rehearse-and-prepare",
          "obj": 0,
          "stem": "Where should the Reader report first and with which prop?",
          "options": [
            "Library, yellow note",
            "Library, backpack",
            "Hall, backpack",
            "Hall, clock"
          ],
          "svg": D.editCards("Crew call", [["10:00   Hall", "S02, S03", "Reader: backpack"], ["10:12   Library", "S04, S06", "Reader: note + book"]]),
          "alt": "Two call times, locations and prop lists."
        },
        {
          "id": "b5",
          "type": "mc",
          "level": 2,
          "topic": "check-picture-and-sound",
          "obj": 0,
          "stem": "Which check does the displayed evidence directly support?",
          "options": [
            "The voice has no noise",
            "Exposure is certainly clipped",
            "The slate number is incorrect",
            "Focus should be corrected"
          ],
          "svg": D.take({kind:"soft"}),
          "alt": "The recorded picture is soft."
        },
        {
          "id": "b6",
          "type": "mc",
          "level": 2,
          "topic": "record-coverage-and-takes",
          "obj": 0,
          "stem": "Which two labels identify repeats of the same setup?",
          "options": [
            "S04 T01 and S04 T02",
            "S04 T01 and S06 T01",
            "S08 T01 and S09 T01",
            "S02 T02 and S03 T02"
          ]
        },
        {
          "id": "b7",
          "type": "mc",
          "level": 2,
          "topic": "interview-setup",
          "obj": 0,
          "stem": "Camera A sees the subject looking mainly toward which side of the frame?",
          "options": [
            "Right",
            "Left",
            "Straight down the lens",
            "Straight above the lens"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><circle cx=\"158\" cy=\"47\" r=\"17\" fill=\"#e9c6a5\" stroke=\"#171b1f\"/><text x=\"181\" y=\"51\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Subject</text><path d=\"M159 65L119 131\" stroke=\"#b86533\" stroke-width=\"3\" stroke-dasharray=\"5 3\"/><circle cx=\"114\" cy=\"140\" r=\"12\" fill=\"#b86533\"/><text x=\"18\" y=\"146\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Interviewer</text><rect x=\"146\" y=\"126\" width=\"27\" height=\"22\" fill=\"#3157c8\"/><text x=\"141\" y=\"165\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Cam A</text><path d=\"M54 71l20-8 2 18z\" fill=\"#ddac52\"/><text x=\"15\" y=\"61\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Light</text><rect x=\"166\" y=\"74\" width=\"6\" height=\"16\" rx=\"2\" fill=\"#171b1f\"/><text x=\"179\" y=\"90\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">Mic</text></svg>",
          "alt": "The sight line runs from the subject to the interviewer on the left of camera A."
        },
        {
          "id": "b8",
          "type": "mc",
          "level": 2,
          "topic": "portable-video-and-access",
          "obj": 1,
          "stem": "Which statement about an eyewitness clip can you establish from the images alone?",
          "options": [
            "The complete cause of the event",
            "The identity of every person outside the frame",
            "The event visible inside this frame",
            "Whether the uploader shot it today"
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
          "topic": "storyboard-and-shot-list",
          "obj": 1,
          "stem": "Viewers see the Reader glance up with no reason. Which rearrangement gives that look a cause?",
          "options": [
            "Put the readable note insert before the glance",
            "Remove the moment the paper falls",
            "Repeat the hallway entrance twice",
            "Place the clock after the end credits"
          ],
          "svg": D.editCards("Current board", [["Panel 1", "A note falls."], ["Panel 2", "Reader looks up."], ["Panel 3", "“Look up.”"]]),
          "alt": "The message currently appears after the reaction."
        },
        {
          "id": "c2",
          "type": "mc",
          "level": 3,
          "topic": "plan-sound-and-music",
          "obj": 1,
          "stem": "The PSA line must stay clear as the phone goes face down. Which plan can the editor follow?",
          "options": [
            "Record music and narration together from across the room",
            "Record the exact voiceover and lower music under that line",
            "Write “music somehow” beside the shot",
            "Record only room tone for the spoken words"
          ]
        },
        {
          "id": "c3",
          "type": "mc",
          "level": 3,
          "topic": "roles-locations-props-and-equipment",
          "obj": 0,
          "stem": "The book action is ready but the boom enters the top edge. Which two roles should correct it together?",
          "options": [
            "Location scout and editor after wrap",
            "Producer and audience",
            "Camera operator and sound recordist",
            "Interview subject and extra"
          ],
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><circle cx=\"53\" cy=\"65\" r=\"15\" fill=\"#e9c6a5\"/><path d=\"M35 127V88h36v39\" fill=\"#3157c8\"/><path d=\"M59 94l32-12\" stroke=\"#3157c8\" stroke-width=\"8\"/><circle cx=\"145\" cy=\"72\" r=\"13\" fill=\"#e9c6a5\"/><rect x=\"130\" y=\"88\" width=\"30\" height=\"38\" fill=\"#3157c8\"/><rect x=\"158\" y=\"78\" width=\"28\" height=\"17\" fill=\"#263a65\"/><path d=\"M172 95l-12 39m12-39 11 39\" stroke=\"#263a65\" stroke-width=\"3\"/><circle cx=\"257\" cy=\"75\" r=\"13\" fill=\"#e9c6a5\"/><path d=\"M241 128V91h33v37\" fill=\"#b86533\"/><path d=\"M259 94l-7-42-59-11\" fill=\"none\" stroke=\"#263a65\" stroke-width=\"4\"/><rect x=\"181\" y=\"37\" width=\"19\" height=\"8\" rx=\"3\" fill=\"#263a65\"/><text x=\"14\" y=\"22\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Library shoot   /   crew diagram</text><text x=\"27\" y=\"155\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">Giving cues</text><text x=\"120\" y=\"155\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">At the tripod</text><text x=\"219\" y=\"155\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">Holding boom</text></svg>",
          "alt": "Crew diagram with a camera operator at the tripod and a recordist holding a boom."
        },
        {
          "id": "c4",
          "type": "mc",
          "level": 3,
          "topic": "schedule-rehearse-and-prepare",
          "obj": 1,
          "stem": "The hallway is available until 10:10. The library opens at 10:12. Which order fits the access windows and minimizes moves?",
          "options": [
            "Hall wide, library master, hall medium, book close",
            "Library master, hall wide, book close, hall medium",
            "Library close, hall medium, library master, hall wide",
            "Hall wide, hall medium, move, library master, book close"
          ]
        },
        {
          "id": "c5",
          "type": "mc",
          "level": 3,
          "topic": "check-picture-and-sound",
          "obj": 1,
          "stem": "The face looks sharp, but the test line has a buzz. What should the crew do first?",
          "options": [
            "Check the mic path, listen and replay a new test line",
            "Reduce camera exposure and roll",
            "Shoot extra silent picture until the buzz stops",
            "Wait for the editor to identify which mic was used"
          ]
        },
        {
          "id": "c6",
          "type": "mc",
          "level": 3,
          "topic": "record-coverage-and-takes",
          "obj": 1,
          "stem": "Which additional recording would best fill the gap in this report?",
          "options": [
            "Another identical wide master",
            "An overhead insert held long enough to read the words",
            "Room tone without picture",
            "An unrelated hallway tracking shot"
          ],
          "svg": D.editCards("Camera report", [["Available", "Master: reader opens book", "Medium: reader looks up"], ["Missing", "Cannot read the note", "No insert on card"]]),
          "alt": "Camera report identifies a missing readable note insert."
        },
        {
          "id": "c7",
          "type": "mc",
          "level": 3,
          "topic": "continuity-notes-pickups-and-handoff",
          "obj": 0,
          "stem": "Which handoff entry points the editor to the matching take and names the problem?",
          "options": [
            "S06 looks good.",
            "Use newest clip regardless of prop.",
            "S06 T02 matches full bottle in S04. T01 is nearly empty.",
            "Both are sharp so use either."
          ],
          "svg": D.editCards("S04 master: full bottle", [["S06  T01", "Bottle nearly empty", "Focus sharp"], ["S06  T02", "Bottle full", "Focus sharp"]]),
          "alt": "Both takes are sharp but only one bottle matches the master."
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
          "topic": "schedule-rehearse-and-prepare",
          "obj": 1,
          "targets": [
            {
              "topic": "schedule-rehearse-and-prepare",
              "obj": 1
            },
            {
              "topic": "storyboard-and-shot-list",
              "obj": 0
            },
            {
              "topic": "record-coverage-and-takes",
              "obj": 1
            },
            {
              "topic": "continuity-notes-pickups-and-handoff",
              "obj": 1
            }
          ],
          "stem": "Plan a two-location scene. A student leaves a hallway, opens a folded note at a table and looks at a clock. The hall closes after ten minutes. List four numbered shots with purposes, a shooting order, one matching detail and a pickup you would request if the words cannot be read.",
          "lines": 5
        },
        {
          "id": "d2",
          "type": "written",
          "level": 4,
          "topic": "interview-setup",
          "obj": 1,
          "targets": [
            {
              "topic": "interview-setup",
              "obj": 1
            },
            {
              "topic": "check-picture-and-sound",
              "obj": 0
            },
            {
              "topic": "roles-locations-props-and-equipment",
              "obj": 1
            },
            {
              "topic": "plan-sound-and-music",
              "obj": 1
            }
          ],
          "stem": "An interviewer and a subject share one small room. Plan a medium shot and a closer angle of the same answer. Describe seat and camera positions, headroom and looking room, a light or noise check, and how you will verify the recorded line.",
          "lines": 5
        }
      ]
    }
  ]
};
})();
