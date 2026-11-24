/* 3.02 Record and verify a take. The on-set check right after a take (kept 2026-11-19). */
(function () {
  const T = Textbook, D = T.draw;

  T.topic({
    slug: 'record-and-verify-a-take',
    minutes: 12,
    bigIdea: 'It isn’t recorded until you’ve played it back.',
    hook: {
      pair: [ { svg: D.take({ kind: 'good', n: 1, len: '0:09' }), alt: 'Take 1: the person in the middle, a busy sound meter, 9 seconds long.', caption: 'Take 1' }, { svg: D.take({ kind: 'silent', n: 2, len: '0:09' }), alt: 'Take 2: the same picture, but the sound meter is flat.', caption: 'Take 2' } ],
      question: 'Both takes look the same on the camera screen. Which one would you keep?',
      options: ['Take 1', 'Take 2', 'Either one'],
      answer: 0,
      reveal: 'Take 2’s sound meter is flat: it recorded no sound. You only find that out with [[playback]], by watching and listening right after the [[take]].'
    },
    notes: {
      sketch: 'Draw the camera screen while recording. Label the record light and the timer.',
      frames: 1, frameLabels: ['Recording screen'],
      think: 'Why is it better to find a bad take on set than in the edit?'
    },
    vocab: ['take', 'record-light', 'playback', 'slate'],
    objectives: [
      'Start and stop a take so the whole action is recorded.',
      'Check a take with playback before moving on.',
      'Spot why a take failed and what to do next.'
    ],
    sections: [
      {
        title: 'Record, wait, action',
        intro: 'A take starts before the action and ends after it.',
        blocks: [
          { type: 'text', html: '<p>A [[take]] is one recording of a shot, from pressing record to pressing stop. When you press record, look for the [[record light]]: a red dot and a running timer. No red dot means no recording.</p><p>Wait two seconds before the action starts, and two seconds after it ends. Those seconds give the editor room to cut.</p>' },
          { type: 'steps', items: [ 'Press record. Check the red dot and the timer.', 'Wait two seconds. Then say “Action.”', 'Let the whole action happen.', 'Wait two seconds. Then press stop.', 'Play it back.' ] },
          { type: 'callout', kind: 'onset', html: 'Say the shot and take number out loud, or hold up a [[slate]], at the start of each take. The editor will thank you.' }
        ]
      },
      {
        title: 'Play it back',
        intro: '[[Playback]] takes thirty seconds and saves a reshoot.',
        blocks: [
          { type: 'text', html: '<p>After each take, watch it on the camera with the sound on. Check four things: it recorded, it starts before and ends after the action, it is sharp, and you can hear it.</p><p>Only move to the next shot when one good take is safely on the card.</p>' },
          { type: 'video-segments', media: 'p3-record-verify', label: 'Record and verify', caption: 'Record, stop, then play the take back with the sound on.' },
          { type: 'callout', kind: 'mistake', html: 'Pressing record twice by accident stops the camera. You think you are filming, but nothing is saved. Always check for the red dot.' }
        ]
      },
      {
        id: 'camera-practice', title: 'Record and verify a take',
        intro: 'Film the reader sitting down and dropping a note. Leave the editor room at each end.',
        blocks: [
          {
            type: 'camera-sim', title: 'Film the whole action', body: 'g97', level: 1, scene: 'note-library',
            start: { power: true }, callAction: true,
            tasks: [
              { text: 'Record from at least two seconds before the reader sits until two seconds after the note falls.',
                hint: 'Start recording, then choose Call action. Wait until the note lands, count two, and stop.',
                check: s => s.takes.some(t => t.covers('sit', 'noteFalls', 2) && !t.interrupted) },
              { text: 'Watch your complete take through to the end.',
                hint: 'Open Playback, select the take, press Play and watch for the note.',
                check: s => s.takes.some(t => t.covers('sit', 'noteFalls', 2) && t.reviewed) }
            ], doneText: 'Your editor has the complete action and room to cut.'
          },
          {
            type: 'camera-sim', title: 'Review the card', body: 'g97', level: 1, scene: 'note-library',
            start: { power: true }, seedTakes: [
              { start: 0, end: 11, settings: { focusLocked: true } },
              { start: 0, end: 5, settings: { focusLocked: true } },
              { start: 6, end: 11, settings: { focusLocked: true } },
              { start: 0, end: 11, settings: { focusMode: 'MF', focusOn: 'shelves', focusDistance: 7 } }
            ],
            tasks: [
              { text: 'Watch all four clips through to the end. Keep the sharp take that covers the whole action. Delete the other three.',
                hint: 'Look for both the sit and the falling note. Compare the reader with the shelves. Use the delete control while viewing a failed clip.',
                check: s => s.takes.some(t => t.n === 1 && t.reviewed) && [2, 3, 4].every(n => !s.takes.some(t => t.n === n) && s.did('delete', e => e.n === n && e.reviewed)) }
            ], doneText: 'The complete, sharp take is still on the card.'
          }
        ]
      }
    ],
    check: [
      { svg: D.take({ kind: 'none', n: 9, len: '0:00' }), alt: 'A black thumbnail: no file, 0:00.', q: 'You open this take for playback. What happened?', options: ['The camera never recorded', { text: 'The lens cap was on', clue: 'A covered lens still records a black picture with a length.' }, { text: 'The sound was off', clue: 'There is no file at all.' }], answer: 0, explain: 'No file and 0:00 means record never started.' },
      { q: 'What does the record light show?', options: ['That the camera is recording right now', { text: 'That the battery is full', clue: 'The record light is about recording.' }, { text: 'That the shot is in focus', clue: 'Focus has its own signs.' }], answer: 0, explain: 'No red dot, no recording.' },
      { q: 'Why wait two seconds after pressing record before the action?', options: ['So the editor has room to start the shot cleanly', { text: 'To save battery', clue: 'It uses a little more battery, not less.' }, { text: 'Because cameras need to warm up', clue: 'The reason is for the editor.' }], answer: 0, explain: 'Extra seconds at both ends give the editor room to cut.' },
      { q: 'When should you move on to the next shot?', options: ['After playback shows one good take', { text: 'As soon as you press stop', clue: 'You don’t know it worked until you watch it.' }, { text: 'After the actor says it went well', clue: 'Check it yourself on the camera.' }], answer: 0, explain: 'It isn’t recorded until you’ve played it back.' }
    ],
    remember: [
      'Check the [[record light]] every time you press record.',
      'Start each [[take]] before the action and stop after it.',
      'Use [[playback]] to check every take before moving on.'
    ],
    realCamera: 'Film three takes of a friend clapping once. In one, press stop too early. Play all three back and pick the best. Say why the others fail.'
  });
})();
