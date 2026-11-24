/* 3.03 Shot sizes. Rebuild of the Shot Sizes camera lesson (FOUNDATION R): same photos, frames, briefs and judging. */
(function () {
  const T = Textbook;
  const W = 1672;
  const SIZE = {
    0: { key: 'wide', title: 'WS · Wide shot', text: '<p><strong>Shows:</strong> the whole person and the place around them.</p><p><strong>Leaves out:</strong> small details. The fold is tiny from here.</p><p><strong>Use it to:</strong> show viewers where we are.</p>' },
    1: { key: 'medium', title: 'MS · Medium shot', text: '<p><strong>Shows:</strong> a person from about the waist up, with face and hands.</p><p><strong>Leaves out:</strong> most of the room.</p><p><strong>Use it to:</strong> show a person and what they are doing.</p>' },
    2: { key: 'close', title: 'CU · Close-up', text: '<p><strong>Shows:</strong> one thing fills the frame, like a face or a pair of hands.</p><p><strong>Leaves out:</strong> the room and the rest of the person.</p><p><strong>Use it to:</strong> show a feeling or an important detail.</p>' },
    3: { key: 'ecu', title: 'ECU · Extreme close-up', text: '<p><strong>Shows:</strong> one tiny detail, like fingertips on a crease.</p><p><strong>Leaves out:</strong> almost everything else.</p><p><strong>Use it to:</strong> make viewers notice something small.</p>' }
  };
  const BADGE = ['WS · Wide shot', 'MS · Medium shot', 'CU · Close-up', 'ECU · Extreme close-up'];
  const crop = (id, frame, alt) => ({ media: { id, crop: frame, alt } });
  const face = { name: 'Her face', r: 'face' }, book = { name: 'The red book', r: 'book' };

  T.topic({
    slug: 'shot-sizes',
    minutes: 15,
    bigIdea: 'Closer is not better. Each size does a job.',
    hook: {
      pair: [ { id: 'scene-paper', crop: [0, 0, 1672], caption: 'Shot 1', alt: 'The whole room, with a person folding paper at the table.' }, { id: 'scene-paper', crop: [600, 435, 448], caption: 'Shot 2', alt: 'Hands folding yellow paper fill the frame.' } ],
      question: 'Same moment, two shots. Which one shows how carefully the paper is being folded?',
      options: ['Shot 1', 'Shot 2', 'They show it equally well'],
      answer: 1,
      reveal: 'Shot 2 is a [[close-up]]: the hands fill the frame, so you see every careful fold. But Shot 1, a [[wide shot]], is the only one that shows where we are. Each shot size does a different job.'
    },
    notes: {
      sketch: 'Sketch the same person four ways: a wide shot, a medium shot, a close-up and an extreme close-up. Label each one.',
      frames: 4, frameLabels: ['Wide shot', 'Medium shot', 'Close-up', 'Extreme close-up'],
      think: 'Why might a music video use lots of close-ups, while a sports broadcast uses lots of wide shots?'
    },
    vocab: ['wide-shot', 'medium-shot', 'close-up', 'extreme-close-up', 'framing'],
    objectives: [
      'Name the four shot sizes when you see them.',
      'Choose the shot size that shows what viewers need to see.',
      'Frame a wide shot, a medium shot, a close-up and an extreme close-up with a camera.'
    ],
    sections: [
      {
        title: 'You are the camera',
        intro: 'A shot size is how much of the scene fits inside the frame.',
        blocks: [
          { type: 'text', html: '<p>[[Framing]] means choosing what goes inside the edges of the picture. Zoom in and out, drag the picture around, and watch what the viewer can and can’t see. The strip under the slider shows where each shot size begins.</p>' },
          { type: 'viewfinder', media: 'scene-paper', frame: [0, 0, 1672],
            zones: [ { label: 'WS', upTo: 0.72 }, { label: 'MS', upTo: 0.38 }, { label: 'CU', upTo: 0.17 }, { label: 'ECU', upTo: 0 } ],
            presets: [ { label: 'WS', sub: 'Wide', key: 'wide', frame: [0, 0, 1672] }, { label: 'MS', sub: 'Medium', key: 'medium', frame: [285, 0, 1102] }, { label: 'CU', sub: 'Close-up', key: 'close', frame: [600, 435, 448] }, { label: 'ECU', sub: 'Extreme', key: 'ecu', frame: [730, 530, 220] } ],
            states: m => SIZE[m.zone], badge: m => BADGE[m.zone],
            indicatorTitle: 'The viewer can see',
            indicators: [
              { label: 'The room', test: m => m.frac >= 0.72 },
              { label: 'The face', test: m => m.inside('face') },
              { label: 'Both hands', test: m => m.inside('hands') },
              { label: 'The fold, up close', test: m => m.inside('fold') && m.f.w <= 520 }
            ],
            progressLabel: 'Shot sizes found',
            tasks: [
              { label: 'Find a wide shot', test: m => m.zone === 0 },
              { label: 'Find a medium shot', test: m => m.zone === 1 },
              { label: 'Find a close-up', test: m => m.zone === 2 },
              { label: 'Find an extreme close-up', test: m => m.zone === 3 }
            ],
            doneText: '<strong>You found all four shot sizes.</strong> Notice that closer is not better. Each size does a different job.' }
        ]
      },
      {
        title: 'Four sizes, four jobs',
        intro: 'Before you press record, ask: what does the viewer need to see?',
        blocks: [
          { type: 'text', html: '<p>A [[wide shot]] shows where we are. A [[medium shot]] shows who someone is and what they are doing. A [[close-up]] shows a feeling or an important detail. An [[extreme close-up]] makes viewers notice something tiny.</p><p>Editors cut between sizes to tell a story: wide to set the scene, then closer as the details start to matter.</p>' },
          { type: 'figure-row', items: [
            { media: { id: 'scene-paper', crop: [0, 0, 1672] }, alt: 'Wide shot of the room.', caption: '<strong>Wide.</strong> Where are we?' },
            { media: { id: 'scene-shelf', crop: [520, 8, 832] }, alt: 'Medium shot of a person holding a red book.', caption: '<strong>Medium.</strong> Who, doing what?' },
            { media: { id: 'scene-paper', crop: [600, 15, 480] }, alt: 'Close-up of a face.', caption: '<strong>Close-up.</strong> How do they feel?' },
            { media: { id: 'scene-paper', crop: [730, 530, 220] }, alt: 'Extreme close-up of fingertips on a crease.', caption: '<strong>Extreme.</strong> Notice this.' }
          ] },
          { type: 'callout', kind: 'consider', html: 'Closer is not better. A whole video of close-ups leaves viewers lost. Where would you put the one wide shot?' }
        ]
      },
      {
        title: 'Name that shot',
        intro: 'Six frames. Choose the shot size you see.',
        blocks: [
          { type: 'quiz', label: 'Name it', items: [
            { media: { id: 'scene-paper', crop: [0, 0, 1672], alt: 'A frame from the paper-folding scene.' }, q: 'What shot size is this?', options: ['Wide shot', { text: 'Medium shot', clue: 'A medium shot shows a person from about the waist up.' }, { text: 'Close-up', clue: 'A close-up fills the frame with one thing.' }, { text: 'Extreme close-up', clue: 'An extreme close-up shows only one tiny detail.' }], answer: 0, explain: 'The window, shelf and table show where the person is.' },
            { media: { id: 'scene-shelf', crop: [784, 162, 384], alt: 'A frame from the library scene.' }, q: 'What shot size is this?', options: [{ text: 'Wide shot', clue: 'A wide shot shows the whole place.' }, { text: 'Medium shot', clue: 'A medium shot shows a person from about the waist up.' }, 'Close-up', { text: 'Extreme close-up', clue: 'An extreme close-up shows only one tiny detail. This shows hands and a whole book.' }], answer: 2, explain: 'The hands and the book fill the frame. The room is gone.' },
            { media: { id: 'scene-paper', crop: [285, 0, 1102], alt: 'A frame from the paper-folding scene.' }, q: 'What shot size is this?', options: [{ text: 'Wide shot', clue: 'Can you see the whole room?' }, 'Medium shot', { text: 'Close-up', clue: 'A close-up fills the frame with one thing.' }, { text: 'Extreme close-up', clue: 'An extreme close-up shows one tiny detail.' }], answer: 1, explain: 'You see the face and both hands together.' },
            { media: { id: 'scene-paper', crop: [730, 530, 220], alt: 'A frame from the paper-folding scene.' }, q: 'What shot size is this?', options: [{ text: 'Wide shot', clue: 'A wide shot shows the place.' }, { text: 'Medium shot', clue: 'A medium shot shows a person from the waist up.' }, { text: 'Close-up', clue: 'Closer than a close-up: just fingertips.' }, 'Extreme close-up'], answer: 3, explain: 'Only fingertips and a bit of paper.' },
            { media: { id: 'scene-shelf', crop: [520, 8, 832], alt: 'A frame from the library scene.' }, q: 'What shot size is this?', options: [{ text: 'Wide shot', clue: 'The room is mostly gone.' }, 'Medium shot', { text: 'Close-up', clue: 'More than one thing is in the frame.' }, { text: 'Extreme close-up', clue: 'An extreme close-up shows one tiny detail.' }], answer: 1, explain: 'About waist up, with the book in hand.' },
            { media: { id: 'scene-paper', crop: [600, 15, 480], alt: 'A frame from the paper-folding scene.' }, q: 'What shot size is this?', options: [{ text: 'Wide shot', clue: 'You can’t see the room.' }, { text: 'Medium shot', clue: 'The hands aren’t in the frame.' }, 'Close-up', { text: 'Extreme close-up', clue: 'You see the whole face, not one tiny part.' }], answer: 2, explain: 'The face fills the frame. A close-up is not only for hands.' }
          ] }
        ]
      },
      {
        title: 'Now you frame it',
        intro: 'The director tells you what the viewer needs to see. Move and zoom the camera, then take the shot.',
        blocks: [
          { type: 'framing-challenge', closing: 'Five shots, four different sizes. You just filmed a sequence.', briefs: [
            { media: 'scene-shelf', start: [560, 60, 700], tag: 'WS', brief: 'Opening shot. Viewers have never seen this place. Show them where we are.', hint: [0, 0, 1672],
              judge: T.regionJudge({ minFrac: 0.85, tooTight: 'The room is cut off. Zoom out until viewers can see the tables and the windows.' }),
              success: 'Now viewers know this is a library. Wide shots set the scene.' },
            { media: 'scene-shelf', tag: 'MS', brief: 'Now show what they are doing. Viewers need the face and the red book together.', hint: [520, 8, 832],
              judge: T.regionJudge({ must: [face, book], maxFrac: 960 / W, tooWide: 'The face and the book are both in the frame, but so is a lot of empty room. Move closer.' }),
              success: 'Viewers can see who this is and what they are doing. That is the job of a medium shot.' },
            { media: 'scene-shelf', tag: 'CU', brief: 'Where does the book go? Make the red book and the shelf impossible to miss.', hint: [784, 162, 384],
              judge: T.regionJudge({ must: [book], maxFrac: 480 / W, tooWide: 'The book is in the frame, but it is still small. Get closer so it fills the picture.' }),
              success: 'The book and the shelf fill the frame. A close-up tells viewers: look at this.' },
            { media: 'scene-shelf', tag: 'CU', brief: 'They found the right spot. Show viewers how they feel about it.', hint: [490, 0, 380],
              judge: T.regionJudge({ must: [{ name: 'The face', r: 'faceTight' }], maxFrac: 430 / W, tooWide: 'The face is in the frame, but it is too small to read the expression. Get closer.' }),
              success: 'Faces show feelings. A close-up lets viewers read the expression.' },
            { media: 'scene-paper', start: [0, 0, 1672], tag: 'ECU', brief: 'New scene. One tiny detail matters here: show the fingertips pressing the crease.', hint: [730, 530, 220],
              judge: T.regionJudge({ must: [{ name: 'The fingertips on the crease', r: 'fold' }], maxFrac: 300 / W, tooWide: 'The fingertips are in the frame, but this is not extreme yet. Go as close as you can.' }),
              success: 'Nothing but fingertips and paper. An extreme close-up makes a tiny detail feel important.' }
          ] },
          { type: 'callout', kind: 'onset', html: 'Don’t zoom if you can walk. Moving the camera closer usually looks better than zooming the lens.' }
        ]
      },
      {
        id: 'studio-practice', title: 'Try it in the studio',
        intro: 'One person, one camera, every size from medium to extreme close-up.',
        blocks: [
          { type: 'text', html: '<p>Use the zoom and the three camera marks. The monitor names the shot size you have made.</p>' },
          { type: 'studio-room', lesson: 'shot-sizes' }
        ]
      }
    ],
    check: [
      { media: { id: 'scene-shelf', crop: [0, 0, 1672], alt: 'The whole library with a person at a shelf.' }, q: 'A video opens with this shot. What job is it doing?', options: ['Showing viewers where we are', { text: 'Showing how the person feels', clue: 'Can you read the face from this far away?' }, { text: 'Making viewers notice a tiny detail', clue: 'That is the job of an extreme close-up.' }], answer: 0, explain: 'A wide shot sets the scene.' },
      { q: 'Which shot shows a person from about the waist up?', options: ['Medium shot', { text: 'Wide shot', clue: 'A wide shot shows the whole person and the place.' }, { text: 'Extreme close-up', clue: 'That shows one tiny detail.' }], answer: 0, explain: 'A medium shot shows who someone is and what they are doing.' },
      { media: { id: 'scene-paper', crop: [600, 15, 480], alt: 'A face fills the frame.' }, q: 'Why would a director choose this shot?', options: ['To show how the person feels', { text: 'To show the whole room', clue: 'The room is cut out.' }, { text: 'To show what the hands are doing', clue: 'The hands aren’t in the frame.' }], answer: 0, explain: 'A close-up on a face lets viewers read the expression.' },
      { q: 'True or false: the closer the shot, the better.', keepOrder: true, options: [{ text: 'True', clue: 'Close shots leave out where we are.' }, 'False. Each size does a different job.'], answer: 1, explain: 'Pick the size that shows what viewers need.' }
    ],
    remember: [
      'A [[wide shot]] shows where we are; a [[medium shot]] shows who and what.',
      'A [[close-up]] shows a feeling or a detail; an [[extreme close-up]] makes viewers notice something tiny.',
      'Before you press record, ask what the viewer needs to see.'
    ],
    realCamera: 'Film a friend tying a shoe in three shots: a wide shot to show where they are, a medium shot to show what they are doing, and a close-up of the knot. Don’t use zoom. Move your feet instead.'
  });
})();
