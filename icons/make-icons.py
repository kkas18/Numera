"""
Genererer NUMERA-ikoner (geometrisk N-monogram i gull på mørk flate).
Kjør: python3 icons/make-icons.py
"""
from PIL import Image, ImageDraw, ImageFilter
import os

OUT = os.path.dirname(os.path.abspath(__file__))
SS = 4                     # supersampling
BASE = 512

BG_TOP = (27, 31, 36)      # #1b1f24
BG_BOT = (14, 16, 19)      # #0e1013
GOLD_HI = (232, 191, 110)  # #e8bf6e
GOLD_LO = (200, 148, 58)   # litt dypere enn #d8a54a for kontrast nederst


def gradient(size, top, bot):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        c = tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        for x in range(size):
            px[x, y] = c
    return img


def n_mask(size, scale=1.0):
    """Geometrisk N. scale skalerer om midtpunktet."""
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    u = size / 512.0
    cx = cy = 256

    def P(x, y):
        return ((cx + (x - cx) * scale) * u, (cy + (y - cy) * scale) * u)

    W = 74                                   # stolpebredde
    L, R, T, B = 118, 394, 132, 380          # ytterkanter
    left = [P(L, T), P(L + W, T), P(L + W, B), P(L, B)]
    right = [P(R - W, T), P(R, T), P(R, B), P(R - W, B)]
    diag = [P(L, T), P(L + W + 12, T), P(R, B), P(R - W - 12, B)]
    for poly in (left, right, diag):
        d.polygon(poly, fill=255)
    return m


def rounded_mask(size, radius_frac):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=size * radius_frac, fill=255)
    return m


def build(size, maskable):
    S = size * SS
    bg = gradient(S, BG_TOP, BG_BOT).convert("RGBA")

    # Svak lysglød øverst til høyre (samme som i appen)
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([S * 0.35, -S * 0.45, S * 1.35, S * 0.55], fill=(216, 165, 74, 34))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.16))
    bg = Image.alpha_composite(bg, glow)

    scale = 0.62 if maskable else 0.88
    nm = n_mask(S, scale)
    gold = gradient(S, GOLD_HI, GOLD_LO).convert("RGBA")

    # Subtil skygge under monogrammet
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sh_layer = Image.new("RGBA", (S, S), (0, 0, 0, 110))
    shadow.paste(sh_layer, (0, int(S * 0.012)), nm)
    shadow = shadow.filter(ImageFilter.GaussianBlur(S * 0.012))
    bg = Image.alpha_composite(bg, shadow)

    bg.paste(gold, (0, 0), nm)

    if not maskable:
        rm = rounded_mask(S, 0.225)
        out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        out.paste(bg, (0, 0), rm)
        bg = out

    return bg.resize((size, size), Image.LANCZOS)


def main():
    build(512, False).save(os.path.join(OUT, "icon-512.png"))
    build(192, False).save(os.path.join(OUT, "icon-192.png"))
    build(512, True).save(os.path.join(OUT, "icon-maskable-512.png"))
    build(192, True).save(os.path.join(OUT, "icon-maskable-192.png"))
    # Apple-ikonet skal være uten gjennomsiktighet og uten runde hjørner
    build(180, True).save(os.path.join(OUT, "apple-touch-icon.png"))
    build(32, False).save(os.path.join(OUT, "favicon-32.png"))
    print("ok")


if __name__ == "__main__":
    main()
