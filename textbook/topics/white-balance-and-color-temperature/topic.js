(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const photo = (filter) => H.photo('interview-a', filter);
  const frames = [
    photo('sepia(.67) saturate(1.55)'),
    photo('none'),
    photo('sepia(.6) hue-rotate(155deg) saturate(1.4)'),
    photo('saturate(.15)'),
  ];
  H.study({
    cameraSection: {
      id: 'camera-practice', title: 'Balance the interview camera',
      intro: 'A warm lamp is lighting the interview. Use a preset, then measure the light falling on the speaker.',
      blocks: [{
        type: 'camera-sim', title: 'Set white balance under the lamp', body: ['g97', 'hcx1600'], level: 3, scene: 'interview-window',
        start: { power: true, mode: 'video', settings: { wb: 'daylight' } }, kit: ['white-card'],
        forBody: { hcx1600: { start: { power: true, mode: 'MANU', settings: { wb: 'daylight' } } } },
        tasks: [
          { text: 'Film a short test using the warm-lamp preset or a 3200 K setting.',
            hint: 'Open WB or WHITE BAL. Choose Incandescent or a 3200 K preset, then record for at least one second.',
            check: s => s.takes.some(t => t.length >= 1 && t.balanced(500) && ['incandescent', 'kelvin'].includes(t.settings.wb)) },
          { text: 'Put the white card in the subject’s light, measure a custom white balance, and record a balanced take.',
            hint: 'Use the white card from the kit. Select white set on the G97 or a memory channel on the camcorder, then measure and remove the card before recording.',
            check: s => s.did('whiteSet') && s.takes.some(t => t.length >= 1 && t.balanced() && ['white', 'Ach', 'Bch'].includes(t.settings.wb) && t.history.every(sample => !sample.whiteCard)) }
        ], doneText: 'Your take carries the white balance you measured on set.'
      }]
    },
    slug: 'white-balance-and-color-temperature',
    frames: frames,
    captions: ['Orange cast', 'Neutral', 'Blue cast', 'Low saturation'],
    hook: [
      'Which version makes pale surfaces look orange?',
      ['A', 'B'],
      0,
      'A has an orange cast. [[White balance]] adjusts the recording so a neutral reference looks neutral in that light.',
    ],
    objectives: ['Recognize warm and cool casts.', 'Choose white balance using a neutral reference.'],
    teachTitle: 'Find a neutral reference',
    intro: 'A white shirt or gray card gives you a reference under the same lamp as the face.',
    teach:
      '[[Color temperature]] describes light on the [[Kelvin]] scale. Lower-temperature light looks [[warm]]. Higher-temperature light looks [[cool]]. A manual camera setting compensates for the assumed source.',
    afterTeach: [
      H.fig(
        H.kelvinScale(),
        'Approximate light-source temperatures. Camera white-balance settings compensate for these colors.',
      ),
    ],
    activities: [
      H.section(
        'Change the camera setting',
        'White-balance compensation changes the recording under a fixed lamp.',
        H.text('These simulated stops show the camera setting rising under one fixed light.'),
        H.slider('Manual Kelvin setting', [
          [frames[2], '2800 K', 'Blue cast under this fixed light.'],
          [photo('sepia(.2) hue-rotate(155deg)'), '4000 K', 'Slight cool cast.'],
          [frames[1], '5000 K', 'The reference looks neutral.'],
          [photo('sepia(.3)'), '6200 K', 'The reference warms.'],
          [frames[0], '7500 K', 'Orange cast under this same light.'],
        ]),
      ),
    ],
    rounds: [
      [
        'Under a tungsten lamp, keep the white card neutral.',
        [0, 1],
        1,
        'Check the pale reference before skin.',
        'The neutral version removes the orange cast.',
      ],
      [
        'Choose the balanced daylight angle.',
        [1, 2],
        0,
        'Inspect the pale wall.',
        'The pale surface stays neutral.',
      ],
      [
        'Match a shaded subject to a neutral reference.',
        [2, 1],
        1,
        'Shade can leave white surfaces blue.',
        'The reference carries no blue tint.',
      ],
    ],
    questions: [
      [
        2,
        'Which cast would you correct here?',
        'Cool blue',
        'Warm orange',
        'Look at the palest area.',
        'The cool cast affects neutral surfaces too.',
      ],
      [
        null,
        'Which source usually has the lower color temperature?',
        'A warm household tungsten lamp',
        'A blue open sky',
        'Think about the Kelvin scale for light sources.',
        'Tungsten light commonly looks warmer.',
      ],
      [
        null,
        'Where should you hold a gray card?',
        'In the light falling on the subject',
        'Under another lamp by the camera',
        'Think about which light needs measuring.',
        'The card must sample the subject’s light.',
      ],
    ],
    remember: [
      '[[White balance]] starts with a neutral reference.',
      '[[Kelvin]] describes [[color temperature]].',
      'A [[warm]] or [[cool]] cast changes neutral surfaces.',
    ],
    realCamera: 'Film a white sheet under a lamp and by a window. Compare auto and fixed presets.',
    sketch: 'Label a neutral patch in a warm and a cool frame.',
    frameLabels: ['First setup', 'Revised setup'],
  });
})();
