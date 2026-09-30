#!/usr/bin/env python3
"""Build the shadow alpha, validate registered layers, and render QA previews."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
LAYERS = ROOT / "layers"
CHROMA = ROOT / "chroma"
QA = ROOT / "qa"
SIZE = (1536, 1024)

OBJECT_NAMES = [
    "02-art-station.png",
    "03-stereo-console.png",
    "04-bookshelf.png",
    "05-whiteboard.png",
    "06-skateboards.png",
    "07-desk-station.png",
    "08-drum-kit.png",
    "09-keyboard.png",
    "10-organ.png",
    "11-guitar-rig.png",
    "12-camera-tripod.png",
    "13-softbox.png",
]


def build_shadow_layer() -> Path:
    source = CHROMA / "14-contact-shadows-white-matte.png"
    image = Image.open(source).convert("RGB")
    if image.size != SIZE:
        raise ValueError(f"shadow matte is {image.size}, expected {SIZE}")
    gray = image.convert("L")
    alpha = ImageChops.invert(gray).point(lambda value: min(190, int(value * 0.78)))
    result = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    result.putalpha(alpha)
    output = LAYERS / "14-contact-shadows.png"
    result.save(output)
    return output


def validate_layer(path: Path, require_alpha: bool) -> dict[str, object]:
    image = Image.open(path)
    if image.size != SIZE:
        raise ValueError(f"{path.name} is {image.size}, expected {SIZE}")
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    bounds = alpha.getbbox()
    corners = [alpha.getpixel((0, 0)), alpha.getpixel((1535, 0)), alpha.getpixel((0, 1023)), alpha.getpixel((1535, 1023))]
    if require_alpha and any(corners):
        raise ValueError(f"{path.name} has nontransparent canvas corners: {corners}")
    return {
        "file": path.name,
        "mode": image.mode,
        "size": list(image.size),
        "alpha_bounds": list(bounds) if bounds else None,
        "corner_alpha": corners,
    }


def build_composite(layer_paths: list[Path]) -> Path:
    base = Image.open(LAYERS / "00-room-shell.png").convert("RGBA")
    order = [LAYERS / "01-rugs.png", LAYERS / "14-contact-shadows.png", *layer_paths]
    for path in order:
        base.alpha_composite(Image.open(path).convert("RGBA"))
    output = QA / "composite-preview.png"
    base.convert("RGB").save(output, quality=95)
    return output


def build_contact_sheet(paths: list[Path]) -> Path:
    thumb_size = (384, 256)
    columns = 4
    rows = (len(paths) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * thumb_size[0], rows * (thumb_size[1] + 28)), "#242424")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, path in enumerate(paths):
        image = Image.open(path).convert("RGBA")
        tile = Image.new("RGBA", SIZE, "#c8c8c8")
        checker = Image.new("RGBA", SIZE, "#eeeeee")
        check = 64
        checker_draw = ImageDraw.Draw(checker)
        for y in range(0, SIZE[1], check):
            for x in range(0, SIZE[0], check):
                if (x // check + y // check) % 2:
                    checker_draw.rectangle((x, y, x + check - 1, y + check - 1), fill="#cfcfcf")
        tile.alpha_composite(checker)
        tile.alpha_composite(image)
        tile.thumbnail(thumb_size, Image.Resampling.LANCZOS)
        x = (index % columns) * thumb_size[0]
        y = (index // columns) * (thumb_size[1] + 28)
        sheet.paste(tile.convert("RGB"), (x, y))
        draw.text((x + 8, y + thumb_size[1] + 7), path.name, fill="white", font=font)
    output = QA / "layer-contact-sheet.png"
    sheet.save(output)
    return output


def main() -> None:
    QA.mkdir(parents=True, exist_ok=True)
    shadow = build_shadow_layer()
    required = [LAYERS / "00-room-shell.png", LAYERS / "01-rugs.png", *[LAYERS / name for name in OBJECT_NAMES], shadow]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError("missing required layers:\n" + "\n".join(missing))
    report = []
    for path in required:
        report.append(validate_layer(path, require_alpha=path.name != "00-room-shell.png"))
    composite = build_composite([LAYERS / name for name in OBJECT_NAMES])
    contact_sheet = build_contact_sheet(required)
    report_path = QA / "validation-report.json"
    report_path.write_text(json.dumps({"canvas": list(SIZE), "layers": report, "composite": composite.name, "contact_sheet": contact_sheet.name}, indent=2) + "\n")
    print(report_path)
    print(composite)
    print(contact_sheet)


if __name__ == "__main__":
    main()
