"""Size the art in design/art/source for the web and mobile apps.

Run after scripts/art.sh: python3 scripts/art_export.py (needs Pillow).
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design/art/source"
WEB = ROOT / "frontend/public/art"
WEB_APP = ROOT / "frontend/app"
MOBILE = ROOT / "mobile/assets/art"
MOBILE_ROOT = ROOT / "mobile/assets"

# Cut-outs used in the apps, and their exported edge in pixels (3x the largest display size).
CUTOUTS = {
    "pip-wave": 480,
    "pip-think": 480,
    "pip-cheer": 480,
    "pip-empty": 480,
    "pip-sleepy": 480,
    "pip-invite": 480,
    "spot-distance": 240,
    "spot-wishes": 240,
    "spot-vote": 240,
}


def square_cutout(name: str, edge: int) -> Image.Image:
    """Trim transparent margins, then center on a square canvas with a little air."""
    image = Image.open(SOURCE / f"{name}.webp").convert("RGBA")
    image = image.crop(image.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    side = round(max(image.size) * 1.04)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(image, ((side - image.width) // 2, (side - image.height) // 2))
    return canvas.resize((edge, edge), Image.LANCZOS)


def main() -> None:
    for folder in (WEB, MOBILE):
        folder.mkdir(parents=True, exist_ok=True)
    for name, edge in CUTOUTS.items():
        image = square_cutout(name, edge)
        image.save(WEB / f"{name}.webp", quality=86, method=6)
        image.save(MOBILE / f"{name}.webp", quality=86, method=6)

    icon = Image.open(SOURCE / "app-icon.webp").convert("RGB")
    icon.resize((1024, 1024), Image.LANCZOS).save(MOBILE_ROOT / "icon.png", optimize=True)
    icon.resize((192, 192), Image.LANCZOS).save(WEB_APP / "icon.png", optimize=True)
    icon.resize((180, 180), Image.LANCZOS).save(WEB_APP / "apple-icon.png", optimize=True)

    foreground = Image.open(SOURCE / "app-icon-foreground.webp").convert("RGBA")
    foreground.resize((1024, 1024), Image.LANCZOS).save(MOBILE_ROOT / "adaptive-icon.png", optimize=True)

    preview = Image.open(SOURCE / "link-preview.webp").convert("RGB")
    scale = 1200 / preview.width
    preview = preview.resize((1200, round(preview.height * scale)), Image.LANCZOS)
    top = (preview.height - 630) // 2
    preview.crop((0, top, 1200, top + 630)).save(WEB_APP / "opengraph-image.jpg", quality=84, optimize=True)

    for path in sorted([*WEB.iterdir(), *MOBILE.iterdir()]):
        print(f"{path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
