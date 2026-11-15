-- Pocket Diamond migration 009: in-game feedback and bug reports.
-- Run after 008_username_cooldown.sql. Safe to run more than once.
-- Anyone (guest or signed in) can send a message from the main menu or the pause menu; nobody can read them back
-- through the game. You read them in Supabase: Table Editor > feedback (newest first), or with
--   select created_at, kind, message, contact, username, version, device from public.feedback order by created_at desc;
create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete set null default auth.uid(),
  username   text check (username is null or char_length(username) <= 32),
  kind       text not null check (kind in ('bug','idea','other')),
  message    text not null check (char_length(message) between 3 and 2000),
  contact    text check (contact is null or char_length(contact) <= 200),
  version    text check (version is null or char_length(version) <= 32),
  device     jsonb check (device is null or pg_column_size(device) <= 4000),
  status     text not null default 'new' check (status in ('new','seen','fixed','wontfix'))
);
create index if not exists feedback_created_idx on public.feedback (created_at desc);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
grant insert (username, kind, message, contact, version, device) on public.feedback to anon, authenticated;
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to anon, authenticated
  with check (user_id is not distinct from auth.uid() and status = 'new');
-- no select/update/delete policies: only you (in the dashboard) read them

-- a little flood control: at most 5 messages a minute from one account, and 60 a minute from everyone signed out
create or replace function public.pd_feedback_flood() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.user_id is not null then
    if (select count(*) from public.feedback where user_id = new.user_id and created_at > now() - interval '1 minute') >= 5 then
      raise exception 'Too many messages; try again in a minute.'; end if;
  elsif (select count(*) from public.feedback where user_id is null and created_at > now() - interval '1 minute') >= 60 then
    raise exception 'Too many messages; try again in a minute.';
  end if;
  return new;
end $$;
drop trigger if exists feedback_flood on public.feedback;
create trigger feedback_flood before insert on public.feedback for each row execute function public.pd_feedback_flood();
