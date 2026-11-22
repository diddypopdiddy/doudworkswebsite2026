/* 3.13 Motion photography and Muybridge (history). A drawn runner stands in for Muybridge's public-domain photos
   (The Horse in Motion, 1878) until they are downloaded into media/pd/. */
(function () {
  const T = Textbook, D = T.draw;
  const run = i => D.runnerFrame(i, 12, { grid: true });
  // Twelve cameras in a row beside a track, each with a tripwire.
  const rig = () => D.svg('<rect width="320" height="180" fill="#f4f5f3"/><rect y="118" width="320" height="30" fill="#e2d6c2"/>' +
    Array.from({ length: 12 }, (_, i) => '<rect x="' + (14 + i * 25) + '" y="40" width="16" height="12" rx="2" fill="#171b1f"/><path d="M' + (22 + i * 25) + ' 52 v74" stroke="#a8442a" stroke-width="1" stroke-dasharray="3 3"/>').join('') +
    '<text x="12" y="24" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#5d6469">12 cameras, each tripped by a thread across the track</text>' +
    '<g transform="translate(170 90)"><ellipse cx="0" cy="0" rx="34" ry="14" fill="#7a5a3a"/><path d="M28 -6 l20 -16 l6 4 l-16 18z" fill="#7a5a3a"/><path d="M-26 8 l-8 28 M-14 10 l4 26 M16 10 l-6 26 M26 6 l10 28" stroke="#7a5a3a" stroke-width="5" stroke-linecap="round"/><circle cx="-2" cy="-22" r="7" fill="#e9c6a5"/><path d="M-6 -16 h8 v14 h-8z" fill="#3157c8"/></g>' +
    '<text x="12" y="168" font-family="Inter,sans-serif" font-size="10" fill="#5d6469">Drawn diagram</text>');

  T.topic({
    slug: 'motion-photography-and-muybridge',
    minutes: 12,
    bigIdea: 'A row of cameras showed what the eye could not see.',
    hook: {
      svg: rig(), alt: 'A horse and rider gallop past a row of twelve cameras, each with a thread across the track.',
      question: 'In 1878 people argued: does a galloping horse ever have all four hooves off the ground? How could cameras settle it?',
      options: ['Take one long photo of the whole run', 'Take many photos, each a split second apart', 'Film it with a video camera'],
      answer: 1,
      reveal: 'Eadweard Muybridge set up twelve cameras that each took one photo as the horse passed. Together they made a [[motion study]]: one movement broken into separate moments. One photo showed all four hooves in the air.'
    },
    notes: {
      sketch: 'Sketch three moments of a person jumping: crouch, in the air, landing.',
      frames: 3, frameLabels: ['Moment 1', 'Moment 2', 'Moment 3'],
      think: 'What movement would you want to slow down and study with a row of cameras? Why?'
    },
    vocab: ['motion-study', 'sequence', 'still-frame'],
    review: ['frame', 'apparent-motion'],
    objectives: [
      'Explain how Muybridge used a row of cameras to study motion.',
      'Show how a series of still frames becomes motion when played in order.'
    ],
    sections: [
      {
        title: 'The horse question',
        intro: 'A bet about horses led to a breakthrough in photography.',
        blocks: [
          { type: 'text', html: '<p>In 1878, the photographer Eadweard Muybridge set twelve cameras in a row beside a racetrack in California. Threads stretched across the track. As the horse galloped past, it broke each thread and tripped a camera, one after another.</p><p>The result was a [[motion study]]: twelve [[still frames|still-frame]], each a split second apart. For the first time, people could see exactly how a horse’s legs move, and yes, at one moment all four hooves are off the ground.</p>' },
          { type: 'figure', svg: rig(), alt: 'Diagram of twelve cameras beside a track.', caption: 'Muybridge’s setup: each camera fires once as the horse passes.' },
          { type: 'callout', kind: 'consider', html: 'The human eye couldn’t see the moment all four hooves left the ground. What else happens too fast to see?' }
        ]
      },
      {
        title: 'Step through, then play',
        intro: 'Look at each frame, then play them in order.',
        blocks: [
          { type: 'text', html: '<p>Laid side by side, Muybridge’s photos are a [[sequence]]: separate pictures in order. Shown quickly one after another, they turn back into motion. Muybridge did exactly that in 1879 with a projector he called the zoopraxiscope.</p><p>This drawn runner stands in for his photos. Step through the frames, then press play.</p>' },
          { type: 'flipbook', frames: Array.from({ length: 12 }, (_, i) => run(i)), fps: 2, strip: true, standin: 'Drawn stand-in', side: { title: 'Look closely', html: '<p>Step to the frame where the legs stretch widest, then the one where they pass each other. At normal speed you would never notice those moments.</p>' } }
        ]
      },
      {
        title: 'Why it mattered',
        intro: 'Muybridge’s work points straight to film.',
        blocks: [
          { type: 'text', html: '<p>Muybridge went on to photograph people running, jumping and dancing, and animals of every kind. Artists used his photos to draw movement correctly. Inventors used the same idea, many pictures in quick order, to build the first movie cameras about ten years later.</p>' },
          { type: 'quick-check', svg: run(3), alt: 'One drawn frame of the runner.', q: 'What is a single picture like this one, taken from a run of pictures, called?', options: ['A still frame', { text: 'A sequence', clue: 'A sequence is many pictures in order.' }, { text: 'A zoetrope', clue: 'A zoetrope is a spinning toy.' }], answer: 0, explain: 'One picture from a moving image is a still frame.' }
        ]
      }
    ],
    check: [
      { svg: rig(), alt: 'Twelve cameras beside a track.', q: 'Why did Muybridge use twelve cameras?', options: ['To take photos a split second apart as the horse passed', { text: 'To take the same photo twelve times', clue: 'Each camera fired at a different moment.' }, { text: 'Because one camera was too slow to film video', clue: 'There was no video in 1878.' }], answer: 0, explain: 'Each camera caught a different moment.' },
      { q: 'What is a motion study?', options: ['A series of photos that breaks one movement into separate moments', { text: 'A blurry photo of something moving', clue: 'Each photo is sharp and separate.' }, { text: 'A film with one long shot', clue: 'That is a single-shot film.' }], answer: 0, explain: 'One movement, many moments.' },
      { svg: run(6), alt: 'A drawn runner frame.', q: 'What happens if you show twelve frames like this one quickly, in order?', options: ['The runner seems to move', { text: 'You see twelve different runners', clue: 'Fast enough, they join together.' }, { text: 'Nothing changes', clue: 'Think of the flip book.' }], answer: 0, explain: 'That is apparent motion.' }
    ],
    remember: [
      'Muybridge used a row of cameras to make a [[motion study]] in 1878.',
      'Each photo is a [[still frame]]; in order they form a [[sequence]].',
      'Played quickly, the frames became motion, pointing the way to film.'
    ],
    realCameraTitle: 'Try it',
    realCamera: 'Use your phone’s burst mode to photograph a friend jumping. Swipe through the photos. Find the frame where they are highest in the air.'
  });
})();
