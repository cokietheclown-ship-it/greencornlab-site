export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  // 地球儀クイズは素の HTML/JS。テンプレート解釈させず、そのまま配る。
  eleventyConfig.ignores.add("src/globe-quiz/**");
  eleventyConfig.addPassthroughCopy("src/globe-quiz");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

  // 多言語フィールド { ja: "...", en: "..." } から lang を取り出す。
  // 未翻訳の場合は ja にフォールバックする。
  eleventyConfig.addFilter("loc", (value, lang) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    return value[lang] ?? value.ja ?? "";
  });

  // 任意フィールド用。その言語の値が無ければ何も出さない（ja へフォールバックしない）
  eleventyConfig.addFilter("locStrict", (value, lang) => {
    if (value === undefined || value === null) return null;
    return value[lang] ?? null;
  });

  // 文字列中の {app} をアプリ名に差し替える（i18n の共通文言用）
  eleventyConfig.addFilter("fill", (str, vars) => {
    if (typeof str !== "string") return "";
    return str.replace(/\{(\w+)\}/g, (m, key) => (vars && vars[key] !== undefined ? vars[key] : m));
  });

  // App Store リンクにキャンペーントークンを付ける。
  // どのページ経由でストアに飛んだかが App Store Connect の App Analytics で見える。
  eleventyConfig.addFilter("storeLink", (url, campaign) => {
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ct=${encodeURIComponent(campaign)}`;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
