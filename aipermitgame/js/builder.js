/* Geometry batching and procedural textures.
 * The whole town is merged into a few big meshes so it runs smoothly on school Chromebooks. */
RT.Build = (function () {
  const T = THREE;
  // Material factory: physically based (reflects the sky) on High/Normal, cheap Lambert on Low.
  let pbr = true;
  function setPBR(v) { pbr = v; }
  function M(params, look) {
    if (!pbr) { const p = { ...params }; return new T.MeshLambertMaterial(p); }
    return new T.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...params, ...(look || {}) });
  }
  const tmpColor = new T.Color();

  // Collects many small pieces of geometry (each with its own colour) into one mesh.
  class Batch {
    constructor() { this.pos = []; this.nor = []; this.uv = []; this.col = []; }
    addGeometry(geom, matrix, color) {
      const g = geom.index ? geom.toNonIndexed() : geom.clone();
      g.applyMatrix4(matrix);
      const p = g.attributes.position.array, n = g.attributes.normal.array;
      const uv = g.attributes.uv ? g.attributes.uv.array : null;
      tmpColor.set(color);
      for (let k = 0; k < p.length / 3; k++) {
        this.pos.push(p[k * 3], p[k * 3 + 1], p[k * 3 + 2]);
        this.nor.push(n[k * 3], n[k * 3 + 1], n[k * 3 + 2]);
        if (uv) this.uv.push(uv[k * 2], uv[k * 2 + 1]); else this.uv.push(0.01, 0.01);
        this.col.push(tmpColor.r, tmpColor.g, tmpColor.b);
      }
      g.dispose();
    }
    // Append geometry that already carries vertex colours (e.g. a merged vehicle).
    addColored(geom, matrix) {
      const g = geom.clone(); g.applyMatrix4(matrix);
      const p = g.attributes.position.array, n = g.attributes.normal.array, c = g.attributes.color.array;
      const uv = g.attributes.uv ? g.attributes.uv.array : null;
      for (let k = 0; k < p.length / 3; k++) {
        this.pos.push(p[k * 3], p[k * 3 + 1], p[k * 3 + 2]); this.nor.push(n[k * 3], n[k * 3 + 1], n[k * 3 + 2]);
        if (uv) this.uv.push(uv[k * 2], uv[k * 2 + 1]); else this.uv.push(0.01, 0.01);
        this.col.push(c[k * 3], c[k * 3 + 1], c[k * 3 + 2]);
      }
      g.dispose();
    }
    // Raw triangle soup: verts [[x,y,z],...], normal per triangle computed automatically.
    addTris(verts, color, uvs, shade) {
      tmpColor.set(color);
      for (let k = 0; k < verts.length; k += 3) {
        const a = verts[k], b = verts[k + 1], c = verts[k + 2];
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
        const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
        for (let m = 0; m < 3; m++) {
          const v = verts[k + m];
          this.pos.push(v[0], v[1], v[2]); this.nor.push(nx, ny, nz);
          if (uvs) this.uv.push(uvs[k + m][0], uvs[k + m][1]); else this.uv.push(0.01, 0.01);
          const sh = shade ? shade[k + m] : 1;
          this.col.push(tmpColor.r * sh, tmpColor.g * sh, tmpColor.b * sh);
        }
      }
    }
    // Flat rectangle with world-space texture coordinates (for tiled ground textures).
    rectUV(x0, z0, x1, z1, y, color, scale) {
      const uv = (x, z) => [x / scale, z / scale];
      this.addTris([[x0, y, z0], [x0, y, z1], [x1, y, z1], [x0, y, z0], [x1, y, z1], [x1, y, z0]], color,
        [uv(x0, z0), uv(x0, z1), uv(x1, z1), uv(x0, z0), uv(x1, z1), uv(x1, z0)]);
    }
    // Flat rectangle on the ground at height y.
    rect(x0, z0, x1, z1, y, color) {
      this.addTris([[x0, y, z0], [x0, y, z1], [x1, y, z1], [x0, y, z0], [x1, y, z1], [x1, y, z0]], color);
    }
    // Axis-aligned box with optional separate top colour and tiled UVs on the walls
    // (used by the window texture on buildings).
    box(cx, y0, cz, w, h, d, color, opts = {}) {
      const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, y1 = y0 + h;
      const top = opts.top || color;
      const tu = opts.tileU || 0, tv = opts.tileV || 0, vOff = opts.vOff || 0;
      // darken the bottom of each wall a little: cheap ambient occlusion that grounds buildings
      const a = 1 - (opts.ao === undefined ? 0 : opts.ao);
      const shade = a < 1 ? [a, a, 1, a, 1, 1] : null;
      const uOff = opts.uOff || 0;
      const wall = (ax, az, bx, bz, len) => {
        const verts = [[ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y0, az], [bx, y1, bz], [ax, y1, az]];
        if (!tu) { this.addTris(verts, color, null, shade); return; }
        const u1 = len / tu + uOff, v1 = h / tv;
        this.addTris(verts, color, [[uOff, vOff], [u1, vOff], [u1, v1 + vOff], [uOff, vOff], [u1, v1 + vOff], [uOff, v1 + vOff]], shade);
      };
      wall(x0, z1, x1, z1, w); // south
      wall(x1, z0, x0, z0, w); // north
      wall(x1, z1, x1, z0, d); // east
      wall(x0, z0, x0, z1, d); // west
      if (!opts.noTop) {
        const topVerts = [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x0, y1, z0], [x1, y1, z1], [x1, y1, z0]];
        if (opts.topUV) this.addTris(topVerts, top, topVerts.map((v) => [v[0] / opts.topUV, v[2] / opts.topUV]));
        else this.addTris(topVerts, top);
      }
    }
    // Rotated box (any angle) built from a BoxGeometry.
    rbox(cx, cy, cz, w, h, d, rotY, color) {
      const m = new T.Matrix4().makeRotationY(rotY).setPosition(cx, cy, cz);
      const g = new T.BoxGeometry(w, h, d);
      this.addGeometry(g, m, color); g.dispose();
    }
    cyl(cx, y0, cz, r, h, color, seg = 8, rTop) {
      const g = new T.CylinderGeometry(rTop === undefined ? r : rTop, r, h, seg);
      this.addGeometry(g, new T.Matrix4().setPosition(cx, y0 + h / 2, cz), color); g.dispose();
    }
    // Pitched (gable) roof running along x or z.
    gable(cx, y0, cz, w, d, h, alongX, color) {
      const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, y1 = y0 + h;
      if (alongX) {
        const zm = cz;
        this.addTris([
          [x0, y0, z1], [x1, y0, z1], [x1, y1, zm], [x0, y0, z1], [x1, y1, zm], [x0, y1, zm],
          [x1, y0, z0], [x0, y0, z0], [x0, y1, zm], [x1, y0, z0], [x0, y1, zm], [x1, y1, zm],
          [x0, y0, z0], [x0, y0, z1], [x0, y1, zm], [x1, y0, z1], [x1, y0, z0], [x1, y1, zm]
        ], color);
      } else {
        const xm = cx;
        this.addTris([
          [x1, y0, z1], [x1, y0, z0], [xm, y1, z0], [x1, y0, z1], [xm, y1, z0], [xm, y1, z1],
          [x0, y0, z0], [x0, y0, z1], [xm, y1, z1], [x0, y0, z0], [xm, y1, z1], [xm, y1, z0],
          [x0, y0, z1], [x1, y0, z1], [xm, y1, z1], [x1, y0, z0], [x0, y0, z0], [xm, y1, z0]
        ], color);
      }
    }
    build(material) {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(this.pos, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(this.nor, 3));
      g.setAttribute('uv', new T.Float32BufferAttribute(this.uv, 2));
      g.setAttribute('color', new T.Float32BufferAttribute(this.col, 3));
      g.computeBoundingSphere();
      return new T.Mesh(g, material);
    }
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return [c, c.getContext('2d')];
  }
  function toTexture(c, repeat) {
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; }
    return t;
  }

  // White wall with a dark window; tinted per-building through vertex colours.
  function windowTexture() {
    const [c, g] = canvas(128, 128);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#5d6f86'; g.fillRect(26, 30, 76, 66);
    const grad = g.createLinearGradient(26, 30, 102, 96);
    grad.addColorStop(0, 'rgba(255,255,255,0.35)'); grad.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(26, 30, 76, 66);
    g.fillStyle = '#e9e9e9'; g.fillRect(22, 96, 84, 6);
    // a tiny solid patch in the corner is used for roofs and plain walls
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 4, 4);
    return toTexture(c, true);
  }

  function grassTexture() {
    const [c, g] = canvas(512, 512);
    g.fillStyle = '#7aae63'; g.fillRect(0, 0, 512, 512);
    const rnd = RT.U.seeded(7);
    // soft mottling so lawns are not one flat colour
    for (let k = 0; k < 70; k++) {
      const x = rnd() * 512, y = rnd() * 512, r = 30 + rnd() * 90;
      const gr = g.createRadialGradient(x, y, 2, x, y, r);
      const light = rnd() < 0.5;
      gr.addColorStop(0, light ? 'rgba(170,205,110,0.22)' : 'rgba(60,110,50,0.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let k = 0; k < 9000; k++) {
      const v = rnd();
      g.fillStyle = v < 0.45 ? 'rgba(55,105,40,0.22)' : v < 0.9 ? 'rgba(185,215,135,0.2)' : 'rgba(230,220,120,0.25)';
      g.fillRect(rnd() * 512, rnd() * 512, 1.5 + rnd() * 2.5, 1.5 + rnd() * 2.5);
    }
    g.strokeStyle = 'rgba(70,120,45,0.25)'; g.lineWidth = 1;
    for (let k = 0; k < 2500; k++) { const x = rnd() * 512, y = rnd() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 4); g.stroke(); }
    const t = toTexture(c, true);
    t.anisotropy = 8;
    return t;
  }

  function signTexture(kind, text) {
    const [c, g] = canvas(256, 256);
    if (kind === 'stop') {
      g.clearRect(0, 0, 256, 256);
      const oct = (r, fill) => {
        g.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = Math.PI / 8 + k * Math.PI / 4;
          g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r);
        }
        g.closePath(); g.fillStyle = fill; g.fill();
      };
      oct(126, '#ffffff'); oct(116, '#c8102e');
      g.fillStyle = '#fff'; g.font = 'bold 76px Arial, Helvetica, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOP', 128, 132);
    } else if (kind === 'speed') {
      g.fillStyle = '#111'; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#fff'; g.fillRect(14, 8, 228, 240);
      g.fillStyle = '#111'; g.textAlign = 'center';
      g.font = 'bold 44px Arial, Helvetica, sans-serif'; g.fillText('SPEED', 128, 58); g.fillText('LIMIT', 128, 104);
      g.font = 'bold 120px Arial, Helvetica, sans-serif'; g.fillText(text, 128, 222);
    } else if (kind === 'banner') {
      // generic wide sign: text = [title, subtitle, bg, fg]
      const [cc, gg] = canvas(512, 128);
      gg.fillStyle = text[2]; gg.fillRect(0, 0, 512, 128);
      gg.strokeStyle = text[3]; gg.lineWidth = 6; gg.strokeRect(8, 8, 496, 112);
      gg.fillStyle = text[3]; gg.textAlign = 'center'; gg.textBaseline = 'middle';
      gg.font = 'bold 54px Arial, Helvetica, sans-serif'; gg.fillText(text[0], 256, text[1] ? 50 : 66);
      if (text[1]) { gg.font = 'bold 26px Arial, Helvetica, sans-serif'; gg.fillText(text[1], 256, 98); }
      return toTexture(cc);
    } else if (kind === 'plaque') {
      const [cc, gg] = canvas(256, 104);
      gg.fillStyle = '#111'; gg.fillRect(0, 0, 256, 104);
      gg.fillStyle = '#fff'; gg.fillRect(6, 6, 244, 92);
      gg.fillStyle = '#111'; gg.textAlign = 'center'; gg.font = 'bold 30px Arial, Helvetica, sans-serif';
      gg.fillText('CROSS TRAFFIC', 128, 46); gg.fillText('DOES NOT STOP', 128, 82);
      return toTexture(cc);
    } else if (kind === 'student') {
      const [cc, gg] = canvas(256, 64);
      gg.fillStyle = '#ffd23f'; gg.fillRect(0, 0, 256, 64);
      gg.fillStyle = '#1b1b1b'; gg.textAlign = 'center'; gg.textBaseline = 'middle';
      gg.font = 'bold 30px Arial, Helvetica, sans-serif'; gg.fillText('STUDENT DRIVER', 128, 34);
      return toTexture(cc);
    } else if (kind === 'overlook') {
      g.fillStyle = '#5b3a1e'; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#fff'; g.fillRect(10, 10, 236, 236);
      g.fillStyle = '#5b3a1e'; g.fillRect(16, 16, 224, 224);
      g.fillStyle = '#fff'; g.textAlign = 'center';
      g.beginPath(); g.arc(96, 104, 30, 0, Math.PI * 2); g.arc(160, 104, 30, 0, Math.PI * 2); g.fill();
      g.fillRect(96, 74, 64, 30);
      g.fillStyle = '#5b3a1e'; g.beginPath(); g.arc(96, 104, 16, 0, Math.PI * 2); g.arc(160, 104, 16, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 30px Arial, Helvetica, sans-serif';
      g.fillText('SCENIC', 128, 178); g.fillText('OVERLOOK', 128, 214);
    }
    return toTexture(c);
  }


  // ---------- surface textures ----------
  function noise(g, w, h, n, rnd, colors, smin, smax) {
    for (let k = 0; k < n; k++) { g.fillStyle = colors[Math.floor(rnd() * colors.length)]; const s = smin + rnd() * (smax - smin); g.fillRect(rnd() * w, rnd() * h, s, s); }
  }
  function asphaltTexture() {
    const [c, g] = canvas(512, 512);
    const rnd = RT.U.seeded(11);
    g.fillStyle = '#656b73'; g.fillRect(0, 0, 512, 512);
    // patches of older / newer asphalt
    for (let k = 0; k < 14; k++) { g.fillStyle = rnd() < 0.5 ? 'rgba(40,44,50,0.07)' : 'rgba(120,124,130,0.06)'; g.beginPath(); g.ellipse(rnd() * 512, rnd() * 512, 30 + rnd() * 90, 20 + rnd() * 60, rnd() * 3, 0, Math.PI * 2); g.fill(); }
    noise(g, 512, 512, 9000, rnd, ['rgba(30,32,36,0.35)', 'rgba(150,152,158,0.30)', 'rgba(90,94,100,0.4)'], 1, 2.6);
    g.strokeStyle = 'rgba(25,27,30,0.35)'; g.lineWidth = 1.4;
    for (let k = 0; k < 7; k++) { g.beginPath(); let x = rnd() * 512, y = rnd() * 512; g.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
    return toTexture(c, true);
  }
  function concreteTexture() {
    const [c, g] = canvas(256, 256);
    const rnd = RT.U.seeded(12);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
    noise(g, 256, 256, 2600, rnd, ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.08)', 'rgba(255,255,255,0.5)'], 1, 3);
    g.fillStyle = 'rgba(0,0,0,0.16)';
    for (let k = 0; k <= 256; k += 128) { g.fillRect(k - 1, 0, 2, 256); g.fillRect(0, k - 1, 256, 2); }
    g.fillStyle = '#c2bcb0'; g.fillRect(0, 0, 4, 4); // curb sides sample this corner
    return toTexture(c, true);
  }
  function cloudTexture() {
    const [c, g] = canvas(256, 128);
    const rnd = RT.U.seeded(5);
    for (let k = 0; k < 16; k++) {
      const x = 50 + rnd() * 156, y = 64 + (rnd() - 0.3) * 30, r = 22 + rnd() * 30;
      const grad = g.createRadialGradient(x, y, 2, x, y, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  // ---------- facade textures (one tile = one window bay, tinted by vertex colour) ----------
  function facade(style) {
    const [c, g] = canvas(128, 128);
    const rnd = RT.U.seeded(style.length * 31);
    if (style === 'glass') {
      const grad = g.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, '#d7e6f2'); grad.addColorStop(0.55, '#8fa9c2'); grad.addColorStop(1, '#6b86a3');
      g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(60, 0); g.lineTo(0, 90); g.fill();
      g.fillStyle = '#e9eef2'; g.fillRect(0, 0, 128, 6); g.fillRect(0, 0, 5, 128); g.fillRect(0, 118, 128, 10);
    } else if (style === 'brick') {
      g.fillStyle = '#f2ece6'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(0,0,0,0.07)';
      for (let y = 0; y < 128; y += 8) { g.fillRect(0, y, 128, 1); for (let x = (y / 8) % 2 ? 0 : 8; x < 128; x += 16) g.fillRect(x, y, 1, 8); }
      g.fillStyle = '#ffffff'; g.fillRect(30, 26, 68, 74);
      const gr = g.createLinearGradient(34, 30, 94, 96); gr.addColorStop(0, '#5f7894'); gr.addColorStop(1, '#2f3f52');
      g.fillStyle = gr; g.fillRect(35, 31, 58, 64);
      g.fillStyle = '#ffffff'; g.fillRect(62, 31, 4, 64); g.fillRect(35, 58, 58, 3);
      g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(37, 33, 20, 22);
      g.fillStyle = '#e4ddd4'; g.fillRect(26, 100, 76, 6);
    } else if (style === 'siding') {
      g.fillStyle = '#f7f4ef'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 4; y < 128; y += 9) g.fillRect(0, y, 128, 2);
      g.fillStyle = '#ffffff'; g.fillRect(36, 34, 56, 58);
      g.fillStyle = '#3d5168'; g.fillRect(41, 39, 46, 48);
      g.fillStyle = '#ffffff'; g.fillRect(62, 39, 4, 48); g.fillRect(41, 61, 46, 3);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(24, 34, 10, 58); g.fillRect(94, 34, 10, 58);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(43, 41, 16, 18);
    } else if (style === 'store') {
      g.fillStyle = '#f5f1ea'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = '#ffffff'; g.fillRect(0, 14, 128, 20); // sign band
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 34, 128, 3);
      const gr = g.createLinearGradient(0, 40, 0, 128); gr.addColorStop(0, '#9db4c8'); gr.addColorStop(1, '#4b6178');
      g.fillStyle = gr; g.fillRect(8, 42, 112, 86);
      g.fillStyle = '#2a2f36'; g.fillRect(8, 42, 112, 3); g.fillRect(62, 42, 4, 86); g.fillRect(8, 42, 3, 86); g.fillRect(117, 42, 3, 86);
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(12, 46); g.lineTo(40, 46); g.lineTo(12, 90); g.fill();
    }
    void rnd;
    g.fillStyle = style === 'glass' ? '#e9eef2' : '#ffffff'; g.fillRect(0, 0, 4, 4);
    const t = toTexture(c, true);
    t.generateMipmaps = true;
    return t;
  }

  // White where the windows are: used as an emissive map so windows glow warm at sunset.
  function facadeMask(style) {
    const [c, g] = canvas(128, 128);
    g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#fff';
    if (style === 'glass') { g.globalAlpha = 0.55; g.fillRect(5, 6, 123, 112); }
    else if (style === 'brick') { g.fillRect(35, 31, 27, 27); g.fillRect(66, 31, 27, 27); g.fillRect(35, 61, 27, 34); g.fillRect(66, 61, 27, 34); }
    else if (style === 'siding') { g.fillRect(41, 39, 21, 22); g.fillRect(66, 39, 21, 22); g.fillRect(41, 64, 21, 23); g.fillRect(66, 64, 21, 23); }
    else if (style === 'store') { g.fillRect(11, 45, 51, 83); g.fillRect(66, 45, 51, 83); g.globalAlpha = 0.6; g.fillRect(0, 14, 128, 20); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  return { M, setPBR, facadeMask, Batch, windowTexture, grassTexture, signTexture, canvas, toTexture, asphaltTexture, concreteTexture, cloudTexture, facade };
})();
