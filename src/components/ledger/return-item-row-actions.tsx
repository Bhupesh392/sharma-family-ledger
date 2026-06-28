"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { ReturnItemFormFields } from "./return-item-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateReturnItem, deleteReturnItem } from "@/lib/actions/return-items";

export function ReturnItemRowActions({
  row,
  isAdmin,
}: {
  row: {
    id: number;
    category: string;
    amount: string;
    submittedToNitin: string;
    status: "PENDING" | "COMPLETED";
    whoReturned: string | null;
    mode: string | null;
    transactionId: string | null;
    date: string | null;
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
        title="Edit return item"
        description="Update the details for this returned item."
        action={(formData) => updateReturnItem(row.id, formData)}
        successMessage="Entry updated"
        submitLabel="Save changes"
      >
        <ReturnItemFormFields defaultValues={row} />
      </EntryFormDialog>
      {isAdmin && (
        <DeleteEntryButton
          onDelete={() => deleteReturnItem(row.id)}
          entryLabel={`The "${row.category}" return entry`}
        />
      )}
    </div>
  );
}
