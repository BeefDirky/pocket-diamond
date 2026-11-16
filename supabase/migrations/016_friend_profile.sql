-- Pocket Diamond migration 016: a friend's profile page.
-- Run after 015_active_device.sql. Safe to run more than once.
-- Shows a friend the same tiles as your own Account page: ranked rating and record, coins, cards owned and club. The
-- coins, cards and club come from the friend's cloud save, which nobody else can read; this function hands out only those
-- few numbers, and only to an accepted friend (or to yourself).
create or replace function public.friend_profile(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := public.pd_me(); sid int; nm text; d jsonb; club text; coins int; cards int; r public.ratings;
begin
  if me is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  if p_user <> me and not exists (select 1 from public.friendships where user_lo = least(me, p_user) and user_hi = greatest(me, p_user) and status = 'accepted') then
    raise exception 'You can only see your friends'' profiles.' using errcode = 'P0046'; end if;
  select username into nm from public.profiles where user_id = p_user;
  select id into sid from public.seasons where ladder = 'stock' and is_active;
  select * into r from public.ratings where user_id = p_user and season_id = sid;
  select data into d from public.saves where user_id = p_user;
  -- the save keeps each part as JSON text; a part that doesn't parse is simply left out
  begin club := ((d->>'pd-myteam')::jsonb)->>'club'; exception when others then club := null; end;
  begin coins := case when d ? 'pd-wallet' then greatest(0, coalesce((((d->>'pd-wallet')::jsonb)->>'coins')::int, 0)) end; exception when others then coins := null; end;
  begin select count(*) into cards from jsonb_each_text(((d->>'pd-cards')::jsonb)->'owned') where value ~ '^[0-9]+$' and value::int > 0;
  exception when others then cards := null; end;
  return jsonb_build_object('username', nm, 'club', club, 'coins', coins, 'cards', cards,
    'rating', coalesce(r.rating, 1000), 'games', coalesce(r.games, 0), 'wins', coalesce(r.wins, 0), 'losses', coalesce(r.losses, 0));
end $$;
revoke all on function public.friend_profile(uuid) from public, anon;
grant execute on function public.friend_profile(uuid) to authenticated;
