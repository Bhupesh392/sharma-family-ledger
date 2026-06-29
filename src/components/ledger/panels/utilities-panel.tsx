import { Plus, Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllUtilities } from "@/lib/data";
import { addUtility } from "@/lib/actions/e392";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { UtilityFormFields } from "@/components/ledger/utility-form-fields";
import { UtilityRowActions } from "@/components/ledger/utility-row-actions";

const FLOOR_LABEL: Record<string, string> = {
  GROUND: "Ground",
  FIRST: "First",
  SECOND: "Second",
};

export async function UtilitiesPanel() {
  const [session, rows] = await Promise.all([auth(), getAllUtilities()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-soft">
          Water, electricity, and other utility bills paid for the E-392 building.
        </p>
        <EntryFormDialog
          trigger={
            <Button>
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
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Zap}
            title="No utility bills yet"
            description="Add the first utility bill to start tracking E-392 expenses."
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
                      <p className="font-medium text-foreground">{row.utility}</p>
                      <Badge>{FLOOR_LABEL[row.floor]}</Badge>
                    </div>
                    <p className="text-xs text-foreground-soft mt-1">
                      {formatDate(row.date)} &middot; Paid to {row.paidTo}
                    </p>
                  </div>
                  <UtilityRowActions row={row} isAdmin={isAdmin} />
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
                    <th className="px-5 py-3 font-medium text-foreground-soft">Utility</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft">Floor</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft text-right">
                      Amount
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden md:table-cell">
                      Paid to
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="app-divider hover:bg-surface-muted/60">
                      <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-5 py-3 text-foreground">{row.utility}</td>
                      <td className="px-5 py-3">
                        <Badge>{FLOOR_LABEL[row.floor]}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-mono-num font-semibold text-expense whitespace-nowrap">
                        {formatINR(row.amount)}
                      </td>
                      <td className="px-5 py-3 text-foreground-soft hidden md:table-cell">
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
          </Card>
        </>
      )}
    </div>
  );
}
