import { AuthSessionProvider } from "@/components/ledger/session-provider";
import { Sidebar } from "@/components/ledger/sidebar";
import { Header } from "@/components/ledger/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen w-full">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-rule-strong bg-paper py-4 shrink-0">
          <Sidebar />
        </aside>
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthSessionProvider>
  );
}
