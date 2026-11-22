import * as THREE from "../../vendor/three.module.js";
import { esc, scope, loadJSON, isSmallScreen, reducedMotion, clamp, announce, replaceDetailAddress } from "../util.js";

/* The gallery: two simple white-brick rooms with storefront windows onto the street.
   Thirteen pieces hang where they hang in the real layout, at their real sizes.
   Drag to turn (left and right only), WASD/arrows to walk, click a piece to open it. Wall view lists everything flat. */

const EYE = 1.62;
const R = 0.32; // body radius for collisions
// Interior wall surfaces (meters). Main room + the Flag room through a doorway.
const MAIN = { x0: -2.64, x1: 2.64, z0: -2.94, z1: 2.94 };
const FLAG = { x0: 2.86, x1: 6.3, z0: -1.72, z1: 2.33 };
const DOOR = { z0: -0.84, z1: 0.84, top: 2.3 };
const BENCH = { x0: -1.625, x1: -0.275, z0: 1.99, z1: 2.41 };
const CEIL = 2.8;

const art = (i, size = 1600) => `assets/art/detail${size}-${i}.webp`;
const thumb = (i) => `assets/art/thumb-${i}.webp`;
const meta = (a) => [a.medium || a.category, a.year, a.dimensions].filter(Boolean).join(" · ");

/* ---------- procedural textures ---------- */
function brickTextures() {
  const W = 1024, H = 512, cols = 5, rows = 5, bw = W / cols, bh = H / rows, m = 7;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const b = document.createElement("canvas"); b.width = W; b.height = H;
  const g = c.getContext("2d"), gb = b.getContext("2d");
  g.fillStyle = "#d9d3c9"; g.fillRect(0, 0, W, H);
  gb.fillStyle = "#3a3a3a"; gb.fillRect(0, 0, W, H);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? bw / 2 : 0;
    for (let k = -1; k <= cols; k++) {
      const x = k * bw + off, y = r * bh;
      const l = 93 + rnd() * 4;
      const grd = g.createLinearGradient(x, y, x, y + bh);
      grd.addColorStop(0, `hsl(40 18% ${l + 1.5}%)`); grd.addColorStop(1, `hsl(38 14% ${l - 1.5}%)`);
      g.fillStyle = grd;
      g.beginPath(); g.roundRect(x + m / 2, y + m / 2, bw - m, bh - m, 6); g.fill();
      gb.fillStyle = `rgb(${200 + rnd() * 30},${200 + rnd() * 30},${200 + rnd() * 30})`;
      gb.beginPath(); gb.roundRect(x + m / 2, y + m / 2, bw - m, bh - m, 8); gb.fill();
    }
  }
  // paint speckle
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.035})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.colorSpace = THREE.SRGBColorSpace;
  [map, bump].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
  return { map, bump };
}
function concreteTexture(base = 205, spread = 14) {
  const S = 1024, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  g.fillStyle = `rgb(${base},${base - 2},${base - 5})`; g.fillRect(0, 0, S, S);
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 60; i++) {
    const x = rnd() * S, y = rnd() * S, r = 60 + rnd() * 220, v = (rnd() - 0.5) * spread;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 120})`); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
  }
  for (let i = 0; i < 40000; i++) { const v = rnd() * 255; g.fillStyle = `rgba(${v},${v},${v},.045)`; g.fillRect(rnd() * S, rnd() * S, 1.2, 1.2); }
  // saw-cut control joints
  g.strokeStyle = "rgba(60,58,55,.35)"; g.lineWidth = 2; g.strokeRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
function plaqueTexture(a) {
  const W = 640, H = 220, c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#fbfaf7"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#1c1916"; g.font = "700 46px Inter, Helvetica, Arial, sans-serif";
  const words = a.title.split(" "); let line = "", y = 66;
  for (const w of words) { const test = line ? line + " " + w : w; if (g.measureText(test).width > W - 60 && line) { g.fillText(line, 30, y); line = w; y += 52; } else line = test; }
  g.fillText(line, 30, y);
  g.fillStyle = "#6b625a"; g.font = "500 30px Inter, Helvetica, Arial, sans-serif";
  g.fillText([a.medium || a.category, a.year].filter(Boolean).join(", ").slice(0, 38), 30, Math.min(y + 50, H - 30));
  g.fillStyle = "#a8231f"; g.fillRect(30, H - 18, 46, 5);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export default {
  async mount(root, { route }) {
    const S = scope();
    const G = await loadJSON("data/gallery.json");
    const works = G.art;
    const rooms = { main: "Main room", right: "Flag room" };

    root.innerHTML = `
      <section class="gallery" data-view="${isSmallScreen() ? "wall" : "walk"}" aria-label="Art gallery">
        <div class="g-canvas" data-canvas></div>
        <div class="g-loading" data-loading><span></span><p>Hanging the art…</p></div>
        <div class="g-tools" role="toolbar" aria-label="Gallery tools">
          <button class="chip" data-room="main">Main room</button>
          <button class="chip" data-room="right">Flag room</button>
          <span class="g-sep"></span>
          <button class="chip" data-step="-1" aria-label="Previous artwork">← Prev</button>
          <button class="chip" data-step="1" aria-label="Next artwork">Next →</button>
          <span class="g-sep"></span>
          <button class="chip" data-toggle-view aria-pressed="false">Wall view</button>
        </div>
        <p class="g-help">Click the floor to walk there · drag to turn · <span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> / arrows · click a piece to open it</p>
        <button class="g-caption" data-caption hidden></button>
        <svg class="g-map" viewBox="0 0 100 64" aria-hidden="true" data-map>
          <rect x="2" y="2" width="55" height="60" rx="1.5"/><rect x="59.2" y="14" width="34.4" height="40.5" rx="1.5"/>
          <rect class="g-map-door" x="55.4" y="23.6" width="5.6" height="16.8"/>
          <g data-map-art></g>
          <path data-map-me d="M0 -4 L3 3 L0 1.6 L-3 3 Z"/>
        </svg>
        <div class="g-pad" role="group" aria-label="Walk">
          <button data-walk="1" class="is-up" aria-label="Walk forward">▲</button>
          <button data-turn="1" class="is-left" aria-label="Turn left">◀</button>
          <button data-walk="-1" class="is-down" aria-label="Walk back">▼</button>
          <button data-turn="-1" class="is-right" aria-label="Turn right">▶</button>
        </div>
        <div class="g-wall" data-wall>
          ${Object.entries(rooms).map(([id, name]) => `
            <section><h2>${name}</h2><div class="g-wall-grid">
              ${works.filter((a) => a.room === id).map((a) => `
                <button class="g-wall-item" data-open="${a.index}">
                  <span class="g-wall-img${a.cutout ? " is-cutout" : ""}"><img src="${thumb(a.index)}" alt="" loading="lazy"></span>
                  <b>${esc(a.title)}</b><small>${esc(meta(a))}</small>
                </button>`).join("")}
            </div></section>`).join("")}
        </div>
        <div class="g-detail" data-detail hidden role="dialog" aria-modal="true" aria-labelledby="g-detail-title"></div>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const gallery = $(".gallery"), host = $("[data-canvas]"), caption = $("[data-caption]"), detail = $("[data-detail]");

    /* ---------- three.js scene ---------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#c9d3d8");
    const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 60);
    camera.rotation.order = "YXZ";

    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const disposables = [];
    const keep = (x) => (disposables.push(x), x);

    // materials
    const brick = brickTextures();
    keep(brick.map); keep(brick.bump);
    const wallMat = (w, h) => {
      const map = brick.map.clone(), bump = brick.bump.clone();
      [map, bump].forEach((t) => { t.repeat.set(w / 2, h / 1); t.needsUpdate = true; keep(t); });
      return keep(new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.4, roughness: 0.92, color: 0xffffff }));
    };
    const floorTex = keep(concreteTexture(198, 16)); floorTex.repeat.set(3, 2);
    const floorMat = keep(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.48, metalness: 0.02 }));
    const ceilMat = keep(new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 1, emissive: 0xd8d4cd, emissiveIntensity: 0.62 }));
    const blackMat = keep(new THREE.MeshStandardMaterial({ color: 0x1a1a1b, roughness: 0.55, metalness: 0.3 }));
    const baseMat = keep(new THREE.MeshStandardMaterial({ color: 0x2b2a29, roughness: 0.7 }));

    const add = (mesh) => { scene.add(mesh); if (mesh.geometry) keep(mesh.geometry); return mesh; };
    const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    // A wall face from (x0,z0) to (x1,z1), facing the given yaw, between heights y0..y1.
    function wall(x0, z0, x1, z1, y0, y1, rotY) {
      const len = Math.hypot(x1 - x0, z1 - z0), h = y1 - y0;
      const m = add(plane(len, h, wallMat(len, h)));
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      m.rotation.y = rotY;
      if (y0 === 0) { // baseboard
        const b = add(new THREE.Mesh(new THREE.BoxGeometry(len, 0.09, 0.012), baseMat));
        b.position.copy(m.position); b.position.y = 0.045; b.rotation.y = rotY;
        b.translateZ(0.006);
      }
      return m;
    }
    const F = 0, B = Math.PI, LFT = Math.PI / 2, RGT = -Math.PI / 2; // facing +z, -z, +x, -x

    // Main room
    wall(MAIN.x0, MAIN.z0, MAIN.x1, MAIN.z0, 0, CEIL, F); // rear
    wall(MAIN.x0, MAIN.z0, MAIN.x0, MAIN.z1, 0, CEIL, LFT); // left
    wall(MAIN.x1, MAIN.z0, MAIN.x1, DOOR.z0, 0, CEIL, RGT); // right, rear part
    wall(MAIN.x1, DOOR.z1, MAIN.x1, MAIN.z1, 0, CEIL, RGT); // right, front part
    wall(MAIN.x1, DOOR.z0, MAIN.x1, DOOR.z1, DOOR.top, CEIL, RGT); // lintel
    // storefront facade with three windows
    const winW = 1.38, winH = 1.92, winY = 1.4, wins = G.windows.map((w) => w.center[0]);
    const wy0 = winY - winH / 2, wy1 = winY + winH / 2;
    wall(MAIN.x0, MAIN.z1, MAIN.x1, MAIN.z1, 0, wy0, B);
    wall(MAIN.x0, MAIN.z1, MAIN.x1, MAIN.z1, wy1, CEIL, B);
    const edges = [MAIN.x0, ...wins.flatMap((c) => [c - winW / 2, c + winW / 2]), MAIN.x1];
    for (let i = 0; i < edges.length; i += 2) if (edges[i + 1] - edges[i] > 0.01) wall(edges[i], MAIN.z1, edges[i + 1], MAIN.z1, wy0, wy1, B);
    wins.forEach((cx) => {
      const fr = 0.05, z = MAIN.z1 + 0.02;
      const bar = (w, h, x, y) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), blackMat)); m.position.set(x, y, z); };
      bar(winW + fr, fr, cx, wy0); bar(winW + fr, fr, cx, wy1); bar(fr, winH, cx - winW / 2, winY); bar(fr, winH, cx + winW / 2, winY);
      bar(0.03, winH, cx, winY); bar(winW, 0.03, cx, wy0 + winH * 0.68);
      const sill = add(new THREE.Mesh(new THREE.BoxGeometry(winW + 0.12, 0.035, 0.2), keep(new THREE.MeshStandardMaterial({ color: 0xece8e1, roughness: 0.8 }))));
      sill.position.set(cx, wy0 - 0.017, MAIN.z1 - 0.07);
      const glass = add(plane(winW, winH, keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, depthWrite: false }))));
      glass.position.set(cx, winY, MAIN.z1 + 0.03); glass.rotation.y = B;
    });
    // Flag room
    wall(FLAG.x0, FLAG.z0, FLAG.x1, FLAG.z0, 0, CEIL, F);
    wall(FLAG.x0, FLAG.z1, FLAG.x1, FLAG.z1, 0, CEIL, B);
    wall(FLAG.x1, FLAG.z0, FLAG.x1, FLAG.z1, 0, CEIL, RGT);
    wall(FLAG.x0, FLAG.z0, FLAG.x0, DOOR.z0, 0, CEIL, LFT);
    wall(FLAG.x0, DOOR.z1, FLAG.x0, FLAG.z1, 0, CEIL, LFT);
    wall(FLAG.x0, DOOR.z0, FLAG.x0, DOOR.z1, DOOR.top, CEIL, LFT);
    // doorway reveals + soffit
    wall(MAIN.x1, DOOR.z0, FLAG.x0, DOOR.z0, 0, DOOR.top, F);
    wall(MAIN.x1, DOOR.z1, FLAG.x0, DOOR.z1, 0, DOOR.top, B);
    { const s = add(plane(FLAG.x0 - MAIN.x1, DOOR.z1 - DOOR.z0, ceilMat)); s.rotation.x = Math.PI / 2; s.position.set((MAIN.x1 + FLAG.x0) / 2, DOOR.top, 0); }
    // floor + ceiling
    { const f = add(plane(9.6, 6.6, floorMat)); f.rotation.x = -Math.PI / 2; f.position.set(1.83, 0, 0); }
    { const c = add(plane(9.6, 6.6, ceilMat)); c.rotation.x = Math.PI / 2; c.position.set(1.83, CEIL, 0); }
    // outside: sidewalk + the street across
    const walkTex = keep(concreteTexture(150, 22)); walkTex.repeat.set(6, 2);
    { const s = add(plane(24, 7, keep(new THREE.MeshStandardMaterial({ map: walkTex, roughness: 0.9 })))); s.rotation.x = -Math.PI / 2; s.position.set(0, -0.02, MAIN.z1 + 3.5); }
    const street = loader.load("assets/art/neighborhood-view.webp", (t) => { t.colorSpace = THREE.SRGBColorSpace; });
    keep(street);
    { const s = add(plane(33, 22, keep(new THREE.MeshBasicMaterial({ map: street, toneMapped: false })))); s.position.set(0, 4.3, MAIN.z1 + 7.6); s.rotation.y = B; }
    // gallery bench
    {
      const wood = keep(new THREE.MeshStandardMaterial({ color: 0x9a6b3f, roughness: 0.6 }));
      const seat = add(new THREE.Mesh(new THREE.BoxGeometry(BENCH.x1 - BENCH.x0, 0.06, BENCH.z1 - BENCH.z0), wood));
      seat.position.set((BENCH.x0 + BENCH.x1) / 2, 0.44, (BENCH.z0 + BENCH.z1) / 2);
      [-1, 1].forEach((s) => { const leg = add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, BENCH.z1 - BENCH.z0 - 0.04), blackMat)); leg.position.set(seat.position.x + s * ((BENCH.x1 - BENCH.x0) / 2 - 0.1), 0.21, seat.position.z); });
    }

    // lights
    scene.add(new THREE.HemisphereLight(0xfff8ee, 0x8d8780, 0.95));
    const sun = new THREE.DirectionalLight(0xfff1dc, 0.6); sun.position.set(-2, 5, 9); scene.add(sun);
    const fill = new THREE.PointLight(0xfff3e2, 3, 9, 1.4); fill.position.set(4.6, 2.5, 0.3); scene.add(fill);

    /* ---------- the artwork ---------- */
    const pickables = [];
    // Soft rectangular falloff, built pixel by pixel so it works in every browser.
    const shadowTex = (() => {
      const N = 128, c = document.createElement("canvas"); c.width = c.height = N;
      const g = c.getContext("2d"), img = g.createImageData(N, N), edge = 0.22;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = Math.abs(x / (N - 1) - 0.5) * 2, v = Math.abs(y / (N - 1) - 0.5) * 2;
        const fx = clamp((1 - u) / edge, 0, 1), fy = clamp((1 - v) / edge, 0, 1);
        const a = Math.pow(fx * fy, 1.6) * 255, i = (y * N + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = a; img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      return keep(new THREE.CanvasTexture(c));
    })();
    const shadowMat = keep(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shadowTex, transparent: true, opacity: 0.3, depthWrite: false }));
    const rail = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0); const m = add(new THREE.Mesh(new THREE.BoxGeometry(len, 0.016, 0.026), blackMat)); m.position.set((x0 + x1) / 2, CEIL - 0.012, (z0 + z1) / 2); m.rotation.y = Math.atan2(-(z1 - z0), x1 - x0); };
    rail(-2.2, -1.82, 2.2, -1.82); rail(-1.5, -1.5, -1.5, 2.2); rail(1.5, -1.5, 1.5, 2.2); rail(3.3, -0.6, 5.9, -0.6); rail(3.3, 1.25, 5.9, 1.25); rail(5.2, -0.6, 5.2, 1.25);

    for (const a of works) {
      const [nx, , nz] = a.normal;
      const grp = new THREE.Group();
      grp.position.set(...a.position);
      grp.rotation.y = Math.atan2(nx, nz);
      scene.add(grp);
      const tex = loader.load(art(a.index), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; });
      keep(tex);
      let face;
      if (a.cutout) {
        const mat = keep(new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, roughness: 0.8 }));
        face = new THREE.Mesh(keep(new THREE.PlaneGeometry(a.width, a.height)), mat);
        face.position.z = 0.04;
        const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(a.width, a.height)), keep(new THREE.MeshBasicMaterial({ map: tex, color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })));
        shadow.position.set(0.025, -0.035, 0.004);
        grp.add(shadow);
      } else if (a.mount === "paper") {
        const frame = new THREE.Mesh(keep(new THREE.BoxGeometry(a.width + 0.18, a.height + 0.18, 0.03)), blackMat);
        frame.position.z = 0.015; grp.add(frame);
        const mat2 = new THREE.Mesh(keep(new THREE.PlaneGeometry(a.width + 0.13, a.height + 0.13)), keep(new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.95 })));
        mat2.position.z = 0.031; grp.add(mat2);
        face = new THREE.Mesh(keep(new THREE.PlaneGeometry(a.width, a.height)), keep(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 })));
        face.position.z = 0.032;
      } else {
        const d = a.mount === "canvas" ? 0.038 : a.mount === "wood" ? 0.022 : 0.018;
        const side = keep(new THREE.MeshStandardMaterial({ color: a.mount === "wood" ? 0x8a6a48 : 0xefeae0, roughness: 0.85 }));
        const front = keep(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
        face = new THREE.Mesh(keep(new THREE.BoxGeometry(a.width, a.height, d)), [side, side, side, side, front, side]);
        face.position.z = d / 2 + 0.002;
      }
      face.userData.art = a;
      grp.add(face);
      if (!a.cutout) { // soft shadow on the wall, a little below and behind the piece
        const sh = new THREE.Mesh(keep(new THREE.PlaneGeometry(a.width + 0.16, a.height + 0.16)), shadowMat);
        sh.position.set(0.018, -0.035, 0.003); grp.add(sh);
      }
      pickables.push(face);
      // wall label to the right of the piece
      const pt = keep(plaqueTexture(a));
      const plaque = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.2, 0.069)), keep(new THREE.MeshStandardMaterial({ map: pt, roughness: 0.9 })));
      const side = a.index === 4 || a.index === 15 ? -1 : 1;
      plaque.position.set(side * (a.width / 2 + 0.2), Math.min(1.42, a.position[1]) - a.position[1] - 0.05, 0.006);
      grp.add(plaque);
      // track spot
      const dist = 1.15;
      const lp = new THREE.Vector3(...a.position).add(new THREE.Vector3(nx * dist, 0, nz * dist)); lp.y = CEIL - 0.12;
      const spot = new THREE.SpotLight(0xfff1dc, 5, 5.5, Math.min(0.62, Math.atan((Math.max(a.width, a.height) / 2 + 0.3) / 1.4)), 0.55, 1.6);
      spot.position.copy(lp); spot.target.position.set(...a.position);
      scene.add(spot, spot.target);
      const can = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 16), blackMat));
      can.position.copy(lp); can.lookAt(new THREE.Vector3(...a.position)); can.rotateX(Math.PI / 2);
      a._stand = { x: a.position[0] + nx * clamp(Math.max(a.width, a.height) * 1.1 + 0.7, 1.45, 2.3), z: a.position[2] + nz * clamp(Math.max(a.width, a.height) * 1.1 + 0.7, 1.45, 2.3), yaw: Math.atan2(nx, nz) };
    }

    /* ---------- minimap ---------- */
    const mapX = (x) => 2 + ((x - MAIN.x0) / (MAIN.x1 - MAIN.x0)) * 55, mapY = (z) => 2 + ((z - MAIN.z0) / (MAIN.z1 - MAIN.z0)) * 60;
    $("[data-map-art]").innerHTML = works.map((a) => `<circle cx="${mapX(a.position[0]).toFixed(1)}" cy="${mapY(a.position[2]).toFixed(1)}" r="1.6"/>`).join("");
    const meDot = $("[data-map-me]");

    /* ---------- movement ---------- */
    // Start just right of the bench (the old start sat inside the bench's footprint, so every step was blocked).
    const st = { x: 0.8, z: 2.1, yaw: 0.16, pitch: -0.02, vx: 0, vz: 0, bob: 0 };
    const walkable = (x, z) => {
      const inBench = x > BENCH.x0 - R && x < BENCH.x1 + R && z > BENCH.z0 - R && z < BENCH.z1 + R;
      if (inBench) return false;
      const inMain = x > MAIN.x0 + R && x < MAIN.x1 - R && z > MAIN.z0 + R && z < MAIN.z1 - R;
      const inFlag = x > FLAG.x0 + R && x < FLAG.x1 - R && z > FLAG.z0 + R && z < FLAG.z1 - R;
      const inDoor = x > MAIN.x1 - R - 0.2 && x < FLAG.x0 + R + 0.2 && z > DOOR.z0 + R && z < DOOR.z1 - R;
      return inMain || inFlag || inDoor;
    };
    const moveBy = (dx, dz) => {
      if (walkable(st.x + dx, st.z)) st.x += dx;
      if (walkable(st.x, st.z + dz)) st.z += dz;
    };
    const keys = new Set();
    let fly = null, walkTouch = 0, turnTouch = 0;
    const flyTo = (x, z, yaw, ms = 1100) => {
      let dy = ((yaw - st.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      st.vx = st.vz = 0;
      fly = { x0: st.x, z0: st.z, y0: st.yaw, p0: st.pitch, x, z, y1: st.yaw + dy, t0: performance.now(), ms: reducedMotion() ? 1 : ms };
    };
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    S.on(window, "keydown", (e) => {
      if (gallery.dataset.view !== "walk" || !detail.hidden || e.metaKey || e.ctrlKey) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift", "q", "e"].includes(k)) {
        keys.add(k); fly = null;
        if (k.startsWith("arrow")) e.preventDefault();
      }
    });
    S.on(window, "keyup", (e) => keys.delete(e.key.toLowerCase()));
    S.on(window, "blur", () => keys.clear());

    // drag to look; click to open
    const cvs = renderer.domElement;
    let drag = null;
    S.on(cvs, "pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId }; cvs.setPointerCapture(e.pointerId); fly = null; });
    S.on(cvs, "pointermove", (e) => {
      if (drag && drag.id === e.pointerId) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
        const k = e.pointerType === "touch" ? 0.006 : 0.0042;
        st.yaw += dx * k; // left and right only, so you can't end up staring at the ceiling
        cvs.style.cursor = "grabbing";
      } else hover(e);
    });
    S.on(cvs, "pointerup", (e) => {
      cvs.style.cursor = "";
      if (drag && drag.moved < 6) {
        const hit = pick(e);
        if (hit) openDetail(hit.index);
        else { const p = floorAt(e); if (p) walkTo(p); }
      }
      drag = null;
    });
    S.on(cvs, "wheel", (e) => { e.preventDefault(); fly = null; const s = clamp(-e.deltaY * 0.004, -0.5, 0.5); moveBy(-Math.sin(st.yaw) * s, -Math.cos(st.yaw) * s); }, { passive: false });

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), floorHit = new THREE.Vector3();
    const marker = add(new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 40), keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false }))));
    marker.rotation.x = -Math.PI / 2; marker.position.y = 0.005; marker.visible = false;
    function floorAt(e) {
      const r = cvs.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectPlane(floorPlane, floorHit)) return null;
      if (!walkable(floorHit.x, floorHit.z)) return null;
      // Stop a comfortable viewing distance from the walls: pull the target back toward you if needed.
      const roomy = (x, z, m) => (x > MAIN.x0 + m && x < MAIN.x1 - m && z > MAIN.z0 + m && z < MAIN.z1 - m) || (x > FLAG.x0 + m && x < FLAG.x1 - m && z > FLAG.z0 + m && z < FLAG.z1 - m) || (z > DOOR.z0 + R && z < DOOR.z1 - R && x > MAIN.x1 - 1.1 && x < FLAG.x0 + 1.1);
      let x = floorHit.x, z = floorHit.z;
      for (let t = 1; t > 0 && !roomy(x, z, 0.95); t -= 0.04) { x = st.x + (floorHit.x - st.x) * t; z = st.z + (floorHit.z - st.z) * t; }
      const d = Math.hypot(x - st.x, z - st.z);
      return d > 0.35 && d < 9 && walkable(x, z) ? { x, z, d } : null;
    }
    function walkTo(p) {
      fly = null;
      const ms = clamp(p.d * 520, 450, 2600);
      flyTo(p.x, p.z, st.yaw, ms);
      marker.position.set(p.x, 0.005, p.z); marker.visible = true; marker.material.opacity = 1;
    }
    function pick(e) {
      const r = cvs.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit && hit.distance < 7 ? hit.object.userData.art : null;
    }
    let hovered = null;
    function hover(e) {
      if (e.pointerType === "touch") return;
      const a = pick(e);
      const p = a ? null : floorAt(e);
      if (!fly) { marker.visible = !!p; if (p) { marker.position.set(p.x, 0.005, p.z); marker.material.opacity = 0.55; } }
      cvs.style.cursor = a ? "pointer" : p ? "crosshair" : "";
      if (a === hovered) return;
      hovered = a;
      showCaption(a);
    }
    function showCaption(a) {
      if (!a) { caption.hidden = true; return; }
      caption.hidden = false;
      caption.innerHTML = `<b>${esc(a.title)}</b><span>${esc(meta(a))}</span><em>Open →</em>`;
      caption.onclick = () => openDetail(a.index);
    }

    // toolbar
    root.querySelectorAll("[data-room]").forEach((b) => S.on(b, "click", () => {
      showView("walk");
      if (b.dataset.room === "main") flyTo(0, 1.9, 0); else flyTo(4.55, 1.5, 0.35);
    }));
    let cursor = -1;
    root.querySelectorAll("[data-step]").forEach((b) => S.on(b, "click", () => {
      showView("walk");
      cursor = (cursor + +b.dataset.step + works.length) % works.length;
      const a = works[cursor];
      flyTo(a._stand.x, a._stand.z, a._stand.yaw);
      showCaption(a);
      announce(`${a.title}, ${rooms[a.room]}`);
    }));
    const toggle = $("[data-toggle-view]");
    function showView(v) {
      gallery.dataset.view = v;
      toggle.setAttribute("aria-pressed", v === "wall");
      toggle.textContent = v === "wall" ? "Walk the gallery" : "Wall view";
    }
    S.on(toggle, "click", () => showView(gallery.dataset.view === "wall" ? "walk" : "wall"));
    showView(gallery.dataset.view);
    root.querySelectorAll("[data-walk],[data-turn]").forEach((b) => {
      const on = (e) => { e.preventDefault(); fly = null; if (b.dataset.walk) walkTouch = +b.dataset.walk; else turnTouch = +b.dataset.turn; b.classList.add("is-down-press"); };
      const off = () => { if (b.dataset.walk) walkTouch = 0; else turnTouch = 0; b.classList.remove("is-down-press"); };
      S.on(b, "pointerdown", on);
      ["pointerup", "pointerleave", "pointercancel"].forEach((t) => S.on(b, t, off));
    });

    /* ---------- detail view ---------- */
    let open = -1;
    function openDetail(index) {
      const i = works.findIndex((a) => a.index === index); if (i < 0) return;
      open = i; const a = works[i];
      detail.hidden = false;
      detail.innerHTML = `
        <div class="g-detail-inner">
          <figure class="g-detail-fig${a.cutout ? " is-cutout" : ""}">
            <img src="${art(a.index)}" srcset="${art(a.index)} 1600w, ${art(a.index, 2400)} 2400w" sizes="(max-width: 900px) 92vw, 64vw" alt="${esc(a.title)}">
          </figure>
          <div class="g-detail-info">
            <p class="g-detail-room">${rooms[a.room]} · ${String(i + 1).padStart(2, "0")} / ${works.length}</p>
            <h2 id="g-detail-title">${esc(a.title)}</h2>
            <p>${esc(meta(a)) || "&nbsp;"}</p>
            <div class="g-detail-nav">
              <button class="chip" data-d="-1" aria-label="Previous artwork">←</button>
              <button class="chip" data-d="1" aria-label="Next artwork">→</button>
              <button class="chip" data-close>Close</button>
            </div>
          </div>
        </div>`;
      detail.querySelector("[data-close]").onclick = closeDetail;
      detail.querySelectorAll("[data-d]").forEach((b) => (b.onclick = () => openDetail(works[(open + +b.dataset.d + works.length) % works.length].index)));
      detail.querySelector("[data-close]").focus({ preventScroll: true });
      replaceDetailAddress(`/art/${a.index}`);
    }
    function closeDetail() {
      if (detail.hidden) return false;
      detail.hidden = true; detail.innerHTML = ""; open = -1;
      replaceDetailAddress("/art");
      return true;
    }
    S.on(detail, "click", (e) => { if (e.target === detail) closeDetail(); });
    S.on(window, "keydown", (e) => {
      if (detail.hidden) return;
      if (e.key === "ArrowRight") openDetail(works[(open + 1) % works.length].index);
      if (e.key === "ArrowLeft") openDetail(works[(open - 1 + works.length) % works.length].index);
    });
    root.querySelectorAll("[data-open]").forEach((b) => S.on(b, "click", () => openDetail(+b.dataset.open)));
    if (route.param) S.timeout(() => openDetail(+route.param), 300);

    /* ---------- loop ---------- */
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize(); S.on(window, "resize", resize);
    let last = performance.now();
    manager.onLoad = () => { $("[data-loading]").classList.add("is-done"); };
    setTimeout(() => $("[data-loading]")?.classList.add("is-done"), 6000);
    S.raf((now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (document.hidden || gallery.dataset.view !== "walk") return;
      if (fly) {
        const t = clamp((now - fly.t0) / fly.ms, 0, 1), k = ease(t);
        st.x = fly.x0 + (fly.x - fly.x0) * k; st.z = fly.z0 + (fly.z - fly.z0) * k;
        st.yaw = fly.y0 + (fly.y1 - fly.y0) * k; st.pitch = fly.p0 * (1 - k);
        if (t >= 1) fly = null;
      } else {
        const run = keys.has("shift") ? 2.7 : 1.7;
        let f = clamp((keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0) + walkTouch, -1, 1);
        let s = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
        const turn = clamp((keys.has("arrowleft") || keys.has("q") ? 1 : 0) - (keys.has("arrowright") || keys.has("e") ? 1 : 0) + turnTouch, -1, 1);
        st.yaw += turn * 1.8 * dt;
        let tx = 0, tz = 0;
        if (f || s) {
          const len = Math.hypot(f, s); f /= len; s /= len;
          tx = (-Math.sin(st.yaw) * f + Math.cos(st.yaw) * s) * run;
          tz = (-Math.cos(st.yaw) * f - Math.sin(st.yaw) * s) * run;
        }
        const k = 1 - Math.exp(-dt * 9); // ease into and out of a walk
        st.vx += (tx - st.vx) * k; st.vz += (tz - st.vz) * k;
        if (Math.abs(st.vx) + Math.abs(st.vz) > 0.002) { moveBy(st.vx * dt, st.vz * dt); marker.visible = false; }
      }
      const speed = fly ? 1.2 : Math.hypot(st.vx, st.vz);
      st.bob += dt * speed * 7.5;
      if (marker.visible && fly === null && marker.material.opacity >= 1) marker.visible = false;
      camera.position.set(st.x, EYE + (reducedMotion() ? 0 : Math.sin(st.bob) * 0.012 * Math.min(1, speed)), st.z);
      camera.rotation.set(st.pitch * -1, st.yaw, 0);
      meDot.setAttribute("transform", `translate(${mapX(st.x).toFixed(2)} ${mapY(st.z).toFixed(2)}) rotate(${(-st.yaw * 180) / Math.PI})`);
      renderer.render(scene, camera);
    });

    return {
      onEscape() { return closeDetail(); },
      unmount() {
        S.dispose();
        scene.traverse((o) => { if (o.isMesh) { o.geometry?.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose()); } });
        disposables.forEach((d) => d?.dispose?.());
        renderer.dispose();
        renderer.forceContextLoss?.();
        renderer.domElement.remove();
      },
    };
  },
};
