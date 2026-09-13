# In-battle Options: static native reference

Review owner: `ra2-video-review`. Evidence collected 2026-09-13. This is a follow-up to the immutable [4197 visual review](VIDEO_PARITY_REVIEW.md); it does not change that build's findings.

The supplied executable establishes a useful **Game Options → Game Controls → Sound / Keyboard** structure. It supplies exact control IDs, raw template rectangles, visibility flags, and navigation branches. **It does not yet establish retail screen-pixel geometry.** The engine repositions controls after loading the templates, and the supplied executable is modified.

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

## Coordinates must remain dialog units

The three principal templates below each declare `(0,0,426,295)` and 8-point `MS Sans Serif`. These are Windows dialog units (DLU), whose conversion depends on font metrics. They are not 426×295 screen pixels, nor may they be scaled proportionally to 800×600. The template font is not proof of the final game-rendered typography. [Microsoft DLGTEMPLATE](https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-dlgtemplate), [MapDialogRect](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-mapdialogrect).

Static evidence goes beyond this general caveat: `0x4954e0` loads the dialog resource; `0x5ff610` passes it to `CreateDialogIndirectParamA`; generic initialization calls layout at `0x5fff6e`; `0x5e9f00` calls `MoveWindow` and enumerates children through `0x5e9bb0`. That enumerator includes special placement paths and a further `MoveWindow` at `0x5e9ed4`. Thus, even a correct Windows DLU conversion is insufficient by itself to recover the final layout.

These diagrams show **only raw template relationships**, with synthetic outlines and a documentation font. They are not retail screenshots, artwork, or pixel-acceptance references:

- [Game Options template 181](reference/native-options/template-181-dlu.svg)
- [Game Controls template 3003](reference/native-options/template-3003-dlu.svg)
- [Sound template 184](reference/native-options/template-184-dlu.svg)

## Game Options navigation

Resource **181** contains the following right-hand button column. Rectangles are `x, y, width, height` in **DLU**; names below correspond to the resource's `GUI:*` keys, not newly measured rendered text.

| Control | ID | Template rectangle |
| --- | ---: | --- |
| Game Options heading | 1684 | 318, 1, 108, 10 |
| Game Controls | 1313 | 318, 122, 108, 23 |
| Load Game | 1310 | 318, 149, 108, 23 |
| Save Game | 1311 | 318, 176, 108, 23 |
| Delete Game | 1312 | **317**, 203, 108, 23 |
| Abort Mission | 1314 | 318, 230, 108, 23 |
| Resume Mission | 1670 | 318, 257, 108, 23 |
| Blank/help text | 1685 | 10, 282, 303, 12 |

Preserve the actual `317` template value for Delete when reproducing the evidence; do not infer a required one-pixel visual misalignment from it.

The chooser at `0x4dd7d0` selects 181 when the DWORD at `0xa3d298` is 0 or 5. Other branches select **3002** or **255**. Resource 3002 has Game Controls, Abort Mission and Resume Mission, without Load/Save/Delete. Resource 255 is an Internet-oriented variant. The exact numeric mode names were not independently resolved in this review; “single-player/skirmish-shaped” is an interpretation of 181's contents, not a recovered symbol.

Clicking Game Controls (1313) sets the menu state to 5 at `0x4ddbbf`; dispatch then calls `0x4cf920`. That chooser selects **3003** when byte `0xa40958 == 1`, otherwise **245**. Sound selects **184** when that same byte is nonzero, otherwise **214**. The shared flag and dispatcher establish the menu family without assuming its symbol name.

## Game Controls, resource 3003

| Control | ID | Template rectangle, DLU | Template state |
| --- | ---: | --- | --- |
| Game Options heading | 1684 | 318, 1, 108, 10 | Visible |
| Sound | 1325 | 318, 122, 108, 23 | Visible; callback may disable |
| Keyboard | 1324 | 318, 149, 108, 23 | Visible |
| Back | 1670 | 318, 257, 108, 23 | Visible |
| Game Speed label / slider / value | 1812 / 1321 / 1649 | 4,86,78,15 / 87,87,128,13 / 221,86,92,15 | Visible in template; conditionally hidden |
| Scroll Rate label / slider / value | 1813 / 1322 / 1650 | 4,117,78,15 / 87,118,128,13 / 221,117,92,15 | Visible |
| Visual Details label / slider / value | 1814 / 1323 / 1651 | 4,148,78,15 / 87,149,128,13 / 221,148,92,15 | **Hidden and disabled** |
| Target Lines | 1537 | 32, 193, 119, 10 | Visible checkbox |
| Tooltips | 1538 | 157, 193, 127, 10 | Visible checkbox |
| Show Hidden | 1540 | 32, 211, 119, 10 | Visible checkbox |
| Blank/help text | 1685 | 10, 282, 303, 12 | Visible |

The Visual Details controls have styles `0x48000202`, `0x48000018`, and `0x48000200`: disabled, with no visible flag. Initializing the hidden slider in the callback does not prove it is displayed. There is **no Difficulty or Scroll Coasting control in 3003**; those occur in alternative template 245. [Microsoft window style flags](https://learn.microsoft.com/en-us/windows/win32/winmsg/window-styles).

The callback at `0x4cfc00` provides further constraints:

- Speed's slider, label and value are all hidden when `DWORD[0xa3d298] == 0 && BYTE[0xa40d84] == 0`. A second branch hides the same trio when `DWORD[0xa3d548] != 0`. Do not infer those flags' full semantics from addresses alone.
- Game Speed and Scroll Rate initialize with range **0–6**, using `TBM_SETRANGE` and `lParam=0x00060000`. Their position is `6 - stored_setting`. The label tables contain `TXT_SLOWEST`, `TXT_SLOWER`, `TXT_SLOW`, `TXT_MEDIUM`, `TXT_FAST`, `TXT_FASTER`, `TXT_FASTEST`. These are UI positions and keys, **not calibrated logic or video frame rates**. [Microsoft TBM_SETRANGE](https://learn.microsoft.com/en-us/windows/win32/controls/tbm-setrange).
- Target Lines, Show Hidden and Tooltips read/write separate bytes at `0xa40b32`, `0xa40b33`, and `0xa40b34`, respectively. They are functional settings, not decorative checkboxes.
- In the flag-1 branch, Sound's enabled state follows the result of `0x406f30`; the availability predicate's internals were not resolved.
- Keyboard sets menu state 4; Sound sets 6. The dispatcher calls their dialogs and returns to Game Controls (state 5). Back from Game Controls returns to Game Options (state 1).

## Sound and Keyboard

Resource **184** places three volume rows above a track list, with separate playback controls. Its exact DLU rectangles are:

| Control | ID | Template rectangle, DLU |
| --- | ---: | --- |
| Music label / slider | static / 1327 | 9,27,90,15 / 105,28,175,13 |
| Sound label / slider | static / 1330 | 9,49,90,15 / 105,50,175,13 |
| Voice label / slider | static / 1334 | 9,71,90,15 / 105,72,175,13 |
| Track list | 1328 | 105, 97, 175, 99 |
| Shuffle | 1331 | 29, 155, 70, 14 |
| Repeat | 1332 | 29, 182, 70, 14 |
| Play | 1329 | 29, 214, 83, 15 |
| Stop | 1333 | 197, 214, 83, 15 |
| Sound Options heading | 1684 | 318, 1, 108, 10 |
| Back | 1670 | 318, 257, 108, 23 |
| Blank/help text | 1685 | 10, 282, 303, 12 |

At `0x688e2e`, `0x688e96`, and `0x688ef0`, the callback gives the volume sliders range **0–10**. It applies the availability predicate to the volume controls, Shuffle, Repeat and track list. No assumption about always-enabled audio or a populated playlist is warranted without the relevant game state and media. Alternative resource **214** has the simpler three-volume form; it is not interchangeable with 184.

Keyboard resource **163** includes category and command controls, description, current shortcut, new-shortcut input, current assignment, Assign, Reset All and Back. The exact raw rectangles and keys are in the JSON. Some template regions overlap, another reason not to reproduce them as final CSS coordinates. Shell Options resource **213**, also included for contrast, must not supply battlefield Options geometry. Abort resource **182** has two `GUI:Blank` action buttons whose displayed wording is filled later; this review does not invent their labels.

## Bounded acceptance checklist

For interface planning, ranked by impact:

1. **Menu structure:** use the source-backed Game Options → Game Controls → Sound / Keyboard flow, with the right-side navigation relationship and Back/Resume distinction. The current 4197 `FIELD SETTINGS` tabbed layout has no counterpart in these templates.
2. **Correct variant and visible controls:** do not combine shell 213, alternative 245, and battle-family 3003. Preserve conditional speed visibility; do not expose hidden Visual Details merely because its template exists.
3. **Functional states:** seven-position speed/scroll UI, three distinct UI checkboxes, three separate audio controls, and correct submenu return paths. Preserve native localization keys for interface's text audit.
4. **Pixel acceptance remains open:** obtain an intact retail in-battle capture with known native resolution and observable navigation, or finish the runtime-placement trace and corroborate it visually. Measure final button rectangles, text baselines, slider tracks/thumbs, checkmark placement, help text, panel registration and enabled/pressed/hover states. DLU schematics and the template's Windows font cannot certify them.

No valid new retail Options motion segment or pixel screenshot was secured in this follow-up. The rejected forum 12625/10627 layouts remain rejected; the inaccessible MobyGames image remains unobserved. This static evidence narrows structure and state requirements while leaving those visual limits intact.
