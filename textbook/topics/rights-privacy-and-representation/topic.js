(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const caseCard = card('A public upload?', 'A school Profile contains a hit single and a recognisable person filmed in the hall. Permissions have not been checked.', [['Soundtrack', 'Popular song', 'Use unchecked'], ['Hall footage', 'Recognisable face', 'Consent unclear']]);
  const release = card('Sample permission record', 'Written permission records who, where the video may appear, for what purpose and who approved it.', [['Person', 'Name and role'], ['Use', 'Audience and place'], ['Approval', 'Signature and date']]);
  const use = (text, group, why, clue) => ({ text, group, why, clue });
  T.topic({
    slug: 'rights-privacy-and-representation', minutes: 15,
    hook: hook(caseCard, 'What should the team do before a public upload?', ['Check the song and permission for the image.', 'Post it because it was made at school.'], 0, 'The song and the image raise different questions. Check [[copyright]] for the music, and check the school’s permissions for who appears.'),
    vocab: ['fair-use', 'release-form', 'representation'], review: ['copyright'],
    objectives: ['Distinguish clearance for a song from consent to appear in a video.', 'Choose a fair and school-approved way to use or revise footage.'],
    sections: [
      teach('Check the materials and the people', 'Find out which uses have permission before you share.',
        '<p>[[Copyright]] gives creators certain rights over their work. For music, check whether your planned use is licensed. U.S. [[fair use]] looks at purpose, the work’s nature, how much you use, and the effect on its market. Ask your teacher before relying on it.</p><p>A [[release form]] is a record of permission for a use. Follow your school’s approved form and rules. Good [[representation]] means your edit shows people fairly and keeps their meaning in context.</p><p><a href="https://www.copyright.gov/fair-use/more-info.html">Read about fair use at the U.S. Copyright Office</a>.</p>',
        figure(release, 'Fictional example. Use your school’s approved form for real recordings.'),
        { type: 'callout', kind: 'consider', html: 'If you shorten an interview quote, listen to the whole answer again. A short cut should preserve what the person meant.' }),
      practice('Practice: share, revise or ask', 'Use the facts in each fictional school scenario.', { type: 'sorter',
        groups: ['Cleared for the planned use', 'Revise first', 'Ask and verify'],
        items: [
          use('Your own music is approved in the school upload.', 0, 'You have permission for this specific use.', 'Identify who made it and what was approved.'),
          use('A signed classroom-only release is on file. You plan a public upload.', 2, 'The new audience needs its own permission check.', 'Compare the approved audience with the planned one.'),
          use('An edit drops “not” and reverses the interviewee’s statement.', 1, 'Restore the meaning before sharing.', 'Compare the quote with the full answer.'),
          use('A teacher approved a licensed sound effect for this school site.', 0, 'The license and school approval cover the destination.', 'Look at the exact use the license covers.'),
          use('The only evidence for music clearance is “I’ll put the artist’s name in the credits.”', 2, 'Attribution and permission are separate.', 'Is there a license for the recording?'),
          use('A close-up shows a student’s phone number on the library sign-up sheet.', 1, 'Remove or obscure the personal information before sharing.', 'Check the frame for information that is not part of the story.'),
          use('A song clip is included for a critique. The crew is unsure whether fair use applies.', 2, 'Ask the teacher to examine the purpose and other factors.', 'The purpose is one part of a case-by-case review.'),
          use('A school-approved release covers this interview and its planned audience.', 0, 'The approved use matches the plan.', 'Check who, purpose and destination.')
        ] })
    ],
    check: [
      q('Which facts should the crew verify first?', 'Music use rights and permission to show the person.', [['The editor’s folder names.', 'The question is about public use.'], ['Only the closing credits.', 'Credit alone does not establish permission.']], 'There are separate checks for the work and the people.', caseCard),
      q('What should you do if a cut changes a speaker’s meaning?', 'Restore the context or choose another accurate excerpt.', [['Use the new meaning if it is more exciting.', 'The edit would misrepresent the speaker.'], ['Turn the sound down to hide it.', 'The caption can still carry the wrong meaning.']], 'Represent the speaker’s actual point.'),
      q('Why check the destination on a release?', 'Its permission may cover only a specific audience or use.', [['All audiences are included automatically.', 'Read the scope of the actual release.'], ['The form sets the camera format.', 'The form records consent, not recording settings.']], 'A classroom screening and a public site can have different permissions.')
    ],
    remember: ['Check [[copyright]] and ask about [[fair use]] before you rely on it.', 'Check what a [[release form]] actually allows.', 'Check your [[representation]] against the original context.'],
    realCameraTitle: 'Try it', realCamera: 'Before your next interview, ask the teacher which release applies. Match the permission to the audience you plan to share with.',
    notes: { sketch: 'Draw one box for the music check and one for the permission to appear. Add a destination under both.', frames: 2, frameLabels: ['Media rights', 'People and privacy'], think: 'Why does a school screening permission need a fresh check before a public upload?' }
  });
})();
