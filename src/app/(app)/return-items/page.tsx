import { Plus, Undo2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllReturnItems } from "@/lib/data";
import { addReturnItem } from "@/lib/actions/return-items";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { ReturnItemFormFields } from "@/components/ledger/return-item-form-fields";
import { ReturnItemRowActions } from "@/components/ledger/return-item-row-actions";

export default async function ReturnItemsPage() {
  const [session, rows] = await Promise.all([auth(), getAllReturnItems()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Return Items"
        description="Items or materials returned, and whether the refund has been submitted back to Nitin."
        action={
          <EntryFormDialog
            trigger={
              <Button variant="maroon">
                <Plus className="h-4 w-4" />
                Add return entry
              </Button>
            }
            title="Add return item"
            description="Record a returned item or material and its refund status."
            action={addReturnItem}
            successMessage="Entry added"
          >
            <ReturnItemFormFields />
          </EntryFormDialog>
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Undo2}
            title="No return entries yet"
            description="Add an entry whenever an item is returned and refunded."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-divider text-left">
                  <th className="px-5 py-3 font-medium text-ink-soft">Date</th>
                  <th className="px-5 py-3 font-medium text-ink-soft">Category</th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft">Status</th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    Who returned
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="ledger-divider hover:bg-paper/60">
                    <td className="px-5 py-3 text-ink-soft whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">{row.category}</td>
                    <td className="px-5 py-3 text-right font-mono-num font-semibold text-credit whitespace-nowrap">
                      {formatINR(row.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={row.status === "COMPLETED" ? "success" : "pending"}>
                        {row.status === "COMPLETED" ? "Completed" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
                      {row.whoReturned ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <ReturnItemRowActions row={row} isAdmin={isAdmin} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
