"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border border-border bg-background px-4 py-3 shadow-sm">
      <div className="col-start-2 text-center text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
      <div className="col-start-3 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
