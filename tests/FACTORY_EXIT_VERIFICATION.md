# War Factory emergence — ra2-js-7sa

Produced ground vehicles now start inside either War Factory, facing world +X
(screen southeast), and drive through the visible doorway at their normal unit
speed. Each factory delivers one vehicle at a time. A blocked exit retains paid
production; another clear owned factory can deliver it. After clearing the mouth,
vehicles follow their rally point or move forward to make room. Miners start
harvesting after departure. Ordinary movement still treats the factory as solid.

The short departure cannot be interrupted by move, stop, or deploy commands.
Factory sale/destruction lets the departing vehicle continue; Chronosphere
relocation cancels departure. Emerging Mirages remain visibly targetable.
Aircraft, naval production, and refinery-granted miners keep their existing routes.

## Original art and scope

The supplied `/tmp/ra2-n3q-mixes/art.ini` defines `Foundation=5x3`,
`UnderDoorAnim=GAWEAP_1/NAWEAP_1`, and `DeployingAnim=GAWEAP_2/NAWEAP_2`.
Those assets are already in the catalog and browser cache. Rendering now places
the bib and under-door piece behind a departing unit, then the foreground above
it. The complete factory body would obscure the doorway and is omitted from
that sandwich. Both layers share the existing ground anchor, palette, theater,
shadows, and animation clock. Their finite frame combinations remain cached.

Pixel inspection of the original SHPs establishes the exit on the +X face.
The lane runs from factory-relative `(3,1)` to `(5.5,1)`, aligned to the doorway
using this renderer's foundation-center origin. These are adapted ground points,
not a claim of native executable coordinate parity. The source rules specify
`ExitCoord=384,96,0` in the original engine's coordinate system. Ground doorway
pieces are static; roof-door animations are unnecessary for this behavior.

## Validation

- Eleven simulation regressions cover both factions, continuous movement,
  serial queues, blocked exits, alternate factories, traffic introduced during
  departure, solid foundations, rally/command handoff, miners, pause/speed,
  sale/destruction, Chronosphere relocation, and Mirage targetability.
- Renderer regression verifies `back → vehicle → front` exactly once, normal
  rendering after departure, and rendering after factory removal. Asset checks
  verify layer content, stable anchors, caching, and temperate/snow variants.
- Full suite: **521 passed, one production-tree fixture failure, 30 optional
  skipped**. That fixture packed buildings against the doorway and assumed
  instant delivery. It now reserves an apron and waits for serialized delivery;
  the affected file rerun passed **16/16**. All **522** enabled tests pass across
  the full run and affected-file rerun. Unaffected passing tests were not repeated.
- `npm run build` passed TypeScript and Vite. After the test-fixture edit,
  `npx tsc --noEmit` passed again. `git diff --check` passed.
- A bounded independent review found the Chronosphere and Mirage interactions;
  both were fixed and reviewed without outstanding findings.

## Browser evidence

Chromium reused the **974-file** original asset cache on the owned local server
at port 5183, bound to `0.0.0.0` with `omarky` allowed. A controlled training
arena used real production, fixed-step simulation, and the normal renderer.
Completed queue progress was accelerated for setup. The pause banner was hidden
in the diagnostic page to expose captured frames; product UI was unchanged.

At 1× simulation speed and 1.6× zoom, both tanks were concealed at 0.033 seconds,
partly visible through their doorways at 0.8 seconds, and outside on the ramps
at 1.667 seconds. At the default **Faster 2×** speed and normal 1× zoom, a second
tank waited for the first to clear, emerged through the same doorway, and both
followed the rally order. No browser JavaScript errors were recorded.

- [Inside the factories](artifacts/factory-exit-inside.png)
- [Partly through the doorways](artifacts/factory-exit-doorway.png)
- [Outside on the ramps](artifacts/factory-exit-outside.png)
- [Normal zoom, Faster 2×](artifacts/factory-exit-default-zoom.png)
- [Consecutive production](artifacts/factory-exit-consecutive.png)
- [Frame traces and final browser state](artifacts/factory-exit-browser.json)

Logs: `/tmp/ra2-7sa-{focused,render-tests,tests,tree-tests,build,typecheck}.log`.
Browser proof is a controlled training arena, not native executable parity or
an exhaustive test of every native map and vehicle silhouette.
