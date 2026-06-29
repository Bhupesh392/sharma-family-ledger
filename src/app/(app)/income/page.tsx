import { SectionHeader } from "@/components/ledger/section-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { E392RentPanel } from "@/components/ledger/panels/e392-rent-panel";
import { ChitrakootRentPanel } from "@/components/ledger/panels/chitrakoot-rent-panel";

export const dynamic = "force-dynamic";

export default function IncomePage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Income"
        description="All rent collected across the family's properties."
      />

      <Tabs defaultValue="e392-rent">
        <TabsList>
          <TabsTrigger value="e392-rent">E-392 Rent</TabsTrigger>
          <TabsTrigger value="chitrakoot-rent">Chitrakoot Shop Rent</TabsTrigger>
        </TabsList>
        <TabsContent value="e392-rent">
          <E392RentPanel />
        </TabsContent>
        <TabsContent value="chitrakoot-rent">
          <ChitrakootRentPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
