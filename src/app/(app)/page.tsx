import Link from "next/link";
import { getDashboardSummary } from "@/lib/data";
import { formatINR, formatMonth } from "@/lib/utils";
import { StatCard } from "@/components/ledger/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Zap,
  Store,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold text-ink">
          Overview
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          A running snapshot of every rent and expense entry across the family
          properties.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total rent collected"
          value={formatINR(summary.totalIncome)}
          icon={TrendingUp}
          tone="credit"
          sub="E-392 + Chitrakoot Shop"
        />
        <StatCard
          label="Total expenses"
          value={formatINR(summary.totalExpense)}
          icon={TrendingDown}
          tone="debit"
          sub="Utilities + construction + misc"
        />
        <StatCard
          label="E-392 utility bills"
          value={formatINR(summary.e392UtilitiesTotal)}
          icon={Zap}
          tone="gold"
          sub={`${summary.counts.utilities} bills recorded`}
        />
        <StatCard
          label="Chitrakoot shop rent"
          value={formatINR(summary.chitrakootRentTotal)}
          icon={Store}
          sub={
            summary.pendingChitrakootDifference > 0
              ? `${formatINR(summary.pendingChitrakootDifference)} not yet submitted`
              : "Fully submitted"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>E-392 rent by floor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(["GROUND", "FIRST", "SECOND"] as const).map((floor) => (
              <div key={floor} className="flex items-center justify-between">
                <span className="text-sm text-ink-soft">
                  {floor.charAt(0) + floor.slice(1).toLowerCase()} Floor
                </span>
                <span className="font-mono-num text-sm font-medium text-ink">
                  {formatINR(summary.floorTotals[floor])}
                </span>
              </div>
            ))}
            <Link
              href="/e392-rent"
              className="text-sm text-maroon flex items-center gap-1 mt-1 hover:underline"
            >
              View all rent entries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Construction (JagdishPuri)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Total spent</span>
              <span className="font-mono-num text-sm font-medium text-debit">
                {formatINR(summary.constructionTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Entries logged</span>
              <span className="font-mono-num text-sm font-medium text-ink">
                {summary.counts.construction}
              </span>
            </div>
            <Link
              href="/construction"
              className="text-sm text-maroon flex items-center gap-1 mt-1 hover:underline"
            >
              View construction log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Returns &amp; misc.</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Items returned</span>
              <span className="font-mono-num text-sm font-medium text-ink">
                {formatINR(summary.returnsTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Miscellaneous spend</span>
              <span className="font-mono-num text-sm font-medium text-debit">
                {formatINR(summary.miscTotal)}
              </span>
            </div>
            <Link
              href="/miscellaneous"
              className="text-sm text-maroon flex items-center gap-1 mt-1 hover:underline"
            >
              View miscellaneous <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent rent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentRent.length === 0 ? (
            <p className="text-sm text-ink-soft">No rent entries yet.</p>
          ) : (
            <div className="flex flex-col">
              {summary.recentRent.map((r, i) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between py-2.5 ${i !== 0 ? "ledger-divider" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-4 w-4 text-ink-soft" />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {r.floor.charAt(0) + r.floor.slice(1).toLowerCase()} Floor &middot;{" "}
                        {formatMonth(r.month)}
                      </p>
                      <p className="text-xs text-ink-soft">
                        Paid to {r.paidTo} via {r.mode}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-num text-sm font-semibold text-credit">
                    {formatINR(r.rent)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
