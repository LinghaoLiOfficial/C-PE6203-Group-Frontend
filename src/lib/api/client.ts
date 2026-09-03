import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(message: string, public status: number, public detail?: unknown) { super(message); this.name = "ApiError"; }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = path.startsWith("/api") ? env.NEXT_PUBLIC_APP_URL : env.NEXT_PUBLIC_API_BASE_URL;
  let response: Response;
  try { response = await fetch(`${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...init.headers } }); }
  catch (error) { throw new ApiError("Unable to connect to the API.", 0, error); }
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) { const detail = typeof payload === "object" && payload && "detail" in payload ? payload.detail : payload; throw new ApiError(typeof detail === "string" ? detail : `Request failed (${response.status}).`, response.status, payload); }
  return (payload ?? null) as T;
}
