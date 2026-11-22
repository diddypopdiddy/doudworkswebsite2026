(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const quiz = (...items) => ({ type: 'quiz', items });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const covers = { pair: [
    { media: 'p2-strong-still', caption: 'A · Friends at a lunch table' },
    { media: 'p2-weak-still', caption: 'B · School video project' }
  ] };
  const sheet = card('Assignment: 45-second PSA', 'Turn in one MP4, 40 to 50 seconds, with captions. Rubric: clear action, intended viewer, and readable captions.', [['Hand in', 'One MP4', '40–50 seconds', 'Captions required'], ['Scored on', 'Clear action', 'Audience fit', 'Readable captions']]);
  const watch = (title, id, a, b) => teach(title, 'Look for the first moment you understand the main request.',
    '<p>This storyboard stand-in shows how a PSA starts, develops and ends. Pause to compare what the viewer knows at both points.</p>',
    { type: 'video-segments', media: id, label: title, pauses: [{ at: 9, prompt: a }, { at: 27, prompt: b }] });
  T.topic({
    slug: 'examples-and-requirements', minutes: 12,
    hook: { ...covers, question: 'Which opening would you keep watching?', options: ['A', 'B'], reveal: 'You can prefer either opening. Study what each version shows early and how long it takes to understand what viewers should do.' },
    vocab: ['requirements', 'deliverable', 'run-time', 'rubric'],
    objectives: ['Name one difference between a clearer and weaker PSA opening.', 'Pull the deliverable, run time and scoring criteria from a brief.'],
    sections: [
      watch('Watch the clearer example', 'p2-strong-psa', 'What problem would a viewer recognize at the table?', 'What one action is the viewer about to see or try?'),
      watch('Watch the weaker example', 'p2-weak-psa', 'What do you know after the opening names?', 'What action should the ending name instead of “Be responsible”?'),
      teach('Read the assignment sheet', 'The assignment tells you what to deliver before you begin shooting.',
        '<p>The [[requirements]] are what you must meet. The [[deliverable]] is what you turn in. [[Run time]] is how long the finished work plays.</p><p>A [[rubric]] describes how the work will be judged. Make the action visible enough that somebody can score it.</p>',
        figure(sheet, 'Sample assignment sheet.')),
      practice('Practice: pull out the requirements', 'Use the assignment sheet above.',
        quiz(
          q('What is the required deliverable?', 'One captioned MP4', [['A screenplay only', 'Read the Hand in column.'], ['Two sound recordings', 'The sheet asks for one video.']], 'The sheet lists one MP4 and captions.'),
          q('Is a 70-second version ready to submit?', 'No. Trim it to 40–50 seconds.', [['Yes, as long as the story is clear.', 'The time requirement still applies.'], ['Only if you remove captions.', 'Removing captions won’t fix the run time.']], 'Seventy seconds is outside the allowed range.'),
          q('Which rubric criterion would “Be responsible” make hardest to meet?', 'Clear action', [['File type', 'File type is a deliverable setting.'], ['Capture date', 'The shown rubric lists other criteria.']], 'Viewers need to know what action you want.')))
    ],
    check: [
      q('Which printed number tells you whether 48 seconds is allowed?', 'The 40–50 second range.', [['One MP4', 'That line tells you what kind of file.'], ['Readable captions', 'That line tells you how captions are judged.']], 'Forty-eight fits the listed range.', sheet),
      q('Which early detail made the stronger example easier to follow?', 'A friend waits for an answer across the table.', [['A list of crew names.', 'The list does not show the problem.'], ['A second close view of a phone.', 'A second angle alone does not show why it matters.']], 'Showing the missed conversation gives the request a reason.'),
      q('How can you use the rubric before filming?', 'Plan at least one visible action that meets the intended message.', [['Ignore it until you have exported.', 'You may have to reshoot if the action is unclear.'], ['Only copy the example framing.', 'You still need an action that fits your purpose.']], 'A rubric tells you what evidence your video should contain.')
    ],
    remember: ['Check the [[deliverable]] and [[run time]] before shooting.', 'Turn the [[requirements]] into things the crew can check.', 'Use the [[rubric]] to decide what the audience should be able to see or hear.'],
    realCameraTitle: 'Look for it', realCamera: 'Find a school PSA. Write when you first understand the problem, what makes the action clear, and how the closing asks you to respond.',
    notes: { sketch: 'Write a still and one short line for an opening that gets to the point fast.', frames: 2, frameLabels: ['Problem', 'Action'], think: 'Which requirement could cost a reshoot if you read it too late?' }
  });
})();
