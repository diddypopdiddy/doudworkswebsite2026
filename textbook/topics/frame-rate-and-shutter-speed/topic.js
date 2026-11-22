/* 3.14 Frame rate and shutter speed. Generated stills illustrate different amounts of motion blur. */
(function () {
  const T = Textbook;
  const blur = (level, label, clue) => ({ media: 'p3-shutter-' + level, label, clue });

  T.topic({
    slug: 'frame-rate-and-shutter-speed',
    minutes: 15,
    bigIdea: 'Frame rate sets how often. Shutter speed sets how blurry.',
    hook: {
      pair: [ { media: 'p3-shutter-slow', alt: 'A ball smeared into a long streak.', caption: 'Shot 1' }, { media: 'p3-shutter-fast', alt: 'A ball frozen sharp in the air.', caption: 'Shot 2' } ],
      question: 'Same ball, same speed. Why is one a streak and the other frozen?',
      options: ['The ball moved faster in Shot 1', 'Each picture was exposed for a different length of time', 'Shot 2 was zoomed in'],
      answer: 1,
      reveal: 'The first study shows [[motion blur]] from a longer exposure, such as 1/30 of a second. A fast [[shutter speed]], such as 1/1000, can freeze the ball as in Shot 2.'
    },
    notes: {
      sketch: 'Draw a ball moving fast twice: once with a slow shutter speed (long streak) and once with a fast shutter speed (frozen).',
      frames: 2, frameLabels: ['Slow shutter', 'Fast shutter'],
      think: 'Why might an action film use a fast shutter speed in a fight scene?'
    },
    vocab: ['frame-rate', 'frames-per-second', 'shutter-speed', 'motion-blur', 'slow-motion'],
    review: ['frame'],
    objectives: [
      'Explain what frame rate and shutter speed each control.',
      'Predict how shutter speed changes motion blur.',
      'Choose a frame rate for normal motion or slow motion.'
    ],
    sections: [
      {
        title: 'How often: frame rate',
        intro: 'Video is a fast run of still frames. Frame rate is how many each second.',
        blocks: [
          { type: 'text', html: '<p>[[Frame rate]] is how many pictures the camera takes each second, measured in [[frames per second]] (fps). Films use 24 fps. Phones and TV often use 30 fps, and sports use 60 fps for smoother movement.</p><p>All four balls below move at the same speed. Only the frame rate is different. Watch how smooth each one looks.</p>' },
          { type: 'fps-demo', rates: [6, 12, 24, 60], caption: 'Low frame rates jump. Higher frame rates look smoother.' },
          { type: 'callout', kind: 'onset', html: 'Pick one frame rate for the whole project and set it before the first shot. Mixing rates causes stutters in the edit.' }
        ]
      },
      {
        title: 'How blurry: shutter speed',
        intro: 'Slide the shutter speed and watch the streak.',
        blocks: [
          { type: 'text', html: '<p>[[Shutter speed]] is how long each picture is exposed to light. A slow shutter, like 1/30 of a second, lets moving things smear: [[motion blur]]. A fast shutter, like 1/1000, freezes them.</p><p>For normal-looking video, use a shutter speed about double the frame rate: at 24 fps, about 1/50. A little blur makes movement look natural.</p>' },
          { type: 'slider-demo', label: 'Illustrated shutter speed', noteLabel: 'Example shutter setting', ends: ['Slow (more blur)', 'Fast (frozen)'], value: 1, stops: [
            { label: '1/30 second', media: 'p3-shutter-slow', alt: 'A long streak.', note: '<p>Slow. A long smear. Fast action turns to mush.</p>' },
            { label: '1/50 second', media: 'p3-shutter-middle', alt: 'A short streak.', note: '<p>The usual choice at 24 fps. A little blur looks natural on screen.</p>' },
            { label: '1/125 second', media: 'p3-shutter-slight', note: '<p>The ball keeps its shape with a faint smear at the edge.</p>' },
            { label: '1/500 second', media: 'p3-shutter-almost', note: '<p>Nearly frozen. A fast speed like this can keep a sports photo sharp.</p>' },
            { label: '1/1000 second', media: 'p3-shutter-fast', alt: 'Frozen.', note: '<p>Frozen solid. Every drop of water would be sharp.</p>' }
          ] }
        ]
      },
      {
        title: 'Slow motion',
        intro: 'Film fast, play back slow.',
        blocks: [
          { type: 'text', html: '<p>[[Slow motion]] comes from filming at a high frame rate and playing back at a normal one. Film at 60 fps and play at 24 fps, and everything takes two and a half times longer. Film at 120 fps for even slower motion.</p><p>Because each picture is exposed for a shorter time, slow motion needs more light.</p>' },
          { type: 'video-segments', media: 'p3-fps', label: '24 fps and slow motion', caption: 'The same ball toss at normal speed, then filmed at 60 fps and played back slowly.' }
        ]
      },
      {
        title: 'Practice: set the camera',
        intro: 'Choose the setting that gets each shot.',
        blocks: [
          { type: 'picture-choice', closing: 'Frame rate for smoothness and slow motion. Shutter speed for blur.', rounds: [
            { prompt: 'Freeze a soccer ball mid-kick for a sharp photo.', options: [ blur('slow', '1/30', 'That leaves a long streak.'), blur('fast', '1/1000'), blur('middle', '1/50', 'Still a little blurred.') ], answer: 1, explain: 'A very fast shutter freezes fast action.' },
            { prompt: 'Normal-looking video at 24 fps. Which shutter speed?', options: [ blur('fast', '1/1000', 'At 24 fps this looks choppy and stuttery.'), blur('middle', '1/50'), blur('slow', '1/30', 'Slower than the usual rule.') ], answer: 1, explain: 'About double the frame rate: 1/50 at 24 fps.' },
            { prompt: 'Show speed with a streak, like a car racing past.', options: [ blur('slow', '1/30'), blur('almost', '1/500', 'The ball is nearly frozen.'), blur('fast', '1/1000', 'That freezes the movement.') ], answer: 0, explain: 'A slow shutter turns movement into a streak.' }
          ] },
          { type: 'quick-check', q: 'You want a slow-motion shot of a jump. What should you change?', options: ['Film at a higher frame rate, like 60 or 120 fps', { text: 'Use a slower shutter speed', clue: 'That adds blur, not slow motion.' }, { text: 'Zoom in', clue: 'Zoom changes size, not speed.' }], answer: 0, explain: 'Film fast, play back at normal speed.' }
        ]
      }
    ],
    check: [
      { media: 'p3-shutter-slow', alt: 'A ball smeared into a streak.', q: 'What caused the streak?', options: ['A slow shutter speed', { text: 'A high frame rate', clue: 'Frame rate is how many pictures per second.' }, { text: 'Bad focus', clue: 'The goal post is sharp.' }], answer: 0, explain: 'The ball moved while the picture was exposed.' },
      { q: 'What does frame rate measure?', options: ['How many pictures the camera takes each second', { text: 'How long each picture is exposed', clue: 'That is shutter speed.' }, { text: 'How big the picture is', clue: 'That is resolution.' }], answer: 0, explain: 'Measured in frames per second.' },
      { q: 'At 24 fps, which shutter speed looks most natural?', options: ['About 1/50 second', { text: '1/1000 second', clue: 'Too sharp: movement looks choppy.' }, { text: '1 second', clue: 'Everything would smear.' }], answer: 0, explain: 'Double the frame rate.' },
      { q: 'How is slow motion made?', options: ['Film at a high frame rate, play back at a normal one', { text: 'Film at a low frame rate', clue: 'That makes movement jumpy or fast.' }, { text: 'Use a slow shutter', clue: 'That makes blur.' }], answer: 0, explain: 'More frames each second stretch out the action.' }
    ],
    remember: [
      '[[Frame rate]] is how many pictures each second, in [[frames per second]].',
      '[[Shutter speed]] sets [[motion blur]]: slow smears, fast freezes.',
      'Film at a high frame rate and play back normally for [[slow motion]].'
    ],
    realCamera: 'Find your phone’s slow-motion mode. Film a friend tossing a ball, then film it again in normal video. Compare how each one looks.'
  });
})();
