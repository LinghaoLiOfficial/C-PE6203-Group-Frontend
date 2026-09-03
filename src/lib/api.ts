import { apiRequest } from "@/lib/api/client";
import type { CurrentUser, ExampleItem } from "@/lib/types";

export const getCurrentUser = () => apiRequest<CurrentUser>("/api/auth/me");
export const login = (email: string, password: string) => apiRequest<{ user: CurrentUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const logout = () => apiRequest<null>("/api/auth/logout", { method: "POST" });
export const listExampleItems = () => apiRequest<{ data: { items: ExampleItem[] } }>("/example-items");
