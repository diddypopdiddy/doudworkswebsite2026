# Shared image-generation recipe

The built-in image-generation path was used, with one call for each distinct asset.

## Object isolation recipe

```text
Use case: background-extraction
Asset type: registered object layer for a layered website room scene
Input image: Image 1 is the edit target and strict camera, spatial, scale, material, and lighting reference.
Primary request: Keep only [NAMED OBJECT OR ASSEMBLY] from Image 1. Remove the room and every other object. Preserve the retained subject's recognizable design, details, proportions, orientation, elevated bird's-eye three-quarter view, and original location.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key field.
Composition/framing: exact 1536x1024 landscape frame. Do not crop, recenter, enlarge, rescale, rotate, or move the retained subject.
Style/medium: detailed realistic miniature architectural visualization identical to Image 1.
Constraints: no cast shadow, contact shadow, floor plane, wall, rug, gradient, texture, reflection, text, watermark, or new prop. Keep holes and negative spaces between legs and hardware. Do not use #00ff00 in the subject.
```

The named assemblies were: both rugs; art table/materials/stool; stereo cabinet/turntable/records/speakers; bookshelf/books/plant; whiteboard; three skateboards; desk/chair/laptop; drum kit/throne; keyboard/stand; organ/bench; guitar/stand/amplifier; camera/tripod; and softbox/stand.

## Empty shell recipe

```text
Use case: precise-object-edit
Create the empty room shell from Image 1. Remove every movable and wall-mounted object, both rugs, and all object/contact shadows. Reconstruct the exposed red patterned floor and pale masonry walls naturally. Preserve the exact 1536x1024 framing, elevated bird's-eye three-quarter camera, wall geometry, room footprint, perspective, scale, crop, black exterior surround, warm neutral lighting, palette, and material textures. Add nothing.
```

## Shadow matte recipe

```text
Use case: background-extraction
Extract only the soft floor and wall contact shadows from Image 1 in their exact coordinates. Remove objects, architecture, textures, rugs, props, and colors. Render neutral gray/black shadow shapes on pure uniform #ffffff. Preserve the original upper-left light direction and soft falloff. Do not move, crop, recenter, simplify, or invent shadows.
```
