"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";

export function MobileNav({ role }: { role?: "ADMIN" | "MEMBER" | "TENANT" }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render the portal after mount, since document.body isn't
  // available during server rendering. This is the standard
  // mount-detection pattern for safely using createPortal in Next.js.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Prevent the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-72 bg-background border-r border-border py-4 animate-fade-rise overflow-y-auto">
              <Sidebar onNavigate={() => setOpen(false)} role={role} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
