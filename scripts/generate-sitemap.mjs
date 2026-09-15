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
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://dafedorov.ru").replace(/\/+$/, "");

const read = (rel) => readFileSync(path.join(root, rel), "utf8");

/**
 * lastmod берём из САМОГО МАТЕРИАЛА (поле `date`, дд.мм.гггг → ISO), а не из
 * времени изменения файла.
 *
 * ⚠️ Почему не mtime файла: mtime меняется от любой правки файла (поправил одну
 * публикацию — «изменились» все 10) и от самого `git clone` (после свежего
 * клона все даты становятся сегодняшними). Карта сайта начинала врать про
 * изменение всех страниц при каждой сборке, и поисковики перестают доверять
 * lastmod. Дата публикации стабильна и честна: тексты материалов статичны.
 *
 * Если у материала даты нет — lastmod НЕ выводим вовсе: отсутствующий тег
 * лучше выдуманного.
 */
const DATA = {
  news: "src/components/news-data.ts",
  blog: "src/components/blog-data.ts",
  conferences: "src/components/conference-gallery-data.ts",
  methods: "src/components/methods-data.ts",
};

const unique = (list) => [...new Set(list)];

/** Слаги из данных (для файлов без разбора на объекты). */
const slugs = (file, pattern) => {
  const src = read(file);
  const found = [...src.matchAll(pattern)].map((m) => m[1]);
  if (!found.length) throw new Error(`Не удалось извлечь слаги из ${file}`);
  return unique(found);
};

/**
 * Разбирает файл данных на объекты-материалы и достаёт пару (slug, дата).
 * Объекты закрываются ровно двумя пробелами и `},` — вложенные блоки глубже,
 * поэтому разделение по `\n  },\n` не рвёт материалы.
 */
const parseItems = (file) => {
  const src = read(file);
  const items = src.split(/\n  \},\n/).flatMap((chunk) => {
    const slug = chunk.match(/slug:\s*"([^"]+)"/);
    if (!slug) return [];
    const date = chunk.match(/date:\s*"(\d{2})\.(\d{2})\.(\d{4})"/);
    return [{ slug: slug[1], date: date ? `${date[3]}-${date[2]}-${date[1]}` : null }];
  });
  if (!items.length) throw new Error(`Не удалось разобрать материалы в ${file}`);
  return items;
};

const newsItems = parseItems(DATA.news);
const blogItems = parseItems(DATA.blog);
const albumSlugs = slugs(DATA.conferences, /makeAlbum\(\s*"([^"]+)"/g);
const methodSlugs = slugs(DATA.methods, /slug:\s*"([^"]+)"/g);

// Материал без даты — не молчаливая потеря lastmod, а повод сказать об этом.
for (const [label, items] of [
  ["новостей", newsItems],
  ["блога", blogItems],
]) {
  const withoutDate = items.filter((i) => !i.date).map((i) => i.slug);
  if (withoutDate.length) {
    console.warn(`sitemap.xml: у ${withoutDate.length} материал(ов) ${label} нет даты, lastmod не выводится: ${withoutDate.join(", ")}`);
  }
}

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
  ...newsItems.map(({ slug, date }) => ({ loc: `/news/${slug}`, lastmod: date, priority: "0.6" })),
  ...blogItems.map(({ slug, date }) => ({ loc: `/blog/${slug}`, lastmod: date, priority: "0.6" })),
  // У альбомов и страниц методов даты публикации нет — lastmod не выводим.
  ...albumSlugs.map((s) => ({ loc: `/conference-photos/${s}`, lastmod: null, priority: "0.5" })),
  ...methodSlugs.map((s) => ({ loc: `/methods/${s}`, lastmod: null, priority: "0.7" })),
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
  `sitemap.xml: ${entries.length} URL (${staticRoutes.length} статических, ${newsItems.length} новостей, ${blogItems.length} блога, ${albumSlugs.length} альбомов, ${methodSlugs.length} методов) -> ${SITE_URL}`,
);
