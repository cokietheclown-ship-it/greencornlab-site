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
