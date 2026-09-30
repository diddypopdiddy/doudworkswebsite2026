#!/usr/bin/env python3
"""Independent mesh, support, overlap, and navigation audit for gallery-compact."""
from pathlib import Path
import json
from collections import deque
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent
WORLD = json.loads((ROOT / "room-manifest.json").read_text())
RADIUS = .23


def web_bounds(name):
    obj = bpy.data.objects.get(name)
    assert obj, f"missing {name}"
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    web = [(p.x, p.z, -p.y) for p in points]
    return {"minX":min(p[0] for p in web), "maxX":max(p[0] for p in web),
            "minY":min(p[1] for p in web), "maxY":max(p[1] for p in web),
            "minZ":min(p[2] for p in web), "maxZ":max(p[2] for p in web)}


def cover(intervals, lo, hi):
    cursor = lo
    for a,b in sorted(intervals):
        assert a <= cursor + .003, f"envelope gap {cursor:.3f}..{a:.3f}"
        cursor = max(cursor,b)
    assert cursor >= hi - .003, f"envelope gap {cursor:.3f}..{hi:.3f}"


def in_room(x,z):
    return any(r["bounds"]["minX"] <= x <= r["bounds"]["maxX"] and r["bounds"]["minZ"] <= z <= r["bounds"]["maxZ"] for r in WORLD["rooms"])


def can_stand(x,z):
    if not all(in_room(x+a*RADIUS,z+b*RADIUS) for a in (-1,1) for b in (-1,1)):
        return False
    for c in WORLD["colliders"]:
        dx = x - max(c["minX"], min(c["maxX"], x))
        dz = z - max(c["minZ"], min(c["maxZ"], z))
        if dx*dx + dz*dz < RADIUS*RADIUS:
            return False
    return True


def near(point, step=.10):
    # Match navigation's forgiving endpoint behavior without assuming waypoints
    # happen to land on the movement grid.
    x,z = point[0],point[2]
    found=[]
    for i in range(-5,6):
        for j in range(-5,6):
            q=(round(x+i*step,3),round(z+j*step,3))
            if can_stand(*q): found.append(q)
    assert found, f"no standable point near {point}"
    return min(found,key=lambda q:(q[0]-x)**2+(q[1]-z)**2)


def navigation_audit():
    start=near(WORLD["navigationStart"]["position"])
    step=.10
    queue=deque([start]); seen={start}
    while queue:
        x,z=queue.popleft()
        for dx,dz in ((step,0),(-step,0),(0,step),(0,-step)):
            q=(round(x+dx,3),round(z+dz,3))
            if q not in seen and can_stand(*q): seen.add(q); queue.append(q)
    for room in WORLD["rooms"]:
        target=near(room["waypoint"])
        assert any((x-target[0])**2+(z-target[1])**2 <= (step*1.5)**2 for x,z in seen), f"unreachable room: {room['id']}"
    return len(seen)


def no_art_overlap():
    items=[item for item in WORLD["items"] if item["display"] == "wall"]
    assert len(items) == 13, f"expected thirteen wall works, found {len(items)}"
    for item in items:
        art=bpy.data.objects.get(f"ART_{item['index']}")
        assert art, f"missing ART_{item['index']}"
        supports=[child for child in art.children if child.name.startswith("SUPPORT_")]
        assert len(supports)==1, f"ART_{item['index']} has {len(supports)} support children"
    for i,a in enumerate(items):
        for b in items[i+1:]:
            # Different walls cannot visually overlap.  On a shared wall plane,
            # compare the physical width/height fields exported by the builder.
            if a["normal"] != b["normal"]: continue
            axis = 2 if abs(a["normal"][0]) > .5 else 0
            plane = 0 if axis == 2 else 2
            if abs(a["wallAnchor"][plane]-b["wallAnchor"][plane]) > .025: continue
            horizontal = abs(a["position"][axis]-b["position"][axis])
            vertical = abs(a["position"][1]-b["position"][1])
            assert horizontal >= (a["width"]+b["width"])/2 + .012 or vertical >= (a["height"]+b["height"])/2 + .012, (a["index"],b["index"])


def main():
    # Physical outer envelope, read from the saved mesh bounds rather than JSON.
    extents={
        "WALL_MAIN_LEFT":("minZ",-3.05,"maxZ",3.05), "WALL_MAIN_REAR":("minX",-2.75,"maxX",2.75),
        "WALL_RIGHT_OUTER":("minZ",-1.83,"maxZ",2.44), "WALL_RIGHT_FRONT":("minX",2.75,"maxX",6.41),
        "WALL_RIGHT_BACK":("minX",2.75,"maxX",6.41),
    }
    for name,(lo_key,lo,hi_key,hi) in extents.items():
        box=web_bounds(name); assert box[lo_key] <= lo+.003 and box[hi_key] >= hi-.003, (name,box)
    # The three pane storefront is a real continuous facade at eye level and vertically.
    front=[web_bounds(f"WINDOW_GLASS_{i}") for i in range(3)]+[web_bounds(f"WINDOW_FACADE_PIER_{i}") for i in range(4)]
    cover([(x["minX"],x["maxX"]) for x in front],-2.75,2.75)
    lower,header=web_bounds("WINDOW_FACADE_SPANDREL"),web_bounds("WINDOW_FACADE_HEADER")
    assert all(lower["maxY"] >= pane["minY"] and header["minY"] <= pane["maxY"] for pane in front[:3])
    assert header["maxY"] >= web_bounds("CEILING_MAIN")["minY"]
    assert len(WORLD["rooms"]) == 2 and {r["id"] for r in WORLD["rooms"]} == {"main","right"}
    assert len(WORLD["items"])==21 and [i["index"] for i in WORLD["items"]]==list(range(21))
    wall=[i for i in WORLD["items"] if i["display"]=="wall"]
    hidden=[i for i in WORLD["items"] if i["display"]=="hidden"]
    assert len(wall)==13 and [i["index"] for i in hidden]==list(range(7,15))
    assert all(bpy.data.objects.get(f"ART_{i['index']}") is None for i in hidden)
    assert "portfolio" not in WORLD
    assert not any("PORTFOLIO" in obj.name for obj in bpy.data.objects), "retired studies portfolio still in scene"
    assert all(abs(i["position"][1]-1.55)<.25 for i in wall)
    no_art_overlap()
    reachable=navigation_audit()
    print(json.dumps({"status":"COMPACT_GALLERY_AUDIT_PASS","reachableGridCells":reachable,"rooms":[r["id"] for r in WORLD["rooms"]],"wallWorks":13,"portfolioWorks":0,"hiddenWorks":8,"sourceRecords":len(WORLD["items"])},indent=2))


if __name__ == "__main__":
    main()
