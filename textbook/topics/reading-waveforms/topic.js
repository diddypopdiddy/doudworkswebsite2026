(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [
    wave('A', 'p9-performance-camera'),
    wave('B', 'p9-score-pulse'),
    wave('C', 'p5-layer-room'),
  ];
  H.study({
    slug: 'reading-waveforms',
    frames: frames,
    captions: ['Isolated clap and pauses', 'Regular pulse', 'Low room floor'],
    hook: [
      'Which picture shows one sharp clap before the words?',
      ['A', 'B', 'C'],
      0,
      'A has one tall, narrow peak before the smaller sounds. A [[waveform]] maps [[amplitude]] across time.',
    ],
    objectives: ['Locate a clap and a pause by sight.', 'Match waveform shapes to sounds.'],
    teachTitle: 'Read across time',
    intro: 'Height shows strength and horizontal position shows time.',
    teach:
      'A tall, narrow mark can be a clap. A flat stretch suggests [[silence]]. A [[waveform]] cannot identify a sound by itself. Listen to confirm.',
    activities: [
      H.section(
        'Hear the peaks',
        'A single recording contains an impact, speech and a pause.',
        H.text('Jump between the clap, phrase and pause. Predict each sound by its shape.'),
        H.audio(
          'p9-performance-camera',
          'Clap, phrase and pause',
          [
            { label: 'Clap', from: 0.8, to: 1.45 },
            { label: 'Phrase', from: 2, to: 4.8 },
            { label: 'Pause', from: 5.1, to: 5.9 },
          ],
          [{ at: 1.3, prompt: 'How wide was the clap compared with a word?' }],
        ),
      ),
    ],
    rounds: [],
    questions: [
      [
        0,
        'Where would you place the first marker?',
        'At the narrow early spike',
        'Anywhere in the flat tail',
        'Find the isolated impact.',
        'The transient identifies the clap.',
      ],
      [
        1,
        'Which sound fits the repeating shape?',
        'A regular pulse',
        'One isolated handclap',
        'Count the similar peaks.',
        'Equally spaced peaks suggest a pulse.',
      ],
      [
        null,
        'Can similar peaks prove the words are the same?',
        'No, listen to confirm the content',
        'Yes, equal height guarantees equal words',
        'Think about what amplitude measures.',
        'Height represents level, not the identity of the sound.',
      ],
    ],
    remember: [
      'A [[waveform]] shows [[amplitude]] across time.',
      'A narrow [[peak]] can mark a clap.',
      'Listen to confirm apparent [[silence]].',
    ],
    realCamera: 'Record a clap, a spoken line and a pause. Find all three in an editor.',
    sketch: 'Draw the clap and pause on a time axis.',
    frameLabels: ['Before', 'After'],
    hookMedia: { pair: frames.map((f, i) => ({ ...f, caption: 'ABC'[i] })) },
    review: ['peak'],
    realCameraTitle: 'Try it',
    practice: [
      H.listening(
        [
          'Choose the sound with one isolated clap before speech.',
          ['p9-performance-camera', 'p9-score-pulse'],
          0,
          'Listen for an isolated impact before the phrase.',
          'The early clap is separate from speech.',
        ],
        [
          'Choose the sound that fits a repeating evenly spaced pattern.',
          ['p5-layer-room', 'p9-score-pulse'],
          1,
          'Count regularly spaced pitched attacks.',
          'The pulse repeats at even intervals.',
        ],
        [
          'Which belongs under an almost flat room-tone trace?',
          ['p5-layer-room', 'p9-performance-camera'],
          0,
          'Compare the overall level with the impact.',
          'The room floor stays low and steady.',
        ],
      ),
      H.text('Now locate two events on the timeline.'),
      {
        type: 'editor-exercise',
        level: 2,
        media: ['p9-performance-camera'],
        timeline: {
          video: 1,
          audio: 1,
          clips: [{ media: 'p9-performance-camera', track: 'A1', start: 0, duration: 8, volume: 1 }],
        },
        task: {
          title: 'Locate two events',
          brief: 'Move the playhead by sight. Open the keyboard controls for precise time entry.',
          steps: [
            {
              text: 'Park on the isolated clap peak.',
              hint: 'Look near the first whole second.',
              check: (api) => api.near(api.playhead, 1, 0.1),
              sticky: true,
            },
            {
              text: 'Park inside the later quiet interval.',
              hint: 'Inspect the space after the words and before the last phrase.',
              check: (api) => api.playhead >= 5.12 && api.playhead <= 5.88,
              sticky: true,
            },
          ],
        },
      },
    ],
  });
})();
