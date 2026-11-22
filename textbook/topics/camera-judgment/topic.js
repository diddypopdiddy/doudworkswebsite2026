/* 3.19 Camera judgment (Part 3 review). Review terms only. Problems are made from the good photos: crops, mirrors and filters. */
(function () {
  const T = Textbook;
  const R = (size, lead, ey) => ({ recipe: [size, lead, ey] });
  const GOOD = R(0.36, 0.64, 0.33);
  const shot = (id, mirror, r, filter, alt) => ({ id, mirror: !!mirror, crop: T.resolveFrame(id, mirror, r, 0.2), filter, alt: alt || 'An interview frame.' });
  const FIXES = { focus: 'Refocus on the eyes', exposure: 'Add light or brighten the exposure', headroom: 'Fix the headroom', eyes: 'Raise the eyes to the top line', lead: 'Move the space in front of the face', angle: 'Lower the camera to eye level' };
  const opts = (right, others) => [right].concat(others).map((k, i) => i === 0 ? FIXES[k] : { text: FIXES[k], clue: { focus: 'Is the picture sharp?', exposure: 'Is the brightness right?', headroom: 'Look at the space above the head.', eyes: 'Where are the eyes?', lead: 'Which way do they look, and where is the space?', angle: 'Where is the camera compared with the eyes?' }[k] });

  T.topic({
    slug: 'camera-judgment',
    minutes: 15,
    bigIdea: 'Review: find the problem, then fix it.',
    hook: {
      media: shot('interview-b', false, GOOD, 'blur(4px)', 'An interview frame that is soft and blurry.'),
      question: 'The framing is perfect. Why would the editor still throw this shot away?',
      options: ['It is out of focus', 'The headroom is wrong', 'It is a high angle'],
      answer: 0,
      reveal: 'The frame is fine, but the picture is soft. Good camera judgment means checking everything: [[focus]], light, size, eyes, [[headroom]], [[looking room]] and angle, every single time.'
    },
    notes: {
      sketch: 'Sketch a perfect interview frame. Label the eyes on the top line, the headroom and the looking room.',
      frames: 1, frameLabels: ['Perfect interview frame'],
      think: 'Which camera mistake is hardest to fix in the edit? Which is easiest?'
    },
    vocab: [],
    review: ['focus', 'rule-of-thirds', 'headroom', 'looking-room', 'high-angle', 'eye-level'],
    objectives: [
      'Find what is wrong with a frame: focus, exposure, size, eyes, headroom, looking room or angle.',
      'Choose the fix for each problem.',
      'Frame a shot that passes every check.'
    ],
    sections: [
      {
        title: 'The camera checklist',
        intro: 'Run the same checks before every take.',
        blocks: [
          { type: 'steps', items: [ '<strong>Sharp?</strong> [[Focus]] on the eyes.', '<strong>Bright enough?</strong> Faces clearly lit, nothing glowing white.', '<strong>Right size?</strong> The shot size fits its purpose.', '<strong>Eyes on the top line?</strong> The [[rule of thirds]].', '<strong>A little [[headroom]]?</strong> Not a lot.', '<strong>[[Looking room]]?</strong> Space on the side of the gaze.', '<strong>Right angle?</strong> [[Eye level]] unless there is a reason.', '<strong>Steady?</strong> On a tripod, or braced.' ] },
          { type: 'callout', kind: 'onset', html: 'Say the checklist out loud on set. “Sharp, bright, size, eyes, headroom, room, angle, steady.” It takes ten seconds.' }
        ]
      },
      {
        title: 'Find the problem',
        intro: 'Each frame has one problem. Pick the fix.',
        blocks: [
          { type: 'quiz', label: 'Diagnose it', items: [
            { media: shot('interview-a', false, GOOD, 'blur(4px)'), q: 'What is the fix?', options: opts('focus', ['headroom', 'angle']), answer: 0, explain: 'The whole picture is soft.' },
            { media: shot('interview-b', false, GOOD, 'brightness(.35)'), q: 'What is the fix?', options: opts('exposure', ['focus', 'lead']), answer: 0, explain: 'The picture is far too dark.' },
            { media: shot('interview-a', false, R(0.30, 0.64, 0.55)), q: 'What is the fix?', options: opts('headroom', ['exposure', 'focus']), answer: 0, explain: 'Too much space above the head. The eyes should be on the top line.' },
            { media: shot('interview-b', false, R(0.36, 0.30, 0.33)), q: 'What is the fix?', options: opts('lead', ['headroom', 'exposure']), answer: 0, explain: 'The person looks screen left, but the space is behind them.' },
            { media: 'p3-angle-high', alt: 'A person seen from above.', q: 'This is meant to be a neutral interview. What is the fix?', options: opts('angle', ['lead', 'focus']), answer: 0, explain: 'The camera is above the subject. Lower it to eye level.' },
            { media: shot('interview-a', true, R(0.30, 0.64, 0.62)), q: 'What is the fix?', options: opts('eyes', ['angle', 'exposure']), answer: 0, explain: 'The eyes are low in the frame.' }
          ] }
        ]
      },
      {
        title: 'Frame it right',
        intro: 'Put it all together. Each shot must pass every framing check.',
        blocks: [
          { type: 'framing-challenge', minFrac: 0.2, closing: 'Every frame passed. That is camera judgment.', briefs: [
            { media: 'interview-b', start: 'whole', tag: 'Interview', brief: 'A chest-up interview frame: eyes on the top line, a little headroom, looking room in front.', judge: m => T.framingCheck(m, ['chest', 'eyes', 'headroom', 'lead']), success: 'Size, eyes, headroom and looking room all pass.', hint: GOOD },
            { media: 'interview-a', mirror: true, start: R(0.30, 0.30, 0.55), tag: 'Interview', brief: 'The camera operator got everything wrong. Fix it.', judge: m => T.framingCheck(m, ['chest', 'eyes', 'headroom', 'lead']), success: 'From four problems to none.', hint: GOOD },
            { media: 'interview-b', mirror: true, start: 'whole', tag: 'Close-up', brief: 'A close-up for an emotional answer. Fill the frame with the face, keep the chin, leave looking room.', hint: R(0.55, 0.64, 0.36),
              judge: m => m.size < 0.45 ? 'Zoom in more. The face should fill most of the frame.' : !m.chinIn ? 'The chin is cut off. Move the frame down.' : m.headroom > 0.22 ? T.framingMessages.hrLoose : T.framingCheck(m, ['lead']),
              success: 'A close-up that keeps the chin and gives the gaze room.' }
          ] }
        ]
      }
    ],
    check: [
      { media: shot('interview-b', false, GOOD, 'blur(4px)'), q: 'What is wrong with this shot?', options: ['It is out of focus', { text: 'Too much headroom', clue: 'The framing is fine.' }, { text: 'No looking room', clue: 'The framing is fine.' }], answer: 0, explain: 'Refocus on the eyes.' },
      { media: shot('interview-a', false, R(0.36, 0.30, 0.33)), q: 'The subject looks screen right. What is the fix?', options: ['Move the space in front of the face', { text: 'Add more headroom', clue: 'Look left and right, not up.' }, { text: 'Use a high angle', clue: 'The angle is fine.' }], answer: 0, explain: 'Looking room goes on the side of the gaze.' },
      { q: 'Which check comes first on set?', options: ['Is it sharp?', { text: 'Is it a cool angle?', clue: 'Cool comes after correct.' }, { text: 'Is the actor ready?', clue: 'Check the camera first.' }], answer: 0, explain: 'A soft shot can’t be fixed in the edit.' },
      { media: 'p3-angle-high', alt: 'Seen from above.', q: 'What angle is this, and how does it make the person seem?', options: ['High angle: smaller, weaker', { text: 'Low angle: stronger', clue: 'The camera looks down.' }, { text: 'Eye level: neutral', clue: 'We see the top of the head and lots of floor.' }], answer: 0, explain: 'Lower the camera for a neutral look.' }
    ],
    remember: [
      'Check [[focus]] and light first: they can’t be fixed in the edit.',
      'Then size, eyes on the top line, a little [[headroom]] and [[looking room]].',
      'Use [[eye level]] unless the story gives a reason for another angle.'
    ],
    realCamera: 'Film a 15-second interview with a friend. Before you press record, say the checklist out loud: sharp, bright, size, eyes, headroom, room, angle, steady. Then play it back and grade yourself.'
  });
})();
