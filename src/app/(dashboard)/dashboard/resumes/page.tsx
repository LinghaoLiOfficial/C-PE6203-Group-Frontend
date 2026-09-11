"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Clipboard, Download, FileUp, LoaderCircle, Play, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteResume,
  getResumeGraph,
  getResumeParseStatus,
  listResumes,
  listTailoredResumes,
  retryResumeTailoringTask,
  parseResume,
  uploadResume,
} from "@/lib/api";
import type { Resume, ResumeGraph, ResumeParseTask, ResumeTailoringTask, ResumeVariantListItem } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

const POLL_INTERVAL_MS = 1000;
const FEATURE_CARD_CLASS = "max-h-72 overflow-y-auto rounded-md border border-border/70 bg-background/60 p-4";

const stageLabelMap: Record<string, string> = {
  uploaded: "Uploaded",
  queued: "Queued",
  claiming: "Claiming",
  extracting: "Extracting text",
  analyzing: "Analyzing",
  embedding: "Embedding",
  building_graph: "Building graph",
  completed: "Completed",
  failed: "Failed",
};

type ParseLike = Pick<ResumeParseTask, "stage"> | Pick<Resume, "parse_stage"> | null | undefined;

function parseLabel(task?: ParseLike) {
  if (!task) return "Not parsed";
  const stage = "stage" in task ? task.stage : task.parse_stage;
  return stageLabelMap[stage] ?? stage;
}

function formatList(values?: Array<string | null | undefined> | null) {
  return (values ?? []).map((value) => String(value ?? "").trim()).filter(Boolean);
}

function formatRecordList(items?: Array<Record<string, unknown>> | null) {
  return (items ?? [])
    .map((item) => {
      const label =
        String(item.title ?? item.name ?? item.company ?? item.description ?? item.claim ?? item.text ?? "")
          .trim() || JSON.stringify(item);
      return label;
    })
    .filter(Boolean);
}

function formatSkillEntries(items?: Array<Record<string, unknown>> | null) {
  return (items ?? [])
    .map((item) => {
      const name = String(item.name ?? "").trim();
      const proficiency = String(item.proficiency ?? "").trim();
      const recency = String(item.recency ?? "").trim();
      const meta = [proficiency, recency].filter(Boolean).join(" · ");
      return name ? `${name}${meta ? ` (${meta})` : ""}` : "";
    })
    .filter(Boolean);
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [tailoredItems, setTailoredItems] = useState<ResumeTailoringTask[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<ResumeGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsingResumeId, setParsingResumeId] = useState<string | null>(null);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [resumePendingDelete, setResumePendingDelete] = useState<Resume | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const taskId = searchParams.get("tailored_task");
  const bumpResumeRevision = useAppStore((state) => state.bumpResumeRevision);

  const activeResume = useMemo(() => resumes.find((resume) => resume.is_active) ?? resumes[0] ?? null, [resumes]);
  const pollingResumeId = useMemo(
    () => resumes.find((resume) => resume.parse_status === "queued" || resume.parse_status === "running")?.id ?? null,
    [resumes]
  );

  const refreshResumes = useCallback(async (targetResumeId?: string | null) => {
    const [resumesData, tailoredData] = await Promise.all([listResumes(), listTailoredResumes()]);
    setResumes(resumesData);
    setTailoredItems(tailoredData);
    const nextSelectedId =
      targetResumeId ?? resumesData.find((resume) => resume.id === selectedResumeId)?.id ?? resumesData[0]?.id ?? null;
    const nextSelected = nextSelectedId ? resumesData.find((resume) => resume.id === nextSelectedId) ?? resumesData[0] ?? null : null;
    setSelectedResumeId(nextSelected?.id ?? null);
    setSelectedGraph(nextSelected ? await getResumeGraph(nextSelected.id) : null);
  }, [selectedResumeId]);

  const refreshSelectedGraph = async (resumeId?: string | null) => {
    const targetId = resumeId ?? selectedResumeId ?? activeResume?.id ?? null;
    if (!targetId) {
      setSelectedGraph(null);
      return;
    }
    setSelectedGraph(await getResumeGraph(targetId));
  };

  const loadParseStatus = useCallback(async (resumeId: string) => {
    const payload = await getResumeParseStatus(resumeId);
    const task = payload.task;
    if (task) {
      setResumes((current) =>
        current.map((resume) =>
          resume.id === resumeId
            ? {
                ...resume,
                parse_status: task.status,
                parse_progress: task.progress,
                parse_stage: task.stage,
                parse_error: task.error_message,
                parse_task_id: task.id,
                parse_diagnostics: task.diagnostics ?? null,
                parse_mode: String(task.diagnostics?.analysis_mode ?? task.diagnostics?.mode ?? resume.parse_mode ?? "unknown"),
              }
            : resume
        )
      );
      if (task.status === "completed") {
        await refreshResumes(resumeId);
        bumpResumeRevision();
      } else if (task.status === "failed") {
        await refreshResumes(resumeId);
      }
    }
  }, [refreshResumes, bumpResumeRevision]);

  useEffect(() => {
    if (!pollingResumeId) return undefined;
    const timer = window.setInterval(() => {
      void loadParseStatus(pollingResumeId);
    }, POLL_INTERVAL_MS);
    const initialTimer = window.setTimeout(() => {
      void loadParseStatus(pollingResumeId);
    }, 0);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(initialTimer);
    };
  }, [loadParseStatus, pollingResumeId]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [resumesResult, tailoredResult] = await Promise.allSettled([listResumes(), listTailoredResumes()]);
        if (resumesResult.status === "rejected") {
          throw resumesResult.reason;
        }
        const resumesData = resumesResult.value;
        const tailoredData = tailoredResult.status === "fulfilled" ? tailoredResult.value : [];
        if (!active) return;
        setResumes(resumesData);
        setTailoredItems(tailoredData);
        if (tailoredResult.status === "rejected") {
          toast.error(tailoredResult.reason instanceof Error ? tailoredResult.reason.message : "Unable to load tailored resumes");
        }
        const initial = resumesData.find((resume) => resume.is_active) ?? resumesData[0] ?? null;
        setSelectedResumeId(initial?.id ?? null);
        setSelectedGraph(initial ? await getResumeGraph(initial.id) : null);
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Unable to load resumes");
          setResumes([]);
          setTailoredItems([]);
          setSelectedGraph(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const hasActiveTailoring = useMemo(
    () => tailoredItems.some((item) => item.status === "queued" || item.status === "running"),
    [tailoredItems]
  );

  useEffect(() => {
    if (!hasActiveTailoring) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const tailored = await listTailoredResumes();
        if (!active) return;
        setTailoredItems(tailored);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load tailoring task");
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [hasActiveTailoring]);

  const retryTailoring = async (taskToRetry: ResumeTailoringTask) => {
    try {
      const nextTask = await retryResumeTailoringTask(taskToRetry.id);
      setTailoredItems((current) => current.map((item) => item.id === nextTask.id ? nextTask : item));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to retry tailoring");
    }
  };

  const handleDelete = async () => {
    if (!resumePendingDelete) return;
    setDeletingResumeId(resumePendingDelete.id);
    try {
      await deleteResume(resumePendingDelete.id);
      toast.success("Resume deleted");
      setResumePendingDelete(null);
      await refreshResumes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingResumeId(null);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadResume(file);
      toast.success("File uploaded. Parse it when ready.");
      await refreshResumes(result.resume_id);
      bumpResumeRevision();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleParse = async (resumeId: string) => {
    setParsingResumeId(resumeId);
    try {
      await parseResume(resumeId);
      toast.success("Parse task started");
      await loadParseStatus(resumeId);
      await refreshSelectedGraph(resumeId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Parse failed to start");
    } finally {
      setParsingResumeId(null);
    }
  };

  const candidateGraph = selectedGraph?.candidate_graph;
  const selectedSkills = formatRecordList(candidateGraph?.skills);
  const selectedSkillEntries = formatSkillEntries(candidateGraph?.skills);
  const selectedExperienceHighlights = formatList(candidateGraph?.experience_highlights);
  const selectedExperiences = formatRecordList(candidateGraph?.experiences);
  const selectedEducation = formatRecordList(candidateGraph?.education);
  const selectedProjects = formatRecordList(candidateGraph?.projects);
  const selectedAchievements = formatRecordList(candidateGraph?.achievements);
  const selectedPublications = formatRecordList(candidateGraph?.publications);
  const groupedTailoredItems = useMemo(() => {
    const mapByJob = new Map<string, ResumeTailoringTask>();
    for (const item of tailoredItems) mapByJob.set(item.job_id, item);
    return Array.from(mapByJob.values());
  }, [tailoredItems]);

  const copyVariant = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Resume copied");
  };

  const downloadVariant = (variant: ResumeVariantListItem) => {
    const blob = new Blob([variant.rewritten_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(variant.job_title || "tailored-resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderVariantCard = (variant: ResumeVariantListItem) => {
    const rationaleOpen = Boolean(showRationale[variant.id]);
    const sections = variant.resume_sections ?? {};
    const changes = variant.change_summary ?? [];
    const requirements = variant.target_requirements ?? [];
    return (
    <Card key={variant.id} className="overflow-hidden border-primary/30 bg-primary/[0.04]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <CardTitle className="pb-0 text-sm font-semibold leading-5">
              {variant.job_title || "Tailored resume"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {variant.company_name || "Unknown company"}
              {variant.source_file_name ? ` · ${variant.source_file_name}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge>Latest</Badge>
            {variant.cached ? <Badge variant="secondary">Cached</Badge> : null}
            <Badge variant="outline">{new Date(variant.created_at).toLocaleDateString()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="min-w-0 rounded-md border border-border/70 bg-background/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resume preview</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => void copyVariant(variant.rewritten_text)}><Clipboard className="size-4" />Copy</Button>
                <Button size="sm" variant="outline" onClick={() => downloadVariant(variant)}><Download className="size-4" />Download</Button>
              </div>
            </div>
            <div className="max-h-[34rem] overflow-y-auto pr-2">
              {Object.keys(sections).length ? Object.entries(sections).map(([section, value]) => (
                <div key={section} className="mb-5 last:mb-0">
                  <h3 className="text-sm font-semibold capitalize text-foreground">{section.replaceAll("_", " ")}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{Array.isArray(value) ? value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join("\n") : String(value ?? "")}</p>
                </div>
              )) : <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground">{variant.rewritten_text}</pre>}
            </div>
          </div>
          <div className="min-w-0 rounded-md border border-border/70 bg-background/70 p-4">
            <button className="flex w-full items-center justify-between text-left text-sm font-semibold" onClick={() => setShowRationale((current) => ({ ...current, [variant.id]: !rationaleOpen }))}>
              Modification rationale <ChevronDown className={`size-4 transition-transform ${rationaleOpen ? "rotate-180" : ""}`} />
            </button>
            {rationaleOpen ? <div className="mt-4 max-h-[30rem] space-y-4 overflow-y-auto pr-2">
              {changes.map((change, index) => <div key={`${variant.id}-change-${index}`} className="border-l-2 border-primary/50 pl-3 text-sm"><div className="font-medium text-foreground">{String(change.section ?? "Resume")} · {String(change.action ?? "updated")}</div><p className="mt-1 text-muted-foreground">{String(change.reason ?? "Aligned content to the target role.")}</p>{Array.isArray(change.source_evidence) ? <p className="mt-1 text-xs text-muted-foreground">Evidence: {change.source_evidence.join("; ")}</p> : null}</div>)}
              {requirements.map((item, index) => <div key={`${variant.id}-requirement-${index}`} className="rounded-md bg-muted/40 p-3 text-sm"><div className="font-medium text-foreground">{String(item.requirement ?? "Requirement")}</div><div className="mt-1 text-muted-foreground">{String(item.coverage ?? "unknown")} {Array.isArray(item.matched_evidence) ? `· ${item.matched_evidence.join("; ")}` : ""}</div></div>)}
              {!changes.length && !requirements.length ? <p className="text-sm text-muted-foreground">No rationale details were returned for this version.</p> : null}
            </div> : <p className="mt-3 text-sm text-muted-foreground">Review the evidence and target coverage behind this tailored version.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  const renderTailoredItem = (item: ResumeTailoringTask) => {
    if (item.status !== "completed" || !item.variant) {
      return (
        <Card key={item.id} className={`border-primary/30 bg-primary/[0.04] ${taskId === item.id ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : ""}`}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-base">{item.job_title || "Tailored resume"}</CardTitle>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {item.company_name || "Unknown company"}{item.source_file_name ? ` · ${item.source_file_name}` : ""}
              </p>
            </div>
            <Badge variant={item.status === "failed" ? "destructive" : "secondary"}>
              {item.status === "running" ? "Generating" : item.status === "queued" ? "Queued" : "Failed"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.status === "failed" ? <p className="text-sm text-destructive">{item.error_message || "Generation failed."}</p> : (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{item.stage}</span><span>{item.progress}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${item.progress}%` }} /></div>
              </>
            )}
            {item.status === "failed" ? <Button variant="outline" onClick={() => void retryTailoring(item)}><RefreshCw className="size-4" />Retry</Button> : null}
          </CardContent>
        </Card>
      );
    }
    return <div key={item.id} className={taskId === item.id ? "rounded-lg ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : ""}>{renderVariantCard(item.variant)}</div>;
  };

  return (
    <section className="space-y-6">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading resumes...
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTailoredItems.length ? (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold">Tailored resumes</h2>
                <p className="text-sm text-muted-foreground">Generated versions appear here above the original uploads.</p>
              </div>
              <div className="space-y-4">
                {groupedTailoredItems.map(renderTailoredItem)}
              </div>
            </div>
          ) : null}

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Upload resume</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload first, manage the file, then start parsing manually when you are ready.
                </p>
              </div>
              <Button asChild variant="outline" disabled={uploading}>
                <label>
                  <FileUp className="size-4" />
                  {uploading ? "Uploading..." : "Choose file"}
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleUpload} />
                </label>
              </Button>
            </CardHeader>
          </Card>

          {!resumes.length ? (
            <EmptyState
              icon={FileUp}
              title="No resumes uploaded"
              description="Upload a PDF, DOCX, or TXT file to manage it here and trigger parsing when you are ready."
            />
          ) : null}

          {resumes.map((resume) => {
              const isSelected = selectedResumeId === resume.id;
              const taskState = resume.parse_status;
              const canParse = taskState !== "running" && taskState !== "queued";

              return (
                <Card
                  key={resume.id}
                  className={[
                    "transition-colors",
                    isSelected ? "border-primary/60 shadow-sm" : "hover:border-primary/50",
                  ].join(" ")}
                  onClick={async () => {
                    setSelectedResumeId(resume.id);
                    setSelectedGraph(await getResumeGraph(resume.id));
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <CardTitle className="pb-1 text-sm font-semibold leading-5">{resume.file_name}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{resume.is_active ? "Active file" : "Inactive"}</Badge>
                          <Badge variant={resume.parse_status === "completed" ? "default" : "outline"}>
                            {parseLabel(resume)}
                          </Badge>
                          {resume.parse_mode ? <Badge variant="outline">{resume.parse_mode.toUpperCase()}</Badge> : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          className="min-w-0"
                          disabled={!canParse || parsingResumeId === resume.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleParse(resume.id);
                          }}
                        >
                          {parsingResumeId === resume.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Play className="size-4" />
                          )}
                          {resume.parse_status === "failed" ? "Retry parse" : "Parse"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingResumeId === resume.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setResumePendingDelete(resume);
                          }}
                          aria-label={`Delete ${resume.file_name}`}
                        >
                          {deletingResumeId === resume.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {isSelected ? (
                    <CardContent className="border-t border-border/60 pt-5">
                      <div className="rounded-md border border-border/70 bg-background/60 p-3 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Progress</span>
                          <span>{resume.parse_progress ?? 0}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-[width]"
                            style={{ width: `${resume.parse_progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                        {resume.parse_error ? <p className="text-sm text-destructive">{resume.parse_error}</p> : null}
                        {candidateGraph ? (
                          <>
                            <div className={FEATURE_CARD_CLASS}>
                              <p className="text-sm font-medium text-foreground">Summary</p>
                              <p className="mt-2 leading-6">{candidateGraph.summary}</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-md border border-border/70 bg-background/60 p-3">
                                <div className="text-xs uppercase tracking-wide">Skills</div>
                                <div className="mt-2 text-xl font-semibold text-foreground">{selectedSkills.length}</div>
                              </div>
                              <div className="rounded-md border border-border/70 bg-background/60 p-3">
                                <div className="text-xs uppercase tracking-wide">Highlights</div>
                                <div className="mt-2 text-xl font-semibold text-foreground">{selectedExperienceHighlights.length}</div>
                              </div>
                              <div className="rounded-md border border-border/70 bg-background/60 p-3">
                                <div className="text-xs uppercase tracking-wide">Education</div>
                                <div className="mt-2 text-xl font-semibold text-foreground">{selectedEducation.length}</div>
                              </div>
                              <div className="rounded-md border border-border/70 bg-background/60 p-3">
                                <div className="text-xs uppercase tracking-wide">Projects</div>
                                <div className="mt-2 text-xl font-semibold text-foreground">{selectedProjects.length}</div>
                              </div>
                              <div className="rounded-md border border-border/70 bg-background/60 p-3">
                                <div className="text-xs uppercase tracking-wide">Achievements</div>
                                <div className="mt-2 text-xl font-semibold text-foreground">{selectedAchievements.length}</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {selectedSkillEntries.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Skills</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedSkillEntries.map((skill, index) => <li key={`${skill}-${index}`}>· {skill}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                              {selectedExperienceHighlights.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Experience highlights</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedExperienceHighlights.map((item, index) => <li key={`${item}-${index}`}>· {item}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                              {selectedProjects.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Projects</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedProjects.map((item, index) => <li key={`${item}-${index}`}>· {item}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                              {selectedExperiences.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Experience facts</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedExperiences.map((item, index) => <li key={`${item}-${index}`}>· {item}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                              {selectedAchievements.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Achievements</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedAchievements.map((item, index) => <li key={`${item}-${index}`}>· {item}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                              {selectedEducation.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Education</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedEducation.map((item, index) => <li key={`${item}-${index}`}>· {item}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                              {selectedPublications.length ? (
                                <div className={FEATURE_CARD_CLASS}>
                                  <p className="text-sm font-medium text-foreground">Publications</p>
                                  <ul className="mt-3 space-y-2 text-sm">
                                    {selectedPublications.map((item, index) => <li key={`${item}-${index}`}>· {item}</li>)}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(resumePendingDelete)}
        title="Delete resume"
        description={`Delete ${resumePendingDelete?.file_name ?? "this resume"}? This removes the file and its database record.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={Boolean(resumePendingDelete && deletingResumeId === resumePendingDelete.id)}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open && deletingResumeId === null) {
            setResumePendingDelete(null);
          }
        }}
      />
    </section>
  );
}
