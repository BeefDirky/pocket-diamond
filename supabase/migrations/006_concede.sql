-- Pocket Diamond migration 006: forfeiting a ranked game on purpose (the menu's Forfeit, or 90 seconds without
-- touching the game). The match ends at once as a forfeit win for the other player, so they don't wait out the
-- one-minute countdown. Run after 005_forfeit_1min.sql. Safe to run more than once.
create or replace function public.ranked_concede(p_match uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; side text;
begin
  select * into m from public.matches where id = p_match for update;
  if not found or me not in (m.home_user, coalesce(m.away_user, '00000000-0000-0000-0000-000000000000')) then raise exception 'not your match'; end if;
  if m.status <> 'live' then return public.ranked_info(p_match); end if;
  if m.away_user is null then raise exception 'no opponent'; end if;
  side := case when me = m.home_user then 'away' else 'home' end;   -- the winner: the other side
  update public.matches set status = 'forfeit', verified = true, winner_side = side, ended_at = now(),
         dispute_reason = 'forfeit: conceded' where id = p_match;
  update public.match_participants set result = case when user_id = me then 'L' else 'W' end where match_id = p_match;
  perform public.finalize_match(p_match);
  return public.ranked_info(p_match);
end $$;
revoke all on function public.ranked_concede(uuid) from public, anon;
grant execute on function public.ranked_concede(uuid) to authenticated;
