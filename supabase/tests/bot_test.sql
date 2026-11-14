-- Behaviour tests for migrations/007_bots.sql: ranked bots after 15 seconds, bot ratings, and the lower rating hosting.
\set A '\'11111111-1111-1111-1111-111111111111\''
\set B '\'22222222-2222-2222-2222-222222222222\''
\i supabase/tests/game_logs.sql
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
grant select on pg_temp.logs to authenticated;
-- log 2 is incheon (home) 1, daejeon 0: a home win, as the person
create or replace function pg_temp.win() returns jsonb language sql as $$ select jsonb_set(log, '{me}', '"home"') from pg_temp.logs where n = 2 $$;
create or replace function pg_temp.loss() returns jsonb language sql as $$ select jsonb_set(jsonb_set(log, '{me}', '"home"'), '{home}', '"incheon"') from pg_temp.logs where n = 2 $$;

select pg_temp.ok(public.pd_bot_level(1000) = 3 and public.pd_bot_level(0) = 1 and public.pd_bot_level(1450) = 6 and public.pd_bot_level(5000) = 10, 'bot level follows rating (1000 → 3, capped 1..10)');
update public.ratings set rating = 1000 where user_id in (:A, :B);
delete from public.ranked_queue;

-- ---------------------------------------------------------------- the lower rating hosts
update public.ratings set rating = 1300 where user_id = :A;
update public.ratings set rating = 900 where user_id = :B;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.queue_join('seoul', '{busan}', 'v1');
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.queue_join('seoul', '{busan}', 'v1') as qb \gset
select pg_temp.ok((:'qb'::jsonb->'info'->>'me') = 'home' and (:'qb'::jsonb->'info'->>'home_club') = 'seoul' and (:'qb'::jsonb->'info'->>'away_club') = 'busan',
  'B (900) joined later but has the lower rating: B is home; A plays his next club');
reset role; delete from public.ranked_queue; update public.ratings set rating = 1000 where user_id in (:A, :B);

-- ---------------------------------------------------------------- 15 seconds alone: a bot
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.queue_bot('gwangju')->>'queue') = 'gone', 'no bot unless you are in the queue');
select public.queue_join('incheon', '{busan}', 'v1');
select pg_temp.ok((public.queue_bot('daejeon')->>'queue') = 'waiting', 'too early for a bot (under 15 seconds)');
reset role; update public.ranked_queue set joined_at = now() - interval '16 seconds' where user_id = :A; set role authenticated;
select pg_temp.fails($$select public.queue_bot('incheon')$$, 'a bot in your own club');
select public.queue_bot('daejeon') as qbot \gset
select pg_temp.ok((:'qbot'::jsonb->>'queue') = 'matched' and (:'qbot'::jsonb->'info'->>'mode') = 'ranked_bot', 'after 15 seconds: a bot match');
select (:'qbot'::jsonb->'info'->>'match_id')::uuid as bm \gset
select pg_temp.ok((:'qbot'::jsonb->'info'->>'me') = 'home' and (:'qbot'::jsonb->'info'->>'bot_level') = '3' and (:'qbot'::jsonb->'info'->>'away_name') = 'CPU · LV 3',
  'you host a level-3 bot at 1000');
select pg_temp.ok((public.queue_poll()->>'queue') = 'gone', 'and you are out of the queue');
-- the record
select pg_temp.ok((public.bot_submit(:'bm', pg_temp.win())->>'status') = 'disputed', 'a result after a few seconds is not believed');
reset role;
delete from public.ranked_queue;
-- a fresh bot match that has been going two minutes
insert into public.matches (id, mode, season_id, status, seed, innings, home_user, home_club, away_club, started_at, bot_level)
values ('b0700000-0000-0000-0000-000000000001', 'ranked_bot', 1, 'live', 1, 3, :A, 'incheon', 'daejeon', now() - interval '2 minutes', 3);
insert into public.match_participants (match_id, side, user_id, club) values ('b0700000-0000-0000-0000-000000000001', 'home', :A, 'incheon'), ('b0700000-0000-0000-0000-000000000001', 'away', null, 'daejeon');
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.fails($$select public.bot_submit('b0700000-0000-0000-0000-000000000001', pg_temp.win())$$, 'someone else submitting your bot game');
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.bot_submit('b0700000-0000-0000-0000-000000000001', jsonb_set(pg_temp.win(), '{fin,home}', '5'))->>'status') = 'disputed', 'a doctored record is not counted');
reset role;
update public.matches set status = 'live', dispute_reason = null where id = 'b0700000-0000-0000-0000-000000000001';
set role authenticated;
select public.bot_submit('b0700000-0000-0000-0000-000000000001', pg_temp.win()) as r \gset
select pg_temp.ok((:'r'::jsonb->>'status') = 'final' and (:'r'::jsonb->>'winner_side') = 'home', 'a real 1-0 win over the bot is final');
select pg_temp.ok((:'r'::jsonb->>'rating_before') = '1000' and (:'r'::jsonb->>'rating_after') = '1100', 'and worth +100');
select pg_temp.ok((public.bot_submit('b0700000-0000-0000-0000-000000000001', pg_temp.win())->>'rating_after') = '1100', 'submitting twice changes nothing');
reset role;
select pg_temp.ok((select count(*) = 1 from public.player_stats where user_id = :A and mode = 'ranked_bot' and season_id = 1 and wins = 1), 'stats go to their own ranked_bot line');
select pg_temp.ok((select games from public.ratings where user_id = :A and season_id = 1) >= 1, 'the game counts on the ladder');
-- walking out of a bot game is a loss (found the next time you ask for one)
update public.ranked_queue set joined_at = now() - interval '20 seconds';
insert into public.matches (id, mode, season_id, status, seed, innings, home_user, home_club, away_club, started_at, bot_level)
values ('b0700000-0000-0000-0000-000000000002', 'ranked_bot', 1, 'live', 1, 3, :A, 'incheon', 'daejeon', now() - interval '5 minutes', 4);
insert into public.match_participants (match_id, side, user_id, club) values ('b0700000-0000-0000-0000-000000000002', 'home', :A, 'incheon'), ('b0700000-0000-0000-0000-000000000002', 'away', null, 'daejeon');
set role authenticated;
select public.queue_join('incheon', '{busan}', 'v1');
reset role; update public.ranked_queue set joined_at = now() - interval '20 seconds'; set role authenticated;
select public.queue_bot('daejeon') as q2 \gset
reset role;
select pg_temp.ok((select status = 'forfeit' and winner_side = 'away' from public.matches where id = 'b0700000-0000-0000-0000-000000000002'), 'the abandoned bot game became a loss');
select pg_temp.ok((select after - before from public.rating_history where match_id = 'b0700000-0000-0000-0000-000000000002') = -100, 'worth -100');
-- conceding the new one
set role authenticated;
select pg_temp.ok((public.ranked_concede((:'q2'::jsonb->'info'->>'match_id')::uuid)->>'status') = 'forfeit', 'Forfeit in a bot game: a loss');
reset role;
\echo ALL BOT TESTS PASSED
