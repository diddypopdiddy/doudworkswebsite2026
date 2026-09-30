// The authored DVD menu is deliberately rendered at SD resolution.
// This painter is never used over, or applied as a filter to, the YouTube iframe.
const background=new Image();background.src='master-studio-room-cartoon-v3-thin-contours.png';
export const menuBackgroundReady=background.decode().catch(()=>{});
export function paintMenu(canvas,model){
 const c=canvas.getContext('2d');const W=720,H=540;canvas.width=W;canvas.height=H;
 const text=(s,x,y,size=25,color='#fff',weight='bold',max=620)=>{c.save();c.font=`${weight} ${size}px ${weight==='900'?'"Arial Black", Arial':'Arial'}, sans-serif`;c.lineJoin='round';c.strokeStyle='#132952';c.lineWidth=size>40?8:3;c.shadowColor='#000b';c.shadowBlur=1;c.shadowOffsetX=2;c.shadowOffsetY=2;c.strokeText(s,x,y,max);c.fillStyle=color;c.fillText(s,x,y,max);c.restore()};
 const wrap=(s,max,size)=>{c.font=`bold ${size}px Arial`;let lines=[''];for(const word of String(s).split(' ')){const line=lines.at(-1);if(c.measureText(line+word).width>max&&line)lines.push('');lines[lines.length-1]+=word+' ';}return lines};
 c.fillStyle='#18345b';c.fillRect(0,0,W,H);
 if(background.complete&&background.naturalWidth){const s=Math.max(W/background.width,H/background.height);c.drawImage(background,(W-background.width*s)/2,(H-background.height*s)/2,background.width*s,background.height*s)}
 let shade=c.createLinearGradient(190,0,W,0);shade.addColorStop(0,'#07132600');shade.addColorStop(.5,'#13294dcc');shade.addColorStop(1,'#142953f5');c.fillStyle=shade;c.fillRect(0,0,W,H);
 const home=model.view==='home';if(!home){c.fillStyle='#061327a6';c.fillRect(0,0,W,H);c.fillStyle='#10294bdd';c.fillRect(26,30,668,65);text(model.title,48,74,33,'#ffe16a','900',622)}
 if(home){text('VINCE',365,155,67,'#ffe050','900',322);text('DOUD',365,219,67,'#ffe050','900',322);c.fillStyle='#b33724';c.fillRect(374,236,280,30);text('THE VIDEO COLLECTION',386,257,16,'#ffefae','bold',260)}
 let x=home?415:89,y=home?342:model.search?197:163,gap=home?82:model.view==='covers'?47:58,w=home?263:548,size=home?31:27;
 if(model.detail){
  const d=model.detail;const lines=wrap(d.song,572,34).slice(0,3);lines.forEach((line,i)=>text(line,66,151+i*38,34,'#ffec9b','bold',586));let yy=166+lines.length*38;
  text(d.artist,68,yy,23,'#fff','bold',582);yy+=35;
  text('ALBUM / RELEASE',68,yy,13,'#a8c4e0','bold',580);yy+=25;
  const releases=wrap(d.release||'Release not confirmed',574,21).slice(0,2);releases.forEach(line=>{text(line,68,yy,21,'#e7eff4','normal',575);yy+=25});
  text(`${d.performance}  •  ${Math.floor(d.duration/60)}:${String(d.duration%60).padStart(2,'0')}`,68,yy+20,18,'#d5e6ed','normal',580);
  text(`Uploaded ${d.date.slice(0,4)}${d.genre?'  •  '+d.genre:''}`,68,yy+49,16,'#d5e6ed','normal',580);x=90;y=456;gap=52;size=29;
 }
 const hits=[];model.items.forEach((item,i)=>{
  const yy=y+i*gap,on=model.highlight===item.key;
  if(on){c.fillStyle='#ffe63b';c.beginPath();c.moveTo(x-29,yy-18);c.lineTo(x-10,yy-8);c.lineTo(x-29,yy+2);c.fill()}
  text(item.label,x,yy,size,on?'#ffdf38':'#edf4f8','900',w);
  if(item.sub)text(item.sub,x,yy+19,14,'#bbcddd','normal',w);
  hits.push({...item,x:x-34,y:yy-34,w:w+35,h:item.sub?57:48});
 });
 if(model.pages){
  text(`${model.page+1} / ${model.pages}`,327,484,13,'#dce7ef','normal',100);
  if(model.page>0){text('◀ PREVIOUS',80,484,14,'#ffe070');hits.push({key:'previous',label:'Previous page',action:'previous',x:64,y:459,w:165,h:39})}
  if(model.page+1<model.pages){text('NEXT ▶',551,484,14,'#ffe070');hits.push({key:'next',label:'Next page',action:'next',x:523,y:459,w:132,h:39})}
 }
 text('DVD',28,505,22,'#d6e1ed','900',85);text('V I D E O',29,518,8,'#b7c8d4','bold',88);
 if(!home){const on=model.highlight==='main';text('◀ MAIN MENU',490,517,14,on?'#ffe63b':'#e4e9ed','bold',205);hits.push({key:'main',label:'Main menu',action:'home',x:470,y:493,w:220,h:38})}
 // The softly scaled 720×540 canvas and scanlines only affect this menu.
 c.fillStyle='#02091c';c.globalAlpha=.09;for(let y=0;y<H;y+=2)c.fillRect(0,y,W,1);c.globalAlpha=1;
 const vignette=c.createRadialGradient(360,245,210,360,245,460);vignette.addColorStop(0,'#03102300');vignette.addColorStop(1,'#02091c5c');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 return hits;
}
