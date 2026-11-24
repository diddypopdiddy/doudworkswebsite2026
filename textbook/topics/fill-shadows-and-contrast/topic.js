(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const captions = ['No fill', 'Low fill', 'Middle fill', 'High fill', 'Full fill'];
  const frames = ['none', 'low', 'middle', 'high', 'full'].map((level) => ({ id: 'p4-fill-' + level }));
  H.study({
    slug: 'fill-shadows-and-contrast',
    frames,
    captions,
    hook: [
      'Which frame lets you see more of the shaded cheek?',
      ['A', 'B'],
      1,
      'The key stays on the same side. [[Fill light]] brings the dark cheek closer to the lit cheek.',
    ],
    objectives: [
      'Read contrast from cheek-to-cheek brightness.',
      'Use a reflector to control shadow detail.',
    ],
    teachTitle: 'Return light to the dark side',
    intro: 'Watch the shadow cheek while the key stays in place.',
    teach:
      'A white card or wall can act as a [[reflector]]. Its [[bounce light]] becomes [[fill light]]. More fill reduces the [[contrast]] between the two cheeks.',
    teachVisual: H.fig({ id: 'p4-source-bounce' }, 'The white card on the shadow side bounces some of the key light back toward the face.'),
    activities: [
      H.section(
        'Move the reflector',
        'Fill changes the shadow side while the key continues to shape the face.',
        H.text('Slide from no fill to full fill without moving the key.'),
        H.slider(
          'Fill strength',
          frames.map((ref, i) => [
            ref,
            captions[i],
            [
              'Deep cheek shadow.',
              'The shadow begins to open.',
              'Texture returns without losing shape.',
              'Both cheeks approach the same brightness.',
              'There is little difference between cheeks.',
            ][i],
          ]),
        ),
      ),
      H.section(
        'Set the fill yourself',
        'The key stays put. The fill is yours.',
        H.text('Add the fill light, then use its dimmer to choose how dark the shadow side gets.'),
        { type: 'studio-room', lesson: 'fill-shadows-and-contrast' },
      ),
    ],
    rounds: [
      [
        'Keep our mystery guest mostly in shadow.',
        [0, 4],
        0,
        'Compare the gap between cheeks.',
        'Low fill preserves a deep shadow.',
      ],
      [
        'Keep some shape but reveal the cheek for a natural interview.',
        [0, 2],
        1,
        'Seek detail along with a remaining difference.',
        'Middle fill preserves shape and detail.',
      ],
      [
        'Give the news host even, flat light.',
        [1, 4],
        1,
        'Look for nearly equal cheek brightness.',
        'High fill reduces contrast.',
      ],
    ],
    questions: [
      [
        0,
        'Where should white card go to reveal the shadow cheek?',
        'On the shadow side facing the key',
        'Behind the camera facing away from the key',
        'Trace where light must bounce.',
        'The card redirects the key toward the dark cheek.',
      ],
      [
        4,
        'What happened to the contrast?',
        'The difference between cheeks fell',
        'Both cheeks became dark',
        'Compare the bright and shadow sides.',
        'Added fill reduces the difference.',
      ],
      [
        null,
        'How could you keep more shadow with the same card?',
        'Move the card farther from the face',
        'Move the card closer',
        'Compare how much light the card can return.',
        'Moving it back reduces the bounced light.',
      ],
    ],
    remember: [
      'A [[reflector]] redirects existing light.',
      '[[Bounce light]] can provide [[fill light]].',
      'Increasing [[fill light]] reduces [[contrast]].',
    ],
    realCamera: 'Photograph a face in window light. Add white card on the shadow side and compare.',
    sketch: 'Mark the key, reflector and shadow cheek.',
    frameLabels: ['First setup', 'Revised setup'],
    hookMedia: H.pair(frames[0], frames[4]),
  });
})();
