(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const offline = card('Media offline', 'An offline clip named Note.mov. The project expects it in The Note / Source; a drive now shows it in Moved clips.', [
    ['Project expects', 'Source / Note.mov'], ['File now in', 'Moved clips', 'Note.mov']
  ]);
  const fs = {
    documents: [
      { name: 'The Note', children: [{ name: 'Source', children: [] }, { name: 'Project', children: ['TheNote_edit.prproj'] }] },
      { name: 'Moved clips', children: [{ name: 'Note.mov', media: 'p8-note-medium' }, { name: 'Note_backup.mov', media: 'p8-note-medium', meta: { duration: 4 } }] }
    ],
    open: 'Documents > The Note > Source'
  };
  const target = 'Documents > Moved clips > Note.mov';
  T.topic({
    slug: 'restore-and-relink-media', minutes: 12, bigIdea: 'Moved files break the project; relink to fix them.',
    hook: hook(offline, 'Which file should you point the project to first?', ['Note.mov in Moved clips', 'The empty Source folder', 'Any file with .mov'], 0, 'The same Note.mov exists at a new address. [[Relink]] tells the project where to find that [[missing file]].'),
    vocab: ['offline-media', 'relink', 'missing-file'], review: ['file-path', 'project-file', 'source-media'],
    objectives: ['Find the same source clip at its new location.', 'Explain how to relink and verify that the edit uses the right media.'],
    sections: [
      teach('Follow the file', 'An editor may show a red Media Offline frame even though the timeline cuts are still there.',
        '<p>[[Offline media]] means the editor cannot read a needed source. A [[missing file]] may have moved, changed names or been on a drive you unplugged.</p><p>Check the drive and the old [[file path]]. To [[relink]], choose the original clip at its new location. Play across the repaired cut and check the picture and sound.</p>',
        figure(offline, 'The file contents can be intact at a different address.'),
        { type: 'callout', kind: 'try', html: 'Keep the project and its sources together so a folder move is easier to fix.', link: { href: '../../topics/organize-source-project-and-export-files/index.html', label: 'Review how to organize project files' } }),
      practice('Practice: locate a missing source', 'Find and preview Note.mov. Then choose the relink steps you would take in the editor.',
        Object.assign({ type: 'desktop-sim', tasks: [
          { text: 'Source is empty. Search Documents for Note.mov to find where it went.', check: s => s.searched(target) },
          { text: 'Open the folder that holds it: right-click Note.mov in the results and choose **Open file location**.', check: s => s.opened('Documents > Moved clips') },
          { text: 'Compare the two files. Turn on the **Details pane** and check each Length, then play Note.mov.', check: s => s.did('pane', e => e.detail === 'details' && e.on) && s.previewed(target) },
          { text: 'Move Note.mov back into The Note > Source, where the project expects it.', check: s => s.movedTo('Documents > The Note > Source > Note.mov') }
        ] }, fs),
        { type: 'quiz', items: [
          q('The project asks for Note.mov. Two files look similar. What do you check?', 'The filename, duration and first frames against the original.', [['Only the extension.', 'Both names may have the same ending.'], ['Only which one is newest.', 'A duplicate may have a newer date.']], 'Confirm that it is the source your cuts were made from.'),
          q('After locating the source, which command points the project to it?', 'Relink or locate media', [['Delete clip', 'That would remove an edit.'], ['Export project', 'Export does not update the clip’s path.']], 'Relink changes the saved source location.'),
          q('After relinking, how do you check that it worked?', 'Play across the cut and check the image and sound.', [['Close the project as soon as red disappears.', 'Another file could have the same name.'], ['Rename the project file.', 'The project name does not verify the source.']], 'The repaired timeline should play the expected frames and sound.')
        ] })
    ],
    check: [
      q('What caused this clip to be offline?', 'The source moved to a different folder.', [['The project forgot every edit.', 'The example shows the missing media path.'], ['The clip needs a new frame rate.', 'The filename still exists at a new location.']], 'The project is still looking at the old address.', offline),
      q('What should you check if every clip on one external drive goes offline?', 'Whether the drive is connected.', [['Whether the viewer zoom is high.', 'Zoom does not affect the media path.'], ['Whether the title font is installed.', 'All the missing clips belonged to one drive.']], 'Reconnect the drive and see whether the files become available.'),
      q('Why use the original rather than a similar-looking replacement?', 'The existing edits refer to exact moments in the original.', [['The editor can only use one extension.', 'Different files may share an extension.'], ['The replacement will always have no sound.', 'You need the original timing and content.']], 'A replacement may change which moments the cut shows.')
    ],
    remember: ['[[Offline media]] means the timeline cannot read a source.', 'Find the original [[missing file]] and confirm its identity.', '[[Relink]] to its location and play the repaired edit.'],
    realCameraTitle: 'Try it', realCamera: 'With a copy of a practice project, move one clip and open the project. Find the original clip and relink it.',
    notes: { sketch: 'Draw the old and new paths. Mark which one the project should use.', frames: 2, frameLabels: ['Before', 'Relinked'], think: 'Which clue tells you whether the file is missing or the whole drive is absent?' }
  });
})();
