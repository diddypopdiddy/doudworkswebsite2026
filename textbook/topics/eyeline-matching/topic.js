/* 6.05 Eyeline matching. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;
  const lookRight = 'p6-conversation-3';
  const lookLeft = 'p6-conversation-1';
  const a = T.lookCrop('interview-a', false), bFlip = T.lookCrop('interview-b', true);

  T.topic({
    slug: 'eyeline-matching',
    minutes: 12,
    bigIdea: 'Cut to what the person looks at, in the direction they look.',
    hook: {
      sequence: [T.seg('face-close', 0.2, 2.6), T.seg('hall-walk', 0.0, 1.8)],
      question: 'The person looks down. Then we see this. Does it feel like what they’re looking at?',
      options: ['Yes', 'No'],
      answer: 1,
      reveal: 'Viewers follow eyes. The person looks down, so viewers expect to see something below them, not an empty hallway. Matching the next shot to the look is called an [[eyeline match]].'
    },
    notes: {
      sketch: 'Shot 1: a person looks up at a plane in the sky. Sketch Shot 1 and the matching Shot 2.',
      frames: 2, frameLabels: ['Shot 1: the look', 'Shot 2: what they see'],
      think: 'How could a wrong eyeline make two people in a conversation seem to ignore each other?'
    },
    vocab: ['eyeline', 'eyeline-match', 'off-screen'],
    review: ['close-up', 'cut', 'screen-direction'],
    objectives: [
      'Follow a person’s [[eyeline]] to decide the next shot.',
      'Build an [[eyeline match]] between a look and an object.',
      'Check that two people in a conversation look toward each other.'
    ],
    sections: [
      {
        title: 'Look, then cut',
        intro: 'Viewers follow eyes. When a person looks at something, viewers want to see it.',
        blocks: [
          { type: 'text', html: '<p>A person’s [[eyeline]] is the direction they are looking. When they look at something [[off-screen]], viewers expect the next shot to show it. Cutting from the look to the thing they see is an [[eyeline match]].</p>' },
          { type: 'sequence-compare', prompt: 'Play each version and check your prediction.',
            predict: { q: 'Which version will feel like we see what the person sees?', options: ['Look, then the book', 'Look, then the hallway'] },
            versions: [
              { label: 'Look, then the book', note: 'The person looks down, and we cut to what is below their eyes: the book. It feels like we see what they see.', segments: [T.seg('face-close', 0.2, 2.6), T.seg('book-close', 1.0, 4.4)] },
              { label: 'Look, then the hallway', note: 'The person looks down, but we cut to an empty hallway at eye level. It doesn’t feel like what they see, so the cut feels random.', segments: [T.seg('face-close', 0.2, 2.6), T.seg('hall-walk', 0.0, 1.8)] }
            ] },
          { type: 'video-segments', media: 'eyeline-wrong', label: 'Looking at the clock', pauses: [{ at: 2, prompt: 'Which way is the person looking? Where should the clock be?' }] }
        ]
      },
      {
        title: 'Match the direction',
        intro: 'The next shot should feel like it is seen from where the person is.',
        blocks: [
          { type: 'text', html: '<p>If the person looks [[off-screen]] to the right and up, the thing they see should be up and to their right. Show it from a low angle, as if from their seat. If they look down, show the object from above.</p>' },
          { type: 'figure-row', items: [
            { media: lookRight, alt: 'A person on screen left looking off-screen right.', caption: '<strong>Shot 1.</strong> Looks off-screen right.' },
            { media: lookLeft, alt: 'A person on screen right looking off-screen left.', caption: '<strong>A matching reply.</strong> The other person looks back toward screen left.' }
          ] },
          { type: 'callout', kind: 'try', html: 'Ask a friend to look at something in the room without pointing. Can you guess what it is from their eyes alone? That’s what viewers do.' },
          { type: 'picture-choice', label: 'Round', closing: 'Follow the eyes, and match the angle.',
            rounds: [
              { prompt: '<strong>Practice.</strong> The person looks down. Which shot should come next?', stem: { id: 'still-face-close', caption: 'Shot 1: looks down' },
                options: [ { id: 'still-hall-empty', label: 'A', clue: 'That’s at eye level, not below them.' }, { id: 'still-book-close', label: 'B' }, { id: 'still-room-wide', label: 'C', clue: 'A wide shot of the room isn’t what their eyes are on.' } ],
                answer: 1, explain: 'The book is below them, seen from above, the way they see it.' },
              { prompt: 'The person sits at a table and looks <strong>up</strong> at the wall clock. Which clock shot matches their eyeline?', stem: { media: 'p6-reader-look-up', alt: 'A person looking up and off-screen right.', caption: 'Shot 1' },
                options: [ { media: 'p6-clock-overhead', alt: 'A clock seen from above, lying on a table', label: 'A', clue: 'This is seen from above. They are looking up.' }, { media: 'p6-clock-low', alt: 'A clock high on a wall, seen from below', label: 'B' }, { media: 'p6-clock-level', alt: 'A clock seen straight on', label: 'C', clue: 'Close, but they are looking up, so we should look up too.' } ],
                answer: 1, explain: 'Seen from below, as if from their chair.' },
              { prompt: 'Person 1 looks off-screen right at Person 2. Which shot of Person 2 makes their eyelines meet?', stem: { media: lookRight, alt: 'Person 1 looking off-screen right.', caption: 'Person 1' },
                options: [ { media: 'p6-conversation-4', alt: 'Person 2 looking toward screen right', label: 'A', clue: 'Both would look the same way.' }, { media: lookLeft, alt: 'Person 2 looking toward screen left', label: 'B' } ],
                answer: 1, explain: 'One looks right, the other looks left: they look at each other.' }
            ] }
        ]
      },
      {
        title: 'Two people, two eyelines',
        intro: 'In a conversation, each person’s eyeline points at the other.',
        blocks: [
          { type: 'text', html: '<p>When you cut between two people talking, one should look toward [[screen right]] and the other toward [[screen left]]. Then their eyelines meet across the cut. This is the same idea as the [[180-degree rule]].</p>' },
          { type: 'quick-check', pair: [ { id: 'interview-a', crop: a.frame, caption: 'Person 1' }, { id: 'interview-b', crop: bFlip.frame, mirror: true, caption: 'Person 2' } ], q: 'These two people are supposed to be talking to each other. Do their eyelines meet?', options: [
            { text: 'Yes', clue: 'Check which way each person looks.' },
            'No. They both look toward screen right.'
          ], answer: 1, explain: 'Both look screen right, so they seem to talk to someone else.' }
        ]
      }
    ],
    check: [
      { media: 'still-face-close', q: 'The person is looking down. Which shot makes the best eyeline match next?', options: [
        'A close-up of the book on the table',
        { text: 'An empty hallway at eye level', clue: 'Is that below their eyes?' },
        { text: 'The ceiling', clue: 'They are looking down, not up.' },
        { text: 'A window across the room', clue: 'Follow their eyes: down.' }
      ], answer: 0, explain: 'They look down, so we show what is below them.' },
      { media: lookRight, alt: 'A person looking off-screen right.', q: 'This person looks off-screen right at a friend. In the next shot, the friend should look toward…', options: [
        'Screen left',
        { text: 'Screen right', clue: 'Then both would look the same way.' },
        { text: 'Straight into the lens', clue: 'That breaks the conversation.' }
      ], answer: 0, explain: 'Their eyelines meet across the cut.' },
      { q: 'What does off-screen mean?', options: [
        'Outside the frame, where viewers can’t see',
        { text: 'A shot that was deleted', clue: 'It’s about space, not editing.' },
        { text: 'Behind the camera operator only', clue: 'Anywhere outside the frame.' }
      ], answer: 0, explain: 'Off-screen is anything outside the edges of the frame.' },
      { q: 'Why do eyeline matches work?', options: [
        'Viewers follow eyes and expect to see what the person sees.',
        { text: 'They hide continuity errors.', clue: 'That isn’t their main job.' },
        { text: 'They make shots longer.', clue: 'Think about what viewers want to know.' }
      ], answer: 0, explain: 'The look creates a question; the next shot answers it.' }
    ],
    remember: [
      'An [[eyeline]] is where a person looks. Viewers follow it.',
      'An [[eyeline match]] cuts from the look to what they see, from the matching direction.',
      'In a conversation, the two eyelines should point at each other.'
    ],
    realCamera: 'Film a friend looking up at something off-screen. Then film what they were looking at from a low angle, as if from their seat. Cut the two together. Now film the object from high above instead. Which cut feels right?'
  });
})();
