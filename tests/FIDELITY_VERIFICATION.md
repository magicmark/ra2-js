# Original gameplay visual comparison

Authentic Red Alert 2 gameplay screenshots and sampled gameplay video were inspected before editing. The [reference research](../docs/ORIGINAL_GAMEPLAY_REFERENCE.md) records the sources and the limits of the video evidence. Original artwork alone was not treated as proof of a faithful layout: a second comparison corrected the sidebar's stacking order after user feedback.

## Sidebar and battlefield

At 1280 × 800 and native 100% zoom, the original loaded-asset baseline gave the battlefield 984 × 704 pixels. The revised battlefield is 1112 × 770 pixels, with a 30-pixel tactical command strip and a 168-pixel sidebar. Cameos use their original 60 × 48 pixels and baked labels.

The Allied sidebar uses sidec01.mix artwork and its sidebar palette. Its measured 800 × 600 composition matches the reference:

| Element | Vertical position |
| --- | --- |
| Credit inset | 0–16 |
| Original top control surround/buttons | 16–48 |
| Radar / inactive Allied eagle | 48–158 |
| Repair/sell surround and category tabs | 158–227 |
| Six rows of production cameos | 227–527 |
| Scroll surround | 527–553 |
| Visible lower metal panel | 553–600 |

The earlier noisy blue `tabs.shp` row was removed; `top.shp` belongs above the radar. The vehicle tab uses the original blank state until a factory exists. Gameplay no longer overlays asset-management or idle-queue text on the lower sidebar artwork.

## Browser method and frozen build

An isolated headless Chromium 151 was controlled through Chrome DevTools MCP using its remote debugging pipe. All gameplay screenshots are real browser WebGL output. Chromium uses ANGLE/SwiftShader software rendering; these checks do not establish hardware-accelerated frame-rate performance.

The visual/input verification used a compiled copy at `/tmp/ra2-fidelity-preview`, served on `http://omarky:5286` with `0.0.0.0` binding and `omarky` allowed. This prevented hot reloads from interrupting native input while another cooperating session changed startup behavior. The recorded 217-file visual snapshot used `index-NZzwYAi3.js`, `extract.worker-D1qBXRnc.js`, and `index-BOons0sh.css`. The normal user development server remained at `http://omarky:5173`.

The archive fixture was the real installer or its extracted `ra2.mix` and `language.mix`. Deterministic timing suppressed automatic simulation ticks and called the real game tick in 0.1-second steps. Camera centering positioned targets for native canvas clicks. Screenshot-only staging sometimes selected entities or set simulation time directly; it did not replace decoding or rendering.

## Native input results

| Check | Observed result |
| --- | --- |
| Production categories/cameos | Native category clicks showed original infantry and vehicle cameos and correct availability. |
| Queue pause/cancel/resume | Two native G.I. clicks charged 400 credits. At 40%, native Pause held progress through three simulated seconds. Cancel refunded 200 for the second item. Clicking the paused cameo resumed and produced one G.I.; five G.I.s were present afterward. Recorded pointer events were trusted. |
| Cameo context-menu action | Native keyboard context-menu input (`Shift+F10`) on a queued G.I. paused it; a second input cancelled it and refunded 200 credits. Both browser `contextmenu` events were trusted. This exercises the right-click handler through keyboard input. |
| Building ready/placement | A native Airforce Command click completed its queue, the ready cameo entered placement, and a native canvas click placed it at `(18,35)`. The queue cleared and the radar activated. |
| Radar power | The normal powered Airforce Command activated the isometric minimap. A browser-side zero-power fixture disabled it, and restoring power re-enabled it. |
| Factory/vehicle production | Native factory production and placement at `(9,32)` enabled the previously blank vehicle tab. Native Grizzly production created a second tank, entity 49. |
| Moving the new vehicle | Native canvas selection and terrain command gave the new Grizzly a three-waypoint path. It moved from `(11.5,35.5)` to `(8.5,38.5)` in six simulated seconds and returned to guard. |
| Selection bounds | Native tank and infantry selections displayed compact health indicators aligned to the painted sprite, without transparent-canvas offsets. |
| Mobile layout | Native Build opened the drawer at 390 × 844 and 844 × 390. Forced mobile at 1280 × 800 retained a 168-pixel drawer and a 58-pixel command bar. |

## Vehicles, animations, and terrain

Vehicle checks include original VPL material remapping, normal lighting, HVA transforms, original dark-blue team colors, individual voxel coverage, and trimmed sprite bounds. The live Grizzly and Chrono Miner were inspected at 1× and 2×, including the user's reported washed-out appearance. Decoder contact sheets are separate from the live WebGL scene captures.

The live tank was also captured at emulated device pixel ratios 1, 1.25, 2, and 3. The canvas retained `image-rendering: pixelated`; its 1112 × 770 CSS-pixel battlefield used backing buffers of 1112 × 770, 1390 × 963, 2224 × 1540, and 2224 × 1540 respectively. DPR 3 respects the renderer's DPR-2 buffer cap. Visually inspected DPR-1 and DPR-3 crops retained crisp painted pixels.

Barracks screenshots at simulation times 0 and 0.25 show different authored flag frames. After pausing at 0.25, thirty calls to the real game tick left both simulation time and the rendered building frame unchanged. The two-frame GIF is a sampled pair of actual WebGL screenshots, not the full authored animation loop.

The [terrain seam regression](TILE_SEAM_VERIFICATION.md) covers 198 real WebGL cases across zoom, camera positions, device pixel ratios, and constrained atlas/precision configurations. All 198 recorded cases had zero interior terrain holes. Full-scene fractional-zoom screenshots were also checked at 0.75, 0.9, 1.15, and 1.3. A subsequent full-scene review identified an outer-shroud edge leak; its final integration check is recorded below rather than being hidden by the interior-tile result.

## Cache and startup integration

A full 217-file extraction reached `ready` with an empty missing-artwork list. A completed cache reload made no installer request. The battle stayed at time zero during initial preparation.

An intermediate compatibility regression staged a synthetic version-5 cache of 130 real files, removing VPL, sidebar, foundations, and newer terrain. It remained playable and identified 15 missing-artwork categories. A native Update Artwork click bypassed an existing cache and fetched the actual 206,530,229-byte local installer, then replaced the saved artwork with the complete catalog. This historical check does not promise fallback behavior in the final startup flow: the cooperating startup task now requires valid original artwork, and its current entry/cache checks are documented in [startup verification](STARTUP_E2E.md).

## Evidence

- [Original loaded-asset baseline](artifacts/fidelity/before-original-1280x800.png)
- [Revised 1280 × 800 battlefield](artifacts/fidelity/after-1280x800.png)
- [Revised 800 × 600 battlefield/sidebar](artifacts/fidelity/after-800x600.png)
- [Grizzly before lighting correction](artifacts/fidelity/grizzly-before-lighting-2x.png), [corrected Grizzly](artifacts/fidelity/grizzly-corrected-2x.png), [corrected Chrono Miner](artifacts/fidelity/miner-corrected-2x.png)
- [Grizzly lighting comparison](artifacts/fidelity/grizzly-lighting-comparison.png), using the same live camera, unit facing and 2× game zoom with 4× nearest-neighbor crop enlargement
- [DPR-1 and DPR-3 canvas crops](artifacts/fidelity/canvas-dpr-comparison.png)
- [Flag frame at 0](artifacts/fidelity/flags-time000.png), [flag frame at 0.25](artifacts/fidelity/flags-time025.png), [sampled live animation](artifacts/fidelity/barracks-live-animation.gif)
- [Building decoder contact](artifacts/fidelity/buildings-bibs-shadows.png)

## Final integration

The real-archive suite passed 68 tests across nine files during the coordinated fidelity pass, and the TypeScript/Vite build passed. The final startup-only handoff and outer-shroud edge correction require one last shared-build browser check before this section is complete.
