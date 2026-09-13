# Native animation timing and impact selection

This is source evidence for the pending combat-animation work, not a claim that the current renderer already implements it. The supplied RA2 executable was statically read, never executed. Its SHA and provenance limits are recorded in [the speed audit](NATIVE_SPEED_REFERENCE.md); the relevant animation instructions are preserved in [this concise text excerpt](../tests/artifacts/gameplay/native-animation-disassembly.txt).

The executable's animation constructor defaults to a one-game-frame interval. Its `Rate` INI reader converts positive authored values to `floor(900 / Rate)` game frames per animation frame, and nonpositive values to zero. An omitted Rate leaves that default interval of one. The authored `Normalized` flag then passes the interval through the options-dependent `GetAnimSpeed` function before starting the animation's countdown.

For intervals 1–4, `GetAnimSpeed` uses the following literal table. Zero remains zero. For intervals at least 5 the supplied executable uses integer division `interval * 8 / (GameSpeed + 1)`.

| Input interval | Speed 0 | Speed 1 | Speed 2 | Speed 3 | Speed 4 | Speed 5 | Speed 6 | Speed 7 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 2 | 2 | 1 | 1 | 1 | 1 | 1 | 1 |
| 2 | 3 | 3 | 3 | 2 | 2 | 2 | 1 | 1 |
| 3 | 5 | 4 | 4 | 3 | 3 | 2 | 2 | 1 |
| 4 | 7 | 6 | 5 | 4 | 4 | 4 | 3 | 2 |

Under the project's documented 30-logic-frame reference (native speed index 2), ordinary Rate 300 animation advances every 3 ticks; Normalized Rate 300 advances every 4 ticks. The actual Allied barracks flag `[GAPILE_A]` uses `Rate=300`, `Normalized=yes`, `LoopStart=0`, and exclusive `LoopEnd=15`, giving a 2-second loop at that reference setting. This is a calculation from the source, not a wall-clock measurement of a running original game. A hardcoded `time * 60` applied to every animation does not represent this distinction.

The maintained [Phobos animation implementation](https://github.com/Phobos-developers/Phobos/blob/develop/src/Ext/Anim/Body.cpp) independently follows this order: read the type interval, apply the optional random interval, apply `GetAnimSpeed` when Normalized, and start the animation timer. [YRpp's ProgressTimer](https://github.com/Ares-Developers/YRpp/blob/master/ProgressTimer.h) advances a frame when that integer countdown expires. These references corroborate the supplied executable without establishing identical behavior for every original-game release.

The executable's normal warhead impact selector uses `min(damage, AnimList.length * 25 - 1) / 25`, with integer division. The water/Conventional branch uses the separate SplashList and 35 damage per entry; electromagnetic effects have a random-selection branch. For the currently implemented ground roster, authored weapon and warhead data selects:

| Weapon user | Warhead | Damage per projectile | Original impact animation |
| --- | --- | ---: | --- |
| GI / deployed GI | SA / SSA | 15 / 15 | PIFFPIFF |
| Conscript | SA | 15 | PIFFPIFF |
| War Miner | HARVWH | 30 | PIFFPIFF |
| Rocketeer | SSA | 25 | PIFFPIFF |
| Pillbox / Sentry | SA | 50 | PIFFPIFF |
| Grizzly / Rhino | AP | 65 / 90 | S_CLSN22 |
| IFV | HE | 25 | XGRYSML2 |
| Flak Track | FlakTWH | 25 | HTRKPUFF |

All four selected impact art sections omit Rate and therefore inherit the one-tick interval. S_CLSN22 is Normalized; at speed index 2 that remains one tick. A local read of the existing MIX archives decoded every frame of all nine impact/death candidates successfully, without fetching anything. The [recorded frame ranges](../tests/artifacts/gameplay/native-combat-frames.json) give PIFFPIFF 12 frames (0.4 seconds at this reference), S_CLSN22 and XGRYSML2 13 each (13/30 seconds), and HTRKPUFF 15 (0.5 seconds). Runtime validation must still verify these original files before play.

IFV currently aggregates its two-round burst for damage; using that aggregate to choose an impact would incorrectly select a larger animation. Projectile travel, burst separation, death explosion selection, infantry death sequences, lighting/translucency, and water impacts need their own implementation and verification before claiming full combat parity.
