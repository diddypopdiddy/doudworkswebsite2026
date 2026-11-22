(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "roles-locations-props-and-equipment",
  "minutes": 12,
  "bigIdea": "Know who does what and what you need where.",
  "hook": {
    "media": "p7-set-roles",
    "alt": "Three crew jobs, including a person holding a boom.",
    "question": "Who should listen for noise while the page drops?",
    "options": [
      "The person with the boom",
      "The person giving the Reader a cue"
    ],
    "answer": 0,
    "reveal": "The boom carries the microphone. The [[sound recordist]] listens while the camera and performance teams run the take."
  },
  "notes": {
    "sketch": "Label who owns picture, performance and sound.",
    "frames": 1,
    "frameLabels": [
      "Set map"
    ],
    "think": "Which location problem would make you change your plan?"
  },
  "vocab": [
    "director",
    "camera-operator",
    "sound-recordist",
    "location-scout"
  ],
  "review": [],
  "objectives": [
    "Assign crew jobs from what the shot requires.",
    "Scout a location and pack gear and props for a specific action."
  ],
  "sections": [
    {
      "title": "Meet the crew",
      "intro": "Select a marker to find the responsibility behind the equipment.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>The [[director]] guides performance. The [[camera operator]] records the picture. The [[sound recordist]] manages the microphone and listens for problems.</p>"
        },
        {
          "type": "hotspots",
          "media": "p7-set-roles",
          "alt": "Crew members cue, operate a camera and hold a microphone.",
          "points": [
            {
              "x": 16,
              "y": 41,
              "label": "Director",
              "text": "The [[director]] cues the Reader and asks for the repeat."
            },
            {
              "x": 46,
              "y": 51,
              "label": "Camera operator",
              "text": "The [[camera operator]] frames, focuses and records each setup."
            },
            {
              "x": 89,
              "y": 42,
              "label": "Sound recordist",
              "text": "The [[sound recordist]] keeps the microphone clear of the frame and listens on headphones."
            }
          ]
        }
      ]
    },
    {
      "title": "Scout the library",
      "intro": "Check the room at the time you plan to use it.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[location scout]] checks access, permission, light, sound, power and space. Listen with the fan running. Look for an outlet and a safe cable route. Confirm when the room is available.</p><p>A prop belongs in the action. Equipment records or supports it. Use both columns when you pack for S06.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Library scout", [["Visit: 11:45", "Fans on at lunch", "Window faces table"], ["Before booking", "Confirm permission", "Test sound and light"]]),
          "alt": "Library scout form notes the fan, window and permission.",
          "caption": "A quiet room at 8 a.m. may sound different at lunch."
        }
      ]
    },
    {
      "title": "Build the kit",
      "intro": "Every item needs a reason in the planned shot.",
      "blocks": [
        {
          "type": "sorter",
          "prompt": "Film S06: the right hand opens a book, a folded note falls out and we hear the paper. Sort what this setup calls for.",
          "groups": [
            "Pack for S06",
            "Leave off this list"
          ],
          "items": [
            {
              "text": "Hardcover book and folded yellow note",
              "group": 0,
              "clue": "What causes the paper to fall?",
              "why": "They create the required action."
            },
            {
              "text": "Tripod and charged camera",
              "group": 0,
              "clue": "The close frame must stay steady.",
              "why": "They hold and record the view."
            },
            {
              "text": "Microphone and headphones",
              "group": 0,
              "clue": "How will you test the page sound?",
              "why": "Capture and monitor the paper."
            },
            {
              "text": "Handheld sports scoreboard",
              "group": 1,
              "clue": "Which planned action uses it?",
              "why": "The shot contains a hand, book and note."
            },
            {
              "text": "Spare matching folded note",
              "group": 0,
              "clue": "Will the paper look the same after several takes?",
              "why": "A matching spare resets the action."
            },
            {
              "text": "Second costume for a referee",
              "group": 1,
              "clue": "Count the people in this shot.",
              "why": "There is no referee in this scene."
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Who should correct a boom microphone that slips into frame?",
      "options": [
        {
          "text": "The director asks the Reader to ignore it",
          "clue": "Find who holds the boom and who sees the frame."
        },
        "The recordist adjusts it with the camera operator"
      ],
      "answer": 1,
      "explain": "Both picture and microphone positions matter.",
      "media": "p7-set-roles",
      "alt": "Both picture and microphone positions matter."
    },
    {
      "q": "Which scout detail can change during the day?",
      "options": [
        {
          "text": "The shot number S06",
          "clue": "Think about actual shooting time."
        },
        "Traffic and room noise"
      ],
      "answer": 1,
      "explain": "Activity near the room affects recorded sound."
    },
    {
      "q": "Your shot needs the note to fall three times. Which prop helps the repeats match?",
      "options": [
        "An identically folded spare note",
        {
          "text": "A different-colored note each time",
          "clue": "The editor may cut from one take to another."
        }
      ],
      "answer": 0,
      "explain": "A matching spare keeps the prop consistent."
    }
  ],
  "remember": [
    "The [[director]] guides the performance.",
    "The [[camera operator]] and [[sound recordist]] check different signals.",
    "A [[location scout]] tests the place at the planned shooting time."
  ],
  "realCamera": "Scout an available school location. Photograph the empty space and note permission, noise, light, power and room for the crew."
});
})();
