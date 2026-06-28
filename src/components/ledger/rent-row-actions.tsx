"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { RentFormFields } from "./rent-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateRent, deleteRent } from "@/lib/actions/e392";
import { formatMonth } from "@/lib/utils";

export function RentRowActions({
  row,
  isAdmin,
}: {
  row: {
    id: number;
    month: string;
    floor: "GROUND" | "FIRST" | "SECOND";
    rent: string;
    paidTo: string;
    mode: string;
    notes: string | null;
  };
  isAdmin: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1 shrink-0">
      <EntryFormDialog
        trigger={
          <Button variant="ghost" size="icon" aria-label="Edit entry">
            <Pencil className="h-4 w-4 text-ink-soft" />
          </Button>
        }
        title="Edit rent entry"
        description="Update the details for this rent payment."
        action={(formData) => updateRent(row.id, formData)}
        successMessage="Rent entry updated"
        submitLabel="Save changes"
      >
        <RentFormFields
          defaultValues={{
            month: row.month,
            floor: row.floor,
            rent: row.rent,
            paidTo: row.paidTo,
            mode: row.mode,
            notes: row.notes ?? undefined,
          }}
        />
      </EntryFormDialog>
      {isAdmin && (
        <DeleteEntryButton
          onDelete={() => deleteRent(row.id)}
          entryLabel={`The ${row.floor.toLowerCase()} floor rent entry for ${formatMonth(row.month)}`}
        />
      )}
    </div>
  );
}
