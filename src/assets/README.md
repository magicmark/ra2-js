# Original game asset pipeline

`AssetManager.initialize({ url?, onProgress? })` checks IndexedDB without starting
a download. Explicit source submission calls `download`; local file imports use
`importFiles`. The game stays at the editable source form until the player
submits and a complete set of original assets has validated. A valid saved cache
still requires Enter to continue, but skips both download and extraction.
`download({ forceRefresh: true })` is an explicit API request to replace an
otherwise usable cache; ordinary `download` calls reuse it.
`AssetDownload.ts` owns HTTP streaming, source aliases and durable archive stages.
A completed download is saved before the expensive extraction step. It remains
an unverified candidate until the worker validates the game MIX containers;
partial responses, disconnected streams and HTML pages are never accepted as
completed archives. Validated MIX inputs are saved before selected-art decoding.
The completed installer, MIX inputs and selected artwork use independent keys in
the existing IndexedDB store, so artwork catalog changes do not expire archives.
Selected-art validation errors cannot reject those archive stages. Historical
artwork rejection markers recover locally, and a damaged MIX representation can
fall back once to its saved installer. Memory exhaustion, command errors and
interruption preserve downloaded bytes; only a confirmed container failure is
rejected. See [live and browser-restart recovery evidence](../../tests/CACHE_RECOVERY_VERIFICATION.md).

Downloads extract in a dedicated Web Worker using 7-Zip WebAssembly. The Windows installer is treated as an archive and is
never executed. The supplied 206,530,229-byte installer is NSIS 2 / solid LZMA.
Only game MIX archives are extracted. Nested MIX indexes, including their RSA
wrapped Blowfish keys, are decoded in the worker. The selected original
SHP, VXL, HVA, TMP, palette and art files are saved to IndexedDB alongside the
reusable original archive stages. Consumed effects and EVA speech are selected
from the original audio MIX bank. The 13 gameplay tracks declared by `theme.ini`
are selected from `theme.mix`; movies, menu music and credits music are excluded.
Music stays compressed in the selected cache and is validated without allocating
decoded PCM for the whole soundtrack. Playback decodes one track at a time; see
[original audio](../../docs/ORIGINAL_AUDIO.md).

The browser fetches the displayed public URL directly, with no Vite proxy.
`ORIGINAL_ASSET_URL` in `AssetDownload.ts` (also re-exported by `AssetManager.ts`)
uses Internet Archive's official `/cors/` endpoint. Its old `/download/` URL
and same-origin `/asset-source` spellings normalize to the new displayed URL;
all retain the historical `/asset-source` storage key. Selected-art reads and
explicit cache clearing also cover both historical public-URL keys. Custom
sources are fetched exactly as entered and must permit CORS. The app also
accepts `?asset_url=...` and local installer / MIX file imports. A failed network,
extraction or decode operation keeps the game at the source form, reports an
actionable error and requires another explicit submission to retry. Unavailable
IndexedDB or a quota error reports which stages could not be saved. The smaller
selected-art cache is still attempted when a large archive stage exceeds quota;
its success does not erase a failed archive-stage warning. Play is possible only
after all required original assets have loaded successfully.

Before `ready` becomes true, the loader decodes the required original palettes,
32-level VPL material table, catalog models/cameos, authored foundations and
animations, six ore and eight tree variants, map terrain/road/edge files, and
the Allied sidebar frames exported in `HUD_ASSET_FRAMES`, including original
menu pressed frames and scroll enabled, pressed and disabled frames. Missing or corrupt
consumed files fail validation with their names. Unused movies, menu tracks,
snow artwork and nonexistent optional vehicle parts are not required. Original
filename aliases and multipart composition remain supported; generated artwork
and substitute palettes/material lighting are absent. Consumed original sound
definitions, samples and gameplay music also validate before the game becomes ready.

The animation/Options catalog contains 265 files. It also validates nine ground
impact/vehicle-death SHPs against `anim.pal`, the consumed infantry sequences
from `art.ini`, and the original Options backgrounds, three button frames and
three PCX controls. PCX files carry their own 8-bit RGB palettes; the original
SHP palettes use Westwood's 6-bit channels. Adding these files does not change
the cache schema or the saved installer/MIX generation.

Compatible cache versions are checked against those same requirements. A cache
version change alone does not discard usable files. Missing or invalid selected
artwork is rebuilt locally from saved MIX inputs, or from the saved installer if
extraction did not finish. Older extractors omitted standalone `theme.mix`; that
specific missing-music case also reopens the saved installer locally, preserving
the valid existing MIX generation. Imports from an installed game require
`ra2.mix`, `language.mix` and `theme.mix`. Recovery directly from complete MIX
inputs starts no 7-Zip/WASM extraction. These
operations display “Preparing saved game files” and never authorize a network
request. Old releases that saved only selected artwork cannot recover absent
original bytes; if no reusable archive stage exists, the source form requires an
explicit download or import. A replacement never enables a partially rendered game.

Worker or artwork decoder interruptions retain completed stages for local retry.
Only a structural container failure can reject that archive representation; a
saved installer remains available to repair a damaged MIX stage. Catalog or
sprite errors cannot reject the original archives. A failed replacement also
preserves previous verified stages. Only fully validated artwork replaces the
selected-art entry. The public original URL and its historical URL aliases
share the existing `/asset-source` cache key.
Archive keys are `['archive-stage-v1', sourceKey, stage]`, where `installer` and
`mix` are verified stages and `download` / `mix-pending` retain interrupted work.
All stages remain specific to the browser profile and origin; clearing browser
storage removes them. No archive bytes are bundled with the application.

## Renderer API

- `getSounds()` supplies the decoded original effect/EVA bank only after asset
  validation succeeds. Samples preserve authored variants and volume.
- `getSprite(idOrOriginalFilename, frame = 0, side = 0)` returns original art as a
  synchronous canvas sprite after initialization. Building layers are composited;
  infantry uses SHP animation sequences; vehicles combine hull, turret and barrel
  VXL models transformed by HVA and rasterized at 32 facings with a depth buffer.
- `getCameo(idOrFilename)` returns the original sidebar cameo and its own palette.
- `getInfantryFrame(idOrFilename, exactFrame, side)` accesses authored SHP frames
  without the idle/walk index mapping, retaining matched shadows and anchors.
  GI deployed idle uses 292–299 and deployed fire uses 315–362.
- `getInfantrySequence(id, action, facing, ageSeconds, side, nativeSpeedIndex)`
  selects the authored sequence and native per-sequence interval. Firing and GI
  deployment use event-relative ages supplied by the simulation. Walking uses
  three logic ticks per frame; GI deployment uses its original 15 frames and
  undeployment uses two. The parser rejects missing sequences and out-of-range
  frames before the game becomes ready.
- `getVehicleSprite(idOrFilename, hullFacing, turretFacing, side)` independently
  rotates the original hull and turret/barrel voxels in the same depth buffer.
  Facing keys normalize to 0–31, including negative inputs; only displayed
  combinations are rasterized and cached.
- `getBuildingSprite(idOrFilename, simulationTime, side, nativeSpeedIndex)` selects the original
  healthy idle/active animation loops from `art.ini`. Discrete frame combinations
  are cached; foundation anchors stay fixed and simulation pause stops motion.
- `getAnimationDefinitions()` and `getInfantryAnimationDefinitions()` provide
  validated frame counts and raw logic-tick intervals to the simulation.
  `getAnimationSprite(id, ageSeconds, capturedTicksPerFrame)` returns the
  original impact/death frame. Active effects keep their captured interval;
  newly created normalized effects use the selected native speed index.
- `getDialogAsset(name, frame, side)` supplies `DIALOG_ASSET_FRAMES`: original
  small/medium/large Options backgrounds, `options-button` frames 0–2, checked
  and unchecked boxes, and the slider thumb. Button frame 1 is pressed; frame 2
  is the native timer-flash state. Full frame crop positions are preserved.
- `getUIAsset(name, frame = 0, side = 0)` returns original sidebar SHPs with the
  matching faction palette. Names are stored separately per side because the
  original Allied and Soviet MIX archives reuse the same filenames.
- `getTerrain(kind, variant)` returns an original 60×30 isometric TMP tile.
- `getOverlay('ore' | 'tree', variant)` returns original scenery SHP art from
  theater `.tem` files, using `temperat.pal` for ore and `isotem.pal` for trees.
- Every sprite has `source`, `width`, `height`, `anchorX`, `anchorY`, `offsetX`
  and `offsetY`. The anchor is the map ground origin measured from the canvas's
  top-left. Draw at `(screenX - anchorX, screenY - anchorY)`; offsets are the
  negatives of the anchors. Buildings anchor at their foundation centre, while
  infantry and voxels anchor at their feet. Width and height are native pixels.
  Entity canvases are trimmed to painted bounds while retaining the ground
  origin. Unit health bars use a canonical pose so turning does not move them.
- Vehicle frames 0–31 are rotation headings. Infantry frames 0–7 are idle
  headings; walking is `8 + heading + animationStep * 8` for steps 0–5. Original
  files have additional firing/death sequences, available through `getInfantryFrame`.

Building sprites include their original bib foundations and split SHP shadows;
the Sentry Gun composites `laser.vxl` onto its building base. Vehicle rendering
uses the authored per-limb TS/RA2 normal format and the original `voxels.vpl` material lookup,
including its diffuse/specular response, at one projected pixel per voxel.
See [Rhino/Carrier lighting verification](../../tests/VOXEL_LIGHTING_VERIFICATION.md).
Player remapping follows the original DarkBlue/DarkRed HSV ramps. Catalog changes
retain selected-art schema 8 and can reselect added originals from saved MIX
stages. No original game archives or runtime asset files are bundled.

The format implementations were written for this project from the data layout
described and demonstrated by these upstream references:

- [OpenRA MIX reader and filename hashing](https://github.com/OpenRA/OpenRA/tree/bleed/OpenRA.Mods.Cnc/FileSystem)
- [OpenRA SHP format reader](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Common/SpriteLoaders/ShpTSLoader.cs)
- [OpenRA VXL and HVA format readers](https://github.com/OpenRA/OpenRA/tree/bleed/OpenRA.Mods.Cnc/FileFormats)
- [OpenRA TMP format reader](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/SpriteLoaders/TmpTSLoader.cs)
- [RA2 normal-index lookup data](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/Traits/World/VoxelNormalsPalette.cs)
- [Thomas Sneddon's VPL shading, nonlinear HSV remap and native pixel projection](https://github.com/ThomasSneddon/vxl-renderer/blob/master/shaders.hlsl)
- [Reconstructed voxel lighting direction](https://github.com/ThomasSneddon/vxl-renderer/blob/master/d3d.h)
- [7z-wasm package documentation and license](https://github.com/use-strict/7z-wasm)
- [egoroof-blowfish package documentation and MIT license](https://github.com/egoroof/blowfish)

No original game archives or runtime asset files are bundled. Verification
screenshots may show rendered original artwork.

Animation cadence and selection are grounded in the supplied executable and
original `art.ini`; see [native animation evidence](../../docs/NATIVE_ANIMATION_REFERENCE.md)
and [burst/death evidence](../../docs/NATIVE_BURST_DEATH_REFERENCE.md). The renderer
does not substitute procedural shot tracers, smoke rings or death explosions
for unsourced artwork. IFVs use the supplied DRAGON directional SHP, theater unit
palette and authored line-trail color; each rocket travels before its XGRYSML2
impact and damage. Saved MIX archives upgrade older artwork selections locally.
See [IFV rocket verification](../../tests/IFV_ROCKETS_VERIFICATION.md).
Other projectile flight, infantry/building death sequences,
special translucent blending, debris and water-specific impacts remain separate
parity work.
