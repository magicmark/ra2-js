import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import { alphaBounds, CustomArt, CUSTOM_ART_URLS, georgeAtlasFrame, georgeFrameRegion } from '../src/assets/CustomArt';
import { BUTCHERS_PROJECTION, BUTCHERS_PROJECTION_Y } from '../src/assets/ButchersProjection';
import { Camera } from '../src/render/Camera';

// Decode the checked-in RGBA PNGs independently of browser canvas/image loading.
function rgbaPng(path: string) {
  const png = readFileSync(path), chunks: Buffer[] = [];
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  expect(png[24]).toBe(8); expect(png[25]).toBe(6); expect(png[28]).toBe(0);
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset), type = png.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const data = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = new Uint8ClampedArray(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = data[y * (stride + 1)]; expect(filter).toBeLessThanOrEqual(4);
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? pixels[y * stride + x - 4] : 0, b = y ? pixels[(y - 1) * stride + x] : 0, c = y && x >= 4 ? pixels[(y - 1) * stride + x - 4] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const predictor = [0, a, b, Math.floor((a + b) / 2), pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      pixels[y * stride + x] = (data[y * (stride + 1) + x + 1] + predictor) & 255;
    }
  }
  return { width, height, pixels };
}

/** Canvas metadata fixture: production CustomArt computes anchors from real PNG
 * pixels, while raster drawing itself remains covered by browser acceptance. */
function buildingSprite(building: ReturnType<typeof rgbaPng>, name = 'butchers') {
  const imagePixels = new Map<object, Uint8ClampedArray>();
  const image = (decoded: ReturnType<typeof rgbaPng>) => {
    const value = { naturalWidth: decoded.width, naturalHeight: decoded.height } as HTMLImageElement;
    imagePixels.set(value, decoded.pixels); return value;
  };
  const buildingImage = image(building), infantryImage = image(rgbaPng(`public${CUSTOM_ART_URLS.infantry}`));
  vi.stubGlobal('document', { createElement: () => {
    let drawnPixels: Uint8ClampedArray;
    const context = {
      drawImage: (source: object) => { drawnPixels = imagePixels.get(source)!; },
      getImageData: () => ({ data: drawnPixels }), save() {}, restore() {}, fillRect() {},
    };
    return { width: 0, height: 0, getContext: () => context };
  } });
  try {
    return new CustomArt({ building: buildingImage, infantry: infantryImage, buildingCameo: buildingImage, infantryCameo: buildingImage }).getSprite(name)!;
  } finally { vi.unstubAllGlobals(); }
}

describe('bundled imagegen artwork', () => {
  it('ships four real PNGs and preserves actual alpha around the painted building foundation', () => {
    for (const url of Object.values(CUSTOM_ART_URLS)) expect(readFileSync(`public${url}`).toString('ascii', 1, 4)).toBe('PNG');
    const { width, height, pixels } = rgbaPng(`public${CUSTOM_ART_URLS.building}`), b = alphaBounds(pixels, width, height);
    expect(pixels[3]).toBe(0); expect(b.top).toBeGreaterThan(100);
    expect(height - b.bottom).toBeGreaterThan(80); // A whole-image-bottom anchor would visibly float.
    expect(b.right - b.left).toBeGreaterThan(1100);
    expect(b.bottom).toBeGreaterThan(1000);
    // Measured source projection is calibrated to the actual camera grid.
    const paintedHeight = (b.bottom - b.top) * 180 / (b.right - b.left) * BUTCHERS_PROJECTION_Y;
    expect(paintedHeight).toBeGreaterThan(115); expect(paintedHeight).toBeLessThan(122);
    expect(b.right - b.left).toBe(BUTCHERS_PROJECTION.paintedWidth);
    const bottomAt = (x: number) => {
      for (let y = height - 1; y >= 0; y--) if (pixels[(y * width + x) * 4 + 3] >= 128) return y;
      throw new Error('Foundation edge missing');
    };
    const edges = [[.1, .4], [.6, .9]].map(([start, end]) => {
      const points = Array.from({ length: Math.floor((end - start) * (b.right - b.left)) }, (_, i) => {
        const x = Math.round(b.left + start * (b.right - b.left)) + i; return { x, y: bottomAt(x) };
      });
      const mx = points.reduce((sum, p) => sum + p.x, 0) / points.length, my = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      const slope = points.reduce((sum, p) => sum + (p.x - mx) * (p.y - my), 0) / points.reduce((sum, p) => sum + (p.x - mx) ** 2, 0);
      const intercept = my - slope * mx;
      expect(Math.abs(slope * BUTCHERS_PROJECTION_Y)).toBeCloseTo(.5, 2);
      expect(Math.sqrt(points.reduce((sum, p) => sum + (p.y - slope * p.x - intercept) ** 2, 0) / points.length)).toBeLessThan(.75);
      return { slope, intercept };
    });
    const corner = (edges[1].intercept - edges[0].intercept) / (edges[0].slope - edges[1].slope);
    expect(Math.abs(corner - BUTCHERS_PROJECTION.frontCorner.x) * 180 / BUTCHERS_PROJECTION.paintedWidth).toBeLessThan(.1);
    expect(Math.abs(corner - (b.left + b.right) / 2) * 180 / BUTCHERS_PROJECTION.paintedWidth).toBeLessThan(.5);
    const rendered = buildingSprite({ width, height, pixels }), camera = new Camera();
    const sourceFrontY = edges[0].slope * corner + edges[0].intercept;
    const actualFrontOffset = sourceFrontY * 180 / BUTCHERS_PROJECTION.paintedWidth * BUTCHERS_PROJECTION_Y - rendered.anchorY;
    const engineFrontOffset = camera.project(3, 3).y - camera.project(1.5, 1.5).y;
    expect(engineFrontOffset).toBe(45);
    expect(Math.abs(actualFrontOffset - engineFrontOffset)).toBeLessThan(.1);
  });

  it('decodes all32 directional frames, separates the east muzzle, and keeps north flash and boot registration', () => {
    const { width, height, pixels } = rgbaPng(`public${CUSTOM_ART_URLS.infantry}`);
    expect([width, height]).toEqual([1774, 887]); expect(pixels[3]).toBe(0);
    for (let row = 0; row < 4; row++) for (let column = 0; column < 8; column++) {
      const { grid, crop } = georgeFrameRegion(width, height, row, column), b = alphaBounds(pixels, width, height, crop, 128);
      expect(b.bottom - b.top).toBeGreaterThan(150);
      expect(b.right - b.left).toBeGreaterThan(75);
      const factor = 34 / (grid.right - grid.left), anchorY = (b.bottom - grid.top) * factor;
      expect(anchorY).toBeGreaterThan(28); expect(anchorY).toBeLessThan(35);
      if (row === 0) {
        const paintedHeight = (b.bottom - b.top) * factor;
        expect(paintedHeight).toBeGreaterThanOrEqual(26); expect(paintedHeight).toBeLessThanOrEqual(31);
      }
    }
    const rendered = buildingSprite(rgbaPng(`public${CUSTOM_ART_URLS.building}`), 'george');
    expect(rendered.width).toBe(36); expect(rendered.height).toBe(36);
    expect(rendered.anchorX).toBe(18); expect(rendered.anchorY).toBeGreaterThan(28); expect(rendered.anchorY).toBeLessThan(35);
    const east = georgeFrameRegion(width, height, 3, 6), northeast = georgeFrameRegion(width, height, 3, 7);
    expect(east.crop.right).toBe(1556); expect(northeast.crop.left).toBe(1556);
    expect(alphaBounds(pixels, width, height, east.crop).right).toBeGreaterThan(east.grid.right);
    expect(alphaBounds(pixels, width, height, northeast.crop).left).toBeGreaterThan(northeast.crop.left);
    const north = georgeFrameRegion(width, height, 3, 0);
    expect(alphaBounds(pixels, width, height, north.crop).top).toBe(north.grid.top);
    expect(georgeFrameRegion(width, height, 3, 7).crop.right).toBe(width);
  });

  it('keeps eight facings and inserts a passing pose between walking contacts over a 0.6-second cycle', () => {
    for (let facing = 0; facing < 8; facing++) {
      expect(georgeAtlasFrame('Ready', facing, 0)).toEqual({ column: facing, row: 0 });
      for (const [age, row] of [[0, 1], [.15, 0], [.3, 2], [.45, 0], [.6, 1]] as const) {
        expect(georgeAtlasFrame('Walk', facing, age)).toEqual({ column: facing, row });
        expect(georgeAtlasFrame('Walk', facing, age + 6)).toEqual({ column: facing, row });
      }
      expect(georgeAtlasFrame('Walk', facing, .15 - 1e-6).row).toBe(1);
      expect(georgeAtlasFrame('Walk', facing, .3 - 1e-6).row).toBe(0);
      expect(georgeAtlasFrame('FireUp', facing, 0).row).toBe(0);
      expect(georgeAtlasFrame('FireUp', facing, 1 / 30)).toEqual({ column: facing, row: 3 });
      expect(georgeAtlasFrame('FireUp', facing, 4 / 30).row).toBe(0);
    }
  });
});
