-- Время приёма. График в ClinicBase показывает «Дата · Время · Доктор ·
-- Протокол», а в таблице visits была только дата.
--
-- Без этого столбца не работает СОХРАНЕНИЕ приёма. Сервер отвечает
--   SQLSTATE[42S22]: Column not found: 1054 Unknown column 'record_time'
-- и программа пишет «Данные сохранены локально». Чтение при этом работает:
-- `SELECT *` просто не возвращает отсутствующий столбец, экран заполняется,
-- и поломка не видна, пока не нажмёшь «Сохранить». Проверено 25.10.2026
-- на живой базе: пациенты сохранялись, приёмы — нет.
--
-- Почему без information_schema. В первом варианте файла наличие столбца
-- проверялось через служебную базу, а на этом хостинге у пользователя MySQL
-- нет на неё прав:
--   #1044 Access denied for user 'u3452052'@'localhost' to database 'information_schema'
-- Поэтому здесь только то, что работает от прав на свою базу: SHOW и ALTER.
--
-- Повторный запуск даст #1060 Duplicate column name 'record_time' — это значит
-- «столбец уже есть», вреда нет.

-- 1. Что сейчас. Если строка вернулась — столбец уже на месте, ALTER не нужен.
SHOW COLUMNS FROM visits LIKE 'record_time';

-- 2. Добавить.
ALTER TABLE visits ADD COLUMN record_time TIME NULL AFTER record_date;

-- 3. Что стало. Ожидаем Field = record_time, Type = time, Null = YES.
SHOW COLUMNS FROM visits LIKE 'record_time';
