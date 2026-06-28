import { Plus, Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllUtilities } from "@/lib/data";
import { addUtility } from "@/lib/actions/e392";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { UtilityFormFields } from "@/components/ledger/utility-form-fields";
import { UtilityRowActions } from "@/components/ledger/utility-row-actions";

const FLOOR_LABEL: Record<string, string> = {
  GROUND: "Ground",
  FIRST: "First",
  SECOND: "Second",
};

export default async function E392UtilitiesPage() {
  const [session, rows] = await Promise.all([auth(), getAllUtilities()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="E-392 Utilities"
        description="Water, electricity, and other utility bills paid for the E-392 building."
        action={
          <EntryFormDialog
            trigger={
              <Button variant="maroon">
                <Plus className="h-4 w-4" />
                Add utility bill
              </Button>
            }
            title="Add utility bill"
            description="Record a water, electricity, or other utility payment."
            action={addUtility}
            successMessage="Utility entry added"
          >
            <UtilityFormFields />
          </EntryFormDialog>
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No utility bills yet"
            description="Add the first utility bill to start tracking E-392 expenses."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-divider text-left">
                  <th className="px-5 py-3 font-medium text-ink-soft">Date</th>
                  <th className="px-5 py-3 font-medium text-ink-soft">Utility</th>
                  <th className="px-5 py-3 font-medium text-ink-soft">Floor</th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    Paid to
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="ledger-divider hover:bg-paper/60">
                    <td className="px-5 py-3 font-medium text-ink whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3 text-ink">{row.utility}</td>
                    <td className="px-5 py-3">
                      <Badge>{FLOOR_LABEL[row.floor]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-mono-num font-semibold text-debit whitespace-nowrap">
                      {formatINR(row.amount)}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
                      {row.paidTo}
                    </td>
                    <td className="px-5 py-3">
                      <UtilityRowActions row={row} isAdmin={isAdmin} />
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
