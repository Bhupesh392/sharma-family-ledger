"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type PaymentPoint = { label: string; daysLate: number };

function PaymentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PaymentPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const lateOrEarly = point.daysLate > 0 ? `${point.daysLate} days late` : point.daysLate < 0 ? `${Math.abs(point.daysLate)} days early` : "On time";
  return (
    <div className="app-card p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground-soft mb-1">{point.label}</p>
      <p className="text-sm font-medium text-foreground">{lateOrEarly}</p>
    </div>
  );
}

export function TenantPaymentBehaviorChart({ data }: { data: PaymentPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-foreground-soft">
        No submission dates recorded yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--foreground-soft)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--foreground-soft)" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<PaymentTooltip />} />
          <Bar dataKey="daysLate" radius={[6, 6, 6, 6]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.daysLate > 0 ? "var(--overdue)" : "var(--income)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
