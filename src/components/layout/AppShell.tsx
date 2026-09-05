"use client";

import type { ReactNode } from "react";

import { TopNav } from "@/components/layout/TopNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col px-6 py-4 md:px-8 lg:px-10">
      <TopNav />
      {children}
    </main>
  );
}
