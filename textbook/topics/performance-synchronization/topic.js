(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [
    wave('Camera source', 'p9-performance-camera'),
    wave('Recorder source', 'p9-performance-recorder'),
  ];
  H.study({
    slug: 'performance-synchronization',
    frames: frames,
    captions: ['Camera clap', 'Recorder clap later'],
    hook: [
      'Which source has its tall clap farther to the right?',
      ['A', 'B'],
      1,
      'The separate recorder’s peak is later. The time difference is the [[offset]] between their [[slate clap]] marks.',
    ],
    objectives: ['Calculate an offset from a shared clap.', 'Align two tracks within one video frame.'],
    teachTitle: 'Match a shared moment',
    intro: 'Find the narrow clap in each source before watching the full performance.',
    teach:
      'A [[slate clap]] creates a visible contact and a sharp sound in both recordings. Remove the [[offset]] to achieve [[sync]]. Verify [[lip sync]] on a later word.',
    activities: [],
    rounds: [],
    questions: [
      [
        1,
        'The recorder starts the clap at 1.20 s, camera at 1.00 s. What is the difference?',
        '0.20 s',
        '2.20 s',
        'Subtract the times for the same event.',
        'The recorder mark is two tenths later.',
      ],
      [
        null,
        'A recorder peak is late on the timeline. Which way should its clip move?',
        'Earlier',
        'Later',
        'Imagine sliding its peak over the camera peak.',
        'Moving left subtracts the delay.',
      ],
      [
        null,
        'After the clap matches, what should you inspect near the end?',
        'Mouth closure and the matching sound',
        'The file icon color',
        'Think about drift later in a take.',
        'Checking a later consonant detects drift.',
      ],
    ],
    remember: [
      'A [[slate clap]] gives both tracks a common event.',
      'Remove the [[offset]] to achieve [[sync]].',
      'Check [[lip sync]] beyond the first clap.',
    ],
    realCamera: 'Record a clap on two devices. Align the peaks, then check a later spoken word.',
    sketch: 'Mark both clap peaks and draw the required move.',
    frameLabels: ['Before', 'After'],
    practice: [
      {
        type: 'editor-exercise',
        level: 2,
        media: ['p8-sync-clap', 'p9-performance-camera', 'p9-performance-recorder'],
        timeline: {
          video: 1,
          audio: 2,
          clips: [
            { media: 'p8-sync-clap', track: 'V1', start: 0, duration: 5, volume: 1 },
            {
              media: 'p9-performance-camera',
              track: 'A1',
              start: 1,
              duration: 5,
              volume: 1,
              name: 'Camera reference',
            },
            {
              media: 'p9-performance-recorder',
              track: 'A2',
              start: 1.9,
              duration: 5,
              volume: 1,
              name: 'Separate recorder',
            },
          ],
        },
        task: {
          title: 'Align the same clap',
          brief:
            'The picture clap lands at 2.00 s. Keep the camera reference in place. Move the separate recorder clip until both peaks match.',
          steps: [
            {
              text: 'Align the recorder within one frame of the camera clap.',
              hint: 'Its source clap is at 1.20 s. Move the recorder start to about 0.80 s on A2.',
              check: (api) =>
                api
                  .clips('A2')
                  .some(
                    (c) =>
                      c.media === 'p9-performance-recorder' &&
                      api.near(c.start + 1.2 - c.in, 2, 1 / api.fps + 0.00001),
                  ),
            },
            {
              text: 'Keep the camera reference at its original time.',
              hint: 'The camera clip starts at 1.00 s and its clap is a second into that source.',
              check: (api) =>
                api
                  .clips('A1')
                  .some((c) => c.media === 'p9-performance-camera' && api.near(c.start + 1 - c.in, 2)),
            },
          ],
        },
      },
    ],
    minutes: 15,
    realCameraTitle: 'Try it',
  });
})();
