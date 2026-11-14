-- A small league for testing the leaderboard screen: five players, ranked games built from real game records.
\i supabase/tests/game_logs.sql
insert into auth.users(id,email) select ('00000000-0000-0000-0000-00000000000'||n)::uuid, 'p'||n||'@x.co' from generate_series(1,5) n;
insert into public.profiles(user_id,username) values
 ('00000000-0000-0000-0000-000000000001','BeefDirky'),('00000000-0000-0000-0000-000000000002','Rival'),
 ('00000000-0000-0000-0000-000000000003','SluggerKim'),('00000000-0000-0000-0000-000000000004','Mallory_99'),
 ('00000000-0000-0000-0000-000000000005','NewGuy');
-- ranked games: (home, away, which recorded game) — each finalized through the real functions
do $$ declare g record; mid uuid; lg jsonb; i int := 0; begin
  for g in select * from (values (1,2,0),(1,3,1),(3,4,2),(2,4,0),(3,1,1),(4,2,2),(1,4,0)) t(h,a,n) loop
    i := i + 1;
    select log into lg from pg_temp.logs where logs.n = g.n;
    insert into public.matches (mode, season_id, status, verified, innings, home_user, away_user, home_club, away_club,
                                home_score, away_score, winner_side, ended_at, started_at)
    values ('ranked_stock', 1, 'final', true, 3, ('00000000-0000-0000-0000-00000000000'||g.h)::uuid, ('00000000-0000-0000-0000-00000000000'||g.a)::uuid,
            lg->>'home', lg->>'away', (lg->'fin'->>'home')::int, (lg->'fin'->>'away')::int,
            case when (lg->'fin'->>'home')::int > (lg->'fin'->>'away')::int then 'home' else 'away' end,
            now() - make_interval(hours => 10 - i), now() - make_interval(hours => 10 - i, mins => 20))
    returning id into mid;
    insert into public.match_participants (match_id, side, user_id, club, result) values
      (mid, 'home', ('00000000-0000-0000-0000-00000000000'||g.h)::uuid, lg->>'home', null),
      (mid, 'away', ('00000000-0000-0000-0000-00000000000'||g.a)::uuid, lg->>'away', null);
    update public.match_participants set result = case when side = (select winner_side from public.matches where id = mid) then 'W' else 'L' end where match_id = mid;
    perform public.pd_write_log(mid, lg, ('00000000-0000-0000-0000-00000000000'||g.h)::uuid, ('00000000-0000-0000-0000-00000000000'||g.a)::uuid);
    perform public.finalize_match(mid);
  end loop; end $$;
-- a vs-CPU game for BeefDirky (self-reported)
do $$ declare mid uuid; lg jsonb; begin
  select log into lg from pg_temp.logs where n = 1;
  insert into public.matches (mode, status, innings, home_user, home_club, away_club, home_score, away_score, winner_side, ended_at)
  values ('full', 'self_reported', 3, '00000000-0000-0000-0000-000000000001', lg->>'home', lg->>'away', (lg->'fin'->>'home')::int, (lg->'fin'->>'away')::int, 'home', now()) returning id into mid;
  insert into public.match_participants (match_id, side, user_id, club, result) values (mid, 'home', '00000000-0000-0000-0000-000000000001', lg->>'home', 'W'), (mid, 'away', null, lg->>'away', 'L');
  perform public.pd_write_log(mid, lg, '00000000-0000-0000-0000-000000000001', null);
  perform public.finalize_match(mid);
end $$;
