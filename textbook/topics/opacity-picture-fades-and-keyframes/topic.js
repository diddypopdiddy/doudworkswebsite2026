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

  const graph = { svg: D.svg('<rect width="320" height="180" fill="#f3f1ec"/><path d="M48 34v108h250" fill="none" stroke="#171b1f" stroke-width="2"/><polyline points="48,142 118,48 228,48 298,142" fill="none" stroke="#3157c8" stroke-width="4"/><circle cx="48" cy="142" r="5"/><circle cx="118" cy="48" r="5"/><circle cx="228" cy="48" r="5"/><circle cx="298" cy="142" r="5"/>' + D.txt(14, 51, '100%') + D.txt(22, 142, '0%') + D.txt(136, 166, 'Time') + D.txt(134, 38, 'Opacity')), alt: 'Opacity rises from zero to 100 percent, holds, then returns to zero. Four dots mark the changes.' };
  const id = 'p8-note-detail';
  T.topic({
    slug: 'opacity-picture-fades-and-keyframes', minutes: 12, bigIdea: 'Keyframes change a setting over time.',
    hook: hook(graph, 'Which part of the graph would bring a picture up from black?', ['The rising line', 'The level line', 'The falling line'], 0, 'The rising line goes from 0% to 100%. Increasing [[opacity]] over time makes a [[fade in]] when black is underneath.'),
    vocab: ['opacity', 'keyframe', 'fade-in', 'fade-out'], review: ['layer'],
    objectives: ['Read the position and value of opacity keyframes.', 'Apply a fade at each edge and check how the picture changes.'],
    sections: [
      teach('Change the picture over time', 'An opacity change can reveal or hide a picture gradually.',
        '<p>[[Opacity]] is how solid the picture appears. At 0% you see the layer beneath. At 100% the picture covers it.</p><p>A [[keyframe]] sets a value at a time. The editor changes the value between two points. Rise from 0% to make a [[fade in]]. Fall to 0% for a [[fade out]].</p>',
        figure(graph, 'The dots are keyframes. A flat line holds the value steady.')),
      practice('Practice: open and close from black', 'Use Dip to Color on both clip edges. In this exercise the color is black and the transitions stand in for keyframes.',
        exercise(3, [id], { video: 1, audio: 1, clips: [{ media: id, duration: 5 }] },
          'Ease the picture in and out', '“Let the viewer ease into the detail, see it clearly, then return to black.”', [
            step('Add a dip from black at the start.', 'Open Effects and then Video Transitions. Drag Dip to Color to the beginning of the clip.', api => api.clips('V1').some(c => c.media === id && c.transitionIn === 'dip')),
            step('Add a dip to black at the end.', 'Put the same transition on the last edge. Play the whole clip to see both fades.', api => api.clips('V1').some(c => c.media === id && c.transitionOut === 'dip'))
          ], { libraryStart: 'vtrans' }))
    ],
    check: [
      q('What happens between the second and third keyframes?', 'Opacity stays at 100%.', [['Opacity keeps rising.', 'The line is flat there.'], ['The picture fades out.', 'The drop begins at the third dot.']], 'Both dots set the same opacity value.', graph),
      q('What two values can make a fade out over black?', 'Start at 100% and end at 0%.', [['Start at 0% and end at 100%.', 'That brings the picture in.'], ['Start and end at 100%.', 'Matching values hold the picture.']], 'The picture disappears as opacity drops.'),
      q('What does a keyframe store?', 'A setting’s value at a point in time.', [['A copy of the source file.', 'A keyframe changes a setting on the timeline.'], ['The length of the whole edit.', 'Its value can be a property like opacity.']], 'Time and value are both needed.')
    ],
    remember: ['[[Opacity]] controls how solid a layer looks.', 'A [[keyframe]] stores the value at one moment.', 'A [[fade in]] brings the picture up. A [[fade out]] lets it drop away.'],
    realCameraTitle: 'Try it', realCamera: 'Fade a five-second shot in and out over black. Compare a short fade with a slow fade and choose one for the mood.',
    notes: { sketch: 'Draw an opacity graph for a fade in, a hold and a fade out. Mark the keyframes.', frames: 1, frameLabels: ['Opacity over time'], think: 'Why might a long fade feel different from a quick cut to black?' }
  });
})();
