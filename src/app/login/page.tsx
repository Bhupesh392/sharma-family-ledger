"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 bg-paper relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)",
          backgroundSize: "2.5rem 2.5rem",
        }}
      />
      <div className="relative w-full max-w-sm animate-stamp">
        <div className="ledger-card p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon text-paper-raised">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink mt-2">
              Sharma Family Ledger
            </h1>
            <p className="text-sm text-ink-soft">
              Sign in to view and record rent &amp; expense entries.
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Name</Label>
              <Input
                id="username"
                name="username"
                placeholder="e.g. nitin"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {state?.error && (
              <p className="text-sm text-debit bg-debit/10 border border-debit/20 rounded-md px-3 py-2">
                {state.error}
              </p>
            )}

            <Button type="submit" variant="maroon" className="mt-2" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-ink-soft mt-4">
          Don&apos;t have a password yet? Ask Nitin to add your account.
        </p>
      </div>
    </main>
  );
}
