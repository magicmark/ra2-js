# Rhino and Carrier lighting — ra2-js-sra

## Original data and fix

The supplied `/tmp/ra2-8vl-mixes/ra2.mix` contains these models in `local.mix`:

| Model | VXL normal type | Voxels | Finding |
| --- | ---: | ---: | --- |
| `htnk.vxl` | 2 | 4,816 | Rhino hull uses the 36-direction TS table |
| `htnktur.vxl` | 2 | 1,501 | Rhino turret also uses TS normals |
| `htnkbarl.vxl` | 4 | 155 | Rhino barrel uses RA2 normals |
| `carrier.vxl` | 4 | 19,247 | 74 voxels use normal index 244 |
| `hornet.vxl` | 2 | 583 | Carrier aircraft use TS normals |

The decoder discarded the normal-type footer byte and the renderer always used
RA2 directions. It now retains that byte and selects the table per limb. The RA2
table had only 244 entries (indices 0–243); index 244 now has its authored direction
instead of falling back to straight up. Existing VPL lighting, palettes, HVA
transforms, projection, depth, team remap, shadow geometry and sprite anchors stay
in the same code path. There are no unit-name lighting overrides.

Both tables were checked against static reads of the supplied installer's
`game.exe`: SHA-256 `06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb`.
The TS table at file offset `0x3fa068` and RA2 table at `0x3fa518` match all 36 and
245 directions exactly as float32 values. Normal 244 is
`(-0.328188, 0.140251, 0.934143)`. This is the same modified RA2 1.08 executable
used in [the native timing reference](../docs/NATIVE_SPEED_REFERENCE.md), not a
claim about an unmodified retail binary. The installer was opened with 7z-wasm;
the executable was never run. No original binary or game asset was added to Git.

Original `art.ini` `[HTNK]` and `[CARRIER]` declare voxel artwork without an active
lighting override. Rhino `UseTurretShadow=yes` is commented out. Neither model
uses paired SHP shadow frames, and no `carriertur.vxl`/`carrierbarl.vxl` was found
in the supplied nested MIX inventory. The existing projected voxel shadows
therefore remain appropriate to this fix. `voxels.vpl` supplies the original
32×256 material lookup and `unittem.pal` supplies material colors. The common
`ExtraUnitLight=.2` rule is not a unit-specific cause and was not changed.

[Original asset metadata, hashes and native-table comparison](artifacts/voxel-lighting/original-data.json)
records the inspection. Public format cross-checks:
[OpenRA's per-limb type byte](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/FileFormats/VxlReader.cs),
[TS normal directions](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/Traits/World/VoxelNormalsPalette.cs),
and [the complete RA2 table](https://github.com/ThomasSneddon/vxl-renderer/blob/master/normals.h).

## Visual verification

Chromium loaded all 1,013 selected original files from the supplied MIX archives
at `http://omarky:5193` (Vite bound to `0.0.0.0`, `omarky` allowed). The baseline
is release `11c0573`. The screenshots use the same source assets and facing,
with nearest-neighbor enlargement; the contact sheet Carrier row is 1× and the
other rows are 2×.

- [Before](artifacts/voxel-lighting/before.png) / [after](artifacts/voxel-lighting/after.png): eight facings, Rhino, Carrier, Hornet and Grizzly control.
- [Live Rhino](artifacts/voxel-lighting/rhino-live.png): existing Soviet tank, facing 12, 2× battlefield zoom.
- [Live Carrier](artifacts/voxel-lighting/carrier-live.png): staged on original water artwork at `(33.5,25.5)`, facing 20, 2× zoom.
- [Pixel measurements](artifacts/voxel-lighting/pixel-comparison.json): all 32 comparisons preserve alpha, bounds and anchors.

Rhino roof/armor shading now follows its authored TS directions consistently
as it turns, and Hornet panels receive the same format correction. Carrier hull
changes are deliberately subtle: 0–35 visible pixels per sampled facing, confined
to the missing direction. Its dark runway is authored using dark material indices
(e.g. 61); it was not repainted or globally brightened. The Grizzly retains its
previous lighting, with only three pixels across the eight sampled images affected
by the shared index-244 correction. This preserves the earlier released lighting
and gameplay fixes.

Battlefield captures use the normal WebGL renderer. QA alone revealed fog,
centered/zoomed the camera, spawned the Carrier, and froze simulation ticks while
allowing normal rendering to continue. No production rendering code was patched
for screenshots. Browser asset diagnostics and JavaScript errors were empty;
Chromium reported only software-WebGL/readback performance warnings. These checks
establish correct use of original artwork and native normal data, not pixel parity
with a running retail engine under every map's lighting.

## Validation

- `npm test -- --maxWorkers=2`: **633 passed, 38 skipped** (67 files passed, 3 skipped).
- `RA2_ASSET_DIR=/tmp/ra2-8vl-mixes npm test -- src/assets/VoxelLighting.test.ts src/assets/formats.test.ts src/assets/original-assets.test.ts src/assets/IFVArtwork.test.ts tests/carrier-range.test.ts tests/facing.test.ts tests/renderer-originals.test.ts --maxWorkers=2`: **42 passed**.
- `npm run build`: TypeScript and Vite passed; existing 7z-wasm externalized-module warning only.
- Scoped `git diff --check`: passed. Unrelated existing AGENTS.md whitespace was preserved.
- Independent Astra high read-only review: no actionable findings.

Tests exercise header decoding, mixed normal formats in one rendered vehicle at
four facings, the final RA2 index, sprite caching and exact original model
metadata. Release SHA and exact-SHA Cloudflare check evidence are recorded in
Beads `ra2-js-sra` after push.
