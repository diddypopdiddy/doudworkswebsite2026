# Controlled one-shot populated-room diagnostic v1

- Status: Stage B diagnostic only; not approved for integration.
- Empty-room edit target: `empty-room-shell-from-ed31-v1.png`
- Rough placement target: `full-room-from-object-map-v2-extended-shell.png`
- Generated result: `controlled-one-shot-populated-room-diagnostic-v1.png`
- Visual comparison: `controlled-one-shot-populated-room-diagnostic-v1-comparison.png`
- Reference atlases: `../../tmp/full-room-reference-boards/all-object-reference-atlas-v1.png` and `../../tmp/full-room-reference-boards/priority-object-reference-atlas-v1.png`
- Homepage, canonical layers, manifest, HTML, CSS, and JavaScript were not changed by this test.

The result was created in one built-in image-generation pass after consolidating
the existing reference boards and current priority object candidates into two
lossless atlases to satisfy the tool's five-image input limit.

## Visual comparison call

### Keep

- Fixed elevated bird's-eye camera, open-front room proportions, wall/floor
  geometry, and overall object-map composition.
- Two-rug layout, art station/stool/supplies, record console/speakers,
  bookshelf/plant, whiteboard, desk/chair/laptop, guitar/amp, and camera/tripod.
- Drum kit: complete cream kit, towel-covered shallow snare with one stick,
  throne, pedals, hardware, and three-cymbal arrangement survived the one-shot.
- Key light: the large octagonal modifier, ribs, rear head, full stand, and three
  grounded legs survived and read coherently in the room.

### Rebuild before any final integration

- Skateboards: keep the count, wall location, spacing, and three color families;
  rebuild the deck-face artwork because small graphic and lettering identity is
  softened.
- Keyboard: keep its map position and X-stand footprint; rebuild/rerender because
  the key count, control surface, right speaker grille, and body length compress.
- Organ: keep the foreground-left placement and separate black bench; rebuild or
  rerender because the two manuals and control panel lose identity at this size
  and the foreground-wall occlusion hides too much of the cabinet.

## Prompt specification

Populate the empty shell with every object in the complete reference atlas,
follow the rough object map, and give priority to the close-reference atlas for
the key light, drums, keyboard, organ, skateboards, and guitar rig. Preserve the
exact 1536 x 1024 elevated bird's-eye camera, room shell, open-front proportions,
warm-neutral upper-left light, exact listed counts, stands, benches, hardware,
and two rugs. Add no people, architecture, furniture, instruments, labels,
watermarks, or website UI.
