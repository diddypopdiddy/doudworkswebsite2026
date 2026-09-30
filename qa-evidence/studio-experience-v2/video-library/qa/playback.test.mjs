import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {nextQueueVideo,playbackEvents,videoError} from '../playback.js';
import {videos} from '../catalog.js';
import {unavailableEmbedIds} from '../embed-availability.js';
const ordered=[...videos].sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
test('Sun Brother ID maps to its own watch link and next title',()=>{
 const sun=videos.find(v=>v.song==='Sun Brother');
 assert.equal(sun.id,'iMta9k9y1KQ');assert.equal(new URL(sun.sourceUrl).searchParams.get('v'),sun.id);
 assert.equal(nextQueueVideo(ordered,sun.id).song,'Cherry Lips (Go Baby Go)');
});
test('queue has no wraps and skips failures only ahead of the current item',()=>{
 const list=[{id:'a'},{id:'b'},{id:'c'}];
 assert.equal(nextQueueVideo(list,'a',new Set(['b'])).id,'c');
 assert.equal(nextQueueVideo(list,'c'),null);assert.equal(nextQueueVideo(list,'missing'),null);
});
test('only a played video ending advances, once, not on error or initial ended state',()=>{
 const calls=[];const events=playbackEvents({isCurrent:()=>true,onReady:()=>{},onEnded:()=>calls.push('ended'),onError:code=>calls.push(code),onBlocked:()=>{}});
 events.onStateChange({data:0});assert.deepEqual(calls,[]);
 events.onStateChange({data:1});events.onStateChange({data:0});events.onStateChange({data:0});events.onError({data:150});
 assert.deepEqual(calls,['ended']);
});
test('unavailable video settles once; errors do not masquerade as completion',()=>{
 const calls=[];const events=playbackEvents({isCurrent:()=>true,onReady:()=>{},onEnded:()=>calls.push('ended'),onError:code=>calls.push(code),onBlocked:()=>{}});
 events.onError({data:150});events.onError({data:150});events.onStateChange({data:1});events.onStateChange({data:0});assert.deepEqual(calls,[150]);
 assert.equal(videoError(150).skip,true);assert.equal(videoError(101).skip,true);assert.equal(videoError(100).skip,true);
 assert.equal(videoError(153).skip,false);assert.equal(videoError(5).skip,false);
});
test('stale iframe events cannot change the new video, caption, or link',()=>{
 let current=true;const calls=[];const events=playbackEvents({isCurrent:()=>current,onReady:()=>calls.push('ready'),onEnded:()=>calls.push('ended'),onError:c=>calls.push(c),onBlocked:()=>calls.push('blocked')});
 events.onStateChange({data:1});current=false;events.onReady();events.onStateChange({data:0});events.onError({data:101});events.onAutoplayBlocked();assert.deepEqual(calls,[]);
});
test('catalog IDs and direct links are unique and consistent',()=>{
 assert.equal(new Set(videos.map(v=>v.id)).size,videos.length);
 for(const v of videos){assert.match(v.id,/^[\w-]{11}$/);assert.equal(new URL(v.sourceUrl).searchParams.get('v'),v.id)}
});
test('player sends one ID, never an independent YouTube playlist',async()=>{
 const source=await readFile(new URL('../library.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/args\.set\('playlist'|getVideoData\(/);
 assert.match(source,/onEnded:.*if\(queue\)advance\(\)/);
});

test('known unplayable embeds are excluded without excluding Sun Brother',()=>{
 const available=ordered.filter(v=>!unavailableEmbedIds.has(v.id));
 assert.equal(available.length,36);assert.equal(unavailableEmbedIds.size,30);
 assert.equal(nextQueueVideo(available,'iMta9k9y1KQ').song,'Lovers In Love');
 assert.ok(available.some(v=>v.id==='iMta9k9y1KQ'));
});

// Readiness is not playback; a ready-but-black embed must retain its fallback.
test('only current playing events confirm playback, never iframe readiness',()=>{
 let current=true;const calls=[];const events=playbackEvents({isCurrent:()=>current,onReady:()=>calls.push('ready'),onPlaying:()=>calls.push('playing'),onEnded:()=>{},onError:()=>{},onBlocked:()=>{}});
 events.onReady();assert.deepEqual(calls,['ready']);events.onStateChange({data:1});assert.deepEqual(calls,['ready','playing']);current=false;events.onStateChange({data:1});assert.deepEqual(calls,['ready','playing']);
});
