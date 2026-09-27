-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Guests can only ADD replies. Replies can only be READ through rsvps.html opened
-- with the private link (rsvps.html#<token>); the token is generated below and
-- shown in the query result. It is never stored in this repository.

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
-- No select policy: the table can't be read directly with the public key.
drop policy if exists "Signed-in users can read RSVPs" on public.rsvps;
drop policy if exists "Signed-in users can delete RSVPs" on public.rsvps;

-- The link token lives in a schema the public API can't reach.
create schema if not exists private;
revoke all on schema private from anon, authenticated;
create table if not exists private.rsvp_link (
  id int primary key default 1 check (id = 1),
  token text not null
);
insert into private.rsvp_link (token)
values (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;

-- Returns all replies, but only for the correct link token.
create or replace function public.get_rsvps(p_token text)
returns setof public.rsvps
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from private.rsvp_link where token = p_token) then
    raise exception 'invalid link';
  end if;
  return query select * from public.rsvps order by created_at desc;
end;
$$;

revoke all on function public.get_rsvps(text) from public;
grant execute on function public.get_rsvps(text) to anon, authenticated;

-- Your private link token (add it after # in the link):
select token as your_private_link_token from private.rsvp_link;

-- To change the link later (the old link stops working):
--   update private.rsvp_link set token = replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
--   select token from private.rsvp_link;
