-- Pocket Diamond migration 017: the current ranked season is called "Season Beta".
-- Run after 016_friend_profile.sql. Safe to run more than once.
update public.seasons set name = 'Season Beta' where ladder = 'stock' and is_active and name <> 'Season Beta';
