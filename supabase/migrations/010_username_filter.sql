-- Pocket Diamond migration 010: offensive usernames are refused.
-- Run after 009_feedback.sql. Safe to run more than once.
-- The same check as the game's (src/js/23a0-namefilter.js), so a modified game can't get around it. The word lists are
-- ROT13 so this file doesn't read like one. A name is checked in several spellings: lower case, with look-alike digits
-- read as letters (0 o, 1 i or l, 3 e, 4 a, 5 s, 7 t, 8 b, 9 g), without digits, and with repeated letters squeezed.
-- "sub" words are refused anywhere in the name; "exact" words only as the whole name or one of its parts (split at _,
-- capitals and digits), because they hide inside innocent words.
create or replace function public.pd_rot13(t text) returns text language sql immutable as $$
  select translate(t, 'abcdefghijklmnopqrstuvwxyz', 'nopqrstuvwxyzabcdefghijklm') $$;

create or replace function public.pd_name_forms(s text) returns setof text language sql immutable as $$
  with l as (select lower(s) l),
  f as (
    select regexp_replace(translate(l, '0134578926', 'oieastbg'), '[^a-z]', '', 'g') f from l
    union select regexp_replace(translate(l, '0134578926', 'oleastbg'), '[^a-z]', '', 'g') from l
    union select regexp_replace(l, '[^a-z]', '', 'g') from l)
  select f from f where f <> ''
  union select regexp_replace(f, '(.)\1+', '\1', 'g') from f where f <> '' $$;

create or replace function public.pd_name_offensive(s text) returns boolean language plpgsql immutable as $$
declare
  sub text[] := string_to_array('avtt avttn avtn avte arteb snttbg sntbg xvxr jrgonpx ornare genaal genaavr ergneq tbbx puvatpubat gbjryurnq enturnq uvgyre urvy xxx fjnfgvxn ubybpnhfg crqbcuvy cnrqb crqborne zbyrfg vaprfg orfgvny arpebcuvy shpx spx cuhpx fuvg phag ovgpu ovngpu juber fyhg cbea chffl cravf intvan qvyqb wvmm oybjwbo unaqwbo evzwbo zvys uragnv kkk znfgheong phzfubg pernzcvr ohxxnxr tnatonat betnfz rerpgvba gvggl obbof ahqr anxrq xvyylbhefrys fhvpvqr greebevfg wvunq', ' ');
  ex  text[] := string_to_array('fcvp fcvpx pbba cnxv qlxr puvax encr encre encvfg encvat crqb qvpx pbpx gvg gvgf nany phz frk nff nefr ubr wnc gjng anmv snt sntf shx ubeal yrfob avttre xlf', ' ');
  camel text := regexp_replace(s, '([a-z0-9])([A-Z])', '\1_\2', 'g');
  digits text := regexp_replace(regexp_replace(camel, '([A-Za-z])([0-9])', '\1_\2', 'g'), '([0-9])([A-Za-z])', '\1_\2', 'g');
begin
  sub := array(select public.pd_rot13(w) from unnest(sub) w);
  ex  := array(select public.pd_rot13(w) from unnest(ex) w);
  if exists (select 1 from public.pd_name_forms(s) f, unnest(sub) w where strpos(f, w) > 0) then return true; end if;
  return exists (
    select 1 from (
      select f from unnest(string_to_array(camel, '_')) p, public.pd_name_forms(p) f
      union select f from unnest(string_to_array(digits, '_')) p, public.pd_name_forms(p) f where p ~ '[A-Za-z]'
      union select f from public.pd_name_forms(s) f) parts
    where parts.f = any(ex));
end $$;

create or replace function public.pd_username_check() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (tg_op = 'INSERT' or new.username is distinct from old.username) and public.pd_name_offensive(new.username) then
    raise exception 'That username isn''t allowed. Pick another.' using errcode = 'P0031';
  end if;
  return new;
end $$;
drop trigger if exists profiles_username_check on public.profiles;
create trigger profiles_username_check before insert or update on public.profiles
  for each row execute function public.pd_username_check();

-- names already taken before this check: list them for a look (doesn't change anything)
--   select username from public.profiles where public.pd_name_offensive(username);
