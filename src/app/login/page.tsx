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
      {/* Premium background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div
          className="absolute top-0 left-0 right-0 h-[40vh]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, var(--primary-100) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, var(--accent-100) 0%, transparent 50%)",
            opacity: 0.5,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="app-card p-8 sm:p-10 shadow-overlay">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-xl shadow-primary/20">
              <Landmark className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Sharma Estates
              </h1>
              <p className="text-sm text-foreground-soft mt-1">
                Sign in to manage your family property ledger
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground-faint uppercase tracking-wider">Account</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">Name</Label>
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
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                autoComplete="current-password"
                required
              />
            </div>

            {state?.error && (
              <p className="text-sm text-expense bg-expense/10 border border-expense/20 rounded-[var(--radius-control)] px-3 py-2.5 animate-fade-in">
                {state.error}
              </p>
            )}

            <Button type="submit" className="mt-1 h-11" disabled={isPending} variant="gradient" size="lg">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in&hellip;
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-foreground-faint mt-5">
          Don't have a password yet? Ask Admin to add your account.
        </p>
      </div>
    </main>
  );
}