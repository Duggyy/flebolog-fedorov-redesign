#!/usr/bin/env node
/**
 * Преддеплойная проверка собранного сайта.
 *
 * Заменяет ручной чеклист: запускать по папке сборки, а не по памяти.
 * Проверяет именно то, на чём легко обжечься при выкладке:
 *   • сборка сделана из текущего коммита (штамп .build-info.json против HEAD);
 *   • index.html не ссылается на несуществующие бандлы;
 *   • на месте .htaccess, sitemap.xml, robots.txt, data/*.json, api/*.php;
 *   • JSON парсится, sitemap.xml корректно закрыт и содержит <loc>;
 *   • в .htaccess есть правила кэша для JSON;
 *   • медиатека (images/, videos/) не пустая.
 *
 * Запуск:  node scripts/predeploy-check.mjs                    # dist-dafedorov
 *          node scripts/predeploy-check.mjs --clinicbase        # dist-clinicbase
 *          node scripts/predeploy-check.mjs --dist dist-other
 * Код возврата 1, если есть хотя бы одна ошибка (можно вешать перед выкладкой).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const isClinicbase = args.includes("--clinicbase");
const distIndex = args.indexOf("--dist");
const distName = distIndex !== -1 && args[distIndex + 1]
  ? args[distIndex + 1]
  : isClinicbase
    ? "dist-clinicbase"
    : "dist-dafedorov";

const distDir = path.resolve(rootDir, distName);
const rel = path.relative(rootDir, distDir) || distName;

let errors = 0;
let warnings = 0;
const ok = (label, detail = "") => console.log(`  OK    ${label}${detail ? " — " + detail : ""}`);
const warn = (label, detail = "") => {
  warnings += 1;
  console.log(`  ВНИМ  ${label}${detail ? " — " + detail : ""}`);
};
const fail = (label, detail = "") => {
  errors += 1;
  console.log(`  ОШИБКА ${label}${detail ? " — " + detail : ""}`);
};

console.log(`Преддеплойная проверка: ${rel}${isClinicbase ? " (clinicbase)" : ""}\n`);

// --------------------------------------------------------------------------
// 1. Папка существует
// --------------------------------------------------------------------------
if (!fs.existsSync(distDir)) {
  fail(`папки ${rel} нет`, "запустите npm run build:site");
  process.exit(1);
}
ok("папка сборки существует");

// --------------------------------------------------------------------------
// 2. Сборка соответствует текущему коммиту
// --------------------------------------------------------------------------
const headSha = (() => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
})();

const stampPath = path.join(distDir, ".build-info.json");
if (!fs.existsSync(stampPath)) {
  warn("нет штампа сборки (.build-info.json)", "пересоберите: npm run build:site");
} else {
  const stamp = JSON.parse(fs.readFileSync(stampPath, "utf8"));
  const built = new Date(stamp.builtAt);
  const when = `${built.toLocaleString("ru-RU")}`;
  if (stamp.sha === headSha) {
    ok(`сборка из текущего коммита`, `${stamp.shortSha}, ${when}`);
  } else {
    warn(
      "сборка сделана НЕ из текущего коммита",
      `собрано ${stamp.shortSha}, сейчас HEAD ${headSha.slice(0, 7)} — пересоберите перед выкладкой`,
    );
  }
  if (stamp.dirty) {
    warn("сборка сделана при незакоммиченных правках", "код в сборке может отличаться от коммита");
  }
}

// --------------------------------------------------------------------------
// 3. index.html и его ссылки на бандлы
// --------------------------------------------------------------------------
const indexPath = path.join(distDir, "index.html");
if (!fs.existsSync(indexPath)) {
  fail("нет index.html", "сборка неполная — пересоберите");
} else {
  const html = fs.readFileSync(indexPath, "utf8");
  ok("index.html на месте", `${(fs.statSync(indexPath).size / 1024).toFixed(1)} КБ`);

  const refs = [...new Set(html.match(/(?:src|href)="([^"]*assets\/[^"]+)"/g) || [])].map(
    (m) => m.replace(/^(?:src|href)="/, "").replace(/"$/, ""),
  );

  if (refs.length === 0) {
    warn("в index.html нет ссылок на assets/", "возможно, всё заинлайнено");
  } else {
    const missing = refs.filter((r) => !fs.existsSync(path.join(distDir, r.replace(/^\//, ""))));
    if (missing.length === 0) {
      ok(`все ссылки на бандлы существуют`, `${refs.length} шт.`);
    } else {
      fail(
        "index.html ссылается на несуществующие файлы",
        `${missing.join(", ")} — сборка полуразрушена, пересоберите (npm run build:site)`,
      );
    }
  }
}

// --------------------------------------------------------------------------
// 3b. Устаревшие бандлы от прошлых сборок
//    Сборка может не суметь очистить assets/ (защита от массового удаления).
//    Тогда там остаются бандлы прошлых сборок. Они безвредны, но незачем
//    выкладывать — считаем «нулевыми» те, на которые никто не ссылается.
// --------------------------------------------------------------------------
const assetsDir = path.join(distDir, "assets");
if (fs.existsSync(assetsDir) && fs.existsSync(indexPath)) {
  const assetFiles = fs.readdirSync(assetsDir).filter((f) => fs.statSync(path.join(assetsDir, f)).isFile());
  const htmlContent = fs.readFileSync(indexPath, "utf8");

  // Для каждого JS/CSS храним его содержимое, чтобы исключить самоссылку:
  // имя файла внутри него самого не считается использованием.
  const codeContents = new Map(
    assetFiles
      .filter((f) => /\.(js|css)$/.test(f))
      .map((f) => [f, fs.readFileSync(path.join(assetsDir, f), "utf8")]),
  );

  const orphans = assetFiles.filter((name) => {
    const others = [...codeContents.entries()]
      .filter(([file]) => file !== name)
      .map(([, content]) => content)
      .join("\n");
    return !htmlContent.includes(name) && !others.includes(name);
  });

  if (orphans.length === 0) {
    ok("в assets/ нет брошенных файлов", `${assetFiles.length} шт.`);
  } else {
    warn(
      `в assets/ ${orphans.length} файл(ов), на которые никто не ссылается`,
      `${orphans.slice(0, 3).join(", ")}${orphans.length > 3 ? " …" : ""} — остатки прошлых сборок; ` +
        `выкладывать не нужно, убрать: npm run dist:clean && npm run build:site`,
    );
  }
}

// --------------------------------------------------------------------------
// 4. Обязательные файлы
// --------------------------------------------------------------------------
const siteRequired = [
  ".htaccess",
  "robots.txt",
  "sitemap.xml",
  "placeholder.svg",
  "data/prodoctorov-reviews.json",
  "api/prodoctorov-reviews.php",
];
const clinicbaseRequired = [".htaccess", "robots.txt", "api/index.php"];
const required = isClinicbase ? clinicbaseRequired : siteRequired;

const missingRequired = required.filter((f) => !fs.existsSync(path.join(distDir, f)));
if (missingRequired.length === 0) {
  ok("обязательные файлы на месте", `${required.length} шт.`);
} else {
  fail("отсутствуют обязательные файлы", missingRequired.join(", "));
}

// --------------------------------------------------------------------------
// 5. JSON парсится
// --------------------------------------------------------------------------
const dataDir = path.join(distDir, "data");
if (fs.existsSync(dataDir)) {
  const jsonFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const bad = [];
  for (const file of jsonFiles) {
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
      if (parsed === null || typeof parsed !== "object") bad.push(`${file} (не объект)`);
    } catch (e) {
      bad.push(`${file} (${e.message})`);
    }
  }
  if (bad.length === 0) ok("JSON в data/ парсится", jsonFiles.join(", "));
  else fail("битый JSON в data/", bad.join(", "));
}

// --------------------------------------------------------------------------
// 6. sitemap.xml
// --------------------------------------------------------------------------
const sitemapPath = path.join(distDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locs = xml.match(/<loc>[^<]+<\/loc>/g) || [];
  const problems = [];
  if (locs.length === 0) problems.push("нет ни одного <loc>");
  if (!xml.includes("</urlset>")) problems.push("не закрыт </urlset>");
  const wrongHost = [...new Set((xml.match(/<loc>(https?:\/\/[^/]+)/g) || []).map((m) => m.replace("<loc>", "")))];
  if (wrongHost.length > 1) problems.push(`разные хосты: ${wrongHost.join(", ")}`);

  if (problems.length === 0) ok("sitemap.xml корректен", `${locs.length} URL, хост ${wrongHost[0] || "—"}`);
  else fail("проблемы в sitemap.xml", problems.join("; "));
} else if (!isClinicbase) {
  fail("нет sitemap.xml");
}

// --------------------------------------------------------------------------
// 7. Кэш JSON в .htaccess (иначе браузер и CDN держат устаревшие отзывы)
// --------------------------------------------------------------------------
const htaccessPath = path.join(distDir, ".htaccess");
if (fs.existsSync(htaccessPath)) {
  const ht = fs.readFileSync(htaccessPath, "utf8");
  if (isClinicbase) {
    ok(".htaccess на месте");
  } else {
    const checks = [
      ["mod_rewrite", /RewriteRule/],
      ["кэш JSON", /application\/json/],
      ["Cache-Control", /Cache-Control/],
    ];
    const missing = checks.filter(([, re]) => !re.test(ht)).map(([name]) => name);
    if (missing.length === 0) ok(".htaccess: rewrite, кэш JSON, Cache-Control");
    else warn("в .htaccess нет правил", missing.join(", "));
  }
}

// --------------------------------------------------------------------------
// 8. Медиатека
// --------------------------------------------------------------------------
if (!isClinicbase) {
  const countFiles = (dir) => {
    const abs = path.join(distDir, dir);
    if (!fs.existsSync(abs)) return 0;
    let n = 0;
    const walk = (d) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(path.join(d, entry.name));
        else n += 1;
      }
    };
    walk(abs);
    return n;
  };

  const images = countFiles("images");
  const videos = countFiles("videos");
  if (images > 400 && videos > 10) ok("медиатека на месте", `images ${images}, videos ${videos}`);
  else fail("медиатека неполная", `images ${images}, videos ${videos} — ожидалось ~610 и ~21`);
}

// --------------------------------------------------------------------------
// Итог
// --------------------------------------------------------------------------
console.log("");
if (errors === 0) {
  console.log(
    warnings === 0
      ? `ИТОГ: всё чисто — ${rel} можно выкладывать.`
      : `ИТОГ: ошибок нет, но есть ${warnings} предупреждени(й) — посмотрите выше.`,
  );
} else {
  console.log(`ИТОГ: ${errors} ошибк(и) — выкладывать НЕЛЬЗЯ, сначала исправьте.`);
}
process.exit(errors === 0 ? 0 : 1);
