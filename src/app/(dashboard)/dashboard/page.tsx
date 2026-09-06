"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Map, Upload } from "lucide-react";

import { getCandidateProfile, listOpportunities } from "@/lib/api";
import type { CandidateProfile, OpportunityMap } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatItem = {
  label: string;
  value: number;
  icon: typeof BriefcaseBusiness;
};

export default function DashboardPage() {
  const [data, setData] = useState<OpportunityMap | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    void Promise.all([listOpportunities(), getCandidateProfile()])
      .then(([opportunities, candidate]) => {
        setData(opportunities);
        setProfile(candidate);
      })
      .catch(() => undefined);
  }, []);

  const sections = data?.sections ?? [];
  const topJobs = sections.flatMap((section) => section.jobs).slice(0, 3);
  const summary = data?.overview;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Career opportunity engine</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your next move, with evidence.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            We compare your confirmed candidate graph with live roles, then show where the fit is direct,
            transferable, or a deliberate stretch.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs">
            Explore opportunities
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {!summary?.active_resume_exists ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Upload className="size-4 text-primary" />
                Start with your resume
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload it once. We will extract facts and link recommendations back to source evidence.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/resumes">Upload resume</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Live roles", value: summary?.jobs_total ?? 0, icon: BriefcaseBusiness },
          { label: "Ranked matches", value: summary?.jobs_matched ?? 0, icon: Map },
          { label: "Applications", value: summary?.applications_total ?? 0, icon: FileText },
        ].map(({ label, value, icon: Icon }: StatItem) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
              <Icon className="size-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Opportunity frontier</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">The strongest roles across fit and transition cost.</p>
            </div>
            <Map className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {topJobs.length ? topJobs.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs?job=${job.id}`} className="block rounded-md border p-4 transition-colors hover:bg-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{job.job_title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.company_name || "Unknown company"} · {job.location || "Location flexible"}
                    </p>
                  </div>
                  <Badge variant="outline">{Math.round((job.opportunity_score ?? 0) * 100)}% fit</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{job.transition_difficulty || "moderate"} transition</span>
                  <span>·</span>
                  <span>{job.opportunity_category?.replace("_", " ") || "opportunity"}</span>
                </div>
              </Link>
            )) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Upload a resume to generate your opportunity map.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`mt-0.5 size-5 ${profile?.confirmed ? "text-emerald-500" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium">{profile?.confirmed ? "Profile confirmed" : "Confirm your profile"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Location, work authorization, preferences, and inferred facts affect ranking quality.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/profile">{profile?.confirmed ? "Review preferences" : "Confirm profile"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
