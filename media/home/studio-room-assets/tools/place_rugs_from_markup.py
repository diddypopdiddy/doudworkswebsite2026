#!/usr/bin/env python3
"""Place the two approved rug candidates onto the locked 00 room shell.

The user markup is the placement authority. The original room shell and rug
master remain unchanged. This writes a versioned composite and registered rug
layer for inspection.
"""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SHELL_PATH = ROOT / "layers" / "00-room-shell.png"
RUG_MASTER_PATH = ROOT / "candidates" / "rugs" / "01-rugs-digital-replica-candidate-v1-alpha-full.png"
OUT_DIR = ROOT / "qa" / "rug-placement"
SIZE = (1536, 1024)


def load_rgba(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"))


def split_rugs(master: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    alpha = master[:, :, 3]
    count, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 8).astype(np.uint8), 8)
    components: list[tuple[int, np.ndarray]] = []
    for label in range(1, count):
        x, y, width, height, area = stats[label]
        if area < 1000:
            continue
        crop = master[y : y + height, x : x + width].copy()
        crop[:, :, 3] = np.where(labels[y : y + height, x : x + width] == label, crop[:, :, 3], 0)
        components.append((area, crop))
    if len(components) != 2:
        raise ValueError(f"Expected two rug components, found {len(components)}")
    components.sort(key=lambda item: item[0], reverse=True)
    return components[0][1], components[1][1]


def opaque_corners(image: np.ndarray) -> np.ndarray:
    """Return ordered TL, TR, BR, BL corners of the visible rug quadrilateral."""
    alpha = image[:, :, 3]
    points = cv2.findNonZero((alpha > 32).astype(np.uint8))
    if points is None:
        raise ValueError("Rug has no visible pixels")
    hull = cv2.convexHull(points)
    rect = cv2.minAreaRect(hull)
    box = cv2.boxPoints(rect).astype(np.float32)
    sums = box.sum(axis=1)
    diffs = np.diff(box, axis=1).ravel()
    return np.array(
        [box[np.argmin(sums)], box[np.argmin(diffs)], box[np.argmax(sums)], box[np.argmax(diffs)]],
        dtype=np.float32,
    )


def warp_rgba(image: np.ndarray, destination: np.ndarray) -> np.ndarray:
    source = opaque_corners(image)
    matrix = cv2.getPerspectiveTransform(source, destination.astype(np.float32))
    warped = cv2.warpPerspective(
        image,
        matrix,
        SIZE,
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )
    return warped


def floor_mask(shell: Image.Image) -> Image.Image:
    """Constrain rugs to the visible red floor and keep all wall faces/caps above."""
    rgb = np.array(shell.convert("RGB"))
    red = rgb[:, :, 0].astype(np.int16)
    green = rgb[:, :, 1].astype(np.int16)
    blue = rgb[:, :, 2].astype(np.int16)
    mask = ((red > 75) & (red > green * 1.18) & (red > blue * 1.15)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    mask = cv2.GaussianBlur(mask, (0, 0), 0.6)
    return Image.fromarray(mask, "L")


def room_grade(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    rgb = ImageEnhance.Color(image.convert("RGB")).enhance(0.88)
    rgb = ImageEnhance.Contrast(rgb).enhance(0.91)
    rgb = ImageEnhance.Brightness(rgb).enhance(0.94)
    rgb = rgb.filter(ImageFilter.GaussianBlur(0.18))
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def subtle_contact_shadow(rug_alpha: Image.Image) -> Image.Image:
    edge = rug_alpha.filter(ImageFilter.MaxFilter(5))
    edge = edge.filter(ImageFilter.GaussianBlur(2.2))
    edge = edge.point(lambda value: round(value * 0.12))
    shadow = Image.new("RGBA", SIZE, (45, 25, 18, 0))
    shadow.putalpha(edge)
    return shadow


def build() -> tuple[Path, Path, Path]:
    shell = Image.open(SHELL_PATH).convert("RGBA")
    if shell.size != SIZE:
        raise ValueError(f"Locked shell size changed: {shell.size}")
    large, small = split_rugs(load_rgba(RUG_MASTER_PATH))

    # Markup screenshot is a proportional 1340x894 view of the 1536x1024 shell.
    # Right zone: the four outer turning points of the closed green guide.
    small_dest = np.array(
        [(1043, 596), (1348, 821), (1204, 986), (898, 789)],
        dtype=np.float32,
    )

    # Left guide is open at the foreground-left wall. The visible inner edge is
    # explicitly marked; outer corners extend under the locked foreground wall.
    large_dest = np.array(
        [(430, 426), (718, 709), (524, 944), (145, 650)],
        dtype=np.float32,
    )

    large_warped = warp_rgba(large, large_dest)
    small_warped = warp_rgba(small, small_dest)
    rugs = Image.fromarray(cv2.add(large_warped, small_warped), "RGBA")

    visible_floor = floor_mask(shell)
    rugs.putalpha(Image.composite(rugs.getchannel("A"), Image.new("L", SIZE, 0), visible_floor))
    rugs = room_grade(rugs)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    layer_path = OUT_DIR / "01-rugs-markup-placement-v1.png"
    rugs.save(layer_path)

    composite = shell.copy()
    composite.alpha_composite(subtle_contact_shadow(rugs.getchannel("A")))
    composite.alpha_composite(rugs)
    composite_path = OUT_DIR / "00-shell-plus-rugs-v1.png"
    composite.convert("RGB").save(composite_path, quality=97)

    inspection = composite.copy()
    draw = ImageDraw.Draw(inspection)
    draw.line([tuple(p) for p in large_dest] + [tuple(large_dest[0])], fill=(0, 255, 0, 190), width=3)
    draw.line([tuple(p) for p in small_dest] + [tuple(small_dest[0])], fill=(0, 255, 0, 190), width=3)
    inspection_path = OUT_DIR / "00-shell-plus-rugs-v1-placement-check.png"
    inspection.convert("RGB").save(inspection_path, quality=95)
    return layer_path, composite_path, inspection_path


if __name__ == "__main__":
    for path in build():
        print(path)
