"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, var(--indigo-100) 0%, transparent 45%), radial-gradient(circle at 80% 80%, var(--emerald-100) 0%, transparent 45%)",
          opacity: 0.6,
        }}
      />
      <div className="relative w-full max-w-sm animate-fade-rise">
        <div className="app-card p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo text-white">
              <Landmark className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground mt-2">
              Sharma Estates
            </h1>
            <p className="text-sm text-foreground-soft">
              Sign in to manage properties, tenants, and the family ledger.
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
              <p className="text-sm text-expense bg-expense/10 border border-expense/20 rounded-[var(--radius-control)] px-3 py-2">
                {state.error}
              </p>
            )}

            <Button type="submit" className="mt-2" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-foreground-soft mt-4">
          Don&apos;t have a password yet? Ask Admin to add your account.
        </p>
      </div>
    </main>
  );
}
