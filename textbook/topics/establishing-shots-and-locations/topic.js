/* 6.01 Establishing shots and locations. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;
  const sitMid = T.time('room-wide', 'sit', 0.5), medSit = T.time('sit-medium', 'sit', 0.5);
  const medBook = T.time('sit-medium', 'book', 0.5), closeBook = T.time('book-close', 'book', 0.5);

  T.topic({
    slug: 'establishing-shots-and-locations',
    minutes: 12,
    bigIdea: 'Show viewers where we are before you go closer.',
    hook: {
      sequence: [T.seg('sit-medium', medSit, medBook), T.seg('book-close', closeBook, 7.4)],
      question: 'Play this short scene. Where does it take place?',
      options: ['A library', 'A kitchen', 'A classroom', 'You can’t tell'],
      answer: 3,
      reveal: 'Nothing in these shots shows the place. That’s the job of an [[establishing shot]], and it’s what this topic is about.'
    },
    notes: {
      sketch: 'Sketch a wide-to-close opening for a scene in your kitchen.',
      frames: 3, frameLabels: ['Wide', 'Medium', 'Close-up'],
      think: 'When might a director choose <em>not</em> to start with an establishing shot? Give an example.'
    },
    vocab: ['establishing-shot', 'location', 'wide-to-close', 'cut'],
    review: ['wide-shot', 'close-up', 'sequence'],
    objectives: [
      'Explain what an [[establishing shot]] tells viewers.',
      'Put shots in [[wide-to-close]] order.',
      'Choose an establishing shot for a [[location]].'
    ],
    sections: [
      {
        title: 'Where are we?',
        intro: 'Every new scene starts with a question in the viewer’s head.',
        blocks: [
          { type: 'text', html: '<p>When a scene begins, viewers want to know where they are. Is this a classroom, a kitchen, a library? Is anyone else here? An [[establishing shot]] answers that question. It is usually a [[wide shot]] that shows the whole place.</p><p>After that, every closer shot makes sense, because viewers already know the space around it. Each change from one shot to the next is a [[cut]].</p>' },
          { type: 'figure-row', items: [
            { media: 'still-room-wide', caption: '<strong>Establishing shot.</strong> A room, a table, a person. You know where you are.' },
            { media: 'still-book-close', caption: '<strong>Close-up first.</strong> Hands and a book. Where is this?' }
          ] },
          { type: 'callout', kind: 'consider', html: 'Sometimes a director starts close on purpose, to make viewers curious. When might a mystery be better than an answer?' }
        ]
      },
      {
        title: 'Watch the difference',
        intro: 'The same moment, edited two ways.',
        blocks: [
          { type: 'sequence-compare', prompt: 'Now play both versions and check your prediction.', askBefore: 'Play it, then think: where does this happen?',
            predict: { q: 'Which version will make it easier to say where the scene happens?', options: ['With an establishing shot', 'Close shots only', 'No difference'] },
            versions: [
              { label: 'With an establishing shot', note: 'We see the room first, so the medium shot and the close-up feel like they happen right there, at that table.', segments: [T.seg('room-wide', 1.4, sitMid), T.seg('sit-medium', medSit, medBook), T.seg('book-close', closeBook, 7.4)] },
              { label: 'Close shots only', note: 'We never see the room. A person sits and opens a book, but where? Viewers have to guess.', segments: [T.seg('sit-medium', medSit, medBook), T.seg('book-close', closeBook, 7.4)] }
            ] },
          { type: 'video-segments', media: 'establish-exterior', label: 'Establishing shot', pauses: [{ at: 2, prompt: 'Nobody has appeared yet. What has this shot already told you?' }], caption: 'An establishing shot can be outside the building before we go in.' }
        ]
      },
      {
        title: 'Wide to close',
        intro: 'Most scenes move closer as viewers need more detail.',
        blocks: [
          { type: 'text', html: '<p>A common pattern is [[wide-to-close]]: start wide to show the place, move to a medium shot to show the person and what they are doing, then go to a [[close-up]] for the detail that matters. Together these shots make a [[sequence]].</p><p>You can go back to a wide shot whenever the space changes: someone new walks in, the person moves somewhere else, or time has passed.</p>' },
          { type: 'figure-row', items: [
            { media: 'still-room-wide', caption: '<strong>Wide.</strong> Where we are.' },
            { media: 'still-medium-seated', caption: '<strong>Medium.</strong> Who and what.' },
            { media: 'still-book-close', caption: '<strong>Close-up.</strong> The detail.' }
          ] },
          { type: 'callout', kind: 'onset', html: 'You don’t have to film the establishing shot first. Film it when the light looks best. The editor puts it first.' },
          { type: 'opening-builder', slots: 3, distinctSizes: true,
            prompt: '<strong>Practice: build the opening.</strong> This scene happens at the table in the room. Choose three shots, in order, so viewers know where they are and then see what matters. Check it, then play it.',
            success: 'The room first, then the person, then the detail.',
            clueEstablish: 'The hallway is a different place. Start with a shot of the room where the scene happens.',
            bank: [
              { label: 'Hallway, empty', desc: 'A wide shot of the hallway.', size: 'wide', establishes: false, still: 'still-hall-empty', segment: T.seg('hall-walk', 0.2, 1.8) },
              { label: 'Book, close-up', desc: 'Hands open the book.', size: 'close', establishes: false, still: 'still-book-close', segment: T.seg('book-close', closeBook, 7.4) },
              { label: 'Room, wide', desc: 'The whole room and table.', size: 'wide', establishes: true, still: 'still-room-wide', segment: T.seg('room-wide', 1.4, sitMid) },
              { label: 'Face, close-up', desc: 'The person reads and smiles.', size: 'close', establishes: false, still: 'still-face-close', segment: T.seg('face-close', 0.2, 3.6) },
              { label: 'Medium', desc: 'The person at the table.', size: 'medium', establishes: false, still: 'still-medium-seated', segment: T.seg('sit-medium', medSit, medBook) }
            ] }
        ]
      },
      {
        title: 'Choosing a location',
        intro: 'The place you film is part of the story.',
        blocks: [
          { type: 'text', html: '<p>A [[location]] is the real place where you film. Pick one that fits the story, is quiet enough to record sound, and has room to set up a wide shot. If you can’t step back far enough to show the place, you can’t establish it.</p>' },
          { type: 'quick-check', q: 'You are filming a scene in the school library. Which shot works best as the establishing shot?', options: [
            { text: 'A close-up of one book on a shelf', clue: 'A close-up shows a detail, not the place.' },
            'A wide shot of shelves and tables, with the person sitting at one table',
            { text: 'A close-up of the person’s face', clue: 'A face doesn’t tell us where we are.' },
            { text: 'The door handle of the library', clue: 'A door handle could be anywhere.' }
          ], answer: 1, explain: 'The wide shot shows the room and puts the person in it.' },
          { type: 'callout', kind: 'mistake', html: 'A location that is too small for a wide shot forces you to start close. Scout it with your camera before shoot day.' }
        ]
      }
    ],
    check: [
      { media: 'still-room-wide', q: 'What job does this shot do at the start of a scene?', options: [
        'It shows viewers where the scene takes place.',
        { text: 'It shows how the person feels.', clue: 'Feelings need to see the face closely.' },
        { text: 'It hides a mistake in the edit.', clue: 'That is a cutaway’s job.' },
        { text: 'It shows a small detail.', clue: 'Details need a close-up.' }
      ], answer: 0, explain: 'It is an establishing shot: the whole room, with the person in it.' },
      { q: 'Which order is wide-to-close?', options: [
        { text: 'Close-up, medium, wide', clue: 'That goes from close to wide.' },
        'Wide, medium, close-up',
        { text: 'Medium, close-up, wide', clue: 'Wide-to-close starts with the wide shot.' },
        { text: 'Close-up, wide, close-up', clue: 'Wide-to-close moves steadily closer.' }
      ], answer: 1, explain: 'Start with the place, then the person, then the detail.' },
      { media: 'still-book-close', q: 'A scene starts with this shot. What will viewers most likely wonder?', options: [
        'Where are we?',
        { text: 'What is the book’s title?', clue: 'Maybe, but the bigger question is about the place.' },
        { text: 'Why is the picture blurry?', clue: 'Think about what is missing from the shot.' },
        { text: 'Nothing. It is clear.', clue: 'We only see hands. The place is missing.' }
      ], answer: 0, explain: 'Without an establishing shot, the place is a mystery.' },
      { q: 'When might you use another wide shot later in the scene?', options: [
        'When someone new walks in or the person moves to a new place',
        { text: 'After every single cut', clue: 'That would slow the scene down.' },
        { text: 'Never. Once is enough.', clue: 'Viewers need to see the space again when it changes.' },
        { text: 'Only at the end of the film', clue: 'Re-establish whenever the space changes.' }
      ], answer: 0, explain: 'Go wide again whenever the space changes.' }
    ],
    remember: [
      'An [[establishing shot]] tells viewers where the scene happens.',
      'Most scenes move [[wide-to-close]]: place, person, detail.',
      'Pick a [[location]] with room to set up a wide shot.'
    ],
    realCamera: 'Film a three-shot scene at home: a wide shot that shows the room, a medium shot of someone doing something, and a close-up of what they are holding. Play them in order, then play just the close-up. Which version is clearer?'
  });
})();
