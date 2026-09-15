# Road topology repair — ra2-js-6lv

The four affected maps now have **zero incomplete road placements**, down from
54 in the [original audit](MAP_VISUAL_AUDIT.md). All 13 released original end caps
and their tests are preserved.

## Layout and visual acceptance

Road corridors reserve dry land before shore templates are built. The training
crossing is restored on a dry causeway separating the lake into two pools;
Slatewater's inlet approaches retain whole streets beside compatible shore art.
The shore pass still controls complete 2×2 templates and their ground borders.
Training restores road art after the shore's ground buffer is applied.

Native base exclusions now operate on whole three-cell road slices. Ore and
neutral pad clearings replace a touched road template completely, leaving paved
entrances instead of asphalt slivers. Southern streets end at the oil-site apron;
the stub at Ironwood `(95,132)` and strips toward the southern base are removed.
Pavement transitions may leave a clear shoulder beside unlike ground.

| Map | Reviewed overview | Reviewed 100% details |
|---|---|---|
| Training | [Full map](artifacts/road-topology/training-overview.webp) | [Crossing, causeway, both repaired vertical sections](artifacts/road-topology/training-details.webp) |
| Ironwood | [Full map](artifacts/road-topology/ironwood-crossing-overview.webp) | [Paved entrance, southern apron, crossing, preserved cap](artifacts/road-topology/ironwood-crossing-details.webp) |
| Slatewater | [Full map](artifacts/road-topology/slatewater-reach-overview.webp) | [Southern base, both inlet approaches, northern coastal road](artifacts/road-topology/slatewater-reach-details.webp) |
| Tidal | [Full map](artifacts/road-topology/tidal-crown-overview.webp) | [Southern base, paved tech entrance, crossing, preserved cap](artifacts/road-topology/tidal-crown-details.webp) |

Chromium used a 1440×1100 viewport, imported original `ra2.mix`, `language.mix`
and `theme.mix`, and the repository renderer with its original palettes. Training
is a paused initialized Game with fog revealed. The four overviews and sixteen
detail views were visually inspected. Screenshots were saved to `/tmp` and copied
into the repository; the screenshot connector cannot write repository paths.

Decoded changes versus `1ae1cd3`: Ironwood **34** cells, Slatewater **632** cells,
Tidal **8** cells. Starts and all ore overlays/densities are unchanged. Ironwood
and Tidal also retain all structures and terrain objects. Slatewater's wider dry
approaches let the existing site selector place oil sites nearer their intended
targets: `(85,74)` → `(91,72)` and `(126,104)` → `(126,97)`, and its eastern
airport `(113,100)` → `(115,96)`. Scenery regenerates around the new pads (34 → 35
terrain objects). All six starts retain access to all nine neutral sites. The five
road-free native files regenerate byte-for-byte unchanged.

## Validation

- `npm test`: **615 passed**, 37 optional fixture-dependent tests skipped.
- `npm run build`: TypeScript and Vite production build **passed**.
- With `RA2_ASSET_DIR=/tmp/ra2-8vl-mixes`, independent native acceptance:
  **9 passed**, 1 optional external-reference map test skipped. All eight catalog
  maps passed independent liblzo2/LCW decoding, original TMP land checks, base
  foundations, resource balance, broad land routes and neutral access. This run
  used authorized Python subprocess access.
- New [road topology tests](road-topology.test.ts) enumerate every original road
  subtile and every in-bounds shore subtile on all four affected maps, require dry
  ore-free full street widths, check paved centreline continuity and connected
  road/pad surfaces, and reject southern stubs. Existing road-end, native
  regeneration, simulation, shoreline and renderer suites all pass.
- [Validation data](artifacts/road-topology/validation.json) records final map
  hashes, decoded change counts and road runs. Exact-pushed-SHA Cloudflare build
  evidence is recorded in Beads after release.

To reproduce the visual views, start Vite (configured for `0.0.0.0` and `omarky`),
open `/maps/ironwood-crossing/preview`, and import the originals. Then:

```js
const capture = await (await import('/tests/artifacts/road-topology/capture.js')).install();
capture.details('training'); // repeat with each of the three native map IDs
capture.overview('training');
```

These are original-asset browser and decoded-data checks, not native RA2 engine
execution or a multiplayer balance playtest. The separate training drill ticket
ra2-js-cwf remains outside this repair.
