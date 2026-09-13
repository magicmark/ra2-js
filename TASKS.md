# Red Alert Command implementation

Original scope: implement the archived prompt's milestones **1–7**. The user
subsequently requested retail UI, movement, game-speed, hotkey, and fluidity
parity, with repeated download/extraction caching as the immediate priority.
That parity work is active; campaigns, multiplayer, and a complete original-game
roster remain outside the agreed scope.

## Completion gates

Current follow-up status supersedes the earlier milestone audit below:

- [x] Explicit first-open source URL form; native Enter authorizes download, while opening only restores cache.
- [x] Real default remote download → extraction → committed cache → settled page → cached new page/hard reload, plus duplicate Enter and manual alternate-source recovery. [Actual startup evidence](tests/STARTUP_E2E.md).
- [x] Cached presentation stays behind the gate at battle time zero; explicit Continue starts play. Verified startup snapshot: 65 tests plus one optional skip, or all 66 with real archives.
- [x] Remove fallback artwork and every route into gameplay without usable original assets; actual221-file extraction, incomplete-cache gate, and cached Continue are verified in [ORIGINALS_ONLY_E2E.md](tests/ORIGINALS_ONLY_E2E.md).
- [x] Separate durable installer/MIX/selected-art caching into its own module. Real default download on live5173, hard reload, two new pages, and local MIX recovery after selected-art deletion passed; see [STAGED_CACHE_VERIFICATION.md](tests/STAGED_CACHE_VERIFICATION.md).
- [x] Fix rejection metadata that discarded usable saved archives after artwork or extractor runtime errors, including recovery of older records. Actual live-origin reload and full browser-process restart pass with no repeated download. Final cache checkpoint: **197 tests passed, one optional diagnostic skipped, production build passed**; see [CACHE_RECOVERY_VERIFICATION.md](tests/CACHE_RECOVERY_VERIFICATION.md).
- [x] Remove the Vite archive proxy. The editable default now uses Internet Archive's direct CORS endpoint; the old public/proxy keys retain the same saved assets. One complete direct browser transfer/extraction and subsequent cached reload/Continue passed. Existing `omarky:5173` and `localhost:5173` caches also continued with zero repeated work.
- [x] Split the existing roster into 23 individual unit/building TOML files with validated cross-file definitions.
- [x] Independently verify stationary tank turns, independent turret aim, native infantry health pips, bitmap credits, and original command identities against retail evidence; see [VIDEO_PARITY_REVIEW.md](docs/VIDEO_PARITY_REVIEW.md).
- [x] Correct all six command icons by the measured +1px X/−2px Y artwork offset. Native 800px captures preserve their hitboxes and 30px footer; see [footer measurements](tests/artifacts/native-ui/footer-registration.json).
- [x] Draw green move/red target lines with the sourced shared 25-logic-frame timer. Native input/canvas captures verify the lines and controlled original simulation ticks verify expiry while selection/orders persist.
- [x] Verify native progressive production, Hold/resume, funds recovery, Ready/category pulse, placement/cancellation, exact queued-item refunds and focus stability. Correct near-integer credit-display roundoff; see [native UI evidence](tests/NATIVE_UI_VERIFICATION.md).
- [x] Replay the corrected six-unit crowd for 600 automatic logic frames: all movers arrive, and all seven departures after a sustained stop align with the hull. Preserve the native Stop/fresh-turn/moving-bend evidence and stated collision/curvature limits in [FINAL_MOVEMENT_VERIFICATION.md](tests/FINAL_MOVEMENT_VERIFICATION.md).
- [ ] Finish remaining animation/Options differences and the broader retail-parity limits. Current acceptance criteria are in [PARITY_ACCEPTANCE.md](docs/PARITY_ACCEPTANCE.md).

Latest integrated gates: **210 tests passed, one optional diagnostic skipped,
production build passed**. [Checkpoint evidence](tests/FINAL_CHECKPOINT_VERIFICATION.md)
identifies the exact build and the remaining scope; historical counts below
belong to their original source snapshots.

The evidence below records historical milestone 1–7 behavior and build snapshots.
The current follow-up gates above supersede their earlier automatic-startup,
fallback-artwork, and cache descriptions. Broader parity remains open.

- [x] Milestone 1: asset loading, TypeScript/Vite/WebGL battlefield, and production sidebar.
- [x] Milestone 2: paid construction, prerequisites, placement, and unit production.
- [x] Milestone 3: unit pathfinding and player movement commands.
- [x] Milestone 4: automatic nearest-reachable-ore mining and refinery deposits.
- [x] Milestone 5: independent sides, economies, ownership, selection, and orders.
- [x] Milestone 6: enemy economy, construction, army production, attacks, and match outcome.
- [x] Milestone 7: zoom, camera movement, touch controls, user-agent detection, and `?force_mobile=1`.
- [x] Final production build, full tests including the real-archive integration fixture, and final original-art cache reload.
- [x] Setup, controls, asset configuration, deployment requirements, and verification limits documented accurately.

## Deferred user discussion

This is outside the completion requirements for milestones 1–7.

- [ ] Milestone 8: discuss additional scope with the user before implementation.

## Requirement-by-requirement evidence

| Prompt requirement | Implementation and authoritative verification |
| --- | --- |
| TypeScript + Vite + WebGL | [`src/main.ts`](src/main.ts), [`vite.config.ts`](vite.config.ts), and [`src/render/GL.ts`](src/render/GL.ts) run the game through a WebGL sprite atlas/batch. [Desktop verification](tests/DESKTOP_VERIFICATION.md) records live rendering, one draw call per sampled frame, and `gl.getError() === 0`. Final compilation/build is a separate gate below. |
| Download the supplied installer during initialization | [`AssetManager`](src/assets/AssetManager.ts) initializes from the configurable source automatically. [Asset verification](tests/ASSET_VERIFICATION.md) records the exact 206,530,229-byte installer, SHA-256, an empty-context automatic production download through `/asset-source`, and successful browser Worker/WASM extraction. The Windows executable is treated as an archive and is never run. |
| Read the original MIX assets | [`extract.worker.ts`](src/assets/extract.worker.ts) and [`formats.ts`](src/assets/formats.ts) handle nested encrypted MIX indexes, SHP/PAL/TMP/VXL/HVA data. [Asset verification](tests/ASSET_VERIFICATION.md) records 14 decoded archives, the current 24-entry art/cameo catalog, vehicle directions, infantry frames, terrain, and scenery. [`original-assets.test.ts`](src/assets/original-assets.test.ts) checks the actual supplied archives. |
| Parameterized source and browser persistence | Source configuration is available through `VITE_ASSET_URL`, `?asset_url=`, Settings, and local EXE/ZIP or paired MIX import. Extracted runtime files are cached in IndexedDB. [Asset verification](tests/ASSET_VERIFICATION.md) covers no-download cache reload, actual local imports, invalid-source recovery, quota failure, and retry recovery; [mobile verification](tests/MOBILE_VERIFICATION.md) checks source/progress/multiple-file UI contracts. |
| Unit information in TOML instead of INI | Individual [`src/data/units/`](src/data/units/) TOML files supply shared gameplay definitions through [`definitions.ts`](src/game/definitions.ts). [`simulation.test.ts`](tests/simulation.test.ts) verifies linked prerequisites, faction distinctions, and common definitions consumed by simulation and sidebar. Gameplay rules do not depend on original INI files. |
| 1 — Basic UI and unit build sidebar | [`UI.ts`](src/ui/UI.ts) provides four production categories, illustrated cards, credits/power/time, queues, readiness and requirements, selection, minimap, pause/settings/help, loading progress, retry, and local import. [Desktop](tests/DESKTOP_VERIFICATION.md) and [mobile](tests/MOBILE_VERIFICATION.md) record actual UI interactions and contact sheets. Training visuals keep play available during download or an archive outage. |
| 2 — Build logic and building placement | [`Game.ts`](src/game/Game.ts) enforces funds, prerequisites, producers, power, paid queues, refunds, legal nearby plots, and separate unit spawn cells. Simulation construction tests cover those rules. [Desktop verification](tests/DESKTOP_VERIFICATION.md) records native production, blocked/valid placement, rally production, queue pause/resume/cancellation, repairs, and sale. Queue buttons retain DOM identity and focus between updates. |
| 3 — Unit pathfinding | [`pathfinding.ts`](src/game/pathfinding.ts) and movement logic route around obstacles, avoid corner cutting, select distinct formation destinations, and handle opposing traffic. Simulation tests exercise barriers, unreachable targets, the lake, and collision recovery. Native desktop movement reached its destination and returned to guard. |
| 4 — Ore miner AI | `Game.findOre` sorts available deposits by distance and selects a reachable candidate; miners collect ore, return to an owned refinery, and repeat. Simulation tests verify ore depletion and owner-only income, an enclosed nearer deposit, missing-refinery recovery, and multiple miners completing repeated deposit cycles without overlap. |
| 5 — Sides and ownership | Each side owns its money, power, queues, entities, kills, and defeat status. Simulation tests reject enemy selection and movement/harvest/stop/sell/repair orders and verify independent income. Native desktop clicks on a revealed enemy yard selected nothing; a subsequent order left enemy positions and orders unchanged. |
| 6 — Enemy AI | `Game.updateAI` uses its own resources and the same production/placement rules to expand economy, produce armor, and launch assaults. The simulation AI test runs 180 seconds, verifies a Soviet factory, additional miners/tanks, units advancing across the map, enemy kills, and player-base damage. Lifecycle tests verify either winner, simulation stop, and restart. |
| 7 — Zoom and mobile play | [`Camera.ts`](src/render/Camera.ts) and [`Controls.ts`](src/input/Controls.ts) provide anchored zoom, mouse/keyboard pan, touch selection/commands, one- and two-finger camera gestures, and lossless touch placement cancellation. Camera tests and seven mobile-input tests verify zoom limits/inversion, gesture anchoring, cancellation, user-agent detection, forced desktop controls, and coarse-pointer tablets. [Mobile verification](tests/MOBILE_VERIFICATION.md) records live portrait/landscape commands, build/placement, pinch and two-finger pan. |
| Dev server network requirements | [`vite.config.ts`](vite.config.ts) binds both dev and preview to `0.0.0.0` and allows `omarky`; the asset audit records successful required-host HTTP responses. The fixed archive proxy follows only the requested installer route. |
| Delegation and progress tracking | Work was delegated across asset, simulation/desktop-input, and interface/mobile agents, with a coordinating integration agent. This file tracks the requirement gates and the three verification reports preserve results. |
| Screenshot contact sheets | Browser captures were collaged before visual inspection. Durable evidence: [desktop](tests/artifacts/desktop-contact-sheet.jpg), [mobile](tests/artifacts/mobile-contact-sheet.png), and [production assets](tests/artifacts/assets-production-contact-sheet.png). Individual transient captures and original archives are not runtime dependencies. |
| Optional videos and conditional handoff | Video references were optional; actual extracted game artwork supplied the visual reference. `HANDOFF_STATE` was requested only if a context restart became necessary; it is not an unconditional deliverable. |
| 8 — Additional scope | **Deferred.** The prompt explicitly reserves this milestone for user discussion before additional implementation. |

## Final gate evidence

- `npm test`: **40 passed, 1 optional real-archive integration test skipped**. With `RA2_ASSET_DIR=/tmp/ra2-assets`, **all 41 tests passed** across six files. The integration fixture is the actual installer's extracted MIX archives, not synthetic game content.
- `npm run build`: TypeScript checking and Vite production build passed at **2026-09-13 17:08:55 UTC**. The current `dist/index.html` references `index-DyWbI4CO.js`; its inspected SHA-256 is `1f2e15e35e2b5fc0fa43590e238a585672571732f58c289d9c87688154af3631`.
- The final worker `extract.worker-C6NvH0UW.js` and WASM hashes match artifacts that extracted the actual installer in the production browser. The final app reloaded **126 files / 4,897,139 bytes** from IndexedDB, reached `ready` with `error=null` and `cacheWarning=null`, and made no installer, worker, or WASM request. No application console errors were reported.
- Final scenery-palette inspection passed for all **six gold ore and eight green tree variants** in the combined production contact sheet. Asset metadata and the complete download/extract/cache/recovery evidence are in [`tests/ASSET_VERIFICATION.md`](tests/ASSET_VERIFICATION.md).
- Desktop native interactions, including the corrected production queue, are complete in [`tests/DESKTOP_VERIFICATION.md`](tests/DESKTOP_VERIFICATION.md).
- Mobile gesture/UI verification and seven regression tests are complete in [`tests/MOBILE_VERIFICATION.md`](tests/MOBILE_VERIFICATION.md).

## Delivery boundaries

[`README.md`](README.md) documents launch/build/preview commands, controls, TOML rules, source configuration, cache behavior, local imports, and deployment. Original archives and runtime game assets are downloaded/imported at runtime rather than bundled; verification screenshots may contain rendered artwork. Static deployment needs an equivalent fixed proxy or a CORS-enabled source. Physical iOS/Android hardware was unavailable: mobile evidence uses Chromium emulation and explicit touch-event tests. The browser used SwiftShader, so the measured software-rendered performance is not a claim about hardware-accelerated frame rate.


## Original-game visual fidelity pass — 2026-09-13

The earlier milestone and build results above are historical. This pass compares real Red Alert 2 gameplay screenshots and video against the browser build, with the coordinating agent delegating all implementation.

- Original Allied sidebar artwork now follows the retail 168-pixel composition, with native 60 × 48 cameos, radar availability, original top controls, repair/sell controls, and production states. Dashboard branding and persistent briefing panels were removed from gameplay.
- Original VPL lighting, normal tables, HVA transforms, team-color ramps, vehicle parts, building foundations/shadows, and authored building animations replace earlier approximations.
- Real roads, terrain transitions, black shroud, selection indicators, and cached native terrain surfaces improve the battlefield; fractional zoom is checked with a real WebGL pixel regression.
- First launch waits for explicit archive submission or local import. The battle remains at time zero during preparation and cached presentation. Every consumed original is required; incomplete caches keep the source form visible, with no automatic network retry or fallback play action.
- Browser checks distinguish native input, deterministic simulation timing, synthetic legacy-cache staging, and decoder contact sheets. Headless Chromium uses SwiftShader; this is real browser rendering but not a hardware-performance claim.

Current evidence and results: [fidelity verification](tests/FIDELITY_VERIFICATION.md), [reference research](docs/ORIGINAL_GAMEPLAY_REFERENCE.md), and [asset verification](tests/ASSET_VERIFICATION.md). The normal development server remains on `0.0.0.0:5173` with `omarky` allowed.

## Repeated download and extraction correction — 2026-09-13

- [x] Keep completed installers, extracted MIX inputs, and selected artwork independent; selection/decoder failures cannot poison completed archive stages.
- [x] Recover existing incorrect artwork/MIX/runtime rejection markers locally; preserve completed downloads after 7-Zip memory errors or interruption; bound fallback to one alternate saved representation.
- [x] Report cached MIX preparation accurately, reserve download labels for real transfers, and keep storage warnings visible without blocking usable session assets.
- [x] On actual `omarky:5173`, reproduce poisoned metadata over the previously real-downloaded archives, recover 242 files locally, then hard reload and native Enter with zero fetches/workers/writes.
- [x] Close/reopen regular Chromium processes on the same live origin and profile: recover poisoned cache from MIX once, then reopen/Continue from selected artwork with zero repeated work.

Evidence: [cache recovery verification](tests/CACHE_RECOVERY_VERIFICATION.md),
[live counters](tests/artifacts/cache-poison-live.json), and
[browser-process restart](tests/artifacts/cache-poison-browser-restart.json).
The native local-import restart test is separate from the preserved actual
default-URL remote-download evidence; no duplicate remote transfer was needed.

Final cache-fix gates: **197 tests passed, one optional movement diagnostic
skipped**, and TypeScript/Vite production build passed. Bundle
`index-8Yu4Ff27.js`, worker `extract.worker-D90MFsqW.js`; complete source/build
hashes are in [cache-recovery-build.json](tests/artifacts/cache-recovery-build.json).
