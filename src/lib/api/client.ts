import { env } from "@/lib/env";
import { clearAuth, getStoredTokens, saveAuth } from "@/lib/auth/session";
import type { AuthTokens } from "@/lib/types";

export class ApiError extends Error {
  constructor(message: string, public status: number, public detail?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
    ...init,
    credentials: "include",
    headers,
  });
  const text = await response.text();
  const payload = text ? safeParse(text) : null;
  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload
        ? "detail" in payload
          ? (payload as Record<string, unknown>).detail
          : "error" in payload
            ? (payload as Record<string, unknown>).error
            : payload
        : payload;
    throw new ApiError(typeof detail === "string" ? detail : `Request failed (${response.status}).`, response.status, payload);
  }
  return payload as T;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const tokens = getStoredTokens();
  try {
    return await fetchJson<T>(path, init, tokens?.access_token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !tokens?.refresh_token) {
      throw error;
    }
    const refreshed = await refreshTokens(tokens.refresh_token);
    saveAuth(refreshed);
    return fetchJson<T>(path, init, refreshed.access_token);
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return fetchJson<AuthTokens>("/auth/refresh", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      "Content-Type": "application/json",
    },
  });
}

export function clearStoredAuth() {
  clearAuth();
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
