import {playbackQueue, adjacentTrack} from './library.mjs';
import {angleDelta, wheelStep, clampIndex, formatTime} from './wheel.mjs';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class StudioPlayer {
  constructor(audio, tracks) {
    this.audio = audio; this.tracks = [...tracks]; this.queue = playbackQueue(this.tracks); this.index = 0; this.cursor = 0;
    this.view = 'home'; this.collection = null; this.playingCollection = null; this.host = null; this.error = '';
    this.remainder = 0; this.angle = null; this.dragging = false; this.activePointer = null;
    this.hoverMode = true; this.didDrag = false; this.playRequest = 0;
    this.audio.volume = .55;
    ['play','pause','loadedmetadata','durationchange','timeupdate','ended'].forEach(type => audio.addEventListener(type, () => this.updatePlayback()));
    audio.addEventListener('ended', () => {const next=adjacentTrack(this.queue,this.index,1);if(next!==null)this.play(next);});
    audio.addEventListener('error', () => { this.error = 'This recording could not load. Try another track.'; this.renderScreen(); });
  }
  mount(host) {
    this.unmount(); this.host = host;
    host.innerHTML = `<div class="music-layout">
      <h2 id="subpage-title">Music I’ve made</h2>
      <div class="player-stage"><div class="ipod" aria-label="Interactive click-wheel music player">
        <span class="hold-switch" aria-hidden="true"></span><div class="ipod-screen" id="ipod-screen"></div>
        <div class="click-wheel" tabindex="0" role="group" aria-label="Music scroll wheel" aria-describedby="wheel-instructions">
          <i class="wheel-indicator" aria-hidden="true"></i>
          <button class="wheel-menu" data-control="menu" aria-label="Player menu — back">MENU</button>
          <button class="wheel-prev" data-control="previous" aria-label="Previous track">◀◀</button>
          <button class="wheel-next" data-control="next" aria-label="Next track">▶▶</button>
          <button class="wheel-play" data-control="toggle" aria-label="Play or pause">▶Ⅱ</button>
          <button class="wheel-center" data-control="select" aria-label="Select highlighted item"></button>
        </div>
      </div><p id="wheel-instructions" class="sr-only">Circle or use the mouse wheel to scroll. Center or Enter selects. Arrow keys work too.</p>
      </div></div>`;
    this.controller = new AbortController(); const options = {signal:this.controller.signal};
    host.addEventListener('click', e => {
      if (this.didDrag) { this.didDrag = false; return; }
      const control = e.target.closest('[data-control]');
      if (control) this.control(control.dataset.control);
      const row = e.target.closest('[data-menu-index]');
      if (row) { this.cursor = Number(row.dataset.menuIndex); this.select(); }
    }, options);
    host.addEventListener('input',e=> {
      if(e.target.matches('[data-seek]') && Number.isFinite(this.audio.duration)) this.audio.currentTime = this.audio.duration * Number(e.target.value)/100;
      if(e.target.matches('[data-volume]')) this.audio.volume = Number(e.target.value)/100;
    },options);
    const wheel = host.querySelector('.click-wheel');
    wheel.addEventListener('pointerdown', e=> {
      if(e.button !== 0) return;
      this.pressedControl = e.target.closest('[data-control]')?.dataset.control;
      this.dragging = true; this.activePointer = e.pointerId; this.didDrag = false; this.travel = 0;
      this.angle = null; this.remainder = 0;
      wheel.setPointerCapture(e.pointerId); wheel.focus({preventScroll:true}); this.move(e);
    },options);
    wheel.addEventListener('pointermove', e=> this.move(e),options);
    wheel.addEventListener('pointerup', e=> {
      if(this.activePointer!==e.pointerId) return;
      this.dragging = false; this.activePointer = null; this.angle = null; this.remainder = 0;
      if(wheel.hasPointerCapture(e.pointerId)) wheel.releasePointerCapture(e.pointerId);
      if(!this.didDrag && this.pressedControl) {this.control(this.pressedControl);this.didDrag=true;}
      this.pressedControl=null;
      if(this.didDrag) setTimeout(()=> {this.didDrag=false;},0);
    },options);
    ['pointercancel','lostpointercapture'].forEach(type=>wheel.addEventListener(type,()=>this.resetGesture(),options));
    wheel.addEventListener('pointerleave',()=> {if(!this.dragging) this.resetGesture();},options);
    wheel.addEventListener('wheel',e=> {
      e.preventDefault(); this.scrollPixels = (this.scrollPixels||0)+e.deltaY*(e.deltaMode===1?16:1);
      if(Math.abs(this.scrollPixels)>=28) {this.scroll(Math.sign(this.scrollPixels));this.scrollPixels=0;}
    },{...options,passive:false});
    wheel.addEventListener('keydown',e=> {
      if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Enter',' ','Backspace'].includes(e.key)) {
        // Native button activation owns Enter and Space when a wheel button has focus.
        if(e.target.tagName==='BUTTON' && ['Enter',' '].includes(e.key)) return;
        e.preventDefault();
        if(['ArrowDown','ArrowRight'].includes(e.key)) this.scroll(1);
        else if(['ArrowUp','ArrowLeft'].includes(e.key)) this.scroll(-1);
        else if(e.key==='Enter') this.select(); else if(e.key===' ') this.control('toggle'); else this.control('menu');
      }
    },options);
    this.renderScreen();
  }
  unmount() { this.controller?.abort(); this.host=null; this.resetGesture(); }
  resetGesture() {this.dragging=false;this.activePointer=null;this.angle=null;this.remainder=0;}
  move(e) {
    if(!this.host || (!this.dragging && (e.pointerType!=='mouse' || !this.hoverMode))) return;
    if(this.dragging && e.pointerId!==this.activePointer) return;
    const wheel=this.host.querySelector('.click-wheel'); const b=wheel.getBoundingClientRect();
    const x=e.clientX-b.left-b.width/2,y=e.clientY-b.top-b.height/2,r=Math.hypot(x,y)/(b.width/2);
    if(r<.39 || r>1.16) {this.angle=null;return;}
    const angle=Math.atan2(y,x);
    wheel.style.setProperty('--wheel-angle',`${angle+Math.PI/2}rad`);
    if(this.angle!==null) {
      const delta=angleDelta(this.angle,angle);
      this.travel=(this.travel||0)+Math.abs(delta);
      if(this.dragging && this.travel>.12) this.didDrag=true;
      const next=wheelStep(this.remainder,delta); this.remainder=next.remainder;
      if(next.steps) this.scroll(next.steps);
    }
    this.angle=angle;
  }
  entries() {
    if(this.view==='home') return [{label:'Albums',action:'collections'},{label:'All songs',action:'songs'},{label:'Now playing',action:'now'}];
    if(this.view==='collections') return [...new Set(this.tracks.map(t=>t.collection))].map(label=>({label,action:'collection',cover:this.tracks.find(t=>t.collection===label)?.cover}));
    return this.tracks.map((t,index)=>({label:t.title,index})).filter(t=>!this.collection||this.tracks[t.index].collection===this.collection);
  }
  scroll(step) {
    if(this.view==='now') {this.view='songs';this.cursor=Math.max(0,this.entries().findIndex(e=>e.index===this.index));}
    this.cursor=clampIndex(this.cursor+step,this.entries().length); this.renderScreen();
  }
  select() {
    if(this.view==='now') {this.control('toggle');return;}
    const entry=this.entries()[this.cursor]; if(!entry) return;
    if(entry.index!==undefined) {this.queue=playbackQueue(this.tracks,this.collection);this.playingCollection=this.collection;this.play(entry.index);return;}
    if(entry.action==='collection') {this.collection=entry.label;this.view='songs';}
    else {this.view=entry.action;this.collection=entry.action==='now'?this.playingCollection:null;}
    this.cursor=0;this.renderScreen();
  }
  control(action) {
    if(action==='select') return this.select();
    if(action==='menu') {
      if(this.view==='now') {this.view='songs';this.cursor=Math.max(0,this.entries().findIndex(e=>e.index===this.index));}
      else {this.view=this.view==='songs'&&this.collection?'collections':'home';this.collection=null;this.cursor=0;}
      this.renderScreen();return;
    }
    if(action==='toggle') {
      if(!this.audio.paused) this.audio.pause(); else this.play(this.index);
    }
    if(action==='next') {const next=adjacentTrack(this.queue,this.index,1,true);if(next!==null)this.play(next);}
    if(action==='previous') {
      if(this.audio.currentTime>3) this.audio.currentTime=0;
      else {const previous=adjacentTrack(this.queue,this.index,-1,true);if(previous!==null)this.play(previous);}
    }
  }
  async play(index) {
    const request=++this.playRequest;this.error='';this.index=index;
    const track=this.tracks[index]; if(!track) return;
    if(this.loadedSrc!==track.src) {this.audio.src=track.src;this.loadedSrc=track.src;}
    this.view='now';this.collection=this.playingCollection;this.renderScreen();
    try {await this.audio.play();} catch(error) {
      if(request!==this.playRequest || error.name==='AbortError') return;
      this.error='Playback did not start. Press play to retry, or choose another file.';this.renderScreen();
    }
    this.updatePlayback();
  }
  renderScreen() {
    if(!this.host) return;
    const screen=this.host.querySelector('.ipod-screen');const track=this.tracks[this.index];
    const title=this.view==='home'?'Diddy Pop Diddy':this.view==='now'?'Now playing':this.view==='collections'?'Albums':this.collection||'Songs';
    const focus=document.activeElement; const focusIndex=focus?.dataset?.menuIndex;
    screen.innerHTML=`<div class="screen-bar"><span>${esc(title)}</span><span class="screen-play-state" aria-label="Playback status">${this.audio.paused?'Ⅱ':'▶'}</span><span class="battery" aria-hidden="true"></span></div>`+
    (this.view==='now'?`<div class="now-playing"><div class="album-art${track.cover?' album-art--cover':''}" style="--album-color:${track.color||'#3157c8'}">${track.cover?`<img src="${esc(track.cover)}" alt="${esc(track.collection)} album cover" />`:`<span aria-hidden="true">${esc(track.collection.split(/\s+/).map(w=>w[0]).join('').slice(0,4))}<br>${String(track.trackNumber||this.index+1).padStart(2,'0')}</span>`}</div><div class="track-info"><strong>${esc(track.title)}</strong><span>${esc(track.collection)}</span><small>${track.src.startsWith('blob:')?'Local recording':`Track ${String(track.trackNumber).padStart(2,'0')}`}</small></div></div><label class="seek-label">Track position<input data-seek aria-label="Track position" type="range" min="0" max="100" step=".1" value="0" /></label><div class="track-times"><span data-elapsed>0:00</span><span data-duration>0:00</span></div><label class="volume-label">Volume<input data-volume aria-label="Volume" type="range" min="0" max="100" value="${this.audio.volume*100}" /></label>`:
    `<div class="screen-menu" role="group" aria-label="${esc(title)}">${this.entries().map((entry,i)=>`<button type="button" title="${esc(entry.label)}" data-menu-index="${i}" ${i===this.cursor?'aria-current="true"':''}><span class="menu-entry">${entry.cover?`<img class="menu-cover" src="${esc(entry.cover)}" alt="" />`:""}<span>${esc(entry.label)}</span></span><span aria-hidden="true">›</span></button>`).join('')}</div><div class="screen-footer">${this.view==='collections'?`${this.entries().length} albums`:this.view==='songs'?`${this.entries().length} songs`:`${new Set(this.tracks.map(t=>t.collection)).size} albums · ${this.tracks.length} songs`}</div>`)+`<p class="player-error" role="status">${esc(this.error)}</p>`;
    if(focusIndex!==undefined) screen.querySelector(`[data-menu-index="${focusIndex}"]`)?.focus({preventScroll:true});
    const current=screen.querySelector('[aria-current]');
    if(current) {const menu=screen.querySelector('.screen-menu');const top=current.offsetTop-menu.offsetTop;
      if(top<menu.scrollTop)menu.scrollTop=top;
      else if(top+current.offsetHeight>menu.scrollTop+menu.clientHeight)menu.scrollTop=top+current.offsetHeight-menu.clientHeight;}
    this.updatePlayback();
  }
  updatePlayback() {
    const duration=this.audio.duration, elapsed=this.audio.currentTime;
    if(this.host) {
      const screen=this.host.querySelector('.ipod-screen');
      const progress=screen.querySelector('[data-seek]'); if(progress && document.activeElement!==progress) progress.value=Number.isFinite(duration)&&duration>0?elapsed/duration*100:0;
      const a=screen.querySelector('[data-elapsed]'),b=screen.querySelector('[data-duration]');
      if(a) a.textContent=formatTime(elapsed);if(b)b.textContent=formatTime(duration);
      const state=screen.querySelector('.screen-play-state');if(state) state.textContent=this.audio.paused?'Ⅱ':'▶';
      this.host.querySelector('.ipod').classList.toggle('is-playing',!this.audio.paused);
    }
    document.body.classList.toggle('has-audio',!!this.loadedSrc);
    document.querySelectorAll('[data-mini]').forEach(el=> {
      const inDialog=!!el.closest('dialog');
      el.hidden=!this.loadedSrc || !!this.host || inDialog!==document.querySelector('#subpage-shell').open;
      if(el.hidden)return;
      if(!el.querySelector('[data-mini-toggle]')) el.innerHTML='<button type="button" data-mini-open aria-label="Open music player"><span>Now playing</span><strong></strong></button><button type="button" data-mini-toggle></button>';
      el.querySelector('strong').textContent=this.tracks[this.index].title;
      el.querySelector('[data-mini-toggle]').textContent=this.audio.paused?'▶':'Ⅱ';
      el.querySelector('[data-mini-toggle]').setAttribute('aria-label',this.audio.paused?'Resume music':'Pause music');
    });
  }
}
