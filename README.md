# greencornlab-site

Green Corn Lab のサポートサイト。App Store Connect に登録するサポートURLと
プライバシーポリシーURLを提供する静的サイトです。

- 公開先: https://greencornlab.com
- ビルド: [Eleventy](https://www.11ty.dev/) v3（依存はこれ1つ。出力は素のHTML+CSS、クライアントJSは言語振り分けのみ）
- ホスティング: GitHub Pages（main への push で自動デプロイ）

## 使い方

```bash
npm install
npm run build     # _site/ に出力
npm run serve     # http://localhost:8080 で確認
```

## アプリを1本追加する

`src/_data/apps/` に JSON を1ファイル置くだけで、サポートページと
プライバシーポリシーページが `languages` に書いた言語の分だけ生成されます。

1. `docs/app-entry-example.json` をコピーして `src/_data/apps/<slug>.json` を作る
2. `slug` / `name` / `languages` / `email` / `description` などを埋める
3. `npm run build` で確認して push

`languages` に書いた言語の訳が抜けていると、ビルドがエラーで止まります
（英語ページに日本語がそのまま出るのを防ぐため）。

追記したい文章がある場合だけ、以下を置きます（無ければ無視されます）。

- `src/_includes/content/apps/<slug>/support-<lang>.njk` … サポートページのFAQ末尾に追記
- `src/_includes/content/apps/<slug>/privacy-<lang>.njk` … ポリシー末尾に追記

## URL

| URL | 内容 |
|---|---|
| `/` | ブラウザの言語設定で `/ja/` か `/en/` へ振り分け（判定できなければ日本語） |
| `/ja/`, `/en/` | Green Corn Lab の紹介とアプリ一覧 |
| `/<lang>/<slug>/support/` | サポートページ |
| `/<lang>/<slug>/privacy/` | プライバシーポリシー |
| `/404.html` | 見つからないページ（日英併記） |

アプリが対応していない言語のURL（例: 日本語のみのアプリの `/en/emoco/support/`）は、
`noindex` 付きのスタブを生成し、そのアプリの既定言語のページへ転送します。
静的ホスティングでサーバー側のリライトが使えないため、この方式にしています。

## 文章の直し方

- UI文言・共通の本文 … `src/_data/i18n/ja.json` / `en.json`（キーは日英で同じ構成）
- アプリ固有の事実 … `src/_data/apps/<slug>.json`
- ページの組み立て … `src/_includes/content/support/body.njk` / `privacy/body.njk`

プライバシーポリシーは草案です。公開前に [TODO-legal.md](TODO-legal.md) を確認してください。

## 独自ドメインの設定

`src/CNAME` に `greencornlab.com` を置いてあり、ビルド出力にそのままコピーされます。
ただしGitHub Actions経由のデプロイでは、このファイルだけではカスタムドメインが有効になりません。
Cloudflare側のDNS設定（ルートとwwwのCNAMEを `cokietheclown-ship-it.github.io` へ、Proxyはオフ）と、
GitHubのSettings → Pagesでのカスタムドメイン登録の両方が必要です。

手順は [docs/deploy-setup.md](docs/deploy-setup.md) にまとめてあります。

## デプロイ

`.github/workflows/deploy.yml` が main への push で走ります。
初回のみ、リポジトリ設定 → Pages → Source を **GitHub Actions** に切り替えてください。

初回の公開手順（リポジトリ作成・DNS・App Store ConnectのURL差し替え・旧サイトの転送）は
[docs/deploy-setup.md](docs/deploy-setup.md) を参照してください。

## 画像とロゴ

- `src/assets/brand/logo-source.png` … 支給されたロゴの原本
- `tools/make-brand.py` … 原本から、ヘッダー用の横組みロゴ（ライト／ダーク用の2色）、
  ファビコン・OG画像用の正方形マークを書き出す。`python3 tools/make-brand.py` で再生成できる
- `src/assets/apps/<slug>/icon-192.png` `icon-512.png` … 各アプリのアイコン
- `src/assets/apps/<slug>/screenshot-N.jpg` … App Store に登録済みのスクリーンショット（幅600px）

アプリを追加するときは、アイコンとスクリーンショットも同じ場所に置き、
データファイルの `icon` と `screenshots`（枚数）を設定してください。

## SEO まわり

- `/sitemap.xml` と `/robots.txt` は `src/sitemap.njk` `src/robots.njk` から生成されます
- OGP・Twitterカード・構造化データ（JSON-LD）は `src/_includes/layouts/base.njk` にまとめてあります
- App Store へのリンクには `storeLink` フィルタでキャンペーントークン（`ct=`）が付きます。
  どのページ経由でストアに飛んだかが App Store Connect の App Analytics で確認できます
- iPhone で開いたときの App Store 案内バナー（スマートアプリバナー）は、
  データファイルに `appStore.id` があるアプリのページに出ます

## 視覚効果

CSSが主体で、JavaScriptは `src/assets/js/enhance.js`（約3.5KB）だけです。

- **紙のざらつき** … `body::after` にSVGノイズを薄く重ねる（CSSのみ）
- **アプリごとの色** … `tools/extract-app-colors.py` が各アイコンから代表色を抜き出し、
  `src/_data/appColors.json` に書き出す。紹介ページのヒーローの下地に使う。
  アイコンを差し替えたら再実行してください
- **スクロールで現れる** … `data-reveal` を付けた要素。JavaScriptが動いているときだけ隠れる
- **スクリーンショットのページ送り** … ドットと矢印をJavaScriptで組み立てる

JavaScriptが動かない場合の扱い:

- `<head>` の小さなスクリプトが `js-anim` を付け、4秒経っても `enhance.js` が動かなければ外す。
  つまり読み込みに失敗しても内容は必ず表示される
- OSの「視差効果を減らす」設定が有効なときは、そもそもアニメーションを使わない
- ページ送りのドットと矢印は、JavaScriptが無ければ表示されない（横スクロールはそのまま使える）
