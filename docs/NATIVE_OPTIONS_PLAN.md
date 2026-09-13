# Native Options evidence and bounded implementation plan

The current implementation replaces the custom FIELD SETTINGS dialog with the source-backed Game Options → Game Controls → Sound / Keyboard flow and original faction artwork. It remains a bounded reconstruction: the sidebar compositor and Back rectangle have executable evidence, while font-dependent content geometry and exact retail typography still need an intact native capture. The historical footer/direct-source checkpoint did not include this implementation.

## Authored artwork

The original `ra2.mix` contains these matching entries in both `sidec01.mix` (Allied) and `sidec02.mix` (Soviet):

| File | Authored dimensions | Evidence / intended use |
| --- | --- | --- |
| `bkgdsm.shp` | 472 × 448, one frame | Small faction background |
| `bkgdmd.shp` | 632 × 568, one frame | Medium faction background; its width equals an 800px viewport minus the native 168px sidebar |
| `bkgdlg.shp` | 856 × 736, one frame | Large faction background; matches the large panel seen in the high-resolution forum images |
| `uibkgd.pal` | 768 bytes | Correct background palette; native eagle/hammer-and-sickle colors were decoded and inspected |
| `sidebttn.shp` | 125 × 25, three frames | Native battle sidebar button; sidebar palette, normal frame 0 and pressed frame 1 |

The [decoded faction-background contact sheet](../tests/artifacts/native-ui/native-options-assets-contact.png) preserves all six authored backgrounds. It is a diagnostic artifact, not a substitute runtime asset. Runtime originals continue to come from the user's game archives.

`local.mix` also contains the original PCX checkbox and slider artwork: `cce_i.pcx`, `cue_i.pcx` (18 × 18), and `trakgrip.pcx` (12 × 22). The runtime uses their embedded palettes with transparent index 0. The [control-candidate contact sheet](../tests/artifacts/native-ui/native-controls-assets-contact.png) includes these plus other dialog pieces. The other pieces have not all been assigned to the in-battle Options screen. `dlgsysa.pcx` and `dlgsysi.pcx` are glyph atlases, not dialog backgrounds. `glsl.shp`/`glss.shp` are loading screens and are unsuitable as Options art.

## Executable resources and layout limits

The independent [native Options reference](OPTIONS_NATIVE_REFERENCE.md) records the supplied-executable provenance and state evidence. The reviewer exported [selected dialog resources](reference/native-options/selected-dialogs.json), [control-state disassembly](reference/native-options/02-controls-state.asm), and [placement disassembly](reference/native-options/04-resource-and-placement.asm). Dialog 3003 contains Game Speed, Scroll Rate, Target Lines, Tooltips and Show Hidden Objects; its right column contains Sound, Keyboard and Back. Visual Details exists but is hidden and disabled. Difficulty and Scroll Coasting are not supported by these resources. Sound dialog 184 contains three volume controls, a playlist, Play, Stop, Shuffle and Repeat.

The resource template is **426 × 295 dialog units, not pixels**. The executable performs custom placement after creating the template; it retains ordinary control sizes and translates them by `(80,60)` at 800 × 600. The implementation explicitly reconstructs the remaining Windows dimensions using 6 × 13 base units. That font assumption is not retail pixel certification. The supplied executable contains `.detour`/`xwis.dll` modifications and is a modified base-RA2 source, not a certified unmodified retail executable. See the reviewer's [placement formulas](reference/native-options/placement-formulas.json) and code evidence for those limits.

The [Soviet forum image](https://forums.cncnet.org/topic/10627-red-alert-2-game-speed-fixes-dont-work/) supports authored colors, controls and ordering, but its 1280 × 720 composition has a large black gap between the fixed background and sidebar. The Allied forum image explicitly depicts broken alignment. Neither establishes correct 800 × 600 placement. [VIDEO_PARITY_REVIEW.md](VIDEO_PARITY_REVIEW.md) records the independent reference limits.

## Implemented scope and remaining acceptance

The medium background is rendered unscaled at `(0,0,632,568)` for 800 × 600. Native sidebar tiles start at y 0/16/48/158/227; SIDE2B repeats six times; SIDE3 starts y 527 and ADDON y 553. Back/Resume uses `(653,502,125,25)`. Other authored resolution branches are 640/small and otherwise/large. Touch layouts deliberately adapt the same original images and do not claim retail geometry. The ordinary action rows remain conditional on the reconstructed initial Windows metrics. Frame 2 is a timer flash, so normal hover and disabled buttons do not use it. Button labels use original GAME.FNT, supported by the native default-font trace; exact text baselines remain open.

Working controls include the seven source-backed speed positions, seven project-scaled scroll rates, target lines, Tooltips, effects volume and an audible effects preview. Fastest explicitly describes this browser's 4× cap instead of claiming native unlimited operation. Tooltips require a stationary pointer for more than two seconds, apply to production/HUD hints and visible battlefield objects, and are suppressed immediately when disabled. Scroll Rate affects keyboard and edge scrolling while direct dragging retains its direct mapping.

Keyboard configuration exposes supported command categories, current/new assignments, conflict feedback, Assign and Reset All. A collision replaces the old command assignment; displayed toolbar hints and briefing shortcuts refresh from current binding metadata, retaining stable action labels. Unsupported reserved key families remain unavailable for reassignment. The bindings owner stores these separately. Game Options preferences use only `ra2-game-options:v1`, validate values, tolerate storage denial and never read or write asset-source/stage keys.

The Game Files entry is an explicit browser extension to access the preserved URL/Enter/import flow. It occupies the otherwise unused Load row; it does not claim native saved-game loading. Native Load/Save/Delete controls are absent because saved-game persistence is not implemented. Abort ends the skirmish and returns to the same ready-cache Continue gate without downloading. Music/voice volumes and soundtrack playlist controls are absent because those streams are not implemented. Show Hidden Objects remains absent until its obscured-object behavior exists; it must never reveal shrouded units.

Automated UI checks cover the tooltip dwell/cancellation boundary, remapped/unbound hint presentation, native sidebar placement and validated optional preferences; existing cache-message regression checks remain passing. Native input, original-pixel and responsive evidence is recorded separately after the immutable integration run. Full Options parity remains open until the unimplemented media/save/hidden-object features and font-dependent layout differences are resolved.

The integrated catalog is 265 original files, including the coordinated effects additions. Its Options originals are selected from the existing saved MIX archives; neither a cache-schema bump nor an installer redownload is required by this UI change.
