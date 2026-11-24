/* Fixed-view, feet-based SVG geometry. Classic script; no runtime dependencies. */
(function () {
  "use strict";
  const eye = [3, 11, 17],
    target = [0, 3, 1];
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const mul = (a, k) => a.map((v) => v * k);
  const dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const unit = (a) => mul(a, 1 / (Math.hypot.apply(null, a) || 1));
  const forward = unit(sub(target, eye)),
    right = unit(cross(forward, [0, 1, 0])),
    up = cross(right, forward);
  // The specified pinhole camera; room framing uses a modest optical overscan so
  // the near camera tripod and right-hand room microphone remain inside the set.
  const focal = (625 / (2 * Math.tan((38 * Math.PI) / 360))) * 0.55;
  const cx = 485,
    cy = 270;
  function project(p) {
    const v = sub(p, eye),
      depth = dot(v, forward),
      scale = focal / Math.max(0.01, depth);
    return {
      sx: cx + dot(v, right) * scale,
      sy: cy - dot(v, up) * scale,
      depth: depth,
      scale: scale,
    };
  }
  function unprojectFloor(sx, sy, y) {
    y = y || 0;
    const ray = add(
      forward,
      add(mul(right, (sx - cx) / focal), mul(up, (cy - sy) / focal)),
    );
    if (Math.abs(ray[1]) < 1e-7) return null;
    const t = (y - eye[1]) / ray[1];
    return t > 0 ? add(eye, mul(ray, t)) : null;
  }
  const fmt = (n) => Math.round(n * 100) / 100;
  function path(points, closed) {
    return (
      points
        .map((p, i) => {
          const q = project(p);
          return (i ? "L" : "M") + fmt(q.sx) + "," + fmt(q.sy);
        })
        .join(" ") + (closed ? " Z" : "")
    );
  }
  function shade(hex, normal) {
    const f = 0.35 + 0.65 * Math.max(0, dot(unit(normal), unit([-3, 7, 5])));
    return (
      "#" +
      hex
        .replace("#", "")
        .match(/../g)
        .map((v) =>
          Math.min(255, Math.round(parseInt(v, 16) * f))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }
  function faces(vertices, indices, color) {
    return indices
      .map((ids) => {
        const ps = ids.map((i) => vertices[i]);
        const n = unit(cross(sub(ps[1], ps[0]), sub(ps[2], ps[0])));
        const center = mul(ps.reduce(add, [0, 0, 0]), 1 / ps.length);
        return {
          d: path(ps, true),
          fill: shade(color, n),
          depth: project(center).depth,
          visible: dot(n, sub(eye, center)) > 0,
        };
      })
      .filter((f) => f.visible)
      .sort((a, b) => b.depth - a.depth);
  }
  function box(center, size, yaw, color) {
    yaw = yaw || 0;
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const vs = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ].map((p) => {
      const x = (p[0] * size[0]) / 2,
        z = (p[2] * size[2]) / 2;
      return add(center, [x * c + z * s, (p[1] * size[1]) / 2, -x * s + z * c]);
    });
    return faces(
      vs,
      [
        [0, 3, 2, 1],
        [4, 5, 6, 7],
        [0, 4, 7, 3],
        [1, 2, 6, 5],
        [3, 7, 6, 2],
        [0, 1, 5, 4],
      ],
      color || "#515861",
    );
  }
  function disc(center, radius, segments) {
    return path(
      Array.from({ length: segments || 24 }, (_, i) =>
        add(center, [
          radius * Math.cos((i * 2 * Math.PI) / (segments || 24)),
          0,
          radius * Math.sin((i * 2 * Math.PI) / (segments || 24)),
        ]),
      ),
      true,
    );
  }
  function cylinder(base, radius, height, segments, color) {
    segments = segments || 12;
    const vs = [];
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < segments; i++) {
        const t = (i * Math.PI * 2) / segments;
        vs.push(
          add(base, [Math.cos(t) * radius, j * height, Math.sin(t) * radius]),
        );
      }
    const ids = [];
    for (let i = 0; i < segments; i++)
      ids.push([
        i,
        (i + 1) % segments,
        ((i + 1) % segments) + segments,
        i + segments,
      ]);
    ids.push(
      Array.from({ length: segments }, (_, i) => segments + segments - 1 - i),
    );
    return faces(vs, ids, color || "#737b81");
  }
  function line3(a, b, width) {
    return {
      d: path([a, b]),
      width: (width * (project(a).scale + project(b).scale)) / 2,
    };
  }
  function frustum(base, top, length, yaw, pitch, color) {
    const direction = [
      Math.sin(yaw || 0) * Math.cos(pitch || 0),
      Math.sin(pitch || 0),
      Math.cos(yaw || 0) * Math.cos(pitch || 0),
    ];
    let r = unit(cross([0, 1, 0], direction));
    if (Math.hypot.apply(null, r) < 0.1) r = [1, 0, 0];
    const u = unit(cross(direction, r));
    const b = typeof base === "number" ? base : 0.6,
      t = typeof top === "number" ? top : 2;
    const vs = [];
    [0, 1].forEach((j) =>
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].forEach((p) =>
        vs.push(
          add(
            mul(direction, j * length),
            add(
              mul(r, (p[0] * (j ? t : b)) / 2),
              mul(u, (p[1] * (j ? t : b)) / 2),
            ),
          ),
        ),
      ),
    );
    return {
      vertices: vs,
      indices: [
        [0, 3, 2, 1],
        [4, 5, 6, 7],
        [0, 4, 7, 3],
        [1, 2, 6, 5],
        [3, 7, 6, 2],
        [0, 1, 5, 4],
      ],
      color: color || "#8a9194",
    };
  }
  window.Studio3D = {
    project,
    unprojectFloor,
    path,
    box,
    cylinder,
    line3,
    disc,
    frustum,
    faces,
    shade,
    add,
    sub,
    mul,
    dot,
    cross,
    unit,
    eye,
  };
})();
