/**
 * src/pages/ 以下の全テンプレートに共通する計算プロパティ。
 * pagination の各要素は alias "target" で渡ってくる。
 *   - トップページ      : { lang }
 *   - サポート/ポリシー : { app, lang, kind }
 *   - フォールバック    : { app, lang, kind }（未対応言語 → 既定言語へ送るスタブ）
 */
const loc = (value, lang) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.ja ?? "";
};

export default {
  layout: "layouts/base.njk",
  eleventyComputed: {
    lang: (data) => data.target?.lang ?? data.site.defaultLanguage,
    kind: (data) => data.target?.kind ?? data.pageKind,
    app: (data) => data.target?.app ?? null,
    t: (data) => data.i18n[data.lang] ?? data.i18n[data.site.defaultLanguage],

    title: (data) => {
      const t = data.t;
      const name = data.app ? loc(data.app.name, data.lang) : "";
      switch (data.kind) {
        case "support": return `${name} ${t.support.titleSuffix} | ${loc(data.site.name, data.lang)}`;
        case "privacy": return `${name} ${t.privacy.title} | ${loc(data.site.name, data.lang)}`;
        case "fallback": return t.fallback.title;
        case "404": return `${t.notFound.title} | ${loc(data.site.name, data.lang)}`;
        default: return loc(data.site.name, data.lang);
      }
    },

    description: (data) => {
      switch (data.kind) {
        case "support": return loc(data.app.description, data.lang);
        case "privacy": return `${loc(data.app.name, data.lang)} ${data.t.privacy.title}`;
        case "home": return data.t.home.lead;
        default: return "";
      }
    },

    // 未対応言語のURLは既定言語へ送り、検索エンジンには載せない
    redirectTo: (data) =>
      data.kind === "fallback"
        ? `/${data.target.app.defaultLanguage}/${data.target.app.slug}/${data.target.page}/`
        : null,
    noindex: (data) => data.kind === "fallback" || data.kind === "404",

    // hreflang（そのアプリが対応している言語だけ）
    alternates: (data) => {
      if (data.kind === "home") {
        return data.pages.languages.map((lang) => ({ lang, url: `/${lang}/` }));
      }
      if (data.kind === "support" || data.kind === "privacy") {
        return data.app.languages.map((lang) => ({
          lang,
          url: `/${lang}/${data.app.slug}/${data.kind}/`
        }));
      }
      return [];
    }
  }
};
