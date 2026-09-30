"""Photo-registered relief meshes for Strategy and the two America works.

Dimensions and media are supplied by the artist. Depth fields are conservative
reconstructions inferred from the supplied frontal/detail photographs, not scans.
No source image is rewritten; front and edge color comes from the original photo.
The four crop corners use the builder's bottom-left Blender-UV convention.
"""
from pathlib import Path
import math
import bpy
import numpy as np
from mathutils import Vector


def _smoothstep(lo, hi, value):
    t = np.clip((value-lo)/(hi-lo), 0, 1)
    return t*t*(3-2*t)


def _blur(a, passes=1):
    """One-cell edge-preserving-enough antialiasing, without wraparound."""
    for _ in range(passes):
        padded = np.pad(a, 1, mode='edge')
        a = (padded[1:-1,1:-1]*4 + padded[:-2,1:-1] +
             padded[2:,1:-1] + padded[1:-1,:-2] + padded[1:-1,2:])/8
    return a


def _photo_uv(u, v, corners):
    corners = np.asarray(corners, dtype=np.float32)
    return ((1-v)[...,None]*((1-u)[...,None]*corners[0]+u[...,None]*corners[1]) +
            v[...,None]*((1-u)[...,None]*corners[3]+u[...,None]*corners[2]))



def _registered_uv(kind, u, v, corners):
    """Follow Strategy's photographed bowed board edges, not its outer quad.

    Contour positions were sampled on the unchanged 5712 x 4284 front photo,
    expressed in the 1824 x 1368 display coordinate system for readability.
    A three-display-pixel inset keeps bilinear texture filtering inside paint.
    This corrects source registration only: physical artwork dimensions stay fixed.
    """
    if kind == 'america-1':
        # Keep the slightly curved photographed canvas edge and texture
        # filtering inside the paint, excluding thin siding/deck slivers.
        return _photo_uv(.008+.984*u,.008+.984*v,corners)
    if kind != 'strategy':
        return _photo_uv(u,v,corners)
    # Top/bottom retain the measured perspective lines with a tiny inward margin.
    # The ragged top-right and bottom-right corners need a 0.8% vertical
    # inset (~10 display pixels); these are paint-only margins in the source.
    inset_v = .008 + .984*v
    uv = _photo_uv(u,inset_v,corners)
    photo_y = (1-uv[...,1])*1368
    ys = np.array([84,90,120,200,300,400,500,600,700,800,900,1000,1100,1200,1275,1312])
    left = np.array([187,187,189,196,205,215,223,230,236,240,242,239,236,232,228,228])
    right = np.array([1702,1701,1696,1686,1674,1665,1657,1649,1643,1638,1639,1640,1645,1649,1654,1655])
    left_x = np.interp(photo_y,ys,left)+3
    right_x = np.interp(photo_y,ys,right)-3
    uv[...,0] = ((1-u)*left_x+u*right_x)/1824
    return uv


def _sample(image, uv):
    w,h = image.size
    pixels = np.empty(w*h*image.channels, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    pixels = pixels.reshape(h,w,image.channels)
    x = np.clip(uv[...,0]*(w-1),0,w-1)
    y = np.clip(uv[...,1]*(h-1),0,h-1)
    x0,y0 = x.astype(np.int32),y.astype(np.int32)
    x1,y1 = np.minimum(x0+1,w-1),np.minimum(y0+1,h-1)
    tx,ty = (x-x0)[...,None],(y-y0)[...,None]
    return ((1-ty)*((1-tx)*pixels[y0,x0,:3]+tx*pixels[y0,x1,:3]) +
            ty*((1-tx)*pixels[y1,x0,:3]+tx*pixels[y1,x1,:3]))


def _depth_field(kind, rgb, u, v, base, depth):
    """Return meters from the back of the work; maximum includes the support."""
    r,g,b = rgb[...,0],rgb[...,1],rgb[...,2]
    bright, dark = np.max(rgb,axis=-1), np.min(rgb,axis=-1)
    chroma = bright-dark
    envelope = np.sin(np.pi*u)*np.sin(np.pi*v)
    if kind == 'strategy':
        # Flat board, with only identifiable attached objects raised. Do not
        # displace the red/burgundy paint or let photo gradients bend the panel.
        cream = _blur(((g>.38)&(b>.22)&(r>.40)).astype(float))
        cool = ((np.maximum(g,b)>.16)&(np.maximum(g,b)>r*1.12)).astype(float)
        amber = ((r>.48)&(g>.19)&(g<r*.80)&(g>b*1.5)).astype(float)
        bands = _blur(np.maximum(cool,amber))*(1-cream)
        metal = _blur(((dark>.16)&(chroma<.065)&(bright<.65)).astype(float))
        bolt = np.exp(-(((u-.710)/.026)**2+((v-.473)/.035)**2))
        clamp = np.exp(-(((u-.827)/.034)**2+((v-.650)/.046)**2))
        chain = np.exp(-(((u-.505)/.035)**2+((v-.305)/.195)**2))
        hardware=metal*np.maximum.reduce((bolt,clamp*.65,chain*.24))
        relief=.0035*cream+.0015*bands+.002*metal
        if float(hardware.max())>1e-5:
            relief += (depth-base-.005)*hardware/float(hardware.max())
        border=_smoothstep(.018,.035,np.minimum.reduce((u,1-u,v,1-v)))
        field=base+np.minimum(relief,depth-base)*border
        inference='Planar board with localized cross, band and metal-object relief; depth is estimated. No board curvature or paint-gradient displacement.'
    elif kind == 'america-1':
        # Local chromatic edge ridges identify colored rubber bands in the canton.
        # Paint elsewhere remains shallow rather than embossing every dark stripe.
        canton = _smoothstep(.47,.40,u)*_smoothstep(.38,.45,v)
        color = _smoothstep(.07,.24,chroma)
        # Rubber bands are narrow bright color ridges against the paint beneath.
        local = _blur(_blur(bright,2),2)
        ridge = _smoothstep(.018,.095,bright-local)
        rubber = _blur(color*ridge*canton)
        paint = _blur(_smoothstep(.18,.62,bright),2)*.00045
        field = base + paint + .0034*rubber
        field = base+(field-base)*(depth-base)/max(float(field.max()-base),1e-9)
        inference = '1.5-inch total canvas projection supplied by artist; raised rubber-band and paint relief inferred from the close-up.'
    elif kind == 'america-2':
        # A continuous, genuinely bowed fabric surface; no flat face on a box.
        # The displaced surface spans its stated four-inch maximum projection.
        pillow = np.maximum(envelope,0)**.63
        lobes = 1 + .09*np.sin(3*np.pi*u+.4)*np.sin(2*np.pi*v)
        folds = (.018*np.sin(15*u+7*v)+.013*np.sin(29*u-19*v))*pillow
        form = np.maximum(pillow*lobes + folds,0)
        form /= max(float(form.max()),1e-9)
        # Fine bag/cloth rumpling is small relative to the broad convex volume.
        luminance = rgb@np.array([.2126,.7152,.0722])
        fine = (_blur(luminance)-_blur(luminance,5))*.0012*pillow
        field = base+(depth-base)*form+fine
        field = base+(field-base)*(depth-base)/max(float(field.max()-base),1e-9)
        inference = '48 x 24-inch canvas and approximate four-inch maximum projection supplied by artist; soft bow/folds reconstructed from both side photographs, not a measured scan.'
    else:
        raise ValueError('Unknown dimensional artwork kind: '+kind)
    return field, inference


def _mesh_object(name, vertices, faces, uv, mat):
    mesh = bpy.data.meshes.new(name+'_MESH')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name='UVMap')
    loop_vertex = np.empty(len(mesh.loops),dtype=np.int32)
    mesh.loops.foreach_get('vertex_index',loop_vertex)
    uv_layer.data.foreach_set('uv',np.asarray(uv,dtype=np.float32)[loop_vertex].ravel())
    obj = bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def build_dimensional_art(index, item, anchor, normal, mats, helpers):
    """Build a front relief and one SUPPORT child; return (art, center, maxDepth).

    helpers must provide {'material': builder.material, 'ART_DIR': builder.ART_DIR}.
    physical requires width, height, depth in meters, relief ('strategy',
    'america-1', 'america-2'), uvCorners; optional baseDepth and wallGap.
    The caller adds its ordinary art extras, room metadata, and placement record.
    """
    p = item['physical']
    width,height,depth = float(p['width']),float(p['height']),float(p['depth'])
    kind = p['relief']
    defaults = {'strategy':.0064,'america-1':max(.001,depth-.0035),'america-2':.019}
    base = float(p.get('baseDepth',defaults[kind]))
    if not 0 < base < depth:
        raise ValueError('baseDepth must be positive and smaller than total depth')
    gap = float(p.get('wallGap',.005))
    n = np.asarray(normal,dtype=np.float64)
    n /= np.linalg.norm(n)
    up = np.asarray((0,1,0),dtype=np.float64)
    right = np.cross(up,n); right /= np.linalg.norm(right)
    anchor = np.asarray(anchor,dtype=np.float64)
    texture = Path(helpers['ART_DIR'])/item['file']
    roughness = .88 if kind=='america-2' else .94
    mat = helpers['material'](f'ARTWORK_{index}_MATERIAL',(1,1,1),roughness,texture=texture)
    image = next(node.image for node in mat.node_tree.nodes if node.type=='TEX_IMAGE')
    if image.size[0]>2400:
        image.scale(2400,max(1,round(image.size[1]*2400/image.size[0])))
    nx = 336 if kind=='strategy' else 352 if kind=='america-1' else 176
    ny = max(64,round(nx*height/width))
    u,v = np.meshgrid(np.linspace(0,1,nx+1),np.linspace(0,1,ny+1))
    mapping = _photo_uv if p.get('rectifiedTexture') else lambda u,v,corners: _registered_uv(kind,u,v,corners)
    uv = mapping(u,v,p.get('uvCorners',((0,0),(1,0),(1,1),(0,1))))
    rgb = _sample(image,uv)
    field,inference = _depth_field(kind,rgb,u,v,base,depth)
    web = (anchor + right[None,None,:]*((u-.5)*width)[...,None] +
           up[None,None,:]*((v-.5)*height)[...,None] + n[None,None,:]*(gap+field)[...,None])
    xyz = np.stack((web[...,0],-web[...,2],web[...,1]),axis=-1).reshape(-1,3)
    stride=nx+1
    faces = [(y*stride+x,y*stride+x+1,(y+1)*stride+x+1,(y+1)*stride+x)
             for y in range(ny) for x in range(nx)]
    art = _mesh_object(f'ART_{index}',xyz.tolist(),faces,uv.reshape(-1,2),mat)
    for face in art.data.polygons:
        face.use_smooth=True
    # Counterclockwise front boundary: bottom, right, top, left. The edge shell
    # wraps the SAME photo around the physical thickness, so it is not cream trim.
    perimeter = (list(range(stride)) + [y*stride+nx for y in range(1,ny+1)] +
                 [ny*stride+x for x in range(nx-1,-1,-1)] +
                 [y*stride for y in range(ny-1,0,-1)])
    flat_web=web.reshape(-1,3)
    rear_web=flat_web[perimeter]-n*(field.ravel()[perimeter,None])
    rear_xyz=np.stack((rear_web[:,0],-rear_web[:,2],rear_web[:,1]),axis=-1)
    edge_vertices=np.concatenate((xyz[perimeter],rear_xyz))
    count=len(perimeter)
    edge_faces=[(i,i+count,(i+1)%count+count,(i+1)%count) for i in range(count)]
    edge_faces.append(tuple(range(2*count-1,count-1,-1)))
    edge_uv=np.concatenate((uv.reshape(-1,2)[perimeter],uv.reshape(-1,2)[perimeter]))
    support=_mesh_object(f'SUPPORT_{index}_{p.get("mount","canvas").upper()}',edge_vertices.tolist(),edge_faces,edge_uv,mat)
    support.data.materials.append(mats['oak'] if kind=='strategy' else mats['canvas_edge'])
    support.data.polygons[-1].material_index=1
    support.parent=art
    support.matrix_parent_inverse=art.matrix_world.inverted()
    art['reliefType']=kind
    art['depthMethod']='photo-informed geometry, not photogrammetry'
    art['depthInference']=inference
    art['maximumProjectionMeters']=float(field.max())
    art['baseDepthMeters']=base
    art['frontDepthMinimumMeters']=float(field.min())
    art['frontDepthMaximumMeters']=float(field.max())
    art['frontReliefRangeMeters']=float(field.max()-field.min())
    art['wallGapMeters']=gap
    art['reliefVertices']=len(xyz)
    art['originalTexture']=item['file']
    if kind=='strategy':
        art['uvRegistration']='Photo-measured curved board sides; 3-pixel side and 0.8-percent top/bottom paint-edge insets, unchanged physical dimensions.'
    art['physicalWidthMeters']=width
    art['physicalHeightMeters']=height
    art['sourceIndex']=index
    if item.get('pickNumber') is not None:
        art['pickNumber']=item['pickNumber']
    art['mount']=p.get('mount','canvas')
    art['surfaceCenterMetersFromBack']=float(field[ny//2,nx//2])
    center=(anchor+n*(gap+depth)).tolist()
    return art,center,float(field.max())
