# emoco-site 用のリダイレクトページ

現在 App Store Connect に登録されている以下2つのURLを、新サイトへ転送するための
差し替えファイルです。**新サイトが greencornlab.com で表示できることを確認してから**
差し替えてください。順番を間違えると、公開中のアプリからサポート／プライバシーポリシーへ
たどり着けない時間が生まれます。

| 現在のURL | 転送先 |
|---|---|
| `https://cokietheclown-ship-it.github.io/emoco-site/support.html` | `https://greencornlab.com/ja/emoco/support/` |
| `https://cokietheclown-ship-it.github.io/emoco-site/privacy-policy.html` | `https://greencornlab.com/ja/emoco/privacy/` |

## 手順

1. `emoco-site` リポジトリをクローンする
2. このディレクトリの `support.html` と `privacy-policy.html` で既存ファイルを上書きする
3. コミットして push する

App Store Connect 側のURLを新URLへ更新したあとも、この転送ページは残しておいてください。
リリース済みのバージョンや外部からのリンクが旧URLを指している可能性があります。
