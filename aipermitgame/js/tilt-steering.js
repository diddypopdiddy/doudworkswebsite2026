/* Steering follows the screen's sideways tilt relative to the driver's grip. */
RT.createTiltSteering = function (onChange) {
  const touchButton = document.getElementById('touchSteerBtn');
  const tiltButton = document.getElementById('tiltSteerBtn');
  const centerButton = document.getElementById('centerTiltBtn');
  const status = document.getElementById('steeringStatus');
  const initialPose = 'Hold the phone comfortably when you first touch the road to set straight ahead.';
  const motionWaitMs = 3500;
  const radians = Math.PI / 180;
  let enabled = false;
  let attempt = 0;
  let timeout = null;
  let orientation;
  let latest = null;
  let center = null;

  function showMode(useTilt, message) {
    const changed = enabled !== useTilt;
    enabled = useTilt;
    tiltButton.disabled = false;
    tiltButton.setAttribute('aria-pressed', String(useTilt));
    touchButton.setAttribute('aria-pressed', String(!useTilt));
    centerButton.hidden = !useTilt;
    status.textContent = message;
    if (changed) onChange(useTilt);
  }

  function useTouch(message = 'Hold and slide left or right to steer.') {
    attempt++;
    clearTimeout(timeout);
    timeout = null;
    window.removeEventListener('deviceorientation', onOrientation);
    latest = null;
    center = null;
    showMode(false, message);
  }

  const screenAngle = () => screen.orientation?.angle ?? window.orientation ?? 0;

  function onOrientation({ beta, gamma }) {
    if (!Number.isFinite(beta) || !Number.isFinite(gamma)) {
      if (enabled && timeout === null) {
        latest = null;
        timeout = setTimeout(() => useTouch('Motion data stopped. Touch steering is active.'), motionWaitMs);
      }
      return;
    }
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    const angle = screenAngle();
    if (angle !== orientation) {
      orientation = angle;
      center = null;
    }
    const pitch = beta * radians;
    const acrossDevice = Math.cos(pitch) * Math.sin(gamma * radians);
    const towardBottom = Math.sin(pitch);
    // Project gravity onto the display's rightward axis in portrait or landscape.
    const acrossScreen = acrossDevice * Math.cos(angle * radians) + towardBottom * Math.sin(angle * radians);
    latest = Math.asin(RT.U.clamp(acrossScreen, -1, 1)) / radians;
    if (!enabled) showMode(true, initialPose);
  }

  async function requestTilt() {
    if (enabled || tiltButton.disabled) return;
    const sensor = window.DeviceOrientationEvent;
    if (!window.isSecureContext || !sensor) {
      useTouch('Tilt is unavailable here. Touch steering is active.');
      return;
    }
    const request = ++attempt;
    tiltButton.disabled = true;
    status.textContent = 'Checking motion access…';
    try {
      if (typeof sensor.requestPermission === 'function') {
        // Request inside the Tilt button click so browsers can show their permission prompt.
        const permission = await sensor.requestPermission();
        if (request !== attempt) return;
        if (permission !== 'granted') {
          useTouch('Motion access is off. Touch steering is active.');
          return;
        }
      }
    } catch {
      if (request === attempt) useTouch('Motion access is off. Touch steering is active.');
      return;
    }
    status.textContent = 'Tip your phone slightly to check motion.';
    timeout = setTimeout(() => useTouch('The browser sent no motion data. Touch steering is active.'), motionWaitMs);
    window.addEventListener('deviceorientation', onOrientation);
  }

  touchButton.addEventListener('click', () => useTouch());
  tiltButton.addEventListener('click', requestTilt);
  centerButton.addEventListener('click', () => {
    center = null;
    status.textContent = 'Your next hold will set a new center.';
  });

  function read() {
    if (latest === null || orientation !== screenAngle()) return 0;
    if (center === null) {
      center = latest;
      status.textContent = 'Tilt left or right while holding the screen.';
    }
    const offset = latest - center;
    const strength = RT.U.clamp((Math.abs(offset) - 3) / 22, 0, 1);
    return Math.sign(offset) * strength ** 1.25;
  }

  return { read, get enabled() { return enabled; } };
};
