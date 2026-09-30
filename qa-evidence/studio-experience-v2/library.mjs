export function playbackQueue(tracks, album = null) {
  return tracks.map((track,index)=>({track,index})).filter(({track})=>!album||track.collection===album).map(({index})=>index);
}
export function adjacentTrack(queue, currentIndex, direction, wrap = false) {
  const position=queue.indexOf(currentIndex);
  if(position<0||!queue.length)return null;
  const next=position+direction;
  if(next<0||next>=queue.length)return wrap?queue[(next+queue.length)%queue.length]:null;
  return queue[next];
}
