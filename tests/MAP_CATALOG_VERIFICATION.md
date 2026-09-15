# Native map and admin acceptance

The eight catalog maps are standard FinalAlert2 INI files in `public/maps/`.
QA reads their actual packed sections, original TMP metadata, original theater
INIs, and retail movement/buildability rules independently of the generator's
terrain labels. No original MIX/archive assets or third-party map fixture are
committed.

## Medium convention and playability

The project defines medium as `Size=0,0,96,96`, `LocalSize=3,4,90,86`: 18,336 native
cells, including the border, and 15,480 cells inside the local playable rectangle.
This is an explicit project convention, not a claimed official RA2 size category.
The native coordinate system is an isometric rectangle, not a 96×96 square grid.

| Map               | Native land/buildable | Connected land | Five-cell-wide route component | Minimum start separation |
| ----------------- | --------------------: | -------------: | -----------------------------: | -----------------------: |
| Emerald Divide    |                88.05% |        99.985% |                         10,023 |                    41.88 |
| Frostline Basin   |                90.79% |           100% |                         10,634 |                    39.12 |
| Saffron Wash      |                99.04% |           100% |                         13,131 |                    40.22 |
| Ironwood Crossing |                97.64% |           100% |                         11,200 |                    40.82 |
| Slatewater Reach  |                89.49% |           100% |                         11,270 |                    40.82 |
| Copperhead Mesa   |                  100% |           100% |                         12,961 |                    42.19 |
| Whiteout Causeway |                88.87% |           100% |                         10,995 |                    41.88 |
| Tidal Crown       |                93.40% |           100% |                         11,450 |                    38.47 |

All 48 starts have an unobstructed, buildable 11×11 plot. The nearest ore is ten
orthogonal ground steps away; each start has exactly 78 full-density ore cells
within twenty steps. The ore supply ratio is 1.0 for every map. Flood fills block
actual native water/beach, tree cells, and full 2×2 oil/3×3 airport foundations.
Every one of the nine neutral buildings is reachable from every start. A separate
flood fill on terrain eroded by two cells verifies connected routes at least five
cells wide between all six starts. The final maps corrected an initially narrow
Emerald route and two isolated Whiteout oil sites; thresholds were retained.
Detailed raw results and hashes: [native-acceptance.json](artifacts/maps/native-acceptance.json).

## Independent native format evidence

Every generated packed section is byte-identical between the application decoder
and an independent Python reader: system `liblzo2` decodes terrain; a separately
implemented Format80 decoder handles overlays. All chunk sizes and decoded output
lengths are checked. Native TMP terrain byte codes are translated using the
[World-Altering Editor helper](https://github.com/CnCNet/WorldAlteringEditor/blob/master/src/MapEditorLibrary/Helpers.cs),
then mapped to the original `rules.ini` movement/buildability settings. Tile file
indices are independently reconstructed from the original theater INI sections.
TMP field offsets were checked against the
[editor TMP reader](https://github.com/CnCNet/WorldAlteringEditor/blob/master/src/MapEditorLibrary/CCEngine/TmpFile.cs).

A separately sourced [CnCNet FinalAlert Snow Valley map](https://github.com/CnCNet/cncnet-yr-client-package/blob/develop/package/Maps/Yuri's%20Revenge/2_snow_valley.map)
(98×99, 19,305 cells) also passes: its 212,355 decoded terrain bytes and both 262,144
byte overlay sections match independently. [Fixture hashes](artifacts/maps/reference-map.json)
identify the exact input and decoded outputs; the third-party map stays in `/tmp`.
Framing/LCW references:
[OpenRA Gen2 importer](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/UtilityCommands/ImportGen2MapCommand.cs),
[OpenRA LCW reader](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/FileFormats/LCWCompression.cs).

```sh
RA2_ASSET_DIR=/path/to/mixes \
RA2_REFERENCE_MAP=/path/to/reference.map \
RA2_QA_REPORT=tests/artifacts/maps \
npm test -- tests/native-map-acceptance.test.ts
```

Python 3 and system `liblzo2` are required only for the opt-in independent checks.
The normal `npm test` does not depend on these local originals or reference paths.

## Browser evidence

Real Chromium at `http://omarky:5173/admin/`, served on `0.0.0.0:5173` with `omarky`
allowed. The browser imported the existing `ra2.mix` and `language.mix` through the
file chooser, then retained both archives in IndexedDB. Native catalog migration
upgraded the selected artwork from 265 to 661 files while preserving the original
MIX generation and all 335,011,496 saved archive bytes. No installer/archive network
download occurred. Missing snow/urban palette selection found during QA was fixed.
[Before](artifacts/maps/cache-before-upgrade.json) and
[after](artifacts/maps/cache-upgrade.json) record cache provenance.

All eight native map images were inspected, including ore, neutral structures,
six labels and full bounds. Temperate meadows, sandy washes/mineral bands, snow
basins/causeways and urban coastal layouts have distinct appearances. Exact authored
TMP/subtile art, native palettes, ore SHPs and CAOILD/CAAIRP sprites were checked for
nonempty output; every fitted native cell lies inside the canvas. Instrumentation
observed zero shroud draw calls, and the final eight-map run had no application
exceptions or failed map/asset requests. Browser-only software-WebGL/readback
performance warnings are not application failures. Per-map JSON and screenshots
are in [artifacts/maps/](artifacts/maps/).

Normal-game regression remains separate from the admin preview: the root retains
the original 64×64 procedural game, and the native skirmish integration loads the
same map terrain, ore and nine neutral buildings. An actual Tidal Crown launch
advanced time with two sides, no winner and no automatic neutral targets. The
current engine uses native starts 0/3 (UI 1/4), while the .map retains all six starts;
it does not add six-player multiplayer/AI. Airports render and can be captured;
the browser does not implement their paradrop superweapon.

## Responsive preview and final checks

Actual Chromium touch input passed at 390×844, 844×390, and 320×700. Both overview
and immersive preview canvas rectangles stayed within the viewport with no
horizontal overflow; all six fitted labels and picker/Preview/Back controls were
visible and legible in independently reviewed screenshots. At 390px the overview
canvas spans x=10..380 and the preview x=7..383. A real two-pointer pinch changed
zoom from 0.0561 to 0.1331; touch dragging changed camera position, and wheel zoom
also worked. [Touch/navigation measurements](artifacts/maps/mobile-input.json),
[portrait overview](artifacts/maps/mobile-fit.png),
[portrait preview](artifacts/maps/mobile-preview-fit.png),
[landscape preview](artifacts/maps/mobile-preview-844.png), and
[320px overview](artifacts/maps/mobile-overview-320.png) retain the evidence.

Desktop and mobile Preview enter `/admin/<slug>/preview`; Back to maps returns to
the same selected slug. Browser Back, direct preview links, and hard reload passed.
The actual Renderer has no Game source, public diagnostics report simulation=false,
and no `window.__rts` exists in the preview. Native rendering is live and explorable,
with no simulation, AI, combat, or fog. The earlier native-play screenshots record
the separate normal-game regression; the final admin action is Preview.
[Desktop preview](artifacts/maps/desktop-preview.png) and
[return diagnostics](artifacts/maps/desktop-preview-return.json) show the final flow.

Final default `npm test`: **255 passed, 19 optional skipped** (274 total).
Full original-asset/reference-enabled `npm test`: **273 passed, 1 skipped**.
Production `npm run build` (TypeScript and Vite): **passed**.
Logs are retained in this artifact directory. Cloudflare is configured with
[SPA fallback](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
so direct admin and preview routes receive the application entry document.
Map baseline `83d83d5684e231959e014a42205004f10c381680` on `main` was pushed and
verified successful in both the GitHub Workers Builds check and Cloudflare commit
metadata. [Build 97439af1](https://dash.cloudflare.com/9b1869e2c83a3ec33ecb5be77e0f0b19/workers/services/view/ra2-js/production/builds/97439af1-470f-4d9b-845e-0c49b8149bc7)
completed on 2026-09-14 at 02:10:15 UTC. The actual production
[Frostline preview](https://ra2-js.markl.workers.dev/admin/frostline-basin/preview)
loaded original artwork and all 18,336 cells, 468 ore cells, nine neutral buildings,
and six starts. Direct navigation, warm-cache hard reload, and Back to the selected
overview passed without application errors or a Game instance. All eight map HTTP
responses matched the accepted local SHA256 values. Remote build metadata, response
hashes, runtime diagnostics, and the production screenshot are retained as
`baseline-*` files in [artifacts/maps/](artifacts/maps/).
