# Butcher shop and George artwork

## Artwork and provenance

All four images were newly generated for this feature with the built-in **image_gen** tool, following the imagegen skill; no CLI fallback or code-drawn replacement illustration was used. Final captions use a separate deterministic bitmap text renderer described below. They are openly served runtime assets, separate from the user's imported original game archives. Original archives are not bundled.

| Runtime PNG | Generated output ID | SHA256 |
|---|---|---|
| `public/art/butchers/butchers.png` | `exec-128c27f2-a806-40ec-a825-95c3e9847e8a.png` | `461944047e7e181ce67f1585fec4a249f4a09ba0210a8bd8d13148bcd9f5ac3f` |
| `public/art/butchers/butchers-cameo.png` | `exec-f4af158d-0c0e-4e49-a2be-2358c4424b26.png` | `772688cb863636920ab4bd14562155394903914d2e7d53a3c6b2512e7c070a49` |
| `public/art/butchers/george-sheet.png` | `exec-d82e3d13-351e-45b1-aa27-5c14ad85419c.png` | `4c0ef735eb2f47c35df6e2b63ebca82cc6bd6952e793edb2e341564bd76e9fc2` |
| `public/art/butchers/george-cameo.png` | `exec-b431c7ef-1deb-44e0-98d7-f9e24421437e.png` | `75268c41f7d5f2c740243974a7441762a3b1139faebdb2d144cf63e52be4ee4e` |

The building and infantry sheet retain real PNG alpha. Cameos intentionally have opaque dark backdrops. `CustomArt.ts` consumes the PNGs and downsamples them at runtime into the existing Sprite interface: 180 pixel painted building width, 48 pixel infantry grid, 60×48 cameos. The building anchor follows its painted foundation, not its transparent footer. The 1774×887 sheet uses rounded grid boundaries, eight screen directions N/NW/W/SW/S/SE/E/NE and four rows: ready, left step, right step, fire. Boot lines register each pose without centering on the weapon. The E muzzle's four extra source pixels belong to E and are excluded from NE; padding keeps the muzzle inside the runtime canvas. Low alpha haze does not determine anchors.

## Generation prompt set

The following structured prompt set records the requested composition, identity and edits used for the final assets. All generation used the built-in tool.

**Building — stylized-concept.** Production-ready transparent isometric RTS building: original Allied butcher training shop called The Butcher's. Compact midcentury fortified shop converted for military use, 3×3 square foundation, orthographic 2:1 isometry at 26.565 degrees, visible south/east faces and roof. Concrete and brushed metal, dark slate roof, cobalt blue Allied trim, small blue awning, prominent metal cleaver sign, refrigerated side annex, roof vents and loading door. Exact sign text: “THE BUTCHER'S”. Westwood 2000 style of pre-rendered raster artwork, crisp edges and readable chunky architecture, top-left lighting, short soft shadow bottom-right. Legible downsampled to 180 pixels. Whole foundation with transparent margins; no scene, UI or unrelated logos.

**George sheet — stylized-concept.** Original older stocky butcher with Colonel Sanders-inspired white hair, pointed white goatee and round glasses. White shirt with rolled sleeves, cobalt blue butcher apron, dark trousers, belt and black boots. Compact pump shotgun and clean belt-hung cleaver; no blood or franchise logo. RA2 style pre-rendered raster infantry. Eight columns, four rows: N, NW, W, SW, S, SE, E, NE; rows ready, left-step walk, right-step walk and firing. Consistent ground anchor near 82% of the cell. Transparent background, no grid, readable at tiny game scale.

**Fire-pose correction — precise-object-edit.** Preserve the first three rows, character and sheet layout. Correct row four so each shotgun and flash points in its actual direction: N up, NW up-left, W left, SW down-left, S down toward the camera, SE down-right, E right, NE up-right. Keep muzzle flashes compact and retain the feet/body registration.

**Final sheet alpha — background-extraction.** Remove only the baked gray/white checkerboard background. Preserve all 32 sprites and their corrected poses; return genuine RGBA transparency, without a replacement background or checker pattern.

**Building cameo — style-transfer of the generated building.** Single 5:4 close portrait of the shop's front, cleaver sign and cooling apparatus. Westwood-style sidebar artwork, dark navy industrial backdrop, legible at 60×48. No UI border or additional text.

**George cameo — identity-preserve from the generated George.** Waist-up stern portrait, three-quarter view, white hair/goatee/glasses, blue apron, upright clean metal cleaver and pump shotgun. Dark navy workshop backdrop, Westwood 2000 raster style, legible at 60×48. No UI border, text or unrelated logo.

## Final building projection

The final world sprite was generated using a solid geometry guide derived from `Camera.project`, plus actual original Construction Yard and Refinery sprites as projection/style references. The guide is a geometric reference, not bundled replacement artwork. Imagegen preserved a centered square foundation but authored a slightly steeper projection than the engine. `ButchersProjection.ts` explicitly calibrates that measured projection in the asset provider; the original PNG pixels remain unchanged.

At alpha128, regressions over the two visible foundation edges give slopes **+0.54481291** and **−0.54313125**. Their mean absolute slope is **0.54397208**. The renderer's target is exactly **0.5**, from 60×30 tiles, so the building provider uses vertical projection factor **0.5 / 0.54397208**, preserving the 180 pixel horizontal footprint. The calibrated edges are approximately+0.50077 and−0.49923. Their fitted front corner is at source x700.149,y1034.627; the anchor places that corner exactly45pixels below the entity center, matching the3×3 engine diamond. The inherited5pixel offset was removed after actual grid-overlay review. The source's front corner differs from the alpha-bound center by less than 0.3 game pixels.

The alpha32 painted bounds are x120–1285,y188–1035 (1165×847), yielding approximately 120.3 pixels of painted height after calibration, compared with 141.4 pixels in the initial tall design. The ground foundation remains 3×3 / 180×90. Original foreground rail extensions were removed to make the square perimeter clear. Roof Hough measurements include trim/pitched/decorative edges and are not substituted for visual review of the actual main roof. QA compares the corrected sprite at native zoom against the engine grid and neighboring original structures.

Final world revision prompts:

- **Sketch-to-render:** use the exact camera-derived solid geometry guide as primary geometry; use the previous butcher sprite only for identity, Allied blue awning/trim, concrete/metal, cleaver sign, refrigeration and the THE BUTCHER'S facade sign. Use actual native sprites for shading/style. Preserve centered square ground/roof outlines, parallel world axes, vertical walls and a low one-story envelope; keep the annex within the footprint. Produce a transparent, readable RA2-style raster sprite without construction guides.
- **Background-extraction:** remove the checkerboard completely, preserving the 1402×1122 canvas, current building position, geometry and size. Keep the whole foundation; return genuine RGBA opacity zero outside the building.

## Final cameo captions

The PNG illustrations were generated with imagegen, including attempted caption edits using original `powricon.shp`, `brrkicon.shp` and `reficon.shp` frame0 decoded with `cameo.pal` as references. Browser comparison showed that downsampled generated text did not match the crisp native lettering. The final treatment therefore uses `CameoCaption.ts` after the illustration is drawn at its final 60×48 size.

Semantic labels are exactly **Butcher's** and **George**, displayed as **BUTCHER'S** and **GEORGE** in the native capital-letter treatment. The original building display name remains **The Butcher's**. Five-pixel glyphs follow native reference letter shapes and metrics, with light-to-gray rows and a one-pixel black right edge. An opaque #181818 strip at y40–47 covers the old generated text; glyphs occupy y42–46. No browser font rasterization or scaled text is used. The caption helper owns this small UI label; the illustrations remain the original generated raster artwork. Original reference images and archives are not bundled.

The attempted imagegen caption prompt preserved each portrait and requested exact text Butcher's or George, matching the supplied native cameo references' compact light pixel sans-serif lettering, black edging and dark bottom background. These generated label pixels are now covered by the final deterministic caption treatment.

George's approved 32-frame world sheet is unchanged, including visible weapon props. Walking reuses row 0 as a passing pose between the contact poses in rows 1 and 2: the runtime sequence is [1, 0, 2, 0], with 0.15 seconds per pose and a 0.6-second cycle. This changes playback only; PNG provenance and pose anchors remain unchanged. His noncombat inspector behavior is defined separately in gameplay code; the unused firing row remains part of the generated sheet.

`tests/custom-art.test.ts` independently decodes the checked-in RGBA PNGs, fits the actual foundation edges, checks the calibrated slope/center/height, and verifies all 32 atlas crops and boot registration. Final native-grid, sidebar and battlefield screenshots are part of QA's browser evidence.
