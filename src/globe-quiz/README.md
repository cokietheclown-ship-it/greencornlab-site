# ブルーマーブル国あて

立体地球儀で国の位置と名前を当てるクイズ。`/globe-quiz/` で公開される。

- `index.html` — アプリ本体。ライブラリ非依存の素の WebGL 1 本で、
  球体・雲・大気・星空・国境線をすべて自前のシェーダで描いている。
- `assets/earth-*.jpg` — NASA *Blue Marble Next Generation*（昼・夜・地形・水域・雲）。
  パブリックドメイン。[three-globe](https://github.com/vasturiano/three-globe) の
  配布物をリサイズして使っている。
- `assets/countries.json` — Natural Earth 1:50m の国境（[world-atlas](https://github.com/topojson/world-atlas) 経由）に、
  [world-countries](https://github.com/mledoze/countries) の日本語国名・首都・地域・面積を結合したもの。
  座標は小数点以下 2 桁（約 1.1 km）に丸めてある。

## 3 つのモード

| モード | 内容 |
| --- | --- |
| 探索 | 国を押すと名前・首都・地域・面積が出る。国名検索つき |
| 場所あて | 国名が出るので、その国を地球儀の上で押す |
| 国名あて | 光っている国の名前を 4 択で選ぶ |

出題範囲（地域）・難易度（国の面積）・問題数と、雲／夜景／国境線／自動回転／実時刻の日照は
設定パネルから変えられる（`localStorage` に保存）。

## 1 ファイル版を作る

画像と国境データを埋め込んだ単体 HTML を書き出す。サーバ不要でそのまま開ける。

```sh
node tools/build-globe-quiz-standalone.mjs            # _site/globe-quiz-standalone.html
node tools/build-globe-quiz-standalone.mjs --fragment out.html   # html/head/body なしの断片
```
