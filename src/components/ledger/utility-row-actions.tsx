"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { UtilityFormFields } from "./utility-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateUtility, deleteUtility } from "@/lib/actions/e392";

export function UtilityRowActions({
  row,
  isAdmin,
}: {
  row: {
    id: number;
    date: string;
    utility: string;
    floor: "GROUND" | "FIRST" | "SECOND";
    paidTo: string;
    amount: string;
    mode: string | null;
    notes: string | null;
  };
  isAdmin: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <EntryFormDialog
        trigger={
          <Button variant="ghost" size="icon" aria-label="Edit entry">
            <Pencil className="h-4 w-4 text-ink-soft" />
          </Button>
        }
        title="Edit utility bill"
        description="Update the details for this utility payment."
        action={(formData) => updateUtility(row.id, formData)}
        successMessage="Utility entry updated"
        submitLabel="Save changes"
      >
        <UtilityFormFields
          defaultValues={{
            date: row.date,
            utility: row.utility,
            floor: row.floor,
            paidTo: row.paidTo,
            amount: row.amount,
            mode: row.mode ?? undefined,
            notes: row.notes ?? undefined,
          }}
        />
      </EntryFormDialog>
      {isAdmin && (
        <DeleteEntryButton
          onDelete={() => deleteUtility(row.id)}
          entryLabel={`The ${row.utility} entry`}
        />
      )}
    </div>
  );
}
