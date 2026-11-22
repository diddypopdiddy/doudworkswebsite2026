(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const photo = (filter) => H.photo('interview-a', filter);
  const captions = ['Warm', 'Neutral', 'Cool', 'Faded'];
  const frames = [
    photo('sepia(.67) saturate(1.55)'),
    photo('none'),
    photo('sepia(.6) hue-rotate(155deg) saturate(1.4)'),
    photo('saturate(.15)'),
  ];
  H.study({
    slug: 'color-and-mood',
    frames: frames,
    captions: ['Warm', 'Neutral', 'Cool', 'Faded'],
    hook: [
      'Which version would you choose for a happy memory?',
      ['A', 'B'],
      null,
      'The action is unchanged, but each [[color grade]] invites a different reading. Your intended [[mood]] determines the choice.',
    ],
    objectives: [
      'Describe how a grade changes a scene’s mood.',
      'Distinguish a hue shift from reduced saturation.',
    ],
    teachTitle: 'Choose a feeling for the scene',
    intro: 'Compare the same interview under different looks.',
    teach:
      'A [[color palette]] is the group of colors you plan to use. A [[color grade]] changes the image to support that plan. Lower [[saturation]] makes colors less intense.',
    afterTeach: [
      H.compare(
        frames[1],
        frames[3],
        ['Neutral', 'Low saturation'],
        ['Normal color intensity', 'Colors weaken while the action stays the same.'],
      ),
    ],
    activities: [
      H.section(
        'Try four grades',
        'A grade can shift hue or color intensity without changing the action.',
        H.text('Predict which version could feel like a faded memory.'),
        H.slider(
          'Look',
          frames.map((ref, i) => [
            ref,
            captions[i],
            [
              'Amber color can suggest warmth.',
              'Neutral colors draw less attention to the grade.',
              'Blue can suggest distance.',
              'Low saturation drains color from the frame.',
            ][i],
          ]),
        ),
      ),
      H.section(
        'Watch the change',
        'The two clips show the same interview with different color decisions.',
        H.text('Watch the same moment with warm and cool grades.'),
        H.watch('p4-warm', 'Warm memory', 2, 'Which colors stand out?'),
        H.text('Now compare the same expression in a cooler grade.'),
        H.watch('p4-cool', 'Cool memory', 2, 'Did your reading of the expression change?'),
      ),
    ],
    rounds: [
      [
        'Give the empty school a cool early-morning look.',
        [0, 2],
        1,
        'Read the pale surfaces.',
        'A blue cast gives the frame a cooler palette.',
      ],
      [
        'Make our flashback look washed out without turning it blue.',
        [2, 3],
        1,
        'Compare color strength, not just hue.',
        'Low saturation weakens all the colors.',
      ],
      [
        'Our director wants a warm memory with strong color.',
        [0, 3],
        0,
        'Look for both warmth and color intensity.',
        'The amber grade keeps color while shifting the palette.',
      ],
    ],
    questions: [
      [
        3,
        'What changed most here?',
        'Color intensity fell',
        'The frame became blue',
        'Check several colors.',
        'Reduced saturation affects color strength.',
      ],
      [
        null,
        'A character feels isolated. What could justify a cool grade?',
        'It supports the intended reading of the scene',
        'Every sad scene must be blue',
        'Think about this story and its audience.',
        'Mood is a creative choice grounded in the scene.',
      ],
      [
        null,
        'How could you test whether viewers read the intended mood?',
        'Show two grades of the same action and ask what they felt',
        'Change the acting and grade together',
        'Keep one variable fixed.',
        'The same action isolates the grade.',
      ],
    ],
    remember: [
      'A [[color grade]] can suggest a [[mood]].',
      'A [[color palette]] gives a scene a planned group of colors.',
      '[[Saturation]] controls color intensity.',
    ],
    realCamera: 'Apply three looks to the same frame. Ask a partner what each suggests.',
    sketch: 'Sketch two palettes for the same memory.',
    frameLabels: ['First setup', 'Revised setup'],
    hookMedia: H.pair(frames[0], frames[2]),
  });
})();
