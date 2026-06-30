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

const RENT_LEDGER_LABELS: Record<string, string> = {
  E392_GROUND: "E-392 Ground Floor rent",
  E392_FIRST: "E-392 First Floor rent",
  E392_SECOND: "E-392 Second Floor rent",
  CHITRAKOOT_SHOP: "Chitrakoot Shop rent",
  OTHER: "Not linked (just track rent here)",
};

export function PropertyFormFields({
  defaultValues,
}: {
  defaultValues?: {
    name?: string;
    type?: string;
    rentLedger?: string;
    address?: string | null;
    monthlyRent?: string | null;
    imageUrl?: string | null;
    notes?: string | null;
  };
}) {
  return (
    <>
      <FormField label="Property name" htmlFor="name">
        <Input
          id="name"
          name="name"
          placeholder="e.g. E-392 Ground Floor"
          defaultValue={defaultValues?.name}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Type" htmlFor="type">
          <Select name="type" defaultValue={defaultValues?.type ?? "RESIDENTIAL"} required>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RESIDENTIAL">Residential</SelectItem>
              <SelectItem value="SHOP">Shop</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Monthly rent (₹)" htmlFor="monthlyRent">
          <Input
            id="monthlyRent"
            name="monthlyRent"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.monthlyRent ?? ""}
          />
        </FormField>
      </div>

      <FormField label="Linked rent ledger" htmlFor="rentLedger">
        <Select name="rentLedger" defaultValue={defaultValues?.rentLedger ?? "OTHER"} required>
          <SelectTrigger id="rentLedger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RENT_LEDGER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <p className="text-xs text-foreground-faint -mt-2">
        Tells the app which Income ledger to log a new entry in when a tenancy is renewed
        with a revised rent.
      </p>

      <FormField label="Address (optional)" htmlFor="address">
        <Input id="address" name="address" defaultValue={defaultValues?.address ?? ""} />
      </FormField>

      <FormField label="Image URL (optional)" htmlFor="imageUrl">
        <Input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://…"
          defaultValue={defaultValues?.imageUrl ?? ""}
        />
      </FormField>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} rows={2} />
      </FormField>
    </>
  );
}
