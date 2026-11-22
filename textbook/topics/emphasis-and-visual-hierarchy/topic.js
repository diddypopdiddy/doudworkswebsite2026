(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const frames = ['poster', 'book', 'lines'].map((layout) => ({ id: 'p4-emphasis-' + layout }));
  H.study({
    slug: 'emphasis-and-visual-hierarchy',
    frames: frames,
    captions: ['Poster competes with book', 'Book at line intersection', 'Lines converge'],
    hook: [
      'Where did your eye go first in A?',
      ['The sign', 'The book'],
      null,
      'The bright sign competes with the book. A [[focal point]] is the first place the design asks viewers to look.',
    ],
    objectives: ['Identify the intended focal point.', 'Use contrast or lines to direct attention.'],
    teachTitle: 'Choose what viewers notice first',
    intro: 'In a story about a hidden note, the book must win attention.',
    teach:
      '[[Emphasis]] gives one element priority. [[Visual hierarchy]] orders the rest. [[Leading lines]] can guide the eye toward the clue.',
    activities: [
      H.section(
        'Trace the lines',
        'The hallway edges meet near the intended clue.',
        H.text('Tap the hallway edges and book. Toggle guides to see where they converge.'),
        {
          type: 'hotspots',
          ...frames[1],
          points: [
            { x: 28, y: 81, label: 'Edges', text: 'The edges lead inward.' },
            { x: 50, y: 64, label: 'Book', text: 'The colored book sits at the convergence.' },
          ],
          overlay: H.guides(
            [
              [63, 0, 160, 110],
              [56, 180, 160, 110],
              [254, 0, 160, 110],
              [262, 180, 160, 110],
            ],
            'Guides converge on the book',
          ),
          overlayLabel: 'Toggle leading lines',
        },
      ),
    ],
    rounds: [
      [
        'Let viewers find the clue before seeing the poster.',
        [0, 1],
        1,
        'Look for the strongest color contrast.',
        'The book stands out after the poster is removed.',
      ],
      [
        'Choose a frame where the hallway lines land on the clue.',
        [1, 0],
        0,
        'Extend the visible edges.',
        'The hallway edges converge on the book.',
      ],
      [
        'Show why a bright sign would spoil the reveal.',
        [1, 0],
        1,
        'Identify the first thing your eye visits.',
        'The sign claims attention before the clue.',
      ],
    ],
    questions: [
      [
        1,
        'What works together to emphasize the book?',
        'Converging lines and a color accent',
        'A bright poster and a deep shadow',
        'Trace the edges toward the center.',
        'The lines guide your eye toward the orange book.',
      ],
      [
        0,
        'Which change would improve the hierarchy?',
        'Simplify the bright sign',
        'Make the sign brighter',
        'Compare the intended clue against the sign.',
        'Reducing competition gives the book priority.',
      ],
      [
        null,
        'How can a director test a planned focal point?',
        'Ask a viewer what they noticed first',
        'Tell the viewer where to look before showing the frame',
        'Preserve the first reaction.',
        'The first response reveals the actual visual hierarchy.',
      ],
    ],
    remember: [
      '[[Emphasis]] strengthens the [[focal point]].',
      '[[Leading lines]] guide the eye.',
      '[[Visual hierarchy]] orders the rest of the frame.',
    ],
    realCamera: 'Photograph a friend where hallway lines meet. Ask someone what they noticed first.',
    sketch: 'Draw lines ending at a focal point.',
    frameLabels: ['First setup', 'Revised setup'],
  });
})();
