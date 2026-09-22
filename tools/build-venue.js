#!/usr/bin/env node
/* ゴルフ場専用版のビルドスクリプト。
   docs/pc.html（共有エンジン）に venues/<slug>.json の内容を埋め込んだコピーを、
   dist/<slug>/ 以下に作る。エンジン本体は書き換えない。

   使い方:
     node tools/build-venue.js venues/sample-cc.json
     node tools/build-venue.js --all          venues/ 内の全JSONを一括ビルド
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ENGINE = path.join(ROOT, "docs", "pc.html");
const SW_SRC = path.join(ROOT, "docs", "sw.js");
const MANIFEST_SRC = path.join(ROOT, "docs", "pc.webmanifest");
const ICONS = ["icon-192.png", "icon-512.png", "icon-512-maskable.png", "apple-touch-icon.png"];
const VENUES_DIR = path.join(ROOT, "venues");
const DIST_DIR = path.join(ROOT, "dist");

const PLACEHOLDER = `<script id="venueConfig">window.VENUE_CONFIG = null;</script>`;

function loadConfig(file) {
  const raw = fs.readFileSync(file, "utf8");
  const cfg = JSON.parse(raw);
  if (!cfg.slug) throw new Error(`${file}: slug は必須です`);
  if (!/^[a-zA-Z0-9-]+$/.test(cfg.slug)) throw new Error(`${file}: slug は英数字とハイフンのみ（値: ${cfg.slug}）`);
  if (!cfg.name) throw new Error(`${file}: name は必須です`);
  return cfg;
}

function buildOne(cfgFile) {
  const cfg = loadConfig(cfgFile);
  const engineSrc = fs.readFileSync(ENGINE, "utf8");
  if (!engineSrc.includes(PLACEHOLDER)) {
    throw new Error(
      "docs/pc.html に venue-config の差し込み位置（venueConfig プレースホルダ）が見つかりません。" +
      "エンジン側の構造が変わった場合はこのビルドスクリプトも更新してください。"
    );
  }
  const injected = `<script id="venueConfig">window.VENUE_CONFIG = ${JSON.stringify(cfg)};</script>`;
  const out = engineSrc.replace(PLACEHOLDER, injected);

  const outDir = path.join(DIST_DIR, cfg.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "pc.html"), out, "utf8");

  // 転送ページ（既存 docs/index.html と同じ役割。venueスラッグを持たない共有URLは無いため常に pc.html へ）
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=pc.html"><a href="pc.html">${cfg.name}｜CompeMaster Pro</a>\n`,
    "utf8"
  );

  // manifest（ゴルフ場名でホーム画面に追加されるように）
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_SRC, "utf8"));
  manifest.name = `${cfg.name}｜CompeMaster Pro`;
  manifest.short_name = cfg.name.length <= 12 ? cfg.name : "CompeMaster";
  manifest.id = `/golf-compe-pc/${cfg.slug}/`;
  if (cfg.themeColor) { manifest.theme_color = cfg.themeColor; }
  fs.writeFileSync(path.join(outDir, "pc.webmanifest"), JSON.stringify(manifest, null, 2), "utf8");

  fs.copyFileSync(SW_SRC, path.join(outDir, "sw.js"));
  for (const icon of ICONS) {
    const src = path.join(ROOT, "docs", icon);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, icon));
  }

  console.log(`OK  ${cfg.slug}  →  dist/${cfg.slug}/  (${cfg.name})`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("使い方: node tools/build-venue.js <venues/xxx.json> | --all");
    process.exit(1);
  }
  if (args[0] === "--all") {
    const files = fs.readdirSync(VENUES_DIR).filter(f => f.endsWith(".json"));
    if (files.length === 0) { console.error("venues/ に .json がありません"); process.exit(1); }
    for (const f of files) buildOne(path.join(VENUES_DIR, f));
  } else {
    for (const f of args) buildOne(path.isAbsolute(f) ? f : path.join(ROOT, f));
  }
}

main();
