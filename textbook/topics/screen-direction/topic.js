/* 6.02 Screen direction. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;
  const walk = [1.4, 5.6], room = [1.4, T.time('room-wide', 'sit', 0.5)];
  const a = T.lookCrop('interview-a', false), b = T.lookCrop('interview-b', false), bFlip = T.lookCrop('interview-b', true);

  T.topic({
    slug: 'screen-direction',
    minutes: 15,
    bigIdea: 'Pick a side before you record. Then stick to it.',
    hook: {
      sequence: [T.seg('hall-walk', walk[0], walk[1]), T.seg('room-wide', room[0], room[1], true)],
      question: 'The person walks out of the hallway and into the room. What seems to happen between the two shots?',
      options: ['They keep walking the same way', 'They turn around', 'They stop and wait'],
      answer: 1,
      reveal: 'They exit on screen right, then enter from screen right, so it looks like they turned around. Nothing changed in the walk; only the direction on screen did.'
    },
    notes: {
      sketch: 'A friend exits Shot 1 on screen right. Sketch Shot 2 so they keep moving the same way. Draw an arrow for the direction.',
      frames: 2, frameLabels: ['Shot 1: exits screen right', 'Shot 2'],
      think: 'Two people will be interviewed separately and cut together as two sides of an argument. Where should each interviewer sit, and why?'
    },
    vocab: ['screen-direction', 'screen-left', 'screen-right', 'direction-flip'],
    review: ['cut', 'wide-shot'],
    objectives: [
      'Name the [[screen direction]] of a person moving or looking.',
      'Spot a [[direction flip]] across a cut.',
      'Set up two interviews so the people face each other.'
    ],
    sections: [
      {
        title: 'Left and right belong to the viewer',
        intro: 'Directions on screen are always the viewer’s directions.',
        blocks: [
          { type: 'text', html: '<p>[[Screen direction]] is the way a person moves or faces on screen. [[Screen left]] is the left side of the picture as the viewer sees it. [[Screen right]] is the right side.</p><p>Viewers use screen direction to keep track of where things are. If a person walks toward screen right, viewers expect them to keep going that way.</p>' },
          { type: 'figure-row', items: [
            { media: 'still-hall-mid', caption: '<strong>Moving screen right.</strong>' },
            { media: 'still-hall-mid-flip', caption: '<strong>Moving screen left.</strong>' }
          ] },
          { type: 'callout', kind: 'mistake', html: 'Screen left is the viewer’s left, not the actor’s left. An actor facing the camera has their own left on screen right.' }
        ]
      },
      {
        title: 'Keep them moving the same way',
        intro: 'A walk that continues across a cut should keep its direction.',
        blocks: [
          { type: 'sequence-compare', prompt: 'Play each version. Watch which way the person walks out of the hallway and into the room.',
            predict: { q: 'One of these versions will look like the person turned around. Which one?', options: ['Same direction', 'Direction flip', 'Both reversed'] },
            versions: [
              { label: 'Same direction', note: 'Out of the hallway on screen right, into the room from screen left. The walk carries on.', segments: [T.seg('hall-walk', walk[0], walk[1]), T.seg('room-wide', room[0], room[1])] },
              { label: 'Direction flip', note: 'Out on screen right, then in from screen right. It looks like the person turned around. This is a [[direction flip]].', segments: [T.seg('hall-walk', walk[0], walk[1]), T.seg('room-wide', room[0], room[1], true)] },
              { label: 'Both reversed', note: 'Out on screen left, in from screen right. Everything is reversed, but the walk still carries on, so it works.', segments: [T.seg('hall-walk', walk[0], walk[1], true), T.seg('room-wide', room[0], room[1], true)] }
            ] },
          { type: 'video-segments', media: 'direction-walk-set', label: 'Three shots of one walk', caption: 'Shots A and B keep the direction. Shot C was filmed from the other side.' }
        ]
      },
      {
        title: 'Where does the interviewer sit?',
        intro: 'In an interview, the person looks at the interviewer, so the interviewer’s chair sets the screen direction.',
        blocks: [
          { type: 'interviewer-seat', prompt: 'Two interviews will be cut together. Choose where each interviewer sits, then preview the cut.',
            interviews: [ { label: 'Interview 1', media: 'interview-a', start: 'right' }, { label: 'Interview 2', media: 'interview-b', start: 'right' } ],
            tasks: ['Seat Interview 1’s interviewer on the left', 'Seat Interview 1’s interviewer on the right', 'Make the interviews face each other, then preview the cut'] },
          { type: 'callout', kind: 'onset', html: 'Decide the side before you record. Put a piece of tape on the floor where the interviewer sits so every session matches.' }
        ]
      },
      {
        title: 'Practice: keep the direction',
        intro: 'Pick the next shot that keeps the screen direction.',
        blocks: [
          { type: 'picture-choice', closing: 'Screen direction is a promise to the viewer. Keep it, and nobody gets lost.',
            rounds: [
              { prompt: 'Shot 1: the person walks toward <strong>screen right</strong> and out of the frame. Which shot should come next?', stem: { svg: T.draw.mover('right', 'exits screen right'), alt: 'A person walking toward screen right.', caption: 'Shot 1' },
                options: [ { svg: T.draw.mover('right', 'enters from screen left'), alt: 'Walking toward screen right', label: 'A' }, { svg: T.draw.mover('left', 'enters from screen right'), alt: 'Walking toward screen left', label: 'B', clue: 'Walking toward screen left looks like a turn-around.' } ],
                answer: 0, explain: 'They keep moving toward screen right.' },
              { prompt: 'Interview 1 looks toward screen right. Which Interview 2 shot makes them face each other?', stem: { id: 'interview-a', crop: a.frame, alt: 'Interview 1 looks toward screen right.', caption: 'Interview 1' },
                options: [ { id: 'interview-b', crop: bFlip.frame, mirror: true, alt: 'Looks toward screen right', label: 'A', clue: 'This person also looks screen right.' }, { id: 'interview-b', crop: b.frame, alt: 'Looks toward screen left', label: 'B' } ],
                answer: 1, explain: 'One looks right, one looks left: a conversation.' },
              { prompt: 'Shot 1: the person walks toward <strong>screen left</strong>. Which shot continues the walk?', stem: { id: 'still-hall-mid-flip', caption: 'Shot 1' },
                options: [ { id: 'still-hall-mid', label: 'A', clue: 'This walk heads toward screen right.' }, { id: 'still-hall-mid-flip', label: 'B' } ],
                answer: 1, explain: 'Same direction, so the walk carries on.' }
            ] },
          { type: 'quick-check', pair: [ { id: 'still-hall-mid', caption: 'Shot 1' }, { id: 'still-hall-mid-flip', caption: 'Shot 2' } ], q: 'These are two shots of the same walk, cut together. What happened?', options: [
            { text: 'Nothing. The walk continues.', clue: 'Check which way the person moves in each shot.' },
            'A direction flip: the person seems to turn around.',
            { text: 'The person walked out of the frame.', clue: 'They are still in the middle of the frame in both shots.' }
          ], answer: 1, explain: 'Screen right in Shot 1, screen left in Shot 2.' }
        ]
      }
    ],
    check: [
      { pair: [ { id: 'still-hall-mid', caption: 'Shot 1' }, { id: 'still-room-sit', caption: 'Shot 2' } ], q: 'Shot 1: the person walks toward screen right. In Shot 2 they came in from screen left. Does the screen direction hold?', options: [
        'Yes. They keep moving the same way.',
        { text: 'No. It is a direction flip.', clue: 'A flip would mean entering from screen right.' }
      ], answer: 0, explain: 'Exit right, enter left: the walk continues.' },
      { q: 'A person exits screen right. In the next shot, they should enter from…', options: [
        'Screen left',
        { text: 'Screen right', clue: 'Entering from the same side looks like they turned around.' },
        { text: 'The top of the frame', clue: 'Think about the direction they were walking.' }
      ], answer: 0, explain: 'Out on the right, in on the left keeps the direction.' },
      { q: '“Screen left” means…', options: [
        'The left side of the picture as the viewer sees it',
        { text: 'The actor’s left hand side', clue: 'An actor facing the camera has their left on screen right.' },
        { text: 'The camera operator’s left foot', clue: 'Screen directions describe the picture.' }
      ], answer: 0, explain: 'Screen directions always belong to the viewer.' },
      { pair: [ { id: 'interview-a', crop: a.frame, caption: 'Interview 1' }, { id: 'interview-b', crop: b.frame, caption: 'Interview 2' } ], q: 'Will these two interviews seem to face each other when cut together?', options: [
        'Yes. One looks screen right and the other looks screen left.',
        { text: 'No. They look the same way.', clue: 'Check each person’s eyes.' }
      ], answer: 0, explain: 'Opposite directions feel like a conversation.' },
      { pair: [ { id: 'interview-a', crop: a.frame, caption: 'Interview 1' }, { id: 'interview-b', crop: bFlip.frame, mirror: true, caption: 'Interview 2' } ], q: 'What would fix this pair?', options: [
        { text: 'Nothing. They already face each other.', clue: 'Both people look toward screen right.' },
        'Move Interview 2’s interviewer to the other side of the camera.',
        { text: 'Use a closer shot of Interview 2.', clue: 'Shot size does not change direction.' }
      ], answer: 1, explain: 'Moving the interviewer turns the person to face screen left.' }
    ],
    remember: [
      '[[Screen left]] and [[screen right]] are the viewer’s left and right.',
      'Keep a moving person going the same way across a cut, or it looks like they turned around.',
      'In interviews, the interviewer’s chair sets the [[screen direction]]. Decide it before you record.'
    ],
    realCamera: 'Film a friend walking through a doorway in two shots. Keep the camera on the same side of their path for both shots. Then film one shot from the other side and cut it in. Can you see the flip?'
  });
})();
