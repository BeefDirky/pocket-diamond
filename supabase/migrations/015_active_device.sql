-- Pocket Diamond migration 015: one device plays on an account at a time.
-- Run after 014_friend_playoffs.sql. Safe to run more than once.
-- Each copy of the game (each browser tab) has its own device id: "<browser id>.<tab id>", so a second tab in the same
-- browser counts as another device too (the game hands the account to the newest tab without asking). While you play,
-- your device checks in every few seconds. If another device has checked in within the last 2 minutes, a new device asks before taking over ("play here instead?"); a device that
-- has been idle longer is simply replaced. The replaced device sees that and stops saving, so two devices never
-- overwrite each other's progress.
create table if not exists public.active_devices (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  device     text not null check (char_length(device) between 8 and 64),
  label      text not null default '' check (char_length(label) <= 60),
  seen_at    timestamptz not null default now(),
  claimed_at timestamptz not null default now()
);
alter table public.active_devices enable row level security;
revoke all on public.active_devices from anon, authenticated;

-- check in. Returns {mine, label, ago} where label/ago describe the device that holds the account when it isn't this one.
-- p_take = true takes the account over from another device (the player said "play here").
create or replace function public.device_check(p_device text, p_label text, p_take boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); r public.active_devices;
begin
  if me is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  if p_device is null or char_length(p_device) not between 8 and 64 then raise exception 'bad device' using errcode = '22023'; end if;
  select * into r from public.active_devices where user_id = me for update;
  if r.user_id is null or r.device = p_device or p_take or r.seen_at < now() - interval '2 minutes' then
    insert into public.active_devices as a (user_id, device, label, seen_at, claimed_at)
      values (me, p_device, left(coalesce(p_label, ''), 60), now(), now())
    on conflict (user_id) do update set device = excluded.device, label = excluded.label, seen_at = now(),
      claimed_at = case when a.device = excluded.device then a.claimed_at else now() end;
    return jsonb_build_object('mine', true, 'took', r.user_id is not null and r.device <> p_device);
  end if;
  return jsonb_build_object('mine', false, 'device', r.device, 'label', r.label, 'ago', extract(epoch from now() - r.seen_at)::int);
end $$;

-- look without checking in (a replaced device uses this, so it never takes the account back by accident)
create or replace function public.device_peek(p_device text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce((select jsonb_build_object('mine', device = p_device, 'device', device, 'label', label, 'ago', extract(epoch from now() - seen_at)::int)
    from public.active_devices where user_id = public.pd_me()), jsonb_build_object('mine', true));
$$;

revoke all on function public.device_check(text, text, boolean), public.device_peek(text) from public, anon;
grant execute on function public.device_check(text, text, boolean), public.device_peek(text) to authenticated;

-- Ranked: only the device that holds the account can join the queue (and so start a ranked game, against a person or a
-- CPU). The game passes its device id; this checks it, then runs the usual queue_join. (The old three-argument
-- queue_join stays for older copies of the game.)
create or replace function public.queue_join(p_club text, p_clubs text[], p_version text, p_device text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.pd_me(); r public.active_devices;
begin
  select * into r from public.active_devices where user_id = me;
  if r.user_id is not null and r.device <> coalesce(p_device, '') and r.seen_at > now() - interval '2 minutes' then
    raise exception 'Your account is being played on another device.' using errcode = 'P0050'; end if;
  return public.queue_join(p_club, p_clubs, p_version);
end $$;
revoke all on function public.queue_join(text, text[], text, text) from public, anon;
grant execute on function public.queue_join(text, text[], text, text) to authenticated, service_role;
