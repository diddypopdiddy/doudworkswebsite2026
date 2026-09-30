# Studio highlight pack v1 — verification

Date: 2026-08-16  
Publication state: local-only; not deployed or published

## Passed

- Locked master copied byte-for-byte from the selected source.
- Master dimensions: `1522 x 1033`.
- Master SHA-256: `22a04f25dffb0c920efc76626a85b2574c7780de4e0fb6686dbc9e0da0681be5`.
- Resting browser state uses the master directly with `filter: none`, opacity `1`, zero visible highlight layers, and zero glowing-dot elements.
- Seven invisible whole-object targets and seven registered transparent overlays are present.
- Teaching, Work, About, Experiments, Music, AI, and Video each activate only their matching overlay.
- All seven targets retain their original portfolio-panel destination and expected panel title.
- Camera/tripod highlight does not include the softbox.
- Desktop review passed at `1440 x 900`.
- Mobile review passed at `390 x 844`, including horizontal scene panning and camera focus alignment.
- Browser console reported zero warnings or errors.
- Local candidate returned HTTP `200`.

## Scope notes

- The implementation is isolated under `qa-evidence/studio-highlight-pack-v1/`; the website root homepage was not replaced.
- No commit, push, deployment, or publication was performed.
- The shared launcher serves the candidate successfully, but its canonical-root content check is stale because it still expects the older `archive-room-2` marker.
