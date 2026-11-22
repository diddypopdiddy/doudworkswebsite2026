/* 3.11 Layered composition and deep focus (history). Classic films are described, not shown (not public domain). */
(function () {
  const T = Textbook;
  const deep = 'p3-focus-deep', shallow = 'p3-focus-person';

  T.topic({
    slug: 'layered-composition-and-deep-focus',
    minutes: 12,
    bigIdea: 'Filmmakers used deep focus to show many layers of action at once.',
    hook: {
      media: deep, alt: 'A mug in front, a person at the table, and bookshelves behind, all sharp.',
      question: 'Count the layers. How many different distances from the camera can you see clearly?',
      options: ['One', 'Two', 'Three'],
      answer: 2,
      reveal: 'Three: the mug close to the camera, the person in the middle, and the shelves far behind. They are the [[foreground]], [[middle ground]] and [[background]], and all three are sharp. Filmmakers call that [[deep focus]].'
    },
    notes: {
      sketch: 'Sketch a scene with something in the foreground, a person in the middle ground and something happening in the background.',
      frames: 1, frameLabels: ['Three layers'],
      think: 'Deep focus lets viewers choose where to look. Is that a good thing or a risk?'
    },
    vocab: ['foreground', 'middle-ground', 'background', 'deep-focus'],
    review: ['depth-of-field', 'deep-depth-of-field'],
    objectives: [
      'Name the foreground, middle ground and background of a shot.',
      'Explain how deep focus lets several layers of action share one shot.'
    ],
    sections: [
      {
        title: 'Three layers',
        intro: 'Every shot has things near, in the middle and far away.',
        blocks: [
          { type: 'text', html: '<p>The [[foreground]] is closest to the camera. The [[middle ground]] is in between. The [[background]] is farthest away. Putting something in each layer makes a flat screen feel deep.</p>' },
          { type: 'hotspots', media: deep, alt: 'A library scene with a mug, a person and shelves.', prompt: 'Tap each number to find a layer.', points: [
            { x: 21, y: 75, label: 'Foreground', text: '<p>The mug, closest to the camera. Foreground objects frame the shot and make it feel deep.</p>' },
            { x: 66, y: 31, label: 'Middle ground', text: '<p>The person at the table. Most of the action happens here.</p>' },
            { x: 87, y: 16, label: 'Background', text: '<p>The shelves, farthest away. The background tells viewers where we are.</p>' }
          ] }
        ]
      },
      {
        title: 'Deep focus in film history',
        intro: 'In the 1930s and 1940s, filmmakers pushed for more layers in one shot.',
        blocks: [
          { type: 'text', html: '<p>Early film lenses could only keep a thin slice sharp. In the late 1930s and 1940s, cinematographers used brighter lights, faster film and wide-angle lenses with small apertures to get [[deep focus]]: the foreground, middle ground and background all sharp at once.</p><p>The best-known example is <em>Citizen Kane</em> (1941), shot by Gregg Toland. In one famous shot, a boy plays in the snow far outside a window while the adults in the foreground decide his future. Viewers see both at once, with no cut.</p>' },
          { type: 'figure-row', items: [
            { media: shallow, alt: 'Only the person sharp.', caption: '<strong>Shallow.</strong> One layer matters.' },
            { media: deep, alt: 'All three layers sharp.', caption: '<strong>Deep focus.</strong> Every layer can tell part of the story.' }
          ] },
          { type: 'callout', kind: 'history', html: 'Deep focus is the opposite of the shallow look in many modern interviews. Compare them in 3.10 Depth of field.', link: { href: '../depth-of-field/index.html', label: 'Read 3.10 →' } }
        ]
      },
      {
        title: 'Layers that act together',
        intro: 'Deep focus works best when something happens in more than one layer.',
        blocks: [
          { type: 'text', html: '<p>A layered shot can show a person reading in the middle ground while someone sneaks in through the background door. Viewers notice both, and the scene builds tension without a single cut. That is why deep focus needs careful staging: every layer must earn its place.</p>' },
          { type: 'video-segments', media: 'p3-layered', label: 'Layered shot', caption: 'Foreground, middle ground and background, all acting at once.' },
          { type: 'quick-check', media: deep, alt: 'The library scene with all layers sharp.', q: 'In this shot, which layer is the person in?', options: ['Middle ground', { text: 'Foreground', clue: 'The mug is closer to the camera.' }, { text: 'Background', clue: 'The shelves are farther away.' }], answer: 0, explain: 'The person sits between the mug and the shelves.' }
        ]
      }
    ],
    check: [
      { media: deep, alt: 'Library scene, all sharp.', q: 'What is the mug in this shot?', options: ['The foreground', { text: 'The background', clue: 'It is the closest thing to the camera.' }, { text: 'The middle ground', clue: 'The person is in the middle.' }], answer: 0, explain: 'The foreground is closest to the camera.' },
      { q: 'What does deep focus mean?', options: ['The foreground, middle ground and background are all sharp', { text: 'Only the subject is sharp', clue: 'That is shallow depth of field.' }, { text: 'The camera moves forward', clue: 'Deep focus is about sharpness, not movement.' }], answer: 0, explain: 'Every layer is in focus at once.' },
      { q: 'Why did filmmakers in the 1940s want deep focus?', options: ['To show several layers of action in one shot', { text: 'To hide the background', clue: 'Deep focus shows it.' }, { text: 'Because cameras could only do deep focus', clue: 'Early lenses kept only a thin slice sharp.' }], answer: 0, explain: 'Viewers could watch more than one thing without a cut.' }
    ],
    remember: [
      'Every shot has a [[foreground]], a [[middle ground]] and a [[background]].',
      '[[Deep focus]] keeps all three sharp at once.',
      'Layered shots work best when more than one layer has something happening.'
    ],
    realCameraTitle: 'Look for it',
    realCamera: 'Watch a scene from a film or show you like. Pause on a shot and name what is in the foreground, middle ground and background. Is everything sharp, or only one layer?'
  });
})();
