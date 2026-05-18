-- ============================================================================
-- CatchUp — add "email" to catch_up_events.medium
-- ============================================================================
-- Extends the medium CHECK constraint to allow 'email' alongside the existing
-- 'text', 'call', 'video', and 'in_person' values.
-- ============================================================================

alter table public.catch_up_events
  drop constraint catch_up_events_medium_check;

alter table public.catch_up_events
  add constraint catch_up_events_medium_check
  check (medium in ('text','call','video','in_person','email'));
