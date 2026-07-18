import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-muted text-foreground-soft",
        primary: "border-primary-100 bg-primary-50 text-primary",
        success: "border-accent-100 bg-accent-50 text-accent",
        income: "border-emerald-100 bg-emerald-50 text-income",
        expense: "border-expense/20 bg-expense/10 text-expense",
        pending: "border-pending/30 bg-pending/10 text-pending",
        overdue: "border-overdue/30 bg-overdue/10 text-overdue",
        admin: "border-primary-100 bg-primary-50 text-primary",
        accent: "border-accent-100 bg-accent-50 text-accent",
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