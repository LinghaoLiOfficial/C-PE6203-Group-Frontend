"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy JSON" }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed. Please try again.");
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {label}
    </Button>
  );
}
