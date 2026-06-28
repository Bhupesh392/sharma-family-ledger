import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  sub,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "credit" | "debit" | "gold";
  sub?: string;
}) {
  const toneClasses = {
    default: "text-ink bg-ink/5",
    credit: "text-credit bg-credit/10",
    debit: "text-debit bg-debit/10",
    gold: "text-gold bg-gold/10",
  }[tone];

  return (
    <div className="ledger-card p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">
          {label}
        </p>
        <p className="font-display font-mono-num text-2xl font-semibold text-ink mt-1.5 truncate">
          {value}
        </p>
        {sub && <p className="text-xs text-ink-soft mt-1">{sub}</p>}
      </div>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full shrink-0", toneClasses)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
