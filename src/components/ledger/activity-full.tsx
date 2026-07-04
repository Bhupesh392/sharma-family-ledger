"use client";

import { useMemo, useState } from "react";
import { ActivityItem } from "./activity-item";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

const ENTITY_TYPE_LABELS: Record<string, string> = {
  RENT: "Rent",
  UTILITY: "Utility",
  CHITRAKOOT_RENT: "Chitrakoot Rent",
  CONSTRUCTION: "Construction",
  RETURN_ITEM: "Return Item",
  MISC: "Misc",
  PROPERTY: "Property",
  TENANT: "Tenant",
  TENANCY: "Tenancy",
  DOCUMENT: "Document",
};

export function ActivityFull({ entries }: { entries: ActivityEntry[] }) {
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const uniqueMembers = useMemo(
    () => [...new Set(entries.map((e) => e.userName))].sort(),
    [entries]
  );
  const uniqueEntities = useMemo(
    () => [...new Set(entries.map((e) => e.entityType))].sort(),
    [entries]
  );

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (memberFilter !== "ALL" && e.userName !== memberFilter) return false;
      if (entityFilter !== "ALL" && e.entityType !== entityFilter) return false;
      if (actionFilter !== "ALL" && e.action !== actionFilter) return false;
      return true;
    });
  }, [entries, memberFilter, entityFilter, actionFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={memberFilter} onValueChange={setMemberFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All members</SelectItem>
            {uniqueMembers.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All sections</SelectItem>
            {uniqueEntities.map((e) => (
              <SelectItem key={e} value={e}>
                {ENTITY_TYPE_LABELS[e] ?? e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All actions</SelectItem>
            <SelectItem value="CREATE">Added</SelectItem>
            <SelectItem value="UPDATE">Edited</SelectItem>
            <SelectItem value="DELETE">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-sm text-foreground-soft self-center ml-auto">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      {/* Log entries */}
      <Card>
        <CardContent className="pt-5">
          {filtered.length === 0 ? (
            <p className="text-sm text-foreground-soft text-center py-8">
              No entries match your filters.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {filtered.map((entry) => (
                <ActivityItem key={entry.id} entry={entry} showDiff />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
