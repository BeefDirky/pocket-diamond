#!/bin/sh
# Runs the schema on a scratch local Postgres and checks its behaviour.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres supabase/tests/run.sh
set -e; cd "$(dirname "$0")/../.."
P="psql -v ON_ERROR_STOP=1 -q"
$P -c "drop database if exists pd_test" -c "create database pd_test" >/dev/null
$P -d pd_test -f supabase/tests/supabase_stub.sql >/dev/null
$P -d pd_test -f supabase/profiles.sql 2>/dev/null
$P -d pd_test -c "insert into auth.users(id,email) values ('11111111-1111-1111-1111-111111111111','a@x.co'),('22222222-2222-2222-2222-222222222222','b@x.co'),('33333333-3333-3333-3333-333333333333','c@x.co');
 insert into public.profiles(user_id,username) values ('11111111-1111-1111-1111-111111111111','BeefDirky'),('22222222-2222-2222-2222-222222222222','Rival');
 insert into public.saves values ('11111111-1111-1111-1111-111111111111','{\"pd-wallet\":\"x\"}',now());"
for f in supabase/migrations/*.sql; do $P -d pd_test -f "$f" 2>/dev/null; $P -d pd_test -f "$f" 2>/dev/null; done   # each twice: re-runnable
$P -tA -d pd_test -f supabase/tests/core_test.sql 2>&1 | sed "s/^psql:[^ ]* NOTICE:  //" | grep -v "^$"
# race: 8 simultaneous finalize calls for one fresh match must count it exactly once
$P -d pd_test -c "set role service_role; insert into public.matches (id, mode, season_id, status, verified, home_user, away_user, home_club, away_club, home_score, away_score, winner_side, ended_at) values ('cccccccc-0000-0000-0000-000000000001','ranked_stock',1,'final',true,'22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','busan','daejeon',1,0,'home',now()); insert into public.match_participants (match_id, side, user_id, club, result) values ('cccccccc-0000-0000-0000-000000000001','home','22222222-2222-2222-2222-222222222222','busan','W'),('cccccccc-0000-0000-0000-000000000001','away','33333333-3333-3333-3333-333333333333','daejeon','L');"
for i in 1 2 3 4 5 6 7 8; do $P -d pd_test -c "set role service_role; select public.finalize_match('cccccccc-0000-0000-0000-000000000001')" >/dev/null & done; wait
G=$($P -tA -d pd_test -c "select games from public.ratings where user_id='33333333-3333-3333-3333-333333333333'")
[ "$G" = "1" ] && echo "ok  8 simultaneous finalize calls counted once" || { echo "FAIL: race counted $G times"; exit 1; }
# migration 002: the ranked flow, on real game records
$P -tA -d pd_test -f supabase/tests/ranked_test.sql 2>&1 | sed "s/^psql:[^ ]* NOTICE:  //" | grep -v "^$" | grep -v "^[0-9a-f-]\{36\}$\|^{\|^$"
# migration 003: the queue and the flat rating
$P -tA -d pd_test -f supabase/tests/queue_test.sql 2>&1 | sed "s/^psql:[^ ]* NOTICE:  //" | grep -v "^$" | grep -v "^[0-9a-f-]\{36\}$\|^{\|^$"
# migration 004: the queue's estimated wait
$P -tA -d pd_test -f supabase/tests/queue_wait_test.sql 2>&1 | sed "s/^psql:[^ ]* NOTICE:  //" | grep -v "^$" | grep -v "^[0-9a-f-]\{36\}$\|^{\|^$"
