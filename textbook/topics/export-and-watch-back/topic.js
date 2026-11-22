(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const card = (title, alt, rows) => ({ svg: D.editCards(title, rows), alt });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const quiz = (...items) => ({ type: 'quiz', items });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });

  const screen = card('Export Profile', 'Title Profile_v04. MP4 with H.264 video, 1920 by 1080, 8 megabits per second. Export location is Exports.', [['File', 'Profile_v04.mp4', 'Folder: Exports'], ['Video', 'H.264 · 1080p', '8 megabits/sec']]);
  const sizes = card('Posting limit: 150 MB', 'A: 4 GB master. B: 90 MB captioned MP4.', [['A · Master', '4 GB'], ['B · Class site', '90 MB', 'Captioned MP4']]);
  T.topic({
    slug: 'export-and-watch-back', minutes: 12,
    hook: hook(sizes, 'Which file fits under the school site’s 150 MB limit?', ['A · 4 GB master', 'B · 90 MB MP4'], 1, 'B is under the limit. Use [[export settings]] to fit the way the file will be delivered.'),
    vocab: ['export-settings', 'format', 'bitrate'], review: ['export', 'codec', 'resolution', 'file-size'],
    objectives: ['Select a format, resolution and bitrate based on the destination.', 'Watch the actual export and check it against the brief before sharing.'],
    sections: [
      teach('Read the export panel', 'Start with the destination’s size, format and caption requirements.',
        '<p>[[Export settings]] control the new video file. Its [[format]] can be MP4 with a video [[codec]] like H.264. Its [[resolution]] sets the pixel width and height.</p><p>[[Bitrate]] is how much data you spend per second. With similar settings, more bits per second usually make a larger file.</p>',
        { type: 'hotspots', ...screen, points: [
          { x: 23, y: 46, label: 'File name and folder', text: 'Write the version and save it in Exports so you can find it.' },
          { x: 70, y: 56, label: 'Format and resolution', text: 'Check whether the destination accepts the container and codec.' },
          { x: 69, y: 70, label: 'Bitrate', text: 'Check the estimated size against the limit and play the finished file.' }
        ] }),
      teach('Watch the file that you will send', 'Playback can catch a missing title, a muted track or a broken last frame.',
        '<p>Open the actual [[export]] in a player. Check beginning and end, caption accuracy, picture and clear audio. Then confirm the file name, size and upload destination.</p>',
        { type: 'steps', items: ['Verify the file’s name, format, size and run time.', 'Watch once at normal speed. Listen to the mix.', 'Check captions with sound off.', 'Confirm the delivery version before sharing.'] }),
      practice('Practice: choose settings', 'Use the needs named in the brief.', quiz(
        q('The class site allows MP4 under 150 MB. Which option meets both?', 'The 90 MB H.264 MP4', [['A 4 GB master with no MP4 copy', 'Compare the stated limit to the file size.'], ['A picture file under 150 MB', 'The assignment asks for a playable video file.']], 'MP4 and 90 MB both meet the listed limit.'),
        q('The auditorium wants a 1080p file on a fast drive. What do you check?', 'The delivery format, then playback on the venue screen and speakers.', [['Use the smallest phone version automatically.', 'The room has a large screen. Test whether the file looks and sounds right there.'], ['Raise the bitrate past what the drive or player can handle.', 'The file still needs to play reliably.']], 'Use the destination’s requirements and verify where people will watch.'),
        q('A school account asks for a vertical clip with captions. What is a useful change?', 'Reframe for the vertical display and check that captions still fit.', [['Send the existing wide file with no check.', 'Important text might be cropped.'], ['Change the extension to .jpg.', 'A still image cannot stand in for the export.']], 'Preserve both the framing and the reading area on the target screen.')))
    ],
    check: [
      q('What is the container shown in the File card?', 'MP4', [['H.264', 'H.264 is the codec.'], ['8 megabits/sec', 'That is a bitrate.']], 'The extension .mp4 identifies the container in this example.', screen),
      q('At the same length, which bitrate change usually reduces file size?', 'A lower bitrate.', [['A higher bitrate.', 'More data each second adds up.'], ['An extra word in the file name.', 'Names use almost no media storage.']], 'File size depends in part on bits per second times duration.'),
      q('The timeline has sound but the exported MP4 is silent. What should you do?', 'Fix the audio export or mute settings, then reopen the new MP4.', [['Upload it because the timeline works.', 'The audience plays the MP4, not the timeline.'], ['Only rename the video.', 'Renaming cannot restore missing sound.']], 'Verify the finished file itself.')
    ],
    remember: ['Choose [[export settings]] for a specific destination.', 'Check [[format]], pixel size and [[bitrate]] against the brief.', 'Watch the exact [[export]] that you plan to share.'],
    realCameraTitle: 'Try it', realCamera: 'Export one short video for a class site and for a larger display. Record both sizes and check how each version plays.',
    notes: { sketch: 'Draw a delivery settings card. Include format, size and the playback conditions.', frames: 1, frameLabels: ['Delivery settings'], think: 'Why is watching your timeline different from watching the final export?' }
  });
})();
