import { Plus, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllRent } from "@/lib/data";
import { addRent } from "@/lib/actions/e392";
import { formatINR, formatMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { RentFormFields } from "@/components/ledger/rent-form-fields";
import { RentRowActions } from "@/components/ledger/rent-row-actions";

const FLOOR_LABEL: Record<string, string> = {
  GROUND: "Ground Floor",
  FIRST: "First Floor",
  SECOND: "Second Floor",
};

export default async function E392RentPage() {
  const [session, rows] = await Promise.all([auth(), getAllRent()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="E-392 Rent"
        description="Monthly rent received from Ground, First, and Second floor tenants."
        action={
          <EntryFormDialog
            trigger={
              <Button variant="maroon">
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
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No rent entries yet"
            description="Add the first rent entry to start tracking E-392 income."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-divider text-left">
                  <th className="px-5 py-3 font-medium text-ink-soft">Month</th>
                  <th className="px-5 py-3 font-medium text-ink-soft">Floor</th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Rent
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    Paid to
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    Mode
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="ledger-divider hover:bg-paper/60">
                    <td className="px-5 py-3 font-medium text-ink whitespace-nowrap">
                      {formatMonth(row.month)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge>{FLOOR_LABEL[row.floor]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-mono-num font-semibold text-credit whitespace-nowrap">
                      {formatINR(row.rent)}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
                      {row.paidTo}
                    </td>
                    <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
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
        )}
      </Card>
    </div>
  );
}
