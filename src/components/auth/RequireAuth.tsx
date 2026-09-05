"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { FullScreenLoadingState } from "@/components/common/LoadingState";
import { buildLoginRequiredUrl } from "@/lib/auth/login-required";

export function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, authenticated } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace(buildLoginRequiredUrl(`${pathname}${window.location.search}`));
    }
  }, [authenticated, loading, pathname, router]);

  if (loading || !authenticated) {
    return <FullScreenLoadingState label="Loading..." />;
  }

  return children;
}
