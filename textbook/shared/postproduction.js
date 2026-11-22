/* Offline editing and graphics studies for Parts 10 and 11. */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const seg = (media, from, to) => ({ media, from, to });
  const W = 'room-wide', M = 'sit-medium', B = 'book-close', F = 'face-close';
  const voice = 'p8-interview-audio', pulse = 'p10-pulse';
  const takeA = 'p10-performance-a', takeB = 'p10-performance-b';
  const stage = node => ({ el: node, wide: true, interactive: true });
  const section = (title, intro, ...blocks) => ({ title, intro, blocks });
  const text = html => ({ type: 'text', html: '<p>' + html + '</p>' });
  const mediaClip = (media, track, start, duration, from = 0) => ({ media, track, start, duration, in: from });
  const titleClip = (name, track, start, duration, words, extra = {}) => ({
    title: 'text', name, track, start, duration, props: { text: words, ...extra }
  });
  const step = (text, hint, check) => ({ text, hint, check });
  const onTrack = (api, track, test) => api.clips(track).some(c => !c.disabled && test(c));
  const close = (a, b) => Math.abs(a - b) <= 2 / 24;
  function edit(title, brief, clips, steps, extra = []) {
    return { type: 'editor-exercise', level: 3, media: [...new Set(clips.map(c => c.media).filter(Boolean).concat(extra))],
      timeline: { video: 3, audio: 1, clips }, task: { title, brief: '“' + brief + '”', steps } };
  }
  const graphicsBase = () => mediaClip('p8-interview', 'V1', 0, 8);
  function editorExercise(slug) {
    if (slug === 'j-cuts' || slug === 'l-cuts') {
      const j = slug === 'j-cuts', cut = j ? 4 : 3;
      return edit(j ? 'Hear the reader early' : 'Stay with the speaker’s voice',
        j ? 'Let the voice lead viewers into the next room by one second.' : 'Stay on the listener for two seconds while the speaker finishes.',
        [mediaClip(j ? W : F, 'V1', 0, cut), mediaClip(j ? F : M, 'V1', cut, 7 - cut), mediaClip(voice, 'A1', j ? 4 : 0, 3)],
        [step(j ? 'Start the narration at 3 s.' : 'Extend the narration to 5 s.',
          j ? 'Select the narration on A1. In Edit with the keyboard, enter 3 and use Move clip on A1.' : 'Select the narration on A1. Enter 5 as the source end and use Trim end.',
          api => onTrack(api,'A1',c => c.media === voice && (j ? close(c.start,3) : close(c.end,5)))),
        step(j ? 'Keep the Reader’s picture at 4 s, with the voice playing across the cut.' : 'Keep the reaction at 3 s, with two seconds of outgoing voice over it.',
          'Keep both pictures touching on V1. Change the sound independently.',
          api => onTrack(api,'V1',v => v.media === (j ? F : M) && close(v.start,cut) &&
            onTrack(api,'A1',a => a.media === voice && (j ? close(v.start-a.start,1) && a.end>v.start : close(a.end-v.start,2) && a.start<v.start))))]);
    }
    if (slug === 'cuts-dissolves-and-effects') return edit('Show time passing','Blend the empty desk into the later book shot at 4 seconds.',
      [mediaClip(W,'V1',0,4),mediaClip(B,'V1',4,4)],
      [step('Place a Cross Dissolve at 4 s.','Open Effects Library → Video Transitions. Drag Cross Dissolve to the join at 4 seconds.',
        api => api.transitions().some(t => t.type==='dissolve' && t.track==='V1' && close(t.at,4))),
      step('Keep the opening and ending clean. Use only the dissolve at the join.','Check both sides of the touching clips. Remove transitions from their outer edges.',
        api => api.transitions().length>0 && api.transitions().every(t => t.type==='dissolve' && close(t.at,4)) && !api.gaps('V1').length)]);
    if (slug === 'editing-on-the-beat') return edit('Mark and cut a pulse','Let the viewer see the edit land on beats at 2 and 4 seconds.',
      [mediaClip(W,'V1',0,6),mediaClip(pulse,'A1',0,6)],
      [step('Mark the beats at 2 and 4 s.','Set the playhead to each time, then click Add marker at playhead.',
        api => [2,4].every(t=>api.markers.some(m=>close(t,m)))),
      step('Split the picture at both marked beats. Keep all six seconds.','At each marker, select the picture segment under the playhead and split it. After the first split, select the new right-hand segment.',
        api => [2,4].every(t=>onTrack(api,'V1',c=>close(c.start,t))) && onTrack(api,'V1',c=>close(c.end,6)) && !api.gaps('V1').length)]);
    if (slug === 'performance-a-b-editing') return edit('Switch takes at the phrase','Show A’s clear face, then B’s gesture. Keep both takes on the same pulse.',
      [mediaClip(takeA,'V1',0,6),mediaClip(takeB,'V2',0,6),mediaClip(pulse,'A1',0,6)],
      [step('Reveal take A for the first three seconds.','Select B on V2. Trim its start to source time 3. The trim exposes A underneath.',
        api => onTrack(api,'V1',c=>c.media===takeA&&close(c.start,0)&&c.end>=3) && !onTrack(api,'V2',c=>c.start<2.92)),
      step('Show B on V2 from 3 to 6 s with its source time still aligned.','Trim, rather than sliding the entire take. Check source In and timeline start both read 3.',
        api => onTrack(api,'V2',c=>c.media===takeB&&close(c.start,3)&&close(c.in,3)&&close(c.end,6)) && onTrack(api,'A1',c=>c.media===pulse&&close(c.start,0)&&close(c.end,6)))]);
    if (slug === 'edit-judgment') return edit('Repair the rough cut','Hide the face jump, remove the mid-line wipe, and replace the unrelated field with a book detail.',
      [mediaClip(W,'V1',0,2),{...mediaClip(M,'V1',2,2),transitionIn:'wipe'},mediaClip(F,'V1',4,2),
        mediaClip('p10-rough-edit','V2',4,2,12),mediaClip(B,'V3',6,2),mediaClip(voice,'A1',0,6)],
      [step('Cover the picture jump at 2 s with the book detail.','Move the waiting book clip on V3 from 6 s to 1 s so it spans the cut.',
        api=>api.clips().some(c=>c.media===B&&['V2','V3'].includes(c.track)&&c.start<2&&c.end>2)),
      step('Remove the wipe at 2 s.','Click the transition, then use Remove transition in the Inspector.',api=>!api.transitions().some(t=>t.type==='wipe')),
      step('Replace the field over the book line at 4–6 s with a relevant book close-up.','Delete the V2 field insert. Place a second book close-up on V2 at 4 seconds.',
        api=>!onTrack(api,'V2',c=>c.media==='p10-rough-edit')&&api.clips().some(c=>c.media===B&&['V2','V3'].includes(c.track)&&close(c.start,4)&&c.end>=5.92))]);
    if (slug === 'add-and-edit-titles') return edit('Title the interview','Introduce the interview with the exact words Art Club Voices on a title above the video.',
      [graphicsBase()],
      [step('Add a Text or Text+ clip to V2.','Choose Titles in the Effects Library. Drag Text to V2 above the image.',api=>onTrack(api,'V2',c=>!!c.title)),
      step('Type Art Club Voices into the title. Compare a larger and smaller Size in the Inspector.','Select the title. Type the approved title with this capitalization in its Text field.',
        api=>onTrack(api,'V2',c=>c.title&&c.text==='Art Club Voices'))]);
    if (slug === 'position-and-resize-graphics') return edit('Make room for two graphics','Put the title on the left and the club initials on the right within the lower half of the frame.',
      [graphicsBase(),titleClip('Interview title','V2',0,5,'Art Club'),titleClip('Club logo','V3',0,5,'AC')],
      [['Art Club',-450,'left'],['AC',450,'right']].map(([name,target,side])=>step('Place '+name+' on the '+side+' and scale it to 60–80%.',
        'Select '+name+'. In Transform, try X '+target+', Y 220 and Zoom 0.70. Position values are pixels from center.',
        api=>api.clips().some(c=>c.title&&c.text===name&&Math.abs(c.x-target)<=150&&c.y>=120&&c.y<=320&&c.zoom>=.6&&c.zoom<=.8))));
    if (slug === 'stack-text-and-track-order') return edit('Uncover the name','Keep the interview visible. Place the name above its backing.',
      [graphicsBase(),titleClip('Speaker name','V2',0,5,'Maya Chen'),{generator:'solid',track:'V3',start:0,duration:5,opacity:.65}],
      [step('Put the backing on V2.','Temporarily move the name to a free time. Move the box to V2 at 0 s.',
        api=>onTrack(api,'V2',c=>c.generator==='solid'&&close(c.start,0))),
      step('Put the name on V3 at 0 s, in front of the box.','Move the title to V3 at the same starting time as the box.',
        api=>onTrack(api,'V3',c=>c.title&&c.text==='Maya Chen'&&close(c.start,0))&&onTrack(api,'V2',c=>c.generator==='solid'&&close(c.start,0)))]);
    if (slug === 'opening-titles-lower-thirds-and-credits') return edit('Identify the speaker','Identify Maya Chen as Mural artist using a lower third during the interview.',
      [graphicsBase()],
      [step('Add a lower-third template above the speaker on V2.','In Effects Library → Titles, drag Left Lower Third onto V2.',
        api=>onTrack(api,'V2',c=>/^lower/.test(c.title||'')&&c.start<6)),
      step('Enter Maya Chen and Mural artist on separate lines.','Select the lower third. Use Text for the name and Subtitle for the role.',
        api=>onTrack(api,'V2',c=>/^lower/.test(c.title||'')&&c.text==='Maya Chen'&&c.text2==='Mural artist'))]);
    if (slug === 'title-timing') return edit('Set two reading times','Give each title words ÷ 3 + 1 seconds. The second title starts at 4 seconds.',
      [graphicsBase(),titleClip('Three words','V2',0,1,'Art Club Voices'),titleClip('Six words','V2',4,1,'Our mural opens this Friday afternoon')],
      [['Art Club Voices',2],['Our mural opens this Friday afternoon',3]].map(([name,seconds])=>step('Hold “'+name+'” for '+seconds+' seconds.',
        'Select this title and use Trim end with source time '+seconds+'. Check its duration.',
        api=>onTrack(api,'V2',c=>c.text===name&&close(c.duration,seconds)))));
    if (slug === 'graphics-judgment') return edit('Repair the interview graphic','Use the approved name Maya Chen. Give the viewer three seconds to read it, below and left of the face.',
      [graphicsBase(),titleClip('Draft name','V2',0,.5,'Maya Chne')],
      [step('Correct the name to Maya Chen.','Select the draft title and compare its Text field letter by letter.',api=>onTrack(api,'V2',c=>c.text==='Maya Chen')),
      step('Hold the corrected name for at least 3 s.','Trim its end to source time 3.',api=>onTrack(api,'V2',c=>c.title&&c.duration>=3)),
      step('Move the name below and left of center.','Use Transform. Try X −420 and Y 250 to leave a margin around the full title.',
        api=>onTrack(api,'V2',c=>c.title&&c.x>=-570&&c.x<=-270&&c.y>=165&&c.y<=325))]);
  }
  T.blocks['sequence-swap'] = () => {
    const face=seg('p10-kuleshov-face',.3,2.3), options=[['Soup','p10-soup'],['Cake','p10-cake'],['Marked paper','p10-paper']];
    const player=T.sequence([face,seg(options[0][1],0,2),face],{label:'Play face, object, face'});
    const buttons=el('div',{className:'chips',role:'group','aria-label':'Middle shot'});
    options.forEach(([name,id],i)=>{const b=T.button(name,()=>{player.setSegments([face,seg(id,0,2),face]);[...buttons.children].forEach((x,j)=>x.setAttribute('aria-pressed',String(j===i)));},'chip');b.setAttribute('aria-pressed',String(!i));buttons.append(b);});
    return stage(el('div',{},buttons,player.el));
  };
  T.blocks['post-split-listen'] = b => {
    const player = el('video', { controls: true, preload: 'metadata', playsinline: true, 'aria-label': 'Split edit comparison' });
    const captions = player.addTextTrack('captions', 'English', 'en');
    captions.mode = 'showing';
    const captionButton = T.button('English captions', () => {
      captions.mode = captions.mode === 'showing' ? 'hidden' : 'showing';
      syncCaptionButton();
    }, 'small');
    function syncCaptionButton() {
      captionButton.setAttribute('aria-pressed', String(captions.mode === 'showing'));
    }
    player.textTracks.addEventListener('change', syncCaptionButton);
    syncCaptionButton();

    const names = b.j ? ['p10-j-straight', 'p10-j-split'] : ['p10-l-straight', 'p10-l-split'];
    const labels = ['Straight cut', b.j ? 'Sound leads by 1 s' : 'Sound trails by 2 s'];
    const controls = el('div', { className: 'chips', role: 'group', 'aria-label': 'Edit versions' });
    const note = el('p', { className: 'caption' });
    function choose(i) {
      const record = T.mediaRecord(names[i]);
      T.mediaUsed.add(names[i]);
      if (record) {
        player.src = T.mediaURL(record);
        // Runtime cues also work when the book is opened directly from disk.
        const mode = captions.mode;
        captions.mode = 'hidden';
        for (const cue of Array.from(captions.cues || [])) captions.removeCue(cue);
        for (const { start, end, text } of record.captionCues || []) {
          captions.addCue(new VTTCue(start, end, text));
        }
        captions.mode = mode;
      }
      [...controls.children].forEach((button, j) => button.setAttribute('aria-pressed', String(j === i)));
      syncCaptionButton();
      note.textContent = labels[i] + '. Illustrated interview rehearsal using local footage and synthetic narration.';
    }
    labels.forEach((label, i) => controls.append(T.button(label, () => choose(i), 'chip')));
    choose(0);
    return stage(el('div', { className: 'post-stage' }, controls, player, el('div', {}, captionButton), note));
  };
  T.blocks['post-title-duration'] = () => {
    const duration=el('input',{type:'range',min:.5,max:6,step:.5,value:1,'aria-label':'Title hold in seconds'}),out=el('output'),screen=el('div',{className:'post-read-screen'}),status=el('p',{role:'status'});
    let timer;
    function reset(){clearTimeout(timer);screen.textContent='Ready';out.textContent=duration.value+' seconds';status.textContent='';}
    duration.addEventListener('input',reset);reset();
    const play=T.button('Test this hold',()=>{clearTimeout(timer);screen.textContent='Our mural opens this Friday afternoon';status.textContent='Read at a comfortable pace.';timer=setTimeout(()=>{screen.textContent='End of title';status.textContent='Did you have time to read it twice? Adjust the hold and test again.';},+duration.value*1000);});
    return stage(el('div',{className:'post-stage'},screen,el('label',{},'Hold length ',duration,' ',out),play,status));
  };
  T.blocks['text-overlay'] = b => {
    const photos=b.judged?['interview-a','interview-b','interview-a']:['interview-b'];
    const texts=['Maya Chen','Alex Kim · editor','Maya Chen · mural artist'];
    let round=0,x=b.requireBacking?94:50,y=45,size=b.requireBacking?14:(b.focus==='size'?12:21),back=b.focus!=='contrast',shade=false,small=false;
    const frame=el('div',{className:'post-overlay'}),photo=el('img',{alt:''}),safe=el('div',{className:'post-safe'}),face=el('div',{className:'post-face','aria-hidden':'true'}),words=el('span',{className:'post-words',tabindex:0}),
      desc=el('p',{className:'caption'}),fb=el('p',{role:'status'}),panel=el('div',{className:'overlay-controls'}),font=el('select',{'aria-label':'Typeface'},['Arial','Georgia','monospace'].map(v=>el('option',{text:v,value:v})));
    frame.append(photo,safe,face,words);
    function draw(){
      const id=photos[round],r=T.mediaRecord(id);T.mediaUsed.add(id);photo.src=T.mediaURL(r);photo.alt=r.alt;
      const l=r.landmarks,pad=(l.chin[1]-l.headTop[1])*.52, fx=(l.eyes[0]-pad)/r.w*100,fy=l.headTop[1]/r.h*100,fw=2*pad/r.w*100,fh=(l.chin[1]-l.headTop[1])/r.h*100;
      Object.assign(face.style,{left:fx+'%',top:fy+'%',width:fw+'%',height:fh+'%'});
      frame.classList.toggle('post-phone',small);words.textContent=texts[round];
      Object.assign(words.style,{left:x+'%',top:y+'%',fontSize:size/6.4+'cqw',fontFamily:font.value,color:'#fff',background:back?'#14202a':'transparent',textShadow:shade?'0 1px 3px black, 1px 0 2px black':'none'});
      desc.textContent=(b.judged?'Brief '+(round+1)+' of 3. ':'')+(round===2?'Place the longer name above the subject. ':'')+
        (b.focus==='size'?'Compare the small screen and the larger screen.':b.focus==='contrast'?'Try the lighter part of the image with and without a backing.':'Keep the entire name inside the dashed guide and outside the marked face.');
    }
    function move(dx,dy){x=Math.max(0,Math.min(100,x+dx));y=Math.max(0,Math.min(100,y+dy));fb.textContent='';draw();}
    words.addEventListener('keydown',e=>{const delta={ArrowLeft:[-3,0],ArrowRight:[3,0],ArrowUp:[0,-3],ArrowDown:[0,3]}[e.key];if(delta){e.preventDefault();move(...delta);}});
    words.addEventListener('pointerdown',e=>words.setPointerCapture(e.pointerId));
    words.addEventListener('pointermove',e=>{if(!words.hasPointerCapture(e.pointerId))return;const a=frame.getBoundingClientRect();x=100*(e.clientX-a.left)/a.width;y=100*(e.clientY-a.top)/a.height;draw();});
    const btn=(label,fn)=>panel.append(T.button(label,()=>{fn();draw();},'small'));
    for(const [s,dx,dy] of [['Left',-4,0],['Right',4,0],['Up',0,-4],['Down',0,4]])btn(s,()=>move(dx,dy));
    btn('Smaller letters',()=>size=Math.max(10,size-3));btn('Larger letters',()=>size=Math.min(40,size+3));font.addEventListener('change',draw);panel.append(font);
    btn('Toggle backing box',()=>back=!back);btn('Toggle shadow',()=>shade=!shade);btn('Toggle small screen',()=>small=!small);
    const check=T.button('Check graphic',()=>{
      const a=words.getBoundingClientRect(),s=safe.getBoundingClientRect(),f=face.getBoundingClientRect();
      const inside=a.left>=s.left&&a.right<=s.right&&a.top>=s.top&&a.bottom<=s.bottom;
      const hits=a.left<f.right&&a.right>f.left&&a.top<f.bottom&&a.bottom>f.top;
      if(!inside||hits||round===2&&a.bottom>f.top||b.requireBacking&&(!back||size<20)){
        fb.textContent=!inside?'A letter crosses the guide. Move the full name inward.':hits?'The letters overlap the face. Try a clear area beside or below it.':round===2&&a.bottom>f.top?'For this brief, leave the whole name above the face.':'Increase the letter size and add a dark backing for the bright area.';return;
      }
      if(b.judged&&round<2){round++;x=50;y=45;draw();fb.textContent='That placement fits. Try the next frame.';}
      else fb.textContent='The whole graphic fits the guide and clears the face.'+(b.judged?' All three briefs are complete.':'');
    },'primary');draw();
    return stage(el('div',{className:'post-stage'},desc,frame,panel,b.judged||b.requireBacking?check:null,fb));
  };
  T.blocks['caption-editor'] = () => {
    const reference=[['I reach for the book on the table.',0,1.62],['A loose crease makes this page easy to find.',1.95,4.64],['The note tells me to come back through the hallway.',4.99,7.18]];
    const rec=T.mediaRecord(voice);T.mediaUsed.add(voice);
    const audio=el('audio',{controls:true,preload:'metadata',src:T.mediaURL(rec),'aria-label':'Recorded practice narration'});
    const cues=reference.map(([words,start,end],i)=>({text:i===0?words.replace('book','boot'):words,start:start+.45,end:end+.30}));
    const rendered=el('div',{className:'caption-render'}),time=el('output'),list=el('div',{className:'caption-list'}),fb=el('p',{role:'status'});
    function draw(){const t=audio.currentTime,c=cues.find(c=>t>=c.start&&t<c.end);rendered.textContent=c?c.text:'';time.textContent='Playhead '+t.toFixed(2)+' s';}
    audio.addEventListener('timeupdate',draw);audio.addEventListener('seeked',draw);
    const ref=el('details',{},el('summary',{text:'Approved transcript and spotting times'}),el('ol',{},reference.map(([s,a,b])=>el('li',{text:a.toFixed(2)+'–'+b.toFixed(2)+' s · '+s}))));
    cues.forEach((c,i)=>{const label='Cue '+(i+1);const field=(key,title,number)=>{
      const n=el('input',{type:number?'number':'text',min:number?0:null,max:number?rec.duration:null,step:number?.01:null,value:number?c[key].toFixed(2):c[key],'aria-label':label+' '+title});
      n.addEventListener('input',()=>{c[key]=number?n.valueAsNumber:n.value;draw();});return el('label',{},title+' ',n);};
      list.append(el('fieldset',{className:'caption-cue'},el('legend',{text:label}),field('start','In (seconds)',true),field('end','Out (seconds)',true),field('text','Words',false)));
    });
    const check=T.button('Check captions',()=>{for(const [i,[words,start,end]] of reference.entries()){
      const c=cues[i],issue=c.text.trim()!==words?'Compare the words and punctuation with the approved transcript.':
        !close(c.start,start)?'Check when this phrase begins.':!close(c.end,end)?'Check when the phrase finishes.':'';
      if(issue){fb.textContent='Cue '+(i+1)+'. '+issue;return;}
    }fb.textContent='Every cue matches the transcript and lands within two frames at 24 fps.';},'primary');draw();
    return stage(el('div',{className:'post-stage'},el('p',{text:'Listen to the synthetic practice interview. Fix each cue, then play it with the captions visible.'}),
      el('div',{className:'caption-screen'},T.media('p8-interview'),rendered),audio,time,ref,list,check,fb));
  };
  T.blocks['post-free-order'] = () => {
    const shots = [[W,'Room',3,6],[B,'Book',1.5,4],[F,'Face',0,2]];
    let order=[0,1,2]; const player=T.sequence([],{label:'Play this order'});
    const controls=el('div',{className:'overlay-controls'}),status=el('p',{role:'status'});
    function redraw(){status.textContent='Order: '+order.map(i=>shots[i][1]).join(' → ');player.setSegments(order.map(i=>seg(shots[i][0],shots[i][2],shots[i][3])));}
    shots.forEach((shot,i)=>controls.append(T.button('Put '+shot[1]+' first',()=>{order=[i,...order.filter(v=>v!==i)];redraw();},'small')));
    redraw();return stage(el('div',{className:'post-stage'},controls,status,player.el));
  };
  function version(label,segments,note){return {label,segments,note};}
  function compare(prompt,versions){return {type:'sequence-compare',versions,predict:{q:prompt,options:versions.map(v=>v.label)}};}
  const study = (media,pauses) => ({type:'video-segments',media,pauses:pauses.map(([at,prompt])=>({at,prompt}))});
  function orderBlock(pace) {
    return {type:'sequence-builder',start:[2,0,1],prompt:pace?'“Start with a long look at the room. Accelerate into the reaction.”':'“Let us see the room, discover the book, then read the reaction.”',
      shots:[{label:'Place',desc:pace?'Hold the setting for four seconds.':'Show where the reader is.',segment:seg(W,3,pace?7:6),thumbAt:3},
        {label:'Book',desc:pace?'Spend two seconds on the detail.':'Show what attracts attention.',segment:seg(B,2,pace?4:5),thumbAt:3},
        {label:'Reaction',desc:pace?'Hold the reaction for one second.':'Give the discovery a response.',segment:seg(F,0,pace?1:3),thumbAt:1}],
      success:pace?'The 4–2–1 pattern accelerates as the viewer approaches the reaction.':'The reaction now follows the detail that caused it.',
      clue:pace?'Compare the durations. This brief needs the longest first and the shortest last.':'Which image shows the cause of the reaction?'};
  }
  const notesWatch = {
    'montage-and-context':['Original montage study','Watch how repeated boots and scattered figures build a sense of pressure. This illustration models a technique used by Soviet filmmakers, including Sergei Eisenstein in Battleship Potemkin (1925).',study('p10-montage-study',[[3.2,'What new idea appears when the crowd replaces the boots?'],[5.3,'What changes when the boots return?']])],
    'cuts-dissolves-and-effects':['Four ways to change shots','Follow the edge of each image. Pause before the second and fourth changes to predict what happens.',study('p10-four-transitions',[[2.5,'During the next second, can you see both images at once?'],[8.6,'Compare a moving edge with a full-frame blend.']])],
    'performance-story-and-conceptual-balance':['One lyric, three approaches','Watch the three illustrated images. Decide which gives you an artist, an event or an idea.',study('p10-music-images',[[3.2,'What can a door suggest about the character’s choice?'],[6.4,'How do the shadows suggest distance?']])],
    'edit-judgment':['The forty-second rough cut','Track three different problems. Use the time display to make each note specific.',study('p10-rough-edit',[[4.4,'What changes abruptly in the speaker’s position?'],[12.3,'Does a field illustrate a line about a book?']])]
  };
  function imageChoice(rounds,closing) {
    return {type:'picture-choice',closing,rounds:rounds.map(([prompt,correct,wrong,explain,clue],i)=>{
      const options=[correct,{...wrong,clue}];if(i%2)options.reverse();return {prompt,options,answer:i%2,explain};
    })};
  }
  const still=(id,label,t=0)=>({media:{id,t},label});
  function graphicSample(bg,back,shadow,words) {
    const svg='<svg viewBox="0 0 320 180"><rect width="320" height="180" fill="'+bg+'"/><ellipse cx="200" cy="88" rx="96" ry="38" fill="#eceee1"/>'+
      (back?'<rect x="27" y="63" width="266" height="56" rx="4" fill="#203141"/>':'')+
      '<text x="160" y="98" text-anchor="middle" font-family="Arial" font-weight="700" font-size="24" stroke="'+(shadow?'#242424':'none')+'" stroke-width="3" paint-order="stroke" fill="white">'+words+'</text></svg>';
    return {svg,alt:words+' in white '+(back?'on a dark backing':shadow?'with a dark outline':'on a pale background')};
  }
  function practiceOptions(slug,d) {
    if(slug==='b-roll-relevance') return imageChoice([
      ['“We practise passing before kickoff.” Which image illustrates the line?',still('p10-rough-edit','Playing field',13),still('scene-shelf','Shelf'),'The field locates the practice.','Look for evidence of the sport.'],
      ['“The loose crease shows me which page to open.” What should viewers see?',still(B,'Book opening',3),still(W,'Whole room',4),'The book detail shows the object named by the speaker.','Can you inspect a page from this distance?'],
      ['“I was surprised when I read it.” Which shot adds evidence of the feeling?',still(F,'Reader’s expression',1),still('p8-note-hall','Hallway',3),'The reaction shows how the news landed.','Which image contains a face?']
    ],'Listen to the exact phrase before choosing a cover shot.');
    if(slug==='text-contrast')return imageChoice([
      ['Which title stays readable over a pale highlight?',graphicSample('#cddae4',true,false,'Art Club'),graphicSample('#cddae4',false,false,'Art Club'),'The dark backing separates every letter.','Compare the white edges against the highlight.'],
      ['The shot must stay unboxed. Which treatment separates the letter edges?',graphicSample('#dedac6',false,true,'Friday at 3'),graphicSample('#dedac6',false,false,'Friday at 3'),'The dark stroke separates the edges from the bright shape.','Inspect the letters where the bright shape crosses.'],
      ['Choose the more reliable title for a background that changes from dark to bright.',graphicSample('#65745e',true,false,'Room 103'),graphicSample('#65745e',false,false,'Room 103'),'The backing stays behind the whole line.','Notice where the light shape meets the words.']
    ],'Test the title across the changing shot.');
    if(slug==='shot-order-and-meaning'||slug==='pace-and-rhythm')return orderBlock(slug==='pace-and-rhythm');
    if(slug==='text-placement')return {type:'text-overlay',judged:true};
    if(slug==='caption-accuracy-and-timing')return {type:'caption-editor'};
    return editorExercise(slug);
  }
  function question(row,reverse,visual) {
    const [q,yes,no,explain]=row;
    const choices=[yes,{text:no,clue:explain}];if(reverse)choices.reverse();
    return {...visual,q,options:choices,answer:reverse?1:0,explain};
  }
  
  T.postTopic = d => {
    const slug=d.slug,found=T.findTopic(slug),topic=found.topic,reviewTopic=topic.bigIdea.startsWith('Review:');
    const glossary=window.TEXTBOOK_GLOSSARY;
    const vocab=glossary.filter(g=>g.introducedIn===slug).map(g=>g.id);
    const marked=[...new Set(d.remember.flatMap(s=>[...s.matchAll(/\[\[[^|\]]+\|([^\]]+)\]\]/g)].map(m=>m[1])))];
    const review=marked.filter(id=>!vocab.includes(id));
    const main=d.hook,reverse=Number(topic.id.split('.')[1])%2===0,hook=question(main,reverse,d.visual);
    const check=[question(main,!reverse,d.visual),...d.questions.map((q,i)=>question(q,(i+Number(reverse))%2===0))];
    const labelled=vocab.filter(id=>!marked.includes(id));
    const supplemental={
      'hold-duration':'Check the [[hold duration|hold-duration]] from the first visible title frame to its last.',
      'stacking-order':'At each playhead position, inspect the [[stacking order|stacking-order]] from the top visible track down.'
    };
    const extra=labelled.map(id=>supplemental[id]).filter(Boolean).join(' ');
    const evidence=d.visual.pair
      ? {type:'figure-row',items:d.visual.pair,caption:main[3]}
      : {type:'figure',...d.visual,caption:main[3]};
    const sections=[section(reviewTopic?'Read the rough cut':'Read the evidence',d.objectives[0],
      text(d.remember.slice(0,2).join(' ')+' '+d.questions[0][3]+' '+extra),
      evidence)];
    if(slug==='shot-order-and-meaning')sections.push(section('Reorder the same three shots','Make any order, then play it and name the feeling you get.',
      text('Choose a shot to move to the front. Repeat until you have the order you want.'),{type:'post-free-order'}));
    if(slug==='information-on-screen')sections.push(section('Cut the competing paragraph','The narrator invites students on a photo walk. Compare what the two graphics ask viewers to read.',
      text('Decide which graphic contributes information a listener can act on.'),{type:'compare',labels:['Crowded','Edited'],items:[
      {svg:T.draw.editCards('Photo club news',[['Last year','The club met after school.','Members went on a walk.','Everyone enjoyed the trip.']]),alt:'A paragraph about last year’s club and walk.'},
      {svg:T.draw.editCards('Photo walk',[['Meet Friday','3:15 p.m.','Room 12','Bring a camera.']]),alt:'Photo walk meeting time, location and equipment.'}],
      captions:['The paragraph competes with the invitation.','The time and location give the viewer a next step.']}));
    if(slug==='opening-titles-lower-thirds-and-credits')sections[0].blocks[1]={type:'figure-row',items:[
      {svg:T.draw.editCards('Opening',[['Art Club Voices','A school interview']]),alt:'Opening title introduces Art Club Voices.',caption:'Introduce the story.'},
      {...d.visual,caption:'Identify the speaker.'},
      {svg:T.draw.editCards('Credits',[['Camera: Jules Park','Sound: T. Reyes','Edit: Noor Ali']]),alt:'Credits list the crew and roles.',caption:'Acknowledge contributors.'}]};
    if(slug==='kuleshov-effect')sections.push(section('Change the middle shot','Keep the first and last face exactly the same.',
      {type:'figure-row',items:[
        {media:'p10-lunch-soup',caption:'Soup'},
        {media:'p10-birthday-cake',caption:'Birthday cake'},
        {media:'p10-marked-paper',caption:'Marked test paper'}]},
      text('Choose an object and predict a feeling before playback. Which part of your interpretation comes from the object?'),{type:'sequence-swap'},
      {type:'callout',kind:'history',html:'The demonstration takes its name from Soviet filmmaker Lev Kuleshov. Compare it with the original montage study in the next lesson.',link:{label:'Montage and Context',href:'../montage-and-context/index.html'}}));
    if(slug==='j-cuts'||slug==='l-cuts')sections.push(section('Compare the sound edits','Listen at normal speed to hear which carries the voice across the picture change.',
      text(slug==='j-cuts'?'Predict which version lets you hear the reader while the room is still on screen.':'Predict which version lets you hear the speaker while the next shot is on screen.'),{type:'post-split-listen',j:slug==='j-cuts'}));
    if(notesWatch[slug]){const [label,intro,block]=notesWatch[slug];sections.push(section(label,intro,text(d.questions[1][3]),block));}
    if(slug==='shot-order-and-meaning'||slug==='openings-and-endings'||slug==='pace-and-rhythm'||slug==='performance-a-b-editing'){
      let prompt,versions;
      if(slug==='pace-and-rhythm'){prompt='Which version feels urgent?';versions=[version('Long holds',[seg(W,3,7),seg(B,0,4),seg(F,0,4)],'Each image stays for four seconds.'),version('Quick cuts',[seg(W,3,4),seg(B,2,3),seg(F,0,1)],'The same order gives you only one second per image.')];}
      else if(slug==='performance-a-b-editing'){prompt='Which angle reveals the gesture in the second phrase?';versions=[version('Take A',[seg(takeA,0,6)],'The face is clear in the first phrase. The late gesture is blocked.'),version('Take B',[seg(takeB,0,6)],'The early face is blocked. The later gesture is clear.')];}
      else{prompt=slug==='shot-order-and-meaning'?'Which version shows the reader’s reaction after the book?':'Which opening immediately gives the viewer an object to wonder about?';versions=[version('Room first',[seg(W,0,3),seg(B,1.5,4),seg(F,.5,2.5)],'We locate the room and then connect the book to the face.'),version('Detail first',[seg(B,1.5,4),seg(F,.5,2.5),seg(W,0,3)],'The detail raises a question before we know where the reader is.')];}
      sections.push(section('Play both versions','Make a prediction and then compare the two cuts.',text(d.remember[2]),compare(prompt,versions)));
      if(slug==='openings-and-endings')sections.push(section('Compare the last image','The ending can leave us with the place or the person.',
        text('Decide which final image lets the audience consider the reader’s response.'),compare('Which ending leaves the reaction with the viewer?',[
          version('End on the reader',[seg(B,2,4),seg(F,0,2)],'The expression is our last image.'),version('End on the room',[seg(F,0,2),seg(W,0,2)],'The empty location pulls our attention away from the face.') ])));
    }
    if(slug==='shot-length-and-new-information')sections.push(section('Find the end of the action','Trim a walk until the viewer has seen the person leave.',
      text('Compare a shot cut mid-crossing with a complete crossing. Then shorten the empty hold.'),
      {type:'trim-explore',media:'p8-note-hall',states:[{title:'Whole crossing',text:'The viewer sees the arrival and departure.'},{title:'Late entrance',text:'The crossing has already started.'},{title:'Missing departure',text:'The walker still has somewhere to go.'},{title:'Only the middle',text:'Both ends of the crossing are missing.'}],
        presets:[{label:'Complete crossing',in:-.4,out:.4},{label:'Cut it short',in:-.4,out:-1},{label:'Long empty hold',in:-.4,out:1.8}],checks:['Arrival visible','Departure visible'],tasks:['Keep the start of the crossing','Keep the end','Play the complete change'],completion:'The full action reads. Keep only as much empty hallway as the mood requires.'}));
    if(slug==='add-and-edit-titles')sections.push(section('Choose a typeface','Compare the shape and size of the letters over an interview.',
      text('Use the Typeface menu and letter-size buttons. Check how a name reads in the small-screen preview before adding your own title.'),{type:'text-overlay',focus:'size'}));
    if(slug==='title-timing')sections.push(section('Read against the clock','Test how long six words need on screen.',text('Set the slider. Read the words comfortably and try a second pass before they disappear.'),{type:'post-title-duration'}));
    if(['text-size-and-readability','text-contrast','text-placement'].includes(slug)){
      const focus=slug==='text-contrast'?'contrast':slug==='text-placement'?'placement':'size';
      sections.push(section('Try it on the interview','Change one setting and inspect the result on the actual frame.',text(d.remember[2]),{type:'text-overlay',focus}));
    }
    if(slug==='caption-accuracy-and-timing')sections[0].blocks.push({type:'callout',kind:'consider',html:'Watch once with the sound off. Which story information needs a caption beyond the spoken words?',link:{label:'Accessibility and Audience Access',href:'../accessibility-and-audience-access/index.html'}});
    if(slug==='graphics-judgment')sections.push(section('Check the graphic in playback','Check the spelling against the approved source before judging the appearance.',
      {type:'steps',items:['Compare every letter of the approved name.','Read the entire title at the smallest delivery size.','Check that the full text stays inside the guide.','Time the hold with an unfamiliar reader.','Watch the face while the title is visible.']}));
    const practice=practiceOptions(slug,d),quiz={type:'quiz',label:'Director’s decisions',items:(d.briefs||d.questions).map((r,i)=>question(r,i%2===1))};
    const blocks=practice?[practice]:[quiz];
    if(slug==='text-placement'||slug==='pace-and-rhythm')blocks.push(text(slug==='text-placement'?'Now check a placement problem that develops later in a moving shot.':'Use the timing pattern from your edit to judge these new sequences.'),quiz);
    if(slug==='edit-judgment')blocks.unshift(quiz,text('Apply those decisions to this six-second timeline. The waiting book clip is parked at the end.'));
    if(slug==='graphics-judgment')blocks.push(text('Use the backing and size controls to make the contrast repair. Keep the whole name clear of the face.'),{type:'text-overlay',requireBacking:true,focus:'contrast'});
    sections.push(section('Make the edit',d.objectives[1],...blocks));
    const id=Number(topic.id.split('.')[1]),part=found.part.number;
    const minutes=part===10?(id===7?10:[10,14].includes(id)?15:12):([10,11].includes(id)?15:[4,8].includes(id)?12:10);
    T.topic({slug,minutes,bigIdea:topic.bigIdea,hook:{...d.visual,question:hook.q,options:hook.options.map(o=>typeof o==='string'?o:o.text),answer:hook.answer,reveal:main[3]},
      notes:d.notes,
      vocab,review,objectives:d.objectives,sections,check,remember:d.remember,realCamera:d.realCamera});
  };
})();
