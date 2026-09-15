import type { Tile } from './types';
import type { NativeCell } from './maps/nativeMap';
import type { NativeTheater } from './maps/theater';
import { applyLandTransitions, applyShorelines, SHORE_CORNERS } from './maps/terrainTopology';
import { applyRoadEnds } from './maps/roadEnds';
import { reserveRoadLand, type RoadBounds } from './maps/roadTopology';

export const MAP_SIZE = 64;

// Field Command is generated in code, with the same theater as a native
// FinalAlert [Map] Theater=TEMPERATE battlefield.
export const TRAINING_THEATER: NativeTheater = 'TEMPERATE';

function noise(x: number, y: number): number {
  const n = Math.imul(x + 93, 374761393) ^ Math.imul(y + 317, 668265263);

  return ((n ^ (n >>> 13)) >>> 0) / 4294967296;
}

/** Hand-shaped skirmish map with repeatable terrain, ore and two clear bases. */
export function createMap(width = MAP_SIZE, height = MAP_SIZE): Tile[] {
  const roads: readonly RoadBounds[] = [
    [5, 29, 58, 31],
    [22, 18, 24, 54],
  ];

  const tiles: Tile[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = noise(x, y);
      const tile: Tile = { terrain: 'grass', ore: 0, variant: Math.floor(n * 6) };
      const lake = ((x - 33) / 7.2) ** 2 + ((y - 31) / 10) ** 2;

      if (lake < 1 + Math.sin(y * 0.9) * 0.13) tile.terrain = 'water';
      else if (lake < 1.3) tile.terrain = 'sand';

      if ((x < 3 || y < 3 || x > width - 4 || y > height - 4) && n > 0.7) tile.terrain = 'rock';

      if (
        (((x - 12) / 4) ** 2 + ((y - 20) / 7) ** 2 < 1 ||
          ((x - 53) / 3) ** 2 + ((y - 43) / 8) ** 2 < 1) &&
        n > 0.23
      )
        tile.terrain = 'rock';
      // Retail road pieces are three cells wide. Keep the streets on the
      // isometric axes so their painted lanes and sidewalks join cleanly.
      const eastWestRoad = y >= 29 && y <= 31 && x >= 5 && x <= 58;
      const northSouthRoad = x >= 22 && x <= 24 && y >= 18 && y <= 54;

      if (eastWestRoad || northSouthRoad) {
        tile.terrain = 'road';
        tile.variant =
          eastWestRoad && northSouthRoad
            ? 32 + (y - 29) * 3 + x - 22
            : northSouthRoad
              ? 16 + x - 22
              : y - 29;
      }

      tiles.push(tile);
    }
  }

  // Ore fields within reach of both starting refineries and exposed central fields.
  for (const [cx, cy, rx, ry] of [
    [8, 51, 5, 4],
    [22, 51, 4, 3],
    [54, 11, 5, 5],
    [40, 8, 4, 3],
    [20, 27, 3, 5],
    [44, 39, 4, 4],
  ]) {
    for (let y = Math.max(0, cy - ry); y <= Math.min(height - 1, cy + ry); y++) {
      for (let x = Math.max(0, cx - rx); x <= Math.min(width - 1, cx + rx); x++) {
        const t = tiles[y * width + x];
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;

        if (
          d < 1 + noise(x + 17, y) * 0.25 &&
          t.terrain !== 'water' &&
          t.terrain !== 'rock' &&
          t.terrain !== 'road'
        ) {
          t.ore = Math.round(450 + noise(x, y + 99) * 900);
        }
      }
    }
  }

  // Keep starting building plots and exits clear, even if map decorations change.
  for (const [left, top, right, bottom] of [
    [10, 37, 21, 48],
    [42, 12, 52, 24],
  ])
    for (let y = top; y <= bottom; y++)
      for (let x = left; x <= right; x++)
        if (x < width && y < height)
          tiles[y * width + x] = { terrain: 'grass', ore: 0, variant: Math.floor(noise(x, y) * 6) };

  // The default battlefield uses the same original coast/LAT topology as the
  // catalog. Preserve semantic terrain for pathfinding and diagnostic edits.
  const cells: NativeCell[] = tiles.map((tile, i) => ({
    x: i % width,
    y: Math.floor(i / width),
    tileIndex:
      tile.terrain === 'sand'
        ? 493
        : tile.terrain === 'rock'
          ? 131
          : tile.terrain === 'road'
            ? 293 + Math.floor(tile.variant / 16)
            : 0,
    subTile: tile.terrain === 'road' ? tile.variant % 16 : 0,
    height: 0,
    iceGrowth: 0,
    overlay: 255,
    overlayData: 0,
  }));

  const water = new Set(
    cells.flatMap((c) => (tiles[c.y * width + c.x].terrain === 'water' ? [c.x + 512 * c.y] : [])),
  );

  reserveRoadLand(water, roads);
  applyShorelines(cells, water, 493);

  // Restore whole streets after the shore's sand buffer. The reserved crossing
  // is a dry causeway through the lake, with a continuous north/south junction.
  for (const cell of cells) {
    const tile = tiles[cell.y * width + cell.x];

    if (tile.terrain === 'road') {
      cell.tileIndex = 293 + Math.floor(tile.variant / 16);
      cell.subTile = tile.variant % 16;
    }
  }

  applyLandTransitions(cells, TRAINING_THEATER);
  // Preserve the four deliberate outer ends.
  applyRoadEnds(cells, TRAINING_THEATER, [
    [5, 30, '-x'],
    [58, 30, '+x'],
    [23, 18, '-y'],
    [23, 54, '+y'],
  ]);

  for (const cell of cells) {
    const tile = tiles[cell.y * width + cell.x],
      shore = SHORE_CORNERS[cell.tileIndex];

    if (shore !== undefined || cell.tileIndex === 314) {
      tile.terrain = cell.tileIndex === 314 || shore & (1 << cell.subTile) ? 'water' : 'sand';
      tile.ore = 0;
    } else if (tile.terrain === 'water') tile.terrain = 'sand';
    tile.nativeArt = { tileIndex: cell.tileIndex, subTile: cell.subTile, terrain: tile.terrain };
  }

  return tiles;
}
