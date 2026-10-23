import { isApiUnavailable } from "@/lib/clinicbase-api";

/**
 * Разбор ошибок API на человеческий язык. Один на всю программу.
 *
 * Почему отдельным файлом. Вход существует в двух местах — страница `/login`
 * и форма внутри базы приёмов, — и в обоих был свой текст ошибки. 23.10.2026
 * я поправил один, а второй остался, и на экране врача всё равно появилось
 * «Проверьте логин и пароль» при живом пароле: на сервере не хватало
 * `api/config.php`. Теперь список причин один, и разойтись ему негде.
 *
 * API отвечает кодами, не имеющими отношения к логину и паролю:
 *   server_not_configured     — нет api/config.php с паролем от базы;
 *   database_connection_failed — неверные данные MySQL или база недоступна;
 *   unknown_action            — на сервере старый api/index.php;
 *   replace_failed            — сервер не смог записать справочник.
 *
 * Возвращает пустую строку, если код незнакомый: тогда вызывающий показывает
 * своё прежнее сообщение, и мы не выдумываем причину.
 */
export const serverProblemHint = (error: unknown): string => {
  const code = error instanceof Error ? error.message : "";
  switch (code) {
    case "server_not_configured":
      return "на сервере нет api/config.php с паролем от базы. Файл не входит в архив и пропадает, если распаковывать с удалением лишнего: восстановите его из копии или создайте заново по образцу api/config.sample.php.";
    case "database_connection_failed":
      return "сервер не смог подключиться к базе. Проверьте в api/config.php имя базы, пользователя и пароль MySQL.";
    case "unknown_action":
      return "на сервере старая версия api/index.php — выгрузите архив целиком, вместе с папкой api.";
    case "replace_failed":
      return "сервер не смог записать справочник в базу.";
    case "only_global_replaceable":
      return "массовая замена разрешена только для общих записей.";
    default:
      return "";
  }
};

/**
 * Причина сбоя сохранения — для красного сообщения.
 *
 * ApiUnavailableError несёт английское служебное сообщение («ClinicBase API is
 * unavailable»), и врачу оно не говорит ничего. А причина у него на практике
 * одна: на хостинге старый api/index.php без нужного обработчика либо сервер
 * не отвечает вовсе.
 */
export const describeServerFailure = (error: unknown): string =>
  serverProblemHint(error) ||
  (isApiUnavailable(error)
    ? "сервер не ответил или на нём старая версия api/index.php"
    : error instanceof Error
      ? error.message
      : String(error));
