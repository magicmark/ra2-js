# IFV rockets — ra2-js-4my

IFVs now launch two visible rockets per burst. Each uses the supplied original
DRAGON sprite and pale trail, follows its target and applies damage with its
XGRYSML2 impact on arrival. Passenger weapon modes retain their existing behavior.
Ground force-fire keeps the commanded destination. Lost targets leave rockets
travelling to their last known point; destroying the IFV does not cancel its shots.

## Original assets

The supplied local MIX archives establish the chain
`rules.ini [FV] → HoverMissile → AAHeatSeeker2 → DRAGON`:

- `HoverMissile`: Burst=2, Speed=40; `FV` art: Weapon1FLH=64,48,180.
- `conquer.mix/dragon.shp`: 24×16 canvas with 32 facing frames, rather than a
  sequential playback animation. Its original unit-palette pixels are not remapped.
- `art.ini [DRAGON]`: Rotates=yes; default AnimPalette=no; UseLineTrail=yes;
  LineTrailColor=216,216,255; LineTrailColorDecrement=16. SMOKEY2 is disabled.

The normal extraction catalog now selects `dragon.shp`. Existing saved MIX
archives supply it through the optional artwork upgrade without a new download
or cache-format reset. No original asset binaries are committed.

## Verification

- Full suite: **478 passed, 30 optional skipped**, with `--maxWorkers=2`.
- Original assets: **11 passed** using `RA2_ASSET_DIR=/tmp/ra2-n3q-mixes` for
  `ProjectileArtwork.test.ts` and `original-loader.test.ts`. Checks compare every
  rocket frame's pixels and anchors, source INI values, and cached-archive upgrades.
- Tests cover delayed burst damage, moving/lost targets, shooter death,
  force-fire, airborne/landed targets and Rocketeer height, passenger modes,
  pause/restart, render interpolation, fog and palette/cache selection.
- `npm run build` passed. Its first final run found a typed-array parameter
  inference mismatch in the new test helper; an explicit type annotation fixed it.
- Chromium on `http://omarky:5183/` imported the supplied local MIXes through the
  normal importer: **974 selected files**. No network asset download was needed.
  A diagnostic arena stepped the real simulation at 30 Hz, with the ordinary
  renderer and original IFV/Rhino sprites. Automatic ticks were disabled only to
  capture stable frames. Four rockets launched at frames 1, 4, 56 and 61, and
  arrived at 32, 35, 87 and 92. Each dealt 8.75 damage to heavy armor; health stayed
  unchanged during flight. The first in-flight screenshot shows both rockets.
- No browser JavaScript errors. Existing software WebGL and canvas/screenshot
  readback performance warnings remain.

Evidence: [frame trace](artifacts/ifv-rockets-browser.json),
[rockets in flight](artifacts/ifv-rockets-flight.png),
[original impacts](artifacts/ifv-rockets-impact.png).

## Limits

This is an IFV flight model using constant speed in the project's 30-tick,
256-lepton cell clock, direct homing, alternating launcher offsets and a bounded
ten-second lifetime. Native acceleration, turn-rate and line-trail rasterization
have not been established as exact executable parity. Heights align with the
current unit renderer. Older artwork-only caches without reusable MIX archives
remain usable but need an original-file import to obtain the rocket sprite.
