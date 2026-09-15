import type { NativeCell } from './nativeMap';
import type { NativeTheater } from './theater';

// Termination vectors verified against retail TMPs in MAP_VISUAL_AUDIT.md.
const ends = { '+x': [0, 1, 0], '-y': [1, 0, -1], '-x': [2, -1, 0], '+y': [3, 0, 1] } as const;

export type RoadEnd = readonly [x: number, y: number, direction: keyof typeof ends];

/** Replace only explicitly authored endpoints, using complete row-major templates.
 * Coordinates are road centrelines. Broken strips and pad entrances are not ends. */
export function applyRoadEnds(
  cells: NativeCell[],
  theater: NativeTheater,
  endpoints: readonly RoadEnd[],
): void {
  const index = new Map(cells.map((c) => [c.x + 512 * c.y, c]));

  for (const [x, y, direction] of endpoints) {
    const [offset, dx, dy] = ends[direction],
      straight = dx ? 293 : 294;

    const parts = Array.from({ length: 3 }, (_, subTile) => {
      const px = x + (dy ? subTile - 1 : 0),
        py = y + (dx ? subTile - 1 : 0);

      return {
        cell: index.get(px + 512 * py),
        approach: index.get(px - dx + 512 * (py - dy)),
        subTile,
      };
    });

    // Also permits smaller training maps without placing clipped templates.
    if (
      !parts.every(
        ({ cell, approach, subTile }) =>
          cell?.tileIndex === straight &&
          cell.subTile === subTile &&
          approach?.tileIndex === straight &&
          approach.subTile === subTile,
      )
    )
      continue;

    for (const { cell } of parts) cell!.tileIndex = (theater === 'SNOW' ? 430 : 445) + offset;
  }
}
