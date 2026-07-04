import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllActivity } from "@/lib/data";
import { SectionHeader } from "@/components/ledger/section-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ledger/empty-state";
import { ActivityFull } from "@/components/ledger/activity-full";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const entries = await getAllActivity({ limit: 100 });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Activity history"
        description="Every add, edit, and delete across all sections — who did it, when, and what changed."
      />

      {entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="As family members add and edit entries, their actions will appear here."
          />
        </Card>
      ) : (
        <ActivityFull entries={entries} />
      )}
    </div>
  );
}
