#!/usr/bin/env python3
"""Make only the snare shell shallower while preserving the rest of the kit."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "revisions" / "08-drum-kit-v2-before-snare-depth.png"
OUTPUT = ROOT / "revisions" / "08-drum-kit-v3-shallow-snare.png"


def connected(alpha: Image.Image, seed: tuple[int, int], bounds: tuple[int, int, int, int]) -> set[tuple[int, int]]:
    left, top, right, bottom = bounds
    queue = deque([seed])
    visited: set[tuple[int, int]] = set()
    result: set[tuple[int, int]] = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not (left <= x < right and top <= y < bottom):
            continue
        visited.add((x, y))
        if alpha.getpixel((x, y)) <= 8:
            continue
        result.add((x, y))
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx or dy:
                    queue.append((x + dx, y + dy))
    return result


image = Image.open(SOURCE).convert("RGBA")
alpha = image.getchannel("A")
pixels = image.load()

# The snare is the white-headed tan drum immediately above/right of the throne.
# Its dark throne neighbor overlaps the shell silhouette by a few pixels, so use a
# tight shell envelope and explicitly protect dark neutral throne pixels.
shell_top = 520
shell_bottom = 547
shell: set[tuple[int, int]] = set()
protected_throne: dict[tuple[int, int], tuple[int, int, int, int]] = {}
for y in range(shell_top, shell_bottom):
    half_width = round(24 - (y - shell_top) * 0.12)
    for x in range(365 - half_width, 365 + half_width + 1):
        r, g, b, a = pixels[x, y]
        if a <= 8:
            continue
        dark_neutral_throne = x < 362 and max(r, g, b) < 112 and max(r, g, b) - min(r, g, b) < 28
        if dark_neutral_throne:
            protected_throne[(x, y)] = (r, g, b, a)
        else:
            shell.add((x, y))
if len(shell) < 450:
    raise RuntimeError(f"unexpected snare shell selection: {len(shell)}")

shell_pixels = {(x, y): pixels[x, y] for x, y in shell}

# Clear only the original shell. The head, rim, placement, and every other object stay unchanged.
for x, y in shell:
    pixels[x, y] = (0, 0, 0, 0)

# Reduce shell depth to about 72%, anchored under the unchanged top head.
# Resample the isolated shell as a small RGBA patch to retain smooth edges and hardware detail.
left, right, bottom = 340, 390, shell_bottom
patch = Image.new("RGBA", (right - left, bottom - shell_top), (0, 0, 0, 0))
patch_pixels = patch.load()
for (x, y), rgba in shell_pixels.items():
    patch_pixels[x - left, y - shell_top] = rgba
patch = patch.resize((patch.width, 19), Image.Resampling.LANCZOS)
image.alpha_composite(patch, (left, shell_top))

# Resampling can feather by a pixel; restore protected throne pixels byte-for-byte.
pixels = image.load()
for (x, y), rgba in protected_throne.items():
    pixels[x, y] = rgba

image.save(OUTPUT)
print(f"wrote {OUTPUT}")
print(f"compressed shell pixels: {len(shell)}")
