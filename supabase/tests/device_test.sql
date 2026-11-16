-- migration 015: one device at a time
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.fails($$select * from public.active_devices$$, 'reading the table directly');
select pg_temp.ok((public.device_check('phone-aaaaaaaa','iPhone · Chrome')->>'mine')::boolean, 'the first device takes the account');
select pg_temp.ok((public.device_check('phone-aaaaaaaa','iPhone · Chrome')->>'mine')::boolean, 'checking in again keeps it');
select pg_temp.ok(not (public.device_check('pc-bbbbbbbbbb','Windows PC · Chrome')->>'mine')::boolean, 'a second device is told another one is playing');
select pg_temp.ok(public.device_check('pc-bbbbbbbbbb','Windows PC · Chrome')->>'label'='iPhone · Chrome', '...and which one');
select pg_temp.ok((public.device_peek('phone-aaaaaaaa')->>'mine')::boolean, 'the phone still holds it');
select pg_temp.ok((public.device_check('pc-bbbbbbbbbb','Windows PC · Chrome',true)->>'took')::boolean, 'the PC takes over when asked');
select pg_temp.ok(not (public.device_peek('phone-aaaaaaaa')->>'mine')::boolean, 'the phone sees it was replaced');
select pg_temp.ok(public.device_peek('phone-aaaaaaaa')->>'label'='Windows PC · Chrome', '...by the PC');
select pg_temp.ok(public.device_peek('phone-aaaaaaaa')->>'device'='pc-bbbbbbbbbb', '...and gets its id (to spot another tab of the same browser)');
select pg_temp.fails($$select public.queue_join('seoul', array['busan'], 'test', 'phone-aaaaaaaa')$$, 'the replaced device can''t join ranked');
select pg_temp.ok((public.queue_join('seoul', array['busan'], 'test', 'pc-bbbbbbbbbb')->>'queue') is not null, 'the device holding the account can');
select public.queue_leave();
select pg_temp.ok(not (public.device_check('phone-aaaaaaaa','iPhone · Chrome')->>'mine')::boolean, 'a plain check-in from the phone does not take it back');
reset role;
update public.active_devices set seen_at = now() - interval '5 minutes' where user_id = '11111111-1111-1111-1111-111111111111';
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok((public.device_check('phone-aaaaaaaa','iPhone · Chrome')->>'mine')::boolean, 'an idle device is replaced without asking');
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.ok((public.device_check('pc-bbbbbbbbbb','Windows PC · Chrome')->>'mine')::boolean, 'each account has its own device');
select pg_temp.fails($$select public.device_check('x','y')$$, 'a bad device id');
reset role;
select pg_temp.fails($$set role anon; select public.device_peek('phone-aaaaaaaa')$$, 'a guest can''t use it');
