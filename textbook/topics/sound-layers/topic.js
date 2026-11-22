(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [wave('Spoken line', 'p5-layer-voice'), wave('Full scene', 'p5-scene-none')];
  H.study({
    slug: 'sound-layers',
    frames: frames,
    captions: ['Dialogue alone', 'Five scene layers'],
    hook: [
      'What continues behind the voice in B?',
      ['A musical pulse and scene sounds', 'A second person answering'],
      0,
      'The words stay the same. [[Natural sound]], added [[sound effects]] and [[music]] create a fuller scene.',
    ],
    objectives: ['Identify which layer is missing.', 'Choose room tone and natural sound for an edit.'],
    teachTitle: 'Build a scene around one line',
    intro: 'Listen to the words, paper, chime and pulse as separate jobs.',
    teach:
      '[[Dialogue]] carries words. The paper rustle is [[natural sound]] if collected during the action. An added chime is a [[sound effect|sound-effects]]. [[Room tone]] is the steady sound of this room when nobody speaks.',
    activities: [
      H.section(
        'Mix The Note',
        'All five layers share the same scene timeline.',
        H.text('Mute one layer at a time while the same line plays. Bring it back before comparing another.'),
        H.mixer([
          ['voice', 'p5-layer-voice', 'Spoken line', 75],
          ['paper', 'p5-layer-paper', 'Paper rustle', 65],
          ['effect', 'p5-layer-effect', 'Added chime', 60],
          ['music', 'p5-layer-music', 'Music bed', 35],
          ['room', 'p5-layer-room', 'Room tone', 50],
        ]),
      ),
    ],
    rounds: [],
    questions: [
      [
        0,
        'What can fill an otherwise silent cut between words?',
        'The room’s steady sound',
        'A second copy of the words',
        'Listen for the location between phrases.',
        'Room tone joins the background on either side.',
      ],
      [
        null,
        'A chair scrape recorded during the take belongs to which layer?',
        'Natural sound',
        'A composed score',
        'Think about where the sound originated.',
        'The set produced the scrape during the action.',
      ],
      [
        null,
        'A chime is added later to draw attention to the note. What is its job?',
        'An added sound effect',
        'Room tone',
        'Ask whether it represents the steady room.',
        'The chime marks an individual action.',
      ],
    ],
    remember: [
      '[[Dialogue]] carries spoken words.',
      '[[Natural sound]] records the place and [[sound effects]] can mark an action.',
      '[[Room tone]] bridges gaps while [[music]] shapes mood.',
    ],
    realCamera: 'Record 30 seconds of room tone. Add a paper rustle and compare both on headphones.',
    sketch: 'Label the layers you would record for the note scene.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p5-layer-voice', 'A · spoken line'], ['p5-scene-none', 'B · full mix']),
    afterTeach: [
      {
        type: 'callout',
        kind: 'onset',
        html: 'Record about 30 seconds of the room with everyone quiet and the mic in its interview position.',
      },
    ],
    practice: [
      H.listening(
        [
          'Which take is missing the words?',
          ['p5-scene-none', 'p5-scene-voice'],
          1,
          'Track the spoken rhythm, not just the music.',
          'The pulse remains, but the sentence is gone.',
        ],
        [
          'Which take lost the music bed?',
          ['p5-scene-music', 'p5-scene-none'],
          0,
          'Listen between syllables for a pitched pulse.',
          'The repeating pitched bed disappears.',
        ],
        [
          'Which cut is missing the chime that marks the discovery?',
          ['p5-scene-none', 'p5-scene-effect'],
          1,
          'Listen for the short high note over the spoken line.',
          'The isolated high-pitched cue is absent.',
        ],
      ),
    ],
  });
})();
