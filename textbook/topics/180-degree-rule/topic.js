/* 6.03 180-degree rule. Content data per FOUNDATION T4. Drawings come from Textbook.draw. */
(function () {
  const T = Textbook;

  T.topic({
    slug: '180-degree-rule',
    minutes: 15,
    bigIdea: 'Keep the camera on one side of the line.',
    hook: {
      pair: [ { media: 'p6-conversation-2', alt: 'Shot 1: A on the left, B on the right.', caption: 'Shot 1' }, { media: 'p6-conversation-6', alt: 'Shot 2: A now appears on the right.', caption: 'Shot 2' } ],
      question: 'A and B are talking. Look at where A is in each shot. What changed across the cut?',
      options: ['Nothing. A is on the same side.', 'A and B swapped sides of the screen.', 'The camera zoomed in.'],
      answer: 1,
      reveal: 'A jumped from screen left to screen right. The camera moved to the other side of the people. Viewers feel it as a jolt, even if they can’t say why.'
    },
    notes: {
      sketch: 'Draw a top-down map of two people at a table. Draw the line between them, then mark three camera spots that keep the 180-degree rule.',
      frames: 1, frameLabels: ['Top-down map'],
      think: 'Why do sports broadcasts keep all their main cameras on one side of the field?'
    },
    vocab: ['180-degree-rule', 'axis-of-action', 'crossing-the-line', 'reverse-shot'],
    review: ['two-shot', 'over-the-shoulder-shot', 'screen-direction'],
    objectives: [
      'Find the [[axis of action]] in a scene.',
      'Choose camera positions that keep the [[180-degree rule]].',
      'Spot when a cut has [[crossed the line|crossing-the-line]].'
    ],
    sections: [
      {
        title: 'Draw the line',
        intro: 'Imagine a line running through two people who face each other.',
        blocks: [
          { type: 'text', html: '<p>That imaginary line is the [[axis of action]]. The [[180-degree rule]] says: keep every camera on one side of it. Then person A always stays on one side of the screen and person B on the other, and their [[screen direction]] never changes.</p><p>If the camera moves to the other side, the two people swap sides of the screen. That is [[crossing the line]].</p><p>You don’t need two people for a line. When one person walks, their path is the line. When one person looks at something, like a clock on the wall, the line runs from their eyes to it. Cross either line and the person seems to turn the other way.</p>' },
          { type: 'figure-row', items: [
            { media: 'p6-conversation-2', alt: 'Two-shot from side 1: A on screen left facing right, B on screen right facing left.', caption: '<strong>Camera on side 1.</strong> A on the left, B on the right.' },
            { media: 'p6-conversation-5', alt: 'Two-shot from side 2: B on screen left, A on screen right.', caption: '<strong>Camera on side 2.</strong> A and B have swapped sides.' }
          ] },
          { type: 'callout', kind: 'consider', html: 'Why “180 degrees”? On one side of the line, the camera can move anywhere around a half circle: 180 degrees.' }
        ]
      },
      {
        title: 'Try the cameras',
        intro: 'Six camera positions. Three on each side of the line.',
        blocks: [
          { type: 'camera-map', photos: [1, 2, 3, 4, 5, 6].map(n => 'p6-conversation-' + n), prompt: 'A wears blue. B wears orange. Click two cameras and watch which side each person appears on.', tasks: ['Make a cut that keeps A and B on their own sides', 'Cross the line and see what breaks'] }
        ]
      },
      {
        title: 'Shot and reverse shot',
        intro: 'Conversations are usually cut between two matching shots.',
        blocks: [
          { type: 'text', html: '<p>A conversation often starts with a [[two-shot]], then cuts between [[over-the-shoulder shots|over-the-shoulder-shot]]: one looking at B, then the [[reverse shot]] looking at A. Both cameras stay on the same side of the line, so A always looks one way and B always looks the other.</p>' },
          { type: 'figure-row', items: [
            { media: 'p6-conversation-1', alt: 'Over A’s shoulder: A’s back on the left, B on the right looking screen left.', caption: '<strong>Shot.</strong> Over A’s shoulder. B looks screen left.' },
            { media: 'p6-conversation-3', alt: 'Over B’s shoulder: B’s back on the right, A on the left looking screen right.', caption: '<strong>Reverse shot.</strong> Over B’s shoulder. A looks screen right.' }
          ] },
          { type: 'callout', kind: 'onset', html: 'Put a strip of tape on the floor along the line. Every camera setup stays on the same side of the tape.' },
          { type: 'video-segments', media: 'conversation-180', label: 'One person, one line', pauses: [{ at: 4, prompt: 'Which side of the line is the camera on? Which way does the Reader look?' }], caption: 'With one person, the line runs from their eyes to what they look at.' }
        ]
      },
      {
        title: 'When you can cross',
        intro: 'The rule protects viewers from confusion. You can break it if you show them the move.',
        blocks: [
          { type: 'text', html: '<p>You can get to the other side of the line without confusing viewers if:</p><ul><li>the camera moves across the line during the shot, so viewers see it happen,</li><li>a person walks across the line on screen, which makes a new line,</li><li>you cut to a wide shot that shows everyone’s new positions first.</li></ul>' },
          { type: 'callout', kind: 'mistake', html: 'A sports broadcast never shows the two teams from opposite sides back to back. Viewers would think the players switched direction.' }
        ]
      },
      {
        title: 'Practice: keep the line',
        intro: 'You’re the editor. Pick the next shot.',
        blocks: [
          { type: 'picture-choice', closing: 'Same side of the line, every time.',
            rounds: [
              { prompt: 'Shot 1 is the two-shot from camera 2. Which shot of A keeps the line?', stem: { media: 'p6-conversation-2', alt: 'Two-shot from camera 2', caption: 'Shot 1 · Camera 2' },
                options: [ { media: 'p6-conversation-3', alt: 'Over B’s shoulder from camera 3', label: 'Camera 3' }, { media: 'p6-conversation-6', alt: 'Over B’s shoulder from camera 6', label: 'Camera 6', clue: 'Camera 6 is on side 2, so A jumps to screen right.' }, { media: 'p6-conversation-5', alt: 'Two-shot from camera 5', label: 'Camera 5', clue: 'Camera 5 is on side 2. A and B swap sides.' } ],
                answer: 0, explain: 'Camera 3 is on side 1, so A stays on screen left.' },
              { prompt: 'Shot 1 is over A’s shoulder onto B. Which is the matching reverse shot?', stem: { media: 'p6-conversation-1', alt: 'Over A’s shoulder from camera 1', caption: 'Shot 1 · Camera 1' },
                options: [ { media: 'p6-conversation-4', alt: 'Over A’s shoulder from camera 4', label: 'Camera 4', clue: 'That’s the same view of B, from the wrong side.' }, { media: 'p6-conversation-6', alt: 'Over B’s shoulder from camera 6', label: 'Camera 6', clue: 'Right idea, wrong side of the line.' }, { media: 'p6-conversation-3', alt: 'Over B’s shoulder from camera 3', label: 'Camera 3' } ],
                answer: 2, explain: 'Over B’s shoulder from side 1. A looks screen right, B looked screen left.' },
              { prompt: 'This scene was filmed from side 2. Shot 1 is the two-shot from camera 5. Which shot keeps the line?', stem: { media: 'p6-conversation-5', alt: 'Two-shot from camera 5', caption: 'Shot 1 · Camera 5' },
                options: [ { media: 'p6-conversation-1', alt: 'Over A’s shoulder from camera 1', label: 'Camera 1', clue: 'Camera 1 is on side 1.' }, { media: 'p6-conversation-4', alt: 'Over A’s shoulder from camera 4', label: 'Camera 4' }, { media: 'p6-conversation-3', alt: 'Over B’s shoulder from camera 3', label: 'Camera 3', clue: 'Camera 3 is on side 1.' } ],
                answer: 1, explain: 'Side 2 is fine, as long as every shot stays there.' }
            ] }
        ]
      }
    ],
    check: [
      { pair: [ { media: 'p6-conversation-2', alt: 'Two-shot from camera 2', caption: 'Shot 1 · Camera 2' }, { media: 'p6-conversation-6', alt: 'Over B’s shoulder from camera 6, side 2', caption: 'Shot 2 · Camera 6' } ], q: 'What happened between these two shots?', options: [
        'The camera crossed the line, so A swapped sides of the screen.',
        { text: 'Nothing. They cut together fine.', clue: 'Check which side of the screen A is on in each shot.' },
        { text: 'The camera zoomed in.', clue: 'Look at where A is, not how big.' }
      ], answer: 0, explain: 'A is on screen left in Shot 1 and screen right in Shot 2.' },
      { pair: [ { media: 'p6-conversation-1', alt: 'Over A’s shoulder from camera 1', caption: 'Shot 1 · Camera 1' }, { media: 'p6-conversation-3', alt: 'Over B’s shoulder from camera 3', caption: 'Shot 2 · Camera 3' } ], q: 'Do these two shots cut together as a conversation?', options: [
        'Yes. Both cameras are on the same side of the line.',
        { text: 'No. They crossed the line.', clue: 'B looks screen left and A looks screen right. That matches.' }
      ], answer: 0, explain: 'Shot and reverse shot from side 1.' },
      { q: 'What is the axis of action?', options: [
        'An imaginary line through the people in the scene',
        { text: 'The edge of the frame', clue: 'It is a line in the scene, not in the picture.' },
        { text: 'The path of the camera dolly', clue: 'It is set by the people, not the camera.' }
      ], answer: 0, explain: 'It runs through the people facing each other, or along the direction something moves.' },
      { q: 'Which lets you reach the other side of the line without confusing viewers?', options: [
        'A shot where the camera moves across the line while recording',
        { text: 'A cut straight to a close-up from the other side', clue: 'Viewers do not see how you got there.' },
        { text: 'Turning the camera upside down', clue: 'That doesn’t change the side.' }
      ], answer: 0, explain: 'If viewers see the camera move, they understand the new view.' }
    ],
    remember: [
      'The [[axis of action]] runs through the people in a scene.',
      'Keep every camera on one side of it, and screen direction stays the same.',
      'To cross the line, let viewers see it happen.'
    ],
    realCamera: 'Sit two friends at a table. Put tape on the floor along the line between them. Film a two-shot and two over-the-shoulder shots from one side. Then film one shot from the other side and cut it in.'
  });
})();
