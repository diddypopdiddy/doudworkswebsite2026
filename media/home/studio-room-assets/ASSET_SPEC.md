# Studio Room Layered Asset Specification

## Locked source

- Reference: `source/studio-room-reference-1536x1024.png`
- Master canvas: `1536 x 1024` pixels
- View: the exact elevated bird's-eye / three-quarter orthographic-like camera in the reference
- Registration: every finished layer uses the full master canvas; compositing each PNG at `x=0, y=0` must preserve its intended position
- Lighting: warm neutral studio lighting from the upper-left of the image, matching the reference
- Material style: detailed realistic miniature architectural visualization, matching the reference

## Isolation rule

For each object layer, use the reference as the edit target. Keep only the named object or assembly. Remove the room and all other objects. Replace removed pixels with a perfectly uniform `#00ff00` chroma-key field. Do not move, rotate, rescale, redesign, crop, or recenter the retained object. Do not add floor planes, cast shadows, text, watermarks, or new props. Preserve openings and negative spaces between legs, stands, drum hardware, and furniture.

After generation, remove the chroma key locally and export a full-canvas RGBA PNG into `layers/`.

## Layer manifest

1. `00-room-shell.png` — walls and red floor only; remove every movable object, wall object, rug, and shadow.
2. `01-rugs.png` — both patterned rugs only.
3. `02-art-station.png` — white art table, tabletop art materials, and round stool.
4. `03-stereo-console.png` — record cabinet, turntable, vinyl records, and two wooden speakers.
5. `04-bookshelf.png` — small two-tier bookcase, books, and plant.
6. `05-whiteboard.png` — wall-mounted whiteboard and its frame/marker rail.
7. `06-skateboards.png` — all three wall-mounted skateboard decks.
8. `07-desk-station.png` — black desk, office chair, and open laptop.
9. `08-drum-kit.png` — full drum kit and drum throne.
10. `09-keyboard.png` — electronic keyboard and black X-stand.
11. `10-organ.png` — wooden organ/keyboard cabinet and matching bench.
12. `11-guitar-rig.png` — sunburst guitar, guitar stand, and amplifier.
13. `12-camera-tripod.png` — camera and its tripod.
14. `13-softbox.png` — octagonal softbox/light and its stand.
15. `14-contact-shadows.png` — shadows/contact grounding only, with no objects or room surfaces.

## Validation gates

- PNG is exactly `1536 x 1024`.
- Object layers have an alpha channel and transparent corners.
- No green fringe or green pixels remain around the object.
- The retained subject occupies the same coordinates and approximate silhouette as the reference.
- No unrelated objects, floor, wall, rug, or background are baked into an object layer.
- `00-room-shell.png` is opaque and contains no movable or wall-mounted objects.
- A composite preview is built as shell, rugs, contact shadows, then object layers in manifest order so shadows ground the objects without darkening them.
