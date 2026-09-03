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
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <div className="col-start-2 text-center text-sm text-muted-foreground">
        第 {page} / {totalPages} 页
      </div>
      <div className="col-start-3 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
        >
          <ChevronLeft className="size-4" />
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
        >
          下一页
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
