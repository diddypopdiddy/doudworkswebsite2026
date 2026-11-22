(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [wave('Abrupt tone', 'p9-pop'), wave('Smoothed tone', 'p9-fade')];
  H.study({
    slug: 'audio-fades-and-crossfades',
    frames: frames,
    captions: ['Abrupt edges', 'Ramped edges'],
    hook: [
      'Which version starts abruptly?',
      ['A', 'B'],
      0,
      'A jumps immediately to a strong signal. A short [[audio fade]] can prevent a [[pop]] at an edit.',
    ],
    objectives: ['Identify abrupt and gradual edges.', 'Apply outer fades and an overlapping crossfade.'],
    teachTitle: 'Listen to the join',
    intro: 'Compare the first and last instant of the tone.',
    teach:
      'An [[audio fade]] changes level gradually at an edge. In a [[crossfade]], one clip falls while another rises through the same interval.',
    activities: [],
    rounds: [],
    questions: [
      [
        1,
        'Which feature suggests a fade?',
        'The gradual rise and fall',
        'The file name',
        'Trace the outer envelope.',
        'Amplitude changes gradually at both ends.',
      ],
      [
        null,
        'At a crossfade, what happens during the shared interval?',
        'Outgoing sound falls as incoming sound rises',
        'Both sounds stop for a gap',
        'Picture their levels over time.',
        'The two fades bridge the join.',
      ],
      [
        null,
        'When could an overly long fade cause trouble?',
        'It hides the first syllable',
        'It adds picture frames',
        'Think about an immediate spoken onset.',
        'A slow rise can bury an opening word.',
      ],
    ],
    remember: [
      'An [[audio fade]] softens an edge.',
      'A [[crossfade]] overlaps two changing levels.',
      'Listen for a [[pop]] at the exact join.',
    ],
    realCamera: 'Crossfade two recordings and listen closely at the join.',
    sketch: 'Draw the two level lines across an overlap.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p9-pop', 'A'], ['p9-fade', 'B']),
    realCameraTitle: 'Try it',
    minutes: 10,
    practice: [
      {
        type: 'editor-exercise',
        level: 2,
        media: ['p9-music-bed-a', 'p9-music-bed-b'],
        timeline: {
          video: 1,
          audio: 2,
          clips: [
            { media: 'p9-music-bed-a', track: 'A1', start: 0, duration: 4, volume: 1, name: 'Opening bed' },
            { media: 'p9-music-bed-b', track: 'A2', start: 3.5, duration: 4, volume: 1, name: 'Closing bed' },
          ],
        },
        task: {
          title: 'Smooth the music join',
          brief:
            'The beds already overlap from 3.5 to 4 seconds. Apply audio transitions at the outer edges and on both sides of the overlap.',
          steps: [
            {
              text: 'Fade in the first bed.',
              hint: 'Drag an Audio Transition from the Effects Library to its left edge.',
              check: (api) =>
                api.clips().some((c) => c.name === 'Opening bed' && /^afade/.test(c.transitionIn || '')),
            },
            {
              text: 'Crossfade the overlapping beds.',
              hint: 'Fade the first bed out and the second in at the overlap.',
              check: (api) =>
                api.clips().some((c) => c.name === 'Opening bed' && /^afade/.test(c.transitionOut || '')) &&
                api.clips().some((c) => c.name === 'Closing bed' && /^afade/.test(c.transitionIn || '')),
            },
            {
              text: 'Fade out the closing bed.',
              hint: 'Place an Audio Transition at its right edge.',
              check: (api) =>
                api.clips().some((c) => c.name === 'Closing bed' && /^afade/.test(c.transitionOut || '')),
            },
          ],
        },
      },
    ],
  });
})();
