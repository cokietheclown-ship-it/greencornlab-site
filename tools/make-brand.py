"""支給されたロゴ一式から、サイトで使う画像を書き出す。
- 紙の色との差をアルファに変換するので、どんな背景にも重ねられる
- 単色で抜いた版（クリーム／緑）も作り、濃い背景の上で使う
再生成: python3 tools/make-brand.py
"""
from PIL import Image
import numpy as np
import os

SRC = "src/assets/brand/logo-variants-source.png"
OUT = "src/assets/brand"
PAPER = np.array([244.0, 243.0, 235.0])

GREEN_DEEP = (22, 68, 43)     # #16442b
CREAM      = (244, 243, 235)  # #f4f3eb
INK        = (17, 17, 17)     # #111111（モノトーンの版）

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
cover = np.clip(np.linalg.norm(a - PAPER, axis=2) / 90.0, 0, 1)   # インクの濃さ

# 切り出す範囲（原本のどこに何があるか）
BOXES = {
  "lockup":   (20,  55,  835, 440),
  "stamp":    (840, 45, 1220, 425),
  "wordline": (30, 495,  580, 690),
  "mark":     (505, 735, 680, 975),
  "appicon":  (50, 1020, 235, 1205),
}

def trimmed(box, thr=0.25):
    x0, y0, x1, y1 = box
    sub = cover[y0:y1, x0:x1]
    ys, xs = np.where(sub > thr)
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)

def save_rgba(box, path, width=None, flat=None):
    x0, y0, x1, y1 = box
    rgb = a[y0:y1, x0:x1].astype(np.uint8)
    al = (cover[y0:y1, x0:x1] * 255).astype(np.uint8)
    out = np.dstack([rgb, al]) if flat is None else np.dstack([
        np.full_like(rgb[..., 0], flat[0]),
        np.full_like(rgb[..., 0], flat[1]),
        np.full_like(rgb[..., 0], flat[2]),
        al])
    img = Image.fromarray(out, "RGBA")
    if width:
        img = img.resize((width, max(1, round(width * img.height / img.width))), Image.LANCZOS)
    img.save(path)
    return img.size

# 横組みロゴ（2行）。色そのままと、クリームで抜いた版
b = trimmed(BOXES["lockup"])
print("lockup      ", save_rgba(b, f"{OUT}/lockup-color.png", 900))
print("lockup-cream", save_rgba(b, f"{OUT}/lockup-cream.png", 900, flat=CREAM))

# ヘッダー用の一行ロゴ。緑とクリームの2色
b = trimmed(BOXES["wordline"])
print("wordline-green", save_rgba(b, f"{OUT}/wordline-green.png", 700, flat=GREEN_DEEP))
print("wordline-cream", save_rgba(b, f"{OUT}/wordline-cream.png", 700, flat=CREAM))
print("wordline-ink  ", save_rgba(b, f"{OUT}/wordline-ink.png", 700, flat=INK))

# 丸いスタンプ。色そのままと、クリームで抜いた版
b = trimmed(BOXES["stamp"])
print("stamp       ", save_rgba(b, f"{OUT}/stamp-color.png", 520))
print("stamp-cream ", save_rgba(b, f"{OUT}/stamp-cream.png", 520, flat=CREAM))

# とうもろこし単体
b = trimmed(BOXES["mark"])
print("mark        ", save_rgba(b, f"{OUT}/mark-color.png", 360))

# 濃い背景に置くための、クリームで抜いたマーク。
# 色版を単色で塗りつぶすと粒が潰れて塊になるので、
# 角丸タイル（濃緑の地にクリームのとうもろこし）のほうから抜く。
# タイルの外側は紙の色なので、先に内側へ寄せてから地の緑との距離をアルファにする。
x0, y0, x1, y1 = trimmed(BOXES["appicon"], thr=0.2)
inset = round(min(x1 - x0, y1 - y0) * 0.14)
tile = a[y0 + inset:y1 - inset, x0 + inset:x1 - inset]
ink = np.clip(np.linalg.norm(tile - np.array(GREEN_DEEP, dtype=np.float32), axis=2) / 110.0, 0, 1)
# 版の紙目のぶん、地の全面にわずかな値が残る。そのままだと濃い背景の上で
# 四角い靄になって出るので、下側を切り落としてから伸ばし直す。
ink = np.clip((ink - 0.22) / 0.78, 0, 1)
ys, xs = np.where(ink > 0.35)
sub = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
for color, name in ((CREAM, "cream"), (INK, "ink")):
    flat = np.dstack([np.full(sub.shape, c, np.uint8) for c in color] + [(sub * 255).astype(np.uint8)])
    img = Image.fromarray(flat, "RGBA")
    img = img.resize((360, round(360 * img.height / img.width)), Image.LANCZOS)
    img.save(f"{OUT}/mark-{name}.png")
    print(f"mark-{name:6}", img.size)

# アプリアイコン（角丸の緑地）。ファビコンとOG画像に使う
x0, y0, x1, y1 = trimmed(BOXES["appicon"], thr=0.2)
# 角丸の緑地いっぱいに使う。余白を足すとファビコンで小さく見えるため
sq = im.crop((x0, y0, x1, y1)).resize((1024, 1024), Image.LANCZOS)
sq.save(f"{OUT}/mark-1024.png")
for s in (512, 180, 32):
    sq.resize((s, s), Image.LANCZOS).save(f"{OUT}/mark-{s}.png")
print("appicon     ", sq.size, "→ mark-1024/512/180/32")
