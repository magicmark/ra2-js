import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { wantedFiles } from '../src/assets/catalog';
import { createMap } from '../src/game/map';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap, type NativeCell } from '../src/game/maps/nativeMap';
import { applyRoadEnds } from '../src/game/maps/roadEnds';
import { nativeTileSpec } from '../src/game/maps/theater';

// Independent retail inventory: filenames, native IDs and row-major TMP sizes.
const inventory = JSON.parse(
  readFileSync('tests/artifacts/map-visual-audit/inventory.json', 'utf8'),
);

const training = createMap().map((t, i) => ({ x: i % 64, y: Math.floor(i / 64), ...t.nativeArt! }));

const expected = {
  training: [
    [5, 29, 447],
    [58, 29, 445],
    [22, 18, 446],
    [22, 54, 448],
  ],
  'ironwood-crossing': [
    [60, 94, 447],
    [139, 94, 445],
    [94, 52, 446],
  ],
  'slatewater-reach': [
    [59, 94, 447],
    [139, 94, 445],
    [94, 53, 446],
  ],
  'tidal-crown': [
    [60, 94, 447],
    [137, 94, 445],
    [94, 54, 446],
  ],
};

describe('retail paved road ends', () => {
  it('selects all twelve original files with the verified theater indices', () => {
    const selected = wantedFiles();

    for (const piece of inventory.originalEndPieces) {
      const theater = piece.fileName.endsWith('.sno')
        ? 'SNOW'
        : piece.fileName.endsWith('.urb')
          ? 'URBAN'
          : 'TEMPERATE';

      expect(nativeTileSpec(theater, piece.tileIndex)).toEqual({
        fileName: piece.fileName,
        kind: 'road',
      });
      expect(selected.has(piece.fileName)).toBe(true);
    }
  });

  for (const id of ['training', ...MAP_CATALOG.map((e) => e.id)])
    it(`${id}: full caps face outward and join full straight templates`, () => {
      const cells =
        id === 'training'
          ? training
          : parseNativeMap(readFileSync(`public/maps/${id}.map`, 'utf8')).cells;

      const get = (x: number, y: number) => cells.find((c) => c.x === x && c.y === y);
      const placements = Object.entries(expected).find(([name]) => name === id)?.[1] ?? [];
      expect(cells.filter((c) => c.tileIndex >= 445 && c.tileIndex <= 448)).toHaveLength(
        placements.length * 3,
      );

      for (const [x, y, tileIndex] of placements) {
        const piece = inventory.originalEndPieces.find(
          (p: any) => p.tileIndex === tileIndex && p.fileName.endsWith('.tem'),
        );

        const [dx, dy] = piece.endDirection;

        for (let subTile = 0; subTile < 3; subTile++) {
          const px = x + (subTile % piece.columns),
            py = y + Math.floor(subTile / piece.columns);

          expect(get(px, py)).toMatchObject({ tileIndex, subTile });
          expect(get(px - dx, py - dy)).toMatchObject({ tileIndex: dx ? 293 : 294, subTile });
          expect(nativeTileSpec('TEMPERATE', get(px + dx, py + dy)!.tileIndex)?.kind).not.toBe(
            'road',
          );
        }
      }

      // Existing tech-pad approaches stay ordinary straight templates.
      if (id !== 'training' && placements.length)
        expect(get(71, 95)).toMatchObject({ tileIndex: 293, subTile: 1 });
    });

  it('leaves broken templates, clipped maps and pad approaches untouched', () => {
    const cells = Array.from(
      { length: 6 },
      (_, i) =>
        ({
          x: 10 + (i % 2),
          y: 10 + Math.floor(i / 2),
          tileIndex: 293,
          subTile: Math.floor(i / 2),
          height: 0,
          iceGrowth: 0,
          overlay: 255,
          overlayData: 0,
        }) satisfies NativeCell,
    );

    cells[0].tileIndex = 534;
    const before = structuredClone(cells);
    applyRoadEnds(cells, 'TEMPERATE', [
      [11, 11, '+x'],
      [10, 11, '-x'],
    ]);
    expect(cells).toEqual(before);
    expect(() => createMap(16, 16)).not.toThrow();
  });
});
