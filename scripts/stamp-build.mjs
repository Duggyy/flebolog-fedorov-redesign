#!/usr/bin/env node
/**
 * Штамп сборки: записывает в папку сборки, из какого коммита она сделана.
 *
 * Зачем: «устаревшая сборка» — самая коварная проблема выкладки. Папка
 * выглядит нормально, а внутри либо старый код, либо (как было 2026-09-15)
 * index.html ссылается на удалённые бандлы. По датам файлов это не проверить
 * надёжно: сборка и коммит идут вплотную. Поэтому фиксируем SHA явно.
 *
 * Запуск: node scripts/stamp-build.mjs --dist dist-dafedorov --app site
 * Вызывается последним шагом в build:site / build:clinicbase.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const outDir = path.resolve(rootDir, readFlag("--dist", "dist-dafedorov"));
const app = readFlag("--app", "site");

if (!fs.existsSync(outDir)) {
  console.error(`stamp-build: папки ${path.relative(rootDir, outDir)} нет — сначала соберите проект`);
  process.exit(1);
}

const git = (gitArgs) => {
  try {
    return execFileSync("git", gitArgs, { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

const sha = git(["rev-parse", "HEAD"]);
const subject = git(["log", "-1", "--format=%s"]);
// Незакоммиченные правки означают, что сборка может не соответствовать коммиту.
const dirty = git(["status", "--porcelain"]).length > 0;

const info = {
  app,
  sha,
  shortSha: sha.slice(0, 7),
  subject,
  builtAt: new Date().toISOString(),
  dirty,
};

fs.writeFileSync(
  path.join(outDir, ".build-info.json"),
  JSON.stringify(info, null, 2) + "\n",
  "utf8",
);

console.log(
  `stamp-build: ${path.relative(rootDir, outDir)} ← ${info.shortSha}${dirty ? " (рабочее дерево грязное)" : ""}`,
);
