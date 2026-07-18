"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, TrendingUp, TrendingDown,
  BarChart3, FileText, Settings, Landmark, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV_ITEMS: SidebarItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/activity", label: "Activity", icon: Activity, adminOnly: true },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const TENANT_NAV_ITEMS: SidebarItem[] = [
  { href: "/tenant", label: "My property", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  className,
  onNavigate,
  role,
}: {
  className?: string;
  onNavigate?: () => void;
  role?: "ADMIN" | "MEMBER" | "TENANT";
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 h-full", className)}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pb-6 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20 shrink-0">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-foreground">
            Sharma Estates
          </p>
          <p className="text-[11px] text-foreground-faint tracking-wide uppercase">Family ledger</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-0.5 px-3 flex-1">
        {(role === "TENANT" ? TENANT_NAV_ITEMS : NAV_ITEMS)
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary-50 text-primary shadow-sm"
                    : "text-foreground-soft hover:bg-surface-muted hover:text-foreground hover:pl-4"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", active ? "text-primary" : "group-hover:scale-110")} />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                )}
              </Link>
            );
          })}
      </div>

      {/* Footer */}
      <div className="px-4 pt-4 pb-2 border-t border-border mt-auto">
        <p className="text-[10px] text-foreground-faint tracking-wider uppercase text-center">
          v0.1.0 &middot; Sharma Family
        </p>
      </div>
    </nav>
  );
}