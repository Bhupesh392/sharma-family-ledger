"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { ChitrakootFormFields } from "./chitrakoot-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateChitrakootRent, deleteChitrakootRent } from "@/lib/actions/chitrakoot";
import { formatMonth } from "@/lib/utils";

export function ChitrakootRowActions({
  row,
  isAdmin,
}: {
  row: {
    id: number;
    month: string;
    amount: string;
    paidTo: string;
    mode: string;
    submittedAmount: string | null;
    submittedDate: string | null;
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
        title="Edit Chitrakoot rent entry"
        description="Update the details for this shop rent payment."
        action={(formData) => updateChitrakootRent(row.id, formData)}
        successMessage="Entry updated"
        submitLabel="Save changes"
      >
        <ChitrakootFormFields
          defaultValues={{
            month: row.month,
            amount: row.amount,
            paidTo: row.paidTo,
            mode: row.mode,
            submittedAmount: row.submittedAmount,
            submittedDate: row.submittedDate,
            notes: row.notes,
          }}
        />
      </EntryFormDialog>
      {isAdmin && (
        <DeleteEntryButton
          onDelete={() => deleteChitrakootRent(row.id)}
          entryLabel={`The Chitrakoot shop rent entry for ${formatMonth(row.month)}`}
        />
      )}
    </div>
  );
}
