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

export function UtilityFormFields({
  defaultValues,
}: {
  defaultValues?: {
    date?: string;
    utility?: string;
    floor?: string;
    paidTo?: string;
    amount?: string;
    mode?: string;
    notes?: string;
  };
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" htmlFor="date">
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultValues?.date}
            required
          />
        </FormField>
        <FormField label="Floor" htmlFor="floor">
          <Select name="floor" defaultValue={defaultValues?.floor ?? "GROUND"} required>
            <SelectTrigger id="floor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GROUND">Ground Floor</SelectItem>
              <SelectItem value="FIRST">First Floor</SelectItem>
              <SelectItem value="SECOND">Second Floor</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Utility" htmlFor="utility">
        <Input
          id="utility"
          name="utility"
          placeholder="Water Bill / Electricity Bill"
          defaultValue={defaultValues?.utility}
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
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
        <FormField label="Paid to" htmlFor="paidTo">
          <Input
            id="paidTo"
            name="paidTo"
            placeholder="PHED / JVVNL"
            defaultValue={defaultValues?.paidTo}
            required
          />
        </FormField>
      </div>

      <FormField label="Payment mode" htmlFor="mode">
        <Input
          id="mode"
          name="mode"
          placeholder="Online / Cash / UPI"
          defaultValue={defaultValues?.mode}
        />
      </FormField>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes} rows={2} />
      </FormField>
    </>
  );
}
