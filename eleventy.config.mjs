export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
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
