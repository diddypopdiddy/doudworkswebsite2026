/* Street-name signs and pedestrians: the life of the town. */
RT.createProps = function (scene, map, quality) {
  const T = THREE, B = RT.Build;

  // ---------- green street-name blades at every intersection ----------
  {
    const names = [...new Set(map.segments.map((s) => s.name))];
    const row = 56, height = 2 ** Math.ceil(Math.log2(row * names.length + 8));
    const [canvas, g] = B.canvas(256, height);
    g.fillStyle = '#1e6b3a'; g.fillRect(0, 0, canvas.width, height);
    g.font = 'bold 28px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = g.fillStyle = '#ffffff'; g.lineWidth = 3;
    names.forEach((name, i) => {
      const y = i * row + 8;
      g.strokeRect(4, y + 4, 248, 40);
      g.fillText(name.toUpperCase(), 128, y + 26);
    });
    const spots = {}; // name -> [{x,y,z,rot}]
    const poles = new B.Batch();
    for (const n of map.nodes) {
      if (n.degree < 3) continue;
      // pole on the south-east corner beyond the cut-back
      const px = n.x + n.halfX + map.CORNER + 0.6, pz = n.z + n.halfZ + map.CORNER + 0.6;
      poles.cyl(px, 0.2, pz, 0.06, 3.4, 0x6f757c, 6);
      const ew = map.segments[n.exits.E !== null ? n.exits.E : n.exits.W], ns = map.segments[n.exits.N !== null ? n.exits.N : n.exits.S];
      if (ew) (spots[ew.name] = spots[ew.name] || []).push({ x: px, y: 3.45, z: pz, rot: 0 });          // blade runs east-west
      if (ns) (spots[ns.name] = spots[ns.name] || []).push({ x: px, y: 3.15, z: pz, rot: Math.PI / 2 }); // blade runs north-south
    }
    // All street-name blades share one atlas and one draw.
    const blades = new B.Batch();
    const matrix = new T.Matrix4();
    const box = new T.BoxGeometry(1.5, 0.28, 0.03);
    const srcUv = box.attributes.uv;
    names.forEach((name, i) => {
      const geo = box.clone(), uv = geo.attributes.uv;
      for (const group of geo.groups) {
        const face = group.materialIndex >= 4;
        for (let index = group.start; index < group.start + group.count; index++) {
          const v = geo.index.getX(index);
          if (face) uv.setXY(v, srcUv.getX(v), 1 - (i * row + 8 + (1 - srcUv.getY(v)) * 48) / height);
          else uv.setXY(v, 0.5, 1 - 3 / height);
        }
      }
      for (const s of spots[name] || []) blades.addGeometry(geo, matrix.makeRotationY(s.rot).setPosition(s.x, s.y, s.z), 0xffffff);
      geo.dispose();
    });
    box.dispose();
    scene.add(blades.build(B.M({ map: B.toTexture(canvas) })));
    scene.add(poles.build(B.M({ vertexColors: true })));
  }

  return RT.createPedestrians(scene, map, quality);
};
