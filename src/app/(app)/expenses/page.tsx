import { SectionHeader } from "@/components/ledger/section-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UtilitiesPanel } from "@/components/ledger/panels/utilities-panel";
import { ConstructionPanel } from "@/components/ledger/panels/construction-panel";
import { MiscPanel } from "@/components/ledger/panels/misc-panel";
import { ReturnsPanel } from "@/components/ledger/panels/returns-panel";

export const dynamic = "force-dynamic";

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Expenses"
        description="Utilities, construction, returns, and miscellaneous spending."
      />

      <Tabs defaultValue="utilities">
        <TabsList>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="construction">Construction</TabsTrigger>
          <TabsTrigger value="misc">Miscellaneous</TabsTrigger>
          <TabsTrigger value="returns">Return Items</TabsTrigger>
        </TabsList>
        <TabsContent value="utilities">
          <UtilitiesPanel />
        </TabsContent>
        <TabsContent value="construction">
          <ConstructionPanel />
        </TabsContent>
        <TabsContent value="misc">
          <MiscPanel />
        </TabsContent>
        <TabsContent value="returns">
          <ReturnsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
