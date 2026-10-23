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
