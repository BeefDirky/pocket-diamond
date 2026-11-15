-- migration 009: feedback
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
set role anon;
insert into public.feedback (kind, message, contact, version, device) values ('bug', 'The runner slid forever', 'u/someone', 'abc123', '{"ua":"x"}');
select pg_temp.ok(true, 'a guest can send feedback');
select pg_temp.fails($$select count(*) from public.feedback$$, 'a guest cannot read feedback back');
select pg_temp.fails($$insert into public.feedback (kind, message) values ('rant', 'hello there')$$, 'an unknown kind');
select pg_temp.fails($$insert into public.feedback (kind, message) values ('bug', 'x')$$, 'an empty message');
select pg_temp.fails($$insert into public.feedback (kind, message, status) values ('bug', 'mark it fixed', 'fixed')$$, 'setting the status yourself');
reset role;
insert into auth.users(id,email) values ('09000000-0000-0000-0000-000000000001','f@x.co') on conflict do nothing;
set role authenticated;
set request.jwt.claim.sub = '09000000-0000-0000-0000-000000000001';
insert into public.feedback (kind, message, username) values ('idea', 'More stadiums please', 'BeefDirky');
select pg_temp.fails($$insert into public.feedback (kind, message, user_id) values ('idea', 'posing as someone', '11111111-1111-1111-1111-111111111111')$$, 'sending as another account');
insert into public.feedback (kind, message) values ('idea','two'),('idea','three'),('idea','four'),('idea','five');
select pg_temp.fails($$insert into public.feedback (kind, message) values ('idea', 'six in a minute')$$, 'a sixth message in a minute');
reset role;
select pg_temp.ok((select count(*) from public.feedback where user_id = '09000000-0000-0000-0000-000000000001') = 5 and (select user_id is null from public.feedback where kind = 'bug' limit 1), 'stored, tied to the account (or none for a guest)');
\echo ALL FEEDBACK TESTS PASSED
