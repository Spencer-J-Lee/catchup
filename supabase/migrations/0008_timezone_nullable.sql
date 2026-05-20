-- ============================================================================
-- Make profiles.timezone nullable; NULL is the "not yet detected" sentinel.
-- Previously the column defaulted to 'UTC' as a stand-in for "unset",
-- which made genuine UTC users indistinguishable from un-bootstrapped ones.
-- ============================================================================

alter table public.profiles alter column timezone drop not null;
alter table public.profiles alter column timezone drop default;

update public.profiles set timezone = null where timezone = 'UTC';
