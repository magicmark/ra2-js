import type { Tile } from '../types';
import { isWithinLocalMap, type NativeMap, type NativeCell } from './nativeMap';
import { nativeTileSpec, nativeOverlaySpec } from './theater';

// Native 2x2 Shore TMP subtiles: set bits are Beach (10), clear bits Rough (14).
const shoreMasks: Record<number, number> = { 1: 12, 2: 12, 3: 12, 7: 14, 8: 14, 9: 10, 10: 10, 11: 10, 15: 11, 16: 11, 17: 3, 18: 3, 19: 3, 23: 7, 24: 7, 25: 5, 26: 5, 27: 5, 31: 13, 32: 13, 33: 8, 34: 8, 35: 2, 36: 2, 37: 1, 38: 1, 39: 4, 40: 4 };
export function nativeCellTerrain(map: NativeMap, cell: NativeCell): Tile['terrain'] {
  const spec = nativeTileSpec(map.theater, cell.tileIndex);
  if (!spec) throw new Error(`Unsupported native gameplay tile: ${map.theater} ${cell.tileIndex}`);
  if (spec.kind === 'water') return 'water';
  if (spec.kind === 'shore') {
    const mask = shoreMasks[cell.tileIndex - 88];
    if (mask === undefined) throw new Error(`Unsupported native gameplay shore: ${cell.tileIndex}`);
    return mask & 1 << cell.subTile ? 'water' : 'sand';
  }
  return spec.kind === 'road' || spec.kind === 'pavement' ? 'road' : spec.kind === 'sand' || spec.kind === 'rough' ? 'sand' : 'grass';
}
/** Native cell coordinates remain unchanged; unused square-array corners block movement. */
export function nativeGameMap(map: NativeMap): { width: number; height: number; tiles: Tile[] } {
  const width = Math.max(...map.cells.map(c => c.x)) + 1, height = Math.max(...map.cells.map(c => c.y)) + 1;
  const tiles = Array.from({ length: width * height }, (): Tile => ({ terrain: 'water', ore: 0, variant: 0 }));
  for (const cell of map.cells) {
    if (!isWithinLocalMap(cell, map)) continue;
    const terrain = nativeCellTerrain(map, cell), resource = nativeOverlaySpec(cell.overlay);
    tiles[cell.y * width + cell.x] = { terrain, ore: resource ? (cell.overlayData + 1) * (resource.kind === 'gems' ? 200 : 100) : 0, variant: cell.subTile };
  }
  for (const tree of map.terrain) if (tiles[tree.y * width + tree.x]) tiles[tree.y * width + tree.x].terrain = 'rock';
  return { width, height, tiles };
}
