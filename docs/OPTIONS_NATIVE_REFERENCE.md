# In-battle Options: static native reference

Review owner: `ra2-video-review`. Evidence collected 2026-09-13. This is a follow-up to the immutable [4197 visual review](VIDEO_PARITY_REVIEW.md); it does not change that build's findings.

The supplied executable establishes a useful **Game Options → Game Controls → Sound / Keyboard** structure. The completed bounded placement trace also establishes sidebar composition, authored button bounds, content translation, and button frame states. At 800×600, the background starts at (0,0), the sidebar repeat region at y=227, and Back/Resume occupies **(653,502,125,25)**. These are **static-source-derived coordinates, not clean-retail pixel certification**. Ordinary action row indices and interior control rectangles still depend on Windows' initial font mapping; the supplied executable is modified.

No executable was run. Runtime, rules, tests, catalog, existing review captures, and server state were not changed. MIX art auditing remains with interface. This document provides evidence for planning; it does not authorize or implement an Options rewrite or catalog expansion.

## Evidence and provenance

Input: `/tmp/ra2-engine-reference/game.exe`, 4,497,680 bytes. SHA-256:

```text
06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
```

The PE metadata identifies “Command & Conquer : Red Alert 2”; its embedded version string is `1.08`. **That string is not a verified retail release version.** The image has a `.detour` section and imports `xwis.dll`, so it cannot be presented as a certified, unmodified retail executable. These are directly observed base-RA2 binary findings, independent of YRpp; their clean-retail equivalence remains to be corroborated.

The parser read PE resource type 5 and standard/extended dialog templates as bytes. All nine selected templates consumed exactly their declared resource sizes, without trailing bytes. Resource 3003's RVA and byte size were independently checked against `llvm-readobj --coff-resources`.

- [Selected template data](reference/native-options/selected-dialogs.json): IDs, titles/localization keys, classes, styles, DLU rectangles, resource RVAs, and file offsets.
- [Navigation excerpts](reference/native-options/01-options-navigation.asm): resource selection and menu transitions.
- [Game Controls state excerpts](reference/native-options/02-controls-state.asm): sliders, checkboxes, conditional hiding and enabling.
- [Sound state excerpts](reference/native-options/03-sound-state.asm): three 0–10 ranges, checkbox states and playlist availability.
- [Resource loading and placement excerpts](reference/native-options/04-resource-and-placement.asm): raw resource → dialog creation → later control movement.
- [Speed/scroll label tables](reference/native-options/speed-scroll-label-tables.json): seven native string keys, without an FPS claim.

The original manual corroborates that the battlefield Options button exposes loading/saving, aborting, keyboard configuration and sound. It describes target lines, hidden-object visibility, tooltips and scroll rate; audio has separate music, effects and voice volumes from 0 to 10. It also states that single-player speed is locked by default. This is behavioral corroboration, **not a screenshot or a layout specification**. [Original RA2 manual, printed pp. 9–10 and 16](https://oldgamesdownload.com/manual/command-conquer-red-alert-2-windows-manual-english/).

## Raw template coordinates remain dialog units

The three principal templates below each declare `(0,0,426,295)` and 8-point `MS Sans Serif`. These are Windows dialog units (DLU), whose conversion depends on font metrics. They are not 426×295 screen pixels, nor may they be scaled proportionally to 800×600. The template font is not proof of the final game-rendered typography. [Microsoft DLGTEMPLATE](https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-dlgtemplate), [MapDialogRect](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-mapdialogrect).

Static evidence goes beyond this general caveat: `0x4954e0` loads the dialog resource; `0x5ff610` passes it to `CreateDialogIndirectParamA`; generic initialization calls layout at `0x5fff6e`; `0x5e9f00` calls `MoveWindow` and enumerates children through `0x5e9bb0`. That enumerator includes special placement paths and a further `MoveWindow` at `0x5e9ed4`. Thus, even a correct Windows DLU conversion is insufficient by itself to recover the final layout.

The follow-up trace below resolves those later placement operations. It does not silently convert the template's 426×295 DLU into either 800×600 or the background's 632×568 pixels.

These diagrams show **only raw template relationships**, with synthetic outlines and a documentation font. They are not retail screenshots, artwork, or pixel-acceptance references:

- [Game Options template 181](reference/native-options/template-181-dlu.svg)
- [Game Controls template 3003](reference/native-options/template-3003-dlu.svg)
- [Sound template 184](reference/native-options/template-184-dlu.svg)

## Completed battle placement trace

New evidence: [battle-mode chain](reference/native-options/05-battle-layout-mode.asm), [control placement](reference/native-options/06-control-placement.asm), [sidebar compositor](reference/native-options/07-sidebar-composition.asm), [button states](reference/native-options/08-sidebar-button-states.asm), [default button font](reference/native-options/09-default-button-font.asm), and [machine-readable formulas](reference/native-options/placement-formulas.json). The [800×600 geometry diagram](reference/native-options/battle-layout-800x600.svg) is an explicitly synthetic diagram, not a retail screenshot. [Verification](reference/native-options/placement-verification.json) records artifact hashes and scope.

**Mode selection is established for the battlefield menu entry.** At `0x481db5`, entry calls `0x672de0` before the menu-dispatch loop; after it exits, `0x481de4` calls `0x672e70`. These set/clear the byte at `0xa3d298+0x3080`; `0x672f10` reads it. The setter requires the already-used in-game flag `0xa40958`. With the pause flag set, the full-frame parent selects compositor `0x6f4620`, and right/bottom authored buttons receive paint mode 2 (`SIDEBTTN`). Shell paint mode 1 uses other art and other placement formulas. Do not carry shell geometry into this branch.

The action templates use Windows `Button` with style `0x5000000b`. The class string at `0x7ead6c` and subclass setup at `0x5ed644` establish the owner-draw handler `0x5f0320` and metadata type 0. Consequently these buttons do reach the authored-size placement helpers, rather than the generic title helper.

### Background and sidebar, native 800×600

The art dimensions and frame crops are supplied by assets' original MIX decode, preserved in [authored dimension handoff](reference/native-options/authored-dimensions-handoff.json). This review independently traces their usage; it does not duplicate the MIX audit. The pointer table in the formulas JSON ties executable pointers to exact SHP names.

| Piece                                  | Native nominal rectangle: x, y, width, height             |
| -------------------------------------- | --------------------------------------------------------- |
| BKGDMD                                 | **0, 0, 632, 568**                                        |
| CREDITS                                | 632, 0, 168, 16                                           |
| TOP                                    | 632, 16, 168, 32                                          |
| RADAR, frame 0 in this menu compositor | 632, 48, 168, 110                                         |
| SIDE1                                  | 632, 158, 168, 69                                         |
| SIDE2B, repeated six times             | 632, **227 / 277 / 327 / 377 / 427 / 477**, 168, 50       |
| SIDE3                                  | 632, **527**, 168, 26                                     |
| ADDON                                  | 632, **553**, 168, 63; only 47 rows fit within height 600 |
| Left footer allocation                 | 0, 568, 632, 32                                           |

Allocator `0x6f4c90` computes:

```text
rowOrigin = CREDITS.h + TOP.h + RADAR.h + SIDE1.h = 227
repeatCount = trunc((H - rowOrigin - SIDE3.h) / SIDE2.h)
SIDE3.y = rowOrigin + repeatCount * SIDE2.h
ADDON.y = SIDE3.y + SIDE3.h
```

`trunc` means integer division toward zero; at the supported sizes the repeat-count numerator is positive, so this equals floor. At 800×600, `(600−227−26)/50` gives six repetitions. **The allocator uses SIDE2's height; the paint loop at `0x6f4833` actually draws SIDE2B** through pointer `0xac100c`. This distinction matters when registering authored art.

Background choice is `W==640 → BKGDSM`, `W==800 → BKGDMD`, otherwise `BKGDLG`. It is drawn at the allocator's **(0,0)** with frame 0 and flags `0x400`. The common blitter's centering bit is `0x200`, which is absent. The blitter adds frame crop offsets; assets confirmed **BKGDMD frame 0 crop (0,0,632,568)** and **all SIDEBTTN crops (0,0,125,25)**, so neither gets an extra trim translation. The handoff assigns `uibkgd.pal` to the background and `sidebar.pal` to SIDEBTTN/sidebar art. This does not establish nonstandard-resolution stretching or tiling, nor each piece's nontransparent pixel bounds.

### Final buttons and unresolved row indices

Battle helper `0x5e8c50` sets right-column authored buttons to **125×25** at **x=W−147**, hence **x=653** at width 800. Their horizontal and size results do not depend on template font metrics. Their vertical row **does**:

```text
c = original Windows-created child top relative to parent
    + trunc(original Windows-created child height / 2)
n = trunc((c - 198) / 44)
button.y = rowOrigin + n * 25
```

Here `c` is already in Windows pixels, not DLU. The exact function is useful even when the initial mapping is unresolved. **No final per-action row index is certified by this audit.** For a conditional vertical base unit of 13 with normal Windows rounding, the native templates yield:

| Resource | Button IDs / labels in order                                 | Conditional indices | Conditional y at 800×600 |
| -------- | ------------------------------------------------------------ | ------------------- | ------------------------ |
| 181      | 1313 Controls, 1310 Load, 1311 Save, 1312 Delete, 1314 Abort | 0, 1, 2, 3, 4       | 227, 252, 277, 302, 327  |
| 3003     | 1325 Sound, 1324 Keyboard                                    | 0, 1                | 227, 252                 |

Those example indices must retain their font-mapping qualification. Resource 184's Play/Stop controls use interior placement, not these navigation rows. The `317` DLU x for Delete is overwritten by the shared x=W−147 helper and does not create a one-pixel final displacement.

**Back/Resume is independent of that unresolved index.** Control 1670 goes through `0x5e8fa0`, using `y=SIDE3.y−SIDEBTTN.h`. It is **(653,502,125,25)** at 800×600 for these menu templates.

### Interior, heading and help placement

`0x5fff54` passes constant design dimensions **640×480**, not template DLU dimensions, to `0x5e9f00`. Ordinary interior controls reach `0x5e9e6b`:

```text
final.x = initial Windows pixel x + trunc((W - 640) / 2)
final.y = initial Windows pixel y + trunc((H - 480) / 2)
final.width  = initial Windows pixel width
final.height = initial Windows pixel height
```

At 800×600 this is **+80,+60 translation with unchanged dimensions**. It applies to the ordinary sliders, checkboxes, labels, playlist and playback controls that do not match special routing. It supplies neither their initial Windows pixels nor permission to scale 426×295 DLU to the background. Exact interior rectangles remain open.

For heading 1684, `0x5e8e20` retains original pixel dimensions and y, and centers its rectangle in the rightmost 168 pixels: `x=W−trunc((168−width)/2)−width`. The post-placement helper `0x5e9410` bypasses shell heading adjustments when the battle pause flag is true. For help 1685, `0x5e91a0` uses **x=10, y=H−originalHeight−1**, retaining original width/height; the membership predicate includes 181, 184 and 3003. Do not apply interior +80,+60 translation to either special control.

## SIDEBTTN frame states and default text font

The owner-draw chain copies `DRAWITEMSTRUCT.itemState` to child metadata +0xe8 at `0x5fe471`. Paint mode 2 at `0x5f0698` selects the following frames; pressed selection takes priority over flashing. The meaning of the Windows state structure is corroborated by [Microsoft DRAWITEMSTRUCT](https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-drawitemstruct).

| State                              |         SHP frame | Evidence / limit                                                                                                                  |
| ---------------------------------- | ----------------: | --------------------------------------------------------------------------------------------------------------------------------- |
| Normal                             |             **0** | Default selection in the mode-2 branch                                                                                            |
| Pressed / selected                 |             **1** | `itemState & 1` selects frame 1                                                                                                   |
| Ordinary hover or keyboard focus   | No separate frame | This selector tests neither hover nor focus; absent press/flash it stays 0. Complete hover text/cursor behavior is not certified. |
| Disabled, idle                     |             **0** | `WS_DISABLED` changes text color after frame selection; it does not select frame 2. Exact resulting RGB remains unmeasured.       |
| Explicit timed flash, bright phase |             **2** | Metadata +0xc5; separate from disabled and ordinary hover                                                                         |

Custom message `0x4dc` with `lParam==1` starts a Windows timer with requested interval **1000 ms**. `WM_TIMER` (`0x113`) toggles the flash phase; stopping clears it and kills the timer. This is a requested interval from static code, not observed playback timing. The examined Options callbacks do not establish that their navigation buttons invoke this flashing mode. Do not automatically assign it to hover, disabled, or every Options button. [Microsoft WM_TIMER](https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-timer).

The bounded font follow-through provides evidence for **GAME.FNT as the native default button font**, distinct from the resource's 8-point MS Sans Serif used for initial Windows geometry. The literal at `0x7cf540` is `GAME.FNT`; `0x432c90` passes it to constructor `0x431040` and stores the resulting font object at `0x84e9e8`. Child metadata initialization takes its font field +0x64 from that global; button text at `0x5f0d37` passes +0x64 into text routine `0x5fe020`. This supports the current authored GAME.FNT choice for default buttons, **not a blanket heading-font or typography pass**.

The button text rectangle starts at its draw point plus `(0,1)`, with its right edge two pixels inside the button edge. The pressed branch adds **(+2,+4)** to the rectangle's left/top. The text routine receives alignment/format arguments and performs further measurement; those offsets are **not the final glyph baseline**. The disabled path chooses different text-color globals. Final baseline, exact native colors, heading-specific behavior and the complete font rasterization remain unverified.

## Game Options navigation

Resource **181** contains the following right-hand button column. Rectangles are `x, y, width, height` in **DLU**; names below correspond to the resource's `GUI:*` keys, not newly measured rendered text.

| Control              |   ID | Template rectangle    |
| -------------------- | ---: | --------------------- |
| Game Options heading | 1684 | 318, 1, 108, 10       |
| Game Controls        | 1313 | 318, 122, 108, 23     |
| Load Game            | 1310 | 318, 149, 108, 23     |
| Save Game            | 1311 | 318, 176, 108, 23     |
| Delete Game          | 1312 | **317**, 203, 108, 23 |
| Abort Mission        | 1314 | 318, 230, 108, 23     |
| Resume Mission       | 1670 | 318, 257, 108, 23     |
| Blank/help text      | 1685 | 10, 282, 303, 12      |

Preserve the actual `317` template value for Delete when reproducing the evidence; do not infer a required one-pixel visual misalignment from it.

The chooser at `0x4dd7d0` selects 181 when the DWORD at `0xa3d298` is 0 or 5. Other branches select **3002** or **255**. Resource 3002 has Game Controls, Abort Mission and Resume Mission, without Load/Save/Delete. Resource 255 is an Internet-oriented variant. The exact numeric mode names were not independently resolved in this review; “single-player/skirmish-shaped” is an interpretation of 181's contents, not a recovered symbol.

Clicking Game Controls (1313) sets the menu state to 5 at `0x4ddbbf`; dispatch then calls `0x4cf920`. That chooser selects **3003** when byte `0xa40958 == 1`, otherwise **245**. Sound selects **184** when that same byte is nonzero, otherwise **214**. The shared flag and dispatcher establish the menu family without assuming its symbol name.

## Game Controls, resource 3003

| Control                               |                 ID | Template rectangle, DLU                     | Template state                            |
| ------------------------------------- | -----------------: | ------------------------------------------- | ----------------------------------------- |
| Game Options heading                  |               1684 | 318, 1, 108, 10                             | Visible                                   |
| Sound                                 |               1325 | 318, 122, 108, 23                           | Visible; callback may disable             |
| Keyboard                              |               1324 | 318, 149, 108, 23                           | Visible                                   |
| Back                                  |               1670 | 318, 257, 108, 23                           | Visible                                   |
| Game Speed label / slider / value     | 1812 / 1321 / 1649 | 4,86,78,15 / 87,87,128,13 / 221,86,92,15    | Visible in template; conditionally hidden |
| Scroll Rate label / slider / value    | 1813 / 1322 / 1650 | 4,117,78,15 / 87,118,128,13 / 221,117,92,15 | Visible                                   |
| Visual Details label / slider / value | 1814 / 1323 / 1651 | 4,148,78,15 / 87,149,128,13 / 221,148,92,15 | **Hidden and disabled**                   |
| Target Lines                          |               1537 | 32, 193, 119, 10                            | Visible checkbox                          |
| Tooltips                              |               1538 | 157, 193, 127, 10                           | Visible checkbox                          |
| Show Hidden                           |               1540 | 32, 211, 119, 10                            | Visible checkbox                          |
| Blank/help text                       |               1685 | 10, 282, 303, 12                            | Visible                                   |

The Visual Details controls have styles `0x48000202`, `0x48000018`, and `0x48000200`: disabled, with no visible flag. Initializing the hidden slider in the callback does not prove it is displayed. There is **no Difficulty or Scroll Coasting control in 3003**; those occur in alternative template 245. [Microsoft window style flags](https://learn.microsoft.com/en-us/windows/win32/winmsg/window-styles).

The callback at `0x4cfc00` provides further constraints:

- Speed's slider, label and value are all hidden when `DWORD[0xa3d298] == 0 && BYTE[0xa40d84] == 0`. A second branch hides the same trio when `DWORD[0xa3d548] != 0`. Do not infer those flags' full semantics from addresses alone.
- Game Speed and Scroll Rate initialize with range **0–6**, using `TBM_SETRANGE` and `lParam=0x00060000`. Their position is `6 - stored_setting`. The label tables contain `TXT_SLOWEST`, `TXT_SLOWER`, `TXT_SLOW`, `TXT_MEDIUM`, `TXT_FAST`, `TXT_FASTER`, `TXT_FASTEST`. These are UI positions and keys, **not calibrated logic or video frame rates**. [Microsoft TBM_SETRANGE](https://learn.microsoft.com/en-us/windows/win32/controls/tbm-setrange).
- Target Lines, Show Hidden and Tooltips read/write separate bytes at `0xa40b32`, `0xa40b33`, and `0xa40b34`, respectively. They are functional settings, not decorative checkboxes.
- In the flag-1 branch, Sound's enabled state follows the result of `0x406f30`; the availability predicate's internals were not resolved.
- Keyboard sets menu state 4; Sound sets 6. The dispatcher calls their dialogs and returns to Game Controls (state 5). Back from Game Controls returns to Game Options (state 1).

## Sound and Keyboard

Resource **184** places three volume rows above a track list, with separate playback controls. Its exact DLU rectangles are:

| Control               |            ID | Template rectangle, DLU    |
| --------------------- | ------------: | -------------------------- |
| Music label / slider  | static / 1327 | 9,27,90,15 / 105,28,175,13 |
| Sound label / slider  | static / 1330 | 9,49,90,15 / 105,50,175,13 |
| Voice label / slider  | static / 1334 | 9,71,90,15 / 105,72,175,13 |
| Track list            |          1328 | 105, 97, 175, 99           |
| Shuffle               |          1331 | 29, 155, 70, 14            |
| Repeat                |          1332 | 29, 182, 70, 14            |
| Play                  |          1329 | 29, 214, 83, 15            |
| Stop                  |          1333 | 197, 214, 83, 15           |
| Sound Options heading |          1684 | 318, 1, 108, 10            |
| Back                  |          1670 | 318, 257, 108, 23          |
| Blank/help text       |          1685 | 10, 282, 303, 12           |

At `0x688e2e`, `0x688e96`, and `0x688ef0`, the callback gives the volume sliders range **0–10**. It applies the availability predicate to the volume controls, Shuffle, Repeat and track list. No assumption about always-enabled audio or a populated playlist is warranted without the relevant game state and media. Alternative resource **214** has the simpler three-volume form; it is not interchangeable with 184.

Keyboard resource **163** includes category and command controls, description, current shortcut, new-shortcut input, current assignment, Assign, Reset All and Back. The exact raw rectangles and keys are in the JSON. Some template regions overlap, another reason not to reproduce them as final CSS coordinates. Shell Options resource **213**, also included for contrast, must not supply battlefield Options geometry. Abort resource **182** has two `GUI:Blank` action buttons whose displayed wording is filled later; this review does not invent their labels.

## Bounded acceptance checklist

For interface planning, ranked by impact:

1. **Menu structure:** use the source-backed Game Options → Game Controls → Sound / Keyboard flow, with the right-side navigation relationship and Back/Resume distinction. The current 4197 `FIELD SETTINGS` tabbed layout has no counterpart in these templates.
2. **Correct variant and visible controls:** do not combine shell 213, alternative 245, and battle-family 3003. Preserve conditional speed visibility; do not expose hidden Visual Details merely because its template exists.
3. **Functional states:** seven-position speed/scroll UI, three distinct UI checkboxes, three separate audio controls, and correct submenu return paths. Preserve native localization keys for interface's text audit.
4. **Apply the completed structural placement:** BKGDMD at (0,0), sidebar repeat origin 227, SIDE2B repetition, SIDE3 at 527 and Back/Resume (653,502,125,25) at 800×600. Preserve content's +80,+60 translation and original dimensions; preserve special heading/help routing.
5. **Use source-backed button states:** normal 0, pressed 1, explicit flash phase 2; no inferred hover/disabled frame 2. Default GAME.FNT has source support for buttons, while typography acceptance remains separate.
6. **Remaining pixel acceptance:** obtain intact retail navigation at known native resolution and initial Windows font metrics. Confirm per-action row indices, interior rectangles, glyph baselines, slider tracks/thumbs, checkmarks, help text and disabled/hover/cursor appearance. Modified-source coordinates and synthetic diagrams do not certify clean-retail pixels.

No valid new retail Options motion segment or pixel screenshot was secured in this follow-up. The rejected forum 12625/10627 layouts remain rejected; the inaccessible MobyGames image remains unobserved. This closes the bounded placement/state trace while leaving those visual limits explicit. Runtime, tests, catalog, servers, caches and prior immutable review artifacts were not changed by this evidence task.
