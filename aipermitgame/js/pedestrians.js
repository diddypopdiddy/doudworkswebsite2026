/* Pedestrian placement and playback of the Blender-authored walk cycles. */
RT.createPedestrians = function (scene, map, quality) {
  const T = THREE, U = RT.U, B = RT.Build;
  const count = quality.traffic >= 16 ? 56 : quality.traffic >= 12 ? 36 : 16;
  const reach = quality.traffic >= 16 ? 105 : quality.traffic >= 12 ? 86 : 61;
  const rnd = U.seeded(4242);
  const loops = map.blocks.filter(b => b.type !== 'office').map(makeLoop);
  const upgraded = Boolean(RT.ASSETS?.maple);
  const maple = loops.find(path => upgraded && path.block.bi === 1 && path.block.bj === 2);
  const looks = new Map();
  for (const root of RT.ASSETS?.people?.children || []) {
    const clip = RT.ASSETS.peopleClips.find(a => a.name === root.userData.walkClip);
    const stride = root.userData.strideMeters;
    if (!clip || !(stride > 0)) continue;
    const materials = new Map();
    root.traverse(mesh => {
      if (!mesh.isSkinnedMesh || materials.has(mesh.material)) return;
      const source = mesh.material;
      if (source.map) source.map.anisotropy = quality.pbr ? 4 : 2;
      materials.set(source, B.M({
        map: source.map, color: source.color, alphaTest: source.alphaTest || 0.42,
        side: source.side,
      }, { roughness: 0.84 }));
    });
    if (materials.size) looks.set(root.name, { root, clip, stride, materials });
  }
  const defaultLook = looks.values().next().value;
  if (!defaultLook) return { update() {}, active: 0, riggedLooks: 0 };

  // Keep a few walkers on Maple's south frontage so the opening drive immediately shows them.
  const styles = ['denim', 'runner', 'bookshop', 'market', 'navy', 'terracotta'];
  const visibleFromLot = quality.pbr ? [0.24, 0.48, 0.65] : [0.30, 0.58];
  const people = Array.from({ length: count }, (_, index) => {
    const foreground = maple && index < visibleFromLot.length;
    const path = foreground ? maple : loops[Math.floor(rnd() * loops.length)];
    const d = foreground
      ? path.south.end - path.south.length * visibleFromLot[index]
      : rnd() * path.length;
    const dir = foreground ? (index === 0 ? 1 : -1) : (rnd() < 0.5 ? 1 : -1);
    const style = foreground ? styles[index * 2] : styles[index % styles.length];
    const look = looks.get('walker_' + style) || defaultLook;
    return {
      path, d, dir, travel: 0, pace: look.stride * (0.94 + rnd() * 0.19),
      offset: (rnd() - 0.5) * 1.0, phase: rnd(), scale: 0.976 + rnd() * 0.048,
      look, visual: null,
    };
  });
  const shadows = makeContactShadows();
  const matrix = new T.Matrix4(), rotation = new T.Quaternion();
  const up = new T.Vector3(0, 1, 0), position = new T.Vector3(), scale = new T.Vector3();
  let active = 0;

  function makeLoop(block) {
    const { x0, z0, x1, z1 } = block;
    const edge = 1.65, corner = map.CORNER + 1.15;
    // Follow the right-angle sidewalk around each square cutback.
    const points = [
      [x0+corner,z0+edge], [x1-corner,z0+edge], [x1-corner,z0+corner], [x1-edge,z0+corner],
      [x1-edge,z1-corner], [x1-corner,z1-corner], [x1-corner,z1-edge], [x0+corner,z1-edge],
      [x0+corner,z1-corner], [x0+edge,z1-corner], [x0+edge,z0+corner], [x0+corner,z0+corner],
    ];
    let distance = 0;
    const segments = points.map(([x, z], i) => {
      const [nextX, nextZ] = points[(i + 1) % points.length];
      const dx = nextX - x, dz = nextZ - z, length = Math.hypot(dx, dz);
      distance += length;
      return { x, z, dx: dx / length, dz: dz / length, length, end: distance };
    });
    return { block, segments, length: distance, south: segments[6] };
  }

  function point(path, distance) {
    const d = ((distance % path.length) + path.length) % path.length;
    const part = path.segments.find(s => d < s.end) || path.segments[0];
    const step = d - (part.end - part.length);
    return [part.x + part.dx * step, part.z + part.dz * step];
  }

  function ground(path, x, z) {
    if (path !== maple) return 0.20;
    const b = path.block;
    const du = Math.min(x - b.x0, b.x1 - x), dv = Math.min(z - b.z0, b.z1 - z);
    const cut = map.CORNER;
    // Sample the curb ramp envelope used by the Maple Street Blender pavement.
    if (du <= cut && dv <= cut) return 0.047;
    const inside = Math.max(0, Math.min(dv <= cut ? du - cut : du, du <= cut ? dv - cut : dv));
    const near = U.clamp((cut + 1.6 - Math.max(du, dv)) / 1.6, 0, 1);
    return 0.18 - (0.18 - 0.047) * near * Math.max(0, 1 - inside / 1.65);
  }

  function copyActor(look) {
    const root = look.root.clone(true);
    const copies = new Map();
    const sourceMeshes = [];
    function pair(source, clone) {
      copies.set(source, clone);
      if (source.isSkinnedMesh) sourceMeshes.push(source);
      source.children.forEach((child, i) => pair(child, clone.children[i]));
    }
    pair(look.root, root);
    for (const src of sourceMeshes) {
      const mesh = copies.get(src);
      const skeleton = new T.Skeleton(src.skeleton.bones.map(b => copies.get(b)), src.skeleton.boneInverses);
      mesh.bind(skeleton, src.bindMatrix);
      mesh.material = look.materials.get(src.material);
      mesh.castShadow = quality.shadows;
      mesh.frustumCulled = false;
    }
    const mixer = new T.AnimationMixer(root);
    const action = mixer.clipAction(look.clip).play();
    return { root, mixer, action };
  }

  function makeContactShadows() {
    const [canvas, ctx] = B.canvas(48, 48);
    const fade = ctx.createRadialGradient(24, 24, 1, 24, 24, 23);
    fade.addColorStop(0, 'rgba(26,22,14,0.41)');
    fade.addColorStop(0.38, 'rgba(26,22,14,0.22)');
    fade.addColorStop(1, 'rgba(26,22,14,0.0)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, 48, 48);
    const g = new T.PlaneGeometry(0.69, 0.93).rotateX(-Math.PI / 2);
    const m = new T.MeshBasicMaterial({ map: B.toTexture(canvas), transparent: true, depthWrite: false });
    const batch = new T.InstancedMesh(g, m, count);
    batch.count = 0;
    batch.frustumCulled = false;
    batch.instanceMatrix.setUsage(T.DynamicDrawUsage);
    scene.add(batch);
    return batch;
  }

  function update(dt, camera) {
    active = 0;
    for (const p of people) {
      p.travel += p.pace * dt;
      const d = p.d + p.travel * p.dir;
      const [cx, cz] = point(p.path, d);
      if ((cx - camera.x)**2 + (cz - camera.z)**2 + camera.y**2 > reach**2) {
        p.visual?.root.removeFromParent();
        continue;
      }
      const [ax, az] = point(p.path, d - 0.46);
      const [bx, bz] = point(p.path, d + 0.46);
      const length = Math.hypot(bx - ax, bz - az) || 1;
      const dx = (bx - ax) / length, dz = (bz - az) / length;
      const x = (ax + bx + 4*cx) / 6 - dz * p.offset;
      const z = (az + bz + 4*cz) / 6 + dx * p.offset;
      const y = ground(p.path, x, z);
      rotation.setFromAxisAngle(up, Math.atan2(dx * p.dir, dz * p.dir));
      p.visual ||= copyActor(p.look);
      const { root, mixer, action } = p.visual;
      if (!root.parent) scene.add(root);
      root.position.set(x, y, z);
      root.quaternion.copy(rotation);
      root.scale.setScalar(p.scale);
      const cycle = p.phase + p.travel / (p.look.stride * p.scale);
      action.time = (cycle % 1) * p.look.clip.duration;
      mixer.update(0);
      matrix.compose(position.set(x, y + 0.004, z), rotation, scale.setScalar(p.scale));
      shadows.setMatrixAt(active++, matrix);
    }
    shadows.count = active;
    shadows.instanceMatrix.needsUpdate = true;
  }
  update(0, {x: 0, y: 0, z: 0});
  return { update, get active() { return active; }, riggedLooks: looks.size };
};
