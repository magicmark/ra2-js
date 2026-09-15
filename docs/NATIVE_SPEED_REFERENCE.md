# Native ground-speed reference

Status: the verified base-speed conversion is now applied to all nine ground-unit TOMLs. Immutable snapshots captured before this patch retain their earlier values.

## Browser default pace

Fresh games use the existing **Faster** setting (2×, native speed index 1):
60 logic frames per wall-clock second. The previous default was **Fast**
(1×, 30 logic frames per wall-clock second). At the new default an aligned
Grizzly on clear ground travels 3.984375 cells per wall-clock second, up from
1.9921875. Its authored 17 leptons per logic frame stays the same, as do the
relative movement, turning, combat and production rates.

Options still offers every existing speed. Saved speed choices take precedence,
and restarting or switching maps retains the selected speed. This is a browser
pace choice, not a claim of measured retail wall-clock parity. The fixed
simulation step remains 1/30 second; the input and camera clock is unchanged.
The default and reference pace are covered in `tests/game-speed.test.ts`.

## Authored ground movement

The supplied installer was read locally with the existing `7z-wasm` dependency, extracting only `game.exe`; neither executable was run. Its SHA-256 is `06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb`. The PE resource identifies Red Alert 2, Westwood Studios, FileVersion/ProductVersion `1.08`, and the archive entry is dated 2011-09-07. These identify the supplied binary, **not an unmodified retail executable**.

The [small disassembly excerpt](../tests/artifacts/gameplay/native-speed-disassembly.txt) follows the exact `Speed` string reference at `0x7d381c` into its INI parser at `0x6dcbee`. It reads an integer, clamps it to 0–100, shifts left eight bits, divides by 100 using the compiler’s signed constant-division sequence, clamps to 255, and stores the resulting type speed. For the nonnegative authored roster:

```
leptonsPerFrame = min(255, floor(clamp(Speed, 0, 100) * 256 / 100))
cellsPerSecond = leptonsPerFrame * 30 / 256
```

The [YRpp locomotor interface](https://github.com/Ares-Developers/YRpp/blob/master/Interfaces.h) independently specifies current speed in leptons per game frame. [Phobos’s maintained integer/decimal parser](https://github.com/Phobos-developers/Phobos/blob/develop/src/Utilities/INIParser.h) uses the same scale, while extending input to decimals through `Game::F2I`; its [ReadINI hook](https://github.com/Phobos-developers/Phobos/blob/develop/src/Ext/TechnoType/Hooks.cpp) shows where the engine read is replaced. The supplied RA2 integer disassembly establishes the roster’s exact positive rounding directly, without guessing the decimal helper’s behavior.

| Existing ground unit | Authored Speed | Integer leptons/frame | Cells/sec at 30 logic frames/sec |
| --- | ---: | ---: | ---: |
| GI, Conscript, Engineer, Chrono Miner, War Miner | 4 | 10 | 1.171875 |
| Rhino | 6 | 15 | 1.7578125 |
| Grizzly | 7 | 17 | 1.9921875 |
| Flak Track | 8 | 20 | 2.34375 |
| IFV | 10 | 25 | 2.9296875 |

The chosen 30-frame reference clock remains documented in [gameplay evidence](GAMEPLAY_PARITY.md); no native executable was launched to measure wall time. `GameSpeedBias=1.6` is not applied. Rocketeer remains a stated exception: its actual jumpjet locomotor has separately authored `JumpjetSpeed=30`, height and acceleration rules, while the current implementation does not reproduce that locomotor. Applying ordinary ground `Speed=9` would silently claim a conversion that does not establish its flight behavior.

Original `rules.ini` terrain data gives Foot/Track/Wheel 100% on Clear, Rough and Road, and 90/70/50% on Tiberium. Water and Rock give those three movement types 0%. The current generated map’s sand/ore labels have not yet been demonstrated to correspond to the original runtime LandType and locomotor processing, so that broader terrain conversion is not silently inferred from the names. This patch corrects the clear-ground base rates; terrain-specific speed, damage slowdown, prone infantry, jumpjet flight and Chrono Miner teleport timing remain separate verification work.

The candidate passed all 47 affected simulation/production/facing/gameplay checks with the original rules/art fixtures before landing. This includes direct one-second GI/Grizzly displacement (10/17 leptons per frame), the unchanged original 180-second enemy attack requirement, shared miner deposits, and crossing vehicles. No AI deadline was extended. The prior 70-check result and native 12/25-frame turn captures remain [historical evidence for that source state](../tests/NATIVE_GAMEPLAY_VERIFICATION.md).

## Options speed positions and frame delay

The subsequent [frame-delay audit](../tests/artifacts/gameplay/native-frame-delay-disassembly.txt) resolves the supplied executable's timing path rather than inferring seven evenly spaced speeds. The Options slider uses position `6 - GameSpeed`. In the mode-5 branch at `0x53fcb0`, and the unlocked mode-0 branch, `0x54000e–0x54002c` copies GameSpeed into the frame timer's duration at `0x839998`. The locked mode-0 branch forces index 2. `0x540960` and `0x540ab4` calculate the remaining duration before continuing.

The clock helper `0x69a430` calls `WINMM.dll!timeGetTime` through IAT address `0x79a524`, then shifts the millisecond count right by four. Thus its ticks are quantized to **16ms**, rather than proving an exact 60Hz clock. Native index 0 installs zero delay; actual maximum speed then depends on processing time. The ordinary nonzero indices support reciprocal relative rates `2 / index` against the chosen index-2 reference. The six bounded slider positions, slowest first, consequently have relative multipliers `1/3, 2/5, 1/2, 2/3, 1, 2`. They must not be replaced with arbitrary quarter/three-quarter steps.

[Phobos's timer implementation](https://github.com/Phobos-developers/Phobos/blob/develop/src/Misc/Hooks.Timers.cpp) describes these single-player/skirmish settings with nominal rates 10, 12, 15, 20, 30 and 60Hz, and treats index 0 as unlimited. Its multiplayer mapping differs. The supplied 16ms clock and machine-dependent work mean those nominal names are not a measured retail wall-clock calibration. The browser's 30Hz reference and any finite fastest-setting cap must remain explicit implementation limits.
