/* 3.08 Camera height and angles. Drawings stand in for the one-subject, five-angle photo set (specs/PART3-SHOT-LIST.md P1). */
(function () {
  const T = Textbook, D = T.draw;
  const side = k => '<div class="mini-diagram">' + D.angleSide(k) + '</div>';
  const A = (k, alt, label, clue) => ({ media: 'p3-angle-' + k, alt, label, clue });

  T.topic({
    slug: 'camera-height-and-angles',
    minutes: 12,
    bigIdea: 'Where the camera stands changes how we see the subject.',
    hook: {
      pair: [ { media: 'p3-angle-high', alt: 'The person seen from above, looking small against the floor.', caption: 'Shot 1' }, { media: 'p3-angle-low', alt: 'The person seen from below, looking tall against the sky.', caption: 'Shot 2' } ],
      question: 'Same person. In which shot do they seem stronger?',
      options: ['Shot 1', 'Shot 2', 'They seem the same'],
      answer: 1,
      reveal: 'Shot 2 is a [[low angle]]: the camera looks up, so the person seems big and strong. Shot 1 is a [[high angle]]: looking down makes them seem small. Nothing changed but where the camera stood.'
    },
    notes: {
      sketch: 'Sketch the same person from a high angle and a low angle. Add an arrow showing where the camera is.',
      frames: 2, frameLabels: ['High angle', 'Low angle'],
      think: 'Why do most interviews use eye level instead of a high or low angle?'
    },
    vocab: ['eye-level', 'high-angle', 'low-angle', 'birds-eye-view', 'dutch-angle'],
    review: ['framing'],
    objectives: [
      'Name eye level, high angle, low angle, bird’s-eye view and Dutch angle.',
      'Explain how each angle changes how viewers see the subject.',
      'Choose the angle that fits a moment.'
    ],
    sections: [
      {
        title: 'Five places to put the camera',
        intro: 'Slide through the angles. The person stays the same; only the camera moves.',
        blocks: [
          { type: 'text', html: '<p>Most shots are filmed at [[eye level]]: the camera at the height of the subject’s eyes. It feels neutral and honest. Raise the camera and point down for a [[high angle]]; lower it and point up for a [[low angle]]. Go straight overhead for a [[bird’s-eye view|birds-eye-view]], or tilt the camera sideways for a [[Dutch angle|dutch-angle]].</p>' },
          { type: 'slider-demo', label: 'Camera angle', noteLabel: 'Angle', ends: ['Eye level', 'Dutch'], stops: [
            { label: 'Eye level', media: 'p3-angle-eye', alt: 'The person at eye level.', note: '<p>Neutral and honest. Viewers feel equal to the person. Use it for interviews and most conversation.</p>' + side('eye') },
            { label: 'High angle', media: 'p3-angle-high', alt: 'The person from above.', note: '<p>The camera looks down. The person can seem small, weak or alone.</p>' + side('high') },
            { label: 'Low angle', media: 'p3-angle-low', alt: 'The person from below.', note: '<p>The camera looks up. The person can seem big, strong or in charge.</p>' + side('low') },
            { label: 'Bird’s-eye view', media: 'p3-angle-bird', alt: 'The person from directly above.', note: '<p>Straight down, like a map. Great for showing a layout: a table, a game board, a crowd.</p>' + side('bird') },
            { label: 'Dutch angle', media: 'p3-angle-dutch', alt: 'The person with the frame tilted.', note: '<p>The camera tilts sideways, so the floor slants. It feels uneasy or off balance.</p>' + side('dutch') }
          ] }
        ]
      },
      {
        title: 'Angles tell viewers how to feel',
        intro: 'Pick the angle for a reason.',
        blocks: [
          { type: 'text', html: '<p>A [[low angle]] on a team captain makes them look like a leader. A [[high angle]] on a lost student makes them look small in a big world. A [[Dutch angle|dutch-angle]] says something is wrong.</p><p>Use them on purpose and not too often. If every shot is tilted, the effect stops working.</p>' },
          { type: 'figure-row', items: [
            { media: 'p3-angle-low', alt: 'Low angle.', caption: '<strong>Low angle.</strong> Strong, in charge.' },
            { media: 'p3-angle-high', alt: 'High angle.', caption: '<strong>High angle.</strong> Small, alone.' },
            { media: 'p3-angle-dutch', alt: 'Dutch angle.', caption: '<strong>Dutch angle.</strong> Uneasy.' }
          ] },
          { type: 'callout', kind: 'mistake', html: 'Filming a seated person while you stand makes an accidental high angle. Lower the camera to their eye level.' }
        ]
      },
      {
        title: 'Practice: pick the angle',
        intro: 'The director wants a feeling. Choose the angle that gives it.',
        blocks: [
          { type: 'picture-choice', closing: 'Where the camera stands is a choice. Make it on purpose.', rounds: [
            { prompt: 'Introduce the team captain as a strong leader.', options: [ A('high', 'High angle.', 'High angle', 'Looking down makes them seem smaller.'), A('low', 'Low angle.', 'Low angle'), A('bird', 'Bird’s-eye view.', 'Bird’s-eye', 'From straight above you can’t see their face.') ], answer: 1, explain: 'Looking up makes the captain seem big and strong.' },
            { prompt: 'Show the layout of a game board on a table.', options: [ A('eye', 'Eye level.', 'Eye level', 'From the side you can’t see the whole board.'), A('dutch', 'Dutch angle.', 'Dutch angle', 'Tilting doesn’t show the layout.'), A('bird', 'Bird’s-eye view.', 'Bird’s-eye') ], answer: 2, explain: 'Straight down shows the whole layout like a map.' },
            { prompt: 'A sit-down interview where viewers should trust the person.', options: [ A('eye', 'Eye level.', 'Eye level'), A('low', 'Low angle.', 'Low angle', 'This can feel like the person is towering over viewers.'), A('high', 'High angle.', 'High angle', 'Looking down makes the person seem smaller.') ], answer: 0, explain: 'Eye level is neutral and honest.' },
            { prompt: 'A dream scene where something feels wrong.', options: [ A('eye', 'Eye level.', 'Eye level', 'Eye level feels normal.'), A('dutch', 'Dutch angle.', 'Dutch angle'), A('bird', 'Bird’s-eye view.', 'Bird’s-eye', 'This shows a layout, not a feeling.') ], answer: 1, explain: 'A tilted frame feels off balance.' }
          ] }
        ]
      },
      {
        id: 'studio-practice', title: 'Try it in the studio',
        intro: 'Raise and lower one camera.',
        blocks: [
          { type: 'text', html: '<p>Change the height of the tripod and watch what happens to the face on the monitor.</p>' },
          { type: 'studio-room', lesson: 'camera-height-and-angles' }
        ]
      }
    ],
    check: [
      { media: 'p3-angle-low', alt: 'The person seen from below.', q: 'What angle is this?', options: ['Low angle', { text: 'High angle', clue: 'Is the camera looking down or up?' }, { text: 'Eye level', clue: 'We see the sky behind the person.' }], answer: 0, explain: 'The camera looks up.' },
      { q: 'How does a high angle often make a subject seem?', options: ['Small or weak', { text: 'Strong and in charge', clue: 'That is a low angle.' }, { text: 'Exactly the same as eye level', clue: 'Looking down changes how they seem.' }], answer: 0, explain: 'Looking down makes people seem smaller.' },
      { media: 'p3-angle-dutch', alt: 'A tilted frame.', q: 'What feeling does this angle usually give?', options: ['Uneasy, off balance', { text: 'Calm and neutral', clue: 'The floor is slanted.' }, { text: 'A map-like view', clue: 'That is a bird’s-eye view.' }], answer: 0, explain: 'A Dutch angle tilts the frame.' },
      { q: 'You stand and film a friend sitting down. What angle did you make by accident?', options: ['A high angle', { text: 'A low angle', clue: 'You are above them.' }, { text: 'A Dutch angle', clue: 'Is the camera tilted sideways?' }], answer: 0, explain: 'Lower the camera to their eye level.' }
    ],
    remember: [
      '[[Eye level]] is neutral; a [[high angle]] makes people seem small; a [[low angle]] makes them seem strong.',
      'A [[bird’s-eye view|birds-eye-view]] shows a layout; a [[Dutch angle|dutch-angle]] feels uneasy.',
      'Choose the angle on purpose, for a reason.'
    ],
    realCamera: 'Photograph a friend five ways without changing the zoom: eye level, high angle, low angle, straight down and tilted. Which one changes how they seem the most?'
  });
})();
