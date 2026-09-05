"use client";

import { AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StreamingOutputViewerProps = {
  output: string;
  messages: string[];
  error: string | null;
  running: boolean;
  done: boolean;
  title?: string;
  className?: string;
};

export function StreamingOutputViewer({
  output,
  messages,
  error,
  running,
  done,
  title = "Live generation output",
  className,
}: StreamingOutputViewerProps) {
  const visibleMessages = messages.slice(-4);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              {title}
            </CardTitle>
            <CardDescription>Raw model output streamed from the backend</CardDescription>
          </div>
          <Badge variant={error ? "destructive" : done ? "default" : "outline"}>
            {error ? "Failed" : done ? "Complete" : running ? "Running" : "Pending"}
          </Badge>
        </div>
        {visibleMessages.length ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            {visibleMessages.map((message, index) => (
              <div key={`${message}-${index}`} className="flex items-start gap-2">
                {error ? (
                  <AlertCircle className="mt-0.5 size-4 text-destructive" />
                ) : done ? (
                  <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                ) : (
                  <Loader2 className={cn("mt-0.5 size-4", running ? "animate-spin" : "")} />
                )}
                <span>{message}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6 whitespace-pre-wrap">
          {output || "Live output will appear here once generation starts."}
        </pre>
      </CardContent>
    </Card>
  );
}
