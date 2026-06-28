"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { MiscFormFields } from "./misc-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateMisc, deleteMisc } from "@/lib/actions/misc";

export function MiscRowActions({
  row,
  isAdmin,
}: {
  row: {
    id: number;
    date: string;
    toWhom: string;
    byWho: string;
    amount: string;
    remarks: string | null;
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
        title="Edit miscellaneous expense"
        description="Update the details for this expense."
        action={(formData) => updateMisc(row.id, formData)}
        successMessage="Entry updated"
        submitLabel="Save changes"
      >
        <MiscFormFields defaultValues={row} />
      </EntryFormDialog>
      {isAdmin && (
        <DeleteEntryButton
          onDelete={() => deleteMisc(row.id)}
          entryLabel={`The expense to ${row.toWhom}`}
        />
      )}
    </div>
  );
}
