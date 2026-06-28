import { Plus, Store } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllChitrakootRent } from "@/lib/data";
import { addChitrakootRent } from "@/lib/actions/chitrakoot";
import { formatINR, formatMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { ChitrakootFormFields } from "@/components/ledger/chitrakoot-form-fields";
import { ChitrakootRowActions } from "@/components/ledger/chitrakoot-row-actions";

export default async function ChitrakootRentPage() {
  const [session, rows] = await Promise.all([auth(), getAllChitrakootRent()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Chitrakoot Shop Rent"
        description="Rent collected from the Chitrakoot shop, and how much of it has been submitted to Nitin."
        action={
          <EntryFormDialog
            trigger={
              <Button variant="maroon">
                <Plus className="h-4 w-4" />
                Add rent entry
              </Button>
            }
            title="Add Chitrakoot rent entry"
            description="Record a month's shop rent, and optionally how much has been submitted."
            action={addChitrakootRent}
            successMessage="Rent entry added"
          >
            <ChitrakootFormFields />
          </EntryFormDialog>
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No rent entries yet"
            description="Add the first entry to start tracking Chitrakoot shop rent."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-divider text-left">
                  <th className="px-5 py-3 font-medium text-ink-soft">Month</th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Rent
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft text-right">
                    Submitted
                  </th>
                  <th className="px-5 py-3 font-medium text-ink-soft">Status</th>
                  <th className="px-5 py-3 font-medium text-ink-soft hidden md:table-cell">
                    Mode
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const rent = parseFloat(row.amount);
                  const submitted = row.submittedAmount
                    ? parseFloat(row.submittedAmount)
                    : 0;
                  const fullySubmitted = row.submittedAmount && submitted >= rent;
                  return (
                    <tr key={row.id} className="ledger-divider hover:bg-paper/60">
                      <td className="px-5 py-3 font-medium text-ink whitespace-nowrap">
                        {formatMonth(row.month)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono-num font-semibold text-credit whitespace-nowrap">
                        {formatINR(row.amount)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono-num text-ink-soft whitespace-nowrap">
                        {row.submittedAmount ? formatINR(row.submittedAmount) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {row.submittedAmount ? (
                          <Badge variant={fullySubmitted ? "success" : "pending"}>
                            {fullySubmitted ? "Submitted" : "Partial"}
                          </Badge>
                        ) : (
                          <Badge variant="pending">Not submitted</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink-soft hidden md:table-cell">
                        {row.mode}
                      </td>
                      <td className="px-5 py-3">
                        <ChitrakootRowActions row={row} isAdmin={isAdmin} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
