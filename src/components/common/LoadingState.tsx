import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

export function FullScreenLoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex h-dvh w-full items-center justify-center bg-background/70 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-5 text-muted-foreground">
        <LoaderCircle className="size-16 animate-spin text-primary/60" aria-hidden="true" />
        <span className="text-base font-medium">{label}</span>
      </div>
    </div>
  );
}
