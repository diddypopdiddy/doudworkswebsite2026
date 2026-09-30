# Compact digital gallery

Current local gallery: **13 displayed works in two rooms**. The main room is5.5×6.1m; the Flag room is3.66×4.27m. The ceiling mesh is centered at2.8m, with the visible underside at2.74m. Navigation eye height is1.65m.

## Collection and layout

Main room displays indices0,1,2,4,5,6,15,16, including Loretta and Swing and Miss. Flag room displays Flag composition3, Strategy17, America #1 18, America #2 19 and Stolen20. Stolen faces the doorway; the Americas share one wall and Flag composition/Strategy occupy the opposite wall.

Only these13 works are accessible in the room, viewer, artwork list, next/previous stream, Simple view and fallback. The former portfolio object and UI are removed. Stable source records7–14 are hidden; their old detail routes return to the room. Original files remain preserved offline. The active entry no longer selects older gallery renderers through query parameters.

## Images and physical artwork

Owner-provided dimensions drive the physical supports. Strategy and both Americas have actual relief fronts with continuous sides. America #2 retains its approximate4in maximum bow. Unmeasured relief contours and support details are photo-based estimates.

Strategy, America #1/#2 and Loretta use versioned ImageGen presentation derivatives under `../selected-art/`, with prompts and provenance beside them. They are not untouched documentary photos. Original full-photo options are absent; supplied close-ups remain. Loretta is square32×32in. Stolen uses a byte-identical copy of the supplied photograph on a48×48×1½in canvas; source hash is in `stolen-source.json`.

## Implementation and quality checks

Builder: `source/build_compact_gallery.py`. Outputs: editable BLEND, portable GLB and `room-manifest.json`. Runtime: `../gallery-walk/gallery-compact-ui.js`, `compact-environment.js` and `navigation.mjs`. Approved plaster/brick/concrete/oak materials remain. All13spotlight stems physically meet ceiling rails.

Run `node --test ../gallery-walk/qa/compact-gallery.test.mjs`;8tests pass. Blender saved-model audits: `audit_compact_gallery.py`, `audit_wall_lighting.py`, `audit_dimensional_art.py`; all pass. The light audit checks stem/rail alignment as well as aiming and fixtures.

Final browser evidence: `qa/final-gallery-v6-wall-check.json` (all13wall clicks/images) and `qa/final-review-result.json` (30checks covering inventory, all8hidden routes, both rooms, mobile320/390, focus, photo controls, Simple view and forcedGLB-failure fallback). Repeated Escape is fixed in the enclosing `script.js` and covered by `final-review-escape` evidence. No uncaught browser errors in those checks. Mobile checks use browser emulation, not physical phones.

GLB SHA256: `cee6fd946932ae9c154ec0c7fc0475d97a5842ac572647ebc36b423118d7b42c`.

Recoverable prior state: website-root `archives/before-gallery-final-pass_2026-09-27.zip`. Local preview only; not published.
