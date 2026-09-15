# Visible Prism firing — ra2-js-2r7

Prism attacks now draw a house-colored beam with a bright core and thinner beams
from the hit point to the targets receiving secondary damage. Both Prism Tanks
and the existing shared Prism Tower weapon use this visual path. Ground
force-fire also draws a beam. Each attack still emits one original audio event.

## Source and preserved mechanics

The supplied `/tmp/ra2-n3q-mixes/rules.ini` defines `IsLaser=true`,
`IsHouseColor=true` and `LaserDuration=15` for `Comet`, `CometFragment` and
`PrismShot`. `LargeCometP` / `SmallCometP` specify `Inviso=yes`, `Image=none`;
these beams are procedural effects. No additional original sprite import or
cache upgrade is required.

The supplied `art.ini` provides `SREF.Weapon1FLH=48,0,184` and
`GAPRIS.PrimaryFireFLH=0,0,378`, `PrimaryFirePixelOffset=0,-4`. Firing points use
those values with the project's existing 256-lepton cell / 30-pixel height
projection. Duration uses the existing 30-frame simulation clock: 0.5 simulation
seconds, or 0.25 wall-clock seconds at the Faster 2x default.

Damage remains instantaneous. Tank damage=100, range=10, reload=100 frames plus
the existing random adjustment, armor verses, and current secondary selection
(up to three eligible enemies within two cells, half damage) are unchanged.
Native shrapnel counts/damage, elite weapon changes and charge-turret animation
are outside this visual fix. Width, glow, bright core and fade are approximations;
exact native laser rasterization has not been established. Beam destinations use
the current ground hit points. Both endpoints must be in current sight, and
snapshots never follow a moving or hidden contact.

## Validation

- Before the fix, five regression cases failed; the browser showed HP loss
  (950 primary; 975/975/950 secondary) with only an invisible shot event.
- Focused simulation/renderer checks: **24 passed**. Coverage includes duration,
  muzzle position, shared tower height, damage/selection exclusions, one audio
  event, reload, force-fire, position snapshots, pause/reset, house colors, zoom,
  fade, thinner branches, sight loss and off-map endpoints.
- Full suite: **509 passed, 30 optional skipped**, `npm test -- --maxWorkers=2`.
- `npm run build` passed TypeScript and the Vite production build; diff check passed.
- Chromium imported **974 files** from the supplied MIX archives, then reused the
  browser cache. A controlled arena used the real simulation and normal renderer.
  At Faster 2x, frame 1 emitted four beams and the same damage as before; beams
  remained at frame 15 and expired at frame 16 without extra damage. Frame 101
  fired again after the unchanged reload. Screenshots show 1.8× and default 1× zoom.
- With the primary target's cell hidden but explored, renderer line draws changed
  from **12 to 0**, and target visibility became false. Restoring sight restored
  all 12 line draws. No browser JavaScript errors were recorded.

Evidence: [browser state and timing trace](artifacts/prism-beams-browser.json),
[firing](artifacts/prism-beams-firing.png),
[default zoom](artifacts/prism-beams-default-zoom.png),
[expired pulse](artifacts/prism-beams-expired.png).

Local diagnostic logs and before screenshot: `/tmp/ra2-2r7-{before-tests,focused,tests,build}.log`
and `/tmp/ra2-2r7-before.png`. Browser proof covers a controlled training arena;
it does not claim native executable frame-for-frame parity.
