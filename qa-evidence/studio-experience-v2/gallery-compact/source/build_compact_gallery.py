#!/usr/bin/env python3
"""Build the compact, connected three-room gallery package.

Web coordinates are (x, y, z); Blender coordinates are (x, -z, y).
The browser owns lighting/exterior presentation.  This file owns a closed
interior envelope, physical art supports, and the movement data contract.
"""
from pathlib import Path
import json
import sys
import math
import bpy
from mathutils import Vector

SOURCE = Path(__file__).resolve().parent
OUT = SOURCE.parent
EXPERIENCE = OUT.parent
ART_DIR = EXPERIENCE / "selected-art"
TEXTURES = EXPERIENCE / "gallery-corner" / "textures"
PACKED = EXPERIENCE / "gallery-corner" / "source" / "packed-textures"
BLEND, GLB = OUT / "gallery-compact.blend", OUT / "room.glb"
MANIFEST, PREVIEW = OUT / "room-manifest.json", OUT / "preview.png"
COLLIDERS = []
sys.path.insert(0, str(SOURCE))
from dimensional_art import build_dimensional_art


def b(p):
    return (p[0], -p[2], p[1])


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for pool in (bpy.data.meshes, bpy.data.materials, bpy.data.images,
                 bpy.data.lights, bpy.data.cameras):
        for item in list(pool):
            if item.users == 0:
                pool.remove(item)


def material(name, color, rough=.7, metal=0, texture=None, alpha=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if texture:
        image = bpy.data.images.load(str(texture), check_existing=True)
        tex = m.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        m.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if alpha and image.channels == 4:
            m.node_tree.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
            bsdf.inputs["Alpha"].default_value = 1
            m.surface_render_method = "DITHERED"
    return m


def pbr(name, packed, normal, rough, tiles=1):
    """Reuse approved portable brick/plaster/concrete/oak texture families."""
    m = material(name, (.7, .7, .7), .7)
    nodes, links = m.node_tree.nodes, m.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    uv = nodes.new("ShaderNodeUVMap")
    for filename, label, socket, noncolor in (
        (packed, "base", "Base Color", False),
        (normal, "normal", None, True),
        (rough, "roughness", "Roughness", True),
    ):
        node = nodes.new("ShaderNodeTexImage")
        node.name = f"{name} {label}"
        node.image = bpy.data.images.load(str(filename), check_existing=True)
        # Keep the portable room materials at the approved gallery-corner
        # 1024px budget. Artwork retains its selected-art source resolution.
        if node.image.size[0] > 1024:
            node.image.scale(1024, max(1, round(node.image.size[1] * 1024 / node.image.size[0])))
        node.image.colorspace_settings.name = "Non-Color" if noncolor else "sRGB"
        links.new(uv.outputs["UV"], node.inputs["Vector"])
        if socket:
            links.new(node.outputs["Color"], bsdf.inputs[socket])
        else:
            normal_node = nodes.new("ShaderNodeNormalMap")
            normal_node.inputs["Strength"].default_value = .32
            links.new(node.outputs["Color"], normal_node.inputs["Color"])
            links.new(normal_node.outputs["Normal"], bsdf.inputs["Normal"])
    m["approvedMaterial"] = name
    m["uvTiles"] = tiles
    return m


def web_uv(obj, tiles=1.0):
    """Author meter-scaled UVs instead of relying on Blender's cube unwrap."""
    layer = obj.data.uv_layers.active
    if not layer:
        return
    for poly in obj.data.polygons:
        n = poly.normal
        for loop_index in poly.loop_indices:
            co = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            if abs(n.x) > .5:
                u,v=co.y*tiles,co.z*tiles
            elif abs(n.y) > .5:
                u,v=co.x*tiles,co.z*tiles
            else:
                u,v=co.x*tiles,co.y*tiles
            layer.data[loop_index].uv=(u,v)


def box(name, center, dims, mat, collider=False, bevel=.0):
    bpy.ops.mesh.primitive_cube_add(location=b(center))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (dims[0], dims[2], dims[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    web_uv(obj, float(mat.get("uvTiles", 1.0)))
    if bevel:
        modifier = obj.modifiers.new("soft construction edge", "BEVEL")
        modifier.width, modifier.segments = bevel, 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    if collider:
        COLLIDERS.append({"minX": round(center[0]-dims[0]/2, 3), "maxX": round(center[0]+dims[0]/2, 3),
                          "minZ": round(center[2]-dims[2]/2, 3), "maxZ": round(center[2]+dims[2]/2, 3),
                          "name": name})
    return obj


def cylinder(name, center, radius, depth, mat, normal=(0, 0, 1), vertices=48):
    # Blender cylinder runs along local Z.  Rotate it to the web-space normal.
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=b(center))
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = Vector(b(normal)).to_track_quat("Z", "Y").to_euler()
    obj.data.materials.append(mat)
    return obj


def look(obj, target):
    obj.rotation_euler = (Vector(b(target)) - obj.location).to_track_quat("-Z", "Y").to_euler()


def web_hit(origin, direction):
    deps = bpy.context.evaluated_depsgraph_get()
    hit, loc, _, _, wall, _ = bpy.context.scene.ray_cast(deps, Vector(b(origin)), Vector(b(direction)), distance=.8)
    if not hit or not wall.name.startswith("WALL_"):
        raise AssertionError(f"art needs a solid wall: origin={tuple(round(v, 3) for v in origin)} direction={tuple(round(v, 3) for v in direction)} hit={wall and wall.name}")
    return Vector((loc.x, loc.z, -loc.y))


def art_mesh(name, center, normal, width, height, mat, uv_corners=None, paper=False):
    up, n = Vector((0, 1, 0)), Vector(normal)
    right = up.cross(n).normalized()
    nx, ny = (8, 10) if paper else (1, 1)
    uv_corners = uv_corners or ((0,0),(1,0),(1,1),(0,1))
    verts, faces, uvs = [], [], []
    for iy in range(ny+1):
        v = iy / ny
        for ix in range(nx+1):
            u = ix / nx
            curl = .0012 * (1-v)**3 * abs(u-.5)**4 * 16 if paper else 0
            verts.append(b(Vector(center)+right*((u-.5)*width)+up*((v-.5)*height)+n*curl))
            lower = Vector(uv_corners[0]).lerp(Vector(uv_corners[1]),u)
            upper = Vector(uv_corners[3]).lerp(Vector(uv_corners[2]),u)
            uvs.append(lower.lerp(upper,v))
    for iy in range(ny):
        for ix in range(nx):
            a=iy*(nx+1)+ix; faces.append((a,a+1,a+nx+2,a+nx+1))
    mesh = bpy.data.meshes.new(name + "_MESH")
    mesh.from_pydata(verts, [], faces)
    mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        for loop in poly.loop_indices:
            mesh.uv_layers.active.data[loop].uv = uvs[mesh.loops[loop].vertex_index]
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def clock_disc(name, center, normal, diameter, mat, uv_bounds):
    """A front-facing circular fan, cropped to the transparent source's useful bounds."""
    import math
    n, up = Vector(normal), Vector((0,1,0)); right = up.cross(n).normalized()
    u0, top, u1, bottom = uv_bounds
    verts=[b(center)]; uvs=[((u0+u1)/2, 1-(top+bottom)/2)]; faces=[]; count=64
    for i in range(count):
        angle=math.tau*i/count; x,y=math.cos(angle),math.sin(angle)
        verts.append(b(Vector(center)+right*x*diameter/2+up*y*diameter/2))
        # Incoming bounds use top-left image origin; Blender UV uses bottom-left.
        uvs.append((u0+(x+1)*(u1-u0)/2, 1-(top+(1-y)*(bottom-top)/2)))
    for i in range(count): faces.append((0,i+1,(i+1)%count+1))
    mesh=bpy.data.meshes.new(name+"_MESH"); mesh.from_pydata(verts,[],faces); mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        for loop in poly.loop_indices: mesh.uv_layers.active.data[loop].uv=uvs[mesh.loops[loop].vertex_index]
    mesh.update(); obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj); obj.data.materials.append(mat)
    return obj


def art_surface(index, item, center, normal, room, mats):
    physical = item["physical"]
    width, height, depth = physical["width"], physical["height"], physical["depth"]
    is_clock = index == 12
    # Cast from the room toward the wall. Casting out from inside a wall can
    # choose a buried perpendicular end cap instead of the visible wall face.
    anchor = web_hit(Vector(center)+Vector(normal)*.25, -Vector(normal))
    if physical.get("relief"):
        art, image_center, maximum_depth = build_dimensional_art(index, item, anchor, normal, mats, {"material":material, "ART_DIR":ART_DIR})
        art["roomId"] = room
        return image_center, list(anchor), width, height, maximum_depth
    gap = .004 if physical["mount"] != "paper" else .001
    image_center = anchor + Vector(normal) * (depth + gap + .001)
    if is_clock:
        support = cylinder(f"SUPPORT_{index}_CLOCK_RED_SIDE", anchor+Vector(normal)*(depth/2+gap), width/2, depth, mats["clock_red"], normal)
        art = clock_disc(f"ART_{index}", image_center, normal, width,
                         material(f"ARTWORK_{index}_MATERIAL", (1,1,1), .43, texture=ART_DIR/item["file"], alpha=True), physical["uvBounds"])
    else:
        support_mat = mats["oak"] if physical["mount"] == "wood" else mats["canvas_edge"] if physical["mount"] == "canvas" else mats["paper"]
        dims = (depth, height, width) if abs(normal[0]) > .5 else (width, height, depth)
        support = box(f"SUPPORT_{index}_{physical['mount'].upper()}", anchor+Vector(normal)*(depth/2+gap), dims, support_mat, bevel=.001)
        face_w, face_h = width, height
        if physical["mount"] == "paper":
            ratio=item["width"]/item["height"]
            face_w=min(width,height*ratio); face_h=face_w/ratio
        art = art_mesh(f"ART_{index}", image_center, normal, face_w, face_h,
                       material(f"ARTWORK_{index}_MATERIAL", (1,1,1), .45, texture=ART_DIR/item["file"]),
                       physical.get("uvCorners"), physical["mount"] == "paper")
        if physical["mount"] == "paper":
            up, right = Vector((0,1,0)), Vector((0,1,0)).cross(Vector(normal)).normalized()
            for side in (-1, 1):
                pin = cylinder(f"FASTENER_{index}_{'L' if side < 0 else 'R'}", image_center+right*side*(width/2-.012)+up*(height/2-.012)+Vector(normal)*.003,
                               .003, .004, mats["steel"], normal, 16)
                pin.parent = art
                pin.matrix_parent_inverse = art.matrix_world.inverted()
    support.parent = art
    support.matrix_parent_inverse = art.matrix_world.inverted()
    art["sourceIndex"], art["pickNumber"], art["roomId"] = index, item["pickNumber"], room
    art["mount"] = "clock" if is_clock else physical["mount"]
    return list(image_center), list(anchor), width, height, depth


def make_track_lights(records, mats):
    """Visible rails, swivels and warm lenses share each spotlight's exact aim."""
    body = material("matte charcoal track lights", (.027,.028,.026), .48, .45)
    lens = material("warm LED diffuser", (.95,.87,.70), .32)
    bsdf = lens.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Emission Color"].default_value = (1,.88,.68,1)
    bsdf.inputs["Emission Strength"].default_value = 3
    tracks = [
        ("MAIN_LEFT",(-1.62,2.65,-.10),(.045,.045,4.9)),
        ("MAIN_RIGHT",(1.62,2.65,-.10),(.045,.045,4.9)),
        ("MAIN_REAR",(0,2.65,-2.25),(4.20,.045,.045)),
        ("RIGHT_BACK",(4.60,2.65,-.85),(2.9,.045,.045)),
        ("RIGHT_OUTER",(5.25,2.65,.40),(.045,.045,1.8)),
        ("RIGHT_FRONT",(4.60,2.65,1.45),(3.2,.045,.045)),
    ]
    for name,center,dims in tracks:
        box("LIGHT_TRACK_"+name,center,dims,body,bevel=.004)
        along=0 if dims[0]>dims[2] else 2
        for end in (-1,1):
            pos=list(center);pos[along]+=end*(dims[along]/2-.15);pos[1]=2.70
            cylinder("LIGHT_TRACK_HANGER_"+name+str(end),pos,.014,.09,body,(0,1,0),16)
    fixtures=[]
    for art in (record for record in records if record["display"] == "wall"):
        i=art["index"]; target=Vector(art["position"])
        normal=Vector(art["normal"])
        # Keep each stem centered directly under a real ceiling rail.
        if art["roomId"] == "main":
            pos = Vector(((-1.62 if normal.x > 0 else 1.62),2.47,target.z)) if abs(normal.x) > .5 else Vector((target.x,2.47,-2.25))
        else:
            pos = Vector((5.25,2.47,target.z)) if abs(normal.x) > .5 else Vector((target.x,2.47,-.85 if normal.z > 0 else 1.45))
        direction=(target-pos).normalized()
        # A short drop and pivot visibly connect each adjustable lamp to its rail.
        cylinder(f"LIGHT_STEM_{i}",(pos.x,2.575,pos.z),.014,.14,body,(0,1,0),16)
        cylinder(f"LIGHT_PIVOT_{i}",(pos.x,2.51,pos.z),.04,.10,body,(1,0,0),24)
        cylinder(f"LIGHT_HOUSING_{i}",pos,.061,.17,body,direction,48)
        emitter=pos+direction*.087
        cylinder(f"LIGHT_LENS_{i}",emitter,.050,.005,lens,direction,48)
        ld=bpy.data.lights.new(f"TRACK_SPOT_{i}","SPOT")
        ld.energy=32;ld.color=(1,.92,.80);ld.spot_size=1.4;ld.spot_blend=.7
        lo=bpy.data.objects.new(f"TRACK_SPOT_{i}",ld);bpy.context.collection.objects.link(lo)
        lo.location=b(emitter+direction*.008);look(lo,target)
        fixtures.append({"artIndex":i,"roomId":art["roomId"],"position":list(emitter+direction*.008),"target":list(target)})
    return fixtures


def make_windows(mats):
    """The storefront uses panes within a real facade rather than fake emissive planes."""
    # z=3.05 facade: frame elements and panes cover its whole elevation.
    box("WINDOW_FACADE_SPANDREL", (0,.28,3.05), (5.5,.56,.22), mats["plaster"], bevel=.008)
    box("WINDOW_FACADE_HEADER", (0,2.57,3.05), (5.5,.46,.22), mats["plaster"], bevel=.008)
    for i, (x, width) in enumerate(((-2.55,.42),(-.93,.52),(.93,.52),(2.55,.42))):
        box(f"WINDOW_FACADE_PIER_{i}", (x,1.45,3.05), (width,1.78,.22), mats["plaster"], bevel=.008)
    for i, x in enumerate((-1.86, 0, 1.86)):
        box(f"WINDOW_GLASS_{i}", (x,1.4,2.955), (1.38,1.92,.018), mats["glass"])
        box(f"WINDOW_SILL_{i}", (x,.54,2.90), (1.42,.08,.28), mats["oak"], bevel=.006)
        box(f"WINDOW_MULLION_{i}", (x,1.4,2.93), (.045,1.98,.06), mats["steel"], bevel=.004)
    # The visual facade remains a closed outer boundary in the navigation model.
    COLLIDERS.append({"minX":-2.75,"maxX":2.75,"minZ":2.94,"maxZ":3.16,"name":"STOREFRONT_FACADE_BARRIER"})


def build():
    selections = json.loads((ART_DIR / "manifest.json").read_text())["items"]
    expected = [1,2,7,9,10,23,24,28,36,64,65,67,78,101,105,128]
    if len(selections) != 21 or [a["pickNumber"] for a in selections[:16]] != expected or [a["title"] for a in selections[16:]] != ["Loretta", "Strategy", "America #1", "America #2", "Stolen"]:
        raise RuntimeError("selected-art must retain the sixteen picks, Loretta, Strategy, America #1 and America #2")
    missing = [a["file"] for a in selections if not (ART_DIR/a["file"]).exists()]
    if missing:
        raise RuntimeError("selected-art source pending: " + ", ".join(missing))
    clock = selections[12]
    if clock["file"] != "third-sibling-cutout.png":
        raise RuntimeError("clock source pending: manifest index 12 must be third-sibling-cutout.png")

    clear_scene(); COLLIDERS.clear()
    mats = {
        "concrete": pbr("approved concrete", PACKED/"smooth_concrete_floor_albedo.jpg", TEXTURES/"smooth_concrete_floor_nor_gl.jpg", TEXTURES/"smooth_concrete_floor_Rough.jpg", 1/3),
        "plaster": pbr("approved plaster", PACKED/"painted_plaster_wall_albedo.jpg", TEXTURES/"painted_plaster_wall_nor_gl.jpg", TEXTURES/"painted_plaster_wall_Rough.jpg", .55),
        "brick": pbr("approved brick", PACKED/"painted_worn_brick_albedo.jpg", TEXTURES/"painted_worn_brick_nor_gl.jpg", TEXTURES/"painted_worn_brick_Rough.jpg", 1/1.5),
        "oak": pbr("approved raw oak", PACKED/"wood_table_001_albedo.jpg", TEXTURES/"wood_table_001_nor_gl.jpg", TEXTURES/"wood_table_001_Rough.jpg", .72),
        "steel": material("storefront steel", (.025,.024,.022), .32, .65),
        "glass": material("storefront glass", (.49,.62,.68), .12),
        "canvas_edge": material("unframed canvas edge", (.72,.68,.60), .88),
        "paper": material("unframed paper support", (.87,.84,.75), .94),
        "clock_red": material("The Third Sibling red side", (.46,.018,.012), .36),
        "ceiling": material("warm ceiling", (.83,.81,.75), .78),
    }
    # A compact two-room gallery: the original rear offshoot is closed off.
    # The main room remains the daylight-facing room; the right room holds the
    # four flag/assemblage works.
    box("FLOOR_MAIN", (0,-.08,0), (5.5,.16,6.1), mats["concrete"])
    box("FLOOR_RIGHT", (4.58,-.08,.305), (3.66,.16,4.27), mats["concrete"])
    for n,c,d in (("CEILING_MAIN",(0,2.8,0),(5.5,.12,6.1)),("CEILING_RIGHT",(4.58,2.8,.305),(3.66,.12,4.27))):
        box(n,c,d,mats["ceiling"])
    make_windows(mats)
    # Closed perimeter and the solid portions around each walkable opening.
    wall_specs = [
        ("WALL_MAIN_LEFT",(-2.75,1.4,0),(.22,2.8,6.10),mats["brick"]),
        ("WALL_MAIN_REAR",(0,1.4,-3.05),(5.50,2.8,.22),mats["plaster"]),
        ("WALL_MAIN_RIGHT_FRONT",(2.75,1.4,1.945),(.22,2.8,2.21),mats["plaster"]),
        ("WALL_MAIN_RIGHT_REAR",(2.75,1.4,-1.945),(.22,2.8,2.21),mats["plaster"]),
        ("WALL_MAIN_RIGHT_LINTEL",(2.75,2.58,0),(.22,.44,1.68),mats["plaster"]),
        ("WALL_RIGHT_OUTER",(6.41,1.4,.305),(.22,2.8,4.49),mats["plaster"]),
        ("WALL_RIGHT_FRONT",(4.58,1.4,2.44),(3.66,2.8,.22),mats["plaster"]),
        ("WALL_RIGHT_BACK",(4.58,1.4,-1.83),(3.66,2.8,.22),mats["brick"]),
    ]
    for spec in wall_specs: box(*spec, bevel=.008)
    # Colliders intentionally match the visible closed envelope; passages are omitted.
    for name,c,d,_ in wall_specs:
        # Lintels are above eye level and must not turn an open doorway into a
        # 2D navigation barrier.
        if not name.endswith("LINTEL"):
            COLLIDERS.append({"minX":round(c[0]-d[0]/2,3),"maxX":round(c[0]+d[0]/2,3),"minZ":round(c[2]-d[2]/2,3),"maxZ":round(c[2]+d[2]/2,3),"name":name})
    # One compact bench in the main room, set away from both connections.
    box("BENCH_MAIN_SEAT", (-.95,.49,2.20), (1.35,.12,.42), mats["oak"], collider=True, bevel=.02)
    for i,(x,z) in enumerate(((-1.48,2.05),(-1.48,2.35),(-.42,2.05),(-.42,2.35))):
        cylinder(f"BENCH_MAIN_LEG_{i}",(x,.24,z),.038,.47,mats["oak"],(0,1,0),16)

    # Only the thirteen hung works are displayed. Retired source records keep
    # stable indices for preservation, but have no model or viewer representation.
    placement = {
        0: ((-1.55,1.70,-2.90),(0,0,1),"main"),
        1: ((0.00,1.62,-2.90),(0,0,1),"main"),
        2: ((1.55,1.70,-2.90),(0,0,1),"main"),
        3: ((3.90,1.62,-1.68),(0,0,1),"right"),
        4: ((-2.60,1.64,-1.60),(1,0,0),"main"),
        5: ((-2.60,1.58,.05),(1,0,0),"main"),
        6: ((2.60,1.58,-1.68),(-1,0,0),"main"),
        15: ((2.60,1.58,1.55),(-1,0,0),"main"),
        16: ((-2.60,1.60,1.62),(1,0,0),"main"),
        17: ((5.27,1.62,-1.68),(0,0,1),"right"),
        18: ((3.72,1.62,2.29),(0,0,-1),"right"),
        19: ((5.30,1.62,2.29),(0,0,-1),"right"),
        20: ((6.26,1.62,0),(-1,0,0),"right"),
    }
    records=[]
    for index,item in enumerate(selections):
        physical = dict(item["physical"])
        if index in placement:
            center, normal, room = placement[index]
            pos, anchor, pw, ph, pd = art_surface(index,item,center,normal,room,mats)
            display = "wall"
        else:
            # A valid, in-room anchor keeps all stable records route-safe while
            # making it explicit that these source images have no wall mesh.
            pos, anchor, normal, room = [0,1.65,0], [0,1.65,0], [0,0,1], "main"
            pw, ph, pd = physical["width"], physical["height"], physical["depth"]
            display = "hidden"
        records.append({"index":index,"sourceIndex":index,"pickNumber":item["pickNumber"],"display":display,"position":pos,"wallAnchor":anchor,
                        "normal":normal,"width":pw,"height":ph,"physical":physical,"imageWidth":item["width"],"imageHeight":item["height"],
                        "sourceWidth":item.get("sourceWidth"),"sourceHeight":item.get("sourceHeight"),"roomId":room,"file":item["file"],"placeholder":False})

    rooms=[
        {"id":"main","name":"Main room","bounds":{"minX":-2.75,"maxX":2.75,"minZ":-3.05,"maxZ":3.05},"waypoint":[0,1.65,1.65]},
        {"id":"right","name":"Flag room","bounds":{"minX":2.75,"maxX":6.41,"minZ":-1.83,"maxZ":2.44},"waypoint":[4.60,1.65,.30]},
    ]
    windows=[{"id":f"facade-{i}","center":[x,1.4,2.955],"normal":[0,0,-1],"width":1.38,"height":1.92} for i,x in enumerate((-1.86,0,1.86))]
    fixtures=make_track_lights(records,mats)
    manifest={"coordinateMapping":"Blender(x, -webZ, webY) -> WebXYZ","units":"meters","ceilingHeight":2.8,"lightFixtures":fixtures,
              "navigationStart":{"position":[0,1.65,2.20],"lookAt":[0,1.65,-1.8]},"rooms":rooms,"colliders":COLLIDERS,"windows":windows,
              "facadeClipBoundary":{"axis":"z","value":3.05,"inside":"min","reason":"storefront panes are the main facade"},"items":records}
    MANIFEST.write_text(json.dumps(manifest,indent=2)+"\n")

    camera_data=bpy.data.cameras.new("Camera_Start"); camera=bpy.data.objects.new("Camera_Start",camera_data); bpy.context.collection.objects.link(camera)
    camera.location=b((0,1.65,2.20)); look(camera,(0,1.65,-1.8)); camera["web_position"]=[0,1.65,2.20]
    preview_data=bpy.data.cameras.new("PreviewCamera"); preview=bpy.data.objects.new("PreviewCamera",preview_data); bpy.context.collection.objects.link(preview)
    preview.location=b((0,2.05,2.72)); preview.data.lens=25; look(preview,(0,1.5,-2.9))
    scene=bpy.context.scene; scene.camera=preview; scene.render.engine="BLENDER_EEVEE"; scene.render.resolution_x=1280; scene.render.resolution_y=720; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"; scene.render.filepath=str(PREVIEW); scene.world.color=(.78,.79,.80)
    bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=str(BLEND)); bpy.ops.export_scene.gltf(filepath=str(GLB),export_format="GLB",export_apply=True,export_lights=True,export_cameras=True,export_extras=True,export_materials="EXPORT",export_image_format="AUTO",export_image_quality=86)
    # A preview is deliberately rendered separately: some headless GPUs abort
    # during Eevee rendering after a successful export, which obscures whether
    # the browser artifact was actually refreshed.


if __name__ == "__main__":
    build()
