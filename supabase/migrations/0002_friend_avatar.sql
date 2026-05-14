-- ============================================================================
-- CatchUp — friend avatar URL
-- ============================================================================
-- Adds avatar_url to friends so the row UI can show a contact photo when one
-- is available (e.g. captured from expo-contacts on link/sync).
-- ============================================================================

alter table public.friends
  add column avatar_url text;
