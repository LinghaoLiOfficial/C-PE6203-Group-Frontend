import Link from "next/link";
import { ArrowRight, Bell, BriefcaseBusiness, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const highlights = [
  {
    title: "Job matches",
    description: "Browse roles that fit your resume and keep the list focused.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Resume workspace",
    description: "Upload your resume and generate role-specific rewrites when needed.",
    icon: FileText,
  },
  {
    title: "Application tracking",
    description: "Follow application status and review updates from one dashboard.",
    icon: Bell,
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(110,168,255,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(42,208,255,0.11),transparent_22%),linear-gradient(180deg,rgba(7,12,26,0.92),rgba(3,7,18,0.96))]" />
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:min-h-[calc(100vh-4rem)] lg:justify-center">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-balance text-foreground md:text-6xl">
                {siteConfig.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                {siteConfig.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground hover:brightness-110">
                <Link href="/login">
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-border/70 bg-background/40 text-foreground hover:bg-accent/20">
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-border/70 bg-card/80 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_80px_rgba(0,0,0,0.32)] backdrop-blur">
              <div className="flex items-center justify-between text-sm text-cyan-100/70">
                <span>Dashboard</span>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-cyan-200">Ready</span>
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">Your job search, organized</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Search roles, manage resumes, and keep every application status visible.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="border-border/70 bg-card/80 backdrop-blur">
                    <CardHeader className="gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-[18px]">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
