"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "复制 JSON" }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败，请重试");
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {label}
    </Button>
  );
}
