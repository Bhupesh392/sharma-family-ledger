"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { EmptyState } from "./empty-state";
import { DocumentCard } from "./document-card";
import { FileText } from "lucide-react";

type Doc = {
  id: number;
  name: string;
  docType: "AGREEMENT" | "ID_DOCUMENT" | "RECEIPT" | "OTHER";
  propertyId: number | null;
  tenantId: number | null;
  notes: string | null;
  createdAt: Date;
};

type Option = { id: number; name: string };

export function DocumentsBrowser({
  docs,
  properties,
  tenants,
  isAdmin,
}: {
  docs: Doc[];
  properties: Option[];
  tenants: Option[];
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [propertyFilter, setPropertyFilter] = useState("ALL");
  const [tenantFilter, setTenantFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (typeFilter !== "ALL" && d.docType !== typeFilter) return false;
      if (propertyFilter !== "ALL" && String(d.propertyId) !== propertyFilter) return false;
      if (tenantFilter !== "ALL" && String(d.tenantId) !== tenantFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!d.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [docs, query, typeFilter, propertyFilter, tenantFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-faint pointer-events-none" />
          <Input
            placeholder="Search by document name…"
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
            <SelectItem value="AGREEMENT">Agreement</SelectItem>
            <SelectItem value="ID_DOCUMENT">ID Document</SelectItem>
            <SelectItem value="RECEIPT">Receipt</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All properties</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All tenants</SelectItem>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-foreground-soft">
        {filtered.length} {filtered.length === 1 ? "document" : "documents"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No documents match your filters"
            description="Try adjusting your search or filters, or add a new document."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isAdmin={isAdmin}
              properties={properties}
              tenants={tenants}
            />
          ))}
        </div>
      )}
    </div>
  );
}
