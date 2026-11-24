/* 3.01 Camera readiness. Drawings come from Textbook.draw (shared/camera.js). */
(function () {
  const T = Textbook, D = T.draw;

  T.topic({
    slug: 'camera-readiness',
    minutes: 12,
    bigIdea: 'Check the camera before you need it.',
    hook: {
      svg: D.cameraStatus({ battery: 0.6, card: 'full' }), alt: 'A camera screen showing a person in the frame and R0m00s of recording time left.',
      question: 'The interview is starting. You press record and nothing happens. What went wrong?',
      options: ['The battery is dead', 'The memory card is full', 'The lens cap is on'],
      answer: 1,
      reveal: 'R0m00s in the lower right means zero recording time remains. The [[memory card]] has no space left, so the camera can’t record. A ten-second check before the shoot would have caught it.'
    },
    notes: {
      sketch: 'Draw the back of a camera or phone. Label where you check the battery, the card space and the record light.',
      frames: 1, frameLabels: ['Camera check'],
      think: 'Which camera problem would ruin a shoot you can never redo, like a graduation? How would you prevent it?'
    },
    vocab: ['battery', 'memory-card', 'lens', 'tripod', 'stabilization'],
    review: [],
    objectives: [
      'Name the parts of a camera you check before filming.',
      'Spot a camera that isn’t ready and say what to fix.',
      'Run a quick pre-shoot check on a camera or phone.'
    ],
    sections: [
      {
        title: 'Know your camera',
        intro: 'Every camera, from a phone to a cinema camera, has the same few things to check.',
        blocks: [
          { type: 'text', html: '<p>Before you film, check four things: the [[battery]] has power, the [[memory card]] has space, the [[lens]] is clean and uncovered, and the camera is steady. A [[tripod]] is the most common way to keep it steady. Anything that keeps the picture steady is called [[stabilization]].</p>' },
          { type: 'hotspots', cameras: {
            g97: { name: 'LUMIX G97', views: {
              rear: { name: 'Back', points: [
                { control: 'lcd', label: 'Monitor', text: 'Look at the battery in the upper right and the recording time left in the lower right. R8m30s means eight minutes and thirty seconds remain. Four dashes mean there is no card.' },
                { control: 'play', label: 'Playback', text: 'Open the clips on the card. Play a test take to check the picture and sound.' }
              ] },
              top: { name: 'Top', points: [
                { control: 'power', label: 'ON/OFF', text: 'Turn the camera on. A live picture and readable status icons tell you the monitor is awake.' },
                { control: 'record', label: 'Motion picture button', text: 'Use this button to record video. Check for the red dot in the upper right of the monitor and the running timer.' }
              ] },
              right: { name: 'Card side', points: [{ control: 'card-door', label: 'SD card door', text: 'The card lives behind the grip door. Wait until the card activity mark goes out before opening it.' }] },
              bottom: { name: 'Bottom', points: [{ control: 'battery-door', label: 'Battery door', text: 'Turn the camera off, then open this door to change the battery.' }] }
            } },
            fz300: { name: 'LUMIX FZ300', views: {
              top: { name: 'Top', points: [
                { control: 'record', label: 'Motion picture button', text: 'Press once to start a movie, then press again to stop.' },
                { control: 'power', label: 'ON/OFF', text: 'Switch on before checking the battery and time left.' }
              ] },
              bottom: { name: 'Bottom', points: [{ control: 'battery-door', label: 'Card and battery door', text: 'Both the card and battery are behind this door. A tripod plate may cover it.' }] },
              left: { name: 'Microphone side', points: [{ control: 'mic-socket', label: 'MIC', text: 'The wireless receiver plugs in here. Watch the meters and listen to a test take in playback.' }] }
            } },
            elph180: { name: 'PowerShot ELPH 180', views: {
              rear: { name: 'Back', points: [
                { control: 'record', label: 'Movie button', text: 'The small movie button on the back starts and stops video. The shutter on top takes still pictures.' },
                { control: 'play', label: 'Playback', text: 'Use Playback to check a saved movie with sound from the built-in microphone.' }
              ] },
              bottom: { name: 'Bottom', points: [{ control: 'battery-door', label: 'Card and battery cover', text: 'Turn the camera off. Open this shared cover to change the battery or the card.' }] }
            } },
            hcx1600: { name: 'HC-X1600 camcorder', views: {
              lcd: { name: 'LCD side', points: [
                { control: 'power', label: 'Power', text: 'Switch the camcorder on, open the lens cover, then check the screen.' },
                { control: 'slot-select', label: 'SLOT SEL', text: 'Select the slot with a writable SD card. Check the remaining time for that card.' }
              ] },
              rear: { name: 'Rear', points: [
                { control: 'record', label: 'REC', text: 'Use the grip-side REC button to start and stop the take.' },
                { control: 'battery-bay', label: 'Rear battery mount', text: 'The battery attaches at the back of this camcorder.' }
              ] }
            } }
          } }
        ]
      },
      {
        title: 'Phones count too',
        intro: 'A phone is a camera. It needs the same check.',
        blocks: [
          { type: 'text', html: '<p>On a phone, check the battery and the free storage before you start. Wipe the [[lens]] with a soft cloth: phone lenses pick up fingerprints from pockets. Turn on airplane mode so a call doesn’t stop the recording.</p><p>Hold the phone sideways for video, and lean against something or use a small tripod for [[stabilization]].</p>' },
          { type: 'figure', svg: D.phoneScreen(), alt: 'A phone screen in video mode showing the timer, battery and record button.', caption: 'Phone check: battery, storage, clean lens, sideways, airplane mode.' },
          { type: 'callout', kind: 'mistake', html: 'A smudged lens makes every shot look foggy, and you won’t notice it on the small screen. Wipe it before every shoot.' }
        ]
      },
      {
        title: 'The 60-second check',
        intro: 'Make the check a habit you do the same way every time.',
        blocks: [
          { type: 'steps', items: [ '<strong>Battery:</strong> full, with a spare charged.', '<strong>Card:</strong> in the camera, with space for the whole shoot.', '<strong>Lens:</strong> cap off, glass clean.', '<strong>Settings:</strong> the same frame rate and size for every shot.', '<strong>Support:</strong> tripod legs locked, plate tight, camera level.', '<strong>Test:</strong> record five seconds, then play it back.' ] },
          { type: 'video-segments', media: 'p3-precheck', label: 'The 60-second check', caption: 'Watch a full pre-shoot check from start to finish.' },
          { type: 'callout', kind: 'onset', html: 'Charge batteries and clear cards the night before. Problems are easy to fix at home and hard to fix on set.' }
        ]
      },
      {
        id: 'camera-practice', title: 'Get your camera ready',
        intro: 'Pick the camera you use in class. Each one starts with a different problem.',
        blocks: [
          {
            type: 'camera-sim', title: 'Check a class camera', body: ['g97', 'fz300', 'elph180', 'hcx1600'],
            level: 1, scene: 'note-library', start: { power: false }, kit: ['battery', 'card', 'cloth'],
            forBody: {
              g97: { faults: ['cap'] },
              fz300: { faults: ['no-card'] },
              elph180: { faults: ['battery-flat'] },
              hcx1600: { faults: ['lens-cover', 'slot'] }
            },
            tasks: [
              { text: 'Get a clear live picture with battery power and space on the selected card.',
                hint: 'If there is a picture, check the time left on the card. If the monitor is dark, check for power and a covered lens.',
                check: s => s.power && !s.cap && s.battery > 0 && s.card.present && !s.card.full && s.card.minutes > 0 && s.display.open && s.display.on === 'monitor' && !s.display.asleep },
              { text: 'Record at least two seconds with the camera ready, then play back that take.',
                hint: 'Press the movie or REC button to start and stop. Open Playback, choose your clip and press Play.',
                check: s => s.takes.some(t => t.length >= 2 && t.played && !t.interrupted && !t.picture.black) }
            ],
            doneText: 'You have checked a real recording. Choose another camera to try its setup.'
          },
          {
            type: 'camera-sim', title: 'Get a phone ready', body: 'phone', level: 1, scene: 'note-library',
            start: { power: true }, faults: ['airplane-off', 'upright', 'photo-mode', 'smudge'], kit: ['cloth'],
            tasks: [
              { text: 'Turn the phone sideways, switch to Video, turn on airplane mode, and wipe the lens.',
                hint: 'Use the phone controls for orientation, camera mode and airplane mode. Use the cloth from the kit bag on the lens.',
                check: s => ['airplane-off', 'upright', 'photo-mode', 'smudge'].every(id => s.fixed(id)) },
              { text: 'Record and play back two clear seconds in landscape video.',
                hint: 'The red button becomes a stop square while you record. Open the saved take and play it.',
                check: s => s.takes.some(t => t.length >= 2 && t.settings.sideways && t.settings.airplane && !t.interrupted && t.played && !t.picture.smudge) }
            ], doneText: 'The phone is set for an uninterrupted take.'
          }
        ]
      }
    ],
    check: [
      { svg: D.cameraStatus({ battery: 0.1 }), alt: 'A nearly empty battery icon and recording time on the card.', q: 'What should you do before filming with this camera?', options: ['Swap in a charged battery', { text: 'Clear the memory card', clue: 'The card shows recording time. Look at the battery icon.' }, { text: 'Nothing. It is ready.', clue: 'Check the battery icon.' }], answer: 0, explain: 'The battery icon is nearly empty.' },
      { q: 'Which class camera needs a separate audio recorder to use the wireless lav?', options: ['Canon PowerShot ELPH 180', 'LUMIX FZ300', 'LUMIX G97', 'HC-X1600 camcorder'], answer: 0, explain: 'The ELPH 180 records with its built-in microphone. The other three cameras have a microphone input for the wireless receiver.' },
      { q: 'What does a memory card do?', options: ['Stores the video files the camera records', { text: 'Powers the camera', clue: 'That is the battery.' }, { text: 'Holds the camera still', clue: 'That is a tripod.' }], answer: 0, explain: 'No card, or a full card, means no recording.' },
      { q: 'Which is an example of stabilization?', options: ['Putting the camera on a tripod', { text: 'Charging the battery', clue: 'Stabilization keeps the picture steady.' }, { text: 'Cleaning the lens', clue: 'That keeps the picture clear, not steady.' }], answer: 0, explain: 'A tripod keeps the camera still.' },
      { q: 'What is the last step of a pre-shoot check?', options: ['Record a few seconds and play it back', { text: 'Turn off the camera', clue: 'You need to test that it records.' }, { text: 'Delete old clips during the shoot', clue: 'Clear the card before the shoot, not during it.' }], answer: 0, explain: 'A test recording proves everything works.' }
    ],
    remember: [
      'Check the [[battery]], the [[memory card]], the [[lens]] and the support before every shoot.',
      'A [[tripod]] or other [[stabilization]] keeps the picture steady.',
      'Finish every check by recording a few seconds and playing it back.'
    ],
    realCamera: 'Do the 60-second check on your phone or a school camera: battery, storage, clean lens, airplane mode, steady support. Then record five seconds and play it back. Time yourself.'
  });
})();
