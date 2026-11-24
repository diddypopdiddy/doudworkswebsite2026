(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const captions = ['Front', 'Side', 'Top', 'Under', 'Back'];
  const directions = ['front', 'side', 'top', 'under', 'back'];
  const frames = directions.map((direction) => ({ id: 'p4-dir-' + direction }));
  H.study({
    slug: 'light-direction',
    frames,
    captions,
    hook: [
      'Which face has a deeper shadow on one cheek?',
      ['A', 'B'],
      1,
      'One cheek drops into shadow in B. [[Side light]] makes a face look more sculpted.',
    ],
    objectives: ['Identify a light direction from a shadow.', 'Place a light for a requested mood.'],
    teachTitle: 'Read the shadow',
    intro: 'The shadow falls away from the source.',
    teach:
      '[[Front light]] lights both cheeks evenly. [[Side light]] shapes one cheek. [[Backlight]] can leave a [[silhouette]] when no light reaches the front.',
    activities: [
      H.section(
        'Move the lamp',
        'The same face can change shape when the lamp moves.',
        H.text('Compare where the shadows fall in the five portraits. The diagram beside each portrait shows where the lamp sits.'),
        H.slider(
          'Light direction',
          frames.map((ref, i) => [
            ref,
            captions[i],
            [
              'The light faces the subject.',
              'One cheek faces away.',
              'The eye sockets darken.',
              'The brow is dark above a lit chin.',
              'The outline survives even when facial detail disappears.',
            ][i] + '<div class="mini-diagram">' + H.directionMap(directions[i]) + '</div>',
          ]),
        ),
      ),
      H.section(
        'Move the light yourself',
        'One light and five places to put it.',
        H.text('Drag the light to each place in the studio. After every move, find the shadow on the monitor.'),
        { type: 'studio-room', lesson: 'light-direction' },
      ),
    ],
    rounds: [
      [
        'Make both eyes easy to read for a friendly introduction.',
        [0, 4],
        0,
        'Look for visible features.',
        'Front light shows both cheeks.',
      ],
      [
        'Give the mystery interview a strong shadow across one side.',
        [0, 1],
        1,
        'Look for a single dark cheek.',
        'Side light divides the face.',
      ],
      [
        'The campfire storyteller holds a flashlight below the chin.',
        [2, 3],
        1,
        'Which half of the face catches the light?',
        'Underlight brightens the chin.',
      ],
      [
        'Hide the runner’s identity but show their outline.',
        [4, 0],
        0,
        'Can you read the eyes?',
        'The lamp behind the subject lights the outline and leaves the face dark.',
      ],
    ],
    questions: [
      [
        4,
        'Why is the outline clearer than the eyes?',
        'The source is behind the subject',
        'The source is below the chin',
        'Inspect the rim.',
        'Backlight catches the outline.',
      ],
      [
        2,
        'Which source would produce dark eye sockets?',
        'A lamp overhead',
        'A lamp near the lens',
        'Trace the shadow under the brow.',
        'Top light casts shadows downward.',
      ],
      [
        null,
        'How could a side-lit host look friendlier while keeping the same lamp?',
        'Move the lamp toward the camera axis',
        'Move it behind the chair',
        'Think about which cheeks receive light.',
        'Moving the lamp forward shows both cheeks.',
      ],
    ],
    remember: [
      '[[Front light]] makes faces easy to read.',
      '[[Side light]] gives a cheek shadow.',
      '[[Backlight]] can form a [[silhouette]].',
    ],
    realCamera: 'Use a phone flashlight from five directions. Keep the camera and subject still.',
    sketch: 'Draw a light and its matching shadow on a face.',
    frameLabels: ['First setup', 'Revised setup'],
  });
})();
