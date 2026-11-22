/* Part 8 edit brief and downloadable Practice Editor timeline. */
(function () {
  const ids = ['p8-note-hall', 'p8-note-wide', 'p8-note-medium', 'p8-note-detail', 'p8-note-reaction'];
  const media = id => Textbook.mediaRecord(id);
  window.TEXTBOOK_PROJECT = {
    part: 'editing-tools',
    title: 'The Note, assembled',
    time: 'About two class periods',
    brief: '<p>Edit the hallway and library footage into a short sequence. Show the subject enter, reach the table, open the book and react. Pick a useful detail to show while the action continues.</p><p>Trim the clips to the action. Keep the viewer oriented and the story moving. Then download the timeline, add a one-paragraph edit log and hand both in to your teacher.</p>',
    requirementsTitle: 'Your edit must',
    requirements: [
      'Keep the source files together and use the Media Pool for your selected [[clips]].',
      'Place the hallway, arrival, opening and reaction in an order the viewer can follow.',
      '[[Trim]] the [[head]] and the [[tail]] of the chosen shots.',
      'Close any [[gap]] on V1 so the sequence plays without unintended black.',
      'Use at least one [[B-roll|b-roll]] detail on the second [[video track]].',
      'Add a short [[fade in]] and [[fade out]] to the sequence.',
      'Download the [[timeline]] and write a short edit log that explains one choice about order and one choice about trimming.'
    ],
    taskSheet: { title: 'Plan your edit', columns: ['Step', 'Media Pool clip', 'Keep from / to', 'Track', 'What the viewer learns'], rows: 6 },
    storyboardFrames: 0,
    checklist: [
      'All selected source clips open.', 'The viewer knows how the subject gets to the table.', 'The details and reaction make sense.',
      'Alone on V1, the sequence plays without a gap.', 'The detail on V2 shows something the viewer needs.',
      'The opening and ending fades are visible.', 'The downloaded timeline is named The Note.', 'The edit log explains two editing decisions.'
    ],
    rubricLevels: ['4 · Clear', '3 · Works', '2 · In progress', '1 · Revisit'],
    rubric: [
      { criterion: 'Order', levels: ['A complete story with a clear cause and reaction.', 'The major actions are in order.', 'One action or its cause is hard to follow.', 'The sequence is missing several actions.'] },
      { criterion: 'Trims', levels: ['Every shot starts and ends at a deliberate moment.', 'Most cuts keep the useful action.', 'Some shots begin or end too early or late.', 'The original waiting time dominates the edit.'] },
      { criterion: 'Gaps', levels: ['V1 has no gaps and the sequence plays smoothly.', 'No unintended black gaps remain.', 'One gap or rough cut interrupts the story.', 'Several gaps interrupt playback.'] },
      { criterion: 'Layers', levels: ['V2 details and both fades serve the viewer.', 'The V2 detail and two fades work.', 'A layer or fade is missing or unclear.', 'The edit uses only the unmodified main track.'] },
      { criterion: 'Organization', levels: ['Timeline file and log record clear, recoverable decisions.', 'Timeline and a clear edit log are both present.', 'Timeline or log is incomplete.', 'The editor cannot reopen or explain the work.'] }
    ],
    reflection: ['Which frame needed the most adjustment? What did you change?', 'How would the opening feel if the viewer saw the note before the hallway?'],
    editor: {
      level: 3,
      media: ids,
      timeline: { video: 2, audio: 1 },
      options: { timelineName: 'The Note', libraryStart: 'vtrans', layout: { left: 0.27 } },
      download: 'The Note - timeline.json',
      task: {
        title: 'Assemble The Note',
        brief: '“Tell the story from the hallway to the reaction. Use the closer shot when the viewer needs to see what was in the book.”',
        steps: [
          {
            text: 'Show the hall, the arrival, and the reaction in order on V1.',
            hint: 'Start with Hall. Include the wide or medium table shot before Face.',
            check: api => {
              const v = api.clips('V1').map(c => c.media);
              const arrival = v.findIndex(id => id === ids[1] || id === ids[2]);
              return v[0] === ids[0] && arrival > 0 && v.indexOf(ids[4]) > arrival;
            }
          },
          {
            text: 'Trim at least two shots. Close every gap on V1.',
            hint: 'Drag the clip ends. If a space opens up, select it and press Delete.',
            check: api => !api.gaps('V1').length && api.clips('V1').filter(c => c.media && c.duration < media(c.media).duration - 1 / api.fps).length >= 2
          },
          {
            text: 'Put a timed detail on V2.',
            hint: 'Place Book detail above the arrival. Trim it to reveal the rest of V1.',
            check: api => api.clips('V2').some(c => c.media === ids[3] && c.start >= 1 && c.end <= (api.clips('V1').at(-1)?.end || 0))
          },
          {
            text: 'Fade in and out at the ends of the sequence.',
            hint: 'Go to Effects, Video Transitions. Add Dip to Color at the start and the end of V1.',
            check: api => {
              const clips = api.clips('V1');
              return clips[0]?.transitionIn === 'dip' && clips.at(-1)?.transitionOut === 'dip';
            }
          }
        ]
      }
    }
  };
})();
