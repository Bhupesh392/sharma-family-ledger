"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Building2, TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  { icon: Building2, text: "Track income, expenses, loans & EMIs" },
  { icon: ShieldCheck, text: "Rent agreements, police verification & full Indian compliance" },
  { icon: BarChart3, text: "AI forecasting the road ahead" },
];

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <main className="min-h-screen w-full flex relative overflow-hidden dark">
      {/* ── Full-page background image with blur ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")',
          filter: "blur(4px) brightness(0.3)",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50" />

      {/* ── Left: Hero / Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="flex flex-col justify-between p-12 w-full">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-lg font-display font-semibold text-white/90">
              Sharma Estates
            </span>
          </div>

          {/* Hero text */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-medium mb-6 border border-white/10">
              <TrendingUp className="h-3.5 w-3.5" />
              AI-Powered Property OS
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-4">
              One portal for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-soft to-accent-soft">
                every property.
              </span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              Track income, expenses, loans & EMIs, rent agreements, police
              verification and full Indian compliance — with AI forecasting the
              road ahead.
            </p>

            {/* Feature list */}
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-md shrink-0">
                    <f.icon className="h-3.5 w-3.5 text-accent-soft" />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Sharma Family Ledger
          </p>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 relative z-10">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Glass card */}
          <div className="app-card p-8 sm:p-10 shadow-overlay bg-white/10 backdrop-blur-xl border border-white/20">
            {/* Mobile brand (visible only on small screens) */}
            <div className="flex flex-col items-center gap-3 mb-10 text-center lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-xl shadow-primary/20">
                <Landmark className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-white">
                  Sharma Estates
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  Sign in to manage your family property ledger
                </p>
              </div>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-8">
              <h2 className="font-display text-2xl font-semibold text-white">
                Welcome back
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Account
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form action={formAction} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-white/80"
                >
                  Name
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="e.g. nitin"
                  autoComplete="username"
                  required
                  autoFocus
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary-soft focus:ring-primary-soft/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-white/80"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  autoComplete="current-password"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary-soft focus:ring-primary-soft/30"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-control)] px-3 py-2.5 animate-fade-in">
                  {state.error}
                </p>
              )}

              <Button
                type="submit"
                className="mt-1 h-11"
                disabled={isPending}
                variant="gradient"
                size="lg"
              >
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

            <p className="text-center text-xs text-white/40 mt-5">
              Don&rsquo;t have a password yet? Ask Admin to add your account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
