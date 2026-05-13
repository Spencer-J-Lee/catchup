# Supabase setup

## 1. Create a project

Create a new project at https://database.new (or
https://supabase.com/dashboard → New project). Once it's provisioned, grab:

- **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
- **Publishable key** (Settings → API Keys → "publishable", starts with
  `sb_publishable_…`) → `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

If your project still shows the legacy "anon public" key instead, that value
works identically — Supabase is mid-migration to the new naming.

Put both in `.env.local` at the repo root (see `.env.example`).

## 2. Apply the migration

Two options:

### Option A — Supabase CLI (recommended)

```bash
brew install supabase/tap/supabase    # if needed
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### Option B — Paste into the SQL editor

Open the SQL Editor in the Supabase dashboard, paste the contents of
`supabase/migrations/0001_init.sql`, and run.

## 3. Enable email auth

Authentication → Providers → Email is on by default. Confirm "Confirm email"
behavior matches your preference (I'd suggest disabling email confirmation
during development).

Apple Sign In is wired up in Phase 1.2; configuring it requires an Apple
Developer account and is documented separately.

## 4. Generate TypeScript types

After the migration is applied:

```bash
supabase gen types typescript --linked > types/database.ts
```

(There's a placeholder `types/database.ts` checked in; replace it after the
migration runs.)
