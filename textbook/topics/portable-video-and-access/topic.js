(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "portable-video-and-access",
  "minutes": 12,
  "bigIdea": "Lighter cameras let more people tell their own stories.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" fill=\"#f3f1ec\"/><rect x=\"17\" y=\"68\" width=\"60\" height=\"34\" rx=\"3\" fill=\"#3157c8\"/><circle cx=\"32\" cy=\"55\" r=\"17\" fill=\"#777\"/><circle cx=\"64\" cy=\"55\" r=\"17\" fill=\"#777\"/><path d=\"M75 79l20-10v30l-20-10z\" fill=\"#171b1f\"/><path d=\"M47 100l-18 29m18-29 15 29\" stroke=\"#171b1f\" stroke-width=\"4\"/><rect x=\"125\" y=\"70\" width=\"61\" height=\"32\" rx=\"5\" fill=\"#3157c8\"/><path d=\"M138 69v-8h25\" stroke=\"#171b1f\" stroke-width=\"4\" fill=\"none\"/><path d=\"M186 79l12-8v26l-12-7z\" fill=\"#171b1f\"/><rect x=\"238\" y=\"37\" width=\"41\" height=\"83\" rx=\"7\" fill=\"#171b1f\"/><rect x=\"243\" y=\"44\" width=\"31\" height=\"62\" fill=\"#c9d7ee\"/><text x=\"11\" y=\"152\" font-size=\"11\" font-weight=\"650\" fill=\"#171b1f\">Film camera</text><text x=\"121\" y=\"152\" font-size=\"11\" font-weight=\"650\" fill=\"#171b1f\">Camcorder</text><text x=\"240\" y=\"152\" font-size=\"11\" font-weight=\"650\" fill=\"#171b1f\">Phone</text></svg>",
    "alt": "Film camera on a tripod, handheld camcorder and pocket phone.",
    "question": "Which pictured tool is easiest to keep in a pocket all day?",
    "options": [
      "The phone",
      "The film camera shown on its tripod"
    ],
    "answer": 0,
    "reveal": "The small camera can already be at the event. [[Portable video]] brought recording outside the studio, and a phone can also send footage."
  },
  "notes": {
    "sketch": "Draw two places an eyewitness and news crew might stand.",
    "frames": 2,
    "frameLabels": [
      "Witness",
      "Crew"
    ],
    "think": "What could one viewpoint leave out?"
  },
  "vocab": [
    "camcorder",
    "portable-video",
    "citizen-journalism"
  ],
  "review": [],
  "objectives": [
    "Identify how portable video changed who could record an event.",
    "Distinguish eyewitness footage from a verified account of what happened."
  ],
  "sections": [
    {
      "title": "From a crew to a carry bag",
      "intro": "Lighter recording equipment changed where cameras could go.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Film cameras exposed film that needed processing. In the 1960s, portable videotape systems let small crews record away from a studio. Early systems could use a separate recorder.</p><p>In 1983 Sony sold Betamovie, a [[camcorder]] that combined the camera and recorder. In 2000 Sharp sold a phone that could send still photos. Later phones could also record and send [[portable video]].</p>"
        },
        {
          "type": "figure",
          "body": "hcx1600", "view": "hero", "alt": "Class HC-X1600 camcorder with built-in lens and recorder.",
          "caption": "This is the class HC-X1600, a modern camcorder. One operator can carry both the camera and recorder in one unit."
        }
      ]
    },
    {
      "title": "Who has the camera?",
      "intro": "Local access can reveal a viewpoint the visiting crew missed.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>[[Citizen journalism]] includes reporting by people who witness events in their community. A student on a bus may record a road closure before a newsroom can get there.</p><p>A recording shows one angle over one period of time. Find the original source, place and time before using it to explain an event.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Same event  •  two positions", [["Witness on bus", "Camera present", "Records closure starting"], ["News crew later", "Arrives after closure", "Checks cause with officials"]]),
          "alt": "Witness sees the start. A later crew can interview people and confirm facts.",
          "caption": "Different vantage points answer different questions."
        },
        {
          "type": "callout",
          "kind": "consider",
          "html": "A close shot may show one person shouting. What would a wider view or an earlier recording add?"
        }
      ]
    },
    {
      "title": "Name the change in access",
      "intro": "Use the example to separate capture from verification.",
      "blocks": [
        {
          "type": "quick-check",
          "q": "An eyewitness records rising water from a safe window before the news crew arrives. Which change made that view possible?",
          "options": [
            "A camera was already with the witness.",
            {
              "text": "The phone verified the cause of the flooding.",
              "clue": "Think about access versus verification."
            }
          ],
          "answer": 0,
          "explain": "Portability let someone record that place and moment."
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which feature makes the pictured device a camcorder?",
      "options": [
        "It captures and records video in one body.",
        {
          "text": "It sends the picture to a separate film recorder.",
          "clue": "Look for a camera with its recorder built into the same body."
        }
      ],
      "answer": 0,
      "explain": "A camcorder captures and records video in one portable unit.",
      "media": "cam-hcx1600-hero",
      "alt": "A class HC-X1600 with its lens, grip and recording controls."
    },
    {
      "q": "A resident records a flooded street as news for neighbors. What practice does this illustrate?",
      "options": [
        {
          "text": "A studio-only broadcast",
          "clue": "Who is reporting and where are they?"
        },
        "Citizen journalism"
      ],
      "answer": 1,
      "explain": "A community member documents an event directly."
    },
    {
      "q": "A short eyewitness clip appears online without a date. Before explaining the event, what should an editor do?",
      "options": [
        {
          "text": "Assume the upload date is the event date",
          "clue": "A repost can be newer than the images."
        },
        "Confirm source, time and place"
      ],
      "answer": 1,
      "explain": "Context must be checked before the clip supports a claim."
    }
  ],
  "remember": [
    "[[Portable video]] let smaller crews record outside studios.",
    "A [[camcorder]] combines a video camera and recorder in one device.",
    "[[Citizen journalism]] adds eyewitness views that still need context."
  ],
  "realCameraTitle": "Look for it",
  "realCamera": "Find an eyewitness recording in a news report. Identify the credited source and a fact the report checked separately."
});
})();
