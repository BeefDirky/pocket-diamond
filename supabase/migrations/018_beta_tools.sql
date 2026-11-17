-- Pocket Diamond migration 018: tools for the beta.
-- Run after 017_season_beta.sql. Safe to run more than once.
--
--  1. Delete my account: a player can wipe their account and everything tied to it (saves, ratings, friends, cards...).
--  2. Save history: the last few versions of every cloud save are kept, so a save a bug wrecked can be put back.
--  3. Bug reports carry more: recent errors and game events, and an optional screenshot. Errors the game catches are
--     also logged here (client_errors), not only in the stats service.
--  4. Switches: turn a feature off for everyone at once (ranked, the shop, online play...) without shipping an update.
--  5. Admins: a short list of accounts that can use the in-game admin page (read feedback and errors, gift coins and
--     packs, put back an old save, flip the switches). To make yourself an admin, run this once (with your username):
--        insert into public.admins (user_id) select user_id from public.profiles where username = 'YOUR_USERNAME'
--          on conflict do nothing;

-- ---------- admins ----------
create table if not exists public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.pd_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = public.pd_me());
$$;
revoke all on function public.pd_is_admin() from public, anon;
grant execute on function public.pd_is_admin() to authenticated;

-- the admin RPCs below all start with this
create or replace function public.pd_need_admin() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := public.pd_me();
begin
  if me is null or not exists (select 1 from public.admins where user_id = me) then
    raise exception 'Admins only.' using errcode = '42501'; end if;
  return me;
end $$;
revoke all on function public.pd_need_admin() from public, anon, authenticated;

-- ---------- 1. delete my account ----------
-- Removes the sign-in itself; every table that belongs to the player goes with it (on delete cascade). Finished games
-- stay in the record for the other player, with this player's name taken off (on delete set null). Their feedback
-- messages stay, unsigned.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me();
begin
  if me is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  update public.feedback set username = null, contact = null where user_id = me;
  delete from auth.users where id = me;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- 2. save history ----------
-- Every time a save is overwritten, the old one is copied here first, at most once every 20 minutes per player (so a
-- burst of autosaves doesn't push out the older copies), and the newest 12 are kept: roughly the last few hours of play.
create table if not exists public.save_history (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  data     jsonb,
  saved_at timestamptz,
  kept_at  timestamptz not null default now()
);
create index if not exists save_history_user_idx on public.save_history (user_id, kept_at desc);
alter table public.save_history enable row level security;
revoke all on public.save_history from anon, authenticated;

create or replace function public.pd_keep_save() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.data is distinct from new.data and old.data is not null and not exists (
       select 1 from public.save_history where user_id = old.user_id and kept_at > now() - interval '20 minutes') then
    insert into public.save_history (user_id, data, saved_at) values (old.user_id, old.data, old.updated_at);
    delete from public.save_history where user_id = old.user_id and id not in (
      select id from public.save_history where user_id = old.user_id order by kept_at desc, id desc limit 12);
  end if;
  return new;
end $$;
drop trigger if exists saves_keep_history on public.saves;
create trigger saves_keep_history before update on public.saves for each row execute function public.pd_keep_save();

-- ---------- 3. richer bug reports, and logged errors ----------
alter table public.feedback add column if not exists extra jsonb check (extra is null or pg_column_size(extra) <= 20000);
alter table public.feedback add column if not exists shot  text  check (shot is null or (char_length(shot) <= 400000 and shot like 'data:image/%'));
grant insert (extra, shot) on public.feedback to anon, authenticated;

create table if not exists public.client_errors (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete set null default auth.uid(),
  version    text check (version is null or char_length(version) <= 32),
  message    text not null check (char_length(message) between 1 and 400),
  stack      text check (stack is null or char_length(stack) <= 2000),
  device     jsonb check (device is null or pg_column_size(device) <= 4000)
);
create index if not exists client_errors_created_idx on public.client_errors (created_at desc);
alter table public.client_errors enable row level security;
revoke all on public.client_errors from anon, authenticated;
grant insert (version, message, stack, device) on public.client_errors to anon, authenticated;
drop policy if exists client_errors_insert on public.client_errors;
create policy client_errors_insert on public.client_errors for insert to anon, authenticated with check (user_id is not distinct from auth.uid());
-- flood control: 10 a minute from one account, 120 a minute from everyone signed out
create or replace function public.pd_errors_flood() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.user_id is not null then
    if (select count(*) from public.client_errors where user_id = new.user_id and created_at > now() - interval '1 minute') >= 10 then
      raise exception 'Too many error reports.' using errcode = 'P0060'; end if;
  elsif (select count(*) from public.client_errors where user_id is null and created_at > now() - interval '1 minute') >= 120 then
    raise exception 'Too many error reports.' using errcode = 'P0060'; end if;
  return new;
end $$;
drop trigger if exists client_errors_flood on public.client_errors;
create trigger client_errors_flood before insert on public.client_errors for each row execute function public.pd_errors_flood();

-- ---------- 4. switches ----------
-- key: 'ranked', 'online' (all online play), 'friends', 'shop' (buying packs), 'cloud' (cloud saves). Off = the game
-- blocks that feature and shows the message. Anyone can read them (guests too); only admins change them.
create table if not exists public.feature_flags (
  key        text primary key check (key ~ '^[a-z_]{2,24}$'),
  enabled    boolean not null default true,
  message    text check (message is null or char_length(message) <= 200),
  updated_at timestamptz not null default now()
);
alter table public.feature_flags enable row level security;
revoke all on public.feature_flags from anon, authenticated;
insert into public.feature_flags (key) values ('ranked'), ('online'), ('friends'), ('shop'), ('cloud') on conflict do nothing;

create or replace function public.get_flags() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(key, jsonb_build_object('on', enabled, 'msg', message)), '{}'::jsonb) from public.feature_flags;
$$;
grant execute on function public.get_flags() to anon, authenticated;

-- ---------- 5. gifts: coins and packs an admin sends a player; the game collects them on its next sync ----------
create table if not exists public.gifts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  coins      int not null default 0 check (coins between 0 and 1000000),
  packs      int not null default 0 check (packs between 0 and 100),
  note       text check (note is null or char_length(note) <= 120),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);
create index if not exists gifts_open_idx on public.gifts (user_id) where claimed_at is null;
alter table public.gifts enable row level security;
revoke all on public.gifts from anon, authenticated;

-- the player's side: take every waiting gift (each one only ever once)
create or replace function public.claim_gifts() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); out jsonb;
begin
  if me is null then return '[]'::jsonb; end if;
  with g as (update public.gifts set claimed_at = now() where user_id = me and claimed_at is null returning coins, packs, note)
  select coalesce(jsonb_agg(jsonb_build_object('coins', coins, 'packs', packs, 'note', note)), '[]'::jsonb) into out from g;
  return out;
end $$;
revoke all on function public.claim_gifts() from public, anon;
grant execute on function public.claim_gifts() to authenticated;

-- ---------- admin RPCs ----------
create or replace function public.admin_feedback(p_status text default null, p_limit int default 50) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin perform public.pd_need_admin();
  return coalesce((select jsonb_agg(to_jsonb(f) order by f.created_at desc) from (
    select id, created_at, kind, message, contact, username, version, device, status, extra, shot from public.feedback
     where p_status is null or status = p_status order by created_at desc limit least(greatest(p_limit, 1), 200)) f), '[]'::jsonb);
end $$;

create or replace function public.admin_feedback_set(p_id bigint, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin perform public.pd_need_admin();
  update public.feedback set status = p_status where id = p_id;
end $$;

create or replace function public.admin_errors(p_limit int default 100) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin perform public.pd_need_admin();
  return coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from (
    select e.id, e.created_at, e.version, e.message, e.stack, e.device, p.username from public.client_errors e
      left join public.profiles p on p.user_id = e.user_id order by e.created_at desc limit least(greatest(p_limit, 1), 500)) e), '[]'::jsonb);
end $$;

-- find a player by username: who they are and their save history (with a short summary of each copy)
create or replace function public.admin_player(p_username text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid; nm text; s public.saves;
begin perform public.pd_need_admin();
  select user_id, username into uid, nm from public.profiles where uname_lc = lower(trim(p_username));
  if uid is null then return null; end if;
  select * into s from public.saves where user_id = uid;
  return jsonb_build_object('user_id', uid, 'username', nm,
    'save', case when s.user_id is null then null else jsonb_build_object('at', s.updated_at, 'sum', public.pd_save_sum(s.data)) end,
    'history', coalesce((select jsonb_agg(jsonb_build_object('id', h.id, 'saved_at', h.saved_at, 'kept_at', h.kept_at, 'sum', public.pd_save_sum(h.data)) order by h.kept_at desc)
      from public.save_history h where h.user_id = uid), '[]'::jsonb),
    'gifts', coalesce((select jsonb_agg(jsonb_build_object('coins', g.coins, 'packs', g.packs, 'note', g.note, 'at', g.created_at, 'claimed', g.claimed_at) order by g.created_at desc)
      from (select * from public.gifts where user_id = uid order by created_at desc limit 10) g), '[]'::jsonb));
end $$;

-- a short summary of a save: coins, unopened packs, cards owned, club. (Each part of the save is stored as JSON text.)
create or replace function public.pd_save_sum(d jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare w jsonb; c jsonb; t jsonb;
begin
  begin w := (d->>'pd-wallet')::jsonb; exception when others then w := null; end;
  begin c := (d->>'pd-cards')::jsonb;  exception when others then c := null; end;
  begin t := (d->>'pd-myteam')::jsonb; exception when others then t := null; end;
  return jsonb_build_object('coins', (w->>'coins')::int, 'packs', (c->>'packs')::int,
    'cards', (select count(*) from jsonb_object_keys(coalesce(c->'owned', '{}'::jsonb))), 'club', t->>'club');
exception when others then return '{}'::jsonb;
end $$;

-- put an older copy back as the player's save. (The copy it replaces goes into the history first, so this can be undone.)
-- The player's game picks it up the next time it syncs (on load or sign-in).
create or replace function public.admin_restore_save(p_user uuid, p_history bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare d jsonb;
begin perform public.pd_need_admin();
  select data into d from public.save_history where id = p_history and user_id = p_user;
  if d is null then raise exception 'No such saved copy.' using errcode = 'P0061'; end if;
  delete from public.save_history where user_id = p_user and kept_at > now() - interval '20 minutes';/* (so the current save is always kept) */
  update public.saves set data = d, updated_at = now() where user_id = p_user;
end $$;

create or replace function public.admin_gift(p_user uuid, p_coins int, p_packs int, p_note text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_need_admin();
begin
  if coalesce(p_coins, 0) <= 0 and coalesce(p_packs, 0) <= 0 then raise exception 'Nothing to send.' using errcode = 'P0062'; end if;
  insert into public.gifts (user_id, coins, packs, note, created_by) values (p_user, greatest(coalesce(p_coins, 0), 0), greatest(coalesce(p_packs, 0), 0), nullif(trim(p_note), ''), me);
end $$;

create or replace function public.admin_set_flag(p_key text, p_on boolean, p_msg text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin perform public.pd_need_admin();
  insert into public.feature_flags (key, enabled, message, updated_at) values (p_key, p_on, nullif(trim(p_msg), ''), now())
  on conflict (key) do update set enabled = excluded.enabled, message = excluded.message, updated_at = now();
end $$;

revoke all on function public.admin_feedback(text, int), public.admin_feedback_set(bigint, text), public.admin_errors(int),
  public.admin_player(text), public.admin_restore_save(uuid, bigint), public.admin_gift(uuid, int, int, text),
  public.admin_set_flag(text, boolean, text), public.pd_save_sum(jsonb) from public, anon;
grant execute on function public.admin_feedback(text, int), public.admin_feedback_set(bigint, text), public.admin_errors(int),
  public.admin_player(text), public.admin_restore_save(uuid, bigint), public.admin_gift(uuid, int, int, text),
  public.admin_set_flag(text, boolean, text) to authenticated;
