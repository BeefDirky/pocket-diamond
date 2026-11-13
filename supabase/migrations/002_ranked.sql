-- Pocket Diamond migration 002: ranked match flow, self-reported games, log validation.
-- Run after 001_core.sql. Safe to run more than once.
--
-- These are Postgres functions the game calls with the player's own sign-in token. Inside them, auth.uid() is
-- the verified account id from that token, so a browser can't act as someone else. The functions do every
-- write; the tables themselves stay read-only for browsers (001).
--
--   ranked_open(home_club, away_club, innings, version)  host: open a ranked match            -> match id
--   ranked_join(match)                                    guest: join it; the server rolls the seed
--   ranked_info(match)                                    either player: seed, clubs, both usernames
--   ranked_ping(match)                                    every 30 s while playing (who is still here)
--   ranked_submit(match, hash, log, flags, version)       each phone at the end; counts when both agree
--   ranked_claim(match)                                   opponent gone for 3 min: win by forfeit
--   report_match(log, version)                            single player / casual: your own stat line, unverified

-- ============================================================ small schema additions
alter table public.match_participants add column if not exists last_seen_at timestamptz;
alter table public.match_submissions  add column if not exists flags jsonb not null default '[]'::jsonb;
alter table public.plate_appearances drop constraint if exists plate_appearances_runs_scored_check;
alter table public.plate_appearances add constraint plate_appearances_runs_scored_check check (runs_scored between 0 and 10);
alter table public.plate_appearances drop constraint if exists plate_appearances_rbi_check;
alter table public.plate_appearances add constraint plate_appearances_rbi_check check (rbi between 0 and 4);
alter table public.plate_appearances add column if not exists auto boolean not null default false;   -- the CPU played this one (AUTO)
-- a ranked match is opened by one player and joined by the other, so until then (or if nobody joins) it has one
alter table public.matches drop constraint if exists ranked_two_players;
alter table public.matches add constraint ranked_two_players check (mode not like 'ranked%' or (home_user is not null
  and (away_user is null or away_user <> home_user) and (away_user is not null or status in ('pending','abandoned'))));
create index if not exists match_subs_user_idx on public.match_submissions (user_id, submitted_at desc);

-- ============================================================ log validation
-- A log is the game's own record (src/js/23b-match-log.js, mlWire). Returns null when it holds together,
-- otherwise the first problem. Checks: shapes and ranges; every half-inning's runs equal the line score;
-- three outs in every half but the last; line totals equal the final score; plate appearances in order;
-- each PA's last pitch fits its result; and the game ended the way baseball games end.
create or replace function public.pd_validate_log(p_log jsonb, p_mode text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  pa jsonb; p jsonb; i int; n int; inn int; half text; prev_key int := 0; k int;
  sched int; fin jsonb; home int; away int; last_inn int; last_half text;
  runs_h int[]; runs_a int[]; outs_by jsonb := '{}'::jsonb; runs_by jsonb := '{}'::jsonb; hk text;
  res text; lastp text; total_h int := 0; total_a int := 0;
begin
  if jsonb_typeof(p_log) <> 'object' then return 'log is not an object'; end if;
  if (p_log->>'v')::int is distinct from 1 then return 'unknown log version'; end if;
  fin := p_log->'fin';
  if fin is null or jsonb_typeof(fin->'line'->'home') <> 'array' or jsonb_typeof(fin->'line'->'away') <> 'array' then return 'no final line'; end if;
  sched := (p_log->>'sched')::int; home := (fin->>'home')::int; away := (fin->>'away')::int;
  if sched is null or sched not between 1 and 20 then return 'bad scheduled innings'; end if;
  if home not between 0 and 99 or away not between 0 and 99 then return 'bad final score'; end if;
  if jsonb_typeof(p_log->'pa') <> 'array' then return 'no plate appearances'; end if;
  n := jsonb_array_length(p_log->'pa');
  if n > 600 then return 'too many plate appearances'; end if;
  if jsonb_array_length(fin->'line'->'home') > 30 or jsonb_array_length(fin->'line'->'away') > 30 then return 'line too long'; end if;
  select coalesce(array_agg(v::int order by o), '{}') into runs_h from jsonb_array_elements_text(fin->'line'->'home') with ordinality as t(v, o);
  select coalesce(array_agg(v::int order by o), '{}') into runs_a from jsonb_array_elements_text(fin->'line'->'away') with ordinality as t(v, o);
  select coalesce(sum(x), 0) into total_h from unnest(runs_h) x;
  select coalesce(sum(x), 0) into total_a from unnest(runs_a) x;
  -- (arcade: the CPU's score is posted before you bat, so it has no innings of its own)
  if total_h <> home or (total_a <> away and p_mode <> 'arcade') then return 'line score does not add up to the final'; end if;

  for i in 0 .. n - 1 loop
    pa := p_log->'pa'->i;
    inn := (pa->>'i')::int; half := pa->>'h'; res := pa->>'r';
    if inn is null or inn not between 1 and 30 or half not in ('top','bot') then return format('PA %s: bad inning', i); end if;
    if p_mode = 'arcade' and half <> 'bot' then return format('PA %s: arcade bats only in the bottom', i); end if;
    if (half = 'top') <> (pa->>'bs' = 'away') then return format('PA %s: wrong side batting', i); end if;
    k := inn * 2 + (half = 'bot')::int;
    if k < prev_key then return format('PA %s: out of order', i); end if;
    prev_key := k;
    if res not in ('1B','2B','3B','HR','BB','IBB','HBP','K','KL','GO','FO','LO','PO','SF','SH','E','FC','DP','OTHER') then return format('PA %s: unknown result', i); end if;
    if (pa->>'ob')::int not between 0 and 2 or (pa->>'bb')::int not between 0 and 7 or (pa->>'om')::int not between 0 and 3
       or (pa->>'rs')::int not between 0 and 10 or (pa->>'rbi')::int not between 0 and 4 or (pa->>'rbi')::int > (pa->>'rs')::int
       then return format('PA %s: count out of range', i); end if;
    if (pa->>'ob')::int + (pa->>'om')::int > 3 then return format('PA %s: more than three outs', i); end if;
    if res = 'HR' and (pa->>'rs')::int < 1 then return format('PA %s: home run with no run', i); end if;
    if res in ('K','KL','GO','FO','LO','PO','SF','SH','DP') and (pa->>'om')::int < 1 then return format('PA %s: out with no out', i); end if;
    if res = 'DP' and (pa->>'om')::int < 2 then return format('PA %s: double play with one out', i); end if;
    if length(pa->>'bk') > 40 or length(pa->>'pk') > 40 then return format('PA %s: bad player key', i); end if;
    if jsonb_typeof(pa->'p') <> 'array' or jsonb_array_length(pa->'p') > 40 then return format('PA %s: bad pitches', i); end if;
    lastp := null;
    for p in select * from jsonb_array_elements(pa->'p') loop
      if p->>0 not in ('FB','CH','SL','CB','KN','SP') then return format('PA %s: bad pitch type', i); end if;
      if p->>5 not in ('ball','called_strike','swinging_strike','foul','in_play','hbp') then return format('PA %s: bad pitch outcome', i); end if;
      lastp := p->>5;
    end loop;
    if res in ('1B','2B','3B','HR','GO','FO','LO','PO','SF','SH','E','FC','DP') and lastp is distinct from 'in_play' then return format('PA %s: ball in play without a pitch in play', i); end if;
    if res in ('K','KL') and lastp not in ('swinging_strike','called_strike','foul') then return format('PA %s: strikeout not on a strike', i); end if;
    if res = 'BB' and lastp is distinct from 'ball' then return format('PA %s: walk not on ball four', i); end if;
    if res = 'HBP' and lastp is distinct from 'hbp' then return format('PA %s: HBP without a hit batter', i); end if;
    hk := inn || half;
    outs_by := jsonb_set(outs_by, array[hk], to_jsonb(coalesce((outs_by->>hk)::int, 0) + (pa->>'om')::int));
    runs_by := jsonb_set(runs_by, array[hk], to_jsonb(coalesce((runs_by->>hk)::int, 0) + (pa->>'rs')::int));
    last_inn := inn; last_half := half;
  end loop;

  -- every half that saw a plate appearance: runs match the line, three outs unless it was the last one played
  for hk in select jsonb_object_keys(outs_by) loop
    inn := regexp_replace(hk, '\D', '', 'g')::int; half := regexp_replace(hk, '\d', '', 'g');
    if (runs_by->>hk)::int <> coalesce(case when half = 'top' then runs_a[inn] else runs_h[inn] end, 0) then
      return format('inning %s %s: runs do not match the line score', inn, half); end if;
    if (outs_by->>hk)::int > 3 then return format('inning %s %s: more than three outs', inn, half); end if;
    if (outs_by->>hk)::int < 3 and not (inn = last_inn and half = last_half) then
      return format('inning %s %s: ended without three outs', inn, half); end if;
  end loop;
  -- runs in the line with no plate appearances to score them
  for inn in 1 .. greatest(coalesce(array_length(runs_h, 1), 0), coalesce(array_length(runs_a, 1), 0)) loop
    if coalesce(runs_a[inn], 0) > 0 and runs_by->>(inn || 'top') is null then return format('inning %s top: runs without plate appearances', inn); end if;
    if coalesce(runs_h[inn], 0) > 0 and runs_by->>(inn || 'bot') is null then return format('inning %s bot: runs without plate appearances', inn); end if;
  end loop;

  -- how a two-team game may end (arcade has its own rules: the CPU's score is posted, you bat)
  if p_mode in ('full','casual','ranked_stock','ranked_custom') then
    if home = away then return 'a finished game can''t be tied'; end if;
    if last_inn is null then return 'no plate appearances'; end if;
    if last_inn < sched then return 'ended before the scheduled innings'; end if;
    if last_half = 'top' and not (home > away) then return 'ended after a top half with the visitors ahead'; end if;
    if last_half = 'top' and (outs_by->>(last_inn || 'top'))::int < 3 then return 'ended in the middle of a top half'; end if;
    if last_half = 'bot' and (outs_by->>(last_inn || 'bot'))::int < 3 and not (home > away) then return 'bottom half ended early without a walk-off'; end if;
    if last_half = 'bot' and (outs_by->>(last_inn || 'bot'))::int = 3 and home > away then return 'the game went on after the winning run'; end if;
  end if;
  return null;
exception when others then
  return 'malformed log: ' || sqlerrm;
end $$;

-- write a validated log's plate appearances and pitches (players: who to credit on each side)
create or replace function public.pd_write_log(p_match uuid, p_log jsonb, p_home uuid, p_away uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare pa jsonb; p jsonb; i int; j int; bat uuid; pit uuid; auto boolean;
begin
  for i in 0 .. jsonb_array_length(p_log->'pa') - 1 loop
    pa := p_log->'pa'->i;
    auto := coalesce((pa->>'auto')::int, 0) = 1;
    bat := case when auto then null when pa->>'bs' = 'home' then p_home else p_away end;
    pit := case when auto then null when pa->>'bs' = 'home' then p_away else p_home end;
    insert into public.plate_appearances (match_id, seq, inning, half, batting_side, batter_user, pitcher_user, batter_key, pitcher_key,
        outs_before, bases_before, result, rbi, runs_scored, outs_made, pitches, ev_mph, la_deg, spray_deg, auto)
    values (p_match, i, (pa->>'i')::int, pa->>'h', pa->>'bs', bat, pit, pa->>'bk', pa->>'pk',
        (pa->>'ob')::int, (pa->>'bb')::int, pa->>'r', (pa->>'rbi')::int, (pa->>'rs')::int, (pa->>'om')::int,
        jsonb_array_length(pa->'p'),
        case when (pa->>'ev')::real between 0 and 130 then (pa->>'ev')::real end,
        case when (pa->>'la')::real between -90 and 90 then (pa->>'la')::real end,
        case when (pa->>'sp')::real between -90 and 90 then (pa->>'sp')::real end, auto)
    on conflict do nothing;
    j := 0;
    for p in select * from jsonb_array_elements(pa->'p') loop
      insert into public.pitches (match_id, pa_seq, seq, pitch_type, mph, plate_x, in_zone, meter_q, outcome, swing_err_ms, stamina, wild)
      values (p_match, i, j, p->>0,
        case when (p->>1)::real between 30 and 115 then (p->>1)::real end,
        (p->>2)::real, (p->>3)::int = 1,
        case when (p->>4)::real between 0 and 1 then (p->>4)::real end,
        p->>5,
        case when (p->>6)::numeric between -2000 and 2000 then (p->>6)::numeric::smallint end,
        greatest(0, least(1, (p->>7)::real)), coalesce((p->>8)::int, 0) = 1)
      on conflict do nothing;
      j := j + 1;
    end loop;
  end loop;
end $$;

-- ============================================================ stats: OTHER (a PA cut short by a caught stealing / pickoff) isn't a PA
create or replace function public.apply_match_stats(p_match uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; seasons int[];
begin
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'match % not found', p_match; end if;
  if m.stats_applied_at is not null then return false; end if;
  if m.status not in ('final','forfeit','self_reported') then raise exception 'match % is %, not finished', p_match, m.status; end if;
  if m.mode like 'ranked%' and not m.verified then raise exception 'ranked match % is not verified', p_match; end if;
  seasons := case when m.season_id is null then array[0] else array[0, m.season_id] end;

  insert into public.player_stats as ps (user_id, mode, season_id, games, wins, losses, ties,
      pa, ab, h, b2, b3, hr, bb, hbp, so, sf, sh, rbi,
      bf, outs_pitched, h_allowed, hr_allowed, bb_allowed, so_pitched, runs_allowed, pitches_thrown)
  select u.user_id, m.mode, s.season_id,
         sum(u.games), sum(u.wins), sum(u.losses), sum(u.ties),
         sum(u.pa), sum(u.ab), sum(u.h), sum(u.b2), sum(u.b3), sum(u.hr), sum(u.bb), sum(u.hbp), sum(u.so), sum(u.sf), sum(u.sh), sum(u.rbi),
         sum(u.bf), sum(u.outs_pitched), sum(u.h_allowed), sum(u.hr_allowed), sum(u.bb_allowed), sum(u.so_pitched), sum(u.runs_allowed), sum(u.pitches_thrown)
  from (
    select mp.user_id,
           1 as games, (mp.result = 'W')::int as wins, (mp.result = 'L')::int as losses, (mp.result = 'T')::int as ties,
           0 pa,0 ab,0 h,0 b2,0 b3,0 hr,0 bb,0 hbp,0 so,0 sf,0 sh,0 rbi,0 bf,0 outs_pitched,0 h_allowed,0 hr_allowed,0 bb_allowed,0 so_pitched,0 runs_allowed,0 pitches_thrown
    from public.match_participants mp where mp.match_id = p_match and mp.user_id is not null
    union all
    select pa.batter_user, 0,0,0,0,
           (pa.result <> 'OTHER')::int,
           (pa.result not in ('BB','IBB','HBP','SF','SH','CI','OTHER'))::int,
           (pa.result in ('1B','2B','3B','HR'))::int, (pa.result = '2B')::int, (pa.result = '3B')::int, (pa.result = 'HR')::int,
           (pa.result in ('BB','IBB'))::int, (pa.result = 'HBP')::int, (pa.result in ('K','KL'))::int,
           (pa.result = 'SF')::int, (pa.result = 'SH')::int, pa.rbi,
           0,0,0,0,0,0,0,0
    from public.plate_appearances pa where pa.match_id = p_match and pa.batter_user is not null
    union all
    select pa.pitcher_user, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,
           (pa.result <> 'OTHER')::int, pa.outs_made, (pa.result in ('1B','2B','3B','HR'))::int, (pa.result = 'HR')::int,
           (pa.result in ('BB','IBB'))::int, (pa.result in ('K','KL'))::int, pa.runs_scored, pa.pitches
    from public.plate_appearances pa where pa.match_id = p_match and pa.pitcher_user is not null
  ) u
  cross join unnest(seasons) as s(season_id)
  group by u.user_id, s.season_id
  on conflict (user_id, mode, season_id) do update set
    games = ps.games + excluded.games, wins = ps.wins + excluded.wins, losses = ps.losses + excluded.losses, ties = ps.ties + excluded.ties,
    pa = ps.pa + excluded.pa, ab = ps.ab + excluded.ab, h = ps.h + excluded.h, b2 = ps.b2 + excluded.b2, b3 = ps.b3 + excluded.b3,
    hr = ps.hr + excluded.hr, bb = ps.bb + excluded.bb, hbp = ps.hbp + excluded.hbp, so = ps.so + excluded.so,
    sf = ps.sf + excluded.sf, sh = ps.sh + excluded.sh, rbi = ps.rbi + excluded.rbi,
    bf = ps.bf + excluded.bf, outs_pitched = ps.outs_pitched + excluded.outs_pitched, h_allowed = ps.h_allowed + excluded.h_allowed,
    hr_allowed = ps.hr_allowed + excluded.hr_allowed, bb_allowed = ps.bb_allowed + excluded.bb_allowed,
    so_pitched = ps.so_pitched + excluded.so_pitched, runs_allowed = ps.runs_allowed + excluded.runs_allowed,
    pitches_thrown = ps.pitches_thrown + excluded.pitches_thrown, updated_at = now();
  update public.matches set stats_applied_at = now() where id = p_match;
  return true;
end $$;

-- ============================================================ helpers
create or replace function public.pd_me() returns uuid language plpgsql stable set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'sign in first' using errcode = '28000'; end if;
  return u;
end $$;

-- live matches nobody has pinged in 15 minutes are abandoned (run lazily from the calls below)
create or replace function public.pd_sweep() returns void language sql security definer set search_path = '' as $$
  update public.matches m set status = 'abandoned', ended_at = now()
   where m.status in ('pending','live')
     and m.created_at < now() - interval '15 minutes'
     and not exists (select 1 from public.match_participants mp
                      where mp.match_id = m.id and mp.last_seen_at > now() - interval '15 minutes');
$$;

-- ============================================================ ranked flow
create or replace function public.ranked_open(p_home_club text, p_away_club text, p_innings int, p_version text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); sid int; mid uuid; recent int;
begin
  if not exists (select 1 from public.profiles where user_id = me) then raise exception 'choose a username first'; end if;
  if p_home_club !~ '^[a-z0-9_-]{1,32}$' or p_away_club !~ '^[a-z0-9_-]{1,32}$' or p_home_club = p_away_club then raise exception 'bad clubs'; end if;
  if p_innings not in (3, 6, 9) then raise exception 'ranked games are 3, 6 or 9 innings'; end if;
  select count(*) into recent from public.matches where home_user = me and created_at > now() - interval '1 minute';
  if recent >= 5 then raise exception 'too many ranked matches opened; wait a minute' using errcode = '53400'; end if;
  select count(*) into recent from public.matches where home_user = me and created_at > now() - interval '1 day';
  if recent >= 200 then raise exception 'daily ranked limit reached' using errcode = '53400'; end if;
  perform public.pd_sweep();
  -- your earlier unfinished opens are closed
  update public.matches set status = 'abandoned', ended_at = now() where home_user = me and status = 'pending';
  select id into sid from public.seasons where ladder = 'stock' and is_active;
  if sid is null then raise exception 'no active ranked season'; end if;
  insert into public.matches (mode, season_id, status, innings, home_user, home_club, away_club, client_version)
  values ('ranked_stock', sid, 'pending', p_innings, me, p_home_club, p_away_club, left(p_version, 32))
  returning id into mid;
  insert into public.match_participants (match_id, side, user_id, club, roster_kind, last_seen_at) values (mid, 'home', me, p_home_club, 'stock', now());
  return jsonb_build_object('match_id', mid);
end $$;

create or replace function public.ranked_join(p_match uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype;
begin
  if not exists (select 1 from public.profiles where user_id = me) then raise exception 'choose a username first'; end if;
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'no such match'; end if;
  if m.away_user = me and m.status = 'live' then return public.ranked_info(p_match); end if;   -- joining twice is fine
  if m.status <> 'pending' or m.away_user is not null then raise exception 'this match is not open'; end if;
  if m.home_user = me then raise exception 'you can''t play yourself'; end if;
  if m.created_at < now() - interval '10 minutes' then raise exception 'this match has expired'; end if;
  update public.matches set away_user = me, status = 'live', started_at = now(),
         seed = (floor(random() * 9007199254740991))::bigint
   where id = p_match;
  insert into public.match_participants (match_id, side, user_id, club, roster_kind, last_seen_at) values (p_match, 'away', me, m.away_club, 'stock', now())
  on conflict do nothing;
  update public.match_participants set last_seen_at = now() where match_id = p_match and side = 'home';
  return public.ranked_info(p_match);
end $$;

create or replace function public.ranked_info(p_match uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; r jsonb;
begin
  select * into m from public.matches where id = p_match;
  if not found or not (me = m.home_user or me is not distinct from m.away_user) then raise exception 'not your match'; end if;
  select jsonb_build_object('match_id', m.id, 'status', m.status, 'seed', m.seed::text, 'innings', m.innings,
           'home_club', m.home_club, 'away_club', m.away_club, 'home_user', m.home_user, 'away_user', m.away_user,
           'home_name', (select username from public.profiles where user_id = m.home_user),
           'away_name', (select username from public.profiles where user_id = m.away_user),
           'winner_side', m.winner_side, 'home_score', m.home_score, 'away_score', m.away_score, 'dispute', m.dispute_reason,
           'me', case when me = m.home_user then 'home' else 'away' end,
           'rating_before', (select rating_before from public.match_participants where match_id = m.id and user_id = me),
           'rating_after',  (select rating_after  from public.match_participants where match_id = m.id and user_id = me))
    into r;
  return r;
end $$;

create or replace function public.ranked_ping(p_match uuid) returns void
language sql security definer set search_path = '' as $$
  update public.match_participants set last_seen_at = now()
   where match_id = p_match and user_id = public.pd_me()
     and exists (select 1 from public.matches where id = p_match and status in ('pending','live'));
$$;

-- settle a match whose two submissions are in (inside the caller's transaction, match row already locked)
create or replace function public.pd_settle(p_match uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; h public.match_submissions%rowtype; a public.match_submissions%rowtype; why text; win text;
begin
  select * into m from public.matches where id = p_match;
  select * into h from public.match_submissions where match_id = p_match and side = 'home';
  select * into a from public.match_submissions where match_id = p_match and side = 'away';
  if h.match_id is null or a.match_id is null then return; end if;
  if h.log_hash <> a.log_hash then why := 'the two phones recorded different games';
  elsif jsonb_array_length(h.flags) > 0 then why := 'the home phone''s checks failed: ' || left(h.flags::text, 200);
  elsif jsonb_array_length(a.flags) > 0 then why := 'the away phone''s checks failed: ' || left(a.flags::text, 200);
  elsif h.log->>'home' <> m.home_club or h.log->>'away' <> m.away_club then why := 'clubs differ from the match';
  elsif (h.log->>'sched')::int <> m.innings then why := 'innings differ from the match';
  elsif exists (select 1 from jsonb_array_elements(h.log->'pa') x where coalesce((x->>'auto')::int, 0) = 1) then why := 'AUTO was used';
  else why := public.pd_validate_log(h.log, m.mode);
  end if;
  if why is not null then
    update public.matches set status = 'disputed', dispute_reason = left(why, 300), ended_at = now(),
           home_score = h.home_score, away_score = h.away_score where id = p_match;
    return;
  end if;
  win := case when h.home_score > h.away_score then 'home' else 'away' end;
  update public.matches set status = 'final', verified = true, home_score = h.home_score, away_score = h.away_score,
         winner_side = win, log_hash = h.log_hash, ended_at = now() where id = p_match;
  update public.match_participants set result = case when side = win then 'W' else 'L' end,
         runs_for = case when side = 'home' then h.home_score else h.away_score end,
         runs_against = case when side = 'home' then h.away_score else h.home_score end
   where match_id = p_match;
  perform public.pd_write_log(p_match, h.log, m.home_user, m.away_user);
  perform public.finalize_match(p_match);
end $$;

create or replace function public.ranked_submit(p_match uuid, p_hash text, p_log jsonb, p_flags jsonb default '[]'::jsonb, p_version text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); m public.matches%rowtype; side text; last timestamptz;
begin
  select * into m from public.matches where id = p_match for update;     -- one settlement at a time
  if not found or me not in (m.home_user, coalesce(m.away_user, '00000000-0000-0000-0000-000000000000')) then raise exception 'not your match'; end if;
  side := case when me = m.home_user then 'home' else 'away' end;
  if m.status in ('live') then
    if pg_column_size(p_log) > 400000 then raise exception 'log too large'; end if;
    if p_hash !~ '^[0-9a-f]{16,128}$' then raise exception 'bad hash'; end if;
    select max(submitted_at) into last from public.match_submissions where user_id = me;
    if last > now() - interval '3 seconds' and not exists (select 1 from public.match_submissions where match_id = p_match and user_id = me)
      then raise exception 'slow down' using errcode = '53400'; end if;
    insert into public.match_submissions (match_id, user_id, side, log_hash, home_score, away_score, log, flags, client_version)
    values (p_match, me, side, p_hash, coalesce((p_log->'fin'->>'home')::int, 0), coalesce((p_log->'fin'->>'away')::int, 0), p_log,
            case when jsonb_typeof(p_flags) = 'array' then p_flags else '[]'::jsonb end, left(p_version, 32))
    on conflict (match_id, user_id) do nothing;                          -- a second submit changes nothing
    update public.match_participants set last_seen_at = now() where match_id = p_match and user_id = me;
    perform public.pd_settle(p_match);
  end if;
  return public.ranked_info(p_match)
         || jsonb_build_object('submitted', (select count(*) from public.match_submissions where match_id = p_match));
end $$;

-- the opponent has been gone (no ping) for 3 minutes while you're still here: the match is yours by forfeit.
-- A forfeit counts for wins and rating but writes no batting lines (only one phone's record exists).
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
  if m.started_at > now() - interval '2 minutes' then raise exception 'too early to claim'; end if;
  if mine is null or mine < now() - interval '90 seconds' then raise exception 'you have not been here'; end if;
  if theirs is not null and theirs > now() - interval '3 minutes' then raise exception 'your opponent is still here'; end if;
  if exists (select 1 from public.match_submissions where match_id = p_match and user_id <> me) then raise exception 'your opponent finished the game'; end if;
  update public.matches set status = 'forfeit', verified = true, winner_side = side, ended_at = now(),
         dispute_reason = 'forfeit: opponent left' where id = p_match;
  update public.match_participants set result = case when user_id = me then 'W' else 'L' end where match_id = p_match;
  perform public.finalize_match(p_match);
  return public.ranked_info(p_match);
end $$;

-- ============================================================ self-reported games (single player, casual online)
-- Unverified: they feed your own profile lines (by mode) and analytics, never a leaderboard.
create or replace function public.report_match(p_log jsonb, p_version text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); md text := p_log->>'mode'; side text := coalesce(p_log->>'me', 'home'); why text; mid uuid; last timestamptz;
        h int; a int; win text;
begin
  if md not in ('arcade','full','playoffs','casual') then raise exception 'not a reportable mode'; end if;
  if side not in ('home','away') then raise exception 'bad side'; end if;
  if pg_column_size(p_log) > 400000 then raise exception 'log too large'; end if;
  select max(created_at) into last from public.matches where status = 'self_reported' and (home_user = me or away_user = me);
  if last > now() - interval '20 seconds' then raise exception 'slow down' using errcode = '53400'; end if;
  if (select count(*) from public.matches where status = 'self_reported' and (home_user = me or away_user = me)
        and created_at > now() - interval '1 day') >= 300 then raise exception 'daily limit reached' using errcode = '53400'; end if;
  why := public.pd_validate_log(p_log, md);
  if why is not null then raise exception 'log rejected: %', why; end if;
  if (p_log->>'home') !~ '^[a-z0-9_-]{1,32}$' or (p_log->>'away') !~ '^[a-z0-9_-]{1,32}$' then raise exception 'bad clubs'; end if;
  h := (p_log->'fin'->>'home')::int; a := (p_log->'fin'->>'away')::int;
  win := case when h > a then 'home' when a > h then 'away' else 'tie' end;
  insert into public.matches (mode, status, innings, home_user, away_user, home_club, away_club, home_score, away_score, winner_side,
                              client_version, started_at, ended_at)
  values (md, 'self_reported', (p_log->>'sched')::int,
          case when side = 'home' then me end, case when side = 'away' then me end,
          p_log->>'home', p_log->>'away', h, a, win, left(p_version, 32),
          now() - make_interval(secs => least(greatest(coalesce((p_log->>'secs')::int, 0), 0), 86400)), now())
  returning id into mid;
  insert into public.match_participants (match_id, side, user_id, club, roster_kind, result, runs_for, runs_against) values
    (mid, 'home', case when side = 'home' then me end, p_log->>'home', 'custom', case win when 'home' then 'W' when 'away' then 'L' else 'T' end, h, a),
    (mid, 'away', case when side = 'away' then me end, p_log->>'away', 'custom', case win when 'away' then 'W' when 'home' then 'L' else 'T' end, a, h);
  perform public.pd_write_log(mid, p_log, case when side = 'home' then me end, case when side = 'away' then me end);
  perform public.finalize_match(mid);
  return jsonb_build_object('match_id', mid);
end $$;

-- ============================================================ who may call what
revoke all on function public.pd_validate_log(jsonb, text), public.pd_write_log(uuid, jsonb, uuid, uuid), public.pd_settle(uuid),
                       public.pd_sweep(), public.pd_me() from public, anon, authenticated;
grant execute on function public.pd_validate_log(jsonb, text), public.pd_write_log(uuid, jsonb, uuid, uuid), public.pd_settle(uuid),
                          public.pd_sweep(), public.pd_me() to service_role;
revoke all on function public.ranked_open(text, text, int, text), public.ranked_join(uuid), public.ranked_info(uuid), public.ranked_ping(uuid),
                       public.ranked_submit(uuid, text, jsonb, jsonb, text), public.ranked_claim(uuid), public.report_match(jsonb, text)
  from public, anon;
grant execute on function public.ranked_open(text, text, int, text), public.ranked_join(uuid), public.ranked_info(uuid), public.ranked_ping(uuid),
                          public.ranked_submit(uuid, text, jsonb, jsonb, text), public.ranked_claim(uuid), public.report_match(jsonb, text)
  to authenticated, service_role;
