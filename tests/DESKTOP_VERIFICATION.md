> **Historical build evidence:** This report covers an earlier 126-asset build with upfront production charges, A-for-attack/P-for-pause bindings, and the previous interface. It is preserved as a record of that build, not current retail parity proof. See [current gameplay evidence](../docs/GAMEPLAY_PARITY.md) and [current native browser observations](NATIVE_GAMEPLAY_VERIFICATION.md) for the revised controls, progressive spending, strict original assets, and movement results.

# Desktop browser verification

Verified on 2026-09-13 in a dedicated Chromium context at 1440 × 1000. The battlefield canvas was 1144 × 904. Checks used real Chrome DevTools click, drag, and keyboard input; recorded `pointerdown.isTrusted` was `true` for all twelve battlefield interactions in the main sequence and all six production interactions in the final queue regression.

The main sequence used an isolated production snapshot served on `http://omarky:5193` from `/tmp/ra2-desktop-verification-dist` (bundle `index-CGDiqIS0.js`). The queue fix was then verified against the final snapshot at `http://omarky:5194`, `/tmp/ra2-desktop-verification-final` (bundle `index-ByJImREJ.js`, worker `extract.worker-C6NvH0UW.js`). Both servers bound to `0.0.0.0` with `omarky` allowed. A same-origin copy of the supplied original installer was selected using `?asset_url=/original-assets.exe`; final extraction completed with **126 files**. The default Archive.org download path is verified separately in the asset audit.

A browser-only timing harness suppressed automatic `game.tick` calls and invoked the original tick in 0.1-second steps between interactions. Camera centering positioned targets under the native canvas click. No selection, movement, production, placement, repair, or sell API was invoked directly for the interactions below. The repair check assigned damaged health as its fixture; the ownership check revealed enemy fog as its fixture. Other simulation behavior used normal game state.

| Interaction | Observed result |
| --- | --- |
| Native canvas selection | Selected the friendly Grizzly, entity 6. |
| Native terrain movement | Produced a three-waypoint path from `(19.5, 41.5)` to `(22.5, 39.5)`; after 3 simulated seconds it reached the destination, cleared its path, and guarded. |
| Native box selection | Dragging from the canvas into the lower-right area selected the Grizzly and four G.I.s, IDs 6–10; the selection box cleared on release. |
| Production and focused shortcuts | Clicking Power Plant deducted 800 credits and queued it. Native `A` while the card retained focus switched to attack mode; Escape restored selection mode. |
| Building readiness | After 13 seconds the paid Power Plant had `progress=1`, `ready=true`; native ready-card click entered placement. |
| Blocked placement | Native click on the Construction Yard footprint showed “Cannot place here,” retained the ready queue entry, and created no building. |
| Valid placement | Native click at `(17.5, 36.5)` placed the plant at `(17, 36)`, consumed the queue, cleared placement, and increased power from 200 to 400. |
| Barracks rally | Native selection of the Barracks followed by a terrain click set rally `(24.5, 45.5)`. |
| Infantry production and orders | Native G.I. cards trained two additional infantry in free cells; new units followed the rally. Native selection of trained entity 44 and a terrain click moved it to `(25.5, 46.5)`, where it guarded. |
| Repair | Native Repair on a selected plant with 375/750 HP restored it to 468.75 HP after 5 seconds and charged exactly 50 credits, from 6900 to 6850. |
| Sell | Native Sell removed that plant, reduced power from 400 to 200, and credited 250, resulting in 7100 credits. |
| Enemy ownership | A revealed enemy Construction Yard was pickable by the renderer but native clicking selected nothing. A subsequent terrain click left every enemy position and order unchanged. |
| Zoom and keyboard focus | Native Zoom In followed by native `+` reached 132% zoom with focus still on the UI button. |
| Final native queue pause | Two G.I.s charged 400 credits. After 2 seconds the first was at 40%; native Pause held it at 40% through 3 more seconds. The exact button nodes remained mounted. |
| Final native cancellation | Cancel removed only the queued second G.I., refunded 200 immediately (5600 → 5800), retained the paused first item, and preserved button identity. |
| Final native resume | Resume completed the remaining G.I.; the queue became empty and the player infantry count became five. |

Two browser-discovered defects were corrected:

- `Controls.key` no longer suppresses battlefield shortcuts merely because a production or camera button has focus. Inputs, content editing, and dialogs remain isolated; Space/Enter retain native button activation. Two regression tests cover both behaviors.
- `UI.renderQueue` preserves active queue controls instead of replacing their DOM every update. Before the fix, native clicks detached and failed. Native pause, resume, and cancellation all passed on the corrected production build.

The final targeted run passed **30 tests** across `desktop-controls`, `mobile-controls`, and `simulation`; `tsc --noEmit` passed. The separately coordinated full suite/build result is recorded in the project audit.

## Rendering evidence and environment limits

[Desktop contact sheet](artifacts/desktop-contact-sheet.jpg) combines the native selection, placement preview, 132% zoom, and final paused queue screenshots. Original building/unit/cameo artwork is visible. The first three views were taken before the final ore/tree artwork correction; the last view uses the final 126-file extraction.

A 60-frame runtime sample of normal rendering reported one WebGL draw call per frame and `gl.getError() === 0`. The remote browser identified its GPU as ANGLE Vulkan **SwiftShader**. Mean JavaScript render time was 26.4 ms, p95 47.5 ms, and median frame interval 118.6 ms in that software-rendered environment. This proves live rendering and batching, not hardware-accelerated frame-rate performance. There were no application console errors; Chromium emitted its software-WebGL fallback warning.

The native browser tool exposes left click and drag, so the native movement evidence exercises the supported click-to-command path. The right-button path is implemented in `Controls`; this report does not claim a physical right-button browser test. Touch-specific evidence is in `MOBILE_VERIFICATION.md`. No unresolved functional blocker was found in the desktop interactions above.
