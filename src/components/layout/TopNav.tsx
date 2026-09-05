"use client";

import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function TopNav({ compactGap = false }: { compactGap?: boolean }) {
  const { authenticated } = useAuth();

  return (
    <header
      className={cn(
        "z-40 shrink-0 transition-[margin,top] duration-300 ease-out motion-reduce:transition-none",
        compactGap ? "relative" : "sticky top-4 mb-6"
      )}
    >
      <div className="rounded-lg border border-border/70 bg-background/70 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-primary to-cyan-400 text-primary-foreground shadow-[0_10px_24px_rgba(79,140,255,0.28)]">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <div className="text-xs text-cyan-200/70">Job Portal</div>
              <div className="font-semibold tracking-[-0.01em] text-foreground">AI Job Search</div>
            </div>
          </Link>

          <div className="flex items-center justify-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href={authenticated ? "/dashboard" : "/login"}>Open portal</Link>
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
