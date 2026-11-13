-- Behaviour tests for migrations/001_core.sql. Run against a scratch database (see tests/run.sh).
-- Every check raises an exception on failure; the script stops at the first one (ON_ERROR_STOP).
\set A '\'11111111-1111-1111-1111-111111111111\''
\set B '\'22222222-2222-2222-2222-222222222222\''
\set C '\'33333333-3333-3333-3333-333333333333\''

create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;

-- ---------------------------------------------------------------- existing data preserved
select pg_temp.ok((select count(*) = 2 from public.profiles), 'existing usernames kept');
select pg_temp.ok((select count(*) = 1 from public.saves), 'existing cloud save kept');
select pg_temp.ok((select count(*) = 1 from public.seasons where is_active and ladder = 'stock'), 'one active stock season, not duplicated by a re-run');

-- ---------------------------------------------------------------- a verified ranked match (as the service role)
set role service_role;
insert into public.matches (id, mode, season_id, status, verified, seed, park, innings, home_user, away_user,
                            home_club, away_club, home_score, away_score, winner_side, ended_at)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'ranked_stock', 1, 'final', true, 42, 'seoul', 3, :A, :B,
        'seoul', 'busan', 2, 1, 'home', now());
insert into public.match_participants (match_id, side, user_id, club, result, runs_for, runs_against) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'home', :A, 'seoul', 'W', 2, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'away', :B, 'busan', 'L', 1, 2);
-- B bats (top): K, 1B, GO DP. A bats (bottom): HR (1 rbi), BB, 2B (1 rbi), K, FO, KL
insert into public.plate_appearances (match_id, seq, inning, half, batting_side, batter_user, pitcher_user, batter_key, pitcher_key,
                                      outs_before, bases_before, result, rbi, runs_scored, outs_made, pitches, ev_mph, la_deg) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 0, 1, 'top', 'away', :B, :A, 'busan:0', 'seoul:p0', 0, 0, 'K',  0, 0, 1, 4, null, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', 1, 1, 'top', 'away', :B, :A, 'busan:1', 'seoul:p0', 1, 0, '1B', 0, 0, 0, 2, 95, 12),
  ('aaaaaaaa-0000-0000-0000-000000000001', 2, 1, 'top', 'away', :B, :A, 'busan:2', 'seoul:p0', 1, 1, 'DP', 0, 0, 2, 3, 88, -4),
  ('aaaaaaaa-0000-0000-0000-000000000001', 3, 1, 'bot', 'home', :A, :B, 'seoul:0', 'busan:p0', 0, 0, 'HR', 1, 1, 0, 1, 104, 28),
  ('aaaaaaaa-0000-0000-0000-000000000001', 4, 1, 'bot', 'home', :A, :B, 'seoul:1', 'busan:p0', 0, 0, 'BB', 0, 0, 0, 5, null, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', 5, 1, 'bot', 'home', :A, :B, 'seoul:2', 'busan:p0', 0, 1, '2B', 1, 1, 0, 3, 99, 18),
  ('aaaaaaaa-0000-0000-0000-000000000001', 6, 1, 'bot', 'home', :A, :B, 'seoul:3', 'busan:p0', 0, 2, 'K',  0, 0, 1, 3, null, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', 7, 1, 'bot', 'home', :A, :B, 'seoul:4', 'busan:p0', 1, 2, 'FO', 0, 0, 1, 2, 91, 40),
  ('aaaaaaaa-0000-0000-0000-000000000001', 8, 1, 'bot', 'home', :A, :B, 'seoul:5', 'busan:p0', 2, 2, 'KL', 0, 0, 1, 4, null, null);
insert into public.pitches (match_id, pa_seq, seq, pitch_type, mph, plate_x, in_zone, meter_q, outcome, swing_err_ms) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 3, 0, 'FB', 94, 0.1, true, 0.9, 'in_play', 4);

select pg_temp.ok((public.finalize_match('aaaaaaaa-0000-0000-0000-000000000001') = '{"stats": true, "rating": true}'::jsonb), 'finalize applies stats and rating');
select pg_temp.ok((public.finalize_match('aaaaaaaa-0000-0000-0000-000000000001') = '{"stats": false, "rating": false}'::jsonb), 'finalize again is a no-op');

-- A batting: 6 PA, 5 AB, 2 H, 1 2B, 1 HR, 1 BB, 2 SO, 2 RBI. A pitching: 3 BF, 3 outs, 1 H, 1 SO
select pg_temp.ok((select (games, wins, pa, ab, h, b2, hr, bb, so, rbi, bf, outs_pitched, h_allowed, so_pitched, pitches_thrown)
                           = (1, 1, 6, 5, 2, 1, 1, 1, 2, 2, 3, 3, 1, 1, 9)
                   from public.player_stats where user_id = :A and mode = 'ranked_stock' and season_id = 1), 'A season line adds up');
select pg_temp.ok((select count(*) = 2 from public.player_stats where user_id = :A and mode = 'ranked_stock'), 'season + career rows');
select pg_temp.ok((select (losses, runs_allowed, hr_allowed, bb_allowed, outs_pitched) = (1, 2, 1, 1, 3)
                   from public.player_stats where user_id = :B and mode = 'ranked_stock' and season_id = 0), 'B career line adds up');
select pg_temp.ok((select (rating, games, wins) = (1100, 1, 1) from public.ratings where user_id = :A and season_id = 1), 'winner +100');
select pg_temp.ok((select rating = 900 from public.ratings where user_id = :B and season_id = 1), 'loser -100');
select pg_temp.ok((select (rating_before, rating_after) = (1000, 1100) from public.match_participants
                   where match_id = 'aaaaaaaa-0000-0000-0000-000000000001' and side = 'home'), 'participant row shows the rating change');

-- ---------------------------------------------------------------- the same pair farming wins: the 4th of the day earns nothing
do $$ declare i int; mid uuid; begin
  for i in 2..4 loop
    mid := ('aaaaaaaa-0000-0000-0000-00000000000' || i)::uuid;
    insert into public.matches (id, mode, season_id, status, verified, home_user, away_user, home_club, away_club,
                                home_score, away_score, winner_side, ended_at)
    values (mid, 'ranked_stock', 1, 'final', true, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
            'seoul', 'busan', 5, 0, 'home', now());
    insert into public.match_participants (match_id, side, user_id, club, result) values
      (mid, 'home', '11111111-1111-1111-1111-111111111111', 'seoul', 'W'),
      (mid, 'away', '22222222-2222-2222-2222-222222222222', 'busan', 'L');
    perform public.finalize_match(mid);
  end loop; end $$;
select pg_temp.ok((select after = before from public.rating_history
                   where match_id = 'aaaaaaaa-0000-0000-0000-000000000004' and user_id = :A), '4th win vs same player in a day: no rating');
select pg_temp.ok((select after > before from public.rating_history
                   where match_id = 'aaaaaaaa-0000-0000-0000-000000000003' and user_id = :A), '3rd still counts');

-- ---------------------------------------------------------------- a single-player game: stats under its own mode, never rated
insert into public.matches (id, mode, status, home_user, home_club, away_club, home_score, away_score, winner_side, ended_at)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'arcade', 'self_reported', :C, 'daejeon', 'seoul', 3, 1, 'home', now());
insert into public.match_participants (match_id, side, user_id, club, result) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'home', :C, 'daejeon', 'W'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'away', null, 'seoul', 'L');
insert into public.plate_appearances (match_id, seq, inning, half, batting_side, batter_user, pitcher_user, batter_key, pitcher_key,
                                      outs_before, bases_before, result, rbi, runs_scored, outs_made) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 0, 1, 'bot', 'home', :C, null, 'fa:b3', 'seoul:p1', 0, 0, 'HR', 1, 1, 0);
select pg_temp.ok((public.finalize_match('bbbbbbbb-0000-0000-0000-000000000001') = '{"stats": true, "rating": false}'::jsonb), 'single player: stats, no rating');
select pg_temp.ok((select hr = 1 from public.player_stats where user_id = :C and mode = 'arcade' and season_id = 0), 'arcade HR on its own line');
select pg_temp.ok((not exists (select 1 from public.leaderboard_ranked where user_id = :C)), 'single player never on the ranked board');

-- ---------------------------------------------------------------- rules the database itself enforces
do $$ begin
  begin insert into public.matches (mode, status, home_user, away_user) values ('ranked_stock', 'pending',
          '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
        raise exception 'FAIL: ranked without season accepted';
  exception when check_violation then raise notice 'ok  ranked match needs a season'; end;
  begin insert into public.matches (mode, status, verified) values ('arcade', 'self_reported', true);
        raise exception 'FAIL: verified single player accepted';
  exception when check_violation then raise notice 'ok  single player can never be verified'; end;
  begin insert into public.matches (mode, season_id, status, home_user, away_user) values ('ranked_stock', 1, 'pending',
          '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');
        raise exception 'FAIL: player vs self accepted';
  exception when check_violation then raise notice 'ok  ranked needs two different players'; end;
  begin perform public.apply_ranked_rating('bbbbbbbb-0000-0000-0000-000000000001');
        raise exception 'FAIL: rated a single-player game';
  exception when raise_exception then raise notice 'ok  rating refuses a non-ranked match'; end;
end $$;

-- ---------------------------------------------------------------- coins: idempotent, never negative
select pg_temp.ok((public.grant_coins(:A, 100, 'ranked_win', 'ranked_win:m1:a') = 100), 'grant 100');
select pg_temp.ok((public.grant_coins(:A, 100, 'ranked_win', 'ranked_win:m1:a') = 100), 'same key again: still 100');
select pg_temp.ok((public.grant_coins(:A, -60, 'pack_purchase', 'pack:p1') = 40), 'spend 60');
do $$ begin
  begin perform public.grant_coins('11111111-1111-1111-1111-111111111111', -100, 'pack_purchase', 'pack:p2');
        raise exception 'FAIL: overdraft accepted';
  exception when raise_exception then raise notice 'ok  cannot overdraw'; end; end $$;
select pg_temp.ok((select count(*) = 2 from public.coin_ledger where user_id = :A), 'ledger has exactly the two real lines');
reset role;

-- ---------------------------------------------------------------- what a signed-in browser can and can't do (player A)
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((select count(*) >= 1 from public.leaderboard_ranked), 'A reads the leaderboard');
select pg_temp.ok((select username = 'BeefDirky' from public.leaderboard_ranked where rank = 1), 'board shows usernames, A on top');
select pg_temp.ok((select count(*) = 1 from public.pitches), 'A sees pitches of his own match');
select pg_temp.ok((select coins = 40 from public.wallets), 'A sees his own wallet');
do $$ begin
  begin update public.ratings set rating = 3000; raise exception 'FAIL: browser changed a rating';
  exception when insufficient_privilege then raise notice 'ok  browser cannot change ratings'; end;
  begin insert into public.player_stats (user_id, mode, hr) values ('11111111-1111-1111-1111-111111111111', 'ranked_stock', 99);
        raise exception 'FAIL: browser wrote stats';
  exception when insufficient_privilege then raise notice 'ok  browser cannot write stats'; end;
  begin update public.wallets set coins = 999999; raise exception 'FAIL: browser changed coins';
  exception when insufficient_privilege then raise notice 'ok  browser cannot change coins'; end;
  begin insert into public.matches (mode, status) values ('arcade', 'self_reported'); raise exception 'FAIL: browser created a match';
  exception when insufficient_privilege then raise notice 'ok  browser cannot create matches'; end;
  begin perform public.finalize_match('aaaaaaaa-0000-0000-0000-000000000002'); raise exception 'FAIL: browser ran finalize';
  exception when insufficient_privilege then raise notice 'ok  browser cannot run finalize'; end;
  begin perform public.grant_coins('11111111-1111-1111-1111-111111111111', 500, 'x_x', 'k'); raise exception 'FAIL: browser granted coins';
  exception when insufficient_privilege then raise notice 'ok  browser cannot grant coins'; end;
end $$;
-- the existing save flow still works for its owner
update public.saves set data = '{"pd-wallet":"y"}' where user_id = :A;
select pg_temp.ok((select data->>'pd-wallet' = 'y' from public.saves), 'cloud save still writable by its owner');

-- player C (no ranked games) can't see A and B's private detail
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select pg_temp.ok((select count(*) = 0 from public.pitches), 'C cannot see A/B pitches');
select pg_temp.ok((select count(*) = 0 from public.plate_appearances where match_id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'C cannot see A/B plate appearances');
select pg_temp.ok((select count(*) = 0 from public.wallets), 'C cannot see A wallet');
select pg_temp.ok((select count(*) = 4 from public.matches where mode = 'ranked_stock'), 'C sees finished verified matches (history)');
select pg_temp.ok((select count(*) = 1 from public.matches where mode = 'arcade'), 'C sees his own self-reported game');
reset role; reset request.jwt.claim.sub;

-- logged-out visitor
set role anon;
select pg_temp.ok((select count(*) = 2 from public.leaderboard_ranked), 'visitor reads the leaderboard');
select pg_temp.ok((select count(*) = 0 from public.matches where mode = 'arcade'), 'visitor cannot see self-reported games');
select pg_temp.ok((select count(*) = 0 from public.coin_ledger), 'visitor sees no ledger');
reset role;
\echo ALL TESTS PASSED
