-- ============================================================================
-- CatchUp — rename "cadence" to "frequency"
-- ============================================================================
-- Renames the cadence_* columns on friends, the cadence_consistency check
-- constraint, and the friend_cadence_status view (and its cadence_* columns).
-- ============================================================================

-- The view depends on the columns we're renaming; drop it first.
drop view if exists public.friend_cadence_status;

alter table public.friends rename column cadence_preset to frequency_preset;
alter table public.friends rename column cadence_amount to frequency_amount;
alter table public.friends rename column cadence_unit   to frequency_unit;

alter table public.friends rename constraint cadence_consistency to frequency_consistency;

create or replace view public.friend_frequency_status as
select
  f.id as friend_id,
  f.user_id,
  f.frequency_amount,
  f.frequency_unit,
  (
    select max(occurred_at)
    from public.catch_up_events e
    where e.friend_id = f.id and e.status = 'completed'
  ) as last_caught_up_at,
  case
    when f.frequency_amount is null then null
    else (
      coalesce(
        (select max(occurred_at) from public.catch_up_events e
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
