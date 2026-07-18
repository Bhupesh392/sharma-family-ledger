"use client";

import { useState } from "react";
import { FileText, FileSignature, IdCard, Receipt, ExternalLink, Pencil, Building2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntryFormDialog } from "./entry-form-dialog";
import { DocumentFormFields } from "./document-form-fields";
import { DeleteEntryButton } from "./delete-entry-button";
import { updateDocument, deleteDocument } from "@/lib/actions/documents";
import { formatDate } from "@/lib/utils";

type Doc = {
  id: number;
  name: string;
  docType: "AGREEMENT" | "ID_DOCUMENT" | "RECEIPT" | "OTHER";
  propertyId: number | null;
  tenantId: number | null;
  notes: string | null;
  createdAt: Date;
};

type Option = { id: number; name: string };

const DOC_TYPE_CONFIG = {
  AGREEMENT: { label: "Agreement", icon: FileSignature, variant: "indigo" as const },
  ID_DOCUMENT: { label: "ID Document", icon: IdCard, variant: "pending" as const },
  RECEIPT: { label: "Receipt", icon: Receipt, variant: "success" as const },
  OTHER: { label: "Other", icon: FileText, variant: "default" as const },
};

export function DocumentCard({
  doc,
  isAdmin,
  properties,
  tenants,
}: {
  doc: Doc;
  isAdmin: boolean;
  properties: Option[];
  tenants: Option[];
}) {
  const [opening, setOpening] = useState(false);
  const config = DOC_TYPE_CONFIG[doc.docType];
  const Icon = config.icon;

  const propertyName = doc.propertyId
    ? properties.find((p) => p.id === doc.propertyId)?.name
    : null;
  const tenantName = doc.tenantId
    ? tenants.find((t) => t.id === doc.tenantId)?.name
    : null;

  async function handleOpen() {
    setOpening(true);
    try {
      // The API route decrypts server-side and redirects to the Drive URL.
      window.open(`/api/documents/${doc.id}`, "_blank");
    } finally {
      setOpening(false);
    }
  }

  return (
    <Card className="app-card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo shrink-0 mt-0.5">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm leading-snug truncate">
              {doc.name}
            </p>
            <p className="text-xs text-foreground-faint mt-0.5">
              {formatDate(doc.createdAt.toISOString().slice(0, 10))}
            </p>
          </div>
        </div>
        <Badge variant={config.variant} className="shrink-0">{config.label}</Badge>
      </div>

      {(propertyName || tenantName) && (
        <div className="flex flex-wrap gap-2 text-xs text-foreground-soft">
          {propertyName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {propertyName}
            </span>
          )}
          {tenantName && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {tenantName}
            </span>
          )}
        </div>
      )}

      {doc.notes && (
        <p className="text-xs text-foreground-soft italic truncate">{doc.notes}</p>
      )}

      <div className="flex items-center gap-2 pt-1 app-divider">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={handleOpen}
          disabled={opening}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {opening ? "Opening…" : "Open in Drive"}
        </Button>
        {isAdmin && (
          <EntryFormDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit document">
                <Pencil className="h-4 w-4 text-foreground-soft" />
              </Button>
            }
            title="Edit document"
            description="Update this document's details or link."
            action={(formData) => updateDocument(doc.id, formData)}
            successMessage="Document updated"
            submitLabel="Save changes"
          >
            <DocumentFormFields
              properties={properties}
              tenants={tenants}
              defaultValues={{
                name: doc.name,
                docType: doc.docType,
                propertyId: doc.propertyId,
                tenantId: doc.tenantId,
                notes: doc.notes,
              }}
            />
          </EntryFormDialog>
        )}
        {isAdmin && (
          <DeleteEntryButton
            onDelete={() => deleteDocument(doc.id)}
            entryLabel={`"${doc.name}"`}
          />
        )}
      </div>
    </Card>
  );
}
