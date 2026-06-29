import { Plus, Store } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllChitrakootRent } from "@/lib/data";
import { addChitrakootRent } from "@/lib/actions/chitrakoot";
import { formatINR, formatMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { ChitrakootFormFields } from "@/components/ledger/chitrakoot-form-fields";
import { ChitrakootRowActions } from "@/components/ledger/chitrakoot-row-actions";

export async function ChitrakootRentPanel() {
  const [session, rows] = await Promise.all([auth(), getAllChitrakootRent()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-soft">
          Rent collected from the Chitrakoot shop, and how much has been submitted to Nitin.
        </p>
        <EntryFormDialog
          trigger={
            <Button>
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
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Store}
            title="No rent entries yet"
            description="Add the first entry to start tracking Chitrakoot shop rent."
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map((row) => {
              const rent = parseFloat(row.amount);
              const submitted = row.submittedAmount ? parseFloat(row.submittedAmount) : 0;
              const fullySubmitted = row.submittedAmount && submitted >= rent;
              return (
                <Card key={row.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{formatMonth(row.month)}</p>
                        {row.submittedAmount ? (
                          <Badge variant={fullySubmitted ? "success" : "pending"}>
                            {fullySubmitted ? "Submitted" : "Partial"}
                          </Badge>
                        ) : (
                          <Badge variant="pending">Not submitted</Badge>
                        )}
                      </div>
                      <p className="text-xs text-foreground-soft mt-1">Mode: {row.mode}</p>
                    </div>
                    <ChitrakootRowActions row={row} isAdmin={isAdmin} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xs text-foreground-soft">Rent</p>
                      <p className="font-mono-num font-semibold text-income">
                        {formatINR(row.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground-soft">Submitted</p>
                      <p className="font-mono-num text-foreground-soft">
                        {row.submittedAmount ? formatINR(row.submittedAmount) : "—"}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="app-divider text-left">
                    <th className="px-5 py-3 font-medium text-foreground-soft">Month</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft text-right">
                      Rent
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft text-right">
                      Submitted
                    </th>
                    <th className="px-5 py-3 font-medium text-foreground-soft">Status</th>
                    <th className="px-5 py-3 font-medium text-foreground-soft hidden md:table-cell">
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
                      <tr key={row.id} className="app-divider hover:bg-surface-muted/60">
                        <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">
                          {formatMonth(row.month)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono-num font-semibold text-income whitespace-nowrap">
                          {formatINR(row.amount)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono-num text-foreground-soft whitespace-nowrap">
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
                        <td className="px-5 py-3 text-foreground-soft hidden md:table-cell">
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
          </Card>
        </>
      )}
    </div>
  );
}
