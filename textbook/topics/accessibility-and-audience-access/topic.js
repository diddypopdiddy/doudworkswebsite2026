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

  const muted = card('Viewing without sound', 'A: a speaker on screen with no captions. B: the same speaker with the captions I help other students find a book.', [['A · Sound off', 'Speaker on screen', 'No words shown'], ['B · Sound off', '“I help students', 'find a book.”']]);
  const version = (label, media, note) => ({ label, segments: [{ media, from: 0, to: 12 }], note });
  T.topic({
    slug: 'accessibility-and-audience-access', minutes: 12,
    hook: hook(muted, 'Can you follow what the person says from both versions while muted?', ['Only from B', 'From both equally'], 0, 'B gives you the words when the sound is unavailable. [[Accessibility]] helps more viewers get the same information.'),
    vocab: ['accessibility', 'audio-description'], review: ['captions', 'contrast'],
    objectives: ['Choose the right access feature for information in picture or sound.', 'Test a video with its sound muted and with its picture out of view.'],
    sections: [
      teach('Watch with the sound off', 'Compare the same silent storyboard with and without the sample captions.',
        '<p>Predict which words and sounds you might miss. Play both cuts and check your prediction.</p>',
        { type: 'sequence-compare', predict: { q: 'What might disappear with the sound off?', options: ['The answer', 'The sound of books', 'Both'] }, versions: [
          version('Without captions', 'p12-profile-final', 'Without the words, you can see the library but miss what the speaker says.'),
          version('With captions', 'p12-profile-captioned', 'The on-screen captions give the spoken information and a meaningful sound cue.')
        ] }),
      teach('Make an access pass', 'The information should survive when the viewer cannot use all the media at once.',
        '<p>[[Accessibility]] includes accurate [[captions]] for spoken words and important sounds. Check reading time and [[contrast]]. [[Audio description]] uses short descriptions for important things only shown in the picture.</p><p>Watch muted, then listen without looking. Repair any essential point that disappears.</p>', figure(muted, 'A viewer who cannot hear still needs the speaker’s answer.')),
      practice('Practice: pick an access fix', 'Match the missing information to the tool that can carry it.', quiz(
        q('The door slam explains why a person turns. What should the caption include?', 'A cue like [door slams]', [['Only the next spoken line.', 'The sound carries part of the story.'], ['A note that the screen is blue.', 'The problem is a meaningful sound.']], 'Caption the sound that changes what the viewer understands.'),
        q('You can only see which key the subject presses. What can add that information to audio?', 'Audio description during a pause', [['Larger captions for the dialogue', 'Those captions do not describe the action for listeners.'], ['A louder music bed', 'Music does not tell which key was pressed.']], 'A short description carries the visual information.'),
        q('White captions disappear over a bright window. What change improves access?', 'Add a dark backing and check the whole shot.', [['Make the captions disappear sooner.', 'Viewers still need time to read the text.'], ['Move them onto the speaker’s face.', 'That can hide important picture information.']], 'A dark backing keeps light text readable across changing frames.')))
    ],
    check: [
      q('What makes B easier to understand with sound off?', 'The spoken line is visible long enough to read.', [['It promises louder sound.', 'The sound is muted.'], ['It crops the speaker’s face.', 'The difference is the text.']], 'The caption makes the spoken information available.', muted),
      q('What does audio description add in an appropriate pause?', 'The visual detail a listener needs to follow the story.', [['A transcript of every subtitle on the page.', 'Choose the actions that matter.'], ['Only a volume change.', 'Volume does not explain a visible event.']], 'Hear the information that otherwise exists only on screen.'),
      q('What can you check with your picture out of view?', 'Whether the story still makes sense from sound and description.', [['Whether the caption color matches.', 'That requires inspecting the picture.'], ['Whether the final frame is sharp.', 'Sharpness is a visual check.']], 'Listen for essential picture information that disappears.')
    ],
    remember: ['Plan [[accessibility]] for the information your audience needs.', 'Check [[captions]] with sound off.', 'Use [[audio description]] for important picture-only information.'],
    realCameraTitle: 'Try it', realCamera: 'Watch your project muted. Then listen without looking. Write down one access problem to fix.',
    notes: { sketch: 'Draw a frame with a caption and mark a pause where an audio description could fit.', frames: 1, frameLabels: ['Access check'], think: 'What information would someone lose if the sound and picture were both not available at the same time?' }
  });
})();
