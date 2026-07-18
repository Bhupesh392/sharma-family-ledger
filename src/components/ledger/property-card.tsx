"use client";

import { Building2, MapPin, User, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
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

export function PropertyCard({
  property,
  isAdmin,
}: {
  property: PropertyWithOccupancy;
  isAdmin: boolean;
}) {
  return (
    <Card className="app-card-hover overflow-hidden flex flex-col">
      <div className="h-36 w-full bg-surface-muted flex items-center justify-center relative">
        {property.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.imageUrl}
            alt={property.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Building2 className="h-10 w-10 text-foreground-faint" />
        )}
        <Badge
          variant={property.occupied ? "success" : "pending"}
          className="absolute top-3 right-3"
        >
          {property.occupied ? "Occupied" : "Vacant"}
        </Badge>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-display font-semibold text-foreground truncate">
              {property.name}
            </p>
            <Badge variant="primary" className="shrink-0">
              {property.type === "SHOP" ? "Shop" : "Residential"}
            </Badge>
          </div>
          {property.address && (
            <p className="text-xs text-foreground-soft flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{property.address}</span>
            </p>
          )}
        </div>

        {property.tenant ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-foreground-soft min-w-0">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{property.tenant.name}</span>
            </div>
            {property.activeTenancy?.agreementStatus === "DUE_FOR_RENEWAL" && (
              <Badge variant="pending" className="shrink-0">
                Renewal due
              </Badge>
            )}
            {property.activeTenancy?.agreementStatus === "EXPIRED" && (
              <Badge variant="overdue" className="shrink-0">
                Agreement expired
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-foreground-faint italic">No active tenant</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 app-divider">
          <div>
            <p className="text-xs text-foreground-faint">Monthly rent</p>
            <p className="font-mono-num font-semibold text-foreground">
              {property.monthlyRent ? formatINR(property.monthlyRent) : "—"}
            </p>
          </div>
          <div className="flex items-center gap-1">
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
      </div>
    </Card>
  );
}
