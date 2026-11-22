(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const frames = [{ id: 'p4-puppet-rest' }, { id: 'p4-puppet-reach' }];
  H.study({
    slug: 'lotte-reiniger-and-silhouette-animation',
    frames,
    captions: ['Pose one', 'Pose two'],
    hook: [
      'Which part moved while the paper body stayed still?',
      ['The arm', 'The legs'],
      0,
      'The arm pivots at the shoulder and elbow. [[Cutout animation]] builds movement one photographed pose at a time.',
    ],
    objectives: [
      'Identify how a jointed cutout moves.',
      'Explain how backlight makes a silhouette readable.',
    ],
    teachTitle: 'A filmmaker working in paper',
    intro: 'In this original classroom example, look at the paper pieces and the outline of the gesture.',
    teach:
      'Lotte Reiniger directed <i>The Adventures of Prince Achmed</i> (1926). She arranged jointed figures over a lit surface. In [[silhouette animation]], a figure’s outline carries the gesture. <a href="https://www.bfi.org.uk/sight-and-sound/features/scissors-make-films-lotte-reiniger-creating-her-magical-animations">Reiniger describes her process.</a>',
    afterTeach: [
      {
        type: 'quick-check',
        ...H.q(
          frames[1],
          'How does the figure communicate without facial detail?',
          'The hand clears the torso in outline',
          'The camera records a close-up of the eyes',
          'Trace the outer contour.',
          'The contour shows the reach.',
        ),
      },
    ],
    activities: [
      H.section(
        'Watch the outline change',
        'A small joint movement can carry the action across several frames.',
        H.text('Watch this original movement study and pause when the hand lifts.'),
        H.watch(
          'study-cutout',
          'Original movement study',
          2,
          'Could you read the same gesture if the arm crossed the chest?',
        ),
      ),
      H.section(
        'Connect the method to the film',
        'Reiniger used articulated figures to tell a feature-length story.',
        H.text('The archival excerpt is reserved for the approved copy.'),
        {
          type: 'video-segments',
          media: 'archive-achmed',
          pauses: [{ at: 2, prompt: 'Where is the light relative to the shapes?' }],
        },
        {
          type: 'callout',
          kind: 'history',
          html: 'Move, photograph, repeat. The same frame-by-frame principle returns in stop motion.',
          link: { href: '../stop-motion-and-constructed-action/index.html', label: 'Explore stop motion' },
        },
      ),
    ],
    rounds: [],
    questions: [
      [
        1,
        'Which detail communicates the gesture?',
        'The hand breaking the body outline',
        'The colour of the sleeve',
        'Find the hand against the lit background.',
        'The hand separates clearly from the torso.',
      ],
      [
        null,
        'What must happen between exposures?',
        'A small change to a joint or position',
        'A continuous camera pan',
        'Think about individual poses.',
        'Small pose changes appear to move in playback.',
      ],
      [
        null,
        'Where would you place the light to make a dark figure?',
        'Behind the cutout',
        'On the front of the cutout',
        'Think about what faces the camera.',
        'The bright field outlines the unlit shape.',
      ],
    ],
    remember: [
      '[[Cutout animation]] uses separately moved pieces.',
      '[[Silhouette animation]] uses outline to show action.',
      'In [[cutout animation]], small pose changes build movement.',
    ],
    realCamera: 'Cut a paper figure. Photograph three poses against a lit window.',
    sketch: 'Draw two poses whose action reads in outline.',
    frameLabels: ['First setup', 'Revised setup'],
    realCameraTitle: 'Try it',
  });
})();
