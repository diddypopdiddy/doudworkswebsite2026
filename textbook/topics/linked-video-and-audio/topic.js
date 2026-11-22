(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const id = 'p8-sync-clap', rec = T.mediaRecord(id);
  const shifted = { svg: D.editTimeline({ title: 'Picture and sound drift apart', length: rec.duration, lanes: [
    { name: 'V1', clips: [['Hands clap', 0, 6]] },
    { name: 'A1', clips: [['Sound', 0.5, 6]] }
  ], marks: [['Contact', 2], ['Sound', 2.5]] }), alt: 'Video begins at zero. Matching audio begins half a second later. Hands meet at 2 seconds and the sound follows at 2.5.' };
  const tracks = api => [api.clips('V1').find(c => c.media === id), api.clips('A1').find(c => c.media === id)];
  T.topic({
    slug: 'linked-video-and-audio', minutes: 12, bigIdea: 'Picture and sound travel together until you unlink them.',
    hook: hook(shifted, 'When you play the edit, what comes first?', ['The sound of the clap', 'The picture of the clap', 'Both at the same time'], 1, 'The hands meet at 2 seconds. The sound arrives half a second later. The two parts are [[out of sync]].'),
    vocab: ['linked-clip', 'unlink', 'out-of-sync'], review: ['track', 'playhead'],
    objectives: ['Recognize a picture and sound offset.', 'Unlink, move and relink a pair of clips to restore sync.'],
    sections: [
      teach('One take can fill two tracks', 'A camera recording can put picture on V1 and its matching sound on A1.',
        '<p>A [[linked clip]] keeps its video and audio moving together when linked selection is on. When you [[unlink]], you can move one without the other.</p><p>If the picture and sound go [[out of sync]], find a moment you can both see and hear, like a clap. Line it up before you link again.</p>',
        figure(shifted, 'Shifting the audio later makes the clap arrive late.')),
      practice('Practice: break and restore sync', 'Unlink the two clips and move only the audio. Watch and listen around the clap. Then put them back together.',
        exercise(2, [id], { video: 1, audio: 1, clips: [{ media: id, duration: rec.duration, linkAudio: true }], markers: [rec.events.clap] },
          'Line up the clap', '“The sound needs to land when the hands touch. Show me what happens when it’s late, then fix it.”', [
            step('Unlink the video and audio.', 'Right-click the clip and choose Unlink Audio/Video. The keyboard panel has an Unlink selected button.', api => tracks(api).every(c => c && !c.linked), true),
            step('Make the clap late by moving only A1 half a second.', 'Move Audio on A1 to 0.5 seconds. Leave the V1 clip at zero and play it.', api => {
              const [v, a] = tracks(api);
              return v && a && api.near(v.start, 0) && api.near(a.start, 0.5);
            }, true),
            step('Return A1 to zero and link both parts again.', 'Move A1 back to the start. Select V1 and A1 together and choose Link Selected Clips.', api => {
              const [v, a] = tracks(api);
              return v && a && v.linked && a.linked && api.near(v.start - v.in, a.start - a.in);
            })
          ]))
    ],
    check: [
      q('Which track should move left to return the sound to the picture?', 'A1, by half a second.', [['V1, by half a second.', 'The picture is already at the clap mark.'], ['Both tracks together.', 'Moving both does not fix the offset.']], 'The green A1 track started later than V1.', shifted),
      q('What is the point of linking on a timeline?', 'It helps the matching sound and picture move together.', [['It combines the source files on disk.', 'A link affects timeline selection and edits.'], ['It makes the sound louder.', 'Volume has a separate control.']], 'Moving a linked pair preserves its timing.'),
      q('Can you fix sync just by linking two clips in the wrong positions?', 'No. Line them up before linking.', [['Yes, the link aligns any clap.', 'A link does not inspect the clap.'], ['Yes, linking moves the picture to zero.', 'The link does not set a timeline location.']], 'The timeline offsets stay as they were when you link.')
    ],
    remember: ['A [[linked clip]] can keep video and audio together.', '[[Unlink]] when you need to adjust just one part.', 'Fix clips that are [[out of sync]] before you link them again.'],
    realCameraTitle: 'Try it', realCamera: 'Record a single clap. Unlink picture and sound, drag audio a little later, then return it to the clap frame.',
    notes: { sketch: 'Draw two tracks and align the picture and sound of a clap.', frames: 2, frameLabels: ['Out of sync', 'Aligned'], think: 'What other action could give you a clear picture-and-sound sync point?' }
  });
})();
