"""Inspect saved mesh vertices, not just the catalog's dimensional claims."""
from pathlib import Path
import json
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
world=json.loads((ROOT/'room-manifest.json').read_text())
results=[]
for index,minimum_relief in [(17,.004),(18,.001),(19,.07)]:
    item=world['items'][index];obj=bpy.data.objects[f'ART_{index}']
    n=Vector(item['normal']);anchor=Vector(item['wallAnchor']);p=item['physical']
    vertices=[obj.matrix_world@v.co for v in obj.data.vertices]
    web=[Vector((v.x,v.z,-v.y)) for v in vertices]
    depths=[(v-anchor).dot(n)-.005 for v in web]
    assert len(vertices)>10000, f'{index}: missing modeled surface'
    assert max(depths)-min(depths)>minimum_relief, f'{index}: surface is too flat'
    assert max(depths)<=p['depth']+.00001, f'{index}: exceeds supplied depth'
    assert min(depths)>0, f'{index}: goes behind wall'
    supports=[c for c in obj.children if c.name.startswith('SUPPORT_')]
    assert len(supports)==1 and len(supports[0].data.polygons)>100, f'{index}: missing continuous sides'
    # Every physical front edge has a matching side-shell vertex.
    side_points={tuple(round(x,5) for x in v.co) for v in supports[0].data.vertices}
    from collections import Counter
    counts=Counter(tuple(sorted(edge)) for poly in obj.data.polygons for edge in poly.edge_keys)
    boundary={v for edge,count in counts.items() if count==1 for v in edge}
    assert all(tuple(round(x,5) for x in obj.data.vertices[v].co) in side_points for v in boundary), f"{index}: front edge has an open seam"
    if index==17:
        assert all(abs(depths[v]-p["baseDepth"])<.00001 for v in boundary), "Strategy board perimeter must stay flat"
        assert item["roomId"]=="right", "Strategy must be in the right flag room"
    right=Vector((0,1,0)).cross(n)
    measured_width=max(v.dot(right) for v in web)-min(v.dot(right) for v in web)
    measured_height=max(v.y for v in web)-min(v.y for v in web)
    assert abs(measured_width-item['width'])<.00001
    assert abs(measured_height-item['height'])<.00001
    results.append(dict(index=index,vertices=len(vertices),minDepthMeters=min(depths),maxDepthMeters=max(depths),reliefMeters=max(depths)-min(depths),width=measured_width,height=measured_height,sideFaces=len(supports[0].data.polygons)))
assert abs(results[-1]['maxDepthMeters']-.1016)<.00001
report={'status':'DIMENSIONAL_ART_AUDIT_PASS','works':results,'limits':'Photo-informed reconstruction. Local relief contours and unmeasured support thicknesses are estimates.'}
(ROOT/'qa/dimensional-mesh-audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
