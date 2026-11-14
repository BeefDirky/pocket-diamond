-- migration 008: a username change once every 30 days
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
insert into auth.users(id,email) values ('08000000-0000-0000-0000-000000000001','n@x.co') on conflict do nothing;
set role authenticated;
set request.jwt.claim.sub = '08000000-0000-0000-0000-000000000001';
insert into public.profiles(user_id,username,name_changed_at) values ('08000000-0000-0000-0000-000000000001','First_Name',now());
select pg_temp.ok((select name_changed_at is null from public.profiles where user_id='08000000-0000-0000-0000-000000000001'), 'choosing your first username starts no clock (a made-up date is ignored)');
update public.profiles set username='Second' where user_id='08000000-0000-0000-0000-000000000001';
select pg_temp.ok((select username='Second' and name_changed_at > now()-interval '1 minute' from public.profiles where user_id='08000000-0000-0000-0000-000000000001'), 'the first change goes through and starts the 30 days');
select pg_temp.fails($$update public.profiles set username='Third' where user_id='08000000-0000-0000-0000-000000000001'$$, 'a second change the same month');
select pg_temp.fails($$update public.profiles set username='SECOND' where user_id='08000000-0000-0000-0000-000000000001'$$, 'changing only the capitals counts too');
update public.profiles set name_changed_at = now() - interval '90 days' where user_id='08000000-0000-0000-0000-000000000001';
select pg_temp.ok((select name_changed_at > now()-interval '1 minute' from public.profiles where user_id='08000000-0000-0000-0000-000000000001'), 'nobody can reset their own clock');
insert into public.profiles(user_id,username) values ('08000000-0000-0000-0000-000000000001','Second') on conflict (user_id) do update set username=excluded.username;
select pg_temp.ok(true, 'saving the same name again is fine');
reset role;
alter table public.profiles disable trigger profiles_username_cooldown;
update public.profiles set name_changed_at = now() - interval '31 days' where user_id='08000000-0000-0000-0000-000000000001';
alter table public.profiles enable trigger profiles_username_cooldown;
set role authenticated;
update public.profiles set username='Third' where user_id='08000000-0000-0000-0000-000000000001';
select pg_temp.ok((select username='Third' from public.profiles where user_id='08000000-0000-0000-0000-000000000001'), 'after 30 days you can change it again');
reset role;
\echo ALL USERNAME TESTS PASSED
