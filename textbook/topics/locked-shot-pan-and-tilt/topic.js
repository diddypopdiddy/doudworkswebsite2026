/* 3.15 Locked shot, pan and tilt. The viewfinder in pan-and-tilt mode (no zoom) over the library photo. */
(function () {
  const T = Textbook, D = T.draw;
  let last = null;
  // Name the move from the last frame change.
  const move = m => {
    const f = m.f, p = last; last = f;
    if (!p) return 'Locked off';
    const dx = f.x - p.x, dy = f.y - p.y;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return 'Locked off';
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'Pan right →' : '← Pan left') : (dy > 0 ? 'Tilt down ↓' : 'Tilt up ↑');
  };
  // A tripod head with its pan handle, drawn from the side.
  const head = () => D.svg('<rect width="320" height="180" fill="#f4f5f3"/>' +
    '<path d="M160 110 L110 176 M160 110 L210 176 M160 110 L160 176" stroke="#5d6469" stroke-width="6" stroke-linecap="round"/>' +
    '<rect x="138" y="92" width="44" height="20" rx="4" fill="#2a2f35"/><rect x="128" y="66" width="64" height="26" rx="5" fill="#3a4047"/><rect x="134" y="44" width="58" height="24" rx="4" fill="#171b1f"/><path d="M192 48 L210 40 V72 L192 64z" fill="#171b1f"/>' +
    '<path d="M128 80 L64 104" stroke="#3157c8" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M96 30 q64 -22 128 0" fill="none" stroke="#b86533" stroke-width="2.5"/><path d="M220 24 l8 6 l-9 4z" fill="#b86533"/><text x="160" y="18" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#b86533">pan: turn left and right</text>' +
    '<path d="M236 46 q16 22 0 44" fill="none" stroke="#1f7a4d" stroke-width="2.5"/><path d="M232 88 l6 8 l4 -9z" fill="#1f7a4d"/><text x="250" y="72" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#1f7a4d">tilt: up and down</text>' +
    '<text x="40" y="122" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#3157c8">pan handle</text>');

  T.topic({
    slug: 'locked-shot-pan-and-tilt',
    minutes: 12,
    bigIdea: 'Move the camera only when it helps the story.',
    hook: {
      svg: head(), alt: 'A camera on a tripod head with arrows for turning left and right, and up and down.',
      question: 'The camera stays on the tripod in the same spot. How many ways can it still change the view?',
      options: ['None. It is stuck.', 'It can turn left and right, and point up and down', 'It can only zoom'],
      answer: 1,
      reveal: 'From one spot, a camera can turn left and right, which is a [[pan]], or point up and down, which is a [[tilt]]. If it doesn’t move at all, it is a [[locked-off shot]].'
    },
    notes: {
      sketch: 'Draw a tripod from the side. Add an arrow for a pan and an arrow for a tilt.',
      frames: 1, frameLabels: ['Pan and tilt'],
      think: 'Why do most professional shots stay locked off, even though moving the camera is easy?'
    },
    vocab: ['locked-off-shot', 'pan', 'tilt', 'tripod-head'],
    review: ['tripod'],
    objectives: [
      'Name a locked-off shot, a pan and a tilt.',
      'Pan and tilt smoothly to follow or reveal something.',
      'Choose when to keep the camera still and when to move it.'
    ],
    sections: [
      {
        title: 'Keep it still',
        intro: 'Most good shots don’t move at all.',
        blocks: [
          { type: 'text', html: '<p>In a [[locked-off shot]] the camera doesn’t move. It sits on a [[tripod]] and lets the action happen in the frame. Locked-off shots feel calm and let viewers look around. They also cut together easily.</p>' },
          { type: 'video-segments', media: 'room-wide', label: 'Locked off', segments: [ { label: 'Enter and sit', from: 1.5, to: 9.5 } ], caption: 'The camera never moves. The person moves through the frame.' },
          { type: 'callout', kind: 'onset', html: 'Locked off means locked: tighten every knob on the [[tripod head]] so a bump doesn’t shift the frame halfway through a take.' }
        ]
      },
      {
        title: 'Pan and tilt',
        intro: 'Drag the picture to move the camera. You can turn it, but you can’t zoom.',
        blocks: [
          { type: 'text', html: '<p>A [[pan]] turns the camera left or right from one spot, like turning your head. A [[tilt]] points it up or down, like nodding. The [[tripod head]] lets the camera turn smoothly.</p><p>Use a pan to follow a moving person or to reveal a wide place bit by bit. Use a tilt to show something tall.</p>' },
          { type: 'viewfinder', media: 'scene-shelf', lockZoom: true, frame: [300, 200, 620], badge: move,
            tasks: [
              { label: 'Pan right until the red book is in the frame', test: m => m.inside('book') },
              { label: 'Pan back to the windows on the left', test: m => m.f.x < 60 },
              { label: 'Tilt down to the floor', test: m => m.f.y + m.f.w * 9 / 16 > 920 }
            ],
            doneText: '<strong>Pan and tilt, done.</strong> Real pans are slow and smooth. Start still, move, then end still.' }
        ]
      },
      {
        title: 'Move with a reason',
        intro: 'Every camera move should show viewers something new.',
        blocks: [
          { type: 'text', html: '<p>Good moves start still, move smoothly, and end still. Moving for no reason, or swinging back and forth, makes viewers dizzy. Ask: what does this move show that a cut couldn’t?</p>' },
          { type: 'video-segments', media: 'p3-pan-tilt', label: 'Locked, pan, tilt', caption: 'A locked-off shot, a pan following a walk, and a tilt from shoes to face.' },
          { type: 'quiz', label: 'Pick the move', items: [
            { q: 'Follow a runner across a field.', options: ['Pan', { text: 'Tilt', clue: 'The runner moves sideways, not up or down.' }, { text: 'Locked-off shot', clue: 'The runner would leave the frame.' }], answer: 0, explain: 'Turn with the runner.' },
            { q: 'Show a flagpole from the bottom to the flag.', options: [{ text: 'Pan', clue: 'A pan goes sideways.' }, 'Tilt', { text: 'Locked-off shot', clue: 'You need to move to reveal the top.' }], answer: 1, explain: 'Point up from the base to the flag.' },
            { q: 'A sit-down interview.', options: [{ text: 'Pan', clue: 'The person isn’t moving.' }, { text: 'Tilt', clue: 'Nothing tall to reveal.' }, 'Locked-off shot'], answer: 2, explain: 'Keep the camera still and let the person talk.' },
            { q: 'Reveal a long table of food, one dish at a time.', options: ['Pan', { text: 'Tilt', clue: 'The table runs sideways.' }, { text: 'Locked-off shot', clue: 'You want to reveal it bit by bit.' }], answer: 0, explain: 'A slow pan reveals the table.' }
          ] }
        ]
      },
      {
        id: 'studio-practice', title: 'Try it in the studio',
        intro: 'Turn the tripod head, then lock it off.',
        blocks: [
          { type: 'text', html: '<p>Pan and tilt with the thirds grid on, then centre the camera and leave it still.</p>' },
          { type: 'studio-room', lesson: 'locked-shot-pan-and-tilt' }
        ]
      }
    ],
    check: [
      { svg: head(), alt: 'A tripod head with pan and tilt arrows.', q: 'Turning the camera left or right on the tripod is called…', options: ['A pan', { text: 'A tilt', clue: 'A tilt goes up and down.' }, { text: 'A zoom', clue: 'A zoom changes size with the lens.' }], answer: 0, explain: 'Like turning your head.' },
      { q: 'What is a locked-off shot?', options: ['A shot where the camera doesn’t move at all', { text: 'A shot that is out of focus', clue: 'Locked off is about movement.' }, { text: 'A shot that pans quickly', clue: 'That is the opposite.' }], answer: 0, explain: 'The camera stays still and the action moves.' },
      { q: 'How should a good pan start and end?', options: ['Still, then move smoothly, then still', { text: 'Fast from the first frame', clue: 'A sudden start is hard to cut.' }, { text: 'Back and forth a few times', clue: 'That makes viewers dizzy.' }], answer: 0, explain: 'Still frames at each end give the editor clean cut points.' },
      { q: 'You want to show how tall a tree is. Which move?', options: ['Tilt up', { text: 'Pan left', clue: 'Sideways won’t show the height.' }, { text: 'No move', clue: 'You need to reveal the top.' }], answer: 0, explain: 'A tilt shows height.' }
    ],
    remember: [
      'A [[locked-off shot]] doesn’t move; most good shots are locked off.',
      'A [[pan]] turns left or right; a [[tilt]] points up or down, using the [[tripod head]].',
      'Move only with a reason: start still, move smoothly, end still.'
    ],
    realCamera: 'Put your phone on a tripod or a stack of books. Film a five-second locked-off shot, a slow pan across the room, and a tilt from the floor to the ceiling. Which looks most professional?'
  });
})();
