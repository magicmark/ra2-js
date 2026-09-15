# Project map visual audit — ra2-js-s9g

Audited 2026-09-15 against **`522691fea1975d79ae9ccaccbd23d22fa63aa588`**.
All nine playable project maps received original-asset visual inspection. Findings
are filed as **ra2-js-cwf**, **ra2-js-6lv**, and **ra2-js-aaa**. This change contains
audit evidence and reproduction helpers; it does not repair maps.

## Coverage and coordinate convention

Coordinates below are the unchanged **map/simulation `(x,y)` cell coordinates**,
not screen pixels, minimap coordinates, or player-start numbers. Training uses
zero-based x/y in a 64×64 array. Native coordinates are preserved from IsoMapPack5
in the 192×192 containing array; native Size=96×96 does not mean x/y each stop at 95.
Projection is `screenX=(x-y)*30`, `screenY=(x+y)*15` before camera/zoom:
**+x points southeast on screen; +y southwest**. Native template subtiles are
zero-based, row-major: `subTile=dy*columns+dx`. Detail labels identify camera
centres; the report and JSON identify exact affected cells. Terrain heights are 0.

The inventory scans all **150,784 source cells** (8×18,336 native +4,096 training),
all **102 drill anchors**, every surviving paved-road template, and both road
centre lines. Native playable LocalSize contains 15,480 cells per map; the full
visual overviews also include the outer border. All 54 incomplete placements are
inside playable coverage. Native roads use only 293/294/295, never ending pieces.
All native maps have 12 drills, six starts, six oil derricks and three airports.

| Playable map/source | Theater | Road-art cells | Incomplete templates | Drill overlap | Inspected overview / every drill |
|---|---|---:|---:|---:|---|
| Field Command, `src/game/map.ts` (`/`) | Temperate |169|14|1/6|[overview](artifacts/map-visual-audit/training.png) / [6 drills](artifacts/map-visual-audit/training-drills.png)|
| `public/maps/emerald-divide.map` | Temperate |0|0|0/12|[overview](artifacts/map-visual-audit/emerald-divide.png) / [12 drills](artifacts/map-visual-audit/emerald-divide-drills.webp)|
| `public/maps/frostline-basin.map` | Snow |0|0|0/12|[overview](artifacts/map-visual-audit/frostline-basin.png) / [12 drills](artifacts/map-visual-audit/frostline-basin-drills.webp)|
| `public/maps/saffron-wash.map` | Temperate |0|0|0/12|[overview](artifacts/map-visual-audit/saffron-wash.png) / [12 drills](artifacts/map-visual-audit/saffron-wash-drills.webp)|
| `public/maps/ironwood-crossing.map` | Temperate |321|9|0/12|[overview](artifacts/map-visual-audit/ironwood-crossing.png) / [12 drills](artifacts/map-visual-audit/ironwood-crossing-drills.webp)|
| `public/maps/slatewater-reach.map` | Urban |319|23|0/12|[overview](artifacts/map-visual-audit/slatewater-reach.png) / [12 drills](artifacts/map-visual-audit/slatewater-reach-drills.webp)|
| `public/maps/copperhead-mesa.map` | Temperate |0|0|0/12|[overview](artifacts/map-visual-audit/copperhead-mesa.png) / [12 drills](artifacts/map-visual-audit/copperhead-mesa-drills.webp)|
| `public/maps/whiteout-causeway.map` | Snow |0|0|0/12|[overview](artifacts/map-visual-audit/whiteout-causeway.png) / [12 drills](artifacts/map-visual-audit/whiteout-causeway-drills.webp)|
| `public/maps/tidal-crown.map` | Urban |305|8|0/12|[overview](artifacts/map-visual-audit/tidal-crown.png) / [12 drills](artifacts/map-visual-audit/tidal-crown-drills.webp)|

The [catalog](../src/game/maps/catalog.ts) and tracked-file search agree: exactly
these eight `.map` files, no additional tracked `.mpr`/`.yrm`/`.map` files. Each
catalog map is viewable at `/maps/<slug>/preview` and playable via `/?map=<slug>`.
The generated Field Command map is the training battlefield, not a tenth map.

### Excluded fixtures and other map-shaped data

| Source | Exclusion from playable-map coverage |
|---|---|
| [reference-map.json](artifacts/maps/reference-map.json), opt-in `RA2_REFERENCE_MAP` in [native-map-acceptance.test.ts](native-map-acceptance.test.ts) | Historical hash/codec evidence for third-party CnCNet **Snow Valley**, 98×99, 19,305 cells. The actual external `.map` is not bundled or cataloged. No external-reference path was supplied in this run; its optional decoder check is skipped. Not a project-authored playable map. |
| [terrain-topology.test.ts](terrain-topology.test.ts) | Synthetic 12×12 and 5×5 NativeCell grids testing shoreline/LAT masks, with no playable starts or authored scenario. |
| [renderer-originals.test.ts](renderer-originals.test.ts) | Synthetic 1×1, 2×1, 10×10 rendering states and one-cell `Preview` NativeMap (declared 96×96) using mocked sprites; pipeline fixtures, not complete maps. Catalog-based cases in this file reuse the eight covered maps. |
| [tile-seams.html](tile-seams.html) | Synthetic 128×128 uniform/two-color map testing fractional-zoom coverage with generated tile artwork. Not original terrain or a playable scenario. |
| [terrain-contact.html](terrain-contact.html), [asset diagnostics](../src/assets/diagnostics.html), [asset-test-fixtures.ts](../src/assets/asset-test-fixtures.ts), `src/assets/fixtures/selected-art-pre-native.txt` | Asset contact sheets, fake canvas/binary fixtures and an asset-name list; no authored map layout. |
| [native-maps.test.ts](native-maps.test.ts), [nativeMapWriter.ts](../scripts/nativeMapWriter.ts) | Compression byte arrays/malformed streams and deterministic regeneration of the same eight catalog maps; no extra playable fixture. |
| Other tests constructing `new Game()` or mutating tiles/entities | Reuse Field Command or covered catalog maps, then change state to isolate gameplay behavior; not separately selectable project maps. |
| `tests/artifacts/maps/*.json` and earlier screenshots | Prior coverage/cache/production reports, not additional maps. Temporary archives, historic `/tmp` audit files and other checkouts are outside this repository's playable inventory. This report does not certify them. |

## Findings

### ra2-js-cwf — training drill on the road

At **(22,51)**, one of six training drills stands on original **294/subtile0**,
`proad02.tem`; the road is x=22..24. [Training details, upper left](artifacts/map-visual-audit/training-details.png)
show the drill occupying the asphalt. All other 101 drills visually inspected are
on non-road ground; the 96 native drill anchors also have no pavement overlap.

[DEFAULT_ORE_MINES](../src/game/oreMines.ts) hard-codes the position. Initialization
changes collision `terrain` and `nativeArt.terrain` to rock but retains tileIndex294.
[Renderer.terrainSprite](../src/render/Renderer.ts) therefore continues drawing road
art. Relocate the drill onto suitable ore-field ground and check artwork IDs both
before and after initialization; semantic terrain alone misses this defect.

### ra2-js-6lv — partial streets and unintended interruptions

There are **54 incomplete original road-template placements**, not 54 separate
roads. A placement is counted only when surviving road subtiles identify a
three-cell template whose other cells were replaced. Complete missing templates
and square ends are not counted by this metric. The JSON enumerates every anchor
and missing cell, so the sample views below are actionable beyond the screenshots.

| Map | Exact affected cells / source-grounded observation | Detail evidence |
|---|---|---|
| Training |14 `proad02` anchors `(22,y)`, y=20..25 and 34..41: x=24 replaced by 493 (sand). Intended crossing near(23,30) is erased. At centreline y=30, road remains only x=5..21 and 44..58; x=23 road remains y=18..25 and 34..54. |[training](artifacts/map-visual-audit/training-details.png)|
| Ironwood |9 `proad01` anchors `(x,94)`, x=123..131: y=94 strip survives, y=95..96 replaced by paving. Isolated short road at(95,132) abuts a clearing. |[Ironwood](artifacts/map-visual-audit/ironwood-crossing-details.png)|
| Slatewater |17 `proad02` anchors `(94,y)`, y=123..139: only x=94 survives. Six additional coastal fragments at anchors(94,56),(94,57),(118,94),(119,94),(130,94),(131,94). |[Slatewater](artifacts/map-visual-audit/slatewater-reach-details.png)|
| Tidal |8 `proad02` anchors `(94,y)`, y=132..139: only x=94 survives beside cleared ground. Separate road gap around(123,95) is visible among paved neutral pads. |[Tidal](artifacts/map-visual-audit/tidal-crown-details.png)|

Training draws roads before [shoreline/buffer placement](../src/game/maps/terrainTopology.ts).
The buffer replaces final artwork without rebuilding streets. The native
[generator](../scripts/generateMaps.ts) skips individual road cells for shores/base
reserves, then overwrites roads with ore clearings and neutral building pads.
There is no final road reconciliation. Preserve full template widths and reroute
or reconnect intended streets after these passes. Do not treat every intentional
road-to-pavement entrance as a defect; the narrow strips and jagged shore contacts
are the confirmed visual problems. The training crossing also needs an intentional
layout decision rather than connecting roads blindly through water.

### ra2-js-aaa — original end pieces omitted

All four road-bearing maps terminate ordinary straight pieces abruptly. Confirmed
examples: training(5,30),(58,30),(23,18),(23,54); Ironwood(95,52),(139,95);
Slatewater(139,95); Tidal(95,54),(137,95). Complete centreline runs and surrounding
tile IDs are in [inventory.json](artifacts/map-visual-audit/inventory.json).

Original `temperat.ini` and `urban.ini` define **[TileSet0036], Paved Road Ends,
FileName=p_end, TilesInSet=4**, native IDs 445..448. `snow.ini` uses
**[TileSet0038]**, IDs 430..433. Temperate endings weather into ground, Snow endings fade under snow, and Urban
endings have a raised curb/barrier. Use the matching theater artwork. Direct decoded TMP views below join each ending to three
matching straight pieces, making orientation verifiable rather than inferred
from filename order. Metadata includes all 12 original file SHA256 values.

| Original file stem | Temperate / Urban ID | Snow ID | Template dimensions | Road terminates toward | Matching straight |
|---|---:|---:|---|---|---|
|p_end01|445|430|1×3|+x / screen southeast|proad01 (293)|
|p_end02|446|431|3×1|-y / screen northeast|proad02 (294)|
|p_end03|447|432|1×3|-x / screen northwest|proad01 (293)|
|p_end04|448|433|3×1|+y / screen southwest|proad02 (294)|

[Temperate joins](artifacts/map-visual-audit/original-endcaps-joins.png),
[Snow joins](artifacts/map-visual-audit/original-endcaps-sno.webp),
[Urban joins](artifacts/map-visual-audit/original-endcaps-urb.webp).
The approach is opposite the termination vector. Preserve every subtile of the
whole template; do not rotate the image or reuse one subtile three times.

[theater.ts](../src/game/maps/theater.ts) and [asset selection](../src/assets/catalog.ts)
omit these end pieces, and both generators place only 293..295. Add original tile
lookup/selection and correctly oriented complete ending templates at intentional
endpoints. Coordinate placement with topology repair so broken strips are not
merely capped in place. No ending exists to inspect on the five road-free maps.

## Method, reproduction and limitations

Original `ra2.mix`, `language.mix`, and `theme.mix` were imported into Chromium
through the Map Viewer; AssetManager reported ready with 999 files. The audit used
the repository renderer and theater palettes, not colored terrain stand-ins.
Native previews draw actual terrain, ore, trees, drills and neutral structures.
Training uses a paused initial `Game({ai:false})`, existing starting entities,
full explored/fog arrays, and the actual game renderer. Its overview alone bypasses
camera constraints to fit; no simulation ticks or broad map edits were made.

Every map was inspected in full overview (native 23.09%, training 35%). All 102 drills
were inspected at 100%; four detailed street views per affected map document the
representative defects. This is complete **map and drill coverage**, not a claim
that every one of 150,784 cells received individual 100% pixel inspection. Large-scale
coasts, material transitions, scenery and neutral placements were reviewed in the
overviews; no additional confirmed visual defect was identified there. Small
isolated seams may be missed. Arbitrary gameplay/AI/fog states, animation frames,
mobile rendering, native game/FinalAlert execution and third-party maps were not
visually audited. Road-to-pad design intent remains a layout decision.

Road/drill data checks use final original artwork IDs, including after training
initialization. They deliberately do not infer correctness from collision terrain.
Original INI IDs and TMP hashes are read from the local retail archive. The audit
uses the project's native decoder; the selected validation also runs the existing
independent liblzo2/LCW and original-TMP checks on all shipped maps. Proprietary
archives and raw asset files are not committed; screenshots are review evidence.

From repository root, reproduce the inventory:

```sh
node_modules/.bin/esbuild tests/artifacts/map-visual-audit/audit-data.ts \
  --bundle --platform=node --outfile=/tmp/map-audit.cjs
RA2_ASSET_DIR=/path/to/original-mixes node /tmp/map-audit.cjs > /tmp/map-audit.json
npm run dev -- --host 0.0.0.0 --port 5174
```

`vite.config.ts` already allows `omarky`. In a 1440×1200 Chromium viewport at
`http://omarky:5174/maps/ironwood-crossing/preview`, import originals, then run:

```js
window.capture = await (await import('/tests/artifacts/map-visual-audit/browser-capture.js')).install();
capture.overview('training'); // or any catalog slug; take screenshot
capture.details('training'); // also ironwood-crossing, slatewater-reach, tidal-crown
capture.drills('training'); // or any catalog slug; all anchors are labeled
// Choose ra2.mix in the diagnostic file chooser, then:
capture.ends('tem'); // repeat 'sno', 'urb'; direct original TMP decoding
```

The capture helper preserves actual pixels and adds coordinate labels outside each
view. Drill WebP captures use quality 90. Renderer instances use separate canvases;
an intermediate diagnostic shared-canvas attempt produced blank native details,
was rejected on inspection, and was replaced before evidence was saved here.
Reload removes the diagnostic interface. [Source hashes and inventory](artifacts/map-visual-audit/inventory.json)
identify the audit input; historical `/tmp` audit outputs were not accepted as
current baseline evidence.

## Validation

- Initial `npm run build` **failed** with TS2345 at the new, audit-owned
  `tests/artifacts/map-visual-audit/audit-data.ts:40`: readonly `Vec2[]` was passed to
  a mutable `any[]` parameter. Corrected the parameter to `readonly any[]`.
- `npm run build` rerun: **passed**, TypeScript and Vite.
- The sandboxed Vitest attempt stalled in a Python decoder subprocess and was
  interrupted. The same five suites rerun with local subprocess access and a
  two-minute timeout: **61 passed, 1 optional external-reference test skipped**.
- Suites: native-maps, native-map-acceptance (with original MIX assets),
  terrain-topology, ore-mines and renderer-originals. These passing tests do not
  assert road endings/template completeness/drill-on-art overlap; the three bugs
  call for those targeted regression checks during their fixes.
- Exact-commit Cloudflare build verification and final ticket closure are recorded
  in Beads after the audit commit is pushed; they cannot be embedded in their own
  commit without changing its SHA. See the final handoff for the check URL.

[Validation record](artifacts/map-visual-audit/validation.json).
