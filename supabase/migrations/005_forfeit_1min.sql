-- Pocket Diamond migration 005: a ranked opponent who leaves forfeits after 1 minute (was 3).
-- Run after 004_queue_wait.sql. Safe to run more than once. (The game pings every 15 seconds while you play.)
create or replace function public.ranked_claim(p_match uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; mine timestamptz; theirs timestamptz; side text;
begin
  select * into m from public.matches where id = p_match for update;
  if not found or me not in (m.home_user, coalesce(m.away_user, '00000000-0000-0000-0000-000000000000')) then raise exception 'not your match'; end if;
  if m.status <> 'live' then return public.ranked_info(p_match); end if;
  side := case when me = m.home_user then 'home' else 'away' end;
  select last_seen_at into mine   from public.match_participants where match_id = p_match and user_id = me;
  select last_seen_at into theirs from public.match_participants where match_id = p_match and user_id <> me;
  if m.started_at > now() - interval '1 minute' then raise exception 'too early to claim'; end if;
  if mine is null or mine < now() - interval '90 seconds' then raise exception 'you have not been here'; end if;
  if theirs is not null and theirs > now() - interval '1 minute' then raise exception 'your opponent is still here'; end if;
  if exists (select 1 from public.match_submissions where match_id = p_match and user_id <> me) then raise exception 'your opponent finished the game'; end if;
  update public.matches set status = 'forfeit', verified = true, winner_side = side, ended_at = now(),
         dispute_reason = 'forfeit: opponent left' where id = p_match;
  update public.match_participants set result = case when user_id = me then 'W' else 'L' end where match_id = p_match;
  perform public.finalize_match(p_match);
  return public.ranked_info(p_match);
end $$;
