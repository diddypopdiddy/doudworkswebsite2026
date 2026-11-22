/* 6.10 Continuity check. Rebuilt from Basic Sequences units 1 and 4. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;
  const before = 'p6-desk-base';
  const H = T.mediaRecord('hall-walk').events, R = T.mediaRecord('room-wide').events;
  const sit = p => T.time('room-wide', 'sit', p), msit = p => T.time('sit-medium', 'sit', p), mbook = p => T.time('sit-medium', 'book', p), cbook = p => T.time('book-close', 'book', p);

  T.topic({
    slug: 'continuity-check',
    minutes: 15,
    bigIdea: 'Everything must match across the cut.',
    hook: {
      pair: [ { media: before, caption: 'Shot 1' }, { media: 'p6-desk-book-open', caption: 'Shot 2, one second later' } ],
      question: 'These shots are one second apart, and nobody touched the desk. What changed?',
      options: ['The mug', 'The book', 'The lamp', 'Nothing'],
      answer: 1,
      reveal: 'The book is open in Shot 2. Shots are filmed minutes or hours apart, and details drift. Catching them is called keeping [[continuity]].'
    },
    notes: {
      sketch: 'Sketch two frames of the same table. Make one deliberate continuity error and circle it.',
      frames: 2, frameLabels: ['Shot 1', 'Shot 2'],
      think: 'List three things you would photograph or write down after every take to keep continuity.'
    },
    vocab: ['continuity', 'continuity-error', 'prop'],
    review: ['cut', 'cutting-on-action', 'screen-direction', 'clean-frame'],
    objectives: [
      'Spot a [[continuity error]] between two shots.',
      'Name ways crews keep [[props|prop]] and details matching.',
      'Put five shots in order using everything from this part.'
    ],
    sections: [
      {
        title: 'Everything must match',
        intro: 'Two shots of one moment should look like the same moment.',
        blocks: [
          { type: 'text', html: '<p>[[Continuity]] means keeping details the same from shot to shot, so a scene looks like it happened in one go. Shots are often filmed minutes or hours apart. In between, a cup gets drunk from, a book gets moved, a light gets switched off. When a detail changes across a [[cut]] that shouldn’t, it’s a [[continuity error]].</p>' },
          { type: 'spot-change', before,
            areas: { mug: [11, 38, 22, 43], book: [43, 31, 33, 55], lamp: [76, 2, 19, 48], pencil: [38, 86, 36, 12] },
            pairs: [
              { after: 'p6-desk-mug-low', changed: 'mug', explain: 'The mug was nearly full in Shot 1 and nearly empty in Shot 2.' },
              { after: 'p6-desk-book-open', changed: 'book', explain: 'The book was closed, then open, but nobody opened it.' },
              { after: 'p6-desk-lamp-off', changed: 'lamp', explain: 'The lamp switched off between shots.' },
              { after: 'p6-desk-pencil-gone', changed: 'pencil', explain: 'The pencil vanished from the desk.' },
              { after: 'p6-desk-mug-moved', changed: 'mug', areas: { mug: [20, 38, 22, 43] }, explain: 'The mug moved to the right, closer to the book.' }
            ]
          },
          { type: 'callout', kind: 'onset', html: 'After every take, someone photographs the set. Before the next take, they use the photo to put every [[prop]] back exactly.' }
        ]
      },
      {
        title: 'Common continuity errors',
        intro: 'Most errors come from a few places.',
        blocks: [
          { type: 'text', html: '<ul><li><strong>Props:</strong> how full a cup is, where a phone sits, whether a book is open. A [[prop]] is any object in the scene.</li><li><strong>Costume and hair:</strong> a jacket zipped, then unzipped; hair behind the ear, then in front.</li><li><strong>Hands and actions:</strong> the book picked up with the right hand in the wide, the left hand in the close-up.</li><li><strong>Light:</strong> sunlight moves, clouds pass, a lamp gets switched off.</li><li><strong>Direction:</strong> a person walking toward screen right, then screen left. That breaks [[screen direction]].</li></ul>' },
          { type: 'callout', kind: 'mistake', html: 'Don’t trust your memory. Write down which hand, which pocket, which sleeve, before you change shots.' }
        ]
      },
      {
        title: 'Put it all together',
        intro: 'Five shots, one short story, and every cut uses something from this part.',
        blocks: [
          { type: 'sequence-builder', start: [2, 4, 0, 3, 1],
            prompt: 'These five shots tell one short story. Put them in order with the arrows, check, then play your sequence. A wrong order is easy to spot when you play it.',
            success: 'A clean exit and entrance that keep screen direction, two cuts on action, and a reaction to finish.',
            clue: 'Follow the action: hallway, room, sitting down, the book, the reaction.',
            shots: [
              { label: 'Hallway', desc: 'Walks in from screen left, out on screen right.', thumbAt: 3.5, segment: T.seg('hall-walk', H.enter - 0.6, H.exit + 0.6) },
              { label: 'Room, wide', desc: 'Enters from screen left and starts to sit.', thumbAt: 5.5, segment: T.seg('room-wide', R.enter - 0.6, sit(0.5)) },
              { label: 'Medium', desc: 'Lands in the chair, reaches for the book.', thumbAt: 4.6, segment: T.seg('sit-medium', msit(0.5), mbook(0.5)) },
              { label: 'Book, close-up', desc: 'The book opens.', thumbAt: 3.0, segment: T.seg('book-close', cbook(0.5), 7.5) },
              { label: 'Face, close-up', desc: 'Reads, then smiles.', thumbAt: 2.0, segment: T.seg('face-close', 0, 4.0) }
            ] }
        ]
      }
    ],
    check: [
      { pair: [ { media: before, caption: 'Shot 1' }, { media: 'p6-desk-mug-low', caption: 'Shot 2' } ], q: 'What is the continuity error?', options: [
        'The mug is full, then nearly empty.',
        { text: 'The lamp changed color.', clue: 'Compare the lamp in both shots.' },
        { text: 'There is no error.', clue: 'Look at the mug.' }
      ], answer: 0, explain: 'Nobody drank from it between the shots.' },
      { q: 'Which of these is a prop?', options: [
        'The cup the actor drinks from',
        { text: 'The camera', clue: 'Props are in the scene, not behind it.' },
        { text: 'The director', clue: 'A prop is an object, not a person.' }
      ], answer: 0, explain: 'A prop is any object in the scene.' },
      { q: 'How do crews prevent continuity errors?', options: [
        'Photos and notes after each take',
        { text: 'Filming everything in one shot', clue: 'Most scenes need several shots.' },
        { text: 'Fixing it in the edit later', clue: 'Often that isn’t possible.' }
      ], answer: 0, explain: 'Record how everything looked, then reset it.' },
      { media: 'still-book-close', q: 'In the five-shot sequence, the cut from the medium to this close-up works mostly because…', options: [
        'It cuts on the action as the book opens.',
        { text: 'The close-up is very short.', clue: 'Length isn’t the key here.' },
        { text: 'The person exits the frame first.', clue: 'They stay in the chair.' }
      ], answer: 0, explain: 'The opening book carries viewers across the cut.' }
    ],
    remember: [
      '[[Continuity]] keeps details the same across a cut.',
      'Check [[props|prop]], costume, hands, light and direction before every take.',
      'A good sequence uses every rule at once, and nobody notices any of them.'
    ],
    realCamera: 'Film a two-shot scene of a friend drinking from a cup. Between the shots, change one detail on purpose. Show a classmate. Can they find it? Then film it again with everything matching.'
  });
})();
