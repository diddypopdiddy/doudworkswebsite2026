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

  const media = 'p8-cough';
  const rec = T.mediaRecord(media);
  const { removeStart: a, removeEnd: b } = rec.events;
  const wave = line('The unwanted sound', 'A sentence, a cough between two dashed cut marks, and the next sentence.', rec.duration,
    [['Part 1', 0, a], ['Cough', a, b, 'detail'], ['Part 2', b, rec.duration]], [['First cut', a], ['Second cut', b]]);
  const kept = (api, c) => api.clips('V1').filter(c).length;
  T.topic({
    slug: 'split-remove-and-close-gaps', minutes: 12, bigIdea: 'Cut a clip in two, remove a piece, leave no hole.',
    hook: hook(wave, 'Which region could you remove and keep both parts?', ['The part labeled Cough', 'Everything after the first mark', 'The first part'], 0, 'Only the cough is in the middle. Use the [[blade]] to [[split]] on each side of it. Then take out the middle and close the [[gap]].'),
    vocab: ['blade', 'split', 'gap'], review: ['playhead', 'timeline'],
    objectives: ['Split on each side of an unwanted section.', 'Remove the middle and close the gap without losing the rest.'],
    sections: [
      teach('Two cuts free the middle', 'A split creates two timeline pieces at one moment.',
        '<p>Put the [[playhead]] at the start of the mistake. Use the [[blade]] or the split-at-playhead command to [[split]] there. Do the same at the end.</p><p>Select the piece between those cuts. Delete it and close the [[gap]], or use ripple delete to do both at once.</p>',
        figure(wave, 'Cut at both marks, then play across the edit and listen.')),
      practice('Practice: remove the interruption', 'Keep the two useful parts and listen at the cut for any leftover sound.',
        exercise(2, [media], { video: 1, audio: 1, clips: [{ media, duration: rec.duration, linkAudio: true }], markers: [a, b] },
          'Take the cough out', '“Keep both parts of the take. I don’t want the cough or a black hole between them.”', [
            step('Make two splits around the cough.', 'Use the two markers as the cut points. In the keyboard controls select the clip each time before using Split at playhead.', api =>
              kept(api, c => api.near(c.out, a)) === 1 && kept(api, c => api.near(c.in, a) && api.near(c.out, b)) === 1 && kept(api, c => api.near(c.in, b)) === 1, true),
            step('Keep the first and last parts only.', 'Select the short middle clip, then delete it.', api =>
              kept(api, c => api.near(c.in, 0) && api.near(c.out, a)) === 1 && kept(api, c => api.near(c.in, b) && api.near(c.out, rec.duration)) === 1 && api.clips('V1').length === 2),
            step('Close the picture and sound gaps.', 'Close the empty space on both tracks, or ripple delete the linked middle when you remove it.', api =>
              ['V1', 'A1'].every(track => api.clips(track).length === 2 && !api.gaps(track).length))
          ]))
    ],
    check: [
      q('Where do you split to remove the cough?', 'At both edges of the cough.', [['Only before it.', 'The second part would still contain the cough.'], ['At the end of Part 2.', 'The mistake is between the two dashed marks.']], 'You need a separate piece so both useful parts stay.', wave),
      q('After you delete the mistake, what should you look for?', 'An empty gap between the two pieces.', [['A new source file.', 'Splits happen in the timeline.'], ['A different frame rate.', 'Removing a middle piece doesn’t change the camera setting.']], 'The gap can make the screen go black.'),
      q('Why play across the cut once it is closed?', 'To check that both picture and sound flow through it.', [['To change its file extension.', 'Playback cannot rename a file.'], ['To resize the track.', 'A taller track would not change the edit.']], 'You can hear transitions or stray noise only when you play through.')
    ],
    remember: ['Use the [[blade]] or the playhead command to [[split]] on both sides.', 'Remove the middle piece and close the [[gap]].', 'Move the [[playhead]] before the cut and play across it.'],
    realCameraTitle: 'Try it', realCamera: 'Record two sentences with a tap between them. Cut out the tap and play across the edit.',
    notes: { sketch: 'Mark two cuts around one unwanted sound. Sketch the new timeline.', frames: 2, frameLabels: ['Before', 'After'], think: 'How can you tell you removed the wrong piece before you export?' }
  });
})();
