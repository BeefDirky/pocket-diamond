# Backend plan: accounts, ranked, leaderboards, analytics

Status: assessment done (13 Nov 2026). Nothing in this plan is built yet except what "Exists today" lists.

## Exists today

| Area | What's there | Where |
|---|---|---|
| Hosting | Static site on Vercel (no server code). Same build also runs as a claude.ai artifact. | `vercel.json`, `tools/build.py` |
| Auth | Supabase email/password, confirmation + reset emails, session kept in the browser | `src/js/23a-account.js` |
| Usernames | `profiles` table: UUID key, unique case-insensitive name, public read, owner write | `supabase/profiles.sql` |
| Cloud save | `saves` table: one JSON blob per user holding the browser's progress keys (cards, signings, wallet, playoffs, lineup, options) | `23a-account.js` |
| Multiplayer | 1v1 over Supabase Realtime broadcast. Both phones run the full game; shared seeds keep random outcomes identical; the pitcher re-sends full state each pitch; reconnect with backoff | `src/js/23-online.js` |
| Desync test | Two headless players, compares both play-by-play logs | `tests/desync.py` |
| Economy | Coins, packs, card levels: all computed and stored **in the browser** | `24*-*.js` |
| Stats / ranked / analytics | None | — |

## What that means for trust

- Every number the player can see (coins, cards, levels, wins) lives in browser storage and is copied up as a blob. Anyone can edit it. That's fine for a single-player game, but none of it can feed a leaderboard.
- **Signed cards travel into online games with their levels** (`rosterSpec`). An edited save can field a lineup of 99-rated players in a multiplayer game today.
- Online games have no server referee. Both phones play the game and each judges its own swings. A server can't re-judge a swing from timing it never saw, so "validate the outcome" here means **both players' screens must agree on the result**, not "the server replays the game".
- Single-player results (arcade, full games vs CPU, playoffs) can't be validated at all. There's no opponent to cross-check.

## Recommended architecture

Keep what works and add only what's needed:

- **Supabase Postgres**: the record of truth for accounts, ranked matches, stats, seasons and leaderboards. Already in use.
- **Supabase Edge Functions (TypeScript)** instead of a separate Node.js server. Same language, no server to host or patch, and they get the user's login token for free. Free tier is 500k calls a month. A Node server only makes sense later, if the game moves to a server-run simulation.
- **Supabase Realtime** stays the multiplayer transport. It's already WebSockets, already handles reconnects, and is already tested.
- **PostHog** (free tier: 1M events a month) for behaviour: sessions, retention, funnels, feature use, balance sampling.
- **No Redis** until there's matchmaking load to justify it. Postgres can handle a queue table for a long time.

### How a ranked result becomes trusted

1. Two signed-in players start a ranked match. An Edge Function `match-start` creates the `matches` row (status `live`), picks the seed, and returns a match id. Both clients use that seed.
2. During play, each client keeps a compact play-by-play log (the same log the desync test already compares).
3. At the end, **each** client calls `match-submit` with the match id, final score and log. The call is idempotent: same player + same match = no-op.
4. When both submissions are in and the logs hash identically, the function marks the match `final`, writes plate appearances and pitches from the agreed log, updates season stats and ELO in **one transaction**, and grants rewards. If the logs disagree, the match is marked `disputed`, so no stats and no ELO. If one player never submits (rage-quit), it's a forfeit after a timeout. Only the player who stayed gets the win.
5. Browsers can **read** leaderboards but can't **write** stats, ELO, matches or wallets. Only the Edge Function can, using the service role key, which never ships to the browser.

The one hole is someone running two accounts against themselves. Mitigations: ELO gain shrinks against much lower-rated or brand-new accounts, a daily cap on ranked wins between the same pair, and a flag for review.

### Ranked rosters

Ranked uses each club's **stock roster: no signed cards, no levels**, so an edited save can't buy a ranked win and the stats compare like for like. Cards keep working in casual online and single-player. (The alternative is moving the whole card economy to the server; see "Later".)

## Database (new tables; all keyed by the user's permanent UUID)

```
profiles            existing: user_id, username, uname_lc (+ avatar, country later)
player_stats        user_id, season_id, mode('ranked'), games, wins, losses, pa, ab, hits, hr, bb, so, runs,
                    pitch_outs, pitch_runs, pitch_so, elo, peak_elo, updated_at          ← written only by functions
seasons             id, name, starts_at, ends_at, active
matches             id, season_id, mode, status(live/final/disputed/forfeit), seed, park, innings,
                    home_user, away_user, home_club, away_club, home_runs, away_runs, winner,
                    log_hash, started_at, ended_at
match_submissions   match_id, user_id, log_hash, score, submitted_at   (PK match_id+user_id → idempotent)
plate_appearances   match_id, n, inning, half, batter_user, pitcher_user, batter_name, result, rbi, ev, la
pitches             match_id, pa_n, n, type, mph, zone_x, zone_y, call, swing_err_ms
elo_history         user_id, match_id, before, after, at
leaderboard (view)  per season: rank, username, elo, wins, win%, hr, avg (min PA), top 100
```

Not moved to the server now: card inventory, coins, pack opening. They stay in the cloud-save blob (see "Later").

Security:
- Row Level Security on every table. Public: `profiles`, `leaderboard` view, final `matches`.
- Private: submissions, raw pitches.
- Write: only the service role (Edge Functions).

Indexes:
- `matches(season_id, ended_at)`
- `player_stats(season_id, elo desc)`
- `plate_appearances(batter_user)`
- `pitches(match_id)`

Rate limits: `match-submit` refuses more than 1 call/sec per user and more than 60 ranked starts/day.

Backups: Supabase daily backups (Pro plan) or a weekly `pg_dump` GitHub Action on the free plan.

Size check: about 300 pitches × 60 bytes per match ≈ 18 KB, so the free 500 MB holds roughly 25k ranked matches before pitches need archiving.

## Analytics split (no double-counting)

| Data | Goes to | Why |
|---|---|---|
| Ranked matches, PAs, pitches, ELO | Postgres only | authoritative, drives leaderboards |
| Sessions, DAU/MAU, retention, registrations | PostHog | built-in |
| `game_start` / `game_end` / `game_abandon` (mode, park, clubs, innings, score, duration) | PostHog | popularity, completion funnels, every mode including single player |
| `pa_end` (result, EV, LA, timing error, pitch type) | PostHog, **sampled** (e.g. 20% of sessions) | balance analysis without blowing the 1M free events |
| Pack opened, card levelled, card signed, coins earned | PostHog | feature use and economy |
| Online: room created/joined, reconnects, disconnect reason, match result | PostHog | multiplayer health |
| Errors (the game's error guard) | PostHog `$exception` | error monitoring with no extra tool |

PostHog is only loaded on the website build (not the claude.ai artifact). Analytics is skipped if the player declines in Options.

## Developer dashboard

- **PostHog dashboards** (graphs, filters, date ranges built in) for: active players and growth, D1/D7/D30 retention, sessions, game modes and parks, start→finish funnels, abandonment, cards, multiplayer health, and pitch/swing balance from the sampled `pa_end`.
- **Postgres** stats (ranked distributions, ELO spread, pitch outcomes by type) are linked into PostHog through its Postgres data-warehouse connector, so there's one dashboard rather than two.
- No custom admin page to build or secure. If one is wanted later, it's an Edge Function gated to an `admins` table.

## Steps (each one shippable on its own; gameplay unchanged)

1. ~~Audit~~ (this document)
2. **Schema**: SQL for seasons, matches, submissions, PAs, pitches, stats, ELO, leaderboard view, RLS, indexes. Run once in Supabase.
3. **Match recording**:
   - Client: ranked toggle in the multiplayer lobby (signed-in only, stock rosters), structured play log, submit at game end.
   - Server: Edge Functions `match-start` and `match-submit` with consensus, ELO, idempotency and forfeits.
4. **Leaderboards + profiles**: a LEADERBOARD screen (ELO, wins, win %, HR, AVG; season picker; top 100; your rank) and a player profile card (tap a name).
5. **PostHog**: the events above, sampling, opt-out, error capture.
6. **Dashboards**: build the PostHog dashboards and connect the Postgres warehouse.
7. **Multiplayer reliability**: rejoin after reload, connection indicator, version lock, rematch (already on the roadmap).

## Later, not now

- Server-run economy (coins and packs granted by functions, inventory table), so cards could be used in ranked. This only matters once ranked uses cards.
- A matchmaking queue (a Postgres table first, Redis only if needed).
- A server-authoritative game simulation (Node) if cheating via timing bots becomes a real problem.

## What Derrick needs to do (when we reach each step)

- Step 2: paste one SQL file into Supabase.
- Step 3: install the Supabase CLI or paste two functions into the dashboard's Edge Functions editor, and add the service-role secret there (it never goes in the repo).
- Step 5: create a free PostHog account (US cloud) and send the project API key. That key is public by design.
