"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = siteConfig.dashboardNav
    .filter((item) => !item.roles || item.roles.some((role) => role === user?.role))
    .map((item) => ({
      label: item.label,
      href: item.href,
      icon: item.icon!,
    }));

  return (
    <nav className="space-y-2">
      {links.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-start gap-3 rounded-md border border-transparent px-4 py-3 text-sm transition-colors hover:border-border/60 hover:bg-accent/10",
              isActive && "border-primary/25 bg-primary/10 text-foreground dark:border-primary/30 dark:shadow-[inset_0_0_0_1px_rgba(110,168,255,0.14)]"
            )}
          >
            <item.icon className={cn("mt-0.5 size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground dark:text-cyan-200/70")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      <aside className="hidden rounded-lg border border-border bg-card p-5 shadow-sm dark:border-border/70 dark:bg-card/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_60px_rgba(0,0,0,0.28)] dark:backdrop-blur lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-4">
          <div>
            <div className="text-lg font-semibold tracking-[-0.01em] text-foreground">Job Portal</div>
          </div>
          <NavLinks />
        </div>
      </aside>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm dark:border-border/70 dark:bg-card/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_60px_rgba(0,0,0,0.28)] dark:backdrop-blur lg:hidden">
        <div>
          <div className="text-sm text-muted-foreground dark:text-cyan-200/70">Navigation</div>
          <div className="font-medium tracking-[-0.01em] text-foreground">Job Portal</div>
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Navigation menu</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <NavLinks onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
