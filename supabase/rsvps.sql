-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Guests (anon) can only add RSVPs; only signed-in users can read or delete them.

create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  attending boolean not null,
  message text check (message is null or char_length(message) <= 2000)
);

alter table public.rsvps enable row level security;

drop policy if exists "Guests can submit RSVPs" on public.rsvps;
create policy "Guests can submit RSVPs" on public.rsvps
  for insert to anon, authenticated with check (true);

drop policy if exists "Signed-in users can read RSVPs" on public.rsvps;
create policy "Signed-in users can read RSVPs" on public.rsvps
  for select to authenticated using (true);

drop policy if exists "Signed-in users can delete RSVPs" on public.rsvps;
create policy "Signed-in users can delete RSVPs" on public.rsvps
  for delete to authenticated using (true);
