import { unpackSection } from './compression.ts';
import { NATIVE_THEATERS, type NativeTheater } from './theater.ts';

export type MapRect = readonly [number, number, number, number];

export interface NativeCell {
  x: number;
  y: number;
  tileIndex: number;
  subTile: number;
  height: number;
  iceGrowth: number;
  overlay: number;
  overlayData: number;
}

export interface NativeStart {
  index: number;
  x: number;
  y: number;
}

export interface NativeStructure {
  id: string;
  owner: string;
  type: string;
  x: number;
  y: number;
  health: number;
  facing: number;
}

export interface NativeTerrainObject {
  x: number;
  y: number;
  type: string;
}

export interface NativeMap {
  name: string;
  theater: NativeTheater;
  size: MapRect;
  localSize: MapRect;
  cells: NativeCell[];
  starts: NativeStart[];
  structures: NativeStructure[];
  terrain: NativeTerrainObject[];
  lighting: { ambient: number; red: number; green: number; blue: number };
}

export type IniSections = Map<string, Map<string, string>>;

function check(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}

export function parseMapIni(text: string): IniSections {
  check(text.length <= 16 * 1024 * 1024, 'Map INI exceeds size limit');
  const sections: IniSections = new Map();
  let current: Map<string, string> | undefined;

  for (const raw of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = raw.split(';', 1)[0].trim();

    if (!line || line.startsWith('//')) continue;
    const header = /^\[([^\]]+)\]$/.exec(line);

    if (header) {
      const name = header[1].toLowerCase();
      current = sections.get(name) ?? new Map();
      sections.set(name, current);
      continue;
    }

    const equal = line.indexOf('=');

    if (equal < 0 || !current) continue;
    current.set(line.slice(0, equal).trim().toLowerCase(), line.slice(equal + 1).trim());
  }

  return sections;
}

/** Full native diamond, including the narrow reinforcement/camera border. */
export function nativeMapCoordinates(width: number, height: number): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 1; col <= width; col++) cells.push({ x: col + row, y: width - col + 1 + row });

    for (let col = 1; col < width; col++)
      cells.push({ x: col + row + 1, y: width - col + 1 + row });
  }

  return cells;
}

export function nativeDisplayPosition(cell: { x: number; y: number }, width: number) {
  return { x: (cell.x - cell.y + width - 1) / 2, y: (cell.x + cell.y - width - 1) / 2 };
}

export function isWithinLocalMap(
  cell: { x: number; y: number },
  map: Pick<NativeMap, 'size' | 'localSize'>,
): boolean {
  const p = nativeDisplayPosition(cell, map.size[2]),
    [x, y, width, height] = map.localSize;

  return p.x >= x && p.x < x + width && p.y >= y && p.y < y + height;
}

/** Read ordinary FinalAlert2/RA2 INI map data. Missing native clear cells are filled. */
export function parseNativeMap(text: string): NativeMap {
  const sections = parseMapIni(text),
    info = sections.get('map');

  check(info, 'Missing [Map] section');

  const rectangle = (value: string | undefined, name: string): MapRect => {
    const result = value?.split(',').map(Number);
    check(result?.length === 4 && result.every(Number.isInteger), `Invalid ${name}`);

    return [result[0], result[1], result[2], result[3]];
  };

  const size = rectangle(info.get('size'), 'Map.Size'),
    localSize = rectangle(info.get('localsize') ?? info.get('size'), 'Map.LocalSize');

  check(
    size[0] === 0 &&
      size[1] === 0 &&
      size[2] > 0 &&
      size[3] > 0 &&
      size[2] + size[3] < 512 &&
      size[2] <= 256 &&
      size[3] <= 256,
    'Invalid native map dimensions',
  );
  check(
    localSize[0] >= 0 &&
      localSize[1] >= 0 &&
      localSize[2] > 0 &&
      localSize[3] > 0 &&
      localSize[0] + localSize[2] <= size[2] &&
      localSize[1] + localSize[3] <= size[3],
    'Invalid native playable bounds',
  );
  const theaterName = info.get('theater')?.toUpperCase();
  const theater = NATIVE_THEATERS.find((value) => value === theaterName);
  check(theater, `Unsupported map theater: ${theaterName}`);

  const packed = (name: string, codec: 'lzo' | 'lcw', limit: number) => {
    const section = sections.get(name.toLowerCase());
    check(section?.size, `Missing [${name}] section`);
    const entries = [...section.entries()];
    check(
      entries.every(([key]) => /^\d+$/.test(key)),
      `Invalid ${name} chunk key`,
    );
    entries.sort(([a], [b]) => Number(a) - Number(b));

    return unpackSection(entries.map(([, value]) => value).join(''), codec, limit);
  };

  const bytes = packed('IsoMapPack5', 'lzo', (size[2] * 2 - 1) * size[3] * 11 + 4);

  const overlay = sections.has('overlaypack')
    ? packed('OverlayPack', 'lcw', 512 * 512)
    : new Uint8Array(512 * 512).fill(255);

  const overlayData = sections.has('overlaydatapack')
    ? packed('OverlayDataPack', 'lcw', 512 * 512)
    : new Uint8Array(512 * 512);

  check(
    overlay.length === 512 * 512 && overlayData.length === 512 * 512,
    'Invalid native overlay grid size',
  );

  const cells: NativeCell[] = nativeMapCoordinates(size[2], size[3]).map(({ x, y }) => ({
    x,
    y,
    tileIndex: 0,
    subTile: 0,
    height: 0,
    iceGrowth: 0,
    overlay: overlay[x + 512 * y],
    overlayData: overlayData[x + 512 * y],
  }));

  const byPosition = new Map(cells.map((cell) => [cell.x + 512 * cell.y, cell]));

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    seen = new Set<number>();

  let p = 0;

  while (p + 4 <= bytes.length) {
    const x = view.getUint16(p, true),
      y = view.getUint16(p + 2, true);

    if (x === 0 && y === 0) {
      check(p + 4 === bytes.length, 'Trailing data after native terrain terminator');
      p += 4;
      break;
    }

    check(p + 11 <= bytes.length, 'Truncated native terrain cell');

    const key = x + 512 * y,
      cell = byPosition.get(key);

    check(cell && !seen.has(key), 'Invalid or duplicate native terrain coordinate');
    seen.add(key);
    cell.tileIndex = view.getInt32(p + 4, true);
    cell.subTile = bytes[p + 8];
    cell.height = bytes[p + 9];
    cell.iceGrowth = bytes[p + 10];
    check(
      cell.height <= 14 && (cell.tileIndex >= 0 || cell.tileIndex === -1),
      'Invalid native tile or elevation',
    );
    p += 11;
  }

  check(p === bytes.length && seen.size > 0, 'Invalid native terrain pack length');

  const coordinate = (value: string) => {
    const n = Number(value);
    check(Number.isInteger(n) && n >= 0, 'Invalid native waypoint coordinate');

    return { x: n % 1000, y: Math.floor(n / 1000) };
  };

  const starts = [...(sections.get('waypoints') ?? [])]
    .flatMap(([key, value]) =>
      /^\d+$/.test(key) && Number(key) < 8 ? [{ index: Number(key), ...coordinate(value) }] : [],
    )
    .sort((a, b) => a.index - b.index);

  const structures: NativeStructure[] = [...(sections.get('structures') ?? [])].map(
    ([id, value]) => {
      const fields = value.split(',');
      check(fields.length >= 6, 'Invalid native structure record');
      const [health, x, y, facing] = fields.slice(2, 6).map(Number);
      check(
        [health, x, y, facing].every(Number.isInteger) &&
          health >= 0 &&
          health <= 256 &&
          facing >= 0 &&
          facing <= 255,
        'Invalid native structure values',
      );

      return { id, owner: fields[0], type: fields[1].toUpperCase(), health, x, y, facing };
    },
  );

  const terrain = [...(sections.get('terrain') ?? [])].map(([key, value]) => ({
    ...coordinate(key),
    type: value.split(',')[0].toUpperCase(),
  }));

  for (const item of [...starts, ...structures, ...terrain])
    check(byPosition.has(item.x + 512 * item.y), 'Native object outside map');
  const light = sections.get('lighting');

  const component = (name: string) => {
    const n = Number(light?.get(name) ?? 1);

    return Number.isFinite(n) ? Math.min(2, Math.max(0, n)) : 1;
  };

  return {
    name: sections.get('basic')?.get('name') ?? 'Untitled map',
    theater,
    size,
    localSize,
    cells,
    starts,
    structures,
    terrain,
    lighting: {
      ambient: component('ambient'),
      red: component('red'),
      green: component('green'),
      blue: component('blue'),
    },
  };
}
