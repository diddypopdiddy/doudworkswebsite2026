/* 6.08 Action coverage. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;
  const plan = '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f4f5f3"/>'
    + '<rect x="150" y="50" width="100" height="56" rx="6" fill="#d9cfbd"/><text x="200" y="83" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#5d6469">TABLE</text>'
    + '<circle cx="200" cy="40" r="14" fill="#3157c8"/><text x="200" y="45" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="800" fill="#fff">P</text>'
    + cam(200, 200, 'MASTER (wide)') + cam(130, 160, 'MEDIUM') + cam(270, 140, 'CLOSE-UP')
    + '</svg>';
  function cam(x, y, label) { return '<g><circle cx="' + x + '" cy="' + y + '" r="14" fill="#171b1f"/><path d="M' + x + ' ' + (y - 14) + ' l-6 -10 h12z" fill="#171b1f"/><text x="' + x + '" y="' + (y + 30) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="800" fill="#171b1f">' + label + '</text></g>'; }

  T.topic({
    slug: 'action-coverage',
    minutes: 12,
    bigIdea: 'Film the whole action from more than one shot so you have choices.',
    hook: {
      sequence: [T.seg('room-wide', 6.5, 13.5)],
      question: 'This scene is one wide shot, all the way through. What can’t you see well?',
      options: ['The book and the person’s face', 'Where the door is', 'How big the room is'],
      answer: 0,
      reveal: 'The wide shot shows the place, but the details that matter are tiny. With closer shots of the same action, the editor could show them. Those extra shots are called [[coverage]].'
    },
    notes: {
      sketch: 'Plan coverage for someone opening a locker: sketch the master shot, a medium and a close-up.',
      frames: 3, frameLabels: ['Master', 'Medium', 'Close-up'],
      think: 'What is a cutaway, and when would an editor be glad you filmed one?'
    },
    vocab: ['coverage', 'master-shot', 'cutaway'],
    review: ['wide-shot', 'medium-shot', 'close-up', 'take'],
    objectives: [
      'Explain why editors need [[coverage]].',
      'Plan a [[master shot]], closer shots and a [[cutaway]] for one action.',
      'Choose when to switch between shots of the same action.'
    ],
    sections: [
      {
        title: 'Film it more than once',
        intro: 'One action, several shots.',
        blocks: [
          { type: 'text', html: '<p>[[Coverage]] means all the shots you film of one scene. A common set is a [[master shot]] (a [[wide shot]] of the whole action from start to finish), then a [[medium shot]] and a [[close-up]] of the same action. Each is a separate [[take]].</p><p>With coverage, the editor decides in the edit when to be wide and when to be close. Without it, they are stuck with one view.</p>' },
          { type: 'figure-row', items: [
            { media: 'still-room-wide', caption: '<strong>Master shot.</strong> The whole action.' },
            { media: 'still-medium-seated', caption: '<strong>Medium.</strong> The person and the table.' },
            { media: 'still-book-close', caption: '<strong>Close-up.</strong> The book.' }
          ] }
        ]
      },
      {
        title: 'Be the editor',
        intro: 'Three shots of the same action, playing in sync. You choose which one viewers see.',
        blocks: [
          { type: 'coverage-switcher', master: 'room-wide',
            angles: [ { media: 'room-wide', label: 'Master' }, { media: 'sit-medium', label: 'Medium' }, { media: 'book-close', label: 'Close-up' } ],
            prompt: 'Play the scene and switch angles while it plays. Each switch is a cut. Notice when an angle isn’t available: that part was never filmed.' },
          { type: 'callout', kind: 'consider', html: 'The close-up only covers the book. What would you film differently so you could use a close-up when the person sits down?' }
        ]
      },
      {
        title: 'Plan your coverage',
        intro: 'Decide your shots before you start, and film them in a sensible order.',
        blocks: [
          { type: 'figure', svg: plan, alt: 'Top-down plan: a person at a table, with three camera positions for a master, a medium and a close-up, all on the same side.', caption: 'A simple coverage plan. Every camera stays on the same side of the action.' },
          { type: 'coverage-planner', prompt: '<strong>Practice: plan the coverage.</strong> Place a master, a medium and a close-up on the map. Choose a shot, then click a camera spot. Then check your plan.' },
          { type: 'text', html: '<p>A simple order that works:</p><ul><li>Film the <strong>master shot</strong> first, all the way through.</li><li>Move in for the <strong>medium</strong>. Repeat the whole action.</li><li>Move in for the <strong>close-up</strong>. Repeat it again.</li><li>Grab a <strong>[[cutaway]]</strong>: a detail like a clock or a window. It can cover a cut you need to hide.</li></ul>' },
          { type: 'callout', kind: 'onset', html: 'Film the master all the way through, even if you think you’ll only use the start. It’s your safety net.' },
          { type: 'video-segments', media: 'coverage-cutaway', label: 'Cutaway' },
          { type: 'callout', kind: 'mistake', html: 'Coverage only cuts together if the action matches in every take: same hand, same speed, same props.' }
        ]
      }
    ],
    check: [
      { media: 'still-room-wide', q: 'In coverage, this wide shot of the whole action is called the…', options: [
        'Master shot',
        { text: 'Cutaway', clue: 'A cutaway shows something other than the main action.' },
        { text: 'Reverse shot', clue: 'A reverse shot is the other side of a conversation.' }
      ], answer: 0, explain: 'The master records the whole scene from start to finish.' },
      { q: 'Why film the same action from several shots?', options: [
        'It gives the editor choices.',
        { text: 'It makes the film longer.', clue: 'The editor uses only some of it.' },
        { text: 'The camera needs to cool down.', clue: 'It’s about the edit.' }
      ], answer: 0, explain: 'Coverage lets the editor choose when to be wide or close.' },
      { q: 'A cutaway is…', options: [
        'A shot of something other than the main action',
        { text: 'A mistake you cut out', clue: 'It’s a shot you plan to use.' },
        { text: 'The first shot of a scene', clue: 'That’s usually the establishing shot.' }
      ], answer: 0, explain: 'A clock, a window, a hand: a detail that can cover a cut.' },
      { q: 'You try to switch to the close-up, but it was only filmed during the book moment. What does that teach you?', options: [
        'Film the whole action in each shot if you might need it.',
        { text: 'Never use close-ups.', clue: 'Close-ups are useful. They just need coverage.' },
        { text: 'Only film master shots.', clue: 'Then you’d have no choices.' }
      ], answer: 0, explain: 'You can only cut to what you filmed.' }
    ],
    remember: [
      '[[Coverage]] is every shot you film of one scene.',
      'Start with a [[master shot]] of the whole action, then move closer.',
      'A [[cutaway]] can hide a cut you need to make.'
    ],
    realCamera: 'Choose a simple action, like making a sandwich. Film a master shot of the whole thing, then a medium and a close-up, repeating the whole action each time. Add one cutaway. Edit a 20-second version.'
  });
})();
