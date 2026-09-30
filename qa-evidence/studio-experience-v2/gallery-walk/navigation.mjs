export const BODY_RADIUS=.23;
const inRoom=(x,z,r)=>x>=r.bounds.minX&&x<=r.bounds.maxX&&z>=r.bounds.minZ&&z<=r.bounds.maxZ;
export function roomAt(x,z,world){return world.rooms.find(r=>inRoom(x,z,r));}
export function canStand(x,z,world,radius=BODY_RADIUS){
  if(![-1,1].every(a=>[-1,1].every(b=>world.rooms.some(r=>inRoom(x+a*radius,z+b*radius,r)))))return false;
  return !world.colliders.some(b=>{const dx=x-Math.max(b.minX,Math.min(b.maxX,x)),dz=z-Math.max(b.minZ,Math.min(b.maxZ,z));return dx*dx+dz*dz<radius*radius;});
}
export function moveBody(position,dx,dz,world){
  let [x,y,z]=position;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
  for(let i=0;i<steps;i++){if(canStand(x+dx/steps,z,world))x+=dx/steps;if(canStand(x,z+dz/steps,world))z+=dz/steps;}
  return [x,y,z];
}
export function clearLine(a,b,world){const distance=Math.hypot(b[0]-a[0],b[2]-a[2]),steps=Math.max(1,Math.ceil(distance/.09));for(let i=0;i<=steps;i++){const t=i/steps;if(!canStand(a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t,world))return false;}return true;}
export function findPath(start,end,world){
  const cell=.35,minX=Math.min(...world.rooms.map(r=>r.bounds.minX)),minZ=Math.min(...world.rooms.map(r=>r.bounds.minZ));
  const maxX=Math.max(...world.rooms.map(r=>r.bounds.maxX)),maxZ=Math.max(...world.rooms.map(r=>r.bounds.maxZ));
  const width=Math.ceil((maxX-minX)/cell)+1,height=Math.ceil((maxZ-minZ)/cell)+1;
  const point=(x,z)=>[minX+x*cell,1.65,minZ+z*cell],key=(x,z)=>z*width+x;
  const valid=(x,z)=>x>=0&&z>=0&&x<width&&z<height&&canStand(minX+x*cell,minZ+z*cell,world);
  function nearest(p){let best=null,d=Infinity;const x=Math.round((p[0]-minX)/cell),z=Math.round((p[2]-minZ)/cell);for(let a=-4;a<=4;a++)for(let b=-4;b<=4;b++){if(!valid(x+a,z+b))continue;const q=point(x+a,z+b),distance=Math.hypot(q[0]-p[0],q[2]-p[2]);if(distance<d){best={x:x+a,z:z+b};d=distance;}}return best;}
  const from=nearest(start),to=nearest(end);if(!from||!to)return null;
  const goal=canStand(end[0],end[2],world)?[end[0],1.65,end[2]]:point(to.x,to.z);
  if(clearLine(start,goal,world))return [goal];
  const startKey=key(from.x,from.z),endKey=key(to.x,to.z),open=[{...from,id:startKey,g:0,f:0}],cost=new Map([[startKey,0]]),parents=new Map(),closed=new Set();
  while(open.length){let smallest=0;for(let i=1;i<open.length;i++)if(open[i].f<open[smallest].f)smallest=i;const n=open.splice(smallest,1)[0];if(closed.has(n.id))continue;
    if(n.id===endKey){let id=n.id,path=[goal];while(id!==startKey){path.push(point(id%width,Math.floor(id/width)));id=parents.get(id);}path.push(point(from.x,from.z));path.push(start);path.reverse();
      const smooth=[];let i=0;while(i<path.length-1){let j=path.length-1;while(j>i+1&&!clearLine(path[i],path[j],world))j--;if(!clearLine(path[i],path[j],world))return null;smooth.push(path[j]);i=j;}return smooth;
    }
    closed.add(n.id);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;const x=n.x+dx,z=n.z+dz,id=key(x,z);if(!valid(x,z)||closed.has(id)||!clearLine(point(n.x,n.z),point(x,z),world))continue;const g=n.g+Math.hypot(dx,dz);if(g>=(cost.get(id)??Infinity))continue;cost.set(id,g);parents.set(id,n.id);open.push({x,z,id,g,f:g+Math.hypot(x-to.x,z-to.z)});}
  }
  return null;
}
export function worldMovement(yaw,forward,side,distance){const length=Math.hypot(forward,side)||1;return [(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*distance/length,(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*distance/length];}
export function wrapAngle(angle){return Math.atan2(Math.sin(angle),Math.cos(angle));}
