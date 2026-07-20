import { auth } from "@/lib/auth";
import { getPendingPayments } from "@/lib/actions/payments";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ledger/section-header";
import { PaymentReviewList } from "@/components/admin/payment-review-list";

export const dynamic = "force-dynamic";

export default async function PaymentReviewPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const result = await getPendingPayments();
  const payments = result.success ? (result.payments || []) : [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Payment Review"
        description="Review and approve tenant rent payment submissions"
      />
      <PaymentReviewList payments={payments} />
    </div>
  );
}