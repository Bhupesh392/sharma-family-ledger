# Sharma Family Ledger

A simple, modern web app for recording rent and expenses for the family
properties — replacing the old `Spends_Master_File.xlsx` spreadsheet.

Everyone in the family can **view everything** and **add/edit entries**.
Only the **admin** account can **delete** entries.

---

## What's inside

| Section | What it tracks |
|---|---|
| **E-392 Rent** | Monthly rent from the Ground, First, and Second floor tenants |
| **E-392 Utilities** | Water, electricity, and other utility bills for the building |
| **Chitrakoot Shop Rent** | Shop rent, plus how much of it has been submitted to Nitin |
| **JagdishPuri Construction** | Construction-related expenses |
| **Return Items** | Items/materials returned and their refund status |
| **Miscellaneous** | Any other one-off expense |

The dashboard ("Overview") shows totals and recent activity across all
of the above.

## Tech stack

- **Next.js 16** (App Router, Server Actions, Turbopack) — modern, fast,
  and the natural fit for Vercel hosting.
- **TypeScript** throughout.
- **Postgres** (works great with [Neon](https://neon.tech)'s free tier,
  or Vercel Postgres) via **Drizzle ORM** — lightweight, no native
  binaries to manage, easy to read/extend.
- **Auth.js (NextAuth v5)** with username + password login, sessions
  stored as JWT cookies.
- **Tailwind CSS v4** + Radix UI primitives for the ledger-book themed
  design.

This stack was chosen specifically to be **easy to maintain**: no
servers to manage, a few clearly-organized files per feature, and a
database schema that mirrors your original spreadsheet sheet-for-sheet.

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

You need a Postgres database. The fastest free option is
[neon.tech](https://neon.tech) — create a project, copy the connection
string it gives you into `DATABASE_URL`.

Create the tables:

```bash
npm run db:push
```

### Add family members & import old spreadsheet data

Open `scripts/seed.ts` and edit the `FAMILY_MEMBERS` list at the top —
put in everyone's real name, a username, and a temporary password.
**Nitin Sharma is set as `ADMIN`** (can delete entries); everyone else
defaults to `MEMBER` (can view + add/edit, not delete). Adjust as
needed.

Then run:

```bash
npm run db:seed
```

This creates all the accounts **and** imports every historical entry
from `Spends_Master_File.xlsx` (already converted to
`scripts/seed-data.json`), so nothing from the old spreadsheet is lost.

> Run this once. Running it twice will duplicate the historical rows
> (it's safe to re-run for the *user* accounts — those won't duplicate —
> but the data import will). If you need to start over, drop the tables
> and run `db:push` again before re-seeding.

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with one of the accounts you
created.

---

## 2. Deploying to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the project's **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Neon/Postgres connection string
   - `AUTH_SECRET` — the same secret you generated locally (or a new
     one — just make sure it doesn't change after people start using
     the app, or everyone gets signed out)
4. Deploy.
5. From your own machine (with the same `.env.local` pointed at the
   **production** database), run `npm run db:push` and `npm run
   db:seed` once to set up tables and accounts in production.

That's it — share the Vercel URL with the family, and give each person
their username + password.

### Letting family members change their password

There's no self-service "change password" screen yet (kept things
simple for v1). To change someone's password, run this once via
`npm run db:studio` (opens a visual database browser) — find their row
in `users`, then update `password_hash` with a new bcrypt hash. If this
comes up often, it's a quick follow-up feature to add.

---

## 3. Project structure

```
src/
  app/
    (app)/             # Authenticated pages (dashboard + all sections)
    login/             # Login page
    api/auth/          # NextAuth route handler
  components/
    ui/                # Generic UI primitives (button, dialog, input…)
    ledger/             # App-specific components (sidebar, forms, tables)
  lib/
    db/                # Drizzle schema + client
    actions/           # Server Actions (add/update/delete per section)
    auth.ts            # NextAuth config
    data.ts            # Data-fetching + dashboard summary helpers
    validations.ts      # Zod schemas for all forms
scripts/
  seed.ts              # One-time: creates accounts + imports old data
  seed-data.json       # Historical data extracted from the old Excel file
drizzle/               # SQL migration files (generated from schema.ts)
```

### Adding a new section later

Each section follows the same five-file pattern — copy an existing one
(e.g. `miscellaneous`) as a template:
1. Add a table to `src/lib/db/schema.ts`, run `npm run db:generate` then
   `npm run db:push`.
2. Add a Zod schema in `src/lib/validations.ts`.
3. Add Server Actions in `src/lib/actions/`.
4. Add form fields + row actions components in `src/components/ledger/`.
5. Add the page in `src/app/(app)/your-section/page.tsx` and a link in
   `src/components/ledger/sidebar.tsx`.

---

## 4. Permissions recap

- **Everyone** (Admin + Members): view all data, add new entries, edit
  existing entries.
- **Admin only**: delete entries (delete buttons are hidden entirely
  for Members, and the server also re-checks the role before deleting
  — so this can't be bypassed from the browser).
