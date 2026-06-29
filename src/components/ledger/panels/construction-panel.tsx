import { Plus, HardHat } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllConstruction } from "@/lib/data";
import { addConstruction } from "@/lib/actions/construction";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { ConstructionFormFields } from "@/components/ledger/construction-form-fields";
import { ConstructionRowActions } from "@/components/ledger/construction-row-actions";

export async function ConstructionPanel() {
  const [session, rows] = await Promise.all([auth(), getAllConstruction()]);
  const isAdmin = session?.user?.role === "ADMIN";
  const total = rows.reduce((acc, r) => acc + parseFloat(r.amount), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-soft">
          {rows.length} expenses logged &middot; {formatINR(total)} spent in total on JagdishPuri construction.
        </p>
        <EntryFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          }
          title="Add construction expense"
          description="Record a new construction-related expense."
          action={addConstruction}
          successMessage="Expense added"
        >
          <ConstructionFormFields />
        </EntryFormDialog>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={HardHat}
            title="No construction expenses yet"
            description="Add the first expense to start tracking the JagdishPuri construction costs."
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{row.whatFor}</p>
                    <p className="text-xs text-foreground-soft mt-1">
                      {formatDate(row.date)} &middot; Paid by {row.whoPaid}
                      {row.toWhom ? ` to ${row.toWhom}` : ""}
                    </p>
                  </div>
                  <ConstructionRowActions row={row} isAdmin={isAdmin} />
                </div>
                <p className="font-mono-num font-semibold text-expense text-lg mt-2">
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
                    <th className="px-5 py-3 font-medium text-foreground-soft">What for</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft text-right">
                      Amount
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden md:table-cell">
                      Who paid
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden lg:table-cell">
                      To whom
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
                      <td className="px-5 py-3 font-medium text-foreground">{row.whatFor}</td>
                      <td className="px-5 py-3 text-right font-mono-num font-semibold text-expense whitespace-nowrap">
                        {formatINR(row.amount)}
                      </td>
                      <td className="px-5 py-3 text-foreground-soft hidden md:table-cell">
                        {row.whoPaid}
                      </td>
                      <td className="px-5 py-3 text-foreground-soft hidden lg:table-cell">
                        {row.toWhom ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <ConstructionRowActions row={row} isAdmin={isAdmin} />
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
