/* Motion access starts on a button tap. Only a real sample makes Tilt ready. */
RT.createTiltSteering = function (getScreenAngle, onChange) {
  const radians = Math.PI / 180;
  let state = 'touch', message = '';
  let attempt = 0, timer = null;
  let pose = null, center = null, centerAngle = null;

  function setState(value, text) {
    state = value;
    message = text;
    onChange();
  }
  function clearTimer() { clearTimeout(timer); timer = null; }
  function resetSensor() {
    attempt++;
    clearTimer();
    window.removeEventListener('deviceorientation', sample);
    pose = null;
    center = null;
  }
  function useTouch() {
    resetSensor();
    setState('touch', 'Slide left or right to steer.');
  }

  function sample({ beta, gamma }) {
    if (!Number.isFinite(beta) || !Number.isFinite(gamma)) {
      if (state === 'ready' && timer === null) {
        pose = null;
        timer = setTimeout(() => {
          timer = null;
          center = null;
          setState('missing', 'Motion stopped. Tip your phone to reconnect.');
        }, 1200);
      }
      return;
    }
    clearTimer();
    pose = { beta: beta * radians, gamma: gamma * radians };
    if (state !== 'ready') setState('ready', 'Tilt to steer. Hold the road for gas and lift to brake.');
  }

  async function request() {
    resetSensor();
    const ticket = attempt;
    const sensor = window.DeviceOrientationEvent;
    if (!window.isSecureContext || !sensor) {
      setState('unavailable', 'This browser has no motion sensor access. Open the game in your phone browser or choose Touch.');
      return;
    }
    setState('checking', 'Allow motion access if your browser asks.');
    try {
      if (typeof sensor.requestPermission === 'function') {
        const result = await sensor.requestPermission();
        if (ticket !== attempt) return;
        if (result !== 'granted') {
          setState('denied', 'Allow motion for this site in your browser settings, then try again.');
          return;
        }
      }
    } catch {
      if (ticket === attempt) setState('denied', 'Motion access is blocked. Open the game in your phone browser or try again.');
      return;
    }
    window.addEventListener('deviceorientation', sample);
    setState('checking', 'Hold your phone sideways and tip it slightly.');
    // A stationary phone may wait to send its first sample. Keep listening after the prompt.
    timer = setTimeout(() => {
      timer = null;
      setState('missing', 'No motion yet. Tip the phone from side to side, or open the game in your phone browser.');
    }, 4000);
  }

  function recenter(useCurrentGrip = false) { center = null; read(useCurrentGrip); }
  function read(useCurrentGrip = false) {
    if (state !== 'ready' || !pose) return 0;
    const angle = getScreenAngle();
    const a = angle * radians;
    const side = Math.cos(pose.beta) * Math.sin(pose.gamma) * Math.cos(a) + Math.sin(pose.beta) * Math.sin(a);
    const roll = Math.asin(RT.U.clamp(side, -1, 1)) / radians;
    if (center === null || centerAngle !== angle) {
      // The rotation event can arrive halfway through turning the phone sideways.
      center = useCurrentGrip || Math.abs(roll) <= 8 ? roll : 0;
      centerAngle = angle;
    }
    const offset = roll - center;
    const strength = RT.U.clamp((Math.abs(offset) - 2.5) / 23, 0, 1);
    return Math.sign(offset) * strength ** 1.18;
  }
  return { request, useTouch, recenter, read, get state() { return state; }, get message() { return message; } };
};
