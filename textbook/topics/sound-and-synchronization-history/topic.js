(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const diag = (rows) => H.art('diagram', rows, rows.map((pair) => pair.join(': ')).join('. '));
  const frames = [
    H.cinema(),
    diag([
      ['Picture', 'Actor sings'],
      ['Sound disc', 'Recorded voice'],
      ['Projector', 'Keeps time'],
    ]),
  ];
  H.study({
    slug: 'sound-and-synchronization-history',
    frames: frames,
    captions: ['Early screening diagram', 'Sound-on-disc screening diagram'],
    hook: [
      'In A, where do the audience’s musical cues come from?',
      ['The musician in the theater', 'A recorded voice inside the picture'],
      0,
      'The pianist performs live. A [[silent film]] could have music at the screening.',
    ],
    objectives: [
      'Distinguish live accompaniment from recorded sync.',
      'Explain how separate playback can drift.',
    ],
    teachTitle: 'Who made the sound in the room?',
    intro: 'Compare a live player with a linked recording.',
    teach:
      'A pianist could follow the action or change the mood. [[Synchronized sound]] holds a recorded performance in time with the image. [[Sound-on-film|sound-on-film]] records a soundtrack on the film itself.',
    activities: [
      H.section(
        'Two early sound experiments',
        'Inventors tried several ways to keep a recording with its moving image.',
        H.text(
          'Dickson played violin into a recording horn in the 1890s. The Jazz Singer (1927) included synchronized songs and speech using discs.',
        ),
        {
          type: 'video-segments',
          media: 'archive-dickson',
          pauses: [{ at: 1, prompt: 'How could the filmmaker check that bow and music agree?' }],
        },
        H.text(
          'The Jazz Singer paired a disc with its projector. Much of the film still used silent-film storytelling.',
        ),
        {
          type: 'video-segments',
          media: 'archive-jazz',
          pauses: [{ at: 2, prompt: 'What would drift look like when the performer sings?' }],
        },
      ),
    ],
    rounds: [],
    questions: [
      [
        1,
        'If the disc starts late, what will the audience notice?',
        'The mouth moves before its sound',
        'The projected picture turns blue',
        'Compare the starts of the two devices.',
        'The late disc leaves the voice behind the mouth.',
      ],
      [
        null,
        'How could a silent-era audience learn what someone said?',
        'An intertitle showing written words',
        'Only a microphone hidden by the screen',
        'Think about information visible in the picture.',
        'Written intertitles supplied dialogue or story details.',
      ],
      [
        null,
        'Which system carries the recording on the same strip as the picture?',
        'Sound-on-film',
        'A live pianist',
        'Think about the physical carrier.',
        'The soundtrack lies on the film.',
      ],
    ],
    remember: [
      'A [[silent film]] could have live accompaniment.',
      '[[Synchronized sound]] matches a recorded event to its picture.',
      '[[Sound-on-film|sound-on-film]] carries audio on the film strip.',
    ],
    realCamera: 'Watch a silent scene with and without music. Name one action that feels different.',
    sketch: 'Sketch a live screening and a synchronized screening.',
    frameLabels: ['Before', 'After'],
    realCameraTitle: 'Try it',
    afterTeach: [
      {
        type: 'quick-check',
        ...H.q(
          frames[0],
          'Which sound could change between two screenings of this same print?',
          'The pianist’s accompaniment',
          'Recorded dialogue carried on this print',
          'Look below the screen.',
          'A live musician can vary the performance.',
        ),
      },
      {
        type: 'callout',
        kind: 'history',
        html: '<a href="https://www.loc.gov/item/00694117/">Library of Congress film record</a> · <a href="https://www.loc.gov/static/programs/national-film-preservation-board/documents/jazz_singer.pdf">The Jazz Singer program essay</a>',
      },
    ],
    hookMedia: frames[0],
  });
})();
