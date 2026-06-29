import { Plus, Undo2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllReturnItems } from "@/lib/data";
import { addReturnItem } from "@/lib/actions/return-items";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { ReturnItemFormFields } from "@/components/ledger/return-item-form-fields";
import { ReturnItemRowActions } from "@/components/ledger/return-item-row-actions";

export async function ReturnsPanel() {
  const [session, rows] = await Promise.all([auth(), getAllReturnItems()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-soft">
          Items or materials returned, and whether the refund has been submitted back to Nitin.
        </p>
        <EntryFormDialog
          trigger={
            <Button>
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
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Undo2}
            title="No return entries yet"
            description="Add an entry whenever an item is returned and refunded."
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{row.category}</p>
                      <Badge variant={row.status === "COMPLETED" ? "success" : "pending"}>
                        {row.status === "COMPLETED" ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-soft mt-1">
                      {formatDate(row.date)}
                      {row.whoReturned ? ` \u00b7 Returned by ${row.whoReturned}` : ""}
                    </p>
                  </div>
                  <ReturnItemRowActions row={row} isAdmin={isAdmin} />
                </div>
                <p className="font-mono-num font-semibold text-income text-lg mt-2">
                  {formatINR(row.amount)}
                </p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="app-divider text-left">
                    <th className="px-5 py-3 font-medium text-foreground-soft">Date</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft">Category</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft text-right">
                      Amount
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft">Status</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden md:table-cell">
                      Who returned
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="app-divider hover:bg-surface-muted/60">
                      <td className="px-5 py-3 text-foreground-soft whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">{row.category}</td>
                      <td className="px-5 py-3 text-right font-mono-num font-semibold text-income whitespace-nowrap">
                        {formatINR(row.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={row.status === "COMPLETED" ? "success" : "pending"}>
                          {row.status === "COMPLETED" ? "Completed" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-foreground-soft hidden md:table-cell">
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
          </Card>
        </>
      )}
    </div>
  );
}
