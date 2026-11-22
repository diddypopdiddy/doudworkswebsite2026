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

  const props = card('Clip properties', 'Clip A: 1920 by 1080, 24 fps, 12 seconds, 16 MB, H.264. Clip B: 3840 by 2160, 30 fps, 8 seconds, 24 MB, H.265.', [
    ['A · Note.mp4', '1920 × 1080 · 24 fps', '12 seconds · 16 MB', 'H.264'],
    ['B · Note.mp4', '3840 × 2160 · 30 fps', '8 seconds · 24 MB', 'H.265']
  ]);
  const compare = q('Which has 4K UHD resolution?', 'B', [['A', 'Read the width and height in pixels.'], ['Both', 'The filenames match, but the pixel sizes differ.']], 'B is 3840 × 2160, the common UHD pixel size.', props);
  T.topic({
    slug: 'file-properties', minutes: 10, bigIdea: 'Resolution, frame rate and length tell you what a clip is.',
    hook: hook(props, 'Both are called Note.mp4. Which one is 4K UHD?', ['A', 'B'], 1, 'B has 3840 × 2160 pixels. Those numbers describe the [[resolution]], the width and height of the picture.'),
    vocab: ['resolution', 'duration', 'file-size', 'codec'], review: ['frame-rate', 'file-extension'],
    objectives: ['Read resolution, frame rate and duration from a properties panel.', 'Use file size and codec to explain a mismatch between clips.'],
    sections: [
      teach('One name, different details', 'Open Properties or Details to see what the filename leaves out.',
        '<p>[[Resolution]] is how many pixels are across and down. [[Frame rate]] tells you how many pictures play per second. [[Duration]] tells you how long the clip plays.</p><p>[[File size]] tells you how much storage it needs. A [[codec]] is the method that encodes and decodes the picture or sound.</p>',
        figure(props, 'Two files can have the same extension with different codecs.')),
      teach('Explore the panel', 'Open the numbered details to see what each is used for.',
        '<p>In Windows File Explorer, right-click the clip and choose Properties. Look for the Details tab. On a Chromebook, select the file in Files and open its info when available.</p>',
        { type: 'hotspots', ...props, points: [
          { x: 73, y: 57, label: 'Resolution and rate', text: 'The 3840 × 2160 frame has more pixels. The 30 fps number is the [[frame rate]].' },
          { x: 73, y: 67, label: 'Duration and space', text: 'Eight seconds is the running time. The 24 MB number is storage space.' },
          { x: 70, y: 75, label: 'Codec', text: 'H.265 is the encoding format. An editor must be able to decode it.' }
        ] },
        { type: 'desktop-sim', open: 'Videos', view: 'details',
          videos: [
            { name: 'A', children: [{ name: 'Note.mp4', media: 'p8-note-medium', size: 16.4e6, meta: { width: 1920, height: 1080, fps: 24, duration: 12, codec: 'H.264' } }] },
            { name: 'B', children: [{ name: 'Note.mp4', media: 'p8-note-medium', size: 24.6e6, meta: { width: 3840, height: 2160, fps: 30, duration: 8, codec: 'H.265' } }] }
          ],
          tasks: [
            { text: 'Open folder A. Right-click Note.mp4, choose **Properties**, then click the **Details** tab.', check: s => s.did('properties-tab', e => e.detail === 'Details' && /> A > Note\.mp4$/.test(e.path)) },
            { text: 'Do the same for Note.mp4 in folder B. Compare Frame width, Frame height and Frame rate.', check: s => s.did('properties-tab', e => e.detail === 'Details' && /> B > Note\.mp4$/.test(e.path)) },
            { text: 'Close Properties. Turn on the **Details pane** (the Details button at the right of the command bar) and select a clip to see the same numbers.', check: s => s.did('pane', e => e.detail === 'details' && e.on) }
          ] }),
      practice('Practice: read the details', 'Use the labels and units to identify the clips.', quiz(compare,
        q('Which clip takes more drive space?', 'B', [['A', 'Compare megabytes rather than seconds.'], ['They match', 'The equal name does not mean equal space.']], '24 MB takes more space than 16 MB.', props),
        q('An editor reads H.264 but not H.265. Which is likely to open here?', 'A', [['B', 'Check the codec on the bottom line.'], ['Both', 'The extension is shared. Check what each video uses inside.']], 'A uses H.264, which this editor can decode.', props)))
    ],
    check: [
      q('Which clip runs longer?', 'A', [['B', 'Compare seconds, not megabytes.'], ['Both run equally long', 'The duration rows give different times.']], 'A runs 12 seconds. B runs 8 seconds.', props),
      q('What does 30 fps describe?', 'Thirty pictures play each second', [['Thirty seconds of footage', 'Duration is in seconds.'], ['Thirty pixels across', 'Resolution is a pixel width and height.']], 'Frames per second measures frame rate.'),
      q('What can you check first when one MP4 plays and another does not?', 'The codec the editor must decode', [['Only the last three letters', 'Both names end in .mp4.'], ['The color of the icon', 'Icons come from the operating system.']], 'The codec can differ even when two files share an extension.')
    ],
    remember: ['Read [[resolution]] as width × height in pixels.', 'Read [[duration]] in time and [[file size]] in bytes.', 'Check the [[codec]] when playback fails.'],
    realCameraTitle: 'Try it', realCamera: 'Inspect the properties of a clip from your phone. Write down the pixel size, frame rate and duration.',
    notes: { sketch: 'Draw a small properties card. Label one value in pixels and one in seconds.', frames: 1, frameLabels: ['Details'], think: 'Why might two clips with the same name need different amounts of space?' }
  });
})();
