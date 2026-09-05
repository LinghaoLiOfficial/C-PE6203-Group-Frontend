"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { mounted, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const icon = !mounted ? (
    <MonitorCog className="size-4" />
  ) : isDark ? (
    <Sun className="size-4" />
  ) : (
    <Moon className="size-4" />
  );

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      {icon}
    </Button>
  );
}
