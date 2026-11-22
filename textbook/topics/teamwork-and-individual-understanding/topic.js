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

  const one = card('Waiting on set', 'The director has the only copy of the script and list. The camera operator and sound recordist have no copy.', [['Director', 'Script + shot list'], ['Camera', 'No plan copy'], ['Sound', 'No plan copy']]);
  const crew = { media: 'p7-set-roles' };
  T.topic({
    slug: 'teamwork-and-individual-understanding', minutes: 10,
    hook: hook(one, 'The only person with the script is absent. Which task is in trouble?', ['The whole crew’s ability to start the planned shots.', 'Only the job of holding the camera.'], 0, 'Everyone needs details from the script. A [[crew]] shares the plan even when each person has a different [[role]].'),
    vocab: ['crew', 'role', 'collaboration', 'accountability'],
    objectives: ['Match a crew role to what the person checks before a take.', 'Choose an agreement that lets each crew member work from the same plan.'],
    sections: [
      teach('Know your own job and the whole plan', 'A small crew can trade jobs. Everyone can still explain what the next shot is for.',
        '<p>A [[role]] is one job, like camera or sound. A [[crew]] is the group making the video. On a three-person crew, assign one person to watch and name changes in the plan.</p>',
        { type: 'hotspots', ...crew, points: [
          { x: 16, y: 41, label: 'Director', text: 'Checks that the action tells the story and calls the next shot.' },
          { x: 46, y: 51, label: 'Camera', text: 'Checks the frame and focus, then records the full action.' },
          { x: 89, y: 42, label: 'Sound', text: 'Checks the level and headphones, then listens for mistakes.' }
        ] }),
      teach('Agree on what happens next', 'Write down who does what, when it is due and where to find it.',
        '<p>[[Collaboration]] means working together around the same goal. [[Accountability]] means each person can show what they did and check their part.</p><p>Sample agreement: One shared script. The camera operator numbers each take. The sound recordist confirms it recorded. The whole group checks one take before moving on.</p>', figure({ media: 'p2-shared-script' }, 'Save the shared script where every crew member can open it.')),
      practice('Practice: solve a team problem', 'Choose a specific action that a second crew member can check.',
        quiz(
          q('The camera operator leaves early. How can the next person finish the setup?', 'Read the shared shot and settings notes and confirm the next shot.', [['Guess from the last clip.', 'The last clip may be only a test.'], ['Wait without telling anyone.', 'Somebody else can check the plan.']], 'Shared information lets the next person continue the job.'),
          q('The speaker and camera disagree about the plan. What do you do first?', 'Read the line together and agree on what the viewer needs to see.', [['Record two unrelated takes at once.', 'That creates two different plans.'], ['Let the camera operator leave.', 'The crew needs a shared choice.']], 'Return to the same script and purpose.'),
          q('Three files have the same name. Who should log the usable take?', 'Assign a person to record the shot and take number when you check playback.', [['Everyone assumes someone logged it.', 'No record is created.'], ['Only let the editor guess later.', 'The crew has the evidence now.']], 'Give that task an owner and check it together.'),
          q('One person does all the editing. What does each teammate still need to know?', 'How their material supports the message and where it lives.', [['Only their name in the credits.', 'Their job included choices that matter.'], ['Every editing shortcut.', 'The whole plan matters even if jobs differ.']], 'Everybody can explain the plan without holding every role.')))
    ],
    check: [
      q('Which role mainly listens for unwanted sound before moving on?', 'Sound', [['Camera', 'Camera concentrates on frame and focus.'], ['Director', 'The director uses sound feedback to choose a take.']], 'The sound role monitors what the microphone records.', crew),
      q('Which agreement supports accountability?', 'The named person records each usable take number in the shared log.', [['Someone should keep track of it.', 'No one knows who is responsible.'], ['Decide who recorded it after editing.', 'The crew has that information during the shoot.']], 'A specific person and record make the task verifiable.'),
      q('What should everyone be able to explain even if only one person holds the camera?', 'Who will watch, what the video should do and what the next shot adds.', [['Only the settings on the camera.', 'The video has a shared audience and purpose.'], ['Only their name and title.', 'Knowing a role alone does not explain the plan.']], 'The crew shares one plan and different jobs.')
    ],
    remember: ['A [[crew]] uses one shared plan.', 'Make each [[role]] and handoff clear.', 'Use [[collaboration]] to solve problems and [[accountability]] to make a record of each job.'],
    realCameraTitle: 'Try it', realCamera: 'Write a team agreement with roles, one deadline and a way to settle a question on set.',
    notes: { sketch: 'Draw three crew roles around the same script. Write each person’s first check.', frames: 1, frameLabels: ['Shared plan'], think: 'What should another crew member be able to do if you are absent?' }
  });
})();
