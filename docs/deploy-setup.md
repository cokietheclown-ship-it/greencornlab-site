# 公開の手順

> **状況（2026/9/6時点）**: 手順1〜4は完了済み。サイトは https://greencornlab.com で
> HTTPS配信されています。残るのは手順5以降（草案バナーの解除、App Store ConnectのURL差し替え、
> 旧サイトの転送）です。

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

この時点では `https://cokietheclown-ship-it.github.io/greencornlab-site/` で配信されます。
サブパス配信なのでCSSが当たらず崩れて見えますが、独自ドメインを設定すればルート配信になり直ります。

## 3. DNS を設定する（Cloudflare）

greencornlab.com は Cloudflare でDNSを管理しています（ネームサーバが
`laila.ns.cloudflare.com` / `terin.ns.cloudflare.com`）。Cloudflare のダッシュボード →
対象ドメイン → DNS で、以下を設定します。

| Type | Name | Content | Proxy status |
|---|---|---|---|
| CNAME | `greencornlab.com`（またはルートを表す `@`） | `cokietheclown-ship-it.github.io` | **DNS only（グレーの雲）** |
| CNAME | `www` | `cokietheclown-ship-it.github.io` | **DNS only（グレーの雲）** |

> **注意：ルートにパーキングページのCNAMEがある場合**
> Cloudflare Registrar でドメインを取ると、ルートに
> `default-page.registrar.cloudflare.com` へのCNAMEが自動で入ります。
> このレコードはDNS画面から編集・削除できません（「Registrarの設定側で変更してください」
> というエラーになります）。先に
> **ドメイン → 登録 → 対象ドメイン → 設定 → 駐車場ページ →「駐車ページを無効にする」**
> を実行してレコードを消してから、上記のCNAMEを追加してください。

> **メールのレコードは触らないこと**
> greencornlab.com のメールは iCloud+ のカスタムメールドメインで運用しています。
> MX 2件（`mx01`/`mx02.mail.icloud.com`）、SPFのTXT、Appleのドメイン確認TXT、
> `sig1._domainkey` のDKIM CNAME は、変更するとメールが届かなくなります。

- Cloudflare はルートドメインのCNAMEを自動で平坦化（CNAME flattening）するため、
  Aレコードを4つ並べる必要はありません。
- **Proxy は必ずオフ（グレーの雲）にしてください。**オレンジの雲のままだと、
  GitHub が独自ドメイン用のTLS証明書を発行できず、次の手順の "Enforce HTTPS" が
  有効にできません。
- 既存のレコードでルートを別のサービスに向けているものがあれば、削除または変更が必要です。

## 4. GitHub側にカスタムドメインを登録する

**DNSを設定したあとに行ってください。**GitHubがDNSを検証するため、先に登録するとエラーになります。

Settings → Pages → 「カスタムドメイン」欄に `greencornlab.com` を入力して「保存」。

> `src/CNAME` を置いてあっても、この登録は自動では行われません。
> CNAMEファイルが自動反映されるのはブランチ配信のときだけで、
> GitHub Actions 経由のデプロイでは手動登録が必要です。
> （逆に、ここで登録するとGitHubが`main`ブランチにCNAMEファイルをコミットしようとしますが、
> 既にリポジトリにあるため実質的な変更は起きません。）

DNSの検証が通ると「DNS check successful」と表示されます。
証明書の発行（数分〜1時間程度）が終わったら **HTTPSを強制する（Enforce HTTPS）** にチェックを入れます。

## 5. 新サイトが見られることを確認する

- https://greencornlab.com/ → `/ja/` へ振り分けられる
- https://greencornlab.com/ja/emoco/support/
- https://greencornlab.com/ja/emoco/privacy/

## 6. プライバシーポリシーを草案から公開版にする

[../TODO-legal.md](../TODO-legal.md) の「公開前に必ず対応」を片付けます。
特に以下の2つは、公開前に必ず。

- 返信までの目安日数（`◯ 営業日` / `X business days`）を埋める
- `src/_data/site.json` の `privacyDraftBanner` を `false` にして草案バナーを外す

## 7. App Store Connect のURLを差し替える

Emoco の App 情報で、サポートURL・プライバシーポリシーURLを新URLへ更新します。

| 項目 | 新しいURL |
|---|---|
| サポートURL | `https://greencornlab.com/ja/emoco/support/` |
| プライバシーポリシーURL | `https://greencornlab.com/ja/emoco/privacy/` |

## 8. 旧サイトを転送ページに差し替える

最後に、`emoco-site` リポジトリの2ファイルを転送ページへ差し替えます。
手順とファイルは [emoco-site-redirects/](emoco-site-redirects/) にあります。
旧URLはリリース済みのバージョンから参照されている可能性があるため、
転送ページは消さずに残しておいてください。
