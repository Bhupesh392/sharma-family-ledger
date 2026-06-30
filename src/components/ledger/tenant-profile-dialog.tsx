"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  Home,
  IdCard,
  Briefcase,
  Users,
  AlertCircle,
  CalendarClock,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR, formatDate } from "@/lib/utils";
import { renewAgreementWithRent } from "@/lib/actions/tenancies";

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

type TenantProfile = {
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
  notes: string | null;
  property?: { id: number; name: string; monthlyRent?: string | null } | undefined;
  activeTenancy?: Tenancy | undefined;
  tenancyHistory: Tenancy[];
};

const ID_PROOF_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar",
  PAN: "PAN",
  PASSPORT: "Passport",
  VOTER_ID: "Voter ID",
  DRIVING_LICENSE: "Driving License",
  OTHER: "Other",
};

const AGREEMENT_BADGE: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  ACTIVE: { label: "Agreement active", variant: "success" },
  DUE_FOR_RENEWAL: { label: "Due for renewal", variant: "pending" },
  EXPIRED: { label: "Agreement expired", variant: "overdue" },
  RENEWED: { label: "Recently renewed", variant: "success" },
  NOT_SET: { label: "No agreement on file", variant: "default" },
};

export function TenantProfileDialog({
  tenant,
  trigger,
}: {
  tenant: TenantProfile;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const tenancy = tenant.activeTenancy;
  const agreementInfo = AGREEMENT_BADGE[tenancy?.agreementStatus ?? "NOT_SET"];

  async function handleRenew(formData: FormData) {
    if (!tenancy) return;
    setRenewing(true);
    try {
      await renewAgreementWithRent(tenancy.id, formData);
      toast.success("Agreement renewed and revised rent logged");
      setShowRenewForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not renew agreement");
    } finally {
      setRenewing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{tenant.name}</DialogTitle>
          <DialogDescription>
            {tenant.property ? `Currently at ${tenant.property.name}` : "No current property"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Contact */}
          <div className="flex flex-col gap-1.5 text-sm">
            {tenant.phone && (
              <span className="flex items-center gap-2 text-foreground-soft">
                <Phone className="h-3.5 w-3.5 shrink-0" /> {tenant.phone}
              </span>
            )}
            {tenant.email && (
              <span className="flex items-center gap-2 text-foreground-soft">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {tenant.email}
              </span>
            )}
            {tenant.property && (
              <span className="flex items-center gap-2 text-foreground-soft">
                <Home className="h-3.5 w-3.5 shrink-0" /> {tenant.property.name}
              </span>
            )}
          </div>

          {/* Personal details */}
          {(tenant.occupation || tenant.numberOfOccupants || tenant.idProofType) && (
            <div className="app-divider pt-4">
              <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-2.5">
                Personal details
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {tenant.occupation && (
                  <span className="flex items-center gap-2 text-foreground-soft">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" /> {tenant.occupation}
                  </span>
                )}
                {tenant.numberOfOccupants && (
                  <span className="flex items-center gap-2 text-foreground-soft">
                    <Users className="h-3.5 w-3.5 shrink-0" /> {tenant.numberOfOccupants}{" "}
                    occupant{tenant.numberOfOccupants === 1 ? "" : "s"}
                  </span>
                )}
                {tenant.idProofType && (
                  <span className="flex items-center gap-2 text-foreground-soft col-span-2">
                    <IdCard className="h-3.5 w-3.5 shrink-0" />
                    {ID_PROOF_LABELS[tenant.idProofType] ?? tenant.idProofType}
                    {tenant.idProofNumber ? ` — ${tenant.idProofNumber}` : ""}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Emergency contact */}
          {(tenant.emergencyContactName || tenant.emergencyContactPhone) && (
            <div className="app-divider pt-4">
              <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-2.5">
                Emergency contact
              </p>
              <p className="flex items-center gap-2 text-sm text-foreground-soft">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {tenant.emergencyContactName}
                {tenant.emergencyContactPhone ? ` — ${tenant.emergencyContactPhone}` : ""}
              </p>
            </div>
          )}

          {/* Rent agreement */}
          {tenancy && (
            <div className="app-divider pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium">
                  Rent agreement
                </p>
                <Badge variant={agreementInfo.variant}>{agreementInfo.label}</Badge>
              </div>
              {tenancy.agreementStartDate ? (
                <div className="flex flex-col gap-1.5 text-sm text-foreground-soft">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    Started {formatDate(tenancy.agreementStartDate)}
                    {tenancy.agreementDurationMonths
                      ? ` · ${tenancy.agreementDurationMonths} month term`
                      : ""}
                  </span>
                  {tenancy.agreementRenewalDate && (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                      Renewal due {formatDate(tenancy.agreementRenewalDate)}
                    </span>
                  )}
                  {(tenancy.agreementStatus === "DUE_FOR_RENEWAL" ||
                    tenancy.agreementStatus === "EXPIRED") && (
                    <div className="mt-2">
                      {!showRenewForm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRenewForm(true)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Mark as renewed
                        </Button>
                      ) : (
                        <form action={handleRenew} className="flex flex-col gap-2.5 app-card p-3">
                          <Label htmlFor="revisedRent" className="text-xs">
                            Revised monthly rent (₹)
                          </Label>
                          <Input
                            id="revisedRent"
                            name="revisedRent"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 12000"
                            defaultValue={tenant.property?.monthlyRent ?? ""}
                            required
                            autoFocus
                          />
                          <p className="text-xs text-foreground-faint">
                            Agreement restarts today for {tenancy.agreementDurationMonths}{" "}
                            months. This amount also gets logged as this month&apos;s rent in
                            Income.
                          </p>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={renewing}>
                              {renewing ? "Renewing…" : "Confirm renewal"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowRenewForm(false)}
                              disabled={renewing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-foreground-faint italic">
                  No agreement dates recorded yet — add them from &ldquo;Assign tenancy&rdquo;
                  on the Tenants page.
                </p>
              )}
            </div>
          )}

          {/* Deposit */}
          {tenancy?.securityDeposit && (
            <div className="app-divider pt-4">
              <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-2.5">
                Security deposit
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-soft">Held</span>
                <span className="font-mono-num font-medium text-foreground">
                  {formatINR(tenancy.securityDeposit)}
                </span>
              </div>
              {tenancy.depositReturned && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-foreground-soft">Returned</span>
                  <span className="font-mono-num font-medium text-foreground">
                    {formatINR(tenancy.depositReturned)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {tenant.notes && (
            <div className="app-divider pt-4">
              <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-2">
                Notes
              </p>
              <p className="text-sm text-foreground-soft whitespace-pre-wrap">{tenant.notes}</p>
            </div>
          )}

          {/* Tenancy history */}
          {tenant.tenancyHistory.length > 0 && (
            <div className="app-divider pt-4">
              <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-2.5">
                Tenancy history
              </p>
              <div className="flex flex-col gap-2">
                {tenant.tenancyHistory.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-soft">
                      {formatDate(t.startDate)} – {t.endDate ? formatDate(t.endDate) : "present"}
                    </span>
                    <Badge variant={t.status === "ACTIVE" ? "success" : "default"}>
                      {t.status === "ACTIVE" ? "Active" : "Ended"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
