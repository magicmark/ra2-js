import type { Sprite } from './AssetManager';
import { BUTCHERS_PROJECTION, BUTCHERS_PROJECTION_Y } from './ButchersProjection';
import { drawCameoCaption } from './CameoCaption';

export const CUSTOM_ART_URLS = {
  building: '/art/butchers/butchers.png',
  infantry: '/art/butchers/george-sheet.png',
  buildingCameo: '/art/butchers/butchers-cameo.png',
  infantryCameo: '/art/butchers/george-cameo.png',
} as const;
type ArtImages = Record<keyof typeof CUSTOM_ART_URLS, HTMLImageElement>;
export interface PixelBounds { left: number; top: number; right: number; bottom: number }
export function alphaBounds(pixels: Uint8ClampedArray, width: number, height: number, region: PixelBounds = { left: 0, top: 0, right: width, bottom: height }, threshold = 32): PixelBounds {
  let left = region.right, top = region.bottom, right = region.left, bottom = region.top;
  for (let y = region.top; y < region.bottom; y++) for (let x = region.left; x < region.right; x++) {
    if (pixels[(y * width + x) * 4 + 3] < threshold) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
  }
  if (left >= right || top >= bottom) throw new Error('Bundled artwork contains an empty sprite frame.');
  return { left, top, right, bottom };
}
export function georgeFrameRegion(width: number, height: number, row: number, column: number): { grid: PixelBounds; crop: PixelBounds } {
  const grid = { left: Math.round(column * width / 8), right: Math.round((column + 1) * width / 8), top: Math.round(row * height / 4), bottom: Math.round((row + 1) * height / 4) };
  const crop = { ...grid };
  // The authored east muzzle extends four source pixels into the northeast cell.
  // Assign that transparent margin to E; retain each body's original grid origin.
  if (row === 3 && column === 6) crop.right += 4;
  if (row === 3 && column === 7) crop.left += 4;
  return { grid, crop };
}
export function georgeAtlasFrame(action: string, facing: number, age: number): { column: number; row: number } {
  const tick = Math.max(0, Math.floor(age * 30 + 1e-7));
  // Both stride rows are contact poses. Pass through the authored feet-together
  // pose between contacts, over the same 0.6s cycle as the speed-4 native GI.
  const walkPhase = Math.floor(Math.max(0, age) / .15 + 1e-7) % 4;
  const row = action === 'Walk' ? [1, 0, 2, 0][walkPhase] : action === 'FireUp' && tick >= 1 && tick < 4 ? 3 : 0;
  return { column: ((Math.round(facing) % 8) + 8) % 8, row };
}
function canvas(width: number, height: number): HTMLCanvasElement {
  const result = document.createElement('canvas'); result.width = width; result.height = height; return result;
}
function sprite(source: HTMLCanvasElement, anchorX: number, anchorY: number): Sprite {
  return { source, width: source.width, height: source.height, anchorX, anchorY, offsetX: -anchorX, offsetY: -anchorY };
}
function pixels(image: HTMLImageElement): { source: HTMLCanvasElement; data: Uint8ClampedArray } {
  const source = canvas(image.naturalWidth, image.naturalHeight), context = source.getContext('2d')!;
  context.drawImage(image, 0, 0);
  return { source, data: context.getImageData(0, 0, source.width, source.height).data };
}

/** Authored PNG sprites. Only these named additions use this provider. */
export class CustomArt {
  private readonly building: Sprite;
  private readonly infantry: Sprite[] = [];
  private readonly cameos: Record<'butchers' | 'george', Sprite>;

  static async load(): Promise<CustomArt> {
    const entries = await Promise.all(Object.entries(CUSTOM_ART_URLS).map(async ([name, url]) => {
      const image = new Image(); image.decoding = 'async'; image.src = url;
      try { await image.decode(); } catch { throw new Error(`Unable to load bundled artwork ${url}. Reload the page to retry.`); }
      return [name, image] as const;
    }));
    return new CustomArt(Object.fromEntries(entries) as ArtImages);
  }

  constructor(images: ArtImages) {
    const building = pixels(images.building), b = alphaBounds(building.data, building.source.width, building.source.height);
    const scale = BUTCHERS_PROJECTION.gameWidth / (b.right - b.left), scaleY = scale * BUTCHERS_PROJECTION_Y;
    const source = canvas(Math.ceil(building.source.width * scale), Math.ceil(building.source.height * scaleY));
    source.getContext('2d')!.drawImage(building.source, 0, 0, building.source.width * scale, building.source.height * scaleY);
    // The 3x3 native foundation is 180x90. Its origin is 45px above the front corner.
    this.building = sprite(source, BUTCHERS_PROJECTION.frontCorner.x * scale, BUTCHERS_PROJECTION.frontCorner.y * scaleY - 45);

    const sheet = pixels(images.infantry), width = sheet.source.width, height = sheet.source.height;
    for (let row = 0; row < 4; row++) for (let column = 0; column < 8; column++) {
      // imagegen preserves the grid proportions; the PNG size need not be divisible by8.
      const { grid, crop } = georgeFrameRegion(width, height, row, column);
      const bounds = alphaBounds(sheet.data, width, height, crop, 128);
      // Native GI standing silhouettes are 26–31px high; this atlas is 28–29px.
      const frame = canvas(36, 36), factor = 34 / (grid.right - grid.left);
      frame.getContext('2d')!.drawImage(sheet.source, crop.left, crop.top, crop.right - crop.left, crop.bottom - crop.top,
        1 + (crop.left - grid.left) * factor, 1, (crop.right - crop.left) * factor, (crop.bottom - crop.top) * factor);
      // Anchor every pose at its actual boot line, including the taller firing silhouettes.
      this.infantry.push(sprite(frame, 18, (bounds.bottom - grid.top) * factor));
    }
    const cameo = (image: HTMLImageElement, label: "Butcher's" | 'George') => {
      const source = canvas(60, 48), context = source.getContext('2d')!;
      context.drawImage(image, 0, 0, 60, 48);
      drawCameoCaption(context, label);
      return sprite(source, 0, 0);
    };
    this.cameos = { butchers: cameo(images.buildingCameo, "Butcher's"), george: cameo(images.infantryCameo, 'George') };
  }

  getCameo(name: string): Sprite | null { return this.cameos[name as keyof typeof this.cameos] ?? null; }
  getSprite(name: string, frame = 0): Sprite | null { return name === 'butchers' ? this.building : name === 'george' ? this.getInfantryFrame(frame) : null; }
  getInfantryFrame(frame: number): Sprite | null { return Number.isInteger(frame) && frame >= 0 && frame < 32 ? this.infantry[frame] : null; }
  getInfantrySequence(action: string, facing: number, age: number): Sprite {
    const { column, row } = georgeAtlasFrame(action, facing, age); return this.infantry[row * 8 + column];
  }
}
