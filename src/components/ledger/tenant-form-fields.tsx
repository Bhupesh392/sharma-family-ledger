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

const ID_PROOF_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar",
  PAN: "PAN",
  PASSPORT: "Passport",
  VOTER_ID: "Voter ID",
  DRIVING_LICENSE: "Driving License",
  OTHER: "Other",
};

export function TenantFormFields({
  defaultValues,
}: {
  defaultValues?: {
    name?: string;
    phone?: string | null;
    email?: string | null;
    idProofType?: string | null;
    idProofNumber?: string | null;
    occupation?: string | null;
    numberOfOccupants?: number | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Occupation (optional)" htmlFor="occupation">
          <Input id="occupation" name="occupation" defaultValue={defaultValues?.occupation ?? ""} />
        </FormField>
        <FormField label="Number of occupants (optional)" htmlFor="numberOfOccupants">
          <Input
            id="numberOfOccupants"
            name="numberOfOccupants"
            type="number"
            min="1"
            step="1"
            defaultValue={defaultValues?.numberOfOccupants ?? ""}
          />
        </FormField>
      </div>

      <div className="app-divider pt-4">
        <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-3">
          ID proof (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="ID type" htmlFor="idProofType">
            <Select name="idProofType" defaultValue={defaultValues?.idProofType ?? undefined}>
              <SelectTrigger id="idProofType">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ID_PROOF_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="ID number" htmlFor="idProofNumber">
            <Input
              id="idProofNumber"
              name="idProofNumber"
              defaultValue={defaultValues?.idProofNumber ?? ""}
            />
          </FormField>
        </div>
      </div>

      <div className="app-divider pt-4">
        <p className="text-xs uppercase tracking-wide text-foreground-soft font-medium mb-3">
          Emergency contact (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name" htmlFor="emergencyContactName">
            <Input
              id="emergencyContactName"
              name="emergencyContactName"
              defaultValue={defaultValues?.emergencyContactName ?? ""}
            />
          </FormField>
          <FormField label="Phone" htmlFor="emergencyContactPhone">
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              defaultValue={defaultValues?.emergencyContactPhone ?? ""}
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
