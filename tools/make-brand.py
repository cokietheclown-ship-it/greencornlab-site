"""支給されたロゴ（クリーム地に黒インク）から、サイトで使う画像を書き出す。
インクの濃さをそのままアルファに変換するので、どんな背景にも重ねられる。"""
from PIL import Image
import numpy as np

SRC = "src/assets/brand/logo-source.png"
OUT = "src/assets/brand"

img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(np.float32)

# 四隅から地の色を推定する
corners = np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3),
                          a[-40:, :40].reshape(-1, 3), a[-40:, -40:].reshape(-1, 3)])
paper = corners.mean(axis=0)
lum = a.mean(axis=2)
paper_lum = float(paper.mean())
ink_lum = float(np.percentile(lum, 0.5))
print(f"地の色 RGB={tuple(int(v) for v in paper)}  インクの明度={ink_lum:.1f}")

# インクの濃さ → アルファ
alpha = np.clip((paper_lum - lum) / (paper_lum - ink_lum), 0, 1)

def bbox(mask, thr=0.35):
    ys, xs = np.where(mask > thr)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def save(alpha_crop, rgb, path, pad_ratio=0.0):
    h, w = alpha_crop.shape
    pad = int(max(h, w) * pad_ratio)
    canvas = np.zeros((h + pad * 2, w + pad * 2), np.float32)
    canvas[pad:pad + h, pad:pad + w] = alpha_crop
    out = np.zeros((*canvas.shape, 4), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = rgb
    out[..., 3] = (canvas * 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(path)
    return Image.fromarray(out, "RGBA")

INK = (24, 23, 20)
CREAM = (244, 240, 228)

# --- 横組みロゴ全体 ---
x0, y0, x1, y1 = bbox(alpha)
whole = alpha[y0:y1, x0:x1]
for name, rgb in (("logo-ink", INK), ("logo-cream", CREAM)):
    im = save(whole, rgb, f"{OUT}/{name}.png", pad_ratio=0.01)
    im.resize((1200, max(1, round(1200 * im.height / im.width))), Image.LANCZOS).save(f"{OUT}/{name}-1200.png")
print("横組みロゴ:", whole.shape[1], "x", whole.shape[0])

# --- とうもろこしのマークだけを切り出す ---
# 列ごとのインク量を見て、マークと文字の間の空白で切る
col = (alpha > 0.35).sum(axis=0)
start = int(np.argmax(col > 0))
# マークと文字の間にある最初のまとまった空白で切る
gap = None
run = 0
for x in range(start, len(col)):
    if col[x] == 0:
        run += 1
        if run >= 15:
            gap = x - run
            break
    else:
        run = 0
assert gap, "マークと文字の区切りが見つかりません"
mark = alpha[:, start:gap]
my0, mx0, my1, mx1 = 0, 0, 0, 0
ys, xs = np.where(mark > 0.35)
mark = mark[ys.min():ys.max() + 1, xs.min() + 0:xs.max() + 1]
print("マーク:", mark.shape[1], "x", mark.shape[0])

# 正方形のクリーム地に載せる（ファビコン・OG画像用）
SIZE = 1024
scale = (SIZE * 0.66) / max(mark.shape)
mh, mw = round(mark.shape[0] * scale), round(mark.shape[1] * scale)
mark_img = Image.fromarray((mark * 255).astype(np.uint8), "L").resize((mw, mh), Image.LANCZOS)
plate = Image.new("RGB", (SIZE, SIZE), CREAM)
ink_layer = Image.new("RGB", (mw, mh), INK)
plate.paste(ink_layer, ((SIZE - mw) // 2, (SIZE - mh) // 2), mark_img)
plate.save(f"{OUT}/mark-1024.png")
for s in (512, 180, 32):
    plate.resize((s, s), Image.LANCZOS).save(f"{OUT}/mark-{s}.png")

# 透過のマーク（ヘッダー用）
save(mark, INK, f"{OUT}/mark-ink.png", pad_ratio=0.03)
save(mark, CREAM, f"{OUT}/mark-cream.png", pad_ratio=0.03)
print("書き出し完了")
