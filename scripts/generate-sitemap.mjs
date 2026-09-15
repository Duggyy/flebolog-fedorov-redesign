#!/usr/bin/env node
/**
 * Генерирует public/sitemap.xml из данных сайта.
 *
 * Слаги берутся из тех же файлов, что использует приложение, поэтому карта
 * сайта не расходится с реальными маршрутами. Запускается перед сборкой сайта
 * (`npm run build:site`), вручную — `npm run sitemap`.
 *
 * Базовый адрес: переменная окружения SITE_URL, иначе https://dafedorov.ru
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://dafedorov.ru").replace(/\/+$/, "");

const read = (rel) => readFileSync(path.join(root, rel), "utf8");

/** Даты изменения исходников — честный lastmod, без выдуманных значений. */
const lastmodOf = (rel) => {
  try {
    return statSync(path.join(root, rel)).mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

const DATA = {
  news: "src/components/news-data.ts",
  blog: "src/components/blog-data.ts",
  conferences: "src/components/conference-gallery-data.ts",
};

const unique = (list) => [...new Set(list)];

// --- слаги из данных ---------------------------------------------------------
const slugs = (file, pattern) => {
  const src = read(file);
  const found = [...src.matchAll(pattern)].map((m) => m[1]);
  if (!found.length) throw new Error(`Не удалось извлечь слаги из ${file}`);
  return unique(found);
};

const newsSlugs = slugs(DATA.news, /slug:\s*"([^"]+)"/g);
const blogSlugs = slugs(DATA.blog, /slug:\s*"([^"]+)"/g);
const albumSlugs = slugs(DATA.conferences, /makeAlbum\(\s*"([^"]+)"/g);

// --- статические маршруты ----------------------------------------------------
const staticRoutes = [
  "/",
  "/doctor",
  "/phlebology",
  "/news",
  "/reviews",
  "/varikoz",
  "/tromboflebit",
  "/zvezdochki",
  "/yazvy",
  "/conference-photos",
  "/colleagues",
  "/reports",
  "/blog",
  "/aesthetic-results",
];

const entries = [
  ...staticRoutes.map((route) => ({ loc: route, lastmod: null, priority: route === "/" ? "1.0" : "0.8" })),
  ...newsSlugs.map((s) => ({ loc: `/news/${s}`, lastmod: lastmodOf(DATA.news), priority: "0.6" })),
  ...blogSlugs.map((s) => ({ loc: `/blog/${s}`, lastmod: lastmodOf(DATA.blog), priority: "0.6" })),
  ...albumSlugs.map((s) => ({
    loc: `/conference-photos/${s}`,
    lastmod: lastmodOf(DATA.conferences),
    priority: "0.5",
  })),
];

const escapeXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(({ loc, lastmod, priority }) => {
    const lines = [`    <loc>${escapeXml(SITE_URL + loc)}</loc>`];
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
    if (priority) lines.push(`    <priority>${priority}</priority>`);
    return `  <url>\n${lines.join("\n")}\n  </url>`;
  })
  .join("\n")}
</urlset>
`;

const out = path.join(root, "public/sitemap.xml");
writeFileSync(out, xml, "utf8");
console.log(
  `sitemap.xml: ${entries.length} URL (${staticRoutes.length} статических, ${newsSlugs.length} новостей, ${blogSlugs.length} блога, ${albumSlugs.length} альбомов) -> ${SITE_URL}`,
);
