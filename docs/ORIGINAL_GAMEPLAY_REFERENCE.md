# Original Red Alert 2 visual reference

Researched 2026-09-13 against the original base game. The target is retail Red Alert 2, not Red Alert 1, Yuri's Revenge, OpenRA, Chrono Divide, or a mod. Search results included those and pre-release screenshots; they were excluded from the visual target.

## Sources inspected

| Source | Evidence inspected | Local research copy |
| --- | --- | --- |
| [Allied campaign screenshot](https://screens.16bit.pl/red-alert-2/5.jpg), via [game gallery](https://abandonwaregames.net/game/red-alert-2) | 800×600 gameplay; Allied sidebar, cameo proportions, buildings and infantry | `/tmp/ra2-references/allied-snow.jpg` |
| [Soviet gameplay screenshot](https://multiplayer.net-cdn.it/thumbs/images/2001/04/30/17330.command--conquer-red-alert-2.bvegi_jpg_800x0_crop_upscale_q85.jpg), via [2001 game gallery](https://multiplayer.it/giochi/command-conquer-red-alert-2-per-pc.html) | 800×600 gameplay; Soviet chrome, radar, power bar, black shroud | `/tmp/ra2-references/soviet-beach.jpg` |
| [Allied unit formation screenshot](https://retro.gg/image/screenshot/3424-command-conquer-red-alert-2-e6aeafef-36e0-4ce5-abc6-021d6415efb4.png/1280), via [game gallery](https://retro.gg/game/command-conquer-red-alert-2/3424) | Tanks, infantry, aircraft, directional silhouettes, trees, roads; 1280×960 is a scaled image, not a native geometry reference | `/tmp/ra2-references/allied-units.png` |
| [Allied base screenshot](https://www.chucksgame.com/ii/s-command-conquer-red-alert-2-1473.jpg), via [game gallery](https://www.chucksgame.com/game-command-conquer-red-alert-2) | Inactive radar displays faction emblem; structures on pavement, selected building | `/tmp/ra2-references/allied-base.jpg` |
| [RedAlert2Havoc: Allied mission 1, Lone Guardian](https://www.youtube.com/watch?v=LyygS_XHfQQ) | YouTube gameplay storyboard frames; sheets 2 and 3 cover approximately 04:07–06:11 and 06:11–08:14. Confirms progressive scouting into black shroud, fixed narrow sidebar, unobstructed tactical view. | `/tmp/ra2-references/video-storyboard-2.jpg`, `video-storyboard-3.jpg` |

The video was published 2017-03-09, runs 08:44, and identifies the base-game Allied campaign. Its description says the game was configured at 1920×1080 and the video rendered at 1280×720. Sample times are derived from the video's storyboard metadata (approximately 4.9434 seconds per frame). Actual downloaded frame samples were visually inspected; the full-motion video request returned HTTP 403. These samples establish layout and scouting behavior, not precise animation timing or movement quality.

The [durable gameplay sample sheet](../tests/artifacts/fidelity/gameplay-video-samples.png)
shows inspected storyboard samples at metadata-derived times **04:07.17,
05:06.49 and 06:05.81** (global sample indices 50, 62 and 74). The native
160×90 samples are enlarged 2× with nearest-neighbor scaling. They show the
camera moving through the city, progressive black shroud and a fixed narrow
sidebar; they are not full-resolution frame captures or full-motion playback.

The [CNCNZ gallery](https://cncnz.com/gallery/red-alert-2-screenshots/) specifically identifies its images as alpha/beta/pre-gold. It was deliberately not used as the retail sidebar target.

## Acceptance criteria from the images and original archive

- Sidebar is 168 native pixels wide and starts at the top-right corner. At 800×600 the tactical viewport ends around x=632. Increasing the game resolution shows more battlefield; it does not turn the sidebar into a 296px dashboard.
- No full-width top title/resource bar, persistent mission-card overlay, or introductory text panel covers gameplay. Credits are in the sidebar's upper black inset. There is a thin original command strip, approximately 30px high, under the tactical view.
- Allied chrome is curved silver metal with illuminated blue controls. Soviet chrome is gold/brass with red controls. Radar sits above repair/sell and four compact build-category icons.
- Original cameos are 60×48, in two tightly packed columns. Unit names are in the image. Costs belong in hover information. Empty slots retain the black inset frames; there are no separate descriptions or large cards.
- Radar unavailable shows the faction emblem. An active radar has a black surround and displays only the explored map; it does not start live before the radar structure exists.
- Unexplored terrain is black with a feathered boundary. Starting-base screenshots naturally have less revealed terrain than mid-mission screenshots. Never reveal the map to make a screenshot fuller.
- Preserve the native 60×30 isometric cell size and pixel rendering. Infantry is small against tanks; tanks must retain visible hull, turret, tracks and directional silhouette. Foundation/bib pieces must connect to the building rather than be missing or independently offset.
- Selection graphics are thin and compact, with small health bars. Large translucent circles, giant bars and permanently drawn unit routes are not the reference appearance.
- Map terrain has coherent grass, pavement, roads, trees and irregular ore patches. Authenticated original sprites should be used consistently in production cameos, battlefield art and placement previews.

## Baseline discrepancies

Compared `/tmp/ra2-fidelity/before-original-1280x800.png`, an Allied starting base after original assets finished loading:

1. 296px sidebar plus 64px title bar, large briefing/title overlays and large cards consume tactical space. Original sidebar chrome is absent.
2. Cameos are cropped/upscaled within cards; each card repeats name and price beneath the art.
3. The radar is live before a radar structure is built. The shroud/background is green-black and has hard diamond stair-steps.
4. Building SHPs are recognizable, but some foundations/layers are missing. The Grizzly appears flat and noisy, and vehicle silhouette/lighting are weaker than the reference voxels.
5. Before extraction completes, the game begins with geometric placeholder units and buildings and swaps them later. The loading state therefore presents the wrong appearance as gameplay.

Priorities sent directly to implementation agents: restore original sidebar and loading transition; fix vehicle composition and building foundations; replace shroud/selection styling and ensure original art in placement previews. This document is a reference and baseline audit, not a claim that all criteria are already satisfied.

## Original sidebar assets verified locally

Using the repository MIX/SHP decoder against the existing original `ra2.mix`, `sidec01.mix` and `sidec02.mix` each contain 51 entries. Identical filenames need faction namespaces and the corresponding `sidebar.pal`.

| File | Native geometry / use |
| --- | --- |
| `credits.shp` | 168×16 credit inset |
| `tabs.shp` | 168×16 upper controls backing |
| `radar.shp` | 168×110, 33 frames; frame 0 faction emblem, frame 32 empty radar surround |
| `top.shp` | 168×32 menu chrome, y=16–48 directly below credits |
| `side1.shp` | 168×69 repair/sell and category surround |
| `side2.shp` | 168×50, repeated paired empty cameo slots |
| `side2b.shp` | 168×50, empty rails without slots |
| `side3.shp` | 168×26 lower scroll surround |
| `tab00.shp`–`tab03.shp` | Buildings, defenses, infantry, vehicles; 5 states each |
| `repair.shp`, `sell.shp` | Faction-specific shapes, 2 states each |
| `power.shp`, `powerp.shp` | Original power indicator components |
| `diplobtn.shp`, `optbtn.shp` | Left arrow / right two-circle menu controls; normal frame 0, pressed frame 1 |
| `r-dn.shp`, `r-up.shp` | Left down / right up scroll controls; enabled 0, pressed 1, disabled blank 2 |
| `addon.shp` | Lower sidebar artwork beneath side3 |

`/tmp/ra2-references/sidebar-contact.png` visually catalogs the archive entries, including unidentified filename hashes. Original `local.mix/ui.ini` lists the default command-strip order: Team01, Team02, TypeSelect, Deploy, Guard, PlanningMode; multiplayer adds Beacon.

Direct measurement corrected the initial contact-sheet interpretation: credits
occupy y=0–16, `top.shp` y=16–48, radar y=48–158 and `side1.shp` y=158–227. The
native 72×18 Allied menu pieces are `diplobtn.shp` / MIX hash `0x4a2edf14`
on the left and `optbtn.shp` / `0xfe67e97e` on the right. Category frame 1 is selected and frame 2
is disabled; showing every category as active does not match the reference.

The [strict native sidebar comparison](../tests/artifacts/fidelity/sidebar-original-comparison.png)
puts the original 800×600 screenshot and the 217-file build at identical pixel
scale. It caught reversed upper menu buttons and missing disabled scroll
overlays after the main geometry had been restored. The original 46×25 Allied
scroll halves begin at (38,7) and (84,7) inside `side3.shp`, extending six pixels
over the lower add-on. Their blank disabled state is dark blue; the exposed
background or pressed state is not an acceptable substitute. This comparison
is a review checkpoint pending the final 221-file menu/scroll integration.

## Vehicle rendering and palette audit

Original `rules.ini` confirms `[MTNK] Image=GTNK` for the Grizzly and `[CMIN]`
for the Allied Chrono Miner. The original files were already selected; the pale,
flattened appearance exposed renderer defects. Directional comparison showed
that 2×2 voxel stamps obscured tracks and broadened small details, while the
initial overhead light pushed roof normals into white material highlights.

The correction uses original `voxels.vpl` and authored normal indices from the
[RA2 normal table in OpenRA](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Cnc/Traits/World/VoxelNormalsPalette.cs).
The VPL diffuse/specular calculation, native pixel projection and nonlinear HSV
remap are documented in [Thomas Sneddon's renderer shader](https://github.com/ThomasSneddon/vxl-renderer/blob/master/shaders.hlsl).
Its [default light configuration](https://github.com/ThomasSneddon/vxl-renderer/blob/master/d3d.h)
provides direction `(0.2013022, -0.9101138, -0.3621709)` before model-to-map Y
inversion. This is a reconstruction supported by source and visual comparison,
not a claim of bit-identical retail rendering under every map's ambient light.

Original `rules.ini [Colors]` defines DarkBlue as HSV `153,214,212` and DarkRed as
`0,230,255` on its 0–255 scale. Both SHP and VXL now use those colors and the
nonlinear ramp, preserving the non-remapped body palette. Existing caches lacking
VPL expose missing artwork; their compatibility rendering retains approximate
normal shading instead of completely unlit raw colors.

The asset audit now covers 217 extracted files and 922 real sprite variants.
All decode without diagnostics and the full fixture has no missing artwork. The
asset handoff passed 68 tests with the original fixture. Native contact sheets
and actual Chromium WebGL unit crops are linked from
[ASSET_VERIFICATION.md](../tests/ASSET_VERIFICATION.md); browser interaction and
layout results are in [FIDELITY_VERIFICATION.md](../tests/FIDELITY_VERIFICATION.md).

## Original building animation

The Barracks flag is present in `GAPILE_A`, whose original healthy loop starts at
0, ends before 15 and uses Rate 300. Damaged frames start at 16. Previously every
building overlay was pinned to frame 0. The new building-sprite API reads the
authored looping sections and reuses discrete cached composites. Production-only
sequences such as `GACNST_B` do not run as idle loops. The selected ranges and
timing fields come directly from the original fixture's `art.ini`.

A 60-second native audit found 15 Barracks states and a maximum of 45 combined
states for any building. The original flag visibly changes while its foundation
stays in place, and the completed cycle reuses the first canvas. Static previews
and Sentry Gun facing remain separate from idle animation playback.

The original `art.ini` animation-field comments describe `Rate` as desired frames
per minute, with default 900. The exact integer tick delay is taken from the
[community's documented Rate reconstruction](https://modenc.renegadeprojects.com/index.php?title=Rate&oldid=29952),
and the exclusive end boundary from its
[LoopEnd research](https://modenc.renegadeprojects.com/index.php?title=LoopEnd&oldid=25223).
A [firsthand animation timing test](https://ppmforums.com/topic-37188/rubble-expansion/)
also reports three played frames for start 0/end 3 and one frame every two ticks
for Rate 450. No retail engine source was available to inspect. Mapping those
ticks to 60 ticks per simulation second is this recreation's timing adaptation;
the screenshots establish correct frame content and anchoring, not exact timing
at every original game-speed/Normalized setting.
