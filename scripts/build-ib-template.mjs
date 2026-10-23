#!/usr/bin/env node
/**
 * Собирает справочник из «Шаблон ИБ 2026_10.docx».
 *
 * В документе нет стилей Word: раздел — это просто жирный абзац, а записи —
 * обычные. Поэтому структура читается по форматированию, а не по оглавлению,
 * и привязка «раздел документа → поле формы» задана руками в SECTION_MAP:
 * названия в шаблоне и в форме не совпадают («Anamnes morbi» против «Анамнез
 * заболевания»), и угадывать их автоматически значило бы молча потерять
 * раздел, которого нет в форме.
 *
 * Результат — public-clinicbase/data/dictionary-template.json. Он уезжает
 * вместе со сборкой, и приложение грузит его кнопкой «Загрузить шаблон ИБ»:
 * так доктор видит, что загрузилось, и может отменить одним щелчком.
 *
 * Запуск: node scripts/build-ib-template.mjs [путь-к-docx]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docxPath =
  process.argv[2] ??
  path.join(
    process.env.HOME ?? "",
    "Downloads/-=ФЕДОР САЙТ 19.03.2026=-/-=БАЗА ДАННЫХ=-/Шаблон ИБ 2026_10.docx",
  );
const outPath = path.join(rootDir, "public-clinicbase/data/dictionary-template.json");

/**
 * Раздел документа → поля формы, куда он ложится.
 *
 * Пустой массив — «в форме нет такого поля». Такие записи не выбрасываем
 * молча: они попадают в отчёт, чтобы владелец видел, что осталось за бортом.
 */
const SECTION_MAP = [
  { from: "Жалобы:", to: ["Жалобы"] },
  { from: "Anamnes morbi:", to: ["Анамнез заболевания"] },
  // Всё содержимое раздела — про голени, язвы и пигментацию, то есть осмотр
  // нижних конечностей. «Общий осмотр» в шаблоне — отдельный, из одной фразы.
  { from: "Осмотр, кожные покровы:", to: ["Локальный осмотр"] },
  // Формулировки УЗИ не называют сторону, поэтому идут в оба поля.
  {
    from: "УЗИ: МПВ:",
    to: ["Правая нижняя конечность: бассейн МПВ", "Левая нижняя конечность: бассейн МПВ"],
  },
  {
    from: "УЗИ БПВ:",
    to: ["Правая нижняя конечность: бассейн БПВ", "Левая нижняя конечность: бассейн БПВ"],
  },
  { from: "Вены:", to: ["Локальный осмотр"] },
  { from: "ТАЭ:", to: ["Локальный осмотр"] },
  { from: "Перенесенные заболевания", to: ["Перенесенные заболевания"] },
  { from: "Перенесенные операции:", to: ["Перенесенные операции"] },
  { from: "Аллергоанамнез:", to: ["Аллергии"] },
  { from: "Семейный анамнез:", to: ["Наследственность по основному заболеванию"] },
  { from: "ПОВОД ОБРАЩЕНИЯ:", to: [] },
  { from: "СЛУЧАЙ ОБРАЩЕНИЯ:", to: [] },
  { from: "Общий осмотр:", to: ["Общий осмотр"] },
  { from: "РЕЖИМ:", to: ["Режим"] },
  { from: "Классификация диагноза:", to: [] },
  { from: "ДИАГНОЗ:", to: ["Основное заболевание"] },
  { from: "Код МКБ10:", to: ["Код МКБ"] },
  { from: "Медикаментозная терапия:", to: ["Медикаментозная терапия"] },
  { from: "Режим:", to: ["Режим"] },
  { from: "Рекомендации:", to: ["Рекомендации"] },
  { from: "Поле ЗАМЕТКИ ДОКТОРА:", to: ["Комментарии доктора"] },
  { from: "Перевязка:", to: [] },
  { from: "Название операции:", to: ["Название и локализация"] },
  { from: "Вид операции:", to: [] },
  { from: "Описание операции:", to: ["Выполнено"] },
  { from: "Клинические данные:", to: [] },
];

/** Заголовки, которые не открывают раздел: титул, коды МКБ, служебное «-и». */
const NOT_A_HEADER = /^(Шаблон ИБ|I\d{2}\.\d|-и$|ОПЕРАЦИЯ$)/;

const decode = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** Абзацы документа: жирный — заголовок раздела, обычный — запись. */
const readParagraphs = (file) => {
  const xml = execFileSync("unzip", ["-p", file, "word/document.xml"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  // ⚠️ Именно `<w:t(?:\s[^>]*)?>`, а не `<w:t[^>]*>`: второй шаблон цепляет
  // `<w:tab/>` и съедает следующий тег вместе с текстом — в документе так
  // появлялись строки вида «I87.8<w:t>Другие уточнённые поражения вен».
  const textTag = /<w:t(?:\s[^>]*)?>(.*?)<\/w:t>/gs;
  return [...xml.matchAll(/<w:p\b[^>]*>(.*?)<\/w:p>/gs)].map(([, body]) => {
    const text = decode([...body.matchAll(textTag)].map((m) => m[1]).join("")).trim();
    return { text, bold: /<w:b\/>|<w:b\s/.test(body) };
  });
};

const paragraphs = readParagraphs(docxPath);

// Разбиваем на разделы по жирным заголовкам.
const sections = [];
let current = null;
for (const { text, bold } of paragraphs) {
  if (bold && text && !NOT_A_HEADER.test(text)) {
    current = { title: text, entries: [] };
    sections.push(current);
    continue;
  }
  if (current && text) current.entries.push(text);
}

// Раскладываем по полям формы, сохраняя порядок появления в документе.
const byField = new Map();
const skipped = [];
const unknown = [];

for (const section of sections) {
  if (section.entries.length === 0) continue;
  const mapping = SECTION_MAP.find((item) => item.from === section.title);
  if (!mapping) {
    unknown.push({ title: section.title, count: section.entries.length });
    continue;
  }
  if (mapping.to.length === 0) {
    skipped.push({ title: section.title, count: section.entries.length, entries: section.entries });
    continue;
  }
  for (const field of mapping.to) {
    const bucket = byField.get(field) ?? [];
    for (const entry of section.entries) {
      if (!bucket.includes(entry)) bucket.push(entry);
    }
    byField.set(field, bucket);
  }
}

const payload = {
  version: "2026-10",
  source: path.basename(docxPath),
  generatedAt: new Date().toISOString(),
  sections: [...byField.entries()].map(([title, entries]) => ({ title, entries })),
  skipped,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 1) + "\n", "utf8");

const total = payload.sections.reduce((sum, section) => sum + section.entries.length, 0);
console.log(`Шаблон: ${path.basename(docxPath)}`);
console.log(`Разделов документа: ${sections.length}, полей заполнено: ${payload.sections.length}`);
console.log(`Записей в справочник: ${total}`);
for (const section of payload.sections) {
  console.log(`  ${String(section.entries.length).padStart(3)}  ${section.title}`);
}
if (skipped.length) {
  const count = skipped.reduce((sum, item) => sum + item.count, 0);
  console.log(`\nНе вошло (нет поля в форме): ${count}`);
  for (const item of skipped) console.log(`  ${String(item.count).padStart(3)}  ${item.title}`);
}
if (unknown.length) {
  console.log("\n⚠️ Разделы без правила привязки — проверьте SECTION_MAP:");
  for (const item of unknown) console.log(`  ${String(item.count).padStart(3)}  ${item.title}`);
  process.exitCode = 1;
}
console.log(`\nЗаписано: ${path.relative(rootDir, outPath)}`);
