# Backend plan: accounts, ranked, leaderboards, analytics

| Step | What | State |
|---|---|---|
| 1 | Audit | done (13 Nov) |
| 2 | Database schema (`supabase/migrations/001_core.sql`) | done; live in Supabase (13 Nov) |
| 3a | Make online games verifiable (client netcode, below) | done (13 Nov) |
| 3b | Server match flow + settlement (`supabase/migrations/002_ranked.sql`) and the ranked lobby | done; **run 002 in Supabase** |
| 4 | Leaderboard screen + player profiles | after 3b |
| 5 | Analytics events → PostHog (catalogue in `ANALYTICS_EVENTS.md`) | any time |
| 6 | PostHog dashboards + Postgres warehouse link | after 5 |
| 7 | Multiplayer reliability (rejoin, connection indicator, version lock, rematch) | any time |

## What step 3 changed (13 Nov)

**In the game (`src/js/14-pitching.js`, `23-online.js`, `23b-match-log.js`, `23c-ranked.js`):**
- Every random part of a pitch is rolled under the pitch's shared seed: the pitch itself, where a release puts it, wild pitches, and whether a swing in the window still misses. The receiving phone re-rolls each one and compares.
- **Cross-checks on every pitch:**
  - The batter's phone compares the pitcher's state snapshot with its own state *before* taking it.
  - The pitcher's phone compares a hash of the batter's state that comes with each swing/take decision.
  - Any mismatch is recorded. In casual it's only logged and the game heals as before; in ranked it voids the result.
- **Fixed an existing bug the checks exposed:** the pitcher's snapshot shared live objects. When the batter first saw a pitch at its release, it counted that pitch twice (pitch count and stamina were off by one until the next pitch).
- A structured match record on both phones: every plate appearance with every pitch. The hash covers only discrete facts, so floating-point differences between browsers can't split it.
- **Ranked lobby:**
  - The host picks Casual or Ranked. Both players must be signed in with a username.
  - Stock rosters, one game. The server opens the match, the guest joins it, and the server rolls the seed. The guest only starts the game the server set up.
  - Pings every 30 s. At the end, the final screen shows the result and the rating change.
- **Your own line:** single player and casual online report it (when you're signed in) to `report_match`, unverified. AUTO-only games aren't reported.

**On the server (`002_ranked.sql`):**
- **Postgres functions, not Edge Functions.** They run with the caller's verified sign-in (`auth.uid()`), which gives the same security as an Edge Function, with nothing extra to deploy. Edge Functions stay the place for the later server replay, which needs the game's JavaScript.
- `pd_validate_log` re-adds every record: runs per half equal the line score, 3 outs per half, totals equal the final, plate appearances in order, each PA's last pitch fits its result, and the game ended legally.
- `ranked_submit` settles a match only when both records hash the same, neither phone flagged anything, the clubs/innings/no-AUTO rules hold, and the record validates. Otherwise it's **disputed**.
- `ranked_claim` gives a forfeit win after the opponent has been silent for 3 minutes. It counts for W/L and rating, but writes no batting lines.
- Rate limits: ranked opens (5 a minute, 200 a day), submits, and self-reports (one per 20 s, 300 a day).
- `report_match`: validated self-reported lines by mode. They never reach a leaderboard.

**Tests:**
- `supabase/tests/run.sh`: 95 database checks on real game records.
- `tests/desync.py`: an honest online game must raise no cross-check flags.
- `tests/ranked_e2e.py`: two real game clients against the real SQL. An honest ranked game settles; a phone that inflates its own score is disputed.

**Known limits:**
- A page reload in the middle of a ranked game loses that phone's record, so the result won't count.
- A timing script (perfect swings or releases) isn't caught yet; the per-pitch timing data is stored for flagging later.

## Decisions (Derrick, 13 Nov)

- Ranked v1 uses **stock club rosters**: no cards, no levels. The card collection, inventory, shop and levels stay exactly as they are for everything else.
- A later **custom-team ranked ladder** will run on a **server-owned economy**: coins, packs, inventory and upgrades. The schema already has the tables (empty, server-write-only).
- Server code runs in **Supabase Edge Functions** (TypeScript). The design must still allow a dedicated authoritative game server later.
- Leaderboards (wins, ELO, win %, HR, AVG, seasons) count **verified ranked matches only**. Single-player and casual online stats are stored separately, labelled by mode, for profiles and analytics.
- Players are permanent auth UUIDs; usernames are unique ignoring case and can be changed. Store no personal data beyond the auth account.

## Exists today

| Area | What's there | Where |
|---|---|---|
| Hosting | Static site on Vercel; same build also runs as a claude.ai artifact | `vercel.json`, `tools/build.py` |
| Auth | Supabase email/password, confirmation + reset emails | `src/js/23a-account.js` |
| Usernames | `profiles`: UUID key, unique case-insensitive name | `supabase/profiles.sql` |
| Cloud save | `saves`: one JSON blob per user (cards, signings, wallet, playoffs, lineup, options) | `23a-account.js` |
| Multiplayer | 1v1 over Supabase Realtime broadcast; both phones run the whole game | `src/js/23-online.js` |
| Economy | coins, packs, levels: computed and stored in the browser | `24*-*.js` |

## Can online match outcomes be verified today? No.

I traced every message in `23-online.js`. Who decides what:

| Decision | Made by | Checked by anyone? |
|---|---|---|
| Match id and random seed (`gid`) | the host's browser | no |
| Each side's roster (cards and levels) | each browser sends its own (`rosterSpec`) | no; the other phone applies it as sent |
| **Whole game state**: score, outs, count, bases, runs by inning, pitcher stamina (`snapState`) | **the pitcher's browser, sent with every pitch** | **no; the batter's phone overwrites its own state with it (`applySnap`)** |
| Pitch release quality, location, in/out of zone, wild pitch, hit-by-pitch | the pitcher's browser, using its own unseeded `Math.random` | no |
| Swing timing error, miss, bunt, steal | the batter's browser | no |
| Batted-ball result and fielding | both, from the shared seed (`netRand`) | yes, both compute the same thing |
| Who is playing | anonymous room peers; no account id | no |
| Game end | each browser on its own; nothing recorded | — |

What that means:

1. **The score can be forged.** A modified client can send `r: [0, 25]` in its next state snapshot, and the honest phone will display and log 25 runs. Afterwards **both play logs agree on the forged score**. So the "both players submit, the server compares hashes" idea I first sketched would accept it. An Edge Function on its own does **not** make results secure.
2. **Pitch outcomes aren't reproducible.** Location, zone, wild pitch and HBP come from the pitcher's private randomness, so even an honest opponent can't check them.
3. **Rosters aren't checked.** Today an edited save can bring 99-rated players.
4. **Inputs are self-reported.** Swing timing and the pitch meter are measured on each player's own device. No server can know whether a human or a script pressed the button. This is true of every rhythm or timing game, and of an authoritative server too.
5. **No identity or record.** The room doesn't know which accounts are playing, and nothing records the result.

## What has to change before ranked can count (step 3a, client)

These changes go in the game's online code. Casual online keeps today's behaviour until each part is proven by `tests/desync.py`.

1. **The server starts the match.** `match-start` (Edge Function) creates the match, records both account ids and clubs, and issues the seed. The `gid` becomes the server's match id, so a host can't choose or re-roll seeds.
2. **Only inputs travel.**
   - The pitcher sends `{pitch type, release quality}`.
   - The batter sends `{swing timing, take/swing/bunt, steal}`.
   - Everything those inputs lead to (location, zone, wild pitch, HBP, contact, fielding, runners) is computed by **both** phones from the shared seed. That means moving the pitcher's location, wild-pitch and HBP rolls into `netRand`.
3. **Snapshots verify instead of overwrite.** Each phone keeps its own state. The snapshot becomes a short hash of the state; if the two hashes disagree, a ranked match is marked **disputed** instead of quietly taking the pitcher's version. (Casual still heals as today.)
4. **Rosters are checked.** In ranked, both phones and the server require the stock roster for each club; anything else refuses to start.
5. **Each phone keeps a structured log.** For every pitch it records the inputs, the outcome and the state hash after it, so the plate-appearance and pitch rows can be written straight from it.
6. **Both phones submit at the end.** `match-submit` accepts a ranked result only when:
   - both logs and final hashes match;
   - the log is internally consistent (the server re-adds it: runs per inning = scored PAs, 3 outs per half, plate appearances follow the lineup, totals equal the final score);
   - the game is long enough.

   Then `finalize_match` writes stats and ELO in one transaction. One player alone means a forfeit after a timeout; any mismatch means disputed.

After 3a, a cheater can't forge the score, the state, the randomness, the roster or the identity. What's left is **input cheating**: a script that releases the meter perfectly or swings with perfect timing. Mitigations, in order of cost:

- **Statistical flags.** `pitches.swing_err_ms` and `meter_q` are stored per pitch; flag accounts whose timing spread is beyond human, and hold their rating changes for review.
- **Replay on the server.** Make the game's rules code (pitch → contact → fielding → runners) run without the screen, so `match-submit` can replay the inputs and compute the result itself instead of trusting either phone's outcome. This also catches two cooperating modified clients.
- **An authoritative game server** (Node/Deno, WebSockets) that runs the match live. It's the same rules code as the replay, so the replay work isn't wasted. Only worth it if the replay plus flags prove insufficient. Even then, the server still can't tell a human tap from a scripted one.

The schema doesn't change between these options. `match_submissions.log` keeps every input, so old matches can be re-checked when replay arrives.

## Database (step 2, done: `supabase/migrations/001_core.sql`)

| Table | Holds | Browser access |
|---|---|---|
| `profiles` (existing) | username, + `avatar` key | public read, owner writes username |
| `seasons` | ladders `stock` / `custom`, one active each | read |
| `matches` | mode, status, verified, seed, park, clubs, both UUIDs, score, log hash, idempotency markers | read verified finals + your own |
| `match_participants` | per side: user, club, roster kind + fielded roster, result, rating before/after | same |
| `match_submissions` | each player's end-of-game report + full input log (PK match+user → duplicates ignored) | your own only |
| `plate_appearances` | inning, half, batter/pitcher UUID + player key, outs, bases, result, RBI, EV, LA, spray, distance | the two players only |
| `pitches` | type, mph, location, zone, meter quality, outcome, swing timing error, stamina, wild | the two players only |
| `player_stats` | per player × mode × season (0 = career): batting + pitching totals | public read |
| `ratings`, `rating_history` | ELO per season ladder, peak, W/L | public read |
| `wallets`, `coin_ledger`, `card_catalog`, `inventory`, `pack_openings`, `card_upgrades`, `custom_rosters` | the future server-owned economy (empty for now) | your own only (catalogue public) |
| `leaderboard_ranked` (view) | rank, username, rating, W, L, win %, HR, AVG per season | public |
| `player_stat_lines` (view) | each player's lines per mode with AVG/OBP/SLG/RA9 | public |

Modes are `arcade`, `full`, `playoffs` (single player, always `self_reported`, can never be verified), `casual`, `ranked_stock` and `ranked_custom`. The database itself refuses a verified single-player match, a ranked match without a season, and a ranked match between one account and itself.

Writes go only through four service-role functions. Each locks the match row and checks a marker, so a repeat call does nothing:
- `finalize_match`: stats, then rating, in one transaction.
- `apply_match_stats`: adds a match's plate appearances into season and career lines.
- `apply_ranked_rating`: ELO. K = 40 for a player's first 10 games, then 24. The 4th+ win against the same opponent in a day earns 0.
- `grant_coins`: an idempotency-keyed ledger line plus wallet change, never negative.

Tested locally on Postgres 16 with a Supabase-like setup (`supabase/tests/run.sh`). The run covers 45 checks:
- existing profiles and saves survive;
- re-runs are safe;
- stat arithmetic and ELO are correct;
- finalising twice is a no-op, and 8 simultaneous finalise calls count once;
- browsers can't write ratings, stats, coins or matches, or call the functions;
- other players can't see your pitches or wallet;
- visitors see the leaderboard only.

**To run it:** Supabase dashboard → SQL Editor → New query → paste `supabase/migrations/001_core.sql` → Run. It's safe to run again.

Growth notes:
- About 300 pitches per 9-inning match is roughly 20 KB, so the free 500 MB holds about 20k ranked matches with pitches.
- After that, move old `pitches` and `match_submissions.log` rows to Storage. Aggregates stay.
- Backups: Supabase Pro has daily backups; on the free plan, a weekly `pg_dump` GitHub Action.
- Error monitoring goes through PostHog exceptions; Edge Function logs are in Supabase.

## Analytics (step 5): see `ANALYTICS_EVENTS.md`

Postgres holds the baseball record (ranked, and later single-player reports). PostHog holds behaviour: sessions, funnels, retention, feature use, sampled balance events and errors. Nothing high-volume goes to both.

## Later

- Custom-team ranked: migrate each player's cloud-save cards, levels and coins into `inventory` / `wallets` once. Pack opening and level-ups move behind Edge Functions. `custom_rosters` locks into `match_participants.roster` at match start.
- A matchmaking queue (a Postgres table first; Redis only under real load).
- Server replay, then an authoritative server, as above.
