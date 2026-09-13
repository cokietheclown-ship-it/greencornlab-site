import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APPS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "apps");
const ALL_LANGS = ["ja", "en"];
const KINDS = ["support", "privacy"];

/**
 * src/_data/apps/*.json を読み込み、生成すべきページの組み合わせを組み立てる。
 * アプリを1本増やすときは apps/ に JSON を1ファイル置くだけでよい。
 */
export default async function () {
  const files = (await readdir(APPS_DIR)).filter((f) => f.endsWith(".json")).sort();
  const apps = [];
  for (const file of files) {
    const app = JSON.parse(await readFile(path.join(APPS_DIR, file), "utf8"));
    if (!app.languages?.length) throw new Error(`${file}: languages が空です`);
    if (!app.languages.includes(app.defaultLanguage)) {
      throw new Error(`${file}: defaultLanguage "${app.defaultLanguage}" が languages に含まれていません`);
    }
    // 対応言語として宣言した以上、翻訳漏れがあればビルドを失敗させる
    // （黙って日本語のまま英語ページに出てしまうのを防ぐ）
    const required = [
      ["name", app.name],
      ["description", app.description],
      ["privacy.dataCollected", app.privacy?.dataCollected],
      ["privacy.dataDeletion", app.privacy?.dataDeletion]
    ];
    if (app.privacy?.features?.includes("subscription")) required.push(["subscription", app.subscription]);
    for (const lang of app.languages) {
      for (const [label, value] of required) {
        if (value?.[lang] === undefined) throw new Error(`${file}: ${label}.${lang} がありません`);
      }
    }
    // GDPR / COPPA の節は構造だけ用意してあり、本文は未記載。
    // 中身を書かないまま有効化して公開してしまわないように、ここで止める。
    for (const region of app.privacy?.regions ?? []) {
      if (region !== "jp") {
        throw new Error(
          `${file}: regions に "${region}" が指定されていますが、対応する節の本文がまだありません。` +
            ` TODO-legal.md のチェックリストを埋め、src/_includes/content/privacy/ の該当ファイルを書いてから、` +
            ` src/_data/pages.js のこのガードを外してください。`
        );
      }
    }
    apps.push(app);
  }

  const targets = (kind) => apps.flatMap((app) => app.languages.map((lang) => ({ app, lang, kind })));

  // 対応していない言語のURLを踏んだ場合に、そのアプリの既定言語へ送るスタブページ
  const fallbacks = apps.flatMap((app) =>
    ALL_LANGS.filter((lang) => !app.languages.includes(lang)).flatMap((lang) =>
      KINDS.map((page) => ({ app, lang, kind: "fallback", page }))
    )
  );

  // 紹介ページは任意。JSON に intro を書いたアプリ・書いた言語だけ生成する。
  // サポートとポリシーは全アプリに必要だが、紹介文は書けたものから順に増やしたいため。
  const intro = apps.flatMap((app) =>
    app.languages
      .filter((lang) => app.intro?.[lang])
      .map((lang) => ({ app, lang, kind: "intro" }))
  );

  return {
    languages: ALL_LANGS,
    home: ALL_LANGS.map((lang) => ({ lang, kind: "home" })),
    apps,
    intro,
    support: targets("support"),
    privacy: targets("privacy"),
    fallbacks
  };
}
