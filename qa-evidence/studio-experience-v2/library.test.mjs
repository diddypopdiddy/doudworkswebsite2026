import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tracks} from './album-tracks.js';
import {playbackQueue,adjacentTrack} from './library.mjs';
const albums={'Happy Birthday To Me':7,'Fully Proper':16,'Right Here Ideas':11,'Content':10,'EL LOBO presents: Uber Thurman':7,'There It Is!':13,"EL'EP":5,"EL LOBO proudly presents...'El Lobo'":4,'GTGC':11,'Baby Steps':7};
test('all ten imported albums have complete, ordered track lists',()=>{
 assert.equal(tracks.length,91);assert.equal(new Set(tracks.map(t=>t.src)).size,91);
 for(const [album,count] of Object.entries(albums)) {
  const list=tracks.filter(t=>t.collection===album);assert.equal(list.length,count);
  assert.deepEqual(list.map(t=>t.trackNumber),Array.from({length:count},(_,i)=>i+1));
  assert.ok(list.every(t=>t.duration>0&&t.kind==='original'&&t.src.endsWith('.mp3')));
 }
});
test('every imported audio file exactly matches its recorded source hash',()=>{
 const manifest=JSON.parse(readFileSync(new URL('./qa/album-import-2026-09-06.json',import.meta.url)));
 const bandcamp=JSON.parse(readFileSync(new URL('./qa/bandcamp-import-2026-09-27.json',import.meta.url)));
 for(const entry of [...manifest,...bandcamp.files])assert.equal(createHash('sha256').update(readFileSync(new URL(entry.src,import.meta.url))).digest('hex'),entry.sha256);
});
test('album queue filters original indexes, and automatic playback stops at album end',()=>{
 for(const [album,count] of Object.entries(albums)) {
  const queue=playbackQueue(tracks,album);assert.equal(queue.length,count);
  assert.ok(queue.every(i=>tracks[i].collection===album));
  assert.equal(adjacentTrack(queue,queue.at(-1),1),null);
  assert.equal(adjacentTrack(queue,queue[0],-1),null);
  assert.equal(adjacentTrack(queue,queue[0],1),queue[1]);
  assert.equal(adjacentTrack(queue,queue.at(-1),1,true),queue[0]);
 }
});
test('all songs includes entire library; stale/empty selection cannot pick unrelated tracks',()=>{
 assert.equal(playbackQueue(tracks).length,91);
 assert.equal(adjacentTrack([],0,1,true),null);
 assert.equal(adjacentTrack([2,3],0,1,true),null);
});
