import { FileText } from "lucide-react";
import { SectionHeader } from "@/components/ledger/section-header";
import { ComingSoon } from "@/components/ledger/coming-soon";

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Documents"
        description="Rent agreements, receipts, and other property documents."
      />
      <ComingSoon
        icon={FileText}
        title="Document storage is coming soon"
        description="Soon you'll be able to upload and keep rent agreements, receipts, and other property paperwork here, organized by property."
      />
    </div>
  );
}
