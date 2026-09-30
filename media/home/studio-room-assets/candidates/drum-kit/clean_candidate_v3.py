#!/usr/bin/env python3
"""Remove broad pale grounding residue from candidate v3 without touching the kit."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "08-drum-kit-digital-replica-candidate-v3.png"
OUTPUT = ROOT / "08-drum-kit-digital-replica-candidate-v3-clean.png"
INSPECTION = ROOT / "08-drum-kit-digital-replica-candidate-v3-clean-inspection.png"

image = Image.open(SOURCE).convert("RGBA")
pixels = image.load()

# Restrict cleanup to the visual ground zones revealed by checkerboard inspection.
zone = Image.new("L", image.size, 0)
zone_draw = ImageDraw.Draw(zone)
zone_draw.polygon([(500, 525), (715, 515), (790, 625), (690, 755), (505, 745)], fill=255)
zone_draw.polygon([(690, 575), (1015, 540), (1035, 710), (790, 760)], fill=255)

# Protect every legitimate pale object surface in those zones.
protect = Image.new("L", image.size, 0)
protect_draw = ImageDraw.Draw(protect)
protect_draw.ellipse((572, 438, 715, 573), fill=255)  # cloth-covered snare
protect_draw.ellipse((682, 458, 884, 642), fill=255)  # kick body/front
protect_draw.ellipse((765, 520, 928, 735), fill=255)  # floor tom
protect_draw.ellipse((520, 550, 665, 690), fill=255)  # throne cushion/body

# Candidate pale pixels: broad neutral light areas, not colored kit materials.
pale = Image.new("L", image.size, 0)
pale_pixels = pale.load()
for y in range(image.height):
    for x in range(image.width):
        r, g, b, a = pixels[x, y]
        if a > 8 and min(r, g, b) > 170 and max(r, g, b) - min(r, g, b) < 38:
            pale_pixels[x, y] = 255

# Keep only broad patches. Thin chrome highlights do not survive this density test.
dense = pale.filter(ImageFilter.BoxBlur(5)).point(lambda value: 255 if value > 105 else 0)
dense = dense.filter(ImageFilter.MaxFilter(7))

zone_pixels = zone.load()
protect_pixels = protect.load()
dense_pixels = dense.load()
cleared = 0
for y in range(image.height):
    for x in range(image.width):
        if zone_pixels[x, y] and dense_pixels[x, y] and not protect_pixels[x, y]:
            r, g, b, a = pixels[x, y]
            if a > 0 and min(r, g, b) > 145 and max(r, g, b) - min(r, g, b) < 50:
                pixels[x, y] = (0, 0, 0, 0)
                cleared += 1

image.save(OUTPUT)

checker = Image.new("RGBA", image.size, (238, 238, 238, 255))
checker_draw = ImageDraw.Draw(checker)
step = 32
for y in range(0, image.height, step):
    for x in range(0, image.width, step):
        if (x // step + y // step) % 2:
            checker_draw.rectangle((x, y, x + step - 1, y + step - 1), fill=(205, 205, 205, 255))
checker.alpha_composite(image)
checker.convert("RGB").save(INSPECTION)
print(f"cleared broad pale pixels: {cleared}")
print(OUTPUT)
print(INSPECTION)
