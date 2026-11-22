/* Builds the 3D town from the map data. */
RT.buildWorld = function (map, quality) {
  const T = THREE, U = RT.U, B = RT.Build;
  const rnd = U.seeded(20261120);
  const scene = new T.Scene();
  scene.background = new T.Color(0xcfe6fb);
  scene.fog = new T.Fog(0xcfe6fb, 300, 1050);

  // ---------- light (colours and angle are driven by sky.js) ----------
  const hemi = new T.HemisphereLight(0xdcefff, 0x6a8a4a, 1.35);
  scene.add(hemi);
  const sun = new T.DirectionalLight(0xfff1d6, 2.3);
  sun.position.set(-60, 110, 40);
  sun.castShadow = quality.shadows;
  if (quality.shadows) {
    sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
    const c = sun.shadow.camera;
    c.left = -85; c.right = 85; c.top = 85; c.bottom = -85; c.near = 10; c.far = 420;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.5;
  }
  scene.add(sun); scene.add(sun.target);

  const maple = RT.ASSETS?.maple;
  const upgradedBlock = maple && RT.Maple.mount(maple, map, scene, quality);
  const materials = (name) => maple ? RT.Maple.surface(maple, name, quality.pbr) : {};

  // ---------- ground ----------
  const grassMap = maple?.textures.grass_color;
  const grassTex = grassMap ? grassMap.clone() : B.grassTexture();
  grassTex.repeat.set(260, 260);
  grassTex.needsUpdate = true;
  const ground = new T.Mesh(new T.PlaneGeometry(3200, 3200), B.M({ map: grassTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- batches (each becomes one mesh / one draw call) ----------
  const road = new B.Batch();     // asphalt, world-textured
  const flat = new B.Batch();     // paint, paths, plazas
  const paint = maple ? new B.Batch() : flat;
  const walk = new B.Batch();     // concrete sidewalks
  const yard = new B.Batch();     // lawns
  const solid = new B.Batch();    // props, roofs, poles
  const parked = new B.Batch();   // parked cars
  const bulbs = new B.Batch();    // streetlight bulbs (glow at dusk)
  const fac = { glass: new B.Batch(), brick: new B.Batch(), siding: new B.Batch(), store: new B.Batch() };

  const PAINT_W = 0xf4f4ef, PAINT_Y = 0xf2c230;
  const WALK = 0xe2ddd3, PLAZA = 0xeee3cf;
  const RY = 0.03, PY = 0.06;

  // ---------- roads ----------
  const roadTile = maple ? 3.8 : 11, lotTile = maple ? roadTile : 7;
  for (const r of map.drive) road.rectUV(r.x0, r.z0, r.x1, r.z1, RY, 0xffffff, roadTile);
  road.rectUV(map.lot.x0, map.lot.z0 + 0.6, map.lot.x1, map.lot.z1, RY + 0.004, 0xe9e9e9, lotTile);
  road.rectUV(map.overlook.x0 + 0.6, map.overlook.z0, map.overlook.x1, map.overlook.z1, RY + 0.004, 0xe9e9e9, lotTile);
  const mark = (x0, z0, x1, z1, color) => paint.rectUV(x0, z0, x1, z1, PY, color, 1.25);

  const markings = [];
  for (const s of map.segments) {
    const a = map.nodes[s.a], b = map.nodes[s.b];
    const along = s.axis === 'x';
    const startOff = (along ? a.halfX : a.halfZ) + (a.degree >= 3 ? map.CROSSWALK : 0);
    const endOff = (along ? b.halfX : b.halfZ) + (b.degree >= 3 ? map.CROSSWALK : 0);
    const p0 = (along ? a.x : a.z) + startOff, p1 = (along ? b.x : b.z) - endOff;
    const c = along ? a.z : a.x;
    const line = (off, w, color, dash, gap) => {
      if (!dash) {
        if (along) mark(p0, c + off - w / 2, p1, c + off + w / 2, color);
        else mark(c + off - w / 2, p0, c + off + w / 2, p1, color);
        return;
      }
      for (let q = p0 + 1; q < p1 - 1; q += dash + gap) {
        const q1 = Math.min(q + dash, p1 - 1);
        if (along) mark(q, c + off - w / 2, q1, c + off + w / 2, color);
        else mark(c + off - w / 2, q, c + off + w / 2, q1, color);
      }
    };
    if (s.type === 'avenue') {
      line(-0.22, 0.12, PAINT_Y); line(0.22, 0.12, PAINT_Y);
      line(-(s.width / 2 - 0.7), 0.12, PAINT_W); line(s.width / 2 - 0.7, 0.12, PAINT_W);
    } else {
      line(0, 0.12, PAINT_Y, 3, 5);
    }
    markings.push(s);
  }

  // crosswalks + stop lines
  for (const n of map.nodes) {
    if (n.degree < 3) continue;
    for (const k of ['N', 'E', 'S', 'W']) {
      if (n.exits[k] === null) continue;
      const seg = map.segments[n.exits[k]];
      const d = U.DIRS[k]; // pointing away from the node along this arm
      const hw = seg.width / 2;
      const inner = map.halfAlong(n, k) + 0.4, outer = map.halfAlong(n, k) + map.CROSSWALK - 0.4;
      // zebra stripes run parallel to traffic
      for (let q = -hw + 0.8; q < hw - 0.5; q += 1.3) {
        if (d.x !== 0) {
          const x0 = n.x + d.x * inner, x1 = n.x + d.x * outer;
          mark(Math.min(x0, x1), n.z + q, Math.max(x0, x1), n.z + q + 0.6, PAINT_W);
        } else {
          const z0 = n.z + d.z * inner, z1 = n.z + d.z * outer;
          mark(n.x + q, Math.min(z0, z1), n.x + q + 0.6, Math.max(z0, z1), PAINT_W);
        }
      }
      // stop line across the incoming lane (cars arriving travel opposite to d)
      const travel = U.OPPOSITE[k];
      const td = U.DIRS[travel], tr = U.rightOf(td);
      const sl = map.halfAlong(n, travel) + map.CROSSWALK;
      const cx = n.x - td.x * (sl + 0.3), cz = n.z - td.z * (sl + 0.3);
      const lx0 = cx, lz0 = cz, lx1 = cx + tr.x * (hw - 0.3), lz1 = cz + tr.z * (hw - 0.3);
      if (td.x !== 0) mark(cx - 0.3, Math.min(lz0, lz1), cx + 0.3, Math.max(lz0, lz1), PAINT_W);
      else mark(Math.min(lx0, lx1), cz - 0.3, Math.max(lx0, lx1), cz + 0.3, PAINT_W);
    }
  }

  // parking stalls in the Permit Office lot
  {
    const L = map.lot;
    for (let x = L.x0 + 4; x <= L.x1 - 3; x += 5) mark(x - 0.08, L.z1 - 9, x + 0.08, L.z1 - 0.6, PAINT_W);
  }

  // ---------- helpers for blocks ----------
  const trees = [];
  const addTree = (x, z, s = 1, kind = 0, y) => trees.push({ x, z, s, kind, y });
  const SW = 3.5;
  const CUT = map.CORNER;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  // interior: 'grass' | 'walk' | 'plaza' | 'lot' | null
  function sidewalkRing(b, interior) {
    const o = { topUV: 3.5, ao: 0 };
    walk.box((b.x0 + b.x1) / 2, 0, b.z0 + SW / 2, b.x1 - b.x0 - CUT * 2, 0.2, SW, WALK, o);
    walk.box((b.x0 + b.x1) / 2, 0, b.z1 - SW / 2, b.x1 - b.x0 - CUT * 2, 0.2, SW, WALK, o);
    walk.box(b.x0 + SW / 2, 0, (b.z0 + b.z1) / 2, SW, 0.2, b.z1 - b.z0 - SW * 2, WALK, o);
    walk.box(b.x1 - SW / 2, 0, (b.z0 + b.z1) / 2, SW, 0.2, b.z1 - b.z0 - SW * 2, WALK, o);
    const x0 = b.x0 + SW, x1 = b.x1 - SW, z0 = b.z0 + SW, z1 = b.z1 - SW;
    if (interior === 'grass') yard.rectUV(x0, z0, x1, z1, 0.16, 0xffffff, 6);
    else if (interior === 'walk') walk.rectUV(x0, z0, x1, z1, 0.2, WALK, 3.5);
    else if (interior === 'plaza') walk.rectUV(x0, z0, x1, z1, 0.2, PLAZA, 5);
    else if (interior === 'lot') road.rectUV(x0, z0, x1, z1, 0.17, 0xf0f0f0, 7);
  }
  function streetTrees(b, spacing = 16) {
    for (let x = b.x0 + 8; x < b.x1 - 6; x += spacing) { addTree(x, b.z0 + 1.6, 0.8); addTree(x, b.z1 - 1.6, 0.8); }
    for (let z = b.z0 + 8 + spacing / 2; z < b.z1 - 6; z += spacing) { addTree(b.x0 + 1.6, z, 0.8); addTree(b.x1 - 1.6, z, 0.8); }
  }
  // Lots along the inside of a block's four edges, each facing its street.
  function frontageLots(r, depth, minW, maxW) {
    const lots = [];
    const run = (a0, a1, make) => {
      let a = a0;
      while (a1 - a > minW) {
        let w = minW + rnd() * (maxW - minW);
        if (a1 - a - w < minW) w = a1 - a;
        lots.push(make(a, a + w)); a += w;
      }
    };
    run(r.x0, r.x1, (a, b2) => ({ x0: a, x1: b2, z0: r.z0, z1: r.z0 + depth, face: 'N' }));
    run(r.x0, r.x1, (a, b2) => ({ x0: a, x1: b2, z0: r.z1 - depth, z1: r.z1, face: 'S' }));
    run(r.z0 + depth, r.z1 - depth, (a, b2) => ({ x0: r.x0, x1: r.x0 + depth, z0: a, z1: b2, face: 'W' }));
    run(r.z0 + depth, r.z1 - depth, (a, b2) => ({ x0: r.x1 - depth, x1: r.x1, z0: a, z1: b2, face: 'E' }));
    return lots;
  }
  // a parked car (merged into one batch)
  const parkedColors = [0xc0392b, 0xf5f5f5, 0x2c3e50, 0x7f8c8d, 0x2471a3, 0xd4ac0d, 0x1e8449, 0x34495e];
  const parkedTypes = ['sedan', 'hatch', 'suv', 'sedan', 'pickup'];
  const parkedList = [], houseList = [];
  function parkCar(x, z, rotY) {
    if (RT.useModels) { parkedList.push({ type: pick(parkedTypes), color: pick(parkedColors), x, z, rotY }); return; }
    const { mesh } = RT.Vehicles.mergedMesh(pick(parkedTypes), pick(parkedColors));
    parked.addColored(mesh.geometry, new T.Matrix4().makeRotationY(rotY).setPosition(x, 0.17, z));
    mesh.geometry.dispose();
  }
  function hydrant(x, z) { solid.cyl(x, 0.2, z, 0.17, 0.62, 0xc8302b, 8); solid.cyl(x, 0.82, z, 0.12, 0.14, 0xc8302b, 8); solid.box(x, 0.5, z, 0.46, 0.1, 0.1, 0xc8302b); }
  function bench(x, z, rot) { solid.rbox(x, 0.45, z, 1.8, 0.08, 0.5, rot, 0x8b5a2b); solid.rbox(x - Math.sin(rot) * 0.22, 0.75, z - Math.cos(rot) * 0.22, 1.8, 0.5, 0.06, rot, 0x8b5a2b); solid.rbox(x, 0.22, z, 1.6, 0.44, 0.08, rot, 0x2d2f33); }
  function bin(x, z) { solid.cyl(x, 0.2, z, 0.28, 0.9, 0x2e5e3e, 8); }

  const towerTints = [0xb9cde0, 0xdfe8ef, 0xa9c2d8, 0xc7d6e2, 0xd5dee6];
  const brickTints = [0xc9a184, 0xd8c3a5, 0xb88a6a, 0xe0d2bd, 0xc2b3a3, 0xa66f55];
  const shopColors = [0xc8553d, 0xe9b44c, 0x5c9ead, 0xf0e2c3, 0x9b5de5, 0x7bb662, 0xe07a5f, 0x3d5a80, 0xf2cc8f];
  const awningColors = [0xd62828, 0x2a9d8f, 0xf77f00, 0x264653, 0x6a4c93, 0x1982c4];
  const houseColors = [0xf4e3c1, 0xcfe1e8, 0xe8c7c8, 0xd6e5c3, 0xf7d9a8, 0xbdd3e6, 0xeedfcc, 0xd9c2e9];
  const roofColors = [0x7a3e2b, 0x4a4e57, 0x5b6b3a, 0x8a4f3a, 0x3c4a5c];

  function parapet(cx, y, cz, w, d, color) {
    const t = 0.35, h = 0.9;
    solid.box(cx, y, cz - d / 2 + t / 2, w, h, t, color); solid.box(cx, y, cz + d / 2 - t / 2, w, h, t, color);
    solid.box(cx - w / 2 + t / 2, y, cz, t, h, d - t * 2, color); solid.box(cx + w / 2 - t / 2, y, cz, t, h, d - t * 2, color);
  }
  function rooftop(cx, y, cz, w, d, tall) {
    const r = rnd();
    if (r < 0.28 && w > 10) { // classic water tower
      const tx = cx + (rnd() - 0.5) * w * 0.4, tz = cz + (rnd() - 0.5) * d * 0.4;
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) solid.cyl(tx + dx * 1.1, y, tz + dz * 1.1, 0.1, 2.4, 0x5b4636, 4);
      solid.cyl(tx, y + 2.4, tz, 1.7, 3, 0x8a5a3c, 12); solid.cyl(tx, y + 5.4, tz, 1.8, 1.1, 0x5b4636, 12, 0.1);
    } else {
      for (let k = 0; k < 2 + Math.floor(rnd() * 3); k++) solid.box(cx + (rnd() - 0.5) * w * 0.6, y, cz + (rnd() - 0.5) * d * 0.6, 1.6 + rnd() * 2.5, 1 + rnd() * 1.4, 1.4 + rnd() * 2, 0xb3b8bd);
    }
    if (tall) { solid.cyl(cx, y, cz, 0.12, 9, 0xd0d4d8, 6); solid.box(cx, y + 9, cz, 0.3, 0.3, 0.3, 0xe03131); }
  }

  function tower(x0, z0, x1, z1) {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const h = 16 + Math.floor(rnd() * 12) * 4;
    const glass = rnd() < 0.6;
    const col = glass ? pick(towerTints) : pick(brickTints);
    const roof = 0x8b9096;
    fac.store.box(cx, 0.2, cz, w, 4.4, d, 0xe4e4e4, { top: roof, tileU: 6, tileV: 4.4, ao: 0.25 });
    solid.box(cx, 4.6, cz, w + 0.4, 0.35, d + 0.4, 0x6f757c);
    (glass ? fac.glass : fac.brick).box(cx, 4.6, cz, w, h - 4.4, d, col, { top: roof, tileU: glass ? 3 : 3.4, tileV: 3.6, uOff: Math.floor(rnd() * 4) * 0.5 });
    let top = 0.2 + h;
    parapet(cx, top, cz, w, d, glass ? 0x9aa7b3 : new T.Color(col).multiplyScalar(0.8).getHex());
    if (rnd() < 0.5 && w > 14 && d > 14) {
      const h2 = 8 + Math.floor(rnd() * 5) * 3.6;
      (glass ? fac.glass : fac.brick).box(cx, top, cz, w * 0.62, h2, d * 0.62, col, { top: roof, tileU: glass ? 3 : 3.4, tileV: 3.6 });
      top += h2;
      parapet(cx, top, cz, w * 0.62, d * 0.62, 0x9aa7b3);
      rooftop(cx, top, cz, w * 0.62, d * 0.62, h > 50);
    } else rooftop(cx, top, cz, w, d, false);
  }

  function shop(l) {
    const w = l.x1 - l.x0, d = l.z1 - l.z0, cx = (l.x0 + l.x1) / 2, cz = (l.z0 + l.z1) / 2;
    const upper = 3.4 * (1 + Math.floor(rnd() * 2));
    const col = pick(shopColors), wall = pick(brickTints);
    fac.store.box(cx, 0.2, cz, w - 0.6, 4.2, d, col, { top: 0x7b7f85, tileU: 5, tileV: 4.2, ao: 0.2 });
    fac.brick.box(cx, 4.4, cz, w - 0.6, upper, d, wall, { top: 0x7b7f85, tileU: 3.4, tileV: 3.4 });
    parapet(cx, 4.4 + upper, cz, w - 0.6, d, new T.Color(wall).multiplyScalar(0.8).getHex());
    solid.box(cx, 4.2, cz, w - 0.2, 0.25, d + 0.3, 0xf2efe8); // cornice between floors
    const aw = pick(awningColors), ad = 1.7;
    if (l.face === 'N') solid.rbox(cx, 3.1, l.z0 - ad / 2, w - 1.8, 0.12, ad, 0, aw);
    if (l.face === 'S') solid.rbox(cx, 3.1, l.z1 + ad / 2, w - 1.8, 0.12, ad, 0, aw);
    if (l.face === 'W') solid.rbox(l.x0 - ad / 2, 3.1, cz, ad, 0.12, d - 1.8, 0, aw);
    if (l.face === 'E') solid.rbox(l.x1 + ad / 2, 3.1, cz, ad, 0.12, d - 1.8, 0, aw);
  }

  function house(l) {
    const cx = (l.x0 + l.x1) / 2, cz = (l.z0 + l.z1) / 2;
    const alongX = l.face === 'N' || l.face === 'S';
    // Blender houses come in three footprints (width x depth): a 10x8.5, b 9x8, c 13x8.5
    const variant = RT.useModels ? pick(['house_a', 'house_a', 'house_b', 'house_b', 'house_c']) : null;
    const vw = variant === 'house_c' ? 13 : variant === 'house_b' ? 9 : 10, vd = variant === 'house_b' ? 8 : 8.5;
    const hw = variant ? (alongX ? vw : vd) : (alongX ? Math.min(11, l.x1 - l.x0 - 6) : 9);
    const hd = variant ? (alongX ? vd : vw) : (alongX ? 9 : Math.min(11, l.z1 - l.z0 - 6));
    let hx = cx, hz = cz;
    if (l.face === 'N') hz = l.z0 + 5 + hd / 2;
    if (l.face === 'S') hz = l.z1 - 5 - hd / 2;
    if (l.face === 'W') hx = l.x0 + 5 + hw / 2;
    if (l.face === 'E') hx = l.x1 - 5 - hw / 2;
    const col = pick(houseColors);
    if (variant) {
      const rot = { S: 0, N: Math.PI, W: -Math.PI / 2, E: Math.PI / 2 }[l.face];
      houseList.push({ variant, x: hx, z: hz, rot, wall: col, roof: pick(roofColors) });
    } else {
      const wallH = rnd() < 0.35 ? 6.4 : 3.6;
      fac.siding.box(hx, 0.16, hz, hw, wallH, hd, col, { tileU: 4.5, tileV: 3.2, vOff: 0.08, noTop: true, ao: 0.22 });
      solid.gable(hx, 0.16 + wallH, hz, hw + 0.9, hd + 0.9, 2.6, alongX, pick(roofColors));
      if (rnd() < 0.5) solid.box(hx + (alongX ? hw * 0.25 : 0), 0.16 + wallH + 1, hz + (alongX ? 0 : hd * 0.25), 0.7, 2.4, 0.7, 0x8a4f3a); // chimney
    }
    // door, porch step, path, bushes, mailbox, fence, driveway
    const door = 0x6b4226;
    const d = U.DIRS[l.face], r = U.rightOf(d);
    const fx = hx + d.x * (alongX ? 0 : hw / 2), fz = hz + d.z * (alongX ? hd / 2 : 0); // front wall centre
    void r;
    if (l.face === 'N') { if (!variant) solid.box(hx, 0.16, hz - hd / 2 - 0.05, 1.1, 2.1, 0.12, door); flat.rect(hx - 0.7, l.z0, hx + 0.7, hz - hd / 2, 0.18, 0xd8cfbd); }
    if (l.face === 'S') { if (!variant) solid.box(hx, 0.16, hz + hd / 2 + 0.05, 1.1, 2.1, 0.12, door); flat.rect(hx - 0.7, hz + hd / 2, hx + 0.7, l.z1, 0.18, 0xd8cfbd); }
    if (l.face === 'W') { if (!variant) solid.box(hx - hw / 2 - 0.05, 0.16, hz, 0.12, 2.1, 1.1, door); flat.rect(l.x0, hz - 0.7, hx - hw / 2, hz + 0.7, 0.18, 0xd8cfbd); }
    if (l.face === 'E') { if (!variant) solid.box(hx + hw / 2 + 0.05, 0.16, hz, 0.12, 2.1, 1.1, door); flat.rect(hx + hw / 2, hz - 0.7, l.x1, hz + 0.7, 0.18, 0xd8cfbd); }
    // bushes along the front wall
    for (const s of [-1, 1]) {
      const bx = fx + (alongX ? s * hw * 0.32 : d.x * 0.9), bz = fz + (alongX ? d.z * 0.9 : s * hd * 0.32);
      addTree(bx, bz, 0.5 + rnd() * 0.2, 2);
    }
    // mailbox by the sidewalk
    const mx = alongX ? hx + 1.6 : (l.face === 'W' ? l.x0 + 0.6 : l.x1 - 0.6), mz = alongX ? (l.face === 'N' ? l.z0 + 0.6 : l.z1 - 0.6) : hz + 1.6;
    solid.cyl(mx, 0.16, mz, 0.05, 1.05, 0x5b4636, 4); solid.box(mx, 1.2, mz, 0.28, 0.26, 0.45, pick([0x2b2d33, 0xe9e9e9, 0x3d5a80]));
    // picket fence along the front
    if (rnd() < 0.4) {
      const y = 0.16;
      if (alongX) {
        const z = l.face === 'N' ? l.z0 + 0.3 : l.z1 - 0.3;
        for (const [a0, a1] of [[l.x0 + 0.3, hx - 1], [hx + 1, l.x1 - 0.3]]) { solid.box((a0 + a1) / 2, y + 0.55, z, a1 - a0, 0.08, 0.05, 0xfbfbf8); for (let x = a0; x < a1; x += 0.45) solid.box(x, y, z, 0.08, 0.9, 0.04, 0xfbfbf8); }
      } else {
        const x = l.face === 'W' ? l.x0 + 0.3 : l.x1 - 0.3;
        for (const [a0, a1] of [[l.z0 + 0.3, hz - 1], [hz + 1, l.z1 - 0.3]]) { solid.box(x, y + 0.55, (a0 + a1) / 2, 0.05, 0.08, a1 - a0, 0xfbfbf8); for (let z = a0; z < a1; z += 0.45) solid.box(x, y, z, 0.04, 0.9, 0.08, 0xfbfbf8); }
      }
    }
    // driveway with a parked car on some lots
    if (rnd() < 0.45) {
      if (alongX && l.x1 - l.x0 > 17) {
        const dx = l.x1 - 3.2, z0 = l.face === 'N' ? l.z0 : hz - hd / 2, z1 = l.face === 'N' ? hz + hd / 2 : l.z1;
        flat.rect(dx - 1.6, z0, dx + 1.6, z1, 0.18, 0xcfcac1);
        if (rnd() < 0.75) parkCar(dx, l.face === 'N' ? l.z0 + 5.5 : l.z1 - 5.5, l.face === 'N' ? Math.PI : 0);
      } else if (!alongX && l.z1 - l.z0 > 17) {
        const dz = l.z1 - 3.2, x0 = l.face === 'W' ? l.x0 : hx - hw / 2, x1 = l.face === 'W' ? hx + hw / 2 : l.x1;
        flat.rect(x0, dz - 1.6, x1, dz + 1.6, 0.18, 0xcfcac1);
        if (rnd() < 0.75) parkCar(l.face === 'W' ? l.x0 + 5.5 : l.x1 - 5.5, dz, l.face === 'W' ? -Math.PI / 2 : Math.PI / 2);
      }
    }
    if (rnd() < 0.75) {
      const tx = alongX ? (rnd() < 0.5 ? l.x0 + 2.5 : l.x1 - 2.5) : cx + (rnd() - 0.5) * 4;
      const tz = alongX ? cz + (rnd() - 0.5) * 4 : (rnd() < 0.5 ? l.z0 + 2.5 : l.z1 - 2.5);
      addTree(tx, tz, 0.9 + rnd() * 0.4);
    }
  }

  // ---------- blocks ----------
  for (const b of map.blocks) {
    if (upgradedBlock?.block === b) continue;
    const inner = { x0: b.x0 + SW, x1: b.x1 - SW, z0: b.z0 + SW, z1: b.z1 - SW };
    if (b.type === 'downtown') {
      sidewalkRing(b, 'walk');
      const nx = 2, nz = 2 + (rnd() < 0.5 ? 1 : 0);
      const gw = (inner.x1 - inner.x0) / nx, gd = (inner.z1 - inner.z0) / nz;
      for (let a = 0; a < nx; a++) for (let c = 0; c < nz; c++) {
        if (rnd() < 0.14) { // pocket plaza
          const px = inner.x0 + a * gw, pz = inner.z0 + c * gd;
          walk.rectUV(px + 1, pz + 1, px + gw - 1, pz + gd - 1, 0.22, PLAZA, 5);
          addTree(px + gw / 2, pz + gd / 2, 1.1);
          bench(px + gw / 2 - 4, pz + gd / 2, 0); bench(px + gw / 2 + 4, pz + gd / 2, Math.PI);
          continue;
        }
        tower(inner.x0 + a * gw + 1.2, inner.z0 + c * gd + 1.2, inner.x0 + (a + 1) * gw - 1.2, inner.z0 + (c + 1) * gd - 1.2);
      }
      for (let x = b.x0 + 10; x < b.x1 - 8; x += 22) { addTree(x, b.z0 + 1.6, 0.7); addTree(x, b.z1 - 1.6, 0.7); }
      for (let x = b.x0 + 21; x < b.x1 - 8; x += 22) { bin(x, b.z0 + 1.2); bench(x + 3, b.z1 - 1.2, Math.PI); }
    } else if (b.type === 'shops') {
      sidewalkRing(b, 'lot');
      for (const l of frontageLots(inner, 15, 10, 16)) shop(l);
      // parked cars in the shared lot behind the shops
      for (let k = 0; k < 6; k++) parkCar(inner.x0 + 20 + (k % 3) * 6, inner.z0 + 28 + Math.floor(k / 3) * 12, k % 2 ? 0 : Math.PI);
      streetTrees(b, 20);
    } else if (b.type === 'homes') {
      sidewalkRing(b, 'grass');
      for (const l of frontageLots(inner, 22, 16, 21)) house(l);
      streetTrees(b, 15);
      for (let k = 0; k < 5; k++) addTree(inner.x0 + 26 + rnd() * (inner.x1 - inner.x0 - 52), inner.z0 + 26 + rnd() * (inner.z1 - inner.z0 - 52), 1 + rnd() * 0.5, rnd() < 0.3 ? 1 : 0);
    } else if (b.type === 'school') {
      sidewalkRing(b, 'grass');
      const sx = inner.x0 + 6, sz = inner.z0 + 8;
      fac.brick.box(sx + 30, 0.16, sz + 12, 60, 8, 20, 0xb5523b, { top: 0x6e6a66, tileU: 3.6, tileV: 4, ao: 0.25 });
      fac.brick.box(sx + 10, 0.16, sz + 40, 20, 8, 36, 0xb5523b, { top: 0x6e6a66, tileU: 3.6, tileV: 4, ao: 0.25 });
      parapet(sx + 30, 8.16, sz + 12, 60, 20, 0x8e3f2d);
      solid.box(sx + 30, 8.16, sz + 12, 14, 2.6, 6, 0xe9e1cf);
      solid.box(sx + 30, 0.16, sz + 1.2, 10, 3.4, 1.5, 0xe9e1cf); // entrance
      flat.rect(sx + 26, sz - 4.5, sx + 34, sz + 1, 0.2, 0xd8cfbd);
      const fx0 = inner.x0 + 82, fx1 = inner.x1 - 8, fz0 = inner.z0 + 10, fz1 = inner.z1 - 10;
      flat.rect(fx0 - 3, fz0 - 3, fx1 + 3, fz1 + 3, 0.18, 0xc0623f);
      flat.rect(fx0, fz0, fx1, fz1, 0.2, 0x5fa64a);
      flat.rect((fx0 + fx1) / 2 - 0.1, fz0, (fx0 + fx1) / 2 + 0.1, fz1, 0.22, PAINT_W);
      for (const fx of [fx0 + 1, fx1 - 1]) { solid.box(fx, 0.2, (fz0 + fz1) / 2 - 3.6, 0.12, 2.4, 0.12, 0xffffff); solid.box(fx, 0.2, (fz0 + fz1) / 2 + 3.6, 0.12, 2.4, 0.12, 0xffffff); solid.box(fx, 2.5, (fz0 + fz1) / 2, 0.12, 0.12, 7.3, 0xffffff); }
      solid.cyl(sx + 64, 0.16, sz + 2, 0.12, 10, 0xdddddd, 6);
      solid.box(sx + 64.9, 8.6, sz + 2, 1.6, 1, 0.05, 0x2f6fa3);
      for (let k = 0; k < 3; k++) solid.box(sx - 2 + k * 4, 0.16, sz + 60, 2.6, 2.9, 10, 0xf2c230); // school buses
      const signTex = B.signTexture('banner', ['PATHWAY SCHOOL', 'Home of the Navigators', '#1f3b5c', '#ffffff']);
      const sign = new T.Mesh(new T.PlaneGeometry(8, 2), B.M({ map: signTex }));
      sign.position.set(sx + 30, 6.2, sz + 1.9); sign.rotation.y = Math.PI; scene.add(sign);
      streetTrees(b, 18);
    } else if (b.type === 'plaza') {
      sidewalkRing(b, 'plaza');
      const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
      flat.rect(cx - 30, cz - 2, cx + 30, cz + 2, 0.22, 0xd6c7ab);
      flat.rect(cx - 2, cz - 30, cx + 2, cz + 30, 0.22, 0xd6c7ab);
      for (const [dx, dz] of [[-17, -17], [17, -17], [-17, 17], [17, 17]]) { yard.rectUV(cx + dx - 9, cz + dz - 9, cx + dx + 9, cz + dz + 9, 0.23, 0xffffff, 6); addTree(cx + dx, cz + dz, 1.3); }
      solid.cyl(cx, 0.2, cz, 7, 0.9, 0xbfb6a3, 24);
      const water = new T.Mesh(new T.CircleGeometry(6.3, 28), B.M({ color: 0x3f8fc8 }, { roughness: 0.04, metalness: 0.05 }));
      water.rotation.x = -Math.PI / 2; water.position.set(cx, 1.0, cz); scene.add(water);
      solid.cyl(cx, 0.2, cz, 0.8, 3.6, 0xd8d0bf, 10);
      solid.cyl(cx, 3.8, cz, 2.2, 0.4, 0xd8d0bf, 16);
      for (const [dx, dz, rot] of [[-10, -4, 0], [10, 4, Math.PI], [-4, 10, Math.PI / 2], [4, -10, -Math.PI / 2]]) bench(cx + dx, cz + dz, rot);
      const signTex = B.signTexture('banner', ['PATHWAY PLAZA', 'Learn the rules · Earn the road', '#2a9d8f', '#ffffff']);
      const sign = new T.Mesh(new T.BoxGeometry(7, 1.8, 0.3), B.M({ map: signTex }));
      sign.position.set(cx, 1.6, b.z1 - 5); scene.add(sign);
    } else if (b.type === 'park') {
      sidewalkRing(b, 'grass');
      const cx = (inner.x0 + inner.x1) / 2, cz = (inner.z0 + inner.z1) / 2;
      const shore = new T.Mesh(new T.CircleGeometry(1, 40), B.M({ color: 0xd9c9a3 }));
      shore.scale.set(40, 24, 1); shore.rotation.x = -Math.PI / 2; shore.position.set(cx + 10, 0.18, cz); scene.add(shore);
      const pond = new T.Mesh(new T.CircleGeometry(1, 40), B.M({ color: 0x3a7fb8 }, { roughness: 0.04, metalness: 0.05 }));
      pond.scale.set(38, 22, 1); pond.rotation.x = -Math.PI / 2; pond.position.set(cx + 10, 0.2, cz); scene.add(pond);
      flat.rect(inner.x0, cz + 27, inner.x1, cz + 30, 0.19, 0xd9c9a3);
      flat.rect(cx - 48, inner.z0, cx - 45, inner.z1, 0.19, 0xd9c9a3);
      // playground
      solid.box(cx - 62, 0.16, cz - 10, 3, 2.6, 3, 0xe63946); solid.gable(cx - 62, 2.76, cz - 10, 3.4, 3.4, 1.2, true, 0x1d3557);
      solid.rbox(cx - 58.5, 1.3, cz - 10, 4.5, 0.15, 1, 0.5, 0xffb703);
      for (let k = 0; k < 50; k++) {
        const x = inner.x0 + 4 + rnd() * (inner.x1 - inner.x0 - 8), z = inner.z0 + 4 + rnd() * (inner.z1 - inner.z0 - 8);
        if (((x - cx - 10) / 44) ** 2 + ((z - cz) / 28) ** 2 < 1) continue;
        if (Math.abs(x - cx + 62) < 8 && Math.abs(z - cz + 10) < 8) continue;
        addTree(x, z, 0.9 + rnd() * 0.8, rnd() < 0.3 ? 1 : 0);
      }
      for (const dx of [-30, -10, 10, 30]) bench(cx + dx, cz + 31.6, Math.PI);
      streetTrees(b, 16);
    } else if (b.type === 'office') {
      const L = map.lot;
      const o = { topUV: 3.5 };
      walk.box((b.x0 + CUT + L.x0) / 2, 0, (b.z0 + b.z1) / 2, L.x0 - b.x0 - CUT, 0.2, b.z1 - b.z0, WALK, o);
      walk.box((L.x1 + b.x1 - CUT) / 2, 0, (b.z0 + b.z1) / 2, b.x1 - L.x1 - CUT, 0.2, b.z1 - b.z0, WALK, o);
      walk.box(b.x0 + CUT / 2, 0, (b.z0 + b.z1) / 2, CUT, 0.2, b.z1 - b.z0 - CUT * 2, WALK, o);
      walk.box(b.x1 - CUT / 2, 0, (b.z0 + b.z1) / 2, CUT, 0.2, b.z1 - b.z0 - CUT * 2, WALK, o);
      walk.box((L.x0 + L.x1) / 2, 0, (L.z1 + b.z1) / 2, L.x1 - L.x0, 0.2, b.z1 - L.z1, WALK, o);
      yard.rectUV(L.x1 + 3, b.z0 + SW, b.x1 - SW, b.z1 - SW, 0.21, 0xffffff, 6);
      yard.rectUV(b.x0 + SW, b.z0 + SW, L.x0 - 3, b.z1 - SW, 0.21, 0xffffff, 6);
      const ox = (L.x0 + L.x1) / 2, oz = L.z1 + 15;
      fac.brick.box(ox, 0.2, oz, 46, 9, 22, 0xf1ead9, { top: 0x8c8473, tileU: 3.8, tileV: 4.5, ao: 0.25 });
      solid.box(ox, 9.2, oz, 47, 1.2, 23, 0x2f6fa3);
      solid.box(ox, 0.2, L.z1 + 3.2, 12, 4, 1, 0x2f6fa3);
      solid.box(ox, 4.2, L.z1 + 2.8, 14, 0.4, 3.4, 0xe9e2d0);
      for (const dx of [-6.4, 6.4]) solid.cyl(ox + dx, 0.2, L.z1 + 1.4, 0.25, 4, 0xe9e2d0, 8);
      const signTex = B.signTexture('banner', ['PERMIT OFFICE', 'AI Permit & License Center', '#ffffff', '#1f3b5c']);
      const sign = new T.Mesh(new T.PlaneGeometry(14, 3.5), B.M({ map: signTex }));
      sign.position.set(ox, 6.6, oz - 11.06); sign.rotation.y = Math.PI; scene.add(sign);
      solid.cyl(L.x1 + 6, 0.2, L.z0 + 4, 0.12, 11, 0xdddddd, 6);
      solid.box(L.x1 + 7, 9.6, L.z0 + 4, 2, 1.2, 0.05, 0xb22234);
      // a few cars already parked at the office (leave the spawn stall and the drop-off circle clear)
      for (const k of [5, 6]) { const px = L.x0 + 6.5 + k * 5, pz = L.z1 - 4.6; parkCar(px, pz, Math.PI); map.obstacles.push({ x0: px - 1.1, x1: px + 1.1, z0: pz - 2.5, z1: pz + 2.5 }); }
      for (let x = b.x0 + 8; x < L.x0 - 2; x += 12) addTree(x, b.z0 + 1.6, 0.8);
      for (let x = L.x1 + 6; x < b.x1 - 4; x += 12) addTree(x, b.z0 + 1.6, 0.8);
      for (let z = b.z0 + 14; z < b.z1 - 4; z += 14) { addTree(b.x0 + 1.6, z, 0.8); addTree(b.x1 - 1.6, z, 0.8); }
    }
    // a hydrant near one corner of every block
    hydrant(b.x0 + CUT + 1.2, b.z0 + 1.2);
  }

  // ---------- streetlights along avenues ----------
  for (const s of map.segments) {
    if (s.type !== 'avenue') continue;
    const a = map.nodes[s.a], b = map.nodes[s.b];
    const along = s.axis === 'x';
    const p0 = (along ? a.x : a.z) + 14, p1 = (along ? b.x : b.z) - 14;
    for (let q = p0; q <= p1; q += 25) {
      for (const side of [-1, 1]) {
        const off = side * (s.width / 2 + 0.9);
        const x = along ? q : a.x + off, z = along ? a.z + off : q;
        solid.cyl(x, 0.2, z, 0.12, 7, 0x3d4148, 6);
        const ax = along ? 0 : -side * 1.2, az = along ? -side * 1.2 : 0;
        solid.box(x + ax / 2, 7, z + az / 2, along ? 0.15 : 1.4, 0.15, along ? 1.4 : 0.15, 0x3d4148);
        bulbs.box(x + ax, 6.8, z + az, 0.6, 0.25, 0.6, 0xfff4cf);
      }
    }
  }

  // ---------- edge of town: hedges, countryside, overlook, lake ----------
  const ext = { x0: map.colX(0) - map.colW(0) / 2, x1: map.colX(map.N - 1) + map.colW(map.N - 1) / 2,
    z0: map.rowZ(0) - map.rowW(0) / 2, z1: map.rowZ(map.N - 1) + map.rowW(map.N - 1) / 2 };
  const HEDGE = 0x4f8a3c;
  solid.box((ext.x0 + ext.x1) / 2, 0, ext.z0 - 1.5, ext.x1 - ext.x0 + 6, 1.1, 1.6, HEDGE);
  solid.box((ext.x0 + ext.x1) / 2, 0, ext.z1 + 1.5, ext.x1 - ext.x0 + 6, 1.1, 1.6, HEDGE);
  solid.box(ext.x0 - 1.5, 0, (ext.z0 + ext.z1) / 2, 1.6, 1.1, ext.z1 - ext.z0, HEDGE);
  const ov = map.overlook;
  solid.box(ext.x1 + 1.5, 0, (ext.z0 + ov.z0) / 2, 1.6, 1.1, ov.z0 - ext.z0, HEDGE);
  solid.box(ext.x1 + 1.5, 0, (ov.z1 + ext.z1) / 2, 1.6, 1.1, ext.z1 - ov.z1, HEDGE);

  // overlook pad railing + sign
  for (let z = ov.z0; z <= ov.z1; z += 2.5) solid.box(ov.x1 + 0.4, 0, z, 0.2, 1.1, 0.2, 0x8b5a2b);
  solid.box(ov.x1 + 0.4, 0.9, (ov.z0 + ov.z1) / 2, 0.15, 0.15, ov.z1 - ov.z0, 0x8b5a2b);
  for (let x = ov.x0 + 1; x <= ov.x1; x += 2.5) { solid.box(x, 0, ov.z0 - 0.4, 0.2, 1.1, 0.2, 0x8b5a2b); solid.box(x, 0, ov.z1 + 0.4, 0.2, 1.1, 0.2, 0x8b5a2b); }
  solid.box((ov.x0 + ov.x1) / 2, 0.9, ov.z0 - 0.4, ov.x1 - ov.x0, 0.15, 0.15, 0x8b5a2b);
  solid.box((ov.x0 + ov.x1) / 2, 0.9, ov.z1 + 0.4, ov.x1 - ov.x0, 0.15, 0.15, 0x8b5a2b);
  {
    const tex = B.signTexture('overlook');
    const mat = B.M({ map: tex });
    // one sign for each direction of Ridge Rd, placed before the pull-off
    for (const [z, rot] of [[ov.z1 + 16, 0], [ov.z0 - 16, Math.PI]]) {
      const sgn = new T.Mesh(new T.PlaneGeometry(2.4, 2.4), mat);
      sgn.position.set(ext.x1 + 3, 3, z); sgn.rotation.y = rot; scene.add(sgn);
      solid.cyl(ext.x1 + 3, 0, z - Math.cos(rot) * 0.05, 0.07, 1.9, 0x777777, 6);
    }
  }

  // lake beyond the overlook
  {
    const lake = new T.Mesh(new T.CircleGeometry(1, 48), B.M({ color: 0x2f74b0 }, { roughness: 0.04, metalness: 0.05 }));
    lake.scale.set(220, 260, 1); lake.rotation.x = -Math.PI / 2; lake.position.set(ext.x1 + 260, 0.08, 20); scene.add(lake);
    const beach = new T.Mesh(new T.CircleGeometry(1, 48), B.M({ color: 0xe6d3a3 }));
    beach.scale.set(230, 270, 1); beach.rotation.x = -Math.PI / 2; beach.position.set(ext.x1 + 260, 0.05, 20); scene.add(beach);
  }
  // countryside trees
  for (let k = 0; k < 260; k++) {
    const a = rnd() * Math.PI * 2, r = 280 + rnd() * 260;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x > ext.x1 + 20 && x < ext.x1 + 500 && Math.abs(z - 20) < 290) continue; // keep the lake view open
    if (Math.abs(x) < ext.x1 + 8 && Math.abs(z) < ext.z1 + 8) continue;
    addTree(x, z, 1.2 + rnd() * 1.2, rnd() < 0.45 ? 1 : 0, 0);
  }
  // rolling hills and far mountains
  const hillMat = B.M({ color: 0x7aa95e, flatShading: true });
  const farMat = B.M({ color: 0x8fa9b8, flatShading: true });
  for (let k = 0; !upgradedBlock?.ridge && k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + rnd() * 0.2, r = 620 + rnd() * 120;
    const h = new T.Mesh(new T.SphereGeometry(1, 10, 6), hillMat);
    h.scale.set(130 + rnd() * 80, 40 + rnd() * 40, 110 + rnd() * 60);
    h.position.set(Math.cos(a) * r, -8, Math.sin(a) * r); scene.add(h);
  }
  for (let k = 0; !upgradedBlock?.ridge && k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.3, r = 1000 + rnd() * 120;
    const m = new T.Mesh(new T.ConeGeometry(150 + rnd() * 80, 160 + rnd() * 120, 6), farMat);
    m.position.set(Math.cos(a) * r, 60, Math.sin(a) * r); scene.add(m);
  }

  const foliage = RT.Foliage.mount(RT.ASSETS?.foliage, scene, trees, quality);

  // ---------- traffic signals ----------
  const lampHeads = [];
  const levelColors = ['red', 'yellow', 'green'];
  const rim = new T.RingGeometry(0.94, 1.16, 24);
  const lampMatrix = new T.Matrix4();
  const lampPosition = new T.Vector3(), lampScale = new T.Vector3(), up = new T.Vector3(0, 1, 0);

  function addSignalHead(node, travel, x, y, z, scale) {
    const { x: dx, z: dz } = U.DIRS[travel];
    const yaw = Math.atan2(-dx, -dz);
    const rotation = new T.Quaternion().setFromAxisAngle(up, yaw);
    const height = 1.72 * scale, radius = 0.254 * scale, step = 0.55 * scale;
    // The matte face and yellow surround make the head readable against sky and trees.
    solid.rbox(x + dx * 0.18, y, z + dz * 0.18, 1.02 * scale, height + 0.22 * scale, 0.05, yaw, 0xdcae50);
    solid.rbox(x + dx * 0.14, y, z + dz * 0.14, 0.91 * scale, height + 0.11 * scale, 0.07, yaw, 0x222831);
    solid.rbox(x, y, z, 0.67 * scale, height, 0.43, yaw, 0x262c32);
    const head = { node: node.id, axis: U.axisOf(travel), x, y, z, dx, dz, radius, step, rotation, state: null };
    for (let k = 0; k < levelColors.length; k++) {
      setLampMatrix(head, k, radius, 0.232);
      solid.addGeometry(rim, lampMatrix, 0x0e1319);
    }
    lampHeads.push(head);
  }

  function setLampMatrix(head, level, radius, depth) {
    lampPosition.set(head.x - head.dx * depth, head.y + (1 - level) * head.step, head.z - head.dz * depth);
    lampScale.set(radius, radius, 1);
    lampMatrix.compose(lampPosition, head.rotation, lampScale);
  }

  for (const n of map.nodes) {
    if (n.kind !== 'signal') continue;
    for (const from of ['N', 'E', 'S', 'W']) {
      if (n.exits[from] === null) continue;
      const travel = U.OPPOSITE[from];
      const d = U.DIRS[travel], r = U.rightOf(d);
      const ha = map.halfAlong(n, travel), hs = map.halfSide(n, travel);
      const approachW = map.segments[n.exits[from]].width;
      const px = n.x + d.x * (ha + 1.2) + r.x * (hs + map.CORNER + 0.9), pz = n.z + d.z * (ha + 1.2) + r.z * (hs + map.CORNER + 0.9);
      const hx = n.x + d.x * (ha + 1.2) + r.x * (approachW / 4), hz = n.z + d.z * (ha + 1.2) + r.z * (approachW / 4);
      solid.cyl(px, 0.2, pz, 0.16, 6.2, 0x3a3f46, 8);
      const armLen = Math.hypot(px - hx, pz - hz);
      solid.box((px + hx) / 2, 5.9, (pz + hz) / 2, Math.abs(r.x) * armLen + 0.16, 0.16, Math.abs(r.z) * armLen + 0.16, 0x3a3f46);
      addSignalHead(n, travel, hx, 5.45, hz, 1);
      // a second, lower head on the near-right pole helps drivers see the light when stopped close
      const nx = n.x - d.x * (ha + map.CROSSWALK + 1.2) + r.x * (approachW / 2 + 1.4), nz = n.z - d.z * (ha + map.CROSSWALK + 1.2) + r.z * (approachW / 2 + 1.4);
      solid.cyl(nx, 0.2, nz, 0.12, 3.2, 0x3a3f46, 8);
      addSignalHead(n, travel, nx, 3.15, nz, 0.86);
    }
  }
  rim.dispose();
  function signalTexture(stops) {
    const [canvas, ctx] = B.canvas(64, 64);
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    for (const [at, color] of stops) gradient.addColorStop(at, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return B.toTexture(canvas);
  }
  const lensMap = signalTexture([[0, '#ffffff'], [0.76, '#fcfcfc'], [1, '#b9b9b9']]);
  const haloMap = signalTexture([
    [0, 'rgba(255,255,255,0.42)'], [0.35, 'rgba(255,255,255,0.19)'],
    [0.63, 'rgba(255,255,255,0.056)'], [1, 'rgba(255,255,255,0)']
  ]);
  const lenses = new T.InstancedMesh(new T.CircleGeometry(1, 24),
    new T.MeshBasicMaterial({ map: lensMap, toneMapped: false }), lampHeads.length * 3);
  const halos = new T.InstancedMesh(new T.PlaneGeometry(2, 2), new T.MeshBasicMaterial({
    map: haloMap, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false
  }), lampHeads.length);
  lenses.name = 'traffic_signal_lenses';
  halos.name = 'traffic_signal_halos';
  halos.frustumCulled = false;
  halos.instanceMatrix.setUsage(T.DynamicDrawUsage);
  const signalColors = [0xff311c, 0xffcd28, 0x20ff61].map(c => new T.Color(c));
  const litColors = signalColors.map(c => c.clone().multiplyScalar(quality.bloom ? 2.6 : 1));
  const darkColors = [0x2a1614, 0x2b2414, 0x142717].map(c => new T.Color(c));
  lampHeads.forEach((head, i) => {
    levelColors.forEach((_, k) => {
      setLampMatrix(head, k, head.radius, 0.246);
      lenses.setMatrixAt(i * 3 + k, lampMatrix);
      lenses.setColorAt(i * 3 + k, darkColors[k]);
    });
    halos.setColorAt(i, signalColors[0]);
  });
  lenses.instanceColor.setUsage(T.DynamicDrawUsage);
  halos.instanceColor.setUsage(T.DynamicDrawUsage);
  scene.add(lenses, halos);

  function updateLamps(lightFor) {
    let dirty = false;
    lampHeads.forEach((head, i) => {
      const level = levelColors.indexOf(lightFor(head.node, head.axis));
      if (head.state === level) return;
      head.state = level;
      for (let k = 0; k < levelColors.length; k++) {
        lenses.setColorAt(i * 3 + k, k === level ? litColors[k] : darkColors[k]);
      }
      setLampMatrix(head, level, head.radius * 2.9, 0.264);
      halos.setMatrixAt(i, lampMatrix);
      halos.setColorAt(i, signalColors[level]);
      dirty = true;
    });
    if (dirty) {
      lenses.instanceColor.needsUpdate = true;
      halos.instanceMatrix.needsUpdate = halos.instanceColor.needsUpdate = true;
    }
  }

  // ---------- stop signs + speed limit signs (instanced faces) ----------
  const stopSpots = [], speedSpots = {}, plaqueSpots = [];
  for (const n of map.nodes) {
    if (n.kind !== 'stop') continue;
    for (const from of ['N', 'E', 'S', 'W']) {
      if (n.exits[from] === null) continue;
      const travel = U.OPPOSITE[from];
      if (!map.stopsFor(n, U.axisOf(travel))) continue;
      const d = U.DIRS[travel], r = U.rightOf(d);
      const w = map.segments[n.exits[from]].width;
      const back = map.halfAlong(n, travel) + map.CROSSWALK + 0.8;
      const x = n.x - d.x * back + r.x * (w / 2 + 1.3), z = n.z - d.z * back + r.z * (w / 2 + 1.3);
      solid.cyl(x, 0.2, z, 0.06, 2.4, 0x8a8f96, 6);
      stopSpots.push({ x, z, rot: Math.atan2(-d.x, -d.z) });
      if (!n.allWay) plaqueSpots.push({ x, z, rot: Math.atan2(-d.x, -d.z) });
    }
  }
  for (const s of map.segments) {
    for (const dirSign of [1, -1]) {
      const startNode = map.nodes[dirSign > 0 ? s.a : s.b];
      const travel = s.axis === 'x' ? (dirSign > 0 ? 'E' : 'W') : (dirSign > 0 ? 'S' : 'N');
      const d = U.DIRS[travel], r = U.rightOf(d);
      const off = map.halfAlong(startNode, travel) + 16;
      const x = startNode.x + d.x * off + r.x * (s.width / 2 + 1.3), z = startNode.z + d.z * off + r.z * (s.width / 2 + 1.3);
      solid.cyl(x, 0.2, z, 0.06, 2.6, 0x8a8f96, 6);
      (speedSpots[s.limit] = speedSpots[s.limit] || []).push({ x, z, rot: Math.atan2(-d.x, -d.z) });
    }
  }
  function instancedSigns(spots, tex, w, h, y, backColor) {
    const front = new T.InstancedMesh(new T.PlaneGeometry(w, h), B.M({ map: tex, transparent: true, alphaTest: 0.5 }), spots.length);
    const back = new T.InstancedMesh(new T.PlaneGeometry(w * 0.92, h * 0.92), B.M({ color: backColor }), spots.length);
    const m = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0), one = new T.Vector3(1, 1, 1);
    spots.forEach((s, k) => {
      q.setFromAxisAngle(up, s.rot);
      m.compose(new T.Vector3(s.x, y, s.z), q, one); front.setMatrixAt(k, m);
      q.setFromAxisAngle(up, s.rot + Math.PI);
      m.compose(new T.Vector3(s.x - Math.sin(s.rot) * 0.03, y, s.z - Math.cos(s.rot) * 0.03), q, one); back.setMatrixAt(k, m);
    });
    scene.add(front); scene.add(back);
  }
  instancedSigns(stopSpots, B.signTexture('stop'), 1.0, 1.0, 2.35, 0x9aa0a6);
  if (plaqueSpots.length) instancedSigns(plaqueSpots, B.signTexture('plaque'), 1.0, 0.4, 1.6, 0x9aa0a6);
  for (const lim of Object.keys(speedSpots)) instancedSigns(speedSpots[lim], B.signTexture('speed', String(lim)), 0.75, 0.95, 2.4, 0x9aa0a6);

  // ---------- finalize batches ----------
  const mk = (batch, mat, cast, recv) => { const mesh = batch.build(mat); mesh.castShadow = cast && quality.shadows; mesh.receiveShadow = recv; scene.add(mesh); return mesh; };
  mk(road, B.M({ ...(maple ? materials('asphalt') : { map: B.asphaltTexture() }), vertexColors: true }, { roughness: 0.92 }), false, true);
  const painted = { vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 };
  mk(flat, B.M(painted, { roughness: 0.8 }), false, true);
  if (maple) mk(paint, B.M({ ...painted, map: maple.textures.paint }, { roughness: 0.8 }), false, true);
  mk(walk, B.M({ ...(maple ? materials('concrete') : { map: B.concreteTexture() }), vertexColors: true }, { roughness: 0.88 }), false, true);
  mk(yard, B.M({ map: grassMap || B.grassTexture(), vertexColors: true }, { roughness: 1 }), false, true);
  mk(solid, B.M({ vertexColors: true }, { roughness: 0.75 }), true, true);
  if (parked.pos.length) mk(parked, B.M({ vertexColors: true }, { roughness: 0.38, metalness: 0.25 }), true, false);
  // facades: glass towers are shiny and reflect the sky; every window can glow warm at sunset
  const duskMats = [];
  const looks = { glass: { roughness: 0.16, metalness: 0.45 }, brick: { roughness: 0.82 }, siding: { roughness: 0.78 }, store: { roughness: 0.45, metalness: 0.1 } };
  for (const style of Object.keys(fac)) {
    if (!fac[style].pos.length) continue;
    const f = RT.useModels && RT.ASSETS.facades[style];
    const params = f
      ? { map: f.map, normalMap: f.normal, aoMap: f.ao, aoMapIntensity: 0.9, vertexColors: true, emissive: 0xffbf6b, emissiveMap: f.mask, emissiveIntensity: 0 }
      : { map: B.facade(style), vertexColors: true, emissive: 0xffbf6b, emissiveMap: B.facadeMask(style), emissiveIntensity: 0 };
    const mat = B.M(params, looks[style]);
    duskMats.push(mat);
    mk(fac[style], mat, true, true);
  }
  // Blender houses and parked cars (instanced)
  const parkedModels = [];
  if (RT.useModels) {
    const m4 = new T.Matrix4(), q4 = new T.Quaternion(), up4 = new T.Vector3(0, 1, 0), p4 = new T.Vector3(), one = new T.Vector3(1, 1, 1);
    for (const variant of ['house_a', 'house_b', 'house_c']) {
      const list = houseList.filter((h) => h.variant === variant);
      if (!list.length) continue;
      const kit = RT.Kit.instanced(scene, RT.Kit.mergeAtOrigin(RT.Kit.find(RT.ASSETS.town, variant)), list.length, { tint: { Wall: true, Roof: true }, shadows: quality.shadows, shadowMaterials: ['Wall', 'Roof'], receive: true, looks: { Window: { roughness: 0.06, metalness: 0.5 }, Roof: { roughness: 0.85 }, Wall: { roughness: 0.8 } } });
      list.forEach((h, k) => { q4.setFromAxisAngle(up4, h.rot); m4.compose(p4.set(h.x, 0.16, h.z), q4, one); kit.setMatrix(k, m4); kit.setColor(k, 'Wall', h.wall); kit.setColor(k, 'Roof', h.roof); });
      kit.commit();
      const win = kit.material('Window');
      if (win) { win.emissive = new T.Color(0xffbf6b); win.emissiveIntensity = 0; duskMats.push(win); }
    }
    for (const type of new Set(parkedList.map((p) => p.type))) {
      const list = parkedList.filter((p) => p.type === type);
      const mesh = RT.Kit.find(RT.ASSETS.vehicles, 'car_' + type);
      const glass = { roughness: 0.12, metalness: 0.35 };
      const kit = RT.Kit.instanced(scene, RT.Vehicles.trafficParts(mesh), list.length, {
        tint: { Paint: true }, shadows: quality.traffic >= 16, shadowMaterials: ['Paint', 'Rubber'],
        dynamic: true, looks: { Paint: { roughness: 0.32, metalness: 0.25 }, Glass: glass, HeroGlass: glass }
      });
      const proxy = RT.Vehicles.mergedMesh(type, 0xffffff).mesh;
      const far = new T.InstancedMesh(proxy.geometry, proxy.material, list.length);
      far.frustumCulled = false;
      far.instanceMatrix.setUsage(T.DynamicDrawUsage);
      scene.add(far);
      const spots = list.map((p) => ({ ...p, matrix: new T.Matrix4().makeRotationY(p.rotY).setPosition(p.x, 0.17, p.z), tint: new T.Color(p.color) }));
      parkedModels.push({ spots, kit, far });
    }
  }
  // streetlight bulbs switch on at dusk
  const bulbMat = B.M({ color: 0xfff4cf, emissive: 0xffe2a8, emissiveIntensity: 0 });
  if (bulbs.pos.length) mk(bulbs, bulbMat, false, false);
  function setDusk(f) {
    for (const m of duskMats) m.emissiveIntensity = f * 0.75;
    bulbMat.emissiveIntensity = f * 3.5;
    upgradedBlock?.setDusk(f);
    foliage.setDusk(f);
  }
  const lastArt = new T.Vector3(Infinity, Infinity, Infinity);
  function updateArt(pos) {
    upgradedBlock?.update(pos);
    foliage.update(pos);
    if (lastArt.distanceToSquared(pos) < 36) return;
    lastArt.copy(pos);
    const nearLimit = quality.traffic >= 16 ? 88 : 58;
    for (const { spots, kit, far } of parkedModels) {
      let n = 0, f = 0;
      for (const p of spots) {
        const distance = Math.hypot(pos.x - p.x, pos.z - p.z);
        if (distance < nearLimit) {
          kit.setMatrix(n, p.matrix);
          kit.setColor(n++, 'Paint', p.color);
        } else if (distance < 245) {
          far.setMatrixAt(f, p.matrix);
          far.setColorAt(f++, p.tint);
        }
      }
      kit.setCount(n);
      if (n) kit.commit();
      far.count = f;
      far.visible = f > 0;
      if (f) { far.instanceMatrix.needsUpdate = true; far.instanceColor.needsUpdate = true; }
    }
  }

  // ---------- goal markers ----------
  function beacon(color, radius) {
    const g = new T.Group();
    const ring = new T.Mesh(new T.RingGeometry(radius - 0.5, radius, 40), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: T.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.12; g.add(ring);
    const col = new T.Mesh(new T.CylinderGeometry(radius * 0.92, radius * 0.92, 26, 32, 1, true),
      new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, side: T.DoubleSide, depthWrite: false }));
    col.position.y = 13; g.add(col);
    g.userData.ring = ring; g.userData.col = col;
    scene.add(g);
    return g;
  }
  const finishBeacon = beacon(0xffc233, map.finishSpot.r);
  finishBeacon.position.set(map.finishSpot.x, 0, map.finishSpot.z);
  finishBeacon.visible = false;
  const overlookBeacon = beacon(0x37c3c3, 5);
  overlookBeacon.position.set(map.overlookSpot.x, 0, map.overlookSpot.z);
  overlookBeacon.userData.col.material.opacity = 0.1;

  return { scene, sun, hemi, updateLamps, finishBeacon, overlookBeacon, beacon, setDusk, updateArt, upgradedBlock, foliage };
};
