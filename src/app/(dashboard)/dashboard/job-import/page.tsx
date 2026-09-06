"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { FileUp, LoaderCircle, RefreshCcw, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { confirmJobImport, listJobImports, previewJobImport } from "@/lib/api";
import type { JobImportBatch, JobImportHistoryItem } from "@/lib/types";

export default function JobImportPage() {
  return (
    <RequireAdmin>
      <JobImportInner />
    </RequireAdmin>
  );
}

function JobImportInner() {
  const ROWS_PER_PAGE = 10;
  const [currentBatch, setCurrentBatch] = useState<JobImportBatch | null>(null);
  const [rowsPage, setRowsPage] = useState(1);
  const [history, setHistory] = useState<JobImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    const data = await listJobImports();
    setHistory(data.items);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listJobImports();
        if (active) setHistory(data.items);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await previewJobImport(file);
      setCurrentBatch(result.batch);
      setRowsPage(1);
      toast.success("CSV parsed successfully");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleConfirm = async () => {
    if (!currentBatch) return;
    setConfirming(true);
    try {
      const result = await confirmJobImport(currentBatch.id);
      setCurrentBatch(result.batch);
      setRowsPage(1);
      toast.success("Import completed");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Confirm failed");
    } finally {
      setConfirming(false);
    }
  };

  const totalRowsPages = currentBatch ? Math.ceil(currentBatch.rows.length / ROWS_PER_PAGE) : 0;
  const visibleRows = useMemo(() => {
    if (!currentBatch) return [];
    const start = (rowsPage - 1) * ROWS_PER_PAGE;
    return currentBatch.rows.slice(start, start + ROWS_PER_PAGE);
  }, [currentBatch, rowsPage]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Admin data import</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Job CSV import</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a jobs dataset, review duplicates and errors, then confirm import.
          </p>
        </div>
        <Button asChild variant="outline" disabled={uploading}>
          <label>
            <FileUp className="size-4" />
            {uploading ? "Parsing..." : "Upload CSV"}
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleUpload} />
          </label>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading import history...
        </div>
      ) : null}

      {currentBatch ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>{currentBatch.file_name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentBatch.total_rows} rows · {currentBatch.pending_insert_rows} inserts ·{" "}
                {currentBatch.pending_update_rows} updates · {currentBatch.duplicate_rows} duplicates ·{" "}
                {currentBatch.error_rows} errors
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentBatch.status}</Badge>
              <Button onClick={handleConfirm} disabled={confirming || currentBatch.status === "imported"}>
                <UploadCloud className="size-4" />
                {confirming ? "Importing..." : "Confirm import"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleRows.map((row) => (
              <div key={row.row_number} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">Row {row.row_number}</div>
                  <Badge variant="outline">{row.status}</Badge>
                </div>
                <div className="mt-2 text-muted-foreground">
                  {String(row.normalized_payload?.job_title ?? "")} ·{" "}
                  {String(row.normalized_payload?.company_name ?? "")}
                </div>
                {row.canonical_job_profile ? (
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>Occupation: {String(row.canonical_job_profile.occupation_family ?? "General")}</div>
                    <div>Seniority: {String(row.canonical_job_profile.seniority ?? "mid")}</div>
                    <div>
                      Required: {(row.canonical_job_profile.required_skills ?? []).join(", ") || "None"}
                    </div>
                    <div>
                      Preferred: {(row.canonical_job_profile.preferred_skills ?? []).join(", ") || "None"}
                    </div>
                    <div>Salary confidence: {String(row.canonical_job_profile.salary_confidence ?? "C")}</div>
                    <div>
                      Trust / freshness: {String(row.canonical_job_profile.trust_score ?? 0)} /{" "}
                      {String(row.canonical_job_profile.freshness_score ?? 0)}
                    </div>
                  </div>
                ) : null}
                {row.error_message ? <div className="mt-2 text-destructive">{row.error_message}</div> : null}
              </div>
            ))}
            <Pagination page={rowsPage} totalPages={totalRowsPages} onPageChange={setRowsPage} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Import history</CardTitle>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div>
                <div className="font-medium">{item.file_name}</div>
                <div className="text-muted-foreground">
                  {item.total_rows} rows · {item.inserted_rows} inserted · {item.updated_rows} updated ·{" "}
                  {item.skipped_rows} skipped
                </div>
              </div>
              <Badge variant="secondary">{item.status}</Badge>
            </div>
          ))}
          {!history.length ? <div className="text-sm text-muted-foreground">No imports yet.</div> : null}
        </CardContent>
      </Card>
    </section>
  );
}
