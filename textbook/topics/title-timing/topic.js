/* Lesson evidence, checks and guided-note prompts. */
Textbook.postTopic({
  "slug": "title-timing",
  "visual": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"6\" y=\"10.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"26.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Title</text><rect x=\"13.0\" y=\"32.0\" width=\"290.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Our mural opens this Friday afternoon</text><rect x=\"6\" y=\"90.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"106.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">On screen</text><rect x=\"13.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">0.0 s</text><rect x=\"160.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Gone at 0.5 s</text></svg>",
    "alt": "Title: Our mural opens this Friday afternoon. On screen: 0.0 s > Gone at 0.5 s"
  },
  "hook": [
    "What makes this six-word title difficult to finish?",
    "It vanishes after half a second",
    "It contains only one line",
    "Six words disappear in half a second. Extend the [[on-screen time|on-screen-time]] and test the [[reading time|reading-time]]."
  ],
  "questions": [
    [
      "Using words ÷ 3 + 1, what starting duration fits nine words?",
      "4 seconds",
      "2 seconds",
      "Nine divided by three is three; add one second."
    ],
    [
      "A viewer needs five seconds despite a four-second estimate. Which duration should you try?",
      "At least five seconds, then test again",
      "Exactly four because the formula says so",
      "The estimate is a starting point for a real viewer."
    ],
    [
      "A fixed two-second slot must include a long title. What should change first?",
      "Shorten the wording or allow more time",
      "Make the letters smaller so more fit",
      "More words still take time to read."
    ]
  ],
  "remember": [
    "Estimate [[reading time|reading-time]] from the number of words.",
    "Increase [[on-screen time|on-screen-time]] for dense or unfamiliar names.",
    "Check [[reading time|reading-time]] by watching at normal playback speed."
  ],
  "objectives": [
    "Estimate a starting duration from a word count.",
    "Set two title durations and check them at normal speed."
  ],
  "realCamera": "Time two titles in a short edit. Read them aloud and ask another viewer to try them silently.",
  "notes": {
    "sketch": "Write a three-word title and a six-word title inside the frames. Mark their estimated holds.",
    "frames": 2,
    "frameLabels": [
      "Three words",
      "Six words"
    ],
    "think": "When would you allow more time than the estimate?"
  }
});
