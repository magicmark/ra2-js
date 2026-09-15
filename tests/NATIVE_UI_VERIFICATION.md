# Native UI verification

This extends the earlier fidelity reports; it does not relabel the older217/221-file screenshots as current. Original UI references and the manual are recorded in [PARITY_ACCEPTANCE.md](../docs/PARITY_ACCEPTANCE.md).

## Native UI240 snapshot

The immutable `http://omarky:4196/` build uses `index-9Q5iVS3v.js` and worker `SHXYbpYq`. An independent Chromium context was seeded with its240-file export of exact original artwork (8,230,168 bytes). This isolates UI verification from the separately verified full installer transfer. Installer requests were blocked by a fetch guard for this cached-only test.

- A fresh reload restored originals behind the source form at game time0. The URL remained the actual prefilled public archive URL. Progress labels reported preparing saved files/artwork, then **Saved game files are ready** and **Continue**; no label reported an active download.
- Native Enter entered play. Reload and Continue made zero fetches, archive requests, extraction-worker requests, or WASM requests. The snapshot predates the later optimization which also avoids repeating original-art validation on an already-ready Continue.
- At800×600 the original command bar is30px high. Its six button centers are57,109,161,213,265,317px, in Team1, Team2, Type Select, Deploy, Guard, Planning order. Native plate, toggle, endcap and button frame images replace the earlier custom bar. Desktop selection cards, unit/building counters, numeric zoom and match clock are absent.
- A native Team1 button click created a group from the staged selected G.I.; after clearing selection, another native click recalled that same unit. Native Deploy deployed it; Planning toggled and updated `aria-pressed`. K toggled repair mode and the original pressed repair frame while a command button held focus.
- The original right upper button opened Options, focused Close, and froze the actual simulation clock. P while Options was open preserved the selection and clock. Escape closed Options and restored focus to the invoking button. The left upper button is the singleplayer Briefing action described in the original manual.
- With100 credits, a native Power Plant click queued production. Advancing the real simulation3seconds spent100, held at12.5%, and displayed native bitmap **On Hold**. Adding funds and advancing the simulation completed production, displayed yellow **Ready**, and alternated native category frames. The focused cameo remained mounted throughout.
- With that completed plant active and a separately queued Barracks, native Tab and Shift+F10 on the Power Plant cameo cancelled/refunded the plant's800 spent credits and preserved the Barracks with0 spent. This tests the clicked-item cancellation contract, not default last-in-queue cancellation.
- With a staged powered Airforce Command and selected Grizzly, a native radar click issued a movement order while preserving camera position. With selection cleared, the same radar click centered the camera on the clicked32,32 world point.

Test staging selected units, added funds/buildings, and advanced the real game tick deterministically where noted. It did not replace original decoding or rendering. Options pause was checked with the automatic real tick restored. Native interactions used Chrome's click/key tools; context-menu actions used native Shift+F10.

The [UI240 contact sheet](artifacts/native-ui/ui240-contact.png) compares actual browser baseline/Ready views with the retail Allied screenshot. It preserves the intermediate yellow counter as before-fix evidence; the final source corrects credits to pale blue, shifts the glyphs down2px, and orders Allied structures as Power Plant, Ore Refinery, Barracks, War Factory, Airforce Command from original `rules.ini`.

## Original bitmap font and cursor implementation

`game.fnt` from `local.mix` is the original1,584,195-byte Unicode bitmap font. The decoder preserves its one-based character table, variable glyph widths, MSB-first row bits, transparent pixels and spacing. Credits use plain digits. Ready/On Hold labels and queue counts use original glyphs. Rasterization occurs only when a label changes.

The original `mouse.shp` in `conquer.mix` contains450 frames on55×43 canvases; `mousepal.pal` in `cache.mix` supplies the cursor palette. Thirty-one used cursor states preserve original frame offsets, full canvas bounds, transparency, and arrow/action hotspots. Image URLs are cached per frame and delivered as browser cursor images; pointer position is handled by the browser rather than a following DOM overlay. Original sequence identification was checked against the [OpenRA RA2 cursor sequence source](https://github.com/OpenRA/ra2/blob/master/mods/ra2/cursors.yaml), the [cursor manager's hotspot handling](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Game/Graphics/CursorManager.cs), and the actual extracted sheet. The [original cursor contact sheet](artifacts/native-ui/original-cursors-contact.png) shows all supplied states. The current100ms frame interval is an implementation cadence; it has not been calibrated against retail cursor animation timing.

Controls choose cursor state from actual hover/selection, command modifiers, tool eligibility, placement passability and edge-scroll limits. Touch continues using its explicit action controls.

Targeted verification after the242-file cursor addition: TypeScript passed;81 tests passed across NativeCursor, NativeFont, AssetManager persistence, desktop Controls and mobile Controls. Real original font and cursor fixtures ran in this environment. Byte-for-byte cache equality uses exact byte-buffer comparison instead of a slow deep enumeration of the large Unicode index array.

## Completed 242-file browser delivery checks

The immutable `4197` snapshot (`index-CzD4K9G2.js`) was checked in a separate Chromium context using its exact 242-file selected-art export. Cached reload retained the source gate and time zero; native Enter entered play with no archive download. These UI checks do not replace the independent real-installer and persistent-browser cache proofs.

- Credits used the native bitmap font with foreground RGB **184,208,232**, plain digits and ink at y6–14. Allied card order matched the authored order. The canvas accessible description now correctly explains left-click orders and right-click cancellation.
- Native pointer hover and K/L keys selected the actual original Select, Move, blocked Move, Repair, blocked Repair and Sell cursor frames with the `(28,21)` action hotspot. The pointer events were trusted. Browser screenshots omit the system pointer, so this is applied-image/state evidence rather than a screenshot of OS cursor placement.
- Native Settings source submission rejected an invalid FTP URL without fetching; entering the same-origin legacy alias reused the existing cache. Both local-file inputs allowed multiple files. A staged simulation exception produced **Battlefield stopped**, hid the archive/import remedy, kept originals ready and focused Reload battlefield.
- Forced-mobile 390 × 844 cached Enter completed without an archive transfer and without horizontal document overflow. That final snapshot's drawer/landscape sequence was not rerun in this pass; earlier mobile behavior evidence remains in MOBILE_VERIFICATION.md. No physical-device performance claim is made.

## Footer registration and direct-source checkpoint

The current live `5173` UI was captured at **800 × 600, DPR 1** after native cached Enter. The [actual full screenshot](artifacts/native-ui/footer-current-800.png) and [retail / before / after contact sheet](artifacts/native-ui/footer-registration-contact.png) record the six-command correction. The repeating original plate was also shifted up two pixels so the newly exposed one-pixel inter-frame strips remain continuous.

All six icon crops are byte-identical to their immutable-4197 baseline after translation **+1px X, −2px Y**; each comparison has zero mean absolute RGB error. [Measured metadata](artifacts/native-ui/footer-registration.json) records the per-icon result. Artwork now registers at `x=32+52n, y=568`. Hitboxes remain `x=31+52n, y=570`, 52 × 32; horizontal centers remain **57,109,161,213,265,317**, and the visible footer stays **30px** high. This confirms the measured six-icon correction. The reference remains JPEG, and this does not independently certify every endcap/state pixel.

The same current page displayed the official `/cors/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe` URL and **Continue**, using the existing 242-file cache. The page's resource timeline contained no installer, legacy proxy, extraction-worker or WASM request. UI normalization now shares the lightweight loader helpers, so old `/download`, relative `/asset-source` and absolute same-origin aliases share the original storage identity. Custom URLs retain their own identity.

The 12 targeted cache-UI/startup tests pass: cache/extract/decode labels avoid implying another download, same-source readiness offers Continue, edited sources remain distinct, repeated submits coalesce, errors permit an explicit retry, and quota warnings remain visible. When storage failed, ready labels say **for this session**, not that files were saved. Only the loader's actual download phase says **Downloading**.

## Remaining limits

The current Options panel remains a recreation; the [source-backed Options plan](../docs/NATIVE_OPTIONS_PLAN.md) records original faction art, dialog resources and uncalibrated placement. Native cursor animation timing, hardware hotspot alignment, remaining pressed/disabled states, and physical-device touch performance remain outside this evidence. No runtime source or catalog changed during the final direct-transfer/cache capture.

## Native production and command-line sequence

The frozen live source matching the `4199` checkpoint (`index-BMccL90Q.js`) was exercised through trusted Chrome clicks and keys. The [production contact sheet](artifacts/native-ui/production-native-contact.png), [placement canvas](artifacts/native-ui/production-placement-800.png), and [full production trace](artifacts/native-ui/production-native-trace.json) preserve the actual results.

Scenario staging is explicit: the skirmish was restarted, income miners removed, starting money set to 5000/0, and automatic ticking frozen in this isolated page. The original Game prototype tick was then advanced in 1/60-second increments. Money was deliberately changed to 100 and then 4000 to exercise shortage recovery; the camera was centered over a valid placement cell. No game source or asset decoder was replaced. All 21 recorded production click/context-menu/key events were trusted; no installer or worker was requested.

| Native action / real simulation step           | Actual result                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Click Power Plant                              | Item 21 queued with 0 spent; money remained 5000                                                                   |
| Advance 4.2 seconds                            | 25% completion, 200 spent, 90-degree radial progress; focused Power card stayed mounted                            |
| Shift+F10 context menu, then advance 3 seconds | On Hold; money and progress unchanged; same focused card                                                           |
| Left-click Power, then advance 4.2 seconds     | Same item resumed, 50% complete, 400 spent; no extra queue entry                                                   |
| Stage 100 credits, advance 4.2 seconds         | Money0, 62.5% complete, 500 total spent; automatic funds Hold                                                      |
| Stage 4000 credits, advance 6.4 seconds        | Ready, 800 total spent; category alternated between two actual original frames                                     |
| Click Ready, Escape                            | Placement cancelled while the paid ready item remained in its queue                                                |
| Click Ready, native canvas center click        | Original Power Plant placed at 10,36; power-building count 1→2; queue emptied; no extra payment                    |
| Click Power then Barracks; advance 4.2 seconds | Active Power 24 spent 200; queued Barracks 25 remained unspent                                                     |
| Shift+Tab back to Power, context menu twice    | First click held Power 24; second cancelled/refunded exactly Power 24, preserving Barracks 25 unpaused and unspent |

Context-menu input used native Shift+F10 on the focused portrait. Left-click resumes a held item; a second right-click cancels it. The card's DOM identity and focus stayed stable through progress, Hold, resume, Ready and exact-item cancellation.

The screenshot exposed a visible one-credit rounding defect: an actual balance of 3699.999999999982 displayed 3699 after an exact-cost completion/refund. These screenshots preserve the before-fix counter. The subsequent UI-only correction normalizes values within 1e-8 of an integer before displaying whole credits; legitimate fractions such as 3699.99 still display3699, and stored economy values are untouched. The regression uses both actual captured balances.

The [green / red / expired contact sheet](artifacts/native-ui/command-lines-native-contact.png) and [command trace](artifacts/native-ui/command-lines-native-trace.json) close the earlier missing-line visual check. A native canvas click selected the original Grizzly; a second native click issued Move to 22.5,44.5 and showed a green destination line. For the attack case, an existing enemy Conscript was staged at 23.5,42.5 and that cell revealed, then a native canvas click issued Attack and showed the red target line. Camera centering made these destinations accessible to the native canvas click tool.

After 24 actual logic ticks, the red line still existed with one feedback tick remaining. After the 25th tick, it disappeared while the Grizzly remained selected and attacking the same living target. The 25-tick source basis comes from the gameplay owner's executable audit/regression; it is not inferred from screenshot wall time. The captures held simulation time between checkpoints to make those states inspectable. No installer or worker attempts occurred.

After the counter-only fix, native cached Enter restored the updated UI. Setting the exact captured balance **3699.999999999982** displayed **3700 credits**; a legitimate **3699.99** displayed **3699 credits**. The actual counter canvas matched the original-font expected pixel buffer exactly in both cases, and the stored balances remained unchanged. See the [native counter contact sheet](artifacts/native-ui/credits-boundary-contact.png) and [pixel/economy proof](artifacts/native-ui/credits-boundary-proof.json). The focused regression plus cache/startup checks passed **13 tests**. Historical production and `4199` screenshots retain their original before-fix values and provenance.
