/* Shared helpers. Everything in the game hangs off the global RT namespace so the
 * game runs from a double-clicked index.html with no build step or server. */
window.RT = window.RT || {};

RT.U = (function () {
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

  // Small deterministic RNG so the city is laid out the same way on every visit.
  function seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rnd = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Wraps an angle into (-PI, PI].
  function wrapAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a <= -Math.PI) a += Math.PI * 2;
    return a;
  }

  // Compass directions on the ground plane. x = east, z = south (so north is -z).
  const DIRS = {
    N: { x: 0, z: -1 }, E: { x: 1, z: 0 }, S: { x: 0, z: 1 }, W: { x: -1, z: 0 }
  };
  const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };
  // The driver's right-hand side for a travel direction (US traffic drives on the right).
  const rightOf = (d) => ({ x: -d.z, z: d.x });
  const axisOf = (dirKey) => (dirKey === 'N' || dirKey === 'S' ? 'ns' : 'ew');

  const mph = (ms) => ms * 2.23694;
  const fromMph = (m) => m / 2.23694;

  function safeStorage() {
    try {
      const k = '__rt_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  return { clamp, lerp, damp, seeded, shuffle, wrapAngle, DIRS, OPPOSITE, rightOf, axisOf, mph, fromMph, safeStorage, escapeHtml };
})();
