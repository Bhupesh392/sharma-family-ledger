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

const DOC_TYPE_LABELS: Record<string, string> = {
  AGREEMENT: "Rent Agreement",
  ID_DOCUMENT: "ID Document",
  RECEIPT: "Receipt",
  OTHER: "Other",
};

type Option = { id: number; name: string };

export function DocumentFormFields({
  properties,
  tenants,
  defaultValues,
}: {
  properties: Option[];
  tenants: Option[];
  defaultValues?: {
    name?: string;
    docType?: string;
    propertyId?: number | null;
    tenantId?: number | null;
    notes?: string | null;
  };
}) {
  return (
    <>
      <FormField label="Document name" htmlFor="name">
        <Input
          id="name"
          name="name"
          placeholder="e.g. E-392 Ground Floor Agreement Mar 2025"
          defaultValue={defaultValues?.name}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Document type" htmlFor="docType">
          <Select name="docType" defaultValue={defaultValues?.docType ?? "OTHER"} required>
            <SelectTrigger id="docType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Property (optional)" htmlFor="propertyId">
          <Select
            name="propertyId"
            defaultValue={defaultValues?.propertyId ? String(defaultValues.propertyId) : "none"}
          >
            <SelectTrigger id="propertyId">
              <SelectValue placeholder="No property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No property</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Tenant (optional)" htmlFor="tenantId">
        <Select
          name="tenantId"
          defaultValue={defaultValues?.tenantId ? String(defaultValues.tenantId) : "none"}
        >
          <SelectTrigger id="tenantId">
            <SelectValue placeholder="No tenant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No tenant</SelectItem>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Google Drive link" htmlFor="url">
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://drive.google.com/file/d/..."
          required
        />
      </FormField>
      <p className="text-xs text-foreground-faint -mt-2">
        Paste the shareable link from Google Drive. It will be stored encrypted.
      </p>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={defaultValues?.notes ?? ""}
        />
      </FormField>
    </>
  );
}
