# Native gameplay observations — 2026-09-13

These observations cover the live source after the stationary-turn and vehicle-detour fixes, with the same physics later frozen in preview `http://omarky:4197/` (`index-CzD4K9G2.js`). This is scoped interaction evidence, not a claim of complete retail parity. See [gameplay rules and limitations](../docs/GAMEPLAY_PARITY.md) for the complete implementation and source references.

The later [final movement verification](FINAL_MOVEMENT_VERIFICATION.md) covers the authored ground-speed conversion, current moving bends and crowded traffic, native Stop/arrival, and the 4203 stopped-reroute fix. Earlier speeds and remaining-check lists below describe their recorded builds.

## Cached startup and actual input

An isolated Chromium page at `http://omarky:5173/` reported original assets ready and no archive requests. Network was explicitly set to Offline before clicking the native **Continue** button. The gate closed, the canvas received focus, and simulation time advanced. This succeeded after the user explicitly authorized all needed tests. No installer transfer occurred. The integration owner's separate persistent-profile tests cover the real download/MIX/original-art cache stages.

Native keyboard `M` selected the miner, a second `M` selected the Grizzly. A normal left click at the center of the battlefield then issued the first movement order; `S` and a second normal battlefield click issued the reverse order. Camera centering was diagnostic setup, not an alternative command implementation. The existing simulation step was wrapped only to record its completed state; game coordinates, speed, facing and physics were not overridden.

| Native order | Stationary start | First translating frame | First displacement |
| --- | --- | --- | --- |
| Fresh quarter-turn | Grizzly `(19.5,41.5)`, hull −45°, destination `(23.5,45.5)` | Frame 13, after 12 stationary logic frames (0.4 simulation seconds) | 0.085 cells, at +45° |
| Fresh half-turn after `S` | Grizzly `(23.5,45.5)`, hull +45°, destination `(19.5,41.5)` | Frame 26, after 25 stationary logic frames (0.8333 simulation seconds) | 0.085 cells, at +225° |

The full 60-frame state traces are [quarter-turn](artifacts/gameplay/native-quarter-turn.json) and [half-turn](artifacts/gameplay/native-half-turn.json). The original 30-frame reference clock and current 2.55-cell/second Grizzly speed apply to these captures. If later native speed conversion changes travel distance, these remain evidence for this recorded build, not an updated speed measurement.

Native `P`, `Ctrl+1`, and `Esc` also executed. While Options was open, pressing `M` did not alter the selected IDs, and simulation time remained exactly `146.46666666666093`. Native `Esc` closed the dialog. Unit-level tests separately cover the full command matrix, radar orders, toolbar equivalence, modal/source guards and touch gestures.

## Performance limitation under investigation

At viewport 1440×1200, battlefield canvas 1272×1170, DPR 1, explicit CPU throttling 1×, warmed render instrumentation recorded 27 frames with mean 85.66ms (46.4–162.1ms) and only one voxel-cache call above 1ms. A subsequent 42-frame sample averaged 69.99ms; all 420 WebGL flush calls totaled 28.5ms, and no new textures were allocated. This identifies JavaScript rendering work as the large cost in that environment. Those sparse presentation frames cannot establish UI fluidity, even though the simulation's individual turn steps are correct. The renderer owner is profiling and fixing the cost; these measurements must not be presented as completed performance parity.

The native movement capture did not calibrate retail wall-clock speed or validate the original locomotor's complete curve/avoidance behavior. The independent continuous retail footage review and final renderer captures are tracked by the coordinator.
# Additional native toolbar capture

The immutable 242-original-art snapshot `index-CzD4K9G2.js` was served unchanged at `http://omarky:4201/` for an isolated browser context. Its selected-originals cache was seeded from the snapshot's supplied original-file export, verified, and entered with the native Continue button while offline; archive requests remained zero. This snapshot predates the exact ground-speed TOML conversion and later Options/command-line work.

The [native input trace](artifacts/gameplay/native-toolbar-controls.json) records D deploying GI 7, the Deploy toolbar button undeploying it, initial Team 1 creation followed by numeric 1 recall, and the Type toolbar button selecting all four GIs. Planning mode queued a native canvas click without issuing a route, then dispatched each selected unit's waypoint on the next toolbar toggle. Both the Guard button and G key dispatched the same guard operation for their then-living selections; AI combat killed selected infantry between those actions, so this is not an assertion that their ID lists remained identical. Method wrappers only recorded calls and forwarded them unchanged. Camera centering was diagnostic setup; orders themselves came from native inputs.

The first unattended attempt to test Type occurred after the AI had won and was excluded. A native New Operation restarted the scenario, and the native speed preference selected 0.5× to allow inspection. The final Options dialog held simulation time at 145.433333 seconds with no winner. Deployment, team, type and queued planning behavior passed. A final native radar-order/follow capture, moving bends, crowded detours, blocked infantry and the complete production Ready/Hold/flash flow remain separate checks; the unit regressions alone do not prove their visual parity.
