(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const frames = ['key', 'key-fill-back', 'key-fill', 'key-back'].map((state) => ({ id: 'p4-plot-' + state }));
  H.study({
    slug: 'three-point-lighting',
    frames,
    captions: ['Key only', 'Key, fill and back', 'Key and fill', 'Key and back'],
    hook: [
      'What appears around the head in B?',
      ['A bright rim', 'A second face'],
      0,
      'A [[back light]] creates the rim. In [[three-point lighting|three-point-lighting]], it separates hair from the wall.',
    ],
    objectives: ['Identify key, fill and back lights.', 'Place lights to keep a face readable and separate.'],
    teachTitle: 'Give each light a job',
    intro: 'Follow the cheek shadow and the hairline independently.',
    teach:
      'The [[key light]] establishes direction. A [[fill light]] reveals shadow detail. A [[back light]] catches the outline from behind.',
    beforePractice: [
      H.quiz(
        H.q(
          frames[2],
          'The face is shaped and the shadow cheek is readable. What is missing?',
          'A back light',
          'The key lamp',
          'Inspect the edge of the hair.',
          'There is no bright rim.',
        ),
        H.q(
          frames[3],
          'There is a rim, but one cheek falls into darkness. Which source would open it?',
          'Fill',
          'Another back light',
          'Compare the shadow and hair separately.',
          'Fill controls cheek shadow.',
        ),
      ),
      H.text('Use the same clues to choose a setup.'),
    ],
    activities: [
      H.section(
        'Switch the lamps',
        'Each position in the overhead map corresponds to a different job.',
        H.text('Try each lamp alone, then combine the three.'),
        {
          type: 'light-plot',
          photos: Object.fromEntries(
            ['off', 'key', 'fill', 'back', 'key-fill', 'key-back', 'fill-back', 'key-fill-back'].map(
              (state) => [state, 'p4-plot-' + state],
            ),
          ),
        },
      ),
      H.section(
        'Follow the setup',
        'The setup begins with a key, then adds fill and a rim.',
        H.text('Watch the order in which the three positions light up.'),
        H.watch('study-three', 'Three-lamp plot', 2.75, 'Which lamp is behind the chair?'),
      ),
    ],
    rounds: [
      [
        'I need the shadow side readable and a rim around the hair.',
        [0, 1],
        1,
        'Check both cheek and outline.',
        'Fill lifts the cheek and back light traces the hair.',
      ],
      [
        'Which setup is missing the back light?',
        [1, 2],
        1,
        'Check the outer edge of the shoulder.',
        'There is no rim on the shoulder.',
      ],
      [
        'Keep the rim but remove the fill for a darker profile.',
        [3, 2],
        0,
        'Find the bright outline and dark cheek together.',
        'Key and back leave a dark shadow side.',
      ],
    ],
    questions: [
      [
        2,
        'Which lamp would help separate the hair?',
        'Back light',
        'More fill near the lens',
        'Look at the outline against the wall.',
        'A source behind catches the edge.',
      ],
      [
        3,
        'Which lamp would open the dark cheek?',
        'Fill opposite the key',
        'A second back light',
        'Locate the missing facial detail.',
        'Fill returns light to the shadow.',
      ],
      [
        null,
        'A person looks screen left. Where could the key go for light from the gaze side?',
        'Left of camera, angled toward the face',
        'Directly behind the person',
        'Follow the subject’s gaze.',
        'The face turns toward a screen-left key.',
      ],
    ],
    remember: [
      'The [[key light]] establishes direction.',
      '[[Fill light]] reveals shadow detail.',
      'A [[back light]] adds separation in [[three-point lighting|three-point-lighting]].',
    ],
    realCamera:
      'Use a window as key, white card as fill and a lamp behind the subject. Photograph each addition.',
    sketch: 'Sketch a top-down key, fill, back light, camera and chair.',
    frameLabels: ['First setup', 'Revised setup'],
    minutes: 15,
    review: ['fill-light'],
  });
})();
