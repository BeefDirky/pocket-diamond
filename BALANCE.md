# Balance: 2025 MLB targets

The pitch, swing and batted-ball code is tuned so that two CPU teams produce 2025 MLB league rates.
Every CPU at-bat in a game, and all of watch mode, plays to these numbers. A human's results then depend on their timing.

Sources: Baseball-Reference 2025 league batting totals, the pitch summary (pitches per PA, swing and contact rates),
standard pitching (wild pitches) and batting ratios (line drives). The zone and chase rates and the batted-ball mix
come from Baseball Savant's league page.

Measure with `node tests/balance.js` (instructions are at the top of the file).

## CPU vs CPU (12,000 plate appearances, 10 Nov build + balance pass)

| Per plate appearance | Game | MLB 2025 |
|---|---|---|
| Single | 13.8% | 14.3% |
| Double | 4.7% | 4.2% |
| Triple | 0.4% | 0.3% |
| Home run | 3.0% | 3.1% |
| Walk | 9.8% | 8.4% |
| Hit by pitch | 1.4% | 1.1% |
| Strikeout | 22.4% | 22.2% |
| Ground into DP | 1.7% | 1.7% |
| AVG / OBP / SLG | .248 / .331 / .410 | .245 / .315 / .404 |
| Runs per 9 innings | 4.58 | 4.45 |
| Wild pitches per 9 | 0.21 | 0.29 |
| Pitches per PA | 3.57 | 3.87 |

| Per pitch | Game | MLB |
|---|---|---|
| Ball | 35.3% | 36.2% |
| Called strike | 16.1% | 16.2% |
| Swinging strike | 11.4% | 12.0% |
| Foul | 18.3% | 18.1% |
| In play | 18.6% | 17.5% |
| Swing / contact | 48.3% / 76.4% | 47.8% / 74.7% |
| Zone / chase | 49.1% / 29.9% | ~48% / ~30% |

| Balls in play | Game | MLB |
|---|---|---|
| Exit velocity / launch angle | 89.4 mph / 13.5° | 88.8 / 13.9 |
| Ground / line / fly / pop | 40 / 27 / 27 / 7% | 42 / 24 / 27 / 7% |
| Home runs per ball in play | 4.4% | 4.5% |

## A human at the plate (8,000 PA each, swinging at 75% of strikes)

| Timing spread | AVG / OBP / SLG | HR per PA | K | Runs per 9 |
|---|---|---|---|---|
| 60 ms (casual) | .244 / .322 / .417 | 3.3% | 21.9% | 4.3 |
| 40 ms (good) | .284 / .347 / .517 | 4.8% | 15.2% | 5.9 |
| 25 ms (expert) | .322 / .374 / .593 | 5.7% | 11.6% | 7.3 |

A swing on the PERFECT mark is a hit about 46% of the time and a home run about 13% of the time.
Before this pass, a good human hit .362 with a home run in 17% of plate appearances.

## A human on the mound (6,000 PA each)

| Meter release | AVG / OBP / SLG against | K | BB | Runs per 9 |
|---|---|---|---|---|
| careful (sd .12) | .229 / .289 / .358 | 28.3% | 6.8% | 3.3 |
| sloppy (sd .20) | .237 / .288 / .370 | 25.5% | 5.4% | 3.2 |

## Arcade target
The opponent's posted score is drawn from three innings of CPU-vs-CPU scoring:
- 0 runs 42%, 1 run 20%, 2 runs 15%, 3 runs 9%, 4+ runs 14%.
- Team strength shifts it by one now and then.

The old 1–6 target was set when scoring ran about three times MLB's rate. Against the new scoring it would leave a casual player winning about 19% of games.

Estimated win rates against the new target (ties go to extra innings, counted as half):

| Player | Win rate |
|---|---|
| Casual | ~51% |
| Good | ~56% |
| Expert | ~62% |

## What changed
- **CPU pitchers:** they throw about 48% strikes. A ball is drawn off the plate so you can read it; before, a ball could look like it was down the middle.
- **AUTO pitching:** your team's pitcher on AUTO uses the same CPU location. It used to throw every pitch in the zone, so nobody walked.
- **Your meter:** "painted" and "good" releases land on the edges. Some are called strikes and some are just off; a missed spot is a ball.
- **CPU batters:** they swing and chase at MLB rates and take more early in the count.
- **Fouls:** about half of all contact goes foul. Before it was about 15%, and at-bats lasted 2.3 pitches.
- **Contact:** exit velocity and launch angle follow MLB batted balls. Timing raises the exit velocity and tightens the angle.
- **Barrels:** about 8% of contact comes off hard and in the air, and those make most home runs. Perfect timing doubles the chance.
  - Before, any well-timed swing came off at about 110 mph and 15% of balls in play left the park.
- **Power:** hitters with 40–59 power can now homer; before, anyone under 60 never could. High pop-ups no longer carry out.
- **Grounders:**
  - Infielders have realistic range on hard grounders but charge slow rollers at full speed.
  - The pitcher no longer fields grounders far behind him; he used to run down balls rolling into the outfield.
  - Infielders throw harder across the diamond.
- **Outfielders:** they get a jump and a route on balls in the air instead of a perfect straight-line sprint. Balls in the gaps go for doubles.
- **Errors:** batters reach on an error about 0.4% of the time; it was 2.5%.
- **Double plays:** the pivot takes a realistic time.
- **Wild pitches:** about 0.25 per game, from 3.5. A careless release on the meter still risks one.
- **Hit by pitch:** about 1% of plate appearances.
