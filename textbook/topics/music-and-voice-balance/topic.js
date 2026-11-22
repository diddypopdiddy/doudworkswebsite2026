(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [wave('Music over voice', 'p9-mix-mask'), wave('Voice above music', 'p9-mix-clear')];
  H.study({
    slug: 'music-and-voice-balance',
    frames: frames,
    captions: ['Music masks the line', 'Voice leads'],
    hook: [
      'Which version makes the words easier to follow?',
      ['A', 'B'],
      1,
      'The bed is lower in B. [[Ducking]] lowers [[background music]] under speech in a [[mix]].',
    ],
    objectives: ['Balance voice against audible music.', 'Explain when to duck a music bed.'],
    teachTitle: 'Find the sentence first',
    intro: 'Try repeating the sentence while both layers play.',
    teach:
      'Set the voice to a comfortable level. Bring in [[background music]] gradually until it is audible without covering consonants. [[Ducking]] lowers it during speech and lets it return in gaps.',
    activities: [
      H.section(
        'Explore the two layers',
        'A listener should be able to follow the words and still notice the bed.',
        H.text('Mute each layer, compare their jobs, then listen together.'),
        H.mixer([
          ['voice', 'p5-layer-voice', 'Voice', 28],
          ['music', 'p5-layer-music', 'Music', 100],
        ]),
      ),
    ],
    rounds: [],
    questions: [
      [
        0,
        'The bed covers the narrator. Which control should move first?',
        'Lower the music channel',
        'Raise the master equally on both',
        'Consider the difference between channels.',
        'Changing only music improves the balance.',
      ],
      [
        null,
        'Why bring music back between lines?',
        'The gap leaves space for it',
        'To hide the next speaker',
        'Notice when words need space.',
        'A gap allows more music without masking words.',
      ],
      [
        null,
        'A classmate can repeat the sentence but hears no bed. What would you try?',
        'Raise music slightly and check again',
        'Mute music for the whole clip',
        'Listen for both requested layers.',
        'The brief requires understandable words and an audible bed.',
      ],
    ],
    remember: [
      'A [[mix]] balances separate layers.',
      '[[Background music]] supports spoken words.',
      '[[Ducking]] lowers music while someone speaks.',
    ],
    realCamera: 'Record a voiceover and lower the music until another listener can repeat the line.',
    sketch: 'Sketch the music level before, during and after a sentence.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p9-mix-mask', 'A'], ['p9-mix-clear', 'B']),
    realCameraTitle: 'Try it',
    practice: [
      H.mixer(
        [
          ['voice', 'p5-layer-voice', 'Voice', 28],
          ['music', 'p5-layer-music', 'Music', 100],
        ],
        { voice: [65, 100], music: [12, 38] },
      ),
      H.text('Listen once more for the change between words and gaps.'),
      H.quiz(
        H.q(
          null,
          'Which change makes a duck instead of a permanent music level?',
          'Lower music during speech and restore it in gaps',
          'Mute all audio',
          'Compare the level at different times.',
          'Ducking changes the balance with speech.',
        ),
      ),
    ],
  });
})();
