/* Offline art pack and distance detail for the Maple Street look-test block. */
RT.Maple = (function () {
  const T = THREE;
  const script = new URL(document.currentScript.src);
  const surfaces = { Brick: 'brick', PaintedBrick: 'painted_brick', Stone: 'concrete', Walk: 'concrete' };

  function loadTier(tier) {
    return new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      const url = new URL('maple-' + tier + '-data.js', script);
      url.search = script.search;
      tag.src = url.href;
      tag.onload = () => {
        const data = window.RT_MAPLE_TEXTURES;
        delete window.RT_MAPLE_TEXTURES;
        tag.remove();
        if (data) resolve(data);
        else reject(new Error('Maple Street textures are missing'));
      };
      tag.onerror = () => { tag.remove(); reject(new Error('Maple Street textures could not be loaded')); };
      document.head.append(tag);
    });
  }

  function skyTexture({ width, rgbe }, toBuffer) {
    const input = new Uint8Array(toBuffer(rgbe));
    if (input.length !== width * (width / 2) * 4) throw new Error('Invalid Maple Street sky');
    const pixels = new Uint16Array(input.length);
    for (let i = 0; i < input.length; i += 4) {
      const k = Math.pow(2, input[i + 3] - 136);
      pixels[i] = T.DataUtils.toHalfFloat((input[i] + 0.5) * k);
      pixels[i + 1] = T.DataUtils.toHalfFloat((input[i + 1] + 0.5) * k);
      pixels[i + 2] = T.DataUtils.toHalfFloat((input[i + 2] + 0.5) * k);
      pixels[i + 3] = 0x3c00; // 1.0 in half precision
    }
    const tex = new T.DataTexture(pixels, width, width / 2, T.RGBAFormat, T.HalfFloatType);
    tex.wrapS = T.RepeatWrapping;
    tex.minFilter = tex.magFilter = T.LinearFilter;
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.colorSpace = T.LinearSRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  async function load(data, tier, { toBuffer, loader, tex }) {
    const unpack = (buf) => new Response(new Blob([buf]).stream()
      .pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    const model = unpack(toBuffer(data.model)).then((buffer) => new Promise((resolve, reject) => {
      loader.parse(buffer, '', resolve, reject);
    }));
    const tierData = loadTier(tier).then(async ({ sky, ...images }) => {
      const entries = await Promise.all(Object.entries(images).map(async ([name, url]) => {
        const color = !name.endsWith('_normal') && !name.endsWith('_roughness');
        const texture = await tex(url, color, tier === 'low' ? 2 : 8);
        if (!texture) throw new Error('Invalid Maple Street texture ' + name);
        return [name, texture];
      }));
      return { sky: skyTexture(sky, toBuffer), textures: Object.fromEntries(entries) };
    });
    const [{ scene }, pack, ao] = await Promise.all([model, tierData, tex(data.pavementAO, false, 2)]);
    if (!ao) throw new Error('Invalid Maple Street sidewalk bake');
    ao.wrapS = ao.wrapT = T.ClampToEdgeWrapping;
    ao.flipY = false;
    ao.channel = 1;
    return { ...pack, model: scene, ao };
  }

  function surface(pack, name, pbr, gltf = false) {
    const tex = pack.textures;
    const params = {};
    for (const [key, suffix] of [['map', 'color'], ['normalMap', 'normal'], ['roughnessMap', 'roughness']]) {
      const img = tex[name + '_' + suffix];
      if (!img || (key !== 'map' && !pbr)) continue;
      if (gltf) {
        const clone = img.clone();
        clone.flipY = false;
        clone.needsUpdate = true;
        params[key] = clone;
      } else params[key] = img;
    }
    if (params.normalMap) params.normalScale = new T.Vector2(0.58, 0.58);
    return params;
  }

  function mount(pack, map, scene, quality) {
    const block = map.blocks.find((b) => b.bi === 1 && b.bj === 2 && b.type === 'downtown');
    if (!block || block.x1 - block.x0 !== 79.5 || block.z1 - block.z0 !== 81) return null;
    const detail = pack.model.getObjectByName('maple_details');
    const rooms = pack.model.getObjectByName('maple_rooms');
    if (!detail || !rooms || !pack.model.getObjectByName('maple_pavement')) return null;
    const oak = pack.model.getObjectByName('maple_street_oak');
    const pools = pack.model.getObjectByName('maple_light_pools');
    const converted = new Map();
    const dusk = new Map();
    const pbr = quality.pbr;
    const textureParams = {};
    pack.model.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const source = mesh.material;
      const name = source.name;
      if (!converted.has(source)) {
        const params = { color: source.color.clone(), side: T.FrontSide, vertexColors: !!mesh.geometry.attributes.color };
        const looks = { roughness: source.roughness, metalness: source.metalness };
        if (surfaces[name]) {
          const key = surfaces[name];
          textureParams[key] ??= surface(pack, key, pbr, true);
          Object.assign(params, textureParams[key]);
        }
        if (name === 'Walk') Object.assign(params, { aoMap: pack.ao, aoMapIntensity: 0.8 });
        if (name === 'Oak') {
          const leaf = pack.textures.oak.clone();
          leaf.flipY = false;
          leaf.anisotropy = 2;
          leaf.needsUpdate = true;
          Object.assign(params, { map: leaf, side: T.DoubleSide, alphaTest: 0.4 });
        }
        if (name === 'Fabric') params.side = T.DoubleSide;
        if (name === 'Glass') Object.assign(params, { transparent: true, opacity: 0.25, depthWrite: false });
        if (name === 'Room') Object.assign(params, { emissive: 0xb57942, emissiveIntensity: 0.06 });
        if (name === 'WindowLit') Object.assign(params, { emissive: 0xffc17a, emissiveIntensity: 0.15 });
        if (name === 'LampLit') Object.assign(params, { emissive: 0xffad64, emissiveIntensity: 0 });
        let mat;
        if (name === 'LightPool') {
          const [canvas, g] = RT.Build.canvas(64, 64);
          const glow = g.createRadialGradient(32, 32, 1, 32, 32, 31);
          glow.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
          glow.addColorStop(0.55, 'rgba(255, 255, 255, 0.22)');
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          g.fillStyle = glow; g.fillRect(0, 0, 64, 64);
          mat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas), color: 0xe3a25d,
            transparent: true, depthWrite: false, blending: T.AdditiveBlending });
        } else {
          mat = RT.Build.M(params, looks);
        }
        mat.name = 'Maple ' + name;
        converted.set(source, mat);
        if (params.emissive) dusk.set(mat, [params.emissiveIntensity, name === 'LampLit' ? 3.5 : name === 'Room' ? 0.52 : 1.8]);
      }
      mesh.material = converted.get(source);
      mesh.castShadow = quality.shadows && !['Room', 'WindowLit', 'Glass', 'Walk', 'LampLit', 'LightPool', 'Ridge'].includes(name);
      mesh.receiveShadow = name !== 'Glass' && name !== 'Oak';
    });
    oak?.removeFromParent();
    if (pools) pools.visible = false;
    pack.model.position.set((block.x1 + block.x0) / 2, 0, (block.z1 + block.z0) / 2);
    scene.add(pack.model);
    return {
      block,
      ridge: !!pack.model.getObjectByName('maple_ridges'),
      setDusk(f) {
        for (const [mat, [day, increase]] of dusk) mat.emissiveIntensity = day + f * increase;
        if (pools) {
          pools.visible = f > 0.025;
          pools.traverse((o) => { if (o.isMesh) o.material.opacity = f * 0.32; });
        }
      },
      update(pos) {
        const dx = Math.max(0, block.x0 - pos.x, pos.x - block.x1);
        const dz = Math.max(0, block.z0 - pos.z, pos.z - block.z1);
        const distance = Math.hypot(dx, dz, pos.y);
        detail.visible = distance < (pbr ? 80 : 32);
        rooms.visible = distance < (pbr ? 31 : 13);
      }
    };
  }

  return { load, mount, surface };
})();
