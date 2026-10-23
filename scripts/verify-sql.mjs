// Разбор SQL-файла на утверждения: проверяем, что импорт не развалится
// из-за забытой точки с запятой, дубля или пустого PREPARE.
import fs from "node:fs";

const file = process.argv[2];
const sql = fs.readFileSync(file, "utf8");

const statements = [];
let buf = "";
let inString = false;
let inLineComment = false;

for (let i = 0; i < sql.length; i++) {
  const ch = sql[i];
  const next = sql[i + 1];

  if (inLineComment) {
    buf += ch;
    if (ch === "\n") inLineComment = false;
    continue;
  }
  if (!inString && ch === "-" && next === "-") {
    inLineComment = true;
    buf += ch;
    continue;
  }
  if (ch === "'" && !inLineComment) {
    // Экранирование в MySQL: '' и \'
    if (inString && next === "'") {
      buf += ch + next;
      i++;
      continue;
    }
    if (inString && sql[i - 1] === "\\") {
      buf += ch;
      continue;
    }
    inString = !inString;
    buf += ch;
    continue;
  }
  if (!inString && ch === ";") {
    statements.push(buf.trim());
    buf = "";
    continue;
  }
  buf += ch;
}
if (buf.trim()) statements.push(buf.trim());

const clean = statements.filter((s) => s.replace(/--[^\n]*/g, "").trim().length > 0);

console.log(`файл: ${file}`);
console.log(`утверждений: ${clean.length}`);

const kinds = {};
for (const s of clean) {
  const body = s.replace(/--[^\n]*/g, "").trim();
  const kind = body.split(/\s+/).slice(0, 2).join(" ").toUpperCase();
  kinds[kind] = (kinds[kind] || 0) + 1;
}
console.log("по видам:", JSON.stringify(kinds, null, 0));

// Дубликаты: одинаковые утверждения без комментариев.
const seen = new Map();
for (const s of clean) {
  const body = s.replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim();
  seen.set(body, (seen.get(body) || 0) + 1);
}
const dupes = [...seen.entries()].filter(([, n]) => n > 1);
console.log("дубликатов:", dupes.length);
for (const [body, n] of dupes) console.log(`  x${n}: ${body.slice(0, 120)}`);

// Каждый PREPARE должен иметь EXECUTE и DEALLOCATE.
const prepares = clean.filter((s) => /^PREPARE\b/i.test(s.replace(/--[^\n]*/g, "").trim())).length;
const executes = clean.filter((s) => /^EXECUTE\b/i.test(s.replace(/--[^\n]*/g, "").trim())).length;
const deallocs = clean.filter((s) => /^DEALLOCATE\b/i.test(s.replace(/--[^\n]*/g, "").trim())).length;
console.log(`PREPARE ${prepares} / EXECUTE ${executes} / DEALLOCATE ${deallocs}`);
if (prepares !== executes || executes !== deallocs) {
  console.log("ОШИБКА: блоки PREPARE непарные");
  process.exit(1);
}

// Не должно остаться незакрытых строковых литералов.
if (inString) {
  console.log("ОШИБКА: незакрытая кавычка");
  process.exit(1);
}
console.log("последнее утверждение:", clean[clean.length - 1].replace(/--[^\n]*/g, "").replace(/\s+/g, " ").trim().slice(0, 160));
