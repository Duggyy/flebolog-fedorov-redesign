# Локальная AI-модель для работы над ClinicBase без интернета

Цель: один раз, пока интернет есть, скачать модель и инструменты, а потом работать локально на MacBook Pro M1 16/512 над этим проектом:

`/Users/macdug/Downloads/FEODORSITE/CODEX flebolog-fedorov-redesign-main copy`

## 1. Что реально ожидать

Локальная модель поможет:

- объяснять код проекта;
- искать место для изменения;
- писать небольшие правки;
- составлять SQL-миграции;
- помогать с PHP API, React, TypeScript, CSS;
- работать с файлами проекта через VS Code / Continue или Aider.

Но локальная модель на MacBook Pro M1 16 GB будет слабее облачного Codex:

- хуже держит большой контекст;
- чаще ошибается в больших рефакторингах;
- медленнее пишет код;
- может не видеть весь проект сразу;
- требует, чтобы вы явно прикладывали нужные файлы или открывали их в редакторе.

Правильный режим: просить ее делать маленькие изменения по 1-3 файлам за раз.

## 1.1. Важное про интернет-доступ

Сама локальная модель в Ollama или LM Studio обычно **не умеет самостоятельно открывать сайты**. Она только отвечает на текст, который ей передали.

Чтобы получить режим “работает офлайн, но если интернет появился — может искать информацию”, нужен не только LLM-движок, а еще оболочка-агент с инструментами:

- VS Code + Continue — удобно для кода, но веб-поиск зависит от настроек/расширений и не всегда доступен из коробки;
- Aider — может работать с локальной моделью, но результаты веб-поиска чаще всего нужно давать ему как контекст;
- Open WebUI — локальный веб-интерфейс к Ollama, в котором можно включить web search;
- AnythingLLM — локальный интерфейс с подключением документов и web search;
- SearXNG — локальный метапоиск, который можно подключать к некоторым AI-интерфейсам.

Самый практичный вариант для вашего случая:

1. Код править через `VS Code + Continue + Ollama`.
2. Для чата с возможным веб-поиском поставить `Open WebUI + Ollama`.
3. Если интернет пропал, Open WebUI продолжит отвечать локальной моделью, просто без свежего поиска.

Так вы не меняете модель и не перестраиваете рабочий процесс: один локальный движок Ollama работает и офлайн, и в гибридном режиме.

## 2. Оптимальные модели для MacBook Pro M1 16 GB

### Рекомендуемый основной вариант

`Qwen2.5-Coder 7B Instruct`, quantization `Q4_K_M` или стандартный `qwen2.5-coder:7b` в Ollama.

Почему:

- хорошо пишет код;
- помещается в 16 GB;
- работает заметно быстрее, чем 30B;
- подходит для React/TypeScript/PHP/SQL;
- можно держать контекст 8k-16k.

### Более сильный, но тяжелый вариант

`Qwen3-Coder-30B-A3B-Instruct-GGUF`, низкая квантизация `UD-IQ2_M` или похожая Q2.

Почему:

- сильнее в задачах кодинга;
- MoE-модель: активных параметров меньше, чем полный размер;
- но файл и память все равно тяжелые для 16 GB.

На вашем M1 16 GB этот вариант может быть медленным или упираться в память. Использовать только если 7B явно не справляется.

### Не рекомендую для этого ноутбука

- 30B/32B в Q4 и выше;
- 70B;
- большие reasoning-модели;
- контекст 32k+ на тяжелых моделях.

Они будут слишком медленными или начнут выгружаться в swap.

## 3. Общая схема работы

Лучший офлайн-набор:

1. `Ollama` или `LM Studio` запускает модель локально.
2. `VS Code + Continue` подключается к локальной модели и помогает в редакторе.
3. `Aider` можно использовать как локального агента, который сам редактирует файлы.
4. Проект собирается обычными командами `npm`.

Для вас я бы выбрал:

- основной путь: `Ollama + Continue`;
- запасной удобный GUI: `LM Studio`;
- для автоматических правок: `Aider`, но осторожно и только после git/backup.

## 4. Один раз установить инструменты

### 4.1. Проверить Homebrew

Откройте Terminal:

```bash
brew --version
```

Если Homebrew не установлен:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 4.2. Установить Ollama

Вариант через сайт:

https://ollama.com/download

Или через brew:

```bash
brew install --cask ollama
```

Запустите Ollama из Applications один раз, либо:

```bash
ollama serve
```

Проверка:

```bash
ollama list
```

### 4.3. Установить LM Studio, если нужен графический интерфейс

Скачать:

https://lmstudio.ai/

LM Studio удобен, когда интернет нестабилен: можно скачать модель через интерфейс и потом запускать ее без интернета.

### 4.4. Установить VS Code

Скачать:

https://code.visualstudio.com/

В VS Code поставить расширение:

`Continue`

Название: `Continue - open-source AI code assistant`

### 4.5. Установить Aider

```bash
python3 -m pip install --user aider-install
python3 -m aider_install
```

Если команда `aider` потом не находится, перезапустите Terminal.

## 5. Скачать модель заранее

### Вариант А: простой через Ollama

Для M1 16 GB начните с:

```bash
ollama pull qwen2.5-coder:7b
```

Проверка:

```bash
ollama run qwen2.5-coder:7b
```

Спросите:

```text
Ты локальная модель для помощи в проекте React + PHP + MySQL. Ответь кратко.
```

Выйти из чата:

```text
/bye
```

### Вариант Б: модель прямо с Hugging Face через Ollama

Для более сильной модели можно пробовать:

```bash
ollama run hf.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF:UD-IQ2_M
```

Если Ollama напишет, что такой tag не найден:

1. Откройте страницу модели на Hugging Face.
2. Перейдите во вкладку `Files and versions`.
3. Найдите самый легкий `.gguf`, например `UD-IQ2_M`, `Q2_K`, `Q3_K`.
4. Скопируйте точный tag/имя из инструкции модели.

Для MacBook Pro M1 16 GB выбирайте файл примерно до 10-12 GB. Если файл 18-25 GB, он почти наверняка будет неудобен.

### Вариант В: скачать GGUF вручную через Hugging Face CLI

Установить:

```bash
python3 -m pip install --user -U huggingface_hub
brew install git-lfs
```

Создать папку:

```bash
mkdir -p ~/Models/qwen-coder
```

Скачать конкретный GGUF-файл:

```bash
huggingface-cli download unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF \
  Qwen3-Coder-30B-A3B-Instruct-UD-IQ2_M.gguf \
  --local-dir ~/Models/qwen-coder
```

Если имя файла отличается, скопируйте точное имя из Hugging Face.

## 6. Настроить Ollama под этот проект

Создайте файл:

`~/Models/clinicbase-coder.Modelfile`

Содержимое для легкой модели:

```text
FROM qwen2.5-coder:7b

PARAMETER temperature 0.15
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER num_predict 2048

SYSTEM """
Ты локальный помощник для проекта ClinicBase.
Проект: React + TypeScript + Vite + Tailwind + PHP API + MySQL.
Отвечай по-русски.
Делай небольшие безопасные правки.
Не предлагай повторно импортировать полный clinicbase.mysql.sql в живую базу.
Если меняется структура БД, предлагай отдельную SQL-миграцию и backup.
"""
```

Создать локальную модель:

```bash
ollama create clinicbase-coder -f ~/Models/clinicbase-coder.Modelfile
```

Проверить:

```bash
ollama run clinicbase-coder
```

Если работает медленно, уменьшите контекст:

```text
PARAMETER num_ctx 4096
```

и пересоздайте:

```bash
ollama create clinicbase-coder -f ~/Models/clinicbase-coder.Modelfile
```

## 7. Подключить к VS Code через Continue

Откройте файл конфигурации Continue:

```bash
mkdir -p ~/.continue
nano ~/.continue/config.yaml
```

Вставьте:

```yaml
name: ClinicBase Local AI
schema: v1

models:
  - name: ClinicBase Coder
    provider: ollama
    model: clinicbase-coder
    apiBase: http://localhost:11434
    roles:
      - chat
      - edit
      - apply

  - name: Fast Autocomplete
    provider: ollama
    model: qwen2.5-coder:7b
    apiBase: http://localhost:11434
    roles:
      - autocomplete

context:
  - provider: code
  - provider: diff
  - provider: terminal
  - provider: folder
```

Сохранить в nano:

`Ctrl + O`, Enter, `Ctrl + X`.

Дальше:

1. Откройте VS Code.
2. Откройте папку проекта:
   `/Users/macdug/Downloads/FEODORSITE/CODEX flebolog-fedorov-redesign-main copy`
3. Откройте Continue.
4. Нажмите `Reload config`.
5. Выберите модель `ClinicBase Coder`.

## 8. Работа над проектом в VS Code

Перед началом:

```bash
cd "/Users/macdug/Downloads/FEODORSITE/CODEX flebolog-fedorov-redesign-main copy"
npm install
npm run dev:clinicbase
```

Открыть локально:

```text
http://127.0.0.1:8081/doctor-db
```

Если порт занят, Vite покажет другой порт.

### Хороший запрос к локальной модели

```text
Проект ClinicBase. Открыты файлы src/pages/DoctorDatabase.tsx и src/index.css.
Нужно сделать маленькую правку: ...
Не трогай админку. Сначала объясни какие места менять, затем предложи patch.
```

### Плохой запрос

```text
Переделай всю базу и сайт.
```

Локальная модель захлебнется. Делите работу на маленькие куски.

## 9. Работа через Aider

Aider может сам редактировать файлы. Перед ним обязательно сделайте копию или git commit.

Перейти в проект:

```bash
cd "/Users/macdug/Downloads/FEODORSITE/CODEX flebolog-fedorov-redesign-main copy"
```

Запустить:

```bash
aider --model ollama/clinicbase-coder
```

Добавить конкретные файлы в контекст:

```text
/add src/pages/DoctorDatabase.tsx
/add src/index.css
/add public-clinicbase/api/index.php
```

Пример задачи:

```text
В DoctorDatabase.tsx измени только окно печати: добавь кнопку ...
Не меняй структуру базы. После правки скажи, какую команду сборки запустить.
```

После правок:

```bash
npm run build:clinicbase
```

Если сборка упала, скопируйте ошибку в Aider или Continue.

## 10. LM Studio как запасной вариант

1. Откройте LM Studio.
2. Search → найдите модель:
   `Qwen2.5-Coder 7B Instruct GGUF`
3. Скачайте `Q4_K_M`.
4. Откройте вкладку Local Server.
5. Start Server.

Обычно API будет:

```text
http://127.0.0.1:1234/v1
```

Для Continue можно использовать OpenAI-compatible подключение. Пример:

```yaml
name: ClinicBase LM Studio
schema: v1

models:
  - name: LM Studio Local
    provider: openai
    model: local-model
    apiBase: http://127.0.0.1:1234/v1
    apiKey: lm-studio
    roles:
      - chat
      - edit
      - apply
```

Если Continue не видит модель, используйте точное имя модели из LM Studio Local Server.

## 10.1. Гибридный режим: локальная модель + интернет, когда он есть

Чтобы не переключаться между офлайн/онлайн режимами, можно поставить `Open WebUI`. Он работает локально, подключается к Ollama, а при наличии интернета может использовать web search.

### Установка Open WebUI через Docker

Сначала установите Docker Desktop для Mac:

https://www.docker.com/products/docker-desktop/

Потом выполните:

```bash
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

Откройте:

```text
http://localhost:3000
```

При первом запуске создайте локального пользователя.

Open WebUI должен увидеть Ollama по адресу:

```text
http://host.docker.internal:11434
```

Если не увидел:

1. Откройте настройки Open WebUI.
2. Найдите `Connections` или `Ollama API`.
3. Укажите:

```text
http://host.docker.internal:11434
```

### Включить web search

В настройках Open WebUI включите `Web Search`.

Для поиска можно использовать:

- встроенный web search, если он доступен в вашей версии;
- SearXNG;
- Brave Search API;
- Google Programmable Search;
- SerpAPI.

Самый независимый вариант — локальный `SearXNG`, но его настройка сложнее. Самый простой — встроенный поиск Open WebUI или Brave Search API.

После этого рабочий режим такой:

- интернета нет: Open WebUI отвечает локальной моделью;
- интернет появился: в этом же интерфейсе можно просить модель искать свежую информацию;
- переключать модель не нужно.

### Важное ограничение

Не давайте web search реальные медицинские данные пациентов. Для поиска документации используйте обезличенные запросы:

```text
React Vite PHP API MySQL migration example
```

а не реальные ФИО и диагнозы.

## 10.2. Локальный поиск по проекту без интернета

Даже без интернета модель может “искать” по вашему проекту, если использовать инструменты редактора:

```bash
rg "apiSaveRecords" src public-clinicbase
rg "visits" public-clinicbase/api/index.php database
rg "PrintRecord" src/pages/DoctorDatabase.tsx
```

Хороший прием:

1. Вы запускаете `rg`.
2. Копируете результат в локальный чат.
3. Просите модель объяснить, где менять код.

Так можно работать даже полностью офлайн.

## 11. Офлайн-режим

Когда интернет пропал, должно работать:

- Ollama;
- LM Studio;
- VS Code;
- Continue, если расширение уже установлено;
- Aider, если установлен;
- модель, если скачана;
- локальный запуск ClinicBase;
- сборка проекта, если `node_modules` уже установлены.

Если стоит Open WebUI, он тоже будет открываться локально, но web search в нем просто не сможет получить результаты до появления интернета.

Перед поездкой/плохим интернетом проверьте:

```bash
ollama list
npm install
npm run build:clinicbase
docker ps
```

И откройте один раз VS Code + Continue, чтобы убедиться, что расширение уже установлено.

## 12. Рекомендуемые настройки для MacBook Pro M1 16 GB

Для `qwen2.5-coder:7b`:

- context: `8192`;
- temperature: `0.10-0.20`;
- top_p: `0.9`;
- max output: `1500-2500`;
- один запрос за раз;
- закрыть тяжелые приложения, если модель тормозит.

Для тяжелой 30B-A3B:

- context: `4096-8192`;
- quantization: Q2/UD-IQ2_M;
- не держать много вкладок браузера;
- не запускать одновременно Docker, Photoshop, видео и модель.

Если Mac начинает шуметь/тормозить:

```bash
ollama ps
ollama stop clinicbase-coder
```

## 13. Как давать локальной модели контекст по ClinicBase

Главные файлы:

- `src/pages/DoctorDatabase.tsx` — база приемов;
- `src/pages/DoctorAdmin.tsx` — админка врачей;
- `src/pages/Login.tsx` — логин;
- `src/ClinicBaseApp.tsx` — маршруты ClinicBase;
- `src/lib/clinicbase-api.ts` — клиент API;
- `public-clinicbase/api/index.php` — PHP API;
- `database/clinicbase.mysql.sql` — начальная схема БД;
- `docs/REG_RU_CLINICBASE_UPLOAD.md` — инструкция загрузки на reg.ru;
- `docs/clinicbase-workflow.drawio` — визуальная схема workflow.

Не надо скармливать модели весь проект сразу. Лучше открывать 2-4 нужных файла.

## 14. Безопасный процесс изменения сайта

1. Описать задачу в одном абзаце.
2. Открыть нужные файлы.
3. Попросить модель найти место изменения.
4. Попросить сделать минимальную правку.
5. Запустить:

```bash
npm run build:clinicbase
```

6. Проверить локально:

```bash
npm run dev:clinicbase
```

7. Только после проверки обновлять архив:

```bash
npm run build:clinicbase
(cd dist-clinicbase && zip -qr ../clinicbase-upload.zip .)
```

8. На хостинге не затирать:

```text
/www/clinicbase.ru/api/config.php
```

## 15. Если нужна правка базы данных

Нельзя просто повторно импортировать:

```text
database/clinicbase.mysql.sql
```

Это установочный файл для пустой базы.

Правильно:

1. Сделать backup в phpMyAdmin.
2. Создать отдельный файл миграции, например:

```text
database/migrations/2026-08-04-add-print-templates.sql
```

3. Внутри использовать безопасные команды:

```sql
CREATE TABLE IF NOT EXISTS print_templates (...);
ALTER TABLE visits ADD COLUMN ...;
```

4. Проверить на копии.
5. Только потом импортировать миграцию на хостинге.

## 16. Локальная модель и персональные данные

Если модель работает через Ollama/LM Studio локально, данные не уходят в облако модели.

Но:

- Continue/Aider могут иметь свои настройки телеметрии;
- не подключайте облачные API, если хотите полностью офлайн;
- не вставляйте реальные медицинские данные в онлайн-сервисы;
- храните backup базы отдельно.

## 17. Частые проблемы

### Ollama не отвечает

```bash
ollama serve
```

Проверить:

```bash
curl http://localhost:11434/api/tags
```

### Модель очень медленная

Используйте `qwen2.5-coder:7b`, уменьшите `num_ctx` до `4096`.

### Continue не видит модель

1. Проверьте:

```bash
ollama list
```

2. Проверьте `~/.continue/config.yaml`.
3. В Continue нажмите `Reload config`.
4. Перезапустите VS Code.

### Aider пишет странные изменения

Остановить:

```text
/exit
```

Проверить изменения:

```bash
git diff
```

Если нет git, лучше работать на копии папки проекта.

## 18. Локальная альтернатива draw.io

Если `app.diagrams.net` не грузится из-за интернета, установите desktop-версию draw.io:

https://github.com/jgraph/drawio-desktop/releases

После установки файл:

```text
docs/clinicbase-workflow.drawio
```

можно открывать и редактировать полностью офлайн.

## 19. Минимальный рабочий комплект перед отключением интернета

Сделайте один раз:

```bash
brew install --cask ollama
ollama pull qwen2.5-coder:7b
ollama create clinicbase-coder -f ~/Models/clinicbase-coder.Modelfile
cd "/Users/macdug/Downloads/FEODORSITE/CODEX flebolog-fedorov-redesign-main copy"
npm install
npm run build:clinicbase
```

Проверьте:

```bash
ollama run clinicbase-coder
npm run dev:clinicbase
```

Если это работает, базовая офлайн-разработка готова.

Для гибридного режима дополнительно проверьте:

```bash
docker ps
open http://localhost:3000
```

В Open WebUI задайте два теста.

Офлайн-тест:

```text
Ответь без поиска в интернете: что такое React component?
```

Онлайн-тест, когда интернет появился:

```text
Найди свежую документацию Vite по production build и дай ссылку.
```

Если второй запрос возвращает ссылки, значит локальная модель умеет работать в гибридном режиме: без интернета отвечает сама, с интернетом использует поиск.

## 20. Можно ли подключить локальную модель прямо в Codex

Короткий ответ: **напрямую заменить модель Codex на локальную Hugging Face/Ollama модель в этом интерфейсе сейчас нельзя**.

Codex в этом приложении работает через облачную модель OpenAI. Если интернет полностью пропал, сам чат Codex, скорее всего, тоже не сможет продолжать думать и отвечать. Локальная модель в Ollama не станет автоматической заменой Codex внутри этого же окна.

Что можно сделать практически:

### Вариант 1. Использовать Codex как главный интерфейс, когда интернет есть

Когда связь есть, работаем как сейчас:

- вы пишете задачу сюда;
- Codex редактирует проект;
- Codex запускает сборку;
- Codex может обращаться к локальным файлам и терминалу.

При желании Codex может вызывать локальную модель через терминал:

```bash
ollama run clinicbase-coder "Объясни файл src/pages/DoctorDatabase.tsx"
```

Но это будет вспомогательный инструмент, а не замена модели Codex.

### Вариант 2. Когда интернет пропал, продолжать в локальном интерфейсе

Для настоящей офлайн-работы нужен отдельный локальный интерфейс:

- `VS Code + Continue`;
- `Open WebUI`;
- `Aider`;
- `LM Studio`.

Это не так удобно, как один Codex-чат, но зато реально работает без интернета.

### Вариант 3. Сделать “единый рабочий процесс”, но не единый интерфейс

Чтобы переключение было минимальным:

1. Вся работа идет в одной папке проекта.
2. Схема workflow лежит в `docs/clinicbase-workflow.drawio`.
3. Текущие инструкции лежат в `docs/local-ai-offline-manual.md`.
4. Когда интернет есть — используете Codex.
5. Когда интернет пропал — используете Continue/Open WebUI/Aider на той же папке.
6. Когда интернет вернулся — снова открываете Codex и пишете:

```text
Я работал локально. Посмотри изменения в проекте, проверь сборку и продолжи.
```

Codex увидит измененные файлы и сможет продолжить с того места.

### Вариант 4. Добавить локальную команду-помощник в проект

Можно сделать маленький скрипт, например:

```bash
npm run ai:local "Что делает DoctorDatabase.tsx?"
```

Он будет отправлять вопрос в Ollama. Это удобно для быстрых вопросов из терминала, но не даст полноценного Codex-интерфейса.

### Лучший практический выбор

На сегодня оптимально так:

- основной интерфейс при интернете: Codex;
- резервный офлайн-интерфейс: VS Code + Continue;
- общий источник правды: файлы проекта, `git diff`, схема `.drawio`, документация в `docs`.

Это даст почти бесшовный процесс: интерфейсы разные, но проект, файлы и логика работы одни и те же.
