# Vince Doud studio draft review — September 30, 2026

The active studio candidate is `qa-evidence/studio-experience-v2/`. Its artwork, room illustration, compact two-room gallery, iPod and DVD presentation are preserved. The polished candidate is on `codex/studio-polish-2026-09-30`; no production deployment was performed.

## Changes

- One Explore menu across all eight spaces, matching desktop/mobile category order, a working header home button, current destination indication and visible keyboard focus.
- Repeated category selection retains the current project. Escape closes nested gallery/video views before the studio; mobile menus, history, interrupted gallery loading and return focus were checked.
- Public project links are the default even on localhost. Optional registered local review links require `?local=1`. Missing previews have deliberate typography. The Moving Image and Write with AI carry accurate Work in progress notes. Clinical access is labeled Staff sign-in and keeps its existing protection. SK8MAPS has no private workspace link.
- Contact drafts survive in-page navigation. The form opens an email draft in the visitor's mail app; nothing is sent by the website.
- All 13 artworks remain accessible during 3D loading and through Simple view on failure. Loading/failed 3D controls now reflect availability.
- DVD status distinguishes iframe readiness from actual playback. Retry and a matching direct YouTube link remain available. A regular Brave browser played the selected video; this environment's in-app iframe remains unable to play.

## Verification

34 Node tests pass for click wheel/library imports, navigation/collision, current gallery inventory and video queue/playback events. Runtime syntax checks, `git diff --check`, release build and package validation pass. Browser evidence contains 106 passing checks; three stale test assertions were corrected with their reasons recorded. No unresolved product failure was found in these flows.

Desktop and emulated 390/320px QA covered all eight spaces, both gallery rooms, all 13 artwork viewer images, photo controls, missing-model fallback, nested/repeated Escape, mobile overflow, history, repeated/interrupted transitions, 91-song/10-album library, real audio playback/automatic advance/seek/pause/volume, contact draft retention and external action identity. Real Brave YouTube video playback and Next identity were verified. These are browser/emulated-mobile checks, not a physical-device or full screen-reader audit; not every catalog video was played.

Evidence: `qa-evidence/studio-experience-v2/qa/polish-2026-09-30/`. The JSON records the resolved assertions and console output. Screenshots include `release-gallery-brave.jpg`, `brave-video-playback.jpg`, `release-artwork-mobile320.jpg`, `ai-mobile-320.jpg` and `fallback-mobile-320.jpg`.

## Preview and release route

Source preview: http://127.0.0.1:8000/qa-evidence/studio-experience-v2/

Root-hosted release preview: http://127.0.0.1:8001/

Build with `node tools/build-studio-release.mjs`, then validate with `node tools/check-studio-release.mjs`. The build produces `.release/studio-review/` (170 runtime files) and a separate hash inventory. It excludes QA, archives, tooling, source artwork originals, retired art, source-path provenance and unrelated projects. It relocates current runtime/media references for root hosting and preserves `CNAME`, `.nojekyll`, a return-home 404 and robots file.

Existing GitHub Pages uses the public repository's `gh-pages` branch at `/`, custom domain `www.vincedoud.com`. Deployment requires a separately authorized review and update of that branch with the validated runtime package. This draft branch does not trigger Pages. Do not copy the entire development checkout to production.

The current textbook has human accessibility/safety/transcript release reviews outstanding; no stale public pilot is substituted. Write with AI's live AI response preparation remains WIP. The clinical platform requires authorized staff. These constraints do not prevent portfolio publication with its accurate labels.

For longer-term separation, develop and back up private project work separately, and publish only the approved website runtime into the current public Pages repository. This would need a specific migration decision. Browser-delivered JavaScript and media remain public. No repository visibility, history, account plan or deployment changes were made.

## Artwork photo selection follow-up

Per owner request, Strategy, America #1 and America #2 show only their main Artwork image. Removed viewer options: Raised objects, Hardware and bands, Rubber-band detail, Right side and Left side. Original detail image files remain recoverable in source and Git history; they are excluded from the current runtime package. Actual preview clicks verified all three main images load with no photo controls, unaffected Stolen loads and the 13-work inventory remains unchanged. Evidence: `qa/polish-2026-09-30/artwork-only-checks.json`.
