-- ============================================================================
-- CatchUp — friends.first_name / last_name (iPhone Contacts style)
-- ============================================================================
-- Splits the single display_name column into first_name (required) and
-- last_name (optional), matching how iOS Contacts stores names. Existing rows
-- are backfilled by splitting on the first whitespace run.
-- ============================================================================

alter table public.friends
  add column first_name text,
  add column last_name text;

update public.friends
set
  first_name = case
    when display_name ~ '\s'
      then trim(substring(display_name from 1 for position(' ' in display_name) - 1))
    else trim(display_name)
  end,
  last_name = case
    when display_name ~ '\s'
      then nullif(trim(substring(display_name from position(' ' in display_name) + 1)), '')
    else null
  end;

alter table public.friends
  alter column first_name set not null,
  drop column display_name;
