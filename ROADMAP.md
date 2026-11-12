# Roadmap

## Done
- [x] Source split into `src/` files + one build script (`tools/build.py`)
- [x] Online desync check (`tests/desync.py`)
- [x] New main menu: Single Player / Multiplayer / Tutorial / About / Options
- [x] Multiplayer goes straight to the lobby; clubs picked inside the room; same-club games blocked
- [x] Online games end after the chosen innings (3 / 6 / 9)
- [x] Only the player who hit the home run can skip the trot (skips on both screens)
- [x] Pitch clock (15 s) on both screens online; the pitch is thrown automatically when it runs out
- [x] Bunt button on the left in every mode

- [x] Walk-off celebration at the plate
- [x] Outfielders call off infielders on shallow flies; outfield range up
- [x] Splitter lands out of the zone 80% of the time when taken
- [x] Magpies are the default club; wide view zooms out to the whole park; BP hitter picker fixed
- [x] Bullpen: pick your pitcher (six-man staffs; starters 4 pitches, relievers 3), synced online
- [x] Pickoffs for the pitching player (Q / W), online too; no bat-drop sound on pickoffs
- [x] Runner on 2nd scores on a single by speed (70+ scores, 50-69 play at the plate, <50 holds)
- [x] Hit-by-pitch ricochet + batter flinch
- [x] Smaller line score on phones
- [x] Club info + fun facts in the club picker; local banner slogans; city murals in left field
- [x] Diving plays error more often; NPC pickoffs wait a beat; walk-off mob starts when the game is won; crowd cheer on the ball landing
- [x] Suwon Foxes + Changwon Armadillos redesign (logos, mascots)
- [x] New stadiums: Suwon Fortress Field, Changwon Fossil Yard, Busan Harbor Field, Incheon Orbit Park (shared bowl engine)
- [x] Arcade: 1/3/5-game series, lineup page before the game, opponent target 1-6 (extremes rarer)
- [x] Lineup screen: cards on the field, flip for stats, rarity colours, sign cards from your collection
- [x] Layout follows the window: portrait/near-square = phone layout, landscape = PC; phone-sideways pop-up pitch menu
- [x] Perf pass on the new stadiums (cached jumbotron art, sprite cache, baked light pools)
- [x] Extra-base hits: ball runs to the wall and caroms, outfielder chases it down
- [x] Error guard: one bad frame can't freeze the game; silent if audio isn't on yet
- [x] Outfield throws to second always have a fielder on the bag

## Online failsafes
- [ ] Rejoin after a page reload (same room code restores the game)
- [ ] Lag / connection indicator
- [ ] Rematch button
- [ ] Version lock: both players must be on the same build

## Balance (audit, Nov 2026: 15k simulated swings, 13 full bot games)
- [x] Perfect timing should be the best timing: a PERFECT swing now hits ~.46 with a home run 13% of the time (BALANCE.md)
- [x] Too many home runs, too few singles: tuned to 2025 MLB (HR 3% of PA, 4.4% of balls in play); see BALANCE.md
- [x] Scoring runs high: CPU teams now score ~4.5 a game (2025 MLB 4.45)
- [ ] Watch mode takes 22-26 minutes for 9 innings
- [ ] Playtest, 10 Nov: a full game you bat and pitch runs past 30 minutes; each home run trot is 18 s unless skipped
- [x] Playtest, 10 Nov: a careless release on the pitching meter throws a lot of wild pitches: now ~0.25 a game (MLB 0.29), a careless release adds a small risk
- [x] Playtest, 10 Nov: a bot timing within ~25 ms hit 5 home runs in 6 innings: an expert (25 ms) now homers in ~6% of PA
- [x] Arcade targets vs the new scoring: the posted score now follows 3-inning game scoring (0 most often); casual ~51% wins, expert ~62%
- [ ] At-bats are longer now (3.6 pitches vs 2.3), so games take longer: pair with "faster time between pitches"
- [ ] Team + player rating pass with bot sims
- [ ] Pitcher fatigue and bullpen use
- [ ] Online timing window tuned for network delay

## Game feel
- [ ] Pitch location control for the online pitcher
- [ ] Faster time between pitches

## Look and readability (audit)
- [ ] PC menus are small in a normal window (Options, How to Play, About at 1400x900)
- [ ] Card Collection: ~150 bits of text under 10px
- [ ] Portrait PC monitor: the phone-layout HUD stays phone-sized and tiny at 1050x1780; scale it up
- [x] Gwangju rebuilt as Mudung Field: stone terrace in left, brick-and-glass hospitality block in right, board between stone towers, Mudeungsan forest behind
- [ ] Older parks still on the original look: Seoul, Daegu, Daejeon, Jeju (Daegu and Jeju plainest)
- [ ] Playoffs behind the new arcade flow: no lineup page, Menu button instead of the X, no series banner
- [ ] Stadium leftovers: Busan plaza detail, Changwon entrance, Suwon tower size, Orbit Park reference image
- [ ] claude.ai build is 7.9 MB (all audio inlined); slow on phones. Vercel build is 0.7 MB

## Later
- [ ] Custom domain (play.imugilabs.com: CNAME at Squarespace)
- [ ] Stat tracking / records
- [ ] Ranked or matchmaking

## Speed (playtest, 10 Nov)
- [ ] Building a park freezes the page for 1-2.5 s on a PC (Ulsan slowest), longer on phones; move it off the main thread or cache it
- [ ] Night games cost ~5 ms a frame more than day games on PC (two full-screen light layers)
- [ ] Field, crowd, signs and decor are four full layers recomposed every frame; merge the static ones
- [ ] Leaving mid-playoffs and reopening the game lands on the bracket, not the main menu

## Bugs found while playing
- See PLAYTEST.md for the 10 Nov session (all fixed)
