-- migration 010: offensive usernames are refused (the same cases as the game's filter)
create or replace function pg_temp.ok(cond boolean, what text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', what; end if; raise notice 'ok  %', what; end $$;
select pg_temp.ok(not exists(select 1 from unnest(array['FuckYou','fuuuck','F_U_C_K','sh1t_head','Bitch99','BigDick','Dick69','d1ck','xXxSlayer','Nazi','hitler2','KKKlan','ASS','PussyCat','Cum','rapist','N1gga','fag','kys','Sh1tStain','b1tch','Wh0re']) n where not public.pd_name_offensive(n)), 'offensive names are caught, in leet, caps, repeats and parts');
select pg_temp.ok(not exists(select 1 from unnest(array['BeefDirky','Rival','Dickens','Cocktail','Classy','Assassin','Therapist','Grape','Spicy','Raccoon','Hancock','Titan','Peacock','Analyst','Cucumber','Sussex','Nazir','Fukuda','Japan','Sexton','Matsuda','Batman42','Shoe','HomeRun','Butters','Scraping','Passion','Bass_Hunter','Title','Document','Cassidy','Hoerner','Pedro','Tito','Sextant']) n where public.pd_name_offensive(n)), 'ordinary names with those letters inside them are fine');
insert into auth.users(id,email) values ('10000000-0000-0000-0000-000000000001','f@x.co') on conflict do nothing;
set role authenticated;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
do $$ begin insert into public.profiles(user_id,username) values ('10000000-0000-0000-0000-000000000001','B1tchSlap');
  raise exception 'FAIL: an offensive name was saved'; exception when sqlstate 'P0031' then raise notice 'ok  a new account can''t take an offensive name (%)', sqlerrm; end $$;
insert into public.profiles(user_id,username) values ('10000000-0000-0000-0000-000000000001','Slugger_10');
do $$ begin update public.profiles set username='ShitHead' where user_id='10000000-0000-0000-0000-000000000001';
  raise exception 'FAIL: renamed to an offensive name'; exception when sqlstate 'P0031' then raise notice 'ok  nobody can rename to one either'; end $$;
select pg_temp.ok((select username='Slugger_10' from public.profiles where user_id='10000000-0000-0000-0000-000000000001'), 'a clean name saves normally');
reset role;
\echo ALL USERNAME FILTER TESTS PASSED
