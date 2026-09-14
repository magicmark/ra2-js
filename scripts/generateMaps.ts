import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MAP_CATALOG, type MapCatalogEntry } from '../src/game/maps/catalog.ts';
import { nativeMapCoordinates, nativeDisplayPosition, type NativeMap, type NativeCell } from '../src/game/maps/nativeMap.ts';
import { nativeTileSpec } from '../src/game/maps/theater.ts';
import { writeNativeMap } from './nativeMapWriter.ts';

const SIZE = 96;
const hash = (x: number, y: number, seed = 0) => {
  let n = Math.imul(x + seed * 31, 374761393) ^ Math.imul(y + seed * 19, 668265263); n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967296;
};
const ellipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
const native = (u: number, v: number) => ({ x: Math.round(u + v + 1), y: Math.round(v + SIZE - u) });
// Different orientations retain generous edge margins and >35 native-cell separation.
const startLayouts = [
  [[20, 18], [73, 18], [80, 47], [73, 76], [20, 76], [14, 47]],
  [[20, 20], [72, 20], [79, 48], [72, 75], [20, 75], [14, 48]],
  [[18, 20], [70, 18], [79, 47], [74, 75], [22, 77], [13, 49]],
  [[21, 18], [73, 18], [80, 48], [73, 76], [21, 76], [14, 48]],
  [[20, 18], [72, 18], [79, 46], [74, 75], [22, 76], [14, 47]],
  [[20, 18], [72, 18], [80, 47], [73, 76], [21, 76], [13, 47]],
  [[20, 18], [73, 18], [80, 47], [73, 76], [20, 76], [14, 47]],
  [[21, 18], [72, 19], [80, 45], [73, 74], [22, 76], [14, 46]],
];
// Matching 2x2 retail Shore TMPs; set bits are water-facing (Beach) subtiles.
const shoreByWaterMask: Record<number, number> = { 1: 37, 2: 35, 3: 17, 4: 39, 5: 25, 7: 23, 8: 33, 10: 9, 11: 15, 12: 1, 13: 31, 14: 7 };

export function authorMap(entry: MapCatalogEntry, seed: number): NativeMap {
  const starts = startLayouts[seed].map(([u, v], index) => ({ index, ...native(u, v) }));
  const cells: NativeCell[] = nativeMapCoordinates(SIZE, SIZE).map(p => ({ ...p, tileIndex: 0, subTile: 0, height: 0, iceGrowth: 0, overlay: 255, overlayData: 0 }));
  const map: NativeMap = { name: entry.name, theater: entry.theater, size: [0, 0, SIZE, SIZE], localSize: [3, 4, 90, 86], cells, starts, structures: [], terrain: [], lighting: { ambient: 1, red: 1, green: 1, blue: 1 } };
  const index = new Map(cells.map(cell => [cell.x + 512 * cell.y, cell]));
  const get = (x: number, y: number) => index.get(x + 512 * y);
  const sand = entry.theater === 'SNOW' ? 713 : 493, rough = entry.theater === 'SNOW' ? 696 : 418, pavement = entry.theater === 'SNOW' ? 734 : 534;
  const water = new Set<number>();
  for (const c of cells) {
    const { x: u, y: v } = nativeDisplayPosition(c, SIZE), ripple = Math.sin(u * .22) * Math.sin(v * .17);
    let tile = 0, wet = false;
    switch (seed) {
      case 0: // Parallel long lakes with a broad east-west saddle and outside routes.
        tile = Math.sin(u * .13 + Math.cos(v * .14)) + Math.cos(v * .18) > .3 ? 131 : 0;
        wet = ellipse(u, v, 47, 23, 8.5, 17) < 1 || ellipse(u, v, 47, 73, 9, 17) < 1;
        break;
      case 1: // Asymmetric clustered basins, none forming a wall across the map.
        tile = Math.cos(u * .13) + Math.sin(v * .12) > .6 ? sand : 0;
        wet = ellipse(u, v, 43, 31, 9, 9) < 1 || ellipse(u, v, 60, 56, 10, 11) < 1 || ellipse(u, v, 34, 69, 6, 7) < 1;
        break;
      case 2: // Land-only braided washes except for a compact central oasis.
        tile = sand;
        if (Math.abs(u - 46 - Math.sin(v * .09) * 12) < 4 || Math.abs(v - 47 - Math.sin(u * .095) * 15) < 4) tile = rough;
        else if (Math.sin(u * .07 + v * .1) + ripple > .9) tile = 0;
        wet = ellipse(u, v, 48, 48, 5, 5) < 1;
        break;
      case 3: // Broad wooded belts around a real native-axis three-cell road cross.
        tile = Math.abs(Math.sin((u + v) * .065) + Math.cos((u - v) * .08)) > .75 ? 131 : 0;
        wet = ellipse(u, v, 47, 14, 5, 6) < 1 || ellipse(u, v, 47, 81, 5, 6) < 1;
        break;
      case 4: // Harbor fingers connected through broad paved inland districts.
        tile = (Math.floor(u / 13) + Math.floor(v / 13)) % 3 ? pavement : 0;
        wet = u > 87 || (u > 59 && v > 29 && v < 37) || (u > 60 && v > 57 && v < 64);
        break;
      case 5: { // Flat mesa: broad textured mineral bands; no fake cliff elevations.
        const radius = Math.hypot((u - 47) * .94, v - 47);
        tile = radius < 13 ? rough : radius < 24 ? sand : radius < 29 ? rough : radius < 39 ? 0 : sand;
        if (Math.abs(u - 47) < 5 || Math.abs(v - 47) < 5) tile = sand;
        break;
      }
      case 6: // Two transverse lakes, center causeway 20 display columns wide.
        tile = Math.abs(v - 47) < 8 ? rough : (Math.sin(u * .1) + Math.cos(v * .13) > .65 ? sand : 0);
        wet = ellipse(u, v, 29, 47, 9, 17) < 1 || ellipse(u, v, 66, 47, 9, 17) < 1;
        break;
      case 7: // Crescent inlet reaches in from the south; inland ring stays open.
        tile = Math.hypot(u - 47, v - 47) < 30 ? pavement : sand;
        if (ellipse(u, v, 47, 42, 22, 16) < 1) tile = 131;
        wet = ellipse(u, v, 48, 85, 16, 28) < 1 && (v > 76 || ellipse(u, v, 48, 69, 10, 16) > 1);
        break;
    }
    c.tileIndex = tile;
    if (wet) water.add(c.x + 512 * c.y);
  }
  // The safety reserve includes each spawn, its expansion rectangle, and both ore fields.
  for (const start of starts) for (const c of cells) {
    const base = Math.abs(c.x - start.x) <= 10 && Math.abs(c.y - start.y) <= 10;
    const ore1 = Math.hypot(c.x - start.x - 14, c.y - start.y) <= 6;
    const ore2 = Math.hypot(c.x - start.x, c.y - start.y + 14) <= 5;
    if (base || ore1 || ore2) { water.delete(c.x + 512 * c.y); if (base) c.tileIndex = seed === 2 || seed === 5 ? sand : 0; }
  }
  // Stamp complete original multi-cell shore/water pieces on a two-cell lattice.
  for (let y = 0; y < SIZE * 2; y += 2) for (let x = 0; x < SIZE * 2; x += 2) {
    const block = [get(x, y), get(x + 1, y), get(x, y + 1), get(x + 1, y + 1)];
    const mask = block.reduce((m, cell, i) => m | (cell && water.has(cell.x + 512 * cell.y) ? 1 << i : 0), 0);
    if (!mask) continue;
    const shore = shoreByWaterMask[mask];
    block.forEach((cell, subTile) => {
      if (!cell) return;
      if (mask === 15) { cell.tileIndex = 314 + (hash(x >> 1, y >> 1, seed) > .5 ? 1 : 0); cell.subTile = subTile; }
      else if (shore) { cell.tileIndex = 88 + shore; cell.subTile = subTile; }
    });
  }
  // Native LAT edges soften coherent single-cell land materials into clear terrain.
  const original = new Map(cells.map(c => [c.x + 512 * c.y, c.tileIndex]));
  for (const c of cells) {
    if (c.tileIndex !== 0) continue;
    const around = [[-1, 0], [0, -1], [1, 0], [0, 1]].map(([dx, dy]) => original.get(c.x + dx + 512 * (c.y + dy)));
    const adjacent = around.includes(sand) ? sand : around.includes(131) ? 131 : around.includes(rough) ? rough : undefined;
    if (adjacent !== undefined) {
      const mask = around.reduce<number>((m, value, bit) => m | (value !== adjacent ? 1 << bit : 0), 0);
      c.tileIndex = (adjacent === sand ? sand + 1 : adjacent === 131 ? 132 : rough + 1) + mask;
    }
  }
  // Retail road01 is 1x3, road02 is 3x1, road03 is the full 3x3 crossing.
  if (seed === 3 || seed === 4 || seed === 7) for (const c of cells) {
    const horizontal = c.y >= 94 && c.y <= 96 && c.x >= 48 && c.x <= 145;
    const vertical = c.x >= 94 && c.x <= 96 && c.y >= 48 && c.y <= 145;
    if (!(horizontal || vertical) || ['water', 'shore'].includes(nativeTileSpec(map.theater, c.tileIndex)!.kind)) continue;
    if (starts.some(s => Math.abs(c.x - s.x) <= 10 && Math.abs(c.y - s.y) <= 10)) continue;
    c.tileIndex = horizontal && vertical ? 295 : horizontal ? 293 : 294;
    c.subTile = horizontal && vertical ? (c.y - 94) * 3 + c.x - 94 : horizontal ? c.y - 94 : c.x - 94;
  }
  const clear = (x: number, y: number, radius: number, tile = 0) => {
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const c = get(x + dx, y + dy); if (c) { c.tileIndex = tile; c.subTile = 0; c.overlay = 255; c.overlayData = 0; }
    }
  };
  // Two identical local fields per player: 49 + 29 cells, every cell full density.
  for (const s of starts) for (const [cx, cy, radius] of [[s.x + 14, s.y, 4], [s.x, s.y - 14, 3]]) {
    clear(cx, cy, radius + 1, seed === 2 || seed === 5 ? sand : 0);
    for (let y = cy - radius; y <= cy + radius; y++) for (let x = cx - radius; x <= cx + radius; x++) {
      const c = get(x, y); if (c && Math.hypot(x - cx, y - cy) <= radius) { c.overlay = 102 + Math.floor(hash(x - cx, y - cy, 7) * 6); c.overlayData = 11; }
    }
  }
  // Six evenly contested oil sites (one per approach) and three shared airports.
  const oilLocations = starts.map(s => ({ x: Math.round(s.x * .55 + 96 * .45), y: Math.round(s.y * .55 + 96 * .45) }));
  const airportLocations = [[47, 39], [37, 58], [58, 58]].map(([u, v]) => native(u, v));
  const dryLand = (x: number, y: number) => {
    const c = get(x, y); if (!c) return false;
    const kind = nativeTileSpec(map.theater, c.tileIndex)!.kind;
    if (kind === 'water') return false;
    if (kind !== 'shore') return true;
    const mask = Number(Object.entries(shoreByWaterMask).find(([, tile]) => tile === c.tileIndex - 88)?.[0]);
    return !(mask & 1 << c.subTile);
  };
  for (const [type, positions] of [['CAOILD', oilLocations], ['CAAIRP', airportLocations]] as const) for (const target of positions) {
    const choices = cells.filter(c => {
      if (Math.hypot(c.x - target.x, c.y - target.y) > 24 || map.structures.some(s => Math.hypot(c.x - s.x, c.y - s.y) < 11)) return false;
      if (starts.some(s => Math.hypot(c.x - s.x, c.y - s.y) < 18)) return false;
      const { x: u, y: v } = nativeDisplayPosition(c, SIZE); if (u < 10 || u > 85 || v < 11 || v > 80) return false;
      for (let dy = -4; dy <= 6; dy++) for (let dx = -4; dx <= 6; dx++)
        if (!dryLand(c.x + dx, c.y + dy) || get(c.x + dx, c.y + dy)?.overlay !== 255) return false;
      return true;
    }).sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
    const p = choices[0]; if (!p) throw new Error(`${entry.name}: no reachable neutral plot near ${target.x},${target.y}`);
    clear(p.x + 1, p.y + 1, 4, pavement);
    map.structures.push({ id: String(map.structures.length), owner: 'Neutral', type, x: p.x, y: p.y, health: 256, facing: 64 });
  }
  // Tree belts preserve all base plots, resources, roads, and tech approaches.
  for (const c of cells) {
    const { x: u, y: v } = nativeDisplayPosition(c, SIZE), kind = nativeTileSpec(map.theater, c.tileIndex)!.kind;
    if (!['clear', 'grass', 'rough', 'sand'].includes(kind) || c.overlay !== 255 || u < 5 || u > 90 || v < 6 || v > 85) continue;
    if (starts.some(s => Math.hypot(c.x - s.x, c.y - s.y) < 23) || map.structures.some(s => Math.hypot(c.x - s.x, c.y - s.y) < 8)) continue;
    const density = seed === 3 ? .12 : seed === 0 ? .045 : seed === 1 ? .025 : seed === 4 || seed === 7 ? .02 : .009;
    if (hash(c.x, c.y, seed + 20) < density && (seed !== 3 || c.tileIndex === 131)) map.terrain.push({ x: c.x, y: c.y, type: `TREE${String(1 + Math.floor(hash(c.y, c.x, seed) * 8)).padStart(2, '0')}` });
  }
  return map;
}

const directory = fileURLToPath(new URL('../public/maps/', import.meta.url));
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(directory, { recursive: true });
  for (const [seed, entry] of MAP_CATALOG.entries()) {
    const map = authorMap(entry, seed), content = writeNativeMap(map, entry.description);
    writeFileSync(`${directory}/${entry.id}.map`, content.replace(/\n/g, '\r\n'));
    console.log(`${entry.name}: ${map.cells.length} native cells, ${map.starts.length} starts, ${map.cells.filter(c => c.overlay !== 255).length} ore cells, ${map.structures.length} neutral tech, ${map.terrain.length} trees; ${content.length} bytes`);
  }
}
