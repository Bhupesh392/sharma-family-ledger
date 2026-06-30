import { Plus, Users, Link2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTenantsWithCurrentProperty, getAllProperties } from "@/lib/data";
import { addTenant } from "@/lib/actions/tenants";
import { addTenancy } from "@/lib/actions/tenancies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ledger/section-header";
import { EmptyState } from "@/components/ledger/empty-state";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { TenantFormFields } from "@/components/ledger/tenant-form-fields";
import { TenancyFormFields } from "@/components/ledger/tenancy-form-fields";
import { TenantCard } from "@/components/ledger/tenant-card";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const [session, tenants, properties] = await Promise.all([
    auth(),
    getTenantsWithCurrentProperty(),
    getAllProperties(),
  ]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Tenants"
        description="Everyone who has rented a family property, past and present."
        action={
          <div className="flex flex-wrap gap-2">
            <EntryFormDialog
              trigger={
                <Button variant="outline">
                  <Link2 className="h-4 w-4" />
                  Assign tenancy
                </Button>
              }
              title="Assign a tenancy"
              description="Link a tenant to a property for a date range, with an optional deposit."
              action={addTenancy}
              successMessage="Tenancy added"
            >
              <TenancyFormFields properties={properties} tenants={tenants} />
            </EntryFormDialog>
            <EntryFormDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  Add tenant
                </Button>
              }
              title="Add tenant"
              description="Add a new tenant's contact details."
              action={addTenant}
              successMessage="Tenant added"
            >
              <TenantFormFields />
            </EntryFormDialog>
          </div>
        }
      />

      {tenants.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No tenants yet"
            description="Add a tenant, then assign them to a property to track occupancy and deposits."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <TenantCard key={t.id} tenant={t} isAdmin={isAdmin} properties={properties} tenants={tenants} />
          ))}
        </div>
      )}
    </div>
  );
}
