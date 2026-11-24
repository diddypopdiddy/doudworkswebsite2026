/* Part 3 test, student version (FOUNDATION P5). NO ANSWERS in this file; they live in teacher/keys/ (private).
   Each item: topic slug, level (1 foundational, 2 knowledge, 3 application, 4 extended thinking), obj = objective index in that topic. */
(function () {
  const T = Textbook, D = T.draw;
  const R = (size, lead, ey) => ({ recipe: [size, lead, ey] });
  const GOOD = R(0.36, 0.64, 0.33);
  const shot = (id, mirror, r, filter) => ({ id, mirror: !!mirror, crop: T.resolveFrame(id, mirror, r, 0.2), filter });
  window.TEXTBOOK_TEST = {
    part: 'camera-framing-and-composition',
    minutes: 45,
    printNote: 'Prints on US Letter. Black and white is fine.',
    instructions: 'Answer every question. For multiple choice, fill in the circle next to the <strong>one</strong> best answer. For matching, write the letter on the line. “Screen left” and “screen right” mean the left and right of the picture as you see it.',
    sections: [
      {
        title: 'Section A · Words and facts', note: '(Level 1)',
        items: [
          { id: 'a-match', type: 'match', level: 1, topic: 'camera-judgment', stem: 'Match each description to a word. Two words are not used.',
            terms: ['rule of thirds', 'headroom', 'looking room', 'depth of field', 'f-stop', 'rack focus', 'pan', 'tilt', 'dolly', 'insert shot'],
            defs: [
              'The space between the top of the head and the top of the frame.',
              'Turning the camera left or right from one spot.',
              'How much of the scene, from near to far, looks sharp.',
              'Moving the whole camera toward or away from the subject.',
              'Empty space in front of a face, on the side the person looks toward.',
              'A close shot of a detail, like a phone screen, cut into a scene.',
              'Moving the sharp area from one thing to another during a shot.',
              'A guide that splits the frame into nine boxes so you place important things on the lines.'
            ] },
          { id: 'a9', type: 'mc', level: 1, topic: 'depth-of-field', obj: 1, stem: 'Which f-stop gives the shallowest depth of field?', options: ['f/1.8', 'f/5.6', 'f/11', 'f/16'] },
          { id: 'a10', type: 'mc', level: 1, topic: 'apparent-motion-and-optical-devices', obj: 0, stem: 'Why do still pictures shown quickly look like they move?', options: ['Our brains join them into motion (apparent motion)', 'The pictures are blurry', 'The camera moves between pictures', 'Each picture contains a tiny video'] },
          { id: 'a11', type: 'mc', level: 1, topic: 'motion-photography-and-muybridge', obj: 0, stem: 'In 1878, Eadweard Muybridge used a row of twelve cameras to…', options: ['Take photos a split second apart as a horse galloped past', 'Film the first movie with sound', 'Photograph the same horse from twelve angles at once', 'Make the first color photograph'] },
          { id: 'a12', type: 'mc', level: 1, topic: 'early-cinema', obj: 0, stem: 'The very first films, like the Lumière films of 1895, were usually…', options: ['One locked-off shot of everyday life, under a minute long', 'Long stories with many cuts', 'Cartoons made from drawings', 'Close-ups of famous actors'] }
        ]
      },
      {
        title: 'Section B · Recognize it', note: '(Level 2)',
        items: [
          { id: 'b9', type: 'mc', level: 2, topic: 'camera-readiness', obj: 0,
            pair: [
              { cameraPlate: { body: 'g97', view: 'rear', alt: 'Marker 1 is on the small triangle button beside the G97 eyepiece.', labels: [{ control: 'play', label: '1' }] }, caption: 'Back' },
              { cameraPlate: { body: 'g97', view: 'top', alt: 'Marker 2 is on the small red button on the G97 top plate.', labels: [{ control: 'record', label: '2' }] }, caption: 'Top' }
            ],
            stem: 'The G97 is on and ready. Which marked control starts recording a movie in iA mode?',
            options: ['2, on the top', '1, on the back', 'Either control', 'Both controls together'] },
          { id: 'b1', type: 'mc', level: 2, topic: 'record-and-verify-a-take', obj: 2, svg: D.take({ kind: 'none', n: 1, len: '0:00' }), alt: 'A take thumbnail: no file, 0:00, flat sound meter.', stem: 'You play back your last take and see this. What happened?', options: ['The camera never started recording', 'The lens cap was on', 'The take is out of focus', 'The microphone was off but the picture recorded'] },
          { id: 'b2', type: 'mc', level: 2, topic: 'shot-sizes', obj: 0, media: { id: 'scene-shelf', crop: [520, 8, 832] }, stem: 'What shot size is this?', options: ['Wide shot', 'Medium shot', 'Close-up', 'Extreme close-up'] },
          { id: 'b3', type: 'mc', level: 2, topic: 'common-shot-types', obj: 0, media: 'p6-conversation-1', alt: 'Over one person’s shoulder, looking at the other person.', stem: 'What type of shot is this?', options: ['Two-shot', 'Over-the-shoulder shot', 'Point-of-view shot', 'Insert shot'] },
          { id: 'b4', type: 'mc', level: 2, topic: 'rule-of-thirds', obj: 0, media: shot('interview-b', false, GOOD), stem: 'How is this interview framed?', options: ['Dead centre', 'Eyes on the top line of the rule of thirds', 'Eyes near the bottom of the frame', 'Too wide to tell'] },
          { id: 'b5', type: 'mc', level: 2, topic: 'camera-height-and-angles', obj: 0, media: 'p3-angle-low', alt: 'A person seen from below, against the sky.', stem: 'Which camera angle is this?', options: ['Eye level', 'High angle', 'Low angle', 'Bird’s-eye view'] },
          { id: 'b6', type: 'mc', level: 2, topic: 'layered-composition-and-deep-focus', obj: 0, media: 'p3-focus-deep', alt: 'A mug close to the camera, a person at a table, and bookshelves behind, all sharp.', stem: 'In this shot, the mug is in the…', options: ['Foreground', 'Middle ground', 'Background', 'Bird’s-eye view'] },
          { id: 'b7', type: 'mc', level: 2, topic: 'frame-rate-and-shutter-speed', obj: 1, media: 'p3-shutter-slow', alt: 'A soccer ball smeared into a long streak.', stem: 'What setting made the ball a long streak?', options: ['A high frame rate', 'A slow shutter speed', 'A fast shutter speed', 'Digital zoom'] },
          { id: 'b8', type: 'mc', level: 2, topic: 'zoom-versus-camera-movement', obj: 1, pair: [ { media: 'p3-perspective-wide', alt: 'Start: a person in front of trees and a house.', caption: 'Start' }, { media: 'p3-perspective-zoom', alt: 'End: the person, trees and house all much bigger.', caption: 'End' } ], stem: 'The camera went from Start to End. The trees and house grew as much as the person. What move was it?', options: ['A dolly in', 'A zoom in', 'A pan', 'A truck'] }
        ]
      },
      {
        title: 'Section C · Use it', note: '(Level 3)',
        items: [
          { id: 'c1', type: 'mc', level: 3, topic: 'camera-readiness', obj: 1, svg: D.cameraStatus({ battery: 0.35, timeLeft: 'R135m00s' }), alt: 'A camera screen with two battery segments and 135 minutes left on the card.', stem: 'You will film a two-hour game with this camera. What should you do first?', options: ['Charge the battery or bring a spare', 'Clear the memory card', 'Turn on digital zoom', 'Nothing. It is ready.'] },
          { id: 'c2', type: 'mc', level: 3, topic: 'headroom', obj: 1, media: shot('interview-a', false, R(0.30, 0.64, 0.55)), stem: 'What is the best fix for this interview frame?', options: ['Tilt down so the head is near the top, with a little space above', 'Zoom out', 'Move the subject to the centre', 'Use a low angle'] },
          { id: 'c3', type: 'mc', level: 3, topic: 'lead-room', obj: 1, media: shot('interview-b', false, R(0.36, 0.30, 0.33)), stem: 'This person looks screen left. How do you fix the frame?', options: ['Move the frame so the empty space is in front of the face, on the left', 'Add more headroom', 'Zoom in until the face is centred', 'Turn the camera to a Dutch angle'] },
          { id: 'c4', type: 'mc', level: 3, topic: 'focus', obj: 1, media: 'p3-focus-far', alt: 'Bookshelves sharp; the person and mug blurry.', stem: 'This is an interview. What went wrong, and what is the fix?', options: ['Autofocus chose the background; lock focus on the person’s eyes', 'The shutter was too slow; use a faster shutter', 'The headroom is wrong; tilt down', 'Nothing. A blurry person is fine.'] },
          { id: 'c5', type: 'mc', level: 3, topic: 'locked-shot-pan-and-tilt', obj: 2, stem: 'You need to follow a runner sprinting across a field from one spot on a tripod. Which move do you use?', options: ['A pan', 'A tilt', 'A locked-off shot', 'A Dutch angle'] },
          { id: 'c6', type: 'mc', level: 3, topic: 'shot-purpose', obj: 1, stem: 'The script says: “She reads the text message and her face falls.” Which shots best show this?', options: ['An insert of the phone screen, then a close-up of her face', 'A wide shot of the whole room only', 'A bird’s-eye view of the building', 'An extreme close-up of her shoes'] },
          { id: 'c7', type: 'mc', level: 3, topic: 'camera-judgment', obj: 0, media: shot('interview-a', false, GOOD, 'blur(4px)'), stem: 'The framing is good, but the editor won’t use this take. Why?', options: ['It is out of focus', 'It has too much headroom', 'It has no looking room', 'It is a high angle'] }
        ]
      },
      {
        title: 'Section D · Think it through', note: '(Level 4 · write your answers)',
        items: [
          { id: 'd1', type: 'written', level: 4, topic: 'camera-judgment', obj: 2, sketch: 1, lines: 5, stem: 'Sketch a well-framed chest-up interview of a person looking toward <strong>screen left</strong>. Draw the thirds grid lightly. Then label the eyes, the headroom and the looking room, and explain in two or three sentences why each choice makes the frame look professional.' },
          { id: 'd2', type: 'written', level: 4, topic: 'shot-purpose', obj: 1, sketch: 3, lines: 6, stem: 'Plan three shots for this moment: <em>a nervous student walks into the gym for tryouts.</em> Sketch each shot. Under each, name the shot size and the camera angle, and explain the purpose of the shot: what it shows viewers and how it makes them feel.' }
        ]
      }
    ]
  };
})();
