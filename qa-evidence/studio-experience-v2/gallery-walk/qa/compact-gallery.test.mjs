import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canStand,moveBody,findPath,clearLine,roomAt} from '../navigation.mjs';
const root=new URL('../../',import.meta.url);
const world=JSON.parse(fs.readFileSync(new URL('gallery-compact/room-manifest.json',root)));
const selected=JSON.parse(fs.readFileSync(new URL('selected-art/manifest.json',root))).items;
const picks=[1,2,7,9,10,23,24,28,36,64,65,67,78,101,105,128];
test('two physical rooms have the intended footprint',()=>{
 assert.equal(world.rooms.length,2);
 assert.deepEqual(world.rooms.map(r=>r.id),['main','right']);
 const areas=world.rooms.map(r=>(r.bounds.maxX-r.bounds.minX)*(r.bounds.maxZ-r.bounds.minZ)).sort((a,b)=>b-a);
 assert.ok(areas[0]>32&&areas[0]<35);
 assert.ok(areas[1]>14&&areas[1]<17);
 assert.ok(canStand(world.navigationStart.position[0],world.navigationStart.position[2],world));
});
test('every room route arrives through real openings using collision movement',()=>{
 for(const a of world.rooms)for(const b of world.rooms){
  const route=findPath(a.waypoint,b.waypoint,world);assert.ok(route?.length,a.id+'→'+b.id);
  let p=[...a.waypoint];
  for(const goal of route){assert.ok(clearLine(p,goal,world));let count=0;
   while(Math.hypot(goal[0]-p[0],goal[2]-p[2])>.04&&count++<1000){
    const dx=goal[0]-p[0],dz=goal[2]-p[2],d=Math.hypot(dx,dz),step=Math.min(.035,d);
    p=moveBody(p,dx/d*step,dz/d*step,world);
   }
   assert.ok(count<1000,'stuck '+a.id+'→'+b.id);
  }
  assert.equal(roomAt(p[0],p[2],world)?.id,b.id);
  assert.ok(Math.hypot(p[0]-b.waypoint[0],p[2]-b.waypoint[2])<.08);
 }
});
test('all twenty-one source records retain stable identities and measured sizes',()=>{
 assert.deepEqual(world.items.slice(0,16).map(a=>a.pickNumber),picks);
 assert.equal(world.items.length,21);
 assert.equal(selected[16].title,"Loretta");
 assert.equal(selected[16].medium,"Oil pastel on board");
 assert.equal(selected[16].year,"2018");
 assert.deepEqual([world.items[16].width,world.items[16].height],[.8128,.8128]);
 for(const [i,a] of world.items.entries()){
  assert.equal(a.index,i);assert.equal(a.file,selected[i].file);assert.equal(a.placeholder,false);
  assert.ok(['wall','hidden'].includes(a.display));
  assert.ok(Math.abs(a.width-selected[i].physical.width)<.0001);
  assert.ok(Math.abs(a.height-selected[i].physical.height)<.0001);
 }
 assert.equal(selected[12].title,'The Third Sibling');assert.equal(world.items[12].physical.mount,'clock');
 for(const i of [9,10,11])assert.deepEqual([world.items[i].width,world.items[i].height],[.2286,.2794]);
});
test('only wall works have supports, opaque mounting, and neighbor clearance',()=>{
 const wall=world.items.filter(a=>a.display==='wall');
 assert.equal(wall.length,13);
 for(const a of wall){
  const [x,y,z]=a.position,n=a.normal,half=a.width/2;
  const solidWall=world.colliders.filter(c=>/wall|pier|barrier/i.test(c.name)).find(c=>n[2]?
   z>=c.minZ-.16&&z<=c.maxZ+.16&&x-half>=c.minX-.01&&x+half<=c.maxX+.01:
   x>=c.minX-.16&&x<=c.maxX+.16&&z-half>=c.minZ-.01&&z+half<=c.maxZ+.01);
  assert.ok(solidWall,'continuous wall for '+a.index);
  const face=n[2]?(n[2]>0?solidWall.maxZ:solidWall.minZ):(n[0]>0?solidWall.maxX:solidWall.minX);
  assert.ok(Math.abs(a.wallAnchor[n[2]?2:0]-face)<.009,'art anchored to exposed wall face '+a.index);
  for(const w of world.windows||[]){
   if(w.normal.join()!=n.join())continue;
   const axis=n[0]?0:2,along=n[0]?2:0;
   if(Math.abs(a.wallAnchor[axis]-w.center[axis])>.2)continue;
   assert.ok(a.position[along]+half<=w.center[along]-w.width/2||a.position[along]-half>=w.center[along]+w.width/2,'window overlap '+a.index);
  }
  for(const b of wall){
   if(a.index>=b.index||a.normal.join()!=b.normal.join())continue;
   const axis=n[0]?0:2,along=n[0]?2:0;
   if(Math.abs(a.wallAnchor[axis]-b.wallAnchor[axis])>.02)continue;
   assert.ok(Math.abs(a.position[along]-b.position[along])>=(a.width+b.width)/2+.06||Math.abs(y-b.position[1])>=(a.height+b.height)/2+.06,'crowded '+a.index+'/'+b.index);
  }
  const gap=a.position.reduce((v,p,i)=>v+(p-a.wallAnchor[i])*n[i],0);
  assert.ok(gap>=a.physical.depth-.001&&gap<a.physical.depth+.012,'wall mounting '+a.index);
 }
});
test('each wall work has a usable viewing position inside its room',()=>{
 for(const a of world.items.filter(a=>a.display==='wall')){
  const distance=Math.max(.65,Math.min(1.6,Math.max(a.width,a.height)*1.4));
  const goal=a.position.map((v,i)=>v+a.normal[i]*distance);goal[1]=1.65;
  assert.ok(canStand(goal[0],goal[2],world),'viewing clearance '+a.index);
  assert.ok(findPath(world.navigationStart.position,goal,world)?.length,'view route '+a.index);
 }
});

test('only hung works are active and retired sources have no portfolio',()=>{
 assert.equal(world.portfolio,undefined);
 assert.deepEqual(world.items.filter(a=>a.display==='hidden').map(a=>a.index),[7,8,9,10,11,12,13,14]);
 assert.deepEqual(world.items.filter(a=>a.display==='wall').map(a=>a.index),[0,1,2,3,4,5,6,15,16,17,18,19,20]);
 assert.ok(!world.colliders.some(c=>/portfolio/i.test(c.name)));
 assert.deepEqual(world.items.filter(a=>a.display==='wall'&&a.roomId==='right').map(a=>a.index),[3,17,18,19,20]);
});

test('dimensional works retain owner sizes and only the requested artwork view',()=>{
 const expected=[['Strategy',.6096,.508,.03175,1],['America #1',1.016,.762,.0381,1],['America #2',1.2192,.6096,.1016,1]];
 for(const [offset,[title,width,height,depth,views]] of expected.entries()){
  const a=selected[offset+17],w=world.items[offset+17];
  assert.equal(a.title,title);assert.equal(a.year,null);
  assert.deepEqual([w.width,w.height,w.physical.depth],[width,height,depth]);
  assert.ok(w.physical.relief);assert.ok(w.physical.baseDepth<depth);
  assert.equal(a.views.length,views);assert.equal(a.views[0].label,'Artwork');assert.equal(a.views[0].file,a.file);
  for(const v of a.views){assert.ok(fs.existsSync(new URL('selected-art/'+v.file,root)));assert.ok(v.width>0&&v.height>0);}
 }
});


test('Stolen faces the entrance with paired works on opposing side walls',()=>{
 const baby=world.items[20];assert.equal(selected[20].title,'Stolen');assert.equal(selected[20].medium,'Oil on canvas');
 assert.deepEqual([baby.width,baby.height,baby.physical.depth],[1.2192,1.2192,.0381]);assert.equal(baby.roomId,'right');
 assert.deepEqual(baby.normal,[-1,0,0]);assert.equal(baby.position[2],0);
 for(const i of [18,19])assert.deepEqual(world.items[i].normal,[0,0,-1]);
 for(const i of [3,17])assert.deepEqual(world.items[i].normal,[0,0,1]);
 assert.equal(world.items[18].wallAnchor[2],world.items[19].wallAnchor[2]);
 assert.equal(world.items[3].wallAnchor[2],world.items[17].wallAnchor[2]);
});
