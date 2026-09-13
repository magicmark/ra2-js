# Native Options evidence and bounded implementation plan

The current Options dialog is still a recreation. This document records authored assets and executable-resource evidence for a separate implementation pass; the footer/direct-source checkpoint does not claim Options parity.

## Authored artwork

The original `ra2.mix` contains these matching entries in both `sidec01.mix` (Allied) and `sidec02.mix` (Soviet):

| File | Authored dimensions | Evidence / intended use |
| --- | --- | --- |
| `bkgdsm.shp` | 472 × 448, one frame | Small faction background |
| `bkgdmd.shp` | 632 × 568, one frame | Medium faction background; its width equals an 800px viewport minus the native 168px sidebar |
| `bkgdlg.shp` | 856 × 736, one frame | Large faction background; matches the large panel seen in the high-resolution forum images |
| `uibkgd.pal` | 768 bytes | Correct background palette; native eagle/hammer-and-sickle colors were decoded and inspected |
| `sidebttn.shp` | 125 × 25, three frames | Native sidebar button candidates; verify state ordering and button palette before integration |

The [decoded faction-background contact sheet](../tests/artifacts/native-ui/native-options-assets-contact.png) preserves all six authored backgrounds. It is a diagnostic artifact, not a substitute runtime asset. Runtime originals continue to come from the user's game archives.

`local.mix` also contains the original PCX checkbox and slider artwork: `cce_i.pcx`, `cue_i.pcx` (18 × 18), and `trakgrip.pcx` (12 × 22). The [control-candidate contact sheet](../tests/artifacts/native-ui/native-controls-assets-contact.png) includes these plus other dialog pieces. The other pieces have not all been assigned to the in-battle Options screen. `dlgsysa.pcx` and `dlgsysi.pcx` are glyph atlases, not dialog backgrounds. `glsl.shp`/`glss.shp` are loading screens and are unsuitable as Options art. No candidate has been added to the required runtime catalog in this checkpoint.

## Executable resources and layout limits

The independent [native Options reference](OPTIONS_NATIVE_REFERENCE.md) records the supplied-executable provenance and state evidence. The reviewer exported [selected dialog resources](reference/native-options/selected-dialogs.json), [control-state disassembly](reference/native-options/02-controls-state.asm), and [placement disassembly](reference/native-options/04-resource-and-placement.asm). Dialog 3003 contains Game Speed, Scroll Rate, Target Lines, Tooltips and Show Hidden Objects; its right column contains Sound, Keyboard and Back. Visual Details exists but is hidden and disabled. Difficulty and Scroll Coasting are not supported by these resources. Sound dialog 184 contains three volume controls, a playlist, Play, Stop, Shuffle and Repeat.

The resource template is **426 × 295 dialog units, not pixels**. The executable performs custom placement after creating the template, so multiplying those values into an 800px layout would be an unsupported geometry assumption. The supplied executable contains `.detour`/`xwis.dll` modifications and is a modified base-RA2 source, not a certified unmodified retail executable. See the reviewer's [template diagram](reference/native-options/template-3003-dlu.svg) and code evidence for those limits.

The [Soviet forum image](https://forums.cncnet.org/topic/10627-red-alert-2-game-speed-fixes-dont-work/) supports authored colors, controls and ordering, but its 1280 × 720 composition has a large black gap between the fixed background and sidebar. The Allied forum image explicitly depicts broken alignment. Neither establishes correct 800 × 600 placement. [VIDEO_PARITY_REVIEW.md](VIDEO_PARITY_REVIEW.md) records the independent reference limits.

## Next implementation pass

1. Add only the confirmed background/button/control assets through the existing strict catalog and decode them from saved MIX archives. Retain the installer, MIX stages and selected-art cache; an artwork addition must not trigger another installer download.
2. Decode the original PCX control images with their embedded palette, preserving exact authored pixels and transparency conventions. Validate original fixtures before using them.
3. Replace the current gameplay Options appearance with the original faction frame, native bitmap labels and native control art. Preserve modal pause, focus trapping/restoration, Escape behavior, the separate source form, truthful cache labels and visible storage warnings.
4. Resolve post-template coordinates from the placement code or a sound native capture before claiming 800 × 600 geometry parity. Treat the medium artwork dimensions as authored bounds, not proof of control coordinates.
5. Expose only working controls. `UIActions.onTargetLines/getTargetLines` are agreed with the renderer owner; `onScrollRate/getScrollRate` are agreed with Controls. Scroll Rate scales continuous edge/keyboard panning only, with default multiplier 1; it is not calibrated to a retail pixels-per-second value. A tooltip setting must actually suppress/restore hints while preserving accessible labels. Unsupported sound playlist or hidden-object behavior must not appear as an inert functional control.
6. Verify native Options opening/closing, paused battle time, keyboard focus, slider/check states, visible tooltip behavior, selected-order-line behavior, 800px authored art, and touch layout. Compare actual screenshots; do not equate successful extraction/build with complete retail parity.

The current runtime catalog remains 242 files. This plan adds no runtime assets or Options controls during the direct-download/cache verification freeze.
