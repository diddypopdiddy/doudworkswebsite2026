/* 3.09 Focus. The layered library drawing (Textbook.draw.lensScene) stands in for prepared focus photos. */
(function () {
  const T = Textbook;
  const MUG = 'p3-focus-near', PERSON = 'p3-focus-person', SHELF = 'p3-focus-far';
  const scene = (media, alt, label, clue) => ({ media, alt, label, clue });

  T.topic({
    slug: 'focus',
    minutes: 12,
    bigIdea: 'Viewers look at what’s sharp.',
    hook: {
      pair: [ { media: MUG, alt: 'The mug in front is sharp; the person and shelves are blurry.', caption: 'Shot 1' }, { media: PERSON, alt: 'The person is sharp; the mug and shelves are blurry.', caption: 'Shot 2' } ],
      question: 'Where do your eyes go first in Shot 1?',
      options: ['The mug', 'The person', 'The bookshelves'],
      answer: 0,
      reveal: 'Your eyes jump to the mug, because it is the only sharp thing. In Shot 2 they go to the person. Whatever is in [[focus]] is what viewers look at.'
    },
    notes: {
      sketch: 'Draw a mug in front of a person. Shade the blurry parts when the focus is on the person.',
      frames: 1, frameLabels: ['Focus on the person'],
      think: 'When would autofocus choose the wrong thing? What would you do?'
    },
    vocab: ['focus', 'autofocus', 'manual-focus', 'rack-focus', 'focus-lock'],
    objectives: [
      'Explain why viewers look at what is sharp.',
      'Choose what to focus on for a shot.',
      'Describe a rack focus and how to lock focus on a phone.'
    ],
    sections: [
      {
        title: 'Choose what is sharp',
        intro: 'Slide the focus from the mug to the person to the shelves.',
        blocks: [
          { type: 'text', html: '<p>[[Focus]] decides which part of the picture is sharp. Eyes go to the sharpest thing first, so focus is a way of pointing: “look here.” For people, focus on the eyes.</p>' },
          { type: 'lens-sim', controls: ['focus'], start: { focus: 2, fstop: 1.8 } }
        ]
      },
      {
        title: 'Autofocus and manual focus',
        intro: 'The camera can choose for you, or you can choose.',
        blocks: [
          { type: 'text', html: '<p>With [[autofocus]], the camera picks what to make sharp. It is fast, but it often guesses wrong: it may grab the background, or hunt back and forth when someone moves.</p><p>With [[manual focus]], you choose by turning the focus ring on the lens, or by tapping the screen on a phone. On a phone, press and hold to turn on [[focus lock]], so the camera stops changing its mind mid-shot.</p>' },
          { type: 'steps', items: [ 'Frame the shot.', 'Tap the subject’s eyes on the screen.', 'Press and hold until you see “AE/AF Lock” or a lock icon.', 'Record. The focus stays put.' ] },
          { type: 'callout', kind: 'mistake', html: 'Autofocus “hunting” (the picture going soft, then sharp, then soft) ruins a take. Lock the focus before you press record.' }
        ]
      },
      {
        title: 'Rack focus',
        intro: 'Moving focus during a shot moves the viewer’s eyes.',
        blocks: [
          { type: 'text', html: '<p>A [[rack focus]] shifts the sharp area from one thing to another while the camera rolls. It can reveal something in the background, or move attention from an object to a person’s reaction, all without a cut.</p>' },
          { type: 'video-segments', media: 'p3-rack-focus', label: 'Rack focus', caption: 'The focus moves from the mug to the person.' }
        ]
      },
      {
        title: 'Practice: point with focus',
        intro: 'The director tells you where viewers should look. Pick the shot.',
        blocks: [
          { type: 'picture-choice', closing: 'Focus points viewers’ eyes.', rounds: [
            { prompt: 'Viewers should watch the person’s face as they listen.', options: [ scene(MUG, 'Mug sharp.', 'A', 'The mug is sharp, so eyes go there.'), scene(PERSON, 'Person sharp.', 'B'), scene(SHELF, 'Shelves sharp.', 'C', 'The shelves are sharp, not the person.') ], answer: 1, explain: 'The person is sharp, so viewers look at them.' },
            { prompt: 'The mug holds a clue. Make sure nobody misses it.', options: [ scene(PERSON, 'Person sharp.', 'A', 'The mug is blurry here.'), scene(SHELF, 'Shelves sharp.', 'B', 'The mug is blurry here.'), scene(MUG, 'Mug sharp.', 'C') ], answer: 2, explain: 'A sharp mug in front pulls every eye.' },
            { prompt: 'In this interview, autofocus grabbed the background. Which shot is that?', options: [ scene(SHELF, 'Shelves sharp, person blurry.', 'A'), scene(PERSON, 'Person sharp.', 'B', 'The person is sharp. That is the right focus.'), scene(MUG, 'Mug sharp.', 'C', 'The mug is in the foreground, in front of the person.') ], answer: 0, explain: 'The background is sharp and the person is soft. Lock focus on the eyes.' }
          ] }
        ]
      },
      {
        id: 'camera-practice', title: 'Hold focus, then pull focus',
        intro: 'Put attention on the reader even when someone crosses the frame.',
        blocks: [{
          type: 'camera-sim', title: 'Keep the reader sharp', body: ['g97', 'phone'], level: 2, scene: 'note-library',
          start: { power: true, mode: 'P', settings: { focusOn: 'mug' } }, callAction: true, show: ['focus'],
          tasks: [
            { text: 'Focus on the reader and lock. Record through the moment someone passes in front of the camera.',
              hint: 'Touch the reader, then press AF/AE LOCK. Start recording and choose Call action. Keep rolling until the person in front has passed.',
              check: s => s.takes.some(t => t.covers('crossing', 'crossing', .8) && t.settings.focusLocked && t.sharpOn('reader')) },
            { text: 'Switch to MF. During a new take, pull focus from the mug to the reader.',
              hint: 'Unlock, switch the focus lever to MF, and use the lens focus control. Set the mug sharp first, start recording, then turn the focus control toward the reader.',
              check: s => s.takes.some(t => t.settings.focusMode === 'MF' && t.history.some((sample, i, all) => sample.picture.sharp === 'reader' && all.slice(0, i).some(earlier => earlier.picture.sharp === 'mug'))) }
          ],
          forBody: { phone: { start: { power: true, settings: { focusOn: 'mug', sideways: true } }, tasks: [
            { text: 'Lock focus on the reader, record through the crossing, and check the take in playback.',
              hint: 'Select the reader, hold for AE/AF LOCK, start recording, choose Call action and wait for the passerby to leave before stopping.',
              check: s => s.takes.some(t => t.covers('crossing', 'crossing', .8) && t.sharpOn('reader') && t.settings.focusLocked && t.played) }
          ] } }, doneText: 'The take shows where you put the viewer’s attention.'
        }]
      },
      {
        id: 'studio-practice', title: 'Try it in the studio',
        intro: 'Lose focus on purpose, then find it again.',
        blocks: [
          { type: 'text', html: '<p>Zoom in, turn the focus slider and watch the Sharp and Soft readout on the monitor.</p>' },
          { type: 'studio-room', lesson: 'focus' }
        ]
      }
    ],
    check: [
      { media: SHELF, alt: 'The shelves are sharp; the person is blurry.', q: 'This is an interview. What went wrong?', options: ['The focus is on the background, not the person', { text: 'Nothing. It looks fine.', clue: 'Is the person sharp?' }, { text: 'The camera is too high', clue: 'Look at what is sharp.' }], answer: 0, explain: 'Focus on the eyes.' },
      { q: 'What is a rack focus?', options: ['Moving the sharp area from one thing to another during a shot', { text: 'Letting the camera focus by itself', clue: 'That is autofocus.' }, { text: 'Zooming in on a detail', clue: 'A rack focus changes what is sharp, not the size.' }], answer: 0, explain: 'It moves viewers’ eyes without a cut.' },
      { q: 'On a phone, how do you stop the focus from changing mid-shot?', options: ['Press and hold to lock focus', { text: 'Shake the phone', clue: 'That would make it worse.' }, { text: 'Zoom all the way in', clue: 'Zoom doesn’t lock focus.' }], answer: 0, explain: 'Focus lock holds the sharp area in place.' },
      { q: 'Where should you focus for a person talking to camera?', options: ['On their eyes', { text: 'On the wall behind them', clue: 'Viewers would look at the wall.' }, { text: 'On their shoes', clue: 'Viewers watch the face.' }], answer: 0, explain: 'Sharp eyes look alive.' }
    ],
    remember: [
      'Viewers look at what is in [[focus]].',
      '[[Autofocus]] can guess wrong; [[manual focus]] and [[focus lock]] keep you in control.',
      'A [[rack focus]] moves viewers’ eyes without a cut.'
    ],
    realCamera: 'Put an object close to your phone with a friend behind it. Tap to focus on the object, then on your friend. Press and hold to lock focus and film five seconds. On a class G97, check for AFL on the screen. The factory setting locks exposure only. The practice camera uses the AF/AE LOCK setting with Lock Hold on.'
  });
})();
