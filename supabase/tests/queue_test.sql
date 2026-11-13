-- Behaviour tests for migrations/003_queue.sql: the ranked queue and the flat ±100 rating.
\set A '\'11111111-1111-1111-1111-111111111111\''
\set B '\'22222222-2222-2222-2222-222222222222\''
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
set role authenticated;
-- C has no username: can't queue
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select pg_temp.fails($$select public.queue_join('seoul', '{busan}', 'v1')$$, 'queueing without a username');
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.my_rating()->>'rating')::int >= 0, 'my_rating answers');
select pg_temp.ok((public.queue_join('seoul', '{seoul,busan,daegu}', 'v1')->>'queue') = 'waiting', 'A waits alone');
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.ok((public.queue_join('seoul', '{seoul,busan}', 'v2')->>'queue') = 'waiting', 'B on another build is not paired with A');
select public.queue_join('seoul', '{seoul,busan}', 'v1') as qb \gset
select pg_temp.ok((:'qb'::jsonb->>'queue') = 'matched', 'B on the same build: paired at once');
select pg_temp.ok((:'qb'::jsonb->'info'->>'me') = 'away', 'B (joined later) is away');
select pg_temp.ok((:'qb'::jsonb->'info'->>'away_club') = 'busan', 'both picked seoul: B plays his next choice');
select pg_temp.ok((:'qb'::jsonb->'info'->>'innings') = '3' and (:'qb'::jsonb->'info'->>'seed') is not null, '3 innings, server seed');
select pg_temp.ok((public.queue_poll()->>'queue') = 'gone', 'after being matched B is out of the queue');
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.queue_poll() as qa \gset
select pg_temp.ok((:'qa'::jsonb->>'queue') = 'matched' and (:'qa'::jsonb->'info'->>'me') = 'home'
                  and (:'qa'::jsonb->'info'->>'match_id') = (:'qb'::jsonb->'info'->>'match_id'), 'A hears the same match, as home');
select pg_temp.ok((:'qa'::jsonb->'info'->>'away_name') = 'Rival', 'A sees his opponent''s username');
-- leaving
select public.queue_join('daegu', '{}', 'v1');
select public.queue_leave();
select pg_temp.ok((public.queue_poll()->>'queue') = 'gone', 'leaving the queue');
reset role;
select pg_temp.ok((select count(*) = 0 from public.ranked_queue), 'queue empty');
-- someone who stopped polling isn't paired
insert into public.ranked_queue (user_id, club, clubs, version, polled_at) values (:A, 'seoul', '{}', 'v1', now() - interval '1 minute');
set role authenticated; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.ok((public.queue_join('busan', '{}', 'v1')->>'queue') = 'waiting', 'a player who stopped polling is not paired');
select public.queue_leave();
-- browsers can't touch the queue table
select pg_temp.fails($$select * from public.ranked_queue$$, 'reading the queue table directly');
select pg_temp.fails($$insert into public.ranked_queue (user_id, club, clubs, version) values ('22222222-2222-2222-2222-222222222222','x','{}','v')$$, 'writing the queue table directly');
reset role;

-- flat rating: +100 / -100, never below 0
update public.matches set ended_at = now() - interval '2 days' where mode = 'ranked_stock';
update public.ratings set rating = 50 where user_id = :B;
insert into public.matches (id, mode, season_id, status, verified, home_user, away_user, home_club, away_club, home_score, away_score, winner_side, ended_at)
values ('dddddddd-0000-0000-0000-000000000001', 'ranked_stock', 1, 'final', true, :A, :B, 'seoul', 'busan', 4, 2, 'home', now());
insert into public.match_participants (match_id, side, user_id, club, result) values
  ('dddddddd-0000-0000-0000-000000000001', 'home', :A, 'seoul', 'W'), ('dddddddd-0000-0000-0000-000000000001', 'away', :B, 'busan', 'L');
select public.finalize_match('dddddddd-0000-0000-0000-000000000001');
select pg_temp.ok((select after - before = 100 from public.rating_history where match_id = 'dddddddd-0000-0000-0000-000000000001' and user_id = :A), 'win: +100');
select pg_temp.ok((select after = 0 from public.rating_history where match_id = 'dddddddd-0000-0000-0000-000000000001' and user_id = :B), 'loss from 50: stops at 0');
\echo ALL QUEUE TESTS PASSED
