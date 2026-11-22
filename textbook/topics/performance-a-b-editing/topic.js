/* Lesson evidence, checks and guided-note prompts. */
Textbook.postTopic({
  "slug": "performance-a-b-editing",
  "visual": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 180\"><rect x=\"0\" y=\"0\" width=\"320\" height=\"180\" rx=\"4\" fill=\"#f3f1ec\" stroke=\"none\"/><rect x=\"6\" y=\"10.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"26.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">First phrase</text><rect x=\"13.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take A: face in view</text><rect x=\"160.0\" y=\"32.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"60.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take B: face blocked</text><rect x=\"6\" y=\"90.0\" width=\"308\" height=\"76.0\" rx=\"6\" fill=\"#fff\" stroke=\"#cad0ce\"/><text x=\"13\" y=\"106.0\" font-family=\"Arial,sans-serif\" font-size=\"11\" font-weight=\"600\" fill=\"#465765\" text-anchor=\"start\">Second phrase</text><rect x=\"13.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#dce5f7\" stroke=\"none\"/><text x=\"18.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take A: hands blocked</text><rect x=\"160.0\" y=\"112.0\" width=\"143.0\" height=\"49.0\" rx=\"4\" fill=\"#f1dfcc\" stroke=\"none\"/><text x=\"165.0\" y=\"140.5\" font-family=\"Arial,sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#171b1f\" text-anchor=\"start\">Take B: gesture clear</text></svg>",
    "alt": "First phrase: Take A: face in view > Take B: face blocked. Second phrase: Take A: hands blocked > Take B: gesture clear"
  },
  "hook": [
    "Which take reveals the second phrase’s gesture?",
    "Take B",
    "Take A",
    "Only B shows the gesture on the second phrase. [[A/B editing|a-b-editing]] can choose that moment from a synced take."
  ],
  "questions": [
    [
      "Two takes share a clap. What should you line up first?",
      "Both clap moments against the same master sound",
      "The last frame of each take",
      "The same event gives both takes a common time reference."
    ],
    [
      "B starts halfway through the song in your edit. Which source moment belongs there?",
      "The same halfway point in B",
      "B’s first frame",
      "The performance must stay on the master track’s musical moment."
    ],
    [
      "A good gesture arrives on B, but the lips are early. What should you fix before keeping it?",
      "B’s sync with the master",
      "The brightness of both pictures",
      "A better gesture cannot fix a timing mismatch."
    ]
  ],
  "remember": [
    "Each [[performance take|performance-take]] covers the same performance time.",
    "[[Sync|sync]] keeps the master sound and visible motion together.",
    "[[A/B editing|a-b-editing]] switches angles for a specific gesture or expression."
  ],
  "objectives": [
    "Select a take for a visible performance moment.",
    "Switch between takes without shifting their source time."
  ],
  "realCamera": "Film the same four-beat gesture twice against a repeating sound. Switch takes on beat three.",
  "notes": {
    "sketch": "Draw what the audience can see in take A early and in take B late. Mark the shared switch time.",
    "frames": 2,
    "frameLabels": [
      "Take A, first phrase",
      "Take B, second phrase"
    ],
    "think": "Why should B’s source time equal the time on the master pulse?"
  }
});
