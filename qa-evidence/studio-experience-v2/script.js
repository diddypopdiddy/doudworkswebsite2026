import {mountVideoLibrary} from './video-library/library.js?v=20260930-polish-v1';
import './homepage-art.js?v=20260927';
import './homepage-whiteboard.js?v=20260927';
import './homepage-hotspots.js?v=20260926';
import {projectCategories, previews, artworks, tracks} from './content.js?v=20260930-polish-v1';
import {StudioPlayer} from './player.js?v=20260927-minimal-music';
import {renderInfo} from './about-contact.js?v=20260930-polish-v1';
const $=s=>document.querySelector(s);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shell=$('#subpage-shell'),content=$('#subpage-content'),panel=$('#subpage-panel'),room=$('#room-world'),viewport=$('.room-viewport');
const player=new StudioPlayer($('#studio-audio'),tracks);
const categories=Object.fromEntries(['art','music','video','teaching','ai','custom'].map(key=>[key,projectCategories[key]]));
const positions={music:[.31,.7],art:[.35,.26],teaching:[.68,.23],ai:[.82,.51],video:[.69,.77],custom:[.82,.51],about:[.5,.5],contact:[.5,.5]};
const captions={music:'The music corner',art:'At the art table',teaching:'From the classroom',ai:'At the workbench',video:'Behind the camera',custom:'Useful things, made to fit',about:'A little about me',contact:'Let’s compare notes'};
let active=null,projectId=null,artIndex=0,lastOpener=null,closeTimer=null,sound=false,audioContext;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function routeHash(category,id) {return '#'+category+(id?'/'+encodeURIComponent(id):'');}
function readRoute() {
  const [category,id]=location.hash.slice(1).split('/');
  if(category==='projects') return {category:'ai'};
  if(categories[category]||['about','contact'].includes(category)) {
    let decoded;try{decoded=id?decodeURIComponent(id):undefined;}catch{decoded=undefined;}
    return {category,id:decoded};
  }
  return null;
}
function writeRoute(category,id,replace=false) {
  const hash=routeHash(category,id);if(location.hash===hash)return;
  history[replace?'replaceState':'pushState']({studio:true},'',hash);
}
function tone() {
  if(!sound)return;
  try{audioContext ||= new AudioContext();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.frequency.value=330;g.gain.setValueAtTime(.012,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.08);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.09);}catch{}
}
function moveRoom(category) {
  const [x,y]=positions[category];const w=room.offsetWidth,h=room.offsetHeight;
  const mobile=innerWidth<=760;
  if(!mobile)viewport.scrollLeft=0;
  const baseLeft=room.offsetLeft-(mobile?0:w/2)-viewport.scrollLeft;const targetX=innerWidth*(mobile?.43:.17),targetY=innerHeight*(mobile?.22:.49);
  room.style.transformOrigin=`${x*100}% ${y*100}%`;
  room.style.setProperty('--pan-x',`${targetX-(baseLeft+x*w)}px`);
  room.style.setProperty('--pan-y',`${targetY-y*h}px`);
  room.classList.add('is-exploring');
}
function spaceNav() {
  return `<nav class="space-nav" aria-label="Explore another space">${Object.entries(categories).map(([key,value])=>`<button type="button" data-space="${key}" ${key===active?'aria-current="page"':''}>${esc(value.label)}</button>`).join('')}</nav>`;
}
function renderProjects() {
  const category=categories[active]; const project=category.projects.find(p=>p.id===projectId)||category.projects[0];
  projectId=project?.id||null;
  const title=active==='ai'?'AI projects':category.label;
  const localReview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('local')==='1';
  let detail='';
  if(project) {
    const image=previews[project.id];
    const action=project.action||(project.id==='interactive-video-textbook'?'Open textbook':project.id==='ai-road-test'?'Play the game':project.status.includes('PDF')?'Read the guide':'Explore project');
    const destination=project.href;
    const localEdition=localReview&&project.localHref;
    const overview=`<div class="workspace-overview"><p class="eyebrow">SK8MAPS</p><h3>A place for the<br>teaching day.</h3><div class="workspace-steps"><span>Plan</span><span>Teach</span><span>Revisit</span></div><p>Calendar · Lessons · Resources</p></div>`;
    detail=`<div class="project-selector" role="group" aria-label="${esc(category.label)} projects">${category.projects.map((p,i)=>`<button type="button" data-project="${p.id}" aria-pressed="${p.id===projectId}"><span>${String(i+1).padStart(2,'0')}</span>${esc(p.name)}</button>`).join('')}</div>
    <article class="project-feature" aria-labelledby="project-heading">
    <div class="project-preview">${project.overview?overview:image?`<img src="../../media/projects/${image}" alt="${esc(project.name)} preview" />`:`<div class="project-cover"><span>${esc(category.label)}</span><strong>${esc(project.name)}</strong><p>${esc(project.status)}</p></div>`}</div>
    <div class="project-description"><div><p class="eyebrow">${esc(project.status)}</p><h3 id="project-heading">${esc(project.name)}</h3><p class="lede">${esc(project.summary)}</p>${project.highlights?`<ul class="project-highlights">${project.highlights.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</div><div class="project-access">${destination?`<a class="primary-link" href="${esc(destination)}" target="_blank" rel="noopener noreferrer">${esc(action)} <span aria-hidden="true">↗</span></a>`:''}${project.accessNote?`<p class="project-access-note">${esc(project.accessNote)}</p>`:''}${localEdition?`<a class="published-edition" href="${esc(project.localHref)}" target="_blank" rel="noopener noreferrer">Local review ↗</a>${project.localNote?`<p class="project-access-note">${esc(project.localNote)}</p>`:''}`:''}</div></div></article>`;
  } else detail='<div class="project-cover empty-space"><span>Work in progress</span><strong>More to explore soon.</strong></div>';
  content.innerHTML=`<div class="projects-page"><p class="eyebrow">Vince Doud / ${esc(category.label)}</p><h2 id="subpage-title">${title}</h2>${detail}${spaceNav()}</div>`;
}
let videoLibrary=null;
function destroyVideo(){videoLibrary?.dispose();videoLibrary=null;}
let gallery=null,galleryGeneration=0;
function destroyGallery(){galleryGeneration++;gallery?.dispose();gallery=null;}
function renderArt(initial=-1) {
  const generation=++galleryGeneration;
  content.innerHTML='<div class="gallery-loading"><p id="subpage-title">Opening the gallery…</p></div>';
  import('./gallery-walk/gallery-compact-ui.js?v=20260930-polish-v1').then(({mountGallery})=>{
    if(active!=='art'||generation!==galleryGeneration)return;
    const restoreFocus=content.contains(document.activeElement);
    gallery=mountGallery(content,artworks,initial,index=>{artIndex=index;writeRoute('art',index<0?null:String(index+1),true);});
    if(restoreFocus){const heading=$('#subpage-title');heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }).catch(()=>{if(active==='art'&&generation===galleryGeneration)content.innerHTML='<div style="padding:40px"><h2 id="subpage-title">The gallery could not open.</h2><p>Please refresh to try again.</p></div>';});
}
function openSpace(category,{id,historyChange=true,opener}={}) {
  if(!categories[category]&&!['about','contact'].includes(category))return;
  clearTimeout(closeTimer); closeSpaceMenu(); shell.classList.remove('is-closing','art-expanded');
  const wasOpen=shell.open,changed=active!==category;
  if(!wasOpen)lastOpener=opener?.closest('#projects-menu')?$('[data-projects-toggle]'):opener?.closest('#mobile-menu')?$('.menu-button'):opener||document.activeElement;
  player.unmount(); destroyGallery(); destroyVideo(); active=category;projectId=id||categories[category]?.projects[0]?.id||null;
  if(category==='ai'&&['ai-production-framework','ai-permit-field-guide'].includes(id))projectId='ai-educator-playbook';
  if(category==='teaching'&&['agentic-continuity','lesson-planner-app'].includes(id))projectId='sk8maps';
  if(category==='art')artIndex=id?Math.max(0,(parseInt(id,10)||1)-1):-1;
  shell.dataset.space=category;document.body.classList.add('subpage-open');
  document.querySelectorAll('.space-explore [data-space]').forEach(button=>{if(button.dataset.space===category)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  $('#space-number').textContent=String(Object.keys(positions).indexOf(category)+1).padStart(2,'0');
  $('#space-caption').textContent=captions[category];
  delete room.dataset.highlight;moveRoom(category);
  if(category==='music') {player.mount(content);}
  else if(category==='art')renderArt(artIndex);
  else if(category==='video')videoLibrary=mountVideoLibrary(content,id,route=>writeRoute('video',route),()=>player.audio.pause());
  else if(['about','contact'].includes(category))renderInfo(category,content);
  else renderProjects();
  if(!wasOpen)shell.showModal();else if(changed&&!reduced())panel.animate([{opacity:.2,transform:'translateX(24px)'},{opacity:1,transform:'translateX(0)'}],{duration:380});
  panel.scrollTop=0;closeMenu();closeProjectsMenu();
  if(historyChange)writeRoute(category,category==='art'?(artIndex<0?null:String(artIndex+1)):category==='music'?null:projectId);
  const heading=$('#subpage-title');heading.tabIndex=-1;heading.focus({preventScroll:true});
  $('#live-region').textContent=`${categories[category]?.label||category} opened.`;
  player.updatePlayback();tone();
}
function closeSpace(updateHistory=true) {
  if(!shell.open||shell.classList.contains('is-closing'))return;
  closeSpaceMenu();
  if(updateHistory)history.pushState(null,'',location.pathname+location.search);
  shell.classList.remove('art-expanded');shell.classList.add('is-closing');room.classList.remove('is-exploring');
  player.unmount();destroyGallery();destroyVideo();active=null;
  clearTimeout(closeTimer);
  closeTimer=setTimeout(()=> {
    shell.close();shell.classList.remove('is-closing');document.body.classList.remove('subpage-open');
    content.replaceChildren();player.updatePlayback();
    $('#live-region').textContent='Returned to the studio.';
    if(lastOpener?.isConnected)lastOpener.focus({preventScroll:true});else $('[data-home]').focus();
  },reduced()?0:480);
}
function closeSpaceMenu(restoreFocus=false) {const menu=$('.space-explore');if(!menu.open)return;menu.open=false;if(restoreFocus)menu.querySelector('summary').focus({preventScroll:true});}
function closeMenu(restoreFocus=false) {$('#mobile-menu').hidden=true;$('.menu-button').setAttribute('aria-expanded','false');if(restoreFocus)$('.menu-button').focus({preventScroll:true});}
function closeProjectsMenu({restoreFocus=false}={}) {
  const menu=$('#projects-menu'),toggle=$('[data-projects-toggle]');
  if(menu.hidden)return;
  menu.hidden=true;toggle.setAttribute('aria-expanded','false');
  if(restoreFocus)toggle.focus({preventScroll:true});
}
function positionObjectLabel(hotspot) {
  const label=$(`[data-object-label="${hotspot.dataset.highlight}"]`);
  if(!label||active)return;
  const objectRect=hotspot.getBoundingClientRect(),labelRect=label.getBoundingClientRect(),roomRect=room.getBoundingClientRect();
  const headerBottom=$('.site-header').getBoundingClientRect().bottom;
  const clamp=(value,min,max)=>Math.min(Math.max(value,min),max);
  const x=clamp(objectRect.left+objectRect.width/2-labelRect.width/2,12,innerWidth-labelRect.width-12);
  const y=clamp(objectRect.bottom+10,headerBottom+10,innerHeight-labelRect.height-80);
  const scaleX=roomRect.width/room.offsetWidth,scaleY=roomRect.height/room.offsetHeight;
  label.style.left=`${(x-roomRect.left)/scaleX}px`;
  label.style.top=`${(y-roomRect.top)/scaleY}px`;
  label.style.right='auto';
}
let highlightedHotspot=null;
function positionActiveObjectLabel() {
  if(room.dataset.highlight&&highlightedHotspot)positionObjectLabel(highlightedHotspot);
}
document.addEventListener('click',e=> {
  const projectsToggle=e.target.closest('[data-projects-toggle]');
  if(projectsToggle) {
    const menu=$('#projects-menu'),open=menu.hidden;
    menu.hidden=!open;projectsToggle.setAttribute('aria-expanded',String(open));
    return;
  }
  if(!e.target.closest('#projects-menu'))closeProjectsMenu();
  if(!e.target.closest('#mobile-menu,.menu-button'))closeMenu();
  if(!e.target.closest('.space-explore'))closeSpaceMenu();
  const opener=e.target.closest('[data-page]');if(opener){openSpace(opener.dataset.page==='projects'?opener.dataset.category||'ai':opener.dataset.page,{opener});return;}
  const space=e.target.closest('button[data-space]');if(space){if(space.dataset.space===active){closeSpaceMenu();return;}openSpace(space.dataset.space);return;}
  const project=e.target.closest('[data-project]');if(project){projectId=project.dataset.project;renderProjects();writeRoute(active,projectId);content.querySelector(`[data-project="${projectId}"]`).focus({preventScroll:true});return;}
  if(e.target.closest('[data-close-subpage]'))return closeSpace();
  if(e.target.closest('[data-mini-open]'))return openSpace('music',{opener:e.target.closest('button')});
  if(e.target.closest('[data-mini-toggle]'))return player.control('toggle');
 });
// Consume gallery Escape before the native dialog close watcher. Repeated
// cancel events can become non-cancelable in Chromium and bypass nested panels.
shell.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  e.preventDefault();e.stopPropagation();
  if($('.space-explore').open){closeSpaceMenu(true);return;}
  if(!(active==='art'?gallery?.escape():active==='video'?videoLibrary?.escape():false))closeSpace();
});
shell.addEventListener('cancel',e=>{e.preventDefault();if(active==='art'&&gallery?.escape())return;if(active==='video'&&videoLibrary?.escape())return;closeSpace();});
$('.menu-button').addEventListener('click',()=>{const open=$('#mobile-menu').hidden;$('#mobile-menu').hidden=!open;$('.menu-button').setAttribute('aria-expanded',String(open));});
document.querySelectorAll('[data-home]').forEach(button=>button.addEventListener('click',()=>{closeMenu();closeProjectsMenu();if(shell.open)closeSpace();else $('#studio-scene').focus();}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#projects-menu').hidden) {e.preventDefault();closeProjectsMenu({restoreFocus:true});}
  else if(e.key==='Escape'&&!$('#mobile-menu').hidden){e.preventDefault();closeMenu(true);}
});
$('.sound-toggle').addEventListener('click',()=>{sound=!sound;$('.sound-toggle').setAttribute('aria-pressed',String(sound));$('.sound-toggle span').textContent=sound?'Sound on':'Sound off';tone();});
for(const h of document.querySelectorAll('.hotspot[data-highlight]')) {
  ['pointerenter','focus'].forEach(type=>h.addEventListener(type,()=>{if(!active){highlightedHotspot=h;room.dataset.highlight=h.dataset.highlight;requestAnimationFrame(()=>positionObjectLabel(h));}}));
  ['pointerleave','blur'].forEach(type=>h.addEventListener(type,()=>{if(highlightedHotspot===h){highlightedHotspot=null;delete room.dataset.highlight;}}));
}
function restoreRoute() {
  const route=readRoute();
  // A hash history change can emit both popstate and hashchange. Keep the
  // existing YouTube iframe when the first event already restored this route.
  if(route?.category===active&&!shell.classList.contains('is-closing')){
    if(active==='video'&&videoLibrary?.getRoute()===(route.id||null))return;
    if(active==='art'){artIndex=route.id?Math.max(0,(parseInt(route.id,10)||1)-1):-1;gallery?.select(artIndex);return;}
    if(active==='music'||['about','contact'].includes(active)||projectId===route.id)return;
  }
  if(route)openSpace(route.category,{id:route.id,historyChange:false});else closeSpace(false);
}
window.addEventListener('popstate',restoreRoute);
// Hash-only navigation entered by hand should behave like a normal deep link.
window.addEventListener('hashchange',()=>{const route=readRoute();if(route?.category===active&&active==='art'){artIndex=route.id?Math.max(0,(parseInt(route.id,10)||1)-1):-1;gallery?.select(artIndex);}else if(route?.category!==active||active==='video')restoreRoute();});
function resize() {if(active)moveRoom(active);else if(innerWidth<=760){closeProjectsMenu();viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)*.53;}positionActiveObjectLabel();}
let resizeFrame;
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>requestAnimationFrame(resize));});window.addEventListener('load',()=>{resize();restoreRoute();},{once:true});
viewport.addEventListener('scroll',positionActiveObjectLabel,{passive:true});
