-- ============================================================================
-- CatchUp — initial schema (Phase 1)
-- ============================================================================
-- Tables: profiles, friends, catch_up_events, push_tokens
-- All user-scoped tables have RLS enabled with `user_id = auth.uid()` policies.
-- ============================================================================

-- Enable required extensions ---------------------------------------------------
create extension if not exists "pgcrypto";

-- 1. profiles -----------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  default_pre_reminder_minutes int not null default 60,
  morning_prompt_local_hour int not null default 9 check (morning_prompt_local_hour between 0 and 23),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. friends ------------------------------------------------------------------
create table public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  contact_id text,
  contact_snapshot jsonb,
  contact_synced_at timestamptz,
  general_notes text,
  cadence_preset text check (cadence_preset in ('daily','weekly','monthly','3_months','6_months','yearly','custom')),
  cadence_amount int check (cadence_amount > 0),
  cadence_unit text check (cadence_unit in ('days','weeks','months')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- if a cadence is set, all three fields must agree
  constraint cadence_consistency check (
    (cadence_preset is null and cadence_amount is null and cadence_unit is null)
    or (cadence_preset is not null and cadence_amount is not null and cadence_unit is not null)
  )
);
create index friends_user_id_idx on public.friends(user_id);

-- 3. catch_up_events ----------------------------------------------------------
create table public.catch_up_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.friends(id) on delete cascade,
  scheduled_at timestamptz,
  occurred_at timestamptz,
  status text not null check (status in ('scheduled','completed','missed','cancelled')),
  medium text check (medium in ('text','call','video','in_person')),
  medium_detail text,
  location_text text,
  location_address text,
  pre_reminder_minutes int check (pre_reminder_minutes >= 0),
  event_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- a row must have at least one of scheduled_at or occurred_at
  constraint at_least_one_time check (scheduled_at is not null or occurred_at is not null),
  -- completed implies occurred_at is set
  constraint completed_has_time check (status <> 'completed' or occurred_at is not null)
);
create index catch_up_events_user_friend_idx on public.catch_up_events(user_id, friend_id);
create index catch_up_events_user_scheduled_idx on public.catch_up_events(user_id, scheduled_at);
create index catch_up_events_user_occurred_idx on public.catch_up_events(user_id, occurred_at);

-- 4. push_tokens --------------------------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios','android')),
  last_seen_at timestamptz not null default now()
);
create index push_tokens_user_id_idx on public.push_tokens(user_id);

-- ============================================================================
-- updated_at trigger
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger friends_set_updated_at before update on public.friends
  for each row execute function public.set_updated_at();
create trigger catch_up_events_set_updated_at before update on public.catch_up_events
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Auto-create profile on auth.users insert
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.friends          enable row level security;
alter table public.catch_up_events  enable row level security;
alter table public.push_tokens      enable row level security;

-- profiles: users can read/update their own row only
create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- friends
create policy "friends_select_own" on public.friends
  for select using (auth.uid() = user_id);
create policy "friends_insert_own" on public.friends
  for insert with check (auth.uid() = user_id);
create policy "friends_update_own" on public.friends
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "friends_delete_own" on public.friends
  for delete using (auth.uid() = user_id);

-- catch_up_events
create policy "events_select_own" on public.catch_up_events
  for select using (auth.uid() = user_id);
create policy "events_insert_own" on public.catch_up_events
  for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.catch_up_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events_delete_own" on public.catch_up_events
  for delete using (auth.uid() = user_id);

-- push_tokens
create policy "push_tokens_select_own" on public.push_tokens
  for select using (auth.uid() = user_id);
create policy "push_tokens_insert_own" on public.push_tokens
  for insert with check (auth.uid() = user_id);
create policy "push_tokens_update_own" on public.push_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_tokens_delete_own" on public.push_tokens
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Convenience view: friend cadence status (last caught-up + due-by)
-- ============================================================================
create or replace view public.friend_cadence_status as
select
  f.id as friend_id,
  f.user_id,
  f.cadence_amount,
  f.cadence_unit,
  (
    select max(occurred_at)
    from public.catch_up_events e
    where e.friend_id = f.id and e.status = 'completed'
  ) as last_caught_up_at,
  case
    when f.cadence_amount is null then null
    else (
      coalesce(
        (select max(occurred_at) from public.catch_up_events e
          where e.friend_id = f.id and e.status = 'completed'),
        f.created_at
      )
      + make_interval(
          days  => case when f.cadence_unit = 'days'   then f.cadence_amount else 0 end,
          weeks => case when f.cadence_unit = 'weeks'  then f.cadence_amount else 0 end,
          months=> case when f.cadence_unit = 'months' then f.cadence_amount else 0 end
        )
    )
  end as next_due_at
from public.friends f;

-- The view inherits RLS from the underlying table when invoked with security_invoker.
alter view public.friend_cadence_status set (security_invoker = true);
