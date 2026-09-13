# Final movement browser verification — 2026-09-13

This pass uses original game artwork in an isolated Chromium context, viewport 1280×800 at DPR 1, CPU throttling 1×. The selected-originals fixture is visual-test setup, not a download/cache E2E test. All installer fetch attempts were blocked and remained zero. Native Continue started the application; the original animation loop advanced every recorded step. Temporary observers forwarded the original step and render methods without manually stepping the game.

The controlled arena is explicitly staged through browser-only state: AI disabled, clear grass/empty ore, two distant construction yards retained, and test units placed at documented coordinates. Scenario movement orders use public Game commands except the fresh mouse order and native `S` stop below. Pausing at the capture limit preserves the final state. Screenshot capture and software rendering make presentation samples unsuitable for retail wall-time or performance calibration.

## 4199 observations

Bundle `index-BMccL90Q.js`, SHA-256 `3e1764ee9b94faeb0f7bb93d55db26896af932aa4b4483eedc0eca4cf6afb6cf`, uses authored ground speeds and the 25-frame action-line timer. The [complete step and presentation trace](artifacts/gameplay/final-4199-movement.json) preserves scenario staging and command provenance. Grizzly speed is 1.9921875 cells per project simulation second; the 30-frame reference clock is not a measured retail game-speed setting.

| Scenario | Observed result |
| --- | --- |
| Fresh native mouse order | Grizzly `(20.5,35.5)`, heading 0°, receives a native canvas click at `(20.5,39.5)`. Frames 1–12 rotate without translation; frame 13 moves 0.06640625 cells along the aligned 90° hull. It reaches its destination and enters Guard at frame 74. |
| Already-moving bend | Public move from `(20.5,34.5)` to `(26.5,38.5)` follows alternating straight/diagonal path segments. No stopped frames occur between first movement and arrival; Guard begins at frame 117. The greatest instantaneous hull/displacement mismatch is 35.07° at a bend. That transient does not establish identical native curvature. |
| Crowded opposing traffic | Two tanks travel in opposite directions around a stopped tank while three GIs cross. All five movers reach open destination/formation cells and enter Guard by frame 248 (8.267 project simulation seconds). They remain settled through frame 600. Minimum unit-center separation is 0.480189 cells; the existing collision envelope is not a calibrated native envelope, and projected tank artwork can occlude at close spacing. |
| Explicit native Stop | Native `S` stops a selected moving tank at `(32.25390625,35.5)`, frame 177. Position remains exactly unchanged through 90 further automatic logic frames; its order is Guard and path is empty. |

The crowd trace exposed a stopped-reroute defect. Tank 22 remains at `(22.78125,37.5)` during frames 83–86, then a new detour points toward `(22.78125,36.5)`. It starts translating at frame 87 while the hull is still nearly opposite the travel direction (172.8° difference), covering almost one cell before that turn finishes. Adjacent rendered poses were captured at slowed observation speed 0.25×, preserving the same fixed-step sequence: [frame 83](artifacts/gameplay/4199-detour-83.png), [87](artifacts/gameplay/4199-detour-87.png), [92](artifacts/gameplay/4199-detour-92.png), [98](artifacts/gameplay/4199-detour-98.png).

The resulting bounded fix makes a new collision route reuse the existing stationary turn-before-departure phase. It does not change the continuous behavior of ordinary moving bends or introduce a general prohibition on reverse motion. All 49 existing affected checks passed, including the original 180-second AI attack requirement. The new six-unit observed-case regression passes on the fix and fails on the old implementation's sideways departure after five blocked frames.

## Final replay

The same six-unit scenario was replayed on `http://omarky:4203/`, bundle `index--DDHi-ak.js`, SHA-256 `6e21c8ace8f9456e52b00edd104bbfd6b2b012ab3953903edf006ecc4635486c`. This build includes the stopped-reroute correction and final credit-display normalization. Native Enter started its isolated cached 242-original context with zero installer attempts. The integration owner's full suite passed **210 tests**, with one optional diagnostic skipped, and the production build passed.

The [after trace](artifacts/gameplay/final-4203-movement.json) records 600 automatic logic frames. All five movers reached open destination cells and entered Guard by frame **257**, or 8.567 project simulation seconds, remaining settled through frame 600. Minimum center separation was **0.4800866 cells**. All seven tank departures following at least five stationary frames were aligned with the hull: the largest angular difference was **0.00183°**, within the model's integer direction precision. The previous reversal now waits through 29 stationary frames before departing at frame 133 along the aligned hull. This is an observed simulation count, not a new asserted retail timer.

The original-art [turning crowd at frame 122](artifacts/gameplay/4203-crowd-122.png) and [settled arrivals at frame 600](artifacts/gameplay/4203-crowd-600.png) complement the per-step trace. No prolonged stall or repeated oscillation remained in this bounded case. Observers were restored afterward and the isolated page was left paused. No physics, source files, or game clock were modified by the replay.

## Comparison limits

The [contiguous retail review](../docs/VIDEO_PARITY_REVIEW.md) supports fresh stationary turns, intermediate hull poses while traveling through bends, and local waiting in crowds. Its game-speed setting, exact turn radius, collision envelope, and reversing rules are unknown. These browser checks verify bounded behavior and expose concrete defects; they do not certify the full original locomotor, absolute retail timing, or hardware UI fluidity.
