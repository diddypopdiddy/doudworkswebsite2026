(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const frames = ['far', 'lav', 'boom', 'in'].map((position) => ({ id: 'p5-mic-' + position }));
  H.study({
    slug: 'microphone-placement',
    frames,
    captions: ['Distant phone', 'Lavalier on upper chest', 'Boom outside frame', 'Boom in frame'],
    hook: [
      'Which take sounds closer to the person?',
      ['A', 'B'],
      1,
      'B has more direct voice relative to the room. [[Mic distance]] affects that balance before you change gain.',
    ],
    objectives: [
      'Compare direct voice and room reflections at three distances.',
      'Choose and place a lav or boom without showing it.',
    ],
    teachTitle: 'Place the microphone near the source',
    intro: 'Look at the camera border before choosing a position.',
    teach:
      'A [[lavalier mic]] clips near the mouth. Aim a [[shotgun mic]] just outside the picture. Its [[pickup pattern]] favors some directions, but distant room sound can still enter.',
    afterTeach: [
      H.row(
        [H.pickup('Omnidirectional lav'), 'One lav pattern accepts sound around the capsule.'],
        [
          H.pickup('Directional shotgun'),
          'A shotgun favors the direction it points. Patterns vary by model.',
        ],
      ),
    ],
    activities: [
      H.section(
        'Compare three distances',
        'Increasing distance changes the balance of direct sound and room reflections.',
        H.text(
          'Play the same line from close, middle and far positions. Choose a microphone model and compare distances within it. These simulations illustrate distance and reflections. Actual pickup varies by microphone, placement and room.',
        ),
        {
          type: 'listen-choice',
          free: true,
          groups: ['Phone', 'Lav', 'Shotgun'].map((label, k) => ({
            label,
            options: ['close', 'middle', 'far'].map((v, i) => ({
              label: ['6 inches', '2 feet', '8 feet'][i],
              media: 'p5-distance-' + (k ? label.toLowerCase() + '-' : '') + v,
            })),
          })),
        },
      ),
      H.section(
        'Watch the border',
        'A few inches can put a boom tip inside the frame.',
        H.text('The blue box shows what the camera records. Look at the mic tip in each setup.'),
        H.row([frames[2], 'Boom clear of the frame'], [frames[3], 'Boom tip visible in the frame']),
        H.watch('study-mic', 'Placement study', 2.3, 'Is the tip of the boom inside the camera border?'),
      ),
    ],
    rounds: [
      [
        'Record a seated interview with a small wearable mic.',
        [0, 1],
        1,
        'Look at the distance to the chest.',
        'The lav stays close to the speaker.',
      ],
      [
        'Follow a walking host while keeping the microphone with them.',
        [1, 0],
        0,
        'Check which position follows the speaker.',
        'A clip-on lav maintains distance.',
      ],
      [
        'Get a sideline answer with a boom, while keeping the mic invisible.',
        [3, 2],
        1,
        'Inspect the blue camera border.',
        'The boom aims toward the speaker just outside the frame.',
      ],
    ],
    questions: [
      [
        3,
        'What is wrong with this boom placement?',
        'The tip crosses the frame edge',
        'The mic is too far outside the picture',
        'Trace the blue boundary.',
        'The mic is visible above the actor.',
      ],
      [
        1,
        'What might you hear if a jacket brushes this mic?',
        'Fabric rubbing against the capsule',
        'A delayed color shift',
        'Think about what touches the capsule.',
        'The lav picks up nearby clothing movement.',
      ],
      [
        null,
        'What is the clearest first move for a distant, roomy voice?',
        'Move the microphone closer',
        'Raise gain at the distant position',
        'Consider what else raising gain amplifies.',
        'A closer mic improves direct voice relative to room sound.',
      ],
    ],
    remember: [
      '[[Mic distance]] changes the voice-to-room balance.',
      'A [[lavalier mic]] travels with the speaker.',
      'Aim a [[shotgun mic]] with its [[pickup pattern]] in mind.',
    ],
    realCamera: 'Record one sentence at six inches and at arm’s length. Compare the room sound.',
    sketch: 'Mark a lav and a boom position on a camera frame.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p5-distance-far', 'A'], ['p5-distance-close', 'B']),
    teachVisual: {
      type: 'hotspots',
      ...frames[1],
      points: [
        { x: 60, y: 83, label: 'Capsule', text: 'Fasten the capsule where clothing will not rub.' },
        {
          x: 59,
          y: 94,
          label: 'Cable',
          text: 'Secure the cable so a tug does not move the capsule.',
        },
      ],
    },
    minutes: 15,
  });
})();
