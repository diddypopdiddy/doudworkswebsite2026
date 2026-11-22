(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const diag = (rows) => H.art('diagram', rows, rows.map((pair) => pair.join(': ')).join('. '));
  const wave = (label, id) => H.wave(label, id);
  const frames = [
    wave('Four consecutive cuts', 'p9-four-cuts'),
    diag([
      ['Cut 1', 'Reference'],
      ['Cut 2', 'Compare'],
      ['Cut 3', 'Compare'],
      ['Cut 4', 'Compare'],
    ]),
  ];
  H.study({
    slug: 'volume-between-clips',
    frames: frames,
    captions: ['Repeated sentence at four levels', 'Comparison log'],
    hook: [
      'Which cut jumps forward in loudness?',
      ['First', 'Third', 'Fourth'],
      1,
      'The third repeat is louder. Change its [[clip volume]] to keep a [[consistent level]] across the cut.',
    ],
    objectives: [
      'Find a level mismatch across cuts.',
      'Match four clips to a reference by adjusting individual volume.',
    ],
    teachTitle: 'Compare one voice with itself',
    intro: 'Play the repeated sentence without touching your listening volume.',
    teach:
      'A [[decibel]] measures a level difference. Lowering one clip by about 6 dB halves its amplitude. Different recordings may need different [[clip volume]] values to sound alike.',
    activities: [],
    rounds: [],
    questions: [
      [
        0,
        'Which part needs attention before adjusting the master?',
        'The large third group',
        'Every group equally',
        'Compare corresponding speech peaks.',
        'The third group stands out.',
      ],
      [
        null,
        'If all four sliders read 0.5, are the speakers necessarily matched?',
        'No, the source recordings may differ',
        'Yes, the sliders guarantee equal loudness',
        'Compare the original source levels.',
        'Clip gain scales each source independently.',
      ],
      [
        null,
        'Why play over the cut after adjusting?',
        'To check whether one answer still jumps forward',
        'To change the original recording level',
        'Consider the audience’s continuous listen.',
        'A cut exposes sudden level changes.',
      ],
    ],
    remember: [
      '[[Clip volume]] changes one clip.',
      'A [[decibel]] measures a level difference.',
      'Compare adjacent phrases for a [[consistent level]].',
    ],
    realCamera: 'Match two clips recorded on different days, then listen straight through the cut.',
    sketch: 'Draw four clips and identify which needs the largest reduction.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p9-four-cuts', 'Four cuts in order']),
    practice: [
      {
        type: 'editor-exercise',
        level: 2,
        media: ['p9-interview-low', 'p9-interview-good', 'p9-interview-loud'],
        timeline: {
          video: 1,
          audio: 1,
          clips: [
            { media: 'p9-interview-low', track: 'A1', start: 0, duration: 2, volume: 0.85, name: 'Answer 1' },
            { media: 'p9-interview-good', track: 'A1', start: 2, duration: 2, volume: 0.8, name: 'Answer 2' },
            { media: 'p9-interview-loud', track: 'A1', start: 4, duration: 2, volume: 1, name: 'Answer 3' },
            { media: 'p9-interview-good', track: 'A1', start: 6, duration: 2, volume: 0.6, name: 'Answer 4' },
          ],
        },
        task: {
          title: 'Match four answers',
          brief:
            'Keep four clips in place. Use Inspector → Audio → Volume for each cut. Match the low clip as your reference.',
          steps: [
            {
              text: 'Set Answer 1 to a usable reference.',
              hint: 'Leave its volume around 0.85.',
              check: (api) =>
                api.clips('A1').some((c) => c.name === 'Answer 1' && c.volume >= 0.79 && c.volume <= 0.91),
            },
            {
              text: 'Match Answer 2 to the reference.',
              hint: 'Use about 0.31 on the 0–1 slider. Compare the repeated first phrase.',
              check: (api) =>
                api.clips('A1').some((c) => c.name === 'Answer 2' && Math.abs(c.volume - 0.31) <= 0.035),
            },
            {
              text: 'Match Answer 3 to the reference.',
              hint: 'Use about 0.17 on the 0–1 slider. Compare the repeated first phrase.',
              check: (api) =>
                api.clips('A1').some((c) => c.name === 'Answer 3' && Math.abs(c.volume - 0.17) <= 0.035),
            },
            {
              text: 'Match Answer 4 to the reference.',
              hint: 'Use about 0.31 on the 0–1 slider. Compare the repeated first phrase.',
              check: (api) =>
                api.clips('A1').some((c) => c.name === 'Answer 4' && Math.abs(c.volume - 0.31) <= 0.035),
            },
          ],
        },
      },
    ],
    realCameraTitle: 'Try it',
  });
})();
