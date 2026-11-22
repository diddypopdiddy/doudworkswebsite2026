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

  const board = card('Two notes on the Profile', 'A says Looks good. B says at 0:18, the music drowns the second answer.', [['A · “Looks good”', 'No time or action'], ['B · “0:18”', 'Music covers', 'the second answer']]);
  const checklist = { type: 'steps', items: [
    'Watch for framing and focus. <a href="../../topics/camera-judgment/index.html">Review camera judgment</a>.',
    'Listen for a clear voice and clean transitions. <a href="../../topics/sound-judgment/index.html">Review sound judgment</a>.',
    'Read each title and caption. <a href="../../topics/graphics-judgment/index.html">Review graphics judgment</a>.',
    'Export the revised file and watch it through.'
  ] };
  T.topic({
    slug: 'feedback-revision-and-final-checks', minutes: 12,
    hook: hook(board, 'Which note tells you where to start a revision?', ['A', 'B'], 1, 'B gives a time and a sound problem. Specific [[feedback]] lets you make and verify a [[revision]].'),
    vocab: ['feedback', 'revision', 'notes', 'checklist'],
    objectives: ['Write feedback with a time, a viewer problem and a specific change.', 'Check the revised export for picture, sound, words and captions.'],
    sections: [
      teach('Turn a reaction into a change', 'A crew needs to know what a viewer experienced and where.',
        '<p>Useful [[feedback]] can name a moment, what made it hard to follow and what to try next. Write [[notes]] beside the exact time.</p><p>A [[revision]] changes one or more of those problems. Play the new version to see if the change helped.</p>', figure(board, 'A time and a problem make this note actionable.')),
      teach('Run the final checklist', 'Watch, listen and read so nothing gets lost in the export.',
        '<p>Use a [[checklist]] to repeat the same four passes after each serious change.</p>', checklist),
      practice('Practice: rewrite the note', 'Pick the revision another editor can actually try.', quiz(
        q('Rewrite “the sound is bad.”', 'At 0:18 lower the music until the second answer is clear.', [['Make the sound really good.', 'You need to point to one problem.'], ['Switch to a new camera.', 'The note is about what you hear.']], 'This names the time, the cause and a testable change.'),
        q('Rewrite “I missed the name.”', 'Hold the name on screen until you can read it at normal speed.', [['Use a better font everywhere.', 'The viewer missed one piece of information.'], ['Add another title at the end.', 'The audience needs the name when they meet the speaker.']], 'Reading time gives you a specific revision to check.'),
        q('The export plays cleanly, but a caption drops the word “not.” What do you do?', 'Correct the caption, export again and watch the line.', [['Leave the caption because the audio is fine.', 'Readers will get a different statement.'], ['Remove all captions.', 'The access check found a word to fix.']], 'The corrected export must carry the right meaning.')))
    ],
    check: [
      q('What belongs in A to make it useful?', 'A time and a detail the editor can change.', [['The word “very.”', 'That adds emphasis without a checkable fact.'], ['The editor’s name.', 'The note needs evidence from the video.']], 'Specific feedback locates the viewer’s problem.', board),
      q('How do you know a revision improved intelligibility?', 'Play the revised answer and listen for each word.', [['Look at the filename.', 'The new name alone does not prove the change worked.'], ['Compare the file sizes only.', 'Size does not tell you whether the voice is clear.']], 'Use the viewer’s actual experience as the test.'),
      q('Which checks should you repeat on the export?', 'Picture, audio, graphics and captions.', [['Only the first title.', 'Other problems can appear mid-export.'], ['Only the last frame.', 'Watch through each stage of the clip.']], 'Anything can change at export, so inspect the file itself.')
    ],
    remember: ['Write [[feedback]] another person can act on.', 'Use time-stamped [[notes]] and check each [[revision]].', 'Run the final [[checklist]] on the actual export.'],
    realCameraTitle: 'Try it', realCamera: 'Give a classmate three notes. In each, name the time, what you noticed and one change they can try.',
    notes: { sketch: 'Write a vague note on the left and a rewrite with a timestamp on the right.', frames: 2, frameLabels: ['Vague', 'Actionable'], think: 'What evidence would tell you your revision fixed the problem?' }
  });
})();
