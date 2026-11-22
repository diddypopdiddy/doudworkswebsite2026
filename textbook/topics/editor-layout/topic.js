(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const panel = { svg: D.editorLayout(true), alt: 'A is the bin at upper left. B is the picture screen. C is the horizontal strip with video and audio lanes.' };
  const layout = { svg: D.editorLayout(false), alt: 'Media Pool to the left, viewer to the right, timeline below with two tracks and one playhead.' };
  const wide = 'p8-note-wide';
  T.topic({
    slug: 'editor-layout', minutes: 12, bigIdea: 'Media pool, viewer, timeline: know where everything lives.',
    hook: hook(panel, 'Where would you put a clip to build a video in order?', ['A', 'B', 'C'], 2, 'C has a row of clips from left to right. It is the [[timeline]], where you make the sequence.'),
    vocab: ['media-pool', 'viewer', 'timeline', 'track', 'playhead'],
    objectives: ['Find the three main editor panels.', 'Choose a clip and move the playhead to inspect a frame.'],
    sections: [
      teach('Three panels, three jobs', 'Learn where files wait, where you build, and where you watch.',
        '<p>The [[media pool]] holds your source clips. The [[timeline]] is where you order and trim them. The [[viewer]] shows the picture at the [[playhead]].</p><p>A [[track]] is a row for picture or sound. The vertical line shows your current time across the rows.</p>',
        { type: 'hotspots', ...layout, points: [
          { x: 16, y: 25, label: 'Media Pool', text: 'Choose source clips here.' },
          { x: 68, y: 31, label: 'Viewer', text: 'Watch the image at the current time.' },
          { x: 20, y: 64, label: 'Timeline', text: 'Make the edit here.' },
          { x: 36, y: 82, label: 'Track', text: 'Separate your picture and sound across rows.' },
          { x: 47, y: 66, label: 'Playhead', text: 'Move the line to inspect another time.' }
        ] }),
      practice('Practice: tour the editor', 'Choose a source, move to a new frame, and select the clip on V1.',
        exercise(1, [wide, 'p8-note-detail'], { video: 1, audio: 1, clips: [{ media: wide, track: 'V1', start: 0, duration: 5 }] },
          'Find your tools', '“Show me where our footage lives and where we build the cut.”', [
            step('Select a clip in the Media Pool.', 'Click either clip name in the Media Pool.', api => !!api.poolSelection, true),
            step('Move the playhead past the first second.', 'Click the timeline ruler after 1 second or use Set playhead.', api => api.playhead >= 1 && api.playhead < 5, true),
            step('Select the clip on V1.', 'Click the blue clip beneath the ruler, or choose it in Timeline clips.', api => api.clips('V1').some(c => api.selected.includes(c.id)))
          ]))
    ],
    check: [
      q('Which letter is the viewer?', 'B', [['A', 'The left pane shows a list.'], ['C', 'The bottom pane has time and tracks.']], 'B displays a picture from the edit.', panel),
      q('What changes when you drag the playhead?', 'The instant shown in the viewer', [['The length of the selected clip', 'The playhead shows when. Trim handles change length.'], ['The source file name', 'The line only marks time on the timeline.']], 'The playhead picks the moment the viewer displays.'),
      q('What is one row marked A1?', 'An audio track', [['The first file in the pool', 'A1 is a row in the timeline.'], ['A frame of video', 'Look at the letter A and the horizontal row.']], 'A is for audio. A1 is the first sound track.')
    ],
    remember: ['Find the source in the [[media pool]].', 'Build your cut on a [[track]] in the [[timeline]].', 'Move the [[playhead]] to change what the [[viewer]] shows.'],
    realCameraTitle: 'Try it', realCamera: 'Open your school’s editor. Point out the source list, the picture and the part where a clip can go.',
    notes: { sketch: 'Draw three panels and label the source clips, picture and time ruler.', frames: 1, frameLabels: ['Editor'], think: 'Which panel would you use to choose the exact moment for a cut?' }
  });
})();
