# Native six-player map collection

Eight original maps live in `public/maps/*.map`; the typed application catalog is
`src/game/maps/catalog.ts`. These are normal FinalAlert2 / Red Alert 2 INI maps.
Their terrain is native chunked LZO1X `IsoMapPack5`; ore uses native Format80/LCW
`OverlayPack` and `OverlayDataPack`. No custom section substitutes for terrain.

| Map | Theater | Layout |
| --- | --- | --- |
| Emerald Divide | Temperate | Long parallel lakes, wide central saddle, green meadows |
| Frostline Basin | Snow | Separate glacial basins and broad connecting snowfields |
| Saffron Wash | Temperate | Sandy plain with braided dry washes and a small oasis |
| Ironwood Crossing | Temperate | Native paved crossroads, woodland belts, clear quadrants |
| Slatewater Reach | Urban | Harbor fingers and large inland industrial districts |
| Copperhead Mesa | Temperate | Flat mineral bands, sand shelves, radial open approaches |
| Whiteout Causeway | Snow | Twin lakes, broad central crossing, open outer routes |
| Tidal Crown | Urban | Crescent inlet with connected coastal parks and pavement |

Each map has `Size=0,0,96,96` (18,336 native diamond cells) and
`LocalSize=3,4,90,86`. “Medium” is a design choice, not a documented fixed RA2 size
class: 96 × 96 is close to the 100 × 100 six-player convention, with ample expansion
space without a 120 × 120 large-map footprint. The native dimensions describe an
isometric rectangle; they are not a 96 × 96 Cartesian tile array.

All six native waypoints have separated clear base areas, two identical nearby
ore fields (49 + 29 full-density ore cells per start), and access to the main land
component. Each map contains six Neutral `CAOILD` oil derricks and three Neutral
`CAAIRP` airports on original buildable terrain. Their retail foundations are 2 × 2
and 3 × 3 respectively. Multi-cell water, shoreline and road pieces preserve their
native subtile indices. Terrain heights remain flat; the mesa uses ground texture
bands and does not claim elevated cliffs.

## Application integration

`parseNativeMap(text)` in `src/game/maps/nativeMap.ts` reads the native files.
It supports original LZO dictionary matches and LCW literal, fill, relative and
absolute copy commands, bounds packed output, reads native coordinates and fills
omitted clear cells. The supported rendering/authoring theaters are Temperate,
Snow and Urban, using the original theater TMPs and palettes selected from MIX
archives. The parser preserves tile indices rather than substituting authored
terrain metadata for actual packed data.

`new Game({ map })` and `game.loadNativeMap(map)` feed decoded ground, ore, tree
obstacles, neutral structures and starting locations into the existing simulation.
`state.nativeMap` retains exact native cells for the renderer. Native x/y coordinates
remain unchanged in the simulation's containing 192 × 192 array; unused corners
and cells outside LocalSize are impassable.

The current browser skirmish still has two active sides and uses opposite native
waypoints 0 and 3. The downloaded files contain all six starts for six-player native
RA2 use. This work does not implement six-player multiplayer or additional AI sides.
Both tech types can be captured; oil grants its initial bonus and recurring income.
The browser does not implement the native airport paradrop superweapon.

## Reproduce and verify

Regenerate the checked-in maps with Node.js 22.12 or newer:

```sh
node --experimental-strip-types scripts/generateMaps.ts
npm test -- --run tests/native-maps.test.ts tests/native-map-acceptance.test.ts
```

The source writer uses genuine LZO1X dictionary matches for terrain and native LCW
fills/literals for overlays. Generation needs no game archives or compression
dependency. Normal map/game tests cover codec rejection of malformed streams,
deterministic reproduction, startup foundations, actual mining, engineer capture,
oil income, neutral visibility, restart and victory behavior.

Independent acceptance uses original theater INIs, actual TMP terrain bytes and
retail rules for passability/buildability, rather than the author's terrain labels:

```sh
RA2_ASSET_DIR=/path/to/mixes npm test -- --run tests/native-map-acceptance.test.ts
RA2_REFERENCE_MAP=/path/to/reference.map npm test -- --run tests/native-map-acceptance.test.ts
```

The optional independent decoder comparison additionally needs Python 3 and system
`liblzo2`. It compares every generated packed section against liblzo2/reference LCW
and can verify a separately sourced FinalAlert map. Original archives and the
external reference map are not bundled. QA records final per-map metrics and
browser evidence under `tests/artifacts/maps/`.

## Format and original-data references

- [Linux LZO instruction format](https://docs.kernel.org/staging/lzo.html), used to
  implement a bounded native LZO reader and dictionary writer.
- [OpenRA native LCW codec](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/FileFormats/LCWCompression.cs)
  documents the original command families and native terminator.
- The installed retail `temperat.ini`, `snow.ini`, `urban.ini`, `rules.ini`,
  `art.ini` and TMP headers provide exact tile indices, ore overlay order,
  movement/buildability flags and tech foundations. TMP terrain byte values are
  distinct from the rules land enumeration (e.g. Water 9, Beach 10, Road 11/12,
  Clear 13, Rough 14). Independent QA verifies that conversion.
