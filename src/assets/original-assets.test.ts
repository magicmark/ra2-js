import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATALOG, NESTED_MIXES, UI_FILES, theaterNames, wantedFiles } from './catalog';
import { decodePalette, decodeTmp, decodeVpl, decodeVxl, MixArchive, ShpFile } from './formats';

// Opt-in integration fixture: never commit the original game archives.
// RA2_ASSET_DIR=/path/to/extracted/mixes npm test
describe.skipIf(!process.env.RA2_ASSET_DIR)('the original Red Alert 2 game archives', () => {
  it('resolves every shipped unit, cameo, terrain and scenery asset from real encrypted MIX files', () => {
    const archives: MixArchive[] = [];
    const visit = (name: string, bytes: Uint8Array) => {
      const archive = new MixArchive(bytes, name); archives.push(archive);
      for (const nested of NESTED_MIXES) { const bytes = archive.get(nested); if (bytes) visit(nested, bytes); }
    };
    for (const name of ['ra2.mix', 'language.mix']) visit(name, readFileSync(join(process.env.RA2_ASSET_DIR!, name)));
    const wanted = wantedFiles();
    const get = (name: string): Uint8Array | undefined => wanted.has(name) ? archives.map(a => a.get(name)).find(Boolean) : undefined;
    const shape = (name: string) => theaterNames(name).flatMap(n => [n + '.shp', n + '.tem']).map(get).find(Boolean);
    expect(archives.some(a => a.encrypted)).toBe(true);
    expect(decodePalette(get('unittem.pal')!)).toHaveLength(768);
    expect(decodeVpl(get('voxels.vpl')!)).toHaveLength(8192);
    for (const [name, spec] of Object.entries(CATALOG)) {
      if (spec.kind === 'vehicle') expect(decodeVxl(get(spec.sprite + '.vxl')!).flatMap(l => l.voxels).length, name).toBeGreaterThan(0);
      else expect(new ShpFile(shape(spec.sprite)!).frame().pixels.some(p => p > 0), name).toBe(true);
      expect(new ShpFile(shape(spec.cameo)!).frame().pixels.some(p => p > 0), `${name} cameo`).toBe(true);
      if (spec.bib) expect(new ShpFile(shape(spec.bib)!).frame().pixels.some(p => p > 0), `${name} foundation`).toBe(true);
      if (spec.turret) expect(decodeVxl(get(spec.turret + '.vxl')!).flatMap(l => l.voxels).length, `${name} turret`).toBeGreaterThan(0);
      for (const overlay of spec.overlays ?? []) expect(shape(overlay), `${name} animation ${overlay}`).toBeDefined();
    }
    for (const name of ['clear01.tem', 'water01.tem', 'rough01.tem', 'pave01.tem']) expect(decodeTmp(get(name)!).pixels.some(p => p > 0), name).toBe(true);
    for (const name of ['proad01.tem', 'proad02.tem', 'proad03.tem', 'ruff01.tem', 'green01.tem']) expect(decodeTmp(get(name)!).pixels.some(p => p > 0), name).toBe(true);
    for (const faction of ['sidec01.mix', 'sidec02.mix']) {
      const archive = archives.find(a => a.name === faction)!;
      for (const name of UI_FILES) expect(archive.get(name), `${faction}/${name}`).toBeDefined();
    }
    for (const name of ['tib01', 'tib02', 'tib03', 'tib04', 'tib05', 'tib06', 'tree01', 'tree02', 'tree03', 'tree04', 'tree05', 'tree06', 'tree07', 'tree08']) expect(new ShpFile(shape(name)!).frame().pixels.some(p => p > 0), name).toBe(true);
  });
});
