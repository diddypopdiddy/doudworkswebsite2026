/* Lesson evidence, checks and guided-note prompts. */
Textbook.postTopic({
  "slug": "position-and-resize-graphics",
  "visual": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"7\" y=\"7\" width=\"306\" height=\"165\" rx=\"4\" fill=\"#bacad0\" stroke=\"none\"/><path d=\"M7 130 L313 108 V172 H7Z\" fill=\"#9b8b79\"/><path d=\"M137 159 Q142 105 179 102 Q212 101 229 163Z\" fill=\"#3157c8\"/><ellipse cx=\"182\" cy=\"81\" rx=\"27\" ry=\"34\" fill=\"#e9c6a5\"/><path d=\"M154 73 Q157 34 191 47 Q210 50 209 70 Q181 59 154 73Z\" fill=\"#342922\"/><path d=\"M172 91h17\" stroke=\"#754c43\" stroke-width=\"2\"/><rect x=\"26\" y=\"20\" width=\"268\" height=\"135\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-dasharray=\"6 4\"/><rect x=\"238\" y=\"116\" width=\"109\" height=\"29\" rx=\"4\" fill=\"#233447\" stroke=\"none\"/><text x=\"244\" y=\"136\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#fff\" text-anchor=\"start\">COURSE NEWS</text></svg>",
    "alt": "The words COURSE NEWS sit at the far right. The right letters cross the dashed safe-area guide and the screen edge."
  },
  "hook": [
    "Which part of the logo is nearest the cropped edge?",
    "The right end",
    "The left end",
    "The last letters cross the guide. Change [[position|position]] or [[scale|scale]] to bring the whole graphic into the [[safe area|safe-area]]."
  ],
  "questions": [
    [
      "The logo is the right size but too far right. Which single control should change?",
      "Horizontal position",
      "Scale",
      "Moving the logo keeps the letters their current size."
    ],
    [
      "A centered card is too wide for the guide. What would preserve its center?",
      "Reduce scale",
      "Move it farther left at the same size",
      "Both outer edges need to come inward."
    ],
    [
      "What must fit inside the guide?",
      "The entire visible graphic",
      "Only its anchor point",
      "Letters can cross the guide even when their anchor is inside."
    ]
  ],
  "remember": [
    "[[Position|position]] moves the graphic without resizing it.",
    "[[Scale|scale]] changes its size around an anchor.",
    "Check every edge against the [[safe area|safe-area]]."
  ],
  "objectives": [
    "Identify which edge crosses a safe-area guide.",
    "Move and shrink a graphic to fit its space."
  ],
  "realCamera": "Turn on a safe-area guide. Position a title and logo so every visible edge fits inside.",
  "notes": {
    "sketch": "Draw safe guides and the edges of the logo before and after adjustment.",
    "frames": 2,
    "frameLabels": [
      "Logo crossing guide",
      "Full logo inside"
    ],
    "think": "Which control changed the logo’s size and which moved it?"
  }
});
