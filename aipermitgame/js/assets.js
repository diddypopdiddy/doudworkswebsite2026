/* Loads the Blender-made models and baked textures (embedded in js/assets-data.js) and
 * provides helpers to draw many copies cheaply (merged by material, then instanced). */
RT.loadAssets = function (tier) {
  const T = THREE;
  const D = window.RT_ASSET_DATA;
  if (!D || !T.GLTFLoader) return Promise.resolve(null);
  const toBuffer = (b64) => { const s = atob(b64); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; };
  const loader = new T.GLTFLoader();
  const parse = (b64) => new Promise((res, rej) => loader.parse(toBuffer(b64), '', res, rej));
  const tex = (url, srgb, anisotropy = 8) => new Promise((res) => {
    new T.TextureLoader().load(url, (t) => {
      t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = anisotropy;
      t.colorSpace = srgb ? T.SRGBColorSpace : T.NoColorSpace;
      res(t);
    }, undefined, () => res(null));
  });
  const facadeJobs = Object.entries(D.facades).map(([style, f]) =>
    Promise.all([tex(f.map, true), tex(f.normal, false), tex(f.ao, false), tex(f.mask, true)]).then(([map, normal, ao, mask]) => [style, { map, normal, ao, mask }]));
  const maple = D.maple && RT.Maple && typeof DecompressionStream === 'function'
    ? RT.Maple.load(D.maple, tier, { toBuffer, loader, tex }).catch((err) => {
      console.warn('Maple Street art could not load. Using the original block.', err);
      return null;
    }) : null;
  const walkers = parse(D.people).catch((err) => {
    console.warn('Pedestrian models could not load.', err);
    return null;
  });
  const foliage = D.foliage ? RT.Foliage.load(D.foliage, tier, { toBuffer, loader, tex }) : null;
  return Promise.all([parse(D.vehicles), walkers, parse(D.town), Promise.all(facadeJobs), maple, foliage])
    .then(([vehicles, people, town, facades, maplePack, foliagePack]) => {
      const A = { vehicles: vehicles.scene, people: people?.scene, peopleClips: people?.animations || [],
        town: town.scene, facades: Object.fromEntries(facades), maple: maplePack, foliage: foliagePack };
      for (const s of [A.vehicles, A.people, A.town]) s?.updateMatrixWorld(true);
      RT.ASSETS = A;
      delete window.RT_ASSET_DATA;
      return A;
    });
};

RT.Kit = (function () {
  const T = THREE;

  /** Merge every mesh under `root` (optionally filtered) by material, in root space.
   *  Returns [{ material, geometry }]. Only position + normal are kept (models are untextured). */
  function mergeByMaterial(root, filter, relativeTo) {
    const inv = new T.Matrix4().copy((relativeTo || root).matrixWorld).invert();
    const groups = new Map();
    root.traverse((o) => {
      if (!o.isMesh || (filter && !filter(o))) return;
      const m = new T.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(m);
      const key = o.material.name || o.material.uuid;
      if (!groups.has(key)) groups.set(key, { material: o.material, parts: [] });
      groups.get(key).parts.push(g);
    });
    const out = [];
    for (const { material, parts } of groups.values()) {
      let n = 0; for (const g of parts) n += g.attributes.position.count;
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
      let o = 0;
      for (const g of parts) {
        pos.set(g.attributes.position.array, o * 3);
        if (g.attributes.normal) nor.set(g.attributes.normal.array, o * 3);
        o += g.attributes.position.count; g.dispose();
      }
      const geom = new T.BufferGeometry();
      geom.setAttribute('position', new T.BufferAttribute(pos, 3));
      geom.setAttribute('normal', new T.BufferAttribute(nor, 3));
      geom.computeBoundingSphere();
      out.push({ material, geometry: geom });
    }
    return out;
  }

  // Swap a glTF material for one made by our factory (keeps the colour, applies a look).
  function convert(material, look, opts) {
    const p = { color: material.color ? material.color.clone() : new T.Color(1, 1, 1), vertexColors: !!material.vertexColors };
    if (opts && opts.white) p.color.set(0xffffff);
    if (material.emissive && material.emissiveIntensity && material.emissive.getHex() !== 0) { p.emissive = material.emissive.clone(); p.emissiveIntensity = 0; }
    const m = RT.Build.M(p, look || { roughness: material.roughness !== undefined ? material.roughness : 0.7, metalness: material.metalness || 0 });
    m.name = material.name;
    return m;
  }

  /**
   * A set of identical objects drawn with InstancedMesh, one per material.
   * tint: { MaterialName: true } materials coloured per instance (base made white).
   */
  function instanced(scene, merged, count, opts = {}) {
    const parts = merged.map(({ material, geometry }) => {
      const tinted = !!(opts.tint && opts.tint[material.name]);
      const mat = convert(material, opts.looks && opts.looks[material.name], { white: tinted });
      const im = new T.InstancedMesh(geometry, mat, count);
      im.castShadow = !!opts.shadows && (!opts.shadowMaterials || opts.shadowMaterials.includes(material.name));
      im.receiveShadow = !!opts.receive;
      im.frustumCulled = false;
      if (tinted) im.setColorAt(0, new T.Color(1, 1, 1));
      if (opts.dynamic) {
        im.instanceMatrix.setUsage(T.DynamicDrawUsage);
        if (im.instanceColor) im.instanceColor.setUsage(T.DynamicDrawUsage);
      }
      scene.add(im);
      return { im, name: material.name, tinted };
    });
    const tmp = new T.Color();
    return {
      parts,
      setCount(count) { for (const p of parts) { p.im.count = count; p.im.visible = count > 0; } },
      setMatrix(i, m) { for (const p of parts) p.im.setMatrixAt(i, m); },
      setColor(i, name, c) { for (const p of parts) if (p.name === name && p.tinted) p.im.setColorAt(i, tmp.set(c)); },
      commit() { for (const p of parts) { p.im.instanceMatrix.needsUpdate = true; if (p.im.instanceColor) p.im.instanceColor.needsUpdate = true; } },
      material(name) { const p = parts.find((q) => q.name === name); return p && p.im.material; }
    };
  }

  const find = (root, name) => { let r = null; root.traverse((o) => { if (!r && o.name === name) r = o; }); return r; };

  // Geometry of one glTF object, positioned as if it stood at the origin facing +Z.
  const ORIGIN = new T.Object3D();
  function mergeAtOrigin(obj, filter) {
    const keep = obj.position.clone();
    obj.position.set(0, 0, 0); obj.updateMatrixWorld(true);
    const out = mergeByMaterial(obj, filter, ORIGIN);
    obj.position.copy(keep); obj.updateMatrixWorld(true);
    return out;
  }
  const isUnder = (o, name) => { for (let p = o; p; p = p.parent) if (p.name && p.name.indexOf(name) >= 0) return true; return false; };

  return { mergeByMaterial, mergeAtOrigin, instanced, convert, find, isUnder };
})();
