#!/usr/bin/env node
/**
 * Аудит внутренних ссылок сайта.
 *
 * Проходит по всем URL из sitemap.xml, собирает все внутренние <a href> и
 * проверяет, что каждая ведёт на реальную страницу, а не на 404-заглушку.
 *
 * ⚠️ Проверяет по заголовку h1, а не по коду ответа. Сайт — чистый SPA:
 * `.htaccess` переписывает любой неизвестный путь на index.html, поэтому
 * несуществующая страница отдаёт **200** с текстом «Страница не найдена»
 * (soft-404). Проверка статуса такой битый линк не найдёт.
 *
 * Запуск (нужен работающий сервер — дев или `vite preview`):
 *   npm run audit:links                          # http://127.0.0.1:4182
 *   npm run audit:links -- https://dafedorov.ru  # по живому сайту после выкладки
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const EXECUTABLE =
  process.env.HOME +
  "/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

// ⚠️ Именно fileURLToPath, а не new URL(...).pathname: в имени папки проекта
// есть пробел, и pathname вернул бы его как %20 — путь бы не открылся.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || "http://127.0.0.1:4182").replace(/\/$/, "");

// Список страниц берём из sitemap сборки; для живого сайта — с самого сайта.
const localSitemap = path.join(rootDir, "dist-dafedorov/sitemap.xml");
let pages;
if (BASE.startsWith("http://127.0.0.1") || BASE.startsWith("http://localhost")) {
  const xml = fs.readFileSync(localSitemap, "utf8");
  pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
} else {
  const response = await fetch(`${BASE}/sitemap.xml`);
  const xml = await response.text();
  pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

console.log(`Аудит ссылок: ${pages.length} страниц из sitemap, база ${BASE}\n`);

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const isNotFound = (h1) => /не найдена|не найден/i.test(h1 || "");

async function inspect(pathname) {
  const response = await page.goto(BASE + pathname, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(350);
  const data = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim() ?? "",
    links: [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && h.startsWith("/") && !h.startsWith("//")),
  }));
  return { status: response?.status() ?? 0, ...data };
}

// --- 1. Страницы из sitemap должны открываться -------------------------------
const brokenPages = [];
const linkSources = new Map();

for (const pathname of pages) {
  const { status, h1, links } = await inspect(pathname);
  if (status !== 200 || isNotFound(h1)) {
    brokenPages.push(pathname);
    console.log(`  ОШИБКА ${pathname} — статус ${status}, h1="${h1}"`);
  }
  for (const href of links) {
    const clean = href.split("#")[0].split("?")[0];
    if (!clean || clean === pathname) continue;
    if (!linkSources.has(clean)) linkSources.set(clean, []);
    const from = linkSources.get(clean);
    if (!from.includes(pathname)) from.push(pathname);
  }
}

console.log(
  brokenPages.length === 0
    ? `  OK    все ${pages.length} страниц из sitemap открываются`
    : `  ОШИБКА ${brokenPages.length} из ${pages.length} страниц не открываются`,
);

// --- 2. Каждая внутренняя ссылка должна вести на живую страницу --------------
const targets = [...linkSources.keys()].sort();
console.log(`\nПроверяю ${targets.length} уникальных внутренних ссылок…\n`);

const deadLinks = [];
for (const target of targets) {
  const { status, h1 } = await inspect(target);
  if (status !== 200 || isNotFound(h1)) deadLinks.push({ target, status, h1 });
}

if (deadLinks.length === 0) {
  console.log(`  OK    все ${targets.length} внутренних ссылок ведут на живые страницы`);
} else {
  for (const { target, status, h1 } of deadLinks) {
    const from = linkSources.get(target) || [];
    console.log(`  ОШИБКА ${target} — статус ${status}, h1="${h1}"`);
    console.log(
      `         ведёт со страниц: ${from.slice(0, 4).join(", ")}${from.length > 4 ? ` …(+${from.length - 4})` : ""}`,
    );
  }
  console.log(`\n  ИТОГО битых внутренних ссылок: ${deadLinks.length}`);
}

await browser.close();
process.exit(brokenPages.length + deadLinks.length === 0 ? 0 : 1);
