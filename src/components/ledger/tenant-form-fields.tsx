"use client";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TenantFormFields({
  defaultValues,
}: {
  defaultValues?: {
    name?: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  };
}) {
  return (
    <>
      <FormField label="Full name" htmlFor="name">
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Phone (optional)" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </FormField>
        <FormField label="Email (optional)" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </FormField>
      </div>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} rows={2} />
      </FormField>
    </>
  );
}
