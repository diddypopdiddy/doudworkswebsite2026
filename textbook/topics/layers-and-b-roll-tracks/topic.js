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

  const interview = 'p8-interview', sound = 'p8-interview-audio', detail = 'p8-note-detail', hall = 'p8-note-hall';
  const lanes = { svg: D.editTimeline({ title: 'A detail covers the interview', length: 10, lanes: [
    { name: 'V2', clips: [['Book detail', 2, 5, 'detail'], ['Hall', 7, 9, 'detail']] },
    { name: 'V1', clips: [['Interview picture', 0, 10]] },
    { name: 'A1', clips: [['Interview sound', 0, 10]] }
  ], marks: [['3 s', 3]] }), alt: 'V2 has a book shot from 2 to 5 and a hallway shot from 7 to 9. V1 and A1 hold the interview from 0 to 10 seconds.' };
  T.topic({
    slug: 'layers-and-b-roll-tracks', minutes: 15, bigIdea: 'Higher video tracks cover the ones below.',
    hook: hook(lanes, 'At the dashed mark, which picture should viewers see?', ['The interview', 'The book detail', 'The hallway'], 1, 'The book detail is on V2 at that moment. A higher [[video track]] acts as a [[layer]] over the picture below.'),
    vocab: ['video-track', 'layer'], review: ['b-roll', 'track', 'timeline'],
    objectives: ['Predict which picture will be visible where tracks overlap.', 'Put two B-roll clips on V2 while the interview continues underneath.'],
    sections: [
      teach('The top picture wins', 'An opaque clip on a higher video track covers the image under it.',
        '<p>Use V1 for the interview and V2 for a second [[layer]] of pictures. A [[video track]] above the interview can show [[B-roll|b-roll]] without cutting the interview picture on V1.</p><p>Keep the voice on A1. When the V2 clip ends, the interview picture shows through again.</p><p><strong>Practice narration.</strong> “I reach for the book on the table. A loose crease makes this page easy to find. The note tells me to come back through the hallway.”</p>',
        figure(lanes, 'Follow the vertical mark through both picture tracks and A1.')),
      practice('Practice: show what the speaker describes', 'Keep the interview from 0 to 10 seconds. Add short book and hall clips on V2. Leave gaps on V2 to return to the interview.',
        exercise(2, [interview, sound, detail, hall], { video: 2, audio: 1, clips: [
          { media: interview, track: 'V1', start: 0, duration: 10 },
          { media: sound, track: 'A1', start: 0, duration: T.mediaRecord(sound).duration }
        ] }, 'Cover the interview', '“Keep my voice throughout. Let the viewer see the book while I explain it, then return to me.”', [
          step('Keep the interview picture on V1 and its narration on A1.', 'Leave the first video and audio tracks in place.', api =>
            api.clips('V1').some(c => c.media === interview && api.near(c.duration, 10)) && api.clips('A1').some(c => c.media === sound && api.near(c.start, 0))),
          step('Put the book detail on V2, starting near 2 seconds.', 'Drag to V2. For keyboard placement, pick V2 and Overwrite at 2 seconds. Then trim to under 3 seconds.', api =>
            api.clips('V2').some(c => c.media === detail && api.near(c.start, 2, 0.2) && c.duration > 0.8 && c.end <= 5.25)),
          step('Add the hall shot near 7 seconds. Return to the speaker before 10.', 'Place the hall on V2 at 7 seconds and trim it so it ends by 9.25.', api =>
            api.clips('V2').some(c => c.media === hall && api.near(c.start, 7, 0.2) && c.duration > 0.8 && c.end <= 9.25))
        ]))
    ],
    check: [
      q('What stays audible under the book detail?', 'The interview sound on A1.', [['A new sound caused by V2.', 'The top video layer chooses the picture.'], ['Nothing while V2 is visible.', 'A1 still has a continuous clip.']], 'The picture can change without interrupting the audio.', lanes),
      q('What will play in a gap on V2 with a picture on V1?', 'The picture on V1', [['Black, even though V1 is on', 'A gap on the higher track is see-through.'], ['The last V2 frame indefinitely', 'The V2 clip ended.']], 'A lower track shows through an empty higher track.'),
      q('When should B-roll cover an interview?', 'When it gives viewers a useful detail about what they hear.', [['At every cut, even if unrelated', 'The extra shot needs to make sense with the words.'], ['Only when the camera recorder is paused', 'B-roll is an edit decision.']], 'B-roll shows something the speaker mentions or adds context.')
    ],
    remember: ['A higher [[video track]] can cover a lower one.', 'Use a [[layer]] of [[B-roll|b-roll]] to show a detail while the speaker continues.', 'Listen to the whole [[timeline]] after adding the pictures.'],
    realCameraTitle: 'Try it', realCamera: 'Record a ten-second explanation about one object and a close-up of that object. Cover part of the explanation with the close-up.',
    notes: { sketch: 'Draw V1, V2 and A1. Mark two places where B-roll helps the viewer.', frames: 1, frameLabels: ['Layer plan'], think: 'Why might you cut back to the speaker after the close-up?' }
  });
})();
