import { Plus, HardHat } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllConstruction } from "@/lib/data";
import { addConstruction } from "@/lib/actions/construction";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { ConstructionFormFields } from "@/components/ledger/construction-form-fields";
import { ConstructionRowActions } from "@/components/ledger/construction-row-actions";

export default async function ConstructionPage() {
  const [session, rows] = await Promise.all([auth(), getAllConstruction()]);
  const isAdmin = session?.user?.role === "ADMIN";
  const total = rows.reduce((acc, r) => acc + parseFloat(r.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="JagdishPuri Construction"
        description={`${rows.length} expenses logged · ${formatINR(total)} spent in total`}
        action={
          <EntryFormDialog
            trigger={
              <Button variant="maroon">
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
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={HardHat}
            title="No construction expenses yet"
            description="Add the first expense to start tracking the JagdishPuri construction costs."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-divider text-left">
                  <th className="px-5 py-3 font-medium text-ink-soft">Date</th>
                  <th className="px-5 py-3 font-medium text-ink-soft">What for</th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    Who paid
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden lg:table-cell">
                    To whom
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
                    <td className="px-5 py-3 font-medium text-ink">{row.whatFor}</td>
                    <td className="px-5 py-3 text-right font-mono-num font-semibold text-debit whitespace-nowrap">
                      {formatINR(row.amount)}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
                      {row.whoPaid}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden lg:table-cell">
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
        )}
      </Card>
    </div>
  );
}
