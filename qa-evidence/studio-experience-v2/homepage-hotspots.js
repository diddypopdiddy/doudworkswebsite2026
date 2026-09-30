// Extra objects share the existing Music/Video highlight and routing behavior.
// Native SVG clips reuse the unchanged room image; the same outlines define hits.
const width=1522,height=1033;
const objects=[
  {id:'organ',category:'music',name:'organ',polygons:[[
    [6,411],[194,290],[233,314],[235,333],[271,363],[274,440],
    [280,508],[284,514],[278,524],[152,590],[143,590],[113,523],
    [56,554],[40,552],[30,528],[18,526]
  ]]},
  {id:'guitar',category:'music',name:'guitar',polygons:[[
    [290,244],[294,235],[306,233],[313,240],[315,253],[322,265],
    [324,290],[334,347],[342,348],[347,339],[354,338],[358,348],
    [354,363],[365,375],[373,397],[377,418],[373,429],[362,439],
    [349,442],[338,441],[331,438],[322,443],[311,442],[300,431],
    [296,415],[299,395],[305,378],[304,367],[298,359],[299,351],
    [305,348],[312,358],[320,363],[309,292],[302,262],[297,258]
  ],[[312,435],[321,438],[325,462],[325,475],[319,479],[312,477],[312,468],[315,449]],
    [[302,428],[310,431],[301,449],[295,451],[291,447]],
    [[359,430],[364,427],[384,443],[382,450],[374,451]]]},
  {id:'amp',category:'music',name:'amplifier',polygons:[[
    [376,372],[401,365],[409,360],[427,358],[434,360],[450,357],
    [456,363],[461,382],[464,428],[467,433],[463,440],[388,451],
    [378,449],[374,442],[376,434],[371,389],[370,379]
  ]]},
  {id:'light',category:'video',name:'studio light and stand',polygons:[[
    [1172,598],[1191,583],[1224,575],[1254,582],[1275,605],
    [1289,636],[1296,659],[1293,683],[1275,698],[1232,710],
    [1220,705],[1214,713],[1204,714],[1196,708],[1195,693],
    [1183,681],[1173,662],[1165,641],[1162,621],[1165,607]
  ],[[1201,707],[1215,710],[1193,938],[1182,970],[1171,968],[1183,938]],
    [[1178,951],[1188,956],[1132,1029],[1122,1033],[1118,1026]],
    [[1182,956],[1190,951],[1264,1008],[1266,1018],[1257,1022]],
    [[1163,927],[1172,923],[1193,947],[1187,955]]]},
];

const room=document.querySelector('#room-world');
if(room) {
  const ns='http://www.w3.org/2000/svg';
  const svgNode=(tag,attrs={})=>{const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);return node;};
  const definitions=svgNode('svg',{'aria-hidden':'true',width:0,height:0});
  definitions.style.position='absolute';
  const defs=svgNode('defs');definitions.append(defs);room.append(definitions);
  for(const category of ['music','video']) {
    const layer=svgNode('svg',{class:`room-highlight room-highlight--${category}`,viewBox:`0 0 ${width} ${height}`,preserveAspectRatio:'none','aria-hidden':'true'});
    const clip=svgNode('clipPath',{id:`extra-${category}-outline`});
    for(const object of objects.filter(item=>item.category===category))for(const points of object.polygons)clip.append(svgNode('polygon',{points:points.map(p=>p.join(',')).join(' ')}));
    const layerDefs=svgNode('defs');layerDefs.append(clip);layer.append(layerDefs);
    layer.append(svgNode('image',{href:'master-studio-room-cartoon-v3-thin-contours.png',width,height,'clip-path':`url(#extra-${category}-outline)`}));
    room.querySelector('.room-highlights').append(layer);
  }
  for(const object of objects) {
    const points=object.polygons.flat(),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;
    const clip=svgNode('clipPath',{id:`hit-${object.id}`,clipPathUnits:'objectBoundingBox'});
    for(const polygon of object.polygons)clip.append(svgNode('polygon',{points:polygon.map(([x,y])=>`${(x-left)/w},${(y-top)/h}`).join(' ')}));
    defs.append(clip);
    const button=document.createElement('button');
    button.type='button';button.className=`hotspot hotspot--${object.id}`;
    button.dataset.page='projects';button.dataset.category=object.category;button.dataset.highlight=object.category;
    button.setAttribute('aria-label',`Explore ${object.category==='music'?'Music':'Video'} through the ${object.name}`);
    button.style.cssText=`--target-x:${left/width*100}%;--target-y:${top/height*100}%;--target-width:${w/width*100}%;--target-height:${h/height*100}%;clip-path:url(#hit-${object.id})`;
    // Later than the desk target so the foreground light takes precedence.
    room.insertBefore(button,room.querySelector('.object-label'));
  }
}
