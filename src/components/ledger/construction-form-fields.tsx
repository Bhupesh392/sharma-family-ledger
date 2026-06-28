"use client";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";

export function ConstructionFormFields({
  defaultValues,
}: {
  defaultValues?: {
    whatFor?: string;
    amount?: string;
    whoPaid?: string;
    toWhom?: string | null;
    transactionId?: string | null;
    mode?: string | null;
    date?: string | null;
  };
}) {
  return (
    <>
      <FormField label="What for?" htmlFor="whatFor">
        <Input
          id="whatFor"
          name="whatFor"
          placeholder="Cement, labour, bricks…"
          defaultValue={defaultValues?.whatFor}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <FormField label="Date" htmlFor="date">
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultValues?.date ?? ""}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Who paid?" htmlFor="whoPaid">
          <Input
            id="whoPaid"
            name="whoPaid"
            defaultValue={defaultValues?.whoPaid ?? "Nitin Sharma"}
            required
          />
        </FormField>
        <FormField label="Paid to whom?" htmlFor="toWhom">
          <Input id="toWhom" name="toWhom" defaultValue={defaultValues?.toWhom ?? ""} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Payment mode" htmlFor="mode">
          <Input
            id="mode"
            name="mode"
            placeholder="Online / Cash / UPI"
            defaultValue={defaultValues?.mode ?? ""}
          />
        </FormField>
        <FormField label="Transaction ID" htmlFor="transactionId">
          <Input
            id="transactionId"
            name="transactionId"
            defaultValue={defaultValues?.transactionId ?? ""}
          />
        </FormField>
      </div>
    </>
  );
}
