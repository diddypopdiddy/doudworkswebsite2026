# Basement Disc video library

Selected direction A, integrated September 27, 2026. User confirmed the classic **4:3** screen shape. Local candidate only; nothing published.

Preview: http://127.0.0.1:8000/qa-evidence/studio-experience-v2/?v=basement-4x3-v2#video

## Menu and player

- Play All opens the 66-video collection in upload-date order, using YouTube's documented playlist parameter. It starts only after an explicit Play All click. Native YouTube playback may still require another play gesture if the browser blocks autoplay.
- Chapters → Covers → alphabetical artists → songs → song/release information → Play. Woodbury and Archive are separate chapter groups. Artist and song/release search and pagination remain available. No video-preview thumbnails appear in the authored menus.
- The compact remote provides arrows/OK, Menu, Back, Chapters and fullscreen. Mouse and keyboard navigation remain supported. Escape goes back through nested menus before closing the video room.
- `menu-painter.js` renders the approved studio scene and outlined lettering into a 720×540 canvas. Low-resolution scaling and scanlines apply only to that authored menu. No filters, texture layers, rounded masks or overlays cover the YouTube iframe.
- The physical Blender screen and YouTube viewport are both 4:3. YouTube keeps the video's intrinsic proportions and handles the necessary letterboxing/pillarboxing. No video is zoomed or cropped to fill the screen.
- The native YouTube player and branding remain visible. Captions outside the player include channel credit and a direct Watch on YouTube link. Play All has external Previous/Next controls for advancing past an unavailable item. The optional IFrame API keeps the caption in sync with the native playlist; if unavailable, the native embed remains usable.
- Leaving the video room destroys the embedded player. Browser Back/Forward and direct video links remain supported.

## Sources and preservation

- `library.js`, `library.css`, `menu-painter.js`: live interaction and presentation.
- `catalog.js`: 62 EL LOBO videos (60 covers and two archived TV performances) plus four requested Woodbury selections. No video media downloaded or rehosted.
- `source/build_catalog.py`: regenerate metadata from recorded public snapshots, not a live channel refresh. Release matches and source URLs are in `source/catalog-provenance.json`.
- `source/build_tv_4x3.py`, `source/tv-4x3.blend`, `tv-4x3.png`: non-destructive adaptation of the original TV model to a true 9.6×7.2 display. Registration is in `source/tv-4x3-registration.json`. Original 16:9 model and render retained.
- Design lineage: `design-drafts/dvd-2004-menu-2026-09-27/` in the website workspace. A/B/C mockups remain unchanged.
- Recoverable pre-change candidate: `archives/before-basement-dvd_2026-09-27.zip`.

## Remaining catalog limits

The last HERD refresh found S.L.A.G. Song, My Lesson Plan, Fake Love and Mrs. Dunham retirement. Requested Mr. Jones retirement, Justin Timberlake and Woodbury yearbook archive were not found. Mrs. Dunham Day is also public but has not been added alongside the retirement video without the user's selection.

Three cover releases remain explicitly unconfirmed: Bei Mir Bist du Schon, Life on the Wildside and The Watusi. Some supplied album/release matches are compilations or EPs; upload dates do not represent release years.

Public watch-page metadata is not proof that every embed plays. Earlier checks found Balaclava drums unavailable inside YouTube. The current player preserves YouTube's own error UI and supplies a direct link; a full 66-video playback audit has not been performed.

## Verification

Current checks: `qa/basement-check.cjs` and `qa/aspect-playback.cjs`. Evidence is written to `qa/basement/`. Earlier `qa/check.cjs`, `qa/remote-check.cjs`, `qa/smoke.cjs` describe the superseded widescreen menu and are retained as historical evidence.

The aspect check inspects the original YouTube video geometry and frame dimensions to distinguish an actual 4:3 viewport with fitted video from a stretched screenshot. The menu check exercises remote selection, album search, nested Back/Escape, Play All queue assembly, next-item selection, fullscreen, four viewport widths, no player overlay/filter and player cleanup. The menu/layout suite passed at 1440, 1024, 390 and 320px, with no JavaScript page errors. The 11 existing music tests also passed. Read the separate playback result for live-video coverage.

References: [YouTube playlist parameter](https://developers.google.com/youtube/player_parameters#playlist), [IFrame API](https://developers.google.com/youtube/iframe_api_reference), [player appearance requirements](https://developers.google.com/youtube/terms/required-minimum-functionality#youtube-player-attributes).

Live aspect verification: My Lesson Plan advanced to 3.1 seconds without a media error. YouTube fitted its 640×360 source into an 801×451 video rectangle inside the 801×601 player, leaving 75px black bars above and below. No cropping or stretch was introduced. Full 66-video automatic progression was not watched end to end.


## In-app playback follow-up — September 27

The user reported blank TV playback. Reproduced in the Codex in-app browser: My Lesson Plan's native frame stays at about:blank. A separate static page (`qa/embed-probe.html`) with standard and privacy-enhanced YouTube embeds, without gallery code or TV styling, also stays blank. This isolates the observed symptom from the TV component; the underlying browser/network cause is not established. The earlier successful live-playback evidence came from headless Brave, not this in-app browser.

All videos now use the optional IFrame API readiness observer, while keeping the native iframe independent. After 15 seconds without readiness, the caption offers retry/browser guidance. Native errors and autoplay blocking also surface guidance outside the player. Retry creates a fresh iframe; leaving playback clears the readiness timer. The 4:3 geometry and unobscured native video remain unchanged. The timeout and retry were verified in the in-app browser; successful playback there remains unresolved.


## Play All identity and embed audit — September 27 follow-up

See `qa/PLAYBACK-INVESTIGATION.md`. All 66 IDs matched YouTube oEmbed titles. Play All now uses one iframe/video ID at a time, with site-owned queue progression, stale-event guards and no native playlist parameter. A public embed-status audit returned 36 OK and 30 UNPLAYABLE; `embed-availability.js` records the latter and excludes them from Play All while retaining explicit YouTube links in Chapters. Eight queue regression tests pass (`node --test video-library/qa/playback.test.mjs`, from the candidate directory). This audit does not prove successful playback of every video. The original source metadata's `embeddable: true` is historical metadata, not a runtime guarantee.
