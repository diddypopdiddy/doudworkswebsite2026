import {copyFile, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {tracks} from '../qa-evidence/studio-experience-v2/album-tracks.js';
import {previews,projectCategories} from '../qa-evidence/studio-experience-v2/content.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const studio=path.join(root,'qa-evidence/studio-experience-v2');
const output=path.join(root,'.release/studio-review');
const entries=new Map();
entries.set('CNAME',path.join(root,'CNAME'));
const add=(source,destination=source)=>entries.set(destination,path.join(studio,source));
for(const name of ['index.html','styles.css','script.js','content.js','player.js','about-contact.js','album-tracks.js','library.mjs','wheel.mjs','homepage-art.js','homepage-whiteboard.js','homepage-hotspots.js','vd-utility-avatar.svg','vince-doud-name-only.png','master-studio-room-cartoon-v3-thin-contours.png'])add(name);
for(const name of ['gallery-walk/gallery.css','gallery-walk/gallery-compact-ui.js','gallery-walk/navigation.mjs','gallery-walk/compact-environment.js','gallery-compact/room.glb','gallery-compact/room-manifest.json','gallery-corner/vendor/HDRLoader.js','gallery-corner/textures/neighborhood-view.jpg','gallery-corner/textures/studio_small_09_1k.hdr','homepage-assets/daily-board-approved.png','selected-art/loretta-2018.png'])add(name);
for(const file of await readdir(path.join(studio,'gallery/vendor')))if(file.endsWith('.js'))add('gallery/vendor/'+file);
for(const file of await readdir(path.join(studio,'video-library')))if(/\.(js|css)$/.test(file)||file==='tv-4x3.png')add('video-library/'+file);
for(const file of ['overlay-teaching.png','overlay-work.png','overlay-about.png','overlay-music.png','overlay-ai.png','overlay-video.png'])add('highlight-pack/'+file);
for(const track of tracks){add(track.src);if(track.cover)add(track.cover);}
const manifest=JSON.parse(await readFile(path.join(studio,'selected-art/manifest.json'),'utf8'));
// Keep stable indices while excluding retired art and original/private provenance.
manifest.items=manifest.items.map(item=>{
  if(item.display!=='wall')return {index:item.index,display:'hidden'};
  const {sourcePath,sourceFiles,provenance,...publicItem}=item;
  add('selected-art/'+publicItem.file);
  publicItem.views=publicItem.views?.filter(view=>!/\braw\b/i.test(`${view.label||''} ${view.file||''}`));
  for(const view of publicItem.views||[])add('selected-art/'+view.file);
  return publicItem;
});
for(const name of new Set(Object.values(projectCategories).flatMap(category=>category.projects.map(project=>previews[project.id]).filter(Boolean))))entries.set('media/projects/'+name,path.join(root,'media/projects',name));
for(const name of ['media/brand/InterVariable.ttf','media/brand/INTER_LICENSE.txt','media/vince-doud-portrait-clean-v2.jpg'])entries.set(name,path.join(root,name));
await rm(output,{recursive:true,force:true});
const hashes=[];
for(const [destination,source] of [...entries].sort(([a],[b])=>a.localeCompare(b))){
  if(path.isAbsolute(destination)||destination.split('/').includes('..'))throw Error('Unsafe release path: '+destination);
  const target=path.join(output,destination);await mkdir(path.dirname(target),{recursive:true});
  const bytes=await readFile(source);
  if(/\.(js|css|html)$/.test(destination))await writeFile(target,bytes.toString().replaceAll('../../media/','media/'));
  else await copyFile(source,target);
  const shipped=await readFile(target);hashes.push({file:destination,bytes:shipped.length,sha256:createHash('sha256').update(shipped).digest('hex')});
}
await mkdir(path.join(output,'selected-art'),{recursive:true});
await writeFile(path.join(output,'selected-art/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Back to Vince Doud’s studio</title><body><h1>This page has moved.</h1><p><a href="/">Return to the studio</a></p></body></html>');
await writeFile(path.join(output,'robots.txt'),'User-agent: *\nAllow: /\n');
await writeFile(path.join(root,'.release/studio-review-manifest.json'),JSON.stringify({built:new Date().toISOString(),inputs:[...entries.values()].map(source=>path.relative(root,source)),files:hashes,artworks:manifest.items.filter(item=>item.display==='wall').length,tracks:tracks.length},null,2)+'\n');
console.log(`Built ${entries.size+4} public runtime files: ${output}; 13 artworks, ${tracks.length} tracks. No deployment performed.`);
