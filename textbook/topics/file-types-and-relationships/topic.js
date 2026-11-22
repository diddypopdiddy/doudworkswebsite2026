(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const figure = (picture, caption) => ({ type: 'figure', ...picture, caption });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const icons = card('Downloads', 'Three icons: Note.mp4, Room.wav and Poster.jpg.', [
    ['Note.mp4', 'Video'], ['Room.wav', 'Audio'], ['Poster.jpg', 'Image']
  ]);
  const sorter = {
    type: 'sorter', groups: ['Video', 'Audio', 'Image', 'Project'], prompt: 'Sort these files before you edit.',
    items: [
      { text: 'Hall.mov', group: 0, why: 'MOV is a video container here.', clue: 'Look at the three characters after the dot.' },
      { text: 'Slate.wav', group: 1, why: 'WAV stores recorded sound.', clue: 'Which extension belongs to the recorder?' },
      { text: 'Title.png', group: 2, why: 'PNG is a still image.', clue: 'A PNG has pixels, but no running time.' },
      { text: 'Note.drp', group: 3, why: 'A Resolve project export stores editing instructions.', clue: 'This is the editor’s own project extension.' },
      { text: 'Final.mp4', group: 0, why: 'An export can be a video file too.', clue: 'Look at the extension rather than the name.' }
    ]
  };
  T.topic({
    slug: 'file-types-and-relationships', minutes: 10,
    bigIdea: 'Video, audio, images and projects are different kinds of files.',
    hook: hook({ ...icons }, 'Which file normally plays sound only?', ['Note.mp4', 'Room.wav', 'Poster.jpg'], 1, 'Room.wav has the .wav [[file extension]]. A recorder can make this kind of [[audio file]] without a picture.'),
    vocab: ['file-extension', 'video-file', 'audio-file', 'image-file'], review: ['project-file'],
    objectives: ['Sort media by the extension at the end of its name.', 'Distinguish media from the editor’s project file.'],
    sections: [
      teach('Read the ending', 'The part after the dot is a clue to what a file contains.',
        '<p>A [[file extension]] follows the last dot in the name. Here, .mp4 is a [[video file]], .wav is an [[audio file]], and .jpg is an [[image file]].</p><p>A [[project file]] keeps the editor’s decisions and links to the source clips. A final export plays on its own.</p>',
        figure(icons, 'The extension, rather than the icon color, tells these files apart.')),
      practice('Practice: sort the project folder', 'Find the file type before you choose where it belongs.', sorter),
      practice('Practice: show the extensions', 'New Windows computers hide the part after the dot. Turn it on, then sort a real folder.',
        { type: 'desktop-sim', extensions: false, open: 'Downloads', view: 'large',
          downloads: [{ name: 'Note.mp4', media: 'p8-note-wide' }, 'Room.wav', { name: 'Poster.jpg', media: 'p4-hard-edge' }, { name: 'Hall.mov', media: 'p8-note-hall' }, 'Title.png', 'Note.drp', 'Final.mp4'],
          tasks: [
            { text: 'Two files look like they are both called Note. Turn on extensions: **View > Show > File name extensions**.', check: s => s.extensions },
            { text: 'Switch to **Details** view, then click the **Type** column heading to sort by type.', check: s => s.did('view', 'details') && s.did('sort', 'type') },
            { text: 'Make a folder named Audio and move Room.wav into it.', check: s => s.exists('Downloads > Audio > Room.wav') },
            { text: 'Try renaming Poster.jpg to Poster.mp4. Read the warning, then choose **No**.', check: s => s.did('extension-warning') && s.exists('Downloads > Poster.jpg'), hint: 'Select Poster.jpg, press F2, change jpg to mp4 and press Enter.' }
          ] })
    ],
    check: [
      q('Which file would you import to play the room sound?', 'Room.wav', [['Note.mp4', 'The MP4 includes a moving picture.'], ['Poster.jpg', 'A JPG is a still picture.']], 'The WAV extension points to audio.', icons),
      q('Which item stores your choices about what comes first?', 'The project file', [['The WAV file', 'The recorder stores sound.'], ['The JPG file', 'A still stores one picture.']], 'The project file holds your editing plan.'),
      q('What happens if you rename Door.jpg to Door.mp4?', 'The name changes. The data stays an image.', [['It becomes a video', 'The filename does not change the picture data.'], ['The editor makes a clip for you', 'Creating video takes an export or a conversion.']], 'Changing an extension does not convert a file.')
    ],
    remember: ['Read the [[file extension]] before you sort.', 'An [[image file]] holds a still. An [[audio file]] holds sound.', 'Keep the [[project file]] with its linked media.'],
    realCameraTitle: 'Try it', realCamera: 'Find three different extensions in your Downloads folder. Name the type of media each suggests.',
    notes: { sketch: 'Draw icons for one moving image, one sound recording and one still. Write a filename under each.', frames: 3, frameLabels: ['Video', 'Audio', 'Image'], think: 'Why can’t a project file take the place of its original clips?' }
  });
})();
