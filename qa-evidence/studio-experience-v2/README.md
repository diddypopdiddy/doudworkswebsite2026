# Studio experience v2 — local review

Built September 5, 2026; albums and guided gallery added September 6; walkable gallery September 7. Local only; no deployment or root-site replacement.

Preview: http://127.0.0.1:8000/qa-evidence/studio-experience-v2/

## Preservation

The previous working candidate remains at `../studio-highlight-pack-v1/`.
`checkpoint.json` records every file hash from that version before this work.
The original room image and its object highlights are preserved.
The `highlight-pack` and older `qa` assets were inherited with the checkpoint;
new verification is recorded in `qa/experience-v2-verification.md`.

## Experience

- The room remains the homepage, with object destinations and direct phone-menu links.
- Each space moves the room toward the selected corner; Back to studio reverses it.
- Music has a CSS-rendered click-wheel player, hover and drag circular scrolling,
  keyboard and mouse-wheel navigation, center selection, menu, previous/next,
  playback, seek, volume, and a shared audio element that survives space changes.
- The player loads local audio files through object URLs. No upload occurs;
  files last only for this page session. They replace the demo playlist.
- Art opens a real Blender-built storefront gallery with four connected rooms.
  Drag left/right to turn with the horizon locked; WASD/arrows or the on-screen pad walk relative to the view.
  Click open floor to walk there, or choose a room for an automatic route through
  its actual doorways. Walls and furniture block movement. Click a work for a large
  uncropped artwork viewer with title and details below; Back restores your position.
  Twelve installed pieces reuse five clearly labeled placeholder images.
  Simple view supports previous/next/details; it is also the WebGL fallback.
  The shared music player continues across gallery entry and exit.
- Teaching and AI preserve existing project descriptions and destinations, with
  previews from the site's real project assets. Missing previews are labeled.
- Browser history and deep links retain project selections. Art positions use
  `#art/2`; Music uses `#music`; Teaching uses `#teaching/<project-id>`.
- Motion respects prefers-reduced-motion. The dialog contains navigation and
  playback controls; keyboard focus is restored when returning to the studio.

## Content replacement

`content.js` owns projects, preview filenames and the artwork list. It re-exports
tracks from `album-tracks.js`: 34 original songs across Happy Birthday To Me (7),
Fully Proper (16), and Right Here Ideas (11). Audio is copied byte-for-byte into
album folders under `audio/`; original ZIPs and extracted Downloads remain intact.
Track ordering follows each matching ZIP's entry order; these MP3s contain no ID3
tags. The supplied yard-sign, crib-camera, and snowman covers are copied intact under
`audio/covers/` and displayed in Albums and Now playing.

Albums opens an album-specific queue; All songs opens the entire library. Next and
Previous stay inside the selected queue. Automatic playback stops at the end of
an album; manually pressing Next on its final track wraps within that album.
The prior demo WAV files remain recoverable on disk but are absent from the player.

`qa/album-import-2026-09-06.json` records source paths, checksums and duration.
`qa/2026-09-06-before-albums/` preserves the prior player/source files.
The local file picker temporarily replaces the library for auditioning files;
reloading restores the permanent albums. Files are never uploaded by that picker.

For real art, use the user's disconnected artwork drive once available; confirm
its source folder first. `content.js` owns the base artwork metadata. Installations
in `gallery-walk/source/build_gallery_walk.py` currently map to it by `sourceIndex`.
Replace those mappings/images and placeholder flags, then rebuild the Blender model.
Keep ART_0 through ART_11 aligned with `room-manifest.json`. The manifest includes
installation positions/normals, room bounds, waypoints, and collision rectangles.
No narration is fabricated; audio controls appear only for supplied recordings.

## Blender gallery

- Active editable source: `gallery-walk/gallery.blend`.
- Rebuild from this directory with `/Applications/Blender.app/Contents/MacOS/Blender --background --python gallery-walk/source/build_gallery_walk.py`.
- Runtime: `gallery-walk/gallery.js` and `gallery-walk/navigation.mjs`, using local
  pinned Three.js 0.180.0 under preserved `gallery/vendor/` (MIT).
- Four rooms: Storefront, Middle room, Back room, Side room. Ceiling 3.6 m.
- Blender fixtures are calibrated for browser lighting by the runtime.
- Geometry loads only on Art entry; rendering stops when idle/hidden, and resources
  are disposed on exit. Asynchronous mounts are guarded against stale callbacks.
- Reduced motion removes automatic camera easing; user-requested walking remains.
- Original guided gallery is preserved under `gallery/`.
- Pre-rebuild archive: `../../archives/before-walkable-gallery_2026-09-07.zip`.
- Current refinement verification: `qa/gallery-refinement-2026-09-07.md`.
- Initial walkable verification: `qa/gallery-walk-verification-2026-09-07.md`.
- Local preview only. Publication remains a separate action.

## Checks

Run `node --test wheel.test.mjs library.test.mjs gallery-walk/navigation.test.mjs` for the 17 music and walking-navigation checks.
The shared launcher serves the correct workspace on port 8000, but its historical
root-marker check fails on the unrelated root generation. This candidate's route
and assets were verified directly; the external launcher registry was not changed.
