# RA2 parity work — current acceptance checks

The user paused the visual-fidelity session and asked this team to continue through subagents until the game matches RA2's visuals, game pace, hotkeys, and UI fluidity. This is the coordinator's working checklist; checked-in evidence must distinguish actual verification from remaining differences.

## Current verified checkpoint

The cache-recovery checkpoint passed **197 tests and the production build**. On
the live `omarky:5173` origin, saved installer/MIX bytes survived reproduced legacy
rejection markers and repaired selected artwork locally. A further hard reload,
complete browser-process restart, and native Continue reused the cache with zero
download or extraction work. See [cache recovery evidence](../tests/CACHE_RECOVERY_VERIFICATION.md).

The independent [retail video review](VIDEO_PARITY_REVIEW.md) covers immutable
4197 separately from that newer cache checkpoint. It confirms fresh quarter/half
turns before translation, independent turret aim, native infantry health-bar
geometry, Allied bitmap credits, and the six original command identities. It
also records missing command lines, the measured toolbar artwork offset,
unverified crowded movement/production states, and the custom Options screen.
The subsequent [footer capture](../tests/artifacts/native-ui/footer-registration-contact.png)
verifies the exact +1px X/−2px Y artwork correction for all six icons with unchanged
button centers. [Native UI checks](../tests/NATIVE_UI_VERIFICATION.md) also verify
green/red command lines and production Hold/Ready/placement/cancellation states.
Their controlled use of the original simulation tick is documented separately
from native browser input and from retail timing. A near-integer credit-display
fix preserves the underlying economy values. Options, combat animation and
remaining movement limits are still open; these checks do not establish total
retail parity.

The direct-download follow-up removes the Vite proxy and uses Internet Archive's
official CORS endpoint. A full native-Enter transfer/extraction and cached reload
passed, while the legacy selected-art/installer/MIX identities remain unchanged.
The independent [localhost check](../tests/artifacts/direct-cors-legacy-localhost.json)
records a ready cached hard reload and native Continue with zero fetches, workers
or writes after that URL change.

The [previous integration checkpoint](../tests/FINAL_CHECKPOINT_VERIFICATION.md)
passed **210 tests and the production build**, with one optional diagnostic
skipped. It includes the stopped-collision-reroute turn gate found during the
[final movement review](../tests/FINAL_MOVEMENT_VERIFICATION.md).

The [animation/Options checkpoint](../tests/NATIVE_ANIMATION_OPTIONS_VERIFICATION.md)
passes **240 tests and the production build**, with one optional diagnostic
skipped. It adds original infantry firing/deployment poses, individual IFV burst
events, ground impacts and ordinary vehicle explosions, corrected normalized
animation timing, original-art pause panels, persisted Options preferences, and
19 remappable core commands. The actual saved 242-file catalog upgrades to 265
from existing MIX files; hard reload and native Continue perform zero downloads,
workers or writes.

Remaining parity includes projectile travel, infantry/building death sequences,
native translucent effect blending, original music/voice/effects, Load/Save/Delete,
Show Hidden markers, full modifier remapping, and clean-retail Options typography
and interior pixel placement. The fastest browser speed is capped at 4× instead
of native unlimited speed. The supplied executable's static evidence is qualified
as modified base RA2, not certified clean retail.

## Reference and ownership

- Visual target: original retail Red Alert 2, using the screenshots, native archive contact sheets, and measured geometry in `ORIGINAL_GAMEPLAY_REFERENCE.md`. Preserve the completed authored materials, building animation, terrain chunks, and original sidebar work.
- Control reference: the original Westwood manual, reproduced at <https://oldgamesdownload.com/manual/command-conquer-red-alert-2-windows-manual-english/>. Mouse/keyboard sections are printed pages 15–18 and 29–31. The PDF is <https://oldgamesdownload.com/wp-content/uploads/manuals/command-and-conquer-red-alert-2_win_manual_en_8mo.pdf>.
- Native data: `/tmp/ra2-assets/ra2.mix` and `language.mix`; original installer `/tmp/ra2-multiplayer.exe`. Read authored rules/art fields before changing timing or geometry. Do not add generated artwork.
- Continuous retail reference: [Soviet Mission 2, The C&C Strategist](https://www.dailymotion.com/video/x8vlwj6), source 00:50–02:20. The review inspected consecutive decoded frames rather than inferring movement from sparse storyboards. The recording's game-speed setting and scaling are unknown; observed transition windows do not establish an exact native speed conversion.

## Required asset flow

- First-open form retains the editable prefilled public download URL and native Enter submission. No transfer starts merely by opening the page.
- Download the entered URL directly in the browser, with no Vite archive proxy. The built-in source is `https://archive.org/cors/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe`; its prior `/download/` and `/asset-source` aliases retain the same cache identity.
- No placeholder play option, generated game art, or partial-original play state.
- Missing, malformed, or incomplete originals keep the form visible and battle clock stopped, with the reason visible on that form.
- A real EXE transfer/extraction completes once; a new page and hard reload restore the saved extracted originals with no archive fetch or extraction worker. Repeated Enter and failed archives do not retry automatically.
- Completed installer bytes and extracted MIX archives persist independently of the selected artwork. Removing or expanding the selected artwork must rebuild from local MIX files, without another installer transfer or EXE extraction. The dedicated transport module is `src/assets/AssetDownload.ts`; stage tests and browser evidence are in `tests/STAGED_CACHE_VERIFICATION.md`.
- Artwork-selection/decoder errors and 7-Zip runtime failures must retain completed archives. Recover known legacy rejection markers locally; a confirmed bad representation may try one distinct saved alternative, without automatic network fallback. Preserve the full browser-process restart evidence in `tests/CACHE_RECOVERY_VERIFICATION.md`.
- Preserve the earlier complete remote-transfer evidence and add current-catalog evidence rather than relabeling older snapshots.

## Visual checks

- Native 168px sidebar, 60×48 cameos, original chrome and frame states, correct menu order and scroll controls. Native geometry comparison at 800×600, plus desktop and touch viewports.
- Original terrain, entities, placement artwork, material shading, palettes, foundations/shadows, and building idle animation remain intact.
- Black shroud covers unexplored cells and every map boundary. The completed real-WebGL boundary matrix covers 256 cases and 98,304,000 fully hidden pixels with no leaks. Preserve that result; repeat only affected checks after renderer changes. Evidence: `tests/TILE_SEAM_VERIFICATION.md`.
- Inspect actual gameplay and interaction captures against the source references; record remaining differences explicitly rather than equating successful extraction with visual parity.

## Controls and game pace

- Match the manual's applicable mouse/keyboard behavior and expose supported actions through the command UI and help text. Remove conflicting recreation shortcuts instead of silently assigning the same key twice.
- Core coverage: selection and deselection, type selection, team assignment/recall, camera navigation/bookmarks, production tabs, stop/guard/scatter, attack-move modifiers, and repair/sell. Validate applicable additional commands against actual game capabilities.
- Source inputs and open dialogs must not activate battlefield shortcuts. Touch controls and pointer cancellation must keep working.
- Compare movement, construction, harvesting, attack cadence, and animation timing with authored data/reference evidence. Separate measured native values from reconstruction assumptions.
- Movement must preserve distance across path-cell boundaries, animate walking from actual displacement, turn hulls at a finite rate, and aim vehicle turrets independently. At source 01:33.283–01:33.667 the retail Rhino visibly changes hull poses through a bend while its gun holds a separate bearing; this is a pose-transition window, not a calibrated 90-degree rotation measurement.
- Fresh large-angle orders to stationary vehicles must turn the hull before translation. The consecutive retail frames at 01:45.983–01:46.383 preserve the selected Rhino's health-bar anchor while its hull changes orientation. The interim 4195 build failed by moving sideways; 4197 native captures and per-step observations pass quarter/half turns with zero displacement before alignment. Preserve those results while verifying moving bends and crowds. Opposing vehicles must still pass each other, and the existing 180-second AI attack regression must remain intact.
- Production spends credits progressively, pauses when funds run out, and refunds only the amount spent when cancelled. The retail Tesla Reactor at source 02:03–02:14 visibly drains credits before a yellow Ready label and alternating category state appear.
- Equal visible wall time and selected game speed should produce equal simulation progress across ordinary frame schedules. A hidden-tab return must not fast-forward the whole battle.

## Fluidity and completion evidence

- Measure input handlers, render work, and observed frame timing in the actual browser; name the software-WebGL environment when reporting its limits.
- Verify continuous camera movement, selection/command feedback, scrolling, production interactions, responsive layouts, and modal focus behavior through actual input.
- Run meaningful simulation/control regressions, the real-original fixture suite, and production build after the implementation stabilizes. Re-run only affected checks after subsequent fixes.
- Preserve the root dev URL `http://omarky:5173/`, bound to `0.0.0.0` and allowing host `omarky`.
