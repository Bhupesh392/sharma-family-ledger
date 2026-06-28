"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Zap,
  Store,
  HardHat,
  Undo2,
  Receipt,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/e392-rent", label: "E-392 Rent", icon: Building2 },
  { href: "/e392-utilities", label: "E-392 Utilities", icon: Zap },
  { href: "/chitrakoot-rent", label: "Chitrakoot Shop", icon: Store },
  { href: "/construction", label: "JagdishPuri Construction", icon: HardHat },
  { href: "/return-items", label: "Return Items", icon: Undo2 },
  { href: "/miscellaneous", label: "Miscellaneous", icon: Receipt },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2 px-3 pb-5 pt-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon text-paper-raised shrink-0">
          <BookOpen className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-ink">Sharma Ledger</p>
          <p className="text-[11px] text-ink-soft">Family property accounts</p>
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-r-md py-2.5 pl-4 pr-3 text-sm font-medium transition-colors",
              active
                ? "bg-paper-raised text-maroon"
                : "text-ink-soft hover:bg-rule/30 hover:text-ink"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-sm transition-colors",
                active ? "bg-maroon" : "bg-transparent group-hover:bg-rule-strong"
              )}
            />
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
