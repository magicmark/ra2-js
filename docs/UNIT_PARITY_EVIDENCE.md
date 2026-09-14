# Unit, mining and native animation parity

The reference input is the locally supplied RA2 multiplayer installer and its `ra2.mix` / `language.mix` archives. Executable addresses below refer to its base RA2 `game.exe`, the same modified base executable already used for this project's native timing audit. Original image files remain in the user's local asset cache; no generated sprites or replacement insignia were added.

| Feature | Original data and implementation |
| --- | --- |
| Promotion insignia | `ra2.mix/conquer.mix/pips.shp`, `ra2.mix/cache.mix/palette.pal`. `game.exe` at `0x6d5440` chooses frame **13** for veteran and **14** for elite. Cropped sizes are 8×5 and 8×13. These are the RA2 frame numbers; Yuri's Revenge's shifted numbers do not apply. |
| Miner storage | `pips2.shp` frames **0** empty and **2** yellow ore, with `palette.pal`. Five original 4×4 pips, spaced four pixels apart, show empty through full storage on selection/hover. |
| Mining | `OREGATH.SHP` is loaded by the unit drawing routine at `0x700e70` and drawn at `0x7011d4`. It has **eight directions × fifteen frames**, one logic tick per frame. The original **ANIM.PAL** load is independently identified at `0x511a9c`. Its origin is thirty leptons (30/256 of a cell) ahead of the miner's quantized facing. Both CMIN/HARV HVA files have one frame; no synthetic body rocking was introduced. |
| Oil derrick | `art.ini` `[CAOILD]` selects `CAOILD_A` and `CAOILD_F`. Pump loop 0–31, Rate=220 → four ticks/frame; flag loop 0–15, Rate=300 → three ticks/frame. Animated shadows use corresponding original frames. The base structure keeps the ground anchor stable. |
| Engineer entry | Target visibility now checks the building footprint consistently with rendering. A visible edge is sufficient even when the center remains hidden. Engineers find a reachable edge, transfer enemy ownership and are consumed, or fully repair a damaged friendly building and are consumed. Battlefield/radar clicks share the command. Original `mouse.shp` enter cursor uses frames **89–98**, from executable cursor table entry 25 at file offset `0x3e2d50`. |
| Infantry idle | `art.ini` provides `Idle1` and `Idle2`, their exact SHP ranges and fixed facing. GI is 56–70 / 71–84; Conscript and Engineer use the same ranges with their own original pixels. Executable sequence table `0x7a3474` entries 9/10 stores rate three; branch `0x5049b7` normalizes these rates. `rules.ini` has `IdleActionFrequency=.15`. Routine `0x503e00` selects delays between frequency×450 and frequency×1800 logic ticks; switch `0x5040f8` selects Idle1 (3/11), Idle2 (3/11), a facing change (4/11), or no action (1/11). |

Idle action randomness is deterministic per unit and separate from combat randomness. Selection immediately restores Ready; movement, targets, firing, deployment and death take priority. Airborne rocketeers retain their authored Hover sequence. DOG's original bending/sitting frames were inspected as a reference; the supported unit roster was not expanded.

## Turn timing and route verification

All vehicles with native ROT finish each hull turn before translating, including autonomous ore/refinery paths and internal route bends. A route corner reached partway through a simulation frame does not spend that frame turning while still translating. Collinear waypoints continue at full speed. Facing differences smaller than one native angle unit do not cause a pause.

At ROT=5, the original integer angle conversion takes **12 logic frames for 90°** and **25 frames for 180°**: 0.400 and 0.833 seconds at this project's 30-frame reference clock.

A controlled first-deposit route used a miner at (20.5,35.5), ore at (22,35), and refinery at (15,35). Replaying the same route with the previous turn gate took **9.900 seconds**; the corrected route took **11.567 seconds**. Both used **75 moving frames** and deposited **500 credits**. The entire difference was **50 stationary turning frames** (1.667 seconds), with no added translation or collinear stalls. The existing AI economy test now allows 180 simulation seconds for its two-miner/armor milestone; the economy and production rules were not changed to compensate.

## Browser contact sheets

Every sprite comparison contains exactly eight panels, composed before image inspection. These are script-staged states rendered in the browser with the actual original assets and WebGL entity renderer; the simulation tests separately verify natural transitions.

- [Eight miner directions with original gathering effects](../tests/artifacts/units-mining-directions-8.png)
- [Storage levels and infantry/vehicle veteran/elite insignia](../tests/artifacts/units-pips-cargo-veterancy-8.png)
- [Oil pump/flag phases and engineer entry before/after ownership transfer](../tests/artifacts/units-oil-flag-engineer-entry-8.png)
- [Selected Ready, GI/Conscript/Engineer idle, and original DOG idle reference](../tests/artifacts/units-infantry-idle-8.png)

## Cache compatibility

Missing enhancement artwork (font, cursor, dialogs, effects, insignia or mining effect) no longer invalidates otherwise usable saved gameplay artwork. The UI uses its text fallback; unavailable original effect/indicator art is omitted. Saved local MIX/installer inputs can supply missing artwork without a network request. If that optional extraction fails, the previous playable selection remains intact. A completed extraction records which optional files it could not supply, avoiding repeated extraction on every reload while still retrying when a different enhancement becomes missing.

The loader regression uses a 126-file version-five fixture with no font, new optional art, source archives or fetch. Its mocked one-unit catalog exercises the real palette/SHP/TMP decoders; padding preserves the reported count, so this is not claimed to reproduce the unknown exact filenames of the user's historic cache. A separate real-browser compatibility audit covers the actual full roster.

## Targeted validation

- `tests/harvester-parity.test.ts`: automatic mining departure, route bends, full-speed straight segments, repeated refinery returns, pause/stop gathering state.
- `tests/engineer-entry.test.ts`, `tests/desktop-controls.test.ts`: partly visible enemy footprint capture, friendly repairs, ownership, consumption, native entry cursor and click/radar routing.
- `tests/infantry-idle.test.ts`, `src/assets/InfantryAnimation.test.ts`: original frames/directions/rates, independent idle actions, selection interruption, movement/deploy/combat priority, pause and render cadence determinism.
- `src/assets/UnitIndicators.test.ts`: exact original palette pixels, all 120 distinct gathering frames, original derrick pump/flag timing and cycle/cache behavior. Real-art checks use `RA2_ASSET_DIR=/tmp/ra2-assets`.
- `src/assets/AssetManager.test.ts`: old-cache startup, file preservation, local source upgrades, extraction failure fallback and bounded optional retries.

Integrated suite/build and release results belong to the main visual parity checklist.
