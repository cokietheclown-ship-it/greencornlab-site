#!/usr/bin/env node
/**
 * src/globe-quiz/ を 1 枚の HTML にまとめる。
 * 画像は data URI、国境データは window.__COUNTRIES__ として埋め込むので、
 * ファイルサーバなしでもそのまま開ける。
 *
 *   node tools/build-globe-quiz-standalone.mjs [出力先]
 *   --fragment  … <html>/<head>/<body> を外し、中身だけを出力する
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src/globe-quiz");
const args = process.argv.slice(2);
const fragment = args.includes("--fragment");
const outPath = args.find(a => !a.startsWith("--")) || path.join(root, "_site/globe-quiz-standalone.html");

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const dataURI = rel => {
  const file = path.join(srcDir, rel);
  return `data:${MIME[path.extname(file)]};base64,${fs.readFileSync(file).toString("base64")}`;
};

let html = fs.readFileSync(path.join(srcDir, "index.html"), "utf8");

// 画像 5 枚を data URI に置き換える
for (const key of ["day", "night", "topo", "water", "clouds"]) {
  const m = html.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!m) throw new Error("asset entry not found: " + key);
  html = html.replace(m[0], `${key}: "${dataURI(m[1])}"`);
}

// 単体ファイルには assets/ が無いので、そこを指す link は落とす
html = html
  .replace(/^\s*<link rel="manifest"[^>]*>\s*$/mi, "")
  .replace(/^\s*<link rel="(?:apple-touch-)?icon"[^>]*>\s*$/gmi, "");

// 国境データは fetch させず、グローバル変数として先に置く
const countries = fs.readFileSync(path.join(srcDir, "assets/countries.json"), "utf8");
html = html.replace("<script>\n\"use strict\";\n/* ====", `<script>window.__COUNTRIES__=${countries};</script>\n<script>\n"use strict";\n/* ====`);

if (fragment) {
  const head = html.slice(html.indexOf("<head>") + 6, html.indexOf("</head>"))
    .replace(/<meta charset[^>]*>\s*/i, "")
    .replace(/<meta name="viewport"[^>]*>\s*/i, "");
  const body = html.slice(html.indexOf("<body>") + 6, html.lastIndexOf("</body>"));
  html = head.trim() + "\n" + body;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(`${path.relative(root, outPath)}  ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`);
