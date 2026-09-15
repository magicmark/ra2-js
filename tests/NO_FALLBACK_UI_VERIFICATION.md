# Original-assets-only UI verification

Verified on 2026-09-13. Source-entry checks used the frozen production snapshot
`http://omarky:4191/`, `index-BNQZUP3q.js` (217-file asset catalog). The subsequent
221-file change adds original sidebar control frames; its integrated artwork
verification is recorded separately by the asset owner.

| Check                                             | Actual result                                                                                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh browser context, before Enter               | Original archive URL was prefilled and editable. `awaiting-source`, `assets.ready === false`, game time 0; no archive, extraction worker, or WASM requests. No image elements, placeholder action, artwork-update panel, or asset strip. |
| Native Enter with an invalid original archive URL | One real fetch of `/invalid-archive.exe`. Extraction returned an actionable “No game MIX files found” error. The source form stayed visible, assets stayed unready, game time stayed 0, and no image elements appeared.                  |
| Error remains idle                                | After several minutes and both viewport changes, the invalid archive request count remained 1. The source remained editable and the multiple-file import remained enabled.                                                               |
| Portrait 390×844                                  | Form bounds x=26–364; document width 390. No horizontal overflow; label, URL, error, submit, progress, and local import visible.                                                                                                         |
| Landscape 844×390                                 | Form bounds x=138–706; document width 844. The source dialog scrolls vertically and local import is reachable at its bottom.                                                                                                             |

A separate UI callback harness on live source tested native keyboard behavior
without starting an archive download: two Enter presses produced exactly one
callback and made both source forms busy; a supplied incomplete-cache detail
appeared directly on the startup form; ready status kept the gate and changed
the button to Continue; editing the source changed it back to Download & play;
two more Enter presses submitted the edited URL exactly once. A ready status
containing a storage warning remained visible in Settings. These checks test
the UI contract, not cache restoration or installer extraction.

The combined raster review is
`tests/artifacts/no-fallback-source-contact-sheet.jpg`. Individual screenshots
were saved before creating and viewing that contact sheet. This is browser
viewport emulation, not testing on a physical mobile device.

The sidebar follow-up uses the actual normal, pressed, and disabled originals:
R-UP/R-DN frames 0/1/2 and DIPLOBTN/OPTBTN frames 0/1. Scroll controls derive
disabled state from the production grid's actual scroll bounds. No synthetic
sidebar texture, cameo, or text arrow is used. The native 168-pixel sidebar
composition and accessible menu controls are retained.
