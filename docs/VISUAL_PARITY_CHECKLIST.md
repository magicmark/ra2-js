# Visual parity review — 2026-09-14

This checklist tracks the requested screenshot spot checks and follow-up work. “Implemented” and “verified” are separate: a source edit is not visual evidence. Local browser sprite comparisons use contact sheets of exactly eight captures.

| Requested correction | Implementation | Verification |
| --- | --- | --- |
| Search “Red alert 2 screenshots” and inspect original references | Exact query searched; original coastal/base screenshots inspected | References below; modded and pre-release search results excluded |
| Dry/desert maps must use appropriate scenery instead of tundra assets | Arid maps use original GREEN01 sand and TREE20–23 palms; removed inappropriate grass/rough bands | Original terrain and palm eight-panel sheets inspected; both arid maps pass biome/topology tests. No snow-file leak was found; the mismatch was biome selection |
| Water boundaries use matching shoreline tiles | Complete original shoreline pieces share matching corner samples; clearings preserve the complete pieces | Shoreline endpoint and 2×2-piece checks pass across all eight authored maps; original TMP/rules acceptance passes |
| Different grass styles transition smoothly | Correct native LAT neighbor bits, material-side transitions and clear strips between incompatible materials; default battlefield shares map topology | Directional LAT tests, original archive lookup and full topology checks pass |
| Vehicles, especially miners, turn before translating | Hull turn gate covers automatic mining paths and route bends; collinear movement continues | Movement/round-trip tests pass; measured 50 stationary turn frames explain the 1.667-second trip difference |
| Ore miners animate while harvesting | Original OREGATH.SHP, eight directions × 15 frames, ANIM.PAL | Eight-direction browser contact and 120-frame real-asset test pass |
| Ore cargo display uses actual assets | Original PIPS2.SHP frames 0/2 with PALETTE.PAL | Eight-panel cargo/veterancy contact inspected; exact original pixels pass |
| Promotion badge uses the original executable-selected art | Original RA2 PIPS.SHP frames 13/14 | Infantry/vehicle veteran/elite contact and exact original pixels pass |
| Remove dotted fog boundary | Shroud feather and opaque cells composed into cached native-pixel surfaces before zooming | 33 fractional zoom terrain cases and 128 shroud-boundary cases passed, zero holes/leaks/dark explored cores |
| Thick fog must not return to explored ground | Removed returning terrain, ore, scenery and radar dimming; current sight still controls enemy visibility | Renderer/radar regressions and real-WebGL explored-core checks pass; live drill contact preserves brightness outside current sight |
| Building placement shows cell footprint without ghost building | Opaque original-style green cells, with only blocked cells red; ghost sprite removed | Original campaign reference and live valid/mixed-invalid eight-panel comparison inspected |
| Sidebar categories do not wiggle on hover | Removed background transition and kept original background registration | Real pointer hover preserves centered registration, no transform or transition; final UI contact inspected |
| Locked/unbuildable cameos do not brighten on hover | Locked filter remains unchanged on hover | Real pointer hover retains grayscale(0.5) brightness(0.4); final UI contact inspected |
| Build-cost hover tooltip | Names and costs supplied to yellow original-font tooltip on black | Original campaign reference and real native/fallback-font two-line cost tooltips inspected in final UI contact |
| Building health indicator matches original | Original PIPS.SHP health frames 0/1/2/4 run diagonally along the native-height roof edge | Original campaign reference and live healthy/yellow/red eight-panel contact inspected; renderer regressions pass |
| Hovering a building must not show a yellow box outline | Selection brackets are restricted to selected buildings; hover shows health only | Live eight-panel contact includes friendly/enemy hover with no selection outline, plus unselected/selected controls |
| Oil derrick flag animates | Original CAOILD_F and CAOILD_A loops | Original 3/4-tick frame intervals verified; eight-panel flag/capture contact inspected |
| Engineers capture enemy buildings | Footprint visibility and reachable edge entry fixed; friendly repair supported | Simulation, battlefield/radar click routing and native cursor checks pass |
| Local admin overlay: game speed, instant build, free everything, place enemy units | Development-only panel and guarded simulation controls; selectable enemy type is placed by clicking an open cell | Browser controls verified 2×/0.4× speed, instant free queued production, repair at zero credits, enemy placement without friendly orders, Escape cancellation; final UI contact inspected and production strings absent |
| Ore drills centered on fields regenerate nearby depleted ore | Original TIBTRE01 at field centers; occasional completed cycle replenishes an eligible adjacent cell | Original art and field-center tests pass; healthy/depleted, occupancy, spread, saturation and pause cases pass |
| Ore drill must be solid and work only near depletion | Original theater unit palette keeps foreground opaque; fields above 25% of starting nearby ore stay idle | All 11 original foreground frames pass opacity/palette checks; live healthy/depleted/visibility eight-panel contact inspected |
| Selling a building animates | Reverse original MK buildup for 54 logical ticks; refund once, disable operation, retain footprint until removal | Original reverse-sale eight-panel contact, all 14 building assets and lifecycle/control regressions pass |
| Unselected infantry plays original idle actions | Original Idle1/Idle2 metadata, native timing and independent per-unit schedule; selection and active orders interrupt | Focused animation/state/timing tests pass; eight-panel GI/Conscript/Engineer/DOG reference inspected. DOG remains a reference, outside the current playable roster |
| Previously saved artwork still starts without reimport | Optional enhancement fallback plus local archive recovery and bounded retries | Mocked 126-file no-font/no-archive loader fixture passes; separate real full-roster browser cache with 723 files runs without font/cursor or archive requests. Neither is claimed to be the user's unknown exact historical file set |
| Commit, push, green CI and Cloudflare deployment | Pending after integrated validation | Branch/commit/CI/deployment evidence required |

## Original references inspected

- [Exact-query screenshot gallery](https://www.mobygames.com/game/2544/command-conquer-red-alert-2/screenshots/): discovery/reference index; the search result was readable but the gallery itself returned HTTP 403. It is not counted as a directly inspected image.
- [Original 2001 coastal screenshot](https://multiplayer.net-cdn.it/thumbs/images/2001/04/30/17330.command--conquer-red-alert-2.bvegi_jpg_800x0_crop_upscale_q85.jpg), from [the game gallery](https://multiplayer.it/giochi/command-conquer-red-alert-2-per-pc.html): sandy ground with palms, continuous shallow-water shore, soft black shroud boundary and compact original sidebar. This directly supports the dry-map scenery and shoreline spot checks.
- [Original White House screenshot](https://media.moddb.com/images/games/1/1/44/screen16.jpg), from [the original game screenshot page](https://www.moddb.com/games/cc-red-alert-2/images/screenshot2): coherent grass, roads, shadows and compact unit feedback. No modified unit/building UI was used as the target.
- [The C&C Strategist, original Soviet mission 2](https://www.dailymotion.com/video/x8vlwj6): original campaign video. Inspected local full-motion segment 02:10–02:50; includes placement footprint, build-cost hover tooltip and diagonal building health pips. The [eight-panel reference sheet](../tests/artifacts/parity-2026-09-14/original-placement-tooltip-health-eight.png) records 02:27, 02:27.25, 02:27.5, 02:27.75, 02:28, 02:37.5, 02:42.5 and 02:43. Video rendering scale and native speed are not used to infer exact timing.

The original archive/executable independently identifies `OREGATH.SHP`, `PIPS.SHP`, and `PIPS2.SHP`; asset frame identifiers come from that data, not hand-drawn approximations. The local executable is the supplied modified base RA2 build, already qualified in earlier project reference documents.

## Reproduction and current evidence

- `npm run dev -- --host 0.0.0.0`; `vite.config.ts` permits `omarky`. Shared validation URL: `http://omarky:5173/`.
- On a new browser profile, “Import game files” accepts the local `ra2.mix` and `language.mix` pair. Validation imported the actual files under `/tmp/ra2-assets/`; no remote installer download was needed. Saved originals then restore at the same origin. Press cached Continue to enter gameplay.
- `window.__rts` exposes live simulation, renderer, controls, assets and UI. Script-staged QA states are explicitly distinguished from normal user input.
- Existing executable browser harness `tests/tile-seams.html` tested 33 zoom/camera cases plus 128 map-boundary cases after the fog changes. The same run checked source refresh, map reset, hidden coverage and texture allocation reuse.
- [Fog regression measurements](../tests/artifacts/parity-2026-09-14/fog-regression.json): all 33 fractional terrain cases and 128 shroud-boundary cases passed, with no holes, hidden-area leaks or dark explored cores.
- [Live health, hover and placement eight-panel sheet](../tests/artifacts/parity-2026-09-14/health-placement-eight.png) and [live drill state eight-panel sheet](../tests/artifacts/parity-2026-09-14/drill-states-eight.png) are script-staged states in the actual browser renderer; simulation tests separately cover lifecycle behavior.
- [Legacy cache seed](../tests/artifacts/parity-2026-09-14/legacy-cache-seed.json) removes 25 optional files from a real 748-file full-roster selection. The resulting [723-file browser run](../tests/artifacts/parity-2026-09-14/legacy-cache-running.json) reaches gameplay and advances simulation without a font, cursor, archive request or diagnostic error. This is separate from the mocked 126-file regression fixture described in the unit evidence.
- [Live sidebar, local admin and legacy-cache eight-panel contact](../tests/artifacts/parity-2026-09-14/sidebar-admin-legacy-eight.png) and [terrain/fog eight-panel contact](../tests/artifacts/parity-2026-09-14/terrain-fog-eight.png) were inspected after integration. The last two terrain panels have identical brightness before/after current sight leaves explored shore.
- Browser admin measurements: [production/repair/speed](../tests/artifacts/parity-2026-09-14/admin-live.json), [enemy placement and order isolation](../tests/artifacts/parity-2026-09-14/admin-enemy.json), [Escape cancellation](../tests/artifacts/parity-2026-09-14/admin-cancel.json), [category hover](../tests/artifacts/parity-2026-09-14/tab-hover.json) and [locked hover](../tests/artifacts/parity-2026-09-14/locked-hover.json). Defaults were restored to 1×, instant off, free off after testing.
- Integrated `RA2_ASSET_DIR=/tmp/ra2-assets npm test -- --maxWorkers=2` completed at **2026-09-14 07:20:25 UTC**: **344 passed, 2 skipped; 43 test files passed, 1 skipped**. The skips are the opt-in movement diagnostic and the independently supplied reference-map fixture. `npm run build` passed (86 modules); production `dist` contains none of the local admin control strings. CRLF-aware whitespace validation passed. Publication evidence is recorded separately after the resulting commit deploys.

Detailed unit asset provenance, executable addresses, turn-trip measurements and four eight-panel sheets: [Unit parity evidence](UNIT_PARITY_EVIDENCE.md).

Terrain topology, original biome selection, all-frame drill opacity, depletion rules, reverse-sale art and focused checks: [Terrain and sale verification](TERRAIN_AND_SALE_VERIFICATION.md).

Exact optional visuals require their original source art. Older playable artwork caches remain usable while unavailable optional indicators/effects/scenery are omitted; a missing MK retains the standing building during the sale timer. Saved local archives can fill those gaps without downloading. The 126-file compatibility fixture covers the default battlefield; newly requested catalog maps still need their pre-existing core theater/map artwork. No claim is made that this work reconstructs unknown missing original files.

## Session scope audit

Both the release reviewer and an independent teammate read all ten user entries in session `01a09e94-78c9-7ba2-b2da-7c8dd90832bf`: one environment entry and nine substantive requests. The table summarizes scope without reproducing the transcript. Times are UTC on 2026-09-14.

| User entry | Requested scope | Coverage |
| --- | --- | --- |
| 06:30:08.282 | Bind dev server to 0.0.0.0 and permit omarky | Shared Vite server and allowed-host configuration |
| 06:30:08.385 | Teammates, online screenshot search, checklist, eight-panel contacts; terrain, turning, mining, cargo, promotion and fog corrections | Delegated implementation/review; first eleven correction rows and linked evidence |
| 06:37:47.487 | Placement/cost references, derrick flag, engineers, sidebar hover, local admin, ore regeneration; commit/push/Cloudflare | All implementation and browser checks completed above; publication proof follows the resulting commit |
| 06:38:22.828 | Animate building sales | Reverse original buildup and retained-footprint sale lifecycle |
| 06:39:39.239 | Original building health appearance | Original diagonal health pips and reference/runtime contact |
| 06:51:34.171 | Existing 126-file cache blocked by missing game.fnt | Optional-art compatibility, preserved files and qualified fixture/full-roster browser checks |
| 06:53:08.049 | Remove yellow building-hover outline | Selected-only brackets; friendly/enemy hover contact |
| 06:53:43.184 | Opaque drill; animate only near depletion | Unit palette and ≤25% gate, including cancellation on replenishment |
| 06:59:26.505 | Original unselected infantry idle animations | Original sequence frames/timing, deterministic schedules and selected/action interruption; DOG reference inspected |
| 07:04:07.320 | Audit every message, then commit/push with green CI | This independent trace and release reviewer audit completed; commit/push/CI/Cloudflare proof still required |
