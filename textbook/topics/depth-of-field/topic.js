/* 3.10 Depth of field. The f-stop slider runs over the layered library drawing (Textbook.draw.lensScene). */
(function () {
  const T = Textbook, D = T.draw;
  const lens = (fstop, subject, alt, label, clue) => ({ svg: D.lensScene({ focus: subject || 2, subject: subject || 2, fstop }), alt, label, clue });

  T.topic({
    slug: 'depth-of-field',
    minutes: 15,
    bigIdea: 'Choose how much of the scene is sharp.',
    hook: {
      pair: [ { media: 'p3-focus-person', alt: 'Only the person is sharp; the mug and shelves melt into blur.', caption: 'Shot 1' }, { media: 'p3-focus-deep', alt: 'The mug, the person and the shelves are all sharp.', caption: 'Shot 2' } ],
      question: 'The focus is on the person in both shots. What is different?',
      options: ['Shot 2 is zoomed in', 'How much of the scene is sharp', 'The person moved'],
      answer: 1,
      reveal: 'In Shot 1 only a thin slice is sharp: [[shallow depth of field]]. In Shot 2 nearly everything is sharp: [[deep depth of field]]. Changing the size of the lens opening can give either look. That opening is the [[aperture]].'
    },
    notes: {
      sketch: 'Sketch the same scene twice: once with shallow depth of field (blurry background) and once with deep depth of field.',
      frames: 2, frameLabels: ['Shallow', 'Deep'],
      think: 'Why do interviews often use a blurry background, while news footage of an event keeps everything sharp?'
    },
    vocab: ['depth-of-field', 'shallow-depth-of-field', 'deep-depth-of-field', 'aperture', 'f-stop'],
    review: ['focus'],
    objectives: [
      'Explain shallow and deep depth of field.',
      'Predict how the f-stop and distance change the depth of field.',
      'Choose the depth of field that fits a shot.'
    ],
    sections: [
      {
        title: 'How much is sharp?',
        intro: 'Change the f-stop and the distance. Watch the blur.',
        blocks: [
          { type: 'text', html: '<p>[[Depth of field]] is how much of the scene, from near to far, looks sharp. With [[shallow depth of field]], only a thin slice is sharp and the [[background]] melts into blur. With [[deep depth of field]], near and far are sharp at the same time.</p><p>The [[aperture]] is the opening inside the lens. Its size is written as an [[f-stop]]. Small numbers like f/1.8 mean a wide opening and shallow depth of field. Big numbers like f/16 mean a tiny opening and deep depth of field.</p>' },
          { type: 'lens-sim', controls: ['fstop', 'distance'], start: { fstop: 2.8, subject: 2 }, side: { title: 'Three ways to blur the background', html: '<ul><li>Open the aperture (a smaller f-stop number).</li><li>Move the camera closer to the subject.</li><li>Move the subject farther from the background.</li></ul>' } }
        ]
      },
      {
        title: 'Small number, big blur',
        intro: 'The f-stop scale feels backwards at first.',
        blocks: [
          { type: 'text', html: '<p>Think of the [[f-stop]] as a fraction: f/2 is a big opening, f/16 is a tiny one. A big opening lets in lots of light and gives shallow depth of field. A tiny opening lets in less light and gives deep depth of field.</p><p>Phones have tiny lenses, so almost everything is sharp. Portrait mode fakes shallow depth of field with software.</p>' },
          { type: 'figure-row', items: [
            { media: 'p3-focus-person', caption: '<strong>Shallow, like f/1.8.</strong> Just the person is sharp.' },
            { media: 'p3-focus-middle', caption: '<strong>In between, like f/5.6.</strong> The mug and shelves show more detail.' },
            { media: 'p3-focus-deep', caption: '<strong>Deep, like f/16.</strong> Near and far are sharp.' }
          ] },
          { type: 'callout', kind: 'consider', html: 'A shallow depth of field hides a messy background. What else could it hide, or reveal?' }
        ]
      },
      {
        title: 'Practice: choose the depth',
        intro: 'Pick the shot that matches each job.',
        blocks: [
          { type: 'picture-choice', closing: 'Shallow points at one thing. Deep shows everything.', rounds: [
            { prompt: 'An interview in a busy library. Make the person stand out from the shelves.', options: [ lens(16, 2, 'Everything sharp.', 'f/16', 'Everything is sharp, so the shelves compete with the person.'), lens(1.8, 2, 'Only the person sharp.', 'f/1.8') ], answer: 1, explain: 'Shallow depth of field separates the person from the background.' },
            { prompt: 'You need viewers to see the mug, the person and the shelves clearly at once.', options: [ lens(1.8, 2, 'Only the person sharp.', 'f/1.8', 'The mug and shelves are blurry.'), lens(5.6, 2, 'Some blur.', 'f/5.6', 'Still a little blur front and back.'), lens(16, 2, 'Everything sharp.', 'f/16') ], answer: 2, explain: 'A small aperture (big f-number) gives deep depth of field.' },
            { prompt: 'Same f-stop in both. Which shot has the shallower depth of field?', options: [ lens(4, 1.2, 'Camera close to the person.', 'Camera close'), lens(4, 3.5, 'Camera far from the person.', 'Camera far', 'Moving away makes the depth of field deeper.') ], answer: 0, explain: 'Moving the camera closer to the subject makes the depth of field shallower.' }
          ] }
        ]
      },
      {
        id: 'camera-practice', title: 'Choose what stays sharp',
        intro: 'Make two versions of the same library shot. Leave ISO on Auto so you can compare focus.',
        blocks: [{
          type: 'camera-sim', title: 'Separate the reader from the shelves', body: 'g97', level: 3, scene: 'note-library',
          start: { power: true, mode: 'video', settings: { exposureMode: 'M', iso: 'AUTO', focusOn: 'reader' } },
          tasks: [
            { text: 'Film the reader with a soft background. Zoom to 60 mm and open the aperture to f/5.6.',
              hint: 'Use the zoom ring, focus on the reader, and turn the aperture dial to its smallest available f-number.',
              check: s => s.takes.some(t => t.length >= 1 && t.settings.zoom === 60 && t.picture.fstop <= 5.6 && t.sharpOn('reader') && !t.sharpOn('shelves')) },
            { text: 'Make a second take with more depth. Zoom out to 12 mm and stop down until both the mug and reader look sharp.',
              hint: 'Use the wide end of the zoom and f/16 or f/22. Keep focus on the reader.',
              check: s => s.takes.some(t => t.length >= 1 && t.settings.zoom === 12 && t.sharpOn('mug') && t.sharpOn('reader')) }
          ], doneText: 'Compare the mug and shelves in your two takes.'
        }]
      }
    ],
    check: [
      { media: 'p3-focus-person', alt: 'Only the person is sharp.', q: 'What depth of field is this?', options: ['Shallow', { text: 'Deep', clue: 'Are the shelves sharp?' }], answer: 0, explain: 'Only a thin slice is sharp.' },
      { q: 'Which f-stop gives the shallowest depth of field?', options: ['f/1.8', { text: 'f/8', clue: 'Bigger numbers mean smaller openings.' }, { text: 'f/16', clue: 'f/16 is a tiny opening: deep depth of field.' }], answer: 0, explain: 'Small number, wide opening, shallow depth of field.' },
      { q: 'What is the aperture?', options: ['The opening inside the lens that lets light in', { text: 'The button that starts recording', clue: 'It is part of the lens.' }, { text: 'The screen on the back', clue: 'It controls light.' }], answer: 0, explain: 'Its size is written as an f-stop.' },
      { q: 'You can’t change the f-stop. How else can you blur the background?', options: ['Move the camera closer to the subject', { text: 'Add more light', clue: 'Light doesn’t blur the background by itself.' }, { text: 'Move the subject against the wall', clue: 'That makes the background sharper.' }], answer: 0, explain: 'Closer to the subject, farther from the background.' }
    ],
    remember: [
      '[[Depth of field]] is how much of the scene looks sharp.',
      'A small [[f-stop]] number means a wide [[aperture]] and [[shallow depth of field]].',
      'Use shallow to make one thing stand out, and [[deep depth of field]] to show everything.'
    ],
    realCamera: 'Use your phone’s portrait mode, then normal mode, on the same friend in front of a busy background. Compare the two. Then try normal mode with your friend far from the wall.'
  });
})();
