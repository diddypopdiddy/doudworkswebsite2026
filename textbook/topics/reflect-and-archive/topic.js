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

  const choices = card('A year later', 'A folder is named Old stuff and contains Final.mp4. Another folder is named Profile_2026 and includes the edit, source files and delivery notes.', [['A · Old stuff', 'Final.mp4'], ['B · Profile_2026', 'Project and sources', 'Exports and notes']]);
  T.topic({
    slug: 'reflect-and-archive', minutes: 10,
    hook: hook(choices, 'Which folder gives the next editor enough to make a new cut?', ['A', 'B'], 1, 'B names the project and keeps its sources. A complete [[archive]] lets you find and reopen the edit later.'),
    vocab: ['reflection', 'archive', 'portfolio'], review: ['project-file', 'source-media', 'export'],
    objectives: ['Identify the files that belong in a complete archive.', 'Write a reflection that connects an editing choice to evidence and a next step.'],
    sections: [
      teach('Record what changed and why', 'Use a specific shot, note or revision as evidence of what you learned.',
        '<p>A [[reflection]] describes a choice, the result and what you would try later. A [[portfolio]] shares the work you choose to show, with permission and a short description of your part.</p><p>For the Profile, name the moment you removed extra waiting and explain what that did for the viewer.</p>',
        figure(choices, 'A finished export can go in a portfolio. An archive keeps what the edit needs.')),
      teach('Keep the project findable', 'Preserve the version, files, approvals and key decisions together.',
        '<p>An [[archive]] is a saved project package for later recovery. Keep the named [[project file]], [[source media]], final [[export]] and approved caption or permission records together. Keep private records in the school’s approved location.</p><p><a href="../../topics/organize-source-project-and-export-files/index.html">Review how to organize project files.</a></p>',
        { type: 'steps', items: ['Check that the named edit opens with its sources.', 'Save the final version and approved export.', 'Include a short readme and keep permission records secure.', 'Write a reflection and select one approved portfolio example.'] }),
      practice('Practice: make it useful later', 'Choose what a returning editor or portfolio reader needs.', quiz(
        q('Which evidence makes “I improved the opening” more useful?', 'I removed four seconds of waiting so the answer starts at 0:03.', [['It was much better.', 'That gives no visible change.'], ['I renamed the exports folder.', 'What did the viewer experience differently?']], 'A timestamp and change let someone confirm the learning.'),
        q('You want to change a title next semester. What should the archive contain?', 'The editable project, linked sources and notes about the fonts.', [['Only the final MP4.', 'The old title is already part of the flat export.'], ['Only a screenshot of the timeline.', 'The editor needs the working files.']], 'Save what lets you open and edit the title.'),
        q('What should accompany a portfolio clip?', 'Permission for the planned view and a note about your role.', [['The classmate’s private contact information.', 'The portfolio viewer needs the work and context.'], ['Every rejected take.', 'Choose a piece that shows what you learned.']], 'Use an approved clip and explain what you did.')))
    ],
    check: [
      q('Why can B be reopened for edits?', 'It has the project and its linked sources.', [['It has a year in the title.', 'A clear title helps you find it but does not supply the media.'], ['It has a different folder color.', 'The contents are what matter.']], 'The editor can read the saved decisions and footage.', choices),
      q('What makes a next step in a reflection useful?', 'It names a different choice you can try on the next project.', [['It only says “get better.”', 'Name a choice you can make and check.'], ['It lists the project file extension.', 'An extension does not describe what you learned.']], 'A concrete next action gives you a way to improve.'),
      q('What belongs in a portfolio review before posting?', 'Whether the clip is approved for that audience.', [['Every teacher note from the archive.', 'Private notes remain where the school keeps them.'], ['The largest available file.', 'Choose a format the viewer can access.']], 'Only share what is cleared for the intended viewer.')
    ],
    remember: ['Use a [[reflection]] to connect a choice with a result.', 'Keep a recoverable [[archive]] with project and source files.', 'Choose approved work for your [[portfolio]] and explain your role.'],
    realCameraTitle: 'Try it', realCamera: 'Write a five-sentence reflection about the Profile. Save it with a named archive and choose one approved version for a portfolio.',
    notes: { sketch: 'Draw an archive folder tree. Circle the export you would choose for a portfolio.', frames: 1, frameLabels: ['Archive'], think: 'Which decision would you want to remember when you open this project a year later?' }
  });
})();
