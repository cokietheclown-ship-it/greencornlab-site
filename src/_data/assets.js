import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CSS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "css", "style.css");

/**
 * スタイルシートのURLに中身のハッシュを付けるための値。
 * これがないと、デプロイ後に古いCSSがキャッシュされたまま新しいHTMLが表示され、
 * レイアウトが崩れた状態が最大10分ほど残る。
 */
export default async function () {
  const css = await readFile(CSS, "utf8");
  return { cssVersion: createHash("sha1").update(css).digest("hex").slice(0, 8) };
}
