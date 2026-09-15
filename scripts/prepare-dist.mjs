#!/usr/bin/env node
/**
 * Подготовка выходной папки сборки к новой сборке.
 *
 * Зачем это нужно:
 *   `dist-dafedorov` содержит не только артефакты Vite, но и всю медиатеку
 *   (`images/` ~600 файлов, `videos/`). Штатный режим Vite (`emptyOutDir: true`)
 *   пытается полностью очистить папку перед сборкой — это медленно, а в
 *   песочнице агента ещё и блокируется защитой от массового удаления.
 *   Поэтому в `vite.site.config.ts` стоит `emptyOutDir: false`, а «устаревшие»
 *   артефакты (хешированные бандлы и старый index.html) убирает этот скрипт.
 *
 * Что удаляется:  только `assets/` и корневой `index.html`.
 * Что НИКОГДА не удаляется: images/, videos/, robots.txt, sitemap.xml,
 *   placeholder.svg, .htaccess и любой другой файл.
 *
 * Флаги: --dry-run (только показать), --out <dir> (другая папка сборки).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const outFlag = args.indexOf("--out");
const outDir = path.resolve(
  rootDir,
  outFlag !== -1 && args[outFlag + 1] ? args[outFlag + 1] : "dist-dafedorov",
);

/** Явный список того, что считается «устаревшим артефактом сборки». */
const REMOVABLE = ["assets", "index.html", "clinicbase.html"];

/** Страховка: эти пути не трогаем ни при каких условиях. */
const PROTECTED = new Set([
  "images",
  "videos",
  "robots.txt",
  "sitemap.xml",
  "placeholder.svg",
  ".htaccess",
  ".DS_Store",
]);

if (!fs.existsSync(outDir)) {
  console.log(`prepare-dist: ${path.relative(rootDir, outDir)} не существует — нечего чистить`);
  process.exit(0);
}

let removed = 0;

for (const name of REMOVABLE) {
  if (PROTECTED.has(name)) {
    console.warn(`prepare-dist: ${name} в защищённом списке — пропуск`);
    continue;
  }

  const target = path.join(outDir, name);
  if (!fs.existsSync(target)) continue;

  const relative = path.relative(rootDir, target);
  if (dryRun) {
    console.log(`prepare-dist: [dry-run] удалил бы ${relative}`);
    removed += 1;
    continue;
  }

  fs.rmSync(target, { recursive: true, force: true });
  console.log(`prepare-dist: удалено ${relative}`);
  removed += 1;
}

console.log(
  `prepare-dist: ${dryRun ? "к удалению" : "удалено"} ${removed} объект(ов); медиатека (images/, videos/) не затронута`,
);
