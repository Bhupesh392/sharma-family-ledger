import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/data";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { NotificationsMenu } from "./notifications-menu";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const [session, notifications] = await Promise.all([auth(), getNotifications()]);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border glass-surface px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <MobileNav role={user?.role} />
        <p className="font-display text-base font-semibold text-foreground lg:hidden">
          Sharma Estates
        </p>
        <SearchBar />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <ThemeToggle />
        <NotificationsMenu notifications={notifications} />
        {user && <ProfileMenu name={user.name ?? "Account"} role={user.role} />}
      </div>
    </header>
  );
}
