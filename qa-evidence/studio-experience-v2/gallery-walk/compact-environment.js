import * as THREE from '../gallery/vendor/three.module.js';
import {HDRLoader} from '../gallery-corner/vendor/HDRLoader.js';
const cornerAsset=name=>new URL('../gallery-corner/'+name,import.meta.url).href;

// The street stays outside the physical openings. World-fixed curved plates
// give the window frames parallax without pretending the street is navigable.
export async function addRefinedEnvironment(model,scene,renderer,world){
  const [map,hdr]=await Promise.all([
    new THREE.TextureLoader().loadAsync(cornerAsset('textures/neighborhood-view.jpg')),
    new HDRLoader().loadAsync(cornerAsset('textures/studio_small_09_1k.hdr'))
  ]);
  map.colorSpace=THREE.SRGBColorSpace;
  renderer.localClippingEnabled=true;
  map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  model.traverse(o=>{
    if(!o.name.startsWith('WINDOW_GLASS'))return;
    for(const m of(Array.isArray(o.material)?o.material:[o.material])){
      m.color.set('#ffffff');m.transmission=0;m.transparent=true;m.opacity=.045;
      m.roughness=.06;m.metalness=0;m.envMapIntensity=.25;m.depthWrite=false;m.needsUpdate=true;
    }
    o.castShadow=false;o.receiveShadow=false;
  });
  const groups=new Map();
  for(const w of world.windows||[]){const key=w.normal.join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(w);}
  for(const windows of groups.values()){
    const normal=windows[0].normal;
    const center=windows.reduce((sum,w)=>sum.map((v,i)=>v+w.center[i]/windows.length),[0,0,0]);
    const geometry=new THREE.CylinderGeometry(16,16,40,96,1,true,Math.PI,Math.PI);
    const uv=geometry.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,1-uv.getX(i),(uv.getY(i)-.5)*40/24+.5);
    const view=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map,toneMapped:false,side:THREE.BackSide}));
    // Keep the left plate behind its facade so it cannot cut through the
    // photographic view seen through the front windows.
    
    view.name='EXTERIOR_VIEW_'+windows[0].id;
    view.position.set(center[0]-normal[0]*.15,4.2,center[2]-normal[2]*.15);
    view.rotation.y=Math.atan2(-normal[2],normal[0]);
    model.add(view);
  }
  const groundGeometry=new THREE.PlaneGeometry(80,80,40,40).toNonIndexed();
  const uv=groundGeometry.attributes.uv;
  for(let start=0;start<uv.count;start+=6){
    const us=[],vs=[];for(let j=0;j<6;j++){us.push(uv.getX(start+j));vs.push(uv.getY(start+j));}
    const minU=Math.min(...us),minV=Math.min(...vs),spanU=Math.max(...us)-minU,spanV=Math.max(...vs)-minV;
    for(let j=0;j<6;j++)uv.setXY(start+j,.2+(us[j]-minU)/spanU*.6,.01+(vs[j]-minV)/spanV*.17);
  }
  const ground=new THREE.Mesh(groundGeometry,new THREE.MeshBasicMaterial({map,toneMapped:false}));
  ground.name='EXTERIOR_STREET_GROUND';ground.rotation.x=-Math.PI/2;ground.position.set(0,-.08,-5);model.add(ground);
  // Local contact shading belongs at the support-wall join. Keep it subtle;
  // the modeled canvas/wood edge and curled paper supply the actual depth.
  for(const art of world.items){
    if((art.display&&art.display!=='wall')||!art.wallAnchor||!art.physical)continue;
    const paper=art.physical.mount==='paper',margin=paper?.007:.025;
    const w=art.width+margin*2,h=art.height+margin*2;
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=512;shadowCanvas.height=512;
    const ctx=shadowCanvas.getContext('2d');
    const insetX=margin/w*512,insetY=margin/h*512;
    ctx.shadowColor='black';ctx.shadowBlur=paper?5:10;ctx.shadowOffsetY=paper?1:3;
    ctx.fillStyle='black';if(art.physical.mount==='clock'){ctx.beginPath();ctx.ellipse(256,256,256-insetX,256-insetY,0,0,Math.PI*2);ctx.fill();}else{ctx.fillRect(insetX,insetY,512-insetX*2,512-insetY*2);}
    const texture=new THREE.CanvasTexture(shadowCanvas);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:paper?.16:.25,depthWrite:false,toneMapped:false}));
    shadow.name='MOUNT_CONTACT_'+art.index;
    const normal=new THREE.Vector3(...art.normal);
    shadow.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
    shadow.position.fromArray(art.wallAnchor).addScaledVector(normal,.0007);shadow.position.y-=paper?.0006:.002;
    shadow.raycast=()=>{};model.add(shadow);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromEquirectangular(hdr);
  scene.environment=target.texture;scene.environmentIntensity=.30;hdr.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf4f8ff,0x8a8378,.70));
  const sun=new THREE.DirectionalLight(0xfffaf0,.8);
  sun.position.set(-8,5,8);sun.target.position.set(1,.7,-3);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:45});
  sun.shadow.normalBias=.012;sun.shadow.bias=-.00015;sun.shadow.radius=5;sun.shadow.blurSamples=8;scene.add(sun,sun.target);
  // Direct indoor light comes from the modeled, aimed track fixtures.
  // HDR + hemisphere supply soft bounced daylight without invisible room bulbs.
  return target;
}
