/* Low-poly but car-shaped vehicles: bodies are side profiles extruded with rounded edges.
 * Used for the player's student-driver car, AI traffic and parked cars. */
RT.Vehicles = (function () {
  const T = THREE;

  // Side profiles. u runs rear (-L/2) to front (+L/2), v is height in metres.
  const TYPES = {
    sedan:  { L: 4.5, W: 1.86, belt: 0.98, roof: 1.46, hood: 1.15, trunk: 0.95, ws: 0.72, rw: 0.62, wheel: 0.36, wb: 2.7 },
    hatch:  { L: 4.0, W: 1.80, belt: 0.98, roof: 1.5,  hood: 0.95, trunk: 0.2,  ws: 0.7,  rw: 0.3,  wheel: 0.34, wb: 2.5 },
    suv:    { L: 4.7, W: 1.95, belt: 1.12, roof: 1.82, hood: 1.05, trunk: 0.15, ws: 0.62, rw: 0.2,  wheel: 0.42, wb: 2.85 },
    pickup: { L: 5.2, W: 1.98, belt: 1.12, roof: 1.84, hood: 1.35, trunk: 2.0,  ws: 0.6,  rw: 0.12, wheel: 0.43, wb: 3.2, bed: true },
    van:    { L: 4.9, W: 1.98, belt: 1.05, roof: 2.1,  hood: 0.75, trunk: 0.08, ws: 0.75, rw: 0.08, wheel: 0.38, wb: 3.0 }
  };

  function extrude(points, depth, bevel) {
    const s = new T.Shape();
    points.forEach(([u, v], k) => (k ? s.lineTo(u, v) : s.moveTo(u, v)));
    s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: depth - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
    // shape space: x = length, y = height, z = width  ->  car space: z = length, x = width
    g.rotateY(-Math.PI / 2);
    g.translate(depth / 2 - bevel, 0, 0);
    g.computeVertexNormals();
    return g;
  }

  /** Returns [{geom, part}] where part is 'body' | 'glass' | 'trim' | 'light' | 'tail' | 'tire' | 'rim'. */
  function parts(type) {
    const p = TYPES[type] || TYPES.sedan;
    const { L, W, belt, roof, hood, trunk } = p;
    const h = L / 2, low = 0.3;
    const out = [];
    // lower body
    const body = [[-h, low], [h, low], [h + 0.02, 0.62], [h - 0.18, belt - 0.12], [h - hood, belt], [-h + Math.max(0.1, trunk * 0.4), belt + 0.02], [-h, belt - 0.14]];
    if (p.bed) { body[5] = [-h + 0.05, belt + 0.02]; }
    out.push({ geom: extrude(body, W, 0.07), part: 'body' });
    // cabin: glass band plus a body-coloured roof
    const front = h - hood, wsTop = front - p.ws;
    const rear = p.bed ? -h + trunk : -h + trunk, rwTop = rear + p.rw;
    const cab = [[rear, belt - 0.02], [front, belt - 0.02], [wsTop, roof - 0.07], [rwTop, roof - 0.07]];
    out.push({ geom: extrude(cab, W * 0.86, 0.04), part: 'glass' });
    out.push({ geom: extrude([[rwTop - 0.04, roof - 0.09], [wsTop + 0.04, roof - 0.09], [wsTop - 0.02, roof], [rwTop + 0.02, roof]], W * 0.88, 0.035), part: 'body' });
    // pillars between the windows
    const bx = (rear + front) / 2 + 0.1;
    for (const sx of [-1, 1]) {
      const g = new T.BoxGeometry(0.05, roof - belt, 0.16); g.translate(sx * W * 0.43, (roof + belt) / 2 - 0.04, bx);
      out.push({ geom: g, part: 'body' });
    }
    if (p.bed) {
      for (const sx of [-1, 1]) { const g = new T.BoxGeometry(0.1, 0.32, trunk - 0.1); g.translate(sx * (W / 2 - 0.08), belt + 0.14, -h + trunk / 2); out.push({ geom: g, part: 'body' }); }
      const tg = new T.BoxGeometry(W - 0.1, 0.32, 0.08); tg.translate(0, belt + 0.14, -h + 0.06); out.push({ geom: tg, part: 'body' });
    }
    // bumpers, grille, lights
    const fb = new T.BoxGeometry(W * 0.98, 0.2, 0.16); fb.translate(0, 0.42, h + 0.06); out.push({ geom: fb, part: 'trim' });
    const rb = new T.BoxGeometry(W * 0.98, 0.2, 0.16); rb.translate(0, 0.42, -h - 0.06); out.push({ geom: rb, part: 'trim' });
    const gr = new T.BoxGeometry(W * 0.4, 0.14, 0.04); gr.translate(0, 0.64, h + 0.09); out.push({ geom: gr, part: 'trim' });
    for (const sx of [-1, 1]) {
      const hl = new T.BoxGeometry(0.38, 0.13, 0.05); hl.translate(sx * W * 0.33, 0.68, h + 0.09); out.push({ geom: hl, part: 'light', side: sx });
      const tl = new T.BoxGeometry(0.34, 0.15, 0.05); tl.translate(sx * W * 0.35, belt - 0.2, -h - 0.09); out.push({ geom: tl, part: 'tail', side: sx });
      const mirror = new T.BoxGeometry(0.16, 0.1, 0.12); mirror.translate(sx * (W / 2 + 0.06), belt + 0.05, front - 0.1); out.push({ geom: mirror, part: 'body' });
    }
    return { parts: out, spec: p };
  }

  function wheelGeoms(r) {
    const tire = new T.CylinderGeometry(r, r, 0.26, 16); tire.rotateZ(Math.PI / 2);
    const rim = new T.CylinderGeometry(r * 0.6, r * 0.6, 0.27, 10); rim.rotateZ(Math.PI / 2);
    return { tire, rim };
  }
  function wheelSpots(spec) {
    const out = [];
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) out.push({ x: sx * (spec.W / 2 - 0.12), y: spec.wheel, z: sz * spec.wb / 2, front: sz > 0 });
    return out;
  }

  const PALETTE = { glass: 0x1d2c3d, trim: 0x2a2e35, light: 0xfff6d8, tail: 0xc4161c, tire: 0x17191c, rim: 0xc9ced4 };

  /** One merged mesh (single draw call) for AI traffic and parked cars. */
  function mergedMesh(type, color, roofColor) {
    const { parts: ps, spec } = parts(type);
    const b = new RT.Build.Batch();
    const I = new T.Matrix4();
    let roofDone = false;
    for (const pt of ps) {
      let col = pt.part === 'body' ? color : PALETTE[pt.part];
      if (pt.part === 'body' && roofColor && !roofDone && pt.geom.type === 'ExtrudeGeometry' && ps.indexOf(pt) === 2) { col = roofColor; roofDone = true; }
      b.addGeometry(pt.geom, I, col);
      pt.geom.dispose();
    }
    const { tire, rim } = wheelGeoms(spec.wheel);
    for (const w of wheelSpots(spec)) {
      const m = new T.Matrix4().makeTranslation(w.x, w.y, w.z);
      b.addGeometry(tire, m, PALETTE.tire);
      b.addGeometry(rim, new T.Matrix4().makeTranslation(w.x + Math.sign(w.x) * 0.005, w.y, w.z), PALETTE.rim);
    }
    const mesh = b.build(RT.Build.M({ vertexColors: true }, { roughness: 0.38, metalness: 0.25 }));
    mesh.castShadow = true;
    return { mesh, spec };
  }

  // Glossy clear-coat paint when the device can afford it.
  function paint(color) {
    if (RT.Build.paintQuality === 'clearcoat') return new T.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 });
    return RT.Build.M({ color }, { roughness: 0.35, metalness: 0.2 });
  }

  /** Detailed player car: separate materials so lights and wheels can animate. */
  function playerCar(color, roofColor) {
    const { parts: ps, spec } = parts('hatch');
    const root = new T.Group(), body = new T.Group();
    root.add(body);
    const mats = {
      body: paint(color),
      roof: paint(roofColor),
      glass: RT.Build.M({ color: PALETTE.glass }, { roughness: 0.05, metalness: 0.6 }),
      trim: RT.Build.M({ color: PALETTE.trim }, { roughness: 0.5 }),
      light: new T.MeshBasicMaterial({ color: PALETTE.light }),
      tail: new T.MeshBasicMaterial({ color: 0x6a0f12 }),
      blinkL: new T.MeshBasicMaterial({ color: 0x5a3d0a }),
      blinkR: new T.MeshBasicMaterial({ color: 0x5a3d0a })
    };
    ps.forEach((pt, k) => {
      const mat = pt.part === 'body' ? (k === 2 ? mats.roof : mats.body) : mats[pt.part];
      const m = new T.Mesh(pt.geom, mat);
      m.castShadow = true;
      body.add(m);
    });
    // blinkers on the corners
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
      const g = new T.BoxGeometry(0.14, 0.1, 0.06);
      const m = new T.Mesh(g, sx > 0 ? mats.blinkL : mats.blinkR);
      m.position.set(sx * (spec.W / 2 - 0.12), sz > 0 ? 0.56 : spec.belt - 0.36, sz * (spec.L / 2 + 0.09));
      body.add(m);
    }
    const { tire, rim } = wheelGeoms(spec.wheel);
    const tireMat = RT.Build.M({ color: PALETTE.tire }, { roughness: 0.95 }), rimMat = RT.Build.M({ color: PALETTE.rim }, { roughness: 0.25, metalness: 0.9 });
    const wheels = wheelSpots(spec).map((w) => {
      const pivot = new T.Group(); pivot.position.set(w.x, w.y, w.z); root.add(pivot);
      const wheel = new T.Mesh(tire, tireMat); wheel.castShadow = true; pivot.add(wheel);
      const r = new T.Mesh(rim, rimMat); wheel.add(r);
      // a spoke so you can see the wheel turn
      const sp = new T.Mesh(new T.BoxGeometry(0.28, 0.06, spec.wheel * 1.05), rimMat); wheel.add(sp);
      return { pivot, wheel, front: w.front };
    });
    return { root, body, wheels, mats, spec };
  }

  /** The Blender-made student-driver hatchback (same interface as playerCar). */
  function playerCarFromModel(color, roofColor) {
    const K = RT.Kit, src = K.find(RT.ASSETS.vehicles, 'car_hatch');
    const root = new T.Group(), body = new T.Group(); root.add(body);
    const tail = new T.MeshBasicMaterial({ color: 0x6a0f12 });
    const reverse = new T.MeshBasicMaterial({ color: 0x5d6465 });
    const headlight = new T.MeshBasicMaterial({ color: 0xf4f7fa });
    const blinkL = new T.MeshBasicMaterial({ color: 0x5a3d0a }), blinkR = new T.MeshBasicMaterial({ color: 0x5a3d0a });
    const excluded = ['wheel_', 'blinkF', 'hero_rear_blink_', 'hero_steering'];
    for (const { material, geometry } of K.mergeAtOrigin(src, (o) => !excluded.some((name) => K.isUnder(o, name)))) {
      let m;
      if (material.name === 'Paint') m = paint(color);
      else if (material.name === 'Roof') m = paint(roofColor);
      else if (material.name === 'Taillight') m = tail;
      else if (material.name === 'Headlight') m = headlight;
      else if (material.name === 'ReverseLens') m = reverse;
      else if (material.name === 'HeroGlass') m = RT.Build.M({ color: 0x49646a, transparent: true, opacity: 0.32, depthWrite: false }, { roughness: 0.14, metalness: 0.3 });
      else if (material.name === 'Glass') m = RT.Build.M({ color: 0x1c2733 }, { roughness: 0.12, metalness: 0.35 });
      else m = K.convert(material);
      const mesh = new T.Mesh(geometry, m); mesh.castShadow = !m.transparent; body.add(mesh);
    }
    for (const [side, mat] of [['L', blinkL], ['R', blinkR]]) {
      const lamp = (o) => K.isUnder(o, 'blinkF' + side) || K.isUnder(o, 'hero_rear_blink_' + side);
      for (const { geometry } of K.mergeAtOrigin(src, lamp)) body.add(new T.Mesh(geometry, mat));
    }
    const spec = TYPES.hatch;
    // The glTF wheel spins about its local Y axis after Blender's Z-up conversion.
    const steerNode = K.find(src, 'hero_steering');
    let steering = null;
    if (steerNode) {
      const pivot = new T.Group();
      const matrix = new T.Matrix4().makeTranslation(-src.position.x, -src.position.y, -src.position.z);
      matrix.multiply(steerNode.matrixWorld).decompose(pivot.position, pivot.quaternion, pivot.scale);
      steering = new T.Group();
      steering.name = 'hero_steering';
      for (const { material, geometry } of K.mergeByMaterial(steerNode, null, steerNode)) {
        steering.add(new T.Mesh(geometry, K.convert(material)));
      }
      pivot.add(steering);
      body.add(pivot);
    }
    // wheels: steering pivot -> fixed flip (the model was spun 180 degrees) -> rolling wheel
    const wheels = [];
    src.updateMatrixWorld(true);
    const srcInv = new T.Matrix4().copy(src.matrixWorld).invert();
    for (const key of ['fl', 'fr', 'rl', 'rr']) {
      const node = K.find(src, 'car_hatch_wheel_' + key);
      const rel = new T.Matrix4().multiplyMatrices(srcInv, node.matrixWorld);
      const pos = new T.Vector3().setFromMatrixPosition(rel).applyAxisAngle(new T.Vector3(0, 1, 0), Math.PI);
      const pivot = new T.Group(); pivot.position.copy(pos); root.add(pivot);
      const flip = new T.Group(); flip.rotation.y = Math.PI; pivot.add(flip);
      const wheel = new T.Group(); flip.add(wheel);
      for (const { material, geometry } of K.mergeByMaterial(node, null, node)) {
        const mesh = new T.Mesh(geometry, K.convert(material)); mesh.castShadow = true; wheel.add(mesh);
      }
      wheels.push({ pivot, wheel, front: key[0] === 'f', rollSign: -1 });
    }
    return { root, body, wheels, steering, mats: { tail, blinkL, blinkR, reverse, headlight },
      spec: { roof: 1.5, wheel: 0.33, belt: spec.belt, L: spec.L, W: spec.W } };
  }

  function trafficParts(source) {
    const K = RT.Kit;
    const parts = K.mergeAtOrigin(source, (o) => !K.isUnder(o, 'hero_'));
    const keep = [];
    const details = new RT.Build.Batch();
    const identity = new T.Matrix4();
    for (const part of parts) {
      const { material, geometry } = part;
      if (['Paint', 'Glass', 'HeroGlass', 'Rubber'].includes(material.name)) {
        keep.push(part);
      } else {
        details.addGeometry(geometry, identity, material.color.getHex());
        geometry.dispose();
      }
    }
    const mat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.51, metalness: 0.13 });
    mat.name = 'Body details';
    keep.push({ material: mat, geometry: details.build(mat).geometry });
    return keep;
  }

  return { TYPES, mergedMesh, playerCar, playerCarFromModel, trafficParts };
})();
