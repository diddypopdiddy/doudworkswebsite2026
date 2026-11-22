/* 3.06 Headroom. Rebuild of Interview Framing Unit 2 (FOUNDATION R). */
(function () {
  const T = Textbook;
  const R = (size, lead, ey) => ({ recipe: [size, lead, ey] });
  const GOOD = R(0.36, 0.64, 0.33);
  const shot = (id, mirror, r, alt) => ({ id, mirror: !!mirror, crop: T.resolveFrame(id, mirror, r, 0.2), alt: alt || 'A seated interview subject.' });

  T.topic({
    slug: 'headroom',
    minutes: 12,
    bigIdea: 'Leave a little space above the head. Not a lot.',
    hook: {
      pair: [ Object.assign(shot('interview-a', false, R(0.30, 0.64, 0.55), 'Lots of empty space above the head.'), { caption: 'Shot 1' }), Object.assign(shot('interview-a', false, R(0.36, 0.64, 0.16), 'The top of the head touches the top of the frame.'), { caption: 'Shot 2' }) ],
      question: 'Both frames feel wrong. What is the problem they share?',
      options: ['The person is too far left', 'The space above the head', 'The person is too small'],
      answer: 1,
      reveal: 'Shot 1 has too much space above the head, so the person sinks. Shot 2 has too little, so they bump the ceiling. That space is called [[headroom]].'
    },
    notes: {
      sketch: 'Sketch the same person three times: too much headroom, too little, and just right.',
      frames: 3, frameLabels: ['Too much', 'Too little', 'Just right'],
      think: 'Why does headroom change every time you zoom in or out?'
    },
    vocab: ['headroom', 'frame-edge', 'crop'],
    review: ['rule-of-thirds', 'close-up'],
    objectives: [
      'Spot too much, too little and just-right headroom.',
      'Fix the headroom after zooming in or out.',
      'Frame a close-up that trims the hair but never the chin.'
    ],
    sections: [
      {
        title: 'Mind the gap',
        intro: '[[Headroom]] is the space between the top of the head and the top of the frame.',
        blocks: [
          { type: 'text', html: '<p>Too much headroom and the person seems to sink to the bottom of the picture. Too little and the head touches the top [[frame edge]], which feels cramped. The fix is almost always the same: put the eyes on the top line of the [[rule of thirds]], and the headroom fixes itself.</p>' },
          { type: 'viewfinder', media: 'interview-a', minFrac: 0.2, frame: R(0.30, 0.64, 0.55), gridToggle: true, guides: 'headroom',
            presets: [ { label: 'Too much', key: 'loose', frame: R(0.30, 0.64, 0.55) }, { label: 'Just right', key: 'good', frame: GOOD }, { label: 'Too little', key: 'tight', frame: R(0.36, 0.64, 0.16) } ],
            states: m => ({ loose: { key: 'loose', title: 'Too much headroom', text: '<p>The person looks small and seems to sink to the bottom of the frame.</p>' }, good: { key: 'good', title: 'Just right', text: '<p>A little space above the head. The eyes sit near the top third line.</p>' }, tight: { key: 'tight', title: 'Too little headroom', text: '<p>The head touches or leaves the top of the frame. It feels cramped.</p>' } })[T.band.headroom(m.headroom)],
            indicators: [
              { label: 'A little space above the head', test: m => T.band.headroom(m.headroom) === 'good' },
              { label: 'Eyes near the top line', test: m => T.band.eyes(m.ey) === 'third' },
              { label: 'Chin in the frame', test: m => m.chinIn }
            ],
            progressLabel: 'Found',
            tasks: [
              { label: 'Find too much headroom', test: m => T.band.headroom(m.headroom) === 'loose' },
              { label: 'Find just-right headroom', test: m => T.band.headroom(m.headroom) === 'good' },
              { label: 'Find too little headroom', test: m => T.band.headroom(m.headroom) === 'tight' }
            ],
            tip: '<p>Watch what happens when you zoom in. The headroom shrinks. Always reframe after you zoom.</p>',
            doneText: '<strong>You found all three.</strong> A quick trick: put the eyes on the top third line and the headroom almost always fixes itself.' }
        ]
      },
      {
        title: 'How is the headroom?',
        intro: 'Six frames. Too much, just right, or too little?',
        blocks: [
          { type: 'quiz', label: 'Spot it', items: [
            { media: shot('interview-a', false, R(0.30, 0.64, 0.55)), q: 'How is the headroom?', options: ['Too much', { text: 'Just right', clue: 'Just right means a small gap above the head, with the eyes near the top line.' }, { text: 'Too little', clue: 'Too little means the head touches or is cut by the top of the frame.' }], answer: 0, explain: 'The top third of the frame is empty, and the person sinks.' },
            { media: shot('interview-a', false, GOOD), q: 'How is the headroom?', options: [{ text: 'Too much', clue: 'Too much means a big empty gap above the head.' }, 'Just right', { text: 'Too little', clue: 'Is the head touching the top?' }], answer: 1, explain: 'A small gap above the head. The eyes are on the top line.' },
            { media: shot('interview-b', false, R(0.36, 0.64, 0.16)), q: 'How is the headroom?', options: [{ text: 'Too much', clue: 'Look at the top edge.' }, { text: 'Just right', clue: 'The hair is touching the frame edge.' }, 'Too little'], answer: 2, explain: 'The hair is touching the top edge. It feels cramped.' },
            { media: shot('interview-b', false, R(0.25, 0.64, 0.31)), q: 'How is the headroom?', options: [{ text: 'Too much', clue: 'It is a wider shot, but look at the gap itself.' }, 'Just right', { text: 'Too little', clue: 'There is space above the head.' }], answer: 1, explain: 'A wider shot, but the gap above the head is still small.' },
            { media: shot('interview-a', true, R(0.22, 0.50, 0.60)), q: 'How is the headroom?', options: ['Too much', { text: 'Just right', clue: 'Half the frame is above the head.' }, { text: 'Too little', clue: 'There is plenty of space up top.' }], answer: 0, explain: 'A classic beginner mistake: the face in the middle and the top half of the frame empty.' },
            { media: shot('interview-b', false, R(0.55, 0.64, 0.36)), q: 'This is a close-up. How is the headroom?', options: [{ text: 'Too much', clue: 'The gap is tiny.' }, 'Just right', { text: 'Too little', clue: 'In a close-up a tiny gap is fine. Is the chin cut?' }], answer: 1, explain: 'In a [[close-up]] you may even trim the hair, but never cut the chin.' }
          ] }
        ]
      },
      {
        title: 'Fix the headroom',
        intro: 'Each shot has a problem. Move and zoom the camera to fix it, then take the shot.',
        blocks: [
          { type: 'framing-challenge', minFrac: 0.2, closing: 'Four frames with the right headroom.', briefs: [
            { media: 'interview-a', start: R(0.30, 0.64, 0.55), tag: 'Headroom', brief: 'Too much empty space up top. Fix the headroom.', judge: m => T.framingCheck(m, ['headroom']), success: 'A small gap above the head. The person no longer sinks.', hint: R(0.30, 0.64, 0.31) },
            { media: 'interview-a', tag: 'Headroom', brief: 'Now zoom in to a chest-up shot. Keep the headroom right.', judge: m => T.framingCheck(m, ['chest', 'headroom']), success: 'Every time you zoom, check the headroom again.', hint: GOOD },
            { media: 'interview-b', start: R(0.36, 0.64, 0.16), tag: 'Headroom', brief: 'The head is hitting the ceiling. Fix it.', judge: m => T.framingCheck(m, ['headroom']), success: 'A little breathing space. Much better.', hint: GOOD },
            { media: 'interview-b', mirror: true, start: 'whole', tag: 'Close-up', brief: 'Close-up. Fill the frame with the face, and keep the chin in.', hint: R(0.55, 0.64, 0.36),
              judge: m => m.size < 0.45 ? 'Zoom in more. The face should fill most of the frame.' : !m.chinIn ? 'The chin is cut off. Never cut the chin. Move the frame down.' : m.headroom > 0.22 ? T.framingMessages.hrLoose : m.headroom < -0.08 ? 'Too much of the head is cut off. Trimming a little hair is fine, but keep the forehead.' : null,
              success: 'In a close-up, a tiny gap or a trimmed hairline is fine. A cut chin never is.' }
          ] },
          { type: 'callout', kind: 'mistake', html: 'If you have to [[crop]] something in a close-up, crop the top of the hair, never the chin. A cut chin looks like a mistake.' }
        ]
      }
    ],
    check: [
      { media: shot('interview-a', true, R(0.22, 0.50, 0.60)), q: 'What is wrong with this frame?', options: ['Too much headroom', { text: 'Too little headroom', clue: 'Look at all the space above the head.' }, { text: 'Nothing', clue: 'The person seems to sink.' }], answer: 0, explain: 'Half the frame is empty above the head.' },
      { q: 'You zoom in on someone. What usually happens to the headroom?', options: ['It shrinks, so you need to reframe', { text: 'It stays the same', clue: 'Zooming changes everything in the frame.' }, { text: 'It always gets bigger', clue: 'Zooming in brings the head closer to the edge.' }], answer: 0, explain: 'Always check the headroom after you zoom.' },
      { q: 'In a close-up, what may you crop?', options: ['A little of the top of the hair', { text: 'The chin', clue: 'Never cut the chin.' }, { text: 'Both eyes', clue: 'The eyes matter most.' }], answer: 0, explain: 'Trim the hair, keep the chin.' },
      { media: shot('interview-b', false, R(0.36, 0.64, 0.16)), q: 'How would you fix this frame?', options: ['Tilt down a little so there is space above the head', { text: 'Zoom in', clue: 'That makes it tighter.' }, { text: 'Move the person to the centre', clue: 'The problem is at the top edge.' }], answer: 0, explain: 'Give the head a little breathing space.' }
    ],
    remember: [
      '[[Headroom]] is the space above the head: a little, not a lot.',
      'Zoomed in? Check the headroom again.',
      'In a close-up, [[crop]] the hair if you must, never the chin.'
    ],
    realCamera: 'Frame a friend from the chest up. Take one photo with too much headroom, one with too little, and one just right. Then zoom in and fix the headroom again.'
  });
})();
