"use client";

import { useEffect, useState } from "react";
import { FileUp, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { deleteResume, listResumes, uploadResume } from "@/lib/api";
import type { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [resumePendingDelete, setResumePendingDelete] = useState<Resume | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listResumes();
        if (active) {
          setResumes(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const load = async () => {
    setResumes(await listResumes());
  };

  const handleDelete = async () => {
    if (!resumePendingDelete) return;
    setDeletingResumeId(resumePendingDelete.id);
    try {
      await deleteResume(resumePendingDelete.id);
      toast.success("Resume deleted");
      setResumePendingDelete(null);
      await load();
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
      await uploadResume(file);
      toast.success("Resume uploaded");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload resume</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="outline" disabled={uploading}>
            <label>
              <FileUp className="size-4" />
              {uploading ? "Uploading..." : "Choose file"}
              <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleUpload} />
            </label>
          </Button>
          <span className="text-sm text-muted-foreground">PDF, DOCX, or TXT up to 3MB.</span>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading resumes...
        </div>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle className="text-base">{resume.file_name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deletingResumeId === resume.id}
                  onClick={() => setResumePendingDelete(resume)}
                  aria-label={`Delete ${resume.file_name}`}
                >
                  {deletingResumeId === resume.id ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6">
                <div>Status: {resume.embedding_ready ? "Ready" : "Processing"}</div>
                <div>Skills: {(resume.extracted_skills || []).join(", ") || "None"}</div>
                <div className="text-muted-foreground">{resume.parsed_text?.slice(0, 220) || "No parsed text yet."}</div>
              </CardContent>
            </Card>
          ))}
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
