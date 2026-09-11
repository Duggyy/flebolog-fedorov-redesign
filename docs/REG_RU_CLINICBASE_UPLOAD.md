# Загрузка ClinicBase на reg.ru

## Что получилось

ClinicBase теперь состоит из двух частей:

- фронтенд: файлы из `dist-clinicbase`, которые открываются в браузере на `clinicbase.ru`;
- серверная база: PHP API в папке `api` и MySQL-таблицы из `database/clinicbase.mysql.sql`.

На обычном хостинге reg.ru Node.js не нужен. React-сайт работает как статические файлы, PHP отвечает за логин и сохранение данных в MySQL.

## 1. Создать базу MySQL

1. Откройте ispmanager.
2. Перейдите в раздел `Базы данных`.
3. Нажмите `Создать`.
4. Создайте базу, например:
   - имя базы: `u3452052_clinicbase`
   - пользователь: `u3452052_clinicbase`
   - пароль: придумайте сложный пароль и сохраните его.
5. Откройте `phpMyAdmin`.
6. Выберите созданную базу.
7. Откройте вкладку `Импорт`.
8. Загрузите файл `database/clinicbase.mysql.sql`.
9. Нажмите `Вперед`.

После импорта появятся таблицы:

- `doctors`
- `patients`
- `visits`
- `field_suggestions`

## 2. Загрузить файлы сайта

1. Откройте `Менеджер файлов` в ispmanager.
2. Перейдите в папку сайта:
   `/www/clinicbase.ru`
3. Удалите старые файлы сайта, если они там есть.
4. Загрузите архив `clinicbase-upload.zip`.
5. Распакуйте архив прямо в `/www/clinicbase.ru`.

В корне `/www/clinicbase.ru` должны лежать:

- `index.html`
- `.htaccess`
- папка `assets`
- папка `api`
- `favicon.svg`
- `favicon-preview.png`
- `robots.txt`

Важно: файлы не должны оказаться во вложенной папке вроде `/www/clinicbase.ru/dist-clinicbase/index.html`. `index.html` должен лежать прямо в `/www/clinicbase.ru`.

## 3. Настроить подключение к базе

1. В `/www/clinicbase.ru/api` найдите файл `config.sample.php`.
2. Скопируйте его в этой же папке.
3. Новую копию назовите `config.php`.
4. Откройте `config.php` на редактирование.
5. Заполните данные MySQL:

```php
<?php

return [
    'db_host' => 'localhost',
    'db_name' => 'u3452052_clinicbase',
    'db_user' => 'u3452052_clinicbase',
    'db_password' => 'ВАШ_ПАРОЛЬ_ОТ_MYSQL',
    'admin_login' => 'admin',
    'admin_password' => 'ВАШ_НОВЫЙ_ПАРОЛЬ_АДМИНА',
];
```

`admin_password` обязательно замените. Не оставляйте `CHANGE_THIS_PASSWORD`.

## 4. Проверить API

Откройте в браузере:

`https://clinicbase.ru/api/index.php?action=session`

Если все настроено правильно, должен появиться JSON-ответ:

```json
{"session":null}
```

Если видите `server_not_configured`, значит нет файла `api/config.php`.

Если видите `database_connection_failed`, значит ошибка в имени базы, пользователе или пароле MySQL.

## 5. Войти в систему

Откройте:

`https://clinicbase.ru/login`

Админ:

- логин: значение `admin_login` из `api/config.php`
- пароль: значение `admin_password` из `api/config.php`

После входа админ попадает в админку и может создавать врачей.

Тестовые врачи из SQL:

- `fedorov / 1234`
- `ivanova / 1234`

После проверки лучше зайти в админку, открыть каждого тестового врача и назначить новый пароль.

## 6. Что загружать при следующих обновлениях

При обновлении интерфейса обычно нужно:

1. Собрать проект командой `npm run build:clinicbase`.
2. Создать новый `clinicbase-upload.zip`.
3. Загрузить и распаковать архив в `/www/clinicbase.ru`.
4. Не удалять файл `/www/clinicbase.ru/api/config.php`, потому что в нем пароль от базы.

SQL-файл импортируется только при первом создании базы. Повторный импорт может создать ошибку `table already exists`.

## 7. Важное по безопасности

- Включите SSL-сертификат для `clinicbase.ru`.
- Работайте через `https://clinicbase.ru`, не через `http`.
- Поставьте сложный пароль администратора.
- Регулярно делайте резервные копии MySQL-базы в ispmanager.
- Не пересылайте `api/config.php` посторонним: в нем пароль от базы.

