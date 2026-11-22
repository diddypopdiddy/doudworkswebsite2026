/* 3.17 Zoom versus camera movement. The zoom-dolly block draws simple perspective; Vince's clip (C7) shows the real thing. */
(function () {
  const T = Textbook, D = T.draw;
  const zd = (move, label, clue) => ({ media: 'p3-perspective-' + move, label, clue });
  // Sideways move: the camera slides along a track (truck).
  const truck = () => D.svg('<rect width="320" height="180" fill="#f4f5f3"/><rect x="30" y="140" width="260" height="8" rx="4" fill="#9aa0a4"/>' +
    '<g transform="translate(110 112)"><rect x="-20" y="-14" width="34" height="26" rx="4" fill="#171b1f"/><path d="M14 -10 L26 -16 V16 L14 10z" fill="#171b1f" transform="rotate(-90 14 0)"/><rect x="-18" y="12" width="30" height="14" fill="#5d6469"/><circle cx="-12" cy="28" r="5" fill="#2a2f35"/><circle cx="6" cy="28" r="5" fill="#2a2f35"/></g>' +
    '<path d="M150 124 H230" stroke="#b86533" stroke-width="3"/><path d="M230 118 l10 6 l-10 6z" fill="#b86533"/>' +
    '<circle cx="190" cy="44" r="10" fill="#e9c6a5"/><rect x="180" y="56" width="20" height="30" rx="6" fill="#3157c8"/>' +
    '<text x="12" y="20" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#5d6469">Truck: the camera slides sideways</text>');

  T.topic({
    slug: 'zoom-versus-camera-movement',
    minutes: 15,
    bigIdea: 'Zooming makes things bigger. Moving the camera changes the view.',
    hook: {
      pair: [ { media: 'p3-perspective-zoom', alt: 'The person large, with big trees and house crowding behind.', caption: 'Shot 1' }, { media: 'p3-perspective-dolly', alt: 'The person the same size, with small trees and house far behind.', caption: 'Shot 2' } ],
      question: 'The person is the same size in both shots. Why does the background look so different?',
      options: ['Shot 1 is a different place', 'One camera zoomed and the other moved closer', 'The trees were moved'],
      answer: 1,
      reveal: 'Shot 1 illustrates a [[zoom]]: the camera stayed back and magnified everything, so the background crowds in. Shot 2 illustrates a [[dolly]]: the camera moved closer, so the far trees stayed small. The [[perspective]] changed.'
    },
    notes: {
      sketch: 'Sketch the end frame of a zoom in and a dolly in on the same person. Show how big the background is in each.',
      frames: 2, frameLabels: ['Zoom in', 'Dolly in'],
      think: 'Why do professionals say “zoom with your feet”?'
    },
    vocab: ['zoom', 'dolly', 'truck', 'perspective', 'digital-zoom'],
    review: ['pan', 'background'],
    objectives: [
      'Explain the difference between a zoom and a dolly.',
      'Predict how the background changes with each move.',
      'Choose between zooming and moving the camera for a shot.'
    ],
    sections: [
      {
        title: 'Zoom in or dolly in',
        intro: 'Pick a move and slide it in. Watch the trees and the house.',
        blocks: [
          { type: 'text', html: '<p>A [[zoom]] changes the lens, not the camera’s position: everything in the frame grows by the same amount. A [[dolly]] moves the whole camera closer, often on wheels or a track. Near things grow fast and far things barely change. That difference in size between near and far is called [[perspective]].</p>' },
          { type: 'zoom-dolly' }
        ]
      },
      {
        title: 'Why it looks different',
        intro: 'Only moving the camera changes perspective.',
        blocks: [
          { type: 'text', html: '<p>When you zoom, the camera sees from the same spot, so the [[background]] keeps the same size compared with the person. Zoom in a lot and the background seems to crowd in behind them.</p><p>When you dolly, you are actually walking into the scene, so viewers feel they are moving with you. A [[truck]] is the same idea sideways: the camera slides left or right, past things.</p>' },
          { type: 'figure-row', items: [
            { media: 'p3-perspective-wide', caption: '<strong>Start.</strong> A wide view from farther back.' },
            { media: 'p3-perspective-zoom', alt: 'End of a zoom.', caption: '<strong>Zoom.</strong> The background crowds in.' },
            { media: 'p3-perspective-dolly', alt: 'End of a dolly.', caption: '<strong>Dolly.</strong> The background stays far away.' }
          ] },
          { type: 'figure', svg: truck(), alt: 'A camera sliding sideways along a track.', caption: '<strong>Truck.</strong> The camera slides sideways.' },
          { type: 'video-segments', media: 'p3-zoom-dolly', label: 'Zoom and dolly', caption: 'The same push in, once by zooming and once by moving the camera.' }
        ]
      },
      {
        title: 'Zoom with your feet',
        intro: 'On a phone, zooming often makes the picture worse.',
        blocks: [
          { type: 'text', html: '<p>Many phones use [[digital zoom]]: they enlarge part of the picture instead of using a real zoom lens. The picture gets blurry and blocky. Walking closer keeps it sharp. Zooming while recording can also look shaky and cheap.</p><p>If you must change size, stop recording, move or zoom, then record again.</p>' },
          { type: 'callout', kind: 'mistake', html: 'Pinching to zoom while filming makes the shot jumpy and soft. Move closer instead, or cut to a new shot.' },
          { type: 'picture-choice', closing: 'Zoom changes size. Moving changes the view.', rounds: [
            { prompt: 'Which end frame came from a zoom?', options: [ zd('zoom', 'A'), zd('dolly', 'B', 'The trees stayed small. The camera moved closer.') ], answer: 0, explain: 'The background grew as much as the person.' },
            { prompt: 'Make viewers feel they are walking toward the person.', options: [ zd('zoom', 'Zoom in', 'A zoom magnifies; it doesn’t feel like moving.'), zd('dolly', 'Dolly in') ], answer: 1, explain: 'A dolly moves the camera into the scene.' },
            { prompt: 'Your phone shows “5x” and the picture is blurry. Which picture would be sharper?', options: [ { media: 'p3-perspective-zoom', filter: 'blur(2px)', alt: 'Zoomed with digital zoom.', label: 'Keep the 5x digital zoom', clue: 'Digital zoom enlarges pixels, so it blurs.' }, { media: 'p3-perspective-dolly', alt: 'Walked closer.', label: 'Walk closer at 1x' } ], answer: 1, explain: 'Walking closer keeps the full quality of the picture.' }
          ] }
        ]
      }
    ],
    check: [
      { media: 'p3-perspective-dolly', alt: 'A person large, background small.', q: 'How was this shot made bigger?', options: ['The camera moved closer (a dolly)', { text: 'The lens zoomed in', clue: 'With a zoom, the trees would grow too.' }], answer: 0, explain: 'The far trees barely changed size.' },
      { q: 'What does a zoom change?', options: ['How big everything looks, from the same spot', { text: 'Where the camera stands', clue: 'That is a dolly or truck.' }, { text: 'The perspective', clue: 'Only moving the camera changes perspective.' }], answer: 0, explain: 'Everything grows by the same amount.' },
      { q: 'Moving the camera sideways along a track is called…', options: ['A truck', { text: 'A tilt', clue: 'A tilt points up or down.' }, { text: 'A zoom', clue: 'A zoom doesn’t move the camera.' }], answer: 0, explain: 'A truck slides the camera left or right.' },
      { q: 'Why is walking closer often better than digital zoom on a phone?', options: ['Digital zoom makes the picture blurry and blocky', { text: 'Walking is faster', clue: 'It is about picture quality.' }, { text: 'Digital zoom changes the colours', clue: 'It enlarges pixels.' }], answer: 0, explain: 'Zoom with your feet.' }
    ],
    remember: [
      'A [[zoom]] magnifies everything from the same spot; a [[dolly]] moves the camera closer.',
      'Only moving the camera changes [[perspective]]; a [[truck]] moves it sideways.',
      'Avoid [[digital zoom]]: move closer instead.'
    ],
    realCamera: 'Stand far from a friend in a hallway and zoom in until their face fills the screen. Take a photo. Then zoom out, walk closer until the face is the same size, and take another. Compare the backgrounds.'
  });
})();
