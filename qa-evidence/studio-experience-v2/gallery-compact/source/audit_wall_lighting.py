#!/usr/bin/env python3
"""Audit visible wall-face joins and the modeled track-light contract.

Run after the builder has saved ``gallery-compact.blend``::

  /Applications/Blender.app/Contents/MacOS/Blender -b gallery-compact.blend \
    --python source/audit_wall_lighting.py

The wall check intentionally concerns only a co-facing surface where at least
one face belongs to the room interior.  It therefore catches a lintel painted
over a wall or a side-wall cap painted over a host wall, but permits normal
opposite-facing butt joins and hidden exterior construction overlaps.
"""
from pathlib import Path
import json

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent.parent
WORLD = json.loads((ROOT / "room-manifest.json").read_text())
PLANE_EPS = 1e-5
AREA_EPS = 2e-3
AXIS_DOT = .99999


def web_point(point):
    """Convert a Blender point/vector into the model's documented Web axes."""
    return Vector((point.x, point.z, -point.y))


def axis_normal(normal):
    """Return a signed Web axis for an axis-aligned face, otherwise None."""
    n = web_point(normal).normalized()
    for axis in (0, 2):  # Wall/facade faces are vertical; ignore floor/ceiling.
        if abs(n[axis]) >= AXIS_DOT:
            sign = 1 if n[axis] > 0 else -1
            result = [0, 0, 0]
            result[axis] = sign
            return tuple(result)
    return None


# These are the faces a visitor can see from the two gallery rooms.  A face
# not in this registry still participates when it lands on one of these planes:
# that is how a protruding side-wall cap is caught without flagging an exterior
# cap meeting an exterior facade face.
INTERIOR_NORMALS = {
    "WALL_MAIN_LEFT": (1, 0, 0),
    "WALL_MAIN_REAR": (0, 0, 1),
    "WALL_MAIN_RIGHT_FRONT": (-1, 0, 0),
    "WALL_MAIN_RIGHT_REAR": (-1, 0, 0),
    "WALL_MAIN_RIGHT_LINTEL": (-1, 0, 0),
    "WALL_RIGHT_OUTER": (-1, 0, 0),
    "WALL_RIGHT_FRONT": (0, 0, -1),
    "WALL_RIGHT_BACK": (0, 0, 1),
    "WINDOW_FACADE_SPANDREL": (0, 0, -1),
    "WINDOW_FACADE_HEADER": (0, 0, -1),
    **{f"WINDOW_FACADE_PIER_{i}": (0, 0, -1) for i in range(4)},
}


def face_records():
    """Return the axis-aligned vertical polygons from walls and facade frame."""
    records = []
    for name, interior_normal in INTERIOR_NORMALS.items():
        obj = bpy.data.objects.get(name)
        assert obj and obj.type == "MESH", f"missing wall/facade mesh: {name}"
        linear = obj.matrix_world.to_3x3()
        for polygon in obj.data.polygons:
            normal = axis_normal(linear @ polygon.normal)
            if normal is None:
                continue  # Rounded bevel faces cannot produce the strip defect.
            points = [web_point(obj.matrix_world @ obj.data.vertices[i].co)
                      for i in polygon.vertices]
            fixed_axis = 0 if normal[0] else 2
            plane = sum(point[fixed_axis] for point in points) / len(points)
            tangents = tuple(axis for axis in range(3) if axis != fixed_axis)
            bounds = tuple((min(point[axis] for point in points),
                            max(point[axis] for point in points)) for axis in tangents)
            records.append({
                "object": name,
                "normal": normal,
                "isInterior": normal == interior_normal,
                "axis": fixed_axis,
                "plane": plane,
                "tangents": tangents,
                "bounds": bounds,
            })
    return records


def overlap(a, b):
    return min(a[1], b[1]) - max(a[0], b[0])


def coplanar_wall_faces():
    """Find positive-area, co-facing overlaps on a visible interior plane."""
    bad = []
    faces = face_records()
    for index, left in enumerate(faces):
        for right in faces[index + 1:]:
            if left["object"] == right["object"]:
                continue
            # Opposite-facing butt joins are ordinary construction, not z-fighting.
            if (left["normal"] != right["normal"] or left["axis"] != right["axis"]
                    or abs(left["plane"] - right["plane"]) > PLANE_EPS):
                continue
            if not (left["isInterior"] or right["isInterior"]):
                continue
            widths = [overlap(left["bounds"][i], right["bounds"][i]) for i in range(2)]
            if widths[0] > AREA_EPS and widths[1] > AREA_EPS:
                bad.append({
                    "objects": sorted((left["object"], right["object"])),
                    "normal": left["normal"],
                    "plane": round(left["plane"], 6),
                    "overlap": [round(width, 6) for width in widths],
                })
    return bad


def unit_web_direction(obj):
    """Cylinder and spot local +Z/-Z directions expressed in Web axes."""
    return web_point(obj.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()


def fixture_audit():
    fixtures = WORLD.get("lightFixtures")
    items = WORLD.get("items")
    wall_items = [item for item in items if item["display"] == "wall"]
    assert isinstance(fixtures, list) and len(fixtures) == 13, "expected thirteen manifest light fixtures"
    assert isinstance(items, list) and len(items) == 21, "expected twenty-one stable artwork records"
    by_index = {entry["artIndex"]: entry for entry in fixtures}
    assert set(by_index) == {item["index"] for item in wall_items}, "fixtures must correspond only to wall works"

    for item in wall_items:
        index = item["index"]
        fixture = by_index[index]
        assert fixture["roomId"] == item["roomId"], f"fixture {index} room does not match art"
        target = Vector(fixture["target"])
        art_position = Vector(item["position"])
        assert (target - art_position).length < 1e-5, f"fixture {index} target is not ART_{index}"

        required = [f"LIGHT_STEM_{index}", f"LIGHT_PIVOT_{index}",
                    f"LIGHT_HOUSING_{index}", f"LIGHT_LENS_{index}"]
        objects = {name: bpy.data.objects.get(name) for name in required}
        assert all(obj and obj.type == "MESH" for obj in objects.values()), f"fixture {index} lacks modeled hardware"

        stem_position = web_point(objects[f"LIGHT_STEM_{index}"].matrix_world.translation)
        tracks = [obj for obj in bpy.data.objects if obj.name.startswith("LIGHT_TRACK_") and not obj.name.startswith("LIGHT_TRACK_HANGER_")]
        def under_track(track):
            points = [web_point(track.matrix_world @ Vector(corner)) for corner in track.bound_box]
            return all(min(p[axis] for p in points)-.015 <= stem_position[axis] <= max(p[axis] for p in points)+.015 for axis in (0,2))
        assert any(under_track(track) for track in tracks), f"fixture {index} stem floats away from its ceiling rail"

        housing, lens = objects[f"LIGHT_HOUSING_{index}"], objects[f"LIGHT_LENS_{index}"]
        spot = bpy.data.objects.get(f"TRACK_SPOT_{index}")
        assert spot and spot.type == "LIGHT" and spot.data.type == "SPOT", f"fixture {index} lacks spot node"
        assert lens.data.materials and lens.data.materials[0].use_nodes, f"fixture {index} lens has no node material"
        bsdf = lens.data.materials[0].node_tree.nodes.get("Principled BSDF")
        assert bsdf and bsdf.inputs["Emission Strength"].default_value > 0, f"fixture {index} lens is not emissive"

        expected_position = Vector(fixture["position"])
        lens_position, spot_position = web_point(lens.matrix_world.translation), web_point(spot.matrix_world.translation)
        assert (lens_position - expected_position).length < .016, f"fixture {index} lens does not match manifest position"
        assert (spot_position - expected_position).length < 1e-5, f"fixture {index} spot does not match manifest position"

        aim = (target - spot_position).normalized()
        assert unit_web_direction(housing).dot(aim) > .999, f"fixture {index} housing does not aim at ART_{index}"
        assert unit_web_direction(lens).dot(aim) > .999, f"fixture {index} lens does not aim at ART_{index}"
        spot_direction = -unit_web_direction(spot)
        assert spot_direction.dot(aim) > .999, f"fixture {index} spot does not aim at ART_{index}"

    rails = [obj for obj in bpy.data.objects if obj.name.startswith("LIGHT_TRACK_")]
    assert len(rails) >= 6, "expected modeled ceiling rails and hangers"


def main():
    duplicates = coplanar_wall_faces()
    assert not duplicates, "visible co-planar wall/facade faces: " + json.dumps(duplicates)
    fixture_audit()
    # Negative control: extend one of the split main/right wall segments over
    # its neighbor in memory and confirm the detector sees the overlap.
    wall = bpy.data.objects["WALL_MAIN_RIGHT_REAR"]
    original_scale = wall.scale.copy()
    try:
        wall.scale.y *= 3
        bpy.context.view_layer.update()
        assert coplanar_wall_faces(), "regression detector missed the original brick strip"
    finally:
        wall.scale = original_scale
        bpy.context.view_layer.update()
    print(json.dumps({
        "status": "WALL_LIGHTING_AUDIT_PASS",
        "checkedInteriorSurfaceOwners": len(INTERIOR_NORMALS),
        "fixtureSpots": 13,
        "openingOverlapNegativeControl": "detected",
    }, indent=2))


if __name__ == "__main__":
    main()
