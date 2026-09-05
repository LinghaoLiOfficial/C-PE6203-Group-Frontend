"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This is the global error boundary example. You can wire in analytics, logging, and a better recovery flow here.
          </p>
          <Button className="mt-6" onClick={reset}>
            Retry
          </Button>
        </div>
      </body>
    </html>
  );
}
