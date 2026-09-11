export type AuthSession =
  | { role: "admin" }
  | { role: "doctor"; doctorId: string };

const sessionStorageKey = "fedorov-auth-session-v1";

export const loadAuthSession = (): AuthSession | null => {
  const saved = localStorage.getItem(sessionStorageKey);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    return null;
  }
};

export const saveAuthSession = (session: AuthSession) => {
  localStorage.setItem(sessionStorageKey, JSON.stringify(session));
};

export const clearAuthSession = () => {
  localStorage.removeItem(sessionStorageKey);
};
