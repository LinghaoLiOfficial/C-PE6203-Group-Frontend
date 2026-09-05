import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors backdrop-blur",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary/90 to-cyan-400/80 text-primary-foreground shadow-sm",
        secondary: "border-border/70 bg-secondary/80 text-secondary-foreground",
        outline: "border-border/70 bg-background/40 text-foreground",
        destructive: "border-transparent bg-destructive/90 text-white",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
