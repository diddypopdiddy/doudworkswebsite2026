/* Blender tree meshes and rendered distance cards for the town's plantings. */
RT.Foliage = (function () {
  const T = THREE;
  const names = ['oak', 'maple', 'birch', 'pine', 'fir', 'shrub'];
  const groups = [['oak', 'oak', 'maple', 'birch'], ['pine', 'fir', 'fir'], ['shrub']];

  async function load(data, tier, { toBuffer, loader, tex }) {
    async function loadMeshes() {
      if (typeof DecompressionStream !== 'function') return null;
      const bytes = new Blob([toBuffer(data.model)]).stream();
      const buffer = await new Response(bytes.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      return new Promise((resolve, reject) => loader.parse(buffer, '', resolve, reject));
    }
    const [model, atlas, cards] = await Promise.all([
      loadMeshes().catch(err => {
        console.warn('Detailed foliage could not load. Using the Blender tree renders.', err);
        return null;
      }),
      tex(data.atlas, true, tier === 'low' ? 2 : 4),
      tex(data.cards, true, 2)
    ]);
    for (const texture of [atlas, cards]) {
      if (!texture) continue;
      texture.flipY = false;
      texture.wrapS = texture.wrapT = T.ClampToEdgeWrapping;
      texture.needsUpdate = true;
    }
    return { meshes: model?.scene, atlas, cards, dimensions: data.dimensions };
  }

  function cardGeometry(id, size) {
    const geo = new T.PlaneGeometry(size, size);
    const coords = geo.attributes.uv;
    const x = 8 + id % 3 * 256, y = 8 + Math.floor(id / 3) * 256;
    for (let i = 0; i < coords.count; i++) {
      coords.setXY(i, (x + 240 * coords.getX(i)) / 768, (y + 240 * (1 - coords.getY(i))) / 512);
    }
    return geo;
  }

  function mount(pack, scene, trees, quality) {
    const stats = { total: trees.length, near: 0, mid: 0, far: 0, species: {} };
    if (!pack) return { stats, update() {}, setDusk() {} };
    const rng = RT.U.seeded(71327);
    const placements = new Map(names.map(name => [name, []]));
    for (const tree of trees) {
      const options = groups[tree.kind];
      const name = options[Math.floor(rng() * options.length)];
      const scale = tree.s * (name === 'shrub' ? 1.49 : 1) * (0.88 + rng() * 0.24);
      placements.get(name).push({
        x: tree.x, y: tree.y ?? 0.135, z: tree.z,
        width: scale * (0.85 + rng() * 0.26), height: scale * (0.89 + rng() * 0.22),
        yaw: rng() * Math.PI * 2, tint: 0.81 + rng() * 0.25
      });
    }
    const leaf = pack.atlas && RT.Build.M({
      map: pack.atlas, side: T.DoubleSide, alphaTest: 0.42, vertexColors: true
    }, { roughness: 0.93 });
    const depth = leaf && quality.shadows && new T.MeshDepthMaterial({
      map: pack.atlas, side: T.DoubleSide, alphaTest: 0.42, depthPacking: T.RGBADepthPacking
    });
    const card = pack.cards && new T.MeshBasicMaterial({
      map: pack.cards, alphaTest: 0.38, side: T.DoubleSide, toneMapped: false
    });
    const nearLimit = quality.traffic >= 16 ? 42 : quality.pbr ? 33 : 23;
    const midLimit = quality.traffic >= 16 ? 101 : quality.pbr ? 80 : 63;
    const position = new T.Vector3(), size = new T.Vector3();
    const up = new T.Vector3(0, 1, 0), rotation = new T.Quaternion(), matrix = new T.Matrix4();
    const color = new T.Color(), last = new T.Vector3(Infinity, Infinity, Infinity);
    const batches = names.map((name, id) => {
      const plants = placements.get(name), dimensions = pack.dimensions[name];
      stats.species[name] = plants.length;
      const nearModel = leaf && pack.meshes?.getObjectByName(name + '_near');
      const midModel = leaf && pack.meshes?.getObjectByName(name + '_mid');
      const near = batch('near', nearModel?.geometry, leaf, !!depth);
      const mid = batch('mid', midModel?.geometry, leaf, false);
      const far = batch('far', card && cardGeometry(id, dimensions.size), card, false);
      return { plants, dimensions, near, mid, far };

      function batch(level, geometry, material, shadow) {
        if (!geometry || !plants.length) return null;
        const mesh = new T.InstancedMesh(geometry, material, plants.length);
        mesh.name = 'foliage_' + name + '_' + level;
        mesh.castShadow = shadow;
        mesh.receiveShadow = level === 'near' && quality.shadows;
        if (shadow) mesh.customDepthMaterial = depth;
        mesh.frustumCulled = false;
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
        mesh.setColorAt(0, new T.Color(1, 1, 1));
        mesh.instanceColor.setUsage(T.DynamicDrawUsage);
        mesh.count = 0;
        scene.add(mesh);
        return mesh;
      }
    });

    function update(camera) {
      if (last.distanceToSquared(camera) < 4) return;
      last.copy(camera);
      stats.near = stats.mid = stats.far = 0;
      for (const { plants, dimensions, near, mid, far } of batches) {
        for (const mesh of [near, mid, far]) if (mesh) mesh.count = 0;
        for (const p of plants) {
          const dx = camera.x - p.x, dz = camera.z - p.z;
          const distanceSq = dx * dx + dz * dz + (camera.y - p.y) ** 2;
          const mesh = (distanceSq < nearLimit ** 2 && near) ||
            (distanceSq < midLimit ** 2 && mid) || far || mid || near;
          if (!mesh) continue;
          const distant = mesh === far;
          rotation.setFromAxisAngle(up, distant ? Math.atan2(dx, dz) : p.yaw);
          position.set(p.x, p.y + (distant ? dimensions.center * p.height : 0), p.z);
          size.set(p.width, p.height, p.width);
          mesh.setMatrixAt(mesh.count, matrix.compose(position, rotation, size));
          mesh.setColorAt(mesh.count++, color.setScalar(p.tint));
        }
        for (const [level, mesh] of [['near', near], ['mid', mid], ['far', far]]) {
          if (!mesh) continue;
          stats[level] += mesh.count;
          mesh.visible = mesh.count > 0;
          if (!mesh.count) continue;
          mesh.instanceMatrix.needsUpdate = mesh.instanceColor.needsUpdate = true;
        }
      }
    }

    return { stats, update, setDusk(value) {
      if (card) card.color.setRGB(1 - value * 0.28, 1 - value * 0.38, 1 - value * 0.48);
    } };
  }
  return { load, mount };
})();
