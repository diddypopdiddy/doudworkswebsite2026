/* 3.07 Lead room. Rebuild of Interview Framing Unit 3 (FOUNDATION R), plus a moving-subject example. */
(function () {
  const T = Textbook, D = T.draw;
  const R = (size, lead, ey) => ({ recipe: [size, lead, ey] });
  const GOOD = R(0.36, 0.64, 0.33);
  const shot = (id, mirror, r, alt) => ({ id, mirror: !!mirror, crop: T.resolveFrame(id, mirror, r, 0.2), alt: alt || 'A seated interview subject.' });
  // A walker framed with space ahead or behind (drawn).
  const walker = (x, facing) => D.frame(D.person(x, 70, 1.05, facing, '#3157c8') + (facing === 'right' ? D.arrow(x + 30, 150, x + 80, '#a8442a') : D.arrow(x - 30, 150, x - 80, '#a8442a')));

  T.topic({
    slug: 'lead-room',
    minutes: 12,
    bigIdea: 'Leave space in front of the face or the movement.',
    hook: {
      pair: [ { svg: walker(250, 'right'), alt: 'A person walking right, close to the right edge of the frame.', caption: 'Shot 1' }, { svg: walker(80, 'right'), alt: 'A person walking right, near the left edge with space ahead.', caption: 'Shot 2' } ],
      question: 'The person is walking to the right. In which shot do they look like they’re about to walk into a wall?',
      options: ['Shot 1', 'Shot 2', 'Neither'],
      answer: 0,
      reveal: 'In Shot 1 there is no space ahead, so the frame edge feels like a wall. Shot 2 leaves [[lead room]]: space in front, on the side they move toward.'
    },
    notes: {
      sketch: 'Sketch a person looking screen left with good looking room, and the same person with the space behind them.',
      frames: 2, frameLabels: ['Good looking room', 'Space behind'],
      think: 'A horror film leaves empty space behind a character instead of in front. Why might that feel scary?'
    },
    vocab: ['lead-room', 'looking-room', 'gaze'],
    review: ['rule-of-thirds', 'headroom'],
    objectives: [
      'Spot whether the space is in front of or behind a face.',
      'Frame a person with looking room on the side of their gaze.',
      'Leave lead room ahead of a moving subject.'
    ],
    sections: [
      {
        title: 'Give them room to look',
        intro: 'Viewers follow a person’s [[gaze]] across the frame.',
        blocks: [
          { type: 'text', html: '<p>[[Looking room]] is the empty space in front of a face, on the side the person looks toward. It is a kind of [[lead room]], also called nose room. With space in front, the person looks out into the frame. With the space behind them, they seem squashed against the edge.</p><p>Try the button that turns the subject around: the same frame flips from good to bad.</p>' },
          { type: 'viewfinder', media: 'interview-a', minFrac: 0.2, frame: R(0.36, 0.50, 0.33), gridToggle: true, leadBar: true, mirrorToggle: { label: 'Turn the subject around' },
            badge: m => m.gaze === 'right' ? 'Looking screen right →' : '← Looking screen left',
            presets: [ { label: 'Good', key: 'good', frame: GOOD }, { label: 'Centred', key: 'centred', frame: R(0.36, 0.50, 0.33) }, { label: 'Nose on the edge', key: 'crowded', frame: R(0.36, 0.30, 0.33) } ],
            states: m => ({ crowded: { key: 'crowded', title: 'Space behind the head', text: '<p>The face is close to the edge it looks toward. It feels like they are about to bump into it.</p>' }, centred: { key: 'centred', title: 'Centred', text: '<p>The space is equal on both sides. It is not wrong, but the look has nowhere to go.</p>' }, good: { key: 'good', title: 'Good looking room', text: '<p>Space in front of the face, on the side of the gaze. The person looks out into the frame.</p>' }, far: { key: 'far', title: 'Too far', text: '<p>The back of the head is against the edge. Ease the subject toward the middle.</p>' } })[T.band.lead(m.lead)],
            tasks: [
              { label: 'Give the subject good looking room', test: m => T.band.lead(m.lead) === 'good' },
              { label: 'Turn the subject around and fix the frame again', test: (m, c) => c.mirrored && T.band.lead(m.lead) === 'good' }
            ],
            doneText: '<strong>You fixed it both ways.</strong> The space always goes on the side the person looks toward.' }
        ]
      },
      {
        title: 'Moving subjects need room too',
        intro: 'A moving person needs space to move into.',
        blocks: [
          { type: 'text', html: '<p>When someone walks, runs or rides across the frame, leave [[lead room]] ahead of them. Viewers want to see where they are going. If you are following the movement with the camera, keep the person a little behind the centre, on the side they came from.</p>' },
          { type: 'figure-row', items: [
            { svg: walker(80, 'right'), alt: 'Walking right with space ahead.', caption: '<strong>Lead room.</strong> Space ahead of the movement.' },
            { svg: walker(250, 'right'), alt: 'Walking right with no space ahead.', caption: '<strong>No lead room.</strong> They seem about to hit the edge.' }
          ] },
          { type: 'callout', kind: 'consider', html: 'Leaving space behind someone instead of in front can make viewers feel something is following them. When might a filmmaker want that?' }
        ]
      },
      {
        title: 'Practice: give them room',
        intro: 'Frame each shot with the space in front.',
        blocks: [
          { type: 'framing-challenge', minFrac: 0.2, closing: 'Every frame has the space on the side of the gaze.', briefs: [
            { media: 'interview-a', start: R(0.36, 0.30, 0.33), tag: 'Looking room', brief: 'The empty space is behind the head. Give the subject room to look.', judge: m => T.framingCheck(m, ['lead']), success: 'Space in front of the face. Now they look out into the frame.', hint: GOOD },
            { media: 'interview-b', start: R(0.36, 0.50, 0.33), tag: 'Looking room', brief: 'This person looks the other way. Give them looking room.', judge: m => T.framingCheck(m, ['lead']), success: 'The space follows the gaze, whichever way it points.', hint: GOOD },
            { media: 'interview-a', mirror: true, start: 'whole', tag: 'Interview', brief: 'A full interview frame: chest-up, eyes on the top line, and looking room.', judge: m => T.framingCheck(m, ['chest', 'eyes', 'headroom', 'lead']), success: 'Size, eyes, headroom and looking room. That is a professional interview frame.', hint: GOOD }
          ] }
        ]
      }
    ],
    check: [
      { media: shot('interview-a', false, R(0.36, 0.30, 0.33)), q: 'The person looks screen right. What is wrong?', options: ['The space is behind the head', { text: 'Too much headroom', clue: 'Look at the sides, not the top.' }, { text: 'Nothing', clue: 'Which side is the empty space on?' }], answer: 0, explain: 'The space should be in front of the face, on the right.' },
      { media: shot('interview-b', false, GOOD), q: 'This person looks screen left. Where is the looking room?', options: ['On the left, in front of the face', { text: 'On the right, behind the head', clue: 'Looking room goes on the side of the gaze.' }, { text: 'Above the head', clue: 'That is headroom.' }], answer: 0, explain: 'The space follows the gaze.' },
      { svg: walker(250, 'right'), alt: 'A person walking right near the right edge.', q: 'How would you fix this shot of a person walking right?', options: ['Move the frame so there is space ahead of them', { text: 'Zoom in', clue: 'That makes the space ahead even smaller.' }, { text: 'Put the space behind them', clue: 'Space goes where they are heading.' }], answer: 0, explain: 'Leave lead room ahead of the movement.' },
      { q: 'What is another name for looking room?', options: ['Nose room', { text: 'Headroom', clue: 'Headroom is above the head.' }, { text: 'Depth of field', clue: 'That is about focus.' }], answer: 0, explain: 'Looking room, lead room and nose room all mean space in front.' }
    ],
    remember: [
      '[[Looking room]] is space in front of the face, on the side of the [[gaze]].',
      'A moving subject needs [[lead room]] ahead of the movement.',
      'Turn the subject around and the space has to move too.'
    ],
    realCamera: 'Film a friend walking past the camera twice: once with space ahead of them and once with them near the front edge. Watch both. Which feels like they are going somewhere?'
  });
})();
