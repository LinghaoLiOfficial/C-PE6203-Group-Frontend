import type { AuthTokens } from "@/lib/types";

const AUTH_STORAGE_KEY = "job-portal-auth";

export function loadAuth(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthTokens): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredTokens(): Pick<AuthTokens, "access_token" | "refresh_token"> | null {
  const auth = loadAuth();
  if (!auth) {
    return null;
  }
  return { access_token: auth.access_token, refresh_token: auth.refresh_token };
}
