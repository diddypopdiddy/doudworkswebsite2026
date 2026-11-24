(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "check-picture-and-sound",
  "minutes": 12,
  "bigIdea": "Check frame, focus, exposure and sound before every take.",
  "hook": {
    "svg": D.take({kind:"soft"}),
    "alt": "A soft view of a performer with a sound trace below the frame.",
    "audioExamples": [
      {
        "media": "p5-noise-ac",
        "label": "Test recording with a steady mechanical noise"
      }
    ],
    "question": "What should the crew check before filming this take?",
    "options": [
      "Focus on the subject and the source of the steady noise.",
      "Only the amount of space above the head."
    ],
    "answer": 0,
    "reveal": "The subject’s outline is soft and the test recording carries a steady noise. A [[pre-take check]] catches picture problems and a [[sound check]] catches the noise."
  },
  "notes": {
    "sketch": "Write the picture and sound fixes alongside the setup.",
    "frames": 2,
    "frameLabels": [
      "Picture",
      "Sound"
    ],
    "think": "Which problem can you miss by looking only at a meter?"
  },
  "vocab": [
    "pre-take-check",
    "sound-check",
    "test-shot"
  ],
  "review": [
    "focus",
    "exposure"
  ],
  "objectives": [
    "Perform picture and sound checks before the action.",
    "Diagnose a failed check and repeat the correct test."
  ],
  "sections": [
    {
      "title": "Look, listen, replay",
      "intro": "A short recording tells you what the camera actually captured.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>During a [[pre-take check]], frame the whole move, focus on the subject and check exposure on the face. Record a short [[test shot]] and play it back.</p><p>For the [[sound check]], ask for a line at the real speaking level. Check the mic connection and listen through headphones. Meter movement alone cannot identify a fan or clothing rustle.</p>"
        },
        {
          "type": "figure",
          "svg": D.take({kind:"soft"}),
          "alt": "A soft test image with a moving sound trace.",
          "caption": "Replay both signals before calling the cast. Revisit <a href=\"../camera-judgment/index.html\">camera judgment</a> and <a href=\"../gain-levels-and-headphone-monitoring/index.html\">headphone monitoring</a> for the individual checks."
        },
        {
          type: 'figure-row',
          wide: true,
          items: [
            { body: 'g97', view: 'rear', labels: [{ control: 'menu', label: '1' }],
              alt: 'Back of the G97 with MENU/SET marked.',
              caption: '<strong>1. G97.</strong> Press MENU/SET and open the Motion Picture menu. Sound Rec Level Adj. changes how loudly the microphone records.' },
            { body: 'hcx1600', view: 'lcd', labels: [{ control: 'gain', label: '2' }],
              alt: 'LCD side of the HC-X1600 with its GAIN button marked.',
              caption: '<strong>2. HC-X1600.</strong> The GAIN button changes picture brightness. Use the audio meter and play back a spoken line to check microphone level.' }
          ]
        }
      ]
    },
    {
      "title": "Watch the thirty-second check",
      "intro": "Identify each problem before the crew calls action.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Select Sound: off to enable audio. Follow the frame edges, eyes and exposure. Listen to the sample at 19 seconds, then compare the cleaner line at 24 seconds.</p>"
        },
        {
          "type": "video-segments",
          "media": "p7-pretake-check",
          "caption": "C1 practice stand-in. <strong>Sound transcript:</strong> 0:00–0:19, no speech. 0:19–0:24, steady fan hum. At 0:19.25–0:20.7 the speaker says, “The note fell out of the book.” At 0:24.25–0:25.7 the speaker repeats the same line without the fan. The final seconds are quiet.",
          "pauses": [
            {
              "at": 10,
              "prompt": "Is the subject sharp through the whole move?"
            },
            {
              "at": 23,
              "prompt": "What can you hear beneath the voice? Continue and listen for the change."
            }
          ],
          "segments": []
        }
      ]
    },
    {
      "title": "Spot the missed check",
      "intro": "For each take choose the fix you would test on set.",
      "blocks": [
        {
          "type": "quiz",
          "items": [
            {
              "q": "The background is sharp but the face looks soft. What should change?",
              "options": [
                "Set focus on the eyes and replay a short test",
                {
                  "text": "Raise the recording level",
                  "clue": "What part of the image needs sharp edges?"
                }
              ],
              "answer": 0,
              "explain": "The eyes must hold focus through the planned movement.",
              "svg": D.take({kind:"soft"}),
              "alt": "Soft performer behind the frame edges."
            },
            {
              "q": "The face has lost all detail in a bright window setup. What should you test?",
              "options": [
                "Adjust exposure or light, then record another test",
                {
                  "text": "Record the same setup twice",
                  "clue": "Repeating a setup repeats the light problem."
                }
              ],
              "answer": 0,
              "explain": "A corrected exposure restores usable face detail."
            },
            {
              "q": "The hand and phone leave the right edge during the action. What will catch that?",
              "options": [
                {
                  "text": "Check the first still frame only",
                  "clue": "When does the clipping happen?"
                },
                "Rehearse the whole move inside the frame"
              ],
              "answer": 1,
              "explain": "Watching the full move reveals the edge problem.",
              "svg": D.take({kind:"cut"}),
              "alt": "A figure at the right frame edge."
            },
            {
              "q": "Replay reveals a buzz beneath the line. What should you do before another take?",
              "options": [
                "Check the microphone and room, then monitor a fresh line",
                {
                  "text": "Keep the same setup because the meter moved",
                  "clue": "The meter can show noise as signal."
                }
              ],
              "answer": 0,
              "explain": "Headphone playback can reveal a sound the meter does not identify."
            }
          ]
        }
      ]
    },
    {
      id: 'camera-practice', title: 'Run a pre-take check',
      intro: 'The interview is ready to start. Find the fault on the camera you choose, then verify a test take.',
      blocks: [{
        type: 'camera-sim', title: 'Check the interview rig', body: ['g97', 'fz300', 'elph180', 'hcx1600'], level: 2,
        scene: 'interview-window', start: { power: true }, kit: ['mic-wireless', 'headphones', 'cloth', 'card'],
        forBody: { g97: { faults: ['mic-tx-off'] }, fz300: { faults: ['mic-unplugged'] },
          elph180: { level: 1, faults: ['smudge'], kit: ['cloth'], start: { power: true, settings: { meterOn: 'reader' } } }, hcx1600: { faults: ['lens-cover'] } },
        tasks: [
          { text: 'Get a clear picture and a working microphone for this camera.',
            hint: 'Check the lens, then the audio connection. The pocket camera uses its own microphone.',
            check: s => s.fixed({ g97: 'mic-tx-off', fz300: 'mic-unplugged', elph180: 'smudge', hcx1600: 'lens-cover' }[s.body]) },
          { text: 'Record a two-second test with a sharp face, usable exposure and sound. Play the whole take with sound on.',
            hint: 'Check the face and the level bars or listen in playback. A good take includes the voice.',
            check: s => s.takes.some(t => t.length >= 2 && !t.interrupted && !t.picture.black && !t.picture.smudge && t.sharpOn('reader') && t.exposed() && t.heard() && t.reviewed && t.reviewedSound) }
        ], doneText: 'The picture and sound both survived the recording.'
      }]
    }
  ],
  "check": [
    {
      "q": "What should a crew member correct in this picture?",
      "options": [
        {
          "text": "A microphone that is certainly unplugged",
          "clue": "Judge the visible edges. Sound needs its own listen."
        },
        "Soft focus on the subject"
      ],
      "answer": 1,
      "explain": "The subject is visibly soft.",
      "svg": D.take({kind:"soft"}),
      "alt": "The subject is visibly soft."
    },
    {
      "q": "The meter moves with nobody speaking. What should the recordist do?",
      "options": [
        "Listen to identify the noise and record a test line",
        {
          "text": "Assume speech will be clear",
          "clue": "A meter shows level, not the source."
        }
      ],
      "answer": 0,
      "explain": "Playback checks what will compete with the words."
    },
    {
      "q": "The first take was clear. The subject moved near a bright window. What now?",
      "options": [
        "Repeat exposure, focus, framing and sound checks",
        {
          "text": "Keep the old setup because take one worked",
          "clue": "The light, distance and room sound may have changed."
        }
      ],
      "answer": 0,
      "explain": "A changed setup needs a fresh pre-take check."
    }
  ],
  "remember": [
    "Repeat the [[pre-take check]] when the setup changes.",
    "Replay a [[test shot]] for focus, exposure and frame edges.",
    "Listen to a recorded line during the [[sound check]]."
  ],
  "realCamera": "Before a short phone shot, check the frame, focus and exposure aloud. Record a test line, replay it and name one adjustment."
});
})();
