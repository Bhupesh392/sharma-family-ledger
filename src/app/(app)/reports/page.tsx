import {
  getYearlyTrend,
  getPropertyProfitability,
  getTenantPaymentBehavior,
  getDashboardSummary,
} from "@/lib/data";
import { formatINR } from "@/lib/utils";
import { SectionHeader } from "@/components/ledger/section-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IncomeExpenseTrendChart } from "@/components/ledger/income-expense-trend-chart";
import { ExpenseBreakdownChart } from "@/components/ledger/expense-breakdown-chart";
import { PropertyProfitabilityChart } from "@/components/ledger/property-profitability-chart";
import { TenantPaymentBehaviorChart } from "@/components/ledger/tenant-payment-behavior-chart";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [yearlyTrend, profitability, paymentBehavior, summary] = await Promise.all([
    getYearlyTrend(),
    getPropertyProfitability(),
    getTenantPaymentBehavior(),
    getDashboardSummary(),
  ]);

  const yearTotal = yearlyTrend.reduce(
    (acc, m) => ({ income: acc.income + m.income, expense: acc.expense + m.expense }),
    { income: 0, expense: 0 }
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Reports"
        description="Revenue, expenses, and profitability across the last 12 months."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-medium text-foreground-soft">Income (12 months)</p>
          <p className="font-display text-xl font-semibold text-income mt-1.5 font-mono-num">
            {formatINR(yearTotal.income)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-foreground-soft">Expense (12 months)</p>
          <p className="font-display text-xl font-semibold text-expense mt-1.5 font-mono-num">
            {formatINR(yearTotal.expense)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-foreground-soft">Net profit (12 months)</p>
          <p className="font-display text-xl font-semibold text-foreground mt-1.5 font-mono-num">
            {formatINR(yearTotal.income - yearTotal.expense)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue &amp; expense trend (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeExpenseTrendChart data={yearlyTrend} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Property profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyProfitabilityChart data={profitability} />
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

      <Card>
        <CardHeader>
          <CardTitle>Chitrakoot tenant payment behaviour</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-soft mb-3">
            Days the rent was submitted to Nitin relative to the month it covers. Negative
            bars mean it was submitted early.
          </p>
          <TenantPaymentBehaviorChart data={paymentBehavior} />
        </CardContent>
      </Card>
    </div>
  );
}
