# Playtest log

## 10 November 2026

How it was played: a script drove the real game in a browser the way a player would (taps on a phone-sized
screen, keys on a PC-sized one), going through the menus, picking a club, and timing swings to the pitch with
human-sized error. Alongside it: a code check for undefined names and dead code, a walk through every menu at
five screen sizes looking for clipped or covered controls, and frame-time measurements in all ten parks, day
and night. Headless Chromium with software drawing, so frame times compare builds, not real devices.

### Sessions
| Session | Screen | What happened |
|---|---|---|
| Arcade, Daegu | Phone upright 390x844, touch | Won 4-3 in the bottom of the 1st on a walk-off: triple, groundout, three home runs. 8 pitches, 2.5 minutes. |
| Arcade, Suwon | Phone sideways 844x390, touch | Lost 3-0 in three innings: 1 hit, 14 swings. 2.5 minutes. |
| Arcade, Seoul | Phone upright, touch | Down 5-0, tied it 5-5 by the 3rd, went to extra innings. Opponent threw over to first three times and changed pitchers. |
| Full game, Jeju | PC 1400x900, keys | Pitched and batted through 6 and a half innings in 24 minutes, behind 12-7. 129 pitches thrown, 9 wild pitches in the first three innings. |
| Batting practice | Phone upright, two sizes | 14 swings each, ball cam, pitch picker, pause menu, options. |
| Watch, playoffs, pause, quit | PC | Bracket simmed to the final, watch game ran, pause and quit to menu worked. |

No crashes, no script errors and no stuck states in any session. Steady play had no long frames; the only
pauses were the park being built when a game starts.

### Bugs found and fixed
- B was announced as the bullpen key ("press B to make a change") but only ever bunted. It now opens the bullpen when you are pitching.
- A foul that made it strike two said "Still two strikes".
- Phone sideways: on the FINAL screen the player cards, timing bar and swing buttons sat on top of the result card and covered "Open card packs".
- Phone sideways: the main menu and club select ran off the bottom (PLAY BALL below the fold); the lineup field was squeezed until names read "HWA...".
- Batting practice, phone upright: "Throwing: FASTBALL" ran off the side of the pitching-machine card.
- PC pitching: pitch buttons were out of key order (1, 3, 4, 2) and labelled in 11px type.
- Long names were cut off on the lineup field and in the at-bat card on narrow phones; "PITCHING R SIDEARM" overflowed its header.
- AUTO, INFO and the volume sliders were under 30px tall on touch screens.
- The Sponsors screen had a BACK button at the bottom instead of the back arrow.

### Speed
- Every frame recomposed the whole 1280x1360 park buffer, four or more layers deep, though the camera shows part of it. It now composes only what is on screen: 10-35% less time per frame on a PC window.
- The canvas matched the screen's full pixel density with a cap of 3x; a large retina or 4K window meant 8-15 million pixels a frame. It now has a 4.2 million pixel budget (phones are unaffected).
- Removed about 9 KB of code nothing called.

### Left for later (in ROADMAP.md)
Home run rate, wild pitch rate and game length are balance questions. Park build time, the cost of night
lighting and the playoffs resume screen are listed under Speed.
