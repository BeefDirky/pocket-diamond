# Pocket Diamond

KBO-style pixel baseball. An Imugi Labs game.

## Layout

| Path | What it is |
| --- | --- |
| `src/head.html`, `src/style.css`, `src/body.html`, `src/tail.html` | Page shell, styles and menu/HUD markup |
| `src/js/NN-*.js` | Game code, split by system. Files are joined in name order into one script, so they share one scope and order matters |
| `audio/` | Sound effects and music (mp3) |
| `tools/build.py` | Builds everything (see below) |
| `tools/config.json` | Supabase project URL + publishable key (safe to be public) |
| `tests/desync.py` | Online desync check |
| `index.html`, `sw.js`, `manifest.json`, icons | The built web game that Vercel serves. **Don't edit `index.html` by hand.** It's generated |

## Build

```
python3 tools/build.py
```

Writes `index.html` + `sw.js` (web build, audio loaded from `audio/`) and `dist/pocket-diamond.html`
(single-file version with audio embedded, for claude.ai).

## Test before pushing

```
pip install playwright && python3 tests/desync.py
```

Two simulated players play a 3-inning online game over a mock realtime channel. It fails if the two screens
ever disagree, if the game doesn't end on schedule, or on any page error.

**Rule for online-safe code:** anything random that decides a shared outcome must run inside `netRand(...)`
(or code already called from it) so both phones roll the same dice. Purely visual randomness is fine anywhere.

## Online

Online 1v1 runs over Supabase Realtime broadcast channels (no database tables). Each phone re-sends its state
every 2 s, so dropped messages heal; a player only counts as gone after 12 s of silence, and the game waits
45 s for them to come back.

## Clubs

Seoul Rats · Busan Seagles · Suwon Wizards · Daejeon Bears · Gwangju Cats · Changwon Rexes · Incheon Cosmos · Daegu Kings · Ulsan Whales · Jeju Tangerines
