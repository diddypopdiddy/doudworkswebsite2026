// The site owns the queue. Each YouTube frame receives exactly one video ID.
export function nextQueueVideo(videos, id, failed = new Set()) {
 const start = videos.findIndex(video => video.id === id);
 if (start < 0) return null;
 return videos.slice(start + 1).find(video => !failed.has(video.id)) || null;
}
export function playbackEvents({isCurrent, onReady, onEnded, onError, onBlocked, onPlaying}) {
 let played = false, settled = false;
 return {
  onReady(event) { if (isCurrent()) onReady(event); },
  onStateChange(event) {
   if (!isCurrent() || settled) return;
   if (event.data === 1) {played = true;onPlaying?.(event);}
   if (event.data === 0 && played) { settled = true; onEnded(); }
  },
  onError(event) {
   if (!isCurrent() || settled) return;
   settled = true;
   onError(Number(event.data));
  },
  onAutoplayBlocked() { if (isCurrent() && !settled) onBlocked(); }
 };
}
export function videoError(code) {
 if (code === 101 || code === 150) return {skip:true,message:'YouTube does not allow this video to play on other websites.'};
 if (code === 100) return {skip:true,message:'YouTube reports this video as removed, private, or unavailable.'};
 if (code === 153) return {skip:false,message:'YouTube could not verify this embedded player.'};
 return {skip:false,message:'YouTube could not start this video. Try Retry video.'};
}
