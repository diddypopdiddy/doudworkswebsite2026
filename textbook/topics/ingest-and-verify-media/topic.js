(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const bird = card('Ingest check', 'Camera card shows 18 clips. The copy in Source shows 17 clips.', [['Memory card', '18 clips'], ['Source folder', '17 clips']]);
  const names = ['01_Hall.mp4', '02_Table.mp4', '03_Note.mp4'];
  const source = 'This PC > The Note > Source';
  const cardPath = 'Camera Card > Clips';
  const allCopied = s => names.every(name => s.locate(source + ' > Clips > ' + name) || s.locate(source + ' > ' + name));
  const fs = {
    drives: [
      { id: 'pc', label: 'This PC', children: [{ name: 'The Note', folder: true, children: [{ name: 'Source', folder: true, children: [] }] }] },
      { id: 'card', label: 'Camera Card', children: [{ name: 'Clips', folder: true, children:
        ['p8-note-hall', 'p8-note-wide', 'p8-note-detail'].map((media, i) => ({ name: names[i], media }))
      }] }
    ]
  };
  T.topic({
    slug: 'ingest-and-verify-media', minutes: 12, bigIdea: 'Copy the card to your project folder and check every clip before you erase anything.',
    hook: hook(bird, 'The card has 18 clips and the copy has 17. Is it safe to clear the card?', ['Yes', 'Wait and check the copy'], 1, 'One clip is missing from Source. To [[verify]] the [[ingest]], match the counts and play the copies before you [[format a card]].'),
    vocab: ['ingest', 'verify', 'format-a-card'], review: ['memory-card', 'source-media', 'copy'],
    objectives: ['Copy and count clips as part of ingest.', 'Verify playback before you clear a camera card.'],
    sections: [
      teach('Make a copy you can trust', 'Put camera files in the project’s Source folder while the card still holds all the originals.',
        '<p>[[Ingest]] means bringing the recorded files into your project. [[Copy]] the entire camera folder first. Compare the count on both drives and open each copied clip.</p><p>To [[verify]] a copy, check for a full picture and the expected sound. Wait for a second backup before you [[format a card]].</p>',
        { type: 'steps', items: ['Find the camera card and the project’s Source folder.', 'Copy the card folder into Source.', 'Compare the counts and play every copied clip.', 'Make a backup before using the card again.'] },
        { type: 'callout', kind: 'mistake', html: 'Formatting clears the card. Ask the teacher before formatting a shared card.' }),
      practice('Practice: ingest The Note', 'Use the Camera Card and This PC drives. Copy the Clips folder, open it in Source, then preview each copy.',
        { type: 'desktop-sim', fs, tasks: [
          { text: 'Open Clips on the Camera Card and count three files.', check: s => s.path.join(' > ') === cardPath && s.count === 3, sticky: true },
          { text: 'Copy all three clips into Source.', check: allCopied },
          { text: 'Open and preview each copy in Source.', check: s => names.every(name => s.previewed.some(path => path === source + ' > Clips > ' + name || path === source + ' > ' + name)) }
        ] })
    ],
    check: [
      q('What would you do next?', 'Find the missing clip, copy it and test playback.', [['Clear the card', 'The folders have different counts.'], ['Trust the longer list', 'The short copy is the problem to fix.']], 'The count difference tells you the ingest is incomplete.', bird),
      q('Both counts match but clip 03 won’t open. What should you do?', 'Copy clip 03 again from the card and check it.', [['Clear the card', 'Matching counts tell you the file exists, but not that it works.'], ['Rename the file', 'The check failed when the editor opened the copy.']], 'Playback is part of verification.'),
      q('Why use Copy instead of Move when you ingest?', 'The original stays on the camera card.', [['It makes the video sharper', 'Copy keeps the same data.'], ['It renames the clips', 'The operation controls where the files stay.']], 'You can recover a failed copy from the original.')
    ],
    remember: ['Keep the originals during [[ingest]].', '[[Verify]] the count and play each copied clip.', 'Make a backup before you [[format a card]].'],
    realCameraTitle: 'Try it', realCamera: 'Use the four-step ingest checklist on your next shoot. Keep the camera card intact until your teacher checks the backup.',
    notes: { sketch: 'Draw two drives and the direction the clips travel.', frames: 2, frameLabels: ['Card', 'Source'], think: 'Why isn’t a matching clip count enough to clear the card?' }
  });
})();
