(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const risk = card('If the laptop is lost', 'One project copy on the laptop. The USB case is empty and no school cloud backup exists.', [['Laptop', 'Project and media'], ['USB', 'Empty'], ['School cloud', 'No project copy']]);
  const plan = card('A 3-2-1 plan', 'Three complete copies: working laptop, external drive, and approved school cloud storage.', [['Working', 'Laptop'], ['Local copy', 'External drive'], ['Off-site copy', 'School cloud']]);
  T.topic({
    slug: 'backup-and-handoff', minutes: 10,
    hook: hook(risk, 'What complete copy remains if the laptop is lost?', ['None', 'The empty USB drive', 'The school cloud copy'], 0, 'The only complete copy is on the laptop. A [[backup]] gives you a way to recover the timeline and its sources.'),
    vocab: ['backup', 'three-two-one-rule'], review: ['handoff', 'file-sync', 'source-media'],
    objectives: ['Identify which copies meet the 3-2-1 backup rule.', 'Plan a handoff a teammate can open and verify.'],
    sections: [
      teach('Keep a copy you can recover', 'One failed device should leave a complete version elsewhere.',
        '<p>A [[backup]] is a separate recoverable copy. The [[3-2-1 rule|three-two-one-rule]] calls for three copies, on two kinds of storage, with one off-site.</p><p>For a [[handoff]], include the original media, latest project version, export and a short note about what to open. Test a copy on a second computer or account.</p>',
        figure(plan, 'An approved school storage service can hold the off-site copy.'),
        { type: 'callout', kind: 'mistake', html: '[[File sync]] can mirror a deletion. Check whether you can actually restore a previous version.' }),
      practice('Practice: check the backup plan', 'Sort each plan by what survives a lost device or a lost room.', { type: 'sorter', groups: ['Fits 3-2-1', 'Needs another copy or location'], items: [
        { text: 'Laptop plus copied USB drive plus separately recoverable school cloud copy.', group: 0, why: 'It has three copies, different places to store them, and one off-site.', clue: 'Count complete copies and find the off-site one.' },
        { text: 'Three folders on one laptop drive.', group: 1, why: 'One failed laptop can remove all three folders.', clue: 'Look at the device that holds every folder.' },
        { text: 'Laptop plus two USB drives stored in the same classroom.', group: 1, why: 'All copies are in the same room.', clue: 'Where would a copy survive a room-wide loss?' },
        { text: 'Working desktop, an external disk and a verified cloud restore.', group: 0, why: 'All three copies were made and the off-site one can be recovered.', clue: 'The last copy has been tested.' },
        { text: 'A final MP4 on the laptop and a link to that same file.', group: 1, why: 'The project and source files are missing from the backup.', clue: 'Ask what the next editor needs to reopen.' }
      ] })
    ],
    check: [
      q('Which change adds a copy that survives if the laptop is lost?', 'Make a separate copy to the external drive and check it opens.', [['Make another folder on the same laptop.', 'The whole device is at risk.'], ['Move all files into the Downloads folder.', 'That is still on the laptop.']], 'A separate device can still be read.', risk),
      q('What must one of the three copies be?', 'Off-site', [['A shortcut to the working folder.', 'A shortcut is not another copy.'], ['A file you never check.', 'An unreadable file cannot help you recover.']], 'A separate place helps if all copies in the room are damaged.'),
      q('What should a second person try before accepting a handoff?', 'Open the named project and play a linked clip.', [['Count only the thumbnails.', 'A thumbnail may exist even if its source is missing.'], ['Delete the working copy first.', 'Verify the recovery path before any cleanup.']], 'Opening the project and media confirms the copy is usable.')
    ],
    remember: ['Make a [[backup]] that the crew can restore.', 'Use the [[3-2-1 rule|three-two-one-rule]] to plan independent copies.', 'Document what to open for the [[handoff]].'],
    realCameraTitle: 'Try it', realCamera: 'Write the three storage locations for one complete project. Test whether a partner can open one backup without your main drive.',
    notes: { sketch: 'Draw the working copy and two backups. Label the one saved off-site.', frames: 1, frameLabels: ['Copy map'], think: 'Why are three folders on one laptop a weak backup plan?' }
  });
})();
