(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const frames = ['left', 'asymmetric', 'symmetric'].map((layout) => ({ id: 'p4-balance-' + layout }));
  H.study({
    slug: 'visual-contrast-and-balance',
    frames: frames,
    captions: ['Left-heavy', 'Asymmetrical balance', 'Symmetry'],
    hook: [
      'Which frame feels heavier on the left?',
      ['A', 'B'],
      0,
      'In A, the person and the orange vase are on the left. [[Visual weight]] is how strongly a detail draws your eye.',
    ],
    objectives: ['Locate weight in a frame.', 'Balance an off-center subject with a second object.'],
    teachTitle: 'Compare both sides',
    intro: 'Large subjects and bright small objects can both pull attention.',
    teach:
      '[[Balance]] distributes [[visual weight]]. [[Symmetry]] repeats similar weight on both sides. An unequal arrangement can also feel balanced.',
    activities: [
      H.section(
        'Reveal the weights',
        'The face and the smaller accent draw different amounts of attention.',
        H.text('Select the face and the vase, then show the weight circles.'),
        {
          type: 'hotspots',
          ...frames[1],
          points: [
            { x: 37, y: 33, label: 'Face', text: 'The large person carries weight on the left.' },
            { x: 80, y: 76, label: 'Small accent', text: 'The smaller bright vase counterbalances the face.' },
          ],
          overlay: H.weights([
            [118, 59, 29],
            [256, 136, 19],
          ]),
          overlayLabel: 'Toggle weight circles',
        },
        H.text('Now compare a frame where both weights lie on the same side.'),
        {
          type: 'hotspots',
          ...frames[0],
          points: [
            { x: 37, y: 33, label: 'Face', text: 'The face draws weight to the left.' },
            { x: 13, y: 76, label: 'Second weight', text: 'This accent adds weight to the same side.' },
          ],
          overlay: H.weights([
            [118, 59, 29],
            [43, 136, 19],
          ]),
          overlayLabel: 'Toggle left-side weights',
        },
      ),
    ],
    rounds: [
      [
        'Keep the person off-center but balance the image.',
        [0, 1],
        1,
        'Check the empty side.',
        'The bright vase on the right balances the person on the left.',
      ],
      [
        'Use symmetry for a formal announcement.',
        [2, 1],
        0,
        'Compare corresponding shapes about the center.',
        'The centered person is flanked by matching objects.',
      ],
      [
        'We must keep the person left. Choose where to put a small orange prop.',
        [0, 1],
        1,
        'Inspect the space across from the person.',
        'A prop on the opposite side spreads weight.',
      ],
    ],
    questions: [
      [
        0,
        'Where is most visual weight?',
        'Left',
        'Right',
        'Find the face and the orange vase.',
        'Both sit on the left.',
      ],
      [
        2,
        'Which organization is shown?',
        'Symmetry',
        'A single side-heavy cluster',
        'Imagine a line through the center.',
        'The repeated shapes sit at equal distances.',
      ],
      [
        null,
        'Why might a small orange sign balance a large muted object?',
        'Strong contrast gives it visual weight',
        'Small objects always weigh more',
        'Think about which detail attracts the eye.',
        'Attention depends on contrast as well as size.',
      ],
    ],
    remember: [
      '[[Visual weight]] depends on size and contrast.',
      '[[Balance]] can use unequal objects.',
      '[[Symmetry]] repeats weight across the center.',
    ],
    realCamera: 'Take a symmetrical photo and one with an off-center person balanced by a small object.',
    sketch: 'Circle the visual weights in each frame.',
    frameLabels: ['First setup', 'Revised setup'],
  });
})();
