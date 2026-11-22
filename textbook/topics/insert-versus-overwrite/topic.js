(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const line = (title, alt, length, clips, marks) => ({ svg: D.editTimeline({ title, length, lanes: [{ name: 'V1', clips }], marks }), alt });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const a = 'p8-note-hall', b = 'p8-note-medium', pick = 'p8-pickup';
  const clip = T.mediaRecord(pick);
  const base = [{ media: a, start: 0, duration: 2 }, { media: b, start: 2, duration: 4 }];
  const inserted = line('Edit A · 8 seconds', 'Hall zero to two, note two to four, sit four to eight.', 8, [['Hall', 0, 2], ['Note', 2, 4, 'detail'], ['Sit', 4, 8]]);
  const overwritten = line('Edit B · 6 seconds', 'Hall zero to two, note two to four, sit four to six.', 6, [['Hall', 0, 2], ['Note', 2, 4, 'detail'], ['Sit', 4, 6]]);
  const at = 2;
  const hasPickup = api => api.clips('V1').some(c => c.media === pick && api.near(c.start, at));
  T.topic({
    slug: 'insert-versus-overwrite', minutes: 12, bigIdea: "Insert pushes clips later. Overwrite replaces what's there.",
    hook: hook({ pair: [inserted, overwritten] }, 'Both added the same two seconds of Note. Which edit got longer?', ['A · 8 seconds', 'B · 6 seconds'], 0, 'Edit A pushed the whole Sit shot later. That is an [[insert edit]]. B replaced the time already there: an [[overwrite edit]].'),
    vocab: ['insert-edit', 'overwrite-edit'], review: ['playhead', 'duration'],
    objectives: ['Identify which edit changes the duration of the sequence.', 'Insert or overwrite the same clip at a marked point.'],
    sections: [
      teach('Same start, different result', 'Both edits start at the playhead. The clips after it tell you which operation happened.',
        '<p>An [[insert edit]] makes room for the new clip and pushes the footage to its right later. An [[overwrite edit]] writes into the time already there.</p><p>If an overwrite fits within the edit, the total [[duration]] stays the same. If it goes past the end, the edit gets longer.</p>',
        { type: 'figure-row', items: [inserted, overwritten] }),
      practice('Practice: a two-second note', 'Choose the book detail in the Media Pool. Make both edits at the 2-second marker.',
        exercise(2, [a, b, pick], { video: 1, audio: 1, clips: base, markers: [at] },
          'Choose the kind of edit', '“Add the note detail first as extra time, then replace the first two seconds of Sit instead.”', [
            step('Insert the detail at the marker. Reach eight seconds.', 'Park at 2 seconds, select the detail and use Insert (F9). The Sit clip should stay whole.', api =>
              hasPickup(api) && api.near(api.duration, 6 + clip.duration) && api.clips('V1').some(c => c.media === b && api.near(c.duration, 4)), true),
            step('Undo the insert. Overwrite at the same marker. Keep six seconds.', 'Undo, park the playhead back at 2 seconds and use Overwrite (F10). The end of Sit should stay at 6 seconds.', api =>
              hasPickup(api) && api.near(api.duration, 6) && api.clips('V1').some(c => c.media === b && api.near(c.in, clip.duration)))
          ]))
    ],
    check: [
      q('What happened to the Sit clip in Edit B?', 'Its first two seconds were replaced.', [['It kept all four seconds.', 'The Sit block stops at six and starts at four.'], ['It moved later and stayed whole.', 'Only Edit A keeps all four seconds.']], 'Sit now fills two seconds. The detail took its earlier time.', overwritten),
      q('Which edit keeps every existing shot but gives the new shot extra time?', 'Insert', [['Overwrite', 'An overwrite puts the new material into existing time.'], ['Normal delete', 'Delete removes a shot.']], 'Insert makes extra room at the playhead.'),
      q('A PSA must stay exactly 30 seconds. You want to replace two seconds in the middle. Which edit fits?', 'Overwrite with a two-second clip.', [['Insert a two-second clip.', 'Insert adds time to the timeline.'], ['Append at the end.', 'Appending extends the end.']], 'An overwrite stays within the existing 30 seconds.')
    ],
    remember: ['An [[insert edit]] makes room for new footage.', 'An [[overwrite edit]] uses time already there.', 'Check [[duration]] and play across the edit after you choose.'],
    realCameraTitle: 'Try it', realCamera: 'Make a practice sequence with the same shot added by Insert and Overwrite. Label the two results and compare their lengths.',
    notes: { sketch: 'Draw the same new two-second clip inserted and overwritten at the middle cut.', frames: 2, frameLabels: ['Insert', 'Overwrite'], think: 'Which edit would you choose for a fixed-length announcement and why?' }
  });
})();
