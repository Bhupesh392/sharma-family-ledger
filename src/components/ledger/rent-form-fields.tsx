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

export function RentFormFields({
  defaultValues,
}: {
  defaultValues?: {
    month?: string;
    floor?: string;
    rent?: string;
    paidTo?: string;
    mode?: string;
    notes?: string;
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

      <FormField label="Rent amount (₹)" htmlFor="rent">
        <Input
          id="rent"
          name="rent"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValues?.rent}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Paid to" htmlFor="paidTo">
          <Input
            id="paidTo"
            name="paidTo"
            defaultValue={defaultValues?.paidTo ?? "Nitin Sharma"}
            required
          />
        </FormField>
        <FormField label="Payment mode" htmlFor="mode">
          <Input
            id="mode"
            name="mode"
            placeholder="Online / Cash / UPI"
            defaultValue={defaultValues?.mode ?? "Online"}
            required
          />
        </FormField>
      </div>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes} rows={2} />
      </FormField>
    </>
  );
}
