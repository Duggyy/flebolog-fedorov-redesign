#!/usr/bin/env node
/**
 * Проверка ЖИВОГО сервера после выкладки.
 *
 * Зачем отдельно от check:deploy. Преддеплойная проверка смотрит локальную
 * папку сборки и ничего не знает о том, что лежит на хостинге. А ломается
 * выкладка именно там, и тихо: файлы на месте, index.html отдаётся, а вход не
 * работает. 23.10.2026 так и вышло — при распаковке архива пропал
 * api/config.php с паролем от базы, API стал отвечать `server_not_configured`,
 * а программа сказала врачу «проверьте логин и пароль». Владелец пошёл искать
 * конфликт с базой.
 *
 * Что проверяется:
 *   1. Сайт отдаётся и ссылается на бандл, который существует.
 *   2. Бандл на сервере — тот же, что в локальной сборке (не забыли выгрузить).
 *   3. data/dictionary-template.json на месте и разбирается.
 *   4. api/index.php отвечает JSON, а не HTML (PHP работает).
 *   5. api/config.php существует: иначе API честно скажет, что не настроен.
 *   6. База доступна: `session` не возвращает database_connection_failed.
 *
 * Запуск:
 *   node scripts/check-live.mjs
 *   node scripts/check-live.mjs --url https://clinicbase.ru
 *
 * Код возврата 1, если есть хотя бы одна ошибка.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = readFlag("--url", "https://clinicbase.ru").replace(/\/$/, "");
const DIST = path.join(rootDir, "dist-clinicbase");

let failures = 0;
const ok = (what, detail = "") => console.log(`  OK    ${what}${detail ? ` — ${detail}` : ""}`);
const fail = (what, detail = "") => {
  failures += 1;
  console.log(`  ОШИБКА ${what}${detail ? ` — ${detail}` : ""}`);
};
const warn = (what, detail = "") => console.log(`  ВНИМ  ${what}${detail ? ` — ${detail}` : ""}`);

const get = async (url) => {
  try {
    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();
    return {
      status: response.status,
      type: response.headers.get("content-type") ?? "",
      text,
    };
  } catch (error) {
    return { status: 0, type: "", text: "", error: String(error) };
  }
};

console.log(`Живая проверка: ${BASE}\n`);

// 1. Главная страница и бандл.
const index = await get(`${BASE}/`);
if (index.status !== 200 || !index.text.includes("<html")) {
  fail("сайт не отдаётся", `HTTP ${index.status}${index.error ? `, ${index.error}` : ""}`);
} else {
  ok("сайт отдаётся", `HTTP 200, ${Math.round(index.text.length / 1024)} КБ`);
}

const remoteBundle = index.text.match(/assets\/(index-[A-Za-z0-9_-]+\.js)/)?.[1] ?? "";
if (!remoteBundle) {
  fail("в index.html нет ссылки на бандл", "страница отдаётся, но собрана неверно");
} else {
  const bundle = await get(`${BASE}/assets/${remoteBundle}`);
  if (bundle.status !== 200 || bundle.text.length < 50_000) {
    fail("бандл не загружается", `${remoteBundle}, HTTP ${bundle.status}`);
  } else {
    ok("бандл на месте", `${remoteBundle}, ${Math.round(bundle.text.length / 1024)} КБ`);
  }

  // 2. Совпадает ли с локальной сборкой.
  const localIndex = path.join(DIST, "index.html");
  if (!fs.existsSync(localIndex)) {
    warn("локальной сборки нет", "не с чем сравнить — запустите npm run build:clinicbase");
  } else {
    const localBundle = fs.readFileSync(localIndex, "utf8").match(/assets\/(index-[A-Za-z0-9_-]+\.js)/)?.[1] ?? "";
    if (!localBundle) {
      warn("в локальной сборке нет ссылки на бандл");
    } else if (localBundle === remoteBundle) {
      ok("на сервере та же сборка, что локально", remoteBundle);
    } else {
      fail("на сервере ДРУГАЯ сборка", `локально ${localBundle}, на сервере ${remoteBundle}`);
    }
  }
}

// 3. Шаблон справочника.
const template = await get(`${BASE}/data/dictionary-template.json`);
if (template.status !== 200) {
  fail("data/dictionary-template.json не отдаётся", `HTTP ${template.status}`);
} else {
  try {
    const parsed = JSON.parse(template.text);
    const entries = Array.isArray(parsed.sections)
      ? parsed.sections.reduce((sum, section) => sum + (section.entries?.length ?? 0), 0)
      : 0;
    if (!entries) {
      fail("шаблон пустой", "файл есть, но записей в нём нет");
    } else {
      ok("шаблон справочника на месте", `${parsed.sections.length} разделов, ${entries} записей`);
    }
  } catch {
    fail("шаблон не разбирается как JSON", "возможно, вместо файла отдаётся страница сайта");
  }
}

// 4. API отвечает JSON — значит PHP на хостинге работает.
const session = await get(`${BASE}/api/index.php?action=session`);
const looksLikeHtml = session.text.trimStart().startsWith("<");
if (looksLikeHtml) {
  fail("api/index.php отдаёт HTML вместо JSON", "PHP не выполняется или файла нет");
} else {
  let payload = null;
  try {
    payload = JSON.parse(session.text);
  } catch {
    payload = null;
  }
  if (!payload) {
    fail("ответ API не разбирается", session.text.slice(0, 120));
  } else if (payload.error === "server_not_configured") {
    fail(
      "на сервере нет api/config.php",
      "именно из-за этого вход не работает: API не знает пароль от базы",
    );
  } else if (payload.error === "database_connection_failed") {
    fail("API не подключается к базе", "проверьте db_name, db_user и db_password в api/config.php");
  } else if (payload.error) {
    fail("API ответил ошибкой", String(payload.error));
  } else {
    ok("API отвечает и база доступна", `session: ${payload.session ? "есть" : "гостя"}`);
  }
}

// 5. config.php существует. Если файла нет, .htaccess отдаёт вместо него
//    страницу сайта — по этому признаку и ловим.
const configProbe = await get(`${BASE}/api/config.php`);
const configIsFallback = configProbe.text.trimStart().toLowerCase().startsWith("<!doctype html");
if (configProbe.status === 200 && configIsFallback) {
  fail("api/config.php отсутствует", "вместо него отдаётся страница сайта — восстановите файл");
} else if (configProbe.status === 200) {
  ok("api/config.php на месте", "файл выполняется, содержимое наружу не отдаётся");
} else {
  warn("api/config.php отвечает не 200", `HTTP ${configProbe.status}`);
}

console.log("\n" + "─".repeat(72));
if (failures === 0) {
  console.log(`ИТОГ: сервер в порядке — ${BASE} можно показывать врачу.`);
  process.exit(0);
}
console.log(`ИТОГ: проблем ${failures}. Разбор — в строках «ОШИБКА» выше.`);
process.exit(1);
