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

  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiUnavailableError();
    }
    throw new Error(payload.error ?? "api_error");
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

export const isApiUnavailable = (error: unknown) => error instanceof ApiUnavailableError;
