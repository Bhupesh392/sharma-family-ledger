"use client";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function MiscFormFields({
  defaultValues,
}: {
  defaultValues?: {
    date?: string;
    toWhom?: string;
    byWho?: string;
    amount?: string;
    remarks?: string | null;
  };
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Date" htmlFor="date">
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultValues?.date}
            required
          />
        </FormField>
        <FormField label="Amount (₹)" htmlFor="amount">
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.amount}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="To whom" htmlFor="toWhom">
          <Input id="toWhom" name="toWhom" defaultValue={defaultValues?.toWhom} required />
        </FormField>
        <FormField label="By who" htmlFor="byWho">
          <Input id="byWho" name="byWho" defaultValue={defaultValues?.byWho} required />
        </FormField>
      </div>

      <FormField label="Remarks (optional)" htmlFor="remarks">
        <Textarea
          id="remarks"
          name="remarks"
          defaultValue={defaultValues?.remarks ?? ""}
          rows={2}
        />
      </FormField>
    </>
  );
}
