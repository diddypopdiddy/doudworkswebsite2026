import {unavailableEmbedIds} from './embed-availability.js?v=queue-sync-v1';
import {nextQueueVideo,playbackEvents,videoError} from './playback.js?v=20260930-polish-v1';
import {videos} from './catalog.js?v=20260927-dvd-remote-v2';
import {paintMenu,menuBackgroundReady} from './menu-painter.js?v=basement-4x3-v2';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artistKey=s=>s.replace(/^The /i,'');
export const artists=[...new Set(videos.filter(v=>v.collection==='covers').map(v=>v.artist))].sort((a,b)=>artistKey(a).localeCompare(artistKey(b)));
const chronologicalVideos=[...videos].sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
export const playAllVideos=chronologicalVideos.filter(video=>!unavailableEmbedIds.has(video.id));
let apiPromise;
function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);previous?.();resolve(window.YT)};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);reject(new Error('Player API unavailable'))};
  const timeout=setTimeout(()=>reject(new Error('Player API timed out')),15000);document.head.append(script);
 });
 return apiPromise.catch(error=>{apiPromise=null;throw error;});
}
export function mountVideoLibrary(host,initial,onRoute,onWatch){
 const controller=new AbortController(),{signal}=controller;let disposed=false,view='home',artist='',chosen=null,page=0,query='',highlight='',hits=[],queue=false,ytPlayer=null,playerLoadTimer=null,playbackGeneration=0,playbackRequested=false,queueNotice='';const failedVideos=new Set();
 const find=id=>videos.find(v=>v.id===id);
 function rows(){const list=view==='artist'?videos.filter(v=>v.collection==='covers'&&v.artist===artist):view==='woodbury'?videos.filter(v=>v.collection==='woodbury'):view==='archive'?videos.filter(v=>v.collection==='archive'):videos;const q=query.trim().toLocaleLowerCase();return list.filter(v=>!q||[v.title,v.song,v.artist,v.release].some(s=>s?.toLocaleLowerCase().includes(q))).sort((a,b)=>a.song.localeCompare(b.song)||a.date.localeCompare(b.date));}
 function restore(){const [kind,...parts]=(initial||'').split('~'),value=parts.join('~');if(['watch','detail','playall'].includes(kind)&&find(value)){chosen=find(value);artist=chosen.artist;view=kind==='detail'?'detail':'watch';queue=kind==='playall';}else if(kind==='artist'&&artists.includes(value)){view='artist';artist=value;}else if(['chapters','covers','woodbury','archive','all'].includes(kind))view=kind==='all'?'chapters':kind;else if(kind==='playall'){view='watch';queue=true;chosen=playAllVideos[0]}}
 restore();
 if(queue&&unavailableEmbedIds.has(chosen?.id))chosen=nextQueueVideo(chronologicalVideos,chosen.id,unavailableEmbedIds)||playAllVideos[0];
 host.innerHTML=`<section class="video-room"><h2 id="subpage-title" class="sr-only">Video library</h2><div class="video-console"><div class="tv-set"><img class="tv-model" src="video-library/tv-4x3.png" alt="" width="1400" height="1200"><div class="tv-display"></div></div><nav class="dvd-remote" aria-label="DVD remote control"><div class="remote-topline">V I N C E<i aria-hidden="true"></i></div><p class="remote-lcd" aria-live="polite">TITLE MENU</p><div class="remote-menu-keys"><button data-dvd="home" aria-label="Remote title menu">MENU</button><button data-dvd="back" aria-label="Back one DVD menu">BACK</button></div><div class="remote-dpad" role="group" aria-label="DVD directional pad"><button data-remote="up" aria-label="Remote up">▲</button><button data-remote="left" aria-label="Remote left">◀</button><button data-remote="ok" aria-label="Remote select">OK</button><button data-remote="right" aria-label="Remote right">▶</button><button data-remote="down" aria-label="Remote down">▼</button></div><div class="remote-bottom-keys"><button data-dvd="chapters" aria-label="Remote chapters">CHAPTERS</button><button data-dvd="expand" aria-label="Full screen">⛶</button></div><div class="remote-grip" aria-hidden="true"><i></i><i></i><i></i></div><span class="remote-model" aria-hidden="true">DVD / 04</span></nav></div><div class="video-caption" aria-live="polite"></div><p class="dvd-announcement sr-only" aria-live="polite"></p></section>`;
 const screen=host.querySelector('.tv-display'),caption=host.querySelector('.video-caption'),announcement=host.querySelector('.dvd-announcement');
 const title=()=>({home:'TITLE MENU',chapters:'CHAPTERS',covers:'COVERS',artist,woodbury:'WOODBURY',archive:'ARCHIVE',detail:'SONG INFORMATION',watch:queue?'PLAY ALL':'PLAYBACK'})[view];
 const route=()=>view==='home'?null:view==='artist'?`artist~${artist}`:['watch','detail'].includes(view)?`${queue&&view==='watch'?'playall':view}~${chosen.id}`:view;
 function stopPlayer(){clearTimeout(playerLoadTimer);playbackGeneration++;try{ytPlayer?.destroy()}catch{}ytPlayer=null;}
 function change(next,options={}){stopPlayer();view=next;page=0;query='';highlight='';if(options.artist)artist=options.artist;if(options.video)chosen=options.video;queue=!!options.queue;playbackRequested=!!options.play;queueNotice=options.notice||'';onRoute(route());render(true);}
 function back(){if(view==='home')return false;if(view==='watch')change(queue?'home':'detail',{video:chosen});else if(view==='detail')change(chosen.collection==='covers'?'artist':chosen.collection==='woodbury'?'woodbury':'archive',{artist:chosen.artist});else if(view==='artist')change('covers');else if(['covers','woodbury','archive'].includes(view))change('chapters');else change('home');return true;}
 function model(){let items=[],search=false,pages=0,total=0;const item=(key,label,action,extra={})=>({key,label,action,...extra});
  if(view==='home')items=[item('playall','PLAY ALL','playall'),item('chapters','CHAPTERS','chapters')];
  else if(view==='chapters')items=[item('covers','COVERS','covers'),item('woodbury','WOODBURY','woodbury'),item('archive','ARCHIVE','archive')];
  else if(view==='covers'){search=true;const list=artists.filter(a=>a.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));total=list.length;pages=Math.ceil(total/6);page=Math.max(0,Math.min(page,pages-1));items=list.slice(page*6,page*6+6).map(a=>item(a,a,'artist',{artist:a}));}
  else if(['artist','woodbury','archive'].includes(view)){search=true;const list=rows();total=list.length;pages=Math.ceil(total/5);page=Math.max(0,Math.min(page,pages-1));items=list.slice(page*5,page*5+5).map(v=>item(v.id,v.song,'detail',{id:v.id,sub:`${v.release||v.performance} · ${v.date.slice(0,4)}`}));}
  else if(view==='detail')items=[unavailableEmbedIds.has(chosen.id)?item('external','WATCH ON YOUTUBE','external',{id:chosen.id}):item('watch','PLAY','watch',{id:chosen.id})];
  return {view,title:title(),items,search,pages,page,total,detail:view==='detail'?chosen:null,highlight};
 }
 function draw(){if(disposed||view==='watch')return;const m=model(),canvas=screen.querySelector('canvas');if(!canvas)return;if(!highlight)highlight=m.items[0]?.key||'main';m.highlight=highlight;hits=paintMenu(canvas,m);screen.querySelectorAll('[data-key]').forEach(b=>{const active=b.dataset.key===highlight;b.classList.toggle('dvd-is-focused',active);b.setAttribute('aria-current',String(active))});}
 function highlightKey(key,focus=false){highlight=key;draw();if(focus)screen.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus({preventScroll:true});const hit=hits.find(h=>h.key===key);if(hit)announcement.textContent=hit.label;}
 function renderMenu(focus){const m=model();if(!m.items.some(i=>i.key===highlight)&&!['next','previous','main'].includes(highlight))highlight=m.items[0]?.key||'main';m.highlight=highlight;
  screen.innerHTML=`<canvas class="dvd-canvas" width="720" height="540" aria-hidden="true"></canvas><div class="dvd-scanlines" aria-hidden="true"></div><div class="dvd-menu-controls" role="group" aria-label="${esc(title())}"></div>${m.search?`<label class="dvd-search"><span class="sr-only">${view==='covers'?'Find an artist':'Find a song or album'}</span><input type="search" value="${esc(query)}" placeholder="${view==='covers'?'Find an artist':'Find a song or album'}" aria-label="${view==='covers'?'Find an artist':'Find a song or album'}" autocomplete="off"></label>`:''}${m.search&&!m.total?'<p class="dvd-no-results">No matches found.</p>':''}${m.detail?`<p class="sr-only">${esc(m.detail.song)}, ${esc(m.detail.artist)}. ${esc(m.detail.release||'Release not confirmed')}. ${esc(m.detail.performance)}. Uploaded ${m.detail.date.slice(0,4)}.</p>`:''}`;
  hits=paintMenu(screen.querySelector('canvas'),m);const controls=screen.querySelector('.dvd-menu-controls');
  controls.innerHTML=hits.map(h=>`<button type="button" data-key="${esc(h.key)}" data-dvd="${h.action}" ${h.artist?`data-artist="${esc(h.artist)}"`:''} ${h.id?`data-id="${h.id}"`:''} aria-label="${esc(h.label+(h.sub?' — '+h.sub:''))}" aria-current="${h.key===highlight}" class="${h.key===highlight?'dvd-is-focused':''}" style="left:${h.x/7.2}%;top:${h.y/5.4}%;width:${h.w/7.2}%;height:${h.h/5.4}%">${esc(h.label)}</button>`).join('');
  if(focus)screen.querySelector(`[data-key="${CSS.escape(highlight)}"]`)?.focus({preventScroll:true});
 }
 function updateCaption(v=chosen){const index=playAllVideos.findIndex(t=>t.id===v.id);caption.innerHTML=`<div><h3>${queue?`Play all · ${index+1} / ${playAllVideos.length} — `:''}${esc(v.song)}</h3><p>${esc(v.artist)}${v.release?' · '+esc(v.release):''}</p><p>${esc(v.channel)}</p><span class="playback-status" role="status">${esc(queueNotice)}</span></div><div class="playback-links">${queue?'<div class="queue-controls"><button data-dvd="queue-previous" aria-label="Previous video">◀ Previous</button><button data-dvd="queue-next" aria-label="Next video">Next ▶</button></div>':''}<button class="player-retry" data-dvd="retry" hidden>Retry video</button><a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div>`;}
 function renderWatch(){
  onWatch();const playing=chosen;
  const args=new URLSearchParams({playsinline:'1',rel:'0',autoplay:playbackRequested?'1':'0',controls:'1',enablejsapi:'1',origin:location.origin});
  screen.innerHTML=`<iframe title="${esc(queue?'Play all — '+chosen.title:chosen.title)}" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;screen.querySelector('iframe').src=`https://www.youtube.com/embed/${chosen.id}?${args}`;updateCaption();caption.querySelector('.playback-status').textContent=queueNotice||'Opening video… You can also watch on YouTube.';
  // Keep native playback independent, but observe readiness for every video so
  // an embed that never loads cannot silently leave a black TV screen.
  const showLoadFailure=()=>{if(disposed||generation!==playbackGeneration)return;caption.querySelector('.playback-status').textContent='Video not starting? Retry or watch on YouTube.';caption.querySelector('.player-retry').hidden=false;};
  const generation=++playbackGeneration,iframe=screen.querySelector('iframe');
  playerLoadTimer=setTimeout(showLoadFailure,15000);
  const current=()=>!disposed&&generation===playbackGeneration&&iframe.isConnected;
  const status=message=>{caption.querySelector('.playback-status').textContent=message;};
  const advance=(notice='')=>{
   const next=nextQueueVideo(playAllVideos,playing.id,failedVideos);
   if(next)change('watch',{video:next,queue:true,play:true,notice});
   else status(notice?`${notice} No more videos remain in Play All.`:'Play All finished.');
  };
  youtubeAPI().then(YT=>{
   if(!current())return;
   ytPlayer=new YT.Player(iframe,{events:playbackEvents({
    isCurrent:current,
    onReady:()=>{if(!playbackRequested){clearTimeout(playerLoadTimer);status('Play in the TV, or watch on YouTube.');}},
    onPlaying:()=>{clearTimeout(playerLoadTimer);status(queueNotice);caption.querySelector('.player-retry').hidden=true;},
    onEnded:()=>{if(queue)advance();},
    onBlocked:()=>{clearTimeout(playerLoadTimer);status('Press Play in the TV, or watch on YouTube.');},
    onError:code=>{
     clearTimeout(playerLoadTimer);const failure=videoError(code);
     caption.querySelector('.player-retry').hidden=false;
     if(queue&&failure.skip){failedVideos.add(playing.id);advance(`Skipped “${playing.song}”: ${failure.message}`);}
     else status(failure.message);
    }
   })});
  }).catch(()=>{if(current()&&queue)status('Automatic advance is unavailable. Use Next to continue.');});

 }
 function render(focus=false){if(disposed)return;screen.dataset.view=view;screen.classList.toggle('is-watching',view==='watch');caption.replaceChildren();host.querySelector('#subpage-title').textContent='Video library — '+title();host.querySelector('.remote-lcd').textContent=title()==='SONG INFORMATION'?'TRACK SELECT':title();host.querySelectorAll('[data-remote]').forEach(b=>b.disabled=view==='watch');host.querySelector('[data-dvd=back]').disabled=view==='home';if(view==='watch')renderWatch();else renderMenu(focus);}
 function move(direction,keyboard=false){if(view==='watch'||!hits.length)return;let i=hits.findIndex(h=>h.key===highlight);i=(i+(['down','right'].includes(direction)?1:-1)+hits.length)%hits.length;highlightKey(hits[i].key,keyboard);}
 host.addEventListener('pointerover',e=>{const b=e.target.closest('.dvd-menu-controls button');if(b)highlightKey(b.dataset.key);},{signal});
 host.addEventListener('focusin',e=>{if(e.target.matches('.dvd-menu-controls button'))highlightKey(e.target.dataset.key);},{signal});
 host.addEventListener('click',e=>{const remote=e.target.closest('[data-remote]');if(remote){if(remote.dataset.remote==='ok')screen.querySelector(`[data-key="${CSS.escape(highlight)}"]`)?.click();else move(remote.dataset.remote);return;}
  const b=e.target.closest('[data-dvd]');if(!b)return;const a=b.dataset.dvd;
  if(a==='back')back();else if(a==='expand'){if(document.fullscreenElement)document.exitFullscreen?.();else host.querySelector('.video-room').requestFullscreen?.().catch(()=>{});}
  else if(a==='previous'||a==='next'){page+=a==='next'?1:-1;highlight='';renderMenu(true)}
  else if(a==='artist')change('artist',{artist:b.dataset.artist});else if(a==='detail')change('detail',{video:find(b.dataset.id)});
  else if(a==='external')window.open(chosen.sourceUrl,'_blank','noopener,noreferrer');else if(a==='retry')change('watch',{video:chosen,queue,play:true});else if(a==='watch')change('watch',{video:chosen,play:true});else if(a==='playall')change('watch',{video:playAllVideos[0],queue:true,play:true});
  else if(a.startsWith('queue-')){const delta=a==='queue-next'?1:-1,index=playAllVideos.findIndex(v=>v.id===chosen.id),next=(index+delta+playAllVideos.length)%playAllVideos.length;change('watch',{video:playAllVideos[next],queue:true,play:true})}
  else if(['home','chapters','covers','woodbury','archive'].includes(a))change(a);
 },{signal});
 host.addEventListener('input',e=>{if(e.target.type!=='search')return;const value=e.target.value;query=value;page=0;highlight='';renderMenu(false);screen.querySelector('input').focus({preventScroll:true});},{signal});
 host.addEventListener('keydown',e=>{if(view==='watch'||e.target.matches('input'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key.slice(5).toLowerCase(),true)}else if(['Home','End'].includes(e.key)){e.preventDefault();highlightKey((e.key==='Home'?hits[0]:hits.at(-1))?.key,true)}},{signal});
 menuBackgroundReady.then(()=>{if(!disposed)draw()});render();
 return {getRoute:route,escape:back,dispose(){disposed=true;controller.abort();stopPlayer();screen.replaceChildren();}};
}
