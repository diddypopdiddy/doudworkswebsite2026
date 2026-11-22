(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const line = (title, alt, length, clips, marks) => ({ svg: D.editTimeline({ title, length, lanes: [{ name: 'V1', clips }], marks }), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const photo = id => ({ id });
  const story = { pair: [
    { ...photo('still-book-close'), caption: 'A · The book opens' },
    { ...photo('still-hall-mid'), caption: 'B · The student crosses the hall' }
  ] };
  const settled = line('Assembled in story order', 'Hall, sit, open on V1 from left to right.', 6, [['Hall', 0, 2], ['Sit', 2, 4], ['Open', 4, 6, 'detail']]);
  const ids = ['p8-note-hall', 'p8-note-medium', 'p8-note-detail'];
  const prefix = (api, count) => ids.slice(0, count).every((id, i) => api.clips('V1')[i]?.media === id);
  T.topic({
    slug: 'import-and-place-clips', minutes: 12, bigIdea: 'Bring clips in and put them on the timeline.',
    hook: hook(story, 'Which shot should come first if the student walks to the library to find the note?', ['A · The book opens', 'B · The student crosses the hall'], 1, 'The trip through the hall happens before the book opens. [[Import]] each [[clip]] so you can place the shots in story order.'),
    vocab: ['import', 'clip', 'append'], review: ['media-pool', 'timeline'],
    objectives: ['Distinguish bringing a clip into the pool from putting it on a timeline.', 'Append clips to tell a short story in order.'],
    sections: [
      teach('From files to a sequence', 'A file in the pool is available for your edit. The timeline says when it plays.',
        '<p>To [[import]] is to make source files available inside an editor. You can use a [[clip]] in several places without making more source files.</p><p>Drag from the [[media pool]] to a specific spot. To [[append]], add the clip after the last one on the selected track.</p>',
        [{ type: 'figure-row', items: [figure({ svg: D.editorLayout(false), alt: 'The Practice Editor with a Media Pool and a timeline.' }, 'Choose a source in the pool.'), figure(settled, 'Append builds the sequence from left to right.')] }][0]),
      practice('Practice: The Note in three shots', 'The footage is in the Media Pool for you. Append each shot in the order the story needs.',
        exercise(1, ids, { video: 1, audio: 1 }, 'Build the sequence', '“Show how the student gets to the table before they open the book.”', [
          step('Append Hall first.', 'Double-click Hall in the Media Pool, or choose Hall and Append under Edit with the keyboard.', api => prefix(api, 1)),
          step('Append the table shot next.', 'Append the medium shot. It should touch the end of Hall.', api => prefix(api, 2)),
          step('Append the book detail third.', 'Finish with the close picture of the book. Play the sequence from the start.', api => prefix(api, 3) && api.clips('V1').length === 3 && !api.gaps('V1').length)
        ]))
    ],
    check: [
      q('What happened when the Open clip was added after Sit?', 'It was appended.', [['It was imported only.', 'It appears on the timeline as well as in the pool.'], ['It replaced the Sit clip.', 'Sit and Open both appear on V1.']], 'Open was added after the last clip.', settled),
      q('A clip is available in the Media Pool but missing from playback. What should you check?', 'Whether you placed it on the timeline.', [['Whether the file ends in .mp4', 'The editor already has the clip in the pool.'], ['Whether you started a second project', 'The issue is where the clip was placed within this project.']], 'Import makes a file available. Placement puts it in the edit.'),
      q('How can you add a new shot after the last clip?', 'Append it.', [['Rename its source file.', 'The filename cannot choose the timing.'], ['Hide the track.', 'A hidden track won’t play.']], 'Append starts the shot where the final clip ends.')
    ],
    remember: ['[[Import]] makes a file available in the pool.', 'One [[clip]] can appear several times in the same edit.', '[[Append]] puts a shot after the final clip.'],
    realCameraTitle: 'Try it', realCamera: 'Choose three phone clips. Import them and append them in the order a viewer needs to see them.',
    notes: { sketch: 'Plan three thumbnails in the order you would place them.', frames: 3, frameLabels: ['First', 'Second', 'Third'], think: 'How do you know a clip is in the edit and ready to play?' }
  });
})();
