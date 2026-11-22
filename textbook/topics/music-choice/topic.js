(function () {
  'use strict';
  const T = window.Textbook,
    H = T.studio;
  const diag = (rows) => H.art('diagram', rows, rows.map((pair) => pair.join(': ')).join('. '));
  const frames = [
    diag([
      ['Pulse', 'Quick repeated attacks'],
      ['Cue', 'Sports finish'],
    ]),
    diag([
      ['Pulse', 'Long gaps'],
      ['Cue', 'Quiet discovery'],
    ]),
  ];
  H.study({
    slug: 'music-choice',
    frames: frames,
    captions: ['Fast musical pulse', 'Spacious cue'],
    hook: [
      'Which cue would you try first for a sports highlight?',
      ['A', 'B'],
      null,
      'A faster [[tempo]] can suggest urgency. The scene and your audience determine which cue fits.',
    ],
    objectives: [
      'Compare the mood and tempo of music over the same image.',
      'Read license conditions for a planned use.',
    ],
    teachTitle: 'Choose music you can use',
    intro: 'Consider both the story and the permissions that come with the recording.',
    teach:
      '[[Copyright]] gives creators rights in original work. A [[license]] grants specified uses. [[Royalty-free|royalty-free]] describes a licensing arrangement. Read the actual terms for audience, purpose and credit.',
    activities: [
      H.section(
        'Score one shot three ways',
        'Musical pulse changes how quickly the same pictured action seems to move.',
        H.text(
          'Enable the player’s sound. The book shot repeats with an energetic pulse, a gentle line and a sparse low cue.',
        ),
        {
          type: 'video-segments',
          media: 'p9-score-film',
          label: 'Three original score studies',
          segments: [
            { label: 'Quick pulse', from: 0, to: 4 },
            { label: 'Gentle line', from: 4, to: 8 },
            { label: 'Sparse low cue', from: 8, to: 12 },
          ],
          pauses: [{ at: 6, prompt: 'What changed in the pace while the action stayed the same?' }],
          caption: 'Three original classroom score studies.',
        },
      ),
    ],
    rounds: [],
    questions: [
      [
        0,
        'Which cue suggests quick cuts most directly?',
        'A fast repeating pulse',
        'A long held tone',
        'Compare the pulse spacing.',
        'Closely spaced attacks can support fast cutting.',
      ],
      [
        null,
        'Which record should stay with the project?',
        'The license, source and required credit',
        'Only the audio filename',
        'What would show the permitted use later?',
        'A license record documents the permission and conditions.',
      ],
      [
        null,
        'The track fits perfectly, but the terms allow personal listening only. What next?',
        'Find suitable permission or replace it',
        'Post now because the mood fits',
        'Compare the use with the terms.',
        'The planned publication exceeds the stated permission.',
      ],
    ],
    remember: [
      '[[Tempo]] affects the pace a cue suggests.',
      'A [[license]] identifies permitted uses.',
      '[[Royalty-free|royalty-free]] music still has conditions under [[copyright]].',
    ],
    realCamera: 'Read a candidate track’s license. Write which use it permits and what credit it requires.',
    sketch: 'Compare a pulse pattern and a license note for your selected track.',
    frameLabels: ['Before', 'After'],
    hookMedia: H.audioHook(['p9-score-pulse', 'A'], ['p9-score-gentle', 'B']),
    realCameraTitle: 'Try it',
    practice: [
      H.quiz(
        H.q(
          null,
          'A student wrote and recorded the track. Their note allows use in this public PSA with credit. Can you use it as planned?',
          'Yes, follow the note and credit them',
          'Only if the track is a chart hit',
          'Read the stated permission and credit condition.',
          'The written permission covers this specific use.',
        ),
        H.q(
          null,
          'The track’s written terms say classroom playback only. Can this version go on the public school channel?',
          'Obtain permission for public use or choose another track',
          'Yes, school use always covers posting',
          'Compare the audience with the stated terms.',
          'Classroom-only permission omits a public post.',
        ),
        H.q(
          null,
          'The licensed library track requires a named credit. What belongs in the end credits?',
          'The credit specified in the license',
          'Only the editor’s name',
          'Read the credit condition.',
          'The named credit fulfills the stated condition.',
        ),
        H.q(
          null,
          'A track is labelled royalty-free. The license excludes advertisements. Can a paid sponsor ad use this license?',
          'No, seek terms that cover advertising',
          'Yes, royalty-free covers every use',
          'Read the exclusion as well as the product label.',
          'The stated license excludes that use.',
        ),
        H.q(
          null,
          'The music was forwarded without its terms. What should the producer do before posting?',
          'Verify the license and retain the terms',
          'Assume that receiving the file gives permission',
          'Look for evidence of who granted what rights.',
          'The file alone does not establish permission.',
        ),
      ),
    ],
    afterTeach: [
      {
        type: 'callout',
        kind: 'consider',
        html: 'Save the permission with your project.',
        link: {
          href: '../rights-privacy-and-representation/index.html',
          label: 'Rights, privacy and representation',
        },
      },
    ],
  });
})();
