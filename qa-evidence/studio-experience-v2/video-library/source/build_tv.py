import bpy,math,json
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,metal=0,rough=.4):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
black=mat('Graphite satin casing',(.025,.029,.034),.35,.28);rim=mat('Polished black bezel',(.008,.011,.015),.45,.17);silver=mat('Brushed aluminum lower trim',(.29,.32,.34),.8,.28);dark=mat('Speaker recess',(.006,.008,.011),.1,.8);glass=mat('Powered display',(.006,.012,.022),.1,.25);label=mat('Silver legends',(.57,.61,.63),.3,.5);led=mat('Power indicator',(.13,.5,.32),.1,.2)
p=led.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.1,.7,.33,1);p.inputs['Emission Strength'].default_value=2

def box(name,loc,scale,material,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if bevel:
  mod=o.modifiers.new('Manufactured edge radius','BEVEL');mod.width=bevel;mod.segments=5;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
# An early/mid-2010s LCD: substantial bezel, lower speakers, center pedestal.
box('Molded rear shell',(0,.08,.7),(14.35,.68,8.72),black,.19)
box('Gloss front surround',(0,-.3,.7),(14.2,.16,8.57),rim,.1)
box('Screen recess',(0,-.398,1.0),(12.88,.025,7.28),dark,.01)
box('16 by 9 screen',(0,-.42,1.0),(12.8,.025,7.2),glass,.008)
box('Lower brushed chin',(0,-.412,-3.22),(14.01,.075,.5),silver,.035)
box('Speaker left',(-4.4,-.458,-3.20),(4.5,.016,.13),dark,.01)
box('Speaker right',(4.4,-.458,-3.20),(4.5,.016,.13),dark,.01)
for side in [-1,1]:
 for i in range(67):box('Speaker grille rib',(side*4.4-2.18+i*.066,-.47,-3.20),(.012,.009,.125),silver,.003)
box('Pedestal neck',(0,.06,-4.03),(1.22,.55,1.05),black,.1)
box('Pedestal foot',(0,-.05,-4.67),(5.8,2.1,.22),rim,.17)
box('Pedestal edge highlight',(0,-1.105,-4.66),(5.4,.02,.065),silver,.016)
# Physical controls across lower front, kept outside the live display.
for i,name in enumerate(['INPUT','MENU','VOL -','VOL +','CH -','CH +']):
 x=2.4+i*.53;box('Button '+name,(x,-.444,-2.86),(.28,.048,.10),black,.03)
box('Green standby light',(6.33,-.458,-2.91),(.06,.025,.035),led,.01)
def text(body,loc,size):
 bpy.ops.object.text_add(location=loc,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='Legend '+body;o.data.body=body;o.data.align_x='CENTER';o.data.size=size;o.data.extrude=.0003;o.data.materials.append(label)
text('V I N C E',(0,-.465,-3.27),.14)
for i,n in enumerate(['INPUT','MENU','VOL-','VOL+','CH-','CH+']):text(n,(2.4+i*.53,-.473,-3.015),.075)
text('HD  /  1080',(-5.72,-.447,-2.90),.085)
# Front orthographic camera gives the HTML/YouTube screen exact registration.
bpy.ops.object.camera_add(location=(0,-22,0));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=17.8;bpy.context.scene.camera=camera
for name,loc,power,size in [('Key',(-6,-8,9),1800,7),('Fill',(7,-6,3),1000,6),('Top',(0,1,8),1500,5)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True;scene.world.color=(.15,.15,.15);scene.render.resolution_x=1600;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(ROOT/'tv-2010s.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/tv-2010s.blend'));bpy.ops.render.render(write_still=True)
(ROOT/'source/tv-registration.json').write_text(json.dumps({'canvas':[1600,1100],'screenPercent':{'left':14.04494382,'top':12.411235955,'width':71.91011236,'height':58.83554648},'model':'Original Blender model: graphite LCD, aluminum chin, speaker grilles, physical controls and pedestal'},indent=2))
