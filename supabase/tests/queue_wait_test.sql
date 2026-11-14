-- Behaviour tests for migrations/004_queue_wait.sql: the queue's estimated wait.
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
delete from public.ranked_queue; delete from public.ranked_queue_waits;
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.queue_join('seoul','{busan}','v9')->>'est_secs') is null, 'no estimate before any matches');
reset role;
update public.ranked_queue set joined_at = now() - interval '40 seconds';
set role authenticated; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.ok((public.queue_join('busan','{seoul}','v9')->>'queue') = 'matched', 'a pairing happens');
reset role;
select pg_temp.ok((select count(*) = 2 and max(wait_secs) between 39 and 42 from public.ranked_queue_waits), 'both players'' waits recorded (40 s and ~0 s)');
insert into public.ranked_queue_waits (wait_secs) values (30), (50);
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.queue_join('seoul','{busan}','v9')->>'est_secs')::int between 29 and 41, 'estimate: the median of recent waits');
select public.queue_leave();
do $$ begin perform 1 from public.ranked_queue_waits; raise exception 'FAIL: browser read the waits table';
 exception when insufficient_privilege then raise notice 'ok  browsers can''t read the waits table'; end $$;
reset role;
\echo ALL WAIT TESTS PASSED
