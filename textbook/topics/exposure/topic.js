(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const photo = (filter) => H.photo('interview-a', filter);
  const captions = ['−3', '−2', '−1', '0', '+1', '+2', '+3'];
  const frames = [0.32, 0.52, 0.75, 1, 1.29, 1.68, 2.3].map((v) => photo('brightness(' + v + ')'));
  H.study({
    slug: 'exposure',
    frames: frames,
    captions: ['−3', '−2', '−1', '0', '+1', '+2', '+3'],
    hook: [
      'Which frame loses more detail in its brightest areas?',
      ['A', 'B'],
      1,
      'The brightest surfaces in B merge into white. A region that records as pure white is [[overexposed]].',
    ],
    objectives: [
      'Recognize lost highlight and shadow detail.',
      'Adjust exposure for the face without washing out the room.',
    ],
    teachTitle: 'Read the face and the room',
    intro: 'Compare the same interview at three simulated settings.',
    teach:
      '[[Exposure]] controls how bright the image records. An [[underexposed]] face loses shadow detail. An [[overexposed]] wall loses bright detail.',
    activities: [
      H.section(
        'Move through seven stops',
        'A setting that protects the window may leave the face too dark.',
        H.text(
          'Follow the face and window separately. Switch the warning stripes on to inspect bright pixels.',
        ),
        {
          ...H.slider(
            'Exposure',
            frames.map((ref, i) => [
              ref,
              captions[i],
              [
                'Face and dark clothing merge.',
                'Little detail in the shadows.',
                'Check the shaded cheek.',
                'Compare the two cheeks and the wall.',
                'The wall starts losing texture.',
                'Bright areas merge.',
                'The pale surfaces flatten into white.',
              ][i],
            ]),
          ),
          zebras: frames.map((_, i) => 'p4-zebra-' + i),
        },
      ),
      H.section(
        'Lock the phone exposure',
        'A phone can change brightness when a subject moves through the frame.',
        H.text('Set brightness before recording the answer.'),
        H.steps(
          'Tap the face to meter it.',
          'Hold to lock focus and [[exposure]] if your phone supports it.',
          'Move the exposure control while watching bright surfaces.',
          'For a noisy dark face, add light before raising [[ISO]].',
        ),
        {
          type: 'callout',
          kind: 'mistake',
          html: 'Raising [[ISO]] can reveal grain. [[Zebras]] mark bright pixels near a chosen limit.',
        },
      ),
    ],
    rounds: [
      [
        'Keep detail in the face for the morning announcement.',
        [0, 3],
        1,
        'Compare the two cheeks.',
        'The middle setting preserves facial detail.',
      ],
      [
        'Keep the pale wall from becoming a white patch.',
        [3, 6],
        0,
        'Look for texture in the bright areas.',
        'The lower setting holds more wall detail.',
      ],
      [
        'We locked for the window. Which frame suggests the face needs its own light?',
        [0, 3],
        0,
        'Watch the eyes on the dark side.',
        'The face has fallen into shadow.',
      ],
    ],
    questions: [
      [
        6,
        'What is the clearest exposure warning here?',
        'Bright surfaces have merged',
        'The hairstyle changed',
        'Inspect the pale surfaces.',
        'Bright surfaces have lost visible differences.',
      ],
      [
        0,
        'Which adjustment helps this face while protecting a bright window?',
        'Add light to the face',
        'Raise the whole frame several stops',
        'Consider what happens to the window.',
        'Local light changes the face independently.',
      ],
      [
        null,
        'Why lock exposure before someone in white walks past?',
        'Prevent the camera changing brightness mid-answer',
        'Increase the resolution',
        'Think about what auto metering measures.',
        'A locked setting keeps the face steady.',
      ],
    ],
    remember: [
      '[[Exposure]] sets the brightness you record.',
      '[[Underexposed]] shadows and [[overexposed]] highlights lose detail.',
      'Use [[zebras]] to check highlights before raising [[ISO]].',
    ],
    realCamera: 'Hold on a face to lock exposure, then adjust brightness while checking a bright window.',
    sketch: 'Sketch which detail you would save on a face near a window.',
    frameLabels: ['First setup', 'Revised setup'],
    hookMedia: H.pair(frames[0], frames[6]),
    teachVisual: H.row([frames[0], 'Under'], [frames[3], 'Middle'], [frames[6], 'Over']),
    minutes: 15,
  });
})();
