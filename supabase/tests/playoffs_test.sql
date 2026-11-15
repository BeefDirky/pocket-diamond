-- migration 014: friends playoffs
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
insert into auth.users(id,email) values ('14000000-0000-0000-0000-000000000001','p1@x.co'),('14000000-0000-0000-0000-000000000002','p2@x.co'),('14000000-0000-0000-0000-000000000003','p3@x.co') on conflict do nothing;
insert into public.profiles(user_id,username) values ('14000000-0000-0000-0000-000000000001','Host_P'),('14000000-0000-0000-0000-000000000002','Pal_P'),('14000000-0000-0000-0000-000000000003','Stranger_P') on conflict do nothing;
insert into public.friendships(user_lo,user_hi,requester,status) values ('14000000-0000-0000-0000-000000000001','14000000-0000-0000-0000-000000000002','14000000-0000-0000-0000-000000000001','accepted') on conflict do nothing;
create temp table tt(tid bigint, sa bigint);grant all on tt to authenticated;
set role authenticated;
set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
insert into tt(tid) select public.tourney_create('seoul');
select pg_temp.fails($$select public.tourney_create('busan')$$, 'a second playoff while in one');
select pg_temp.fails($$select public.tourney_invite((select tid from tt),'14000000-0000-0000-0000-000000000003')$$, 'inviting a non-friend');
select pg_temp.ok(public.tourney_invite((select tid from tt),'14000000-0000-0000-0000-000000000002')='invited', 'invite a friend');
set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000002';
select pg_temp.ok((select count(*) from public.tourney_inbox() where host_name='Host_P')=1, 'the friend sees the playoff invite');
select pg_temp.fails($$select public.tourney_start((select tid from tt))$$, 'only the host can start');
select pg_temp.ok(public.tourney_respond((select tid from tt), true, 'busan')='joined', 'the friend joins');
set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
select pg_temp.ok(public.tourney_start((select tid from tt))='running', 'start');
reset role;
select pg_temp.ok((select count(*) from public.tourney_players where tid=(select tid from tt) and status='bot')=6, 'six CPU clubs fill the bracket');
select pg_temp.ok((select count(distinct seed) from public.tourney_players where tid=(select tid from tt) and seed is not null)=8, 'eight seeds');
select pg_temp.ok((select count(distinct club) from public.tourney_players where tid=(select tid from tt) and seed is not null)=8, 'eight different clubs');
set role authenticated;set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
select pg_temp.ok((select jsonb_array_length(s->'series')>=4 from (select public.tourney_state() s) x), 'state: the bracket, found without an id');
reset role;
select pg_temp.ok((select count(*) from public.tourney_series where tid=(select tid from tt) and round=1 and status='done')>=2, 'CPU vs CPU series settle at once');
select pg_temp.ok((select bool_and(need=2) from public.tourney_series where tid=(select tid from tt) and round=1), 'quarterfinals are best of 3');
-- play the host's quarterfinal: win two games
update tt set sa=(select s.id from public.tourney_series s join public.tourney_players p on p.tid=s.tid and p.seed in (s.seed_a,s.seed_b) where s.tid=(select tid from tt) and p.user_id='14000000-0000-0000-0000-000000000001' and s.round=1);
set role authenticated;set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
select pg_temp.fails($$select public.tourney_report((select sa from tt),1,3,3)$$, 'a tied game');
select public.tourney_report((select sa from tt),1,5,2);
select public.tourney_report((select sa from tt),1,0,9);
reset role;select pg_temp.ok((select wins_a+wins_b from public.tourney_series where id=(select sa from tt))=1, 'a second report of the same game is ignored');set role authenticated;set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
select pg_temp.ok((public.tourney_report((select sa from tt),2,4,1)->>'status')='done', 'two wins take a best-of-3');
set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000003';
select pg_temp.fails($$select public.tourney_report((select sa from tt),3,4,1)$$, 'someone outside the series can''t report');
-- the friend leaves: their series is lost; the bracket keeps going
set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000002';
select public.tourney_leave((select tid from tt));
set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
reset role;select pg_temp.ok((select round from public.tourneys where id=(select tid from tt))>=2, 'round 1 done, on to the semifinals');
-- play out the host's remaining series until the end (always winning)
set role authenticated;set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
do $$ declare s record; n int; begin
  for n in 1..20 loop
    select (e->>'id')::bigint id,(e->>'wins_a')::int wins_a,(e->>'wins_b')::int wins_b into s from jsonb_array_elements(public.tourney_state()->'series') e
      where e->>'status'='open' and (select (pl->>'seed')::int from jsonb_array_elements(public.tourney_state()->'players') pl where (pl->>'me')::boolean) in ((e->>'seed_a')::int,(e->>'seed_b')::int);
    exit when not found;
    perform public.tourney_report(s.id, s.wins_a+s.wins_b+1, 6, 1);
  end loop; end $$;
reset role;
select pg_temp.ok((select need from public.tourney_series where tid=(select tid from tt) and round=3)=3, 'the final is best of 5');
select pg_temp.ok((select status='done' and champion=(select seed from public.tourney_players where tid=(select tid from tt) and user_id='14000000-0000-0000-0000-000000000001') from public.tourneys where id=(select tid from tt)), 'the host is champion');
set role authenticated;set request.jwt.claim.sub = '14000000-0000-0000-0000-000000000001';
select pg_temp.ok((select (s->>'status')='done' from (select public.tourney_state() s) x), 'state shows it done');
reset role;
select pg_temp.ok((select count(*) from public.ratings where user_id in ('14000000-0000-0000-0000-000000000001','14000000-0000-0000-0000-000000000002'))=0, 'ranked ratings untouched');
\echo ALL PLAYOFF TESTS PASSED
