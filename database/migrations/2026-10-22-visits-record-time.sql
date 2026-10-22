-- Время приёма. График в ClinicBase показывает «Дата · Время · Доктор ·
-- Протокол», а в таблице visits была только дата.
--
-- Отдельным файлом, потому что база на хостинге уже создана: правка
-- CREATE TABLE в clinicbase.mysql.sql на неё не подействует.
-- Повторный запуск безопасен: MySQL 8 не знает IF NOT EXISTS для колонок,
-- поэтому проверяем наличие через information_schema.

SET @has_record_time := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'visits'
    AND COLUMN_NAME = 'record_time'
);

SET @sql := IF(
  @has_record_time = 0,
  'ALTER TABLE visits ADD COLUMN record_time TIME NULL AFTER record_date',
  'DO 0'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
