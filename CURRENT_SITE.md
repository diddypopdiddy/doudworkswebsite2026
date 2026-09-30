# Current Website State

Updated: 2026-09-27. Active candidate remains local and unpublished.


## AI and Teaching refresh — September 27

- AI now features exactly AI Educator Playbook, The AI Road Test, and Write with AI, in that order. The Playbook includes the Framework and Field Guide; their old deep links open the Playbook.
- Teaching now features The Moving Image (the current interactive textbook checkout) and a SK8MAPS overview. Agentic Continuity and Lesson Planner App are removed from this selection; their old routes open SK8MAPS.
- Local portfolio buttons open the current registered previews: Playbook 4194, Road Test 5173, Write with AI 4178, textbook 4210. Published AI editions are separate secondary links. On non-loopback hosts, local links are suppressed. The latest textbook has no public release link; its public rendering explains local-review availability.
- SK8MAPS is described from its current README and product sources. No classroom records, private screenshots, or workspace access link are included.
- Write with AI's current health route reports AI_NOT_CONFIGURED. Its local link includes a readiness note; no successful live chat is claimed.
- Verified: 15 browser project/layout checks across 1440, 390, and 320 px; all project images loaded; old project routes resolve; Escape returns home; no browser page errors. Four current local project entry pages returned HTTP 200 and were captured. This is entry-page verification, not full app-flow QA. Evidence: `qa-evidence/studio-experience-v2/qa/ai-teaching-2026-09-27/`.
- Source: `qa-evidence/studio-experience-v2/`; legacy root pages are unchanged. Prior files preserved in `archives/before-ai-teaching-refresh_2026-09-27.zip`. No publication.

## Active portfolio candidate

- **Current gallery, final September 27 pass:** only13 hung works are viewable across two rooms. The studies portfolio and Studies controls are removed. Retired source indices7–14 are hidden from the3D room, artwork list, next/previous stream, Simple view, fallback and old detail links. Artwork sources remain preserved offline. Current preview: `http://127.0.0.1:8000/qa-evidence/studio-experience-v2/?v=final-gallery-v6b#art`.
- Quality fixes: all13 track-light stems now align with real ceiling rails; list numbering is contiguous01–13; empty story space is removed; Simple-view focus returns to visible controls; repeated Escape closes the artwork viewer reliably before exiting the room. Historical renderer query switches are disabled in the active entry.






- September 27 daily whiteboard: approved handwritten opening-board mockup is mapped into the original whiteboard by `homepage-whiteboard.js`. Sample text remains fixed as approved: Monday, Sept. 28; Learning objective: Make one intentional revision to your project; Do now: Open your current project. Teaching highlight and destination retained. Original room image intact. Browser placement, keyboard route/return, resize scaling, and console checked. Evidence: `qa-evidence/studio-experience-v2/qa/daily-whiteboard-2026-09-27/`. Checkpoint: `archives/before-daily-whiteboard_2026-09-27.zip`. Local only.

- September 26 expanded homepage highlights: organ, guitar, and amplifier share the existing drums/keyboard Music highlight and destination; studio light/stand shares the camera Video highlight and destination. `homepage-hotspots.js` uses SVG outlines over the unchanged room image and matching clickable outlines. Browser-verified hover on all seven objects, plus added instrument routes and camera/light Video routes. Evidence: `qa-evidence/studio-experience-v2/qa/expanded-highlights-2026-09-26/`. Prior source preserved in `archives/before-expanded-homepage-highlights_2026-09-26.zip`. Local only; the September 27 DVD library supersedes the former Video placeholder.

- September 20 homepage refinements: original Loretta photo is perspective-mapped onto the foremost art-table board by `homepage-art.js`; source room and artwork images remain intact. Desktop Projects now opens the six-category disclosure. Object highlights include readable destination labels, clamped to the visible viewport. Desktop and phone browser checks covered artwork placement, labels, menu keyboard order/Escape, Music selection, Art entry, and return focus. Evidence: `qa-evidence/studio-experience-v2/qa/homepage-refinements-2026-09-20/`. Recoverable prior homepage: `archives/before-homepage-refinements_20260920-191937.zip`. Local only.

- Source: `qa-evidence/studio-experience-v2/`.
- Gallery: `http://127.0.0.1:8000/qa-evidence/studio-experience-v2/#art`.
- Default is the compact two-room gallery: Main room approximately18×20ft and Flag room approximately12×14ft, with a 2.8m ceiling. The former rear room is removed and its doorway is a solid wall.
- Model/source: `gallery-compact/`; runtime: `gallery-walk/gallery-compact-ui.js` and `compact-environment.js`.
- All16 frozen picker selections remain: 1, 2, 7, 9, 10, 23, 24, 28, 36, 64, 65, 67, 78, 101, 105, 128.
- Main room holds8 wall works, including Loretta and Swing and Miss. Flag room holds Stolen directly ahead of the doorway, America #1/#2 on one side wall and Flag composition/Strategy on the opposing wall. No studies object or study artwork is displayed.
- Level drag-to-turn, WASD/arrows, floor-click and room-route walking, full artwork viewer, and Simple view remain.
- Repaired coplanar wall end caps, overlapping lintels and facade piers. Artwork anchors are raycast from inside the room onto the exposed wall face. Thirteen visible charcoal track-light heads aim at the artwork, with warm emissive lenses and softer spotlights. Reduced ambient fill; removed invisible per-room point lights.
- Unframed wood/canvas sides, thin paper supports/fasteners, paper curl, and wall contact shading. No picture-frame meshes. Genuine storefront openings with a photographic exterior plate; exterior is not an explorable street.

## Artwork dimensions and identity

- Retired source record, hidden from the current gallery: Picker78 is the actual handmade clock **The Third Sibling**, not its documentation photograph. Owner confirmed approximately12in diameter. Model has a round support and alpha-textured face.
- Transparent presentation derivative: `selected-art/third-sibling-cutout.png`, created with built-in ImageGen background extraction. Prompt and provenance are alongside it. Original `pick-013.jpg` remains intact.
- Wood panels #1/#7/#10: 48×12in. Small dots #2:24×24in. Two larger dot canvases #23/#24:36×36in.
- Graphite #28/#36: approximately24×36in paper. Collages #64/#65/#67: approximately9×11in paper.
- Unconfirmed photo presentation sizes: Get Down #101/#105 now11in wide with original ratio (~20.84in high); Swing and Miss #128 remains24×7.75in. Flag #9 remains24×17.28in. These are estimates, not owner measurements.
- Figure/sky source photograph has different proportions from the stated48×12in support. The model follows the owner dimension; full-image viewer preserves original-photo ratio. Whether the photo is a detail remains unresolved.
- `selected-art/manifest.json` is the active size/title mapping; frozen picker catalog numbers are unchanged. No source JPEG derivatives were overwritten.

## Verification and preservation

- Eight compact gallery checks pass: two-room footprint, room routes, stable source identities, wall support spacing, viewing positions, retired-art exclusion, dimensional-work metadata, and Stolen/opposing-wall arrangement.
- Independent saved-mesh audit verifies the closed envelope, continuous storefront, no overlapping supports and connected rooms.
- Final GLB SHA256: `cee6fd946932ae9c154ec0c7fc0475d97a5842ac572647ebc36b423118d7b42c`.
- Local route HTTP200 and final module routing verified. September 7 wall/light correction rendered and visually checked in an isolated headless browser. Main-view striped artwork click verified. Saved-mesh wall/fixture audit passes, including a negative control recreating the original defect. See wall-lighting QA notes for browser walkthrough results.
- Wall/light checkpoint: `archives/before-wall-joins-track-lights_2026-09-07.zip`.
- Checkpoint: `archives/before-compact-gallery_2026-09-07.zip`. Prior four-room model remains in `gallery-refined/`, accessible with `?gallery=spacious#art`; earlier placeholder walk with `?gallery=legacy#art`; corner study with `?gallery=corner#art`.
- Prior physical-size checkpoint: `archives/before-actual-size-unframed_2026-09-07.zip`.
- Artwork picker: `http://127.0.0.1:8000/qa-evidence/artwork-picker-v1/`;173 fixed preview numbers map to211 One Touch files.
- Room homepage, music 91 tracks / 10 albums, Teaching and AI remain in this candidate. Root legacy/coming-soon source was not changed or published by this work.

## Basement Disc A and 4:3 playback — September 27

Supersedes the initial widescreen DVD menu below. User selected A and explicitly confirmed the squarer 4:3 TV shape.

- Active local video preview: `http://127.0.0.1:8000/qa-evidence/studio-experience-v2/?v=basement-4x3-v2#video`.
- Approved studio-scene design: outlined yellow/white lettering, SD menu texture, Play All then Chapters, Covers/artist/song hierarchy, Woodbury and Archive. Menu previews are removed. Smaller remote remains usable alongside mouse/keyboard.
- New editable Blender `video-library/source/tv-4x3.blend` and registered `tv-4x3.png`. Original 16:9 model preserved. The native player uses a 4:3 viewport and keeps original video proportions with bars where needed. Authored menu effects are removed entirely during playback.
- Play All passes the 66-video collection in upload-date order to the native YouTube playlist. External Previous/Next and direct YouTube links remain available. Catalog gaps and known YouTube embed restrictions remain as documented in `video-library/README.md`.
- Backup: `archives/before-basement-dvd_2026-09-27.zip`; immutable design alternatives and selection record: `design-drafts/dvd-2004-menu-2026-09-27/`.
- Current verification scripts and evidence: `video-library/qa/basement-check.cjs`, `qa/aspect-playback.cjs`, `qa/basement/`. Local and unpublished. Unrelated Teaching/AI changes in shared entry files preserved.

## Video library and DVD remote — September 27

- Local preview: `http://127.0.0.1:8000/qa-evidence/studio-experience-v2/?v=dvd-remote-v2#video`. Source: `video-library/`. Not published.
- Original Blender TV with a substantial bezel, speaker grille, physical button details and pedestal. Its HTML screen holds a DVD menu: Covers → alphabetical artists → songs/release details → original YouTube player. Editable Blender source retained.
- On-screen remote has directional arrows, OK, Menu, Back, Covers and fullscreen. Mouse and keyboard remain available. Desktop remote sits beside the TV; mobile uses a compact fixed controller and reserves scrolling space below content.
- Catalog: all 62 public EL LOBO video entries found in the complete paginated Videos listing (60 covers plus 2 archived TV performances), and 4 selected Woodbury videos: S.L.A.G. Song, My Lesson Plan, Fake Love, Mrs. Dunham retirement. Refreshed HERD listing has 140 public entries. Mr. Jones retirement, Justin Timberlake and Woodbury yearbook archive were not found. Mrs. Dunham Day is also public but awaits the user's choice about including both Dunham videos.
- Album/release metadata uses recorded Apple Music listings. Three cover releases remain explicitly unconfirmed. No video media copied or rehosted; embeds keep native YouTube controls, no autoplay and a direct YouTube fallback link.
- Browser checks passed for remote-only selection, mouse, keyboard, artist pagination/search, Back/Escape, mobile 390/320px layouts, minimum player size and iframe cleanup. Representative Woodbury playback advanced; one Balaclava drum embed reported unavailable despite watch-page metadata permitting embedding. Full-catalog playback is not verified. See `video-library/README.md` and `video-library/qa/`.
- Prior candidate preserved in `archives/before-video-library_2026-09-27.zip`. Gallery and iPod remain separate; 11 music tests passed.

## Earlier source boundaries

`qa-evidence/studio-highlight-pack-v1/` is an earlier preserved candidate. The root website remains a separate older source and must not be treated as the active portfolio design or published without user authorization. The shared local launcher serves this workspace on port8000; its old root-page marker check does not represent candidate readiness.

## Historical gallery changes — superseded where noted

### Loretta addition — September 19

- Owner-confirmed title **Loretta**, year **2018**, medium **Oil pastel on board**, size **32 × 32 in.**
- Seventeenth artwork (index 16), appended after the sixteen frozen picker selections; no picker number assigned. Main room now displays eight works.
- Original supplied photo copied intact to `selected-art/loretta-2018.png`; full-image viewer retains it. Wall face uses artwork corner UV coordinates and a 0.8128 × 0.8128 m board. Board thickness is a provisional 6 mm.
- Recoverable prior gallery: `archives/before-loretta_2026-09-19.zip`. Local candidate only; not published.
- September 19 verification: five Node gallery checks, saved-mesh audit, wall/light audit, and headless Metal browser wall-click/viewer/Simple-view checks passed. Wall and viewer screenshots visually inspected in `gallery-compact/qa/loretta-*.png`. Preview route returned HTTP 200; shared launcher root marker remains stale.

## Strategy and America additions — September 27

- Twenty total works. Existing indices0–16 and wall positions preserved. Added **Strategy** (index17), **America #1** (index18), **America #2** (index19) on the previously unused front wall of Photo & objects.
- Owner metadata: Strategy, objects on board,24 ×20in; America #1, paint/glue/rubber bands on canvas,40 ×30in ×1½in deep; America #2, flag/plastic bags on canvas,48 ×24in, approximately4in maximum depth. Dates remain unspecified.
- `gallery-compact/source/dimensional_art.py` builds actual photo-registered relief fronts with continuous photo-colored side walls/backings. Strategy has raised cross/band/hardware forms, America #1 raised band/paint relief, America #2 a bowed cloth surface. Physical dimensions are owner-supplied; local contours, Strategy's depth and individual base thicknesses are photo-based estimates.
- All8 supplied photographs copied byte-for-byte, hash-verified in `selected-art/dimensional-art-sources.json`. Viewer supports front and detail-photo selectors with EXIF-correct dimensions.
- Strategy's curved source-board outline is followed in texture coordinates to exclude background siding; America #1 uses a small paint-edge inset to exclude source background from its canvas sides. Source rasters are unchanged.
- Checkpoint: `archives/before-dimensional-art_2026-09-27.zip`; detail-viewer predecessor also preserved at `/tmp/studio-experience-v2-photo-controls-2026-09-27/`.
- Saved-model geometry, wall placement, lighting and six Node gallery checks passed. Browser checks include wall clicks,20 artworks, all8photo views, photo selection reset, keyboard focus, phone overflow and Simple view. Final close-angle evidence is in `gallery-compact/qa/dimensional-*-close-angle.png`. Local/unpublished.

## Gallery lighting and Strategy correction — September 27

This supersedes Strategy's initial front-wall placement and curved texture registration above.

- Strategy now hangs on the rear room's open right wall, away from the corner. Its board perimeter is planar; only the attached objects have localized relief. The saved-model audit checks the planar perimeter and rear-room assignment.
- `selected-art/strategy-gallery-v2.png` is an AI-edited presentation derivative with a straight rectangular board, removed photographic background, and even neutral lighting. Built-in ImageGen mode and the exact prompt are recorded in `selected-art/strategy-gallery-v2-edit.md`. It is not an untouched documentary photograph. The original remains intact and accessible as the viewer's fourth photo.
- Reduced daylight intensity, lowered the three new works' spotlights, and increased their material roughness to reduce glare. America #2 retains its deliberate fabric bulge and all works retain physical side walls.
- Recoverable checkpoint: `archives/before-gallery-lighting-strategy-fix_2026-09-27.zip`.
- Verification: six Node checks, all three Blender saved-model audits, and headless browser interaction checks passed. Front/side screenshots visually inspected for Strategy and the flags. Browser checks cover all nine presentation/detail photos, wall clicks, twenty-work list, selection reset, keyboard focus, mobile overflow, and Simple view. Evidence: `gallery-compact/qa/lighting-v2-*`. Local preview only; not published.

## Two-room curation and clean artwork — September 27

- Stable source indices retained: wall 0–6 and15–19; portfolio7–12; hidden13–14. Only the12 wall records produce artwork meshes, supports and track lights. Both Get Down records have no physical display, navigation entry, simple-view inclusion or usable detail deep link. Original source assets remain preserved.
- Physical `STUDIES_PORTFOLIO` stands at the main room's rear-left wall with a handle and STUDIES label. Clicking it or the toolbar Studies button opens six portfolio entries; arrows remain within that collection and Back returns to its grid. The portfolio also works in Simple view.
- Background-free presentation PNGs: `selected-art/america-1-gallery-v2.png`, `america-2-gallery-v2.png`, and `loretta-gallery-v2.png`. These are AI-edited derivatives, not documentary originals. Built-in ImageGen mode and exact prompts are in corresponding `-edit.md` records. Loretta uses a square32×32in board and a1254×1254PNG; its original photograph is not shown in the viewer. Original full-photo options were also removed for Strategy and the flags; close-ups remain.
- All7 Node tests and all3 saved-model audits pass. The final headless browser check passed two-room selection,12-work list, all6 studies, physical portfolio click, cleaned artwork viewers, hidden Get Down route, mobile overflow, keyboard focus, and Simple-view/portfolio navigation. Screenshots visually inspected for main-room placement, portfolio, Loretta, and flags. Evidence: `gallery-compact/qa/two-room-v4-*`.
- Previous cutout-only checkpoint: `archives/before-flag-cutouts_2026-09-27.zip`; before-curation checkpoint: `archives/before-two-room-curation_2026-09-27.zip`. Local only; not published.

## Stolen and Flag room installation — September 27

Owner identified Stolen as oil on canvas,4×4ft,1½in deep. Copied original `lost baby.jpg` to `selected-art/stolen.jpg` without pixel edits and verified SHA256. Provenance is `selected-art/stolen-source.json`. The slightly nonsquare photograph is mapped over the owner-confirmed square canvas in the3D model; the detail viewer preserves the supplied photograph.

Stolen is centered on the outer wall at doorway axisz=0, normal(-1,0,0). America #1/#2 share the front wall; Flag composition/Strategy share the opposite back wall. Other room and portfolio placements remain. Current totals:13wall works,6portfolio works,2hidden source records. Recoverable checkpoint: `archives/before-stolen-flag-room_2026-09-27.zip`.

Eight Node checks and saved-model geometry/lighting/relief audits pass. Headless browser checked Stolen metadata/image, actual wall click, entrance view, both facing wall groupings,13-item wall list and mobile overflow. Entry and both wall screenshots visually inspected. Local only; not published.

## Final display-only gallery pass — September 27

Portfolio geometry, collider, exported metadata and controls are removed. Source records7–14 are hidden; only13 wall works can be opened. Studio entry always uses the current gallery rather than older renderer query variants. Source originals and recoverable prior models remain saved.

The independent review found floating track heads and a repeated-Escape native-dialog bug. Fixture source positions now match their ceiling rails, with a saved-model contact check; gallery Escape is handled before the browser's native dialog close behavior. Artwork list numbering, empty-description layout and focus return were cleaned up.

Validation:8Node checks;3saved-model audits; all13physical artwork wall clicks and images; independent30-check browser pass for exact inventory, all8retired deep links, both room traversals,320px/390px layouts, photo controls, keyboard focus, Simple view and forced3D-failure fallback. Repeated Escape regression also passes. Screenshots and logs: `gallery-compact/qa/final-gallery-v6-*` and `final-review-*`. Local desktop-browser/emulated-mobile checks; not a physical-phone test. Recoverable prior state: `archives/before-gallery-final-pass_2026-09-27.zip`. Local and unpublished.


### In-app YouTube playback limitation (September 27 follow-up)

The TV library's earlier live playback test was in headless Brave. The user reported blank playback in Codex's in-app browser, reproduced there both in the TV and in a standalone static YouTube embed probe. Added readiness timeout guidance, native error/autoplay guidance, and retry for individual videos and Play All. Timeout/retry verified in-app; actual in-app YouTube playback remains unresolved. Current candidate cache version: `playback-fix-v2`. No publication.

### Play All identity repair and embed audit

Current local video cache version is `queue-sync-v1`. Public YouTube oEmbed titles exactly matched all 66 catalog IDs. Play All now has a single site-owned selection per iframe instead of a native YouTube playlist with separate caption state. Public embed preview responses reported 36 OK / 30 UNPLAYABLE; known rejected items are excluded from Play All and remain accessible through explicit YouTube actions in Chapters. Eight focused queue tests and syntax checks pass. Live Brave testing is pending permission for a visible temporary tab; connected Brave tooling does not support a hidden tab. See `qa-evidence/studio-experience-v2/video-library/qa/PLAYBACK-INVESTIGATION.md`. No publication.
