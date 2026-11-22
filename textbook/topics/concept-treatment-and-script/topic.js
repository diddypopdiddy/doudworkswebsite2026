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

  const pitch = card('Two ways to tell it', 'One line describes a phone-covered lunch table. A two-row script lists picture and sound for specific shots.', [['Logline', 'At lunch, a friend', 'puts a phone down', 'to start a talk.'], ['Script', 'Picture: lunch table', 'Sound: lunch chatter', 'Picture: phone down']]);
  const script = card('Two columns · 12 seconds', 'Picture: 0–4 seconds table of students; 4–12 close phone flips down. Sound: cafeteria and a question from a friend.', [['Picture', '0–4 Wide table', '4–12 Phone down'], ['Sound', 'Cafeteria sounds', '“How was class?”']]);
  T.topic({
    slug: 'concept-treatment-and-script', minutes: 15,
    hook: hook(pitch, 'You have ten seconds to tell a friend the story. Which page would you choose?', ['The single line', 'The script table'], 0, 'The single line names the situation and action quickly. A short [[logline]] carries the heart of the [[concept]].'),
    vocab: ['concept', 'logline', 'treatment', 'script', 'two-column-script'],
    objectives: ['Order concept, logline, treatment and script by how much detail they give.', 'Find missing picture, sound or timing information in a two-column script.'],
    sections: [
      teach('Make the plan more specific', 'Each version answers a new question the crew will ask.',
        '<p>The [[concept]] is the idea. The [[logline]] gives its story in one sentence. A [[treatment]] tells the main turns in a short paragraph.</p><p>A [[script]] adds the events, words and cues needed to make the video. The lunch PSA goes from a table of silent friends to a small change anyone can try.</p>',
        figure(pitch, 'The logline can pitch the idea. The script guides the crew.')),
      teach('Give picture and sound their own space', 'A two-column script lets you read what people see and hear at the same time.',
        '<p>Read across each row of a [[two-column script]]. Use specific shots on the left and matching sound on the right. Include the time budget for each part.</p>',
        figure(script, 'One row can line up one action and one sound.'), { type: 'callout', kind: 'onset', html: 'Your camera and sound crew can check the same row before each take.' }),
      practice('Practice: order the plan and fix the page', 'Start with the broad idea. Add the details a crew would need.',
        { type: 'sorter', mode: 'order', prompt: 'Put the planning stages in order.', items: [
          { text: 'Script: shot and sound rows', clue: 'The crew uses these exact instructions to make the video.' },
          { text: 'Logline: one sentence about the change', clue: 'This short pitch comes before a full paragraph.' },
          { text: 'Treatment: paragraph of the main turns', clue: 'Add the big moments after the one-line pitch.' },
          { text: 'Concept: talking at lunch with phones down', clue: 'Start with the idea.' }
        ], correct: [3, 1, 2, 0], success: 'The plan goes from broad idea to production details.' },
        quiz(
          q('The picture column shows a phone turning over. What is missing if the other column is blank?', 'What the audience should hear', [['A different picture size', 'A shot is already described.'], ['The entire concept', 'The idea is clear. One part of the cue is missing.']], 'Add sound, words or intentional silence to the right column.'),
          q('The right column says “lunch chatter.” The left says “interesting” only. What is missing?', 'A specific visible action or shot', [['A title for the music track', 'Look in the picture column.'], ['A new target audience', 'The shot has to be described before it can be filmed.']], 'Name who or what appears and what they do.'),
          q('Each shot and cue is written, but the PSA must run 45 seconds. What should you add?', 'A duration or end time for each row', [['Hidden captions', 'The question is about the total length.'], ['The names of all cameras', 'Cameras do not specify how long each shot lasts.']], 'Use timing cues to know whether the rows fit the limit.')))
    ],
    check: [
      q('Which entry belongs in the right column beside “phone down”?', 'The sound it makes on the table.', [['A wide picture of the table.', 'A picture goes on the left.'], ['A note to film outside.', 'The right column says what the viewer hears.']], 'The right column holds the matching sound.', script),
      q('What holds several main story turns in a paragraph?', 'A treatment', [['A concept only', 'The concept is the core idea.'], ['A single logline', 'A logline is one sentence.']], 'A treatment develops the main events without listing every shot.'),
      q('You need to plan exact picture and sound together. Which document fits?', 'A two-column script', [['A logline', 'One sentence cannot specify each shot and cue.'], ['A crew release form', 'A release handles permission, a different job.']], 'The two columns connect what people see and hear.')
    ],
    remember: ['Pitch the [[concept]] with a quick [[logline]].', 'Use a [[treatment]] to lay out the main changes.', 'Write a [[two-column script]] to line up the picture with the sound.'],
    realCameraTitle: 'Try it', realCamera: 'Write a logline and a six-row script for a 30-second video. Mark the seconds in each picture row.',
    notes: { sketch: 'Draw two columns and write two rows for your opening.', frames: 1, frameLabels: ['Picture and sound'], think: 'What could your sound recordist miss if everyone works from the logline alone?' }
  });
})();
