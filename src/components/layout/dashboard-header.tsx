"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const router = useRouter();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm text-cyan-200/70">Job Portal</div>
        <div className="text-lg font-semibold tracking-[-0.01em] text-foreground">{user?.profile?.first_name || user?.username || "Dashboard"}</div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button asChild variant="outline">
          <Link href="/dashboard/jobs">Browse jobs</Link>
        </Button>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
