(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const frames = ['dark-clutter', 'clean', 'pole', 'window'].map((bg) => ({ id: 'p4-bg-' + bg }));
  H.study({
    slug: 'build-a-frame-for-a-purpose',
    frames,
    captions: ['Clutter and dark face', 'Readable interview', 'Pole near head', 'Competing window'],
    hook: [
      'Which two issues make the interview in A harder to follow?',
      ['A dark face and crowded wall', 'A tilted camera and a missing microphone'],
      0,
      'The face reads as a [[silhouette]] and the cards compete for attention. Decide what the viewer should notice first.',
    ],
    objectives: [
      'Choose light, color and background for a brief.',
      'Diagnose competing details in a finished frame.',
    ],
    teachTitle: 'Check a frame before recording',
    intro: 'Run the checks in the camera view.',
    teach: 'Start with the intended [[focal point]]. Check the face, then scan the rest of the frame.',
    activities: [],
    rounds: [],
    questions: [
      [
        0,
        'Which problem hides the expression?',
        'Little light reaches the face',
        'The background is too empty',
        'Compare face and wall brightness.',
        'The bright background outlines a dark face.',
      ],
      [
        2,
        'Which move fixes the pole?',
        'Shift sideways',
        'Lower microphone gain',
        'Trace the outline above the head.',
        'Changing the angle separates the pole.',
      ],
      [
        3,
        'What competes with the face?',
        'The bright window',
        'A second person',
        'Look for the strongest highlight.',
        'The bright window pulls attention.',
      ],
    ],
    remember: [
      'Set [[exposure]] for the intended subject.',
      'Use [[white balance]] to control neutral surfaces.',
      'Check the [[background]] around the [[focal point]].',
    ],
    realCamera:
      'Build one interview setup from the checklist. Name a change you would keep for the next interview.',
    sketch: 'Sketch two setups for different purposes.',
    frameLabels: ['First setup', 'Revised setup'],
    review: ['exposure', 'white-balance', 'background', 'focal-point'],
    minutes: 15,
    teachVisual: H.steps(
      'Check face exposure and visible detail.',
      'Read the direction, shadow edge and amount of fill.',
      'Set white balance for the main source.',
      'Scan the background for mergers and clutter.',
      'Check balance and the intended point of emphasis.',
    ),
    practice: [
      {
        type: 'frame-builder',
        mediaPrefix: 'p4-frame',
        briefs: [
          {
            brief:
              '“Our guest should feel welcome. Give the face gentle shadows, amber color and a clear wall.”',
            want: { look: 'soft', tone: 'warm', bg: 'clean' },
            clues: {
              look: 'Trace the edge of the cheek shadow.',
              tone: 'Check the warmth of the wall.',
              bg: 'Scan outside the face.',
            },
            explain: 'Soft light, warm color and a clear wall support the welcome.',
          },
          {
            brief: '“Hide the figure’s identity against a cool, clear wall.”',
            want: { look: 'back', tone: 'cool', bg: 'clean' },
            clues: {
              look: 'Can you still identify the features?',
              tone: 'Look for a blue wall.',
              bg: 'Check whether other details compete.',
            },
            explain: 'The backlit silhouette hides facial features against the cool wall.',
          },
          {
            brief: '“Show the package label evenly lit against a clear wall. Keep its colors neutral.”',
            mediaPrefix: 'p4-package',
            want: { look: 'front', tone: 'neutral', bg: 'clean' },
            clues: {
              look: 'The label needs direct, even illumination.',
              tone: 'Compare the package color against a neutral reference.',
              bg: 'Look behind the product.',
            },
            explain: 'Front light keeps the neutral label readable against an uncluttered wall.',
          },
        ],
      },
      H.text('Now diagnose the example frames.'),
      H.quiz(
        H.q(
          frames[0],
          'Which issue hides the eyes?',
          'Backlighting without front fill',
          'A tilted camera',
          'Inspect the eye area.',
          'The face is dark against the pale wall.',
        ),
        H.q(
          frames[1],
          'What keeps the face readable?',
          'Soft frontal detail',
          'A dark silhouette',
          'Look for cheek detail.',
          'The broad light shows facial features.',
        ),
        H.q(
          frames[2],
          'What merges with the head?',
          'A pole',
          'The floor',
          'Trace the outline.',
          'The vertical line meets the hair.',
        ),
        H.q(
          frames[3],
          'Which detail competes?',
          'The window',
          'The lens',
          'Find the brightest region.',
          'The window attracts the eye.',
        ),
      ),
    ],
  });
})();
