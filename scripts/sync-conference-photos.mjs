#!/usr/bin/env node
/**
 * Проверяет и при необходимости докачивает фотографии конференций со старого
 * сайта flebologfedorov.ru.
 *
 * Для каждого альбома из `src/components/conference-gallery-data.ts` скрипт
 * открывает страницу галереи `/?design=114&gallery=NN` и сверяет её содержимое
 * с локальными папками `public/images/conferences/<папка>/`:
 *
 *   - `photo-NN.jpg` — полноразмерное фото (href ссылки lightbox на старом сайте);
 *   - `thumb-NN.jpg` — миниатюра (src <img> на старом сайте).
 *
 * Скачиваются ТОЛЬКО отсутствующие файлы. Ничего не удаляется и не
 * перезаписывается. Каждый скачанный файл проверяется по magic bytes: старый
 * сайт умеет отдавать HTML-страницу ошибки вместо картинки, и такой ответ
 * нужно отбросить, а не сохранять как .jpg.
 *
 * Запуск:
 *   npm run photos:sync            — проверить и докачать отсутствующее
 *   npm run photos:sync -- --dry-run   — только отчёт, ничего не качать
 *   npm run photos:sync -- --dist      — заодно доложить файлы в dist-dafedorov
 *   npm run photos:sync -- --verbose   — подробный вывод по каждому файлу
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  readdirSync,
  copyFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = "src/components/conference-gallery-data.ts";
const IMAGES_REL = "public/images/conferences";
const DIST_REL = "dist-dafedorov/images/conferences";

const SITE = "https://flebologfedorov.ru";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const VERBOSE = args.has("--verbose");
const WITH_DIST = args.has("--dist");

/** Пауза между запросами: старый сайт блокирует при массовой загрузке. */
const REQUEST_DELAY_MS = 350;
const PAGE_DELAY_MS = 2500;
const RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Разбор makeAlbum("slug", "title", "folder", galleryId, count). */
const parseAlbums = (src) => {
  const pattern = /makeAlbum\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  const found = [...src.matchAll(pattern)].map((m) => ({
    slug: m[1],
    title: m[2],
    folder: m[3],
    galleryId: Number(m[4]),
    count: Number(m[5]),
  }));
  if (!found.length) throw new Error(`Не удалось извлечь альбомы из ${DATA_FILE}`);
  return found;
};

/** Разметка страницы галереи: href = полное фото, src = миниатюра. */
const ITEM_PATTERN =
  /<div class='flebo-galery2-item item-inner2'>\s*<a class='link__inner'\s+href='([^']+)'[^>]*>\s*<img\s+src='([^']+)'/g;

const fetchWithRetry = async (url, { binary = false, retries = RETRIES } = {}) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: binary ? "image/*,*/*" : "text/html,*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return binary ? Buffer.from(await response.arrayBuffer()) : await response.text();
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(1500 * attempt);
    }
  }
  return null;
};

const isJpeg = (buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

/** Атомарная запись: сначала во временный файл, потом переименование. */
const writeAtomic = (target, buffer) => {
  const tmp = `${target}.tmp`;
  writeFileSync(tmp, buffer);
  renameSync(tmp, target);
};

const localPath = (folder, name) => path.join(root, IMAGES_REL, folder, name);
const distPath = (folder, name) => path.join(root, DIST_REL, folder, name);

const existsNonEmpty = (file) => existsSync(file) && statSync(file).size > 0;

const main = async () => {
  const albums = parseAlbums(readFileSync(path.join(root, DATA_FILE), "utf8"));

  console.log(`Альбомов в данных: ${albums.length}`);
  if (DRY_RUN) console.log("Режим: только проверка (--dry-run), ничего не будет скачано.");
  console.log("");

  const summary = { downloaded: 0, missingBefore: 0, problems: [], countMismatch: [] };
  const header = `${"альбом".padEnd(46)}${"сайт".padStart(6)}${"данные".padStart(8)}${"photo".padStart(7)}${"thumb".padStart(7)}  статус`;
  console.log(header);
  console.log("-".repeat(header.length));

  for (const album of albums) {
    const pageUrl = `${SITE}/?design=114&gallery=${album.galleryId}`;
    let html;
    try {
      html = await fetchWithRetry(pageUrl);
    } catch (error) {
      summary.problems.push(`${album.folder}: страница галереи недоступна (${error.message})`);
      console.log(`${album.folder.padEnd(46)}${album.galleryId.toString().padStart(6)}  ОШИБКА: ${error.message}`);
      await sleep(PAGE_DELAY_MS);
      continue;
    }

    const items = [...html.matchAll(ITEM_PATTERN)].map((m) => ({ full: m[1], thumb: m[2] }));
    const dir = path.join(root, IMAGES_REL, album.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    let localPhoto = 0;
    let localThumb = 0;
    let downloadedHere = 0;

    for (let index = 0; index < items.length; index += 1) {
      const number = String(index + 1).padStart(2, "0");
      const targets = [
        { name: `photo-${number}.jpg`, url: items[index].full, kind: "photo" },
        { name: `thumb-${number}.jpg`, url: items[index].thumb, kind: "thumb" },
      ];

      for (const target of targets) {
        const file = localPath(album.folder, target.name);
        if (existsNonEmpty(file)) {
          if (target.kind === "photo") localPhoto += 1;
          else localThumb += 1;
          if (VERBOSE) console.log(`   = ${album.folder}/${target.name}`);
          continue;
        }

        summary.missingBefore += 1;
        if (DRY_RUN) {
          console.log(`   + ${album.folder}/${target.name} (нужно скачать)`);
          continue;
        }

        await sleep(REQUEST_DELAY_MS);
        let buffer;
        try {
          buffer = await fetchWithRetry(`${SITE}${target.url}`, { binary: true });
        } catch (error) {
          summary.problems.push(`${album.folder}/${target.name}: не скачалось (${error.message})`);
          console.log(`   ! ${album.folder}/${target.name}: ${error.message}`);
          continue;
        }

        if (!isJpeg(buffer)) {
          summary.problems.push(`${album.folder}/${target.name}: сервер вернул не JPEG`);
          console.log(`   ! ${album.folder}/${target.name}: ответ не JPEG — пропущено`);
          continue;
        }

        writeAtomic(file, buffer);
        downloadedHere += 1;
        summary.downloaded += 1;
        if (target.kind === "photo") localPhoto += 1;
        else localThumb += 1;
        console.log(`   + ${album.folder}/${target.name} (${Math.round(buffer.length / 1024)} КБ)`);
      }
    }

    const expected = items.length;
    if (expected !== album.count) {
      summary.countMismatch.push(`${album.folder}: на сайте ${expected} фото, в данных count=${album.count}`);
    }
    const status =
      expected === album.count && localPhoto === expected && localThumb === expected
        ? "OK"
        : `ВНИМАНИЕ (photo=${localPhoto}, thumb=${localThumb}, ожидалось ${expected})`;
    console.log(
      `${album.folder.padEnd(46)}${expected.toString().padStart(6)}${album.count.toString().padStart(8)}` +
        `${localPhoto.toString().padStart(7)}${localThumb.toString().padStart(7)}  ${status}` +
        (downloadedHere ? `  +${downloadedHere}` : ""),
    );

    await sleep(PAGE_DELAY_MS);
  }

  if (WITH_DIST && existsSync(path.join(root, DIST_REL))) {
    console.log("\nКопирую отсутствующее в dist-dafedorov (только добавление)...");
    let copied = 0;
    for (const album of albums) {
      const sourceDir = path.join(root, IMAGES_REL, album.folder);
      if (!existsSync(sourceDir)) continue;
      for (const name of readdirSync(sourceDir)) {
        const source = path.join(sourceDir, name);
        const target = distPath(album.folder, name);
        if (existsNonEmpty(target)) continue;
        mkdirSync(path.dirname(target), { recursive: true });
        copyFileSync(source, target);
        copied += 1;
      }
    }
    console.log(`  скопировано в dist: ${copied}`);
  } else if (WITH_DIST) {
    console.log(`\n${DIST_REL} не найден — пропускаю.`);
  }

  console.log("");
  console.log(`Скачано файлов: ${summary.downloaded}`);
  console.log(`Отсутствовало до запуска: ${summary.missingBefore}`);
  if (summary.countMismatch.length) {
    console.log("\nРасхождение количества (обновите count в данных):");
    for (const line of summary.countMismatch) console.log(`  - ${line}`);
  }
  if (summary.problems.length) {
    console.log("\nПроблемы:");
    for (const line of summary.problems) console.log(`  - ${line}`);
    process.exitCode = 1;
  } else if (!summary.downloaded && !summary.missingBefore) {
    console.log("\nВсе альбомы полны: в каждой папке есть и thumb, и photo.");
  }
};

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
