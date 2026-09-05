import Link from "next/link";
import { Braces, GitBranch } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 mb-8">
      <div className="rounded-lg border border-border bg-background/90 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Braces className="size-5" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Project</div>
              <div className="font-medium">{env.NEXT_PUBLIC_APP_NAME}</div>
            </div>
          </Link>

          <div className="hidden items-center gap-4 lg:flex">
            {siteConfig.marketingNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href={siteConfig.links.repo} target="_blank">
                <GitBranch className="size-4" />
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
