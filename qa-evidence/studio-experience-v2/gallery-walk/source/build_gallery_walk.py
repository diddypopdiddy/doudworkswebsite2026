#!/usr/bin/env python3
"""Build the four-room Williamsburg storefront gallery walk.

Web coordinates are (x, y, z). Blender source coordinates are (x, -z, y),
so a normal Blender glTF export is positioned correctly in the Web world.
"""
from pathlib import Path
import json
import math
import random
import bpy
from mathutils import Vector

SOURCE = Path(__file__).resolve().parent
WALK = SOURCE.parent
SITE = SOURCE.parents[3]
ART_DIR = SITE / "media" / "art-placeholders"
BLEND = WALK / "gallery.blend"
GLB = WALK / "room.glb"
MANIFEST = WALK / "room-manifest.json"
PREVIEW = WALK / "room-preview.png"
COLLIDERS = []
STATIC = {}


def bp(v):
    return (v[0], -v[2], v[1])


def clean():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.lights, bpy.data.cameras):
        for value in list(collection):
            if value.users == 0:
                collection.remove(value)


def mat(name, color, rough=.65, metal=0, emission=None, emission_strength=0):
    value = bpy.data.materials.new(name)
    value.use_nodes = True
    bsdf = value.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return value


def art_mat(name, path):
    value = bpy.data.materials.new(name)
    value.use_nodes = True
    bsdf = value.node_tree.nodes.get("Principled BSDF")
    tex = value.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(path), check_existing=True)
    if tex.image.size[0] > 1024:
        tex.image.scale(1024, round(tex.image.size[1] * 1024 / tex.image.size[0]))
    tex.interpolation = "Linear"
    value.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = .46
    return value


def bake_concrete_image():
    """Bake a restrained 3 m warm-gray concrete tile for portable glTF UV use.

    The floor gets fine aggregate and light finishing marks, rather than a
    cloudy stone pattern.  The low-contrast control-joint lines are just
    visible at gallery scale and repeat at a plausible 3 m bay spacing.
    """
    width = height = 1024
    image = bpy.data.images.new("warm gray concrete baked", width=width, height=height, alpha=False)
    rnd = random.Random(20260907)
    pixels = [0.0] * (width * height * 4)
    for y in range(height):
        for x in range(width):
            i = (y * width + x) * 4
            # Fine aggregate: mostly quiet mineral variance with occasional
            # pinprick grains. Avoid low-frequency clouds that read as marble.
            grain = rnd.uniform(-.018, .018)
            micro = (((x * 19 + y * 37) % 29) / 29 - .5) * .010
            fleck = rnd.uniform(-.045, .020) if rnd.random() < .012 else 0
            # A few faint, short trowel/scuff strokes, kept below feature scale.
            stroke = 0
            for sx, sy, length in ((152, 184, 118), (605, 337, 164), (312, 738, 141), (790, 816, 95)):
                dx, dy = x - sx, y - sy
                if abs(dy) < 2 and 0 < dx < length:
                    stroke -= .022 * (1 - abs(dy) / 2)
            # Fine saw-cut expansion joints at the center of each 3 m tile.
            joint_distance = min(abs(x - 512), abs(y - 512))
            joint = -.052 if joint_distance < 1.35 else (-.020 if joint_distance < 3.2 else 0)
            base = .505 + grain + micro + fleck + stroke + joint
            pixels[i:i + 4] = (max(0, base + .018), max(0, base + .006), max(0, base - .018), 1)
    image.pixels.foreach_set(pixels)
    image.filepath_raw = str(WALK / "textures" / "warm_gray_concrete_3m.png")
    image.file_format = "PNG"
    image.save()
    return image


def bake_surface_image(name, filename, kind):
    """Make small deterministic, packable procedural surface maps in Blender."""
    width = height = 512
    image = bpy.data.images.new(name, width=width, height=height, alpha=False)
    rnd = random.Random(812 if kind == "brick" else 319)
    pixels = [0.0] * (width * height * 4)
    for y in range(height):
        for x in range(width):
            i = (y * width + x) * 4
            if kind == "brick":
                # 5 roughly 620 mm bricks across by 10 280 mm courses high.
                course = y // 51
                mortar = y % 51 < 3
                joint_x = (x + (0 if course % 2 else 51)) % 102
                mortar = mortar or joint_x < 3
                fleck = ((x * 17 + y * 31 + course * 13) % 19) / 19
                base = .78 + fleck * .018
                if mortar:
                    r, g, b = .725, .718, .705
                else:
                    # Barely uneven limewash reads as brick up close, white at room scale.
                    r, g, b = base + .020, base + .012, base
            else:
                # Fine, warm plywood grain with restrained layered variation.
                grain = math.sin((x / 13) + math.sin(y / 37) * 1.7) * .032
                grain += math.sin(x / 3.6 + y / 61) * .010
                knot = math.exp(-(((x - 320) / 58) ** 2 + ((y - 205) / 23) ** 2)) * .09
                base = .43 + grain - knot + ((x * 11 + y * 7) % 13) / 13 * .008
                r, g, b = base + .14, base + .045, base - .075
            pixels[i:i + 4] = (max(0, r), max(0, g), max(0, b), 1)
    image.pixels.foreach_set(pixels)
    image.filepath_raw = str(SOURCE / filename)
    image.file_format = "PNG"
    image.save()
    return image


def baked_material(name, image, roughness, scale, emission_strength=0):
    value = bpy.data.materials.new(name)
    value.use_nodes = True
    nodes, links = value.node_tree.nodes, value.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    tex = nodes.new("ShaderNodeTexImage")
    # Use authored mesh UVs. Object/box coordinates are not portable through
    # every glTF viewer and caused stretched vertical bands in the browser.
    tex.image, tex.extension, tex.projection = image, "REPEAT", "FLAT"
    links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = roughness
    if emission_strength:
        links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return value


def apply_physical_uv(obj, mode):
    """Put world-size UVs on each cube face so exported glTF keeps its scale."""
    uv_layer = obj.data.uv_layers.active
    if not uv_layer:
        return
    # One brick texture tile carries five roughly 220 mm bricks by ten 80 mm courses.
    if mode == "brick":
        scale_u, scale_v = 1 / 1.1, 1 / .8
    elif mode == "concrete":
        # Each authored image tile represents a physical 3 x 3 m concrete bay.
        scale_u, scale_v = 1 / 3, 1 / 3
    else:
        scale_u, scale_v = 1 / 1.8, 1 / 1.8
    for polygon in obj.data.polygons:
        normal = polygon.normal
        for loop_index in polygon.loop_indices:
            co = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            if abs(normal.x) > .5:      # Web X-facing wall: horizontal is Web Z / Blender Y.
                u, v = -co.y * scale_u, co.z * scale_v
            elif abs(normal.y) > .5:    # Web Z-facing wall: horizontal is Web X.
                u, v = co.x * scale_u, co.z * scale_v
            else:                       # Tops, bottoms, and furniture faces.
                u, v = co.x * scale_u, co.y * scale_v
            uv_layer.data[loop_index].uv = (u, v)


def collider(name, center, dims):
    COLLIDERS.append({
        "minX": round(center[0] - dims[0] / 2, 3), "maxX": round(center[0] + dims[0] / 2, 3),
        "minZ": round(center[2] - dims[2] / 2, 3), "maxZ": round(center[2] + dims[2] / 2, 3),
        "name": name,
    })


def cube(name, center, dims, material, bevel=0, collide=False, static=None):
    bpy.ops.mesh.primitive_cube_add(location=bp(center))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (dims[0], dims[2], dims[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    if material.name == "painted white brick and patch plaster":
        apply_physical_uv(obj, "brick")
    elif material.name == "raw plywood":
        apply_physical_uv(obj, "wood")
    elif material.name == "warm gray concrete":
        apply_physical_uv(obj, "concrete")
    if bevel:
        modifier = obj.modifiers.new("soft edges", "BEVEL")
        modifier.width, modifier.segments, modifier.limit_method = bevel, 2, "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    if collide:
        collider(name, center, dims)
    if static:
        STATIC.setdefault(static, []).append(obj)
    return obj


def cylinder_between(name, a, b, radius, material, static=None):
    av, bv = Vector(bp(a)), Vector(bp(b))
    direction = bv - av
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=radius, depth=direction.length, location=(av + bv) / 2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    obj.data.materials.append(material)
    if static:
        STATIC.setdefault(static, []).append(obj)
    return obj


def join_static():
    for name, objects in STATIC.items():
        objects = [obj for obj in objects if obj and obj.name in bpy.context.view_layer.objects]
        if len(objects) < 2:
            if objects:
                objects[0].name = name
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()
        objects[0].name = name


def art_surface(index, source_index, center, normal, width, height, room_id, filename, frame_kind, materials):
    p, n, up = Vector(center), Vector(normal), Vector((0, 1, 0))
    right = up.cross(n).normalized()
    verts = [
        -right * width / 2 - up * height / 2,
        right * width / 2 - up * height / 2,
        right * width / 2 + up * height / 2,
        -right * width / 2 + up * height / 2,
    ]
    mesh = bpy.data.meshes.new(f"ART_{index}_MESH")
    mesh.from_pydata([bp(v) for v in verts], [], [(0, 1, 2, 3)])
    mesh.uv_layers.new(name="UVMap")
    for loop, uv in zip(mesh.uv_layers.active.data, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop.uv = uv
    mesh.update()
    obj = bpy.data.objects.new(f"ART_{index}", mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = bp(center)
    obj.data.materials.append(art_mat(f"Artwork {index}", ART_DIR / filename))
    obj["roomId"], obj["placeholder"], obj["sourceIndex"] = room_id, True, source_index

    # Small labels are intentionally blank: a neutral geometric field, never fake attribution.
    label_center = p - n * .026 - up * (height / 2 + .13) + right * (width / 2 - .13)
    if abs(n.x) > .5:
        cube(f"Label_{index}", label_center, (.025, .08, .22), materials["label"], static="STATIC_LABELS")
    else:
        cube(f"Label_{index}", label_center, (.22, .08, .025), materials["label"], static="STATIC_LABELS")

    if frame_kind == "clips":
        for sign in (-1, 1):
            point = p - n * .035 + right * sign * (width * .38) + up * (height / 2 + .025)
            cylinder_between(f"Clip_{index}_{sign}", point - up * .07, point + up * .04, .018, materials["clip"], "STATIC_CLIPS")
        return
    frame = materials[frame_kind]
    outer_w, outer_h, depth, bar = width + .13, height + .13, .06, .055
    behind = p - n * .035
    if abs(n.x) > .5:
        parts = [
            (behind + up * (outer_h / 2 - bar / 2), (depth, bar, outer_w)),
            (behind - up * (outer_h / 2 - bar / 2), (depth, bar, outer_w)),
            (behind - right * (outer_w / 2 - bar / 2), (depth, outer_h, bar)),
            (behind + right * (outer_w / 2 - bar / 2), (depth, outer_h, bar)),
        ]
    else:
        parts = [
            (behind + up * (outer_h / 2 - bar / 2), (outer_w, bar, depth)),
            (behind - up * (outer_h / 2 - bar / 2), (outer_w, bar, depth)),
            (behind - right * (outer_w / 2 - bar / 2), (bar, outer_h, depth)),
            (behind + right * (outer_w / 2 - bar / 2), (bar, outer_h, depth)),
        ]
    for part_index, (location, dimensions) in enumerate(parts):
        cube(f"Frame_{index}_{part_index}", location, dimensions, frame, .008, static=f"STATIC_FRAME_{frame_kind}")


def track_fixture(name, location, target, energy=8):
    data = bpy.data.lights.new(name, "SPOT")
    data.energy = energy
    data.color = (1.0, .97, .9)
    data.spot_size, data.spot_blend = .72, .65
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = bp(location)
    direction = Vector(bp(target)) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cube(name + "_CAN", (location[0], 3.42, location[2]), (.18, .12, .18), MATERIALS["track"], .01, static="STATIC_TRACK_CANS")
    # Readable down-facing can below the rail; it stays decorative and light.
    cylinder_between(name + "_HEAD", (location[0], 3.40, location[2]), (location[0], 3.16, location[2]), .105, MATERIALS["track"], "STATIC_TRACK_HEADS")


def point_camera(camera, target):
    direction = Vector(bp(target)) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def build():
    global MATERIALS
    clean()
    COLLIDERS.clear(); STATIC.clear()
    MATERIALS = {
        "white": baked_material("painted white brick and patch plaster", bake_surface_image("white brick baked", "white_brick_baked.png", "brick"), .92, (.32, .32, .357), .025),
        "white_alt": mat("patched white wall", (.88, .865, .83), .98, emission=(.88, .865, .83), emission_strength=.09),
        "concrete": baked_material("warm gray concrete", bake_concrete_image(), .86, (1, 1, 1)),
        "rawwood": baked_material("raw plywood", bake_surface_image("plywood grain baked", "plywood_grain_baked.png", "wood"), .72, (.8, .8, .8)),
        "black": mat("thin black frame", (.025, .024, .022), .44),
        "whiteframe": mat("white gallery frame", (.86, .85, .81), .58),
        "label": mat("blank white wall label", (.91, .9, .85), .8),
        "clip": mat("steel paper clips", (.28, .285, .28), .35, .7),
        "glass": mat("soft daylight storefront glass", (.67, .77, .8), .22, 0, (.38, .52, .62), .28),
        "track": mat("white track hardware", (.84, .825, .79), .52, .25),
    }

    white, concrete, wood = MATERIALS["white"], MATERIALS["concrete"], MATERIALS["rawwood"]
    # Continuous but separately named room floors support renderer culling and navigation inspection.
    cube("FLOOR_FRONT", (0, -.08, 0), (10, .16, 10), concrete, .01)
    cube("FLOOR_MIDDLE", (0, -.08, -9.5), (10, .16, 9), concrete, .01)
    cube("FLOOR_BACK", (0, -.08, -17.5), (10, .16, 7), concrete, .01)
    cube("FLOOR_SIDE", (9, -.08, 0), (8, .16, 10), concrete, .01)

    # Outside envelope. The glass is visual daylight; its full wall collider retains the storefront boundary.
    cube("Storefront barrier", (0, 1.8, 5.1), (10.3, 3.6, .3), white, .01, True, "STATIC_WHITE")
    cube("Long left exterior wall", (-5.1, 1.8, -8), (.3, 3.6, 26.3), white, .01, True, "STATIC_WHITE")
    cube("Back exterior wall", (0, 1.8, -21.1), (10.3, 3.6, .3), white, .01, True, "STATIC_WHITE")
    cube("Middle right exterior wall", (5.1, 1.8, -13), (.3, 3.6, 16.3), white, .01, True, "STATIC_WHITE")
    cube("Side exterior wall", (13.1, 1.8, 0), (.3, 3.6, 10.3), white, .01, True, "STATIC_WHITE")
    cube("Side rear exterior wall", (9, 1.8, -5.1), (8.3, 3.6, .3), white, .01, True, "STATIC_WHITE")

    # Full-height divisions with only their below-head piers collidable. Door gaps stay clear.
    cube("Front-middle west pier", (-3.25, 1.4, -5), (3.5, 2.8, .24), white, .01, True, "STATIC_WHITE")
    cube("Front-middle east pier", (3.25, 1.4, -5), (3.5, 2.8, .24), white, .01, True, "STATIC_WHITE")
    cube("Front-middle lintel", (0, 3.2, -5), (10, .8, .24), white, .01, False, "STATIC_WHITE")
    cube("Middle-back west pier", (-2.25, 1.4, -14), (5.5, 2.8, .24), white, .01, True, "STATIC_WHITE")
    cube("Middle-back east pier", (4.25, 1.4, -14), (1.5, 2.8, .24), white, .01, True, "STATIC_WHITE")
    cube("Middle-back lintel", (0, 3.2, -14), (10, .8, .24), white, .01, False, "STATIC_WHITE")
    cube("Front-side south pier", (5, 1.4, -3.4), (.24, 2.8, 3.2), white, .01, True, "STATIC_WHITE")
    cube("Front-side north pier", (5, 1.4, 3.4), (.24, 2.8, 3.2), white, .01, True, "STATIC_WHITE")
    cube("Front-side lintel", (5, 3.2, 0), (.24, .8, 10), white, .01, False, "STATIC_WHITE")

    # Plaster ceilings and the sparse white mechanical run seen in the reference.
    for name, center, dims in (
        ("Ceiling front", (0, 3.68, 0), (10, .16, 10)),
        ("Ceiling middle", (0, 3.68, -9.5), (10, .16, 9)),
        ("Ceiling back", (0, 3.68, -17.5), (10, .16, 7)),
        ("Ceiling side", (9, 3.68, 0), (8, .16, 10)),
    ):
        cube(name, center, dims, MATERIALS["white_alt"], .01, static="STATIC_CEILINGS")
    for i, (a, b) in enumerate((
        ((-4.55, 3.42, 4.5), (-4.55, 3.42, -18.7)),
        ((-2.2, 3.38, 4.5), (-2.2, 3.38, -13.4)),
        ((.5, 3.40, 4.4), (.5, 3.40, -19.5)),
        ((6.8, 3.4, 4.55), (11.8, 3.4, 4.55)),
    )):
        cylinder_between(f"white pipe {i}", a, b, .07, MATERIALS["track"], "STATIC_PIPES")
    for i, (center, dims) in enumerate((
        ((0, 3.46, 1.1), (.08, .06, 5.8)), ((0, 3.46, -8.8), (.08, .06, 5.6)),
        ((0, 3.46, -17.2), (.08, .06, 4.2)), ((9.1, 3.46, 1.1), (.08, .06, 5.3)),
    )):
        cube(f"Track rail {i}", center, dims, MATERIALS["track"], .008, static="STATIC_TRACK_RAILS")

    # Left storefront: two broad, pale glass panels with black mullions and a low sill.
    for i, z in enumerate((1.35, 3.7)):
        cube(f"Left storefront glass {i}", (-4.94, 1.78, z), (.025, 2.65, 2.06), MATERIALS["glass"])
        cube(f"Left window mullion {i}", (-4.91, 1.78, z), (.055, 2.82, .075), MATERIALS["black"], static="STATIC_MULLIONS")
    cube("Left storefront sill", (-4.88, .38, 2.55), (.32, .12, 4.9), wood, .01, True, "STATIC_WOOD")
    for x in (-3.8, 0, 3.8):
        cube("Front glass bay", (x, 1.85, 4.93), (2.8, 2.85, .025), MATERIALS["glass"])
    for x in (-4.4, -2.0, 2.0, 4.4):
        cube("Front mullion", (x, 1.85, 4.89), (.07, 2.95, .055), MATERIALS["black"], static="STATIC_MULLIONS")

    # Thin baseboards make the white walls feel constructed rather than like a smooth box.
    for i, (center, dims) in enumerate((
        ((-4.93, .12, -8), (.10, .18, 26.0)), ((0, .12, -20.93), (10, .18, .10)),
        ((4.93, .12, -13), (.10, .18, 16.0)), ((12.93, .12, 0), (.10, .18, 10.0)),
        ((9, .12, -4.93), (8, .18, .10)), ((-3.25, .12, -4.84), (3.35, .18, .08)),
        ((3.25, .12, -4.84), (3.35, .18, .08)), ((-2.25, .12, -13.84), (5.35, .18, .08)),
    )):
        cube(f"Baseboard {i}", center, dims, MATERIALS["white_alt"], .008, static="STATIC_BASEBOARDS")

    # Human-scale furniture, offset from all openings and their navigation lanes.
    cube("Front plywood bench", (-1.9, .43, 2.25), (2.35, .86, .52), wood, .025, True, "STATIC_WOOD")
    cube("Middle plywood bench", (-3.65, .43, -8.8), (1.85, .86, .52), wood, .025, True, "STATIC_WOOD")
    cube("Back reading bench", (2.55, .43, -18.2), (2.2, .86, .52), wood, .025, True, "STATIC_WOOD")
    cube("Side zine table top", (9.4, .78, 2.45), (2.45, .12, 1.15), wood, .02, True, "STATIC_WOOD")
    for x in (8.38, 10.42):
        for z in (2.0, 2.9):
            cube("Zine table leg", (x, .38, z), (.15, .76, .15), wood, .01, static="STATIC_WOOD")

    art_specs = [
        (0, 0, [-3.25, 1.73, -4.84], [0, 0, 1], 1.50, 1.00, "front", "abstract-study.jpg", "black"),
        (1, 1, [3.15, 1.72, -4.84], [0, 0, 1], 1.25, .8333, "front", "ink-structure.jpg", "whiteframe"),
        (2, 2, [-4.84, 1.72, .05], [1, 0, 0], 1.45, .9667, "front", "blue-door-photo.jpg", "clips"),
        (3, 3, [-4.84, 1.72, -9.4], [1, 0, 0], 1.58, 1.0533, "middle", "sketchbook-spread.jpg", "rawwood"),
        (4, 4, [-2.35, 1.72, -13.84], [0, 0, 1], 1.34, .8933, "middle", "material-object.jpg", "black"),
        (5, 0, [4.84, 1.72, -10.4], [-1, 0, 0], 1.20, .80, "middle", "abstract-study.jpg", "clips"),
        (6, 1, [-2.35, 1.72, -14.16], [0, 0, -1], 1.38, .92, "back", "ink-structure.jpg", "whiteframe"),
        (7, 2, [1.9, 1.72, -20.84], [0, 0, 1], 1.60, 1.0667, "back", "blue-door-photo.jpg", "rawwood"),
        (8, 3, [-4.84, 1.72, -18.3], [1, 0, 0], 1.22, .8133, "back", "sketchbook-spread.jpg", "black"),
        (9, 4, [12.84, 1.72, -2.8], [-1, 0, 0], 1.55, 1.0333, "side", "material-object.jpg", "whiteframe"),
        (10, 0, [8.8, 1.72, 4.84], [0, 0, -1], 1.45, .9667, "side", "abstract-study.jpg", "clips"),
        (11, 1, [5.16, 1.72, 3.15], [1, 0, 0], 1.25, .8333, "side", "ink-structure.jpg", "rawwood"),
    ]
    for spec in art_specs:
        art_surface(*spec, MATERIALS)

    # Named low-output tracks let the browser normalize their actual runtime intensity.
    for i, (loc, aim) in enumerate((
        ((-3, 3.35, -2.8), (-3.25, 1.7, -4.7)), ((3, 3.35, -2.8), (3.15, 1.7, -4.7)),
        ((-3, 3.35, -11), (-2.35, 1.7, -13.7)), ((2.8, 3.35, -11), (4.7, 1.7, -10.4)),
        ((0, 3.35, -17), (1.9, 1.7, -20.7)), ((9.5, 3.35, 1.4), (8.8, 1.7, 4.7)),
    )):
        track_fixture(f"FIXTURE_{i:02d}", loc, aim, 8)

    camera_data = bpy.data.cameras.new("Camera_Start")
    camera = bpy.data.objects.new("Camera_Start", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = bp((0, 1.65, 3.7))
    point_camera(camera, (0, 1.65, -5))
    camera["web_position"] = [0, 1.65, 3.7]
    camera["web_lookAt"] = [0, 1.65, -5]
    preview_data = bpy.data.cameras.new("GalleryPreviewCamera")
    preview_cam = bpy.data.objects.new("GalleryPreviewCamera", preview_data)
    bpy.context.collection.objects.link(preview_cam)
    preview_cam.location = bp((0, 2.25, 4.2))
    preview_cam.data.lens = 27
    point_camera(preview_cam, (0, 1.65, -6.6))

    # Neutral daylight and modest track contribution render the inspection image without a sepia cast.
    scene = bpy.context.scene
    scene.camera = preview_cam
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 1280, 720, 100
    scene.render.image_settings.file_format, scene.render.filepath = "PNG", str(PREVIEW)
    scene.world.color = (.78, .80, .82)
    area_data = bpy.data.lights.new("DAYLIGHT_SOFT", "AREA")
    area_data.energy, area_data.shape, area_data.size = 700, "RECTANGLE", 8
    area = bpy.data.objects.new("DAYLIGHT_SOFT", area_data)
    bpy.context.collection.objects.link(area); area.location = bp((-2, 3.3, 3.5)); point_camera(area, (0, 0, -3))
    scene.view_settings.look = "AgX - Medium Low Contrast"

    rooms = [
        {"id": "front", "name": "Storefront", "bounds": {"minX": -5, "maxX": 5, "minZ": -5, "maxZ": 5}, "waypoint": [0, 1.65, 1.2]},
        {"id": "middle", "name": "Middle room", "bounds": {"minX": -5, "maxX": 5, "minZ": -14, "maxZ": -5}, "waypoint": [0, 1.65, -9.5]},
        {"id": "back", "name": "Back room", "bounds": {"minX": -5, "maxX": 5, "minZ": -21, "maxZ": -14}, "waypoint": [0, 1.65, -17.5]},
        {"id": "side", "name": "Side room", "bounds": {"minX": 5, "maxX": 13, "minZ": -5, "maxZ": 5}, "waypoint": [9, 1.65, 0]},
    ]
    manifest = {
        "coordinateMapping": "Blender(x, -webZ, webY) -> WebXYZ",
        "navigationStart": {"position": [0, 1.65, 3.7], "lookAt": [0, 1.65, -5]},
        "rooms": rooms,
        "colliders": COLLIDERS,
        "items": [{"index": i, "sourceIndex": source_index, "position": center, "normal": normal,
                   "width": width, "height": height, "roomId": room_id, "file": filename,
                   "placeholder": True} for i, source_index, center, normal, width, height, room_id, filename, _ in art_specs],
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    join_static()
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    bpy.ops.export_scene.gltf(filepath=str(GLB), export_format="GLB", export_apply=True,
                              export_lights=True, export_cameras=True, export_materials="EXPORT", export_image_format="JPEG")
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build()
