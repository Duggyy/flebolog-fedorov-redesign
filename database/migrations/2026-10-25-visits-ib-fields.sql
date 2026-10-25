-- Шесть полей истории болезни, под которые в форме не было места.
--
-- При загрузке «Шаблон ИБ 2026_10.docx» 30 записей остались за бортом: в форме
-- не было полей для разделов «ПОВОД ОБРАЩЕНИЯ», «СЛУЧАЙ ОБРАЩЕНИЯ»,
-- «Классификация диагноза», «Перевязка», «Вид операции», «Клинические данные».
-- Теперь поля есть, и им нужны столбцы в visits.
--
-- ⚠️ Без AFTER. Добавление столбца в конец таблицы MySQL 8.0 делает на месте
-- (INSTANT) и внешних ключей не касается. С `AFTER ...` на версиях до 8.0.29
-- MySQL перестраивает таблицу целиком, а при перестройке заново создаёт внешние
-- ключи — именно на этом 23.10.2026 упало расширение short_text с #1215.
-- Порядок столбцов в таблице ни на что не влияет: API обращается к ним по имени.
--
-- ⚠️ Без information_schema: на этом хостинге у пользователя MySQL нет прав на
-- служебную базу (#1044 Access denied ... to database 'information_schema').
-- Поэтому только SHOW и ALTER.
--
-- Повторный запуск даст #1060 Duplicate column name — это значит «столбцы уже
-- есть», вреда нет. Данные не затрагиваются: ALTER только добавляет пустые
-- столбцы, существующие строки остаются как были.

-- 1. Что сейчас. Пока столбцов нет, результат пустой — это и есть «до».
SHOW COLUMNS FROM visits WHERE Field IN (
  'appeal_reason',
  'appeal_case',
  'diagnosis_classification',
  'operation_type',
  'clinical_data',
  'dressing'
);

-- 2. Добавить. Одно утверждение на все шесть: либо добавились все, либо ни один.
ALTER TABLE visits
  ADD COLUMN appeal_reason VARCHAR(64) NULL,
  ADD COLUMN appeal_case VARCHAR(64) NULL,
  ADD COLUMN diagnosis_classification TEXT NULL,
  ADD COLUMN operation_type VARCHAR(64) NULL,
  ADD COLUMN clinical_data TEXT NULL,
  ADD COLUMN dressing TEXT NULL;

-- 3. Что стало. Ожидаем ровно 6 строк: три varchar(64) и три text.
SHOW COLUMNS FROM visits WHERE Field IN (
  'appeal_reason',
  'appeal_case',
  'diagnosis_classification',
  'operation_type',
  'clinical_data',
  'dressing'
);
