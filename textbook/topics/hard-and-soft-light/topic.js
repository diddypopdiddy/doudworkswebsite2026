(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const captions = ['Sharp cheek shadow', 'Gradual cheek shadow'];
  const frames = [{ id: 'p4-hard-edge' }, { id: 'p4-soft-edge' }];
  H.study({
    slug: 'hard-and-soft-light',
    frames,
    captions,
    hook: [
      'Which shadow changes more gradually from light to dark?',
      ['A', 'B'],
      1,
      'The shadow in B has a wider transition. [[Soft light]] produces a less distinct [[shadow edge]].',
    ],
    objectives: ['Distinguish hard and soft edges.', 'Choose a source size for a shot.'],
    teachTitle: 'Inspect the edge',
    intro: 'Compare the boundary on the shaded cheek.',
    teach:
      'A small apparent source produces [[hard light]]. A large apparent source produces [[soft light]]. [[Diffusion]] spreads light over a wider surface when that surface becomes the source.',
    teachVisual: H.row(
      [{ id: 'p4-source-bulb' }, 'Small bare bulb'],
      [{ id: 'p4-source-diffuser' }, 'Broad diffusion screen'],
      [{ id: 'p4-source-window' }, 'Large nearby window'],
    ),
    activities: [
      H.section(
        'Switch between the shadows',
        'These generated portraits match the subject, camera angle and light direction.',
        H.text('Predict which setup would give a sharp nose shadow, then switch.'),
        { ...H.compare(frames[0], frames[1], ['Hard', 'Soft'], captions), mode: 'divider' },
      ),
      H.section(
        'Change the size of the light',
        'The same light, with and without a softbox.',
        H.text('Put the softbox on and take it off. Watch the edge of the nose shadow each time.'),
        { type: 'studio-room', lesson: 'hard-and-soft-light' },
      ),
    ],
    rounds: [
      [
        'Keep skin shadows gentle in our interview.',
        [0, 1],
        1,
        'Trace the cheek edge.',
        'The blurred edge transitions gradually.',
      ],
      [
        'Give our detective a crisp shadow.',
        [0, 1],
        0,
        'Find the narrowest transition.',
        'A small source gives a defined edge.',
      ],
      [
        'The product label must remain readable across its curved side.',
        [1, 0],
        0,
        'Think about harsh changes across the surface.',
        'A broad source reduces abrupt shadow changes.',
      ],
      [
        'Our cartoon villain needs a sharply drawn shadow.',
        [1, 0],
        1,
        'Look for an abrupt boundary.',
        'The hard edge reads like a drawn shape.',
      ],
    ],
    questions: [
      [
        1,
        'Which source could create this shadow edge?',
        'A large nearby window',
        'A small distant bulb',
        'Look at the width of the edge.',
        'A large apparent source wraps light around the form.',
      ],
      [
        null,
        'Moving a softbox farther away makes it appear what size?',
        'Smaller to the subject',
        'Larger to the subject',
        'Imagine looking toward the box.',
        'Its apparent size shrinks with distance.',
      ],
      [
        null,
        'What makes a sheet useful as diffusion?',
        'It becomes a broad glowing source',
        'It turns the light blue',
        'Consider the visible area emitting light.',
        'A larger glowing area softens shadows.',
      ],
    ],
    remember: [
      '[[Hard light]] gives a sharp [[shadow edge]].',
      '[[Soft light]] gives a gradual [[shadow edge]].',
      '[[Diffusion]] can enlarge the apparent source.',
    ],
    realCamera: 'Compare a small LED with light bounced from a large white wall. Keep the face in place.',
    sketch: 'Draw the difference between a sharp and gradual shadow edge.',
    frameLabels: ['First setup', 'Revised setup'],
  });
})();
