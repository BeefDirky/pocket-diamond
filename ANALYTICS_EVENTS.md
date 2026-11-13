# Analytics events

The event catalogue for PostHog (step 5). Nothing is sent yet. When it's wired up, every event goes through one `track(name, props)` function, so this file and the code stay in step.

## Where data lives

| Data | Home | Not in |
|---|---|---|
| Ranked matches, plate appearances, pitches, ratings | Postgres (authoritative) | PostHog gets only `game_end` with the match id |
| Sessions, retention, funnels, feature use, errors | PostHog | Postgres |
| Pitch/swing detail for balancing, all modes | PostHog **sampled** (`pa_end`, 20% of sessions) | Postgres (except ranked) |

## Privacy rules

- **Identity:**
  - Signed-in players are identified by their **auth UUID only**. No email, no username, and no IP-derived city in person properties; turn on "Discard client IP" in the PostHog project.
  - Guests stay anonymous: PostHog's own random id, which is merged with the UUID on sign-in.
- **No free text:** no chat or typed input is ever sent.
- **Opt-out:** Options → "Share anonymous gameplay data" (on by default, off sends nothing). The claude.ai artifact build never loads PostHog.
- **Retention:** PostHog keeps raw events for 1 year (free tier default); dashboards use aggregates.

## Properties on every event (super properties)

| Property | Example | Why |
|---|---|---|
| `build` | `pd-b049e08adb` | compare balance before and after a change |
| `layout` | `phone` / `pc` | device class, without collecting the device model |
| `signed_in` | `true` | guests vs accounts |
| `sampled` | `true` | this session also sends `pa_end` |

## Naming

`object_verb` in snake_case, past tense where it's a finished thing. Property values are the game's own short keys: club `seoul`, park `bread`, pitch `SL`, mode `arcade`.

## Events

### Session and account
| Event | Properties | Answers |
|---|---|---|
| `$pageview` (auto) | — | DAU/MAU, sessions, session length |
| `account_created` | — | registrations |
| `signed_in` | `method: password` | — |
| `username_set` | `first: bool` | registration completion |
| `cloud_conflict_resolved` | `kept: cloud / device` | cloud-save trouble |

### Menus and funnels
| Event | Properties | Answers |
|---|---|---|
| `screen_viewed` | `screen: main / single / teams / lineup / shop / inventory / leaderboard / multi / tutorial / options` | where players go, where they stop |
| `tutorial_finished` | `seconds` | onboarding |

### Games
| Event | Properties | Answers |
|---|---|---|
| `game_started` | `mode`, `club`, `opp_club`, `park`, `innings`, `night`, `series_len`, `signed_cards: n`, `ranked: bool` | mode, park and club popularity |
| `game_ended` | the above + `won`, `runs_for`, `runs_against`, `innings_played`, `seconds`, `hr`, `so`, `auto_innings`, `match_id` (online) | completion, game length, difficulty |
| `game_abandoned` | the above + `inning`, `half`, `score_diff`, `seconds`, `reason: menu / closed / disconnect` | why and where players quit |
| `arcade_series_ended` | `len`, `wins` | arcade difficulty |
| `playoffs_round_ended` | `round`, `won` | playoff difficulty |
| `auto_toggled` | `on`, `side: bat / pitch` | is the game too hard or too slow |
| `hr_trot_skipped` | — | pacing |

### Balance, sampled (one per plate appearance)
| Event | Properties |
|---|---|
| `pa_ended` | `mode`, `human: bat / pitch / none`, `result`, `pitches`, `ev`, `la`, `spray`, `last_pitch: type`, `last_mph`, `swing_err_ms`, `meter_q`, `in_zone`, `stamina`, `batter_con`, `batter_pow`, `pitcher_vel`, `count: "2-1"`, `outs`, `bases` |

At about 40 plate appearances per 9 innings and a 20% sample, that's about 8 events a game, which keeps 1M free events a month far away.

### Cards and coins
| Event | Properties | Answers |
|---|---|---|
| `coins_earned` | `amount`, `why: win / hr / playoffs` | economy inflow |
| `pack_bought` | `set: fa / bl`, `cost`, `balance_after` | conversion |
| `pack_opened` | `set`, `rarities: [..]`, `dupes` | pull rates as felt |
| `card_levelled` | `card_set`, `rarity`, `stat`, `level` | upgrade use |
| `card_signed` | `card_set`, `rarity`, `slot`, `club` | which cards get used |

### Multiplayer
| Event | Properties | Answers |
|---|---|---|
| `room_created` / `room_joined` | `innings`, `series_len` | multiplayer usage |
| `room_join_failed` | `reason: not_found / full / same_club / offline` | friction |
| `connection_lost` | `seconds_offline`, `recovered: bool`, `phase` | network health |
| `desync_detected` | `match_id`, `pitch_n` | netcode bugs (step 3a) |
| `ranked_result` | `match_id`, `status: final / forfeit / disputed` | dispute rate |

### Errors
| Event | Properties |
|---|---|
| `$exception` | the game's error guard passes `message`, `stack` (first 2 KB), `phase` |

## Dashboards these feed (step 6)

1. **Players:** DAU/WAU/MAU, new accounts, D1/D7/D30 retention, session length.
2. **Modes and parks:** `game_started` by mode, park and club; completion rate; average game length.
3. **Funnels:**
   - first visit → `game_started` → `game_ended`;
   - main → shop → `pack_bought`;
   - multi → room → `game_ended`.
4. **Abandonment:** `game_abandoned` by inning, score difference and reason.
5. **Balance:**
   - from sampled `pa_ended`: result mix vs MLB (see BALANCE.md), EV/LA distribution, timing error spread, and outcomes by pitch type;
   - ranked pitch detail from the Postgres warehouse link.
6. **Economy:** coins in vs spent, packs per player, level-ups.
7. **Multiplayer:** rooms per day, connection loss, dispute rate.
