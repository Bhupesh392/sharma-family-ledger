"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatINR } from "@/lib/utils";

type ProfitabilityPoint = { name: string; income: number; expense: number; profit: number };

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="app-card p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground-soft mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
}

export function PropertyProfitabilityChart({ data }: { data: ProfitabilityPoint[] }) {
  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "var(--foreground-soft)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--foreground-soft)" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip content={<BarTooltip />} />
          <Bar dataKey="income" name="Income" fill="var(--income)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
