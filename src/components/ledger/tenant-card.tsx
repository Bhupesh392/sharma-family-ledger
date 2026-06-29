"use client";

import { Pencil, Phone, Mail, Home, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import { EntryFormDialog } from "./entry-form-dialog";
import { TenantFormFields } from "./tenant-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateTenant, deleteTenant } from "@/lib/actions/tenants";

type Tenancy = {
  id: number;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "ENDED";
  securityDeposit: string | null;
  depositReturned: string | null;
};

type TenantWithProperty = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  property?: { id: number; name: string } | undefined;
  activeTenancy?: Tenancy | undefined;
  tenancyHistory: Tenancy[];
};

export function TenantCard({
  tenant,
  isAdmin,
}: {
  tenant: TenantWithProperty;
  isAdmin: boolean;
}) {
  const pastTenancies = tenant.tenancyHistory.filter((t) => t.status === "ENDED");

  return (
    <Card className="app-card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-semibold text-foreground truncate">{tenant.name}</p>
          {tenant.property ? (
            <p className="text-sm text-foreground-soft flex items-center gap-1.5 mt-1">
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tenant.property.name}</span>
            </p>
          ) : (
            <p className="text-sm text-foreground-faint italic mt-1">No current property</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <EntryFormDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit tenant">
                <Pencil className="h-4 w-4 text-foreground-soft" />
              </Button>
            }
            title="Edit tenant"
            description="Update this tenant's contact details."
            action={(formData) => updateTenant(tenant.id, formData)}
            successMessage="Tenant updated"
            submitLabel="Save changes"
          >
            <TenantFormFields defaultValues={tenant} />
          </EntryFormDialog>
          {isAdmin && (
            <DeleteEntryButton
              onDelete={() => deleteTenant(tenant.id)}
              entryLabel={`The tenant "${tenant.name}"`}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-foreground-soft">
        {tenant.phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" /> {tenant.phone}
          </span>
        )}
        {tenant.email && (
          <span className="flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {tenant.email}
          </span>
        )}
      </div>

      {tenant.activeTenancy && (
        <div className="app-divider pt-3 flex items-center justify-between text-sm">
          <span className="text-foreground-soft">Since {formatDate(tenant.activeTenancy.startDate)}</span>
          {tenant.activeTenancy.securityDeposit && (
            <span className="font-mono-num font-medium text-foreground">
              Deposit: {formatINR(tenant.activeTenancy.securityDeposit)}
            </span>
          )}
        </div>
      )}

      {pastTenancies.length > 0 && (
        <p className="text-xs text-foreground-faint flex items-center gap-1.5">
          <History className="h-3 w-3" /> {pastTenancies.length} past tenanc
          {pastTenancies.length === 1 ? "y" : "ies"}
        </p>
      )}

      <Badge variant={tenant.activeTenancy ? "success" : "default"} className="self-start">
        {tenant.activeTenancy ? "Current tenant" : "Former tenant"}
      </Badge>
    </Card>
  );
}
