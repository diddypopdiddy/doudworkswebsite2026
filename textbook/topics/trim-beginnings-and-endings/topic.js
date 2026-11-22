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

  const ids = ['p8-note-wide', 'p8-note-medium'];
  const meta = ids.map(id => T.mediaRecord(id));
  const cut = meta.map(a => [a.events.trimIn, a.events.trimOut]);
  const marks = [0, 17].flatMap((start, i) => [['In', start + cut[i][0]], ['Out', start + cut[i][1]]]);
  const guide = line('Trim the waiting time', 'Timeline showing unwanted waiting, useful action, and unused tail.', 10, [['Wait', 0, 2, 'gap'], ['Action', 2, 8], ['Tail', 8, 10, 'gap']], [['In', 2], ['Out', 8]]);
  T.topic({
    slug: 'trim-beginnings-and-endings', minutes: 15, bigIdea: "Cut off what the viewer doesn't need.",
    hook: hook(guide, 'What should the viewer usually skip before the action?', ['The wait before the In marker', 'The main action between In and Out'], 0, 'The waiting time is in the [[head]]. Set a later [[in point]] to [[trim]] past it.'),
    vocab: ['trim', 'in-point', 'out-point', 'head', 'tail'], review: ['clip', 'timeline'],
    objectives: ['Set a later in point to cut the head.', 'Set an earlier out point to remove the tail.'],
    sections: [
      teach('Keep the useful section', 'A trim changes where a clip starts or stops in your edit.',
        '<p>The [[head]] is at the beginning. Drag its left handle later to choose the [[in point]]. The [[tail]] is at the end. Drag the right handle earlier to choose the [[out point]].</p><p>When you [[trim]] a clip, your source file stays whole. Leave room on either end if another cut still needs it.</p>',
        figure(guide, 'The strip between In and Out is the part viewers will see.')),
      practice('Practice: trim to the marks', 'Trim each clip to its two markers. Zoom in for a one-frame adjustment.',
        exercise(1, ids, { video: 1, audio: 1, clips: meta.map((a, i) => ({ media: ids[i], track: 'V1', start: i * 17, duration: a.duration })), markers: marks.map(([, t]) => t) },
          'Tighten the take', '“Start each shot at the movement and end it after the important action.”', [
            step('Trim both heads to their In markers.', 'Drag the left ends to the first and third markers. In the keyboard controls, use source seconds ' + cut[0][0] + ' and ' + cut[1][0] + '.', api => api.clips('V1').length === 2 && api.clips('V1').every((c, i) => api.near(c.in, cut[i][0]))),
            step('Trim both tails to their Out markers.', 'Drag the right ends to the second and fourth markers. The source Out times are ' + cut[0][1] + ' and ' + cut[1][1] + ' seconds.', api => api.clips('V1').length === 2 && api.clips('V1').every((c, i) => api.near(c.out, cut[i][1])))
          ]))
    ],
    check: [
      q('What change would keep the action and skip the waiting?', 'Set In at 2 seconds and Out at 8.', [['Set In at 0 and Out at 10.', 'That leaves both waiting strips.'], ['Set In at 8 and Out at 10.', 'That keeps only the end strip.']], 'The useful action sits between the two marks.', guide),
      q('Which handle moves the beginning of the selected clip?', 'The left handle.', [['The right handle.', 'The right edge is where the clip ends.'], ['The center of the clip.', 'Drag the body to move the clip without a trim.']], 'The left edge is the head.'),
      q('You trimmed too much from the tail. How can you bring it back?', 'Drag the out point later, as far as the source allows.', [['Import a second copy of the clip.', 'The original media is still present.'], ['Increase the video track height.', 'Track height only changes the view.']], 'The edit still refers to the original recording.')
    ],
    remember: ['A [[trim]] changes the range you see in the edit.', 'The [[in point]] sets what stays after the [[head]].', 'The [[out point]] sets where the [[tail]] begins.'],
    realCameraTitle: 'Try it', realCamera: 'Trim a phone take so it starts just before the action and stops as soon as the viewer has seen it.',
    notes: { sketch: 'Draw a take with a head, action and tail. Mark what to keep.', frames: 1, frameLabels: ['Trim plan'], think: 'When might leaving a few extra frames improve the edit?' }
  });
})();
