# Harrier airfield alignment — ra2-js-y76

Harriers previously used the generic factory exit and returned to the airfield
centre. They now spawn on individually reserved pads, keep those reservations
during sorties, and land on the same pads to rearm. An explicit landed state
keeps parked aircraft at ground height after production and after rearming.
Production selects an airfield with a free pad. Lost aircraft release their pad;
returning aircraft can claim another field when their home is lost.

## Original evidence

The original `ra2.mix` extraction at `/tmp/ra2-n3q-mixes` provides:

- `art.ini [GAAIRC]`: `Foundation=3x2`; docking offsets in leptons
  `(0,-128,0)`, `(0,128,0)`, `(256,-128,0)`, `(256,128,0)`.
- `rules.ini [GAAIRC]`: `NumberOfDocks=4`.
- `rules.ini [AudioVisual]`: `PoseDir=2`, meaning screen east.

At 256 leptons per cell, these offsets relative to the foundation centre put
aircraft in the four cells beside the tower. The optional original-data test
compares the shipped constants against these original INI fields.

## Validation

- Full suite: 463 passed, 29 optional skipped (`npm test -- --maxWorkers=2`).
  The initial concurrent run hit one unrelated five-second map-generation
  timeout; the reduced-worker run passed. Original-rules parity: 19 passed
  with `RA2_ASSET_DIR=/tmp/ra2-n3q-mixes`.
- Six simulation regressions cover spawning, stable parking, multiple airfields,
  reservations during flight, pad reuse, simultaneous return/rearm, repeated
  attacks, replacement homes, and temporary airfield disablement.
- The renderer regression verifies ground-height parking and airborne takeoff.
- Chromium imported the original MIX files through the normal asset importer
  (973 decoded files). A controlled diagnostic scenario used real production,
  movement, simulation and rendering on `http://omarky:5183/`.
- All four jets appeared on the painted pads, took off, then returned to their
  exact original coordinates with full ammunition and east-facing orientation.
  See the [runtime trace](artifacts/harrier-airfield-browser.json) and
  [parked aircraft screenshot](artifacts/harrier-airfield-parked.png).
- No browser JavaScript errors; existing WebGL software-rendering and canvas
  readback warnings remain. TypeScript and the production build passed.

This fixes parking within the existing flight model. It does not implement
animated ascent/descent or replace the existing flight collision model.
