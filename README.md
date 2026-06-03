# CatchUp

A mobile app for tracking who you want to stay in touch with and when you last
caught up with them. React Native (Expo) + TypeScript + Supabase.

## What's built so far

Phase 1 (the core tracking MVP) is essentially complete, and parts of Phase 2
have landed too.

**Auth & profiles**

- Expo Router app with an auth gate (Supabase email/password).
- On first sign-up a trigger populates a matching `profiles` row.
- Timezone is auto-detected on first launch and stored on the profile.

**Friends**

- Add, edit, delete, list — with first/last name and an avatar.
- Friends are added by importing from your device contacts (`expo-contacts`):
  pick a contact, then set the frequency. The picked contact is snapshotted
  onto the friend.
- Per-friend frequency: presets (daily / weekly / monthly / 3 mo / 6 mo /
  yearly) **plus** a custom amount + unit input.
- The friends tab is a grouped `SectionList` driven by a per-friend lifecycle
  state machine (awaiting follow-up, scheduled, due/overdue, caught up, etc.),
  with a "next due" / "last caught up" sub-label on each row.
- Friend detail view with catch-up history and per-event notes; quick contact
  actions (call / text / email) when a contact is linked.

**Catch-up events**

- Schedule a future event, log a catch-up that just happened, or backfill a
  past one.
- Pick a medium: Text, Call, Video, Email, or In person.
- In-person events get a searchable location picker; tap an address to open it
  in Maps.
- A follow-up flow ("did it happen?") resolves a past scheduled event to
  Completed, Rescheduled, or Cancelled, with optional notes.
- Event detail + edit; per-event notes throughout.

**Calendar**

- Calendar tab (`react-native-calendars`): month grid with markers for
  past-completed vs. upcoming-scheduled events, plus a per-day agenda.

**Settings & polish**

- Settings tab: light/dark theme toggle, timezone picker, default
  pre-reminder, seed/clear example data (dev helper), and sign out.
- Loading skeletons, empty states, and error toasts throughout.

## What's planned next

**Finish Phase 2 — notifications**

- `expo-notifications`: request permission, register an Expo push token into
  the existing `push_tokens` table, and deep-link notifications into the
  relevant friend/event.
- Three Supabase Edge Functions on `pg_cron`:
  - `cadence-check` (daily) — friends overdue with no upcoming event → push.
  - `pre-event-reminder` — fire `pre_reminder_minutes` before a scheduled
    event.
  - `morning-after-prompt` — nudge to run the follow-up flow on yesterday's
    scheduled events.
- Foreground contact-change detection → banner when a linked contact's details
  have changed since the snapshot.

**Phase 3 — Google Calendar sync + quality**

- Google OAuth via `expo-auth-session` (`calendar.events` scope), refresh
  token stored server-side.
- `gcal-sync` Edge Function: mirror event create/update/delete to Google
  Calendar.
- Accessibility pass (VoiceOver labels), offline/error handling, logging.

**Other follow-ups**

- Apple Sign In (requires the paid Apple Developer Program) — see
  https://docs.expo.dev/versions/latest/sdk/apple-authentication/.
- Ship an internal TestFlight build via EAS.

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

### 3. Apply the database migrations

See `supabase/README.md` — either use the Supabase CLI (`supabase db push`) or
paste the files in `supabase/migrations/` into the SQL editor in order
(`0001_init.sql` first, then `0002…` onward).

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

## Running on your iPhone (no Apple Developer Program required)

- **iOS Simulator (daily driver, no expiry):** just `npm run ios`. It builds
  and launches the app in the simulator on your Mac.
- **Physical iPhone, free Apple ID (7-day signing):**
  1. Open `ios/catchup.xcworkspace` in Xcode.
  2. Plug in your iPhone and select it as the run target.
  3. In the project's *Signing & Capabilities* tab, set *Team* to your
     personal free Apple ID and let Xcode manage signing automatically.
  4. Hit Run. Xcode builds, signs, and installs the app onto the device.
  5. The install is valid for 7 days; plug in and re-run from Xcode to
     refresh.

TestFlight / App Store distribution requires the paid Apple Developer
Program ($99/yr). When you enroll, the next step is `eas init` + setting up
`eas.json` to build signed `.ipa`s on Expo's cloud — out of scope for now.

## Project layout

```
app/                          Expo Router screens
  (auth)/                     login, signup
  (tabs)/                     friends list, calendar, settings
  friend/pick-contact.tsx     pick a device contact to add
  friend/new.tsx              set frequency for the picked contact
  friend/[id]/index.tsx       friend detail
  friend/[id]/edit.tsx        edit friend
  event/new.tsx               schedule / check-in / backfill modal
  event/[id]/index.tsx        event detail
  event/[id]/edit.tsx         edit event
  event/[id]/follow-up.tsx    resolve a past scheduled event
components/                   ui primitives + friend/event/settings widgets
hooks/                        use-auth, use-friends, use-events, use-profile, …
lib/                          supabase client, frequency/lifecycle math, friend
                              sectioning, zod schemas, theming, seed data
types/                        DB row types (regenerate after migration)
supabase/migrations/          SQL schema (0001 → 0008)
```

## Working with the schema & types

- Regenerate `types/database.generated.ts` after schema changes:
  `supabase gen types typescript --linked > types/database.generated.ts`.
- `types/database.ts` is a hand-written facade over the generated file that
  adds narrow union types for CHECK-constrained columns — don't overwrite it.
