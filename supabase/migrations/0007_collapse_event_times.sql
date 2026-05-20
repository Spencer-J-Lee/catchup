-- ============================================================================
-- CatchUp — collapse scheduled_at + occurred_at into a single event_at
-- ============================================================================
-- The two columns forced dual-field handling everywhere (Zod refines, the
-- calendar OR filter, `occurred_at ?? scheduled_at` fallbacks) and `occurred_at`
-- was misleading anyway: users mark events complete well after the fact, so
-- the stored timestamp is "when I tapped the button," not when the catch-up
-- happened. One column, `event_at`, means "the time the user associates with
-- this event" — planned while upcoming, best-guess once completed.
-- ============================================================================

-- 1. Drop constraints that depend on the two columns
alter table public.catch_up_events drop constraint at_least_one_time;
alter table public.catch_up_events drop constraint completed_has_time;

-- 2. Drop old indexes
drop index if exists public.catch_up_events_user_scheduled_idx;
drop index if exists public.catch_up_events_user_occurred_idx;

-- 3. Add event_at, backfill from coalesce, then enforce NOT NULL
alter table public.catch_up_events add column event_at timestamptz;
update public.catch_up_events
  set event_at = coalesce(occurred_at, scheduled_at);
alter table public.catch_up_events alter column event_at set not null;

-- 4. Recreate friend_frequency_status (from 0005) to read event_at instead of
--    occurred_at. Output column list/types are unchanged, so CREATE OR REPLACE
--    works without dropping the view.
create or replace view public.friend_frequency_status as
select
  f.id as friend_id,
  f.user_id,
  f.frequency_amount,
  f.frequency_unit,
  (
    select max(event_at)
    from public.catch_up_events e
    where e.friend_id = f.id and e.status = 'completed'
  ) as last_caught_up_at,
  case
    when f.frequency_amount is null then null
    else (
      coalesce(
        (select max(event_at) from public.catch_up_events e
          where e.friend_id = f.id and e.status = 'completed'),
        f.created_at
      )
      + make_interval(
          days  => case when f.frequency_unit = 'days'   then f.frequency_amount else 0 end,
          weeks => case when f.frequency_unit = 'weeks'  then f.frequency_amount else 0 end,
          months=> case when f.frequency_unit = 'months' then f.frequency_amount else 0 end
        )
    )
  end as next_due_at
from public.friends f;

alter view public.friend_frequency_status set (security_invoker = true);

-- 5. Drop the old columns
alter table public.catch_up_events drop column scheduled_at;
alter table public.catch_up_events drop column occurred_at;

-- 6. New index on the single time column
create index catch_up_events_user_event_at_idx
  on public.catch_up_events(user_id, event_at);
