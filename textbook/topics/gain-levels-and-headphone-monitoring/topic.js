(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const wave = (label, id) => H.wave(label, id);
  const frames = [wave('A', 'p5-gain-good'), wave('B', 'p5-gain-clipped'), wave('C', 'p5-gain-low')];
  H.study({
    cameraSection: {
      id: 'camera-practice', title: 'Set the level on the interview camera',
      intro: 'Connect the wireless lav. Start recording, call action, then listen through the loudest words before stopping. Play the test back.',
      blocks: [{
        type: 'camera-sim', title: 'Record a clean test line', body: ['g97', 'fz300'], level: 2, scene: 'interview-window', callAction: true,
        start: { power: true, mode: 'P', settings: { gain: 6 } }, faults: ['mic-unplugged', 'meter-hidden'], kit: ['mic-wireless', 'headphones'],
        tasks: [
          { text: 'Connect the wireless receiver and use headphones to monitor the input.',
            hint: 'Open the covers on the left side. Plug the wireless receiver into MIC and the headphones into the headphone socket.',
            check: s => s.settings.mic === 'wireless' && s.settings.headphones && s.settings.levelBars },
          { text: 'Adjust the recording level. Record the loudest line and listen to the whole test for clipping.',
            hint: 'In the Motion Picture menu use Sound Rec Level Adj. Watch the level bars through the loudest words.',
            check: s => s.takes.some(t => t.settings.mic === 'wireless' && t.settings.headphones && t.heard() && t.covers('loudest', 'loudest', .25) && t.reviewed && t.reviewedSound) }
        ],
        forBody: { fz300: { faults: ['mic-unplugged'], kit: ['mic-wireless'], tasks: [
          { text: 'Plug the wireless receiver into MIC and show the level bars.',
            hint: 'Open the MIC cover on the lens side. Plugging in the receiver enables the level display.',
            check: s => s.settings.mic === 'wireless' && s.settings.levelBars },
          { text: 'Use Mic Level Adj. and the bars to set a good level. Record the loudest line, then listen to the whole test in playback.',
            hint: 'The FZ300 has no headphone jack. Use the meter while setting the level, then play the test.',
            check: s => s.takes.some(t => t.settings.mic === 'wireless' && t.heard() && t.covers('loudest', 'loudest', .25) && t.reviewed && t.reviewedSound) }
        ] } }, doneText: 'You have verified the sound on the recorded clip.'
      }]
    },
    slug: 'gain-levels-and-headphone-monitoring',
    frames: frames,
    captions: ['Headroom', 'Flat-topped peaks', 'Very low level'],
    hook: [
      'Which waveform reaches a hard ceiling?',
      ['A', 'B'],
      1,
      'The strongest peaks in B stop at the same height. Excess [[gain]] causes [[clipping]] and rough-sounding words.',
    ],
    objectives: [
      'Read recording level and clipping from a meter.',
      'Set gain and monitor the loudest expected words.',
    ],
    teachTitle: 'Leave room for louder words',
    intro: 'Find the highest peak during the loudest phrase.',
    teach:
      '[[Audio level]] varies as the speaker talks. A [[peak]] is a momentary high point. [[Monitoring]] on headphones catches fabric rub and distortion that level alone cannot identify.',
    activities: [
      H.section(
        'Set the gain',
        'The meters show the recorded signal as the line plays.',
        H.text('Slide through three recorded levels, play each and watch the meter follow the words.'),
        {
          type: 'meter-sim',
          takes: [
            {
              media: 'p5-gain-low',
              label: 'Low · about −19 dBFS peak',
              level: 0.11,
              note: 'Quiet peaks may need a large boost.',
            },
            {
              media: 'p5-gain-good',
              label: 'Working level · about −6 dBFS peak',
              level: 0.5,
              note: 'The loudest syllable leaves headroom.',
            },
            {
              media: 'p5-gain-clipped',
              label: 'Clipped · near 0 dBFS',
              level: 0.99,
              note: 'The strongest syllables flatten and distort.',
            },
          ],
        },
      ),
      H.section(
        'Set a level on the mixing board',
        'Loud enough to hear, never loud enough to clip.',
        H.text('Push the faders until the mix clips, then bring them back to a safe level.'),
        { type: 'studio-room', lesson: 'gain-levels-and-headphone-monitoring' },
      ),
    ],
    rounds: [],
    questions: [
      [
        1,
        'What happened to the loudest parts?',
        'They hit a ceiling',
        'The room became silent',
        'Compare the tops of the largest peaks.',
        'The tops flatten at the recording limit.',
      ],
      [
        2,
        'What would be a sensible adjustment at recording time?',
        'Raise gain while listening to a rehearsal',
        'Turn the headphone level up and leave the recording unchanged',
        'Separate monitoring volume from the recorded file.',
        'Raising recording gain increases captured level.',
      ],
      [
        null,
        'Meters look safe, but you hear rubbing. What should you change?',
        'Secure the microphone or clothing',
        'Raise the gain',
        'The problem is audible at a safe level.',
        'Fixing contact removes rubbing at its source.',
      ],
    ],
    remember: [
      'Set [[gain]] with the loudest expected phrase.',
      'Leave space above the highest [[peak]] to avoid [[clipping]].',
      'Use headphone [[monitoring]] as well as the [[audio level]] meter.',
    ],
    realCamera:
      'Record a short line and a clap. Watch the meter and listen back at a comfortable headphone level.',
    sketch: 'Draw safe peaks and flattened peaks.',
    frameLabels: ['Before', 'After'],
    afterTeach: [
      H.steps(
        'Ask for the loudest line.',
        'Leave working headroom, often around −12 to −6 dBFS on speech peaks.',
        'Listen to the recorded test on headphones.',
      ),
      {
        type: 'callout',
        kind: 'mistake',
        html: 'Turning your headphone volume down does not repair a clipped recording.',
      },
    ],
    practice: [
      H.quiz(
        H.q(
          frames[2],
          'The voice barely moves the meter. Which diagnosis fits?',
          'Too low',
          'Clipping',
          'Look at the height of the loud syllables.',
          'There is very little recorded level.',
        ),
        H.q(
          frames[0],
          'Which judgment fits this clean test?',
          'Safe headroom',
          'Hard clipping',
          'Check the top of the waveform.',
          'The peak stays below full scale.',
        ),
        H.q(
          null,
          'A shout reaches −1 dBFS. What should you do before another louder take?',
          'Lower gain a little',
          'Raise gain',
          'Compare the reading with 0 dBFS.',
          'There is only one decibel of headroom.',
        ),
        H.q(
          frames[1],
          'What calls for a retake?',
          'Repeated flat-topped syllables',
          'A quiet pause',
          'Inspect the loudest words.',
          'Clipping destroys the shape of the peak.',
        ),
      ),
    ],
  });
})();
