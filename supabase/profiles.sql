-- Usernames: one per account, unique ignoring case (Derrick and derrick can't both exist).
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  username   text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  uname_lc   text generated always as (lower(username)) stored,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_uname_lc_key on public.profiles (uname_lc);

alter table public.profiles enable row level security;

drop policy if exists "anyone can read usernames" on public.profiles;
drop policy if exists "insert own username" on public.profiles;
drop policy if exists "update own username" on public.profiles;

create policy "anyone can read usernames" on public.profiles for select using (true);
create policy "insert own username" on public.profiles for insert with check (auth.uid() = user_id);
create policy "update own username" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
