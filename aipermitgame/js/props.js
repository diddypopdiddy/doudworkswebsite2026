/* Street-name signs and pedestrians: the life of the town. */
RT.createProps = function (scene, map, quality) {
  const T = THREE, U = RT.U, B = RT.Build;

  // ---------- green street-name blades at every intersection ----------
  {
    const names = [...new Set(map.segments.map((s) => s.name))];
    const row = 56, height = 2 ** Math.ceil(Math.log2(row * names.length + 8));
    const [canvas, g] = B.canvas(256, height);
    g.fillStyle = '#1e6b3a'; g.fillRect(0, 0, canvas.width, height);
    g.font = 'bold 28px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = g.fillStyle = '#ffffff'; g.lineWidth = 3;
    names.forEach((name, i) => {
      const y = i * row + 8;
      g.strokeRect(4, y + 4, 248, 40);
      g.fillText(name.toUpperCase(), 128, y + 26);
    });
    const spots = {}; // name -> [{x,y,z,rot}]
    const poles = new B.Batch();
    for (const n of map.nodes) {
      if (n.degree < 3) continue;
      // pole on the south-east corner beyond the cut-back
      const px = n.x + n.halfX + map.CORNER + 0.6, pz = n.z + n.halfZ + map.CORNER + 0.6;
      poles.cyl(px, 0.2, pz, 0.06, 3.4, 0x6f757c, 6);
      const ew = map.segments[n.exits.E !== null ? n.exits.E : n.exits.W], ns = map.segments[n.exits.N !== null ? n.exits.N : n.exits.S];
      if (ew) (spots[ew.name] = spots[ew.name] || []).push({ x: px, y: 3.45, z: pz, rot: 0 });          // blade runs east-west
      if (ns) (spots[ns.name] = spots[ns.name] || []).push({ x: px, y: 3.15, z: pz, rot: Math.PI / 2 }); // blade runs north-south
    }
    // All street-name blades share one atlas and one draw.
    const blades = new B.Batch();
    const matrix = new T.Matrix4();
    const box = new T.BoxGeometry(1.5, 0.28, 0.03);
    const srcUv = box.attributes.uv;
    names.forEach((name, i) => {
      const geo = box.clone(), uv = geo.attributes.uv;
      for (const group of geo.groups) {
        const face = group.materialIndex >= 4;
        for (let index = group.start; index < group.start + group.count; index++) {
          const v = geo.index.getX(index);
          if (face) uv.setXY(v, srcUv.getX(v), 1 - (i * row + 8 + (1 - srcUv.getY(v)) * 48) / height);
          else uv.setXY(v, 0.5, 1 - 3 / height);
        }
      }
      for (const s of spots[name] || []) blades.addGeometry(geo, matrix.makeRotationY(s.rot).setPosition(s.x, s.y, s.z), 0xffffff);
      geo.dispose();
    });
    box.dispose();
    scene.add(blades.build(B.M({ map: B.toTexture(canvas) })));
    scene.add(poles.build(B.M({ vertexColors: true })));
  }

  // ---------- pedestrians walking the sidewalks ----------
  const count = quality.traffic >= 16 ? 56 : quality.traffic >= 12 ? 36 : 16;
  const rnd = U.seeded(4242);
  const loops = map.blocks.filter((b) => b.type !== 'office').map((b) => {
    const o = 1.7, c = map.CORNER + 0.6;
    // walk the sidewalk ring, stepping around the cut-back corners
    return [
      { x: b.x0 + c, z: b.z0 + o }, { x: b.x1 - c, z: b.z0 + o }, { x: b.x1 - o, z: b.z0 + c }, { x: b.x1 - o, z: b.z1 - c },
      { x: b.x1 - c, z: b.z1 - o }, { x: b.x0 + c, z: b.z1 - o }, { x: b.x0 + o, z: b.z1 - c }, { x: b.x0 + o, z: b.z0 + c }
    ];
  });
  const loopLen = loops.map((pts) => pts.reduce((a, p, k) => a + Math.hypot(pts[(k + 1) % pts.length].x - p.x, pts[(k + 1) % pts.length].z - p.z), 0));
  const people = [];
  for (let k = 0; k < count; k++) {
    const li = Math.floor(rnd() * loops.length);
    people.push({ li, d: rnd() * loopLen[li], speed: (1.1 + rnd() * 0.5) * (rnd() < 0.5 ? 1 : -1), phase: rnd() * 6, side: (rnd() - 0.5) * 1.2 });
  }
  const bodyG = new T.CylinderGeometry(0.2, 0.24, 0.7, 7); bodyG.translate(0, 1.15, 0);
  const legG = new T.BoxGeometry(0.34, 0.8, 0.2); legG.translate(0, 0.4, 0);
  const headG = new T.SphereGeometry(0.17, 8, 6); headG.translate(0, 1.68, 0);
  const shirts = [0xe63946, 0x2a9d8f, 0xf4a261, 0x457b9d, 0xffb703, 0x8338ec, 0x06d6a0, 0xef476f, 0xf1faee, 0x264653];
  const pants = [0x1d3557, 0x2b2d42, 0x6c584c, 0x3d405b];
  const skins = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac, 0x5c3a21];
  if (RT.useModels) return modelPeople();
  const mk = (g) => { const im = new T.InstancedMesh(g, B.M(), count); im.castShadow = quality.shadows; scene.add(im); return im; };
  const bodies = mk(bodyG), legs = mk(legG), heads = mk(headG);
  const col = new T.Color();
  people.forEach((p, k) => {
    bodies.setColorAt(k, col.set(shirts[Math.floor(rnd() * shirts.length)]));
    legs.setColorAt(k, col.set(pants[Math.floor(rnd() * pants.length)]));
    heads.setColorAt(k, col.set(skins[Math.floor(rnd() * skins.length)]));
  });
  const m = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0), pos = new T.Vector3(), sc = new T.Vector3(1, 1, 1);


  // Blender-made people: jointed parts, instanced, with a swinging walk cycle.
  function modelPeople() {
    const P = RT.ASSETS.people;
    const names = ['torso_a', 'torso_b', 'head', 'hair_short', 'hair_long', 'hair_bun', 'hair_cap', 'arm_l', 'arm_r', 'leg_l', 'leg_r'];
    const tint = { Shirt: true, Pants: true, Skin: true, Hair: true, Cap: true };
    const rig = {};
    for (const n of names) {
      const node = RT.Kit.find(P, n);
      if (!node) continue;
      const joint = new T.Vector3().setFromMatrixPosition(node.matrixWorld);
      rig[n] = { joint, used: 0, kit: RT.Kit.instanced(scene, RT.Kit.mergeByMaterial(node, null, node), count, { tint, shadows: quality.shadows, dynamic: true, looks: { Hair: { roughness: 0.55 }, Eye: { roughness: 0.2 } } }) };
    }
    const hairs = [0x2b1b0e, 0x4a2c17, 0x8a5a2b, 0xd9b26a, 0x141414, 0x7a3b1d, 0x3a2416];
    const hairTypes = ['hair_short', 'hair_long', 'hair_bun', 'hair_cap'];
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    people.forEach((p) => {
      p.torso = rnd() < 0.5 ? 'torso_a' : 'torso_b';
      p.hair = pick(hairTypes);
      p.colors = { Shirt: pick(shirts), Pants: pick(pants), Skin: pick(skins), Hair: pick(hairs), Cap: pick(shirts) };
    });
    const UPV = new T.Vector3(0, 1, 0);
    const base = new T.Matrix4(), part = new T.Matrix4(), rot = new T.Matrix4(), q2 = new T.Quaternion(), v = new T.Vector3(), one = new T.Vector3(1, 1, 1);
    let time = 0;
    const parts = Object.values(rig);
    const reach = quality.traffic >= 16 ? 128 : 92;
    function place(n, p, swing) {
      const r = rig[n]; if (!r) return;
      const k = r.used++;
      part.makeTranslation(r.joint.x, r.joint.y, r.joint.z);
      if (swing) part.multiply(rot.makeRotationX(swing));
      r.kit.setMatrix(k, part.premultiply(base));
      for (const m of r.kit.parts) if (m.tinted) r.kit.setColor(k, m.name, p.colors[m.name]);
    }
    function update(dt, camPos) {
      time += dt;
      for (const part of parts) part.used = 0;
      people.forEach((p) => {
        p.d += p.speed * dt;
        const pt = pointOnLoop(p.li, p.d);
        const dir = Math.sign(p.speed);
        const x = pt.x - pt.dz * p.side, z = pt.z + pt.dx * p.side;
        if (Math.hypot(x - camPos.x, z - camPos.z) > reach) return;
        const ph = time * 6.5 * Math.abs(p.speed) / 1.3 + p.phase;
        const s = Math.sin(ph);
        q2.setFromAxisAngle(UPV, Math.atan2(pt.dx * dir, pt.dz * dir));
        base.compose(v.set(x, 0.2 + Math.abs(Math.cos(ph)) * 0.035, z), q2, one);
        place(p.torso, p, 0); place('head', p, 0); place(p.hair, p, 0);
        place('arm_l', p, s * 0.55); place('arm_r', p, -s * 0.55);
        place('leg_l', p, -s * 0.5); place('leg_r', p, s * 0.5);
      });
      for (const part of parts) {
        part.kit.setCount(part.used);
        if (part.used) part.kit.commit();
      }
    }
    update(0, { x: 0, z: 0 });
    return { update };
  }

  function pointOnLoop(li, d) {
    const pts = loops[li];
    d = ((d % loopLen[li]) + loopLen[li]) % loopLen[li];
    for (let k = 0; k < pts.length; k++) {
      const a = pts[k], b = pts[(k + 1) % pts.length];
      const L = Math.hypot(b.x - a.x, b.z - a.z);
      if (d <= L) { const t = d / L; return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, dx: (b.x - a.x) / L, dz: (b.z - a.z) / L }; }
      d -= L;
    }
    return { x: pts[0].x, z: pts[0].z, dx: 1, dz: 0 };
  }

  let t = 0;
  function update(dt, camPos) {
    t += dt;
    people.forEach((p, k) => {
      p.d += p.speed * dt;
      const pt = pointOnLoop(p.li, p.d);
      const dir = Math.sign(p.speed);
      const nx = -pt.dz, nz = pt.dx; // keep walkers to one side of the walk
      const x = pt.x + nx * p.side, z = pt.z + nz * p.side;
      const far = Math.abs(x - camPos.x) > 260 || Math.abs(z - camPos.z) > 260;
      const bob = far ? 0 : Math.abs(Math.sin(t * 6 + p.phase)) * 0.05;
      q.setFromAxisAngle(up, Math.atan2(pt.dx * dir, pt.dz * dir));
      pos.set(x, 0.2 + bob, z);
      m.compose(pos, q, sc);
      bodies.setMatrixAt(k, m); heads.setMatrixAt(k, m);
      // legs scissor by squashing the leg block a little each stride
      sc.set(1, 1 - Math.abs(Math.sin(t * 6 + p.phase)) * 0.12, 1);
      m.compose(pos, q, sc); legs.setMatrixAt(k, m);
      sc.set(1, 1, 1);
    });
    bodies.instanceMatrix.needsUpdate = true; legs.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true;
  }
  update(0, { x: 0, z: 0 });
  return { update };
};
