/* The live studio loads glTF assets through classic scripts so local copies also work from file URLs. */
(function () {
  'use strict';
  const T = window.THREE;
  const METRE = 1 / 0.3048;
  const contracts = {
    subject: ['Subject', 'Subject_Head', 'Subject_Eyes', 'Subject_Hair', 'Subject_Body', 'Stool'],
    light: ['Stand_Base', 'Stand_Riser', 'Stand_Baby', 'Grid_Clamp', 'Head_Yoke', 'Head', 'Softbox', 'Sandbag', 'Power_Cable'],
    tripod: ['Tripod_Legs', 'Tripod_Column', 'Head_Pan', 'Head_Tilt', 'Camera_Mount'],
    camera: ['Panasonic_Lumix_G97', 'Zoom_Lens', 'Optical_Axis', 'Camera_Hotshoe'],
    microphones: ['CStand_Base', 'CStand_Riser', 'Boom_Arm', 'Shotgun_Mic', 'Camera_Shotgun', 'Lav_Mic', 'Lav_Cable', 'Lav_Pack', 'Desk_Mic', 'Phone', 'Mic_Stand', 'Pencil_Mic']
  };
  const requests = new Map();
  const payloads = Object.create(null);
  window.STUDIO_MODEL_PAYLOADS = payloads;

  function decode(encoded) {
    if (Uint8Array.fromBase64) return Uint8Array.fromBase64(encoded).buffer;
    const bytes = atob(encoded);
    return Uint8Array.from(bytes, ch => ch.charCodeAt(0)).buffer;
  }
  function load(key, base, kind = key) {
    const address = new URL(key + '.js', base).href;
    if (requests.has(address)) return requests.get(address);
    const request = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = address;
      const cleanup = () => { delete payloads[key]; script.remove(); };
      script.onload = async () => {
        const encoded = payloads[key];
        cleanup();
        try {
          if (!encoded) throw new Error('Missing model payload');
          const { scene } = await new T.GLTFLoader().parseAsync(decode(encoded), '');
          for (const part of contracts[kind]) {
            if (!scene.getObjectByName(part)) throw new Error('Missing ' + part);
          }
          const skin = new Set();
          scene.traverse(object => {
            if (!object.isMesh) return;
            const material = object.material;
            object.castShadow = !material.transparent && !material.transmission
              && !['Light_Emitter', 'Softbox_Face'].includes(material.name);
            object.receiveShadow = !material.transparent;
            if (material.name === 'Skin' && material.isMeshPhysicalMaterial) skin.add(material);
            if (material.name === 'Cornea') catchLight(material);
            if (material.userData.studioEyeglassLens) {
              catchLight(material, .11, .14);
              material.opacity = .36;
              material.side = T.FrontSide;
            }
            if (material.userData.studioEyeglassFrame) {
              material.side = T.FrontSide;
              material.depthWrite = false;
            }
            // Fine fabric weave shimmers when it is smaller than a pixel. Keep the folds, calm the weave.
            if (material.name === 'Shirt' && material.normalScale) material.normalScale.multiplyScalar(.4);
          });
          for (const material of skin) {
            // A little warm grazing response gives the baked skin a readable edge without filling shadows.
            // The first portrait atlas needs an exposure lift. New portraits carry calibrated skin color.
            if (!material.userData.studioSkinCalibrated) material.color.setRGB(1.8, 2.0, 2.15);
            scatter(material);
            material.sheen = .14;
            material.sheenColor.setRGB(.30, .107, .064);
            material.sheenRoughness = .69;
          }
          resolve(scene);
        } catch (error) { reject(error); }
      };
      script.onerror = () => { cleanup(); reject(new Error('Could not load ' + key)); };
      document.head.append(script);
    });
    requests.set(address, request);
    request.catch(() => requests.delete(address));
    return request;
  }
  /* Skin is not a hard surface. Light enters, spreads a little under the surface and comes back out, red
     travelling furthest. So the edge of a shadow on a face is soft and slightly warm instead of a clean
     line. This adds that spread to the direct light: a wrapped falloff per colour channel, on top of the
     normal surface response. It only touches the band around the shadow edge. */
  function scatter(material) {
    material.onBeforeCompile = shader => {
      const lit = 'vec3 irradiance = dotNL * directLight.color;';
      const chunk = T.ShaderChunk.lights_physical_pars_fragment;
      if (!chunk.includes(lit)) { console.warn('Skin scattering is not available in this version of the 3D library.'); return; }
      if (material.userData.studioSkinCalibrated) {
        // A fixed shadow sampling angle keeps a screen-space dot pattern off the skin at close zoom.
        const shadows = T.ShaderChunk.shadowmap_pars_fragment.replace('interleavedGradientNoise( gl_FragCoord.xy ) * PI2', '1.17');
        shader.fragmentShader = shader.fragmentShader.replace('#include <shadowmap_pars_fragment>', shadows);
      }
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', chunk.replace(lit, lit + `
        vec3 skinReach = vec3( 0.50, 0.24, 0.13 );
        vec3 skinWrap = saturate( ( vec3( dot( geometryNormal, directLight.direction ) ) + skinReach ) / ( 1.0 + skinReach ) );
        reflectedLight.directDiffuse += ( skinWrap - vec3( dotNL ) ) * directLight.color * material.diffuseContribution * RECIPROCAL_PI * 0.9;`));
    };
    material.customProgramCacheKey = () => material.userData.studioSkinCalibrated ? 'studio-portrait-skin' : 'studio-skin-scatter';
    material.needsUpdate = true;
  }
  /* A clear optical surface adds reflections of the lamps over the surfaces behind it. */
  function catchLight(material, roughness = .045, reflectivity = 1) {
    material.color.setRGB(0, 0, 0);
    material.roughness = roughness;
    material.metalness = 0;
    material.roughnessMap = material.metalnessMap = material.map = null;
    material.transparent = true;
    material.opacity = 1;
    material.blending = T.AdditiveBlending;
    material.depthWrite = false;
    if ('specularIntensity' in material) material.specularIntensity = reflectivity;
    material.needsUpdate = true;
  }
  const part = (scene, name) => scene.getObjectByName(name).clone(true);
  function scaled(...children) {
    const group = new T.Group();
    group.scale.setScalar(METRE);
    group.add(...children);
    return group;
  }
  function aimForward(object, from, to) {
    const d = to.clone().sub(from);
    object.rotation.set(-Math.atan2(d.y, Math.hypot(d.x, d.z)), Math.atan2(d.x, d.z), 0, 'YXZ');
  }
  function ownMaterial(object, name) {
    let owned;
    object.traverse(mesh => {
      if (!mesh.isMesh || mesh.material.name !== name) return;
      owned ||= mesh.material.clone();
      mesh.material = owned;
    });
    if (!owned) throw new Error('Missing ' + name + ' material');
    return owned;
  }

  function lightFixture(model) {
    const base = part(model, 'Stand_Base');
    const upper = part(model, 'Stand_Riser');
    const lower = part(model, 'Stand_Riser');
    upper.scale.set(.84, 1, .84);
    const baby = part(model, 'Stand_Baby');
    const clamp = part(model, 'Grid_Clamp');
    const yoke = part(model, 'Head_Yoke');
    const head = yoke.getObjectByName('Head');
    const axis = head.position.y;
    const softbox = part(model, 'Softbox');
    softbox.position.set(0, 0, 0);
    head.add(softbox);
    const bag = part(model, 'Sandbag');
    bag.position.set(.35, 0, -.015);
    const cable = part(model, 'Power_Cable');
    cable.position.set(-.92, 0, -.09);
    cable.scale.x = .70;
    const floor = new T.Group();
    floor.add(base, lower, upper, bag, cable);
    const emitter = ownMaterial(head, 'Light_Emitter');
    const diffusion = ownMaterial(softbox, 'Softbox_Face');
    // The spot starts at the emitting face. An opaque cloth surface here avoids a separate
    // screen-space refraction pass and keeps the same apparent diffuser in both views.
    diffusion.transmission = 0;
    const rig = scaled(floor, baby, clamp, yoke);

    function update(light, target) {
      const headM = light.height / METRE;
      const grid = light.mount === 'grid';
      const short = !grid && headM < .72;
      // The heads would otherwise sit above the yoke when hung from the pipe.
      yoke.rotation.z = grid ? Math.PI : 0;
      yoke.position.y = headM + (grid ? axis : -axis);
      floor.visible = !grid && !short;
      baby.visible = short;
      clamp.visible = grid;
      clamp.position.y = headM + axis + .25;
      clamp.rotation.y = light.rail === 'across' ? Math.PI / 2 : 0;
      const socket = headM - axis;
      const baseScale = Math.min(1, socket / .895);
      base.scale.y = baseScale;
      const needsRiser = socket > .895;
      lower.visible = needsRiser;
      upper.visible = socket > 1.52;
      lower.position.y = Math.min(socket, 1.52) - 1;
      upper.position.y = socket - 1;
      baby.scale.y = Math.max(.65, socket / .20);
      const d = target.clone().sub(new T.Vector3(light.x, light.height, light.z));
      const yaw = Math.atan2(d.x, d.z);
      const pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z));
      yoke.rotation.order = 'YXZ';
      yoke.rotation.y = yaw;
      head.rotation.x = grid ? -pitch : pitch;
      softbox.visible = light.soft;
      const power = light.on === false ? 0 : light.level / 100;
      emitter.emissiveIntensity = light.soft ? 0 : power * 3.8;
      diffusion.emissive.setRGB(1, .974, .93);
      diffusion.emissiveIntensity = light.soft ? power * 1.55 : 0;
    }
    return { rig, update, dispose: () => { emitter.dispose(); diffusion.dispose(); } };
  }

  function cameraFixture(tripodModel, cameraModel, setLayer) {
    const assembly = tripodModel.clone(true);
    const column = assembly.getObjectByName('Tripod_Column');
    const pan = assembly.getObjectByName('Head_Pan');
    const tilt = assembly.getObjectByName('Head_Tilt');
    const mount = assembly.getObjectByName('Camera_Mount');
    const body = part(cameraModel, 'Panasonic_Lumix_G97');
    body.position.set(0, 0, 0);
    const lens = body.getObjectByName('Zoom_Lens');
    const optical = body.getObjectByName('Optical_Axis');
    const hotshoe = body.getObjectByName('Camera_Hotshoe');
    mount.add(body);
    const rig = scaled(assembly);
    rig.traverse(o => o.layers.set(setLayer));

    function update(camera, target, view) {
      const socketToLens = optical.position.y + lens.position.y;
      pan.position.y = camera.height / METRE - mount.position.y - tilt.position.y - socketToLens;
      column.position.y = pan.position.y - .75;
      const diff = target.clone().sub(new T.Vector3(camera.x, camera.height, camera.z));
      pan.rotation.y = Math.atan2(diff.x, diff.z) + T.MathUtils.degToRad(camera.pan);
      tilt.rotation.x = -Math.atan2(diff.y, Math.hypot(diff.x, diff.z)) - T.MathUtils.degToRad(camera.tilt);
      lens.scale.z = 1 + (camera.focal - 12) / 48 * .47;
      const pos = optical.getWorldPosition(new T.Vector3());
      const direction = optical.getWorldQuaternion(new T.Quaternion());
      view.position.copy(pos);
      if (camera.pan || camera.tilt) view.lookAt(pos.clone().add(new T.Vector3(0, 0, 1).applyQuaternion(direction)));
      else view.lookAt(target);
    }

    function attachMic(mic) {
      hotshoe.clear();
      if (!mic) return;
      mic.traverse(o => o.layers.set(setLayer));
      hotshoe.add(mic);
    }
    return { rig, update, attachMic };
  }

  const soundItems = {
    lav: { name: 'Lavalier', audio: 'p5-distance-lav-close' },
    boom: { name: 'Boom', audio: 'p5-distance-shotgun-close' },
    camera: { name: 'Camera shotgun', audio: 'p5-distance-shotgun-middle' },
    desk: { name: 'Desk mic', audio: 'p5-distance-close' },
    phone: { name: 'Phone', audio: 'p5-distance-middle' },
    room: { name: 'Room mic', audio: 'p5-distance-far' }
  };
  function microphones(model, face) {
    const m = (name, x, y, z) => {
      const o = part(model, name);
      o.position.set(x, y, z);
      return o;
    };
    const aim = face.clone().divideScalar(METRE);
    const kit = {};
    const lav = m('Lav_Mic', .047, 1.215, .086);
    const cord = m('Lav_Cable', .047, 1.208, .092);
    cord.scale.y = .44;
    kit.lav = scaled(lav, cord, m('Lav_Pack', .14, .84, -.036));
    const base = m('CStand_Base', -1.24, 0, .92);
    const riser = m('CStand_Riser', -1.24, 1.04, .92);
    const pivot = new T.Vector3(-1.24, 2.10, .92);
    const tip = new T.Vector3(-.05, 1.98, .24);
    const boom = m('Boom_Arm', ...pivot.toArray());
    aimForward(boom, pivot, tip);
    boom.scale.z = pivot.distanceTo(tip) / 2.24;
    const shotgun = m('Shotgun_Mic', tip.x, tip.y - .145, tip.z);
    aimForward(shotgun, shotgun.position, aim);
    kit.boom = scaled(base, riser, boom, shotgun);
    const table = 2.05 / METRE;
    kit.desk = scaled(m('Desk_Mic', .65, table, .65));
    kit.desk.children[0].rotation.y = -2.1;
    kit.phone = scaled(m('Phone', .968, table, .69));
    kit.phone.children[0].rotation.y = -.39;
    const room = m('Mic_Stand', 2.31, 0, 2.58);
    const pencil = m('Pencil_Mic', room.position.x, 1.75, room.position.z);
    aimForward(pencil, pencil.position, aim);
    kit.room = scaled(room, pencil);
    for (const [key, item] of Object.entries(kit)) {
      item.name = soundItems[key].name;
      item.visible = false;
    }
    return { kit, camera: () => part(model, 'Camera_Shotgun') };
  }

  window.StudioModels = { load, scaled, lightFixture, cameraFixture, microphones, soundItems };
})();
