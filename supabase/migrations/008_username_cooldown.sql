-- Pocket Diamond migration 008: a username can be changed once every 30 days.
-- Run after 007_bots.sql. Safe to run more than once.
-- Choosing your first username doesn't count. Each change after that starts a 30-day wait (changing only the
-- capitals counts too). The server enforces it; the game just shows when your next change is allowed.
alter table public.profiles add column if not exists name_changed_at timestamptz;

create or replace function public.pd_username_cooldown() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.username is distinct from old.username then
    if old.name_changed_at is not null and old.name_changed_at > now() - interval '30 days' then
      raise exception 'You can change your username again on %.', to_char(old.name_changed_at + interval '30 days', 'Mon FMDD')
        using errcode = 'P0030';
    end if;
    new.name_changed_at := now();
  else
    new.name_changed_at := old.name_changed_at;   -- (nobody resets their own clock)
  end if;
  return new;
end $$;
drop trigger if exists profiles_username_cooldown on public.profiles;
create trigger profiles_username_cooldown before update on public.profiles
  for each row execute function public.pd_username_cooldown();
-- a brand-new profile can't arrive with a made-up date either
create or replace function public.pd_username_new() returns trigger
language plpgsql security definer set search_path = '' as $$
begin new.name_changed_at := null; return new; end $$;
drop trigger if exists profiles_username_new on public.profiles;
create trigger profiles_username_new before insert on public.profiles
  for each row execute function public.pd_username_new();
