"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "@/lib/utils";

type TrendPoint = { month: string; income: number; expense: number; profit: number };

function ChartTooltip({
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

export function IncomeExpenseTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--income)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
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
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="var(--income)"
            strokeWidth={2}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="var(--expense)"
            strokeWidth={2}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
