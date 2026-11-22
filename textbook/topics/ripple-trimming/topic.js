(function () {
  'use strict';
  const T = Textbook, D = T.draw;
  const line = (title, alt, length, clips, marks) => ({ svg: D.editTimeline({ title, length, lanes: [{ name: 'V1', clips }], marks }), alt });
  const teach = (title, intro, copy, ...blocks) => ({ title, intro, blocks: [{ type: 'text', html: copy }, ...blocks] });
  const hook = (pic, question, options, answer, reveal) => ({ ...pic, question, options, answer, reveal });
  const q = (stem, right, wrong, explain, pic) => ({ ...(pic || {}), q: stem, options: [right, ...wrong.map(([text, clue]) => ({ text, clue }))], answer: 0, explain });
  const practice = (title, intro, ...blocks) => ({ title, intro, blocks });
  const exercise = (level, media, timeline, title, brief, steps, options) => ({ type: 'editor-exercise', level, media, timeline, task: { title, brief, steps }, options });
  const step = (text, hint, check, sticky = false) => ({ text, hint, check, sticky });

  const ids = ['p8-note-hall', 'p8-note-medium', 'p8-note-detail', 'p8-note-reaction'];
  const gap = line('Normal delete', 'A from zero to two, empty space from two to four, C from four to six, D from six to eight.', 8, [['A', 0, 2], ['Gap', 2, 4, 'gap'], ['C', 4, 6], ['D', 6, 8]]);
  const closed = line('Ripple delete', 'A from zero to two, C from two to four, D from four to six.', 8, [['A', 0, 2], ['C', 2, 4], ['D', 4, 6]]);
  const pick = (api, id) => api.clips('V1').find(c => c.media === id);
  T.topic({
    slug: 'ripple-trimming', minutes: 12, bigIdea: 'Ripple edits move everything after them so nothing is left behind.',
    hook: hook({ pair: [gap, closed] }, 'Which edit moved C and D earlier when B was removed?', ['Normal delete', 'Ripple delete'], 1, 'C and D slide left in the second timeline. [[Ripple delete]] closes the space left by the removed clip.'),
    vocab: ['ripple-edit', 'ripple-delete'], review: ['gap', 'trim', 'selection-mode'],
    objectives: ['Recognize the difference between normal delete and ripple delete.', 'Ripple trim a clip and check the timing of following clips.'],
    sections: [
      teach('Watch what moves', 'A ripple affects the timing of later clips on the affected track.',
        '<p>A normal delete removes the clip and leaves its time free. [[Ripple delete]] closes that space. In this lesson’s timeline, the clips to its right move earlier.</p><p>A [[ripple edit]] can also be a trim. When the clip gets shorter, the clips after it slide in.</p>',
        { type: 'compare', a: { ...gap, label: 'Normal delete' }, b: { ...closed, label: 'Ripple delete' }, labels: ['Normal delete', 'Ripple delete'], mode: 'toggle' }),
      practice('Practice: delete and then ripple', 'Try both kinds of delete on the medium shot. Undo the first result so you can compare with the same starting clips.',
        exercise(2, ids, { video: 1, audio: 1, clips: ids.map((media, i) => ({ media, duration: 2, start: i * 2 })) },
          'Keep the sequence moving', '“Lose the middle shot without leaving the viewer looking at a blank screen.”', [
            step('Normal-delete the medium shot to leave a two-second gap.', 'Select the medium shot and press Delete. Notice that the book stays at 4 seconds.', api =>
              !pick(api, ids[1]) && api.gaps('V1').some(g => api.near(g.start, 2) && api.near(g.end, 4)), true),
            step('Undo. Then ripple-delete the medium shot.', 'Use Undo, select the medium shot again and press Shift+Delete. Watch the book start at 2 seconds.', api =>
              !pick(api, ids[1]) && api.near(pick(api, ids[2])?.start, 2) && !api.gaps('V1').length, true),
            step('Ripple-trim one second from the end of the hall shot.', 'Press T for Trim edit mode and shorten the hall to one second. The following shots should still touch.', api =>
              api.near(pick(api, ids[0])?.duration, 1) && api.near(pick(api, ids[2])?.start, 1) && api.near(pick(api, ids[3])?.start, 3) && !api.gaps('V1').length)
          ]))
    ],
    check: [
      q('What do you see after the normal delete?', 'A gap where B used to play.', [['C moves to 2 seconds.', 'Find C under the original ruler.'], ['D comes before C.', 'The letters keep their order.']], 'A normal delete leaves the later clips at their original times.', gap),
      q('What changes if you ripple-trim a shot shorter by one second?', 'The following clips on that track move earlier.', [['The source footage loses a second.', 'The original recording stays intact.'], ['Every track becomes taller.', 'Track height only changes the view.']], 'The ripple closes the time removed by the trim.'),
      q('When would you choose a normal delete?', 'When later clips must keep their current times.', [['When you need the gap closed automatically.', 'That requires the later clips to move.'], ['When you want to replace a file on disk.', 'Timeline delete leaves the file alone.']], 'A normal delete leaves timing open for a replacement.')
    ],
    remember: ['Normal delete can leave a [[gap]].', '[[Ripple delete]] removes the time as well as the clip on the affected track.', 'A [[ripple edit]] can change the timing of clips later in the sequence.'],
    realCameraTitle: 'Try it', realCamera: 'Duplicate a short practice timeline. Remove the same middle shot by normal delete and ripple delete. Compare durations.',
    notes: { sketch: 'Draw the timeline after the two types of delete. Add the times where C begins.', frames: 2, frameLabels: ['Normal', 'Ripple'], think: 'When might closing the gap accidentally change the timing you need?' }
  });
})();
