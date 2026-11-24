/* The town layout: a road graph (intersections + street segments), the drivable area,
 * and the city blocks that buildings sit on. Pure data, no rendering. */
RT.buildMap = function () {
  const U = RT.U;
  const settings = window.ROAD_TEST_SETTINGS;
  const N = 6;            // intersections per side
  const SP = 90;          // metres between intersections
  const O = -((N - 1) * SP) / 2;
  const AVE_W = 12, ST_W = 9;
  const CROSSWALK = 3.5;  // painted crosswalk depth between the box and the stop line

  const aveCols = [1, 4], aveRows = [1, 4];
  const isAveCol = (i) => aveCols.includes(i);
  const isAveRow = (j) => aveRows.includes(j);
  const colX = (i) => O + i * SP;
  const rowZ = (j) => O + j * SP;
  const colW = (i) => (isAveCol(i) ? AVE_W : ST_W);
  const rowW = (j) => (isAveRow(j) ? AVE_W : ST_W);

  // Streets named after people and moments in AI history. The instructor mentions
  // each namesake the first time you drive on it.
  const colNames = ['Cedar St', 'Turing Ave', 'Hopper St', 'Babbage St', 'Lovelace Ave', 'Ridge Rd'];
  const rowNames = ['Summit St', 'Dartmouth Ave', 'Elm St', 'Maple St', 'McCarthy Ave', 'Lakeview Rd'];
  const namesakes = {
    'Turing Ave': 'Turing Ave is named for Alan Turing, who asked "Can machines think?" in 1950.',
    'Hopper St': 'Hopper St honors Grace Hopper, who built one of the first compilers so people could program computers with words.',
    'Babbage St': 'Babbage St is named for Charles Babbage, who designed mechanical computers in the 1800s.',
    'Lovelace Ave': 'Lovelace Ave honors Ada Lovelace. In 1843 she published what is often called the first computer program.',
    'Dartmouth Ave': 'Dartmouth Ave remembers the 1956 Dartmouth workshop, where AI became a field of study.',
    'McCarthy Ave': 'McCarthy Ave is named for John McCarthy, who coined the term "artificial intelligence" in 1955.'
  };

  // Segments removed to make bigger blocks (school campus and the park).
  const removed = new Set(['v:3:0', 'v:4:4']);

  const nodes = [];
  const nodeAt = (i, j) => nodes[j * N + i];
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      nodes.push({
        id: j * N + i, i, j, x: colX(i), z: rowZ(j),
        exits: { N: null, E: null, S: null, W: null },
        halfX: colW(i) / 2, halfZ: rowW(j) / 2,
        kind: 'none'
      });
    }
  }

  const segments = [];
  function addSeg(id, a, b, axis, width, name, type) {
    const seg = { id, index: segments.length, a: a.id, b: b.id, axis, width, name, type,
      limit: settings.speedLimits[type] };
    segments.push(seg);
    if (axis === 'x') { a.exits.E = seg.index; b.exits.W = seg.index; }
    else { a.exits.S = seg.index; b.exits.N = seg.index; }
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N - 1; i++) {
    const id = 'h:' + i + ':' + j;
    if (!removed.has(id)) addSeg(id, nodeAt(i, j), nodeAt(i + 1, j), 'x', rowW(j), rowNames[j], isAveRow(j) ? 'avenue' : 'street');
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < N - 1; j++) {
    const id = 'v:' + i + ':' + j;
    if (!removed.has(id)) addSeg(id, nodeAt(i, j), nodeAt(i, j + 1), 'z', colW(i), colNames[i], isAveCol(i) ? 'avenue' : 'street');
  }

  // Intersection control: avenues get traffic lights, quiet streets get stop signs.
  for (const n of nodes) {
    const exits = Object.keys(n.exits).filter((k) => n.exits[k] !== null);
    n.degree = exits.length;
    // (compare with null: street number 0 is a real street)
    if (n.exits.N === null && n.exits.S === null) n.halfX = 0;
    if (n.exits.E === null && n.exits.W === null) n.halfZ = 0;
    if (n.degree >= 3) n.kind = (isAveCol(n.i) || isAveRow(n.j)) ? 'signal' : 'stop';
  }
  // Which travel axes must stop at a stop-sign intersection. Side streets meeting the
  // ring road get a two-way stop (the ring keeps moving); two quiet interior corners
  // are two-way as well, the rest are all-way stops.
  const twoWayInterior = { [2 + 2 * N]: ['ns'], [3 + 2 * N]: ['ew'] };
  for (const n of nodes) {
    if (n.kind !== 'stop') continue;
    if (n.i === 0 || n.i === N - 1) n.stopAxes = ['ew'];
    else if (n.j === 0 || n.j === N - 1) n.stopAxes = ['ns'];
    else n.stopAxes = twoWayInterior[n.id] || ['ns', 'ew'];
    n.allWay = n.stopAxes.length === 2;
  }
  const stopsFor = (n, axis) => n.kind === 'stop' && n.stopAxes.includes(axis);

  // Box extents of an intersection along a travel direction / to its side.
  const halfAlong = (n, dirKey) => (dirKey === 'N' || dirKey === 'S' ? n.halfZ : n.halfX);
  const halfSide = (n, dirKey) => (dirKey === 'N' || dirKey === 'S' ? n.halfX : n.halfZ);

  // ---- Blocks (the land between streets) ----
  const blockTypes = [
    ['homes', 'homes', 'school', 'school', 'homes'],
    ['homes', 'downtown', 'downtown', 'downtown', 'shops'],
    ['shops', 'downtown', 'plaza', 'downtown', 'shops'],
    ['homes', 'office', 'downtown', 'shops', 'homes'],
    ['homes', 'homes', 'homes', 'park', 'park']
  ];
  const merged = [{ bi0: 2, bj0: 0, bi1: 3, bj1: 0 }, { bi0: 3, bj0: 4, bi1: 4, bj1: 4 }];
  const blocks = [];
  const taken = new Set();
  function blockRect(bi0, bj0, bi1, bj1) {
    return {
      x0: colX(bi0) + colW(bi0) / 2, x1: colX(bi1 + 1) - colW(bi1 + 1) / 2,
      z0: rowZ(bj0) + rowW(bj0) / 2, z1: rowZ(bj1 + 1) - rowW(bj1 + 1) / 2
    };
  }
  for (const m of merged) {
    for (let bi = m.bi0; bi <= m.bi1; bi++) for (let bj = m.bj0; bj <= m.bj1; bj++) taken.add(bi + ':' + bj);
    blocks.push({ type: blockTypes[m.bj0][m.bi0], bi: m.bi0, bj: m.bj0, ...blockRect(m.bi0, m.bj0, m.bi1, m.bj1) });
  }
  for (let bj = 0; bj < N - 1; bj++) for (let bi = 0; bi < N - 1; bi++) {
    if (taken.has(bi + ':' + bj)) continue;
    blocks.push({ type: blockTypes[bj][bi], bi, bj, ...blockRect(bi, bj, bi, bj) });
  }

  // ---- Drivable area: union of axis-aligned rectangles ----
  const drive = [];
  for (const s of segments) {
    const a = nodes[s.a], b = nodes[s.b];
    if (s.axis === 'x') drive.push({ x0: a.x, x1: b.x, z0: a.z - s.width / 2, z1: a.z + s.width / 2 });
    else drive.push({ x0: a.x - s.width / 2, x1: a.x + s.width / 2, z0: a.z, z1: b.z });
  }
  for (const n of nodes) {
    if (n.degree > 0) drive.push({ x0: n.x - Math.max(n.halfX, 0.01), x1: n.x + Math.max(n.halfX, 0.01), z0: n.z - Math.max(n.halfZ, 0.01), z1: n.z + Math.max(n.halfZ, 0.01) });
  }

  // Cut-back corners at every block so right turns have room to swing.
  const CORNER = 3.5;
  for (const b of blocks) {
    drive.push({ x0: b.x0 - 0.01, x1: b.x0 + CORNER, z0: b.z0 - 0.01, z1: b.z0 + CORNER });
    drive.push({ x0: b.x1 - CORNER, x1: b.x1 + 0.01, z0: b.z0 - 0.01, z1: b.z0 + CORNER });
    drive.push({ x0: b.x0 - 0.01, x1: b.x0 + CORNER, z0: b.z1 - CORNER, z1: b.z1 + 0.01 });
    drive.push({ x0: b.x1 - CORNER, x1: b.x1 + 0.01, z0: b.z1 - CORNER, z1: b.z1 + 0.01 });
  }

  // Permit Office parking lot, cut into the north edge of its block (faces Maple St).
  const office = blocks.find((b) => b.type === 'office');
  const lot = { x0: office.x0 + 16, x1: office.x0 + 58, z0: office.z0 - 0.5, z1: office.z0 + 22 };
  drive.push(lot);
  const finishSpot = { x: (lot.x0 + lot.x1) / 2, z: lot.z0 + 13, r: 6 };
  const spawn = { x: lot.x0 + 9, z: lot.z0 + 14, heading: Math.PI }; // nose pointing north toward Maple St

  // Scenic overlook pad on the east side of Ridge Rd, looking out over the lake.
  const ridge = nodeAt(N - 1, 2);
  const overlook = { x0: ridge.x + colW(N - 1) / 2 - 0.5, x1: ridge.x + colW(N - 1) / 2 + 24, z0: ridge.z + 22, z1: ridge.z + 68 };
  drive.push(overlook);
  const overlookSpot = { x: (overlook.x0 + overlook.x1) / 2 + 3, z: (overlook.z0 + overlook.z1) / 2, r: 12 };

  function inRect(r, x, z, pad = 0) {
    return x >= r.x0 - pad && x <= r.x1 + pad && z >= r.z0 - pad && z <= r.z1 + pad;
  }
  const obstacles = []; // parked cars etc. inside drivable areas
  function isDrivable(x, z) {
    for (let k = 0; k < obstacles.length; k++) if (inRect(obstacles[k], x, z)) return false;
    for (let k = 0; k < drive.length; k++) if (inRect(drive[k], x, z)) return true;
    return false;
  }

  // Which intersection box or street segment a point is in.
  function locate(x, z) {
    for (const n of nodes) {
      if (n.degree >= 3 && Math.abs(x - n.x) <= n.halfX && Math.abs(z - n.z) <= n.halfZ) return { node: n };
    }
    for (const s of segments) {
      const a = nodes[s.a], b = nodes[s.b];
      if (s.axis === 'x') {
        if (x >= a.x && x <= b.x && Math.abs(z - a.z) <= s.width / 2) return { seg: s };
      } else if (z >= a.z && z <= b.z && Math.abs(x - a.x) <= s.width / 2) return { seg: s };
    }
    if (inRect(lot, x, z)) return { lot: true };
    if (inRect(overlook, x, z)) return { overlook: true };
    return {};
  }

  // Direction key for travelling along a segment toward one of its ends.
  function dirToward(seg, nodeId) {
    if (seg.axis === 'x') return nodeId === seg.b ? 'E' : 'W';
    return nodeId === seg.b ? 'S' : 'N';
  }

  // Stop line for a car approaching node n while travelling in direction dirKey.
  function stopLine(n, dirKey) {
    const d = U.DIRS[dirKey];
    const back = halfAlong(n, dirKey) + CROSSWALK;
    return { x: n.x - d.x * back, z: n.z - d.z * back };
  }

  // Shortest route over the road graph (Dijkstra) from a point to a target node.
  function routeTo(fromX, fromZ, targetNodeId) {
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      if (!n.degree) continue;
      const d = Math.hypot(n.x - fromX, n.z - fromZ);
      if (d < bestD) { bestD = d; best = n; }
    }
    const dist = new Map([[best.id, 0]]), prev = new Map();
    const open = new Set([best.id]);
    while (open.size) {
      let cur = null, cd = Infinity;
      for (const id of open) if (dist.get(id) < cd) { cd = dist.get(id); cur = id; }
      open.delete(cur);
      if (cur === targetNodeId) break;
      const n = nodes[cur];
      for (const k of ['N', 'E', 'S', 'W']) {
        const si = n.exits[k];
        if (si === null) continue;
        const s = segments[si];
        const other = s.a === cur ? s.b : s.a;
        const nd = cd + SP;
        if (nd < (dist.has(other) ? dist.get(other) : Infinity)) { dist.set(other, nd); prev.set(other, cur); open.add(other); }
      }
    }
    const path = [targetNodeId];
    while (path[0] !== best.id && prev.has(path[0])) path.unshift(prev.get(path[0]));
    return path.map((id) => nodes[id]);
  }

  const officeNode = nodeAt(1, 3);
  const extent = { x0: O - 40, x1: O + (N - 1) * SP + 40, z0: O - 40, z1: O + (N - 1) * SP + 40 };

  return {
    N, SP, O, AVE_W, ST_W, CROSSWALK, CORNER, nodes, segments, blocks, drive, lot, finishSpot, spawn,
    overlook, overlookSpot, office, officeNode, extent, namesakes, obstacles,
    nodeAt, colX, rowZ, colW, rowW, stopsFor, halfAlong, halfSide, isDrivable, locate, dirToward, stopLine, routeTo, inRect
  };
};
