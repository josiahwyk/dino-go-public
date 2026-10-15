"""Cut dino art out of its white background so the game can animate it cleanly.

Usage: python3 tools/cutout.py [game/dinos/NN_name.jpg ...]
With no arguments it converts every game/dinos/*.jpg. Writes NN_name.webp next to
each .jpg (transparent background). The .jpg files are left untouched.

How it works: white pixels connected to the image border are background (so white
eyes and highlights inside the outline stay). Pixels on the edge of the dino get
partial transparency, un-mixed from white, so the outline stays smooth.
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

WHITE = 236   # a pixel is "white" if all channels are at least this
EDGE_LO = 90  # fringe pixels this dark or darker are fully opaque
EDGE_HI = 250 # fringe pixels this light or lighter are fully transparent
RING = 2      # how many pixels in from the background count as fringe


def background_mask(rgb):
    h, w, _ = rgb.shape
    white = (rgb >= WHITE).all(axis=2)
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        q.extend(((0, x), (h - 1, x)))
    for y in range(h):
        q.extend(((y, 0), (y, w - 1)))
    while q:
        y, x = q.popleft()
        if bg[y, x] or not white[y, x]:
            continue
        bg[y, x] = True
        if y > 0: q.append((y - 1, x))
        if y < h - 1: q.append((y + 1, x))
        if x > 0: q.append((y, x - 1))
        if x < w - 1: q.append((y, x + 1))
    return bg


def near(mask, r):
    out = mask.copy()
    for _ in range(r):
        grown = out.copy()
        grown[1:] |= out[:-1]; grown[:-1] |= out[1:]
        grown[:, 1:] |= out[:, :-1]; grown[:, :-1] |= out[:, 1:]
        out = grown
    return out


def cutout(src: Path):
    rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
    bg = background_mask(rgb.astype(np.uint8))
    ring = near(bg, RING) & ~bg
    lum = rgb.mean(axis=2)
    alpha = np.ones(lum.shape, np.float32)
    alpha[bg] = 0
    a = np.clip((EDGE_HI - lum) / (EDGE_HI - EDGE_LO), 0, 1)
    alpha[ring] = a[ring]
    # un-mix fringe colour from the white it was blended with
    safe = np.maximum(alpha, 1e-3)[..., None]
    col = np.clip((rgb - (1 - alpha[..., None]) * 255) / safe, 0, 255)
    col = np.where(ring[..., None], col, rgb)
    out = np.dstack([col, alpha * 255]).astype(np.uint8)
    dst = src.with_suffix(".webp")
    Image.fromarray(out, "RGBA").save(dst, "WEBP", quality=88, method=6)
    return dst


if __name__ == "__main__":
    here = Path(__file__).resolve().parent.parent / "game" / "dinos"
    files = [Path(p) for p in sys.argv[1:]] or sorted(here.glob("*.jpg"))
    for f in files:
        print(cutout(f).name)
