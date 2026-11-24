/* Live studio with one real-time scene and two cameras. Scene units are feet.
   The gear arrives as metre-scale Blender exports through shared/studio-models.js. */
(function () {
  'use strict';
  const T = window.THREE;
  const modelsAPI = window.StudioModels;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = (tag, props, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'className') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs, ...kids) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null && v !== false) n.setAttribute(k, v);
    n.append(...kids);
    return n;
  };

  /* ---------- Constants ---------- */
  const FACE = new T.Vector3(0, 1.44 / .3048, .326);          // what lights and the camera aim at
  const ROOM = { x0: -11, x1: 11, z0: -6, z1: 13, h: 12 };
  const SENSOR_HALF_H = 4.865;                        // mm: half the height of a 16:9 frame on a Micro Four Thirds sensor
  const KEY_CANDELA = 205;                             // a bare light at 100%. Chosen so a softbox key at 6.3 ft exposes the face correctly.
  const SOFTBOX_LOSS = 0.62;                          // a softbox costs about two thirds of a stop
  const GRID_HEIGHT = 10.75;
  const GRID_HEAD = GRID_HEIGHT - (.25 + .18) / .3048;
  /* Named directions for one light: label, x, z, height, highest sensible dimmer level, mount.
     Front, side, top, under and back match the Blender proof renders. */
  const DIRECTIONS = {
    front: ['Front', -1.5, 7.8, 5.0, 100],
    angle: ['45°', -4.2, 4.2, 6.5, 100],
    side: ['Side', -4.75, .326, 4.76, 100],
    back: ['Back', .52, -4.4, 7.18, 100],
    top: ['Top', 0, 1.54, GRID_HEAD, 100, 'grid'],
    under: ['Under', 0, 1.16, 1.25, 52]
  };
  /* Where new lights go, in order: key, fill, back. x, z, height, dimmer, softbox. */
  const SPOTS = [[-4.2, 4.2, 6.5, 100, true], [4.2, 4.2, 6, 50, true], [4.8, -3.4, 7.5, 60, false]];
  const SETUPS = [['1 light', 1], ['Key + fill', 2], ['3-point', 3]];
  const DEFAULT_SUBJECT = 'subject_ellis';
  const SUBJECTS = {
    [DEFAULT_SUBJECT]: 'Ellis',
    subject_taylor: 'Taylor',
    subject_amara: 'Maya'
  };
  const MAX_LIGHTS = 3;
  const SOFTBOX_SIDE = 2;                             // feet: the softbox front is 2 ft square
  const AREA_SHARE = 0.4;                             // share of a softbox's light sent from its whole face (see addLight)
  const BOUNCE = 0.07;                                // room bounce as a share of the light reaching the subject: about 4 stops under
  const MONITOR_EXPOSURE = 0.92;                        // the camera's fixed exposure, set so the reference key exposes skin correctly
  const SET_LAYER = 1;                                // helpers the set view sees and the monitor does not

  const mat = (color, rough = 0.8, metal = 0, extra) => new T.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  function mesh(geometry, material, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function releaseGeometry(objects) {
    const geometry = new Set();
    for (const object of objects) object.traverse(o => { if (o.isMesh) geometry.add(o.geometry); });
    for (const data of geometry) data.dispose();
  }
  function releaseVisuals(...objects) {
    releaseGeometry(objects);
    const materials = new Set();
    for (const object of objects) object.traverse(o => { if (o.isMesh) materials.add(o.material); });
    for (const material of materials) material.dispose();
  }
  /* A straight bar between two points: stand legs, poles, table legs. */
  function bar(a, b, radius, material) {
    const from = new T.Vector3(...a), to = new T.Vector3(...b);
    const m = mesh(new T.CylinderGeometry(radius, radius, from.distanceTo(to), 10), material);
    m.position.copy(from).add(to).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    return m;
  }

  /* ---------- The room ---------- */
  /* Painted concrete: a flat grey with speckle and a few scuffs, drawn once so the floor is not a blank plane. */
  function floorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const g = canvas.getContext('2d');
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#54575b';
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2400; i++) {
      g.fillStyle = random() < 0.5 ? 'rgba(255,255,255,' + (0.012 + random() * 0.03) + ')' : 'rgba(0,0,0,' + (0.02 + random() * 0.05) + ')';
      g.beginPath();
      g.arc(random() * 512, random() * 512, 0.6 + random() * random() * 16, 0, 7);
      g.fill();
    }
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = random() * 512, y = random() * 512, a = random() * 7, length = 12 + random() * 70;
      g.strokeStyle = 'rgba(0,0,0,' + (0.04 + random() * 0.07) + ')';
      g.lineWidth = 0.6 + random() * 1.6;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * length, y + Math.sin(a) * length);
      g.stroke();
    }
    const texture = new T.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }
  function buildRoom() {
    const room = new T.Group();
    const floor = mesh(new T.PlaneGeometry(ROOM.x1 - ROOM.x0 + 8, ROOM.z1 - ROOM.z0 + 8), mat('#ffffff', 0.7, 0, { map: floorTexture() }), 0, 0, (ROOM.z0 + ROOM.z1) / 2);
    floor.rotation.x = -Math.PI / 2;
    floor.castShadow = false;
    const wall = mat('#5b5e62', 0.95);
    const back = mesh(new T.PlaneGeometry(ROOM.x1 - ROOM.x0 + 8, ROOM.h), wall, 0, ROOM.h / 2, ROOM.z0);
    const left = mesh(new T.PlaneGeometry(ROOM.z1 - ROOM.z0 + 8, ROOM.h), wall, ROOM.x0, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2);
    left.rotation.y = Math.PI / 2;
    const right = mesh(new T.PlaneGeometry(ROOM.z1 - ROOM.z0 + 8, ROOM.h), wall, ROOM.x1 + 3, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2);
    right.rotation.y = -Math.PI / 2;
    back.castShadow = left.castShadow = right.castShadow = false;
    room.add(floor, back, left, right);

    // Seamless paper: down the wall, through a curve, and out along the floor under the subject.
    const profile = [[9.2, -5.85]];
    for (let i = 0; i <= 10; i++) {
      const a = i / 10 * Math.PI / 2;
      profile.push([1.6 - Math.sin(a) * 1.6 + 0.012, -5.85 + (1 - Math.cos(a)) * 1.6]);
    }
    profile.push([0.012, 3.4]);
    const half = 5, positions = [], index = [];
    profile.forEach(([y, z], i) => {
      positions.push(-half, y, z, half, y, z);
      if (i) index.push(i * 2 - 2, i * 2, i * 2 - 1, i * 2 - 1, i * 2, i * 2 + 1);
    });
    const sweep = new T.BufferGeometry();
    sweep.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    sweep.setIndex(index);
    sweep.computeVertexNormals();
    const paper = mesh(sweep, mat('#8d8e89', 0.93, 0, { side: T.DoubleSide }));
    paper.castShadow = false;
    const roll = bar([-5.3, 9.3, -5.8], [5.3, 9.3, -5.8], 0.16, mat('#55575a', 0.6));
    room.add(paper, roll, bar([-5.6, 0, -5.6], [-5.6, 9.5, -5.6], 0.06, mat('#1b1c1e', 0.5, 0.6)), bar([5.6, 0, -5.6], [5.6, 9.5, -5.6], 0.06, mat('#1b1c1e', 0.5, 0.6)));

    const pipe = mat('#17181a', 0.45, 0.7);
    for (const z of [-2, 2, 6]) room.add(bar([ROOM.x0, 10.6, z], [ROOM.x1 + 3, 10.6, z], 0.08, pipe));
    for (const x of [-6, 0, 6]) room.add(bar([x, 10.75, ROOM.z0], [x, 10.75, ROOM.z1], 0.08, pipe));

    // Acoustic panels, skirting and the feet of the paper stands give the walls scale and depth.
    const panel = mat('#3b3e44', 1), skirting = mat('#26282b', 0.7);
    for (const z of [-3.2, 0.4, 4, 7.6, 11.2]) room.add(mesh(new T.BoxGeometry(0.22, 5.2, 2.9), panel, ROOM.x0 + 0.11, 5.6, z));
    for (const x of [-8.6, 8.6, 11.9]) room.add(mesh(new T.BoxGeometry(2.9, 5.2, 0.22), panel, x, 5.6, ROOM.z0 + 0.11));
    for (const z of [-3.2, 0.4, 4, 7.6, 11.2]) room.add(mesh(new T.BoxGeometry(0.22, 5.2, 2.9), panel, ROOM.x1 + 2.89, 5.6, z));
    room.add(mesh(new T.BoxGeometry(ROOM.x1 - ROOM.x0 + 3, 0.4, 0.1), skirting, 1.5, 0.2, ROOM.z0 + 0.05),
      mesh(new T.BoxGeometry(0.1, 0.4, ROOM.z1 - ROOM.z0), skirting, ROOM.x0 + 0.05, 0.2, (ROOM.z0 + ROOM.z1) / 2),
      mesh(new T.BoxGeometry(0.1, 0.4, ROOM.z1 - ROOM.z0), skirting, ROOM.x1 + 2.95, 0.2, (ROOM.z0 + ROOM.z1) / 2));
    const foot = mat('#1b1c1e', 0.5, 0.6);
    for (const x of [-5.6, 5.6]) room.add(bar([x - 0.9, 0.04, -5.2], [x, 0.04, -5.6], 0.05, foot), bar([x + 0.9, 0.04, -5.2], [x, 0.04, -5.6], 0.05, foot), bar([x, 0.04, -4.5], [x, 0.04, -5.6], 0.05, foot));

    return room;
  }
  /* A slim side table for the desk microphone and the phone. It only stands on the set while one of them is placed. */
  const SIDE_TABLE = { x: 2.65, z: 2.2, r: 0.88, top: 2.04 };
  function buildSideTable() {
    const g = new T.Group();
    const wood = mat('#6e5c49', 0.6), steel = mat('#2a2c2f', 0.4, 0.6);
    g.add(mesh(new T.CylinderGeometry(SIDE_TABLE.r, SIDE_TABLE.r, 0.07, 36), wood, 0, SIDE_TABLE.top - 0.035, 0));
    g.add(mesh(new T.CylinderGeometry(0.06, 0.06, SIDE_TABLE.top - 0.1, 12), steel, 0, (SIDE_TABLE.top - 0.1) / 2 + 0.03, 0));
    g.add(mesh(new T.CylinderGeometry(0.46, 0.5, 0.05, 28), steel, 0, 0.025, 0));
    g.position.set(SIDE_TABLE.x, 0, SIDE_TABLE.z);
    g.visible = false;
    return g;
  }

  /* ---------- Stand-in subject ---------- */
  function buildFallbackSubject() {
    const g = new T.Group();
    const skin = mat('#b9825f', 0.62), shirt = mat('#2a43b8', 0.85), trousers = mat('#22252b', 0.9), hair = mat('#17120f', 0.75), black = mat('#151617', 0.5, 0.3);
    const blob = (r, sx, sy, sz, m, x, y, z) => { const b = mesh(new T.SphereGeometry(r, 32, 24), m, x, y, z); b.scale.set(sx, sy, sz); return b; };
    // Stool
    g.add(mesh(new T.CylinderGeometry(0.62, 0.62, 0.14, 28), black, 0, 2.43, 0));
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      g.add(bar([Math.cos(a) * 0.45, 2.4, Math.sin(a) * 0.45], [Math.cos(a) * 0.72, 0, Math.sin(a) * 0.72], 0.045, black));
    }
    const ring = mesh(new T.TorusGeometry(0.6, 0.035, 8, 28), black, 0, 0.9, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    // Body
    g.add(blob(0.62, 1.0, 1.4, 0.62, shirt, 0, 3.42, 0.02));                 // torso
    g.add(blob(0.24, 1.1, 0.9, 1, shirt, -0.66, 4.02, 0.02), blob(0.24, 1.1, 0.9, 1, shirt, 0.66, 4.02, 0.02));
    for (const s of [-1, 1]) {
      g.add(bar([s * 0.74, 3.95, 0.02], [s * 0.8, 3.1, 0.3], 0.15, shirt));  // upper arm
      g.add(bar([s * 0.82, 3.1, 0.3], [s * 0.5, 2.82, 1.05], 0.14, skin));    // forearm
      g.add(blob(0.16, 1, 0.7, 1.2, skin, s * 0.46, 2.8, 1.15));              // hand
      g.add(bar([s * 0.33, 2.62, 0.05], [s * 0.4, 2.62, 1.45], 0.25, trousers)); // thigh
      g.add(bar([s * 0.4, 2.55, 1.45], [s * 0.42, 0.3, 1.25], 0.19, trousers));  // shin
      g.add(blob(0.22, 0.9, 0.55, 1.7, black, s * 0.42, 0.14, 1.5));          // shoe
    }
    g.add(mesh(new T.CylinderGeometry(0.19, 0.22, 0.42, 20), skin, 0, 4.24, 0.04)); // neck
    // Head: enough relief (brow, nose, eye sockets, chin) for the direction of the light to read.
    const head = new T.Group();
    head.position.set(0, 4.78, 0.08);
    head.add(blob(0.37, 0.9, 1.16, 1, skin, 0, 0, 0));
    head.add(blob(0.3, 0.86, 0.6, 0.9, skin, 0, -0.26, 0.08));                 // jaw and chin
    head.add(blob(0.075, 0.9, 1.5, 1.25, skin, 0, -0.07, 0.36));               // nose
    head.add(blob(0.2, 1.5, 0.28, 0.5, skin, 0, 0.1, 0.27));                   // brow ridge
    for (const s of [-1, 1]) {
      head.add(blob(0.062, 1.25, 0.8, 0.6, mat('#f1ece6', 0.35), s * 0.135, 0.035, 0.305));
      head.add(blob(0.034, 1, 1, 0.6, mat('#2a1a12', 0.3), s * 0.135, 0.035, 0.345));
      head.add(blob(0.1, 0.45, 1, 0.8, skin, s * 0.335, -0.03, -0.02));        // ear
      head.add(blob(0.11, 1.2, 0.8, 0.5, skin, s * 0.17, -0.12, 0.27));        // cheek
    }
    head.add(blob(0.1, 1.3, 0.32, 0.5, mat('#8f5a48', 0.6), 0, -0.24, 0.31));  // mouth
    head.add(blob(0.4, 0.96, 0.98, 1.02, hair, 0, 0.13, -0.07));               // hair
    for (let i = 0; i < 26; i++) {                                             // curls, so a back light has an edge to catch
      const a = i * 2.4, r = 0.3 + (i % 3) * 0.03;
      head.add(blob(0.1 + (i % 4) * 0.012, 1, 1, 1, hair, Math.cos(a) * r * 0.95, 0.3 + Math.sin(i * 1.7) * 0.14, -0.06 + Math.sin(a) * r * 0.9));
    }
    g.add(head);
    return g;
  }

  /* ---------- Stand-in equipment ---------- */
  function buildFixture() {
    const g = new T.Group();
    const steel = mat('#1a1b1d', 0.45, 0.7), body = mat('#202225', 0.6, 0.2);
    const stand = new T.Group(), head = new T.Group(), softbox = new T.Group();
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + 0.5;
      stand.add(bar([0, 1.5, 0], [Math.cos(a) * 1.35, 0.04, Math.sin(a) * 1.35], 0.04, steel));
      stand.add(bar([0, 0.6, 0], [Math.cos(a) * 0.7, 0.78, Math.sin(a) * 0.7], 0.025, steel));
    }
    const pole = mesh(new T.CylinderGeometry(0.05, 0.06, 1, 12), steel);
    const sandbag = mesh(new T.SphereGeometry(0.34, 16, 12), mat('#4d3f2c', 0.95), Math.cos(0.5) * 0.85, 0.2, Math.sin(0.5) * 0.85);
    sandbag.scale.set(1.3, 0.5, 0.8);
    stand.add(pole, sandbag);
    // The head points along +z so `lookAt` aims it.
    head.add(mesh(new T.CylinderGeometry(0.3, 0.3, 0.75, 20).rotateX(Math.PI / 2), body, 0, 0, -0.1));
    const emitterMat = new T.MeshStandardMaterial({ color: '#111', emissive: '#fff4de', emissiveIntensity: 1 });
    const emitter = mesh(new T.CircleGeometry(0.26, 24), emitterMat, 0, 0, 0.285);
    emitter.castShadow = false;
    head.add(emitter, bar([-0.38, -0.42, -0.1], [-0.38, 0.02, -0.1], 0.03, steel), bar([0.38, -0.42, -0.1], [0.38, 0.02, -0.1], 0.03, steel), bar([-0.38, -0.42, -0.1], [0.38, -0.42, -0.1], 0.03, steel));
    for (const [x, y, rz] of [[0, 0.42, 0], [0, -0.42, 0], [0.42, 0, Math.PI / 2], [-0.42, 0, Math.PI / 2]]) {  // barn doors
      const door = mesh(new T.BoxGeometry(0.62, 0.02, 0.36), body, x, y, 0.42);
      door.rotation.z = rz;
      door.rotation[rz ? 'y' : 'x'] = (rz ? -Math.sign(x) : Math.sign(y)) * 0.5;
      head.add(door);
    }
    const shell = mesh(new T.CylinderGeometry(1.42, 0.36, 1.25, 4, 1, true).rotateY(Math.PI / 4).rotateX(Math.PI / 2), mat('#131415', 0.8, 0, { side: T.DoubleSide }), 0, 0, 0.9);
    const faceMat = new T.MeshStandardMaterial({ color: '#e9e6df', emissive: '#fff4de', emissiveIntensity: 1, roughness: 1 });
    const face = mesh(new T.PlaneGeometry(2, 2), faceMat, 0, 0, 1.53);
    face.castShadow = false;
    softbox.add(shell, face);
    head.add(softbox);
    const handle = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 1, 12), new T.MeshBasicMaterial({ visible: false }));  // easy to grab
    handle.layers.set(SET_LAYER);
    g.add(stand, head, handle);
    return { group: g, stand, pole, head, softbox, emitterMat, faceMat, handle };
  }
  function buildCameraRig() {
    const g = new T.Group();
    const steel = mat('#1a1b1d', 0.45, 0.7), body = mat('#1b1c1e', 0.55, 0.2);
    const legs = new T.Group(), top = new T.Group();
    const column = mesh(new T.CylinderGeometry(0.06, 0.06, 1, 12), steel);
    top.add(mesh(new T.BoxGeometry(0.42, 0.14, 0.42), steel, 0, -0.3, 0.1));                      // fluid head
    top.add(bar([0.1, -0.3, 0.2], [0.55, -0.62, 1.05], 0.03, steel));                              // pan handle
    top.add(mesh(new T.BoxGeometry(0.44, 0.3, 0.24), body, 0, -0.08, 0.14));                       // camera body
    top.add(mesh(new T.BoxGeometry(0.16, 0.12, 0.2), body, 0, 0.12, 0.14));                        // viewfinder hump
    const lens = mesh(new T.CylinderGeometry(0.12, 0.12, 1, 20).rotateX(Math.PI / 2), mat('#101112', 0.4, 0.3), 0, -0.08, -0.1);
    const glass = mesh(new T.CircleGeometry(0.1, 20).rotateY(Math.PI), mat('#1b2a44', 0.1, 0.6), 0, -0.08, 0);
    const tally = mesh(new T.SphereGeometry(0.03, 10, 8), new T.MeshStandardMaterial({ color: '#300', emissive: '#ff2a1c', emissiveIntensity: 0 }), 0.17, 0.02, 0.01);
    top.add(lens, glass, tally);
    const handle = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 1, 12), new T.MeshBasicMaterial({ visible: false }));
    handle.layers.set(SET_LAYER);
    g.add(legs, column, top, handle);
    return { group: g, legs, column, top, lens, glass, tally, handle, steel };
  }

  /* ---------- App ---------- */
  function mount(host, opts) {
    opts = opts || {};
    const scene = new T.Scene();
    scene.background = new T.Color('#0b0c0e');
    let subject = buildFallbackSubject();
    const sideTable = buildSideTable();
    scene.add(buildRoom(), sideTable, subject);
    scene.add(new T.HemisphereLight('#aab4c8', '#303139', 0.065));          // dim house light, so the room is never black
    // Bounce: light that has hit the floor, paper and walls and come back. A real room always has some, which
    // is why the shadow side of a face is dark but not black. It rises and falls with the lights (see refresh).
    const bounce = new T.HemisphereLight('#d9d4c8', '#8f8c86', 0);
    scene.add(bounce);
    // The set view gets its own soft fill, as if your eyes had adjusted to the room. The monitor does not see it.
    const viewFill = new T.HemisphereLight('#d7dfe9', '#48454a', .69);
    const viewKey = new T.DirectionalLight('#ffffff', 1.15);
    viewKey.position.set(6, 12, 16);
    viewFill.layers.set(SET_LAYER);
    viewKey.layers.set(SET_LAYER);
    scene.add(viewFill, viewKey);
    for (const [x, z] of [[-10.6, 1], [-10.6, 6]]) {
      const work = new T.PointLight('#ffca8a', 2, 0, 2);
      work.position.set(x, 6, z);
      scene.add(work, mesh(new T.SphereGeometry(0.14, 12, 8), new T.MeshStandardMaterial({ color: '#221', emissive: '#ffca8a', emissiveIntensity: 2 }), x, 6, z));
    }

    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    } catch {
      host.replaceChildren(el('main', { className: 'lv-app lv-unavailable' },
        el('h1', { text: 'Live Studio' }),
        el('p', { text: 'This browser could not start 3D graphics.' }),
        opts.embed ? el('p', { text: 'Choose Guided exercise to continue.' }) :
          el('a', { href: 'index.html', text: 'Open Production Studio' })));
      return null;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = T.NeutralToneMapping;
    T.RectAreaLightUniformsLib.init();
    // A dim studio for polished metal and lens glass to reflect. It lights nothing else.
    const reflections = new T.PMREMGenerator(renderer).fromScene(new T.RoomEnvironment(), 0.04).texture;
    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    function finishModel(key, model) {
      model.traverse(object => {
        if (!object.isMesh) return;
        const material = object.material;
        for (const slot of ['map', 'normalMap', 'roughnessMap']) {
          if (material[slot] && material[slot].anisotropy !== maxAnisotropy) { material[slot].anisotropy = maxAnisotropy; material[slot].needsUpdate = true; }
        }
        const eyewear = material.userData.studioEyeglassFrame || material.userData.studioEyeglassHardware || material.userData.studioEyeglassLens;
        const reflectiveEquipment = key !== 'subject' && (material.metalness > 0.4 || /glass/i.test(material.name));
        if ((eyewear || reflectiveEquipment) && !material.envMap) {
          material.envMap = reflections;
          material.envMapIntensity = eyewear ? .18 : .45;
          material.needsUpdate = true;
        }
      });
    }

    // The set view circles a point just in front of the subject. Walls are one-sided, so from outside the
    // room you look straight in, like a model with a wall removed.
    const setCamera = new T.PerspectiveCamera(40, 16 / 10, 1, 140);
    setCamera.layers.enable(SET_LAYER);
    const VIEW_TARGET = new T.Vector3(-0.3, 3.2, 1.6);
    const VIEW_HOME = { turn: 0.26, lift: 0.4, distance: 19.5 };
    const view = { ...VIEW_HOME };
    function applyView() {
      view.turn = clamp(view.turn, -1.25, 1.25);
      view.lift = clamp(view.lift, 0.1, 1.5);
      view.distance = clamp(view.distance, 8, 30);
      const flat = Math.cos(view.lift) * view.distance;
      setCamera.position.set(VIEW_TARGET.x + Math.sin(view.turn) * flat, VIEW_TARGET.y + Math.sin(view.lift) * view.distance, VIEW_TARGET.z + Math.cos(view.turn) * flat);
      setCamera.lookAt(VIEW_TARGET);
      viewKey.position.copy(setCamera.position).add(new T.Vector3(2, 4, 0));   // the viewer's fill comes from where you stand
      dirty = true;
    }
    const monitorCamera = new T.PerspectiveCamera(38, 16 / 9, .28, 120);

    const ring = new T.Mesh(new T.RingGeometry(1.25, 1.36, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 }));
    ring.layers.set(SET_LAYER);
    scene.add(ring);

    /* State */
    let lights = [];
    let serial = 0;
    const CAMERA_HOME = { x: 0, z: 7, height: 4.7, focal: 24, pan: 0, tilt: 0 };
    const cam = { ...CAMERA_HOME, rig: buildCameraRig() };
    scene.add(cam.rig.group);
    const models = {};
    const failures = [];
    let activeSubject;
    let subjectRequest = 0;
    const mediaBase = new URL((window.TEXTBOOK_CONFIG || {}).mediaBase || 'media/', new URL('../', document.baseURI));
    const modelBase = new URL('studio/', mediaBase);
    let microphoneKit;
    let microphoneRequest;
    let cameraMic = false;
    let soundOn = false;
    const placedMics = new Set();
    let listening = '';
    const audio = new Audio();
    audio.preload = 'none';
    let selected = null;
    let dirty = true;
    applyView();

    function addLight(x, z, height, level, soft, mount = 'floor') {
      if (lights.length >= MAX_LIGHTS) return null;
      const fixture = buildFixture();
      attachFixtureModel(fixture);
      const spot = new T.SpotLight('#fff6e8', 1, 0, 0.6, 0.4, 2);
      spot.castShadow = true;
      spot.shadow.mapSize.set(1024, 1024);
      spot.shadow.camera.near = .15;
      spot.shadow.camera.far = 36;
      spot.shadow.bias = -.00055;
      spot.shadow.normalBias = .022;
      // A softbox is a wide source, not a point. Part of its light is sent from the whole 2 ft face, which
      // is what lets it reach around the nose and cheek and puts a square catch-light in the eyes. That part
      // casts no shadow of its own; the spot carries the rest and the shadow.
      const area = new T.RectAreaLight('#fff6e8', 0, SOFTBOX_SIDE, SOFTBOX_SIDE);
      scene.add(fixture.group, spot, spot.target, area);
      const light = { id: ++serial, kind: 'light', on: true, x, z, height, level, soft, mount, rail: 'long', fixture, spot, area };
      if (mount === 'grid') snapToGrid(light, x, z);
      fixture.handle.userData.item = light;
      lights.push(light);
      updateLight(light);
      return light;
    }
    function removeLight(light) {
      const fixture = light.fixture;
      scene.remove(fixture.group, light.spot, light.spot.target, light.area);
      light.spot.dispose();
      if (fixture.asset) fixture.asset.dispose();
      else releaseVisuals(fixture.stand, fixture.head);
      releaseVisuals(fixture.handle);
      lights = lights.filter(other => other !== light);
      if (selected === light) selected = lights[0] || cam;
    }
    function attachFixtureModel(fixture) {
      if (!models.light || fixture.asset) return;
      fixture.asset = modelsAPI.lightFixture(models.light);
      fixture.group.remove(fixture.stand, fixture.head);
      releaseVisuals(fixture.stand, fixture.head);
      fixture.group.add(fixture.asset.rig);
    }
    const headPoint = light => new T.Vector3(light.x, light.height, light.z);
    function sourcePoint(light) {
      const pivot = headPoint(light);
      const aim = FACE.clone().sub(pivot).normalize();
      // At very close range keep the face outside the housing and the source on the same side.
      const extension = light.soft ? 1.40 : .078;
      return pivot.addScaledVector(aim, Math.min(extension, pivot.distanceTo(FACE) * .55));
    }
    const distanceToFace = light => sourcePoint(light).distanceTo(FACE);
    const power = light => light.on ? light.level / 100 : 0;
    /* Position around the subject, seen from above: 0° is straight in front, negative is camera left. */
    const bearing = item => T.MathUtils.radToDeg(Math.atan2(item.x, item.z - FACE.z));
    const reach = item => Math.hypot(item.x, item.z - FACE.z);
    const aroundText = v => Math.abs(v) < 3 ? 'Front' : Math.abs(v) > 177 ? 'Behind' : Math.round(Math.abs(v)) + '° ' + (v < 0 ? 'left' : 'right');
    function describe(light) {
      const a = Math.abs(bearing(light)), rise = light.height - FACE.y;
      const where = reach(light) < 2.5 && rise > 3 ? 'Overhead' :
        (a < 10 ? 'In front of the subject' : a > 170 ? 'Behind the subject' :
          Math.round(a / 5) * 5 + '° to camera ' + (light.x < 0 ? 'left' : 'right') + (a > 100 ? ', behind the subject' : '')) +
        (rise > 1 ? ', above eye level' : rise < -1 ? ', below eye level' : ', at eye level');
      return where;
    }
    function directionOf(light) {
      const near = (a, b) => Math.abs(a - b) < .2;
      return Object.keys(DIRECTIONS).find(key => {
        const [, x, z, height, , mount = 'floor'] = DIRECTIONS[key];
        return light.mount === mount && near(Math.abs(light.x), Math.abs(x)) && near(light.z, z) && near(light.height, height);
      });
    }
    /* Move one light to a named direction. It stays on the side of the subject it was already on. */
    function applyDirection(light, key) {
      const [, x, z, height, level, mount = 'floor'] = DIRECTIONS[key];
      if (light.lowered != null && light.level === light.lowered[0]) light.level = light.lowered[1];   // undo an earlier automatic dim
      light.lowered = null;
      if (light.level > level) { light.lowered = [level, light.level]; light.level = level; }
      light.mount = mount;
      light.height = height;
      place(light, light.x > .5 && x < -1 ? -x : x, z);
    }
    /* Illuminance arriving at the face, in the scene's own unit (candela per square foot). */
    function luxAtFace(light) {
      const d = distanceToFace(light);
      return KEY_CANDELA * power(light) * (light.soft ? SOFTBOX_LOSS : 1) / (d * d);
    }
    function updateLight(light) {
      const { fixture, spot } = light;
      fixture.group.position.set(light.x, 0, light.z);
      if (fixture.asset) fixture.asset.update(light, FACE);
      else {
        fixture.pole.scale.y = Math.max(.2, light.height - .45);
        fixture.pole.position.y = (light.height - .45) / 2 + .02;
        fixture.head.position.set(0, light.height, 0);
        fixture.head.lookAt(FACE);
        fixture.softbox.visible = light.soft;
        const glow = power(light);
        fixture.emitterMat.emissiveIntensity = light.soft ? 0 : glow * 3.8;
        fixture.faceMat.emissiveIntensity = light.soft ? glow * 1.55 : 0;
      }
      fixture.handle.scale.y = light.height + 1.2;
      fixture.handle.position.y = (light.height + 1.2) / 2;
      // The lamp itself. Inverse-square falloff and the angle of the surface are worked out per pixel.
      spot.position.copy(sourcePoint(light));
      spot.target.position.copy(FACE);
      const output = KEY_CANDELA * power(light) * (light.soft ? SOFTBOX_LOSS : 1);
      spot.intensity = output * (light.soft ? 1 - AREA_SHARE : 1);
      // Luminance of the face = intensity / area, so both parts together still obey the inverse-square law.
      light.area.visible = light.soft;
      light.area.intensity = output * AREA_SHARE / (SOFTBOX_SIDE * SOFTBOX_SIDE);
      light.area.position.copy(spot.position);
      light.area.lookAt(FACE);
      spot.angle = light.soft ? 1.02 : 0.55;
      spot.penumbra = light.soft ? 1 : 0.3;
      // A bigger source, or a closer one, gives a softer shadow edge.
      const size = light.soft ? 2 : 0.5;
      spot.shadow.radius = clamp(size / Math.max(1.5, distanceToFace(light)) * 34, 1.2, 14);
      spot.shadow.camera.fov = T.MathUtils.radToDeg(spot.angle) * 2;
    }
    function updateCamera() {
      const { rig } = cam;
      rig.group.position.set(cam.x, 0, cam.z);
      const subjectDistance = new T.Vector3(cam.x, cam.height, cam.z).distanceTo(FACE);
      const frameTarget = FACE.clone();
      frameTarget.y -= Math.min(.48, .36 * subjectDistance * SENSOR_HALF_H / cam.focal);
      if (rig.asset) {
        rig.asset.update(cam, frameTarget, monitorCamera);
        rig.handle.scale.y = cam.height + 1;
        rig.handle.position.y = (cam.height + 1) / 2;
        monitorCamera.fov = 2 * T.MathUtils.radToDeg(Math.atan(SENSOR_HALF_H / cam.focal));
        monitorCamera.updateProjectionMatrix();
        return;
      }
      const hub = Math.min(cam.height - .75, 3.9);
      releaseGeometry(rig.legs.children);
      rig.legs.clear();
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3 + Math.PI / 2;
        rig.legs.add(bar([0, hub, 0], [Math.cos(a) * 1.5, 0.03, Math.sin(a) * 1.5], 0.05, rig.steel));
        rig.legs.add(bar([Math.cos(a) * 0.55, hub * 0.62, Math.sin(a) * 0.55], [0, hub * 0.45, 0], 0.025, rig.steel));
      }
      const columnLength = Math.max(0.3, cam.height - 0.4 - hub + 0.5);
      rig.column.scale.y = columnLength;
      rig.column.position.y = hub - 0.5 + columnLength / 2;
      const lensLength = 0.3 + (cam.focal - 12) / 48 * 0.45;      // the lens grows as it zooms
      rig.lens.scale.z = lensLength;
      rig.lens.position.z = -0.02 - lensLength / 2;
      rig.glass.position.z = -0.025 - lensLength;
      rig.top.position.set(0, cam.height + 0.08, 0);
      const dx = frameTarget.x - cam.x, dy = frameTarget.y - cam.height, dz = frameTarget.z - cam.z;
      rig.top.rotation.order = 'YXZ';
      rig.top.rotation.set(Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(-dx, -dz), 0);
      rig.handle.scale.y = cam.height + 1;
      rig.handle.position.y = (cam.height + 1) / 2;
      monitorCamera.position.set(cam.x, cam.height, cam.z);
      monitorCamera.lookAt(frameTarget);
      monitorCamera.fov = 2 * T.MathUtils.radToDeg(Math.atan(SENSOR_HALF_H / cam.focal));
      monitorCamera.updateProjectionMatrix();
    }
    cam.kind = 'camera';
    cam.rig.handle.userData.item = cam;

    /* ---------- Page ---------- */
    /* Departments this studio teaches. A lesson embed can narrow it (live.html?dept=camera). */
    const allow = new Set(String(opts.dept || 'light,camera,sound').split(',').map(s => s.trim()).filter(Boolean));
    const can = item => !!item && allow.has(item.kind === 'light' ? 'light' : 'camera');
    const startSound = !!opts.dept && allow.has('sound');
    const lightName = light => 'Light ' + (lights.indexOf(light) + 1);
    const deptOf = item => item ? (item.kind === 'light' ? 'light' : 'camera') : '';
    const ACCENT = { light: '#f2c065', camera: '#7ea2ff' };

    /* Stroke icons, 24 px grid. */
    const ICONS = {
      camera: ['M3.5 8.5a1.5 1.5 0 0 1 1.5-1.5h8.5a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z', 'M15 10.5l5-2.5v8l-5-2.5'],
      light: ['M5 6.5l8.5-2.8 2 6-8.5 2.8z', 'M15.5 9.7l3.5 1.6', 'M15.9 6.4l3.6-.7', 'M10.6 11.6V20', 'M7 20h7.2'],
      power: ['M12 3.5v7.5', 'M6.6 6.8a7.5 7.5 0 1 0 10.8 0'],
      plus: ['M12 5.5v13', 'M5.5 12h13'],
      flip: ['M7 7h11l-3-3', 'M17 17H6l3 3'],
      reset: ['M4.5 12a7.5 7.5 0 1 0 2.2-5.3', 'M4.5 4.5v4h4'],
      mic: ['M9 4.5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0z', 'M5.5 10.5a6.5 6.5 0 0 0 13 0', 'M12 17v3.5'],
      center: ['M12 3.5v4', 'M12 16.5v4', 'M3.5 12h4', 'M16.5 12h4', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z']
    };
    const icon = (name, cls) => svg('svg', { class: 'lv-icon' + (cls ? ' ' + cls : ''), viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
      ...ICONS[name].map(d => svg('path', { d })));

    const setCanvas = el('canvas', { className: 'lv-canvas', 'aria-label': 'Studio. Drag a stand to move it, or drag a lamp or the camera up or down to change its height. Drag empty space to look around. With the keyboard, arrow keys move the selected item, Page Up and Page Down change its height, and Delete removes a light.' });
    const monitorCanvas = el('canvas', { className: 'lv-canvas', role: 'img', 'aria-label': 'Camera monitor' });
    const shot = el('span', { className: 'lv-shot' });
    const announcer = el('p', { className: 'lv-sr', 'aria-live': 'polite' });
    const controls = el('section', { className: 'lv-controls', 'aria-label': 'Adjust the selected equipment' });
    const rail = el('div', { className: 'lv-rail', role: 'group', 'aria-label': 'Equipment. Choose what to adjust.' });
    const notice = el('p', { className: 'lv-notice', role: 'status', text: 'Loading 3D models…' });
    const subjectStatus = el('span', { className: 'lv-subject-status', role: 'status' });
    const subjectButtons = Object.entries(SUBJECTS).map(([key, name]) =>
      el('button', { type: 'button', 'data-subject': key, 'aria-pressed': 'false', onclick: () => chooseSubject(key) }, name));
    const soundToggle = el('button', { type: 'button', className: 'lv-switch lv-switch-sound', role: 'switch', 'aria-checked': 'false',
      hidden: !allow.has('sound'),
      onclick: () => {
        soundOn = !soundOn;
        if (soundOn) loadMicrophones();
        else audio.pause();
        updateSound();
        refresh(false);
      }
    }, el('span', { className: 'lv-switch-track', 'aria-hidden': 'true' }), icon('mic'), 'Sound');
    const micPanel = el('section', { className: 'lv-sound', 'aria-label': 'Microphone kit', hidden: true });
    const micList = el('div', { className: 'lv-sound-mics', role: 'group', 'aria-label': 'Place microphones' });
    const micButtons = {};
    const soundMessage = el('span', { className: 'lv-sound-message', role: 'status' });
    const listen = el('button', { type: 'button', className: 'lv-chip lv-listen', disabled: true, onclick: async () => {
      const sample = window.TEXTBOOK_MEDIA?.[modelsAPI.soundItems[listening]?.audio];
      if (!sample) return;
      audio.src = new URL(sample.file, mediaBase).href;
      try { await audio.play(); soundMessage.textContent = ''; }
      catch { soundMessage.textContent = 'The sound sample is unavailable.'; }
    } }, 'Listen');
    for (const [key, mic] of Object.entries(modelsAPI.soundItems)) {
      const button = el('button', { type: 'button', className: 'lv-chip', 'aria-pressed': 'false', onclick: () => {
        audio.pause();
        if (placedMics.has(key)) {
          placedMics.delete(key);
          if (listening === key) listening = [...placedMics].at(-1) || '';
        } else {
          placedMics.add(key);
          listening = key;
        }
        updateSound();
        refresh(false);
      } }, mic.name);
      micButtons[key] = button;
      micList.append(button);
    }
    micPanel.append(
      el('div', { className: 'lv-insp-head' }, el('span', { className: 'lv-badge lv-badge-lg' }, icon('mic')),
        el('div', { className: 'lv-insp-title' }, el('h2', { text: 'Microphones' }),
          el('p', { className: 'lv-insp-sub', text: 'Place one or more, then listen to the one you placed last.' }))),
      el('div', { className: 'lv-group lv-sound-body' }, micList, el('div', { className: 'lv-group-row' }, listen, soundMessage)));
    function updateSound() {
      micPanel.hidden = !soundOn;
      soundToggle.setAttribute('aria-checked', String(soundOn));
      for (const [key, button] of Object.entries(micButtons)) {
        button.disabled = !microphoneKit;
        button.setAttribute('aria-pressed', String(placedMics.has(key)));
        if (microphoneKit?.kit[key]) microphoneKit.kit[key].visible = soundOn && placedMics.has(key);
      }
      // The side table only stands on the set while something sits on it.
      const tableNeeded = soundOn && !!microphoneKit && (placedMics.has('desk') || placedMics.has('phone'));
      if (sideTable.visible !== tableNeeded) { sideTable.visible = tableNeeded; dirty = true; }
      planTable.style.display = tableNeeded ? '' : 'none';
      const attached = Boolean(soundOn && microphoneKit && cam.rig.asset && placedMics.has('camera'));
      if (attached !== cameraMic) {
        cam.rig.asset?.attachMic(attached ? microphoneKit.camera() : null);
        cameraMic = attached;
      }
      listen.disabled = !listening || !microphoneKit;
      listen.textContent = listening ? 'Listen to the ' + modelsAPI.soundItems[listening].name.toLowerCase() : 'Listen';
      soundMessage.textContent = microphoneKit ? '' : failures.includes('microphones') ? 'Microphone models are unavailable.' : 'Loading microphone models…';
    }
    function addNext() {
      const free = SPOTS.find(([x, z]) => !lights.some(light => Math.hypot(light.x - x, light.z - z) < 2)) || SPOTS[0];
      const light = addLight(...free);
      if (light) select(light);
    }
    function setup(count) {
      [...lights].forEach(removeLight);
      const made = SPOTS.slice(0, count).map(spot => addLight(...spot));
      select(made[0]);
    }
    const setups = el('div', { className: 'lv-seg lv-seg-sm', role: 'group', 'aria-label': 'Start from a lighting setup. This replaces the lights on the set.' },
      SETUPS.map(([name, count]) => el('button', { type: 'button', 'data-count': count, 'data-key': 'setup-' + count, 'aria-pressed': 'false', onclick: () => setup(count) }, name)));
    const tags = el('div', { className: 'lv-tags', 'aria-hidden': 'true' });
    const camTag = el('span', { className: 'lv-tag-cam' }, icon('camera'));
    const lightTags = el('div');
    tags.append(camTag, lightTags);

    /* ---------- Bird's-eye floor plan: an inset map in the corner of the set ---------- */
    const planHit = () => svg('circle', { class: 'lv-plan-hit', r: 1.8 });
    const planLights = svg('g');
    const planView = svg('path', { class: 'lv-plan-view' });
    const planCameraIcon = svg('g', null,
      svg('rect', { class: 'lv-plan-dot', x: -.75, y: -.7, width: 1.5, height: 1.1, rx: .2 }),
      svg('rect', { class: 'lv-plan-dot', x: -.35, y: .4, width: .7, height: .6, rx: .1 }));
    const planCameraHit = planHit();
    const planCamera = svg('g', { class: 'lv-plan-item lv-plan-cam', role: 'button' }, planCameraHit, planCameraIcon);
    planCamera.item = cam;
    const planTable = svg('circle', { class: 'lv-plan-table', cx: SIDE_TABLE.x, cy: SIDE_TABLE.z, r: SIDE_TABLE.r });
    const plan = svg('svg', { class: 'lv-plan', viewBox: '-11.6 -6.4 23.2 19.8', role: 'group', 'aria-label': 'Bird\'s-eye floor plan. Drag a light or the camera, or focus one and use the arrow keys.' },
      svg('rect', { class: 'lv-plan-room', x: ROOM.x0, y: ROOM.z0, width: ROOM.x1 - ROOM.x0, height: ROOM.z1 - ROOM.z0, rx: .4 }),
      ...[-6, 0, 6].map(x => svg('line', { class: 'lv-plan-rail', x1: x, y1: ROOM.z0, x2: x, y2: ROOM.z1 })),
      ...[-2, 2, 6].map(z => svg('line', { class: 'lv-plan-rail', x1: ROOM.x0, y1: z, x2: ROOM.x1, y2: z })),
      svg('line', { class: 'lv-plan-paper', x1: -5, y1: -5.5, x2: 5, y2: -5.5 }),
      planTable,
      ...[4, 8].map(r => svg('circle', { class: 'lv-plan-ring', cx: 0, cy: FACE.z, r })),
      planView,
      svg('circle', { class: 'lv-plan-subject', cx: 0, cy: .1, r: .85 }),
      svg('path', { class: 'lv-plan-subject', d: 'M-.32 .85 L0 1.45 L.32 .85Z' }),
      planLights, planCamera);
    function planLight() {
      return svg('g', { class: 'lv-plan-item', role: 'button' },
        svg('line', { class: 'lv-plan-beam' }), planHit(), svg('circle', { class: 'lv-plan-dot', r: 1 }), svg('text', { class: 'lv-plan-number' }));
    }
    function setMovable(node, item) {
      const movable = can(item);
      node.classList.toggle('is-fixed', !movable);
      if (movable) node.setAttribute('tabindex', '0');
      else node.removeAttribute('tabindex');
      node.setAttribute('aria-disabled', String(!movable));
    }
    function updatePlan() {
      while (planLights.children.length > lights.length) planLights.lastChild.remove();
      lights.forEach((light, i) => {
        const node = planLights.children[i] || planLights.appendChild(planLight());
        const [beam, hit, dot, number] = node.children;
        node.item = light;
        setMovable(node, light);
        node.setAttribute('aria-label', lightName(light) + '. ' + describe(light) + '.');
        node.setAttribute('aria-pressed', String(selected === light));
        node.classList.toggle('off', !power(light));
        for (const [k, v] of [['x1', light.x], ['y1', light.z], ['x2', 0], ['y2', FACE.z]]) beam.setAttribute(k, v);
        for (const shape of [hit, dot]) { shape.setAttribute('cx', light.x); shape.setAttribute('cy', light.z); }
        number.setAttribute('x', light.x);
        number.setAttribute('y', light.z + .42);
        number.textContent = i + 1;
      });
      // The camera, and a wedge for what its lens takes in.
      const yaw = Math.atan2(FACE.x - cam.x, FACE.z - cam.z) + T.MathUtils.degToRad(cam.pan);
      const half = Math.atan(SENSOR_HALF_H * 16 / 9 / cam.focal);
      const edge = a => (cam.x + Math.sin(a) * 9).toFixed(2) + ' ' + (cam.z + Math.cos(a) * 9).toFixed(2);
      planView.setAttribute('d', 'M' + cam.x.toFixed(2) + ' ' + cam.z.toFixed(2) + ' L' + edge(yaw - half) + ' L' + edge(yaw + half) + 'Z');
      planCameraIcon.setAttribute('transform', 'translate(' + cam.x + ' ' + cam.z + ') rotate(' + (-T.MathUtils.radToDeg(yaw)) + ')');
      planCameraHit.setAttribute('cx', cam.x);
      planCameraHit.setAttribute('cy', cam.z);
      setMovable(planCamera, cam);
      planCamera.setAttribute('aria-label', 'Camera, ' + reach(cam).toFixed(1) + ' feet from the subject.');
      planCamera.setAttribute('aria-pressed', String(selected === cam));
    }
    let planDrag = null;
    const planPoint = event => new DOMPoint(event.clientX, event.clientY).matrixTransform(plan.getScreenCTM().inverse());
    plan.addEventListener('pointerdown', event => {
      const node = event.target.closest('.lv-plan-item');
      if (!node || !can(node.item)) return;
      const item = node.item, point = planPoint(event);
      planDrag = { item, dx: item.x - point.x, dz: item.z - point.y };
      plan.setPointerCapture(event.pointerId);
      plan.classList.add('dragging');
      if (selected !== item) select(item);
    });
    plan.addEventListener('pointermove', event => {
      if (!planDrag) return;
      const point = planPoint(event);
      place(planDrag.item, point.x + planDrag.dx, point.y + planDrag.dz);
      refresh(false);
    });
    const endPlanDrag = () => { planDrag = null; plan.classList.remove('dragging'); };
    plan.addEventListener('pointerup', endPlanDrag);
    plan.addEventListener('pointercancel', endPlanDrag);
    plan.addEventListener('focusin', event => {
      const node = event.target.closest('.lv-plan-item');
      if (node && can(node.item) && selected !== node.item) select(node.item);
    });
    plan.addEventListener('keydown', event => {
      const node = event.target.closest('.lv-plan-item');
      if (node && can(node.item)) moveKey(event, node.item);
    });
    /* Keyboard: arrow keys slide the selected item half a foot, Page Up / Page Down raise and lower it,
       Delete removes a light. Pointer users do all of this by grabbing the gear in the set. */
    const HEIGHTS = { light: [1.25, 10], camera: [3.5, 5.75] };
    function canLift(item) { return item.kind !== 'light' || item.mount !== 'grid'; }
    function setHeight(item, h) {
      const [lo, hi] = HEIGHTS[deptOf(item)];
      item.height = clamp(h, lo, hi);
      if (item.kind === 'light') place(item, item.x, item.z);   // a very low light may stand closer
    }
    function moveKey(event, item) {
      if ((event.key === 'Delete' || event.key === 'Backspace') && item.kind === 'light') {
        event.preventDefault();
        removeLight(item);
        refresh(true);
        return;
      }
      if ((event.key === 'PageUp' || event.key === 'PageDown') && canLift(item)) {
        event.preventDefault();
        setHeight(item, item.height + (event.key === 'PageUp' ? .25 : -.25));
        refresh(false);
        return;
      }
      const step = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, -0.5], ArrowDown: [0, 0.5] }[event.key];
      if (!step) return;
      event.preventDefault();
      place(item, item.x + step[0], item.z + step[1]);
      refresh(false);
    }

    /* ---------- Layout ---------- */
    const setHint = el('p', { className: 'lv-set-hint', 'aria-hidden': 'true' },
      el('b', { text: 'Drag a stand' }), ' to move it · ', el('b', { text: 'drag a head' }), ' up or down for height · ',
      el('b', { text: 'drag empty space' }), ' to look around');
    const liftTag = el('span', { className: 'lv-lift', hidden: true });
    let viewBeforeAbove = null;
    const aboveButton = el('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
      if (viewBeforeAbove) { Object.assign(view, viewBeforeAbove); viewBeforeAbove = null; }
      else { viewBeforeAbove = { ...view }; Object.assign(view, { turn: 0, lift: 1.5, distance: 30 }); }
      aboveButton.setAttribute('aria-pressed', String(!!viewBeforeAbove));
      applyView();
    } }, 'From above');
    const planInset = el('figure', { className: 'lv-plan-inset' }, plan);
    const planButton = el('button', { type: 'button', 'aria-pressed': 'true', 'aria-label': 'Show the bird\'s-eye floor plan', onclick: () => {
      planInset.hidden = !planInset.hidden;
      planButton.setAttribute('aria-pressed', String(!planInset.hidden));
    } }, 'Plan');
    const viewBar = el('div', { className: 'lv-view', role: 'group', 'aria-label': 'Set view' },
      planButton,
      el('button', { type: 'button', 'aria-label': 'Move the view closer', onclick: () => { view.distance /= 1.18; applyView(); } }, '+'),
      el('button', { type: 'button', 'aria-label': 'Move the view back', onclick: () => { view.distance *= 1.18; applyView(); } }, '−'),
      aboveButton,
      el('button', { type: 'button', onclick: () => { viewBeforeAbove = null; aboveButton.setAttribute('aria-pressed', 'false'); Object.assign(view, VIEW_HOME); applyView(); } }, 'Reset view'));
    const app = el('main', { className: 'lv-app' + (opts.embed ? ' lv-embed' : '') },
      el('header', { className: 'lv-bar' },
        el('div', { className: 'lv-title' }, el('h1', { text: 'Live Studio' }),
          opts.embed ? null : el('a', { href: 'index.html', text: 'Production Studio' })),
        opts.embed ? null : el('p', { className: 'lv-lede', text: 'Move the lights and camera. Watch the result on the monitor.' }),
        el('span', { className: 'lv-spacer' }),
        el('div', { className: 'lv-cast' }, el('span', { className: 'lv-label', text: 'Subject' }),
          el('div', { className: 'lv-seg lv-seg-sm', role: 'group', 'aria-label': 'Subject' }, subjectButtons), subjectStatus),
        soundToggle,
        el('button', { type: 'button', className: 'lv-quiet', onclick: reset }, icon('reset'), 'Reset')),
      el('div', { className: 'lv-work' },
        el('div', { className: 'lv-left' }, el('div', { className: 'lv-set' }, setCanvas, tags, liftTag, viewBar, setHint, planInset), rail),
        el('div', { className: 'lv-side' },
          el('div', { className: 'lv-monitor' }, monitorCanvas, shot, el('span', { className: 'lv-monitor-tag', 'aria-hidden': 'true', text: 'Camera monitor' })),
          controls)),
      micPanel, notice, announcer);
    host.replaceChildren(app);
    updateSound();
    const setContext = setCanvas.getContext('2d'), monitorContext = monitorCanvas.getContext('2d');

    /* ---------- Equipment rail: camera group and lights group ---------- */
    const cardSubs = new Map();
    function cardText(item) {
      if (item === cam) return cam.focal + ' mm · ' + shotName();
      if (!item.on) return 'Switched off';
      const d = directionOf(item);
      const where = d ? DIRECTIONS[d][0] : item.mount === 'grid' ? 'On the grid' : aroundText(Math.round(bearing(item) / 5) * 5);
      return where + ' · ' + item.level + '%';
    }
    function railCard(item) {
      const isCam = item === cam;
      const sub = el('small', { className: 'lv-card-sub' });
      cardSubs.set(item, sub);
      const card = el('div', { className: 'lv-card' + (selected === item ? ' is-selected' : '') + (!isCam && !item.on ? ' is-off' : '') },
        el('button', { type: 'button', className: 'lv-card-pick', 'data-key': 'pick-' + (isCam ? 'camera' : item.id),
          'aria-pressed': String(selected === item), onclick: () => select(item) },
          el('span', { className: 'lv-badge' }, isCam ? icon('camera') : String(lights.indexOf(item) + 1)),
          el('span', { className: 'lv-card-text' }, el('b', { text: isCam ? 'Camera' : lightName(item) }), sub)));
      if (!isCam) card.append(el('button', { type: 'button', className: 'lv-card-power', role: 'switch', 'data-key': 'power-' + item.id,
        'aria-checked': String(item.on), 'aria-label': lightName(item) + ' power', title: item.on ? 'Switch off' : 'Switch on',
        onclick: () => { item.on = !item.on; refresh(true); } }, icon('power')));
      return card;
    }
    function syncCards() {
      for (const [item, sub] of cardSubs) sub.textContent = cardText(item);
    }
    function renderRail() {
      cardSubs.clear();
      const groups = [];
      if (allow.has('camera')) groups.push(el('div', { className: 'lv-rail-group', 'data-dept': 'camera' },
        el('div', { className: 'lv-rail-head' }, el('span', { className: 'lv-label lv-label-dept' }, icon('camera'), 'Camera')),
        el('div', { className: 'lv-rail-cards' }, railCard(cam))));
      if (allow.has('light')) {
        const full = lights.length >= MAX_LIGHTS;
        groups.push(el('div', { className: 'lv-rail-group lv-rail-lights', 'data-dept': 'light' },
          el('div', { className: 'lv-rail-head' },
            el('span', { className: 'lv-label lv-label-dept' }, icon('light'), 'Lights', el('span', { className: 'lv-count', text: lights.length + ' / ' + MAX_LIGHTS })),
            el('span', { className: 'lv-spacer' }),
            el('span', { className: 'lv-label lv-label-quiet', text: 'Start from' }), setups),
          el('div', { className: 'lv-rail-cards' }, lights.map(railCard),
            full ? null : el('button', { type: 'button', className: 'lv-card-add', 'data-key': 'add', onclick: addNext }, icon('plus'), 'Add a light'))));
      }
      rail.hidden = !groups.length;
      rail.replaceChildren(...groups);
    }

    /* ---------- Controls for the selected equipment ---------- */
    let syncers = [];
    function slider(key, label, min, max, step, get, format, onInput) {
      const out = el('output', { text: format(get()) });
      const input = el('input', { type: 'range', min, max, step, value: get(), 'data-key': key });
      const paint = () => {
        input.style.setProperty('--p', clamp((+input.value - min) / (max - min), 0, 1) * 100 + '%');
        input.setAttribute('aria-valuetext', out.textContent);
      };
      input.addEventListener('input', () => { out.textContent = format(+input.value); paint(); onInput(+input.value); refresh(false); });
      syncers.push(() => {
        if (document.activeElement !== input) { input.value = get(); out.textContent = format(+input.value); }
        paint();
      });
      paint();
      return el('label', { className: 'lv-field' }, el('span', { className: 'lv-field-top' }, el('span', { text: label }), out), input);
    }
    function seg(key, label, options, isOn, onPick) {
      const buttons = options.map(([value, text]) => el('button', { type: 'button', 'data-key': key + '-' + value, 'aria-pressed': 'false',
        onclick: () => { onPick(value); refresh(true); } }, text));
      syncers.push(() => buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(isOn(options[i][0])))));
      return el('div', { className: 'lv-seg', role: 'group', 'aria-label': label }, buttons);
    }
    const group = (title, ...kids) => el('section', { className: 'lv-group', 'aria-label': title }, el('h3', { text: title }), ...kids);
    const groupRow = (...kids) => el('div', { className: 'lv-group-row' }, ...kids);
    function inspectorHead(badge, title, sub, ...actions) {
      return el('div', { className: 'lv-insp-head' }, el('span', { className: 'lv-badge lv-badge-lg' }, badge),
        el('div', { className: 'lv-insp-title' }, el('h2', { text: title }), sub), el('span', { className: 'lv-spacer' }), ...actions);
    }
    function renderLightControls(light) {
      const sub = el('p', { className: 'lv-insp-sub' });
      syncers.push(() => { sub.textContent = describe(light) + (light.on ? '' : ' · switched off'); });
      const flip = el('button', { type: 'button', className: 'lv-chip lv-chip-sm', 'data-key': 'flip', onclick: () => { place(light, -light.x, light.z); refresh(true); } },
        icon('flip'), 'Other side');
      syncers.push(() => { flip.disabled = Math.abs(light.x) < .3; });
      // Jump to a classic position: a compact menu. It reads "Custom" once the light has been dragged elsewhere.
      const directionMenu = el('select', { className: 'lv-select', 'data-key': 'direction', 'aria-label': 'Jump to a position',
        onchange: () => { applyDirection(light, directionMenu.value); refresh(true); } },
        el('option', { value: '', disabled: true, text: 'Custom' }),
        Object.entries(DIRECTIONS).map(([key, [label]]) => el('option', { value: key, text: key === 'angle' ? '45° (key)' : label })));
      syncers.push(() => { if (document.activeElement !== directionMenu) directionMenu.value = directionOf(light) || ''; });
      const directionPicker = directionMenu;
      controls.append(
        inspectorHead(String(lights.indexOf(light) + 1), lightName(light), sub,
          el('button', { type: 'button', className: 'lv-quiet', 'data-key': 'remove', onclick: () => { removeLight(light); refresh(true); } }, 'Remove')),
        el('div', { className: 'lv-groups' },
          group('Position',
            groupRow(directionPicker, flip),
            light.mount === 'grid' ? el('p', { className: 'lv-hint', text: 'Hung from the grid. Pick another position to put it back on a stand.' }) :
              slider('height', 'Height', ...HEIGHTS.light, .05, () => light.height, v => v.toFixed(1) + ' ft', v => setHeight(light, v))),
          group('Light',
            slider('dimmer', 'Dimmer', 0, 100, 5, () => light.level, v => v + '%', v => { light.level = v; light.lowered = null; }),
            seg('soft', 'Light quality', [[false, 'Bare · hard'], [true, 'Softbox · soft']], v => light.soft === v, v => { light.soft = v; }))));
    }
    function renderCameraControls() {
      const sub = el('p', { className: 'lv-insp-sub' });
      syncers.push(() => { sub.textContent = 'Lumix G97 on a tripod · ' + reach(cam).toFixed(1) + ' ft away, ' + cam.height.toFixed(1) + ' ft high'; });
      const center = el('button', { type: 'button', className: 'lv-chip lv-chip-sm', 'data-key': 'center', onclick: () => { cam.pan = cam.tilt = 0; refresh(true); } },
        icon('center'), 'Centre');
      syncers.push(() => { center.disabled = !cam.pan && !cam.tilt; });
      controls.append(
        inspectorHead(icon('camera'), 'Camera', sub,
          el('button', { type: 'button', className: 'lv-quiet', 'data-key': 'cam-reset', onclick: () => { Object.assign(cam, CAMERA_HOME); refresh(true); } }, 'Reset')),
        el('div', { className: 'lv-groups' },
          group('Lens',
            slider('zoom', 'Zoom', 12, 60, 1, () => cam.focal, v => v + ' mm', v => { cam.focal = v; }),
            seg('focal', 'Zoom presets', [[12, 'Wide'], [25, 'Normal'], [60, 'Tele']], v => cam.focal === v, v => { cam.focal = v; })),
          group('Height and aim',
            slider('cam-height', 'Height', ...HEIGHTS.camera, .05, () => cam.height, v => v.toFixed(1) + ' ft', v => setHeight(cam, v)),
            slider('pan', 'Pan', -25, 25, 1, () => cam.pan, v => (v > 0 ? '+' : '') + v + '°', v => { cam.pan = v; }),
            slider('tilt', 'Tilt', -15, 15, 1, () => cam.tilt, v => (v > 0 ? '+' : '') + v + '°', v => { cam.tilt = v; }),
            groupRow(center))));
    }
    function renderControls() {
      const active = document.activeElement;
      const focusKey = active && (controls.contains(active) || rail.contains(active)) ? active.dataset.key : null;
      syncers = [];
      renderRail();
      controls.replaceChildren();
      controls.dataset.dept = deptOf(selected);
      controls.hidden = !selected;
      if (selected?.kind === 'light') renderLightControls(selected);
      else if (selected) renderCameraControls();
      syncers.push(syncCards);
      if (focusKey) app.querySelector('[data-key="' + focusKey + '"]')?.focus();
    }
    function shotName() {
      const frameHeight = 2 * monitorCamera.position.distanceTo(FACE) * Math.tan(T.MathUtils.degToRad(monitorCamera.fov / 2));
      return frameHeight > 5.2 ? 'Wide shot' : frameHeight > 3.1 ? 'Medium shot' : frameHeight > 1.9 ? 'Medium close-up' : frameHeight > 1 ? 'Close-up' : 'Extreme close-up';
    }
    function select(item) {
      selected = can(item) ? item : null;
      announcer.textContent = !selected ? '' : selected.kind === 'light' ? lightName(selected) + ' selected. ' + describe(selected) + '.' : 'Camera selected.';
      refresh(true);
    }
    /* Apply the state to the scene. `rebuild` also redraws the rail and the controls. */
    function refresh(rebuild) {
      lights.forEach(updateLight);
      bounce.intensity = BOUNCE * lights.reduce((sum, light) => sum + luxAtFace(light), 0);
      updateCamera();
      const at = selected ? (selected.kind === 'light' ? [selected.x, selected.z] : [cam.x, cam.z]) : null;
      ring.visible = !!at;
      if (at) {
        ring.position.set(at[0], 0.03, at[1]);
        ring.material.color.set(ACCENT[deptOf(selected)]);
      }
      if (rebuild) renderControls();
      for (const sync of syncers) sync();
      for (const button of setups.children) button.setAttribute('aria-pressed', String(isSetup(+button.dataset.count)));
      updatePlan();
      shot.textContent = shotName() + ' · ' + cam.focal + ' mm';
      dirty = true;
    }
    /* True while the lights still stand exactly where a setup put them. */
    function isSetup(count) {
      return lights.length === count && lights.every((light, i) => {
        const [x, z, height, , soft] = SPOTS[i];
        return light.mount === 'floor' && light.x === x && light.z === z && light.height === height && light.soft === soft;
      });
    }
    function reset() {
      [...lights].forEach(removeLight);
      audio.pause();
      placedMics.clear();
      listening = '';
      soundOn = startSound;
      if (soundOn) loadMicrophones();
      updateSound();
      Object.assign(cam, CAMERA_HOME);
      const first = addLight(-4.2, 4.2, 6.5, 100, true);
      select(allow.has('light') ? first : cam);
    }

    /* ---------- Dragging on the floor ---------- */
    const ray = new T.Raycaster();
    ray.layers.set(SET_LAYER);
    const floorPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
    let drag = null;
    function pointerRay(event) {
      const box = setCanvas.getBoundingClientRect();
      ray.setFromCamera(new T.Vector2((event.clientX - box.left) / box.width * 2 - 1, -((event.clientY - box.top) / box.height * 2 - 1)), setCamera);
    }
    function floorPoint(event) {
      pointerRay(event);
      return ray.ray.intersectPlane(floorPlane, new T.Vector3());
    }
    function snapToGrid(item, x, z) {
      const nearest = (v, bins) => bins.reduce((a, b) => Math.abs(v - a) < Math.abs(v - b) ? a : b);
      const rx = nearest(x, [-6, 0, 6]);
      const rz = nearest(z, [-2, 2, 6]);
      item.rail = Math.abs(x - rx) <= Math.abs(z - rz) ? 'long' : 'across';
      item.x = item.rail === 'long' ? rx : x;
      item.z = item.rail === 'across' ? rz : z;
      item.height = GRID_HEAD - (item.rail === 'across' ? .15 : 0);
    }
    function place(item, x, z) {
      x = clamp(x, ROOM.x0 + 1.5, ROOM.x1 - 0.5);      // anywhere in the room; turn the view to reach the far corners
      z = clamp(z, ROOM.z0 + 1, ROOM.z1 - 1.5);
      if (item.mount === 'grid') { snapToGrid(item, x, z); return; }
      const away = Math.hypot(x, z - FACE.z);
      const least = item.kind === 'light' ? (item.height < 2.36 ? .60 : 1.9) : 3;
      if (away < .002) z = FACE.z + least;
      else if (away < least) { x *= least / away; z = FACE.z + (z - FACE.z) * least / away; }
      item.x = x;
      item.z = z;
    }
    /* Only equipment this studio lets you move can be grabbed. */
    const handles = () => [cam, ...lights].filter(can).map(item => item === cam ? cam.rig.handle : item.fixture.handle);
    let hovered = null;
    function setHover(item) {
      if (item === hovered) return;
      hovered = item;
      setCanvas.classList.toggle('grab', !!item);
      if (!item) setCanvas.classList.remove('lift');
      paintTags();
    }
    /* Grabbing the top of a stand (the lamp head, or the camera on the tripod) lifts it; grabbing lower slides it. */
    function grabsHead(item, point) {
      if (!canLift(item) || viewBeforeAbove) return false;          // from straight above there is no up or down
      return point.y >= Math.max(item.height - (item.kind === 'light' ? 1.0 : .75), item.height * .6);
    }
    const liftPlane = new T.Plane();
    function liftPoint(event, item) {
      const facing = setCamera.position.clone().sub(new T.Vector3(item.x, 0, item.z)).setY(0).normalize();
      liftPlane.setFromNormalAndCoplanarPoint(facing, new T.Vector3(item.x, 0, item.z));
      pointerRay(event);
      return ray.ray.intersectPlane(liftPlane, new T.Vector3());
    }
    function showLift(item) {
      liftTag.hidden = !item;
      if (!item) return;
      liftTag.textContent = item.height.toFixed(1) + ' ft high';
      const p = new T.Vector3(item.x, item.height, item.z).project(setCamera);
      liftTag.style.left = (p.x + 1) * 50 + '%';
      liftTag.style.top = (1 - p.y) * 50 + '%';
    }
    setCanvas.addEventListener('pointerdown', event => {
      setHint.classList.add('is-gone');
      pointerRay(event);
      const hit = ray.intersectObjects(handles(), false)[0];
      if (!hit) {      // empty space: look around the room
        drag = { orbit: true, x: event.clientX, y: event.clientY, turn: view.turn, lift: view.lift };
        setCanvas.setPointerCapture(event.pointerId);
        setCanvas.classList.add('dragging');
        return;
      }
      const item = hit.object.userData.item;
      if (selected !== item) select(item);
      if (grabsHead(item, hit.point)) {
        const point = liftPoint(event, item);
        if (!point) return;
        drag = { item, lift: true, dy: item.height - point.y };
        setCanvas.classList.add('lifting');
        showLift(item);
      } else {
        const point = floorPoint(event);
        if (!point) return;
        drag = { item, dx: item.x - point.x, dz: item.z - point.z };
      }
      setCanvas.setPointerCapture(event.pointerId);
      setCanvas.classList.add('dragging');
    });
    setCanvas.addEventListener('pointermove', event => {
      if (!drag) {
        pointerRay(event);
        const hit = ray.intersectObjects(handles(), false)[0];
        const item = hit?.object.userData.item || null;
        setHover(item);
        setCanvas.classList.toggle('lift', !!item && grabsHead(item, hit.point));
        return;
      }
      if (drag.orbit) {
        view.turn = drag.turn - (event.clientX - drag.x) * 0.006;
        view.lift = drag.lift + (event.clientY - drag.y) * 0.005;
        applyView();
        return;
      }
      if (drag.lift) {
        const point = liftPoint(event, drag.item);
        if (!point) return;
        setHeight(drag.item, Math.round((point.y + drag.dy) * 20) / 20);
        refresh(false);
        showLift(drag.item);
        return;
      }
      const point = floorPoint(event);
      if (!point) return;
      place(drag.item, point.x + drag.dx, point.z + drag.dz);
      refresh(false);
    });
    // Pinch on a trackpad (or Ctrl + wheel) moves the view in and out. A plain wheel still scrolls the page.
    setCanvas.addEventListener('wheel', event => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      view.distance *= Math.exp(event.deltaY * 0.01);
      applyView();
    }, { passive: false });
    const endDrag = () => { drag = null; setCanvas.classList.remove('dragging', 'lifting'); showLift(null); };
    setCanvas.addEventListener('pointerleave', () => { if (!drag) setHover(null); });
    setCanvas.addEventListener('pointerup', endDrag);
    setCanvas.addEventListener('pointercancel', endDrag);
    // Keyboard: arrow keys move the selected item half a foot.
    setCanvas.tabIndex = 0;
    setCanvas.addEventListener('keydown', event => {
      if (event.key === '+' || event.key === '=' || event.key === '-') {
        view.distance *= event.key === '-' ? 1.12 : 1 / 1.12;
        applyView();
        return;
      }
      if (selected && can(selected)) moveKey(event, selected);
    });

    /* ---------- Drawing ---------- */
    function draw(canvas, context, camera, exposure) {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25, 1040 / Math.max(1, canvas.clientWidth));
      const w = Math.max(2, Math.round(canvas.clientWidth * ratio)), h = Math.max(2, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      renderer.setSize(w, h, false);
      renderer.toneMappingExposure = exposure;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      context.drawImage(renderer.domElement, 0, 0, w, h);
    }
    function frame() {
      requestAnimationFrame(frame);
      if (!dirty || !setCanvas.clientWidth) return;
      dirty = false;
      renderer.shadowMap.needsUpdate = true;
      draw(setCanvas, setContext, setCamera, 1);      // the set view is exposed a little brighter so the room reads
      updateTags();
      draw(monitorCanvas, monitorContext, monitorCamera, MONITOR_EXPOSURE);
    }
    /* Tags float over the gear in the set view: a numbered amber tag per light (matching
       the rail) and a blue camera tag, so the two departments read apart at a glance. */
    function placeTag(tag, point) {
      const p = point.project(setCamera);
      tag.hidden = p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1;
      tag.style.left = (p.x + 1) * 50 + '%';
      tag.style.top = (1 - p.y) * 50 + '%';
    }
    function updateTags() {
      while (lightTags.children.length > lights.length) lightTags.lastChild.remove();
      lights.forEach((light, i) => {
        const tag = lightTags.children[i] || lightTags.appendChild(el('span'));
        tag.textContent = i + 1;
        placeTag(tag, new T.Vector3(light.x, light.height + (light.mount === 'grid' ? -1.7 : 1.6), light.z));
      });
      placeTag(camTag, new T.Vector3(cam.x, cam.height + 1.25, cam.z));
      if (!allow.has('camera')) camTag.hidden = true;
      paintTags();
    }
    function paintTags() {
      lights.forEach((light, i) => {
        const tag = lightTags.children[i];
        if (!tag) return;
        tag.className = 'lv-tag-light' + (selected === light ? ' selected' : '') + (hovered === light ? ' hover' : '') +
          (power(light) ? '' : ' off') + (can(light) ? '' : ' fixed');
      });
      camTag.className = 'lv-tag-cam' + (selected === cam ? ' selected' : '') + (hovered === cam ? ' hover' : '');
    }
    new ResizeObserver(() => { dirty = true; }).observe(app);

    function showSubject(key, model) {
      finishModel('subject', model);
      scene.remove(subject);
      // The stand-in is private to this scene. Loaded subjects share resources with the model cache.
      if (!activeSubject) releaseVisuals(subject);
      subject = modelsAPI.scaled(model.clone(true));
      scene.add(subject);
      models.subject = model;
      activeSubject = key;
      for (const button of subjectButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.subject === key));
      }
      refresh(false);
    }

    async function chooseSubject(key) {
      const request = ++subjectRequest;
      const name = SUBJECTS[key];
      subjectStatus.textContent = '';
      if (key === activeSubject) return;

      subjectStatus.textContent = 'Loading ' + name + '…';
      try {
        const model = await modelsAPI.load(key, modelBase, 'subject');
        if (request !== subjectRequest) return;
        showSubject(key, model);
        subjectStatus.textContent = '';
      } catch (error) {
        if (request !== subjectRequest) return;
        subjectStatus.textContent = 'Could not load ' + name + '. Select again to retry.';
        console.warn('Live Studio model unavailable: ' + key, error);
      }
    }

    function applyModel(key, model) {
      finishModel(key, model);
      models[key] = model;
      if (key === 'light') {
        for (const { fixture } of lights) attachFixtureModel(fixture);
      } else if (key === 'microphones') {
        microphoneKit = modelsAPI.microphones(model, FACE);
        scene.add(...Object.values(microphoneKit.kit));
      }
      if (models.camera && models.tripod && !cam.rig.asset) {
        cam.rig.asset = modelsAPI.cameraFixture(models.tripod, models.camera, SET_LAYER);
        const { group, top, legs, column } = cam.rig;
        group.remove(top, legs, column);
        releaseVisuals(top, legs, column);
        group.add(cam.rig.asset.rig);
      }
      updateSound();
      refresh(false);
    }
    function loadMicrophones() {
      if (!microphoneRequest) {
        microphoneRequest = modelsAPI.load('microphones', modelBase)
          .then(model => applyModel('microphones', model))
          .catch(error => {
            failures.push('microphones');
            microphoneRequest = null;
            console.warn('Live Studio model unavailable: microphones', error);
            updateSound();
          });
      }
      return microphoneRequest;
    }
    async function loadModels() {
      for (const key of ['subject', 'tripod', 'camera', 'light']) {
        try {
          const asset = key === 'subject' ? DEFAULT_SUBJECT : key;
          const model = await modelsAPI.load(asset, modelBase, key);
          if (key !== 'subject') applyModel(key, model);
          else if (!activeSubject) showSubject(asset, model);
        }
        catch (error) {
          console.warn('Live Studio model unavailable: ' + key, error);
          failures.push(key);
        }
      }
      notice.hidden = !failures.length;
      notice.textContent = failures.length ? 'Some 3D models could not load. Check that the studio media folder is available.' : '';
      updateSound();
      app.dataset.models = failures.length ? 'partial' : 'loaded';
      return { loaded: Object.keys(models), failures: [...failures] };
    }
    reset();
    requestAnimationFrame(frame);
    const ready = loadModels();
    return { state: () => ({ lights, cam, selected, soundOn, microphones: [...placedMics] }),
      scene, refresh, addLight, select, applyDirection, setup, luxAtFace, renderer, ready, views: { setCamera, monitorCamera } };
  }

  window.LiveStudio = { mount };
})();
