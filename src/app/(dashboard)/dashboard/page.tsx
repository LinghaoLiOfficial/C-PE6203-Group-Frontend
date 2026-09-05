"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, FileText, BriefcaseBusiness, ChartColumn, Sparkles } from "lucide-react";

import { getDashboardSummary } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { key: "jobs_total", label: "Jobs", icon: BriefcaseBusiness },
  { key: "jobs_matched", label: "Matched", icon: ChartColumn },
  { key: "resumes_total", label: "Resumes", icon: FileText },
  { key: "unread_notifications", label: "Notifications", icon: Bell },
] as const;

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setSummary(await getDashboardSummary());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="space-y-4">
      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
              Live workspace
            </Badge>
            <CardTitle className="text-2xl">Command dashboard</CardTitle>
          </div>
          <Sparkles className="size-5 text-cyan-300" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => {
            const value = summary ? summary[item.key] : 0;
            const Icon = item.icon;
            return (
              <div key={item.key} className="rounded-lg border border-border/70 bg-background/40 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <Icon className="size-4 text-cyan-300" />
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">{loading ? "..." : value}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild variant="outline" className="justify-between border-border/70 bg-background/40 text-foreground hover:bg-accent/20">
            <Link href="/dashboard/jobs">
              Browse jobs
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-between border-border/70 bg-background/40 text-foreground hover:bg-accent/20">
            <Link href="/dashboard/resumes">Upload resume</Link>
          </Button>
          <Button asChild variant="outline" className="justify-between border-border/70 bg-background/40 text-foreground hover:bg-accent/20">
            <Link href="/dashboard/applications">Track applications</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">Account status</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          {summary?.active_resume_exists
            ? "A resume is active and ready for matching."
            : "Upload a resume to start matching jobs."}
        </CardContent>
      </Card>
    </section>
  );
}
