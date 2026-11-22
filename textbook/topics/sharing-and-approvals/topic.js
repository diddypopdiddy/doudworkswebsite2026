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

  const inbox = card('Project message', 'The teacher says classroom review is complete. Public posting will be checked tomorrow. The selected setting is Public.', [['Teacher message', 'Classroom review done', 'Public review tomorrow'], ['Account dialog', 'Selected: Public']]);
  T.topic({
    slug: 'sharing-and-approvals', minutes: 10,
    hook: hook(inbox, 'Is this ready to publish to the public school page?', ['Wait for public approval.', 'Publish as soon as the classroom review finishes.'], 0, 'The message approves classroom review and says public review is pending. [[Approval]] must match the planned audience.'),
    vocab: ['approval', 'platform', 'privacy-setting'], review: ['release-form'],
    objectives: ['Identify who approves a school project for its planned audience.', 'Choose a privacy setting that matches the approval and test access.'],
    sections: [
      teach('Match the approval to the audience', 'Check which version, place and audience the approval actually covers.',
        '<p>[[Approval]] is permission to share a certain version in a certain way. A [[platform]] is where people will view it. A [[privacy setting]] controls which viewers can open it.</p><p>For school work, ask the teacher which account, settings and release rules apply. An unlisted link can still be forwarded.</p>', figure(inbox, 'A classroom approval and a public approval cover different uses.'),
        { type: 'steps', items: ['Identify the teacher or person who approves this destination.', 'Show the actual final file and check releases.', 'Use the approved platform and audience setting.', 'Test that a permitted viewer can open the shared copy.'] }),
      practice('Practice: who approves the share?', 'Read the status before you choose the setting.', quiz(
        q('The teacher has approved an in-class showing. What is the next action before posting publicly?', 'Get approval for that specific destination and check permission again.', [['Post as unlisted and send it to everyone.', 'A link can reach people beyond the class.'], ['Assume the classroom approval covers it.', 'The audiences differ.']], 'The planned audience changed.'),
        q('A teacher approves the class folder and the invited class accounts. Which setting fits?', 'Only the invited class accounts can view.', [['Anyone with the link can view.', 'The link can be passed on.'], ['Public search and viewing.', 'The approval names invited viewers.']], 'Match the audience control to the exact approval.'),
        q('You edit a name and a quote after approval. Which file should you send for the final check?', 'The revised version that you plan to share.', [['The approved earlier file.', 'The audience will see the changed version.'], ['Only a screenshot of the title.', 'The reviewer should hear the revised quote too.']], 'Check the version that will actually go out.')))
    ],
    check: [
      q('Which word tells you public sharing is still pending?', 'Tomorrow', [['Classroom', 'Classroom describes the completed review.'], ['Public in the dialog', 'The dialog shows a setting, not permission to use it.']], 'The message says the public review has not happened.', inbox),
      q('What would you test after sharing with invited class accounts?', 'A permitted viewer can open and play the right file.', [['Whether the project filename exists on your laptop.', 'The other viewer needs access to the shared copy.'], ['Whether a public viewer can download it.', 'The approved audience is restricted.']], 'Test as the intended viewer.'),
      q('What should you do if you are unsure who approves the post?', 'Ask your teacher before sharing.', [['Upload and ask later.', 'Sharing already gives access away.'], ['Switch accounts to avoid the approval.', 'The school’s audience rules still apply.']], 'Verify the responsible person before opening access.')
    ],
    remember: ['Get [[approval]] for the version and audience you will share.', 'Use the school’s approved [[platform]].', 'Match and test the [[privacy setting]].'],
    realCameraTitle: 'Try it', realCamera: 'Find the audience setting on a draft in your school account. Write down who could view it. Leave the draft unpublished.',
    notes: { sketch: 'Draw a teacher approval, an audience setting and a test viewer. Connect them to the same export.', frames: 1, frameLabels: ['Sharing check'], think: 'Why might an unlisted link reach more viewers than you expected?' }
  });
})();
