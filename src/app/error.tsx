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
        <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">出现了一些问题</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            这是全局错误边界示例。你可以在这里接入埋点、日志上报和更友好的错误恢复逻辑。
          </p>
          <Button className="mt-6" onClick={reset}>
            重试
          </Button>
        </div>
      </body>
    </html>
  );
}
