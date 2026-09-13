"""各アプリのアイコンから代表色を取り出し、ページの下地に使う淡い色を書き出す。
ビルド前に一度動かすだけで、閲覧時の計算は発生しない。
文字色は共通のものを使い続けるので、ここで作るのは背景の色味だけ。"""
import json, glob, os
from PIL import Image

PAPER = (248, 243, 231)   # ライトの地
NIGHT = (22, 21, 18)      # ダークの地

def mix(a, b, t):
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))

def hexs(c):
    return "#%02x%02x%02x" % c

def dominant(path):
    im = Image.open(path).convert("RGB").resize((96, 96), Image.LANCZOS)
    # 減色してから、彩度と明度が極端でない色のうち最も多いものを選ぶ
    q = im.quantize(colors=24, method=Image.MEDIANCUT).convert("RGB")
    counts = {}
    for px in q.getdata():
        r, g, b = px
        mx, mn = max(px), min(px)
        sat = 0 if mx == 0 else (mx - mn) / mx
        lum = (r * 299 + g * 587 + b * 114) / 1000
        if sat < 0.22 or lum < 28 or lum > 232:
            continue                      # 白・黒・灰色は代表色にしない
        counts[px] = counts.get(px, 0) + 1
    if not counts:
        return (90, 110, 95)              # 色味が拾えないアイコンは落ち着いた緑にする
    return max(counts, key=counts.get)

out = {}
for d in sorted(glob.glob("src/assets/apps/*/")):
    slug = os.path.basename(d.rstrip("/"))
    icon = os.path.join(d, "icon-512.png")
    if not os.path.exists(icon):
        continue
    c = dominant(icon)
    out[slug] = {
        "base": hexs(c),
        "tintLight": hexs(mix(c, PAPER, 0.86)),
        "edgeLight": hexs(mix(c, PAPER, 0.62)),
        "tintDark": hexs(mix(c, NIGHT, 0.86)),
        "edgeDark": hexs(mix(c, NIGHT, 0.64)),
    }
    print(f"{slug:12s} {out[slug]['base']}  light={out[slug]['tintLight']}  dark={out[slug]['tintDark']}")

json.dump(out, open("src/_data/appColors.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
