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
        // 紹介ページだけは検索結果に出す前提なので、屋号を足さず JSON の見出しをそのまま使う。
        // 紹介文がまだ無いアプリは、アプリ名とキャッチコピーで組み立てる。
        case "intro": {
          const intro = loc(data.app.intro, data.lang);
          if (intro?.title) return intro.title;
          return `${name} － ${loc(data.app.tagline, data.lang).replace(/[。.]$/, "")}`;
        }
        case "support": return `${name} ${t.support.titleSuffix} | ${loc(data.site.name, data.lang)}`;
        case "privacy": return `${name} ${t.privacy.title} | ${loc(data.site.name, data.lang)}`;
        case "fallback": return t.fallback.title;
        case "404": return `${t.notFound.title} | ${loc(data.site.name, data.lang)}`;
        default: return loc(data.site.name, data.lang);
      }
    },

    description: (data) => {
      switch (data.kind) {
        case "intro": {
          const intro = loc(data.app.intro, data.lang);
          return intro?.summary ?? loc(data.app.description, data.lang);
        }
        case "support": return loc(data.app.description, data.lang);
        case "privacy": return `${loc(data.app.name, data.lang)} ${data.t.privacy.title}`;
        case "home": return data.t.home.lead;
        default: return "";
      }
    },

    // SNS に貼られたときのカード画像。アプリのページはそのアプリのアイコンを使う。
    ogImage: (data) =>
      data.app?.icon
        ? `/assets/apps/${data.app.slug}/icon-512.png`
        : "/assets/brand/mark-512.png",

    // iPhone で開いたときに App Store への案内バナーを出す
    smartBannerId: (data) => data.app?.appStore?.id ?? null,

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
      if (data.kind === "intro") {
        return data.app.languages
          .filter((lang) => data.app.status === "released" || data.app.intro?.[lang])
          .map((lang) => ({ lang, url: `/${lang}/${data.app.slug}/` }));
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
