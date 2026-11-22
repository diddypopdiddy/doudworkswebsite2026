/* 3.16 Early cinema (history). Uses the public-domain Lumière film already in media/pd/. */
(function () {
  const T = Textbook, D = T.draw;
  // A projector shining onto a screen, drawn.
  const projector = () => D.svg('<rect width="320" height="180" fill="#20252a"/><path d="M78 92 L250 30 L250 150z" fill="rgba(255,240,190,.18)"/>' +
    '<rect x="250" y="26" width="58" height="128" fill="#f3f1ec"/><rect x="256" y="64" width="46" height="34" fill="#b9b2a4"/>' +
    '<rect x="30" y="80" width="52" height="28" rx="4" fill="#5d6469"/><circle cx="44" cy="70" r="14" fill="none" stroke="#9aa0a4" stroke-width="4"/><circle cx="68" cy="70" r="14" fill="none" stroke="#9aa0a4" stroke-width="4"/><rect x="80" y="88" width="10" height="10" fill="#9aa0a4"/>' +
    '<text x="12" y="20" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#c9ccd0">Projector → screen</text>');

  T.topic({
    slug: 'early-cinema',
    minutes: 12,
    bigIdea: 'The first films were single, locked shots of everyday life.',
    hook: {
      media: { id: 'pd-lumiere-factory', t: 12 }, alt: 'A still from 1895: workers streaming out of a factory gate.',
      question: 'This film from 1895 is about 45 seconds long. What do you think happens in it?',
      options: ['A chase with lots of cuts', 'Workers leave a factory, filmed in one shot', 'A close-up of a famous actor'],
      answer: 1,
      reveal: 'The whole film is one [[locked-off shot]] of workers leaving the Lumière factory. No story, no cuts, no camera moves. Films of real life like this are called [[actuality films|actuality-film]].'
    },
    notes: {
      sketch: 'Sketch one frame of an actuality film you could make at school today: one locked-off shot of everyday life.',
      frames: 1, frameLabels: ['My actuality film'],
      think: 'Why do you think audiences in 1895 found a film of workers leaving a factory exciting?'
    },
    vocab: ['actuality-film', 'single-shot-film', 'projector'],
    review: ['locked-off-shot', 'apparent-motion'],
    objectives: [
      'Describe what the first films looked like.',
      'Connect early single-shot films to the locked-off shot.'
    ],
    sections: [
      {
        title: 'The first audiences',
        intro: 'In 1895, a moving picture on a screen was brand new.',
        blocks: [
          { type: 'text', html: '<p>In the early 1890s, Thomas Edison’s company built the Kinetoscope: a box you peered into, one person at a time. Then, on 28 December 1895 in Paris, Auguste and Louis Lumière showed films to a paying audience on a big screen, using their Cinématographe, a camera that also worked as a [[projector]].</p><p>Their films were each about 50 seconds long, the length of one reel of film.</p>' },
          { type: 'figure', svg: projector(), alt: 'A projector shining a beam onto a screen.', caption: 'A projector shines the film’s frames onto a screen, one after another.' },
          { type: 'callout', kind: 'consider', html: 'People had seen photographs for 50 years. What was so new about watching everyday life move on a screen?' }
        ]
      },
      {
        title: 'One shot, real life',
        intro: 'Watch the film in pieces.',
        blocks: [
          { type: 'text', html: '<p>Early films were [[actuality films|actuality-film]]: real, everyday life, like workers leaving a factory, a train arriving or a baby eating breakfast. Each was a [[single-shot film]]: the camera was set up, locked off, cranked for under a minute, and stopped. No cuts, no close-ups.</p>' },
          { type: 'video-segments', media: 'pd-lumiere-factory', label: 'Workers Leaving the Lumière Factory', segments: [ { label: 'The gates open', from: 1, to: 12 }, { label: 'The crowd', from: 12, to: 26 }, { label: 'The end', from: 26, to: 36.5 } ],
            pauses: [ { at: 14, prompt: 'Does the camera move or cut? What makes this interesting to watch anyway?' } ], caption: 'One locked-off shot. Everything happens in front of the camera.' },
          { type: 'callout', kind: 'history', html: 'A few years later, filmmakers started joining shots of different places. See how in 6.06.', link: { href: '../early-cuts-and-connected-spaces/index.html', label: 'Read 6.06 →' } }
        ]
      },
      {
        title: 'What they teach us now',
        intro: 'A locked-off shot still works.',
        blocks: [
          { type: 'text', html: '<p>The Lumière films show the power of a still camera: frame the place well, then let real life move through it. Today’s [[locked-off shot]] works the same way, from security cameras to the opening shot of a documentary.</p>' },
          { type: 'quick-check', media: { id: 'pd-lumiere-factory', t: 20 }, alt: 'Workers leaving the factory.', q: 'What kind of film is this?', options: ['An actuality film', { text: 'A fiction film with actors and a script', clue: 'These are real workers leaving real work.' }, { text: 'A stop-motion film', clue: 'It was filmed at normal speed.' }], answer: 0, explain: 'Real, everyday life in a single shot.' }
        ]
      }
    ],
    check: [
      { media: { id: 'pd-lumiere-factory', t: 8 }, alt: 'A still from the factory film.', q: 'How many shots are in this film?', options: ['One', { text: 'About ten', clue: 'The camera never cuts.' }, { text: 'Hundreds', clue: 'Hundreds of frames, but one shot.' }], answer: 0, explain: 'It is a single-shot film.' },
      { q: 'What is an actuality film?', options: ['An early film of real, everyday life', { text: 'A film with special effects', clue: 'Actuality means real.' }, { text: 'A film made of drawings', clue: 'That is animation.' }], answer: 0, explain: 'Workers, trains, streets: real life.' },
      { q: 'What did the Lumières’ Cinématographe do?', options: ['It filmed and also projected films on a screen', { text: 'It recorded sound', clue: 'Early films were silent.' }, { text: 'It let one person watch through a peephole', clue: 'That was Edison’s Kinetoscope.' }], answer: 0, explain: 'It worked as a camera and a projector.' }
    ],
    remember: [
      'The first films were [[actuality films|actuality-film]] of everyday life.',
      'Each was a [[single-shot film]]: one [[locked-off shot]], under a minute long.',
      'A [[projector]] let a whole audience watch on a big screen.'
    ],
    realCameraTitle: 'Try it',
    realCamera: 'Make your own actuality film: one locked-off shot, 45 seconds long, of everyday life at school, like the hallway between classes. No cuts, no zoom.'
  });
})();
