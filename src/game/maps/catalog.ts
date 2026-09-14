import type { NativeTheater } from './theater.ts';

export interface MapCatalogEntry {
  id: string; name: string; path: string; players: 6; size: readonly [number, number]; theater: NativeTheater; style: string; description: string;
}
export const MAP_CATALOG: readonly MapCatalogEntry[] = [
  { id: 'emerald-divide', name: 'Emerald Divide', path: '/maps/emerald-divide.map', players: 6, size: [96, 96], theater: 'TEMPERATE', style: 'Lake country', description: 'Two long lakes frame a wide central saddle. Green meadows connect every base around both shores.' },
  { id: 'frostline-basin', name: 'Frostline Basin', path: '/maps/frostline-basin.map', players: 6, size: [96, 96], theater: 'SNOW', style: 'Winter basin', description: 'Scattered glacial lakes and icy ground interrupt broad snowfields. Open routes weave between the basins.' },
  { id: 'saffron-wash', name: 'Saffron Wash', path: '/maps/saffron-wash.map', players: 6, size: [96, 96], theater: 'TEMPERATE', style: 'Dry wash', description: 'Palm-dotted sand surrounds a contested oasis. Six expansive starting plots open onto a broad mineral plain.' },
  { id: 'ironwood-crossing', name: 'Ironwood Crossing', path: '/maps/ironwood-crossing.map', players: 6, size: [96, 96], theater: 'TEMPERATE', style: 'Woodland roads', description: 'Paved crossroads divide wooded belts and open meadows. Generous clearings offer room to build and flank.' },
  { id: 'slatewater-reach', name: 'Slatewater Reach', path: '/maps/slatewater-reach.map', players: 6, size: [96, 96], theater: 'URBAN', style: 'Industrial waterfront', description: 'Harbor inlets cut into an industrial waterfront. A broad inland boulevard keeps the six districts connected.' },
  { id: 'copperhead-mesa', name: 'Copperhead Mesa', path: '/maps/copperhead-mesa.map', players: 6, size: [96, 96], theater: 'TEMPERATE', style: 'Mineral plain', description: 'Wide sandy shelves and sparse palms form a flat, buildable mesa. Radial approaches lead to central tech.' },
  { id: 'whiteout-causeway', name: 'Whiteout Causeway', path: '/maps/whiteout-causeway.map', players: 6, size: [96, 96], theater: 'SNOW', style: 'Snow causeway', description: 'Twin winter lakes leave a wide central causeway and outer snow routes. Airfields overlook the crossing.' },
  { id: 'tidal-crown', name: 'Tidal Crown', path: '/maps/tidal-crown.map', players: 6, size: [96, 96], theater: 'URBAN', style: 'Coastal crescent', description: 'A crescent bay borders a connected coastal plain. Parks and paved districts wrap around the inland crown.' },
];
