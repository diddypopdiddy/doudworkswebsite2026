/* Production Studio lessons.
   Each entry configures the guided exercise for one topic:
   only that topic's department is switched on, the kit holds only the tools the topic teaches,
   and a short list of goals ticks itself off as the student works.

   A topic places one with a block:  { type: 'studio-room', lesson: 'light-direction' }
   (specs/tools/make-shells.sh adds the studio scripts to any topic that uses the block.)

   Goal tests receive the studio's current state:
     lights   { key: { level, soft }, … } keyed by mark      marks  ['key', 'fill', …]
     cam      { dist, focal, focus, pan, tilt, height, grid, shot, sharp }
     sound    { mics, open, heard (Set: 'lav-collar', 'boom-high', 'desk', 'camera-7' …), clipped, lastTake, boomInFrame }
     takes    number of takes rolled */
(function () {
  'use strict';

  const LIGHT_ONLY = { light: true, camera: false, sound: false };
  const CAMERA_ONLY = { light: false, camera: true, sound: false };
  const SOUND_ONLY = { light: false, camera: false, sound: true };

  const LESSONS = {
    /* ------------------------------------------------ Part 4: Lighting */
    'light-direction': {
      title: 'Studio: move one light',
      brief: 'One light, five places. Drag the light around the set and watch where the shadows fall on the monitor.',
      departments: LIGHT_ONLY,
      light: { marks: ['front', 'side', 'top', 'under', 'back'], max: 1, softbox: false, dimmer: false, removable: false,
        setups: [], start: { front: {} } },
      goals: [
        { text: 'Move the light to the side of the subject.', test: s => s.marks.includes('side'),
          why: 'Side light. One cheek is lit and the other drops into shadow.' },
        { text: 'Hang it straight overhead.', test: s => s.marks.includes('top'),
          why: 'Top light. The eye sockets go dark.' },
        { text: 'Put it low, pointing up at the face.', test: s => s.marks.includes('under'),
          why: 'Under light. The shadows climb upward, which is why it looks strange.' },
        { text: 'Put it behind the subject.', test: s => s.marks.includes('back'),
          why: 'Backlight. The outline stays and the face goes dark.' },
        { text: 'Finish with the place that shows both eyes clearly.', test: s => s.marks.includes('front'),
          why: 'Front light shows both cheeks evenly. Easy to read, but flat.' }
      ]
    },
    'hard-and-soft-light': {
      title: 'Studio: one light, hard or soft',
      brief: 'The light never moves here. Only its size changes. Watch the edge of the nose shadow on the monitor.',
      departments: LIGHT_ONLY,
      light: { marks: ['key'], max: 1, softbox: true, dimmer: false, removable: false, setups: [], start: { key: { soft: false } } },
      goals: [
        { text: 'Put the softbox on the light.', test: s => !!s.lights.key?.soft,
          why: 'The softbox makes the source bigger. The shadow edge now fades gradually.' },
        { text: 'Take the softbox off again (Quality: Bare).', test: s => s.lights.key?.soft === false,
          why: 'A bare lamp is a small source. The shadow edge is crisp again.' },
        { text: 'Leave the light the way you would for a friendly interview.', test: s => !!s.lights.key?.soft,
          why: 'Soft light is gentler on a face, so it is the usual choice for interviews.' }
      ]
    },
    'fill-shadows-and-contrast': {
      title: 'Studio: add and dim the fill',
      brief: 'The key light is set and stays put. Your job is the fill: add it, then use its dimmer to choose how dark the shadows get.',
      departments: LIGHT_ONLY,
      light: { marks: ['fill'], fixed: ['key'], max: 2, softbox: false, dimmer: true, setups: [], start: { key: { soft: true } } },
      goals: [
        { text: 'Add a light on the fill mark, across from the key.', test: s => !!s.lights.fill,
          why: 'The fill lifts the shadow side so you can see detail there.' },
        { text: 'Dim the fill to 30% or lower.', test: s => s.lights.fill?.level <= 30,
          why: 'Low fill, high contrast. The shadow cheek is dark and the mood is dramatic.' },
        { text: 'Raise the fill to 85% or higher.', test: s => s.lights.fill?.level >= 85,
          why: 'Full fill, low contrast. The shadows are nearly gone and the face looks flat.' },
        { text: 'Settle between 40% and 75% for an everyday interview.', test: s => s.lights.fill?.level >= 40 && s.lights.fill?.level <= 75,
          why: 'Enough fill to read the shadow side, with the key still giving the face its shape.' }
      ]
    },
    'three-point-lighting': {
      title: 'Studio: build three-point lighting',
      brief: 'The studio is dark. Take three lights from the kit and give each one a job.',
      departments: LIGHT_ONLY,
      light: { marks: ['key', 'fill', 'back'], max: 3, softbox: true, dimmer: true, setups: [], start: {} },
      goals: [
        { text: 'Place the key light, 45° to camera left.', test: s => !!s.lights.key,
          why: 'The key sets the direction of the light and shapes the cheek.' },
        { text: 'Add the fill on the other side of the camera.', test: s => !!s.lights.fill,
          why: 'The fill opens up the shadow side of the face.' },
        { text: 'Add the back light behind the subject.', test: s => !!s.lights.back,
          why: 'The back light puts a rim on the hair and shoulders and separates them from the wall.' },
        { text: 'Dim the fill to 50% or lower so the key stays in charge.', test: s => s.lights.fill?.level <= 50 && !!s.lights.key && !!s.lights.back,
          why: 'That is three-point lighting: shape from the key, detail from the fill, separation from the back light.' }
      ]
    },

    /* ------------------------------------------------ Part 5: Recording sound */
    'microphone-placement': {
      title: 'Studio: place the microphone',
      brief: 'The lights and camera are set. Only the microphones are yours. Roll a take after every change and listen.',
      departments: SOUND_ONLY,
      camera: { start: { focal: 12 } },
      sound: { mics: ['lav', 'boom', 'phone'], setups: [],
        start: { id: 'phone-only', mics: ['phone'], open: ['phone'] } },
      select: 'phone',
      goals: [
        { text: 'Press Roll and listen to the phone on the table.', test: s => s.sound.heard.has('phone'),
          why: 'From four feet away the voice is weak and the room is loud.' },
        { text: 'Clip the lav to the collar, mute the phone and roll again.',
          test: s => s.sound.heard.has('lav-collar') && !!s.sound.mics.phone?.mute || s.sound.heard.has('lav-collar') && !s.sound.mics.phone,
          why: 'Close to the mouth, the voice is clear and steady with very little room.' },
        { text: 'Move the lav to “Clipped too low” and roll.', test: s => s.sound.heard.has('lav-low'),
          why: 'A few inches farther away and the voice is already thinner.' },
        { text: 'Add the boom. It dips into the shot. Find the placement that keeps it out, and listen.',
          test: s => s.sound.heard.has('boom-high') && !s.sound.boomInFrame,
          why: 'Out of the frame, but farther from the mouth. Every placement trades closeness against staying out of the shot.' }
      ]
    },
    'gain-levels-and-headphone-monitoring': {
      title: 'Studio: set a level on the mixing board',
      brief: 'A lav and a boom are plugged in. Use the faders and the meters to find a level that is loud but never clips.',
      departments: SOUND_ONLY,
      sound: { mics: ['lav', 'boom'], setups: [], start: 'interview' },
      select: 'lav',
      goals: [
        { text: 'Roll a take and watch the meters move.', test: s => s.takes >= 1,
          why: 'The meter shows how loud the signal is. Green is safe.' },
        { text: 'Unmute the boom, push both channel faders and the master to the top, and roll until CLIP lights.',
          test: s => s.sound.clipped,
          why: 'Too hot. A clipped recording is distorted and cannot be repaired afterwards.' },
        { text: 'Pull the faders back and roll one whole take with no CLIP.',
          test: s => s.sound.clipped && !!s.sound.lastTake?.full && !s.sound.lastTake.clipped && s.sound.lastTake.peak > 0.2,
          why: 'Loud peaks now stay below the top of the meter. That headroom keeps a sudden laugh from clipping.' }
      ]
    },
    'sound-clarity': {
      title: 'Studio: near and far',
      brief: 'Three microphones hear the same voice from three distances. Use M (mute) and S (solo) on the mixing board to compare them.',
      departments: SOUND_ONLY,
      sound: { mics: ['desk', 'phone', 'room'], setups: [], start: 'compare' },
      select: 'desk',
      goals: [
        { text: 'Roll a take and listen to the desk microphone.', test: s => s.sound.heard.has('desk'),
          why: 'Eighteen inches away. The voice is full and close.' },
        { text: 'Solo the phone (S) and roll.', test: s => s.sound.heard.has('phone'),
          why: 'Four feet away. Less voice, more room.' },
        { text: 'Solo the room microphone and roll.', test: s => s.sound.heard.has('room'),
          why: 'Twelve feet away. Echo blurs the words. No edit can fully remove it.' },
        { text: 'Leave only the clearest microphone open.',
          test: s => s.sound.open.length === 1 && s.sound.open[0] === 'desk',
          why: 'Clarity is decided at the recording. Get close before you press record.' }
      ]
    },

    /* ------------------------------------------------ Part 3: Camera */
    'shot-sizes': {
      title: 'Studio: one subject, three sizes',
      brief: 'The lights are set. Use the zoom and the three camera marks. The monitor names the shot size you have made.',
      departments: CAMERA_ONLY,
      camera: { controls: ['zoom'], move: true },
      goals: [
        { text: 'Zoom in until the monitor says Close-up.', test: s => s.cam.shot === 'Close-up',
          why: 'A close-up fills the frame with the face, so viewers read the feeling.' },
        { text: 'Keep going to an Extreme close-up.', test: s => s.cam.shot === 'Extreme close-up',
          why: 'Only part of the face is left. Use it to make viewers notice one detail.' },
        { text: 'Zoom all the way out, then move the camera to the far mark for a Medium shot.', test: s => s.cam.shot === 'Medium shot',
          why: 'A medium shot shows the person from about the waist up: who they are and what they are doing.' }
      ]
    },
    'camera-height-and-angles': {
      title: 'Studio: raise and lower the camera',
      brief: 'Change only the height of the tripod. Watch the camera move in the studio and the face change on the monitor.',
      departments: CAMERA_ONLY,
      camera: { controls: ['height'], move: false },
      goals: [
        { text: 'Set the camera to Low.', test: s => s.cam.height === 'low',
          why: 'A low angle looks up at the subject. They seem bigger and stronger.' },
        { text: 'Set the camera to High.', test: s => s.cam.height === 'high',
          why: 'A high angle looks down. The subject seems smaller.' },
        { text: 'Return to Eye level.', test: s => s.cam.height === 'eye',
          why: 'Eye level feels neutral and equal. It is the usual choice for an interview.' }
      ]
    },
    'focus': {
      title: 'Studio: lose focus and find it again',
      brief: 'The monitor shows Sharp or Soft in the bottom corner. Use the zoom, the focus slider and the AF button.',
      departments: CAMERA_ONLY,
      camera: { controls: ['zoom', 'focus'], move: true },
      goals: [
        { text: 'Zoom in to 50 mm or more.', test: s => s.cam.focal >= 50,
          why: 'Zoomed in, focus is much less forgiving.' },
        { text: 'Turn the focus slider until the monitor says Soft.', test: s => !s.cam.sharp && s.cam.focal >= 40,
          why: 'The focus distance no longer matches the distance to the subject.' },
        { text: 'Bring it back to Sharp by hand, without pressing AF.', test: s => s.cam.sharp && s.cam.focal >= 40,
          why: 'Sharp when the focus distance matches the subject distance. That is manual focus.' },
        { text: 'Move the camera to the close mark, then press AF.', test: s => s.cam.dist === 4 && s.cam.sharp,
          why: 'Moving the camera changed the distance, so focus had to be set again.' }
      ]
    },
    'locked-shot-pan-and-tilt': {
      title: 'Studio: pan, tilt and lock off',
      brief: 'The camera stays on its mark. Only the tripod head turns. Use the thirds grid to see where the face lands.',
      departments: CAMERA_ONLY,
      camera: { controls: ['pan', 'tilt', 'grid'], move: false, start: { focal: 30, focus: 7 } },
      goals: [
        { text: 'Turn on the thirds grid.', test: s => s.cam.grid,
          why: 'The grid shows where the face sits in the frame.' },
        { text: 'Pan until the face sits on a side line of the grid.', test: s => Math.abs(s.cam.pan) >= 0.3,
          why: 'A pan turns the camera left or right. The tripod does not move.' },
        { text: 'Tilt until the eyes sit near the top line.', test: s => Math.abs(s.cam.tilt) >= 0.15,
          why: 'A tilt turns the camera up or down.' },
        { text: 'Press Centre and leave it there.', test: s => s.cam.pan === 0 && s.cam.tilt === 0,
          why: 'A locked shot. The frame stays still so viewers watch the person, not the camera.' }
      ]
    },
    'zoom-versus-camera-movement': {
      title: 'Studio: zoom in or move in',
      brief: 'Make the same close-up two ways. Watch the lens grow in the studio when you zoom, and the tripod move when you change marks.',
      departments: CAMERA_ONLY,
      camera: { controls: ['zoom'], move: true },
      goals: [
        { text: 'From the middle mark, zoom in to a Close-up.', test: s => s.cam.dist === 7 && s.cam.shot === 'Close-up',
          why: 'Zooming enlarges the middle of the picture. The camera stayed where it was.' },
        { text: 'Zoom back out to 14 mm or wider.', test: s => s.cam.focal <= 14,
          why: 'Back to the wide end of the lens.' },
        { text: 'Now move the camera to the close mark.', test: s => s.cam.dist === 4 && s.cam.focal <= 14 && s.cam.shot === 'Close-up',
          why: 'The same shot size, made by moving. On a real set this view feels closer and the background changes. This monitor uses one photo, so compare the two on a real camera.' }
      ]
    },

    /* ------------------------------------------------ Part 7: everything together */
    'interview-setup': {
      title: 'Studio: set up the whole interview',
      brief: 'All three departments are yours. Light the subject, frame the shot, mic the voice, then roll.',
      departments: { light: true, camera: true, sound: true },
      lockDepartments: false,
      layout: 'wide',
      fullLink: false,
      light: { marks: ['key', 'fill', 'back', 'side', 'front'], start: {}, setups: ['three', 'keyfill', 'off'] },
      camera: { start: { focal: 28, focus: 3, height: 'high' } },
      sound: { mics: ['lav', 'boom', 'camera-mic'], start: { id: 'empty', mics: [] }, setups: [] },
      goals: [
        { text: 'Light: build three-point lighting.', test: s => !!s.lights.key && !!s.lights.fill && !!s.lights.back,
          why: 'Key, fill and back light are in place.' },
        { text: 'Camera: frame a sharp Medium close-up at eye level.',
          test: s => s.cam.shot === 'Medium close-up' && s.cam.sharp && s.cam.height === 'eye',
          why: 'A medium close-up at eye level is the standard interview frame.' },
        { text: 'Sound: clip a lav at the collar.', test: s => s.sound.mics.lav?.variant === 'collar',
          why: 'The microphone is close to the mouth and out of the way.' },
        { text: 'Roll one whole take with the lav open and nothing clipping.',
          test: s => !!s.sound.lastTake?.full && !s.sound.lastTake.clipped && s.sound.heard.has('lav-collar') && !s.sound.boomInFrame,
          why: 'Seat, light, mic and frame were all checked before recording. That is an interview setup.' }
      ]
    }
  };

  window.TEXTBOOK_STUDIO_LESSONS = LESSONS;

  const T = window.Textbook;
  if (!T || !T.blocks) return;
  T.blocks['studio-room'] = block => {
    const lesson = LESSONS[block.lesson];
    if (!lesson || !window.ProductionStudio) {
      console.error('Studio lesson not available: ' + block.lesson);
      return { el: T.el('div', { className: 'placeholder' }, 'Studio activity unavailable.'), wide: true };
    }

    const url = new URL(T.url('production-studio/live.html'));
    url.searchParams.set('embed', '1');
    // Only the departments this topic teaches can be adjusted; the rest of the set stays as dressing.
    const departments = Object.keys(lesson.departments || {}).filter(key => lesson.departments[key]);
    if (departments.length) url.searchParams.set('dept', departments.join(','));
    const id = T.uid();
    const frame = T.el('iframe', { className: 'st-lesson-frame', id: id + '-live',
      title: 'Live 3D Studio', src: url.href, loading: 'lazy', height: '620' });
    const guide = T.el('div', { id: id + '-guided', className: 'studio-room', hidden: true });
    const liveButton = T.el('button', { type: 'button', 'aria-pressed': 'true', 'aria-controls': frame.id,
      onclick: () => chooseView(false) }, 'Live 3D Studio');
    const guideButton = T.el('button', { type: 'button', 'aria-pressed': 'false', 'aria-controls': guide.id,
      onclick: () => chooseView(true) }, 'Guided exercise');

    function chooseView(showGuide) {
      frame.hidden = showGuide;
      guide.hidden = !showGuide;
      liveButton.setAttribute('aria-pressed', String(!showGuide));
      guideButton.setAttribute('aria-pressed', String(showGuide));
      if (showGuide && !guide.firstChild) {
        window.ProductionStudio.mount(guide, {
          lockDepartments: true, ...lesson, ...(block.options || {}), embed: true, root: T.url('')
        });
      }
    }

    const frameOrigin = url.protocol === 'file:' ? 'null' : url.origin;
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || event.origin !== frameOrigin ||
          event.data?.type !== 'live-studio:size') return;
      const height = event.data.height;
      if (Number.isFinite(height) && height > 0) frame.height = Math.ceil(height);
    });
    const viewControls = T.el('div', { className: 'st-lesson-views', role: 'group', 'aria-label': 'Studio view' },
      liveButton, guideButton);
    const activity = T.el('div', { className: 'st-lesson no-print' }, viewControls, frame, guide);
    return { el: activity, wide: true, interactive: true, printNote: 'Studio activity: open this topic online to try it.' };
  };
})();
