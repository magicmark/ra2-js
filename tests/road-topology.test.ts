import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { parseNativeMap } from '../src/game/maps/nativeMap';
import { SHORE_CORNERS } from '../src/game/maps/terrainTopology';

const key = (x: number, y: number) => x + 512 * y;

const road = (tile: number) => (tile >= 293 && tile <= 295) || (tile >= 445 && tile <= 448);

const pavement = (tile: number) => tile === 534 || (tile >= 464 && tile <= 478);

const bounds = {
  training: [
    [5, 29, 58, 31],
    [22, 18, 24, 54],
  ],
  'ironwood-crossing': [
    [60, 94, 139, 96],
    [94, 52, 96, 130],
  ],
  'slatewater-reach': [
    [59, 94, 139, 96],
    [94, 53, 96, 131],
  ],
  'tidal-crown': [
    [60, 94, 137, 96],
    [94, 54, 96, 131],
  ],
};

describe('final street topology after shore, resource and neutral clearings', () => {
  for (const [id, streets] of Object.entries(bounds)) {
    const map =
      id === 'training' ? undefined : parseNativeMap(readFileSync(`public/maps/${id}.map`, 'utf8'));

    const state = new Game({ map, ai: false }).state;

    const cells =
      map?.cells ??
      state.tiles.map((tile, i) => ({
        x: i % state.width,
        y: Math.floor(i / state.width),
        ...tile.nativeArt!,
      }));

    const index = new Map(cells.map((c) => [key(c.x, c.y), c]));

    it(`${id}: every road and shoreline retains all original row-major subtiles`, () => {
      for (const c of cells) {
        const isRoad = road(c.tileIndex),
          shore = SHORE_CORNERS[c.tileIndex] !== undefined || c.tileIndex === 314;

        if (!isRoad && !shore) continue;
        const columns = shore ? 2 : [293, 445, 447].includes(c.tileIndex) ? 1 : 3;
        const rows = shore ? 2 : [294, 446, 448].includes(c.tileIndex) ? 1 : 3;

        const left = c.x - (c.subTile % columns),
          top = c.y - Math.floor(c.subTile / columns);

        for (let subTile = 0; subTile < columns * rows; subTile++) {
          const part = index.get(
            key(left + (subTile % columns), top + Math.floor(subTile / columns)),
          );

          if (shore && !part) continue; // Native diamond edges may clip outer shore art.
          expect(part, `${id} template ${c.tileIndex} at ${left},${top}`).toMatchObject({
            tileIndex: c.tileIndex,
            subTile,
          });
        }
      }
    });

    it(`${id}: the full street width stays connected through paved entrances`, () => {
      for (const [left, top, right, bottom] of streets)
        for (let y = top; y <= bottom; y++)
          for (let x = left; x <= right; x++) {
            const c = index.get(key(x, y))!;
            // Pavement LAT may leave a clear shoulder beside unlike ground, but
            // the centre remains paved and every lane remains dry and ore-free.
            const shoulder = right - left === 2 ? x !== left + 1 : y !== top + 1;
            expect(
              road(c.tileIndex) ||
                (id !== 'training' && (pavement(c.tileIndex) || (shoulder && c.tileIndex === 0))),
              `${id} street ${x},${y}: ${c.tileIndex}`,
            ).toBe(true);
            expect(state.tiles[y * state.width + x].ore, 'road and apron access has no ore').toBe(
              0,
            );
          }

      const surface = new Set(
        cells.filter((c) => road(c.tileIndex) || pavement(c.tileIndex)).map((c) => key(c.x, c.y)),
      );

      const reached = new Set<number>(),
        pending = [key(streets[0][0], streets[0][1])];

      for (let i = 0; i < pending.length; i++) {
        const p = pending[i];

        if (reached.has(p) || !surface.has(p)) continue;
        reached.add(p);
        pending.push(p - 1, p + 1, p - 512, p + 512);
      }

      for (const c of cells.filter((c) => road(c.tileIndex)))
        expect(reached.has(key(c.x, c.y)), `disconnected road ${c.x},${c.y}`).toBe(true);

      if (id !== 'training')
        for (let y = 132; y <= 145; y++)
          for (let x = 94; x <= 96; x++)
            expect(
              road(index.get(key(x, y))!.tileIndex),
              'no southern stub beyond the oil-site apron',
            ).toBe(false);
    });
  }
});
