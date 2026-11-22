/* 3.12 Apparent motion and optical devices (history). The flip book block steps through drawings, then speeds up. */
(function () {
  const T = Textbook, D = T.draw;
  // A zoetrope drum seen from the side: slits around the top, drawings inside.
  const zoetrope = () => D.svg('<rect width="320" height="180" fill="#f4f5f3"/><ellipse cx="160" cy="150" rx="96" ry="18" fill="#d6d8d6"/>' +
    '<path d="M70 52 L70 140 A90 18 0 0 0 250 140 L250 52z" fill="#2a2f35"/><ellipse cx="160" cy="52" rx="90" ry="18" fill="#3a4047"/><ellipse cx="160" cy="52" rx="80" ry="14" fill="#171b1f"/>' +
    Array.from({ length: 9 }, (_, i) => '<rect x="' + (78 + i * 19) + '" y="64" width="6" height="34" fill="#fbfaf7"/>').join('') +
    Array.from({ length: 4 }, (_, i) => '<circle cx="' + (96 + i * 40) + '" cy="' + (124 - (i % 2) * 10) + '" r="7" fill="#b86533"/>').join('') +
    '<rect x="156" y="152" width="8" height="22" fill="#5d6469"/><path d="M262 60 q24 -10 30 14" fill="none" stroke="#3157c8" stroke-width="3"/><path d="M286 70 l8 6 l2 -10z" fill="#3157c8"/>' +
    '<text x="12" y="20" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#5d6469">Spin the drum, look through the slits</text>');

  T.topic({
    slug: 'apparent-motion-and-optical-devices',
    minutes: 12,
    bigIdea: 'Still pictures shown quickly look like motion.',
    hook: {
      pair: [ { svg: D.ballFrame(2, 12), alt: 'A drawing of a ball in the air.', caption: 'Picture 3' }, { svg: D.ballFrame(3, 12), alt: 'The same ball a little farther along.', caption: 'Picture 4' } ],
      question: 'These are two separate drawings. What happens if you flip between twelve of them quickly?',
      options: ['You see twelve separate pictures', 'The ball seems to bounce', 'The pictures blur into grey'],
      answer: 1,
      reveal: 'Shown quickly enough, still pictures seem to move. That is [[apparent motion]], and it is how every video works: each still picture is a [[frame]].'
    },
    notes: {
      sketch: 'Draw four frames of a simple flip book: a ball rising, at the top, falling and squashing on the ground.',
      frames: 4, frameLabels: ['Frame 1', 'Frame 2', 'Frame 3', 'Frame 4'],
      think: 'If video is just still pictures, why don’t we see the gaps between them?'
    },
    vocab: ['apparent-motion', 'frame', 'zoetrope', 'flip-book'],
    objectives: [
      'Explain how still pictures can look like motion.',
      'Describe how a zoetrope and a flip book work.',
      'Find the speed where separate pictures start to look like smooth movement.'
    ],
    sections: [
      {
        title: 'Flip through the pictures',
        intro: 'Step through one picture at a time, then press play and speed it up.',
        blocks: [
          { type: 'text', html: '<p>A [[flip book]] is a pad of drawings, each a little different. Flip the pages quickly and the drawing moves. Each drawing is one [[frame]]. Slowly, you see separate pictures. Faster, your brain joins them into movement: [[apparent motion]].</p>' },
          { type: 'flipbook', kind: 'ball', n: 12, fps: 2, strip: true, side: { title: 'Try this', html: '<p>Start at 1 picture a second. Speed up one step at a time. At what speed does the ball stop jumping and start bouncing?</p><p>Most people see smooth movement somewhere around 10 to 12 pictures a second.</p>', warm: true } }
        ]
      },
      {
        title: 'Toys that made pictures move',
        intro: 'Long before film, inventors built devices to show apparent motion.',
        blocks: [
          { type: 'text', html: '<p>In the 1830s, toys like the phenakistiscope (a spinning disc) showed drawings in quick order. The [[zoetrope]], popular from the 1860s, is a drum with slits around the top and a strip of drawings inside. Spin it and look through the slits: each slit shows one drawing for an instant, so the drawings seem to move.</p><p>The [[flip book]] came along in 1868. These toys proved the idea that film would later use: show still pictures fast enough, and people see motion.</p>' },
          { type: 'figure', svg: zoetrope(), alt: 'A zoetrope: a spinning drum with slits and drawings inside.', caption: 'A zoetrope. The slits work like a shutter: you see one drawing at a time.' },
          { type: 'callout', kind: 'history', html: 'Photographers soon used real photos instead of drawings. See how in 3.13.', link: { href: '../motion-photography-and-muybridge/index.html', label: 'Read 3.13 →' } }
        ]
      },
      {
        title: 'From toys to video',
        intro: 'Video works the same way, just faster.',
        blocks: [
          { type: 'text', html: '<p>A film camera takes 24 still pictures every second, and a projector shows them at the same speed. Your phone does the same with 30 or 60 frames a second. Every video you watch is a very fast flip book.</p>' },
          { type: 'quick-check', q: 'What is a frame?', options: ['One still picture in a video', { text: 'A whole video', clue: 'A video is made of many of these.' }, { text: 'The sound in a video', clue: 'Frames are pictures.' }], answer: 0, explain: 'Video shows frames quickly, one after another.' }
        ]
      }
    ],
    check: [
      { svg: zoetrope(), alt: 'A spinning drum with slits.', q: 'What is this device called?', options: ['A zoetrope', { text: 'A flip book', clue: 'A flip book is a pad of pages.' }, { text: 'A projector', clue: 'A projector shines film on a screen.' }], answer: 0, explain: 'Spin the drum, look through the slits.' },
      { q: 'What is apparent motion?', options: ['Seeing movement when still pictures are shown quickly', { text: 'A camera that moves on a track', clue: 'Apparent motion is about how we see.' }, { text: 'A blurry photo', clue: 'That is motion blur.' }], answer: 0, explain: 'Your brain joins the pictures into motion.' },
      { svg: D.ballFrame(5, 12), alt: 'One drawing of a ball.', q: 'This is one drawing from a flip book. What is it called in video?', options: ['A frame', { text: 'A sequence', clue: 'A sequence is many shots joined together.' }, { text: 'A take', clue: 'A take is one whole recording.' }], answer: 0, explain: 'Each still picture is a frame.' }
    ],
    remember: [
      'Still pictures shown quickly look like motion: [[apparent motion]].',
      'A [[zoetrope]] and a [[flip book]] were early ways to show it.',
      'Every video is a fast run of still pictures, each one a [[frame]].'
    ],
    realCameraTitle: 'Try it',
    realCamera: 'Make a 12-page flip book in the corner of a notebook: a ball bouncing or a stick figure waving. Flip it slowly, then quickly. When does it start to move?'
  });
})();
