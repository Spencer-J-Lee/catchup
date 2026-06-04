-- ============================================================================
-- Remove the 'missed' event status. The app no longer marks catch-ups as
-- missed — the follow-up flow now reschedules the existing event (keeping its
-- details) instead. Historical missed events become 'cancelled', the closest
-- remaining "didn't happen, kept for history" status.
-- ============================================================================

update public.catch_up_events set status = 'cancelled' where status = 'missed';

alter table public.catch_up_events
  drop constraint catch_up_events_status_check;
alter table public.catch_up_events
  add constraint catch_up_events_status_check
  check (status in ('scheduled','completed','cancelled'));
