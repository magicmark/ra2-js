/** Native-cell bounds of an authored street, including its full template width. */
export type RoadBounds = readonly [left: number, top: number, right: number, bottom: number];

/** Keep wet shoreline vertices off the street and its 2x2 shore-template margin.
 * Streets crossing inlets become dry causeways; the shoreline pass still owns
 * every shore template and the sand beside the road. */
export function reserveRoadLand(water: Set<number>, roads: readonly RoadBounds[]): void {
  for (const [left, top, right, bottom] of roads)
    for (let y = top - 2; y <= bottom + 2; y++)
      for (let x = left - 2; x <= right + 2; x++) water.delete(x + 512 * y);
}
