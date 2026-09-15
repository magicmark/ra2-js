import type { NativeCell } from './nativeMap.ts';
import type { NativeTheater } from './theater.ts';

const key = (x: number, y: number) => x + y * 512;

/** Original 2x2 shore templates, indexed by wet NW/NE/SW/SE vertices. */
interface ShoreTiles {
  readonly [corners: number]: number;
}

export const SHORE_BY_CORNERS: ShoreTiles = {
  1: 37,
  2: 35,
  3: 17,
  4: 39,
  5: 25,
  7: 23,
  8: 33,
  10: 9,
  11: 15,
  12: 1,
  13: 31,
  14: 7,
};

export const SHORE_CORNERS = Object.fromEntries(
  Object.entries(SHORE_BY_CORNERS).map(([mask, tile]) => [88 + tile, Number(mask)]),
);

const directions = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

/** Shared corner samples make every shore endpoint agree with the next piece. */
export function applyShorelines(cells: NativeCell[], water: Set<number>, sand: number): void {
  const index = new Map(cells.map((c) => [key(c.x, c.y), c]));

  const vertices = new Set(
    cells.flatMap((c) =>
      c.x % 2 === 0 && c.y % 2 === 0 && water.has(key(c.x, c.y)) ? [key(c.x, c.y)] : [],
    ),
  );

  const blocks = cells.filter((c) => c.x % 2 === 0 && c.y % 2 === 0);

  const maskAt = (x: number, y: number) =>
    [
      [0, 0],
      [2, 0],
      [0, 2],
      [2, 2],
    ].reduce((mask, [dx, dy], bit) => mask | (vertices.has(key(x + dx, y + dy)) ? 1 << bit : 0), 0);

  // Retail has no crossing shore. Remove one wet vertex from each saddle;
  // changes only remove water, so this always terminates and preserves land routes.
  let changed: boolean;

  do {
    changed = false;

    for (const c of blocks) {
      const mask = maskAt(c.x, c.y);

      if (mask === 6 || mask === 9) {
        vertices.delete(key(c.x + 2, c.y + (mask === 9 ? 2 : 0)));
        changed = true;
      }
    }
  } while (changed);

  const shoreCells: NativeCell[] = [];

  for (const anchor of blocks) {
    const mask = maskAt(anchor.x, anchor.y);

    if (!mask) continue;
    const tile = mask === 15 ? 314 : 88 + SHORE_BY_CORNERS[mask];

    for (let subTile = 0; subTile < 4; subTile++) {
      const c = index.get(key(anchor.x + (subTile % 2), anchor.y + (subTile >> 1)));

      if (!c) continue;
      c.tileIndex = tile;
      c.subTile = subTile;

      if (mask !== 15) shoreCells.push(c);
    }
  }

  // Shore art ends in sand. Grass, rough grass, and paving must not butt up
  // against its exposed sand edge; leave enough sand for its own LAT boundary.
  for (const c of shoreCells)
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const near = index.get(key(c.x + dx, c.y + dy));

        if (near && near.tileIndex !== 314 && SHORE_CORNERS[near.tileIndex] === undefined) {
          near.tileIndex = sand;
          near.subTile = 0;
        }
      }
}

/** Run last, after base, ore, roads and neutral clearings have their final material. */
export function applyLandTransitions(cells: NativeCell[], theater: NativeTheater): void {
  const sand = theater === 'SNOW' ? 713 : 493,
    rough = theater === 'SNOW' ? 696 : 418,
    pavement = theater === 'SNOW' ? 734 : 534;

  const transitions = new Map([
    [131, 132],
    [rough, rough + 1],
    [sand, sand + 1],
    [pavement, theater === 'SNOW' ? 749 : 463],
  ]);

  const index = new Map(cells.map((c) => [key(c.x, c.y), c]));
  // The retail LAT sets each blend one material with clear ground. Give unlike
  // materials a clear cell between them instead of inventing cross-material art.
  const original = new Map(cells.map((c) => [key(c.x, c.y), c.tileIndex]));

  for (const c of cells) {
    if (!transitions.has(c.tileIndex)) continue;

    if (
      directions.some(([dx, dy]) => {
        const other = original.get(key(c.x + dx, c.y + dy));

        return (
          other !== undefined &&
          transitions.has(other) &&
          other !== c.tileIndex &&
          other < c.tileIndex
        );
      })
    ) {
      c.tileIndex = 0;
      c.subTile = 0;
    }
  }

  const materials = new Map(cells.map((c) => [key(c.x, c.y), c.tileIndex]));

  for (const c of cells) {
    const first = transitions.get(c.tileIndex);

    if (first === undefined) continue;

    const mask = directions.reduce((mask, [dx, dy], bit) => {
      const near = index.get(key(c.x + dx, c.y + dy)),
        material = near && materials.get(key(near.x, near.y));

      // Shore sand is the same base material. Roads also cut across, rather
      // than erase, the surrounding ground artwork.
      const joins =
        material === undefined ||
        material === c.tileIndex ||
        (c.tileIndex === sand && SHORE_CORNERS[material] !== undefined) ||
        (material >= 293 && material <= 295);

      return mask | (joins ? 0 : 1 << bit);
    }, 0);

    if (mask) {
      c.tileIndex = first + mask;
      c.subTile = 0;
    }
  }
}
