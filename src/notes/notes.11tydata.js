/**
 * src/notes/ 以下の記事に共通する設定。
 *
 * 記事はアプリの紹介文と違い、検索から直接入ってくる人が読む。
 * 屋号もアプリ名も知らない状態で開かれるので、<title> には商品名を足さず、
 * 記事自体の見出しをそのまま出す。
 */
export default {
  layout: "layouts/base.njk",
  tags: ["notes"],
  eleventyComputed: {
    lang: (data) => data.lang ?? "ja",
    kind: () => "note",
    t: (data) => data.i18n[data.lang ?? "ja"] ?? data.i18n[data.site.defaultLanguage],
    permalink: (data) => `/${data.lang ?? "ja"}/notes/${data.slug}/`,
    alternates: () => []
  }
};
