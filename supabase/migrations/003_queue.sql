-- Pocket Diamond migration 003: ranked matchmaking queue, and a flat ±100 rating for now.
-- Run after 002_ranked.sql. Safe to run more than once.
--
--   queue_join(club, clubs, version)  enter the queue (pairs you at once if someone is waiting)
--   queue_poll()                      every 2 s while waiting: still waiting, or the match you were put in
--   queue_leave()                     cancel
-- Ranked games from the queue are 3 innings, you bat and pitch, both clubs on their own rosters. Two players are only
-- paired when they run the same build of the game (the online game needs both phones to compute identically).

create table if not exists public.ranked_queue (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  club       text not null check (club ~ '^[a-z0-9_-]{1,32}$'),
  clubs      text[] not null,                    -- the clubs you'd also play as, in order, if your rival has yours
  version    text not null check (length(version) <= 32),
  joined_at  timestamptz not null default now(),
  polled_at  timestamptz not null default now(),
  match_id   uuid references public.matches(id) on delete set null,
  side       text check (side in ('home','away'))
);
create index if not exists ranked_queue_wait_idx on public.ranked_queue (version, joined_at) where match_id is null;
alter table public.ranked_queue enable row level security;          -- no policies: only the functions below touch it
revoke all on public.ranked_queue from anon, authenticated;

-- try to pair player p with the longest-waiting compatible player (call with nothing locked)
create or replace function public.pd_queue_pair(p uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare me public.ranked_queue%rowtype; opp public.ranked_queue%rowtype; sid int; mid uuid; away_club text;
begin
  select * into me from public.ranked_queue where user_id = p and match_id is null for update skip locked;
  if not found then return null; end if;                              -- already paired (or being paired right now)
  select * into opp from public.ranked_queue
   where user_id <> p and match_id is null and version = me.version and polled_at > now() - interval '20 seconds'
   order by joined_at limit 1 for update skip locked;
  if not found then return null; end if;
  select id into sid from public.seasons where ladder = 'stock' and is_active;
  if sid is null then return null; end if;
  -- the player who waited longer is home and keeps his club; the other takes his own, or his next choice if they match
  select c into away_club from unnest(array[me.club] || me.clubs) with ordinality as t(c, o)
   where c <> opp.club and c ~ '^[a-z0-9_-]{1,32}$' order by o limit 1;
  if away_club is null then return null; end if;
  insert into public.matches (mode, season_id, status, verified, seed, innings, home_user, away_user, home_club, away_club,
                              client_version, started_at)
  values ('ranked_stock', sid, 'live', false, (floor(random() * 9007199254740991))::bigint, 3, opp.user_id, p,
          opp.club, away_club, left(me.version, 32), now())
  returning id into mid;
  insert into public.match_participants (match_id, side, user_id, club, roster_kind, last_seen_at) values
    (mid, 'home', opp.user_id, opp.club, 'stock', now()), (mid, 'away', p, away_club, 'stock', now());
  update public.ranked_queue set match_id = mid, side = 'home' where user_id = opp.user_id;
  update public.ranked_queue set match_id = mid, side = 'away' where user_id = p;
  return mid;
end $$;

-- what a waiting player hears back
create or replace function public.pd_queue_state(p uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare q public.ranked_queue%rowtype; n int;
begin
  select * into q from public.ranked_queue where user_id = p;
  if not found then return jsonb_build_object('queue', 'gone'); end if;
  if q.match_id is not null then
    delete from public.ranked_queue where user_id = p;
    return jsonb_build_object('queue', 'matched', 'info', public.ranked_info(q.match_id));
  end if;
  select count(*) into n from public.ranked_queue where match_id is null and version = q.version and polled_at > now() - interval '20 seconds';
  return jsonb_build_object('queue', 'waiting', 'waiting', n, 'since', q.joined_at);
end $$;

create or replace function public.queue_join(p_club text, p_clubs text[], p_version text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me();
begin
  if not exists (select 1 from public.profiles where user_id = me) then raise exception 'choose a username first'; end if;
  if p_club !~ '^[a-z0-9_-]{1,32}$' then raise exception 'bad club'; end if;
  if p_version is null or length(p_version) > 32 then raise exception 'bad version'; end if;
  if coalesce(array_length(p_clubs, 1), 0) > 20 then raise exception 'too many clubs'; end if;
  -- people who stopped polling have left the queue
  delete from public.ranked_queue where match_id is null and polled_at < now() - interval '20 seconds';
  insert into public.ranked_queue (user_id, club, clubs, version)
  values (me, p_club, coalesce(p_clubs, '{}'), p_version)
  on conflict (user_id) do update set club = excluded.club, clubs = excluded.clubs, version = excluded.version,
         joined_at = now(), polled_at = now(), match_id = null, side = null;
  perform public.pd_queue_pair(me);
  return public.pd_queue_state(me);
end $$;

create or replace function public.queue_poll() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me();
begin
  update public.ranked_queue set polled_at = now() where user_id = me;
  perform public.pd_queue_pair(me);
  return public.pd_queue_state(me);
end $$;

create or replace function public.queue_leave() returns void
language sql security definer set search_path = '' as $$
  delete from public.ranked_queue where user_id = public.pd_me() and match_id is null;
$$;

-- ============================================================ rating: a flat ±100 for now (starts at 1000, never below 0)
-- A 4th+ win against the same opponent in one day still earns nothing, so two accounts can't farm each other.
create or replace function public.apply_ranked_rating(p_match uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; h public.ratings%rowtype; a public.ratings%rowtype;
        sh numeric; dh int; da int; farmed boolean;
begin
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'match % not found', p_match; end if;
  if m.rating_applied_at is not null then return false; end if;
  if m.mode not like 'ranked%' or not m.verified or m.status not in ('final','forfeit') then
    raise exception 'match % is not a verified, finished ranked match', p_match; end if;
  insert into public.ratings (user_id, season_id) values (m.home_user, m.season_id), (m.away_user, m.season_id)
  on conflict do nothing;
  perform 1 from public.ratings where season_id = m.season_id and user_id in (m.home_user, m.away_user)
    order by user_id for update;
  select * into h from public.ratings where user_id = m.home_user and season_id = m.season_id;
  select * into a from public.ratings where user_id = m.away_user and season_id = m.season_id;
  sh := case m.winner_side when 'home' then 1 when 'away' then 0 else 0.5 end;
  select count(*) >= 3 into farmed from public.matches x
   where x.id <> m.id and x.verified and x.mode = m.mode and x.ended_at > now() - interval '1 day'
     and x.rating_applied_at is not null
     and ((x.home_user = m.home_user and x.away_user = m.away_user) or (x.home_user = m.away_user and x.away_user = m.home_user));
  dh := case when farmed then 0 when sh = 1 then 100 when sh = 0 then -100 else 0 end;
  da := -dh;
  dh := greatest(-h.rating, dh); da := greatest(-a.rating, da);         -- never below 0
  update public.ratings set rating = h.rating + dh, peak = greatest(peak, h.rating + dh), games = games + 1,
         wins = wins + (sh = 1)::int, losses = losses + (sh = 0)::int, last_match_at = now()
   where user_id = m.home_user and season_id = m.season_id;
  update public.ratings set rating = a.rating + da, peak = greatest(peak, a.rating + da), games = games + 1,
         wins = wins + (sh = 0)::int, losses = losses + (sh = 1)::int, last_match_at = now()
   where user_id = m.away_user and season_id = m.season_id;
  insert into public.rating_history (match_id, user_id, season_id, before, after) values
    (p_match, m.home_user, m.season_id, h.rating, h.rating + dh),
    (p_match, m.away_user, m.season_id, a.rating, a.rating + da)
  on conflict do nothing;
  update public.match_participants set rating_before = h.rating, rating_after = h.rating + dh where match_id = p_match and side = 'home';
  update public.match_participants set rating_before = a.rating, rating_after = a.rating + da where match_id = p_match and side = 'away';
  update public.matches set rating_applied_at = now() where id = p_match;
  return true;
end $$;

-- your current rating (1000 until your first ranked game)
create or replace function public.my_rating() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('rating', coalesce(r.rating, 1000), 'games', coalesce(r.games, 0), 'wins', coalesce(r.wins, 0), 'losses', coalesce(r.losses, 0))
  from public.seasons s left join public.ratings r on r.season_id = s.id and r.user_id = public.pd_me()
  where s.ladder = 'stock' and s.is_active;
$$;

revoke all on function public.pd_queue_pair(uuid), public.pd_queue_state(uuid) from public, anon, authenticated;
grant execute on function public.pd_queue_pair(uuid), public.pd_queue_state(uuid) to service_role;
revoke all on function public.queue_join(text, text[], text), public.queue_poll(), public.queue_leave(), public.my_rating() from public, anon;
grant execute on function public.queue_join(text, text[], text), public.queue_poll(), public.queue_leave(), public.my_rating() to authenticated, service_role;
revoke all on function public.apply_ranked_rating(uuid) from public, anon, authenticated;
grant execute on function public.apply_ranked_rating(uuid) to service_role;
