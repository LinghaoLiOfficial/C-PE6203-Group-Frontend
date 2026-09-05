"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { FullScreenLoadingState } from "@/components/common/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buildLoginRequiredUrl } from "@/lib/auth/login-required";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, authenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace(buildLoginRequiredUrl(window.location.pathname + window.location.search));
    }
  }, [authenticated, loading, router]);

  if (loading || !authenticated) {
    return <FullScreenLoadingState label="Loading..." />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
        <Alert>
          <div className="flex gap-3">
            <ShieldAlert className="mt-1 size-5 shrink-0 text-amber-400" />
            <div className="space-y-4">
              <div>
                <AlertTitle>Access denied</AlertTitle>
                <AlertDescription>The admin page is only available to users with the admin role.</AlertDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return children;
}
