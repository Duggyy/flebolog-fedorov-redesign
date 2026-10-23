-- Справочники ClinicBase: оба шага одним файлом.
--
-- Склеено из двух миграций, потому что порядок важен, а второй шаг меняет
-- таблицу, созданную первым:
--   1) 2026-10-23-dictionary-entries.sql      — создать таблицу справочников
--   2) 2026-10-23-dictionary-short-text-long.sql — расширить текст записи до 2000
--
-- Куда применять: база u3452052_clinicbase. В phpMyAdmin сначала выберите её
-- в левом списке (иначе запрос уйдёт «на сервер» без базы и упадёт).
-- Повторный запуск безопасен: все шаги проверяют, что уже сделано.

-- Справочники вместо «списка подсказок».
--
-- Что меняется по существу. Раньше подсказки лежали одной JSON-кучей:
-- на пару (врач, поле) — массив строк. Из этого нельзя было получить ни
-- краткое имя отдельно от полного текста, ни цвет шрифта, ни подпункт,
-- ни порядок, заданный врачом. Поэтому запись справочника становится
-- строкой таблицы, а не элементом массива.
--
-- Заодно чинится дефект старого хранения: у общих записей doctor_id IS NULL,
-- а MySQL считает NULL-ы различными, поэтому UNIQUE (doctor_id, label) не
-- срабатывал и ON DUPLICATE KEY UPDATE на каждой перезаписи добавлял новую
-- строку вместо обновления. Лечится генерируемым столбцом: COALESCE даёт
-- обычное значение, и уникальность начинает работать. NULL в doctor_id
-- остаётся (на него опирается внешний ключ), меняется только индекс.
--
-- Повторный запуск безопасен: таблица создаётся с IF NOT EXISTS, перенос
-- идёт через INSERT IGNORE с детерминированными id, а столбец scope_key
-- добавляется только если его ещё нет.

CREATE TABLE IF NOT EXISTS dictionary_entries (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  -- NULL = общий справочник (виден всем врачам), иначе — личный справочник врача.
  doctor_id VARCHAR(64) NULL,
  -- Имя поля, к которому привязан раздел справочника: «Жалобы», «Аллергии» и т. д.
  section VARCHAR(180) NOT NULL,
  -- Краткое имя: то, что вставляется в текст протокола.
  short_text VARCHAR(500) NOT NULL,
  -- Полный текст: раскрывается в подсказке и идёт в печатную форму.
  full_text TEXT NULL,
  -- Цвет шрифта в виде #rrggbb. NULL = цвет по умолчанию.
  color VARCHAR(16) NULL,
  -- Родительская запись: подпункт дописывает текст к вставленному.
  parent_id VARCHAR(64) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dictionary_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE,
  INDEX idx_dictionary_scope (doctor_id, section, sort_order),
  INDEX idx_dictionary_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Перенос того, что уже накоплено. Старый массив разворачивается в строки
-- через JSON_TABLE; id собирается из id старой строки и порядкового номера,
-- поэтому повторный запуск не создаёт копий (INSERT IGNORE отбрасывает их
-- по первичному ключу).
INSERT IGNORE INTO dictionary_entries
  (id, doctor_id, section, short_text, full_text, sort_order)
SELECT
  CONCAT('mig-', s.id, '-', jt.ord),
  s.doctor_id,
  s.label,
  LEFT(jt.txt, 500),
  '',
  jt.ord - 1
FROM field_suggestions AS s
JOIN JSON_TABLE(
  s.suggestions_json,
  '$[*]' COLUMNS (
    ord FOR ORDINALITY,
    txt VARCHAR(1000) PATH '$'
  )
) AS jt
WHERE jt.txt IS NOT NULL AND jt.txt <> '';

-- Перед созданием уникального индекса надо убрать то, что уже надублировалось.
-- Оставляем последнюю строку каждой пары (врач, поле): она записана позже
-- остальных и, значит, отражает последнюю правку.
DELETE stale FROM field_suggestions AS stale
JOIN field_suggestions AS fresh
  ON COALESCE(stale.doctor_id, '') = COALESCE(fresh.doctor_id, '')
 AND stale.label = fresh.label
 AND stale.id < fresh.id;

SET @has_scope_key := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'field_suggestions'
    AND COLUMN_NAME = 'scope_key'
);

-- Генерируемый столбец вместо NULL в индексе. STORED, а не VIRTUAL: индекс
-- по виртуальному столбцу MySQL тоже умеет, но STORED проще читать глазами
-- при разборе базы.
--
-- Три шага вместо одного ALTER, и каждый проверяет, нужно ли ему что-то делать.
-- Причина: база могла быть создана по разной версии схемы, и имя старого
-- индекса в ней может быть другим (`doctor_id` вместо `uniq_suggestions_scope`).
-- Жёсткий `DROP INDEX uniq_suggestions_scope` в такой базе падал бы с
-- «check that column/key exists» и обрывал импорт на середине.
SET @sql := IF(
  @has_scope_key = 0,
  'ALTER TABLE field_suggestions
     ADD COLUMN scope_key VARCHAR(64) GENERATED ALWAYS AS (COALESCE(doctor_id, '''')) STORED',
  'DO 0'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Старый уникальный индекс стоял на (doctor_id, label) и с NULL не работал.
-- Удаляем его, только если он действительно есть и построен по doctor_id.
SET @old_index := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'field_suggestions'
    AND INDEX_NAME = 'uniq_suggestions_scope'
    AND COLUMN_NAME = 'doctor_id'
);

SET @sql := IF(
  @old_index > 0,
  'ALTER TABLE field_suggestions DROP INDEX uniq_suggestions_scope',
  'DO 0'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Новый уникальный индекс по scope_key, если его ещё нет.
SET @new_index := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'field_suggestions'
    AND INDEX_NAME = 'uniq_suggestions_scope'
    AND COLUMN_NAME = 'scope_key'
);

SET @sql := IF(
  @new_index = 0,
  'ALTER TABLE field_suggestions ADD UNIQUE KEY uniq_suggestions_scope (scope_key, label)',
  'DO 0'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Краткое имя записи справочника перестало быть коротким.
--
-- В шаблоне истории болезни («Шаблон ИБ 2026_10.docx») назначения записаны
-- готовыми фразами: самое длинное — 650 знаков. Колонка была VARCHAR(500),
-- и сервер обрезал бы хвост рецепта молча: врач увидел бы в базе правдоподобный,
-- но неполный текст. Проверено на живой базе 23.10.2026: запись длиной 650
-- знаков сохранилась с ответом «ok», а прочиталась обратно как 500 знаков.
-- Молча — потому что на этом хостинге выключен строгий режим MySQL: в строгом
-- вместо обрезки была бы ошибка #1406 «Data too long». Именно поэтому ширину
-- колонки нельзя оставлять «на потом»: потеря никак не проявляется.
--
-- Почему VARCHAR, а не TEXT. 23.10.2026 смена типа на TEXT упала на живой базе
-- с ошибкой #1215 «Cannot add foreign key constraint»: смена класса хранения
-- перестраивает таблицу целиком, а при перестройке MySQL заново создаёт
-- внешний ключ dictionary_entries.doctor_id → doctors.id. Удлинение VARCHAR
-- с 500 до 2000 делается на месте (у обоих значений двухбайтовый префикс
-- длины), таблица не перестраивается, внешнего ключа не касается.
--
-- Почему ширина выбирается запросом, а не вписана числом. VARCHAR(2000)
-- в utf8mb4 — это 8000 байт, а вместе с остальными колонками таблицы
-- набирается около 9600. InnoDB в формате строки DYNAMIC длинные колонки
-- выносит за пределы страницы и такое пропускает, а в COMPACT/REDUNDANT
-- отказывается: «#1118 Row size too large (> 8126)». Какой формат у базы
-- на хостинге, снаружи не видно, поэтому ширина берётся по факту: DYNAMIC —
-- 2000 (совпадает с ограничением в api/index.php), иначе 1000 — это 4000 байт,
-- и строка целиком укладывается в 8126 при любом формате.
--
-- Повторный запуск безопасен: если колонка уже не уже нужной, ALTER не выполняется.

SET @row_format := (
  SELECT ROW_FORMAT
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'dictionary_entries'
);

SET @short_len := IF(@row_format IN ('Dynamic', 'Compressed'), 2000, 1000);

SET @current_len := (
  SELECT COALESCE(CHARACTER_MAXIMUM_LENGTH, 0)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'dictionary_entries'
    AND COLUMN_NAME = 'short_text'
);

SET @sql := IF(
  @current_len >= @short_len,
  'DO 0',
  CONCAT(
    'ALTER TABLE dictionary_entries ',
    'MODIFY COLUMN short_text VARCHAR(', @short_len, ') NOT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Итог видно сразу: phpMyAdmin покажет эту строку в результате импорта.
-- Если в ней 2000 или 1000 — шаг выполнен. Если 500 — ALTER не прошёл,
-- смотрите текст ошибки выше.
SELECT
  COLUMN_TYPE AS short_text_type,
  CHARACTER_MAXIMUM_LENGTH AS max_chars,
  @row_format AS table_row_format
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dictionary_entries'
  AND COLUMN_NAME = 'short_text';
