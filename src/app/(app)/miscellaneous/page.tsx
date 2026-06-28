import { Plus, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllMisc } from "@/lib/data";
import { addMisc } from "@/lib/actions/misc";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { MiscFormFields } from "@/components/ledger/misc-form-fields";
import { MiscRowActions } from "@/components/ledger/misc-row-actions";

export default async function MiscellaneousPage() {
  const [session, rows] = await Promise.all([auth(), getAllMisc()]);
  const isAdmin = session?.user?.role === "ADMIN";
  const total = rows.reduce((acc, r) => acc + parseFloat(r.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Miscellaneous"
        description={`${rows.length} expenses logged · ${formatINR(total)} spent in total`}
        action={
          <EntryFormDialog
            trigger={
              <Button variant="maroon">
                <Plus className="h-4 w-4" />
                Add expense
              </Button>
            }
            title="Add miscellaneous expense"
            description="Record any expense that doesn't fit the other categories."
            action={addMisc}
            successMessage="Expense added"
          >
            <MiscFormFields />
          </EntryFormDialog>
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No miscellaneous expenses yet"
            description="Add an entry for any one-off expense that doesn't belong elsewhere."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-divider text-left">
                  <th className="px-5 py-3 font-medium text-ink-soft">Date</th>
                  <th className="px-5 py-3 font-medium text-ink-soft">To whom</th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    By who
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden lg:table-cell">
                    Remarks
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
                    <td className="px-5 py-3 font-medium text-ink">{row.toWhom}</td>
                    <td className="px-5 py-3 text-right font-mono-num font-semibold text-debit whitespace-nowrap">
                      {formatINR(row.amount)}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
                      {row.byWho}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden lg:table-cell max-w-xs truncate">
                      {row.remarks ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <MiscRowActions row={row} isAdmin={isAdmin} />
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
