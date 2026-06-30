"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { EmptyState } from "./empty-state";
import { PropertyCard } from "./property-card";
import { PropertyRow } from "./property-row";
import { Building2 } from "lucide-react";

type ActiveTenancy = {
  agreementStatus?: "ACTIVE" | "DUE_FOR_RENEWAL" | "EXPIRED" | "RENEWED" | "NOT_SET";
};

type PropertyWithOccupancy = {
  id: number;
  name: string;
  type: "RESIDENTIAL" | "SHOP";
  address: string | null;
  monthlyRent: string | null;
  imageUrl: string | null;
  notes: string | null;
  occupied: boolean;
  tenant?: { name: string; phone: string | null } | undefined;
  activeTenancy?: ActiveTenancy | undefined;
};

export function PropertiesBrowser({
  properties,
  isAdmin,
}: {
  properties: PropertyWithOccupancy[];
  isAdmin: boolean;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [occupancyFilter, setOccupancyFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (occupancyFilter === "OCCUPIED" && !p.occupied) return false;
      if (occupancyFilter === "VACANT" && p.occupied) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${p.name} ${p.address ?? ""} ${p.tenant?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [properties, query, typeFilter, occupancyFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-faint pointer-events-none" />
          <Input
            placeholder="Search by name, address, or tenant…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
            <SelectItem value="SHOP">Shop</SelectItem>
          </SelectContent>
        </Select>
        <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All occupancy</SelectItem>
            <SelectItem value="OCCUPIED">Occupied</SelectItem>
            <SelectItem value="VACANT">Vacant</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border border-border rounded-[var(--radius-control)] p-1 bg-surface shrink-0">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            aria-label="Grid view"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            aria-label="List view"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No properties match your filters"
            description="Try adjusting your search or filters, or add a new property."
          />
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} isAdmin={isAdmin} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          {filtered.map((p) => (
            <PropertyRow key={p.id} property={p} isAdmin={isAdmin} />
          ))}
        </Card>
      )}
    </div>
  );
}
