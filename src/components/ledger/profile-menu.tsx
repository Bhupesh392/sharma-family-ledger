"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProfileMenu({
  name,
  role,
}: {
  name: string;
  role: "ADMIN" | "MEMBER";
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
          className="flex items-center gap-2 rounded-full pl-1 pr-2 sm:pr-3 py-1 hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo"
          aria-label="Account menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo text-white text-xs font-semibold shrink-0">
            {initials || <User className="h-3.5 w-3.5" />}
          </span>
          <span className="text-sm font-medium text-foreground hidden sm:inline">{name}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 app-card p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <Badge variant={role === "ADMIN" ? "admin" : "default"} className="mt-1.5">
              {role === "ADMIN" ? "Admin" : "Member"}
            </Badge>
          </div>
          <div className="app-divider my-1" />
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
