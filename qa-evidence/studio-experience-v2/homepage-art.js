// Place the original Loretta photograph on the foremost illustrated board.
// Source corners match selected-art/manifest.json; neither source image is edited.
const source = [[57,12],[1332,52],[1357,1342],[4,1355]];
const destination = [[483,244],[527,267],[483,293],[438,269]];

// Solve the eight coefficients of the perspective mapping between four corners.
export function perspective(from, to) {
  const rows = from.flatMap(([x,y], i) => {
    const [u,v] = to[i];
    return [[x,y,1,0,0,0,-u*x,-u*y,u], [0,0,0,x,y,1,-v*x,-v*y,v]];
  });
  for (let c=0;c<8;c++) {
    let pivot=c;
    for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[pivot][c]))pivot=r;
    [rows[c],rows[pivot]]=[rows[pivot],rows[c]];
    const divisor=rows[c][c];
    for(let k=c;k<9;k++)rows[c][k]/=divisor;
    for(let r=0;r<8;r++)if(r!==c){const factor=rows[r][c];for(let k=c;k<9;k++)rows[r][k]-=factor*rows[c][k];}
  }
  const [a,b,c,d,e,f,g,h]=rows.map(row=>row[8]);
  return `matrix3d(${[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1].join(',')})`;
}

const room=document.querySelector('#room-world');
if(room) {
  const style=document.createElement('style');
  style.textContent=`
    .room-artwork{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}
    .room-artwork-canvas{position:absolute;left:0;top:0;width:1522px;height:1033px;transform-origin:0 0;transform:scale(var(--art-scale,1));pointer-events:none}
    .room-artwork-board{position:absolute;inset:0;width:1522px;height:1033px;overflow:visible}
    .room-artwork-image{position:absolute;left:0;top:0;width:1380px;height:1360px;max-width:none;transform-origin:0 0;user-select:none;pointer-events:none;filter:brightness(.98)}
    .room-artwork{transition:filter 170ms ease,translate 210ms var(--ease-out)}
    .room-world[data-highlight="art"] .room-artwork{filter:brightness(1.035) contrast(1.07) saturate(1.06);translate:0 -1px}
    @media(prefers-reduced-motion:reduce){.room-artwork{transition:none}}
  `;
  document.head.append(style);
  const overlay=document.createElement('div');
  overlay.className='room-artwork';
  overlay.setAttribute('aria-hidden','true');
  const canvas=document.createElement('div');
  canvas.className='room-artwork-canvas';
  canvas.innerHTML='<svg class="room-artwork-board" viewBox="0 0 1522 1033" xmlns="http://www.w3.org/2000/svg"><path d="M437 270 483 245 529 269 483 298Z" fill="#322a22" opacity=".25"/><path d="M438 269 483 244 527 267 527 271 483 297 438 273Z" fill="#c5ad7d" stroke="#322c26" stroke-width="1.2"/><path d="M438 269 483 244 527 267 483 293Z" fill="#f0dfbb"/></svg>';
  const image=document.createElement('img');
  image.className='room-artwork-image';
  image.src=new URL('./selected-art/loretta-2018.png',import.meta.url).href;
  image.alt='';
  image.draggable=false;
  image.width=1380;
  image.height=1360;
  image.style.clipPath=`polygon(${source.map(([x,y])=>`${x}px ${y}px`).join(',')})`;
  image.style.transform=perspective(source,destination);
  canvas.append(image);
  overlay.append(canvas);
  // Above the old art-station highlight, below the clickable object hotspots.
  room.querySelector('.room-highlights').after(overlay);
  const resize=()=>overlay.style.setProperty('--art-scale',String(room.clientWidth/1522));
  new ResizeObserver(resize).observe(room);
  resize();
}
