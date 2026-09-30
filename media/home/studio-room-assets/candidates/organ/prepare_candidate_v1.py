#!/usr/bin/env python3
"""Crop the keyed organ render into a reusable master and inspection preview."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "10-organ-digital-replica-candidate-v1-alpha-full.png"
MASTER = ROOT / "10-organ-digital-replica-candidate-v1.png"
INSPECTION = ROOT / "10-organ-digital-replica-candidate-v1-inspection.png"

image = Image.open(SOURCE).convert("RGBA")
alpha = image.getchannel("A")
bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
if not bbox:
    raise SystemExit("No nontransparent organ pixels found")

padding = 36
left = max(0, bbox[0] - padding)
top = max(0, bbox[1] - padding)
right = min(image.width, bbox[2] + padding)
bottom = min(image.height, bbox[3] + padding)
cropped = image.crop((left, top, right, bottom))

# Place the crop on fresh transparent padding so the master has clean safe margins.
subject_bbox = cropped.getchannel("A").point(lambda value: 255 if value > 8 else 0).getbbox()
subject = cropped.crop(subject_bbox)
master = Image.new("RGBA", (subject.width + padding * 2, subject.height + padding * 2), (0, 0, 0, 0))
master.alpha_composite(subject, (padding, padding))
master.save(MASTER)

scale = min(1.0, 1120 / master.width, 760 / master.height)
preview_subject = master.resize(
    (round(master.width * scale), round(master.height * scale)), Image.Resampling.LANCZOS
)
preview = Image.new("RGBA", (1280, 900), (238, 238, 238, 255))
draw = ImageDraw.Draw(preview)
step = 32
for y in range(0, preview.height, step):
    for x in range(0, preview.width, step):
        if (x // step + y // step) % 2:
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=(205, 205, 205, 255))
x = (preview.width - preview_subject.width) // 2
y = (preview.height - preview_subject.height) // 2
preview.alpha_composite(preview_subject, (x, y))
preview.convert("RGB").save(INSPECTION)

print(f"source alpha bbox: {bbox}")
print(f"master size: {master.size}")
print(MASTER)
print(INSPECTION)
