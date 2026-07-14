import { Plus, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDocumentsForUser, getAllProperties, getAllTenants } from "@/lib/data";
import { addDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { DocumentFormFields } from "@/components/ledger/document-form-fields";
import { DocumentsBrowser } from "@/components/ledger/documents-browser";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await auth();
  const [docs, properties, tenants] = await Promise.all([
    getDocumentsForUser(
      session?.user?.role ?? "MEMBER",
      session?.user?.tenantId ? Number(session.user.tenantId) : undefined
    ),
    getAllProperties(),
    getAllTenants(),
  ]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Documents"
        description="Rent agreements, ID documents, receipts, and other property paperwork — stored as encrypted links to Google Drive."
        action={
          isAdmin ? (
            <EntryFormDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  Add document
                </Button>
              }
              title="Add document"
              description="Paste a shareable Google Drive link. It will be stored encrypted."
              action={addDocument}
              successMessage="Document added"
            >
              <DocumentFormFields properties={properties} tenants={tenants} />
            </EntryFormDialog>
          ) : null
        }
      />

      {!isAdmin && (
        <Card>
          <EmptyState
            icon={FileText}
            title="Tenant upload via portal"
            description="Tenant users can upload rent receipts from the tenant portal page. Admins can add agreements, ID documents, receipts, and other paperwork from here."
          />
        </Card>
      )}

      {docs.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Add documents by pasting their Google Drive shareable links. They'll be stored encrypted and organized by property and tenant."
          />
        </Card>
      ) : (
        <DocumentsBrowser
          docs={docs}
          properties={properties}
          tenants={tenants}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
