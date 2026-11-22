/* 3.05 Rule of thirds. Rebuild of Interview Framing Unit 1 (FOUNDATION R): frames are recipes worked out from photo landmarks. */
(function () {
  const T = Textbook;
  const R = (size, lead, ey) => ({ recipe: [size, lead, ey] });
  const GOOD = R(0.36, 0.64, 0.33);
  // A fixed crop of an interview photo for quizzes and figures.
  const shot = (id, mirror, r, alt) => ({ id, mirror: !!mirror, crop: T.resolveFrame(id, mirror, r, 0.2), alt: alt || 'A seated interview subject.' });

  T.topic({
    slug: 'rule-of-thirds',
    minutes: 15,
    bigIdea: 'Put the eyes on the top line.',
    hook: {
      pair: [ Object.assign(shot('interview-a', false, R(0.30, 0.50, 0.50), 'The subject’s face is in the exact middle of the frame.'), { caption: 'Shot 1' }), Object.assign(shot('interview-a', false, GOOD, 'The subject sits to one side with the eyes high in the frame.'), { caption: 'Shot 2' }) ],
      question: 'Same person, same chair. Which frame looks more like a professional interview?',
      options: ['Shot 1', 'Shot 2', 'They look the same'],
      answer: 1,
      reveal: 'In Shot 2 the eyes sit on the top line of an imaginary grid and the person is off to one side. That is the [[rule of thirds]]. Shot 1 puts the face dead centre, which looks like a school photo.'
    },
    notes: {
      sketch: 'Draw a frame with the thirds grid. Sketch a person with their eyes on the top line and their body on a side line. Circle the power point.',
      frames: 1, frameLabels: ['On the thirds'],
      think: 'A news anchor is usually centred. Why might that break the rule on purpose?'
    },
    vocab: ['rule-of-thirds', 'thirds-grid', 'power-point', 'eye-position'],
    review: ['framing'],
    objectives: [
      'Spot whether a frame uses the rule of thirds.',
      'Frame a person with the eyes on the top line.',
      'Put a person on a power point, with or without the grid.'
    ],
    sections: [
      {
        title: 'Turn on the grid',
        intro: 'The [[thirds grid]] splits the frame into nine equal boxes.',
        blocks: [
          { type: 'text', html: '<p>The [[rule of thirds]] says: put the important things on the lines, not in the middle. For a person, that means the eyes. Their [[eye position]] should sit on the top line. The four places where the lines cross are [[power points|power-point]]: viewers look there first.</p>' },
          { type: 'viewfinder', media: 'interview-a', minFrac: 0.2, frame: R(0.30, 0.50, 0.50), grid: true, gridToggle: true, guides: 'power',
            presets: [ { label: 'Dead centre', key: 'centre', frame: R(0.30, 0.50, 0.50) }, { label: 'On the thirds', key: 'thirds', frame: GOOD }, { label: 'Too low', key: 'off', frame: R(0.30, 0.64, 0.62) } ],
            states: m => T.band.power(m) ? { key: 'thirds', title: 'On the thirds', text: '<p>Eyes on the top line, body on a side line. This is how most interviews are framed.</p>' }
              : T.band.centre(m) ? { key: 'centre', title: 'Dead centre', text: '<p>The subject sits in the middle. It works, but it looks like a school photo.</p>' }
              : { key: 'off', title: 'Off the lines', text: '<p>Slide the picture until the eyes sit on the top line.</p>' },
            indicators: [
              { label: 'Eyes on the top line', test: m => T.band.eyes(m.ey) === 'third' },
              { label: 'Subject on a side line', test: m => T.band.side(m.ex) },
              { label: 'On a power point', test: m => T.band.power(m) }
            ],
            tasks: [
              { label: 'Put the eyes on the top line', test: m => T.band.eyes(m.ey) === 'third' },
              { label: 'Land on a power point', test: m => T.band.power(m) },
              { label: 'Turn the grid off and land on a power point again', test: (m, c) => !c.grid && T.band.power(m) }
            ],
            doneText: '<strong>You found the thirds without the grid.</strong> Camera operators imagine these lines on every shot.' }
        ]
      },
      {
        title: 'Thirds or not?',
        intro: 'Six frames. Decide how each one is framed.',
        blocks: [
          { type: 'quiz', label: 'Spot it', items: [
            { media: shot('interview-a', false, GOOD), q: 'How is this frame composed?', options: ['On the thirds', { text: 'Dead centre', clue: 'Dead centre means the eyes are in the middle of the frame.' }, { text: 'Off the lines', clue: 'Off the lines means the eyes are not near any line.' }], answer: 0, explain: 'The eyes sit where the top line and a side line cross.' },
            { media: shot('interview-a', false, R(0.30, 0.50, 0.50)), q: 'How is this frame composed?', options: [{ text: 'On the thirds', clue: 'On the thirds means the eyes sit on the top line, with the person on a side line.' }, 'Dead centre', { text: 'Off the lines', clue: 'Off the lines means the eyes are not near any line. Here they sit in the middle.' }], answer: 1, explain: 'The eyes are right in the middle. Half the frame above them is wasted.' },
            { media: shot('interview-b', false, GOOD), q: 'How is this frame composed?', options: ['On the thirds', { text: 'Dead centre', clue: 'Is the face in the exact middle?' }, { text: 'Off the lines', clue: 'Look at where the eyes sit.' }], answer: 0, explain: 'A different person, the same idea: eyes on the top line, body to one side.' },
            { media: shot('interview-a', false, R(0.30, 0.64, 0.62)), q: 'How is this frame composed?', options: [{ text: 'On the thirds', clue: 'Are the eyes on the top line?' }, { text: 'Dead centre', clue: 'The eyes are below the middle.' }, 'Off the lines'], answer: 2, explain: 'The eyes are low in the frame, far from the top line.' },
            { media: shot('interview-b', true, R(0.25, 0.50, 0.50)), q: 'How is this frame composed?', options: [{ text: 'On the thirds', clue: 'Is the person on a side line?' }, 'Dead centre', { text: 'Off the lines', clue: 'The eyes are in the exact middle.' }], answer: 1, explain: 'A wider shot, but the eyes are still in the exact middle.' },
            { media: shot('interview-b', false, R(0.48, 0.66, 0.31)), q: 'How is this frame composed?', options: ['On the thirds', { text: 'Dead centre', clue: 'The face is off to one side.' }, { text: 'Off the lines', clue: 'Check the top line.' }], answer: 0, explain: 'A tighter shot. The eyes still sit on the top line.' }
          ] }
        ]
      },
      {
        title: 'Now you frame it',
        intro: 'The director tells you what they want. Move and zoom the camera, then take the shot.',
        blocks: [
          { type: 'framing-challenge', minFrac: 0.2, closing: 'Four frames on the thirds. Two of them without the grid.', briefs: [
            { media: 'interview-a', start: R(0.30, 0.50, 0.50), grid: true, gridToggle: true, tag: 'Thirds', brief: 'Put the eyes on the top line.', judge: m => T.framingCheck(m, ['eyes']), success: 'Eyes on the top line. That one move fixes most bad framing.', hint: R(0.30, 0.50, 0.33) },
            { media: 'interview-a', grid: true, gridToggle: true, tag: 'Thirds', brief: 'Now slide the subject off centre, onto a side line. Keep the eyes on the top line.', judge: m => T.framingCheck(m, ['eyes', 'side']), success: 'That is a [[power point]]: the place where two lines cross.', hint: GOOD },
            { media: 'interview-b', start: R(0.22, 0.50, 0.55), tag: 'Thirds', brief: 'New person, and the grid is gone. Put the eyes on a power point.', judge: m => T.framingCheck(m, ['eyes', 'side']), success: 'You found it without the grid. Real cameras don’t always show one.', hint: GOOD },
            { media: 'interview-b', mirror: true, start: 'whole', tag: 'Thirds', brief: 'Closer this time: a chest-up shot, with the eyes on a power point.', judge: m => T.framingCheck(m, ['chest', 'eyes', 'side']), success: 'Chest-up, eyes on a power point. That is a classic interview frame.', hint: GOOD }
          ] },
          { type: 'callout', kind: 'try', html: 'Turn on the grid in your phone’s camera settings. It is usually called “Grid” under Camera.' }
        ]
      }
    ],
    check: [
      { media: shot('interview-b', false, GOOD), q: 'Where are the subject’s eyes?', options: ['On the top line of the thirds grid', { text: 'In the exact centre', clue: 'Picture the grid: two lines across.' }, { text: 'Near the bottom of the frame', clue: 'Look higher.' }], answer: 0, explain: 'Eyes on the top line, body on a side line.' },
      { q: 'What is a power point?', options: ['A place where two grid lines cross', { text: 'The middle of the frame', clue: 'The rule of thirds avoids the middle.' }, { text: 'A button on the camera', clue: 'It is a spot in the frame.' }], answer: 0, explain: 'Viewers look at the four crossings first.' },
      { media: shot('interview-a', false, R(0.30, 0.64, 0.62)), q: 'What is the quickest fix for this frame?', options: ['Raise the eyes to the top line', { text: 'Zoom out', clue: 'The problem is where the eyes are, not the size.' }, { text: 'Move the subject to the centre', clue: 'Centred looks stiff.' }], answer: 0, explain: 'The eyes are too low.' },
      { q: 'How many boxes does the thirds grid make?', options: ['Nine', { text: 'Three', clue: 'Two lines across and two lines down.' }, { text: 'Four', clue: 'Four is the number of crossings.' }], answer: 0, explain: 'Two lines across, two lines down: nine boxes.' }
    ],
    remember: [
      'The [[thirds grid]] splits the frame into nine boxes.',
      'For a person, put the [[eye position]] on the top line.',
      'The [[rule of thirds]] is a starting point, not a law.'
    ],
    realCamera: 'Turn on your phone’s grid. Take three photos of a friend: one dead centre, one with the eyes on the top line, and one on a power point. Which looks best?'
  });
})();
