# The Butcher's and George

The Allied structure **The Butcher's** unlocks **George** at an Allied Barracks. Build and place its 3×3 foundation, then train George from Infantry. The same gameplay runs on the training battlefield and native maps. Sidebar captions are **Butcher's** and **George**; the building's official name remains **The Butcher's**.

| Entity | Cost / build time | Rules |
|---|---|---|
| The Butcher's | 1000 / 21 seconds | Allied; requires Barracks and Ore Refinery; 650 HP, steel armor, 30 power consumption, sight 5. |
| George | 650 / 13.65 seconds | Allied; requires Barracks and The Butcher's; 225 HP, flak armor, GI movement speed, sight 6. Noncombat inspector: zero damage, no attacks or retaliation. |

Losing a prerequisite blocks new production and holds paid queue progress. The queue shows **On Hold** and the missing prerequisite. Rebuilding resumes production; canceling refunds actual spending. Existing Georges remain available after the shop is lost.

## Inspection and promotions

Move George near an own-side infantry unit or vehicle, then let him stop. He automatically chooses one eligible unit within **3 cells** and inspects it for **10 continuous simulation seconds**. Each completed inspection raises the target one rank: **Recruit → Veteran → Elite**. Elite is the maximum; each rank requires a fresh 10 seconds.

Moving George, leaving the radius, losing the target, or changing ownership resets incomplete progress. The target may move while remaining within range. Buildings, enemies, neutral units, Georges and Elite units are ineligible. Each target accepts one inspector at a time, so multiple Georges cannot accelerate a promotion. Rank persists through movement and combat, but a new match starts fresh. Promotions do not heal.

Each rank grants **10% more outgoing damage and durability**. Outgoing damage uses `1 + 0.1 × rank`; incoming damage is divided by that factor after armor. These bonuses apply consistently to existing combat; unranked units keep their original values.

Selected George shows a cyan inspection radius. An active inspection displays a cyan link and progress bars on George and his target. The selection panel shows the target, progress and reset rule on desktop and mobile. Promoted units show one gold chevron for Veteran or two for Elite; hovering a unit and its selection panel report its rank. Promotion completion also produces a notification.

George never acquires targets, retaliates, fires at units, or force-fires at the ground. Attack commands cannot produce damage, projectiles or firing animations from him. Attack-move still moves him normally. The approved world sprite retains its equipment as visual artwork only.

## Testing mode

Scheduled Soviet attack waves are currently disabled by `TESTING_FLAGS.automaticSovietWaves` in `src/game/testing.ts`. Economy, production, repairs, defensive combat and player combat continue. Set the flag to `true`, or pass `new Game({ automaticSovietWaves: true })`, to restore scheduled attacks. Restarting or selecting a native map preserves the match setting.

## Artwork

See [artwork provenance and final imagegen revisions](BUTCHERS_ART.md) for the low-rise shop, native-style cameo captions and unchanged George world atlas. Imported original game archives remain outside the repository.
