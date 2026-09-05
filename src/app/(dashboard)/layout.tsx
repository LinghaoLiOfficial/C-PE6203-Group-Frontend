"use client";

import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <RequireAuth>
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-6 py-6 md:px-8 lg:px-10">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <DashboardSidebar />
          <div className="flex min-h-[calc(100dvh-3rem)] flex-col gap-4">
            <DashboardHeader />
            {children}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
