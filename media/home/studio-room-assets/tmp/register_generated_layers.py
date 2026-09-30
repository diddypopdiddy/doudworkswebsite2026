from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CANVAS_SIZE = (1536, 1024)

# Target bboxes are measured on the locked reference. The generated cutouts
# preserve the camera but arrived enlarged; fit each alpha silhouette back to
# its source registration without changing the master canvas.
TARGETS = {
    "02-art-station": (536, 112, 800, 383),
    "03-stereo-console": (815, 187, 1005, 407),
    "04-bookshelf": (1018, 314, 1117, 464),
    "05-whiteboard": (1125, 367, 1271, 550),
    "06-skateboards": (1285, 496, 1428, 690),
}


for stem, target in TARGETS.items():
    source = Image.open(ROOT / "tmp" / f"{stem}-keyed.png").convert("RGBA")
    bbox = source.getchannel("A").getbbox()
    if bbox is None:
        raise RuntimeError(f"No visible pixels in {stem}")

    cutout = source.crop(bbox)
    width = target[2] - target[0]
    height = target[3] - target[1]
    cutout = cutout.resize((width, height), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(cutout, (target[0], target[1]))
    canvas.save(ROOT / "layers" / f"{stem}.png", optimize=True)
