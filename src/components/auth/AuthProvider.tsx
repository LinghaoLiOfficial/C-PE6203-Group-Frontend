"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { clearStoredAuth } from "@/lib/api/client";
import { getCurrentUser, login, logout, register } from "@/lib/api";
import { clearAuth, loadAuth, saveAuth } from "@/lib/auth/session";
import type { AuthTokens, CurrentUser } from "@/lib/types";
import { ApiError } from "@/lib/api/client";

type AuthContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  authenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  loginWithPassword: (input: { email: string; password: string }) => Promise<AuthTokens>;
  registerAccount: (input: Record<string, unknown>) => Promise<AuthTokens>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const auth = loadAuth();
    if (!auth) {
      setUser(null);
      return;
    }
    try {
      setUser(await getCurrentUser());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuth();
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshUser();
      if (mounted) {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const loginWithPassword = useCallback(async (input: { email: string; password: string }) => {
    const auth = await login(input.email, input.password);
    saveAuth(auth);
    setUser(auth.user);
    return auth;
  }, []);

  const registerAccount = useCallback(async (input: Record<string, unknown>) => {
    const auth = await register(input);
    saveAuth(auth);
    setUser(auth.user);
    return auth;
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      clearStoredAuth();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      refreshUser,
      loginWithPassword,
      registerAccount,
      logoutUser,
    }),
    [user, loading, refreshUser, loginWithPassword, registerAccount, logoutUser]
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
