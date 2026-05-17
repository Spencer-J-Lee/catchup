-- ============================================================================
-- CatchUp — drop friends.general_notes
-- ============================================================================
-- Notes on the friend record were sourced primarily from the iOS contact's
-- note field, which is gated behind Apple's com.apple.developer.contacts.notes
-- entitlement. Without that entitlement the field is unreadable, so the
-- per-friend notes feature is removed. Notes remain on catch_up_events.
-- ============================================================================

alter table public.friends drop column general_notes;
