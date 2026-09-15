import { existsSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NativeCursors } from './NativeCursor';
import { MixArchive } from './formats';
import { TestCanvas, testCursorShape } from './asset-test-fixtures';

const palette = () => { const bytes = new Uint8Array(768); bytes.set([63, 31, 7], 30); return bytes; };
afterEach(() => vi.unstubAllGlobals());
describe('original mouse cursors', () => {
  it('preserves full canvas offsets and original palette pixels', () => {
    const image = new NativeCursors(testCursorShape(), palette()).rasterize(18);
    expect([image.width, image.height]).toEqual([55, 43]);
    expect([...image.pixels.slice((9 * 55 + 11) * 4, (9 * 55 + 12) * 4)]).toEqual([252, 124, 28, 255]);
    expect(image.pixels[3]).toBe(0);
  });
  it('uses the authored frame ranges and keeps blocked states static', () => {
    const cursors = new NativeCursors(testCursorShape(), palette());
    expect([cursors.frame('repair', 0), cursors.frame('repair', 1900), cursors.frame('repair', 2000)]).toEqual([170, 189, 170]);
    expect(cursors.frame('move-blocked', 9999)).toBe(41);
    expect(cursors.frame('scroll-ne-blocked')).toBe(11);
    expect(cursors.frame('attackmove')).toBe(404);
  });
  it('caches cursor images with native hotspots and a visible viewport-edge fallback', () => {
    let rendered = 0;
    vi.stubGlobal('document', { createElement: () => Object.assign(new TestCanvas(), { toDataURL: () => `data:image/png;base64,frame${rendered++}` }) });
    const cursors = new NativeCursors(testCursorShape(), palette());
    expect(cursors.css('default')).toContain('0 0, default');
    expect(cursors.css('default')).toContain('frame0');
    expect(cursors.css('move')).toContain('28 21, default');
    cursors.css('move', 1000);
    expect(rendered).toBe(2);
  });
  it('rejects missing frames, wrong native dimensions and truncated palettes', () => {
    expect(() => new NativeCursors(testCursorShape(40), palette())).toThrow('Missing original cursor');
    const bytes = testCursorShape(); new DataView(bytes.buffer).setUint16(2, 54, true);
    expect(() => new NativeCursors(bytes, palette())).toThrow('55×43');
    expect(() => new NativeCursors(testCursorShape(), new Uint8Array(10))).toThrow();
  });
  it.skipIf(!existsSync('/tmp/ra2-assets/ra2.mix'))('decodes every consumed state from the actual original mouse sheet and palette', () => {
    const root = new MixArchive(readFileSync('/tmp/ra2-assets/ra2.mix'));
    const shape = new MixArchive(root.get('conquer.mix')!).get('mouse.shp')!;
    const pal = new MixArchive(root.get('cache.mix')!).get('mousepal.pal')!;
    const cursors = new NativeCursors(shape, pal);
    const arrow = cursors.rasterize(0), attack = cursors.rasterize(58);
    expect([shape.length, pal.length, arrow.width, arrow.height]).toEqual([359800, 768, 55, 43]);
    expect(arrow.pixels.filter((_, i) => i % 4 === 3 && arrow.pixels[i]).length).toBeGreaterThan(100);
    expect(arrow.pixels).not.toEqual(attack.pixels);
  });
});
