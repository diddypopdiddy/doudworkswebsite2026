(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const line = (title, alt, length, clips, marks) => ({ svg: D.editTimeline({ title, length, lanes: [{ name: 'V1', clips }], marks }), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const id = 'p8-sync-clap', clip = T.mediaRecord(id), clap = clip.events.clap;
  const moments = card('Three frames', 'Frame A: hands apart; frame B: palms touch; frame C: hands separate again.', [['A · Before', 'Hands apart'], ['B · Contact', 'Palms touch'], ['C · After', 'Hands separate']]);
  const marker = line('Clap practice', 'A six-second clip with a mark when the hands meet.', clip.duration, [['Clap', 0, clip.duration]], [['Clap', clap]]);
  T.topic({
    slug: 'playback-scrubbing-and-frame-stepping', minutes: 12, bigIdea: 'Find the exact frame you want.',
    hook: hook(moments, 'Which frame would you line up with the sharp sound of a clap?', ['A', 'B', 'C'], 1, 'The palms first touch in B. A [[frame step]] lets you land on that moment one picture at a time.'),
    vocab: ['scrub', 'frame-step', 'j-k-l-keys', 'timecode'], review: ['playhead', 'frame-rate'],
    objectives: ['Scrub to get near an action and step to its exact frame.', 'Read timecode and mark a verified moment.'],
    sections: [
      teach('Get close, then get exact', 'Playback tells you what happened. Stepping shows you exactly when.',
        '<p>[[Scrub]] by dragging the [[playhead]] through a shot. Tap a left or right arrow for a [[frame step]]. Watch the viewer to confirm the exact picture.</p><p>[[Timecode]] reads hours, minutes, seconds, then frames. The [[J-K-L keys|j-k-l-keys]] run backward, stop or run forward in many editors.</p>',
        figure(marker, 'The marker points you close. Pause and check the hands.')),
      practice('Practice: find the clap', 'Scrub to get close and use an arrow key to land on the contact frame.',
        exercise(1, [id], { video: 1, audio: 1, clips: [{ media: id, track: 'V1', linkAudio: true, duration: clip.duration }], markers: [clap] },
          'Find the sync frame', '“I need the frame when the palms meet so I can line up the sound.”', [
            step('Park the playhead at the clap.', 'Click near the marker. Then use the arrow keys and look for the palms touching.', api => api.near(api.playhead, clap, 0.5 / api.fps)),
            step('Mark that frame as In.', 'Press I while the editor has focus. The timecode should still show the clap.', api => Number.isFinite(api.inPoint) && api.near(api.inPoint, clap, 0.5 / api.fps))
          ]))
    ],
    check: [
      q('You stopped on frame A. How can you get to B precisely?', 'Step one frame forward.', [['Play for a few seconds.', 'Playback could pass both B and C.'], ['Change the frame rate.', 'The action was already recorded.']], 'A and B are next to each other. One forward step is enough.', moments),
      q('At 24 fps, what does the last field in 00:00:02:12 count?', 'Twelve frames after the two-second mark.', [['Twelve seconds after the mark.', 'The seconds are in the field immediately before it.'], ['Twelve clips in the pool.', 'Timecode describes a position, not a file count.']], 'The four fields are hours, minutes, seconds and frames.'),
      q('In this editor, which key stops playback?', 'K', [['J', 'J runs the clip backwards.'], ['L', 'L runs the clip forwards.']], 'The center key K stops the playhead.')
    ],
    remember: ['[[Scrub]] to reach the rough spot quickly.', 'Use a [[frame step]] to land on a single picture.', 'Read the last [[timecode]] field in frames.'],
    realCameraTitle: 'Try it', realCamera: 'Record a ball toss in one wide shot. Find the first frame where the ball is clear of the hand.',
    notes: { sketch: 'Sketch the frame before contact, at contact and just after it.', frames: 3, frameLabels: ['Before', 'Contact', 'After'], think: 'Why might normal playback make you miss the exact contact frame?' }
  });
})();
