-- Pocket Diamond migration 004: estimated wait in the ranked queue.
-- Run after 003_queue.sql. Safe to run more than once.
-- Every pairing records how long each player waited; the queue reports the median of the last 3 hours (once there are
-- at least 3 waits to go on) as the estimate. Waits older than a week are dropped.

create table if not exists public.ranked_queue_waits (
  id         bigint generated always as identity primary key,
  matched_at timestamptz not null default now(),
  wait_secs  int not null check (wait_secs >= 0)
);
create index if not exists ranked_queue_waits_at_idx on public.ranked_queue_waits (matched_at desc);
alter table public.ranked_queue_waits enable row level security;   -- no policies: only the functions read and write it
revoke all on public.ranked_queue_waits from anon, authenticated;

-- (same as 003, plus recording both players' waits)
create or replace function public.pd_queue_pair(p uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare me public.ranked_queue%rowtype; opp public.ranked_queue%rowtype; sid int; mid uuid; away_club text;
begin
  select * into me from public.ranked_queue where user_id = p and match_id is null for update skip locked;
  if not found then return null; end if;
  select * into opp from public.ranked_queue
   where user_id <> p and match_id is null and version = me.version and polled_at > now() - interval '20 seconds'
   order by joined_at limit 1 for update skip locked;
  if not found then return null; end if;
  select id into sid from public.seasons where ladder = 'stock' and is_active;
  if sid is null then return null; end if;
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
  insert into public.ranked_queue_waits (wait_secs) values
    (greatest(0, extract(epoch from now() - opp.joined_at))::int), (greatest(0, extract(epoch from now() - me.joined_at))::int);
  delete from public.ranked_queue_waits where matched_at < now() - interval '7 days';
  return mid;
end $$;

-- (same as 003, plus the estimate: median wait of the last 3 hours, or null when there's too little to go on)
create or replace function public.pd_queue_state(p uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare q public.ranked_queue%rowtype; n int; est int;
begin
  select * into q from public.ranked_queue where user_id = p;
  if not found then return jsonb_build_object('queue', 'gone'); end if;
  if q.match_id is not null then
    delete from public.ranked_queue where user_id = p;
    return jsonb_build_object('queue', 'matched', 'info', public.ranked_info(q.match_id));
  end if;
  select count(*) into n from public.ranked_queue where match_id is null and version = q.version and polled_at > now() - interval '20 seconds';
  select case when count(*) >= 3 then round(percentile_cont(0.5) within group (order by wait_secs))::int end into est
    from public.ranked_queue_waits where matched_at > now() - interval '3 hours';
  return jsonb_build_object('queue', 'waiting', 'waiting', n, 'since', q.joined_at, 'est_secs', est);
end $$;

revoke all on function public.pd_queue_pair(uuid), public.pd_queue_state(uuid) from public, anon, authenticated;
grant execute on function public.pd_queue_pair(uuid), public.pd_queue_state(uuid) to service_role;
