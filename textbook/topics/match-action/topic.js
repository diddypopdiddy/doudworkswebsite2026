/* 6.07 Match action. Rebuilt from Basic Sequences unit 3. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;

  T.topic({
    slug: 'match-action',
    minutes: 15,
    bigIdea: 'Cut in the middle of a move.',
    hook: {
      sequence: [T.seg('room-wide', 5.2, T.time('room-wide', 'sit', 0.75)), T.seg('sit-medium', T.time('sit-medium', 'sit', 0.05), T.time('sit-medium', 'sit', 0.05) + 2.2)],
      question: 'Watch the person sit down. What looks strange?',
      options: ['They sit down twice', 'They disappear', 'Nothing. It’s smooth.'],
      answer: 0,
      reveal: 'They were almost seated in the wide shot, then started sitting again in the medium. That’s called double action. Cutting in the middle of the move fixes it.'
    },
    notes: {
      sketch: 'Sketch the last frame of Shot 1 and the first frame of Shot 2 for a cut on action as someone opens a door.',
      frames: 2, frameLabels: ['Shot 1 · last frame', 'Shot 2 · first frame'],
      think: 'Why does the actor need to repeat the whole move in every shot, not just the part you plan to use?'
    },
    vocab: ['cutting-on-action', 'overlapping-action', 'matching-action'],
    review: ['cut', 'wide-shot', 'medium-shot', 'close-up'],
    objectives: [
      'Explain why [[cutting on action]] hides a cut.',
      'Tell a smooth cut from double action, skipped action and a cut on stillness.',
      'Make a cut on action between two shots.'
    ],
    sections: [
      {
        title: 'Hide the cut inside a move',
        intro: 'When something moves, viewers watch the move, not the cut.',
        blocks: [
          { type: 'text', html: '<p>[[Cutting on action]] means you [[cut]] from one shot to the next while the person is moving. The move starts in Shot 1 and finishes in Shot 2. Because viewers are following the move, they don’t notice the jump from a [[wide shot]] to a [[medium shot]].</p><p>For this to work, the move in Shot 2 has to pick up exactly where it was in Shot 1. That is [[matching action]].</p>' },
          { type: 'figure-row', items: [
            { media: 'still-room-sit', caption: '<strong>Wide.</strong> Halfway down into the chair.' },
            { media: 'still-medium-sit', caption: '<strong>Medium.</strong> The same instant, closer.' }
          ] }
        ]
      },
      {
        title: 'Try the four kinds of cut',
        intro: 'Each button sets up a different cut and plays it. Then drag the sliders yourself.',
        blocks: [
          { type: 'cut-explore', a: 'room-wide', b: 'sit-medium', action: 'sit',
            presets: [
              { label: 'Before the move', pA: -0.4, pB: -0.4, state: 'still' },
              { label: 'On the action', pA: 0.5, pB: 0.5, state: 'match' },
              { label: 'Double action', pA: 0.6, pB: 0.1, state: 'double' },
              { label: 'Skipped action', pA: 0.3, pB: 0.9, state: 'skip' }
            ],
            checks: ['The cut is in the middle of the move', 'Shot 2 picks up where Shot 1 left off'],
            tip: 'This only works because the actor did the whole move in both shots. That is called [[overlapping action]].',
            completion: '<strong>You have played all four.</strong> The best cut is the one nobody notices.' }
        ]
      },
      {
        title: 'Overlap the action when you film',
        intro: 'Cutting on action starts on set, not in the edit.',
        blocks: [
          { type: 'text', html: '<p>The editor can only cut in the middle of a move if both shots contain the whole move. That means the actor repeats the entire action, the same way and at the same speed, every time you change the shot. This is [[overlapping action]].</p>' },
          { type: 'steps', items: [
            'Film the whole action in the [[wide shot]]: walk in, sit, pick up the book, open it.',
            'Move the camera closer. Have the actor do the <strong>whole</strong> action again, not just the part you need.',
            'Film the [[close-up]] the same way, starting a few seconds before the important moment.',
            'Watch for matching details: which hand, how fast, where the book sits.'
          ] },
          { type: 'callout', kind: 'onset', html: 'Tell the actor: “Same move, same speed, every time.” Ask them to count it out loud the first time so they can repeat the timing.' }
        ]
      },
      {
        title: 'Practice: make the cut',
        intro: 'Set where Shot 1 ends and where Shot 2 begins. Play it. When it’s smooth, lock it.',
        blocks: [
          { type: 'challenge', actionLabel: 'Lock the cut', speaker: 'The editor says', closing: 'Three cuts on action. Nobody will see them.',
            briefs: [
              { tool: 'cut', a: 'room-wide', b: 'sit-medium', action: 'sit', pA: -0.5, pB: -0.5, text: 'Cut from the wide to the medium as the person sits down.', success: 'They start sitting in one shot and land in the next. Invisible.' },
              { tool: 'cut', a: 'sit-medium', b: 'book-close', action: 'book', pA: -0.5, pB: -0.5, text: 'Now cut to the close-up as the book opens.', success: 'The move carries the viewer straight into the close-up.' },
              { tool: 'cut', a: 'room-wide', b: 'book-close', action: 'book', pA: 1.3, pB: -0.5, text: 'Skip the medium. Cut straight from the wide to the close-up as the book opens.', success: 'A big jump in shot size, and the move still hides it.' }
            ] }
        ]
      }
    ],
    check: [
      { pair: [ { id: 'still-room-sit', caption: 'Last frame of Shot 1' }, { id: 'still-medium-sit', caption: 'First frame of Shot 2' } ], q: 'The cut joins these two frames. What kind of cut is it?', options: [
        'A smooth cut on action',
        { text: 'A cut on stillness', clue: 'Is the person moving in these frames?' },
        { text: 'A direction flip', clue: 'The person is in the same place on screen.' }
      ], answer: 0, explain: 'Halfway down in both frames: the move carries across the cut.' },
      { q: 'Part of the move happens twice across the cut. What is that called?', options: [
        'Double action',
        { text: 'Skipped action', clue: 'Skipped action is when part of the move is missing.' },
        { text: 'Overlapping action', clue: 'Overlapping action is how you film it, not a mistake.' }
      ], answer: 0, explain: 'Shot 2 started too early.' },
      { q: 'Why must the actor repeat the whole move in every shot?', options: [
        'So the editor can cut anywhere in the move',
        { text: 'To use up more memory card space', clue: 'It’s about choices in the edit.' },
        { text: 'So every shot is the same length', clue: 'Length doesn’t matter here.' }
      ], answer: 0, explain: 'That’s overlapping action. It gives the editor every possible cut point.' },
      { q: 'Where in a move is usually the best place to cut?', options: [
        'In the middle of the move',
        { text: 'Before the move starts', clue: 'Then nothing is moving to hide the cut.' },
        { text: 'After the move has finished', clue: 'Nothing is moving then either.' }
      ], answer: 0, explain: 'Mid-move, viewers are following the action.' }
    ],
    remember: [
      '[[Cutting on action]] hides a cut inside a move.',
      'The move in Shot 2 must continue exactly where Shot 1 left it: [[matching action]].',
      'Film [[overlapping action]]: the whole move, in every shot.'
    ],
    realCamera: 'Film a friend sitting down in a wide shot. Then film them sitting down again in a medium shot. They must do the whole move both times. Cut from one to the other in the middle of the move.'
  });
})();
