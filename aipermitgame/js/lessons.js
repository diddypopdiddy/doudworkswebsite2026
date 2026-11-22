/* Practice hours: each hour is a short drive to a destination, guided by chevrons painted
 * on the road and turn-by-turn directions that use the real street names. */
RT.createLessons = function (scene, map, world) {
  const T = THREE, U = RT.U;
  const N = map.N;

  // ---------- destinations ----------
  const lane = (seg, travel, x, z) => ({ seg, travel, x, z });
  const segBetween = (i0, j0, i1, j1) => {
    const a = map.nodeAt(i0, j0), b = map.nodeAt(i1, j1);
    return map.segments.find((s) => (s.a === a.id && s.b === b.id) || (s.a === b.id && s.b === a.id));
  };
  const DESTS = {
    school: { name: 'Pathway School', icon: '🏫', r: 6 }, // placed just below
    downtown: { name: 'Downtown on Hopper St', icon: '🏙️', r: 6, ...lane(segBetween(2, 1, 2, 2), 'S', map.colX(2) - map.colW(2) / 4, (map.rowZ(1) + map.rowZ(2)) / 2) },
    plaza: { name: 'Pathway Plaza', icon: '⛲', r: 6, ...lane(segBetween(2, 3, 3, 3), 'W', 0, map.rowZ(3) - map.rowW(3) / 4) },
    overlook: { name: 'Lakeview Overlook', icon: '🔭', r: 11, offroad: [map.nodeAt(N - 1, 2), map.nodeAt(N - 1, 3)], x: map.overlookSpot.x, z: map.overlookSpot.z },
    park: { name: 'Pond Park', icon: '🌳', r: 6, ...lane(segBetween(3, 4, 4, 4), 'E', map.colX(3) + 40, map.rowZ(4) + map.rowW(4) / 4) },
    office: { name: 'the Permit Office', icon: '🏢', r: map.finishSpot.r, offroad: [map.nodeAt(1, 3), map.nodeAt(2, 3)], x: map.finishSpot.x, z: map.finishSpot.z, gate: { x: map.finishSpot.x, z: map.lot.z0 - 1 } }
  };
  // School spot: Summit St eastbound, in front of the school building.
  {
    const s = segBetween(2, 0, 3, 0) || segBetween(1, 0, 2, 0);
    DESTS.school.seg = s; DESTS.school.travel = 'E';
    DESTS.school.x = map.colX(2) + 38; DESTS.school.z = map.rowZ(0) + map.rowW(0) / 4;
    if (DESTS.school.x > map.nodes[s.b].x - 12) DESTS.school.x = map.nodes[s.b].x - 14;
  }

  const LESSONS = [
    { title: 'Hour 1 · Neighborhood streets', dest: 'school', intro: 'Hour 1: quiet streets. Drive to Pathway School. Make full stops at every stop sign.' },
    { title: 'Hour 2 · Downtown traffic', dest: 'downtown', intro: 'Hour 2: downtown. Avenues have traffic lights. Stop on red and wait for green.' },
    { title: 'Hour 3 · The plaza', dest: 'plaza', intro: 'Hour 3: head to Pathway Plaza. Watch your speed. Side streets are 25 mph.' },
    { title: 'Hour 4 · Lakeside drive', dest: 'overlook', intro: 'Hour 4: drive out to the lake and pull into the overlook. Enjoy the view!' },
    { title: 'Hour 5 · Park loop', dest: 'park', intro: 'Hour 5: take McCarthy Ave to Pond Park. Signal your turns with Q and E.' },
    { title: 'Hour 6 · Back to base', dest: 'office', intro: 'Hour 6: bring it home to the Permit Office lot.' }
  ];
  const EXTRA = ['plaza', 'school', 'park', 'downtown', 'overlook'];

  // ---------- route search ----------
  function neighbours(n) {
    const out = [];
    for (const k of ['N', 'E', 'S', 'W']) {
      const si = n.exits[k];
      if (si === null) continue;
      const s = map.segments[si];
      out.push({ node: map.nodes[s.a === n.id ? s.b : s.a], dir: k, seg: s });
    }
    return out;
  }
  // Shortest path between nodes. `cameFrom` avoids an immediate U-turn at the start.
  function path(fromId, toIds, cameFrom, banned) {
    const dist = new Map([[fromId, 0]]), prev = new Map(), open = new Set([fromId]);
    let found = null;
    while (open.size) {
      let cur = null, cd = Infinity;
      for (const id of open) if (dist.get(id) < cd) { cd = dist.get(id); cur = id; }
      open.delete(cur);
      if (toIds.includes(cur)) { found = cur; break; }
      for (const nb of neighbours(map.nodes[cur])) {
        if (cur === fromId && nb.node.id === cameFrom) continue;
        if (banned && banned.has(cur + '>' + nb.node.id)) continue;
        const nd = cd + map.SP;
        if (nd < (dist.has(nb.node.id) ? dist.get(nb.node.id) : Infinity)) { dist.set(nb.node.id, nd); prev.set(nb.node.id, cur); open.add(nb.node.id); }
      }
    }
    if (found === null) return null;
    const p = [found];
    while (p[0] !== fromId) p.unshift(prev.get(p[0]));
    return p.map((id) => map.nodes[id]);
  }
  const dirBetween = (a, b) => (b.x > a.x + 1 ? 'E' : b.x < a.x - 1 ? 'W' : b.z > a.z ? 'S' : 'N');
  const turnOf = (inDir, outDir) => {
    if (inDir === outDir) return 'straight';
    if (outDir === U.OPPOSITE[inDir]) return 'uturn';
    const r = U.rightOf(U.DIRS[inDir]), o = U.DIRS[outDir];
    return r.x === o.x && r.z === o.z ? 'right' : 'left';
  };

  // ---------- chevrons on the road ----------
  const MAXC = 34;
  const shape = new T.Shape();
  shape.moveTo(-0.9, -0.5); shape.lineTo(0, 0.45); shape.lineTo(0.9, -0.5); shape.lineTo(0.9, -0.05); shape.lineTo(0, 0.9); shape.lineTo(-0.9, -0.05); shape.closePath();
  const chevG = new T.ShapeGeometry(shape); chevG.rotateX(-Math.PI / 2); // points toward -z, i.e. "forward" after rotation below
  chevG.rotateY(Math.PI);
  chevG.scale(1.35, 1, 1.5);
  const chevMat = new T.MeshBasicMaterial({ color: 0x3ee8ff, transparent: true, opacity: 0.92, depthWrite: false, fog: false });
  const chev = new T.InstancedMesh(chevG, chevMat, MAXC);
  // These instances follow the car. The empty title-screen bounds never describe the route.
  chev.frustumCulled = false;
  chev.renderOrder = 2;
  chev.count = 0;
  scene.add(chev);

  const destBeacon = world.beacon(0x34e2ff, 6);
  destBeacon.visible = false;

  let dest = null, polyline = [], polyLen = [], route = null, flow = 0, recalc = 0;
  let last = { text: '', icon: '↑', dist: 0 };

  function setDestination(id) {
    dest = id ? DESTS[id] : null;
    destBeacon.visible = !!dest && id !== 'office';
    if (dest) {
      destBeacon.position.set(dest.x, 0, dest.z);
      destBeacon.scale.setScalar(dest.r / 6);
    }
    recalc = 0;
    if (!dest) { polyline = []; polyLen = []; route = null; chev.count = 0; }
  }

  function lanePt(a, b, atA) {
    const k = dirBetween(a, b), d = U.DIRS[k], r = U.rightOf(d);
    const s = map.segments[a.exits[k]];
    const off = s ? s.width / 4 : 2.25;
    const n = atA ? a : b, h = map.halfAlong(n, k) * (atA ? 1 : -1);
    return { x: n.x + d.x * h + r.x * off, z: n.z + d.z * h + r.z * off };
  }

  // When parked in the lot or at the overlook, first drive out onto the street.
  let exitInfo = null;
  function planExit(s) {
    const loc = map.locate(s.x, s.z);
    let A, Bn, exit, exitDir;
    if (loc.lot) { A = map.nodeAt(1, 3); Bn = map.nodeAt(2, 3); exit = { x: U.clamp(s.x, map.lot.x0 + 3, map.lot.x1 - 3), z: map.lot.z0 + 1 }; exitDir = 'N'; }
    else if (loc.overlook) { A = map.nodeAt(N - 1, 2); Bn = map.nodeAt(N - 1, 3); exit = { x: map.overlook.x0 + 1, z: U.clamp(s.z, map.overlook.z0 + 3, map.overlook.z1 - 3) }; exitDir = 'W'; }
    else return null;
    const seg = map.segments.find((q) => (q.a === A.id && q.b === Bn.id) || (q.a === Bn.id && q.b === A.id));
    const options = [[A, Bn], [Bn, A]].map(([T, other]) => {
      const travel = dirBetween(other, T);
      return { T, other, travel, seg, cost: Math.hypot(T.x - exit.x, T.z - exit.z) };
    });
    return { options, exit, exitDir, seg };
  }

  function build(car, ap) {
    const s = car.state;
    route = null; polyline = []; exitInfo = null;
    if (!dest) return;
    const pts = [{ x: s.x, z: s.z }];
    if (!ap) {
      const ex = planExit(s);
      if (ex) {
        // pick the direction whose route is shorter, then pretend we are already on the street
        let best = null;
        for (const o of ex.options) {
          const tg = dest.offroad ? dest.offroad.map((n) => n.id) : null;
          const p = tg ? path(o.T.id, tg, o.other.id) : null;
          const c = o.cost + (p ? p.length * map.SP : 0) + (dest.offroad && dest.offroad.includes(o.T) && dest.offroad.includes(o.other) ? 0 : 0);
          const p2 = !tg ? path(o.T.id, [map.nodes[dest.seg.a].id, map.nodes[dest.seg.b].id], o.other.id) : null;
          const cc = c + (p2 ? p2.length * map.SP : 0);
          if (!best || cc < best.cc) best = { ...o, cc };
        }
        const d = U.DIRS[best.travel], r = U.rightOf(d), off = best.seg.width / 4;
        const c = map.nodes[best.seg.a];
        pts.push(ex.exit);
        pts.push(best.seg.axis === 'x' ? { x: ex.exit.x + d.x * 6, z: c.z + r.z * off } : { x: c.x + r.x * off, z: ex.exit.z + d.z * 6 });
        ap = { node: best.T, travel: best.travel, seg: best.seg };
        exitInfo = { exitDir: ex.exitDir, travel: best.travel, name: best.seg.name, exit: ex.exit };
      }
    }
    let nodes = null;
    const onDestSeg = dest.seg && ap && ap.seg === dest.seg && ap.travel === dest.travel;
    const before = onDestSeg && ((dest.x - s.x) * U.DIRS[dest.travel].x + (dest.z - s.z) * U.DIRS[dest.travel].z) > -2;
    // already on the street with an off-road destination (lot / overlook) and its entrance is ahead?
    let direct = false;
    if (dest.offroad && ap) {
      const ids = dest.offroad.map((n) => n.id);
      const gate = dest.gate || { x: map.overlook.x0 - 1, z: (map.overlook.z0 + map.overlook.z1) / 2 };
      const d = U.DIRS[ap.travel];
      const loc = map.locate(s.x, s.z);
      const inside = (dest === DESTS.office && loc.lot) || (dest === DESTS.overlook && loc.overlook);
      if (inside) direct = true;
      else if (ids.includes(ap.seg.a) && ids.includes(ap.seg.b) && ((gate.x - s.x) * d.x + (gate.z - s.z) * d.z) > -4) {
        direct = true;
        const r = U.rightOf(d), off = ap.seg.width / 4;
        const c = map.nodes[ap.seg.a];
        const along = ap.seg.axis === 'x' ? gate.x : gate.z;
        if (((gate.x - s.x) * d.x + (gate.z - s.z) * d.z) > 6) pts.push(ap.seg.axis === 'x' ? { x: along - d.x * 4, z: c.z + r.z * off } : { x: c.x + r.x * off, z: along - d.z * 4 });
        pts.push(gate);
      }
    }
    if (!before && !direct) {
      const start = ap ? ap.node : nearestNode(s.x, s.z);
      const cameFrom = ap ? (ap.seg.a === ap.node.id ? ap.seg.b : ap.seg.a) : null;
      let targets, wrongWayFrom;
      const banned = new Set();
      if (dest.offroad) {
        targets = dest.offroad.map((n) => n.id);
        const [A, Bn] = dest.offroad;
        banned.add(A.id + '>' + Bn.id); banned.add(Bn.id + '>' + A.id); // arriving along the entrance street means we passed it
        wrongWayFrom = dest.offroad.find((n) => n.id === start.id) ? dest.offroad.find((n) => n.id !== start.id).id : null;
      } else {
        const segNodes = [map.nodes[dest.seg.a], map.nodes[dest.seg.b]];
        const entry = segNodes.find((n) => dirBetween(n, segNodes[0] === n ? segNodes[1] : segNodes[0]) === dest.travel);
        targets = [entry.id];
        wrongWayFrom = segNodes.find((n) => n !== entry).id;
        banned.add(wrongWayFrom + '>' + entry.id); // must enter the street heading the right way
      }
      const startOk = cameFrom === null || cameFrom !== wrongWayFrom;
      nodes = routeNodes(start, targets, cameFrom, startOk, banned) || [start];
      if (ap) { // finish the street we are on, in our own lane
        const d = U.DIRS[ap.travel], r = U.rightOf(d), off = ap.seg.width / 4, h = map.halfAlong(start, ap.travel);
        pts.push({ x: start.x - d.x * h + r.x * off, z: start.z - d.z * h + r.z * off, tag: 'in' });
      }
      for (let k = 0; k < nodes.length - 1; k++) {
        pts.push({ ...lanePt(nodes[k], nodes[k + 1], true), tag: 'out' });
        pts.push({ ...lanePt(nodes[k], nodes[k + 1], false), tag: 'in' });
      }
      const last = nodes[nodes.length - 1];
      if (!dest.offroad) {
        const k = dest.travel, d = U.DIRS[k], r = U.rightOf(d), off = dest.seg.width / 4, h = map.halfAlong(last, k);
        pts.push({ x: last.x + d.x * h + r.x * off, z: last.z + d.z * h + r.z * off, tag: 'out' });
      } else {
        // drive along the street toward the entrance, then turn in
        const gate = dest.gate || { x: map.overlook.x0 - 1, z: (map.overlook.z0 + map.overlook.z1) / 2 };
        const other = dest.offroad.find((n) => n !== last);
        const k = dirBetween(last, other), d = U.DIRS[k], r = U.rightOf(d);
        const s2 = map.segments[last.exits[k]], off = s2.width / 4;
        const along = (gate.x - last.x) * d.x + (gate.z - last.z) * d.z;
        pts.push({ x: last.x + d.x * map.halfAlong(last, k) + r.x * off, z: last.z + d.z * map.halfAlong(last, k) + r.z * off, tag: 'out' });
        pts.push({ x: last.x + d.x * along + r.x * off, z: last.z + d.z * along + r.z * off });
        pts.push(gate);
      }
    }
    pts.push({ x: dest.x, z: dest.z });
    polyline = smoothTurns(pts);
    polyLen = [0];
    for (let k = 1; k < polyline.length; k++) {
      const a = polyline[k - 1], b = polyline[k];
      polyLen.push(polyLen[k - 1] + Math.hypot(b.x - a.x, b.z - a.z));
    }
    route = nodes;
  }

  // Like path(), but if we are already at a target facing the wrong way, go around the block.
  function routeNodes(start, targets, cameFrom, startOk, banned) {
    if (startOk || !targets.includes(start.id)) return path(start.id, targets, cameFrom, banned);
    let best = null;
    for (const nb of neighbours(start)) {
      if (nb.node.id === cameFrom) continue;
      const p = path(nb.node.id, targets, start.id, banned);
      if (p && (!best || p.length + 1 < best.length)) best = [start].concat(p);
    }
    return best;
  }

  // Replace each sharp corner through an intersection with a gentle curve.
  function smoothTurns(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      out.push(p);
      const q = pts[i + 1];
      if (p.tag !== 'in' || !q || q.tag !== 'out' || i === 0 || !pts[i + 2]) continue;
      const a = pts[i - 1], c = pts[i + 2];
      const d1x = p.x - a.x, d1z = p.z - a.z, d2x = c.x - q.x, d2z = c.z - q.z;
      const l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1;
      const cross = (d1x / l1) * (d2z / l2) - (d1z / l1) * (d2x / l2);
      if (Math.abs(cross) < 0.3) continue; // straight through
      // control point where the two lane lines meet
      const t = ((q.x - p.x) * (d2z / l2) - (q.z - p.z) * (d2x / l2)) / cross;
      const cx = p.x + (d1x / l1) * t, cz = p.z + (d1z / l1) * t;
      for (let k = 1; k < 6; k++) {
        const s = k / 6, u = 1 - s;
        out.push({ x: u * u * p.x + 2 * u * s * cx + s * s * q.x, z: u * u * p.z + 2 * u * s * cz + s * s * q.z });
      }
    }
    return out;
  }

  function nearestNode(x, z) {
    let best = null, bd = Infinity;
    for (const n of map.nodes) { if (!n.degree) continue; const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; best = n; } }
    return best;
  }

  function instruction(car, ap) {
    const s = car.state;
    const total = polyLen.length ? polyLen[polyLen.length - 1] : 0;
    if (exitInfo) {
      const t = turnOf(exitInfo.exitDir, exitInfo.travel);
      return { icon: t === 'left' ? '↰' : '↱', text: 'Pull out and turn ' + t + ' onto ' + exitInfo.name, dist: Math.hypot(exitInfo.exit.x - s.x, exitInfo.exit.z - s.z) };
    }
    if (!route && dest.offroad && ap) {
      const d = U.DIRS[ap.travel], r = U.rightOf(d), side = (dest.x - s.x) * r.x + (dest.z - s.z) * r.z;
      return { icon: side > 0 ? '↱' : '↰', text: 'Pull into ' + (dest === DESTS.office ? 'the Permit Office lot' : 'the overlook') + ' on your ' + (side > 0 ? 'right' : 'left'), dist: total };
    }
    if (!route || !ap) return { icon: '📍', text: 'Head to ' + dest.name, dist: total };
    // walk the route looking for the first real turn
    let inDir = ap.travel, d = Math.hypot(route[0].x - s.x, route[0].z - s.z);
    for (let k = 0; k < route.length; k++) {
      const n = route[k];
      let outDir, name;
      if (k < route.length - 1) { outDir = dirBetween(n, route[k + 1]); name = map.segments[n.exits[outDir]].name; }
      else if (!dest.offroad) { outDir = dest.travel; name = dest.seg.name; }
      else { const other = dest.offroad.find((o) => o !== n); outDir = dirBetween(n, other); name = map.segments[n.exits[outDir]].name; }
      const t = turnOf(inDir, outDir);
      if (t === 'left') return { icon: '↰', text: 'Turn left onto ' + name, dist: d };
      if (t === 'right') return { icon: '↱', text: 'Turn right onto ' + name, dist: d };
      if (t === 'uturn') return { icon: '↶', text: 'Turn around when it is safe', dist: d };
      inDir = outDir; d += map.SP;
    }
    if (dest.offroad) return { icon: '↱', text: 'Pull into ' + (dest === DESTS.office ? 'the Permit Office lot' : 'the overlook'), dist: Math.hypot(dest.x - s.x, dest.z - s.z) };
    return { icon: '↑', text: 'Continue to ' + dest.name, dist: Math.hypot(dest.x - s.x, dest.z - s.z) };
  }

  const m4 = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0), one = new T.Vector3(1, 1, 1), p3 = new T.Vector3();
  function drawChevrons(dt, car) {
    chev.count = 0;
    if (!polyline.length) return;
    flow = (flow + dt * 7) % 5;
    // start from the point of the polyline closest to the car
    const s = car.state;
    let bestD = Infinity, startAlong = 0;
    for (let k = 0; k < polyline.length - 1; k++) {
      const a = polyline[k], b = polyline[k + 1];
      const L = polyLen[k + 1] - polyLen[k]; if (L < 0.01) continue;
      let t = ((s.x - a.x) * (b.x - a.x) + (s.z - a.z) * (b.z - a.z)) / (L * L); t = U.clamp(t, 0, 1);
      const px = a.x + (b.x - a.x) * t, pz = a.z + (b.z - a.z) * t;
      const dd = Math.hypot(px - s.x, pz - s.z);
      if (dd < bestD) { bestD = dd; startAlong = polyLen[k] + t * L; }
    }
    const total = polyLen[polyLen.length - 1];
    let n = 0, seg = 0;
    for (let along = startAlong + 4 + flow; along < Math.min(total - 1, startAlong + 160) && n < MAXC; along += 5) {
      while (seg < polyLen.length - 2 && polyLen[seg + 1] < along) seg++;
      const a = polyline[seg], b = polyline[seg + 1];
      const L = polyLen[seg + 1] - polyLen[seg]; if (L < 0.01) continue;
      const t = (along - polyLen[seg]) / L;
      p3.set(a.x + (b.x - a.x) * t, 0.1, a.z + (b.z - a.z) * t);
      q.setFromAxisAngle(up, Math.atan2(b.x - a.x, b.z - a.z));
      const fade = Math.min(1, (along - startAlong - 3) / 6);
      m4.compose(p3, q, one.set(fade, 1, fade)); one.set(1, 1, 1);
      chev.setMatrixAt(n++, m4);
    }
    chev.count = n;
    chev.instanceMatrix.needsUpdate = true;
    chevMat.opacity = 0.8 + Math.sin(performance.now() / 300) * 0.12;
  }

  /** Call every frame while driving. Returns guidance and whether the destination is reached. */
  function update(dt, car, ap) {
    if (!dest) { chev.count = 0; return null; }
    recalc -= dt;
    if (recalc <= 0) { recalc = 0.5; build(car, ap); last = instruction(car, ap); }
    drawChevrons(dt, car);
    destBeacon.userData.ring.rotation.z += dt;
    const s = car.state;
    const arrived = Math.hypot(s.x - dest.x, s.z - dest.z) < dest.r && Math.abs(s.v) < 1.2;
    return { ...last, arrived, destName: dest.name, icon2: dest.icon };
  }

  function hide() { chev.count = 0; destBeacon.visible = false; }

  return { DESTS, LESSONS, EXTRA, setDestination, update, hide, get polyline() { return polyline; }, get dest() { return dest; } };
};
