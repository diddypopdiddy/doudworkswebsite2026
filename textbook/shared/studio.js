/* Production Studio: a fixed set view and a floor plan share the same equipment and marks.
   The monitor and mixer use the textbook's prepared photos and recordings. */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const MEDIA = window.TEXTBOOK_MEDIA || {};
  const CFG = window.TEXTBOOK_CONFIG || {};

  /* ---------- Small helpers ---------- */
  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'className') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'style') Object.assign(n.style, v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  }
  function svg(tag, attrs, ...kids) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) n.setAttribute(k, v);
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1);

  /* Which still each look uses, with the edge colours measured from each still so the monitor can zoom out
     past the photo's edges without a seam (tl/tr/bl/br wall corners, shirt at the bottom centre). */
  const LOOKS = {
    'p4-plot-off': { tl: '#454642', tr: '#41423d', bl: '#424240', br: '#3c3d39', shirt: '#0b0a12' },
    'p4-plot-key': { tl: '#52534d', tr: '#42433e', bl: '#4a4b47', br: '#3f403c', shirt: '#393b6a' },
    'p4-plot-fill': { tl: '#50514c', tr: '#43443f', bl: '#4b4c47', br: '#40413d', shirt: '#212035' },
    'p4-plot-back': { tl: '#4c4d48', tr: '#42433e', bl: '#474844', br: '#3f403c', shirt: '#0b0a12' },
    'p4-plot-key-fill': { tl: '#53544f', tr: '#474843', bl: '#4b4c48', br: '#42443f', shirt: '#32376b' },
    'p4-plot-key-back': { tl: '#50514c', tr: '#454641', bl: '#4a4a47', br: '#42433e', shirt: '#2d315e' },
    'p4-plot-fill-back': { tl: '#4d4e49', tr: '#454641', bl: '#484845', br: '#41423d', shirt: '#1c1a2a' },
    'p4-plot-key-fill-back': { tl: '#52534d', tr: '#4a4b46', bl: '#4b4b48', br: '#464743', shirt: '#3f3e67' },
    'p4-dir-front': { tl: '#595855', tr: '#555553', bl: '#595856', br: '#535350', shirt: '#1b2a84' },
    'p4-dir-side': { tl: '#595957', tr: '#464645', bl: '#5a5a59', br: '#484746', shirt: '#121e61' },
    'p4-dir-top': { tl: '#4c4c4b', tr: '#494949', bl: '#504f4f', br: '#4b4a4a', shirt: '#0d1645' },
    'p4-dir-under': { tl: '#454543', tr: '#454543', bl: '#52514f', br: '#504f4d', shirt: '#202a73' },
    'p4-fill-low': { tl: '#545550', tr: '#4f514c', bl: '#525351', br: '#4c4e4a', shirt: '#242e78' },
    'p4-fill-middle': { tl: '#545651', tr: '#51534e', bl: '#535351', br: '#4f514d', shirt: '#242f7d' },
    'p4-fill-high': { tl: '#565853', tr: '#555754', bl: '#555553', br: '#525451', shirt: '#2a3688' },
    'p4-fill-full': { tl: '#5c5e59', tr: '#5d5f5c', bl: '#595a57', br: '#585a58', shirt: '#2e3b97' },
    'p4-hard-edge': { tl: '#50544d', tr: '#595d57', bl: '#4f524b', br: '#5c615b', shirt: '#1f2d7d' },
    'p4-soft-edge': { tl: '#5a5d56', tr: '#565a53', bl: '#595c55', br: '#585d57', shirt: '#1f2c78' }
  };

  const LIGHT_SPOTS = [
    { id: 'key', name: 'Key light', short: 'Key', point: [-4.2, 0, 4.2], head: 6.5, where: '45° to camera left, a little above eye level',
      does: 'The main light. It sets the direction of the shadows and most of the brightness on the face.',
      see: 'One side of the face is bright. The nose throws a shadow onto the other cheek.', soft: true, level: 100,
      topic: ['4.06', 'three-point-lighting', 'Three-point lighting'] },
    { id: 'fill', name: 'Fill light', short: 'Fill', point: [4.2, 0, 4.2], head: 6, where: '45° to camera right, on the opposite side from the key',
      does: 'A weaker light that lifts the shadows the key leaves. Its level sets the contrast: low fill is dramatic, full fill is flat.',
      see: 'The shadow side of the face shows detail. Raise or lower the level and watch that cheek.', soft: true, level: 50,
      topic: ['4.05', 'fill-shadows-and-contrast', 'Fill, shadows and contrast'] },
    { id: 'back', name: 'Back light', short: 'Back', point: [1.6, 0, -3.6], head: 7.5, where: 'Behind the subject, aimed at the back of the head and shoulders',
      does: 'Separates the subject from the background with a bright rim on the hair and shoulders.',
      see: 'A thin bright edge outlines the hair and shoulders.', soft: false, level: 80,
      topic: ['4.06', 'three-point-lighting', 'Three-point lighting'] },
    { id: 'side', name: 'Side light', short: 'Side', point: [-5.8, 0, 0], head: 4.5, where: '90° to camera left, level with the face',
      does: 'Lights exactly half the face. Strong, moody and often used for drama.',
      see: 'One half of the face is lit and the other half falls into deep shadow.', soft: false, level: 100,
      topic: ['4.02', 'light-direction', 'Light direction'] },
    { id: 'front', name: 'Front light', short: 'Front', point: [-1.5, 0, 7.8], head: 5, where: 'Just left of the camera, pointing straight at the face',
      does: 'Fills every shadow. Easy and even, but the face looks flat because nothing shows its shape.',
      see: 'Both cheeks are evenly lit and there are almost no shadows.', soft: true, level: 100,
      topic: ['4.02', 'light-direction', 'Light direction'] },
    { id: 'top', name: 'Top light', short: 'Top', point: [0, 10.5, 0.6], head: 10.15, where: 'Straight overhead, hanging from the grid',
      does: 'Light from directly above, like a ceiling light or the noon sun.',
      see: 'The top of the head and nose are lit. The eye sockets and under the chin go dark.', soft: false, level: 100,
      topic: ['4.02', 'light-direction', 'Light direction'] },
    { id: 'under', name: 'Under light', short: 'Under', point: [0, 0, 2.3], head: 0.8, where: 'Low in front of the subject, pointing up',
      does: 'Light from below. Faces almost never get light from here in real life, so it looks unnatural or scary.',
      see: 'The chin and the underside of the nose are lit, and the shadows reach upward.', soft: false, level: 100,
      topic: ['4.02', 'light-direction', 'Light direction'] }
  ];

  /* Microphone spots. A spot with variants offers a placement choice in the inspector (collar or too low, etc.). */
  const MIC_SPOTS = [
    { id: 'lav', name: 'Lav microphone', short: 'Lav',
      does: 'A tiny microphone that rides with the speaker, so the distance to the mouth never changes.',
      topic: ['5.03', 'microphone-placement', 'Microphone placement'],
      variants: [
        { id: 'collar', point: [0.15, 3.55, 0.45], plan: [486, 231], label: 'At the collar', audio: 'p5-distance-lav-close', where: 'Clipped to the shirt, about 8 inches below the mouth',
          hear: 'Close, clear and steady, with very little room sound.' },
        { id: 'low', point: [0.1, 2.9, 0.5], plan: [514, 231], label: 'Clipped too low', audio: 'p5-distance-lav-middle', where: 'Clipped at the bottom of the shirt instead of the collar',
          hear: 'Quieter and thinner than at the collar. You have to raise the fader, and the room comes up with it. A common mistake when a lav is hidden in a hurry.' }] },
    { id: 'boom', name: 'Boom microphone', short: 'Boom',
      does: 'A shotgun microphone on a pole, aimed down at the mouth from above the frame. The film-set favourite: close but invisible.',
      topic: ['5.03', 'microphone-placement', 'Microphone placement'],
      variants: [
        { id: 'close', point: [-3.4, 0, 3], label: 'Just out of frame', audio: 'p5-distance-shotgun-close', where: 'About 2 feet above and in front of the mouth',
          hear: 'Clear and natural, with a little of the room around the voice. Watch the monitor: in a wide shot the boom dips into the frame.' },
        { id: 'high', point: [-3.4, 0, 4.6], label: 'Held too high', audio: 'p5-distance-shotgun-middle', where: 'Held about 4 feet away to stay well clear of the frame',
          hear: 'Safe from the frame, but thinner and more distant. Every extra foot trades voice for room.' }] },
    { id: 'desk', name: 'Desk microphone', short: 'Desk', point: [1.1, 2, 1.3], audio: 'p5-distance-close',
      where: 'On a small stand on the table, about 18 inches from the mouth',
      does: 'Close and simple. Good for a seated speaker who does not move, but it will be in the shot.',
      hear: 'Full and close.', topic: ['5.03', 'microphone-placement', 'Microphone placement'] },
    { id: 'phone', name: 'Phone on the table', short: 'Phone', point: [2.9, 2, 3.2], audio: 'p5-distance-middle',
      where: 'A phone recording on the table, about 4 feet away',
      does: 'What happens when the recorder is left wherever is convenient.',
      hear: 'The voice is weaker and the room sound is louder.', topic: ['5.03', 'microphone-placement', 'Microphone placement'] },
    { id: 'room', name: 'Room microphone', short: 'Room', point: [8, 0, 9], audio: 'p5-distance-far',
      where: 'Across the studio, about 12 feet away',
      does: 'Picks up the whole room. Useful for room tone and ambience, not for dialogue.',
      hear: 'Distant and echoey. The words are harder to follow.', topic: ['5.05', 'sound-clarity', 'Sound clarity'] }
  ];

  const CAM_SPOTS = [
    { id: 'close', name: 'Camera close', short: 'Close · 4 ft', point: [0, 0, 4], dist: 4 },
    { id: 'mid', name: 'Camera middle', short: 'Middle · 7 ft', point: [0, 0, 7], dist: 7 },
    { id: 'far', name: 'Camera far', short: 'Far · 10 ft', point: [0, 0, 10], dist: 10 }
  ];
  const CAM_NOTE = {
    close: 'Close to the subject. Even the widest zoom gives a close shot, and focus is less forgiving.',
    mid: 'A normal interview distance. The zoom covers everything from a medium close-up to an extreme close-up.',
    far: 'Farther back. Zoom in to fill the frame. A long lens from far away flattens the face slightly.'
  };

  const LIGHT_SETUPS = [
    { id: 'three', name: 'Three-point', lights: { key: { soft: true }, fill: { level: 50 }, back: {} },
      note: 'Key, fill and back. The classic interview setup: shape from the key, detail from the fill, separation from the back light.' },
    { id: 'keyfill', name: 'Key + fill', lights: { key: { soft: true }, fill: { level: 50 } },
      note: 'Two lights. The fill level sets the contrast between the bright and dark cheeks.' },
    { id: 'hard', name: 'Hard key', lights: { key: { soft: false } },
      note: 'One bare light. Hard light makes crisp, sharp-edged shadows.' },
    { id: 'soft', name: 'Soft key', lights: { key: { soft: true } },
      note: 'The same light through a softbox. Soft light wraps around the face and the shadow edges fade gradually.' },
    { id: 'rim', name: 'Rim only', lights: { back: {} },
      note: 'Only the back light. The face is dark and a bright outline separates the subject from the wall.' },
    { id: 'flat', name: 'Flat front', lights: { front: {} },
      note: 'A light beside the camera. Even and easy, but nothing shows the shape of the face.' },
    { id: 'side', name: 'Side', lights: { side: {} },
      note: 'Light from 90°. Half the face is lit and half is in shadow.' },
    { id: 'top', name: 'Top', lights: { top: {} },
      note: 'Light from overhead puts the eyes in shadow.' },
    { id: 'under', name: 'Under', lights: { under: {} },
      note: 'Light from below looks unnatural, which is why it is used for horror.' },
    { id: 'off', name: 'All off', lights: {}, note: 'No studio lights. Only the dim room light remains.' }
  ];

  const MIC_SETUPS = [
    { id: 'interview', name: 'Lav + boom', mics: ['lav', 'boom'],
      note: 'The usual interview kit: a lav as the main microphone and a boom as the backup. Compare them with the mute buttons.' },
    { id: 'boomonly', name: 'Boom only', mics: ['boom'], note: 'A single boom just out of frame.' },
    { id: 'camera', name: 'Camera mic', mics: [], camMic: true,
      note: 'Only the microphone on top of the camera. Move the camera back and listen to the voice get thinner.' },
    { id: 'compare', name: 'Near vs far', mics: ['desk', 'phone', 'room'],
      note: 'Three microphones at three distances. Only the desk microphone is open; unmute or solo the others to hear how distance changes the voice.' }
  ];

  /* ---------- Look (which still) for a set of lights ---------- */
  const DIR_STILL = { front: 'p4-dir-front', side: 'p4-dir-side', top: 'p4-dir-top', under: 'p4-dir-under', back: 'p4-plot-back', fill: 'p4-plot-fill' };
  function singleStill(id, l) {
    if (id === 'key') return l && l.soft === false ? 'p4-hard-edge' : 'p4-soft-edge';
    return DIR_STILL[id];
  }
  function chooseLook(lights) {
    const on = Object.keys(lights);
    const has = id => on.includes(id);
    if (!on.length) return { still: 'p4-plot-off', exact: true, main: null };
    if (on.every(id => id === 'key' || id === 'fill' || id === 'back')) {
      if (on.length === 1) return { still: singleStill(on[0], lights[on[0]]), exact: true, main: on[0] };
      if (on.length === 2 && has('key') && has('fill')) {
        const f = lights.fill.level;
        return { still: f <= 30 ? 'p4-fill-low' : f <= 55 ? 'p4-fill-middle' : f <= 80 ? 'p4-fill-high' : 'p4-fill-full', exact: true, main: 'key' };
      }
      return { still: 'p4-plot-' + ['key', 'fill', 'back'].filter(has).join('-'), exact: true, main: has('key') ? 'key' : 'fill' };
    }
    if (on.length === 1) return { still: singleStill(on[0], lights[on[0]]), exact: true, main: on[0] };
    const main = ['key', 'side', 'front', 'top', 'under', 'fill', 'back'].find(has);
    return { still: singleStill(main, lights[main]), exact: false, main };
  }

  /* ---------- Camera maths ---------- */
  const SENSOR_HALF_W = 8.65;           // Micro Four Thirds sensor, half width in mm (G97)
  function frameScale(cam) {            // 1 = the still's own framing (a medium close-up)
    const dist = CAM_SPOTS.find(c => c.id === cam.spot).dist;
    return (7.2 / dist) * Math.pow(cam.focal / 12, 0.68);
  }
  function shotName(s) {
    if (s < 0.9) return 'Medium shot';
    if (s < 1.35) return 'Medium close-up';
    if (s < 2.1) return 'Close-up';
    return 'Extreme close-up';
  }
  function blurPx(cam) {
    const dist = CAM_SPOTS.find(c => c.id === cam.spot).dist;
    const k = Math.pow(cam.focal / 60, 2) * 60;
    return clamp(k * Math.abs(1 / dist - 1 / cam.focus) * 2.2, 0, 12);
  }
  const FOCUS_MIN = 1.5, FOCUS_MAX = 30;
  const focusToSlider = f => Math.round(100 * Math.log(f / FOCUS_MIN) / Math.log(FOCUS_MAX / FOCUS_MIN));
  const sliderToFocus = v => FOCUS_MIN * Math.pow(FOCUS_MAX / FOCUS_MIN, v / 100);

  const PLAN_FT = 31;
  const PLAN_X = 500;
  const PLAN_Y = 218;
  const SNAP_FEET = 1.75;
  const HAZE_FEET = 5;
  const NEARBY_FEET = 6;
  const SOUND_START = 'Sound on. A lav and a boom are set up. Press Roll to hear them.';
  const TILE_LABELS = {
    light: 'Light', softbox: 'Softbox', lav: 'Lav', boom: 'Boom', desk: 'Desk mic',
    phone: 'Phone', room: 'Room mic', 'camera-mic': 'Camera mic'
  };
  const MIC_MARKS = MIC_SPOTS.flatMap(spot => spot.variants ? spot.variants.map(variant => ({
    ...spot, ...variant, id: spot.id + '-' + variant.id, short: variant.label, kind: spot.id, variant: variant.id
  })) : [{ ...spot, kind: spot.id }]);
  const MARKS = [
    ...LIGHT_SPOTS.map(spot => ({ ...spot, kind: 'light' })),
    ...CAM_SPOTS.map(spot => ({ ...spot, kind: 'camera', where: spot.dist + ' ft from the subject' })),
    ...MIC_MARKS
  ];
  const byMark = new Map(MARKS.map(mark => [mark.id, mark]));
  const HEIGHTS = { low: 3, eye: 3.8, high: 5.2 };
  let mounted = 0;
  const tone = kind => kind === 'light' || kind === 'softbox' ? 'light' : kind === 'camera' ? 'cam' : 'mic';
  const planPoint = ([x, , z]) => [PLAN_X + x * PLAN_FT, PLAN_Y + z * PLAN_FT];
  const planWorld = ([x, y], h = 0) => [(x - PLAN_X) / PLAN_FT, h, (y - PLAN_Y) / PLAN_FT];

  function createPlan(plan) {
    const pools = svg('g', { 'aria-hidden': 'true', 'pointer-events': 'none' });
    const kit = svg('g', { 'aria-hidden': 'true' });
    const sceneItems = new Map();
    let ghost;
    plan.append(svg('defs', {},
      svg('pattern', { id: 'st-plan-floor', width: PLAN_FT, height: PLAN_FT, patternUnits: 'userSpaceOnUse',
        x: PLAN_X % PLAN_FT, y: PLAN_Y % PLAN_FT },
      svg('path', { d: `M ${PLAN_FT} 0 H 0 V ${PLAN_FT}`, fill: 'none', stroke: '#282e34', 'stroke-width': 1 }))),
      svg('rect', { width: 1000, height: 625, fill: '#12161b' }),
      svg('rect', { x: 139, y: 24, width: 722, height: 592, rx: 5, fill: '#191e23', stroke: '#323940' }),
      svg('rect', { x: 139, y: 24, width: 722, height: 592, rx: 5, fill: 'url(#st-plan-floor)' }),
      svg('line', { x1: PLAN_X, x2: PLAN_X, y1: PLAN_Y, y2: 587, stroke: '#353e49', 'stroke-dasharray': '5 7' }),
      svg('path', { d: 'M 345 36 Q 500 22 655 36 L 655 52 Q 500 38 345 52 Z', fill: '#4a4b47', stroke: '#63645e' }),
      svg('text', { x: 500, y: 73, fill: '#a1a39d', 'font-size': 14, 'text-anchor': 'middle' }, 'Backdrop'),
      svg('rect', { x: 529, y: 249, width: 73, height: 78, rx: 6, fill: '#292d32', stroke: '#3c4349' }),
      svg('text', { x: 169, y: 586, fill: '#a3abb4', 'font-size': 15, 'letter-spacing': '1' }, '1 SQUARE = 1 FT'),
      pools,
      svg('g', { transform: `translate(${PLAN_X} ${PLAN_Y})`, 'aria-hidden': 'true' },
        svg('circle', { r: 20, fill: '#252c32', stroke: '#454e57' }),
        svg('ellipse', { cy: 3, rx: 23, ry: 10, fill: '#41649c' }),
        svg('circle', { r: 11, fill: '#a77b62' }),
        svg('path', { d: 'M -11 -1 A 11 11 0 0 1 11 -1 Q 0 -5 -11 -1 Z', fill: '#2b2523' }),
        svg('path', { d: 'M -3 10 L 0 15 L 3 10', fill: '#a77b62' })),
      kit);

    function icon(item) {
      const [x, y] = item.plan || planPoint(item.point);
      const target = Math.atan2(PLAN_Y - y, PLAN_X - x) * 180 / Math.PI;
      const group = svg('g', { 'data-st-art-item': item.id });
      const body = svg('g', { transform: `translate(${x} ${y})` });
      const equipment = svg('g', { transform: `rotate(${target})` });
      if (item.kind === 'light') {
        const width = item.soft ? 34 : 21;
        body.append(svg('path', { d: 'M -13 10 L 0 0 L 13 10 M 0 0 L 0 -15', stroke: '#697078', 'stroke-width': 2 }));
        equipment.append(svg('rect', { x: -9, y: -width / 2, width: 18, height: width, rx: 3, fill: '#373b41', stroke: '#d4a455', 'stroke-width': 1.5 }),
          svg('rect', { x: 7, y: 1 - width / 2, width: 4, height: width - 2, rx: 1, fill: '#ffe2a0', opacity: Math.max(0.25, item.level / 100) }));
        body.append(equipment);
      } else if (item.kind === 'camera') {
        body.append(svg('g', { transform: `rotate(${item.pan * 25})` },
          svg('path', { d: 'M -15 12 L 0 0 L 15 12 M 0 0 L 0 -19', stroke: '#6d7d90', 'stroke-width': 2 }),
          svg('rect', { x: -13, y: -8, width: 26, height: 19, rx: 4, fill: '#2d3746', stroke: '#8ca5d8', 'stroke-width': 1.5 }),
          svg('rect', { x: -6, y: -18 - (item.focal - 12) / 12, width: 12, height: 11 + (item.focal - 12) / 12, rx: 2, fill: '#141a22', stroke: '#8ca5d8' }),
          item.mic ? svg('rect', { x: 10, y: -21, width: 6, height: 18, rx: 3, fill: '#234541', stroke: '#74c9bf' }) : null,
          item.rolling ? svg('circle', { cx: -8, cy: -5, r: 3, fill: '#ff5f58', 'data-st-tally': 'on' }) : null));
      } else if (item.kind === 'softbox') {
        body.append(svg('path', { d: 'M -13 -12 L 12 -16 L 12 16 L -13 12 Z', fill: '#e0d9c8', stroke: '#9d9b96' }));
      } else {
        if (item.kind === 'boom') {
          const tip = planPoint(item.variant === 'high' ? [-0.6, 0, 3.2] : [-0.3, 0, 1.6]);
          const base = planPoint(byMark.get(item.mark || 'boom-close').point);
          const tx = tip[0] + x - base[0], ty = tip[1] + y - base[1];
          group.append(svg('line', { x1: x, y1: y, x2: tx, y2: ty, stroke: '#879da0', 'stroke-width': 3 }),
            svg('circle', { cx: tx, cy: ty, r: 5, fill: '#829c9b', stroke: '#9ce4d9' }));
        }
        if (item.kind === 'lav') body.append(svg('circle', { r: 6, fill: '#182321', stroke: '#85d2c7', 'stroke-width': 1.5 }));
        else body.append(svg('rect', { x: -6, y: -10, width: 12, height: 20, rx: 3, fill: '#263c3a', stroke: '#74c9bf', 'stroke-width': 1.5 }));
      }
      group.append(body);
      return group;
    }

    function render(scene) {
      ghost = null;
      sceneItems.clear();
      pools.replaceChildren();
      kit.replaceChildren();
      for (const item of scene.items) {
        if (item.kind === 'light' && item.id !== scene.dragged) {
          const [x, y] = planPoint(item.point);
          const a = Math.atan2(PLAN_Y - y, PLAN_X - x);
          const length = Math.hypot(PLAN_X - x, PLAN_Y - y) + 38;
          const spread = length * (item.soft ? 0.43 : 0.22);
          pools.append(svg('path', { transform: `translate(${x} ${y}) rotate(${a * 180 / Math.PI})`,
            d: `M 0 0 L ${length} ${-spread} L ${length} ${spread} Z`, fill: '#fbd588', opacity: 0.22 * item.level / 100 }));
        }
        if (item.kind === 'camera' && item.id === scene.selected) {
          const [x, y] = planPoint(item.point);
          const len = Math.min(y - 44, 320);
          const width = Math.tan(Math.atan(SENSOR_HALF_W / item.focal)) * len;
          pools.append(svg('path', { transform: `translate(${x} ${y}) rotate(${item.pan * 25})`,
            d: `M 0 0 L ${-width} ${-len} L ${width} ${-len} Z`, fill: '#6a96ff', opacity: 0.17 }));
        }
        if (item.id === scene.selected && tone(item.kind) === 'mic') drawPickup(item);
        if (item.mic && scene.selected === 'camera-mic') {
          const [x, y] = planPoint(item.point);
          drawPickup({ kind: 'camera-mic', plan: [x + 19, y - 11] });
        }
        const node = icon({ ...item, rolling: scene.rolling });
        sceneItems.set(item.id, node);
        kit.append(node);
      }
    }
    function drawPickup(item) {
      const [x, y] = item.kind === 'boom' ?
        planPoint(item.variant === 'high' ? [-0.6, 0, 3.2] : [-0.3, 0, 1.6]) :
        item.plan || planPoint(item.point);
      const style = { fill: '#6de3d1', opacity: 0.16, stroke: '#9bf4e5', 'stroke-width': 1.2 };
      if (item.kind === 'room' || item.kind === 'phone' || item.kind === 'lav') {
        pools.append(svg('circle', { ...style, cx: x, cy: y, r: item.kind === 'lav' ? 19 : 36 }));
      } else {
        const angle = Math.atan2(PLAN_Y - y, PLAN_X - x) * 180 / Math.PI;
        const narrow = item.kind === 'boom' || item.kind === 'camera-mic';
        pools.append(svg('path', { ...style, transform: `translate(${x} ${y}) rotate(${angle})`,
          d: narrow ? 'M 0 0 Q 37 -15 65 0 Q 37 15 0 0 Z' : 'M 0 0 C 12 -30 54 -23 54 0 C 54 23 12 30 0 0 Z' }));
      }
    }
    function drag(item) {
      if (ghost) {
        sceneItems.get(ghost.dataset.stArtItem)?.removeAttribute('visibility');
        ghost.remove();
        ghost = null;
      }
      if (!item) return;
      sceneItems.get(item.id)?.setAttribute('visibility', 'hidden');
      ghost = icon(item);
      ghost.setAttribute('class', 'st-ghost ' + tone(item.kind));
      kit.append(ghost);
    }
    return { render, drag };
  }

  /* ---------- Options ----------
     One engine serves the free studio and every lesson. A lesson turns departments on or off, locks the
     switches, and narrows the kit to the tools its topic teaches (see shared/studio-lessons.js). */
  const DEPTS = {
    light: { name: 'Lighting', on: 'Lighting on. Add, move and dim the lights.',
      off: 'Lighting off. The lights stay where they are and the lighting kit is put away.' },
    camera: { name: 'Camera', on: 'Camera on. Select the camera to zoom, focus and move it.',
      off: 'Camera off. The camera stays where it is.' },
    sound: { name: 'Sound' }
  };
  const CAM_CONTROLS = ['zoom', 'focus', 'pan', 'tilt', 'height', 'grid'];
  const MIC_KINDS = ['lav', 'boom', 'desk', 'phone', 'room', 'camera-mic'];
  const FULL_FRAME = [0, 0, 1000, 625];
  function settings(opts) {
    const light = opts.light || {}, camera = opts.camera || {};
    const sound = opts.sound && typeof opts.sound === 'object' ? opts.sound : {};
    const depts = opts.departments || {};
    const listed = (list, all) => list == null ? all :
      list.map(entry => typeof entry === 'string' ? all.find(option => option.id === entry) : entry).filter(Boolean);
    const C = {
      embed: !!opts.embed,
      compact: !!opts.embed && opts.layout !== 'wide',
      lock: !!opts.lockDepartments,
      title: opts.title || 'Production Studio',
      brief: opts.brief || '',
      goals: opts.goals || [],
      fullLink: opts.fullLink !== false,
      guides: opts.guides || 'subtle',
      select: opts.select,
      dept: {
        light: depts.light !== false,
        camera: depts.camera !== false,
        sound: opts.sound === true || sound.on === true || depts.sound === true
      },
      lightMarks: light.marks || LIGHT_SPOTS.map(spot => spot.id),
      lightMax: clamp(light.max ?? 3, 0, 3),
      softbox: light.softbox !== false,
      dimmer: light.dimmer !== false,
      removable: light.removable !== false,
      fixedLights: light.fixed || [],
      lightSetups: listed(light.setups, LIGHT_SETUPS),
      lightStart: light.start ?? 'three',
      camControls: camera.controls || CAM_CONTROLS,
      camMove: camera.move !== false,
      camStart: camera.start || {},
      mics: sound.mics || MIC_KINDS,
      micSetups: listed(sound.setups, MIC_SETUPS),
      micStart: sound.start === undefined ? 'interview' : sound.start
    };
    C.frame = Array.isArray(opts.frame) ? opts.frame : (opts.frame === 'auto' || (C.embed && opts.frame !== 'full')) ? autoFrame(C) : FULL_FRAME;
    return C;
  }
  /* The tightest 16:10 view of the set that still shows every mark this studio can use. */
  function autoFrame(C) {
    const points = [[0, 0, 0], [0, 5.4, 0], [0, 0, 7], [0, 5.7, 7], [-1.2, 0, 1], [1.2, 0, 1]];
    const startMarks = typeof C.lightStart === 'string' ?
      Object.keys((LIGHT_SETUPS.find(setup => setup.id === C.lightStart) || { lights: {} }).lights) : Object.keys(C.lightStart || {});
    const setupMarks = C.dept.light ? C.lightSetups.flatMap(setup => Object.keys(setup.lights)) : [];
    for (const id of new Set([...(C.dept.light ? C.lightMarks : []), ...startMarks, ...setupMarks])) {
      const spot = LIGHT_SPOTS.find(option => option.id === id);
      if (!spot) continue;
      const [x, y, z] = spot.point;
      points.push(y > 0 ? [x, y - 1.6, z] : [x, 0, z], [x, y > 0 ? y : spot.head + 1.1, z], [x - 1.3, spot.head, z], [x + 1.3, spot.head, z]);
    }
    if (C.dept.camera && C.camMove) CAM_SPOTS.forEach(spot => points.push(spot.point, [0, 5.7, spot.dist], [-1.2, 0, spot.dist], [1.2, 0, spot.dist]));
    if (C.dept.sound) {
      if (C.mics.includes('boom')) points.push([-3.4, 0, 3], [-3.4, 0, 4.6], [-0.6, 8, 3.2], [-4.6, 0, 3.8]);
      if (C.mics.includes('desk') || C.mics.includes('phone')) points.push([3.4, 0, 3.6], [3.4, 2.4, 3.6], [0.8, 2.6, 1]);
      if (C.mics.includes('room')) points.push([8, 0, 9], [8, 6.4, 9], [9, 0, 9.4]);
    }
    const shown = points.map(point => window.Studio3D.project(point));
    const left = Math.min(...shown.map(p => p.sx)) - 42, right = Math.max(...shown.map(p => p.sx)) + 42;
    const top = Math.min(...shown.map(p => p.sy)) - 30, bottom = Math.max(...shown.map(p => p.sy)) + 34;
    // The stage takes the shape of what it has to show, between 5:4 and 16:10.
    const aspect = clamp((right - left) / (bottom - top), 1.25, 1.6);
    const w = Math.max(right - left, (bottom - top) * aspect, 440);
    if (w >= 960) return FULL_FRAME;
    const h = w / aspect;
    const x = clamp((left + right - w) / 2, 0, 1000 - w), y = clamp((top + bottom - h) / 2, 0, 625 - h);
    return [x, y, w, h].map(value => Math.round(value));
  }

  /* ---------- App ---------- */
  function mount(host, opts) {
    opts = opts || {};
    const C = settings(opts);
    const root = new URL(opts.root || './', location.href);
    const mediaBase = new URL(CFG.mediaBase || 'media/', root);
    const mediaURL = id => MEDIA[id] ? new URL(MEDIA[id].file, mediaBase).href : '';
    const topicURL = slug => new URL('topics/' + slug + '/index.html', root).href;
    const startsWithSound = C.dept.sound || (!C.embed && location.hash === '#sound');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const uid = 'st' + (++mounted) + '-';
    const lightSetup = id => [...C.lightSetups, ...LIGHT_SETUPS].find(option => option.id === id);
    const micSetup = id => typeof id === 'string' ? [...C.micSetups, ...MIC_SETUPS].find(option => option.id === id) : id;
    function startLights() {
      const lights = typeof C.lightStart === 'string' ? (lightSetup(C.lightStart) || { lights: {} }).lights : C.lightStart || {};
      return Object.entries(lights).slice(0, 3).map(([mark, settings], i) =>
        ({ ...makeLight('light-' + (i + 1), mark, settings), locked: C.fixedLights.includes(mark) }));
    }
    const start = () => ({
      view: 'set', guides: C.guides,
      dept: { light: C.dept.light, camera: C.dept.camera },
      items: startLights(),
      cam: { spot: 'mid', focal: 14, focus: 7, pan: 0, tilt: 0, height: 'eye', grid: false, ...C.camStart },
      sound: { on: startsWithSound, initialized: startsWithSound, mics: {}, micOrder: [], camMic: null, master: 0.9, loop: false },
      hand: null, sel: null, setup: typeof C.lightStart === 'string' ? C.lightStart : null, micSetup: null,
      takes: 0, heard: new Set(), clipped: false
    });
    let S = start();
    if (startsWithSound && C.micStart) loadMicSetup(C.micStart);
    S.sel = defaultSelection();

    const live = el('div', { className: 'st-live', 'aria-live': 'polite', 'aria-atomic': 'true' });
    let announcement;
    const app = el('main', { className: 'st-app' + (C.embed ? ' st-embed' : '') + (C.compact ? ' st-compact' : ''), 'data-st-studio': '' });
    host.classList.add('st-host');
    host.replaceChildren(app);
    const setupSelect = (kind, label, setups, apply) => {
      const select = el('select', { className: 'st-glass st-setup-select ' + kind, 'aria-label': label, 'data-st-setups': kind,
        onchange: () => { if (select.value) apply(select.value); } },
      el('option', { value: '', text: label }), setups.map(setup => el('option', { value: setup.id, text: setup.name })));
      return select;
    };
    const lightSelect = setupSelect('light', 'Lighting setup', C.lightSetups, id => applyLightSetup(id));
    const micSelect = setupSelect('mic', 'Sound setup', C.micSetups, id => applyMicSetup(id));
    const switches = {};
    for (const key of Object.keys(DEPTS)) {
      const state = el('span', { className: 'st-switch-state', 'aria-hidden': 'true' });
      switches[key] = { state, button: el('button', {
        type: 'button', className: 'st-dept-switch ' + key + (key === 'sound' ? ' st-sound-switch' : ''), role: 'switch',
        'data-st-dept': key, 'aria-label': DEPTS[key].name, onclick: () => (key === 'sound' ? toggleSound() : toggleDept(key))
      }, el('span', { className: 'st-switch-name', text: DEPTS[key].name }),
      el('span', { className: 'st-switch-track', 'aria-hidden': 'true' }), state) };
    }
    const deptOn = key => key === 'sound' ? S.sound.on : S.dept[key];
    const departments = C.lock ? null :
      el('div', { className: 'st-depts', role: 'group', 'aria-label': 'Departments' }, Object.values(switches).map(item => item.button));

    /* A lesson shows one instruction at a time. Progress is a hairline across the top of the card. */
    const progress = el('div', { className: 'st-progress', role: 'progressbar', 'aria-label': 'Steps done',
      'aria-valuemin': 0, 'aria-valuemax': C.goals.length });
    const stepN = el('span', { className: 'st-step-n' });
    const stepText = el('p', { className: 'st-step-text' });
    const why = el('p', { className: 'st-why', text: C.brief });
    let goalState = C.goals.map(() => false);
    if (C.goals.length) app.append(progress);
    const bar = el('header', { className: 'st-bar' },
      C.goals.length ? el('div', { className: 'st-step' }, stepN, stepText) :
        el('div', { className: 'st-title' }, el(C.embed ? 'h3' : 'h1', { text: C.title }),
          C.embed ? null : el('a', { href: new URL('index.html', root).href, text: 'Textbook home' })),
      C.embed ? null : el('a', { className: 'st-quiet st-live-link',
        href: new URL('production-studio/live.html', root).href, text: 'Live 3D Studio' }),
      departments,
      el('button', { type: 'button', className: 'st-quiet st-reset', onclick: reset }, C.embed ? 'Start over' : 'Reset'));
    app.append(bar);

    const tiles = new Map();
    const kitTray = el('div', { className: 'st-kit-tray' });
    const kitPanel = el('section', { className: 'st-kit', 'aria-label': 'Kit' }, kitTray);
    for (const [kind, name] of Object.entries(TILE_LABELS)) {
      if (tone(kind) === 'mic' ? !C.mics.includes(kind) : kind === 'softbox' ? !C.softbox : !C.removable && S.items.length >= C.lightMax) continue;
      const count = el('span', { className: 'st-tile-count' });
      const icon = window.StudioKit.icon(kind);
      icon.setAttribute('aria-hidden', 'true');
      const button = el('button', {
        type: 'button', className: 'st-tile ' + tone(kind), 'data-st-tile': kind,
        onclick: event => activateTile(kind, event.detail === 0, event.currentTarget)
      }, icon, el('div', {}, el('strong', { text: name }), count));
      tiles.set(kind, { button, count });
    }

    const stage = el('div', { className: 'st-stage' });
    const viewButtons = ['set', 'plan'].map(view => el('button', {
      type: 'button', className: 'st-btn', 'data-st-view': view, onclick: () => changeView(view)
    }, view === 'set' ? 'Set' : 'Plan'));
    const guidesButton = el('button', { type: 'button', className: 'st-btn', 'data-st-guides': '',
      'aria-label': 'Placement guides', 'aria-expanded': 'false', 'aria-controls': uid + 'guide-menu', onclick: () => {
        const open = guideMenu.hidden;
        if (open) closePlaceMenu();
        guideMenu.hidden = !open;
        guidesButton.setAttribute('aria-expanded', String(open));
        if (open) guideMenu.querySelector('[aria-pressed="true"]').focus();
      }
    }, '⋯');
    const guideOptions = ['subtle', 'hidden', 'visible'].map(mode => el('button', {
      type: 'button', 'data-st-guide-setting': mode, onclick: () => {
        S.guides = mode;
        closeGuideMenu(true);
        updateStudioControls();
        drawGuides();
      }
    }, 'Placement guides: ' + mode));
    const guideMenu = el('div', { id: uid + 'guide-menu', className: 'st-guide-menu', role: 'group', 'aria-label': 'Placement guides', hidden: true }, guideOptions);
    const placeOptions = el('div', { role: 'menu', 'aria-labelledby': uid + 'place-h' });
    const placeMenu = el('div', { className: 'st-place-menu', hidden: true },
      el('h3', { id: uid + 'place-h', text: 'Place on…' }), placeOptions);
    const studioPanel = el('section', { className: 'st-plan', 'aria-label': 'Studio' },
      el('div', { className: 'st-stage-wrap' }, stage,
        el('div', { className: 'st-corner tl' }, lightSelect, micSelect),
        el('div', { className: 'st-corner tr' },
          el('div', { className: 'st-view-tabs', role: 'group', 'aria-label': 'Studio view' }, viewButtons),
          el('div', { className: 'st-guides' }, guidesButton, guideMenu)),
        placeMenu), kitPanel);
    app.append(studioPanel);

    const views = {};
    for (const [name, label, create] of [
      ['set', 'Studio, seen from behind the camera', window.StudioKit.create],
      ['plan', 'Studio floor plan, seen from above', createPlan]
    ]) {
      const canvas = svg('svg', { class: 'st-' + name + '-svg', viewBox: (name === 'set' ? C.frame : FULL_FRAME).join(' '),
        role: 'group', 'aria-label': label });
      const renderer = create(canvas);
      const guideLayer = svg('g', { 'aria-hidden': 'true', 'pointer-events': 'none' });
      const labelLayer = svg('g', { 'aria-hidden': 'true', 'pointer-events': 'none' });
      const targetLayer = svg('g');
      const effectLayer = svg('g', { 'aria-hidden': 'true', 'pointer-events': 'none' });
      const focusLayer = svg('g', { 'aria-hidden': 'true', 'pointer-events': 'none' });
      canvas.append(svg('defs', {}, svg('radialGradient', { id: uid + 'placement-' + name },
        svg('stop', { offset: '0', 'stop-color': '#fff' }),
        svg('stop', { offset: '.5', 'stop-color': '#fff', 'stop-opacity': '.6' }),
        svg('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }))),
        guideLayer, effectLayer, targetLayer, focusLayer, labelLayer);
      views[name] = { canvas, renderer, guideLayer, labelLayer, targetLayer, effectLayer, focusLayer, targets: new Map() };
    }
    stage.append(views.set.canvas);
    stage.style.aspectRatio = C.frame[2] + ' / ' + C.frame[3];
    const scene = () => views[S.view];
    const frame = () => S.view === 'set' ? C.frame : FULL_FRAME;
    /* Screen pixels expressed in drawing units, so labels stay readable at any stage size or zoom. */
    const px = n => n * frame()[2] / (stage.clientWidth || 800);

    const inspectBody = el('div', { className: 'st-inspect-body' });
    const inspectPanel = el('section', { className: 'st-inspect', 'aria-label': 'Selected equipment' }, inspectBody);

    const imgA = el('img', { alt: '', draggable: 'false' });
    const imgB = el('img', { alt: '', draggable: 'false', style: { opacity: 0 } });
    const torso = el('div', { className: 'st-torso' });
    const boom = svgBoom();
    const photoBox = el('div', { className: 'st-photo-box' }, torso, imgA, imgB);
    const world = el('div', { className: 'st-world' }, photoBox);
    const roTL = el('div', { className: 'st-ro tl' });
    const roTR = el('div', { className: 'st-ro tr' });
    const roBL = el('div', { className: 'st-ro bl' });
    const roBR = el('div', { className: 'st-ro br' });
    const grid = el('div', { className: 'st-grid', hidden: true });
    const monMeterL = el('b'), monMeterR = el('b');
    const monMeters = el('div', { className: 'st-mon-meter', 'aria-hidden': 'true' }, el('i', {}, monMeterL), el('i', {}, monMeterR));
    const overlay = el('div', { className: 'st-overlay' }, grid, roTL, roTR, roBL, roBR);
    const screen = el('div', { className: 'st-screen', role: 'img' }, world, overlay);
    const caption = el('div', { className: 'st-caption' });
    const tc = el('time', { className: 'st-tc', 'aria-label': 'Take timecode', text: '00:00:00' });
    const rollBtn = el('button', { type: 'button', className: 'st-roll', onclick: () => (playing ? stop() : roll()) }, 'Roll');
    const camBtn = el('button', { type: 'button', className: 'st-btn st-cam-open', onclick: () => {
      selectItem('camera');
      camControls.querySelector('input, button')?.focus({ preventScroll: true });
    } }, 'Camera controls');

    const zoom = el('input', { type: 'range', min: 12, max: 60, step: 1, id: uid + 'zoom', 'data-st-cam': 'zoom' });
    const zoomOut = el('output', { for: uid + 'zoom' });
    const focus = el('input', { type: 'range', min: 0, max: 100, step: 1, id: uid + 'focus', 'data-st-cam': 'focus' });
    const focusOut = el('output', { for: uid + 'focus' });
    const pan = el('input', { type: 'range', min: -100, max: 100, step: 1, id: uid + 'pan', 'data-st-cam': 'pan' });
    const tilt = el('input', { type: 'range', min: -100, max: 100, step: 1, id: uid + 'tilt', 'data-st-cam': 'tilt' });
    const heightSeg = el('div', { className: 'st-seg', role: 'group', 'aria-label': 'Camera height' },
      ['low', 'eye', 'high'].map(height => el('button', { type: 'button', 'data-h': height, onclick: () => {
        const before = captureScene();
        S.cam.height = height;
        renderCameraChange();
        animateChanges(before, 150);
        say(heightLabel(height) + '.');
      } }, height === 'eye' ? 'Eye level' : height[0].toUpperCase() + height.slice(1))));
    const afBtn = el('button', { type: 'button', className: 'st-btn', 'aria-label': 'Autofocus', onclick: autoFocus }, 'AF');
    const gridBtn = el('button', { type: 'button', className: 'st-btn', onclick: () => { S.cam.grid = !S.cam.grid; renderMonitor(); } }, 'Thirds grid');
    const centreBtn = el('button', { type: 'button', className: 'st-btn', onclick: () => { S.cam.pan = 0; S.cam.tilt = 0; renderCameraChange(); } }, 'Centre');

    zoom.addEventListener('input', () => { S.cam.focal = +zoom.value; renderCameraChange(); });
    focus.addEventListener('input', () => { S.cam.focus = sliderToFocus(+focus.value); renderMonitor(); });
    pan.addEventListener('input', () => { S.cam.pan = +pan.value / 100; renderCameraChange(); });
    tilt.addEventListener('input', () => { S.cam.tilt = +tilt.value / 100; renderCameraChange(); });

    const has = control => C.camControls.includes(control);
    const camControls = el('div', { className: 'st-cam-controls' },
      has('zoom') ? el('div', { className: 'st-ctl' }, el('label', { for: uid + 'zoom', text: 'Zoom' }), zoom, zoomOut) : null,
      has('focus') ? el('div', { className: 'st-ctl' }, el('label', { for: uid + 'focus', text: 'Focus' }), focus, el('span', { className: 'st-focus-actions' }, focusOut, afBtn)) : null,
      has('pan') ? el('div', { className: 'st-ctl' }, el('label', { for: uid + 'pan', text: 'Pan' }), pan, has('tilt') ? el('span') : centreBtn) : null,
      has('tilt') ? el('div', { className: 'st-ctl' }, el('label', { for: uid + 'tilt', text: 'Tilt' }), tilt, centreBtn) : null,
      has('height') ? el('div', { className: 'st-ctl st-height-control' }, el('span', { text: 'Height' }), heightSeg) : null,
      has('grid') ? el('div', { className: 'st-ctl st-height-control' }, el('span', { text: 'Guides' }), gridBtn) : null);

    const monitorPanel = el('section', { className: 'st-monitor', 'aria-label': 'Camera monitor' },
      el('div', { className: 'st-bezel' }, screen, el('div', { className: 'st-monitor-actions' }, tc, rollBtn)),
      C.embed && (C.brief || C.goals.length) ? why : null, caption);
    app.append(el('div', { className: 'st-side' }, monitorPanel, inspectPanel));

    const strips = el('div', { className: 'st-strips' });
    const tip = el('div', { className: 'st-tip' });
    const audioRack = el('div', { hidden: true });
    const loopBtn = el('button', { type: 'button', className: 'st-btn', 'aria-pressed': 'false', onclick: () => {
      S.sound.loop = !S.sound.loop;
      loopBtn.setAttribute('aria-pressed', String(S.sound.loop));
    } }, 'Loop');
    const mixer = el('section', { className: 'st-panel st-mixer', 'aria-labelledby': uid + 'mix-h' },
      el('div', { className: 'st-panel-head' }, el('h2', { id: uid + 'mix-h', text: 'Mixing board' }),
        el('span', { className: 'st-sub', text: 'Press Roll to listen' }),
        el('div', { className: 'st-transport' }, loopBtn)), strips, tip, audioRack);
    app.append(live);

    function syncSoundUI() {
      app.classList.toggle('st-sound-on', S.sound.on);
      app.classList.toggle('st-sound-off', !S.sound.on);
      app.classList.toggle('st-side-controls', S.dept.camera && !S.dept.light && !S.sound.on);
      for (const [key, item] of Object.entries(switches)) {
        item.button.setAttribute('aria-checked', String(deptOn(key)));
        item.state.textContent = deptOn(key) ? 'On' : 'Off';
      }
      lightSelect.hidden = !(S.dept.light && C.lightSetups.length);
      micSelect.hidden = !(S.sound.on && C.micSetups.length);
      // In a lesson, Roll only matters when there is something to hear.
      rollBtn.hidden = tc.hidden = C.embed && !S.sound.on;
      if (S.sound.on) {
        if (!mixer.isConnected) app.insertBefore(mixer, live);
        if (!boom.isConnected) photoBox.append(boom);
        if (!monMeters.isConnected) overlay.append(monMeters);
        loopBtn.setAttribute('aria-pressed', String(S.sound.loop));
      } else {
        mixer.remove();
        boom.remove();
        monMeters.remove();
      }
      const showCam = S.dept.camera && S.sel !== 'camera';
      if (showCam !== camBtn.isConnected) showCam ? caption.after(camBtn) : camBtn.remove();
    }
    /* Whether the student may select, move or adjust this piece of equipment right now. */
    function editable(item) {
      if (!item) return false;
      if (item.kind === 'light') return S.dept.light && !item.locked;
      if (item.kind === 'camera') return S.dept.camera;
      return S.sound.on;
    }
    function defaultSelection() {
      if (C.select && editable(runtimeItem(C.select))) return C.select;
      const light = S.dept.light && S.items.find(item => !item.locked);
      if (light) return light.id;
      if (S.dept.camera) return 'camera';
      return S.sound.on ? S.sound.micOrder[0] || (S.sound.camMic ? 'camera-mic' : null) : null;
    }
    function toggleDept(key) {
      endHand();
      S.dept[key] = !S.dept[key];
      if (!editable(runtimeItem(S.sel))) S.sel = defaultSelection();
      renderAll();
      say(DEPTS[key][S.dept[key] ? 'on' : 'off']);
    }

    /* ---------- Equipment and views ---------- */
    function makeLight(id, mark, settings = {}) {
      const spot = byMark.get(mark);
      return { id, kind: 'light', mark, level: settings.level ?? spot.level, soft: settings.soft ?? spot.soft };
    }
    function freeLightId() {
      if (S.items.length >= C.lightMax) return null;
      return ['light-1', 'light-2', 'light-3'].find(id => !S.items.some(item => item.id === id));
    }
    const lightsByMark = () => Object.fromEntries(S.items.map(item => [item.mark, item]));
    const softboxTargets = () => S.items.filter(item => !item.soft && !item.locked);
    const softboxesLeft = () => softboxTargets().length;
    const cameraMicMark = () => ({
      id: 'camera-mic', kind: 'camera-mic', name: 'Camera microphone', short: 'Camera mic', where: 'On top of the camera',
      point: [-0.12, HEIGHTS[S.cam.height] + 1, byMark.get(S.cam.spot).dist],
      plan: [PLAN_X + 19, PLAN_Y + byMark.get(S.cam.spot).dist * PLAN_FT - 11]
    });
    function runtimeItem(id) {
      if (id === 'camera') return { ...S.cam, id, kind: 'camera', mark: S.cam.spot, point: byMark.get(S.cam.spot).point,
        mic: S.sound.on && !!S.sound.camMic && S.hand?.id !== 'camera-mic' };
      const light = S.items.find(item => item.id === id);
      if (light) return { ...byMark.get(light.mark), ...light };
      if (!S.sound.on) return null;
      if (id === 'camera-mic') return S.sound.camMic ? { ...cameraMicMark(), mark: 'camera-mic' } : null;
      const channel = S.sound.mics[id];
      if (!channel) return null;
      const mark = byMark.get(channel.variant ? id + '-' + channel.variant : id);
      return { ...mark, id, mark: mark.id };
    }
    function visibleItems() {
      return ['camera', ...S.items.map(item => item.id), ...(S.sound.on ? S.sound.micOrder : []),
        ...(S.sound.on && S.sound.camMic ? ['camera-mic'] : [])].map(runtimeItem);
    }
    function screenPoint(mark) {
      if (S.view === 'plan') return mark.plan || planPoint(mark.point);
      const { sx, sy } = window.Studio3D.project(mark.point);
      return [sx, sy];
    }
    function clientPoint(event) {
      const rect = stage.getBoundingClientRect();
      if (!inside(rect, event)) return null;
      return toCanvas(event.clientX, event.clientY);
    }
    function toCanvas(x, y) {
      const matrix = scene().canvas.getScreenCTM();
      if (!matrix) return null;
      const point = new DOMPoint(x, y).matrixTransform(matrix.inverse());
      return [point.x, point.y];
    }
    function inside(rect, event) {
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    }
    function itemLabel(item) {
      if (item.kind === 'camera') return 'Camera, ' + byMark.get(item.mark).dist + ' feet from the subject';
      if (item.kind === 'light') return 'Light on ' + item.short + ', ' + item.where + ', ' + (item.soft ? 'softbox' : 'bare') + ', dimmer ' + item.level + '%';
      return item.name + (item.variant ? ', ' + item.short.toLowerCase() : ', ' + item.where);
    }
    function renderStage() {
      const active = scene();
      const items = visibleItems();
      active.renderer.render({
        items: items.filter(item => item.kind !== 'camera-mic'), selected: S.sel, rolling: playing,
        dragged: S.hand?.id || null
      });
      renderTargets(active, items.filter(editable));
      for (const item of items) artNode(item.id)?.classList.toggle('st-fixed', !editable(item));
      drawGuides();
      if (S.hand?.ghost) active.renderer.drag(S.hand.ghost);
    }
    function renderTargets(active, items) {
      const keep = new Set(items.map(item => item.id));
      for (const [id, target] of active.targets) {
        if (!keep.has(id)) {
          target.node.remove();
          target.outline.remove();
          active.targets.delete(id);
        }
      }
      let previous = null;
      for (const item of items) {
        let target = active.targets.get(item.id);
        if (!target) {
          const hit = svg('circle', { fill: 'transparent' });
          const body = svg('rect', { fill: 'transparent' });
          const outline = svg('rect', { class: 'st-focus-outline', rx: 6 });
          const title = svg('title');
          const node = svg('g', { class: 'st-hit', role: 'button', tabindex: 0, 'data-st-item': item.id,
            'aria-keyshortcuts': item.kind === 'camera' ? 'M' : 'M Delete' }, title, body, hit);
          node.addEventListener('focus', () => {
            if (!node.matches(':focus-visible')) return;
            active.focusLayer.replaceChildren(outline);
            if (S.view === 'plan') active.focusLayer.append(chosenLabel(runtimeItem(node.dataset.stItem)));
          });
          node.addEventListener('blur', () => active.focusLayer.replaceChildren());
          active.targets.set(item.id, target = { node, title, hit, body, outline });
        }
        if (target.node !== (previous ? previous.nextElementSibling : active.targetLayer.firstElementChild)) {
          active.targetLayer.insertBefore(target.node, previous ? previous.nextElementSibling : active.targetLayer.firstElementChild);
        }
        previous = target.node;
        const { node, title, hit, body, outline } = target;
        const [x, y] = screenPoint(item);
        const r = item.kind === 'lav' || item.kind === 'camera-mic' ? 13 : 22;
        node.setAttribute('data-st-mark', item.mark);
        node.setAttribute('aria-pressed', String(S.sel === item.id));
        node.setAttribute('aria-label', itemLabel(item));
        title.textContent = S.view === 'plan' ? itemLabel(item) : '';
        hit.setAttribute('cx', x);
        hit.setAttribute('cy', y);
        hit.setAttribute('r', r);
        // Use the complete equipment silhouette for keyboard focus.
        const artwork = active.canvas.querySelector('[data-st-art-item="' + item.id + '"]');
        const box = artwork?.getBBox() || { x: x - r, y: y - r, width: r * 2, height: r * 2 };
        outline.setAttribute('x', box.x - 5);
        outline.setAttribute('y', box.y - 5);
        outline.setAttribute('width', box.width + 10);
        outline.setAttribute('height', box.height + 10);
        // The whole piece of equipment is the handle, not just its base. Long arms keep a slimmer handle
        // so a boom pole does not cover the equipment underneath it.
        const slim = item.kind === 'boom' || S.view === 'plan';
        const grab = slim ? { x: x - r, y: y - r, width: r * 2, height: r * 2 } : box;
        body.setAttribute('x', grab.x - 3);
        body.setAttribute('y', grab.y - 3);
        body.setAttribute('width', grab.width + 6);
        body.setAttribute('height', grab.height + 6);
      }
    }
    function chosenLabel(item) {
      const [x, y] = screenPoint(item);
      return svg('text', { class: 'st-drop-label', ...labelAt(x, y - px(15)) },
        item.kind === 'light' ? item.short + ' · ' + item.where.split(',')[0] : item.short || item.name);
    }
    function labelAt(x, y) {
      const [fx, fy, fw, fh] = frame();
      return { x: clamp(x, fx + px(96), fx + fw - px(96)), y: clamp(y, fy + px(20), fy + fh - px(10)), 'text-anchor': 'middle',
        style: `font-size:${px(13).toFixed(1)}px;stroke-width:${px(4).toFixed(1)}px` };
    }
    function changeView(view) {
      if (view === S.view) return;
      finishEffects();
      scene().renderer.drag(null);
      S.view = view;
      stage.replaceChildren(scene().canvas);
      if (S.hand) {
        S.hand.pointer = null;
        S.hand.snap = null;
        S.hand.ghost = null;
      }
      renderStage();
      updateStudioControls();
      say(view === 'set' ? 'Set view.' : 'Plan view. Each square is one foot.');
    }
    function updateStudioControls() {
      viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stView === S.view)));
      guideOptions.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stGuideSetting === S.guides)));
    }
    function renderKit() {
      for (const [kind, tile] of tiles) {
        if (tone(kind) === 'mic' ? !S.sound.on : !S.dept.light) { tile.button.remove(); continue; }
        if (!tile.button.isConnected) kitTray.append(tile.button);
        const count = kind === 'light' ? C.lightMax - S.items.length : kind === 'softbox' ? softboxesLeft() : runtimeItem(kind) ? 0 : 1;
        tile.button.disabled = count === 0;
        tile.button.setAttribute('aria-pressed', String(S.hand?.origin === 'kit' && S.hand.kind === kind));
        tile.count.textContent = count ? '×' + count : kind === 'softbox' && !softboxTargets().length && S.items.length < C.lightMax ? 'Needs a light' : 'All in use';
      }
      kitPanel.hidden = !kitTray.childElementCount;
    }

    function say(message) {
      clearTimeout(announcement);
      live.textContent = '';
      announcement = setTimeout(() => { live.textContent = message; }, 25);
    }
    function selectItem(id) {
      if (S.sel === id || !editable(runtimeItem(id))) return;
      S.sel = id;
      syncSoundUI();
      renderStage();
      renderInspector();
      if (S.sound.on) renderMixer();
    }
    function loadMicSetup(id) {
      const setup = micSetup(id);
      S.sound.mics = {};
      S.sound.micOrder = [...setup.mics];
      setup.mics.forEach((mic, i) => {
        const muted = setup.open ? !setup.open.includes(mic) : (setup.id === 'interview' || setup.id === 'compare') && i > 0;
        S.sound.mics[mic] = { ...newCh(mic), mute: muted, ...(setup.variants?.[mic] ? { variant: setup.variants[mic] } : {}) };
      });
      S.sound.camMic = setup.camMic ? newCh('camera') : null;
      S.micSetup = setup.id || null;
      return setup;
    }
    function toggleSound() {
      if (S.hand && tone(S.hand.kind) === 'mic') cancelHand(false);
      const selected = runtimeItem(S.sel);
      stop(true);
      Object.keys(audios).forEach(dropAudio);
      S.sound.on = !S.sound.on;
      if (S.sound.on && !S.sound.initialized) {
        S.sound.initialized = true;
        if (C.micStart) loadMicSetup(C.micStart);
        say(C.micStart === 'interview' ? SOUND_START : 'Sound on. Press Roll to hear the setup.');
      } else if (S.sound.on) {
        say('Sound on. Press Roll to hear the setup.');
      } else {
        if (selected && tone(selected.kind) === 'mic') S.sel = null;
        say('Sound off. Microphones and the mixing board are hidden.');
      }
      if (!editable(runtimeItem(S.sel))) S.sel = defaultSelection();
      renderAll();
    }
    function applyLightSetup(id) {
      endHand();
      const before = captureScene();
      const setup = lightSetup(id);
      // Keep a fixture on its current mark whenever the new setup uses that mark. Fixed lights never leave.
      const keep = S.items.filter(item => item.locked && !(item.mark in setup.lights));
      const used = new Set(keep.map(item => item.id));
      const assignments = Object.entries(setup.lights).map(([mark, settings]) => {
        const old = S.items.find(item => item.mark === mark);
        if (old) used.add(old.id);
        return { mark, settings, id: old?.id, locked: old?.locked };
      });
      const spare = ['light-1', 'light-2', 'light-3'].filter(id => !used.has(id));
      S.items = [...keep, ...assignments.map(option =>
        ({ ...makeLight(option.id || spare.shift(), option.mark, option.settings), locked: option.locked }))];
      S.setup = id;
      S.sel = S.items.find(item => !item.locked)?.id || defaultSelection();
      renderAll();
      animateChanges(before, 300);
      say('Lighting setup: ' + setup.name + '. ' + setup.note);
    }
    function applyMicSetup(id) {
      endHand();
      const before = captureScene();
      const wasPlaying = playing;
      stop(true);
      Object.keys(audios).forEach(dropAudio);
      const setup = loadMicSetup(id);
      S.sel = S.sound.micOrder[0] || (setup.camMic ? 'camera-mic' : defaultSelection());
      renderAll();
      animateChanges(before, 300);
      if (wasPlaying) roll(true);
      say('Sound setup: ' + setup.name + '. ' + setup.note);
    }
    function reset() {
      endHand();
      finishEffects();
      stop(true);
      Object.keys(audios).forEach(dropAudio);
      S = start();
      if (S.sound.on && C.micStart) loadMicSetup(C.micStart);
      S.sel = defaultSelection();
      goalState = C.goals.map(() => false);
      why.textContent = C.brief;
      tc.textContent = '00:00:00';
      stage.replaceChildren(scene().canvas);
      renderAll();
      say(C.embed ? 'Started over.' : 'Studio reset.');
    }
    function autoFocus() {
      S.cam.focus = byMark.get(S.cam.spot).dist;
      renderMonitor();
      say('Focused on the subject at ' + fmt1(S.cam.focus) + ' feet.');
    }
    const heightLabel = h => h === 'low' ? 'Low angle: the camera looks up at the subject' :
      h === 'high' ? 'High angle: the camera looks down at the subject' : 'Eye level';

    /* ---------- Placement ---------- */
    let pointerAction = null;
    let moveFrame = 0;
    let suppressClick = false;
    let menuOrigin = null;

    function availableMarks(kind) {
      if (kind === 'softbox') return softboxTargets().map(item => {
        const mark = byMark.get(item.mark);
        return { ...mark, kind, targetId: item.id, plan: planPoint(mark.point), point: [mark.point[0], mark.head, mark.point[2]] };
      });
      if (kind === 'camera-mic') return [cameraMicMark()];
      if (kind === 'light') return MARKS.filter(mark => mark.kind === kind && C.lightMarks.includes(mark.id) &&
        !S.items.some(item => item.locked && item.mark === mark.id));
      if (kind === 'camera' && !C.camMove) return [];
      return MARKS.filter(mark => mark.kind === kind);
    }
    function isOccupied(mark, hand) {
      if (mark.kind === 'light') return S.items.some(item => item.mark === mark.id && item.id !== hand?.id);
      if (mark.kind === 'camera') return mark.id === S.cam.spot && hand?.id !== 'camera';
      if (mark.kind === 'softbox') return false;
      const id = mark.kind === 'camera-mic' ? 'camera-mic' : mark.kind;
      return !!runtimeItem(id) && id !== hand?.id;
    }
    function displayableMarks() {
      const kinds = [...(S.dept.light ? ['light'] : []), ...(S.dept.camera ? ['camera'] : []),
        ...(S.sound.on ? C.mics.filter(kind => kind !== 'camera-mic') : [])];
      return kinds.flatMap(availableMarks).filter(mark => !isOccupied(mark, null));
    }
    function distanceTo(mark, coords, floor) {
      const [x, y] = coords;
      if (S.view === 'plan') {
        const [mx, my] = screenPoint(mark);
        return Math.hypot(x - mx, y - my) / PLAN_FT;
      }
      if (mark.point[1] > 0) {
        const p = window.Studio3D.project(mark.point);
        return Math.hypot(x - p.sx, y - p.sy) / p.scale;
      }
      return floor ? Math.hypot(floor[0] - mark.point[0], floor[2] - mark.point[2]) : Infinity;
    }
    function nearestMarks(coords, hand) {
      const floor = S.view === 'set' ? window.Studio3D.unprojectFloor(...coords) : null;
      return availableMarks(hand.kind).map(mark => ({ mark, distance: distanceTo(mark, coords, floor) }))
        .sort((a, b) => a.distance - b.distance);
    }
    function dropAt(coords) {
      if (!coords) { cancelHand(true); return; }
      const ranked = nearestMarks(coords, S.hand);
      const snapped = ranked.find(candidate => candidate.distance <= SNAP_FEET);
      const nearby = ranked.find(candidate => candidate.distance <= NEARBY_FEET && !isOccupied(candidate.mark, S.hand));
      if (snapped || nearby) placeOn((snapped || nearby).mark, { duration: snapped ? 120 : 200, overshoot: !!snapped });
      else cancelHand(true);
    }
    function markLabel(mark) {
      if (mark.kind === 'light' || mark.kind === 'softbox') return mark.short + ' · ' + mark.where.split(',')[0];
      return mark.short || mark.name;
    }
    function drawGuides(ranked = null) {
      const { guideLayer, labelLayer } = scene();
      guideLayer.replaceChildren();
      labelLayer.replaceChildren();
      const selected = runtimeItem(S.sel);
      const hand = S.hand;
      if (selected && !hand && S.view === 'set' && selected.kind === 'light') labelLayer.append(chosenLabel(selected));
      if (S.guides === 'hidden') return;
      let guides = [];
      if (hand?.pointer) {
        guides = (ranked || nearestMarks(hand.pointer, hand)).filter(candidate => candidate.distance <= HAZE_FEET);
      } else if (hand?.snap) {
        guides = [{ mark: hand.snap, distance: 0 }];
      } else if (!hand && S.guides === 'visible') {
        guides = displayableMarks().map(mark => ({ mark, distance: HAZE_FEET }));
      }
      for (const { mark, distance } of guides) {
        const [x, y] = screenPoint(mark);
        const scale = S.view === 'plan' ? PLAN_FT : window.Studio3D.project(mark.point).scale;
        const radius = clamp(scale * 1.1, 15, 49);
        const snapped = hand?.snap?.id === mark.id;
        const elevated = S.view === 'set' && mark.point[1] > 0;
        const ry = elevated || S.view === 'plan' ? radius * 0.75 : radius * 0.36;
        const opacity = snapped ? 0.22 : 0.04 + (HAZE_FEET - Math.max(distance, SNAP_FEET)) * 0.10 / (HAZE_FEET - SNAP_FEET);
        const haze = svg('ellipse', { cx: x, cy: y, rx: radius, ry, class: 'st-mark-haze',
          style: `fill:url(#${uid}placement-${S.view});opacity:${opacity}` });
        const nodes = [haze];
        if (snapped) {
          nodes.push(svg('ellipse', { cx: x, cy: y, rx: radius - 1, ry: Math.max(1, ry - 1),
            fill: 'none', stroke: '#fff', 'stroke-opacity': '.30', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke' }));
          if (elevated && mark.kind !== 'lav') {
            const base = window.Studio3D.project([mark.point[0], 0, mark.point[2]]);
            nodes.push(svg('line', { class: 'st-drop-line', x1: x, y1: y + ry, x2: base.sx, y2: base.sy }));
          } else if (elevated && hand.pointer) {
            nodes.push(svg('line', { class: 'st-drop-line', x1: hand.pointer[0], y1: hand.pointer[1], x2: x, y2: y }));
          }
          labelLayer.append(svg('text', { class: 'st-drop-label', ...labelAt(x, y - ry - px(7)) }, markLabel(mark)));
        }
        guideLayer.append(svg('g', { 'data-st-guide': mark.id }, nodes));
      }
    }
    function activateTile(kind, keyboard, source) {
      if (S.hand?.origin === 'kit' && S.hand.kind === kind && !keyboard) {
        cancelHand(false);
        return;
      }
      if (!beginHand(kind, null, source)) return;
      const marks = availableMarks(kind);
      if (marks.length === 1 || (kind === 'lav' && !keyboard)) {
        placeOn(marks[0], { duration: 200, focusItem: keyboard });
      } else if (keyboard) {
        openPlaceMenu(source);
      } else {
        say(TILE_LABELS[kind] + ' in hand. Click in the studio to place it.');
      }
    }
    function pickItem(id, keyboard, source) {
      const item = runtimeItem(id);
      if (!item || !beginHand(item.kind, id, source)) return;
      if (keyboard) openPlaceMenu(source);
      else say((item.name || 'Camera') + ' in hand. Click in the studio to move it.');
    }
    function beginHand(kind, id, source) {
      if (id && !editable(runtimeItem(id))) return false;
      if (!availableMarks(kind).length) {
        if (kind === 'softbox') say('Place a bare light before adding a softbox.');
        return false;
      }
      endHand();
      finishEffects();
      const item = id ? runtimeItem(id) : null;
      if (item) S.sel = id;
      S.hand = { kind, id, item, source, origin: id ? 'room' : 'kit', started: performance.now(),
        pointer: null, snap: null, ignored: null, ignoreUntil: 0, head: item?.head, mark: item?.mark };
      stage.classList.add('st-in-hand');
      stage.classList.toggle('st-from-kit', !item);
      renderKit();
      renderStage();
      if (item) renderInspector();
      return true;
    }
    function endHand() {
      closePlaceMenu();
      cancelAnimationFrame(moveFrame);
      moveFrame = 0;
      S.hand = null;
      scene().renderer.drag(null);
      stage.classList.remove('st-in-hand', 'st-from-kit', 'st-dragging');
      kitPanel.classList.remove('st-receiving');
    }
    function cancelHand(refocus, returnToStart = false) {
      const hand = S.hand;
      if (!hand) return;
      const before = captureScene(hand);
      endHand();
      renderStage();
      renderKit();
      if (returnToStart) {
        animateChanges(before, 200);
        say(hand.item ? (hand.item.name || 'Camera') + ' returned to ' + markLabel(hand.item) + '.' : TILE_LABELS[hand.kind] + ' returned to the kit.');
      } else {
        say('Placement cancelled.');
      }
      if (refocus) focusOrigin(hand);
    }
    function focusOrigin(hand) {
      const target = hand.id ? scene().targets.get(hand.id)?.node : tiles.get(hand.kind)?.button;
      if (target && !target.disabled) target.focus({ preventScroll: true });
    }
    function chooseDropLabel(mark) {
      const location = mark.kind === 'camera' || !mark.where ? '' : ' · ' + mark.where;
      return mark.short + location + (isOccupied(mark, S.hand) ? ' (swap)' : '');
    }
    function openPlaceMenu(source) {
      menuOrigin = source;
      closeGuideMenu();
      placeOptions.replaceChildren(...availableMarks(S.hand.kind).map(mark => {
        const button = el('button', { type: 'button', role: 'menuitem', 'data-st-drop': mark.id, tabindex: -1,
          onfocus: () => previewMark(mark), onpointerenter: () => previewMark(mark),
          onclick: () => placeOn(mark, { duration: 120, focusItem: true })
        }, chooseDropLabel(mark));
        return button;
      }));
      placeMenu.hidden = false;
      placeOptions.firstElementChild?.focus({ preventScroll: true });
    }
    function closePlaceMenu() {
      placeMenu.hidden = true;
      menuOrigin = null;
    }
    function closeGuideMenu(refocus = false) {
      guideMenu.hidden = true;
      guidesButton.setAttribute('aria-expanded', 'false');
      if (refocus) guidesButton.focus({ preventScroll: true });
    }
    function previewMark(mark) {
      if (!S.hand) return;
      S.hand.pointer = null;
      S.hand.snap = mark;
      S.hand.drawn = mark.point;
      paintGhost(mark.point, mark, 0.15);
      drawGuides();
    }
    function paintGhost(point, mark, lift) {
      const hand = S.hand;
      const look = hand.item || (hand.kind === 'light' ? byMark.get(mark?.id || 'key') : {});
      const ghost = {
        ...look, id: hand.id || 'in-hand', kind: hand.kind, mark: mark?.id || hand.mark,
        point, plan: mark?.plan, head: hand.head ?? mark?.head ?? look.head ?? 5.8,
        level: look.level ?? 75, variant: mark?.variant || hand.item?.variant, lift
      };
      hand.ghost = ghost;
      scene().renderer.drag(ghost);
    }
    function queueMove(coords) {
      const hadPreview = S.hand.pointer || S.hand.snap || S.hand.ghost;
      S.hand.pointer = coords;
      if (!coords) {
        if (!hadPreview) return;
        S.hand.snap = null;
        S.hand.ghost = null;
        cancelAnimationFrame(moveFrame);
        moveFrame = 0;
        scene().renderer.drag(null);
        drawGuides();
      } else if (!moveFrame) {
        moveFrame = requestAnimationFrame(moveGhost);
      }
    }
    function moveGhost(now) {
      moveFrame = 0;
      const hand = S.hand;
      if (!hand?.pointer) return;
      const ranked = nearestMarks(hand.pointer, hand);
      const nearest = ranked.find(({ mark, distance }) => distance <= SNAP_FEET && (mark.id !== hand.ignored || now >= hand.ignoreUntil));
      const snap = nearest?.mark || null;
      if (snap?.id !== hand.snap?.id && hand.snap) {
        hand.ignored = hand.snap.id;
        hand.ignoreUntil = now + 250;
        hand.releasing = !snap;
      }
      hand.snap = snap;
      const h = tone(hand.kind) === 'mic' && hand.kind !== 'boom' ? (hand.item?.point[1] || availableMarks(hand.kind)[0].point[1]) : 0;
      const pointerWorld = S.view === 'plan' ? planWorld(hand.pointer, h) : window.Studio3D.unprojectFloor(...hand.pointer, h);
      const destination = snap?.point || pointerWorld;
      if (!destination) return;
      const drawAt = hand.drawn || hand.item?.point || destination;
      const easePosition = !reducedMotion.matches && (snap || hand.releasing);
      const draw = easePosition ? drawAt.map((v, i) => v + (destination[i] - v) * 0.35) : destination;
      const remaining = Math.hypot(...draw.map((v, i) => v - destination[i]));
      hand.drawn = remaining < 0.015 ? destination : draw;
      if (remaining < 0.015) hand.releasing = false;
      let grow = 0;
      if (snap?.head != null) {
        const current = hand.head ?? hand.item?.head ?? 5.8;
        if (hand.mount !== snap.id) {
          hand.mount = snap.id;
          hand.fromHead = current;
          hand.headSince = now;
        }
        grow = reducedMotion.matches ? 0 : Math.max(0, 1 - (now - hand.headSince) / 150);
        hand.head = snap.head + (hand.fromHead - snap.head) * grow;
        hand.mark = snap.id;
      }
      const lift = reducedMotion.matches ? 0 : 0.3 * clamp((now - hand.started) / 100, 0, 1);
      paintGhost(hand.drawn, snap, lift);
      drawGuides(ranked);
      if (remaining >= 0.015 || grow > 0 || (!reducedMotion.matches && lift < 0.3)) moveFrame = requestAnimationFrame(moveGhost);
    }
    function placeOn(mark, opts = {}) {
      const hand = S.hand;
      if (!hand || !availableMarks(hand.kind).some(candidate => candidate.id === mark.id)) return;
      const before = captureScene(hand);
      let id = hand.id;
      let message;
      let changedAudio;
      if (hand.kind === 'light') {
        const current = S.items.find(item => item.id === id);
        const newId = current ? null : freeLightId();
        const occupant = S.items.find(item => item.mark === mark.id && item.id !== id);
        if (occupant && current) {
          const former = byMark.get(current.mark);
          occupant.mark = former.id;
          message = former.name + ' moved to ' + mark.short + '. The light on ' + mark.short + ' moved to ' + former.short + '.';
        } else if (occupant) {
          S.items = S.items.filter(item => item.id !== occupant.id);
          message = mark.name + ' placed. The previous light on ' + mark.short + ' returned to the kit.';
        }
        if (current) {
          message ||= current.mark === mark.id ? mark.name + ' set down.' : byMark.get(current.mark).name + ' moved to ' + mark.short + '.';
          current.mark = mark.id;
        } else {
          id = newId;
          S.items.push(makeLight(id, mark.id));
          message ||= mark.name + ' placed.';
        }
        S.setup = null;
      } else if (hand.kind === 'softbox') {
        id = mark.targetId;
        S.items.find(item => item.id === id).soft = true;
        S.setup = null;
        message = 'Softbox added to the ' + mark.name.toLowerCase() + '.';
      } else if (hand.kind === 'camera') {
        S.cam.spot = mark.id;
        changedAudio = 'camera';
        message = 'Camera at ' + mark.dist + ' feet. Focus is ' + (blurPx(S.cam) < 0.7 ? 'sharp.' : 'soft. Press AF or turn the focus ring.');
      } else if (hand.kind === 'camera-mic') {
        id = 'camera-mic';
        S.sound.camMic ||= newCh('camera');
        S.micSetup = null;
        message = 'Camera microphone placed on channel ' + (S.sound.micOrder.length + 1) + '.';
      } else {
        id = hand.kind;
        const ch = S.sound.mics[id];
        if (ch) {
          ch.variant = mark.variant || null;
          changedAudio = id;
          message = mark.name + ': ' + mark.short.toLowerCase() + '.';
        } else {
          S.sound.mics[id] = { ...newCh(id), variant: mark.variant || null };
          S.sound.micOrder.push(id);
          message = mark.name + ' placed on channel ' + S.sound.micOrder.length + '.';
        }
        S.micSetup = null;
      }
      if (before && hand.ghost && hand.origin === 'kit' && hand.kind !== 'softbox' && !before.items.has(id)) {
        before.items.set(id, hand.ghost);
      }
      S.sel = id;
      endHand();
      if (changedAudio) resetChannelAudio(changedAudio);
      renderAll();
      animateChanges(before, opts.duration || 120, opts.overshoot);
      pulse(mark);
      if (opts.focusItem) scene().targets.get(id)?.node.focus({ preventScroll: true });
      say(message);
    }
    const canReturn = item => item.kind !== 'camera' && editable(item) && (item.kind !== 'light' || C.removable);
    function returnItem(id, refocus = false) {
      const item = runtimeItem(id);
      if (!item || !canReturn(item)) return;
      const before = captureScene(S.hand);
      endHand();
      if (item.kind === 'light') {
        S.items = S.items.filter(light => light.id !== id);
        S.setup = null;
      } else {
        if (id === 'camera-mic') {
          S.sound.camMic = null;
          dropAudio('camera');
        } else {
          delete S.sound.mics[id];
          S.sound.micOrder = S.sound.micOrder.filter(mic => mic !== id);
          dropAudio(id);
        }
        S.micSetup = null;
      }
      S.sel = defaultSelection();
      renderAll();
      animateChanges(before, 200);
      if (refocus) tiles.get(item.kind)?.button.focus({ preventScroll: true });
      say(item.name + ' returned to the kit.');
    }
    function moveByArrow(item, key) {
      const [dx, dy] = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] })[key];
      const [x, y] = screenPoint(item);
      const options = availableMarks(item.kind).filter(mark => mark.id !== item.mark && !isOccupied(mark, item)).map(mark => {
        const [mx, my] = screenPoint(mark);
        const sx = mx - x, sy = my - y;
        return { mark, distance: Math.hypot(sx, sy), forward: sx * dx + sy * dy };
      }).filter(option => option.forward > option.distance * 0.35);
      options.sort((a, b) => a.distance - b.distance);
      if (!options.length) { say('No free placement mark in that direction.'); return; }
      beginHand(item.kind, item.id, document.activeElement);
      placeOn(options[0].mark, { focusItem: true });
    }

    /* ---------- Pointer and keyboard input ---------- */
    function hitId(target) {
      return target.closest('[data-st-item]')?.dataset.stItem || target.closest('[data-st-art-item]')?.dataset.stArtItem;
    }
    stage.addEventListener('click', event => {
      if (S.hand) { dropAt(clientPoint(event)); return; }
      const id = hitId(event.target);
      if (id && runtimeItem(id)) selectItem(id);
    });
    app.addEventListener('click', event => {
      if (suppressClick && event.detail > 0) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }, true);
    app.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      const tile = event.target.closest('[data-st-tile]');
      const id = !S.hand && stage.contains(event.target) ? hitId(event.target) : null;
      const found = id && runtimeItem(id);
      const item = editable(found) && (availableMarks(found.kind).length > 1 || canReturn(found)) ? found : null;
      if ((!tile || tile.disabled) && !item) return;
      pointerAction = {
        id: event.pointerId, source: tile || scene().targets.get(id)?.node, item: item || null,
        kind: tile ? tile.dataset.stTile : item.kind, x: event.clientX, y: event.clientY, dragging: false
      };
    });
    window.addEventListener('pointermove', event => {
      if (pointerAction?.id === event.pointerId && !pointerAction.dragging &&
          Math.hypot(event.clientX - pointerAction.x, event.clientY - pointerAction.y) >= 4) {
        if (!beginHand(pointerAction.kind, pointerAction.item?.id || null, pointerAction.source)) { pointerAction = null; return; }
        pointerAction.dragging = true;
        stage.classList.add('st-dragging');
        try { pointerAction.source.setPointerCapture(event.pointerId); } catch { /* The pointer may have already ended. */ }
      }
      if (!S.hand || !placeMenu.hidden) return;
      const returning = pointerAction?.dragging && S.hand.origin === 'room' && canReturn(S.hand.item) && inside(kitPanel.getBoundingClientRect(), event);
      kitPanel.classList.toggle('st-receiving', !!returning);
      queueMove(clientPoint(event));
    });
    window.addEventListener('pointerup', event => {
      if (pointerAction?.id !== event.pointerId) return;
      const { dragging } = pointerAction;
      pointerAction = null;
      if (!dragging || !S.hand) return;
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      if (S.hand.origin === 'room' && canReturn(S.hand.item) && inside(kitPanel.getBoundingClientRect(), event)) returnItem(S.hand.id);
      else {
        const coords = clientPoint(event);
        if (coords) dropAt(coords);
        else cancelHand(false, true);
      }
    });
    window.addEventListener('pointercancel', event => {
      if (pointerAction?.id !== event.pointerId) return;
      pointerAction = null;
      if (S.hand) cancelHand(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (!guideMenu.hidden) {
        closeGuideMenu(true);
        event.preventDefault();
      } else if (S.hand) {
        const source = menuOrigin;
        const hand = S.hand;
        cancelHand(false);
        if (source?.isConnected) source.focus({ preventScroll: true });
        else focusOrigin(hand);
        event.preventDefault();
      }
    });
    app.addEventListener('keydown', event => {
      const key = event.key;
      if (placeOptions.contains(event.target)) {
        const options = Array.from(placeOptions.children);
        const index = options.indexOf(event.target);
        let next;
        if (key === 'ArrowDown') next = (index + 1) % options.length;
        if (key === 'ArrowUp') next = (index + options.length - 1) % options.length;
        if (key === 'Home') next = 0;
        if (key === 'End') next = options.length - 1;
        if (next != null) { event.preventDefault(); options[next].focus({ preventScroll: true }); }
        if (key === 'Tab') {
          const source = menuOrigin;
          cancelHand(false);
          if (source?.isConnected) source.focus({ preventScroll: true });
        }
        return;
      }
      const item = runtimeItem(event.target.closest('[data-st-item]')?.dataset.stItem);
      if (!item) return;
      if (key === 'Enter' || key === ' ') { event.preventDefault(); selectItem(item.id); }
      if (key.toLowerCase() === 'm') { event.preventDefault(); pickItem(item.id, true, event.target); }
      if ((key === 'Delete' || key === 'Backspace') && canReturn(item)) { event.preventDefault(); returnItem(item.id, true); }
      if (key.startsWith('Arrow')) { event.preventDefault(); moveByArrow(item, key); }
    });
    document.addEventListener('pointerdown', event => {
      if (!guideMenu.hidden && !event.target.closest('.st-guides')) closeGuideMenu();
      if (!placeMenu.hidden && !placeMenu.contains(event.target) && !event.target.closest('[data-st-tile]')) {
        closePlaceMenu();
        if (S.hand) { S.hand.snap = null; queueMove(clientPoint(event)); }
      }
    });

    /* ---------- Equipment motion ---------- */
    const effects = new Set();
    function artNode(id) {
      return scene().canvas.querySelector('[data-st-art-item="' + id + '"]');
    }
    function captureScene(hand = null) {
      finishEffects();
      if (reducedMotion.matches) return null;
      const items = new Map(visibleItems().map(item => [item.id, item]));
      const art = new Map();
      for (const id of items.keys()) {
        const source = artNode(id);
        if (source) {
          const copy = source.cloneNode(true);
          copy.removeAttribute('data-st-art-item');
          copy.removeAttribute('visibility');
          art.set(id, copy);
        }
      }
      if (hand?.ghost && hand.id) items.set(hand.id, hand.ghost);
      return { items, art };
    }
    function finishEffects() {
      for (const effect of effects) effect.cancel();
      effects.clear();
      scene().effectLayer.replaceChildren();
    }
    function animateChanges(before, duration, overshoot = false) {
      if (!before || reducedMotion.matches) return;
      const after = new Map(visibleItems().map(item => [item.id, item]));
      const room = stage.getBoundingClientRect();
      const tray = kitTray.getBoundingClientRect();
      const kitPoint = toCanvas(tray.left + Math.min(tray.width / 2, 125), room.bottom + 16) || [frame()[0], frame()[1] + frame()[3]];
      const move = (node, from, to, remove = false) => {
        if (!node) return;
        const dx = from[0] - to[0], dy = from[1] - to[1];
        if (Math.hypot(dx, dy) < 1) return;
        const start = `translate(${dx}px, ${dy}px)`;
        const over = `translate(${-dx * 0.02}px, ${-dy * 0.02}px)`;
        const keyframes = remove ? [{ transform: 'none' }, { transform: start, opacity: 0 }] :
          [{ transform: start }, ...(overshoot ? [{ transform: over, offset: 0.82 }] : []), { transform: 'none' }];
        const motion = node.animate(keyframes, { duration, easing: 'cubic-bezier(.21,.70,.28,1)' });
        effects.add(motion);
        motion.addEventListener('finish', () => { effects.delete(motion); if (remove) node.remove(); }, { once: true });
      };
      for (const [id, item] of after) {
        const previous = before.items.get(id);
        const to = screenPoint(item);
        const from = previous ? screenPoint(previous) : kitPoint;
        move(artNode(id), from, to);
      }
      for (const [id, previous] of before.items) {
        if (after.has(id)) continue;
        const copy = before.art.get(id);
        if (!copy) continue;
        scene().effectLayer.append(copy);
        move(copy, kitPoint, screenPoint(previous), true);
      }
    }
    function pulse(mark) {
      if (reducedMotion.matches) return;
      const [x, y] = screenPoint(mark);
      const ring = svg('ellipse', { class: 'st-pulse', cx: x, cy: y, rx: 20, ry: S.view === 'set' && mark.point[1] === 0 ? 8 : 18 });
      scene().effectLayer.append(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    }

    /* ---------- Inspector ---------- */
    function renderInspector() {
      const slot = document.activeElement?.dataset.stInspect;
      inspectBody.replaceChildren();
      const item = runtimeItem(S.sel);
      if (!item || !editable(item)) {
        if (!S.dept.light && !S.dept.camera && !S.sound.on) {
          inspectBody.append(el('p', { className: 'st-empty', text: 'Every department is off. Switch on Lighting, Camera or Sound to work with its equipment.' }));
          return;
        }
        inspectBody.append(el('p', { className: 'st-empty', text: 'Click a piece of equipment in the studio to adjust it.' }),
          kitPanel.hidden ? null : el('p', { className: 'st-empty', text: 'To add equipment, click a kit tile and then click where it should go.' }));
        return;
      }
      const move = availableMarks(item.kind).length > 1 ? el('button', { type: 'button', className: 'st-btn', 'data-st-inspect': 'move', onclick: event => {
        pickItem(item.id, event.detail === 0, event.currentTarget);
      } }, 'Move') : null;
      const returnButton = !canReturn(item) ? null : el('button', {
        type: 'button', className: 'st-remove', 'data-st-inspect': 'return', onclick: () => returnItem(item.id, true)
      }, 'Put away');
      if (item.kind === 'light') {
        const state = S.items.find(light => light.id === item.id);
        const dimmer = el('input', { type: 'range', min: 10, max: 100, step: 5, value: state.level,
          id: uid + 'lvl', 'data-st-inspect': 'dimmer' });
        const percent = el('output', { for: uid + 'lvl', text: state.level + '%' });
        dimmer.addEventListener('input', () => {
          state.level = +dimmer.value;
          percent.textContent = state.level + '%';
          S.setup = null;
          updatePresets();
          renderStage();
          renderMonitor();
        });
        const quality = el('div', { className: 'st-seg', role: 'group', 'aria-label': 'Light quality' },
          [false, true].map(soft => el('button', {
            type: 'button', 'data-st-inspect': soft ? 'softbox' : 'bare', 'aria-pressed': String(state.soft === soft),
            onclick: () => {
              state.soft = soft;
              S.setup = null;
              renderAll();
              say(soft ? 'Softbox attached.' : 'Softbox returned to the kit.');
            }
          }, soft ? 'Softbox' : 'Bare')));
        inspectBody.append(el('div', { className: 'st-inspect-info' },
          el('h3', {}, item.name, el('small', { text: item.where.split(',')[0] })), el('p', { text: item.does })),
        el('div', { className: 'st-inspect-controls' },
          C.dimmer ? el('div', { className: 'st-row' }, el('label', { for: uid + 'lvl', text: 'Dimmer' }), dimmer, percent) : null,
          C.softbox ? el('div', { className: 'st-row' }, el('span', { text: 'Quality' }), quality) : null,
          actions(move, returnButton, learn(item.topic))));
      } else if (item.kind === 'camera') {
        const mark = byMark.get(S.cam.spot);
        const micBtn = S.sound.on && C.mics.includes('camera-mic') ? el('button', { type: 'button', className: 'st-btn', 'data-st-inspect': 'camera-mic',
          'aria-pressed': String(!!S.sound.camMic), onclick: () => toggleCamMic()
        }, S.sound.camMic ? 'Camera microphone on' : 'Camera microphone off') : null;
        inspectBody.append(el('div', { className: 'st-inspect-info' },
          el('h3', {}, 'Camera', el('small', { text: mark.dist + ' ft from the subject' })),
          el('p', { text: CAM_NOTE[mark.id] })),
        el('div', { className: 'st-inspect-controls' }, camControls,
          actions(move, micBtn, learn(['3.09', 'focus', 'Focus']),
            learn(['3.17', 'zoom-versus-camera-movement', 'Zoom versus camera movement']))));
      } else {
        const isCam = item.kind === 'camera-mic';
        const id = isCam ? 'camera' : item.id;
        const spot = isCam ? camMicSpot() : micInfo(id);
        const ch = isCam ? S.sound.camMic : S.sound.mics[id];
        const placement = spot.variants ? el('div', { className: 'st-row' }, el('span', { text: 'Placement' }),
          el('div', { className: 'st-seg', role: 'group', 'aria-label': 'Placement' }, spot.variants.map(variant => el('button', {
            type: 'button', 'data-st-inspect': variant.id, 'aria-pressed': String(ch.variant === variant.id), onclick: () => {
              beginHand(item.kind, item.id, document.activeElement);
              placeOn(byMark.get(id + '-' + variant.id));
              inspectBody.querySelector('[data-st-inspect="' + variant.id + '"]')?.focus({ preventScroll: true });
            }
          }, variant.label)))) : null;
        const solo = el('button', { type: 'button', className: 'st-btn', 'data-st-inspect': 'solo',
          'aria-pressed': String(ch.solo), onclick: () => {
            ch.solo = !ch.solo;
            if (ch.solo) ch.mute = false;
            renderAll();
            if (ch.solo && !playing) roll();
          }
        }, ch.solo ? 'Hearing it alone' : 'Hear it alone');
        inspectBody.append(el('div', { className: 'st-inspect-info' },
          el('h3', {}, spot.name, el('small', { text: 'Channel ' + channelNumber(id) })),
          el('p', { text: spot.hear })),
        el('div', { className: 'st-inspect-controls' }, placement,
          actions(move, returnButton, solo, learn(spot.topic))));
      }
      if (slot) inspectBody.querySelector('[data-st-inspect="' + slot + '"]')?.focus({ preventScroll: true });
    }
    function actions(...controls) {
      return controls.some(Boolean) ? el('div', { className: 'st-row st-equipment-actions' }, controls) : null;
    }
    function newCh(id) {
      const spot = MIC_SPOTS.find(option => option.id === id);
      return { fader: 0.8, mute: false, solo: false, variant: spot?.variants?.[0].id || null };
    }
    function micInfo(id) {
      const spot = MIC_SPOTS.find(option => option.id === id);
      if (!spot.variants) return spot;
      const variant = spot.variants.find(option => option.id === S.sound.mics[id]?.variant) || spot.variants[0];
      return { ...spot, ...variant, id, short: spot.short + (variant === spot.variants[0] ? '' : ' (' + variant.label.toLowerCase() + ')') };
    }
    function learn(topic) {
      if (C.embed) return null;
      return el('a', { className: 'st-learn', href: topicURL(topic[1]), target: '_blank', rel: 'noopener', text: topic[0] + ' ' + topic[2] + ' ↗' });
    }
    function toggleCamMic() {
      if (!S.sound.on) return;
      if (S.sound.camMic) {
        S.sound.camMic = null;
        dropAudio('camera');
        say('Camera microphone returned to the kit.');
      } else {
        S.sound.camMic = newCh('camera');
        say('Camera microphone placed on channel ' + channelNumber('camera') + '.');
      }
      S.micSetup = null;
      renderAll();
    }
    function camMicSpot() {
      const distance = byMark.get(S.cam.spot).dist;
      return {
        id: 'camera', name: 'Camera microphone', short: 'Camera',
        audio: distance === 4 ? 'p5-distance-shotgun-middle' : 'p5-distance-shotgun-far',
        where: 'The shotgun on top of the camera, ' + distance + ' feet from the subject',
        does: 'Points where the camera points. Moving the camera changes how far it is from the subject.',
        hear: distance === 4 ? 'Usable at this distance, though the room is already noticeable.' : 'Distant and roomy. Try a microphone closer to the subject.',
        topic: ['5.03', 'microphone-placement', 'Microphone placement']
      };
    }

    /* ----- Monitor ----- */
    let shown = null, front = imgA, back = imgB;
    function renderMonitor() {
      const lights = lightsByMark();
      const look = chooseLook(lights);
      screen.dataset.stLook = look.still;
      const rec = MEDIA[look.still] || {};
      if (shown !== look.still) {
        shown = look.still;
        back.src = mediaURL(look.still);
        back.style.opacity = 1; front.style.opacity = 0;
        [front, back] = [back, front];
        const c = LOOKS[look.still];
        screen.style.background = `linear-gradient(to right, ${c.tl}, ${c.tr})`;
        torso.style.backgroundColor = c.shirt;
      }
      const cam = S.cam;
      const raw = frameScale(cam);
      const s = clamp(raw, 0.72, 3);
      const lim = s >= 1 ? (s - 1) / 2 * 100 : (1 - s) / 2 * 100;
      const tx = -cam.pan * lim, ty = cam.tilt * lim;   // pan right moves the picture left
      const ang = cam.height === 'low' ? 9 : cam.height === 'high' ? -9 : 0;
      const hShift = cam.height === 'low' ? -4 : cam.height === 'high' ? 4 : 0;
      photoBox.classList.toggle('feather', s < 1);
      photoBox.style.transform = `translate(${tx}%, ${ty + hShift * (s >= 1 ? 1 : 0.5)}%) scale(${s})`;
      world.style.transform = ang ? `perspective(1100px) rotateX(${ang}deg) scale(${1 + Math.abs(ang) / 70})` : 'none';
      const mainLight = look.main ? lights[look.main] : null;
      const bright = mainLight ? 0.45 + 0.55 * mainLight.level / 100 : 1;
      const blur = blurPx(cam);
      photoBox.style.filter = `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(2)})`;
      // boom dips into the top of a wide shot
      const boomIn = S.sound.on && S.sound.mics.boom?.variant === 'close' && s < 1.12 && cam.tilt > -0.6;
      boom.style.opacity = boomIn ? 1 : 0;
      grid.hidden = !cam.grid;

      const focusOK = blur < 0.7;
      roTL.replaceChildren(el('span', { className: 'st-rec', text: 'REC' }), el('span', { text: shotName(s) + ' · ' + cam.focal + ' mm' }));
      roBL.hidden = roBR.hidden = !S.dept.camera;
      roBL.replaceChildren(el('span', { text: 'Focus ' + fmt1(cam.focus) + ' ft' }),
        el('span', { className: focusOK ? 'st-sharp' : 'st-soft-flag', text: focusOK ? '● Sharp' : '○ Soft' }));
      roBR.replaceChildren(el('span', { text: 'Subject ' + CAM_SPOTS.find(c => c.id === cam.spot).dist + ' ft' }), el('span', { text: heightLabel(cam.height).split(':')[0] }));
      screen.setAttribute('aria-label', 'Camera monitor: ' + shotName(s) + ', ' + heightLabel(cam.height).split(':')[0].toLowerCase() + ', focus ' + (focusOK ? 'sharp' : 'soft') +
        (boomIn ? ', the boom microphone is visible at the top of the frame' : '') + '. ' + (rec.alt || ''));

      zoom.value = cam.focal; zoomOut.textContent = cam.focal + ' mm';
      focus.value = focusToSlider(cam.focus); focusOut.textContent = fmt1(cam.focus) + ' ft';
      pan.value = Math.round(cam.pan * 100); tilt.value = Math.round(cam.tilt * 100);
      heightSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.h === cam.height)));
      gridBtn.setAttribute('aria-pressed', String(cam.grid));

      const su = S.setup && lightSetup(S.setup);
      const names = Object.keys(lights).map(id => LIGHT_SPOTS.find(x => x.id === id).short.toLowerCase());
      // With the lighting department off, the caption describes the shot, not the lights.
      const parts = S.dept.light ?
        [el('strong', { text: su ? su.name + '. ' : (names.length ? 'Lights: ' + names.join(', ') + '. ' : 'All lights off. ') })] :
        [el('strong', { text: shotName(s) + '. ' }), 'The camera is ' + byMark.get(cam.spot).dist + ' feet from the subject at ' + cam.focal + ' mm. '];
      if (!S.dept.light) { /* nothing more to say about the lights */ }
      else if (su) parts.push(su.note + ' ');
      else if (rec.alt) parts.push(rec.alt + ' ');
      if (S.dept.light && !look.exact) parts.push(el('span', { className: 'st-note', text: 'There is no example photo of these lights together yet, so the monitor shows the ' +
        LIGHT_SPOTS.find(x => x.id === look.main).short.toLowerCase() + ' light on its own. ' }));
      if (raw < 0.72) parts.push(el('span', { className: 'st-note', text: 'This is wider than the example photo allows, so the picture stops at a medium shot. ' }));
      if (raw > 3) parts.push(el('span', { className: 'st-note', text: 'The example photo cannot go any tighter. ' }));
      if (boomIn) parts.push(el('span', { className: 'st-note', text: 'The boom is in the shot. Zoom in, tilt down or raise the boom. ' }));
      if (rec.status !== 'final') parts.push(el('span', { className: 'st-tag', text: 'Stand-in photo' }));
      // A lesson keeps only warnings here. Its one-sentence feedback sits above, in the "why" line.
      caption.replaceChildren(...(C.embed ? parts.filter(part => part.nodeType && /st-note|st-tag/.test(part.className)) : parts));
      checkGoals();
    }

    /* ---------- Lesson goals ---------- */
    function goalContext() {
      const lights = lightsByMark();
      const scale = frameScale(S.cam);
      const list = channels();
      return {
        lights, marks: Object.keys(lights), look: chooseLook(lights).still,
        cam: { ...S.cam, dist: byMark.get(S.cam.spot).dist, scale, shot: shotName(clamp(scale, 0.72, 3)), sharp: blurPx(S.cam) < 0.7 },
        sound: { on: S.sound.on, mics: Object.fromEntries(list.map(c => [c.id, c.ch])), open: list.filter(c => gainOf(c, list) > 0.05).map(c => c.id),
          heard: S.heard, clipped: S.clipped, lastTake: S.lastTake || null, master: S.sound.master, boomInFrame: boom.style.opacity === '1' },
        takes: S.takes, rolling: playing
      };
    }
    function checkGoals() {
      if (!C.goals.length) return;
      const context = goalContext();
      let fresh = -1;
      // Goals are met in order. Work a student did ahead of time counts as soon as its turn comes.
      for (let i = goalState.indexOf(false); i >= 0 && i < C.goals.length && C.goals[i].test(context); i++) {
        goalState[i] = true;
        fresh = i;
      }
      if (fresh >= 0 || !progress.childElementCount) renderGoals(fresh);
    }
    function renderGoals(fresh) {
      const current = goalState.indexOf(false);
      const done = goalState.filter(Boolean).length;
      progress.replaceChildren(...C.goals.map((goal, i) => el('i', {
        className: goalState[i] ? 'done' : i === current ? 'now' : null, 'data-st-goal': goalState[i] ? 'done' : 'open' })));
      progress.setAttribute('aria-valuenow', done);
      stepN.textContent = current < 0 ? 'All ' + C.goals.length + ' steps done' : 'Step ' + (current + 1) + ' of ' + C.goals.length;
      stepText.textContent = current < 0 ? 'Keep experimenting, or start over.' : C.goals[current].text;
      app.classList.toggle('st-all-done', current < 0);
      if (fresh < 0) return;
      why.replaceChildren(el('b', { text: '✓ ' }), C.goals[fresh].why || 'Done.');
      say((current < 0 ? 'All steps done. ' : 'Step ' + (fresh + 1) + ' done. ') + (C.goals[fresh].why || '') +
        (current < 0 ? '' : ' Next: ' + C.goals[current].text));
    }
    function noteHeard() {
      if (!playing) return;
      const list = channels();
      for (const c of list) {
        if (gainOf(c, list) <= 0.05) continue;
        S.heard.add(c.id);
        S.heard.add(c.id + '-' + (c.id === 'camera' ? byMark.get(S.cam.spot).dist : c.ch.variant || 'on'));
      }
    }

    function renderCameraChange() {
      renderMonitor();
      renderStage();
    }

    function svgBoom() {
      const n = svg('svg', { class: 'st-boom', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
        svg('path', { d: 'M -120 40 L 52 70', stroke: '#2a2b2e', 'stroke-width': 5 }),
        svg('rect', { x: 40, y: 64, width: 46, height: 14, rx: 6, fill: '#1a1b1d', stroke: '#3b3d41', transform: 'rotate(10 63 71)' }),
        svg('rect', { x: 80, y: 66, width: 18, height: 20, rx: 9, fill: '#6b6d70', transform: 'rotate(10 89 76)' }));
      n.style.opacity = 0;
      return n;
    }

    /* ---------- Playback and meters ---------- */
    const audios = {};
    let playing = false;
    let t0 = 0;
    let raf = 0;
    let takeTimer;
    let curIds = [];
    let take = { clipped: false, peak: 0 };
    const holds = {};

    function channels() {
      if (!S.sound.on) return [];
      const list = S.sound.micOrder.map(id => ({ id, spot: micInfo(id), ch: S.sound.mics[id] }));
      if (S.sound.camMic) list.push({ id: 'camera', spot: camMicSpot(), ch: S.sound.camMic });
      return list;
    }
    function channelNumber(id) { return channels().findIndex(c => c.id === id) + 1; }
    function audioFor(channel) {
      const source = mediaURL(channel.spot.audio);
      if (audios[channel.id]?.dataset.src === source) return audios[channel.id];
      dropAudio(channel.id);
      const audio = el('audio', { preload: 'auto', src: source, 'data-src': source });
      audios[channel.id] = audio;
      audioRack.append(audio);
      return audio;
    }
    function dropAudio(id) {
      const audio = audios[id];
      if (!audio) return;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.remove();
      delete audios[id];
    }
    function resetChannelAudio(id) {
      if (!audios[id]) return;
      dropAudio(id);
      if (playing) roll(true);
    }
    function gainOf(c, list) {
      const anySolo = list.some(x => x.ch.solo);
      if (c.ch.mute || (anySolo && !c.ch.solo)) return 0;
      return c.ch.fader * S.sound.master;
    }
    function applyVolumes() {
      const list = channels();
      for (const c of list) {
        const audio = audios[c.id];
        if (audio) audio.volume = clamp(gainOf(c, list), 0, 1);
      }
      noteHeard();
      checkGoals();
    }
    function roll(quiet = false) {
      stop(true, false);
      const list = channels();
      curIds = list.map(channel => channel.id);
      const elements = list.map(audioFor);
      applyVolumes();
      elements.forEach(audio => {
        if (audio.readyState) audio.currentTime = 0;
        audio.play().catch(() => {});
      });
      playing = true;
      take = { clipped: false, peak: 0 };
      noteHeard();
      t0 = performance.now();
      tc.textContent = '00:00:00';
      renderTransport();
      if (!quiet) say(S.sound.on && !list.length ? 'Rolling. No microphone is connected.' : 'Rolling.');
      raf = requestAnimationFrame(tick);
      takeTimer = setTimeout(() => {
        if (S.sound.on && S.sound.loop) roll(true);
        else {
          tc.textContent = '00:06:00';
          stop();
        }
      }, 6000);
    }
    function stop(quiet = false, redraw = true) {
      const wasPlaying = playing;
      playing = false;
      Object.values(audios).forEach(audio => audio.pause());
      clearTimeout(takeTimer);
      cancelAnimationFrame(raf);
      if (S.sound.on) paintMeters(0, true);
      if (wasPlaying) {
        S.takes++;
        S.lastTake = { ...take, full: performance.now() - t0 >= 5900 };
      }
      if (wasPlaying && redraw) renderTransport();
      if (wasPlaying && !quiet) say('Cut.');
      if (wasPlaying) checkGoals();
    }
    function renderTransport() {
      monitorPanel.classList.toggle('st-rolling', playing);
      stage.classList.toggle('st-rolling', playing);
      rollBtn.textContent = playing ? 'Stop' : 'Roll';
      renderStage();
    }
    function tick() {
      if (!playing) return;
      const time = Math.min((performance.now() - t0) / 1000, 6);
      const seconds = Math.floor(time), frame = Math.floor((time - seconds) * 24);
      tc.textContent = '00:' + String(seconds).padStart(2, '0') + ':' + String(frame).padStart(2, '0');
      if (S.sound.on) paintMeters(time, false);
      raf = requestAnimationFrame(tick);
    }
    const toPct = value => value <= 0.0001 ? 0 : clamp((20 * Math.log10(value) + 48) / 48 * 100, 0, 100);
    function paintMeters(t, zero) {
      const list = channels();
      let sum = 0;
      for (const c of list) {
        const rec = MEDIA[c.spot.audio] || {};
        const pk = rec.peaks || [];
        const i = Math.floor(t * (rec.peakRate || 25));
        const v = zero ? 0 : (pk[i] || 0) * gainOf(c, list);
        sum += v;
        const strip = strips.querySelector(`[data-ch="${c.id}"]`);
        if (!strip) continue;
        const pct = toPct(v);
        strip.querySelector('.st-meter b').style.height = pct + '%';
        holds[c.id] = zero ? 0 : Math.max((holds[c.id] || 0) - 0.6, pct);
        strip.querySelector('.st-meter s').style.bottom = holds[c.id] + '%';
      }
      if (!zero) {
        take.peak = Math.max(take.peak, sum);
        if (sum >= 1) take.clipped = true;
      }
      const mp = toPct(Math.min(sum, 1.2));
      const ms = strips.querySelector('[data-ch="master"]');
      if (ms) {
        ms.querySelector('.st-meter b').style.height = mp + '%';
        holds.master = zero ? 0 : Math.max((holds.master || 0) - 0.6, mp);
        ms.querySelector('.st-meter s').style.bottom = holds.master + '%';
        if (!zero && sum >= 1) { ms.querySelector('.st-clip').classList.add('on'); S.clipped = true; }
      }
      monMeterL.style.height = mp + '%'; monMeterR.style.height = mp * 0.97 + '%';
    }

    function renderMixer() {
      const list = channels();
      const active = document.activeElement;
      const focused = strips.contains(active) ? active.getAttribute('aria-label') : null;
      strips.replaceChildren();
      if (!list.length) strips.append(el('div', { className: 'st-mixer-empty', text: 'Choose a microphone from the kit or select a sound setup.' }));
      list.forEach((c, i) => strips.append(strip(c, i + 1)));
      // master
      const mf = el('input', { type: 'range', className: 'st-fader', min: 0, max: 100, step: 1, value: Math.round(S.sound.master * 100), 'aria-label': 'Master fader' });
      const mdb = el('span', { className: 'st-db' });
      const setM = () => { mdb.textContent = dbText(S.sound.master); };
      mf.addEventListener('input', () => { S.sound.master = +mf.value / 100; setM(); applyVolumes(); });
      setM();
      strips.append(el('div', { className: 'st-strip master', 'data-ch': 'master' }, el('span', { className: 'st-ch', text: 'MASTER' }),
        el('span', { className: 'st-ch-name', style: { cursor: 'default' }, text: 'Main out' }),
        el('div', { className: 'st-fader-wrap' }, mf, el('div', { className: 'st-meter' }, el('b'), el('s'))), mdb,
        el('button', { type: 'button', className: 'st-clip', title: 'Lights when the mix is too loud. Click to clear.', onclick: e => e.currentTarget.classList.remove('on') }, 'CLIP')));
      renderTip(list);
      if (focused) [...strips.querySelectorAll('[aria-label]')].find(control => control.getAttribute('aria-label') === focused)?.focus({ preventScroll: true });
    }
    function dbText(v) { return v <= 0.001 ? '−∞ dB' : (20 * Math.log10(v)).toFixed(1).replace('-', '−') + ' dB'; }
    function strip(c, n) {
      const ch = c.ch;
      const f = el('input', { type: 'range', className: 'st-fader', min: 0, max: 100, step: 1, value: Math.round(ch.fader * 100), 'aria-label': 'Channel ' + n + ' fader, ' + c.spot.name });
      const db = el('span', { className: 'st-db', text: dbText(ch.fader) });
      f.addEventListener('input', () => { ch.fader = +f.value / 100; db.textContent = dbText(ch.fader); applyVolumes(); renderTip(channels()); });
      const m = el('button', { type: 'button', className: 'm', 'aria-pressed': String(ch.mute), 'aria-label': 'Mute channel ' + n, title: 'Mute',
        onclick: () => { ch.mute = !ch.mute; if (ch.mute) ch.solo = false; renderAll(); } }, 'M');
      const s = el('button', { type: 'button', className: 's', 'aria-pressed': String(ch.solo), 'aria-label': 'Solo channel ' + n, title: 'Solo: hear only this channel',
        onclick: () => { ch.solo = !ch.solo; if (ch.solo) ch.mute = false; renderAll(); } }, 'S');
      const id = c.id === 'camera' ? 'camera-mic' : c.id;
      const selected = S.sel === id;
      return el('div', { className: 'st-strip' + (selected ? ' sel' : ''), 'data-ch': c.id },
        el('span', { className: 'st-ch', text: 'CH ' + n }),
        el('button', { type: 'button', className: 'st-ch-name', onclick: () => { S.sel = id; renderInspector(); renderStage(); strips.querySelectorAll('.st-strip').forEach(node => node.classList.toggle('sel', node.dataset.ch === c.id)); } }, c.spot.short),
        el('div', { className: 'st-fader-wrap' }, f, el('div', { className: 'st-meter' }, el('b'), el('s'))),
        db, el('div', { className: 'st-ms' }, m, s));
    }
    function renderTip(list) {
      const open = list.filter(c => gainOf(c, list) > 0.05);
      let t = '', warn = false;
      if (!list.length) t = '';
      else if (!open.length) { t = 'Every channel is muted or down. Raise a fader to hear something.'; warn = true; }
      else if (open.length === 1) t = 'Listening to ' + open[0].spot.name.toLowerCase() + '. Roll the take, then try another microphone and compare.';
      else {
        const sum = open.reduce((a, c) => a + c.ch.fader, 0);
        if (sum * S.sound.master > 1.4) { t = 'Several loud channels are open at once. The mix may clip, and microphones at different distances blur the voice with echo. Usually one microphone carries the voice.'; warn = true; }
        else t = open.length + ' microphones are open. Mics at different distances hear the voice at slightly different times, which can sound hollow. Solo each one to compare.';
      }
      tip.textContent = t; tip.classList.toggle('warn', warn);
    }

    function updatePresets() {
      lightSelect.value = C.lightSetups.some(setup => setup.id === S.setup) ? S.setup : '';
      micSelect.value = C.micSetups.some(setup => setup.id === S.micSetup) ? S.micSetup : '';
    }
    function renderAll() {
      syncSoundUI();
      updateStudioControls();
      renderKit();
      renderStage();
      renderMonitor();
      renderInspector();
      if (S.sound.on) renderMixer();
      applyVolumes();
      updatePresets();
      if (playing && channels().map(channel => channel.id).join() !== curIds.join()) roll(true);
    }

    renderAll();
    new ResizeObserver(() => { if (!S.hand) drawGuides(); }).observe(stage);
    if (startsWithSound && !C.embed) say(SOUND_START);
    return { reset, state: () => S, options: C };
  }

  window.ProductionStudio = { mount };
})();
