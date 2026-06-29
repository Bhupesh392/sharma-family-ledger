"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export type SparkPoint = { value: number };

export function KpiCard({
  label,
  value,
  icon,
  tone = "default",
  trend,
  comparisonLabel,
  sparkline,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "income" | "expense" | "pending";
  trend?: number; // percent change, positive or negative
  comparisonLabel?: string;
  sparkline?: SparkPoint[];
}) {
  const toneClasses = {
    default: "text-indigo bg-indigo-100",
    income: "text-income bg-emerald-100",
    expense: "text-expense bg-expense/10",
    pending: "text-pending bg-pending/10",
  }[tone];

  const sparkColor = {
    default: "var(--indigo)",
    income: "var(--income)",
    expense: "var(--expense)",
    pending: "var(--pending)",
  }[tone];

  const isPositive = (trend ?? 0) >= 0;

  return (
    <div className="app-card app-card-hover relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground-soft">{label}</p>
          <p className="font-display text-2xl font-semibold text-foreground mt-1.5 font-mono-num truncate">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  isPositive ? "text-income" : "text-expense"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
              {comparisonLabel && (
                <span className="text-xs text-foreground-faint">{comparisonLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0 [&_svg]:h-5 [&_svg]:w-5", toneClasses)}>
          {icon}
        </div>
      </div>

      {sparkline && sparkline.length > 1 && (
        <div className="h-10 mt-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
