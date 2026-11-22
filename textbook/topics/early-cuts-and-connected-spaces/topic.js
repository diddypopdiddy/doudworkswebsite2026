/* 6.06 Early cuts and connected spaces (history). Content data per FOUNDATION T4. Films are public domain (shared/media.js). */
(function () {
  const T = Textbook, D = T.draw;
  const door = '<rect x="250" y="40" width="44" height="92" fill="#c9a77c" stroke="#8a6a44" stroke-width="2"/>';
  const tree = '<rect x="40" y="70" width="10" height="62" fill="#7a5a3a"/><circle cx="45" cy="62" r="24" fill="#6f9a6a"/>';
  const strip = s => s.replace('<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '');
  const connected = '<svg viewBox="0 0 660 180" xmlns="http://www.w3.org/2000/svg">'
    + '<g>' + strip(D.frame(door + D.person(200, 70, 1, 'right', '#3157c8') + D.arrow(230, 150, 300, '#a8442a'), 'SHOT 1 · INSIDE')) + '</g>'
    + '<g transform="translate(340 0)">' + strip(D.frame(tree + D.person(70, 70, 1, 'right', '#3157c8') + D.arrow(20, 150, 90, '#a8442a'), 'SHOT 2 · OUTSIDE')) + '</g>'
    + '<text x="330" y="96" text-anchor="middle" font-family="Inter,sans-serif" font-size="22" font-weight="800" fill="#a8442a">✂</text></svg>';
  const K = T.mediaRecord('pd-kiss-tunnel').events;

  T.topic({
    slug: 'early-cuts-and-connected-spaces',
    minutes: 15,
    bigIdea: 'Early filmmakers learned that two shots can feel like one place.',
    hook: {
      sequence: [T.seg('pd-lumiere-factory', 1.6, 13.0)],
      question: 'This is one of the first films ever shown, from 1895. How many cuts does it have?',
      options: ['None', 'One', 'Five'],
      answer: 0,
      reveal: 'None. The camera was set up once and left running until the film ran out. Within a few years, filmmakers discovered what a cut could do.'
    },
    notes: {
      sketch: 'Sketch two shots of different places that viewers would read as connected. Draw arrows to show how a person moves from one to the next.',
      frames: 2, frameLabels: ['Shot 1', 'Shot 2'],
      think: 'Life of an American Fireman shows the same rescue twice. Describe how you would cut it today.'
    },
    vocab: ['continuity-editing', 'connected-space'],
    review: ['cut', 'location', 'screen-direction'],
    objectives: [
      'Describe how early films joined shots of different places.',
      'Explain what makes two shots feel like a [[connected space]].'
    ],
    sections: [
      {
        title: 'One shot, one place',
        intro: 'The first films were a single shot each.',
        blocks: [
          { type: 'text', html: '<p>In 1895, Louis and Auguste Lumière filmed workers leaving their factory in Lyon, France. The camera never moved and there was no [[cut]]. Most films of the 1890s were like this: one shot, one place, about a minute long.</p><p>Around 1900, filmmakers began joining shots of <em>different</em> places. They discovered something surprising: viewers understood the places were next to each other, even though they were filmed separately.</p>' },
          { type: 'video-segments', media: 'pd-lumiere-factory', label: 'Workers Leaving the Lumière Factory, 1895', pauses: [ { at: 18, prompt: 'Has the camera moved yet? Has there been a cut?' } ] },
          { type: 'figure', svg: connected, alt: 'Shot 1 inside: a person walks toward a door on screen right. Cut. Shot 2 outside: the same person enters from screen left beside a tree.', caption: 'Out of one shot on screen right, into the next from screen left. Viewers read the two places as joined.' }
        ]
      },
      {
        title: 'Out the door and into the next place',
        intro: '<em>The Great Train Robbery</em> (1903) moves its story through many locations.',
        blocks: [
          { type: 'text', html: '<p>Edwin S. Porter’s <em>The Great Train Robbery</em> cuts from a telegraph office to a water tower to a moving train. Each [[cut]] takes us to a new [[location]], but the story keeps flowing because people leave one place and turn up at the next. Each pair of shots works as a [[connected space]].</p>' },
          { type: 'video-segments', media: 'pd-great-train-robbery', label: 'The Great Train Robbery, 1903', segments: [ { label: 'Office to water tower', from: 100, to: 128 } ],
            pauses: [ { at: 108.6, prompt: 'The robbers just left through the door, and the office is empty. Where do you think they’ll be next?' }, { at: 117, prompt: 'A new place. What tells you it connects to the office?' } ] },
          { type: 'callout', kind: 'consider', html: 'Audiences in 1903 had never seen a film jump between places. Why do you think they could follow it anyway?' }
        ]
      },
      {
        title: 'Into the tunnel',
        intro: 'In 1899, George Albert Smith used three shots to tell a tiny joke.',
        blocks: [
          { type: 'text', html: '<p>In <em>The Kiss in the Tunnel</em>, a train goes into a tunnel. Inside a carriage, a passenger steals a kiss in the dark. Then the train comes out the other side. Three separate shots, filmed in different places, read as one trip.</p>' },
          { type: 'video-segments', media: 'pd-kiss-tunnel', label: 'The Kiss in the Tunnel, 1899', segments: [ { label: 'The whole film', from: 7, to: 68.9 } ],
            pauses: [ { at: K.cut1 - 0.6, prompt: 'The train has gone into the tunnel. What do you expect to see next?' }, { at: K.cut2 + 1.5, prompt: 'How do we know we’re still on the same train?' } ] },
          { type: 'sequence-builder', start: [1, 2, 0],
            prompt: '<strong>Practice.</strong> The three shots are out of order. Put them in order so the places connect, check, then play your version.',
            success: 'Into the tunnel, inside the carriage, out the other side: three places that feel like one journey.',
            clue: 'Think about the trip: what has to happen before the carriage is dark?',
            shots: [
              { label: 'Train enters the tunnel', desc: 'Outside, the train disappears into the dark.', thumbAt: 26, segment: T.seg('pd-kiss-tunnel', 22, K.cut1 - 0.2) },
              { label: 'Inside the carriage', desc: 'The passengers in the dark tunnel.', thumbAt: 40, segment: T.seg('pd-kiss-tunnel', K.cut1 + 0.3, 49) },
              { label: 'Out of the tunnel', desc: 'The view from the train as it comes out.', thumbAt: 65, segment: T.seg('pd-kiss-tunnel', K.cut2 + 0.2, 68.8) }
            ] }
        ]
      },
      {
        title: 'The same moment, twice',
        intro: 'Early filmmakers were still working out how to show time across cuts.',
        blocks: [
          { type: 'text', html: '<p>In <em>Life of an American Fireman</em> (1903), a firefighter rescues a mother and child. The film shows the whole rescue from <strong>inside</strong> the room, then shows the whole rescue <strong>again</strong> from outside. The same minutes happen twice.</p><p>Later editors solved this by cutting back and forth between inside and outside while the rescue happened once. That way of joining shots so time, space and action flow without a break is called [[continuity editing]].</p>' },
          { type: 'video-segments', media: 'pd-american-fireman', label: 'Life of an American Fireman, 1903', segments: [ { label: 'Inside the room', from: 228, to: 318 }, { label: 'Outside the house', from: 318, to: 416 } ],
            pauses: [ { at: 300, prompt: 'The rescue is happening inside. Remember this moment.' }, { at: 340, prompt: 'Now we’re outside. Has time moved forward, or are we seeing the same rescue again?' } ] }
        ]
      },
      {
        title: 'Why it still matters',
        intro: 'The rules in this part grew out of these discoveries.',
        blocks: [
          { type: 'text', html: '<p>Keeping [[screen direction]], letting people [[exit the frame|exit-the-frame]] and enter the next one, and [[cutting on action]] are all ways to make [[continuity editing]] invisible. Every one of them helps viewers believe two separate shots are one connected space and one continuous moment.</p>' },
          { type: 'callout', kind: 'history', html: 'In 1905, <em>Rescued by Rover</em> used the same idea across a whole chase: the dog leaves every shot before the next place appears.', link: { href: '../exits-and-entrances/index.html', label: 'See it in 6.04 →' } }
        ]
      }
    ],
    check: [
      { media: { id: 'pd-lumiere-factory', t: 12 }, q: 'This 1895 film is one shot from one camera that never moves. What did filmmakers discover a few years later?', options: [
        'Shots of different places, cut together, can feel connected.',
        { text: 'Cameras could record sound.', clue: 'Synced sound came much later.' },
        { text: 'Films should only ever be one shot.', clue: 'They discovered the opposite.' }
      ], answer: 0, explain: 'Viewers read two places as side by side.' },
      { svg: connected, alt: 'Shot 1 inside, person exits screen right. Shot 2 outside, person enters screen left.', q: 'Shot 1: a person exits screen right. Shot 2: they enter from screen left in a new place. Viewers understand…', options: [
        'The two places are next to each other.',
        { text: 'The person is lost.', clue: 'The direction carries on smoothly.' },
        { text: 'Years have passed.', clue: 'Nothing suggests a time jump.' }
      ], answer: 0, explain: 'That is a connected space.' },
      { q: '<em>Life of an American Fireman</em> shows the rescue from inside, then the whole rescue again from outside. A modern editor would most likely…', options: [
        'Cut back and forth between inside and outside as it happens once',
        { text: 'Show it three times', clue: 'That makes the repetition worse.' },
        { text: 'Delete the outside shot', clue: 'The outside view is useful. It just needs to be woven in.' }
      ], answer: 0, explain: 'Intercutting keeps time moving forward once.' },
      { q: 'Continuity editing makes cuts feel…', options: [
        'Like time, space and action flow without a break',
        { text: 'Like the film is starting over', clue: 'Continuity means flowing on.' },
        { text: 'As noticeable as possible', clue: 'The goal is for cuts to be invisible.' }
      ], answer: 0, explain: 'Good continuity editing goes unnoticed.' }
    ],
    remember: [
      'Early films were single shots of one place.',
      'By 1903, filmmakers joined places into a [[connected space]] through cuts.',
      '[[Continuity editing]] makes those cuts feel like one flowing moment.'
    ],
    realCameraTitle: 'Look for it',
    realCamera: 'Watch the first two minutes of any film or TV show. Count the cuts that take you to a new place. How does each one tell you the places are connected?'
  });
})();
