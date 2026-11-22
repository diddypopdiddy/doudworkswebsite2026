/* 6.04 Exits and entrances. Rebuilt from Basic Sequences unit 2. Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;
  const H = T.mediaRecord('hall-walk').events, R = T.mediaRecord('room-wide').events;

  T.topic({
    slug: 'exits-and-entrances',
    minutes: 15,
    bigIdea: 'Start empty. End empty.',
    hook: {
      sequence: [T.seg('hall-walk', 3.1, 4.4), T.seg('room-wide', 3.2, 6.0)],
      question: 'Watch the two shots. What feels wrong?',
      options: ['The person appears out of nowhere, then vanishes', 'The person walks too slowly', 'Nothing. It looks smooth.'],
      answer: 0,
      reveal: 'Both shots start and end with the person already mid-frame. They pop in and pop out. Let them walk into an empty frame and out of it again, and the problem goes away.'
    },
    notes: {
      sketch: 'Sketch the first frame and the last frame of a clean shot of someone walking through a doorway.',
      frames: 2, frameLabels: ['First frame', 'Last frame'],
      think: 'Why does an empty frame let you jump to a different place or a different time?'
    },
    vocab: ['enter-the-frame', 'exit-the-frame', 'clean-frame'],
    review: ['cut', 'screen-direction'],
    objectives: [
      'Explain why a [[clean frame]] gives the editor choices.',
      'Trim a shot so the person [[enters the frame|enter-the-frame]] and [[exits the frame|exit-the-frame]] cleanly.',
      'Keep [[screen direction]] when a person exits one shot and enters the next.'
    ],
    sections: [
      {
        title: 'Start empty, end empty',
        intro: 'Let the person walk into an empty frame, and out of it again.',
        blocks: [
          { type: 'text', html: '<p>When a person [[enters the frame|enter-the-frame]], they walk into an empty shot from one edge. When they [[exit the frame|exit-the-frame]], they walk out past an edge and leave it empty. The empty moments before and after are [[clean frames|clean-frame]].</p>' },
          { type: 'video-segments', media: 'hall-walk', label: 'Hallway', segments: [ { label: 'Empty at the start', from: 0, to: H.enter }, { label: 'The walk', from: H.enter, to: H.exit }, { label: 'Empty at the end', from: H.exit, to: 7 } ],
            pauses: [ { at: H.enter + 0.15, prompt: 'The person just entered. Which edge of the frame did they come from?' }, { at: H.exit + 0.2, prompt: 'The frame is empty again. Why might an editor love this moment?' } ] },
          { type: 'callout', kind: 'onset', html: 'Press record before the actor moves. Stop only after they are completely gone. The editor can always trim; they can’t add frames you never filmed.' }
        ]
      },
      {
        title: 'Trim a clean shot',
        intro: 'Drag the start and end of the shot. Watch what the first and last frames show.',
        blocks: [
          { type: 'trim-explore', media: 'hall-walk',
            states: [
              { title: 'Clean entrance and exit', text: 'The frame is empty, the person crosses it, and the frame is empty again. This shot will cut with anything.' },
              { title: 'The person pops in', text: 'The shot begins with the person already in the frame. They seem to appear from nowhere.' },
              { title: 'The person is cut off', text: 'The shot ends before the person has left. They seem to vanish.' },
              { title: 'Pops in, cut off', text: 'The person is in the frame at both ends. This shot is hard to cut with anything.' }
            ],
            presets: [ { label: 'Clean in and out', in: -0.6, out: 0.6 }, { label: 'Starts too late', in: 1, out: 0.6 }, { label: 'Ends too early', in: -0.6, out: -1 } ],
            checks: ['Starts on an empty frame', 'Ends on an empty frame'],
            tasks: ['Make a clean entrance', 'Make a clean exit', 'Play a shot that is clean at both ends'],
            completion: '<strong>Clean in, clean out.</strong> When you film, keep recording until the person is completely gone.' }
        ]
      },
      {
        title: 'Why a clean frame is a free pass',
        intro: 'An empty frame lets you cut to any place, or any time.',
        blocks: [
          { type: 'text', html: '<p>Once the person has left, the shot is a [[clean frame]]. From there you can [[cut]] to anywhere: the next room, the next day, a different city. Viewers accept the jump because nothing was interrupted.</p><p>If you cut while the person is mid-walk, the next shot has to continue the walk exactly: same speed, same [[screen direction]]. That is much harder to get right.</p>' },
          { type: 'figure-row', items: [
            { media: 'still-hall-empty', caption: '<strong>Clean frame.</strong> Cut to anything.' },
            { media: 'still-hall-mid', caption: '<strong>Mid-walk.</strong> The next shot must continue the walk.' }
          ] },
          { type: 'video-segments', media: 'pd-rescued-by-rover', label: 'Rescued by Rover, 1905', segments: [ { label: 'The dog’s run', from: 101.5, to: 153 } ],
            pauses: [ { at: 110.6, prompt: 'The dog has run out of the frame and left it empty. Where do you expect it to appear next?' }, { at: 140.6, prompt: 'Street, corner, river, houses: four places. Why does it feel like one journey?' } ],
            caption: 'In 1905, Cecil Hepworth let the dog leave every shot before cutting to the next place. Audiences followed the journey easily.' },
          { type: 'callout', kind: 'consider', html: 'A person exits the school on a sunny afternoon and enters their house at night. Why does an empty frame make that time jump feel natural?' }
        ]
      },
      {
        title: 'Practice: trim for the editor',
        intro: 'The editor tells you what they need. Set the start and the end, then lock it in.',
        blocks: [
          { type: 'challenge', actionLabel: 'Lock it in', speaker: 'The editor says', closing: 'Two clean shots, ready to cut together.',
            briefs: [
              { tool: 'trim', media: 'hall-walk', in: H.enter + 1, out: H.exit - 1, text: 'Give me the whole walk. Start on the empty hallway and end on the empty hallway. No dead air.', success: 'Empty, walk, empty. This shot will cut with anything.' },
              { tool: 'trim', media: 'room-wide', room: true, in: R.enter + 1, out: R.sitEnd, text: 'Now the room. Start on the empty room. End once the book is open.', success: 'The person walks into the room, and we stay until the action is finished.' }
            ] }
        ]
      }
    ],
    check: [
      { media: 'still-hall-empty', q: 'Why is this moment useful to an editor?', options: [
        'It is a clean frame, so the editor can cut to any shot.',
        { text: 'It shows the person’s face.', clue: 'Look again: who is in the frame?' },
        { text: 'It is the most exciting moment.', clue: 'Nothing is happening. That’s the point.' }
      ], answer: 0, explain: 'An empty frame is a free pass to cut anywhere.' },
      { q: 'A shot begins with the person already halfway across the frame. What do viewers see?', options: [
        'The person seems to appear from nowhere.',
        { text: 'A smooth entrance.', clue: 'A smooth entrance starts on an empty frame.' },
        { text: 'A clean frame.', clue: 'A clean frame has nobody in it.' }
      ], answer: 0, explain: 'Starting mid-walk makes the person pop in.' },
      { q: 'When should you press stop?', options: [
        'After the person has completely left the frame',
        { text: 'As soon as they reach the edge', clue: 'Part of them is still in the shot.' },
        { text: 'While they are in the middle', clue: 'That cuts them off.' }
      ], answer: 0, explain: 'Keep recording for a second or two of empty frame.' },
      { pair: [ { id: 'still-hall-mid', caption: 'Shot 1: walking screen right' }, { id: 'still-room-wide', caption: 'Shot 2: the room' } ], q: 'The person exits the hallway on screen right. In the room shot, which entrance keeps them moving the same way?', options: [
        'Entering from screen left',
        { text: 'Entering from screen right', clue: 'That would look like they turned around.' },
        { text: 'It doesn’t matter', clue: 'Screen direction carries across the cut.' }
      ], answer: 0, explain: 'Exit right, enter left keeps the screen direction.' }
    ],
    remember: [
      'Start recording before the person [[enters the frame|enter-the-frame]]. Stop after they [[exit the frame|exit-the-frame]].',
      'A [[clean frame]] lets you cut to any place or time.',
      'Exit one side, enter from the other, to keep [[screen direction]].'
    ],
    realCamera: 'Film a friend walking through a doorway in two shots. In each shot, start recording before they enter and stop after they leave. Then join the two shots so they keep walking the same way.'
  });
})();
