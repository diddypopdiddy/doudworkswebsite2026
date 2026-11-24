(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "interview-setup",
  "minutes": 15,
  "bigIdea": "Seat, light, mic and eyeline before you press record.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><circle cx=\"158\" cy=\"47\" r=\"17\" fill=\"#e9c6a5\" stroke=\"#171b1f\"/><text x=\"181\" y=\"51\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Subject</text><path d=\"M159 65L119 131\" stroke=\"#b86533\" stroke-width=\"3\" stroke-dasharray=\"5 3\"/><circle cx=\"114\" cy=\"140\" r=\"12\" fill=\"#b86533\"/><text x=\"18\" y=\"146\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Interviewer</text><rect x=\"146\" y=\"126\" width=\"27\" height=\"22\" fill=\"#3157c8\"/><text x=\"141\" y=\"165\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Cam A</text><path d=\"M54 71l20-8 2 18z\" fill=\"#ddac52\"/><text x=\"15\" y=\"61\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Light</text><rect x=\"166\" y=\"74\" width=\"6\" height=\"16\" rx=\"2\" fill=\"#171b1f\"/><text x=\"179\" y=\"90\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">Mic</text></svg>",
    "alt": "Interviewer is to the left of camera A with a dashed line from the subject.",
    "question": "From camera A, which way will the subject look?",
    "options": [
      "Toward screen left",
      "Toward screen right"
    ],
    "answer": 0,
    "reveal": "The [[interviewer]] sits to the left of the lens. The [[interview subject]] looks toward that seat, creating an [[off-camera eyeline]]."
  },
  "notes": {
    "sketch": "Draw the cameras, light, mic, subject and interviewer.",
    "frames": 2,
    "frameLabels": [
      "Set map",
      "Camera frame"
    ],
    "think": "What should stay consistent when the editor cuts to the closer angle?"
  },
  "vocab": [
    "interview-subject",
    "interviewer",
    "off-camera-eyeline",
    "two-camera-setup"
  ],
  "review": [
    "headroom",
    "looking-room"
  ],
  "objectives": [
    "Position the interviewer to produce an intended looking direction.",
    "Frame two interview angles with consistent eyes, headroom and looking room."
  ],
  "sections": [
    {
      "title": "Move the listening seat",
      "intro": "The person asking the questions gives the speaker a place to look.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Have the [[interview subject]] speak to the [[interviewer]] just beside the lens. Move the seat, then see what happens to the [[off-camera eyeline]]. Keep the mic close and outside the picture.</p>"
        },
        {
          "type": "interviewer-seat",
          "prompt": "Move the interviewer beside each camera. Preview the cut when the subjects look in opposite directions.",
          "interviews": [
            {
              "label": "Library interview",
              "media": "interview-a",
              "start": "right"
            },
            {
              "label": "Lounge interview",
              "media": "interview-b",
              "start": "right"
            }
          ],
          "tasks": [
            "Try the library interviewer on the left.",
            "Try the library interviewer on the right.",
            "Preview opposite looking directions."
          ]
        }
      ]
    },
    {
      "title": "Plan the second angle",
      "intro": "Keep both cameras on the same side of the conversation line.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[two-camera setup]] covers the same answer at two sizes. Camera A can hold a medium shot while camera B takes a closer angle. Both should see the subject looking the same screen direction.</p><p>Look from each lens before rolling. Keep the interviewer beside camera A. Make sure the light reaches the eyes and neither camera sees the microphone.</p>"
        },
        {
          "type": "figure",
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><circle cx=\"158\" cy=\"47\" r=\"17\" fill=\"#e9c6a5\" stroke=\"#171b1f\"/><text x=\"181\" y=\"51\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Subject</text><path d=\"M159 65L119 131\" stroke=\"#b86533\" stroke-width=\"3\" stroke-dasharray=\"5 3\"/><circle cx=\"114\" cy=\"140\" r=\"12\" fill=\"#b86533\"/><text x=\"18\" y=\"146\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Interviewer</text><rect x=\"146\" y=\"126\" width=\"27\" height=\"22\" fill=\"#3157c8\"/><text x=\"141\" y=\"165\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Cam A</text><path d=\"M54 71l20-8 2 18z\" fill=\"#ddac52\"/><text x=\"15\" y=\"61\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Light</text><rect x=\"166\" y=\"74\" width=\"6\" height=\"16\" rx=\"2\" fill=\"#171b1f\"/><text x=\"179\" y=\"90\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">Mic</text><rect x=\"201\" y=\"118\" width=\"27\" height=\"20\" transform=\"rotate(-18 211 127)\" fill=\"#3157c8\"/><text x=\"210\" y=\"151\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Cam B</text></svg>",
          "alt": "Two cameras on the same side of the subject–interviewer line with a key light and mic.",
          "caption": "The dashed line runs between the two people."
        },
        {
          "type": "figure",
          "media": "p7-interview-set",
          "caption": "The interviewer sits beside the tripods. The softbox lights the subject, and the lavalier sits near their voice."
        }
      ]
    },
    {
      "title": "Frame the interview",
      "intro": "Keep the viewer’s attention on the person answering.",
      "blocks": [
        {
          "type": "framing-challenge",
          "briefs": [
            {
              "media": "interview-a",
              "mirror": false,
              "start": "whole",
              "tag": "Eyes",
              "brief": "Viewers need the speaker’s expression. Frame chest-up with eyes on the upper third.",
              "judge": m => T.framingCheck(m, ["chest", "eyes"]),
              "hint": {
                "recipe": [
                  0.36,
                  0.64,
                  0.33
                ]
              },
              "success": "The frame holds the face at a conversational distance."
            },
            {
              "media": "interview-b",
              "mirror": false,
              "start": "whole",
              "tag": "Looking room",
              "brief": "Viewers need to follow this speaker’s gaze toward screen left. Leave looking room and comfortable headroom.",
              "judge": m => T.framingCheck(m, ["lead", "headroom"]),
              "hint": {
                "recipe": [
                  0.36,
                  0.64,
                  0.33
                ]
              },
              "success": "The space is in front of the face."
            },
            {
              "media": "interview-a",
              "mirror": true,
              "start": "whole",
              "tag": "Interview match",
              "brief": "This reverse angle must cut with the other answer. Frame chest-up, set eyes high and leave room in front.",
              "judge": m => T.framingCheck(m, ["chest", "eyes", "headroom", "lead"]),
              "hint": {
                "recipe": [
                  0.36,
                  0.64,
                  0.33
                ]
              },
              "success": "The size, eyes, headroom and looking room work together."
            }
          ],
          "minFrac": 0.2,
          "closing": "The seat sets the direction. Your frame gives the gaze room."
        }
      ]
    },
    {
      "id": "studio-practice",
      "title": "Set up the whole interview",
      "intro": "Light, camera and sound, in one studio.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Work through the departments in order: light the subject, frame the shot, place the microphone. Then roll a take.</p>"
        },
        {
          "type": "studio-room",
          "lesson": "interview-setup"
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which object sets the direction of the subject’s gaze in the plan?",
      "options": [
        "The interviewer’s seat",
        {
          "text": "The light",
          "clue": "Follow the dashed line between people."
        }
      ],
      "answer": 0,
      "explain": "The subject looks toward the person asking questions.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><circle cx=\"158\" cy=\"47\" r=\"17\" fill=\"#e9c6a5\" stroke=\"#171b1f\"/><text x=\"181\" y=\"51\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Subject</text><path d=\"M159 65L119 131\" stroke=\"#b86533\" stroke-width=\"3\" stroke-dasharray=\"5 3\"/><circle cx=\"114\" cy=\"140\" r=\"12\" fill=\"#b86533\"/><text x=\"18\" y=\"146\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Interviewer</text><rect x=\"146\" y=\"126\" width=\"27\" height=\"22\" fill=\"#3157c8\"/><text x=\"141\" y=\"165\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Cam A</text><path d=\"M54 71l20-8 2 18z\" fill=\"#ddac52\"/><text x=\"15\" y=\"61\" font-size=\"12\" font-weight=\"650\" fill=\"#171b1f\">Light</text><rect x=\"166\" y=\"74\" width=\"6\" height=\"16\" rx=\"2\" fill=\"#171b1f\"/><text x=\"179\" y=\"90\" font-size=\"10\" font-weight=\"650\" fill=\"#171b1f\">Mic</text></svg>",
      "alt": "The subject looks toward the person asking questions."
    },
    {
      "q": "A second camera records the same answer. Where should it stay for matching direction?",
      "options": [
        {
          "text": "Directly across the line",
          "clue": "Consider how the gaze appears to each lens."
        },
        "On the same side of the subject–interviewer line"
      ],
      "answer": 1,
      "explain": "Both cameras keep a consistent looking direction."
    },
    {
      "q": "A subject looks screen left. Where should extra space go?",
      "options": [
        {
          "text": "Behind the head on screen right",
          "clue": "Follow the gaze."
        },
        "In front of the face on screen left"
      ],
      "answer": 1,
      "explain": "Looking room gives the off-camera eyeline somewhere to go."
    }
  ],
  "remember": [
    "Place the [[interviewer]] beside the camera for a natural [[off-camera eyeline]].",
    "Frame the [[interview subject]] with space in the direction of the gaze.",
    "Keep both angles in a [[two-camera setup]] on the same side of the line."
  ],
  "realCamera": "Set up a one-minute interview. Choose the listening seat, check the mic and light, and frame the eyes before recording."
});
})();
