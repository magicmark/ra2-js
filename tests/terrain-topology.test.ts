import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyLandTransitions,
  applyShorelines,
  SHORE_CORNERS,
} from '../src/game/maps/terrainTopology';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap, type NativeCell } from '../src/game/maps/nativeMap';
import { nativeTileSpec } from '../src/game/maps/theater';

const cells = (width = 12, height = 12): NativeCell[] =>
  Array.from({ length: width * height }, (_, i) => ({
    x: i % width,
    y: Math.floor(i / width),
    tileIndex: 0,
    subTile: 0,
    height: 0,
    iceGrowth: 0,
    overlay: 255,
    overlayData: 0,
  }));

const mask = (tile: number) => SHORE_CORNERS[tile] ?? (tile >= 314 && tile <= 327 ? 15 : 0);

function checkShoreJoins(tiles: NativeCell[]) {
  const index = new Map(tiles.map((c) => [c.x + 512 * c.y, c]));
  let checked = 0;

  for (const c of tiles) {
    if (c.x % 2 || c.y % 2) continue;
    const own = mask(c.tileIndex);

    for (const [dx, dy, from, to] of [
      [2, 0, [1, 3], [0, 2]],
      [0, 2, [2, 3], [0, 1]],
    ] as const) {
      const near = index.get(c.x + dx + 512 * (c.y + dy));

      if (!near) continue;
      const other = mask(near.tileIndex);
      expect(
        from.map((bit) => (own >> bit) & 1),
        `shore join ${c.x},${c.y} → ${near.x},${near.y}`,
      ).toEqual(to.map((bit) => (other >> bit) & 1));
      checked++;
    }

    if (SHORE_CORNERS[c.tileIndex] !== undefined || own === 15)
      for (let sub = 0; sub < 4; sub++) {
        const part = index.get(c.x + (sub % 2) + 512 * (c.y + (sub >> 1)));

        if (part) {
          expect(part.tileIndex, 'complete original shore/water template').toBe(c.tileIndex);
          expect(part.subTile).toBe(sub);
        }
      }
  }

  return checked;
}

describe('retail terrain topology', () => {
  it('shares shore endpoints and resolves crossing saddles using real pieces', () => {
    const tiles = cells(),
      water = new Set(
        tiles
          .filter((c) => (c.x - 5) ** 2 + (c.y - 5) ** 2 < 15 || (c.x === 2 && c.y === 2))
          .map((c) => c.x + 512 * c.y),
      );

    applyShorelines(tiles, water, 493);
    expect(checkShoreJoins(tiles)).toBeGreaterThan(40);
    expect(tiles.some((c) => SHORE_CORNERS[c.tileIndex] !== undefined)).toBe(true);
  });
  it('uses the retail N/E/S/W LAT bits after final plot clearing', () => {
    for (const [dx, dy, bit] of [
      [0, -1, 1],
      [1, 0, 2],
      [0, 1, 4],
      [-1, 0, 8],
    ]) {
      const tiles = cells(5, 5);
      tiles.forEach((c) => (c.tileIndex = 131));
      tiles[(2 + dy) * 5 + 2 + dx].tileIndex = 0;
      applyLandTransitions(tiles, 'TEMPERATE');
      expect(tiles[12].tileIndex).toBe(132 + bit);
    }
  });

  for (const entry of MAP_CATALOG)
    it(`${entry.name}: complete compatible shore pieces and native ore drills`, () => {
      const map = parseNativeMap(readFileSync(`public/maps/${entry.id}.map`, 'utf8'));
      expect(checkShoreJoins(map.cells)).toBeGreaterThan(8000);
      expect(map.terrain.filter((t) => t.type === 'TIBTRE01')).toHaveLength(12);

      if (entry.id === 'saffron-wash' || entry.id === 'copperhead-mesa') {
        expect(map.theater).toBe('TEMPERATE');
        expect(
          map.cells.filter((c) =>
            ['grass', 'rough'].includes(nativeTileSpec(map.theater, c.tileIndex)!.kind),
          ),
        ).toHaveLength(0);
        expect(
          map.terrain
            .filter((t) => t.type !== 'TIBTRE01')
            .every((t) => /^TREE2[0-3]$/.test(t.type)),
        ).toBe(true);
      }
    });
});
