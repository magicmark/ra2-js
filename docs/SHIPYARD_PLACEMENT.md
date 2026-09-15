# Shipyard placement

The Naval Shipyard can be placed on explored, clear water up to a **12-cell gap
between foundations** from a completed, living, owned base building. Every cell
of its 4 × 4 foundation must be valid. Shipyards do not extend the build area, so
they cannot be chained across the sea. Land buildings retain their existing
4.5-cell placement reach.

The shared `placementCells` verdict drives both the green/red placement mask and
`Game.canPlace` / `Game.place`. Water, occupancy, ore, explored terrain, array
bounds and native `LocalSize` still constrain every foundation cell. The native
map's unused array padding is stored as water but cannot accept a shipyard.

## Original-game evidence

- Extracted retail `rules.ini` sections `[GAYARD]` and `[NAYARD]` both set
  `Adjacent=12`, `WaterBound=yes`, and `BaseNormal=no`. Extracted `art.ini` gives
  both shipyards a 4 × 4 foundation. The original comments describe `Adjacent` as
  placement distance from other buildings and `BaseNormal` as participation in
  adjacency checks. Local source: `/tmp/ra2-original-rules.json`.
- [Mirrored RA2 rules.ini](https://github.com/FreemanZY/Command_And_Conquer_INI/blob/master/Command%20%26%20Conquer%20Red%20Alert%28tm%29%20II/Rules.ini)
  provides a public copy of the same shipyard settings.
- [Phobos's proximity hook at revision `10b6980`](https://github.com/Phobos-developers/Phobos/blob/10b69803a2eadfb78bac4a36fc0d7f690b7cbf32/src/Ext/BuildingType/Hooks.cpp#L203)
  receives foundation cells and uses the incoming building's `Adjacent` value.
- [ModEnc's Adjacent explanation, revision 33314](https://modenc.renegadeprojects.com/index.php?title=Adjacent&oldid=33314)
  clarifies that zero means touching foundations and one permits a one-cell gap.

The implementation keeps this simulation's Euclidean distance between foundation
edges and applies the original 12-cell shipyard limit. The reviewed evidence does
not establish the original executable's exact diagonal cutoff; this is not a claim
of cell-for-cell diagonal parity. Other buildings' adjacency values and base-area
eligibility are outside this change.
