(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const line = (title, alt, length, clips, marks) => ({ svg: D.editTimeline({ title, length, lanes: [{ name: 'V1', clips }], marks }), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const ids = ['p8-note-hall', 'p8-note-medium', 'p8-note-detail', 'p8-note-reaction'];
  const plot = card('Storyboard', 'The storyboard order is hall, sit, open, react.', [['1 · Hall', 'Walk in'], ['2 · Table', 'Sit down'], ['3 · Book', 'Open it'], ['4 · Face', 'React']]);
  const wrong = line('Timeline draft', 'Hall, react, open, sit on V1, with spaces.', 12, [['Hall', 0, 2], ['React', 3, 5, 'detail'], ['Open', 6, 8], ['Sit', 9, 11]]);
  T.topic({
    slug: 'move-and-reorder-clips', minutes: 12, bigIdea: 'Drag clips into story order.',
    hook: hook({ pair: [plot, wrong] }, 'Which shot jumps ahead of its cause in the draft?', ['The hall shot', 'The reaction', 'The book opening'], 1, 'The draft puts the reaction before the book opens. [[Reorder]] the shots so the viewer sees the clue before the reaction.'),
    vocab: ['reorder', 'selection-mode'], review: ['select', 'snapping', 'timeline', 'clip'],
    objectives: ['Select a clip and move it without losing surrounding clips.', 'Put four clips in the order a viewer can follow.'],
    sections: [
      teach('Pick up the clip, keep the story', 'In Selection mode you can move whole clips by dragging their middles.',
        '<p>Use [[Selection mode]] and [[select]] the clip. Drag the center of it. Dragging the ends changes its length instead.</p><p>To [[reorder]] clips safely, move a clip to open space first. An occupied spot can overwrite footage. Keep [[snapping]] on to align the final edges.</p>',
        figure(wrong, 'The spaces in this draft give you places to park a shot.')),
      practice('Practice: repair the story order', 'Move React to empty space beyond 12 seconds first. Then move Sit before Open and bring React back to the end.',
        exercise(1, ids, { video: 1, audio: 1, clips: [0, 3, 6, 9].map((start, i) => ({ media: ids[[0, 3, 2, 1][i]], track: 'V1', start, duration: 2 })) },
          'Put the cause first', '“Show the book opening before we see the student react.”', [
            step('Move React after the book opens.', 'Park React past the end so you have room for the other clips.', api => {
              const list = api.clips('V1').map(c => c.media);
              return list.length === 4 && list.indexOf(ids[3]) > list.indexOf(ids[2]);
            }),
            step('Keep all four in storyboard order.', 'The final order is Hall, Sit, Open, React. Each shot still runs two seconds.', api => {
              const clips = api.clips('V1');
              return clips.length === 4 && clips.every((c, i) => c.media === ids[i] && api.near(c.duration, 2));
            })
          ]))
    ],
    check: [
      q('What should be second in the corrected edit?', 'Sit down', [['React', 'First show what caused the reaction.'], ['Open the book', 'The storyboard shows the student sitting first.']], 'The viewer sees the student reach the table and sit before the book opens.', plot),
      q('Where do you grab a clip to move it?', 'Near its middle.', [['At its left edge.', 'An edge is a trim handle.'], ['On the time ruler.', 'The ruler moves the playhead.']], 'Drag the body of the selected clip to move it.'),
      q('What keeps you from overwriting the shot already in a slot?', 'Park one clip in an empty area before the swap.', [['Move them both into the same area.', 'The editor must decide which clip occupies that time.'], ['Change the file names.', 'The overlap is on the timeline.']], 'Empty timeline space lets you move the other clip without overlap.')
    ],
    remember: ['Use [[Selection mode]] to move the whole clip.', '[[Select]] and drag the body rather than its trim handle.', '[[Reorder]] shots so a cause makes sense before its result.'],
    realCameraTitle: 'Try it', realCamera: 'Make two versions of your three-clip sequence. Move the reveal earlier in the second. Describe how the story changes.',
    notes: { sketch: 'Sketch a clip swap using empty timeline space.', frames: 2, frameLabels: ['Draft', 'Reordered'], think: 'What would viewers assume if the reaction played first?' }
  });
})();
