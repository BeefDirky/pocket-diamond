-- Pocket Diamond core schema, migration 001
-- Run after supabase/profiles.sql. Safe to run more than once.
--
-- Principles
--  * Every player is their permanent auth UUID. Usernames live only in public.profiles and can change freely.
--  * Browsers can READ public data, but they can't write stats, ratings, matches, wallets or inventory.
--    Those writes happen only in the SECURITY DEFINER functions at the bottom, which only the service role
--    (Edge Functions) may call. The existing `saves` table and the client-side card/coin systems are untouched.
--  * Every write path is idempotent: replaying the same submission, finalisation or grant changes nothing.
--  * Ranked stats come only from verified matches; single-player and casual results are stored separately,
--    marked unverified, and never feed a leaderboard.
--  * No personal data beyond the auth account: no email, IP or device data in any public table.

-- ============================================================ profiles (existing; small additions)
alter table public.profiles add column if not exists avatar text
  check (avatar is null or avatar ~ '^[a-z0-9_-]{1,32}$');            -- a key into the game's own avatar set, never a URL
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- ============================================================ seasons
-- One ladder per roster kind: 'stock' = clubs' own rosters (ranked now); 'custom' = collectible-card teams (later).
create table if not exists public.seasons (
  id         serial primary key,
  ladder     text not null check (ladder in ('stock','custom')),
  name       text not null,
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create unique index if not exists seasons_one_active_per_ladder on public.seasons (ladder) where is_active;
insert into public.seasons (ladder, name, starts_at, is_active)
select 'stock', 'Season 1', now(), true
where not exists (select 1 from public.seasons where ladder = 'stock');

-- ============================================================ matches
-- mode:     arcade | full | playoffs  (single player vs CPU, self-reported)
--           casual                    (online, no ranking; cards allowed)
--           ranked_stock              (online, verified, club rosters only)
--           ranked_custom             (online, verified, server-owned card teams; reserved for later)
-- status:   pending   created by match-start, waiting for both players
--           live      both joined
--           final     verified: both submissions agree (ranked) or accepted (casual)
--           forfeit   one player left; the other submitted alone after the timeout
--           disputed  submissions disagree: no stats, no rating, kept for review
--           abandoned nobody finished
--           self_reported  single player; never verified
create table if not exists public.matches (
  id                 uuid primary key default gen_random_uuid(),
  mode               text not null check (mode in ('arcade','full','playoffs','casual','ranked_stock','ranked_custom')),
  season_id          int references public.seasons(id),
  status             text not null default 'pending'
                     check (status in ('pending','live','final','forfeit','disputed','abandoned','self_reported')),
  verified           boolean not null default false,
  seed               bigint,                         -- issued by the server for online matches
  park               text check (park is null or park ~ '^[a-z0-9_-]{1,32}$'),
  innings            smallint check (innings between 1 and 20),
  home_user          uuid references auth.users(id) on delete set null,   -- null = CPU
  away_user          uuid references auth.users(id) on delete set null,
  home_club          text check (home_club is null or home_club ~ '^[a-z0-9_-]{1,32}$'),
  away_club          text check (away_club is null or away_club ~ '^[a-z0-9_-]{1,32}$'),
  home_score         smallint check (home_score between 0 and 999),
  away_score         smallint check (away_score between 0 and 999),
  winner_side        text check (winner_side in ('home','away','tie')),
  log_hash           text,                           -- the agreed play log's hash (verified matches)
  client_version     text check (client_version is null or length(client_version) <= 32),
  dispute_reason     text,
  stats_applied_at   timestamptz,                    -- idempotency markers for the finalisation steps
  rating_applied_at  timestamptz,
  rewards_applied_at timestamptz,
  created_at         timestamptz not null default now(),
  started_at         timestamptz,
  ended_at           timestamptz,
  constraint ranked_has_season   check (mode not like 'ranked%' or season_id is not null),
  constraint ranked_two_players  check (mode not like 'ranked%' or (home_user is not null and away_user is not null and home_user <> away_user)),
  constraint verified_only_online check (not verified or mode in ('casual','ranked_stock','ranked_custom')),
  constraint single_is_self_reported check (mode not in ('arcade','full','playoffs') or status = 'self_reported')
);
create index if not exists matches_home_user_idx   on public.matches (home_user, ended_at desc);
create index if not exists matches_away_user_idx   on public.matches (away_user, ended_at desc);
create index if not exists matches_season_idx      on public.matches (season_id, ended_at desc) where verified;
create index if not exists matches_open_idx        on public.matches (status, created_at) where status in ('pending','live');

-- one row per side; user_id null = CPU. roster holds the lineup actually fielded (club ids for stock,
-- card ids + levels for custom) so a custom-team match can always be audited later.
create table if not exists public.match_participants (
  match_id       uuid not null references public.matches(id) on delete cascade,
  side           text not null check (side in ('home','away')),
  user_id        uuid references auth.users(id) on delete set null,
  club           text not null check (club ~ '^[a-z0-9_-]{1,32}$'),
  roster_kind    text not null default 'stock' check (roster_kind in ('stock','custom')),
  roster         jsonb,
  result         text check (result in ('W','L','T')),
  runs_for       smallint,
  runs_against   smallint,
  rating_before  int,
  rating_after   int,
  primary key (match_id, side)
);
create unique index if not exists match_participants_user_once on public.match_participants (match_id, user_id) where user_id is not null;
create index if not exists match_participants_user_idx on public.match_participants (user_id, match_id);

-- what each player's client reported at the end. PK = idempotent: a second submit from the same player is ignored.
create table if not exists public.match_submissions (
  match_id       uuid not null references public.matches(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  side           text not null check (side in ('home','away')),
  log_hash       text not null check (length(log_hash) between 16 and 128),
  home_score     smallint not null,
  away_score     smallint not null,
  log            jsonb not null,                     -- the full input + outcome log, kept for disputes/replay
  client_version text check (client_version is null or length(client_version) <= 32),
  submitted_at   timestamptz not null default now(),
  primary key (match_id, user_id)
);

-- ============================================================ granular baseball records
-- Written from the agreed log when a match is finalised (or from a single-player report, marked unverified
-- by its match). *_key = the game's own player id ('fa:b12', 'bl:p3', 'seoul:3'), so a card player can be tracked.
create table if not exists public.plate_appearances (
  match_id      uuid not null references public.matches(id) on delete cascade,
  seq           smallint not null check (seq >= 0),
  inning        smallint not null check (inning between 1 and 30),
  half          text not null check (half in ('top','bot')),
  batting_side  text not null check (batting_side in ('home','away')),
  batter_user   uuid references auth.users(id) on delete set null,   -- null = CPU batted
  pitcher_user  uuid references auth.users(id) on delete set null,
  batter_key    text not null check (length(batter_key) <= 40),
  pitcher_key   text not null check (length(pitcher_key) <= 40),
  outs_before   smallint not null check (outs_before between 0 and 2),
  bases_before  smallint not null check (bases_before between 0 and 7),    -- bitmask: 1 = 1st, 2 = 2nd, 4 = 3rd
  result        text not null check (result in (
                  '1B','2B','3B','HR','BB','IBB','HBP','K','KL','GO','FO','LO','PO','SF','SH','E','FC','DP','TP','CI','OTHER')),
  rbi           smallint not null default 0 check (rbi between 0 and 4),
  runs_scored   smallint not null default 0 check (runs_scored between 0 and 4),
  outs_made     smallint not null default 0 check (outs_made between 0 and 3),
  pitches       smallint not null default 0 check (pitches between 0 and 60),
  ev_mph        real check (ev_mph is null or ev_mph between 0 and 130),
  la_deg        real check (la_deg is null or la_deg between -90 and 90),
  spray_deg     real check (spray_deg is null or spray_deg between -90 and 90),
  distance_ft   real check (distance_ft is null or distance_ft between 0 and 600),
  primary key (match_id, seq)
);
create index if not exists pa_batter_idx  on public.plate_appearances (batter_user)  where batter_user is not null;
create index if not exists pa_pitcher_idx on public.plate_appearances (pitcher_user) where pitcher_user is not null;

create table if not exists public.pitches (
  match_id      uuid not null,
  pa_seq        smallint not null,
  seq           smallint not null check (seq >= 0),
  pitch_type    text not null check (pitch_type in ('FB','CH','SL','CB','KN','SP')),
  mph           real check (mph is null or mph between 30 and 115),
  plate_x       real,                    -- feet from the middle of the plate, catcher's view
  in_zone       boolean,
  meter_q       real check (meter_q is null or meter_q between 0 and 1),   -- the pitcher's release quality
  outcome       text not null check (outcome in ('ball','called_strike','swinging_strike','foul','in_play','hbp','pitchout','ibb')),
  swing_err_ms  smallint check (swing_err_ms is null or swing_err_ms between -2000 and 2000),
  stamina       real check (stamina is null or stamina between 0 and 1),
  wild          boolean not null default false,
  primary key (match_id, pa_seq, seq),
  foreign key (match_id, pa_seq) references public.plate_appearances(match_id, seq) on delete cascade
);

-- ============================================================ aggregated stats
-- One row per player per mode per season. season_id 0 = career totals for that mode.
-- Ranked modes are only ever written from verified matches; the other modes are labelled by mode, so a profile
-- can show "vs CPU" and "casual online" lines without them leaking into leaderboards.
create table if not exists public.player_stats (
  user_id        uuid not null references auth.users(id) on delete cascade,
  mode           text not null check (mode in ('arcade','full','playoffs','casual','ranked_stock','ranked_custom')),
  season_id      int not null default 0,
  games          int not null default 0, wins int not null default 0, losses int not null default 0, ties int not null default 0,
  -- batting
  pa int not null default 0, ab int not null default 0, h int not null default 0,
  b2 int not null default 0, b3 int not null default 0, hr int not null default 0,
  bb int not null default 0, hbp int not null default 0, so int not null default 0,
  sf int not null default 0, sh int not null default 0, rbi int not null default 0,
  -- pitching
  bf int not null default 0, outs_pitched int not null default 0, h_allowed int not null default 0,
  hr_allowed int not null default 0, bb_allowed int not null default 0, so_pitched int not null default 0,
  runs_allowed int not null default 0, pitches_thrown int not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (user_id, mode, season_id)
);
create index if not exists player_stats_board_idx on public.player_stats (mode, season_id);

-- ============================================================ ratings (ELO)
create table if not exists public.ratings (
  user_id        uuid not null references auth.users(id) on delete cascade,
  season_id      int not null references public.seasons(id),
  rating         int not null default 1000,
  peak           int not null default 1000,
  games          int not null default 0,
  wins           int not null default 0,
  losses         int not null default 0,
  last_match_at  timestamptz,
  primary key (user_id, season_id)
);
create index if not exists ratings_board_idx on public.ratings (season_id, rating desc);

create table if not exists public.rating_history (
  match_id   uuid not null references public.matches(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  season_id  int not null references public.seasons(id),
  before     int not null,
  after      int not null,
  created_at timestamptz not null default now(),
  primary key (match_id, user_id)
);
create index if not exists rating_history_user_idx on public.rating_history (user_id, created_at desc);

-- ============================================================ economy (server-owned; reserved for custom-team ranked)
-- Not used by the game yet: coins, packs and cards still live in each player's cloud save. When the custom ladder
-- opens, balances are migrated in once and these tables become the only source of truth for ranked-eligible teams.
create table if not exists public.wallets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  coins      bigint not null default 0 check (coins >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.coin_ledger (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  delta           int not null check (delta <> 0),
  balance_after   bigint not null check (balance_after >= 0),
  reason          text not null check (reason ~ '^[a-z_]{2,32}$'),   -- 'ranked_win', 'pack_purchase', 'daily_challenge', ...
  ref_id          text,                                            -- match id, pack id, challenge id
  idempotency_key text not null unique,                            -- e.g. 'ranked_win:<match>:<user>'
  created_at      timestamptz not null default now()
);
create index if not exists coin_ledger_user_idx on public.coin_ledger (user_id, created_at desc);

-- the card list, published by the server, so a pack opened on the server can only contain real cards
create table if not exists public.card_catalog (
  card_id         text primary key check (card_id ~ '^(fa|bl):[a-z0-9]{1,8}$'),
  set_code        text not null check (set_code in ('fa','bl')),
  rarity          text not null check (rarity in ('common','rare','epic','legend')),
  is_pitcher      boolean not null,
  base            jsonb not null,                -- {con,pow,spd,def} or {vel,mov,ctl}
  catalog_version int not null default 1,
  active          boolean not null default true
);
create table if not exists public.inventory (
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     text not null references public.card_catalog(card_id),
  copies      int not null default 1 check (copies >= 0),
  levels      jsonb not null default '{}'::jsonb,   -- {"pow":3,"con":1}
  acquired_at timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, card_id)
);
create table if not exists public.pack_openings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  set_code        text not null check (set_code in ('fa','bl')),
  cost            int not null check (cost >= 0),
  cards           text[] not null,
  idempotency_key text not null unique,
  created_at      timestamptz not null default now()
);
create table if not exists public.card_upgrades (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  card_id         text not null references public.card_catalog(card_id),
  stat            text not null check (stat in ('con','pow','spd','def','vel','mov','ctl')),
  idempotency_key text not null unique,
  created_at      timestamptz not null default now()
);
-- the custom team a player takes into the custom ladder (card ids by lineup slot), locked into
-- match_participants.roster when a match starts
create table if not exists public.custom_rosters (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  club       text not null check (club ~ '^[a-z0-9_-]{1,32}$'),
  slots      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================ row level security
alter table public.seasons            enable row level security;
alter table public.matches            enable row level security;
alter table public.match_participants enable row level security;
alter table public.match_submissions  enable row level security;
alter table public.plate_appearances  enable row level security;
alter table public.pitches            enable row level security;
alter table public.player_stats       enable row level security;
alter table public.ratings            enable row level security;
alter table public.rating_history     enable row level security;
alter table public.wallets            enable row level security;
alter table public.coin_ledger        enable row level security;
alter table public.card_catalog       enable row level security;
alter table public.inventory          enable row level security;
alter table public.pack_openings      enable row level security;
alter table public.card_upgrades      enable row level security;
alter table public.custom_rosters     enable row level security;

-- a stable helper for policies (security definer so it can see participants without recursing through RLS)
create or replace function public.is_participant(p_match uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.match_participants mp where mp.match_id = p_match and mp.user_id = auth.uid())
$$;

do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname = 'public' and policyname like 'pd_%' loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- public reads (leaderboards, profiles, finished verified matches)
create policy pd_seasons_read on public.seasons for select using (true);
create policy pd_stats_read   on public.player_stats for select using (true);
create policy pd_ratings_read on public.ratings for select using (true);
create policy pd_rhist_read   on public.rating_history for select using (true);
create policy pd_catalog_read on public.card_catalog for select using (true);
create policy pd_matches_read on public.matches for select
  using ((verified and status in ('final','forfeit')) or public.is_participant(id));
create policy pd_mp_read on public.match_participants for select
  using (exists (select 1 from public.matches m where m.id = match_id and m.verified and m.status in ('final','forfeit'))
         or public.is_participant(match_id));
-- detailed records: the two players only (analytics reads them with the service role)
create policy pd_pa_read     on public.plate_appearances for select using (public.is_participant(match_id));
create policy pd_pitch_read  on public.pitches          for select using (public.is_participant(match_id));
create policy pd_subs_read   on public.match_submissions for select using (user_id = auth.uid());
-- private economy: owner only
create policy pd_wallet_read on public.wallets        for select using (user_id = auth.uid());
create policy pd_ledger_read on public.coin_ledger    for select using (user_id = auth.uid());
create policy pd_inv_read    on public.inventory      for select using (user_id = auth.uid());
create policy pd_packs_read  on public.pack_openings  for select using (user_id = auth.uid());
create policy pd_upg_read    on public.card_upgrades  for select using (user_id = auth.uid());
create policy pd_roster_read on public.custom_rosters for select using (user_id = auth.uid());
-- no insert/update/delete policies anywhere above: browsers can't write. The service role bypasses RLS.

-- belt and braces: browsers get SELECT only on these tables
revoke insert, update, delete, truncate on
  public.seasons, public.matches, public.match_participants, public.match_submissions, public.plate_appearances,
  public.pitches, public.player_stats, public.ratings, public.rating_history, public.wallets, public.coin_ledger,
  public.card_catalog, public.inventory, public.pack_openings, public.card_upgrades, public.custom_rosters
from anon, authenticated;

-- ============================================================ public views
-- security_invoker: the views obey the RLS of the tables underneath (all public-readable ones)
create or replace view public.leaderboard_ranked with (security_invoker = true) as
select r.season_id,
       s.ladder,
       rank() over (partition by r.season_id order by r.rating desc, r.wins desc) as rank,
       r.user_id,
       p.username,
       p.avatar,
       r.rating,
       r.peak,
       r.games,
       r.wins,
       r.losses,
       round(r.wins::numeric / nullif(r.games, 0), 3)                                        as win_pct,
       coalesce(ps.hr, 0)                                                                   as hr,
       coalesce(ps.pa, 0)                                                                   as pa,
       case when coalesce(ps.ab, 0) > 0 then round(ps.h::numeric / ps.ab, 3) end           as avg
from public.ratings r
join public.seasons s   on s.id = r.season_id
join public.profiles p  on p.user_id = r.user_id
left join public.player_stats ps
       on ps.user_id = r.user_id and ps.season_id = r.season_id and ps.mode = 'ranked_' || s.ladder
where r.games > 0;

-- a profile's stat lines with the rate stats worked out (every mode, labelled)
create or replace view public.player_stat_lines with (security_invoker = true) as
select ps.user_id, p.username, ps.mode, ps.season_id,
       ps.mode in ('ranked_stock','ranked_custom') as verified,
       ps.games, ps.wins, ps.losses, ps.ties,
       ps.pa, ps.ab, ps.h, ps.b2, ps.b3, ps.hr, ps.bb, ps.hbp, ps.so, ps.rbi,
       case when ps.ab > 0 then round(ps.h::numeric / ps.ab, 3) end                                     as avg,
       case when (ps.ab + ps.bb + ps.hbp + ps.sf) > 0
            then round((ps.h + ps.bb + ps.hbp)::numeric / (ps.ab + ps.bb + ps.hbp + ps.sf), 3) end       as obp,
       case when ps.ab > 0
            then round((ps.h + ps.b2 + 2 * ps.b3 + 3 * ps.hr)::numeric / ps.ab, 3) end                   as slg,
       ps.outs_pitched, ps.so_pitched, ps.bb_allowed, ps.h_allowed, ps.hr_allowed, ps.runs_allowed,
       case when ps.outs_pitched > 0 then round(ps.runs_allowed * 27.0 / ps.outs_pitched, 2) end         as ra9
from public.player_stats ps
join public.profiles p on p.user_id = ps.user_id;

grant select on public.leaderboard_ranked, public.player_stat_lines to anon, authenticated;

-- ============================================================ server-side write functions
-- All SECURITY DEFINER with an empty search_path, callable only by the service role (Edge Functions).
-- Each one locks the match row first and checks a marker, so calling it twice is a no-op, and each runs
-- inside the caller's single transaction (one RPC = one transaction).

-- fold one finished match's plate appearances and results into player_stats (mode career + mode season)
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
    -- game results
    select mp.user_id,
           1 as games, (mp.result = 'W')::int as wins, (mp.result = 'L')::int as losses, (mp.result = 'T')::int as ties,
           0 pa,0 ab,0 h,0 b2,0 b3,0 hr,0 bb,0 hbp,0 so,0 sf,0 sh,0 rbi,0 bf,0 outs_pitched,0 h_allowed,0 hr_allowed,0 bb_allowed,0 so_pitched,0 runs_allowed,0 pitches_thrown
    from public.match_participants mp where mp.match_id = p_match and mp.user_id is not null
    union all
    -- batting
    select pa.batter_user, 0,0,0,0,
           1,
           (pa.result not in ('BB','IBB','HBP','SF','SH','CI'))::int,
           (pa.result in ('1B','2B','3B','HR'))::int, (pa.result = '2B')::int, (pa.result = '3B')::int, (pa.result = 'HR')::int,
           (pa.result in ('BB','IBB'))::int, (pa.result = 'HBP')::int, (pa.result in ('K','KL'))::int,
           (pa.result = 'SF')::int, (pa.result = 'SH')::int, pa.rbi,
           0,0,0,0,0,0,0,0
    from public.plate_appearances pa where pa.match_id = p_match and pa.batter_user is not null
    union all
    -- pitching
    select pa.pitcher_user, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,
           1, pa.outs_made, (pa.result in ('1B','2B','3B','HR'))::int, (pa.result = 'HR')::int,
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

-- ELO for a verified ranked match. K = 40 for a player's first 10 games of the season, 24 after.
-- A win against someone you've already beaten 3+ times today earns nothing (blunts two-account farming).
create or replace function public.apply_ranked_rating(p_match uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; h public.ratings%rowtype; a public.ratings%rowtype;
        sh numeric; eh numeric; kh int; ka int; dh int; da int; farmed boolean;
begin
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'match % not found', p_match; end if;
  if m.rating_applied_at is not null then return false; end if;
  if m.mode not like 'ranked%' or not m.verified or m.status not in ('final','forfeit') then
    raise exception 'match % is not a verified, finished ranked match', p_match; end if;

  insert into public.ratings (user_id, season_id) values (m.home_user, m.season_id), (m.away_user, m.season_id)
  on conflict do nothing;
  -- lock both rows in a fixed order so two matches finishing at once can't deadlock
  perform 1 from public.ratings where season_id = m.season_id and user_id in (m.home_user, m.away_user)
    order by user_id for update;
  select * into h from public.ratings where user_id = m.home_user and season_id = m.season_id;
  select * into a from public.ratings where user_id = m.away_user and season_id = m.season_id;

  sh := case m.winner_side when 'home' then 1 when 'away' then 0 else 0.5 end;
  eh := 1 / (1 + power(10, (a.rating - h.rating) / 400.0));
  kh := case when h.games < 10 then 40 else 24 end;
  ka := case when a.games < 10 then 40 else 24 end;
  select count(*) >= 3 into farmed from public.matches x
   where x.id <> m.id and x.verified and x.mode = m.mode and x.ended_at > now() - interval '1 day'
     and x.rating_applied_at is not null
     and ((x.home_user = m.home_user and x.away_user = m.away_user) or (x.home_user = m.away_user and x.away_user = m.home_user));
  dh := case when farmed then 0 else round(kh * (sh - eh)) end;
  da := case when farmed then 0 else round(ka * ((1 - sh) - (1 - eh))) end;

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

-- coins: one ledger line per idempotency key; the wallet changes only if the line is new
create or replace function public.grant_coins(p_user uuid, p_delta int, p_reason text, p_key text, p_ref text default null)
returns bigint language plpgsql security definer set search_path = '' as $$
declare bal bigint; inserted boolean;
begin
  if p_delta = 0 then raise exception 'delta must be non-zero'; end if;
  insert into public.wallets (user_id) values (p_user) on conflict do nothing;
  select coins into bal from public.wallets where user_id = p_user for update;
  if exists (select 1 from public.coin_ledger where idempotency_key = p_key) then return bal; end if;
  if bal + p_delta < 0 then raise exception 'insufficient coins'; end if;
  bal := bal + p_delta;
  insert into public.coin_ledger (user_id, delta, balance_after, reason, ref_id, idempotency_key)
       values (p_user, p_delta, bal, p_reason, p_ref, p_key);
  update public.wallets set coins = bal, updated_at = now() where user_id = p_user;
  return bal;
end $$;

-- finish a match in one transaction: stats, then rating (ranked only). Rewards hook in here when the
-- economy moves to the server. Returns what was applied this call.
create or replace function public.finalize_match(p_match uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare m public.matches%rowtype; st boolean := false; rt boolean := false;
begin
  select * into m from public.matches where id = p_match for update;
  if not found then raise exception 'match % not found', p_match; end if;
  if m.status in ('final','forfeit','self_reported') then
    st := public.apply_match_stats(p_match);
    if m.mode like 'ranked%' and m.verified then rt := public.apply_ranked_rating(p_match); end if;
  end if;
  return jsonb_build_object('stats', st, 'rating', rt);
end $$;

revoke all on function public.apply_match_stats(uuid), public.apply_ranked_rating(uuid),
                       public.grant_coins(uuid, int, text, text, text), public.finalize_match(uuid)
  from public, anon, authenticated;
grant execute on function public.apply_match_stats(uuid), public.apply_ranked_rating(uuid),
                          public.grant_coins(uuid, int, text, text, text), public.finalize_match(uuid)
  to service_role;
revoke all on function public.is_participant(uuid) from public;
grant execute on function public.is_participant(uuid) to anon, authenticated, service_role;
