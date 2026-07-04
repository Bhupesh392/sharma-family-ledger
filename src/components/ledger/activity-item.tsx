"use client";

import { formatDistanceToNow } from "date-fns";
import { Plus, Pencil, Trash2, Building2, Users, Wallet, Zap, Store, HardHat, Undo2, Receipt, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ActivityEntry = {
  id: number;
  userName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityLabel: string;
  oldValues: string | null;
  newValues: string | null;
  createdAt: Date;
};

const ENTITY_ICONS: Record<string, React.ElementType> = {
  RENT: Wallet,
  UTILITY: Zap,
  CHITRAKOOT_RENT: Store,
  CONSTRUCTION: HardHat,
  RETURN_ITEM: Undo2,
  MISC: Receipt,
  PROPERTY: Building2,
  TENANT: Users,
  TENANCY: FileText,
  DOCUMENT: FileText,
};

const ENTITY_LABELS: Record<string, string> = {
  RENT: "Rent",
  UTILITY: "Utility",
  CHITRAKOOT_RENT: "Chitrakoot Rent",
  CONSTRUCTION: "Construction",
  RETURN_ITEM: "Return Item",
  MISC: "Misc Expense",
  PROPERTY: "Property",
  TENANT: "Tenant",
  TENANCY: "Tenancy",
  DOCUMENT: "Document",
};

const ACTION_STYLES = {
  CREATE: { icon: Plus, badge: "success" as const, label: "Added" },
  UPDATE: { icon: Pencil, badge: "indigo" as const, label: "Edited" },
  DELETE: { icon: Trash2, badge: "overdue" as const, label: "Deleted" },
};

function DiffView({ oldValues, newValues }: { oldValues: string | null; newValues: string | null }) {
  if (!oldValues && !newValues) return null;

  let oldObj: Record<string, unknown> = {};
  let newObj: Record<string, unknown> = {};

  try {
    if (oldValues) oldObj = JSON.parse(oldValues);
    if (newValues) newObj = JSON.parse(newValues);
  } catch {
    return null;
  }

  // Find changed keys only
  const allKeys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])];
  const changed = allKeys.filter((k) => {
    const oldVal = String(oldObj[k] ?? "");
    const newVal = String(newObj[k] ?? "");
    return oldVal !== newVal;
  });

  if (changed.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-1">
      {changed.map((key) => (
        <div key={key} className="flex items-center gap-2 text-xs text-foreground-soft flex-wrap">
          <span className="font-medium text-foreground-faint capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}:
          </span>
          {oldObj[key] != null && String(oldObj[key]) !== "" && (
            <span className="line-through text-expense opacity-70">
              {String(oldObj[key])}
            </span>
          )}
          {newObj[key] != null && String(newObj[key]) !== "" && (
            <span className="text-income font-medium">
              {String(newObj[key])}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function ActivityItem({
  entry,
  showDiff = false,
}: {
  entry: ActivityEntry;
  showDiff?: boolean;
}) {
  const action = ACTION_STYLES[entry.action];
  const EntityIcon = ENTITY_ICONS[entry.entityType] ?? FileText;
  const ActionIcon = action.icon;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="relative shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted">
          <EntityIcon className="h-3.5 w-3.5 text-foreground-soft" />
        </div>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full",
            entry.action === "CREATE" && "bg-emerald-100 text-income",
            entry.action === "UPDATE" && "bg-indigo-100 text-indigo",
            entry.action === "DELETE" && "bg-expense/10 text-expense"
          )}
        >
          <ActionIcon className="h-2.5 w-2.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-foreground">{entry.userName}</span>
          <Badge variant={action.badge} className="text-[10px] px-1.5 py-0">{action.label}</Badge>
          <span className="text-sm text-foreground-soft">
            {ENTITY_LABELS[entry.entityType] ?? entry.entityType}
          </span>
        </div>
        <p className="text-xs text-foreground-soft mt-0.5 truncate">{entry.entityLabel}</p>
        {showDiff && (
          <DiffView oldValues={entry.oldValues} newValues={entry.newValues} />
        )}
      </div>

      <span className="text-xs text-foreground-faint whitespace-nowrap shrink-0">
        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}
