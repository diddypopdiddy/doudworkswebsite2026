/* Traffic signals and AI traffic. */
RT.createSignals = function (map) {
  const GREEN = 13, YELLOW = 3, ALLRED = 1.4;
  const rnd = RT.U.seeded(99);
  const other = (a) => (a === 'ns' ? 'ew' : 'ns');
  const sigs = new Map();
  for (const n of map.nodes) {
    if (n.kind === 'signal') sigs.set(n.id, { green: rnd() < 0.5 ? 'ns' : 'ew', stage: 'green', t: rnd() * GREEN, lock: null, fast: false });
  }

  function light(nodeId, axis) {
    const s = sigs.get(nodeId);
    if (!s) return 'green';
    if (s.green !== axis) return 'red';
    return s.stage === 'green' ? 'green' : s.stage === 'yellow' ? 'yellow' : 'red';
  }

  function update(dt) {
    for (const s of sigs.values()) {
      s.t += dt;
      if (s.lock) s.lock.t += dt;
      const Y = s.fast ? 2.2 : YELLOW, R = s.fast ? 0.9 : ALLRED;
      const target = s.lock ? s.lock.greenAxis : null;
      if (s.stage === 'green') {
        if (target) {
          if (s.green === target) s.t = 0; else { s.stage = 'yellow'; s.t = 0; }
        } else if (s.t > GREEN) { s.stage = 'yellow'; s.t = 0; }
      } else if (s.stage === 'yellow') {
        if (s.t > Y) { s.stage = 'allred'; s.t = 0; }
      } else if (s.t > R) {
        s.green = target || other(s.green); s.stage = 'green'; s.t = 0; s.fast = false;
      }
    }
  }

  // Hold a signal so `greenAxis` gets (or keeps) the green. `fast` shortens the change.
  function lock(nodeId, greenAxis, fast) {
    const s = sigs.get(nodeId);
    if (!s) return;
    s.lock = { greenAxis, t: 0 };
    s.fast = !!fast;
  }
  function unlock(nodeId) { const s = sigs.get(nodeId); if (s) { s.lock = null; } }
  function lockAge(nodeId) { const s = sigs.get(nodeId); return s && s.lock ? s.lock.t : 0; }

  return { light, update, lock, unlock, lockAge, other, sigs };
};

RT.createTraffic = function (scene, map, signals, count) {
  const T = THREE, U = RT.U, B = RT.Build;
  const rnd = Math.random;
  const cars = [];
  const SP = map.SP;
  const travelKey = (seg, dir) => (seg.axis === 'x' ? (dir > 0 ? 'E' : 'W') : (dir > 0 ? 'S' : 'N'));
  const endNodeOf = (seg, dir) => map.nodes[dir > 0 ? seg.b : seg.a];
  const startNodeOf = (seg, dir) => map.nodes[dir > 0 ? seg.a : seg.b];
  const carColors = [0xe63946, 0xf1faee, 0x457b9d, 0x1d3557, 0xffb703, 0x8d99ae, 0x2b2d42, 0x6a994e, 0xbc4749, 0xf4a261, 0x9b5de5, 0xd9d9d9, 0x264653];

  const TYPES = ['sedan', 'hatch', 'suv', 'sedan', 'pickup', 'hatch', 'van', 'sedan'];
  let traffic_kits = [];
  const M4 = new T.Matrix4(), Q = new T.Quaternion(), UP = new T.Vector3(0, 1, 0), ONE = new T.Vector3(1, 1, 1), P3 = new T.Vector3();
  function makeMesh(color, k) {
    const type = TYPES[k % TYPES.length];
    const roof = type === 'van' || type === 'pickup' ? null : (k % 4 === 1 ? 0xf2f2f2 : null);
    const { mesh, spec } = RT.Vehicles.mergedMesh(type, color, roof);
    scene.add(mesh);
    return { mesh, len: spec.L };
  }

  function lanePoint(seg, dir, s) {
    const n = startNodeOf(seg, dir), k = travelKey(seg, dir), d = U.DIRS[k], r = U.rightOf(d);
    const off = seg.width / 4;
    return { x: n.x + d.x * s + r.x * off, z: n.z + d.z * s + r.z * off, h: Math.atan2(d.x, d.z) };
  }
  const sMinOf = (seg, dir) => map.halfAlong(startNodeOf(seg, dir), travelKey(seg, dir));
  const sMaxOf = (seg, dir) => SP - map.halfAlong(endNodeOf(seg, dir), travelKey(seg, dir));
  const sStopOf = (seg, dir) => {
    const n = endNodeOf(seg, dir);
    return SP - map.halfAlong(n, travelKey(seg, dir)) - (n.degree >= 3 ? map.CROSSWALK : 0);
  };

  function chooseNext(car) {
    const n = endNodeOf(car.seg, car.dir);
    const inKey = travelKey(car.seg, car.dir);
    const options = [];
    for (const k of ['N', 'E', 'S', 'W']) {
      const si = n.exits[k];
      if (si === null || k === U.OPPOSITE[inKey]) continue;
      const w = k === inKey ? 2.2 : 1;
      options.push({ k, si, w });
    }
    let total = options.reduce((a, o) => a + o.w, 0), r = rnd() * total;
    let o = options[0];
    for (const c of options) { r -= c.w; if (r <= 0) { o = c; break; } }
    const seg = map.segments[o.si];
    const dir = seg.a === n.id ? 1 : -1;
    car.next = { seg, dir, key: o.k };
  }

  function buildTurn(car) {
    const n = endNodeOf(car.seg, car.dir);
    const din = travelKey(car.seg, car.dir), dout = car.next.key;
    const d1 = U.DIRS[din], r1 = U.rightOf(d1), d2 = U.DIRS[dout], r2 = U.rightOf(d2);
    const off1 = car.seg.width / 4, off2 = car.next.seg.width / 4;
    const h1 = map.halfAlong(n, din), h2 = map.halfAlong(n, dout);
    const p0 = { x: n.x - d1.x * h1 + r1.x * off1, z: n.z - d1.z * h1 + r1.z * off1 };
    const p2 = { x: n.x + d2.x * h2 + r2.x * off2, z: n.z + d2.z * h2 + r2.z * off2 };
    let p1;
    if (din === dout) p1 = { x: (p0.x + p2.x) / 2, z: (p0.z + p2.z) / 2 };
    else { const k = (p2.x - p0.x) * d1.x + (p2.z - p0.z) * d1.z; p1 = { x: p0.x + d1.x * k, z: p0.z + d1.z * k }; }
    let len = 0, prev = p0;
    for (let i = 1; i <= 8; i++) { const p = bez(p0, p1, p2, i / 8); len += Math.hypot(p.x - prev.x, p.z - prev.z); prev = p; }
    car.turn = { node: n, p0, p1, p2, t: 0, len: Math.max(len, 0.01), straight: din === dout, din };
  }
  function bez(a, b, c, t) { const u = 1 - t; return { x: u * u * a.x + 2 * u * t * b.x + t * t * c.x, z: u * u * a.z + 2 * u * t * b.z + t * t * c.z }; }
  function bezTan(a, b, c, t) { return { x: 2 * (1 - t) * (b.x - a.x) + 2 * t * (c.x - b.x), z: 2 * (1 - t) * (b.z - a.z) + 2 * t * (c.z - b.z) }; }

  function spawn(car, player) {
    for (let tries = 0; tries < 60; tries++) {
      const seg = map.segments[Math.floor(rnd() * map.segments.length)];
      const dir = rnd() < 0.5 ? 1 : -1;
      const s = sMinOf(seg, dir) + 6 + rnd() * Math.max(1, sStopOf(seg, dir) - sMinOf(seg, dir) - 16);
      const p = lanePoint(seg, dir, s);
      if (player && Math.hypot(p.x - player.x, p.z - player.z) < 50) continue;
      if (cars.some((c) => c !== car && c.state === 'lane' && c.seg === seg && c.dir === dir && Math.abs(c.s - s) < 14)) continue;
      Object.assign(car, { seg, dir, s, v: 0, state: 'lane', turn: null, wait: 0, stopDone: false, queued: false });
      chooseNext(car);
      return;
    }
  }

  const nodeQueues = new Map();
  if (RT.useModels) {
    // Blender cars: one instanced set per car type, painted per car
    const kits = {}, used = {};
    for (let i = 0; i < count; i++) { const ty = TYPES[i % TYPES.length]; used[ty] = (used[ty] || 0) + 1; }
    for (const ty of Object.keys(used)) {
      const src = RT.Kit.find(RT.ASSETS.vehicles, 'car_' + ty);
      kits[ty] = { kit: RT.Kit.instanced(scene, RT.Vehicles.trafficParts(src), used[ty], {
        tint: { Paint: true }, shadows: count >= 16, shadowMaterials: ['Paint', 'Rubber'],
        looks: { Paint: { roughness: 0.32, metalness: 0.25 }, Glass: { roughness: 0.12, metalness: 0.35 }, HeroGlass: { roughness: 0.12, metalness: 0.35 } }
      }), n: 0 };
    }
    for (let i = 0; i < count; i++) {
      const ty = TYPES[i % TYPES.length], k = kits[ty];
      const car = { id: i, kit: k.kit, idx: k.n++, len: RT.Vehicles.TYPES[ty].L, x: 0, z: 0, h: 0 };
      k.kit.setColor(car.idx, 'Paint', carColors[i % carColors.length]);
      cars.push(car);
    }
    traffic_kits = Object.values(kits).map((k) => k.kit);
  } else {
    for (let i = 0; i < count; i++) {
      const m = makeMesh(carColors[i % carColors.length], i);
      const car = { id: i, mesh: m.mesh, len: m.len, x: 0, z: 0, h: 0 };
      cars.push(car);
    }
  }

  function reset(player) { nodeQueues.clear(); for (const c of cars) spawn(c, player); for (const c of cars) place(c); commitKits(); }

  function place(c) {
    let p;
    if (c.state === 'lane') p = lanePoint(c.seg, c.dir, c.s);
    else {
      const q = bez(c.turn.p0, c.turn.p1, c.turn.p2, c.turn.t), tg = bezTan(c.turn.p0, c.turn.p1, c.turn.p2, Math.min(0.999, c.turn.t));
      p = { x: q.x, z: q.z, h: Math.atan2(tg.x, tg.z) };
    }
    c.x = p.x; c.z = p.z; c.h = p.h;
    if (c.kit) { Q.setFromAxisAngle(UP, p.h); M4.compose(P3.set(p.x, 0, p.z), Q, ONE); c.kit.setMatrix(c.idx, M4); }
    else { c.mesh.position.set(p.x, 0, p.z); c.mesh.rotation.y = p.h; }
  }
  function commitKits() { for (const k of traffic_kits) k.commit(); }

  function playerInBox(n, player) {
    return Math.abs(player.x - n.x) < n.halfX + 2 && Math.abs(player.z - n.z) < n.halfZ + 2;
  }
  function boxBusy(n, me, player) {
    if (playerInBox(n, player)) return true;
    return cars.some((c) => c !== me && c.state === 'turn' && c.turn.node === n && c.turn.din !== travelKey(me.seg, me.dir));
  }

  // Distance ahead to whatever this car must not hit (other car or the player).
  function gapAhead(c, player) {
    let gap = Infinity;
    const fx = Math.sin(c.h), fz = Math.cos(c.h);
    for (const o of cars) {
      if (o === c) continue;
      const dx = o.x - c.x, dz = o.z - c.z;
      const along = dx * fx + dz * fz;
      if (along <= 0 || along > 30) continue;
      const lat = Math.abs(-dx * fz + dz * fx);
      if (lat > 1.9) continue;
      // ignore cars facing straight at us in the other lane (handled by lat) and crossing cars far to the side
      gap = Math.min(gap, along - (c.len + o.len) / 2);
    }
    const dx = player.x - c.x, dz = player.z - c.z;
    const along = dx * fx + dz * fz, lat = Math.abs(-dx * fz + dz * fx);
    if (along > 0 && along < 30 && lat < 2.4) gap = Math.min(gap, along - (c.len + 4.3) / 2);
    return gap;
  }

  function update(dt, player) {
    for (const c of cars) {
      const limit = U.fromMph(c.seg.limit) * 0.85;
      let vT = limit;
      const gap = gapAhead(c, player);
      if (gap < Infinity) vT = Math.min(vT, Math.max(0, (gap - 2) * 0.9));

      if (c.state === 'lane') {
        const n = endNodeOf(c.seg, c.dir);
        const key = travelKey(c.seg, c.dir);
        const front = c.s + c.len / 2;
        const toStop = sStopOf(c.seg, c.dir) - front;
        let mustStop = false;
        if (toStop > -0.5) {
          if (n.kind === 'signal') {
            const L = signals.light(n.id, U.axisOf(key));
            if (L === 'red') mustStop = true;
            else if (L === 'yellow' && toStop > c.v * c.v / 10 + 1) mustStop = true;
            else if (L === 'green' && toStop < 6 && boxBusy(n, c, player)) mustStop = true;
          } else if (map.stopsFor(n, U.axisOf(key)) && !c.stopDone) {
            mustStop = true;
            if (toStop < 1.6 && c.v < 0.3) {
              c.wait += dt;
              let q = nodeQueues.get(n.id); if (!q) nodeQueues.set(n.id, (q = []));
              if (!q.includes(c.id)) q.push(c.id);
              if (c.wait > 1.1 && q[0] === c.id && !boxBusy(n, c, player)) { c.stopDone = true; q.shift(); }
            }
          }
        }
        if (mustStop) vT = Math.min(vT, Math.sqrt(Math.max(0, 2 * 3.5 * (toStop - 0.4))));
        // slow for turns
        if (c.next.key !== key && toStop < 18) vT = Math.min(vT, 6.5);

        accelerate(c, vT, dt);
        c.s += c.v * dt;
        if (c.s >= sMaxOf(c.seg, c.dir)) {
          buildTurn(c);
          if (c.turn.len < 0.5) enterNext(c); else c.state = 'turn';
        }
      } else {
        vT = Math.min(vT, c.turn.straight ? limit : 6.5);
        accelerate(c, vT, dt);
        c.turn.t += (c.v * dt) / c.turn.len;
        if (c.turn.t >= 1) enterNext(c);
      }
      // safety net: a car stuck for a long time somewhere the player can't see respawns elsewhere
      c.idle = c.v < 0.05 ? (c.idle || 0) + dt : 0;
      if (c.idle > 25 && Math.hypot(c.x - player.x, c.z - player.z) > 45) {
        if (c.state === 'lane') { const q = nodeQueues.get(endNodeOf(c.seg, c.dir).id); if (q) { const k = q.indexOf(c.id); if (k >= 0) q.splice(k, 1); } }
        spawn(c, player); c.idle = 0;
      }
      place(c);
    }
    commitKits();
  }
  function accelerate(c, vT, dt) {
    if (c.v < vT) c.v = Math.min(vT, c.v + 2.8 * dt);
    else c.v = Math.max(vT, c.v - (vT < 0.5 ? 9 : 6) * dt);
  }
  function enterNext(c) {
    c.seg = c.next.seg; c.dir = c.next.dir;
    c.s = sMinOf(c.seg, c.dir);
    c.state = 'lane'; c.turn = null; c.wait = 0; c.stopDone = false;
    chooseNext(c);
  }

  // Returns the impact speed if the player is touching an AI car (and pushes them apart).
  function collide(player, pv) {
    let hit = 0;
    for (const c of cars) {
      const fx = Math.sin(c.h), fz = Math.cos(c.h);
      const pfx = Math.sin(player.heading), pfz = Math.cos(player.heading);
      for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) {
        const ax = c.x + fx * a * c.len * 0.33, az = c.z + fz * a * c.len * 0.33;
        const bx = player.x + pfx * b * 1.4, bz = player.z + pfz * b * 1.4;
        const d = Math.hypot(ax - bx, az - bz);
        if (d < 1.9) {
          hit = Math.max(hit, Math.abs(pv - c.v * (fx * pfx + fz * pfz)));
          const push = (1.9 - d) / 2 + 0.02, ux = (bx - ax) / (d || 1), uz = (bz - az) / (d || 1);
          player.x += ux * push; player.z += uz * push;
        }
      }
    }
    return hit;
  }

  return { cars, update, reset, collide };
};
