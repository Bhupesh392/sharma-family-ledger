import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Building2,
  DoorOpen,
  ArrowRight,
  Activity,
  Eye,
} from "lucide-react";
import { getDashboardSummary, getRecentActivity, getPageViewStats } from "@/lib/data";
import { formatINR, formatMonth } from "@/lib/utils";
import { KpiCard } from "@/components/ledger/kpi-card";
import { IncomeExpenseTrendChart } from "@/components/ledger/income-expense-trend-chart";
import { ExpenseBreakdownChart } from "@/components/ledger/expense-breakdown-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActivityItem } from "@/components/ledger/activity-item";
import { PageViewTrendChart } from "@/components/ledger/page-view-trend-chart";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, session, recentActivity, pageViewStats] = await Promise.all([
    getDashboardSummary(),
    auth(),
    getRecentActivity(8),
    getPageViewStats(),
  ]);
  const isAdmin = session?.user?.role === "ADMIN";

  // Build sparkline series from the 6-month trend for each KPI.
  const incomeSpark = summary.monthlyTrend.map((m) => ({ value: m.income }));
  const expenseSpark = summary.monthlyTrend.map((m) => ({ value: m.expense }));
  const profitSpark = summary.monthlyTrend.map((m) => ({ value: m.profit }));

  // Simple month-over-month trend percentage (last vs. second-to-last).
  const trendPct = (series: { value: number }[]) => {
    if (series.length < 2) return undefined;
    const prev = series[series.length - 2].value;
    const curr = series[series.length - 1].value;
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-foreground-soft mt-1">
          A real-time overview of rental income, expenses, and occupancy.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Total rental income"
          value={formatINR(summary.totalIncome)}
          icon={<TrendingUp />}
          tone="income"
          trend={trendPct(incomeSpark)}
          comparisonLabel="vs last month"
          sparkline={incomeSpark}
        />
        <KpiCard
          label="Total expenses"
          value={formatINR(summary.totalExpense)}
          icon={<TrendingDown />}
          tone="expense"
          trend={trendPct(expenseSpark)}
          comparisonLabel="vs last month"
          sparkline={expenseSpark}
        />
        <KpiCard
          label="Net profit"
          value={formatINR(summary.netProfit)}
          icon={<Wallet />}
          tone={summary.netProfit >= 0 ? "income" : "expense"}
          trend={trendPct(profitSpark)}
          comparisonLabel="vs last month"
          sparkline={profitSpark}
        />
        <KpiCard
          label="Outstanding rent"
          value={formatINR(summary.outstandingRent)}
          icon={<Receipt />}
          tone={summary.outstandingRent > 0 ? "pending" : "default"}
        />
        <KpiCard
          label="Occupied properties"
          value={String(summary.occupiedCount)}
          icon={<Building2 />}
          tone="default"
        />
        <KpiCard
          label="Vacant properties"
          value={String(summary.vacantCount)}
          icon={<DoorOpen />}
          tone={summary.vacantCount > 0 ? "pending" : "default"}
        />
      </div>

      {/* Trend + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs expense trend</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseTrendChart data={summary.monthlyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={summary.expenseBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent rent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentRent.length === 0 ? (
            <p className="text-sm text-foreground-soft">No rent entries yet.</p>
          ) : (
            <div className="flex flex-col">
              {summary.recentRent.map((r, i) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between py-2.5 ${i !== 0 ? "app-divider" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo shrink-0">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.floor.charAt(0) + r.floor.slice(1).toLowerCase()} Floor &middot;{" "}
                        {formatMonth(r.month)}
                      </p>
                      <p className="text-xs text-foreground-soft">
                        Paid to {r.paidTo} via {r.mode}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-num text-sm font-semibold text-income">
                    {formatINR(r.rent)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/income"
            className="text-sm text-indigo flex items-center gap-1 mt-3 hover:underline"
          >
            View all income <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Activity feed + analytics — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo" />
                  Recent activity
                </CardTitle>
                <Link
                  href="/activity"
                  className="text-xs text-indigo hover:underline"
                >
                  Full history →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-foreground-soft">
                  No activity logged yet. Actions by family members will appear here.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {recentActivity.map((entry) => (
                    <ActivityItem key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portal analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo" />
                Portal views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-foreground-soft">Total views</p>
                  <p className="text-2xl font-display font-semibold text-foreground font-mono-num">
                    {pageViewStats.totalViews.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-soft">Unique sessions</p>
                  <p className="text-2xl font-display font-semibold text-foreground font-mono-num">
                    {pageViewStats.uniqueSessions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-soft">Active last 7d</p>
                  <p className="text-2xl font-display font-semibold text-foreground font-mono-num">
                    {pageViewStats.recentUsers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-soft">Top page</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {pageViewStats.pageBreakdown[0]?.page ?? "—"}
                  </p>
                </div>
              </div>
              <PageViewTrendChart data={pageViewStats.viewTrend} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
