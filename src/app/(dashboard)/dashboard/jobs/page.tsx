"use client";

import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronDown, ExternalLink, LoaderCircle, MapPin, Search, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { createApplication, getDashboardSummary, listJobs, rewriteJobResume } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";
import type { PaginatedJobsResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

const LOW_SALARY_THRESHOLD = 74500;
const MID_SALARY_THRESHOLD = 95500;
const MIN_LOADING_MS = 1000;
const DEFAULT_PAGE_SIZE = 10;

function getSalaryTierBackground(job: NonNullable<PaginatedJobsResponse["items"]>[number]) {
  const annualSalary =
    job.mid_salary_sgd != null
      ? job.pay_period?.toLowerCase().startsWith("month")
        ? job.mid_salary_sgd * 12
        : job.mid_salary_sgd
      : null;
  if (annualSalary == null) {
    return "bg-sky-500/8";
  }
  if (annualSalary < LOW_SALARY_THRESHOLD) {
    return "bg-blue-500/10";
  }
  if (annualSalary < MID_SALARY_THRESHOLD) {
    return "bg-sky-500/12";
  }
  return "bg-cyan-500/12";
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<PaginatedJobsResponse | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [searchSummary, setSearchSummary] = useState<PaginatedJobsResponse["summary"] | null>(null);
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);

  const runSearch = async (nextQuery: string, nextLocation: string, nextCompany: string, nextPage = 1) => {
    setLoadingJobs(true);
    const startedAt = Date.now();
    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", String(DEFAULT_PAGE_SIZE));
      if (nextQuery) params.set("skills", nextQuery);
      if (nextLocation) params.set("location", nextLocation);
      if (nextCompany) params.set("company", nextCompany);
      const result = await listJobs(params.toString());
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_MS - elapsed));
      }
      setJobs(result);
      setSearchSummary(result.summary ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const summaryResult = await getDashboardSummary();
        setSummary(summaryResult);
        await runSearch("", "", "", 1);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load jobs");
      }
    })();
  }, []);

  const handleSearch = async () => {
    await runSearch(query.trim(), location.trim(), company.trim(), 1);
  };

  const handlePageChange = async (nextPage: number) => {
    await runSearch(query.trim(), location.trim(), company.trim(), nextPage);
  };

  const toggleJobExpanded = (jobId: string) => {
    setExpandedJobIds((current) => {
      const next = new Set(current);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const stopCardToggle = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  const handleApply = async (jobId: string) => {
    const applyWindow = window.open("", "_blank", "noreferrer");
    try {
      const result = await createApplication(jobId);
      toast.success(result.created ? "Application saved" : "Application already exists");
      if (applyWindow) {
        applyWindow.location.href = result.apply_url;
      } else {
        window.open(result.apply_url, "_blank", "noreferrer");
      }
    } catch (error) {
      applyWindow?.close();
      toast.error(error instanceof Error ? error.message : "Application failed");
    }
  };

  const handleRewrite = async (jobId: string) => {
    const result = await rewriteJobResume(jobId);
    toast.success(result.cached ? "Loaded cached rewrite" : "Rewrite created");
  };

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Browse jobs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
          <Input placeholder="Skills e.g. React, Python" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Button onClick={handleSearch} className="md:self-start" disabled={loadingJobs}>
            <Search className="size-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      {loadingJobs ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading jobs...
        </div>
      ) : null}

      {!loadingJobs && searchSummary ? (
        <Card className="w-full border-primary/20 bg-primary/10 px-4 py-2 text-center shadow-none">
          <div className="text-sm font-medium text-cyan-50">
            Search results contain {searchSummary.jobs_total} {searchSummary.jobs_total === 1 ? "job" : "jobs"}
          </div>
        </Card>
      ) : null}

      {!loadingJobs ? (
        <div className="grid gap-4">
          {jobs?.items.map((job) => (
            <Card
              key={job.id}
              className={`cursor-pointer ${getSalaryTierBackground(job)}`}
              onClick={() => toggleJobExpanded(job.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleJobExpanded(job.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={expandedJobIds.has(job.id)}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-3">
                  <CardTitle className="text-base">{job.job_title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.company_name || "Unknown company"}</Badge>
                    {job.mid_salary_sgd != null && job.pay_period ? (
                      <Badge variant="outline">SGD {job.mid_salary_sgd.toFixed(2)} / {job.pay_period}</Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                </div>
                {summary?.active_resume_exists ? (
                  <Badge variant="secondary">{Math.round((job.match_score || 0) * 100)}%</Badge>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={`text-sm text-muted-foreground ${expandedJobIds.has(job.id) ? "" : "line-clamp-3"}`}>
                  {job.job_description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skill_tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={(event) => {
                      stopCardToggle(event);
                      void handleApply(job.id);
                    }}
                  >
                    Apply
                    <ExternalLink className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(event) => {
                      stopCardToggle(event);
                      void handleRewrite(job.id);
                    }}
                  >
                    <WandSparkles className="size-4" />
                    Tailor resume
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    onClick={stopCardToggle}
                    onKeyDown={stopCardToggle}
                  >
                    <a href={job.external_apply_url} target="_blank" rel="noreferrer">
                      Open external link
                    </a>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ChevronDown className={`size-3.5 transition-transform ${expandedJobIds.has(job.id) ? "rotate-180" : ""}`} />
                  <span>{expandedJobIds.has(job.id) ? "Click to collapse description" : "Click card to expand description"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!loadingJobs && jobs?.pagination ? (
        <Pagination page={jobs.pagination.page} totalPages={jobs.pagination.total_pages} onPageChange={handlePageChange} />
      ) : null}
    </section>
  );
}
