#!/usr/bin/env python3
"""Apply the user's marked drum/throne swap without rerendering untouched pixels."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "revisions" / "08-drum-kit-clean-v1.png"
OUTPUT = ROOT / "revisions" / "08-drum-kit-v2-throne-moved.png"


def component_mask(alpha: Image.Image, seed: tuple[int, int], bounds: tuple[int, int, int, int]) -> set[tuple[int, int]]:
    left, top, right, bottom = bounds
    queue = deque([seed])
    visited: set[tuple[int, int]] = set()
    selected: set[tuple[int, int]] = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not (left <= x < right and top <= y < bottom):
            continue
        visited.add((x, y))
        if alpha.getpixel((x, y)) <= 8:
            continue
        selected.add((x, y))
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx or dy:
                    queue.append((x + dx, y + dy))
    return selected


image = Image.open(SOURCE).convert("RGBA")
alpha = image.getchannel("A")

# User's green mark encloses the throne; the seed hits its black cushion.
throne = component_mask(alpha, (278, 529), (252, 501, 309, 612))
# User's red mark encloses the unwanted front-left drum and its local hardware.
extra_drum = component_mask(alpha, (331, 561), (299, 529, 368, 625))

if len(throne) < 400 or len(extra_drum) < 900:
    raise RuntimeError(f"unexpected selections: throne={len(throne)}, extra_drum={len(extra_drum)}")

source_pixels = image.load()
throne_pixels = {(x, y): source_pixels[x, y] for x, y in throne}

# Remove the marked drum and the throne's former placement.
for x, y in throne | extra_drum:
    source_pixels[x, y] = (0, 0, 0, 0)

# Move the throne from the green-mark center to the red-mark center.
dx, dy = 61, 17
for (x, y), rgba in throne_pixels.items():
    target = (x + dx, y + dy)
    if 0 <= target[0] < image.width and 0 <= target[1] < image.height:
        source_pixels[target[0], target[1]] = rgba

image.save(OUTPUT)
print(f"wrote {OUTPUT}")
print(f"throne pixels: {len(throne)}")
print(f"removed drum pixels: {len(extra_drum)}")
