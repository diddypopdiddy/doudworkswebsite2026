"""Build curated local metadata from read-only YouTube and Apple Music snapshots."""
import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
TMP=ROOT/'source'
raw=json.loads((TMP/'el-lobo-metadata.json').read_text());lookups=json.loads((TMP/'release-lookups.json').read_text());all_tracks=[r for rs in lookups.values() for r in rs if r.get('kind')=='song']
def norm(s):return re.sub(r'[^a-z0-9]','',s.lower().replace('&','and').replace('the ','').replace('thousand','1000'))
def clean_song(s):return re.sub(r'\s*[\[(].*','',s).strip()
preferred={
 'Ribbon in the Sky':'Original Musiquarium','Rasputin':'Nightflight to Venus','Sunny':'Sunny','If You Want Me To Stay':'Fresh',
 "Bip Bop Link":'Wild Life',"I'm Not Talking":'The Yardbirds Story',"Chris\' Number":'The Yardbirds Story',
 'Winchester Cathedral':'British Invasion Greatest Hits','Sir Duke':'Songs in the Key of Life',"Walk Don't Run":"Walk Don't Run",'Girl':'Rubber Soul','Michelle':'Rubber Soul',
 'Words of Love':'The Mamas & the Papas','Daughters':'Heavier Things','I Say a Little Prayer':'Reach Out','While You Wait For The Others':'Veckatimest','In My Room':'Surfer Girl',
 'Meeting Place':'The Age of the Understatement','hey momma':'Kay Kay and His Weathered Underground','Cornerstone':'Humbug','The Fire & The Thud':'Humbug',
 'Cherry Lips (Go Baby Go)':'Beautiful Garbage','Alvin':'The Birds, The Bees & The Monkees','Pretty Visitors':'Humbug',
 "It's gonna be Alright":"A's B's & EP's",'View from the Afternoon':"Whatever People Say",'Sleep Forever':'In the Mountain', 'Chicago':'Waiter:', 'Sun Brother':'Church Mouth'
}
clip_ids={'j0MtAxLfrtw','93nt8UgXGgU'}
entries=[]
for v in raw:
 if v['id'] in ['t-7kiwuzXPw','bKPvgHamBiE','iFidw52_eHY']:
  v['artist']='Standards & soundtracks';v['song']=v['title'].removesuffix(' cover');candidates=[]
 else:
  candidates=[r for r in all_tracks if (norm(r['artistName'])==norm(v['artist']) or (v['artist']=='Paul McCartney & Wings' and r['artistName']=='Wings')) and norm(clean_song(r['trackName']))==norm(clean_song(v['song']))]
  prefer=preferred.get(v['song'],'')
  candidates.sort(key=lambda r:(0 if prefer and prefer.lower() in r['collectionName'].lower() else 1, bool(re.search('live|karaoke|instrumental',r['trackName'],re.I)),bool(re.search('greatest|essential|best of|gold|hits|collection|deluxe',r['collectionName'],re.I))))
 r=candidates[0] if candidates else None
 if v['id']=='t-7kiwuzXPw':r=next(x for x in lookups['Chim Chim Cher ee'] if x['collectionName']=='Mary Poppins (Original Motion Picture Soundtrack)' and x['trackName']=='Chim Chim Cher-ee')
 release=r['collectionName'] if r else None
 if release:release=re.sub(r'\s*\((?:Bonus Track Version|Deluxe Edition|2015 Remaster)\)|\s*\[2018 Remaster\]','',release).strip()
 entries.append(dict(id=v['id'],title=v['title'],song=v['song'],artist=v['artist'],collection='archive' if v['id'] in clip_ids else 'covers',performance='Archived TV performance' if v['id'] in clip_ids else 'Drum cover' if 'drum' in v['title'].lower() else 'Cover performance',release=release,releaseSource=r.get('trackViewUrl') if r else None,genre=r.get('primaryGenreName') if r else None,duration=int(v['duration']),date=v['dates']['uploadDate'][:10],channel='EL LOBO',channelUrl='https://www.youtube.com/@diddypopdiddy',embeddable=v.get('embeddable'),sourceUrl='https://www.youtube.com/watch?v='+v['id']))
herd=json.loads((TMP/'woodbury-metadata.json').read_text())
for v in herd:
 # Use the retirement video for the requested Mrs. Dunham selection; the additional Day film is pending their choice.
 if v['id']=='wcIyQdpqpIY':continue
 title=v['title'];song={'to_zBCm_o8g':'My Lesson Plan','DprNcY86Coo':'Fake Love','V41fqY6B2Bs':'Mrs. Dunham — Happy (Retirement)','BWTXYswihYU':'The S.L.A.G. Song'}.get(v['id'],title)
 entries.append(dict(id=v['id'],title=title,song=song,artist='Woodbury',collection='woodbury',performance='School music video',release=None,releaseSource=None,genre=None,duration=int(v['duration']),date=v['dates']['uploadDate'][:10],channel='Woodbury Herd Video Archive',channelUrl='https://www.youtube.com/@HERDvideoarchive',embeddable=v.get('embeddable'),sourceUrl='https://www.youtube.com/watch?v='+v['id']))
info={'checked':'2026-09-27','elLoboPublicVideos':62,'woodburySelections':len(entries)-62,'elLoboPaginationComplete':True,'woodburyPending':['Mr. Jones retirement','Justin Timberlake','Woodbury yearbook archive'],'releaseMetadata':'Matched Apple Music/iTunes track listings; unresolved releases remain explicitly unconfirmed.'}
(ROOT/'catalog.js').write_text('export const catalogInfo = '+json.dumps(info,ensure_ascii=False,indent=2)+';\nexport const videos = '+json.dumps(entries,ensure_ascii=False,indent=2)+';\n')
(ROOT/'source/catalog-provenance.json').write_text(json.dumps({'info':info,'videos':[{'id':v['id'],'title':v['title'],'sourceUrl':v['sourceUrl'],'release':v['release'],'releaseSource':v['releaseSource'],'embeddable':v['embeddable']} for v in entries]},ensure_ascii=False,indent=2)+'\n')
print('Videos',len(entries),'Covers',sum(v['collection']=='covers' for v in entries),'Sourced releases',sum(bool(v['release']) for v in entries))
print('Unconfirmed',[(v['artist'],v['song']) for v in entries if not v['release'] and v['collection']=='covers'])
