"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, LoaderCircle, MapPin, Search, WandSparkles, X } from "lucide-react";
import { toast } from "sonner";

import { createApplication, getJob, listOpportunities, rewriteJobResume, sendFeedback } from "@/lib/api";
import type { Job, JobDetail, OpportunityMap } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const sectionOrder = ["Easy Wins", "High-Potential", "Stretch"];

function getJobTier(score?: number | null) {
  const value = score ?? 0;
  if (value >= 0.7) {
    return {
      tone: "border-emerald-500/30 bg-emerald-500/8 hover:border-emerald-500/50",
    };
  }
  if (value >= 0.4) {
    return {
      tone: "border-amber-500/30 bg-amber-500/8 hover:border-amber-500/50",
    };
  }
  return {
    tone: "border-slate-500/30 bg-slate-500/8 hover:border-slate-500/50",
  };
}

export default function JobsPage() {
  const router = useRouter();
  const [map, setMap] = useState<OpportunityMap | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(false);

  useEffect(() => {
    void listOpportunities()
      .then(setMap)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load opportunities"))
      .finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sectionOrder
      .map((title) => ({
        title,
        jobs: (map?.sections.find((section) => section.title === title)?.jobs ?? []).filter((job) =>
          !query || `${job.job_title} ${job.company_name} ${job.location}`.toLowerCase().includes(query),
        ),
      }))
      .filter((section) => section.jobs.length);
  }, [map, search]);

  const openJob = async (job: Job) => {
    try {
      setSelected(await getJob(job.id));
      await sendFeedback({ job_id: job.id, event_type: "view" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load job details");
    }
  };

  const apply = async (job: Job) => {
    const result = await createApplication(job.id);
    toast.success(result.created ? "Application saved" : "Application already tracked");
    window.open(result.apply_url, "_blank", "noopener,noreferrer");
  };

  const tailor = async (job: Job) => {
    setTailoring(true);
    try {
      const result = await rewriteJobResume(job.id);
      toast.success("Tailored resume generation started");
      setSelected(null);
      router.push(`/dashboard/resumes?tailored_task=${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start tailored resume generation");
    } finally {
      setTailoring(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Opportunity map</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Roles worth your attention</h1>
          <p className="mt-2 text-sm text-muted-foreground">Scores are feature vectors, not a mysterious badge.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Filter role, company, location" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Building your frontier...
        </div>
      ) : sections.length ? (
        <div className="grid gap-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {section.title === "Easy Wins"
                      ? "Strong evidence overlap and low transition cost."
                      : section.title === "High-Potential"
                        ? "Good upside with a manageable gap to close."
                        : "Deliberate pivots that may compound your options."}
                  </p>
                </div>
                <Badge variant="outline">{section.jobs.length} roles</Badge>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {section.jobs.map((job) => (
                  <Card
                    key={job.id}
                    className={[
                      "cursor-pointer transition-colors",
                      getJobTier(job.opportunity_score).tone,
                    ].join(" ")}
                    onClick={() => void openJob(job)}
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{job.job_title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{job.company_name || "Unknown company"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-primary">
                            {Math.round((job.opportunity_score ?? 0) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">opportunity fit</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {job.location || "Flexible location"}
                        </span>
                        <span>{job.transition_difficulty || "moderate"} transition</span>
                        <span>{Math.round((job.data_confidence ?? 0) * 100)}% confidence</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(job.rationale ?? []).slice(0, 2).map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No ranked opportunities yet. Upload and confirm a resume first.
          </CardContent>
        </Card>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <Card className="flex w-[min(96vw,1280px)] max-h-[86vh] flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <CardHeader className="relative flex flex-row items-start justify-between gap-4 pb-4">
              <div>
                <CardTitle>{selected.job_title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.company_name || "Unknown company"} · {selected.location || "Flexible location"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button className="w-44" onClick={() => void apply(selected)}>
                    <ExternalLink className="size-4" />
                    Track and apply
                  </Button>
                  <Button className="w-44" variant="outline" disabled={tailoring} onClick={() => void tailor(selected)}>
                    <WandSparkles className="size-4" />
                    {tailoring ? "Starting..." : "Plan tailored resume"}
                  </Button>
                </div>
              </div>
              <div className="pr-10">
                <Badge>{Math.round((selected.opportunity_score ?? 0) * 100)}% fit</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(selected.fit_breakdown ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-border/70 bg-muted/30 p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{key.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{Math.round(Number(value) * 100)}%</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground">Opportunity context</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md border border-border/60 bg-background/80 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Transition cost</div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {selected.opportunity_explanation?.transition_cost ?? "moderate"}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/80 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {Math.round((selected.opportunity_explanation?.confidence ?? 0) * 100)}%
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/80 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Salary</div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        ${selected.opportunity_explanation?.salary_context?.annual_salary_sgd ?? "n/a"} SGD
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {[
                      ["What fits", selected.opportunity_explanation?.what_fits],
                      ["What transfers", selected.opportunity_explanation?.what_transfers],
                      ["What is missing", selected.opportunity_explanation?.what_is_missing],
                    ].map(([title, items]) => (
                      <div key={String(title)} className="rounded-md border border-border/60 bg-background/80 p-3">
                        <h4 className="text-xs uppercase tracking-wide text-muted-foreground">{title}</h4>
                        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                          {(items as string[] | undefined)?.map((item) => (
                            <li key={item} className="rounded-md bg-muted/40 px-2 py-1 leading-5">
                              {item}
                            </li>
                          )) ?? <li className="text-muted-foreground">No additional signal</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground">Canonical job profile</h3>
                    <div className="mt-3 grid gap-2 rounded-md border border-border/60 bg-background/80 p-3 text-sm text-muted-foreground md:grid-cols-2">
                      <div>Occupation: {selected.canonical_job_profile?.occupation_family ?? "General"}</div>
                      <div>Seniority: {selected.canonical_job_profile?.seniority ?? "mid"}</div>
                      <div>
                        Required skills: {(selected.canonical_job_profile?.required_skills ?? []).join(", ") || "None"}
                      </div>
                      <div>
                        Preferred skills: {(selected.canonical_job_profile?.preferred_skills ?? []).join(", ") || "None"}
                      </div>
                      <div>
                        Education: {(selected.canonical_job_profile?.education_requirements ?? []).join(", ") || "None"}
                      </div>
                      <div>
                        Experience: {(selected.canonical_job_profile?.experience_requirements ?? []).join(", ") || "None"}
                      </div>
                      <div className="md:col-span-2">
                        Salary confidence: {selected.canonical_job_profile?.salary_confidence ?? "C"} · Trust:{" "}
                        {Math.round((selected.canonical_job_profile?.trust_score ?? 0) * 100)}% · Freshness:{" "}
                        {Math.round((selected.canonical_job_profile?.freshness_score ?? 0) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
