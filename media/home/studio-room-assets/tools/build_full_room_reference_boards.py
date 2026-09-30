#!/usr/bin/env python3
"""Build high-resolution reference boards for the five-image generation limit."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tmp" / "full-room-reference-boards"
BOARD_SIZE = (2048, 1536)
FONT = ImageFont.load_default(size=24)


BOARDS = {
    "board-1-work-art.png": [
        ("COMPUTER DESK + CHAIR + LAPTOP", ROOT / "layers" / "07-desk-station.png"),
        ("ART TABLE + STOOL + ALL SUPPLIES", ROOT / "layers" / "02-art-station.png"),
    ],
    "board-2-record-wall-video.png": [
        ("RECORD CONSOLE + TURNTABLE + 2 SPEAKERS", ROOT / "layers" / "03-stereo-console.png"),
        ("WHITEBOARD", ROOT / "layers" / "05-whiteboard.png"),
        ("BOOKSHELF + BOOKS + PLANT", ROOT / "layers" / "04-bookshelf.png"),
        ("CAMERA + TRIPOD", ROOT / "layers" / "12-camera-tripod.png"),
    ],
    "board-3-instruments.png": [
        ("CREAM DRUM KIT — PRESERVE ALL PARTS", ROOT / "candidates" / "drum-kit" / "08-drum-kit-digital-replica-candidate-v2.png"),
        ("RED SEMI-HOLLOW GUITAR + ORANGE AMP", ROOT / "candidates" / "guitar-rig" / "11-guitar-rig-digital-replica-candidate-v1.png"),
        ("BLACK KEYBOARD + X-STAND", ROOT / "candidates" / "keyboard" / "09-keyboard-digital-replica-candidate-v1.png"),
    ],
    "board-4-organ-rugs-skateboards.png": [
        ("TWO-MANUAL WOOD ORGAN + BLACK BENCH", ROOT / "candidates" / "organ" / "10-organ-digital-replica-candidate-v1.png"),
        ("EXACTLY 2 ORNAMENTAL RUGS", ROOT / "candidates" / "rugs" / "01-rugs-digital-replica-candidate-v1.png"),
        ("EXACTLY 3 SKATEBOARD DECKS", ROOT / "candidates" / "skateboards" / "06-skateboards-digital-replica-candidate-v1.png"),
    ],
}


def tight_subject(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    bbox = image.getchannel("A").point(lambda value: 255 if value > 8 else 0).getbbox()
    if not bbox:
        raise ValueError(f"No visible subject in {path}")
    return image.crop(bbox)


def checker(size: tuple[int, int]) -> Image.Image:
    image = Image.new("RGBA", size, "#dddddd")
    draw = ImageDraw.Draw(image)
    step = 40
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            if (x // step + y // step) % 2:
                draw.rectangle((x, y, x + step - 1, y + step - 1), fill="#c7c7c7")
    return image


def build_board(items: list[tuple[str, Path]], path: Path) -> None:
    columns = 2 if len(items) > 1 else 1
    rows = (len(items) + columns - 1) // columns
    cell_w = BOARD_SIZE[0] // columns
    cell_h = BOARD_SIZE[1] // rows
    board = Image.new("RGBA", BOARD_SIZE, "#eeeeee")
    draw = ImageDraw.Draw(board)
    for index, (label, source) in enumerate(items):
        col = index % columns
        row = index // columns
        x0 = col * cell_w
        y0 = row * cell_h
        tile = checker((cell_w, cell_h))
        subject = tight_subject(source)
        max_w = cell_w - 80
        max_h = cell_h - 110
        scale = min(max_w / subject.width, max_h / subject.height)
        subject = subject.resize(
            (round(subject.width * scale), round(subject.height * scale)),
            Image.Resampling.LANCZOS,
        )
        tile.alpha_composite(subject, ((cell_w - subject.width) // 2, 70 + (max_h - subject.height) // 2))
        board.alpha_composite(tile, (x0, y0))
        draw.rectangle((x0, y0, x0 + cell_w - 1, y0 + 52), fill="#151515")
        draw.text((x0 + 18, y0 + 14), label, fill="white", font=FONT)
        draw.rectangle((x0, y0, x0 + cell_w - 1, y0 + cell_h - 1), outline="#333333", width=2)
    board.convert("RGB").save(path, quality=96)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, items in BOARDS.items():
        path = OUT / filename
        build_board(items, path)
        print(path)


if __name__ == "__main__":
    main()
