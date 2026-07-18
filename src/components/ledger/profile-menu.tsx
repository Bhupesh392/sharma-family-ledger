"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function ProfileMenu({
  name,
  role,
}: {
  name: string;
  role: "ADMIN" | "MEMBER" | "TENANT";
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-full pl-1 pr-2 sm:pr-3 py-1 hover:bg-surface-muted transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Account menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-semibold shrink-0 shadow-sm">
            {initials || <User className="h-3.5 w-3.5" />}
          </span>
          <span className="text-sm font-medium text-foreground hidden sm:inline">{name}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 app-card p-2 shadow-overlay animate-scale-in"
        >
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-semibold shrink-0">
                {initials || <User className="h-4 w-4" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <Badge
                  variant={role === "ADMIN" ? "admin" : role === "TENANT" ? "accent" : "primary"}
                  className="mt-0.5"
                >
                  {role === "ADMIN" ? "Admin" : role === "TENANT" ? "Tenant" : "Member"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="app-divider my-1" />
          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground-soft cursor-pointer outline-none hover:bg-surface-muted hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground-soft cursor-pointer outline-none hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}