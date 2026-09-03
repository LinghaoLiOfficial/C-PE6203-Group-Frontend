"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, login, logout } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/types";

type AuthContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  loginWithPassword: (input: { email: string; password: string }) => Promise<CurrentUser>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setError(null);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to restore session");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshUser();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const loginWithPassword = useCallback(async (input: { email: string; password: string }) => {
    const response = await login(input.email, input.password);
    setUser(response.user);
    setError(null);
    return response.user;
  }, []);

  const logoutUser = useCallback(async () => {
    await logout();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      authenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      refreshUser,
      loginWithPassword,
      logoutUser,
    }),
    [user, loading, error, refreshUser, loginWithPassword, logoutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
