"use client";

import { Building2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { EntryFormDialog } from "./entry-form-dialog";
import { PropertyFormFields } from "./property-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateProperty, deleteProperty } from "@/lib/actions/properties";

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

export function PropertyRow({
  property,
  isAdmin,
}: {
  property: PropertyWithOccupancy;
  isAdmin: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 app-divider first:border-t-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted shrink-0 overflow-hidden">
        {property.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={property.imageUrl} alt={property.name} className="h-full w-full object-cover" />
        ) : (
          <Building2 className="h-4.5 w-4.5 text-foreground-faint" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">{property.name}</p>
          <Badge variant="indigo">{property.type === "SHOP" ? "Shop" : "Residential"}</Badge>
        </div>
        <p className="text-xs text-foreground-soft truncate">
          {property.tenant ? property.tenant.name : "No active tenant"}
        </p>
      </div>
      <Badge variant={property.occupied ? "success" : "pending"} className="hidden sm:flex">
        {property.occupied ? "Occupied" : "Vacant"}
      </Badge>
      {property.activeTenancy?.agreementStatus === "DUE_FOR_RENEWAL" && (
        <Badge variant="pending" className="hidden lg:flex">
          Renewal due
        </Badge>
      )}
      {property.activeTenancy?.agreementStatus === "EXPIRED" && (
        <Badge variant="overdue" className="hidden lg:flex">
          Agreement expired
        </Badge>
      )}
      <p className="font-mono-num text-sm font-semibold text-foreground w-24 text-right shrink-0 hidden md:block">
        {property.monthlyRent ? formatINR(property.monthlyRent) : "—"}
      </p>
      <div className="flex items-center gap-1 shrink-0">
        <EntryFormDialog
          trigger={
            <Button variant="ghost" size="icon" aria-label="Edit property">
              <Pencil className="h-4 w-4 text-foreground-soft" />
            </Button>
          }
          title="Edit property"
          description="Update this property's details."
          action={(formData) => updateProperty(property.id, formData)}
          successMessage="Property updated"
          submitLabel="Save changes"
        >
          <PropertyFormFields defaultValues={property} />
        </EntryFormDialog>
        {isAdmin && (
          <DeleteEntryButton
            onDelete={() => deleteProperty(property.id)}
            entryLabel={`The property "${property.name}"`}
          />
        )}
      </div>
    </div>
  );
}
