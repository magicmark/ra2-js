# The Butcher's and George

The Allied structure **The Butcher's** unlocks **George** at an Allied Barracks. Build and place its 3×3 foundation, then train George from Infantry. The same gameplay runs on the training battlefield and native maps. Sidebar captions are **Butcher's** and **George**; the building's official name remains **The Butcher's**.

| Entity        | Cost / build time   | Rules                                                                                                                                                     |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Butcher's | 1000 / 21 seconds   | Allied; requires Barracks and Ore Refinery; 650 HP, steel armor, 30 power consumption, sight 5.                                                           |
| George        | 650 / 13.65 seconds | Allied; requires Barracks and The Butcher's; 225 HP, flak armor, GI movement speed, sight 6. Noncombat inspector: zero damage, no attacks or retaliation. |

Losing a prerequisite blocks new production and holds paid queue progress. The queue shows **On Hold** and the missing prerequisite. Rebuilding resumes production; canceling refunds actual spending. Existing Georges remain available after the shop is lost.

## Autonomous inspection

George remains buildable but behaves as a civilian: he cannot be selected or commanded, and ignores the Barracks rally point. He wanders to nearby reachable locations, stops within **3 cells** of friendly infantry or vehicles to inspect for **3 simulation seconds**, then resumes walking. A short interval between inspections ensures he moves on even if the same unit stays nearby.

Losing the target, leaving range, boarding a transport or changing ownership ends an inspection. Buildings, enemies, neutral units, embarked units and other Georges are ineligible. Each target accepts one inspector at a time. Inspections never change rank, health, damage or durability.

An active inspection displays a cyan link and progress bars on George and his target. Hovering George reports his autonomous status. He never acquires combat targets, retaliates, fires, or accepts player commands. His existing world sprite retains its equipment as artwork only and is scaled to the apparent height of a GI.

## Testing mode

Scheduled Soviet attack waves are currently disabled by `TESTING_FLAGS.automaticSovietWaves` in `src/game/testing.ts`. Economy, production, repairs, defensive combat and player combat continue. Set the flag to `true`, or pass `new Game({ automaticSovietWaves: true })`, to restore scheduled attacks. Restarting or selecting a native map preserves the match setting.

## Artwork

See [artwork provenance and final imagegen revisions](BUTCHERS_ART.md) for the low-rise shop, native-style cameo captions and unchanged George world atlas. Imported original game archives remain outside the repository.
