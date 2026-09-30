#!/usr/bin/env python3
"""Prepare the three skateboard decks as a reusable Stage A master."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "06-skateboards-digital-replica-candidate-v1-alpha-full.png"
MASTER = ROOT / "06-skateboards-digital-replica-candidate-v1.png"
INSPECTION = ROOT / "06-skateboards-digital-replica-candidate-v1-inspection.png"
PADDING = 36

image = Image.open(SOURCE).convert("RGBA")
alpha = image.getchannel("A")
bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
if not bbox:
    raise SystemExit("No nontransparent skateboard pixels found")

subject = image.crop(bbox)
master = Image.new(
    "RGBA",
    (subject.width + PADDING * 2, subject.height + PADDING * 2),
    (0, 0, 0, 0),
)
master.alpha_composite(subject, (PADDING, PADDING))
master.save(MASTER)

scale = min(1.0, 1120 / master.width, 790 / master.height)
shown = master.resize(
    (round(master.width * scale), round(master.height * scale)),
    Image.Resampling.LANCZOS,
)
preview = Image.new("RGBA", (1280, 900), (238, 238, 238, 255))
draw = ImageDraw.Draw(preview)
step = 32
for y in range(0, preview.height, step):
    for x in range(0, preview.width, step):
        if (x // step + y // step) % 2:
            draw.rectangle(
                (x, y, x + step - 1, y + step - 1),
                fill=(205, 205, 205, 255),
            )
x = (preview.width - shown.width) // 2
y = (preview.height - shown.height) // 2
preview.alpha_composite(shown, (x, y))
preview.convert("RGB").save(INSPECTION)

print(f"source alpha bbox: {bbox}")
print(f"master size: {master.size}")
print(MASTER)
print(INSPECTION)
