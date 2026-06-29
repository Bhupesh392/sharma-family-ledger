import { Plus, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllRent } from "@/lib/data";
import { addRent } from "@/lib/actions/e392";
import { formatINR, formatMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { RentFormFields } from "@/components/ledger/rent-form-fields";
import { RentRowActions } from "@/components/ledger/rent-row-actions";

const FLOOR_LABEL: Record<string, string> = {
  GROUND: "Ground Floor",
  FIRST: "First Floor",
  SECOND: "Second Floor",
};

export async function E392RentPanel() {
  const [session, rows] = await Promise.all([auth(), getAllRent()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-soft">
          Monthly rent received from Ground, First, and Second floor tenants.
        </p>
        <EntryFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Add rent entry
            </Button>
          }
          title="Add rent entry"
          description="Record a rent payment for one of the E-392 floors."
          action={addRent}
          successMessage="Rent entry added"
        >
          <RentFormFields />
        </EntryFormDialog>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No rent entries yet"
            description="Add the first rent entry to start tracking E-392 income."
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
                      <p className="font-medium text-foreground">{formatMonth(row.month)}</p>
                      <Badge>{FLOOR_LABEL[row.floor]}</Badge>
                    </div>
                    <p className="text-xs text-foreground-soft mt-1">
                      Paid to {row.paidTo} &middot; {row.mode}
                    </p>
                  </div>
                  <RentRowActions row={row} isAdmin={isAdmin} />
                </div>
                <p className="font-mono-num font-semibold text-income text-lg mt-2">
                  {formatINR(row.rent)}
                </p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="app-divider text-left">
                    <th className="px-5 py-3 font-medium text-foreground-soft">Month</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft">Floor</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft text-right">
                      Rent
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden md:table-cell">
                      Paid to
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden md:table-cell">
                      Mode
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="app-divider hover:bg-surface-muted/60">
                      <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">
                        {formatMonth(row.month)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge>{FLOOR_LABEL[row.floor]}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-mono-num font-semibold text-income whitespace-nowrap">
                        {formatINR(row.rent)}
                      </td>
                      <td className="px-5 py-3 text-foreground-soft hidden md:table-cell">
                        {row.paidTo}
                      </td>
                      <td className="px-5 py-3 text-foreground-soft hidden md:table-cell">
                        {row.mode}
                      </td>
                      <td className="px-5 py-3">
                        <RentRowActions row={row} isAdmin={isAdmin} />
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
