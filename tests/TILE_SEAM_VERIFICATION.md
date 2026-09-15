# Fractional zoom terrain regression

Verified in native Chrome/WebGL on 2026-09-13. The executable browser harness is [tile-seams.html](tile-seams.html), and the complete measured output is [tile-seam-regression.json](artifacts/fidelity/tile-seam-regression.json).

The user reported cracks between terrain tiles while zooming. Native gameplay captures reproduced black diagonal cracks at 0.75, 0.9, 1.15 and 1.3 zoom. A controlled, fully explored 640×480 map with the exact original 60×30 TMP alpha footprint reproduced 6,526, 7,542, 4,583 and 4,326 incorrect framebuffer pixels respectively at DPR 1. Native 1× zoom had zero holes.

Rounding individual sprite origins while retaining fractional widths split the common world transform. Removing the rounding, increasing UV precision and extruding atlas gutters reduced the holes, but a pixel regression still detected some independently sampled transparent diamond edges. The final renderer composes terrain at native integer coordinates into reusable 480×480 surfaces, then scales those coherent surfaces with nearest-neighbor sampling. It does not expand terrain diamonds or blur their textures.

The final matrix tested 11 zoom levels (0.45, 0.5, 0.65, 0.75, 0.9, 1, 1.15, 1.3, 1.5, 2, 2.4) at three camera offsets for each configuration:

| Fragment/atlas path                  | DPR  | Cases | Incorrect pixels |
| ------------------------------------ | ---- | ----- | ---------------- |
| High precision, 2048px atlas         | 1    | 33    | 0                |
| High precision, 2048px atlas         | 1.25 | 33    | 0                |
| High precision, 2048px atlas         | 1.5  | 33    | 0                |
| High precision, 2048px atlas         | 2    | 33    | 0                |
| Forced medium precision, 512px atlas | 1    | 33    | 0                |
| Forced medium precision, 512px atlas | 2    | 33    | 0                |

All 198 cases passed. The medium-precision path is forced through the same capability detection used by GL; it still runs real WebGL shaders and reads actual framebuffer pixels. The terrain texture is placed deep inside an atlas populated with magenta sentinel images, so transparent gutters and unrelated neighboring texels cannot pass unnoticed.

Each configuration also verified that:

- A tile variant mutation invalidates terrain, and restoring it restores its pixels.
- An asset source change on the same provider refreshes terrain.
- Fully unexplored terrain remains black.
- Partially occupied map-boundary chunks retain transparent out-of-map pixels.
- Twelve repeated map restarts plus asset-source replacements allocate zero additional WebGL textures. Existing chunk canvases and atlas slots are updated and reused.

To rerun, start the configured Vite dev server on `0.0.0.0` with `omarky` allowed, open `/tests/tile-seams.html`, and inspect `window.tileSeamResult`. Use `/tests/tile-seams.html?mediump=1` for the compatibility path. Change the browser's emulated DPR and invoke `window.runTileSeamRegression()` to repeat the matrix.

## Follow-up discovered during full gameplay screenshot review

The 198 cases above verify **terrain interior coverage**. A later screenshot review found a separate yellow sliver at the world x=0 map boundary under black shroud. The original point checks missed that edge. A full-frame unexplored map-edge scan at DPR 2 found 1,280 non-black pixels. The current Renderer owner corrected the missing exterior shroud coverage, and an independently expanded harness verifies the integrated source.

Invoke `window.runBoundaryRegression()` in the same harness to run the boundary suite. It covers all four map corners and four edge midpoints, each at eight zooms (0.45, 0.75, 0.9, 1, 1.15, 1.3, 2, 2.4), with fractional camera offsets, both fully unexplored and partially explored terrain touching the map boundary.

| DPR | Cases | Fully hidden pixels checked | Leaked pixels | Incorrect revealed core pixels |
| --- | ----- | --------------------------- | ------------- | ------------------------------ |
| 1   | 128   | 19,660,800                  | 0             | 0                              |
| 2   | 128   | 78,643,200                  | 0             | 0                              |

All 256 boundary cases pass against the corrected shared Renderer. Full results and source hashes are in [tile-boundary-regression.json](artifacts/fidelity/tile-boundary-regression.json). Fully unexplored frames require every framebuffer pixel to be exactly black, with no tolerance. Partially explored scenes also scan hidden regions and check that revealed cores retain their original uniform color. Their boundary classification permits only the hardware-advertised polygon subpixel quantization (Chrome reports four subpixel bits, or 1/16 framebuffer pixel), because the CPU's ideal line can assign a pixel center to a different side than the rasterizer. This is not a one-pixel allowance: at DPR 1, 867 mixed-boundary pixels fell in that subpixel band; at DPR 2 none did. No pixels outside the band leaked.

The final integrated gameplay screenshot is still being recaptured after the remaining sidebar control integration; the old screenshot showing the yellow line is historical evidence, not a clean final image.

## Coalesced shroud performance

The subsequent shroud change merges adjacent hidden cells in each world row into one polygon while retaining the existing explored boundary and exterior coverage. The same 256 boundary cases passed at DPR 1 and 2 with zero leaks or incorrect revealed core pixels; results are retained in [shroud-boundary-coalesced.json](artifacts/fidelity/shroud-boundary-coalesced.json).

Previously collected measurements are preserved in [shroud-performance.json](artifacts/fidelity/shroud-performance.json). On the same warmed, paused 1272×1170 battlefield at DPR 1 and CPU throttle 1, the 60-frame baseline averaged 78.82 ms per render and 54.45 ms in shroud drawing. The first coalesced sample averaged 16.56 ms per render and 4.46 ms in shroud drawing; a second 60-frame sample averaged 15.52 ms and 4.56 ms respectively. The baseline snapshot is `index-CzD4K9G2.js` on port 4197; the coalesced snapshot is `index-nfPqeOxC.js` on port 4198. These are measured CPU render-call durations under ANGLE Vulkan SwiftShader, not hardware GPU frame-rate claims. No unchanged performance test was rerun merely to write this report.
