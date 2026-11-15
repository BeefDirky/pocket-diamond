-- Pocket Diamond migration 011: friends.
-- Run after 010_username_filter.sql. Safe to run more than once.
-- One row per pair of players (the smaller id first), either a pending request (from `requester`) or accepted friends.
-- Nobody touches the table directly: everything goes through the functions below, which check who's asking.
--   friend_request(username)  send a request; if they had already asked you, you're friends at once
--   friend_respond(id, yes)   accept or decline a request sent to you
--   friend_remove(id)         unfriend, cancel your request, or decline theirs
--   friends_list()            your friends and requests, with usernames and ranked ratings
create table if not exists public.friendships (
  user_lo     uuid not null references auth.users(id) on delete cascade,
  user_hi     uuid not null references auth.users(id) on delete cascade,
  requester   uuid not null,
  status      text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (user_lo, user_hi),
  check (user_lo < user_hi),
  check (requester in (user_lo, user_hi))
);
create index if not exists friendships_hi on public.friendships (user_hi);
alter table public.friendships enable row level security;
revoke all on public.friendships from anon, authenticated;

create or replace function public.friend_request(p_username text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); them uuid; lo uuid; hi uuid; f public.friendships;
begin
  select p.user_id into them from public.profiles p where p.uname_lc = lower(trim(p_username));
  if them is null then raise exception 'No player is called %.', trim(p_username) using errcode = 'P0041'; end if;
  if them = me then raise exception 'That''s you.' using errcode = 'P0042'; end if;
  lo := least(me, them); hi := greatest(me, them);
  select * into f from public.friendships where user_lo = lo and user_hi = hi for update;
  if found then
    if f.status = 'accepted' then return jsonb_build_object('status', 'already', 'user_id', them); end if;
    if f.requester = me then return jsonb_build_object('status', 'sent', 'user_id', them); end if;
    update public.friendships set status = 'accepted', accepted_at = now() where user_lo = lo and user_hi = hi;
    return jsonb_build_object('status', 'accepted', 'user_id', them);
  end if;
  if (select count(*) from public.friendships where me in (user_lo, user_hi) and status = 'accepted') >= 200 then
    raise exception 'Your friends list is full (200).' using errcode = 'P0043'; end if;
  if (select count(*) from public.friendships where requester = me and status = 'pending') >= 30 then
    raise exception 'You have 30 requests waiting for an answer. Wait for some replies first.' using errcode = 'P0043'; end if;
  if (select count(*) from public.friendships where requester = me and created_at > now() - interval '1 minute') >= 10 then
    raise exception 'Too many requests; try again in a minute.' using errcode = 'P0043'; end if;
  insert into public.friendships (user_lo, user_hi, requester) values (lo, hi, me);
  return jsonb_build_object('status', 'sent', 'user_id', them);
end $$;

create or replace function public.friend_respond(p_other uuid, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); lo uuid := least(me, p_other); hi uuid := greatest(me, p_other);
begin
  if p_accept then
    update public.friendships set status = 'accepted', accepted_at = now()
      where user_lo = lo and user_hi = hi and status = 'pending' and requester = p_other;
    if not found then raise exception 'That request is gone.' using errcode = 'P0044'; end if;
    return jsonb_build_object('status', 'accepted');
  end if;
  delete from public.friendships where user_lo = lo and user_hi = hi and status = 'pending' and requester = p_other;
  return jsonb_build_object('status', 'declined');
end $$;

create or replace function public.friend_remove(p_other uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me();
begin
  delete from public.friendships where user_lo = least(me, p_other) and user_hi = greatest(me, p_other);
  return jsonb_build_object('status', 'removed');
end $$;

create or replace function public.friends_list() returns table (user_id uuid, username text, state text, since timestamptz, rating int)
language sql stable security definer set search_path = '' as $$
  select o.id, p.username,
         case when f.status = 'accepted' then 'friend' when f.requester = o.me then 'outgoing' else 'incoming' end,
         coalesce(f.accepted_at, f.created_at), public.pd_rating_of(o.id)
  from public.friendships f
  cross join lateral (select public.pd_me() as me) m
  cross join lateral (select m.me, case when f.user_lo = m.me then f.user_hi else f.user_lo end as id) o
  join public.profiles p on p.user_id = o.id
  where m.me in (f.user_lo, f.user_hi)
  order by 3, p.uname_lc;
$$;

revoke all on function public.friend_request(text), public.friend_respond(uuid, boolean), public.friend_remove(uuid), public.friends_list() from public, anon;
grant execute on function public.friend_request(text), public.friend_respond(uuid, boolean), public.friend_remove(uuid), public.friends_list() to authenticated;
