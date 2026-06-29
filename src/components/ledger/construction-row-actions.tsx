"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { ConstructionFormFields } from "./construction-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateConstruction, deleteConstruction } from "@/lib/actions/construction";

export function ConstructionRowActions({
  row,
  isAdmin,
}: {
  row: {
    id: number;
    whatFor: string;
    amount: string;
    whoPaid: string;
    toWhom: string | null;
    transactionId: string | null;
    mode: string | null;
    date: string | null;
  };
  isAdmin: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1 shrink-0">
      <EntryFormDialog
        trigger={
          <Button variant="ghost" size="icon" aria-label="Edit entry">
            <Pencil className="h-4 w-4 text-foreground-soft" />
          </Button>
        }
        title="Edit construction expense"
        description="Update the details for this construction expense."
        action={(formData) => updateConstruction(row.id, formData)}
        successMessage="Entry updated"
        submitLabel="Save changes"
      >
        <ConstructionFormFields defaultValues={row} />
      </EntryFormDialog>
      {isAdmin && (
        <DeleteEntryButton
          onDelete={() => deleteConstruction(row.id)}
          entryLabel={`The "${row.whatFor}" expense`}
        />
      )}
    </div>
  );
}
