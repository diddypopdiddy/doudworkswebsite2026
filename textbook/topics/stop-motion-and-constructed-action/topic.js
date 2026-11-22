/* 6.09 Stop motion and constructed action (history). Content data per FOUNDATION T4. */
(function () {
  const T = Textbook;

  T.topic({
    slug: 'stop-motion-and-constructed-action',
    minutes: 16,
    bigIdea: 'Movies can build actions that never happened in one piece.',
    hook: {
      sequence: [T.seg('pd-melies-vanishing', 24, 44)],
      question: 'Watch closely. Where did she go?',
      options: ['She slipped out behind the cloth', 'The camera was stopped while she walked away', 'She dropped through a trapdoor in the floor'],
      answer: 1,
      reveal: 'Méliès stopped the camera, the woman walked off, and he started filming again. On screen, she simply vanishes. Stage magicians used trapdoors; Méliès used the camera.'
    },
    notes: {
      sketch: 'Plan a substitution trick: sketch the frame before the camera stops and the frame after you swap something.',
      frames: 2, frameLabels: ['Before the stop', 'After the swap'],
      think: 'Stop motion and a cut on action both hide a gap between pieces of film. Explain how each one does it.'
    },
    vocab: ['stop-motion', 'substitution-splice', 'frame-by-frame'],
    review: ['frame', 'cut', 'locked-off-shot'],
    objectives: [
      'Explain how a [[substitution splice]] makes something appear to change by magic.',
      'Describe how [[stop motion]] is made, [[frame-by-frame]].',
      'Give an example of an action built from separate shots.'
    ],
    sections: [
      {
        title: 'A magician with a camera',
        intro: 'Georges Méliès was a stage magician in Paris who started making films in 1896.',
        blocks: [
          { type: 'text', html: '<p>Méliès told a story about how he found his best trick. While he was filming a street, his camera jammed. When he got it working again, the scene had changed. Played back, a bus seemed to turn into a hearse.</p><p>He turned that accident into a method. Stop the camera, swap something, start again. This is a [[substitution splice]]. In <em>The Vanishing Lady</em> (1896), he makes a woman disappear under a cloth.</p>' },
          { type: 'video-segments', media: 'pd-melies-vanishing', label: 'The Vanishing Lady, 1896', segments: [ { label: 'She vanishes', from: 24, to: 45 }, { label: 'A skeleton appears', from: 44, to: 58 }, { label: 'She returns', from: 58, to: 72 } ],
            pauses: [ { at: 38.6, prompt: 'The cloth is about to come off. Somewhere near here the camera stopped. Watch for anything that jumps.' }, { at: 49.5, prompt: 'Where did the skeleton come from? Same trick: stop, swap, start again.' } ] }
        ]
      },
      {
        title: 'Try the trick',
        intro: 'Step through the frames to find the swap.',
        blocks: [
          { type: 'stop-motion', mode: 'swap', frames: 16, fps: 6, caption: 'The camera stops, the cup is swapped for a flower, and filming continues. At full speed, it looks like magic.' },
          { type: 'callout', kind: 'onset', html: 'The trick only works if the camera is a [[locked-off shot]]. If it moves even a little during the swap, viewers see the jump.' }
        ]
      },
      {
        title: 'One frame at a time',
        intro: 'Stop motion takes the trick and repeats it hundreds of times.',
        blocks: [
          { type: 'text', html: '<p>In [[stop motion]], you move an object a tiny amount, take one photo, move it again, take another photo. Each photo becomes one [[frame]]. Played back quickly, the object seems to move on its own. Because you make it [[frame-by-frame]], you control every instant.</p>' },
          { type: 'stop-motion', mode: 'move', frames: 24, fps: 8, caption: 'Change the speed. Below about 8 frames per second, the movement starts to look jerky.' },
          { type: 'video-segments', media: 'pd-funny-faces', label: 'Humorous Phases of Funny Faces, 1906', segments: [ { label: 'The title draws itself', from: 2, to: 20 }, { label: 'Faces', from: 20, to: 64 }, { label: 'The clown', from: 120, to: 160 } ],
            pauses: [ { at: 36, prompt: 'The hand is gone, but the drawing keeps changing. How?' } ],
            caption: 'J. Stuart Blackton drew on a blackboard, filmed a frame or two, changed the drawing a little, and filmed again: one of the first animated films.' },
          { type: 'video-segments', media: 'pd-cameramans-revenge', label: 'The Cameraman’s Revenge, 1912', segments: [ { label: 'The beetle’s drive', from: 28, to: 58 } ],
            caption: 'Ladislas Starewicz animated model beetles, moving their legs a tiny amount for every frame.' },
          { type: 'figure', media: 'stopmotion-desk', caption: 'Coming soon: a stop motion of the note from this part’s story.' },
          { type: 'callout', kind: 'try', html: 'Put your phone on a stack of books so it can’t move. Take 24 photos of a coin sliding across a desk, moving it a finger-width each time. Play them back as a video.' }
        ]
      },
      {
        title: 'Constructed action today',
        intro: 'Editors still build actions that never happened in one go.',
        blocks: [
          { type: 'text', html: '<p>A stunt person jumps off a wall in one shot. In the next shot, a different take shows them landing on a soft mat out of frame. Cut together on the action, it looks like one jump. A [[cut]] can join pieces filmed hours apart into one believable action, just as Méliès joined pieces of film.</p>' },
          { type: 'callout', kind: 'history', html: 'This trick connects to [[cutting on action]]: both hide a gap between two pieces of film inside something viewers are watching.', link: { href: '../match-action/index.html', label: 'Revisit 6.07 Match action →' } }
        ]
      }
    ],
    check: [
      { q: 'How did Méliès make a person vanish?', options: [
        'He stopped the camera, the person left, and he filmed again.',
        { text: 'He used computer effects.', clue: 'This was 1896. No computers.' },
        { text: 'He painted over them on the film.', clue: 'His trick happened while filming.' }
      ], answer: 0, explain: 'That’s a substitution splice.' },
      { pair: [ { svg: T.draw.stopFrame('swap', 7, 16), alt: 'Frame 8: a magician beside a cup on a desk.', caption: 'Frame 8' }, { svg: T.draw.stopFrame('swap', 8, 16), alt: 'Frame 9: the same shot, but the cup is now a flower.', caption: 'Frame 9' } ], q: 'Between frame 8 and frame 9 the cup becomes a flower, and nothing else changes. What was done?', options: [
        'The camera stopped, the cup was swapped for a flower, and filming continued.',
        { text: 'The camera crossed the line.', clue: 'The magician is on the same side in both frames.' },
        { text: 'It was a cut on action.', clue: 'Nothing is moving to hide this change.' }
      ], answer: 0, explain: 'A substitution splice: stop, swap, start again.' },
      { q: 'Stop motion is made by…', options: [
        'Moving an object a little, taking a photo, and repeating',
        { text: 'Filming in slow motion', clue: 'Stop motion is built one photo at a time.' },
        { text: 'Pausing a video at random', clue: 'Each frame is planned.' }
      ], answer: 0, explain: 'Every frame is a separate photo.' },
      { q: 'Why must the camera stay locked off for stop motion?', options: [
        'If it moves, the whole picture jumps between frames.',
        { text: 'To save battery', clue: 'It’s about what viewers see.' },
        { text: 'So the photos are bigger', clue: 'Think about what changes between frames.' }
      ], answer: 0, explain: 'Only the object should move.' },
      { q: 'You play 24 stop-motion photos at 4 frames per second instead of 12. The movement looks…', options: [
        'Jerkier, and it lasts three times as long',
        { text: 'Smoother and shorter', clue: 'Fewer frames each second means bigger jumps.' },
        { text: 'Exactly the same', clue: 'Speed changes how motion looks.' }
      ], answer: 0, explain: '24 frames at 4 fps is 6 seconds; at 12 fps it is 2 seconds.' }
    ],
    remember: [
      'A [[substitution splice]] stops the camera, swaps something, and starts again.',
      '[[Stop motion]] is made [[frame-by-frame]], one photo per tiny move.',
      'A cut can build one believable action from separate pieces.'
    ],
    realCamera: 'Make a 3-second stop motion: 36 photos played at 12 frames per second. Keep the phone locked off. Then add one substitution trick: halfway through, swap the object for something else.'
  });
})();
