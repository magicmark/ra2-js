> **Historical build evidence:** This report covers an earlier 126-asset build with upfront production charges, A-for-attack/P-for-pause bindings, and the previous interface. It is preserved as a record of that build, not current retail parity proof. See [current gameplay evidence](../docs/GAMEPLAY_PARITY.md) and [current native browser observations](NATIVE_GAMEPLAY_VERIFICATION.md) for the revised controls, progressive spending, strict original assets, and movement results.

# Mobile verification

Verified on 2026-09-13 against the running Vite application in Chromium. These checks used `/?asset_url=/intentionally-missing` to keep UI testing independent of the large original-art archive download. Original archive parsing/rendering is covered separately by the asset verification.

## Activation and layouts

| Check | Evidence |
| --- | --- |
| User-agent detection | iPhone user agent, no `force_mobile` parameter: `Controls.mobile === true`, touch toolbar displayed. |
| Forced desktop controls | Linux desktop user agent, `navigator.maxTouchPoints === 0`, 1440 × 1000 viewport, `?force_mobile=1`: mobile controls active; battlefield uses full width. |
| Portrait | 390 × 844: battlefield 390 × 712 below a 56px header and above 76px controls; drawer opens, scrolls, and closes. |
| Narrow portrait | 320 × 740: body width 320px; header buttons end at x=313.5px; no horizontal overflow. |
| Landscape | 844 × 390: three-column production drawer and scrollable settings fit without horizontal overflow; settings close button stays visible when scrolling. |
| Hidden drawer | Closed drawer has `visibility: hidden`, excluding offscreen production controls from keyboard focus and accessibility navigation. |

The [contact sheet](artifacts/mobile-contact-sheet.png) combines portrait battlefield, portrait production, landscape production, and landscape settings. Screenshots were combined before image inspection.

## Live browser interactions

Touch pointer sequences ran through the application's real canvas event listeners, Controls, Camera, and Game. Only `setPointerCapture` was temporarily stubbed for synthetic pointerdown events because Chromium cannot capture a synthetic pointer. Each override was restored immediately afterward.

- Tapping a friendly GI selected it; dragging a selection rectangle selected four friendly GIs.
- Tapping terrain produced a six-waypoint move path. Stop changed the order to `guard` and cleared the path.
- Attack mode plus a terrain tap sent `attackMove=true`, created a path, and returned to Select mode.
- Pan mode moved camera coordinates by −66.67 / −33.33 for a 50 / 25px drag at 75% zoom, preserving the selected unit's order.
- Asymmetric pinch increased zoom from 1 to 1.216552506; the world point under the finger midpoint drifted by less than 0.000000000000006 tiles. Two-finger translation then had zero measured world-point drift and preserved zoom.
- Build opened the drawer. Power Plant deducted 800 credits; advancing the real simulation completed production. Tapping its ready card entered placement and closed the drawer. Occupied ground was rejected; valid ground placed one building and emptied the queue.
- Tapping Select canceled placement while retaining the ready structure. Pan mode preserves placement so the player can reposition the camera.
- A native browser-tool canvas click selected the centered GI and focused the canvas using real pointer capture. Chromium reported this tool-generated event as a **mouse** pointer, even with mobile emulation.
- A later native-click audit exposed production controls being replaced every 100ms. Queue rendering now preserves the actual pause/cancel buttons while updating progress, labels, and queue details. On the landscape touch layout, native Resume advanced Power Plant progress from 0.4167 to 0.5833 over two simulation seconds; native Pause held it through two more seconds. Both buttons retained DOM identity and focus through 50 UI updates, another queued item, and pause/resume. Native Cancel refunded the last queued Barracks (500), then the Power Plant (800), returning to the idle panel. The render loop kept updating the UI; simulation time was manually advanced through the real `Game.tick` to make timing reproducible.

## Settings and integration contracts

- Sound switch changed off/on; pause changed simulation state; speed selection set simulation speed to 2.
- A UI retry forwarded the exact configured HTTPS URL to `AssetManager.initialize`; progress 5/10 displayed 50%.
- A multi-file input change forwarded both `ra2.mix` and `language.mix` to `AssetManager.importFiles`, then cleared the file input. Asset entrypoints were temporarily intercepted for this contract check; these fixture bytes were not claimed to be valid game files.
- `javascript:` sources were rejected. The supported relative `/asset-source` path passed input validity after changing the source field to `type="text" inputmode="url"`.
- Escape from the focused source field closed settings, restored focus, and did not propagate to battlefield controls.

## Automated regression checks

Run `npx vitest run tests/mobile-controls.test.ts`: **7 tests passed**. The tests dispatch pointer events through EventTargets with the real Camera and Game. They cover mobile/forced/tablet detection, asymmetric pinch anchoring, two-finger translation, gesture end/cancellation without orders or placement, and lossless touch cancellation of a completed structure.

The asymmetric-pinch test failed before the fix. Zoom now anchors at the previous finger midpoint before applying midpoint translation. This preserves the terrain point under the gesture when scale and centroid change together.

Physical iOS/Android hardware and native multitouch dispatch were unavailable in this environment. The evidence is Chromium viewport/user-agent emulation, live synthetic touch pointer sequences, a native mouse-pointer smoke check, and automated gesture invariants; it is not a claim of physical-device testing.
