(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });

  const eras = card('Three ways to edit', 'Splicer with film strips, two tape decks marked Play and Record, and an editor timeline that can move clips.', [
    ['Film', 'Cut and join', 'film strips'], ['Tape', 'Play deck to', 'record deck'], ['Computer', 'Reorder clips', 'on tracks']
  ]);
  T.topic({
    slug: 'tape-workflows-and-nonlinear-editing', minutes: 10, bigIdea: 'Editing used to mean cutting film or copying tape in order.',
    hook: hook({ ...eras }, 'Which setup used a physical cut in the recording?', ['Film bench', 'Tape decks', 'Computer'], 0, 'The film bench joined two ends of physical film after a cut. The join is a [[film splice]].'),
    vocab: ['film-splice', 'linear-editing', 'nonlinear-editing'], review: ['timeline', 'source-media'],
    objectives: ['Distinguish film splicing, tape editing and digital editing.', 'Explain why changes are easier in a nonlinear editor.'],
    sections: [
      teach('Film and tape', 'The hardware shaped which changes an editor could make.',
        '<p>A [[film splice]] joins two cut pieces of film. Editors could change their order by making and joining new cuts.</p><p>In tape-to-tape [[linear editing]], one deck plays and another records, usually in order. Changing the opening could mean copying later shots again.</p>',
        figure(eras, 'Look at what holds the edit in each workflow.')),
      teach('Digital choices', 'A digital project can point back to the same source moment many ways.',
        '<p>In [[nonlinear editing]], the [[timeline]] is a set of decisions about clips. You can move a piece from the end to the start without copying the entire tape again.</p>',
        { type: 'quick-check', q: 'You reorder a clip on the timeline. What happens to the original source file?', options: ['It stays intact', { text: 'It gets cut in two', clue: 'The timeline records the decisions, and the original stays on the drive.' }], answer: 0, explain: 'The timeline points to a file. It does not replace the source.' })
    ],
    check: [
      q('Which setup records the edit on a separate tape?', 'Tape decks', [['Film bench', 'Film pieces are joined physically.'], ['Computer', 'Clips can stay as files on the drive.']], 'One deck plays the source and the other records the chosen section.', eras),
      q('Which tool joins two strips of physical film?', 'A film splicer', [['A tape record deck', 'The deck copies an electronic signal onto tape.'], ['A timeline playhead', 'The line marks time in the editor.']], 'The splicer makes a physical join.'),
      q('Why can you try a different ending quickly in a nonlinear editor?', 'You can move references to clips on the timeline.', [['The original camera files are deleted', 'A change to the edit leaves the files usable.'], ['The tape winds faster', 'The digital timeline can jump straight to a moment.']], 'The editor can reach different clip ranges directly.')
    ],
    remember: ['A [[film splice]] physically joins pieces.', 'In tape [[linear editing]], the record deck builds the cut in order.', 'In [[nonlinear editing]], you can rearrange a [[timeline]] while preserving the source.'],
    realCameraTitle: 'Look for it', realCamera: 'Find a behind-the-scenes film-editing demo. Compare the editor’s workbench with your school’s timeline.',
    notes: { sketch: 'Draw the record deck next to the play deck. Show the direction the signal travels.', frames: 1, frameLabels: ['Tape editing'], think: 'How does a nonlinear editor make it easier to try two endings?' }
  });
})();
