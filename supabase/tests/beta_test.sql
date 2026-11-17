-- migration 018: beta tools
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
create or replace function pg_temp.fails(sql text, what text) returns void language plpgsql as $$
begin begin execute sql; exception when others then raise notice 'ok  % (%)', what, sqlerrm; return; end;
  raise exception 'FAIL: % was accepted', what; end $$;
-- a spare account to delete later
insert into auth.users(id,email) values ('44444444-4444-4444-4444-444444444444','d@x.co');
insert into public.profiles(user_id,username) values ('44444444-4444-4444-4444-444444444444','Leaver');
insert into public.saves values ('44444444-4444-4444-4444-444444444444','{"pd-wallet":"{\"coins\":50}"}',now());
insert into public.admins(user_id) values ('11111111-1111-1111-1111-111111111111') on conflict do nothing;
-- save history
update public.saves set data='{"pd-wallet":"{\"coins\":10}","pd-cards":"{\"packs\":2,\"owned\":{\"a\":1,\"b\":1}}"}', updated_at=now() where user_id='11111111-1111-1111-1111-111111111111';
update public.saves set data='{"pd-wallet":"{\"coins\":20}"}', updated_at=now() where user_id='11111111-1111-1111-1111-111111111111';
select pg_temp.ok((select count(*) from public.save_history where user_id='11111111-1111-1111-1111-111111111111')=1, 'an overwritten save is kept (once per 20 minutes)');
update public.save_history set kept_at=now()-interval '1 hour';
update public.saves set data='{"pd-wallet":"{\"coins\":30}"}', updated_at=now() where user_id='11111111-1111-1111-1111-111111111111';
select pg_temp.ok((select count(*) from public.save_history where user_id='11111111-1111-1111-1111-111111111111')=2, '...and again 20 minutes later');
do $$ begin for i in 1..15 loop update public.save_history set kept_at=kept_at-interval '1 hour';
  update public.saves set data=jsonb_build_object('n',i), updated_at=now() where user_id='11111111-1111-1111-1111-111111111111'; end loop; end $$;
select pg_temp.ok((select count(*) from public.save_history where user_id='11111111-1111-1111-1111-111111111111')=12, 'only the newest 12 copies are kept');
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.fails($$select * from public.save_history$$, 'a player reading the history table');
select pg_temp.fails($$select public.admin_feedback()$$, 'a non-admin reading feedback');
select pg_temp.fails($$select public.admin_gift('22222222-2222-2222-2222-222222222222',100,1)$$, 'a non-admin sending himself a gift');
select pg_temp.ok(not public.pd_is_admin(), 'not an admin');
-- flags
select pg_temp.ok((public.get_flags()->'ranked'->>'on')::boolean, 'flags: ranked is on');
select pg_temp.fails($$select public.admin_set_flag('ranked',false)$$, 'a non-admin turning ranked off');
-- error log
insert into public.client_errors(version,message) values ('t','boom');
select pg_temp.fails($$select * from public.client_errors$$, 'reading the error log');
-- feedback with the extras
insert into public.feedback(kind,message,extra,shot) values ('bug','it broke','{"log":["x"]}','data:image/jpeg;base64,AAAA');
select pg_temp.fails($$insert into public.feedback(kind,message,shot) values ('bug','bad shot','javascript:alert(1)')$$, 'a screenshot that is not an image');
-- the admin
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.ok(public.pd_is_admin(), 'the admin is an admin');
select pg_temp.ok(jsonb_array_length(public.admin_feedback())>=1 and public.admin_feedback()->0->>'shot' like 'data:image%', 'the admin reads feedback, screenshot included');
select pg_temp.ok(public.admin_errors()->0->>'message'='boom' and public.admin_errors()->0->>'username'='Rival', 'the admin reads the error log, with who');
select public.admin_set_flag('ranked',false,'Back soon');
select pg_temp.ok(not (public.get_flags()->'ranked'->>'on')::boolean and public.get_flags()->'ranked'->>'msg'='Back soon', 'the admin turns ranked off, with a message');
select public.admin_set_flag('ranked',true);
select pg_temp.ok(public.admin_player('beefdirky')->>'username'='BeefDirky', 'find a player by username (any case)');
select pg_temp.ok(jsonb_array_length(public.admin_player('BeefDirky')->'history')=12, '...with the save history');
select public.admin_gift('22222222-2222-2222-2222-222222222222',500,2,'thanks for testing');
select pg_temp.fails($$select public.admin_gift('22222222-2222-2222-2222-222222222222',0,0)$$, 'an empty gift');
-- restore: the newest history copy becomes the save again
select set_config('pd.h',(public.admin_player('BeefDirky')->'history'->3->>'id'),false);
select public.admin_restore_save('11111111-1111-1111-1111-111111111111',current_setting('pd.h')::bigint);
reset role;
select pg_temp.ok((select data from public.saves where user_id='11111111-1111-1111-1111-111111111111')=(select data from public.save_history where id=current_setting('pd.h')::bigint), 'the admin puts an older save back');
select pg_temp.ok((select count(*) from public.save_history where user_id='11111111-1111-1111-1111-111111111111' and kept_at>now()-interval '1 minute')=1, '...after keeping the one it replaced');
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.fails($$select public.admin_restore_save('22222222-2222-2222-2222-222222222222',1)$$, 'restoring someone else''s copy');
-- the player collects the gift, once
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.ok((public.claim_gifts()->0->>'coins')::int=500, 'the player collects the gift');
select pg_temp.ok(jsonb_array_length(public.claim_gifts())=0, '...only once');
-- delete my account
set request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
insert into public.feedback(kind,message,contact,username) values ('idea','more bats','me@x.co','Leaver');
select public.delete_my_account();
reset role;
select pg_temp.ok(not exists(select 1 from auth.users where id='44444444-4444-4444-4444-444444444444'), 'delete my account: the sign-in is gone');
select pg_temp.ok(not exists(select 1 from public.saves where user_id='44444444-4444-4444-4444-444444444444') and not exists(select 1 from public.profiles where user_id='44444444-4444-4444-4444-444444444444'), '...and the save and username');
select pg_temp.ok((select username is null and contact is null and user_id is null from public.feedback where message='more bats'), '...their feedback stays, unsigned');
select pg_temp.fails($$set role anon; select public.delete_my_account()$$, 'a guest deleting an account');
