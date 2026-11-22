(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const captions = ['Pole behind head', 'Clear wall', 'Bright window', 'Clutter', 'Close to wall'];
  const frames = ['pole', 'clean', 'window', 'clutter', 'wall'].map((bg) => ({ id: 'p4-bg-' + bg }));
  H.study({
    slug: 'backgrounds',
    frames,
    captions,
    hook: [
      'What appears to grow out of the head in A?',
      ['A pole', 'A microphone'],
      0,
      'The pole merges with the head. This [[background]] detail becomes a [[distraction]] even when the face is sharp.',
    ],
    objectives: [
      'Identify distractions near the head.',
      'Change camera or subject position to create separation.',
    ],
    teachTitle: 'Scan behind the subject',
    intro: 'Check the edges of the head and the brightest background object.',
    teach:
      'A pole can merge with a head. A bright window or busy noticeboard can steal attention. Create [[separation]] by moving the subject forward from the wall.',
    practice: [
      {
        type: 'quick-check',
        ...H.q(
          frames[0],
          'You cannot move the pole. Which single change removes the merger?',
          'Step sideways and reframe',
          'Open the microphone menu',
          'Trace the line through the head.',
          'Changing camera position moves the pole away from the outline.',
        ),
      },
    ],
    activities: [
      H.section(
        'Inspect four background problems',
        'Different distractions call for different fixes.',
        H.text('View a pole, window, clutter and wall shadow before choosing a new position.'),
        H.slider(
          'Background',
          [0, 2, 3, 4].map((i) => [
            frames[i],
            captions[i],
            [
              'The line touches the hair.',
              '',
              'The window attracts the eye.',
              'Small shapes compete with the face.',
              'The subject casts a hard wall shadow.',
            ][i],
          ]),
        ),
      ),
    ],
    rounds: [
      [
        'Give the speaker an uninterrupted outline.',
        [0, 1],
        1,
        'Trace the top of the hair.',
        'The clear wall separates the head from the pole.',
      ],
      [
        'Keep the window from drawing viewers away.',
        [1, 2],
        0,
        'Find the brightest area.',
        'The pale wall avoids a competing window.',
      ],
      [
        'Choose the quieter setup for an interview beside a noticeboard.',
        [3, 1],
        1,
        'Count competing colored rectangles.',
        'Fewer competing shapes keep attention on the face.',
      ],
    ],
    questions: [
      [
        0,
        'Which quick change separates the line from the head?',
        'Step sideways and reframe',
        'Increase microphone gain',
        'Watch where the pole falls.',
        'A new angle moves the pole off the outline.',
      ],
      [
        4,
        'Which change helps this wall shadow?',
        'Move the subject forward',
        'Press the subject against the wall',
        'Inspect the outline on the wall.',
        'More distance separates the wall and subject.',
      ],
      [
        2,
        'What competes with the face?',
        'The bright window',
        'The person’s shirt seam',
        'Look for the brightest patch.',
        'The window attracts attention.',
      ],
    ],
    remember: [
      'Check the [[background]] before recording.',
      'A small [[distraction]] can touch the head.',
      'Distance from the wall improves [[separation]].',
    ],
    realCamera: 'Take two interview photos in the classroom. Remove one visible distraction in the second.',
    sketch: 'Show how one camera move removes a background merger.',
    frameLabels: ['First setup', 'Revised setup'],
    review: ['background'],
  });
})();
