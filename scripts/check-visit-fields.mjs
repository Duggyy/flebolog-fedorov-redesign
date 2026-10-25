#!/usr/bin/env node
/**
 * Сверка полей приёма в трёх местах, где они перечислены руками.
 *
 * Поле приёма живёт в трёх списках: тип `Visit` в программе, карта
 * «клиент → столбец» при чтении (`visit_to_client`) и такая же карта при записи
 * (`upsert_visit`), плюс сам столбец в `clinicbase.mysql.sql`. Списки длиной
 * под полсотни строк, и разъезжаются они молча:
 *
 *  - добавили поле в форму и в запись, но не в чтение — врач заполняет, после
 *    перезагрузки пусто, и никакой ошибки нигде;
 *  - добавили в обе карты, но не в схему — сервер отвечает `Unknown column`,
 *    и это ещё повезло: ошибка видна;
 *  - написали имя столбца по-разному (`record_time` и `recordtime`) — ошибка
 *    будет только на живой базе.
 *
 * Проверка ловит всё это до выкладки. Запуск:
 *   node scripts/check-visit-fields.mjs      (или npm run check:fields)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(rootDir, relative), "utf8");

const php = read("public-clinicbase/api/index.php");
const schema = read("database/clinicbase.mysql.sql");
const client = read("src/pages/DoctorDatabase.tsx");

const slice = (text, from, to) => {
  const start = text.indexOf(from);
  if (start === -1) return "";
  const end = to ? text.indexOf(to, start + from.length) : text.length;
  return text.slice(start, end === -1 ? text.length : end);
};

/** Пары `'клиент' => 'столбец'` из функции PHP. */
const readMap = (functionName, untilFunction) => {
  const body = slice(php, `function ${functionName}`, untilFunction);
  const pairs = [...body.matchAll(/'([A-Za-z]+)'\s*=>\s*'([a-z_]+)'/g)].map(([, key, column]) => [
    key,
    column,
  ]);
  return new Map(pairs);
};

const toClient = readMap("visit_to_client", "function upsert_patient");
const toServer = readMap("upsert_visit", "function upsert_patient_record");

// Столбцы таблицы visits из схемы.
const visitsTable = slice(schema, "CREATE TABLE visits (", "ENGINE=InnoDB");
const columns = new Set(
  [...visitsTable.matchAll(/^\s{2}([a-z_]+)\s+(?:VARCHAR|TEXT|DATE|TIME|SMALLINT|TIMESTAMP)/gm)].map(
    ([, name]) => name,
  ),
);

// Поля типа Visit в программе.
const visitType = slice(client, "type Visit = {", "type MedicalRecords =");
const typeFields = new Set([...visitType.matchAll(/^\s{2}([A-Za-z]+):\s*string;/gm)].map(([, name]) => name));

const problems = [];
const report = (ok, text) => {
  console.log(`${ok ? "  OK  " : " FAIL "} ${text}`);
  if (!ok) problems.push(text);
};

report(toClient.size > 30, `чтение приёма: ${toClient.size} полей`);
report(toServer.size > 30, `запись приёма: ${toServer.size} полей`);

if (toClient.size !== toServer.size) {
  problems.push(`разное число полей: чтение ${toClient.size}, запись ${toServer.size}`);
}

// 1. Чтение и запись описывают одни и те же поля.
const onlyRead = [...toClient.keys()].filter((key) => !toServer.has(key));
const onlyWrite = [...toServer.keys()].filter((key) => !toClient.has(key));
report(
  onlyRead.length === 0,
  onlyRead.length ? `поле есть при чтении, но не при записи: ${onlyRead.join(", ")}` : "чтение и запись описывают одни поля",
);
report(
  onlyWrite.length === 0,
  onlyWrite.length ? `поле есть при записи, но не при чтении: ${onlyWrite.join(", ")}` : "лишних полей при записи нет",
);

// 2. Имена столбцов совпадают в обеих картах.
const columnMismatch = [...toClient.entries()]
  .filter(([key, column]) => toServer.has(key) && toServer.get(key) !== column)
  .map(([key, column]) => `${key}: чтение ${column}, запись ${toServer.get(key)}`);
report(
  columnMismatch.length === 0,
  columnMismatch.length ? `разные столбцы: ${columnMismatch.join("; ")}` : "имена столбцов совпадают",
);

// 3. Каждый столбец из карты есть в схеме.
const missingColumns = [...new Set([...toServer.values()])].filter((column) => !columns.has(column));
report(
  missingColumns.length === 0,
  missingColumns.length
    ? `столбцов нет в clinicbase.mysql.sql: ${missingColumns.join(", ")} — приём не сохранится`
    : `все ${toServer.size} столбцов есть в схеме`,
);

// 4. Каждое поле карты есть в типе Visit — иначе TypeScript пропустит, а данные
//    не дойдут до формы.
const missingType = [...toServer.keys()].filter((key) => !typeFields.has(key));
report(
  missingType.length === 0,
  missingType.length
    ? `полей нет в типе Visit: ${missingType.join(", ")}`
    : `все поля описаны в типе Visit (${typeFields.size})`,
);

// 5. Столбцы, добавленные миграцией, есть и в схеме. Обратное направление
//    проверять бессмысленно: основные столбцы создаёт сам clinicbase.mysql.sql,
//    миграции для них не нужны. А вот «добавили в миграцию, забыли в схему» —
//    тихая поломка: новая установка получит базу без столбца, и приём перестанет
//    сохраняться только у того, кто ставит с нуля.
const migrationDir = path.join(rootDir, "database/migrations");
const addedByMigrations = [];
for (const file of fs.readdirSync(migrationDir)) {
  const text = fs.readFileSync(path.join(migrationDir, file), "utf8");
  for (const [, table, body] of text.matchAll(/ALTER TABLE\s+([a-z_]+)([\s\S]*?);/g)) {
    for (const [, column] of body.matchAll(/ADD COLUMN\s+([a-z_]+)/g)) {
      addedByMigrations.push({ file, table, column });
    }
  }
}
const missingInSchema = addedByMigrations.filter(
  ({ table, column }) => table === "visits" && !columns.has(column),
);
report(
  missingInSchema.length === 0,
  missingInSchema.length
    ? `миграция добавляет, а схема не знает: ${missingInSchema
        .map(({ column, file }) => `${column} (${file})`)
        .join(", ")}`
    : `миграции добавляют ${addedByMigrations.length} столбцов, все есть в схеме`,
);

console.log("\n" + "─".repeat(72));
if (problems.length) {
  console.log(`  ПРОВАЛ  ${problems.length}:\n    ${problems.join("\n    ")}`);
  process.exit(1);
}
console.log("  OK  поля приёма согласованы: программа, чтение, запись, схема, миграции.");
