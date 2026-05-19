# CatchUp

A mobile app for tracking who you want to stay in touch with and when you last
caught up with them. React Native (Expo) + TypeScript + Supabase.

## Phase 1 status

This is the **Phase 1 scaffold**. It includes:

- Expo Router app with auth gate (Supabase email/password).
- Friends CRUD: add, edit, delete, list.
- Catch-up events: schedule a future event, log a catch-up that just happened,
  backfill a past one, mark scheduled events complete or missed, edit, delete.
- Per-friend frequency presets (daily / weekly / monthly / 3 mo / 6 mo / yearly)
  with a "next due" indicator on the friend list.
- Friend detail view with history, per-event notes, and tap-to-open-in-Maps for
  in-person events.
- Tabs: Friends, Calendar (month grid + per-day agenda), Settings.

Phase 2 (notifications, contacts integration) and Phase 3 (Google Calendar
sync, polish) are unscaffolded.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at https://database.new (or via
   https://supabase.com/dashboard → New project).
2. Once provisioned, grab **Project URL** and the **Publishable key**
   (Settings → API Keys → "publishable", `sb_publishable_…`). Legacy "anon
   public" keys also work — Supabase is migrating naming.

### 3. Apply the database migration

See `supabase/README.md` — either use the Supabase CLI (`supabase db push`) or
paste `supabase/migrations/0001_init.sql` into the SQL editor.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### 5. Run the app

```bash
npm run ios
# or
npm start          # opens the Metro bundler — scan QR with Expo Go on your phone
```

The first time you sign up, Supabase creates an auth user and a trigger
populates a matching `profiles` row.

## Project layout

```
app/                          Expo Router screens
  (auth)/                     login, signup
  (tabs)/                     friends list, calendar, settings
  friend/new.tsx              add-friend modal
  friend/[id]/index.tsx       friend detail
  friend/[id]/edit.tsx        edit friend
  event/new.tsx               schedule / check-in / backfill modal
  event/[id]/index.tsx        event detail
  event/[id]/edit.tsx         edit event
components/                   ui primitives + friend/event widgets
hooks/                        use-auth, use-friends, use-events
lib/                          supabase client, frequency math, zod schemas, formatters
types/                        DB row types (regenerate after migration)
supabase/migrations/          SQL schema
```

## Next steps (Phase 1 polish)

- Wire up a `Custom` frequency input (amount + unit picker) — currently only
  preset chips are wired up.
- Apple Sign In (requires Apple Developer Program) — see
  https://docs.expo.dev/versions/latest/sdk/apple-authentication/.
- Regenerate `types/database.generated.ts` after schema changes:
  `supabase gen types typescript --linked > types/database.generated.ts`.
  `types/database.ts` is a hand-written facade over the generated file that
  adds narrow union types for CHECK-constrained columns — don't overwrite it.

## Phase 2 & 3 (not yet scaffolded)

- Phase 2: `expo-notifications` push tokens, three Edge Function cron jobs
  (frequency-check, pre-event-reminder, morning-after-prompt), `expo-contacts`
  integration, contact-change banner.
- Phase 3: Google OAuth via `expo-auth-session`, Edge Function
  `gcal-sync`, accessibility pass, error/offline handling.
