# Sharma Estates — Family Property Ledger

A modern property-management dashboard for the family's rental properties —
tracking rent, expenses, tenants, deposits, and occupancy, with a fintech-grade
look and light/dark mode.

Everyone can **view everything** and **add/edit entries**. Only the
**admin** account can **delete** entries.

---

## What's inside

| Area | What it covers |
|---|---|
| **Dashboard** | KPI cards (income, expenses, net profit, outstanding rent, occupancy), income vs. expense trend, expense breakdown |
| **Properties** | Grid/list view of every rental unit, occupancy status, current tenant, monthly rent |
| **Tenants** | Tenant directory, current property, tenancy history, security deposits |
| **Income** | E-392 Rent and Chitrakoot Shop Rent (tabbed) |
| **Expenses** | Utilities, Construction, Miscellaneous, Return Items (tabbed) |
| **Reports** | 12-month trend, property profitability, expense breakdown, tenant payment behaviour |
| **Documents** | Placeholder for future rent-agreement / receipt storage |
| **Settings** | Theme preference, your account, and (admin) the family member list |

Occupancy is **derived automatically** — a property is "occupied" whenever
it has a tenancy marked `ACTIVE`; there's no manual toggle to keep in sync.

## Tech stack

- **Next.js 16** (App Router, Server Actions, Turbopack), all data pages
  rendered dynamically (`force-dynamic`) since they're always behind login
  and always reading live data.
- **TypeScript** throughout.
- **Postgres** via **Drizzle ORM** (works great with
  [Neon](https://neon.tech)'s free tier or Vercel Postgres) — no native
  binaries, easy to read and extend.
- **Auth.js (NextAuth v5)** with username + password login.
- **Tailwind CSS v4** + Radix UI primitives, **next-themes** for light/dark
  mode, **Recharts** for charts.

### Design system

- Primary **Indigo** `#4F46E5`, secondary **Emerald** `#10B981`.
- Status colors: income/paid = emerald, expense/overdue = rose, pending = amber.
- Light background `#F8FAFC` / dark background `#0F172A`, surfaces white /
  slate‑800.
- 12–16px corner radii, soft layered shadows, glassmorphism used sparingly
  (top bar, mobile nav overlay only).
- Type: **Inter** for body/UI, **Lexend** for headings and KPI numbers,
  **JetBrains Mono** for tabular figures.
- All tokens live as CSS variables in `src/app/globals.css` — change the
  palette in one place and it propagates everywhere, including dark mode.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
AUTH_SECRET="<run: openssl rand -base64 32>"
```

Create the tables:

```bash
npm run db:push
```

### Add family members & import historical spreadsheet data

Edit `scripts/seed.ts`'s `FAMILY_MEMBERS` list, then:

```bash
npm run db:seed
```

This creates accounts and imports historical rent/expense rows from the
original spreadsheet. It does **not** create any Properties or Tenants —
those are new concepts with no equivalent in the old spreadsheet, so add
them yourself from the **Properties** and **Tenants** pages once you're
logged in (takes a couple of minutes for the 4 existing units).

Start the dev server:

```bash
npm run dev
```

---

## 2. Deploying to Vercel

1. Push to GitHub, import into Vercel.
2. Add `DATABASE_URL` and `AUTH_SECRET` env vars in Vercel project settings.
3. Deploy.
4. Run `npm run db:push` (and `db:seed`, once) locally against the
   **production** database before anyone logs in.

---

## 3. Project structure

```
src/
  app/
    (app)/
      page.tsx          # Dashboard
      properties/        # Properties grid/list
      tenants/            # Tenant directory + tenancy assignment
      income/              # Tabs: E-392 Rent, Chitrakoot Rent
      expenses/             # Tabs: Utilities, Construction, Misc, Returns
      reports/               # Trend + profitability + payment behaviour
      documents/              # Placeholder
      settings/                # Theme + account + family member list
    login/
    api/auth/
  components/
    ui/                # Generic primitives (button, dialog, tabs, select…)
    ledger/             # App-specific: sidebar, KPI cards, charts, forms
      panels/            # Income/Expenses tab content (one file per old section)
  lib/
    db/                # Drizzle schema + client
    actions/             # Server Actions, one file per entity
    auth.ts              # NextAuth config
    data.ts               # All data-fetching + dashboard/report aggregation
    validations.ts         # Zod schemas
scripts/
  seed.ts              # One-time: accounts + historical data import
drizzle/               # Generated SQL migrations
```

### Adding a new top-level section

1. Table in `src/lib/db/schema.ts` → `npm run db:generate` → `npm run db:push`.
2. Zod schema in `src/lib/validations.ts`.
3. Server Actions in `src/lib/actions/`.
4. Form fields + row/card components in `src/components/ledger/`.
5. Page in `src/app/(app)/your-section/page.tsx` (remember
   `export const dynamic = "force-dynamic"`) + a link in
   `src/components/ledger/sidebar.tsx`.

---

## 4. Permissions recap

- **Everyone**: view all data, add new entries, edit existing entries.
- **Admin only**: delete entries and properties/tenants/tenancies; sees the
  family member list on Settings.
