(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [wave('Four faults', 'p9-four-problems'), wave('Clear reference', 'p9-interview-good')];
  H.study({
    slug: 'sound-judgment',
    frames: frames,
    captions: ['Deliberately damaged mix', 'Clean voice reference'],
    hook: [
      'Which changes can you hear in the fault reel?',
      ['Rough words, buried voice, abrupt tone, level jump', 'Four clean repeats at the same level'],
      0,
      'The reel changes problems across time. Use the [[waveform]] to locate each moment, then listen for the cause.',
    ],
    objectives: [
      'Diagnose four distinct mix faults.',
      'Repair sources, balance, level and edges before export.',
    ],
    teachTitle: 'Check the whole mix',
    intro: 'Listen once for meaning and again for the exact faults.',
    teach:
      'If the original source clipped, lowering its level leaves the distortion. Choose a clean alternate or retake. Then set the [[mix]], match clips, and replay the joins.',
    activities: [],
    rounds: [],
    questions: [
      [
        0,
        'A distorted word stays rough after you reduce its volume. What next?',
        'Replace the clipped source with a clean take',
        'Lower the entire mix again',
        'Consider when the distortion was recorded.',
        'Changing playback gain cannot rebuild the original missing peaks.',
      ],
      [
        null,
        'A word disappears only when the music plays. Which repair fits?',
        'Duck the music',
        'Crossfade the camera picture',
        'Compare voice with the music muted.',
        'Only the simultaneous bed masks the word.',
      ],
      [
        null,
        'A pickup is much quieter than the previous line. Which control is most local?',
        'Pickup clip volume',
        'Master output',
        'The rest of the mix already works.',
        'Adjusting only the pickup preserves adjacent levels.',
      ],
    ],
    remember: [
      'Inspect the [[waveform]] and listen for the cause.',
      'Set [[clip volume]] and [[ducking]] for a clear [[mix]].',
      'Check [[audio fade]] edges and [[sync]] before export.',
    ],
    realCamera: 'Run the listening checklist on a recent edit. Write down the time and fix for one fault.',
    sketch: 'Draw a problem and its corrected waveform or mix setting.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p9-four-problems', 'Four-fault reel']),
    review: ['waveform', 'clip-volume', 'ducking', 'mix', 'audio-fade', 'sync'],
    teachVisual: H.steps(
      'Check whether the source itself is distorted.',
      'Listen to speech with and without the music.',
      'Compare the levels of neighboring lines.',
      'Listen across starts, joins and ends.',
      'Check synchronization at the beginning and end.',
    ),
    practice: [
      H.listening(
        [
          'Which take needs a replacement because its source clipped?',
          ['p5-gain-good', 'p5-gain-clipped'],
          1,
          'Listen for roughness on loud syllables.',
          'The repeated distortion is in the source.',
        ],
        [
          'Which mix buries the line?',
          ['p9-mix-mask', 'p9-mix-clear'],
          0,
          'Try repeating the last few words.',
          'The louder music covers speech.',
        ],
        [
          'Which edge needs a short fade?',
          ['p9-fade', 'p9-pop'],
          1,
          'Listen to the beginning and ending of the tone.',
          'The abrupt edge creates the click.',
        ],
      ),
      H.text('Apply four repairs to the project timeline.'),
      {
        type: 'editor-exercise',
        level: 2,
        media: ['p5-gain-clipped', 'p5-gain-good', 'p9-music-bed'],
        timeline: {
          video: 1,
          audio: 3,
          clips: [
            {
              media: 'p5-gain-clipped',
              track: 'A1',
              start: 0,
              duration: 4,
              volume: 1,
              name: 'Damaged original',
            },
            {
              media: 'p5-gain-good',
              track: 'A2',
              start: 0,
              duration: 4,
              volume: 0.68,
              name: 'Clean replacement',
            },
            { media: 'p5-gain-good', track: 'A2', start: 4, duration: 2, volume: 0.18, name: 'Quiet pickup' },
            { media: 'p9-music-bed', track: 'A3', start: 0, duration: 6, volume: 1, name: 'Music bed' },
          ],
        },
        task: {
          title: 'Repair the interview mix',
          brief:
            'A1 has a clipped line. A2 has its clean alternate and a quiet pickup. A3 carries loud music with an abrupt opening. Keep the clean dialogue and fix the music.',
          steps: [
            {
              text: 'Use the clean alternate instead of the clipped original.',
              hint: 'Mute A1. Leave the clean replacement enabled on A2.',
              check: (api) =>
                api.tracks().some((t) => t.name === 'A1' && t.muted) &&
                api.tracks().some((t) => t.name === 'A2' && !t.muted) &&
                api.clips('A2').some((c) => c.name === 'Clean replacement' && !c.disabled && c.volume > 0.5),
            },
            {
              text: 'Bring the quiet pickup within range of the replacement.',
              hint: 'In Inspector, set the pickup volume near 0.68.',
              check: (api) =>
                api
                  .clips('A2')
                  .some((c) => c.name === 'Quiet pickup' && !c.disabled && Math.abs(c.volume - 0.68) <= 0.06),
            },
            {
              text: 'Leave an audible bed below the voice.',
              hint: 'Reduce the music clip to about 0.20.',
              check: (api) =>
                api
                  .clips('A3')
                  .some(
                    (c) => c.name === 'Music bed' && !c.disabled && c.volume >= 0.12 && c.volume <= 0.3,
                  ) && api.tracks().some((t) => t.name === 'A3' && !t.muted),
            },
            {
              text: 'Smooth the abrupt start of the music.',
              hint: 'Apply an Audio Transition on the left edge of Music bed.',
              check: (api) =>
                api.clips().some((c) => c.name === 'Music bed' && /^afade/.test(c.transitionIn || '')),
            },
          ],
        },
      },
    ],
    minutes: 15,
    realCameraTitle: 'Try it',
  });
})();
