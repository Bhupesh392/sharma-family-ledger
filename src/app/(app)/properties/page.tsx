import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPropertiesWithOccupancy } from "@/lib/data";
import { addProperty } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ledger/section-header";
import { EntryFormDialog } from "@/components/ledger/entry-form-dialog";
import { PropertyFormFields } from "@/components/ledger/property-form-fields";
import { PropertiesBrowser } from "@/components/ledger/properties-browser";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const [session, properties] = await Promise.all([auth(), getPropertiesWithOccupancy()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Properties"
        description="All rental properties, their occupancy, and current tenants."
        action={
          <EntryFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Add property
              </Button>
            }
            title="Add property"
            description="Add a new rental property to track."
            action={addProperty}
            successMessage="Property added"
          >
            <PropertyFormFields />
          </EntryFormDialog>
        }
      />

      <PropertiesBrowser properties={properties} isAdmin={isAdmin} />
    </div>
  );
}
