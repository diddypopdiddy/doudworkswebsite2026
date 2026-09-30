"""Non-destructive 4:3 adaptation of the studio's original Blender TV."""
import bpy,json
from pathlib import Path
from mathutils import Matrix
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'source/tv-2010s.blend'))
# Change the editable physical screen/support geometry, not a stretched render.
# Lights and camera keep their own proportions; the display becomes 9.6 × 7.2.
for o in bpy.context.scene.objects:
 if o.type in {'MESH','FONT'}:o.matrix_world=Matrix.Diagonal((.75,1,1,1)) @ o.matrix_world
scene=bpy.context.scene;scene.camera.data.ortho_scale=13.4
scene.render.resolution_x=1400;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
scene.cycles.samples=32;scene.render.filepath=str(ROOT/'tv-4x3.png');scene.render.film_transparent=True
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/tv-4x3.blend'))
bpy.ops.render.render(write_still=True)
w=13.4;h=w*1200/1400
registration={'canvas':[1400,1200],'screenPercent':{'left':(w/2-4.8)/w*100,'top':(h/2-4.6)/h*100,'width':9.6/w*100,'height':7.2/h*100},'screenAspect':'4:3','screenDimensions':[9.6,7.2],'derivedFrom':'tv-2010s.blend; x geometry scaled 0.75; original preserved'}
(ROOT/'source/tv-4x3-registration.json').write_text(json.dumps(registration,indent=2))
