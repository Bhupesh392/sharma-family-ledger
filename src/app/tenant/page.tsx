import { auth } from "@/lib/auth";
import { getTenantPortalData } from "@/lib/data";
import { addDocument } from "@/lib/actions/documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ledger/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantPortalPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="app-card p-8 text-center">
          <h1 className="text-xl font-semibold">Tenant access required</h1>
          <p className="mt-2 text-sm text-foreground-soft">
            You need to sign in with a tenant account to view this page.
          </p>
        </div>
      </div>
    );
  }

  const tenantId = Number(session.user.tenantId);
  const { tenant, property, activeTenancy, docs, pendingActions } = await getTenantPortalData(tenantId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold text-foreground">
          Welcome, {tenant.name}
        </h1>
        <p className="text-sm text-foreground-soft mt-1 max-w-2xl">
          Your property details, pending actions, and documents are arranged below so you can quickly see what needs attention.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Property assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-soft">{property ? "Yes" : "No"}</p>
            {property && (
              <p className="mt-2 text-lg font-semibold text-foreground">{property.name}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly rent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {property ? formatINR(property.monthlyRent ? parseFloat(property.monthlyRent) : 0) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agreement status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {activeTenancy?.agreementStatus ?? "Not available"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">{pendingActions.length}</p>
            <p className="text-sm text-foreground-soft">items awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My property</CardTitle>
          </CardHeader>
          <CardContent>
            {property ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border p-5 bg-card">
                  <p className="text-sm text-foreground-soft uppercase tracking-wide">Property</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{property.name}</p>
                  <p className="text-sm text-foreground-soft mt-1">{property.address}</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm text-foreground-soft">
                    <div className="rounded-2xl bg-muted p-4">
                      <div className="text-[11px] uppercase tracking-wide">Rent</div>
                      <div className="mt-2 font-medium text-foreground">{formatINR(property.monthlyRent ? parseFloat(property.monthlyRent) : 0)}</div>
                    </div>
                    <div className="rounded-2xl bg-muted p-4">
                      <div className="text-[11px] uppercase tracking-wide">Agreement status</div>
                      <div className="mt-2 font-medium text-foreground">{activeTenancy?.agreementStatus ?? "Not available"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-[11px] uppercase tracking-wide text-foreground-soft">Agreement starts</p>
                    <p className="mt-2 font-medium text-foreground">{activeTenancy?.agreementStartDate ?? "N/A"}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-[11px] uppercase tracking-wide text-foreground-soft">Occupants</p>
                    <p className="mt-2 font-medium text-foreground">{tenant.numberOfOccupants ?? "Not set"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground-soft">No active property assigned yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending actions</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActions.length === 0 ? (
              <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-foreground-soft">
                No pending actions right now. Your account is up to date.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div key={action.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold text-foreground">{action.title}</p>
                    <p className="text-sm text-foreground-soft mt-1">{action.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload a rent receipt</CardTitle>
          </CardHeader>
          <CardContent>
            {property ? (
              <div className="space-y-4">
                <p className="text-sm text-foreground-soft">
                  Submit your receipt for the current property assignment. The document will be attached to your tenant account.
                </p>
                <EntryFormDialog
                  trigger={<Button>Upload receipt</Button>}
                  title="Upload rent receipt"
                  description="Submit a receipt for your current property."
                  action={addDocument}
                  successMessage="Receipt uploaded"
                  submitLabel="Upload receipt"
                >
                  <input type="hidden" name="docType" value="RECEIPT" />
                  <input type="hidden" name="tenantId" value={String(tenant.id)} />
                  {property.id && (
                    <input type="hidden" name="propertyId" value={String(property.id)} />
                  )}
                  <FormField label="Receipt title" htmlFor="name">
                    <Input
                      id="name"
                      name="name"
                      placeholder="E.g. March rent receipt"
                      required
                    />
                  </FormField>
                  <FormField label="Google Drive link" htmlFor="url">
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      required
                    />
                  </FormField>
                  <FormField label="Notes (optional)" htmlFor="notes">
                    <Textarea id="notes" name="notes" rows={3} />
                  </FormField>
                </EntryFormDialog>
              </div>
            ) : (
              <p className="text-sm text-foreground-soft">
                You do not have an active property assignment yet. Contact the owner to register your tenancy before uploading a receipt.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-foreground-soft">
                No documents uploaded yet. Ask your manager to add receipts or agreements.
              </div>
            ) : (
              <div className="grid gap-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="rounded-2xl border border-border p-4">
                    <p className="font-medium text-foreground">{doc.name ?? "Untitled document"}</p>
                    {doc.notes && <p className="text-sm text-foreground-soft mt-1">{doc.notes}</p>}
                    <Button variant="link" className="mt-3 p-0" asChild>
                      <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer">
                        View document
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
