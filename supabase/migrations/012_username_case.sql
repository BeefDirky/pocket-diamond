-- Pocket Diamond migration 012: usernames are case-sensitive.
-- Run after 011_friends.sql. Safe to run more than once.
-- "BeefDirky" and "beefdirky" are now two different usernames (before, they counted as the same name), and adding a
-- friend needs the exact capitals.
drop index if exists public.profiles_uname_lc_key;
create unique index if not exists profiles_username_key on public.profiles (username);

create or replace function public.friend_request(p_username text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); them uuid; lo uuid; hi uuid; f public.friendships;
begin
  select p.user_id into them from public.profiles p where p.username = trim(p_username);
  if them is null then
    if exists (select 1 from public.profiles p where p.uname_lc = lower(trim(p_username))) then
      raise exception 'No player is called % (usernames are case-sensitive: check the capitals).', trim(p_username) using errcode = 'P0041'; end if;
    raise exception 'No player is called %.', trim(p_username) using errcode = 'P0041'; end if;
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
