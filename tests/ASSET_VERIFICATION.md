# Asset verification

Verified on 2026-09-13 against the supplied original installer and its extracted
`ra2.mix` / `language.mix`. Original archives and runtime asset bytes remain in
`/tmp`; none are bundled. Evidence screenshots contain rendered original art.

## Fixture and extraction

- Installer: `Red-Alert-2-Multiplayer.exe`, 206,530,229 bytes; NSIS 2, solid LZMA.
- Installer SHA-256: `5388c54d7d7b73060083563ff1926bca0d2663a76678b807e23e9a8d491441ce`.
- Source: `ORIGINAL_ASSET_URL` in [AssetManager.ts](../src/assets/AssetManager.ts).
  The fixed Vite `/asset-source` proxy supports browser access to this source.
- Current full extraction: **217 selected files, cache schema 8**. This includes
  both faction sidebar palettes/chrome, menu buttons, `voxels.vpl`, building
  foundations, original active animations and native roads.
- The interim 211-file extraction predates the two faction menu buttons and
  corrected Soviet refinery animation selection. Missing-artwork reporting
  identifies those omissions in an existing cache.

The previous report described 126 files in version 5 and an automatic first-load
download. Those were historical checks of an earlier implementation. They do not
establish current artwork completeness or describe the current startup flow.
Initialization now checks IndexedDB without downloading; source submission and
artwork refresh are explicit player actions. Current browser and startup results
are recorded in [FIDELITY_VERIFICATION.md](FIDELITY_VERIFICATION.md),
[STARTUP_E2E.md](STARTUP_E2E.md) and [CACHE_VERIFICATION.md](CACHE_VERIFICATION.md).

## Native art audit

The real MIX integration test checks the catalog against encrypted archives,
including palettes, scenery, all selected building overlays/bibs, the Sentry Gun
voxel turret, original sidebar components, VPL tables and road templates. All
24 catalog entries have original sprites and cameos. Construction yards use their
faction's MCV cameo because they are not directly buildable in the original.

A separate audit exercised the actual `AssetManager` rendering code with original
archive bytes and a software implementation of its Canvas pixel operations. It
checked **922 sprite variants** for non-null results and finite anchors, with no
decoder diagnostics:

| Coverage                                               | Variants |
| ------------------------------------------------------ | -------: |
| Six vehicles × 32 facings × two remap colors           |      384 |
| Sentry Gun turret × 32 facings × two remap colors      |       64 |
| Four infantry × 56 idle/walk frames × two remap colors |      448 |
| Remaining 13 structures × two remap colors             |       26 |

This audit verifies composition and decode coverage. Final battlefield appearance
is separately captured from actual Chromium WebGL. Directional contact sheets
use nearest-neighbor enlargement of the native output.

- [Native vehicle facings](artifacts/fidelity/vehicle-facings-vpl.png)
- [Native building foundations and shadows](artifacts/fidelity/buildings-bibs-shadows.png)
- [Native Barracks flag frames](artifacts/fidelity/barracks-flag-frames.png)
- [Grizzly in browser WebGL at 2×](artifacts/fidelity/grizzly-corrected-2x.png)
- [Chrono Miner in browser WebGL at 2×](artifacts/fidelity/miner-corrected-2x.png)
- [Battlefield and sidebar comparison](FIDELITY_VERIFICATION.md)

The original `rules.ini` maps the Grizzly `[MTNK]` to `Image=GTNK`; the Allied
miner is `[CMIN]`, the Chrono Miner. The earlier pale, flattened appearance came
from lighting and rasterization, not substituted model names. Rendering now uses
authored normals, original VPL material response, reconstructed light direction,
one projected pixel per voxel and the original DarkBlue/DarkRed HSV remap ramps.
Sources and the limits of this reconstruction are in the
[reference report](../docs/ORIGINAL_GAMEPLAY_REFERENCE.md#vehicle-rendering-and-palette-audit).

The complete 217-file fixture reports `missingArtwork=[]`. Tests also exercise
explicit refresh of an older usable cache, preservation of its saved entry after
a failed refresh, and successful retry. A synthetic older fixture made by removing
VPL/sidebar/bibs/turret/new terrain entries was used to inspect the missing-VPL
normal-shading compatibility path. This does not assert an exact historical
126-file list or establish that missing artwork is visually equivalent.

## Building animation audit

`getBuildingSprite(name, simulationTime, side)` uses the original overlay
`LoopStart`, exclusive `LoopEnd`, `LoopCount` and `Rate`. Only indefinitely looping
idle/active sections advance; production crane sequences remain static. Healthy
loop limits prevent stepping into damaged or shadow frames. Static foundation
origins are reused, with trim offsets applied to each frame's canvas.

A native audit sampled 60 simulation seconds and found a finite 1–45 combined
states per structure. Barracks has 15 animated states; time 0 and 0.25 produce
different pixel hashes, while time 0.75 returns the same cached canvas as time 0.
The contact sheet confirms the flag changes while the building remains anchored.
Simulation time supplies pause and game-speed behavior; actual browser motion
verification is recorded in the fidelity report.

`GAREFNL4` is mentioned in the original `art.ini`, but no matching SHP exists in
the supplied archive under the checked theater filenames. It is not advertised
as extracted. The existing three Allied lights and all four actual Soviet
`NAREFNL1`–`NAREFNL4` shapes are selected.

## Automated gates

At the asset-source handoff, 13:05 US/Central:

- `RA2_ASSET_DIR=/tmp/ra2-assets npm test`: **68 passed**, across nine files.
- `npm run build`: TypeScript and Vite production build passed. Main bundle
  `index-NZzwYAi3.js`; extractor `extract.worker-D1qBXRnc.js`.
- Cache tests include cache-only initialization, explicit download/persistence,
  quota failure, forced refresh, failed-refresh preservation and retry.
- Format tests cover encrypted MIX, SHP RLE transparency, palettes, VXL/HVA, TMP,
  VPL offsets/truncation and original building loop boundaries.
- Renderer tests cover terrain chunk invalidation and texture reuse; the separate
  [tile seam audit](TILE_SEAM_VERIFICATION.md) records actual WebGL sampling.

Later UI/startup changes are covered by their final verification reports. The
optional original-archive integration test skips when `RA2_ASSET_DIR` is absent.
The 7z-wasm externalized Node `module` warning has been checked through actual
browser worker/WASM extraction. The installer is read as an archive, never run.

These checks cover the current roster and supplied installer; they do not imply
all original campaigns, animation sequences, terrain arrangements, audio/video
or mod archives are implemented. Browser evidence uses Chromium's
ANGLE/SwiftShader WebGL and does not establish physical GPU frame-rate performance.
