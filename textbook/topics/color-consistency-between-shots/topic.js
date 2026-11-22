(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const photo = (filter) => H.photo('interview-a', filter);
  const frames = [
    photo('sepia(.67) saturate(1.55)'),
    photo('none'),
    photo('sepia(.6) hue-rotate(155deg) saturate(1.4)'),
    photo('saturate(.15)'),
    photo('sepia(.1) hue-rotate(155deg)'),
  ];
  H.study({
    slug: 'color-consistency-between-shots',
    frames: frames,
    captions: ['Warm', 'Neutral', 'Cool', 'Faded'],
    hook: [
      'Which cut would feel least continuous after a neutral first angle?',
      ['Another neutral angle', 'An angle with a blue wall'],
      1,
      'A wall that suddenly turns blue draws attention to the cut. A [[color match]] keeps the scene consistent.',
    ],
    objectives: ['Find a color shift across a cut.', 'Prevent angle-to-angle changes under mixed light.'],
    teachTitle: 'Follow the same surface',
    intro: 'Compare the same wall and skin across the cut.',
    teach:
      '[[Mixed lighting]] combines differently colored sources. It can create a [[color cast]] on one side of a face. Choose one source or match sources before locking white balance.',
    activities: [
      H.section(
        'Predict the cut',
        'The room stays recognizable when the second angle matches the first.',
        H.text('Choose which version will feel like one room. Then watch both cuts.'),
        {
          type: 'sequence-compare',
          predict: {
            q: 'Which cut will hold the wall color?',
            options: ['Matched settings', 'Different settings'],
          },
          versions: [
            {
              label: 'Matched',
              segments: [{ media: 'p4-match', from: 0, to: 4 }],
              note: 'The wall keeps the same cast across the cut.',
            },
            {
              label: 'Mismatched',
              segments: [{ media: 'p4-mismatch', from: 0, to: 4 }],
              note: 'The second angle changes to blue.',
            },
          ],
        },
      ),
    ],
    rounds: [
      [
        'Our first angle is neutral. Find the angle that breaks the match.',
        [1, 2],
        1,
        'Compare the pale wall.',
        'The blue cast contradicts the first angle.',
      ],
      [
        'We lit our memory scene warm. Which pickup breaks the look?',
        [0, 1],
        1,
        'Use the established scene as the reference.',
        'A neutral pickup interrupts the deliberate warm look.',
      ],
      [
        'Match the pale wall after a subtle pickup shift.',
        [1, 4],
        0,
        'Look at the wall before comparing costumes.',
        'The neutral balance preserves the reference.',
      ],
    ],
    questions: [
      [
        2,
        'After a neutral wide shot, what is the first clue here?',
        'A pale surface turns blue',
        'The subject changes size',
        'Use a reference visible in both shots.',
        'The wall reveals the cast.',
      ],
      [
        null,
        'One cheek is orange and the other blue. Why can one preset fail?',
        'Different sources illuminate different parts',
        'The camera cannot record a face',
        'Look at where each color lands.',
        'One global correction cannot make both sources neutral.',
      ],
      [
        null,
        'How can two angles keep the same color on set?',
        'Use consistent sources and lock the balance',
        'Let the camera rebalance on every shot',
        'Think about reframing a white wall.',
        'A fixed balance prevents changes between angles.',
      ],
    ],
    remember: [
      'A [[color match]] makes adjacent shots feel continuous.',
      '[[Mixed lighting]] can leave two casts on one face.',
      'Use a shared neutral surface to spot a [[color cast]].',
    ],
    realCamera: 'Film two angles on a fixed white balance. Repeat on auto and compare the cuts.',
    sketch: 'Draw a reference surface present in both angles.',
    frameLabels: ['First setup', 'Revised setup'],
    hookMedia: H.pair(frames[1], frames[2]),
  });
})();
