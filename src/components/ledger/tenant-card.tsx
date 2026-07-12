"use client";

import { Pencil, Phone, Mail, Home, History, UserCircle, FileSignature, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import { EntryFormDialog } from "./entry-form-dialog";
import { TenantFormFields } from "./tenant-form-fields";
import { TenancyFormFields } from "./tenancy-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { TenantProfileDialog } from "./tenant-profile-dialog";
import { updateTenant, deleteTenant } from "@/lib/actions/tenants";
import { updateTenancy } from "@/lib/actions/tenancies";

type Tenancy = {
  id: number;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "ENDED";
  securityDeposit: string | null;
  depositReturned: string | null;
  agreementStartDate?: string | null;
  agreementDurationMonths?: number | null;
  agreementRenewalDate?: string | null;
  agreementStatus?: "ACTIVE" | "DUE_FOR_RENEWAL" | "EXPIRED" | "RENEWED" | "NOT_SET";
};

type TenantWithProperty = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  idProofType?: string | null;
  idProofNumber?: string | null;
  occupation?: string | null;
  numberOfOccupants?: number | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  policeVerified?: boolean;
  policeVerificationDate?: string | null;
  notes: string | null;
  property?: { id: number; name: string; monthlyRent?: string | null } | undefined;
  activeTenancy?: Tenancy | undefined;
  tenancyHistory: Tenancy[];
};

type Option = { id: number; name: string };

export function TenantCard({
  tenant,
  isAdmin,
  properties,
  tenants,
}: {
  tenant: TenantWithProperty;
  isAdmin: boolean;
  properties: Option[];
  tenants: Option[];
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
        <div className="app-divider pt-3 flex items-center justify-between text-sm gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-foreground-soft">
              Since {formatDate(tenant.activeTenancy.startDate)}
            </span>
            {tenant.activeTenancy.securityDeposit && (
              <span className="font-mono-num font-medium text-foreground">
                Deposit: {formatINR(tenant.activeTenancy.securityDeposit)}
              </span>
            )}
          </div>
          <EntryFormDialog
            trigger={
              <Button variant="ghost" size="sm" className="shrink-0">
                <FileSignature className="h-3.5 w-3.5" />
                Edit agreement
              </Button>
            }
            title="Edit tenancy"
            description="Update this tenancy's dates, deposit, and rent agreement details."
            action={(formData) => updateTenancy(tenant.activeTenancy!.id, formData)}
            successMessage="Tenancy updated"
            submitLabel="Save changes"
          >
            <TenancyFormFields
              properties={properties}
              tenants={tenants}
              defaultValues={{
                propertyId: tenant.property?.id,
                tenantId: tenant.id,
                startDate: tenant.activeTenancy.startDate,
                endDate: tenant.activeTenancy.endDate,
                status: tenant.activeTenancy.status,
                securityDeposit: tenant.activeTenancy.securityDeposit,
                depositReturned: tenant.activeTenancy.depositReturned,
                agreementStartDate: tenant.activeTenancy.agreementStartDate,
                agreementDurationMonths: tenant.activeTenancy.agreementDurationMonths,
              }}
            />
          </EntryFormDialog>
        </div>
      )}

      {pastTenancies.length > 0 && (
        <p className="text-xs text-foreground-faint flex items-center gap-1.5">
          <History className="h-3 w-3" /> {pastTenancies.length} past tenanc
          {pastTenancies.length === 1 ? "y" : "ies"}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={tenant.activeTenancy ? "success" : "default"}>
            {tenant.activeTenancy ? "Current tenant" : "Former tenant"}
          </Badge>
          {typeof tenant.policeVerified !== "undefined" && (
            tenant.policeVerified ? (
              <Badge variant="success">
                <ShieldCheck className="h-3 w-3 mr-1 inline-block" /> Police verified
              </Badge>
            ) : (
              <Badge variant="overdue">
                <ShieldCheck className="h-3 w-3 mr-1 inline-block" /> Not police verified
              </Badge>
            )
          )}
          {tenant.activeTenancy?.agreementStatus === "DUE_FOR_RENEWAL" && (
            <Badge variant="pending">Renewal due</Badge>
          )}
          {tenant.activeTenancy?.agreementStatus === "EXPIRED" && (
            <Badge variant="overdue">Agreement expired</Badge>
          )}
        </div>
        <TenantProfileDialog
          tenant={tenant}
          trigger={
            <Button variant="ghost" size="sm">
              <UserCircle className="h-3.5 w-3.5" />
              View profile
            </Button>
          }
        />
      </div>
    </Card>
  );
}
