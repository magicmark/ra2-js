export type NativeTheater = 'TEMPERATE' | 'SNOW' | 'URBAN';
export type NativeTerrainKind = 'clear' | 'grass' | 'rough' | 'sand' | 'pavement' | 'road' | 'water' | 'shore';
export const NATIVE_THEATERS: readonly NativeTheater[] = ['TEMPERATE', 'SNOW', 'URBAN'];
export const THEATER_EXTENSION = { TEMPERATE: 'tem', SNOW: 'sno', URBAN: 'urb' } as const;
// NewTheater SHPs use A (Arctic) for snow; .sno is the terrain extension.
export const THEATER_LETTER = { TEMPERATE: 't', SNOW: 'a', URBAN: 'u' } as const;
export function nativeDecorationNames(theater: NativeTheater): string[] {
  return [...Array.from({ length: 8 }, (_, i) => `tree${String(i + 1).padStart(2, '0')}`), ...(theater === 'TEMPERATE' ? ['tree20', 'tree21', 'tree22', 'tree23'] : []), 'tibtre01'];
}
export interface NativeTileSpec { fileName: string; kind: NativeTerrainKind }
type TileRange = readonly [first: number, count: number, prefix: string, kind: NativeTerrainKind];
// Cumulative TilesInSet indices from the retail temperat.ini, snow.ini, urban.ini.
// Only original sets used by this authored catalog are requested from MIX archives.
const common: readonly TileRange[] = [[0, 1, 'clear', 'clear'], [89, 42, 'shore', 'shore'], [131, 1, 'ruff', 'grass'], [132, 16, 'clat', 'grass'], [293, 3, 'proad', 'road'], [314, 14, 'water', 'water']];
const temperate: readonly TileRange[] = [[418, 1, 'sandy', 'rough'], [419, 16, 'dlat', 'rough'], [445, 4, 'p_end', 'road'], [463, 16, 'plat', 'pavement'], [493, 1, 'green', 'sand'], [494, 16, 'glat', 'sand'], [534, 1, 'pvclr', 'pavement']];
const snow: readonly TileRange[] = [[430, 4, 'p_end', 'road'], [696, 1, 'sandy', 'rough'], [697, 16, 'dlat', 'rough'], [713, 1, 'green', 'sand'], [714, 16, 'glat', 'sand'], [734, 1, 'pvclr', 'pavement'], [749, 16, 'plat', 'pavement']];
export function nativeTileSpec(theater: NativeTheater, tileIndex: number): NativeTileSpec | undefined {
  if (tileIndex === 65535 || tileIndex === -1) tileIndex = 0;
  for (const [first, count, prefix, kind] of [...common, ...(theater === 'SNOW' ? snow : temperate)])
    if (tileIndex >= first && tileIndex < first + count) return { fileName: `${prefix}${String(tileIndex - first + 1).padStart(2, '0')}.${THEATER_EXTENSION[theater]}`, kind };
}
export function nativeTerrainFiles(): string[] {
  return NATIVE_THEATERS.flatMap(theater => [...common, ...(theater === 'SNOW' ? snow : temperate)].flatMap(([first, count]) => Array.from({ length: count }, (_, i) => nativeTileSpec(theater, first + i)!.fileName)));
}
export function nativeOverlaySpec(index: number): { name: string; kind: 'ore' | 'gems' } | undefined {
  // Indices are ORDER in OverlayTypes, not the INI's non-contiguous numeric keys.
  if (index >= 102 && index <= 121) return { name: `tib${String(index - 101).padStart(2, '0')}`, kind: 'ore' };
  if (index >= 27 && index <= 38) return { name: `gem${String(index - 26).padStart(2, '0')}`, kind: 'gems' };
}
export const NATIVE_STRUCTURE_SPECS = {
  CAOILD: { name: 'Tech Oil Derrick', footprint: [2, 2] as const, sprite: 'caoild', gameType: 'tech_oil' },
  CAAIRP: { name: 'Tech Airport', footprint: [3, 3] as const, sprite: 'caairp', gameType: 'tech_airport' },
} as const;
