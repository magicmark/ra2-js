# Native burst timing and vehicle death selection

This audit statically reads the supplied modified base-RA2 executable; it does not run it or certify clean-retail behavior. Its `.detour`/`xwis.dll` provenance and SHA-256 match the [speed reference](NATIVE_SPEED_REFERENCE.md). [Selected instructions](../tests/artifacts/gameplay/native-burst-death-disassembly.txt) and [address/string verification](../tests/artifacts/gameplay/native-burst-death-source.json) preserve the evidence. These findings support implementation; browser playback still needs verification.

## Individual burst shots

The weapon INI reader writes `Burst` into offset `0x9c` at `0x7333d1–0x7333e5`, and `ROF` into `0xb0` at `0x73341f–0x733439`. The actual Unit vtable at `0x7addf8`, slot `0x2ec`, resolves to the rearm function `0x6c9c00`; this mapping was read from PE bytes rather than assumed from Yuri's Revenge addresses.

After a shot, `0x6cb950–0x6cb998` increments the current burst index, calls that rearm function, installs the returned timer duration against the current logic-frame counter, and only then takes the burst index modulo the weapon's Burst. In the rearm function, an index below Burst follows the inter-shot branch. The ordinary ground branch calls the scenario random-range function with **3 and 5 inclusive**. The range helper at `0x6388a0` masks/rejects values greater than the range difference and adds the lower bound, establishing both endpoints. A separate aircraft type override exists for burst indices 1–4; it must not be applied to the IFV.

When the incremented index reaches Burst, the full reload branch starts with **weapon ROF × house multiplier + a random integer from 0 through 2**, then applies additional veterancy/type logic. This is a logic-frame calculation, not a wall-clock measurement. It does not establish projectile flight duration or a clean-retail random sequence. At the project's 30Hz reference, a default 3–5-tick intra-burst interval corresponds to 0.1–0.167 simulated seconds.

The original `[FV]` uses `[HoverMissile]`: `Damage=25`, `ROF=50`, `Burst=2`, `Projectile=AAHeatSeeker2`, `Speed=40`, `Warhead=HE`. It therefore fires two individual projectiles rather than applying one instantaneous 50-damage hit. Each impact chooses artwork using its individual 25 damage, as described in the [animation reference](NATIVE_ANIMATION_REFERENCE.md). Replacing the aggregate with two hits still does not establish native missile flight or burst cancellation behavior.

## Ordinary vehicle death artwork

The `Explosion` INI reader at `0x6dc2d6–0x6dc3af` stores an animation list at type offset `0x644` (items `0x648`, count `0x654`). The vehicle routine at `0x6fd3a0` selects **scenario random value modulo list length** and constructs that animation at the vehicle location. The current roster's ordinary tank/IFV definitions author `TWLT070,S_BANG48,S_BRNL58,S_CLSN58,S_TUMU60`; there is no basis for always choosing the first entry or drawing a procedural orange ring.

Selection has exceptions: the `Explodes` flag, independently mapped by its INI reader to type byte `0xae2`, or a veterancy ability query can select the final entry, subject to an ammunition predicate. A second `DestroyAnim` list is handled afterward. This bounded audit does not establish all callers, building and infantry death sequences, water deaths, debris, collateral damage, native palette/translucency, or the exact destruction frame. Those require separate checks before claiming complete death-animation parity.
