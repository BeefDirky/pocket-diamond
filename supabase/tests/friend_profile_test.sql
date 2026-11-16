-- migration 016: a friend's profile
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
insert into auth.users(id,email) values ('16000000-0000-0000-0000-000000000001','p1@x.co'),('16000000-0000-0000-0000-000000000002','p2@x.co'),('16000000-0000-0000-0000-000000000003','p3@x.co') on conflict do nothing;
insert into public.profiles(user_id,username) values ('16000000-0000-0000-0000-000000000001','Pal_One'),('16000000-0000-0000-0000-000000000002','Pal_Two'),('16000000-0000-0000-0000-000000000003','Stranger') on conflict do nothing;
insert into public.saves values ('16000000-0000-0000-0000-000000000002', jsonb_build_object('pd-myteam','{"club":"busan","base":"busan"}','pd-wallet','{"coins":1234,"earned":5}','pd-cards','{"packs":0,"owned":{"fa:1":2,"fa:2":1,"bl:h3":0}}'), now()) on conflict do nothing;
insert into public.friendships(user_lo,user_hi,status,requester) values (least('16000000-0000-0000-0000-000000000001'::uuid,'16000000-0000-0000-0000-000000000002'::uuid),greatest('16000000-0000-0000-0000-000000000001'::uuid,'16000000-0000-0000-0000-000000000002'::uuid),'accepted','16000000-0000-0000-0000-000000000001') on conflict do nothing;
set role authenticated;
set request.jwt.claim.sub = '16000000-0000-0000-0000-000000000001';
select pg_temp.ok(public.friend_profile('16000000-0000-0000-0000-000000000002')->>'username'='Pal_Two', 'a friend''s profile');
select pg_temp.ok(public.friend_profile('16000000-0000-0000-0000-000000000002')->>'club'='busan', '...with their club');
select pg_temp.ok(public.friend_profile('16000000-0000-0000-0000-000000000002')->>'coins' is null, '...and nothing else from their save');
select pg_temp.ok((public.friend_profile('16000000-0000-0000-0000-000000000002')->>'rating')::int=1000, '...and a rating');
select pg_temp.ok(public.friend_profile('16000000-0000-0000-0000-000000000001')->>'club' is null, 'no save yet: no club, not an error');
select pg_temp.fails($$select public.friend_profile('16000000-0000-0000-0000-000000000003')$$, 'someone who isn''t a friend');
reset role;
select pg_temp.fails($$set role anon; select public.friend_profile('16000000-0000-0000-0000-000000000002')$$, 'a guest');
