# Music pack

Walk-up songs, pitcher entrance songs and the closer's stadium-show sounds.

## How to add a song
1. Put the mp3 in this folder (`audio/music/`), e.g. `park-hj.mp3`.
2. Open `pack.json`, find the player (each line says who it is), and set `"file": "park-hj.mp3"`.
3. Optional:
   - `start`: seconds into the song where it should begin (skip the intro).
   - `len`: how many seconds to play (it fades out at the end).
   - `title`: the song name shown under the player's name.
   - `vol`: 0.5 is half as loud, 1.5 is louder.
4. Rebuild (`python3 tools/build.py`) and push.

## Sections
- `walkup`: legendary batters. The song plays as he comes up to bat and stops when the first pitch is thrown.
- `entrance`: legendary pitchers. The song plays the first time he takes the mound. `"fx": "closer"` adds the stadium show (lights out, spotlights, his name on screen, light towers flashing, lights back on). Every legendary closer has it; you can add it to anyone.
- `sfx`: the stadium show's own sounds. `closerLightsOut` plays when the lights go out, and `closerLightsOn` when they slam back on (about 3.7 s later).

## Notes
- A slot with `"file": null` plays nothing; the NOW BATTING / NOW PITCHING tag and the closer show still appear.
- Players can turn the songs off in Options → Walk-up music.
- Songs load the first time they're needed (the next legendary batter's song is loaded one batter early), so keep them small: 128 kbps mono/stereo mp3, 10–25 s clips are ideal.
