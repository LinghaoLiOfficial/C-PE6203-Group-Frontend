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
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    router.replace(redirectTo ?? "/dashboard");
  }, [loading, redirectTo, router, user]);

  if (loading) {
    return <FullScreenLoadingState label="加载中..." />;
  }

  if (user) {
    return <FullScreenLoadingState label="加载中..." />;
  }

  return children ?? null;
}
