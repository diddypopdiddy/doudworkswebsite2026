(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const quiz = (...items) => ({ type: 'quiz', items });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const cuts = card('Two edit notes', 'A has the whole first assembly but a long wait. B has trimmed the clips, a title, and a checked mix.', [['A · 79 seconds', 'First assembly', 'Long wait remains'], ['B · 60 seconds', 'Timing checked', 'Mix and titles done']]);
  const version = (label, media, note) => ({ label, segments: [{ media, from: 0, to: 12 }], note });
  T.topic({
    slug: 'assemble-refine-and-finish', minutes: 12,
    hook: hook(cuts, 'Which one is more likely to be the first rough cut?', ['A', 'B'], 0, 'A puts the story together but still has waiting time. A [[rough cut]] tests the story before you polish each cut.'),
    vocab: ['rough-cut', 'fine-cut', 'picture-lock', 'final-cut'],
    objectives: ['Recognize rough, fine, picture-lock and final stages from specific evidence.', 'Save and label successive cuts so you can return to a working version.'],
    sections: [
      teach('Watch the Profile change', 'Predict what makes the biggest difference, then play the three storyboard cuts.',
        '<p>Track the wait at the opening, the long shot at the shelf, and the help viewers get from the final graphics.</p>',
        { type: 'sequence-compare', predict: { q: 'What will make the clearer cut feel different first?', options: ['Less waiting', 'A title', 'A different detail'] }, versions: [
          version('Rough', 'p12-profile-rough', 'The beginning still waits. You can already tell the main idea.'),
          version('Fine', 'p12-profile-fine', 'The first answer starts sooner and the cut to the shelf has a purpose.'),
          version('Final', 'p12-profile-final', 'The opening names the subject and the ending finishes on the line viewers need.')
        ] }),
      teach('Know what is ready', 'Each cut solves a different problem.',
        '<p>A [[rough cut]] tests the order. A [[fine cut]] tightens the timing. At [[picture lock]] the shot choices and timing have been approved so sound and graphics can finish against them.</p><p>A [[final cut]] has its picture, mix, graphics and captions checked. Save named versions so you can recover an earlier decision.</p>', figure(cuts, 'A useful draft can still have work to do.')),
      practice('Practice: find the stage', 'Read the evidence before choosing a stage.', quiz(
        q('The story is in order. An empty gap still interrupts the second answer.', 'Rough cut', [['Final cut', 'The gap needs a decision.'], ['Picture lock', 'Timing has not settled yet.']], 'The first assembly lets the editor see what to fix.'),
        q('The edit trims every shot and the teacher approves the timing. Sound and captions need a pass.', 'Picture lock', [['Final cut', 'The sound and captions are pending.'], ['Rough cut', 'The picture timing has been approved.']], 'Lock the picture first so sound and captions match its timing.'),
        q('Which filename makes a revision easier to recover?', 'Profile_v03_fine', [['FinalFinal', 'The name does not tell you the stage or version.'], ['Profile copied again', 'Use a stable version number to see what changed.']], 'The version number and stage identify the file.')))
    ],
    check: [
      q('Which candidate is closest to the final cut?', 'B', [['A', 'A still has the long wait.']], 'B is timed and its mix and titles are checked.', cuts),
      q('Why do sound and captions benefit from picture lock?', 'They can time their work to approved edits.', [['You can delete the source clips.', 'The edit still needs the originals.'], ['You can ignore the run time.', 'Timing stays important in the finishing pass.']], 'The reference picture timing is stable.'),
      q('What do you save each time you move to a new stage?', 'A clearly named version.', [['Only a screenshot.', 'A screenshot will not reopen the edit.'], ['Only the oldest rough cut.', 'You need to track the changes you made.']], 'Separate versions let you restore a previous cut.')
    ],
    remember: ['Use a [[rough cut]] to test the story.', 'Use the [[fine cut]] to tighten timing, then agree on [[picture lock]].', 'Check everything before you label the [[final cut]].'],
    realCameraTitle: 'Try it', realCamera: 'Save a named copy at each editing stage. Compare the openings and record one change in your notes.',
    notes: { sketch: 'Draw a draft cut and a fine cut. Mark which pause you would shorten.', frames: 2, frameLabels: ['Rough', 'Fine'], think: 'Which extra work could you create by changing timing after picture lock?' }
  });
})();
