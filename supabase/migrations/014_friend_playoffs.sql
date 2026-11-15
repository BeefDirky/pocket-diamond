-- Pocket Diamond migration 014: friends playoffs (an 8-club bracket you play live with your friends).
-- Run after 013_friend_invites.sql. Safe to run more than once.
--
-- The host makes a playoff, invites friends, and presses START. Empty spots fill with CPU clubs. Seeds come from ranked
-- ratings (bots get ratings near the players'), 1 v 8, 4 v 5, 2 v 7, 3 v 6. Quarterfinals and semifinals are best of 3,
-- the final best of 5; every game is 3 innings, the higher seed at home. Two CPU clubs settle their series at once
-- (by rating); a player against a CPU club plays it on their own phone; two players meet in a custom room whose code the
-- series keeps. A player reports each game's score; the first report of a game counts. These games never touch ranked
-- ratings. If a series sits with no result for 8 minutes, the player who showed up can claim it.
create table if not exists public.tourneys (
  id          bigint generated always as identity primary key,
  host        uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'lobby' check (status in ('lobby', 'running', 'done')),
  round       int not null default 0,
  champion    int,
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  ended_at    timestamptz
);
create table if not exists public.tourney_players (
  id          bigint generated always as identity primary key,
  tid         bigint not null references public.tourneys(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  club        text,
  rating      int not null default 1000,
  bot_level   int,
  seed        int check (seed between 1 and 8),
  status      text not null default 'invited' check (status in ('invited', 'joined', 'declined', 'left', 'bot')),
  created_at  timestamptz not null default now(),
  unique (tid, user_id), unique (tid, seed)
);
create table if not exists public.tourney_series (
  id          bigint generated always as identity primary key,
  tid         bigint not null references public.tourneys(id) on delete cascade,
  round       int not null check (round between 1 and 3),
  slot        int not null,
  seed_a      int not null,
  seed_b      int not null,
  wins_a      int not null default 0,
  wins_b      int not null default 0,
  need        int not null,
  winner      int,
  code        text not null,
  status      text not null default 'open' check (status in ('open', 'done')),
  updated_at  timestamptz not null default now(),
  unique (tid, round, slot)
);
create table if not exists public.tourney_games (
  series_id   bigint not null references public.tourney_series(id) on delete cascade,
  game_no     int not null,
  runs_a      int not null,
  runs_b      int not null,
  winner      int not null,
  reported_by uuid,
  created_at  timestamptz not null default now(),
  primary key (series_id, game_no)
);
create index if not exists tourney_players_user on public.tourney_players (user_id, status);
alter table public.tourneys enable row level security;
alter table public.tourney_players enable row level security;
alter table public.tourney_series enable row level security;
alter table public.tourney_games enable row level security;
revoke all on public.tourneys, public.tourney_players, public.tourney_series, public.tourney_games from anon, authenticated;

-- ------------------------------------------------------------------------------------------------ helpers
create or replace function public.pd_tn_code() returns text language sql volatile set search_path = '' as $$
  select string_agg(substr('abcdefghjkmnpqrstuvwxyz', 1 + floor(random() * 23)::int, 1), '') from generate_series(1, 4) $$;

create or replace function public.pd_tn_member(p_tid bigint) returns public.tourney_players
language sql stable security definer set search_path = '' as $$
  select * from public.tourney_players where tid = p_tid and user_id = public.pd_me() and status in ('joined', 'left') $$;

-- a series between two CPU clubs: played out at once, the better-rated club more likely to win each game
create or replace function public.pd_tn_simulate(p_series bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.tourney_series; ra int; rb int; p float; n int := 0; wa int := 0; wb int := 0; a int; b int;
begin
  select * into s from public.tourney_series where id = p_series for update;
  select rating into ra from public.tourney_players where tid = s.tid and seed = s.seed_a;
  select rating into rb from public.tourney_players where tid = s.tid and seed = s.seed_b;
  p := 1 / (1 + power(10, (rb - ra) / 400.0));
  while wa < s.need and wb < s.need loop
    n := n + 1;
    a := floor(random() * 6)::int; b := floor(random() * 6)::int;
    if random() < p then if a <= b then a := b + 1 + floor(random() * 2)::int; end if; wa := wa + 1;
    else if b <= a then b := a + 1 + floor(random() * 2)::int; end if; wb := wb + 1; end if;
    insert into public.tourney_games (series_id, game_no, runs_a, runs_b, winner) values (s.id, n, a, b, case when a > b then s.seed_a else s.seed_b end);
  end loop;
  update public.tourney_series set wins_a = wa, wins_b = wb, winner = case when wa > wb then seed_a else seed_b end, status = 'done', updated_at = now() where id = s.id;
end $$;

-- after a series ends: when its whole round is done, make the next round (or crown the champion)
create or replace function public.pd_tn_advance(p_tid bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.tourneys; w int[]; i int; sid bigint; botA boolean; botB boolean;
begin
  select * into t from public.tourneys where id = p_tid for update;
  if t.status <> 'running' then return; end if;
  if exists (select 1 from public.tourney_series where tid = p_tid and round = t.round and status <> 'done') then return; end if;
  select array_agg(winner order by slot) into w from public.tourney_series where tid = p_tid and round = t.round;
  if t.round = 3 then
    update public.tourneys set status = 'done', champion = w[1], ended_at = now() where id = p_tid; return;
  end if;
  update public.tourneys set round = t.round + 1 where id = p_tid;
  for i in 1 .. array_length(w, 1) / 2 loop
    insert into public.tourney_series (tid, round, slot, seed_a, seed_b, need, code)
      values (p_tid, t.round + 1, i, least(w[2*i-1], w[2*i]), greatest(w[2*i-1], w[2*i]), case when t.round + 1 = 3 then 3 else 2 end, public.pd_tn_code())
      returning id into sid;
    select user_id is null into botA from public.tourney_players where tid = p_tid and seed = least(w[2*i-1], w[2*i]);
    select user_id is null into botB from public.tourney_players where tid = p_tid and seed = greatest(w[2*i-1], w[2*i]);
    if botA and botB then perform public.pd_tn_simulate(sid); end if;
  end loop;
  perform public.pd_tn_advance(p_tid);  -- (a round of only CPU series is already done)
end $$;

-- ------------------------------------------------------------------------------------------------ the host's lobby
create or replace function public.tourney_create(p_club text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); nm text; tid bigint;
begin
  if exists (select 1 from public.tourney_players p join public.tourneys t on t.id = p.tid
             where p.user_id = me and p.status = 'joined' and t.status <> 'done') then
    raise exception 'You''re already in a playoff. Leave it first.' using errcode = 'P0050'; end if;
  select username into nm from public.profiles where user_id = me;
  if nm is null then raise exception 'Choose a username first.' using errcode = 'P0050'; end if;
  insert into public.tourneys (host) values (me) returning id into tid;
  insert into public.tourney_players (tid, user_id, name, club, rating, status) values (tid, me, nm, p_club, public.pd_rating_of(me), 'joined');
  return tid;
end $$;

create or replace function public.tourney_invite(p_tid bigint, p_user uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); nm text;
begin
  if not exists (select 1 from public.tourneys where id = p_tid and host = me and status = 'lobby') then
    raise exception 'Only the host can invite, before the playoff starts.' using errcode = 'P0051'; end if;
  if not exists (select 1 from public.friendships where user_lo = least(me, p_user) and user_hi = greatest(me, p_user) and status = 'accepted') then
    raise exception 'You can only invite your friends.' using errcode = 'P0045'; end if;
  if (select count(*) from public.tourney_players where tid = p_tid and status = 'joined') >= 8 then
    raise exception 'The bracket is full.' using errcode = 'P0051'; end if;
  select username into nm from public.profiles where user_id = p_user;
  insert into public.tourney_players (tid, user_id, name, rating, status) values (p_tid, p_user, nm, public.pd_rating_of(p_user), 'invited')
    on conflict (tid, user_id) do update set status = case when public.tourney_players.status = 'joined' then 'joined' else 'invited' end, created_at = now();
  return 'invited';
end $$;

-- open playoff invites to me
create or replace function public.tourney_inbox() returns table (tid bigint, host_name text, players int)
language sql stable security definer set search_path = '' as $$
  select t.id, (select username from public.profiles where user_id = t.host),
         (select count(*)::int from public.tourney_players x where x.tid = t.id and x.status = 'joined')
  from public.tourney_players p join public.tourneys t on t.id = p.tid
  where p.user_id = public.pd_me() and p.status = 'invited' and t.status = 'lobby' and p.created_at > now() - interval '30 minutes'
  order by p.created_at desc limit 3 $$;

create or replace function public.tourney_respond(p_tid bigint, p_accept boolean, p_club text) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me();
begin
  if p_accept then
    if exists (select 1 from public.tourney_players p join public.tourneys t on t.id = p.tid
               where p.user_id = me and p.status = 'joined' and t.status <> 'done' and t.id <> p_tid) then
      raise exception 'You''re already in another playoff. Leave it first.' using errcode = 'P0050'; end if;
    if not exists (select 1 from public.tourneys where id = p_tid and status = 'lobby') then
      raise exception 'That playoff has already started.' using errcode = 'P0051'; end if;
    if (select count(*) from public.tourney_players where tid = p_tid and status = 'joined') >= 8 then
      raise exception 'The bracket is full.' using errcode = 'P0051'; end if;
    update public.tourney_players set status = 'joined', club = p_club, rating = public.pd_rating_of(me)
      where tid = p_tid and user_id = me and status in ('invited', 'declined', 'left');
    if not found then raise exception 'That invite is gone.' using errcode = 'P0051'; end if;
    return 'joined';
  end if;
  update public.tourney_players set status = 'declined' where tid = p_tid and user_id = me and status = 'invited';
  return 'declined';
end $$;

-- leave: in the lobby you just go (the host leaving cancels it); once it's running, your open series is lost
create or replace function public.tourney_leave(p_tid bigint) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); t public.tourneys; my int; s public.tourney_series;
begin
  select * into t from public.tourneys where id = p_tid for update;
  if not found then return 'gone'; end if;
  if t.status = 'lobby' then
    if t.host = me then delete from public.tourneys where id = p_tid; return 'cancelled'; end if;
    update public.tourney_players set status = 'left' where tid = p_tid and user_id = me; return 'left';
  end if;
  select seed into my from public.tourney_players where tid = p_tid and user_id = me;
  update public.tourney_players set status = 'left' where tid = p_tid and user_id = me;
  if t.status = 'running' then
    select * into s from public.tourney_series where tid = p_tid and status = 'open' and my in (seed_a, seed_b);
    if found then
      update public.tourney_series set winner = case when seed_a = my then seed_b else seed_a end,
        wins_a = case when seed_a = my then wins_a else need end, wins_b = case when seed_b = my then wins_b else need end,
        status = 'done', updated_at = now() where id = s.id;
      perform public.pd_tn_advance(p_tid);
    end if;
  end if;
  return 'left';
end $$;

create or replace function public.tourney_start(p_tid bigint) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); n int; avg_r int; clubs text[] := array['seoul','busan','incheon','gwangju','daegu','daejeon','suwon','changwon','ulsan','jeju'];
  used text[]; free text[]; i int; r record; k int := 0; pairs int[][] := array[[1,8],[4,5],[2,7],[3,6]]; sid bigint; botA boolean; botB boolean;
begin
  if not exists (select 1 from public.tourneys where id = p_tid and host = me and status = 'lobby') then
    raise exception 'Only the host can start it.' using errcode = 'P0051'; end if;
  update public.tourney_players set status = 'declined' where tid = p_tid and status = 'invited';
  select count(*), coalesce(avg(rating), 1000)::int into n, avg_r from public.tourney_players where tid = p_tid and status = 'joined';
  select coalesce(array_agg(club), '{}') into used from public.tourney_players where tid = p_tid and status = 'joined';
  free := array(select c from unnest(clubs) c where c <> all(used) order by random());
  -- CPU clubs for the empty spots, rated around the players (a little below on average)
  for i in 1 .. 8 - n loop
    insert into public.tourney_players (tid, name, club, rating, bot_level, status)
      values (p_tid, 'CPU', coalesce(free[i], clubs[1 + floor(random() * 10)::int]),
              greatest(700, avg_r - 160 + floor(random() * 260)::int), 0, 'bot');
  end loop;
  update public.tourney_players set bot_level = public.pd_bot_level(rating) where tid = p_tid and status = 'bot';
  -- seeds by rating
  for r in select id from public.tourney_players where tid = p_tid and status in ('joined', 'bot') order by rating desc, random() loop
    k := k + 1; update public.tourney_players set seed = k where id = r.id;
  end loop;
  update public.tourneys set status = 'running', round = 1, started_at = now() where id = p_tid;
  for i in 1 .. 4 loop
    insert into public.tourney_series (tid, round, slot, seed_a, seed_b, need, code) values (p_tid, 1, i, pairs[i][1], pairs[i][2], 2, public.pd_tn_code()) returning id into sid;
    select user_id is null into botA from public.tourney_players where tid = p_tid and seed = pairs[i][1];
    select user_id is null into botB from public.tourney_players where tid = p_tid and seed = pairs[i][2];
    if botA and botB then perform public.pd_tn_simulate(sid); end if;
  end loop;
  perform public.pd_tn_advance(p_tid);
  return 'running';
end $$;

-- ------------------------------------------------------------------------------------------------ playing it
-- a player reports one game of their series: their runs and the other side's (the first report of each game counts)
create or replace function public.tourney_report(p_series bigint, p_game int, p_my_runs int, p_their_runs int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); s public.tourney_series; my int; ra int; rb int;
begin
  select * into s from public.tourney_series where id = p_series for update;
  if not found then raise exception 'No such series.' using errcode = 'P0052'; end if;
  select seed into my from public.tourney_players where tid = s.tid and user_id = me and status in ('joined', 'left');
  if my is null or my not in (s.seed_a, s.seed_b) then raise exception 'That isn''t your series.' using errcode = 'P0052'; end if;
  if p_my_runs = p_their_runs or p_my_runs < 0 or p_their_runs < 0 then raise exception 'A game can''t end tied.' using errcode = 'P0052'; end if;
  if s.status = 'open' and p_game = s.wins_a + s.wins_b + 1 and not exists (select 1 from public.tourney_games where series_id = s.id and game_no = p_game) then
    if my = s.seed_a then ra := p_my_runs; rb := p_their_runs; else ra := p_their_runs; rb := p_my_runs; end if;
    insert into public.tourney_games (series_id, game_no, runs_a, runs_b, winner, reported_by) values (s.id, p_game, ra, rb, case when ra > rb then s.seed_a else s.seed_b end, me);
    update public.tourney_series set wins_a = wins_a + (ra > rb)::int, wins_b = wins_b + (rb > ra)::int, updated_at = now() where id = s.id returning * into s;
    if s.wins_a >= s.need or s.wins_b >= s.need then
      update public.tourney_series set winner = case when wins_a > wins_b then seed_a else seed_b end, status = 'done' where id = s.id;
      perform public.pd_tn_advance(s.tid);
    end if;
  end if;
  select * into s from public.tourney_series where id = p_series;
  return jsonb_build_object('wins_a', s.wins_a, 'wins_b', s.wins_b, 'status', s.status, 'winner', s.winner);
end $$;

-- the other player never showed: after 8 minutes with no result, the one who's here takes the series
create or replace function public.tourney_claim(p_series bigint) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); s public.tourney_series; my int;
begin
  select * into s from public.tourney_series where id = p_series for update;
  select seed into my from public.tourney_players where tid = s.tid and user_id = me and status = 'joined';
  if s.status <> 'open' or my is null or my not in (s.seed_a, s.seed_b) then raise exception 'You can''t claim that series.' using errcode = 'P0052'; end if;
  if s.updated_at > now() - interval '8 minutes' then raise exception 'Give them a few more minutes.' using errcode = 'P0052'; end if;
  update public.tourney_series set winner = my, wins_a = case when my = seed_a then need else wins_a end, wins_b = case when my = seed_b then need else wins_b end,
    status = 'done', updated_at = now() where id = s.id;
  perform public.pd_tn_advance(s.tid);
  return 'claimed';
end $$;

-- everything a player's screen needs: the playoff, its clubs, every series with its games, and which one is yours
create or replace function public.tourney_state(p_tid bigint default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := public.pd_me(); v_tid bigint := p_tid; t public.tourneys;
begin
  if v_tid is null then
    select p.tid into v_tid from public.tourney_players p join public.tourneys x on x.id = p.tid
      where p.user_id = me and p.status in ('joined', 'left') and (x.status <> 'done' or x.ended_at > now() - interval '30 minutes')
      order by x.created_at desc limit 1;
    if v_tid is null then return null; end if;
  end if;
  select * into t from public.tourneys where id = v_tid;
  if not found or not exists (select 1 from public.tourney_players x where x.tid = t.id and x.user_id = me) then return null; end if;
  return jsonb_build_object(
    'id', t.id, 'status', t.status, 'round', t.round, 'champion', t.champion, 'host', t.host = me,
    'host_name', (select username from public.profiles where user_id = t.host),
    'players', coalesce((select jsonb_agg(jsonb_build_object('user_id', p.user_id, 'name', p.name, 'club', p.club, 'rating', p.rating,
        'bot_level', p.bot_level, 'seed', p.seed, 'status', p.status, 'me', p.user_id = me) order by p.seed nulls last, p.rating desc)
      from public.tourney_players p where p.tid = t.id and p.status in ('joined', 'invited', 'bot', 'left')), '[]'),
    'series', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'round', s.round, 'slot', s.slot, 'seed_a', s.seed_a, 'seed_b', s.seed_b,
        'wins_a', s.wins_a, 'wins_b', s.wins_b, 'need', s.need, 'winner', s.winner, 'status', s.status, 'code', s.code,
        'idle_secs', extract(epoch from now() - s.updated_at)::int,
        'games', coalesce((select jsonb_agg(jsonb_build_object('n', g.game_no, 'a', g.runs_a, 'b', g.runs_b) order by g.game_no) from public.tourney_games g where g.series_id = s.id), '[]'))
        order by s.round, s.slot) from public.tourney_series s where s.tid = t.id), '[]'));
end $$;

revoke all on function public.tourney_create(text), public.tourney_invite(bigint, uuid), public.tourney_inbox(), public.tourney_respond(bigint, boolean, text),
  public.tourney_leave(bigint), public.tourney_start(bigint), public.tourney_report(bigint, int, int, int), public.tourney_claim(bigint),
  public.tourney_state(bigint), public.pd_tn_simulate(bigint), public.pd_tn_advance(bigint), public.pd_tn_member(bigint), public.pd_tn_code() from public, anon, authenticated;
grant execute on function public.tourney_create(text), public.tourney_invite(bigint, uuid), public.tourney_inbox(), public.tourney_respond(bigint, boolean, text),
  public.tourney_leave(bigint), public.tourney_start(bigint), public.tourney_report(bigint, int, int, int), public.tourney_claim(bigint),
  public.tourney_state(bigint) to authenticated;
