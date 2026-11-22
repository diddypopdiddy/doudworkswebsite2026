/* One contact drives and steers. Lifting it applies the car's regular brake. */
RT.createTouchDrive = function (surface, car, canDrive, onStart) {
  const guide = document.getElementById('touchGuide');
  const verb = document.getElementById('touchVerb');
  const steerHint = document.getElementById('steerHint');
  const left = document.getElementById('signalLeftBtn');
  const right = document.getElementById('signalRightBtn');
  const reverse = document.getElementById('reverseBtn');
  let pointerId = null;
  let bounds;
  let steer = 0;
  let displayedSteer = 0;
  let active = false;
  let reversing = false;
  let shownSignal = 0;
  const tilt = RT.createTiltSteering((enabled) => {
    cancel();
    steerHint.textContent = enabled ? 'Tilt to steer' : 'Slide to steer';
  });

  function showSteer(value) {
    if (value === displayedSteer) return;
    displayedSteer = value;
    guide.style.setProperty('--steer-position', `${50 + value * 47}%`);
  }

  function updateSteer(clientX) {
    const offset = (clientX - bounds.left) / (bounds.width / 2) - 1;
    // Leave a wide straight-ahead zone and give small thumb movements finer control.
    const strength = RT.U.clamp((Math.abs(offset) - 0.20) / 0.58, 0, 1);
    steer = Math.sign(offset) * strength ** 1.35;
    showSteer(steer);
  }

  function cancel() {
    if (pointerId === null) return;
    // Let the browser release capture on lift so the gesture stays on the road if a menu opens.
    pointerId = null;
    steer = 0;
    displayedSteer = 0;
    guide.classList.remove('driving');
    guide.style.removeProperty('--steer-position');
  }

  // Suppress the click a browser can synthesize when a held drive touch ends over a menu.
  surface.addEventListener('touchstart', (e) => {
    if (canDrive()) e.preventDefault();
  }, { passive: false });
  surface.addEventListener('pointerdown', (e) => {
    if (!canDrive() || pointerId !== null || e.button !== 0 || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
    e.preventDefault();
    surface.setPointerCapture(e.pointerId);
    pointerId = e.pointerId;
    active = true;
    if (!tilt.enabled) {
      bounds = surface.getBoundingClientRect();
      updateSteer(e.clientX);
    }
    guide.classList.add('driving');
    onStart();
  });
  surface.addEventListener('pointermove', (e) => {
    if (e.pointerId === pointerId && !tilt.enabled) updateSteer(e.clientX);
  });
  function endGesture(e) {
    if (e.pointerId === pointerId) cancel();
  }
  surface.addEventListener('pointerup', endGesture);
  surface.addEventListener('pointercancel', endGesture);
  surface.addEventListener('lostpointercapture', endGesture);
  window.addEventListener('resize', cancel);

  function setReverse(value) {
    if (reversing === value) return;
    reversing = value;
    reverse.setAttribute('aria-pressed', String(value));
    verb.textContent = value ? 'reverse' : 'drive';
  }

  const canShift = () => pointerId === null && Math.abs(car.state.v) < 0.05;
  reverse.addEventListener('click', () => {
    if (!canDrive() || !canShift()) return;
    active = true;
    setReverse(!reversing);
  });
  function bindSignal(button, direction) {
    const toggle = () => { if (canDrive()) car.setBlinker(direction); };
    // A second contact can send pointer events without generating a click.
    button.addEventListener('pointerdown', (e) => { if (e.button === 0) toggle(); });
    button.addEventListener('click', (e) => { if (e.detail === 0) toggle(); });
  }
  bindSignal(left, 1);
  bindSignal(right, -1);

  function sync() {
    const shiftingDisabled = !canShift();
    if (reverse.disabled !== shiftingDisabled) reverse.disabled = shiftingDisabled;
    const dir = car.state.blinker;
    if (shownSignal === dir) return;
    shownSignal = dir;
    left.setAttribute('aria-pressed', String(dir === 1));
    right.setAttribute('aria-pressed', String(dir === -1));
  }

  function reset() {
    cancel();
    active = false;
    setReverse(false);
  }

  function read() {
    if (!active) return null;
    if (pointerId === null) return { throttle: 0, reverse: 0, brake: 1, steer: 0 };
    if (tilt.enabled) {
      steer = tilt.read();
      showSteer(steer);
    }
    return { throttle: reversing ? 0 : 1, reverse: reversing ? 1 : 0, brake: 0, steer };
  }

  return { read, cancel, reset, sync, get active() { return active; }, get reversing() { return reversing; } };
};
