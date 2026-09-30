import {readFile,readdir,stat,access} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const release=path.join(root,'.release/studio-review');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async entry=>entry.isDirectory()?files(path.join(dir,entry.name)):path.join(dir,entry.name)))).flat();}
const shipped=await files(release);
for(const file of shipped){
 const relative=path.relative(release,file);
 assert.ok(!/(^|\/)(qa|source|archives|audits|node_modules|\.git|\.env)(\/|$)|\.blend/.test(relative),'Public runtime contains development material: '+relative);
 assert.ok((await stat(file)).size<100*1024*1024,'File exceeds GitHub limit: '+relative);
 if(!/\.(html|css|js|mjs)$/.test(file))continue;
 const text=await readFile(file,'utf8');
 assert.ok(!text.includes('../../media/'),'Parent-workspace asset reference: '+relative);
 const refs=[];
 if(file.endsWith('.html'))for(const m of text.matchAll(/\b(?:src|href)=["']([^"']+)["']/g))refs.push(m[1]);
 if(/\.(js|mjs)$/.test(file))for(const m of text.matchAll(/(?:from\s+|import\s*(?:\(\s*)?)["'](\.{1,2}\/[^"']+)["']/g))refs.push(m[1]);
 if(file.endsWith('.css'))for(const m of text.matchAll(/url\(["']?([^'"()]+)["']?\)/g))refs.push(m[1]);
 for(const ref of refs){
  if(/^(#|https?:|mailto:|data:|blob:)/.test(ref))continue;
  const local=ref.split(/[?#]/)[0];
  const target=local.startsWith('/')?path.resolve(release,'.'+local):path.resolve(path.dirname(file),local);
  assert.ok((target===release||target.startsWith(release+path.sep)),'Reference escapes package: '+relative+' '+ref);await access(target);
 }
}
const html=await readFile(path.join(release,'index.html'),'utf8');
assert.match(html,/<h1[^>]*>Vince Doud/);assert.match(html,/<html[^>]*lang="en"/);assert.match(html,/name="viewport"/);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate element IDs');
const manifest=JSON.parse(await readFile(path.join(release,'selected-art/manifest.json'),'utf8'));
assert.equal(manifest.items.filter(item=>item.display==='wall').length,13);
for(const item of manifest.items){
 if(item.display!=='wall'){assert.deepEqual(Object.keys(item).sort(),['display','index']);continue;}
 await access(path.join(release,'selected-art',item.file));
 for(const view of item.views||[])await access(path.join(release,'selected-art',view.file));
}
const inventory=JSON.parse(await readFile(path.join(root,'.release/studio-review-manifest.json'),'utf8'));
assert.equal(inventory.tracks,91);
console.log(`PASS: ${shipped.length} runtime files, local module/HTML/CSS references, 13 displayed artworks, 91 tracks, no QA/source/archive/environment files.`);
