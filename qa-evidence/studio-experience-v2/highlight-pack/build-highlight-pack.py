#!/usr/bin/env python3
"""Build registered object masks for the thin-contour studio master.

The segmentation reference is used only for alpha geometry. Every visible hover
pixel comes from the untouched master image in the browser.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / "highlight-pack"
MASTER = ROOT / "master-studio-room-cartoon-v3-thin-contours.png"
SEGMENTATION = PACK / "segmentation-reference-v1.png"

TARGETS = {
    "teaching": {"hue": 0.000, "bounds": (350, 105, 700, 430)},
    "work": {"hue": 0.080, "bounds": (690, 45, 1090, 365)},
    "about": {"hue": 0.167, "bounds": (1050, 65, 1320, 365)},
    "experiments": {"hue": 0.333, "bounds": (1265, 150, 1522, 440)},
    "music": {"hue": 0.500, "bounds": (165, 475, 770, 1033)},
    "ai": {"hue": 0.620, "bounds": (1030, 345, 1490, 780)},
    # The generated reference also colored the softbox magenta. The tight
    # source-space bound intentionally keeps only camera + tripod.
    "video": {"hue": 0.833, "bounds": (955, 585, 1150, 975)},
}


def circular_hue_distance(hue: np.ndarray, target: float) -> np.ndarray:
    delta = np.abs(hue - target)
    return np.minimum(delta, 1.0 - delta)


def clean_mask(mask: np.ndarray) -> np.ndarray:
    binary = np.where(mask > 0, 255, 0).astype(np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))

    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    cleaned = np.zeros_like(binary)
    for index in range(1, count):
        if stats[index, cv2.CC_STAT_AREA] >= 18:
            cleaned[labels == index] = 255

    # A one-pixel feather preserves anti-aliased cartoon edges without turning
    # the mask into a visible blur patch.
    return cv2.GaussianBlur(cleaned, (3, 3), 0.55)


def main() -> None:
    master = Image.open(MASTER).convert("RGBA")
    width, height = master.size
    master_pixels = np.array(master)

    segmentation = cv2.imread(str(SEGMENTATION), cv2.IMREAD_COLOR)
    if segmentation is None:
        raise FileNotFoundError(SEGMENTATION)
    segmentation = cv2.resize(segmentation, (width, height), interpolation=cv2.INTER_LINEAR)
    hsv = cv2.cvtColor(segmentation, cv2.COLOR_BGR2HSV).astype(np.float32)
    hue = hsv[:, :, 0] / 179.0
    saturation = hsv[:, :, 1] / 255.0
    value = hsv[:, :, 2] / 255.0

    manifest = {
        "master": MASTER.name,
        "masterCanvas": {"width": width, "height": height},
        "masterSha256": hashlib.sha256(MASTER.read_bytes()).hexdigest(),
        "contract": "Resting scene uses the untouched master. Masks affect hover/focus overlays only.",
        "layers": [],
    }

    for name, spec in TARGETS.items():
        hue_distance = circular_hue_distance(hue, spec["hue"])
        candidate = (hue_distance < 0.075) & (saturation > 0.48) & (value > 0.22)

        x1, y1, x2, y2 = spec["bounds"]
        bounded = np.zeros((height, width), dtype=np.uint8)
        bounded[y1:y2, x1:x2] = np.where(candidate[y1:y2, x1:x2], 255, 0).astype(np.uint8)
        mask = clean_mask(bounded)

        output = PACK / f"mask-{name}.png"
        rgba = np.full((height, width, 4), 255, dtype=np.uint8)
        rgba[:, :, 3] = mask
        Image.fromarray(rgba, mode="RGBA").save(output, optimize=True)

        overlay_output = PACK / f"overlay-{name}.png"
        overlay = master_pixels.copy()
        overlay[:, :, 3] = mask
        overlay[mask == 0, :3] = 0
        Image.fromarray(overlay, mode="RGBA").save(overlay_output, optimize=True)
        manifest["layers"].append(
            {
                "id": name,
                "mask": output.name,
                "overlay": overlay_output.name,
                "sourceBounds": [x1, y1, x2, y2],
                "maskSha256": hashlib.sha256(output.read_bytes()).hexdigest(),
                "overlaySha256": hashlib.sha256(overlay_output.read_bytes()).hexdigest(),
            }
        )

    (PACK / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
