# Native animation timing and impact selection

This records the implemented combat event timing and its source evidence. Simulation and decoder checks do not alone establish complete visual parity. The supplied RA2 executable was statically read, never executed. Its SHA and provenance limits are recorded in [the speed audit](NATIVE_SPEED_REFERENCE.md); the relevant animation instructions are preserved in [this concise text excerpt](../tests/artifacts/gameplay/native-animation-disassembly.txt).

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

All four selected impact art sections omit Rate and therefore inherit the one-tick interval. S_CLSN22 is Normalized; at speed index 2 that remains one tick. A local read of the existing MIX archives decoded every frame of all nine impact/death candidates successfully, without fetching anything. The [recorded frame ranges](../tests/artifacts/gameplay/native-combat-frames.json) give PIFFPIFF 12 frames (0.4 seconds at this reference), S_CLSN22 and XGRYSML2 13 each (13/30 seconds), and HTRKPUFF 15 (0.5 seconds). The strict runtime asset preparation validates these original files before play and installs their decoded frame counts and authored timing in the game.

The IFV now fires its two 25-damage projectiles separately, each selecting XGRYSML2. The supplied executable's ground burst routine inserts 3–5 logic frames between burst projectiles and adds 0–2 frames to the completed burst's authored ROF; the game reproduces those bounds using deterministic project randomness. Ordinary vehicles choose one entry from their authored Explosion list. The exact source, exception branches and limits are in the [burst/death audit](NATIVE_BURST_DEATH_REFERENCE.md). The project does not reproduce the original PRNG stream, veterancy modifiers, or the special Explodes/ammunition death branch.

Effect events record their original animation ID, per-projectile base damage, start time, and effective integer ticks per frame. Their lifetime is the decoded frame count multiplied by that interval. A Normalized effect captures the current native speed index at creation so later speed changes do not make simulation expiration and rendering disagree. Infantry firing intent and actual firing time are separate events. Pausing freezes both; restarting clears battle events and retains the chosen game speed.

## Infantry sequence cadence and firing order

Infantry sequence cadence is separate from AnimType Rate. The supplied executable's actual Infantry vtable at `0x7a3540`, slot `0x4dc`, identifies PlayAnim at `0x504740`. It reads each sequence's timer interval from byte 3 of the packed records beginning at `0x7a3474`, then starts the timer from the current logic frame. The [preserved static excerpt](../tests/artifacts/gameplay/native-infantry-timing-disassembly.txt) includes the complete 38-entry base-RA2 table and the relevant instructions. The maintained [Phobos sequence table](https://github.com/Phobos-developers/Phobos/blob/develop/src/Utilities/SequenceRates.h) corroborates these rates for the shared sequence IDs, while also containing later game variants.

| Supported sequence | Logic ticks per animation frame | Normalized |
| --- | ---: | --- |
| Walk | 3 | No |
| FireUp / FireFly / DeployedFire | 1 | No |
| Deploy / Undeploy | 1 | No |
| Fly | 1 | No |
| Hover | 2 before normalization | Yes |

At native speed index 2, Hover's interval becomes 3. Ready is a static frame in the supported authored sequences. GI Deploy uses 15 frames, Undeploy uses 2, and each GI firing sequence uses 6. Deployment and undeployment block movement and firing until their installed original sequence ends. Repeated deployment commands and movement during deployment are covered as interruption cases; this is not a claim of all original mission-state transitions.

The type's authored FireUp value chooses the firing tick within the action: GI and Rocketeer use 2; Conscript uses 6. Conscript's six rendered FireUp frames are indices 0–5, but the weapon fires when the logical animation Value reaches 6. This is intentional: the supplied executable's Infantry update calls FiringAI at `0x503161` before calling sequence-end handling at `0x50316f`. FiringAI compares Value with the authored FireUp value at `0x507775`, while the later end handler compares Value with the sequence count at `0x5078da`. The game preserves that firing event at tick 6 rather than clamping it to frame 5. Stop, movement, target loss, immediate replacement acquisition, and range loss cancel pending firing intent.

`tests/combat-animation.test.ts` checks firing intent versus the actual firing tick, per-projectile burst damage and delay bounds, deployment interruptions, installed metadata, pause/restart, speed-normalized impact expiration, deterministic cadence across render rates, and ordinary vehicle death selection. The [immutable 4205 browser capture](../tests/NATIVE_COMBAT_VERIFICATION.md) verifies native deployment input, the firing events, separate IFV impacts and ordinary vehicle death through the automatic loop with original artwork.

Projectile flight is still instantaneous at the firing event. Infantry/building death sequences, all special death branches, terrain-specific impact selection, and full native lighting/translucency remain outside this bounded implementation. They need implementation and verification before claiming full combat parity.
