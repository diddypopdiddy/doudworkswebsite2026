/* Rules of the road: tracks approaches to intersections, decides when lights catch the
 * driver, triggers question / road-note cards, and reports driving mistakes. */
RT.createRules = function (map, signals, car, settings, hooks) {
  const U = RT.U;
  const STOP_LINE_TOLERANCE = 0.8;
  let ap = null;              // current approach to an intersection
  let segName = null, segLimit = settings.speedLimits.street;
  const announced = new Set();
  const history = [];         // recent director outcomes: 'red' | 'green'
  let sinceQuestion = 0;      // seconds driven since the last red-light question
  let speedT = 0, underT = 0, speedWarned = false, speedCounted = false;
  let wrongT = 0, wrongSeg = null, wrongCounted = false;
  let bumpCool = 0, crashCool = 0;
  let overlookT = 0, overlookUsed = false;
  let finishT = 0;
  let farHintFor = null;

  function lightFor(a) { return signals.light(a.node.id, a.axis); }

  function newApproach(seg, travel, node) {
    const axis = U.axisOf(travel);
    let kind = node.degree >= 3 ? node.kind : 'none';
    if (kind === 'stop' && !map.stopsFor(node, axis)) kind = 'none';
    return { key: node.id + ':' + travel, seg, travel, node, axis, kind, stopRange: kind === 'stop' ? 9 : 32,
      decided: false, outcome: null, stopT: 0, stoppedDone: false, answered: false, crossed: false, dlPrev: Infinity,
      blinkerSeen: 0, carded: false };
  }

  function endApproach(a) {
    if (!a) return;
    if (a.kind === 'signal' && a.decided) signals.unlock(a.node.id);
  }

  function chooseOutcome(a, dl) {
    const L = lightFor(a);
    if (dl < 28) return L === 'green' ? 'green' : 'red';
    if (L === 'yellow') return 'red';
    let p = settings.redLightShare;
    const last2 = history.slice(-2);
    if (last2.length === 2 && last2.every((o) => o === 'green')) p = 0.9;
    if (last2.length === 2 && last2.every((o) => o === 'red')) p = 0.2;
    if (sinceQuestion > 55) p = 0.95;
    else if (sinceQuestion < 12) p *= 0.4;
    if (hooks.isReturning()) p = Math.min(p, 0.35);
    return Math.random() < p ? 'red' : 'green';
  }

  function decide(a, dl) {
    a.decided = true;
    a.outcome = chooseOutcome(a, dl);
    history.push(a.outcome); if (history.length > 6) history.shift();
    if (a.outcome === 'green') signals.lock(a.node.id, a.axis, true);
    else signals.lock(a.node.id, signals.other(a.axis), false);
  }

  function turnCheck(prev, newTravel) {
    if (!prev || !prev.crossed || prev.kind === 'none' && prev.node.degree < 3) return;
    if (newTravel === prev.travel || newTravel === U.OPPOSITE[prev.travel]) return;
    const r = U.rightOf(U.DIRS[prev.travel]);
    const nd = U.DIRS[newTravel];
    const isRight = r.x === nd.x && r.z === nd.z;
    const needed = isRight ? -1 : 1;
    hooks.turn(prev.blinkerSeen === needed, isRight ? 'right' : 'left');
    if (car.state.blinker === needed) car.setBlinker(needed); // auto-cancel
  }

  function update(dt) {
    const s = car.state;
    const f = car.forward();
    const front = car.frontPoint();
    const speed = Math.abs(s.v);
    sinceQuestion += dt;
    bumpCool -= dt; crashCool -= dt;

    const loc = map.locate(s.x, s.z);

    // ----- which intersection are we heading toward? -----
    if (loc.seg) {
      const seg = loc.seg;
      if (seg.name !== segName) {
        segName = seg.name;
        hooks.street(seg);
        if (map.namesakes[seg.name] && !announced.has(seg.name)) { announced.add(seg.name); hooks.say(map.namesakes[seg.name], 'info', 7); }
      }
      segLimit = seg.limit;
      const ax = seg.axis === 'x' ? { x: 1, z: 0 } : { x: 0, z: 1 };
      const dot = f.x * ax.x + f.z * ax.z;
      if (Math.abs(dot) > 0.6) {
        const travel = seg.axis === 'x' ? (dot > 0 ? 'E' : 'W') : (dot > 0 ? 'S' : 'N');
        const node = map.nodes[dot > 0 ? seg.b : seg.a];
        const key = node.id + ':' + travel;
        if (!ap || ap.key !== key) {
          const prev = ap;
          endApproach(prev);
          // only count it as a turn if we left the intersection we just crossed
          if (prev && (seg.a === prev.node.id || seg.b === prev.node.id)) turnCheck(prev, travel);
          ap = newApproach(seg, travel, node);
        }
      }

      // ----- lane discipline -----
      if (ap && Math.abs(dot) > 0.85 && s.v > 3) {
        const a = map.nodes[seg.a];
        const r = U.rightOf(U.DIRS[ap.travel]);
        const lat = seg.axis === 'x' ? (s.z - a.z) * r.z : (s.x - a.x) * r.x;
        if (wrongSeg !== seg) { wrongSeg = seg; wrongCounted = false; wrongT = 0; }
        if (lat < -0.4) {
          wrongT += dt;
          if (wrongT > 1.6 && !wrongCounted) { wrongCounted = true; hooks.violation('wrong-side'); }
        } else wrongT = Math.max(0, wrongT - dt);
      }
    }

    // ----- intersection logic -----
    if (ap) {
      const d = U.DIRS[ap.travel];
      const line = map.stopLine(ap.node, ap.travel);
      const dl = (line.x - front.x) * d.x + (line.z - front.z) * d.z;
      if (s.blinker !== 0 && dl < 70) ap.blinkerSeen = s.blinker;

      if (ap.kind === 'signal' && !ap.decided && dl < 85 && dl > 0 && s.v > 1) decide(ap, dl);
      if (ap.kind === 'signal' && ap.decided && ap.outcome === 'green' && signals.lockAge(ap.node.id) > 25 && !ap.crossed) signals.unlock(ap.node.id);

      // Use the same line tolerance for crossing and for a qualifying stop.
      const beforeLine = dl >= -STOP_LINE_TOLERANCE;
      if (!ap.crossed && ap.dlPrev >= -STOP_LINE_TOLERANCE && !beforeLine && s.v > 0) {
        ap.crossed = true;
        if (ap.kind === 'signal') {
          if (lightFor(ap) === 'red') hooks.violation('red-light');
        } else if (ap.kind === 'stop' && !ap.stoppedDone) hooks.violation('rolled-stop');
      }
      ap.dlPrev = dl;
      const atStop = speed < 0.4 && beforeLine && dl < ap.stopRange;

      // stopped at a stop sign
      if (ap.kind === 'stop' && !ap.stoppedDone && !ap.crossed) {
        if (atStop) {
          ap.stopT += dt;
          if (ap.stopT > 0.35) { ap.stoppedDone = true; hooks.stopSign(ap); }
        } else {
          ap.stopT = 0;
          if (speed < 0.2 && dl >= ap.stopRange && dl < 25 && farHintFor !== ap.key) {
            farHintFor = ap.key;
            hooks.say('Pull up closer to the white stop line before you stop.', 'tip', 4);
          }
        }
      }

      // stopped at a red (or yellow) light
      if (ap.kind === 'signal' && !ap.answered && !ap.crossed) {
        if (atStop && lightFor(ap) !== 'green') {
          ap.stopT += dt;
          if (ap.stopT > 0.5) {
            ap.answered = true; sinceQuestion = 0;
            if (!ap.decided) { ap.decided = true; ap.outcome = 'red'; }
            signals.lock(ap.node.id, signals.other(ap.axis), false);
            hooks.redLight(ap, () => { signals.lock(ap.node.id, ap.axis, true); });
          }
        } else ap.stopT = 0;
      }
    }

    // ----- speed -----
    const mphNow = U.mph(speed);
    const limit = segLimit;
    if (mphNow > limit + settings.speedingTolerance) {
      speedT += dt; underT = 0;
      if (speedT > 1.2 && !speedWarned) { speedWarned = true; hooks.say('Watch your speed. This is a ' + limit + ' mph zone.', 'warn', 4); }
      if (speedT > 4.5 && !speedCounted) { speedCounted = true; hooks.violation('speeding', limit); }
    } else {
      underT += dt;
      if (underT > 2.5) { speedT = 0; speedWarned = false; speedCounted = false; }
    }

    // ----- bumps -----
    if (s.bump > 4 && bumpCool <= 0) { bumpCool = 3; hooks.violation('curb'); }

    // ----- scenic overlook -----
    if (loc.overlook) {
      if (speed < 0.4 && !overlookUsed) { overlookT += dt; if (overlookT > 0.8) { overlookUsed = true; hooks.overlook(); } }
    } else { overlookT = 0; if (!map.inRect(map.overlook, s.x, s.z, 6)) overlookUsed = false; }

    // ----- finish -----
    if (hooks.isReturning()) {
      const fd = Math.hypot(s.x - map.finishSpot.x, s.z - map.finishSpot.z);
      if (fd < map.finishSpot.r && speed < 0.5) { finishT += dt; if (finishT > 0.6) hooks.finish(); }
      else finishT = 0;
    }
  }

  function crash(impact) {
    if (impact > 2.5 && crashCool <= 0) { crashCool = 3; hooks.violation('crash'); }
  }

  function reset() { endApproach(ap); ap = null; segName = null; sinceQuestion = 20; history.length = 0; overlookUsed = false; }

  return { update, crash, reset, get limit() { return segLimit; }, get street() { return segName; }, get approach() { return ap; } };
};
