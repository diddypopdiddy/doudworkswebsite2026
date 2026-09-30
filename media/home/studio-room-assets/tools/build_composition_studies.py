#!/usr/bin/env python3
"""Build non-destructive Stage B composition studies on the locked room shell.

The original registered layers and standalone masters are read-only inputs. Outputs
are versioned QA artifacts and never replace the canonical shell or layer pack.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
LAYERS = ROOT / "layers"
CANDIDATES = ROOT / "candidates"
QA = ROOT / "qa" / "composition-studies"
CANVAS = (1536, 1024)


@dataclass(frozen=True)
class Placement:
    name: str
    source: Path
    box: tuple[int, int, int, int]
    angle: float = 0.0
    scale: float = 1.0
    x_shift: int = 0
    y_shift: int = 0
    saturation: float = 1.0
    contrast: float = 1.0
    sharpness: float = 1.0


BASE_REGISTERED = [
    "02-art-station.png",
    "03-stereo-console.png",
    "04-bookshelf.png",
    "05-whiteboard.png",
    "06-skateboards.png",
    "07-desk-station.png",
    "12-camera-tripod.png",
    "13-softbox.png",
]

REGISTERED_TREATMENT = {
    "02-art-station.png": (0.92, 0.93, 0.96, 0.35),
    "03-stereo-console.png": (0.88, 0.94, 0.94, 0.25),
    "04-bookshelf.png": (0.88, 0.94, 0.94, 0.25),
    "05-whiteboard.png": (0.94, 0.93, 0.96, 0.30),
    "06-skateboards.png": (0.90, 0.94, 0.94, 0.25),
    "07-desk-station.png": (0.92, 0.95, 0.96, 0.25),
    "12-camera-tripod.png": (0.90, 0.98, 1.08, 0.10),
    "13-softbox.png": (0.82, 0.88, 0.94, 0.45),
}


ONE_SHOT = [
    Placement(
        "drum-kit",
        CANDIDATES / "drum-kit" / "08-drum-kit-digital-replica-candidate-v3-clean.png",
        (271, 429, 484, 635),
    ),
    Placement(
        "keyboard",
        CANDIDATES / "keyboard" / "09-keyboard-digital-replica-candidate-v1.png",
        (410, 396, 554, 524),
    ),
    Placement(
        "organ",
        CANDIDATES / "organ" / "10-organ-digital-replica-candidate-v1.png",
        (273, 612, 498, 835),
        angle=42,
    ),
    Placement(
        "guitar-rig",
        CANDIDATES / "guitar-rig" / "11-guitar-rig-digital-replica-candidate-v1.png",
        (531, 707, 681, 899),
    ),
]


# These are deliberately small, evidence-driven corrections to the first proof.
# They remain placement copies; standalone masters are never modified.
BACKWARD_WORKED = [
    Placement(
        "keyboard",
        CANDIDATES / "keyboard" / "09-keyboard-digital-replica-candidate-v1.png",
        (401, 389, 562, 531),
        scale=0.92,
        x_shift=-2,
        y_shift=2,
        saturation=0.88,
        contrast=0.94,
        sharpness=1.06,
    ),
    Placement(
        "drum-kit",
        CANDIDATES / "drum-kit" / "08-drum-kit-digital-replica-candidate-v3-clean.png",
        (262, 419, 494, 647),
        scale=0.96,
        x_shift=2,
        y_shift=1,
        saturation=0.84,
        contrast=0.91,
        sharpness=1.02,
    ),
    Placement(
        "organ",
        CANDIDATES / "organ" / "10-organ-digital-replica-candidate-v3-room-camera.png",
        (315, 584, 542, 814),
        angle=69,
        scale=0.84,
        x_shift=8,
        y_shift=-7,
        saturation=0.78,
        contrast=0.88,
        sharpness=0.96,
    ),
    Placement(
        "guitar-rig",
        CANDIDATES / "guitar-rig" / "11-guitar-rig-digital-replica-candidate-v2-room-camera.png",
        (528, 704, 686, 902),
        scale=0.88,
        x_shift=2,
        y_shift=-1,
        saturation=0.74,
        contrast=0.88,
        sharpness=0.98,
    ),
]


def alpha_crop(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if not bbox:
        raise ValueError(f"No visible pixels in {path}")
    return image.crop(bbox)


def color_adjust(image: Image.Image, placement: Placement) -> Image.Image:
    alpha = image.getchannel("A")
    rgb = image.convert("RGB")
    if placement.saturation != 1.0:
        rgb = ImageEnhance.Color(rgb).enhance(placement.saturation)
    if placement.contrast != 1.0:
        rgb = ImageEnhance.Contrast(rgb).enhance(placement.contrast)
    if placement.sharpness != 1.0:
        rgb = ImageEnhance.Sharpness(rgb).enhance(placement.sharpness)
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def treat_registered(image: Image.Image, filename: str) -> Image.Image:
    saturation, contrast, brightness, blur_radius = REGISTERED_TREATMENT[filename]
    alpha = image.getchannel("A")
    rgb = ImageEnhance.Color(image.convert("RGB")).enhance(saturation)
    rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    rgb = ImageEnhance.Brightness(rgb).enhance(brightness)
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    if blur_radius:
        result = result.filter(ImageFilter.GaussianBlur(blur_radius))
    return result


def transform(placement: Placement) -> tuple[Image.Image, tuple[int, int]]:
    subject = alpha_crop(placement.source)
    if placement.angle:
        subject = subject.rotate(
            placement.angle,
            resample=Image.Resampling.BICUBIC,
            expand=True,
        )
        bbox = subject.getchannel("A").point(lambda value: 255 if value > 8 else 0).getbbox()
        if bbox:
            subject = subject.crop(bbox)

    left, top, right, bottom = placement.box
    target_w = right - left
    target_h = bottom - top
    ratio = min(target_w / subject.width, target_h / subject.height) * placement.scale
    size = (max(1, round(subject.width * ratio)), max(1, round(subject.height * ratio)))
    subject = subject.resize(size, Image.Resampling.LANCZOS)
    subject = color_adjust(subject, placement)

    x = left + (target_w - subject.width) // 2 + placement.x_shift
    y = bottom - subject.height + placement.y_shift
    return subject, (x, y)


def add_registered(base: Image.Image, *, harmonize: bool) -> None:
    for filename in BASE_REGISTERED:
        image = Image.open(LAYERS / filename).convert("RGBA")
        if harmonize:
            image = treat_registered(image, filename)
        base.alpha_composite(image)


def provisional_shadow(subject: Image.Image, xy: tuple[int, int]) -> Image.Image:
    """Create a deliberately separate, soft layout-only grounding proxy."""
    alpha = subject.getchannel("A")
    width = max(8, round(subject.width * 0.72))
    height = max(4, round(subject.height * 0.12))
    footprint = alpha.resize((width, height), Image.Resampling.LANCZOS)
    footprint = footprint.filter(ImageFilter.GaussianBlur(max(3, height / 2.5)))
    footprint = footprint.point(lambda value: round(value * 0.22))
    shadow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    stamp = Image.new("RGBA", (width, height), (25, 20, 18, 0))
    stamp.putalpha(footprint)
    x = xy[0] + (subject.width - width) // 2 + 5
    y = xy[1] + subject.height - height // 2 + 3
    shadow.alpha_composite(stamp, (x, y))
    return shadow


def manual_grounding_layer() -> Image.Image:
    """Separate layout-only contact cues; never baked into standalone masters."""
    mask = Image.new("L", CANVAS, 0)
    draw = ImageDraw.Draw(mask)
    # Tight contact cues only; final shadows still require per-foot geometry.
    contacts = [
        (567, 367, 16, 5), (640, 376, 18, 5), (785, 365, 16, 5),
        (829, 397, 18, 5), (982, 401, 18, 5),
        (1023, 456, 14, 4), (1103, 458, 14, 4),
        (948, 704, 18, 5), (1138, 712, 18, 5), (1095, 673, 16, 5),
        (284, 616, 15, 5), (341, 630, 16, 5), (408, 633, 16, 5), (473, 620, 16, 5),
        (422, 520, 15, 4), (543, 520, 15, 4),
        (295, 826, 18, 5), (375, 840, 18, 5), (470, 833, 18, 5),
        (548, 891, 16, 5), (665, 892, 18, 5),
        (832, 872, 14, 4), (916, 876, 14, 4),
        (972, 932, 14, 4), (1048, 942, 14, 4), (1110, 934, 14, 4),
    ]
    for x, y, rx, ry in contacts:
        draw.ellipse((x - rx, y - ry, x + rx, y + ry), fill=62)
    mask = mask.filter(ImageFilter.GaussianBlur(5))
    shadow = Image.new("RGBA", CANVAS, (25, 19, 17, 0))
    shadow.putalpha(mask)
    return shadow


def foreground_wall_occluder() -> Image.Image:
    """Recover the locked shell's foreground wall above crossing floor assets."""
    shell = Image.open(LAYERS / "00-room-shell.png").convert("RGBA")
    mask = Image.new("L", CANVAS, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon([(0, 420), (238, 591), (582, 1024), (0, 1024)], fill=255)
    shell.putalpha(mask)
    return shell


def build(
    placements: list[Placement],
    output_name: str,
    *,
    include_grounding_proxies: bool,
    harmonize_registered: bool,
) -> Path:
    shell = Image.open(LAYERS / "00-room-shell.png").convert("RGBA")
    if shell.size != CANVAS:
        raise ValueError(f"Locked shell changed size: {shell.size}")
    shell.alpha_composite(Image.open(LAYERS / "01-rugs.png").convert("RGBA"))

    transformed = [(placement, *transform(placement)) for placement in placements]
    if include_grounding_proxies:
        shell.alpha_composite(manual_grounding_layer())

    add_registered(shell, harmonize=harmonize_registered)

    for _, subject, xy in transformed:
        shell.alpha_composite(subject, xy)

    if include_grounding_proxies:
        shell.alpha_composite(foreground_wall_occluder())

    QA.mkdir(parents=True, exist_ok=True)
    output = QA / output_name
    shell.convert("RGB").save(output, quality=96)
    return output


def build_crop_proofs(source: Path) -> list[Path]:
    """Render the current homepage's representative cover/crop windows."""
    image = Image.open(source).convert("RGB")
    outputs: list[Path] = []

    desktop = ImageOps.fit(
        image,
        (1440, 900),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    desktop_path = source.with_name(source.stem + "-crop-1440x900.png")
    desktop.save(desktop_path)
    outputs.append(desktop_path)

    laptop = ImageOps.fit(
        image,
        (1366, 768),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    laptop_path = source.with_name(source.stem + "-crop-1366x768.png")
    laptop.save(laptop_path)
    outputs.append(laptop_path)

    # Current <=720px CSS resolves to an approximately x=457..930 source crop.
    mobile_window = image.crop((457, 0, 930, 1024))
    mobile = mobile_window.resize((390, 844), Image.Resampling.LANCZOS)
    mobile_path = source.with_name(source.stem + "-crop-390x844.png")
    mobile.save(mobile_path)
    outputs.append(mobile_path)

    contact = Image.new("RGB", (1440, 900 + 768 + 40), "#161616")
    contact.paste(desktop, (0, 0))
    laptop_preview = laptop.resize((1366, 768), Image.Resampling.LANCZOS)
    contact.paste(laptop_preview, ((1440 - 1366) // 2, 920))
    draw = ImageDraw.Draw(contact)
    draw.text((12, 902), "1440x900 cover above / 1366x768 cover below", fill="white")
    contact_path = source.with_name(source.stem + "-desktop-crop-proof.png")
    contact.save(contact_path)
    outputs.append(contact_path)
    return outputs


def main() -> None:
    one_shot = build(
        ONE_SHOT,
        "one-shot-composition-v1.png",
        include_grounding_proxies=False,
        harmonize_registered=False,
    )
    backward = build(
        BACKWARD_WORKED,
        "backward-worked-draft-v3.png",
        include_grounding_proxies=True,
        harmonize_registered=True,
    )
    print(one_shot)
    print(backward)
    for source in (one_shot, backward):
        for crop in build_crop_proofs(source):
            print(crop)
    cohesive = QA / "one-shot-cohesive-render-v1.png"
    if cohesive.exists():
        for crop in build_crop_proofs(cohesive):
            print(crop)


if __name__ == "__main__":
    main()
