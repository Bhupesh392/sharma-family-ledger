import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-muted text-foreground-soft",
        indigo: "border-indigo-100 bg-indigo-100 text-indigo",
        success: "border-emerald-100 bg-emerald-100 text-emerald",
        pending: "border-pending/30 bg-pending/10 text-pending",
        overdue: "border-overdue/30 bg-overdue/10 text-overdue",
        admin: "border-indigo-100 bg-indigo-100 text-indigo",
        accent: "border-emerald-100 bg-emerald-100 text-emerald",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
