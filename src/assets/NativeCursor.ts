import { decodePalette, ShpFile } from './formats';

/** Frame ranges in original RA2 mouse.shp, confirmed against the extracted sheet. */
export const CURSOR_SEQUENCES = {
  default: [0, 1], select: [18, 13], move: [31, 10], 'move-blocked': [41, 1],
  attack: [58, 5], attackmove: [404, 9], 'attackmove-blocked': [384, 1], guard: [68, 5],
  // Retail game.exe cursor table entry 25 (file 0x3e2d50).
  enter: [89, 10],
  deploy: [110, 9], 'deploy-blocked': [119, 1], sell: [129, 10], 'sell-blocked': [149, 1],
  repair: [170, 20], 'repair-blocked': [190, 1], pan: [385, 1],
  'scroll-n': [2, 1], 'scroll-ne': [3, 1], 'scroll-e': [4, 1], 'scroll-se': [5, 1],
  'scroll-s': [6, 1], 'scroll-sw': [7, 1], 'scroll-w': [8, 1], 'scroll-nw': [9, 1],
  'scroll-n-blocked': [10, 1], 'scroll-ne-blocked': [11, 1], 'scroll-e-blocked': [12, 1], 'scroll-se-blocked': [13, 1],
  'scroll-s-blocked': [14, 1], 'scroll-sw-blocked': [15, 1], 'scroll-w-blocked': [16, 1], 'scroll-nw-blocked': [17, 1],
} as const;
export type NativeCursorName = keyof typeof CURSOR_SEQUENCES;

export class NativeCursors {
  private readonly shape: ShpFile;
  private readonly palette: Uint8Array;
  private readonly urls = new Map<number, string>();
  constructor(shape: Uint8Array, palette: Uint8Array) {
    this.shape = new ShpFile(shape); this.palette = decodePalette(palette);
    for (const [start, length] of Object.values(CURSOR_SEQUENCES)) for (let frame = start; frame < start + length; frame++) {
      if (frame >= this.shape.frameCount) throw new Error(`Missing original cursor frame ${frame}`);
      const image = this.shape.frame(frame);
      if (image.canvasWidth !== 55 || image.canvasHeight !== 43) throw new Error('Invalid original cursor canvas: expected 55×43');
    }
  }
  rasterize(frame: number) {
    const image = this.shape.frame(frame), width = image.canvasWidth, height = image.canvasHeight;
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      const index = image.pixels[y * image.width + x]; if (!index) continue;
      const target = ((y + image.y) * width + image.x + x) * 4, source = index * 3;
      pixels[target] = this.palette[source]; pixels[target + 1] = this.palette[source + 1]; pixels[target + 2] = this.palette[source + 2]; pixels[target + 3] = 255;
    }
    return { width, height, pixels };
  }
  frame(name: NativeCursorName, elapsed = 0) {
    const [start, length] = CURSOR_SEQUENCES[name];
    // The animation cadence is independent of simulation speed and pointer motion.
    return start + Math.floor(Math.max(0, elapsed) / 100) % length;
  }
  css(name: NativeCursorName, elapsed = 0) {
    const frame = this.frame(name, elapsed);
    let url = this.urls.get(frame);
    if (!url) {
      const raster = this.rasterize(frame), canvas = document.createElement('canvas');
      canvas.width = raster.width; canvas.height = raster.height;
      const context = canvas.getContext('2d')!, image = context.createImageData(raster.width, raster.height);
      image.data.set(raster.pixels); context.putImageData(image, 0, 0);
      url = canvas.toDataURL(); this.urls.set(frame, url);
    }
    // Default arrow occupies the upper-left of the canvas. Action and scrolling
    // artwork share the original centered 28,21 hotspot; preserve all SHP offsets.
    const hotspot = name === 'default' ? '0 0' : '28 21';
    return `url("${url}") ${hotspot}, none`;
  }
}
