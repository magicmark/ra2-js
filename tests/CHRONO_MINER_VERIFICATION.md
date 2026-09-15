# Chrono Miner full-load return — ra2-js-bry

Full Chrono Miners teleport to an unoccupied, passable cell beside the nearest
operational friendly refinery, including captured Soviet refineries. They wait
when its perimeter is blocked. Teleportation needs no land route, resets render
interpolation, and hands off to the existing unload timer and harvesting cycle.
War Miners, manual movement and partial-load returns retain their land movement.

Original source: local retail `rules.ini` selects `WarpOut=WARPOUT` and
`WarpIn=WARPIN`; `art.ini` sets both to `Rate=120`. Decoding the original MIX SHPs
confirmed 21 departure and 10 arrival frames, each seven logic ticks long. These
assets now use the existing animation renderer and saved-MIX cache upgrade path.
The renderer's previously documented `Translucent=yes` blending limitation remains;
this change does not claim pixel-exact retail blending or add teleport audio.

## Verification

- Full suite: 577 tests passed, 35 optional tests skipped. All 12 original-archive
  checks passed separately with local MIX files.
- Focused simulation checks cover crossing impassable terrain, occupied/blocked
  docks, captured refineries, invalid refineries, unloading exactly once,
  resumed gathering, manual orders and War Miner movement.
- Original-archive loader checks decode the warp sprites and exercise upgrading
  a saved selection without them from cached MIX files without another download.
- Chromium at `http://omarky:5193/` imported the original ra2.mix, language.mix and
  theme.mix. With the automatic tick suspended for reproducible stepping, actual
  gathering filled the miner from 476 to 500. The next tick moved it from
  (22.5, 35.5) to (19.5, 35.5), with matching previous position and an empty path.
  Both original endpoint effects rendered. The existing timer deposited exactly
  500 credits once, then the miner drove back and resumed gathering.
- Inspected `/tmp/bry-warp.png` and `/tmp/bry-resumed.png` at default zoom.
  Runtime records: `/tmp/bry-browser-full.json`, `/tmp/bry-browser-warp.json`,
  `/tmp/bry-browser-resumed.json`.
- Read-only Astra high review found no actionable issues. Scoped whitespace
  review passed. TypeScript and Vite production build passed; existing 7z-wasm
  externalization warnings remain.

Test logs: `/tmp/bry-focused.log`, `/tmp/bry-originals.log`,
`/tmp/bry-tests-final.log`. Build log: `/tmp/bry-build.log`.
Two older integration assertions sampled nonempty cargo after a fixed interval;
these now observe harvesting throughout the interval because teleporting can
finish unloading sooner. Initial parallel map regeneration checks timed out;
the suite was rerun with two workers.
