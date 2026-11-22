(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const line = (title, alt, length, clips, marks) => ({ svg: D.editTimeline({ title, length, lanes: [{ name: 'V1', clips }], marks }), alt });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const zoomed = line('A long timeline', 'Thirty seconds on screen. Near the start, the clips are small slivers.', 30, [['A', 0, 1.4], ['B', 1.4, 2.6], ['C', 2.6, 3.5, 'detail']]);
  const detail = line('Zoomed in', 'Five seconds on screen. Three clips have easy-to-see edges.', 5, [['A', 0, 1.4], ['B', 1.4, 2.6], ['C', 2.6, 3.5, 'detail']]);
  const id = 'p8-note-wide';
  T.topic({
    slug: 'timeline-zoom-and-sizing', minutes: 10, bigIdea: 'Zoom out to see it all, in to be exact.',
    hook: hook(zoomed, 'Would it be easy to change just one frame when the clips look like this?', ['Yes, there is room at every edge', 'No, the clip edges look too close together'], 1, 'The timeline shows 30 seconds and the clips take up a tiny part of it. [[Zoom to fit]] gives you an overview. Zoom in further for frame detail.'),
    vocab: ['zoom-to-fit', 'track-height', 'snapping'], review: ['track', 'frame-step', 'timeline'],
    objectives: ['Switch between a whole edit and frame detail.', 'Make a track easier to read and turn on snapping to align edits.'],
    sections: [
      teach('Change your view of the edit', 'Zoom changes how much time you see at once. It keeps all the source and cuts the same.',
        '<p>Use Shift+Z for [[zoom to fit]]. Zoom in to spread the same seconds across more of the screen. Increase [[track height]] to see bigger pictures or sound shapes.</p><p>[[Snapping]] pulls a clip edge to a nearby cut, marker or playhead. Turn it off when it catches the wrong spot.</p>',
        { type: 'figure-row', items: [{ ...zoomed, caption: 'Far out' }, { ...detail, caption: 'Close in' }] }),
      practice('Practice: see the whole edit and one frame', 'Use Zoom to fit, zoom in, and turn on the magnet. Drag the edge of the V1 track header to make it taller.',
        exercise(1, [id], { video: 1, audio: 1, clips: [{ media: id, track: 'V1', duration: 14 }] },
          'Read the timeline', '“Let me see our whole cut first, then get close enough to fix a single frame.”', [
            step('Use Zoom to fit.', 'Press Shift+Z or choose the Zoom to fit icon on the timeline toolbar.', api => Math.abs(api.timelineZoom - api.fitZoom) < 1, true),
            step('Zoom in for detail.', 'Use the timeline zoom slider or press = until you can see the small tick marks.', api => api.timelineZoom >= 240, true),
            step('Make V1 taller.', 'Drag down from the bottom edge of the V1 label. There is also a Track height control under Edit with the keyboard.', api => api.tracks().some(t => t.name === 'V1' && t.height > 68)),
            step('Turn on snapping.', 'Click the magnet icon or press N while the editor has focus.', api => api.snapping)
          ], { startZoom: 150, startSnapping: false }))
    ],
    check: [
      q('What changed between the two views?', 'The number of seconds shown across the same width.', [['The order of clips.', 'A, B and C stay in the same order.'], ['The length of C.', 'The same clip is stretched on the screen, not in the video.']], 'The ruler ends at different times. Zoom changes only the view.', detail),
      q('How do you make the waveform row easier to read without changing audio?', 'Increase track height.', [['Turn up the gain.', 'Volume changes what you hear.'], ['Add another track.', 'You can make the current row taller.']], 'Height changes the view of the track.'),
      q('Two clips should touch with no gap. What helps as you drag the second one?', 'Snapping', [['Track height', 'A taller track makes labels larger.'], ['Viewer zoom', 'Viewer zoom changes the picture display.']], 'Snapping catches the nearby edge.')
    ],
    remember: ['[[Zoom to fit]] gives you the whole sequence at a glance.', 'Change [[track height]] to read clips more easily.', 'Use [[snapping]] to line up edges.'],
    realCameraTitle: 'Try it', realCamera: 'Fit a short timeline on your editor screen. Zoom into a cut, then use the fit shortcut to return.',
    notes: { sketch: 'Draw the same cut zoomed out and zoomed in. Include ruler ticks.', frames: 2, frameLabels: ['Overview', 'Detail'], think: 'When would you turn snapping off for a precise edit?' }
  });
})();
