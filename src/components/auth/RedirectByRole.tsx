"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { FullScreenLoadingState } from "@/components/common/LoadingState";

type RedirectByRoleProps = {
  children?: React.ReactNode;
  redirectTo?: string;
};

export function RedirectByRole({ children, redirectTo }: RedirectByRoleProps) {
  const router = useRouter();
  const { loading, authenticated } = useAuth();

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace(redirectTo ?? "/dashboard");
    }
  }, [authenticated, loading, redirectTo, router]);

  if (loading || authenticated) {
    return <FullScreenLoadingState label="Loading..." />;
  }

  return children ?? null;
}
