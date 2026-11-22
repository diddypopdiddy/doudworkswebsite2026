/* The player's student-driver car: model and driving physics. */
RT.createPlayerCar = function (scene, map) {
  const T = THREE, U = RT.U, B = RT.Build;
  const LENGTH = 4.0, WIDTH = 1.8, WHEELBASE = 2.5;

  // ---------- model (built facing +z) ----------
  const model = RT.useModels ? RT.Vehicles.playerCarFromModel(0x16a3a8, 0xf4f4ef) : RT.Vehicles.playerCar(0x16a3a8, 0xf4f4ef);
  const root = model.root, body = model.body;
  const tailMat = model.mats.tail, blinkL = model.mats.blinkL, blinkR = model.mats.blinkR;
  const wheels = model.wheels;
  // "STUDENT DRIVER" roof topper, readable from the chase camera
  {
    const white = B.M({ color: 0xf5f5f0 });
    const topMat = B.M({ map: B.signTexture('student') });
    const topper = new T.Mesh(new T.BoxGeometry(1.1, 0.3, 0.22), [white, white, white, white, topMat, topMat]);
    topper.position.set(0, model.spec.roof + 0.16, -0.25);
    topper.castShadow = true;
    body.add(topper);
  }
  // soft blob shadow keeps the car grounded even when real shadows are off
  {
    const [c, g] = B.canvas(64, 64);
    const grad = g.createRadialGradient(32, 32, 4, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0,0,0,0.45)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    const blob = new T.Mesh(new T.PlaneGeometry(2.6, 5), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.05; root.add(blob);
  }
  scene.add(root);

  // ---------- physics state ----------
  const s = {
    x: map.spawn.x, z: map.spawn.z, heading: map.spawn.heading,
    v: 0, steer: 0, blinker: 0, blinkT: 0, braking: false, reversing: false,
    bump: 0, lastBumpSpeed: 0
  };
  const forward = () => ({ x: Math.sin(s.heading), z: Math.cos(s.heading) });

  function corners(x, z, h, pad = 0) {
    const fx = Math.sin(h), fz = Math.cos(h), rx = -fz, rz = fx;
    const hl = LENGTH / 2 + pad, hw = WIDTH / 2 + pad;
    return [
      [x + fx * hl + rx * hw, z + fz * hl + rz * hw], [x + fx * hl - rx * hw, z + fz * hl - rz * hw],
      [x - fx * hl + rx * hw, z - fz * hl + rz * hw], [x - fx * hl - rx * hw, z - fz * hl - rz * hw],
      [x + fx * hl, z + fz * hl], [x - fx * hl, z - fz * hl]
    ];
  }
  const fits = (x, z, h) => corners(x, z, h).every(([cx, cz]) => map.isDrivable(cx, cz));

  // Gentle lane assist: when the driver is not steering and is nearly lined up with the
  // street, ease the heading onto it. Keeps keyboard driving relaxed for younger players.
  function laneAssist(dt, steering) {
    if (steering || Math.abs(s.v) < 2) return;
    const q = Math.PI / 2;
    const target = Math.round(s.heading / q) * q;
    const diff = U.wrapAngle(target - s.heading);
    if (Math.abs(diff) < 0.2) s.heading += diff * Math.min(1, dt * 2.2);
  }

  /** input: {throttle 0..1, brake 0..1, steer -1..1 (left negative)} */
  function update(dt, input) {
    const speed = Math.abs(s.v);
    const goingForward = s.v > 0.3, goingBack = s.v < -0.3;
    let accel = 0;
    s.braking = false;
    if (input.throttle > 0) {
      if (goingBack) { accel = 10 * input.throttle; s.braking = true; }
      else accel = (4.6 - speed * 0.11) * input.throttle;
    }
    if (input.reverse > 0) {
      if (goingForward) { accel = -10 * input.reverse; s.braking = true; }
      else accel = -3.2 * input.reverse;
    }
    if (input.brake > 0) {
      s.braking = true;
      const b = 11 * input.brake;
      if (s.v > 0) s.v = Math.max(0, s.v - b * dt); else if (s.v < 0) s.v = Math.min(0, s.v + b * dt);
    }
    s.v += accel * dt;
    // rolling resistance and air drag
    const drag = 0.45 + 0.0042 * s.v * s.v;
    if (input.throttle <= 0 && input.reverse <= 0) {
      if (s.v > 0) s.v = Math.max(0, s.v - drag * dt * 1.6); else if (s.v < 0) s.v = Math.min(0, s.v + drag * dt * 1.6);
    } else s.v -= Math.sign(s.v) * drag * dt * 0.6;
    s.v = U.clamp(s.v, -6, 26);
    if (Math.abs(s.v) < 0.05 && input.throttle <= 0 && input.reverse <= 0) s.v = 0;
    s.reversing = s.v < -0.1;

    // steering eases in and tightens at low speed
    const maxSteer = U.lerp(0.62, 0.16, U.clamp(speed / 22, 0, 1));
    s.steer = U.damp(s.steer, input.steer * maxSteer, input.steer ? 7 : 10, dt);
    const yaw = (s.v / WHEELBASE) * Math.tan(s.steer);
    let nh = s.heading - yaw * dt;
    const f = { x: Math.sin(nh), z: Math.cos(nh) };
    let nx = s.x + f.x * s.v * dt, nz = s.z + f.z * s.v * dt;

    s.bump = 0;
    if (fits(nx, nz, nh)) { s.x = nx; s.z = nz; s.heading = nh; }
    else {
      // slide along the curb: try each axis on its own, then rotation only
      const impact = Math.abs(s.v);
      if (fits(nx, s.z, nh)) { s.x = nx; s.heading = nh; s.v *= 0.92; }
      else if (fits(s.x, nz, nh)) { s.z = nz; s.heading = nh; s.v *= 0.92; }
      else if (fits(s.x, s.z, nh)) { s.heading = nh; s.v *= -0.15; }
      else s.v *= -0.2;
      s.bump = impact;
    }
    laneAssist(dt, input.steer !== 0);
    s.heading = U.wrapAngle(s.heading);

    // blinkers
    s.blinkT += dt;
    const on = s.blinker !== 0 && (s.blinkT % 0.8) < 0.45;
    blinkL.color.setHex(on && s.blinker > 0 ? 0xffb020 : 0x5a3d0a);
    blinkR.color.setHex(on && s.blinker < 0 ? 0xffb020 : 0x5a3d0a);
    tailMat.color.setHex(s.braking || (Math.abs(s.v) < 0.1) ? 0xff2a2a : 0x6a0f12);
    model.mats.reverse?.color.setHex(s.reversing ? 0xfff7e3 : 0x5d6465);
    if (model.steering) model.steering.rotation.y = -s.steer * 3;

    // model
    root.position.set(s.x, 0, s.z);
    root.rotation.y = s.heading;
    // weight transfer: nose dips under braking, lifts on the gas; body leans out of turns
    const pitch = s.braking && Math.abs(s.v) > 0.5 ? 0.025 * Math.sign(s.v) : -U.clamp(accel * 0.005, -0.02, 0.02);
    body.rotation.x = U.damp(body.rotation.x, pitch, 6, dt);
    body.rotation.z = U.damp(body.rotation.z, U.clamp(yaw * s.v * 0.006, -0.06, 0.06), 5, dt);
    s.yaw = yaw;
    for (const w of wheels) {
      w.wheel.rotation.x += (w.rollSign || 1) * (s.v / model.spec.wheel) * dt;
      if (w.front) w.pivot.rotation.y = -s.steer;
    }
  }

  function setBlinker(dir) { // dir: 1 = left, -1 = right, 0 = off
    s.blinker = s.blinker === dir ? 0 : dir; s.blinkT = 0;
  }

  function place(x, z, heading) { s.x = x; s.z = z; s.heading = heading; s.v = 0; s.steer = 0; root.position.set(x, 0, z); root.rotation.y = heading; }

  function frontPoint() { const f = forward(); return { x: s.x + f.x * LENGTH / 2, z: s.z + f.z * LENGTH / 2 }; }

  function setDusk(f) { model.mats.headlight?.color.setRGB(0.94 + 2.6 * f, 0.94 + 2.0 * f, 0.94 + f); }

  return { state: s, root, update, setBlinker, place, forward, frontPoint, setDusk, LENGTH, WIDTH, corners };
};
