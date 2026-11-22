/* 3.18 Shot purpose. Picture practice with crops of the Part 3 photos. */
(function () {
  const T = Textbook, D = T.draw;
  const R = (size, lead, ey) => ({ recipe: [size, lead, ey] });
  const c = (id, frame, alt, label, clue, mirror) => ({ media: { id, crop: Array.isArray(frame) ? frame : T.resolveFrame(id, mirror, frame, 0.2), mirror: !!mirror, alt }, alt, label, clue });

  T.topic({
    slug: 'shot-purpose',
    minutes: 12,
    bigIdea: 'Every shot should answer: what does the viewer need to see?',
    hook: {
      pair: [ { id: 'scene-shelf', crop: [0, 0, 1672], caption: 'Shot 1', alt: 'The whole library with a person at a shelf.' }, { id: 'scene-shelf', crop: [784, 162, 384], caption: 'Shot 2', alt: 'Hands holding a red book against the shelf.' } ],
      question: 'The story needs viewers to notice the title of the red book. Which shot does that job?',
      options: ['Shot 1', 'Shot 2', 'Both do it equally'],
      answer: 1,
      reveal: 'Only Shot 2 shows the book big enough to read. Every shot has a job, its [[shot purpose]]. Before you frame, ask what the viewer needs to see.'
    },
    notes: {
      sketch: 'Plan three shots for “a student finds a lost phone.” Write the purpose under each sketch.',
      frames: 3, frameLabels: ['Shot 1', 'Shot 2', 'Shot 3'],
      think: 'What happens to viewers when a video has lots of cool shots that don’t have a purpose?'
    },
    vocab: ['shot-purpose', 'motivated-shot', 'visual-information'],
    review: ['wide-shot', 'close-up', 'low-angle', 'insert-shot'],
    objectives: [
      'Name the purpose of a shot: place, person, action, feeling or detail.',
      'Choose the shot size and angle that give viewers the information they need.'
    ],
    sections: [
      {
        title: 'Start with the viewer',
        intro: 'Ask one question before you frame: what does the viewer need to see?',
        blocks: [
          { type: 'text', html: '<p>A shot’s [[shot purpose]] is the job it does for viewers. Most shots do one of five jobs: show the place, show who is there, show what they are doing, show how they feel, or show a detail.</p><p>Everything viewers learn from just looking is [[visual information]]. A good shot gives exactly the information the story needs, and no more.</p>' },
          { type: 'figure-row', items: [
            { media: { id: 'scene-paper', crop: [0, 0, 1672] }, alt: 'Wide shot of the room.', caption: '<strong>Place.</strong> Where are we?' },
            { media: { id: 'scene-shelf', crop: [520, 8, 832] }, alt: 'Medium shot holding a book.', caption: '<strong>Action.</strong> What are they doing?' },
            { media: { id: 'scene-paper', crop: [600, 15, 480] }, alt: 'Close-up of a face.', caption: '<strong>Feeling.</strong> How do they feel?' },
            { media: { id: 'scene-paper', crop: [730, 530, 220] }, alt: 'Extreme close-up of fingertips.', caption: '<strong>Detail.</strong> Notice this.' }
          ] }
        ]
      },
      {
        title: 'Motivated shots',
        intro: 'A good reason beats a cool look.',
        blocks: [
          { type: 'text', html: '<p>A [[motivated shot]] is chosen for a story reason. A [[low angle]] because the character just won. An [[insert shot]] of a phone because the message matters. A [[wide shot]] because we just arrived somewhere new.</p><p>An unmotivated shot is chosen because it looks cool. Viewers sense it: it pulls them out of the story.</p>' },
          { type: 'callout', kind: 'consider', html: 'Think of a music video you like. Pick one shot. What was its purpose?' },
          { type: 'callout', kind: 'onset', html: 'Write the purpose next to every shot on your shot list. If you can’t name one, cut the shot.' }
        ]
      },
      {
        title: 'Practice: give viewers what they need',
        intro: 'Each line is from a script. Pick the shot that does the job.',
        blocks: [
          { type: 'picture-choice', closing: 'Purpose first, then size and angle.', rounds: [
            { prompt: '“We arrive at the library for the first time.”', options: [ c('scene-shelf', [784, 162, 384], 'Close-up of a book.', 'A', 'Viewers don’t know where they are yet.'), c('scene-shelf', [0, 0, 1672], 'Wide shot of the library.', 'B'), c('scene-shelf', [490, 0, 380], 'Close-up of a face.', 'C', 'A face doesn’t show the place.') ], answer: 1, explain: 'A wide shot shows the place.' },
            { prompt: '“The interviewee pauses. They are clearly nervous.”', options: [ c('interview-a', R(0.55, 0.64, 0.36), 'A close-up of the face.', 'A'), c('interview-a', 'whole', 'The whole room.', 'B', 'From this far you can’t read the face.'), c('scene-paper', [730, 530, 220], 'Fingertips on paper.', 'C', 'Wrong subject.') ], answer: 0, explain: 'A close-up lets viewers read the feeling.' },
            { prompt: '“The note has to be folded exactly on the line.”', options: [ c('scene-paper', [285, 0, 1102], 'A medium shot.', 'A', 'The fold is too small to see.'), c('scene-paper', [0, 0, 1672], 'A wide shot.', 'B', 'The fold is tiny from here.'), c('scene-paper', [730, 530, 220], 'An extreme close-up of the fold.', 'C') ], answer: 2, explain: 'A tiny detail needs an extreme close-up.' },
            { prompt: '“Show who is holding the book and what they are doing with it.”', options: [ c('scene-shelf', [520, 8, 832], 'A medium shot with face and book.', 'A'), c('scene-shelf', [905, 190, 300], 'Just the book.', 'B', 'You can’t see who is holding it.'), c('scene-shelf', [0, 0, 1672], 'The whole library.', 'C', 'Too far to see what they are doing.') ], answer: 0, explain: 'A medium shot shows who and what.' }
          ] }
        ]
      }
    ],
    check: [
      { media: { id: 'scene-paper', crop: [730, 530, 220] }, alt: 'Fingertips on a crease.', q: 'What is the purpose of this shot?', options: ['To make viewers notice a detail', { text: 'To show the place', clue: 'You can’t see the room.' }, { text: 'To show how the person feels', clue: 'There is no face.' }], answer: 0, explain: 'An extreme close-up points at something small.' },
      { q: 'What is a motivated shot?', options: ['A shot chosen for a clear story reason', { text: 'A shot that moves a lot', clue: 'Motivated means there is a reason.' }, { text: 'Any close-up', clue: 'Any size can be motivated.' }], answer: 0, explain: 'The story decides the shot.' },
      { q: 'A scene opens in a new place. What should the first shot usually show?', options: ['Where we are', { text: 'A tiny detail', clue: 'Viewers need to get their bearings first.' }, { text: 'The end of the story', clue: 'Start with the place.' }], answer: 0, explain: 'Wide first, then closer.' },
      { q: 'What should you write next to each shot on a shot list?', options: ['Its purpose', { text: 'The weather', clue: 'Think about what helps you frame it.' }, { text: 'The actor’s age', clue: 'Not needed for framing.' }], answer: 0, explain: 'If you can’t name the purpose, cut the shot.' }
    ],
    remember: [
      'Every shot has a [[shot purpose]]: place, person, action, feeling or detail.',
      'Give viewers the [[visual information]] the story needs.',
      'Choose [[motivated shots|motivated-shot]], not just cool ones.'
    ],
    realCamera: 'Write a three-line story, like “I lose my keys. I search. I find them in my shoe.” Plan one shot for each line and write its purpose. Then film it.'
  });
})();
