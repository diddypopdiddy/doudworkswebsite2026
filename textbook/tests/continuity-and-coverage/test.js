/* Part 6 test, student version (FOUNDATION P5). NO ANSWERS in this file; they live in teacher/keys/ (private).
   Each item: topic slug, level (1 foundational, 2 knowledge, 3 application, 4 extended thinking), obj = objective index in that topic. */
(function () {
  const D = Textbook.draw;
  const a = Textbook.lookCrop('interview-a', false), bFlip = Textbook.lookCrop('interview-b', true);
  window.TEXTBOOK_TEST = {
    part: 'continuity-and-coverage',
    minutes: 45,
    instructions: 'Answer every question. For multiple choice, fill in the circle next to the <strong>one</strong> best answer. For matching, write the letter on the line. Pictures are numbered as Shot 1 and Shot 2 in the order they appear in the edit.',
    sections: [
      {
        title: 'Section A · Words and facts', note: '(Level 1)',
        items: [
          { id: 'a-match', type: 'match', level: 1, topic: 'continuity-check', stem: 'Match each description to a word. Two words are not used.',
            terms: ['establishing shot', 'screen direction', 'axis of action', 'clean frame', 'eyeline match', 'cutting on action', 'master shot', 'continuity error', 'substitution splice', 'cutaway'],
            defs: [
              'A cut from a person looking at something to a shot of that thing.',
              'The imaginary line through two people facing each other.',
              'A trick where the camera stops, something is swapped, and filming continues.',
              'A shot, usually wide, that shows viewers where a scene takes place.',
              'A detail that changes between shots when it should not.',
              'A moment when the shot is empty, before a person enters or after they exit.',
              'Cutting to the next shot in the middle of a move.',
              'Which way a person moves or faces on screen.'
            ] },
          { id: 'a9', type: 'mc', level: 1, topic: 'screen-direction', obj: 0, stem: '“Screen left” means…', options: ['The actor’s left side', 'The left side of the picture as the viewer sees it', 'The left side of the camera operator', 'The direction the camera moves'] },
          { id: 'a10', type: 'mc', level: 1, topic: 'early-cuts-and-connected-spaces', obj: 0, stem: 'Around 1903, filmmakers like Edwin S. Porter discovered that…', options: ['Films could include synchronized sound', 'Shots of different places can be cut together so they feel connected', 'Every film should be a single shot', 'Color film was cheaper than black and white'] }
        ]
      },
      {
        title: 'Section B · Recognize it', note: '(Level 2)',
        items: [
          { id: 'b1', type: 'mc', level: 2, topic: 'establishing-shots-and-locations', obj: 0, media: 'still-room-wide', stem: 'A scene starts with this shot. What is its main job?', options: ['To show how the person feels', 'To show viewers where the scene takes place', 'To hide a continuity error', 'To show a small detail'] },
          { id: 'b2', type: 'mc', level: 2, topic: 'screen-direction', obj: 1, keepOrder: false, pair: [ { id: 'still-hall-mid', caption: 'Shot 1' }, { id: 'still-hall-mid-flip', caption: 'Shot 2' } ], stem: 'These two shots of the same walk are cut together. What is the problem?', options: ['A direction flip: the person seems to turn around', 'The person exits the frame too early', 'Double action', 'There is no problem'] },
          { id: 'b3', type: 'mc', level: 2, topic: '180-degree-rule', obj: 2, pair: [ { media: 'p6-conversation-2', alt: 'Two-shot, A on the left, B on the right', caption: 'Shot 1' }, { media: 'p6-conversation-5', alt: 'Two-shot, B on the left, A on the right', caption: 'Shot 2' } ], stem: 'What happened between Shot 1 and Shot 2?', options: ['The camera zoomed in', 'The camera crossed the line', 'The people changed seats', 'Nothing. These shots cut together well.'] },
          { id: 'b4', type: 'mc', level: 2, topic: 'exits-and-entrances', obj: 0, media: 'still-hall-empty', stem: 'This frame comes just after a person walks out of the hallway. What is this moment called?', options: ['A clean frame', 'A cutaway', 'An eyeline match', 'A reverse shot'] },
          { id: 'b5', type: 'mc', level: 2, topic: 'match-action', obj: 1, pair: [ { id: 'still-room-sit', caption: 'Shot 1 · last frame' }, { id: 'still-medium-sit', caption: 'Shot 2 · first frame' } ], stem: 'The cut joins these two frames. What kind of cut is it?', options: ['A cut on stillness', 'A smooth cut on action', 'Skipped action', 'A direction flip'] },
          { id: 'b6', type: 'mc', level: 2, topic: 'continuity-check', obj: 0, pair: [ { media: 'p6-desk-base', alt: 'Desk with the lamp on', caption: 'Shot 1' }, { media: 'p6-desk-lamp-off', alt: 'Desk with the lamp off', caption: 'Shot 2' } ], stem: 'Which detail is a continuity error?', options: ['The mug', 'The book', 'The lamp', 'The pencil'] },
          { id: 'b7', type: 'mc', level: 2, topic: '180-degree-rule', obj: 1, pair: [ { media: 'p6-conversation-1', alt: 'Over A’s shoulder, B looking screen left', caption: 'Shot 1' }, { media: 'p6-conversation-3', alt: 'Over B’s shoulder, A looking screen right', caption: 'Shot 2' } ], stem: 'These two shots are from a conversation. What are they?', options: ['A shot and a reverse shot from the same side of the line', 'Two shots that cross the line', 'A master shot and a cutaway', 'Two establishing shots'] },
          { id: 'b8', type: 'mc', level: 2, topic: 'eyeline-matching', obj: 0, media: 'still-face-close', stem: 'The person is looking down. Which next shot makes an eyeline match?', options: ['A close-up of the book on the table below them', 'A wide shot of the hallway', 'A shot of the ceiling', 'A shot of a window across the room'] }
        ]
      },
      {
        title: 'Section C · Use it', note: '(Level 3)',
        items: [
          { id: 'c1', type: 'mc', level: 3, topic: 'exits-and-entrances', obj: 2, stem: 'A student exits a classroom on <strong>screen right</strong>. You are about to film them coming into the hallway. Where should they enter the hallway shot?', options: ['From screen right', 'From screen left', 'From the top of the frame', 'It doesn’t matter'] },
          { id: 'c2', type: 'mc', level: 3, topic: '180-degree-rule', obj: 1, svg: D.map([2], true), alt: 'Top-down map with camera 2 selected on side 1.', stem: 'You filmed a two-shot from camera 2. Which camera should you use for a shot of A that keeps the 180-degree rule?', options: ['Camera 3', 'Camera 4', 'Camera 5', 'Camera 6'] },
          { id: 'c3', type: 'mc', level: 3, topic: 'match-action', obj: 2, stem: 'You cut from a wide to a medium as a person stands up. In the medium they start standing all over again. How do you fix it?', options: ['Start the medium shot later in the move', 'Start the medium shot earlier in the move', 'Add a dissolve', 'Remove the wide shot'] },
          { id: 'c4', type: 'mc', level: 3, topic: 'action-coverage', obj: 1, stem: 'You only filmed a master shot. The editor needs to shorten the scene without a jump. What should you have also filmed?', options: ['A cutaway, like a clock or a hand', 'A second master from the other side of the line', 'Nothing. Master shots can’t be shortened.', 'The same master again, faster'] },
          { id: 'c5', type: 'mc', level: 3, topic: 'screen-direction', obj: 2, pair: [ { id: 'interview-a', crop: a.frame, caption: 'Interview 1' }, { id: 'interview-b', crop: bFlip.frame, mirror: true, caption: 'Interview 2' } ], stem: 'These two interviews will be cut together, but they don’t feel like two sides of a conversation. What is the best fix for the next shoot?', options: ['Use a closer shot of Interview 2', 'Move Interview 2’s interviewer to the other side of the camera', 'Ask both people to look into the lens', 'Film Interview 1 in a different room'] },
          { id: 'c6', type: 'mc', level: 3, topic: 'stop-motion-and-constructed-action', obj: 1, stem: 'Your stop motion looks jerky and the whole picture shakes between frames. Which change fixes the shaking?', options: ['Lock the camera so it can’t move between photos', 'Take fewer photos', 'Use a brighter light', 'Play it back slower'] },
          { id: 'c7', type: 'mc', level: 3, topic: 'establishing-shots-and-locations', obj: 2, stem: 'You are filming a scene in the cafeteria. Which plan best establishes the location?', options: ['Start on a close-up of a lunch tray', 'Start with a wide shot of the cafeteria with the person at a table, then go closer', 'Start with the person’s face, then show the room at the end', 'Film only medium shots'] }
        ]
      },
      {
        title: 'Section D · Think it through', note: '(Level 4 · write your answers)',
        items: [
          { id: 'd1', type: 'written', level: 4, topic: 'action-coverage', obj: 1, sketch: 3, lines: 5, stem: 'Plan the coverage for one action: <em>a person opens a locker and takes out a book.</em> Sketch three frames (a master shot, a medium shot and a close-up). Then explain where you would cut on action between two of them, and what the actor must do on set so that cut works.' },
          { id: 'd2', type: 'written', level: 4, topic: 'continuity-check', obj: 2, lines: 8, stem: 'A classmate’s scene: a student walks out of the library on screen right, then appears in the hallway walking toward screen left. Later, two friends talk, and the second shot is filmed from the other side of the table. Describe <strong>two</strong> continuity problems a viewer would notice, explain <strong>why</strong> each is confusing, and say how you would fix each one when filming.' }
        ]
      }
    ]
  };
})();
