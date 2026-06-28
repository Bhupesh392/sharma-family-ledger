import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "./mobile-nav";
import { SignOutButton } from "./sign-out-button";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex items-center justify-between gap-3 border-b border-rule-strong bg-paper-raised/80 backdrop-blur-sm px-4 py-3 lg:px-8">
      <div className="flex items-center gap-2">
        <MobileNav />
        <p className="font-display text-lg font-semibold text-ink lg:hidden">
          Sharma Ledger
        </p>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-soft hidden sm:inline">
              {user.name}
            </span>
            <Badge variant={user.role === "ADMIN" ? "admin" : "default"}>
              {user.role === "ADMIN" ? "Admin" : "Member"}
            </Badge>
          </div>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}
