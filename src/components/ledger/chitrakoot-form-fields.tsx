"use client";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ChitrakootFormFields({
  defaultValues,
}: {
  defaultValues?: {
    month?: string;
    amount?: string;
    paidTo?: string;
    mode?: string;
    submittedAmount?: string | null;
    submittedDate?: string | null;
    notes?: string | null;
  };
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Month" htmlFor="month">
          <Input
            id="month"
            name="month"
            type="month"
            defaultValue={defaultValues?.month?.slice(0, 7)}
            required
          />
        </FormField>
        <FormField label="Rent amount (₹)" htmlFor="amount">
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
        <FormField label="Paid to" htmlFor="paidTo">
          <Input
            id="paidTo"
            name="paidTo"
            defaultValue={defaultValues?.paidTo ?? "Chetan Sharma"}
            required
          />
        </FormField>
        <FormField label="Payment mode" htmlFor="mode">
          <Input
            id="mode"
            name="mode"
            placeholder="UPI / Cash"
            defaultValue={defaultValues?.mode ?? "UPI"}
            required
          />
        </FormField>
      </div>

      <div className="ledger-divider pt-4">
        <p className="text-xs uppercase tracking-wide text-ink-soft font-medium mb-3">
          Submitted to Nitin (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Amount submitted (₹)" htmlFor="submittedAmount">
            <Input
              id="submittedAmount"
              name="submittedAmount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.submittedAmount ?? ""}
            />
          </FormField>
          <FormField label="Date submitted" htmlFor="submittedDate">
            <Input
              id="submittedDate"
              name="submittedDate"
              type="date"
              defaultValue={defaultValues?.submittedDate ?? ""}
            />
          </FormField>
        </div>
      </div>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} rows={2} />
      </FormField>
    </>
  );
}
