"use client";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ReturnItemFormFields({
  defaultValues,
}: {
  defaultValues?: {
    category?: string;
    amount?: string;
    submittedToNitin?: string;
    status?: string;
    whoReturned?: string | null;
    mode?: string | null;
    transactionId?: string | null;
    date?: string | null;
  };
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category" htmlFor="category">
          <Input
            id="category"
            name="category"
            placeholder="e.g. Excess cement"
            defaultValue={defaultValues?.category}
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

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Submitted to Nitin?" htmlFor="submittedToNitin">
          <Select
            name="submittedToNitin"
            defaultValue={defaultValues?.submittedToNitin ?? "Yes"}
            required
          >
            <SelectTrigger id="submittedToNitin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Status" htmlFor="status">
          <Select name="status" defaultValue={defaultValues?.status ?? "PENDING"} required>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Who returned it?" htmlFor="whoReturned">
          <Input
            id="whoReturned"
            name="whoReturned"
            defaultValue={defaultValues?.whoReturned ?? ""}
          />
        </FormField>
        <FormField label="Date" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={defaultValues?.date ?? ""} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Payment mode" htmlFor="mode">
          <Input id="mode" name="mode" defaultValue={defaultValues?.mode ?? ""} />
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
