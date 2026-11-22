/* Sky dome, clouds and time of day. The sun moves from morning toward golden hour as
 * the driver logs practice hours. */
RT.createSky = function (scene, sun, hemi, photo) {
  const T = THREE;
  const C = (h) => new T.Color(h);

  const uniforms = {
    topColor: { value: C(0x4f97e0) }, horizonColor: { value: C(0xcfe8ff) }, groundColor: { value: C(0xa9b8a0) },
    sunDir: { value: new T.Vector3(0, 1, 0) }, sunColor: { value: C(0xfff3d6) },
    skyPhoto: { value: photo || null }, skyBalance: { value: new T.Vector3(1, 1, 1) }
  };
  const mat = new T.ShaderMaterial({
    defines: photo ? { MAPLE_PHOTO_SKY: 1 } : {},
    uniforms, side: T.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 topColor, horizonColor, groundColor, sunDir, sunColor; varying vec3 vDir;
      uniform sampler2D skyPhoto;
      uniform vec3 skyBalance;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = h > 0.0 ? mix(horizonColor, topColor, pow(smoothstep(0.0, 0.62, h), 0.8)) : mix(horizonColor, groundColor, smoothstep(0.0, -0.2, h));
        #ifdef MAPLE_PHOTO_SKY
        vec2 uv = vec2(atan(d.z, d.x) * 0.15915494 + 0.5, asin(clamp(h, -1.0, 1.0)) * 0.31830989 + 0.5);
        vec3 sky = texture2D(skyPhoto, uv).rgb * skyBalance;
        col = mix(col, sky, smoothstep(-0.045, 0.21, h) * 0.92);
        #endif
        float s = max(dot(d, normalize(sunDir)), 0.0);
        col += sunColor * (pow(s, 900.0) * 3.0 + pow(s, 40.0) * 0.28 + pow(s, 6.0) * 0.12);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const dome = new T.Mesh(new T.SphereGeometry(1500, 32, 16), mat);
  // a small copy of the sky (same shader) used to bake reflections / ambient light
  const envScene = new T.Scene();
  envScene.add(new T.Mesh(new T.SphereGeometry(50, 32, 16), mat));
  let pmrem = null, envRT = null, envAt = -1, ambientScale = 1;
  dome.renderOrder = -2;
  scene.add(dome);

  // clouds
  const cloudTex = RT.Build.cloudTexture();
  const clouds = new T.Group();
  const rnd = RT.U.seeded(77);
  const cloudMats = [];
  for (let k = 0; !photo && k < 28; k++) {
    const m = new T.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.75 + rnd() * 0.2 });
    cloudMats.push(m);
    const sp = new T.Sprite(m);
    const a = rnd() * Math.PI * 2, r = 650 + rnd() * 550;
    sp.position.set(Math.cos(a) * r, 190 + rnd() * 170, Math.sin(a) * r);
    const sc = 220 + rnd() * 260;
    sp.scale.set(sc, sc * (0.32 + rnd() * 0.15), 1);
    clouds.add(sp);
  }
  scene.add(clouds);

  // keyframes across the drive (t = 0 morning ... 1 golden hour)
  const KEYS = [
    { t: 0.0, el: 20, az: 105, sun: 0xffe0b5, si: 2.0, hs: 0xd6e6f5, hg: 0x6c7d52, hi: 1.25, top: 0x6aa6dc, hor: 0xf2e4d2, ground: 0xb7b39c, cloud: 0xfff1e2 },
    { t: 0.35, el: 58, az: 165, sun: 0xfff5e6, si: 2.5, hs: 0xdcefff, hg: 0x6a8a4a, hi: 1.35, top: 0x4b93df, hor: 0xcfe6fb, ground: 0xa9b8a0, cloud: 0xffffff },
    { t: 0.7, el: 36, az: 215, sun: 0xffeccc, si: 2.3, hs: 0xdbe9f5, hg: 0x6a8048, hi: 1.3, top: 0x5698dd, hor: 0xe0eaf0, ground: 0xaab39a, cloud: 0xfffaf2 },
    { t: 1.0, el: 11, az: 255, sun: 0xffb36b, si: 2.2, hs: 0xf5d8bd, hg: 0x5d5a45, hi: 1.05, top: 0x5c7fbf, hor: 0xffc690, ground: 0xb59a7e, cloud: 0xffd2b0 }
  ];
  const sunDir = new T.Vector3();
  const tmpA = new T.Color(), tmpB = new T.Color();
  const lerpC = (a, b, f) => tmpA.set(a).lerp(tmpB.set(b), f).clone();
  let current = -1;
  let environmentIntensity = 0;

  function setTime(t) {
    t = Math.max(0, Math.min(1, t));
    if (Math.abs(t - current) < 0.0005) return;
    current = t;
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const f = (t - a.t) / (b.t - a.t);
    const el = (a.el + (b.el - a.el) * f) * Math.PI / 180, az = (a.az + (b.az - a.az) * f) * Math.PI / 180;
    sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
    sun.color.copy(lerpC(a.sun, b.sun, f));
    sun.intensity = a.si + (b.si - a.si) * f;
    hemi.color.copy(lerpC(a.hs, b.hs, f));
    hemi.groundColor.copy(lerpC(a.hg, b.hg, f));
    hemi.intensity = (a.hi + (b.hi - a.hi) * f) * ambientScale;
    uniforms.topColor.value.copy(lerpC(a.top, b.top, f));
    uniforms.horizonColor.value.copy(lerpC(a.hor, b.hor, f));
    uniforms.groundColor.value.copy(lerpC(a.ground, b.ground, f));
    uniforms.sunDir.value.copy(sunDir);
    uniforms.sunColor.value.copy(lerpC(a.sun, b.sun, f));
    if (photo) {
      const late = Math.max(0, (t - 0.65) / 0.35);
      const noon = Math.sin(t * Math.PI);
      uniforms.skyBalance.value.set(0.84 + noon * 0.12, 0.85 - late * 0.27, 0.92 - late * 0.45);
      if (environmentIntensity) scene.environmentIntensity = environmentIntensity * (1 - late * 0.32);
    }
    if (scene.fog) scene.fog.color.copy(uniforms.horizonColor.value);
    scene.background = uniforms.horizonColor.value.clone();
    const cc = lerpC(a.cloud, b.cloud, f);
    for (const m of cloudMats) m.color.copy(cc);
  }

  // Turn on sky reflections for physically based materials.
  function enableEnvironment(renderer, intensity) {
    pmrem = new T.PMREMGenerator(renderer);
    ambientScale = photo ? 0.56 : 0.4;
    environmentIntensity = intensity;
    scene.environmentIntensity = environmentIntensity;
    const c = current; current = -1; setTime(c);
    if (photo) {
      envRT = pmrem.fromEquirectangular(photo);
      scene.environment = envRT.texture;
      pmrem.dispose();
      pmrem = null;
      return;
    }
    rebakeEnv(true);
  }
  function rebakeEnv(force) {
    if (!pmrem || (!force && Math.abs(current - envAt) < 0.03)) return;
    envAt = current;
    const old = envRT;
    envRT = pmrem.fromScene(envScene, 0.02, 0.1, 200);
    scene.environment = envRT.texture;
    if (old) old.dispose();
  }

  function update(dt, cameraPos) {
    rebakeEnv(false);
    dome.position.copy(cameraPos);
    clouds.position.set(cameraPos.x * 0.9, 0, cameraPos.z * 0.9);
    clouds.rotation.y += dt * 0.004;
  }

  setTime(0);
  return { setTime, update, enableEnvironment, sunDir, get time() { return current; } };
};
