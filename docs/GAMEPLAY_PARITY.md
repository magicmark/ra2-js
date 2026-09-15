# Gameplay controls and timing evidence

Updated 2026-09-13. This records what is implemented and verified in the current skirmish; passing these checks does not establish complete retail RA2 parity.

## Primary references

- [Original Westwood RA2 manual, printed pages 15–18 and 29–32](https://oldgamesdownload.com/wp-content/uploads/manuals/command-and-conquer-red-alert-2_win_manual_en_8mo.pdf): mouse conventions, command keys, GI deployment, game speed. The [manual transcript](https://oldgamesdownload.com/manual/command-conquer-red-alert-2-windows-manual-english/) was read alongside it.
- Original `rules.ini` extracted from the supplied RA2 archives: SHA-256 `fd1e95cea0306ea78049dc81c8cd816e18c28c496872a1ff02edd50bd082062f`.
- Original `art.ini`: SHA-256 `b477f861063a9509e87b7836b78190204c73bea5ea5595a842c456f5920ea223`.
- [YRpp `FacingStruct`](https://github.com/Phobos-developers/YRpp/blob/master/GeneralStructures.h): primary maintained engine integration showing 16-bit direction, `ROT × 256`, shortest-angle integer step counts, and finite turns. Its applicability to the exact retail RA2 runtime remains a reconstruction boundary.
- [CnCNet's maintained Yuri's Revenge client speed options](https://github.com/CnCNet/cncnet-yr-client-package/blob/develop/ForcedOptions.md) identify skirmish setting 2 as 30 frames/second and setting 1 as 60. This is a current integration reference, not a measurement of an unmodified retail RA2 executable.

The local original files are opt-in test fixtures under `RA2_ASSET_DIR`; they are not committed to this repository.

## Controls now implemented

| Input                                 | Current behavior                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Left click                            | Select a friendly unit/building; command the current selection; selected GI toggles deployment.                                                                                |
| Right click                           | Cancel placement or a command mode; otherwise deselect. Existing unit orders continue.                                                                                         |
| Right drag / middle drag              | Pan the camera without issuing an order or deselecting.                                                                                                                        |
| Shift + click                         | Add a unit or remove an already selected unit.                                                                                                                                 |
| Drag selection                        | Select friendly mobile units in the rectangle.                                                                                                                                 |
| Ctrl + Shift + click                  | Move while engaging encountered enemies.                                                                                                                                       |
| Ctrl + click                          | Deliberate fire at an entity, including friendly units, or at explored ground.                                                                                                 |
| Alt + click                           | Deliberate movement; vehicles authored as crushers can crush enemy infantry.                                                                                                   |
| Ctrl + Alt + click                    | Guard a destination or escort a friendly entity.                                                                                                                               |
| P / T                                 | Select mobile units throughout the battlefield / current selected types onscreen; a second T within 400ms expands type selection throughout the map.                           |
| Ctrl + 1–9 / 1–9                      | Store / recall control groups; Shift adds a recalled group. A second recall centers the camera.                                                                                |
| S / G / X / D                         | Stop in place / guard the area / scatter / toggle GI deployment.                                                                                                               |
| Q / W / E / R                         | Structures / defenses / infantry / vehicles tabs, through the UI callback.                                                                                                     |
| K / L                                 | Toggle persistent repair / sell cursor modes. Click an owned building to act.                                                                                                  |
| H / F                                 | Center the construction yard / follow the selected unit. Camera input cancels follow.                                                                                          |
| M / N / U                             | Select the next mobile unit by creation order / restore a previous selection / cycle populated green, yellow, and red health groups.                                           |
| Ctrl + F1–F4 / F1–F4                  | Store / jump to a camera bookmark.                                                                                                                                             |
| Hold Z, click destinations, release Z | Queue up to 32 movement destinations per selected unit, then execute. The command-bar planning button keeps this mode active until toggled off.                                |
| Radar click                           | With selected mobile units, orders movement/attack/harvest or the active modifier command; without a selection, centers the camera. Right click cancels or deselects.          |
| Native contextual cursor              | Select, move/blocked, attack, attack-move/blocked, deploy/blocked, repair/blocked, sell/blocked, guard, pan and eight scrolling directions use the actual command eligibility. |
| Native team buttons                   | First click with a selection assigns an unused team; later clicks recall it. Ctrl reassigns; right click disbands.                                                             |
| Esc                                   | Cancel an active placement/mode; otherwise open options through the UI callback.                                                                                               |
| Arrows / pointer at map edge          | Continuous camera scrolling.                                                                                                                                                   |
| Wheel / +/-                           | Zoom; browser extension to the original controls.                                                                                                                              |
| Touch                                 | Explicit select/pan/attack modes, selection drag, two-finger pan and anchored pinch zoom.                                                                                      |

The prior A-for-attack and P-for-pause bindings are removed. A is an alliance command in the original multiplayer game. F1 is a bookmark key. Buttons retain native Space/Enter activation. Text input, open dialogs, the source gate, window blur, and canceled pointer gestures suppress battlefield commands. Groups, bookmarks, and queued gestures reset with a new battle so reused entity IDs cannot recall stale teams.

This implements applicable commands for the existing roster. The game does not claim support for multiplayer chat/alliance/taunts, veterancy selection, audible cheers, editable/looped patrol waypoint networks, transport passenger deployment, MCV repacking, or the complete retail command catalog in the keyboard customization screen. Z currently queues movement destinations, not attack/capture actions at individual waypoints. Health cycling is explicitly by the three displayed health bands.

## Configurable core keys and speed settings

The native Keyboard dialog exposes 19 implemented commands across Orders, Selection, View and Production. Defaults are the keys listed above. Plain A–Z and `?` can be reassigned; assigning an occupied key unassigns its previous command, as the original manual describes. The UI can inspect and display that conflict before assigning. Reset All restores the native defaults. Team digits, bookmarks, modifiers, Escape, arrows and browser shortcuts remain fixed; they are not presented as editable commands. Held planning routes follow the assigned Planning key, and modal capture cannot issue battlefield orders.

Bindings persist only under `ra2-keyboard-bindings:v1`, including commands explicitly left unbound. Invalid or inaccessible storage restores the default bindings without blocking the game; denied writes do not prevent in-session customization. This storage does not alter the original-asset source or cache records.

The seven Game Speed positions map to `[1/3, 2/5, 1/2, 2/3, 1, 2, 4]` relative to the project's 30-logic-frame reference. The first six reflect the supplied executable's reciprocal frame-delay ratios for native indices 6 through 1. Native index 0 is unlimited; the browser's final position has an explicit 4× cap. The [frame-delay audit](NATIVE_SPEED_REFERENCE.md) explains the original 16ms clock quantization and why these ratios do not establish exact retail wall-clock rates. Scroll Rate uses seven project multipliers `[.25, .5, .75, 1, 1.5, 2, 3]` for keyboard and map-edge panning, without claiming calibrated retail pixels per second. Restart retains the selected game speed.

## Authored rules and conversion boundary

Each of the 23 existing unit/building definitions lives in `src/data/units/<id>.toml`. Vite reads the individual files; the definitions loader merges them before validating prerequisites, rejects duplicate IDs, and requires each filename to match its sole unit table. There is no combined runtime `units.toml` copy.

The roster now uses original costs, Strength, Sight, Power, Armor, foundations, primary Damage/Range/ROF, warhead Verses, and applicable Burst, ROT, turret capability, and miner Storage values. GI deployment uses the original Para secondary weapon. Footprints already matched the authored foundations and were preserved.

A simulation second currently represents **30 authored logic frames**. This gives:

- Construction: `cost / 1000 × BuildSpeed(.7) × 900 / 30` seconds. A 1000-credit item takes 21 simulation seconds; a GI takes 4.2; a power plant takes 16.8. Speed 2 doubles the accumulator rate, so those take half as much wall time.
- Weapon cadence: base `ROF / 30` seconds, plus the sourced 0–2-frame completed-burst jitter. Ground burst projectiles use the sourced 3–5-frame interburst delay. M60 base ROF is 20, Para 15, Grizzly 60, and Rhino 65 logic frames. Infantry additionally waits for its authored firing tick after starting the action. Using a 30Hz fixed step avoids rounding these repeatedly to the former 20Hz step; see the [combat timing audit](NATIVE_ANIMATION_REFERENCE.md).
- Armor: the primary/secondary weapon's original eleven-entry Verses table replaces the former generic infantry/vehicle multiplier.
- Ore capacity: `Storage × Riparius.Value(25)` credits, giving 500 for Chrono Miner and 1000 for War Miner.
- Repairs: eight HP per `.016 × 900 / 30 = .48` simulation seconds, at 15% of the original cost for a complete repair. Low-power production uses the authored .5–.8 bounds and clamps the power-supply ratio within them; the exact retail deficit formula is not verified.

The 900-frame authored minute and chosen 30-frame runtime baseline are stated conversion assumptions. No unmodified RA2 executable was run to measure wall-clock production or locomotion. Ground movement now uses the supplied executable's exact integer `Speed` conversion, `min(255, floor(Speed * 256 / 100))` leptons per game frame, then the same 30-frame reference clock and 256 leptons per cell. The [binary provenance, disassembly, values and limits](NATIVE_SPEED_REFERENCE.md) are recorded separately. This fixes inconsistent GI/vehicle/miner base-rate guesses; terrain modifiers, harvest digging/docking timing, projectile flight, curved vehicle trajectories, air locomotion, and Chrono Miner teleportation remain reconstruction differences. Raw-data matching does not validate those behaviors.

## Progressive construction spending

Starting an item enqueues it without charging the entire cost. Each simulation step buys its completed fraction using currently available credits. Cash shortages hold production at the paid progress and resume automatically when income arrives. The queue reports `spent` and `blockedFunds` to the UI. Canceling refunds only the amount actually paid; unstarted queued items refund zero. Portrait cancellation addresses its exact build item ID, so canceling a paused active item cannot discard a different later item. The mobile Cancel-last action retains its explicit last-item behavior. All active categories share one nonnegative credit balance. Paid, ready structures retain their completed state until placement or cancellation.

This removes the former up-front charge and follows the continuous credit drain observed in the contiguous retail gameplay review. The exact retail ordering of credit allocation between simultaneously active categories remains unverified.

## Movement and frame pacing

The input clock stays separate from the simulation clock. Main no longer truncates visible elapsed frames at 100ms. It skips hidden-tab simulation and resets the clock on a visibility change; Game additionally caps an extreme input delta at 250ms. Pausing does not change simulation time.

A concrete locomotion defect was fixed: reaching a path-cell center used to discard the remaining travel distance for that frame. That caused a brake/acceleration pulse at every cell boundary. The remaining time now advances along the next path segment in the same fixed step, with collision checks retained.

Vehicle hulls now turn at their authored ROT instead of snapping to a new movement/target direction. Turret heading is separate; stationary vehicles can aim and fire without rotating the hull. An ROT5 quarter-turn uses 12 logic frames under the documented integer step formula. This numeric duration is a test of the chosen model, not a calibrated measurement from a video with unknown game speed. The continuous retail footage qualitatively shows finite hull turns and independent gun orientation. In the reviewed retail Soviet Mission 2 clip (Dailymotion `x8vlwj6`, 01:45.800–01:46.783), a fresh movement order keeps the tank’s screen anchor stationary while its hull turns, then it translates. Fresh stationary vehicle orders now do the same: tests record zero displacement during the 12-frame quarter-turn or 25-frame half-turn, then full-speed movement on the next frame. Existing moving route bends continue traveling while the hull turns. These are separate behaviors; they do not prove identical curved trajectories. Ore collection no longer rotates the miner's entire body for each collected batch.

A repeatable vehicle traffic defect also surfaced after the turn correction: vehicles repeatedly sidestepped and then returned to the same occupied path point. Vehicles now commit to a clear short detour and recalculate the route onward, preserving terrain corners and unit spacing. Failed detour searches retry at most twice per simulation second, avoiding per-frame path searches in crowds. Final original-art browser QA exposed another bounded case: after stopping against traffic, a tank chose a reversal and traveled almost one cell before its hull finished turning. A new collision reroute now reuses the stationary turn-before-departure phase; ordinary moving bends retain continuous travel. The observed six-unit regression fails on the previous implementation and passes with the fix. The original 180-second AI attack requirement and repeated shared-miner deposit checks also pass. Infantry keeps its prior collision behavior. These are tested reconstruction fixes, not claims of the original locomotor algorithm or calibrated native collision envelopes.

`Game.interpolation` exposes the fraction toward the next fixed step. Entities retain their previous position and facing from the beginning of the last simulated step, initialized at spawn and recreated on restart. Renderers can interpolate those samples without changing simulation coordinates, fog, or command targets. The samples and fraction freeze during pause. The follow camera uses the same interpolated presentation point, after the simulation step, to avoid jitter between the camera and the followed unit. Renderer integration and actual-browser results are tracked by the renderer owner; the simulation contract alone is not proof of smooth presentation.

## Verification

`RA2_ASSET_DIR=/tmp/ra2-assets npm test -- tests/gameplay-parity.test.ts tests/desktop-controls.test.ts tests/mobile-controls.test.ts tests/simulation.test.ts tests/facing.test.ts tests/production-spending.test.ts tests/combat-animation.test.ts`

The current 4205 integrated build passed **240 tests** and one optional diagnostic skip, including the combat event, interruption and keyboard reassignment checks. The previous committed checkpoint passed 210 tests. The shared 25-frame gate and stopped-reroute correction remain landed. The new observed-case regression was also confirmed to fail against the previous implementation. Coverage includes:

- All 23 definitions checked against original Strength/Cost/Sight/Power/Armor/foundation/weapon/Verses and converted build/attack times.
- Cross-file prerequisites, file/table matching, and duplicate rejection.
- Left/right click semantics, Shift toggles, modifier ordering, selected-GI deployment, right drag, pointer cancellation, native tabs/modes/contextual cursors/radar commands, type/team/bookmark commands, waypoints, selection history, health groups, input/dialog/source gating, restart state, and mobile gestures.
- Real simulation effects of GI deployment, force fire/crushing, fractional-coordinate escort, scatter, guard versus stop, and waypoint execution/cancellation. The new combat checks exercise GI/Conscript/Rocketeer firing intent, exact Conscript tick 6, deployment transitions and interruptions, separate IFV burst damage, authored vehicle death selection, and speed-normalized impact lifetimes.
- Core-key collision replacement, explicit unbound state, Reset All, safe persistence, remapped held planning, reserved keys and modal suppression.
- Progressive spending, spent-only refunds, exact active-item cancellation in mixed-type queues, cash shortage/resumption, simultaneous queues, and paid ready structures.
- ROT quarter-turn duration, shortest wrap through zero, mid-turn retargeting, independent turret aim, and stationary miner hulls while digging, fresh-order quarter/half turns with zero translation, continuous route bends, and opposing vehicles finishing without overlap.
- Exact state equality for 3 seconds at 5, 10, 30, 60, and 144 rendered frames/second; equal fixed-step results at .5×, 1×, and 2× speed; paused/extreme/invalid delta handling.
- Authored Grizzly ROF with 60–62-frame reload spacing; interpolation fractions during fractional and catch-up frames; constant per-frame travel across straight path-cell boundaries.

Actual native browser input confirms cached startup, keyboard selection, quarter/half turn-before-translation, and Options suppression; see [native gameplay observations](../tests/NATIVE_GAMEPLAY_VERIFICATION.md). The [final movement replay](../tests/FINAL_MOVEMENT_VERIFICATION.md) additionally covers current authored speeds, a native Stop, moving bends, crowded detours, blocked infantry, and settled arrivals, including the before/after stopped-reroute defect. The [4205 combat browser capture](../tests/NATIVE_COMBAT_VERIFICATION.md) adds native deployment input, actual infantry firing poses, IFV burst events and ordinary vehicle death artwork. Historical slow-render measurements and sparse software-rendered captures do not establish current hardware fluidity or complete visual parity. Existing startup, asset, terrain, and rendering suites are owned and run by the integration agents.

An optional movement diagnostic is reproducible with `RA2_MOVEMENT_DIAGNOSTICS=1 npm test -- tests/movement-diagnostics.test.ts`. The preserved before-change trace is `tests/artifacts/gameplay/movement-before.json`; it records complete per-frame position/facing/path samples for opposing infantry traffic. That scenario resolves without overlap, so it does not by itself justify replacing the collision-avoidance algorithm.
