-- Pocket Diamond migration 013: game invites between friends are kept on the server.
-- Run after 012_username_case.sql. Safe to run more than once.
-- An invite used to be only a live message to the friend's open game, so it was lost if their game missed it. Now it's
-- a row here: the friend's game checks for open invites every few seconds (and still gets the live message too), and
-- the sender's game sees the answer. An invite is open for 10 minutes, and a new one to the same friend replaces it.
create table if not exists public.friend_invites (
  id         bigint generated always as identity primary key,
  from_user  uuid not null references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  code       text not null check (code ~ '^[a-z]{4}$'),
  status     text not null default 'open' check (status in ('open', 'joined', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
create index if not exists friend_invites_to on public.friend_invites (to_user, status, created_at desc);
alter table public.friend_invites enable row level security;
revoke all on public.friend_invites from anon, authenticated;

create or replace function public.friend_invite(p_to uuid, p_code text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); id bigint;
begin
  if not exists (select 1 from public.friendships where user_lo = least(me, p_to) and user_hi = greatest(me, p_to) and status = 'accepted') then
    raise exception 'You can only invite your friends.' using errcode = 'P0045'; end if;
  if (select count(*) from public.friend_invites where from_user = me and created_at > now() - interval '1 minute') >= 6 then
    raise exception 'Too many invites; try again in a minute.' using errcode = 'P0043'; end if;
  update public.friend_invites set status = 'cancelled', answered_at = now() where from_user = me and status = 'open';
  insert into public.friend_invites (from_user, to_user, code) values (me, p_to, lower(p_code)) returning friend_invites.id into id;
  return id;
end $$;

-- open invites to me (newest first), with the sender's username
create or replace function public.friend_invites_inbox() returns table (id bigint, from_user uuid, username text, code text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select i.id, i.from_user, p.username, i.code, i.created_at
  from public.friend_invites i join public.profiles p on p.user_id = i.from_user
  where i.to_user = public.pd_me() and i.status = 'open' and i.created_at > now() - interval '10 minutes'
    and exists (select 1 from public.friendships f where f.user_lo = least(i.from_user, i.to_user) and f.user_hi = greatest(i.from_user, i.to_user) and f.status = 'accepted')
  order by i.created_at desc limit 5;
$$;

-- the friend answers (joined / declined); the sender can cancel. Returns the invite's status afterwards.
create or replace function public.friend_invite_answer(p_id bigint, p_answer text) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); st text;
begin
  if p_answer in ('joined', 'declined') then
    update public.friend_invites set status = p_answer, answered_at = now() where id = p_id and to_user = me and status = 'open';
  elsif p_answer = 'cancelled' then
    update public.friend_invites set status = 'cancelled', answered_at = now() where id = p_id and from_user = me and status = 'open';
  else raise exception 'bad answer' using errcode = '22023'; end if;
  select status into st from public.friend_invites where id = p_id and me in (from_user, to_user);
  return st;
end $$;

-- the sender checks how its invite is doing
create or replace function public.friend_invite_status(p_id bigint) returns text
language sql stable security definer set search_path = '' as $$
  select case when status = 'open' and created_at < now() - interval '10 minutes' then 'expired' else status end
  from public.friend_invites where id = p_id and from_user = public.pd_me();
$$;

revoke all on function public.friend_invite(uuid, text), public.friend_invites_inbox(), public.friend_invite_answer(bigint, text), public.friend_invite_status(bigint) from public, anon;
grant execute on function public.friend_invite(uuid, text), public.friend_invites_inbox(), public.friend_invite_answer(bigint, text), public.friend_invite_status(bigint) to authenticated;
