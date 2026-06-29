"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR } from "@/lib/utils";

const COLORS = ["var(--indigo)", "var(--pending)", "var(--expense)", "var(--emerald)"];

type BreakdownPoint = { name: string; value: number };

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="app-card p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{point.name}</p>
      <p className="text-sm text-foreground-soft">{formatINR(point.value)}</p>
    </div>
  );
}

export function ExpenseBreakdownChart({ data }: { data: BreakdownPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-foreground-soft">
        No expenses recorded yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-foreground-soft">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {d.name}
            </span>
            <span className="font-medium text-foreground font-mono-num">
              {formatINR(d.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
