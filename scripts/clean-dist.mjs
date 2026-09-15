#!/usr/bin/env node
/**
 * Уборка остатков прошлых сборок в папке сборки.
 *
 * ⚠️ Запускается ПОСЛЕ `vite build`, а не до. До сборки в папке лежит index.html
 * прошлой сборки, и от него достижимо ровно прошлое поколение — «устаревших»
 * окажется ноль, чистить будет нечего. Смысл появляется только после того, как
 * новый index.html уже записан.
 *
 * Удаляются не «вся папка assets», а только те файлы, до которых нельзя
 * добраться от index.html (см. scripts/lib/asset-graph.mjs — там же про ловушку
 * с картой предзагрузки, из-за которой простой поиск «ни на что не ссылается»
 * не работает). Так безопаснее: нужное не удаляется даже при ошибке в логике.
 *
 * `emptyOutDir: false` в конфигах Vite оставлен намеренно: полная очистка папки
 * сносит медиатеку (`images/` ~610 файлов, `videos/`), а в окружении агента ещё
 * и блокируется защитой от массового удаления.
 *
 * Удаление — best-effort: если что-то удалить не удалось, скрипт предупреждает
 * и завершается успешно. Лишние файлы в папке безвредны, а сорванная сборка — нет.
 *
 * Флаги: --dry-run (только показать), --dist <dir> (другая папка сборки).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findUnreachableAssets } from "./lib/asset-graph.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const distFlag = args.indexOf("--dist");
const outDir = path.resolve(
  rootDir,
  distFlag !== -1 && args[distFlag + 1] ? args[distFlag + 1] : "dist-dafedorov",
);
const rel = path.relative(rootDir, outDir);

if (!fs.existsSync(outDir)) {
  console.log(`clean-dist: ${rel} не существует — нечего чистить`);
  process.exit(0);
}

const { all, reachable, stale } = findUnreachableAssets(outDir);

if (!all.length) {
  console.log(`clean-dist: ${rel} — нет папки assets/ или index.html, пропуск`);
  process.exit(0);
}

if (!stale.length) {
  console.log(`clean-dist: ${rel} — чисто, все ${all.length} файлов нужны`);
  process.exit(0);
}

if (dryRun) {
  console.log(
    `clean-dist: [dry-run] ${rel} — нужны ${reachable.length}, устарели ${stale.length}:`,
  );
  for (const name of stale) console.log(`    ${name}`);
  process.exit(0);
}

const assetsDir = path.join(outDir, "assets");
let removed = 0;
let failed = 0;

for (const name of stale) {
  try {
    fs.rmSync(path.join(assetsDir, name));
    removed += 1;
  } catch (error) {
    failed += 1;
    if (failed === 1) {
      const reason = /BULK_CONFIRM_REQUIRED/.test(String(error))
        ? "сработала защита от массового удаления"
        : String(error?.message || error).split("\n")[0];
      console.warn(`clean-dist: не удалось удалить файлы (${reason}) — продолжаю`);
    }
  }
}

console.log(
  `clean-dist: ${rel} — удалено ${removed} из ${stale.length} остатков прошлых сборок` +
    (failed ? `, не удалось ${failed}` : "") +
    `; нужных файлов ${reachable.length}`,
);

if (failed) {
  console.warn(
    "clean-dist: остатки остались в assets/ — на работоспособность не влияют, " +
      "выкладывать их не нужно; повторить уборку: npm run dist:clean",
  );
}
