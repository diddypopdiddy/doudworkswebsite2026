/* 3.04 Common shot types. Uses the same conversation study as the 180-degree rule. */
(function () {
  const T = Textbook;
  const pick = (media, alt, label, clue) => ({ media, alt, label, clue });

  T.topic({
    slug: 'common-shot-types',
    minutes: 12,
    bigIdea: 'Some shots are named for who is in them and where the camera stands.',
    hook: {
      media: 'p3-note-pov', alt: 'Two hands at the bottom of the frame hold a note that says Look up.',
      question: 'Whose eyes are we looking through in this shot?',
      options: ['A person standing across the room', 'The person holding the note', 'Nobody. It is a wide shot.'],
      answer: 1,
      reveal: 'The hands at the bottom of the frame tell us we are seeing through the character’s own eyes. That is a [[point-of-view shot]]. Some shots are named not for their size, but for who is in them and where the camera stands.'
    },
    notes: {
      sketch: 'Sketch a two-shot and an over-the-shoulder shot of the same two people talking.',
      frames: 2, frameLabels: ['Two-shot', 'Over-the-shoulder'],
      think: 'Why might a horror film use a lot of point-of-view shots?'
    },
    vocab: ['two-shot', 'over-the-shoulder-shot', 'point-of-view-shot', 'insert-shot'],
    review: ['wide-shot', 'close-up'],
    objectives: [
      'Name a two-shot, an over-the-shoulder shot, a point-of-view shot and an insert shot.',
      'Choose the shot type that fits a moment in a scene.'
    ],
    sections: [
      {
        title: 'Shots named for who is in them',
        intro: 'Conversations are built from a few standard shots.',
        blocks: [
          { type: 'text', html: '<p>A [[two-shot]] has two people in it. It shows how they relate: close together, far apart, facing each other or not.</p><p>An [[over-the-shoulder shot]] is filmed from behind one person, so the edge of their shoulder and head frame the person they are talking to. It keeps both people in the conversation, even when we only see one face.</p>' },
          { type: 'figure-row', items: [
            { media: 'p6-conversation-2', alt: 'Two people facing each other, both fully in the frame.', caption: '<strong>Two-shot.</strong> Both people, side by side.' },
            { media: 'p6-conversation-1', alt: 'Over one person’s shoulder, looking at the other person.', caption: '<strong>Over-the-shoulder.</strong> We look past A at B.' }
          ] },
          { type: 'callout', kind: 'onset', html: 'For an over-the-shoulder shot, keep the near shoulder small: a slice at the frame edge is enough. Too much shoulder blocks the face.' }
        ]
      },
      {
        title: 'Shots named for where the camera stands',
        intro: 'Some shots put viewers inside the story.',
        blocks: [
          { type: 'text', html: '<p>A [[point-of-view shot]] shows what a character sees, as if the camera were their eyes. Editors usually show the character looking first, then cut to what they see.</p><p>An [[insert shot]] is a close shot of a detail, like a phone screen, a note or a clock, cut into a scene so viewers can read or notice it. It is usually a [[close-up]], filmed separately from the main action.</p>' },
          { type: 'figure-row', items: [
            { media: 'p3-note-pov', alt: 'Hands holding a note, seen through the character’s eyes.', caption: '<strong>Point of view.</strong> We see what the character sees.' },
            { media: 'p6-note-insert', caption: '<strong>Insert.</strong> A detail cut into the scene.' }
          ] },
          { type: 'callout', kind: 'consider', html: 'A text message on a phone is almost always shown as an insert. Why not just show the person reading it in a [[wide shot]]?' }
        ]
      },
      {
        title: 'Practice: name the shot',
        intro: 'Pick the picture that matches each shot type.',
        blocks: [
          { type: 'picture-choice', closing: 'Size tells how much you see. Type tells who and from where.', rounds: [
            { prompt: 'Which is an over-the-shoulder shot?', options: [ pick('p6-conversation-2', 'Two people side by side.', 'A', 'Both people are fully in the frame. That is a two-shot.'), pick('p6-conversation-3', 'Past one person’s shoulder at the other.', 'B'), pick('p3-note-pov', 'Hands holding a note.', 'C', 'That is what a character sees: a point-of-view shot.') ], answer: 1, explain: 'We see past B’s shoulder to A.' },
            { prompt: 'Which shot would you use to let viewers read the note?', options: [ pick('p6-conversation-2', 'Two people side by side.', 'A', 'From this far away, the note is too small to read.'), pick('p3-note-pov', 'Hands holding a note that says Look up.', 'B'), pick('p6-conversation-1', 'Over a shoulder.', 'C', 'The note isn’t in this shot.') ], answer: 1, explain: 'A point-of-view or insert shot lets viewers read the detail.' },
            { prompt: 'Two friends sit at a table. Which shot shows them together?', options: [ pick('p6-conversation-1', 'Over a shoulder.', 'A', 'Only one face shows.'), pick('p3-note-pov', 'Hands holding a note.', 'B', 'That is a point-of-view shot.'), pick('p6-conversation-5', 'Two people side by side.', 'C') ], answer: 2, explain: 'A two-shot shows both people and how they relate.' }
          ] }
        ]
      }
    ],
    check: [
      { media: 'p6-conversation-2', alt: 'Two people facing each other.', q: 'What is this shot called?', options: ['Two-shot', { text: 'Over-the-shoulder shot', clue: 'Is the camera behind one of them?' }, { text: 'Insert shot', clue: 'An insert shows a detail.' }], answer: 0, explain: 'Two people in the frame.' },
      { media: 'p6-conversation-1', alt: 'Over one person’s shoulder.', q: 'What is this shot called?', options: [{ text: 'Two-shot', clue: 'Only one face shows.' }, 'Over-the-shoulder shot', { text: 'Point-of-view shot', clue: 'We can see the person’s shoulder, so we aren’t seeing through their eyes.' }], answer: 1, explain: 'The near shoulder frames the other person.' },
      { q: 'A character checks a phone. You cut to a close shot of the screen. What is that shot?', options: ['An insert shot', { text: 'A two-shot', clue: 'Nobody is in this shot.' }, { text: 'A wide shot', clue: 'A phone screen filling the frame is close.' }], answer: 0, explain: 'An insert shows a detail viewers need to see.' },
      { q: 'What does a point-of-view shot show?', options: ['What a character sees', { text: 'Two people talking', clue: 'That is a two-shot.' }, { text: 'The whole location', clue: 'That is a wide shot.' }], answer: 0, explain: 'The camera becomes the character’s eyes.' }
    ],
    remember: [
      'A [[two-shot]] shows two people; an [[over-the-shoulder shot]] looks past one person at the other.',
      'A [[point-of-view shot]] shows what a character sees.',
      'An [[insert shot]] is a close detail cut into a scene.'
    ],
    realCamera: 'Film a friend reading a text in four shots: a two-shot with another friend, an over-the-shoulder shot, a point-of-view shot of the phone, and an insert of the screen.'
  });
})();
