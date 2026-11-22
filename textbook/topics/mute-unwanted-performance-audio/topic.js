(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const diag = (rows) => H.art('diagram', rows, rows.map((pair) => pair.join(': ')).join('. '));
  const frames = [
    diag([
      ['A1 camera', 'Traffic and voice'],
      ['A2 performance', 'Clean score'],
    ]),
    diag([
      ['A1 mute', 'Reference retained'],
      ['A2 enabled', 'Audience hears music'],
    ]),
  ];
  H.study({
    slug: 'mute-unwanted-performance-audio',
    frames: frames,
    captions: ['Two recordings', 'Delivery mix'],
    hook: [
      'Which recording has street noise competing with the performance?',
      ['A', 'B'],
      0,
      'A contains location noise. [[Solo]] identifies a track and [[mute]] removes it from playback without deleting it.',
    ],
    objectives: [
      'Use solo to identify the scratch track.',
      'Mute unwanted audio while preserving a clean performance.',
    ],
    teachTitle: 'Identify the unwanted track',
    intro: 'A camera recording can help with sync before you silence it.',
    teach:
      '[[Solo]] isolates a track for inspection. [[Mute]] silences a whole track. To [[disable a clip]], switch off only that clip when other clips on the track must still play.',
    activities: [],
    rounds: [],
    questions: [
      [
        0,
        'Which track should remain audible for this clean music delivery?',
        'A2 performance',
        'A1 camera',
        'Check which source carries the intended song.',
        'A2 holds the clean music.',
      ],
      [
        null,
        'Only one noisy clip on A1 should disappear. What is the precise control?',
        'Disable that one clip',
        'Mute the whole A1 track',
        'Other useful clips are on A1.',
        'Disabling one clip preserves the rest.',
      ],
      [
        null,
        'Why release Solo before the final check?',
        'To hear the intended combination of tracks',
        'To permanently erase the reference',
        'Consider what Solo hides.',
        'Solo can conceal another enabled track.',
      ],
    ],
    remember: [
      '[[Solo]] helps identify one track.',
      '[[Mute]] silences a track without deleting it.',
      '[[Disable a clip]] to silence only one timeline item.',
    ],
    realCamera: 'Mute camera audio under a performance. Solo each track briefly to verify the sources.',
    sketch: 'Label which track is a reference and which is delivered.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p5-noise-traffic', 'A'], ['p9-score-pulse', 'B']),
    practice: [
      {
        type: 'editor-exercise',
        level: 2,
        media: ['p8-sync-clap', 'p5-noise-traffic', 'p9-score-pulse'],
        timeline: {
          video: 1,
          audio: 2,
          clips: [
            { media: 'p8-sync-clap', track: 'V1', start: 0, duration: 5, volume: 1 },
            {
              media: 'p5-noise-traffic',
              track: 'A1',
              start: 0,
              duration: 4,
              volume: 1,
              name: 'Camera crowd',
            },
            {
              media: 'p9-score-pulse',
              track: 'A2',
              start: 0,
              duration: 4,
              volume: 1,
              name: 'Clean performance',
            },
          ],
        },
        task: {
          title: 'Deliver only the clean performance',
          brief:
            'Solo the camera track to identify the scratch audio. Release Solo, then mute the camera and retain the clean performance.',
          steps: [
            {
              text: 'Solo A1 to identify its unwanted sound.',
              hint: 'Use S in the A1 track header.',
              check: (api) => api.tracks().some((t) => t.name === 'A1' && t.solo),
              sticky: true,
            },
            {
              text: 'Return only the unmuted, enabled performance to the final mix.',
              hint: 'Release S on all tracks. Turn on M for A1 only.',
              check: (api) =>
                api.tracks().some((t) => t.name === 'A1' && t.muted) &&
                api.tracks().some((t) => t.name === 'A2' && !t.muted) &&
                api.tracks().every((t) => !t.solo) &&
                api.clips('A2').some((c) => c.media === 'p9-score-pulse' && !c.disabled && c.volume > 0),
            },
          ],
        },
      },
    ],
    minutes: 10,
    realCameraTitle: 'Try it',
  });
})();
