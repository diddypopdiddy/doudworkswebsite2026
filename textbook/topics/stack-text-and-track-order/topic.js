/* Lesson evidence, checks and guided-note prompts. */
Textbook.postTopic({
  "slug": "stack-text-and-track-order",
  "visual": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><text x=\"8\" y=\"39\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">V3 top</text><rect x=\"70\" y=\"15\" width=\"237\" height=\"41\" rx=\"4\" fill=\"#3157c8\" stroke=\"none\"/><text x=\"82\" y=\"41\" font-family=\"Arial,sans-serif\" font-size=\"15\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Opaque blue box</text><text x=\"8\" y=\"91\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">V2</text><rect x=\"70\" y=\"67\" width=\"237\" height=\"41\" rx=\"4\" fill=\"#6a4f7e\" stroke=\"none\"/><text x=\"82\" y=\"93\" font-family=\"Arial,sans-serif\" font-size=\"15\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Maya Chen</text><text x=\"8\" y=\"143\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">V1 bottom</text><rect x=\"70\" y=\"119\" width=\"237\" height=\"41\" rx=\"4\" fill=\"#467658\" stroke=\"none\"/><text x=\"82\" y=\"145\" font-family=\"Arial,sans-serif\" font-size=\"15\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">Interview shot</text></svg>",
    "alt": "V3 top: Opaque blue box. V2: Maya Chen. V1 bottom: Interview shot"
  },
  "hook": [
    "What hides the name where these layers overlap?",
    "The box on V3",
    "The interview on V1",
    "The opaque box sits above the letters. A higher [[track|track]] places its [[layer|layer]] in front."
  ],
  "questions": [
    [
      "Which order leaves the title readable over a box?",
      "Title on V3, box on V2, video on V1",
      "Box on V3, title on V2, video on V1",
      "The letters need to be the frontmost layer where the elements overlap."
    ],
    [
      "The box is small and sits in a corner. What happens to the rest of the picture?",
      "Video stays visible outside the box",
      "The entire video disappears automatically",
      "Only opaque pixels of the higher layer hide the lower one."
    ],
    [
      "The title disappears halfway through even though it is on top. What should you check next?",
      "The title clip’s end time",
      "The spelling of the text",
      "A layer must exist at the current playhead time to appear."
    ]
  ],
  "remember": [
    "A [[track|track]] holds clips at specific times.",
    "An opaque [[layer|layer]] covers whatever lies directly behind it.",
    "Put a text [[overlay|overlay]] above its backing box."
  ],
  "objectives": [
    "Read a stack from front to back.",
    "Arrange a name above a box and the interview."
  ],
  "realCamera": "Make a title disappear behind an opaque box. Then change the track order to restore it.",
  "notes": {
    "sketch": "Draw three overlapping tracks in their original and corrected order. Label the top track.",
    "frames": 2,
    "frameLabels": [
      "Name hidden",
      "Name visible"
    ],
    "think": "What part of the video stays visible around a small backing box?"
  }
});
