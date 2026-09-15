# The Butcher's and George acceptance

George's size, control and inspection behavior below is historical. See
[the current civilian verification](GEORGE_CIVILIAN_VERIFICATION.md) for ra2-js-pd7.

QA used actual Chromium at `http://omarky:5173/` and
`http://omarky:5173/?map=frostline-basin`, with cached original MIX artwork and the
four bundled generated PNGs. No original archives were added to the repository.

## Production and earlier sprite validation

The first-open gate stayed at time zero. The shop was available to the Allied
side; George reported `Requires The Butcher's`. Both additions were unavailable to
the Soviet side. Actual sidebar clicks built the 1,000-credit shop, then a canvas
click placed its legal 3×3 foundation. George unlocked and trained from the
Barracks for 650 credits, with 225 HP. This passed in both the procedural field and
the native snow map. A selected George completed a four-cell movement order.

The original armed role was explicitly superseded by the user's noncombat
inspector requirement. The following historical attack result validates the old
sprite integration only; it is not acceptance of the final intended behavior.
For that earlier combat check, QA retained the trained George in the actual native
game, placed a Conscript nearby, removed other nearby combatants, and advanced the
real simulation in bounded ticks. The canvas attack order produced `FireUp`, a
shot effect, and the native `PIFFPIFF` impact. The Conscript lost **54 HP**
(60 damage × 0.9 against flak). The application renderer displayed the generated
firing pose in the native scene. Earlier elapsed-time sampling lost its target to
ongoing combat; the bounded encounter avoids that harness timing issue.

All 32 actual loaded George frames were inspected against common ground lines.
The eight facings and two walking poses are distinct; firing directions match
their headings. The opaque foot offset ranges from −0.57 to +0.51 output pixels,
with no visible foot jump, neighboring muzzle fragment, or clipped north flash.

Destroying the shop during training held progress at 0.2197802198 and spending at
142.8571429 credits through four additional simulated seconds. Rebuilding the
shop resumed the same queue item to 650 credits and produced a second George.
New production was rejected while the prerequisite was absent. The yellow native
`On Hold` overlay was visible; the initially hidden written reason was reported
for correction before release.

Behavior evidence, measurements, and screenshots are in
[artifacts/butchers/](artifacts/butchers/). The early behavior images retain the
initial shop artwork; final visual acceptance is recorded separately after the
requested shorter building and native-style cameo captions are installed.

## Final noncombat inspector behavior

The actual native game trained the updated George and displayed the cyan radius,
link, and progress bars on him and his target, with a selected-unit panel explaining
the three-cell radius and ten continuous seconds. A wounded G.I. remained at
80 HP: rank was Recruit at 9.9667 seconds, Veteran at ten seconds, and Elite after
another complete ten seconds. Two gold chevrons and `Elite` status were visible.
Another twenty seconds did not exceed the cap or heal the unit.

Leaving range reset a five-second partial inspection. Moving George reset his
progress; a second George could not accelerate the same target. Ownership changes
and death cleared progress. Self, other Georges, buildings, and ineligible targets
received no rank. Actual commanded attack, force attack, force fire, and attack-move
checks produced zero damage and zero outgoing shot/impact effects. Movement still
worked. A separate controlled under-fire encounter reduced George from 225 to
177 HP while the Conscript stayed at 1,000 HP; George never acquired a target,
fired, or retaliated.

Both actual browser game modes crossed 240 simulation seconds with AI enabled and
`automaticSovietWaves=false`: no scheduled waves, warnings, or Soviet attack orders;
all original Allied structures retained their HP. Soviet economy and production
continued, including War Factory, extra miners, tanks, and radar. Explicitly enabled
waves retain focused test coverage.

The native yellow `On Hold` overlay and actual hover tooltip were visually checked.
The tooltip clearly states `Requires The Butcher's` and explains inspection rules.
See the `inspector-*` JSON and PNG files in the artifact directory.

## Final cameo captions

The final loaded 60×48 cameos use deterministic five-pixel bitmap capitals with
native white-to-gray ink, a black edge, and an opaque dark bottom strip. QA
literally read `BUTCHER'S` and `GEORGE` at native size and inspected a nearest-neighbor
4× comparison alongside original Power Plant and Barracks cameos. No clipping,
soft lettering, or old generated caption bleed remained.
[Native-size and enlarged comparison](artifacts/butchers/captions-final-native-comparison.png).

## Final building projection

QA independently decoded the shipped RGBA PNG with Python/zlib and fitted its
opaque foundation edges. The provider's documented projection correction gives
slopes **+0.500773 and −0.499227**, matching the camera's 60×30 diamond. Source edge
fit residuals are 0.422 and 0.373 pixels. The original PNG remains unchanged by
this runtime projection calibration. The roof's reported projected edge slopes
are approximately 0.468–0.489; its small residual is recorded rather than claimed
to be mathematically exact. Actual normal-zoom and 2× image review found a coherent
low-rise roof alongside original buildings.

An actual game overlay exposed a separate five-pixel upward foundation offset.
The corrected anchor now places the fitted front corner exactly 45 pixels below
the entity center. The front and side slab edges align with the real 3×3 grid.
The shortened shop is grounded correctly in both the procedural field and the
native snow game, with the final readable sidebar caption.

Evidence: [exact grid overlay](artifacts/butchers/world-final-grid-detail.png),
[procedural game](artifacts/butchers/world-final-procedural.png),
[native snow game](artifacts/butchers/world-final-native.png), and
[independent measurements](artifacts/butchers/world-projection-measurements.json).

## Final walking and release checks

The initial two-contact-pose loop looked like shuffling. The final provider uses
contact → passing → opposite contact → passing, 0.15 simulation seconds per pose
and 0.6 seconds per cycle. No PNG, facing mapping, movement speed, or inspector
rule changed. Independent browser review sampled all eight actual rendered
directions after a hard reload: correct stable facings, the expected contact/pass
sequence, equal 0.78125-cell travel over 0.6667 seconds at speed 1.171875, and no
new clipping or foot jump. QA also inspected that sequence and sampled moving
units in the actual game. The early north lane in QA's simultaneous fixture
correctly detoured around the Construction Yard; the independent clear-lane
fixture supplies the north-facing evidence.

[Final eight-direction pixels](artifacts/butchers/eight-facing-final-walk.png) and
[actual-provider samples](artifacts/butchers/eight-facing-final-samples.json).
The new inspection panel also fits at 390×844 without horizontal overflow and
visibly shows target/progress and reset rules:
[mobile inspection UI](artifacts/butchers/inspector-mobile.png).

With the final walking source frozen, the asset-independent `npm test` passed
**278 tests**, with **19 optional tests skipped** (297 total), and
`npm run build` passed. Logs are retained in the artifact directory.

The final original-MIX/reference-enabled suite passed **296 tests**, with one
optional test skipped, across 32 passing test files. This includes original
asset parity, real saved-MIX migrations, native maps, inspector behavior, wave
options, custom artwork, and the final projection/anchor/cadence checks.
