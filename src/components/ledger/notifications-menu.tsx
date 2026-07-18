"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/data";

export function NotificationsMenu({ notifications }: { notifications: Notification[] }) {
  const count = notifications.length;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-overdue" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-w-[calc(100vw-2rem)] app-card p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="px-3 py-2">
            <p className="font-display text-sm font-semibold text-foreground">Notifications</p>
          </div>
          {count === 0 ? (
            <p className="px-3 py-6 text-sm text-foreground-soft text-center">
              You&apos;re all caught up.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 hover:bg-surface-muted transition-colors"
                >
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                      n.tone === "overdue" && "bg-overdue",
                      n.tone === "pending" && "bg-pending",
                      n.tone === "default" && "bg-primary"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-foreground-soft mt-0.5">{n.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
