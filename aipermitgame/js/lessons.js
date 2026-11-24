/* Practice hours: each hour is a short drive to a destination, guided by chevrons painted
 * on the road and turn-by-turn directions that use the real street names.
 *
 * The guidance keeps one plan (a list of streets to take) and sticks to it while the car is
 * on it. The moment the car is on a street the plan does not include, in either direction,
 * a new plan is made from where the car really is. So wandering off always gets a fresh
 * route, and the directions do not flip around while the driver is following them. */
RT.createLessons = function (scene, map, world) {
  const T = THREE, U = RT.U;
  const N = map.N;
  const DIRK = ['N', 'E', 'S', 'W'];
  const TURN_COST = 22;   // metres a turn is "worth", so routes with fewer turns win ties
  const CROSS_COST = 14;  // extra for a turn across the oncoming lane into or out of a lot
  const SPACING = 6;      // metres between chevrons

  const segBetween = (i0, j0, i1, j1) => {
    const a = map.nodeAt(i0, j0), b = map.nodeAt(i1, j1);
    return map.segments.find((s) => (s.a === a.id && s.b === b.id) || (s.a === b.id && s.b === a.id));
  };
  const otherEnd = (seg, id) => (seg.a === id ? seg.b : seg.a);
  const coord = (seg, p) => (seg.axis === 'x' ? p.x : p.z);           // position along a street
  const sign = (travel) => (travel === 'E' || travel === 'S' ? 1 : -1);
  const onSeg = (seg, at) => { const a = map.nodes[seg.a]; return seg.axis === 'x' ? { x: at, z: a.z } : { x: a.x, z: at }; };
  const laneOffset = (seg, travel) => { const r = U.rightOf(U.DIRS[travel]); return { x: r.x * seg.width / 4, z: r.z * seg.width / 4 }; };
  const dirBetween = (a, b) => (b.x > a.x + 1 ? 'E' : b.x < a.x - 1 ? 'W' : b.z > a.z ? 'S' : 'N');
  const turnOf = (inDir, outDir) => {
    if (inDir === outDir) return 'straight';
    if (outDir === U.OPPOSITE[inDir]) return 'uturn';
    const r = U.rightOf(U.DIRS[inDir]), o = U.DIRS[outDir];
    return r.x === o.x && r.z === o.z ? 'right' : 'left';
  };

  // ---------- destinations ----------
  // A street stop is a ring across the whole street: drive into it from either direction.
  function streetDest(name, icon, seg, at) {
    const c = onSeg(seg, at);
    return { name, icon, seg, at, x: c.x, z: c.z, r: seg.width / 2 + 2.5 };
  }
  // A parking stop sits off the street, behind a gate: pull in and stop.
  function parkDest(name, icon, seg, gate, spot, r, label) {
    return { name, icon, seg, at: coord(seg, gate), gate, x: spot.x, z: spot.z, r, park: true, label };
  }
  const schoolSeg = segBetween(2, 0, 3, 0) || segBetween(1, 0, 2, 0);
  const DESTS = {
    school: streetDest('Pathway School', '🏫', schoolSeg, Math.min(map.colX(2) + 38, map.nodes[schoolSeg.b].x - 14)),
    downtown: streetDest('Downtown on Hopper St', '🏙️', segBetween(2, 1, 2, 2), (map.rowZ(1) + map.rowZ(2)) / 2),
    plaza: streetDest('Pathway Plaza', '⛲', segBetween(2, 3, 3, 3), 0),
    overlook: parkDest('Lakeview Overlook', '🔭', segBetween(N - 1, 2, N - 1, 3),
      { x: map.overlook.x0 - 1, z: (map.overlook.z0 + map.overlook.z1) / 2 }, map.overlookSpot, 11, 'the overlook'),
    park: streetDest('Pond Park', '🌳', segBetween(3, 4, 4, 4), map.colX(3) + 40),
    office: parkDest('the Permit Office', '🏢', segBetween(1, 3, 2, 3),
      { x: map.finishSpot.x, z: map.lot.z0 - 1 }, map.finishSpot, map.finishSpot.r, 'the Permit Office lot')
  };
  // Off-street areas the car can be parked in, and how to get back onto the street.
  const PLACES = {
    lot: { dest: DESTS.office, exitDir: 'N', exitPt: (s) => ({ x: U.clamp(s.x, map.lot.x0 + 3, map.lot.x1 - 3), z: map.lot.z0 + 1 }) },
    overlook: { dest: DESTS.overlook, exitDir: 'W', exitPt: (s) => ({ x: map.overlook.x0 + 1, z: U.clamp(s.z, map.overlook.z0 + 3, map.overlook.z1 - 3) }) }
  };

  const LESSONS = [
    { title: 'Hour 1 · Neighborhood streets', dest: 'school', intro: 'Hour 1: quiet streets. Drive to Pathway School. Make full stops at every stop sign.' },
    { title: 'Hour 2 · Downtown traffic', dest: 'downtown', intro: 'Hour 2: downtown. Avenues have traffic lights. Stop on red and wait for green.' },
    { title: 'Hour 3 · The plaza', dest: 'plaza', intro: 'Hour 3: head to Pathway Plaza. Watch your speed. Side streets are 25 mph.' },
    { title: 'Hour 4 · Lakeside drive', dest: 'overlook', intro: 'Hour 4: drive out to the lake and pull into the overlook. Enjoy the view!' },
    { title: 'Hour 5 · Park loop', dest: 'park', intro: 'Hour 5: take McCarthy Ave to Pond Park. Signal your turns with Q and E.' },
    { title: 'Hour 6 · Back to base', dest: 'office', intro: 'Hour 6: bring it home to the Permit Office lot.' }
  ];
  const EXTRA = ['plaza', 'school', 'park', 'downtown', 'overlook'];

  let dest = null, plan = null, polyline = [], polyLen = [], flow = 0, recalc = 0;
  let last = { text: '', icon: '↑', dist: 0 };

  // ---------- where is the car? ----------
  // Worked out from the car's own position and heading every time, so it is never stale.
  function situation(s, f) {
    const loc = map.locate(s.x, s.z);
    if (loc.node) return { kind: 'box', node: loc.node };
    if (loc.seg) {
      const seg = loc.seg, dot = seg.axis === 'x' ? f.x : f.z, fwd = dot >= 0;
      return { kind: 'seg', seg, dot, travel: seg.axis === 'x' ? (fwd ? 'E' : 'W') : (fwd ? 'S' : 'N'),
        node: map.nodes[fwd ? seg.b : seg.a], from: map.nodes[fwd ? seg.a : seg.b] };
    }
    if (loc.lot) return { kind: 'lot' };
    if (loc.overlook) return { kind: 'overlook' };
    return { kind: 'none' };
  }
  function nearestNode(x, z) {
    let best = null, bd = Infinity;
    for (const n of map.nodes) { if (!n.degree) continue; const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; best = n; } }
    return best;
  }
  // How far ahead the destination is for a car travelling `travel` along the destination street.
  const ahead = (travel, p) => (dest.at - coord(dest.seg, p)) * sign(travel);
  const reachable = (travel, p) => ahead(travel, p) > -(dest.park ? 4 : dest.r - 1);
  function gateSide(travel) {
    const r = U.rightOf(U.DIRS[travel]), c = onSeg(dest.seg, dest.at);
    return (dest.x - c.x) * r.x + (dest.z - c.z) * r.z > 0 ? 'right' : 'left';
  }

  // ---------- route search ----------
  // Shortest drive to the destination street. A state is (intersection, direction the car
  // arrives in), so the search never asks for a U-turn and can count turns.
  function search(starts) {
    const key = (id, dir) => id * 4 + DIRK.indexOf(dir);
    const dist = new Map(), prev = new Map(), open = [];
    for (const st of starts) {
      const k = key(st.node.id, st.dir);
      if (dist.has(k) && dist.get(k) <= st.cost) continue;
      dist.set(k, st.cost); prev.set(k, null); if (!open.includes(k)) open.push(k);
    }
    let best = null;
    while (open.length) {
      let bi = 0;
      for (let q = 1; q < open.length; q++) if (dist.get(open[q]) < dist.get(open[bi])) bi = q;
      const k = open.splice(bi, 1)[0], cd = dist.get(k);
      if (best && cd >= best.cost) break;
      const id = k >> 2, dir = DIRK[k & 3], n = map.nodes[id];
      for (const out of DIRK) {
        const si = n.exits[out];
        if (si === null || out === U.OPPOSITE[dir]) continue;
        const seg = map.segments[si], turn = out === dir ? 0 : TURN_COST;
        if (seg === dest.seg) { // last leg: along the destination street up to the stop
          const c = cd + turn + Math.abs(dest.at - coord(seg, n)) + (dest.park && gateSide(out) === 'left' ? CROSS_COST : 0);
          if (!best || c < best.cost) best = { cost: c, k };
          continue;
        }
        const nk = key(otherEnd(seg, id), out), nc = cd + turn + map.SP;
        if (dist.has(nk) && dist.get(nk) <= nc) continue;
        dist.set(nk, nc); prev.set(nk, k); if (!open.includes(nk)) open.push(nk);
      }
    }
    if (!best) return null;
    const nodes = [];
    for (let k = best.k; k !== null && k !== undefined; k = prev.get(k)) nodes.unshift(map.nodes[k >> 2]);
    return { cost: best.cost, nodes };
  }

  // One street of the plan, driven from one intersection to the next.
  function edge(fromId, toId) {
    const from = map.nodes[fromId], to = map.nodes[toId], travel = dirBetween(from, to);
    return { from, to, travel, seg: map.segments[from.exits[travel]] };
  }
  function chain(first, res) {
    const edges = first ? [first] : [];
    for (let k = 0; k < res.nodes.length - 1; k++) edges.push(edge(res.nodes[k].id, res.nodes[k + 1].id));
    const end = res.nodes[res.nodes.length - 1];
    edges.push(edge(end.id, otherEnd(dest.seg, end.id)));
    return edges;
  }

  function makePlan(sit, s, f) {
    const place = PLACES[sit.kind];
    if (place) {
      if (place.dest === dest) return { edges: [], i: 0, inside: true };
      // Parked off the street: pull out in whichever direction makes the shorter drive.
      const exit = place.exitPt(s), seg = place.dest.seg;
      let best = null;
      for (const id of [seg.a, seg.b]) {
        const travel = map.dirToward(seg, id), node = map.nodes[id];
        const base = turnOf(place.exitDir, travel) === 'left' ? CROSS_COST : 0;
        const first = edge(otherEnd(seg, id), id);
        let cand = null;
        if (seg === dest.seg && ahead(travel, exit) > 2) cand = { cost: base + ahead(travel, exit), edges: [first] };
        else {
          const res = search([{ node, dir: travel, cost: base + Math.hypot(node.x - exit.x, node.z - exit.z) }]);
          if (res) cand = { cost: res.cost, edges: chain(first, res) };
        }
        if (cand && (!best || cand.cost < best.cost)) best = { ...cand, travel };
      }
      if (!best) return null;
      const o = laneOffset(seg, best.travel), c = onSeg(seg, coord(seg, exit) + sign(best.travel) * 6);
      return { edges: best.edges, i: 0,
        exit: { pt: exit, join: { x: c.x + o.x, z: c.z + o.z }, turn: turnOf(place.exitDir, best.travel), name: seg.name } };
    }
    if (sit.kind === 'seg') {
      const cur = edge(sit.from.id, sit.node.id);
      if (sit.seg === dest.seg && reachable(sit.travel, s)) return { edges: [cur], i: 0 };
      const res = search([{ node: sit.node, dir: sit.travel, cost: Math.hypot(sit.node.x - s.x, sit.node.z - s.z) }]);
      return res ? { edges: chain(cur, res), i: 0 } : null;
    }
    // In an intersection or off the road: start at the closest intersection, the way the car faces.
    const facing = Math.abs(f.x) > Math.abs(f.z) ? (f.x > 0 ? 'E' : 'W') : (f.z > 0 ? 'S' : 'N');
    const n = sit.kind === 'box' ? sit.node : nearestNode(s.x, s.z);
    const res = search([{ node: n, dir: facing, cost: Math.hypot(n.x - s.x, n.z - s.z) }]);
    return res ? { edges: chain(null, res), i: 0, facing } : null;
  }

  // ---------- the line the chevrons follow ----------
  function trace(sit, s) {
    const pts = [{ x: s.x, z: s.z }];
    if (!plan || plan.inside) pts.push({ x: dest.x, z: dest.z });
    else {
      if (plan.exit) pts.push(plan.exit.pt, plan.exit.join);
      const onStreet = sit.kind === 'seg' || !!plan.exit;
      for (let k = plan.i; k < plan.edges.length; k++) {
        const e = plan.edges[k], d = U.DIRS[e.travel], o = laneOffset(e.seg, e.travel);
        if (k > plan.i || !onStreet) {
          const h = map.halfAlong(e.from, e.travel);
          pts.push({ x: e.from.x + d.x * h + o.x, z: e.from.z + d.z * h + o.z, tag: 'out', d });
        } else if (!plan.exit) {
          // ease back into the lane just ahead instead of drawing one long diagonal
          const m = coord(e.seg, s) + sign(e.travel) * 10;
          const stop = k < plan.edges.length - 1 ? coord(e.seg, e.to) - sign(e.travel) * map.halfAlong(e.to, e.travel) : dest.at;
          if ((stop - m) * sign(e.travel) > 6) { const c = onSeg(e.seg, m); pts.push({ x: c.x + o.x, z: c.z + o.z }); }
        }
        if (k < plan.edges.length - 1) {
          const h = map.halfAlong(e.to, e.travel);
          pts.push({ x: e.to.x - d.x * h + o.x, z: e.to.z - d.z * h + o.z, tag: 'in', d });
          continue;
        }
        // the destination street: stay in lane up to the stop
        const c = onSeg(e.seg, dest.at), p = { x: c.x + o.x, z: c.z + o.z };
        if (!dest.park) { pts.push(p); break; }
        const ref = pts[pts.length - 1];
        if ((p.x - ref.x) * d.x + (p.z - ref.z) * d.z > 6) pts.push({ x: p.x - d.x * 4, z: p.z - d.z * 4 });
        pts.push(dest.gate, { x: dest.x, z: dest.z });
      }
    }
    polyline = smoothTurns(pts);
    polyLen = [0];
    for (let k = 1; k < polyline.length; k++) {
      const a = polyline[k - 1], b = polyline[k];
      polyLen.push(polyLen[k - 1] + Math.hypot(b.x - a.x, b.z - a.z));
    }
  }

  // Replace each sharp corner through an intersection with a gentle curve.
  function smoothTurns(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[i + 1];
      out.push(p);
      if (p.tag !== 'in' || !q || q.tag !== 'out' || p.d === q.d) continue;
      // control point where the two lane lines cross
      const cx = p.d.x !== 0 ? q.x : p.x, cz = p.d.x !== 0 ? p.z : q.z;
      for (let k = 1; k < 6; k++) {
        const t = k / 6, u = 1 - t;
        out.push({ x: u * u * p.x + 2 * u * t * cx + t * t * q.x, z: u * u * p.z + 2 * u * t * cz + t * t * q.z });
      }
    }
    return out;
  }

  // ---------- keeping the plan current ----------
  // In an intersection: has the car clearly driven past the middle toward a street the plan
  // does not take next? Then treat it as already on that street.
  function leavingAnotherWay(sit, s, f) {
    const next = plan.edges.find((e, k) => k >= plan.i && e.from === sit.node);
    if (!next) return null;
    for (const out of DIRK) {
      const si = sit.node.exits[out], d = U.DIRS[out];
      if (si === null || out === next.travel || f.x * d.x + f.z * d.z < 0.85) continue;
      if ((s.x - sit.node.x) * d.x + (s.z - sit.node.z) * d.z <= 0) continue;
      const seg = map.segments[si];
      return { kind: 'seg', seg, dot: 1, travel: out, from: sit.node, node: map.nodes[otherEnd(seg, sit.node.id)] };
    }
    return null;
  }

  function refresh(car) {
    const s = car.state, f = car.forward();
    let sit = situation(s, f);
    if (plan && sit.kind === 'box') sit = leavingAnotherWay(sit, s, f) || sit;
    const aligned = sit.kind === 'seg' && Math.abs(sit.dot) >= 0.35; // clearly driving along a street
    let fresh = !plan;
    if (plan) {
      if (PLACES[sit.kind]) fresh = true;
      else if (aligned) {
        let j = -1;
        for (let k = plan.i; k < plan.edges.length; k++) {
          if (plan.edges[k].from === sit.from && plan.edges[k].to === sit.node) { j = k; break; }
        }
        if (j < 0) fresh = true; // on a street the plan does not use: plan again from here
        else {
          plan.i = j; plan.exit = null; plan.facing = null;
          if (j === plan.edges.length - 1 && !reachable(sit.travel, s)) fresh = true; // drove past it
        }
      }
      // inside an intersection, mid-turn, or clipping a corner: keep the plan as it is
    }
    if (fresh) plan = makePlan(sit, s, f);
    if (fresh || aligned) trace(sit, s);
    last = instruction(s);
  }

  function instruction(s) {
    const here = Math.hypot(dest.x - s.x, dest.z - s.z);
    if (!plan) return { icon: '📍', text: 'Head to ' + dest.name, dist: here };
    if (plan.inside) return { icon: '◎', text: 'Park in the ' + (dest === DESTS.office ? 'gold circle' : 'blue ring'), dist: here };
    if (plan.exit) {
      return { icon: plan.exit.turn === 'left' ? '↰' : '↱', text: 'Pull out and turn ' + plan.exit.turn + ' onto ' + plan.exit.name,
        dist: Math.hypot(plan.exit.pt.x - s.x, plan.exit.pt.z - s.z) };
    }
    const turnStep = (t, name, dist) => ({ icon: t === 'left' ? '↰' : '↱', text: 'Turn ' + t + ' onto ' + name, dist });
    if (plan.facing) {
      const t = turnOf(plan.facing, plan.edges[0].travel);
      if (t === 'left' || t === 'right') return turnStep(t, plan.edges[0].seg.name, 0);
    }
    // walk the plan looking for the first real turn
    let d = 0;
    for (let k = plan.i; k < plan.edges.length - 1; k++) {
      const e = plan.edges[k], nx = plan.edges[k + 1];
      d = k === plan.i ? Math.hypot(e.to.x - s.x, e.to.z - s.z) : d + map.SP;
      const t = turnOf(e.travel, nx.travel);
      if (t !== 'straight') return turnStep(t, nx.seg.name, d);
    }
    if (dest.park) {
      const side = gateSide(plan.edges[plan.edges.length - 1].travel);
      return { icon: side === 'right' ? '↱' : '↰', text: 'Pull into ' + dest.label + ' on your ' + side,
        dist: Math.hypot(dest.gate.x - s.x, dest.gate.z - s.z) };
    }
    return { icon: '↑', text: here < 90 ? 'Drive into the blue ring' : 'Continue to ' + dest.name, dist: here };
  }

  // ---------- chevrons on the road ----------
  // A bright arrow over a dark one, so the trail reads on pale concrete and on dark asphalt.
  const MAXC = 30;
  const shape = new T.Shape();
  shape.moveTo(-1, -0.6); shape.lineTo(0, 0.35); shape.lineTo(1, -0.6); shape.lineTo(1, 0.15); shape.lineTo(0, 1.1); shape.lineTo(-1, 0.15); shape.closePath();
  const chevG = new T.ShapeGeometry(shape);
  chevG.translate(0, -0.25, 0);
  chevG.rotateX(-Math.PI / 2); chevG.rotateY(Math.PI); // lie flat, pointing the way the car drives
  chevG.scale(1.25, 1, 1.6);
  const backG = chevG.clone(); backG.scale(1.3, 1, 1.3);
  const chevMat = new T.MeshBasicMaterial({ color: 0x2fd6ff, transparent: true, opacity: 0.95, depthWrite: false, fog: false });
  const backMat = new T.MeshBasicMaterial({ color: 0x0a2a4d, transparent: true, opacity: 0.6, depthWrite: false, fog: false });
  const back = new T.InstancedMesh(backG, backMat, MAXC), chev = new T.InstancedMesh(chevG, chevMat, MAXC);
  // These instances follow the car. The empty title-screen bounds never describe the route.
  for (const [mesh, order] of [[back, 2], [chev, 3]]) { mesh.frustumCulled = false; mesh.renderOrder = order; mesh.count = 0; scene.add(mesh); }
  const hideChevrons = () => { chev.count = 0; back.count = 0; };

  const destBeacon = world.beacon(0x34e2ff, 6);
  destBeacon.visible = false;

  const m4 = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0), size = new T.Vector3(), p3 = new T.Vector3();
  function drawChevrons(dt, car) {
    hideChevrons();
    if (polyline.length < 2) return;
    flow = (flow + dt * 7) % SPACING;
    // start from the point of the line closest to the car (it was drawn from the car, so look near its start)
    const s = car.state;
    let bestD = Infinity, startAlong = 0;
    for (let k = 0; k < polyline.length - 1 && polyLen[k] < 70; k++) {
      const a = polyline[k], b = polyline[k + 1];
      const L = polyLen[k + 1] - polyLen[k]; if (L < 0.01) continue;
      const t = U.clamp(((s.x - a.x) * (b.x - a.x) + (s.z - a.z) * (b.z - a.z)) / (L * L), 0, 1);
      const dd = Math.hypot(a.x + (b.x - a.x) * t - s.x, a.z + (b.z - a.z) * t - s.z);
      if (dd < bestD) { bestD = dd; startAlong = polyLen[k] + t * L; }
    }
    const total = polyLen[polyLen.length - 1];
    let n = 0, seg = 0;
    for (let along = startAlong + 4 + flow; along < Math.min(total - 1, startAlong + 170) && n < MAXC; along += SPACING) {
      while (seg < polyLen.length - 2 && polyLen[seg + 1] < along) seg++;
      const a = polyline[seg], b = polyline[seg + 1];
      const L = polyLen[seg + 1] - polyLen[seg]; if (L < 0.01) continue;
      const t = (along - polyLen[seg]) / L;
      q.setFromAxisAngle(up, Math.atan2(b.x - a.x, b.z - a.z));
      const fade = U.clamp((along - startAlong - 3) / 6, 0.05, 1);
      size.set(fade, 1, fade);
      p3.set(a.x + (b.x - a.x) * t, 0.1, a.z + (b.z - a.z) * t);
      m4.compose(p3, q, size); back.setMatrixAt(n, m4);
      p3.y = 0.11;
      m4.compose(p3, q, size); chev.setMatrixAt(n, m4);
      n++;
    }
    chev.count = back.count = n;
    chev.instanceMatrix.needsUpdate = back.instanceMatrix.needsUpdate = true;
    chevMat.opacity = 0.86 + Math.sin(performance.now() / 300) * 0.09;
  }

  function setDestination(id) {
    dest = id ? DESTS[id] : null;
    destBeacon.visible = !!dest && id !== 'office'; // the office has its own gold circle
    if (dest) {
      destBeacon.position.set(dest.x, 0, dest.z);
      destBeacon.scale.setScalar(dest.r / 6);
    }
    plan = null; polyline = []; polyLen = []; recalc = 0;
    if (!dest) hideChevrons();
  }

  /** Call every frame while driving. Returns guidance and whether the destination is reached. */
  function update(dt, car) {
    if (!dest) { hideChevrons(); return null; }
    recalc -= dt;
    if (recalc <= 0) { recalc = 0.2; refresh(car); }
    drawChevrons(dt, car);
    destBeacon.userData.ring.rotation.z += dt;
    const s = car.state;
    // Street stops count as soon as the car is in the ring; parking stops need a full stop.
    const arrived = Math.hypot(s.x - dest.x, s.z - dest.z) < dest.r && (!dest.park || Math.abs(s.v) < 1.2);
    return { ...last, arrived, destName: dest.name, icon2: dest.icon };
  }

  function hide() { hideChevrons(); destBeacon.visible = false; }

  return { DESTS, LESSONS, EXTRA, setDestination, update, hide,
    get polyline() { return polyline; }, get dest() { return dest; }, get plan() { return plan; } };
};
