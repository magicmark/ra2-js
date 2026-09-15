import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { MixArchive } from '../src/assets/formats';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap, type NativeMap } from '../src/game/maps/nativeMap';
import { unpackSection } from '../src/game/maps/compression';

// Independent of the generator and its theater.kind lookup. Original TMP bytes
// supply land/ramp types; original INIs supply tile indices and building sizes.
const hash = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');

type Ini = Record<string, Record<string, string>>;

function ini(text: string) {
  const result: Ini = {};
  let section: Record<string, string> = {};

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/;.*/, '').trim(),
      header = /^\[(.+)\]$/.exec(line);

    if (header) section = result[header[1].toLowerCase()] ??= {};
    else {
      const equal = line.indexOf('=');

      if (equal >= 0)
        section[line.slice(0, equal).trim().toLowerCase()] = line.slice(equal + 1).trim();
    }
  }

  return result;
}

const textOf = (id: string) =>
  readFileSync(join(process.cwd(), 'public/maps', id + '.map'), 'utf8');

const key = (x: number, y: number) => x + y * 512;

const directions = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function flood(origin: number, passable: Set<number>): Map<number, number> {
  const distance = new Map<number, number>();

  if (!passable.has(origin)) return distance;
  const pending = [origin];
  distance.set(origin, 0);

  for (let p = 0; p < pending.length; p++) {
    const cell = pending[p];

    for (const [dx, dy] of directions) {
      const next = cell + dx + 512 * dy;

      if (passable.has(next) && !distance.has(next)) {
        distance.set(next, distance.get(cell)! + 1);
        pending.push(next);
      }
    }
  }

  return distance;
}

function referenceDecode(text: string) {
  // SAFETY: our independent Python decoder emits section names with base64 data and an integer block count.
  return JSON.parse(
    execFileSync('python3', ['tests/helpers/native-reference-decode.py'], {
      input: text,
      maxBuffer: 12 * 1024 * 1024,
    }).toString(),
  ) as Record<string, { data: string; blocks: number }>;
}

function compareReference(text: string) {
  const sections = ini(text),
    reference = referenceDecode(text),
    evidence: Record<string, { bytes: number; sha256: string; blocks: number }> = {};

  for (const name of ['IsoMapPack5', 'OverlayPack', 'OverlayDataPack']) {
    const packed = Object.entries(sections[name.toLowerCase()])
      .sort((a, b) => +a[0] - +b[0])
      .map((e) => e[1])
      .join('');

    const actual = unpackSection(packed, name === 'IsoMapPack5' ? 'lzo' : 'lcw');
    expect(hash(actual), name).toBe(hash(Buffer.from(reference[name].data, 'base64')));
    evidence[name] = { bytes: actual.length, sha256: hash(actual), blocks: reference[name].blocks };
  }

  return evidence;
}

it('ships eight distinct complete native six-player medium maps', () => {
  expect(MAP_CATALOG).toHaveLength(8);
  const hashes = new Set<string>();

  for (const entry of MAP_CATALOG) {
    const text = textOf(entry.id),
      map = parseNativeMap(text);

    expect(map.size).toEqual([0, 0, 96, 96]);
    expect(entry.size, `${entry.id} sidebar dimensions must match the map file`).toEqual(
      map.size.slice(2),
    );
    expect(map.localSize).toEqual([3, 4, 90, 86]);
    expect(map.cells).toHaveLength(18336);
    expect(new Set(map.cells.map((c) => key(c.x, c.y))).size).toBe(18336);
    expect(map.starts.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(map.name).toBe(entry.name);
    expect(map.theater).toBe(entry.theater);
    expect(
      map.structures.some((s) => s.type === 'CAOILD' && s.owner.toLowerCase() === 'neutral'),
    ).toBe(true);
    expect(
      map.structures.some((s) => s.type === 'CAAIRP' && s.owner.toLowerCase() === 'neutral'),
    ).toBe(true);
    hashes.add(hash(JSON.stringify(map.cells)));
  }

  expect(hashes.size).toBe(8);
});

const originalDir = process.env.RA2_ASSET_DIR;

interface MapEvidence {
  sha256: string;
  reference: ReturnType<typeof compareReference>;
  localCells: number;
  landCounts: Record<string, number>;
  terrainFiles: string[];
  landFraction: number;
  buildableFraction: number;
  connectedFraction: number;
  broadRouteCells: number;
  minStartSeparation: number;
  nearbyOreBalance: number;
  starts: {
    index: number;
    x: number;
    y: number;
    nearestOre: number;
    oreCellsWithin20: number;
    oreUnitsWithin20: number;
    neutralDistances: number[];
  }[];
  structures: NativeMap['structures'];
}

const evidence: Record<string, MapEvidence> = {};

describe.skipIf(!originalDir)(
  'independent native-map acceptance using original MIX terrain/rules',
  () => {
    const archives: MixArchive[] = [];
    let rules: ReturnType<typeof ini>, art: ReturnType<typeof ini>;

    const get = (name: string) => {
      const value = archives.map((a) => a.get(name)).find(Boolean);

      if (!value) throw new Error(`Original fixture missing ${name}`);

      return value;
    };

    beforeAll(() => {
      const nested = [
        'local.mix',
        'cache.mix',
        'generic.mix',
        'conquer.mix',
        'isogen.mix',
        'isotemp.mix',
        'isosnow.mix',
        'isourb.mix',
        'temperat.mix',
        'snow.mix',
        'urban.mix',
        'neutral.mix',
      ];

      const visit = (bytes: Uint8Array, name: string) => {
        const archive = new MixArchive(bytes, name);
        archives.push(archive);

        for (const n of nested) {
          const b = archive.get(n);

          if (b) visit(b, n);
        }
      };

      visit(readFileSync(join(originalDir!, 'ra2.mix')), 'ra2.mix');
      rules = ini(new TextDecoder().decode(get('rules.ini')));
      art = ini(new TextDecoder().decode(get('art.ini')));
    });

    for (const entry of MAP_CATALOG)
      it(`${entry.name}: decoded native land, six starts, ore, neutral access`, () => {
        const text = textOf(entry.id),
          map = parseNativeMap(text);

        const reference = compareReference(text);

        const theaterFile = { TEMPERATE: 'temperat.ini', SNOW: 'snow.ini', URBAN: 'urban.ini' }[
          map.theater
        ];

        const extension = { TEMPERATE: 'tem', SNOW: 'sno', URBAN: 'urb' }[map.theater];
        const theater = ini(new TextDecoder().decode(get(theaterFile)));
        const templates: string[] = [];

        for (const [section, values] of Object.entries(theater)
          .filter(([name]) => /^tileset\d+$/.test(name))
          .sort((a, b) => +a[0].slice(7) - +b[0].slice(7))) {
          for (let n = 1; n <= +(values.tilesinset ?? 0); n++)
            templates.push(
              `${values.filename.toLowerCase()}${String(n).padStart(2, '0')}.${extension}`,
            );
          expect(section.startsWith('tileset')).toBe(true);
        }

        const local = (x: number, y: number) => {
          const screenColumn = (x - y + map.size[2] - 1) / 2,
            screenRow = (x + y - map.size[2] - 1) / 2;

          return (
            screenColumn >= map.localSize[0] &&
            screenColumn < map.localSize[0] + map.localSize[2] &&
            screenRow >= map.localSize[1] &&
            screenRow < map.localSize[1] + map.localSize[3]
          );
        };

        // TMP codes differ from the engine Rules LandType enum. Independent source:
        // CnCNet/WorldAlteringEditor, src/MapEditorLibrary/Helpers.cs GetLandTypeName.
        const landNames = [
          'clear',
          'ice',
          'ice',
          'ice',
          'ice',
          'tunnel',
          'railroad',
          'rock',
          'rock',
          'water',
          'beach',
          'road',
          'road',
          'clear',
          'rough',
          'rock',
        ];

        const overlayNames = Object.values(rules.overlaytypes);

        const land = new Set<number>(),
          buildable = new Set<number>(),
          ore = new Map<number, number>();

        const blocked = new Set(map.terrain.map((t) => key(t.x, t.y)));
        const structureEdges: number[][] = [];

        for (const s of map.structures) {
          expect(s.owner.toLowerCase()).toBe('neutral');

          const foundation = art[s.type.toLowerCase()].foundation.split('x').map(Number),
            edge: number[] = [];

          for (let y = -1; y <= foundation[1]; y++)
            for (let x = -1; x <= foundation[0]; x++) {
              const k = key(s.x + x, s.y + y);

              if (x >= 0 && y >= 0 && x < foundation[0] && y < foundation[1]) {
                expect(blocked.has(k), 'overlapping objects').toBe(false);
                blocked.add(k);
              } else edge.push(k);
            }

          structureEdges.push(edge);
        }

        const tileInfo = new Map<
          string,
          { landType: number; ramp: number; height: number; file: string }
        >();

        const landCounts: Record<string, number> = {};
        let localCells = 0;

        for (const cell of map.cells) {
          const tileIndex = cell.tileIndex === -1 || cell.tileIndex === 65535 ? 0 : cell.tileIndex;
          const file = templates[tileIndex];
          expect(file, `native template ${tileIndex}`).toBeDefined();
          const cacheKey = `${tileIndex}:${cell.subTile}`;
          let data = tileInfo.get(cacheKey);

          if (!data) {
            const bytes = get(file),
              view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

            const count = view.getUint32(0, true) * view.getUint32(4, true);
            expect(cell.subTile, file).toBeLessThan(count);
            const offset = view.getUint32(16 + cell.subTile * 4, true);
            expect(offset, file).toBeGreaterThan(0);
            // WAE TmpImage: nine uint32s, flags uint32, then height/terrain/ramp.
            data = {
              landType: bytes[offset + 41],
              ramp: bytes[offset + 42],
              height: bytes[offset + 40],
              file,
            };
            tileInfo.set(cacheKey, data);
          }

          if (!local(cell.x, cell.y)) continue;
          localCells++;
          const name = landNames[data.landType];
          expect(name, `${file}: native terrain byte`).toBeDefined();
          landCounts[name] = (landCounts[name] ?? 0) + 1;

          const k = key(cell.x, cell.y),
            rule = rules[name];

          if (
            parseFloat(rule?.foot ?? '0') > 0 &&
            parseFloat(rule?.track ?? '0') > 0 &&
            data.ramp === 0
          )
            land.add(k);

          if (rule?.buildable?.toLowerCase() === 'yes' && data.ramp === 0) buildable.add(k);

          // OverlayTypes values are ordered IDs; don't reuse nativeOverlaySpec.
          if (/^tib\d+$/i.test(overlayNames[cell.overlay] ?? '')) ore.set(k, cell.overlayData + 1);
        }

        // These authored maps are flat; no false connectivity across cliff heights.
        expect(new Set(map.cells.map((c) => c.height)).size).toBe(1);
        const passable = new Set([...land].filter((k) => !blocked.has(k)));
        const connected = flood(key(map.starts[0].x, map.starts[0].y), passable);
        expect(land.size / localCells, 'broad connected land fraction').toBeGreaterThan(0.72);
        expect(buildable.size / localCells, 'broad native buildable fraction').toBeGreaterThan(0.7);
        expect(connected.size / passable.size, 'dominant land component').toBeGreaterThan(0.97);

        // Eroding land by two cells rejects layouts joined only by tiny chokepoints.
        const broad = new Set(
          [...passable].filter((k) => {
            for (let y = -2; y <= 2; y++)
              for (let x = -2; x <= 2; x++) if (!passable.has(k + x + 512 * y)) return false;

            return true;
          }),
        );

        const broadConnected = flood(key(map.starts[0].x, map.starts[0].y), broad);

        const startMetrics = map.starts.map((start) => {
          const k = key(start.x, start.y);
          expect
            .soft(broadConnected.has(k), `start ${start.index}: five-cell-wide inter-base routes`)
            .toBe(true);

          for (let y = -5; y <= 5; y++)
            for (let x = -5; x <= 5; x++) {
              const plot = key(start.x + x, start.y + y);
              expect(
                buildable.has(plot) && !blocked.has(plot) && !ore.has(plot),
                `clear 11x11 base plot at start ${start.index}`,
              ).toBe(true);
            }

          const distances = flood(k, passable);
          const reachableOre = [...ore].filter(([p]) => distances.has(p));
          const nearby = reachableOre.filter(([p]) => distances.get(p)! <= 20);
          expect(
            nearby.length,
            `start ${start.index}: reachable ore within 20 ground steps`,
          ).toBeGreaterThanOrEqual(40);
          const nearestOre = Math.min(...reachableOre.map(([p]) => distances.get(p)!));
          expect(nearestOre).toBeLessThanOrEqual(15);

          const neutralDistances = structureEdges.map((edge) =>
            Math.min(...edge.map((p) => distances.get(p) ?? Infinity)),
          );

          expect
            .soft(
              neutralDistances.every(Number.isFinite),
              `start ${start.index}: unreachable neutral IDs ${neutralDistances.flatMap((d, i) => (Number.isFinite(d) ? [] : [map.structures[i].id]))}`,
            )
            .toBe(true);

          return {
            index: start.index,
            x: start.x,
            y: start.y,
            nearestOre,
            oreCellsWithin20: nearby.length,
            oreUnitsWithin20: nearby.reduce((n, [, value]) => n + value, 0),
            neutralDistances,
          };
        });

        const supplies = startMetrics.map((s) => s.oreUnitsWithin20),
          balance = Math.max(...supplies) / Math.min(...supplies);

        expect(balance, 'nearby ore balance max/min').toBeLessThanOrEqual(1.25);

        const separations = map.starts.flatMap((a, i) =>
          map.starts.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y)),
        );

        expect(Math.min(...separations)).toBeGreaterThanOrEqual(25);

        for (const s of map.structures) {
          const [w, h] = art[s.type.toLowerCase()].foundation.split('x').map(Number);

          for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++)
              expect(
                buildable.has(key(s.x + x, s.y + y)),
                'neutral on buildable native ground',
              ).toBe(true);
        }

        evidence[entry.id] = {
          sha256: hash(text),
          reference,
          localCells,
          landCounts,
          terrainFiles: [...new Set([...tileInfo.values()].map((t) => t.file))],
          landFraction: land.size / localCells,
          buildableFraction: buildable.size / localCells,
          connectedFraction: connected.size / passable.size,
          broadRouteCells: broadConnected.size,
          minStartSeparation: Math.min(...separations),
          nearbyOreBalance: balance,
          starts: startMetrics,
          structures: map.structures,
        };

        if (process.env.RA2_QA_REPORT) {
          mkdirSync(process.env.RA2_QA_REPORT, { recursive: true });
          writeFileSync(
            join(process.env.RA2_QA_REPORT, 'native-acceptance.json'),
            JSON.stringify(evidence, null, 2) + '\n',
          );
        }
      });
  },
);

it.skipIf(!process.env.RA2_REFERENCE_MAP)(
  'decodes an independently sourced native FinalAlert map, byte-identical to liblzo2/reference LCW',
  () => {
    const text = readFileSync(process.env.RA2_REFERENCE_MAP!, 'utf8');

    const result = compareReference(text),
      map: NativeMap = parseNativeMap(text);

    expect(map.cells.length).toBe((2 * map.size[2] - 1) * map.size[3]);
    expect(map.starts.length).toBeGreaterThan(1);

    if (process.env.RA2_QA_REPORT) {
      mkdirSync(process.env.RA2_QA_REPORT, { recursive: true });
      writeFileSync(
        join(process.env.RA2_QA_REPORT, 'reference-map.json'),
        JSON.stringify(
          {
            sourceSha256: hash(text),
            dimensions: map.size,
            cells: map.cells.length,
            starts: map.starts,
            sections: result,
          },
          null,
          2,
        ) + '\n',
      );
    }
  },
);
