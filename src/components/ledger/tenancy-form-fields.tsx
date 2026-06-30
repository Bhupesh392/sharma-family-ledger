"use client";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option = { id: number; name: string };

export function TenancyFormFields({
  properties,
  tenants,
  defaultValues,
}: {
  properties: Option[];
  tenants: Option[];
  defaultValues?: {
    propertyId?: number;
    tenantId?: number;
    startDate?: string;
    endDate?: string | null;
    status?: string;
    securityDeposit?: string | null;
    depositReturned?: string | null;
    agreementStartDate?: string | null;
    agreementDurationMonths?: number | null;
    notes?: string | null;
  };
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Property" htmlFor="propertyId">
          <Select
            name="propertyId"
            defaultValue={defaultValues?.propertyId ? String(defaultValues.propertyId) : undefined}
            required
          >
            <SelectTrigger id="propertyId">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Tenant" htmlFor="tenantId">
          <Select
            name="tenantId"
            defaultValue={defaultValues?.tenantId ? String(defaultValues.tenantId) : undefined}
            required
          >
            <SelectTrigger id="tenantId">
              <SelectValue placeholder="Select a tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={defaultValues?.startDate}
            required
          />
        </FormField>
        <FormField label="End date (optional)" htmlFor="endDate">
          <Input id="endDate" name="endDate" type="date" defaultValue={defaultValues?.endDate ?? ""} />
        </FormField>
      </div>

      <FormField label="Status" htmlFor="status">
        <Select name="status" defaultValue={defaultValues?.status ?? "ACTIVE"} required>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ENDED">Ended</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="app-divider pt-4">
        <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-3">
          Security deposit (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Deposit amount (₹)" htmlFor="securityDeposit">
            <Input
              id="securityDeposit"
              name="securityDeposit"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.securityDeposit ?? ""}
            />
          </FormField>
          <FormField label="Amount returned (₹)" htmlFor="depositReturned">
            <Input
              id="depositReturned"
              name="depositReturned"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.depositReturned ?? ""}
            />
          </FormField>
        </div>
      </div>

      <div className="app-divider pt-4">
        <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-3">
          Rent agreement (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Agreement start date" htmlFor="agreementStartDate">
            <Input
              id="agreementStartDate"
              name="agreementStartDate"
              type="date"
              defaultValue={defaultValues?.agreementStartDate ?? ""}
            />
          </FormField>
          <FormField label="Duration (months)" htmlFor="agreementDurationMonths">
            <Input
              id="agreementDurationMonths"
              name="agreementDurationMonths"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 11"
              defaultValue={defaultValues?.agreementDurationMonths ?? ""}
            />
          </FormField>
        </div>
        <p className="text-xs text-foreground-faint mt-2">
          The renewal date and status (active / due for renewal / expired) are calculated
          automatically from these two fields.
        </p>
      </div>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} rows={2} />
      </FormField>
    </>
  );
}
