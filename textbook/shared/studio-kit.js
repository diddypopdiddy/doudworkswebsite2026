/* Vector set, lights and equipment. No images, network calls or persisted state. */
(function () {
  "use strict";
  const D = window.Studio3D,
    NS = "http://www.w3.org/2000/svg";
  const cameraHeights = { low: 3, eye: 3.8, high: 5.2 };
  let serial = 0;
  function el(tag, a, parent) {
    const n = document.createElementNS(NS, tag);
    Object.keys(a || {}).forEach((k) => n.setAttribute(k, a[k]));
    if (parent) parent.appendChild(n);
    return n;
  }
  function path(g, d, fill, extra) {
    return el(
      "path",
      Object.assign({ d, fill: fill || "none" }, extra || {}),
      g,
    );
  }
  function polygon(g, ps, fill, extra) {
    return path(g, D.path(ps, true), fill, extra);
  }
  function line(g, a, b, w, color, extra) {
    const l = D.line3(a, b, w);
    return path(
      g,
      l.d,
      "none",
      Object.assign(
        {
          stroke: color || "#747d85",
          "stroke-width": l.width,
          "stroke-linecap": "round",
        },
        extra || {},
      ),
    );
  }
  function box(g, p, s, c, y) {
    D.box(p, s, y, c).forEach((f) =>
      path(g, f.d, f.fill, { stroke: f.fill, "stroke-width": 0.6 }),
    );
  }
  function cylinder(g, p, r, h, c) {
    D.cylinder(p, r, h, 10, c).forEach((f) => path(g, f.d, f.fill));
  }
  function sphere(g, p, r, c, extra) {
    const q = D.project(p);
    return el(
      "circle",
      Object.assign(
        { cx: q.sx, cy: q.sy, r: r * q.scale, fill: c },
        extra || {},
      ),
      g,
    );
  }
  function oriented(g, p, dir, back, front, len, color, face) {
    const geometry = D.frustum(
      back,
      front,
      len,
      Math.atan2(dir[0], dir[2]),
      Math.asin(dir[1]),
      color,
    );
    const vs = geometry.vertices.map((v) => D.add(p, v));
    D.faces(
      vs,
      [
        [0, 3, 2, 1],
        [0, 4, 7, 3],
        [1, 2, 6, 5],
        [3, 7, 6, 2],
        [0, 1, 5, 4],
      ],
      color,
    ).forEach((f) =>
      path(g, f.d, f.fill, { stroke: "#151a20", "stroke-width": 0.6 }),
    );
    if (D.dot(dir, D.sub(D.eye, D.add(p, D.mul(dir, len)))) > 0)
      polygon(g, vs.slice(4), face || color, {
        stroke: "#9b9c94",
        "stroke-width": 0.7,
      });
  }
  function tube(g, p, dir, r, length, color) {
    const right = D.unit(D.cross([0, 1, 0], dir)),
      up = D.unit(D.cross(dir, right)),
      vs = [];
    for (let j = 0; j < 2; j++)
      for (let n = 0; n < 12; n++) {
        const t = (n * Math.PI) / 6;
        vs.push(
          D.add(
            D.add(p, D.mul(dir, j * length)),
            D.add(D.mul(right, Math.cos(t) * r), D.mul(up, Math.sin(t) * r)),
          ),
        );
      }
    const faces = [];
    for (let n = 0; n < 12; n++)
      faces.push([n, (n + 1) % 12, ((n + 1) % 12) + 12, n + 12]);
    D.faces(vs, faces, color).forEach((f) => path(g, f.d, f.fill));
    if (D.dot(dir, D.sub(D.eye, p)) > 0)
      polygon(g, vs.slice(12), "#243d48", {
        stroke: "#82969e",
        "stroke-width": 1,
      });
  }
  function stand(g, p, h, r, bag) {
    const hub = D.add(p, [0, Math.min(0.6, h * 0.5), 0]);
    for (let i = 0; i < 3; i++) {
      const t = (i * 2 * Math.PI) / 3 + 0.2,
        foot = D.add(p, [Math.cos(t) * r, 0.05, Math.sin(t) * r]);
      line(g, hub, foot, 0.065, "#858c91");
      sphere(g, foot, 0.075, "#14191e");
    }
    line(g, p, D.add(p, [0, h, 0]), 0.065, "#a7adb0");
    line(
      g,
      D.add(p, [0.015, 0.1, 0.015]),
      D.add(p, [0.015, h * 0.54, 0.015]),
      0.1,
      "#515c65",
    );
    cylinder(g, D.add(p, [0, h * 0.52, 0]), 0.11, 0.12, "#9ca4a9");
    if (bag)
      box(
        g,
        D.add(p, [r * 0.65, 0.15, 0.12]),
        [0.65, 0.25, 0.4],
        "#665a43",
        0.2,
      );
  }
  function headHeight(i) {
    return i.head != null
      ? i.head
      : {
          key: 6.5,
          fill: 6,
          back: 7.5,
          side: 4.5,
          front: 5,
          top: 10.5,
          under: 0.8,
        }[i.mark] || 5.8;
  }
  function lightHead(i) {
    return [i.point[0], headHeight(i) + (i.lift || 0), i.point[2]];
  }
  function equipment(i, scene, defsId) {
    const g = el("g", { "data-st-art-item": i.id, "data-kind": i.kind }),
      p = D.add(i.point, [0, i.lift || 0, 0]);
    const isMoving = scene.dragged === i.id;
    if (isMoving) {
      const hue =
        i.kind === "camera"
          ? "camera"
          : i.kind === "light" || i.kind === "softbox"
            ? "light"
            : "mic";
      g.setAttribute("filter", "url(#" + defsId + "lift-" + hue + ")");
      g.setAttribute("opacity", 0.82);
    }
    if (i.kind === "light" || i.kind === "softbox") {
      const h = lightHead(i),
        dir = D.unit(D.sub([0, 4.15, 0], h));
      if (i.kind === "softbox") {
        /* Accessories are held without a stand. */
      } else if (i.mark === "top") {
        line(g, D.add(h, [0, 0.65, 0]), h, 0.12, "#9aa1a6");
        box(g, D.add(h, [0, 0.6, 0]), [0.3, 0.2, 0.4], "#92979d");
      } else stand(g, p, h[1] - p[1], i.mark === "under" ? 0.55 : 1, true);
      line(g, D.add(h, [-0.35, 0, 0]), D.add(h, [0.35, 0, 0]), 0.1, "#b7bcc0");
      const value = Math.max(
          0,
          Math.min(1, (i.level == null ? 100 : i.level) / 100),
        ),
        glow = Math.round(85 + value * 170),
        face =
          "rgb(" +
          glow +
          "," +
          Math.round(glow * 0.97) +
          "," +
          Math.round(glow * 0.86) +
          ")";
      oriented(
        g,
        h,
        dir,
        0.62,
        i.soft || i.kind === "softbox" ? 1.8 : 0.7,
        i.soft || i.kind === "softbox" ? 0.9 : 0.5,
        "#69727a",
        face,
      );
      if (!i.soft && i.kind !== "softbox") {
        const r = D.unit(D.cross([0, 1, 0], dir)),
          at = D.add(h, D.mul(dir, 0.52));
        [-1, 1].forEach((s) =>
          polygon(
            g,
            [
              D.add(at, D.mul(r, s * 0.34)),
              D.add(at, D.mul(r, s * 0.7)),
              D.add(D.add(at, D.mul(r, s * 0.7)), [0, 0.42, 0]),
              D.add(at, [s * r[0] * 0.34, 0.42, s * r[2] * 0.34]),
            ],
            "#30383f",
          ),
        );
      }
    } else if (i.kind === "camera") {
      const height = cameraHeights[i.height] || cameraHeights.eye;
      const hub = D.add(p, [0, Math.min(height, 3.8), 0]);
      for (let j = 0; j < 3; j++) {
        const t = (j * Math.PI * 2) / 3 + 0.2,
          foot = D.add(p, [Math.cos(t) * 1.05, 0, Math.sin(t) * 1.05]);
        line(g, hub, foot, 0.1, "#a2a9ad");
        line(
          g,
          D.add(p, [0, 1.2, 0]),
          D.add(foot, [0, 0.2, 0]),
          0.045,
          "#69737d",
        );
      }
      const cam = D.add(p, [-0.12, height + 0.35, 0]),
        yaw = Math.PI - ((i.pan || 0) * 25 * Math.PI) / 180,
        pitch = (i.height === "low" ? Math.atan2(4.15 - cam[1], Math.max(1, p[2])) : 0) + (i.tilt || 0) * 0.28,
        dir = [
          Math.sin(yaw) * Math.cos(pitch),
          Math.sin(pitch),
          Math.cos(yaw) * Math.cos(pitch),
        ];
      line(g, hub, cam, 0.13, "#adb4b7");
      box(g, D.add(cam, [0, -0.2, 0]), [0.5, 0.15, 0.4], "#69767f", yaw);
      line(
        g,
        D.add(cam, [0.2, -0.15, 0]),
        D.add(cam, [0.45, -0.35, 0.8]),
        0.07,
        "#77838b",
      );
      oriented(g, cam, dir, 0.55, 0.55, 0.4, "#75808a", "#333c42");
      box(g, D.add(cam, [-0.38, 0, 0.1]), [0.22, 0.52, 0.4], "#515c65", yaw);
      const lens = D.add(cam, D.mul(dir, 0.4));
      tube(
        g,
        lens,
        dir,
        0.21,
        (2.2 + ((Math.max(12, i.focal || 14) - 12) / 48) * 1.4) / 12,
        "#77858e",
      );
      cylinder(g, D.add(cam, [0.22, 0.32, 0.06]), 0.12, 0.09, "#b2b6b6");
      sphere(
        g,
        D.add(cam, [-0.22, 0.2, 0.25]),
        0.05,
        scene.rolling ? "#ff4f44" : "#762f2b",
        { "data-st-tally": scene.rolling ? "on" : "off" },
      );
      const screen = D.add(cam, [0, 0.04, 0.32]);
      box(g, screen, [0.44, 0.29, 0.04], "#548c9b", yaw);
      if (i.mic) {
        const mic = el("g", { "data-st-art-item": "camera-mic" }, g);
        line(
          mic,
          D.add(cam, [0, 0.3, 0]),
          D.add(cam, [0, 0.65, 0]),
          0.06,
          "#8b989f",
        );
        line(
          mic,
          D.add(cam, [0, 0.65, 0.27]),
          D.add(cam, [0, 0.65, -0.52]),
          0.15,
          "#59616b",
        );
      }
    } else if (i.kind === "boom") {
      stand(g, p, 5.5, 1.1, true);
      const tip = i.variant === "high" ? [-0.6, 7.6, 3.2] : [-0.3, 6.2, 1.6],
        base = D.add(p, [0, 5.5, 0]),
        end = D.add(tip, [
          p[0] + 3.4,
          i.lift || 0,
          p[2] - (i.variant === "high" ? 4.6 : 3),
        ]);
      line(g, D.add(base, [-1, -0.3, 0.4]), end, 0.075, "#b4bfc2");
      box(g, D.add(base, [-0.85, -0.24, 0.34]), [0.65, 0.35, 0.35], "#4c535a");
      line(g, end, D.add(end, [0, -0.55, -0.15]), 0.18, "#7a8186");
    } else if (i.kind === "lav") {
      const q = D.project(p),
        end = D.project([0.38, 2.4, 0.55]);
      path(
        g,
        "M" +
          q.sx +
          "," +
          q.sy +
          " Q" +
          (q.sx + 5) +
          "," +
          end.sy +
          " " +
          end.sx +
          "," +
          end.sy,
        "none",
        { stroke: "#11171d", "stroke-width": 1.2 },
      );
      box(g, [0.38, 2.32, 0.55], [0.16, 0.24, 0.15], "#303a42");
      sphere(g, p, 0.075, "#161a20");
    } else if (i.kind === "desk") {
      cylinder(g, p, 0.22, 0.05, "#68747b");
      line(g, p, D.add(p, [0, 0.55, 0]), 0.07, "#a3afb4");
      line(
        g,
        D.add(p, [0, 0.55, 0]),
        D.add(p, [-0.16, 0.82, -0.13]),
        0.19,
        "#939ca1",
      );
    } else if (i.kind === "phone") {
      box(g, D.add(p, [0, 0.045, 0]), [0.3, 0.09, 0.58], "#90979e", -0.2);
      polygon(
        g,
        [
          D.add(p, [-0.12, 0.095, -0.24]),
          D.add(p, [0.12, 0.095, -0.24]),
          D.add(p, [0.12, 0.095, 0.24]),
          D.add(p, [-0.12, 0.095, 0.24]),
        ],
        "#425e69",
      );
    } else if (i.kind === "room") {
      stand(g, p, 5.8, 0.8, false);
      line(
        g,
        D.add(p, [0, 5.8, 0]),
        D.add(p, [0, 6.2, -0.15]),
        0.11,
        "#c0c6c7",
      );
    } else if (i.kind === "camera-mic")
      line(
        g,
        D.add(p, [0, 0.1, 0.4]),
        D.add(p, [0, 0.1, -0.4]),
        0.17,
        "#7f8990",
      );
    return g;
  }
  function drawSubject() {
    const g = el("g", { "data-st-subject": "" }),
      origin = D.project([0, 2.65, 0.15]),
      s = D.project([0, 3, 0]).scale / 30;
    const art = el(
      "g",
      {
        transform:
          "translate(" + origin.sx + " " + origin.sy + ") scale(" + s + ")",
      },
      g,
    );
    // Stool, shoes and tailored silhouettes are hand-drawn for this fixed view.
    path(art, "M-21 21 L-27 81 M20 22 L23 79 M-3 28 L-5 90", "none", {
      stroke: "#83898c",
      "stroke-width": 4,
    });
    path(art, "M-25 64 L25 64", "none", {
      stroke: "#434d55",
      "stroke-width": 2,
    });
    el(
      "ellipse",
      {
        cx: 0,
        cy: 22,
        rx: 29,
        ry: 12,
        fill: "#151b22",
        stroke: "#626c73",
        "stroke-width": 1.5,
      },
      art,
    );
    path(
      art,
      "M-20 17 Q-31 26 -23 47 L-19 76 L-3 78 L0 43 L4 44 L6 80 L23 78 L25 43 Q29 25 20 17Z",
      "#26333d",
    );
    path(art, "M-21 43 L-16 72 M19 42 L17 72", "none", {
      stroke: "#44525c",
      "stroke-width": 3,
    });
    path(
      art,
      "M-20 73 Q-24 77 -28 85 Q-20 91 -3 85 L-3 76Z M7 76 L7 86 Q21 92 30 85 L22 76Z",
      "#111920",
      { stroke: "#60686e", "stroke-width": 1 },
    );
    path(
      art,
      "M-14 -37 Q-28 -33 -34 -19 L-28 0 L-22 -3 L-23 21 Q0 30 24 19 L21 -4 L29 0 L34 -20 Q27 -34 13 -38Z",
      "#356989",
    );
    path(art, "M-14 -35 Q-1 -23 14 -35 L11 -43 L-10 -43Z", "#b98567");
    path(
      art,
      "M-28 -5 Q-34 5 -25 22 L-12 29 Q-7 27 -11 22 L-19 16 L-20 -7Z M22 -6 L23 14 L11 22 Q7 28 13 28 L27 21 Q35 9 29 -4Z",
      "#c99b7c",
    );
    path(art, "M-25 -7 L-20 -7 M21 -7 L29 -4", "none", {
      stroke: "#7aabbc",
      "stroke-width": 2,
    });
    path(art, "M-12 22 L-8 26 M-16 24 L-11 29 M15 24 L11 28", "none", {
      stroke: "#9b6d59",
      "stroke-width": 1,
    });
    path(
      art,
      "M-22 -18 Q-19 -5 -20 13 M20 -16 L18 14 M-11 17 Q0 21 13 16",
      "none",
      { stroke: "#234b69", "stroke-width": 2 },
    );
    path(
      art,
      "M-16 -59 Q-19 -42 -8 -34 Q0 -29 10 -36 Q18 -44 17 -60 L11 -70 L-10 -71Z",
      "#ce9e80",
    );
    path(
      art,
      "M-16 -53 Q-21 -59 -17 -70 Q-10 -83 6 -78 Q20 -77 19 -61 L15 -51 L11 -63 Q1 -58 -10 -66 L-13 -51Z",
      "#272728",
    );
    path(art, "M-14 -70 Q-2 -79 12 -69", "none", {
      stroke: "#4c4640",
      "stroke-width": 3,
    });
    path(art, "M-11 -52 L-5 -52 M5 -53 L11 -52", "none", {
      stroke: "#51463e",
      "stroke-width": 1.5,
    });
    path(art, "M1 -51 L-1 -43 L3 -42 M-5 -38 Q1 -36 7 -39", "none", {
      stroke: "#996b57",
      "stroke-width": 1.2,
    });
    const layers = el("g", { "data-subject-light-layers": "" }, art);
    const shapes = {
      "lit-camera-left":
        "M-13 -63 Q-20 -43 -7 -35 L-8 -30 L-28 -25 L-23 14 L-2 21 L-2 -35 L1 -62Z",
      "lit-camera-right":
        "M3 -62 L13 -62 Q18 -44 7 -36 L9 -30 L28 -22 L23 14 L2 21 L2 -35Z",
      "lit-front":
        "M-13 -62 Q0 -68 14 -61 L14 -47 Q9 -31 0 -33 Q-12 -34 -15 -48Z",
      rim: "M-20 -64 Q-20 -82 4 -80 Q19 -78 20 -62 L17 -65 Q10 -78 -3 -75 Q-15 -75 -17 -62Z M-16 -36 Q-30 -33 -35 -20 L-31 -17 Q-26 -29 -16 -32Z M16 -35 Q30 -31 35 -20 L31 -17 Q25 -29 16 -31Z",
      "lit-top":
        "M-17 -69 Q-6 -81 9 -76 L16 -67 Q0 -74 -17 -66Z M0 -53 L-2 -43 L3 -43 L4 -52Z",
      "eye-shadow":
        "M-13 -55 L-3 -55 L-3 -49 L-12 -49Z M4 -55 L13 -55 L12 -49 L4 -49Z",
      "lit-under":
        "M-12 -42 Q0 -29 12 -43 L7 -35 L-3 -32Z M-3 -43 L4 -43 L4 -40 L-3 -40Z",
      "room-dark":
        "M-17 -69 Q0 -88 18 -67 L17 -42 L14 -36 Q30 -34 34 -20 L30 1 L28 22 L25 44 L24 78 L30 85 L8 90 L-4 85 L-27 90 L-20 75 L-25 44 L-27 24 L-34 7 L-34 -20 Q-29 -33 -14 -37Z",
    };
    Object.keys(shapes).forEach((k) =>
      path(
        layers,
        shapes[k],
        k === "eye-shadow" || k === "room-dark" ? "#0b111c" : "#ffe6b8",
        {
          "data-light-layer": k,
          opacity: 0,
          style:
            "mix-blend-mode:" +
            (k === "eye-shadow" || k === "room-dark" ? "multiply" : "screen"),
        },
      ),
    );
    return g;
  }
  function create(svg) {
    const id = "stkit-" + ++serial + "-",
      defs = el("defs", {}, svg);
    const gradient = (name, type, attrs, stops) => {
      const g = el(type, Object.assign({ id: id + name }, attrs), defs);
      stops.forEach((s) =>
        el(
          "stop",
          {
            offset: s[0],
            "stop-color": s[1],
            "stop-opacity": s[2] == null ? 1 : s[2],
          },
          g,
        ),
      );
    };
    gradient("floor", "linearGradient", { x1: 0, y1: 0, x2: 0.3, y2: 1 }, [
      ["0%", "#30353a"],
      ["100%", "#171c22"],
    ]);
    gradient("wall", "linearGradient", { x1: 0, y1: 0, x2: 0, y2: 1 }, [
      ["0%", "#22272c"],
      ["100%", "#3b4144"],
    ]);
    gradient("paper", "linearGradient", { x1: 0, y1: 0, x2: 0, y2: 1 }, [
      ["0%", "#4a4b47"],
      ["70%", "#555752"],
      ["84%", "#62645e"],
      ["100%", "#454943"],
    ]);
    gradient("pool", "radialGradient", {}, [
      ["0%", "#ffe7b9", 0.6],
      ["55%", "#ffe7b9", 0.22],
      ["100%", "#ffe7b9", 0],
    ]);
    gradient("shadow", "radialGradient", {}, [
      ["0%", "#05080c", 0.65],
      ["65%", "#05080c", 0.3],
      ["100%", "#05080c", 0],
    ]);
    gradient("hard-pool", "radialGradient", {}, [
      ["0%", "#fff1cc", 0.8],
      ["55%", "#ffe5aa", 0.55],
      ["85%", "#ffe5aa", 0.22],
      ["100%", "#ffe5aa", 0],
    ]);
    Object.entries({
      light: "#eac079",
      camera: "#83a8f9",
      mic: "#7ee1cf",
    }).forEach(([kind, color]) => {
      const f = el(
        "filter",
        {
          id: id + "lift-" + kind,
          x: "-25%",
          y: "-25%",
          width: "150%",
          height: "150%",
        },
        defs,
      );
      el(
        "feDropShadow",
        {
          dx: 0,
          dy: 0,
          stdDeviation: 2,
          "flood-color": color,
          "flood-opacity": 0.7,
        },
        f,
      );
    });
    [true, false].forEach((soft) => {
      const f = el(
        "filter",
        {
          id: id + (soft ? "soft-shadow" : "hard-shadow"),
          x: "-35%",
          y: "-35%",
          width: "170%",
          height: "170%",
        },
        defs,
      );
      el("feGaussianBlur", { stdDeviation: soft ? 5 : 1.3 }, f);
    });
    const floorClip = el("clipPath", { id: id + "floor-clip" }, defs);
    polygon(
      floorClip,
      [
        [-16, 0, -6],
        [16, 0, -6],
        [16, 0, 22],
        [-16, 0, 22],
      ],
      "#fff",
    );
    const paperClip = el("clipPath", { id: id + "paper-clip" }, defs);
    polygon(
      paperClip,
      [
        [-5, 0, -5.9],
        [5, 0, -5.9],
        [5, 9, -5.9],
        [-5, 9, -5.9],
      ],
      "#fff",
    );
    const room = el(
      "g",
      { "data-st-layer": "room", "pointer-events": "none" },
      svg,
    );
    el("rect", { width: 1000, height: 625, fill: "#1c2229" }, room);
    polygon(
      room,
      [
        [-15, 0, -6],
        [15, 0, -6],
        [15, 12, -6],
        [-15, 12, -6],
      ],
      "url(#" + id + "wall)",
    );
    polygon(
      room,
      [
        [-11, 0, -6],
        [-11, 0, 15],
        [-11, 13, 15],
        [-11, 13, -6],
      ],
      "#252c31",
    );
    polygon(
      room,
      [
        [-16, 0, -6],
        [16, 0, -6],
        [16, 0, 22],
        [-16, 0, 22],
      ],
      "url(#" + id + "floor)",
    );
    for (let x = -11; x <= 11; x++)
      line(room, [x, 0.005, -6], [x, 0.005, 20], 0.012, "#42494c", {
        opacity: 0.3,
      });
    polygon(
      room,
      [
        [-5, 9, -5.98],
        [5, 9, -5.98],
        [5, 1, -5.98],
        [5, 0.12, -4.5],
        [5, 0.02, -1.8],
        [-5, 0.02, -1.8],
        [-5, 0.12, -4.5],
        [-5, 1, -5.98],
      ],
      "url(#" + id + "paper)",
    );
    line(room, [-5.2, 9, -5.96], [5.2, 9, -5.96], 0.16, "#262d31");
    [-2, 2, 6].forEach((z) => {
      line(room, [-13, 10.5, z], [13, 10.5, z], 0.11, "#131a21");
      line(room, [-13, 10.55, z], [13, 10.55, z], 0.025, "#68727a");
    });
    [-8, 7].forEach((x) =>
      line(room, [x, 10.5, -6], [x, 10.5, 12], 0.08, "#202930"),
    );
    [0, 6].forEach((z) => {
      const a = [-10.9, 6.5, z];
      sphere(room, a, 0.85, "url(#" + id + "pool)");
      line(room, D.add(a, [0, 0.4, 0]), a, 0.08, "#aaa08b");
      sphere(room, a, 0.12, "#e4bf86");
    });
    box(room, [-10.87, 1.3, 3], [0.12, 0.48, 0.65], "#b2b0a3");
    [2.85, 3.15].forEach((z) =>
      sphere(room, [-10.79, 1.3, z], 0.065, "#1e272d"),
    );
    const pools = el(
      "g",
      { "data-st-layer": "pools", "pointer-events": "none" },
      svg,
    );
    const exposure = el(
      "rect",
      {
        width: 1000,
        height: 625,
        fill: "#070e18",
        opacity: 0.3,
        "pointer-events": "none",
        "data-st-room-dark": "",
      },
      svg,
    );
    const cables = el(
      "g",
      { "data-st-layer": "cables", "pointer-events": "none" },
      svg,
    );
    const shadows = el(
      "g",
      { "data-st-layer": "shadows", "pointer-events": "none" },
      svg,
    );
    const items = el("g", { "data-st-layer": "items" }, svg),
      beams = el(
        "g",
        { "data-st-layer": "beams", "pointer-events": "none" },
        svg,
      );
    const subject = drawSubject(),
      table = el("g", { "data-st-table": "" });
    [
      [0.9, 1.1],
      [3.1, 1.1],
      [0.9, 3.4],
      [3.1, 3.4],
    ].forEach((p) =>
      line(table, [p[0], 0, p[1]], [p[0], 2, p[1]], 0.09, "#515c64"),
    );
    box(table, [2, 2, 2.25], [2.4, 0.13, 2.5], "#586167");
    const nodes = new Map(),
      shadowNodes = new Map();
    let scene = { items: [], selected: null, dragged: null, rolling: false };
    function shadow(i) {
      const q = el("g", { "data-shadow-for": i.id });
      if (i.kind !== "lav" && i.mark !== "top" && i.kind !== "camera-mic")
        path(
          q,
          D.disc(
            [i.point[0], 0.015, i.point[2]],
            (i.kind === "camera" ? 1.45 : 1.1) * (1 + (i.lift || 0)),
          ),
          "url(#" + id + "shadow)",
          { opacity: i.lift ? 0.5 : 1 },
        );
      return q;
    }
    function sort(extra) {
      const list = [
        { node: subject, point: [0, 0, 0] },
        { node: table, point: [2, 0, 2.25] },
      ];
      scene.items.forEach((i) => {
        const item = extra && i.id === extra.id ? extra : i;
        if (nodes.has(i.id))
          list.push({
            node: nodes.get(i.id),
            point: item.point,
            lav: item.kind === "lav",
          });
      });
      if (
        extra &&
        !scene.items.some((i) => i.id === extra.id) &&
        nodes.has(extra.id)
      )
        list.push({
          node: nodes.get(extra.id),
          point: extra.point,
          lav: extra.kind === "lav",
        });
      list.sort(
        (a, b) =>
          (a.lav ? 1e4 : 0) - (b.lav ? 1e4 : 0) ||
          D.project(b.point).depth - D.project(a.point).depth,
      );
      list.forEach((v) => items.appendChild(v.node));
    }
    function effects() {
      pools.replaceChildren();
      beams.replaceChildren();
      cables.replaceChildren();
      const lights = scene.items.filter((i) => i.kind === "light"),
        total = lights.reduce((v, i) => v + (i.level || 0) / 100, 0),
        strength = {};
      exposure.setAttribute("opacity", Math.max(0.02, 0.42 - total * 0.15));
      lights.forEach((i) => {
        const h = lightHead(i),
          level = (i.level || 0) / 100;
        strength[i.mark] = Math.max(strength[i.mark] || 0, level);
        const a = D.project(i.point),
          b = D.project([-10.8, 0, 3]);
        path(
          cables,
          "M" +
            a.sx +
            "," +
            a.sy +
            " C" +
            (a.sx - 40) +
            "," +
            (a.sy + 38) +
            " " +
            (b.sx + 80) +
            "," +
            (b.sy + 20) +
            " " +
            b.sx +
            "," +
            b.sy,
          "none",
          { stroke: "#0c1319", "stroke-width": 1.7 },
        );
        if (level <= 0) return;
        const aim = D.unit(D.sub([0, 4.15, 0], h));
        const axis = D.unit([aim[0], 0, aim[2]]),
          side = [axis[2], 0, -axis[0]];
        // A low upward light spills on the floor near its stand. Downward heads
        // intersect the floor farther along their actual aiming direction.
        const distance = aim[1] < -0.08 ? Math.min(12, -h[1] / aim[1]) : 2.1;
        const center = D.add(h, D.mul(aim, distance));
        center[1] = 0.025;
        const radius = i.soft ? 3.7 : 2.3,
          stretch = Math.min(2.1, 1 / Math.max(0.45, Math.abs(aim[1])));
        const ring = Array.from({ length: 40 }, (_, n) => {
          const t = (n * Math.PI) / 20;
          return D.add(
            center,
            D.add(
              D.mul(side, Math.cos(t) * radius),
              D.mul(axis, Math.sin(t) * radius * stretch),
            ),
          );
        });
        polygon(
          pools,
          ring,
          "url(#" + id + (i.soft ? "pool" : "hard-pool") + ")",
          {
            opacity: level * (i.soft ? 0.43 : 0.55),
            "data-light-pool": i.id,
            "clip-path": "url(#" + id + "floor-clip)",
          },
        );
        // Continue rays from the head through the face to the seamless paper.
        // Clip spill and silhouettes to the physical 10-foot paper width.
        if (aim[2] < -0.01) {
          const t = (-5.94 - h[2]) / aim[2];
          if (t > 0) {
            const at = D.add(h, D.mul(aim, t)),
              r = (i.soft ? 0.45 : 0.29) * t;
            const spill = Array.from({ length: 40 }, (_, n) => {
              const a = (n * Math.PI) / 20;
              return [at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r, -5.94];
            });
            polygon(
              pools,
              spill,
              "url(#" + id + (i.soft ? "pool" : "hard-pool") + ")",
              {
                opacity: level * 0.42,
                "clip-path": "url(#" + id + "paper-clip)",
              },
            );
          }
        }
        const silhouette = [
          [-0.85, 2.4, 0.08],
          [-0.9, 3.5, 0.08],
          [-0.52, 3.9, 0.08],
          [-0.3, 4.02, 0.08],
          [-0.38, 4.48, 0.08],
          [-0.28, 4.8, 0.08],
          [0, 4.94, 0.08],
          [0.28, 4.8, 0.08],
          [0.38, 4.48, 0.08],
          [0.3, 4.02, 0.08],
          [0.52, 3.9, 0.08],
          [0.9, 3.5, 0.08],
          [0.85, 2.4, 0.08],
        ];
        const cast = (axis, value) =>
          silhouette.map((p) => {
            const delta = p[axis] - h[axis],
              t = (value - h[axis]) / delta;
            return t > 1 && t < 16 ? D.add(h, D.mul(D.sub(p, h), t)) : null;
          });
        const shadowAttrs = {
          opacity: level * (i.soft ? 0.22 : 0.38),
          filter: "url(#" + id + (i.soft ? "soft-shadow" : "hard-shadow") + ")",
        };
        const paperShadow = cast(2, -5.93);
        if (paperShadow.every(Boolean))
          polygon(
            pools,
            paperShadow,
            "#080e15",
            Object.assign(
              { "clip-path": "url(#" + id + "paper-clip)" },
              shadowAttrs,
            ),
          );
        const floorShadow = cast(1, 0.03);
        if (floorShadow.every(Boolean))
          polygon(
            pools,
            floorShadow,
            "#060c13",
            Object.assign(
              { "clip-path": "url(#" + id + "floor-clip)" },
              shadowAttrs,
            ),
          );
        if (i.id !== scene.dragged) {
          const q = D.project(h),
            l = D.project([-1, 2.2, 0]),
            r = D.project([1, 5, 0]);
          path(
            beams,
            "M" +
              q.sx +
              "," +
              q.sy +
              " L" +
              l.sx +
              "," +
              l.sy +
              " Q" +
              (r.sx + 25) +
              "," +
              l.sy +
              " " +
              r.sx +
              "," +
              r.sy +
              " Z",
            "#ffe8bb",
            {
              opacity: level * (i.soft ? 0.055 : 0.085),
              style: "mix-blend-mode:screen",
            },
          );
        }
      });
      const levels = {
        "lit-camera-left":
          Math.max(strength.key || 0, strength.side || 0) * 0.5,
        "lit-camera-right": (strength.fill || 0) * 0.36,
        "lit-front": (strength.front || 0) * 0.45,
        rim: (strength.back || 0) * 0.85,
        "lit-top": (strength.top || 0) * 0.7,
        "eye-shadow": (strength.top || 0) * 0.48,
        "lit-under": (strength.under || 0) * 0.65,
        "room-dark": Math.max(0, 0.75 - total * 0.4),
      };
      subject
        .querySelectorAll("[data-light-layer]")
        .forEach((n) =>
          n.setAttribute(
            "opacity",
            levels[n.getAttribute("data-light-layer")] || 0,
          ),
        );
      let selected = scene.items.find((i) => i.id === scene.selected);
      if (scene.selected === "camera-mic") {
        const camera = scene.items.find((i) => i.kind === "camera" && i.mic);
        if (camera) {
          selected = {
            kind: "camera-mic",
            point: D.add(camera.point, [-0.12, cameraHeights[camera.height] + 1, 0]),
          };
        }
      }
      if (selected && selected.kind === "camera") {
        const p = selected.point,
          angle = Math.atan(8.65 / (selected.focal || 14)),
          yaw = ((selected.pan || 0) * 25 * Math.PI) / 180;
        polygon(
          pools,
          [
            [p[0], 0.03, p[2]],
            [Math.sin(yaw - angle) * 7, 0.03, p[2] - Math.cos(yaw - angle) * 7],
            [Math.sin(yaw + angle) * 7, 0.03, p[2] - Math.cos(yaw + angle) * 7],
          ],
          "#658fea",
          { opacity: 0.1, stroke: "#7da2ef", "stroke-width": 1 },
        );
      } else if (
        selected &&
        ["room", "phone", "desk", "boom", "lav", "camera-mic"].includes(selected.kind)
      ) {
        let capsule = selected.point;
        if (selected.kind === "room") capsule = D.add(capsule, [0, 6, 0]);
        if (selected.kind === "desk")
          capsule = D.add(capsule, [-0.16, 0.82, -0.13]);
        if (selected.kind === "boom")
          capsule =
            selected.variant === "high" ? [-0.6, 7.6, 3.2] : [-0.3, 6.2, 1.6];
        if (["room", "phone", "lav"].includes(selected.kind)) {
          const q = D.project(capsule),
            r =
              q.scale *
              (selected.kind === "room"
                ? 1.6
                : selected.kind === "phone"
                  ? 1.15
                  : 0.38);
          el(
            "ellipse",
            {
              cx: q.sx,
              cy: q.sy,
              rx: r,
              ry: r * 0.85,
              fill: "#63d8ca",
              opacity: 0.09,
              stroke: "#8fe4db",
              "stroke-width": 1,
            },
            beams,
          );
        } else {
          const narrow = selected.kind === "boom" || selected.kind === "camera-mic";
          const axis = D.unit(D.sub([0, 4.3, 0.15], capsule)),
            side = D.unit(D.cross(axis, [0, 1, 0])),
            length = narrow ? 2.8 : 1.65,
            width = narrow ? 0.35 : 0.8;
          const points = Array.from({ length: 40 }, (_, n) => {
            const t = (n * Math.PI) / 20,
              cardioid = 0.5 * (1 + Math.cos(t));
            return D.add(
              capsule,
              D.add(
                D.mul(axis, Math.cos(t) * cardioid * length),
                D.mul(side, Math.sin(t) * cardioid * width),
              ),
            );
          });
          polygon(beams, points, "#63d8ca", {
            opacity: 0.13,
            stroke: "#8fe4db",
            "stroke-width": 1,
          });
        }
      }
    }
    function render(next) {
      scene = next;
      nodes.forEach((n) => n.remove());
      nodes.clear();
      shadowNodes.forEach((n) => n.remove());
      shadowNodes.clear();
      shadows.replaceChildren();
      scene.items.forEach((i) => {
        const n = equipment(i, scene, id);
        nodes.set(i.id, n);
        const s = shadow(i);
        shadows.appendChild(s);
        shadowNodes.set(i.id, s);
      });
      path(shadows, D.disc([0, 0.02, 0], 1.4), "url(#" + id + "shadow)");
      sort();
      effects();
    }
    function drag(i) {
      if (!i) {
        render(scene);
        return;
      }
      const old = nodes.get(i.id),
        n = equipment(i, Object.assign({}, scene, { dragged: i.id }), id);
      if (old) old.replaceWith(n);
      else items.appendChild(n);
      nodes.set(i.id, n);
      const oldShadow = shadowNodes.get(i.id),
        s = shadow(i);
      if (oldShadow) oldShadow.replaceWith(s);
      else shadows.appendChild(s);
      shadowNodes.set(i.id, s);
      sort(i);
    }
    return { render: render, drag: drag };
  }
  function icon(kind) {
    const svg = el("svg", {
        viewBox: "0 0 64 48",
        "aria-hidden": "true",
        width: 64,
        height: 48,
      }),
      g = el("g", {}, svg);
    // Compact silhouettes preserve the same equipment vocabulary without tiny details.
    if (kind === "light" || kind === "softbox") {
      if (kind === "light")
        path(g, "M32 20V39M32 33L19 44M32 33L45 44", "none", {
          stroke: "#aab6bd",
          "stroke-width": 2,
        });
      path(
        g,
        kind === "softbox"
          ? "M18 6L41 4L47 21L23 26Z"
          : "M24 8L39 8L43 22L24 22Z",
        "#ece3ca",
        { stroke: "#596772", "stroke-width": 3 },
      );
    } else if (kind === "phone")
      path(g, "M20 7L41 9L43 40L21 38Z", "#4a7988", {
        stroke: "#9cabb6",
        "stroke-width": 3,
      });
    else if (kind === "lav") {
      path(g, "M30 19Q45 34 27 44", "none", {
        stroke: "#8398a5",
        "stroke-width": 2,
      });
      el(
        "rect",
        { x: 25, y: 7, width: 10, height: 17, rx: 4, fill: "#a5b5be" },
        g,
      );
    } else {
      path(g, "M27 22V38M27 36L17 44M27 36L39 44", "none", {
        stroke: "#91a6b2",
        "stroke-width": 2,
      });
      path(
        g,
        kind === "boom" ? "M14 27L45 8M41 9L48 15" : "M27 23L35 10",
        "none",
        {
          stroke: "#b7c7cf",
          "stroke-width": kind === "boom" ? 4 : 7,
          "stroke-linecap": "round",
        },
      );
    }
    return svg;
  }
  window.StudioKit = { create: create, icon: icon };
})();
