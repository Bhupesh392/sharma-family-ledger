import { auth } from "@/lib/auth";
import { getTenantPortalData } from "@/lib/data";
import { SectionHeader } from "@/components/ledger/section-header";
import { PaymentUploadForm } from "@/components/tenant/payment-upload-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubmitPaymentPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/tenant");
  }

  const tenantId = Number(session.user.tenantId);
  const { property } = await getTenantPortalData(tenantId);

  // Tenant can only submit payment for their assigned property
  const tenantProperties = property 
    ? [property] 
    : [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Submit Rent Payment"
        description="Upload a payment screenshot or paste your payment confirmation message to log your rent payment."
      />

      {!property ? (
        <div className="app-card p-8 text-center">
          <p className="text-lg font-semibold text-foreground">No property assigned</p>
          <p className="mt-2 text-sm text-foreground-soft">
            You don&#39;t have an active property assignment. Please contact the owner to assign a property before submitting payments.
          </p>
        </div>
      ) : (
        <PaymentUploadForm 
          properties={tenantProperties} 
          defaultTenantId={tenantId}
        />
      )}
    </div>
  );
}
