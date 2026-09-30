# Studio room asset pack

This directory contains registered render layers derived from the supplied studio-room reference. Every final PNG is `1536 x 1024`; place every layer at `x=0, y=0` without resizing to reconstruct the composition.

## Useful files

- `preview.html` — interactive visibility/solo preview
- `manifest.json` — machine-readable layer order
- `layers/` — final compositing PNGs
- `qa/composite-preview.png` — flattened reconstruction check
- `qa/layer-contact-sheet.png` — all layers on checkerboards
- `qa/validation-report.json` — dimensions, modes, bounds, and corner alpha
- `ASSET_SPEC.md` — locked camera and isolation rules
- `source/` — original supplied reference
- `chroma/` — generated chroma-key masters retained for future edge work

## Composition order

The manifest order is bottom-to-top: room shell, rugs, shadow matte, then the isolated objects. The contact-shadow layer is deliberately independent, so its opacity can be reduced or it can be disabled without changing any object asset.

## Generation method

The opaque room shell and every isolated object were created with the built-in image-generation workflow using the supplied reference as the strict spatial and style target. Transparent objects were generated on uniform chroma fields, keyed locally with a soft matte and despill, then registered onto full-size RGBA canvases. The shadow-only matte was converted from white to alpha locally.

## Rebuild QA

Run:

```sh
python3 build_and_validate.py
```

This validates the complete required set and refreshes the shadow alpha, composite preview, contact sheet, and JSON report.
