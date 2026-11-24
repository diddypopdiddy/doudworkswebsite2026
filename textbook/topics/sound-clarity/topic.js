(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const diag = (rows) => H.art('diagram', rows, rows.map((pair) => pair.join(': ')).join('. '));
  const frames = [
    diag([
      ['Steady hum', 'Move away from vent'],
      ['Wind rumble', 'Add wind protection'],
      ['Passing traffic', 'Wait or move'],
    ]),
    diag([
      ['Repeated words', 'Bare hard walls'],
      ['Voice', 'Returns after delay'],
    ]),
  ];
  H.study({
    slug: 'sound-clarity',
    frames: frames,
    captions: ['Hum source', 'Hard room'],
    hook: [
      'What continues during the gaps between words?',
      ['A steady low buzz', 'A second speaker'],
      0,
      'The steady tone fills the gaps. [[Background noise]] is easier to remove on set before it is mixed with the voice.',
    ],
    objectives: [
      'Recognize hum, wind, echo and traffic.',
      'Choose a location or microphone fix for the noise.',
    ],
    teachTitle: 'Separate the problem from the words',
    intro: 'The noise pattern helps identify the source.',
    teach:
      'A steady hum can come from a vent. [[Wind noise]] rumbles in gusts. [[Echo]] repeats after words. Traffic swells and recedes. A close mic and a quieter location improve [[clarity]].',
    activities: [
      H.section(
        'Hear each problem and its fix',
        'Each pair repeats the same line so you can isolate the noise.',
        H.text(
          'Use the segment buttons. Each noisy take is followed by the same phrase with the problem removed.',
        ),
        H.audio(
          'p5-problem-fix',
          'Interview noise comparisons',
          ['Air conditioner', 'Wind', 'Echo', 'Traffic'].map((label, i) => ({
            label,
            from: i * 12,
            to: (i + 1) * 12,
          })),
          [
            { at: 6, prompt: 'What disappeared in the clean take?' },
            { at: 30, prompt: 'How does the room tail change?' },
          ],
        ),
      ),
      H.section(
        'Hear the distance',
        'Three microphones, three distances, one voice.',
        H.text('Use mute and solo on the mixing board to compare the microphones.'),
        { type: 'studio-room', lesson: 'sound-clarity' },
      ),
    ],
    rounds: [],
    questions: [
      [
        0,
        'What first action targets a steady HVAC hum?',
        'Move away from the vent or switch it off if allowed',
        'Raise the mic gain',
        'Think about the continuous source.',
        'Removing the source improves the recorded signal.',
      ],
      [
        1,
        'Which location reduces the reflected tail?',
        'A smaller soft-furnished space',
        'An empty tiled stairwell',
        'Consider reflective surfaces.',
        'Soft materials absorb reflected sound.',
      ],
      [
        null,
        'A truck interrupts a quiet outdoor answer. What should you do?',
        'Wait for it to pass and retake the line',
        'Boost the entire answer',
        'Listen for when the traffic disappears.',
        'A clean retake avoids the passing noise.',
      ],
    ],
    remember: [
      'Find the source of [[background noise]].',
      'Shield the mic from [[wind noise]].',
      'Reduce [[echo]] to improve [[clarity]].',
    ],
    realCamera: 'Record ten seconds in a hallway and in a quiet room. Compare on headphones.',
    sketch: 'Draw a noisy setup and a source-specific fix.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p5-noise-ac', 'Interview sample']),
    practice: [
      H.listening(
        [
          'Which recording contains a steady AC hum?',
          ['p5-noise-ac', 'p5-noise-wind'],
          0,
          'Listen through the gaps for a continuous pitch.',
          'The low pitch stays steady between phrases.',
        ],
        [
          'Which one repeats the words after the speaker?',
          ['p5-noise-traffic', 'p5-noise-echo'],
          1,
          'Listen for copies of syllables.',
          'The reflections trail the voice.',
        ],
        [
          'Which noise suggests a windscreen at the capsule?',
          ['p5-noise-wind', 'p5-noise-traffic'],
          0,
          'Compare bursts of low-frequency air with a passing engine.',
          'The uneven rumble follows gusts.',
        ],
      ),
      H.text('Choose a fix that acts on the source.'),
      H.quiz(
        H.q(
          null,
          'Gusts buffet the mic. Choose the first fix.',
          'Fit a windscreen and shelter the mic',
          'Turn up the recorder',
          'Listen for air striking the capsule.',
          'Physical wind protection reduces the source.',
        ),
      ),
    ],
  });
})();
