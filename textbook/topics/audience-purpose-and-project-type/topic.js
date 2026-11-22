(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const quiz = (...items) => ({ type: 'quiz', items });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const covers = card('Two openings', 'A reads Lunch challenge: can your table go five minutes? B reads How our school handles phones at lunch.', [['A · Lunch challenge', 'Try five minutes', 'with phones down.'], ['B · Family update', 'How our school', 'handles phones.']]);
  const formats = card('Four projects', 'A PSA asks for an action. An interview shares a point of view. A music video interprets a song. A short film tells a story.', [['PSA', 'Ask for action'], ['Interview', 'Hear a voice'], ['Music video', 'Interpret a song'], ['Short film', 'Tell a story']]);
  T.topic({
    slug: 'audience-purpose-and-project-type', minutes: 12,
    hook: hook(covers, 'Which opening speaks directly to younger students at the lunch table?', ['A · Lunch challenge', 'B · Family update'], 0, 'A invites students to try the challenge themselves. The [[audience]] and [[purpose]] change how the story begins.'),
    vocab: ['audience', 'purpose', 'project-type', 'message'],
    objectives: ['Identify a likely audience and purpose from an opening.', 'Match a project type and a short message to a viewer’s need.'],
    sections: [
      teach('Four ways to shape a project', 'Decide who needs the video and what you want it to do.',
        '<p>The [[audience]] is who will watch. The [[purpose]] might be to inform, persuade, entertain or document. A [[project type]] gives the video a useful form.</p><p>In this book you make PSAs, interviews, music videos and short films. One form can serve more than one purpose.</p>', figure(formats, 'Choose a form that serves this project.')),
      teach('Write one message', 'A clear message gives your crew a test for every scene.',
        '<p>For Phones Down at Lunch, the [[message]] is “Try turning your phone face down and talking to the person across from you.” Grow each shot out of that action.</p>',
        { type: 'callout', kind: 'consider', html: 'Try different opening words for a student and for a parent, with the same message.' }),
      practice('Practice: match the purpose', 'Use the action you want the viewer to take or the thing they need to learn.',
        { type: 'sorter', groups: ['Inform', 'Persuade', 'Entertain', 'Document'], items: [
          { text: 'A PSA asks students to put phones down at lunch.', group: 1, why: 'It asks for a behavior change.', clue: 'Find the action the viewer should take.' },
          { text: 'A tour shows new students where to collect a lunch tray.', group: 0, why: 'It explains a routine.', clue: 'What practical fact can a new student use?' },
          { text: 'A short film follows a backpack that gets up and leaves on its own.', group: 2, why: 'The funny story is the main purpose.', clue: 'Is the viewer expected to follow an instruction?' },
          { text: 'An interview records a retiring lunch worker’s memories.', group: 3, why: 'It preserves a record.', clue: 'What would disappear if nobody recorded it?' },
          { text: 'A campaign asks families to donate lunch supplies.', group: 1, why: 'The call to donate asks for action.', clue: 'What should the audience do afterward?' },
          { text: 'An announcement explains the new lunch schedule.', group: 0, why: 'It gives dates and times people can use.', clue: 'The main point is to understand a change.' }
        ] },
        quiz(q('Who needs the opening “How our school handles phones at lunch”?', 'Families who want to understand the school routine.', [['Performers about to film a music video.', 'The subject is a school routine.'], ['Students looking for a new soundtrack.', 'Nothing in the opening promises music.']], 'The opener refers to the school from a family’s point of view.')))
    ],
    check: [
      q('Which opener invites viewers to do something during lunch?', 'A', [['B', 'B offers an explanation rather than a challenge.']], 'A gives the viewer a concrete action to try.', covers),
      q('Which project type works for asking students to try a new lunch habit?', 'A short PSA', [['A record of a past rehearsal', 'The students need a new action to try.'], ['A music video about an unrelated song', 'The type needs a link to the intended purpose.']], 'A PSA can make a clear request to a school audience.'),
      q('Which message can the crew film in one clear action?', 'Put the phone face down and ask a friend a question.', [['Talk about technology in many ways.', 'That gives the crew many unrelated directions.'], ['Make the video interesting.', 'That describes a wish for the video.']], 'The crew can show the specific action in the frame.')
    ],
    remember: ['Name the [[audience]] in one plain sentence.', 'Pick a [[project type]] that serves the [[purpose]].', 'Build each scene around a clear [[message]].'],
    realCameraTitle: 'Try it', realCamera: 'For a video you want to make, write who should watch, what they should do or understand, and the one sentence they should remember.',
    notes: { sketch: 'Sketch two openings for the same message. Change the audience for the second one.', frames: 2, frameLabels: ['Students', 'Another audience'], think: 'What changes when the video is meant for a new audience?' }
  });
})();
