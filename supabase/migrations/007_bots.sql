-- Pocket Diamond migration 007: ranked bots, and the lower-rated player hosts.
-- Run after 006_concede.sql. Safe to run more than once.
--
-- If nobody is paired with you within 15 seconds of joining the ranked queue, the game asks for a bot (queue_bot):
-- the server opens a 'ranked_bot' match against a CPU club whose level follows your rating (higher rating, harder
-- bot). Bot games count for rating (a flat ±100, never below 0, like human games) but keep their own stat lines
-- (mode 'ranked_bot'), so the leaderboard's HR and AVG still come from games against people.
-- Only your phone records a bot game, so the server can't cross-check it the way it does two phones; it checks the
-- record is a real, finished, consistent game (pd_validate_log), that the clubs and innings match, and that it took a
-- believable amount of time. Leaving a bot game counts as a loss.
--
-- Human pairings: the player with the LOWER rating is home (ties: whoever waited longer, as before).

-- ---------------------------------------------------------------- the new match kind
alter table public.matches add column if not exists bot_level smallint check (bot_level is null or bot_level between 1 and 10);
alter table public.matches drop constraint if exists matches_mode_check;
alter table public.matches add constraint matches_mode_check
  check (mode in ('arcade','full','playoffs','casual','ranked_stock','ranked_custom','ranked_bot'));
alter table public.matches drop constraint if exists ranked_two_players;
alter table public.matches add constraint ranked_two_players
  check (mode not in ('ranked_stock','ranked_custom') or (home_user is not null
  and (away_user is null or away_user <> home_user) and (away_user is not null or status in ('pending','abandoned'))));
alter table public.matches drop constraint if exists ranked_bot_one_player;
alter table public.matches add constraint ranked_bot_one_player
  check (mode <> 'ranked_bot' or (bot_level is not null and ((home_user is null) <> (away_user is null))));
alter table public.matches drop constraint if exists verified_only_online;
alter table public.matches add constraint verified_only_online
  check (not verified or mode in ('casual','ranked_stock','ranked_custom','ranked_bot'));
alter table public.player_stats drop constraint if exists player_stats_mode_check;
alter table public.player_stats add constraint player_stats_mode_check
  check (mode in ('arcade','full','playoffs','casual','ranked_stock','ranked_custom','ranked_bot'));

-- your rating this season (1000 before your first ranked game)
create or replace function public.pd_rating_of(p uuid) returns int
language sql stable security definer set search_path = '' as $$
  select coalesce((select r.rating from public.ratings r join public.seasons s on s.id = r.season_id
                    where r.user_id = p and s.ladder = 'stock' and s.is_active), 1000);
$$;

-- the bot's level for a rating: 1000 (where everyone starts) is level 3; every 150 points is a level; 1 to 10
create or replace function public.pd_bot_level(p_rating int) returns int
language sql immutable set search_path = '' as $$
  select greatest(1, least(10, 3 + floor((p_rating - 1000) / 150.0)::int));
$$;

-- ---------------------------------------------------------------- rating for a bot game (only the person's side moves)
create or replace function public.apply_bot_rating(p_match uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; me uuid; side text; r public.ratings%rowtype; won boolean; d int;
begin
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'match % not found', p_match; end if;
  if m.rating_applied_at is not null then return false; end if;
  if m.mode <> 'ranked_bot' or not m.verified or m.status not in ('final','forfeit') then
    raise exception 'match % is not a finished bot match', p_match; end if;
  me := coalesce(m.home_user, m.away_user); side := case when m.home_user is not null then 'home' else 'away' end;
  insert into public.ratings (user_id, season_id) values (me, m.season_id) on conflict do nothing;
  select * into r from public.ratings where user_id = me and season_id = m.season_id for update;
  won := m.winner_side = side;
  d := case when won then 100 else greatest(-r.rating, -100) end;
  update public.ratings set rating = r.rating + d, peak = greatest(peak, r.rating + d), games = games + 1,
         wins = wins + won::int, losses = losses + (not won)::int, last_match_at = now()
   where user_id = me and season_id = m.season_id;
  insert into public.rating_history (match_id, user_id, season_id, before, after) values (p_match, me, m.season_id, r.rating, r.rating + d)
  on conflict do nothing;
  update public.match_participants set rating_before = r.rating, rating_after = r.rating + d where match_id = p_match and user_id = me;
  update public.matches set rating_applied_at = now() where id = p_match;
  return true;
end $$;

create or replace function public.finalize_match(p_match uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; st boolean := false; rt boolean := false;
begin
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'match % not found', p_match; end if;
  if m.status in ('final','forfeit','self_reported') then
    st := public.apply_match_stats(p_match);
    if m.mode = 'ranked_bot' and m.verified then rt := public.apply_bot_rating(p_match);
    elsif m.mode like 'ranked%' and m.verified then rt := public.apply_ranked_rating(p_match); end if;
  end if;
  return jsonb_build_object('stats', st, 'rating', rt);
end $$;

-- a bot game you walked away from is a loss (checked whenever you queue or ask for a bot)
create or replace function public.pd_bot_close(p uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare mid uuid;
begin
  for mid in select id from public.matches
              where mode = 'ranked_bot' and p in (home_user, away_user) and rating_applied_at is null
                and (status = 'live' or (status = 'abandoned' and started_at is not null)) for update loop
    update public.matches set status = 'forfeit', verified = true, ended_at = coalesce(ended_at, now()), dispute_reason = 'forfeit: left a bot game',
           winner_side = case when home_user = p then 'away' else 'home' end where id = mid;
    update public.match_participants set result = case when user_id = p then 'L' else 'W' end where match_id = mid;
    perform public.finalize_match(mid);
  end loop;
end $$;

-- ---------------------------------------------------------------- what the game sees about a match (now with bots)
create or replace function public.ranked_info(p_match uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; r jsonb; bot text;
begin
  select * into m from public.matches where id = p_match;
  if not found or not (me is not distinct from m.home_user or me is not distinct from m.away_user) then raise exception 'not your match'; end if;
  bot := case when m.mode = 'ranked_bot' then 'CPU · LV ' || m.bot_level end;
  select jsonb_build_object('match_id', m.id, 'status', m.status, 'seed', m.seed::text, 'innings', m.innings, 'mode', m.mode,
           'bot_level', m.bot_level,
           'home_club', m.home_club, 'away_club', m.away_club, 'home_user', m.home_user, 'away_user', m.away_user,
           'home_name', coalesce((select username from public.profiles where user_id = m.home_user), bot),
           'away_name', coalesce((select username from public.profiles where user_id = m.away_user), bot),
           'winner_side', m.winner_side, 'home_score', m.home_score, 'away_score', m.away_score, 'dispute', m.dispute_reason,
           'me', case when me = m.home_user then 'home' else 'away' end,
           'rating_before', (select rating_before from public.match_participants where match_id = m.id and user_id = me),
           'rating_after',  (select rating_after  from public.match_participants where match_id = m.id and user_id = me))
    into r;
  return r;
end $$;

-- ---------------------------------------------------------------- 15 seconds and nobody: play a bot
-- p_bot_club: the club the bot plays as (the game picks one that isn't yours). Returns the queue's usual answer:
-- {queue:'matched', info} (a person may have been paired with you a moment earlier: then that's the match),
-- or {queue:'waiting'} if it's too early.
create or replace function public.queue_bot(p_bot_club text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); q public.ranked_queue%rowtype; sid int; mid uuid; rt int; lv int;
begin
  if p_bot_club !~ '^[a-z0-9_-]{1,32}$' then raise exception 'bad club'; end if;
  select * into q from public.ranked_queue where user_id = me for update;
  if not found then return jsonb_build_object('queue', 'gone'); end if;
  if q.match_id is not null then return public.pd_queue_state(me); end if;            -- a person got you first
  if q.joined_at > now() - interval '15 seconds' then return public.pd_queue_state(me); end if;
  if p_bot_club = q.club then raise exception 'the bot needs a different club'; end if;
  perform public.pd_bot_close(me);
  select id into sid from public.seasons where ladder = 'stock' and is_active;
  if sid is null then raise exception 'no active ranked season'; end if;
  rt := public.pd_rating_of(me); lv := public.pd_bot_level(rt);
  -- the lower rating hosts; the bot is rated the same as you, so you're home
  insert into public.matches (mode, season_id, status, verified, seed, innings, home_user, away_user, home_club, away_club,
                              client_version, started_at, bot_level)
  values ('ranked_bot', sid, 'live', false, (floor(random() * 9007199254740991))::bigint, 3, me, null, q.club, p_bot_club,
          left(q.version, 32), now(), lv)
  returning id into mid;
  insert into public.match_participants (match_id, side, user_id, club, roster_kind, last_seen_at) values
    (mid, 'home', me, q.club, 'stock', now()), (mid, 'away', null, p_bot_club, 'stock', null);
  delete from public.ranked_queue where user_id = me;
  -- (not counted in the queue's wait estimate: that's about finding a person)
  return jsonb_build_object('queue', 'matched', 'info', public.ranked_info(mid));
end $$;

-- ---------------------------------------------------------------- the bot game's result (from your phone)
create or replace function public.bot_submit(p_match uuid, p_log jsonb, p_version text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; why text; h int; a int; win text; my_side text;
begin
  select * into m from public.matches where id = p_match for update;
  if not found or m.mode <> 'ranked_bot' or me is distinct from coalesce(m.home_user, m.away_user) then raise exception 'not your bot match'; end if;
  if m.status <> 'live' then return public.ranked_info(p_match); end if;                -- already settled
  if pg_column_size(p_log) > 400000 then raise exception 'log too large'; end if;
  my_side := case when m.home_user is not null then 'home' else 'away' end;
  if m.started_at > now() - interval '90 seconds' then why := 'finished impossibly fast';
  elsif p_log->>'home' <> m.home_club or p_log->>'away' <> m.away_club then why := 'clubs differ from the match';
  elsif (p_log->>'sched')::int <> m.innings then why := 'innings differ from the match';
  elsif p_log->>'me' is distinct from my_side then why := 'wrong side';
  else why := public.pd_validate_log(p_log, 'ranked_stock');
  end if;
  if why is not null then
    update public.matches set status = 'disputed', dispute_reason = left(why, 300), ended_at = now() where id = p_match;
    return public.ranked_info(p_match);
  end if;
  h := (p_log->'fin'->>'home')::int; a := (p_log->'fin'->>'away')::int; win := case when h > a then 'home' else 'away' end;
  update public.matches set status = 'final', verified = true, home_score = h, away_score = a, winner_side = win, ended_at = now(),
         client_version = coalesce(left(p_version, 32), client_version) where id = p_match;
  update public.match_participants set result = case when match_participants.side = win then 'W' else 'L' end,
         runs_for = case when match_participants.side = 'home' then h else a end, runs_against = case when match_participants.side = 'home' then a else h end
   where match_id = p_match;
  perform public.pd_write_log(p_match, p_log, m.home_user, m.away_user);
  perform public.finalize_match(p_match);
  return public.ranked_info(p_match);
end $$;

-- ---------------------------------------------------------------- conceding works for bot games too
create or replace function public.ranked_concede(p_match uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; side text;
begin
  select * into m from public.matches where id = p_match for update;
  if not found or not (me is not distinct from m.home_user or me is not distinct from m.away_user) then raise exception 'not your match'; end if;
  if m.status <> 'live' then return public.ranked_info(p_match); end if;
  if m.mode <> 'ranked_bot' and m.away_user is null then raise exception 'no opponent'; end if;
  side := case when me = m.home_user then 'away' else 'home' end;   -- the winner: the other side
  update public.matches set status = 'forfeit', verified = true, winner_side = side, ended_at = now(),
         dispute_reason = 'forfeit: conceded' where id = p_match;
  update public.match_participants set result = case when user_id = me then 'L' else 'W' end where match_id = p_match;
  perform public.finalize_match(p_match);
  return public.ranked_info(p_match);
end $$;

-- ---------------------------------------------------------------- pairing two people: the lower rating hosts
create or replace function public.pd_queue_pair(p uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare me public.ranked_queue%rowtype; opp public.ranked_queue%rowtype; sid int; mid uuid;
        h public.ranked_queue%rowtype; a public.ranked_queue%rowtype; a_club text;
begin
  select * into me from public.ranked_queue where user_id = p and match_id is null for update skip locked;
  if not found then return null; end if;
  select * into opp from public.ranked_queue
   where user_id <> p and match_id is null and version = me.version and polled_at > now() - interval '20 seconds'
   order by joined_at limit 1 for update skip locked;
  if not found then return null; end if;
  select id into sid from public.seasons where ladder = 'stock' and is_active;
  if sid is null then return null; end if;
  -- (opp joined earlier, so on equal ratings opp hosts, as before)
  if public.pd_rating_of(me.user_id) < public.pd_rating_of(opp.user_id) then h := me; a := opp; else h := opp; a := me; end if;
  select c into a_club from unnest(array[a.club] || a.clubs) with ordinality as t(c, o)
   where c <> h.club and c ~ '^[a-z0-9_-]{1,32}$' order by o limit 1;
  if a_club is null then return null; end if;
  insert into public.matches (mode, season_id, status, verified, seed, innings, home_user, away_user, home_club, away_club,
                              client_version, started_at)
  values ('ranked_stock', sid, 'live', false, (floor(random() * 9007199254740991))::bigint, 3, h.user_id, a.user_id,
          h.club, a_club, left(me.version, 32), now())
  returning id into mid;
  insert into public.match_participants (match_id, side, user_id, club, roster_kind, last_seen_at) values
    (mid, 'home', h.user_id, h.club, 'stock', now()), (mid, 'away', a.user_id, a_club, 'stock', now());
  update public.ranked_queue set match_id = mid, side = 'home' where user_id = h.user_id;
  update public.ranked_queue set match_id = mid, side = 'away' where user_id = a.user_id;
  insert into public.ranked_queue_waits (wait_secs) values
    (greatest(0, extract(epoch from now() - opp.joined_at))::int), (greatest(0, extract(epoch from now() - me.joined_at))::int);
  delete from public.ranked_queue_waits where matched_at < now() - interval '7 days';
  return mid;
end $$;

revoke all on function public.pd_rating_of(uuid), public.apply_bot_rating(uuid), public.pd_bot_close(uuid), public.finalize_match(uuid),
                       public.pd_queue_pair(uuid) from public, anon, authenticated;
grant execute on function public.pd_rating_of(uuid), public.apply_bot_rating(uuid), public.pd_bot_close(uuid), public.finalize_match(uuid),
                          public.pd_queue_pair(uuid) to service_role;
revoke all on function public.queue_bot(text), public.bot_submit(uuid, jsonb, text), public.ranked_concede(uuid), public.ranked_info(uuid) from public, anon;
grant execute on function public.queue_bot(text), public.bot_submit(uuid, jsonb, text), public.ranked_concede(uuid), public.ranked_info(uuid) to authenticated, service_role;
