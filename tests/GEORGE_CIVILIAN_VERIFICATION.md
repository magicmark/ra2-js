# George autonomous civilian — ra2-js-pd7

George remains trainable for 650 credits after The Butcher's. He cannot be selected
or commanded, ignores Barracks rally points, and wanders using normal passability
and collision handling. He pauses near friendly infantry or vehicles for three
simulation seconds, then walks again before inspecting another unit. Inspections
never change rank, health, damage or durability. Independent Spy veteran training
still works. Existing artwork and GI movement speed are retained.

## Verification

- 130 focused tests passed across eight files (two optional archive checks skipped).
  Coverage includes training on procedural and native maps, prerequisite loss,
  inspection dwell and resumption, invalid targets, target loss, multiple Georges,
  blocked wandering recovery, rejected orders, mouse/touch selection and select-all,
  noncombat behavior, independent veterancy, original roster parity and artwork.
  The initial input test used the wrong command API; switching to the real P
  keyboard binding passed all 36 input tests on rerun.
- TypeScript and production Vite build passed. The existing 7z-wasm browser
  externalization warning remains. Scoped diff review and whitespace check passed.
- Chromium loaded the original ra2.mix, language.mix and theme.mix on
  http://omarky:5187. The actual queue charged 650 credits and produced George
  with 225 HP, unselected, ignoring the Barracks rally point.
- For a controlled runtime check, that trained George and a GI were positioned
  on clear ground. George remained stationary for the three-second inspection,
  rejected selection/move/stop, then walked 2.34375 cells in two seconds. The GI
  remained rank 0 at 60 HP. Cyan inspection feedback appeared during the pause
  and disappeared when he resumed wandering. Runtime stepping used the real
  game tick, with the automatic frame tick suspended for reproducible captures.
- Measured loaded standing silhouettes across all eight facings: native GI
  26–31 visible pixels; George before 39–41, after 28–29. Reviewed the actual
  loaded Ready/Walk sprites side by side at 3× and inspected the battlefield
  during inspection and walking. The sprite PNG is unchanged; frame scale and
  anchors shrink together.

Local evidence: `/tmp/pd7-tests.log`, `/tmp/pd7-input-tests.log`,
`/tmp/pd7-build.log`, `/tmp/pd7-before-size.json`, `/tmp/pd7-after-size.json`,
`/tmp/pd7-browser-behavior.json`, `/tmp/pd7-sprite-comparison.png`,
`/tmp/pd7-inspecting.png`, `/tmp/pd7-wandering.png`.

The earlier promotion and player-movement acceptance in BUTCHERS_VERIFICATION.md
is historical and superseded by this ticket. Touch input was checked through the
DOM handlers in tests; physical mobile hardware was not tested.
