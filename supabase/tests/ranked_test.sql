-- Behaviour tests for migrations/002_ranked.sql, using real match records the game produced (game_logs.sql).
\set A '\'11111111-1111-1111-1111-111111111111\''
\set B '\'22222222-2222-2222-2222-222222222222\''
\set C '\'33333333-3333-3333-3333-333333333333\''
\i supabase/tests/game_logs.sql
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
-- a log with one change: path, new value
create or replace function pg_temp.tweak(n int, path text[], v jsonb) returns jsonb language sql as $$
  select jsonb_set(log, path, v) from pg_temp.logs where logs.n = $1 $$;
grant select on pg_temp.logs to authenticated;
-- the first plate appearance in game n with the given result(s)
create or replace function pg_temp.first(n int, results text[]) returns int language sql as $$
  select min(o - 1)::int from pg_temp.logs, jsonb_array_elements(log->'pa') with ordinality t(x, o) where logs.n = $1 and x->>'r' = any($2) $$;

-- ---------------------------------------------------------------- the validator on real games and on tampered copies
select pg_temp.ok((select bool_and(public.pd_validate_log(log, 'full') is null) from pg_temp.logs), 'three real games validate');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, '{fin,home}', '5'), 'full') is not null, 'changed final score rejected');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, '{fin,line,away,0}', '3'), 'full') is not null, 'changed line score rejected');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, array['pa', pg_temp.first(0, '{K,KL,GO,FO}')::text, 'om'], '0'), 'full') is not null, 'removed an out rejected');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, array['pa', pg_temp.first(0, '{K}')::text, 'r'], '"HR"'), 'full') is not null, 'strikeout turned into a homer rejected');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, '{pa,0,h}', '"bot"'), 'full') is not null, 'wrong half rejected');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, '{sched}', '9'), 'full') is not null, 'a 3-inning game claimed as 9 rejected');
select pg_temp.ok(public.pd_validate_log('{"v":1}'::jsonb, 'full') is not null, 'empty log rejected');
select pg_temp.ok(public.pd_validate_log('"junk"'::jsonb, 'full') is not null, 'junk rejected');
select pg_temp.ok(public.pd_validate_log(pg_temp.tweak(0, '{pa}', '[]'), 'full') is not null, 'no plate appearances rejected');
reset role;

-- (the core tests' A-v-B matches were today: move them back so the anti-farming rule doesn't zero this one)
update public.matches set ended_at = now() - interval '2 days' where mode = 'ranked_stock';
-- ---------------------------------------------------------------- a ranked match, start to finish
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.fails($$select public.ranked_open('seoul','seoul',3)$$, 'same club both sides');
select pg_temp.fails($$select public.ranked_open('seoul','gwangju',4)$$, '4-inning ranked game');
select (public.ranked_open('seoul','gwangju',3)->>'match_id')::uuid as mid \gset
select pg_temp.ok((public.ranked_info(:'mid')->>'seed') is null, 'no seed before the opponent joins');
-- C has no username yet: can't join
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select pg_temp.fails(format('select public.ranked_join(%L)', :'mid'), 'joining without a username');
-- A can't join his own match
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.fails(format('select public.ranked_join(%L)', :'mid'), 'playing yourself');
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.ok((public.ranked_join(:'mid')->>'seed') is not null, 'B joins; the server rolls the seed');
select pg_temp.ok((public.ranked_join(:'mid')->>'status') = 'live', 'joining twice is harmless');
select public.ranked_info(:'mid')->>'seed' as seed_b \gset
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok(public.ranked_info(:'mid')->>'seed' = :'seed_b', 'both players see the same seed');
select pg_temp.ok(public.ranked_info(:'mid')->>'away_name' = 'Rival', 'info carries usernames');
select public.ranked_ping(:'mid');
-- a bystander can't look, submit or claim
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select pg_temp.fails(format('select public.ranked_info(%L)', :'mid'), 'bystander reads match info');
select pg_temp.fails(format('select public.ranked_submit(%L, %L, %L::jsonb)', :'mid', repeat('a', 64), (select log from pg_temp.logs where n = 0)), 'bystander submits');
-- A submits game 0 (home seoul, away gwangju, 3 innings); first submission alone settles nothing
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.ranked_submit(:'mid', repeat('a', 64), (select log from pg_temp.logs where n = 0))->>'status') = 'live', 'one submission: still waiting');
select pg_temp.ok((public.ranked_submit(:'mid', repeat('f', 64), pg_temp.tweak(0, '{fin,home}', '9'))->>'submitted') = '1', 'resubmitting (even a different log) is ignored');
reset role;
select coalesce(sum(pa),0) as pa0, coalesce(sum(h),0) as h0, coalesce(sum(outs_pitched),0) as o0
  from public.player_stats where mode = 'ranked_stock' and season_id = 0 and user_id in (:A, :B) \gset
-- what the log itself says: real PAs, hits, outs
select count(*) filter (where x->>'r' <> 'OTHER') as lpa, count(*) filter (where x->>'r' in ('1B','2B','3B','HR')) as lh,
       sum((x->>'om')::int) as lo, sum(jsonb_array_length(x->'p')) as lp, count(*) as lall
  from pg_temp.logs, jsonb_array_elements(log->'pa') x where n = 0 \gset
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.ranked_submit(:'mid', repeat('a', 64), (select log from pg_temp.logs where n = 0)) as res \gset
select pg_temp.ok((:'res'::jsonb->>'status') = 'final', 'both agree: final');
select pg_temp.ok((:'res'::jsonb->>'winner_side') = 'away', 'winner from the log (gwangju 1-0)');
select pg_temp.ok((:'res'::jsonb->>'rating_after')::int > (:'res'::jsonb->>'rating_before')::int, 'winner B gains rating');
select pg_temp.ok((select count(*) from public.plate_appearances where match_id = :'mid') = :lall, 'every plate appearance written');
select pg_temp.ok((select count(*) from public.pitches where match_id = :'mid') = :lp, 'every pitch written');
reset role;
select pg_temp.ok((select sum(pa) - :pa0 = :lpa and sum(h) - :h0 = :lh from public.player_stats where mode = 'ranked_stock' and season_id = 0 and user_id in (:A, :B)),
                  'batting lines grew by exactly the log''s PAs and hits');
select pg_temp.ok((select sum(outs_pitched) - :o0 = :lo from public.player_stats where mode = 'ranked_stock' and season_id = 0 and user_id in (:A, :B)),
                  'pitchers credited with every out in the log');
select pg_temp.ok((select wins >= 1 from public.leaderboard_ranked where season_id = 1 and username = 'Rival'), 'Rival is on the board with the win');

-- ---------------------------------------------------------------- disagreements are disputes, never results
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
reset role; update public.matches set created_at = created_at - interval '2 minutes'; update public.match_submissions set submitted_at = submitted_at - interval '1 minute'; set role authenticated;
select (public.ranked_open('busan','daegu',3)->>'match_id')::uuid as m2 \gset
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.ranked_join(:'m2');
select public.ranked_submit(:'m2', repeat('b', 64), (select log from pg_temp.logs where n = 1));
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.ranked_submit(:'m2', repeat('c', 64), pg_temp.tweak(1, '{fin,home}', '7'))->>'status') = 'disputed', 'different records: disputed');
reset role; update public.matches set created_at = created_at - interval '2 minutes'; update public.match_submissions set submitted_at = submitted_at - interval '1 minute'; set role authenticated;
select (public.ranked_open('busan','daegu',3)->>'match_id')::uuid as m3 \gset
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.ranked_join(:'m3');
select public.ranked_submit(:'m3', repeat('b', 64), (select log from pg_temp.logs where n = 1));
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.ranked_submit(:'m3', repeat('b', 64), (select log from pg_temp.logs where n = 1), '[{"why":"state"}]')->>'status') = 'disputed',
                  'same record but a phone saw tampering: disputed');
reset role; update public.matches set created_at = created_at - interval '2 minutes'; update public.match_submissions set submitted_at = submitted_at - interval '1 minute'; set role authenticated;
select (public.ranked_open('seoul','gwangju',3)->>'match_id')::uuid as m4 \gset
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.ranked_join(:'m4');
select public.ranked_submit(:'m4', repeat('d', 64), pg_temp.tweak(0, '{fin,home}', '5'));
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.ranked_submit(:'m4', repeat('d', 64), pg_temp.tweak(0, '{fin,home}', '5'))->>'dispute') like '%line score%',
                  'both phones agree on an impossible game: still rejected by the validator');
reset role;
select pg_temp.ok((select count(*) = 0 from public.matches where id in (:'m2', :'m3', :'m4') and (verified or stats_applied_at is not null)), 'none of the three disputed matches counts');
select pg_temp.ok((select count(*) = 0 from public.rating_history where match_id in (:'m2', :'m3', :'m4')), 'disputes changed no rating');

-- ---------------------------------------------------------------- forfeits
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
reset role; update public.matches set created_at = created_at - interval '2 minutes'; update public.match_submissions set submitted_at = submitted_at - interval '1 minute'; set role authenticated;
select (public.ranked_open('incheon','daejeon',3)->>'match_id')::uuid as m5 \gset
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.ranked_join(:'m5');
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.fails(format('select public.ranked_claim(%L)', :'m5'), 'claiming in the first minute');
reset role;
update public.matches set started_at = now() - interval '10 minutes' where id = :'m5';
set role authenticated;
select pg_temp.fails(format('select public.ranked_claim(%L)', :'m5'), 'claiming while the opponent is still here');
reset role;
update public.match_participants set last_seen_at = now() - interval '40 seconds' where match_id = :'m5' and side = 'away';
set role authenticated;
select pg_temp.fails(format('select public.ranked_claim(%L)', :'m5'), 'opponent gone only 40 seconds: no forfeit yet');
reset role;
update public.match_participants set last_seen_at = now() - interval '70 seconds' where match_id = :'m5' and side = 'away';
set role authenticated;
select pg_temp.ok((public.ranked_claim(:'m5')->>'status') = 'forfeit', 'opponent gone over a minute: forfeit win');
reset role;
select pg_temp.ok((select after > before from public.rating_history where match_id = :'m5' and user_id = :A), 'forfeit counted for rating');
select pg_temp.ok((select count(*) = 0 from public.plate_appearances where match_id = :'m5'), 'forfeit writes no batting lines');

-- ---------------------------------------------------------------- self-reported games
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select pg_temp.ok((public.report_match((select log from pg_temp.logs where n = 2))->>'match_id') is not null, 'single-player game reported');
select pg_temp.fails($$select public.report_match((select log from pg_temp.logs where n = 1))$$, 'a second report within 20 seconds');
reset role;
select pg_temp.ok((select games = 1 and wins = 1 from public.player_stats where user_id = :C and mode = 'full' and season_id = 0), 'C''s vs-CPU line: 1 game, 1 win');
select pg_temp.ok((select pa > 0 and bf > 0 from public.player_stats where user_id = :C and mode = 'full' and season_id = 0), 'C credited with his batting and pitching');
select pg_temp.ok((not exists (select 1 from public.leaderboard_ranked where user_id = :C)), 'self-reported games never reach the board');
update public.matches set created_at = now() - interval '1 minute' where status = 'self_reported';
set role authenticated;
select pg_temp.fails(format('select public.report_match(%L::jsonb)', pg_temp.tweak(1, '{fin,away}', '9')), 'a doctored self-report');
select pg_temp.fails(format('select public.report_match(%L::jsonb)', pg_temp.tweak(1, '{mode}', '"ranked_stock"')), 'self-reporting a ranked result');
reset role;

-- ---------------------------------------------------------------- logged out
set role anon;
select pg_temp.fails($$select public.ranked_open('seoul','busan',3)$$, 'visitor opens a ranked match');
select pg_temp.fails($$select public.report_match('{}'::jsonb)$$, 'visitor reports a game');
reset role;
\echo ALL RANKED TESTS PASSED
