# 法務・運用の確認事項

プライバシーポリシーは草案です。公開前に以下を確認してください。

## 公開前に必ず対応

- [ ] 弁護士等の専門家によるレビュー（特に児童のデータを扱う点）
- [ ] `src/_data/site.json` の `privacyDraftBanner` を `false` にして、ページ上部の「草案です」バナーを外す
- [ ] `src/_data/i18n/ja.json` の `support.responseTime` の「◯ 営業日」を実際の日数に置き換える
- [ ] `src/_data/i18n/en.json` の `support.responseTime` の「X business days」を同じ日数に置き換える
- [ ] `src/_data/site.json` の `operator`（事業者名の表記）を確定する。現状は「Green Corn Lab（運営者：Kenji Kawazoe）」
- [ ] メールアドレス3件の受信設定（`support@` / `privacy@` / 各アプリ個別）
- [ ] App Store Connect のサポートURL・プライバシーポリシーURLを新URLへ更新する

## 断定できず、確認が必要な記述

いずれも本文を書いてありますが、法的な位置づけを確認してください。

- [ ] 「開示等の請求について」の節。記録内容が開発者へ送信されないことを根拠に、
      開発者は開示・訂正・削除の対象となる保有個人データを持たない、と書いています。
      個人情報保護法上この整理でよいか確認してください。
      （該当キー: `privacy.disclosureBody` / ja・en）
- [ ] 「お問い合わせの際に取得する情報」の節。メールアドレスと本文を回答と不具合調査に
      のみ利用する、と書いています。保存期間の方針を書くかどうかを含めて確認してください。
      （該当キー: `privacy.inquiryDataBody` / ja・en）
- [ ] 「解約は次回更新日の24時間以上前に」というAppleの一般的な案内を、そのまま載せています。
      現行のApple の記載と一致しているか、公開前に確認してください。
      （該当キー: `support.faq.cancelA` / ja・en）
- [ ] App Store の Kids Category に登録するかどうか。登録する場合は追加要件
      （外部リンク・課金導線・第三者解析の制限）との整合を確認する

## 海外配信するときに対応

`src/_data/apps/<slug>.json` の `privacy.regions` に `"eu"` や `"us"` を足すと、
本文が未記載のままなのでビルドが失敗します。以下を埋めてから有効化してください。

- [ ] GDPR: `src/_includes/content/privacy/gdpr.njk` のTODO一覧を埋める
      （管理者情報／処理の法的根拠／子どもの同意年齢／データ主体の権利／保存期間／
        越境移転／EU域内代理人（Art.27）／監督機関への苦情申立て）
- [ ] COPPA: `src/_includes/content/privacy/coppa.njk` のTODO一覧を埋める
      （運営者の連絡先／収集する情報／検証可能な保護者の同意／保護者の権利／保存期間）
- [ ] 上記を書いたら `src/_data/pages.js` の region ガードを外す
