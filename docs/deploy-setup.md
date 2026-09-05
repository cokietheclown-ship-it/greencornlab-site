# 公開の手順

初回だけ必要な作業です。上から順に実行してください。
**順番が大事です。**公開中の Emoco のサポートURL／プライバシーポリシーURLを、
新サイトが動く前に切り替えてしまわないようにしています。

## 1. GitHubリポジトリを作る

- オーナー: `cokietheclown-ship-it`
- リポジトリ名: `greencornlab-site`
- 公開設定: **Public**（無料アカウントで GitHub Pages を使うには公開が必要）
- README・.gitignore・ライセンスは追加しない（ローカルに既にあるため）

ブラウザで https://github.com/new から作成したあと、このディレクトリで:

```bash
git remote add origin https://github.com/cokietheclown-ship-it/greencornlab-site.git
git branch -M main
git push -u origin main
```

## 2. GitHub Pages を有効にする

リポジトリの Settings → Pages → **Source を「GitHub Actions」に変更**。

`.github/workflows/deploy.yml` が main への push で走ります。
Actions タブでビルドが緑になることを確認してください。

この時点では、まだ `https://cokietheclown-ship-it.github.io/greencornlab-site/` では
見られません（`src/CNAME` があるため、GitHub は独自ドメイン前提で配信します）。次の手順へ。

## 3. DNS を設定する（Cloudflare）

greencornlab.com は Cloudflare でDNSを管理しています（ネームサーバが
`laila.ns.cloudflare.com` / `terin.ns.cloudflare.com`）。Cloudflare のダッシュボード →
対象ドメイン → DNS で、以下を設定します。

| Type | Name | Content | Proxy status |
|---|---|---|---|
| CNAME | `greencornlab.com`（またはルートを表す `@`） | `cokietheclown-ship-it.github.io` | **DNS only（グレーの雲）** |
| CNAME | `www` | `cokietheclown-ship-it.github.io` | **DNS only（グレーの雲）** |

- Cloudflare はルートドメインのCNAMEを自動で平坦化（CNAME flattening）するため、
  Aレコードを4つ並べる必要はありません。
- **Proxy は必ずオフ（グレーの雲）にしてください。**オレンジの雲のままだと、
  GitHub が独自ドメイン用のTLS証明書を発行できず、次の手順の "Enforce HTTPS" が
  有効にできません。
- 既存のレコードでルートを別のサービスに向けているものがあれば、削除または変更が必要です。

反映後、GitHub の Settings → Pages に `greencornlab.com` が表示され、
証明書の発行（数分〜1時間程度）が終わったら **Enforce HTTPS** にチェックを入れます。

## 4. 新サイトが見られることを確認する

- https://greencornlab.com/ → `/ja/` へ振り分けられる
- https://greencornlab.com/ja/emoco/support/
- https://greencornlab.com/ja/emoco/privacy/

## 5. プライバシーポリシーを草案から公開版にする

[../TODO-legal.md](../TODO-legal.md) の「公開前に必ず対応」を片付けます。
特に以下の2つは、公開前に必ず。

- 返信までの目安日数（`◯ 営業日` / `X business days`）を埋める
- `src/_data/site.json` の `privacyDraftBanner` を `false` にして草案バナーを外す

## 6. App Store Connect のURLを差し替える

Emoco の App 情報で、サポートURL・プライバシーポリシーURLを新URLへ更新します。

| 項目 | 新しいURL |
|---|---|
| サポートURL | `https://greencornlab.com/ja/emoco/support/` |
| プライバシーポリシーURL | `https://greencornlab.com/ja/emoco/privacy/` |

## 7. 旧サイトを転送ページに差し替える

最後に、`emoco-site` リポジトリの2ファイルを転送ページへ差し替えます。
手順とファイルは [emoco-site-redirects/](emoco-site-redirects/) にあります。
旧URLはリリース済みのバージョンから参照されている可能性があるため、
転送ページは消さずに残しておいてください。
