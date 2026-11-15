-- migration 011: friends
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
insert into auth.users(id,email) values ('11000000-0000-0000-0000-000000000001','f1@x.co'),('11000000-0000-0000-0000-000000000002','f2@x.co'),('11000000-0000-0000-0000-000000000003','f3@x.co') on conflict do nothing;
insert into public.profiles(user_id,username) values ('11000000-0000-0000-0000-000000000001','Ace_One'),('11000000-0000-0000-0000-000000000002','Bat_Two'),('11000000-0000-0000-0000-000000000003','Cat_Three') on conflict do nothing;
set role authenticated;
select pg_temp.fails($$select * from public.friendships$$, 'reading the table directly');
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000001';
select pg_temp.fails($$select public.friend_request('bat_two')$$, 'the wrong capitals don''t find anyone');
select pg_temp.ok((public.friend_request('Bat_Two')->>'status')='sent', 'a request by exact username');
select pg_temp.ok((public.friend_request('Bat_Two')->>'status')='sent', 'asking twice is harmless');
select pg_temp.fails($$select public.friend_request('Nobody_Here')$$, 'a username that doesn''t exist');
select pg_temp.fails($$select public.friend_request('Ace_One')$$, 'friending yourself');
select pg_temp.ok((select state from public.friends_list() where username='Bat_Two')='outgoing', 'the sender sees it as outgoing');
select pg_temp.fails($$select public.friend_respond('11000000-0000-0000-0000-000000000002', true)$$, 'accepting your own request');
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000002';
select pg_temp.ok((select state from public.friends_list() where username='Ace_One')='incoming', 'the other player sees it as incoming');
select pg_temp.ok((public.friend_respond('11000000-0000-0000-0000-000000000001', true)->>'status')='accepted', 'accept');
select pg_temp.ok((select state from public.friends_list() where username='Ace_One')='friend', 'now friends (their side)');
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000001';
select pg_temp.ok((select state='friend' and rating=1000 from public.friends_list() where username='Bat_Two'), 'now friends (my side), with a rating');
-- crossing requests: C asks A, A asks C → friends at once
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000003';
select public.friend_request('Ace_One');
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000001';
select pg_temp.ok((public.friend_request('Cat_Three')->>'status')='accepted', 'asking someone who already asked you makes you friends');
select pg_temp.ok((select count(*) from public.friends_list() where state='friend')=2, 'two friends');
select public.friend_remove('11000000-0000-0000-0000-000000000003');
select pg_temp.ok((select count(*) from public.friends_list())=1, 'unfriend');
-- decline
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000003';
select public.friend_request('Bat_Two');
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000002';
select public.friend_respond('11000000-0000-0000-0000-000000000003', false);
select pg_temp.ok(not exists(select 1 from public.friends_list() where username='Cat_Three'), 'declined requests disappear');
reset role;
select pg_temp.fails($$set role anon; select public.friends_list()$$, 'a guest can''t use friends');
reset role;
-- case-sensitive usernames: Bat_Two and bat_two can both exist, and each is found only by its own capitals
insert into auth.users(id,email) values ('11000000-0000-0000-0000-000000000004','f4@x.co') on conflict do nothing;
insert into public.profiles(user_id,username) values ('11000000-0000-0000-0000-000000000004','bat_two');
set role authenticated;
set request.jwt.claim.sub = '11000000-0000-0000-0000-000000000003';
select pg_temp.ok((public.friend_request('bat_two')->>'user_id')='11000000-0000-0000-0000-000000000004', 'bat_two (lower case) is a different player from Bat_Two');
reset role;
select pg_temp.fails($$insert into public.profiles(user_id,username) values ('11000000-0000-0000-0000-000000000003','Bat_Two')$$, 'the exact same username can''t be taken twice');
\echo ALL FRIENDS TESTS PASSED
