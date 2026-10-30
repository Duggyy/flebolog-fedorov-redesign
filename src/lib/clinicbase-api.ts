import type { AuthSession } from "@/lib/auth-session";
import type { DoctorUser } from "@/lib/doctor-users";

export type MedicalRecordsPayload = {
  patients: unknown[];
  visits: unknown[];
};

export class ApiUnavailableError extends Error {
  constructor() {
    super("ClinicBase API is unavailable");
  }
}

/**
 * Ошибка, которую сервер назвал сам.
 *
 * Кроме кода хранит `detail` — текст, который сервер прислал в поле `message`
 * (обычно это SQL-ошибка вида «Unknown column 'record_time' in 'field list'»).
 * 25.10.2026 без него пришлось отдельным скриптом дёргать API, чтобы узнать
 * причину: на экране было только «сервер ответил ошибкой». Текст показываем
 * в описании сообщения — он английский, зато называет виновника точно.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly detail: string;

  constructor(code: string, detail = "") {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.detail = detail;
  }
}

const apiUrl = (action: string) => `/api/index.php?action=${encodeURIComponent(action)}`;

const request = async <T>(action: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(apiUrl(action), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiUnavailableError();
  }

  const payload = (await response.json()) as T & { error?: string; message?: string };
  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiUnavailableError();
    }
    throw new ApiError(payload.error ?? "api_error", payload.message ?? "");
  }

  return payload;
};

const post = <T>(action: string, body: unknown) =>
  request<T>(action, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiGetSession = async () => {
  const payload = await request<{ session: AuthSession | null }>("session");
  return payload.session;
};

export const apiLogin = async (login: string, password: string) => {
  const payload = await post<{ session: AuthSession }>("login", { login, password });
  return payload.session;
};

export const apiLogout = async () => {
  await post<{ ok: true }>("logout", {});
};

export const apiGetDoctors = async () => {
  const payload = await request<{ doctors: DoctorUser[] }>("doctors");
  return payload.doctors;
};

export const apiSaveDoctor = async (doctor: DoctorUser) => {
  const payload = await post<{ doctor: DoctorUser }>("doctor_save", { doctor });
  return payload.doctor;
};

export const apiDeleteDoctor = async (id: string) => {
  await post<{ ok: true }>("doctor_delete", { id });
};

export const apiGetRecords = async () => {
  const payload = await request<{ records: MedicalRecordsPayload }>("records");
  return payload.records;
};

export const apiSaveRecords = async (records: unknown) => {
  const payload = await post<{ records: MedicalRecordsPayload }>("records_save", { records });
  return payload.records;
};

export const apiGetSuggestions = async () => {
  const payload = await request<{ suggestions: Record<string, string[]> }>("suggestions");
  return payload.suggestions;
};

export const apiSaveSuggestions = async (label: string, suggestions: string[]) => {
  await post<{ ok: true }>("suggestions_save", { label, suggestions });
};

/** Запись справочника: краткое имя, полный текст, цвет и подпункты. */
export type DictionaryEntryPayload = {
  id: string;
  section: string;
  short: string;
  full: string;
  color: string;
  parentId: string;
  order: number;
  scope: "global" | "personal";
};

export const apiGetDictionaries = async () => {
  const payload = await request<{ entries: DictionaryEntryPayload[] }>("dictionaries");
  return payload.entries;
};

export const apiSaveDictionaryEntry = async (entry: DictionaryEntryPayload) => {
  await post<{ ok: true }>("dictionary_save", { entry });
};

export const apiDeleteDictionaryEntry = async (id: string) => {
  await post<{ ok: true }>("dictionary_delete", { id });
};

/**
 * Перестановка записей справочника — одним запросом.
 *
 * Меняет номер строки, а если у записи не было родителя — ещё и записывает
 * того, кто и так был её родителем на экране (иначе связь держится только на
 * совпадении номеров порядка). Текст и цвет не пересылаются, поэтому
 * перестановка не затрёт чужую правку.
 */
export const apiReorderDictionaryEntries = async (
  entries: Array<{ id: string; order: number; parentId?: string }>,
) => {
  await post<{ ok: true; saved: number }>("dictionaries_reorder", { entries });
};

/**
 * Групповая вставка. Возвращает полный список записей: сервер генерирует
 * идентификаторы сам, и клиенту проще забрать результат целиком, чем
 * сопоставлять отправленное с полученным.
 */
export const apiImportDictionaryEntries = async (
  entries: Array<Omit<DictionaryEntryPayload, "id" | "scope">>,
) => {
  const payload = await post<{ entries: DictionaryEntryPayload[] }>("dictionaries_import", { entries });
  return payload.entries;
};

/**
 * Полная замена общих записей справочника — загрузка шаблона истории болезни.
 *
 * Один запрос вместо 530: по одной записи это была бы минута ожидания и
 * половина шаблона на сервере, если связь оборвётся на середине. Сервер
 * делает замену в транзакции, поэтому «половины» не бывает.
 */
export const apiReplaceGlobalDictionaries = async (
  entries: DictionaryEntryPayload[],
) => {
  const payload = await post<{ ok: true; saved: number }>("dictionaries_replace", {
    scope: "global",
    entries,
  });
  return payload.saved;
};

export const isApiUnavailable = (error: unknown) => error instanceof ApiUnavailableError;
